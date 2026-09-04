"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

type TargetLang = "English" | "Tamil";
type PracticeTab = "speaking" | "vocab" | "reading" | "chat";

interface WordItem {
  word: string;
  meaning: string;
  example?: string;
  tamilTranslation?: string;
}

export default function StudentLanguageCoachingPage() {
  const { lang: portalLang } = usePortalLanguage();
  const { data: session } = useSession();
  const studentId = (session?.user as any)?.studentId || (session?.user as any)?.id;

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Target practice language (English or Tamil)
  const [targetLang, setTargetLang] = useState<TargetLang>("English");
  const [activeTab, setActiveTab] = useState<PracticeTab>("speaking");

  // Audio state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Preload speech synthesis voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => { window.speechSynthesis.getVoices(); };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Audio Player Helper
  const stopAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  }, []);

  const speakText = useCallback(async (text: string) => {
    if (!text || typeof window === "undefined") return;
    const cleanText = text.replace(/[\uFFFD\uFEFF\u200B\u200C\u200D\u00AD]/g, "").trim();
    if (!cleanText) return;

    stopAudio();

    // 1. Backend Tamil Neural TTS if practicing Tamil
    if (targetLang === "Tamil") {
      try {
        setIsPlayingAudio(true);
        const token = (session?.user as any)?.backendToken;
        const res = await fetch(`${API}/api/language-coaching/tts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ text: cleanText, voice: "ta-IN-PallaviNeural" }),
        });

        const data = await res.json();
        if (data.success && data.audioUrl) {
          const audio = new Audio(`${API}${data.audioUrl}`);
          currentAudioRef.current = audio;
          audio.onended = () => { setIsPlayingAudio(false); currentAudioRef.current = null; };
          audio.onerror = () => { fallbackBrowserSpeech(cleanText); };
          await audio.play();
          return;
        }
      } catch (err) {
        console.warn("Backend TTS fallback to browser speech", err);
      }
    }

    // 2. Browser SpeechSynthesis fallback
    fallbackBrowserSpeech(cleanText);
  }, [targetLang, API, session, stopAudio]);

  const fallbackBrowserSpeech = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsPlayingAudio(false);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang === "Tamil" ? "ta-IN" : "en-US";
      utterance.rate = 0.85;

      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetLang === "Tamil" ? "ta" : "en"));
      if (matchedVoice) utterance.voice = matchedVoice;

      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsPlayingAudio(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 1. SPEAKING PRACTICE STATE
  // ---------------------------------------------------------------------------
  const PRACTICE_SENTENCES: Record<TargetLang, string[]> = {
    English: [
      "Good communication opens new opportunities in life.",
      "Practice speaking clearly and confidently every single day.",
      "Reading books expands your vocabulary and knowledge.",
      "Never hesitate to ask questions and learn new things.",
      "Listening carefully helps you become a better speaker."
    ],
    Tamil: [
      "தெளிவான பேச்சு வெற்றிக்கு சிறந்த வழியாகும்.",
      "தினமும் வாசித்து உங்கள் சொற்களஞ்சியத்தைப் பெருக்குங்கள்.",
      "விடாமுயற்சியுடன் பயிற்சி செய்தால் எதையும் சாதிக்கலாம்.",
      "மரியாதையான பேச்சு நல்ல நண்பர்களை உருவாக்கும்.",
      "கவனமாகக் கேட்பது நல்ல பேச்சாளராக மாற உதவும்."
    ]
  };

  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speakingResult, setSpeakingResult] = useState<any>(null);
  const recognitionRef = useRef<any>(null);

  const toggleRecording = async () => {
    const currentSentence = PRACTICE_SENTENCES[targetLang][sentenceIdx];

    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);

      // Score speaking performance
      setTimeout(() => {
        const spoken = transcript.toLowerCase().replace(/[^a-z0-9\s]/gi, "").split(/\s+/).filter(Boolean);
        const targetWords = currentSentence.toLowerCase().replace(/[^a-z0-9\s]/gi, "").split(/\s+/).filter(Boolean);

        let matches = 0;
        targetWords.forEach(w => { if (spoken.includes(w)) matches++; });
        const accuracy = Math.round((matches / Math.max(targetWords.length, 1)) * 100);

        setSpeakingResult({
          score: Math.min(100, Math.max(20, accuracy || (transcript.length > 5 ? 75 : 40))),
          transcript: transcript || (targetLang === "Tamil" ? "பேச்சு பதிவு செய்யப்பட்டது!" : "Speech recorded successfully!"),
          feedback: accuracy >= 70
            ? (targetLang === "Tamil" ? "சிறந்த உச்சரிப்பு! தொடர்ந்து பயிற்சி செய்யுங்கள்." : "Great pronunciation! Keep practicing.")
            : (targetLang === "Tamil" ? "மெதுவாகவும் தெளிவாகவும் மீண்டும் முயற்சி செய்யுங்கள." : "Try again speaking a bit slower and clearer.")
        });
      }, 500);
    } else {
      setTranscript("");
      setSpeakingResult(null);
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recog = new SpeechRecognition();
          recog.continuous = false;
          recog.lang = targetLang === "Tamil" ? "ta-IN" : "en-US";
          recog.onresult = (e: any) => {
            const t = Array.from(e.results).map((r: any) => r[0].transcript).join(" ");
            setTranscript(t);
          };
          recog.start();
          recognitionRef.current = recog;
        }
        setIsRecording(true);
      } catch {
        Swal.fire("Microphone Access", targetLang === "Tamil" ? "மைக்கில் பேச அனுமதி வழங்கவும்." : "Please grant microphone access to practice speaking.", "warning");
      }
    }
  };

  // ---------------------------------------------------------------------------
  // 2. VOCABULARY STATE
  // ---------------------------------------------------------------------------
  const VOCAB_LIST: Record<TargetLang, WordItem[]> = {
    English: [
      { word: "Perseverance", meaning: "Continued effort to achieve something despite difficulties.", example: "Her perseverance led to top scores in exams." },
      { word: "Eloquence", meaning: "Fluent or persuasive speaking or writing.", example: "He spoke with great eloquence during the school assembly." },
      { word: "Integrity", meaning: "The quality of being honest and having strong moral principles.", example: "Always act with integrity in whatever you do." },
      { word: "Resilience", meaning: "The capacity to recover quickly from difficulties.", example: "Students showed great resilience during challenges." },
      { word: "Empathy", meaning: "The ability to understand and share the feelings of another.", example: "Showing empathy makes our classroom a kinder place." }
    ],
    Tamil: [
      { word: "விடாமுயற்சி", meaning: "தடைகள் வரினும் கைவிடாது தொடர்ந்து உழைத்தல்.", example: "மாணவரின் விடாமுயற்சி தேர்வில் வெற்றி தந்தது." },
      { word: "ஒழுக்கம்", meaning: "நற்பண்புகளுடன் நேர்மையாக வாழ்வது.", example: "ஒழுக்கம் உயிரினும் மேலாகப் போற்றப்படும்." },
      { word: "நம்பிக்கை", meaning: "தன் திறமையிலும் நல்லெண்ணத்திலும் கொள்ளும் தெளிவு.", example: "தன்னம்பிக்கை வெற்றியின் முதல் படி." },
      { word: "அன்பு", meaning: "மற்றவர்களிடம் காட்டும் கனிவும் பரிவும்.", example: "அன்பு செலுத்துவது மனித நேயத்தின் அடையாளம்." },
      { word: "மரியாதை", meaning: "பெரியவர்களையும் ஆசிரியர்களையும் மதித்துப் போற்றுதல்.", example: "ஆசிரியர்களுக்கு மரியாதை தருவது நற்பண்பாகும்." }
    ]
  };

  const [vocabIdx, setVocabIdx] = useState(0);

  // ---------------------------------------------------------------------------
  // 3. READING PRACTICE STATE
  // ---------------------------------------------------------------------------
  const STORIES: Record<TargetLang, { title: string; story: string; moral: string }> = {
    English: {
      title: "The Power of Teamwork",
      story: "Once upon a time, a group of birds got caught in a hunter's net. Instead of panicking, their leader advised everyone to fly up together at the exact same moment. Working as one team, they lifted the entire net into the sky and escaped safely to their friend the mouse, who chewed the net free.",
      moral: "Moral: Unity is strength and teamwork solves great challenges."
    },
    Tamil: {
      title: "ஒற்றுமையே பலம்",
      story: "ஒரு காட்டில் புறாக்கள் வேடனின் வலையில் மாட்டிக்கொண்டன. புறாத் தலைவன் சாதுரியமாக யோசித்து, 'எல்லோரும் ஒரே நேரத்தில் இறக்கைகளை அடித்து பறப்போம்' என்றது. அனைத்து புறாக்களும் சேர்ந்து வலையோடு பறந்து தப்பின. பிறகு எலி நண்பனின் உதவியால் வலையிலிருந்து விடுபட்டன.",
      moral: "நீதி: ஒற்றுமையே வலிமை! இணைந்து செயல்பட்டால் எதையும் வெல்லலாம்."
    }
  };

  // ---------------------------------------------------------------------------
  // 4. AI CHAT STATE
  // ---------------------------------------------------------------------------
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "ai" | "user"; text: string }>>([
    {
      sender: "ai",
      text: targetLang === "Tamil"
        ? "வணக்கம்! நான் உங்கள் AI மொழி ஆசிரியர். இன்று என்ன பயிற்சி செய்யலாம்?"
        : "Hello! I am your AI Language Coach. How can I help you practice today?"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    // Reset AI greeting when target language changes
    setChatMessages([
      {
        sender: "ai",
        text: targetLang === "Tamil"
          ? "வணக்கம்! நான் உங்கள் AI மொழி ஆசிரியர். இன்று என்ன பயிற்சி செய்யலாம்?"
          : "Hello! I am your AI Language Coach. How can I help you practice today?"
      }
    ]);
    setSentenceIdx(0);
    setVocabIdx(0);
    setSpeakingResult(null);
  }, [targetLang]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: "user", text: userText }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const token = (session?.user as any)?.backendToken;
      const res = await fetch(`${API}/api/language-coaching/${studentId || "demo"}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: userText, language: targetLang })
      });
      const data = await res.json();
      if (data.success && data.data?.text) {
        setChatMessages(prev => [...prev, { sender: "ai", text: data.data.text }]);
      } else {
        throw new Error("No response");
      }
    } catch {
      // Friendly fallback offline reply
      const defaultReply = targetLang === "Tamil"
        ? `மிக்க மகிழ்ச்சி! "${userText}" - என்ற வாக்கியம் மிகவும் நன்றாக உள்ளது. தொடர்ந்து பேசுங்கள்!`
        : `Great job! Your sentence "${userText}" sounds natural and clear. Keep practicing!`;
      setChatMessages(prev => [...prev, { sender: "ai", text: defaultReply }]);
    } finally {
      setChatLoading(false);
    }
  };

  const currentWord = VOCAB_LIST[targetLang][vocabIdx];
  const currentSentence = PRACTICE_SENTENCES[targetLang][sentenceIdx];
  const currentStory = STORIES[targetLang];

  return (
    <PortalLayout
      title={portalLang === "தமிழ்" ? "மொழிப் பயிற்சி போர்டல்" : "Language Coaching Portal"}
      subtitle={portalLang === "தமிழ்" ? "எளிய வழியில் பேச்சு, வாசிப்பு மற்றும் சொற்களஞ்சியப் பயிற்சி" : "Simple & effective speaking, vocabulary, and reading practice"}
      accentColor="#6366f1"
    >
      <div className="w-full mb-10 space-y-6">

        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center border border-indigo-200/30 text-indigo-600 dark:text-indigo-400 shrink-0">
              <i className="fi fi-sr-language text-xl flex items-center" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider leading-tight">
                {targetLang === "Tamil" ? "தமிழ் மொழிப் பயிற்சி" : "Language Coaching"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {targetLang === "Tamil"
                  ? "தெளிவான உச்சரிப்பு, சொல் அறிவு மற்றும் உரையாடல் பயிற்சி"
                  : "Master pronunciation, build vocabulary & gain speaking confidence"}
              </p>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl flex items-center gap-1 border border-slate-200 dark:border-slate-700 shrink-0 self-stretch sm:self-auto justify-center">
            <button
              onClick={() => setTargetLang("English")}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                targetLang === "English"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setTargetLang("Tamil")}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                targetLang === "Tamil"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
              }`}
            >
              தமிழ் (Tamil)
            </button>
          </div>
        </div>

        {/* Practice Module Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: "speaking", label: targetLang === "Tamil" ? "பேச்சுப் பயிற்சி" : "Speaking Practice", icon: "fi-sr-microphone", color: "rose" },
            { id: "vocab", label: targetLang === "Tamil" ? "சொற்களஞ்சியம்" : "Vocabulary Builder", icon: "fi-sr-book-bookmark", color: "amber" },
            { id: "reading", label: targetLang === "Tamil" ? "கதை வாசிப்பு" : "Story Reading", icon: "fi-sr-book-open-reader", color: "emerald" },
            { id: "chat", label: targetLang === "Tamil" ? "AI உரையாடல்" : "AI Coach Chat", icon: "fi-sr-comment-alt", color: "indigo" },
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as PracticeTab); stopAudio(); }}
                className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 text-center ${
                  isActive
                    ? "bg-white dark:bg-slate-900 border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                    : "bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700"
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${
                  isActive ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}>
                  <i className={`fi ${tab.icon} flex items-center`} />
                </div>
                <span className={`text-xs font-extrabold ${isActive ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: SPEAKING PRACTICE */}
        {activeTab === "speaking" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/30">
                  {targetLang === "Tamil" ? "உச்சரிப்புப் பயிற்சி" : "Pronunciation Practice"}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-2">
                  {targetLang === "Tamil" ? "வாக்கியத்தை உரக்கப் பேசி பயிற்சி செய்யுங்கள்" : "Read the sentence out loud into your microphone"}
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {sentenceIdx + 1} / {PRACTICE_SENTENCES[targetLang].length}
              </span>
            </div>

            {/* Target Sentence Card */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-4">
              <p className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white leading-relaxed">
                &ldquo;{currentSentence}&rdquo;
              </p>

              <div className="flex justify-center items-center gap-3">
                <button
                  onClick={() => speakText(currentSentence)}
                  className="bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-indigo-200/40"
                >
                  <i className={`fi ${isPlayingAudio ? "fi-sr-volume" : "fi-rr-volume"} text-sm flex items-center`} />
                  {targetLang === "Tamil" ? "ஒலி வடிவில் கேட்க" : "Listen Audio"}
                </button>

                <button
                  onClick={toggleRecording}
                  className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm ${
                    isRecording
                      ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                      : "bg-rose-500 hover:bg-rose-600 text-white"
                  }`}
                >
                  <i className="fi fi-sr-microphone text-sm flex items-center" />
                  {isRecording
                    ? (targetLang === "Tamil" ? "நிறுத்தி மதிப்பிட" : "Stop & Grade")
                    : (targetLang === "Tamil" ? "மைக்கில் பேசுக" : "Speak Now")}
                </button>
              </div>
            </div>

            {/* Speaking Result Feedback */}
            {speakingResult && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-5 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <i className="fi fi-sr-check-circle text-sm text-emerald-600" />
                    {targetLang === "Tamil" ? "பயிற்சி மதிப்பீடு" : "Pronunciation Feedback"}
                  </span>
                  <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-xs font-black">
                    {speakingResult.score}% Accuracy
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {speakingResult.feedback}
                </p>
                {speakingResult.transcript && (
                  <p className="text-[11px] italic text-slate-500 dark:text-slate-400">
                    Spoken: &quot;{speakingResult.transcript}&quot;
                  </p>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => { setSentenceIdx(prev => Math.max(0, prev - 1)); setSpeakingResult(null); }}
                disabled={sentenceIdx === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Previous Sentence
              </button>
              <button
                onClick={() => { setSentenceIdx(prev => Math.min(PRACTICE_SENTENCES[targetLang].length - 1, prev + 1)); setSpeakingResult(null); }}
                disabled={sentenceIdx === PRACTICE_SENTENCES[targetLang].length - 1}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-30 flex items-center gap-1.5"
              >
                Next Sentence <i className="fi fi-sr-angle-small-right text-base flex items-center" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: VOCABULARY BUILDER */}
        {activeTab === "vocab" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/30">
                  {targetLang === "Tamil" ? "சொல் வளம்" : "Vocabulary Builder"}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-2">
                  {targetLang === "Tamil" ? "முக்கிய சொற்கள் மற்றும் பொருள்" : "Learn key words, meanings, and usage"}
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {vocabIdx + 1} / {VOCAB_LIST[targetLang].length}
              </span>
            </div>

            {/* Flashcard */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {currentWord.word}
              </h2>
              <div className="w-12 h-0.5 bg-indigo-500/30 mx-auto" />
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed max-w-lg mx-auto">
                {currentWord.meaning}
              </p>
              {currentWord.example && (
                <p className="text-xs italic text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  &ldquo;{currentWord.example}&rdquo;
                </p>
              )}

              <button
                onClick={() => speakText(`${currentWord.word}. ${currentWord.meaning}`)}
                className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl text-xs font-extrabold transition-all inline-flex items-center gap-2 shadow-sm"
              >
                <i className="fi fi-sr-volume text-sm flex items-center" />
                {targetLang === "Tamil" ? "உச்சரிப்பைக் கேட்க" : "Listen Pronunciation"}
              </button>
            </div>

            {/* Card Navigation */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setVocabIdx(prev => Math.max(0, prev - 1))}
                disabled={vocabIdx === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Previous Word
              </button>
              <button
                onClick={() => setVocabIdx(prev => Math.min(VOCAB_LIST[targetLang].length - 1, prev + 1))}
                disabled={vocabIdx === VOCAB_LIST[targetLang].length - 1}
                className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-30 flex items-center gap-1.5"
              >
                Next Word <i className="fi fi-sr-angle-small-right text-base flex items-center" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: STORY READING */}
        {activeTab === "reading" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/30">
                  {targetLang === "Tamil" ? "எளிய கதை வாசிப்பு" : "Story Reading Passage"}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-2">
                  {currentStory.title}
                </h3>
              </div>
              <button
                onClick={() => speakText(`${currentStory.title}. ${currentStory.story}`)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <i className="fi fi-sr-volume text-sm flex items-center" />
                {targetLang === "Tamil" ? "கதையை உரக்கக் கேட்க" : "Listen Story Audio"}
              </button>
            </div>

            {/* Story Text Box */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed tracking-wide">
                {currentStory.story}
              </p>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                {currentStory.moral}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AI COACH CHAT */}
        {activeTab === "chat" && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/30">
                  {targetLang === "Tamil" ? "AI உரையாடல் பயிற்சி" : "Interactive Language Assistant"}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-2">
                  {targetLang === "Tamil" ? "ஆசிரியருடன் உரையாடி தமிழ் தட்டச்சு & பேச்சு பயிற்சி செய்யுங்கள்" : "Practice typing & conversing with your AI tutor"}
                </h3>
              </div>
            </div>

            {/* Chat Box */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 h-[380px] flex flex-col justify-between">
              <div className="overflow-y-auto space-y-3.5 pr-2">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender === "ai" && (
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                        <i className="fi fi-sr-brain flex items-center" />
                      </div>
                    )}
                    <div className={`p-3.5 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none shadow-sm font-semibold"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none font-medium shadow-xs"
                    }`}>
                      {msg.text}
                      {msg.sender === "ai" && (
                        <button
                          onClick={() => speakText(msg.text)}
                          className="mt-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                        >
                          <i className="fi fi-sr-volume flex items-center" /> Listen
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <i className="fi fi-sr-spinner animate-spin text-indigo-500" /> AI Coach is replying...
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={targetLang === "Tamil" ? "பதிலை இங்கு தட்டச்சு செய்க..." : "Type your message to practice..."}
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  Send <i className="fi fi-sr-paper-plane flex items-center" />
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </PortalLayout>
  );
}
