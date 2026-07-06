"use client";

import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { 
  Calculator, 
  Atom, 
  Globe, 
  Laptop, 
  BookOpen, 
  Scroll, 
  Orbit, 
  Beaker, 
  Dna,
  Book,
  PenTool,
  Languages,
  PawPrint
} from "lucide-react";

interface SubjectTheme {
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  glow: string;
  text: string;
  bgLight: string;
}

const SUBJECT_THEMES: Record<string, SubjectTheme> = {
  mathematics: {
    icon: Calculator,
    gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    glow: "rgba(99, 102, 241, 0.15)",
    text: "text-indigo-600 dark:text-indigo-400",
    bgLight: "bg-indigo-50/50 dark:bg-indigo-950/20"
  },
  science: {
    icon: Atom,
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    glow: "rgba(16, 185, 129, 0.15)",
    text: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-50/50 dark:bg-emerald-950/20"
  },
  "social science": {
    icon: Globe,
    gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
    glow: "rgba(236, 72, 153, 0.15)",
    text: "text-pink-650 dark:text-pink-400",
    bgLight: "bg-pink-50/50 dark:bg-pink-950/20"
  },
  physics: {
    icon: Orbit,
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    glow: "rgba(139, 92, 246, 0.15)",
    text: "text-purple-650 dark:text-purple-400",
    bgLight: "bg-purple-50/50 dark:bg-purple-950/20"
  },
  chemistry: {
    icon: Beaker,
    gradient: "linear-gradient(135deg, #db2777 0%, #c11f6c 100%)",
    glow: "rgba(219, 39, 119, 0.15)",
    text: "text-rose-650 dark:text-rose-400",
    bgLight: "bg-rose-50/50 dark:bg-rose-950/20"
  },
  biology: {
    icon: Dna,
    gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    glow: "rgba(34, 197, 94, 0.15)",
    text: "text-green-650 dark:text-green-400",
    bgLight: "bg-green-50/50 dark:bg-green-950/20"
  },
  zoology: {
    icon: PawPrint,
    gradient: "linear-gradient(135deg, #059669 0%, #064e3b 100%)",
    glow: "rgba(5, 150, 105, 0.15)",
    text: "text-emerald-700 dark:text-emerald-400",
    bgLight: "bg-emerald-50/50 dark:bg-emerald-950/20"
  },
  "computer science": {
    icon: Laptop,
    gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    glow: "rgba(59, 130, 246, 0.15)",
    text: "text-blue-600 dark:text-blue-400",
    bgLight: "bg-blue-50/50 dark:bg-blue-950/20"
  },
  english: {
    icon: BookOpen,
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    glow: "rgba(245, 158, 11, 0.15)",
    text: "text-amber-600 dark:text-amber-400",
    bgLight: "bg-amber-50/50 dark:bg-amber-950/20"
  },
  tamil: {
    icon: Languages,
    gradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
    glow: "rgba(217, 119, 6, 0.15)",
    text: "text-amber-700 dark:text-amber-500",
    bgLight: "bg-amber-50/50 dark:bg-amber-950/20"
  },
  history: {
    icon: Scroll,
    gradient: "linear-gradient(135deg, #b45309 0%, #78350f 100%)",
    glow: "rgba(180, 83, 9, 0.15)",
    text: "text-orange-700 dark:text-orange-400",
    bgLight: "bg-orange-50/50 dark:bg-orange-950/20"
  }
};

const getSubjectTheme = (name: string): SubjectTheme => {
  const normalized = name.toLowerCase().trim();
  if (SUBJECT_THEMES[normalized]) {
    return SUBJECT_THEMES[normalized];
  }
  
  for (const [key, val] of Object.entries(SUBJECT_THEMES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return val;
    }
  }

  return {
    icon: BookOpen,
    gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    glow: "rgba(99, 102, 241, 0.15)",
    text: "text-indigo-650 dark:text-indigo-400",
    bgLight: "bg-indigo-50/50 dark:bg-indigo-950/20"
  };
};

interface Subject {
  id: string;
  name: string;
  class: string;
  icon: string | null;
  color: string | null;
}

interface Topic {
  id: string;
  name: string;
  topicNumber: number;
}

interface Unit {
  id: string;
  name: string;
  unitNumber: number;
  topics: Topic[];
}

interface Content {
  id: string;
  contentType: string;
  title: string;
  fileUrl: string | null;
  fileContent: string | null;
  infographic?: any;
  presentation?: any;
  mcqs: Array<{
    question: string;
    options: string[];
    answer: string;
    rationale: string;
  }> | null;
}

export default function CentralizedContentPage() {
  const { data: session, status } = useSession();
  
  // States
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(true);
  
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState<boolean>(false);
  
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [loadingContents, setLoadingContents] = useState<boolean>(false);
  
  const [activeTab, setActiveTab] = useState<"materials" | "summary" | "notes" | "mcq" | "ai" | "infographic" | "presentation">("materials");
  
  // MCQ state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showMCQFeedback, setShowMCQFeedback] = useState<Record<number, boolean>>({});
  
  // AI Chat state
  const [aiMessages, setAiMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [aiInput, setAiInput] = useState<string>("");
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const [aiLanguage, setAiLanguage] = useState<"bilingual" | "tamil" | "english">("bilingual");
  
  // AI Infographic State
  const [infographicData, setInfographicData] = useState<any>(null);
  const [loadingInfographic, setLoadingInfographic] = useState<boolean>(false);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const toggleFlipCard = (idx: number) => {
    setFlippedCards(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // AI Presentation State
  const [presentationData, setPresentationData] = useState<any>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const infographicItem = contents.find(c => c.contentType === "INFOGRAPHIC");
    if (infographicItem) {
      setInfographicData(infographicItem.infographic);
    } else {
      setInfographicData(null);
    }
  }, [contents]);

  useEffect(() => {
    const presentationItem = contents.find(c => c.contentType === "PRESENTATION");
    if (presentationItem) {
      setPresentationData(presentationItem.presentation);
      setCurrentSlideIndex(0);
    } else {
      setPresentationData(null);
    }
  }, [contents]);

  // Fetch student profile to get default class standard
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userClass = (session?.user as any)?.class;
      if (userClass) {
        setSelectedClass(String(userClass));
      } else {
        const fetchStudentClass = async () => {
          try {
            const res = await fetch(`${API_URL}/api/students`);
            const json = await res.json();
            if (json.success && json.data.length > 0) {
              const currentStudent = json.data.find((s: any) => s.userId === (session?.user as any)?.id);
              if (currentStudent && currentStudent.class) {
                setSelectedClass(String(currentStudent.class));
              }
            }
          } catch (e) {
            console.error("Error fetching student profile", e);
          }
        };
        fetchStudentClass();
      }
    }
  }, [session, status]);

  // Fetch subjects whenever the selected class standard changes
  useEffect(() => {
    if (!selectedClass) return; // Wait until class is resolved to avoid loading default class '10' subjects first

    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      setSubjects([]);
      setSelectedSubject(null);
      setSelectedTopic(null);
      setUnits([]);
      setContents([]);
      
      try {
        const res = await fetch(`${API_URL}/api/centralized-content/subjects?class=${selectedClass}`);
        const json = await res.json();
        if (json.success) {
          setSubjects(json.data);
        }
      } catch (err) {
        console.error("Error fetching central subjects", err);
      } finally {
        setLoadingSubjects(false);
      }
    };
    
    fetchSubjects();
  }, [selectedClass]);

  // Fetch units and nested topics when a subject is clicked
  const handleSelectSubject = async (sub: Subject) => {
    setSelectedSubject(sub);
    setSelectedTopic(null);
    setContents([]);
    setUnits([]);
    setLoadingUnits(true);
    
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/subjects/${sub.id}/units`);
      const json = await res.json();
      if (json.success) {
        setUnits(json.data);
      }
    } catch (err) {
      console.error("Error fetching central units", err);
    } finally {
      setLoadingUnits(false);
    }
  };

  // Fetch topic contents when a topic is clicked
  const handleSelectTopic = async (topic: Topic) => {
    setSelectedTopic(topic);
    setContents([]);
    setLoadingContents(true);
    setSelectedAnswers({});
    setShowMCQFeedback({});
    setInfographicData(null);
    setFlippedCards({});
    setActiveTab("materials");
    
    // Set initial welcome AI message focused on this topic
    setAiMessages([
      {
        role: "assistant",
        content: `வணக்கம்! 👋 I am your AI Study Companion for the subunit **${topic.name}**. I am ready to explain concepts, clarify doubts, or quiz you in Tamil and English.\n\nAsk me anything! (என்னிடம் இந்தத் துணை அலகு பற்றி எதை வேண்டுமானாலும் கேளுங்கள்!)`
      }
    ]);

    try {
      const res = await fetch(`${API_URL}/api/centralized-content/topics/${topic.id}/contents`);
      const json = await res.json();
      if (json.success) {
        setContents(json.data);
        // Automatically switch tabs if materials is empty but others exist
        const fetched = json.data as Content[];
        const hasMaterials = fetched.some(c => c.contentType === "PDF" || c.contentType === "PPT");
        if (!hasMaterials) {
          if (fetched.some(c => c.contentType === "SUMMARY")) {
            setActiveTab("summary");
          } else if (fetched.some(c => c.contentType === "NOTES")) {
            setActiveTab("notes");
          } else if (fetched.some(c => c.contentType === "MCQ")) {
            setActiveTab("mcq");
          }
        }
      }
    } catch (err) {
      console.error("Error fetching central contents", err);
    } finally {
      setLoadingContents(false);
    }
  };

  // MCQ handler
  const handleOptionSelect = (qIdx: number, option: string) => {
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  const handleSubmitMCQAnswer = (qIdx: number) => {
    if (!selectedAnswers[qIdx]) return;
    setShowMCQFeedback(prev => ({ ...prev, [qIdx]: true }));
  };

  // AI Chat handler
  const handleSendAiMessage = async (customMsg?: string) => {
    const textToSend = customMsg || aiInput;
    if (!textToSend.trim()) return;

    const userMessage = { role: "user" as const, content: textToSend };
    setAiMessages(prev => [...prev, userMessage]);
    if (!customMsg) setAiInput("");
    setIsAiTyping(true);

    try {
      const chatHistory = aiMessages.map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch(`${API_URL}/api/ai/chat-tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedSubject?.name || "General",
          grade: `Grade ${selectedClass} - Topic: ${selectedTopic?.name}`,
          messages: chatHistory,
          currentMessage: `${textToSend} (Please align your answer strictly with the topic "${selectedTopic?.name}" of standard ${selectedClass})`,
          language: aiLanguage
        })
      });
      const json = await res.json();
      if (json.success && json.text) {
        setAiMessages(prev => [...prev, { role: "assistant", content: json.text }]);
      } else {
        throw new Error("Empty content received");
      }
    } catch (err) {
      console.error("AI error", err);
      setAiMessages(prev => [
        ...prev, 
        { role: "assistant", content: "மன்னிக்கவும், AI உடன் இணைப்பதில் சிக்கல் ஏற்பட்டது. (Sorry, there was a problem connecting with the AI companion.)" }
      ]);
    } finally {
      setIsAiTyping(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  };

  // Helper colors
  const getSubjectColor = (sub: Subject) => {
    return sub.color || "#6366f1";
  };

  return (
    <PortalLayout
      title="Central Learning Hub"
      subtitle="Bilingual master materials, interactive quizzes, and AI Study Companions across TN schools."
      avatarLetter="A"
      avatarColor="#6366f1"
      themeClass="theme-student"
      accentColor="#6366f1"
    >
      
      {/* 1. Header Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 glass rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-wider mb-1">
            📚 TN State Board Curriculum
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bilingual educational materials tailored for your grade.
          </p>
        </div>
        
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Grade:</span>
          <span className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-extrabold text-sm rounded-xl border border-indigo-200/20 shadow-sm">
            Class {selectedClass}th Standard
          </span>
        </div>
      </div>

      {/* Main Grid: Subjects list or workspace */}
      {!selectedSubject ? (
        
        /* 2. Subjects Grid View */
        <div>
          {loadingSubjects ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4" />
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider animate-pulse">Loading Subjects...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center p-12 glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
              <span className="text-5xl block mb-4">📭</span>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No Centralized Content Available</p>
              <p className="text-xs text-slate-500 mt-2">Syllabus is being updated for Class {selectedClass}th. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {subjects.map((sub) => {
                const theme = getSubjectTheme(sub.name);
                const SubjectIcon = theme.icon;
                return (
                  <div
                    key={sub.id}
                    onClick={() => handleSelectSubject(sub)}
                    className="glass rounded-2xl p-5 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-650 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col justify-between h-44 bg-white/70 dark:bg-slate-900/35 shadow-sm hover:shadow-md"
                  >
                    {/* Dynamic Glow Backdrops */}
                    <div 
                      className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-all duration-500"
                      style={{ background: theme.gradient }}
                    ></div>
                    
                    {/* Subject Icon & Class Tag in Row */}
                    <div className="flex justify-between items-start w-full relative z-10">
                      <div 
                        className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 text-white"
                        style={{ background: theme.gradient }}
                      >
                        <SubjectIcon className="w-5.5 h-5.5" />
                      </div>
                      <span className="text-[9px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200/20 shadow-xs">
                        Class {sub.class}
                      </span>
                    </div>

                    <div className="mt-4 relative z-10">
                      <h3 className="text-sm font-black text-slate-805 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {sub.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug line-clamp-2">
                        Explore interactive units, revisions & AI tutors.
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        
        /* 3. Subject Workspace (Side Accordion & Content Panel) */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
          
          {/* Workspace Sidebar (Units & Subunits) */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Back Button */}
            <button
              onClick={() => setSelectedSubject(null)}
              className="w-full py-3 px-4 rounded-xl bg-slate-150 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-black dark:text-white font-bold text-xs transition-colors flex items-center gap-2 border border-slate-200 dark:border-slate-800"
            >
              <span>←</span> Back to Subjects
            </button>

            {/* Subject Details Header */}
            {(() => {
              const theme = getSubjectTheme(selectedSubject.name);
              const SubjectIcon = theme.icon;
              return (
                <div className="glass rounded-3xl p-5 border border-slate-200 dark:border-slate-850 bg-white/90 dark:bg-slate-900/50 backdrop-blur-md flex items-center gap-4 shadow-sm">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md text-white"
                    style={{ background: theme.gradient }}
                  >
                    <SubjectIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm md:text-base text-slate-805 dark:text-slate-100">{selectedSubject.name}</h3>
                    <span className="text-[9px] uppercase font-black tracking-wider text-indigo-500/80 dark:text-indigo-400 block mt-0.5">
                      Class {selectedSubject.class}th Workspace
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Units Accordion */}
            <div className="glass rounded-3xl p-4 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/20 max-h-[calc(100vh-320px)] overflow-y-auto">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-4 px-1">Syllabus Index</h4>
              
              {loadingUnits ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-6 h-6 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin mb-2" />
                  <span className="text-[10px] text-slate-400">Loading index...</span>
                </div>
              ) : units.length === 0 ? (
                <p className="text-xs text-slate-500 p-2">No units created yet for this subject.</p>
              ) : (
                <div className="space-y-3">
                  {units.map((unit) => (
                    <div key={unit.id} className="space-y-1.5 border-b border-slate-100 dark:border-slate-800/80 pb-3 last:border-b-0">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase block">Unit {unit.unitNumber}</span>
                      <h5 className="font-semibold text-xs text-slate-700 dark:text-slate-300 leading-snug px-0.5">{unit.name}</h5>
                      
                      <div className="flex flex-col gap-1 mt-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                        {unit.topics.map((topic) => (
                          <button
                            key={topic.id}
                            onClick={() => handleSelectTopic(topic)}
                            className={`text-left text-xs px-2.5 py-1.5 rounded-lg transition-all font-medium leading-snug ${
                              selectedTopic?.id === topic.id 
                                ? "bg-indigo-600 text-white" 
                                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-black dark:hover:text-white"
                            }`}
                          >
                            {topic.topicNumber}. {topic.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Workspace Right Side Content View */}
          <div className="lg:col-span-3">
            {!selectedTopic ? (
              
              /* Default subunit selection prompt */
              <div className="flex flex-col items-center justify-center p-12 glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/10 min-h-[450px]">
                <span className="text-6xl block mb-4 animate-bounce" style={{ animationDuration: '3s' }}>📖</span>
                <h3 className="text-lg font-bold text-slate-750 dark:text-slate-200">Start Your Master Study</h3>
                <p className="text-xs text-slate-500 mt-2 text-center max-w-sm leading-relaxed">
                  Select a specific subunit from the syllabus index on the left to load textbooks, summaries, custom revision notes, interactive quiz prep, and the AI study coach.
                </p>
              </div>
            ) : (
              
              /* Full Syllabus Content Workspace Panel */
              <div className="glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 overflow-hidden min-h-[500px] flex flex-col">
                
                {/* Subunit Header details */}
                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-250/20 dark:border-slate-800/80 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-black dark:text-white">{selectedTopic.name}</h3>
                    <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">
                      Subject: {selectedSubject.name} &bull; Class {selectedSubject.class}th Syllabus
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-bold text-[10px] rounded-lg tracking-wide uppercase border border-indigo-200/20">
                    Bilingual Study Active
                  </span>
                </div>

                {/* Tabs selection header */}
                <div className="px-6 bg-slate-100/30 dark:bg-slate-950/10 border-b border-slate-250/20 dark:border-slate-800/80 flex overflow-x-auto gap-2 py-2">
                  {[
                    { id: "materials", label: "📄 Study Materials", show: true },
                    { id: "infographic", label: "🎨 AI Infographic Map", show: contents.some(c => c.contentType === "INFOGRAPHIC") },
                    { id: "presentation", label: "📊 AI Presentation Slides", show: contents.some(c => c.contentType === "PRESENTATION") },
                    { id: "summary", label: "📝 AI Summary", show: contents.some(c => c.contentType === "SUMMARY") },
                    { id: "notes", label: "📓 Revision Notes", show: contents.some(c => c.contentType === "NOTES") },
                    { id: "mcq", label: "🧠 MCQ Mastery Quiz", show: contents.some(c => c.contentType === "MCQ") },
                    { id: "ai", label: "💬 AI Study Coach", show: true }
                  ].map((tab) => {
                    if (!tab.show) return null;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                          activeTab === tab.id
                            ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-white shadow-sm"
                            : "text-slate-500 hover:text-black dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/30"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab content renderer */}
                <div className="p-6 flex-1 flex flex-col">
                  {loadingContents ? (
                    <div className="flex flex-col items-center justify-center py-20 flex-1">
                      <div className="w-10 h-10 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin mb-3" />
                      <span className="text-xs text-slate-400">Loading subunit contents...</span>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col">
                      
                      {/* T1: Study Materials */}
                      {activeTab === "materials" && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                          <h4 className="text-xs font-black uppercase text-slate-450 dark:text-slate-400 tracking-wider">Book Extracts & Presentations</h4>
                          
                          {(() => {
                            const mats = contents.filter(c => c.contentType === "PDF" || c.contentType === "PPT" || c.contentType.toLowerCase().includes("textbook") || c.contentType.toLowerCase().includes("reference") || c.contentType.toLowerCase().includes("diagram"));
                            if (mats.length === 0) {
                              return (
                                <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                  <span className="text-4xl block mb-2">📁</span>
                                  <p className="text-xs text-slate-500">No documents uploaded for this subunit.</p>
                                </div>
                              );
                            }
                            return (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mats.map((mat) => {
                                  const getIcon = (type: string, url: string | null) => {
                                    const t = type.toLowerCase();
                                    const u = (url || "").toLowerCase();
                                    if (u.endsWith(".pdf") || t === "pdf") return "📕";
                                    if (u.endsWith(".pptx") || u.endsWith(".ppt") || t === "ppt") return "📙";
                                    if (u.endsWith(".docx") || u.endsWith(".doc")) return "📘";
                                    if (u.endsWith(".png") || u.endsWith(".jpg") || u.endsWith(".jpeg")) return "🖼️";
                                    return "📄";
                                  };

                                  return (
                                    <a
                                      key={mat.id}
                                      href={mat.fileUrl ? `${API_URL}${mat.fileUrl}` : "#"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all group bg-slate-50/30 dark:bg-slate-900/10"
                                    >
                                      <span className="text-3xl group-hover:scale-110 transition-transform">
                                        {getIcon(mat.contentType, mat.fileUrl)}
                                      </span>
                                      <div className="min-w-0 flex-1">
                                        <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                          {mat.title}
                                        </h5>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                                          {mat.contentType} &bull; Click to open
                                        </span>
                                      </div>
                                      <span className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold">→</span>
                                    </a>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* T1.5: AI Infographic Visual Map */}
                      {activeTab === "infographic" && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                          {loadingInfographic ? (
                            <div className="flex flex-col items-center justify-center py-20 flex-1">
                              <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4" />
                              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider animate-pulse">Reading PDFs & Materials...</p>
                              <p className="text-slate-500 text-[10px] mt-1.5">AI is drawing your interactive learning infographic map</p>
                            </div>
                          ) : !infographicData ? (
                            <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/10 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                              <span className="text-5xl block mb-3">🎨</span>
                              <h4 className="font-bold text-sm text-black dark:text-white mb-2">Visual Infographic Map Not Available</h4>
                              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                                A visual study map is not generated yet for this topic. Please ask your administrator or teacher to generate the AI concept map.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                              {/* 1. Header card */}
                              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-4 items-center">
                                <div className="absolute top-0 right-0 p-8 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl -mr-4 -mt-4"></div>
                                <span className="text-4xl">🧠</span>
                                <div>
                                  <h4 className="font-black text-sm md:text-base text-indigo-450 dark:text-indigo-400">
                                    {infographicData.topicTitle || selectedTopic.name}
                                  </h4>
                                  <p className="text-xs text-slate-700 dark:text-slate-350 mt-1 leading-relaxed font-medium">
                                    {infographicData.overallSummary}
                                  </p>
                                </div>
                              </div>

                              {/* 2. Visual Sequence Flow */}
                              <div className="space-y-4">
                                <h5 className="text-[11px] font-black uppercase text-slate-450 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                                  <span>🗺️</span> Conceptual Step-by-Step Flow
                                </h5>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {infographicData.visualFlow?.map((step: any, idx: number) => (
                                    <div key={idx} className="relative flex flex-col p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-800 transition-colors">
                                      <div className="flex justify-between items-center mb-2 flex-shrink-0">
                                        <span className="text-lg" title="Concept Icon">{step.icon || "💡"}</span>
                                        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-indigo-105 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-md border border-indigo-200/10">
                                          Step {step.stepNumber || (idx + 1)}
                                        </span>
                                      </div>
                                      <h6 className="font-bold text-xs text-black dark:text-white leading-tight mb-1">{step.title}</h6>
                                      <p className="text-[11px] text-slate-650 dark:text-slate-400 leading-relaxed font-medium mt-1">
                                        {step.description}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* 3. Key Formulas & Mnemonics split */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Formulas / Facts */}
                                <div className="space-y-3">
                                  <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                                    <span>🔑</span> Core Formulas & Facts
                                  </h5>
                                  <div className="space-y-2.5">
                                    {infographicData.keyFormulasOrFacts?.map((item: any, idx: number) => (
                                      <div key={idx} className="p-3.5 rounded-xl border border-amber-500/25 bg-amber-500/5 hover:bg-amber-500/10 transition-colors flex flex-col gap-1">
                                        <span className="font-mono font-bold text-xs text-amber-850 dark:text-amber-300 leading-snug break-words">
                                          {item.concept}
                                        </span>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium mt-0.5">
                                          {item.importance}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Mnemonics */}
                                <div className="space-y-3">
                                  <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                                    <span>✨</span> AI Memory Tricks (Mnemonics)
                                  </h5>
                                  <div className="space-y-2.5">
                                    {infographicData.mnemonics?.map((item: any, idx: number) => (
                                      <div key={idx} className="p-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors flex flex-col gap-1">
                                        <span className="font-black text-xs text-emerald-850 dark:text-emerald-300">
                                          💡 {item.phrase}
                                        </span>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium mt-0.5">
                                          {item.meaning}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* 4. Active Recall Flashcards */}
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                                    <span>🃏</span> 3D Flip Flashcards (Active Recall)
                                  </h5>
                                  <span className="text-[10px] text-slate-500 font-medium">Click card to reveal answer</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                  {infographicData.flashcards?.map((card: any, idx: number) => {
                                    const isFlipped = !!flippedCards[idx];
                                    return (
                                      <div 
                                        key={idx}
                                        onClick={() => toggleFlipCard(idx)}
                                        className="h-32 [perspective:800px] cursor-pointer group"
                                      >
                                        <div 
                                          className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform ${
                                            isFlipped ? '[transform:rotateY(180deg)]' : ''
                                          }`}
                                        >
                                          {/* Front face */}
                                          <div className="absolute inset-0 w-full h-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between [backface-visibility:hidden] shadow-xs group-hover:border-indigo-400 dark:group-hover:border-indigo-850 transition-colors">
                                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Question {idx + 1}</span>
                                            <p className="text-xs text-slate-800 dark:text-slate-200 font-bold leading-snug line-clamp-3 my-auto">
                                              {card.front}
                                            </p>
                                            <span className="text-[8px] text-slate-450 text-right mt-1 font-bold group-hover:text-indigo-500">🔄 CLICK TO REVEAL</span>
                                          </div>

                                          {/* Back face */}
                                          <div className="absolute inset-0 w-full h-full rounded-xl border border-indigo-500/35 bg-indigo-950/20 dark:bg-indigo-950/40 p-4 flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-md">
                                            <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">Answer / Fact</span>
                                            <p className="text-xs text-indigo-300 font-medium leading-snug line-clamp-4 my-auto">
                                              {card.back}
                                            </p>
                                            <span className="text-[8px] text-indigo-400/80 text-right mt-1 font-bold">🔄 CLICK TO FLIP BACK</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                            </div>
                          )}
                        </div>
                      )}

                      {/* T1.7: AI Presentation Slides */}
                      {activeTab === "presentation" && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                          {!presentationData ? (
                            <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/10 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                              <span className="text-5xl block mb-3">📊</span>
                              <h4 className="font-bold text-sm text-black dark:text-white mb-2">Slides Presentation Not Available</h4>
                              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                                A presentation slide deck is not generated yet for this topic. Please ask your administrator or teacher to generate the AI slides.
                              </p>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col gap-6">
                              {(() => {
                                const currentSlide = presentationData.slides?.[currentSlideIndex];
                                if (!currentSlide) return <p className="text-slate-500 text-center py-10">Slide not found.</p>;
                                
                                return (
                                  <div className="flex-1 flex flex-col gap-5">
                                    {/* Slide Content Layout */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
                                      
                                      {/* Left: Text bullets content */}
                                      <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-205 dark:border-slate-800/80 flex flex-col justify-between shadow-xs">
                                        <div className="space-y-4">
                                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-200/20 dark:border-indigo-500/20 rounded-md">
                                            Slide {currentSlide.slideNumber} of {presentationData.slides.length}
                                          </span>
                                          <h4 className="text-base md:text-lg font-black text-black dark:text-white leading-tight">
                                            {currentSlide.title}
                                          </h4>
                                          
                                          <ul className="space-y-3.5 pt-2">
                                            {currentSlide.bulletPoints?.map((bp: string, bpi: number) => (
                                              <li key={bpi} className="text-xs md:text-sm text-slate-700 dark:text-slate-200 flex items-start gap-2.5 leading-relaxed font-medium">
                                                <span className="text-indigo-555 dark:text-indigo-400 select-none mt-0.5">•</span>
                                                <span>{bp}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>

                                      {/* Right: Pictorial / Diagram representation guidance */}
                                      <div className="p-6 rounded-2xl border border-teal-500/20 dark:border-teal-500/15 bg-teal-500/5 relative overflow-hidden flex flex-col justify-between group">
                                        {/* Blueprint background grid effect */}
                                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e912_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e912_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none opacity-40"></div>
                                        
                                        <div className="relative z-10 space-y-3">
                                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200/20 dark:border-teal-500/20 rounded-md">
                                            📐 Visual Illustration Blueprint
                                          </span>
                                          <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Pictorial Concept Representation:</h5>
                                          <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                                            {currentSlide.visualLayoutDescription}
                                          </p>
                                        </div>
                                        
                                        <div className="relative z-10 mt-4 text-[10px] text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1 bg-teal-950/20 dark:bg-teal-950/30 p-2 rounded-lg border border-teal-500/10">
                                          <span>🎨</span>
                                          <span>Visual layout reference for conceptual modeling.</span>
                                        </div>
                                      </div>

                                    </div>

                                    {/* Speaker Notes / Explanation */}
                                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/30 leading-relaxed text-xs text-slate-705 dark:text-slate-300">
                                      <span className="font-bold text-slate-800 dark:text-white block mb-1">📢 Presenter Notes & bilingual Explanation:</span>
                                      <p className="whitespace-pre-line leading-relaxed font-medium text-slate-600 dark:text-slate-350">
                                        {currentSlide.speakerNotes}
                                      </p>
                                    </div>

                                    {/* Navigation Actions */}
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          disabled={currentSlideIndex === 0}
                                          onClick={() => setCurrentSlideIndex(prev => prev - 1)}
                                          className="py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                          ◀ Previous
                                        </button>
                                        <button
                                          type="button"
                                          disabled={currentSlideIndex >= (presentationData.slides?.length || 0) - 1}
                                          onClick={() => setCurrentSlideIndex(prev => prev + 1)}
                                          className="py-1.5 px-3 rounded-lg bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                          Next ▶
                                        </button>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        {presentationData.slides?.map((_: any, idx: number) => (
                                          <span 
                                            key={idx} 
                                            onClick={() => setCurrentSlideIndex(idx)}
                                            className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                                              currentSlideIndex === idx ? "bg-indigo-650 dark:bg-indigo-500 w-4" : "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      )}

                      {/* T2: AI Summary */}
                      {activeTab === "summary" && (
                        <div className="space-y-4 animate-in fade-in duration-200 leading-relaxed text-sm">
                          {contents
                            .filter(c => c.contentType === "SUMMARY")
                            .map((summary) => (
                              <div key={summary.id} className="bg-slate-50 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <h4 className="font-bold text-sm text-black dark:text-white mb-3 flex items-center gap-2">
                                  <span>🤖</span> {summary.title}
                                </h4>
                                <div className="text-slate-700 dark:text-slate-300 text-xs md:text-sm whitespace-pre-line leading-relaxed">
                                  {summary.fileContent}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* T3: Revision Notes */}
                      {activeTab === "notes" && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                          {contents
                            .filter(c => c.contentType === "NOTES")
                            .map((notes) => (
                              <div key={notes.id} className="bg-amber-500/5 dark:bg-amber-500/5 p-5 rounded-2xl border border-amber-500/20">
                                <h4 className="font-bold text-sm text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
                                  <span>✍️</span> {notes.title}
                                </h4>
                                <div className="text-slate-700 dark:text-slate-350 text-xs md:text-sm whitespace-pre-line leading-relaxed font-medium">
                                  {notes.fileContent}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* T4: MCQ Mastery Quiz */}
                      {activeTab === "mcq" && (
                        <div className="space-y-8 animate-in fade-in duration-200 overflow-y-auto max-h-[calc(100vh-380px)] pr-2">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Concept Validation Quiz</h4>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md">Mastery Track</span>
                          </div>

                          {(() => {
                            const mcqRecords = contents.filter(c => c.contentType === "MCQ");
                            if (mcqRecords.length === 0) return <p className="text-xs text-slate-500">No MCQs seeded for this subunit.</p>;

                            return mcqRecords.map((record) => {
                              const mcqList = record.mcqs || [];
                              if (mcqList.length === 0) return <p key={record.id} className="text-xs text-slate-500">Empty quiz library.</p>;

                              return (
                                <div key={record.id} className="space-y-6">
                                  {mcqList.map((item, qIdx) => {
                                    const userAns = selectedAnswers[qIdx];
                                    const showFeedback = showMCQFeedback[qIdx];
                                    const isCorrect = userAns === item.answer;

                                    return (
                                      <div key={qIdx} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-900/10 space-y-4">
                                        <h5 className="font-bold text-xs md:text-sm text-slate-800 dark:text-slate-200">
                                          Question {qIdx + 1}: {item.question}
                                        </h5>

                                        <div className="grid grid-cols-1 gap-2.5">
                                          {item.options.map((opt) => {
                                            const isSelected = userAns === opt;
                                            const isCorrectOption = opt === item.answer;
                                            
                                            let optionClass = "border-slate-200 dark:border-slate-800 hover:border-slate-400 hover:bg-slate-100/30 dark:hover:bg-slate-800/10";
                                            if (isSelected) {
                                              optionClass = "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-650 dark:text-indigo-300 font-bold";
                                            }
                                            if (showFeedback) {
                                              if (isCorrectOption) {
                                                optionClass = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold";
                                              } else if (isSelected && !isCorrect) {
                                                optionClass = "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold";
                                              } else {
                                                optionClass = "opacity-50 border-slate-200 dark:border-slate-800";
                                              }
                                            }

                                            return (
                                              <button
                                                key={opt}
                                                disabled={showFeedback}
                                                onClick={() => handleOptionSelect(qIdx, opt)}
                                                className={`text-left text-xs md:text-sm p-3.5 rounded-xl border transition-all flex justify-between items-center ${optionClass}`}
                                              >
                                                <span>{opt}</span>
                                                {showFeedback && isCorrectOption && (
                                                  <span className="text-emerald-500 font-black">✓</span>
                                                )}
                                                {showFeedback && isSelected && !isCorrect && (
                                                  <span className="text-rose-500 font-black">✗</span>
                                                )}
                                              </button>
                                            );
                                          })}
                                        </div>

                                        <div className="flex items-center gap-3">
                                          {!showFeedback ? (
                                            <button
                                              disabled={!userAns}
                                              onClick={() => handleSubmitMCQAnswer(qIdx)}
                                              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                                                userAns 
                                                  ? "bg-slate-900 text-white dark:bg-slate-800 hover:opacity-90 cursor-pointer" 
                                                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                              }`}
                                            >
                                              Check Answer
                                            </button>
                                          ) : (
                                            <div className="w-full bg-slate-100 dark:bg-slate-950/30 p-4 rounded-xl border border-slate-250/20 dark:border-slate-800/80 text-xs text-slate-650 dark:text-slate-350 leading-relaxed animate-in fade-in duration-200">
                                              <span className="font-bold text-black dark:text-white block mb-1">
                                                {isCorrect ? "🎉 Correct!" : `❌ Incorrect (Correct is: ${item.answer.substring(0, 2)})`}
                                              </span>
                                              <strong className="text-slate-500 block mt-1.5 mb-0.5">Explanation:</strong>
                                              {item.rationale}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}

                      {/* T5: AI Study Companion Chat */}
                      {activeTab === "ai" && (
                        <div className="flex-1 flex flex-col min-h-[380px] animate-in fade-in duration-200">
                          
                          {/* Chat Messages */}
                          <div className="flex-1 overflow-y-auto max-h-[300px] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/30 dark:bg-slate-950/10 space-y-4 mb-4">
                            {aiMessages.map((msg, i) => (
                              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                {msg.role === "assistant" && (
                                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-sm flex-shrink-0 mt-0.5 shadow-sm">
                                    🤖
                                  </div>
                                )}
                                <div
                                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs md:text-sm leading-relaxed ${
                                    msg.role === "user"
                                      ? "bg-indigo-600 text-white rounded-tr-none shadow-sm"
                                      : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-800 shadow-sm"
                                  }`}
                                  style={{ whiteSpace: "pre-line" }}
                                >
                                  {msg.content}
                                </div>
                                {msg.role === "user" && (
                                  <div className="w-7 h-7 rounded-lg bg-indigo-550 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5 shadow-sm">
                                    A
                                  </div>
                                )}
                              </div>
                            ))}

                            {isAiTyping && (
                              <div className="flex gap-3 justify-start">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-sm flex-shrink-0">
                                  🤖
                                </div>
                                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center shadow-sm">
                                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                              </div>
                            )}
                            <div ref={chatEndRef} />
                          </div>

                          {/* Quick Prompts */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {[
                              { text: `Explain this subunit in simple terms`, label: "💡 Explain Simple" },
                              { text: `Give me a daily life example of ${selectedTopic.name}`, label: "🌍 Real-world Use" },
                              { text: `Create a quick quiz on this subunit`, label: "🧠 Quick Quiz" }
                            ].map((p, idx) => (
                              <button
                                key={idx}
                                disabled={isAiTyping}
                                onClick={() => handleSendAiMessage(p.text)}
                                className="text-[10px] font-bold border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-400 dark:hover:border-indigo-800 hover:bg-indigo-50/10 dark:hover:bg-indigo-900/5 transition-all"
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>

                          {/* Chat Input controls */}
                          <div className="flex gap-3 items-center bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSendAiMessage()}
                                disabled={isAiTyping}
                                placeholder={`Ask a doubt about this subunit...`}
                                className="w-full bg-transparent border-0 text-xs md:text-sm text-black dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0"
                              />
                            </div>
                            
                            {/* Language selection dropdown */}
                            <select
                              value={aiLanguage}
                              onChange={(e) => setAiLanguage(e.target.value as any)}
                              className="bg-transparent border-0 text-[10px] text-slate-400 font-bold uppercase cursor-pointer py-1 pr-7 focus:ring-0"
                            >
                              <option value="bilingual">🌐 Bilingual</option>
                              <option value="tamil">📜 Tamil</option>
                              <option value="english">🗣️ English</option>
                            </select>

                            <button
                              onClick={() => handleSendAiMessage()}
                              disabled={isAiTyping || !aiInput.trim()}
                              className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95 ${
                                aiInput.trim() && !isAiTyping 
                                  ? "bg-indigo-650 hover:bg-indigo-700 hover:shadow-md cursor-pointer" 
                                  : "bg-slate-350 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                              }`}
                            >
                              Ask AI
                            </button>
                          </div>

                        </div>
                      )}

                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>
      )}

    </PortalLayout>
  );
}
