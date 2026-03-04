import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Headphones, PenTool, Mic, 
  ArrowLeft, ChevronRight, Lightbulb, Target,
  Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import { cn } from '../utils';

export const StrategyView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'listening' | 'reading' | 'writing' | 'speaking'>('listening');

  const strategies = {
    listening: {
      title: 'Listening Strategies',
      icon: Headphones,
      color: 'text-blue-500',
      tips: [
        { title: 'Predict the Answer', desc: 'Read the questions before the audio starts to predict the type of information needed (name, number, date).' },
        { title: 'Watch for Distractors', desc: 'Speakers often correct themselves. Listen for words like "actually", "no", or "wait".' },
        { title: 'Spelling Counts', desc: 'Incorrect spelling will lose you marks. Practice common IELTS words.' }
      ],
      templates: [
        { name: 'Form Completion', steps: ['Read instructions', 'Check word limit', 'Predict content', 'Listen for keywords'] }
      ]
    },
    reading: {
      title: 'Reading Strategies',
      icon: BookOpen,
      color: 'text-emerald-500',
      tips: [
        { title: 'Skimming & Scanning', desc: 'Skim for the general idea, scan for specific keywords or numbers.' },
        { title: 'Don\'t Read Everything', desc: 'You don\'t have time to read every word. Focus on finding answers.' },
        { title: 'Manage Your Time', desc: 'Spend 20 mins per passage. If stuck, move on and come back later.' }
      ],
      templates: [
        { name: 'Matching Headings', steps: ['Read headings first', 'Read first/last sentences of paragraphs', 'Look for synonyms'] }
      ]
    },
    writing: {
      title: 'Writing Strategies',
      icon: PenTool,
      color: 'text-purple-500',
      tips: [
        { title: 'Plan Your Essay', desc: 'Spend 5 minutes planning Task 2. A clear structure is key to a high score.' },
        { title: 'Vary Your Vocabulary', desc: 'Avoid repeating the same words. Use academic synonyms.' },
        { title: 'Check Your Work', desc: 'Leave 2-3 minutes at the end to check for basic grammar and spelling errors.' }
      ],
      templates: [
        { name: 'Introduction Template', steps: ['Paraphrase the prompt', 'State your opinion (if needed)', 'Outline main points'] }
      ]
    },
    speaking: {
      title: 'Speaking Strategies',
      icon: Mic,
      color: 'text-red-500',
      tips: [
        { title: 'Extend Your Answers', desc: 'Don\'t just say "Yes" or "No". Explain why and give examples.' },
        { title: 'Use Fillers Wisely', desc: 'Use phrases like "That\'s an interesting question" to give yourself time to think.' },
        { title: 'Be Natural', desc: 'Don\'t memorize answers. Focus on clear pronunciation and natural intonation.' }
      ],
      templates: [
        { name: 'Part 2 Structure', steps: ['Introduction', 'Main points (Who, What, Where)', 'Explanation (Why)', 'Conclusion'] }
      ]
    }
  };

  const current = strategies[activeTab];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center space-x-4">
        <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-zinc-500" />
        </button>
        <h1 className="text-3xl font-bold text-zinc-900">Exam Strategy Section</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-2 rounded-2xl border border-zinc-200 shadow-sm">
        {Object.entries(strategies).map(([key, data]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={cn(
              "flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2",
              activeTab === key 
                ? "bg-zinc-900 text-white shadow-lg" 
                : "text-zinc-500 hover:bg-zinc-50"
            )}
          >
            <data.icon className="w-4 h-4" />
            <span className="capitalize">{key}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tips List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-zinc-900 flex items-center space-x-2">
            <Lightbulb className={cn("w-6 h-6", current.color)} />
            <span>Key Strategies</span>
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {current.tips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:border-emerald-500/50 transition-all group"
              >
                <h3 className="text-lg font-bold text-zinc-900 mb-2 group-hover:text-emerald-600 transition-colors">{tip.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{tip.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Templates & Checklists */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-zinc-900 flex items-center space-x-2">
            <Target className="w-6 h-6 text-amber-500" />
            <span>Templates</span>
          </h2>
          <div className="space-y-4">
            {current.templates.map((temp, i) => (
              <div key={i} className="bg-zinc-900 text-white p-6 rounded-3xl space-y-4 shadow-xl">
                <h3 className="font-bold text-emerald-400">{temp.name}</h3>
                <ul className="space-y-3">
                  {temp.steps.map((step, j) => (
                    <li key={j} className="flex items-start space-x-3 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-zinc-300">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl space-y-3">
              <div className="flex items-center space-x-2 text-amber-900 font-bold">
                <AlertCircle className="w-5 h-5" />
                <span>Pro Tip</span>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                Consistency is more important than perfection. Practice these strategies daily in our mock tests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
