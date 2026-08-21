"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import {
  FlaskConical, Flame, Droplets, ShieldAlert, Calendar, BookOpen,
  AlertTriangle, Eye, Microscope, X, MapPin, Zap, CheckCircle,
} from "lucide-react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

interface Experiment {
  id: string; title: string; classSection: string; date: string;
  type: string; status: string; color: string; raw: any;
}
interface Ingredient {
  id: string; name: string; location: string; count: number; status: string;
}

export default function ChemistryLabPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const studentClass = (session?.user as any)?.class;
  const studentSection = (session?.user as any)?.section;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const { lang } = usePortalLanguage();

  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const [selectedSim, setSelectedSim] = useState(
    "https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_all.html"
  );
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewExp, setViewExp] = useState<any | null>(null);

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
    return "indigo";
  };

  const safeParseArray = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return String(value).split("\n").map((s) => s.trim()).filter(Boolean);
    }
    return [String(value)];
  };

  const matchesStudentClass = (item: any): boolean => {
    if (!studentClass) return true;
    const grade = (item.gradeLevel || "").replace(/[^0-9]/g, "");
    const sc = String(studentClass).replace(/[^0-9]/g, "");
    return grade === sc;
  };

  const fetchLabData = useCallback(async () => {
    try {
      setLoading(true);
      const classNum = studentClass ? String(studentClass).replace(/[^0-9]/g, "") : "";
      const gradeLabel = classNum ? `Class ${classNum}` : "";

      if (!gradeLabel) {
        if (!schoolId) { setLoading(false); return; }
        const res = await fetch(`${API_URL}/api/teacher/labs?schoolId=${schoolId}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setExperiments(
            data.data
              .filter((i: any) => ["scheduled","completed","active"].includes(i.status))
              .map((item: any) => ({
                id: item.id, title: item.name,
                classSection: item.classSection || "General", date: item.date || "TBD",
                type: item.classRoomId || "General", status: item.status,
                color: getExperimentColor(item.classRoomId || item.name), raw: item,
              }))
          );
        }
        setLoading(false); return;
      }

      const res = await fetch(`${API_URL}/api/teacher/labs?gradeLevel=${encodeURIComponent(gradeLabel)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const expList: Experiment[] = [];
        const ingList: Ingredient[] = [];
        data.data.forEach((item: any) => {
          const isExp = ["scheduled","completed","active"].includes(item.status);
          if (isExp && matchesStudentClass(item)) {
            expList.push({
              id: item.id, title: item.name,
              classSection: item.classSection || `Class ${classNum} - ${studentSection || "A"}`,
              date: item.date || "TBD", type: item.classRoomId || "General",
              status: item.status, color: getExperimentColor(item.classRoomId || item.name), raw: item,
            });
          } else if (!isExp) {
            ingList.push({ id: item.id, name: item.name, location: item.location || "Rack A", count: item.count || 1, status: item.status || "Good" });
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
  }, [schoolId, studentClass, studentSection, API_URL]);

  useEffect(() => { fetchLabData(); }, [fetchLabData]);

  const filteredIngredients = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ing.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const safetyAlerts = [
    { msg: lang === "தமிழ்" ? "அனைத்து சோதனைகளிலும் லேப் கோட் மற்றும் பாதுகாப்பு கண்ணாடிகளை அணியுங்கள்." : "Wear your lab coat and safety goggles during all chemistry experiments.", level: "warning" },
    { msg: lang === "தமிழ்" ? "அனுமதியின்றி வேதிப்பொருட்களை கலக்க வேண்டாம்." : "Never perform any unauthorized chemical reactions.", level: "critical" },
    { msg: lang === "தமிழ்" ? "ஆசிரியரின் அறிவுறுத்தல்களை எப்போதும் பின்பற்றுங்கள்." : "Always follow teacher instructions carefully.", level: "warning" },
    { msg: lang === "தமிழ்" ? "வேதிப்பொருட்களை கவனமாகக் கையாளுங்கள்." : "Handle all chemicals with care and under supervision.", level: "critical" },
  ];

  const colorStyles = {
    orange: { iconBg: "bg-orange-50 dark:bg-orange-950/30", iconText: "text-orange-500", badge: "bg-orange-50 text-orange-600 border-orange-100", type: "bg-orange-50 text-orange-600 border-orange-100" },
    emerald: { iconBg: "bg-emerald-50 dark:bg-emerald-950/30", iconText: "text-emerald-500", badge: "bg-emerald-50 text-emerald-600 border-emerald-100", type: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    purple: { iconBg: "bg-purple-50 dark:bg-purple-950/30", iconText: "text-purple-500", badge: "bg-purple-50 text-purple-600 border-purple-100", type: "bg-purple-50 text-purple-600 border-purple-100" },
    blue: { iconBg: "bg-blue-50 dark:bg-blue-950/30", iconText: "text-blue-500", badge: "bg-blue-50 text-blue-600 border-blue-100", type: "bg-blue-50 text-blue-600 border-blue-100" },
    indigo: { iconBg: "bg-indigo-50 dark:bg-indigo-950/30", iconText: "text-indigo-500", badge: "bg-indigo-50 text-indigo-600 border-indigo-100", type: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  } as Record<string, any>;

  const simulations = [
    { label: lang === "தமிழ்" ? "pH அளவு" : "pH Scale", url: "https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_all.html" },
    { label: lang === "தமிழ்" ? "மோலாரிட்டி" : "Molarity", url: "https://phet.colorado.edu/sims/html/molarity/latest/molarity_all.html" },
    { label: lang === "தமிழ்" ? "வேதிச் சமன்பாடு" : "Balancing Equations", url: "https://phet.colorado.edu/sims/html/balancing-chemical-equations/latest/balancing-chemical-equations_all.html" },
    { label: lang === "தமிழ்" ? "அமில-காரம்" : "Acid-Base", url: "https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_all.html" },
  ];

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "வேதியியல் ஆய்வகம்" : "Chemistry Laboratory"}
      subtitle={lang === "தமிழ்" ? "சோதனைகளை ஆராயுங்கள், எதிர்வினைகளை கற்றுக்கொள்ளுங்கள், பாதுகாப்பாக பயிற்சி செய்யுங்கள்!" : "Explore experiments, learn reactions, and practice safety!"}
    >
      <div className="flex flex-col gap-6 md:gap-8" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>

        {/* Modern Sleek Banner — indigo/purple gradient matching Zoology Centre style */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6 md:p-8 shadow-sm border border-indigo-500/20">
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-50px] right-[10%] w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl" />
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
                {lang === "தமிழ்" ? "தமிழ்நாடு அரசு பாடத்திட்ட வேதியியல் செய்முறைகளுக்கான வழிகாட்டி. சோதனை விவரங்களை பாதுகாப்பாக பயிற்சி செய்யுங்கள்." : "Your guide to Tamil Nadu State Board chemistry practicals. Prepare, review experiment details, and practice safely."}
              </p>
            </div>
            <div className="shrink-0 flex flex-wrap gap-3">
              <div className="px-5 py-3 bg-white/15 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center gap-2">
                <FlaskConical className="w-4 h-4" /> {experiments.length} {lang === "தமிழ்" ? "சோதனைகள்" : "Experiments"}
              </div>
              <div className="px-5 py-3 bg-white/15 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center gap-2">
                <Flame className="w-4 h-4" /> {lang === "தமிழ்" ? "பாதுகாப்பே முதன்மை!" : "Safety First!"}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Experiments */}
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800">
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                {lang === "தமிழ்" ? "செய்முறைச் சோதனைகள்" : "Experiments"}
              </h3>
              {loading ? (
                <div className="text-center py-16 text-slate-400 text-xs font-bold">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin mx-auto mb-4" />
                  <span>Loading experiments...</span>
                </div>
              ) : experiments.length > 0 ? (
                <div className="space-y-3">
                  {experiments.map((exp) => {
                    const c = colorStyles[exp.color] || colorStyles.indigo;
                    return (
                      <div key={exp.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl ${c.iconBg} ${c.iconText} flex items-center justify-center shrink-0`}>
                            <FlaskConical className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 leading-snug truncate">{exp.title}</h4>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${c.badge}`}>
                                {exp.raw?.gradeLevel || "Class 11/12"} - {exp.raw?.section || "A"}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400">{lang === "தமிழ்" ? "அதிகாரம்: " : "Ch: "}{exp.raw?.chapter || "N/A"}</span>
                              <span className="text-[10px] font-semibold text-slate-400">{exp.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          <span className={`text-[9px] font-bold px-2 py-1 rounded-lg border uppercase tracking-wider hidden sm:inline ${c.type}`}>{exp.type}</span>
                          <button
                            onClick={() => { setViewExp(exp.raw); setViewModalOpen(true); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 transition-colors active:scale-90"
                            title={lang === "தமிழ்" ? "சோதனை விவரங்கள்" : "View Details"}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 text-sm font-bold bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  {lang === "தமிழ்" ? "உங்கள் வகுப்பிற்கு இன்னும் சோதனைகள் திட்டமிடப்படவில்லை." : "No experiments scheduled for your class yet."}
                </div>
              )}
            </div>

            {/* Virtual Lab */}
            <div id="virtual-lab-sim" className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800">
              <div className="mb-5">
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-lg flex items-center justify-center">
                    <Microscope className="w-5 h-5" />
                  </div>
                  {lang === "தமிழ்" ? "மெய்நிகர் வேதியியல் ஆய்வகம்" : "Virtual Chemistry Lab"}
                </h3>
                <p className="text-slate-400 font-medium text-xs mt-1 ml-12">
                  {lang === "தமிழ்" ? "மாணவர்கள் சோதனைக்கு முன் பயிற்சி செய்யலாம்." : "Practice chemistry concepts before the actual lab session."}
                </p>
              </div>
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
                {simulations.map((sim) => (
                  <button
                    key={sim.url}
                    onClick={() => setSelectedSim(sim.url)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 whitespace-nowrap shrink-0 ${
                      selectedSim === sim.url
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
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
                  placeholder={lang === "தமிழ்" ? "பொருட்களைத் தேடு..." : "Search materials..."}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
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
                          <div className="text-slate-400 font-medium mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{ing.location}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${
                          ing.status === "Low Stock" ? "bg-amber-50 text-amber-600 border-amber-100"
                            : ing.status === "Needs Maintenance" ? "bg-rose-50 text-rose-600 border-rose-100"
                            : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        }`}>{lang === "தமிழ்" ? "அளவு: " : "Qty: "}{ing.count}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-3 text-slate-400 text-xs italic">
                      {lang === "தமிழ்" ? "பொருந்தும் பொருட்கள் இல்லை" : "No matching materials"}
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => showToast(lang === "தமிழ்" ? "வேதியியல் குறிப்பு திறக்கிறது!" : "Opening Chemical Reference...")} className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs font-bold text-slate-600 dark:text-slate-400 group">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-slate-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                  </div>
                  {lang === "தமிழ்" ? "வேதியியல் குறிப்பு" : "Reference"}
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

      {/* View Experiment Modal */}
      {viewModalOpen && viewExp && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-start p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900">
                  {viewExp.gradeLevel || "Class 11/12"} - {viewExp.section || "A"} | {viewExp.category || "General"}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-2">{viewExp.name}</h3>
                {viewExp.chapter && <p className="text-xs font-semibold text-slate-400 mt-0.5">{lang === "தமிழ்" ? "அதிகாரம்: " : "Chapter: "}{viewExp.chapter}</p>}
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
                  <h4 className="font-extrabold text-indigo-600 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Microscope className="w-3.5 h-3.5" /> {lang === "தமிழ்" ? "நோக்கம்" : "Aim"}</h4>
                  <p className="text-xs leading-relaxed whitespace-pre-line font-medium text-slate-700 dark:text-slate-300">{viewExp.aim || (lang === "தமிழ்" ? "குறிப்பிடப்படவில்லை." : "Not specified.")}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h4 className="font-extrabold text-indigo-600 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> {lang === "தமிழ்" ? "கோட்பாடு" : "Theory"}</h4>
                  <p className="text-xs leading-relaxed whitespace-pre-line font-medium text-slate-700 dark:text-slate-300">{viewExp.theory || (lang === "தமிழ்" ? "குறிப்பிடப்படவில்லை." : "Not specified.")}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-indigo-50/40 dark:bg-indigo-950/10 p-4 rounded-xl border border-indigo-100/50">
                  <h4 className="font-extrabold text-indigo-600 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> {lang === "தமிழ்" ? "தேவைப்படும் கருவிகள்" : "Apparatus"}</h4>
                  {safeParseArray(viewExp.apparatus).length > 0 ? (
                    <ul className="list-disc pl-4 text-xs space-y-1">{safeParseArray(viewExp.apparatus).map((item, idx) => <li key={idx} className="font-medium text-slate-700 dark:text-slate-300">{item}</li>)}</ul>
                  ) : <p className="text-xs text-slate-400 italic">{lang === "தமிழ்" ? "பட்டியலிடப்படவில்லை." : "None listed."}</p>}
                </div>
                <div className="bg-indigo-50/20 dark:bg-indigo-950/10 p-4 rounded-xl border border-indigo-100/50">
                  <h4 className="font-extrabold text-indigo-600 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5" /> {lang === "தமிழ்" ? "வேதிப்பொருட்கள்" : "Chemicals"}</h4>
                  {safeParseArray(viewExp.chemicals).length > 0 ? (
                    <ul className="list-disc pl-4 text-xs space-y-1">{safeParseArray(viewExp.chemicals).map((item, idx) => <li key={idx} className="font-medium text-slate-700 dark:text-slate-300">{item}</li>)}</ul>
                  ) : <p className="text-xs text-slate-400 italic">{lang === "தமிழ்" ? "பட்டியலிடப்படவில்லை." : "None listed."}</p>}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <h4 className="font-extrabold text-indigo-600 text-[10px] uppercase tracking-wider mb-3 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {lang === "தமிழ்" ? "செய்முறை விளக்கம்" : "Procedure Steps"}</h4>
                {(() => {
                  try {
                    const arr = JSON.parse(viewExp.procedure || "[]");
                    if (Array.isArray(arr) && arr.length && arr[0] !== "") {
                      return <ol className="space-y-2">{arr.map((step: string, i: number) => (
                        <li key={i} className="flex gap-2.5 text-xs">
                          <span className="w-5 h-5 shrink-0 bg-indigo-100 dark:bg-slate-800 text-indigo-600 text-[9px] font-bold rounded-full flex items-center justify-center">{i + 1}</span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{step}</span>
                        </li>
                      ))}</ol>;
                    }
                  } catch {}
                  return <p className="text-xs text-slate-600 dark:text-slate-300 font-medium whitespace-pre-line">{viewExp.procedure || (lang === "தமிழ்" ? "குறிப்பிடப்படவில்லை." : "Not specified.")}</p>;
                })()}
              </div>
              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h4 className="font-extrabold text-indigo-600 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {lang === "தமிழ்" ? "உற்றுநோக்கல்" : "Observation"}</h4>
                  <p className="text-xs leading-relaxed whitespace-pre-line font-medium text-slate-700 dark:text-slate-300">{viewExp.observation || (lang === "தமிழ்" ? "குறிப்பிடப்படவில்லை." : "Not specified.")}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h4 className="font-extrabold text-indigo-600 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> {lang === "தமிழ்" ? "கணக்கீடு" : "Calculation"}</h4>
                  <p className="text-xs leading-relaxed whitespace-pre-line font-medium text-slate-700 dark:text-slate-300">{viewExp.calculation || (lang === "தமிழ்" ? "குறிப்பிடப்படவில்லை." : "Not specified.")}</p>
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-4 rounded-xl border border-emerald-100/50">
                  <h4 className="font-extrabold text-emerald-600 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> {lang === "தமிழ்" ? "முடிவு" : "Result"}</h4>
                  <p className="text-xs font-bold leading-relaxed whitespace-pre-line text-emerald-800 dark:text-emerald-300">{viewExp.result || (lang === "தமிழ்" ? "குறிப்பிடப்படவில்லை." : "Not specified.")}</p>
                </div>
                <div className="bg-rose-50/50 dark:bg-rose-950/10 p-4 rounded-xl border border-rose-200/50">
                  <h4 className="font-extrabold text-rose-600 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> {lang === "தமிழ்" ? "பாதுகாப்பு முன்னெச்சரிக்கைகள்" : "Safety Precautions"}</h4>
                  <p className="text-xs font-medium leading-relaxed whitespace-pre-line text-rose-700 dark:text-rose-300">{viewExp.safetyPrecautions || (lang === "தமிழ்" ? "குறிப்பிடப்படவில்லை." : "Not specified.")}</p>
                </div>
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

      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-bold z-50 flex items-center gap-3 border border-slate-700">
          <div className="w-3 h-3 bg-indigo-400 rounded-full animate-ping" />
          {toastMsg}
        </div>
      )}
    </PortalLayout>
  );
}
