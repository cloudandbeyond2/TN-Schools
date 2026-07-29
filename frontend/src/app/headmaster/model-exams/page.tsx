"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import * as XLSX from "xlsx";
import { Lock, Unlock, Plus, Download, Upload, Trash2, ChevronLeft, AlertTriangle, CheckCircle2, TrendingUp, Users, BookOpen, Award } from "lucide-react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) url = `https://${url}`;
  return url;
};
const API_BASE = getApiBase();

// ── Standard 6th - 10th Subjects ──────────────────────────────────────────
const SUBJECTS = [
  { key: "tamil",        label: "Tamil",        color: "text-purple-400" },
  { key: "english",      label: "English",      color: "text-blue-400"   },
  { key: "mathematics",  label: "Maths",        color: "text-emerald-400"},
  { key: "science",      label: "Science",      color: "text-amber-400"  },
  { key: "socialScience",label: "Social",       color: "text-rose-400"   },
];
const PASS_MARK = 35;
const MAX_MARK  = 100;

const CLASSES = ["6","7","8","9","10","11","12"];
const SECTIONS = ["A","B","C","D","E"];
const EXAM_TYPES = [
  "Unit Test 1",
  "Unit Test 2",
  "Unit Test 3",
  "Quarterly Exam",
  "Half Yearly Exam",
  "Model Exam 1",
  "Model Exam 2",
  "Annual Exam",
  "Revision Test",
  "Public Exam",
];
const ACADEMIC_YEARS = ["2023-24","2024-25","2025-26"];

// ── Dynamic Subject Resolver for official TN EMIS Group Codes ─────────────
function getGroupSubjects(groupName: string | null | undefined) {
  const normalized = String(groupName || "").trim().toLowerCase();

  // 2502 / 2503 / 2601 / Science with Biology Group
  if (normalized === "2503" || normalized.includes("biology") || normalized === "2601" || normalized === "science") {
    return [
      { key: "tamil",        label: "Tamil",        color: "text-purple-400" },
      { key: "english",      label: "English",      color: "text-blue-400"   },
      { key: "mathematics",  label: "Maths",        color: "text-emerald-400"},
      { key: "science",      label: "Physics",      color: "text-orange-400" },
      { key: "socialScience",label: "Chemistry",    color: "text-pink-400"   },
      { key: "extraSubject", label: "Biology",      color: "text-emerald-500"},
    ];
  }

  // 2502 / Science with Computer Science Group
  if (normalized === "2502" || normalized.includes("computer science") || normalized === "2501") {
    return [
      { key: "tamil",        label: "Tamil",        color: "text-purple-400" },
      { key: "english",      label: "English",      color: "text-blue-400"   },
      { key: "mathematics",  label: "Maths",        color: "text-emerald-400"},
      { key: "science",      label: "Physics",      color: "text-orange-400" },
      { key: "socialScience",label: "Chemistry",    color: "text-pink-400"   },
      { key: "extraSubject", label: "Comp Sci",     color: "text-cyan-400"   },
    ];
  }

  // 2608 / Pure Science Group
  if (normalized === "2608" || normalized.includes("pure science") || normalized === "2504") {
    return [
      { key: "tamil",        label: "Tamil",        color: "text-purple-400" },
      { key: "english",      label: "English",      color: "text-blue-400"   },
      { key: "mathematics",  label: "Physics",      color: "text-orange-400" },
      { key: "science",      label: "Chemistry",    color: "text-pink-400"   },
      { key: "socialScience",label: "Botany",       color: "text-teal-400"   },
      { key: "extraSubject", label: "Zoology",      color: "text-lime-400"   },
    ];
  }

  // 2704 / 2702 / 2701 / Commerce Group
  if (normalized === "2704" || normalized === "2702" || normalized === "2701" || normalized.includes("commerce")) {
    const isCompApp = normalized === "2702" || normalized.includes("computer applications");
    return [
      { key: "tamil",        label: "Tamil",        color: "text-purple-400" },
      { key: "english",      label: "English",      color: "text-blue-400"   },
      { key: "mathematics",  label: "Commerce",     color: "text-amber-400"  },
      { key: "science",      label: "Accountancy",  color: "text-indigo-400" },
      { key: "socialScience",label: "Economics",    color: "text-rose-400"   },
      { key: "extraSubject", label: isCompApp ? "Comp App" : "Business Math", color: "text-teal-500" },
    ];
  }

  // Default: general subjects
  return [
    { key: "tamil",        label: "Tamil",        color: "text-purple-400" },
    { key: "english",      label: "English",      color: "text-blue-400"   },
    { key: "mathematics",  label: "Maths",        color: "text-emerald-400"},
    { key: "science",      label: "Physics",      color: "text-orange-400" },
    { key: "socialScience",label: "Chemistry",    color: "text-pink-400"   },
    { key: "extraSubject", label: "Biology",      color: "text-emerald-500"},
  ];
}

// ── Grade color helper ───────────────────────────────────────────────────
function gradeColor(grade: string | null | undefined) {
  switch (grade) {
    case "A+": return "text-emerald-400 font-black";
    case "A":  return "text-green-400 font-bold";
    case "B+": return "text-blue-400 font-bold";
    case "B":  return "text-cyan-400";
    case "C":  return "text-yellow-400";
    case "D":  return "text-orange-400";
    case "U":  return "text-red-500 font-bold";
    default:   return "text-slate-400";
  }
}

// ── Inline editable mark cell ─────────────────────────────────────────────
function MarkCell({ value, onChange, locked }: { value: number | null; onChange: (v: number | null) => void; locked: boolean }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value != null ? String(value) : "");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { setLocal(value != null ? String(value) : ""); }, [value]);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  const commit = () => {
    setEditing(false);
    const n = local.trim() === "" ? null : parseInt(local, 10);
    if (n !== null && (isNaN(n) || n < 0 || n > MAX_MARK)) { setLocal(value != null ? String(value) : ""); return; }
    onChange(n);
  };

  if (locked) return (
    <span className={`text-sm font-semibold ${value != null ? (value < PASS_MARK ? "text-red-400" : "text-slate-200") : "text-slate-600"}`}>
      {value != null ? value : "—"}
    </span>
  );

  return editing ? (
    <input
      ref={ref}
      type="number" min="0" max="100"
      value={local}
      onChange={e => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setLocal(value != null ? String(value) : ""); setEditing(false); } }}
      className="w-14 bg-blue-900/50 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white text-center focus:outline-none"
    />
  ) : (
    <button
      onClick={() => setEditing(true)}
      className={`w-14 h-7 rounded border transition-colors text-xs font-semibold text-center ${
        value != null
          ? value < PASS_MARK
            ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20"
            : "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
          : "border-dashed border-slate-700 bg-transparent text-slate-600 hover:border-slate-500"
      }`}
    >
      {value != null ? value : "+"}
    </button>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────
interface Exam {
  id: string; schoolId: string; examName: string; examType: string;
  class: string; section: string; group: string | null; academicYear: string;
  examDate: string | null; isLocked: boolean; lockedAt: string | null;
  createdAt: string; _count?: { results: number };
}

interface Result {
  id: string; examId: string; studentId: string; studentName: string; rollNumber: string;
  tamil: number | null; english: number | null; mathematics: number | null;
  science: number | null; socialScience: number | null; extraSubject: number | null;
  total: number | null; maxTotal: number; percentage: number | null;
  grade: string | null; isPassed: boolean | null;
}

interface LocalRow {
  studentId: string; studentName: string; rollNumber: string;
  tamil: number | null; english: number | null; mathematics: number | null;
  science: number | null; socialScience: number | null; extraSubject: number | null;
  dirty: boolean;
}

function calcLocal(row: Omit<LocalRow, "dirty">, isHsc: boolean) {
  const vals = [row.tamil, row.english, row.mathematics, row.science, row.socialScience]
    .filter(v => v != null) as number[];
  if (row.extraSubject != null) vals.push(row.extraSubject);
  const total = vals.length ? vals.reduce((a, b) => a + b, 0) : null;
  const maxTotal = isHsc ? 600 : 500;
  const pct = total != null ? parseFloat(((total / maxTotal) * 100).toFixed(1)) : null;
  const isPassed = vals.length > 0 ? vals.every(v => v >= PASS_MARK) : null;
  return { total, pct, isPassed, maxTotal };
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function ModelExamsPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const mySchoolId: string = (session?.user as any)?.schoolId || "";

  // ── State ──────────────────────────────────────────────────────────────
  const [activeClass, setActiveClass]   = useState("6");
  const [exams, setExams]               = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [activeExam, setActiveExam]     = useState<Exam | null>(null);
  const [rows, setRows]                 = useState<LocalRow[]>([]);
  const [loadingRows, setLoadingRows]   = useState(false);
  const [isSaving, setIsSaving]         = useState(false);
  const [isLocking, setIsLocking]       = useState(false);
  const [toast, setToast]               = useState<{ msg: string; type: "success"|"error" } | null>(null);

  // Create exam modal
  const [showCreate, setShowCreate]     = useState(false);
  const [newExamName, setNewExamName]   = useState("");
  const [newExamType, setNewExamType]   = useState("Unit Test 1");
  const [newClass, setNewClass]         = useState("6");
  const [newSection, setNewSection]     = useState("A");
  const [newGroup, setNewGroup]         = useState("2503");
  const [newAY, setNewAY]               = useState("2024-25");
  const [newDate, setNewDate]           = useState("");
  const [creating, setCreating]         = useState(false);

  // Bulk upload
  const [bulkPreview, setBulkPreview]   = useState<any[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [isUploading, setIsUploading]   = useState(false);
  const fileRef                         = useRef<HTMLInputElement>(null);

  // Custom Confirmation Dialog Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    confirmClass?: string;
    onConfirm: () => void;
  } | null>(null);

  // HSC Checker helper
  const isHsc = activeExam?.class === "11" || activeExam?.class === "12";
  const activeSubjects = activeExam 
    ? (isHsc ? getGroupSubjects(activeExam.group) : SUBJECTS)
    : SUBJECTS;

  // ── Helpers ────────────────────────────────────────────────────────────
  const showToast = (msg: string, type: "success"|"error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Fetch exams list ───────────────────────────────────────────────────
  const fetchExams = useCallback(async () => {
    if (!mySchoolId) return;
    setLoadingExams(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/model-exams?schoolId=${mySchoolId}&class=${activeClass}`);
      const json = await res.json();
      setExams(json.success ? json.data : []);
    } catch { showToast("Could not load exams.", "error"); }
    finally { setLoadingExams(false); }
  }, [mySchoolId, activeClass]);

  useEffect(() => { fetchExams(); }, [fetchExams]);

  // ── Open exam detail ───────────────────────────────────────────────────
  const openExam = async (exam: Exam) => {
    setActiveExam(exam);
    setLoadingRows(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/model-exams/${exam.id}`);
      const json = await res.json();
      if (json.success) {
        const saved: Result[] = json.data.results;
        // If no results yet, fetch students for this class and pre-populate
        if (saved.length === 0) {
          const tRes = await fetch(`${API_BASE}/api/headmaster/model-exams/${exam.id}/template`);
          const tJson = await tRes.json();
          if (tJson.success) {
            setRows(tJson.data.map((r: any) => ({ ...r, tamil: null, english: null, mathematics: null, science: null, socialScience: null, extraSubject: null, dirty: false })));
          }
        } else {
          setRows(saved.map(r => ({ studentId: r.studentId, studentName: r.studentName, rollNumber: r.rollNumber, tamil: r.tamil, english: r.english, mathematics: r.mathematics, science: r.science, socialScience: r.socialScience, extraSubject: r.extraSubject, dirty: false })));
        }
      }
    } catch { showToast("Could not load results.", "error"); }
    finally { setLoadingRows(false); }
  };

  // ── Create exam ────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newExamName.trim()) { showToast("Exam name required.", "error"); return; }
    setCreating(true);
    const hasGroup = newClass === "11" || newClass === "12";
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/model-exams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          schoolId: mySchoolId, 
          examName: newExamName, 
          examType: newExamType, 
          class: newClass, 
          section: newSection, 
          group: hasGroup ? newGroup : null,
          academicYear: newAY, 
          examDate: newDate || null 
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`✅ "${newExamName}" created!`);
        setShowCreate(false);
        setNewExamName(""); setNewDate("");
        fetchExams();
      } else { showToast(json.error || "Failed.", "error"); }
    } catch { showToast("Server error.", "error"); }
    finally { setCreating(false); }
  };

  // ── Update a local row cell ────────────────────────────────────────────
  const updateCell = (idx: number, key: keyof LocalRow, val: number | null) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [key]: val, dirty: true } : r));
  };

  // ── Save all dirty rows ────────────────────────────────────────────────
  const handleSave = async () => {
    if (!activeExam) return;
    const dirty = rows.filter(r => r.dirty);
    if (dirty.length === 0) { showToast("No changes to save."); return; }
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/model-exams/${activeExam.id}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results: dirty }),
      });
      const json = await res.json();
      if (json.success) {
        setRows(prev => prev.map(r => ({ ...r, dirty: false })));
        showToast(`✅ Saved ${json.saved} student marks!`);
      } else { showToast(json.error || "Failed.", "error"); }
    } catch { showToast("Server error.", "error"); }
    finally { setIsSaving(false); }
  };

  // ── Lock exam ──────────────────────────────────────────────────────────
  const handleLock = async () => {
    if (!activeExam) return;
    setConfirmConfig({
      title: "🔒 Lock Exam?",
      message: "Marks CANNOT be changed after locking. This is irreversible. Students and teachers will be notified of the results immediately.",
      confirmText: "Yes, Lock & Notify",
      confirmClass: "bg-red-600 hover:bg-red-700 text-white",
      onConfirm: async () => {
        setIsLocking(true);
        try {
          const res = await fetch(`${API_BASE}/api/headmaster/model-exams/${activeExam.id}/lock`, { method: "PATCH" });
          const json = await res.json();
          if (json.success) {
            setActiveExam(prev => prev ? { ...prev, isLocked: true, lockedAt: json.data.lockedAt } : prev);
            showToast("🔒 Exam locked successfully!");
            fetchExams();
          } else { showToast(json.error || "Failed.", "error"); }
        } catch { showToast("Server error.", "error"); }
        finally { setIsLocking(false); }
      }
    });
  };

  // ── Delete exam ────────────────────────────────────────────────────────
  const handleDelete = async (exam: Exam) => {
    setConfirmConfig({
      title: "🗑️ Delete Exam?",
      message: `Are you sure you want to delete "${exam.examName}"? This cannot be undone and all student marks for this exam will be deleted.`,
      confirmText: "Delete",
      confirmClass: "bg-red-600 hover:bg-red-700 text-white",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/api/headmaster/model-exams/${exam.id}`, { method: "DELETE" });
          const json = await res.json();
          if (json.success) { showToast("Exam deleted."); fetchExams(); }
          else showToast(json.error || "Failed.", "error");
        } catch { showToast("Server error.", "error"); }
      }
    });
  };

  // ── Download Excel template ────────────────────────────────────────────
  const handleDownloadTemplate = async () => {
    if (!activeExam) return;
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/model-exams/${activeExam.id}/template`);
      const json = await res.json();
      if (!json.success) { showToast("Could not fetch students.", "error"); return; }

      // Dynamic headers depending on group
      const headers = ["Student ID","Student Name","Roll Number","Class","Section", ...activeSubjects.map(s => s.label)];
      
      const data = json.data.map((r: any) => {
        const rowData: any = {
          "Student ID": r.studentId, 
          "Student Name": r.studentName, 
          "Roll Number": r.rollNumber,
          "Class": r.class, 
          "Section": r.section
        };
        activeSubjects.forEach(s => {
          rowData[s.label] = ""; // Prefill with blank marks
        });
        return rowData;
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data, { header: headers });
      ws["!cols"] = headers.map(h => ({ wch: Math.max(h.length + 2, 16) }));
      XLSX.utils.book_append_sheet(wb, ws, "Marks Template");
      
      const groupSuffix = activeExam.group ? `_${activeExam.group.replace(/\s+/g, '')}` : "";
      XLSX.writeFile(wb, `${activeExam.examName}_Class${activeExam.class}${activeExam.section}${groupSuffix}_template.xlsx`);
      showToast("📥 Template downloaded with students pre-filled!");
    } catch { showToast("Download failed.", "error"); }
  };

  // ── Parse uploaded Excel for bulk marks ───────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target?.result, { type: "binary", cellDates: false });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json<any>(ws, { raw: false, dateNF: "yyyy-mm-dd" });
        
        const preview = raw.map((r: any) => {
          const rowData: any = {
            studentId:    r["Student ID"]      || "",
            studentName:  r["Student Name"]    || "",
            rollNumber:   r["Roll Number"]     || "",
            tamil:        null,
            english:      null,
            mathematics:  null,
            science:      null,
            socialScience:null,
            extraSubject: null,
          };
          
          activeSubjects.forEach(s => {
            const rawVal = r[s.label];
            const parsedVal = rawVal !== "" && rawVal != null ? Number(rawVal) : null;
            rowData[s.key] = parsedVal;
          });
          
          return rowData;
        });

        setBulkPreview(preview);
        setShowBulkModal(true);
      } catch { showToast("Invalid Excel file.", "error"); }
      finally { setIsUploading(false); if (fileRef.current) fileRef.current.value = ""; }
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkConfirm = async () => {
    if (!activeExam || bulkPreview.length === 0) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/model-exams/${activeExam.id}/bulk-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results: bulkPreview }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`🎉 Saved ${json.saved} student marks!`);
        setShowBulkModal(false);
        setBulkPreview([]);
        openExam(activeExam);
      } else { showToast(json.error || "Failed.", "error"); }
    } catch { showToast("Server error.", "error"); }
    finally { setIsSaving(false); }
  };

  // ── Analytics from local rows ─────────────────────────────────────────
  const analytics = (() => {
    const entered = rows.filter(r => r.tamil != null || r.english != null);
    if (!entered.length) return null;
    const subAvg = activeSubjects.map(s => {
      const vals = entered.map(r => (r as any)[s.key]).filter((v: any) => v != null) as number[];
      return { ...s, avg: vals.length ? Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length) : 0 };
    });
    const totals = entered.map(r => calcLocal(r, isHsc));
    const passed = totals.filter(t => t.isPassed === true).length;
    const avgPct = totals.filter(t => t.pct != null).reduce((a, b) => a + (b.pct || 0), 0) / (totals.filter(t => t.pct != null).length || 1);
    const toppers = [...entered].sort((a, b) => {
      const ta = calcLocal(a, isHsc).total || 0;
      const tb = calcLocal(b, isHsc).total || 0;
      return tb - ta;
    }).slice(0, 5);
    return { subAvg, passed, total: entered.length, avgPct: Math.round(avgPct), toppers };
  })();

  const dirtyCount = rows.filter(r => r.dirty).length;

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "மாதிரி தேர்வு மதிப்பெண்கள் & முன்னேற்ற பகுப்ில்" : "Model Exam Results & Revision Analytics"}
      subtitle={`${(session?.user as any)?.name || "Headmaster"} · ${(session?.user as any)?.schoolName || ""}`}
      avatarLetter="H"
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl border transition-all ${toast.type === "error" ? "bg-red-900/90 border-red-500/40 text-red-200" : "bg-emerald-900/90 border-emerald-500/40 text-emerald-200"}`}>
          {toast.msg}
        </div>
      )}

      {/* ── EXAM DETAIL VIEW ──────────────────────────────────────────── */}
      {activeExam ? (
        <div className="fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveExam(null)} className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors">
                <ChevronLeft className="w-4 h-4 text-slate-300" />
              </button>
              <div>
                <h1 className="text-lg font-black text-white">{activeExam.examName}</h1>
                <p className="text-xs text-slate-400">
                  Class {activeExam.class} — Section {activeExam.section} 
                  {activeExam.group ? ` (${activeExam.group})` : ""} · {activeExam.academicYear} · {activeExam.examType}
                </p>
              </div>
              {activeExam.isLocked ? (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold rounded-full">
                  <Lock className="w-3 h-3" /> LOCKED
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full">
                  <Unlock className="w-3 h-3" /> OPEN
                </span>
              )}
            </div>

            {/* Action buttons */}
            {!activeExam.isLocked && (
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={handleDownloadTemplate} className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors">
                  <Download className="w-3.5 h-3.5" /> Template
                </button>
                <label className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-xl cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" /> Upload Excel
                  <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
                </label>
                {dirtyCount > 0 && (
                  <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-60">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isSaving ? "Saving…" : `Save ${dirtyCount} Change${dirtyCount > 1 ? "s" : ""}`}
                  </button>
                )}
                <button onClick={() => handleLock()} disabled={isLocking} className="flex items-center gap-1.5 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-xs font-bold rounded-xl transition-colors disabled:opacity-60">
                  <Lock className="w-3.5 h-3.5" /> {isLocking ? "Locking…" : "🔒 Lock & Notify"}
                </button>
              </div>
            )}
            {activeExam.isLocked && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Lock className="w-3.5 h-3.5 text-red-500" />
                Locked on {activeExam.lockedAt ? new Date(activeExam.lockedAt).toLocaleDateString("en-IN") : "—"}
              </div>
            )}
          </div>

          {/* Marks Table */}
          <div className="glass rounded-2xl border border-slate-800 mb-6 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">📋 Student Marks — Samacheer Kalvi</h2>
              <span className="text-xs text-slate-400">
                {rows.length} students · Max 100 per subject · Pass: 35
              </span>
            </div>

            {loadingRows ? (
              <div className="flex items-center justify-center py-16 text-slate-400 text-sm">Loading students…</div>
            ) : rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <BookOpen className="w-10 h-10 text-slate-700" />
                <p className="text-slate-500 text-sm">No students found for Class {activeExam.class}-{activeExam.section} {activeExam.group ? `(${activeExam.group})` : ""}.</p>
                <p className="text-slate-600 text-xs">Verify students with this Group/Class exist in Student Monitoring.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="py-3 pl-5 text-left w-8">#</th>
                      <th className="py-3 text-left">Student Name</th>
                      <th className="py-3 text-left">Roll No</th>
                      {activeSubjects.map(s => (
                        <th key={s.key} className={`py-3 text-center ${s.color}`}>{s.label}</th>
                      ))}
                      <th className="py-3 text-center text-white font-black">Total</th>
                      <th className="py-3 text-center">%</th>
                      <th className="py-3 text-center pr-5">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {rows.map((row, idx) => {
                      const { total, pct, isPassed, maxTotal } = calcLocal(row, isHsc);
                      return (
                        <tr key={row.studentId || idx} className={`transition-colors hover:bg-slate-800/30 ${row.dirty ? "bg-blue-900/10" : ""}`}>
                          <td className="py-3 pl-5 text-slate-500">{idx + 1}</td>
                          <td className="py-3 font-semibold text-white whitespace-nowrap">
                            {row.studentName}
                            {row.dirty && <span className="ml-1.5 text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">unsaved</span>}
                          </td>
                          <td className="py-3 text-slate-400 font-mono text-[11px]">{row.rollNumber}</td>
                          {activeSubjects.map(s => (
                            <td key={s.key} className="py-3 text-center">
                              <MarkCell
                                value={(row as any)[s.key]}
                                onChange={v => updateCell(idx, s.key as keyof LocalRow, v)}
                                locked={activeExam.isLocked}
                              />
                            </td>
                          ))}
                          <td className="py-3 text-center">
                            <span className={`font-black text-sm ${total == null ? "text-slate-600" : isPassed ? "text-emerald-400" : "text-red-400"}`}>
                              {total != null ? `${total}/${maxTotal}` : "—"}
                            </span>
                          </td>
                          <td className="py-3 text-center text-slate-300">{pct != null ? `${pct}%` : "—"}</td>
                          <td className="py-3 text-center pr-5">
                            {isPassed != null ? (
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isPassed ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                                {isPassed ? "PASS" : "FAIL"}
                              </span>
                            ) : <span className="text-slate-600">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Save bar */}
            {!activeExam.isLocked && rows.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-900/40">
                <span className="text-xs text-slate-500">{dirtyCount > 0 ? `${dirtyCount} unsaved change${dirtyCount > 1 ? "s" : ""}` : "All saved"}</span>
                <button onClick={handleSave} disabled={isSaving || dirtyCount === 0} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl disabled:opacity-40 transition-colors">
                  {isSaving ? "Saving…" : "💾 Save All Marks"}
                </button>
              </div>
            )}
          </div>

          {/* Analytics */}
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* KPI cards */}
              <div className="glass rounded-2xl border border-slate-800 p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">📊 Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Students Entered</span>
                    <span className="text-sm font-black text-white">{analytics.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Passed</span>
                    <span className="text-sm font-black text-emerald-400">{analytics.passed} <span className="text-xs text-slate-500">/ {analytics.total}</span></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Failed</span>
                    <span className="text-sm font-black text-red-400">{analytics.total - analytics.passed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Pass Rate</span>
                    <span className="text-sm font-black text-blue-400">{analytics.total ? Math.round((analytics.passed / analytics.total) * 100) : 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Class Average</span>
                    <span className="text-sm font-black text-amber-400">{analytics.avgPct}%</span>
                  </div>
                </div>
              </div>

              {/* Subject averages */}
              <div className="glass rounded-2xl border border-slate-800 p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">📈 Subject Averages</h3>
                <div className="space-y-3">
                  {analytics.subAvg.map(s => (
                    <div key={s.key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={s.color}>{s.label}</span>
                        <span className="text-slate-300 font-bold">{s.avg}/100</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${s.avg < PASS_MARK ? "bg-red-500" : s.avg < 60 ? "bg-orange-500" : "bg-emerald-500"}`}
                          style={{ width: `${s.avg}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toppers */}
              <div className="glass rounded-2xl border border-slate-800 p-5 flex flex-col">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">🏆 Top Performers</h3>
                <div className="space-y-3 flex-1">
                  {analytics.toppers.map((t, i) => {
                    const { total, pct, maxTotal } = calcLocal(t, isHsc);
                    return (
                      <div key={t.studentId} className="flex items-center gap-3">
                        <div className="w-6 text-center shrink-0">
                          {i === 0 ? <span className="text-lg">🥇</span> : i === 1 ? <span className="text-lg">🥈</span> : i === 2 ? <span className="text-lg">🥉</span> : <span className="text-[10px] font-black text-slate-500 bg-slate-800 rounded-full px-1.5 py-0.5">#{i+1}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{t.studentName}</p>
                          <p className="text-[10px] text-slate-500">{t.rollNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-emerald-400">{total}/{maxTotal}</p>
                          <p className="text-[10px] text-slate-400">{pct}%</p>
                        </div>
                      </div>
                    );
                  })}
                  {analytics.toppers.length === 0 && <p className="text-xs text-slate-600">Enter marks to see toppers.</p>}
                </div>
                {analytics.toppers.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-800/60 text-center shrink-0">
                    <Link
                      href={`/headmaster/model-exams/${activeExam.id}/top-performers`}
                      className="inline-block text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-xl transition-colors"
                    >
                      View All Rankings →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        // ── EXAM LIST VIEW ────────────────────────────────────────────────
        <div className="fade-in">
          {/* Class Tabs */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-xs text-slate-500 font-bold mr-1">CLASS</span>
            {CLASSES.map(cls => (
              <button key={cls}
                onClick={() => { setActiveClass(cls); }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeClass === cls ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"}`}
              >
                Class {cls}
              </button>
            ))}
            <button onClick={() => setShowCreate(true)}
              className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-blue-600/20">
              <Plus className="w-3.5 h-3.5" /> New Exam
            </button>
          </div>

          {/* How it works banner */}
          <div className="glass rounded-2xl border border-slate-800 p-5 mb-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Quick Step-by-Step Guide</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: "1", title: "Create Exam", desc: "Click + New Exam, fill exam details & group (for 11th & 12th)" },
                { step: "2", title: "Open Roster", desc: "Click 📝 Enter Marks on the exam card to load students" },
                { step: "3", title: "Add Marks", desc: "Click subject cells, type marks (0-100), press Enter & Save" },
                { step: "4", title: "Lock & Send", desc: "Click 🔒 Lock Exam to finalize and auto-notify students & teachers" }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start relative group">
                  <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 mb-0.5">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Exams", value: exams.length, icon: <BookOpen className="w-4 h-4" />, color: "text-blue-400" },
              { label: "Locked Exams", value: exams.filter(e => e.isLocked).length, icon: <Lock className="w-4 h-4" />, color: "text-red-400" },
              { label: "Open Exams", value: exams.filter(e => !e.isLocked).length, icon: <Unlock className="w-4 h-4" />, color: "text-emerald-400" },
              { label: "Total Students Marked", value: exams.reduce((a, e) => a + (e._count?.results || 0), 0), icon: <Users className="w-4 h-4" />, color: "text-amber-400" },
            ].map(kpi => (
              <div key={kpi.label} className="glass rounded-2xl border border-slate-800 p-4 flex flex-col gap-2">
                <div className={`${kpi.color} flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider`}>
                  {kpi.icon} {kpi.label}
                </div>
                <span className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</span>
              </div>
            ))}
          </div>

          {/* Exams List */}
          <div className="glass rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">📋 Class {activeClass} — Exam Sessions</h2>
              {loadingExams && <span className="text-xs text-slate-500 animate-pulse">Loading…</span>}
            </div>

            {!loadingExams && exams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-blue-500/50" />
                </div>
                <div className="text-center">
                  <p className="text-slate-400 font-semibold text-sm">No exams for Class {activeClass} yet</p>
                  <p className="text-slate-600 text-xs mt-1">Click "New Exam" to create the first one</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Create Exam
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {exams.map(exam => (
                  <div key={exam.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-2 h-10 rounded-full flex-shrink-0 ${exam.isLocked ? "bg-red-500" : "bg-emerald-500"}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">{exam.examName}</span>
                          <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full text-slate-400">{exam.examType}</span>
                          {exam.group && <span className="text-[10px] bg-blue-600/15 border border-blue-500/30 px-2 py-0.5 rounded-full text-blue-400">{exam.group}</span>}
                          {exam.isLocked && <span className="text-[10px] bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded-full text-red-400 flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> Locked</span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Section {exam.section} · {exam.academicYear}
                          {exam.examDate ? ` · ${new Date(exam.examDate).toLocaleDateString("en-IN")}` : ""}
                          {" · "}<span className="text-blue-400 font-semibold">{exam._count?.results || 0} students marked</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => openExam(exam)} className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-xl transition-colors">
                        {exam._count?.results ? "✏️ Edit Marks" : "📝 Enter Marks"}
                      </button>
                      {!exam.isLocked && (
                        <button onClick={() => handleDelete(exam)} className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CREATE EXAM MODAL ───────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-2xl border border-slate-700 w-full max-w-md p-6 shadow-2xl fade-in">
            <h2 className="text-base font-black text-white mb-5">📝 Create New Exam</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Exam Name *</label>
                <input value={newExamName} onChange={e => setNewExamName(e.target.value)}
                  placeholder="e.g. Unit Test 1, Half Yearly Exam"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Exam Type</label>
                  <select value={newExamType} onChange={e => setNewExamType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                    {EXAM_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Class *</label>
                  <select value={newClass} onChange={e => { setNewClass(e.target.value); if (e.target.value !== "11" && e.target.value !== "12") setNewGroup("2503"); }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                    {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                </div>
              </div>

              {(newClass === "11" || newClass === "12") && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Academic Group *</label>
                  <select value={newGroup} onChange={e => setNewGroup(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="2503">Biology (Bio-Maths / Science — 2503)</option>
                    <option value="2502">Computer Science (2502)</option>
                    <option value="2608">Pure Science (Botany & Zoology — 2608)</option>
                    <option value="2704">Commerce & Accountancy (2704)</option>
                    <option value="2601">Science with Biology & CS (2601)</option>
                    <option value="2702">Commerce with Computer Applications (2702)</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Section</label>
                  <select value={newSection} onChange={e => setNewSection(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                    {SECTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Academic Year</label>
                  <select value={newAY} onChange={e => setNewAY(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                    {ACADEMIC_YEARS.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Exam Date (optional)</label>
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-350 text-sm font-bold rounded-xl transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={creating || !newExamName.trim()}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">
                {creating ? "Creating…" : "✅ Create Exam"}
              </button>
            </div>
            <p className="text-[10px] text-slate-600 text-center mt-3">
              After creating, click <strong className="text-slate-500">"Enter Marks"</strong> on the exam card to add student marks
            </p>
          </div>
        </div>
      )}

      {/* ── BULK UPLOAD PREVIEW MODAL ────────────────────────────────────── */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-2xl border border-slate-700 w-full max-w-4xl max-h-[85vh] flex flex-col p-6 shadow-2xl fade-in">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div>
                <h2 className="text-base font-black text-white">📊 Bulk Upload Preview</h2>
                <p className="text-xs text-slate-400 mt-0.5">{bulkPreview.length} rows detected. Review before importing.</p>
              </div>
              <button onClick={() => { setShowBulkModal(false); setBulkPreview([]); }} className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors">✕</button>
            </div>

            <div className="overflow-auto flex-1 rounded-xl border border-slate-800">
              <table className="w-full text-xs min-w-[700px]">
                <thead className="sticky top-0 bg-slate-900 border-b border-slate-800">
                  <tr className="text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 pl-4 text-left">Name</th>
                    <th className="py-2.5 text-left">Roll</th>
                    {activeSubjects.map(s => <th key={s.key} className={`py-2.5 text-center ${s.color}`}>{s.label}</th>)}
                    <th className="py-2.5 text-center text-white pr-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {bulkPreview.map((r, i) => {
                    const tot = [r.tamil, r.english, r.mathematics, r.science, r.socialScience, r.extraSubject].filter(v => v != null).reduce((a: number, b: number) => a + b, 0);
                    return (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="py-2.5 pl-4 font-semibold text-white">{r.studentName}</td>
                        <td className="py-2.5 text-slate-400 font-mono">{r.rollNumber}</td>
                        {activeSubjects.map(s => (
                          <td key={s.key} className={`py-2.5 text-center font-semibold ${r[s.key] != null && r[s.key] < PASS_MARK ? "text-red-400" : "text-slate-200"}`}>
                            {r[s.key] != null ? r[s.key] : <span className="text-slate-700">—</span>}
                          </td>
                        ))}
                        <td className="py-2.5 text-center font-black text-emerald-400 pr-4">{tot}/{isHsc ? 600 : 500}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 mt-4 flex-shrink-0">
              <button onClick={() => { setShowBulkModal(false); setBulkPreview([]); }} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-350 text-sm font-bold rounded-xl transition-colors">Cancel</button>
              <button onClick={handleBulkConfirm} disabled={isSaving}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50">
                {isSaving ? "Importing…" : `✅ Confirm Import (${bulkPreview.length} rows)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOM CONFIRMATION MODAL ────────────────────────────────────── */}
      {confirmConfig && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="glass rounded-2xl border border-slate-700 w-full max-w-sm p-6 shadow-2xl fade-in text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-base font-black text-white mb-2">{confirmConfig.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">{confirmConfig.message}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmConfig(null)} 
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-350 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  confirmConfig.onConfirm();
                  setConfirmConfig(null);
                }} 
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-colors ${confirmConfig.confirmClass || "bg-blue-600 hover:bg-blue-700 text-white"}`}
              >
                {confirmConfig.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
