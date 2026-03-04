import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, Target, BookOpen, Clock, CheckCircle2, 
  ArrowLeft, Sparkles, Loader2, Save
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../../utils';

interface StudyPlan {
  dailyGoals: { day: string; tasks: string[] }[];
  weeklyFocus: string;
  strategy: string;
}

interface StudyPlannerProps {
  onBack: () => void;
  userName: string;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({ onBack, userName }) => {
  const [targetBand, setTargetBand] = useState(7.0);
  const [examDate, setExamDate] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [status, setStatus] = useState<'idle' | 'generating' | 'ready'>('idle');
  const [plan, setPlan] = useState<StudyPlan | null>(null);

  useEffect(() => {
    const savedPlan = localStorage.getItem('express_yourself_study_plan');
    if (savedPlan) {
      setPlan(JSON.parse(savedPlan));
      setStatus('ready');
    }
  }, []);

  const generatePlan = async () => {
    setStatus('generating');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const prompt = `
        Generate a personalized IELTS study plan for ${userName}.
        Target Band: ${targetBand}
        Exam Date: ${examDate}
        Available Time: ${hoursPerDay} hours per day.
        
        OUTPUT FORMAT (JSON ONLY):
        {
          "dailyGoals": [
            { "day": "Monday", "tasks": ["Task 1", "Task 2"] },
            { "day": "Tuesday", "tasks": ["Task 1", "Task 2"] },
            { "day": "Wednesday", "tasks": ["Task 1", "Task 2"] },
            { "day": "Thursday", "tasks": ["Task 1", "Task 2"] },
            { "day": "Friday", "tasks": ["Task 1", "Task 2"] },
            { "day": "Saturday", "tasks": ["Task 1", "Task 2"] },
            { "day": "Sunday", "tasks": ["Rest & Review"] }
          ],
          "weeklyFocus": "Main focus for this week",
          "strategy": "A key strategy for reaching band ${targetBand}"
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const data = JSON.parse(response.text!);
      setPlan(data);
      localStorage.setItem('express_yourself_study_plan', JSON.stringify(data));
      setStatus('ready');
    } catch (err) {
      console.error("Failed to generate plan:", err);
      setStatus('idle');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-zinc-500" />
          </button>
          <h1 className="text-3xl font-bold text-zinc-900">AI Study Planner</h1>
        </div>
        {status === 'ready' && (
          <button 
            onClick={() => setStatus('idle')}
            className="text-emerald-600 font-bold text-sm hover:underline"
          >
            Reset Plan
          </button>
        )}
      </div>

      {status === 'idle' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center space-x-2">
                <Target className="w-3 h-3" />
                <span>Target Band</span>
              </label>
              <input 
                type="number" 
                step="0.5" 
                min="1" 
                max="9"
                value={targetBand}
                onChange={(e) => setTargetBand(parseFloat(e.target.value))}
                className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-xl font-black outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center space-x-2">
                <Calendar className="w-3 h-3" />
                <span>Exam Date</span>
              </label>
              <input 
                type="date" 
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-lg font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center space-x-2">
                <Clock className="w-3 h-3" />
                <span>Hours / Day</span>
              </label>
              <select 
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(parseInt(e.target.value))}
                className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-lg font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
              >
                {[1, 2, 3, 4, 5, 6].map(h => (
                  <option key={h} value={h}>{h} Hours</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            onClick={generatePlan}
            className="w-full bg-zinc-900 text-white py-6 rounded-3xl font-bold text-xl hover:bg-emerald-600 transition-all flex items-center justify-center space-x-3 group"
          >
            <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
            <span>Generate My Plan</span>
          </button>
        </motion.div>
      )}

      {status === 'generating' && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
          <div className="text-center">
            <h3 className="text-2xl font-bold">Crafting Your Schedule...</h3>
            <p className="text-zinc-500">AI is analyzing your goals to create the perfect study path.</p>
          </div>
        </div>
      )}

      {status === 'ready' && plan && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Weekly Focus */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 rounded-3xl text-white shadow-xl shadow-emerald-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="w-6 h-6 text-emerald-300" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Weekly Focus</h3>
            </div>
            <p className="text-2xl font-bold leading-tight">{plan.weeklyFocus}</p>
            <div className="mt-6 pt-6 border-t border-white/10 text-emerald-100 italic">
              "Strategy: {plan.strategy}"
            </div>
          </div>

          {/* Daily Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plan.dailyGoals.map((day, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-zinc-900">{day.day}</h4>
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <ul className="space-y-3">
                  {day.tasks.map((task, j) => (
                    <li key={j} className="flex items-start space-x-3 text-sm text-zinc-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
