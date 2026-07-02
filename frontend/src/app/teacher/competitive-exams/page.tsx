"use client";

import React, { useState, useEffect, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

interface CompetitiveExam {
  id: string;
  examName: string;
  category: string;
  conductedBy: string;
  registrationDeadline: string;
  examDate: string;
  studentsEnrolled: number;
  studentsCleared: number;
  status: string;
  eligibility: string;
  website: string;
}

interface StudyMaterial {
  id: string;
  title: string;
  exam: string;
  type: string;
  downloads: number;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const categoryColor: Record<string, string> = {
  Medical: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Engineering: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "Civil Services": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Banking: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  Defence: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  Law: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  Other: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

const categoryIcon: Record<string, string> = {
  Medical: "🏥",
  Engineering: "⚙️",
  "Civil Services": "🏛️",
  Banking: "🏦",
  Defence: "🛡️",
  Law: "⚖️",
  Other: "📖",
};

const statusColor: Record<string, string> = {
  "Upcoming": "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700",
  "Registration Open": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800",
  "Ongoing": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800",
  "Results Out": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800",
  "Completed": "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-800",
};

const statusDot: Record<string, string> = {
  "Upcoming": "bg-slate-400",
  "Registration Open": "bg-blue-500 animate-pulse",
  "Ongoing": "bg-amber-500 animate-pulse",
  "Results Out": "bg-emerald-500",
  "Completed": "bg-violet-500",
};

const staticMaterials: StudyMaterial[] = [
  { id: "1", title: "NEET Biology PYQ 2015–2024", exam: "NEET UG", type: "PDF", downloads: 245 },
  { id: "2", title: "JEE Main Maths Formula Sheet", exam: "JEE Main", type: "PDF", downloads: 312 },
  { id: "3", title: "TNPSC GK Tamil Notes", exam: "TNPSC", type: "PDF", downloads: 178 },
  { id: "4", title: "NDA Mathematics Crash Course", exam: "NDA", type: "Video", downloads: 134 },
  { id: "5", title: "CLAT Reasoning Practice Set", exam: "CLAT", type: "Worksheet", downloads: 89 },
];

const emptyForm = {
  examName: "",
  category: "Medical",
  conductedBy: "",
  registrationDeadline: "",
  examDate: "",
  status: "Upcoming",
  eligibility: "",
  website: "",
  studentsEnrolled: "0",
  studentsCleared: "0",
};

export default function CompetitiveExamsPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const teacherId = (session?.user as any)?.id;

  const [examsList, setExamsList] = useState<CompetitiveExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [activeTab, setActiveTab] = useState<"exams" | "materials" | "results">("exams");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (schoolId) params.append("schoolId", schoolId);
      const res = await fetch(`${API}/api/competitive-exams?${params}`);
      const data = await res.json();
      if (data.success) setExamsList(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const filtered = examsList.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = e.examName.toLowerCase().includes(q) || e.conductedBy.toLowerCase().includes(q);
    const matchCat = filterCategory === "All" || e.category === filterCategory;
    const matchStat = filterStatus === "All" || e.status === filterStatus;
    return matchSearch && matchCat && matchStat;
  });

  const handleOpenAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (e: CompetitiveExam) => {
    setForm({
      examName: e.examName,
      category: e.category,
      conductedBy: e.conductedBy,
      registrationDeadline: e.registrationDeadline,
      examDate: e.examDate,
      status: e.status,
      eligibility: e.eligibility || "",
      website: e.website || "",
      studentsEnrolled: String(e.studentsEnrolled),
      studentsCleared: String(e.studentsCleared),
    });
    setEditId(e.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.examName || !form.category || !form.conductedBy || !form.registrationDeadline || !form.examDate) {
      return Swal.fire({ icon: "error", title: "Missing Fields", text: "Exam Name, Category, Conducted By, Registration Deadline, and Exam Date are required." });
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        studentsEnrolled: Number(form.studentsEnrolled) || 0,
        studentsCleared: Number(form.studentsCleared) || 0,
        schoolId,
        teacherId,
      };
      const url = editId ? `${API}/api/competitive-exams/${editId}` : `${API}/api/competitive-exams`;
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchExams();
        Swal.fire({
          icon: "success",
          title: "Exam Tracker Saved",
          text: `"${form.examName}" has been successfully saved!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({ icon: "error", title: "Error", text: data.error || "Failed to save exam" });
      }
    } catch (e) {
      Swal.fire({ icon: "error", title: "Network Error", text: "Failed to connect to database." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete exam "${name}" from tracker?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API}/api/competitive-exams/${id}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            fetchExams();
            Swal.fire("Deleted!", `Exam "${name}" has been removed.`, "success");
          } else {
            Swal.fire("Error!", data.error || "Failed to delete exam.", "error");
          }
        } catch (e) {
          Swal.fire("Error!", "Network error occurred.", "error");
        }
      }
    });
  };

  const registrationOpenCount = examsList.filter((e) => e.status === "Registration Open").length;
  const totalEnrolled = examsList.reduce((a, e) => a + (e.studentsEnrolled || 0), 0);
  const totalCleared = examsList.reduce((a, e) => a + (e.studentsCleared || 0), 0);
  const successRate = totalEnrolled > 0 ? Math.round((totalCleared / totalEnrolled) * 100) : 0;

  return (
    <PortalLayout title="Competitive Exams" subtitle="Track competitive exam schedules, student enrollments and success rates">

      {/* ── KPI Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Exams Tracked", value: examsList.length, icon: "📋", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
          { label: "Registration Open", value: registrationOpenCount, icon: "📝", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
          { label: "Students Enrolled", value: totalEnrolled, icon: "👩‍🎓", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/20" },
          { label: "Clearance Rate", value: `${successRate}%`, icon: "🏆", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <div className={`w-9 h-9 ${kpi.bg} rounded-xl flex items-center justify-center text-lg mb-3`}>{kpi.icon}</div>
            <div className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* ── Category Quick Filter ─────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">🎯 Exam Categories</h3>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
          {(["All", "Medical", "Engineering", "Civil Services", "Defence", "Law", "Banking"] as const).map((cat) => {
            const isAll = cat === "All";
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`flex flex-col items-center p-2.5 rounded-xl border transition-all ${filterCategory === cat
                  ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-amber-300"
                }`}
              >
                <span className="text-xl mb-0.5">{isAll ? "📚" : categoryIcon[cat]}</span>
                <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 text-center leading-tight">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 mb-5 w-fit">
        {([
          { key: "exams", label: "📋 All Exams" },
          { key: "materials", label: "📚 Study Materials" },
          { key: "results", label: "🏆 Results Summary" },
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

      {/* ── Exams Tab ─────────────────────────────────────────── */}
      {activeTab === "exams" && (
        <>
          {/* Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Search exam name, board..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 flex-1 min-w-48 transition-colors"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white focus:outline-none focus:border-amber-500"
              >
                {["All", "Upcoming", "Registration Open", "Ongoing", "Results Out", "Completed"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="flex-1" />
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-md whitespace-nowrap"
              >
                + Add Exam
              </button>
            </div>
          </div>

          {/* Exam Cards */}
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">No competitive exams tracked yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((exam) => {
                const clearRate = exam.studentsEnrolled > 0
                  ? Math.round((exam.studentsCleared / exam.studentsEnrolled) * 100)
                  : 0;
                return (
                  <div key={exam.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all group">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                        {categoryIcon[exam.category] || "📖"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-amber-500 transition-colors leading-tight">{exam.examName}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">By {exam.conductedBy}</p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${categoryColor[exam.category] || "bg-slate-100 text-slate-600"}`}>
                        {exam.category}
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border inline-flex items-center gap-1 ${statusColor[exam.status] || ""}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot[exam.status] || "bg-slate-400"}`} />
                        {exam.status}
                      </span>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-2">
                        <div className="text-[9px] text-slate-400 font-semibold mb-0.5">Registration</div>
                        <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{exam.registrationDeadline}</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-2">
                        <div className="text-[9px] text-slate-400 font-semibold mb-0.5">Exam Date</div>
                        <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{exam.examDate}</div>
                      </div>
                    </div>

                    {/* Student Stats */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-center">
                        <div className="text-base font-black text-blue-500">{exam.studentsEnrolled}</div>
                        <div className="text-[9px] text-slate-400">Enrolled</div>
                      </div>
                      <div className="flex-1 mx-3">
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full animate-pulse" style={{ width: `${clearRate}%` }} />
                        </div>
                        <div className="text-[9px] text-slate-400 text-center mt-0.5">{clearRate}% cleared</div>
                      </div>
                      <div className="text-center">
                        <div className="text-base font-black text-emerald-500">{exam.studentsCleared}</div>
                        <div className="text-[9px] text-slate-400">Cleared</div>
                      </div>
                    </div>

                    {/* Eligibility */}
                    <p className="text-[10px] text-slate-400 mb-3 font-semibold">📋 {exam.eligibility}</p>

                    {/* Footer */}
                    <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3 gap-2">
                      {exam.website ? (
                        <a
                          href={exam.website.startsWith("http") ? exam.website : `https://${exam.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-500 hover:underline truncate max-w-32 block"
                        >
                          🌐 {exam.website}
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400">No URL</span>
                      )}
                      <div className="flex gap-1">
                        <button onClick={() => handleOpenEdit(exam)} className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded font-bold text-[10px] transition-all">Edit</button>
                        <button onClick={() => handleDelete(exam.id, exam.examName)} className="px-2 py-0.5 bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/20 rounded font-bold text-[10px] transition-all">Remove</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Study Materials Tab ───────────────────────────────── */}
      {activeTab === "materials" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-700 dark:text-white">📚 Exam Study Materials</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-3">Title</th>
                    <th className="px-5 py-3">Exam</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Downloads</th>
                  </tr>
                </thead>
                <tbody>
                  {staticMaterials.map((mat) => (
                    <tr key={mat.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-amber-50/30 dark:hover:bg-amber-500/5 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="text-xs font-bold text-slate-800 dark:text-white">{mat.title}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-semibold">{mat.exam}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] text-slate-400 font-semibold">{mat.type}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-black text-emerald-500">⬇ {mat.downloads}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Results Tab ───────────────────────────────────────── */}
      {activeTab === "results" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4">📊 Exam-wise Clearance Rate</h4>
              {examsList.filter((e) => e.studentsEnrolled > 0).map((e) => {
                const rate = Math.round((e.studentsCleared / e.studentsEnrolled) * 100);
                return (
                  <div key={e.id} className="mb-3">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{e.examName}</span>
                      <span className="font-black text-slate-800 dark:text-white">{e.studentsCleared}/{e.studentsEnrolled} ({rate}%)</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4">🗂 Category Breakdown</h4>
              {["Medical", "Engineering", "Civil Services", "Defence", "Law"].map((cat) => {
                const catExams = examsList.filter((e) => e.category === cat);
                const enrolled = catExams.reduce((a, e) => a + e.studentsEnrolled, 0);
                return (
                  <div key={cat} className="flex items-center gap-3 mb-3">
                    <span className="text-lg">{categoryIcon[cat]}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">{cat}</span>
                        <span className="text-slate-400">{enrolled} students</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cat === "Medical" ? "bg-emerald-500" : cat === "Engineering" ? "bg-blue-500" : cat === "Civil Services" ? "bg-amber-500" : cat === "Defence" ? "bg-orange-500" : "bg-violet-500"}`}
                          style={{ width: `${enrolled > 0 ? Math.min((enrolled / 50) * 100, 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">{editId ? "✏️ Edit Competitive Exam" : "📋 Add Competitive Exam"}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Track a competitive exam for your students</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                ✕ Close
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Exam Name *</label>
                <input value={form.examName} onChange={(e) => setForm({ ...form, examName: e.target.value })} type="text" placeholder="e.g. NEET UG 2026" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Category *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none">
                    {["Medical", "Engineering", "Civil Services", "Banking", "Defence", "Law", "Other"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Conducted By *</label>
                  <input value={form.conductedBy} onChange={(e) => setForm({ ...form, conductedBy: e.target.value })} type="text" placeholder="e.g. NTA, UPSC" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Registration Deadline *</label>
                  <input value={form.registrationDeadline} onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })} type="date" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Exam Date *</label>
                  <input value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} type="date" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Eligibility</label>
                <input value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} type="text" placeholder="e.g. Class 12 with PCB" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Website URL</label>
                <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} type="text" placeholder="neet.nta.nic.in" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Students Enrolled</label>
                  <input value={form.studentsEnrolled} onChange={(e) => setForm({ ...form, studentsEnrolled: e.target.value })} type="number" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Students Cleared</label>
                  <input value={form.studentsCleared} onChange={(e) => setForm({ ...form, studentsCleared: e.target.value })} type="number" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none">
                  {["Upcoming", "Registration Open", "Ongoing", "Results Out", "Completed"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleSave} disabled={saving} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold rounded-xl text-xs transition-colors shadow-md">
                {saving ? "Saving..." : editId ? "Save Changes" : "📋 Add Exam to Tracker"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
