"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { samacheerFormulas, SamacheerFormula } from "@/data/samacheer-formulas";

const getCategoryIcon = (catId: string) => {
  if (catId === "measurements" || catId === "geometry") {
    return <i className="fi fi-sr-ruler-combined flex items-center text-sm" />;
  }
  if (catId === "profit-loss" || catId === "algebra") {
    return <i className="fi fi-sr-stats flex items-center text-sm" />;
  }
  if (catId === "trigonometry") {
    return <i className="fi fi-sr-chart-histogram flex items-center text-sm" />;
  }
  return <i className="fi fi-sr-calculator flex items-center text-sm" />;
};

const getCategoryColor = (catId: string) => {
  if (catId === "measurements" || catId === "geometry") return "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50";
  if (catId === "profit-loss" || catId === "algebra") return "text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-200/50";
  if (catId === "trigonometry") return "text-purple-600 bg-purple-50 dark:bg-purple-950/20 border-purple-200/50";
  return "text-orange-600 bg-orange-50 dark:bg-orange-950/20 border-orange-200/50";
};

const getFormulaBgStyle = (formula: any): React.CSSProperties => {
  const bg = formula?.bg || "";
  if (bg.includes("emerald")) return { background: "linear-gradient(135deg, #059669 0%, #047857 100%)" };
  if (bg.includes("blue")) return { background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" };
  if (bg.includes("purple")) return { background: "linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)" };
  if (bg.includes("amber")) return { background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)" };
  if (bg.includes("rose")) return { background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)" };
  if (bg.includes("cyan")) return { background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)" };
  if (bg.includes("teal")) return { background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)" };
  if (bg.includes("sky")) return { background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" };
  if (bg.includes("indigo")) return { background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)" };
  if (bg.includes("violet")) return { background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)" };
  if (bg.includes("fuchsia")) return { background: "linear-gradient(135deg, #c026d3 0%, #a21caf 100%)" };
  if (bg.includes("orange")) return { background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)" };
  if (bg.includes("red")) return { background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)" };

  const cat = formula?.category;
  if (cat === "measurements") return { background: "linear-gradient(135deg, #059669 0%, #047857 100%)" };
  if (cat === "geometry") return { background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" };
  if (cat === "algebra") return { background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)" };
  return { background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)" };
};

import { FormulaSandboxLoader } from "@/components/MathSandboxes";

// FormulaQuizSection moved to /quiz/page.tsx

export default function MathsFormulasPage() {
  const { data: session } = useSession();
  const [activeCat, setActiveCat] = useState("all");
  const [activeStandard, setActiveStandard] = useState("6");
  const [activeTerm, setActiveTerm] = useState("all");
  const [lang, setLang] = useState<"en" | "ta">("en");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchStudentClass() {
      if (!session?.user) return;

      const availableStandards = new Set(samacheerFormulas.map(f => f.standard));

      const sessionClass = (session.user as any)?.classId || (session.user as any)?.class;
      if (sessionClass) {
        const match = String(sessionClass).match(/\d+/);
        if (match) {
          const std = availableStandards.has(match[0]) ? match[0] : "6";
          setActiveStandard(std);
          return;
        }
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const userId = (session.user as any).id;
        const res = await fetch(`${apiUrl}/api/students?userId=${userId}`);
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          const profile = json.data[0];
          if (profile && profile.class) {
            const match = profile.class.match(/\d+/);
            if (match) {
              const std = availableStandards.has(match[0]) ? match[0] : "6";
              setActiveStandard(std);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching student profile for maths formulas:", err);
      }
    }
    fetchStudentClass();
  }, [session]);

  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  const [gameMode, setGameMode] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<any>(null);


  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleCopy = (e: React.MouseEvent, id: number, textToCopy: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      showToast("Formula magically copied! ✨");
    }).catch(() => {
      showToast("Failed to copy formula 😢");
    });
  };

  const openSandbox = (formula: any, cat: any) => {
    setSelectedFormula({ ...formula, cat });
    setModalOpen(true);
  };

  const toggleGameMode = () => {
    setGameMode(!gameMode);
    setRevealed(new Set());
    if (!gameMode) showToast("🎮 Game Mode Activated! Test your memory!");
    else showToast("📚 Switched back to Study Mode.");
  };

  const toggleReveal = (id: number) => {
    setRevealed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        showToast("Great memory! +10 XP 🌟");
      }
      return next;
    });
  };

  let filteredFormulas = samacheerFormulas.filter(f => f.standard === activeStandard);
  if (activeTerm !== "all") {
    filteredFormulas = filteredFormulas.filter(f => f.term === activeTerm);
  }

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
      subtitle={`Interactive syllabus formulas tailored for Standard ${activeStandard}`}
    >
      <div className="flex flex-col gap-6 text-left">

        {/* Premium Glassmorphism Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2 glass rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-wider mb-1 flex items-center gap-2">
              <i className="fi fi-sr-calculator text-emerald-600 dark:text-emerald-400 flex items-center text-xl" />
              {lang === "en" ? "Maths Magic Formulas" : "கணித சூத்திரங்கள்"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {lang === "en" ? "Interactive syllabus formulas tailored for Standards 6-10" : "6-10 வகுப்புகளுக்கான ஊடாடும் கணித சூத்திரங்கள்"}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm rounded-xl border border-emerald-200/20 shadow-sm whitespace-nowrap">
              <i className="fi fi-sr-school flex items-center text-sm" />
              Standard {activeStandard} Portal
            </span>
            <button 
              onClick={() => window.open("/student/maths-formulas/quiz", "_blank")}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl border border-indigo-700 shadow-sm whitespace-nowrap transition-colors"
            >
              <i className="fi fi-sr-play-alt flex items-center text-sm" />
              Test Yourself
            </button>
          </div>
        </div>

        {/* Playful Search and Categories Header */}
        <div className="bg-white dark:bg-slate-900/40 p-6 flex flex-col xl:flex-row gap-6 justify-between items-center rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden text-left">
          <div className="absolute right-0 top-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

          <div className="w-full xl:w-2/3 flex flex-wrap lg:flex-nowrap items-center gap-3">
            <div className="relative w-full sm:flex-1 min-w-[200px]">
              <i className="fi fi-sr-search absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 flex items-center text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search formulas..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-900 dark:text-indigo-100 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-900 transition-all shadow-inner placeholder:text-indigo-350 dark:placeholder:text-indigo-700"
              />
            </div>

            {/* Read-only Grade Indicator Badge & Term Filter */}
            <div className="relative flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto items-center">
              <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/30 dark:border-indigo-900/30 text-indigo-900 dark:text-indigo-200 px-4 py-3 rounded-2xl text-xs font-black shadow-sm shrink-0">
                <i className="fi fi-sr-graduation-cap text-indigo-600 dark:text-indigo-400 flex items-center text-sm" />
                <span>Standard {activeStandard}</span>
              </div>

              <select
                value={activeTerm}
                onChange={(e) => {
                  setActiveTerm(e.target.value);
                  setActiveCat("all");
                }}
                className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-900 dark:text-indigo-100 rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all shadow-sm cursor-pointer"
              >
                <option value="all">All Terms</option>
                <option value="1">Term I</option>
                <option value="2">Term II</option>
                <option value="3">Term III</option>
              </select>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
              <button
                onClick={() => setLang(l => l === "en" ? "ta" : "en")}
                className="p-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2 flex-1 sm:flex-none justify-center"
                title="Toggle Language"
              >
                {lang === "en" ? "English" : "தமிழ்"}
              </button>

              <button
                onClick={toggleGameMode}
                className={`p-3 rounded-2xl border transition-all flex-shrink-0 flex-1 sm:flex-none flex items-center justify-center ${gameMode
                    ? "bg-amber-400 border-amber-500 text-amber-900 shadow-md scale-105"
                    : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                  }`}
                title="Toggle Game Mode"
              >
                <i className="fi fi-sr-play-alt text-lg flex items-center" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            <button
              onClick={() => setActiveCat("all")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${activeCat === "all"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md scale-105"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 border border-transparent"
                }`}
            >
              <i className="fi fi-sr-book-open-cover flex items-center text-xs" />
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 border ${activeCat === cat.id
                    ? `${cat.color} border-slate-300 shadow-md scale-105`
                    : `bg-slate-50 dark:bg-slate-800 text-slate-550 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:scale-105`
                  }`}
              >
                {cat.icon}
                {cat.name[lang]}
              </button>
            ))}
          </div>
        </div>

        {/* Playful Formulas Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFormulas.map(formula => {
            const cat = categories.find(c => c.id === formula.category);
            return (
              <div key={formula.id} className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group flex flex-col relative overflow-hidden border border-slate-200 dark:border-slate-800 p-2">

                {/* Dynamic Formula Display based on Game Mode */}
                {gameMode ? (
                  <div
                    onClick={() => toggleReveal(formula.id)}
                    className={`w-full h-36 rounded-t-2xl rounded-b-xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all duration-300 ${revealed.has(formula.id)
                        ? "shadow-sm"
                        : "bg-slate-800 dark:bg-slate-950 border border-slate-600/40 hover:bg-slate-700"
                      }`}
                    style={revealed.has(formula.id) ? getFormulaBgStyle(formula) : {}}
                  >
                    {revealed.has(formula.id) ? (
                      <span className="font-mono text-xl sm:text-2xl font-black !text-white text-center drop-shadow-md animate-in zoom-in duration-300" style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}>
                        {formula.formula}
                      </span>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-amber-400 transition-colors">
                        <i className="fi fi-sr-play-alt text-3xl mb-2 opacity-50 group-hover:opacity-100 group-hover:animate-bounce flex items-center justify-center" />
                        <span className="font-black text-[10px] tracking-widest uppercase text-center">
                          Tap to Reveal
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="w-full h-36 rounded-t-2xl rounded-b-xl flex items-center justify-center p-6 relative shadow-sm"
                    style={getFormulaBgStyle(formula)}
                  >
                    <span className="font-mono text-xl sm:text-2xl font-black !text-white text-center drop-shadow-md" style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}>
                      {formula.formula}
                    </span>

                    <button
                      onClick={(e) => handleCopy(e, formula.id, formula.formula)}
                      className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all shadow-sm active:scale-95 z-10"
                      title="Copy Formula"
                    >
                      {copiedId === formula.id ? (
                        <i className="fi fi-sr-check flex items-center text-xs" />
                      ) : (
                        <i className="fi fi-sr-copy flex items-center text-xs" />
                      )}
                    </button>

                    {/* Grade Badge */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-1 text-[9px] font-black text-slate-700 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm">
                      Standard {formula.standard}
                    </div>

                    {formula.popular && (
                      <div className="absolute top-4 left-4 flex items-center gap-1 text-[9px] font-black text-amber-900 bg-amber-400 px-2.5 py-1 rounded-lg shadow-md rotate-[-5deg]">
                        <i className="fi fi-sr-star text-[10px] flex items-center text-amber-900" />
                        POPULAR
                      </div>
                    )}
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-3">
                    <div className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${cat?.color}`}>
                      {cat?.icon ? React.cloneElement(cat.icon as React.ReactElement, { className: "w-3 h-3 flex items-center" }) : <i className="fi fi-sr-stats flex items-center text-[10px]" />}
                      {cat?.name[lang]}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">
                      Term {formula.term}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-2 line-clamp-1">
                    {formula.title[lang]}
                  </h3>
                  {formula.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
                      {formula.description[lang]}
                    </p>
                  )}

                  <button
                    onClick={() => openSandbox(formula, cat)}
                    className="w-full mt-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-black text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm"
                  >
                    Interactive Sandbox
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Global fill quiz section moved to /quiz/page.tsx */}

      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[120] bg-indigo-900 !text-white font-extrabold text-xs px-5 py-3 rounded-2xl border border-indigo-750 shadow-2xl animate-in slide-in-from-bottom duration-300" style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}>
          {toastMsg}
        </div>
      )}

      {/* Formula Sandbox Modal */}
      {modalOpen && selectedFormula && (
        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
            <div
              className="w-full h-40 flex items-center justify-center p-6 relative"
              style={getFormulaBgStyle(selectedFormula)}
            >
              <span className="font-mono text-3xl font-black !text-white text-center drop-shadow-md" style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}>
                {selectedFormula.formula}
              </span>

              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm transition-all"
              >
                ✕
              </button>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{selectedFormula.title[lang]}</h3>
                <div className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border bg-white dark:bg-slate-800 ${selectedFormula.cat?.color}`}>
                  {selectedFormula.cat?.name[lang]}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-h-[250px]">
                <div className="h-full flex flex-col justify-center">
                  <FormulaSandboxLoader formula={selectedFormula} />
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
