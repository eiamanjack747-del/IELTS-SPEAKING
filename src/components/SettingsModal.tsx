import React from 'react';
import { motion } from 'motion/react';
import { X, User, Target, Trash2, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  setUserName: (name: string) => void;
  targetBand: number;
  setTargetBand: (band: number) => void;
  onClearHistory: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userName,
  setUserName,
  targetBand,
  setTargetBand,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Name */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-zinc-700">
              <User className="w-4 h-4" />
              <span>Your Name</span>
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              placeholder="Enter your name"
            />
          </div>

          {/* Target Band Score */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-zinc-700">
              <Target className="w-4 h-4" />
              <span>Target Band Score</span>
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="9"
                step="0.5"
                value={targetBand}
                onChange={(e) => setTargetBand(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <span className="text-2xl font-bold text-emerald-600 w-12 text-center">
                {targetBand}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Set your goal to track progress effectively.
            </p>
          </div>

          {/* Clear History */}
          <div className="pt-6 border-t border-zinc-100">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all history? This cannot be undone.')) {
                  onClearHistory();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All History</span>
            </button>
          </div>
        </div>

        <div className="p-6 bg-zinc-50 border-t border-zinc-100">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
