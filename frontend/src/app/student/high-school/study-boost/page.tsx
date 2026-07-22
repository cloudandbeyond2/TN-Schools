"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
// Removed lucide-react imports, using Flaticon instead
const Icon = ({ name, className = "" }: { name: string; className?: string }) => (
  <i className={`fi fi-rr-${name} inline-flex items-center justify-center leading-none ${className}`} />
);

// Syllabus presets for 9th and 10th Standard students (Tamil Nadu State Board context)
const CLASS_SPECIFIC_CONTENT: Record<string, {
  flashcards: { question: string; answer: string }[];
  examTips: { title: string; desc: string }[];
  subjects: string[];
}> = {
  "9": {
    subjects: ["Mathematics", "Science", "Social Science", "Tamil", "English"],
    examTips: [
      { title: "Algebra Foundations", desc: "Spend 15 mins daily practicing algebraic identities and coordinate geometry." },
      { title: "Science Experiments", desc: "Revise lab diagrams and practical units as they carry direct questions." },
    ],
    flashcards: [
      { question: "What is Newton's First Law?", answer: "An object remains at rest or in uniform motion unless acted upon by an external force." },
      { question: "What is the SI unit of force?", answer: "Newton (N)" },
      { question: "What is the cell membrane?", answer: "The semipermeable membrane surrounding the cytoplasm of a cell." },
      { question: "Define rational numbers.", answer: "Any number that can be expressed as the quotient or fraction p/q of two integers." },
      { question: "What is acceleration?", answer: "The rate of change of velocity per unit of time." }
    ]
  },
  "10": {
    subjects: ["Mathematics", "Science", "Social Science", "Tamil", "English"],
    examTips: [
      { title: "SSLC Board Blueprint", desc: "Prioritize high-weightage topics like Trigonometry, Geometry, and Electromagnetism." },
      { title: "Time Management", desc: "Solve previous years' question papers under a strict 3-hour limit." },
    ],
    flashcards: [
      { question: "What is Ohm's Law?", answer: "V = IR (Voltage = Current × Resistance)." },
      { question: "Write the quadratic formula.", answer: "x = (-b ± √(b² - 4ac)) / 2a" },
      { question: "What is the function of the Xylem?", answer: "It transports water and dissolved minerals from roots to the rest of the plant." },
      { question: "What is a covalent bond?", answer: "A chemical bond formed by the sharing of one or more electron pairs between atoms." },
      { question: "What was the date of the Revolt of 1857?", answer: "May 10, 1857 (initiated at Meerut)." }
    ]
  }
};

export default function StudyBoostPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const studentClass = user?.class === "9" ? "9" : "10"; // Default to 10th standard

  const currentData = CLASS_SPECIFIC_CONTENT[studentClass];

  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [activeTab, setActiveTab] = useState<"focus" | "flashcards" | "ai">("focus");

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // AI input state
  const [aiText, setAiText] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [generating, setGenerating] = useState(false);

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
      alert("Brain break finished! Good job.");
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
    setTimeLeft(25 * 60);
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

  return (
    <PortalLayout 
      title="Study Boost" 
      subtitle={`Supercharge focus and memory with AI tools customized for Class ${studentClass}th Standard.`}
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
                <Icon name="bolt" className="text-yellow-300 text-sm" /> Class {studentClass} Board Mode
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                Unlock Your Brain's <br /> Full Potential
              </h1>
              <p className="text-red-100 text-lg font-medium">
                Using scientifically proven methods like Pomodoro timers, active recall flashcards, and AI-powered quick summaries tailored to Class {studentClass}th standard.
              </p>
            </div>
            <div className="shrink-0">
              <div className="w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-2xl">
                <Icon name="brain" className="text-white text-6xl md:text-8xl drop-shadow-md" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar">
          <button 
            onClick={() => setActiveTab("focus")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${activeTab === "focus" ? "bg-red-500 text-white shadow-md shadow-red-500/20" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
          >
            <Icon name="stopwatch" className="text-lg" /> Focus Timer
          </button>
          <button 
            onClick={() => { setActiveTab("flashcards"); setIsFlipped(false); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${activeTab === "flashcards" ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
          >
            <Icon name="book-alt" className="text-lg" /> Syllabus Flashcards
          </button>
          <button 
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${activeTab === "ai" ? "bg-violet-500 text-white shadow-md shadow-violet-500/20" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
          >
            <Icon name="stars" className="text-lg" /> AI Quick Summaries
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
                
                <div className="w-64 h-64 mx-auto bg-gradient-to-tr from-red-100 to-rose-55 dark:from-red-900/20 dark:to-rose-900/10 rounded-full flex items-center justify-center mb-8 border-4 border-white dark:border-slate-800 shadow-xl shadow-red-500/10 relative">
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
                    {timerRunning ? <Icon name="pause" className="text-3xl" /> : <Icon name="play" className="text-3xl ml-1" />}
                  </button>
                  <button 
                    onClick={resetTimer}
                    className="w-16 h-16 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-2xl flex items-center justify-center transition-all"
                  >
                    <Icon name="refresh" className="text-xl" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "flashcards" && (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Class {studentClass} Syllabus Flashcards</h2>
                <p className="text-slate-500 mb-6 font-medium">Use active recall to test your knowledge on board syllabus concepts.</p>
                 
                <div 
                  onClick={() => setIsFlipped(!isFlipped)} 
                  className={`w-full h-64 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex flex-col items-center justify-center text-center p-8 cursor-pointer shadow-lg shadow-rose-500/20 transition-all duration-300 transform relative ${isFlipped ? "rotate-y-180" : ""}`}
                >
                  <div className="absolute top-4 right-4 text-white/60 text-xs font-bold uppercase tracking-wider">
                    {isFlipped ? "Answer (Tap to flip)" : "Question (Tap to reveal)"}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white drop-shadow-md max-w-lg">
                    {isFlipped 
                      ? currentData.flashcards[currentCardIndex].answer 
                      : currentData.flashcards[currentCardIndex].question
                    }
                  </h3>
                </div>
                 
                <div className="flex justify-between items-center mt-8">
                  <button 
                    onClick={handlePrevCard}
                    className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="font-bold text-slate-400">
                    Card {currentCardIndex + 1} / {currentData.flashcards.length}
                  </span>
                  <button 
                    onClick={handleNextCard}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-550 text-white font-bold rounded-xl hover:bg-rose-500 shadow-md shadow-rose-600/20 transition-colors"
                  >
                    Next Card
                  </button>
                </div>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-400">
                    <Icon name="stars" className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">AI Quick Summaries</h2>
                    <p className="text-sm text-slate-500 font-medium">Get simplified concepts matching Class {studentClass} Board level guidelines.</p>
                  </div>
                </div>

                <div className="mb-5 p-4 bg-violet-50/50 dark:bg-violet-950/20 rounded-2xl border border-violet-100/50 dark:border-violet-900/30 text-xs text-violet-750 dark:text-violet-300 font-medium leading-relaxed">
                  💡 <strong>Quick Hint:</strong> Paste any textbook paragraph, question, or topic in the box below. Click <strong>Generate Summary</strong> to extract the key definitions, exam formulas, and core takeaways instantly.
                </div>
                 
                <textarea 
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  className="w-full h-40 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none font-medium"
                  placeholder="Paste complex textbook paragraphs or questions here..."
                ></textarea>
                 
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex gap-2">
                    {currentData.subjects.slice(0, 3).map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setAiText(`Explain the core topic of ${sub} from the Class ${studentClass} textbook.`)}
                        className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold px-3 py-1.5 rounded-lg hover:bg-slate-200"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={generateSummary}
                    disabled={generating || !aiText.trim()}
                    className="px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-violet-600/20 transition-all hover:-translate-y-0.5"
                  >
                    <Icon name="bolt" className="text-sm" /> 
                    {generating ? "Summarizing..." : "Generate Summary"}
                  </button>
                </div>

                {aiSummary && (
                  <div className="mt-6 p-5 bg-violet-50 dark:bg-violet-950/20 rounded-2xl border border-violet-100 dark:border-violet-900/30 text-slate-750 dark:text-slate-300 whitespace-pre-line font-medium leading-relaxed">
                    {aiSummary}
                  </div>
                )}
              </div>
            )}
            
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Class Specific Exam Tips */}
            <div className="bg-red-50 dark:bg-red-950/15 p-6 rounded-3xl border-2 border-red-100 dark:border-red-900/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400">
                  <Icon name="book-bookmark" className="text-lg" />
                </div>
                <h3 className="font-black text-red-800 dark:text-red-400">Class {studentClass} Board Tips</h3>
              </div>
              
              <div className="space-y-3">
                {currentData.examTips.map((tip, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-red-100 dark:border-slate-700/50">
                    <h4 className="font-bold text-slate-850 dark:text-white text-sm flex items-center gap-1.5">
                      <Icon name="award" className="text-amber-500 text-sm" /> {tip.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">{tip.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Brain Breaks */}
            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border-2 border-emerald-100 dark:border-emerald-800/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Icon name="mug-hot" className="text-lg" />
                </div>
                <h3 className="font-black text-emerald-800 dark:text-emerald-400">Brain Breaks</h3>
              </div>
              
              <div className="space-y-3">
                <div 
                  onClick={() => startBreak("4-7-8 Breathing", "Inhale for 4s, hold for 7s, exhale for 8s.", 180)}
                  className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-emerald-100 dark:border-slate-700 cursor-pointer hover:border-emerald-300 transition-colors"
                >
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">4-7-8 Breathing</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Calm your nerves before an exam (3 mins)</p>
                </div>
                <div 
                  onClick={() => startBreak("Eye Strain Relief", "Look at something 20 feet away.", 60)}
                  className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-emerald-100 dark:border-slate-700 cursor-pointer hover:border-emerald-300 transition-colors"
                >
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">Eye Strain Relief</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">The 20-20-20 rule for digital screens (1 min)</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
               <div className="text-4xl mb-2">🔥</div>
               <h3 className="font-black text-slate-800 dark:text-white text-xl">{streakDays.length} Day Streak!</h3>
               <p className="text-sm text-slate-500 font-medium mb-4">You're building great study habits.</p>
               
               <div className="flex justify-center gap-2">
                 {['M','T','W','T','F','S','S'].map((day, i) => (
                   <button 
                     key={i} 
                     onClick={() => {
                        if (!streakDays.includes(day) && streakDays.length <= i) {
                          setStreakDays([...streakDays, day]);
                        }
                     }}
                     className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:scale-110 ${streakDays.length > i ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-slate-50 dark:bg-slate-700 text-slate-400 hover:bg-orange-50'}`}>
                     {day}
                   </button>
                 ))}
               </div>
            </div>

          </div>

        </div>

      </div>

      {/* Break Timer Modal */}
      {activeBreak && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl text-center relative">
            <button onClick={closeBreak} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <Icon name="cross" className="text-xl" />
            </button>
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
              <Icon name="mug-hot" className="text-3xl" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">{activeBreak.title}</h2>
            <p className="text-slate-500 mb-6 font-medium">{activeBreak.desc}</p>
            
            <div className="text-5xl font-black font-mono tracking-tighter text-emerald-600 dark:text-emerald-400 mb-8">
              {formatTime(breakTimeLeft)}
            </div>
            
            <button 
              onClick={closeBreak}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all"
            >
              End Break Early
            </button>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
