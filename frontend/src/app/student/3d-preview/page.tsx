"use client";

import React, { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { 
  Box, 
  Rotate3D,
  Play,
  Eye,
  MousePointer2,
  Maximize2,
  X,
  Sparkles,
  Heart,
  Globe2,
  Leaf,
  Settings
} from "lucide-react";

export default function ThreeDPreviewPage() {
  const [models, setModels] = useState([
    { id: 1, name: "Human Heart Structure ❤️", subject: "Biology", views: 245, icon: <Heart />, color: "rose" },
    { id: 2, name: "Solar System Map 🪐", subject: "Physics", views: 189, icon: <Globe2 />, color: "indigo" },
    { id: 3, name: "Plant Cell Organelles 🌿", subject: "Biology", views: 312, icon: <Leaf />, color: "emerald" },
    { id: 4, name: "Cool Engine Parts ⚙️", subject: "Physics", views: 156, icon: <Settings />, color: "amber" },
  ]);

  const [activeModel, setActiveModel] = useState(models[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [autoRotate, setAutoRotate] = useState(true);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleLoadModel = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const subject = formData.get("subject") as string;
    
    const colors = ["rose", "indigo", "emerald", "amber", "sky", "purple"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newModel = { id: Date.now(), name: name + " ✨", subject, views: 0, icon: <Box />, color: randomColor };
    setModels([...models, newModel]);
    setActiveModel(newModel);
    setModalOpen(false);
    showToast(`Whoa! ${name} just loaded! 🚀`);
  };

  return (
    <PortalLayout
      title="Magic 3D Viewer! 👓"
      subtitle="Spin, zoom, and explore awesome 3D stuff!"
    >
      <div className="flex flex-col lg:flex-row gap-8 h-auto lg:h-[calc(100vh-140px)] text-left">
        
        {/* Main Viewer Area */}
        <div className="flex-1 rounded-[2.5rem] shadow-2xl border-8 border-indigo-100 dark:border-slate-700 overflow-hidden flex flex-col relative bg-slate-900">
          
          {/* Top Control Bar */}
          <div className="h-20 bg-white/10 backdrop-blur-md border-b-4 border-white/20 flex justify-between items-center px-6 absolute top-0 w-full z-20">
            <div className="flex items-center gap-4">
              <span className={`px-4 py-2 bg-${activeModel.color}-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-md rotate-[-3deg]`}>
                {activeModel.subject}
              </span>
              <h3 className="text-2xl font-black text-white drop-shadow-md">{activeModel.name}</h3>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={() => { setAutoRotate(!autoRotate); showToast(autoRotate ? "Holding still! 🛑" : "Spinning around! 🌪️"); }} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${autoRotate ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50 scale-110' : 'bg-white/20 text-white hover:bg-white/30'}`} title="Spin!">
                <Rotate3D className={`w-6 h-6 ${autoRotate ? 'animate-spin-slow' : ''}`} />
              </button>
              <button onClick={() => showToast("Going BIG! 📺")} className="w-12 h-12 rounded-2xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95" title="Big Screen">
                <Maximize2 className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Playful 3D Viewer Mockup */}
          <div className="flex-1 relative bg-gradient-to-b from-slate-800 to-indigo-950 flex items-center justify-center overflow-hidden cursor-move">
            
            {/* Twinkling stars background */}
            <div className="absolute inset-0 z-0">
               <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping"></div>
               <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-indigo-200 rounded-full animate-pulse"></div>
               <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-purple-200 rounded-full animate-pulse"></div>
            </div>
            
            {/* Grid Floor */}
            <div className="absolute inset-0 z-0 opacity-30" style={{
                backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.4) 2px, transparent 2px), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 2px, transparent 2px)`,
                backgroundSize: '60px 60px',
                transform: 'perspective(600px) rotateX(70deg) translateY(200px) scale(4)',
                transformOrigin: 'bottom center'
            }}></div>
            
            {/* Mock 3D Object with colors based on selection */}
            <div className={`relative z-10 w-72 h-72 rounded-full flex items-center justify-center shadow-[0_0_150px_rgba(255,255,255,0.2)] ${autoRotate ? 'animate-[spin_10s_linear_infinite]' : ''}`}>
               <div className={`absolute w-full h-full border-8 border-${activeModel.color}-400/50 rounded-full`} style={{ transform: 'rotateX(75deg)' }}></div>
               <div className={`absolute w-full h-full border-8 border-${activeModel.color === 'rose' ? 'indigo' : 'rose'}-400/50 rounded-full`} style={{ transform: 'rotateY(75deg)' }}></div>
               <div className={`absolute w-full h-full border-8 border-${activeModel.color === 'emerald' ? 'amber' : 'emerald'}-400/50 rounded-full`} style={{ transform: 'rotateZ(75deg)' }}></div>
               
               <div className={`w-32 h-32 bg-${activeModel.color}-500/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border-4 border-${activeModel.color}-300 shadow-[0_0_50px_rgba(255,255,255,0.3)] animate-pulse`}>
                  {React.cloneElement(activeModel.icon as React.ReactElement, { className: "w-16 h-16 text-white" })}
               </div>
            </div>
            
            {/* Interaction Hint */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-full bg-indigo-900/80 backdrop-blur-md border-4 border-indigo-500/50 text-sm font-black text-indigo-100 z-20 shadow-xl">
              <MousePointer2 className="w-5 h-5 text-indigo-300 animate-bounce" /> Click & Drag to explore!
            </div>
          </div>

        </div>

        {/* Playful Sidebar - Model Library */}
        <div className="lg:w-96 flex-shrink-0 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-xl border-4 border-indigo-100 dark:border-slate-700 h-full flex flex-col">
            <h3 className="text-2xl font-black text-indigo-900 dark:text-indigo-100 mb-6 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl rotate-12">
                 <Box className="w-6 h-6" />
              </div>
              Cool 3D Stuff
            </h3>
            
            <div className="space-y-4 overflow-y-auto hide-scrollbar flex-1 pb-4">
              {models.map(model => (
                <div 
                  key={model.id}
                  onClick={() => { setActiveModel(model); showToast(`Loaded ${model.name}!`); }}
                  className={`p-4 rounded-2xl border-4 cursor-pointer transition-all group ${
                    activeModel.id === model.id 
                      ? `bg-${model.color}-50 border-${model.color}-300 shadow-md scale-105` 
                      : `bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700 hover:border-${model.color}-200 hover:bg-${model.color}-50/50 hover:scale-[1.02]`
                  }`}
                >
                  <div className="flex gap-4 items-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:rotate-12 ${
                      activeModel.id === model.id ? `bg-${model.color}-500 text-white` : `bg-${model.color}-100 text-${model.color}-500`
                    }`}>
                      {React.cloneElement(model.icon as React.ReactElement, { className: "w-7 h-7" })}
                    </div>
                    <div>
                      <h4 className={`text-base font-black mb-1 leading-tight ${activeModel.id === model.id ? `text-${model.color}-700` : "text-slate-700 dark:text-slate-200"}`}>
                        {model.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <span className={`px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300`}>{model.subject}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {model.views}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button onClick={() => setModalOpen(true)} className="mt-4 w-full py-4 rounded-2xl border-4 border-dashed border-indigo-200 text-sm font-black text-indigo-500 hover:text-white hover:bg-indigo-500 hover:border-indigo-500 transition-all active:scale-95 shadow-sm">
              + Find More Magic!
            </button>
          </div>
        </div>

      </div>
      
      {/* Playful Toast */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-indigo-900 text-white px-6 py-3 rounded-full shadow-2xl shadow-indigo-500/40 text-base font-bold animate-[bounce_0.5s_ease-out] z-50 flex items-center gap-3 border-4 border-indigo-500/50">
          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          {toastMsg}
        </div>
      )}

      {/* Load Model Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-md shadow-2xl border-4 border-indigo-200 dark:border-slate-700 animate-in zoom-in-95 p-2">
            <div className="flex justify-between items-center p-6 bg-indigo-50 dark:bg-slate-900 rounded-[2rem] mb-4">
              <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400">Bring in something cool!</h3>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-indigo-500 hover:scale-110 transition-all shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleLoadModel} className="p-4 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">What is it? 🦖</label>
                <input required name="name" type="text" placeholder="e.g., T-Rex Skeleton" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">What subject? 📚</label>
                <select required name="subject" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all">
                  <option value="Biology">Biology 🌿</option>
                  <option value="Physics">Physics ⚙️</option>
                  <option value="Chemistry">Chemistry 🧪</option>
                  <option value="Geography">Geography 🌍</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-2 border-slate-200 dark:border-slate-700">
                  Nevermind
                </button>
                <button type="submit" className="flex-1 py-3 rounded-2xl text-sm font-black text-white bg-indigo-500 hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/30 active:scale-95">
                  Load It Up! 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
