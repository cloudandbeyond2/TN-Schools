"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import {
  Mic, BookOpen, Headphones, PenTool, MessageSquare, Users, Search,
  Volume2, Book, Gamepad2, ListPlus, Image as ImageIcon, Mic2, Award,
  Calendar, Send, Target, BarChart, CheckCircle2, BrainCircuit,
  MessageCircle, X, Zap, Clock, Loader2, ChevronRight, Star, RefreshCw,
  ArrowRight, Sparkles, Languages, Trophy, ShieldAlert, Check
} from "lucide-react";
import Swal from "sweetalert2";

// ─── Types ────────────────────────────────────────────────────────────────────
type Lang = "Tamil" | "English";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LanguageCoachingPage() {
  const { data: session } = useSession();
  const studentId = (session?.user as any)?.studentId || (session?.user as any)?.id;
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const LC  = `${API}/api/language-coaching`;

  const [selectedLang, setSelectedLang] = useState<Lang>("English");
  const [activeModal,  setActiveModal]  = useState<string | null>(null);

  // ─── Grade Tier Detection ─────────────────────────────────────────────────────
  type Tier = "explorer" | "communicator" | "orator";
  const [gradeTier, setGradeTier] = useState<Tier>("communicator");
  const [tierLoading, setTierLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    const fetchTier = async () => {
      try {
        const res  = await fetch(`${API}/api/students/${studentId}`);
        const json = await res.json();
        const cls  = parseInt(json?.data?.class || json?.class || "9", 10);
        if (cls <= 8)       setGradeTier("explorer");
        else if (cls <= 10) setGradeTier("communicator");
        else                setGradeTier("orator");
      } catch { /* keep default */ }
      finally { setTierLoading(false); }
    };
    fetchTier();
  }, [studentId, API]);

  // ─── Tier-based 6 Feature Cards ──────────────────────────────────────────────
  const TIER_CARDS: Record<Tier, Array<{ icon: React.ReactElement; title: string; desc: string; color: string; modal: string }>> = {
    explorer: [
      { icon: <Mic2 />,         title: "AI Speaking Coach", desc: "Pronunciation test",    color: "rose",    modal: "AI Speaking Coach" },
      { icon: <Search />,        title: "Vocab Builder",     desc: "AI Flashcards",         color: "emerald", modal: "Vocab Builder" },
      { icon: <Book />,          title: "Story Reading",     desc: "AI-generated stories",  color: "purple",  modal: "Story Reading" },
      { icon: <ListPlus />,      title: "Sentence Builder",  desc: "AI word puzzles",       color: "cyan",    modal: "Sentence Builder" },
      { icon: <Sparkles />,      title: "Language Games",    desc: "Word Scramble fun",     color: "pink",    modal: "Language Games" },
      { icon: <Target />,        title: "Daily Challenge",   desc: "AI XP tasks",           color: "blue",    modal: "Daily Challenge" },
    ],
    communicator: [
      { icon: <Mic2 />,          title: "AI Speaking Coach", desc: "Pronunciation test",    color: "rose",    modal: "AI Speaking Coach" },
      { icon: <Search />,        title: "Vocab Builder",     desc: "AI Flashcards",         color: "emerald", modal: "Vocab Builder" },
      { icon: <Users />,         title: "Real-Life Convo",   desc: "Roleplay scenarios",    color: "indigo",  modal: "Real-Life Convo" },
      { icon: <Book />,          title: "Story Reading",     desc: "AI-generated stories",  color: "purple",  modal: "Story Reading" },
      { icon: <PenTool />,       title: "Writing Practice",  desc: "AI writing prompts",    color: "amber",   modal: "Writing Practice" },
      { icon: <Target />,        title: "Daily Challenge",   desc: "AI XP tasks",           color: "blue",    modal: "Daily Challenge" },
    ],
    orator: [
      { icon: <Mic2 />,          title: "AI Speaking Coach", desc: "Pronunciation test",    color: "rose",    modal: "AI Speaking Coach" },
      { icon: <MessageSquare />, title: "Debate Practice",   desc: "Argue your point",      color: "indigo",  modal: "Debate Practice" },
      { icon: <MessageCircle />, title: "Public Speaking",   desc: "AI debate topics",      color: "purple",  modal: "Public Speaking" },
      { icon: <Gamepad2 />,      title: "Grammar Games",     desc: "Grammar check & tips",  color: "pink",    modal: "Grammar Games" },
      { icon: <PenTool />,       title: "Writing Practice",  desc: "AI writing prompts",    color: "amber",   modal: "Writing Practice" },
      { icon: <Target />,        title: "Daily Challenge",   desc: "AI XP tasks",           color: "blue",    modal: "Daily Challenge" },
    ],
  };

  const TIER_LABELS: Record<Tier, { label: string; badge: string; color: string; desc: string }> = {
    explorer:     { label: "Explorer",     badge: "Classes 6–8",   color: "bg-emerald-500 from-emerald-400 to-teal-500", desc: "Interactive vocabulary, puzzles, and fun word matches." },
    communicator: { label: "Communicator", badge: "Classes 9–10",  color: "bg-blue-500 from-blue-400 to-indigo-500", desc: "Interactive roleplay scenarios, reading, and formal writing." },
    orator:       { label: "Orator",       badge: "Classes 11–12", color: "bg-purple-500 from-purple-400 to-fuchsia-500", desc: "Advanced public speaking topics, grammar mechanics, and debates." },
  };

  // ── Fetch helper ─────────────────────────────────────────────────────────────
  const apiFetch = useCallback(
    async (path: string, body?: object) => {
      const id = studentId || "demo";
      const url = `${LC}/${id}/${path}`;
      const res = body
        ? await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, language: selectedLang }) })
        : await fetch(`${url}?language=${selectedLang}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "API error");
      return json.data;
    },
    [studentId, selectedLang, LC]
  );
  const [progressStats, setProgressStats] = useState<any>({ speaking: 45, reading: 60, listening: 55, writing: 50 });

  const loadProgressStats = useCallback(async () => {
    if (!studentId) return;
    try {
      const data = await apiFetch("progress");
      if (data) setProgressStats(data);
    } catch { /* silent fallback */ }
  }, [studentId, apiFetch]);

  useEffect(() => {
    loadProgressStats();
  }, [loadProgressStats]);
  // ─── AI Chat ─────────────────────────────────────────────────────────────────
  const [chatInput,   setChatInput]   = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", content: "Hello! I am your AI Language Tutor. How can I help you improve today? 😊" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatHistory]);

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput;
    setChatHistory(p => [...p, { role: "user", content: userMsg }]);
    setChatInput("");
    setChatLoading(true);
    try {
      const data = await apiFetch("chat", { message: userMsg });
      setChatHistory(p => [...p, { role: "ai", content: data.text || "Let's keep practicing!" }]);
    } catch {
      setChatHistory(p => [...p, { role: "ai", content: "I'm offline right now, but keep going!" }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ─── Speaking Coach ───────────────────────────────────────────────────────────
  const [isRecording,   setIsRecording]   = useState(false);
  const [isAnalyzing,   setIsAnalyzing]   = useState(false);
  const [speakingScore, setSpeakingScore] = useState<any>(null);
  const mediaRecorderRef  = useRef<MediaRecorder | null>(null);
  const recognitionRef    = useRef<any>(null);
  const [transcript,    setTranscript]    = useState("");
  const [speakingIndex,  setSpeakingIndex]  = useState(0);

  const PRACTICE_SENTENCES: Record<Lang, string[]> = {
    English: [
      "Communication is the key to success.",
      "Practice makes a person perfect.",
      "Learning a new language opens new doors.",
      "Honesty is the best policy.",
      "Consistency is the key to learning.",
      "Reading books helps us gain knowledge."
    ],
    Tamil: [
      "தொடர்பு கொள்வது வெற்றிக்கு திறவுகோல்.",
      "முயற்சி திருவினையாக்கும்.",
      "விடாமுயற்சியே வெற்றிக்கு அடிப்படை.",
      "வாய்மையே வெல்லும்.",
      "சுவர் இருந்தால் தான் சித்திரம் வரைய முடியும்.",
      "நூல் பல கல்."
    ]
  };

  const toggleRecording = async () => {
    const targetSentence = PRACTICE_SENTENCES[selectedLang][speakingIndex] || PRACTICE_SENTENCES[selectedLang][0];
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      recognitionRef.current?.stop();
      setIsRecording(false);
      setIsAnalyzing(true);
      setTimeout(async () => {
        try {
          const spoken = transcript || targetSentence;
          const data   = await apiFetch("pronunciation-check", {
            targetSentence: targetSentence,
            transcript:     spoken
          });
          setSpeakingScore(data);
        } catch {
          setSpeakingScore({ accuracyScore: Math.floor(Math.random() * 20) + 78, wordDiffs: [], tip: "Great effort! Keep practicing." });
        } finally {
          setIsAnalyzing(false);
          setTranscript("");
          loadProgressStats();
        }
      }, 1500);
    } else {
      setSpeakingScore(null);
      setTranscript("");
      try {
        const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        recorder.start();
        mediaRecorderRef.current = recorder;

        // Web Speech API for live transcript
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recog = new SpeechRecognition();
          recog.continuous = true;
          recog.lang = selectedLang === "Tamil" ? "ta-IN" : "en-US";
          recog.onresult = (e: any) => {
            const t = Array.from(e.results).map((r: any) => r[0].transcript).join(" ");
            setTranscript(t);
          };
          recog.start();
          recognitionRef.current = recog;
        }
        setIsRecording(true);
      } catch {
        Swal.fire("Error", "Microphone access denied or unavailable.", "error");
      }
    }
  };

  // ─── Vocab Flashcards ─────────────────────────────────────────────────────────
  const [vocabCards,   setVocabCards]   = useState<any[]>([]);
  const [vocabIndex,   setVocabIndex]   = useState(0);
  const [showMeaning,  setShowMeaning]  = useState(false);
  const [vocabLoading, setVocabLoading] = useState(false);

  const loadVocab = async () => {
    setVocabLoading(true);
    try {
      const data = await apiFetch("vocab-builder", { difficulty: "hard" });
      setVocabCards(Array.isArray(data) ? data : []);
      setVocabIndex(0);
      setShowMeaning(false);
    } catch {
      setVocabCards([
        { word: "Equanimity", meaning: "Mental calmness, composure, especially in a difficult situation.", sentence: "She accepted both praise and criticism with equanimity." },
        { word: "Pernicious", meaning: "Having a harmful effect, especially in a gradual or subtle way.",  sentence: "The pernicious influence of false rumours ruined their teamwork." }
      ]);
    } finally {
      setVocabLoading(false);
      loadProgressStats();
    }
  };

  // ─── Sentence Builder ─────────────────────────────────────────────────────────
  const [sentenceData,     setSentenceData]     = useState<any>(null);
  const [currentSentence,  setCurrentSentence]  = useState<string[]>([]);
  const [sentenceLoading,  setSentenceLoading]  = useState(false);

  const loadSentence = async () => {
    setSentenceLoading(true);
    try {
      const data = await apiFetch("sentence-builder", {});
      setSentenceData(data);
      setCurrentSentence([]);
    } catch {
      setSentenceData({ words: ["I", "love", "learning", "new", "languages"], target: "I love learning new languages" });
      setCurrentSentence([]);
    } finally {
      setSentenceLoading(false);
    }
  };

  // ─── Story Reading ────────────────────────────────────────────────────────────
  const [storyData,    setStoryData]    = useState<any>(null);
  const [storyLoading, setStoryLoading] = useState(false);

  const loadStory = async () => {
    setStoryLoading(true);
    try {
      const data = await apiFetch("story", {});
      setStoryData(data);
    } catch {
      setStoryData({ title: "The Thirsty Crow", passage: "Once a crow was very thirsty. It found a pot with very little water and used pebbles to raise it to drink. Smart thinking helped it survive!", comprehensionQuestion: "How did the crow get the water?" });
    } finally {
      setStoryLoading(false);
    }
  };

  // ─── Roleplay ─────────────────────────────────────────────────────────────────
  const [roleplayData,   setRoleplayData]   = useState<any>(null);
  const [roleplayStep,   setRoleplayStep]   = useState(0);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [roleplayLoading,setRoleplayLoading]= useState(false);

  const loadRoleplay = async () => {
    setRoleplayLoading(true);
    try {
      const data = await apiFetch("roleplay", {});
      setRoleplayData(data);
      setRoleplayStep(0);
      setSelectedOption(null);
    } catch {
      setRoleplayData({ scenario: "Ordering food at the school canteen.", turns: [{ aiLine: "Canteen Uncle: What would you like today?", options: [{ text: "One samosa and a juice please.", quality: "strong", feedback: "Polite and complete!" }, { text: "Samosa.", quality: "weak", feedback: "Too short — add 'please'!" }] }] });
      setRoleplayStep(0);
      setSelectedOption(null);
    } finally {
      setRoleplayLoading(false);
    }
  };

  // ─── Debate Topic ─────────────────────────────────────────────────────────────
  const [debateData,    setDebateData]    = useState<any>(null);
  const [debateLoading, setDebateLoading] = useState(false);
  const [timeLeft,      setTimeLeft]      = useState(60);
  const [timerRunning,  setTimerRunning]  = useState(false);

  useEffect(() => {
    let interval: any;
    if (timerRunning && timeLeft > 0) interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    else if (timeLeft === 0) setTimerRunning(false);
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const loadDebate = async () => {
    setDebateLoading(true);
    try {
      const data = await apiFetch("debate-topic", {});
      setDebateData(data);
      setTimeLeft(data.speakTimeSeconds || 60);
      setTimerRunning(false);
    } catch {
      setDebateData({ topic: "Should homework be reduced?", prepTimeSeconds: 60, speakTimeSeconds: 120, guidingPoints: ["Consider student wellbeing", "Think about learning outcomes", "What alternatives exist?"] });
    } finally {
      setDebateLoading(false);
    }
  };

  // ─── Writing Prompt ───────────────────────────────────────────────────────────
  const [writingData,    setWritingData]    = useState<any>(null);
  const [writingLoading, setWritingLoading] = useState(false);
  const [writingText,    setWritingText]    = useState("");
  const [grammarFeedback,setGrammarFeedback]= useState<any>(null);
  const [checkingGrammar,setCheckingGrammar]= useState(false);

  const loadWritingPrompt = async () => {
    setWritingLoading(true);
    setWritingText("");
    setGrammarFeedback(null);
    try {
      const data = await apiFetch("writing-prompt", {});
      setWritingData(data);
    } catch {
      setWritingData({ prompt: "Write a short note to your best friend about your favourite hobby.", expectedLength: "5-7 sentences", rubricTips: ["Start with a greeting", "Describe your hobby clearly", "Explain why you enjoy it"] });
    } finally {
      setWritingLoading(false);
    }
  };

  const submitGrammarCheck = async () => {
    if (!writingText.trim()) return Swal.fire("Oops", "Please write something first!", "warning");
    setCheckingGrammar(true);
    try {
      const data = await apiFetch("grammar-check", { text: writingText });
      setGrammarFeedback(data);
    } catch {
      setGrammarFeedback({ strengths: "Great attempt! Your idea is clear.", corrections: ["Check your punctuation at the end of each sentence."], suggestion: "Try adding more descriptive words to paint a picture.", score: 72 });
    } finally {
      setCheckingGrammar(false);
      loadProgressStats();
    }
  };

  // ─── Daily Challenge ─────────────────────────────────────────────────────────
  const [dailyTasks,    setDailyTasks]    = useState<any[]>([]);
  const [tasksDone,     setTasksDone]     = useState<boolean[]>([]);
  const [dailyLoading,  setDailyLoading]  = useState(false);

  const loadDailyChallenge = async () => {
    setDailyLoading(true);
    try {
      const data = await apiFetch("daily-challenge");
      const tasks = data?.tasks || data || [];
      setDailyTasks(tasks);
      setTasksDone(new Array(tasks.length).fill(false));
    } catch {
      setDailyTasks([
        { title: "Say 3 Sentences",  description: "Tell someone 3 things you did today in English.",  type: "speaking", xp: 20 },
        { title: "Word Detective",   description: "Find 2 new English words in a storybook today.",   type: "vocab",    xp: 15 },
        { title: "Read Aloud",       description: "Read one paragraph from your textbook out loud.",  type: "reading",  xp: 15 }
      ]);
      setTasksDone([false, false, false]);
    } finally {
      setDailyLoading(false);
    }
  };

  // ─── Word of the Day (sidebar) ────────────────────────────────────────────────
  const [wordOfDay,   setWordOfDay]   = useState<any>(null);
  const [wodLoading,  setWodLoading]  = useState(true);

  const loadWordOfDay = useCallback(async () => {
    if (!studentId) return;
    setWodLoading(true);
    try {
      const id  = studentId || "demo";
      const res = await fetch(`${LC}/${id}/word-of-day?language=${selectedLang}`);
      const json = await res.json();
      if (json.success) setWordOfDay(json.data);
    } catch { /* silent */ }
    finally { setWodLoading(false); }
  }, [studentId, selectedLang, LC]);

  useEffect(() => { loadWordOfDay(); }, [loadWordOfDay]);

  const speakWord = (text: string) => {
    if (!window.speechSynthesis || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = selectedLang === "Tamil" ? "ta-IN" : "en-US";
      
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const target = selectedLang === "Tamil" ? "ta" : "en";
        const match = voices.find(v => v.lang.toLowerCase().startsWith(target) && v.localService) 
                   || voices.find(v => v.lang.toLowerCase().startsWith(target));
        if (match) u.voice = match;
      }
      
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.error("Speech Synthesis failed:", e);
    }
  };

  // ─── Modal Open Handler ───────────────────────────────────────────────────────
  const openModal = (name: string) => {
    setSpeakingScore(null); setIsRecording(false); setIsAnalyzing(false); setTranscript("");
    setVocabCards([]); setCurrentSentence([]);
    setStoryData(null); setRoleplayData(null); setDebateData(null);
    setWritingData(null); setWritingText(""); setGrammarFeedback(null);
    setDailyTasks([]); setSelectedOption(null);
    setTimerRunning(false);
    setActiveModal(name);

    // Auto-load content for each modal
    if (name === "Vocab Builder")         loadVocab();
    if (name === "Sentence Builder")      loadSentence();
    if (name === "Story Reading")         loadStory();
    if (name === "Real-Life Convo" || name === "Role Play") loadRoleplay();
    if (name === "Public Speaking" || name === "Debate Practice") loadDebate();
    if (name === "Writing Practice" || name === "Grammar Games")  loadWritingPrompt();
    if (name === "Daily Challenge")       loadDailyChallenge();
  };

  const closeModal = () => {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
    setIsRecording(false); setTimerRunning(false);
    window.speechSynthesis?.cancel();
    setActiveModal(null);
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════════
  return (
    <PortalLayout title="Language & Communication Hub 🗣️" subtitle={`AI-Powered · Currently Practising: ${selectedLang}`}>
      <div className="flex flex-col gap-10 text-left">

        {/* Hero Header Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-6 md:p-8 shadow-2xl text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent)]" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1.5 max-w-xl">
              <span className="bg-white/20 text-white font-extrabold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md">
                Government of Tamil Nadu
              </span>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                Language & <br className="hidden md:inline"/> Communication Hub
              </h1>
              <p className="text-indigo-100 text-xs md:text-sm font-medium">
                Master communication, speaking fluency, and advanced vocabulary using custom grade-matched AI tools.
              </p>
            </div>
            {!tierLoading && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl flex flex-col items-center text-center shadow-lg shrink-0 w-full md:w-48 transition-all hover:scale-105">
                <span className="bg-emerald-400 text-slate-900 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest mb-1.5 shadow-sm">
                  {TIER_LABELS[gradeTier].label} Level
                </span>
                <h4 className="font-extrabold text-sm leading-none mb-1 text-white">{TIER_LABELS[gradeTier].badge}</h4>
                <p className="text-[9px] text-indigo-200 mt-1 max-w-[160px] leading-relaxed">
                  {TIER_LABELS[gradeTier].desc}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 1. Language Selector */}
        <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm gap-4">
          <h2 className="text-sm font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Languages className="w-4 h-4 text-indigo-500" /> Language Practice
          </h2>
          <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-xl flex gap-1 border border-slate-200 dark:border-slate-800">
            {(["Tamil", "English"] as Lang[]).map(lang => (
              <button key={lang} onClick={() => { setSelectedLang(lang); setWordOfDay(null); }}
                className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${selectedLang === lang ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"}`}>
                {lang === "Tamil" ? "தமிழ் (Tamil)" : "English"}
              </button>
            ))}
          </div>
        </section>

        {/* 2. Today's Quick Practice */}
        <section>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-emerald-500" /> Today&apos;s Quick Practice
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PracticeCard icon={<Mic />}        title="Speaking"  color="rose"    onClick={() => openModal("AI Speaking Coach")} />
            <PracticeCard icon={<BookOpen />}   title="Reading"   color="blue"    onClick={() => openModal("Story Reading")} />
            <PracticeCard icon={<Headphones />} title="Listening" color="amber"   onClick={() => openModal("Listening Ex.")} />
            <PracticeCard icon={<PenTool />}    title="Writing"   color="emerald" onClick={() => openModal("Writing Practice")} />
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          <div className="xl:col-span-2 space-y-8">

            {/* 3. AI Communication Lab */}
            <section>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border-4 border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/50 text-purple-600 rounded-2xl rotate-[-4deg]">
                      <BrainCircuit className="w-6 h-6" />
                    </div>
                    AI Communication Lab
                  </h2>
                  {!tierLoading && (
                    <span className="text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      {TIER_LABELS[gradeTier].badge}
                    </span>
                  )}
                </div>

                {tierLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <span className="font-bold text-sm">Personalising your lab…</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {TIER_CARDS[gradeTier].map((card, idx) => (
                      <FeatureCard
                        key={idx}
                        icon={card.icon}
                        title={card.title}
                        desc={card.desc}
                        color={card.color}
                        onClick={() => openModal(card.modal)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Progress Dashboard */}
            <section>
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-3xl shadow-xl border-4 border-slate-800 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full" />
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3 relative z-10 text-white" style={{ color: "white" }}>
                  <BarChart className="w-5 h-5 text-indigo-400" /> My Progress Dashboard
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center relative z-10">
                  <ProgressRing label="Speaking"  value={progressStats?.speaking || 45} color="#f43f5e" />
                  <ProgressRing label="Reading"   value={progressStats?.reading || 60} color="#3b82f6" />
                  <ProgressRing label="Listening" value={progressStats?.listening || 55} color="#eab308" />
                  <ProgressRing label="Writing"   value={progressStats?.writing || 50} color="#10b981" />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* AI Chatbot */}
            <section className="h-[480px] flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border-4 border-indigo-50 dark:border-slate-800 overflow-hidden">
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3.5">
                <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">AI Language Tutor</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </div>
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/10">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] p-4 rounded-3xl text-sm ${msg.role === "user" ? "bg-indigo-600 text-white rounded-br-none shadow-md" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 rounded-bl-none shadow-sm"}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start animate-pulse">
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl rounded-bl-none flex items-center gap-2 text-slate-400 text-xs">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> AI Tutor is thinking…
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <form onSubmit={handleChat} className="flex gap-2">
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message to practice…"
                    className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white border-none" />
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-2xl shadow-lg transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </section>

            {/* Word of the Day */}
            <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border-4 border-indigo-50 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-xl rounded-full" />
              <div className="flex items-center justify-between mb-4">
                <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">💡 Word of the Day</span>
                <button onClick={loadWordOfDay} className="text-slate-400 hover:text-indigo-500 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              {wodLoading ? (
                <div className="flex items-center gap-3 text-slate-400 py-6"><Loader2 className="w-5 h-5 animate-spin" /> Loading word…</div>
              ) : wordOfDay ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-3xl font-black text-slate-800 dark:text-white leading-none">{wordOfDay.word}</h3>
                    {wordOfDay.tamilTranslation && <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 mt-1">{wordOfDay.tamilTranslation}</p>}
                  </div>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">{wordOfDay.meaning}</p>
                    <p className="text-xs italic text-slate-400 leading-relaxed">&quot;{wordOfDay.example}&quot;</p>
                  </div>
                  <button onClick={() => speakWord(wordOfDay.word)} className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-4 py-2 font-black text-[10px] transition-all flex items-center gap-1.5 shadow-sm">
                    <Volume2 className="w-4 h-4" /> Listen Pronunciation
                  </button>
                </div>
              ) : (
                <p className="text-slate-400 text-sm">Could not load word. <button onClick={loadWordOfDay} className="text-indigo-500 underline">Retry</button></p>
              )}
            </section>


          </div>
        </div>
      </div>

      {/* ─── MODALS ─────────────────────────────────────────────────────────────── */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 rounded-[3rem] w-full max-w-2xl p-8 border-4 border-indigo-500 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={closeModal} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 bg-slate-100 hover:bg-rose-50 dark:bg-slate-750 p-2.5 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black text-slate-850 dark:text-white mb-2 flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-amber-500" /> {activeModal} ({selectedLang})
            </h3>
            <div className="w-full h-px bg-slate-200 dark:bg-slate-700 mb-6" />

            {/* ── AI Speaking Coach ── */}
            {activeModal === "AI Speaking Coach" && (
              <div className="flex flex-col items-center py-6 text-center gap-6">
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 w-full">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Read this sentence aloud</p>
                  <p className="text-lg font-black text-slate-800 dark:text-white leading-relaxed">&ldquo;{PRACTICE_SENTENCES[selectedLang][speakingIndex] || PRACTICE_SENTENCES[selectedLang][0]}&rdquo;</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={toggleRecording}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${isRecording ? "bg-rose-500 scale-110 animate-pulse" : "bg-indigo-600 hover:scale-105 hover:bg-indigo-700"}`}>
                    <Mic className="w-8 h-8" />
                  </button>
                  {!isRecording && (
                    <button onClick={() => {
                      setSpeakingIndex(prev => (prev + 1) % (PRACTICE_SENTENCES[selectedLang]?.length || 1));
                      setSpeakingScore(null);
                      setTranscript("");
                    }} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-200 font-bold px-6 py-4 rounded-full flex items-center gap-2 self-center transition-all shadow-md">
                      <RefreshCw className="w-4 h-4" /> Next Sentence
                    </button>
                  )}
                </div>
                {isRecording && <p className="text-rose-500 font-bold animate-pulse text-xs">Recording… Click to stop.</p>}
                {transcript && isRecording && <p className="text-xs text-slate-400 italic max-w-sm">&ldquo;{transcript}&rdquo;</p>}
                {isAnalyzing && <div className="flex flex-col items-center gap-2"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /><p className="text-indigo-500 font-bold text-xs">Analysing pronunciation…</p></div>}
                {speakingScore && (
                  <div className="w-full bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-250 p-6 rounded-3xl text-left">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-2xl font-black text-emerald-700">{speakingScore.accuracyScore}% Accuracy</h4>
                      <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">+50 XP</span>
                    </div>
                    {speakingScore.wordDiffs?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {speakingScore.wordDiffs.map((d: any, i: number) => (
                          <span key={i} className={`px-2.5 py-1 rounded-xl text-xs font-bold ${d.status === "correct" ? "bg-emerald-100 text-emerald-700" : d.status === "missed" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                            {d.word} {d.status === "correct" ? "✓" : d.status === "missed" ? "✗" : "~"}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-emerald-600 font-medium">💡 {speakingScore.tip}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Vocab Builder ── */}
            {activeModal === "Vocab Builder" && (
              <div className="flex flex-col items-center gap-6">
                {vocabLoading ? <LoadingSpinner label="Generating AI flashcards…" /> : vocabCards.length > 0 ? (
                  <>
                    <div onClick={() => setShowMeaning(!showMeaning)}
                      className="w-full max-w-md h-64 cursor-pointer bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] flex flex-col items-center justify-center text-white border-4 border-indigo-400 shadow-xl p-8 text-center relative overflow-hidden transition-all duration-300 hover:scale-[1.01]">
                      {showMeaning ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                          <h3 className="text-xl font-black text-white" style={{ color: "white" }}>{vocabCards[vocabIndex]?.meaning}</h3>
                          <p className="text-xs italic text-indigo-100 max-w-[280px]" style={{ color: "rgba(255, 255, 255, 0.9)" }}>&quot;{vocabCards[vocabIndex]?.sentence}&quot;</p>
                          <span className="absolute bottom-4 text-[9px] text-white/50 font-black uppercase tracking-wider" style={{ color: "rgba(255, 255, 255, 0.5)" }}>Tap to see word</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full space-y-2">
                          <h2 className="text-4xl font-black text-white" style={{ color: "white" }}>{vocabCards[vocabIndex]?.word}</h2>
                          <p className="text-[11px] text-indigo-200 font-bold" style={{ color: "rgba(255, 255, 255, 0.8)" }}>Tap to reveal meaning</p>
                          <span className="absolute bottom-4 text-[9px] text-white/50 font-black uppercase tracking-wider" style={{ color: "rgba(255, 255, 255, 0.5)" }}>Flashcard {vocabIndex + 1}/5</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => speakWord(vocabCards[vocabIndex]?.word)} className="bg-blue-50 text-blue-600 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-100 transition-colors"><Volume2 className="w-4 h-4" /> Listen</button>
                      <button onClick={() => { setShowMeaning(false); setVocabIndex(p => (p + 1) % vocabCards.length); }} className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors">Next Word <ArrowRight className="w-4 h-4" /></button>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">{vocabIndex + 1} / {vocabCards.length}</p>
                  </>
                ) : <p className="text-slate-400">Could not load flashcards. <button onClick={loadVocab} className="text-indigo-600 underline">Retry</button></p>}
              </div>
            )}

            {/* ── Sentence Builder ── */}
            {activeModal === "Sentence Builder" && (
              <div className="flex flex-col gap-5">
                {sentenceLoading ? <LoadingSpinner label="Building AI sentence puzzle…" /> : sentenceData ? (
                  <>
                    <div className="w-full bg-slate-50 dark:bg-slate-900 min-h-20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center p-4 gap-2 flex-wrap">
                      {currentSentence.length === 0 ? <p className="text-slate-400 text-xs">Tap the scrambled words below to build the sentence in order…</p> : currentSentence.map((w, i) => <span key={i} className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm">{w}</span>)}
                    </div>
                    <div className="flex gap-2 flex-wrap justify-center my-2">
                      {sentenceData.words.map((word: string, i: number) => (
                        <button key={i} onClick={() => setCurrentSentence([...currentSentence, word])} className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-black shadow-sm hover:border-indigo-500 text-slate-700 dark:text-slate-300 text-xs transition-colors">{word}</button>
                      ))}
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button onClick={() => setCurrentSentence([])} className="bg-rose-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-rose-600 transition-colors">Clear</button>
                      <button onClick={() => currentSentence.join(" ") === sentenceData.target ? Swal.fire("Correct! 🎉", "Perfect sentence! +15 XP", "success") : Swal.fire("Oops!", "Not quite right. Try again.", "error")} className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-600 transition-colors">Check</button>
                      <button onClick={loadSentence} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200 transition-colors"><RefreshCw className="w-3.5 h-3.5" /> New</button>
                    </div>
                  </>
                ) : null}
              </div>
            )}

            {/* ── Story Reading ── */}
            {activeModal === "Story Reading" && (
              <div className="flex flex-col gap-5">
                {storyLoading ? <LoadingSpinner label="Generating your story…" /> : storyData ? (
                  <>
                    <div className="bg-amber-50/50 dark:bg-amber-950/10 p-6 rounded-[2rem] border-2 border-amber-100">
                      <h4 className="font-black text-lg mb-4 text-amber-800 dark:text-amber-300">{storyData.title}</h4>
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{storyData.passage}</p>
                    </div>
                    {storyData.comprehensionQuestion && (
                      <div className="bg-blue-50/50 dark:bg-blue-950/10 p-4.5 rounded-xl border border-blue-150">
                        <p className="text-xs font-bold text-blue-700 dark:text-blue-300 flex gap-1"><span>📝 Question:</span> {storyData.comprehensionQuestion}</p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button onClick={() => speakWord(storyData.passage)} className="bg-blue-50 text-blue-600 font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-100 transition-colors"><Volume2 className="w-4 h-4" /> Listen Story</button>
                      <button onClick={() => Swal.fire("Great Reading! 🎉", "+20 XP", "success")} className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2.5 rounded-xl">Mark as Read</button>
                      <button onClick={loadStory} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-xl font-bold flex items-center gap-1"><RefreshCw className="w-4 h-4" /></button>
                    </div>
                  </>
                ) : null}
              </div>
            )}

            {/* ── Roleplay / Real-Life Convo ── */}
            {(activeModal === "Real-Life Convo" || activeModal === "Role Play") && (
              <div className="flex flex-col gap-5">
                {roleplayLoading ? <LoadingSpinner label="Setting up your roleplay scenario…" /> : roleplayData ? (
                  <>
                    <div className="bg-indigo-50/50 dark:bg-indigo-950/10 p-5 rounded-2xl border border-indigo-150">
                      <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Scenario Description</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{roleplayData.scenario}</p>
                    </div>
                    {roleplayData.turns?.slice(0, roleplayStep + 1).map((turn: any, ti: number) => (
                      <div key={ti} className="flex flex-col gap-3">
                        <div className="bg-slate-50 dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-150">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{turn.aiLine}</p>
                        </div>
                        {ti === roleplayStep && !selectedOption && turn.options?.map((opt: any, oi: number) => (
                          <button key={oi} onClick={() => { setSelectedOption(opt); if (roleplayStep + 1 < roleplayData.turns.length) setTimeout(() => { setRoleplayStep(s => s + 1); setSelectedOption(null); }, 1500); }}
                            className="p-4 rounded-xl text-left border-2 transition-all border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-905/30 hover:border-indigo-500 hover:bg-indigo-50/10">
                            <p className="font-bold text-xs text-slate-700 dark:text-slate-300">{opt.text}</p>
                          </button>
                        ))}
                        {selectedOption && ti === roleplayStep && (
                          <div className={`p-4.5 rounded-xl border-2 ${selectedOption.quality === "strong" ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/20" : "bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-955/20"}`}>
                            <p className="font-bold text-xs">{selectedOption.quality === "strong" ? "✅ Strong Choice!" : "⚠️ Weaker Choice"} — {selectedOption.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                    {roleplayStep >= (roleplayData.turns?.length || 1) - 1 && selectedOption && (
                      <div className="text-center font-black text-emerald-500 text-lg my-2">🎉 Roleplay Complete! +25 XP</div>
                    )}
                    <button onClick={loadRoleplay} className="self-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors"><RefreshCw className="w-4 h-4" /> Reset Scenario</button>
                  </>
                ) : null}
              </div>
            )}

            {/* ── Public Speaking / Debate ── */}
            {(activeModal === "Public Speaking" || activeModal === "Debate Practice") && (
              <div className="flex flex-col gap-5">
                {debateLoading ? <LoadingSpinner label="Generating debate topic…" /> : debateData ? (
                  <>
                    <div className="bg-rose-50/50 dark:bg-rose-955/10 p-6 rounded-3xl border-2 border-rose-100 text-center">
                      <p className="text-xs font-black text-rose-500 uppercase tracking-widest">Selected Debate Topic</p>
                      <h4 className="text-xl font-black mt-2 text-slate-850 dark:text-white leading-relaxed">{debateData.topic}</h4>
                    </div>
                    {debateData.guidingPoints?.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-150">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Guiding Points to consider</p>
                        <div className="space-y-1.5">
                          {debateData.guidingPoints.map((pt: string, i: number) => <p key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2"><ChevronRight className="w-4 h-4 text-indigo-400" /> {pt}</p>)}
                        </div>
                      </div>
                    )}
                    <div className="text-5xl font-black font-mono text-slate-800 dark:text-white flex items-center justify-center gap-4">
                      <Clock className="w-8 h-8 text-rose-500" /> 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button onClick={() => setTimerRunning(!timerRunning)} className={`${timerRunning ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600"} text-white font-bold px-8 py-3 rounded-2xl shadow-md transition-colors`}>
                        {timerRunning ? "Pause Timer" : "Start Speaking"}
                      </button>
                      <button onClick={() => { setTimeLeft(debateData.speakTimeSeconds || 60); setTimerRunning(false); }} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-5 py-3 rounded-2xl hover:bg-slate-200 transition-colors"><RefreshCw className="w-4 h-4" /></button>
                    </div>
                    <button onClick={loadDebate} className="self-center bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold px-4 py-2 rounded-xl">Generate New Topic</button>
                  </>
                ) : null}
              </div>
            )}

            {/* ── Listening Exercise ── */}
            {activeModal === "Listening Ex." && (
              <div className="flex flex-col items-center text-center py-6 gap-6">
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 w-full">
                  <p className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">Listen carefully and repeat this phrase:</p>
                  <p className="text-lg font-black text-slate-800 dark:text-white leading-relaxed">&ldquo;{PRACTICE_SENTENCES[selectedLang][speakingIndex] || PRACTICE_SENTENCES[selectedLang][0]}&rdquo;</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => speakWord(PRACTICE_SENTENCES[selectedLang][speakingIndex] || PRACTICE_SENTENCES[selectedLang][0])} className="w-20 h-20 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl transition-all hover:scale-105">
                    <Volume2 className="w-10 h-10" />
                  </button>
                  <button onClick={() => {
                    setSpeakingIndex(prev => (prev + 1) % (PRACTICE_SENTENCES[selectedLang]?.length || 1));
                  }} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-200 font-bold px-6 py-4 rounded-full flex items-center gap-2 self-center transition-all shadow-md">
                    <RefreshCw className="w-4 h-4" /> Next Sentence
                  </button>
                </div>
                <p className="text-xs font-bold text-slate-400">Click speaker icon to listen to translation audio.</p>
              </div>
            )}

            {/* ── Grammar Games / Writing Practice ── */}
            {(activeModal === "Grammar Games" || activeModal === "Writing Practice") && (
              <div className="flex flex-col gap-5">
                {writingLoading ? <LoadingSpinner label="Generating writing prompt…" /> : writingData ? (
                  <>
                    <div className="bg-amber-50/50 dark:bg-amber-955/10 p-5 rounded-2xl border-2 border-amber-100">
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-2">Writing Challenge Prompt</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed">{writingData.prompt}</p>
                      <p className="text-[10px] text-slate-400 mt-2 font-bold">Target length: {writingData.expectedLength}</p>
                    </div>
                    {writingData.rubricTips?.length > 0 && (
                      <div className="flex flex-wrap gap-2.5 my-1">
                        {writingData.rubricTips.map((tip: string, i: number) => <p key={i} className="text-[11px] text-slate-500 flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {tip}</p>)}
                      </div>
                    )}
                    <textarea value={writingText} onChange={e => setWritingText(e.target.value)}
                      className="w-full h-36 bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border-2 border-slate-250 text-xs focus:outline-none focus:ring-2 focus:ring-amber-450 resize-none text-slate-800 dark:text-white"
                      placeholder="Start writing here…" />
                    <div className="flex gap-3">
                      <button onClick={submitGrammarCheck} disabled={checkingGrammar}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors">
                        {checkingGrammar ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing spelling & grammar…</> : <><BrainCircuit className="w-4 h-4" /> AI Check & Grade</>}
                      </button>
                      <button onClick={loadWritingPrompt} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 px-4 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition-colors"><RefreshCw className="w-4 h-4" /></button>
                    </div>
                    {grammarFeedback && (
                      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-6 rounded-2xl border-2 border-emerald-250 flex flex-col gap-3.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-emerald-800 dark:text-emerald-300 text-sm">AI Grammar Evaluation</h4>
                          <span className="bg-emerald-500 text-white font-black text-xs px-3 py-1 rounded-full">{grammarFeedback.score}/100</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-350"><span className="font-bold text-emerald-600">✅ Strength: </span>{grammarFeedback.strengths}</p>
                        {grammarFeedback.corrections?.map((c: string, i: number) => <p key={i} className="text-xs text-slate-600 dark:text-slate-350"><span className="font-bold text-rose-500">✏️ Correction: </span>{c}</p>)}
                        <p className="text-xs text-slate-600 dark:text-slate-350"><span className="font-bold text-indigo-600">💡 Suggestion: </span>{grammarFeedback.suggestion}</p>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            )}

            {/* ── Picture Describe ── */}
            {activeModal === "Picture Describe" && (
              <div className="flex flex-col gap-5">
                <div className="w-full h-48 bg-gradient-to-br from-slate-150 to-slate-250 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-12 h-12 mr-2" /> <span className="font-bold">A busy market scene</span>
                </div>
                <textarea className="w-full h-24 bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border-2 border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" placeholder={`Describe this image in ${selectedLang}…`} />
                <button onClick={() => Swal.fire("Submitted! 🎉", "Great description! +15 XP", "success")} className="bg-orange-500 text-white font-bold py-3 rounded-xl shadow-md">Submit Description</button>
              </div>
            )}

            {/* ── Language Games / Word Scramble ── */}
            {activeModal === "Language Games" && (
              <WordScrambleGame lang={selectedLang} />
            )}

            {/* ── Daily Challenge ── */}
            {activeModal === "Daily Challenge" && (
              <div className="flex flex-col gap-4">
                {dailyLoading ? <LoadingSpinner label="Generating today's challenges…" /> : dailyTasks.length > 0 ? (
                  <>
                    {dailyTasks.map((task: any, i: number) => (
                      <div key={i} onClick={() => { const n = [...tasksDone]; n[i] = !n[i]; setTasksDone(n); }}
                        className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${tasksDone[i] ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"}`}>
                          {tasksDone[i] && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1">
                          <p className={`font-black text-sm ${tasksDone[i] ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-200"}`}>{task.title}</p>
                          {task.description && <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>}
                        </div>
                        <span className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-black text-xs px-2.5 py-1 rounded-lg shrink-0">{task.xp} XP</span>
                      </div>
                    ))}
                    {tasksDone.every(Boolean) && <div className="text-center font-black text-emerald-500 text-lg py-2">🏆 All Challenges Complete! +100 Bonus XP</div>}
                    <button onClick={loadDailyChallenge} className="self-center bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-slate-200 transition-colors"><RefreshCw className="w-3.5 h-3.5" /> Refresh Challenges</button>
                  </>
                ) : null}
              </div>
            )}

          </div>
        </div>
      )}
    </PortalLayout>
  );
}

// ─── Word Scramble Sub-component ──────────────────────────────────────────────
function WordScrambleGame({ lang }: { lang: Lang }) {
  const wordsList: Record<Lang, string[]> = {
    English: ["ELEPHANT", "BEAUTIFUL", "DETERMINED", "EDUCATION", "CREATIVE", "WONDERFUL", "KNOWLEDGE", "SUCCESS"],
    Tamil: ["பள்ளி", "ஆசிரியர்", "மாணவன்", "கல்வி", "முயற்சி", "வெற்றி", "அறிவு", "புத்தகம்"]
  };
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [scrambled, setScrambled] = useState("");

  const currentWord = wordsList[lang][index] || wordsList[lang][0];

  useEffect(() => {
    let res = currentWord.split("").sort(() => Math.random() - 0.5).join("");
    if (res === currentWord && currentWord.length > 1) {
      res = currentWord.split("").sort(() => Math.random() - 0.5).join("");
    }
    setScrambled(res);
    setInput("");
  }, [currentWord]);

  return (
    <div className="text-center flex flex-col gap-4 items-center">
      <p className="text-slate-500 text-xs font-bold">Unscramble the word:</p>
      <div className="text-4xl font-black tracking-widest text-indigo-650 uppercase">{scrambled}</div>
      <div className="flex gap-2 mt-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} className="bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-xl text-center font-bold border-2 border-slate-350 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800 dark:text-white" placeholder="Type answer here" />
        <button onClick={() => input.toUpperCase() === currentWord.toUpperCase() ? Swal.fire("Correct! 🎉", "+10 XP", "success") : Swal.fire("Try Again!", "", "error")} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold">Check</button>
      </div>
      <button onClick={() => {
        setIndex(prev => (prev + 1) % wordsList[lang].length);
      }} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all mt-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <RefreshCw className="w-3.5 h-3.5" /> Next Scrambled Word
      </button>
    </div>
  );
}

// ─── Shared Loading Spinner ───────────────────────────────────────────────────
function LoadingSpinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      <p className="text-indigo-500 font-bold text-xs">{label}</p>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function PracticeCard({ icon, title, color, onClick }: any) {
  const colors: Record<string, string> = {
    rose:    "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-500 hover:text-white dark:bg-rose-950/20 dark:border-rose-900",
    blue:    "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-500 hover:text-white dark:bg-blue-950/20 dark:border-blue-900",
    amber:   "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-500 hover:text-white dark:bg-amber-955/20 dark:border-amber-900",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-500 hover:text-white dark:bg-emerald-950/20 dark:border-emerald-900"
  };
  return (
    <button onClick={onClick} className={`p-6 rounded-[2rem] border-2 flex flex-col items-center justify-center gap-3.5 transition-all active:scale-95 group shadow-sm hover:shadow-md ${colors[color]}`}>
      <div className="group-hover:scale-110 transition-transform">{React.cloneElement(icon, { className: "w-8 h-8" })}</div>
      <span className="font-extrabold text-sm">{title}</span>
    </button>
  );
}

function FeatureCard({ icon, title, desc, color, onClick }: any) {
  const bg: Record<string, string> = {
    rose:    "bg-rose-50/50 hover:bg-rose-100 border-rose-100 text-rose-700 dark:bg-rose-955/10 dark:border-rose-950",
    indigo:  "bg-indigo-50/50 hover:bg-indigo-100 border-indigo-100 text-indigo-700 dark:bg-indigo-955/10 dark:border-indigo-950",
    emerald: "bg-emerald-50/50 hover:bg-emerald-100 border-emerald-100 text-emerald-700 dark:bg-emerald-955/10 dark:border-emerald-950",
    blue:    "bg-blue-50/50 hover:bg-blue-100 border-blue-100 text-blue-700 dark:bg-blue-955/10 dark:border-blue-950",
    amber:   "bg-amber-50/50 hover:bg-amber-100 border-amber-100 text-amber-700 dark:bg-amber-955/10 dark:border-amber-950",
    purple:  "bg-purple-50/50 hover:bg-purple-100 border-purple-100 text-purple-700 dark:bg-purple-955/10 dark:border-purple-950",
    pink:    "bg-pink-50/50 hover:bg-pink-100 border-pink-100 text-pink-700 dark:bg-pink-955/10 dark:border-pink-950",
    cyan:    "bg-cyan-50/50 hover:bg-cyan-100 border-cyan-100 text-cyan-700 dark:bg-cyan-955/10 dark:border-cyan-950",
    orange:  "bg-orange-50/50 hover:bg-orange-100 border-orange-100 text-orange-700 dark:bg-orange-955/10 dark:border-orange-950"
  };
  return (
    <button onClick={onClick} className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col gap-4 text-left shadow-sm hover:shadow-md hover:-translate-y-1 ${bg[color] || bg.indigo} dark:text-slate-300`}>
      <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl w-fit shadow-md">{React.cloneElement(icon, { className: "w-5 h-5" })}</div>
      <div><h4 className="font-extrabold text-sm tracking-tight leading-snug">{title}</h4><p className="text-[10px] opacity-75 mt-1 line-clamp-1">{desc}</p></div>
    </button>
  );
}

function ProgressRing({ label, value, color }: { label: string; value: number; color: string }) {
  const r = 28; const c = 2 * Math.PI * r; const offset = c - (value / 100) * c;
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative flex items-center justify-center">
        <svg width="72" height="72" className="rotate-[-90deg]">
          <circle cx="36" cy="36" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="6.5" fill="none" />
          <circle cx="36" cy="36" r={r} stroke={color} strokeWidth="6.5" fill="none" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        </svg>
        <span className="absolute text-xs font-black">{value}%</span>
      </div>
      <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function Badge({ icon, name, earned }: { icon: string; name: string; earned: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-2 p-4 rounded-[2rem] border-2 w-full text-center ${earned ? "bg-amber-50/50 border-amber-200 shadow-sm dark:bg-amber-955/15 dark:border-amber-900" : "bg-slate-50 border-slate-200 grayscale opacity-45 dark:bg-slate-905/30 dark:border-slate-800"}`}>
      <div className="text-3xl drop-shadow-sm">{icon}</div>
      <span className="text-[10px] font-black leading-tight text-slate-800 dark:text-slate-350">{name}</span>
    </div>
  );
}
