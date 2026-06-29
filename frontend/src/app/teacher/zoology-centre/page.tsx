"use client";

import React, { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import {
  Bug,
  Dna,
  Leaf,
  Microscope,
  Info,
  Search,
  Grid3X3,
  X,
  Fish,
  Bird,
  PawPrint,
  Tractor
} from "lucide-react";

type Specimen = {
  id: string;
  name: string;
  category: string;
  type?: string;
  slide?: string;
  icon: React.ReactNode;
  color: string;
};

export default function ZoologyCentrePage() {
  const [specimens, setSpecimens] = useState<Specimen[]>([
    { name: "Amoeba Proteus 🦠", category: "Microbiology", slide: "Permanent", id: "Z-101", icon: <Bug />, color: "emerald" },
    { name: "Human DNA Extraction 🧬", category: "Genetics", type: "Live Prep", id: "Z-204", icon: <Dna />, color: "purple" },
    { name: "Dissected Frog Model 🐸", category: "Anatomy", type: "3D Model", id: "Z-305", icon: <PawPrint />, color: "amber" },
    { name: "Euglena Viridis 🌿", category: "Microbiology", slide: "Temporary", id: "Z-102", icon: <Leaf />, color: "emerald" },
    { name: "Starfish Anatomy ⭐", category: "Marine Biology", type: "3D Model", id: "Z-401", icon: <Fish />, color: "sky" },
    { name: "Owl Pellet Kit 🦉", category: "Ecology", type: "Live Prep", id: "Z-501", icon: <Bird />, color: "orange" },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;

    const colors = ["emerald", "sky", "purple", "amber", "rose", "orange"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    setSpecimens([...specimens, {
      name: name + " ✨",
      category: type === "Live Prep" ? "Genetics" : "Microbiology",
      type,
      slide: type === "Permanent" ? "Permanent" : "",
      id: `Z-NEW-${specimens.length + 1}`,
      icon: <Microscope />,
      color: randomColor
    }]);
    setModalOpen(false);
    showToast("Yay! New specimen requested! 🦋");
  };

  return (
    <PortalLayout
      title="Animal & Nature Centre! 🦁"
      subtitle="Explore bugs, DNA, frogs, and cool biology stuff!"
    >
      <div className="flex flex-col gap-8">

        {/* Playful Banner */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-green-500 to-emerald-700 text-white p-8 shadow-xl border-4 border-green-200">
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-yellow-300/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-50px] right-[10%] w-48 h-48 bg-emerald-900/40 rounded-full blur-2xl"></div>
          
          <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-20 transform scale-[2] pointer-events-none">
             <PawPrint className="w-40 h-40" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl font-black tracking-wider text-xs uppercase mb-4 border-2 border-white/30">
                <Leaf className="w-4 h-4" /> Nature Explorers
              </div>
              <h2 className="text-4xl font-black tracking-tight mb-3 drop-shadow-md">The Bio Zone!</h2>
              <p className="text-green-50 font-bold max-w-xl text-base leading-relaxed">
                Welcome to the jungle! Check out our collection of bugs, models, and DNA kits. Get ready for some wild science!
              </p>
            </div>

            <div className="shrink-0 flex gap-3">
              <button onClick={() => setModalOpen(true)} className="px-6 py-4 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-black text-sm rounded-2xl transition-all shadow-lg shadow-yellow-500/40 hover:scale-105 active:scale-95 flex items-center gap-3 border-4 border-yellow-200">
                <Microscope className="w-6 h-6" /> I want a new specimen!
              </button>
            </div>
          </div>
        </div>

        {/* Playful Specimen Catalog */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-lg border-4 border-emerald-100 dark:border-slate-700 flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl rotate-12">
                 <Bug className="w-6 h-6" />
              </div>
              Creature Collection
            </h3>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400 font-bold" />
                <input
                  type="text"
                  placeholder="Search for frogs, bugs..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border-4 border-emerald-100 dark:border-slate-700 text-slate-800 dark:text-white rounded-3xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {specimens.map((specimen, idx) => (
              <div key={idx} className={`group p-6 rounded-[2rem] border-4 border-${specimen.color}-100 dark:border-slate-700 hover:border-${specimen.color}-300 bg-${specimen.color}-50/30 hover:bg-${specimen.color}-50 dark:bg-slate-900/50 hover:-translate-y-2 hover:shadow-xl transition-all relative overflow-hidden flex flex-col h-full`}>

                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-500 text-${specimen.color}-500 pointer-events-none -rotate-12`}>
                  {React.cloneElement(specimen.icon as React.ReactElement, { className: "w-24 h-24" })}
                </div>

                <div className="flex justify-between items-start mb-6">
                  <span className={`text-[10px] font-black text-${specimen.color}-700 bg-${specimen.color}-200 px-3 py-1.5 rounded-xl border-2 border-${specimen.color}-300 shadow-sm rotate-[-3deg]`}>
                    ID: {specimen.id}
                  </span>
                  <button onClick={() => showToast(`Info about ${specimen.name} 📖`)} className={`w-8 h-8 rounded-full bg-${specimen.color}-200 text-${specimen.color}-600 flex items-center justify-center hover:scale-110 transition-transform active:scale-95`}>
                    <Info className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 z-10 leading-tight">{specimen.name}</h4>
                <p className="text-sm font-bold text-slate-500 mb-6 z-10">{specimen.category}</p>

                <div className="mt-auto pt-4 border-t-2 border-slate-200 dark:border-slate-700 flex justify-between items-center z-10">
                  <span className={`text-[10px] font-black uppercase tracking-widest text-${specimen.color}-600 bg-white dark:bg-slate-800 border-2 border-${specimen.color}-200 px-3 py-1.5 rounded-xl`}>
                    {specimen.slide || specimen.type}
                  </span>
                  <button onClick={() => showToast(`Looking closer at ${specimen.name} 🔍`)} className={`px-4 py-2 bg-${specimen.color}-500 hover:bg-${specimen.color}-600 text-white text-xs font-black rounded-xl transition-colors shadow-md active:scale-95`}>
                    Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button className="text-sm font-black text-emerald-600 bg-emerald-100 hover:bg-emerald-200 border-2 border-emerald-300 px-8 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-sm">
              Show Everything! 🌍
            </button>
          </div>
        </div>
      </div>

      {/* Playful Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl shadow-green-500/20 text-base font-bold animate-[bounce_0.5s_ease-out] z-50 flex items-center gap-3 border-4 border-green-500/30">
          <div className="w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
          {toastMsg}
        </div>
      )}

      {/* Request Specimen Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-md shadow-2xl border-4 border-yellow-200 dark:border-slate-700 animate-in zoom-in-95 p-2">
            <div className="flex justify-between items-center p-6 bg-yellow-50 dark:bg-slate-900 rounded-[2rem] mb-4">
              <h3 className="text-xl font-black text-yellow-600 dark:text-yellow-500">Ask for a Creature!</h3>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-yellow-500 hover:scale-110 transition-all shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRequest} className="p-4 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">What is it called? 🦋</label>
                <input required name="name" type="text" placeholder="e.g., Giant Beetle" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-yellow-300 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">What kind is it? 📦</label>
                  <select required name="type" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-yellow-300 transition-all">
                    <option value="Permanent">Microscope Slide 🔬</option>
                    <option value="Live Prep">Live Creature! 🐛</option>
                    <option value="3D Model">Plastic Model 🧸</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-2 border-slate-200 dark:border-slate-700">
                  Nevermind
                </button>
                <button type="submit" className="flex-1 py-3 rounded-2xl text-sm font-black text-yellow-900 bg-yellow-400 hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-500/30 border-2 border-yellow-200 active:scale-95">
                  Get It! 🐾
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
