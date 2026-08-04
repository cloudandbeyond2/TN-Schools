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

  const [celebrations, setCelebrations] = useState<any[]>([]);
  const [pressArticles, setPressArticles] = useState<any[]>([]);

  // 4. Load Celebrations & School Press
  useEffect(() => {
    const schoolId = (session?.user as any)?.schoolId || student?.schoolId;
    if (!schoolId) return;

    fetch(`${API_BASE}/api/celebrations?schoolId=${schoolId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCelebrations(json.data);
        }
      })
      .catch((err) => console.error("Failed to load celebrations:", err));

    fetch(`${API_BASE}/api/teacher/school-press?schoolId=${schoolId}&approvedOnly=true`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setPressArticles(json.data);
        }
      })
      .catch((err) => console.error("Failed to load school press:", err));
  }, [session, student]);

  const defaultCelebrations = [
    {
      id: "def-1",
      title: lang === "தமிழ்" ? "சுதந்திர தின அமுதப் பெருவிழா 2026" : "Independence Day Grand Celebration 2026",
      date: "2026-08-15",
      description: lang === "தமிழ்" ? "தேசிய கொடியேற்றம், அணிவகுப்பு மற்றும் கலாச்சார கலைநிகழ்ச்சிகள்." : "Flag hoisting, parade & cultural performances at school grounds.",
      badge: lang === "தமிழ்" ? "நிகழ்ச்சி" : "Event",
    },
    {
      id: "def-2",
      title: lang === "தமிழ்" ? "மாநில அளவிலான அறிவியல் மற்றும் கணிதக் கண்காட்சி" : "State Science & Math Exhibition",
      date: "2026-09-05",
      description: lang === "தமிழ்" ? "மாணவர்களின் புதுமையான AI மற்றும் அறிவியல் மாதிரிகள் காட்சிப்படுத்தப்படும்." : "Innovative AI & STEM models presented by students.",
      badge: lang === "தமிழ்" ? "கண்காட்சி" : "Expo",
    },
    {
      id: "def-3",
      title: lang === "தமிழ்" ? "ஆண்டு விளையாட்டுப் போட்டி மற்றும் கலை விழா" : "Annual Sports Meet & Cultural Fest",
      date: "2026-10-20",
      description: lang === "தமிழ்" ? "விளையாட்டுப் போட்டிகள், பாரம்பரிய நடனங்கள் மற்றும் விருது வழங்கும் விழா." : "Inter-house athletics, traditional dance & award ceremony.",
      badge: lang === "தமிழ்" ? "விளையாட்டு" : "Sports",
    },
  ];

  const defaultPressItems = [
    {
      id: "press-1",
      title: lang === "தமிழ்" ? "மாநில அறிவியல் போட்டியில் எமது பள்ளி 11-ம் வகுப்பு மாணவர்கள் முதலிடம்!" : "Class 11 Science Team Wins 1st Prize in State Innovation Contest",
      description: lang === "தமிழ்" ? "இயற்கை விவசாயம் பற்றிய AI மாதிரியை உருவாக்கி முதன்மை விருதை வென்றனர்." : "Developed an AI-driven sustainable farming prototype and bagged top honors.",
      category: lang === "தமிழ்" ? "சாதனை" : "Achievement",
      authorName: lang === "தமிழ்" ? "பள்ளி செய்தி இதழ் குழு" : "School Media Club",
      createdAt: "2026-07-28",
    },
    {
      id: "press-2",
      title: lang === "தமிழ்" ? "வருடாந்திர பள்ளி காலாண்டு செய்தி இதழ் 'TN Spectrum' 2026 வெளியீடு" : "Quarterly School Press Magazine 'TN Spectrum 2026' Released",
      description: lang === "தமிழ்" ? "மாணவர்களின் சிறுகதைகள், ஓவியங்கள் மற்றும் கல்வி சாதனைகள் இடம்பெற்றுள்ளன." : "Featuring top student articles, poetry, artwork & academic milestones.",
      category: lang === "தமிழ்" ? "செய்தி இதழ்" : "Newsletter",
      authorName: lang === "தமிழ்" ? "தமிழ்ப் பேரவை & பதிப்பகம்" : "Editorial Board",
      createdAt: "2026-07-20",
    },
    {
      id: "press-3",
      title: lang === "தமிழ்" ? "தேசிய கணித ஒலிம்பியாட் தேர்வில் 15 மாணவர்கள் தகுதி சாதனை" : "15 Students Qualify for National Mathematics Olympiad Finals",
      description: lang === "தமிழ்" ? "சிறப்புப் பயிற்சி வகுப்புகளின் மூலம் மாணவர்கள் சிறந்த மதிப்பெண்களைப் பெற்றுள்ளனர்." : "Recognized for exceptional analytical skills and top percentile scores.",
      category: lang === "தமிழ்" ? "கல்வி சாதனை" : "Academic Honor",
      authorName: lang === "தமிழ்" ? "கணிதத் துறை" : "Mathematics Dept",
      createdAt: "2026-07-15",
    },
  ];

  return (
    <PortalLayout subtitle={subtitle}>
      {/* Real academic-year KPIs */}
      <PersonalKpiStrip studentId={(session?.user as any)?.studentId || student?.id || null} />

      {/* Daily timetable, homework, exams, attendance, announcements & AI suggestions + Celebrations & School Press */}
      <StudentDailyOverview 
        extraLeft={
          <div className="space-y-4">
            {/* 1. Celebrations Card */}
            <div className="glass rounded-2xl p-6 fade-in-2 border border-purple-500/20 shadow-sm relative overflow-hidden text-left">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center text-base shadow-inner">
                    <i className="fi fi-rr-party-horn" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        {lang === "தமிழ்" ? "கொண்டாட்டங்கள் & நிகழ்வுகள்" : "Celebrations & Events"}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-[var(--text-heading)] mt-0.5">
                      {lang === "தமிழ்" ? "பள்ளி கொண்டாட்டங்கள் மற்றும் விழாக்கள்" : "School Celebrations & Festivals"}
                    </h2>
                  </div>
                </div>
                <Link 
                  href="/student/celebrations" 
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 transition-all border border-purple-500/30 flex items-center gap-1 group shadow-sm"
                >
                  <span>{lang === "தமிழ்" ? "அனைத்தும் காண்" : "View All"}</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
              </div>
 
              <div className="space-y-3">
                {(celebrations.length > 0 ? celebrations.slice(0, 3) : defaultCelebrations).map((c: any) => {
                  const d = c.date ? new Date(c.date) : new Date();
                  const monthStr = d.toLocaleDateString(lang === "தமிழ்" ? "ta-IN" : "en-US", { month: "short" }).toUpperCase();
                  const dayStr = d.getDate();
 
                  return (
                    <div 
                      key={c.id || c.title} 
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-purple-500/5 border border border-[var(--border)] hover:border-purple-500/30 transition-all group flex items-start gap-3.5"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col items-center justify-center text-purple-600 dark:text-purple-300 group-hover:scale-105 transition-transform">
                        <span className="text-[10px] font-black uppercase tracking-wider">{monthStr}</span>
                        <span className="text-base font-black leading-tight">{dayStr}</span>
                      </div>
 
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-xs font-bold text-[var(--text-heading)] group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors truncate">
                            {c.title}
                          </h3>
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 ml-auto flex-shrink-0">
                            {c.badge || c.type || (lang === "தமிழ்" ? "நிகழ்ச்சி" : "Event")}
                          </span>
                        </div>
                        {c.description && (
                          <p className="text-[11px] text-[var(--text-muted)] line-clamp-1">
                            {c.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
 
            {/* 2. School Press Card */}
            <div className="glass rounded-2xl p-6 fade-in-2 border border-emerald-500/20 shadow-sm relative overflow-hidden text-left">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-base shadow-inner">
                    <i className="fi fi-rr-document-signed" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {lang === "தமிழ்" ? "பள்ளி செய்தி இதழ்" : "School Press & Media"}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-[var(--text-heading)] mt-0.5">
                      {lang === "தமிழ்" ? "பள்ளி செய்திகள் மற்றும் சாதனைகள்" : "Campus News & Achievements"}
                    </h2>
                  </div>
                </div>
                <Link 
                  href="/student/school-press" 
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 transition-all border border-emerald-500/30 flex items-center gap-1 group shadow-sm"
                >
                  <span>{lang === "தமிழ்" ? "செய்தி இதழ் காண்" : "Press Feed"}</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
              </div>
 
              <div className="space-y-3">
                {(pressArticles.length > 0 ? pressArticles.slice(0, 3) : defaultPressItems).map((p: any) => {
                  const dateStr = p.createdAt ? new Date(p.createdAt).toLocaleDateString(lang === "தமிழ்" ? "ta-IN" : "en-US", { month: "short", day: "numeric" }) : "";
 
                  return (
                    <div 
                      key={p.id || p.title} 
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-emerald-500/5 border border border-[var(--border)] hover:border-emerald-500/30 transition-all group relative overflow-hidden text-left"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {p.category || (lang === "தமிழ்" ? "செய்தி" : "News")}
                        </span>
                        {dateStr && (
                          <span className="text-[10px] text-[var(--text-muted)] font-medium">
                            {dateStr}
                          </span>
                        )}
                      </div>
 
                      <h3 className="text-xs font-bold text-[var(--text-heading)] group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors mb-1 line-clamp-1">
                        {p.title}
                      </h3>
 
                      <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 mb-2">
                        {p.description || p.content}
                      </p>
 
                      <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-2 border-t border border-[var(--border)]">
                        <span className="font-semibold text-emerald-600/80 dark:text-emerald-400/80 inline-flex items-center gap-1">
                          <i className="fi fi-rr-edit" /> {p.authorName || p.student?.user?.name || (lang === "தமிழ்" ? "மாணவர் செய்தி குழு" : "Student Reporter")}
                        </span>
                        <span className="group-hover:translate-x-0.5 transition-transform text-emerald-600 dark:text-emerald-400 font-bold">
                          {lang === "தமிழ்" ? "படிக்க →" : "Read →"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        }
        extraRight={
          <>
            {/* Today's Learning Progress Card */}
            <div className="glass rounded-2xl p-5 border border border-[var(--border)]">
              <h2 className="text-sm font-bold text-[var(--text-heading)] mb-4 flex items-center gap-2 text-left">
                <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center">
                  <i className="fi fi-rr-clock text-xs flex items-center" />
                </span> 
                {lang === "தமிழ்" ? "இன்றைய படிப்பு முன்னேற்றம்" : "Today's Study Progress"}
              </h2>
              {todayProgress ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 bg-slate-100/70 dark:bg-slate-950/60 p-3 rounded-xl border border border-[var(--border)]">
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
                        <div key={r.resourceId} className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border border-[var(--border)] text-left space-y-1 hover:border-indigo-500/30 transition-colors">
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
            <div className="glass rounded-2xl p-5 border border border-[var(--border)] text-left">
              <h2 className="text-sm font-bold text-[var(--text-heading)] mb-4">{lang === "தமிழ்" ? "விரைவு இணைப்புகள்" : "Quick Links"}</h2>
              <div className="space-y-3">
                <a href="/student/leave" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border border-[var(--border)] hover:border-purple-500/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-purple-500" />
                    <span className="text-xs text-[var(--text-main)] group-hover:text-[var(--text-heading)]">{lang === "தமிழ்" ? "விடுப்பு அறிக்கைகள் & விண்ணப்பம்" : "Leave Reports & Application"}</span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] group-hover:text-purple-500">{lang === "தமிழ்" ? "பார் →" : "View →"}</span>
                </a>
                <a href="/student/health" className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border border-[var(--border)] hover:border-purple-500/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
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
