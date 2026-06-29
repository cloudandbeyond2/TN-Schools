"use client";

import React, { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { 
  BookA, 
  Languages, 
  Mic, 
  PlayCircle, 
  TrendingUp,
  Users,
  Award,
  Video,
  X,
  MessageCircle,
  Headphones,
  Star
} from "lucide-react";

export default function LanguageCoachingPage() {
  const [activeLang, setActiveLang] = useState<"Bilingual" | "Tamil" | "English">("Bilingual");
  const [sessions, setSessions] = useState([
    { id: 1, time: "Today, 2:00 PM", title: "10th Std - English Speech Prep 🗣️", students: 24, active: true, lang: "English" },
    { id: 2, time: "Tomorrow, 10:30 AM", title: "12th Std - Tamil Literature Review 📚", students: 30, active: false, lang: "Tamil" }
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [connecting, setConnecting] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get("title") as string;
    const time = formData.get("time") as string;
    const students = parseInt(formData.get("students") as string) || 0;
    const lang = formData.get("lang") as string;
    
    setSessions([...sessions, { id: Date.now(), title, time, students, active: false, lang }]);
    setModalOpen(false);
    showToast("Woohoo! 🎉 New language session scheduled!");
  };

  const startLiveSession = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      showToast("Live session started! Have fun talking! 🎙️");
    }, 2000);
  };
  
  const stats = [
    { label: "Active Students", value: "142", icon: <Users />, color: "blue" },
    { label: "Speaking Stars", value: "850", icon: <Star />, color: "yellow" },
    { label: "Listening Hours", value: "320h", icon: <Headphones />, color: "fuchsia" },
    { label: "Word Power", value: "Super!", icon: <TrendingUp />, color: "emerald" },
  ];

  const filteredSessions = activeLang === "Bilingual" ? sessions : sessions.filter(s => s.lang === activeLang);

  return (
    <PortalLayout
      title="Language Adventure Hub! 🌍"
      subtitle="Learn Tamil and English with fun games and stories!"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Overview & Stats */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Playful Header Banner */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-sky-400 to-indigo-500 p-8 text-white shadow-xl shadow-sky-500/20 border-4 border-sky-200">
            <div className="absolute top-0 right-0 w-64 h-full bg-white/20 skew-x-12 translate-x-16"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-300 rounded-full blur-xl opacity-50"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white text-sky-500 rounded-2xl shadow-lg rotate-[-5deg]">
                  <Languages className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-md">Language Masters!</h2>
              </div>
              <p className="text-sky-50 font-bold max-w-lg mb-8 text-base">
                Let's learn new words! Practice speaking in Tamil and English, listen to cool stories, and become a Language Master!
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button onClick={startLiveSession} className="px-6 py-3 bg-white text-sky-600 font-black text-sm rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Video className="w-5 h-5 text-sky-500" />
                  {connecting ? "Connecting..." : "Join Live Class!"}
                </button>
                <button onClick={() => showToast("Opening the treasure map of lessons! 🗺️")} className="px-6 py-3 bg-sky-600/50 backdrop-blur-sm border-2 border-sky-300 text-white font-black text-sm rounded-2xl hover:bg-sky-600 hover:scale-105 active:scale-95 transition-all shadow-sm">
                  View Lesson Map
                </button>
              </div>
            </div>
          </div>

          {/* Playful Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className={`bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg border-4 border-slate-100 dark:border-slate-700 flex flex-col items-center text-center group hover:-translate-y-2 hover:shadow-xl transition-all`}>
                <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-100 text-${stat.color}-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-transform shadow-inner`}>
                  {React.cloneElement(stat.icon as React.ReactElement, { className: "w-7 h-7" })}
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">{stat.value}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Recent Resources */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-lg border-4 border-indigo-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-black text-indigo-900 dark:text-indigo-100 flex items-center gap-3">
                 <BookA className="w-6 h-6 text-indigo-500" />
                 Fun Stories & Games
               </h3>
               
               {/* Language Toggle */}
               <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                 {["Bilingual", "Tamil", "English"].map(l => (
                    <button 
                       key={l}
                       onClick={() => setActiveLang(l as any)}
                       className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeLang === l ? 'bg-white dark:bg-slate-600 text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                    >
                       {l}
                    </button>
                 ))}
               </div>
            </div>
            
            <div className="space-y-4">
              {[
                { title: "English Phonics: The Magic 'E'", lang: "English", type: "Game 🎮", time: "12 mins", color: "blue" },
                { title: "Tamil Alphabet Song 🎵", lang: "Tamil", type: "Video 🎬", time: "5 mins", color: "orange" },
                { title: "Hello World! Greetings Practice", lang: "Bilingual", type: "Audio 🎧", time: "15 mins", color: "emerald" },
              ].filter(r => activeLang === "Bilingual" || r.lang === activeLang).map((res, i) => (
                <div key={i} className={`flex items-center gap-5 p-4 rounded-2xl border-2 border-${res.color}-100 hover:border-${res.color}-300 bg-${res.color}-50/50 hover:bg-${res.color}-50 dark:bg-slate-900/50 transition-all cursor-pointer group`}>
                  <div className={`w-12 h-12 rounded-2xl bg-${res.color}-200 text-${res.color}-600 flex items-center justify-center shrink-0 shadow-sm`}>
                    <PlayCircle className="w-6 h-6 group-hover:scale-125 transition-transform" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-base font-black text-slate-800 dark:text-slate-200 group-hover:text-${res.color}-600 transition-colors`}>{res.title}</h4>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border-2 border-${res.color}-200 bg-white dark:bg-slate-800 uppercase tracking-wider text-${res.color}-600`}>{res.lang}</span>
                      <span className="text-xs font-bold text-slate-500">{res.type} • {res.time}</span>
                    </div>
                  </div>
                  <button onClick={() => showToast(`Loading ${res.title}... Let's go! 🚀`)} className={`px-4 py-2 rounded-xl text-sm font-black text-white bg-${res.color}-500 hover:bg-${res.color}-600 shadow-md active:scale-95 transition-all`}>
                    Play!
                  </button>
                </div>
              ))}
              {filteredSessions.length === 0 && (
                 <div className="text-center py-8 text-slate-400 font-bold">
                    No resources found for {activeLang}.
                 </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Upcoming Sessions */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-lg border-4 border-fuchsia-100 dark:border-slate-700 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-fuchsia-100 dark:bg-fuchsia-900/20 rounded-bl-full pointer-events-none"></div>
            
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
               <MessageCircle className="w-6 h-6 text-fuchsia-500" />
               Live Chat Sessions
            </h3>
            
            <div className="space-y-6">
              {filteredSessions.map((session, idx) => (
                <div key={session.id} className="relative pl-8 before:absolute before:left-3 before:top-3 before:w-1 before:h-full before:bg-fuchsia-100 dark:before:bg-slate-700 last:before:h-0">
                  {session.active ? (
                    <div className="absolute left-[8px] top-2 w-4 h-4 rounded-full bg-fuchsia-500 ring-4 ring-fuchsia-200 dark:ring-fuchsia-900/50 animate-pulse"></div>
                  ) : (
                    <div className="absolute left-[10px] top-2 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  )}
                  <div className={`bg-white dark:bg-slate-900 border-2 ${session.active ? 'border-fuchsia-300 shadow-lg' : 'border-slate-100 dark:border-slate-700'} p-5 rounded-2xl transition-all hover:scale-[1.02]`}>
                    <div className="flex justify-between items-center mb-2">
                       <div className={`text-xs font-black ${session.active ? 'text-fuchsia-500' : 'text-slate-500'}`}>{session.time}</div>
                       <div className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${session.lang === 'English' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>{session.lang}</div>
                    </div>
                    <h4 className="text-base font-black text-slate-800 dark:text-slate-100 mb-3 leading-tight">{session.title}</h4>
                    <div className="flex justify-between items-center mt-2">
                       <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                         <Users className="w-4 h-4" /> {session.students} Friends joining
                       </p>
                       {session.active && (
                          <button onClick={() => showToast("Joining the fun! 🎉")} className="px-3 py-1.5 bg-fuchsia-500 text-white text-xs font-black rounded-lg hover:bg-fuchsia-600 active:scale-95 transition-transform">
                             Join Now
                          </button>
                       )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredSessions.length === 0 && (
                 <div className="text-center py-4 text-slate-400 font-bold">
                    No sessions scheduled for {activeLang}.
                 </div>
              )}
            </div>
            
            <button onClick={() => setModalOpen(true)} className="w-full mt-8 py-4 rounded-2xl border-4 border-dashed border-fuchsia-200 text-sm font-black text-fuchsia-500 hover:text-white hover:bg-fuchsia-500 hover:border-fuchsia-500 transition-all active:scale-95">
              + Plan a New Fun Session!
            </button>
          </div>
        </div>

      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl shadow-sky-500/20 text-base font-bold animate-[bounce_0.5s_ease-out] z-50 flex items-center gap-2 border-4 border-sky-500/30">
          <div className="w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
          {toastMsg}
        </div>
      )}

      {/* Connecting Overlay */}
      {connecting && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
          <div className="w-20 h-20 border-8 border-sky-500 border-t-yellow-400 rounded-full animate-spin mb-6"></div>
          <h2 className="text-white text-3xl font-black mb-2">Getting the classroom ready!</h2>
          <p className="text-sky-200 text-lg font-bold">Warming up the microphones... 🎙️</p>
        </div>
      )}

      {/* Add Session Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-md shadow-2xl border-4 border-fuchsia-100 dark:border-slate-700 animate-in zoom-in-95 p-2">
            <div className="flex justify-between items-center p-6 bg-fuchsia-50 dark:bg-slate-900 rounded-[2rem] mb-4">
              <h3 className="text-xl font-black text-fuchsia-600 dark:text-fuchsia-400">Plan a New Session</h3>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-fuchsia-500 hover:scale-110 transition-all shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSession} className="p-4 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">What will we learn? 📚</label>
                <input required name="title" type="text" placeholder="e.g., Storytime in Tamil!" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-fuchsia-200 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Language 🗣️</label>
                  <select required name="lang" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-fuchsia-200 transition-all">
                     <option value="English">English</option>
                     <option value="Tamil">Tamil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">When? ⏰</label>
                  <input required name="time" type="text" placeholder="e.g., Tomorrow, 10 AM" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-fuchsia-200 transition-all" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-2 border-slate-200 dark:border-slate-700">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 transition-all shadow-lg shadow-pink-500/30 active:scale-95">
                  Schedule It!
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
