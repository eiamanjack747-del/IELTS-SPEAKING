import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, Sparkles, ArrowLeft, Loader2, 
  Volume2, RefreshCw, ChevronRight, CheckCircle2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../../utils';

interface VocabWord {
  word: string;
  definition: string;
  example: string;
  synonyms: string[];
  collocations: string[];
}

export const VocabBooster: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [topic, setTopic] = useState('Environment');
  const [words, setWords] = useState<VocabWord[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready'>('idle');

  const topics = [
    'Environment', 'Technology', 'Education', 'Health', 
    'Society', 'Economy', 'Culture', 'Science'
  ];

  const fetchVocab = async (selectedTopic: string) => {
    setStatus('loading');
    setTopic(selectedTopic);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const prompt = `
        Generate 5 high-level academic vocabulary words for the IELTS topic: ${selectedTopic}.
        
        OUTPUT FORMAT (JSON ONLY):
        {
          "words": [
            {
              "word": "string",
              "definition": "string",
              "example": "string",
              "synonyms": ["string"],
              "collocations": ["string"]
            }
          ]
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const data = JSON.parse(response.text!);
      setWords(data.words);
      setStatus('ready');
    } catch (err) {
      console.error("Failed to fetch vocab:", err);
      setStatus('idle');
    }
  };

  useEffect(() => {
    fetchVocab(topic);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-zinc-500" />
          </button>
          <h1 className="text-3xl font-bold text-zinc-900">AI Vocabulary Booster</h1>
        </div>
        <button 
          onClick={() => fetchVocab(topic)}
          className="p-3 bg-zinc-100 rounded-2xl hover:bg-zinc-200 transition-all"
          title="Refresh Words"
        >
          <RefreshCw className={cn("w-5 h-5 text-zinc-600", status === 'loading' && "animate-spin")} />
        </button>
      </div>

      {/* Topic Selector */}
      <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar">
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => fetchVocab(t)}
            className={cn(
              "px-6 py-3 rounded-full font-bold text-sm whitespace-nowrap transition-all",
              topic === t 
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" 
                : "bg-white border border-zinc-200 text-zinc-500 hover:border-emerald-500/50"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {status === 'loading' ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
          <p className="text-zinc-500 font-medium">Curating academic vocabulary...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {words.map((w, i) => (
            <motion.div
              key={w.word}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6 group hover:border-emerald-500/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-zinc-900 group-hover:text-emerald-600 transition-colors">{w.word}</h3>
                  <p className="text-zinc-500 leading-relaxed max-w-2xl">{w.definition}</p>
                </div>
                <button className="p-3 bg-zinc-50 rounded-2xl text-zinc-400 hover:text-emerald-600 transition-all">
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 italic text-zinc-600 text-sm">
                "{w.example}"
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Synonyms</h4>
                  <div className="flex flex-wrap gap-2">
                    {w.synonyms.map(s => (
                      <span key={s} className="px-3 py-1 bg-white border border-zinc-100 rounded-lg text-xs font-medium text-zinc-600">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Collocations</h4>
                  <div className="flex flex-wrap gap-2">
                    {w.collocations.map(c => (
                      <span key={c} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
