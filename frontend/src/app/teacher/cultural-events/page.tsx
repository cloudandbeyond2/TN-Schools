"use client";

import React, { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { 
  Palette,
  Music,
  Tent,
  Ticket,
  MapPin,
  CalendarHeart,
  X,
  Sparkles,
  Heart,
  Camera,
  Star
} from "lucide-react";

export default function CulturalEventsPage() {
  const [events, setEvents] = useState([
    { 
      id: 1,
      title: "Pongal Vizha 2026! 🌾", 
      date: "Jan 12, 2026", 
      location: "Main Grounds", 
      status: "Upcoming",
      icon: <Tent className="w-6 h-6" />,
      color: "orange" 
    },
    { 
      id: 2,
      title: "Annual Arts Fest 🎨", 
      date: "Mar 05, 2026", 
      location: "Auditorium", 
      status: "Planning",
      icon: <Palette className="w-6 h-6" />,
      color: "purple" 
    },
    { 
      id: 3,
      title: "Inter-School Choir 🎤", 
      date: "Apr 20, 2026", 
      location: "City Hall", 
      status: "Open Now!",
      icon: <Music className="w-6 h-6" />,
      color: "blue" 
    }
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setModalOpen(false);
    showToast("Yay! You are registered for the event! 🎉");
  };

  return (
    <PortalLayout
      title="Culture & Fun! 🎭"
      subtitle="Join the dance, art, and music festivals!"
    >
      <div className="flex flex-col gap-8">
        
        {/* Playful Featured Event Hero */}
        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-rose-200 min-h-[350px] flex flex-col justify-end p-8 sm:p-12">
           {/* Vibrant Background */}
           <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-rose-500 to-fuchsia-600 z-0"></div>
           
           {/* Fun shapes */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 mix-blend-overlay"></div>
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 mix-blend-overlay"></div>
           
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
           
           <div className="absolute top-10 right-10 rotate-12 opacity-80 z-20">
              <Camera className="w-24 h-24 text-white/30" />
           </div>
           
           <div className="relative z-20 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-2 mb-4 font-black tracking-widest text-xs uppercase rounded-2xl shadow-lg rotate-[-2deg] border-2 border-yellow-200">
                 <Star className="w-4 h-4" /> The Big Event!
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-lg">Tamil Heritage Month ✨</h2>
              <p className="text-rose-100 font-bold mb-8 text-sm md:text-lg leading-relaxed drop-shadow-md">
                 Let's celebrate our rich culture together! There will be yummy food, beautiful dances, traditional games, and lots of fun! 
              </p>
              
              <div className="flex flex-wrap gap-4">
                 <button onClick={() => setModalOpen(true)} className="px-8 py-4 bg-white text-rose-600 font-black text-sm rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 border-4 border-rose-100">
                    Join the Fun! 🎫
                 </button>
                 <button onClick={() => showToast("Downloading the fun schedule! 📅")} className="px-8 py-4 bg-rose-900/40 backdrop-blur-md border-4 border-rose-300/30 text-white font-black text-sm rounded-2xl transition-all hover:bg-rose-900/60 shadow-lg">
                    See What's Happening
                 </button>
              </div>
           </div>
        </div>

        {/* Upcoming Events Grid */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border-4 border-purple-100 dark:border-slate-700">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                 <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl rotate-[-5deg]">
                    <CalendarHeart className="w-6 h-6" />
                 </div>
                 Cool Upcoming Stuff
              </h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {events.map((evt, i) => (
                 <div key={i} className={`p-6 rounded-[2.5rem] border-4 border-${evt.color}-100 dark:border-slate-700 hover:border-${evt.color}-300 bg-${evt.color}-50/50 hover:bg-${evt.color}-50 dark:bg-slate-900/50 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 flex flex-col h-full group`}>
                    
                    <div className="flex justify-between items-start mb-6">
                       <div className={`w-16 h-16 rounded-2xl bg-${evt.color}-200 text-${evt.color}-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform shadow-inner`}>
                          {evt.icon}
                       </div>
                       <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl border-2 bg-white dark:bg-slate-800 text-${evt.color}-600 border-${evt.color}-200 shadow-sm rotate-3`}>
                          {evt.status}
                       </span>
                    </div>
                    
                    <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-4">{evt.title}</h4>
                    
                    <div className="space-y-3 mt-auto text-sm font-bold text-slate-500 bg-white dark:bg-slate-800 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700">
                       <div className="flex items-center gap-3">
                          <div className={`p-1.5 bg-${evt.color}-100 rounded-lg text-${evt.color}-600`}>
                             <CalendarHeart className="w-4 h-4" />
                          </div>
                          {evt.date}
                       </div>
                       <div className="flex items-center gap-3">
                          <div className={`p-1.5 bg-${evt.color}-100 rounded-lg text-${evt.color}-600`}>
                             <MapPin className="w-4 h-4" />
                          </div>
                          {evt.location}
                       </div>
                    </div>
                    
                    <div className="mt-6">
                       <button onClick={() => showToast(`Let's go to ${evt.title}! 🏃‍♂️`)} className={`w-full py-3 rounded-2xl text-sm font-black text-white bg-${evt.color}-500 hover:bg-${evt.color}-600 transition-colors shadow-md shadow-${evt.color}-500/30 active:scale-95 flex items-center justify-center gap-2 border-b-4 border-${evt.color}-700`}>
                          <Ticket className="w-4 h-4" /> Get Tickets!
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        </div>

      </div>

      {/* Playful Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl shadow-rose-500/20 text-base font-bold animate-[bounce_0.5s_ease-out] z-50 flex items-center gap-3 border-4 border-rose-500/30">
          <Sparkles className="w-5 h-5 text-yellow-400 animate-spin-slow" />
          {toastMsg}
        </div>
      )}

      {/* Fun Register Students Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] w-full max-w-md shadow-2xl border-4 border-rose-200 dark:border-slate-700 animate-in zoom-in-95 p-3">
            <div className="flex justify-between items-center p-6 bg-rose-50 dark:bg-slate-900 rounded-[2.5rem] mb-6">
              <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">Join the Party!</h3>
              <button onClick={() => setModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 hover:scale-110 transition-all shadow-sm">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleRegister} className="p-4 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Which Event? 🎭</label>
                <select required name="event" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-4 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-300 transition-all">
                  <option value="Tamil Heritage Month">Tamil Heritage Month 🌟</option>
                  <option value="Pongal Vizha 2026">Pongal Vizha 2026 🌾</option>
                  <option value="Inter-School Choir">Inter-School Choir 🎤</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Class 🎒</label>
                  <input required name="class" type="text" placeholder="e.g., 9th A" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-4 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-300 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">How Many? 🧑‍🤝‍🧑</label>
                  <input required name="count" type="number" min="1" max="60" placeholder="10" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-4 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-300 transition-all" />
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-2 border-slate-200 dark:border-slate-700">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-4 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/30 active:scale-95 border-b-4 border-rose-700">
                  Register! 🎉
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
