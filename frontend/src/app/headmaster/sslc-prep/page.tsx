"use client";

import { useState, useEffect, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import {
  Users, BookOpen, ClipboardList, TrendingUp, AlertTriangle, RefreshCw,
  Award, BarChart2, FileText, Eye, EyeOff, GraduationCap, Target,
} from "lucide-react";

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

export default function HeadmasterSSLCPrepPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const sessionUser = session?.user as any;
  const schoolId = sessionUser?.schoolId || "";
  const role = sessionUser?.role || "HEADMASTER";

  const [selectedGrade, setSelectedGrade] = useState<"" | "9" | "10">("");
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(() => {
    if (!schoolId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ schoolId });
    if (selectedGrade) params.set("class", selectedGrade);
    fetch(`${API_BASE}/api/sslc-prep/analytics/school?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setAnalytics(json.data);
        else setError(json.error || "Failed to load analytics.");
        setLoading(false);
      })
      .catch(() => {
        setError("Could not reach the server. Analytics will load once the backend is available.");
        setLoading(false);
      });
  }, [schoolId, selectedGrade, role]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const togglePublish = async (test: any) => {
    await fetch(`${API_BASE}/api/sslc-prep/mock-tests/${test.id}/publish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !test.published }),
    });
    loadAnalytics();
  };

  const totals = analytics?.totals;

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "SSLC வாரியத் தயாரிப்பு மேற்பார்வை" : "SSLC Board Prep Oversight"}
      subtitle={lang === "தமிழ்" ? "9 & 10 ஆம் வகுப்புகளுக்கான வாரியத் தயாரிப்பு பள்ளி அளவிலான தயார்நிலை." : "School-wide readiness for Classes 9 & 10 board preparation."}
    >
      {/* Grade filter + refresh */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-700">
          {([["", lang === "தமிழ்" ? "இரு வகுப்புகளும்" : "Both Classes"], ["9", lang === "தமிழ்" ? "வகுப்பு 9" : "Class 9"], ["10", lang === "தமிழ்" ? "வகுப்பு 10" : "Class 10"]] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setSelectedGrade(val)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedGrade === val ? "bg-blue-500 text-white shadow-lg" : "text-slate-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={loadAnalytics}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6 fade-in">
        {[
          { label: "Total Students", value: totals?.students ?? "—", icon: Users, color: "text-blue-400" },
          { label: "Class 9", value: totals?.class9 ?? "—", icon: GraduationCap, color: "text-cyan-400" },
          { label: "Class 10", value: totals?.class10 ?? "—", icon: GraduationCap, color: "text-indigo-400" },
          { label: "Syllabus Done", value: totals ? `${totals.avgSyllabusCompletion}%` : "—", icon: BookOpen, color: "text-emerald-400" },
          { label: "Mock Participation", value: totals ? `${totals.mockParticipationPercent}%` : "—", icon: ClipboardList, color: "text-amber-400" },
          { label: "Predicted Pass Rate", value: totals ? `${totals.predictedPassRate}%` : "—", icon: TrendingUp, color: "text-purple-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card border border-slate-700">
            <kpi.icon className={`h-5 w-5 ${kpi.color} mb-2`} />
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-[11px] text-slate-400 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Subject readiness */}
            <div className="glass rounded-2xl p-6 border border-slate-700/50 fade-in-2">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-400" /> Subject Readiness (Mock Test Averages)
              </h3>
              <div className="space-y-4">
                {(analytics?.subjectAverages || []).map((s: any) => {
                  const color = SUBJECT_COLORS[s.subject] || "#3b82f6";
                  return (
                    <div key={s.subject}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300 font-semibold">{s.subject}</span>
                        <span className="text-slate-500">
                          {s.averagePercent === null ? "No attempts" : `${s.averagePercent}% · ${s.attempts} attempts`}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${s.averagePercent || 0}%`, backgroundColor: color }}
                        />
                      </div>
                      {s.averagePercent !== null && s.averagePercent < 45 && (
                        <p className="text-[11px] text-red-400 mt-1">Below expectation — consider remedial classes.</p>
                      )}
                    </div>
                  );
                })}
                {(analytics?.subjectAverages || []).length === 0 && (
                  <p className="text-xs text-slate-500 py-4 text-center">No mock test data recorded yet.</p>
                )}
              </div>
            </div>

            {/* At-risk students */}
            <div className="glass rounded-2xl p-6 border border-red-500/30 bg-red-900/10 fade-in-2">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" /> Students Needing Intervention
              </h3>
              {(analytics?.atRisk || []).length === 0 ? (
                <div className="text-xs text-slate-400 py-8 text-center">
                  No students flagged at risk based on current predictions.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {analytics.atRisk.map((s: any) => (
                    <div key={s.studentId} className="flex items-center justify-between bg-slate-900/60 rounded-xl px-4 py-2.5 border border-slate-800">
                      <div>
                        <div className="text-sm font-bold text-slate-200">{s.name}</div>
                        <div className="text-[10px] text-slate-500">
                          Roll {s.rollNumber} · Class {s.class}{s.section} · Weakest: {s.weakestSubject || "—"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-red-400">{s.overallPercent}%</div>
                        <div className="text-[10px] text-slate-500">Predicted {s.predictedTotal}/500</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Top performers */}
            <div className="glass rounded-2xl p-6 border border-emerald-500/30 bg-emerald-900/10 fade-in-3">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" /> Top Predicted Performers
              </h3>
              <div className="space-y-2.5">
                {(analytics?.students || []).filter((s: any) => s.subjectsWithData > 0).slice(0, 5).map((s: any, i: number) => (
                  <div key={s.studentId} className="flex items-center gap-3 bg-slate-900/60 rounded-xl px-4 py-2.5 border border-slate-800">
                    <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black">
                      #{i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-200">{s.name}</div>
                      <div className="text-[10px] text-slate-500">Class {s.class}{s.section}</div>
                    </div>
                    <div className="text-sm font-black text-emerald-400">{s.predictedTotal}/500</div>
                  </div>
                ))}
                {(analytics?.students || []).filter((s: any) => s.subjectsWithData > 0).length === 0 && (
                  <p className="text-xs text-slate-500 py-4 text-center">Predictions appear once marks are recorded.</p>
                )}
              </div>
            </div>

            {/* Recent mock tests with publish control */}
            <div className="lg:col-span-2 glass rounded-2xl p-6 border border-slate-700/50 fade-in-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" /> Mock Tests in Circulation
                </h3>
                <Link href="/headmaster/mock-tests" className="text-xs font-bold text-blue-400 hover:text-blue-300">
                  Create Tests →
                </Link>
              </div>
              {(analytics?.recentTests || []).length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No SSLC mock tests created yet.</p>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {analytics.recentTests.map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between bg-slate-900/60 rounded-xl px-4 py-3 border border-slate-800">
                      <div>
                        <div className="text-sm font-bold text-slate-200">{t.title}</div>
                        <div className="text-[10px] text-slate-500">
                          {t.subject} · Class {t.class} · {t.questionCount} Qs
                          {t.createdByName ? ` · by ${t.createdByName}` : ""}
                        </div>
                      </div>
                      <button
                        onClick={() => togglePublish(t)}
                        className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full border transition-colors ${
                          t.published
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                            : "bg-slate-700/60 text-slate-400 border-slate-600 hover:text-white"
                        }`}
                        title={t.published ? "Click to unpublish" : "Click to approve & publish"}
                      >
                        {t.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {t.published ? "LIVE" : "DRAFT — APPROVE"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Full roster predictions */}
          <div className="glass rounded-2xl p-6 border border-slate-700/50 fade-in-4">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" /> Board Performance Predictions — Full Roster
            </h3>
            {(analytics?.students || []).length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No students found for the selected classes.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-500 uppercase text-[10px] border-b border-slate-700/60">
                      <th className="py-2.5 pr-4">Student</th>
                      <th className="py-2.5 pr-4">Roll No</th>
                      <th className="py-2.5 pr-4">Class</th>
                      <th className="py-2.5 pr-4">Predicted Total</th>
                      <th className="py-2.5 pr-4">Grade</th>
                      <th className="py-2.5 pr-4">Weakest Subject</th>
                      <th className="py-2.5">Outlook</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.students.map((s: any) => (
                      <tr key={s.studentId} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                        <td className="py-2.5 pr-4 font-semibold text-slate-200">{s.name}</td>
                        <td className="py-2.5 pr-4 text-slate-400">{s.rollNumber}</td>
                        <td className="py-2.5 pr-4 text-slate-400">{s.class}{s.section}</td>
                        <td className="py-2.5 pr-4 font-bold text-blue-400">
                          {s.subjectsWithData > 0 ? `${s.predictedTotal}/500` : "—"}
                        </td>
                        <td className="py-2.5 pr-4 text-slate-300">{s.subjectsWithData > 0 ? s.grade : "—"}</td>
                        <td className="py-2.5 pr-4 text-slate-400">{s.weakestSubject || "—"}</td>
                        <td className="py-2.5">
                          {s.subjectsWithData === 0 ? (
                            <span className="text-slate-500">No data</span>
                          ) : s.passLikely ? (
                            <span className="text-emerald-400 font-bold">On Track</span>
                          ) : (
                            <span className="text-red-400 font-bold">At Risk</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </PortalLayout>
  );
}
