"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { Calculator, Search, Sigma, Pi, DivideSquare, BookOpen, Copy, Star, Check, Zap, Gamepad2, BrainCircuit, Joystick, GraduationCap, X, Plus, Edit2, Trash2, UploadCloud, Sparkles, FileText, Loader2, Globe, EyeOff, Send } from "lucide-react";
import Swal from "sweetalert2";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

export function formatMathFormula(str: string): string {
  if (!str) return "";
  let res = str;

  // Common numerical fractions
  res = res.replace(/\\frac\{1\}\{2\}/g, "½");
  res = res.replace(/\\frac\{1\}\{3\}/g, "⅓");
  res = res.replace(/\\frac\{2\}\{3\}/g, "⅔");
  res = res.replace(/\\frac\{1\}\{4\}/g, "¼");
  res = res.replace(/\\frac\{3\}\{4\}/g, "¾");
  res = res.replace(/\\frac\{1\}\{8\}/g, "⅛");

  // General \frac{num}{den} -> (num / den)
  res = res.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_match, num, den) => {
    const cleanNum = num.trim();
    const cleanDen = den.trim();
    if (cleanNum.length === 1 && cleanDen.length === 1) {
      return `${cleanNum}/${cleanDen}`;
    }
    return `(${cleanNum}/${cleanDen})`;
  });

  // Math Operators & Symbols
  res = res.replace(/\\times/g, "×");
  res = res.replace(/\\cdot/g, "·");
  res = res.replace(/\\div/g, "÷");
  res = res.replace(/\\pm/g, "±");
  res = res.replace(/\\pi/g, "π");
  res = res.replace(/\\theta/g, "θ");
  res = res.replace(/\\alpha/g, "α");
  res = res.replace(/\\beta/g, "β");
  res = res.replace(/\\gamma/g, "γ");
  res = res.replace(/\\sqrt\{([^{}]+)\}/g, "√($1)");
  res = res.replace(/\\sqrt/g, "√");
  res = res.replace(/\\le/g, "≤");
  res = res.replace(/\\ge/g, "≥");
  res = res.replace(/\\neq/g, "≠");
  res = res.replace(/\\approx/g, "≈");

  // Subscripts
  res = res.replace(/_0/g, "₀");
  res = res.replace(/_1/g, "₁");
  res = res.replace(/_2/g, "₂");
  res = res.replace(/_3/g, "₃");
  res = res.replace(/_4/g, "₄");
  res = res.replace(/_5/g, "₅");
  res = res.replace(/_6/g, "₆");
  res = res.replace(/_7/g, "₇");
  res = res.replace(/_8/g, "₈");
  res = res.replace(/_9/g, "₉");
  res = res.replace(/_n/g, "ₙ");
  res = res.replace(/_x/g, "ₓ");
  res = res.replace(/_y/g, "ᵧ");

  // Superscripts
  res = res.replace(/\^0/g, "⁰");
  res = res.replace(/\^1/g, "¹");
  res = res.replace(/\^2/g, "²");
  res = res.replace(/\^3/g, "³");
  res = res.replace(/\^4/g, "⁴");
  res = res.replace(/\^5/g, "⁵");
  res = res.replace(/\^6/g, "⁶");
  res = res.replace(/\^7/g, "⁷");
  res = res.replace(/\^8/g, "⁸");
  res = res.replace(/\^9/g, "⁹");
  res = res.replace(/\^n/g, "ⁿ");

  // Remove leftover backslashes or braces
  res = res.replace(/\\left\(/g, "(");
  res = res.replace(/\\right\)/g, ")");
  res = res.replace(/\\/g, "");

  return res.trim();
}


export default function MathsFormulasPage() {
  const { lang: portalLang } = usePortalLanguage();
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

  // Unit Title Upload Modal State
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [unitTitleInput, setUnitTitleInput] = useState("");
  const [unitStandardInput, setUnitStandardInput] = useState("6");
  const [unitTermInput, setUnitTermInput] = useState("1");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContext, setFileContext] = useState("");
  const [generatingUnit, setGeneratingUnit] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    if (!unitTitleInput.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setUnitTitleInput(cleanName);
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContext((event.target?.result as string || "").slice(0, 15000));
    };
    reader.readAsText(file);
  };

  const handleGenerateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitTitleInput.trim() && !fileContext.trim()) {
      showToast("Please enter a unit title or upload a unit document.");
      return;
    }

    try {
      setGeneratingUnit(true);
      const res = await fetch(`${API_URL}/api/teacher/maths-formulas/generate-by-unit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitTitle: unitTitleInput || (uploadedFile ? uploadedFile.name.replace(/\.[^/.]+$/, "") : "Unit Formulas"),
          standard: unitStandardInput,
          term: unitTermInput,
          extraContext: fileContext
        })
      });
      const data = await res.json();
      if (data.success) {
        setUnitModalOpen(false);
        const addedTitle = unitTitleInput;
        setUnitTitleInput("");
        setUploadedFile(null);
        setFileContext("");
        setActiveStandard(unitStandardInput);
        setActiveTerm(unitTermInput);
        setActiveCat("all");
        await fetchFormulas();
        showToast(` Generated ${data.count} formulas for Unit "${addedTitle}"!`);
      } else {
        Swal.fire({ icon: "error", title: "Generation Failed", text: data.error || "Could not generate formulas" });
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: err.message || "Failed to generate formulas." });
    } finally {
      setGeneratingUnit(false);
    }
  };

  // Database Formulas State
  const [formulas, setFormulas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFormulas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/teacher/maths-formulas`);
      const data = await res.json();
      if (data.success) {
        // console.log("PostgreSQL Fetched Formulas:", data.data);
        setFormulas(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching formulas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormulas();
  }, []);

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

  const handleTogglePublish = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/teacher/maths-formulas/${id}/toggle-publish`, {
        method: "PATCH"
      });
      const data = await res.json();
      if (data.success) {
        setFormulas(prev =>
          prev.map(f => (f.id === id ? { ...f, isPublished: data.data.isPublished } : f))
        );
        if (data.data.isPublished) {
          showToast("Formula published to class students!");
        } else {
          showToast("Formula unpublished (saved as draft).");
        }
      }
    } catch (err) {
      console.error("Error toggling publish state:", err);
      showToast("Failed to update publish status.");
    }
  };

  const handleBulkPublish = async (isPublished: boolean = true) => {
    const actionText = isPublished ? "Publish" : "Unpublish";
    const result = await Swal.fire({
      title: `${actionText} Class Formulas?`,
      text: isPublished
        ? `This will make all formulas in Standard ${activeStandard} visible to students on their portal.`
        : `This will hide all formulas in Standard ${activeStandard} from students.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Yes, ${actionText} All`,
      confirmButtonColor: isPublished ? "#9333ea" : "#f59e0b"
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/teacher/maths-formulas/publish-bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          standard: activeStandard,
          term: activeTerm,
          isPublished
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchFormulas();
        showToast(
          isPublished
            ? ` Published ${data.count} formulas to Standard ${activeStandard} students!`
            : ` Hidden ${data.count} formulas from student portal.`
        );
      }
    } catch (err) {
      console.error("Error in bulk publishing:", err);
      showToast("Failed to bulk publish formulas.");
    }
  };

  // Form State
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [fTitleEn, setFTitleEn] = useState("");
  const [fTitleTa, setFTitleTa] = useState("");
  const [fFormula, setFFormula] = useState("");
  const [fCategory, setFCategory] = useState("");
  const [fCategoryNameEn, setFCategoryNameEn] = useState("");
  const [fCategoryNameTa, setFCategoryNameTa] = useState("");
  const [fStandard, setFStandard] = useState("");
  const [fTerm, setFTerm] = useState("");
  const [fMnemonicText, setFMnemonicText] = useState("");
  const [fMnemonicPrompt, setFMnemonicPrompt] = useState("");

  const resetForm = () => {
    setEditId(null);
    setFTitleEn("");
    setFTitleTa("");
    setFFormula("");
    setFCategory("");
    setFCategoryNameEn("");
    setFCategoryNameTa("");
    setFStandard("");
    setFTerm("");
    setFMnemonicText("");
    setFMnemonicPrompt("");
  };

  const handleEditClick = (formula: any) => {
    setEditId(formula.id);
    setFTitleEn(formula.titleEn);
    setFTitleTa(formula.titleTa);
    setFFormula(formula.formula);
    setFCategory(formula.category);
    setFCategoryNameEn(formula.categoryNameEn);
    setFCategoryNameTa(formula.categoryNameTa);
    setFStandard(formula.standard);
    setFTerm(formula.term || "3");
    setFMnemonicText(formula.mnemonicText || "");
    setFMnemonicPrompt(formula.mnemonicPrompt || "");
    setFormOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Formula?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      confirmButtonColor: "#ef4444"
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/teacher/maths-formulas/${id}`, { method: "DELETE" });
      if (res.ok) fetchFormulas();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      titleEn: fTitleEn,
      titleTa: fTitleTa,
      formula: fFormula,
      category: fCategory,
      categoryNameEn: fCategoryNameEn,
      categoryNameTa: fCategoryNameTa,
      standard: fStandard,
      term: fTerm,
      mnemonicText: fMnemonicText,
      mnemonicPrompt: fMnemonicPrompt,
      popular: false,
      bg: "from-blue-400 to-indigo-500" // default
    };

    try {
      let res;
      if (editId) {
        res = await fetch(`${API_URL}/api/teacher/maths-formulas/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_URL}/api/teacher/maths-formulas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      if (res.ok) {
        setFormOpen(false);
        resetForm();
        fetchFormulas();
        showToast("Formula saved successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter logic
  let filteredFormulas = formulas.filter(f => f.standard === activeStandard);
  if (activeTerm !== "all") {
    filteredFormulas = filteredFormulas.filter(f => f.term === activeTerm);
  }

  // Dynamically compute categories from filtered formulas
  const dynamicCategoriesMap = new Map();
  filteredFormulas.forEach(f => {
    if (!dynamicCategoriesMap.has(f.category)) {
      dynamicCategoriesMap.set(f.category, {
        id: f.category,
        name: { en: f.categoryNameEn, ta: f.categoryNameTa },
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
      f.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.titleTa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.formula.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <PortalLayout
      title={portalLang === "தமிழ்" ? "கணித மாயா விளக்கங்கள்" : "Maths Magic Formulas"}
      subtitle={portalLang === "தமிழ்" ? "கணிதத்திற்கான உங்களின் சுபர்-சக்தி இன்டரக்டிவ் உதவியேடு!" : "Your super-powered interactive cheat sheet for math!"}
    >
      <div className="flex flex-col gap-8">

        {/* Playful Search and Categories Header */}
        <div className="bg-white dark:bg-slate-800 p-5 flex flex-col xl:flex-row gap-5 justify-between items-center rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">

          <div className="absolute right-0 top-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

          <div className="w-full xl:w-1/2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 z-10">
            {/* Standard Modern Search Bar */}
            <div className="relative flex-1 flex items-center bg-white dark:bg-slate-900 border border-indigo-500/50 dark:border-indigo-500 rounded-full p-1 focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all">
              <Search className="w-4 h-4 text-indigo-400 ml-3 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={portalLang === "தமிழ்" ? "விளக்கங்கள் தேடு..." : "Search formulas..."}
                className="flex-1 bg-transparent border-none text-slate-700 dark:text-slate-200 text-sm px-3 py-1.5 focus:outline-none focus:ring-0 placeholder:text-slate-400"
              />
              <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm flex-shrink-0">
                Search
              </button>
            </div>

            {/* Standard & Term Selector */}
            <div className="relative flex gap-2">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <select
                  value={activeStandard}
                  onChange={(e) => {
                    setActiveStandard(e.target.value);
                    setActiveCat("all");
                    showToast(`Viewing formulas for Standard ${e.target.value}`);
                  }}
                  className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all cursor-pointer"
                >
                  <option value="6">Standard 6</option>
                  <option value="7">Standard 7</option>
                  <option value="8">Standard 8</option>
                  <option value="9">Standard 9</option>
                  <option value="10">Standard 10</option>
                  <option value="11">Standard 11</option>
                  <option value="12">Standard 12</option>
                </select>
              </div>

              <select
                value={activeTerm}
                onChange={(e) => {
                  setActiveTerm(e.target.value);
                  setActiveCat("all");
                }}
                className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all cursor-pointer"
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
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
              title="Toggle Language"
            >
              {lang === "en" ? "EN" : "தமிழ்"}
            </button>

            <button
              onClick={toggleGameMode}
              className={`p-2 rounded-xl border transition-all flex-shrink-0 ${gameMode
                ? "bg-amber-100 border-amber-300 text-amber-600 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              title="Toggle Game Mode"
            >
              <Gamepad2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setUnitStandardInput(activeStandard);
                setUnitTermInput(activeTerm === "all" ? "1" : activeTerm);
                setUnitModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md flex items-center gap-1.5 text-sm flex-shrink-0"
              title="Upload Unit Title & Auto-Generate Formulas"
            >
              <UploadCloud className="w-4 h-4" /> Upload Unit Title
            </button>

            <button
              onClick={() => handleBulkPublish(true)}
              className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-md flex items-center gap-1.5 text-sm flex-shrink-0"
              title={`Publish all formulas in Standard ${activeStandard} to students`}
            >
              <Send className="w-4 h-4" /> Publish Class
            </button>

            <button
              onClick={() => { resetForm(); setFormOpen(true); }}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md flex items-center gap-1 text-sm flex-shrink-0"
              title="Add Single Formula"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 hide-scrollbar">
            <button
              onClick={() => setActiveCat("all")}
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeCat === "all"
                ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                : "bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                }`}
            >
              <BookOpen className="w-4 h-4" />
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeCat === cat.id
                  ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                  : "bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
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
                    className={`w-full h-36 rounded-t-[2rem] rounded-b-2xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all duration-300 ${revealed.has(formula.id)
                      ? `bg-gradient-to-br ${formula.bg}`
                      : "bg-slate-800 dark:bg-slate-900 border-2 border-dashed border-slate-600 hover:bg-slate-700"
                      }`}
                  >
                    {revealed.has(formula.id) ? (
                      <span className="font-mono text-2xl font-black text-white text-center drop-shadow-md animate-in zoom-in duration-300">
                        {formatMathFormula(formula.formula)}
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
                    <p className="font-mono text-2xl font-black !text-white text-center drop-shadow-md">
                      {formatMathFormula(formula.formula)}
                    </p>

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
                      {cat?.icon ? React.cloneElement(cat.icon as React.ReactElement, { className: "w-3 h-3" }) : <Sigma className="w-3 h-3" />}
                      {cat?.name[lang]}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePublish(formula.id);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 transition-all ${
                        formula.isPublished !== false
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                          : "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                      }`}
                      title={formula.isPublished !== false ? "Visible to students. Click to unpublish" : "Draft (hidden from students). Click to publish"}
                    >
                      {formula.isPublished !== false ? (
                        <>
                          <Globe className="w-3 h-3 text-emerald-600" /> Published
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 text-amber-600" /> Draft (Hidden)
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-5 leading-tight">{lang === "en" ? formula.titleEn : formula.titleTa}</h3>

                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => openSandbox(formula, cat)}
                      className="flex-1 py-3 rounded-2xl text-xs font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all active:scale-95 border-2 border-indigo-200 flex items-center justify-center gap-2">
                      <Joystick className="w-4 h-4" /> Interactive Sandbox
                    </button>
                    <button
                      onClick={() => handleEditClick(formula)}
                      className="p-3 rounded-2xl text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all active:scale-95"
                      title="Edit Formula"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(formula.id)}
                      className="p-3 rounded-2xl text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all active:scale-95"
                      title="Delete Formula"
                    >
                      <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-lg shadow-2xl border-4 border-slate-100 dark:border-slate-700 animate-in zoom-in-95 flex flex-col overflow-hidden">

            {/* Modal Header (Formula Display) */}
            <div className={`w-full h-32 bg-gradient-to-br ${selectedFormula.bg} flex items-center justify-center p-6 relative shadow-inner`}>
              <span className="font-mono text-3xl font-black text-white text-center drop-shadow-md">
                {formatMathFormula(selectedFormula.formula)}
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
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{lang === "en" ? selectedFormula.titleEn : selectedFormula.titleTa}</h3>
                <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 bg-white ${selectedFormula.cat?.color}`}>
                  {selectedFormula.cat?.name[lang]}
                </div>
              </div>

              <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setActiveTab("playground")}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${activeTab === "playground" ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  <Joystick className="w-4 h-4" /> Sandbox
                </button>
                <button
                  onClick={() => setActiveTab("memory")}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${activeTab === "memory" ? "bg-white dark:bg-slate-800 text-pink-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  <BrainCircuit className="w-4 h-4" /> Memory Trick
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 min-h-[250px]">
                {activeTab === "playground" && (
                  <div className="h-full flex flex-col justify-center">
                    <FormulaSandboxLoader formula={selectedFormula} />
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
                        <span className="!text-white text-[10px] font-bold uppercase tracking-widest opacity-80 flex items-center gap-1">
                          <BrainCircuit className="w-3 h-3 !text-white" /> AI Generated Mnemonic
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

      {/* CRUD Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative animate-in zoom-in-95">
            <button onClick={() => setFormOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">{editId ? "Edit Formula" : "Add New Formula"}</h2>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Title (English)</label>
                  <input required value={fTitleEn} onChange={e => setFTitleEn(e.target.value)} className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Title (Tamil)</label>
                  <input required value={fTitleTa} onChange={e => setFTitleTa(e.target.value)} className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Formula</label>
                <input required value={fFormula} onChange={e => setFFormula(e.target.value)} placeholder="e.g. A = l × w" className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-mono text-sm" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Category Code</label>
                  <input required value={fCategory} onChange={e => setFCategory(e.target.value)} placeholder="e.g. measurements" className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Category (En)</label>
                  <input required value={fCategoryNameEn} onChange={e => setFCategoryNameEn(e.target.value)} className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Category (Ta)</label>
                  <input required value={fCategoryNameTa} onChange={e => setFCategoryNameTa(e.target.value)} className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Standard</label>
                  <select required value={fStandard} onChange={e => setFStandard(e.target.value)} className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm">
                    <option value="" disabled>Select Standard</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Term</label>
                  <select required value={fTerm} onChange={e => setFTerm(e.target.value)} className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm">
                    <option value="" disabled>Select Term</option>
                    <option value="1">Term I</option>
                    <option value="2">Term II</option>
                    <option value="3">Term III</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Mnemonic Text (Memory Trick)</label>
                <textarea value={fMnemonicText} onChange={e => setFMnemonicText(e.target.value)} className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm h-20 resize-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Mnemonic Image Prompt (For AI Generation)</label>
                <textarea value={fMnemonicPrompt} onChange={e => setFMnemonicPrompt(e.target.value)} className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm h-20 resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setFormOpen(false)} className="px-5 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md">
                  {editId ? "Update Formula" : "Save Formula"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unit Title Upload & AI Generation Modal */}
      {unitModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-xl shadow-2xl p-6 relative animate-in zoom-in-95 border-4 border-slate-100 dark:border-slate-700">
            <button
              onClick={() => setUnitModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
              disabled={generatingUnit}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white">Upload Unit Title</h2>
                <p className="text-xs text-slate-500 font-medium">Auto-generate and import all formulas for a unit using Gemini AI</p>
              </div>
            </div>

            <form onSubmit={handleGenerateUnit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Unit Title (Topic / Chapter Name) *
                </label>
                <input
                  type="text"
                  required={!uploadedFile}
                  value={unitTitleInput}
                  onChange={(e) => setUnitTitleInput(e.target.value)}
                  placeholder="e.g. Measurements, Algebra, Trigonometry, Coordinate Geometry"
                  className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Standard (Grade)</label>
                  <select
                    value={unitStandardInput}
                    onChange={(e) => setUnitStandardInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:outline-none"
                  >
                    <option value="6">Standard 6</option>
                    <option value="7">Standard 7</option>
                    <option value="8">Standard 8</option>
                    <option value="9">Standard 9</option>
                    <option value="10">Standard 10</option>
                    <option value="11">Standard 11</option>
                    <option value="12">Standard 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Term</label>
                  <select
                    value={unitTermInput}
                    onChange={(e) => setUnitTermInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:outline-none"
                  >
                    <option value="1">Term I</option>
                    <option value="2">Term II</option>
                    <option value="3">Term III</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Or Upload Syllabus / Unit File (Optional: .txt, .csv, .json, .pdf)
                </label>
                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-4 text-center transition-all bg-slate-50/50 dark:bg-slate-900/50">
                  <input
                    type="file"
                    accept=".txt,.csv,.json,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-1.5 text-slate-500">
                    <FileText className="w-7 h-7 text-emerald-500" />
                    {uploadedFile ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        📁 {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
                      </span>
                    ) : (
                      <span className="text-xs font-medium">
                        Click or drag & drop unit syllabus file here
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setUnitModalOpen(false)}
                  disabled={generatingUnit}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generatingUnit}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {generatingUnit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Generating Formulas with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Generate Unit Formulas
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
