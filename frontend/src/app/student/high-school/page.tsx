"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import PortalLayout from "@/components/PortalLayout";
import PersonalKpiStrip from "@/components/kpi/PersonalKpiStrip";
import StudentDailyOverview from "@/components/student/StudentDailyOverview";
import { useSession } from "next-auth/react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import {
  Hourglass,
  BarChart2, 
  FileText, 
  Zap, 
  Ruler, 
  Microscope, 
  Scroll, 
  Languages, 
  Globe,
  HeartPulse 
} from "lucide-react";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

const subjectsEn = [
  { name: "Mathematics", progress: 65, color: "#ef4444", icon: Ruler }, // Low progress to show weakness detector
  { name: "Science", progress: 78, color: "#3b82f6", icon: Microscope },
  { name: "Tamil", progress: 88, color: "#f59e0b", icon: Scroll },
  { name: "English", progress: 85, color: "#10b981", icon: Languages },
  { name: "Social Science", progress: 75, color: "#8b5cf6", icon: Globe },
];

const subjectsTa = [
  { name: "கணிதம்", progress: 65, color: "#ef4444", icon: Ruler },
  { name: "அறிவியல்", progress: 78, color: "#3b82f6", icon: Microscope },
  { name: "தமிழ்", progress: 88, color: "#f59e0b", icon: Scroll },
  { name: "ஆங்கிலம்", progress: 85, color: "#10b981", icon: Languages },
  { name: "சமூக அறிவியல்", progress: 75, color: "#8b5cf6", icon: Globe },
];

export default function HighSchoolDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const { lang } = usePortalLanguage();
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    if (sessionStatus === "loading") return; // wait until session is determined
    fetch(`${API_BASE}/api/students`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          const myStudent = (session?.user as any)?.id 
            ? json.data.find((s: any) => s.userId === (session?.user as any)?.id)
            : null;
          setStudent(myStudent || json.data[0]);
        }
      })
      .catch((err) => console.error(err));
  }, [session, sessionStatus]);

  const [todayProgress, setTodayProgress] = useState<any>(null);

  useEffect(() => {
    const targetId = (session?.user as any)?.id || student?.userId || student?.id;
    if (!targetId) return;
    fetch(`${API_BASE}/api/digital-library/progress/today?studentId=${targetId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setTodayProgress(json.data);
      })
      .catch((err) => console.error("Failed to load today progress:", err));
  }, [session, student]);

  const userName = session?.user?.name || student?.user?.name || (lang === "தமிழ்" ? "மாணவர்" : "Student");
  const subtitle = student 
    ? (lang === "தமிழ்"
        ? `வரவேற்கிறோம், ${userName} · வகுப்பு ${student.class} ${student.section} · கவனம் செலுத்தும் பகுதி: SSLC பொதுத் தேர்வுத் தயாரிப்பு`
        : `Welcome, ${userName} · Class ${student.class} ${student.section} · Focus Area: SSLC Board Preparation`)
    : (lang === "தமிழ்" ? "மாணவர் தரவு ஏற்றப்படுகிறது..." : "Loading student data...");

  const subjectsList = lang === "தமிழ்" ? subjectsTa : subjectsEn;

  const kpis = [
    { label: lang === "தமிழ்" ? "SSLC தேர்வுக்கான நாட்கள்" : "Countdown to SSLC", value: lang === "தமிழ்" ? "84 நாட்கள்" : "84 Days", icon: Hourglass, color: "text-red-400", sub: lang === "தமிழ்" ? "தேர்வு மார்ச் 15 அன்று தொடங்குகிறது" : "Exam starts Mar 15" },
    { label: lang === "தமிழ்" ? "ஒட்டுமொத்த சராசரி" : "Overall Avg", value: "77%", icon: BarChart2, color: "text-blue-400", sub: lang === "தமிழ்" ? "இலக்கு: 90%" : "Target: 90%" },
    { label: lang === "தமிழ்" ? "மாதிரித் தேர்வுகள்" : "Mock Tests Taken", value: "4/10", icon: FileText, color: "text-amber-400", sub: lang === "தமிழ்" ? "அடுத்த தேர்வு: வெள்ளிக்கிழமை" : "Next test: Friday" },
    { label: lang === "தமிழ்" ? "சுய படிப்பு மணிநேரம்" : "Study Boost Hrs", value: lang === "தமிழ்" ? "12 மணி" : "12 Hrs", icon: Zap, color: "text-purple-400", sub: lang === "தமிழ்" ? "இந்த வாரம் சுய படிப்பு" : "Self-study this week" },
  ];

  const [recentMarks, setRecentMarks] = useState<any[]>([]);
  const [loadingMarks, setLoadingMarks] = useState(true);

  useEffect(() => {
    const studentId = student?.id || (session?.user as any)?.studentId || (session?.user as any)?.id;
    if (!studentId) return;

    setLoadingMarks(true);
    fetch(`${API_BASE}/api/headmaster/model-exams/student/${studentId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setRecentMarks(json.data.slice(0, 3));
        }
      })
      .catch((err) => console.error("Failed to fetch exam marks:", err))
      .finally(() => setLoadingMarks(false));
  }, [student, session]);

  return (
    <PortalLayout subtitle={subtitle}>
      {/* Real academic-year KPIs */}
      <PersonalKpiStrip studentId={(session?.user as any)?.studentId || null} />

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi-card border border-[var(--border)] hover:border-red-500/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              <span className={`text-xs font-medium ${kpi.color}`}>{kpi.sub}</span>
            </div>
            <div className={`text-3xl font-bold ${kpi.color} mb-1`}>{kpi.value}</div>
            <div className="text-xs text-[var(--text-muted)]">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Daily timetable, homework, exams, attendance, announcements & AI suggestions */}
      <StudentDailyOverview 
        extraLeft={
          <div className="space-y-4">
            {/* SSLC Board Readiness Hub */}
            <div className="glass rounded-2xl p-6 fade-in-2 border border-[var(--border)] h-fit relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                    {lang === "தமிழ்" ? "SSLC பொதுத் தேர்வு தயார்நிலை" : "SSLC Board Readiness Hub"}
                  </span>
                  <h2 className="text-lg font-bold text-[var(--text-heading)] mt-1">
                    {lang === "தமிழ்" ? "பாடத் தயார்நிலை பகுப்பாய்வு" : "Subject Mastery Matrix"}
                  </h2>
                </div>
                <button className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-300 transition-all border border-red-500/30">
                  {lang === "தமிழ்" ? "பகுப்பாய்வை காண்க →" : "View Analytics →"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjectsList.slice(0, 6).map((s) => {
                  const statusTag = s.progress >= 85 
                    ? { label: lang === "தமிழ்" ? "தயார்நிலை A+" : "Target Mastered", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" }
                    : s.progress >= 75 
                    ? { label: lang === "தமிழ்" ? "சரியான திசையில்" : "On Track", color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20" }
                    : { label: lang === "தமிழ்" ? "கவனம் தேவை" : "Needs Focus", color: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20" };

                  return (
                    <div key={s.name} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-[var(--border)] hover:border-red-500/40 transition-all group relative overflow-hidden">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800/80 border border-[var(--border)] flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform">
                            <s.icon className="h-5 w-5" style={{ color: s.color }} />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-[var(--text-heading)] group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors">{s.name}</h3>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${statusTag.color}`}>
                              {statusTag.label}
                            </span>
                          </div>
                        </div>
                        <span className="text-lg font-black text-[var(--text-heading)]">{s.progress}%</span>
                      </div>

                      <div className="w-full bg-slate-200 dark:bg-slate-800/80 h-2 rounded-full overflow-hidden p-0.5 border border-[var(--border)]">
                        <div className="h-full rounded-full transition-all duration-500 relative" style={{ width: `${s.progress}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}dd)` }}>
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Mock Tests / Test Performance */}
            <div className="glass rounded-2xl p-5 fade-in-4 border border-[var(--border)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[var(--text-heading)]">{lang === "தமிழ்" ? "சமீபத்திய மாதிரித் தேர்வுகள்" : "Recent Mock Tests"}</h2>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)] px-2 py-0.5 rounded-full border border-[var(--border)] font-medium">
                  {lang === "தமிழ்" ? "சமீபத்திய 6 மதிப்பெண்கள்" : "Latest 6 Marks"}
                </span>
              </div>

              {loadingMarks ? (
                <div className="py-6 text-center text-xs text-[var(--text-muted)] animate-pulse">
                  {lang === "தமிழ்" ? "மதிப்பெண்கள் ஏற்றப்படுகின்றன..." : "Loading latest exam marks..."}
                </div>
              ) : recentMarks.length === 0 ? (
                <div className="py-6 text-center text-xs text-[var(--text-muted)] italic">
                  {lang === "தமிழ்" ? "சமீபத்திய தேர்வு முடிவுகள் எதுவும் இல்லை" : "No recent exam marks available yet."}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {recentMarks.slice(0, 6).map((m, i) => {
                    const title = m.exam?.examName || `Exam #${i + 1}`;
                    const totalScore = m.total != null ? `${m.total}/${m.maxTotal || 500}` : "—";
                    const pct = m.percentage != null ? `${m.percentage}%` : "";
                    const passed = m.isPassed;

                    return (
                      <div key={m.id || i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[var(--border)] hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                        <div className="min-w-0 pr-2">
                          <div className="text-xs font-bold text-[var(--text-heading)] truncate">{title}</div>
                          <div className="text-[10px] text-[var(--text-muted)] mt-0.5 flex items-center gap-2">
                            <span>{m.exam?.examType || "Model Exam"}</span>
                            {pct && <span className="text-blue-500 font-semibold">{pct}</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`text-xs font-mono font-black ${
                            passed === false ? "text-red-500" : (m.percentage >= 80 ? "text-emerald-500" : "text-blue-500")
                          }`}>
                            {totalScore}
                          </div>
                          {passed != null && (
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                              passed ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-red-500/15 text-red-600 dark:text-red-400"
                            }`}>
                              {passed ? (lang === "தமிழ்" ? "தேர்ச்சி" : "PASS") : (lang === "தமிழ்" ? "தோல்வி" : "FAIL")}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <Link 
                href="/student/high-school/model-exams" 
                className="block mt-4 text-xs text-center w-full text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-colors font-medium"
              >
                {lang === "தமிழ்" ? "அனைத்து முடிவுகளையும் பார் →" : "View All Results →"}
              </Link>
            </div>
          </div>
        }
        extraRight={
          <>
            {/* Today's Learning Progress Card */}
            <div className="glass rounded-2xl p-5 border border-[var(--border)]">
              <h2 className="text-sm font-bold text-[var(--text-heading)] mb-4 flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">⏱️</span> 
                {lang === "தமிழ்" ? "இன்றைய படிப்பு முன்னேற்றம்" : "Today's Study Progress"}
              </h2>
              {todayProgress ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 bg-slate-100/70 dark:bg-slate-950/60 p-3 rounded-xl border border-[var(--border)]">
                    <div className="text-left">
                      <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold">{lang === "தமிழ்" ? "இன்று பதிவான நேரம்" : "Logged Today"}</div>
                      <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">{todayProgress.totalTimeSpentMinutes} {lang === "தமிழ்" ? "நிமி" : "mins"}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold">{lang === "தமிழ்" ? "படித்தவை" : "Resources Studied"}</div>
                      <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{todayProgress.activeCount}</div>
                    </div>
                  </div>

                  {todayProgress.recentResources && todayProgress.recentResources.length > 0 ? (
                    <div className="space-y-2.5">
                      <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold text-left">{lang === "தமிழ்" ? "சமீபத்திய செயல்பாடு" : "Recent Activity"}</div>
                      {todayProgress.recentResources.slice(0, 3).map((r: any) => (
                        <div key={r.resourceId} className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-[var(--border)] text-left space-y-1 hover:border-indigo-500/30 transition-colors">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-[var(--text-heading)] truncate max-w-[70%]">{r.resourceTitle}</span>
                            <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400">{r.progressPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${r.progressPercent}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--text-muted)] italic py-2 text-center">{lang === "தமிழ்" ? "இன்று இன்னும் படிப்பு நடவடிக்கை ஏதும் பதிவாகவில்லை." : "No study activity logged today yet."}</p>
                  )}
                </div>
              ) : (
                <div className="text-xs text-[var(--text-muted)] py-4 text-center">{lang === "தமிழ்" ? "முன்னேற்றம் ஏற்றப்படுகிறது..." : "Loading progress..."}</div>
              )}
            </div>

            {/* AI Weakness Detector */}
            <div className="glass rounded-2xl p-5 fade-in-3 border border-red-500/30 bg-red-500/5">
              <h2 className="text-sm font-bold text-[var(--text-heading)] mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-red-500 animate-pulse" /> {lang === "தமிழ்" ? "AI குறைபாடு எச்சரிக்கை" : "AI Weakness Alert"}
              </h2>
              <p className="text-xs text-[var(--text-main)] mb-4">
                {lang === "தமிழ்"
                  ? "உங்கள் சமீபத்திய மதிப்பெண்கள் கணிதத்தில் (இயற்கணிதம்) சரிவைக் காட்டுகின்றன. உங்கள் மதிப்பெண்ணை உயர்த்த 3 நாள் சிறப்பு படிப்புத் திட்டத்தை உருவாக்கியுள்ளோம்."
                  : <>Your recent scores show a drop in <strong className="text-red-500">Mathematics (Algebra)</strong>. We have generated a custom 3-day study plan to boost your score.</>}
              </p>
              <button className="w-full py-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-300 hover:bg-red-500/20 font-medium text-xs transition-colors border border-red-500/40">
                {lang === "தமிழ்" ? "இயற்கணித பூஸ்ட் திட்டத்தைத் தொடங்கு" : "Start Algebra Boost Plan"}
              </button>
            </div>

            {/* Quick Links / Student Tools */}
            <div className="glass rounded-2xl p-5 fade-in-5 border border-[var(--border)]">
              <h2 className="text-sm font-bold text-[var(--text-heading)] mb-4">{lang === "தமிழ்" ? "விரைவு இணைப்புகள்" : "Quick Links"}</h2>
              <div className="space-y-3">
                <a href="/student/leave" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-[var(--border)] hover:border-red-500/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-red-500" />
                    <span className="text-xs text-[var(--text-main)] group-hover:text-[var(--text-heading)]">{lang === "தமிழ்" ? "விடுப்பு அறிக்கைகள் & விண்ணப்பம்" : "Leave Reports & Application"}</span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] group-hover:text-red-500">{lang === "தமிழ்" ? "பார் →" : "View →"}</span>
                </a>
                <a href="/student/health" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-[var(--border)] hover:border-red-500/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
                  <div className="flex items-center gap-3">
                    <HeartPulse className="h-5 w-5 text-red-500" />
                    <span className="text-xs text-[var(--text-main)] group-hover:text-[var(--text-heading)]">{lang === "தமிழ்" ? "எனது சுகாதார அறிக்கை" : "My Health Report"}</span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] group-hover:text-red-500">{lang === "தமிழ்" ? "பார் →" : "View →"}</span>
                </a>
              </div>
            </div>
          </>
        }
      />
    </PortalLayout>
  );
}
