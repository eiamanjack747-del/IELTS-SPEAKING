import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { motion } from 'motion/react';

export const LiveUsers: React.FC = () => {
  const [userCount, setUserCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: NodeJS.Timeout;

    const connect = () => {
      // Use wss:// if on https, otherwise ws://
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Connected to WebSocket');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'USER_COUNT_UPDATE') {
            setUserCount(data.count);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('Disconnected from WebSocket');
        setIsConnected(false);
        // Reconnect after 3 seconds
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.close();
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  if (!isConnected && userCount === 0) {
    // Show connecting state or 0 if enabled
    return (
      <div className="flex items-center space-x-2 bg-zinc-800/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-zinc-700/50 shadow-sm opacity-50">
        <Users className="w-4 h-4 text-zinc-500" />
        <span className="text-xs font-medium text-zinc-400">Connecting...</span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-2 bg-zinc-800/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-zinc-700/50 shadow-sm"
    >
      <div className="relative">
        <Users className="w-4 h-4 text-emerald-400" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
      </div>
      <span className="text-xs font-medium text-zinc-300">
        <span className="font-bold text-white">{userCount}</span> Online
      </span>
    </motion.div>
  );
};
