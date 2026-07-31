"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import {
  Mic, BookOpen, Headphones, PenTool, MessageSquare, Users, Search,
  Volume2, VolumeX, Book, Gamepad2, ListPlus, Mic2,
  Calendar, Send, Target, BrainCircuit,
  MessageCircle, X, Zap, Clock, Loader2, ChevronRight, Star, RefreshCw,
  ArrowRight, Sparkles, Languages, Trophy, Check, Sliders, Play, Square, Heart, Smile, Pause
} from "lucide-react";
import Swal from "sweetalert2";

// ─── Types ────────────────────────────────────────────────────────────────────
type Lang = "Tamil" | "English";

// ─── Bilingual UI Dictionary ──────────────────────────────────────────────────
const UI_TEXT: Record<Lang, Record<string, string>> = {
  English: {
    hubTitle: "Language & Communication Hub 🗣️",
    hubSubtitle: "Build confidence, perfect your pronunciation, and master English & Tamil with clear audio coaching and guided step-by-step practice.",
    deptBanner: "School Education Department • Tamil Nadu",
    langPractice: "Practice Language",
    audioSpeed: "Audio Speed",
    testAudio: "Test Audio",
    stopAudio: "Stop",
    comfortPlanTitle: "Today's Relaxed Learning Path 🌸",
    comfortPlanSub: "Zero stress micro-lessons with slow 0.75x clear audio narration. Take it step by step!",
    relaxedPace: "Relaxed (10 mins)",
    standardPace: "Standard (20 mins)",
    step1Title: "🎧 Audio Warmup",
    step1Desc: "Listen to Word of the Day & pronunciation at 0.75x speed.",
    step2Title: "📖 Gentle Story Reading",
    step2Desc: "Read a short story passage out loud with audio guidance.",
    step3Title: "🗣️ Easy Speaking Practice",
    step3Desc: "Speak 1 sentence into the mic for gentle score feedback.",
    step4Title: "🧩 Fun Word Puzzle",
    step4Desc: "Unscramble one word or complete a simple puzzle.",
    listenAudio: "Listen Audio (0.75x)",
    pauseAudio: "Pause Audio ⏸️",
    resumeAudio: "Resume Audio ▶️",
    stop: "Stop ⏹️",
    readPassage: "Read Passage",
    speakMic: "Speak into Mic",
    playPuzzle: "Play Puzzle",
    skillModules: "Skill Modules",
    aiLab: "AI Communication Lab",
    aiTutor: "AI Language Tutor",
    wodTitle: "💡 Word of the Day",
    nextStory: "Next Story",
    readAloudMic: "Read Aloud into Mic 🎤",
    question: "Question",
    micMode: "🎙️ Microphone Mode",
    typeMode: "⌨️ Type & Listen Mode (No Mic)",
    readSentenceAloud: "Read this sentence aloud into microphone",
    typeSentencePrompt: "Practice typing & listen to audio pronunciation",
    nextSentence: "Next Sentence",
    nextWord: "Next Word",
    clear: "Clear",
    check: "Check",
    newTopic: "Generate New Topic",
    startSpeaking: "Start Speaking",
    pauseTimer: "Pause Timer",
    meaningAndExample: "Meaning & Example",
    tapToReveal: "Tap card to reveal meaning",
    tapToSeeWord: "Tap to see word",
    scenarioDesc: "Scenario Description",
    guidingPoints: "Guiding Points",
    writingPrompt: "Writing Challenge Prompt",
    targetLength: "Target length",
    aiCheck: "AI Check & Grade",
    scramblePrompt: "Unscramble the word:",
    scramblePlaceholder: "Type answer here",
    refreshChallenges: "Refresh Challenges",
    stopAndGrade: "Stop & Grade Speech",
  },
  Tamil: {
    hubTitle: "மொழி மற்றும் தகவல் தொடர்பு மையம் 🗣️",
    hubSubtitle: "தெளிவான ஒலி பயிற்சி மற்றும் செயற்கை நுண்ணறிவு உதவிகளுடன் தமிழ் & ஆங்கிலத்தில் பேசுங்கள்.",
    deptBanner: "பள்ளிப் கல்வித் துறை • தமிழ்நாடு அரசு",
    langPractice: "பயிற்சி மொழி",
    audioSpeed: "ஒலி வேகம்",
    testAudio: "ஒலி சோதனை",
    stopAudio: "நிறுத்து",
    comfortPlanTitle: "இன்றைய அமைதியான கற்றல் பாதை 🌸",
    comfortPlanSub: "மன அழுத்தம் இல்லாத எளிய பாடங்கள் மற்றும் 0.75x தெளிவான ஒலி வழிகாட்டுதல்!",
    relaxedPace: "மெதுவான பயிற்சி (10 நிமி)",
    standardPace: "சாதாரண பயிற்சி (20 நிமி)",
    step1Title: "🎧 ஒலி ஆயத்தப் பயிற்சி",
    step1Desc: "இன்றைய வார்த்தை மற்றும் உச்சரிப்பை 0.75x வேகத்தில் கேளுங்கள்.",
    step2Title: "📖 எளிய கதை வாசிப்பு",
    step2Desc: "சிறு கதையை உரக்கப் படித்து ஒலி வழிகாட்டுதலைப் பெறுங்கள்.",
    step3Title: "🗣️ எளிய பேச்சுப் பயிற்சி",
    step3Desc: "ஒரு வாக்கியத்தைப் பேசி மதிப்பீடு பெறுங்கள்.",
    step4Title: "🧩 சொல் புதிர் விளையாட்டு",
    step4Desc: "வார்த்தைகளைச் சரியாக அடுக்கி புதிரை முடியுங்கள்.",
    listenAudio: "ஒலி கேளுங்கள் (0.75x)",
    pauseAudio: "இடைநிறுத்து ⏸️",
    resumeAudio: "தொடர் ▶️",
    stop: "நிறுத்து ⏹️",
    readPassage: "கதை வாசிப்பு",
    speakMic: "மைக்கில் பேசுங்கள்",
    playPuzzle: "புதிர் விளையாடு",
    skillModules: "திறன் பயிற்சிகள்",
    aiLab: "AI தகவல் தொடர்பு ஆய்வகம்",
    aiTutor: "AI மொழி ஆசிரியர்",
    wodTitle: "💡 இன்றைய சொல்",
    nextStory: "அடுத்த கதை",
    readAloudMic: "மைக்கில் வாசிக்க 🎤",
    question: "வினா",
    micMode: "🎙️ மைக் முறை",
    typeMode: "⌨️ தட்டச்சு & கேட்கும் முறை (மைக் இல்லாமல்)",
    readSentenceAloud: "இந்த வாக்கியத்தை மைக்கில் உரக்கப் படியுங்கள்",
    typeSentencePrompt: "வாக்கியத்தை தட்டச்சு செய்து உச்சரிப்பைக் கேளுங்கள்",
    nextSentence: "அடுத்த வாக்கியம்",
    nextWord: "அடுத்த சொல்",
    clear: "அழிப்பாய்",
    check: "சரிபார்",
    newTopic: "புதிய தலைப்பு",
    startSpeaking: "பேசத் தொடங்கு",
    pauseTimer: "நேரத்தை நிறுத்து",
    meaningAndExample: "பொருள் மற்றும் உதாரணம்",
    tapToReveal: "பொருளைக் காண அட்டையைத் தொடவும்",
    tapToSeeWord: "சொல்லைக் காண அட்டையைத் தொடவும்",
    scenarioDesc: "சூழ்நிலை விளக்கம்",
    guidingPoints: "வழிகாட்டும் குறிப்புகள்",
    writingPrompt: "எழுத்துப் பயிற்சி தலைப்பு",
    targetLength: "இலக்கு அளவு",
    aiCheck: "AI பரிசோதனை & மதிப்பெண்",
    scramblePrompt: "எழுத்துக்களைச் சீரமைத்து சொல்லைக் கண்டுபிடிக்கவும்:",
    scramblePlaceholder: "பதிலை தட்டச்சு செய்யவும்",
    refreshChallenges: "சவால்களை புதுப்பி",
    stopAndGrade: "பேச்சை நிறுத்தி மதிப்பிட",
  }
};


const MODAL_TITLES: Record<Lang, Record<string, string>> = {
  English: {
    "AI Speaking Coach": "AI Speaking Coach 🎙️",
    "Vocab Builder": "Vocab Builder 📚",
    "Sentence Builder": "Sentence Builder 🧩",
    "Story Reading": "Story Reading 📖",
    "Real-Life Convo": "Real-Life Conversation 🗣️",
    "Role Play": "Real-Life Roleplay 🗣️",
    "Public Speaking": "Public Speaking 🎤",
    "Debate Practice": "Debate Practice 🗣️",
    "Listening Ex.": "Listening Exercise 🎧",
    "Writing Practice": "Writing Practice ✍️",
    "Grammar Games": "Grammar Games 🎮",
    "Language Games": "Word Puzzle Games 🧩",
    "Daily Challenge": "Daily XP Challenge 🏆",
  },
  Tamil: {
    "AI Speaking Coach": "AI பேச்சுப் பயிற்சி ஆசிரியர் 🎙️",
    "Vocab Builder": "சொற்களஞ்சியப் பயிற்சி 📚",
    "Sentence Builder": "வாக்கிய அமைப்பு புதிர் 🧩",
    "Story Reading": "கதை வாசிப்புப் பயிற்சி 📖",
    "Real-Life Convo": "சமூக உரையாடல் பயிற்சி 🗣️",
    "Role Play": "நடைமுறை உரையாடல் 🗣️",
    "Public Speaking": "பொதுப் பேச்சுப் பயிற்சி 🎤",
    "Debate Practice": "பட்டிமன்றப் பயிற்சி 🗣️",
    "Listening Ex.": "செவிமடுக்கும் பயிற்சி 🎧",
    "Writing Practice": "எழுத்துப் பயிற்சி ✍️",
    "Grammar Games": "இலக்கண விளையாட்டுகள் 🎮",
    "Language Games": "சொல் புதிர் விளையாட்டு 🧩",
    "Daily Challenge": "தினசரி சவால் பணிகள் 🏆",
  }
};

// ─── Audio Equalizer Visualizer Component ─────────────────────────────────────
function AudioEqualizerWave({ active, color = "bg-indigo-500" }: { active: boolean; color?: string }) {
  return (
    <div className="flex items-center gap-1 h-5 px-2">
      <span className={`w-1 rounded-full ${color} transition-all duration-300 ${active ? "animate-[bounce_0.6s_infinite_100ms] h-5" : "h-2 opacity-40"}`} />
      <span className={`w-1 rounded-full ${color} transition-all duration-300 ${active ? "animate-[bounce_0.6s_infinite_200ms] h-4" : "h-1.5 opacity-40"}`} />
      <span className={`w-1 rounded-full ${color} transition-all duration-300 ${active ? "animate-[bounce_0.6s_infinite_300ms] h-6" : "h-3 opacity-40"}`} />
      <span className={`w-1 rounded-full ${color} transition-all duration-300 ${active ? "animate-[bounce_0.6s_infinite_150ms] h-3" : "h-1 opacity-40"}`} />
      <span className={`w-1 rounded-full ${color} transition-all duration-300 ${active ? "animate-[bounce_0.6s_infinite_250ms] h-5" : "h-2 opacity-40"}`} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LanguageCoachingPage() {
  const { data: session } = useSession();
  const studentId = (session?.user as any)?.studentId || (session?.user as any)?.id;
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const LC = `${API}/api/language-coaching`;

  const [selectedLang, setSelectedLang] = useState<Lang>("English");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const t = UI_TEXT[selectedLang];

  // ─── Audio Engine & Audibility Controls ───────────────────────────────────────
  const [speechRate, setSpeechRate] = useState<number>(0.75); // 0.75x default = clear & relaxed speed
  const [audioVolume, setAudioVolume] = useState<number>(1.0); // 100% volume
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioState, setAudioState] = useState<"stopped" | "playing" | "paused">("stopped");
  // Preload speech synthesis voices for browser compatibility
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => { window.speechSynthesis.getVoices(); };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // ─── Web Audio API Chime Synthesizer ─────────────────────────────────────────
  const playAudioChime = useCallback((volume = 0.5) => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 ascending chime
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(volume * 0.15, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.22);
      });
    } catch (e) {
      console.warn("Web Audio chime error:", e);
    }
  }, []);

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const pauseAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
    setAudioState("paused");
    setIsPlayingAudio(false);
  }, []);

  const resumeAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.play();
      setAudioState("playing");
      setIsPlayingAudio(true);
    } else if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.resume();
      setAudioState("playing");
      setIsPlayingAudio(true);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setAudioState("stopped");
    setIsPlayingAudio(false);
  }, []);

  const fallbackTamilSpeech = useCallback((cleanText: string, rateOverride?: number) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
        const u = new SpeechSynthesisUtterance(cleanText);
        u.lang = "ta-IN";
        u.rate = rateOverride || speechRate;
        u.volume = audioVolume;
        u.onstart = () => { setIsPlayingAudio(true); setAudioState("playing"); };
        u.onend = () => { setIsPlayingAudio(false); setAudioState("stopped"); };
        u.onerror = () => { setIsPlayingAudio(false); setAudioState("stopped"); };
        window.speechSynthesis.speak(u);
      } catch (e) {
        console.error("Fallback Tamil speech error:", e);
        setIsPlayingAudio(false);
        setAudioState("stopped");
      }
    } else {
      setIsPlayingAudio(false);
      setAudioState("stopped");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speechRate, audioVolume]);

  const speakWord = useCallback(async (text: string, rateOverride?: number) => {
    if (typeof window === "undefined" || !text) return;
    
    playAudioChime(audioVolume);
    const cleanText = text.replace(/[\uFFFD\uFEFF\u200B\u200C\u200D\u00AD]/g, "").trim();

    // Cancel any ongoing audio or speech
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    }


    // ── NATIVE TAMIL BACKEND NEURAL TTS ENGINE ───────────────────────────────
    if (selectedLang === "Tamil") {
      try {
        setIsPlayingAudio(true);
        setAudioState("playing");

        const token = (session?.user as any)?.backendToken;
        const response = await fetch(`${API}/api/language-coaching/tts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            text: cleanText,
            voice: "ta-IN-PallaviNeural",
          }),
        });


        const data = await response.json();

        if (data.success && data.audioUrl) {
          const fullAudioUrl = `${API}${data.audioUrl}`;
          const audio = new Audio(fullAudioUrl);
          currentAudioRef.current = audio;
          audio.volume = audioVolume;
          audio.playbackRate = rateOverride || speechRate;

          audio.onplay = () => {
            setIsPlayingAudio(true);
            setAudioState("playing");
          };

          audio.onended = () => {
            setIsPlayingAudio(false);
            setAudioState("stopped");
            currentAudioRef.current = null;
          };

          audio.onerror = () => {
            console.warn("Backend Tamil TTS playback error, falling back to browser SpeechSynthesis");
            currentAudioRef.current = null;
            fallbackTamilSpeech(cleanText, rateOverride);
          };

          await audio.play();
          return;
        } else {
          throw new Error(data.error || "Failed to retrieve audio URL from backend");
        }
      } catch (err) {
        console.warn("Backend Tamil TTS request failed, falling back to browser SpeechSynthesis:", err);
        currentAudioRef.current = null;
        fallbackTamilSpeech(cleanText, rateOverride);
        return;
      }
    }

    // ── STANDARD ENGLISH BROWSER VOICE ────────────────────────────────────────
    if (window.speechSynthesis) {
      try {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        setIsPlayingAudio(true);
        setAudioState("playing");

        setTimeout(() => {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(cleanText);
          u.lang = "en-US";
          u.rate = rateOverride || speechRate;
          u.volume = audioVolume;

          const voices = window.speechSynthesis.getVoices();
          const enVoice = voices.find(v => v.lang.toLowerCase().startsWith("en") && !v.localService) || voices.find(v => v.lang.toLowerCase().startsWith("en"));
          if (enVoice) u.voice = enVoice;

          u.onstart = () => { setIsPlayingAudio(true); setAudioState("playing"); };
          u.onend = () => { setIsPlayingAudio(false); setAudioState("stopped"); };
          u.onerror = () => { setIsPlayingAudio(false); setAudioState("stopped"); };

          window.speechSynthesis.speak(u);
        }, 50);
      } catch (e) {
        console.error("Speech Synthesis error:", e);
        setIsPlayingAudio(false);
        setAudioState("stopped");
      }
    }
  }, [selectedLang, speechRate, audioVolume, playAudioChime, API, fallbackTamilSpeech, session]);


  // ─── Unicode Text Sanitizer ──────────────────────────────────────────────────
  const cleanUnicodeText = useCallback((text: string) => {
    if (!text) return "";
    return text
      .replace(/[\uFFFD\uFEFF\u200B\u200C\u200D\u00AD]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }, []);

  // ─── Daily Comfort Plan State ────────────────────────────────────────────────
  const [comfortMode, setComfortMode] = useState<"relaxed" | "standard">("relaxed");
  const [comfortStepsDone, setComfortStepsDone] = useState<boolean[]>([false, false, false, false]);

  const toggleComfortStep = (index: number) => {
    setComfortStepsDone(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  // ─── Grade Tier Detection ─────────────────────────────────────────────────────
  type Tier = "explorer" | "communicator" | "orator";
  const [gradeTier, setGradeTier] = useState<Tier>("communicator");
  const [tierLoading, setTierLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    const fetchTier = async () => {
      try {
        const token = (session?.user as any)?.backendToken;
        const res = await fetch(`${API}/api/students/${studentId}`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {},
        });
        const json = await res.json();
        const cls = parseInt(json?.data?.class || json?.class || "9", 10);
        if (cls <= 8) setGradeTier("explorer");
        else if (cls <= 10) setGradeTier("communicator");
        else setGradeTier("orator");
      } catch { /* keep default */ }
      finally { setTierLoading(false); }
    };
    fetchTier();
  }, [studentId, API, session]);


  // ─── Tier-based 6 Feature Cards ──────────────────────────────────────────────
  const TIER_CARDS: Record<Tier, Array<{ icon: React.ReactElement; title: string; desc: string; color: string; modal: string }>> = {
    explorer: [
      { icon: <Mic2 />, title: selectedLang === "Tamil" ? "AI பேச்சுப் பயிற்சி" : "AI Speaking Coach", desc: selectedLang === "Tamil" ? "உச்சரிப்பு பரிசோதனை" : "Pronunciation test", color: "rose", modal: "AI Speaking Coach" },
      { icon: <Search />, title: selectedLang === "Tamil" ? "சொற்களஞ்சியம்" : "Vocab Builder", desc: selectedLang === "Tamil" ? "அட்டைப் பயிற்சி" : "AI Flashcards", color: "emerald", modal: "Vocab Builder" },
      { icon: <Book />, title: selectedLang === "Tamil" ? "கதை வாசிப்பு" : "Story Reading", desc: selectedLang === "Tamil" ? "AI உருவாக்கிக் கதைகள்" : "AI-generated stories", color: "purple", modal: "Story Reading" },
      { icon: <ListPlus />, title: selectedLang === "Tamil" ? "வாக்கிய அமைப்பு" : "Sentence Builder", desc: selectedLang === "Tamil" ? "சொல் புதிர்கள்" : "AI word puzzles", color: "cyan", modal: "Sentence Builder" },
      { icon: <Sparkles />, title: selectedLang === "Tamil" ? "சொல் விளையாட்டுகள்" : "Language Games", desc: selectedLang === "Tamil" ? "சொல் புதிர் விளையாட்டு" : "Word Scramble fun", color: "pink", modal: "Language Games" },
      { icon: <Target />, title: selectedLang === "Tamil" ? "தினசரி சவால்" : "Daily Challenge", desc: selectedLang === "Tamil" ? "புள்ளிகள் பெறும் பணிகள்" : "AI XP tasks", color: "blue", modal: "Daily Challenge" },
    ],
    communicator: [
      { icon: <Mic2 />, title: selectedLang === "Tamil" ? "AI பேச்சுப் பயிற்சி" : "AI Speaking Coach", desc: selectedLang === "Tamil" ? "உச்சரிப்பு பரிசோதனை" : "Pronunciation test", color: "rose", modal: "AI Speaking Coach" },
      { icon: <Search />, title: selectedLang === "Tamil" ? "சொற்களஞ்சியம்" : "Vocab Builder", desc: selectedLang === "Tamil" ? "அட்டைப் பயிற்சி" : "AI Flashcards", color: "emerald", modal: "Vocab Builder" },
      { icon: <Users />, title: selectedLang === "Tamil" ? "சமூக உரையாடல்" : "Real-Life Convo", desc: selectedLang === "Tamil" ? "நடைமுறைப் பேச்சு" : "Roleplay scenarios", color: "indigo", modal: "Real-Life Convo" },
      { icon: <Book />, title: selectedLang === "Tamil" ? "கதை வாசிப்பு" : "Story Reading", desc: selectedLang === "Tamil" ? "AI உருவாக்கிக் கதைகள்" : "AI-generated stories", color: "purple", modal: "Story Reading" },
      { icon: <PenTool />, title: selectedLang === "Tamil" ? "எழுத்துப் பயிற்சி" : "Writing Practice", desc: selectedLang === "Tamil" ? "AI வழிகாட்டுதல்" : "AI writing prompts", color: "amber", modal: "Writing Practice" },
      { icon: <Target />, title: selectedLang === "Tamil" ? "தினசரி சவால்" : "Daily Challenge", desc: selectedLang === "Tamil" ? "புள்ளிகள் பெறும் பணிகள்" : "AI XP tasks", color: "blue", modal: "Daily Challenge" },
    ],
    orator: [
      { icon: <Mic2 />, title: selectedLang === "Tamil" ? "AI பேச்சுப் பயிற்சி" : "AI Speaking Coach", desc: selectedLang === "Tamil" ? "உச்சரிப்பு பரிசோதனை" : "Pronunciation test", color: "rose", modal: "AI Speaking Coach" },
      { icon: <MessageSquare />, title: selectedLang === "Tamil" ? "பட்டிமன்றப் பயிற்சி" : "Debate Practice", desc: selectedLang === "Tamil" ? "கருத்துரைத்தல்" : "Argue your point", color: "indigo", modal: "Debate Practice" },
      { icon: <MessageCircle />, title: selectedLang === "Tamil" ? "பொதுப் பேச்சு" : "Public Speaking", desc: selectedLang === "Tamil" ? "பேச்சுத் தலைப்புகள்" : "AI debate topics", color: "purple", modal: "Public Speaking" },
      { icon: <Gamepad2 />, title: selectedLang === "Tamil" ? "இலக்கண விளையாட்டுகள்" : "Grammar Games", desc: selectedLang === "Tamil" ? "இலக்கணப் பிழை திருத்தம்" : "Grammar check & tips", color: "pink", modal: "Grammar Games" },
      { icon: <PenTool />, title: selectedLang === "Tamil" ? "எழுத்துப் பயிற்சி" : "Writing Practice", desc: selectedLang === "Tamil" ? "AI வழிகாட்டுதல்" : "AI writing prompts", color: "amber", modal: "Writing Practice" },
      { icon: <Target />, title: selectedLang === "Tamil" ? "தினசரி சவால்" : "Daily Challenge", desc: selectedLang === "Tamil" ? "புள்ளிகள் பெறும் பணிகள்" : "AI XP tasks", color: "blue", modal: "Daily Challenge" },
    ],
  };

  const TIER_LABELS: Record<Tier, { label: string; badge: string; color: string; desc: string }> = {
    explorer: { label: selectedLang === "Tamil" ? "ஆராய்ச்சியாளர்" : "Explorer", badge: "Classes 6–8", color: "bg-emerald-500 from-emerald-400 to-teal-500", desc: "Interactive vocabulary, puzzles, and fun word matches." },
    communicator: { label: selectedLang === "Tamil" ? "தகவல் தொடர்பாளர்" : "Communicator", badge: "Classes 9–10", color: "bg-blue-500 from-blue-400 to-indigo-500", desc: "Interactive roleplay scenarios, reading, and formal writing." },
    orator: { label: selectedLang === "Tamil" ? "பேச்சாளர்" : "Orator", badge: "Classes 11–12", color: "bg-purple-500 from-purple-400 to-fuchsia-500", desc: "Advanced public speaking topics, grammar mechanics, and debates." },
  };

  // ── Fetch helper ─────────────────────────────────────────────────────────────
  const apiFetch = useCallback(
    async (path: string, body?: object) => {
      const id = studentId || "demo";
      const url = `${LC}/${id}/${path}`;
      const token = (session?.user as any)?.backendToken;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = body
        ? await fetch(url, { method: "POST", headers, body: JSON.stringify({ ...body, language: selectedLang }) })
        : await fetch(`${url}?language=${selectedLang}`, { headers });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "API error");
      return json.data;
    },
    [studentId, selectedLang, LC, session]
  );

  const [progressStats, setProgressStats] = useState<any>({ speaking: 0, reading: 0, listening: 0, writing: 0 });

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
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", content: selectedLang === "Tamil" ? "வணக்கம்! நான் உங்கள் AI தமிழ் ஆசிரியர். இன்று உங்களுக்கு எவ்வாறு உதவட்டும்? 😊" : "Hello! I am your AI Language Tutor. How can I help you improve today? 😊" }
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
      if (data.text) speakWord(data.text);
    } catch {
      setChatHistory(p => [...p, { role: "ai", content: selectedLang === "Tamil" ? "தற்போது இணைய இணைப்பில்லை, முயற்சியைத் தொடருங்கள்!" : "I'm offline right now, but keep going!" }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ─── Speaking Coach ───────────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [speakingScore, setSpeakingScore] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const [transcript, setTranscript] = useState("");
  const [speakingIndex, setSpeakingIndex] = useState(0);
  const [speakingMode, setSpeakingMode] = useState<"mic" | "type">("mic");
  const [typedInput, setTypedInput] = useState("");

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
          if (!transcript || transcript.trim().length < 2) {
            setSpeakingScore({
              accuracyScore: 0,
              wordDiffs: targetSentence.split(/\s+/).map((w: string) => ({ word: w, status: "missed" })),
              tip: selectedLang === "Tamil" ? "பேச்சு கண்டறியப்படவில்லை! மைக்கில் தெளிவாகப் பேசுங்கள்." : "No speech detected! Please speak clearly into the mic."
            });
            return;
          }
          const data = await apiFetch("pronunciation-check", {
            targetSentence: targetSentence,
            transcript: transcript
          });
          setSpeakingScore(data);
          toggleComfortStep(2);
        } catch {
          const targetWords = targetSentence.toLowerCase().replace(/[^a-z0-9\s]/gi, "").split(/\s+/);
          const spokenWords = transcript.toLowerCase().replace(/[^a-z0-9\s]/gi, "").split(/\s+/);
          const wordDiffs = targetWords.map((w: string) => ({
            word: w,
            status: spokenWords.includes(w) ? "correct" : "missed"
          }));
          const correctCount = wordDiffs.filter((d: any) => d.status === "correct").length;
          const score = Math.round((correctCount / Math.max(targetWords.length, 1)) * 100);
          setSpeakingScore({
            accuracyScore: score,
            wordDiffs: wordDiffs,
            tip: score > 70 ? (selectedLang === "Tamil" ? "சிறந்த தெளிவான பேச்சு! பயிற்சியைத் தொடருங்கள்." : "Good clear speech! Keep practicing.") : (selectedLang === "Tamil" ? "மெதுவாகவும் தெளிவாகவும் பேச முயலுங்கள்." : "Try speaking a bit slower and clearer.")
          });
          toggleComfortStep(2);
        } finally {
          setIsAnalyzing(false);
          setTranscript("");
          loadProgressStats();
        }
      }, 1000);
    } else {
      setSpeakingScore(null);
      setTranscript("");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        recorder.start();
        mediaRecorderRef.current = recorder;

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
        Swal.fire(selectedLang === "Tamil" ? "மைக் அனுமதி தேவை" : "Microphone Access Required", selectedLang === "Tamil" ? "வாசிப்பு பயிற்சி செய்ய மைக் அனுமதியை வழங்கவும்." : "Please grant microphone permissions to use Read Aloud.", "warning");
      }
    }
  };

  // ─── Vocab Flashcards ─────────────────────────────────────────────────────────
  const [vocabCards, setVocabCards] = useState<any[]>([]);
  const [vocabIndex, setVocabIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [vocabLoading, setVocabLoading] = useState(false);

  const loadVocab = async () => {
    setVocabLoading(true);
    try {
      const data = await apiFetch("vocab-builder", { difficulty: "hard" });
      const raw = Array.isArray(data) ? data : [];
      const cleaned = raw.map((c: any) => ({
        word: cleanUnicodeText(c.word || c.title || ""),
        meaning: cleanUnicodeText(c.meaning || c.definition || ""),
        sentence: cleanUnicodeText(c.sentence || c.example || "")
      }));
      setVocabCards(cleaned);
      setVocabIndex(0);
      setShowMeaning(false);
    } catch {
      setVocabCards(selectedLang === "Tamil" ? [
        { word: "முயற்சி", meaning: "ஒரு செயலைச் செய்து முடிக்க எடுக்கும் உழைப்பு.", sentence: "முயற்சி உடையார் இகழ்ச்சி அடையார்." },
        { word: "ஒழுக்கம்", meaning: "எதைச் செய்ய வேண்டும், எதைச் செய்யக் கூடாது என்று நம்மை நாமே ஒழுங்குபடுத்துவது.", sentence: "விளையாட்டில் வெற்றி பெற நல்ல ஒழுக்கம் தேவை." },
        { word: "நம்பிக்கை", meaning: "தன்னைப் பற்றியும் பிறரைப் பற்றியும் கொள்ளும் நண்ணம்பிக்கை.", sentence: "நம்பிக்கையே மனிதனின் பலம்." }
      ] : [
        { word: "Equanimity", meaning: "Mental calmness, composure, especially in a difficult situation.", sentence: "She accepted both praise and criticism with equanimity." },
        { word: "Pernicious", meaning: "Having a harmful effect, especially in a gradual or subtle way.", sentence: "The pernicious influence of false rumours ruined their teamwork." }
      ]);
    } finally {
      setVocabLoading(false);
      loadProgressStats();
    }
  };

  // ─── Sentence Builder ─────────────────────────────────────────────────────────
  const [sentenceData, setSentenceData] = useState<any>(null);
  const [currentSentence, setCurrentSentence] = useState<string[]>([]);
  const [sentenceLoading, setSentenceLoading] = useState(false);

  const loadSentence = async () => {
    setSentenceLoading(true);
    try {
      const data = await apiFetch("sentence-builder", {});
      setSentenceData(data);
      setCurrentSentence([]);
    } catch {
      setSentenceData(selectedLang === "Tamil" ? {
        words: ["நான்", "தினமும்", "புத்தகம்", "வாசிக்கிறேன்"], target: "நான் தினமும் புத்தகம் வாசிக்கிறேன்"
      } : { words: ["I", "love", "learning", "new", "languages"], target: "I love learning new languages" });
      setCurrentSentence([]);
    } finally {
      setSentenceLoading(false);
    }
  };

  // ─── Story Reading ────────────────────────────────────────────────────────────
  const [storyData, setStoryData] = useState<any>(null);
  const [storyLoading, setStoryLoading] = useState(false);
  const [isStoryRecording, setIsStoryRecording] = useState(false);
  const [storyReadingScore, setStoryReadingScore] = useState<any>(null);
  const [storyTranscript, setStoryTranscript] = useState("");
  const storyRecorderRef = useRef<MediaRecorder | null>(null);
  const storyRecognitionRef = useRef<any>(null);

  const loadStory = async () => {
    setStoryLoading(true);
    setStoryReadingScore(null);
    setStoryTranscript("");
    setIsStoryRecording(false);
    try {
      const data = await apiFetch("story", {});
      setStoryData(data);
    } catch {
      setStoryData(selectedLang === "Tamil" ? {
        title: "பகிர்ந்து கொண்ட பந்து",
        passage: "ஒரு நாள், அப்புவும் ராமுவும் சேர்ந்து விளையாடினார்கள். அப்புவிடம் ஒரு புதிய பந்து இருந்தது. ராமுவுக்கு அந்தப் பந்து விளையாட ஆசையாக இருந்தது. ஆனால் அப்பு முதலில் பந்தை கொடுக்கவில்லை. 'இது என் பந்து!' என்றான். ராமுவுக்கு வருத்தமாகிவிட்டது. பிறகு, ராமு தன் பொம்மையை எடுத்து விளையாடினான். அப்புவுக்கு பொம்மையுடன் விளையாட ஆசை வந்தது. ராமு உடனே பொம்மையைப் பகிர்ந்துகொண்டான். அப்புவுக்கு தன் தவறு புரிந்தது. அவனும் பந்தை ராமுவுடன் பகிர்ந்துகொண்டான். இருவரும் மகிழ்ச்சியாக விளையாடினார்கள். பகிர்ந்துகொள்வது மிகவும் நல்லது!",
        comprehensionQuestion: "அப்பு ஏன் ராமுவுடன் பந்தை பகிர்ந்து கொண்டான்?"
      } : {
        title: "The Thirsty Crow",
        passage: "Once a crow was very thirsty. It found a pot with very little water and used pebbles to raise it to drink. Smart thinking helped it survive!",
        comprehensionQuestion: "How did the crow get the water?"
      });
    } finally {
      setStoryLoading(false);
    }
  };

  const toggleStoryRecording = async () => {
    if (!storyData?.passage) return;
    if (isStoryRecording) {
      storyRecorderRef.current?.stop();
      storyRecognitionRef.current?.stop();
      setIsStoryRecording(false);
      setIsAnalyzing(true);
      setTimeout(async () => {
        try {
          if (!storyTranscript || storyTranscript.trim().length < 2) {
            setStoryReadingScore({
              accuracyScore: 0,
              wordDiffs: [],
              tip: selectedLang === "Tamil" ? "பேச்சு கண்டறியப்படவில்லை! கதையை உரக்கப் படியுங்கள்." : "No speech detected! Please speak clearly into the mic."
            });
            return;
          }
          const data = await apiFetch("pronunciation-check", {
            targetSentence: storyData.passage,
            transcript: storyTranscript
          });
          setStoryReadingScore(data);
          toggleComfortStep(1);
        } catch {
          const targetWords = storyData.passage.toLowerCase().replace(/[^a-z0-9\s]/gi, "").split(/\s+/);
          const spokenWords = storyTranscript.toLowerCase().replace(/[^a-z0-9\s]/gi, "").split(/\s+/);
          const wordDiffs = targetWords.slice(0, 30).map((w: string) => ({
            word: w,
            status: spokenWords.includes(w) ? "correct" : "missed"
          }));
          const correctCount = wordDiffs.filter((d: any) => d.status === "correct").length;
          const score = Math.round((correctCount / Math.max(wordDiffs.length, 1)) * 100);
          setStoryReadingScore({
            accuracyScore: score,
            wordDiffs: wordDiffs,
            tip: score > 60 ? (selectedLang === "Tamil" ? "சிறந்த கதை வாசிப்பு!" : "Great story reading!") : (selectedLang === "Tamil" ? "மெதுவாகவும் தெளிவாகவும் உரக்கப் படியுங்கள்." : "Read out loud slowly and clearly into the mic.")
          });
          toggleComfortStep(1);
        } finally {
          setIsAnalyzing(false);
          setStoryTranscript("");
          loadProgressStats();
        }
      }, 1000);
    } else {
      setStoryReadingScore(null);
      setStoryTranscript("");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        recorder.start();
        storyRecorderRef.current = recorder;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recog = new SpeechRecognition();
          recog.continuous = true;
          recog.lang = selectedLang === "Tamil" ? "ta-IN" : "en-US";
          recog.onresult = (e: any) => {
            const t = Array.from(e.results).map((r: any) => r[0].transcript).join(" ");
            setStoryTranscript(t);
          };
          recog.start();
          storyRecognitionRef.current = recog;
        }
        setIsStoryRecording(true);
      } catch {
        Swal.fire(selectedLang === "Tamil" ? "மைக் அனுமதி தேவை" : "Microphone Access Required", selectedLang === "Tamil" ? "வாசிப்பு பயிற்சி செய்ய மைக் அனுமதியை வழங்கவும்." : "Please grant microphone permissions to use Read Aloud.", "warning");
      }
    }
  };

  // ─── Roleplay ─────────────────────────────────────────────────────────────────
  const [roleplayData, setRoleplayData] = useState<any>(null);
  const [roleplayStep, setRoleplayStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [roleplayLoading, setRoleplayLoading] = useState(false);

  const loadRoleplay = async () => {
    setRoleplayLoading(true);
    try {
      const data = await apiFetch("roleplay", {});
      setRoleplayData(data);
      setRoleplayStep(0);
      setSelectedOption(null);
    } catch {
      setRoleplayData(selectedLang === "Tamil" ? {
        scenario: "பள்ளி உணவகத்தில் உணவு வாங்குதல்.",
        turns: [{ aiLine: "உணவக அண்ணன்: தம்பி இன்று என்ன வேண்டும்?", options: [{ text: "ஒரு சமோசாவும் சாறும் கொடுங்கள் அண்ணா.", quality: "strong", feedback: "மரியாதையான முழுமையான வாக்கியம்!" }, { text: "சமோசா.", quality: "weak", feedback: "மிகச் சிறிய பதில் — 'தயவுசெய்து' சேர்க்கலாம்!" }] }]
      } : { scenario: "Ordering food at the school canteen.", turns: [{ aiLine: "Canteen Uncle: What would you like today?", options: [{ text: "One samosa and a juice please.", quality: "strong", feedback: "Polite and complete!" }, { text: "Samosa.", quality: "weak", feedback: "Too short — add 'please'!" }] }] });
      setRoleplayStep(0);
      setSelectedOption(null);
    } finally {
      setRoleplayLoading(false);
    }
  };

  // ─── Debate Topic ─────────────────────────────────────────────────────────────
  const [debateData, setDebateData] = useState<any>(null);
  const [debateLoading, setDebateLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);

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
      setDebateData({ topic: selectedLang === "Tamil" ? "பள்ளி வீட்டுப்பாடங்கள் குறைக்கப்பட வேண்டுமா?" : "Should homework be reduced?", prepTimeSeconds: 60, speakTimeSeconds: 120, guidingPoints: selectedLang === "Tamil" ? ["மாணவர் நலன் குறித்துச் சிந்தியுங்கள்", "கற்றல் நிலையை யோசியுங்கள்", "மாற்று வழிகள் என்ன?"] : ["Consider student wellbeing", "Think about learning outcomes", "What alternatives exist?"] });
    } finally {
      setDebateLoading(false);
    }
  };

  // ─── Writing Prompt ───────────────────────────────────────────────────────────
  const [writingData, setWritingData] = useState<any>(null);
  const [writingLoading, setWritingLoading] = useState(false);
  const [writingText, setWritingText] = useState("");
  const [grammarFeedback, setGrammarFeedback] = useState<any>(null);
  const [checkingGrammar, setCheckingGrammar] = useState(false);

  const loadWritingPrompt = async () => {
    setWritingLoading(true);
    setWritingText("");
    setGrammarFeedback(null);
    try {
      const data = await apiFetch("writing-prompt", {});
      setWritingData(data);
    } catch {
      setWritingData({ prompt: selectedLang === "Tamil" ? "உங்கள் விருப்பமான பொழுதுபோக்கு பற்றி நண்பனுக்குக் கடிதம் எழுதுங்கள்." : "Write a short note to your best friend about your favourite hobby.", expectedLength: "5-7 sentences", rubricTips: selectedLang === "Tamil" ? ["வணக்கத்துடன் தொடங்குங்கள்", "பொழுதுபோக்கை விளக்குங்கள்", "ஏன் பிடிக்கும் என எழுதுங்கள்"] : ["Start with a greeting", "Describe your hobby clearly", "Explain why you enjoy it"] });
    } finally {
      setWritingLoading(false);
    }
  };

  const submitGrammarCheck = async () => {
    if (!writingText.trim()) return Swal.fire("Oops", selectedLang === "Tamil" ? "முதலில் சில வரிகளை எழுதுங்கள்!" : "Please write something first!", "warning");
    setCheckingGrammar(true);
    try {
      const data = await apiFetch("grammar-check", { text: writingText });
      setGrammarFeedback(data);
    } catch {
      setGrammarFeedback({ strengths: selectedLang === "Tamil" ? "நல்ல முயற்சி! உங்கள் கருத்து தெளிவாக உள்ளது." : "Great attempt! Your idea is clear.", corrections: [selectedLang === "Tamil" ? "வாக்கியத்தின் இறுதியில் முற்றுப்புள்ளி இடவும்." : "Check your punctuation at the end of each sentence."], suggestion: selectedLang === "Tamil" ? "மேலும் சில புதிய தமிழ் வார்த்தைகளைச் சேர்க்கவும்." : "Try adding more descriptive words to paint a picture.", score: 75 });
    } finally {
      setCheckingGrammar(false);
      loadProgressStats();
    }
  };

  // ─── Daily Challenge ─────────────────────────────────────────────────────────
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);
  const [tasksDone, setTasksDone] = useState<boolean[]>([]);
  const [dailyLoading, setDailyLoading] = useState(false);

  const loadDailyChallenge = async () => {
    setDailyLoading(true);
    try {
      const data = await apiFetch("daily-challenge");
      const tasks = data?.tasks || data || [];
      setDailyTasks(tasks);
      setTasksDone(new Array(tasks.length).fill(false));
    } catch {
      setDailyTasks(selectedLang === "Tamil" ? [
        { title: "3 வாக்கியங்கள் பேசுங்கள்", description: "இன்று செய்த 3 காரியங்களை தமிழில் கூறுங்கள்.", type: "speaking", xp: 20 },
        { title: "வார்த்தைக் கண்டுபிடிப்பு", description: "இன்று கதையில் 2 புதிய சொற்களைக் கண்டறியுங்கள்.", type: "vocab", xp: 15 },
        { title: "உரக்க வாசித்தல்", description: "பாடப்புத்தகத்தில் ஒரு பத்தியை உரக்க வாசியுங்கள்.", type: "reading", xp: 15 }
      ] : [
        { title: "Say 3 Sentences", description: "Tell someone 3 things you did today in English.", type: "speaking", xp: 20 },
        { title: "Word Detective", description: "Find 2 new English words in a storybook today.", type: "vocab", xp: 15 },
        { title: "Read Aloud", description: "Read one paragraph from your textbook out loud.", type: "reading", xp: 15 }
      ]);
      setTasksDone([false, false, false]);
    } finally {
      setDailyLoading(false);
    }
  };

  // ─── Word of the Day (sidebar) ────────────────────────────────────────────────
  const [wordOfDay, setWordOfDay] = useState<any>(null);
  const [wodLoading, setWodLoading] = useState(true);

  const loadWordOfDay = useCallback(async () => {
    if (!studentId) return;
    setWodLoading(true);
    try {
      const id = studentId || "demo";
      const res = await fetch(`${LC}/${id}/word-of-day?language=${selectedLang}`);
      const json = await res.json();
      if (json.success) setWordOfDay(json.data);
    } catch {
      if (selectedLang === "Tamil") {
        setWordOfDay({
          word: "மரியாதை",
          tamilTranslation: "Respect",
          meaning: "மற்றவர்களை மதிப்பளித்து அன்புடனும் மரியாதையுடனும் நடத்துவது.",
          example: "பெரியவர்களுக்கும் நண்பர்களுக்கும் மரியாதை செலுத்துவது நற்பண்பாகும்."
        });
      } else {
        setWordOfDay({
          word: "Respect",
          tamilTranslation: "மரியாதை",
          meaning: "When you think someone or something is important and special, and you treat them with care.",
          example: "It's good to show respect to your elders and friends by listening to them."
        });
      }
    }
    finally { setWodLoading(false); }
  }, [studentId, selectedLang, LC]);


  useEffect(() => { loadWordOfDay(); }, [loadWordOfDay]);

  // ─── Modal Open Handler ───────────────────────────────────────────────────────
  const openModal = (name: string) => {
    stopAudio();
    setSpeakingScore(null); setIsRecording(false); setIsAnalyzing(false); setTranscript("");
    setVocabCards([]); setCurrentSentence([]);
    setStoryData(null); setRoleplayData(null); setDebateData(null);
    setWritingData(null); setWritingText(""); setGrammarFeedback(null);
    setDailyTasks([]); setSelectedOption(null);
    setTimerRunning(false);
    setActiveModal(name);

    if (name === "Vocab Builder") loadVocab();
    if (name === "Sentence Builder") loadSentence();
    if (name === "Story Reading") loadStory();
    if (name === "Real-Life Convo" || name === "Role Play") loadRoleplay();
    if (name === "Public Speaking" || name === "Debate Practice") loadDebate();
    if (name === "Writing Practice" || name === "Grammar Games") loadWritingPrompt();
    if (name === "Daily Challenge") loadDailyChallenge();
  };

  const closeModal = () => {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
    setIsRecording(false); setTimerRunning(false);
    stopAudio();
    setActiveModal(null);
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════════
  return (
    <PortalLayout title={t.hubTitle} subtitle={`AI-Powered · ${t.langPractice}: ${selectedLang}`}>
      <div className="flex flex-col gap-8 text-left max-w-7xl mx-auto w-full">

        {/* Hero Header Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 p-6 md:p-8 shadow-2xl text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.12),transparent)]" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="bg-white/20 text-white font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md inline-block">
                {t.deptBanner}
              </span>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
                {t.hubTitle}
              </h1>
              <p className="text-indigo-100 text-xs md:text-sm font-medium leading-relaxed">
                {t.hubSubtitle}
              </p>
            </div>
            {!tierLoading && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 sm:p-5 rounded-2xl flex flex-col items-center text-center shadow-lg shrink-0 w-full md:w-52 transition-all hover:scale-[1.02]">
                <span className="bg-emerald-400 text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest mb-1.5 shadow-sm">
                  {TIER_LABELS[gradeTier].label}
                </span>
                <h4 className="font-extrabold text-sm text-white">{TIER_LABELS[gradeTier].badge}</h4>
                <p className="text-[10px] text-indigo-200 mt-1 max-w-[180px] leading-relaxed">
                  {TIER_LABELS[gradeTier].desc}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 1. Audio Control Bar & Language Selector Header */}
        <section className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
          {/* Language Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Languages className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">{t.langPractice}</h2>
            </div>
            <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-xl flex gap-1 border border-slate-200 dark:border-slate-800">
              {(["Tamil", "English"] as Lang[]).map(lang => (
                <button key={lang} onClick={() => { setSelectedLang(lang); setWordOfDay(null); }}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${selectedLang === lang ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}>
                  {lang === "Tamil" ? "தமிழ் (Tamil)" : "English"}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Controls Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            {/* Speed / Rate Toggle */}
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{t.audioSpeed}:</span>
              <div className="flex gap-1">
                {[
                  { rate: 0.75, label: "0.75x Slow 🌸" },
                  { rate: 1.0, label: "1.0x Normal" },
                  { rate: 1.25, label: "1.25x Fast" },
                ].map((item) => (
                  <button key={item.rate} onClick={() => setSpeechRate(item.rate)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${speechRate === item.rate ? "bg-indigo-600 text-white shadow-xs" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
              <button onClick={() => setAudioVolume(v => (v > 0 ? 0 : 1.0))} className="text-slate-500 hover:text-indigo-600 dark:text-slate-400">
                {audioVolume === 0 ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
              </button>
              <input type="range" min="0" max="1" step="0.1" value={audioVolume} onChange={e => setAudioVolume(parseFloat(e.target.value))}
                className="w-16 sm:w-20 accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg" title={`Volume: ${Math.round(audioVolume * 100)}%`} />
            </div>

            {/* Test Audio & Active Waveform */}
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
              <AudioEqualizerWave active={isPlayingAudio || isRecording} color={isPlayingAudio ? "bg-emerald-500" : "bg-rose-500"} />
              {isPlayingAudio ? (
                <button onClick={stopAudio} className="bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Square className="w-3 h-3 fill-current" /> {t.stopAudio}
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button onClick={() => speakWord(selectedLang === "Tamil" ? "வணக்கம்! தெளிவான தமிழ் ஒலி கேட்கிறதா?" : "Hello! Testing audio clarity.")}
                    className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors">
                    <Volume2 className="w-3 h-3" /> {t.testAudio}
                  </button>
                  <button onClick={() => {
                    Swal.fire({
                      title: "✨ How to get 100% Real Natural Tamil Voice",
                      html: `
                        <div style="text-align:left; font-size:13px; line-height:1.6; color:#334155;">
                          <p style="margin-bottom:10px;">To hear <strong>100% real human-like Tamil speech</strong> instead of robotic browser voices:</p>
                          <ol style="margin-left:20px; margin-bottom:10px;">
                            <li style="margin-bottom:6px;"><strong>Use Microsoft Edge or Google Chrome:</strong> Both browsers include free Natural Cloud Voices (like <em>Microsoft Valluvar Natural</em> or <em>Google தமிழ்</em>).</li>
                            <li style="margin-bottom:6px;"><strong>Windows Settings:</strong> Open Windows <code>Settings &rarr; Time & Language &rarr; Speech &rarr; Add Voices &rarr; Install Tamil (India)</code>.</li>
                            <li><strong>Online Connection:</strong> Keep your device connected to the internet so high-definition Neural voices activate automatically!</li>
                          </ol>
                        </div>
                      `,
                      icon: "info",
                      confirmButtonText: "Got it! 🎧",
                      confirmButtonColor: "#4f46e5"
                    });
                  }} className="bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-[10px] font-extrabold px-2 py-1 rounded-lg flex items-center gap-1 transition-colors">
                    <Sparkles className="w-3 h-3 text-amber-500" /> HD Voice Guide
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 2. Daily Comfort Plan ("Daily Comfort Path") */}
        <section className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 p-6 sm:p-8 rounded-3xl border-2 border-indigo-200 dark:border-indigo-900 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-indigo-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                <Heart className="w-3 h-3 text-rose-300 fill-current" /> Comfort Learning Plan
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                {t.comfortPlanTitle}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {t.comfortPlanSub}
              </p>
            </div>

            {/* Comfort Pace Switcher */}
            <div className="bg-white dark:bg-slate-950 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200 dark:border-slate-800 shadow-xs self-stretch sm:self-auto justify-center">
              <button onClick={() => setComfortMode("relaxed")}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${comfortMode === "relaxed" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`}>
                <Smile className="w-4 h-4" /> {t.relaxedPace}
              </button>
              <button onClick={() => setComfortMode("standard")}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${comfortMode === "standard" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`}>
                <Zap className="w-4 h-4" /> {t.standardPace}
              </button>
            </div>
          </div>

          {/* 4 Step Comfort Roadmap Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-4 ${comfortStepsDone[0] ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">Step 1 • 2 mins</span>
                  <button onClick={() => toggleComfortStep(0)} className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${comfortStepsDone[0] ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 text-transparent hover:border-indigo-400"}`}>
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">{t.step1Title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.step1Desc}</p>
              </div>
              <button onClick={() => {
                if (wordOfDay?.word) speakWord(`${wordOfDay.word}. ${wordOfDay.meaning}`, 0.75);
                else speakWord(selectedLang === "Tamil" ? "வணக்கம், இன்றைய தமிழ் வார்த்தையைக் கேட்கவும்." : "Welcome to today's audio warmup lesson.", 0.75);
                toggleComfortStep(0);
              }} className="bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                <Volume2 className="w-4 h-4" /> {t.listenAudio}
              </button>
            </div>

            {/* Step 2 */}
            <div className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-4 ${comfortStepsDone[1] ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-md">Step 2 • 3 mins</span>
                  <button onClick={() => toggleComfortStep(1)} className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${comfortStepsDone[1] ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 text-transparent hover:border-indigo-400"}`}>
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">{t.step2Title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.step2Desc}</p>
              </div>
              <button onClick={() => openModal("Story Reading")} className="bg-purple-50 dark:bg-purple-950 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                <BookOpen className="w-4 h-4" /> {t.readPassage}
              </button>
            </div>

            {/* Step 3 */}
            <div className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-4 ${comfortStepsDone[2] ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-md">Step 3 • 3 mins</span>
                  <button onClick={() => toggleComfortStep(2)} className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${comfortStepsDone[2] ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 text-transparent hover:border-indigo-400"}`}>
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">{t.step3Title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.step3Desc}</p>
              </div>
              <button onClick={() => openModal("AI Speaking Coach")} className="bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                <Mic className="w-4 h-4" /> {t.speakMic}
              </button>
            </div>

            {/* Step 4 */}
            <div className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-4 ${comfortStepsDone[3] ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-md">Step 4 • 2 mins</span>
                  <button onClick={() => toggleComfortStep(3)} className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${comfortStepsDone[3] ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 text-transparent hover:border-indigo-400"}`}>
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">{t.step4Title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.step4Desc}</p>
              </div>
              <button onClick={() => openModal("Language Games")} className="bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 text-amber-700 dark:text-amber-300 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                <Gamepad2 className="w-4 h-4" /> {t.playPuzzle}
              </button>
            </div>
          </div>

          {/* Progress Goal Banner */}
          {comfortStepsDone.every(Boolean) && (
            <div className="mt-5 p-4 bg-emerald-500 text-white rounded-2xl flex items-center justify-between animate-bounce">
              <div className="flex items-center gap-3">
                <Trophy className="w-7 h-7 text-amber-300" />
                <div>
                  <h4 className="font-black text-sm">🎉 Daily Comfort Path Complete!</h4>
                  <p className="text-xs text-emerald-100">You earned +100 XP today. Great consistency!</p>
                </div>
              </div>
              <span className="bg-white text-emerald-700 text-xs font-black px-3 py-1.5 rounded-xl shadow-xs">
                100% Goal
              </span>
            </div>
          )}
        </section>

        {/* 3. Today's Quick Practice */}
        <section>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-emerald-500" /> {t.skillModules}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PracticeCard icon={<Mic />} title={selectedLang === "Tamil" ? "பேச்சுப் பயிற்சி" : "Speaking"} color="rose" onClick={() => openModal("AI Speaking Coach")} />
            <PracticeCard icon={<BookOpen />} title={selectedLang === "Tamil" ? "வாசிப்புப் பயிற்சி" : "Reading"} color="blue" onClick={() => openModal("Story Reading")} />
            <PracticeCard icon={<Headphones />} title={selectedLang === "Tamil" ? "கேட்கும் பயிற்சி" : "Listening"} color="amber" onClick={() => openModal("Listening Ex.")} />
            <PracticeCard icon={<PenTool />} title={selectedLang === "Tamil" ? "எழுத்துப் பயிற்சி" : "Writing"} color="emerald" onClick={() => openModal("Writing Practice")} />
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          <div className="xl:col-span-2 space-y-8">

            {/* 4. AI Communication Lab */}
            <section>
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-2xl">
                      <BrainCircuit className="w-6 h-6" />
                    </div>
                    {t.aiLab}
                  </h2>
                  {!tierLoading && (
                    <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Word of the Day */}
            <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{t.wodTitle}</span>
                <button onClick={loadWordOfDay} className="text-slate-400 hover:text-indigo-500 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              {wodLoading ? (
                <div className="flex items-center gap-3 text-slate-400 py-6"><Loader2 className="w-5 h-5 animate-spin" /> Loading word…</div>
              ) : wordOfDay ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-none">{wordOfDay.word}</h3>
                    {wordOfDay.tamilTranslation && <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1">{wordOfDay.tamilTranslation}</p>}
                  </div>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-1">{wordOfDay.meaning}</p>
                    <p className="text-xs italic text-slate-400 leading-relaxed">&quot;{wordOfDay.example}&quot;</p>
                  </div>
                  <button onClick={() => {
                    const textToSpeak = selectedLang === "Tamil"
                      ? `${wordOfDay.word}. ${wordOfDay.meaning}. ${wordOfDay.example || ''}`
                      : `${wordOfDay.word}. ${wordOfDay.meaning}`;
                    speakWord(textToSpeak);
                  }} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 font-bold text-xs transition-all flex items-center gap-2 shadow-xs">
                    <Volume2 className="w-4 h-4" /> {t.listenAudio}
                  </button>

                </div>
              ) : (
                <p className="text-slate-400 text-xs">Could not load word. <button onClick={loadWordOfDay} className="text-indigo-500 underline">Retry</button></p>
              )}
            </section>

            {/* AI Chatbot */}
            <section className="h-[500px] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{t.aiTutor}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Online</span>
                    </div>
                  </div>
                </div>
                <AudioEqualizerWave active={isPlayingAudio} color="bg-indigo-500" />
              </div>
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/30">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${msg.role === "user" ? "bg-indigo-600 text-white rounded-br-none shadow-sm" : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-xs"}`}>
                      {msg.content}
                      {msg.role === "ai" && (
                        <button onClick={() => speakWord(msg.content)} className="mt-2 text-[10px] text-indigo-500 hover:text-indigo-600 font-bold flex items-center gap-1">
                          <Volume2 className="w-3 h-3" /> {t.listenAudio}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start animate-pulse">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl rounded-bl-none flex items-center gap-2 text-slate-400 text-xs">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> AI Tutor is thinking…
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <form onSubmit={handleChat} className="flex gap-2">
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message to practice…"
                    className="flex-1 bg-slate-100 dark:bg-slate-950 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white border-none" />
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl shadow-sm transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ─── MODALS ─────────────────────────────────────────────────────────────── */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl p-6 sm:p-8 border-2 border-indigo-500 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={closeModal} className="absolute top-5 right-5 text-slate-400 hover:text-rose-500 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-amber-500" /> {MODAL_TITLES[selectedLang][activeModal] || activeModal}
            </h3>
            <div className="w-full h-px bg-slate-200 dark:bg-slate-800 mb-6" />

            {/* ── AI Speaking Coach ── */}
            {activeModal === "AI Speaking Coach" && (
              <div className="flex flex-col items-center py-4 text-center gap-6">
                {/* Mode Selector */}
                <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-xl flex gap-1 border border-slate-200 dark:border-slate-800 w-full">
                  <button onClick={() => setSpeakingMode("mic")}
                    className={`flex-1 py-2 rounded-lg font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${speakingMode === "mic" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`}>
                    <Mic className="w-4 h-4" /> {t.micMode}
                  </button>
                  <button onClick={() => setSpeakingMode("type")}
                    className={`flex-1 py-2 rounded-lg font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${speakingMode === "type" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"}`}>
                    <PenTool className="w-4 h-4" /> {t.typeMode}
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 w-full">
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-2">
                    {speakingMode === "mic" ? t.readSentenceAloud : t.typeSentencePrompt}
                  </p>
                  <p className="text-lg font-black text-slate-800 dark:text-white leading-relaxed">&ldquo;{PRACTICE_SENTENCES[selectedLang][speakingIndex] || PRACTICE_SENTENCES[selectedLang][0]}&rdquo;</p>
                  
                  {/* Audio narration button */}
                  <button onClick={() => speakWord(PRACTICE_SENTENCES[selectedLang][speakingIndex] || PRACTICE_SENTENCES[selectedLang][0])}
                    className="mt-4 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 hover:bg-indigo-200 transition-colors">
                    <Volume2 className="w-4 h-4" /> {t.listenAudio}
                  </button>
                </div>

                {speakingMode === "mic" ? (
                  <div className="flex flex-col items-center gap-3">
                    <AudioEqualizerWave active={isRecording || isPlayingAudio} color={isRecording ? "bg-rose-500" : "bg-indigo-500"} />
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
                        }} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold px-5 py-3 rounded-full flex items-center gap-2 self-center transition-all text-xs border border-slate-200 dark:border-slate-700">
                          <RefreshCw className="w-4 h-4" /> {t.nextSentence}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Type & Listen Fallback Mode */
                  <div className="flex flex-col gap-4 w-full">
                    <input type="text" value={typedInput} onChange={e => setTypedInput(e.target.value)}
                      placeholder={selectedLang === "Tamil" ? "கற்றலைச் சோதிக்க மேலே உள்ள வாக்கியத்தை தட்டச்சு செய்யவும்…" : "Type the sentence above to test your learning…"}
                      className="w-full bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white" />
                    <div className="flex gap-3">
                      <button onClick={() => {
                        const target = PRACTICE_SENTENCES[selectedLang][speakingIndex] || PRACTICE_SENTENCES[selectedLang][0];
                        speakWord(target);
                        const targetWords = target.toLowerCase().replace(/[^a-z0-9\s]/gi, "").split(/\s+/);
                        const spokenWords = typedInput.toLowerCase().replace(/[^a-z0-9\s]/gi, "").split(/\s+/);
                        const wordDiffs = targetWords.map((w: string) => ({
                          word: w,
                          status: spokenWords.includes(w) ? "correct" : "missed"
                        }));
                        const correctCount = wordDiffs.filter((d: any) => d.status === "correct").length;
                        const score = Math.round((correctCount / Math.max(targetWords.length, 1)) * 100);
                        setSpeakingScore({
                          accuracyScore: score,
                          wordDiffs: wordDiffs,
                          tip: score > 70 ? (selectedLang === "Tamil" ? "சிறந்த பயிற்சி! தெளிவான உச்சரிப்பை மீண்டும் ஒருமுறை கேளுங்கள்." : "Great job practicing! Listen carefully to the audio pronunciation.") : (selectedLang === "Tamil" ? "வாக்கிய அமைப்பை மேலும் பயிற்சி செய்யுங்கள்!" : "Keep practicing the sentence structure!")
                        });
                        toggleComfortStep(2);
                      }} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" /> {selectedLang === "Tamil" ? "மதிப்பீடு & ஒலி கேட்க" : "Grade & Listen Audio"}
                      </button>
                      <button onClick={() => {
                        setSpeakingIndex(prev => (prev + 1) % (PRACTICE_SENTENCES[selectedLang]?.length || 1));
                        setSpeakingScore(null);
                        setTypedInput("");
                      }} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold px-4 py-3 rounded-xl text-xs transition-colors">
                        <RefreshCw className="w-4 h-4" /> {t.nextSentence}
                      </button>
                    </div>
                  </div>
                )}


                {isRecording && <p className="text-rose-500 font-bold animate-pulse text-xs">Microphone Recording… Click button to stop & grade.</p>}
                {transcript && isRecording && <p className="text-xs text-slate-500 italic max-w-sm">&ldquo;{transcript}&rdquo;</p>}
                {isAnalyzing && <div className="flex flex-col items-center gap-2"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /><p className="text-indigo-500 font-bold text-xs">Analysing pronunciation…</p></div>}
                
                {speakingScore && (
                  <div className="w-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-5 rounded-2xl text-left">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xl font-black text-emerald-700 dark:text-emerald-400">{speakingScore.accuracyScore}% Accuracy</h4>
                      <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">+50 XP</span>
                    </div>
                    {speakingScore.wordDiffs?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {speakingScore.wordDiffs.map((d: any, i: number) => (
                          <span key={i} className={`px-2.5 py-1 rounded-xl text-xs font-bold ${d.status === "correct" ? "bg-emerald-100 text-emerald-800" : d.status === "missed" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>
                            {d.word} {d.status === "correct" ? "✓" : d.status === "missed" ? "✗" : "~"}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">💡 {speakingScore.tip}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Vocab Builder ── */}
            {activeModal === "Vocab Builder" && (
              <div className="flex flex-col items-center gap-6">
                {vocabLoading ? <LoadingSpinner label={selectedLang === "Tamil" ? "AI அட்டைப் பயிற்சி உருவாக்கப்படுகிறது…" : "Generating AI flashcards…"} /> : vocabCards.length > 0 ? (
                  <>
                    <div onClick={() => setShowMeaning(!showMeaning)}
                      className="w-full max-w-md h-64 cursor-pointer bg-white dark:bg-slate-900 rounded-3xl flex flex-col items-center justify-center border-2 border-indigo-500 shadow-xl p-8 text-center relative overflow-hidden transition-all duration-300 hover:scale-[1.02]">
                      {showMeaning ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                          <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full">
                            {t.meaningAndExample}
                          </span>
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-relaxed">{cleanUnicodeText(vocabCards[vocabIndex]?.meaning)}</h3>
                          <p className="text-xs italic text-indigo-600 dark:text-indigo-300 font-medium max-w-[300px]">&quot;{cleanUnicodeText(vocabCards[vocabIndex]?.sentence)}&quot;</p>
                          <span className="absolute bottom-4 text-[10px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1">
                            {t.tapToSeeWord} <RefreshCw className="w-3 h-3 text-indigo-500" />
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full space-y-3">
                          <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-3 py-1 rounded-full">
                            {selectedLang === "Tamil" ? "அட்டை" : "Flashcard"} {vocabIndex + 1}/{vocabCards.length}
                          </span>
                          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{cleanUnicodeText(vocabCards[vocabIndex]?.word)}</h2>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                            {t.tapToReveal} <Sparkles className="w-3 h-3 text-indigo-500" />
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => speakWord(`${vocabCards[vocabIndex]?.word}. ${vocabCards[vocabIndex]?.meaning}`)} className="bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-100 transition-colors text-xs">
                        <Volume2 className="w-4 h-4" /> {t.listenAudio}
                      </button>
                      <button onClick={() => { setShowMeaning(false); setVocabIndex(p => (p + 1) % vocabCards.length); }} className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors text-xs">
                        {t.nextWord} <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 font-bold">{vocabIndex + 1} / {vocabCards.length}</p>
                  </>
                ) : <p className="text-slate-400 text-xs">{selectedLang === "Tamil" ? "அட்டைகளை ஏற்றுவதில் தோல்வி." : "Could not load flashcards."} <button onClick={loadVocab} className="text-indigo-600 underline">{selectedLang === "Tamil" ? "மீண்டும் முயல்" : "Retry"}</button></p>}
              </div>
            )}

            {/* ── Sentence Builder ── */}
            {activeModal === "Sentence Builder" && (
              <div className="flex flex-col gap-5">
                {sentenceLoading ? <LoadingSpinner label={selectedLang === "Tamil" ? "AI வாக்கியப் புதிர் உருவாக்கப்படுகிறது…" : "Building AI sentence puzzle…"} /> : sentenceData ? (
                  <>
                    <div className="w-full bg-slate-50 dark:bg-slate-950 min-h-20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center p-4 gap-2 flex-wrap">
                      {currentSentence.length === 0 ? <p className="text-slate-400 text-xs">{selectedLang === "Tamil" ? "கீழே உள்ள வார்த்தைகளை வரிசையாகத் தொட்டு வாக்கியத்தை அமைக்கவும்…" : "Tap the scrambled words below to build the sentence in order…"}</p> : currentSentence.map((w, i) => <span key={i} className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs">{w}</span>)}
                    </div>
                    <div className="flex gap-2 flex-wrap justify-center my-2">
                      {sentenceData.words.map((word: string, i: number) => (
                        <button key={i} onClick={() => setCurrentSentence([...currentSentence, word])} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-black shadow-xs hover:border-indigo-500 text-slate-700 dark:text-slate-200 text-xs transition-colors">{word}</button>
                      ))}
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button onClick={() => setCurrentSentence([])} className="bg-rose-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-rose-600 transition-colors">{t.clear}</button>
                      <button onClick={() => {
                        const built = currentSentence.join(" ");
                        const cleanForCompare = (s: string) => {
                          if (!s) return "";
                          return s
                            .replace(/[\uFFFD\uFEFF\u200B\u200C\u200D\u00AD]/g, "") // remove special characters
                            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "")         // remove punctuation
                            .replace(/\s+/g, " ")                                 // normalize spaces
                            .trim()
                            .toLowerCase();
                        };
                        
                        if (cleanForCompare(built) === cleanForCompare(sentenceData.target)) {
                          speakWord(built);
                          Swal.fire(selectedLang === "Tamil" ? "சரி! 🎉" : "Correct! 🎉", selectedLang === "Tamil" ? "சிறந்த வாக்கிய அமைப்பு! +15 XP" : "Perfect sentence! +15 XP", "success");
                        } else {
                          Swal.fire(selectedLang === "Tamil" ? "தவறு!" : "Oops!", selectedLang === "Tamil" ? "மீண்டும் முயற்சி செய்யுங்கள்." : "Not quite right. Try again.", "error");
                        }
                      }} className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-600 transition-colors">{t.check}</button>

                      <button onClick={loadSentence} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200 transition-colors"><RefreshCw className="w-3.5 h-3.5" /> {selectedLang === "Tamil" ? "புதிய புதிர்" : "New"}</button>
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
                    <div className="bg-amber-50/60 dark:bg-amber-950/30 p-6 rounded-2xl border border-amber-200 dark:border-amber-800">
                      <h4 className="font-black text-lg mb-3 text-amber-900 dark:text-amber-300">{storyData.title}</h4>
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 font-medium">{storyData.passage}</p>
                    </div>
                    {storyData.comprehensionQuestion && (
                      <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                        <p className="text-xs font-bold text-blue-800 dark:text-blue-300 flex gap-1.5">
                          <span>📝 {t.question}:</span> {storyData.comprehensionQuestion}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 items-center justify-between">
                      <div className="flex gap-2 items-center flex-wrap">
                        {/* Multi-state Audio Controller (Listen / Pause / Resume / Stop) */}
                        {audioState === "stopped" && (
                          <button onClick={() => speakWord(storyData.passage, 0.75)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors text-xs shadow-xs">
                            <Volume2 className="w-4 h-4" /> {t.listenAudio}
                          </button>
                        )}
                        {audioState === "playing" && (
                          <>
                            <button onClick={pauseAudio} className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors text-xs shadow-xs">
                              <Pause className="w-4 h-4" /> {t.pauseAudio}
                            </button>
                            <button onClick={stopAudio} className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors text-xs shadow-xs">
                              <Square className="w-4 h-4 fill-current" /> {t.stop}
                            </button>
                          </>
                        )}
                        {audioState === "paused" && (
                          <>
                            <button onClick={resumeAudio} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors text-xs shadow-xs">
                              <Play className="w-4 h-4 fill-current" /> {t.resumeAudio}
                            </button>
                            <button onClick={stopAudio} className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors text-xs shadow-xs">
                              <Square className="w-4 h-4 fill-current" /> {t.stop}
                            </button>
                          </>
                        )}

                        <button onClick={toggleStoryRecording} className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all text-white ${isStoryRecording ? "bg-rose-500 animate-pulse" : "bg-indigo-600 hover:bg-indigo-700 shadow-xs"}`}>
                          <Mic className="w-4 h-4" /> {isStoryRecording ? "Stop & Grade Speech" : t.readAloudMic}
                        </button>
                      </div>

                      <button onClick={loadStory} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 text-xs hover:bg-slate-200 transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" /> {t.nextStory}
                      </button>
                    </div>

                    {isStoryRecording && (
                      <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-center animate-pulse">
                        <p className="text-xs font-bold text-rose-600 dark:text-rose-400">🎙️ Recording passage reading... Speak clearly into microphone!</p>
                        {storyTranscript && <p className="text-xs italic text-slate-500 mt-2">&ldquo;{storyTranscript}&rdquo;</p>}
                      </div>
                    )}

                    {storyReadingScore && (
                      <div className="w-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-5 rounded-2xl text-left space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xl font-black text-emerald-700 dark:text-emerald-400">{storyReadingScore.accuracyScore}% Reading Accuracy</h4>
                          <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">+25 XP</span>
                        </div>
                        {storyReadingScore.wordDiffs?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
                            {storyReadingScore.wordDiffs.map((d: any, i: number) => (
                              <span key={i} className={`px-2 py-0.5 rounded text-[11px] font-bold ${d.status === "correct" ? "bg-emerald-200 text-emerald-900" : "bg-rose-200 text-rose-900"}`}>
                                {d.word} {d.status === "correct" ? "✓" : "✗"}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">💡 {storyReadingScore.tip}</p>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            )}

            {/* ── Roleplay / Real-Life Convo ── */}
            {(activeModal === "Real-Life Convo" || activeModal === "Role Play") && (
              <div className="flex flex-col gap-5">
                {roleplayLoading ? <LoadingSpinner label={selectedLang === "Tamil" ? "உரையாடல் சூழல் உருவாக்கப்படுகிறது…" : "Setting up your roleplay scenario…"} /> : roleplayData ? (
                  <>
                    <div className="bg-indigo-50 dark:bg-indigo-950/40 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                      <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">{t.scenarioDesc}</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{roleplayData.scenario}</p>
                    </div>
                    {roleplayData.turns?.slice(0, roleplayStep + 1).map((turn: any, ti: number) => (
                      <div key={ti} className="flex flex-col gap-3">
                        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{turn.aiLine}</p>
                          <button onClick={() => speakWord(turn.aiLine)} className="text-indigo-600 hover:text-indigo-700 p-1">
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                        {ti === roleplayStep && !selectedOption && turn.options?.map((opt: any, oi: number) => (
                          <button key={oi} onClick={() => { setSelectedOption(opt); if (roleplayStep + 1 < roleplayData.turns.length) setTimeout(() => { setRoleplayStep(s => s + 1); setSelectedOption(null); }, 1500); }}
                            className="p-4 rounded-xl text-left border transition-all border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-indigo-500 hover:bg-indigo-50/50">
                            <p className="font-bold text-xs text-slate-700 dark:text-slate-300">{opt.text}</p>
                          </button>
                        ))}
                        {selectedOption && ti === roleplayStep && (
                          <div className={`p-4 rounded-xl border-2 ${selectedOption.quality === "strong" ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"}`}>
                            <p className="font-bold text-xs">{selectedOption.quality === "strong" ? (selectedLang === "Tamil" ? "✅ சிறந்த தேர்வு!" : "✅ Strong Choice!") : (selectedLang === "Tamil" ? "⚠️ சாதாரண தேர்வு" : "⚠️ Weaker Choice")} — {selectedOption.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                    {roleplayStep >= (roleplayData.turns?.length || 1) - 1 && selectedOption && (
                      <div className="text-center font-black text-emerald-500 text-base my-2">{selectedLang === "Tamil" ? "🎉 உரையாடல் பயிற்சி நிறைவு பெற்றது! +25 XP" : "🎉 Roleplay Complete! +25 XP"}</div>
                    )}
                    <button onClick={loadRoleplay} className="self-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-200 transition-colors"><RefreshCw className="w-4 h-4" /> {selectedLang === "Tamil" ? "மீண்டும் தொடங்கு" : "Reset Scenario"}</button>
                  </>
                ) : null}
              </div>
            )}

            {/* ── Public Speaking / Debate ── */}
            {(activeModal === "Public Speaking" || activeModal === "Debate Practice") && (
              <div className="flex flex-col gap-5">
                {debateLoading ? <LoadingSpinner label={selectedLang === "Tamil" ? "பட்டிமன்றத் தலைப்பு உருவாக்கப்படுகிறது…" : "Generating debate topic…"} /> : debateData ? (
                  <>
                    <div className="bg-rose-50 dark:bg-rose-950/40 p-6 rounded-3xl border border-rose-200 dark:border-rose-800 text-center">
                      <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">{selectedLang === "Tamil" ? "பட்டிமன்றத் தலைப்பு" : "Debate Topic"}</p>
                      <h4 className="text-lg font-black mt-2 text-slate-900 dark:text-white leading-relaxed">{debateData.topic}</h4>
                    </div>
                    {debateData.guidingPoints?.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t.guidingPoints}</p>
                        <div className="space-y-1.5">
                          {debateData.guidingPoints.map((pt: string, i: number) => <p key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2"><ChevronRight className="w-4 h-4 text-indigo-400" /> {pt}</p>)}
                        </div>
                      </div>
                    )}
                    <div className="text-5xl font-black font-mono text-slate-800 dark:text-white flex items-center justify-center gap-4 py-2">
                      <Clock className="w-8 h-8 text-rose-500" /> 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button onClick={() => setTimerRunning(!timerRunning)} className={`${timerRunning ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600"} text-white font-bold px-8 py-3 rounded-2xl shadow-md transition-colors text-xs`}>
                        {timerRunning ? t.pauseTimer : t.startSpeaking}
                      </button>
                      <button onClick={() => { setTimeLeft(debateData.speakTimeSeconds || 60); setTimerRunning(false); }} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-5 py-3 rounded-2xl hover:bg-slate-200 transition-colors text-xs"><RefreshCw className="w-4 h-4" /></button>
                    </div>
                    <button onClick={loadDebate} className="self-center bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold px-4 py-2 rounded-xl">{t.newTopic}</button>
                  </>
                ) : null}
              </div>
            )}

            {/* ── Listening Exercise ── */}
            {activeModal === "Listening Ex." && (
              <div className="flex flex-col items-center text-center py-6 gap-6">
                <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 w-full">
                  <p className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">{selectedLang === "Tamil" ? "கவனமாகக் கேட்டு இந்த வாக்கியத்தைத் திரும்பச் சொல்லுங்கள்:" : "Listen carefully and repeat this phrase:"}</p>
                  <p className="text-lg font-black text-slate-800 dark:text-white leading-relaxed">&ldquo;{PRACTICE_SENTENCES[selectedLang][speakingIndex] || PRACTICE_SENTENCES[selectedLang][0]}&rdquo;</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <AudioEqualizerWave active={isPlayingAudio} color="bg-blue-500" />
                  <div className="flex gap-4">
                    <button onClick={() => speakWord(PRACTICE_SENTENCES[selectedLang][speakingIndex] || PRACTICE_SENTENCES[selectedLang][0])} className="w-20 h-20 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-xl transition-all hover:scale-105">
                      <Volume2 className="w-10 h-10" />
                    </button>
                    <button onClick={() => {
                      setSpeakingIndex(prev => (prev + 1) % (PRACTICE_SENTENCES[selectedLang]?.length || 1));
                    }} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold px-6 py-4 rounded-full flex items-center gap-2 self-center transition-all shadow-md text-xs border border-slate-200 dark:border-slate-700">
                      <RefreshCw className="w-4 h-4" /> {t.nextSentence}
                    </button>
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-400">{selectedLang === "Tamil" ? "ஒலியைக் கேட்க ஸ்பீக்கர் குறியீட்டைக் கிளிக் செய்யவும்." : "Click speaker icon to listen to audio."}</p>
              </div>
            )}

            {/* ── Grammar Games / Writing Practice ── */}
            {(activeModal === "Grammar Games" || activeModal === "Writing Practice") && (
              <div className="flex flex-col gap-5">
                {writingLoading ? <LoadingSpinner label={selectedLang === "Tamil" ? "எழுத்துப் பயிற்சி தலைப்பு உருவாக்கப்படுகிறது…" : "Generating writing prompt…"} /> : writingData ? (
                  <>
                    <div className="bg-amber-50 dark:bg-amber-950/40 p-5 rounded-2xl border border-amber-200 dark:border-amber-800">
                      <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">{t.writingPrompt}</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">{writingData.prompt}</p>
                      <p className="text-[10px] text-slate-400 mt-2 font-bold">{t.targetLength}: {writingData.expectedLength}</p>
                    </div>
                    {writingData.rubricTips?.length > 0 && (
                      <div className="flex flex-wrap gap-2.5 my-1">
                        {writingData.rubricTips.map((tip: string, i: number) => <p key={i} className="text-[11px] text-slate-500 flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {tip}</p>)}
                      </div>
                    )}
                    <textarea value={writingText} onChange={e => setWritingText(e.target.value)}
                      className="w-full h-36 bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-slate-800 dark:text-white"
                      placeholder={selectedLang === "Tamil" ? "இங்கே எழுதத் தொடங்குங்கள்…" : "Start writing here…"} />
                    <div className="flex gap-3">
                      <button onClick={submitGrammarCheck} disabled={checkingGrammar}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors text-xs">
                        {checkingGrammar ? <><Loader2 className="w-4 h-4 animate-spin" /> {selectedLang === "Tamil" ? "இலக்கணம் & எழுத்துப்பிழை சோதிக்கப்படுகிறது…" : "Analyzing spelling & grammar…"}</> : <><BrainCircuit className="w-4 h-4" /> {t.aiCheck}</>}
                      </button>
                      <button onClick={loadWritingPrompt} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 px-4 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"><RefreshCw className="w-4 h-4" /></button>
                    </div>
                    {grammarFeedback && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 p-5 rounded-2xl border border-emerald-300 dark:border-emerald-800 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-emerald-800 dark:text-emerald-300 text-xs">{selectedLang === "Tamil" ? "AI இலக்கண மதிப்பீடு" : "AI Grammar Evaluation"}</h4>
                          <span className="bg-emerald-500 text-white font-black text-xs px-3 py-1 rounded-full">{grammarFeedback.score}/100</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300"><span className="font-bold text-emerald-600">{selectedLang === "Tamil" ? "✅ நிறை: " : "✅ Strength: "}</span>{grammarFeedback.strengths}</p>
                        {grammarFeedback.corrections?.map((c: string, i: number) => <p key={i} className="text-xs text-slate-600 dark:text-slate-300"><span className="font-bold text-rose-500">{selectedLang === "Tamil" ? "✏️ திருத்தம்: " : "✏️ Correction: "}</span>{c}</p>)}
                        <p className="text-xs text-slate-600 dark:text-slate-350"><span className="font-bold text-indigo-600">{selectedLang === "Tamil" ? "💡 பரிந்துரை: " : "💡 Suggestion: "}</span>{grammarFeedback.suggestion}</p>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            )}


            {/* ── Language Games / Word Scramble ── */}
            {activeModal === "Language Games" && (
              <WordScrambleGame lang={selectedLang} speakFn={speakWord} />
            )}

            {/* ── Daily Challenge ── */}
            {activeModal === "Daily Challenge" && (
              <div className="flex flex-col gap-4">
                {dailyLoading ? <LoadingSpinner label={selectedLang === "Tamil" ? "இன்றைய சவால்கள் உருவாக்கப்படுகின்றன…" : "Generating today's challenges…"} /> : dailyTasks.length > 0 ? (
                  <>
                    {dailyTasks.map((task: any, i: number) => (
                      <div key={i} onClick={() => { const n = [...tasksDone]; n[i] = !n[i]; setTasksDone(n); }}
                        className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indigo-300 transition-all">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border shrink-0 transition-all ${tasksDone[i] ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"}`}>
                          {tasksDone[i] && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1">
                          <p className={`font-black text-xs ${tasksDone[i] ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-200"}`}>{task.title}</p>
                          {task.description && <p className="text-[11px] text-slate-400 mt-0.5">{task.description}</p>}
                        </div>
                        <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-xs px-2.5 py-1 rounded-lg shrink-0">{task.xp} XP</span>
                      </div>
                    ))}
                    {tasksDone.every(Boolean) && <div className="text-center font-black text-emerald-500 text-base py-2">{selectedLang === "Tamil" ? "🏆 அனைத்து சவால்களும் நிறைவு பெற்றன! +100 XP" : "🏆 All Challenges Complete! +100 Bonus XP"}</div>}
                    <button onClick={loadDailyChallenge} className="self-center bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-200 transition-colors"><RefreshCw className="w-3.5 h-3.5" /> {t.refreshChallenges}</button>
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
function WordScrambleGame({ lang, speakFn }: { lang: Lang; speakFn: (t: string) => void }) {
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
      <p className="text-slate-500 text-xs font-bold">{lang === "Tamil" ? "எழுத்துக்களைச் சீரமைத்து சொல்லைக் கண்டுபிடிக்கவும்:" : "Unscramble the word:"}</p>
      <div className="text-3xl font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">{scrambled}</div>
      <div className="flex gap-2 mt-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} className="bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-xl text-center font-bold border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white" placeholder={lang === "Tamil" ? "பதிலை தட்டச்சு செய்யவும்" : "Type answer here"} />
        <button onClick={() => {
          if (input.toUpperCase() === currentWord.toUpperCase()) {
            speakFn(currentWord);
            Swal.fire(lang === "Tamil" ? "சரி! 🎉" : "Correct! 🎉", "+10 XP", "success");
          } else {
            Swal.fire(lang === "Tamil" ? "மீண்டும் முயற்சி செய்!" : "Try Again!", "", "error");
          }
        }} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs">{lang === "Tamil" ? "சரிபார்" : "Check"}</button>
      </div>
      <button onClick={() => {
        setIndex(prev => (prev + 1) % wordsList[lang].length);
      }} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all mt-4 text-xs border border-slate-200 dark:border-slate-700">
        <RefreshCw className="w-3.5 h-3.5" /> {lang === "Tamil" ? "அடுத்த சொல்" : "Next Scrambled Word"}
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
    rose: "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-500 hover:text-white dark:bg-rose-950/40 dark:border-rose-800",
    blue: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-500 hover:text-white dark:bg-blue-950/40 dark:border-blue-800",
    amber: "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-500 hover:text-white dark:bg-amber-950/40 dark:border-amber-800",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-500 hover:text-white dark:bg-emerald-950/40 dark:border-emerald-800"
  };
  return (
    <button onClick={onClick} className={`p-5 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all active:scale-95 group shadow-xs ${colors[color]}`}>
      <div className="group-hover:scale-110 transition-transform">{React.cloneElement(icon, { className: "w-7 h-7" })}</div>
      <span className="font-extrabold text-xs">{title}</span>
    </button>
  );
}

function FeatureCard({ icon, title, desc, color, onClick }: any) {
  const bg: Record<string, string> = {
    rose: "bg-rose-50/70 hover:bg-rose-100 border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900",
    indigo: "bg-indigo-50/70 hover:bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900",
    emerald: "bg-emerald-50/70 hover:bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900",
    blue: "bg-blue-50/70 hover:bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-900",
    amber: "bg-amber-50/70 hover:bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-955/30 dark:border-amber-900",
    purple: "bg-purple-50/70 hover:bg-purple-100 border-purple-200 text-purple-700 dark:bg-purple-950/30 dark:border-purple-900",
    pink: "bg-pink-50/70 hover:bg-pink-100 border-pink-200 text-pink-700 dark:bg-pink-950/30 dark:border-pink-900",
    cyan: "bg-cyan-50/70 hover:bg-cyan-100 border-cyan-200 text-cyan-700 dark:bg-cyan-950/30 dark:border-cyan-900",
    orange: "bg-orange-50/70 hover:bg-orange-100 border-orange-200 text-orange-700 dark:bg-orange-950/30 dark:border-orange-900"
  };
  return (
    <button onClick={onClick} className={`p-5 rounded-2xl border transition-all flex flex-col gap-3 text-left shadow-xs hover:shadow-md hover:-translate-y-0.5 ${bg[color] || bg.indigo} dark:text-slate-300`}>
      <div className="bg-white dark:bg-slate-800 p-2 rounded-xl w-fit shadow-xs">{React.cloneElement(icon, { className: "w-5 h-5" })}</div>
      <div><h4 className="font-extrabold text-xs tracking-tight leading-snug">{title}</h4><p className="text-[10px] opacity-75 mt-0.5 line-clamp-1">{desc}</p></div>
    </button>
  );
}
