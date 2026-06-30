"use client";

import React, { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { 
  Zap, 
  Timer, 
  BrainCircuit, 
  BookOpen, 
  Coffee, 
  Play, 
  Pause, 
  RotateCcw,
  Sparkles,
  ChevronRight
} from "lucide-react";

export default function StudyBoostPage() {
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [activeTab, setActiveTab] = useState<"focus" | "flashcards" | "ai">("focus");

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
    // Note: Actual interval logic would go here in a real app (e.g., using useEffect)
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(25 * 60);
  };

  return (
    <PortalLayout 
      title="Study Boost" 
      subtitle="Supercharge your focus and memory with AI-powered tools."
      avatarLetter="A"
      avatarColor="#ef4444"
      themeClass="theme-student"
      accentColor="#ef4444"
    >
      <div className="max-w-7xl mx-auto space-y-6 mt-6">
        
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-red-600 to-rose-500 rounded-[2rem] p-8 md:p-12 overflow-hidden text-white shadow-xl shadow-red-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-400/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm font-bold backdrop-blur-md mb-4 border border-white/30">
                <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" /> High-Performance Mode
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                Unlock Your Brain's <br /> Full Potential
              </h1>
              <p className="text-red-100 text-lg font-medium">
                Use scientifically proven methods like Pomodoro timers, spaced repetition, and AI summaries to maximize your study sessions.
              </p>
            </div>
            <div className="shrink-0">
              <div className="w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-2xl">
                <BrainCircuit className="w-16 h-16 md:w-24 md:h-24 text-white drop-shadow-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Tools Tabs */}
        <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar">
          <button 
            onClick={() => setActiveTab("focus")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${activeTab === "focus" ? "bg-red-500 text-white shadow-md shadow-red-500/20" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
          >
            <Timer className="w-5 h-5" /> Focus Timer
          </button>
          <button 
            onClick={() => setActiveTab("flashcards")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${activeTab === "flashcards" ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
          >
            <BookOpen className="w-5 h-5" /> Flashcards
          </button>
          <button 
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${activeTab === "ai" ? "bg-violet-500 text-white shadow-md shadow-violet-500/20" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
          >
            <Sparkles className="w-5 h-5" /> AI Quick Summaries
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Area */}
          <div className="lg:col-span-2">
            
            {activeTab === "focus" && (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm text-center relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-50 dark:bg-red-900/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Pomodoro Session</h2>
                <p className="text-slate-500 mb-8 font-medium">Focus for 25 minutes, then take a 5-minute break.</p>
                
                <div className="w-64 h-64 mx-auto bg-gradient-to-tr from-red-100 to-rose-50 dark:from-red-900/20 dark:to-rose-900/10 rounded-full flex items-center justify-center mb-8 border-4 border-white dark:border-slate-800 shadow-xl shadow-red-500/10 relative">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-700" />
                    <circle 
                      cx="128" cy="128" r="120" 
                      stroke="currentColor" strokeWidth="8" fill="transparent" 
                      strokeDasharray="753.98" 
                      strokeDashoffset={753.98 - (timeLeft / (25 * 60)) * 753.98} 
                      strokeLinecap="round"
                      className="text-red-500 transition-all duration-1000"
                    />
                  </svg>
                  <span className="text-6xl font-black text-slate-800 dark:text-white font-mono tracking-tighter">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                
                <div className="flex items-center justify-center gap-4">
                  <button 
                    onClick={toggleTimer}
                    className="w-16 h-16 bg-red-600 hover:bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
                  >
                    {timerRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                  </button>
                  <button 
                    onClick={resetTimer}
                    className="w-16 h-16 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-2xl flex items-center justify-center transition-all"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "flashcards" && (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                 <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6">Quick Flashcards</h2>
                 
                 <div className="group perspective">
                   <div className="w-full h-64 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center text-center p-8 cursor-pointer shadow-lg shadow-rose-500/20 transition-all duration-500 relative transform-style-3d hover:scale-[1.02]">
                     <div className="absolute top-4 right-4 text-white/50 text-sm font-bold">Tap to flip</div>
                     <h3 className="text-3xl font-black text-white drop-shadow-md">What is Mitochondria?</h3>
                   </div>
                 </div>
                 
                 <div className="flex justify-between mt-8">
                   <button className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Previous</button>
                   <span className="font-bold text-slate-400 self-center">Card 1 / 15</span>
                   <button className="px-6 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-500 shadow-md shadow-rose-600/20 transition-colors">Next Card</button>
                 </div>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-400">
                     <Sparkles className="w-6 h-6" />
                   </div>
                   <div>
                     <h2 className="text-2xl font-black text-slate-800 dark:text-white">AI Quick Summaries</h2>
                     <p className="text-sm text-slate-500 font-medium">Too long to read? Let AI break it down.</p>
                   </div>
                 </div>
                 
                 <textarea 
                   className="w-full h-40 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none font-medium"
                   placeholder="Paste an article, paragraph, or concept here..."
                 ></textarea>
                 
                 <div className="mt-4 flex justify-end">
                   <button className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-violet-600/20 transition-all hover:-translate-y-0.5">
                     <Zap className="w-4 h-4 fill-current" /> Generate Summary
                   </button>
                 </div>
              </div>
            )}
            
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Brain Breaks */}
            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border-2 border-emerald-100 dark:border-emerald-800/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Coffee className="w-5 h-5" />
                </div>
                <h3 className="font-black text-emerald-800 dark:text-emerald-400">Brain Breaks</h3>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-emerald-100 dark:border-slate-700 cursor-pointer hover:border-emerald-300 transition-colors">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">4-7-8 Breathing</h4>
                  <p className="text-xs text-slate-500 mt-1">Calm your nerves before an exam (3 mins)</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-emerald-100 dark:border-slate-700 cursor-pointer hover:border-emerald-300 transition-colors">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">Eye Strain Relief</h4>
                  <p className="text-xs text-slate-500 mt-1">The 20-20-20 rule for digital screens (1 min)</p>
                </div>
              </div>
            </div>

            {/* Daily Streak */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
               <div className="text-4xl mb-2">🔥</div>
               <h3 className="font-black text-slate-800 dark:text-white text-xl">5 Day Streak!</h3>
               <p className="text-sm text-slate-500 font-medium mb-4">You're building great study habits.</p>
               
               <div className="flex justify-center gap-2">
                 {['M','T','W','T','F','S','S'].map((day, i) => (
                   <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i < 5 ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-slate-50 dark:bg-slate-700 text-slate-400'}`}>
                     {day}
                   </div>
                 ))}
               </div>
            </div>

          </div>

        </div>

      </div>
    </PortalLayout>
  );
}
