"use client";

import React, { useState, useEffect, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

interface StudentProfile {
  id: string;
  studentName: string;
  studentId?: string;
  class: string;
  section: string;
  academicScore: number;
  attendance: number;
  strengths: string[];
  weaknesses: string[];
  goal: string;
  parentContact: string;
  guidanceStatus: string;
  notes: string;
  lastMeeting: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const statusColor: Record<string, string> = {
  "On Track": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800",
  "Needs Attention": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800",
  "At Risk": "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800",
};

const statusDot: Record<string, string> = {
  "On Track": "bg-emerald-500",
  "Needs Attention": "bg-amber-500",
  "At Risk": "bg-red-500 animate-pulse",
};

const scoreColor = (score: number) =>
  score >= 85 ? "text-emerald-500" : score >= 70 ? "text-amber-500" : "text-red-500";

const emptyForm = {
  studentName: "",
  class: "12",
  section: "A",
  goal: "",
  guidanceStatus: "On Track",
  notes: "",
  academicScore: "75",
  attendance: "90",
  strengths: "",
  weaknesses: "",
  parentContact: "",
  lastMeeting: "",
};

export default function PersonalGuidePage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const teacherId = (session?.user as any)?.id;

  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterClass, setFilterClass] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (schoolId) params.append("schoolId", schoolId);
      if (teacherId) params.append("teacherId", teacherId);
      const res = await fetch(`${API}/api/personal-guide?${params}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [schoolId, teacherId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = s.studentName.toLowerCase().includes(q) || s.goal.toLowerCase().includes(q);
    const matchStatus = filterStatus === "All" || s.guidanceStatus === filterStatus;
    const matchClass = filterClass === "All" || s.class === filterClass;
    return matchSearch && matchStatus && matchClass;
  });

  const onTrackCount = students.filter((s) => s.guidanceStatus === "On Track").length;
  const attentionCount = students.filter((s) => s.guidanceStatus === "Needs Attention").length;
  const atRiskCount = students.filter((s) => s.guidanceStatus === "At Risk").length;

  const handleOpenAdd = () => {
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleOpenEdit = (s: StudentProfile) => {
    setForm({
      studentName: s.studentName,
      class: s.class,
      section: s.section,
      goal: s.goal,
      guidanceStatus: s.guidanceStatus,
      notes: s.notes || "",
      academicScore: String(s.academicScore),
      attendance: String(s.attendance),
      strengths: (s.strengths || []).join(", "),
      weaknesses: (s.weaknesses || []).join(", "),
      parentContact: s.parentContact || "",
      lastMeeting: s.lastMeeting || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.studentName || !form.class || !form.section) {
      return Swal.fire({ icon: "error", title: "Missing Fields", text: "Student Name, Class, and Section are required." });
    }
    setSaving(true);
    try {
      const editId = selectedStudent?.id || null;
      const body = {
        ...form,
        academicScore: Number(form.academicScore) || 0,
        attendance: Number(form.attendance) || 0,
        strengths: form.strengths.split(",").map((s) => s.trim()).filter(Boolean),
        weaknesses: form.weaknesses.split(",").map((s) => s.trim()).filter(Boolean),
        schoolId,
        teacherId,
      };
      const url = editId ? `${API}/api/personal-guide/${editId}` : `${API}/api/personal-guide`;
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchStudents();
        Swal.fire({
          icon: "success",
          title: "Guide Saved",
          text: `Guidance profile for "${form.studentName}" has been successfully saved!`,
          timer: 2000,
          showConfirmButton: false,
        });
        if (selectedStudent && selectedStudent.id === editId) {
          setSelectedStudent(data.data);
        }
      } else {
        Swal.fire({ icon: "error", title: "Error", text: data.error || "Failed to save profile" });
      }
    } catch (e) {
      Swal.fire({ icon: "error", title: "Network Error", text: "Failed to connect to the database." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete the guide profile for "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        setDeletingId(id);
        try {
          const res = await fetch(`${API}/api/personal-guide/${id}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            fetchStudents();
            Swal.fire("Deleted!", `Guidance profile for "${name}" has been deleted.`, "success");
            if (selectedStudent && selectedStudent.id === id) {
              setSelectedStudent(null);
            }
          } else {
            Swal.fire("Error!", data.error || "Failed to delete profile.", "error");
          }
        } catch (e) {
          Swal.fire("Error!", "Network error occurred.", "error");
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  return (
    <PortalLayout title="Personal Guide" subtitle="Mentor students individually — track goals, strengths & guidance status">

      {/* ── KPI Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Students", value: students.length, icon: "👩‍🎓", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
          { label: "On Track", value: onTrackCount, icon: "✅", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
          { label: "Needs Attention", value: attentionCount, icon: "⚠️", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
          { label: "At Risk", value: atRiskCount, icon: "🚨", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/20" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <div className={`w-9 h-9 ${kpi.bg} rounded-xl flex items-center justify-center text-lg mb-3`}>{kpi.icon}</div>
            <div className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions Banner ──────────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 mb-5 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">🧭 Personal Guide Dashboard</h3>
            <p className="text-xs text-indigo-100 mt-0.5">Track each student's journey from classroom to career. Personalize your guidance approach.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-white text-indigo-600 text-xs font-bold rounded-xl transition-all hover:bg-indigo-50 shadow-sm whitespace-nowrap"
            >
              + Add Student
            </button>
          </div>
        </div>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search student name, goal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 flex-1 min-w-48 transition-colors"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white focus:outline-none focus:border-indigo-400"
          >
            {["All", "On Track", "Needs Attention", "At Risk"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white focus:outline-none focus:border-indigo-400"
          >
            <option value="All">All Classes</option>
            {["9", "10", "11", "12"].map((c) => <option key={c} value={c}>Class {c}</option>)}
          </select>
          {loading && <span className="text-xs text-indigo-500 animate-pulse">Loading...</span>}
        </div>
      </div>

      {/* ── Student Cards ─────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">No student profiles found. <button onClick={handleOpenAdd} className="text-indigo-500 underline ml-1">Add student</button></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((student) => (
            <div key={student.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all">
              {/* Header */}
              <div className="flex items-start gap-2 mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-black text-base shrink-0">
                  {student.studentName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight truncate">{student.studentName}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">Class {student.class}{student.section} &nbsp;|&nbsp; {student.goal}</p>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border inline-flex items-center gap-1 shrink-0 ${statusColor[student.guidanceStatus]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusDot[student.guidanceStatus]}`} />
                  {student.guidanceStatus}
                </span>
                <button
                  onClick={() => handleDelete(student.id, student.studentName)}
                  disabled={deletingId === student.id}
                  className="text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 dark:bg-slate-900 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 ml-1 p-1 rounded-full shrink-0"
                  title="Remove Student"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-2.5 text-center">
                  <div className={`text-lg font-black ${scoreColor(student.academicScore)}`}>{student.academicScore}%</div>
                  <div className="text-[9px] text-slate-400 font-semibold">Academic Score</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-2.5 text-center">
                  <div className={`text-lg font-black ${scoreColor(student.attendance)}`}>{student.attendance}%</div>
                  <div className="text-[9px] text-slate-400 font-semibold">Attendance</div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="mb-3">
                {student.strengths && student.strengths.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {student.strengths.map((s) => (
                      <span key={s} className="text-[9px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded font-semibold">✓ {s}</span>
                    ))}
                  </div>
                )}
                {student.weaknesses && student.weaknesses.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {student.weaknesses.map((w) => (
                      <span key={w} className="text-[9px] px-1.5 py-0.5 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded font-semibold">⚠ {w}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes preview */}
              <p className="text-[10px] text-slate-400 italic leading-relaxed mb-3 line-clamp-2">"{student.notes}"</p>

              {/* Footer */}
              <div className="border-t border-slate-100 dark:border-slate-800/60 mt-3 pt-3 flex justify-between items-center">
                <button
                  onClick={() => setSelectedStudent(student)}
                  className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg font-bold text-xs transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                >
                  View Details
                </button>
                <button
                  onClick={() => { setSelectedStudent(student); handleOpenEdit(student); }}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-lg font-bold text-[10px] transition-all"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Student Detail Modal ──────────────────────────────── */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-5 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black text-lg">
                  {selectedStudent.studentName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white">{selectedStudent.studentName}</h3>
                  <p className="text-xs text-indigo-100 mt-0.5">Class {selectedStudent.class}{selectedStudent.section} &nbsp;·&nbsp; {selectedStudent.goal}</p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-grey/70 hover:text-grey text-xs px-2 py-1 rounded-lg hover:bg-grey/10 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-3 py-1 rounded-full font-bold border ${statusColor[selectedStudent.guidanceStatus]}`}>
                  {selectedStudent.guidanceStatus}
                </span>
                <span className="text-[10px] text-slate-400">Last meeting: {selectedStudent.lastMeeting || "N/A"}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center">
                  <div className={`text-2xl font-black ${scoreColor(selectedStudent.academicScore)}`}>{selectedStudent.academicScore}%</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Academic Score</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center">
                  <div className={`text-2xl font-black ${scoreColor(selectedStudent.attendance)}`}>{selectedStudent.attendance}%</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Attendance</div>
                </div>
              </div>

              {selectedStudent.strengths && selectedStudent.strengths.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Strengths</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudent.strengths.map((s) => (
                      <span key={s} className="text-xs px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-lg font-semibold">✓ {s}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedStudent.weaknesses && selectedStudent.weaknesses.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Areas to Improve</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudent.weaknesses.map((w) => (
                      <span key={w} className="text-xs px-2.5 py-1 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg font-semibold">⚠ {w}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Guidance Notes</label>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{selectedStudent.notes || "No notes recorded."}</p>
              </div>

              <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl p-3">
                <span className="text-lg">📱</span>
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Parent Contact</div>
                  <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{selectedStudent.parentContact || "N/A"}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { handleOpenEdit(selectedStudent); }}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
                >
                  ✏️ Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">{selectedStudent ? "✏️ Edit Student Profile" : "👩‍🎓 Add Student Profile"}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Add or update student guidance details</p>
              </div>
              <button
                onClick={() => { setShowModal(false); setSelectedStudent(null); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                ✕ Close
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Student Name *</label>
                <input value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} type="text" placeholder="e.g. Priya Sundaram" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Class *</label>
                  <select value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-400">
                    {["9", "10", "11", "12"].map((c) => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Section *</label>
                  <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-400">
                    {["A", "B", "C", "D"].map((s) => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Academic Score (%)</label>
                  <input value={form.academicScore} onChange={(e) => setForm({ ...form, academicScore: e.target.value })} type="number" placeholder="85" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Attendance (%)</label>
                  <input value={form.attendance} onChange={(e) => setForm({ ...form, attendance: e.target.value })} type="number" placeholder="95" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Career Goal</label>
                <input value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} type="text" placeholder="e.g. NEET – Medical College" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Parent Contact</label>
                <input value={form.parentContact} onChange={(e) => setForm({ ...form, parentContact: e.target.value })} type="text" placeholder="+91 98765 43210" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Guidance Status</label>
                <select value={form.guidanceStatus} onChange={(e) => setForm({ ...form, guidanceStatus: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-400">
                  {["On Track", "Needs Attention", "At Risk"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Strengths (comma separated)</label>
                  <input value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })} type="text" placeholder="Biology, Chemistry" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Weaknesses (comma separated)</label>
                  <input value={form.weaknesses} onChange={(e) => setForm({ ...form, weaknesses: e.target.value })} type="text" placeholder="Physics, Maths" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Last Meeting Date</label>
                <input value={form.lastMeeting} onChange={(e) => setForm({ ...form, lastMeeting: e.target.value })} type="text" placeholder="2025-06-28" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Guidance Notes</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Guidance notes..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 resize-none" />
              </div>
              <button onClick={handleSave} disabled={saving} className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-bold rounded-xl text-xs transition-colors shadow-md">
                {saving ? "Saving..." : selectedStudent ? "✅ Save Changes" : "🧭 Save Guide Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
