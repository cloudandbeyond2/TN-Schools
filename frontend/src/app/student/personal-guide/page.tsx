"use client";

import { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { Compass, Sparkles, CheckCircle2, ChevronRight, BookMarked, User } from "lucide-react";

export default function PersonalGuidePage() {
  const [activeTab, setActiveTab] = useState<"goals" | "roadmap" | "tips">("goals");

  const personalInfo = {
    name: "Arjun Kumar",
    class: "10th Grade (SSLC Board)",
    mentor: "Mrs. Sumathi Devi (Maths Teacher)",
    goal: "90%+ Score in Board Exams",
  };

  const currentGoals = [
    { id: 1, text: "Revise Trigonometry formulas", done: true },
    { id: 2, text: "Complete Science practical record", done: false },
    { id: 3, text: "Attempt English Mock Paper 2", done: false },
    { id: 4, text: "Read Chapter 4 of Social Science", done: true },
  ];

  const milestones = [
    { title: "Mid-Term Assessment Prep", desc: "Covers Chapters 1-5 across all subjects.", date: "July 15, 2026", status: "current" },
    { title: "Pre-Board Practical Exams", desc: "Science lab assessments & projects evaluation.", date: "September 10, 2026", status: "upcoming" },
    { title: "State Mock Exams", desc: "State-wide simulated board examination under real conditions.", date: "November 25, 2026", status: "upcoming" },
  ];

  const tips = [
    { title: "Active Recall Study", desc: "Instead of rereading, close the book and try to write down everything you remember." },
    { title: "The Pomodoro Method", desc: "Study for 25 minutes, take a 5-minute break. Repeat 4 times, then take a longer 20-minute break." },
    { title: "Spaced Repetition", desc: "Review a difficult formula today, then in 3 days, then in a week to embed it into your long-term memory." },
  ];

  return (
    <PortalLayout title="Personal Guide 🧭" subtitle="Your customized learning companion and progress tracker" accentColor="#ec4899">
      <div className="space-y-6 text-left animate-in fade-in duration-300">
        
        {/* Playful Banner */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-gradient-to-r from-pink-500 to-rose-500 text-white p-6 md:p-8 shadow-xl border-2 md:border-4 border-pink-100 dark:border-pink-950">
          <div className="absolute right-0 top-0 opacity-20 transform translate-x-1/4 -translate-y-1/4 scale-150 pointer-events-none mix-blend-overlay">
            <Compass className="w-64 h-64" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl font-black tracking-wider text-[10px] uppercase border-2 border-white/30 rotate-[-1.5deg]">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> AI Coach Active
            </div>
            <h2 className="text-2xl md:text-4xl font-black font-mono tracking-tight">Your Path to Excellence!</h2>
            <p className="text-pink-50 font-bold max-w-xl text-xs md:text-sm">
              Hey {personalInfo.name}! Based on your dashboard activity and syllabus, here is your customized guidance dashboard.
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identity & Mentor Info */}
          <div className="bg-[var(--bg-card)] border-2 border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-[2rem] p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[var(--text-heading)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <User className="w-5 h-5 text-pink-500" />
              Student Profile Guidance
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)] font-medium">Class:</span>
                <span className="font-bold text-[var(--text-main)]">{personalInfo.class}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)] font-medium">Academic Goal:</span>
                <span className="font-bold text-pink-600 dark:text-pink-400">{personalInfo.goal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)] font-medium">Class Teacher / Advisor:</span>
                <span className="font-bold text-[var(--text-main)]">{personalInfo.mentor}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats / Achievements */}
          <div className="bg-[var(--bg-card)] border-2 border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-[2rem] p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[var(--text-heading)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <BookMarked className="w-5 h-5 text-pink-500" />
              Focus Strategy
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Your teacher Mrs. Sumathi Devi recommends spending an extra 15 minutes daily on solving Trigonometry mock questions to increase your board preparation confidence.
            </p>
            <div className="pt-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-pink-500 h-2 rounded-full" style={{ width: "65%" }}></div>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] mt-1.5 block font-bold">SYLLABUS PROGRESS: 65% Completed</span>
            </div>
          </div>
        </div>

        {/* Tab selection for detail sections */}
        <div className="flex gap-2 border-b border-[var(--border)] pb-0">
          {(["goals", "roadmap", "tips"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-bold border-b-4 transition-colors -mb-[2px] capitalize ${
                activeTab === tab
                  ? "border-pink-500 text-pink-500"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              {tab === "goals" ? "Daily Goals" : tab === "roadmap" ? "Roadmap" : "Smart Study Tips"}
            </button>
          ))}
        </div>

        {/* Details card based on tabs */}
        <div className="bg-[var(--bg-card)] border-2 border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-[2rem] p-6 shadow-sm">
          {activeTab === "goals" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-black text-[var(--text-heading)] uppercase tracking-wider">Self-Study Checklist</h4>
                <span className="text-xs text-[var(--text-muted)] font-bold">2 of 4 Completed</span>
              </div>
              <div className="space-y-3">
                {currentGoals.map((g) => (
                  <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <CheckCircle2 className={`w-5 h-5 shrink-0 ${g.done ? "text-pink-500" : "text-slate-300"}`} />
                    <span className={`text-xs font-medium text-[var(--text-main)] ${g.done ? "line-through opacity-60" : ""}`}>
                      {g.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "roadmap" && (
            <div className="space-y-6">
              <h4 className="text-sm font-black text-[var(--text-heading)] uppercase tracking-wider">Academic Milestones</h4>
              <div className="relative border-l-2 border-slate-200 dark:border-slate-800 pl-4 ml-2 space-y-6">
                {milestones.map((m, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle bullet on vertical line */}
                    <div className={`absolute -left-[25px] top-1.5 w-4 h-4 rounded-full border-4 bg-[var(--bg-card)] ${m.status === "current" ? "border-pink-500" : "border-slate-300"}`} />
                    <div>
                      <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">{m.date}</span>
                      <h5 className="text-sm font-bold text-[var(--text-heading)] mt-0.5">{m.title}</h5>
                      <p className="text-xs text-[var(--text-muted)] mt-1">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "tips" && (
            <div className="space-y-4">
              <h4 className="text-sm font-black text-[var(--text-heading)] uppercase tracking-wider">Cognitive Study Strategies</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tips.map((t, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                    <h5 className="text-xs font-black text-pink-600 dark:text-pink-400 mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {t.title}
                    </h5>
                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </PortalLayout>
  );
}
