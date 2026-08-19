"use client";
import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import PersonalKpiStrip from "@/components/kpi/PersonalKpiStrip";
import StudentDailyOverview from "@/components/student/StudentDailyOverview";
import { useSession } from "next-auth/react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import Link from "next/link";

/* ─── API base ────────────────────────────────────────── */
const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) url = `https://${url}`;
  return url;
};
const API_BASE = getApiBase();

/* ─── Badge metadata ──────────────────────────────────── */
const BADGE_META: Record<string, { fi: string; color: string; bg: string; rarity: string }> = {
  "🔬 Star Scientist":  { fi: "fi-sr-flask", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500", rarity: "Epic" },
  "📝 Homework Pro":   { fi: "fi-sr-pencil", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500", rarity: "Rare" },
  "💬 Active Speaker": { fi: "fi-sr-comment", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500", rarity: "Rare" },
  "🌟 Mentor Star":    { fi: "fi-sr-star", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500", rarity: "Epic" },
};

/* ─── Subject data ────────────────────────────────────── */
const subjectsEn = [
  { name: "Mathematics",    progress: 85, color: "#6366f1", fi: "fi-sr-calculator" },
  { name: "Science",        progress: 70, color: "#10b981", fi: "fi-sr-flask"      },
  { name: "Tamil",          progress: 92, color: "#f59e0b", fi: "fi-sr-book"       },
  { name: "English",        progress: 80, color: "#3b82f6", fi: "fi-sr-pen-nib"    },
  { name: "Social Science", progress: 60, color: "#ec4899", fi: "fi-sr-globe"      },
];
const subjectsTa = [
  { name: "கணிதம்",          progress: 85, color: "#6366f1", fi: "fi-sr-calculator" },
  { name: "அறிவியல்",        progress: 70, color: "#10b981", fi: "fi-sr-flask"      },
  { name: "தமிழ்",           progress: 92, color: "#f59e0b", fi: "fi-sr-book"       },
  { name: "ஆங்கிலம்",        progress: 80, color: "#3b82f6", fi: "fi-sr-pen-nib"    },
  { name: "சமூக அறிவியல்", progress: 60, color: "#ec4899", fi: "fi-sr-globe"      },
];

/* ─── KPI data ────────────────────────────────────────── */
const KPI_CONFIG = [
  { keyEn: "Attendance", keyTa: "வருகை", fi: "fi-sr-user-check", valueKey: "attendance",  accent: "emerald" },
  { keyEn: "Learning Pts", keyTa: "கற்றல்",  fi: "fi-sr-trophy",     valueKey: "points",      accent: "amber"   },
  { keyEn: "Quizzes",      keyTa: "வினாக்கள்",fi: "fi-sr-target",     valueKey: "quizzes",     accent: "blue"    },
  { keyEn: "Reading",      keyTa: "வாசிப்பு", fi: "fi-sr-book-open-cover", valueKey: "reading", accent: "purple" },
];

/* ─── Quick nav links ─────────────────────────────────── */
const NAV_LINKS = [
  { href: "/student/homework",    fi: "fi-sr-book-bookmark",  labelEn: "Homework",     labelTa: "வீட்டுப்பாடம்", accent: "teal"   },
  { href: "/student/assessments", fi: "fi-sr-file-check",     labelEn: "Assessments",  labelTa: "தேர்வுகள்",    accent: "indigo" },
  { href: "/student/progress",    fi: "fi-sr-chart-histogram",labelEn: "Progress",     labelTa: "முன்னேற்றம்",  accent: "amber"  },
  { href: "/student/exams",       fi: "fi-sr-calendar-clock", labelEn: "Exams",        labelTa: "தேர்வு நாட்கள்",accent: "rose"  },
  { href: "/student/health",      fi: "fi-sr-heart-rate",     labelEn: "Health",       labelTa: "சுகாதாரம்",   accent: "red"    },
  { href: "/student/leave",       fi: "fi-sr-calendar",       labelEn: "Leave",        labelTa: "விடுப்பு",     accent: "sky"    },
];

const ACCENT_CLASSES: Record<string, { text: string; bg: string; border: string }> = {
  teal:   { text: "text-teal-600 dark:text-teal-400",   bg: "bg-teal-50 dark:bg-teal-950/40",   border: "border-teal-200/40 dark:border-teal-800/40"   },
  indigo: { text: "text-indigo-600 dark:text-indigo-400",bg: "bg-indigo-50 dark:bg-indigo-950/40",border: "border-indigo-200/40 dark:border-indigo-800/40"},
  amber:  { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200/40 dark:border-amber-800/40"  },
  rose:   { text: "text-rose-600 dark:text-rose-400",   bg: "bg-rose-50 dark:bg-rose-950/40",   border: "border-rose-200/40 dark:border-rose-800/40"   },
  red:    { text: "text-red-600 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-950/40",     border: "border-red-200/40 dark:border-red-800/40"     },
  sky:    { text: "text-sky-600 dark:text-sky-400",     bg: "bg-sky-50 dark:bg-sky-950/40",     border: "border-sky-200/40 dark:border-sky-800/40"     },
  emerald:{ text: "text-emerald-600 dark:text-emerald-400",bg:"bg-emerald-50 dark:bg-emerald-950/40",border:"border-emerald-200/40 dark:border-emerald-800/40"},
  blue:   { text: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-950/40",   border: "border-blue-200/40 dark:border-blue-800/40"   },
  purple: { text: "text-purple-600 dark:text-purple-400",bg:"bg-purple-50 dark:bg-purple-950/40",border:"border-purple-200/40 dark:border-purple-800/40"},
};

/* ═══════════════════════════════════════════════════════ */
export default function MiddleSchoolDashboard() {
  const { data: session } = useSession();
  const { lang }          = usePortalLanguage();

  const [student,              setStudent]              = useState<any>(null);
  const [earnedBadges,         setEarnedBadges]         = useState<any[]>([]);
  const [loadingBadges,        setLoadingBadges]        = useState(true);
  const [notifications,        setNotifications]        = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [recentMarks,          setRecentMarks]          = useState<any[]>([]);
  const [loadingMarks,         setLoadingMarks]         = useState(true);
  const [todayProgress,        setTodayProgress]        = useState<any>(null);

  /* ── Fetch all data ──────────────────────────────────── */
  useEffect(() => {
    const userId   = (session?.user as any)?.id;
    const schoolId = (session?.user as any)?.schoolId;
    if (!userId) return;

    /* notifications */
    fetch(`${API_BASE}/api/notifications?userId=${userId}`)
      .then(r => r.json())
      .then(j => { if (j.success) setNotifications(j.data.slice(0, 4)); })
      .catch(console.error)
      .finally(() => setLoadingNotifications(false));

    /* today progress */
    fetch(`${API_BASE}/api/digital-library/progress/today?studentId=${userId}`)
      .then(r => r.json())
      .then(j => { if (j.success) setTodayProgress(j.data); })
      .catch(console.error);

    /* student + marks + badges */
    fetch(`${API_BASE}/api/students`)
      .then(r => r.json())
      .then(async j => {
        if (!j.success || !j.data.length) return;
        const s = j.data.find((x: any) => x.userId === userId) ?? j.data[0];
        setStudent(s);

        /* marks */
        fetch(`${API_BASE}/api/students/${s.id}/marks`)
          .then(r => r.json())
          .then(j => { if (j.success) setRecentMarks(j.data.slice(0, 6)); })
          .catch(console.error)
          .finally(() => setLoadingMarks(false));

        /* badges */
        const bUrl = schoolId
          ? `${API_BASE}/api/teacher/badges?schoolId=${schoolId}`
          : `${API_BASE}/api/teacher/badges`;
        const bj = await fetch(bUrl).then(r => r.json());
        if (bj.success) {
          const shaped = bj.data
            .filter((b: any) => b.studentId === s.id)
            .map((b: any) => {
              const m = BADGE_META[b.badge] ?? { fi: "fi-sr-badge", color: "text-slate-500", bg: "bg-slate-500", rarity: "Common" };
              return { id: b.id, name: b.badge, fi: m.fi, color: m.color, bg: m.bg, rarity: m.rarity };
            });
          setEarnedBadges(shaped);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingBadges(false));
  }, [session]);

  const isTa       = lang === "தமிழ்";
  const userName   = session?.user?.name || student?.user?.name || (isTa ? "மாணவர்" : "Student");
  const subjectList = isTa ? subjectsTa : subjectsEn;

  /* KPI live values */
  const kpiValues: Record<string, string> = {
    attendance: "98%",
    points:     "1,250",
    quizzes:    "12",
    reading:    "5 Hrs",
  };
  const kpiSubs: Record<string, string> = {
    attendance: isTa ? "இந்த வாரம் சிறப்பு!" : "Perfect this week!",
    points:     isTa ? "இன்று +50"           : "+50 today",
    quizzes:    isTa ? "2 நிலுவையில்"         : "2 pending",
    reading:    isTa ? "இந்த வாரம்"           : "This week",
  };

  /* ── Render ──────────────────────────────────────────── */
  return (
    <PortalLayout
      title={isTa ? "நடுநிலை பள்ளி" : "Middle School"}
      subtitle={
        student
          ? isTa
            ? `மீண்டும் வருக, ${userName}! · வகுப்பு ${student.class} ${student.section}`
            : `Welcome back, ${userName}! · Class ${student.class} ${student.section}`
          : isTa ? "தரவு ஏற்றப்படுகிறது..." : "Loading student data..."
      }
      accentColor="#10b981"
      themeClass="theme-student"
    >

      {/* ══════════════════════════════════════════════════
          HERO BANNER  –  identical pattern to Homework page
          ══════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 glass rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
        {/* Left */}
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              {isTa ? "நடுநிலை பள்ளி" : "Middle School"}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
              {isTa ? "கல்வி ஆண்டு 2024-25" : "Academic Year 2024-25"}
            </span>
          </div>
          <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-wider mb-1 flex items-center gap-2">
            <i className="fi fi-sr-graduation-cap text-emerald-600 dark:text-emerald-400 flex items-center" />
            {isTa ? "நடுநிலை மாணவர் போர்டல்" : "Middle School Student Portal"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isTa
              ? "உங்கள் பாடங்கள், தேர்வுகள், பேட்ஜ்கள் மற்றும் தினசரி முன்னேற்றத்தை இங்கே கண்காணிக்கவும்."
              : "Track your subjects, assessments, badges and daily academic progress."}
          </p>
        </div>
        {/* Right badge */}
        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm rounded-xl border border-emerald-200/20 shadow-sm whitespace-nowrap shrink-0">
          <i className="fi fi-sr-school flex items-center text-sm" />
          {isTa ? "கல்வி போர்டல்" : "Class Learning Portal"}
        </span>
      </div>

      {/* ── KPI Strip ──────────────────────────────────── */}
      <PersonalKpiStrip studentId={(session?.user as any)?.studentId || null} hideHeader={true} />


      {/* ── Quick Nav Links ────────────────────────────── */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
        {NAV_LINKS.map(n => {
          const ac = ACCENT_CLASSES[n.accent];
          return (
            <Link key={n.href} href={n.href}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm ${ac.text} ${ac.bg} border ${ac.border} hover:shadow-md hover:-translate-y-0.5 transition-all`}>
              <i className={`fi ${n.fi} flex items-center text-sm`} />
              {isTa ? n.labelTa : n.labelEn}
            </Link>
          );
        })}
      </div>

      {/* ── Daily Overview (timetable, homework, exams, attendance) ── */}
      <StudentDailyOverview />

      {/* ── Assessment Marks ── */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 mt-6">


        {/* Recent Assessment Marks */}
        <div className="glass rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm bg-white/70 dark:bg-slate-900/40 backdrop-blur-md">
          <h2 className="text-sm sm:text-base font-black text-black dark:text-white mb-4 flex items-center gap-2">
            <i className="fi fi-sr-target flex items-center text-indigo-500" />
            {isTa ? "சமீபத்திய மதிப்பீட்டு மதிப்பெண்கள்" : "Recent Assessment Marks"}
          </h2>
          {loadingMarks ? (
            <div className="text-xs text-slate-500 py-6 text-center flex flex-col items-center gap-2">
              <i className="fi fi-sr-refresh animate-spin text-xl text-indigo-400 flex items-center" />
              {isTa ? "மதிப்பெண்கள் ஏற்றப்படுகின்றன..." : "Loading marks..."}
            </div>
          ) : recentMarks.length > 0 ? (
            <div className="space-y-2.5">
              {recentMarks.map(m => {
                const pct = Math.round((m.scored / m.maxMarks) * 100);
                const col = pct >= 75 ? "text-emerald-600 dark:text-emerald-400" : pct >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-500 dark:text-red-400";
                return (
                  <div key={m.id}
                    className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                        <i className="fi fi-sr-book flex items-center" />{m.subject}
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                        {m.examType.replace("Assessment: ", "")}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-sm font-black font-mono ${col}`}>{m.scored}/{m.maxMarks}</div>
                      <div className="text-[9px] font-bold text-slate-400">
                        {new Date(m.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <i className="fi fi-sr-document text-3xl text-slate-300 dark:text-slate-600 flex items-center justify-center mb-2" />
              <p className="text-xs text-slate-500 italic mb-3">{isTa ? "இதுவரை எந்த மதிப்பீடும் முடிக்கப்படவில்லை." : "No assessments completed yet."}</p>
              <Link href="/student/assessments"
                className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1.5 rounded-xl border border-indigo-200/40 hover:shadow-md transition-all">
                <i className="fi fi-sr-arrow-right flex items-center" />
                {isTa ? "முதல் தேர்வை எழுதுங்கள்" : "Take your first test"}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Notifications + Today Progress (2-col on lg) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">

        {/* Notifications */}
        <div className="glass rounded-2xl p-5 sm:p-6 border border-indigo-200/50 dark:border-indigo-700/30 shadow-sm bg-gradient-to-br from-indigo-50/60 to-white dark:from-indigo-950/10 dark:to-slate-900/40 backdrop-blur-md flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center">
              <i className="fi fi-sr-bell flex items-center text-base text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-sm sm:text-base font-black text-black dark:text-white">{isTa ? "சமீபத்திய அறிவிப்புகள்" : "Recent Notifications"}</h2>
          </div>
          <div className="flex-1 space-y-2.5">
            {loadingNotifications ? (
              <div className="text-xs text-slate-500 py-6 text-center flex flex-col items-center gap-2">
                <i className="fi fi-sr-refresh animate-spin text-xl text-indigo-400 flex items-center" />
                {isTa ? "ஏற்றப்படுகிறது..." : "Loading..."}
              </div>
            ) : notifications.length > 0 ? notifications.map(n => (
              <div key={n.id} className="p-3 bg-white/80 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-700/50 transition-all">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-relaxed">{n.message}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-semibold flex items-center gap-1">
                  <i className="fi fi-sr-clock flex items-center" />
                  {new Date(n.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <i className="fi fi-sr-bell-slash text-3xl text-slate-300 dark:text-slate-600 flex items-center justify-center mb-2" />
                <p className="text-xs text-slate-500">{isTa ? "புதிய அறிவிப்புகள் இல்லை." : "No new notifications."}</p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Study Progress */}
        <div className="glass rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm bg-white/70 dark:bg-slate-900/40 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center">
              <i className="fi fi-sr-time-fast flex items-center text-base text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-sm sm:text-base font-black text-black dark:text-white">{isTa ? "இன்றைய படிப்பு முன்னேற்றம்" : "Today's Study Progress"}</h2>
          </div>
          {todayProgress ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-black flex items-center justify-center gap-1 mb-1">
                    <i className="fi fi-sr-clock flex items-center" />
                    {isTa ? "நேரம்" : "Logged"}
                  </div>
                  <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{todayProgress.totalTimeSpentMinutes}<span className="text-xs ml-0.5 font-bold">{isTa ? "நி" : "m"}</span></div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-black flex items-center justify-center gap-1 mb-1">
                    <i className="fi fi-sr-book flex items-center" />
                    {isTa ? "படித்தவை" : "Resources"}
                  </div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{todayProgress.activeCount}</div>
                </div>
              </div>
              {todayProgress.recentResources?.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] text-slate-400 uppercase font-black flex items-center gap-1">
                    <i className="fi fi-sr-chart-histogram flex items-center" />
                    {isTa ? "சமீபத்திய செயல்பாடு" : "Recent Activity"}
                  </div>
                  {todayProgress.recentResources.slice(0, 3).map((r: any) => (
                    <div key={r.resourceId} className="bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{r.resourceTitle}</span>
                        <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 shrink-0">{r.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${r.progressPercent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-6 text-center flex flex-col items-center gap-2">
              <i className="fi fi-sr-refresh animate-spin text-xl text-purple-400 flex items-center" />
              {isTa ? "முன்னேற்றம் ஏற்றப்படுகிறது..." : "Loading progress..."}
            </div>
          )}
        </div>
      </div>

      {/* ── Earned Badges ──────────────────────────────── */}
      <div className="glass rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm bg-white/70 dark:bg-slate-900/40 backdrop-blur-md mt-4 sm:mt-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="text-sm sm:text-base font-black text-black dark:text-white flex items-center gap-2">
            <i className="fi fi-sr-badge flex items-center text-lg text-indigo-500" />
            {isTa ? "நான் பெற்ற பேட்ஜ்கள்" : "My Earned Badges"}
          </h2>
          <Link href="/student/middle-school/badges"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1.5 rounded-xl border border-indigo-200/40 hover:shadow-md transition-all">
            <i className="fi fi-sr-trophy flex items-center" />
            {isTa ? "கோப்பை அறை" : "Trophy Room"}
          </Link>
        </div>

        {loadingBadges ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : earnedBadges.length > 0 ? (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
            {earnedBadges.map(b => (
              <div key={b.id}
                className="bg-slate-50 dark:bg-slate-900/60 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 text-center flex flex-col items-center group cursor-pointer hover:border-indigo-400/50 hover:-translate-y-1 transition-all">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${b.bg} flex items-center justify-center shadow-md mb-2 border-4 border-white dark:border-slate-800`}>
                  <i className={`fi ${b.fi} flex items-center text-base sm:text-lg text-white group-hover:scale-110 transition-transform`} />
                </div>
                <h3 className="font-bold text-[10px] sm:text-xs text-black dark:text-white truncate w-full">{b.name}</h3>
                <span className="text-[8px] sm:text-[9px] text-slate-400 font-medium mt-0.5">{b.rarity}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <i className="fi fi-sr-badge text-4xl text-slate-300 dark:text-slate-600 flex items-center justify-center mb-3" />
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              {isTa
                ? "இன்னும் பேட்ஜ்கள் எதுவும் பெறப்படவில்லை. தொடர்ந்து நன்றாகப் படியுங்கள்!"
                : "No badges earned yet. Keep up the good work to earn badges from your teachers!"}
            </p>
          </div>
        )}
      </div>

    </PortalLayout>
  );
}
