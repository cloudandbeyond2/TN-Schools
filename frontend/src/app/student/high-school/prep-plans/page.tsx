"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import { 
  BookOpen, 
  Calendar, 
  User, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Sparkles,
  Search,
  Filter,
  GraduationCap
} from "lucide-react";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

const SUBJECTS = ["All", "Tamil", "English", "Mathematics", "Science", "Social Science"];

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  Tamil: { bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-400", border: "border-amber-500/30", accent: "#f59e0b" },
  English: { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-500/30", accent: "#10b981" },
  Mathematics: { bg: "bg-red-500/10 dark:bg-red-500/20", text: "text-red-700 dark:text-red-400", border: "border-red-500/30", accent: "#ef4444" },
  Science: { bg: "bg-blue-500/10 dark:bg-blue-500/20", text: "text-blue-700 dark:text-blue-400", border: "border-blue-500/30", accent: "#3b82f6" },
  "Social Science": { bg: "bg-purple-500/10 dark:bg-purple-500/20", text: "text-purple-700 dark:text-purple-400", border: "border-purple-500/30", accent: "#8b5cf6" },
};

export default function PrepPlansPage() {
  const { data: session } = useSession();
  const [student, setStudent] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [selectedGrade, setSelectedGrade] = useState<"9" | "10">("10");
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Fetch Student Record
  useEffect(() => {
    fetch(`${API_BASE}/api/students`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          const myStudent = (session?.user as any)?.id
            ? json.data.find((s: any) => s.userId === (session?.user as any)?.id)
            : null;
          const matched = myStudent || json.data[0];
          setStudent(matched);
          if (matched && String(matched.class) === "9") setSelectedGrade("9");
        }
      })
      .catch((err) => console.error(err));
  }, [session]);

  // Fetch Preparation Plans based on Grade & School
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ class: selectedGrade });
    if (student?.schoolId) params.set("schoolId", student.schoolId);
    
    fetch(`${API_BASE}/api/sslc-prep/plans?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setPlans(json.data);
          // Expand first plan by default
          setExpandedPlan(json.data[0]._id);
        } else {
          setPlans([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setPlans([]);
        setLoading(false);
      });
  }, [student, selectedGrade]);

  const visiblePlans = subjectFilter === "All"
    ? plans
    : plans.filter((p) => p.subject === subjectFilter);

  return (
    <PortalLayout
      title="Subject Preparation Plans"
      subtitle="Teacher-designed week-by-week plans to complete the board syllabus on time."
      avatarLetter="P"
      avatarColor="#ef4444"
      themeClass="theme-student"
      accentColor="#ef4444"
    >
      <div className="space-y-6">
        
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 glass rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <i className="fi fi-sr-book-open-cover text-2xl text-indigo-600 dark:text-indigo-400 flex items-center" />
            <div>
              <h2 className="text-lg sm:text-xl font-black text-black dark:text-white uppercase tracking-wider leading-tight">
                Subject Preparation Plans
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Teacher-designed week-by-week plans to complete the board syllabus on time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0 self-start sm:self-auto">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Grade:</span>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-extrabold text-xs sm:text-sm rounded-xl border border-indigo-200/20 shadow-sm">
              <i className="fi fi-sr-graduation-cap flex items-center text-sm" />
              Class {selectedGrade}th Standard
            </span>
          </div>
        </div>

        {/* Top Grade Switcher & Subject Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          
          {/* Subject Pills */}
          <div className="flex flex-wrap gap-1.5">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setSubjectFilter(s)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  subjectFilter === s
                    ? "bg-indigo-600 text-white shadow-md scale-105"
                    : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Class Grade Toggle */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Class:</span>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setSelectedGrade("9")}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                  selectedGrade === "9"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Class 9
              </button>
              <button
                onClick={() => setSelectedGrade("10")}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                  selectedGrade === "10"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Class 10 (SSLC)
              </button>
            </div>
          </div>

        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : visiblePlans.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-md">
            <BookOpen className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">No Preparation Plans Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are no published preparation plans for {subjectFilter === "All" ? "this class" : subjectFilter} yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {visiblePlans.map((plan) => {
              const colorInfo = SUBJECT_COLORS[plan.subject] || { bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-500/30", accent: "#6366f1" };
              const isOpen = expandedPlan === plan._id;
              return (
                <div
                  key={plan._id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md transition-all hover:border-indigo-400 dark:hover:border-slate-700"
                >
                  <button
                    onClick={() => setExpandedPlan(isOpen ? null : plan._id)}
                    className="w-full p-5 sm:p-6 flex items-start justify-between gap-4 text-left transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${colorInfo.bg} ${colorInfo.border}`}
                      >
                        <BookOpen className={`h-6 w-6 ${colorInfo.text}`} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${colorInfo.bg} ${colorInfo.text}`}>
                            {plan.subject}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                            Class {plan.class}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                          {plan.title}
                        </h3>
                        {plan.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl font-medium">
                            {plan.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          {plan.teacherName && (
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5 text-indigo-500" /> {plan.teacherName}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-indigo-500" /> {plan.weeks?.length || 0} Week Schedule
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0 self-center">
                      {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </button>

                  {/* Expanded Weekly Content */}
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
                      {(plan.weeks || []).map((week: any, wIdx: number) => {
                        const weekKey = `${plan._id}-${wIdx}`;
                        const weekOpen = expandedWeeks[weekKey] ?? wIdx === 0;
                        return (
                          <div key={weekKey} className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm">
                            <button
                              onClick={() => setExpandedWeeks((prev) => ({ ...prev, [weekKey]: !weekOpen }))}
                              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black border ${colorInfo.bg} ${colorInfo.text} ${colorInfo.border}`}
                                >
                                  W{week.week}
                                </span>
                                <span className="text-xs font-black text-slate-900 dark:text-white">{week.focus}</span>
                              </div>
                              {weekOpen ? (
                                <ChevronUp className="h-4 w-4 text-slate-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-slate-500" />
                              )}
                            </button>

                            {weekOpen && (
                              <div className="px-5 pb-5 pt-1 grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-slate-200/60 dark:border-slate-800/60 mt-1">
                                <div className="space-y-2">
                                  <div className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                                    📌 Topics to Cover
                                  </div>
                                  <ul className="space-y-1.5">
                                    {(week.topics || []).map((t: string, i: number) => (
                                      <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-indigo-500" />
                                        {t}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="space-y-2">
                                  <div className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" /> Practice Activities
                                  </div>
                                  <ul className="space-y-1.5">
                                    {(week.activities || []).map((a: string, i: number) => (
                                      <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 font-medium">
                                        <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                                        {a}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </PortalLayout>
  );
}
