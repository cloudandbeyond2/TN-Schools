"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import Swal from "sweetalert2";
import { FlaskConical, Flame, Droplets, ShieldAlert, Calendar, BookOpen, AlertTriangle, X, Sparkles, Zap, Eye, Microscope, Trash2, Settings, CheckCircle, MapPin, Tag, Star, Clock, Stethoscope, Rocket } from "lucide-react";

interface Experiment {
  id: string;
  title: string;
  classSection: string;
  date: string;
  type: string;
  status: string;
  color: string;
  raw: any;
}

interface Ingredient {
  id: string;
  name: string;
  location: string;
  count: number;
  status: string;
}

export default function ChemistryLabPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentExp, setCurrentExp] = useState<Experiment | null>(null);

  // View Modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewExp, setViewExp] = useState<any | null>(null);

  // Structured dynamic lists for Add/Edit Form
  const [formApparatus, setFormApparatus] = useState<string[]>([]);
  const [formChemicals, setFormChemicals] = useState<string[]>([]);
  const [formProcedure, setFormProcedure] = useState<string[]>([]);
  const [formImageUrl, setFormImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [toastMsg, setToastMsg] = useState("");
  const [selectedSim, setSelectedSim] = useState(
    "https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_all.html"
  );

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const getExperimentColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("volumetric") || t.includes("titration")) return "blue";
    if (t.includes("qualitative") || t.includes("identification")) return "emerald";
    if (t.includes("organic")) return "purple";
    if (t.includes("inorganic") || t.includes("reaction")) return "orange";
    return "teal";
  };

  // Helper to parse JSON safely with legacy plain text fallback
  const safeParseArray = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      return String(value).split("\n").map(s => s.trim()).filter(Boolean);
    }
    return [String(value)];
  };

  // Fetch all lab items (experiments and ingredients) from DB
  const fetchLabData = useCallback(async () => {
    if (!schoolId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/teacher/labs?schoolId=${schoolId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const allItems = data.data;

        // Group into Experiments and Ingredients
        const expList: Experiment[] = [];
        const ingList: Ingredient[] = [];

        allItems.forEach((item: any) => {
          const isExperiment = ["scheduled", "completed", "active"].includes(item.status);
          if (isExperiment) {
            expList.push({
              id: item.id,
              title: item.name,
              classSection: item.classSection || "Class 11A",
              date: item.date || "TBD",
              type: item.category || item.classRoomId || "General",
              status: item.status,
              color: getExperimentColor(item.category || item.classRoomId || item.name),
              raw: item
            });
          } else {
            ingList.push({
              id: item.id,
              name: item.name,
              location: item.location || "Cabinet A",
              count: item.count || 1,
              status: item.status || "Good"
            });
          }
        });

        setExperiments(expList);
        setIngredients(ingList);
      }
    } catch (err) {
      console.error("Error fetching lab data:", err);
    } finally {
      setLoading(false);
    }
  }, [schoolId, API_URL]);

  useEffect(() => {
    fetchLabData();
  }, [fetchLabData]);

  // Handle Dynamic Lists adding/removing
  const addApparatus = () => setFormApparatus([...formApparatus, ""]);
  const updateApparatus = (idx: number, val: string) => {
    const list = [...formApparatus];
    list[idx] = val;
    setFormApparatus(list);
  };
  const removeApparatus = (idx: number) => {
    const list = formApparatus.filter((_, i) => i !== idx);
    setFormApparatus(list.length ? list : [""]);
  };

  const addChemical = () => setFormChemicals([...formChemicals, ""]);
  const updateChemical = (idx: number, val: string) => {
    const list = [...formChemicals];
    list[idx] = val;
    setFormChemicals(list);
  };
  const removeChemical = (idx: number) => {
    const list = formChemicals.filter((_, i) => i !== idx);
    setFormChemicals(list.length ? list : [""]);
  };

  const addStep = () => setFormProcedure([...formProcedure, ""]);
  const updateStep = (idx: number, val: string) => {
    const list = [...formProcedure];
    list[idx] = val;
    setFormProcedure(list);
  };
  const removeStep = (idx: number) => {
    const list = formProcedure.filter((_, i) => i !== idx);
    setFormProcedure(list.length ? list : [""]);
  };

  // Diagram Upload API handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadingImage(true);
      const res = await fetch(`${API_URL}/api/teacher/labs/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success && data.url) {
        setFormImageUrl(data.url);
        Swal.fire({
          icon: "success",
          title: lang === "தமிழ்" ? "படம் பதிவேற்றப்பட்டது!" : "Image Uploaded!",
          text: lang === "தமிழ்" ? "பரிசோதனை வரைபடம் வெற்றிகரமாக பதிவேற்றப்பட்டது." : "Experiment diagram uploaded successfully.",
          confirmButtonColor: "#14b8a6",
        });
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err: any) {
      console.error("Image upload error:", err);
      Swal.fire({
        icon: "error",
        title: lang === "தமிழ்" ? "பதிவேற்றம் தோல்வியடைந்தது" : "Upload Failed",
        text: err.message || "Could not upload image.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // AI content auto-fill
  const handleAIFill = async () => {
    const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
    const gradeSelect = document.querySelector('select[name="gradeLevel"]') as HTMLSelectElement;
    const name = titleInput?.value;
    const gradeLevel = gradeSelect?.value || "Class 11";

    if (!name || name.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: lang === "தமிழ்" ? "தலைப்பு தேவை" : "Name Required",
        text: lang === "தமிழ்" ? "முன்னர் சோதனையின் பெயரை உள்ளிடவும்." : "Please enter an experiment name first.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    try {
      setGenerating(true);
      const res = await fetch(`${API_URL}/api/teacher/labs/generate-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, gradeLevel })
      });
      const data = await res.json();
      if (data.success && data.data) {
        const payload = data.data;

        const aimInput = document.querySelector('textarea[name="aim"]') as HTMLTextAreaElement;
        const theoryInput = document.querySelector('textarea[name="theory"]') as HTMLTextAreaElement;
        const obsInput = document.querySelector('textarea[name="observation"]') as HTMLTextAreaElement;
        const calcInput = document.querySelector('textarea[name="calculation"]') as HTMLTextAreaElement;
        const resInput = document.querySelector('textarea[name="result"]') as HTMLTextAreaElement;
        const safetyInput = document.querySelector('textarea[name="safetyPrecautions"]') as HTMLTextAreaElement;
        const chapterInput = document.querySelector('input[name="chapter"]') as HTMLInputElement;
        const categorySelect = document.querySelector('select[name="category"]') as HTMLSelectElement;

        if (aimInput) aimInput.value = payload.aim || "";
        if (theoryInput) theoryInput.value = payload.theory || "";
        if (obsInput) obsInput.value = payload.observation || "";
        if (calcInput) calcInput.value = payload.calculation || "";
        if (resInput) resInput.value = payload.result || "";
        if (safetyInput) safetyInput.value = payload.safetyPrecautions || "";

        // ✅ Also fill Chapter and Category from AI response
        if (chapterInput && payload.chapter) {
          chapterInput.value = payload.chapter;
          // Trigger React synthetic event so the form picks up the new value
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(chapterInput, payload.chapter);
            chapterInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
        if (categorySelect && payload.category) {
          // Match the closest available option
          const options = Array.from(categorySelect.options).map(o => o.value.toLowerCase());
          const matchIdx = options.findIndex(o => o.includes(payload.category.toLowerCase().split(" ")[0]));
          if (matchIdx !== -1) {
            categorySelect.selectedIndex = matchIdx;
            categorySelect.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }

        if (payload.apparatus && Array.isArray(payload.apparatus)) {
          setFormApparatus(payload.apparatus.length ? payload.apparatus : [""]);
        }
        if (payload.chemicals && Array.isArray(payload.chemicals)) {
          setFormChemicals(payload.chemicals.length ? payload.chemicals : [""]);
        }
        if (payload.procedure && Array.isArray(payload.procedure)) {
          setFormProcedure(payload.procedure.length ? payload.procedure : [""]);
        }

        Swal.fire({
          icon: "success",
          title: lang === "தமிழ்" ? "உள்ளடக்கம் உருவாக்கப்பட்டது!" : "Content Generated!",
          text: lang === "தமிழ்" ? "செய்முறை விவரங்கள் வெற்றிகரமாக உருவாக்கப்பட்டு நிரப்பப்பட்டன." : "Experiment practical details generated and filled successfully.",
          confirmButtonColor: "#14b8a6",
        });
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (err: any) {
      console.error("AI Generation error:", err);
      Swal.fire({
        icon: "error",
        title: lang === "தமிழ்" ? "உருவாக்கம் தோல்வியடைந்தது" : "Generation Failed",
        text: err.message || "Failed to generate contents.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setGenerating(false);
    }
  };

  // Save new or modified experiment
  const handleSaveExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get("title") as string;
    const gradeLevel = formData.get("gradeLevel") as string;
    const section = formData.get("section") as string;
    const chapter = formData.get("chapter") as string;
    const category = formData.get("category") as string;
    const date = formData.get("date") as string;
    const status = formData.get("status") as string;
    const aim = formData.get("aim") as string;
    const theory = formData.get("theory") as string;
    const observation = formData.get("observation") as string;
    const calculation = formData.get("calculation") as string;
    const result = formData.get("result") as string;
    const safetyPrecautions = formData.get("safetyPrecautions") as string;

    // Filter empty values
    const filteredApparatus = formApparatus.map(s => s.trim()).filter(Boolean);
    const filteredChemicals = formChemicals.map(s => s.trim()).filter(Boolean);
    const filteredProcedure = formProcedure.map(s => s.trim()).filter(Boolean);

    const payload = {
      name: title,
      classSection: `${gradeLevel} - ${section}`,
      date,
      status,
      schoolId,
      classRoomId: category, // Fallback Category key
      category,
      gradeLevel,
      section,
      chapter,
      subject: "Chemistry",
      aim,
      theory,
      apparatus: JSON.stringify(filteredApparatus),
      chemicals: JSON.stringify(filteredChemicals),
      procedure: JSON.stringify(filteredProcedure),
      observation,
      calculation,
      result,
      safetyPrecautions,
      imageUrl: formImageUrl,
      safetyCheck: true
    };

    try {
      if (isEdit && currentExp) {
        // Edit mode (PUT)
        const res = await fetch(`${API_URL}/api/teacher/labs/${currentExp.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          Swal.fire({
            icon: "success",
            title: lang === "தமிழ்" ? "சோதனை புதுப்பிக்கப்பட்டது!" : "Experiment Updated!",
            text: lang === "தமிழ்" ? `"${title}" வெற்றிகரமாக புதுப்பிக்கப்பட்டது.` : `Successfully updated "${title}".`,
            confirmButtonColor: "#14b8a6",
          });
          fetchLabData();
        }
      } else {
        // Add mode (POST)
        const res = await fetch(`${API_URL}/api/teacher/labs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
          Swal.fire({
            icon: "success",
            title: lang === "தமிழ்" ? "சோதனை திட்டமிடப்பட்டது!" : "Experiment Planned!",
            text: lang === "தமிழ்" ? `"${title}" வெற்றிகரமாக திட்டமிடப்பட்டது.` : `"${title}" has been scheduled.`,
            confirmButtonColor: "#14b8a6",
          });
          fetchLabData();
        }
      }
      setModalOpen(false);
    } catch (err) {
      console.error("Error saving experiment:", err);
      Swal.fire({
        icon: "error",
        title: lang === "தமிழ்" ? "தரவுத்தள பிழை" : "Database Error",
        text: lang === "தமிழ்" ? "சோதனையைச் சேமிக்க முடியவில்லை." : "Could not save. Please check database connection.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // Delete experiment
  const handleDeleteExperiment = async (id: string, title: string) => {
    const confirm = await Swal.fire({
      title: lang === "தமிழ்" ? "சோதனையை நீக்கவா?" : "Delete Experiment?",
      text: lang === "தமிழ்" ? `"${title}"-ஐ நீக்க விரும்புகிறீர்களா?` : `Are you sure you want to remove "${title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: lang === "தமிழ்" ? "ஆம், நீக்கு" : "Yes, delete it",
      cancelButtonText: lang === "தமிழ்" ? "ரத்துசெய்" : "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#475569",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/api/teacher/labs/${id}`, {
          method: "DELETE"
        });
        const result = await res.json();
        if (result.success) {
          Swal.fire({
            icon: "success",
            title: lang === "தமிழ்" ? "நீக்கப்பட்டது!" : "Deleted!",
            text: lang === "தமிழ்" ? "சோதனை வெற்றிகரமாக நீக்கப்பட்டது." : `Successfully deleted "${title}".`,
            confirmButtonColor: "#14b8a6",
          });
          fetchLabData();
        }
      } catch (err) {
        console.error("Error deleting experiment:", err);
        Swal.fire({
          icon: "error",
          title: lang === "தமிழ்" ? "நீக்கம் தோல்வியடைந்தது" : "Delete Failed",
          text: lang === "தமிழ்" ? "நீக்கும் போது பிழை ஏற்பட்டது." : "An error occurred while deleting the experiment.",
          confirmButtonColor: "#ef4444",
        });
      }
    }
  };

  const handleOpenEdit = (exp: Experiment) => {
    setIsEdit(true);
    setCurrentExp(exp);

    // Populate structured lists
    const raw = exp.raw || {};
    setFormApparatus(safeParseArray(raw.apparatus).length ? safeParseArray(raw.apparatus) : [""]);
    setFormChemicals(safeParseArray(raw.chemicals).length ? safeParseArray(raw.chemicals) : [""]);
    setFormProcedure(safeParseArray(raw.procedure).length ? safeParseArray(raw.procedure) : [""]);
    setFormImageUrl(raw.imageUrl || "");

    setModalOpen(true);
  };

  const handleOpenCreate = () => {
    setIsEdit(false);
    setCurrentExp(null);

    // Reset lists
    setFormApparatus([""]);
    setFormChemicals([""]);
    setFormProcedure([""]);
    setFormImageUrl("");

    setModalOpen(true);
  };

  const filteredIngredients = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ing.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const safetyAlerts = [
    { msg: lang === "தமிழ்" ? "பாதுகாப்பு கண்ணாடிகளை அணியுங்கள்." : "Wear safety goggles.", level: "warning" },
    { msg: lang === "தமிழ்" ? "ஆசிரியரின் அறிவுறுத்தல்களைப் பின்பற்றுங்கள்." : "Follow teacher instructions.", level: "warning" },
    { msg: lang === "தமிழ்" ? "வேதிப்பொருட்களை கவனமாகக் கையாளுங்கள்." : "Handle chemicals carefully.", level: "critical" },
    { msg: lang === "தமிழ்" ? "அறிவுறுத்தல்கள் இன்றி வேதிப்பொருட்களைக் கலக்க வேண்டாம்." : "Do not mix chemicals without instructions.", level: "critical" },
    { msg: lang === "தமிழ்" ? "ஆய்வக உபகரணங்களைச் சரியாகப் பயன்படுத்துங்கள்." : "Use laboratory equipment correctly.", level: "warning" },
    { msg: lang === "தமிழ்" ? "ஆசிரியரின் மேற்பார்வையில் செய்முறைகளைச் செய்யுங்கள்." : "Perform practical work under teacher supervision.", level: "critical" }
  ];

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "வேதியியல் ஆய்வகம்" : "Chemistry Laboratory"}
      subtitle={lang === "தமிழ்" ? "சோதனைகளைத் திட்டமிடவும், மாணவர்களைத் தயார்படுத்தவும்." : "Plan experiments, prepare students for practical sessions, and manage laboratory activities."}
    >
      <div className="flex flex-col gap-6 md:gap-8" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>

        {/* Modern Sleek Banner — teal gradient matching Zoology Centre style */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-700 text-white p-6 md:p-8 shadow-sm border border-teal-500/20">
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-50px] right-[10%] w-48 h-48 bg-teal-400/20 rounded-full blur-2xl" />
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-15 transform scale-[1.3] pointer-events-none hidden md:block">
            <FlaskConical className="w-32 h-32 text-white" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-lg font-bold tracking-wider text-[10px] uppercase mb-2 border border-white/20">
                <FlaskConical className="w-3 h-3" /> {lang === "தமிழ்" ? "வேதியியல் ஆய்வகம்" : "Chemistry Lab"}
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1 text-white">
                {lang === "தமிழ்" ? "வேதியியல் ஆய்வகம்! 🧪" : "The Chem Lab! 🧪"}
              </h2>
              <p className="text-white/80 font-medium max-w-xl text-xs md:text-sm leading-relaxed">
                {lang === "தமிழ்" ? "சோதனைகளைத் திட்டமிடவும், செய்முறைக்கு முந்தைய பாடப்பகுதிகளைத் தயாரித்து மாணவர்களுக்கு வழங்கவும்." : "Plan school chemistry practicals, prepare structured syllabus contents, and manage lab activities."}
              </p>
            </div>
            <div className="shrink-0 flex flex-wrap gap-3">
              <a href="#virtual-lab-sim" className="px-5 py-3 bg-white text-teal-700 hover:bg-teal-50 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 border border-white/40 active:scale-95">
                <Sparkles className="w-4 h-4" /> {lang === "தமிழ்" ? "சிமுலேஷன்" : "Try Simulation"}
              </a>
              <button onClick={handleOpenCreate} className="px-5 py-3 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl transition-all border border-white/20 flex items-center gap-2 active:scale-95">
                <Zap className="w-4 h-4" /> {lang === "தமிழ்" ? "+ புதிய சோதனை" : "+ Add Experiment"}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">

          {/* Left / Main Column */}
          <div className="lg:col-span-2 space-y-5 md:space-y-6">

            {/* Experiments Section */}
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <div className="w-10 h-10 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  {lang === "தமிழ்" ? "செய்முறைச் சோதனைகள்" : "Experiments"}
                </h3>
                <button onClick={handleOpenCreate} className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all flex items-center gap-1.5">
                  + {lang === "தமிழ்" ? "புதிய சோதனை" : "Add Experiment"}
                </button>
              </div>

              {loading ? (
                <div className="text-center py-16 text-slate-400 text-xs font-bold">
                  <div className="w-8 h-8 rounded-full border-2 border-teal-500/30 border-t-teal-500 animate-spin mx-auto mb-4" />
                  <span>{lang === "தமிழ்" ? "தரவுத்தளத்திலிருந்து வாசிக்கப்படுகிறது..." : "Reading database..."}</span>
                </div>
              ) : experiments.length > 0 ? (
                <div className="space-y-3">
                  {experiments.map((exp) => {
                    const colorStyles = {
                      orange: { iconBg: "bg-orange-50 dark:bg-orange-950/30", iconText: "text-orange-500", badgeBg: "bg-orange-50 text-orange-600 border-orange-100", typeBadge: "bg-orange-50 text-orange-600 border-orange-100" },
                      emerald: { iconBg: "bg-emerald-50 dark:bg-emerald-950/30", iconText: "text-emerald-500", badgeBg: "bg-emerald-50 text-emerald-600 border-emerald-100", typeBadge: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                      purple: { iconBg: "bg-purple-50 dark:bg-purple-950/30", iconText: "text-purple-500", badgeBg: "bg-purple-50 text-purple-600 border-purple-100", typeBadge: "bg-purple-50 text-purple-600 border-purple-100" },
                      blue: { iconBg: "bg-blue-50 dark:bg-blue-950/30", iconText: "text-blue-500", badgeBg: "bg-blue-50 text-blue-600 border-blue-100", typeBadge: "bg-blue-50 text-blue-600 border-blue-100" },
                      teal: { iconBg: "bg-teal-50 dark:bg-teal-950/30", iconText: "text-teal-500", badgeBg: "bg-teal-50 text-teal-600 border-teal-100", typeBadge: "bg-teal-50 text-teal-600 border-teal-100" },
                    } as Record<string, any>;
                    const c = colorStyles[exp.color] || colorStyles.teal;

                    return (
                      <div key={exp.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl ${c.iconBg} ${c.iconText} flex items-center justify-center shrink-0`}>
                            <FlaskConical className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 leading-snug truncate">{exp.title}</h4>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${c.badgeBg}`}>
                                {exp.raw?.gradeLevel || "Class 11/12"} - {exp.raw?.section || "A"}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400">
                                {lang === "தமிழ்" ? "அதிகாரம்: " : "Ch: "}{exp.raw?.chapter || "N/A"}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400">{exp.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          <span className={`text-[9px] font-bold px-2 py-1 rounded-lg border uppercase tracking-wider hidden sm:inline ${c.typeBadge}`}>{exp.type}</span>
                          <button onClick={() => { setViewExp(exp.raw); setViewModalOpen(true); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors active:scale-90" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleOpenEdit(exp)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/20 text-teal-600 transition-colors active:scale-90" title="Edit">
                            <Settings className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteExperiment(exp.id, exp.title)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-500 transition-colors active:scale-90" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 text-sm font-bold bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  {lang === "தமிழ்" ? "சோதனைகள் எதுவும் இன்னும் திட்டமிடப்படவில்லை." : "No experiments planned yet."}
                </div>
              )}
            </div>

            {/* Virtual Chemistry Lab */}
            <div id="virtual-lab-sim" className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-lg flex items-center justify-center">
                      <Microscope className="w-5 h-5" />
                    </div>
                    {lang === "தமிழ்" ? "மெய்நிகர் வேதியியல் ஆய்வகம்" : "Virtual Chemistry Lab"}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-xs mt-1 ml-12">
                    {lang === "தமிழ்" ? "மாணவர்கள் சோதனைக்கு முன் பயிற்சி செய்யலாம்." : "Students can practice before the actual lab session."}
                  </p>
                </div>
              </div>

              {/* Simulation Selector Tabs — same as student side */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
                {[
                  { label: lang === "தமிழ்" ? "pH அளவு" : "pH Scale", url: "https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_all.html" },
                  { label: lang === "தமிழ்" ? "மோலாரிட்டி" : "Molarity", url: "https://phet.colorado.edu/sims/html/molarity/latest/molarity_all.html" },
                  { label: lang === "தமிழ்" ? "வேதிச் சமன்பாடு" : "Balancing Equations", url: "https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations_all.html" },
                  { label: lang === "தமிழ்" ? "அமில-காரம்" : "Acid-Base", url: "https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_all.html" },
                ].map((sim) => (
                  <button
                    key={sim.url}
                    type="button"
                    onClick={() => setSelectedSim(sim.url)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 whitespace-nowrap shrink-0 ${
                      selectedSim === sim.url
                        ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200"
                    }`}
                  >
                    {sim.label}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner bg-slate-950 w-full" style={{ minHeight: '280px', aspectRatio: '16/9' }}>
                <iframe
                  src={`${selectedSim}?locale=${lang === "தமிழ்" ? "ta" : "en"}`}
                  className="w-full h-full border-none"
                  style={{ minHeight: '280px' }}
                  allowFullScreen
                  title="Chemistry PhET Simulation"
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            {/* Safety Rules */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-rose-600 dark:text-rose-400 mb-5 flex items-center gap-2">
                <div className="w-9 h-9 bg-rose-50 dark:bg-rose-950/30 rounded-lg flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                </div>
                {lang === "தமிழ்" ? "பாதுகாப்பு விதிகள்!" : "Safety Rules!"}
              </h3>
              <div className="space-y-3">
                {safetyAlerts.map((alert, i) => (
                  <div key={i} className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                    alert.level === "critical"
                      ? "bg-rose-50/80 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-900"
                      : "bg-amber-50/80 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900"
                  }`}>
                    <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${alert.level === "critical" ? "animate-pulse" : ""}`} />
                    <p className="text-[11px] font-bold leading-tight">{alert.msg}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Lab Materials */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2">
                <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-indigo-500" />
                </div>
                {lang === "தமிழ்" ? "ஆய்வகப் பொருட்கள்" : "Laboratory Materials"}
              </h3>
              <div className="relative mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === "தமிழ்" ? "பொருட்களைத் தேடு..." : "Search lab materials..."}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
                <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              {searchQuery && (
                <div className="space-y-2 max-h-48 overflow-y-auto mb-4 pr-1">
                  {filteredIngredients.length > 0 ? (
                    filteredIngredients.map((ing) => (
                      <div key={ing.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                        <div>
                          <div className="font-extrabold text-slate-800 dark:text-white">{ing.name}</div>
                          <div className="text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{ing.location}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${
                          ing.status === "Low Stock" ? "bg-amber-50 text-amber-600 border-amber-100"
                            : ing.status === "Needs Maintenance" ? "bg-rose-50 text-rose-600 border-rose-100"
                            : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        }`}>
                          {lang === "தமிழ்" ? "அளவு: " : "Qty: "}{ing.count}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-3 text-slate-400 text-xs italic">{lang === "தமிழ்" ? "பொருந்தும் பொருட்கள் எதுவும் இல்லை" : "No matching materials"}</div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => showToast(lang === "தமிழ்" ? "வேதியியல் குறிப்பு திறக்கிறது!" : "Opening Chemical Reference...")} className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs font-bold text-slate-600 dark:text-slate-400 group">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-slate-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                  </div>
                  {lang === "தமிழ்" ? "வேதியியல் குறிப்பு" : "Chemical Reference"}
                </button>
                <button onClick={() => showToast(lang === "தமிழ்" ? "இருப்புச் சரிபார்ப்பு திறக்கிறது!" : "Opening Inventory...")} className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs font-bold text-slate-600 dark:text-slate-400 group">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-slate-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FlaskConical className="w-5 h-5 text-emerald-500" />
                  </div>
                  {lang === "தமிழ்" ? "பொருட்கள் இருப்பு" : "Inventory"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-bold z-50 flex items-center gap-3 border border-slate-700">
          <div className="w-3 h-3 bg-teal-400 rounded-full animate-ping" />
          {toastMsg}
        </div>
      )}

      {/* View Experiment Modal */}
      {viewModalOpen && viewExp && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-start p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest bg-teal-50 dark:bg-teal-950/30 px-2.5 py-1 rounded-lg border border-teal-100 dark:border-teal-900">
                  {viewExp.gradeLevel || "Class 11/12"} - {viewExp.section || "A"} | {viewExp.category || "General"}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-2">{viewExp.name}</h3>
                {viewExp.chapter && <p className="text-xs font-semibold text-slate-400 mt-0.5">Chapter: {viewExp.chapter}</p>}
              </div>
              <button onClick={() => { setViewModalOpen(false); setViewExp(null); }} className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-5 text-left">
              {viewExp.imageUrl && (
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 max-h-72 sm:max-h-96 md:max-h-[460px] flex justify-center items-center p-2">
                  <img
                    src={viewExp.imageUrl.startsWith("http") ? viewExp.imageUrl : `${API_URL}${viewExp.imageUrl}`}
                    alt={viewExp.name}
                    className="max-h-72 sm:max-h-96 md:max-h-[460px] object-contain w-full rounded-lg"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h4 className="font-extrabold text-teal-600 dark:text-teal-400 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Microscope className="w-3.5 h-3.5" /> Aim</h4>
                  <p className="text-xs leading-relaxed whitespace-pre-line font-medium text-slate-700 dark:text-slate-300">{viewExp.aim || "Not specified."}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h4 className="font-extrabold text-teal-600 dark:text-teal-400 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Theory</h4>
                  <p className="text-xs leading-relaxed whitespace-pre-line font-medium text-slate-700 dark:text-slate-300">{viewExp.theory || "Not specified."}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-teal-50/50 dark:bg-teal-950/10 p-4 rounded-xl border border-teal-100/50">
                  <h4 className="font-extrabold text-teal-600 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Settings className="w-3.5 h-3.5" /> Apparatus</h4>
                  {safeParseArray(viewExp.apparatus).length > 0 ? (
                    <ul className="list-disc pl-4 text-xs space-y-1">{safeParseArray(viewExp.apparatus).map((item, idx) => <li key={idx} className="font-medium text-slate-700 dark:text-slate-300">{item}</li>)}</ul>
                  ) : <p className="text-xs text-slate-400 italic">None listed.</p>}
                </div>
                <div className="bg-indigo-50/30 dark:bg-indigo-950/10 p-4 rounded-xl border border-indigo-100/50">
                  <h4 className="font-extrabold text-indigo-600 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5" /> Chemicals</h4>
                  {safeParseArray(viewExp.chemicals).length > 0 ? (
                    <ul className="list-disc pl-4 text-xs space-y-1">{safeParseArray(viewExp.chemicals).map((item, idx) => <li key={idx} className="font-medium text-slate-700 dark:text-slate-300">{item}</li>)}</ul>
                  ) : <p className="text-xs text-slate-400 italic">None listed.</p>}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <h4 className="font-extrabold text-teal-600 text-[10px] uppercase tracking-wider mb-3 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Procedure</h4>
                {(() => {
                  try {
                    const arr = JSON.parse(viewExp.procedure || "[]");
                    if (Array.isArray(arr) && arr.length && arr[0] !== "") {
                      return <ol className="space-y-2">{arr.map((step: string, i: number) => (
                        <li key={i} className="flex gap-2.5 text-xs">
                          <span className="w-5 h-5 shrink-0 bg-teal-100 dark:bg-slate-800 text-teal-600 text-[9px] font-bold rounded-full flex items-center justify-center">{i + 1}</span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{step}</span>
                        </li>
                      ))}</ol>;
                    }
                  } catch {}
                  return <p className="text-xs text-slate-600 dark:text-slate-300 font-medium whitespace-pre-line">{viewExp.procedure || "Not specified."}</p>;
                })()}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h4 className="font-extrabold text-teal-600 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Observation</h4>
                  <p className="text-xs leading-relaxed whitespace-pre-line font-medium text-slate-700 dark:text-slate-300">{viewExp.observation || "Not specified."}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h4 className="font-extrabold text-teal-600 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Calculation</h4>
                  <p className="text-xs leading-relaxed whitespace-pre-line font-medium text-slate-700 dark:text-slate-300">{viewExp.calculation || "Not specified."}</p>
                </div>
              </div>
              <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-4 rounded-xl border border-emerald-100/50">
                <h4 className="font-extrabold text-emerald-600 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Result</h4>
                <p className="text-xs font-bold leading-relaxed whitespace-pre-line text-emerald-800 dark:text-emerald-300">{viewExp.result || "Not specified."}</p>
              </div>
              <div className="bg-rose-50/50 dark:bg-rose-950/10 p-4 rounded-xl border border-rose-200/50">
                <h4 className="font-extrabold text-rose-600 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> Safety Precautions</h4>
                <p className="text-xs font-medium leading-relaxed whitespace-pre-line text-rose-700 dark:text-rose-300">{viewExp.safetyPrecautions || "Not specified."}</p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button onClick={() => { setViewModalOpen(false); setViewExp(null); }} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all">
                {lang === "தமிழ்" ? "மூடுக" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Experiment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {isEdit ? (lang === "தமிழ்" ? "சோதனையை மாற்றியமைத்தல்" : "Modify Experiment") : (lang === "தமிழ்" ? "புதிய சோதனையைத் திட்டமிடல்" : "Plan New Experiment!")}
              </h3>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveExperiment} className="p-6 space-y-5 text-left">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">{lang === "தமிழ்" ? "சோதனையின் பெயர்" : "Experiment Name"}</label>
                  <button type="button" onClick={handleAIFill} disabled={generating} className="px-2.5 py-1 text-[10px] font-bold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-purple-600 rounded-lg flex items-center gap-1 border border-purple-100 dark:border-purple-900 transition-all active:scale-95 disabled:opacity-50">
                    {generating ? <span className="w-3 h-3 rounded-full border-2 border-t-transparent border-purple-500 animate-spin" /> : <span>🪄</span>}
                    {lang === "தமிழ்" ? "AI நிரப்பல்" : "AI Auto-fill"}
                  </button>
                </div>
                <input required name="title" type="text" defaultValue={currentExp?.title || ""} placeholder="e.g., Acid-Base Titration" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">{lang === "தமிழ்" ? "வகுப்பு" : "Class"}</label>
                  <select required name="gradeLevel" defaultValue={currentExp?.raw?.gradeLevel || "Class 11"} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all">
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">{lang === "தமிழ்" ? "பிரிவு" : "Section"}</label>
                  <input required name="section" type="text" defaultValue={currentExp?.raw?.section || ""} placeholder="e.g., A" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">{lang === "தமிழ்" ? "அதிகாரம்" : "Chapter"}</label>
                  <input required name="chapter" type="text" defaultValue={currentExp?.raw?.chapter || ""} placeholder="e.g., Volumetric Analysis" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">{lang === "தமிழ்" ? "வகை" : "Category"}</label>
                  <select required name="category" defaultValue={currentExp?.raw?.category || "Volumetric Analysis"} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all">
                    <option value="Volumetric Analysis">Volumetric Analysis</option>
                    <option value="Qualitative Analysis">Qualitative Analysis</option>
                    <option value="Organic Compound Analysis">Organic Compound Analysis</option>
                    <option value="Inorganic Compound Analysis">Inorganic Compound Analysis</option>
                    <option value="Preparation of Compounds">Preparation of Compounds</option>
                    <option value="Chemical Reactions">Chemical Reactions</option>
                    <option value="Identification Tests">Identification Tests</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">{lang === "தமிழ்" ? "எப்போது?" : "When?"}</label>
                  <input required name="date" type="text" defaultValue={currentExp?.date || ""} placeholder="e.g., Today, 11:30 AM" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">{lang === "தமிழ்" ? "நிலை" : "Status"}</label>
                  <select required name="status" defaultValue={currentExp?.status || "scheduled"} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all">
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">{lang === "தமிழ்" ? "சோதனை வரைபடம் (விருப்பத்தேர்வு)" : "Experiment Diagram (Optional)"}</label>
                <div className="flex items-center gap-3">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="diagram-upload-input" />
                  <label htmlFor="diagram-upload-input" className="px-4 py-2 border border-dashed border-teal-400/40 hover:border-teal-500/60 bg-teal-500/5 hover:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5">
                    {uploadingImage ? <span className="w-3 h-3 rounded-full border-2 border-t-transparent border-teal-500 animate-spin" /> : <span>📷</span>}
                    {lang === "தமிழ்" ? "வரைபடம் பதிவேற்று" : "Upload Diagram"}
                  </label>
                  {formImageUrl && (
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <img
                        src={formImageUrl.startsWith("http") ? formImageUrl : `${API_URL}${formImageUrl}`}
                        alt="preview"
                        className="w-8 h-8 object-cover rounded-lg border border-slate-200"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <span className="text-[10px] text-slate-500 font-bold max-w-xs truncate">{formImageUrl.split('/').pop()}</span>
                      <button type="button" onClick={() => setFormImageUrl("")} className="text-rose-500 hover:text-rose-700 text-xs font-bold ml-2">{lang === "தமிழ்" ? "நீக்கு" : "Remove"}</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
                <h4 className="font-extrabold text-teal-600 dark:text-teal-400 text-xs uppercase tracking-wider">{lang === "தமிழ்" ? "செய்வதற்கு முன் கற்க!" : "Learn Before You Do"}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{lang === "தமிழ்" ? "நோக்கம்" : "Aim"}</label>
                    <textarea name="aim" rows={2} defaultValue={currentExp?.raw?.aim || ""} placeholder="The main objective..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{lang === "தமிழ்" ? "கோட்பாடு" : "Theory"}</label>
                    <textarea name="theory" rows={2} defaultValue={currentExp?.raw?.theory || ""} placeholder="The chemical equations, concepts..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" />
                  </div>
                </div>
                <div className="space-y-3 border border-slate-100 dark:border-slate-800 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                  <h5 className="font-extrabold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">{lang === "தமிழ்" ? "கருவிகள் மற்றும் வேதிப்பொருட்கள்" : "Apparatus & Chemicals"}</h5>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{lang === "தமிழ்" ? "தேவைப்படும் கருவிகள்" : "Apparatus"}</label>
                    <div className="space-y-2">
                      {formApparatus.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input type="text" value={item} onChange={(e) => updateApparatus(idx, e.target.value)} placeholder={`Apparatus #${idx + 1}`} className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-400 transition-all" />
                          <button type="button" onClick={() => removeApparatus(idx)} className="text-rose-400 hover:text-rose-600 p-1"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={addApparatus} className="mt-2 text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline">+ {lang === "தமிழ்" ? "கருவி சேர்" : "Add Apparatus"}</button>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{lang === "தமிழ்" ? "தேவைப்படும் வேதிப்பொருட்கள்" : "Chemicals"}</label>
                    <div className="space-y-2">
                      {formChemicals.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input type="text" value={item} onChange={(e) => updateChemical(idx, e.target.value)} placeholder={`Chemical #${idx + 1}`} className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-400 transition-all" />
                          <button type="button" onClick={() => removeChemical(idx)} className="text-rose-400 hover:text-rose-600 p-1"><X className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={addChemical} className="mt-2 text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline">+ {lang === "தமிழ்" ? "வேதிப்பொருள் சேர்" : "Add Chemical"}</button>
                  </div>
                </div>
                <div className="space-y-2 border border-slate-100 dark:border-slate-800 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{lang === "தமிழ்" ? "செய்முறை விளக்கம்" : "Procedure Steps"}</label>
                  <div className="space-y-2">
                    {formProcedure.map((step, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <span className="text-xs font-bold text-slate-400 mt-2.5">#{idx + 1}</span>
                        <textarea rows={2} value={step} onChange={(e) => updateStep(idx, e.target.value)} placeholder={`Step #${idx + 1}`} className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-400 transition-all" />
                        <button type="button" onClick={() => removeStep(idx)} className="text-rose-400 hover:text-rose-600 p-1 mt-2"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addStep} className="mt-2 text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline">+ {lang === "தமிழ்" ? "படி சேர்" : "Add Step"}</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{lang === "தமிழ்" ? "உற்றுநோக்கல்" : "Observation"}</label>
                    <textarea name="observation" rows={2} defaultValue={currentExp?.raw?.observation || ""} placeholder="Record observation..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{lang === "தமிழ்" ? "கணக்கீடு" : "Calculation"}</label>
                    <textarea name="calculation" rows={2} defaultValue={currentExp?.raw?.calculation || ""} placeholder="Formulas and equations..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{lang === "தமிழ்" ? "முடிவு" : "Result"}</label>
                    <textarea name="result" rows={2} defaultValue={currentExp?.raw?.result || ""} placeholder="The final outcome..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-1.5">{lang === "தமிழ்" ? "பாதுகாப்பு முன்னெச்சரிக்கைகள்" : "Safety Precautions"}</label>
                    <textarea name="safetyPrecautions" rows={2} defaultValue={currentExp?.raw?.safetyPrecautions || ""} placeholder="Specific precautions..." className="w-full bg-rose-50/10 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all" />
                  </div>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
                  {lang === "தமிழ்" ? "ரத்துசெய்" : "Cancel"}
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 transition-all shadow-sm active:scale-95">
                  {lang === "தமிழ்" ? "சேமி" : "Save Experiment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
