import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500); // Show splash screen for 2.5 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center space-y-6"
      >
        <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mb-4">
          <Star className="w-12 h-12 text-emerald-600 fill-current" />
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-zinc-900">
            Express <span className="text-emerald-600">Yourself</span>
          </h1>
          <p className="text-zinc-500 font-medium tracking-wide uppercase text-sm">
            AI-Powered IELTS Coach
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute bottom-12 text-center"
      >
        <p className="text-zinc-400 text-xs uppercase tracking-widest font-bold mb-1">
          Developed by
        </p>
        <p className="text-zinc-900 font-bold text-lg">
          Eiaman
        </p>
      </motion.div>
    </div>
  );
};
