"use client";

import React, { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { 
  PartyPopper, 
  CalendarDays, 
  Gift, 
  Cake,
  Clock,
  CheckCircle2,
  Users,
  X,
  Star,
  Music,
  Smile
} from "lucide-react";

export default function CelebrationsPage() {
  const [activeTab, setActiveTab] = useState("today");
  
  const [preparations, setPreparations] = useState([
    { id: 1, task: "Decorate Main Hall 🎈", assignedTo: "Art Club", status: "In Progress", color: "pink" },
    { id: 2, task: "Order Cake for Principal's B'day 🎂", assignedTo: "Admin Staff", status: "Completed", color: "emerald" },
    { id: 3, task: "Setup Audio System 🎵", assignedTo: "IT Support", status: "Pending", color: "amber" },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const task = formData.get("task") as string;
    const assignedTo = formData.get("assignedTo") as string;
    
    setPreparations([...preparations, { id: Date.now(), task: task + " ✨", assignedTo, status: "Pending", color: "blue" }]);
    setModalOpen(false);
    showToast("Awesome! New party task added! 🎉");
  };

  const cycleStatus = (id: number) => {
    setPreparations(preparations.map(p => {
      if (p.id === id) {
        let nextStatus = "Pending";
        let nextColor = "amber";
        if (p.status === "Pending") { nextStatus = "In Progress"; nextColor = "blue"; }
        else if (p.status === "In Progress") { nextStatus = "Completed"; nextColor = "emerald"; }
        showToast(`Task marked as ${nextStatus}! ${nextStatus === 'Completed' ? 'Great job! 🌟' : ''}`);
        return { ...p, status: nextStatus, color: nextColor };
      }
      return p;
    }));
  };

  return (
    <PortalLayout
      title="Party Central! 🥳"
      subtitle="Birthdays, festivals, and school fun!"
    >
      <div className="flex flex-col gap-8">
        
        {/* Playful Banner */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 text-white p-8 shadow-xl border-4 border-pink-200">
          <div className="absolute right-0 top-0 opacity-20 transform translate-x-1/4 -translate-y-1/4 scale-150 pointer-events-none mix-blend-overlay">
            <PartyPopper className="w-64 h-64" />
          </div>
          
          {/* Confetti simulation */}
          <div className="absolute top-10 left-10 w-3 h-3 bg-yellow-300 rounded-sm rotate-45 animate-bounce"></div>
          <div className="absolute top-20 left-1/3 w-3 h-3 bg-blue-300 rounded-full animate-ping"></div>
          <div className="absolute bottom-10 left-1/2 w-4 h-4 bg-emerald-300 rounded-sm rotate-12 animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-purple-300 rounded-full animate-bounce"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl font-black tracking-wider text-xs uppercase mb-4 border-2 border-white/30 rotate-[-2deg]">
                <Star className="w-4 h-4 text-yellow-300" /> Let's Celebrate!
              </div>
              <h2 className="text-4xl font-black tracking-tight mb-3 drop-shadow-md">Party Time! 🎈</h2>
              <p className="text-pink-50 font-bold max-w-xl text-base leading-relaxed">
                Check out all the fun stuff happening at school! Plan parties, sing happy birthday, and let's have a great time!
              </p>
            </div>
            <button onClick={() => showToast("Party planner opening soon! 🎊")} className="px-6 py-4 bg-yellow-400 text-yellow-900 font-black text-sm rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 flex items-center gap-3 shrink-0 border-4 border-yellow-200">
              <Gift className="w-6 h-6" /> Plan a Party!
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main List */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-lg border-4 border-rose-100 dark:border-slate-700 overflow-hidden">
            <div className="flex bg-rose-50 dark:bg-slate-900 p-2 gap-2">
              <button 
                onClick={() => setActiveTab("today")}
                className={`flex-1 px-6 py-4 text-base font-black flex items-center justify-center gap-2 rounded-2xl transition-all ${
                  activeTab === "today" 
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105" 
                    : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-rose-100 hover:text-rose-600 border-2 border-slate-100 dark:border-slate-700"
                }`}
              >
                <Smile className="w-5 h-5" /> Today's Fun!
              </button>
              <button 
                onClick={() => setActiveTab("week")}
                className={`flex-1 px-6 py-4 text-base font-black flex items-center justify-center gap-2 rounded-2xl transition-all ${
                  activeTab === "week" 
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105" 
                    : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-rose-100 hover:text-rose-600 border-2 border-slate-100 dark:border-slate-700"
                }`}
              >
                <CalendarDays className="w-5 h-5" /> Later This Week
              </button>
            </div>

            <div className="p-8">
              {activeTab === "today" ? (
                <div className="space-y-6">
                  <div className="p-6 rounded-[2rem] border-4 border-pink-200 bg-pink-50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-start sm:items-center gap-6 group hover:shadow-xl hover:-translate-y-1 transition-all">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-pink-200 text-pink-600 flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-12 transition-transform">
                      <Cake className="w-10 h-10" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">Mr. Ramesh's Birthday! 🎂</h4>
                        <span className="px-3 py-1 rounded-xl text-xs font-black bg-pink-500 text-white shadow-sm rotate-[-5deg]">Teacher</span>
                      </div>
                      <p className="text-sm font-bold text-slate-500 mb-3">Math Department Head is turning 45!</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm font-black text-pink-600 dark:text-pink-400 bg-white dark:bg-slate-800 p-3 rounded-2xl border-2 border-pink-100 dark:border-slate-700 w-fit">
                        <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 1:00 PM</span>
                        <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Staff Room A</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 animate-pulse">
                     <Music className="w-12 h-12 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-700 dark:text-slate-300">Quiet week ahead...</h3>
                  <p className="text-base font-bold text-slate-500 mt-2">No other parties scheduled yet!</p>
                </div>
              )}
            </div>
          </div>

          {/* Preparation Checklist */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-lg border-4 border-amber-100 dark:border-slate-700 h-fit relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 dark:bg-amber-900/20 rounded-bl-full pointer-events-none"></div>
             
             <h3 className="text-xl font-black text-amber-900 dark:text-amber-100 mb-6 flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl rotate-12">
                   <CheckCircle2 className="w-6 h-6" />
                </div>
                To-Do List!
             </h3>

             <div className="space-y-4">
               {preparations.map((prep) => (
                 <div key={prep.id} onClick={() => cycleStatus(prep.id)} className={`p-4 rounded-2xl border-4 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all ${
                     prep.status === 'Completed' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' :
                     prep.status === 'In Progress' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' :
                     'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                 }`}>
                    <div className="flex justify-between items-start mb-3 gap-2">
                       <h4 className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight">{prep.task}</h4>
                    </div>
                    <div className="flex justify-between items-center">
                       <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          <span className="text-slate-700 dark:text-slate-300">{prep.assignedTo}</span>
                       </div>
                       <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border-2 shadow-sm ${
                          prep.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                          prep.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                          'bg-white text-amber-600 border-amber-300'
                       }`}>
                          {prep.status}
                       </span>
                    </div>
                 </div>
               ))}
             </div>
             
             <button onClick={() => setModalOpen(true)} className="w-full mt-6 py-4 rounded-2xl text-sm font-black text-amber-600 bg-amber-50 hover:bg-amber-100 transition-all border-4 border-dashed border-amber-300 active:scale-95 shadow-sm">
                + Add a Task!
             </button>
          </div>

        </div>
      </div>

      {/* Playful Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl shadow-pink-500/20 text-base font-bold animate-[bounce_0.5s_ease-out] z-50 flex items-center gap-3 border-4 border-pink-500/30">
          <div className="w-4 h-4 bg-pink-400 rounded-full animate-ping"></div>
          {toastMsg}
        </div>
      )}

      {/* Add Task Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-md shadow-2xl border-4 border-amber-200 dark:border-slate-700 animate-in zoom-in-95 p-2">
            <div className="flex justify-between items-center p-6 bg-amber-50 dark:bg-slate-900 rounded-[2rem] mb-4">
              <h3 className="text-xl font-black text-amber-600 dark:text-amber-500">What needs to be done?</h3>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-amber-500 hover:scale-110 transition-all shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTask} className="p-4 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">The Task 📝</label>
                <input required name="task" type="text" placeholder="e.g., Buy balloons!" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Who's doing it? 🧑‍🤝‍🧑</label>
                <input required name="assignedTo" type="text" placeholder="e.g., The Party Committee" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-2 border-slate-200 dark:border-slate-700">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 rounded-2xl text-sm font-black text-amber-900 bg-amber-400 hover:bg-amber-300 transition-all shadow-lg shadow-amber-500/30 border-2 border-amber-200 active:scale-95">
                  Add It! ✅
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
