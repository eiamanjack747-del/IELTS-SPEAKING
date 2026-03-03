import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, FileText, HelpCircle } from 'lucide-react';
import { ReadingTest, ReadingQuestion } from '../../types';
import { cn } from '../../utils';

interface ReadingTestRunnerProps {
  test: ReadingTest;
  onComplete: (score: number, total: number) => void;
  onExit: () => void;
}

export const ReadingTestRunner: React.FC<ReadingTestRunnerProps> = ({ test, onComplete, onExit }) => {
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const currentPassage = test.passages[currentPassageIndex];

  useEffect(() => {
    if (isSubmitted) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    let totalQuestions = 0;

    test.passages.forEach(passage => {
      passage.questions.forEach(q => {
        totalQuestions++;
        const userAnswer = answers[q.id]?.trim().toLowerCase() || '';
        const correctAnswer = q.correctAnswer.trim().toLowerCase();
        if (userAnswer === correctAnswer) {
          correctCount++;
        }
      });
    });

    setScore(correctCount);
    setIsSubmitted(true);
    // onComplete(correctCount, totalQuestions); // Optional: call parent callback
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <header className="bg-zinc-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-4">
          <button onClick={onExit} className="text-zinc-400 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">{test.title}</h1>
            <div className="text-xs text-zinc-400">Reading Module</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className={cn(
            "flex items-center space-x-2 font-mono text-xl font-bold px-4 py-2 rounded-lg",
            timeLeft < 300 ? "bg-red-500/20 text-red-400" : "bg-zinc-800 text-emerald-400"
          )}>
            <Clock className="w-5 h-5" />
            <span>{formatTime(timeLeft)}</span>
          </div>
          {!isSubmitted && (
            <button 
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold transition-colors"
            >
              Submit Test
            </button>
          )}
        </div>
      </header>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Passage Text */}
        <div className="w-1/2 border-r border-zinc-200 bg-zinc-50 flex flex-col">
          <div className="p-4 border-b border-zinc-200 bg-white flex items-center justify-between">
            <h2 className="font-bold text-lg text-zinc-800 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-emerald-600" />
              Passage {currentPassageIndex + 1}
            </h2>
            <div className="flex space-x-1">
              {test.passages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPassageIndex(idx)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                    currentPassageIndex === idx 
                      ? "bg-emerald-600 text-white" 
                      : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300"
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-8 prose max-w-none">
            <h1 className="text-2xl font-bold mb-6">{currentPassage?.title || "Untitled Passage"}</h1>
            <div className="whitespace-pre-wrap text-lg leading-relaxed text-zinc-700 font-serif">
              {currentPassage?.content || "No content available."}
            </div>
          </div>
        </div>

        {/* Right: Questions */}
        <div className="w-1/2 bg-white flex flex-col">
          <div className="p-4 border-b border-zinc-200 bg-zinc-50">
            <h2 className="font-bold text-lg text-zinc-800 flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-blue-600" />
              Questions
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {currentPassage?.questions.length > 0 ? (
              currentPassage.questions.map((q, idx) => (
                <div key={q.id} className="space-y-3 p-4 rounded-xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-200">
                  <div className="flex items-start space-x-3">
                    <span className="font-bold text-zinc-400 min-w-[24px]">{idx + 1}.</span>
                    <div className="flex-1">
                      <p className="font-medium text-zinc-800 mb-2">{q.text}</p>
                      
                      {/* Answer Input based on type */}
                      {q.type === 'mcq' && q.options ? (
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => (
                            <label key={optIdx} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-zinc-100">
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                value={opt}
                                checked={answers[q.id] === opt}
                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                disabled={isSubmitted}
                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                              />
                              <span className="text-zinc-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={answers[q.id] || ''}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          disabled={isSubmitted}
                          placeholder="Type your answer here..."
                          className={cn(
                            "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all",
                            isSubmitted 
                              ? (answers[q.id]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() 
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                                : "border-red-500 bg-red-50 text-red-700")
                              : "border-zinc-300"
                          )}
                        />
                      )}

                      {/* Feedback after submission */}
                      {isSubmitted && (
                        <div className="mt-2 flex items-center space-x-2 text-sm">
                          {answers[q.id]?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() ? (
                            <span className="text-emerald-600 flex items-center font-bold">
                              <CheckCircle className="w-4 h-4 mr-1" /> Correct
                            </span>
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-red-600 flex items-center font-bold">
                                <XCircle className="w-4 h-4 mr-1" /> Incorrect
                              </span>
                              <span className="text-zinc-500">Correct answer: <span className="font-bold text-zinc-800">{q.correctAnswer}</span></span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-zinc-400">
                No questions available for this passage.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Results Overlay */}
      {isSubmitted && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-zinc-900 text-white p-6 flex items-center justify-between shadow-2xl z-50"
        >
          <div>
            <h3 className="text-2xl font-bold">Test Completed</h3>
            <p className="text-zinc-400">You scored <span className="text-emerald-400 font-bold text-xl">{score}</span> out of {test.passages.reduce((acc, p) => acc + p.questions.length, 0)}</p>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={onExit}
              className="px-6 py-3 bg-white text-zinc-900 rounded-xl font-bold hover:bg-zinc-100 transition-colors"
            >
              Return to Library
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
