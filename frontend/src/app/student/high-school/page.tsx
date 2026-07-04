"use client";
import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
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

const subjects = [
  { name: "Mathematics", progress: 65, color: "#ef4444", icon: Ruler }, // Low progress to show weakness detector
  { name: "Science", progress: 78, color: "#3b82f6", icon: Microscope },
  { name: "Tamil", progress: 88, color: "#f59e0b", icon: Scroll },
  { name: "English", progress: 85, color: "#10b981", icon: Languages },
  { name: "Social Science", progress: 75, color: "#8b5cf6", icon: Globe },
];

const mockTestScores = [
  { test: "Midterm: Math", score: "62/100", status: "needs-work" },
  { test: "Midterm: Science", score: "80/100", status: "good" },
  { test: "Unit 4: Tamil", score: "90/100", status: "excellent" },
];

export default function HighSchoolDashboard() {
  const { data: session } = useSession();
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

  const userName = session?.user?.name || student?.user?.name || "Student";
  const subtitle = student 
    ? `Welcome, ${userName} · Class ${student.class} ${student.section} · Focus Area: SSLC Board Preparation`
    : "Loading student data...";

  return (
    <PortalLayout subtitle={subtitle}>
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
        {[
          { label: "Countdown to SSLC", value: "84 Days", icon: Hourglass, color: "text-red-400", sub: "Exam starts Mar 15" },
          { label: "Overall Avg", value: "77%", icon: BarChart2, color: "text-blue-400", sub: "Target: 90%" },
          { label: "Mock Tests Taken", value: "4/10", icon: FileText, color: "text-amber-400", sub: "Next test: Friday" },
          { label: "Study Boost Hrs", value: "12 Hrs", icon: Zap, color: "text-purple-400", sub: "Self-study this week" },
        ].map((kpi) => (
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
            <h2 className="text-base font-semibold text-white">Subject Readiness</h2>
            <button className="text-xs text-red-400 hover:text-red-300">View Analytics →</button>
          </div>
          <div className="space-y-4">
            {subjects.map((s) => (
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
              <span>⏱️</span> Today's Study Progress
            </h2>
            {todayProgress ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-left">
                    <div className="text-[10px] text-slate-500 uppercase font-black">Logged Today</div>
                    <div className="text-xl font-extrabold text-indigo-400">{todayProgress.totalTimeSpentMinutes} mins</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-black">Resources Studied</div>
                    <div className="text-xl font-extrabold text-emerald-400">{todayProgress.activeCount}</div>
                  </div>
                </div>

                {todayProgress.recentResources && todayProgress.recentResources.length > 0 ? (
                  <div className="space-y-2.5">
                    <div className="text-[10px] text-slate-500 uppercase font-black text-left font-sans">Recent Activity</div>
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
                  <p className="text-xs text-slate-500 italic py-2 text-center">No study activity logged today yet.</p>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center">Loading progress...</div>
            )}
          </div>

          {/* AI Weakness Detector */}
          <div className="glass rounded-2xl p-6 fade-in-3 border border-red-500/30 bg-red-900/10">
            <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-500 animate-pulse" /> AI Weakness Alert
            </h2>
            <p className="text-sm text-slate-300 mb-4">
              Your recent scores show a drop in <strong className="text-red-400">Mathematics (Algebra)</strong>. We have generated a custom 3-day study plan to boost your score.
            </p>
            <button className="w-full py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 font-medium text-sm transition-colors border border-red-500/50">
              Start Algebra Boost Plan
            </button>
          </div>

          {/* Recent Mock Tests */}
          <div className="glass rounded-2xl p-6 fade-in-4 border border-slate-700/50">
            <h2 className="text-base font-semibold text-white mb-4">Recent Mock Tests</h2>
            <div className="space-y-3">
              {mockTestScores.map((m, i) => (
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
            <button className="mt-4 text-xs text-center w-full text-slate-400 hover:text-white">View All Results →</button>
          </div>

          {/* Quick Links / Student Tools */}
          <div className="glass rounded-2xl p-6 fade-in-5 border border-slate-700/50">
            <h2 className="text-base font-semibold text-white mb-4">Quick Links</h2>
            <div className="space-y-3">
              <a href="/student/leave" className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-red-500/50 hover:bg-slate-800 transition-all group">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-red-400" />
                  <span className="text-sm text-slate-300 group-hover:text-white">Leave Reports & Application</span>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-red-400">View →</span>
              </a>
              <a href="/student/health" className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-red-500/50 hover:bg-slate-800 transition-all group">
                <div className="flex items-center gap-3">
                  <HeartPulse className="h-5 w-5 text-red-400" />
                  <span className="text-sm text-slate-300 group-hover:text-white">My Health Report</span>
                </div>
                <span className="text-xs text-slate-400 group-hover:text-red-400">View →</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
