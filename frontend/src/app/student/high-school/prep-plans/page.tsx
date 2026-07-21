"use client";

import { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";

const Icon = ({ name, className = "", style }: { name: string; className?: string; style?: React.CSSProperties }) => (
  <i className={`fi fi-rr-${name} inline-flex items-center justify-center leading-none ${className}`} style={style} />
);

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

const SUBJECTS = ["All", "Tamil", "English", "Mathematics", "Science", "Social Science"];

const SUBJECT_COLORS: Record<string, string> = {
  Tamil: "#f59e0b",
  English: "#10b981",
  Mathematics: "#ef4444",
  Science: "#3b82f6",
  "Social Science": "#8b5cf6",
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

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ class: selectedGrade });
    if (student?.schoolId) params.set("schoolId", student.schoolId);
    fetch(`${API_BASE}/api/sslc-prep/plans?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          setPlans(json.data);
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
    >
      {/* Grade switcher + subject filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              onClick={() => setSubjectFilter(s)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                subjectFilter === s
                  ? "bg-red-500 border-red-500 text-white shadow-lg"
                  : "bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white hover:border-red-500/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
            <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-700">
              <div className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-red-500 text-white">
                Class {selectedGrade}
              </div>
            </div>
      </div>
      </div>



      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
        </div>
      ) : visiblePlans.length === 0 ? (
        <div className="glass rounded-2xl p-6 sm:p-10 border border-slate-700/50 text-center">
          <Icon name="book-alt" className="text-4xl text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No preparation plans published for this subject yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {visiblePlans.map((plan) => {
            const color = SUBJECT_COLORS[plan.subject] || "#ef4444";
            const isOpen = expandedPlan === plan._id;
            return (
              <div
                key={plan._id}
                className="glass rounded-2xl border border-slate-700/50 overflow-hidden fade-in hover:border-red-500/40 transition-colors"
              >
                <button
                  onClick={() => setExpandedPlan(isOpen ? null : plan._id)}
                  className="w-full p-4 sm:p-6 flex items-start justify-between gap-4 text-left"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${color}22`, border: `1px solid ${color}55` }}
                    >
                      <Icon name="book-alt" className="text-xl" style={{ color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color }}>
                          {plan.subject}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Class {plan.class}</span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{plan.title}</h3>
                      {plan.description && (
                        <p className="text-xs text-slate-400 mt-1.5 max-w-2xl">{plan.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 mt-2.5 text-[11px] text-slate-500">
                        {plan.teacherName && (
                          <span className="flex items-center gap-1"><Icon name="user" className="text-sm" /> {plan.teacherName}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Icon name="calendar" className="text-sm" /> {plan.weeks?.length || 0} week schedule
                        </span>
                      </div>
                    </div>
                  </div>
                  {isOpen ? (
                    <Icon name="angle-up" className="text-xl text-slate-400 shrink-0 mt-1" />
                  ) : (
                    <Icon name="angle-down" className="text-xl text-slate-400 shrink-0 mt-1" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3">
                    {(plan.weeks || []).map((week: any, wIdx: number) => {
                      const weekKey = `${plan._id}-${wIdx}`;
                      const weekOpen = expandedWeeks[weekKey] ?? wIdx === 0;
                      return (
                        <div key={weekKey} className="bg-slate-900/60 rounded-xl border border-slate-800">
                          <button
                            onClick={() => setExpandedWeeks((prev) => ({ ...prev, [weekKey]: !weekOpen }))}
                            className="w-full flex items-center justify-between px-4 py-3 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
                                style={{ backgroundColor: `${color}22`, color }}
                              >
                                W{week.week}
                              </span>
                              <span className="text-sm font-semibold text-slate-200">{week.focus}</span>
                            </div>
                            {weekOpen ? (
                              <Icon name="angle-up" className="text-sm text-slate-500" />
                            ) : (
                              <Icon name="angle-down" className="text-sm text-slate-500" />
                            )}
                          </button>
                          {weekOpen && (
                            <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-[10px] font-black uppercase text-slate-500 mb-2">Topics to cover</div>
                                <ul className="space-y-1.5">
                                  {(week.topics || []).map((t: string, i: number) => (
                                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
                                      {t}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <div className="text-[10px] font-black uppercase text-slate-500 mb-2 flex items-center gap-1">
                                  <Icon name="list-check" className="text-xs" /> Practice activities
                                </div>
                                <ul className="space-y-1.5">
                                  {(week.activities || []).map((a: string, i: number) => (
                                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                      <span className="text-emerald-400 mt-0.5">✓</span>
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
    </PortalLayout>
  );
}
