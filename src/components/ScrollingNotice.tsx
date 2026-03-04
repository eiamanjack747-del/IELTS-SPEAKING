import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export const ScrollingNotice: React.FC = () => {
  const [notice, setNotice] = useState<string>('');

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const response = await fetch('/api/notice');
        if (response.ok) {
          const data = await response.json();
          setNotice(data.scrolling);
        }
      } catch (error) {
        console.error('Failed to fetch scrolling notice:', error);
      }
    };

    fetchNotice();
    const interval = setInterval(fetchNotice, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!notice) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-100 overflow-hidden py-2 relative z-50">
      <div className="animate-marquee whitespace-nowrap flex items-center space-x-12 px-4">
        {/* First Copy */}
        <div className="flex items-center space-x-8 text-amber-800 text-sm font-medium">
          <span className="flex items-center space-x-2 font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4" />
            <span>Notice:</span>
          </span>
          
          <span className="flex items-center space-x-2">
            <span>{notice}</span>
          </span>
        </div>

        {/* Second Copy for seamless loop */}
        <div className="flex items-center space-x-8 text-amber-800 text-sm font-medium">
          <span className="flex items-center space-x-2 font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4" />
            <span>Notice:</span>
          </span>
          
          <span className="flex items-center space-x-2">
            <span>{notice}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
