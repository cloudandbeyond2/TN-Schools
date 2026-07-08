"use client";

import PortalLayout from "@/components/PortalLayout";
import { useState, useRef, useCallback, useEffect } from "react";

const CLASS_OPTIONS = ["1","2","3","4","5","6","7","8","9","10","11","12"];

const SUBJECT_PRESETS: Record<string, { icon: string; color: string }> = {
  Mathematics: { icon: "📐", color: "#6366f1" },
  Science: { icon: "🔬", color: "#10b981" },
  "Social Science": { icon: "🌍", color: "#f59e0b" },
  English: { icon: "📖", color: "#3b82f6" },
  Tamil: { icon: "🌺", color: "#ec4899" },
  Physics: { icon: "⚡", color: "#8b5cf6" },
  Chemistry: { icon: "🧪", color: "#14b8a6" },
  Biology: { icon: "🌿", color: "#22c55e" },
  "Computer Science": { icon: "💻", color: "#64748b" },
  History: { icon: "🏛️", color: "#a16207" },
  Geography: { icon: "🗺️", color: "#0d9488" },
};

interface ParsedLesson {
  name: string;
  nameEnglish: string;
}

interface ParsedUnit {
  unitNumber: number;
  primaryTitle: string;
  secondaryTitle: string;
  titleTamil?: string;
  titleEnglish?: string;
  description: string;
  tip: string;
  emoji: string;
  lessons: ParsedLesson[];
}

interface PreviewData {
  language?: string;
  subjectName: string;
  className: string;
  icon: string;
  color: string;
  units: ParsedUnit[];
  pdfPages: number;
  totalUnits: number;
  totalTopics: number;
}

interface SaveResult {
  subject: { id: string; name: string; class: string };
  totalUnits: number;
  totalTopics: number;
}

type Step = "upload" | "extracting" | "preview" | "saving" | "done";

export default function SyllabusUploadPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [view, setView] = useState<"upload" | "manage">("upload");
  const [step, setStep] = useState<Step>("upload");
  const [selectedClass, setSelectedClass] = useState("8");
  const [subjectName, setSubjectName] = useState("");
  const [icon, setIcon] = useState("📚");
  const [color, setColor] = useState("#6366f1");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const applyPreset = (name: string) => {
    const p = SUBJECT_PRESETS[name];
    if (p) {
      setIcon(p.icon);
      setColor(p.color);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.type !== "application/pdf") {
        setError("Please select a PDF file");
        return;
      }
      if (f.size > 150 * 1024 * 1024) {
        setError("File size must be under 150 MB");
        return;
      }
      setFile(f);
      setError(null);
    }
  };

  const handleExtract = useCallback(async () => {
    if (!file) return;
    setError(null);
    setStep("extracting");

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("className", selectedClass);
      formData.append("previewOnly", "true");
      if (subjectName.trim()) formData.append("subjectName", subjectName.trim());
      if (icon) formData.append("icon", icon);
      if (color) formData.append("color", color);

      const res = await fetch(`${API_URL}/api/centralized-content/upload-syllabus-pdf`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Extraction failed");
      }

      setPreview(json.data);
      setStep("preview");
    } catch (err: any) {
      setError(err.message || "Failed to extract syllabus from PDF");
      setStep("upload");
    }
  }, [file, selectedClass, subjectName, icon, color, API_URL]);

  const handleConfirm = useCallback(async () => {
    if (!file) return;
    setStep("saving");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("className", selectedClass);
      if (subjectName.trim()) formData.append("subjectName", subjectName.trim());
      if (icon) formData.append("icon", icon);
      if (color) formData.append("color", color);

      const res = await fetch(`${API_URL}/api/centralized-content/upload-syllabus-pdf`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to save");

      setSaveResult({
        subject: json.data.subject,
        totalUnits: json.data.totalUnits,
        totalTopics: json.data.totalTopics,
      });
      setStep("done");
    } catch (err: any) {
      setError(err.message || "Failed to save syllabus");
      setStep("preview");
    }
  }, [file, selectedClass, subjectName, icon, color, API_URL]);

  const handleReset = () => {
    setStep("upload");
    setFile(null);
    setPreview(null);
    setSaveResult(null);
    setError(null);
    setSubjectName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <PortalLayout
      title="PDF Syllabus Upload"
      subtitle="Upload a textbook PDF to auto-extract the syllabus structure using AI."
      avatarLetter="S"
      avatarColor="#7c3aed"
      themeClass="theme-superadmin"
      accentColor="#7c3aed"
    >
      {/* View tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setView("upload")}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
            view === "upload"
              ? "bg-violet-600 text-white border-violet-600 shadow-sm"
              : "bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-violet-400"
          }`}
        >
          ⬆️ Upload PDF
        </button>
        <button
          onClick={() => setView("manage")}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
            view === "manage"
              ? "bg-violet-600 text-white border-violet-600 shadow-sm"
              : "bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-violet-400"
          }`}
        >
          🗂️ Manage Syllabus
        </button>
      </div>

      {view === "manage" ? (
        <ManageSyllabus API_URL={API_URL} />
      ) : (
      <>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {(["upload", "preview", "done"] as const).map((s, i) => {
          const labels = ["Upload & Extract", "Review Structure", "Complete"];
          const active = step === s || (step === "extracting" && s === "upload") || (step === "saving" && s === "preview");
          const completed =
            (s === "upload" && ["preview", "saving", "done"].includes(step)) ||
            (s === "preview" && step === "done");
          return (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className={`w-8 h-0.5 ${completed ? "bg-violet-500" : "bg-slate-200 dark:bg-slate-700"}`} />}
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
                    completed
                      ? "bg-violet-500 text-white"
                      : active
                      ? "bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 ring-2 ring-violet-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  {completed ? "✓" : i + 1}
                </div>
                <span className={`text-xs font-bold ${active || completed ? "text-slate-700 dark:text-slate-200" : "text-slate-400"}`}>
                  {labels[i]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 px-5 py-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm font-semibold flex items-start gap-3">
          <span className="text-lg flex-shrink-0">⚠️</span>
          <div>
            <p>{error}</p>
            <button onClick={() => setError(null)} className="text-xs mt-1 underline opacity-70 hover:opacity-100">Dismiss</button>
          </div>
        </div>
      )}

      {/* ───── STEP 1: Upload ───── */}
      {(step === "upload" || step === "extracting") && (
        <div className="space-y-6">
          {/* Class + Subject row */}
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 space-y-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">1. Select Class & Subject</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-3 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 font-extrabold rounded-xl border border-violet-200/30 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  disabled={step === "extracting"}
                >
                  {CLASS_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}th Standard</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Subject Name <span className="text-slate-400 font-normal">(optional — AI will detect from PDF)</span>
                </label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => {
                    setSubjectName(e.target.value);
                    applyPreset(e.target.value);
                  }}
                  placeholder="e.g. Mathematics, Science, Tamil..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-violet-400"
                  disabled={step === "extracting"}
                  list="subject-presets"
                />
                <datalist id="subject-presets">
                  {Object.keys(SUBJECT_PRESETS).map((n) => <option key={n} value={n} />)}
                </datalist>
              </div>
            </div>

            {/* Icon + Color */}
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Icon</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-16 px-3 py-3 text-center text-xl rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  disabled={step === "extracting"}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border-0 cursor-pointer"
                    disabled={step === "extracting"}
                  />
                  <span className="text-xs font-mono text-slate-400">{color}</span>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xl">{icon}</span>
                <span className="font-bold text-sm" style={{ color }}>{subjectName || "Subject"}</span>
                <span className="text-xs text-slate-400 font-semibold">Class {selectedClass}</span>
              </div>
            </div>
          </div>

          {/* PDF Upload */}
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 space-y-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">2. Upload Textbook PDF</h3>

            <div
              onClick={() => step !== "extracting" && fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                file
                  ? "border-violet-400 bg-violet-50/50 dark:bg-violet-950/20"
                  : "border-slate-300 dark:border-slate-700 hover:border-violet-400 hover:bg-violet-50/30 dark:hover:bg-violet-950/10"
              } ${step === "extracting" ? "pointer-events-none opacity-60" : ""}`}
            >
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={step === "extracting"}
              />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl">📄</span>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  {step !== "extracting" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                      className="text-xs text-red-500 font-bold mt-1 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl opacity-40">📤</span>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Click to select a PDF file</p>
                  <p className="text-xs text-slate-400">TN State Board textbook or syllabus document (max 150 MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Extract button */}
          <button
            onClick={handleExtract}
            disabled={!file || step === "extracting"}
            className="w-full py-4 rounded-2xl font-extrabold text-white text-sm uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: step === "extracting" ? "#7c3aed" : `linear-gradient(135deg, #7c3aed, #6366f1)` }}
          >
            {step === "extracting" ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AI is extracting syllabus structure...
              </span>
            ) : (
              "Extract Syllabus with AI"
            )}
          </button>
        </div>
      )}

      {/* ───── STEP 2: Preview ───── */}
      {(step === "preview" || step === "saving") && preview && (
        <div className="space-y-6">
          {/* Summary bar */}
          <div className="glass rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{preview.icon}</span>
              <div>
                <h3 className="font-black text-lg text-slate-800 dark:text-white">{preview.subjectName}</h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Class {preview.className}
                  {preview.language ? ` | ${preview.language}` : ""}
                  {preview.pdfPages ? ` | ${preview.pdfPages} pages` : ""}
                </p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <StatBadge label="Units" value={preview.totalUnits} bg="bg-violet-100 dark:bg-violet-950/40" text="text-violet-700 dark:text-violet-300" />
              <StatBadge label="Lessons" value={preview.totalTopics} bg="bg-emerald-100 dark:bg-emerald-950/40" text="text-emerald-700 dark:text-emerald-300" />
            </div>
          </div>

          {/* Unit list */}
          <div className="glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Extracted Units — Review Before Saving
              </h3>
              <p className="text-xs text-slate-500 mt-1">Each unit below becomes one visual card on the Syllabus Board.</p>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {preview.units.map((unit) => (
                <div key={unit.unitNumber} className="px-6 py-4">
                  <div className="flex items-start gap-3 mb-2">
                    <span
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                      style={{ background: preview.color }}
                    >
                      {unit.unitNumber}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg leading-none">{unit.emoji}</span>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{unit.primaryTitle}</h4>
                        {unit.secondaryTitle && (
                          <span className="text-xs italic text-slate-400">{unit.secondaryTitle}</span>
                        )}
                      </div>
                      {unit.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{unit.description}</p>
                      )}
                      {unit.tip && (
                        <p className="text-[11px] font-semibold mt-1" style={{ color: preview.color }}>💡 {unit.tip}</p>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex-shrink-0">
                      {unit.lessons.length} lesson{unit.lessons.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {unit.lessons.length > 0 && (
                    <div className="ml-12 flex flex-wrap gap-1.5">
                      {unit.lessons.map((lesson, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700"
                          title={lesson.nameEnglish}
                        >
                          {lesson.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setStep("upload"); setPreview(null); }}
              disabled={step === "saving"}
              className="px-6 py-3.5 rounded-2xl font-bold text-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-40"
            >
              Back to Upload
            </button>
            <button
              onClick={handleConfirm}
              disabled={step === "saving"}
              className="flex-1 py-3.5 rounded-2xl font-extrabold text-white text-sm uppercase tracking-wider transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
            >
              {step === "saving" ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving to database...
                </span>
              ) : (
                `Confirm & Save ${preview.totalUnits} Units to Database`
              )}
            </button>
          </div>
        </div>
      )}

      {/* ───── STEP 3: Done ───── */}
      {step === "done" && saveResult && (
        <div className="glass rounded-3xl p-10 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 text-center space-y-5">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Syllabus Saved Successfully!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            <strong>{saveResult.subject.name}</strong> for Class {saveResult.subject.class} now has{" "}
            <strong>{saveResult.totalUnits} units</strong> and <strong>{saveResult.totalTopics} topics</strong> in the system.
          </p>
          <p className="text-xs text-slate-400">
            Teachers can now generate AI lesson insights and publish units to students via the Syllabus Board.
          </p>
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-2xl font-bold text-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Upload Another PDF
            </button>
            <a
              href="/super-admin/learning-hub"
              className="px-6 py-3 rounded-2xl font-extrabold text-sm text-white transition-all"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}
            >
              Go to Learning Hub
            </a>
          </div>
        </div>
      )}
      </>
      )}
    </PortalLayout>
  );
}

function StatBadge({ label, value, bg, text }: { label: string; value: number; bg: string; text: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${bg} ${text}`}>
      <span className="text-lg font-black">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Manage Syllabus — edit / delete subjects, units, and lessons
// ─────────────────────────────────────────────────────────────────────────

interface MTopic { id: string; name: string; topicNumber: number; }
interface MUnit { id: string; name: string; unitNumber: number; isApproved: boolean; topics: MTopic[]; }
interface MSubject { id: string; name: string; class: string; icon: string | null; color: string | null; }

function ManageSyllabus({ API_URL }: { API_URL: string }) {
  const [selectedClass, setSelectedClass] = useState("8");
  const [subjects, setSubjects] = useState<MSubject[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [units, setUnits] = useState<Record<string, MUnit[]>>({});
  const [loadingUnits, setLoadingUnits] = useState<string | null>(null);
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);

  // Inline edit state: { kind: 'subject'|'unit'|'topic', id, value }
  const [editing, setEditing] = useState<{ kind: string; id: string; value: string } | null>(null);

  const flash = (msg: string) => { setNote(msg); setTimeout(() => setNote(null), 2500); };

  const loadSubjects = useCallback(async () => {
    setLoading(true); setErr(null);
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/subjects?class=${selectedClass}`);
      const json = await res.json();
      if (json.success) setSubjects(json.data);
      else setErr(json.error || "Failed to load subjects");
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }, [API_URL, selectedClass]);

  useEffect(() => { loadSubjects(); }, [loadSubjects]);

  const loadUnits = useCallback(async (subjectId: string) => {
    setLoadingUnits(subjectId);
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/subjects/${subjectId}/units`);
      const json = await res.json();
      if (json.success) setUnits((prev) => ({ ...prev, [subjectId]: json.data }));
    } catch (e: any) { setErr(e.message); }
    finally { setLoadingUnits(null); }
  }, [API_URL]);

  const toggleSubject = (id: string) => {
    if (expandedSubject === id) { setExpandedSubject(null); return; }
    setExpandedSubject(id);
    if (!units[id]) loadUnits(id);
  };

  const api = async (method: string, path: string, body?: any) => {
    setBusy(true); setErr(null);
    try {
      const res = await fetch(`${API_URL}/api/centralized-content${path}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Request failed");
      return json;
    } finally { setBusy(false); }
  };

  const saveEdit = async () => {
    if (!editing) return;
    const value = editing.value.trim();
    if (!value) { setEditing(null); return; }
    try {
      if (editing.kind === "subject") {
        await api("PUT", `/subjects/${editing.id}`, { name: value });
        setSubjects((prev) => prev.map((s) => (s.id === editing.id ? { ...s, name: value } : s)));
      } else if (editing.kind === "unit") {
        await api("PUT", `/units/${editing.id}`, { name: value });
        setUnits((prev) => {
          const copy = { ...prev };
          for (const sid of Object.keys(copy)) copy[sid] = copy[sid].map((u) => (u.id === editing.id ? { ...u, name: value } : u));
          return copy;
        });
      } else if (editing.kind === "topic") {
        await api("PUT", `/topics/${editing.id}`, { name: value });
        setUnits((prev) => {
          const copy = { ...prev };
          for (const sid of Object.keys(copy)) copy[sid] = copy[sid].map((u) => ({ ...u, topics: u.topics.map((t) => (t.id === editing.id ? { ...t, name: value } : t)) }));
          return copy;
        });
      }
      flash("Saved");
    } catch (e: any) { setErr(e.message); }
    finally { setEditing(null); }
  };

  const deleteSubject = async (s: MSubject) => {
    if (!confirm(`Delete subject "${s.name}" and ALL its units, lessons and content? This cannot be undone.`)) return;
    try {
      await api("DELETE", `/subjects/${s.id}`);
      setSubjects((prev) => prev.filter((x) => x.id !== s.id));
      flash("Subject deleted");
    } catch (e: any) { setErr(e.message); }
  };

  const deleteUnit = async (subjectId: string, u: MUnit) => {
    if (!confirm(`Delete unit "${u.name}" and its lessons?`)) return;
    try {
      await api("DELETE", `/units/${u.id}`);
      setUnits((prev) => ({ ...prev, [subjectId]: (prev[subjectId] || []).filter((x) => x.id !== u.id) }));
      flash("Unit deleted");
    } catch (e: any) { setErr(e.message); }
  };

  const deleteTopic = async (subjectId: string, unitId: string, t: MTopic) => {
    if (!confirm(`Delete lesson "${t.name}"?`)) return;
    try {
      await api("DELETE", `/topics/${t.id}`);
      setUnits((prev) => ({ ...prev, [subjectId]: (prev[subjectId] || []).map((u) => (u.id === unitId ? { ...u, topics: u.topics.filter((x) => x.id !== t.id) } : u)) }));
      flash("Lesson deleted");
    } catch (e: any) { setErr(e.message); }
  };

  const EditRow = ({ onCancel }: { onCancel: () => void }) => (
    <span className="inline-flex items-center gap-1.5">
      <input
        autoFocus
        value={editing?.value || ""}
        onChange={(e) => setEditing((prev) => (prev ? { ...prev, value: e.target.value } : prev))}
        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") onCancel(); }}
        className="px-2 py-1 rounded-lg border border-violet-300 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-400 min-w-[220px]"
      />
      <button onClick={saveEdit} disabled={busy} className="text-xs font-bold text-emerald-600 hover:underline">Save</button>
      <button onClick={onCancel} className="text-xs font-bold text-slate-400 hover:underline">Cancel</button>
    </span>
  );

  return (
    <div className="space-y-5">
      {/* Class selector + refresh */}
      <div className="glass rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 flex items-center gap-3 flex-wrap">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class</span>
        <select
          value={selectedClass}
          onChange={(e) => { setSelectedClass(e.target.value); setExpandedSubject(null); }}
          className="px-3 py-2 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 font-extrabold rounded-xl border border-violet-200/30 focus:outline-none"
        >
          {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}th Standard</option>)}
        </select>
        <button onClick={loadSubjects} className="ml-auto text-xs font-bold text-violet-600 hover:underline">↻ Refresh</button>
      </div>

      {note && <div className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold">✓ {note}</div>}
      {err && (
        <div className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-sm font-semibold flex items-center justify-between">
          <span>⚠️ {err}</span>
          <button onClick={() => setErr(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin mb-3" />
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Loading subjects...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center p-12 glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
          <span className="text-5xl block mb-4">📭</span>
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No subjects for Class {selectedClass} yet.</p>
          <p className="text-xs text-slate-500 mt-2">Use the Upload PDF tab to add one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subjects.map((s) => (
            <div key={s.id} className="glass rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 overflow-hidden">
              {/* Subject row */}
              <div className="flex items-center gap-3 px-5 py-4">
                <button onClick={() => toggleSubject(s.id)} className="text-slate-400 hover:text-slate-600 text-sm w-5">
                  {expandedSubject === s.id ? "▼" : "▶"}
                </button>
                <span className="text-2xl">{s.icon || "📚"}</span>
                {editing?.kind === "subject" && editing.id === s.id ? (
                  <EditRow onCancel={() => setEditing(null)} />
                ) : (
                  <h3 className="font-black text-slate-800 dark:text-white flex-1 min-w-0 truncate" style={{ color: s.color || undefined }}>
                    {s.name}
                  </h3>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={() => setEditing({ kind: "subject", id: s.id, value: s.name })} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200">✏️ Rename</button>
                  <button onClick={() => deleteSubject(s)} disabled={busy} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100">🗑️ Delete</button>
                </div>
              </div>

              {/* Units */}
              {expandedSubject === s.id && (
                <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-3">
                  {loadingUnits === s.id ? (
                    <p className="text-xs text-slate-400 py-3">Loading units…</p>
                  ) : (units[s.id] || []).length === 0 ? (
                    <p className="text-xs text-slate-400 py-3">No units in this subject.</p>
                  ) : (
                    <div className="space-y-2">
                      {(units[s.id] || []).map((u) => {
                        const hasOverview = u.topics.some((t) => t.topicNumber === 1 && (t.name === "Unit Overview" || t.name === "Overview"));
                        const lessons = hasOverview ? u.topics.filter((t) => t.topicNumber !== 1) : u.topics;
                        return (
                          <div key={u.id} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
                            <div className="flex items-center gap-2 px-3 py-2.5">
                              <button onClick={() => setExpandedUnit(expandedUnit === u.id ? null : u.id)} className="text-slate-400 text-xs w-4">
                                {expandedUnit === u.id ? "▼" : "▶"}
                              </button>
                              <span className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-black text-white flex-shrink-0" style={{ background: s.color || "#7c3aed" }}>{u.unitNumber}</span>
                              {editing?.kind === "unit" && editing.id === u.id ? (
                                <EditRow onCancel={() => setEditing(null)} />
                              ) : (
                                <span className="font-bold text-sm text-slate-700 dark:text-slate-200 flex-1 min-w-0 truncate">{u.name}</span>
                              )}
                              {u.isApproved && <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-600 text-white">Published</span>}
                              <span className="text-[10px] text-slate-400 font-bold">{lessons.length} lesson{lessons.length !== 1 ? "s" : ""}</span>
                              <button onClick={() => setEditing({ kind: "unit", id: u.id, value: u.name })} className="text-[11px] font-bold px-2 py-1 rounded-md bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-700 border border-slate-200 dark:border-slate-700">✏️</button>
                              <button onClick={() => deleteUnit(s.id, u)} disabled={busy} className="text-[11px] font-bold px-2 py-1 rounded-md bg-white dark:bg-slate-900 text-red-500 hover:text-red-700 border border-slate-200 dark:border-slate-700">🗑️</button>
                            </div>

                            {/* Lessons */}
                            {expandedUnit === u.id && (
                              <div className="px-3 pb-3 pl-11 space-y-1.5">
                                {lessons.length === 0 ? (
                                  <p className="text-[11px] text-slate-400">No lessons recorded for this unit.</p>
                                ) : lessons.map((t, idx) => (
                                  <div key={t.id} className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400 font-bold w-6">{u.unitNumber}.{hasOverview ? t.topicNumber - 1 : t.topicNumber}</span>
                                    {editing?.kind === "topic" && editing.id === t.id ? (
                                      <EditRow onCancel={() => setEditing(null)} />
                                    ) : (
                                      <span className="text-xs text-slate-600 dark:text-slate-300 flex-1 min-w-0 truncate">{t.name}</span>
                                    )}
                                    <button onClick={() => setEditing({ kind: "topic", id: t.id, value: t.name })} className="text-[11px] text-slate-400 hover:text-slate-600">✏️</button>
                                    <button onClick={() => deleteTopic(s.id, u.id, t)} disabled={busy} className="text-[11px] text-red-400 hover:text-red-600">🗑️</button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
