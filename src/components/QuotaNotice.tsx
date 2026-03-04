import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X, Clock, Zap, ShieldAlert } from 'lucide-react';

interface QuotaNoticeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuotaNotice: React.FC<QuotaNoticeProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden border border-zinc-200"
          >
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-zinc-900">API Quota Exceeded?</h2>
                <p className="text-zinc-500 leading-relaxed">
                  যদি আপনি <span className="font-bold text-red-500">"Quota Exceeded"</span> বা এপিআই লিমিট শেষ হওয়ার এরর দেখেন, তবে চিন্তার কিছু নেই। এটি সমাধানের উপায় নিচে দেওয়া হলো:
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="mt-1">
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 text-sm">১ মিনিট অপেক্ষা করুন</h4>
                    <p className="text-xs text-zinc-500 mt-1">
                      ফ্রি টায়ারে প্রতি মিনিটে লিমিট থাকে। ১ মিনিট পর আবার চেষ্টা করলে এটি ঠিক হয়ে যাবে।
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="mt-1">
                    <Zap className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 text-sm">এপিআই কল কমান</h4>
                    <p className="text-xs text-zinc-500 mt-1">
                      খুব দ্রুত বারবার বাটন ক্লিক করবেন না। প্রতিটি ক্লিকের মাঝে কিছুটা সময় নিন।
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="mt-1">
                    <AlertCircle className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 text-sm">সার্ভার রিফ্রেশ করুন</h4>
                    <p className="text-xs text-zinc-500 mt-1">
                      যদি সমস্যা স্থায়ী হয়, তবে অ্যাপটি একবার রিফ্রেশ করে পুনরায় চেষ্টা করুন।
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
              >
                বুঝেছি (Got it)
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
