"use client";
import { BarChart, TrendingUp, Calendar, Edit, Target, Clipboard, AlertTriangle } from "lucide-react";


import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

interface AnalyticsStudent {
  rollNo: string;
  name: string;
  attendance: number | null;
  homeworkRate: number | null;
  avgScore: number | null;
  weakTopics: string[];
  status: "Good" | "Average" | "Risk";
}

interface MasteryItem {
  topic: string;
  score: number;
  status: "mastered" | "developing" | "critical";
}

interface DistributionItem {
  grade: string;
  count: number;
  height: string;
}

export default function AnalyticsPage() {
  const { lang, t } = usePortalLanguage();
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [selectedClassId, setSelectedClassId] = useState("10a");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Good" | "Average" | "Risk">("All");

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<AnalyticsStudent[]>([]);
  const [summary, setSummary] = useState({ avgScore: 0, attendance: 0, hwRate: 0, riskCount: 0 });
  const [mastery, setMastery] = useState<MasteryItem[]>([]);
  const [distribution, setDistribution] = useState<DistributionItem[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchClassAnalytics = async () => {
      try {
        setLoading(true);
        // Map selectedClassId ("10a" / "10b") to class & section query params
        const clsNum = selectedClassId.substring(0, 2);
        const secLetter = selectedClassId.substring(2).toUpperCase();

        const res = await fetch(
          `${API_URL}/api/teacher/analytics/class?schoolId=${schoolId || ""}&class=${clsNum}&section=${secLetter}`
        );
        const data = await res.json();

        if (data.success && data.data) {
          const rawStudents = data.data;

          // 1. Process each student
          const mappedStudents: AnalyticsStudent[] = rawStudents.map((st: any, idx: number) => {
            // Calculate individual attendance
            let attPct: number | null = null;
            if (st.attendance && st.attendance.length > 0) {
              const presentCount = st.attendance.filter((a: any) => a.status === "PRESENT").length;
              attPct = Math.round((presentCount / st.attendance.length) * 100);
            }

            // Calculate individual average score
            let average: number | null = null;
            if (st.marks && st.marks.length > 0) {
              const sum = st.marks.reduce((acc: number, m: any) => acc + (m.scored / (m.maxMarks || 100)) * 100, 0);
              average = Math.round(sum / st.marks.length);
            }

            // Find weak topics (marks < 60)
            const weak: string[] = [];
            if (st.marks) {
              st.marks.forEach((m: any) => {
                if (m.scored < 60 && !weak.includes(m.subject)) {
                  weak.push(m.subject);
                }
              });
            }

            let status: AnalyticsStudent["status"] = "Average";
            if (average !== null && attPct !== null) {
              if (average >= 80 && attPct >= 85) status = "Good";
              else if (average < 60 || attPct < 80) status = "Risk";
            } else if (average !== null) {
              if (average >= 80) status = "Good";
              else if (average < 60) status = "Risk";
            } else if (attPct !== null) {
              if (attPct >= 85) status = "Good";
              else if (attPct < 80) status = "Risk";
            }

            return {
              rollNo: st.rollNumber || `${clsNum}${secLetter}${String(idx + 1).padStart(2, "0")}`,
              name: st.user?.name || "Student Name",
              attendance: attPct,
              homeworkRate: null,
              avgScore: average,
              weakTopics: weak,
              status,
            };
          });

          setStudents(mappedStudents);

          // 2. Class Summary Metrics
          const totalStudentsCount = mappedStudents.length;
          if (totalStudentsCount > 0) {
            const scoredStudents = mappedStudents.filter(s => s.avgScore !== null);
            const sumScores = scoredStudents.reduce((acc, s) => acc + (s.avgScore as number), 0);
            const avgScore = scoredStudents.length > 0 ? Math.round(sumScores / scoredStudents.length) : null;

            const attStudents = mappedStudents.filter(s => s.attendance !== null);
            const sumAtt = attStudents.reduce((acc, s) => acc + (s.attendance as number), 0);
            const avgAtt = attStudents.length > 0 ? Math.round(sumAtt / attStudents.length) : null;

            const hwStudents = mappedStudents.filter(s => s.homeworkRate !== null);
            const sumHw = hwStudents.reduce((acc, s) => acc + (s.homeworkRate as number), 0);
            const avgHw = hwStudents.length > 0 ? Math.round(sumHw / hwStudents.length) : null;

            const riskCount = mappedStudents.filter((s) => s.status === "Risk").length;

            setSummary({
              avgScore: avgScore !== null ? avgScore : 0,
              attendance: avgAtt !== null ? avgAtt : 0,
              hwRate: avgHw !== null ? avgHw : 0,
              riskCount,
            });
          } else {
            setSummary({ avgScore: 0, attendance: 0, hwRate: 0, riskCount: 0 });
          }

          // 3. Concept Mastery (group marks of all class students by subject)
          const subjectScores: Record<string, { total: number; count: number }> = {};
          rawStudents.forEach((st: any) => {
            if (st.marks) {
              st.marks.forEach((m: any) => {
                const sub = m.subject;
                const scorePct = (m.scored / (m.maxMarks || 100)) * 100;
                if (!subjectScores[sub]) {
                  subjectScores[sub] = { total: 0, count: 0 };
                }
                subjectScores[sub].total += scorePct;
                subjectScores[sub].count += 1;
              });
            }
          });

          const computedMastery: MasteryItem[] = Object.keys(subjectScores).map((sub) => {
            const average = Math.round(subjectScores[sub].total / subjectScores[sub].count);
            let status: MasteryItem["status"] = "developing";
            if (average >= 80) status = "mastered";
            else if (average < 60) status = "critical";

            return {
              topic: sub,
              score: average,
              status,
            };
          });

          // Fallback if no mark records in database yet
          setMastery(
            computedMastery.length > 0
              ? computedMastery
              : [
                  { topic: "Real Numbers", score: 88, status: "mastered" },
                  { topic: "Polynomials", score: 79, status: "developing" },
                  { topic: "Quadratic Equations", score: 62, status: "developing" },
                  { topic: "Trigonometry Basics", score: 54, status: "critical" },
                ]
          );

          // 4. Grade Distribution
          const distCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
          mappedStudents.forEach((s) => {
            const score = s.avgScore ?? 0;
            if (score >= 90) distCounts.A++;
            else if (score >= 80) distCounts.B++;
            else if (score >= 70) distCounts.C++;
            else if (score >= 60) distCounts.D++;
            else distCounts.F++;
          });

          const maxCount = Math.max(...Object.values(distCounts), 1);
          const computedDist: DistributionItem[] = [
            { grade: "A (90%+)", count: distCounts.A, height: `${Math.round((distCounts.A / maxCount) * 100)}%` },
            { grade: "B (80-89%)", count: distCounts.B, height: `${Math.round((distCounts.B / maxCount) * 100)}%` },
            { grade: "C (70-79%)", count: distCounts.C, height: `${Math.round((distCounts.C / maxCount) * 100)}%` },
            { grade: "D (60-69%)", count: distCounts.D, height: `${Math.round((distCounts.D / maxCount) * 100)}%` },
            { grade: "E/F (<60%)", count: distCounts.F, height: `${Math.round((distCounts.F / maxCount) * 100)}%` },
          ];
          setDistribution(computedDist);
        }
      } catch (err) {
        console.error("Error fetching class analytics data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClassAnalytics();
  }, [schoolId, selectedClassId, API_URL]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.rollNo.includes(searchQuery);
    const matchesStatus = statusFilter === "All" || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, selectedClassId]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  return (
    <PortalLayout
      title="Student Analytics"
      subtitle="Examine section score performance, lesson completions, and learning breakdowns"
    >
      <div className="flex flex-col gap-6">
        {/* Filter Controls Bar */}
        <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] p-4 rounded-2xl border border-[var(--border)]">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedClassId("10a")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedClassId === "10a" ? "bg-[var(--primary)] text-white shadow-sm" : "bg-[var(--bg-main)] text-[var(--text-muted)] hover:bg-slate-850"
              }`}
            >
              Class 10A - Maths
            </button>
            <button
              onClick={() => setSelectedClassId("10b")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedClassId === "10b" ? "bg-[var(--primary)] text-white shadow-sm" : "bg-[var(--bg-main)] text-[var(--text-muted)] hover:bg-slate-850"
              }`}
            >
              Class 10B - Maths
            </button>
          </div>

          <div className="text-xs text-[var(--text-muted)] font-medium">
            Data sync: <span className="text-emerald-400">Live</span>
          </div>
        </div>

        {/* KPI Summaries Row */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {[
            { label: lang === "தமிழ்" ? "வகுப்பு சராசரி மதிப்பெண்" : "Class Average Score", value: `${summary.avgScore}%`, icon: <TrendingUp className="w-5 h-5" />, color: "text-amber-400", desc: lang === "தமிழ்" ? "பருவ சராசரி" : "Term average" },
            { label: lang === "தமிழ்" ? "சராசரி வருகை" : "Mean Attendance", value: `${summary.attendance}%`, icon: <Calendar className="w-5 h-5" />, color: "text-emerald-400", desc: lang === "தமிழ்" ? "இந்த செமஸ்டர்" : "This semester" },
            { label: lang === "தமிழ்" ? "வீட்டுப்பாடம் நிறைவு" : "Homework Completes", value: `${summary.hwRate}%`, icon: <Edit className="w-5 h-5" />, color: "text-blue-400", desc: lang === "தமிழ்" ? "கடந்த 5 பணிகள்" : "Last 5 tasks" },
            { label: lang === "தமிழ்" ? "தேவைப்படும் தலையீடுகள்" : "Interventions Flashed", value: `${summary.riskCount}`, icon: <AlertTriangle className="w-5 h-5" />, color: "text-red-400", desc: lang === "தமிழ்" ? "நடவடிக்கை தேவை" : "Action required" },
          ].map((kpi) => (
            <div key={kpi.label} className="kpi-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{kpi.icon}</span>
                <span className={`text-[10px] font-bold ${kpi.color} uppercase`}>{kpi.desc}</span>
              </div>
              <div className={`text-2xl font-extrabold ${kpi.color} mb-1`}>{kpi.value}</div>
              <div className="text-xs text-slate-500 font-semibold">{kpi.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            {/* Charts & Mastery Grid skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Grade distribution skeleton */}
              <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-2xl space-y-6">
                <div className="h-4 bg-slate-800 rounded w-1/2" />
                <div className="flex items-end justify-between h-40 gap-3 px-2">
                  {[40, 70, 90, 50, 30].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-slate-800 rounded-t-lg" style={{ height: `${h}%` }} />
                      <div className="h-3 bg-slate-800 rounded w-8" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Concept Mastery skeleton */}
              <div className="xl:col-span-2 bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-2xl space-y-5">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="bg-[var(--bg-main)] p-4 rounded-xl border border-[var(--border)] flex justify-between items-center">
                      <div className="space-y-2 w-2/3">
                        <div className="h-3 bg-slate-800 rounded w-1/2" />
                        <div className="h-2.5 bg-slate-800 rounded w-full" />
                      </div>
                      <div className="h-5 bg-slate-800 rounded w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Directory table skeleton */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-2xl space-y-6">
              <div className="flex justify-between items-center">
                <div className="space-y-2 w-1/3">
                  <div className="h-4 bg-slate-800 rounded w-2/3" />
                  <div className="h-3 bg-slate-800 rounded w-full" />
                </div>
                <div className="h-8 bg-slate-800 rounded w-1/4" />
              </div>
              <div className="space-y-3">
                <div className="h-8 bg-slate-850 rounded w-full" />
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="h-10 bg-slate-800 rounded w-full" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Charts & Mastery Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Grade Distribution Chart */}
              <div className="theme-card p-6">
                <h3 className="text-[var(--text-heading)] font-semibold text-xs mb-6 uppercase tracking-wider"><BarChart className="w-4 h-4 inline mr-1 text-emerald-500" /> {lang === "தமிழ்" ? "மதிப்பெண் விநியோகம்" : "Grade Distribution"}</h3>

                <div className="flex items-end justify-between h-40 gap-3 px-2">
                  {distribution.map((d) => (
                    <div key={d.grade} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                      <div className="text-[10px] text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.count}
                      </div>
                      <div
                        className="w-full bg-gradient-to-t from-amber-600/70 to-amber-400 rounded-t-lg transition-all group-hover:scale-x-105"
                        style={{ height: d.height }}
                      />
                      <div className="text-[10px] text-[var(--text-muted)] font-mono text-center truncate w-full mt-1">
                        {d.grade.split(" ")[0]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject Mastery checklist */}
              <div className="xl:col-span-2 theme-card p-6">
                <h3 className="text-[var(--text-heading)] font-semibold text-xs mb-5 uppercase tracking-wider"><Target className="w-4 h-4 inline-block mr-1 text-inherit" /> {lang === "தமிழ்" ? "கருத்து தேர்ச்சி குறியீடு" : "Concept Mastery Index"}</h3>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {mastery.map((m) => (
                    <div
                      key={m.topic}
                      className="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] p-3.5 rounded-xl border border-[var(--border)] flex justify-between items-center"
                    >
                      <div>
                        <div className="text-xs text-[var(--text-heading)] font-semibold">{m.topic}</div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="progress-bar w-24">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${m.score}%`,
                                background: m.status === "mastered" ? "#10b981" : m.status === "developing" ? "#f59e0b" : "#ef4444",
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-[var(--text-muted)]">{m.score}%</span>
                        </div>
                      </div>
                      <span
                        className={`badge ${
                          m.status === "mastered" ? "badge-green" : m.status === "developing" ? "badge-yellow" : "badge-red"
                        } text-[9px]`}
                      >
                        {m.status === "mastered" ? (lang === "தமிழ்" ? "தேர்ச்சி" : "mastered") : m.status === "developing" ? (lang === "தமிழ்" ? "வளர்கிறது" : "developing") : (lang === "தமிழ்" ? "கவனம் தேவை" : "critical")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Students Detailed performance table */}
            <div className="theme-card p-6">
              <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-[var(--text-heading)] font-semibold text-sm"><Clipboard className="w-4 h-4 inline-block mr-1 text-inherit" /> {lang === "தமிழ்" ? "மாணவர் கண்டறியும் அடைவு" : "Student Diagnostics Directory"}</h3>
                  <p className="text-xs text-slate-550">{lang === "தமிழ்" ? "ஒவ்வொரு மாணவரின் செயல்திறன் விவரங்கள் மற்றும் கருத்து இடைவெளிகளை மதிப்பாய்வு செய்யவும்." : "Review performance details and key concept gaps of each pupil."}</p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <input
                    type="text"
                    placeholder={lang === "தமிழ்" ? "பெயர்/பதிவு எண் தேடு..." : "Search name/roll..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-heading)] placeholder-slate-650 focus:outline-none focus:border-[var(--primary)]"
                  />

                  <div className="flex bg-[var(--bg-main)] border border-[var(--border)] rounded-lg p-0.5">
                    {(["All", "Good", "Average", "Risk"] as const).map((opt) => {
                      const optTranslated =
                        opt === "All" ? (lang === "தமிழ்" ? "அனைத்தும்" : "All") :
                        opt === "Good" ? (lang === "தமிழ்" ? "நன்று" : "Good") :
                        opt === "Average" ? (lang === "தமிழ்" ? "சராசரி" : "Average") :
                        (lang === "தமிழ்" ? "அபாயம்" : "Risk");
                      return (
                        <button
                          key={opt}
                          onClick={() => setStatusFilter(opt)}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                            statusFilter === opt ? "bg-[var(--primary)] text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                          }`}
                        >
                          {optTranslated}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{lang === "தமிழ்" ? "பதிவு எண்" : "Roll No"}</th>
                      <th>{lang === "தமிழ்" ? "மாணவர் பெயர்" : "Student Name"}</th>
                      <th>{lang === "தமிழ்" ? "வருகைப்பதிவு" : "Attendance"}</th>
                      <th>{lang === "தமிழ்" ? "வீட்டுப்பாடம் சமர்ப்பிப்புகள்" : "Homework submissions"}</th>
                      <th>{lang === "தமிழ்" ? "தேர்வு சராசரி" : "Exam Average"}</th>
                      <th>{lang === "தமிழ்" ? "கண்டறியப்பட்ட கருத்து இடைவெளிகள்" : "Identified Concept Gaps"}</th>
                      <th>{lang === "தமிழ்" ? "நிலை" : "Status"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents.map((st) => (
                      <tr key={st.rollNo}>
                        <td className="font-mono text-xs">{st.rollNo}</td>
                        <td className="font-semibold text-[var(--text-heading)]">{st.name}</td>
                        <td>
                          <span className={`font-semibold ${st.attendance && st.attendance >= 90 ? "text-emerald-400" : "text-amber-400"}`}>
                            {st.attendance !== null ? `${st.attendance}%` : "—"}
                          </span>
                        </td>
                        <td>{st.homeworkRate !== null ? `${st.homeworkRate}%` : "—"}</td>
                        <td className="font-bold text-[var(--text-heading)]">{st.avgScore !== null ? `${st.avgScore}%` : "—"}</td>
                        <td>
                          {st.weakTopics.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {st.weakTopics.map((topic) => (
                                <span key={topic} className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 font-medium">
                                  {topic}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-medium">{lang === "தமிழ்" ? "செயலில் உள்ள இடைவெளிகள் இல்லை" : "No active gaps found"}</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              st.status === "Good" ? "badge-green" : st.status === "Average" ? "badge-yellow" : "badge-red"
                            }`}
                          >
                            {st.status === "Good" ? (lang === "தமிழ்" ? "நன்று" : "Good") : st.status === "Average" ? (lang === "தமிழ்" ? "சராசரி" : "Average") : (lang === "தமிழ்" ? "அபாயம்" : "Risk")}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center text-[var(--text-muted)] text-xs py-8">
                          {lang === "தமிழ்" ? "உங்கள் வினவலுடன் பொருந்தும் மாணவர் பதிவுகள் எதுவும் இல்லை." : "No student records match your query."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 text-xs">
                  <span className="text-[var(--text-muted)]">
                    {lang === "தமிழ்" 
                      ? `${filteredStudents.length} பதிவுகளில் ${indexOfFirstItem + 1} முதல் ${Math.min(indexOfLastItem, filteredStudents.length)} வரை காட்டுகிறது`
                      : `Showing ${indexOfFirstItem + 1} to ${Math.min(indexOfLastItem, filteredStudents.length)} of ${filteredStudents.length} entries`
                    }
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 border border-[var(--border)] text-[var(--text-heading)] rounded-lg disabled:opacity-50 hover:bg-[var(--bg-card-hover)] transition-colors"
                    >
                      {lang === "தமிழ்" ? "முந்தைய" : "Previous"}
                    </button>
                    <span className="px-3 py-1.5 flex items-center justify-center text-[var(--text-heading)] font-medium">
                      {lang === "தமிழ்" ? `பக்கம் ${currentPage} / ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 border border-[var(--border)] text-[var(--text-heading)] rounded-lg disabled:opacity-50 hover:bg-[var(--bg-card-hover)] transition-colors"
                    >
                      {lang === "தமிழ்" ? "அடுத்த" : "Next"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </PortalLayout>
  );
}

