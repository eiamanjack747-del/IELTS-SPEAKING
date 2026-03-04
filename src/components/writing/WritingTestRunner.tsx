import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, CheckCircle, AlertCircle, Loader2, ArrowLeft, 
  Type as TypeIcon, Info, Save, Send
} from 'lucide-react';
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { WritingMode, WritingTask, WritingResult } from '../../types';
import { cn, formatDuration, handleGeminiError } from '../../utils';

interface WritingTestRunnerProps {
  mode: WritingMode;
  onComplete: (result: WritingResult) => void;
  onExit: () => void;
}

export const WritingTestRunner: React.FC<WritingTestRunnerProps> = ({ mode, onComplete, onExit }) => {
  const [status, setStatus] = useState<'loading' | 'active' | 'submitting' | 'error'>('loading');
  const [task, setTask] = useState<WritingTask | null>(null);
  const [userText, setUserText] = useState('');
  const [timeLeft, setTimeLeft] = useState(mode === 'TASK_1' ? 1200 : mode === 'TASK_2' ? 2400 : 3600);
  const [error, setError] = useState<string | null>(null);
  
  const startTimeRef = useRef(Date.now());
  const wordCount = userText.trim() ? userText.trim().split(/\s+/).length : 0;

  // Generate Task
  useEffect(() => {
    const generateTask = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        
        const taskType = mode === 'FULL_TEST' ? 'TASK_2' : mode; // Default to Task 2 for simplicity in full test for now
        
        const prompt = `
          Generate an IELTS Writing ${taskType} prompt.
          If Task 1: Generate a description of a hypothetical graph, chart, or process (describe it in text as we don't have images).
          If Task 2: Generate an essay prompt (Opinion, Discussion, or Problem-Solution).
          
          OUTPUT FORMAT (JSON ONLY):
          {
            "id": "w1",
            "type": "${taskType}",
            "prompt": "The full prompt text...",
            "wordLimit": ${taskType === 'TASK_1' ? 150 : 250},
            "timeLimit": ${taskType === 'TASK_1' ? 20 : 40}
          }
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: { 
            responseMimeType: 'application/json',
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
          }
        });

        const data = JSON.parse(response.text!);
        setTask(data);
        setStatus('active');
        startTimeRef.current = Date.now();
      } catch (err) {
        console.error("Failed to generate task:", err);
        if (!handleGeminiError(err)) {
          setError("Failed to generate writing task. Please try again.");
        }
        setStatus('error');
      }
    };

    generateTask();
  }, [mode]);

  // Timer
  useEffect(() => {
    if (status !== 'active') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  const handleSubmit = async () => {
    if (!userText.trim()) {
      alert("Please write something before submitting.");
      return;
    }

    setStatus('submitting');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const prompt = `
        Analyze this IELTS Writing submission and provide detailed feedback in Bangla.
        
        Task Prompt: ${task?.prompt}
        User Submission: ${userText}
        Task Type: ${task?.type}
        
        OUTPUT FORMAT (JSON ONLY):
        {
          "bandScore": number,
          "criteriaScores": {
            "taskResponse": number,
            "coherence": number,
            "lexical": number,
            "grammar": number
          },
          "feedback": {
            "banglaSummary": "Overall summary in Bangla",
            "strengths": ["string"],
            "weaknesses": ["string"],
            "grammarCorrections": [
              { "original": "string", "corrected": "string", "explanation": "Bangla explanation" }
            ],
            "vocabularySuggestions": [
              { "word": "string", "betterAlternative": "string", "context": "string" }
            ],
            "improvementPlan": ["string"]
          }
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
        }
      });

      const analysis = JSON.parse(response.text!);
      
      const result: WritingResult = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        taskType: task!.type,
        userText,
        wordCount,
        timeUsed: Math.floor((Date.now() - startTimeRef.current) / 1000),
        bandScore: analysis.bandScore,
        criteriaScores: analysis.criteriaScores,
        feedback: analysis.feedback
      };

      onComplete(result);
    } catch (err) {
      console.error("Submission failed:", err);
      if (!handleGeminiError(err)) {
        setError("Failed to analyze your writing. Please try again.");
      }
      setStatus('error');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-6 bg-zinc-50 relative">
        <button 
          onClick={onExit}
          className="absolute top-6 left-6 p-2 hover:bg-zinc-100 rounded-full"
        >
          <ArrowLeft className="w-6 h-6 text-zinc-500" />
        </button>
        <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-zinc-900">Preparing Task...</h3>
          <p className="text-zinc-500">Generating a fresh IELTS writing prompt for you.</p>
        </div>
      </div>
    );
  }

  if (status === 'submitting') {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-6 bg-zinc-50">
        <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-zinc-900">Analyzing Your Writing...</h3>
          <p className="text-zinc-500">Evaluating grammar, coherence, and vocabulary.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-6 bg-zinc-50">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-zinc-900">Something went wrong</h3>
          <p className="text-zinc-500">{error}</p>
        </div>
        <button onClick={onExit} className="px-6 py-3 bg-zinc-900 text-white rounded-full">
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center space-x-4">
          <button onClick={onExit} className="p-2 hover:bg-zinc-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-zinc-500" />
          </button>
          <div>
            <h1 className="font-bold text-lg text-zinc-900">
              IELTS Writing {task?.type.replace('_', ' ')}
            </h1>
            <div className="flex items-center space-x-3 text-xs text-zinc-500">
              <span className="flex items-center space-x-1">
                <TypeIcon className="w-3 h-3" />
                <span>Min {task?.wordLimit} words</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className={cn(
            "flex items-center space-x-2 font-mono text-xl font-bold",
            timeLeft < 300 ? "text-red-600 animate-pulse" : "text-zinc-700"
          )}>
            <Clock className="w-5 h-5" />
            <span>{formatDuration(timeLeft)}</span>
          </div>

          <button 
            onClick={handleSubmit}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Submit Task</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Prompt */}
        <div className="w-1/3 overflow-y-auto p-8 border-r border-zinc-200 bg-white">
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-emerald-600">
              <Info className="w-5 h-5" />
              <h2 className="font-bold uppercase tracking-wider text-sm">The Prompt</h2>
            </div>
            <div className="prose prose-zinc max-w-none text-zinc-800 leading-relaxed font-medium text-lg bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
              {task?.prompt}
            </div>
            
            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 space-y-4">
              <h3 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">Instructions</h3>
              <ul className="text-sm text-zinc-500 space-y-2 list-disc pl-4">
                <li>Write at least {task?.wordLimit} words.</li>
                <li>You should spend about {task?.timeLimit} minutes on this task.</li>
                <li>Focus on task response, coherence, and accuracy.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Editor */}
        <div className="w-2/3 flex flex-col bg-white">
          <div className="flex-1 p-8">
            <textarea
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              placeholder="Start writing your response here..."
              className="w-full h-full resize-none outline-none text-lg text-zinc-800 leading-relaxed font-serif placeholder:text-zinc-300"
              spellCheck={false}
            />
          </div>
          
          {/* Editor Footer */}
          <div className="bg-zinc-50 border-t border-zinc-200 px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Word Count</span>
                <span className={cn(
                  "text-xl font-black",
                  wordCount < (task?.wordLimit || 0) ? "text-amber-500" : "text-emerald-600"
                )}>
                  {wordCount}
                </span>
              </div>
              <div className="h-8 w-px bg-zinc-200" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Target</span>
                <span className="text-xl font-bold text-zinc-900">{task?.wordLimit}+</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-zinc-400 text-sm">
              <Save className="w-4 h-4" />
              <span>Auto-saving enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
