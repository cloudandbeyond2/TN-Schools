"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import InteractiveInfographic from "@/components/InteractiveInfographic";

const syllabusOptions = ["TN State Board (Samacheer Kalvi)", "CBSE", "ICSE"];
const grades = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const sections = ["All", "A", "B", "C", "D", "E"];

// Generation pipeline steps — each paired with a Flaticon icon shown in the loader
const steps = [
  { icon: "fi-sr-book-alt", text: "Reading uploaded Textbook chapter..." },
  { icon: "fi-sr-brain", text: "Querying Gemini 2.5 Flash AI Engine..." },
  { icon: "fi-sr-diagram-project", text: "Structuring pedagogical activities (Hook, Core, Evaluation)..." },
  { icon: "fi-sr-globe", text: "Translating technical terminology to Tamil..." },
  { icon: "fi-sr-chart-histogram", text: "Generating concept slides & visual infographics..." },
  { icon: "fi-sr-film", text: "Synthesizing audio script and generating AI video..." },
];

// Intelligence Studio tools — colorful Flaticon tiles
const studioTools = [
  { id: "slides", label: "Slide Deck", icon: "fi-sr-diagram-project", desc: "Interactive concept slides", chip: "from-blue-500 to-indigo-600" },
  { id: "visualExplain", label: "Infographic", icon: "fi-sr-chart-histogram", desc: "Interactive visual mapping", chip: "from-emerald-500 to-teal-600" },
  { id: "podcast", label: "Audio Podcast", icon: "fi-sr-comments", desc: "AI generated host summary", chip: "from-amber-500 to-orange-600" },
  { id: "video", label: "Generate Video", icon: "fi-sr-film", desc: "Animated lecture simulation", chip: "from-rose-500 to-pink-600" },
  { id: "bilingual", label: "Bilingual Glossary", icon: "fi-sr-globe", desc: "Tamil translation matrix", chip: "from-violet-500 to-purple-600" },
  { id: "assessment", label: "Exit Tickets", icon: "fi-sr-checkbox", desc: "Quick assessment MCQs", chip: "from-sky-500 to-indigo-600" },
] as const;

// KPI color rotation for the stat strip
const kpiTints = [
  { text: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  { text: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-500/10" },
  { text: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10" },
  { text: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-500/10" },
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

// A colorful Flaticon chip used across section headers
function FiChip({ icon, tint, soft }: { icon: string; tint: string; soft: string }) {
  return (
    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${soft} ${tint} text-lg shrink-0 shadow-sm`}>
      <i className={`fi ${icon} leading-none`} />
    </span>
  );
}

// A consistent, properly-aligned section header (icon chip + kicker + title)
function SectionHeader({ icon, tint, soft, kicker, title }: { icon: string; tint: string; soft: string; kicker: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <FiChip icon={icon} tint={tint} soft={soft} />
      <div>
        <span className={`block text-[10px] font-black uppercase tracking-[0.15em] ${tint}`}>{kicker}</span>
        <h3 className="font-black text-base text-slate-800 dark:text-white leading-tight">{title}</h3>
      </div>
    </div>
  );
}

export default function LessonPlannerPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [syllabus, setSyllabus] = useState(syllabusOptions[0]);
  const [grade, setGrade] = useState(grades[4]); // Grade 10
  const [schoolClasses, setSchoolClasses] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [subjectOptions, setSubjectOptions] = useState<{id: string; name: string}[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [section, setSection] = useState<string>("All"); // Section targeting
  const [topic, setTopic] = useState("Pythagoras Theorem & Trigonometry");
  const [duration, setDuration] = useState("45 Minutes");

  // Fetch school configuration for valid classes
  useEffect(() => {
    if (!schoolId) return;
    const fetchSchoolDetails = async () => {
      try {
        const res = await fetch(`${API_URL}/api/schools/${schoolId}`);
        const data = await res.json();
        if (data.success && data.data?.classes) {
          setSchoolClasses(data.data.classes);
          if (data.data.classes.length > 0) {
            setGrade(`Grade ${data.data.classes[0]}`);
          }
        }
      } catch (err) {
        console.error("Error fetching school details:", err);
      }
    };
    fetchSchoolDetails();
  }, [schoolId, API_URL]);

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

  // UI State — theme is driven by the real app theme (next-themes) so the page
  // no longer fights globals.css light-mode overrides.
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDarkMode = mounted && resolvedTheme === "dark";

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "chat" | "studio">("overview");

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

  // Publish + present state
  const [publishing, setPublishing] = useState(false);
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

  // Fetch subjects when grade changes
  useEffect(() => {
    const fetchSubjects = async () => {
      const classStr = grade.replace("Grade ", "");
      setLoadingSubjects(true);
      try {
        const res = await fetch(`${API_URL}/api/centralized-content/subjects?class=${classStr}`);
        const data = await res.json();
        if (data.success && data.data) {
          setSubjectOptions(data.data);
          if (data.data.length > 0) {
            setSubject((prev) => {
              if (data.data.find((s: any) => s.name === prev)) return prev;
              return data.data[0].name;
            });
          } else {
            setSubject("");
          }
        }
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
      } finally {
        setLoadingSubjects(false);
      }
    };
    if (grade) {
      fetchSubjects();
    }
  }, [grade, API_URL]);

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

  // Present-mode slides: title → each key point (bilingual) → infographic
  const kpEn = currentPlan?.planData?.studentKeyPoints?.en || [];
  const kpTa = currentPlan?.planData?.studentKeyPoints?.ta || [];
  const presentTotal = currentPlan ? kpEn.length + 2 : 0; // title + points + infographic

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
    borderSoft: isDarkMode ? "border-slate-800" : "border-slate-100",
    inputBg: isDarkMode ? "bg-slate-950" : "bg-slate-50",
  };

  const infographicData = currentPlan?.planData?.infographic;
  const stats = infographicData?.stats || [];

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
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 text-sm">
                  <i className="fi fi-sr-folder leading-none" />
                </span>
                Document Sources
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
                      {(schoolClasses.length > 0 ? schoolClasses : ["6", "7", "8", "9", "10", "11", "12"]).map((c) => (
                        <option key={c} value={`Grade ${c}`}>Grade {c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`text-[10px] font-semibold ${theme.textMuted} block mb-1.5`}>Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className={`w-full ${theme.inputBg} border ${theme.borderSoft} rounded-xl px-3 py-2.5 text-xs ${theme.text} focus:outline-none focus:border-amber-500 transition-colors`}
                      disabled={loadingSubjects}
                    >
                      {loadingSubjects ? (
                        <option>Loading...</option>
                      ) : subjectOptions.length > 0 ? (
                        subjectOptions.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)
                      ) : (
                        <option value="">No Subjects</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Section Targeting */}
                <div>
                  <label className={`text-[10px] font-semibold ${theme.textMuted} mb-1.5 flex items-center gap-1.5`}>
                    <i className="fi fi-sr-bullseye text-amber-500 leading-none" /> Section
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {sections.map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setSection(sec)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border inline-flex items-center gap-1 ${section === sec
                          ? "bg-amber-500 text-slate-900 border-amber-500 shadow-md shadow-amber-500/25"
                          : `${theme.inputBg} ${theme.border} ${theme.textMuted} hover:border-amber-400`
                          }`}
                      >
                        {sec === "All" ? <><i className="fi fi-sr-bell text-[9px] leading-none" /> All</> : sec}
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
                  <label className={`text-[10px] font-semibold ${theme.textMuted} mb-1.5 flex items-center gap-1.5`}>
                    <i className="fi fi-sr-cloud-upload text-sky-500 leading-none" /> Upload Chapter PDF
                  </label>
                  <div className="flex gap-2">
                    <input type="file" accept=".pdf,.txt" onChange={handleFileUpload} className="hidden" id="pdf-upload" />
                    <label
                      htmlFor="pdf-upload"
                      className={`flex-1 ${theme.inputBg} border border-dashed ${theme.border} hover:border-amber-500 rounded-xl px-3 py-2.5 text-xs ${theme.textMuted} cursor-pointer flex items-center justify-center gap-2 truncate transition-all`}
                    >
                      {isReadingFile ? "Reading..." : fileName ? `${fileName.substring(0, 15)}...` : "Choose File..."}
                    </label>
                  </div>
                  {uploadedText && (
                    <span className="text-[9px] text-emerald-500 font-bold mt-1.5 flex items-center gap-1">
                      <i className="fi fi-sr-check leading-none" /> PDF context loaded into AI workspace.
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-900 text-xs font-black uppercase tracking-wider transition-all transform hover:scale-[1.02] shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
                >
                  <i className="fi fi-sr-brain leading-none" />
                  {isGenerating ? "Synthesizing..." : "Generate Lesson"}
                </button>
              </form>
            </div>

            {/* Saved Plans */}
            <div>
              <h3 className={`${theme.text} font-bold text-xs px-1 mb-3 flex items-center gap-2`}>
                <i className="fi fi-sr-book-alt text-indigo-500 leading-none" /> Saved Chapters
              </h3>
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
                        aria-label="Delete lesson plan"
                      >
                        <i className="fi fi-sr-cross-small leading-none" />
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
                    { id: "overview", label: "Overview", icon: "fi-sr-document" },
                    { id: "chat", label: "AI Tutor", icon: "fi-sr-comment-alt" },
                    { id: "studio", label: "Studio", icon: "fi-sr-brain" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === tab.id
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                    >
                      <i className={`fi ${tab.icon} text-sm leading-none`} /> <span className="hidden xl:inline">{tab.label}</span>
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
                    className="px-3 py-1.5 rounded-lg text-[10px] font-black text-slate-700 dark:text-white bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all inline-flex items-center gap-1.5"
                    title="Fullscreen projection for the class"
                  >
                    <i className="fi fi-sr-eye leading-none" /> PRESENT
                  </button>

                  {currentPlan.id === "temp-unsaved" && (
                    <button
                      onClick={handleSave}
                      className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-[10px] font-black text-white transition-transform hover:scale-105 shadow-md shadow-indigo-500/20 inline-flex items-center gap-1.5"
                    >
                      <i className="fi fi-sr-check leading-none" /> SAVE
                    </button>
                  )}

                  <button
                    onClick={() => handlePublish(!currentPlan.isPublished)}
                    disabled={publishing}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-black text-black transition-transform hover:scale-105 shadow-md disabled:opacity-60 bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/20 inline-flex items-center gap-1.5"
                  >
                    {publishing ? "..." : currentPlan.isPublished ? "UNPUBLISH" : <><i className="fi fi-sr-bell leading-none" /> PUBLISH TO CLASS</>}
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
                    <div className="absolute inset-0 flex items-center justify-center text-amber-500 text-xl">
                      <i className="fi fi-sr-brain leading-none" />
                    </div>
                  </div>
                  <h3 className={`${theme.text} font-bold text-lg mb-4`}>Synthesizing Knowledge...</h3>
                  <div className="space-y-3 w-full">
                    {steps.map((step, idx) => {
                      let statusClass = theme.textMuted;
                      let icon = <i className={`fi ${step.icon} leading-none opacity-40`} />;
                      if (idx < currentStep) {
                        statusClass = "text-emerald-500 font-bold";
                        icon = <i className="fi fi-sr-badge-check text-emerald-500 leading-none" />;
                      } else if (idx === currentStep) {
                        statusClass = "text-amber-500 font-bold animate-pulse";
                        icon = <i className="fi fi-sr-hourglass-end text-amber-500 leading-none" />;
                      }
                      return (
                        <div key={idx} className={`text-xs text-left flex items-start gap-3 ${statusClass} transition-colors`}>
                          <span className="shrink-0 text-sm w-4 text-center">{icon}</span>
                          <span className="leading-tight">{step.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : !currentPlan ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
                <div className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-4xl animate-bounce shadow-xl shadow-indigo-500/30">
                  <i className="fi fi-sr-book-alt leading-none" />
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
              <div className="w-full h-full flex flex-col">

                {/* Hero band — topic header */}
                <div
                  className="mb-6 rounded-3xl p-6 xl:p-8 relative overflow-hidden shadow-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600"
                >
                  <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full" />
                  <div className="absolute -bottom-12 -left-8 w-40 h-40 bg-white/10 rounded-full" />
                  <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl leading-none overflow-hidden shadow-inner border border-white/20">
                        <span className="truncate max-w-full leading-none" style={{ color: "#fff" }}>
                          {(infographicData?.heroIcon && String(infographicData.heroIcon).slice(0, 2)) || <i className="fi fi-sr-book-alt leading-none" />}
                        </span>
                      </div>
                      <div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="px-2.5 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wide" style={{ color: "#fff" }}>{currentPlan.grade}</span>
                          <span className="px-2.5 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wide" style={{ color: "#fff" }}>{currentPlan.subject}</span>
                          <span className="px-2.5 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1" style={{ color: "#fff" }}>
                            <i className="fi fi-sr-clock leading-none" /> {currentPlan.duration}
                          </span>
                        </div>
                        <h1 className="font-black text-2xl xl:text-4xl leading-tight tracking-tight" style={{ color: "#fff" }}>{currentPlan.topic}</h1>
                        <p className="text-xs mt-2 font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>{currentPlan.syllabus}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tab: Overview */}
                {activeTab === "overview" && (
                  <div className="flex-1 space-y-6">

                    {/* KPI strip — adaptive so long Tamil values/descriptions stay fully visible */}
                    {stats.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {stats.slice(0, 3).map((stat: any, i: number) => {
                          const tint = kpiTints[i % kpiTints.length];
                          const val = String(stat.value ?? "");
                          const isShort = val.length <= 8;
                          return (
                            <div key={i} className={`p-4 rounded-2xl border ${theme.border} ${theme.bgCard} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col`}>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">{stat.label}</span>
                              <span className={`block font-black mt-0.5 leading-tight break-words ${tint.text} ${isShort ? "text-2xl font-mono" : "text-base"}`}>{stat.value}</span>
                              {stat.desc && <p className={`text-[11px] ${theme.textMuted} mt-1.5 leading-relaxed break-words`}>{stat.desc}</p>}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Student-facing preview banner */}
                    <div className={`p-4 rounded-2xl border ${theme.border} bg-emerald-50 dark:bg-emerald-500/5 flex flex-wrap items-center gap-3`}>
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 text-lg shrink-0">
                        <i className="fi fi-sr-eye leading-none" />
                      </span>
                      <p className={`text-xs font-bold ${theme.textMuted} flex-1`}>
                        This is what students see when you publish — clear bilingual key points + the infographic.
                      </p>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wide inline-flex items-center gap-1">
                        <i className="fi fi-sr-globe leading-none" /> English + தமிழ்
                      </span>
                    </div>

                    {/* Student Key Points — bilingual (English + Tamil together) */}
                    {kpEn.length > 0 && (
                      <div className={`p-6 rounded-3xl border ${theme.border} ${theme.bgCard} shadow-sm`}>
                        <SectionHeader icon="fi-sr-bulb" tint="text-emerald-600" soft="bg-emerald-500/10" kicker="Remember This" title="Key Points to Remember" />
                        <ul className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                          {kpEn.map((pt, i) => (
                            <li key={i} className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 flex gap-3">
                              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                              <div className="space-y-1.5 min-w-0">
                                <p className={`text-sm font-semibold ${theme.text}`}>{pt}</p>
                                {kpTa[i] && (
                                  <p className="text-sm text-emerald-700 dark:text-emerald-300 font-tamil leading-relaxed">{kpTa[i]}</p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Visual Infographic */}
                    {infographicData && (
                      <div className={`p-2 xl:p-4 rounded-3xl border ${theme.border} ${theme.bgCard} shadow-sm overflow-hidden`}>
                        <div className="px-3 pt-2">
                          <SectionHeader icon="fi-sr-chart-histogram" tint="text-violet-600" soft="bg-violet-500/10" kicker="Visual Explainer" title="Concept Infographic" />
                        </div>
                        <InteractiveInfographic topic={currentPlan.topic} subject={currentPlan.subject} data={infographicData} />
                      </div>
                    )}

                    {/* Bilingual glossary preview */}
                    {currentPlan.planData?.bilingual?.length > 0 && (
                      <div className={`p-6 rounded-3xl border ${theme.border} ${theme.bgCard} shadow-sm`}>
                        <SectionHeader icon="fi-sr-globe" tint="text-sky-600" soft="bg-sky-500/10" kicker="English + தமிழ்" title="Bilingual Key Terms" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {currentPlan.planData.bilingual.map((term, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-500/5 border border-sky-100 dark:border-sky-500/10 flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className={`text-sm font-bold ${theme.text} truncate`}>{term.english}</p>
                                <p className="text-sm text-sky-700 dark:text-sky-300 font-tamil truncate">{term.tamil}</p>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 shrink-0 italic">{term.pronunciation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lesson Objectives */}
                    <div className={`p-6 rounded-3xl border ${theme.border} ${theme.bgCard} shadow-sm`}>
                      <SectionHeader icon="fi-sr-bullseye" tint="text-indigo-600" soft="bg-indigo-500/10" kicker="Learning Goals" title="Lesson Objectives" />
                      <ul className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {currentPlan.planData?.objectives?.map((obj, i) => (
                          <li key={i} className={`p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 text-sm flex gap-3 ${theme.text}`}>
                            <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-black flex items-center justify-center shrink-0">{i + 1}</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Pedagogical Timeline */}
                    <div className={`p-6 rounded-3xl border ${theme.border} ${theme.bgCard} shadow-sm`}>
                      <SectionHeader icon="fi-sr-clock" tint="text-amber-600" soft="bg-amber-500/10" kicker="Lesson Flow" title="Pedagogical Timeline" />
                      <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px xl:before:mx-auto xl:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-700 before:to-transparent space-y-8">
                        {currentPlan.planData?.timeline?.map((item, i) => (
                          <div key={i} className="relative flex items-center justify-between xl:justify-normal xl:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-amber-500 text-white shadow shrink-0 xl:order-1 xl:group-odd:-translate-x-1/2 xl:group-even:translate-x-1/2 z-10 text-xs font-bold">
                              {i + 1}
                            </div>
                            <div className="w-[calc(100%-4rem)] xl:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shadow-sm transition-transform hover:-translate-y-1">
                              <div className="flex items-center justify-between mb-2 gap-2">
                                <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">{item.activity}</span>
                                <span className="text-[10px] font-black px-2 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-md shrink-0">{item.time}</span>
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
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg shadow-sm">
                          <i className="fi fi-sr-comment-alt leading-none" />
                        </div>
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
                        aria-label="Send message"
                      >
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path></svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab: Studio */}
                {activeTab === "studio" && (
                  <div className="flex-1 grid grid-cols-2 xl:grid-cols-3 gap-3 xl:gap-6 h-full content-start overflow-y-auto pb-8">
                    {studioTools.map((tool) => (
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
                        <div className={`absolute top-0 right-0 w-24 h-24 xl:w-32 xl:h-32 bg-gradient-to-br ${tool.chip} opacity-10 rounded-bl-full -mr-6 -mt-6 xl:-mr-8 xl:-mt-8 group-hover:scale-110 transition-transform duration-500`} />
                        <div className={`w-12 h-12 xl:w-14 xl:h-14 rounded-2xl bg-gradient-to-br ${tool.chip} flex items-center justify-center text-white text-xl xl:text-2xl mb-3 xl:mb-4 shadow-lg group-hover:scale-110 transition-transform origin-left`}>
                          <i className={`fi ${tool.icon} leading-none`} />
                        </div>
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
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase border border-emerald-100 inline-flex items-center gap-1">
                <i className="fi fi-sr-globe leading-none" /> English + தமிழ்
              </span>
            </div>
            <button onClick={() => setPresenting(false)} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors" aria-label="Exit presentation">
              <i className="fi fi-sr-cross-small leading-none text-xl" />
            </button>
          </div>

          {/* Slide stage */}
          <div className="flex-1 flex items-center justify-center px-6 xl:px-20 overflow-hidden relative z-10">
            {presentIndex === 0 ? (
              <div className="text-center animate-in fade-in zoom-in duration-500 max-w-5xl">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-indigo-50 text-6xl mb-8 shadow-inner border border-indigo-100">
                  {currentPlan.planData?.infographic?.heroIcon || <i className="fi fi-sr-book-alt leading-none text-indigo-500" />}
                </div>
                <h1 className="text-5xl xl:text-7xl font-black text-slate-900 mb-6 leading-tight tracking-tight drop-shadow-sm">{currentPlan.topic}</h1>
                <p className="text-slate-500 text-xl xl:text-2xl font-semibold tracking-wide uppercase">{currentPlan.syllabus}</p>
              </div>
            ) : presentIndex <= kpEn.length ? (
              <div className="max-w-4xl w-full text-left animate-in fade-in slide-in-from-right-8 duration-400 bg-white rounded-[2.5rem] p-10 xl:p-16 shadow-2xl border border-slate-100 flex flex-col md:flex-row items-center gap-8 xl:gap-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>

                <div className="shrink-0 flex flex-col items-center justify-center w-32 h-32 xl:w-48 xl:h-48 rounded-[2rem] bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-xl shadow-emerald-500/30 transform -rotate-3 transition-transform relative z-10">
                  <span className="text-5xl xl:text-7xl font-black mb-1">{presentIndex}</span>
                  <span className="text-xs xl:text-sm uppercase tracking-widest font-bold opacity-80">Key Point</span>
                </div>

                <div className="flex-1 relative z-10 space-y-4">
                  <p className="text-3xl xl:text-5xl font-bold text-slate-800 leading-snug tracking-tight">{kpEn[presentIndex - 1]}</p>
                  {kpTa[presentIndex - 1] && (
                    <p className="text-2xl xl:text-4xl font-semibold text-emerald-600 leading-snug font-tamil">{kpTa[presentIndex - 1]}</p>
                  )}
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
                <button key={i} onClick={() => setPresentIndex(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === presentIndex ? "bg-emerald-500 w-8 shadow-md shadow-emerald-500/30" : "bg-slate-200 hover:bg-slate-300"}`} aria-label={`Go to slide ${i + 1}`} />
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
