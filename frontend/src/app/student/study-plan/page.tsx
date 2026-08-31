"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import InteractiveInfographic from "@/components/InteractiveInfographic";
import SlideVisual from "@/components/SlideVisual";

const subjects = ["Mathematics", "Science", "Tamil", "English", "Social Science"];
const grades = ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  rationale: string;
}

interface InfographicCard {
  title: string;
  formulas: string[];
  keyConcepts: string[];
  illustrations: string[];
}

interface Unit {
  id: string;
  title: string;
  status: string;
  summary: string;
  studyTime: string;
  infographicCard: InfographicCard;
  audioGuide: { speaker: string; text: string; lang?: string }[];
  quiz: QuizQuestion[];
}

interface StudyPlan {
  id?: string;
  subject: string;
  topic: string;
  grade: string;
  goals: string[];
  units: Unit[];
  infographic?: any;
  isTeacherPlan?: boolean;
  planData?: any;
  slides?: any[];
  podcast?: any;
  videoStoryboard?: any[];
  bilingual?: any[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Intelligence Studio tools — colorful Flaticon tiles
const studioTools = [
  { id: "slides", label: "Slide Deck", icon: "fi-sr-diagram-project", desc: "Interactive concept slides", chip: "from-blue-500 to-indigo-600" },
  { id: "visualExplain", label: "Infographic", icon: "fi-sr-chart-histogram", desc: "Interactive visual mapping", chip: "from-emerald-500 to-teal-600" },
  { id: "podcast", label: "Audio Podcast", icon: "fi-sr-comments", desc: "AI generated host summary", chip: "from-amber-500 to-orange-600" },
  { id: "video", label: "Generate Video", icon: "fi-sr-film", desc: "Animated lecture simulation", chip: "from-rose-500 to-pink-600" },
  { id: "bilingual", label: "Bilingual Glossary", icon: "fi-sr-globe", desc: "Tamil translation matrix", chip: "from-violet-500 to-purple-600" },
  { id: "assessment", label: "Exit Tickets", icon: "fi-sr-checkbox", desc: "Quick assessment MCQs", chip: "from-sky-500 to-indigo-600" },
] as const;

export default function StudyPlanPage() {
  const { data: session } = useSession();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null);

  // Teacher plan integration states
  const [teacherPlans, setTeacherPlans] = useState<any[]>([]);
  const [loadingTeacherPlans, setLoadingTeacherPlans] = useState(false);

  // Real-time Chat Tutor state (Middle panel)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Mobile layout state
  const [mobileTab, setMobileTab] = useState<"lessons" | "study" | "tools">("lessons");

  // Lesson list search and accordion state
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

  // Fetch teacher plans on mount
  useEffect(() => {
    const fetchTeacherPlans = async () => {
      try {
        setLoadingTeacherPlans(true);
        
        const schoolId = (session?.user as any)?.schoolId;
        const studentClass = (session?.user as any)?.class;
        
        const params = new URLSearchParams();
        if (schoolId) params.append("schoolId", schoolId);
        if (studentClass) {
          const match = String(studentClass).match(/\d+/);
          if (match) {
            const gradeStr = `Grade ${match[0]}`;
            params.append("grade", gradeStr);
          }
        }

        const res = await fetch(`${API_URL}/api/teacher/lessons?${params.toString()}`);
        const json = await res.json();
        if (json.success && json.data) {
          setTeacherPlans(json.data);
        }
      } catch (err) {
        console.error("Error fetching teacher plans", err);
      } finally {
        setLoadingTeacherPlans(false);
      }
    };
    
    if (session) {
      fetchTeacherPlans();
    }
  }, [API_URL, session]);

  // Set chat messages welcome when a plan changes
  useEffect(() => {
    if (currentPlan) {
      setChatMessages([
        {
          role: "assistant",
          content: `Hi there! I've loaded your self-study textbook sources for **"${currentPlan.topic}"** (${currentPlan.grade}). \n\nAsk me any questions, request simple examples, or ask for translations in Tamil. Let's learn together!`
        }
      ]);
    }
  }, [currentPlan]);



  const loadTeacherPlan = (plan: any) => {
    window.speechSynthesis.cancel();

    // Reset active unit, active tool modals, quiz states, and slides/video positions
    setChatInput("");

    // Sync search configuration inputs in sidebar (removed)

    // Map teacher lesson plan to study plan structure
    const mappedPlan: StudyPlan = {
      id: plan.id,
      subject: plan.subject,
      topic: plan.topic,
      grade: plan.grade,
      goals: plan.planData.objectives || [],
      units: plan.planData.timeline?.map((item: any, idx: number) => ({
        id: `t${idx}`,
        title: item.activity,
        summary: item.description,
        studyTime: item.time || "10 mins",
        infographicCard: {
          title: item.activity,
          formulas: [],
          keyConcepts: [item.description],
          illustrations: []
        },
        audioGuide: plan.planData.podcast?.script?.map((line: any) => ({
          speaker: line.speaker,
          text: line.text,
          lang: line.lang
        })) || [],
        quiz: plan.planData.exitTickets || []
      })) || [],
      infographic: plan.planData.infographic,
      isTeacherPlan: true,
      slides: plan.planData.slides || [],
      podcast: plan.planData.podcast || null,
      videoStoryboard: plan.planData.videoStoryboard || [],
      bilingual: plan.planData.bilingual || []
    };

    setCurrentPlan(mappedPlan);
    Swal.fire({
      icon: "success",
      title: "Teacher Plan Loaded!",
      text: `Loaded teacher guidelines for: ${plan.topic}`,
      timer: 1500,
      showConfirmButton: false
    });
  };



  // AI Tutor chat interaction (Middle panel)
  const handleSendChat = async () => {
    if (!chatInput.trim() || !currentPlan) return;

    const userMsg: ChatMessage = { role: "user", content: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const history = chatMessages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch(`${API_URL}/api/ai/chat-tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: currentPlan.subject,
          grade: currentPlan.grade,
          messages: history,
          currentMessage: userMsg.content,
          language: "bilingual"
        })
      });

      const json = await res.json();
      if (json.success && json.text) {
        setChatMessages((prev) => [...prev, { role: "assistant", content: json.text }]);
      } else {
        throw new Error(json.error || "No response");
      }
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Error communicating with AI Tutor." }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);
  // Filter teacher plans based on search
  const filteredTeacherPlans = teacherPlans.filter((plan: any) => 
    !searchQuery || 
    plan.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group teacher plans by subject
  const groupedPlans = filteredTeacherPlans.reduce((acc: Record<string, any[]>, plan: any) => {
    const subj = plan.subject || "Other";
    if (!acc[subj]) acc[subj] = [];
    acc[subj].push(plan);
    return acc;
  }, {});

  const toggleSubject = (subj: string) => {
    setExpandedSubjects(prev => ({ ...prev, [subj]: prev[subj] === false ? true : false }));
  };

  return (
    <PortalLayout
      title="Personalized Study Plan (Intelligence Style)"
      subtitle="Interact with your textbook chapters, chat with AI Tutor, and launch studio learning tools"
      avatarLetter="A"
      avatarColor="#6366f1"
      themeClass="theme-student"
      accentColor="#6366f1"
    >
      {/* ── Page Banner ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 glass rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <i className="fi fi-sr-brain text-2xl text-indigo-600 dark:text-indigo-400 flex items-center" />
          <div>
            <h2 className="text-lg sm:text-xl font-black text-black dark:text-white uppercase tracking-wider leading-tight">
              Self-Study Plan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Interact with textbook chapters, chat with AI Tutor and launch studio learning tools.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs sm:text-sm rounded-xl border border-indigo-200/20 shadow-sm whitespace-nowrap shrink-0 self-start sm:self-auto">
          <i className="fi fi-sr-magic-wand flex items-center text-sm" />
          Intelligence Mode
        </span>
      </div>


      <div className="flex flex-col xl:flex-row gap-6 h-auto xl:h-[calc(100vh-160px)] xl:overflow-hidden pb-10 xl:pb-0">
        
        {/* Panel 1: Configuration & Sources (Left) */}
        <div className={`w-full xl:w-1/4 xl:border-r border-slate-200 dark:border-slate-800 xl:pr-6 overflow-y-visible xl:overflow-y-auto h-auto xl:h-full space-y-6 scrollbar-thin shrink-0 ${mobileTab === 'lessons' ? 'block' : 'hidden xl:block'}`}>


          {/* Teacher assigned plans list */}
          <div className="glass rounded-3xl p-5 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent flex flex-col h-full max-h-[500px]">
            <h3 className="text-black dark:text-white font-bold text-sm mb-4 flex items-center gap-2 shrink-0">
              <i className="fi fi-sr-chalkboard-user text-indigo-500 flex items-center" /> Teacher Assigned Lessons
            </h3>
            
            <div className="mb-4 shrink-0 relative">
              <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input 
                type="text" 
                placeholder="Search lessons..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800 dark:text-slate-200"
              />
            </div>

            {loadingTeacherPlans ? (
              <div className="text-slate-400 text-sm animate-pulse font-sans">Loading assigned lessons...</div>
            ) : teacherPlans.length === 0 ? (
              <p className="text-sm text-slate-550 italic font-sans">No assigned lessons yet.</p>
            ) : Object.keys(groupedPlans).length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-4">No lessons found matching your search.</p>
            ) : (
              <div className="space-y-3 overflow-y-auto scrollbar-thin pr-1 flex-1 pb-4">
                {Object.keys(groupedPlans).map((subj) => {
                  const isExpanded = !!searchQuery || expandedSubjects[subj] !== false; // Default true, or true if searching
                  return (
                    <div key={subj} className="bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all shadow-sm">
                      <button 
                        onClick={() => toggleSubject(subj)}
                        className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                            <i className="fi fi-sr-book text-[11px] text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="text-left min-w-0">
                            <h5 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide truncate">{subj}</h5>
                            <div className="text-[9px] font-bold text-slate-500">{groupedPlans[subj].length} Lessons</div>
                          </div>
                        </div>
                        <i className={`fi fi-sr-caret-down text-slate-400 text-[10px] transition-transform duration-300 ml-2 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isExpanded && (
                        <div className="p-2 space-y-2 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800 max-h-[240px] overflow-y-auto scrollbar-thin">
                          {groupedPlans[subj].map((plan: any) => (
                            <button
                              key={plan.id}
                              onClick={() => {
                                loadTeacherPlan(plan);
                                if (window.innerWidth < 1280) setMobileTab("study");
                              }}
                              className={`w-full text-left p-3 rounded-lg border transition-all ${
                                currentPlan?.id === plan.id
                                  ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                                  : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:border-indigo-300 hover:shadow-sm"
                              }`}
                            >
                              <span className="block truncate font-bold text-[13px]">{plan.topic}</span>
                              <span className={`text-[9px] block mt-0.5 font-bold uppercase tracking-wide ${currentPlan?.id === plan.id ? 'text-indigo-200' : 'text-slate-400'}`}>{plan.grade}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="glass rounded-3xl p-5 border border-slate-250 dark:border-slate-700/50 bg-indigo-500/5">
            <h4 className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-2 flex items-center gap-1.5"><i className="fi fi-sr-graduation-cap flex items-center" /> How to Study:</h4>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-sans space-y-1.5 flex flex-col">
              <span>1. Choose an assigned lesson above.</span>
              <span>2. Review the study targets.</span>
              <span>3. Ask doubts to AI Tutor.</span>
              <span>4. Tap "Studio Tools" for cheat sheets and audio podcasts.</span>
            </p>
          </div>
        </div>

        {/* Panel 2 & 3: Middle Section (Document View & AI Chat) */}
        <div className={`w-full xl:w-3/4 px-0 xl:px-2 overflow-y-visible xl:overflow-y-auto min-h-[85vh] xl:min-h-0 xl:h-full flex-col justify-between space-y-4 shrink-0 ${mobileTab === 'study' ? 'flex' : 'hidden xl:flex'}`}>
          {isGenerating ? (
            <div className="glass rounded-3xl p-12 border border-slate-250 dark:border-slate-700/50 text-center flex-grow flex flex-col items-center justify-center bg-white dark:bg-transparent">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-6" />
              <h3 className="text-black dark:text-white font-bold text-base md:text-lg">Smart Assistant Formulating Study Plan</h3>
              <p className="text-sm md:text-base text-slate-550 max-w-sm mt-3 animate-pulse font-sans">
                Structuring unit targets, cheat sheets, quiz questions, and bilingual podcast scripts...
              </p>
            </div>
          ) : !currentPlan ? (
            <div className="glass rounded-3xl p-12 border border-slate-250 dark:border-slate-700/50 text-center flex-grow flex flex-col items-center justify-center bg-white dark:bg-transparent">
              <i className="fi fi-sr-notebook text-6xl text-slate-300 dark:text-slate-600 mb-6 flex items-center justify-center" />
              <h3 className="text-black dark:text-white font-bold text-lg md:text-xl font-sans">Student Study Hub</h3>
              <p className="text-sm md:text-base text-slate-550 max-w-md mt-3 leading-relaxed font-sans">
                Select a lesson from the "Lessons" tab to get started. You can view study materials and chat with your AI Tutor here.
              </p>
            </div>
          ) : (
            <div className="flex-grow flex flex-col justify-between overflow-hidden gap-6 h-full">
              {/* Study Plan Outline Document */}
              <div className="flex-1 rounded-3xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-950 p-6 md:p-8 overflow-y-auto max-h-[50%] md:max-h-[60%] shadow-md">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
                  <span className="badge badge-blue mb-2.5 text-xs px-3 py-1">{currentPlan.grade} · {currentPlan.subject}</span>
                  <h3 className="text-black dark:text-white font-black text-xl md:text-2xl">{currentPlan.topic} Study Guide</h3>
                </div>

                <div className="space-y-6 text-sm text-slate-655 dark:text-slate-350">
                  <div>
                    <h4 className="text-black dark:text-white font-bold text-sm md:text-base mb-3 flex items-center gap-1.5"><i className="fi fi-sr-target flex items-center text-indigo-500" /> Study Targets</h4>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 font-sans leading-relaxed text-sm md:text-base">
                      {currentPlan.goals?.map((goal, idx) => <li key={idx}>{goal}</li>)}
                    </ul>
                  </div>

                  <hr className="border-slate-200 dark:border-slate-800" />

                  {/* Global Studio Tools */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <i className="fi fi-sr-palette text-indigo-500 flex items-center text-base" />
                      <h4 className="text-black dark:text-white font-bold text-sm md:text-base">Studio Tools for {currentPlan.topic}</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {studioTools.map((tool) => (
                        <div
                          key={tool.id}
                          onClick={() => {
                            window.open(`/student/studio-view?planId=${currentPlan.id}&tool=${tool.id}`, '_blank');
                          }}
                          className="group relative p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden text-left flex flex-col cursor-pointer"
                        >
                          <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${tool.chip} opacity-5 group-hover:opacity-10 rounded-bl-full -mr-4 -mt-4 transition-all duration-500 group-hover:scale-110`} />
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.chip} flex items-center justify-center text-white text-lg mb-3 shadow-md group-hover:scale-110 transition-transform origin-left`}>
                            <i className={`fi ${tool.icon} leading-none`} />
                          </div>
                          <h6 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-indigo-600 transition-colors">{tool.label}</h6>
                          <p className="text-[10px] text-slate-500 font-medium leading-tight hidden md:block">{tool.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <hr className="border-slate-200 dark:border-slate-800" />

                  <div>
                    <h4 className="text-black dark:text-white font-bold text-sm md:text-base mb-4 flex items-center gap-1.5"><i className="fi fi-sr-book-open-reader flex items-center text-indigo-500" /> Course Units</h4>
                    <div className="space-y-3">
                      {currentPlan.units?.map((unit, idx) => (
                        <div key={unit.id} className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base">{unit.title}</h5>
                            <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-md shrink-0">{unit.studyTime}</span>
                          </div>
                          <p className="text-xs md:text-sm text-slate-500 leading-relaxed">{unit.summary}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Workspace */}
              <div className="flex-1 min-h-[300px] md:h-[40%] rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-5 flex flex-col justify-between overflow-hidden">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-3 flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><i className="fi fi-sr-robot flex items-center text-indigo-400" /> AI Tutor</span>
                  <span className="text-indigo-400 lowercase truncate hidden sm:block">Connected to Smart Assistant 2.5</span>
                </div>

                {/* Message logs */}
                <div className="flex-1 overflow-y-auto my-3 space-y-4 pr-2 text-sm">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[90%] md:max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed font-sans ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-tr-sm"
                          : "bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-850 rounded-tl-sm"
                      }`} style={{ whiteSpace: "pre-line" }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl rounded-tl-sm px-4 py-3 text-slate-400 animate-pulse font-sans text-sm">
                        AI Tutor thinking...
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                    placeholder="Ask AI Tutor for examples..."
                    className="flex-1 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-black dark:text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500 font-sans"
                  />
                  <button
                    onClick={handleSendChat}
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors shrink-0"
                  >
                    Ask AI
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}