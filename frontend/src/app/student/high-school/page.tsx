"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
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
  const { data: session } = useSession();
  const { lang } = usePortalLanguage();
  const [student, setStudent] = useState<any>(null);

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

  const [todayProgress, setTodayProgress] = useState<any>(null);

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

  const mockTestScoresList = [
    { test: lang === "தமிழ்" ? "இடைப்பருவம்: கணிதம்" : "Midterm: Math", score: "62/100", status: "needs-work" },
    { test: lang === "தமிழ்" ? "இடைப்பருவம்: அறிவியல்" : "Midterm: Science", score: "80/100", status: "good" },
    { test: lang === "தமிழ்" ? "அலகு 4: தமிழ்" : "Unit 4: Tamil", score: "90/100", status: "excellent" },
  ];

  return (
    <PortalLayout subtitle={subtitle}>
      {/* Real academic-year KPIs */}
      <PersonalKpiStrip studentId={(session?.user as any)?.studentId || null} />

      {/* Daily timetable, homework, exams, attendance, announcements & AI suggestions */}
      <StudentDailyOverview />

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi-card border border-slate-700 hover:border-red-500/50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
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
            <h2 className="text-base font-semibold text-white">{lang === "தமிழ்" ? "பாடத் தயார்நிலை" : "Subject Readiness"}</h2>
            <button className="text-xs text-red-400 hover:text-red-300">{lang === "தமிழ்" ? "பகுப்பாய்வைப் பார் →" : "View Analytics →"}</button>
          </div>
          <div className="space-y-4">
            {subjectsList.map((s) => (
              <div key={s.name} className="flex items-center gap-4">
                <div className="text-xl w-8">
                  <s.icon className="h-5 w-5" style={{ color: s.color }} />
                </div>
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
          </div>
        </div>

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

          {/* AI Weakness Detector */}
          <div className="glass rounded-2xl p-6 fade-in-3 border border-red-500/30 bg-red-900/10">
            <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-500 animate-pulse" /> {lang === "தமிழ்" ? "AI குறைபாடு எச்சரிக்கை" : "AI Weakness Alert"}
            </h2>
            <p className="text-sm text-slate-300 mb-4">
              {lang === "தமிழ்"
                ? "உங்கள் சமீபத்திய மதிப்பெண்கள் கணிதத்தில் (இயற்கணிதம்) சரிவைக் காட்டுகின்றன. உங்கள் மதிப்பெண்ணை உயர்த்த 3 நாள் சிறப்பு படிப்புத் திட்டத்தை உருவாக்கியுள்ளோம்."
                : <>Your recent scores show a drop in <strong className="text-red-400">Mathematics (Algebra)</strong>. We have generated a custom 3-day study plan to boost your score.</>}
            </p>
            <button className="w-full py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 font-medium text-sm transition-colors border border-red-500/50">
              {lang === "தமிழ்" ? "இயற்கணித பூஸ்ட் திட்டத்தைத் தொடங்கு" : "Start Algebra Boost Plan"}
            </button>
          </div>

          {/* Recent Mock Tests */}
          <div className="glass rounded-2xl p-6 fade-in-4 border border-slate-700/50">
            <h2 className="text-base font-semibold text-white mb-4">{lang === "தமிழ்" ? "சமீபத்திய மாதிரித் தேர்வுகள்" : "Recent Mock Tests"}</h2>
            <div className="space-y-3">
              {mockTestScoresList.map((m, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                  <span className="text-sm text-slate-300">{m.test}</span>
                  <span className={`text-sm font-mono font-bold ${
                    m.status === 'needs-work' ? 'text-red-400' : m.status === 'good' ? 'text-blue-400' : 'text-emerald-400'
                  }`}>
                    {m.score}
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-4 text-xs text-center w-full text-slate-400 hover:text-white">{lang === "தமிழ்" ? "அனைத்து முடிவுகளையும் பார் →" : "View All Results →"}</button>
          </div>

          {/* Quick Links / Student Tools */}
          <div className="glass rounded-2xl p-6 fade-in-5 border border-slate-700/50">
            <h2 className="text-base font-semibold text-white mb-4">{lang === "தமிழ்" ? "விரைவு இணைப்புகள்" : "Quick Links"}</h2>
            <div className="space-y-3">
              <a href="/student/leave" className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-red-500/50 hover:bg-slate-800 transition-all group">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-red-400" />
                  <span className="text-sm text-slate-300 group-hover:text-white">{lang === "தமிழ்" ? "விடுப்பு அறிக்கைகள் & விண்ணப்பம்" : "Leave Reports & Application"}</span>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-red-400">{lang === "தமிழ்" ? "பார் →" : "View →"}</span>
              </a>
              <a href="/student/health" className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-red-500/50 hover:bg-slate-800 transition-all group">
                <div className="flex items-center gap-3">
                  <HeartPulse className="h-5 w-5 text-red-400" />
                  <span className="text-sm text-slate-300 group-hover:text-white">{lang === "தமிழ்" ? "எனது சுகாதார அறிக்கை" : "My Health Report"}</span>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-red-400">{lang === "தமிழ்" ? "பார் →" : "View →"}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
