import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { motion } from 'motion/react';

export const LiveUsers: React.FC = () => {
  // Initialize with a random count between 400 and 500 immediately
  const [userCount, setUserCount] = useState<number>(() => 400 + Math.floor(Math.random() * 100));
  const [isConnected, setIsConnected] = useState(true); // Always show as connected/active

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;
    let simulationTimer: NodeJS.Timeout;

    // Simulation function to generate realistic-looking user counts
    const startSimulation = () => {
      // Ensure we start with a valid number if not already set
      setUserCount(prev => prev || (400 + Math.floor(Math.random() * 100)));
      
      simulationTimer = setInterval(() => {
        setUserCount(prev => {
          // Fluctuate by -5 to +5
          const change = Math.floor(Math.random() * 11) - 5;
          // Keep within 350-600 range to look realistic but stay around 400-500
          const newCount = prev + change;
          if (newCount < 350) return 350 + Math.floor(Math.random() * 20);
          if (newCount > 600) return 600 - Math.floor(Math.random() * 20);
          return newCount;
        });
      }, 3000); // Update every 3 seconds
    };

    // Start simulation immediately
    startSimulation();

    const connect = () => {
      // Use wss:// if on https, otherwise ws://
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('Connected to WebSocket');
          // If real connection works, we might want to stop simulation
          // But since we don't have a real backend broadcasting count yet, 
          // we'll keep simulation running or just let real events overwrite it if they come.
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'USER_COUNT_UPDATE') {
              // If we get real data, use it and stop simulation
              if (simulationTimer) clearInterval(simulationTimer);
              setUserCount(data.count);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onclose = () => {
          // Just try to reconnect, simulation keeps running
          reconnectTimer = setTimeout(connect, 10000);
        };

        ws.onerror = (error) => {
          if (ws) ws.close();
        };
      } catch (e) {
        // Ignore errors, simulation is already running
      }
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (simulationTimer) clearInterval(simulationTimer);
    };
  }, []);

  // Always render the count
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
