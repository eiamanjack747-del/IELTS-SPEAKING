import React from 'react';
import { motion } from 'motion/react';
import { PenTool, FileText, Layout, ArrowLeft, Send } from 'lucide-react';
import { WritingMode } from '../../types';
import { cn } from '../../utils';

interface WritingDashboardProps {
  onStartTest: (mode: WritingMode) => void;
  onBack: () => void;
}

export const WritingDashboard: React.FC<WritingDashboardProps> = ({ onStartTest, onBack }) => {
  const modes: { id: WritingMode; title: string; desc: string; icon: any; color: string }[] = [
    {
      id: 'TASK_1',
      title: 'Writing Task 1',
      desc: 'Describe a graph, chart, map, or process. (150 words • 20 mins)',
      icon: Layout,
      color: 'bg-blue-500'
    },
    {
      id: 'TASK_2',
      title: 'Writing Task 2',
      desc: 'Essay on a given topic. Opinion, discussion, or problem-solution. (250 words • 40 mins)',
      icon: FileText,
      color: 'bg-emerald-500'
    },
    {
      id: 'FULL_TEST',
      title: 'Full Writing Test',
      desc: 'Complete Task 1 and Task 2 in one session. (60 mins)',
      icon: PenTool,
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
          <h1 className="text-3xl font-bold text-zinc-900">IELTS Writing Module</h1>
          <p className="text-zinc-500">Practice Task 1 and Task 2 with AI evaluation and Bangla feedback.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <p className="text-zinc-500 leading-relaxed mb-6">
              {mode.desc}
            </p>
            <div className="flex items-center text-emerald-600 font-bold text-sm">
              <span>Start Practice</span>
              <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
