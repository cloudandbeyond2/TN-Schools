"use client";

import { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import {
  ClipboardList,
  CalendarDays,
  Award,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Info,
  CheckCircle2,
  XCircle,
  Hourglass,
  Trophy,
} from "lucide-react";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

const SUBJECT_FIELDS: Array<{ key: string; label: string; color: string }> = [
  { key: "tamil", label: "Tamil", color: "#f59e0b" },
  { key: "english", label: "English", color: "#10b981" },
  { key: "mathematics", label: "Mathematics", color: "#ef4444" },
  { key: "science", label: "Science", color: "#3b82f6" },
  { key: "socialScience", label: "Social Science", color: "#8b5cf6" },
];

const GRADE_STYLES: Record<string, string> = {
  "A+": "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  A: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "B+": "bg-blue-500/20 text-blue-300 border-blue-500/40",
  B: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  C: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  D: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  U: "bg-red-500/20 text-red-300 border-red-500/40",
};

const EXAM_TYPE_STYLES: Record<string, string> = {
  "Unit Test": "bg-blue-500/15 text-blue-300 border-blue-500/30",
  Quarterly: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  "Half Yearly": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Model: "bg-red-500/15 text-red-300 border-red-500/30",
  Annual: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

const formatDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "Date TBA";

const daysUntil = (d?: string | null) => {
  if (!d) return null;
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
};

// Trend line of total percentage across published exams (chronological).
function TotalTrend({ results }: { results: any[] }) {
  const points = [...results]
    .filter((r) => r.percentage !== null && r.percentage !== undefined)
    .reverse(); // API returns newest first
  if (points.length < 2) {
    return (
      <div className="text-xs text-slate-500 italic h-24 flex items-center justify-center">
        Trend appears after two or more published results.
      </div>
    );
  }
  const w = 560;
  const h = 96;
  const xs = points.map((_, i) => (i / (points.length - 1)) * (w - 40) + 20);
  const min = Math.min(...points.map((p) => p.percentage));
  const max = Math.max(...points.map((p) => p.percentage));
  const range = Math.max(max - min, 5);
  const ys = points.map((p) => h - 18 - ((p.percentage - min) / range) * (h - 36));
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-24 overflow-visible">
      <path d={path} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={ys[i]} r={i === xs.length - 1 ? 4.5 : 3} fill="#ef4444" opacity={i === xs.length - 1 ? 1 : 0.55} />
          <text x={x} y={ys[i] - 8} textAnchor="middle" className="fill-slate-300" fontSize="10" fontWeight="700">
            {points[i].percentage}%
          </text>
          <text x={x} y={h - 2} textAnchor="middle" className="fill-slate-500" fontSize="9">
            {points[i].exam?.examName?.length > 14
              ? `${points[i].exam.examName.slice(0, 13)}…`
              : points[i].exam?.examName || `Exam ${i + 1}`}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function ModelExamsPage() {
  const { data: session } = useSession();
  const [student, setStudent] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/students`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          const myStudent = (session?.user as any)?.id
            ? json.data.find((s: any) => s.userId === (session?.user as any)?.id)
            : null;
          setStudent(myStudent || json.data[0]);
        } else {
          setError("No student profile found for your account.");
          setLoading(false);
        }
      })
      .catch(() => {
        setError("Could not reach the server to load your profile. Please try again later.");
        setLoading(false);
      });
  }, [session]);

  const loadData = (s: any) => {
    if (!s) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`${API_BASE}/api/headmaster/model-exams?schoolId=${s.schoolId}&class=${s.class}`).then((r) => r.json()),
      fetch(`${API_BASE}/api/headmaster/model-exams/student/${s.id}`).then((r) => r.json()),
    ])
      .then(([examsJson, resultsJson]) => {
        if (examsJson.success) setExams(examsJson.data || []);
        if (resultsJson.success) setResults(resultsJson.data || []);
        if (!examsJson.success && !resultsJson.success) {
          setError("Model exam data is unavailable right now.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Could not reach the server to load model exams. Please try again later.");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (student) loadData(student);
  }, [student]);

  // Exams not yet locked = scheduled / awaiting result publication.
  const publishedExamIds = new Set(results.map((r) => r.examId));
  const scheduledExams = exams.filter((e) => !e.isLocked && !publishedExamIds.has(e.id));

  const withPct = results.filter((r) => r.percentage !== null && r.percentage !== undefined);
  const avgPercent = withPct.length
    ? Math.round((withPct.reduce((s, r) => s + r.percentage, 0) / withPct.length) * 10) / 10
    : null;
  const bestResult = withPct.length
    ? withPct.reduce((best, r) => (r.percentage > best.percentage ? r : best), withPct[0])
    : null;
  const latest = results[0] || null;

  return (
    <PortalLayout
      title="Model Examinations"
      subtitle="Your school-conducted model exam schedule and published results — the closest rehearsal for the SSLC board exam."
    >
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
        </div>
      ) : error ? (
        <div className="glass rounded-2xl p-10 border border-red-500/30 text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-slate-300 text-sm mb-4">{error}</p>
          <button
            onClick={() => loadData(student)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
            <div className="kpi-card border border-slate-700 hover:border-red-500/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <ClipboardList className="h-6 w-6 text-red-400" />
                <span className="text-xs font-medium text-red-400">{scheduledExams.length} upcoming</span>
              </div>
              <div className="text-3xl font-bold text-red-400 mb-1">{results.length}</div>
              <div className="text-xs text-slate-400">Results Published</div>
            </div>
            <div className="kpi-card border border-slate-700 hover:border-blue-500/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="h-6 w-6 text-blue-400" />
                <span className="text-xs font-medium text-blue-400">across all exams</span>
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-1">{avgPercent !== null ? `${avgPercent}%` : "—"}</div>
              <div className="text-xs text-slate-400">Average Score</div>
            </div>
            <div className="kpi-card border border-slate-700 hover:border-emerald-500/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <Trophy className="h-6 w-6 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400 truncate max-w-[110px]">
                  {bestResult?.exam?.examName || "no data yet"}
                </span>
              </div>
              <div className="text-3xl font-bold text-emerald-400 mb-1">
                {bestResult ? (
                  <>
                    {bestResult.total}
                    <span className="text-sm text-slate-500">/{bestResult.maxTotal}</span>
                  </>
                ) : (
                  "—"
                )}
              </div>
              <div className="text-xs text-slate-400">Best Total</div>
            </div>
            <div className="kpi-card border border-slate-700 hover:border-amber-500/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <Award className="h-6 w-6 text-amber-400" />
                <span className={`text-xs font-medium ${latest?.isPassed === false ? "text-red-400" : "text-amber-400"}`}>
                  {latest ? (latest.isPassed === false ? "needs a push" : "keep it up!") : "awaiting exams"}
                </span>
              </div>
              <div className="text-3xl font-bold text-amber-400 mb-1">{latest?.grade || "—"}</div>
              <div className="text-xs text-slate-400">Latest Grade</div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            {/* Score trend */}
            <div className="xl:col-span-2 glass rounded-2xl p-6 border border-slate-700/50 fade-in-2">
              <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-400" /> Score Trend
              </h2>
              <p className="text-xs text-slate-500 mb-4">Overall percentage across your published model exams.</p>
              <TotalTrend results={results} />
            </div>

            {/* Upcoming exams */}
            <div className="glass rounded-2xl p-6 border border-slate-700/50 fade-in-2">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-red-400" /> Scheduled Exams
              </h2>
              {scheduledExams.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  No upcoming model exams scheduled for Class {student?.class} right now.
                </p>
              ) : (
                <div className="space-y-3">
                  {scheduledExams.slice(0, 5).map((e) => {
                    const days = daysUntil(e.examDate);
                    return (
                      <div key={e.id} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-red-500/40 transition-colors">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-sm font-bold text-slate-200 truncate">{e.examName}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0 ${EXAM_TYPE_STYLES[e.examType] || EXAM_TYPE_STYLES["Unit Test"]}`}>
                            {e.examType}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">{formatDate(e.examDate)}</span>
                          {days !== null && days >= 0 && (
                            <span className="flex items-center gap-1 text-amber-400 font-bold">
                              <Hourglass className="w-3 h-3" />
                              {days === 0 ? "Today!" : `in ${days} day${days === 1 ? "" : "s"}`}
                            </span>
                          )}
                          {days !== null && days < 0 && (
                            <span className="text-slate-500 italic">results awaited</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Published results */}
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2 fade-in-3">
            <Award className="w-4 h-4 text-red-400" /> Published Results
          </h2>
          {results.length === 0 ? (
            <div className="glass rounded-2xl p-8 border border-slate-700/50 text-center fade-in-3">
              <Info className="w-8 h-8 text-slate-500 mx-auto mb-3" />
              <p className="text-sm text-slate-400">
                No model exam results have been published yet. Results appear here as soon as your school locks
                and releases them.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 fade-in-3">
              {results.map((r) => {
                const subjects = SUBJECT_FIELDS.filter((s) => r[s.key] !== null && r[s.key] !== undefined);
                return (
                  <div key={r.id} className="glass rounded-2xl p-5 border border-slate-700/50 hover:border-red-500/40 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-white">{r.exam?.examName || "Model Exam"}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${EXAM_TYPE_STYLES[r.exam?.examType] || EXAM_TYPE_STYLES["Unit Test"]}`}>
                            {r.exam?.examType || "Exam"}
                          </span>
                          <span className="text-[11px] text-slate-500">{formatDate(r.exam?.examDate)}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-black text-white">
                          {r.total ?? "—"}
                          <span className="text-xs text-slate-500">/{r.maxTotal}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold">
                          {r.percentage !== null && r.percentage !== undefined ? `${r.percentage}%` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 mb-4">
                      {subjects.map((s) => (
                        <div key={s.key} className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 w-28 shrink-0">{s.label}</span>
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(r[s.key], 100)}%`,
                                background: `linear-gradient(90deg, ${s.color}, ${s.color}aa)`,
                              }}
                            />
                          </div>
                          <span className={`text-xs font-mono font-bold w-9 text-right ${r[s.key] < 35 ? "text-red-400" : "text-slate-300"}`}>
                            {r[s.key]}
                          </span>
                        </div>
                      ))}
                      {r.extraSubject !== null && r.extraSubject !== undefined && (
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 w-28 shrink-0 truncate">
                            {r.extraSubjectName || "Extra Subject"}
                          </span>
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-500/60 transition-all duration-500"
                              style={{ width: `${Math.min(r.extraSubject, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-mono font-bold w-9 text-right ${r.extraSubject < 35 ? "text-red-400" : "text-slate-300"}`}>
                            {r.extraSubject}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                      <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${GRADE_STYLES[r.grade] || "bg-slate-700/40 text-slate-300 border-slate-600"}`}>
                        Grade {r.grade || "—"}
                      </span>
                      {r.isPassed === true && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" /> Passed
                        </span>
                      )}
                      {r.isPassed === false && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                          <XCircle className="w-4 h-4" /> Below pass mark
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* How it works */}
          <div className="glass rounded-2xl p-6 mt-6 border border-slate-700/50 fade-in-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-red-400" /> How model exams work
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                <div className="font-bold text-slate-300 mb-1">1. School schedules</div>
                Your headmaster conducts model exams — unit tests, quarterly, half-yearly and full board models —
                mirroring the real SSLC pattern.
              </div>
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                <div className="font-bold text-slate-300 mb-1">2. Results are locked</div>
                Once marks are verified and locked by the school, your subject-wise results and grade appear here
                automatically.
              </div>
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                <div className="font-bold text-slate-300 mb-1">3. Predictions update</div>
                Every published result feeds your Performance Predictions and AI Revision Plan, sharpening your
                board-exam forecast.
              </div>
            </div>
          </div>
        </>
      )}
    </PortalLayout>
  );
}
