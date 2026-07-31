"use client";

import React, { useState, useEffect, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import GroupAwareExamList from "@/components/GroupAwareExamList";
import { useSession } from "next-auth/react";

interface Exam {
  id: string;
  examName: string;
  category: string;
  conductedBy: string;
  examDate: string;
  registrationDeadline: string;
  status: string;
  eligibility: string;
  website: string;
}

interface PrepResource {
  id: string;
  title: string;
  exam: string;
  type: string;
  icon: string;
  color: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const prepResources: PrepResource[] = [
  { id: "1", title: "NEET Biology PYQ 2015–2024", exam: "NEET", type: "PDF", icon: "📄", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  { id: "2", title: "JEE Main Maths Formula Sheet", exam: "JEE", type: "PDF", icon: "📄", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  { id: "3", title: "TNPSC GK Tamil Notes", exam: "TNPSC", type: "PDF", icon: "📄", color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  { id: "4", title: "NDA Mathematics Crash Course", exam: "NDA", type: "Video", icon: "🎬", color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300" },
  { id: "5", title: "CLAT Reasoning Practice Set", exam: "CLAT", type: "Worksheet", icon: "📋", color: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300" },
];

const categoryIcon: Record<string, string> = {
  Medical: "🏥", Engineering: "⚙️", "Civil Services": "🏛️",
  Banking: "🏦", Defence: "🛡️", Law: "⚖️", Other: "📖",
};

const categoryColor: Record<string, string> = {
  Medical: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Engineering: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "Civil Services": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Defence: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  Law: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
};

const statusStyle: Record<string, string> = {
  "Upcoming": "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700",
  "Registration Open": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800",
  "Ongoing": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800",
  "Results Out": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800",
};

const statusDot: Record<string, string> = {
  "Upcoming": "bg-slate-400",
  "Registration Open": "bg-blue-500 animate-pulse",
  "Ongoing": "bg-amber-500 animate-pulse",
  "Results Out": "bg-emerald-500",
};

export default function StudentCompetitiveExamsPage() {
  const { data: session, status } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const studentId = (session?.user as any)?.studentId || null;
  const studentClass = (session?.user as any)?.class || null;
  const isHscStudent = ["11", "12"].includes(String(studentClass));

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"exams" | "resources" | "tips">("exams");
  const [filterCat, setFilterCat] = useState("All");
  const [enrolledMap, setEnrolledMap] = useState<Record<string, boolean>>({});

  const fetchExams = useCallback(async () => {
    if (status === "loading") return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (schoolId) params.append("schoolId", schoolId);
      if (studentClass) params.append("class", String(studentClass));
      const res = await fetch(`${API}/api/competitive-exams?${params}`);
      const data = await res.json();
      if (data.success) {
        setExams(data.data);
        // default some status maps
        const defaultMap: Record<string, boolean> = {};
        data.data.forEach((e: any, idx: number) => {
          defaultMap[e.id] = idx === 0; // enroll in first by default
        });
        setEnrolledMap(defaultMap);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [schoolId, studentClass, status]);

  useEffect(() => {
    if (status !== "loading") {
      fetchExams();
    }
  }, [status, fetchExams]);

  const toggleEnroll = (id: string) =>
    setEnrolledMap((prev) => ({ ...prev, [id]: !prev[id] }));

  const filteredExams = exams.filter(
    (e) => filterCat === "All" || e.category === filterCat
  );

  const enrolledCount = Object.values(enrolledMap).filter(Boolean).length;

  return (
    <PortalLayout title="Competitive Exams 🏆" subtitle="Explore national exams, deadlines, eligibility & preparation materials" accentColor="#7c3aed">
      <div className="space-y-6 animate-in fade-in duration-300">

        {/* ── Hero Banner ─────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 text-white p-6 md:p-8 shadow-xl">
          <div className="absolute right-0 top-0 opacity-10 translate-x-6 -translate-y-4 pointer-events-none">
            <span className="text-[12rem] leading-none">🏆</span>
          </div>
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-violet-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-3 shadow-sm">
              🎓 Career Launchpad
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2 text-slate-800 dark:text-white">
              Your Future Starts Here
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium max-w-lg">
              From NEET to JEE to Civil Services — track all major exams, register on time, and prepare with curated materials.
            </p>

            <div className="flex flex-wrap gap-4 mt-5">
              {[
                { label: "Exams Tracked", value: exams.length, icon: "📋" },
                { label: "Enrolled By Me", value: enrolledCount, icon: "✅" },
                { label: "Registration Open", value: exams.filter((e) => e.status === "Registration Open").length, icon: "📝" },
                { label: "Study Materials", value: prepResources.length, icon: "📚" },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 min-w-[120px] shadow-sm">
                  <div className="text-sm font-black text-slate-800 dark:text-white">{s.icon} {s.value}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Category Quick Filter ─────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">🎯 Browse by Category</h3>
          <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
            {["All", "Medical", "Engineering", "Civil Services", "Defence", "Law", "Banking"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`flex flex-col items-center p-2.5 rounded-xl border-2 transition-all ${filterCat === cat
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-violet-300"
                }`}
              >
                <span className="text-xl mb-0.5">{cat === "All" ? "📚" : categoryIcon[cat] || "📖"}</span>
                <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 text-center leading-tight">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Group-wise guidance for 11th–12th (TN HSC groups) ── */}
        {isHscStudent && <GroupAwareExamList studentId={studentId} studentClass={studentClass} />}

        {/* ── Tabs ────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 w-fit">
          {([
            { key: "exams", label: "📋 All Exams" },
            { key: "resources", label: "📚 Study Materials" },
            { key: "tips", label: "💡 Exam Tips" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab.key
                ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Exams Tab ──────────────────────────────────────────── */}
        {activeTab === "exams" && (
          loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" /></div>
          ) : filteredExams.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">No competitive exams found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredExams.map((exam) => (
                <div key={exam.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                      {categoryIcon[exam.category] || "📖"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-violet-500 transition-colors">{exam.examName}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">By {exam.conductedBy}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-semibold ${categoryColor[exam.category] || "bg-slate-100 text-slate-600"}`}>
                      {exam.category}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border inline-flex items-center gap-1 ${statusStyle[exam.status] || ""}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot[exam.status] || "bg-slate-400"}`} />
                      {exam.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-2">
                      <div className="text-[9px] text-slate-400 font-semibold mb-0.5">📋 Reg. Deadline</div>
                      <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{exam.registrationDeadline}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-2">
                      <div className="text-[9px] text-slate-400 font-semibold mb-0.5">📅 Exam Date</div>
                      <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{exam.examDate}</div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 mb-3">📋 {exam.eligibility}</p>

                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3 gap-2">
                    {exam.website ? (
                      <a href={exam.website.startsWith("http") ? exam.website : `https://${exam.website}`} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] text-violet-500 hover:underline truncate max-w-32 block">
                        🌐 {exam.website}
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400">No Link</span>
                    )}
                    <button
                      onClick={() => toggleEnroll(exam.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[10px] transition-all whitespace-nowrap border ${enrolledMap[exam.id]
                        ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-violet-500/10 hover:bg-violet-500/20 text-violet-700 dark:text-violet-400 border-violet-500/20"
                      }`}
                    >
                      {enrolledMap[exam.id] ? "✓ Enrolled" : "+ Enroll"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Resources Tab ──────────────────────────────────────── */}
        {activeTab === "resources" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {prepResources.map((res) => (
              <div key={res.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">
                    {res.icon}
                  </div>
                  <div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${res.color}`}>{res.exam}</span>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 group-hover:text-violet-500 transition-colors">{res.title}</h4>
                <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="text-[10px] text-slate-400 font-semibold">{res.type}</span>
                  <button onClick={() => alert(`Downloading "${res.title}"...`)} className="px-3 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-700 dark:text-violet-400 border border-violet-500/20 rounded-xl font-bold text-[10px] transition-all">
                    ⬇ Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tips Tab ───────────────────────────────────────────── */}
        {activeTab === "tips" && (
          <div className="space-y-4">
            {[
              { icon: "⏰", title: "Never Miss a Deadline", tip: "Registration deadlines are strict — once closed, they cannot be extended. Set calendar reminders 30 and 7 days before each deadline.", color: "border-l-red-500" },
              { icon: "📚", title: "Know the Syllabus First", tip: "Download the official syllabus before buying any book. Focus only on what's in the exam — don't waste time on out-of-scope topics.", color: "border-l-blue-500" },
              { icon: "📝", title: "Solve Previous Year Papers", tip: "For NEET: At least 10 years of PYQs. For JEE: Focus on the last 5 years (JEE Advanced style).", color: "border-l-amber-500" },
            ].map((tip, idx) => (
              <div key={idx} className={`border-l-4 ${tip.color} pl-5 py-3 bg-white dark:bg-slate-900 rounded-r-2xl border border-l-4 border-y border-r border-slate-200 dark:border-slate-800 shadow-sm`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0 mt-0.5">{tip.icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">{tip.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{tip.tip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
