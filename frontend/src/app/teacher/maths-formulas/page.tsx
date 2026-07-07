"use client";

import React, { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { Calculator, Search, Sigma, Pi, DivideSquare, BookOpen, Copy, Star, Check, Zap, Gamepad2, BrainCircuit, Joystick, GraduationCap, X } from "lucide-react";

import { samacheerFormulas, SamacheerFormula } from "@/data/samacheer-formulas";

const getCategoryIcon = (catId: string) => {
  if (catId === "measurements" || catId === "geometry") return <DivideSquare />;
  if (catId === "profit-loss" || catId === "algebra") return <Sigma />;
  if (catId === "trigonometry") return <Pi />;
  return <Calculator />;
};

const getCategoryColor = (catId: string) => {
  if (catId === "measurements" || catId === "geometry") return "text-emerald-600 bg-emerald-100 border-emerald-400";
  if (catId === "profit-loss" || catId === "algebra") return "text-blue-600 bg-blue-100 border-blue-400";
  if (catId === "trigonometry") return "text-purple-600 bg-purple-100 border-purple-400";
  return "text-orange-600 bg-orange-100 border-orange-400";
};

import { FormulaSandboxLoader } from "@/components/MathSandboxes";


export default function MathsFormulasPage() {
  const [activeCat, setActiveCat] = useState("all");
  const [activeStandard, setActiveStandard] = useState("6");
  const [activeTerm, setActiveTerm] = useState("3");
  const [lang, setLang] = useState<"en" | "ta">("en");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  
  // Game Mode & Sandbox State
  const [gameMode, setGameMode] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"playground" | "memory">("playground");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleCopy = (e: React.MouseEvent, id: number, textToCopy: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      showToast("Formula magically copied! ");
    }).catch(() => {
      showToast("Failed to copy formula ");
    });
  };

  const openSandbox = (formula: any, cat: any) => {
    setSelectedFormula({ ...formula, cat });
    setActiveTab("playground");
    setModalOpen(true);
  };

  const toggleGameMode = () => {
    setGameMode(!gameMode);
    setRevealed(new Set()); 
    if (!gameMode) showToast(" Game Mode Activated! Test your memory!");
    else showToast(" Switched back to Study Mode.");
  };

  const toggleReveal = (id: number) => {
    setRevealed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        showToast("Great memory! +10 XP ");
      }
      return next;
    });
  };

  // Filter logic
  let filteredFormulas = samacheerFormulas.filter(f => f.standard === activeStandard);
  if (activeTerm !== "all") {
    filteredFormulas = filteredFormulas.filter(f => f.term === activeTerm);
  }
  
  // Dynamically compute categories from filtered formulas
  const dynamicCategoriesMap = new Map();
  filteredFormulas.forEach(f => {
    if (!dynamicCategoriesMap.has(f.category)) {
      dynamicCategoriesMap.set(f.category, {
        id: f.category,
        name: f.categoryName,
        icon: getCategoryIcon(f.category),
        color: getCategoryColor(f.category),
        count: 0
      });
    }
    dynamicCategoriesMap.get(f.category).count++;
  });
  const categories = Array.from(dynamicCategoriesMap.values());

  if (activeCat !== "all") {
    filteredFormulas = filteredFormulas.filter(f => f.category === activeCat);
  }
  if (searchQuery.trim() !== "") {
    filteredFormulas = filteredFormulas.filter(f => 
      f.title.en.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.title.ta.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.formula.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <PortalLayout
      title="Maths Magic Formulas"
      subtitle="Your super-powered interactive cheat sheet for math!"
    >
      <div className="flex flex-col gap-8">
        
        {/* Playful Search and Categories Header */}
        <div className="bg-white dark:bg-slate-800 p-6 flex flex-col xl:flex-row gap-6 justify-between items-center rounded-[2rem] border-4 border-slate-200 dark:border-slate-750 shadow-xl shadow-indigo-500/10 relative overflow-hidden">
          
          <div className="absolute right-0 top-0 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

          <div className="w-full xl:w-1/2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 font-bold" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search formulas..." 
                className="w-full bg-slate-50 dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-200 rounded-3xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-300 transition-all shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-550"
              />
            </div>
            
            {/* Standard & Term Selector */}
            <div className="relative flex gap-2">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <select 
                  value={activeStandard}
                  onChange={(e) => {
                    setActiveStandard(e.target.value);
                    setActiveCat("all");
                    showToast(`Viewing formulas for Standard ${e.target.value}`);
                  }}
                  className="appearance-none bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-200 rounded-2xl py-3 pl-10 pr-8 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-350 transition-all shadow-sm cursor-pointer"
                >
                  <option value="6">Standard 6</option>
                </select>
              </div>
              
              <select 
                value={activeTerm}
                onChange={(e) => {
                  setActiveTerm(e.target.value);
                  setActiveCat("all");
                }}
                className="appearance-none bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-200 rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-slate-350 transition-all shadow-sm cursor-pointer"
              >
                <option value="all">All Terms</option>
                <option value="1">Term I</option>
                <option value="2">Term II</option>
                <option value="3">Term III</option>
              </select>
            </div>
            
            {/* Language Toggle */}
            <button
              onClick={() => setLang(l => l === "en" ? "ta" : "en")}
              className="p-3 px-4 rounded-2xl border-4 bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700 font-bold hover:bg-fuchsia-100 transition-all shadow-sm flex items-center gap-2"
              title="Toggle Language"
            >
              {lang === "en" ? "English" : "தமிழ்"}
            </button>
            
            <button 
              onClick={toggleGameMode}
              className={`p-3 rounded-2xl border-4 transition-all flex-shrink-0 ${
                gameMode 
                  ? "bg-amber-400 border-amber-500 text-amber-900 shadow-lg shadow-amber-500/40 scale-110 rotate-3 animate-pulse" 
                  : "bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-200"
              }`}
              title="Toggle Game Mode"
            >
              <Gamepad2 className="w-6 h-6" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 hide-scrollbar">
            <button 
              onClick={() => setActiveCat("all")}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-2 border-2 ${
                activeCat === "all" 
                  ? "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent shadow-lg scale-105" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-200"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              All
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-2 border-2 ${
                  activeCat === cat.id 
                    ? "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent shadow-lg scale-105"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-200"
                }`}
              >
                {React.cloneElement(cat.icon as React.ReactElement, { className: "w-4 h-4" })}
                {cat.name[lang]}
              </button>
            ))}
          </div>
        </div>

        {/* Playful Formulas Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {filteredFormulas.map(formula => {
            const cat = categories.find(c => c.id === formula.category);
            return (
              <div key={formula.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col relative overflow-hidden border-4 border-slate-100 dark:border-slate-700 p-2">
                
                {/* Dynamic Formula Display based on Game Mode */}
                {gameMode ? (
                  <div 
                    onClick={() => toggleReveal(formula.id)}
                    className={`w-full h-36 rounded-t-[2rem] rounded-b-2xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all duration-300 ${
                      revealed.has(formula.id) 
                        ? `bg-gradient-to-br ${formula.bg}`
                        : "bg-slate-800 dark:bg-slate-900 border-2 border-dashed border-slate-600 hover:bg-slate-700"
                    }`}
                  >
                    {revealed.has(formula.id) ? (
                      <span className="font-mono text-2xl font-black text-white text-center drop-shadow-md animate-in zoom-in duration-300">
                        {formula.formula}
                      </span>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-amber-400 transition-colors">
                        <Gamepad2 className="w-10 h-10 mb-2 opacity-50 group-hover:opacity-100 group-hover:animate-bounce" />
                        <span className="font-black text-xs tracking-widest uppercase text-center">
                          Tap to Reveal
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`w-full h-36 rounded-t-[2rem] rounded-b-2xl bg-gradient-to-br ${formula.bg} flex items-center justify-center p-6 relative`}>
                     <span className="font-mono text-2xl font-black text-white text-center drop-shadow-md">
                       {formula.formula}
                     </span>
                     
                     <button 
                       onClick={(e) => handleCopy(e, formula.id, formula.formula)}
                       className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all shadow-sm active:scale-95 z-10"
                       title="Copy Formula"
                     >
                       {copiedId === formula.id ? (
                         <Check className="w-4 h-4" />
                       ) : (
                         <Copy className="w-4 h-4" />
                       )}
                     </button>

                     {/* Grade Badge */}
                     <div className="absolute bottom-4 right-4 flex items-center gap-1 text-[9px] font-black text-slate-700 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-sm">
                       Standard {formula.standard}
                     </div>

                     {formula.popular && (
                       <div className="absolute top-4 left-4 flex items-center gap-1 text-[9px] font-black text-amber-900 bg-amber-400 px-2.5 py-1 rounded-xl shadow-md rotate-[-5deg]">
                         <Star className="w-3 h-3 fill-amber-900" />
                         POPULAR
                       </div>
                     )}
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                   <div className="flex justify-between items-center mb-3">
                     <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 flex items-center gap-1.5 ${cat?.color}`}>
                       {cat?.icon ? React.cloneElement(cat.icon as React.ReactElement, { className: "w-3 h-3" }) : <Sigma className="w-3 h-3"/>}
                       {cat?.name[lang]}
                     </div>
                   </div>

                   <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-5 leading-tight">{formula.title[lang]}</h3>
                   
                   <div className="flex gap-2 mt-auto">
                     <button 
                       onClick={() => openSandbox(formula, cat)}
                       className="flex-1 py-3 rounded-2xl text-xs font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all active:scale-95 border-2 border-indigo-200 flex items-center justify-center gap-2">
                       <Joystick className="w-4 h-4" /> Interactive Sandbox
                     </button>
                   </div>
                </div>
              </div>
            );
          })}
          
          {filteredFormulas.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 bg-white dark:bg-slate-800 rounded-[2.5rem] border-4 border-dashed border-slate-200 dark:border-slate-700">
               <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
               <h3 className="text-xl font-black text-slate-400">No magical formulas found!</h3>
               <p className="text-sm font-bold mt-2">Try selecting a different category or grade level.</p>
            </div>
          )}
        </div>

      </div>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl shadow-indigo-500/20 text-sm font-bold animate-[bounce_0.5s_ease-out] z-[150] flex items-center gap-2 border-4 border-indigo-500/30">
          <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></div>
          {toastMsg}
        </div>
      )}
      
      {/* Interactive Sandbox & Memory Modal */}
      {modalOpen && selectedFormula && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-lg shadow-2xl border-4 border-slate-100 dark:border-slate-700 animate-in zoom-in-95 flex flex-col overflow-hidden">
             
             {/* Modal Header (Formula Display) */}
             <div className={`w-full h-32 bg-gradient-to-br ${selectedFormula.bg} flex items-center justify-center p-6 relative shadow-inner`}>
                <span className="font-mono text-3xl font-black text-white text-center drop-shadow-md">
                  {selectedFormula.formula}
                </span>
                
                <button 
                  onClick={() => setModalOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all"
                >
                  <X className="w-4 h-4 inline-block mr-1 text-inherit" />
                </button>
             </div>
             <div className="p-6 flex flex-col flex-1">
                 <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{selectedFormula.title[lang]}</h3>
                  <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 bg-white ${selectedFormula.cat?.color}`}>
                     {selectedFormula.cat?.name[lang]}
                  </div>
                </div>

                <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700">
                  <button 
                    onClick={() => setActiveTab("playground")} 
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                      activeTab === "playground" ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Joystick className="w-4 h-4" /> Sandbox
                  </button>
                  <button 
                    onClick={() => setActiveTab("memory")} 
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                      activeTab === "memory" ? "bg-white dark:bg-slate-800 text-pink-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <BrainCircuit className="w-4 h-4" /> Memory Trick
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 min-h-[250px]">
                  {activeTab === "playground" && (
                    <div className="h-full flex flex-col justify-center">
                      <FormulaSandboxLoader formulaId={selectedFormula.id} />
                    </div>
                  )}

                  {activeTab === "memory" && (
                    <div className="space-y-4 animate-in fade-in duration-500">
                      <div className="w-full h-44 bg-slate-900 rounded-2xl overflow-hidden relative border border-slate-200 shadow-inner group">
                         <img 
                           src={`https://image.pollinations.ai/prompt/${encodeURIComponent(selectedFormula.mnemonicPrompt)}?width=600&height=400&nologo=true`} 
                           alt="Memory Mnemonic"
                           className="w-full h-full object-cover transition-transform duration-[10000ms] group-hover:scale-110" 
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                           <span className="text-white text-[10px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-1">
                             <BrainCircuit className="w-3 h-3" /> AI Generated Mnemonic
                           </span>
                         </div>
                      </div>
                      <p className="font-bold text-slate-700 text-sm leading-relaxed p-4 bg-amber-50 rounded-2xl border-2 border-amber-200 text-center">
                        "{selectedFormula.mnemonicText}"
                      </p>
                    </div>
                  )}
                </div>

             </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
