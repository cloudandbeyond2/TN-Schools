"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import InteractiveInfographic from "@/components/InteractiveInfographic";
import SlideVisual from "@/components/SlideVisual";
import { MoreVertical, X, Megaphone, Save, Sparkles, BookOpen, BarChart, Bot, CheckCircle, Globe, Hourglass, FileText, Video, Folder, Star, Book, Check, Monitor, Eye, Target, Clipboard, Timer } from "lucide-react";

const syllabusOptions = ["TN State Board (Samacheer Kalvi)", "CBSE", "ICSE"];
const grades = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const subjects = ["Mathematics", "Science", "Social Science", "English", "Tamil"];
const sections = ["All", "A", "B", "C", "D", "E"];

const steps = [
  "Reading uploaded Textbook chapter...",
  "Querying Gemini 2.5 Flash AI Engine...",
  "Structuring pedagogical activities (Hook, Core, Evaluation)...",
  "Translating technical terminology to Tamil...",
  "Generating concept slides & visual infographics...",
  "Synthesizing audio script and generating AI video...",
];

interface LessonPlan {
  id: string;
  syllabus: string;
  grade: string;
  subject: string;
  topic: string;
  duration: string;
  section?: string | null;
  infographic?: any;
  isPublished?: boolean;
  planData: {
    objectives: string[];
    timeline: { time: string; activity: string; description: string }[];
    studentKeyPoints?: { en: string[]; ta: string[] };
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
  const [grade, setGrade] = useState(grades[4]); // Grade 10
  const [subject, setSubject] = useState(subjects[0]); // Maths
  const [section, setSection] = useState<string>("All"); // Section targeting
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
  const [isSidebarMenuOpen, setIsSidebarMenuOpen] = useState(false);
  const [isNavbarMenuOpen, setIsNavbarMenuOpen] = useState(false);

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

  // Publish + present + bilingual state
  const [publishing, setPublishing] = useState(false);
  const [lang, setLang] = useState<"en" | "ta">("en");
  const [presenting, setPresenting] = useState(false);
  const [presentIndex, setPresentIndex] = useState(0);

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
          section,
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

  const handlePublish = async (publish: boolean) => {
    if (!currentPlan) return;
    setPublishing(true);
    try {
      // Auto-save an unsaved plan first so it has a real id
      let plan = currentPlan;
      if (plan.id === "temp-unsaved") {
        const saveRes = await fetch(`${API_URL}/api/teacher/lessons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            syllabus: plan.syllabus, grade: plan.grade, subject: plan.subject,
            topic: plan.topic, duration: plan.duration, planData: plan.planData,
            schoolId, section,
          }),
        });
        const saveData = await saveRes.json();
        if (!saveData.success) throw new Error(saveData.error || "Could not save before publishing");
        plan = saveData.data;
        setSavedPlans((prev) => [plan, ...prev.filter((p) => p.id !== "temp-unsaved")]);
      }

      const res = await fetch(`${API_URL}/api/teacher/lessons/${plan.id}/publish`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: publish, section }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Publish failed");

      const updated = { ...plan, isPublished: publish, section: section === 'All' ? null : section };
      setCurrentPlan(updated);
      setSavedPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      const secLabel = section === 'All' ? `All sections of ${plan.grade}` : `${plan.grade} – Section ${section}`;
      Swal.fire({
        icon: "success",
        title: publish ? "Published to Class!" : "Unpublished",
        text: publish
          ? `Students in ${secLabel} • ${plan.subject} can now see this lesson.`
          : "This lesson is no longer visible to students.",
        timer: 2200,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Publish Failed", text: String(err), confirmButtonColor: "#ef4444" });
    } finally {
      setPublishing(false);
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

  // Present-mode slides: title → each key point → infographic
  const presentPoints = (currentPlan?.planData?.studentKeyPoints?.[lang] || currentPlan?.planData?.studentKeyPoints?.en || []);
  const presentTotal = currentPlan ? presentPoints.length + 2 : 0; // title + points + infographic

  useEffect(() => {
    if (!presenting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") setPresentIndex((i) => Math.min(i + 1, presentTotal - 1));
      else if (e.key === "ArrowLeft" || e.key === "PageUp") setPresentIndex((i) => Math.max(i - 1, 0));
      else if (e.key === "Escape") setPresenting(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [presenting, presentTotal]);

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
      <div className={`grid grid-cols-1 xl:grid-cols-4 min-h-[calc(100vh-160px)] xl:h-[calc(100vh-160px)] rounded-2xl border ${theme.border} ${theme.bg} shadow-2xl transition-colors duration-300 relative overflow-y-auto xl:overflow-hidden`}>

        {/* Sidebar (Left) */}
        <div className={`col-span-1 flex flex-col ${theme.bgCard} border-b xl:border-b-0 xl:border-r ${theme.border} h-fit xl:h-full overflow-y-auto`}>
          <div className="flex-1 p-5 space-y-6 scrollbar-thin">

            {/* Generate Form */}
            <div className={`p-4 rounded-2xl border ${theme.border} ${theme.bgCardSoft} shadow-sm backdrop-blur-xl`}>
              <h2 className={`${theme.text} font-bold text-xs mb-4 flex items-center gap-2`}>
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500"><Folder className="w-4 h-4 inline-block mr-1 text-inherit" /></span> Document Sources
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

                {/* Section Targeting */}
                <div>
                  <label className={`text-[10px] font-semibold ${theme.textMuted} block mb-1.5`}>
                    Section <span className="text-amber-500"><Star className="w-4 h-4 inline-block mr-1 text-inherit" /></span>
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {sections.map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setSection(sec)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border ${section === sec
                          ? "bg-amber-500 text-slate-900 border-amber-500 shadow-md shadow-amber-500/25"
                          : `${theme.inputBg} ${theme.border} ${theme.textMuted} hover:border-amber-400`
                          }`}
                      >
                        {sec === "All" ? <><Megaphone className="w-3 h-3 inline mr-1" /> All</> : sec}
                      </button>
                    ))}
                  </div>
                  <p className={`text-[9px] ${theme.textMuted} mt-1.5`}>
                    {section === "All" ? "Visible to all sections of this grade" : `Visible to Section ${section} only`}
                  </p>
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
                  <label className={`text-[10px] font-semibold ${theme.textMuted} block mb-1.5`}><Book className="w-4 h-4 inline-block mr-1 text-inherit" /> Upload Chapter PDF</label>
                  <div className="flex gap-2">
                    <input type="file" accept=".pdf,.txt" onChange={handleFileUpload} className="hidden" id="pdf-upload" />
                    <label
                      htmlFor="pdf-upload"
                      className={`flex-1 ${theme.inputBg} border border-dashed ${theme.border} hover:border-amber-500 rounded-xl px-3 py-2.5 text-xs ${theme.textMuted} cursor-pointer flex items-center justify-center gap-2 truncate transition-all`}
                    >
                      {isReadingFile ? " Reading..." : fileName ? ` ${fileName.substring(0, 15)}...` : " Choose File..."}
                    </label>
                  </div>
                  {uploadedText && <span className="text-[9px] text-emerald-500 font-bold block mt-1.5"><Check className="w-4 h-4 inline-block mr-1 text-inherit" /> PDF context loaded into AI workspace.</span>}
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-900 text-xs font-black uppercase tracking-wider transition-all transform hover:scale-[1.02] shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
                >
                  {isGenerating ? "Synthesizing..." : " Generate Lesson"}
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
                        setSection(plan.section ? plan.section : "All");
                        setTopic(plan.topic);
                        setDuration(plan.duration);
                        if (window.innerWidth < 768) setIsSidebarOpen(false);
                      }}
                      className={`p-3 rounded-xl border text-[11px] cursor-pointer transition-all flex justify-between items-center group ${currentPlan?.id === plan.id
                        ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm"
                        : `${theme.border} ${theme.bg} hover:border-amber-400 ${theme.textMuted}`
                        }`}
                    >
                      <div className="truncate font-bold flex-1">
                        <span>{plan.topic}</span>
                        <span className={`block text-[9px] mt-0.5 font-medium ${currentPlan?.id === plan.id ? 'text-amber-600 dark:text-amber-500' : theme.textMuted
                          }`}>
                          {plan.grade}{plan.section ? ` · §${plan.section}` : " · All"} · {plan.subject}
                          {plan.isPublished && <span className="ml-1.5 text-emerald-500">● Live</span>}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(plan.id);
                        }}
                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold px-2 hover:scale-110"
                      >
                        <X className="w-4 h-4 inline-block mr-1 text-inherit" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-1 xl:col-span-3 flex flex-col h-full overflow-hidden relative">

          {/* Top Navbar */}
          <div className={`h-16 border-b ${theme.border} ${theme.bgCardSoft} backdrop-blur-xl flex items-center justify-between px-4 xl:px-6 shrink-0 z-10`}>
            <div className="flex items-center gap-3 xl:gap-6">

              {currentPlan && !isGenerating && (
                <div className="flex bg-slate-900/10 dark:bg-slate-900 rounded-xl p-1 shadow-inner border border-slate-200 dark:border-slate-800">
                  {[
                    { id: "overview", label: "Overview", icon: <FileText className="w-5 h-5" /> },
                    { id: "chat", label: "AI Tutor", icon: <Bot className="w-5 h-5" /> },
                    { id: "studio", label: "Studio", icon: <Sparkles className="w-5 h-5" /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === tab.id
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                        : `text-slate-500 hover:${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`
                        }`}
                    >
                      <span className="text-sm">{tab.icon}</span> <span className="hidden xl:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 xl:gap-3">
              {currentPlan && !isGenerating && (
                <>
                  {currentPlan.isPublished ? (
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                      {currentPlan.section && <span className="ml-1 normal-case font-bold text-emerald-500">§{currentPlan.section}</span>}
                    </span>
                  ) : (
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase">Draft</span>
                  )}

                  <button
                    onClick={() => { setPresentIndex(0); setPresenting(true); }}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-black text-slate-700 dark:text-white bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                    title="Fullscreen projection for the class"
                  >
                    <Monitor className="w-4 h-4 inline-block mr-1 text-inherit" /><Star className="w-4 h-4 inline-block mr-1 text-inherit" /> PRESENT
                  </button>

                  {currentPlan.id === "temp-unsaved" && (
                    <button
                      onClick={handleSave}
                      className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-[10px] font-black text-white transition-transform hover:scale-105 shadow-md shadow-indigo-500/20"
                    >
                      <><Save className="w-3 h-3 inline mr-1" /> SAVE</>
                    </button>
                  )}

                  <button
                    onClick={() => handlePublish(!currentPlan.isPublished)}
                    disabled={publishing}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black text-black transition-transform hover:scale-105 shadow-md disabled:opacity-60 ${currentPlan.isPublished
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/20"
                      }`}
                  >
                    {publishing ? "..." : currentPlan.isPublished ? "UNPUBLISH" : <><Megaphone className="w-3 h-3 inline mr-1" /> PUBLISH TO CLASS</>}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Main Stage */}
          <div className="flex-1 overflow-y-auto p-4 xl:p-8 scrollbar-thin relative">
            {isGenerating ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`max-w-md w-full p-8 rounded-3xl border ${theme.border} ${theme.bgCardSoft} backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center text-center`}>
                  <div className="relative mb-8">
                    <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-amber-500"><Sparkles className="w-6 h-6" /></div>
                  </div>
                  <h3 className={`${theme.text} font-bold text-lg mb-4`}>Synthesizing Knowledge...</h3>
                  <div className="space-y-3 w-full">
                    {steps.map((stepText, idx) => {
                      let statusClass = theme.textMuted;
                      let icon: any = "○";
                      if (idx < currentStep) {
                        statusClass = "text-emerald-500 font-bold";
                        icon = <CheckCircle className="w-4 h-4 text-emerald-500" />;
                      } else if (idx === currentStep) {
                        statusClass = "text-amber-500 font-bold animate-pulse";
                        icon = <Hourglass className="w-5 h-5" />;
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
                  <Book className="w-4 h-4 inline-block mr-1 text-inherit" />
                </div>
                <h2 className={`${theme.text} font-black text-2xl mb-3`}>Intelligence Class Workspace</h2>
                <p className={`text-sm ${theme.textMuted} leading-relaxed`}>
                  Select a topic, upload your textbook chapter, and let our AI generate a comprehensive, bilingual lesson plan with interactive slides and podcasts.
                </p>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="mt-8 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform xl:hidden"
                >
                  Open Sidebar to Start
                </button>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto h-full flex flex-col">

                {/* Header info */}
                <div className="mb-6 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4">
                  <div>
                    <div className="flex gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase">{currentPlan.grade}</span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">{currentPlan.subject}</span>
                    </div>
                    <h1 className={`${theme.text} font-black text-3xl xl:text-4xl`}>{currentPlan.topic}</h1>
                    <p className={`text-xs ${theme.textMuted} mt-2 font-medium`}>{currentPlan.syllabus} • {currentPlan.duration}</p>
                  </div>
                </div>

                {/* Tab: Overview */}
                {activeTab === "overview" && (
                  <div className="flex-1 space-y-6">
                    {/* Student-facing preview banner + language toggle */}
                    <div className={`p-4 rounded-2xl border ${theme.border} bg-gradient-to-r from-emerald-500/5 to-teal-500/5 flex flex-wrap items-center justify-between gap-3`}>
                      <p className={`text-xs font-bold ${theme.textMuted} flex items-center gap-2`}>
                        <span className="text-base"><Eye className="w-4 h-4 inline-block mr-1 text-inherit" /><Star className="w-4 h-4 inline-block mr-1 text-inherit" /></span> This is what students see when you publish — clear key points + the infographic.
                      </p>
                      <div className="flex bg-slate-900/10 dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
                        {(["en", "ta"] as const).map((l) => (
                          <button
                            key={l}
                            onClick={() => setLang(l)}
                            className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${lang === l ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"}`}
                          >
                            {l === "en" ? "English" : "தமிழ்"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Student Key Points — the "clear points of view" */}
                    {currentPlan.planData?.studentKeyPoints && (
                      <div className={`p-6 rounded-3xl border ${theme.border} ${theme.bgCard} shadow-sm`}>
                        <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <span className="text-xl"><Target className="w-4 h-4 inline-block mr-1 text-inherit" /></span> Key Points to Remember
                        </h3>
                        <ul className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                          {(currentPlan.planData.studentKeyPoints[lang] || currentPlan.planData.studentKeyPoints.en || []).map((pt, i) => (
                            <li key={i} className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 text-sm flex gap-3">
                              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center shrink-0">{i + 1}</span>
                              <span className={theme.text}>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Visual Infographic */}
                    {currentPlan.planData?.infographic && (
                      <div className={`p-2 xl:p-4 rounded-3xl border ${theme.border} ${theme.bgCard} shadow-sm overflow-hidden`}>
                        <h3 className="text-sm font-bold text-violet-500 uppercase tracking-widest mb-2 px-3 pt-2 flex items-center gap-2">
                          <span className="text-xl"><BarChart className="w-4 h-4 inline mr-1 text-emerald-500" /></span> Concept Infographic
                        </h3>
                        <InteractiveInfographic topic={currentPlan.topic} subject={currentPlan.subject} data={currentPlan.planData.infographic} />
                      </div>
                    )}

                    <div className={`p-6 rounded-3xl border ${theme.border} ${theme.bgCard} shadow-sm`}>
                      <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="text-xl"><Clipboard className="w-4 h-4 inline-block mr-1 text-inherit" /></span> Lesson Objectives
                      </h3>
                      <ul className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {currentPlan.planData?.objectives?.map((obj, i) => (
                          <li key={i} className={`p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 text-sm  flex gap-3`}>
                            <span className="text-gray-500 font-bold shrink-0">{i + 1}.</span> {obj}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={`p-6 rounded-3xl border ${theme.border} ${theme.bgCard} shadow-sm`}>
                      <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <span className="text-xl"><Timer className="w-4 h-4 inline-block mr-1 text-inherit" /><Star className="w-4 h-4 inline-block mr-1 text-inherit" /></span> Pedagogical Timeline
                      </h3>
                      <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px xl:before:mx-auto xl:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-700 before:to-transparent space-y-8">
                        {currentPlan.planData?.timeline?.map((item, i) => (
                          <div key={i} className="relative flex items-center justify-between xl:justify-normal xl:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-amber-500 text-white shadow shrink-0 xl:order-1 xl:group-odd:-translate-x-1/2 xl:group-even:translate-x-1/2 z-10 text-xs font-bold">
                              {i + 1}
                            </div>
                            <div className="w-[calc(100%-4rem)] xl:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shadow-sm transition-transform hover:-translate-y-1">
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
                    xl:relative xl:inset-auto xl:flex-1 xl:rounded-3xl xl:border xl:shadow-sm ${theme.border}
                  `}>
                    <div className={`p-3 xl:p-4 border-b flex justify-between items-center shrink-0 ${isDarkMode ? 'bg-[#202c33] border-[#202c33]' : 'bg-[#f0f2f5] border-[#d1d7db]'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xl shadow-sm"><Bot className="w-4 h-4 inline mr-1 text-blue-500" /></div>
                        <div>
                          <h3 className={`font-bold text-sm ${isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]'}`}>AI Co-Teacher</h3>
                          <p className="text-[11px] text-[#00a884] font-medium">Online</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[85%] xl:max-w-[75%] px-4 py-2 text-[14px] leading-relaxed shadow-sm ${msg.role === "user"
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
                            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
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
                  <div className="flex-1 grid grid-cols-2 xl:grid-cols-3 gap-3 xl:gap-6 h-full content-start overflow-y-auto pb-8">
                    {[
                      { id: "slides", label: "Slide Deck", icon: "", desc: "Interactive concept slides", bg: "from-blue-500 to-indigo-600" },
                      { id: "visualExplain", label: "Infographic", icon: <BarChart className="w-5 h-5" />, desc: "Interactive visual mapping", bg: "from-emerald-400 to-teal-500" },
                      { id: "podcast", label: "Audio Podcast", icon: "", desc: "AI generated host summary", bg: "from-amber-400 to-orange-500" },
                      { id: "video", label: "Generate Video", icon: <Video className="w-5 h-5" />, desc: "Animated lecture simulation", bg: "from-rose-400 to-red-500" },
                      { id: "bilingual", label: "Bilingual Glossary", icon: <Globe className="w-5 h-5" />, desc: "Tamil translation matrix", bg: "from-violet-500 to-purple-600" },
                      { id: "assessment", label: "Exit Tickets", icon: "", desc: "Quick assessment MCQs", bg: "from-cyan-400 to-blue-500" }
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
                        className={`group relative p-4 xl:p-6 rounded-3xl border ${theme.border} ${theme.bgCard} shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden text-left flex flex-col cursor-pointer`}
                        role="button"
                        tabIndex={0}
                      >
                        <div className={`absolute top-0 right-0 w-24 h-24 xl:w-32 xl:h-32 bg-gradient-to-br ${tool.bg} opacity-10 rounded-bl-full -mr-6 -mt-6 xl:-mr-8 xl:-mt-8 group-hover:scale-110 transition-transform duration-500`} />
                        <div className="text-3xl xl:text-4xl mb-3 xl:mb-4 group-hover:scale-110 transition-transform origin-left">{tool.icon}</div>
                        <h4 className={`text-sm xl:text-lg font-black ${theme.text} mb-1 transition-colors group-hover:text-indigo-500`}>{tool.label}</h4>
                        <p className={`text-[10px] xl:text-xs ${theme.textMuted} font-medium leading-tight hidden xl:block`}>{tool.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ───── Present (fullscreen projection) ───── */}
      {presenting && currentPlan && (
        <div className="fixed inset-0 z-[100] bg-white text-slate-900 flex flex-col">
          {/* Background decoration */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[100px] opacity-50" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-[100px] opacity-50" />
          </div>

          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-slate-100 relative z-10 bg-white/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase border border-indigo-100">{currentPlan.grade} • {currentPlan.subject}</span>
              <div className="flex bg-slate-100 rounded-lg p-1">
                {(["en", "ta"] as const).map((l) => (
                  <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${lang === l ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                    {l === "en" ? "EN" : "தமிழ்"}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setPresenting(false)} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Slide stage */}
          <div className="flex-1 flex items-center justify-center px-6 xl:px-20 overflow-hidden relative z-10">
            {presentIndex === 0 ? (
              <div className="text-center animate-in fade-in zoom-in duration-500 max-w-5xl">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-indigo-50 text-6xl mb-8 shadow-inner border border-indigo-100">
                  {currentPlan.planData?.infographic?.heroIcon || <BookOpen className="w-12 h-12" />}
                </div>
                <h1 className="text-5xl xl:text-7xl font-black text-slate-900 mb-6 leading-tight tracking-tight drop-shadow-sm">{currentPlan.topic}</h1>
                <p className="text-slate-500 text-xl xl:text-2xl font-semibold tracking-wide uppercase">{currentPlan.syllabus}</p>
              </div>
            ) : presentIndex <= presentPoints.length ? (
              <div className="max-w-4xl w-full text-left animate-in fade-in slide-in-from-right-8 duration-400 bg-white rounded-[2.5rem] p-10 xl:p-16 shadow-2xl border border-slate-100 flex flex-col md:flex-row items-center gap-8 xl:gap-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>

                <div className="shrink-0 flex flex-col items-center justify-center w-32 h-32 xl:w-48 xl:h-48 rounded-[2rem] bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-xl shadow-emerald-500/30 transform -rotate-3 transition-transform relative z-10">
                  <span className="text-5xl xl:text-7xl font-black mb-1">{presentIndex}</span>
                  <span className="text-xs xl:text-sm uppercase tracking-widest font-bold opacity-80">Key Point</span>
                </div>

                <div className="flex-1 relative z-10">
                  {(() => {
                    const pt = presentPoints[presentIndex - 1] || "";
                    const splitIdx = pt.indexOf(':');
                    if (splitIdx > 0 && splitIdx < 50) {
                      return (
                        <>
                          <h3 className="text-2xl xl:text-3xl font-black text-emerald-600 mb-4 uppercase tracking-wide">{pt.substring(0, splitIdx)}</h3>
                          <p className="text-3xl xl:text-5xl font-bold text-slate-800 leading-snug tracking-tight">{pt.substring(splitIdx + 1).trim()}</p>
                        </>
                      )
                    }
                    return <p className="text-3xl xl:text-5xl font-bold text-slate-800 leading-snug tracking-tight">{pt}</p>;
                  })()}
                </div>
              </div>
            ) : (
              <div className="w-full max-w-6xl h-full overflow-y-auto animate-in fade-in zoom-in duration-500 pb-12 pt-4 px-2 xl:px-8">
                <InteractiveInfographic topic={currentPlan.topic} subject={currentPlan.subject} data={currentPlan.planData?.infographic} />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 px-6 py-6 shrink-0 relative z-10 bg-white/80 backdrop-blur-md border-t border-slate-100">
            <button
              onClick={() => setPresentIndex((i) => Math.max(i - 1, 0))}
              disabled={presentIndex === 0}
              className="px-8 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold disabled:opacity-30 transition-all text-sm xl:text-base"
            >
              ← Previous
            </button>
            <div className="flex gap-2 mx-4">
              {Array.from({ length: presentTotal }).map((_, i) => (
                <button key={i} onClick={() => setPresentIndex(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === presentIndex ? "bg-emerald-500 w-8 shadow-md shadow-emerald-500/30" : "bg-slate-200 hover:bg-slate-300"}`} />
              ))}
            </div>
            <button
              onClick={() => setPresentIndex((i) => Math.min(i + 1, presentTotal - 1))}
              disabled={presentIndex >= presentTotal - 1}
              className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold disabled:opacity-30 transition-all text-sm xl:text-base shadow-lg shadow-emerald-500/20"
            >
              Next →
            </button>
          </div>
        </div>
      )}

    </PortalLayout>
  );
}
