"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import Swal from "sweetalert2";
import { FlaskConical, Flame, Droplets, Wind, ShieldAlert, Calendar, BookOpen, AlertTriangle, X, Sparkles, Zap, Eye, Microscope, Trash2, Settings, PlusCircle, CheckCircle, MapPin, Tag, Star, Clock, Stethoscope, Rocket } from "lucide-react";

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

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentExp, setCurrentExp] = useState<Experiment | null>(null);

  const [potionColor, setPotionColor] = useState("bg-purple-500");
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const getExperimentColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("fun") || t.includes("reaction") || t.includes("volcano")) return "orange";
    if (t.includes("polymer") || t.includes("slime")) return "emerald";
    if (t.includes("metal") || t.includes("flame") || t.includes("fire")) return "purple";
    if (t.includes("acid") || t.includes("titration") || t.includes("base")) return "blue";
    return "teal";
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
              classSection: item.classSection || "Class 10A",
              date: item.date || "TBD",
              type: item.classRoomId || "General",
              status: item.status,
              color: getExperimentColor(item.classRoomId || item.name),
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

  // Save new or modified experiment
  const handleSaveExperiment = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get("title") as string;
    const cls = formData.get("classSection") as string;
    const date = formData.get("date") as string;
    const type = formData.get("type") as string;
    const status = formData.get("status") as string;

    const payload = {
      name: title,
      classSection: cls,
      date,
      classRoomId: type,
      status,
      schoolId,
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
            title: "Experiment Updated!",
            text: `Successfully updated "${title}".`,
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
            title: "Experiment Planned!",
            text: `"${title}" has been scheduled.`,
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
        title: "Database Error",
        text: "Could not save. Please check database connection.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // Delete experiment
  const handleDeleteExperiment = async (id: string, title: string) => {
    const confirm = await Swal.fire({
      title: `Delete Experiment?`,
      text: `Are you sure you want to remove "${title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
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
            title: "Deleted!",
            text: `Successfully deleted "${title}".`,
            confirmButtonColor: "#14b8a6",
          });
          fetchLabData();
        }
      } catch (err) {
        console.error("Error deleting experiment:", err);
        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: "An error occurred while deleting the experiment.",
          confirmButtonColor: "#ef4444",
        });
      }
    }
  };

  const handleOpenEdit = (exp: Experiment) => {
    setIsEdit(true);
    setCurrentExp(exp);
    setModalOpen(true);
  };

  const handleOpenCreate = () => {
    setIsEdit(false);
    setCurrentExp(null);
    setModalOpen(true);
  };

  const filteredIngredients = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ing.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const safetyAlerts = [
    { msg: lang === "தமிழ்" ? "பாதுகாப்பு கண்ணாடிகளை நினைவில் கொள்ளுங்கள்! " : "Remember your safety goggles! ", level: "warning" },
    { msg: lang === "தமிழ்" ? "சிவப்பு மற்றும் பச்சை கரைசல்களை ஒன்றாக கலக்க வேண்டாம்! " : "Don't mix the red and green potions! ", level: "critical" }
  ];

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "மந்திர வேதியியல் ஆய்வகம்! " : "Magic Chemistry Lab! "}
      subtitle={lang === "தமிழ்" ? "வேதியியல் கரைசல்களைக் கலக்கவும், நிற மாற்றங்களைக் காணவும், அறிவியலைக் கற்கவும்!" : "Mix potions, watch colors change, and learn science!"}
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 text-left">

        {/* Main Dashboard Panel */}
        <div className="xl:col-span-2 space-y-8">

          {/* Playful Header Banner */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-purple-50 dark:bg-slate-800 p-8 text-slate-800 dark:text-slate-100 shadow-xl border-4 border-purple-200 dark:border-slate-700">
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 scale-150 pointer-events-none">
              <FlaskConical className="w-64 h-64 text-purple-500" />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl font-black tracking-tight mb-3 flex items-center gap-3 drop-shadow-md text-slate-900 dark:text-white">
                <div className="p-3 bg-purple-200 dark:bg-slate-900 rounded-2xl rotate-12">
                  <FlaskConical className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                {lang === "தமிழ்" ? "கரைசல் தயாரிப்பு நிலையம்" : "The Mixology Station"}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 font-bold max-w-lg mb-8 text-base">
                {lang === "தமிழ்" ? "எப்பொழுதும் இல்லாத மிகச் சிறந்த ஆய்வகத்திற்கு உங்களை வரவேற்கிறோம்! வேடிக்கையான சோதனைகளைத் திட்டமிடுங்கள், மந்திரப் பொருட்களைச் சரிபார்க்கவும், நினைவில் கொள்க: பாதுகாப்பே முதன்மை!" : "Welcome to the coolest lab ever! Schedule fun experiments, check our magical ingredients, and remember: Safety First!"}
              </p>

              <div className="flex flex-wrap gap-4">
                <button onClick={() => {
                  const colors = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-yellow-500", "bg-pink-500"];
                  setPotionColor(colors[Math.floor(Math.random() * colors.length)]);
                  showToast(lang === "தமிழ்" ? "புதிய கரைசல் தயாரிக்கப்பட்டது! " : "Mixed a new potion! ");
                }} className="bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-2xl p-4 flex items-center gap-4 border-2 border-purple-100 dark:border-slate-600 transition-all active:scale-95 cursor-pointer shadow-sm">
                  <div className={`w-12 h-12 rounded-full ${potionColor} flex items-center justify-center shadow-inner border-2 border-white/50 transition-colors duration-500`}>
                    <Sparkles className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-purple-500 dark:text-purple-400 uppercase tracking-widest">{lang === "தமிழ்" ? "கரைசலைக் கலக்கவும்" : "Mix Potion"}</div>
                    <div className="text-xl font-black text-slate-800 dark:text-white drop-shadow-sm">{lang === "தமிழ்" ? "கிளிக் செய்!" : "Click Me!"}</div>
                  </div>
                </button>
                <div className="bg-white dark:bg-slate-700 rounded-2xl p-4 flex items-center gap-4 border-2 border-purple-100 dark:border-slate-600 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-orange-400 flex items-center justify-center shadow-inner border-2 border-white/50">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black text-orange-500 dark:text-orange-400 uppercase tracking-widest">{lang === "தமிழ்" ? "பன்சன் சுடரடுப்புகள்" : "Bunsen Burners"}</div>
                    <div className="text-xl font-black text-slate-800 dark:text-white drop-shadow-sm">{lang === "தமிழ்" ? "தயார்!" : "Ready!"} <Flame className="w-4 h-4 inline-block mr-1 text-inherit" /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Experiments */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-lg border-4 border-teal-100 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                <div className="p-2 bg-teal-100 text-teal-600 dark:bg-slate-900 rounded-xl rotate-[-5deg]">
                  <Calendar className="w-6 h-6" />
                </div>
                {lang === "தமிழ்" ? "அற்புதமான சோதனைகள்!" : "Cool Experiments!"}
              </h3>
              <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={() => showToast(lang === "தமிழ்" ? "காலெண்டர் காட்சி விரைவில் வரும்! " : "Calendar view coming soon! ")} className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-black text-sm rounded-2xl hover:bg-slate-200 transition-colors border border-slate-200 dark:border-slate-600">{lang === "தமிழ்" ? "காலெண்டர்" : "Calendar"}</button>
                <button onClick={handleOpenCreate} className="flex-1 sm:flex-none px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-teal-500/30 active:scale-95 transition-all">{lang === "தமிழ்" ? "+ புதியதைச் சேர்" : "+ Add New"}</button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                <div className="w-8 h-8 rounded-full border-2 border-teal-500/30 border-t-teal-500 animate-spin mx-auto mb-4" />
                <span>{lang === "தமிழ்" ? "தரவுத்தளத்திலிருந்து வாசிக்கப்படுகிறது..." : "Reading PostgreSQL database..."}</span>
              </div>
            ) : experiments.length > 0 ? (
              <div className="space-y-4">
                {experiments.map((exp) => {
                  const colorStyles = {
                    orange: {
                      wrapper: "border-orange-100 hover:border-orange-300 bg-orange-50/50 hover:bg-orange-50 dark:border-slate-900 dark:bg-slate-900/50",
                      iconBg: "bg-orange-200 dark:bg-orange-950/40",
                      iconText: "text-orange-600",
                      title: "group-hover:text-orange-600",
                      badgeBg: "bg-orange-100 dark:bg-orange-950/20",
                      badgeText: "text-orange-600 dark:text-orange-400",
                      typeBadge: "border-orange-200 dark:border-orange-900 text-orange-600 dark:text-orange-400",
                      btnBg: "bg-orange-100 hover:bg-orange-200 dark:bg-slate-800 dark:hover:bg-slate-700",
                      btnText: "text-orange-600"
                    },
                    emerald: {
                      wrapper: "border-emerald-100 hover:border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 dark:border-slate-900 dark:bg-slate-900/50",
                      iconBg: "bg-emerald-200 dark:bg-emerald-950/40",
                      iconText: "text-emerald-600",
                      title: "group-hover:text-emerald-600",
                      badgeBg: "bg-emerald-100 dark:bg-emerald-950/20",
                      badgeText: "text-emerald-600 dark:text-emerald-400",
                      typeBadge: "border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400",
                      btnBg: "bg-emerald-100 hover:bg-emerald-200 dark:bg-slate-800 dark:hover:bg-slate-700",
                      btnText: "text-emerald-600"
                    },
                    purple: {
                      wrapper: "border-purple-100 hover:border-purple-300 bg-purple-50/50 hover:bg-purple-50 dark:border-slate-900 dark:bg-slate-900/50",
                      iconBg: "bg-purple-200 dark:bg-purple-950/40",
                      iconText: "text-purple-600",
                      title: "group-hover:text-purple-600",
                      badgeBg: "bg-purple-100 dark:bg-purple-950/20",
                      badgeText: "text-purple-600 dark:text-purple-400",
                      typeBadge: "border-purple-200 dark:border-purple-900 text-purple-600 dark:text-purple-400",
                      btnBg: "bg-purple-100 hover:bg-purple-200 dark:bg-slate-800 dark:hover:bg-slate-700",
                      btnText: "text-purple-600"
                    },
                    blue: {
                      wrapper: "border-blue-100 hover:border-blue-300 bg-blue-50/50 hover:bg-blue-50 dark:border-slate-900 dark:bg-slate-900/50",
                      iconBg: "bg-blue-200 dark:bg-blue-950/40",
                      iconText: "text-blue-600",
                      title: "group-hover:text-blue-600",
                      badgeBg: "bg-blue-100 dark:bg-blue-950/20",
                      badgeText: "text-blue-600 dark:text-blue-400",
                      typeBadge: "border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400",
                      btnBg: "bg-blue-100 hover:bg-blue-200 dark:bg-slate-800 dark:hover:bg-slate-700",
                      btnText: "text-blue-600"
                    },
                    teal: {
                      wrapper: "border-teal-100 hover:border-teal-300 bg-teal-50/50 hover:bg-teal-50 dark:border-slate-900 dark:bg-slate-900/50",
                      iconBg: "bg-teal-200 dark:bg-teal-950/40",
                      iconText: "text-teal-600",
                      title: "group-hover:text-teal-600",
                      badgeBg: "bg-teal-100 dark:bg-teal-950/20",
                      badgeText: "text-teal-600 dark:text-teal-400",
                      typeBadge: "border-teal-200 dark:border-teal-900 text-teal-600 dark:text-teal-400",
                      btnBg: "bg-teal-100 hover:bg-teal-200 dark:bg-slate-800 dark:hover:bg-slate-700",
                      btnText: "text-teal-600"
                    }
                  } as Record<string, any>;

                  const c = colorStyles[exp.color] || colorStyles.teal;

                  return (
                    <div key={exp.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border-4 transition-all group ${c.wrapper}`}>
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 w-12 h-12 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform ${c.iconBg}`}>
                          <FlaskConical className={`w-6 h-6 ${c.iconText}`} />
                        </div>
                        <div>
                          <h4 className={`text-lg font-black text-slate-800 dark:text-slate-100 transition-colors ${c.title}`}>{exp.title}</h4>
                          <div className="text-sm font-bold text-slate-500 mt-1 flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-lg ${c.badgeText} ${c.badgeBg}`}>{exp.classSection}</span> • {exp.date}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 sm:mt-0 flex items-center gap-3 pl-16 sm:pl-0">
                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl border-2 bg-white dark:bg-slate-800 uppercase tracking-wider shadow-sm ${c.typeBadge}`}>
                          {exp.type}
                        </span>
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors active:scale-95 ${c.btnBg} ${c.btnText}`}
                          title="Edit Experiment"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExperiment(exp.id, exp.title)}
                          className={`w-9 h-9 flex items-center justify-center rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors active:scale-95 ${c.btnBg}`}
                          title="Delete Experiment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs italic">
                {lang === "தமிழ்" ? "சோதனைகள் எதுவும் இன்னும் திட்டமிடப்படவில்லை." : "No experiments planned yet."}
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar - Safety & Inventory */}
        <div className="space-y-8">

          {/* Safety Alerts */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-lg border-4 border-rose-100 dark:border-slate-700 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-rose-100 dark:bg-rose-900/20 rounded-bl-full pointer-events-none"></div>

            <h3 className="text-xl font-black text-rose-600 dark:text-rose-400 mb-6 flex items-center gap-3">
              <div className="p-2 bg-rose-100 dark:bg-slate-900 rounded-xl rotate-12">
                <ShieldAlert className="w-6 h-6" />
              </div>
              {lang === "தமிழ்" ? "பாதுகாப்பு விதிகள்!" : "Safety Rules!"}
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
            <h3 className="text-xl font-black text-indigo-950 dark:text-indigo-100 mb-6 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-slate-900 text-indigo-600 rounded-xl rotate-[-12deg]">
                <Droplets className="w-6 h-6" />
              </div>
              {lang === "தமிழ்" ? "பொருட்களைக் கண்டறி" : "Find Ingredients"}
            </h3>

            <div className="relative mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === "தமிழ்" ? "மந்திரப் பொடிகளைத் தேடு..." : "Search for magic powders..."}
                className="w-full bg-slate-50 dark:bg-slate-900 border-4 border-indigo-100 dark:border-slate-700 text-indigo-900 dark:text-indigo-100 rounded-3xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all shadow-inner placeholder:text-indigo-400"
              />
              <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
            </div>

            {searchQuery ? (
              <div className="space-y-2 max-h-48 overflow-y-auto mb-6 pr-2">
                {filteredIngredients.length > 0 ? (
                  filteredIngredients.map((ing) => (
                    <div key={ing.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                      <div>
                        <div className="font-black text-slate-800 dark:text-white">{ing.name}</div>
                        <div className="text-slate-400 font-semibold mt-0.5"><MapPin className="w-4 h-4 inline-block mr-1 text-inherit" /> {ing.location}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-lg border font-black ${ing.status === "Low Stock" ? "bg-amber-100 text-amber-600 border-amber-200" :
                        ing.status === "Needs Maintenance" ? "bg-rose-100 text-rose-600 border-rose-200" :
                          "bg-emerald-100 text-emerald-600 border-emerald-200"
                        }`}>
                        {lang === "தமிழ்" ? "அளவு: " : "Qty: "}{ing.count}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-slate-400 text-xs italic">{lang === "தமிழ்" ? "பொருந்தும் பொருட்கள் எதுவும் இல்லை" : "No matching ingredients"}</div>
                )}
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => showToast(lang === "தமிழ்" ? "வேதிப்பொருட்களின் பெரிய புத்தகத்தைத் திறக்கிறது! " : "Opening the big book of chemicals! ")} className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-4 border-indigo-100 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all text-sm font-black text-indigo-600 dark:text-indigo-400 group">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-slate-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                {lang === "தமிழ்" ? "ரகசியங்களின் புத்தகம்" : "Book of Secrets"}
              </button>
              <button onClick={() => showToast(lang === "தமிழ்" ? "அலமாரிகளில் தேடுகிறது! " : "Looking in the cupboards! ")} className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-4 border-emerald-100 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all text-sm font-black text-emerald-600 dark:text-emerald-400 group">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-slate-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FlaskConical className="w-6 h-6" />
                </div>
                {lang === "தமிழ்" ? "அலமாரி சோதனை" : "Cupboard Check"}
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

      {/* Add / Edit Experiment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-md shadow-2xl border-4 border-teal-100 dark:border-slate-700 animate-in zoom-in-95 p-2">
            <div className="flex justify-between items-center p-6 bg-teal-50 dark:bg-slate-900 rounded-[2rem] mb-4">
              <h3 className="text-xl font-black text-teal-600 dark:text-teal-400">
                {isEdit ? " Modify Experiment" : "Plan a New Experiment! "}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-teal-500 hover:scale-110 transition-all shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExperiment} className="p-4 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">What are we doing? <Microscope className="w-4 h-4 inline-block mr-1 text-inherit" /></label>
                <input
                  required
                  name="title"
                  type="text"
                  defaultValue={currentExp?.title || ""}
                  placeholder="e.g., Elephant Toothpaste!"
                  className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-200 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Who's joining? </label>
                  <input
                    required
                    name="classSection"
                    type="text"
                    defaultValue={currentExp?.classSection || ""}
                    placeholder="e.g., Class 10A"
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-200 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Category <Tag className="w-4 h-4 inline-block mr-1 text-inherit" /><Star className="w-4 h-4 inline-block mr-1 text-inherit" /></label>
                  <input
                    required
                    name="type"
                    type="text"
                    defaultValue={currentExp?.type || ""}
                    placeholder="e.g., Reaction"
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-200 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">When? <Clock className="w-4 h-4 inline-block mr-1 text-inherit" /></label>
                  <input
                    required
                    name="date"
                    type="text"
                    defaultValue={currentExp?.date || ""}
                    placeholder="e.g., Today, 11:30 AM"
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-200 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Status <Stethoscope className="w-4 h-4 inline-block mr-1 text-inherit" /></label>
                  <select
                    required
                    name="status"
                    defaultValue={currentExp?.status || "scheduled"}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-teal-500 transition-all"
                  >
                    <option value="scheduled">Scheduled <Calendar className="w-4 h-4 inline-block mr-1 text-inherit" /></option>
                    <option value="completed">Completed <CheckCircle className="w-4 h-4 inline ml-1 text-emerald-500" /></option>
                    <option value="active">Active <Rocket className="w-4 h-4 inline-block mr-1 text-inherit" /></option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-2 border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl text-sm font-black text-grey bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-500/30 active:scale-95"
                >
                  Save Experiment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
