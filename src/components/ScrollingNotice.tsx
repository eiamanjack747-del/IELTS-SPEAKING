import React from 'react';
import { AlertTriangle, Clock, RefreshCw, Zap } from 'lucide-react';

export const ScrollingNotice: React.FC = () => {
  return (
    <div className="bg-amber-50 border-b border-amber-100 overflow-hidden py-2 relative z-50">
      <div className="animate-marquee whitespace-nowrap flex items-center space-x-12 px-4">
        {/* First Copy */}
        <div className="flex items-center space-x-8 text-amber-800 text-sm font-medium">
          <span className="flex items-center space-x-2 font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4" />
            <span>API Quota Exceeded?</span>
          </span>
          
          <span className="flex items-center space-x-2">
            <span>যদি আপনি "Quota Exceeded" বা এপিআই লিমিট শেষ হওয়ার এরর দেখেন, তবে চিন্তার কিছু নেই। এটি সমাধানের উপায় নিচে দেওয়া হলো:</span>
          </span>

          <span className="flex items-center space-x-2 bg-amber-100 px-3 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            <span>১ মিনিট অপেক্ষা করুন (ফ্রি টায়ারে প্রতি মিনিটে লিমিট থাকে। ১ মিনিট পর আবার চেষ্টা করলে এটি ঠিক হয়ে যাবে।)</span>
          </span>

          <span className="flex items-center space-x-2 bg-amber-100 px-3 py-1 rounded-full">
            <Zap className="w-3 h-3" />
            <span>এপিআই কল কমান (খুব দ্রুত বারবার বাটন ক্লিক করবেন না। প্রতিটি ক্লিকের মাঝে কিছুটা সময় নিন।)</span>
          </span>

          <span className="flex items-center space-x-2 bg-amber-100 px-3 py-1 rounded-full">
            <RefreshCw className="w-3 h-3" />
            <span>সার্ভার রিফ্রেশ করুন</span>
          </span>
        </div>

        {/* Second Copy for seamless loop */}
        <div className="flex items-center space-x-8 text-amber-800 text-sm font-medium">
          <span className="flex items-center space-x-2 font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4" />
            <span>API Quota Exceeded?</span>
          </span>
          
          <span className="flex items-center space-x-2">
            <span>যদি আপনি "Quota Exceeded" বা এপিআই লিমিট শেষ হওয়ার এরর দেখেন, তবে চিন্তার কিছু নেই। এটি সমাধানের উপায় নিচে দেওয়া হলো:</span>
          </span>

          <span className="flex items-center space-x-2 bg-amber-100 px-3 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            <span>১ মিনিট অপেক্ষা করুন (ফ্রি টায়ারে প্রতি মিনিটে লিমিট থাকে। ১ মিনিট পর আবার চেষ্টা করলে এটি ঠিক হয়ে যাবে।)</span>
          </span>

          <span className="flex items-center space-x-2 bg-amber-100 px-3 py-1 rounded-full">
            <Zap className="w-3 h-3" />
            <span>এপিআই কল কমান (খুব দ্রুত বারবার বাটন ক্লিক করবেন না। প্রতিটি ক্লিকের মাঝে কিছুটা সময় নিন।)</span>
          </span>

          <span className="flex items-center space-x-2 bg-amber-100 px-3 py-1 rounded-full">
            <RefreshCw className="w-3 h-3" />
            <span>সার্ভার রিফ্রেশ করুন</span>
          </span>
        </div>
      </div>
    </div>
  );
};
