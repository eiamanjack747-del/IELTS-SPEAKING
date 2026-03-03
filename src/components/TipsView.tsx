import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

interface TipsViewProps {
  onBack: () => void;
}

export const TipsView: React.FC<TipsViewProps> = ({ onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-3xl mx-auto px-6 py-12 space-y-8"
    >
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </button>
        <h1 className="text-3xl font-bold">IELTS Speaking Tips</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Do's */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 text-emerald-600">
            <CheckCircle className="w-6 h-6" />
            <h2 className="text-xl font-bold">Do's</h2>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start space-x-3 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <span className="text-emerald-600 font-bold text-lg">•</span>
              <p className="text-zinc-700 text-sm">
                Speak naturally and fluently. Don't worry too much about grammar mistakes while speaking.
              </p>
            </li>
            <li className="flex items-start space-x-3 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <span className="text-emerald-600 font-bold text-lg">•</span>
              <p className="text-zinc-700 text-sm">
                Extend your answers. Avoid simple "Yes" or "No" answers. Always explain "Why".
              </p>
            </li>
            <li className="flex items-start space-x-3 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <span className="text-emerald-600 font-bold text-lg">•</span>
              <p className="text-zinc-700 text-sm">
                Use a range of vocabulary. Try to use synonyms instead of repeating the same words.
              </p>
            </li>
            <li className="flex items-start space-x-3 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <span className="text-emerald-600 font-bold text-lg">•</span>
              <p className="text-zinc-700 text-sm">
                Ask for clarification if you don't understand a question. It's okay to say "Could you please rephrase that?"
              </p>
            </li>
          </ul>
        </div>

        {/* Don'ts */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 text-red-600">
            <XCircle className="w-6 h-6" />
            <h2 className="text-xl font-bold">Don'ts</h2>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start space-x-3 bg-red-50 p-4 rounded-xl border border-red-100">
              <span className="text-red-600 font-bold text-lg">•</span>
              <p className="text-zinc-700 text-sm">
                Don't memorize answers. Examiners are trained to spot memorized scripts and will penalize you.
              </p>
            </li>
            <li className="flex items-start space-x-3 bg-red-50 p-4 rounded-xl border border-red-100">
              <span className="text-red-600 font-bold text-lg">•</span>
              <p className="text-zinc-700 text-sm">
                Don't go off-topic. Make sure your answer directly addresses the question asked.
              </p>
            </li>
            <li className="flex items-start space-x-3 bg-red-50 p-4 rounded-xl border border-red-100">
              <span className="text-red-600 font-bold text-lg">•</span>
              <p className="text-zinc-700 text-sm">
                Don't speak in a monotone voice. Use intonation to make your speech interesting and natural.
              </p>
            </li>
            <li className="flex items-start space-x-3 bg-red-50 p-4 rounded-xl border border-red-100">
              <span className="text-red-600 font-bold text-lg">•</span>
              <p className="text-zinc-700 text-sm">
                Don't use slang. Keep your language formal or semi-formal, suitable for an interview.
              </p>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 bg-indigo-50 rounded-3xl p-8 border border-indigo-100">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-indigo-900">Recommended Resources</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a href="https://www.ielts.org/" target="_blank" rel="noopener noreferrer" className="block p-4 bg-white rounded-xl border border-indigo-100 hover:shadow-md transition-all">
            <h3 className="font-bold text-indigo-700 mb-1">Official IELTS Website</h3>
            <p className="text-xs text-zinc-500">The most reliable source for test information.</p>
          </a>
          <a href="https://learnenglish.britishcouncil.org/" target="_blank" rel="noopener noreferrer" className="block p-4 bg-white rounded-xl border border-indigo-100 hover:shadow-md transition-all">
            <h3 className="font-bold text-indigo-700 mb-1">British Council Learning</h3>
            <p className="text-xs text-zinc-500">Free resources to improve your English skills.</p>
          </a>
          <a href="https://www.cambridgeenglish.org/" target="_blank" rel="noopener noreferrer" className="block p-4 bg-white rounded-xl border border-indigo-100 hover:shadow-md transition-all">
            <h3 className="font-bold text-indigo-700 mb-1">Cambridge English</h3>
            <p className="text-xs text-zinc-500">Practice materials from the test makers.</p>
          </a>
          <div className="block p-4 bg-white rounded-xl border border-indigo-100">
            <h3 className="font-bold text-indigo-700 mb-1">Practice Daily</h3>
            <p className="text-xs text-zinc-500">Use this app every day to build confidence!</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
