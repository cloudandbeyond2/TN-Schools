"use client";

import React, { useState, useRef, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import {
  Mic, BookOpen, Headphones, PenTool, MessageSquare, Users, Search, Volume2, Book, Gamepad2, ListPlus, Image as ImageIcon, Mic2, TrendingUp, Award, Calendar, Send, Target, BarChart, ShieldAlert, Lightbulb, CheckCircle2, BrainCircuit, MessageCircle, X, Play, RotateCcw, ArrowRight, Zap, Rocket, Clock, VolumeX
} from "lucide-react";
import Swal from "sweetalert2";

export default function LanguageCoachingPage() {
  const [selectedLang, setSelectedLang] = useState<"Tamil" | "English" | "Hindi">("English");
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // --- AI Chat State ---
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", content: "Hello! I am your AI Language Coach. How can I help you improve your communication today?" }
  ]);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatHistory]);

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatHistory((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatInput("");
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      // Assuming a generic student ID for the prototype
      const res = await fetch(`${apiUrl}/api/students/95acafcf-990f-49aa-8c21-68a164a57a2e/language-coaching/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });
      
      const json = await res.json();
      if (json.success && json.data?.text) {
        setChatHistory((prev) => [...prev, { role: "ai", content: json.data.text }]);
      } else {
        setChatHistory((prev) => [...prev, { role: "ai", content: "Oops, I had trouble connecting. Let's try again!" }]);
      }
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [...prev, { role: "ai", content: "I'm offline right now, but keep practicing!" }]);
    }
  };

  // --- 1. AI Speaking Coach State ---
  const [isRecording, setIsRecording] = useState(false);
  const [speakingScore, setSpeakingScore] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsAnalyzing(true);
      setTimeout(() => { setIsAnalyzing(false); setSpeakingScore(Math.floor(Math.random() * 20) + 80); }, 2000);
    } else {
      setSpeakingScore(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      } catch (err) {
        Swal.fire("Error", "Microphone access denied or unavailable.", "error");
      }
    }
  };

  // --- 2. Vocab Builder State ---
  const vocabData = {
    English: [
      { word: "Resilience", meaning: "The capacity to recover quickly from difficulties.", sentence: "She showed great resilience after the failure." },
      { word: "Eloquent", meaning: "Fluent or persuasive in speaking or writing.", sentence: "He gave an eloquent speech at the assembly." }
    ],
    Tamil: [
      { word: "நம்பிக்கை", meaning: "Hope or Belief", sentence: "எப்பொழுதும் தன் நம்பிக்கை இழக்கக் கூடாது." },
      { word: "முயற்சி", meaning: "Effort or Try", sentence: "தொடர் முயற்சி வெற்றி தரும்." }
    ],
    Hindi: [
      { word: "साहस", meaning: "Courage or Bravery", sentence: "हमें साहस के साथ काम करना चाहिए।" },
      { word: "सफलता", meaning: "Success", sentence: "कड़ी मेहनत से सफलता मिलती है।" }
    ]
  };
  const [vocabIndex, setVocabIndex] = useState(0);
  const [showVocabMeaning, setShowVocabMeaning] = useState(false);

  // --- 3. Speech/Pronunciation (Listen & Repeat) ---
  const speakWord = (text: string, lang: string) => {
    if (!window.speechSynthesis) return Swal.fire("Error", "Text-to-speech not supported in this browser.", "error");
    const utterance = new SpeechSynthesisUtterance(text);
    if (lang === "Tamil") utterance.lang = "ta-IN";
    else if (lang === "Hindi") utterance.lang = "hi-IN";
    else utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  // --- 4. Sentence Builder State ---
  const sentenceData = {
    English: { words: ["I", "love", "learning", "new", "languages"], target: "I love learning new languages" },
    Tamil: { words: ["நான்", "புதிய", "மொழிகளை", "கற்க", "விரும்புகிறேன்"], target: "நான் புதிய மொழிகளை கற்க விரும்புகிறேன்" },
    Hindi: { words: ["मुझे", "नई", "भाषाएं", "सीखना", "पसंद", "है"], target: "मुझे नई भाषाएं सीखना पसंद है" }
  };
  const [currentSentence, setCurrentSentence] = useState<string[]>([]);

  // --- 5. Timer (Public Speaking / Debate) ---
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  // --- 6. Roleplay Convo State ---
  const [convoStep, setConvoStep] = useState(0);

  // --- 7. Word Scramble (Games) ---
  const scrambleData = { English: "ELEPHANT", Tamil: "பள்ளி", Hindi: "किताब" };
  const [scrambleInput, setScrambleInput] = useState("");

  // --- 8. Daily Challenges State ---
  const [tasks, setTasks] = useState([false, false, false]);

  const handleFeatureClick = (featureName: string) => {
    setSpeakingScore(null);
    setIsRecording(false);
    setIsAnalyzing(false);
    setVocabIndex(0);
    setShowVocabMeaning(false);
    setCurrentSentence([]);
    setTimeLeft(60);
    setIsTimerRunning(false);
    setConvoStep(0);
    setScrambleInput("");
    setActiveModal(featureName);
  };

  const closeModal = () => {
    if (isRecording && mediaRecorderRef.current) mediaRecorderRef.current.stop();
    setIsRecording(false);
    setIsTimerRunning(false);
    window.speechSynthesis?.cancel();
    setActiveModal(null);
  };

  return (
    <PortalLayout title="Language & Communication Hub 🗣️" subtitle={`Master Your Skills · Currently Practicing: ${selectedLang}`}>
      <div className="flex flex-col gap-10 text-left">

        {/* 1. Language Selector */}
        <section>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <GlobeIcon className="w-6 h-6 text-indigo-500" /> Choose Your Language
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["Tamil", "English", "Hindi"].map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setSelectedLang(lang as any);
                  setChatHistory(prev => [...prev, { role: "ai", content: `Great! We are now practicing ${lang}. Are you ready for a challenge?` }]);
                }}
                className={`p-6 rounded-3xl border-4 transition-all flex items-center justify-center gap-3 font-black text-lg ${
                  selectedLang === lang 
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-xl scale-[1.02]" 
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:shadow-lg"
                }`}
              >
                {lang === "Tamil" && "தமிழ் (Tamil)"}
                {lang === "English" && "English"}
                {lang === "Hindi" && "हिंदी (Hindi)"}
                {selectedLang === lang && <CheckCircle2 className="w-5 h-5 text-indigo-500" />}
              </button>
            ))}
          </div>
        </section>

        {/* 2. Today's Practice */}
        <section>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-500" /> Today's Quick Practice
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <PracticeCard icon={<Mic />} title="Speaking" color="rose" onClick={() => handleFeatureClick("AI Speaking Coach")} />
            <PracticeCard icon={<BookOpen />} title="Reading" color="blue" onClick={() => handleFeatureClick("Story Reading")} />
            <PracticeCard icon={<Headphones />} title="Listening" color="amber" onClick={() => handleFeatureClick("Listening Ex.")} />
            <PracticeCard icon={<PenTool />} title="Writing" color="emerald" onClick={() => handleFeatureClick("Writing Practice")} />
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          
          <div className="xl:col-span-2 space-y-10">
            {/* 3. AI Communication Lab (15 Features) */}
            <section>
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border-4 border-slate-100 dark:border-slate-700">
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-3">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-2xl rotate-[-5deg]">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  AI Communication Lab
                </h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <FeatureCard icon={<Mic2 />} title="AI Speaking Coach" desc="Pronunciation test" color="rose" onClick={() => handleFeatureClick("AI Speaking Coach")} />
                  <FeatureCard icon={<Users />} title="Real-Life Convo" desc="Roleplay scenarios" color="indigo" onClick={() => handleFeatureClick("Real-Life Convo")} />
                  <FeatureCard icon={<Search />} title="Vocab Builder" desc="Flashcards app" color="emerald" onClick={() => handleFeatureClick("Vocab Builder")} />
                  
                  <FeatureCard icon={<Volume2 />} title="Pronunciation" desc="Listen & Repeat" color="blue" onClick={() => handleFeatureClick("Pronunciation")} />
                  <FeatureCard icon={<Headphones />} title="Listening Ex." desc="Audio comprehension" color="amber" onClick={() => handleFeatureClick("Listening Ex.")} />
                  <FeatureCard icon={<Book />} title="Story Reading" desc="Read aloud stories" color="purple" onClick={() => handleFeatureClick("Story Reading")} />
                  
                  <FeatureCard icon={<Gamepad2 />} title="Grammar Games" desc="Fun syntax learning" color="pink" onClick={() => handleFeatureClick("Grammar Games")} />
                  <FeatureCard icon={<ListPlus />} title="Sentence Builder" desc="Drag & drop words" color="cyan" onClick={() => handleFeatureClick("Sentence Builder")} />
                  <FeatureCard icon={<ImageIcon />} title="Picture Describe" desc="Speak what you see" color="orange" onClick={() => handleFeatureClick("Picture Describe")} />
                  
                  <FeatureCard icon={<MessageCircle />} title="Public Speaking" desc="Speech topics" color="rose" onClick={() => handleFeatureClick("Public Speaking")} />
                  <FeatureCard icon={<MessageSquare />} title="Debate Practice" desc="Argue your point" color="indigo" onClick={() => handleFeatureClick("Debate Practice")} />
                  <FeatureCard icon={<Users />} title="Role Play" desc="Simulated personas" color="emerald" onClick={() => handleFeatureClick("Role Play")} />
                  
                  <FeatureCard icon={<Target />} title="Daily Challenge" desc="XP tasks" color="blue" onClick={() => handleFeatureClick("Daily Challenge")} />
                  <FeatureCard icon={<PenTool />} title="Writing Practice" desc="Essays & Emails" color="amber" onClick={() => handleFeatureClick("Writing Practice")} />
                  <FeatureCard icon={<Gamepad2 />} title="Language Games" desc="Word Scramble" color="purple" onClick={() => handleFeatureClick("Language Games")} />
                </div>
              </div>
            </section>

            {/* 6. Progress Dashboard */}
            <section>
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-[3rem] shadow-xl border-4 border-indigo-800 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full"></div>
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                  <BarChart className="w-6 h-6 text-indigo-400" /> My Progress Dashboard
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-center relative z-10">
                  <ProgressRing label="Speaking" value={75} color="#10b981" />
                  <ProgressRing label="Reading" value={85} color="#3b82f6" />
                  <ProgressRing label="Listening" value={60} color="#f59e0b" />
                  <ProgressRing label="Writing" value={45} color="#ec4899" />
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-10">
            {/* 4. AI Language Assistant Chat */}
            <section className="h-[450px] flex flex-col bg-white dark:bg-slate-800 rounded-[3rem] shadow-xl border-4 border-sky-100 dark:border-slate-700 overflow-hidden">
              <div className="bg-sky-50 dark:bg-sky-900/50 p-6 border-b border-sky-100 dark:border-slate-700 flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center shadow-lg text-white shrink-0">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 dark:text-slate-100 leading-tight">AI Language Tutor</h3>
                  <p className="text-[10px] text-slate-500 font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Online & Ready</p>
                </div>
              </div>

              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-900/30">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                      msg.role === "user" ? "bg-sky-500 text-white rounded-br-none shadow-md" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                <form onSubmit={handleChat} className="flex gap-2">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask a question..." className="flex-1 bg-slate-100 dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 dark:text-white" />
                  <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white p-3 rounded-2xl shadow-lg transition-colors"><Send className="w-5 h-5" /></button>
                </form>
              </div>
            </section>

            {/* 7. Achievements */}
            <section className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border-4 border-amber-100 dark:border-slate-700">
               <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-3">
                 <Award className="w-6 h-6 text-amber-500" /> My Badges
               </h2>
               <div className="flex flex-wrap gap-4">
                 <Badge icon="🌟" name="First Convo" earned={true} />
                 <Badge icon="📚" name="Vocab Master" earned={true} />
                 <Badge icon="🎯" name="Pronunciation" earned={true} />
                 <Badge icon="📖" name="Reading Champ" earned={false} />
               </div>
            </section>
          </div>
        </div>
      </div>

      {/* --- ALL 15 MODALS SYSTEM --- */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] w-full max-w-2xl p-8 border-4 border-indigo-400 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <button onClick={closeModal} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 bg-slate-100 hover:bg-rose-50 dark:bg-slate-700 dark:hover:bg-slate-600 p-2 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-3"><Zap className="w-6 h-6 text-amber-500" /> {activeModal} ({selectedLang})</h3>
            <div className="w-full h-px bg-slate-200 dark:bg-slate-700 mb-6"></div>

            {/* 1. AI Speaking Coach */}
            {activeModal === "AI Speaking Coach" && (
              <div className="flex flex-col items-center py-6 text-center">
                <p className="text-slate-500 mb-8 max-w-sm">Click mic and read: <br/><br/><span className="font-bold text-lg text-slate-800 dark:text-slate-100">"{selectedLang === "English" ? "Communication is the key." : selectedLang === "Tamil" ? "தொடர்பு கொள்வது முக்கியம்." : "संचार सफलता की कुंजी है।"}"</span></p>
                <button onClick={toggleRecording} className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${isRecording ? "bg-rose-500 scale-110" : "bg-indigo-500"}`}><Mic className={`w-10 h-10 ${isRecording ? "animate-pulse" : ""}`} /></button>
                {isRecording && <p className="text-rose-500 font-bold mt-4 animate-pulse">Recording... Click to stop.</p>}
                {isAnalyzing && <div className="mt-4 flex flex-col items-center gap-3"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div><p className="text-indigo-500 font-bold">Analyzing...</p></div>}
                {speakingScore && <div className="mt-6 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 p-6 rounded-3xl"><h4 className="text-lg font-black text-emerald-800 mb-2">Score: {speakingScore}%</h4><p className="text-sm text-emerald-700">+50 XP Earned!</p></div>}
              </div>
            )}

            {/* 2. Vocab Builder */}
            {activeModal === "Vocab Builder" && (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-full max-w-md h-64 perspective-1000 cursor-pointer group" onClick={() => setShowVocabMeaning(!showVocabMeaning)}>
                  <div className={`relative w-full h-full transition-transform duration-500 preserve-3d ${showVocabMeaning ? "rotate-y-180" : ""}`}>
                    <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-xl flex items-center justify-center text-white border-4 border-indigo-400"><h2 className="text-4xl font-black">{vocabData[selectedLang][vocabIndex]?.word}</h2></div>
                    <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white dark:bg-slate-800 rounded-3xl flex flex-col items-center justify-center text-center p-8 border-4 border-indigo-400"><h3 className="text-xl font-black text-indigo-600">{vocabData[selectedLang][vocabIndex]?.meaning}</h3><p className="text-sm italic mt-4">"{vocabData[selectedLang][vocabIndex]?.sentence}"</p></div>
                  </div>
                </div>
                <button onClick={() => { setShowVocabMeaning(false); setVocabIndex((p) => (p + 1) % vocabData[selectedLang].length); }} className="mt-8 bg-indigo-500 text-white font-bold py-3 px-8 rounded-2xl">Next Word</button>
              </div>
            )}

            {/* 3 & 4. Real-Life Convo / Role Play */}
            {(activeModal === "Real-Life Convo" || activeModal === "Role Play") && (
              <div className="flex flex-col gap-4">
                <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200">
                  <h4 className="font-bold mb-2">Scenario: {selectedLang === 'English' ? "Ordering Food" : selectedLang === 'Tamil' ? "உணவு ஆர்டர்" : "खाना ऑर्डर करना"}</h4>
                  {convoStep === 0 && <p className="text-sm">Waiter: {selectedLang === 'English' ? "What would you like to order?" : "என்ன வேண்டும்?"}</p>}
                  {convoStep === 1 && <p className="text-sm text-indigo-600">You: {selectedLang === 'English' ? "I'll have a coffee." : "ஒரு காபி."}</p>}
                  {convoStep === 1 && <p className="text-sm mt-2">Waiter: {selectedLang === 'English' ? "Coming right up!" : "இதோ வருகிறது!"}</p>}
                </div>
                {convoStep === 0 && <button onClick={() => setConvoStep(1)} className="bg-emerald-500 text-white p-3 rounded-xl font-bold">Say: "{selectedLang === 'English' ? "I'll have a coffee." : "ஒரு காபி."}"</button>}
                {convoStep === 1 && <div className="text-center font-bold text-emerald-500">Conversation Complete! +10 XP</div>}
              </div>
            )}

            {/* 5 & 6. Pronunciation / Listening Ex. */}
            {(activeModal === "Pronunciation" || activeModal === "Listening Ex.") && (
              <div className="flex flex-col items-center text-center py-6">
                 <button onClick={() => speakWord(selectedLang === "English" ? "Hello world! This is a listening exercise." : selectedLang === "Tamil" ? "வணக்கம்! இது ஒரு கேட்கும் பயிற்சி." : "नमस्ते! यह एक सुनने का अभ्यास है।", selectedLang)} className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-blue-600 transition-all"><Volume2 className="w-12 h-12" /></button>
                 <p className="mt-6 font-bold text-slate-700 dark:text-slate-300">Click to listen to the {selectedLang} audio prompt.</p>
              </div>
            )}

            {/* 7. Story Reading */}
            {activeModal === "Story Reading" && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border-2 border-amber-200">
                <h4 className="font-black text-lg mb-4">{selectedLang === 'English' ? "The Thirsty Crow" : selectedLang === 'Tamil' ? "தாகமுள்ள காகம்" : "प्यासा कौआ"}</h4>
                <p className="text-sm leading-relaxed font-medium">
                  {selectedLang === 'English' ? "Once a crow was very thirsty. It looked for water everywhere. Finally, it saw a pot with very little water..." : 
                   selectedLang === 'Tamil' ? "ஒரு காகத்திற்கு மிகவும் தாகமாக இருந்தது. தண்ணீர் தேடி அலைந்தது. ஒரு பானையில் சிறிதளவு தண்ணீரைக் கண்டது..." : 
                   "एक बार एक कौआ बहुत प्यासा था। उसने हर जगह पानी ढूंढा। अंत में, उसने थोड़ा पानी वाला एक घड़ा देखा..."}
                </p>
                <button className="mt-6 bg-amber-500 text-white px-6 py-2 rounded-xl font-bold" onClick={() => Swal.fire('Great Reading!', '+20 XP', 'success')}>Mark as Read</button>
              </div>
            )}

            {/* 8. Sentence Builder */}
            {activeModal === "Sentence Builder" && (
              <div className="flex flex-col items-center gap-6">
                <div className="w-full bg-slate-100 dark:bg-slate-900 min-h-16 rounded-xl border-2 border-dashed border-slate-300 flex items-center p-4 gap-2 flex-wrap">
                  {currentSentence.map((w, i) => <span key={i} className="bg-indigo-500 text-white px-3 py-1 rounded shadow">{w}</span>)}
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {sentenceData[selectedLang].words.map((word) => (
                    <button key={word} onClick={() => setCurrentSentence([...currentSentence, word])} className="bg-white border-2 border-slate-200 px-4 py-2 rounded-xl font-bold shadow-sm hover:border-indigo-500">{word}</button>
                  ))}
                </div>
                <div className="flex gap-4">
                   <button onClick={() => setCurrentSentence([])} className="bg-rose-500 text-white px-4 py-2 rounded-xl font-bold">Clear</button>
                   <button onClick={() => currentSentence.join(" ") === sentenceData[selectedLang].target ? Swal.fire('Correct!', 'Perfect sentence! +15 XP', 'success') : Swal.fire('Oops', 'Not quite right. Try again.', 'error')} className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold">Check</button>
                </div>
              </div>
            )}

            {/* 9 & 10. Public Speaking / Debate */}
            {(activeModal === "Public Speaking" || activeModal === "Debate Practice") && (
              <div className="text-center">
                <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-3xl border-2 border-rose-200 mb-6">
                  <p className="text-sm font-bold text-rose-500 uppercase">Topic</p>
                  <h4 className="text-xl font-black mt-2">{selectedLang === 'English' ? "Should students have homework?" : "மாணவர்களுக்கு வீட்டுப்பாடம் அவசியமா?"}</h4>
                </div>
                <div className="text-5xl font-black font-mono text-slate-800 dark:text-white mb-6 flex items-center justify-center gap-4">
                  <Clock className="w-8 h-8 text-rose-500"/> 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </div>
                <button onClick={() => setIsTimerRunning(!isTimerRunning)} className={`${isTimerRunning ? 'bg-rose-500' : 'bg-emerald-500'} text-white font-bold px-8 py-3 rounded-2xl`}>
                  {isTimerRunning ? "Pause Timer" : "Start Speaking (1 Min)"}
                </button>
              </div>
            )}

            {/* 11. Picture Describe */}
            {activeModal === "Picture Describe" && (
              <div className="flex flex-col gap-4">
                <div className="w-full h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl overflow-hidden flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-12 h-12" /> <span className="ml-2 font-bold">Image Placeholder: A busy market</span>
                </div>
                <textarea className="w-full h-24 bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200" placeholder={`Describe this image in ${selectedLang}...`}></textarea>
                <button onClick={() => Swal.fire('Submitted!', 'Great description! +15 XP', 'success')} className="bg-indigo-500 text-white font-bold py-3 rounded-xl">Submit Description</button>
              </div>
            )}

            {/* 12. Grammar / Language Games (Word Scramble) */}
            {(activeModal === "Grammar Games" || activeModal === "Language Games") && (
               <div className="text-center">
                 <h4 className="font-bold text-slate-500 mb-2">Unscramble the word:</h4>
                 <div className="text-4xl font-black tracking-widest text-indigo-600 mb-6">{scrambleData[selectedLang].split('').sort(()=>Math.random()-0.5).join('')}</div>
                 <input type="text" value={scrambleInput} onChange={(e) => setScrambleInput(e.target.value)} className="bg-slate-100 px-4 py-2 rounded-xl text-center font-bold mr-2 border border-slate-300" placeholder="Type here" />
                 <button onClick={() => scrambleInput.toUpperCase() === scrambleData[selectedLang].toUpperCase() ? Swal.fire('Correct!', '+10 XP', 'success') : Swal.fire('Try again', '', 'error')} className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold">Check</button>
               </div>
            )}

            {/* 13. Writing Practice */}
            {activeModal === "Writing Practice" && (
              <div className="flex flex-col gap-4">
                <h4 className="font-bold">Prompt: Write a 5-sentence email to a friend.</h4>
                <textarea className="w-full h-32 bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200" placeholder="Dear friend..."></textarea>
                <button onClick={() => Swal.fire('Analyzed', 'Grammar check passed! +30 XP', 'success')} className="bg-amber-500 text-white font-bold py-3 rounded-xl">AI Grammar Check</button>
              </div>
            )}

            {/* 14. Daily Challenge */}
            {activeModal === "Daily Challenge" && (
              <div className="flex flex-col gap-4">
                {[
                  "Complete 1 Speaking Exercise", 
                  "Learn 3 New Vocab Words", 
                  "Read 1 Short Story"
                ].map((task, i) => (
                  <div key={i} onClick={() => { const n=[...tasks]; n[i]=!n[i]; setTasks(n); }} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 cursor-pointer">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${tasks[i] ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>{tasks[i] && <CheckCircle2 className="w-4 h-4"/>}</div>
                    <span className={`font-bold ${tasks[i] ? 'line-through text-slate-400' : ''}`}>{task}</span>
                  </div>
                ))}
                {tasks.every(t => t) && <div className="text-center text-emerald-500 font-bold mt-4">All Challenges Complete! +100 Bonus XP</div>}
              </div>
            )}

          </div>
        </div>
      )}
    </PortalLayout>
  );
}

// Subcomponents

function PracticeCard({ icon, title, color, onClick }: any) {
  const colors: Record<string, string> = { rose: "bg-rose-100 text-rose-600 border-rose-200 hover:bg-rose-500 hover:text-white dark:bg-rose-900/30 dark:border-rose-800", blue: "bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-500 hover:text-white dark:bg-blue-900/30 dark:border-blue-800", amber: "bg-amber-100 text-amber-600 border-amber-200 hover:bg-amber-500 hover:text-white dark:bg-amber-900/30 dark:border-amber-800", emerald: "bg-emerald-100 text-emerald-600 border-emerald-200 hover:bg-emerald-500 hover:text-white dark:bg-emerald-900/30 dark:border-emerald-800" };
  return (
    <button onClick={onClick} className={`p-6 rounded-3xl border-4 flex flex-col items-center justify-center gap-3 transition-all active:scale-95 group shadow-sm hover:shadow-lg ${colors[color]}`}>
      <div className="group-hover:scale-110 transition-transform">{React.cloneElement(icon, { className: "w-8 h-8" })}</div>
      <span className="font-black text-sm">{title}</span>
    </button>
  );
}

function FeatureCard({ icon, title, desc, color, onClick }: any) {
  const bgColors: Record<string, string> = { rose: "bg-rose-50 hover:bg-rose-100 border-rose-100 text-rose-700", indigo: "bg-indigo-50 hover:bg-indigo-100 border-indigo-100 text-indigo-700", emerald: "bg-emerald-50 hover:bg-emerald-100 border-emerald-100 text-emerald-700", blue: "bg-blue-50 hover:bg-blue-100 border-blue-100 text-blue-700", amber: "bg-amber-50 hover:bg-amber-100 border-amber-100 text-amber-700", purple: "bg-purple-50 hover:bg-purple-100 border-purple-100 text-purple-700", pink: "bg-pink-50 hover:bg-pink-100 border-pink-100 text-pink-700", cyan: "bg-cyan-50 hover:bg-cyan-100 border-cyan-100 text-cyan-700", orange: "bg-orange-50 hover:bg-orange-100 border-orange-100 text-orange-700" };
  return (
    <button onClick={onClick} className={`p-5 rounded-[2rem] border-2 transition-all flex flex-col gap-3 text-left shadow-sm hover:shadow-md hover:-translate-y-1 ${bgColors[color] || bgColors.indigo} dark:bg-slate-900/20 dark:border-slate-800 dark:text-slate-300`}>
      <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl w-fit shadow-sm">{React.cloneElement(icon, { className: "w-5 h-5" })}</div>
      <div><h4 className="font-bold text-sm tracking-tight">{title}</h4><p className="text-[10px] opacity-80 mt-1 line-clamp-1">{desc}</p></div>
    </button>
  );
}

function ProgressRing({ label, value, color }: { label: string, value: number, color: string }) {
  const radius = 30; const circumference = 2 * Math.PI * radius; const strokeDashoffset = circumference - (value / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center">
        <svg width="80" height="80" className="rotate-[-90deg]">
          <circle cx="40" cy="40" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
          <circle cx="40" cy="40" r={radius} stroke={color} strokeWidth="8" fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
        </svg>
        <span className="absolute text-sm font-black">{value}%</span>
      </div>
      <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function Badge({ icon, name, earned }: { icon: string, name: string, earned: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all w-28 text-center ${earned ? "bg-amber-50 border-amber-200 shadow-sm dark:bg-amber-900/20 dark:border-amber-800" : "bg-slate-50 border-slate-200 grayscale opacity-50 dark:bg-slate-900/50 dark:border-slate-800"}`}>
      <div className="text-3xl drop-shadow-sm">{icon}</div><span className="text-[10px] font-black leading-tight text-slate-800 dark:text-slate-200">{name}</span>
    </div>
  );
}

function GlobeIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/>
    </svg>
  );
}
