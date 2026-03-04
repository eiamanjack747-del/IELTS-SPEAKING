import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, 
  Save, BookOpen, Loader2, ArrowLeft 
} from 'lucide-react';
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { ReadingMode, ReadingPassage, ReadingQuestion, ReadingTestResult } from '../../types';
import { cn, formatDuration, handleGeminiError } from '../../utils';
import Markdown from 'react-markdown';

interface ReadingTestRunnerProps {
  mode: ReadingMode;
  onComplete: (result: ReadingTestResult) => void;
  onExit: () => void;
}

export const ReadingTestRunner: React.FC<ReadingTestRunnerProps> = ({ mode, onComplete, onExit }) => {
  const [status, setStatus] = useState<'loading' | 'active' | 'submitting' | 'error'>('loading');
  const [passages, setPassages] = useState<ReadingPassage[]>([]);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(mode === 'FULL_TEST' ? 3600 : 1200); // 60 mins or 20 mins
  const [error, setError] = useState<string | null>(null);

  const startTimeRef = useRef(Date.now());

  // Generate Test Content
  useEffect(() => {
    const generateTest = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
        
        // Adjust prompt based on mode
        const numPassages = mode === 'FULL_TEST' ? 3 : 1;
        const difficulty = mode === 'FULL_TEST' ? 'varied' : 'moderate';
        
        const prompt = `
          Generate an IELTS Academic Reading Test with ${numPassages} passage(s).
          
          STRICT RULES:
          1. Passage length: 700-900 words.
          2. Topic: Academic (e.g., Science, History, Sociology). NO REPEATS.
          3. Difficulty: ${difficulty} (If 3 passages: Easy -> Moderate -> Hard).
          4. Questions: 13-14 questions per passage.
          5. Question Types: Mix of MCQ, True/False/Not Given, Matching Headings, Sentence Completion.
          
          OUTPUT FORMAT (JSON ONLY):
          {
            "passages": [
              {
                "id": "p1",
                "title": "Title",
                "content": "Full passage text...",
                "difficulty": "moderate",
                "topic": "Topic Name",
                "questions": [
                  {
                    "id": "q1",
                    "text": "Question text...",
                    "type": "multiple_choice", // or "true_false_not_given", "sentence_completion", "matching_headings"
                    "options": ["A", "B", "C", "D"], // Only for MCQ
                    "correctAnswer": "Correct Answer"
                  }
                ]
              }
            ]
          }
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                passages: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      content: { type: Type.STRING },
                      difficulty: { type: Type.STRING },
                      topic: { type: Type.STRING },
                      questions: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            text: { type: Type.STRING },
                            type: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswer: { type: Type.STRING }
                          },
                          required: ["id", "text", "type", "correctAnswer"]
                        }
                      }
                    },
                    required: ["id", "title", "content", "questions"]
                  }
                }
              }
            }
          }
        });

        const data = JSON.parse(response.text!);
        setPassages(data.passages);
        setStatus('active');
        startTimeRef.current = Date.now();
      } catch (err) {
        console.error("Failed to generate test:", err);
        if (!handleGeminiError(err)) {
          setError("Failed to generate test. Please try again.");
        }
        setStatus('error');
      }
    };

    generateTest();
  }, [mode]);

  // Timer
  useEffect(() => {
    if (status !== 'active' || mode === 'UNTIMED') return;

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
  }, [status, mode]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setStatus('submitting');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      // Prepare data for analysis
      const submissionData = {
        passages: passages.map(p => ({
          id: p.id,
          questions: p.questions.map(q => ({
            id: q.id,
            text: q.text,
            correctAnswer: q.correctAnswer,
            userAnswer: answers[q.id] || ""
          }))
        }))
      };

      const prompt = `
        Analyze this IELTS Reading Test submission and provide detailed feedback in Bangla.
        
        Data: ${JSON.stringify(submissionData)}
        
        OUTPUT FORMAT (JSON ONLY):
        {
          "rawScore": number, // Total correct answers
          "bandScore": number, // Calculate based on IELTS Academic Reading scale (e.g. 30/40 = 7.0)
          "feedback": {
            "strengths": ["string"],
            "weaknesses": ["string"],
            "detailedAnalysis": [
              {
                "questionId": "string",
                "isCorrect": boolean,
                "userAnswer": "string",
                "correctAnswer": "string",
                "explanation": "Detailed explanation in Bangla why the answer is correct/incorrect, citing the passage logic.",
                "mistakeType": "string" // e.g., "Vocabulary", "Inference", "Grammar"
              }
            ],
            "timeManagementAdvice": "string",
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
      
      const result: ReadingTestResult = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        mode,
        rawScore: analysis.rawScore,
        bandScore: analysis.bandScore,
        timeUsed: Math.floor((Date.now() - startTimeRef.current) / 1000),
        answers,
        feedback: analysis.feedback
      };

      onComplete(result);
    } catch (err) {
      console.error("Submission failed:", err);
      if (!handleGeminiError(err)) {
        setError("Failed to submit test. Please try again.");
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
          <h3 className="text-2xl font-semibold text-zinc-900">Generating Test...</h3>
          <p className="text-zinc-500">Creating unique academic passages for you.</p>
        </div>
      </div>
    );
  }

  if (status === 'submitting') {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-6 bg-zinc-50">
        <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-zinc-900">Analyzing Results...</h3>
          <p className="text-zinc-500">Calculating your band score and generating feedback.</p>
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

  const currentPassage = passages[currentPassageIndex];

  return (
    <div className="flex flex-col h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center space-x-4">
          <button onClick={onExit} className="p-2 hover:bg-zinc-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-zinc-500" />
          </button>
          <h1 className="font-bold text-lg text-zinc-900">
            {mode === 'FULL_TEST' ? `Passage ${currentPassageIndex + 1} of ${passages.length}` : 'Reading Practice'}
          </h1>
        </div>
        
        {mode !== 'UNTIMED' && (
          <div className={cn(
            "flex items-center space-x-2 font-mono text-xl font-bold",
            timeLeft < 300 ? "text-red-600 animate-pulse" : "text-zinc-700"
          )}>
            <Clock className="w-5 h-5" />
            <span>{formatDuration(timeLeft)}</span>
          </div>
        )}

        <button 
          onClick={() => handleSubmit()}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center space-x-2"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Submit Test</span>
        </button>
      </header>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Passage */}
        <div className="w-1/2 overflow-y-auto p-8 border-r border-zinc-200 bg-white">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900">{currentPassage.title}</h2>
            <div className="prose prose-zinc max-w-none text-zinc-800 leading-relaxed font-serif text-lg">
              <Markdown>{currentPassage.content}</Markdown>
            </div>
          </div>
        </div>

        {/* Right: Questions */}
        <div className="w-1/2 overflow-y-auto p-8 bg-zinc-50">
          <div className="max-w-2xl mx-auto space-y-8">
            {currentPassage.questions.map((q, idx) => (
              <div key={q.id} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="bg-zinc-100 text-zinc-600 font-bold px-2 py-1 rounded text-sm min-w-[2rem] text-center">
                    {idx + 1}
                  </span>
                  <p className="text-zinc-900 font-medium">{q.text}</p>
                </div>

                {/* Question Input Types */}
                <div className="pl-11">
                  {q.type === 'multiple_choice' && q.options ? (
                    <div className="space-y-2">
                      {q.options.map((opt, i) => (
                        <label key={i} className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-zinc-50">
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-zinc-300"
                          />
                          <span className="text-zinc-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : q.type === 'true_false_not_given' || q.type === 'yes_no_not_given' ? (
                    <div className="flex space-x-4">
                      {['TRUE', 'FALSE', 'NOT GIVEN'].map((opt) => (
                        <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-zinc-300"
                          />
                          <span className="text-sm font-medium text-zinc-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      {passages.length > 1 && (
        <footer className="bg-white border-t border-zinc-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentPassageIndex(prev => Math.max(0, prev - 1))}
            disabled={currentPassageIndex === 0}
            className="flex items-center space-x-2 text-zinc-600 disabled:opacity-50 hover:text-zinc-900"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous Passage</span>
          </button>
          
          <div className="flex space-x-2">
            {passages.map((_, idx) => (
              <div 
                key={idx}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all",
                  idx === currentPassageIndex ? "bg-emerald-600 scale-125" : "bg-zinc-300"
                )}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentPassageIndex(prev => Math.min(passages.length - 1, prev + 1))}
            disabled={currentPassageIndex === passages.length - 1}
            className="flex items-center space-x-2 text-zinc-600 disabled:opacity-50 hover:text-zinc-900"
          >
            <span>Next Passage</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </footer>
      )}
    </div>
  );
};
