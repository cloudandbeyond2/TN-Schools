"use client";
import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import PersonalKpiStrip from "@/components/kpi/PersonalKpiStrip";
import StudentDailyOverview from "@/components/student/StudentDailyOverview";
import { useSession } from "next-auth/react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import Link from "next/link";
import { FileText, HeartPulse } from "lucide-react";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

const mapStreamToGroup = (stream: string): string => {
  const s = String(stream || "").toLowerCase();
  if (s.includes("science & math") || s.includes("computer science")) return "ComputerScience";
  if (s.includes("commerce") || s.includes("accountancy")) return "Commerce";
  if (s.includes("arts") || s.includes("humanities")) return "Arts";
  if (s.includes("vocational")) return "Vocational";
  return "Science"; // default fallback
};

const streamKnowledgeEn = [
  {
    stream: "Pure Science & Bio",
    icon: "🧬",
    color: "text-pink-400",
    bgBorder: "border-pink-500/30 bg-pink-900/10",
    subjects: "Biology, Physics, Chemistry",
    aiFeature: "Virtual Anatomy Lab & Medical Assistant",
    projectIdea: "Local Flora & Fauna DNA Mapping",
  },
  {
    stream: "Computer Science & Math",
    icon: "💻",
    color: "text-indigo-400",
    bgBorder: "border-indigo-500/30 bg-indigo-900/10",
    subjects: "Computer Science, Math, Physics",
    aiFeature: "AI Code Reviewer & JEE Mock Engine",
    projectIdea: "Build a School Management API",
  },
  {
    stream: "Commerce & Accountancy",
    icon: "📈",
    color: "text-emerald-400",
    bgBorder: "border-emerald-500/30 bg-emerald-900/10",
    subjects: "Accountancy, Commerce, Economics",
    aiFeature: "AI Financial Forecaster (CA Prep)",
    projectIdea: "Virtual Stock Portfolio Analysis",
  },
  {
    stream: "Arts & Humanities",
    icon: "🏛️",
    color: "text-amber-400",
    bgBorder: "border-amber-500/30 bg-amber-900/10",
    subjects: "History, Geography, Political Science",
    aiFeature: "Historical Source Analyzer & Civil Services Guide",
    projectIdea: "Mock UN Assembly Debate & Policy Draft",
  },
  {
    stream: "Vocational Education",
    icon: "🔧",
    color: "text-rose-400",
    bgBorder: "border-rose-500/30 bg-rose-900/10",
    subjects: "Basic Electrical, Agriculture Science, Office Management",
    aiFeature: "Skill Simulator & Trade Skill Evaluator",
    projectIdea: "Smart Home Automated Circuit Design",
  },
];

const streamKnowledgeTa = [
  {
    stream: "தூய அறிவியல் & உயிரியல்",
    icon: "🧬",
    color: "text-pink-400",
    bgBorder: "border-pink-500/30 bg-pink-900/10",
    subjects: "உயிரியல், இயற்பியல், வேதியியல்",
    aiFeature: "மெய்நிகர் உடற்கூறியல் ஆய்வகம் & மருத்துவ உதவியாளர்",
    projectIdea: "உள்ளூர் தாவரங்கள் & விலங்கினங்கள் DNA வரைபடம்",
  },
  {
    stream: "கணிப்பொறி அறிவியல் & கணிதம்",
    icon: "💻",
    color: "text-indigo-400",
    bgBorder: "border-indigo-500/30 bg-indigo-900/10",
    subjects: "கணிப்பொறி அறிவியல், கணிதம், இயற்பியல்",
    aiFeature: "AI குறியீடு மதிப்பாய்வாளர் & JEE மாதிரி எஞ்சின்",
    projectIdea: "பள்ளி மேலாண்மை API உருவாக்குதல்",
  },
  {
    stream: "வணிகவியல் & கணக்குப்பதிவியல்",
    icon: "📈",
    color: "text-emerald-400",
    bgBorder: "border-emerald-500/30 bg-emerald-900/10",
    subjects: "கணக்குப்பதிவியல், வணிகவியல், பொருளாதாரம்",
    aiFeature: "AI நிதி முன்னறிவிப்பாளர் (CA பயிற்சி)",
    projectIdea: "மெய்நிகர் பங்குச் சந்தை பகுப்பாய்வு",
  },
  {
    stream: "கலை & மனிதநேயம்",
    icon: "🏛️",
    color: "text-amber-400",
    bgBorder: "border-amber-500/30 bg-amber-900/10",
    subjects: "வரலாறு, புவியியல், அரசியல் அறிவியல்",
    aiFeature: "வரலாற்று மூலப் பகுப்பாய்வாளர் & சிவில் சர்வீசஸ் வழிகாட்டி",
    projectIdea: "மாதிரி ஐ.நா சபை விவாதம் & கொள்கை வரைவு",
  },
  {
    stream: "தொழிற்கல்வி",
    icon: "🔧",
    color: "text-rose-400",
    bgBorder: "border-rose-500/30 bg-rose-900/10",
    subjects: "அடிப்படை மின்சாரவியல், வேளாண் அறிவியல், அலுவலக மேலாண்மை",
    aiFeature: "திறன் உருவகப்படுத்துதல் & தொழில் திறன் மதிப்பீட்டாளர்",
    projectIdea: "ஸ்மார்ட் ஹோம் தானியங்கி சுற்று வடிவமைப்பு",
  },
];

export default function HigherSecondaryDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const { lang } = usePortalLanguage();
  const [student, setStudent] = useState<any>(null);
  const [todayProgress, setTodayProgress] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Load Student Profile — wait for session to resolve to avoid using wrong student on refresh
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

  // 2. Load Dashboard Summaries & Live Stats
  useEffect(() => {
    if (!student?.id) return;
    setLoading(true);
    fetch(`${API_BASE}/api/students/${student.id}/dashboard-summary`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setSummary(json.data);

          // Automatically sync sidebar when dashboard loads
          const dbStream = json.data.stream;
          const group = mapStreamToGroup(dbStream);
          localStorage.setItem("studentGroup", group);
          window.dispatchEvent(new Event("studentGroupChange"));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [student]);

  // 3. Load Library Progress
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
  const currentStream = summary?.stream || "Pure Science & Bio";
  const subtitle = student
    ? (lang === "தமிழ்"
      ? `வரவேற்கிறோம், ${userName} · வகுப்பு ${student.class}${student.section} · ${currentStream} பிரிவு`
      : `Welcome, ${userName} · Class ${student.class}${student.section} · ${currentStream} Stream`)
    : (lang === "தமிழ்" ? "மாணவர் தரவு ஏற்றப்படுகிறது..." : "Loading student data...");

  const streamKnowledge = lang === "தமிழ்" ? streamKnowledgeTa : streamKnowledgeEn;

  // Dynamic KPI lists
  const kpis = [
    { label: lang === "தமிழ்" ? "மேல்நிலை பொதுத் தேர்வு" : "HSC Board Exam", value: lang === "தமிழ்" ? "62 நாட்கள்" : "62 Days", icon: "⏳", color: "text-purple-400", sub: lang === "தமிழ்" ? "தேர்வு மார்ச் 5 அன்று தொடங்குகிறது" : "Exam starts Mar 5" },
    { label: lang === "தமிழ்" ? "பாடப்பிரிவு பாதை" : "Stream Track", value: currentStream.split(" ")[0], icon: "🩺", color: "text-pink-400", sub: lang === "தமிழ்" ? "இலக்கு: முன்னணி கல்லூரிகள்" : "Target: Top Colleges" },
    { label: lang === "தமிழ்" ? "ஒட்டுமொத்த சராசரி" : "Overall Average", value: summary ? `${summary.overallAvg}%` : "80%", icon: "📊", color: "text-blue-400", sub: lang === "தமிழ்" ? "வகுப்பறை தேர்வுகளின் அடிப்படையில்" : "Based on classroom tests" },
    { label: lang === "தமிழ்" ? "பதிவுசெய்யப்பட்ட தேர்வுகள்" : "Tests Logged", value: summary ? `${summary.testsCount}` : "0", icon: "📝", color: "text-amber-400", sub: lang === "தமிழ்" ? "நேரலையில் புதுப்பிக்கப்பட்டது" : "Updated real-time" },
  ];

  return (
    <PortalLayout subtitle={subtitle}>
      {/* Real academic-year KPIs */}
      <PersonalKpiStrip studentId={(session?.user as any)?.studentId || student?.id || null} />

      {/* Daily timetable, homework, exams, attendance, announcements & AI suggestions + Stream Mastery */}
      <StudentDailyOverview 
        extraLeft={
          <div className="space-y-4">
            {/* Stream Mastery Matrix */}
            <div className="glass rounded-2xl p-6 fade-in-2 border border-[var(--border)] h-fit relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      {lang === "தமிழ்" ? "பாடப்பிரிவு சிறப்பியல்பு" : "Stream Mastery Matrix"}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-[var(--text-heading)] mt-1 flex items-center gap-2">
                    {currentStream}
                  </h2>
                </div>
                <Link 
                  href="/student/academic-history" 
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 transition-all border border-purple-500/30 flex items-center gap-1 group shadow-sm"
                >
                  <span>{lang === "தமிழ்" ? "கல்விப் பயணத்தைப் பார்" : "Academic Journey"}</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {summary?.subjects?.slice(0, 6).map((s: any) => {
                  const statusTag = s.progress >= 85 
                    ? { label: lang === "தமிழ்" ? "சிறந்த நிலை" : "Mastered", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" }
                    : s.progress >= 75 
                    ? { label: lang === "தமிழ்" ? "நன்றாக உள்ளது" : "On Track", color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20" }
                    : { label: lang === "தமிழ்" ? "பயிற்சி தேவை" : "Needs Focus", color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20" };

                  return (
                    <div 
                      key={s.name} 
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-[var(--border)] hover:border-purple-500/40 transition-all group relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800/80 border border-[var(--border)] flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform">
                            {s.icon}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-[var(--text-heading)] group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">{s.name}</h3>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${statusTag.color}`}>
                              {statusTag.label}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-[var(--text-heading)]">{s.progress}%</span>
                        </div>
                      </div>

                      <div className="w-full bg-slate-200 dark:bg-slate-800/80 h-2 rounded-full overflow-hidden p-0.5 border border-[var(--border)]">
                        <div 
                          className="h-full rounded-full transition-all duration-500 relative" 
                          style={{ width: `${s.progress}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}dd)` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {(!summary?.subjects || summary.subjects.length === 0) && (
                  <div className="sm:col-span-2 py-8 text-center text-xs text-[var(--text-muted)] animate-pulse">
                    {lang === "தமிழ்" ? "பாடங்கள் ஏற்றப்படுகின்றன..." : "Loading subject matrix..."}
                  </div>
                )}
              </div>
            </div>

            {/* Test Performance Hub */}
            <div className="glass rounded-2xl p-5 border border-purple-500/30 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
              <h2 className="text-sm font-bold text-[var(--text-heading)] mb-4 flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">📝</span> 
                {lang === "தமிழ்" ? "தேர்வு செயல்திறன் மையம்" : "Test Performance Hub"}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {summary?.recentTests?.slice(0, 6).map((t: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-[var(--border)] flex justify-between items-center hover:border-purple-500/40 transition-colors">
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-heading)] max-w-[150px] truncate">{t.test}</h4>
                      <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">{t.status}</span>
                    </div>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                      t.status === "excellent" 
                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
                        : t.status === "good" 
                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20" 
                        : "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
                    }`}>
                      {t.score}
                    </span>
                  </div>
                ))}
                {(!summary?.recentTests || summary.recentTests.length === 0) && (
                  <p className="text-xs text-[var(--text-muted)] py-4 text-center">{lang === "தமிழ்" ? "வகுப்பறையில் இதுவரை தேர்வுகள் எதுவும் பதிவாகவில்லை." : "No tests recorded in classroom yet."}</p>
                )}
              </div>
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

            {/* Quick Links / Student Tools */}
            <div className="glass rounded-2xl p-5 border border-[var(--border)]">
              <h2 className="text-sm font-bold text-[var(--text-heading)] mb-4">{lang === "தமிழ்" ? "விரைவு இணைப்புகள்" : "Quick Links"}</h2>
              <div className="space-y-3">
                <a href="/student/leave" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-[var(--border)] hover:border-purple-500/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-purple-500" />
                    <span className="text-xs text-[var(--text-main)] group-hover:text-[var(--text-heading)]">{lang === "தமிழ்" ? "விடுப்பு அறிக்கைகள் & விண்ணப்பம்" : "Leave Reports & Application"}</span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] group-hover:text-purple-500">{lang === "தமிழ்" ? "பார் →" : "View →"}</span>
                </a>
                <a href="/student/health" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-[var(--border)] hover:border-purple-500/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
                  <div className="flex items-center gap-3">
                    <HeartPulse className="h-5 w-5 text-purple-500" />
                    <span className="text-xs text-[var(--text-main)] group-hover:text-[var(--text-heading)]">{lang === "தமிழ்" ? "எனது சுகாதார அறிக்கை" : "My Health Report"}</span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] group-hover:text-purple-500">{lang === "தமிழ்" ? "பார் →" : "View →"}</span>
                </a>
              </div>
            </div>
          </>
        }
      />


    </PortalLayout>
  );
}
