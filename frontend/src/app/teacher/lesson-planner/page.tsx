"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import InteractiveInfographic from "@/components/InteractiveInfographic";
import SlideVisual from "@/components/SlideVisual";

const syllabusOptions = ["TN State Board (Samacheer Kalvi)", "CBSE", "ICSE"];
const grades = ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const subjects = ["Mathematics", "Science", "Social Science", "English", "Tamil"];

const steps = [
  "Reading uploaded Textbook chapter...",
  "Querying Gemini 2.5 Flash AI Engine...",
  "Structuring pedagogical activities (Hook, Core, Evaluation)...",
  "Translating technical terminology to Tamil...",
  "Generating concept slides & visual infographics...",
  "Synthesizing audio script and video storyboard...",
];

interface LessonPlan {
  id: string;
  syllabus: string;
  grade: string;
  subject: string;
  topic: string;
  duration: string;
  infographic?: any;
  planData: {
    objectives: string[];
    timeline: { time: string; activity: string; description: string }[];
    bilingual: { english: string; tamil: string; pronunciation: string }[];
    exitTickets: { question: string; options: string[]; answer: string; rationale: string }[];
    slides?: { title: string; subtitle: string; bullets: string[]; graphicType: string; graphicData?: { label: string; values: string[] }; illustrationPrompt?: string; animationSuggestion?: string }[];
    podcast?: { hosts: string[]; script: { speaker: string; text: string; lang: string }[] };
    videoStoryboard?: { sceneNumber: number; visualDescription: string; narrationText: string; subtitles: string }[];
    infographic?: any;
  };
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function LessonPlannerPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [syllabus, setSyllabus] = useState(syllabusOptions[0]);
  const [grade, setGrade] = useState(grades[2]); // Grade 10
  const [subject, setSubject] = useState(subjects[0]); // Maths
  const [topic, setTopic] = useState("Pythagoras Theorem & Trigonometry");
  const [duration, setDuration] = useState("45 Minutes");

  // PDF Upload state
  const [fileName, setFileName] = useState("");
  const [uploadedText, setUploadedText] = useState("");
  const [isReadingFile, setIsReadingFile] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // DB-driven lesson plans state
  const [savedPlans, setSavedPlans] = useState<LessonPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<LessonPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // UI State
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "chat" | "studio">("overview");
  
  // Intelligence Studio Modals
  const [activeStudioTool, setActiveStudioTool] = useState<"slides" | "podcast" | "video" | "bilingual" | "assessment" | "visualExplain" | null>(null);

  // Concept slide deck state
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideFullscreen, setSlideFullscreen] = useState(false);

  // Podcast / Audio synthesis state
  const [isPlayingPodcast, setIsPlayingPodcast] = useState(false);
  const [podcastIndex, setPodcastIndex] = useState(-1);

  // Video storyboard player state
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoScene, setVideoScene] = useState(0);
  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // AI Chat Tutor state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Fetch saved plans on mount / schoolId update
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/teacher/lessons${schoolId ? `?schoolId=${schoolId}` : ""}`);
        const data = await res.json();
        if (data.success && data.data) {
          setSavedPlans(data.data);
          if (data.data.length > 0) {
            setCurrentPlan(data.data[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching lesson plans", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [schoolId, API_URL]);

  // Set chat messages welcome when a plan changes
  useEffect(() => {
    if (currentPlan) {
      setChatMessages([
        {
          role: "assistant",
          content: `Hello! I've loaded the textbook sources for **"${currentPlan.topic}"** (${currentPlan.grade}). \n\nAsk me anything! I can help you draft class worksheets, simplify explanations, translate definitions to Tamil, or write extra practice questions.`
        }
      ]);
    }
  }, [currentPlan]);

  // Handle PDF/Text upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsReadingFile(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        if (file.name.endsWith(".pdf")) {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          
          // Load PDF.js from CDN dynamically
          const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
          if (!pdfjsLib) {
            await new Promise<void>((resolve, reject) => {
              const script = document.createElement('script');
              script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
              script.onload = () => resolve();
              script.onerror = () => reject(new Error('Failed to load PDF script.'));
              document.head.appendChild(script);
            });
          }

          const pdfjs = (window as any)['pdfjs-dist/build/pdf'];
          pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

          const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
          const pdfDoc = await loadingTask.promise;
          let extractedText = "";

          for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(" ");
            extractedText += pageText + "\n";
          }

          setUploadedText(extractedText);
        } else {
          setUploadedText(event.target?.result as string);
        }

        setIsReadingFile(false);
        Swal.fire({
          icon: "success",
          title: "Textbook Chapter Uploaded!",
          text: `Successfully read and parsed ${file.name} context.`,
          timer: 1800,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error(err);
        setIsReadingFile(false);
        Swal.fire({
          icon: "error",
          title: "PDF Parsing Failed",
          text: "Could not extract text from the PDF file. Please copy-paste text instead.",
        });
      }
    };
    
    if (file.name.endsWith(".pdf")) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setCurrentPlan(null);
    setCurrentStep(0);
    setActiveSlide(0);
    setVideoScene(0);
    setIsVideoPlaying(false);
    if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    window.speechSynthesis.cancel();
    setIsPlayingPodcast(false);
    setPodcastIndex(-1);
    setActiveStudioTool(null);
    setChatMessages([]);
    setChatInput("");
    setActiveTab("overview");
    if (window.innerWidth < 768) setIsSidebarOpen(false);

    // Run step increments
    let stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 1000);

    try {
      const res = await fetch(`${API_URL}/api/ai/generate-lesson-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          syllabus,
          grade,
          subject,
          topic,
          duration,
          textbookContext: uploadedText || undefined
        })
      });

      const json = await res.json();
      clearInterval(stepInterval);

      if (json.success && json.data) {
        setCurrentPlan({
          id: "temp-unsaved",
          ...json.data
        });
      } else {
        throw new Error(json.error || "Failed to generate plan");
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Generation Failed",
        text: String(err),
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!currentPlan) return;
    try {
      setSaveStatus("Saving...");
      const res = await fetch(`${API_URL}/api/teacher/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          syllabus: currentPlan.syllabus,
          grade: currentPlan.grade,
          subject: currentPlan.subject,
          topic: currentPlan.topic,
          duration: currentPlan.duration,
          planData: currentPlan.planData,
          schoolId,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSavedPlans([data.data, ...savedPlans.filter((p) => p.id !== "temp-unsaved")]);
        setCurrentPlan(data.data);
        setSaveStatus("Saved successfully!");
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: "AI Lesson Plan written to database successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Error saving lesson plan", err);
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: String(err),
        confirmButtonColor: "#ef4444",
      });
      setSaveStatus("Error saving.");
    }
  };

  const handleDelete = async (id: string) => {
    if (id === "temp-unsaved") {
      setCurrentPlan(null);
      return;
    }

    const result = await Swal.fire({
      title: "Delete Lesson Plan?",
      text: "Are you sure you want to permanently delete this lesson plan?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/teacher/lessons/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        const filtered = savedPlans.filter((p) => p.id !== id);
        setSavedPlans(filtered);
        if (currentPlan?.id === id) {
          setCurrentPlan(filtered.length > 0 ? filtered[0] : null);
        }
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Lesson plan has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Error deleting lesson plan", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Could not complete delete.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

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
          subject,
          grade,
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
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Error communicating with AI. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const speakPodcast = (script: any[]) => {
    if (isPlayingPodcast) {
      window.speechSynthesis.cancel();
      setIsPlayingPodcast(false);
      setPodcastIndex(-1);
      return;
    }

    setIsPlayingPodcast(true);
    let index = 0;
    setPodcastIndex(0);

    const speakNext = () => {
      if (index >= script.length || !isPlayingPodcast) {
        setIsPlayingPodcast(false);
        setPodcastIndex(-1);
        return;
      }

      setPodcastIndex(index);
      const line = script[index];
      const utterance = new SpeechSynthesisUtterance(line.text);
      
      const voices = window.speechSynthesis.getVoices();
      if (line.speaker.includes("Meera")) {
        const tamilVoice = voices.find(v => v.lang.includes("ta"));
        const femaleVoice = voices.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("google US English"));
        utterance.voice = tamilVoice || femaleVoice || voices[0];
        utterance.pitch = 1.15;
        utterance.rate = 0.95;
      } else {
        const maleVoice = voices.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("google UK English Male"));
        utterance.voice = maleVoice || voices[0];
        utterance.pitch = 0.95;
        utterance.rate = 1.05;
      }

      utterance.onend = () => {
        index++;
        speakNext();
      };

      utterance.onerror = () => {
        setIsPlayingPodcast(false);
        setPodcastIndex(-1);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  const toggleVideoPlayback = (storyboard: any[]) => {
    if (isVideoPlaying) {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
      setIsVideoPlaying(false);
    } else {
      setIsVideoPlaying(true);
      if (videoScene >= storyboard.length) setVideoScene(0);
      
      const interval = setInterval(() => {
        setVideoScene((prev) => {
          if (prev < storyboard.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            setIsVideoPlaying(false);
            return prev;
          }
        });
      }, 5000);
      videoIntervalRef.current = interval;
    }
  };

  useEffect(() => {
    return () => {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  // Theme configuration
  const theme = {
    bg: isDarkMode ? "bg-slate-950" : "bg-slate-50",
    bgCard: isDarkMode ? "bg-slate-900" : "bg-white",
    bgCardSoft: isDarkMode ? "bg-slate-900/50" : "bg-white/70",
    text: isDarkMode ? "text-white" : "text-slate-900",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
    border: isDarkMode ? "border-slate-800" : "border-slate-200",
    borderSoft: isDarkMode ? "border-slate-850" : "border-slate-100",
    inputBg: isDarkMode ? "bg-slate-950" : "bg-slate-50",
    sidebarOverlay: isDarkMode ? "bg-slate-950/90" : "bg-white/90",
  };

  return (
    <PortalLayout
      title="AI Lesson Studio"
      subtitle="Bilingual AI chapter sources, real-time doc chatting, and visual studio output synthesis"
    >
      <div className={`flex flex-col md:flex-row h-[calc(100vh-160px)] overflow-hidden rounded-2xl border ${theme.border} ${theme.bg} shadow-2xl transition-colors duration-300 relative`}>
        
        {/* Mobile Sidebar Toggle Overlay */}
        {isSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar (Left) */}
        <div className={`
          fixed md:relative z-50 h-full flex flex-col transition-all duration-300 ease-in-out shrink-0
          ${isSidebarOpen ? 'w-80 translate-x-0' : 'w-80 -translate-x-full md:w-0 md:translate-x-0'}
          ${theme.bgCard} border-r ${theme.border}
        `}>
          <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
            
            {/* Generate Form */}
            <div className={`p-4 rounded-2xl border ${theme.border} ${theme.bgCardSoft} shadow-sm backdrop-blur-xl`}>
              <h2 className={`${theme.text} font-bold text-xs mb-4 flex items-center gap-2`}>
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">📁</span> Document Sources
              </h2>
              
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className={`text-[10px] font-semibold ${theme.textMuted} block mb-1.5`}>Syllabus Standard</label>
                  <select
                    value={syllabus}
                    onChange={(e) => setSyllabus(e.target.value)}
                    className={`w-full ${theme.inputBg} border ${theme.borderSoft} rounded-xl px-3 py-2.5 text-xs ${theme.text} focus:outline-none focus:border-amber-500 transition-colors`}
                  >
                    {syllabusOptions.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-[10px] font-semibold ${theme.textMuted} block mb-1.5`}>Grade</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className={`w-full ${theme.inputBg} border ${theme.borderSoft} rounded-xl px-3 py-2.5 text-xs ${theme.text} focus:outline-none focus:border-amber-500 transition-colors`}
                    >
                      {grades.map((g) => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`text-[10px] font-semibold ${theme.textMuted} block mb-1.5`}>Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className={`w-full ${theme.inputBg} border ${theme.borderSoft} rounded-xl px-3 py-2.5 text-xs ${theme.text} focus:outline-none focus:border-amber-500 transition-colors`}
                    >
                      {subjects.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`text-[10px] font-semibold ${theme.textMuted} block mb-1.5`}>Topic / Chapter</label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Newton's Laws"
                    className={`w-full ${theme.inputBg} border ${theme.borderSoft} rounded-xl px-3 py-2.5 text-xs ${theme.text} placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors`}
                  />
                </div>

                <div>
                  <label className={`text-[10px] font-semibold ${theme.textMuted} block mb-1.5`}>Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className={`w-full ${theme.inputBg} border ${theme.borderSoft} rounded-xl px-3 py-2.5 text-xs ${theme.text} focus:outline-none focus:border-amber-500 transition-colors`}
                  >
                    <option>30 Minutes</option>
                    <option>45 Minutes</option>
                    <option>60 Minutes</option>
                  </select>
                </div>

                <div>
                  <label className={`text-[10px] font-semibold ${theme.textMuted} block mb-1.5`}>📖 Upload Chapter PDF</label>
                  <div className="flex gap-2">
                    <input type="file" accept=".pdf,.txt" onChange={handleFileUpload} className="hidden" id="pdf-upload" />
                    <label
                      htmlFor="pdf-upload"
                      className={`flex-1 ${theme.inputBg} border border-dashed ${theme.border} hover:border-amber-500 rounded-xl px-3 py-2.5 text-xs ${theme.textMuted} cursor-pointer flex items-center justify-center gap-2 truncate transition-all`}
                    >
                      {isReadingFile ? "⏳ Reading..." : fileName ? `📄 ${fileName.substring(0, 15)}...` : "📁 Choose File..."}
                    </label>
                  </div>
                  {uploadedText && <span className="text-[9px] text-emerald-500 font-bold block mt-1.5">✓ PDF context loaded into AI workspace.</span>}
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-900 text-xs font-black uppercase tracking-wider transition-all transform hover:scale-[1.02] shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
                >
                  {isGenerating ? "Synthesizing..." : "⚡ Generate Lesson"}
                </button>
              </form>
            </div>

            {/* Saved Plans */}
            <div>
              <h3 className={`${theme.text} font-bold text-xs px-1 mb-3`}>Saved Chapters</h3>
              {loading ? (
                <div className={`text-[10px] ${theme.textMuted} px-1`}>Loading saved data...</div>
              ) : savedPlans.length === 0 ? (
                <div className={`text-[10px] ${theme.textMuted} px-1`}>No saved plans.</div>
              ) : (
                <div className="space-y-2">
                  {savedPlans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => {
                        setCurrentPlan(plan);
                        setActiveSlide(0);
                        setVideoScene(0);
                        setIsVideoPlaying(false);
                        if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
                        window.speechSynthesis.cancel();
                        setIsPlayingPodcast(false);
                        setPodcastIndex(-1);
                        setActiveStudioTool(null);
                        setChatInput("");
                        setSyllabus(plan.syllabus);
                        setGrade(plan.grade);
                        setSubject(plan.subject);
                        setTopic(plan.topic);
                        setDuration(plan.duration);
                        if (window.innerWidth < 768) setIsSidebarOpen(false);
                      }}
                      className={`p-3 rounded-xl border text-[11px] cursor-pointer transition-all flex justify-between items-center group ${
                        currentPlan?.id === plan.id
                          ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm"
                          : `${theme.border} ${theme.bg} hover:border-amber-400 ${theme.textMuted}`
                      }`}
                    >
                      <span className="truncate font-bold flex-1">{plan.topic}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(plan.id);
                        }}
                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold px-2 hover:scale-110"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* Top Navbar */}
          <div className={`h-16 border-b ${theme.border} ${theme.bgCardSoft} backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 shrink-0 z-10`}>
            <div className="flex items-center gap-3 lg:gap-6">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2 rounded-lg hover:${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} ${theme.textMuted} transition-colors`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              
              {currentPlan && !isGenerating && (
                <div className="flex bg-slate-900/10 dark:bg-slate-900 rounded-xl p-1 shadow-inner border border-slate-200 dark:border-slate-800">
                  {[
                    { id: "overview", label: "Overview", icon: "📑" },
                    { id: "chat", label: "AI Tutor", icon: "🤖" },
                    { id: "studio", label: "Studio", icon: "✨" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                        activeTab === tab.id
                          ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                          : `text-slate-500 hover:${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`
                      }`}
                    >
                      <span className="text-sm">{tab.icon}</span> <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentPlan?.id === "temp-unsaved" && (
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-[10px] font-black text-white transition-transform hover:scale-105 shadow-md shadow-indigo-500/20"
                >
                  💾 SAVE PLAN
                </button>
              )}
            </div>
          </div>

          {/* Main Stage */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin relative">
            {isGenerating ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`max-w-md w-full p-8 rounded-3xl border ${theme.border} ${theme.bgCardSoft} backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center text-center`}>
                  <div className="relative mb-8">
                    <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-amber-500 text-xl">✨</div>
                  </div>
                  <h3 className={`${theme.text} font-bold text-lg mb-4`}>Synthesizing Knowledge...</h3>
                  <div className="space-y-3 w-full">
                    {steps.map((stepText, idx) => {
                      let statusClass = theme.textMuted;
                      let icon = "○";
                      if (idx < currentStep) {
                        statusClass = "text-emerald-500 font-bold";
                        icon = "✅";
                      } else if (idx === currentStep) {
                        statusClass = "text-amber-500 font-bold animate-pulse";
                        icon = "⏳";
                      }
                      return (
                        <div key={idx} className={`text-xs text-left flex items-start gap-3 ${statusClass} transition-colors`}>
                          <span className="shrink-0">{icon}</span>
                          <span className="leading-tight">{stepText}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : !currentPlan ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
                <div className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-5xl animate-bounce">
                  📓
                </div>
                <h2 className={`${theme.text} font-black text-2xl mb-3`}>Intelligence Class Workspace</h2>
                <p className={`text-sm ${theme.textMuted} leading-relaxed`}>
                  Select a topic, upload your textbook chapter, and let our AI generate a comprehensive, bilingual lesson plan with interactive slides and podcasts.
                </p>
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="mt-8 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform md:hidden"
                >
                  Open Sidebar to Start
                </button>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto h-full flex flex-col">
                
                {/* Header info */}
                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                  <div>
                    <div className="flex gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase">{currentPlan.grade}</span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">{currentPlan.subject}</span>
                    </div>
                    <h1 className={`${theme.text} font-black text-3xl md:text-4xl`}>{currentPlan.topic}</h1>
                    <p className={`text-xs ${theme.textMuted} mt-2 font-medium`}>{currentPlan.syllabus} • {currentPlan.duration}</p>
                  </div>
                </div>

                {/* Tab: Overview */}
                {activeTab === "overview" && (
                  <div className="flex-1 space-y-6">
                    <div className={`p-6 rounded-3xl border ${theme.border} ${theme.bgCard} shadow-sm`}>
                      <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="text-xl">🎯</span> Lesson Objectives
                      </h3>
                      <ul className="grid md:grid-cols-2 gap-4">
                        {currentPlan.planData?.objectives?.map((obj, i) => (
                          <li key={i} className={`p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 text-sm ${theme.text} flex gap-3`}>
                            <span className="text-indigo-500 font-bold shrink-0">{i + 1}.</span> {obj}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={`p-6 rounded-3xl border ${theme.border} ${theme.bgCard} shadow-sm`}>
                      <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <span className="text-xl">⏱️</span> Pedagogical Timeline
                      </h3>
                      <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-700 before:to-transparent space-y-8">
                        {currentPlan.planData?.timeline?.map((item, i) => (
                          <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-amber-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-xs font-bold">
                              {i+1}
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shadow-sm transition-transform hover:-translate-y-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">{item.activity}</span>
                                <span className="text-[10px] font-black px-2 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-md">{item.time}</span>
                              </div>
                              <p className={`text-xs ${theme.textMuted} leading-relaxed`}>{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Chat */}
                {activeTab === "chat" && (
                  <div className={`
                    flex flex-col overflow-hidden 
                    ${isDarkMode ? 'bg-[#0b141a]' : 'bg-[#efeae2]'}
                    absolute inset-0 z-20 
                    md:relative md:inset-auto md:flex-1 md:rounded-3xl md:border md:shadow-sm ${theme.border}
                  `}>
                    <div className={`p-3 md:p-4 border-b flex justify-between items-center shrink-0 ${isDarkMode ? 'bg-[#202c33] border-[#202c33]' : 'bg-[#f0f2f5] border-[#d1d7db]'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xl shadow-sm">🤖</div>
                        <div>
                          <h3 className={`font-bold text-sm ${isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]'}`}>AI Co-Teacher</h3>
                          <p className="text-[11px] text-[#00a884] font-medium">Online</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[85%] md:max-w-[75%] px-4 py-2 text-[14px] leading-relaxed shadow-sm ${
                            msg.role === "user"
                              ? `${isDarkMode ? 'bg-[#005c4b] text-[#e9edef]' : 'bg-[#d9fdd3] text-[#111b21]'} rounded-2xl rounded-tr-sm`
                              : `${isDarkMode ? 'bg-[#202c33] text-[#e9edef]' : 'bg-white text-[#111b21]'} rounded-2xl rounded-tl-sm`
                          }`} style={{ whiteSpace: "pre-line" }}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className={`px-4 py-3 rounded-2xl rounded-tl-sm text-sm ${isDarkMode ? 'bg-[#202c33]' : 'bg-white'} shadow-sm flex gap-1.5 items-center`}>
                            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{animationDelay: "150ms"}} />
                            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{animationDelay: "300ms"}} />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className={`p-2 flex gap-2 shrink-0 items-end ${isDarkMode ? 'bg-[#202c33]' : 'bg-[#f0f2f5]'}`}>
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                        placeholder="Type a message..."
                        className={`flex-1 rounded-full px-5 py-3 text-[15px] focus:outline-none transition-shadow ${isDarkMode ? 'bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0]' : 'bg-white text-[#111b21] placeholder-[#667781]'}`}
                      />
                      <button
                        onClick={handleSendChat}
                        className="w-12 h-12 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center shrink-0 transition-transform hover:scale-105 shadow-sm"
                      >
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path></svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab: Studio */}
                {activeTab === "studio" && (
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 h-full content-start overflow-y-auto pb-8">
                    {[
                      { id: "slides", label: "Slide Deck", icon: "🖼️", desc: "Interactive concept slides", bg: "from-blue-500 to-indigo-600" },
                      { id: "visualExplain", label: "Infographic", icon: "📊", desc: "Interactive visual mapping", bg: "from-emerald-400 to-teal-500" },
                      { id: "podcast", label: "Audio Podcast", icon: "🎙️", desc: "AI generated host summary", bg: "from-amber-400 to-orange-500" },
                      { id: "video", label: "Video Storyboard", icon: "🎥", desc: "Animated lecture simulation", bg: "from-rose-400 to-red-500" },
                      { id: "bilingual", label: "Bilingual Glossary", icon: "🌐", desc: "Tamil translation matrix", bg: "from-violet-500 to-purple-600" },
                      { id: "assessment", label: "Exit Tickets", icon: "✍️", desc: "Quick assessment MCQs", bg: "from-cyan-400 to-blue-500" }
                    ].map((tool) => (
                      <div
                        key={tool.id}
                        onClick={() => {
                          if (currentPlan) {
                            if (currentPlan.id === "temp-unsaved") {
                              localStorage.setItem("tempStudioData", JSON.stringify(currentPlan));
                            }
                            window.open(`/teacher/studio-view?planId=${currentPlan.id}&tool=${tool.id}`, '_blank');
                          }
                        }}
                        className={`group relative p-4 md:p-6 rounded-3xl border ${theme.border} ${theme.bgCard} shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden text-left flex flex-col cursor-pointer`}
                        role="button"
                        tabIndex={0}
                      >
                        <div className={`absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br ${tool.bg} opacity-10 rounded-bl-full -mr-6 -mt-6 md:-mr-8 md:-mt-8 group-hover:scale-110 transition-transform duration-500`} />
                        <div className="text-3xl md:text-4xl mb-3 md:mb-4 group-hover:scale-110 transition-transform origin-left">{tool.icon}</div>
                        <h4 className={`text-sm md:text-lg font-black ${theme.text} mb-1 transition-colors group-hover:text-indigo-500`}>{tool.label}</h4>
                        <p className={`text-[10px] md:text-xs ${theme.textMuted} font-medium leading-tight hidden sm:block`}>{tool.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      </PortalLayout>
  );
}
