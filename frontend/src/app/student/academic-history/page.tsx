"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface HistoryRow {
  id: string;
  academicYear: string;
  class: string;
  section: string;
  group: string | null;
  rollNumber: string | null;
  result: string | null;
  attendancePct: number | null;
  averageMarksPct: number | null;
  marksSummary: { subject: string; exams: number; scored: number; maxMarks: number; pct: number | null }[] | null;
}

const RESULT_BADGES: Record<string, { label: string; cls: string }> = {
  PROMOTED: { label: "✅ Promoted", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  GRADUATED: { label: "🎓 Graduated", cls: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300" },
  DETAINED: { label: "🔁 Detained", cls: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  TRANSFERRED: { label: "↗ Transferred", cls: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
};

export default function AcademicHistoryPage() {
  const { data: session } = useSession();
  const studentId = (session?.user as any)?.studentId;
  const currentClass = (session?.user as any)?.class;

  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;
    fetch(`${API}/api/promotions/history/student/${studentId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setRows(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentId]);

  return (
    <PortalLayout title="My Academic Journey 🗂️" subtitle="Your class history, year by year" accentColor="#7c3aed">
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 text-white p-6 md:p-8 shadow-xl">
          <div className="absolute right-0 top-0 opacity-10 translate-x-6 -translate-y-4 pointer-events-none">
            <span className="text-[12rem] leading-none">🗂️</span>
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Academic History</h2>
            <p className="text-white/80 text-xs md:text-sm font-medium max-w-lg">
              Every completed academic year is archived here when your school promotes your class — including your attendance, marks and result.
            </p>
            {currentClass && (
              <span className="inline-block mt-4 bg-white/15 border border-white/25 rounded-full px-3 py-1.5 text-[11px] font-bold">
                Currently in Class {currentClass}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-4xl mb-3">🌱</div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No archived years yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Your history will appear here after your school completes its first year-end promotion.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => {
              const badge = row.result ? RESULT_BADGES[row.result] : null;
              const isOpen = expanded === row.id;
              return (
                <div key={row.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpanded(isOpen ? null : row.id)}
                    className="w-full flex flex-wrap items-center justify-between gap-3 p-5 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-xl font-black text-violet-700 dark:text-violet-300">
                        {row.class}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-white">
                          Class {row.class} · Section {row.section}
                          {row.group ? <span className="text-violet-500"> · Group {row.group}</span> : null}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Academic Year {row.academicYear}{row.rollNumber ? ` · Roll No ${row.rollNumber}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-semibold">Attendance</div>
                        <div className="text-sm font-black text-slate-700 dark:text-slate-200">
                          {row.attendancePct != null ? `${row.attendancePct}%` : "—"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-semibold">Avg Marks</div>
                        <div className="text-sm font-black text-slate-700 dark:text-slate-200">
                          {row.averageMarksPct != null ? `${row.averageMarksPct}%` : "—"}
                        </div>
                      </div>
                      {badge && (
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${badge.cls}`}>{badge.label}</span>
                      )}
                      <span className="text-slate-400 text-xs">{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </button>

                  {isOpen && Array.isArray(row.marksSummary) && row.marksSummary.length > 0 && (
                    <div className="border-t border-slate-100 dark:border-slate-800 p-5">
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Subject-wise performance</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {row.marksSummary.map((m) => (
                          <div key={m.subject} className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{m.subject}</span>
                              <span className="text-xs font-black text-violet-600 dark:text-violet-400">
                                {m.pct != null ? `${m.pct}%` : "—"}
                              </span>
                            </div>
                            <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${m.pct != null && m.pct < 35 ? "bg-rose-500" : "bg-violet-500"}`}
                                style={{ width: `${Math.min(m.pct || 0, 100)}%` }}
                              />
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {m.scored}/{m.maxMarks} across {m.exams} exam{m.exams === 1 ? "" : "s"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {isOpen && (!row.marksSummary || row.marksSummary.length === 0) && (
                    <div className="border-t border-slate-100 dark:border-slate-800 p-5 text-xs text-slate-400">
                      No subject-wise marks were recorded for this year.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}

