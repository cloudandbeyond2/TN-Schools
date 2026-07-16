"use client";

import { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import { TrendingUp, TrendingDown, Minus, Brain, Award, AlertTriangle, RefreshCw, Info, Sparkles } from "lucide-react";

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

const FALLBACK_PREDICTION = {
  overall: {
    predictedTotal: 428,
    maxTotal: 500,
    overallPercent: 85.6,
    grade: "A2",
    passLikely: true,
    subjectsWithData: 5
  },
  subjects: [
    {
      subject: "Mathematics",
      samples: 5,
      averagePercent: 78.5,
      predictedPercent: 86.0,
      predictedMarks: 86,
      trend: 3.2,
      confidence: 85,
      grade: "A2",
      risk: "Low",
      history: [{ percent: 65 }, { percent: 72 }, { percent: 79 }, { percent: 84 }, { percent: 91 }]
    },
    {
      subject: "Science",
      samples: 4,
      averagePercent: 82.0,
      predictedPercent: 89.0,
      predictedMarks: 89,
      trend: 1.5,
      confidence: 78,
      grade: "A2",
      risk: "Low",
      history: [{ percent: 78 }, { percent: 81 }, { percent: 84 }, { percent: 85 }]
    },
    {
      subject: "Social Science",
      samples: 3,
      averagePercent: 62.0,
      predictedPercent: 58.0,
      predictedMarks: 58,
      trend: -2.1,
      confidence: 65,
      grade: "C",
      risk: "Medium",
      history: [{ percent: 70 }, { percent: 64 }, { percent: 52 }]
    },
    {
      subject: "English",
      samples: 4,
      averagePercent: 88.0,
      predictedPercent: 92.0,
      predictedMarks: 92,
      trend: 1.0,
      confidence: 82,
      grade: "A1",
      risk: "Low",
      history: [{ percent: 85 }, { percent: 87 }, { percent: 89 }, { percent: 91 }]
    },
    {
      subject: "Tamil",
      samples: 4,
      averagePercent: 72.0,
      predictedPercent: 78.0,
      predictedMarks: 78,
      trend: 2.0,
      confidence: 75,
      grade: "B1",
      risk: "Low",
      history: [{ percent: 65 }, { percent: 70 }, { percent: 75 }, { percent: 78 }]
    }
  ]
};

export default function PredictionsPage() {
  const { data: session } = useSession();
  const [student, setStudent] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

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
    setUsingFallback(false);
    fetch(`${API_BASE}/api/sslc-prep/predictions/${s.id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const subjectsWithData = json.data.subjects?.filter((x: any) => x.samples > 0) || [];
          if (subjectsWithData.length === 0) {
            setPrediction(FALLBACK_PREDICTION);
            setUsingFallback(true);
          } else {
            setPrediction(json.data);
          }
        } else {
          setError(json.error || "Prediction unavailable.");
        }
        setLoading(false);
      })
      .catch(() => {
        setPrediction(FALLBACK_PREDICTION);
        setUsingFallback(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (student) loadPrediction(student);
  }, [student]);

  const overall = prediction?.overall;
  const subjects = prediction?.subjects || [];
  const subjectsWithData = subjects.filter((s: any) => s.samples > 0);

  return (
    <PortalLayout
      title="Performance Predictions"
      subtitle="AI-projected board scores from your exams, model tests and mock attempts."
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
            onClick={() => loadPrediction(student)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      ) : (
        <>
          {usingFallback && (
            <div className="mb-6 text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              Showing sample prediction data. Take a mock test or log practice paper marks to see your actual personalized predictions.
            </div>
          )}
          
          {/* Overall banner */}
          <div className="glass rounded-2xl p-6 mb-6 border-l-4 border-red-500 bg-red-900/10 fade-in flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
                <Brain className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Predicted Board Performance</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-lg">
                  Built from {subjectsWithData.reduce((s: number, x: any) => s + x.samples, 0)} recorded scores across{" "}
                  {subjectsWithData.length} subjects using trend analysis. Predictions update every time new marks
                  or mock attempts are recorded.
                </p>
              </div>
            </div>
            <div className="flex gap-4 flex-wrap">
              <div className="bg-slate-900/80 rounded-xl p-4 text-center min-w-[110px] border border-red-500/30">
                <div className="text-3xl font-black text-red-400">
                  {overall?.predictedTotal ?? 0}
                  <span className="text-sm text-slate-500">/500</span>
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Predicted Total</div>
              </div>
              <div className="bg-slate-900/80 rounded-xl p-4 text-center min-w-[90px] border border-slate-700">
                <div className="text-3xl font-black text-white">{overall?.grade ?? "—"}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Grade Band</div>
              </div>
              <div className={`rounded-xl p-4 text-center min-w-[110px] border ${overall?.passLikely ? "bg-emerald-900/20 border-emerald-500/40" : "bg-amber-900/20 border-amber-500/40"}`}>
                <div className={`text-xl font-black ${overall?.passLikely ? "text-emerald-400" : "text-amber-400"}`}>
                  {subjectsWithData.length === 0 ? "No Data" : overall?.passLikely ? "On Track" : "At Risk"}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Pass Outlook</div>
              </div>
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 fade-in-2">
            {subjects.map((s: any) => {
              const color = SUBJECT_COLORS[s.subject] || "#ef4444";
              const TrendIcon = s.trend > 0.5 ? TrendingUp : s.trend < -0.5 ? TrendingDown : Minus;
              const trendColor = s.trend > 0.5 ? "text-emerald-400" : s.trend < -0.5 ? "text-red-400" : "text-slate-400";
              return (
                <div key={s.subject} className="glass rounded-2xl p-5 border border-slate-700/50 hover:border-red-500/40 transition-colors">
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
                          <div className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">Predicted Marks</div>
                        </div>
                        <Sparkline points={s.history} color={color} />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center mb-3">
                        <div className="bg-slate-900/60 rounded-lg py-2 border border-slate-800">
                          <div className="text-sm font-bold text-white">{s.averagePercent}%</div>
                          <div className="text-[9px] text-slate-500 uppercase font-bold">Average</div>
                        </div>
                        <div className="bg-slate-900/60 rounded-lg py-2 border border-slate-800">
                          <div className={`text-sm font-bold flex items-center justify-center gap-1 ${trendColor}`}>
                            <TrendIcon className="w-3.5 h-3.5" />
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
          <div className="glass rounded-2xl p-6 mt-6 border border-slate-700/50 fade-in-3">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-red-400" /> How predictions are calculated
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                <div className="font-bold text-slate-300 mb-1">1. Collect</div>
                Every exam mark, model exam result and mock test attempt is gathered per subject in date order.
              </div>
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                <div className="font-bold text-slate-300 mb-1">2. Analyse trend</div>
                A regression line is fitted through your score history to detect whether you are improving or slipping.
              </div>
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                <div className="font-bold text-slate-300 mb-1">3. Project forward</div>
                The line is projected to your next board exam. More data and steadier scores raise the confidence level.
              </div>
            </div>
          </div>
        </>
      )}
    </PortalLayout>
  );
}
