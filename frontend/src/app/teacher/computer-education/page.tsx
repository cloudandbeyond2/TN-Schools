"use client";

import React, { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { 
  Monitor, 
  Terminal, 
  Code2, 
  Cpu, 
  BookMarked,
  Trophy,
  X,
  Keyboard,
  Gamepad2,
  Rocket,
  Zap,
  Sparkles
} from "lucide-react";

export default function ComputerEducationPage() {
  const [modules, setModules] = useState([
    { id: 1, title: "Computer Basics! 🖥️", progress: 100, students: 45, icon: <Monitor />, color: "blue" },
    { id: 2, title: "Fun with Scratch 🐱", progress: 65, students: 42, icon: <Gamepad2 />, color: "emerald" },
    { id: 3, title: "Safe Browsing 🛡️", progress: 30, students: 45, icon: <Terminal />, color: "purple" },
    { id: 4, title: "Inside the Machine ⚙️", progress: 0, students: 45, icon: <Cpu />, color: "amber" },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get("title") as string;
    
    setModules([...modules, { id: Date.now(), title: title + " 🚀", progress: 0, students: 0, icon: <Code2 />, color: "indigo" }]);
    setModalOpen(false);
    showToast("Awesome! New coding module added!");
  };

  return (
    <PortalLayout
      title="Tech Academy! 💻"
      subtitle="Learn to code, build games, and be a computer wizard!"
    >
      <div className="flex flex-col gap-8">
        
        {/* Playful Banner */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white p-8 shadow-xl border-4 border-blue-300">
          <div className="absolute right-0 top-0 opacity-20 transform translate-x-1/4 -translate-y-1/4 scale-150 pointer-events-none mix-blend-overlay">
            <Cpu className="w-64 h-64" />
          </div>
          
          {/* Fun tech elements */}
          <div className="absolute top-10 left-10 text-white/20 font-mono text-2xl font-black rotate-12">&lt;code&gt;</div>
          <div className="absolute bottom-10 right-1/4 text-white/20 font-mono text-3xl font-black -rotate-12">&#123; fun &#125;</div>
          <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-blue-300 rounded-full animate-ping"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-2 mb-4 font-black tracking-widest text-xs uppercase rounded-2xl shadow-lg rotate-[-2deg] border-2 border-yellow-200">
                 <Rocket className="w-4 h-4" /> Ready for take-off!
              </div>
              <h2 className="text-4xl font-black tracking-tight mb-3 drop-shadow-md font-mono">Hello World! 👋</h2>
              <p className="text-blue-100 font-bold max-w-xl text-base leading-relaxed">
                Welcome to the computer lab! Learn how to make games, type super fast, and understand how computers think.
              </p>
            </div>
            <div className="flex gap-4">
               <button onClick={() => showToast("Opening typing test... get ready! ⌨️")} className="px-6 py-4 bg-white text-blue-600 font-black text-sm rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 border-4 border-blue-100 flex items-center gap-2">
                 <Keyboard className="w-5 h-5" /> Type Race!
               </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Modules Overview */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border-4 border-indigo-100 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl rotate-12">
                       <Gamepad2 className="w-6 h-6" />
                    </div>
                    Learning Levels
                  </h3>
                </div>
                <button onClick={() => setModalOpen(true)} className="px-6 py-3 font-black text-white bg-indigo-500 rounded-2xl hover:bg-indigo-600 transition-all shadow-md shadow-indigo-500/30 active:scale-95 border-b-4 border-indigo-700 w-full sm:w-auto text-sm">
                  + New Level
                </button>
              </div>
  
              <div className="space-y-4">
                {modules.map((mod) => (
                  <div key={mod.id} className={`p-5 rounded-2xl border-4 border-${mod.color}-100 dark:border-slate-700 bg-${mod.color}-50/50 dark:bg-slate-900/50 hover:-translate-y-1 hover:shadow-md transition-all group`}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-${mod.color}-200 text-${mod.color}-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-inner`}>
                        {React.cloneElement(mod.icon as React.ReactElement, { className: "w-7 h-7" })}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono">{mod.title}</h4>
                        <p className="text-sm font-bold text-slate-500 mt-1 flex items-center gap-2">
                           <span className={`px-2 py-0.5 rounded-md bg-${mod.color}-100 text-${mod.color}-700`}>{mod.students} Kids</span>
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-3 sm:block">
                        <span className={`text-2xl font-black text-${mod.color}-600 drop-shadow-sm`}>{mod.progress}%</span>
                        {mod.progress === 100 && <Trophy className="w-6 h-6 text-yellow-400 sm:hidden" />}
                      </div>
                    </div>
                    
                    {/* Playful Progress Bar */}
                    <div className="w-full h-4 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-inner border-2 border-slate-300 dark:border-slate-600 relative">
                      <div 
                        className={`absolute top-0 left-0 h-full bg-${mod.color}-500 rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${mod.progress}%` }}
                      >
                         {/* Stripe effect */}
                         <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
  
          </div>
  
          {/* Quick Resources & Badges */}
          <div className="space-y-8">
            
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border-4 border-amber-100 dark:border-slate-700 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 dark:bg-amber-900/20 rounded-bl-full pointer-events-none"></div>
              
              <div className="w-20 h-20 mx-auto bg-amber-100 text-amber-500 rounded-3xl flex items-center justify-center mb-4 shadow-inner rotate-12">
                <Trophy className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-amber-900 dark:text-amber-100 mb-2">Rewards & Badges!</h3>
              <p className="text-sm font-bold text-slate-500 mb-6">Give kids cool digital stickers for typing fast or finishing code!</p>
              
              <button onClick={() => showToast("Opening sticker book! 📚")} className="w-full py-3 rounded-2xl bg-amber-400 text-amber-900 font-black text-sm shadow-lg shadow-amber-500/30 hover:bg-amber-300 active:scale-95 transition-all border-b-4 border-amber-500">
                Give out Stickers!
              </button>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border-4 border-emerald-100 dark:border-slate-700">
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl rotate-[-5deg]">
                   <BookMarked className="w-6 h-6" />
                </div>
                Helper Tools
              </h3>
              
              <div className="space-y-4">
                <button onClick={() => showToast("Opening Lesson Plans...")} className="w-full text-left p-4 rounded-2xl border-4 border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-slate-600 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all text-sm font-black text-slate-700 dark:text-slate-200 flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-100 text-slate-400 group-hover:text-emerald-500 transition-colors">📄</div>
                  Lesson Plans
                </button>
                <button onClick={() => showToast("Fixing computer bugs! 🐛")} className="w-full text-left p-4 rounded-2xl border-4 border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-slate-600 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all text-sm font-black text-slate-700 dark:text-slate-200 flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-100 text-slate-400 group-hover:text-emerald-500 transition-colors">🔧</div>
                  Fix It Guide
                </button>
              </div>
            </div>
  
          </div>
        </div>
  
        {/* Playful Toast Notification */}
        {toastMsg && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl shadow-blue-500/20 text-base font-bold animate-[bounce_0.5s_ease-out] z-50 flex items-center gap-3 border-4 border-blue-500/30">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            {toastMsg}
          </div>
        )}
  
        {/* Add Module Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-[3rem] w-full max-w-md shadow-2xl border-4 border-indigo-200 dark:border-slate-700 animate-in zoom-in-95 p-3">
              <div className="flex justify-between items-center p-6 bg-indigo-50 dark:bg-slate-900 rounded-[2.5rem] mb-6">
                <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">Add a New Level!</h3>
                <button onClick={() => setModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-indigo-500 hover:scale-110 transition-all shadow-sm">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddModule} className="p-4 space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2 font-mono">Level Name 🎮</label>
                  <input required name="title" type="text" placeholder="e.g., Making a Robot!" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-4 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all font-mono" />
                </div>
                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 dark:bg-slate-700 transition-colors border-2 border-slate-200 dark:border-slate-600">
                    Nevermind
                  </button>
                  <button type="submit" className="flex-1 py-4 rounded-2xl text-sm font-black text-white bg-indigo-500 hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/30 active:scale-95 border-b-4 border-indigo-700">
                    Add It! 🚀
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
