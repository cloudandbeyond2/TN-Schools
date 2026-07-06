"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import PersonalKpiStrip from "@/components/kpi/PersonalKpiStrip";
import Link from "next/link";

const API = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) url = `https://${url}`;
  return url;
};

interface Child {
  linkId: string;
  isPrimary: boolean;
  studentId: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string | null;
  gender: string | null;
  schoolId: string;
}

interface KPI {
  value: string;
  raw: number;
  sub: string;
}

interface Summary {
  studentId: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string | null;
  kpis: {
    attendance: KPI;
    grade: KPI;
    homework: KPI;
    rank: KPI;
  };
}

interface SubjectMark {
  subject: string;
  [examType: string]: string | number;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const KPI_META = [
  { key: "attendance", icon: "📅", color: "text-emerald-400", label: "Attendance" },
  { key: "grade",      icon: "⭐", color: "text-amber-400",   label: "Overall Grade" },
  { key: "homework",   icon: "📝", color: "text-blue-400",    label: "Homework Rate" },
  { key: "rank",       icon: "🏆", color: "text-purple-400",  label: "Rank in Class" },
];

const SUBJECT_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#14b8a6", "#f97316"];

export default function ParentDashboard() {
  const { data: session } = useSession();
  const parentId = (session?.user as any)?.id;
  const schoolId = (session?.user as any)?.schoolId;

  const [children, setChildren]       = useState<Child[]>([]);
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [summary, setSummary]         = useState<Summary | null>(null);
  const [subjects, setSubjects]       = useState<SubjectMark[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]         = useState(true);
  const [perfLoading, setPerfLoading] = useState(false);

  // ── Load children list ──────────────────────────────────────────
  const fetchChildren = useCallback(async () => {
    if (!parentId) return;
    try {
      const res = await fetch(`${API()}/api/parent/${parentId}/children`);
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setChildren(json.data);
        setActiveChild(json.data[0]);
      }
    } catch {
      // offline fallback — keep empty
    }
  }, [parentId]);

  // ── Load notifications ──────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!parentId) return;
    try {
      const res = await fetch(`${API()}/api/parent/${parentId}/notifications?unreadOnly=false`);
      const json = await res.json();
      if (json.success) setNotifications(json.data.slice(0, 5));
    } catch {/* offline */}
  }, [parentId]);

  // ── Load summary + performance for active child ─────────────────
  const fetchChildData = useCallback(async (child: Child) => {
    setLoading(true);
    setPerfLoading(true);
    try {
      const [sumRes, perfRes] = await Promise.all([
        fetch(`${API()}/api/parent/${parentId}/child/${child.studentId}/summary`),
        fetch(`${API()}/api/parent/${parentId}/child/${child.studentId}/performance`),
      ]);
      const sumJson  = await sumRes.json();
      const perfJson = await perfRes.json();
      if (sumJson.success)  setSummary(sumJson.data);
      if (perfJson.success) setSubjects(perfJson.data.subjects.slice(0, 6));
    } catch {/* offline */}
    finally { setLoading(false); setPerfLoading(false); }
  }, [parentId]);

  useEffect(() => {
    fetchChildren();
    fetchNotifications();
  }, [fetchChildren, fetchNotifications]);

  useEffect(() => {
    if (activeChild) fetchChildData(activeChild);
  }, [activeChild, fetchChildData]);

  const kpiValues = summary?.kpis;

  const notifTypeStyle = (type: string) => {
    switch (type) {
      case "attendance": return "border-amber-500/30 bg-amber-500/5";
      case "marks":      return "border-emerald-500/30 bg-emerald-500/5";
      case "scholarship": return "border-purple-500/30 bg-purple-500/5";
      default:           return "border-blue-500/30 bg-blue-500/5";
    }
  };
  const notifIcon = (type: string) => {
    switch (type) {
      case "attendance": return "📅";
      case "marks":      return "📊";
      case "homework":   return "📝";
      case "pta":        return "🤝";
      case "scholarship": return "🎓";
      default:           return "📢";
    }
  };

  const examTypes = subjects.length > 0
    ? Object.keys(subjects[0]).filter(k => k !== "subject")
    : [];

  return (
    <PortalLayout>
      {/* ── Child Switcher ────────────────────────────────── */}
      {children.length > 1 && (
        <div className="flex items-center gap-3 mb-5 p-3 glass rounded-2xl fade-in flex-wrap">
          <span className="text-xs text-slate-400 font-semibold mr-1">👶 Viewing:</span>
          {children.map((child) => (
            <button
              key={child.studentId}
              onClick={() => setActiveChild(child)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeChild?.studentId === child.studentId
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {child.name.split(" ")[0]} · Class {child.class}{child.section}
            </button>
          ))}
        </div>
      )}

      {/* ── Academic-year KPIs for the selected child ────── */}
      {activeChild && (
        <PersonalKpiStrip
          studentId={activeChild.studentId}
          title={`${activeChild.name.split(" ")[0]}'s Academic KPIs`}
          variant="dark"
        />
      )}

      {/* ── No children linked state ─────────────────────── */}
      {!loading && children.length === 0 && (
        <div className="glass rounded-2xl p-10 text-center fade-in mb-6">
          <div className="text-5xl mb-4">👨‍👩‍👧</div>
          <h2 className="text-white font-bold text-lg mb-2">No Children Linked Yet</h2>
          <p className="text-slate-400 text-sm">
            Your account hasn&apos;t been linked to any student records. Please contact the Headmaster
            to link your ward&apos;s student ID to your parent account.
          </p>
        </div>
      )}

      {/* ── KPI Row ──────────────────────────────────────── */}
      {(children.length > 0 || loading) && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
            {KPI_META.map((meta) => {
              const kpi = kpiValues ? (kpiValues as any)[meta.key] : null;
              return (
                <div key={meta.key} className="kpi-card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{meta.icon}</span>
                    {loading ? (
                      <div className="h-3 w-16 bg-slate-700 rounded animate-pulse" />
                    ) : (
                      <span className={`text-xs font-medium ${meta.color}`}>{kpi?.sub ?? ""}</span>
                    )}
                  </div>
                  {loading ? (
                    <div className="h-8 w-20 bg-slate-700 rounded animate-pulse mb-1" />
                  ) : (
                    <div className={`text-3xl font-bold ${meta.color} mb-1`}>{kpi?.value ?? "—"}</div>
                  )}
                  <div className="text-xs text-slate-500">{meta.label}</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* ── Subject Marks Table ───── */}
            <div className="lg:col-span-2 glass rounded-2xl p-6 fade-in-2">
              <h2 className="text-base font-semibold text-white mb-5">📊 Subject-wise Marks</h2>
              {perfLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-10 bg-slate-800/60 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : subjects.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      {examTypes.map(et => <th key={et}>{et}</th>)}
                      <th>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((m, idx) => {
                      const vals = examTypes.map(et => Number(m[et]) || 0);
                      const last = vals[vals.length - 1];
                      const prev = vals[vals.length - 2];
                      return (
                        <tr key={m.subject}>
                          <td className="font-medium text-white" style={{ borderLeft: `3px solid ${SUBJECT_COLORS[idx % SUBJECT_COLORS.length]}` }}>
                            <span className="pl-2">{m.subject}</span>
                          </td>
                          {examTypes.map(et => <td key={et}>{m[et] ?? "—"}</td>)}
                          <td>
                            <span className={`badge ${last >= prev ? "badge-green" : "badge-red"}`}>
                              {last >= prev ? "↑ Up" : "↓ Down"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-10 text-slate-500 text-sm">
                  No marks recorded yet for {activeChild?.name}.
                </div>
              )}
              <div className="mt-4">
                <Link href="/parent/performance" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                  View Full Performance Report →
                </Link>
              </div>
            </div>

            {/* ── Notifications ─────────── */}
            <div className="glass rounded-2xl p-6 fade-in-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">🔔 Notifications</h2>
                <Link href="/parent/notifications" className="text-xs text-slate-400 hover:text-slate-300">View all</Link>
              </div>
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">No notifications yet.</div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border text-sm ${notifTypeStyle(n.type)} ${!n.isRead ? "ring-1 ring-white/10" : ""}`}
                    >
                      <div className="flex gap-2">
                        <span>{notifIcon(n.type)}</span>
                        <div>
                          <p className="text-slate-200 leading-snug text-xs font-semibold">{n.title}</p>
                          <p className="text-slate-400 text-xs mt-0.5 leading-snug">{n.message}</p>
                          <p className="text-slate-600 text-xs mt-1">
                            {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Quick Links ──────────────────────────────── */}
          <div className="glass rounded-2xl p-6 fade-in-4">
            <h2 className="text-base font-semibold text-white mb-4">🚀 Quick Access</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Attendance", href: "/parent/attendance", icon: "📅", color: "from-emerald-600 to-teal-600" },
                { label: "Homework",   href: "/parent/homework",   icon: "📝", color: "from-blue-600 to-cyan-600" },
                { label: "Scholarship",href: "/parent/scholarship",icon: "🎓", color: "from-purple-600 to-violet-600" },
                { label: "PTA Meetings",href: "/parent/pta",      icon: "🤝", color: "from-amber-600 to-orange-600" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br ${item.color} bg-opacity-10 border border-white/10 hover:scale-105 transition-transform`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm font-semibold text-white">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ── AI Parent Assistant ───────────────────────── */}
          <div className="glass rounded-2xl p-6 fade-in-4 mt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-2xl flex-shrink-0">
                🤖
              </div>
              <div className="flex-1">
                <h2 className="text-base font-semibold text-white mb-1">AI Parent Assistant</h2>
                <p className="text-xs text-slate-500 mb-4">
                  Get personalised insights about your child&apos;s learning journey
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      icon: "📚", label: "Learning Recommendations",
                      desc: summary
                        ? `${summary.name.split(" ")[0]} may benefit from extra practice based on recent marks.`
                        : "Loading insights…",
                    },
                    {
                      icon: "📅", label: "Attendance Alert",
                      desc: summary
                        ? summary.kpis.attendance.raw < 85
                          ? `⚠️ ${summary.name.split(" ")[0]}'s attendance is ${summary.kpis.attendance.value} — below 85% threshold.`
                          : `✅ ${summary.name.split(" ")[0]}'s attendance is ${summary.kpis.attendance.value} — looking good!`
                        : "Loading…",
                    },
                    {
                      icon: "🏆", label: "Performance Insight",
                      desc: summary
                        ? `Class Rank: ${summary.kpis.rank.value} | Average: ${summary.kpis.grade.raw}%`
                        : "Loading…",
                    },
                  ].map((card) => (
                    <div key={card.label} className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
                      <div className="text-xl mb-2">{card.icon}</div>
                      <div className="text-xs font-semibold text-emerald-400 mb-1">{card.label}</div>
                      <p className="text-xs text-slate-400">{card.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link href="/parent/ai-assistant" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                    Open AI Assistant Chat →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </PortalLayout>
  );
}
