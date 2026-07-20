"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
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
  community?: string | null;
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
  studentId?: string | null;
}

const KPI_META = [
  { key: "attendance", icon: "fi-rr-calendar", color: "text-emerald-600 dark:text-emerald-400", strokeColor: "#10b981", border: "border-emerald-500/20", bg: "bg-emerald-500/5", label: "Attendance" },
  { key: "grade",      icon: "fi-rr-star", color: "text-amber-600 dark:text-amber-400",     strokeColor: "#f59e0b", border: "border-amber-500/20",   bg: "bg-amber-500/5",   label: "Overall Grade" },
  { key: "homework",   icon: "fi-rr-document-signed", color: "text-blue-600 dark:text-blue-400",   strokeColor: "#3b82f6", border: "border-blue-500/20",   bg: "bg-blue-500/5",    label: "Homework Rate" },
  { key: "rank",       icon: "fi-rr-trophy", color: "text-purple-655 dark:text-purple-400", strokeColor: "#8b5cf6", border: "border-purple-500/20", bg: "bg-purple-500/5",  label: "Rank in Class" },
];

const SUBJECT_COLORS = ["#10b981", "#6366f1", "#f59e0b", "#3b82f6", "#ec4899", "#14b8a6", "#f97316"];

// Helper to format subject names cleanly without truncated double dots
const formatSubjName = (name: string): string => {
  const n = name.trim().toUpperCase();
  if (n === "MATHEMATICS") return "Maths";
  if (n === "SOCIAL SCIENCE") return "S.Sci";
  if (n === "SCIENCE") return "Science";
  if (n === "ENGLISH") return "English";
  if (n === "TAMIL") return "Tamil";
  return name.length > 7 ? `${name.substring(0, 6)}.` : name;
};

export default function ParentDashboard() {
  const { data: session } = useSession();
  const parentId = (session?.user as any)?.id;

  const [children, setChildren]       = useState<Child[]>([]);
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [summary, setSummary]         = useState<Summary | null>(null);
  const [subjects, setSubjects]       = useState<SubjectMark[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]         = useState(true);
  const [perfLoading, setPerfLoading] = useState(false);
  const [refreshing, setRefreshing]   = useState(false);

  // View toggle: Chart vs Table
  const [perfViewMode, setPerfViewMode] = useState<"CHART" | "TABLE">("CHART");

  // Filters & Pagination States
  const [selectedExam, setSelectedExam] = useState<string>("ALL");
  const [subPage, setSubPage] = useState(1);
  const [notifFilter, setNotifFilter] = useState<string>("ALL");
  const [notifPage, setNotifPage] = useState(1);

  const subItemsPerPage = 5;
  const notifItemsPerPage = 4;

  // ── Load children list ──────────────────────────────────────────
  const fetchChildren = useCallback(async () => {
    if (!parentId) return;
    try {
      const res = await fetch(`${API()}/api/parent/${parentId}/children`);
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setChildren(json.data);
        setActiveChild(json.data[0]);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, [parentId]);

  // ── Load notifications ──────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!parentId) return;
    try {
      const res = await fetch(`${API()}/api/parent/${parentId}/notifications?unreadOnly=false`);
      const json = await res.json();
      if (json.success) setNotifications(json.data);
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
      if (perfJson.success) setSubjects(perfJson.data.subjects);
    } catch {/* offline */}
    finally { setLoading(false); setPerfLoading(false); }
  }, [parentId]);

  useEffect(() => {
    fetchChildren();
    fetchNotifications();
  }, [fetchChildren, fetchNotifications]);

  // Dynamic child context filter reset to ensure correct synchronization
  useEffect(() => {
    if (activeChild) {
      fetchChildData(activeChild);
      setSubPage(1);
      setNotifPage(1);
      setNotifFilter("ALL");
      setSelectedExam("ALL"); // Resets exam state to recalculate available exam terms for the new child
    }
  }, [activeChild, fetchChildData]);

  // Sync data dynamically in background
  const handleRefresh = async () => {
    if (!parentId) return;
    setRefreshing(true);
    try {
      await fetchChildren();
      await fetchNotifications();
      if (activeChild) {
        await fetchChildData(activeChild);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const kpiValues = summary?.kpis;

  // Case-insensitive Uicons and styles for notifications
  const notifMeta = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes("ATTENDANCE")) {
      return { icon: "fi-rr-calendar", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    }
    if (t.includes("MARK") || t.includes("ACADEMIC")) {
      return { icon: "fi-rr-stats", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    }
    if (t.includes("HOMEWORK")) {
      return { icon: "fi-rr-document-signed", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" };
    }
    if (t.includes("PTA")) {
      return { icon: "fi-rr-users", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" };
    }
    if (t.includes("SCHOLARSHIP") || t.includes("WELFARE") || t.includes("BENEFIT")) {
      return { icon: "fi-rr-graduation-cap", color: "text-purple-655 dark:text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" };
    }
    return { icon: "fi-rr-megaphone", color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" };
  };

  // Case-insensitive mapping check helper for notifications filters
  const matchNotifType = useCallback((type: string, filter: string): boolean => {
    if (filter === "ALL") return true;
    const t = type.toUpperCase();
    const f = filter.toUpperCase();
    if (f === "MARKS" || f === "ACADEMICS") {
      return t.includes("MARK") || t.includes("ACADEMIC");
    }
    if (f === "WELFARE" || f === "SCHOLARSHIP") {
      return t.includes("SCHOLARSHIP") || t.includes("WELFARE") || t.includes("BENEFIT");
    }
    if (f === "HOMEWORK") {
      return t.includes("HOMEWORK");
    }
    if (f === "PTA") {
      return t.includes("PTA");
    }
    if (f === "ATTENDANCE") {
      return t.includes("ATTENDANCE");
    }
    return t === f;
  }, []);

  const examTypes = useMemo(() => {
    return subjects.length > 0
      ? Object.keys(subjects[0]).filter(k => k !== "subject")
      : [];
  }, [subjects]);

  // Chronologically sort exam terms (Quarterly -> Half Yearly -> Annual)
  const sortedExamTypes = useMemo(() => {
    const EXAM_CHRONO_ORDER: Record<string, number> = {
      "UNIT TEST 1": 1, "UNIT TEST I": 1,
      "UNIT TEST 2": 2, "UNIT TEST II": 2,
      "QUARTERLY": 3,
      "UNIT TEST 3": 4, "UNIT TEST III": 4,
      "HALF YEARLY": 5,
      "UNIT TEST 4": 6, "UNIT TEST IV": 6,
      "REVISION TEST": 7,
      "ANNUAL": 8, "BOARD EXAM": 9
    };
    const getExamWeight = (exam: string): number => {
      const e = exam.trim().toUpperCase();
      if (EXAM_CHRONO_ORDER[e] !== undefined) return EXAM_CHRONO_ORDER[e];
      if (e.includes("UNIT") || e.includes("TEST")) return 1;
      if (e.includes("QUARTERLY")) return 3;
      if (e.includes("HALF")) return 5;
      if (e.includes("ANNUAL") || e.includes("FINAL")) return 8;
      return 10;
    };
    return [...examTypes].sort((a, b) => getExamWeight(a) - getExamWeight(b));
  }, [examTypes]);

  // Set the default filter to the latest completed exam term once subjects list loads
  useEffect(() => {
    if (sortedExamTypes.length > 0 && selectedExam === "ALL") {
      // Set default single term to the last sorted term in the array (e.g. "Half Yearly" or "Quarterly")
      setSelectedExam(sortedExamTypes[sortedExamTypes.length - 1]);
    }
  }, [sortedExamTypes, selectedExam]);

  // Parse marks to percentage for visualization progress bars
  const parseMarkPct = useCallback((val: string | number | undefined | null): number => {
    if (val === undefined || val === null) return 0;
    if (typeof val === "number") return val;
    const str = String(val).trim();
    if (str.includes("/")) {
      const parts = str.split("/");
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (den > 0) return Math.min(100, Math.round((num / den) * 100));
    }
    const parsed = parseFloat(str);
    return isNaN(parsed) ? 0 : Math.min(100, parsed);
  }, []);

  // Filtered Notifications - dynamic sorting based on both category and active child context
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchesChild = !activeChild || !n.studentId || n.studentId === activeChild.studentId;
      const matchesType = notifFilter === "ALL" || matchNotifType(n.type, notifFilter);
      return matchesChild && matchesType;
    });
  }, [notifications, notifFilter, activeChild, matchNotifType]);

  // Paginated Notifications
  const paginatedNotifications = useMemo(() => {
    const start = (notifPage - 1) * notifItemsPerPage;
    return filteredNotifications.slice(start, start + notifItemsPerPage);
  }, [filteredNotifications, notifPage]);

  const totalNotifPages = Math.ceil(filteredNotifications.length / notifItemsPerPage);

  // Paginated Subjects
  const paginatedSubjects = useMemo(() => {
    const start = (subPage - 1) * subItemsPerPage;
    return subjects.slice(start, start + subItemsPerPage);
  }, [subjects, subPage]);

  const totalSubPages = Math.ceil(subjects.length / subItemsPerPage);

  // Helper to resolve progress ring geometry properties
  const getProgressCircleOffset = (pctRaw: number) => {
    const r = 24;
    const circumference = 2 * Math.PI * r;
    const pct = Math.min(100, Math.max(0, pctRaw));
    return circumference * (1 - pct / 100);
  };

  return (
    <PortalLayout>
      {/* ── Welcome Header with Live Refresh Button ────────────────── */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2.5">
            <i className="fi fi-rr-apps text-emerald-500"></i> Parent Dashboard
          </h1>
          <p className="text-slate-550 dark:text-slate-400 text-xs mt-0.5 font-normal">
            Summarized look at your child&apos;s attendance, academic metrics, and notifications.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-400 hover:text-emerald-500 disabled:opacity-50 transition-all flex items-center justify-center w-10 h-10 shrink-0 shadow-sm"
          title="Sync Live Data"
        >
          <i className={`fi fi-rr-refresh ${refreshing ? "animate-spin" : ""}`}></i>
        </button>
      </div>

      {/* ── Children Selector & Profile Info Card (Spacious paddings) ── */}
      {children.length > 0 && activeChild && (
        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 mb-6 shadow-md">
          {/* Sibling Toggle Strip if multiple children */}
          {children.length > 1 && (
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800/80 overflow-x-auto whitespace-nowrap scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <span className="text-[10px] text-slate-550 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                <i className="fi fi-rr-portrait text-slate-400"></i> Wards:
              </span>
              <div className="flex gap-2">
                {children.map((child) => (
                  <button
                    key={child.studentId}
                    onClick={() => { setActiveChild(child); }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 shrink-0 ${
                      activeChild.studentId === child.studentId
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/10 scale-105"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/30"
                    }`}
                  >
                    <i className="fi fi-rr-user"></i>
                    <span>{child.name.split(" ")[0]}</span>
                    <span className="opacity-60 text-[10px]">Class {child.class}-{child.section}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Child Active Profile Card Details */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Avatar circle */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-600/35 border border-emerald-500/20 flex items-center justify-center text-2xl font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                {activeChild.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-855 dark:text-white leading-tight">{activeChild.name}</h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2.5 gap-y-1.5 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span className="font-bold text-slate-750 dark:text-slate-300">Class {activeChild.class}-{activeChild.section}</span>
                  <span className="opacity-40">•</span>
                  <span>Roll Number: <span className="font-bold text-slate-750 dark:text-slate-300">{activeChild.rollNumber || "—"}</span></span>
                  {activeChild.community && (
                    <>
                      <span className="opacity-40">•</span>
                      <span>Caste/Community: <span className="font-bold text-slate-750 dark:text-slate-300">{activeChild.community}</span></span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-455 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 rounded-xl max-w-xs font-normal flex gap-2 leading-relaxed text-left shrink-0">
              <i className="fi fi-rr-info text-slate-500 mt-0.5 shrink-0"></i>
              <span>To update profile, community, or parent link details, please contact school administrators.</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Current Year Academic KPIs ────────────────────────────── */}
      {activeChild && (
        <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-205 dark:border-slate-800/80 rounded-2xl p-5 mb-6 shadow-md">
          <PersonalKpiStrip
            studentId={activeChild.studentId}
            title={`Academic Performance — ${activeChild.name.split(" ")[0]}`}
            variant="light"
          />
        </div>
      )}

      {/* ── No linked children error layout ──────────────── */}
      {!loading && children.length === 0 && (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-md mb-6">
          <i className="fi fi-rr-users-alt text-slate-400 text-6xl block mb-4"></i>
          <h2 className="text-slate-800 dark:text-white font-bold text-lg mb-2">No Children Linked Yet</h2>
          <p className="text-slate-505 dark:text-slate-400 text-xs max-w-md mx-auto leading-relaxed font-normal">
            Your parent portal account hasn&apos;t been connected to any student registers. Please contact the class teacher or school Principal to link your mobile number and ward&apos;s EMIS profile.
          </p>
        </div>
      )}

      {/* ── Main Dashboard Content Grid ─────────────────── */}
      {(children.length > 0 || loading) && (
        <>
          {/* KPI Strip - Graphic & Image-Oriented gauges with roomy layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {KPI_META.map((meta) => {
              const kpi = kpiValues ? (kpiValues as any)[meta.key] : null;
              const rawVal = kpi?.raw ?? 0;

              return (
                <div
                  key={meta.key}
                  className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 p-6 rounded-2xl flex flex-col justify-between hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-300 shadow-sm dark:shadow-xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] text-slate-550 dark:text-slate-400 font-bold uppercase tracking-wider">{meta.label}</span>
                    <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400">{kpi?.sub ?? ""}</span>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-between py-3">
                      <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3 py-1.5">
                      <div className={`text-2xl font-black ${meta.color} tracking-tight`}>
                        {kpi?.value ?? "—"}
                      </div>
                      
                      {/* High-visibility direct color strokes for gauges to prevent transparency overlay */}
                      {meta.key === "attendance" && (
                        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="28" cy="28" r="24" stroke="#f1f5f9" strokeWidth="4.5" fill="transparent" />
                            <circle cx="28" cy="28" r="24" stroke={meta.strokeColor} strokeWidth="4.5" fill="transparent"
                              strokeDasharray={2 * Math.PI * 24}
                              strokeDashoffset={getProgressCircleOffset(rawVal)}
                              strokeLinecap="round"
                            />
                          </svg>
                          <i className="fi fi-rr-calendar text-[10px] text-emerald-500 absolute"></i>
                        </div>
                      )}

                      {meta.key === "grade" && (
                        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="28" cy="28" r="24" stroke="#f1f5f9" strokeWidth="4.5" fill="transparent" />
                            <circle cx="28" cy="28" r="24" stroke={meta.strokeColor} strokeWidth="4.5" fill="transparent"
                              strokeDasharray={2 * Math.PI * 24}
                              strokeDashoffset={getProgressCircleOffset(rawVal)}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="text-[10px] font-extrabold text-amber-605 absolute">{kpi?.value ?? "—"}</span>
                        </div>
                      )}

                      {meta.key === "homework" && (
                        <div className="w-20 flex flex-col gap-1.5 shrink-0">
                          <div className="flex justify-between text-[9px] font-bold text-slate-400">
                            <span>Done</span>
                            <span>{rawVal}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/20">
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-505" style={{ width: `${rawVal}%` }} />
                          </div>
                        </div>
                      )}

                      {meta.key === "rank" && (
                        <div className="w-11 h-11 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                          <i className="fi fi-rr-trophy text-purple-600 dark:text-purple-400 text-lg"></i>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Marks & Notifications Row - Premium cards spacing layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Subject Marks block */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 md:p-8 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-sm font-bold text-slate-855 dark:text-white flex items-center gap-2">
                    <i className="fi fi-rr-chart-bar text-emerald-500"></i> Subject Marks Graphical Analytics
                  </h2>
                  
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    {/* View switcher: Chart vs Table */}
                    <div className="bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-250 dark:border-slate-855 flex gap-0.5 shrink-0">
                      <button
                        onClick={() => setPerfViewMode("CHART")}
                        className={`p-1 px-3 rounded-md text-[10px] font-bold flex items-center gap-1.5 transition-all ${
                          perfViewMode === "CHART"
                            ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-455 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        <i className="fi fi-rr-chart-histogram"></i> Chart
                      </button>
                      <button
                        onClick={() => setPerfViewMode("TABLE")}
                        className={`p-1 px-3 rounded-md text-[10px] font-bold flex items-center gap-1.5 transition-all ${
                          perfViewMode === "TABLE"
                            ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-455 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        <i className="fi fi-rr-table"></i> Table
                      </button>
                    </div>

                    {/* Exam Term Filter */}
                    <select
                      value={selectedExam}
                      onChange={e => { setSelectedExam(e.target.value); setSubPage(1); }}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 px-3.5 py-1.5 rounded-xl text-xs outline-none cursor-pointer focus:border-emerald-500/80 flex-1 sm:w-44"
                    >
                      <option value="ALL">Comparison: All Exams</option>
                      {sortedExamTypes.map(et => (
                        <option key={et} value={et}>{et} Marks</option>
                      ))}
                    </select>
                  </div>
                </div>

                {perfLoading ? (
                  <div className="space-y-3.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : subjects.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 text-xs font-normal">
                    No marks recorded yet for {activeChild?.name}.
                  </div>
                ) : perfViewMode === "CHART" ? (
                  /* GRAPHICAL BAR CHART VIEW */
                  <div className="py-2">
                    {/* Render visual bar graph comparing subject marks for the selected exam */}
                    <div className="w-full overflow-x-auto select-none py-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      <div className="min-w-[480px] h-60 relative flex flex-col justify-end">
                        {/* Y-axis gridlines */}
                        {[25, 50, 75, 100].map((tick) => (
                          <div
                            key={tick}
                            className="absolute left-0 right-0 border-t border-slate-100 dark:border-slate-800/50 flex items-center text-[9px] font-bold text-slate-400"
                            style={{ bottom: `${tick}%`, height: '1px' }}
                          >
                            <span className="bg-white dark:bg-slate-900/60 px-1 rounded pr-2">{tick}%</span>
                          </div>
                        ))}

                        {/* Columns container */}
                        <div className="flex items-end justify-around pl-10 h-[80%] pb-2 z-10">
                          {subjects.map((m, idx) => {
                            const val = selectedExam === "ALL" 
                              ? (sortedExamTypes.length > 0 ? parseMarkPct(m[sortedExamTypes[sortedExamTypes.length - 1]]) : 0)
                              : parseMarkPct(m[selectedExam]);
                            const colorCode = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
                            
                            return (
                              <div key={m.subject} className="flex flex-col items-center group relative w-16">
                                {/* Bar Tooltip */}
                                <div className="absolute -top-12 bg-slate-800 dark:bg-slate-950 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 whitespace-nowrap">
                                  {m.subject}: {val}%
                                </div>

                                {/* Solid, high-visibility background colors */}
                                <div 
                                  className="w-8 rounded-t-lg transition-all duration-550 shadow-sm relative"
                                  style={{
                                    height: `${Math.max(10, val * 1.5)}px`,
                                    backgroundColor: colorCode
                                  }}
                                />

                                {/* Floating Score Label */}
                                <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 mt-1.5">
                                  {val}%
                                </span>
                                
                                {/* Shortened Subject Name label with helper */}
                                <span className="text-[10px] font-bold text-slate-500 mt-1 truncate max-w-[60px] text-center">
                                  {formatSubjName(m.subject)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {/* Graph legend */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2.5 justify-center mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
                      {subjects.map((m, idx) => (
                        <div key={m.subject} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: SUBJECT_COLORS[idx % SUBJECT_COLORS.length] }} />
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{m.subject}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedExam === "ALL" ? (
                  /* ALL Exams - Full comparison table */
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse text-xs min-w-[500px]">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                          <th className="py-2.5 px-3">Subject</th>
                          {sortedExamTypes.map(et => <th key={et} className="py-2.5 px-3">{et}</th>)}
                          <th className="py-2.5 px-3">Trend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {subjects.map((m, idx) => {
                          const vals = sortedExamTypes
                            .map(et => ({ term: et, score: m[et] }))
                            .filter(item => item.score !== undefined && item.score !== null && item.score !== "" && item.score !== "—")
                            .map(item => parseMarkPct(item.score));
                            
                          const last = vals[vals.length - 1];
                          const prev = vals[vals.length - 2];
                          const colorCode = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
                          return (
                            <tr key={m.subject} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                              <td className="py-3.5 px-3 font-bold text-slate-800 dark:text-slate-200" style={{ borderLeft: `3px solid ${colorCode}` }}>
                                <span className="pl-2">{m.subject}</span>
                              </td>
                              {sortedExamTypes.map(et => (
                                <td key={et} className="py-3.5 px-3 font-semibold text-slate-655 dark:text-slate-300">
                                  {m[et] ?? "—"}
                                </td>
                              ))}
                              <td className="py-3.5 px-3">
                                {vals.length >= 2 ? (
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                                    last >= prev
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10"
                                      : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/10"
                                  }`}>
                                    <i className={last >= prev ? "fi fi-rr-arrow-trend-up" : "fi fi-rr-arrow-trend-down"}></i>
                                    <span>{last >= prev ? "Up" : "Down"}</span>
                                  </span>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* SINGLE Exam filtered - Show scores & progress bars with pagination */
                  <div className="space-y-4">
                    {paginatedSubjects.map((m, idx) => {
                      const mark = m[selectedExam];
                      const pct = parseMarkPct(mark);
                      
                      let barColor = "bg-emerald-500";
                      let textColor = "text-emerald-600 dark:text-emerald-400";
                      let bgColor = "bg-emerald-500/10";
                      if (pct < 35) {
                        barColor = "bg-red-500";
                        textColor = "text-red-655 dark:text-red-400";
                        bgColor = "bg-red-500/10";
                      } else if (pct < 75) {
                        barColor = "bg-amber-500";
                        textColor = "text-amber-600 dark:text-amber-400";
                        bgColor = "bg-amber-500/10";
                      }
                      const colorCode = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];

                      return (
                        <div key={m.subject} className="bg-slate-55 dark:bg-slate-900/60 border border-slate-205 dark:border-slate-800/80 rounded-xl p-4 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center" style={{ borderLeft: `3px solid ${colorCode}` }}>
                              <span className="pl-2">{m.subject}</span>
                            </span>
                            <span className={`text-[11px] px-2.5 py-0.5 rounded font-extrabold border-slate-200/50 ${textColor} ${bgColor}`}>
                              Score: {mark ?? "—"}
                            </span>
                          </div>
                          {mark !== undefined && mark !== null && (
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-855 rounded-full overflow-hidden">
                                <div className={`h-full ${barColor} transition-all duration-505`} style={{ width: `${pct}%` }}></div>
                              </div>
                              <span className="text-[10px] font-bold text-slate-555 w-8 text-right">{pct}%</span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Subject Pagination */}
                    {totalSubPages > 1 && (
                      <div className="flex items-center justify-between border-t border-slate-105 dark:border-slate-800 pt-4 text-xs">
                        <span className="text-slate-505 font-medium">
                          Page {subPage} of {totalSubPages}
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setSubPage(p => Math.max(1, p - 1))}
                            disabled={subPage === 1}
                            className="px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 font-bold"
                          >
                            Prev
                          </button>
                          <button
                            onClick={() => setSubPage(p => Math.min(totalSubPages, p + 1))}
                            disabled={subPage === totalSubPages}
                            className="px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 font-bold"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-4 border-t border-slate-105 dark:border-slate-800/80 pt-4">
                <Link href="/parent/performance" className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-505 font-bold transition-colors inline-flex items-center gap-1.5">
                  View Full Academic Reports <i className="fi fi-rr-angle-small-right"></i>
                </Link>
              </div>
            </div>

            {/* Notifications Center with filters and pagination */}
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 md:p-8 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-sm font-bold text-slate-855 dark:text-white flex items-center gap-2">
                    <i className="fi fi-rr-bell text-emerald-500"></i> Notifications
                  </h2>
                  <Link href="/parent/notifications" className="text-[11px] text-slate-500 hover:text-emerald-500 font-semibold">
                    View All
                  </Link>
                </div>

                {/* Notifications Type Filter */}
                <div className="flex gap-1.5 mb-4 overflow-x-auto whitespace-nowrap scroll-smooth pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {[
                    { id: "ALL", label: "All" },
                    { id: "attendance", label: "Attendance" },
                    { id: "marks", label: "Academics" },
                    { id: "homework", label: "Homework" },
                    { id: "pta", label: "PTA" },
                    { id: "scholarship", label: "Welfare" },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { setNotifFilter(cat.id); setNotifPage(1); }}
                      className={`text-[10px] px-3 py-1 rounded-lg font-bold border transition-all ${
                        notifFilter === cat.id
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-slate-50 dark:bg-slate-950 border-slate-205 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-350"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 text-xs font-normal">
                    <i className="fi fi-rr-bell-ring text-3xl block text-slate-300 dark:text-slate-700 mb-3"></i>
                    No notifications in this category.
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {paginatedNotifications.map((n) => {
                      const meta = notifMeta(n.type);
                      return (
                        <div
                          key={n.id}
                          className={`p-3.5 rounded-xl border text-xs bg-slate-55 dark:bg-slate-950/20 ${meta.border} ${!n.isRead ? "ring-1 ring-emerald-500/20" : ""}`}
                        >
                          <div className="flex gap-2.5 items-start">
                            <span className={`w-6.5 h-6.5 rounded-lg ${meta.bg} border ${meta.border} flex items-center justify-center shrink-0 mt-0.5`}>
                              <i className={`fi ${meta.icon} ${meta.color} text-[10px]`}></i>
                            </span>
                            <div className="flex-1">
                              <p className="text-slate-800 dark:text-slate-200 font-bold leading-snug">{n.title}</p>
                              <p className="text-slate-550 dark:text-slate-400 mt-0.5 leading-snug font-normal">{n.message}</p>
                              <p className="text-slate-400 dark:text-slate-505 text-[10px] mt-1.5 font-semibold">
                                {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notification pagination controls */}
              {totalNotifPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 text-xs mt-4">
                  <span className="text-slate-505 font-medium">
                    Page {notifPage} of {totalNotifPages}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setNotifPage(p => Math.max(1, p - 1))}
                      disabled={notifPage === 1}
                      className="px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 font-bold"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setNotifPage(p => Math.min(totalNotifPages, p + 1))}
                      disabled={notifPage === totalNotifPages}
                      className="px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 font-bold"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        {/* ── Quick Access Services Grid ── */}
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 md:p-8 shadow-md mb-6">
          <h2 className="text-sm font-bold text-slate-855 dark:text-white mb-5 flex items-center gap-2">
            <i className="fi fi-rr-apps text-emerald-500"></i> Quick Access Services
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { 
                label: "Attendance", 
                href: "/parent/attendance", 
                icon: "fi-rr-calendar", 
                bg: "from-emerald-500/10 to-teal-500/5 hover:from-emerald-500/15 hover:to-teal-500/10", 
                border: "border-emerald-500/20 dark:border-emerald-500/10 hover:border-emerald-500/40", 
                text: "text-emerald-700 dark:text-emerald-400",
                iconBg: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
              },
              { 
                label: "Homework",   
                href: "/parent/homework",   
                icon: "fi-rr-document-signed", 
                bg: "from-blue-500/10 to-cyan-500/5 hover:from-blue-500/15 hover:to-cyan-500/10", 
                border: "border-blue-500/20 dark:border-blue-500/10 hover:border-blue-500/40", 
                text: "text-blue-700 dark:text-blue-400",
                iconBg: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300"
              },
              { 
                label: "Scholarship",
                href: "/parent/scholarship",
                icon: "fi-rr-graduation-cap", 
                bg: "from-purple-500/10 to-violet-500/5 hover:from-purple-500/15 hover:to-violet-500/10", 
                border: "border-purple-500/20 dark:border-purple-500/10 hover:border-purple-500/40", 
                text: "text-purple-700 dark:text-purple-400",
                iconBg: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300"
              },
              { 
                label: "PTA Meetings",
                href: "/parent/pta",      
                icon: "fi-rr-users", 
                bg: "from-amber-500/10 to-orange-500/5 hover:from-amber-500/15 hover:to-orange-500/10", 
                border: "border-amber-500/20 dark:border-amber-500/10 hover:border-amber-500/40", 
                text: "text-amber-700 dark:text-amber-400",
                iconBg: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300"
              },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3.5 p-2 px-3 rounded-full bg-gradient-to-r ${item.bg} ${item.border} ${item.text} hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-300 shadow-sm border`}
              >
                <div className={`w-9 h-9 rounded-full ${item.iconBg} flex items-center justify-center shrink-0`}>
                  <i className={`fi ${item.icon} text-xs`}></i>
                </div>
                <span className="text-xs font-bold">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── AI Parent Assistant Insights ── */}
        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 md:p-8 shadow-md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/35 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-455 shrink-0">
              <i className="fi fi-rr-sparkles text-lg animate-pulse"></i>
            </div>
            <div className="flex-1 w-full">
              <h2 className="text-sm font-bold text-slate-855 dark:text-white mb-1 flex items-center gap-1.5">
                AI Parent Assistant Insights
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 font-normal">
                Personalised learning reviews and progress advice computed for your child.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    icon: "fi-rr-book-alt", label: "Learning Recommendation", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/10",
                    desc: summary
                      ? `${summary.name.split(" ")[0]} may benefit from extra practice based on recent marks.`
                      : "Loading insights…",
                  },
                  {
                    icon: "fi-rr-calendar", label: "Attendance Status", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/10",
                    desc: summary
                      ? summary.kpis.attendance.raw < 85
                        ? `⚠️ ${summary.name.split(" ")[0]}'s attendance is ${summary.kpis.attendance.value} — below 85% threshold.`
                        : `✅ ${summary.name.split(" ")[0]}'s attendance is ${summary.kpis.attendance.value} — looking good!`
                      : "Loading…",
                  },
                  {
                    icon: "fi-rr-chart-histogram", label: "Performance Overview", color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/10",
                    desc: summary
                      ? `Class Rank: ${summary.kpis.rank.value} | Average: ${summary.kpis.grade.raw}%`
                      : "Loading…",
                  },
                ].map((card) => (
                  <div key={card.label} className="bg-slate-50 dark:bg-slate-950/20 rounded-xl px-6 py-5 border border-slate-205 dark:border-slate-800 hover:scale-[1.01] transition-transform">
                    <div className={`w-10 h-10 rounded-full ${card.bg} border ${card.border} flex items-center justify-center mb-4`}>
                      <i className={`fi ${card.icon} ${card.color} text-xs`}></i>
                    </div>
                    <div className="text-xs font-bold text-slate-880 dark:text-slate-355 mb-2">{card.label}</div>
                    <p className="text-xs text-slate-655 dark:text-slate-400 font-normal leading-relaxed">{card.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
                <Link href="/parent/ai-assistant" className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-505 font-bold transition-colors inline-flex items-center gap-1.5">
                  Consult AI Assistant Chat <i className="fi fi-rr-angle-small-right"></i>
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
