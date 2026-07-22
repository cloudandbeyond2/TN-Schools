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

  const handleOpen = (paper: any) => {
    fetch(`${API_BASE}/api/sslc-prep/papers/${paper._id}/download`, { method: "POST" }).catch(() => {});
    setPapers((prev) =>
      prev.map((p) => (p._id === paper._id ? { ...p, downloads: (p.downloads || 0) + 1 } : p))
    );
    if (paper.fileUrl) window.open(paper.fileUrl, "_blank");
  };

  return (
    <PortalLayout
      title="Previous Question Papers"
      subtitle="Board and model exam papers — the fastest way to learn the exam pattern."
    >
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
                        <p className="text-[11px] text-slate-500 mb-4">
                          {paper.subject} · {paper.durationMinutes} min · {paper.maxMarks} marks
                        </p>
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
    </PortalLayout>
  );
}
