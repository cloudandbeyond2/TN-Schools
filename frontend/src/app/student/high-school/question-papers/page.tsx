"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import { FcDocument, FcDownload, FcClock, FcFilledFilter, FcGraduationCap } from "react-icons/fc";
import { motion, AnimatePresence } from "framer-motion";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

const SUBJECTS = ["All", "Tamil", "English", "Mathematics", "Science", "Social Science"];
const PAPER_TYPES = ["All", "Board", "Model", "Quarterly", "Half-Yearly", "Annual"];

const SUBJECT_COLORS: Record<string, string> = {
  Tamil: "#f59e0b",
  English: "#10b981",
  Mathematics: "#ef4444",
  Science: "#3b82f6",
  "Social Science": "#8b5cf6",
};

export default function QuestionPapersPage() {
  const { data: session } = useSession();
  const [student, setStudent] = useState<any>(null);
  const [papers, setPapers] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<"9" | "10">("10");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/students`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          const myStudent = (session?.user as any)?.id
            ? json.data.find((s: any) => s.userId === (session?.user as any)?.id)
            : null;
          const matched = myStudent || json.data[0];
          setStudent(matched);
          if (matched && matched.class) {
            const g = String(matched.class);
            if (g === "9" || g === "10") {
              setSelectedGrade(g as "9" | "10");
            }
          }
        }
      })
      .catch((err) => console.error(err));
  }, [session]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ class: selectedGrade });
    if (student?.schoolId) params.set("schoolId", student.schoolId);
    fetch(`${API_BASE}/api/sslc-prep/papers?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setPapers(json.data);
        } else {
          setPapers([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load question papers:", err);
        setPapers([]);
        setLoading(false);
      });
  }, [student, selectedGrade]);

  const visiblePapers = useMemo(
    () =>
      papers.filter(
        (p) =>
          (subjectFilter === "All" || p.subject === subjectFilter) &&
          (typeFilter === "All" || p.paperType === typeFilter)
      ),
    [papers, subjectFilter, typeFilter]
  );

  const years = useMemo(
    () => Array.from(new Set(visiblePapers.map((p) => p.year))).sort().reverse(),
    [visiblePapers]
  );

  const [viewingPaper, setViewingPaper] = useState<any | null>(null);

  const handleOpen = (paper: any) => {
    fetch(`${API_BASE}/api/sslc-prep/papers/${paper._id}/download`, { method: "POST" }).catch(() => {});
    setPapers((prev) =>
      prev.map((p) => (p._id === paper._id ? { ...p, downloads: (p.downloads || 0) + 1 } : p))
    );
    if (paper.fileUrl) {
      setViewingPaper(paper);
    }
  };

  return (
    <PortalLayout
      title="Previous Question Papers"
      subtitle="Board and model exam papers — the fastest way to learn the exam pattern."
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-start sm:items-center gap-3">
          <i className="fi fi-sr-document text-xl sm:text-2xl text-indigo-600 dark:text-indigo-400 flex items-center shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-black text-black dark:text-white uppercase tracking-wider leading-tight">
              Previous Question Papers (PYQ)
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Official board and model exam papers — master the question patterns, marks distribution, and model solutions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60 self-start sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Grade:</span>
          <span className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-extrabold text-xs sm:text-sm rounded-xl border border-indigo-200/20 shadow-sm">
            <i className="fi fi-sr-graduation-cap flex items-center text-xs sm:text-sm" />
            Class 10th Standard
          </span>
        </div>
      </div>

      {/* Stats strip */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {[
          { label: "Papers Available", value: String(visiblePapers.length), icon: FcDocument, color: "text-red-400" },
          { label: "Years Covered", value: String(years.length), icon: FcClock, color: "text-blue-400" },
          { label: "Subjects", value: String(new Set(visiblePapers.map((p) => p.subject)).size), icon: FcGraduationCap, color: "text-emerald-400" },
          { label: "Total Opens", value: String(visiblePapers.reduce((s, p) => s + (p.downloads || 0), 0)), icon: FcDownload, color: "text-purple-400" },
        ].map((kpi, idx) => (
          <motion.div 
            key={kpi.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1, duration: 0.3 }}
            className="kpi-card border border-slate-700"
          >
            <kpi.icon className="h-6 w-6 mb-2" />
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-slate-400 mt-1">{kpi.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass rounded-2xl p-4 mb-6 border border-slate-700/50 flex flex-col lg:flex-row lg:items-center gap-4"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <FcFilledFilter className="w-5 h-5" /> Filters
        </div>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              onClick={() => setSubjectFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                subjectFilter === s
                  ? "bg-red-500 border-red-500 text-white"
                  : "bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 lg:ml-auto items-center">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-red-500/50"
          >
            {PAPER_TYPES.map((t) => (
              <option key={t} value={t}>{t === "All" ? "All Paper Types" : t}</option>
            ))}
          </select>
          <div className="flex bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700 items-center gap-2">
            <span className="text-xs font-bold text-slate-300">Class {selectedGrade}</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black uppercase tracking-wider">Auto-detected</span>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
        </div>
      ) : years.length === 0 ? (
        <div className="glass rounded-2xl p-10 border border-slate-700/50 text-center">
          <FcDocument className="w-12 h-12 mx-auto mb-3 opacity-80" />
          <p className="text-slate-400 text-sm">No question papers match these filters yet.</p>
        </div>
      ) : (
        <motion.div layout className="space-y-8">
          <AnimatePresence>
          {years.map((year, yIdx) => (
            <motion.div 
              key={year}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: yIdx * 0.1, duration: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-bold text-white">{year}</h3>
                <div className="flex-1 h-px bg-slate-700/60" />
                <span className="text-xs text-slate-500">
                  {visiblePapers.filter((p) => p.year === year).length} papers
                </span>
              </div>
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                {visiblePapers
                  .filter((p) => p.year === year)
                  .map((paper) => {
                    const color = SUBJECT_COLORS[paper.subject] || "#ef4444";
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        key={paper._id}
                        className="glass rounded-2xl p-5 border border-slate-700/50 hover:border-red-500/50 hover:-translate-y-1 transition-all group flex flex-col"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${color}22`, border: `1px solid ${color}55` }}
                          >
                            <FcDocument className="w-6 h-6" />
                          </div>
                          <span
                            className="text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider"
                            style={{ backgroundColor: `${color}22`, color }}
                          >
                            {paper.paperType}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1 leading-snug">{paper.title}</h4>
                        <p className="text-[11px] text-slate-500 mb-2">
                          {paper.subject} · {paper.durationMinutes} min · {paper.maxMarks} marks
                        </p>
                        <div className="text-[10px] text-slate-400 mb-4 flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800 w-fit">
                          <span className="font-medium text-slate-400">Uploaded by:</span>
                          <span className="text-indigo-300 font-bold">
                            {paper.uploadedByName || (paper.schoolId ? "School Subject Teacher" : "State Board (DGE TN)")}
                          </span>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <FcDownload className="w-4 h-4" /> {paper.downloads || 0} opens
                          </span>
                          <button
                            onClick={() => handleOpen(paper)}
                            className="text-xs font-bold px-4 py-2 rounded-lg bg-slate-800 text-slate-300 group-hover:bg-red-500/20 group-hover:text-red-300 border border-transparent group-hover:border-red-500/40 transition-colors"
                          >
                            {paper.fileUrl ? "Open Paper" : "View Details"}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Information Banner: Who uploads question papers */}
      <div className="glass rounded-2xl p-4 sm:p-6 mt-8 border border-slate-700/50">
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <FcDocument className="w-5 h-5" /> Who uploads these question papers?
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
            <div className="font-bold text-indigo-300 mb-1">1. School Subject Teachers & Headmasters</div>
            High school subject teachers upload school-specific unit test papers, revision series, quarterly, half-yearly, and school model exam papers via the Teacher SSLC Prep Portal.
          </div>
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
            <div className="font-bold text-emerald-300 mb-1">2. State Directorate of Government Examinations (DGE)</div>
            Official Tamil Nadu SSLC Public Board Exam papers (PYQs) and state-wide model question papers are uploaded and maintained by the School Education Department & State Admins.
          </div>
        </div>
      </div>

      {/* Interactive PDF Document Viewer Modal */}
      <AnimatePresence>
        {viewingPaper && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700 rounded-2xl flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="p-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 shrink-0">
                    <FcDocument className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-white truncate">{viewingPaper.title}</h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{viewingPaper.subject}</span>
                      <span>•</span>
                      <span>Class {selectedGrade} ({viewingPaper.year})</span>
                      <span>•</span>
                      <span className="text-amber-400 font-semibold">{viewingPaper.paperType} Paper</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {viewingPaper.fileUrl && (
                    <a
                      href={viewingPaper.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      download={`${viewingPaper.title}.pdf`}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                    >
                      <FcDownload className="w-4 h-4" /> Download / New Tab
                    </a>
                  )}
                  <button
                    onClick={() => setViewingPaper(null)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors text-xs font-bold px-3"
                  >
                    Close ✕
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 bg-slate-950 relative flex items-center justify-center">
                {viewingPaper.fileUrl ? (
                  <iframe
                    src={viewingPaper.fileUrl}
                    title={viewingPaper.title}
                    className="w-full h-full border-0 bg-white"
                  />
                ) : (
                  <div className="text-center p-8 text-slate-400">
                    <p className="text-sm font-semibold">No PDF document attached to this paper.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PortalLayout>
  );
}
