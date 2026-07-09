"use client";
import { useEffect, useState, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useParentChildren, getApiBase, Child } from "@/lib/useParentChildren";

interface HomeworkItem {
  id: string;
  title: string;
  className: string;
  dueDate: string;
  status: string;
  description: string;
  submissionStatus: "submitted" | "pending";
  score: string;
  submittedDate: string;
  feedback?: string | null;
}

interface HomeworkStats {
  submitted: number;
  pending: number;
  total: number;
  rate: number;
}

function ChildSwitcher({ childList, active, onChange }: { childList: Child[]; active: Child | null; onChange: (c: Child) => void }) {
  if (childList.length <= 1) return null;
  return (
    <div className="flex items-center gap-3 mb-5 p-3 glass rounded-2xl flex-wrap">
      <span className="text-xs text-slate-400 font-semibold">👶 Viewing:</span>
      {childList.map(c => (
        <button key={c.studentId} onClick={() => onChange(c)}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            active?.studentId === c.studentId ? "bg-emerald-600 text-white shadow-md" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}>
          {c.name.split(" ")[0]} · Class {c.class}{c.section}
        </button>
      ))}
    </div>
  );
}

export default function HomeworkPage() {
  const { parentId, children, activeChild, setActiveChild, childrenLoading } = useParentChildren();

  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [stats, setStats]       = useState<HomeworkStats | null>(null);
  const [filter, setFilter]     = useState<"all" | "submitted" | "pending">("all");
  const [loading, setLoading]   = useState(false);

  const fetchHomework = useCallback(async (child: Child) => {
    if (!parentId) return;
    setLoading(true);
    try {
      const res  = await fetch(`${getApiBase()}/api/parent/${parentId}/child/${child.studentId}/homework`);
      const json = await res.json();
      if (json.success) {
        setHomework(json.data.homework);
        setStats(json.data.stats);
      }
    } catch {/* offline */}
    finally { setLoading(false); }
  }, [parentId]);

  useEffect(() => { if (activeChild) fetchHomework(activeChild); }, [activeChild, fetchHomework]);

  const filtered = homework.filter(h =>
    filter === "all" ? true : h.submissionStatus === filter
  );

  return (
    <PortalLayout>
      <ChildSwitcher childList={children} active={activeChild} onChange={setActiveChild} />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
        {[
          { label: "Total Assigned", value: stats?.total ?? "—",     icon: "📋", color: "text-slate-300" },
          { label: "Submitted",      value: stats?.submitted ?? "—", icon: "✅", color: "text-emerald-400" },
          { label: "Pending",        value: stats?.pending ?? "—",   icon: "⏳", color: "text-amber-400" },
          { label: "Submission Rate",value: stats ? `${stats.rate}%` : "—", icon: "📈", color: "text-blue-400" },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{k.icon}</span>
            </div>
            {loading || childrenLoading
              ? <div className="h-8 w-16 bg-slate-700 rounded animate-pulse mb-1" />
              : <div className={`text-3xl font-bold ${k.color} mb-1`}>{k.value}</div>
            }
            <div className="text-xs text-slate-500">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Submission Rate Bar */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 fade-in-2">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white">Overall Submission Rate</span>
              <span className={`text-sm font-bold ${stats.rate >= 80 ? "text-emerald-400" : stats.rate >= 60 ? "text-amber-400" : "text-red-400"}`}>
                {stats.rate}%
              </span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${stats.rate}%`,
                  background: stats.rate >= 80 ? "linear-gradient(90deg,#10b981,#059669)" : stats.rate >= 60 ? "linear-gradient(90deg,#f59e0b,#d97706)" : "linear-gradient(90deg,#ef4444,#dc2626)",
                }}
              />
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            {(() => {
              const gradedList = homework.filter(h => h.submissionStatus === "submitted" && h.score !== "—");
              let sum = 0;
              let count = 0;
              gradedList.forEach(h => {
                const match = h.score.match(/(\d+)\s*\/\s*(\d+)/);
                if (match) {
                  const obtained = parseFloat(match[1]);
                  const total = parseFloat(match[2]);
                  if (total > 0) {
                    sum += (obtained / total) * 100;
                    count++;
                  }
                }
              });
              const averageGradePercent = count > 0 ? Math.round(sum / count) : null;
              const val = averageGradePercent !== null ? `${averageGradePercent}%` : "—";
              return (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">Average Performance Grade</span>
                    <span className={`text-sm font-bold ${averageGradePercent && averageGradePercent >= 80 ? "text-teal-400" : averageGradePercent && averageGradePercent >= 60 ? "text-amber-400" : "text-red-400"}`}>
                      {val}
                    </span>
                  </div>
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: averageGradePercent ? `${averageGradePercent}%` : "0%",
                        background: averageGradePercent && averageGradePercent >= 80 ? "linear-gradient(90deg,#2dd4bf,#0d9488)" : averageGradePercent && averageGradePercent >= 60 ? "linear-gradient(90deg,#f59e0b,#d97706)" : "linear-gradient(90deg,#ef4444,#dc2626)",
                      }}
                    />
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Filter Tabs + Homework List */}
      <div className="glass rounded-2xl p-6 fade-in-3">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">📝 Homework Assignments</h2>
          <div className="flex gap-2">
            {(["all","submitted","pending"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                  filter === f ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-slate-800 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            {filter === "all" ? "No homework assigned yet." : `No ${filter} homework found.`}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(h => (
              <div key={h.id} className={`p-4 rounded-xl border transition-all ${
                h.submissionStatus === "submitted"
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : h.status === "active"
                  ? "border-amber-500/20 bg-amber-500/5"
                  : "border-slate-700/50 bg-slate-900/40"
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white">{h.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                        h.submissionStatus === "submitted"
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                      }`}>
                        {h.submissionStatus === "submitted" ? "✓ Submitted" : "⏳ Pending"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2 line-clamp-2">{h.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>📅 Due: {h.dueDate}</span>
                      <span>🏫 {h.className}</span>
                      {h.submissionStatus === "submitted" && h.score !== "—" && (
                        <span className="text-emerald-400 font-semibold">⭐ Score: {h.score}</span>
                      )}
                      {h.submissionStatus === "submitted" && h.submittedDate !== "—" && (
                        <span>📤 Submitted: {h.submittedDate}</span>
                      )}
                    </div>
                    {h.feedback && (
                      <div className="mt-3 p-3 rounded-lg bg-teal-500/5 border border-teal-500/10 text-xs italic text-teal-300 whitespace-pre-wrap">
                        🍎 Teacher Remarks: "{h.feedback}"
                      </div>
                    )}
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                    h.submissionStatus === "submitted" ? "bg-emerald-500/20" : "bg-amber-500/20"
                  }`}>
                    {h.submissionStatus === "submitted" ? "✅" : "📝"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
