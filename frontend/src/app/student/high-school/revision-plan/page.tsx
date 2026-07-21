"use client";

import { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";

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

const PRIORITY_STYLES: Record<string, string> = {
  High: "bg-red-500/20 text-red-300 border-red-500/40",
  Medium: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  Low: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
};

export default function RevisionPlanPage() {
  const { data: session } = useSession();
  const [student, setStudent] = useState<any>(null);
  const [selectedGrade, setSelectedGrade] = useState<"9" | "10">("10");
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dailyMinutes, setDailyMinutes] = useState(90);
  const [error, setError] = useState<string | null>(null);

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
          if (matched && String(matched.class) === "9") setSelectedGrade("9");
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setError("Could not reach the server to load your profile. Please try again later.");
        setLoading(false);
      });
  }, [session]);

  useEffect(() => {
    if (!student) return;
    setLoading(true);
    fetch(`${API_BASE}/api/sslc-prep/revision-plan/${student.id}?class=${selectedGrade}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setPlan(json.data);
          if (json.data?.dailyMinutes) setDailyMinutes(json.data.dailyMinutes);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Could not reach the server. Please try again later.");
        setLoading(false);
      });
  }, [student, selectedGrade]);

  const generatePlan = () => {
    if (!student) return;
    setGenerating(true);
    setError(null);
    fetch(`${API_BASE}/api/sslc-prep/revision-plan/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id, class: selectedGrade, dailyMinutes }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setPlan(json.data);
        else setError(json.error || "Failed to generate the plan.");
        setGenerating(false);
      })
      .catch(() => {
        setError("Could not reach the AI service. Please try again later.");
        setGenerating(false);
      });
  };

  const toggleTask = (dayIndex: number, taskIndex: number) => {
    if (!student || !plan) return;
    const done = !plan.days[dayIndex].tasks[taskIndex].done;
    // Optimistic update
    setPlan((prev: any) => {
      const next = structuredClone(prev);
      next.days[dayIndex].tasks[taskIndex].done = done;
      return next;
    });
    fetch(`${API_BASE}/api/sslc-prep/revision-plan/${student.id}/task`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ class: selectedGrade, dayIndex, taskIndex, done }),
    }).catch(() => {});
  };

  const allTasks = plan?.days?.flatMap((d: any) => d.tasks) || [];
  const doneCount = allTasks.filter((t: any) => t.done).length;
  const progressPct = allTasks.length ? Math.round((doneCount / allTasks.length) * 100) : 0;

  return (
    <PortalLayout
      title="AI Revision Plan"
      subtitle="A personalised 7-day plan generated from your marks, mock tests and syllabus gaps."
    >
      {/* Controls */}
      <div className="glass rounded-2xl p-4 sm:p-6 mb-6 border border-red-500/30 bg-gradient-to-br from-red-900/10 to-transparent fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center gap-5 justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
              <Icon name="robot" className="text-2xl text-red-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 flex-wrap">
                Smart Revision Engine <Icon name="stars" className="text-sm text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl break-words whitespace-normal">
                The engine analyses your exam marks, mock test accuracy and syllabus completion, then
                allocates more revision days to your weakest subjects. Regenerate any time — the plan
                adapts as your scores improve.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
            <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-700">
              <div className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-red-500 text-white">
                Class {selectedGrade}
              </div>
            </div>
            <select
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500/50"
            >
              <option value={60}>60 min / day</option>
              <option value={90}>90 min / day</option>
              <option value={120}>2 hrs / day</option>
              <option value={180}>3 hrs / day</option>
            </select>
            <button
              onClick={generatePlan}
              disabled={generating || !student}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-bold transition-colors shadow-[0_0_20px_rgba(239,68,68,0.35)] w-full sm:w-auto"
            >
              {generating ? (
                <><Icon name="refresh" className="text-sm animate-spin" /> Analysing your data…</>
              ) : plan ? (
                <><Icon name="refresh" className="text-sm" /> Regenerate Plan</>
              ) : (
                <><Icon name="stars" className="text-sm" /> Generate My Plan</>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
        </div>
      ) : !plan ? (
        <div className="glass rounded-2xl p-6 sm:p-12 border border-slate-700/50 text-center fade-in-2">
          <Icon name="robot" className="text-5xl text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-bold mb-2">No revision plan yet</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Click <strong className="text-red-400">Generate My Plan</strong> above and the AI will build a
            7-day schedule targeting your weakest subjects first.
          </p>
        </div>
      ) : (
        <>
          {/* Progress + focus areas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            <div className="glass rounded-2xl p-4 sm:p-6 border border-slate-700/50 fade-in-2 flex flex-col items-center justify-center text-center">
              <div className="relative w-28 h-28 mb-3">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="42" fill="none" stroke="#ef4444" strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${progressPct * 2.64} 264`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{progressPct}%</span>
                </div>
              </div>
              <div className="text-sm font-bold text-white">Plan Progress</div>
              <div className="text-xs text-slate-500 mt-1">{doneCount} of {allTasks.length} tasks completed</div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                <Icon name="clock" className="text-sm" /> {plan.dailyMinutes} min committed daily
              </div>
            </div>

            <div className="lg:col-span-2 glass rounded-2xl p-4 sm:p-6 border border-slate-700/50 fade-in-2">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2 flex-wrap">
                <Icon name="target" className="text-sm text-red-400" /> AI Focus Areas
              </h3>
              <div className="space-y-3">
                {(plan.focusAreas || []).map((f: any, i: number) => {
                  const color = SUBJECT_COLORS[f.subject] || "#ef4444";
                  return (
                    <div key={i} className="flex items-center justify-between bg-slate-900/60 rounded-xl border border-slate-800 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <div>
                          <div className="text-sm font-bold text-slate-200">{f.subject}</div>
                          <div className="text-[11px] text-slate-500">{f.reason}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${PRIORITY_STYLES[f.priority] || PRIORITY_STYLES.Medium}`}>
                        {f.priority} Priority
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 7-day timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 fade-in-3">
            {(plan.days || []).map((day: any, dIdx: number) => {
              const color = SUBJECT_COLORS[day.subject] || "#ef4444";
              const dayDone = day.tasks.filter((t: any) => t.done).length;
              const complete = dayDone === day.tasks.length && day.tasks.length > 0;
              return (
                <div
                  key={dIdx}
                  className={`glass rounded-2xl p-5 border transition-colors ${
                    complete ? "border-emerald-500/50 bg-emerald-900/10" : "border-slate-700/50 hover:border-red-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black"
                        style={{ backgroundColor: `${color}22`, color }}
                      >
                        D{day.day}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-white">{day.subject}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Day {day.day} of 7</div>
                      </div>
                    </div>
                    {complete ? (
                      <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                        <Icon name="flame" className="text-xs" /> DONE
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-bold">{dayDone}/{day.tasks.length}</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-300 font-semibold mb-3 bg-slate-900/60 rounded-lg px-3 py-2 border border-slate-800">
                    🎯 {day.focus}
                  </div>
                  <div className="space-y-2">
                    {day.tasks.map((task: any, tIdx: number) => (
                      <button
                        key={tIdx}
                        onClick={() => toggleTask(dIdx, tIdx)}
                        className="w-full flex items-start gap-2.5 text-left group"
                      >
                        {task.done ? (
                          <Icon name="check-circle" className="text-sm text-emerald-400 mt-0.5 shrink-0" />
                        ) : (
                          <Icon name="circle" className="text-sm text-slate-600 group-hover:text-red-400 mt-0.5 shrink-0 transition-colors" />
                        )}
                        <span className={`text-xs ${task.done ? "text-slate-500 line-through" : "text-slate-300 group-hover:text-white"}`}>
                          {task.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </PortalLayout>
  );
}
