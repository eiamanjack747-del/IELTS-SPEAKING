import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';

export const NoticeBoard = () => {
  const [notice, setNotice] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const response = await fetch('/api/notice');
        if (response.ok) {
          const data = await response.json();
          setNotice(data.welcome);
        }
      } catch (error) {
        console.error('Failed to fetch notice:', error);
      }
    };

    fetchNotice();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchNotice, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!notice || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-blue-600 text-white px-4 py-3 relative shadow-md z-50"
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{notice}</p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-blue-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
