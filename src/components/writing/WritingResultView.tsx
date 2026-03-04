import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle, XCircle, Clock, Award, ArrowLeft, 
  BarChart2, AlertTriangle, Lightbulb, MessageSquare,
  FileText, PenTool, TrendingUp
} from 'lucide-react';
import { WritingResult } from '../../types';
import { cn, formatDuration } from '../../utils';

interface WritingResultViewProps {
  result: WritingResult;
  onBack: () => void;
}

export const WritingResultView: React.FC<WritingResultViewProps> = ({ result, onBack }) => {
  const { bandScore, criteriaScores, feedback, wordCount, timeUsed, taskType } = result;

  const criteriaLabels = {
    taskResponse: 'Task Response',
    coherence: 'Coherence & Cohesion',
    lexical: 'Lexical Resource',
    grammar: 'Grammatical Range'
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            {taskType.replace('_', ' ')}
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Writing Evaluation</h1>
        </div>
      </div>

      {/* Main Score & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Band Score Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 rounded-3xl text-white shadow-xl shadow-emerald-500/20 flex flex-col items-center justify-center space-y-4">
          <Award className="w-12 h-12 opacity-50" />
          <div className="text-center">
            <span className="text-emerald-100 text-sm font-bold uppercase tracking-widest block mb-2">Estimated Band</span>
            <span className="text-7xl font-black">{bandScore}</span>
          </div>
          <div className="flex items-center space-x-4 w-full pt-4 border-t border-white/10">
            <div className="flex-1 text-center">
              <span className="text-[10px] uppercase opacity-60 block">Words</span>
              <span className="font-bold">{wordCount}</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex-1 text-center">
              <span className="text-[10px] uppercase opacity-60 block">Time</span>
              <span className="font-bold">{formatDuration(timeUsed)}</span>
            </div>
          </div>
        </div>

        {/* Criteria Breakdown */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-zinc-900 flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-emerald-600" />
            <span>Criteria Breakdown</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(criteriaScores).map(([key, score]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500 font-medium">{criteriaLabels[key as keyof typeof criteriaLabels]}</span>
                  <span className="font-bold text-zinc-900">{score}</span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(score / 9) * 100}%` }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bangla Summary */}
      <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
        <h3 className="text-xl font-bold text-zinc-900 flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          <span>সারসংক্ষেপ (Summary)</span>
        </h3>
        <p className="text-zinc-700 leading-relaxed text-lg">
          {feedback.banglaSummary}
        </p>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 space-y-4">
          <h3 className="font-bold text-emerald-900 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Strengths</span>
          </h3>
          <ul className="space-y-3">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="flex items-start space-x-3 text-emerald-700 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-red-50 p-8 rounded-3xl border border-red-100 space-y-4">
          <h3 className="font-bold text-red-900 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Weaknesses</span>
          </h3>
          <ul className="space-y-3">
            {feedback.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start space-x-3 text-red-700 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Grammar Corrections */}
      <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-zinc-900 flex items-center space-x-2">
          <PenTool className="w-5 h-5 text-amber-500" />
          <span>Grammar Corrections</span>
        </h3>
        <div className="space-y-4">
          {feedback.grammarCorrections.map((item, i) => (
            <div key={i} className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 space-y-3">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Original</span>
                  <p className="text-zinc-500 line-through text-sm italic">"{item.original}"</p>
                </div>
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Corrected</span>
                  <p className="text-zinc-900 font-medium text-sm">"{item.corrected}"</p>
                </div>
              </div>
              <div className="pt-3 border-t border-zinc-200 text-xs text-zinc-600 leading-relaxed">
                <span className="font-bold text-zinc-900">কেন ভুল:</span> {item.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vocabulary Suggestions */}
      <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-zinc-900 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          <span>Vocabulary Booster</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedback.vocabularySuggestions.map((item, i) => (
            <div key={i} className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-medium">{item.word}</span>
                <span className="text-indigo-600 font-black">→ {item.betterAlternative}</span>
              </div>
              <p className="text-xs text-zinc-500 italic">Context: {item.context}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Plan */}
      <div className="bg-zinc-900 p-10 rounded-[40px] text-white space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative z-10 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="bg-emerald-500 p-3 rounded-2xl">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold">Your Improvement Plan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ul className="space-y-4">
              {feedback.improvementPlan.map((step, i) => (
                <li key={i} className="flex items-start space-x-4">
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-zinc-300 leading-relaxed">{step}</p>
                </li>
              ))}
            </ul>
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 flex flex-col justify-center space-y-4">
              <h4 className="font-bold text-emerald-400 uppercase tracking-widest text-xs">Next Goal</h4>
              <p className="text-xl font-medium leading-relaxed">
                Focus on using complex sentence structures and academic collocations to reach Band {Math.min(9, bandScore + 0.5)}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
