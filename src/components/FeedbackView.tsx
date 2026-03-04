import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, XCircle, BookOpen, Target, 
  TrendingUp, AlertTriangle, Award, ArrowRight,
  Download, Share2, RefreshCw, Volume2, AlertCircle, ArrowLeft
} from 'lucide-react';
import { FeedbackData } from '../types';
import { cn } from '../utils';

interface FeedbackViewProps {
  data: FeedbackData;
  onRestart: () => void;
  mode?: string;
  date?: string;
  isHistory?: boolean;
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({ data, onRestart, mode, date, isHistory }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Back Button */}
      <button 
        onClick={onRestart}
        className="flex items-center space-x-2 text-zinc-500 hover:text-zinc-900 transition-colors mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back</span>
      </button>

      {/* Header & Overall Score */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-zinc-900">
              {isHistory ? 'Past Result' : 'Session Result'}
            </h1>
            {mode && (
              <div className="flex items-center justify-center md:justify-start space-x-2 mt-1">
                <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-md text-xs font-bold uppercase tracking-wider">
                  {mode.replace('_', ' ')}
                </span>
                {date && (
                  <span className="text-zinc-400 text-xs">
                    • {new Date(date).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </div>
          <p className="text-zinc-500">Performance Analysis & Feedback</p>
          <div className="flex items-center space-x-2 text-emerald-600 font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>Estimated Band Score</span>
          </div>
        </div>
        
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-8 border-emerald-50 flex items-center justify-center">
            <span className="text-5xl font-black text-emerald-600">{data.bandScore}</span>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Overall
          </div>
        </div>
      </div>

      {/* Criteria Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Fluency', score: data.criteria.fluency, icon: RefreshCw },
          { label: 'Lexical', score: data.criteria.lexical, icon: BookOpen },
          { label: 'Grammar', score: data.criteria.grammar, icon: Target },
          { label: 'Pronunciation', score: data.criteria.pronunciation, icon: Volume2 },
        ].map((item, i) => (
          <div key={i} className="bg-white border border-zinc-100 rounded-2xl p-4 text-center space-y-2 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center mx-auto">
              <item.icon className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{item.label}</div>
            <div className="text-2xl font-bold text-zinc-900">{item.score}</div>
          </div>
        ))}
      </div>

      {/* Bangla Feedback Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <section className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-emerald-700 font-bold">
            <CheckCircle2 className="w-5 h-5" />
            <span>✅ আপনার সবল দিকসমূহ (Strengths)</span>
          </div>
          <ul className="space-y-2">
            {data.banglaFeedback.strengths.map((s, i) => (
              <li key={i} className="flex items-start space-x-2 text-zinc-700 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Mistakes */}
        <section className="bg-red-50/50 border border-red-100 rounded-3xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-red-700 font-bold">
            <XCircle className="w-5 h-5" />
            <span>❌ গ্রামার ভুল (Grammar Mistakes)</span>
          </div>
          <div className="space-y-4">
            {data.banglaFeedback.mistakes.map((m, i) => (
              <div key={i} className="space-y-1 text-sm">
                <div className="text-red-600 line-through opacity-60">"{m.wrong}"</div>
                <div className="text-emerald-700 font-medium">"{m.correct}"</div>
                <div className="text-zinc-500 text-xs italic">{m.explanation}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Vocabulary */}
        <section className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-blue-700 font-bold">
            <BookOpen className="w-5 h-5" />
            <span>📚 উন্নত শব্দভাণ্ডার (Vocabulary Upgrade)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.banglaFeedback.vocabulary.map((v, i) => (
              <span key={i} className="bg-white border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                {v}
              </span>
            ))}
          </div>
        </section>

        {/* Weak Areas */}
        <section className="bg-amber-50/50 border border-amber-100 rounded-3xl p-6 space-y-4">
          <div className="flex items-center space-x-2 text-amber-700 font-bold">
            <AlertTriangle className="w-5 h-5" />
            <span>⚠ দুর্বল দিকসমূহ (Weak Areas)</span>
          </div>
          <ul className="space-y-2">
            {data.banglaFeedback.weakAreas.map((w, i) => (
              <li key={i} className="flex items-start space-x-2 text-zinc-700 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Improvement Plan */}
      <section className="bg-zinc-900 text-white rounded-3xl p-8 space-y-6">
        <div className="flex items-center space-x-2 font-bold text-xl">
          <Target className="w-6 h-6 text-emerald-400" />
          <span>🎯 উন্নতির পরিকল্পনা (Improvement Plan)</span>
        </div>
        <div className="space-y-4">
          {data.banglaFeedback.improvementPlan.map((step, i) => (
            <div key={i} className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 font-bold text-emerald-400">
                {i + 1}
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed pt-1">
                {step}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stress & Performance */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            data.stressAnalysis.level === 'Low' ? "bg-emerald-100 text-emerald-600" :
            data.stressAnalysis.level === 'Moderate' ? "bg-amber-100 text-amber-600" :
            "bg-red-100 text-red-600"
          )}>
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Stress Level</div>
            <div className="text-lg font-bold text-zinc-900">{data.stressAnalysis.level}</div>
          </div>
        </div>
        <p className="text-zinc-500 text-sm italic text-center md:text-right max-w-md">
          "{data.stressAnalysis.advice}"
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button 
          onClick={onRestart}
          className="w-full sm:w-auto bg-zinc-900 text-white px-8 py-4 rounded-full font-medium flex items-center justify-center space-x-2 hover:bg-zinc-800 transition-all active:scale-95"
        >
          {isHistory ? (
            <>
              <ArrowLeft className="w-5 h-5" />
              <span>Back to History</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              <span>Try Another Test</span>
            </>
          )}
        </button>
        <button className="w-full sm:w-auto border border-zinc-200 text-zinc-600 px-8 py-4 rounded-full font-medium flex items-center justify-center space-x-2 hover:bg-zinc-50 transition-all active:scale-95">
          <Download className="w-5 h-5" />
          <span>Download Report</span>
        </button>
      </div>
    </div>
  );
};
