"use client";
import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import PersonalKpiStrip from "@/components/kpi/PersonalKpiStrip";
import StudentDailyOverview from "@/components/student/StudentDailyOverview";
import { useSession } from "next-auth/react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import Link from "next/link";

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
  const { data: session } = useSession();
  const { lang } = usePortalLanguage();
  const [student, setStudent] = useState<any>(null);
  const [todayProgress, setTodayProgress] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Load Student Profile
  useEffect(() => {
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
  }, [session]);

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
    if (!(session?.user as any)?.id) return;
    fetch(`${API_BASE}/api/digital-library/progress/today?studentId=${(session?.user as any)?.id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setTodayProgress(json.data);
      })
      .catch((err) => console.error("Failed to load today progress:", err));
  }, [session]);

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

      {/* Daily timetable, homework, exams, attendance, announcements & AI suggestions */}
      <StudentDailyOverview />

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi-card border border-slate-700 hover:border-purple-500/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{kpi.icon}</span>
              <span className={`text-xs font-medium ${kpi.color}`}>{kpi.sub}</span>
            </div>
            <div className={`text-3xl font-bold ${kpi.color} mb-1`}>{kpi.value}</div>
            <div className="text-xs text-slate-400">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Subject Progress */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 fade-in-2 border border-slate-700/50">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white">{lang === "தமிழ்" ? `பாடப்பிரிவு சிறப்பு: ${currentStream}` : `Stream Specialization: ${currentStream}`}</h2>
            <Link href="/student/academic-history" className="text-xs text-purple-400 hover:text-purple-300">{lang === "தமிழ்" ? "கல்விப் பயணத்தைப் பார் →" : "View Academic Journey →"}</Link>
          </div>
          <div className="space-y-4">
            {summary?.subjects?.map((s: any) => (
              <div key={s.name} className="flex items-center gap-4">
                <div className="text-xl w-8">{s.icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-300 font-medium">{s.name}</span>
                    <span className="text-slate-400">{s.progress}%</span>
                  </div>
                  <div className="progress-bar bg-slate-800">
                    <div className="progress-fill" style={{ width: `${s.progress}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}aa)` }} />
                  </div>
                </div>
              </div>
            ))}
            {(!summary?.subjects || summary.subjects.length === 0) && (
              <p className="text-xs text-slate-500 py-4 text-center">{lang === "தமிழ்" ? "பாடங்கள் ஏற்றப்படுகின்றன..." : "Loading subjects..."}</p>
            )}
          </div>
        </div>

        {/* Right sidebars */}
        <div className="space-y-6">

          {/* Today's Learning Progress Card */}
          <div className="glass rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <span>⏱️</span> {lang === "தமிழ்" ? "இன்றைய படிப்பு முன்னேற்றம்" : "Today's Study Progress"}
            </h2>
            {todayProgress ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-left">
                    <div className="text-[10px] text-slate-500 uppercase font-black">{lang === "தமிழ்" ? "இன்று பதிவான நேரம்" : "Logged Today"}</div>
                    <div className="text-xl font-extrabold text-indigo-400">{todayProgress.totalTimeSpentMinutes} {lang === "தமிழ்" ? "நிமி" : "mins"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-black">{lang === "தமிழ்" ? "படித்தவை" : "Resources Studied"}</div>
                    <div className="text-xl font-extrabold text-emerald-400">{todayProgress.activeCount}</div>
                  </div>
                </div>

                {todayProgress.recentResources && todayProgress.recentResources.length > 0 ? (
                  <div className="space-y-2.5">
                    <div className="text-[10px] text-slate-500 uppercase font-black text-left font-sans">{lang === "தமிழ்" ? "சமீபத்திய செயல்பாடு" : "Recent Activity"}</div>
                    {todayProgress.recentResources.slice(0, 3).map((r: any) => (
                      <div key={r.resourceId} className="bg-slate-900/30 p-2.5 rounded-xl border border-slate-800/60 text-left space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-200 truncate max-w-[70%]">{r.resourceTitle}</span>
                          <span className="text-[9px] font-black text-indigo-400">{r.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${r.progressPercent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-2 text-center">{lang === "தமிழ்" ? "இன்று இன்னும் படிப்பு நடவடிக்கை ஏதும் பதிவாகவில்லை." : "No study activity logged today yet."}</p>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center">{lang === "தமிழ்" ? "முன்னேற்றம் ஏற்றப்படுகிறது..." : "Loading progress..."}</div>
            )}
          </div>

          {/* Test Performance Hub */}
          <div className="glass rounded-2xl p-6 border border-purple-500/30 bg-gradient-to-br from-indigo-900/20 to-purple-900/20">
            <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-indigo-400">📝</span> {lang === "தமிழ்" ? "தேர்வு செயல்திறன் மையம்" : "Test Performance Hub"}
            </h2>

            <div className="space-y-3">
              {summary?.recentTests?.map((t: any, idx: number) => (
                <div key={idx} className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-white max-w-[150px] truncate">{t.test}</h4>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{t.status}</span>
                  </div>
                  <span className={`text-xs font-black ${t.status === "excellent" ? "text-emerald-400" : t.status === "good" ? "text-indigo-400" : "text-amber-400"}`}>
                    {t.score}
                  </span>
                </div>
              ))}
              {(!summary?.recentTests || summary.recentTests.length === 0) && (
                <p className="text-xs text-slate-500 py-4 text-center">{lang === "தமிழ்" ? "வகுப்பறையில் இதுவரை தேர்வுகள் எதுவும் பதிவாகவில்லை." : "No tests recorded in classroom yet."}</p>
              )}
            </div>
          </div>

        </div>
      </div>


    </PortalLayout>
  );
}
