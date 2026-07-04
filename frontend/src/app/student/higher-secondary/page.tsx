"use client";
import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";

import { useSession } from "next-auth/react";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

const subjects = [
  { name: "Physics", progress: 75, color: "#3b82f6", icon: "⚛️" },
  { name: "Chemistry", progress: 82, color: "#10b981", icon: "🧪" },
  { name: "Biology", progress: 90, color: "#ec4899", icon: "🧬" },
  { name: "Mathematics", progress: 85, color: "#6366f1", icon: "📐" },
];

const mockTestScores = [
  { test: "NEET Mock 1: Biology", score: "320/360", status: "excellent" },
  { test: "HSC Midterm: Physics", score: "70/100", status: "needs-work" },
  { test: "HSC Midterm: Chemistry", score: "88/100", status: "good" },
];

const streamKnowledge = [
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
];

export default function HigherSecondaryDashboard() {
  const { data: session } = useSession();
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/students`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          // Match the logged in user if they are a student, otherwise default to first for preview
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
    ? `Welcome, ${userName} · Class ${student.class} ${student.section} Stream · Target: Medical Colleges`
    : "Loading student data...";

  return (
    <PortalLayout subtitle={subtitle}>
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
        {[
          { label: "HSC Board Exam", value: "62 Days", icon: "⏳", color: "text-purple-400", sub: "Exam starts Mar 5" },
          { label: "NEET Exam", value: "120 Days", icon: "🩺", color: "text-pink-400", sub: "Target Score: 650+" },
          { label: "Overall HSC Avg", value: "83%", icon: "📊", color: "text-blue-400", sub: "Target: 95%" },
          { label: "Mock Tests Taken", value: "12/20", icon: "📝", color: "text-amber-400", sub: "Next test: Sunday" },
        ].map((kpi) => (
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
            <h2 className="text-base font-semibold text-white">Stream Specialization: Science</h2>
            <button className="text-xs text-purple-400 hover:text-purple-300">View Analytics →</button>
          </div>
          <div className="space-y-4">
            {subjects.map((s) => (
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

          {/* Competitive Exam Hub */}
          <div className="glass rounded-2xl p-6 fade-in-3 border border-pink-500/30 bg-gradient-to-br from-pink-900/20 to-purple-900/20">
            <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-pink-500">🚀</span> NEET Prep Hub
            </h2>
            <p className="text-sm text-slate-300 mb-4">
              Your Biology scores are strong! Focus on improving Physics (Optics & Thermodynamics) to cross the 600 mark.
            </p>
            <button className="w-full py-2 rounded-lg bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 font-medium text-sm transition-colors border border-pink-500/50">
              Start Physics Boost
            </button>
          </div>

          {/* College Admissions Predictor */}
          <div className="glass rounded-2xl p-6 fade-in-4 border border-blue-500/30 bg-blue-900/10">
            <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-blue-500">🎓</span> College Predictor
            </h2>
            <p className="text-sm text-slate-300 mb-4">
              Based on your current performance trajectory, you have a <strong>75% chance</strong> of securing a seat in top-tier state medical colleges.
            </p>
            <button className="w-full py-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 font-medium text-sm transition-colors border border-blue-500/50">
              Explore Colleges
            </button>
          </div>
        </div>
      </div>

      {/* Stream Specific Knowledge Base Hub */}
      <div className="glass rounded-2xl p-6 fade-in-5 border border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-purple-400">🌐</span> Stream Knowledge & Innovation Hub
          </h2>
          <span className="text-xs text-slate-400">Explore multidisciplinary resources</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {streamKnowledge.map((stream, idx) => (
            <div key={idx} className={`p-5 rounded-xl border transition-all hover:-translate-y-1 hover:shadow-lg ${stream.bgBorder}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{stream.icon}</span>
                <h3 className={`font-bold ${stream.color} leading-tight`}>{stream.stream}</h3>
              </div>
              <div className="text-xs text-slate-400 mb-4">
                <strong>Core Subjects:</strong> {stream.subjects}
              </div>
              <div className="space-y-3">
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">AI Assistant Focus</div>
                  <div className="text-sm text-white font-medium">{stream.aiFeature}</div>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Capstone Project Idea</div>
                  <div className="text-sm text-white font-medium">{stream.projectIdea}</div>
                </div>
              </div>
              <button className={`w-full mt-4 py-2 rounded-lg border text-xs font-bold transition-colors ${stream.color.replace('text-', 'border-').replace('400', '500/30')} hover:bg-white/5`}>
                Enter Knowledge Base →
              </button>
            </div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
