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

export default function StudyPlanPage() {
  const { data: session } = useSession();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const [selectedGrade, setSelectedGrade] = useState(grades[2]); // Grade 10
  const [topic, setTopic] = useState("Quadratic Equations");

  // PDF Upload
  const [fileName, setFileName] = useState("");
  const [uploadedText, setUploadedText] = useState("");
  const [isReadingFile, setIsReadingFile] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null);

  // Intelligence Studio Tool Modals
  const [activeStudioTool, setActiveStudioTool] = useState<
    | "unit-infographic"
    | "unit-audio"
    | "unit-quiz"
    | "visualExplain"
    | "teacher-slides"
    | "teacher-podcast"
    | "teacher-video"
    | "teacher-bilingual"
    | "teacher-assessment"
    | null
  >(null);
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);

  // Audio Guide state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLineIndex, setAudioLineIndex] = useState(-1);

  // Teacher plan integration states
  const [teacherPlans, setTeacherPlans] = useState<any[]>([]);
  const [loadingTeacherPlans, setLoadingTeacherPlans] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideFullscreen, setSlideFullscreen] = useState(false);
  const [isPlayingPodcast, setIsPlayingPodcast] = useState(false);
  const [podcastIndex, setPodcastIndex] = useState(-1);
  const [videoScene, setVideoScene] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Interactive Quiz state per unit-question
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // "unitId-qIdx" -> chosen option
  const [submittedQuizzes, setSubmittedQuizzes] = useState<Record<string, boolean>>({}); // "unitId-qIdx" -> true/false

  // Real-time Chat Tutor state (Middle panel)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

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
            params.append("grade", `Grade ${match[0]}`);
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
          title: "Study Guide PDF Uploaded!",
          text: `Successfully read and parsed ${file.name} context.`,
          timer: 1550,
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
    window.speechSynthesis.cancel();
    setIsPlayingAudio(false);
    setAudioLineIndex(-1);
    setIsPlayingPodcast(false);
    setPodcastIndex(-1);
    setIsVideoPlaying(false);
    if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);

    // Reset active states, quiz answers, and chat logs
    setActiveUnit(null);
    setActiveStudioTool(null);
    setActiveSlide(0);
    setVideoScene(0);
    setSelectedAnswers({});
    setSubmittedQuizzes({});
    setChatInput("");
    setChatMessages([]);

    try {
      const res = await fetch(`${API_URL}/api/ai/generate-study-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedSubject,
          grade: selectedGrade,
          topic,
          textbookContext: uploadedText || undefined
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        setCurrentPlan(json.data);
      } else {
        throw new Error(json.error || "Failed to generate study plan");
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

  const loadTeacherPlan = (plan: any) => {
    window.speechSynthesis.cancel();
    setIsPlayingAudio(false);
    setAudioLineIndex(-1);
    setIsPlayingPodcast(false);
    setPodcastIndex(-1);
    setIsVideoPlaying(false);
    if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);

    // Reset active unit, active tool modals, quiz states, and slides/video positions
    setActiveUnit(null);
    setActiveStudioTool(null);
    setActiveSlide(0);
    setVideoScene(0);
    setSelectedAnswers({});
    setSubmittedQuizzes({});
    setChatInput("");

    // Sync search configuration inputs in sidebar
    setSelectedSubject(plan.subject);
    setSelectedGrade(plan.grade);
    setTopic(plan.topic);

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

  // Intelligence Audio Podcast reader via browser SpeechSynthesis
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
      if (line.speaker.includes("Meera") || line.speaker.includes("Priya")) {
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

  // Video Storyboard Playback Simulation
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

  // Web Speech synthesis for audio guides
  const playAudioGuide = (script: { speaker: string; text: string; lang?: string }[]) => {
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setAudioLineIndex(-1);
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlayingAudio(true);
    let index = 0;
    setAudioLineIndex(0);

    const speakNext = () => {
      if (index >= script.length || !isPlayingAudio) {
        setIsPlayingAudio(false);
        setAudioLineIndex(-1);
        return;
      }

      setAudioLineIndex(index);
      const line = script[index];
      const utterance = new SpeechSynthesisUtterance(line.text);
      
      const voices = window.speechSynthesis.getVoices();
      if (line.speaker.includes("Priya")) {
        const tamilVoice = voices.find(v => v.lang.includes("ta"));
        const femaleVoice = voices.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("google US English"));
        utterance.voice = tamilVoice || femaleVoice || voices[0];
        utterance.pitch = 1.15;
        utterance.rate = 0.95;
      } else {
        const maleVoice = voices.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("google UK English Male"));
        utterance.voice = maleVoice || voices[0];
        utterance.pitch = 0.95;
        utterance.rate = 1.0;
      }

      utterance.onend = () => {
        index++;
        speakNext();
      };

      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setAudioLineIndex(-1);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
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
          subject: selectedSubject,
          grade: selectedGrade,
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
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <PortalLayout
      title="Personalized Study Plan (Intelligence Style)"
      subtitle="Interact with your textbook chapters, chat with AI Tutor, and launch studio learning tools"
      avatarLetter="A"
      avatarColor="#6366f1"
      themeClass="theme-student"
      accentColor="#6366f1"
    >
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[calc(100vh-160px)] overflow-hidden">
        
        {/* Panel 1: Configuration & Sources (Left) */}
        <div className="xl:col-span-1 border-r border-slate-200 dark:border-slate-800 pr-6 overflow-y-auto h-full space-y-6 scrollbar-thin">
          <div className="glass rounded-3xl p-5 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
            <h3 className="text-black dark:text-white font-bold text-xs mb-3 flex items-center gap-2">
              <span>⚡</span> Self-Study Setup
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">Grade</label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-black dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    {grades.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-black dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    {subjects.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">Topic / Chapter Name</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Algebra Rules"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-black dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Textbook PDF file upload */}
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-1">📖 Upload Chapter PDF</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-350 hover:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-550 cursor-pointer flex items-center justify-center gap-2 truncate"
                  >
                    {isReadingFile ? "⏳ Extracting..." : fileName ? `📄 ${fileName.substring(0, 12)}...` : "📁 Choose PDF..."}
                  </label>
                </div>
                {uploadedText && (
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block mt-1">✓ PDF context successfully loaded.</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full mt-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-850 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                {isGenerating ? "Synthesizing..." : "⚡ Generate My Study Plan"}
              </button>
            </form>
          </div>

          {/* Teacher assigned plans list */}
          <div className="glass rounded-3xl p-5 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
            <h3 className="text-black dark:text-white font-bold text-xs mb-3 flex items-center gap-2">
              <span>👩‍🏫</span> Teacher Assigned Lessons
            </h3>
            {loadingTeacherPlans ? (
              <div className="text-slate-400 text-xs animate-pulse font-sans">Loading assigned lessons...</div>
            ) : teacherPlans.length === 0 ? (
              <p className="text-[10px] text-slate-550 italic font-sans">No assigned lessons yet.</p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin pr-1">
                {teacherPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => loadTeacherPlan(plan)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs font-semibold ${
                      currentPlan?.id === plan.id
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                        : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-355 hover:border-slate-350"
                    }`}
                  >
                    <span className="block truncate font-bold">{plan.topic}</span>
                    <span className="text-[9px] text-slate-450 dark:text-slate-450 block mt-0.5 font-medium">{plan.subject} · {plan.grade}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="glass rounded-3xl p-4 border border-slate-250 dark:border-slate-700/50 bg-indigo-500/5">
            <h4 className="text-indigo-600 dark:text-indigo-400 font-bold text-xs mb-1.5">🎓 How to Study:</h4>
            <p className="text-slate-550 dark:text-slate-400 text-[11px] leading-relaxed font-sans">
              1. Setup and click **Generate**.<br/>
              2. Review targets and outline.<br/>
              3. Chat with your AI Tutor in the middle.<br/>
              4. Open **Studio tools** on the right side to study cheat sheets, play audio buddy podcasts, and take mock tests.
            </p>
          </div>
        </div>

        {/* Panel 2 & 3: Middle Section (Document View & AI Chat) */}
        <div className="xl:col-span-2 px-2 overflow-y-auto h-full flex flex-col justify-between space-y-4">
          {isGenerating ? (
            <div className="glass rounded-3xl p-12 border border-slate-250 dark:border-slate-700/50 text-center flex-grow flex flex-col items-center justify-center bg-white dark:bg-transparent">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-6" />
              <h3 className="text-black dark:text-white font-bold text-sm">Gemini AI Formulating Study Plan</h3>
              <p className="text-xs text-slate-550 max-w-xs mt-1.5 animate-pulse font-sans">
                Structuring unit targets, cheat sheets, quiz questions, and bilingual podcast scripts...
              </p>
            </div>
          ) : !currentPlan ? (
            <div className="glass rounded-3xl p-12 border border-slate-250 dark:border-slate-700/50 text-center flex-grow flex flex-col items-center justify-center bg-white dark:bg-transparent">
              <span className="text-4xl mb-4">📓</span>
              <h3 className="text-black dark:text-white font-bold text-sm font-sans">Student Self-Study Hub</h3>
              <p className="text-xs text-slate-550 max-w-sm mt-1.5 leading-relaxed font-sans">
                Launch a live study plan by configuring the form or uploading a textbook PDF. Chat with AI Tutor and generate visual cheat sheet slides.
              </p>
            </div>
          ) : (
            <div className="flex-grow flex flex-col justify-between overflow-hidden gap-4 h-full">
              {/* Study Plan Outline Document */}
              <div className="flex-1 rounded-3xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-950 p-5 overflow-y-auto max-h-[60%] shadow-md">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                  <span className="badge badge-blue mb-1.5">{currentPlan.grade} · {currentPlan.subject}</span>
                  <h3 className="text-black dark:text-white font-black text-lg">{currentPlan.topic} Study Guide</h3>
                </div>

                <div className="space-y-4 text-xs text-slate-655 dark:text-slate-350">
                  <div>
                    <h4 className="text-black dark:text-white font-bold text-xs mb-2">🎯 Study Targets</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-500 font-sans">
                      {currentPlan.goals?.map((goal, idx) => <li key={idx}>{goal}</li>)}
                    </ul>
                  </div>

                  <hr className="border-slate-200 dark:border-slate-800" />

                  <div>
                    <h4 className="text-black dark:text-white font-bold text-xs mb-3">📖 Course Units</h4>
                    <div className="space-y-2">
                      {currentPlan.units?.map((unit, idx) => (
                        <div key={unit.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-center">
                          <div className="font-sans">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">{unit.title}</span>
                            <span className="text-[10px] text-slate-500">{unit.summary.substring(0, 70)}...</span>
                          </div>
                          <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-md shrink-0">{unit.studyTime}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Workspace */}
              <div className="h-[38%] rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4 flex flex-col justify-between overflow-hidden">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-1.5 flex justify-between items-center">
                  <span>🤖 Chat with AI Tutor</span>
                  <span className="text-indigo-400 lowercase">Connected to Gemini 2.5</span>
                </div>

                {/* Message logs */}
                <div className="flex-1 overflow-y-auto my-2.5 space-y-2.5 pr-1 text-xs">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-xl px-3 py-2 leading-relaxed font-sans ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-tr-none"
                          : "bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-850 rounded-tl-none"
                      }`} style={{ whiteSpace: "pre-line" }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl rounded-tl-none px-3 py-2 text-slate-400 animate-pulse font-sans">
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
                    placeholder="Ask AI Tutor for quick examples or homework doubts..."
                    className="flex-1 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-black dark:text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500 font-sans"
                  />
                  <button
                    onClick={handleSendChat}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Ask AI
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panel 3: Studio Tools list per unit (Right) */}
        <div className="xl:col-span-1 border-l border-slate-200 dark:border-slate-800 pl-6 overflow-y-auto h-full space-y-4 scrollbar-thin">
          <h2 className="text-black dark:text-white font-bold text-xs flex items-center gap-2 mb-2 px-1">
            <span>🎨</span> Intelligence Studio
          </h2>
          
          {!currentPlan ? (
            <p className="text-[10px] text-slate-500 italic px-1 font-sans">Unlock Studio tools by generating a study plan.</p>
          ) : (
            <div className="space-y-4">
              {/* Teacher-assigned Lesson Plan specific tools */}
              {currentPlan.isTeacherPlan && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-2">
                  <div className="text-[10px] font-black text-slate-450 uppercase tracking-widest px-1">Teacher Guidelines</div>
                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      onClick={() => {
                        setActiveSlide(0);
                        setActiveStudioTool("teacher-slides");
                      }}
                      className="w-full text-left p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-xl transition-colors text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                    >
                      <span>🖼️</span> Concept Slide Deck
                    </button>

                    <button
                      onClick={() => {
                        setPodcastIndex(-1);
                        setActiveStudioTool("teacher-podcast");
                      }}
                      className="w-full text-left p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-xl transition-colors text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                    >
                      <span>🎙️</span> Bilingual Audio Podcast
                    </button>

                    <button
                      onClick={() => {
                        setVideoScene(0);
                        setActiveStudioTool("teacher-video");
                      }}
                      className="w-full text-left p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-xl transition-colors text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                    >
                      <span>🎬</span> Lesson Storyboard Video
                    </button>

                    <button
                      onClick={() => {
                        setActiveStudioTool("teacher-bilingual");
                      }}
                      className="w-full text-left p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-xl transition-colors text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                    >
                      <span>🗣️</span> Bilingual Dictionary
                    </button>

                    <button
                      onClick={() => {
                        setActiveStudioTool("teacher-assessment");
                      }}
                      className="w-full text-left p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-xl transition-colors text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                    >
                      <span>🎯</span> Class Exit Tickets
                    </button>
                  </div>
                </div>
              )}

              {/* Grand Topic Infographic Visual Explain */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-2">
                <div className="text-[10px] font-black text-slate-450 uppercase tracking-widest px-1">Grand Overview</div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveUnit(currentPlan.units[0] || null);
                    setActiveStudioTool("visualExplain");
                  }}
                  className="w-full text-left p-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-250 dark:border-indigo-800 hover:border-indigo-500 rounded-xl transition-all text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2"
                >
                  <span>📊</span> Topic Visual Explain
                </button>
              </div>

              {currentPlan.units?.map((unit, idx) => (
                <div key={unit.id} className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-2">
                  <div className="text-[10px] font-black text-slate-450 uppercase tracking-widest px-1">Unit {idx + 1} Tools</div>
                  <div className="grid grid-cols-1 gap-1.5">
                    
                    <button
                      onClick={() => {
                        setActiveUnit(unit);
                        setActiveStudioTool("unit-infographic");
                      }}
                      className="w-full text-left p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-xl transition-colors text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                    >
                      <span>🖼️</span> Infographic Cheat Sheet
                    </button>

                    <button
                      onClick={() => {
                        setActiveUnit(unit);
                        setActiveStudioTool("unit-audio");
                        setAudioLineIndex(-1);
                      }}
                      className="w-full text-left p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-xl transition-colors text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                    >
                      <span>🎙️</span> Audio Buddy Podcast
                    </button>

                    <button
                      onClick={() => {
                        setActiveUnit(unit);
                        setActiveStudioTool("unit-quiz");
                      }}
                      className="w-full text-left p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-xl transition-colors text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                    >
                      <span>📝</span> Interactive Quiz Test
                    </button>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Studio Tool Overlays */}
      {activeStudioTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-6xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">
                  {activeStudioTool === "visualExplain" ? "Grand Overview" : activeUnit?.title || "Lesson Guidelines"}
                </span>
                <h3 className="text-white font-black text-sm">
                  {activeStudioTool === "visualExplain" && "📊 Intelligence Visual Explain"}
                  {activeStudioTool === "unit-infographic" && "🖼️ Unit Cheat Sheet Infographic"}
                  {activeStudioTool === "unit-audio" && "🎙️ Intelligence AI Audio Buddy"}
                  {activeStudioTool === "unit-quiz" && "📝 Interactive mock Quiz"}
                  {activeStudioTool === "teacher-slides" && "🖼️ Teacher Guideline Slides"}
                  {activeStudioTool === "teacher-podcast" && "🎙️ Teacher Bilingual Podcast"}
                  {activeStudioTool === "teacher-video" && "🎬 Lesson Storyboard Video"}
                  {activeStudioTool === "teacher-bilingual" && "🗣️ Bilingual Vocabulary Dictionary"}
                  {activeStudioTool === "teacher-assessment" && "🎯 Class Exit Ticket Quiz"}
                </h3>
              </div>
            <div className="flex items-center gap-3 font-sans">
              {activeStudioTool === "visualExplain" && currentPlan && (
                <a
                  href={`/infographic-view?planId=${currentPlan.id || "temp-unsaved"}&topic=${encodeURIComponent(currentPlan.topic)}&subject=${encodeURIComponent(currentPlan.subject)}&role=student`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (!currentPlan.id || currentPlan.id === "temp-unsaved") {
                      localStorage.setItem("tempInfographicData", JSON.stringify(currentPlan.planData?.infographic || currentPlan.infographic));
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[10.5px] uppercase tracking-wider transition-colors flex items-center gap-1 shadow-md hover:scale-105"
                >
                  ↗️ Open Separate Page
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  setActiveStudioTool(null);
                  setActiveUnit(null);
                  window.speechSynthesis.cancel();
                  setIsPlayingAudio(false);
                  setAudioLineIndex(-1);
                  setIsPlayingPodcast(false);
                  setPodcastIndex(-1);
                  setIsVideoPlaying(false);
                  if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
                }}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-500 border border-slate-850 flex items-center justify-center font-bold text-sm transition-all"
              >
                ✕
              </button>
            </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 max-h-[78vh] text-xs">
              
              {/* Visual Infographic Tool */}
              {activeStudioTool === "visualExplain" && currentPlan && (
                <InteractiveInfographic 
                  key={currentPlan.topic}
                  topic={currentPlan.topic} 
                  subject={currentPlan.subject} 
                  data={currentPlan.infographic} 
                />
              )}

              {/* Teacher Slides Tool */}
              {activeStudioTool === "teacher-slides" && currentPlan && (
                <div className="space-y-4 flex flex-col justify-between h-full">
                  {(() => {
                    const slides = currentPlan.slides || ([
                      {
                        title: "Introduction",
                        subtitle: "Concept Overview",
                        bullets: ["Topic summary details"],
                        graphicType: "concept",
                        graphicData: { label: "Steps", values: ["Learn", "Practice"] }
                      }
                    ] as any[]);
                    const slide = slides[activeSlide] || slides[0];
                    const slideNum = activeSlide + 1;
                    const totalSlides = slides.length;

                    // Slide color accent based on slide index
                    const accentPalette = [
                      { from: "from-blue-600", to: "to-indigo-600", text: "text-blue-700", border: "border-blue-200", badge: "bg-blue-600" },
                      { from: "from-emerald-600", to: "to-teal-600", text: "text-emerald-700", border: "border-emerald-200", badge: "bg-emerald-600" },
                      { from: "from-violet-600", to: "to-purple-600", text: "text-violet-700", border: "border-violet-200", badge: "bg-violet-600" },
                      { from: "from-rose-600", to: "to-pink-600", text: "text-rose-700", border: "border-rose-200", badge: "bg-rose-600" },
                      { from: "from-amber-500", to: "to-orange-600", text: "text-amber-700", border: "border-amber-200", badge: "bg-amber-500" },
                    ];
                    const accent = accentPalette[activeSlide % accentPalette.length];

                    const SlideCard = (
                      <div className="flex flex-col gap-0 flex-grow">
                        {/* Premium Slide Card */}
                        <div className={`relative bg-white rounded-3xl shadow-[0_12px_50px_rgba(15,23,42,0.10)] border border-slate-100 overflow-hidden flex flex-col ${slideFullscreen ? "min-h-[calc(100vh-180px)]" : "min-h-[400px]"}`}>
                          {/* Gradient accent top bar */}
                          <div className={`h-1.5 w-full bg-gradient-to-r ${accent.from} ${accent.to}`} />

                          {/* Slide top meta */}
                          <div className="flex items-center justify-between px-6 pt-4 pb-2">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white ${accent.badge}`}>
                              Slide {slideNum} / {totalSlides}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{currentPlan.subject} · {currentPlan.grade}</span>
                              <button
                                type="button"
                                title={slideFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                                onClick={() => setSlideFullscreen(f => !f)}
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm transition-all"
                              >
                                &#x26F6;
                              </button>
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent mx-6" />

                          {/* Slide main content */}
                          <div className="flex flex-col md:flex-row gap-0 flex-1 overflow-hidden">
                            {/* Left: Title + Bullets */}
                            <div className="flex-1 p-6 md:p-8 flex flex-col justify-start gap-5">
                              <div>
                                <h4 className="font-black text-xl md:text-2xl leading-snug font-tamil text-slate-900 mb-1">
                                  {slide.title}
                                </h4>
                                <p className={`text-sm font-semibold ${accent.text} uppercase tracking-wider`}>
                                  {slide.subtitle || "Concept Overview"}
                                </p>
                              </div>

                              <ul className="space-y-2.5 font-sans">
                                {slide.bullets?.map((bullet: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-3 text-slate-700 text-sm">
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0 mt-0.5 bg-gradient-to-br ${accent.from} ${accent.to}`}>{idx + 1}</span>
                                    <span className="leading-relaxed">{bullet}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Right: Visual Infographic Panel */}
                            <div className="w-full md:w-72 bg-gradient-to-br from-slate-50 to-blue-50/40 border-l border-slate-100 flex flex-col gap-2 p-4 shrink-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-xs bg-gradient-to-br ${accent.from} ${accent.to}`}>📊</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Visual Infographic</span>
                              </div>
                              <div className="flex-1 min-h-[180px]">
                                <SlideVisual
                                  graphicType={slide.graphicType}
                                  graphicData={slide.graphicData}
                                  illustrationPrompt={slide.illustrationPrompt}
                                  animationSuggestion={slide.animationSuggestion}
                                  title={slide.title}
                                  subtitle={slide.subtitle}
                                  accent={accent}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Footer: Study Notes + Practice Task */}
                          {(slide.teacherNotes || slide.studentActivity) && (
                            <div className="border-t border-slate-100 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
                              {slide.teacherNotes && (
                                <div className="flex-1 p-4 flex gap-3">
                                  <div className="w-1 rounded-full bg-emerald-500 shrink-0" />
                                  <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block mb-0.5">📚 Study Notes</span>
                                    <p className="text-xs text-slate-600 leading-relaxed">{slide.teacherNotes}</p>
                                  </div>
                                </div>
                              )}
                              {slide.studentActivity && (
                                <div className="flex-1 p-4 flex gap-3">
                                  <div className="w-1 rounded-full bg-indigo-500 shrink-0" />
                                  <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 block mb-0.5">✍️ Practice Task</span>
                                    <p className="text-xs text-slate-600 leading-relaxed">{slide.studentActivity}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Watermark */}
                          <div className="absolute bottom-3 right-5 text-slate-200 font-black text-[10px] uppercase tracking-widest select-none pointer-events-none">
                            Intelligence Studio
                          </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between gap-3 mt-4 px-1">
                          <button
                            type="button"
                            disabled={activeSlide === 0}
                            onClick={() => setActiveSlide((p) => p - 1)}
                            className="px-4 py-2 rounded-xl font-bold text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm disabled:opacity-30 disabled:pointer-events-none transition-all"
                          >
                            ← Previous
                          </button>

                          {/* Slide thumbnail pills */}
                          <div className="flex items-center gap-1 flex-wrap justify-center flex-1">
                            {slides.map((_: any, i: number) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setActiveSlide(i)}
                                className={`h-2 rounded-full transition-all duration-200 ${
                                  i === activeSlide
                                    ? `w-6 bg-gradient-to-r ${accent.from} ${accent.to}`
                                    : "w-2 bg-slate-200 hover:bg-slate-300"
                                }`}
                                title={`Slide ${i + 1}`}
                              />
                            ))}
                          </div>

                          <button
                            type="button"
                            disabled={activeSlide === totalSlides - 1}
                            onClick={() => setActiveSlide((p) => p + 1)}
                            className="px-4 py-2 rounded-xl font-bold text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm disabled:opacity-30 disabled:pointer-events-none transition-all"
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    );

                    return slideFullscreen ? (
                      <div className="fixed inset-0 z-[999] bg-gradient-to-br from-slate-100 via-white to-blue-50 flex flex-col p-6 overflow-y-auto">
                        <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-slate-800 font-black text-sm uppercase tracking-widest">🖼️ Slide Deck · {currentPlan.topic}</h2>
                            <button
                              type="button"
                              onClick={() => setSlideFullscreen(false)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-700 transition-all"
                            >✕ Exit Fullscreen</button>
                          </div>
                          {SlideCard}
                        </div>
                      </div>
                    ) : SlideCard;
                  })()}
                </div>
              )}

              {/* Teacher Podcast Tool */}
              {activeStudioTool === "teacher-podcast" && currentPlan && (
                <div className="space-y-4">
                  {(() => {
                    const podcast = currentPlan.podcast || {
                      hosts: ["Aravind", "Meera"],
                      script: [{ speaker: "Aravind", text: "Ready?", lang: "en" }]
                    };

                    return (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                          <div className="flex gap-3">
                            <div className="flex -space-x-2 shrink-0">
                              <div className="w-8 h-8 rounded-full bg-indigo-600 border border-slate-950 flex items-center justify-center text-xs">👨‍🏫</div>
                              <div className="w-8 h-8 rounded-full bg-rose-600 border border-slate-950 flex items-center justify-center text-xs">👩‍🏫</div>
                            </div>
                            <div>
                              <h4 className="text-white font-bold text-xs leading-tight">Intelligence AI Podcast Player</h4>
                              <p className="text-[9px] text-slate-500">Hosts: {podcast.hosts?.join(" & ")}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isPlayingPodcast && (
                              <div className="flex gap-0.5 items-end h-5 w-10 mr-1 shrink-0">
                                <div className="bg-amber-500 w-0.5 rounded-sm animate-pulse h-2" style={{ animationDuration: "0.5s" }} />
                                <div className="bg-amber-500 w-0.5 rounded-sm animate-pulse h-4" style={{ animationDuration: "0.7s" }} />
                                <div className="bg-amber-500 w-0.5 rounded-sm animate-pulse h-1" style={{ animationDuration: "0.3s" }} />
                                <div className="bg-amber-500 w-0.5 rounded-sm animate-pulse h-5" style={{ animationDuration: "0.8s" }} />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => speakPodcast(podcast.script)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-[11px] text-white transition-all ${isPlayingPodcast ? "bg-red-650 hover:bg-red-700" : "bg-amber-500 hover:bg-amber-600"}`}
                            >
                              {isPlayingPodcast ? "⏹ Stop Podcast" : "🎙 Play AI Podcast"}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2.5 max-h-[280px] overflow-y-auto bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                          {podcast.script?.map((line: any, idx: number) => (
                            <div
                              key={idx}
                              className={`p-2.5 rounded-xl border transition-all ${
                                podcastIndex === idx
                                  ? "bg-amber-500/10 border-amber-500/40 text-white"
                                  : "bg-slate-950 border-slate-850 text-slate-400"
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1 font-sans">
                                <span className="font-bold text-[9px] text-amber-550 uppercase tracking-widest">{line.speaker}</span>
                                <span className="text-[8px] text-slate-550 uppercase">{line.lang}</span>
                              </div>
                              <p className="text-xs leading-relaxed font-sans">{line.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Teacher Video Tool */}
              {activeStudioTool === "teacher-video" && currentPlan && (
                <div className="space-y-4">
                  {(() => {
                    const storyboard = currentPlan.videoStoryboard || [
                      { sceneNumber: 1, visualDescription: "Intro", narrationText: "Welcome", subtitles: "வணக்கம்" }
                    ];
                    const scene = storyboard[videoScene] || storyboard[0];

                    return (
                      <div className="space-y-4">
                        <div className="relative aspect-video rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden flex flex-col justify-between p-5 shadow-lg">
                          <div className="absolute top-4 left-4 px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9px] font-bold text-amber-400">
                            SCENE {scene.sceneNumber} OF {storyboard.length}
                          </div>

                          <div className="flex-1 flex flex-col items-center justify-center text-center mt-5">
                            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl animate-bounce mb-2">
                              {scene.sceneNumber === 1 ? "🎬" : "🎓"}
                            </div>
                            <h5 className="text-white font-semibold text-xs max-w-sm mb-1">{scene.visualDescription}</h5>
                            <p className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">Scene Visualization Layout</p>
                          </div>

                          <div className="bg-slate-900/90 border border-slate-850 rounded-xl p-3 text-center mx-auto max-w-md w-full">
                            <p className="text-white text-xs font-semibold leading-relaxed font-sans">{scene.narrationText}</p>
                            <p className="text-amber-400 text-[10px] font-tamil font-semibold mt-0.5 leading-relaxed">{scene.subtitles}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-2.5 rounded-xl border border-slate-800 bg-slate-950">
                          <button
                            type="button"
                            onClick={() => toggleVideoPlayback(storyboard)}
                            className="px-3 py-1 bg-slate-900 border border-slate-800 hover:border-amber-500 rounded text-xs font-bold text-white transition-colors"
                          >
                            {isVideoPlaying ? "⏸ Pause Video" : "▶ Play Lesson Video"}
                          </button>

                           <div className="flex gap-1.5">
                            {storyboard.map((s: any, idx: number) => (
                              <button
                                type="button"
                                key={idx}
                                onClick={() => {
                                  if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
                                  setIsVideoPlaying(false);
                                  setVideoScene(idx);
                                }}
                                className={`w-5 h-5 rounded text-[9px] font-bold border transition-colors ${
                                  videoScene === idx
                                    ? "bg-amber-500 border-amber-500 text-white"
                                    : "bg-slate-900 border-slate-800 text-slate-400"
                                }`}
                              >
                                {s.sceneNumber}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Teacher Bilingual glossary */}
              {activeStudioTool === "teacher-bilingual" && currentPlan && (
                <div className="space-y-4">
                  <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/15">
                    <p className="text-amber-400 font-medium leading-relaxed font-sans text-[11px]">
                      📢 Use these Tamil equivalent terms in transitions to assist with regional media backgrounds.
                    </p>
                  </div>

                  <table className="w-full text-left text-xs font-sans text-slate-350 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-2.5">English Term</th>
                        <th className="py-2.5">Tamil Equivalent</th>
                        <th className="py-2.5">Phonetic / Pronunciation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-200">
                      {currentPlan.bilingual?.map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-900/60 transition-colors">
                          <td className="py-3 font-semibold text-white">{item.english}</td>
                          <td className="py-3 text-amber-450 font-semibold font-tamil">{item.tamil}</td>
                          <td className="py-3 text-slate-400">{item.pronunciation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Teacher Assessment */}
              {activeStudioTool === "teacher-assessment" && currentPlan && (
                <div className="space-y-4 text-slate-350">
                  <h4 className="text-white font-bold text-xs mb-2">🎯 Exit Ticket MCQs & Answers</h4>
                  <div className="space-y-3 font-sans">
                    {currentPlan.units?.flatMap((u: any) => u.quiz || [])?.map((ticket: any, i: number) => (
                      <div key={i} className="p-3.5 bg-slate-950 hover:bg-slate-955 rounded-xl border border-slate-850">
                        <div className="font-bold text-white mb-2 leading-relaxed">Question {i + 1}: {ticket.question}</div>
                        <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-slate-500">
                          {ticket.options?.map((opt: string, oIdx: number) => <div key={oIdx}>{opt}</div>)}
                        </div>
                        <div className="mt-2.5 text-emerald-400 font-bold text-[10px]">
                          Correct Answer: {ticket.answer}. Explanation: {ticket.rationale}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Infographic Cheat sheet */}
              {activeStudioTool === "unit-infographic" && activeUnit && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-950 border border-indigo-500/20 space-y-4">
                  <div className="border-b border-indigo-500/20 pb-2">
                    <h4 className="text-white font-black text-base leading-snug">{activeUnit.infographicCard?.title || "Concept Guide"}</h4>
                    <p className="text-indigo-400 font-medium text-[10px] uppercase">infographic cheat sheet</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    {activeUnit.infographicCard?.formulas?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Important Equations / Rules</span>
                        <div className="flex flex-col gap-1.5">
                          {activeUnit.infographicCard.formulas.map((f, i) => (
                            <code key={i} className="px-3 py-1.5 bg-slate-950 rounded-lg font-mono text-[11px] text-indigo-400 border border-slate-850 block">{f}</code>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeUnit.infographicCard?.keyConcepts?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Key Concept Explanations</span>
                        <ul className="list-disc list-inside space-y-1.5 text-slate-350 font-sans leading-relaxed">
                          {activeUnit.infographicCard.keyConcepts.map((k, i) => <li key={i}>{k}</li>)}
                        </ul>
                      </div>
                    )}

                    {activeUnit.infographicCard?.illustrations?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Visual Study Outline</span>
                        <div className="p-3 bg-slate-950 rounded-xl text-slate-400 border border-slate-850 italic font-sans leading-relaxed">
                          {activeUnit.infographicCard.illustrations.join(", ")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Audio guide */}
              {activeStudioTool === "unit-audio" && activeUnit && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-bold text-xs leading-tight">Bilingual Audio Buddy Discussion</h4>
                      <p className="text-[9px] text-slate-500">Speakers: Karthik & Priya</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPlayingAudio && (
                        <div className="flex gap-0.5 items-end h-5 w-8 mr-1 shrink-0">
                          <div className="bg-indigo-500 w-0.5 rounded animate-pulse h-2" style={{ animationDuration: "0.5s" }} />
                          <div className="bg-indigo-500 w-0.5 rounded animate-pulse h-4" style={{ animationDuration: "0.7s" }} />
                          <div className="bg-indigo-500 w-0.5 rounded animate-pulse h-5" style={{ animationDuration: "0.9s" }} />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => playAudioGuide(activeUnit.audioGuide)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] text-white transition-all ${isPlayingAudio ? "bg-red-650 hover:bg-red-700" : "bg-indigo-650 hover:bg-indigo-700"}`}
                      >
                        {isPlayingAudio ? "⏹ Stop Guide" : "🔊 Listen Podcast"}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-[250px] overflow-y-auto bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                    {activeUnit.audioGuide?.map((line, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border transition-all ${
                          audioLineIndex === idx
                            ? "bg-indigo-500/10 border-indigo-500/40 text-white"
                            : "bg-slate-950 border-slate-850 text-slate-400"
                        }`}
                      >
                        <span className="font-bold text-[9px] text-indigo-400 uppercase tracking-widest block mb-0.5">{line.speaker}</span>
                        <p className="text-xs leading-relaxed font-sans">{line.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unit Quiz test */}
              {activeStudioTool === "unit-quiz" && activeUnit && (
                <div className="space-y-4 font-sans">
                  {activeUnit.quiz?.map((q, qIdx) => {
                    const key = `${activeUnit.id}-${qIdx}`;
                    const selectedOpt = selectedAnswers[key];
                    const submitted = submittedQuizzes[key];

                    return (
                      <div key={qIdx} className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-3 font-sans">
                        <div className="font-bold text-white leading-relaxed">{q.question}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = selectedOpt === opt;
                            return (
                              <button
                                type="button"
                                key={oIdx}
                                disabled={submitted}
                                onClick={() => setSelectedAnswers({ ...selectedAnswers, [key]: opt })}
                                className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition-all ${
                                  isSelected
                                    ? "bg-indigo-500/10 border-indigo-500 text-indigo-400"
                                    : "bg-slate-900 border-slate-800 hover:border-slate-650 text-slate-400"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {!submitted ? (
                          <button
                            type="button"
                            disabled={!selectedOpt}
                            onClick={() => setSubmittedQuizzes({ ...submittedQuizzes, [key]: true })}
                            className="mt-2 px-4 py-1.5 bg-indigo-600 disabled:bg-indigo-900 text-white font-bold rounded-lg text-[10px]"
                          >
                            Submit Answer
                          </button>
                        ) : (
                          <div className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-xl leading-relaxed text-[11px]">
                            {selectedOpt === q.answer ? (
                              <span className="text-emerald-400 font-bold block mb-1">✓ Correct! Great job.</span>
                            ) : (
                              <span className="text-red-400 font-bold block mb-1">✗ Incorrect. Correct option: {q.answer}</span>
                            )}
                            <span className="text-slate-400">{q.rationale}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newAnswers = { ...selectedAnswers };
                                delete newAnswers[key];
                                setSelectedAnswers(newAnswers);
                                setSubmittedQuizzes({ ...submittedQuizzes, [key]: false });
                              }}
                              className="block mt-2 text-indigo-400 hover:underline font-bold text-[9px]"
                            >
                              Try Again
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
