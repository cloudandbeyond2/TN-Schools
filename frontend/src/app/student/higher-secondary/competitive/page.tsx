"use client";

import PortalLayout from "@/components/PortalLayout";
import GroupAwareExamList from "@/components/GroupAwareExamList";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useStudentGroup } from "@/lib/useStudentGroup";
import { HS_GROUP_LABELS } from "@/data/hsGroups";
import { EXAM_MODULES, GROUP_EXAM_MODULES, PREP_FEATURES, type ExamModule } from "@/data/competitivePrep";

export default function CompetitivePrepPage() {
  const { data: session } = useSession();
  const studentId = (session?.user as any)?.studentId || null;
  const studentClass = (session?.user as any)?.class || null;
  const studentGroup = useStudentGroup();

  // Exam modules offered to this student's group (tab order preserved).
  const moduleIds = GROUP_EXAM_MODULES[studentGroup];
  const [activeId, setActiveId] = useState(moduleIds[0]);

  // When the group changes, make sure the active tab still belongs to it.
  useEffect(() => {
    if (!moduleIds.includes(activeId)) setActiveId(moduleIds[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentGroup]);

  const exam: ExamModule = useMemo(
    () => EXAM_MODULES[moduleIds.includes(activeId) ? activeId : moduleIds[0]],
    [activeId, moduleIds]
  );

  return (
    <PortalLayout
      title="Competitive Exam Preparation"
      subtitle={`${HS_GROUP_LABELS[studentGroup]} · NEET, JEE, CUET, government & entrance exams — plan, practice and track.`}
      avatarLetter="A"
      avatarColor={exam.color}
      themeClass="theme-student"
      accentColor={exam.color}
    >
      {/* ── Hero: group + the six prep features ─────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 p-6 md:p-7 shadow-xl mb-6">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 bg-white/15 border border-white/25 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "#fff" }}>
            🎯 Class {studentClass || "11-12"} · {HS_GROUP_LABELS[studentGroup]}
          </span>
          <h2 className="text-2xl md:text-3xl font-black mb-1" style={{ color: "#fff" }}>
            Competitive Examination Preparation
          </h2>
          <p className="text-sm max-w-2xl mb-4" style={{ color: "rgba(255,255,255,0.9)" }}>
            Dedicated preparation modules picked for your group — with AI study plans, mock
            examinations, question banks, performance analysis, rank prediction and weak-topic analysis.
          </p>
          <div className="flex flex-wrap gap-2">
            {PREP_FEATURES.map((f) => (
              <span key={f.label} className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ color: "#fff" }}>
                <span>{f.icon}</span> {f.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Exam module tabs (group-specific) ───────────────────── */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50 w-fit overflow-x-auto">
          {moduleIds.map((id) => {
            const m = EXAM_MODULES[id];
            const active = id === exam.id;
            return (
              <button
                key={id}
                onClick={() => setActiveId(id)}
                className={`px-4 sm:px-5 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                  active ? "text-white shadow-lg" : "text-black dark:text-white hover:opacity-70"
                }`}
                style={active ? { backgroundColor: m.color } : undefined}
              >
                {m.icon} {m.name}
              </button>
            );
          })}
        </div>
        <Link href="/student/higher-secondary" className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white flex items-center gap-2">
          <span>←</span> Back to Dashboard
        </Link>
      </div>

      {/* Selected exam description */}
      <div className="glass rounded-2xl border border-slate-200 dark:border-slate-700/50 px-5 py-3 mb-6 flex items-center gap-3">
        <span className="text-2xl">{exam.icon}</span>
        <div>
          <h3 className="text-sm font-black text-black dark:text-white">{exam.fullName}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{exam.desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column ─────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats: countdown, target, rank prediction */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20" style={{ backgroundColor: exam.color }}></div>
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform origin-left">⏳</span>
              <h3 className="text-3xl font-black text-black dark:text-white">{exam.daysToExam} <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Days</span></h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Until {exam.name} exam window</p>
            </div>
            <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20 bg-emerald-500"></div>
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform origin-left">🎯</span>
              <h3 className="text-3xl font-black text-black dark:text-white">{exam.target}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{exam.targetLabel}</p>
            </div>
            <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20 bg-purple-500"></div>
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform origin-left">🏆</span>
              <h3 className="text-2xl font-black text-black dark:text-white">{exam.rankPrediction}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">AI Rank Prediction</p>
            </div>
          </div>

          {/* Performance analysis — syllabus mastery matrix */}
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                <span className="text-xl">📊</span> Performance Analysis
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg" style={{ backgroundColor: `${exam.color}1a`, color: exam.color }}>
                {exam.name} syllabus mastery
              </span>
            </div>

            <div className="space-y-6">
              {exam.subjects.map((subject) => (
                <div key={subject.name}>
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-inner" style={{ backgroundColor: `${subject.color}20`, color: subject.color }}>
                        {subject.icon}
                      </div>
                      <h3 className="font-bold text-black dark:text-white">{subject.name}</h3>
                    </div>
                    <span className="text-sm font-black text-black dark:text-white">{subject.percent}%</span>
                  </div>

                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div className="h-full rounded-full transition-all duration-1000 relative" style={{ width: `${subject.percent}%`, backgroundColor: subject.color }}>
                      <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-white/30 to-transparent"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">Strongest Area</span>
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-100 truncate pl-2">{subject.strong}</span>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 tracking-wider">Needs Work</span>
                      <span className="text-xs font-semibold text-red-700 dark:text-red-100 truncate pl-2">{subject.weak}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weak-topic analysis + AI study plan */}
          <div className="glass rounded-3xl p-6 border relative overflow-hidden" style={{ borderColor: `${exam.color}4d` }}>
            <div className="absolute top-0 right-0 w-64 h-64 blur-3xl opacity-10 rounded-full" style={{ backgroundColor: exam.color }}></div>
            <div className="flex items-center justify-between mb-4 relative z-10 flex-wrap gap-3">
              <h2 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                <span className="text-2xl">🎯</span> Weak-Topic Analysis
              </h2>
              <Link
                href="/student/study-planner"
                className="text-xs font-bold px-4 py-2 rounded-lg text-white shadow-lg transition-transform active:scale-95"
                style={{ backgroundColor: exam.color }}
              >
                🤖 Generate AI Study Plan →
              </Link>
            </div>
            <div className="space-y-4 relative z-10">
              {exam.weakTopics.map((w) => (
                <div key={w.topic} className="bg-white/70 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 flex gap-4">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <h3 className="font-bold text-black dark:text-white text-sm mb-1">{w.topic}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{w.note}</p>
                  </div>
                </div>
              ))}
              <div className="bg-white/70 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 flex gap-4">
                <div className="text-2xl">⭐</div>
                <div>
                  <h3 className="font-bold text-black dark:text-white text-sm mb-1">Keep your strengths sharp</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Your AI plan schedules a short revision of your strongest areas every week so they stay exam-ready while you fix weak topics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column ────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Mock examinations */}
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                <span className="text-xl">📝</span> Mock Examinations
              </h2>
              <Link href="/student/higher-secondary/mock-tests" className="text-xs font-bold hover:underline" style={{ color: exam.color }}>View All</Link>
            </div>

            <div className="space-y-4">
              {exam.mocks.map((test) => (
                <div key={test.name} className={`bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border transition-colors cursor-pointer ${test.status === "Upcoming" ? "border-amber-500/30 hover:border-amber-500/60" : "border-emerald-500/30 hover:border-emerald-500/60"}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${test.status === "Upcoming" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}>{test.status}</span>
                    {test.score && <span className="text-sm font-black text-black dark:text-white">{test.score}</span>}
                  </div>
                  <h3 className="font-bold text-black dark:text-white text-sm mb-1">{test.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>📅 {test.date}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                    <span>⏱️ {test.duration}</span>
                  </p>
                </div>
              ))}
            </div>
            <Link
              href="/student/higher-secondary/mock-tests"
              className="block text-center w-full mt-4 py-3 rounded-xl text-sm font-bold text-white shadow-lg hover:brightness-110 transition-all"
              style={{ background: `linear-gradient(90deg, ${exam.color}, ${exam.color}cc)` }}
            >
              Take New Mock Test
            </Link>
          </div>

          {/* Question banks */}
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                <span className="text-xl">📚</span> Question Banks
              </h2>
              <Link href="/student/science/question-bank" className="text-xs font-bold hover:underline" style={{ color: exam.color }}>Open All</Link>
            </div>
            <div className="space-y-3">
              {exam.questionBank.map((qb) => (
                <Link
                  key={qb.topic}
                  href="/student/science/question-bank"
                  className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/50 hover:-translate-y-0.5 hover:shadow transition-all"
                >
                  <span className="text-xs font-bold text-black dark:text-white">{qb.topic}</span>
                  <span className="text-[10px] font-black px-2 py-1 rounded-lg" style={{ backgroundColor: `${exam.color}1a`, color: exam.color }}>
                    {qb.questions} Qs
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Doubt solving */}
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 text-center">
            <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-3xl mb-4 border border-slate-200 dark:border-slate-700 shadow-inner">
              📸
            </div>
            <h3 className="font-bold text-black dark:text-white mb-2">Stuck on a question?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 px-4">Ask the AI Tutor any MCQ you can't solve and get a step-by-step explanation.</p>
            <Link
              href={`/student/ai-tutor?subject=${encodeURIComponent(exam.fullName)}`}
              className="block w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-black dark:text-white font-bold transition-colors"
            >
              Ask AI Tutor
            </Link>
          </div>
        </div>
      </div>

      {/* ── Live exam catalog (group-wise, from database) ───────── */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-black dark:text-white flex items-center gap-2 mb-4">
          <span className="text-xl">🗓️</span> Exam Calendar & Notifications
        </h2>
        <GroupAwareExamList studentId={studentId} studentClass={studentClass} />
      </div>
    </PortalLayout>
  );
}
