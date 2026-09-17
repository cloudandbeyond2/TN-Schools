"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ClipboardList,
  Award,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  XCircle,
  BarChart3,
  Calendar,
  BookOpen
} from "lucide-react";

const Icon = ({ name, className = "", style }: { name: string; className?: string; style?: React.CSSProperties }) => (
  <i className={`fi fi-rr-${name} inline-flex items-center justify-center leading-none ${className}`} style={style} />
);

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

const SUBJECT_COLORS: Record<string, string> = {
  Tamil: "#f59e0b",
  English: "#10b981",
  Mathematics: "#ef4444",
  Science: "#3b82f6",
  "Social Science": "#8b5cf6",
};

const RISK_STYLES: Record<string, string> = {
  High: "bg-red-500/20 text-red-300 border-red-500/40",
  Medium: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  Low: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
};

// Tiny inline SVG sparkline for a subject's score history.
function Sparkline({ points, color }: { points: Array<{ percent: number }>; color: string }) {
  if (!points || points.length < 2) {
    return <div className="text-[10px] text-slate-600 italic h-10 flex items-center">Not enough history</div>;
  }
  const w = 140;
  const h = 40;
  const xs = points.map((_, i) => (i / (points.length - 1)) * (w - 6) + 3);
  const min = Math.min(...points.map((p) => p.percent));
  const max = Math.max(...points.map((p) => p.percent));
  const range = Math.max(max - min, 1);
  const ys = points.map((p) => h - 5 - ((p.percent - min) / range) * (h - 10));
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r={i === xs.length - 1 ? 3.5 : 2} fill={color} opacity={i === xs.length - 1 ? 1 : 0.5} />
      ))}
    </svg>
  );
}

export default function PredictionsPage() {
  const { data: session } = useSession();
  const [student, setStudent] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [modelExams, setModelExams] = useState<any[]>([]);
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

  const loadPrediction = (s: any) => {
    if (!s) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`${API_BASE}/api/sslc-prep/predictions/${s.id}`).then((r) => r.json()),
      fetch(`${API_BASE}/api/headmaster/model-exams/student/${s.id}`).then((r) => r.json()),
    ])
      .then(([predJson, modelJson]) => {
        if (predJson.success) {
          const subjectsWithData = predJson.data.subjects?.filter((x: any) => x.samples > 0) || [];
          if (subjectsWithData.length === 0 && (!modelJson.data || modelJson.data.length === 0)) {
            setPrediction(null);
            setError("No practice or model exam scores recorded yet. Take an exam to generate predictions!");
          } else {
            setPrediction(predJson.data);
          }
        } else {
          setError(predJson.error || "Prediction unavailable.");
        }

        if (modelJson.success) {
          setModelExams(modelJson.data || []);
        }
        setLoading(false);
      })
      .catch(() => {
        setPrediction(null);
        setError("Failed to fetch predictions.");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (student) loadPrediction(student);
  }, [student]);

  const overall = prediction?.overall;
  const subjects = prediction?.subjects || [];
  const subjectsWithData = subjects.filter((s: any) => s.samples > 0);

  const getLatestExamScoreForSubject = (subjName: string) => {
    if (!modelExams || modelExams.length === 0) return null;
    const keyMap: Record<string, string> = {
      Tamil: "tamil",
      English: "english",
      Mathematics: "mathematics",
      Science: "science",
      "Social Science": "socialScience",
    };
    const key = keyMap[subjName];
    if (!key) return null;
    for (const result of modelExams) {
      if (result[key] !== null && result[key] !== undefined) {
        return {
          score: result[key],
          examName: result.exam?.examName || "Model Exam",
          examType: result.exam?.examType || "Exam",
          date: result.exam?.examDate || result.createdAt,
        };
      }
    }
    return null;
  };

  return (
    <PortalLayout
      title="Performance Predictions"
      subtitle="AI-projected SSLC board scores based on your model exam results and mock tests."
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-start sm:items-center gap-3">
          <i className="fi fi-sr-chart-line-up text-xl sm:text-2xl text-indigo-600 dark:text-indigo-400 flex items-center shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-black text-black dark:text-white uppercase tracking-wider leading-tight">
              Performance Predictions
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              AI-projected SSLC board scores calculated dynamically from your official model exam results and test history.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 whitespace-nowrap shrink-0 self-start sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
          <Link
            href="/student/high-school/model-exams"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            <Award className="w-4 h-4" />
            View Model Exams →
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
        </div>
      ) : error ? (
        <div className="glass rounded-2xl p-6 sm:p-10 border border-red-500/30 text-center">
          <Icon name="triangle-warning" className="text-4xl text-red-400 mx-auto mb-3" />
          <p className="text-slate-300 text-sm mb-4">{error}</p>
          <button
            onClick={() => loadPrediction(student)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold"
          >
            <Icon name="refresh" className="text-sm" /> Retry
          </button>
        </div>
      ) : (
        <>
          {/* Overall banner */}
          <div className="glass rounded-2xl p-4 sm:p-6 mb-6 border-l-4 border-red-500 bg-red-900/10 fade-in flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
                <Icon name="brain" className="text-2xl text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Predicted SSLC Board Performance</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-lg">
                  Calculated from {subjectsWithData.reduce((s: number, x: any) => s + x.samples, 0)} exam data points across{" "}
                  {subjectsWithData.length} subjects. Predictions automatically update whenever new school model exam results or mock attempts are published.
                </p>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-4 flex-wrap w-full lg:w-auto justify-between sm:justify-start">
              <div className="bg-slate-900/80 rounded-xl p-3 sm:p-4 text-center flex-1 sm:flex-none min-w-[30%] sm:min-w-[110px] border border-red-500/30">
                <div className="text-3xl font-black text-red-400">
                  {overall?.predictedTotal ?? 0}
                  <span className="text-sm text-slate-500">/500</span>
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Predicted Total</div>
              </div>
              <div className="bg-slate-900/80 rounded-xl p-3 sm:p-4 text-center flex-1 sm:flex-none min-w-[30%] sm:min-w-[90px] border border-slate-700">
                <div className="text-3xl font-black text-white">{overall?.grade ?? "—"}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Grade Band</div>
              </div>
              <div className={`rounded-xl p-3 sm:p-4 text-center flex-1 sm:flex-none min-w-[30%] sm:min-w-[110px] border ${overall?.passLikely ? "bg-emerald-900/20 border-emerald-500/40" : "bg-amber-900/20 border-amber-500/40"}`}>
                <div className={`text-lg sm:text-xl font-black ${overall?.passLikely ? "text-emerald-400" : "text-amber-400"}`}>
                  {subjectsWithData.length === 0 ? "No Data" : overall?.passLikely ? "On Track" : "At Risk"}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Pass Outlook</div>
              </div>
            </div>
          </div>

          {/* Model Exam Results Basis Card */}
          <div className="glass rounded-2xl p-5 sm:p-6 mb-6 border border-indigo-500/30 bg-indigo-950/20 fade-in-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    Model Exam Results Basis
                  </h3>
                  <p className="text-xs text-slate-400">
                    Your official school model exam scores directly driving these predictions
                  </p>
                </div>
              </div>
              <Link
                href="/student/high-school/model-exams"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md self-start sm:self-auto"
              >
                <Award className="w-4 h-4" />
                View Full Exam Details →
              </Link>
            </div>

            {modelExams.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                No published model exam results found yet. Official exam results will automatically populate here as soon as your school locks and releases them.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {modelExams.slice(0, 3).map((r: any) => (
                  <div key={r.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-indigo-500/40 transition-all">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-white truncate">{r.exam?.examName || "Model Exam"}</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                        {r.exam?.examType || "Model"}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mb-2">
                      <div className="text-2xl font-black text-indigo-400">
                        {r.total ?? "—"} <span className="text-xs text-slate-500 font-normal">/ {r.maxTotal || 500}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-300">
                        {r.percentage !== null && r.percentage !== undefined ? `${r.percentage}%` : ""}
                      </span>
                    </div>

                    {/* Subject score tags */}
                    <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-800 text-[10px]">
                      {r.tamil != null && <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">Tam: {r.tamil}</span>}
                      {r.english != null && <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Eng: {r.english}</span>}
                      {r.mathematics != null && <span className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30">Mat: {r.mathematics}</span>}
                      {r.science != null && <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">Sci: {r.science}</span>}
                      {r.socialScience != null && <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">Soc: {r.socialScience}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 fade-in-2">
            {subjects.map((s: any) => {
              const color = SUBJECT_COLORS[s.subject] || "#ef4444";
              const TrendIconName = s.trend > 0.5 ? "arrow-trend-up" : s.trend < -0.5 ? "arrow-trend-down" : "minus";
              const trendColor = s.trend > 0.5 ? "text-emerald-400" : s.trend < -0.5 ? "text-red-400" : "text-slate-400";
              const latestModelScore = getLatestExamScoreForSubject(s.subject);

              return (
                <div key={s.subject} className="glass rounded-2xl p-4 sm:p-5 border border-slate-700/50 hover:border-red-500/40 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <h3 className="text-sm font-bold text-white">{s.subject}</h3>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full border ${RISK_STYLES[s.risk] || RISK_STYLES.Low}`}>
                      {s.risk} Risk
                    </span>
                  </div>

                  {s.samples === 0 ? (
                    <div className="text-xs text-slate-500 italic py-6 text-center">
                      No scores recorded yet for this subject.
                    </div>
                  ) : (
                    <>
                      <div className="flex items-end justify-between mb-3">
                        <div>
                          <div className="text-3xl font-black" style={{ color }}>
                            {s.predictedMarks}
                            <span className="text-sm text-slate-500">/100</span>
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">Predicted Board Marks</div>
                        </div>
                        <Sparkline points={s.history} color={color} />
                      </div>

                      {latestModelScore && (
                        <div className="mb-3 p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px] font-medium truncate max-w-[170px]">
                            Latest Exam ({latestModelScore.examType}):
                          </span>
                          <span className="font-mono font-bold text-indigo-300">{latestModelScore.score} / 100</span>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 text-center mb-3">
                        <div className="bg-slate-900/60 rounded-lg py-2 border border-slate-800">
                          <div className="text-sm font-bold text-white">{s.averagePercent}%</div>
                          <div className="text-[9px] text-slate-500 uppercase font-bold">Average</div>
                        </div>
                        <div className="bg-slate-900/60 rounded-lg py-2 border border-slate-800">
                          <div className={`text-sm font-bold flex items-center justify-center gap-1 ${trendColor}`}>
                            <Icon name={TrendIconName} className="text-xs" />
                            {s.trend > 0 ? "+" : ""}{s.trend}
                          </div>
                          <div className="text-[9px] text-slate-500 uppercase font-bold">Trend / Exam</div>
                        </div>
                        <div className="bg-slate-900/60 rounded-lg py-2 border border-slate-800">
                          <div className="text-sm font-bold text-white">{s.grade}</div>
                          <div className="text-[9px] text-slate-500 uppercase font-bold">Grade</div>
                        </div>
                      </div>

                      {/* Confidence bar */}
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span className="font-bold uppercase">Prediction Confidence</span>
                          <span>{s.confidence ?? Math.min(30 + s.samples * 10, 90)}% · {s.samples} data points</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${s.confidence ?? Math.min(30 + s.samples * 10, 90)}%`,
                              background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                            }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* How it works */}
          <div className="glass rounded-2xl p-4 sm:p-6 mt-6 border border-slate-700/50 fade-in-3">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Icon name="award" className="text-sm text-red-400" /> How predictions are calculated from exam results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                <div className="font-bold text-slate-300 mb-1">1. Collect Model Exam Marks</div>
                Every published score from Unit Tests, Quarterly, Half-Yearly, and Model Exams (from <Link href="/student/high-school/model-exams" className="text-indigo-400 underline">Model Exams</Link>) is gathered in date order per subject.
              </div>
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                <div className="font-bold text-slate-300 mb-1">2. Trend & Volatility Analysis</div>
                Linear regression tracks your progression trajectory across model exams to measure score improvements or risk areas.
              </div>
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                <div className="font-bold text-slate-300 mb-1">3. Forecast SSLC Board Marks</div>
                Projects expected final board exam marks per subject out of 100, and overall out of 500, continuously updating with new exam entries.
              </div>
            </div>
          </div>
        </>
      )}
    </PortalLayout>
  );
}
