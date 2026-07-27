"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";

// Helper component for Flaticons matching CDN setup in RootLayout
const Icon = ({ name, type = "rr", className = "" }: { name: string; type?: "rr" | "sr"; className?: string }) => (
  <i className={`fi fi-${type}-${name} inline-flex items-center justify-center leading-none ${className}`} />
);

// Syllabus presets for 9th and 10th Standard students (Tamil Nadu State Board context)
const CLASS_SPECIFIC_CONTENT: Record<string, {
  flashcards: { question: string; answer: string; category: string }[];
  examTips: { title: string; desc: string; category: string }[];
  subjects: string[];
}> = {
  "9": {
    subjects: ["Mathematics", "Science", "Social Science", "Tamil", "English"],
    examTips: [
      { title: "Algebra Foundations", desc: "Spend 15 mins daily practicing algebraic identities and coordinate geometry.", category: "Maths" },
      { title: "Science Experiments", desc: "Revise lab diagrams and practical units as they carry direct questions.", category: "Science" },
      { title: "Grammar & Vocab", desc: "Practice paragraph writing and grammar rules for Tamil and English papers.", category: "Language" }
    ],
    flashcards: [
      { question: "What is Newton's First Law?", answer: "An object remains at rest or in uniform motion unless acted upon by an external force.", category: "Physics" },
      { question: "What is the SI unit of force?", answer: "Newton (N), defined as 1 kg·m/s².", category: "Physics" },
      { question: "What is the cell membrane?", answer: "The semipermeable membrane surrounding the cytoplasm of a cell.", category: "Biology" },
      { question: "Define rational numbers.", answer: "Any number that can be expressed as the quotient or fraction p/q of two integers (q ≠ 0).", category: "Maths" },
      { question: "What is acceleration?", answer: "The rate of change of velocity per unit of time (a = (v - u)/t).", category: "Physics" }
    ]
  },
  "10": {
    subjects: ["Mathematics", "Science", "Social Science", "Tamil", "English"],
    examTips: [
      { title: "SSLC Board Blueprint", desc: "Prioritize high-weightage topics like Trigonometry, Geometry, and Electromagnetism.", category: "Strategy" },
      { title: "Time Management", desc: "Solve previous years' question papers under a strict 3-hour exam limit.", category: "Exams" },
      { title: "Diagram Presentation", desc: "Draw biology and circuit diagrams with sharp pencil lines and neat label alignments.", category: "Presentation" }
    ],
    flashcards: [
      { question: "What is Ohm's Law?", answer: "V = IR (Voltage = Current × Resistance).", category: "Physics" },
      { question: "Write the quadratic formula.", answer: "x = (-b ± √(b² - 4ac)) / 2a", category: "Maths" },
      { question: "What is the function of Xylem?", answer: "It transports water and dissolved minerals from roots to the rest of the plant.", category: "Biology" },
      { question: "What is a covalent bond?", answer: "A chemical bond formed by the sharing of one or more electron pairs between atoms.", category: "Chemistry" },
      { question: "What was the date of the Revolt of 1857?", answer: "May 10, 1857 (initiated at Meerut).", category: "History" }
    ]
  }
};

export default function StudyBoostPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const studentClass = user?.class === "9" ? "9" : "10"; // Default to 10th standard

  const currentData = CLASS_SPECIFIC_CONTENT[studentClass];

  // Pomodoro Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(25 * 60); // Default 25 mins
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [activeTab, setActiveTab] = useState<"focus" | "flashcards" | "ai">("focus");

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // AI input state
  const [aiText, setAiText] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Brain Breaks state
  const [activeBreak, setActiveBreak] = useState<{ title: string; desc: string; duration: number } | null>(null);
  const [breakTimeLeft, setBreakTimeLeft] = useState(0);
  const [breakTimerRunning, setBreakTimerRunning] = useState(false);
  const [streakDays, setStreakDays] = useState(['M', 'T', 'W', 'T', 'F']);

  // Focus timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timeLeft]);

  // Break timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (breakTimerRunning && breakTimeLeft > 0) {
      interval = setInterval(() => {
        setBreakTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (breakTimeLeft === 0 && breakTimerRunning) {
      setBreakTimerRunning(false);
      setActiveBreak(null);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [breakTimerRunning, breakTimeLeft]);

  const startBreak = (title: string, desc: string, duration: number) => {
    setActiveBreak({ title, desc, duration });
    setBreakTimeLeft(duration);
    setBreakTimerRunning(true);
  };

  const closeBreak = () => {
    setActiveBreak(null);
    setBreakTimerRunning(false);
  };

  const setTimerPreset = (minutes: number) => {
    setTimerRunning(false);
    setSessionDuration(minutes * 60);
    setTimeLeft(minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(sessionDuration);
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % currentData.flashcards.length);
    }, 150);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev - 1 + currentData.flashcards.length) % currentData.flashcards.length);
    }, 150);
  };

  const generateSummary = async () => {
    if (!aiText.trim()) return;
    setGenerating(true);
    setAiSummary("");
    setCopied(false);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/ai/chat-tutor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          subject: "General Study",
          grade: `Class ${studentClass}th`,
          messages: [],
          currentMessage: `Please explain this concept, term, or textbook text in a clear, pedagogical way (in both Tamil and English, with definitions and context): "${aiText}"`,
          language: "bilingual"
        })
      });
      const data = await res.json();
      if (data.success) {
        setAiSummary(data.text);
      } else {
        setAiSummary("Failed to generate summary: " + (data.error || "unknown error"));
      }
    } catch (err: any) {
      setAiSummary("Network error: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!aiSummary) return;
    navigator.clipboard.writeText(aiSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PortalLayout 
      title="Study Boost" 
      subtitle={`Supercharge focus and memory with AI tools customized for Class ${studentClass}th Standard.`}
      avatarLetter="A"
      avatarColor="#4f46e5"
      themeClass="theme-student"
      accentColor="#4f46e5"
    >
      <div className="max-w-7xl mx-auto space-y-6 mt-6 font-sans text-slate-800 dark:text-slate-100">
        
        {/* Soft Light Pastel Hero Banner */}
        <div 
          style={{ background: "linear-gradient(135deg, #eef2ff 0%, #f3e8ff 50%, #fae8ff 100%)" }}
          className="relative rounded-3xl p-8 md:p-10 overflow-hidden shadow-sm border border-indigo-100/80 dark:border-indigo-900/40"
        >
          {/* Subtle Ambient Orbs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-purple-200/30 rounded-full blur-2xl translate-y-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-100 dark:bg-indigo-950/60 rounded-full text-xs font-bold tracking-wider uppercase border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-sm">
                <Icon name="bolt" type="sr" className="text-amber-500 text-sm" /> 
                Class {studentClass}th Board Exam Hub
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
                Unlock Your Brain's <br /> 
                <span className="text-indigo-600 dark:text-indigo-400 font-black">
                  Full Potential
                </span>
              </h1>
              
              <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg font-medium leading-relaxed max-w-xl">
                Scientifically engineered for Tamil Nadu High School students. Boost memory retention using Pomodoro timers, active recall flashcards, and instant AI summaries.
              </p>

              {/* Feature Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-slate-700 shadow-sm">
                  <Icon name="stopwatch" className="text-indigo-500 text-sm" /> Pomodoro Timer
                </div>
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-slate-700 shadow-sm">
                  <Icon name="book-alt" className="text-amber-500 text-sm" /> Syllabus Flashcards
                </div>
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-slate-700 shadow-sm">
                  <Icon name="stars" className="text-emerald-500 text-sm" /> AI Explanations
                </div>
              </div>
            </div>

            {/* Compact Graphic Card with Gold Trophy Flaticon */}
            <div className="shrink-0 relative group">
              <div 
                style={{ background: "linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)" }}
                className="w-28 h-28 md:w-32 md:h-32 rounded-2xl flex items-center justify-center border border-indigo-200/80 shadow-md transition-transform duration-300 group-hover:scale-105"
              >
                <Icon name="trophy" type="sr" className="text-amber-500 text-4xl md:text-5xl drop-shadow-sm" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white rounded-xl p-2 shadow-sm border border-white">
                <Icon name="sparkles" type="sr" className="text-sm text-amber-300" />
              </div>
            </div>
          </div>
        </div>

        {/* High-Contrast Tab Navigation Strip */}
        <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex overflow-x-auto gap-2 hide-scrollbar">
          <button 
            onClick={() => setActiveTab("focus")}
            style={{ 
              backgroundColor: activeTab === "focus" ? "#4f46e5" : undefined,
              color: activeTab === "focus" ? "#ffffff" : undefined 
            }}
            className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-black text-sm whitespace-nowrap transition-all duration-200 ${
              activeTab === "focus" 
                ? "shadow-lg shadow-indigo-600/30 scale-[1.01]" 
                : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700"
            }`}
          >
            <Icon name="stopwatch" type={activeTab === "focus" ? "sr" : "rr"} className={`text-lg ${activeTab === "focus" ? "text-amber-300" : "text-indigo-600 dark:text-indigo-400"}`} /> 
            Focus Timer
          </button>
          
          <button 
            onClick={() => { setActiveTab("flashcards"); setIsFlipped(false); }}
            style={{ 
              backgroundColor: activeTab === "flashcards" ? "#7c3aed" : undefined,
              color: activeTab === "flashcards" ? "#ffffff" : undefined 
            }}
            className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-black text-sm whitespace-nowrap transition-all duration-200 ${
              activeTab === "flashcards" 
                ? "shadow-lg shadow-purple-600/30 scale-[1.01]" 
                : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700"
            }`}
          >
            <Icon name="book-alt" type={activeTab === "flashcards" ? "sr" : "rr"} className={`text-lg ${activeTab === "flashcards" ? "text-amber-300" : "text-purple-600 dark:text-purple-400"}`} /> 
            Syllabus Flashcards
          </button>
          
          <button 
            onClick={() => setActiveTab("ai")}
            style={{ 
              backgroundColor: activeTab === "ai" ? "#9333ea" : undefined,
              color: activeTab === "ai" ? "#ffffff" : undefined 
            }}
            className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-black text-sm whitespace-nowrap transition-all duration-200 ${
              activeTab === "ai" 
                ? "shadow-lg shadow-violet-600/30 scale-[1.01]" 
                : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700"
            }`}
          >
            <Icon name="stars" type={activeTab === "ai" ? "sr" : "rr"} className={`text-lg ${activeTab === "ai" ? "text-amber-300" : "text-violet-600 dark:text-violet-400"}`} /> 
            AI Quick Summaries
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Workspace */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Focus Timer View */}
            {activeTab === "focus" && (
              <div className="bg-white dark:bg-slate-800/90 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm text-center relative overflow-hidden backdrop-blur-md">
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex items-center justify-between mb-6">
                  <div className="text-left">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      <Icon name="stopwatch" type="sr" className="text-indigo-600 dark:text-indigo-400 text-xl" />
                      Pomodoro Focus Session
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Study with deep concentration and timed breaks.</p>
                  </div>
                  
                  {/* Preset Durations */}
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/60 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-600/50">
                    {[
                      { label: "25m", mins: 25 },
                      { label: "5m", mins: 5 },
                      { label: "15m", mins: 15 }
                    ].map((preset) => (
                      <button
                        key={preset.mins}
                        onClick={() => setTimerPreset(preset.mins)}
                        style={{ 
                          backgroundColor: sessionDuration === preset.mins * 60 ? "#4f46e5" : undefined,
                          color: sessionDuration === preset.mins * 60 ? "#ffffff" : undefined 
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          sessionDuration === preset.mins * 60 
                            ? "shadow-sm" 
                            : "text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-600/70"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Circular Progress Ring */}
                <div className="relative w-64 h-64 mx-auto my-8 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle 
                      cx="128" 
                      cy="128" 
                      r="115" 
                      stroke="currentColor" 
                      strokeWidth="10" 
                      fill="transparent" 
                      className="text-slate-100 dark:text-slate-700/60" 
                    />
                    <circle 
                      cx="128" 
                      cy="128" 
                      r="115" 
                      stroke="url(#indigoGradient)" 
                      strokeWidth="10" 
                      fill="transparent" 
                      strokeDasharray="722.56" 
                      strokeDashoffset={722.56 - (timeLeft / sessionDuration) * 722.56} 
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-linear drop-shadow-md"
                    />
                    <defs>
                      <linearGradient id="indigoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div className="flex flex-col items-center justify-center z-10 space-y-1">
                    <span className="text-6xl font-black text-slate-900 dark:text-white font-mono tracking-tighter drop-shadow-sm">
                      {formatTime(timeLeft)}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      {timerRunning ? "Session in Progress" : "Paused"}
                    </span>
                  </div>
                </div>
                
                {/* Timer Controls */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <button 
                    onClick={toggleTimer}
                    style={{ background: timerRunning ? "#334155" : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <Icon name={timerRunning ? "pause" : "play"} type="sr" className="text-2xl text-white" />
                  </button>

                  <button 
                    onClick={resetTimer}
                    title="Reset Timer"
                    className="w-16 h-16 bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600 text-indigo-600 dark:text-indigo-300 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 border border-slate-200/60 dark:border-slate-600/50"
                  >
                    <Icon name="refresh" className="text-xl" />
                  </button>
                </div>
              </div>
            )}

            {/* Syllabus Flashcards View */}
            {activeTab === "flashcards" && (
              <div className="bg-white dark:bg-slate-800/90 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm relative overflow-hidden backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      <Icon name="book-alt" type="sr" className="text-purple-600 dark:text-purple-400 text-xl" />
                      Class {studentClass} Syllabus Flashcards
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Test active recall on board exam core concepts.</p>
                  </div>
                  <div className="px-3.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center gap-1.5">
                    <Icon name="layer-group" className="text-xs text-purple-600" />
                    {currentData.flashcards[currentCardIndex].category}
                  </div>
                </div>

                {/* Clean White Interactive Flashcard Container */}
                <div 
                  onClick={() => setIsFlipped(!isFlipped)} 
                  style={{ background: "#ffffff" }}
                  className="w-full min-h-[17rem] rounded-3xl p-8 cursor-pointer shadow-xl transition-all duration-300 transform relative flex flex-col justify-between overflow-hidden border-2 border-indigo-100 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-2xl"
                >
                  <div className="flex justify-between items-center z-10">
                    <span 
                      style={{ 
                        backgroundColor: isFlipped ? "#f3e8ff" : "#eef2ff",
                        color: isFlipped ? "#7c3aed" : "#4f46e5" 
                      }} 
                      className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-indigo-200/70"
                    >
                      {isFlipped ? "Answer Side" : "Question Side"}
                    </span>
                    
                    <div style={{ color: "#4f46e5" }} className="flex items-center gap-1.5 text-xs font-bold">
                      <Icon name="rotate-right" className="text-sm text-indigo-600" /> Tap card to flip
                    </div>
                  </div>

                  <div className="my-auto py-6 text-center z-10">
                    <h3 style={{ color: "#0f172a" }} className="text-2xl md:text-3xl font-black leading-snug max-w-xl mx-auto text-slate-900 dark:text-white">
                      {isFlipped 
                        ? currentData.flashcards[currentCardIndex].answer 
                        : currentData.flashcards[currentCardIndex].question
                      }
                    </h3>
                  </div>

                  <div className="flex justify-between items-center z-10 text-xs font-medium">
                    <span style={{ color: "#64748b" }} className="text-slate-500">Tamil Nadu State Board Standard {studentClass}</span>
                    <Icon name="sparkles" type="sr" className="text-amber-500 text-base" />
                  </div>
                </div>

                {/* Card Controls */}
                <div className="flex justify-between items-center mt-8">
                  <button 
                    onClick={handlePrevCard}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 text-sm border border-slate-200/60 dark:border-slate-600/50"
                  >
                    <Icon name="angle-left" className="text-sm text-indigo-600" /> Previous
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Card {currentCardIndex + 1} of {currentData.flashcards.length}
                    </span>
                  </div>

                  <button 
                    onClick={handleNextCard}
                    style={{ background: "#7c3aed", color: "#ffffff" }}
                    className="px-5 py-2.5 text-white font-bold rounded-xl shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 text-sm hover:bg-purple-500"
                  >
                    Next Card <Icon name="angle-right" className="text-sm text-amber-300" />
                  </button>
                </div>
              </div>
            )}

            {/* AI Quick Summaries View */}
            {activeTab === "ai" && (
              <div className="bg-white dark:bg-slate-800/90 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                    <Icon name="stars" type="sr" className="text-2xl text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">AI Quick Summaries</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Bilingual concept simplifier for Class {studentClass} Board syllabus.</p>
                  </div>
                </div>

                {/* Quick Hint Card */}
                <div className="mb-5 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/40 rounded-2xl border border-violet-100 dark:border-violet-900/50 text-xs text-violet-900 dark:text-violet-200 font-medium flex items-start gap-3">
                  <Icon name="bulb" type="sr" className="text-amber-500 text-lg shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Paste any textbook paragraph, exam question, or science definition. Click <strong>Generate Summary</strong> to get instant key points in Tamil & English.
                  </p>
                </div>

                <textarea 
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  className="w-full h-40 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none font-medium text-sm leading-relaxed"
                  placeholder="Paste complex textbook paragraphs or questions here..."
                ></textarea>

                {/* Subject Shortcuts */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {currentData.subjects.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setAiText(`Explain the core topic of ${sub} from the Class ${studentClass} textbook.`)}
                        className="text-xs bg-slate-100 dark:bg-slate-700/70 hover:bg-violet-100 dark:hover:bg-violet-900/40 text-slate-800 dark:text-slate-200 hover:text-violet-700 dark:hover:text-violet-300 font-bold px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-600/50 hover:border-violet-300 transition-colors"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={generateSummary}
                    disabled={generating || !aiText.trim()}
                    style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)", color: "#ffffff" }}
                    className="px-6 py-3 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-violet-600/20 transition-all hover:-translate-y-0.5 text-sm"
                  >
                    <Icon name="bolt" type="sr" className="text-amber-300 text-sm" /> 
                    {generating ? "Summarizing..." : "Generate Summary"}
                  </button>
                </div>

                {/* AI Result Card */}
                {aiSummary && (
                  <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-900/90 rounded-2xl border border-violet-200 dark:border-violet-900/50 relative shadow-inner">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <span className="text-xs font-bold text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
                        <Icon name="sparkles" type="sr" className="text-sm text-violet-600" /> AI Explanation (Bilingual)
                      </span>
                      
                      <button 
                        onClick={copyToClipboard}
                        className="text-xs bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-violet-50 dark:hover:bg-violet-950/60 hover:text-violet-700 dark:hover:text-violet-300 hover:border-violet-300 transition-colors flex items-center gap-1"
                      >
                        <Icon name="copy" className="text-xs text-indigo-600" /> {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>

                    <div className="text-slate-800 dark:text-slate-200 whitespace-pre-line font-medium text-sm leading-relaxed">
                      {aiSummary}
                    </div>
                  </div>
                )}
              </div>
            )}
            
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Class Specific Board Exam Tips */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-500/10 dark:bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/50">
                  <Icon name="bulb" type="sr" className="text-xl text-amber-500" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-lg">Class {studentClass} Board Tips</h3>
              </div>
              
              <div className="space-y-3">
                {currentData.examTips.map((tip, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <Icon name="award" type="sr" className="text-amber-500 text-sm" /> 
                      {tip.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 font-medium leading-relaxed">
                      {tip.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Brain Breaks Card */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50">
                  <Icon name="mug-hot" type="sr" className="text-xl text-emerald-600" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-lg">Brain Breaks</h3>
              </div>
              
              <div className="space-y-3">
                <div 
                  onClick={() => startBreak("4-7-8 Breathing", "Inhale for 4s, hold for 7s, exhale for 8s.", 180)}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 transition-all hover:scale-[1.02] flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                      <Icon name="wind" className="text-emerald-500 text-xs" /> 4-7-8 Breathing
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">Calm exam stress (3 mins)</p>
                  </div>
                  <Icon name="play-circle" type="sr" className="text-emerald-500 text-xl" />
                </div>

                <div 
                  onClick={() => startBreak("Eye Strain Relief", "Focus on an object 20 feet away to relax eye muscles.", 60)}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 transition-all hover:scale-[1.02] flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                      <Icon name="eye" className="text-teal-500 text-xs" /> Eye Strain Relief
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">20-20-20 rule (1 min)</p>
                  </div>
                  <Icon name="play-circle" type="sr" className="text-emerald-500 text-xl" />
                </div>
              </div>
            </div>

            {/* Streak Counter Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm text-center">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/60 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-200/50 dark:border-amber-900/50">
                <Icon name="flame" type="sr" className="text-3xl text-amber-500" />
              </div>
              
              <h3 className="font-black text-slate-900 dark:text-white text-xl">{streakDays.length} Day Streak!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">Consistency is key to scoring 90%+ in Board Exams.</p>
              
              <div className="flex justify-center gap-2">
                {['M','T','W','T','F','S','S'].map((day, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      if (!streakDays.includes(day) && streakDays.length <= i) {
                        setStreakDays([...streakDays, day]);
                      }
                    }}
                    style={{ background: streakDays.length > i ? "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)" : undefined, color: streakDays.length > i ? "#ffffff" : undefined }}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all hover:scale-110 ${
                      streakDays.length > i 
                        ? 'shadow-md shadow-amber-500/20' 
                        : 'bg-slate-100 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-950/50 hover:text-amber-600 dark:hover:text-amber-400'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Brain Break Active Modal */}
      {activeBreak && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl text-center relative border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
            <button 
              onClick={closeBreak} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <Icon name="cross" className="text-lg" />
            </button>

            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
              <Icon name="mug-hot" type="sr" className="text-3xl text-emerald-500" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{activeBreak.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-medium leading-relaxed">{activeBreak.desc}</p>
            
            <div className="text-5xl font-black font-mono tracking-tighter text-emerald-600 dark:text-emerald-400 mb-8">
              {formatTime(breakTimeLeft)}
            </div>
            
            <button 
              onClick={closeBreak}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/25 text-sm"
            >
              End Break Early
            </button>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
