"use client";

import React, { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import {
  FlaskConical,
  Flame,
  Droplets,
  Wind,
  ShieldAlert,
  Calendar,
  BookOpen,
  AlertTriangle,
  X,
  Sparkles,
  Zap,
  Eye,
  Microscope
} from "lucide-react";

export default function ChemistryLabPage() {
  const [experiments, setExperiments] = useState([
    { id: 1, title: "Volcano Eruption! 🌋", class: "11th Std", date: "Today, 11:30 AM", type: "Fun Reaction", color: "orange" },
    { id: 2, title: "Making Slime! 🦠", class: "12th Std", date: "Tomorrow, 09:00 AM", type: "Polymers", color: "emerald" },
    { id: 3, title: "Colorful Flames 🔥", class: "10th Std", date: "Wed, 14:00 PM", type: "Metals", color: "purple" },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [potionColor, setPotionColor] = useState("bg-purple-500");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleAddExperiment = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get("title") as string;
    const cls = formData.get("class") as string;
    const date = formData.get("date") as string;
    const type = formData.get("type") as string;
    
    setExperiments([...experiments, { id: Date.now(), title, class: cls, date, type, color: "blue" }]);
    setModalOpen(false);
    showToast("Woohoo! 🎉 New experiment scheduled!");
  };

  const safetyAlerts = [
    { msg: "Remember your safety goggles! 🥽", level: "warning" },
    { msg: "Don't mix the red and green potions! 💥", level: "critical" }
  ];

  return (
    <PortalLayout
      title="Magic Chemistry Lab! 🧪"
      subtitle="Mix potions, watch colors change, and learn science!"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Dashboard Panel */}
        <div className="lg:col-span-2 space-y-8">

          {/* Playful Header Banner */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-purple-500 to-fuchsia-600 p-8 text-white shadow-xl shadow-purple-500/20 border-4 border-purple-200">
            <div className="absolute right-0 top-0 opacity-30 transform translate-x-1/4 -translate-y-1/4 scale-150 pointer-events-none mix-blend-overlay">
              <FlaskConical className="w-64 h-64" />
            </div>
            
            {/* Bubbles animation effect (CSS not included but structure represents it) */}
            <div className="absolute top-10 left-10 w-4 h-4 rounded-full bg-white/40 animate-ping"></div>
            <div className="absolute top-20 left-1/2 w-6 h-6 rounded-full bg-white/30 animate-[ping_2s_infinite]"></div>
            <div className="absolute bottom-10 right-20 w-8 h-8 rounded-full bg-white/20 animate-pulse"></div>

            <div className="relative z-10">
              <h2 className="text-3xl font-black tracking-tight mb-3 flex items-center gap-3 drop-shadow-md">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl rotate-12">
                   <FlaskConical className="w-8 h-8 text-white" />
                </div>
                The Mixology Station
              </h2>
              <p className="text-purple-100 font-bold max-w-lg mb-8 text-base">
                Welcome to the coolest lab ever! Schedule fun experiments, check our magical ingredients, and remember: Safety First!
              </p>

              <div className="flex flex-wrap gap-4">
                <button onClick={() => {
                   const colors = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-yellow-500", "bg-pink-500"];
                   setPotionColor(colors[Math.floor(Math.random() * colors.length)]);
                   showToast("Mixed a new potion! 🫧");
                }} className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border-2 border-white/30 transition-all active:scale-95 cursor-pointer">
                  <div className={`w-12 h-12 rounded-full ${potionColor} flex items-center justify-center shadow-inner border-2 border-white/50 transition-colors duration-500`}>
                     <Sparkles className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-purple-100 uppercase tracking-widest">Mix Potion</div>
                    <div className="text-xl font-black text-white drop-shadow-sm">Click Me!</div>
                  </div>
                </button>
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border-2 border-white/30">
                  <div className="w-12 h-12 rounded-full bg-orange-400 flex items-center justify-center shadow-inner border-2 border-white/50">
                     <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-purple-100 uppercase tracking-widest">Bunsen Burners</div>
                    <div className="text-xl font-black text-white drop-shadow-sm">Ready! 🔥</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Experiments */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-lg border-4 border-teal-100 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                <div className="p-2 bg-teal-100 text-teal-600 rounded-xl rotate-[-5deg]">
                   <Calendar className="w-6 h-6" />
                </div>
                Cool Experiments!
              </h3>
              <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={() => showToast("Calendar view coming soon! 📅")} className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black text-sm rounded-2xl hover:bg-slate-200 transition-colors">Calendar</button>
                <button onClick={() => setModalOpen(true)} className="flex-1 sm:flex-none px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-teal-500/30 active:scale-95 transition-all">+ Add New</button>
              </div>
            </div>

            <div className="space-y-4">
              {experiments.map((exp, i) => (
                <div key={exp.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border-4 border-${exp.color}-100 dark:border-slate-700 hover:border-${exp.color}-300 bg-${exp.color}-50/50 hover:bg-${exp.color}-50 dark:bg-slate-900/50 transition-all group`}>
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 w-12 h-12 rounded-xl bg-${exp.color}-200 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                       <FlaskConical className={`w-6 h-6 text-${exp.color}-600`} />
                    </div>
                    <div>
                      <h4 className={`text-lg font-black text-slate-800 dark:text-slate-100 group-hover:text-${exp.color}-600 transition-colors`}>{exp.title}</h4>
                      <div className="text-sm font-bold text-slate-500 mt-1 flex items-center gap-2">
                        <span className={`text-${exp.color}-600 bg-${exp.color}-100 px-2 py-0.5 rounded-lg`}>{exp.class}</span> • {exp.date}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 flex items-center gap-3 pl-16 sm:pl-0">
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl border-2 border-${exp.color}-200 bg-white dark:bg-slate-800 text-${exp.color}-600 uppercase tracking-wider shadow-sm`}>
                      {exp.type}
                    </span>
                    <button onClick={() => showToast(`Reading instructions for ${exp.title} 📖`)} className={`w-10 h-10 flex items-center justify-center rounded-xl bg-${exp.color}-100 hover:bg-${exp.color}-200 text-${exp.color}-600 transition-colors active:scale-95`} title="Read Instructions">
                      <BookOpen className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Sidebar - Safety & Inventory */}
        <div className="space-y-8">

          {/* Safety Alerts */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-lg border-4 border-rose-100 dark:border-slate-700 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-rose-100 dark:bg-rose-900/20 rounded-bl-full pointer-events-none"></div>
            
            <h3 className="text-xl font-black text-rose-600 dark:text-rose-400 mb-6 flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-xl rotate-12">
                 <ShieldAlert className="w-6 h-6" />
              </div>
              Safety Rules!
            </h3>

            <div className="space-y-4">
              {safetyAlerts.map((alert, i) => (
                <div key={i} className={`p-4 rounded-2xl border-4 flex items-start gap-3 ${alert.level === 'critical'
                    ? 'bg-rose-50/80 border-rose-200 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800'
                    : 'bg-amber-50/80 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
                  } transition-transform hover:-translate-y-1`}>
                  <AlertTriangle className={`w-6 h-6 shrink-0 mt-0.5 ${alert.level === 'critical' ? 'animate-pulse' : ''}`} />
                  <p className="text-sm font-black leading-tight">{alert.msg}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Inventory Search */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-lg border-4 border-indigo-100 dark:border-slate-700">
            <h3 className="text-xl font-black text-indigo-900 dark:text-indigo-100 mb-6 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl rotate-[-12deg]">
                 <Droplets className="w-6 h-6" />
              </div>
              Find Ingredients
            </h3>

            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search for magic powders..."
                className="w-full bg-slate-50 dark:bg-slate-900 border-4 border-indigo-100 dark:border-slate-700 text-indigo-900 dark:text-indigo-100 rounded-3xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all shadow-inner"
              />
              <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => showToast("Opening the big book of chemicals! 📚")} className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-4 border-indigo-100 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all text-sm font-black text-indigo-600 dark:text-indigo-400 group">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                   <BookOpen className="w-6 h-6" />
                </div>
                Book of Secrets
              </button>
              <button onClick={() => showToast("Looking in the cupboards! 🔍")} className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-4 border-emerald-100 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all text-sm font-black text-emerald-600 dark:text-emerald-400 group">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                   <FlaskConical className="w-6 h-6" />
                </div>
                Cupboard Check
              </button>
            </div>
          </div>

        </div>

      </div>
      
      {/* Playful Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl shadow-purple-500/20 text-base font-bold animate-[bounce_0.5s_ease-out] z-50 flex items-center gap-3 border-4 border-purple-500/30">
          <div className="w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
          {toastMsg}
        </div>
      )}

      {/* Add Experiment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-md shadow-2xl border-4 border-teal-100 dark:border-slate-700 animate-in zoom-in-95 p-2">
            <div className="flex justify-between items-center p-6 bg-teal-50 dark:bg-slate-900 rounded-[2rem] mb-4">
              <h3 className="text-xl font-black text-teal-600 dark:text-teal-400">Plan a New Experiment!</h3>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-teal-500 hover:scale-110 transition-all shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddExperiment} className="p-4 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">What are we doing? 🔬</label>
                <input required name="title" type="text" placeholder="e.g., Elephant Toothpaste!" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-200 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Who's joining? 👥</label>
                  <input required name="class" type="text" placeholder="e.g., 9th Grade" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-200 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Category 🏷️</label>
                  <input required name="type" type="text" placeholder="e.g., Messy Fun" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-200 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">When? ⏰</label>
                <input required name="date" type="text" placeholder="e.g., Next Tuesday, 2 PM" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-200 transition-all" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-2 border-slate-200 dark:border-slate-700">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-500/30 active:scale-95">
                  Let's Go! 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
