"use client";

import PortalLayout from "@/components/PortalLayout";
import InteractiveInfographic from "@/components/InteractiveInfographic";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import { X } from "lucide-react";

interface Lesson {
  id: string;
  syllabus: string;
  grade: string;
  subject: string;
  topic: string;
  duration: string;
  isPublished: boolean;
  publishedAt?: string;
  planData: {
    objectives?: string[];
    studentKeyPoints?: { en: string[]; ta: string[] };
    bilingual?: { english: string; tamil: string; pronunciation: string }[];
    infographic?: any;
  };
}

export default function StudentLessonsPage() {
  const { data: session, status } = useSession();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [studentClass, setStudentClass] = useState<string>("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState<string>("All");
  const [active, setActive] = useState<Lesson | null>(null);
  const [lang, setLang] = useState<"en" | "ta">("en");
  const [downloading, setDownloading] = useState(false);
  const [presenting, setPresenting] = useState(false);
  const [presentIndex, setPresentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [subjectFilter]);

  useEffect(() => {
    if (status === "authenticated") {
      const cls = (session?.user as any)?.class;
      setStudentClass(cls ? String(cls) : "8");
    }
  }, [session, status]);

  const studentSection: string | null = (session?.user as any)?.section || null;

  useEffect(() => {
    if (!studentClass) return;
    const fetchLessons = async () => {
      setLoading(true);
      try {
        const sectionParam = studentSection ? `&section=${encodeURIComponent(studentSection)}` : "";
        const res = await fetch(`${API_URL}/api/students/lessons?class=${studentClass}${sectionParam}`);
        const json = await res.json();
        if (json.success) setLessons(json.data);
      } catch (err) {
        console.error("Error fetching lessons", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [studentClass, studentSection, API_URL]);

  const subjects = ["All", ...Array.from(new Set(lessons.map((l) => l.subject)))];
  const filtered = subjectFilter === "All" ? lessons : lessons.filter((l) => l.subject === subjectFilter);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedLessons = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const keyPoints = (l: Lesson | null) =>
    (l?.planData?.studentKeyPoints?.[lang] || l?.planData?.studentKeyPoints?.en || []) as string[];

  const handleDownload = useCallback(async () => {
    if (!captureRef.current || downloading) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(captureRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
      const link = document.createElement("a");
      const safe = (active?.topic || "lesson").replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
      link.download = `${safe}_${lang}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.92);
      link.click();
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setDownloading(false);
    }
  }, [downloading, active, lang]);

  // Present slides: title → key points → infographic
  const presentPoints = keyPoints(active);
  const presentTotal = active ? presentPoints.length + 2 : 0;
  useEffect(() => {
    if (!presenting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") setPresentIndex((i) => Math.min(i + 1, presentTotal - 1));
      else if (e.key === "ArrowLeft") setPresentIndex((i) => Math.max(i - 1, 0));
      else if (e.key === "Escape") setPresenting(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [presenting, presentTotal]);

  return (
    <PortalLayout
      title="AI Lessons"
      subtitle="Clear key points and visual infographics your teacher published for your class."
      avatarLetter="A"
      avatarColor="#6366f1"
      themeClass="theme-student"
      accentColor="#6366f1"
    >
      {/* ───── Detail view ───── */}
      {active ? (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
            <button onClick={() => setActive(null)} className="text-sm font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1">← All lessons</button>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
                {(["en", "ta"] as const).map((l) => (
                  <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${lang === l ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm" : "text-slate-500"}`}>
                    {l === "en" ? "English" : "தமிழ்"}
                  </button>
                ))}
              </div>
              <button onClick={() => { setPresentIndex(0); setPresenting(true); }} className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700">🖥️ Present</button>
              <button onClick={handleDownload} disabled={downloading} className="px-3 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">{downloading ? "Saving…" : "⬇️ JPG"}</button>
            </div>
          </div>

          <div ref={captureRef} className="bg-white rounded-3xl p-5 sm:p-6 xl:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="text-5xl">{active.planData?.infographic?.heroIcon || "📚"}</div>
              <div>
                <h1 className="text-2xl xl:text-3xl font-black text-slate-900">{active.topic}</h1>
                <p className="text-sm text-slate-500 font-semibold">{active.grade} • {active.subject}</p>
              </div>
            </div>

            {/* Key points */}
            {presentPoints.length > 0 && (
              <div>
                <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">🎯 Key Points to Remember</h3>
                <ul className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {presentPoints.map((pt, i) => (
                    <li key={i} className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-sm text-slate-800 flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-black flex items-center justify-center shrink-0">{i + 1}</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Objectives */}
            {active.planData?.objectives && active.planData.objectives.length > 0 && (
              <div>
                <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">📋 What You'll Learn</h3>
                <ul className="space-y-2">
                  {active.planData.objectives.map((o, i) => (
                    <li key={i} className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-sm text-slate-800 flex gap-2">
                      <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span> {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bilingual key terms */}
            {active.planData?.bilingual && active.planData.bilingual.length > 0 && (
              <div>
                <h3 className="text-sm font-black text-violet-600 uppercase tracking-widest mb-3 flex items-center gap-2">🌐 Key Terms</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                  {active.planData.bilingual.map((t, i) => (
                    <div key={i} className="p-3 rounded-xl bg-violet-50 border border-violet-100">
                      <p className="font-bold text-sm text-slate-800">{t.english}</p>
                      <p className="text-sm text-violet-700">{t.tamil}</p>
                      {t.pronunciation && <p className="text-[11px] italic text-slate-400">{t.pronunciation}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Infographic */}
            {active.planData?.infographic && (
              <div>
                <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">📊 Concept Infographic</h3>
                <div className="rounded-2xl overflow-hidden border border-slate-100">
                  <InteractiveInfographic topic={active.topic} subject={active.subject} data={active.planData.infographic} />
                </div>
              </div>
            )}

            <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest pt-2">TN Schools AI Education Platform</p>
          </div>
        </div>
      ) : (
        /* ───── List view ───── */
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 glass rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50">
            <div>
              <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-wider mb-1">Published Lessons</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Focused key points &amp; infographics from your teacher.</p>
            </div>
            <span className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm rounded-xl border border-indigo-200/20">Class {studentClass}</span>
          </div>

          {subjects.length > 1 && (
            <div className="flex gap-2 mb-6 flex-wrap">
              {subjects.map((s) => (
                <button key={s} onClick={() => setSubjectFilter(s)} className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${subjectFilter === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400"}`}>{s}</button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-3" />
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider animate-pulse">Loading lessons…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-12 glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
              <span className="text-5xl block mb-4">🕓</span>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No lessons published yet.</p>
              <p className="text-xs text-slate-500 mt-2">Your teacher hasn't shared any AI lessons for your class yet.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginatedLessons.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => { setActive(l); setLang("en"); }}
                    className="text-left rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-200 bg-white dark:bg-slate-950/40 group"
                  >
                    <div className="h-28 flex items-center justify-center text-5xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 group-hover:scale-105 transition-transform">
                      {l.planData?.infographic?.heroIcon || "📚"}
                    </div>
                    <div className="p-4">
                      <div className="flex gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase">{l.subject}</span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold uppercase">{l.grade}</span>
                      </div>
                      <p className="font-black text-sm text-slate-800 dark:text-slate-100 truncate">{l.topic}</p>
                      <span className="text-[10px] text-indigo-500 font-bold">View lesson →</span>
                    </div>
                  </button>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 mt-8">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ───── Present (fullscreen) ───── */}
      {presenting && active && (
        <div className="fixed inset-0 z-[100] bg-white text-slate-900 flex flex-col">
          {/* Background decoration */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[100px] opacity-50" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-[100px] opacity-50" />
          </div>

          <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-slate-100 relative z-10 bg-white/80 backdrop-blur-md">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase border border-indigo-100">{active.grade} • {active.subject}</span>
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 rounded-lg p-1">
                {(["en", "ta"] as const).map((l) => (
                  <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${lang === l ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{l === "en" ? "EN" : "தமிழ்"}</button>
                ))}
              </div>
              <button onClick={() => setPresenting(false)} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"><X size={20} /></button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center px-6 xl:px-20 overflow-hidden relative z-10">
            {presentIndex === 0 ? (
              <div className="text-center animate-in fade-in zoom-in duration-500 max-w-5xl">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-indigo-50 text-6xl mb-8 shadow-inner border border-indigo-100">
                  {active.planData?.infographic?.heroIcon || "📚"}
                </div>
                <h1 className="text-5xl xl:text-7xl font-black text-slate-900 mb-6 leading-tight tracking-tight drop-shadow-sm">{active.topic}</h1>
                <p className="text-slate-500 text-xl xl:text-2xl font-semibold tracking-wide uppercase">{active.grade} • {active.subject}</p>
              </div>
            ) : presentIndex <= presentPoints.length ? (
              <div className="max-w-4xl w-full text-left animate-in fade-in slide-in-from-right-8 duration-400 bg-white rounded-[2.5rem] p-6 sm:p-10 xl:p-16 shadow-2xl border border-slate-100 flex flex-col md:flex-row items-center gap-6 sm:gap-8 xl:gap-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>
                
                <div className="shrink-0 flex flex-col items-center justify-center w-32 h-32 xl:w-48 xl:h-48 rounded-[2rem] bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-xl shadow-emerald-500/30 transform -rotate-3 transition-transform relative z-10">
                  <span className="text-5xl xl:text-7xl font-black mb-1">{presentIndex}</span>
                  <span className="text-xs xl:text-sm uppercase tracking-widest font-bold opacity-80">Key Point</span>
                </div>
                
                <div className="flex-1 relative z-10">
                   {(() => {
                     const pt = presentPoints[presentIndex - 1] || "";
                     const splitIdx = pt.indexOf(':');
                     if (splitIdx > 0 && splitIdx < 50) {
                        return (
                          <>
                            <h3 className="text-2xl xl:text-3xl font-black text-emerald-600 mb-4 uppercase tracking-wide">{pt.substring(0, splitIdx)}</h3>
                            <p className="text-3xl xl:text-5xl font-bold text-slate-800 leading-snug tracking-tight">{pt.substring(splitIdx + 1).trim()}</p>
                          </>
                        )
                     }
                     return <p className="text-3xl xl:text-5xl font-bold text-slate-800 leading-snug tracking-tight">{pt}</p>;
                   })()}
                </div>
              </div>
            ) : (
              <div className="w-full max-w-6xl h-full overflow-y-auto animate-in fade-in zoom-in duration-500 pb-12 pt-4 px-2 xl:px-8">
                <InteractiveInfographic topic={active.topic} subject={active.subject} data={active.planData?.infographic} />
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 sm:px-6 py-4 sm:py-6 shrink-0 relative z-10 bg-white/80 backdrop-blur-md border-t border-slate-100">
            <button onClick={() => setPresentIndex((i) => Math.max(i - 1, 0))} disabled={presentIndex === 0} className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold disabled:opacity-30 transition-all text-sm xl:text-base">← Previous</button>
            <div className="flex gap-2 mx-2 sm:mx-4 flex-wrap justify-center">
              {Array.from({ length: presentTotal }).map((_, i) => (
                <button key={i} onClick={() => setPresentIndex(i)} className={`w-3 h-3 rounded-full transition-all ${i === presentIndex ? "bg-emerald-500 w-8 shadow-md shadow-emerald-500/30" : "bg-slate-200 hover:bg-slate-300"}`} />
              ))}
            </div>
            <button onClick={() => setPresentIndex((i) => Math.min(i + 1, presentTotal - 1))} disabled={presentIndex >= presentTotal - 1} className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold disabled:opacity-30 transition-all text-sm xl:text-base shadow-lg shadow-emerald-500/20">Next →</button>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
