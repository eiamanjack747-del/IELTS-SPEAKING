import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, Award, Clock, AlertCircle, 
  ArrowLeft, BarChart3, Target, Zap, Sparkles, ChevronRight
} from 'lucide-react';
import { TestSession } from '../../types';
import { cn } from '../../utils';

interface DashboardProps {
  history: TestSession[];
  onBack: () => void;
  onNavigate: (view: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ history, onBack, onNavigate }) => {
  // Calculate Stats
  const totalTests = history.length;
  const avgBand = totalTests > 0 
    ? (history.reduce((acc, s) => acc + (s.bandScore || 0), 0) / totalTests).toFixed(1)
    : '0.0';
  
  const latestBand = totalTests > 0 ? history[0].bandScore : '0.0';
  
  // Identify Weakest Skill (Simplified logic)
  const skills = {
    Speaking: history.filter(s => ['FULL_MOCK', 'PART_1', 'PART_2', 'PART_3'].includes(s.mode as string)).length,
    Reading: history.filter(s => ['FULL_TEST', 'TIMED', 'PRACTICE'].includes(s.mode as string)).length,
    Writing: history.filter(s => ['TASK_1', 'TASK_2'].includes(s.mode as string)).length
  };

  const weakestSkill = Object.entries(skills).sort((a, b) => a[1] - b[1])[0][0];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-zinc-500" />
          </button>
          <h1 className="text-3xl font-bold text-zinc-900">Smart Progress Dashboard</h1>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-bold text-emerald-700">AI Analysis Active</span>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-zinc-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <Award className="w-5 h-5 text-emerald-500" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Avg Band</span>
          </div>
          <p className="text-5xl font-black text-zinc-900">{avgBand}</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-zinc-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Latest</span>
          </div>
          <p className="text-5xl font-black text-zinc-900">{latestBand}</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-zinc-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <Zap className="w-5 h-5 text-amber-500" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Tests</span>
          </div>
          <p className="text-5xl font-black text-zinc-900">{totalTests}</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-zinc-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <Target className="w-5 h-5 text-red-500" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Weakest</span>
          </div>
          <p className="text-2xl font-black text-zinc-900">{weakestSkill}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Trend & Heatmap */}
        <div className="space-y-8">
          {/* Performance Graph */}
          <div className="bg-zinc-900 p-10 rounded-[50px] text-white space-y-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  <span>Band Score Trend</span>
                </h3>
                <div className="flex items-center space-x-4 text-xs text-zinc-500">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Completed</span>
                  </div>
                </div>
              </div>
              <div className="h-64 flex items-end justify-between gap-3 pt-4">
                {history.slice(0, 12).reverse().map((s, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                    <div className="relative w-full flex flex-col items-center">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${((s.bandScore || 0) / 9) * 100}%` }}
                        className="w-full bg-emerald-500/30 rounded-t-xl border-t-2 border-emerald-400 group-hover:bg-emerald-500/50 transition-all"
                      />
                      <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-zinc-900 px-2 py-1 rounded text-[10px] font-bold shadow-xl">
                        {s.bandScore}
                      </div>
                    </div>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">
                      {new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm italic">
                    Complete tests to see your trend
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
