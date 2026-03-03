import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Clock, Zap, ArrowLeft, Book } from 'lucide-react';
import { ReadingMode } from '../../types';
import { cn } from '../../utils';

interface ReadingDashboardProps {
  onStartTest: (mode: ReadingMode) => void;
  onBack: () => void;
}

export const ReadingDashboard: React.FC<ReadingDashboardProps> = ({ onStartTest, onBack }) => {
  const modes: { id: ReadingMode; title: string; desc: string; icon: any; color: string }[] = [
    {
      id: 'FULL_TEST',
      title: 'Full Reading Test',
      desc: '3 Passages • 40 Questions • 60 Minutes. The complete IELTS experience.',
      icon: BookOpen,
      color: 'bg-emerald-500'
    },
    {
      id: 'TIMED',
      title: 'Timed Practice',
      desc: 'Practice with a single passage under time pressure (20 mins).',
      icon: Clock,
      color: 'bg-blue-500'
    },
    {
      id: 'PRACTICE',
      title: 'Untimed Practice',
      desc: 'Relaxed mode to focus on accuracy and understanding.',
      icon: Book,
      color: 'bg-amber-500'
    },
    {
      id: 'UNTIMED', // Using UNTIMED as "Individual Question Practice" for now or just general practice
      title: 'Quick Drill',
      desc: 'Short, focused practice on specific question types.',
      icon: Zap,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center space-x-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-zinc-500" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">IELTS Academic Reading</h1>
          <p className="text-zinc-500">Select a mode to begin your practice session.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modes.map((mode) => (
          <motion.button
            key={mode.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStartTest(mode.id)}
            className="bg-white border border-zinc-200 rounded-3xl p-8 text-left hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group"
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300",
              mode.color, "text-white"
            )}>
              <mode.icon className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-zinc-900">{mode.title}</h3>
            <p className="text-zinc-500 leading-relaxed">
              {mode.desc}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
