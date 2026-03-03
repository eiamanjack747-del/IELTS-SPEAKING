import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, MicOff, Play, Square, Timer, User, 
  MessageSquare, History, Award, AlertCircle,
  ChevronRight, ArrowLeft, Loader2, Volume2, VolumeX,
  CheckCircle2, XCircle, RefreshCw
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiLiveService } from '../services/geminiLive';
import { AudioVisualizer } from './AudioVisualizer';
import { cn, formatDuration } from '../utils';
import { TestMode, TestSession, FeedbackData } from '../types';
import Markdown from 'react-markdown';

interface IELTSExaminerProps {
  mode: TestMode;
  userName?: string;
  mediaStream: MediaStream | null;
  onComplete: (data: FeedbackData) => void;
  onCancel: () => void;
}

export const IELTSExaminer: React.FC<IELTSExaminerProps> = ({ mode, userName, mediaStream, onComplete, onCancel }) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'feedback' | 'loading_feedback' | 'feedback_error'>('idle');
  const [candidateName, setCandidateName] = useState<string>(userName || '');
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [timer, setTimer] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<{ text: string; isUser: boolean }[]>([]);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(3.0);
  const [voiceName, setVoiceName] = useState<string>('Charon');
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  
  const liveServiceRef = useRef<GeminiLiveService | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  // mediaStreamRef is now derived from props, but we keep a ref for internal access if needed
  // or just use the prop directly. Let's use the prop directly in startAudioCapture.
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(0);

  // System Instruction based on requirements
  const systemInstruction = `
    You are Md Eiaman, a professional IELTS Speaking Examiner and Advanced Speaking Coach for the app "Express Yourself".
    
    CANDIDATE NAME: ${userName || 'Candidate'}
    
    CORE ROLE:
    - Strictly follow official IELTS Speaking format in IELTS modes.
    - Use real IELTS-style tone (serious, professional, but encouraging).
    - Address the candidate by name ("${userName || 'Candidate'}") naturally during the session.
    - Wait for user responses before continuing.
    - Use the candidate's name throughout the test once you know it.
    - Provide speaking interaction ONLY in English during the test.
    - Provide feedback in Bangla (Bengali) ONLY after the test is finished.
    
    TEST MODE: ${mode}
    
    ${mode === 'DAILY_CONVO' ? `
    DAILY CONVERSATION MODE:
    - Switch personality to a natural, friendly tone.
    - Scenarios: Airport, Hotel Check-in, Doctor, Bank, University.
    - Randomly pick one scenario and start the conversation.
    - After conversation ends, provide Bangla correction and feedback.
    ` : mode === 'VISA_INTERVIEW' ? `
    VISA INTERVIEW MODE:
    - Professional embassy simulation.
    - Types: Student Visa, Work Visa, Tourist Visa.
    - Randomly pick one type and start the interview.
    - Features: Formal tone, unexpected follow-ups, pressure simulation.
    - After interview, provide Confidence Score, Clarity Score, Risk Level, Embassy Impression, and Bangla Feedback.
    ` : `
    IELTS MODES (FULL_MOCK, PART_1, PART_2, PART_3):
    - MANDATORY OPENING SCRIPT:
      1. Say: "Good morning/afternoon. My name is Md Eiaman. This test is being recorded. Can you tell me your full name, please?"
      2. WAIT for response.
      3. Ask: "What can I call you?"
      4. WAIT for response.
      5. Ask: "Can I see your identification, please? Thank you."
      6. Store the name and use it.
    
    - QUESTION SOURCE:
      - Use authentic topics from IELTS Mentor, IELTS Advantage, or IELTS Material.
      - No invented topics. No repeats.
    
    - PART 1 (4-5 mins):
      - Transition: "Now, in this first part, I'd like to ask you some questions about yourself and some familiar topics."
      - Ask 3-4 questions on 2-3 topics.
    
    - PART 2 (Cue Card):
      - Instruction: "Now I'm going to give you a topic and I'd like you to talk about it for one to two minutes. Before you talk, you'll have one minute to think about what you are going to say. You can make some notes if you wish. Do you understand?"
      - WAIT for "Yes".
      - Give the topic. Say: "You have one minute to prepare."
      - WAIT 1 minute (silence).
      - Say: "Alright. You can start speaking now."
      - WAIT for user to speak (up to 2 mins).
      - Say: "Thank you. I'll stop you there."
    
    - PART 3 (4-5 mins):
      - Transition: "Now let's discuss some more general questions related to this topic."
      - Ask analytical, opinion-based questions.
    `}
    
    CLOSING:
    - Say: "That is the end of the session. Thank you very much."
    
    FEEDBACK (After session ends):
    - Provide a detailed evaluation in JSON format using the 'submitFeedback' tool.
    - For VISA_INTERVIEW, include the 'visaInterview' object in the feedback.
    - For DAILY_CONVO, focus on natural corrections in the 'banglaFeedback'.
  `;

  const startTest = async () => {
    setStatus('connecting');
    try {
      // Resume AudioContext if suspended
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      if (!mediaStream) {
        throw new Error("No microphone access");
      }
      
      const apiKey = process.env.GEMINI_API_KEY!;
      liveServiceRef.current = new GeminiLiveService(apiKey);
      
      await liveServiceRef.current.connect(systemInstruction, {
        onOpen: () => {
          setStatus('active');
          setIsRecording(true);
          startAudioCapture();
        },
        onAudioData: (base64) => {
          playAudioChunk(base64);
        },
        onInterrupted: () => {
          stopPlayback();
        },
        onTranscription: (text, isUser) => {
          setTranscript(prev => [...prev, { text, isUser }]);
          if (!isUser) {
            // Detect questions to display in the pinned box
            if (text.includes('?') || text.length < 100) {
              setCurrentQuestion(text);
            }
          }
        },
        onToolCall: (call) => {
          if (call.functionCalls) {
            for (const fc of call.functionCalls) {
              if (fc.name === 'submitFeedback') {
                onComplete(fc.args as FeedbackData);
                endTest();
              }
            }
          }
        },
        onClose: () => {
          setStatus('idle');
          setIsRecording(false);
        }
      }, voiceName);
    } catch (err) {
      console.error("Failed to start test:", err);
      setStatus('idle');
    }
  };

  const startAudioCapture = async () => {
    if (!mediaStream) return;
    
    // Use default sample rate (usually 44.1k or 48k) for better compatibility
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;
    
    const source = audioContext.createMediaStreamSource(mediaStream);
    
    // Create a gain node with 0 gain to prevent feedback (hearing yourself)
    const muteNode = audioContext.createGain();
    muteNode.gain.value = 0;
    
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const inputSampleRate = audioContext.sampleRate;
      const targetSampleRate = 16000;
      
      // Downsample to 16kHz
      const ratio = inputSampleRate / targetSampleRate;
      const newLength = Math.floor(inputData.length / ratio);
      const pcmData = new Int16Array(newLength);
      
      for (let i = 0; i < newLength; i++) {
        const offset = Math.floor(i * ratio);
        // Simple downsampling - for production, use a better filter
        const sample = inputData[offset];
        pcmData[i] = Math.max(-1, Math.min(1, sample)) * 0x7FFF;
      }
      
      // Convert to Base64
      const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
      liveServiceRef.current?.sendAudio(base64);
    };

    // Connect source -> processor -> muteNode -> destination
    // This keeps the processor running but silences the output
    source.connect(processor);
    processor.connect(muteNode);
    muteNode.connect(audioContext.destination);
  };

  const playAudioChunk = async (base64: string) => {
    // Ensure AudioContext exists (it should from startAudioCapture)
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    if (!gainNodeRef.current && audioContextRef.current) {
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = volume;
      gainNode.connect(audioContextRef.current.destination);
      gainNodeRef.current = gainNode;
    }
    
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    
    const pcmData = new Int16Array(bytes.buffer);
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) floatData[i] = pcmData[i] / 0x7FFF;

    // Create buffer at 24kHz (Gemini's output rate)
    // The AudioContext (running at 44.1/48k) will handle resampling automatically
    const buffer = audioContextRef.current.createBuffer(1, floatData.length, 24000);
    buffer.getChannelData(0).set(floatData);
    
    audioQueueRef.current.push(buffer);
    if (!isPlayingRef.current) {
      playNextInQueue();
    }
  };

  const playNextInQueue = () => {
    if (audioQueueRef.current.length === 0 || !audioContextRef.current) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const buffer = audioQueueRef.current.shift()!;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    
    if (gainNodeRef.current) {
      source.connect(gainNodeRef.current);
    } else {
      source.connect(audioContextRef.current.destination);
    }
    
    const now = audioContextRef.current.currentTime;
    const startTime = Math.max(now, startTimeRef.current);
    
    source.start(startTime);
    startTimeRef.current = startTime + buffer.duration;
    
    source.onended = () => {
      playNextInQueue();
    };
  };

  const stopPlayback = () => {
    audioQueueRef.current = [];
    startTimeRef.current = 0;
    // In a real app, we'd want to stop the current source node too
  };

  const toggleMic = () => {
    const newMutedState = !isMicMuted;
    setIsMicMuted(newMutedState);
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach(track => {
        track.enabled = !newMutedState; // If muted, enabled should be false.
      });
    }
  };

  const toggleSpeaker = () => {
    const newMutedState = !isSpeakerMuted;
    setIsSpeakerMuted(newMutedState);
    if (audioContextRef.current) {
      if (newMutedState) {
        audioContextRef.current.suspend();
      } else {
        audioContextRef.current.resume();
      }
    }
  };

  const endTest = async () => {
    setIsRecording(false);
    processorRef.current?.disconnect();
    // Do NOT stop mediaStream tracks here to allow reuse without re-permission
    await liveServiceRef.current?.disconnect();
    
    generateFeedback();
  };

  const generateFeedback = async () => {
    setStatus('loading_feedback');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const transcriptText = transcript.map(t => `${t.isUser ? 'Candidate' : 'Examiner'}: ${t.text}`).join('\n');
      
      const prompt = `
        Analyze the following IELTS speaking transcript and provide detailed feedback in Bangla (Bengali).
        
        Transcript:
        ${transcriptText}
        
        Provide the output in JSON format matching this schema:
        {
          "bandScore": number,
          "criteria": {
            "fluency": number,
            "lexical": number,
            "grammar": number,
            "pronunciation": number
          },
          "banglaFeedback": {
            "strengths": ["string"],
            "mistakes": [{"wrong": "string", "correct": "string", "explanation": "string"}],
            "vocabulary": ["string"],
            "weakAreas": ["string"],
            "improvementPlan": ["string"]
          },
          "stressAnalysis": {
            "level": "Low" | "Moderate" | "High",
            "advice": "string",
            "metrics": {
              "fillers": number,
              "pauses": number,
              "speed": number
            }
          },
          "visaInterview": { // Optional, only if mode is VISA_INTERVIEW
             "confidenceScore": number,
             "clarityScore": number,
             "riskLevel": "Low" | "Moderate" | "High",
             "embassyImpression": "string"
          }
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              bandScore: { type: Type.NUMBER },
              criteria: {
                type: Type.OBJECT,
                properties: {
                  fluency: { type: Type.NUMBER },
                  lexical: { type: Type.NUMBER },
                  grammar: { type: Type.NUMBER },
                  pronunciation: { type: Type.NUMBER },
                },
                required: ["fluency", "lexical", "grammar", "pronunciation"],
              },
              banglaFeedback: {
                type: Type.OBJECT,
                properties: {
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  mistakes: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        wrong: { type: Type.STRING },
                        correct: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                      },
                      required: ["wrong", "correct", "explanation"],
                    },
                  },
                  vocabulary: { type: Type.ARRAY, items: { type: Type.STRING } },
                  weakAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
                  improvementPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["strengths", "mistakes", "vocabulary", "weakAreas", "improvementPlan"],
              },
              stressAnalysis: {
                type: Type.OBJECT,
                properties: {
                  level: { type: Type.STRING, enum: ["Low", "Moderate", "High"] },
                  advice: { type: Type.STRING },
                  metrics: {
                    type: Type.OBJECT,
                    properties: {
                      fillers: { type: Type.NUMBER },
                      pauses: { type: Type.NUMBER },
                      speed: { type: Type.NUMBER },
                    },
                    required: ["fillers", "pauses", "speed"],
                  },
                },
                required: ["level", "advice", "metrics"],
              },
              visaInterview: {
                type: Type.OBJECT,
                properties: {
                  confidenceScore: { type: Type.NUMBER },
                  clarityScore: { type: Type.NUMBER },
                  riskLevel: { type: Type.STRING, enum: ["Low", "Moderate", "High"] },
                  embassyImpression: { type: Type.STRING },
                },
              },
            },
            required: ["bandScore", "criteria", "banglaFeedback", "stressAnalysis"],
          },
        },
      });

      const data = JSON.parse(response.text!);
      onComplete(data);
    } catch (error) {
      console.error("Feedback generation failed:", error);
      setStatus('feedback_error');
    }
  };

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(volume, audioContextRef.current?.currentTime || 0, 0.1);
    }
  }, [volume]);

  useEffect(() => {
    let interval: any;
    if (status === 'active') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  if (status === 'loading_feedback') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-zinc-900">Generating Feedback...</h3>
          <p className="text-zinc-500">Analyzing your performance in Bangla...</p>
        </div>
      </div>
    );
  }

  if (status === 'feedback_error') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-zinc-900">Network Error</h3>
          <p className="text-zinc-500">Failed to generate feedback. Please check your connection.</p>
        </div>
        <button
          onClick={generateFeedback}
          className="flex items-center space-x-2 bg-zinc-900 text-white px-6 py-3 rounded-full hover:bg-zinc-800 transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }



  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-black/5 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-2">
          <div className={cn(
            "w-3 h-3 rounded-full animate-pulse",
            status === 'active' ? "bg-emerald-500" : "bg-zinc-300"
          )} />
          <span className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
            {status === 'active' ? 'Live Session' : 'Ready'}
          </span>
        </div>
        <div className="flex items-center space-x-2 font-mono text-lg">
          <Timer className="w-5 h-5 text-zinc-400" />
          <span>{formatDuration(timer)}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
        {/* Pinned Question Box */}
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
                Current Question
              </div>
              <h2 className="text-xl font-medium text-zinc-900 leading-relaxed">
                {currentQuestion}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Visualizer & Controls */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          <div className="relative">
            <div className={cn(
              "w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500",
              status === 'active' ? "bg-emerald-50 border-4 border-emerald-100" : "bg-zinc-50 border-4 border-zinc-100"
            )}>
              {status === 'connecting' ? (
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
              ) : status === 'active' ? (
                <Mic className="w-16 h-16 text-emerald-500" />
              ) : (
                <User className="w-16 h-16 text-zinc-300" />
              )}
            </div>
            {status === 'active' && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-64">
                <AudioVisualizer stream={mediaStream} isActive={isRecording} />
              </div>
            )}
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-2xl font-semibold text-zinc-900">
              {status === 'idle' ? 'Start Your Session' : 
               status === 'connecting' ? 'Connecting to Examiner...' :
               <div className="flex flex-col items-center sm:flex-row sm:justify-center sm:items-baseline sm:space-x-3">
                 <span>Examiner is Listening</span>
                 <span className="text-sm font-normal text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full animate-pulse">
                   voice mode active করতে "Hi" বলুন
                 </span>
               </div>}
            </h3>
            <p className="text-zinc-500 max-w-xs mx-auto">
              {status === 'idle' ? 'Click the button below to begin your IELTS Speaking simulation.' :
               status === 'active' ? 'Speak naturally. The examiner will guide you through the test.' :
               'Please wait while we establish a secure connection.'}
            </p>
          </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-6 bg-zinc-100 p-2 rounded-2xl">
                <div className="flex items-center space-x-2">
                  {[
                    { name: 'Male', id: 'Charon' },
                    { name: 'Female', id: 'Zephyr' }
                  ].map((v) => (
                    <button
                      key={v.id}
                      disabled={status !== 'idle'}
                      onClick={() => setVoiceName(v.id)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        voiceName === v.id 
                          ? "bg-white text-zinc-900 shadow-sm" 
                          : "text-zinc-500 hover:text-zinc-700"
                      )}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
                
                <div className="h-6 w-px bg-zinc-200 hidden sm:block" />
                
                <div className="flex items-center space-x-3 px-2">
                  <Volume2 className="w-4 h-4 text-zinc-400" />
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="0.5"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-24 h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className="text-xs font-mono text-zinc-500 w-8">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>

            <div className="flex items-center space-x-4">
              {status === 'active' && (
                <>
                  <button
                    onClick={toggleMic}
                    className={cn(
                      "p-4 rounded-full transition-all",
                      isMicMuted ? "bg-red-100 text-red-600" : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                    )}
                    title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
                  >
                    {isMicMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={toggleSpeaker}
                    className={cn(
                      "p-4 rounded-full transition-all",
                      isSpeakerMuted ? "bg-red-100 text-red-600" : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                    )}
                    title={isSpeakerMuted ? "Unmute Speaker" : "Mute Speaker"}
                  >
                    {isSpeakerMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />} 
                  </button>
                </>
              )}
              
              {status === 'idle' ? (
                <button
                  onClick={startTest}
                  className="bg-zinc-900 text-white px-8 py-4 rounded-full font-medium flex items-center space-x-3 hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Speaking</span>
                </button>
              ) : (
                <button
                  onClick={endTest}
                  className="bg-red-50 text-red-600 border border-red-100 px-8 py-4 rounded-full font-medium flex items-center space-x-3 hover:bg-red-100 transition-all active:scale-95"
                >
                  <Square className="w-5 h-5 fill-current" />
                  <span>End Session</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Transcript Preview */}
        <div className="h-48 overflow-y-auto border-t border-zinc-100 pt-4 px-2">
          <div className="space-y-3">
            {transcript.map((m, i) => (
              <div key={i} className={cn(
                "flex items-start space-x-3 text-sm",
                m.isUser ? "justify-end" : "justify-start"
              )}>
                <div className={cn(
                  "px-3 py-2 rounded-2xl max-w-[80%]",
                  m.isUser ? "bg-emerald-50 text-emerald-900" : "bg-zinc-100 text-zinc-900"
                )}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
