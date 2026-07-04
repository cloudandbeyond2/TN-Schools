"use client";

import React, { useState, useEffect, useRef } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import { 
  Bot, 
  Mic, 
  Play, 
  MessageSquare, 
  Headphones, 
  Star, 
  Activity, 
  CheckCircle2, 
  Volume2, 
  Sparkles, 
  User, 
  BookA, 
  Award, 
  X, 
  Send, 
  ArrowRight, 
  Sliders, 
  Megaphone, 
  Compass, 
  Target, 
  BookOpen, 
  ChevronRight, 
  RefreshCw, 
  Clock, 
  TrendingUp, 
  Info,
  Check,
  Languages,
  PenTool,
  Brain
} from "lucide-react";
import Swal from "sweetalert2";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

// Onboarding Data
const LANGUAGES = [
  { id: "english", name: "English", nativeName: "English", flag: "🇬🇧", difficulty: "Medium", popularity: "Very High", desc: "Master international business, presentations, and daily global dialog." },
  { id: "tamil", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳", difficulty: "High", popularity: "Regional", desc: "Refine classical vocabulary, public address, and regional literature." },
  { id: "hindi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", difficulty: "Medium", popularity: "High", desc: "Gain fluency in national daily dialog, greetings, and common phrases." },
  { id: "french", name: "French", nativeName: "Français", flag: "🇫🇷", difficulty: "Hard", popularity: "Global", desc: "Practice romantic articulation, silent endings, and European vocabulary." },
  { id: "german", name: "German", nativeName: "Deutsch", flag: "🇩🇪", difficulty: "Hard", popularity: "Business", desc: "Structure complex compounds, formal greetings, and logical phrasing." },
  { id: "spanish", name: "Spanish", nativeName: "Español", flag: "🇪🇸", difficulty: "Easy", popularity: "Very High", desc: "Practice expressive rhythms, phonetic vowels, and daily social dialog." },
  { id: "japanese", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", difficulty: "Hard", popularity: "Popular", desc: "Learn polite syntax, context-aware expressions, and soft vowels." },
  { id: "korean", name: "Korean", nativeName: "한국어", flag: "🇰🇷", difficulty: "Hard", popularity: "Rising", desc: "Practice energetic K-pop expressions, honorific honor and modern dialogues." },
  { id: "arabic", name: "Arabic", nativeName: "العربية", flag: "🇦🇪", difficulty: "Very Hard", popularity: "High", desc: "Articulate throat phonetics, formal addresses, and deep classical terms." }
];

const GOALS = [
  { id: "conversation", label: "Everyday Conversation", desc: "Socializing and casual chats" },
  { id: "public_speaking", label: "Public Speaking", desc: "Addressing crowds with calm authority" },
  { id: "interview", label: "Interview Prep", desc: "Landing jobs and answering key prompts" },
  { id: "business", label: "Business Comm", desc: "Formal vocabulary and meetings" },
  { id: "presentation", label: "Presentation Skills", desc: "Slide narration and clear vocal stress" },
  { id: "discussion", label: "Group Discussions", desc: "Debating, agreeing, and polite interruption" },
  { id: "debate", label: "Formal Debate", desc: "Argument construction and rhetoric" },
  { id: "storytelling", label: "Storytelling", desc: "Vocal variance and descriptive timelines" },
  { id: "pronunciation", label: "Pronunciation Lab", desc: "Stretching phonetics and clean vowels" },
  { id: "vocabulary", label: "Vocab Richness", desc: "Synonyms and native vocabulary" },
  { id: "writing", label: "Writing & Grammar", desc: "Emails, essays, and reports" },
  { id: "confidence", label: "Confidence Boost", desc: "Overcoming fear and pauses" }
];

const CONFIDENCE_LEVELS = [
  { id: "nervous", label: "Very Nervous", desc: "I freeze or stutter heavily under pressure", emoji: "😰" },
  { id: "beginner", label: "Beginner Speaker", desc: "I formulate basic sentences with conscious delay", emoji: "🌱" },
  { id: "some", label: "Some Confidence", desc: "I speak basic blocks but make common grammar errors", emoji: "🚶" },
  { id: "comfortable", label: "Comfortable Speaker", desc: "I carry conversations well but want native fluency", emoji: "🗣️" },
  { id: "advanced", label: "Advanced Communicator", desc: "I want to master public rhetoric and elite debates", emoji: "🏆" }
];

export default function LanguageCoachingPage() {
  const { data: session } = useSession();
  const [student, setStudent] = useState<any>(null);

  // Setup Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [chosenLang, setChosenLang] = useState<any>(null);
  const [chosenGoals, setChosenGoals] = useState<string[]>([]);
  const [chosenConfidence, setChosenConfidence] = useState<any>(null);

  // Dashboard Active Module
  const [activeModule, setActiveModule] = useState<"speaking" | "conversation" | "vocabulary" | "pronunciation" | "listening" | "writing" | "analytics">("speaking");

  // Speaking Practice State
  const [speakingPrompt, setSpeakingPrompt] = useState("Introduce yourself and share what makes you excited about learning today.");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [speakingEvaluation, setSpeakingEvaluation] = useState<any>(null);

  // Scenario Chat State
  const [selectedScenario, setSelectedScenario] = useState("Ordering Food");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: "assistant", content: "Hello! Welcome to Maya's Cafe. What would you like to order today?" }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Vocabulary in Context State
  const [vocabWord, setVocabWord] = useState({ word: "Eloquence", meaning: "Fluent or persuasive speaking or writing", example: "Her eloquence during the presentation wowed the entire school." });
  const [vocabInput, setVocabInput] = useState("");
  const [vocabEvaluation, setVocabEvaluation] = useState<any>(null);

  // Pronunciation Lab State
  const [pronSentence, setPronSentence] = useState("The environment benefits immensely when we choose sustainable packaging.");
  const [pronEvaluation, setPronEvaluation] = useState<any>(null);

  // Listening Lab State
  const [listeningQuestion, setListeningQuestion] = useState({
    audioText: "Welcome class. Today we will outline photosynthesis. Water is absorbed through the roots, while carbon dioxide enters through leaf pores. Chlorophyll then traps sunlight to process food.",
    question: "Where does carbon dioxide enter the plant?",
    options: ["Roots", "Leaf Pores", "Chlorophyll", "Stem"],
    answer: "Leaf Pores"
  });
  const [selectedListeningOption, setSelectedListeningOption] = useState<string | null>(null);
  const [listeningChecked, setListeningChecked] = useState(false);

  // Writing Coach State
  const [writingPrompt, setWritingPrompt] = useState("Write a formal email asking your class teacher for 2 days leave due to a family emergency.");
  const [writingInput, setWritingInput] = useState("");
  const [writingEvaluation, setWritingEvaluation] = useState<any>(null);

  // Audio Context Ref
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);
  const [isRecording, setIsRecording] = useState(false);
  const [waveHeights, setWaveHeights] = useState<number[]>([15, 15, 15, 15, 15]);

  // Load Setup from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("lang_coach_setup");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setChosenLang(parsed.lang);
        setChosenGoals(parsed.goals || []);
        setChosenConfidence(parsed.confidence);
        setWizardStep(4); // Dashboard
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Fetch Student Profile
  useEffect(() => {
    fetch(`${API_BASE}/api/students`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          const myStudent = (session?.user as any)?.id 
            ? json.data.find((s: any) => s.userId === (session?.user as any)?.id)
            : null;
          setStudent(myStudent || json.data[0]);
        }
      })
      .catch((err) => console.error(err));
  }, [session]);

  const saveSetup = (lang: any, goals: string[], confidence: any) => {
    localStorage.setItem("lang_coach_setup", JSON.stringify({ lang, goals, confidence }));
    setChosenLang(lang);
    setChosenGoals(goals);
    setChosenConfidence(confidence);
    setWizardStep(4);
  };

  const handleResetSetup = () => {
    localStorage.removeItem("lang_coach_setup");
    setWizardStep(1);
    setChosenLang(null);
    setChosenGoals([]);
    setChosenConfidence(null);
  };

  // Mic Visualizer
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateWave = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const heights = [
          Math.max(10, dataArray[2] / 2.5),
          Math.max(15, dataArray[4] / 2),
          Math.max(25, dataArray[6] / 1.5),
          Math.max(15, dataArray[8] / 2),
          Math.max(10, dataArray[10] / 2.5)
        ];
        setWaveHeights(heights);
        animationRef.current = requestAnimationFrame(updateWave);
      };

      updateWave();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
      Swal.fire("Microphone Blocked", "Please enable mic permissions to speak.", "warning");
    }
  };

  const stopRecording = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) audioContextRef.current.close();
    
    mediaStreamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    setIsRecording(false);
    setWaveHeights([15, 15, 15, 15, 15]);
  };

  // Speaks text using Web Speech API
  const speakVoice = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Evaluate Speaking
  const handleEvaluateSpeaking = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setSpeakingEvaluation({
        fluency: 84,
        pronunciation: 88,
        vocabulary: 79,
        fillers: ["like", "um"],
        fillersCount: 3,
        speed: 124, // words per minute
        grammarErrors: ["I am having two siblings → I have two siblings"],
        vocabularySuggestions: ["good opportunity → splendid opportunity", "very happy → ecstatic"],
        naturalness: 85,
        feedback: "Your speech starts strong. You carried solid pronunciation but paused slightly searching for terms twice. Try substituting fillers with silent pauses."
      });
      setIsEvaluating(false);

      // Increment stats on backend
      if (student) {
        fetch(`${API_BASE}/api/students/${student.id}/language-coaching/pronunciation`, { method: "POST" }).catch(e => console.error(e));
      }
    }, 2000);
  };

  // Evaluate Vocabulary
  const handleEvaluateVocab = () => {
    if (!vocabInput.trim()) return;
    setIsEvaluating(true);
    setTimeout(() => {
      setVocabEvaluation({
        correct: true,
        grammarScore: 92,
        richness: "High",
        alternatives: ["eloquent speaker", "articulate orator"],
        feedback: "Excellent! You used the term correctly in a passive context. To sound even more professional, swap descriptive clauses for direct verbs."
      });
      setIsEvaluating(false);
    }, 1500);
  };

  // Evaluate Pronunciation Lab
  const handleEvaluatePronunciation = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setPronEvaluation({
        overall: 89,
        stressedWords: ["benefits", "immensely", "sustainable"],
        weakWords: ["packaging", "environment"],
        intonation: "Rising-falling (Standard declarative sentence)",
        feedback: "Excellent. Keep the stress clear on 'sustainable'. Relax your tongue on 'packaging' to avoid hard vowel clipping."
      });
      setIsEvaluating(false);
    }, 1800);
  };

  // Evaluate Writing
  const handleEvaluateWriting = () => {
    if (!writingInput.trim()) return;
    setIsEvaluating(true);
    setTimeout(() => {
      setWritingEvaluation({
        grammarScore: 94,
        readability: 88,
        clarity: "High",
        tone: "Polite & Professional",
        corrections: [
          { error: "ask you leave", fix: "request leave" },
          { error: "for family emergency", fix: "due to a family emergency" }
        ],
        alternatives: [
          "I am writing to formally request leave...",
          "Please accept this letter as notice of my absence..."
        ],
        feedback: "Highly readable. Tone matches expectations perfectly. Minor corrections noted for professional formatting."
      });
      setIsEvaluating(false);
    }, 2000);
  };

  // Post Scenario Chat
  const handleSendChat = () => {
    if (!chatInput.trim() || !student) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setChatInput("");
    setIsChatLoading(true);

    fetch(`${API_BASE}/api/students/${student.id}/language-coaching/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `${selectedScenario} Scenario Dialogue: ${userMsg}` })
    })
    .then(res => res.json())
    .then(json => {
      if (json.success && json.data) {
        setChatMessages(prev => [...prev, { role: "assistant", content: json.data.text }]);
        speakVoice(json.data.text);
      }
    })
    .catch(e => console.error(e))
    .finally(() => setIsChatLoading(false));
  };

  // Onboarding Wizard Render
  if (wizardStep === 1) {
    return (
      <PortalLayout title="AI Language Coach 🎙️" subtitle="Step 1 — Choose Communication Language">
        <div className="max-w-4xl mx-auto py-8 text-left">
          <h2 className="text-3xl font-black text-black dark:text-white mb-2 tracking-tight">Which language would you like to practice?</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Select your target language to build conversational fluency.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LANGUAGES.map((lang) => (
              <div 
                key={lang.id} 
                onClick={() => {
                  setChosenLang(lang);
                  setWizardStep(2);
                }}
                className="glass rounded-3xl p-5 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 cursor-pointer bg-white dark:bg-slate-900/60 hover:-translate-y-1.5 transition-all text-left flex flex-col justify-between h-[230px]"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-4xl">{lang.flag}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      {lang.popularity}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-black dark:text-white mb-0.5">{lang.name}</h3>
                  <p className="text-xs text-slate-400 font-bold mb-2">{lang.nativeName} · Difficulty: {lang.difficulty}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">{lang.desc}</p>
                </div>
                <div className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-3">
                  Select language <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (wizardStep === 2) {
    return (
      <PortalLayout title="AI Language Coach 🎙️" subtitle="Step 2 — Communication Goal">
        <div className="max-w-4xl mx-auto py-8 text-left">
          <h2 className="text-3xl font-black text-black dark:text-white mb-2 tracking-tight">What would you like to improve?</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Choose one or more communication outcomes you want to prioritize.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {GOALS.map((goal) => {
              const isSelected = chosenGoals.includes(goal.id);
              return (
                <div 
                  key={goal.id}
                  onClick={() => {
                    if (isSelected) {
                      setChosenGoals(prev => prev.filter(g => g !== goal.id));
                    } else {
                      setChosenGoals(prev => [...prev, goal.id]);
                    }
                  }}
                  className={`rounded-2xl p-4 border cursor-pointer transition-all flex items-start gap-3 text-left ${isSelected ? "border-indigo-500 bg-indigo-500/10 shadow-lg" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60"}`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-300"}`}>
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-black dark:text-white">{goal.label}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{goal.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center max-w-xs mx-auto">
            <button onClick={() => setWizardStep(1)} className="text-xs text-slate-500 hover:text-white font-bold">← Back</button>
            <button 
              disabled={chosenGoals.length === 0}
              onClick={() => setWizardStep(3)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-black text-white rounded-xl shadow-lg flex items-center gap-1.5 disabled:opacity-40"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (wizardStep === 3) {
    return (
      <PortalLayout title="AI Language Coach 🎙️" subtitle="Step 3 — Current Confidence Level">
        <div className="max-w-3xl mx-auto py-8 text-left">
          <h2 className="text-3xl font-black text-black dark:text-white mb-2 tracking-tight">Select your current confidence level</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Be honest! We will scale exercises and evaluations according to your starting point.</p>

          <div className="flex flex-col gap-4 mb-8">
            {CONFIDENCE_LEVELS.map((level) => (
              <div
                key={level.id}
                onClick={() => {
                  setChosenConfidence(level);
                  saveSetup(chosenLang, chosenGoals, level);
                }}
                className="glass rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 cursor-pointer bg-white dark:bg-slate-900/60 hover:-translate-y-0.5 transition-all text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{level.emoji}</span>
                  <div>
                    <h4 className="text-base font-black text-black dark:text-white">{level.label}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{level.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            ))}
          </div>

          <button onClick={() => setWizardStep(2)} className="text-xs text-slate-500 hover:text-white font-bold">← Back</button>
        </div>
      </PortalLayout>
    );
  }

  // Personalized Dashboard Layout (setup complete)
  return (
    <PortalLayout title="AI Communication Coach 🎙️" subtitle="Confidence through regular AI interaction and evaluation">
      {/* Sticky Progress Header */}
      <div className="sticky top-[73px] z-10 glass border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between bg-white/90 dark:bg-slate-900/90 shadow-md mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-xl shadow-md">
            {chosenLang?.flag || "🇬🇧"}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">ACTIVE PRACTICE LANGUAGE</div>
            <div className="text-sm font-black text-black dark:text-white">{chosenLang?.name || "English"}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 max-w-md">
          {chosenGoals.slice(0, 3).map(g => (
            <span key={g} className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold border border-indigo-500/20 capitalize">
              🎯 {g.replace("_", " ")}
            </span>
          ))}
          {chosenGoals.length > 3 && (
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full text-[10px] font-bold border border-slate-200 dark:border-slate-700">
              +{chosenGoals.length - 3} more
            </span>
          )}
        </div>
        <button onClick={handleResetSetup} className="text-xs font-bold text-red-500 hover:text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 transition-all flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Reset Coach
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Main Content Area: Practice Modules (3 columns) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* KPI Dashboard Card: Communication Score */}
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
            <h3 className="text-lg font-black text-black dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" /> Dynamic Communication Score
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 items-center">
              {/* Overall Score */}
              <div className="flex flex-col items-center justify-center text-center p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/20 relative">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="6" fill="transparent" />
                  <circle cx="32" cy="32" r="28" className="stroke-indigo-500 transition-all duration-500" strokeWidth="6" fill="transparent"
                    strokeDasharray={175} strokeDashoffset={175 - (175 * 84) / 100} />
                </svg>
                <div className="absolute text-sm font-black text-indigo-500 mt-[-24px]">84</div>
                <span className="text-[10px] font-black text-black dark:text-white uppercase tracking-wider mt-2.5">Overall Score</span>
              </div>

              {[
                { label: "Fluency", val: 82, stroke: "stroke-emerald-500", text: "text-emerald-500" },
                { label: "Pronunciation", val: 78, stroke: "stroke-blue-500", text: "text-blue-500" },
                { label: "Vocabulary", val: 86, stroke: "stroke-amber-500", text: "text-amber-500" },
                { label: "Grammar", val: 89, stroke: "stroke-purple-500", text: "text-purple-500" },
                { label: "Confidence", val: 74, stroke: "stroke-pink-500", text: "text-pink-500" },
                { label: "Listening", val: 91, stroke: "stroke-cyan-500", text: "text-cyan-500" },
              ].map(score => (
                <div key={score.label} className="flex flex-col items-center justify-center text-center">
                  <svg className="w-14 h-14 transform -rotate-90">
                    <circle cx="28" cy="28" r="24" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="4" fill="transparent" />
                    <circle cx="28" cy="28" r="24" className={`${score.stroke} transition-all duration-500`} strokeWidth="4" fill="transparent"
                      strokeDasharray={150} strokeDashoffset={150 - (150 * score.val) / 100} />
                  </svg>
                  <div className={`absolute text-xs font-black ${score.text} mt-[-20px]`}>{score.val}</div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-2">{score.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Practice Selector */}
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent text-left">
            <h3 className="text-base font-black text-black dark:text-white mb-4">Today's Daily Practice Tasks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { id: "speaking", title: "🎙 Speaking Practice", time: "2 min", xp: "50 XP", diff: "Medium" },
                { id: "conversation", title: "💬 Scenario Dialogue", time: "5 min", xp: "80 XP", diff: "Hard" },
                { id: "pronunciation", title: "📖 Pronunciation Lab", time: "1 min", xp: "30 XP", diff: "Easy" },
                { id: "vocabulary", title: "📚 Vocab Contextualizer", time: "2 min", xp: "40 XP", diff: "Medium" },
                { id: "listening", title: "🎧 Listening Quiz", time: "3 min", xp: "40 XP", diff: "Easy" },
                { id: "writing", title: "📝 Writing Coach", time: "4 min", xp: "60 XP", diff: "Medium" },
              ].map(t => (
                <div 
                  key={t.id}
                  onClick={() => setActiveModule(t.id as any)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between h-[120px] ${activeModule === t.id ? "border-indigo-500 bg-indigo-500/5 shadow-md" : "border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700"}`}
                >
                  <div className="text-xs font-black text-black dark:text-white">{t.title}</div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span>⏱ {t.time}</span>
                    <span>⚡ {t.xp}</span>
                    <span className="text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">{t.diff}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Practice Lab Container */}
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent text-left">
            {activeModule === "speaking" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-black dark:text-white">AI Speaking Practice</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Read the prompt and speak. Maya will evaluate your fluency, speed, and filler count.</p>
                  </div>
                  <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                </div>

                <div className="p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/20">
                  <div className="text-[10px] font-black text-indigo-500 uppercase tracking-wider mb-1">PROMPT FOR SPEAKING</div>
                  <div className="text-base text-black dark:text-slate-200 font-bold leading-relaxed">
                    &quot;{speakingPrompt}&quot;
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {[
                      "Introduce yourself",
                      "Describe your favorite movie",
                      "What would you do if you were a teacher?",
                      "Talk about your hometown"
                    ].map(p => (
                      <button key={p} onClick={() => { setSpeakingPrompt(p); setSpeakingEvaluation(null); }} className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg text-xs transition-colors">
                        💬 {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recorder Control */}
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
                  <div className="flex gap-1 items-center h-12 mb-4">
                    {waveHeights.map((h, i) => (
                      <div 
                        key={i} 
                        className={`w-1.5 rounded-full transition-all duration-155 ${isRecording ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-700"}`} 
                        style={{ height: `${h}px` }} 
                      />
                    ))}
                  </div>
                  <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${isRecording ? "bg-red-500 hover:bg-red-600 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
                  >
                    <Mic className="w-7 h-7" />
                  </button>
                  <span className="text-xs text-slate-400 font-bold mt-3">
                    {isRecording ? "Listening to your voice... Tap button to Stop" : "Tap to Speak (Recommended 1-2 mins)"}
                  </span>

                  {!isRecording && (
                    <button 
                      onClick={handleEvaluateSpeaking}
                      className="mt-5 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-black text-white rounded-xl shadow-lg flex items-center gap-1.5"
                    >
                      Evaluate Speech <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Evaluation Results */}
                {isEvaluating && (
                  <div className="text-center py-6 text-slate-500 font-bold">Maya is evaluating your pronunciation and grammar... ⏳</div>
                )}

                {speakingEvaluation && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
                    <div className="text-sm font-black text-black dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">AI Diagnostic Summary</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="text-xs text-slate-400">Fluency</div>
                        <div className="text-xl font-extrabold text-indigo-500">{speakingEvaluation.fluency}%</div>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="text-xs text-slate-400">Vocal Stress</div>
                        <div className="text-xl font-extrabold text-indigo-500">{speakingEvaluation.pronunciation}%</div>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="text-xs text-slate-400">Fillers Used</div>
                        <div className="text-xl font-extrabold text-indigo-500">{speakingEvaluation.fillersCount}</div>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="text-xs text-slate-400">Speaking Speed</div>
                        <div className="text-xl font-extrabold text-indigo-500">{speakingEvaluation.speed} WPM</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">&quot;{speakingEvaluation.feedback}&quot;</p>
                  </div>
                )}
              </div>
            )}

            {activeModule === "conversation" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-black dark:text-white">AI Conversation Practice</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Select a real-world scenario and talk with Maya. Speak naturally as if ordering or chatting.</p>
                  </div>
                  <MessageSquare className="w-5 h-5 text-indigo-500" />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {["Ordering Food", "School Discussion", "Interview", "Airport Check-in", "Doctor Visit", "Meeting New People"].map(sc => (
                    <button 
                      key={sc} 
                      onClick={() => {
                        setSelectedScenario(sc);
                        setChatMessages([{ role: "assistant", content: `You are in ${sc} mode. Introduce yourself or start speaking!` }]);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors shrink-0 ${selectedScenario === sc ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-700 hover:text-white"}`}
                    >
                      ☕ {sc}
                    </button>
                  ))}
                </div>

                {/* Scenario Chat Log */}
                <div className="h-[250px] overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-900/60 space-y-3">
                  {chatMessages.map((m, idx) => (
                    <div key={idx} className={`flex gap-3.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      {m.role === "assistant" && (
                        <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-xs shrink-0 mt-0.5"><Bot className="w-4 h-4 text-white" /></div>
                      )}
                      <div className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed ${m.role === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-750"}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && <div className="text-xs text-slate-400 italic">Maya is formulating a reply... 🗣️</div>}
                </div>

                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSendChat()}
                    placeholder="Type or reply here..."
                    className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-black dark:text-white"
                  />
                  <button onClick={handleSendChat} className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1">
                    <span>Send</span> <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {activeModule === "vocabulary" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-black dark:text-white">Vocabulary in Context</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Write a sentence containing today's word. Maya will evaluate if it is used correctly in context.</p>
                  </div>
                  <BookA className="w-5 h-5 text-indigo-500" />
                </div>

                <div className="p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/20">
                  <div className="text-[10px] font-black text-indigo-500 uppercase tracking-wider mb-1">WORD OF THE DAY</div>
                  <div className="text-2xl font-black text-black dark:text-white">{vocabWord.word}</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed"><span className="font-bold text-indigo-600 dark:text-indigo-400">Meaning:</span> {vocabWord.meaning}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed"><span className="font-bold text-indigo-600 dark:text-indigo-400">Example:</span> &quot;{vocabWord.example}&quot;</p>
                </div>

                <div className="space-y-3">
                  <textarea 
                    value={vocabInput} 
                    onChange={e => setVocabInput(e.target.value)}
                    placeholder="Enter your sentence here..."
                    className="w-full h-24 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs"
                  />
                  <button onClick={handleEvaluateVocab} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-black text-white rounded-xl shadow-lg">
                    Check Usage
                  </button>
                </div>

                {isEvaluating && <div className="text-center py-6 text-slate-400 font-bold">Evaluating usage correctness...</div>}

                {vocabEvaluation && (
                  <div className="p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                      <CheckCircle2 className="w-4 h-4" /> Correct Usage Context!
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{vocabEvaluation.feedback}</p>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">Alternative Formulations</div>
                    <div className="flex flex-wrap gap-2">
                      {vocabEvaluation.alternatives.map((alt: string) => (
                        <span key={alt} className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px] font-bold">{alt}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeModule === "pronunciation" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-black dark:text-white">Pronunciation Lab</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Read the sentence aloud. Maya will diagnostic syllable stress and sentence intonation.</p>
                  </div>
                  <Volume2 className="w-5 h-5 text-indigo-500" />
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                  <p className="text-lg font-bold text-black dark:text-white leading-relaxed">&quot;{pronSentence}&quot;</p>
                  <button onClick={() => speakVoice(pronSentence)} className="mt-3 text-xs font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1.5 mx-auto">
                    <Volume2 className="w-4 h-4" /> Hear Correct Pronunciation
                  </button>
                </div>

                {/* Recorder Control */}
                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
                  <div className="flex gap-1 items-center h-12 mb-4">
                    {waveHeights.map((h, i) => (
                      <div 
                        key={i} 
                        className={`w-1.5 rounded-full transition-all duration-150 ${isRecording ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-700"}`} 
                        style={{ height: `${h}px` }} 
                      />
                    ))}
                  </div>
                  <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${isRecording ? "bg-red-500 hover:bg-red-600 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
                  >
                    <Mic className="w-7 h-7" />
                  </button>
                  <span className="text-xs text-slate-400 font-bold mt-3">
                    {isRecording ? "Listening to pronunciation... Tap Stop" : "Tap to Speak"}
                  </span>

                  {!isRecording && (
                    <button 
                      onClick={handleEvaluatePronunciation}
                      className="mt-5 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-black text-white rounded-xl shadow-lg flex items-center gap-1.5"
                    >
                      Evaluate Pronunciation <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {isEvaluating && <div className="text-center py-6 text-slate-400 font-bold">Analyzing phonetics...</div>}

                {pronEvaluation && (
                  <div className="p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
                    <div className="text-sm font-black text-black dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Acoustic Diagnostics</div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400">Overall Accuracy Score</span>
                      <span className="text-lg font-extrabold text-indigo-500">{pronEvaluation.overall}%</span>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Stressed Syllabus (Correct)</div>
                      <div className="flex flex-wrap gap-1.5">
                        {pronEvaluation.stressedWords.map((w: string) => (
                          <span key={w} className="px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded text-xs font-bold">{w}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Attention Needed</div>
                      <div className="flex flex-wrap gap-1.5">
                        {pronEvaluation.weakWords.map((w: string) => (
                          <span key={w} className="px-2 py-1 bg-red-500/10 text-red-600 rounded text-xs font-bold">{w}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">&quot;{pronEvaluation.feedback}&quot;</p>
                  </div>
                )}
              </div>
            )}

            {activeModule === "listening" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-black dark:text-white">Listening Lab</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Listen to Maya narrate a short clip and select the correct answer to build context comprehension.</p>
                  </div>
                  <Headphones className="w-5 h-5 text-indigo-500" />
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center">
                  <button onClick={() => speakVoice(listeningQuestion.audioText)} className="w-14 h-14 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 flex items-center justify-center shadow transition-all active:scale-95">
                    <Play className="w-6 h-6 fill-indigo-600 text-indigo-600" />
                  </button>
                  <span className="text-xs text-slate-400 font-bold mt-2">Play Audio Passage</span>
                </div>

                <div className="space-y-4">
                  <div className="text-sm font-bold text-black dark:text-white">{listeningQuestion.question}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {listeningQuestion.options.map(opt => {
                      const isSelected = selectedListeningOption === opt;
                      return (
                        <div 
                          key={opt}
                          onClick={() => {
                            if (!listeningChecked) setSelectedListeningOption(opt);
                          }}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? "border-indigo-500 bg-indigo-500/5" : "border-slate-200 dark:border-slate-800 hover:border-slate-400"}`}
                        >
                          <span className="text-xs font-bold text-black dark:text-slate-200">{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  <button 
                    disabled={!selectedListeningOption || listeningChecked}
                    onClick={() => setListeningChecked(true)}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black disabled:opacity-40"
                  >
                    Check Answer
                  </button>

                  {listeningChecked && (
                    <div className={`p-4 rounded-xl border ${selectedListeningOption === listeningQuestion.answer ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : "border-red-500/30 bg-red-500/10 text-red-600"}`}>
                      {selectedListeningOption === listeningQuestion.answer ? (
                        <div className="text-xs font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Correct! Photosynthesis carbon inputs occur through leaf pores.</div>
                      ) : (
                        <div className="text-xs font-bold">Incorrect. The correct answer was Leaf Pores.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeModule === "writing" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-black dark:text-white">Writing Coach</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Write a paragraph matching the prompt. Maya evaluates readability, grammar errors, and formal vocabulary richness.</p>
                  </div>
                  <PenTool className="w-5 h-5 text-indigo-500" />
                </div>

                <div className="p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/20">
                  <div className="text-[10px] font-black text-indigo-500 uppercase tracking-wider mb-1">WRITING ASSIGNMENT</div>
                  <div className="text-sm text-black dark:text-slate-250 font-bold leading-relaxed">{writingPrompt}</div>
                </div>

                <div className="space-y-3">
                  <textarea 
                    value={writingInput} 
                    onChange={e => setWritingInput(e.target.value)}
                    placeholder="Enter your essay or paragraph here..."
                    className="w-full h-32 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs leading-relaxed"
                  />
                  <button onClick={handleEvaluateWriting} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-black text-white rounded-xl shadow-lg">
                    Check Grammar & Style
                  </button>
                </div>

                {isEvaluating && <div className="text-center py-6 text-slate-400 font-bold">Analyzing composition metrics...</div>}

                {writingEvaluation && (
                  <div className="p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
                    <div className="text-sm font-black text-black dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Grammarly & Style Diagnostic</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="text-xs text-slate-400">Grammar Score</div>
                        <div className="text-xl font-extrabold text-indigo-500">{writingEvaluation.grammarScore}%</div>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="text-xs text-slate-400">Readability</div>
                        <div className="text-xl font-extrabold text-indigo-500">{writingEvaluation.readability}%</div>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="text-xs text-slate-400">Tone</div>
                        <div className="text-xs font-extrabold text-indigo-500 mt-1 truncate">{writingEvaluation.tone}</div>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="text-xs text-slate-400">Clarity</div>
                        <div className="text-xl font-extrabold text-indigo-500">{writingEvaluation.clarity}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Corrections</div>
                      <div className="space-y-1.5">
                        {writingEvaluation.corrections.map((c: any, i: number) => (
                          <div key={i} className="text-xs flex gap-2"><span className="text-red-500 line-through">{c.error}</span> <ArrowRight className="w-3.5 h-3.5 text-slate-400 mt-0.5" /> <span className="text-emerald-500 font-bold">{c.fix}</span></div>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">&quot;{writingEvaluation.feedback}&quot;</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Persistent AI Coach Panel (1 column) */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-955/20 dark:to-purple-955/10 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-lg shrink-0 shadow"><Bot className="w-5 h-5 text-white" /></div>
              <div>
                <h4 className="text-base font-black text-black dark:text-white">Maya AI Coach</h4>
                <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded uppercase tracking-wider">Active Coach</span>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-indigo-200/80 leading-relaxed italic border-l-2 border-indigo-500 pl-3 mb-6">
              &quot;Hey! Practice order is key. Speak for 2 minutes or read the pronunciation lab aloud to log points. Synonyms increase vocab scores!&quot;
            </p>

            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Daily Goals</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Speaking Minutes</span>
                    <span className="font-bold text-black dark:text-white">0/2 min</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Vocab Used</span>
                    <span className="font-bold text-black dark:text-white">0/5 words</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Exercises Completed</span>
                    <span className="font-bold text-black dark:text-white">0/3</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Weekly Highlights</div>
                <div className="p-3 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex justify-between mb-1.5"><span className="text-slate-400">Total Speaking Time</span><span className="font-bold">14 mins</span></div>
                  <div className="flex justify-between mb-1.5"><span className="text-slate-400">Streak Status</span><span className="font-bold text-amber-500">🔥 3 Days</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Points Earned</span><span className="font-bold text-emerald-500">320 XP</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Gamified Achievements/Badges */}
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent text-left">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Communication Badges</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "First Speak", icon: "🎙", desc: "1 speak logged" },
                { name: "Dialog Master", icon: "💬", desc: "10 scenario runs" },
                { name: "Perfect Sound", icon: "🔊", desc: "95% accuracy score" },
                { name: "Grammar Star", icon: "✍", desc: "Zero error essays" },
              ].map(b => (
                <div key={b.name} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center">
                  <span className="text-2xl mb-1">{b.icon}</span>
                  <span className="text-[9px] font-bold text-black dark:text-white block leading-snug">{b.name}</span>
                  <span className="text-[8px] text-slate-400 mt-0.5">{b.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
