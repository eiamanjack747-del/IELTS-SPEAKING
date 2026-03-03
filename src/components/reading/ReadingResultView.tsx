import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle, XCircle, Clock, Award, ArrowLeft, 
  BarChart2, BookOpen, AlertTriangle, Lightbulb 
} from 'lucide-react';
import { ReadingTestResult } from '../../types';
import { cn, formatDuration } from '../../utils';

interface ReadingResultViewProps {
  result: ReadingTestResult;
  onBack: () => void;
}

export const ReadingResultView: React.FC<ReadingResultViewProps> = ({ result, onBack }) => {
  const { rawScore, bandScore, timeUsed, feedback } = result;
  const accuracy = Math.round((rawScore / 40) * 100);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
        <h1 className="text-2xl font-bold text-zinc-900">Test Results</h1>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center space-y-2">
          <span className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Band Score</span>
          <span className="text-5xl font-black text-emerald-600">{bandScore}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center space-y-2">
          <span className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Raw Score</span>
          <span className="text-4xl font-bold text-zinc-900">{rawScore}/40</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center space-y-2">
          <span className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Accuracy</span>
          <span className="text-4xl font-bold text-blue-600">{accuracy}%</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center space-y-2">
          <span className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Time Used</span>
          <span className="text-3xl font-mono font-bold text-zinc-900">{formatDuration(timeUsed)}</span>
        </div>
      </div>

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Strengths */}
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 space-y-4">
          <div className="flex items-center space-x-3 text-emerald-800">
            <CheckCircle className="w-6 h-6" />
            <h3 className="font-bold text-lg">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="flex items-start space-x-2 text-emerald-700">
                <span className="mt-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 space-y-4">
          <div className="flex items-center space-x-3 text-red-800">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="font-bold text-lg">Areas for Improvement</h3>
          </div>
          <ul className="space-y-2">
            {feedback.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start space-x-2 text-red-700">
                <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed Question Analysis */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-zinc-900">Detailed Analysis</h2>
        <div className="space-y-4">
          {feedback.detailedAnalysis.map((item, i) => (
            <div 
              key={i} 
              className={cn(
                "bg-white border rounded-xl p-6 transition-all",
                item.isCorrect ? "border-zinc-200" : "border-red-200 bg-red-50/30"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                    item.isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  )}>
                    {i + 1}
                  </span>
                  <span className="font-medium text-zinc-500 uppercase text-xs tracking-wider">
                    {item.mistakeType || "Correct"}
                  </span>
                </div>
                {item.isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Your Answer</div>
                  <div className={cn(
                    "font-medium",
                    item.isCorrect ? "text-emerald-700" : "text-red-700 line-through"
                  )}>
                    {item.userAnswer || "(No Answer)"}
                  </div>
                </div>
                {!item.isCorrect && (
                  <div>
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Correct Answer</div>
                    <div className="font-medium text-emerald-700">
                      {item.correctAnswer}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-zinc-50 p-4 rounded-lg text-sm text-zinc-700 leading-relaxed border border-zinc-100">
                <span className="font-bold text-zinc-900 block mb-1">Explanation:</span>
                {item.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Plan */}
      <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100 space-y-6">
        <div className="flex items-center space-x-3 text-indigo-900">
          <Lightbulb className="w-8 h-8 text-indigo-600" />
          <h2 className="text-2xl font-bold">Improvement Plan</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold text-indigo-800">Actionable Steps</h3>
            <ul className="space-y-3">
              {feedback.improvementPlan.map((step, i) => (
                <li key={i} className="flex items-start space-x-3 text-indigo-700">
                  <span className="mt-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-indigo-800">Time Management</h3>
            <p className="text-indigo-700 leading-relaxed">
              {feedback.timeManagementAdvice}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
