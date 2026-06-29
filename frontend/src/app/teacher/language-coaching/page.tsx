"use client";

import React, { useState, useEffect, useRef } from "react";
import PortalLayout from "@/components/PortalLayout";
import { 
  Languages, 
  Mic, 
  PlayCircle, 
  TrendingUp,
  MessageCircle,
  Headphones,
  Star,
  Activity,
  CheckCircle2,
  Volume2,
  Sparkles,
  Bot,
  User,
  BookA,
  Award,
  X,
  Send,
  ArrowRight
} from "lucide-react";

type ChatMessage = { sender: "ai" | "user"; text: string; audio?: string };

export default function LanguageCoachingPage() {
  const [activeTab, setActiveTab] = useState<"roleplay" | "pronunciation" | "tanglish">("roleplay");
  const [toastMsg, setToastMsg] = useState("");
  
  // Audio context refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);

  // Mic state
  const [isRecording, setIsRecording] = useState(false);
  const [waveHeights, setWaveHeights] = useState<number[]>([20, 40, 60, 40, 20]);

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: "ai", text: "Hi! Enna help venum? You can talk to me in Tamil or English! 😊" },
  ]);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Roleplay Modal state
  const [activeRoleplay, setActiveRoleplay] = useState<any | null>(null);
  const [roleplayStep, setRoleplayStep] = useState(0);

  // Scroll Ref for jumping to chat
  const interactiveHubRef = useRef<HTMLDivElement>(null);

  // Handle Chat Scroll
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      showToast("Speech synthesis not supported in this browser.");
    }
  };

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      mediaStreamRef.current = stream;
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64; // Low res for simple visualizer
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateWaveform = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Pick a few frequencies to render
        const newHeights = [
          Math.max(10, dataArray[2] / 2.5),
          Math.max(20, dataArray[4] / 2),
          Math.max(15, dataArray[6] / 1.5),
          Math.max(20, dataArray[8] / 2),
          Math.max(10, dataArray[10] / 2.5),
        ];
        
        setWaveHeights(newHeights);
        animationRef.current = requestAnimationFrame(updateWaveform);
      };

      updateWaveform();
      setIsRecording(true);
      showToast("Microphone is on! Start speaking.");

    } catch (err) {
      console.error("Error accessing mic:", err);
      showToast("Please allow microphone permissions to practice! 🎙️");
    }
  };

  const stopMic = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    mediaStreamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    
    setIsRecording(false);
    setWaveHeights([10, 20, 30, 20, 10]);
    showToast("Great job! Your voice sounds confident! ⭐");
  };

  const toggleRecord = () => {
    if (isRecording) {
      stopMic();
    } else {
      startMic();
    }
  };

  // Cleanup mic on unmount
  useEffect(() => {
    return () => {
      if (isRecording) stopMic();
    };
  }, [isRecording]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");

    // Simulate AI response
    setTimeout(() => {
      let reply = "That's a good try! Let's practice saying that in English together.";
      let audioTxt = "That's a good try! Let's practice saying that in English together.";
      
      if (userMsg.toLowerCase().includes("bank") && userMsg.toLowerCase().includes("leave")) {
        reply = "Great question! You can ask: \n\n\"Is the bank closed tomorrow?\"";
        audioTxt = "Is the bank closed tomorrow?";
      } else if (userMsg.toLowerCase().includes("hello") || userMsg.toLowerCase().includes("hi")) {
        reply = "Hello! Epdi irukkinga? Ready to practice some English today?";
      }

      setChatMessages(prev => [...prev, { sender: "ai", text: reply, audio: audioTxt }]);
    }, 1000);
  };
  
  const stats = [
    { label: "Sentences Spoken", value: "245", icon: <MessageCircle />, color: "blue", trend: "+12 Today" },
    { label: "Fearless Badges", value: "14", icon: <Star />, color: "yellow", trend: "Top 10%" },
    { label: "New Words Used", value: "86", icon: <CheckCircle2 />, color: "emerald", trend: "Vocab Growing" },
    { label: "Grammar Flow", value: "82%", icon: <TrendingUp />, color: "fuchsia", trend: "Improving!" },
  ];

  const roleplays = [
    { 
      id: 1, 
      title: "At the Bus Stand", 
      tamil: "பேருந்து நிலையத்தில்", 
      desc: "Ask for the correct bus route.", 
      diff: "Easy", 
      emoji: "🚌",
      dialogues: [
        { char: "You", txt: "Excuse me, does this bus go to Gandhipuram?" },
        { char: "Conductor", txt: "No, this goes to Singanallur. You need bus number 11." },
        { char: "You", txt: "Thank you so much!" }
      ]
    },
    { 
      id: 2, 
      title: "In a Job Interview", 
      tamil: "நேர்காணலில்", 
      desc: "Introduce yourself confidently.", 
      diff: "Medium", 
      emoji: "💼",
      dialogues: [
        { char: "Interviewer", txt: "Please introduce yourself." },
        { char: "You", txt: "Hi, I am Arjun. I recently completed my schooling and I am eager to learn." },
        { char: "Interviewer", txt: "That is wonderful, Arjun!" }
      ]
    },
    { 
      id: 3, 
      title: "Visiting the Doctor", 
      tamil: "மருத்துவரிடம்", 
      desc: "Explain your fever and cold.", 
      diff: "Easy", 
      emoji: "🏥",
      dialogues: [
        { char: "Doctor", txt: "What seems to be the problem today?" },
        { char: "You", txt: "I have had a mild fever and a cold since yesterday." },
        { char: "Doctor", txt: "Let me check your temperature. Take this medicine twice a day." }
      ]
    },
  ];

  return (
    <PortalLayout
      title="Spoken English Hub! 🗣️"
      subtitle="Speak fearlessly! Learn English using Tamil."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          
          {/* Tanglish Hero Banner */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 p-8 text-white shadow-xl shadow-indigo-500/20 border-4 border-indigo-200">
            <div className="absolute top-0 right-0 w-64 h-full bg-white/10 skew-x-12 translate-x-16"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-300 rounded-full blur-2xl opacity-40"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
              <div className="p-4 bg-white/20 backdrop-blur-md text-white rounded-3xl shadow-lg shrink-0 border-2 border-white/30 relative">
                <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-1 rounded-full shadow-sm">AI Tutor</div>
                <Bot className="w-12 h-12" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-md mb-2">
                  "Hello, epdi irukkinga?"
                </h2>
                <p className="text-indigo-50 font-bold max-w-lg mb-4 text-sm leading-relaxed">
                  Don't worry about perfect grammar! Speak in <span className="bg-white/20 px-2 py-0.5 rounded-md text-yellow-300">Tanglish</span> or Tamil. 
                  Our AI partner will understand you and teach you the exact English words to use. 
                  Mistakes are just steps to learning!
                </p>
                
                <button 
                  onClick={() => {
                    setActiveTab("tanglish");
                    interactiveHubRef.current?.scrollIntoView({ behavior: "smooth" });
                  }} 
                  className="px-6 py-3 bg-white text-indigo-600 font-black text-sm rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  Chat with Tanglish AI Now
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className={`bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-lg border-4 border-slate-100 dark:border-slate-700 flex flex-col items-center text-center group hover:-translate-y-2 hover:border-${stat.color}-300 hover:shadow-${stat.color}-500/20 transition-all`}>
                <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-100 text-${stat.color}-500 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-inner`}>
                  {React.cloneElement(stat.icon as React.ReactElement, { className: "w-6 h-6" })}
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1 leading-none">{stat.value}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
                <div className={`text-[9px] font-black bg-${stat.color}-50 text-${stat.color}-600 px-2 py-1 rounded-md`}>
                  {stat.trend}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Hub */}
          <div ref={interactiveHubRef} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-lg border-4 border-slate-100 dark:border-slate-700">
            <div className="flex flex-wrap gap-2 mb-8 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700">
              <button 
                onClick={() => setActiveTab("roleplay")}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  activeTab === "roleplay" ? "bg-white dark:bg-slate-800 text-sky-600 shadow-sm border-2 border-slate-200 dark:border-slate-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <MessageCircle className="w-4 h-4" /> Daily Roleplays
              </button>
              <button 
                onClick={() => setActiveTab("pronunciation")}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  activeTab === "pronunciation" ? "bg-white dark:bg-slate-800 text-rose-600 shadow-sm border-2 border-slate-200 dark:border-slate-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Activity className="w-4 h-4" /> Pronunciation Lab
              </button>
            </div>

            {/* Roleplay Tab */}
            {activeTab === "roleplay" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-slate-700 dark:text-slate-200 text-lg">Practical Situations</h3>
                  <span className="text-xs font-bold text-slate-400">Speak & Learn</span>
                </div>
                
                {roleplays.map((rp) => (
                  <div key={rp.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-sky-300 bg-sky-50/30 hover:bg-sky-50 dark:bg-slate-900/50 transition-all cursor-pointer group">
                    <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center text-2xl shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                      {rp.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-base font-black text-slate-800 dark:text-slate-100">{rp.title}</h4>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md">
                          {rp.diff}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-sky-600 dark:text-sky-400 mb-1">{rp.tamil}</p>
                      <p className="text-xs font-bold text-slate-500">{rp.desc}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setActiveRoleplay(rp);
                        setRoleplayStep(0);
                      }} 
                      className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-black text-white bg-sky-500 hover:bg-sky-600 shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <PlayCircle className="w-4 h-4" /> Start
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pronunciation Lab Tab */}
            {activeTab === "pronunciation" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                  <h3 className="font-black text-slate-700 dark:text-slate-200 text-xl mb-2">Speak & Match</h3>
                  <p className="text-sm font-bold text-slate-500">
                    Don't worry about perfect accents! We focus on clarity. Listen and repeat.
                  </p>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-700 mb-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Sentence</span>
                    <button 
                      onClick={() => speakText("Where is the nearest hospital?")}
                      className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-2xl font-black text-slate-800 dark:text-slate-100 text-center mb-2">
                    "Where is the nearest hospital?"
                  </div>
                  <div className="text-sm font-bold text-rose-500 text-center">
                    "அருகில் உள்ள மருத்துவமனை எங்குள்ளது?"
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="h-24 w-full max-w-sm flex items-end justify-center gap-1.5 mb-6">
                    {waveHeights.map((h, i) => (
                      <div 
                        key={i} 
                        className={`w-3 rounded-t-xl transition-all duration-75 ${isRecording ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </div>

                  <button 
                    onClick={toggleRecord}
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all ${
                      isRecording 
                        ? 'bg-rose-100 border-4 border-rose-500 text-rose-600 animate-pulse' 
                        : 'bg-rose-500 border-4 border-rose-200 text-white hover:bg-rose-600 hover:border-rose-300'
                    }`}
                  >
                    <Mic className={`w-8 h-8 ${isRecording ? 'animate-bounce' : ''}`} />
                  </button>
                  <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">
                    {isRecording ? 'Recording... Tap to stop' : 'Tap to enable real microphone'}
                  </p>
                </div>
              </div>
            )}

            {/* Tanglish AI Chat Tab */}
            {activeTab === "tanglish" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[450px] flex flex-col bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden relative">
                <div className="bg-white dark:bg-slate-800 p-4 border-b-2 border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-white text-sm">Maya (AI English Partner)</h4>
                    <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online - Speaks Tanglish
                    </p>
                  </div>
                </div>
                
                <div ref={chatScrollRef} className="flex-1 p-6 overflow-y-auto space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex items-start gap-3 w-5/6 ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === "user" ? "bg-slate-200 text-slate-500" : "bg-indigo-100 text-indigo-500"}`}>
                        {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      
                      <div className={`p-4 rounded-2xl shadow-sm border-2 ${
                        msg.sender === "user" 
                          ? "bg-indigo-500 text-white rounded-tr-sm border-indigo-500" 
                          : "bg-white dark:bg-slate-800 rounded-tl-sm border-slate-200 dark:border-slate-700"
                      }`}>
                        {/* Process AI messages with potential audio sections nicely */}
                        {msg.sender === "ai" && msg.text.includes("\n\n") ? (
                          <>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">{msg.text.split("\n\n")[0]}</p>
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center justify-between group">
                              <span className="font-black text-indigo-700 dark:text-indigo-300">{msg.text.split("\n\n")[1]}</span>
                              {msg.audio && (
                                <button onClick={() => speakText(msg.audio as string)} className="text-indigo-400 hover:text-indigo-600 p-1 bg-white rounded-lg shadow-sm">
                                   <Volume2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <p className="text-xs font-bold text-slate-500 mt-2">Try saying it aloud!</p>
                          </>
                        ) : (
                          <p className={`text-sm font-bold ${msg.sender === "user" ? "text-white" : "text-slate-700 dark:text-slate-200"}`}>{msg.text}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleChatSubmit} className="p-4 bg-white dark:bg-slate-800 border-t-2 border-slate-200 dark:border-slate-700 flex gap-2">
                  <button type="button" onClick={() => showToast("Microphone input coming soon for chat!")} className="p-3 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 transition-colors">
                    <Mic className="w-5 h-5" />
                  </button>
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type in Tanglish or English..." 
                    className="flex-1 bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-white border-none rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 placeholder-slate-400" 
                  />
                  <button type="submit" disabled={!chatInput.trim()} className="p-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 transition-colors">
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-[2.5rem] shadow-lg border-4 border-emerald-200 dark:border-emerald-800 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-200/50 dark:bg-emerald-800/20 rounded-bl-full pointer-events-none"></div>
            
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-6 flex items-center gap-2">
               <BookA className="w-4 h-4" /> Word of the Day
            </h3>
            
            <div className="text-center">
              <h4 className="text-4xl font-black text-slate-800 dark:text-slate-100 mb-2">Opportunity</h4>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mb-4">வாய்ப்பு (Vaaippu)</p>
              
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl text-left shadow-sm border-2 border-emerald-100 dark:border-slate-700 mb-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Example</span>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">"This is a great <span className="text-emerald-500">opportunity</span> to learn English."</p>
              </div>

              <button 
                onClick={() => speakText("This is a great opportunity to learn English.")}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-black shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Volume2 className="w-4 h-4" /> Listen to Pronunciation
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-lg border-4 border-slate-100 dark:border-slate-700">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
               <Award className="w-5 h-5 text-amber-500" /> Recent Badges
            </h3>
            <div className="space-y-3">
               {[
                 { name: "Fearless Speaker", desc: "Spoke 10 sentences today", icon: "🦁", color: "amber" },
                 { name: "Hospital Helper", desc: "Completed Doctor Roleplay", icon: "🏥", color: "rose" },
                 { name: "Tanglish Master", desc: "Used AI bridge 5 times", icon: "🤖", color: "indigo" }
               ].map((b, i) => (
                 <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl bg-${b.color}-50/50 border border-${b.color}-100`}>
                    <div className="text-3xl drop-shadow-sm">{b.icon}</div>
                    <div>
                      <div className="font-black text-slate-700 text-sm">{b.name}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{b.desc}</div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Roleplay Active Modal */}
      {activeRoleplay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 max-w-2xl w-full rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-slate-100 dark:border-slate-700">
            <div className="bg-sky-50 dark:bg-slate-900 p-6 flex justify-between items-center border-b-2 border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{activeRoleplay.emoji}</div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white">{activeRoleplay.title}</h3>
                  <p className="text-sm font-bold text-sky-600 dark:text-sky-400">{activeRoleplay.tamil}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveRoleplay(null)}
                className="p-3 bg-white dark:bg-slate-800 text-slate-400 rounded-full hover:text-sky-600 hover:scale-110 transition-all shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8">
              <div className="space-y-6">
                {activeRoleplay.dialogues.map((dlg: any, i: number) => (
                  <div 
                    key={i} 
                    className={`flex items-start gap-4 transition-all duration-500 ${
                      i > roleplayStep ? "opacity-30 blur-sm pointer-events-none" : "opacity-100 blur-none"
                    } ${i === roleplayStep ? "scale-[1.02]" : ""}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-inner font-black text-sm border-2 ${
                      dlg.char === "You" 
                        ? "bg-indigo-100 text-indigo-600 border-indigo-200" 
                        : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
                    }`}>
                      {dlg.char === "You" ? <User className="w-5 h-5" /> : dlg.char[0]}
                    </div>
                    <div className={`p-4 rounded-2xl w-full border-2 shadow-sm ${
                      dlg.char === "You"
                        ? "bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800"
                        : "bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                    }`}>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">{dlg.char}</span>
                      <div className="flex items-center justify-between">
                        <p className="text-base font-bold text-slate-800 dark:text-slate-100">{dlg.txt}</p>
                        <button 
                          onClick={() => speakText(dlg.txt)}
                          className={`p-2 rounded-lg transition-colors ${
                            dlg.char === "You" ? "text-indigo-500 hover:bg-indigo-100" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                          }`}
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                {roleplayStep < activeRoleplay.dialogues.length - 1 ? (
                  <button 
                    onClick={() => setRoleplayStep(s => s + 1)}
                    className="px-6 py-3 bg-sky-500 text-white font-black rounded-xl hover:bg-sky-600 active:scale-95 transition-all flex items-center gap-2"
                  >
                    Next Line <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      showToast("Awesome! You completed the roleplay! 🎉");
                      setActiveRoleplay(null);
                    }}
                    className="px-8 py-3 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 active:scale-95 transition-all flex items-center gap-2"
                  >
                    Finish <CheckCircle2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 z-[60]">
          <span className="font-bold text-sm">{toastMsg}</span>
          <button onClick={() => setToastMsg("")} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </PortalLayout>
  );
}
