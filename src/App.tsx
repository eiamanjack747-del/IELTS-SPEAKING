import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, Book, MessageCircle, Globe, 
  History as HistoryIcon, Award, Settings,
  ChevronRight, Play, Star, Clock, User, ArrowLeft, AlertCircle, XCircle
} from 'lucide-react';
import { SplashScreen } from './components/SplashScreen';
import { SettingsModal } from './components/SettingsModal';
import { TipsView } from './components/TipsView';
import { IELTSExaminer } from './components/IELTSExaminer';
import { FeedbackView } from './components/FeedbackView';
import { TestMode, TestSession, FeedbackData } from './types';
import { cn } from './utils';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<'home' | 'test' | 'feedback' | 'history' | 'tips'>('home');
  const [selectedMode, setSelectedMode] = useState<TestMode | null>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [viewingSession, setViewingSession] = useState<TestSession | null>(null);
  const [history, setHistory] = useState<TestSession[]>([]);
  
  // User Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userName, setUserName] = useState('Candidate');
  const [targetBand, setTargetBand] = useState(7.0);

  const [returnTo, setReturnTo] = useState<'home' | 'history'>('home');
  
  // Audio State
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('express_yourself_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedSettings = localStorage.getItem('express_yourself_settings');
    if (savedSettings) {
      const { name, band } = JSON.parse(savedSettings);
      if (name) setUserName(name);
      if (band) setTargetBand(band);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('express_yourself_settings', JSON.stringify({ name: userName, band: targetBand }));
  }, [userName, targetBand]);

  const requestMicrophone = async () => {
    if (mediaStream) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      setMediaStream(stream);
      return true;
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Microphone access is required for this app. Please allow access in your browser settings.");
      return false;
    }
  };

  const handleStartTest = async (mode: TestMode) => {
    const hasAccess = await requestMicrophone();
    if (hasAccess) {
      setSelectedMode(mode);
      setView('test');
    }
  };

  const handleTestComplete = (data: FeedbackData) => {
    setFeedbackData(data);
    setReturnTo('home');
    
    // Save to history
    const newSession: TestSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mode: selectedMode!,
      candidateName: userName, 
      bandScore: data.bandScore,
      duration: 900, // Mock duration
      stressLevel: data.stressAnalysis.level,
      feedback: data, // Save the full feedback object
    };
    
    setViewingSession(newSession);
    const updatedHistory = [newSession, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('express_yourself_history', JSON.stringify(updatedHistory));
    
    setView('feedback');
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('express_yourself_history');
  };

  const handleViewDetails = (session: TestSession, from: 'home' | 'history' = 'history') => {
    if (session.feedback) {
      setFeedbackData(session.feedback);
      setViewingSession(session);
      setReturnTo(from);
      setView('feedback');
    } else {
      alert("Feedback data is not available for this session.");
    }
  };

  const handleDeleteSession = (id: string) => {
    const updatedHistory = history.filter(s => s.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('express_yourself_history', JSON.stringify(updatedHistory));
  };

  const modes = [
    { 
      id: 'FULL_MOCK', 
      title: 'Full Mock Test', 
      desc: 'Complete Part 1, 2, and 3 simulation.', 
      icon: Award,
      color: 'bg-emerald-500'
    },
    { 
      id: 'PART_1', 
      title: 'Part 1 Only', 
      desc: 'Focus on personal questions & familiar topics.', 
      icon: MessageCircle,
      color: 'bg-blue-500'
    },
    { 
      id: 'PART_2', 
      title: 'Part 2 Only', 
      desc: 'Practice the long turn with cue cards.', 
      icon: Book,
      color: 'bg-amber-500'
    },
    { 
      id: 'PART_3', 
      title: 'Part 3 Only', 
      desc: 'Deep dive into analytical discussions.', 
      icon: Star,
      color: 'bg-purple-500'
    },
    { 
      id: 'DAILY_CONVO', 
      title: 'Daily Conversation', 
      desc: 'Natural friendly talk for daily scenarios.', 
      icon: Globe,
      color: 'bg-indigo-500'
    },
    { 
      id: 'VISA_INTERVIEW', 
      title: 'Visa Interview', 
      desc: 'Professional embassy simulation.', 
      icon: User,
      color: 'bg-zinc-900'
    },
  ];

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-zinc-900 font-sans flex flex-col">
      <div className="flex-grow">
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.main
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-5xl mx-auto px-6 py-12 space-y-12"
          >
            {/* Hero Section */}
            <header className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  <Star className="w-3 h-3 fill-current" />
                  <span>AI-Powered IELTS Coach</span>
                </div>
                <h1 className="text-5xl font-black tracking-tight leading-tight">
                  Express <span className="text-emerald-600">Yourself</span>
                </h1>
                <p className="text-zinc-500 text-lg max-w-md">
                  Master your IELTS speaking with real-time AI feedback, authentic topics, and personalized coaching.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {mediaStream && (
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-medium animate-pulse border border-red-100">
                    <Mic className="w-3 h-3" />
                    <span>Mic Ready</span>
                  </div>
                )}
                <button 
                  onClick={() => setView('tips')}
                  className="p-3 bg-white border border-zinc-200 rounded-2xl shadow-sm hover:bg-zinc-50 transition-all"
                  title="Tips & Resources"
                >
                  <Book className="w-6 h-6 text-zinc-600" />
                </button>
                <button 
                  onClick={() => setView('history')}
                  className="p-3 bg-white border border-zinc-200 rounded-2xl shadow-sm hover:bg-zinc-50 transition-all"
                  title="History"
                >
                  <HistoryIcon className="w-6 h-6 text-zinc-600" />
                </button>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-3 bg-white border border-zinc-200 rounded-2xl shadow-sm hover:bg-zinc-50 transition-all"
                  title="Settings"
                >
                  <Settings className="w-6 h-6 text-zinc-600" />
                </button>
              </div>
            </header>

            {/* Mode Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleStartTest(mode.id as TestMode)}
                  className="group relative bg-white border border-zinc-200 rounded-3xl p-6 text-left hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300",
                    mode.color, "text-white"
                  )}>
                    <mode.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{mode.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                    {mode.desc}
                  </p>
                  <div className="flex items-center text-emerald-600 font-bold text-sm">
                    <span>Start Session</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </section>

            {/* Recent Activity Mini-View */}
            {history.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Recent Activity</h2>
                  <button 
                    onClick={() => setView('history')}
                    className="text-emerald-600 font-bold text-sm hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.slice(0, 2).map((session) => (
                    <button 
                      key={session.id} 
                      onClick={() => handleViewDetails(session, 'home')}
                      className="bg-white border border-zinc-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-emerald-200 hover:shadow-md transition-all text-left group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold group-hover:bg-emerald-100 transition-colors">
                          {session.bandScore}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{session.mode.replace('_', ' ')}</div>
                          <div className="text-xs text-zinc-400">{new Date(session.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </section>
            )}
          </motion.main>
        )}

        {view === 'test' && selectedMode && (
          <motion.div
            key="test"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50 overflow-hidden"
          >
            <IELTSExaminer 
              mode={selectedMode} 
              userName={userName}
              mediaStream={mediaStream}
              onComplete={handleTestComplete}
              onCancel={() => setView('home')}
            />
          </motion.div>
        )}

        {view === 'feedback' && feedbackData && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="min-h-screen bg-zinc-50"
          >
            <FeedbackView 
              data={feedbackData} 
              onRestart={() => setView(returnTo)}
              mode={viewingSession?.mode}
              date={viewingSession?.date}
              isHistory={returnTo === 'history'}
            />
          </motion.div>
        )}

        {view === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-3xl mx-auto px-6 py-12 space-y-8"
          >
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setView('home')}
                className="flex items-center space-x-2 text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Home</span>
              </button>
              <h1 className="text-3xl font-bold">Performance History</h1>
            </div>

            <div className="space-y-4">
              {history.length > 0 ? history.map((session) => (
                <div 
                  key={session.id} 
                  onClick={() => handleViewDetails(session)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleViewDetails(session);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="w-full bg-white border border-zinc-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex flex-col items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                      <span className="text-2xl font-black">{session.bandScore}</span>
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Band</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{session.mode.replace('_', ' ')}</h3>
                      <div className="flex items-center space-x-4 text-sm text-zinc-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(session.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{session.stressLevel} Stress</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="px-6 py-3 rounded-2xl bg-zinc-50 text-zinc-600 font-bold text-sm group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                      View Details
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                      className="p-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-20 space-y-4">
                  <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
                    <HistoryIcon className="w-10 h-10 text-zinc-300" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">No history yet</h3>
                    <p className="text-zinc-400">Complete your first test to see your progress here.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {view === 'tips' && (
          <TipsView onBack={() => setView('home')} />
        )}
      </AnimatePresence>
      </div>
      <footer className="py-6 text-center text-zinc-400 text-sm">
        <p>Developed by <span className="font-bold text-zinc-600">Eiaman</span></p>
      </footer>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userName={userName}
        setUserName={setUserName}
        targetBand={targetBand}
        setTargetBand={setTargetBand}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
