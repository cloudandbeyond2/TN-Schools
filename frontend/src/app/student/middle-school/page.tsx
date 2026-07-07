// import PortalLayout from "@/components/PortalLayout";


// const subjects = [
//   { name: "Mathematics", progress: 85, color: "#6366f1", icon: "🧮" },
//   { name: "Science Explorer", progress: 70, color: "#10b981", icon: "🌱" },
//   { name: "Tamil", progress: 92, color: "#f59e0b", icon: "🗣️" },
//   { name: "English", progress: 80, color: "#3b82f6", icon: "✍️" },
//   { name: "Social Science", progress: 60, color: "#ec4899", icon: "🌍" },
// ];

// const recentActivity = [
//   { subject: "Mathematics", activity: "Completed 'Fractions Game'", score: "100%", time: "2 hrs ago", status: "green" },
//   { subject: "Science Explorer", activity: "Watched 'Plant Life' Video", score: "—", time: "Yesterday", status: "green" },
//   { subject: "Tamil", activity: "Story Reading", score: "20 min", time: "2 days ago", status: "blue" },
// ];

// export default function MiddleSchoolDashboard() {
//   return (
//     <PortalLayout>
//       {/* KPI Row */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
//         {[
//           { label: "Attendance Star", value: "98%", icon: "⭐", color: "text-amber-400", sub: "Perfect this week!" },
//           { label: "Learning Points", value: "1,250", icon: "🏆", color: "text-emerald-400", sub: "+50 today" },
//           { label: "Quizzes Passed", value: "12", icon: "🎯", color: "text-blue-400", sub: "2 pending" },
//           { label: "Reading Time", value: "5 Hrs", icon: "📖", color: "text-purple-400", sub: "This week" },
//         ].map((kpi) => (
//           <div key={kpi.label} className="kpi-card bg-gradient-to-b from-slate-800/80 to-slate-900/80 border-2 border-emerald-500/20 hover:border-emerald-500/50 transition-all">
//             <div className="flex items-center justify-between mb-3">
//               <span className="text-3xl">{kpi.icon}</span>
//               <span className={`text-xs font-bold ${kpi.color}`}>{kpi.sub}</span>
//             </div>
//             <div className={`text-4xl font-extrabold ${kpi.color} mb-1 drop-shadow-md`}>{kpi.value}</div>
//             <div className="text-sm font-semibold text-slate-400">{kpi.label}</div>
//           </div>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//         {/* Subject Progress */}
//         <div className="lg:col-span-2 glass rounded-3xl p-6 fade-in-2 border border-slate-700/50 shadow-2xl relative overflow-hidden">
//           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-xl font-bold text-white flex items-center gap-2">🚀 My Learning Journey</h2>
//             <button id="ms-view-all-subjects" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-4 py-2 rounded-xl">Explore All</button>
//           </div>
//           <div className="space-y-5">
//             {subjects.map((s) => (
//               <div key={s.name} className="flex items-center gap-5 p-3 rounded-2xl hover:bg-slate-800/50 transition-colors">
//                 <div className="text-3xl w-12 h-12 shrink-0 bg-slate-800 rounded-full flex items-center justify-center shadow-inner">{s.icon}</div>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex justify-between text-sm mb-2">
//                     <span className="text-slate-200 font-bold text-base">{s.name}</span>
//                     <span className="text-emerald-400 font-bold">{s.progress}%</span>
//                   </div>
//                   <div className="progress-bar h-3 rounded-full bg-slate-800 overflow-hidden">
//                     <div className="progress-fill h-full rounded-full relative" style={{ width: `${s.progress}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}aa)` }}>
//                       <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* AI Helper for Kids */}
//         <div className="glass rounded-3xl p-6 fade-in-3 flex flex-col border border-slate-700/50 shadow-2xl bg-gradient-to-b from-indigo-900/20 to-purple-900/20">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="w-12 h-12 shrink-0 bg-indigo-500 rounded-full flex items-center justify-center text-2xl animate-bounce shadow-lg shadow-indigo-500/30">🤖</div>
//             <h2 className="text-xl font-bold text-white">AI Learning Buddy</h2>
//           </div>
//           <div className="flex-1 bg-slate-900/80 rounded-2xl p-5 mb-5 text-sm text-indigo-200 italic border border-indigo-500/30 relative">
//             <div className="absolute -left-2 top-4 w-4 h-4 bg-slate-900/80 border-l border-b border-indigo-500/30 rotate-45" />
//             &quot;Hi Arjun! Want to learn why the sky is blue? Or maybe play a math game?&quot;
//           </div>
//           <div className="space-y-3">
//             {["Play a Math Game", "Tell me a Science Fact", "Help with Homework"].map((q) => (
//               <button
//                 key={q}
//                 className="w-full text-left text-sm font-semibold px-4 py-3 bg-indigo-500/10 rounded-xl text-indigo-300 hover:bg-indigo-500/30 hover:text-white hover:-translate-y-1 transition-all border border-indigo-500/30 shadow-sm"
//               >
//                 ✨ {q}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//     </PortalLayout>
//   );
"use client";
import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import PersonalKpiStrip from "@/components/kpi/PersonalKpiStrip";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Megaphone,
  Star,
  Trophy,
  Target,
  BookOpen,
  Calculator,
  Compass,
  Volume2,
  PenTool,
  Globe,
  FlaskConical,
  FileText,
  MessageSquare,
  Award,
  Sparkles,
  Rocket
} from "lucide-react";

const IconMap: Record<string, React.ComponentType<any>> = {
  Star,
  Trophy,
  Target,
  BookOpen,
  Calculator,
  Compass,
  Volume2,
  PenTool,
  Globe,
  FlaskConical,
  FileText,
  MessageSquare,
  Award,
  Sparkles,
  Rocket
};


const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

// Map badge label → icon & style
const BADGE_META: Record<string, { icon: string; color: string; rarity: string }> = {
  "🔬 Star Scientist":  { icon: "FlaskConical", color: "from-blue-500 to-indigo-600",   rarity: "Epic" },
  "📝 Homework Pro":   { icon: "FileText", color: "from-amber-500 to-orange-600",   rarity: "Rare" },
  "💬 Active Speaker": { icon: "MessageSquare", color: "from-emerald-500 to-teal-600",   rarity: "Rare" },
  "🌟 Mentor Star":    { icon: "Sparkles", color: "from-purple-500 to-fuchsia-600", rarity: "Epic" },
};

const subjects = [
  { name: "Mathematics", progress: 85, color: "#6366f1", icon: "Calculator" },
  { name: "Science Explorer", progress: 70, color: "#10b981", icon: "Compass" },
  { name: "Tamil", progress: 92, color: "#f59e0b", icon: "Volume2" },
  { name: "English", progress: 80, color: "#3b82f6", icon: "PenTool" },
  { name: "Social Science", progress: 60, color: "#ec4899", icon: "Globe" },
];

export default function MiddleSchoolDashboard() {
  const { data: session } = useSession();
  const [student, setStudent] = useState<any>(null);
  const [earnedBadges, setEarnedBadges] = useState<any[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [recentMarks, setRecentMarks] = useState<any[]>([]);
  const [loadingMarks, setLoadingMarks] = useState(true);

  useEffect(() => {
    if (session?.user) {
      const userId = (session.user as any).id;
      if (userId) {
        fetch(`${API_BASE}/api/notifications?userId=${userId}`)
          .then((res) => res.json())
          .then((json) => {
            if (json.success && Array.isArray(json.data)) {
              setNotifications(json.data.slice(0, 3)); // top 3
            }
          })
          .catch((err) => console.error(err))
          .finally(() => setLoadingNotifications(false));
      }
    }
    fetch(`${API_BASE}/api/students`)
      .then((res) => res.json())
      .then(async (json) => {
        if (json.success && json.data.length > 0) {
          const myStudent = (session?.user as any)?.id 
            ? json.data.find((s: any) => s.userId === (session?.user as any)?.id)
            : null;
          const activeStudent = myStudent || json.data[0];
          setStudent(activeStudent);

          if (activeStudent) {
            // Fetch student marks
            fetch(`${API_BASE}/api/students/${activeStudent.id}/marks`)
              .then((mRes) => mRes.json())
              .then((mJson) => {
                if (mJson.success && Array.isArray(mJson.data)) {
                  setRecentMarks(mJson.data.slice(0, 5));
                }
              })
              .catch((err) => console.error(err))
              .finally(() => setLoadingMarks(false));

            const schoolId = (session?.user as any)?.schoolId;
            const url = schoolId
              ? `${API_BASE}/api/teacher/badges?schoolId=${schoolId}`
              : `${API_BASE}/api/teacher/badges`;

            const bRes = await fetch(url);
            const bJson = await bRes.json();
            if (bJson.success) {
              const studentBadges = bJson.data.filter((b: any) => b.studentId === activeStudent.id);
              const shaped = studentBadges.map((b: any) => {
                const meta = BADGE_META[b.badge] || {
                  icon: "Award",
                  color: "from-slate-500 to-slate-700",
                  rarity: "Common",
                };
                return {
                  id: b.id,
                  name: b.badge,
                  icon: meta.icon,
                  color: meta.color,
                  rarity: meta.rarity,
                };
              });
              setEarnedBadges(shaped);
            }
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingBadges(false));
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

  const userName = session?.user?.name || student?.user?.name || "Student";
  const subtitle = student 
    ? `Welcome back, ${userName}! · Class ${student.class} ${student.section} · You have earned ${earnedBadges.length} ${earnedBadges.length === 1 ? "badge" : "badges"}!`
    : "Loading student data...";

  return (
    <PortalLayout subtitle={subtitle}>
      {/* Real academic-year KPIs */}
      <PersonalKpiStrip studentId={(session?.user as any)?.studentId || null} />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
        {[
          { label: "Attendance Star", value: "98%", icon: "Star", color: "text-amber-500 dark:text-amber-400", sub: "Perfect this week!" },
          { label: "Learning Points", value: "1,250", icon: "Trophy", color: "text-emerald-600 dark:text-emerald-400", sub: "+50 today" },
          { label: "Quizzes Passed", value: "12", icon: "Target", color: "text-blue-600 dark:text-blue-400", sub: "2 pending" },
          { label: "Reading Time", value: "5 Hrs", icon: "BookOpen", color: "text-purple-600 dark:text-purple-400", sub: "This week" },
        ].map((kpi) => {
          const Icon = IconMap[kpi.icon] || Star;
          return (
            <div key={kpi.label} className="kpi-card bg-gradient-to-b from-white to-slate-50 dark:from-slate-800/80 dark:to-slate-900/80 border-2 border-emerald-500/20 hover:border-emerald-500/50 transition-all flex flex-col justify-between p-4 sm:p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${kpi.color}`} />
                <span className={`text-[10px] sm:text-xs font-bold ${kpi.color}`}>{kpi.sub}</span>
              </div>
              <div>
                <div className={`text-2xl sm:text-3xl md:text-4xl font-extrabold ${kpi.color} mb-1 drop-shadow-md`}>{kpi.value}</div>
                <div className="text-xs sm:text-sm font-semibold text-black dark:text-white">{kpi.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Subject Progress */}
        <div className="lg:col-span-2 glass rounded-3xl p-4 sm:p-6 fade-in-2 border border-slate-200 dark:border-slate-700/50 shadow-2xl relative overflow-hidden bg-white dark:bg-transparent">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-black dark:text-white flex items-center gap-2">
              <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" /> My Learning Journey
            </h2>
            <button id="ms-view-all-subjects" className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-500/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl">Explore All</button>
          </div>
          <div className="space-y-4 sm:space-y-5">
            {subjects.map((s) => {
              const SubjectIcon = IconMap[s.icon] || BookOpen;
              return (
                <div key={s.name} className="flex items-center gap-4 sm:gap-5 p-2 sm:p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shadow-inner">
                    <SubjectIcon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                      <span className="text-black dark:text-white font-bold text-sm sm:text-base">{s.name}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm">{s.progress}%</span>
                    </div>
                    <div className="progress-bar h-2.5 sm:h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="progress-fill h-full rounded-full relative" style={{ width: `${s.progress}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}aa)` }}>
                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          {/* Today's Learning Progress Card */}
          <div className="glass rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
            <h2 className="text-lg sm:text-xl font-bold text-black dark:text-white mb-3 flex items-center gap-2">
              <span>⏱️</span> Today's Study Progress
            </h2>
            {todayProgress ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-left">
                    <div className="text-[10px] text-slate-500 uppercase font-black">Logged Today</div>
                    <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">{todayProgress.totalTimeSpentMinutes} mins</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-black">Resources Studied</div>
                    <div className="text-xl font-extrabold text-emerald-650 dark:text-emerald-400">{todayProgress.activeCount}</div>
                  </div>
                </div>

                {todayProgress.recentResources && todayProgress.recentResources.length > 0 ? (
                  <div className="space-y-2.5">
                    <div className="text-[10px] text-slate-500 uppercase font-black text-left font-sans">Recent Activity</div>
                    {todayProgress.recentResources.slice(0, 3).map((r: any) => (
                      <div key={r.resourceId} className="bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/60 text-left space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[70%]">{r.resourceTitle}</span>
                          <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400">{r.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${r.progressPercent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-505 dark:text-slate-500 italic py-2 text-center">No study activity logged today yet.</p>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center">Loading progress...</div>
            )}
          </div>

          {/* Recent Assessment Marks Card */}
          <div className="glass rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent text-left">
            <h2 className="text-lg sm:text-xl font-bold text-black dark:text-white mb-3 flex items-center gap-2">
              <span>🎯</span> Recent Assessment Marks
            </h2>
            {loadingMarks ? (
              <div className="text-xs text-slate-500 py-4 text-center">Loading marks...</div>
            ) : recentMarks.length > 0 ? (
              <div className="space-y-3">
                {recentMarks.map((m) => (
                  <div key={m.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-150 dark:border-slate-800">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">{m.subject}</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {m.examType.replace("Assessment: ", "")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">
                        {m.scored} / {m.maxMarks}
                      </div>
                      <div className="text-[9px] font-bold text-slate-400">
                        {new Date(m.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-505 dark:text-slate-500 italic">No assessments completed yet.</p>
                <Link href="/student/assessments" className="inline-block mt-3 text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:underline">
                  Take your first test →
                </Link>
              </div>
            )}
          </div>

          {/* Recent Notifications */}
          <div className="glass rounded-3xl p-4 sm:p-6 fade-in-3 flex flex-col border border-slate-200 dark:border-slate-700/50 shadow-2xl bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 text-left">
            <div className="flex items-center gap-3 mb-4">
              <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 animate-pulse" />
              <h2 className="text-lg sm:text-xl font-bold text-black dark:text-white">Recent Notifications</h2>
            </div>
            <div className="flex-1 space-y-3">
              {loadingNotifications ? (
                <div className="text-center py-8 text-xs sm:text-sm text-slate-500">Loading notifications...</div>
              ) : notifications.length > 0 ? (
                notifications.map((n) => (
                  <div key={n.id} className="p-3 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-shadow">
                    <div className="text-[11px] sm:text-xs text-black dark:text-slate-200 font-medium leading-relaxed">{n.message}</div>
                    <div className="text-[9px] sm:text-[10px] text-slate-400 mt-2 font-semibold">
                      {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs sm:text-sm text-slate-500">No new notifications.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Earned Badges Section */}
      <div className="glass rounded-3xl p-4 sm:p-6 fade-in-4 border border-slate-200 dark:border-slate-700/50 shadow-2xl bg-white dark:bg-transparent relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-black dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" /> My Earned Badges
          </h2>
          <Link href="/student/middle-school/badges" className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-500/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl">View Trophy Room</Link>
        </div>
        
        {loadingBadges ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : earnedBadges.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {earnedBadges.map((badge) => {
              const BadgeIcon = IconMap[badge.icon] || Award;
              return (
                <div key={badge.id} className="bg-slate-50 dark:bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 text-center flex flex-col items-center group cursor-pointer hover:border-indigo-500/50 transition-all hover:-translate-y-1 relative">
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br ${badge.color}`}></div>
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-md mb-2 border-4 border-white dark:border-slate-800 relative animate-pulse-subtle`}>
                    <BadgeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="font-bold text-[11px] sm:text-xs text-black dark:text-white truncate w-full">{badge.name}</h3>
                  <span className="text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5 sm:mt-1">{badge.rarity}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">No badges earned yet. Keep up the good work to earn badges from your teachers!</p>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}

