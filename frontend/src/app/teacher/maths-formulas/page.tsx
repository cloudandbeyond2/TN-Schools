"use client";

import React, { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { 
  Calculator, 
  Search,
  Sigma,
  Pi,
  DivideSquare,
  BookOpen,
  Copy,
  Star,
  Check,
  Zap
} from "lucide-react";

interface FormulaCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

const categories: FormulaCategory[] = [
  { id: "algebra", name: "Algebra", icon: <Sigma />, count: 124, color: "text-blue-600 bg-blue-100 border-blue-400" },
  { id: "geometry", name: "Geometry", icon: <DivideSquare />, count: 86, color: "text-emerald-600 bg-emerald-100 border-emerald-400" },
  { id: "trigonometry", name: "Trigonometry", icon: <Pi />, count: 52, color: "text-purple-600 bg-purple-100 border-purple-400" },
  { id: "calculus", name: "Calculus", icon: <Calculator />, count: 110, color: "text-orange-600 bg-orange-100 border-orange-400" },
];

const mockFormulas = [
  { id: 1, title: "Quadratic Formula", formula: "x = (-b ± √(b² - 4ac)) / 2a", category: "algebra", popular: true, bg: "from-blue-400 to-indigo-500" },
  { id: 2, title: "Pythagorean Theorem", formula: "a² + b² = c²", category: "geometry", popular: true, bg: "from-emerald-400 to-teal-500" },
  { id: 3, title: "Area of a Circle", formula: "A = πr²", category: "geometry", popular: false, bg: "from-pink-400 to-rose-500" },
  { id: 4, title: "Sine Rule", formula: "a/sin(A) = b/sin(B) = c/sin(C)", category: "trigonometry", popular: false, bg: "from-purple-400 to-fuchsia-500" },
  { id: 5, title: "Euler's Identity", formula: "e^(iπ) + 1 = 0", category: "algebra", popular: true, bg: "from-amber-400 to-orange-500" },
  { id: 6, title: "Fundamental Theorem of Calculus", formula: "∫(a to b) f(x)dx = F(b) - F(a)", category: "calculus", popular: true, bg: "from-cyan-400 to-blue-500" },
];

export default function MathsFormulasPage() {
  const [activeCat, setActiveCat] = useState("all");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<any>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleCopy = (id: number) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast("Formula magically copied! ✨");
  };

  const filteredFormulas = activeCat === "all" ? mockFormulas : mockFormulas.filter(f => f.category === activeCat);

  return (
    <PortalLayout
      title="Maths Magic Formulas"
      subtitle="Your super-powered cheat sheet for math!"
    >
      <div className="flex flex-col gap-8">
        
        {/* Playful Search and Categories Header */}
        <div className="bg-white dark:bg-slate-800 p-6 flex flex-col md:flex-row gap-6 justify-between items-center rounded-[2rem] border-4 border-indigo-100 dark:border-slate-700 shadow-xl shadow-indigo-500/10 relative overflow-hidden">
          
          <div className="absolute right-0 top-0 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

          <div className="w-full md:w-1/3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400 font-bold" />
              <input 
                type="text" 
                placeholder="Search magical formulas..." 
                className="w-full bg-slate-50 dark:bg-slate-900 border-4 border-indigo-100 dark:border-slate-700 text-indigo-900 dark:text-indigo-100 rounded-3xl py-3 pl-12 pr-4 text-base font-bold focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all shadow-inner placeholder:text-indigo-300 dark:placeholder:text-indigo-700"
              />
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            <button 
              onClick={() => setActiveCat("all")}
              className={`px-6 py-3 rounded-2xl text-sm font-black transition-all whitespace-nowrap flex items-center gap-2 ${
                activeCat === "all" 
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/30 scale-105" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 border-2 border-transparent"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              All Magic
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`px-5 py-3 rounded-2xl text-sm font-black transition-all whitespace-nowrap flex items-center gap-2 border-2 ${
                  activeCat === cat.id 
                    ? `${cat.color.split(' ')[1]} ${cat.color.split(' ')[2]} ${cat.color.split(' ')[0]} shadow-lg scale-105`
                    : `bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:scale-105`
                }`}
              >
                {React.cloneElement(cat.icon as React.ReactElement, { className: "w-5 h-5" })}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Playful Formulas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFormulas.map(formula => {
            const cat = categories.find(c => c.id === formula.category);
            return (
              <div key={formula.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col relative overflow-hidden border-4 border-slate-100 dark:border-slate-700 p-2">
                
                <div className={`w-full h-32 rounded-t-[2rem] rounded-b-2xl bg-gradient-to-br ${formula.bg} flex items-center justify-center p-6 relative`}>
                   <span className="font-mono text-2xl font-black text-white text-center drop-shadow-md">
                     {formula.formula}
                   </span>
                   {/* Copy Button Overlay */}
                   <button 
                     onClick={() => handleCopy(formula.id)}
                     className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all shadow-sm active:scale-95"
                     title="Copy Formula"
                   >
                     {copiedId === formula.id ? (
                       <Check className="w-5 h-5" />
                     ) : (
                       <Copy className="w-5 h-5" />
                     )}
                   </button>
                   {formula.popular && (
                     <div className="absolute top-4 left-4 flex items-center gap-1 text-[10px] font-black text-amber-900 bg-amber-400 px-3 py-1.5 rounded-xl shadow-md rotate-[-5deg]">
                       <Star className="w-3.5 h-3.5 fill-amber-900" />
                       SUPER POPULAR!
                     </div>
                   )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                   <div className="flex justify-between items-center mb-2">
                     <div className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border-2 flex items-center gap-1.5 ${cat?.color}`}>
                       {React.cloneElement(cat?.icon as React.ReactElement, { className: "w-4 h-4" })}
                       {cat?.name}
                     </div>
                   </div>

                   <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-4">{formula.title}</h3>
                   
                   <div className="flex gap-3 mt-auto">
                     <button 
                       onClick={() => { setSelectedFormula({ ...formula, cat }); setModalOpen(true); }}
                       className="flex-1 py-3 rounded-2xl text-sm font-black text-indigo-600 bg-indigo-100 hover:bg-indigo-200 transition-all active:scale-95 border-2 border-indigo-200">
                       Learn How!
                     </button>
                     <button 
                       onClick={() => showToast(`Awesome! ${formula.title} saved to your backpack. 🎒`)}
                       className="w-12 h-12 flex items-center justify-center rounded-2xl text-pink-500 bg-pink-100 hover:bg-pink-200 border-2 border-pink-200 transition-all active:scale-95"
                       title="Save to Backpack">
                       <Zap className="w-5 h-5 fill-pink-500" />
                     </button>
                   </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
      
      {/* Playful Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl shadow-indigo-500/20 text-base font-bold animate-[bounce_0.5s_ease-out] z-50 flex items-center gap-2 border-4 border-indigo-500/30">
          <div className="w-3 h-3 bg-pink-400 rounded-full animate-ping"></div>
          {toastMsg}
        </div>
      )}
      
      {/* Playful Details Modal */}
      {modalOpen && selectedFormula && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-2 max-w-md w-full shadow-2xl border-4 border-slate-100 dark:border-slate-700 animate-in zoom-in-95">
             <div className={`w-full h-40 rounded-[2rem] bg-gradient-to-br ${selectedFormula.bg} flex items-center justify-center p-6 relative mb-4 shadow-inner`}>
                <span className="font-mono text-3xl font-black text-white text-center drop-shadow-md">
                  {selectedFormula.formula}
                </span>
                <div className={`absolute -bottom-4 left-6 px-4 py-1.5 rounded-xl text-sm font-black uppercase tracking-wider border-2 bg-white ${selectedFormula.cat?.color}`}>
                   {selectedFormula.cat?.name}
                </div>
             </div>
             
             <div className="p-6 pt-2">
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-4">{selectedFormula.title}</h3>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700">
                  This magical formula helps you solve really hard math problems! Use it wisely! 🧙‍♂️
                </p>
                <div className="flex gap-4">
                  <button onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-2 border-slate-200 dark:border-slate-700">
                    Got it!
                  </button>
                  <button onClick={() => { showToast(`Added ${selectedFormula.title} to your backpack! 🎒`); setModalOpen(false); }} className="flex-1 py-3 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-purple-500/30 active:scale-95">
                    Save It!
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
