"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";

// ─── Types ─────────────────────────────────────────────────────
interface ClassRoom {
  id: string;
  schoolId: string;
  teacherId: string | null;
  className: string;
  section: string;
  subject: string;
  academicYear: string;
  roomNumber: string | null;
  schedule: string | null;
  totalStudents: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

const SUBJECTS = [
  "Mathematics", "Science", "Social Science", "English", "Tamil",
  "Physics", "Chemistry", "Biology", "History", "Geography",
  "Computer Science", "Commerce", "Economics", "Accountancy",
];

const CLASS_NUMS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const SECTIONS = ["A", "B", "C", "D", "E"];
const YEARS = ["2023-24", "2024-25", "2025-26"];

// ─── Helpers ───────────────────────────────────────────────────
const subjectColors: Record<string, string> = {
  Mathematics: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  Science: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  English: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  Tamil: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Physics: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Chemistry: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  Biology: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  "Social Science": "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  "Computer Science": "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  History: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  Geography: "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300",
  Commerce: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
  Economics: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  Accountancy: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300",
};

function badgeClass(subject: string) {
  return subjectColors[subject] ?? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
}

const EMPTY_FORM = {
  className: "10",
  section: "A",
  subject: "Mathematics",
  academicYear: "2024-25",
  roomNumber: "",
  schedule: "",
  totalStudents: "",
  description: "",
};

// ─── Component ─────────────────────────────────────────────────
export default function ClassesPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const schoolId = user?.schoolId || "";
  const teacherId = user?.id || "";
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModal, setIsModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterSubj, setFilterSubj] = useState("All");
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // ── Fetch ────────────────────────────────────────────────────
  const fetchClasses = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/classes?schoolId=${schoolId}&teacherId=${teacherId}`);
      const data = await res.json();
      if (data.success) setClasses(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [schoolId, teacherId, API_URL]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  // ── Open modal (add / edit) ──────────────────────────────────
  const openAdd = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setIsModal(true);
  };

  const openEdit = (c: ClassRoom) => {
    setEditingId(c.id);
    setForm({
      className: c.className,
      section: c.section,
      subject: c.subject,
      academicYear: c.academicYear,
      roomNumber: c.roomNumber ?? "",
      schedule: c.schedule ?? "",
      totalStudents: String(c.totalStudents),
      description: c.description ?? "",
    });
    setIsModal(true);
  };

  const closeModal = () => { setIsModal(false); setEditingId(null); };

  // ── Submit (POST / PUT) ──────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) return showToast("No school linked to your account", "error");

    setSubmitting(true);
    const payload = {
      schoolId,
      teacherId,
      className: form.className,
      section: form.section,
      subject: form.subject,
      academicYear: form.academicYear,
      roomNumber: form.roomNumber || null,
      schedule: form.schedule || null,
      totalStudents: parseInt(form.totalStudents) || 0,
      description: form.description || null,
    };

    const url = editingId ? `${API_URL}/api/classes/${editingId}` : `${API_URL}/api/classes`;
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: data.message || `Class ${editingId ? "updated" : "created"} successfully!`,
          timer: 2000,
          showConfirmButton: false,
        });
        closeModal();
        fetchClasses();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: data.error || "Operation failed",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Network error. Check backend server.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────
  const handleDelete = async (c: ClassRoom) => {
    const result = await Swal.fire({
      title: "Delete Class?",
      html: `<div style="font-size:13px;color:#475569">
               You are about to permanently delete<br/>
               <strong style="color:#ef4444">Class ${c.className}${c.section} — ${c.subject}</strong><br/>
               This cannot be undone.
             </div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/classes/${c.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        Swal.fire({ icon: "success", title: "Deleted!", text: data.message, timer: 2000, showConfirmButton: false });
        fetchClasses();
      } else {
        showToast(data.error || "Delete failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  // ── Filter ───────────────────────────────────────────────────
  const filtered = classes.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      `class ${c.className}${c.section}`.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      (c.roomNumber || "").toLowerCase().includes(q) ||
      (c.schedule || "").toLowerCase().includes(q);
    const matchSubj = filterSubj === "All" || c.subject === filterSubj;
    return matchSearch && matchSubj;
  });

  const activeCount = classes.filter((c) => c.isActive).length;
  const totalStudents = classes.reduce((a, c) => a + c.totalStudents, 0);
  const uniqueSubjects = Array.from(new Set(classes.map((c) => c.subject)));

  // ─── Render ────────────────────────────────────────────────
  return (
    <PortalLayout title="My Classes" subtitle="Manage your sections, student rosters, and schedules">
      {/* Toast */}
      {toast && (
        <div className={`mb-5 px-4 py-3 rounded-xl text-xs font-semibold border shadow-sm fade-in ${toast.type === "success"
          ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300"
          : "bg-red-50 border-red-200 text-red-800 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300"
          }`}>
          {toast.msg}
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Classes", value: classes.length, icon: "🏫", color: "text-amber-500" },
          { label: "Active Classes", value: activeCount, icon: "✅", color: "text-emerald-500" },
          { label: "Total Students", value: totalStudents, icon: "🎓", color: "text-violet-500" },
          { label: "Subjects Taught", value: uniqueSubjects.length, icon: "📚", color: "text-sky-500" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl">{kpi.icon}</span>
            </div>
            <div className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">📋 Class Directory</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Create and manage all your assigned class sections stored in PostgreSQL.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search class, subject, room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 w-56 transition-colors"
            />
            <select
              value={filterSubj}
              onChange={(e) => setFilterSubj(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="All">All Subjects</option>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              onClick={openAdd}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-md whitespace-nowrap"
            >
              + Create Class
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin mb-3" />
          <span className="text-xs text-slate-400">Loading classes from PostgreSQL...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <span className="text-5xl block mb-4">🏫</span>
          <h3 className="text-sm font-bold text-slate-700 dark:text-white mb-2">
            {classes.length === 0 ? "No Classes Created Yet" : "No Matching Classes Found"}
          </h3>
          <p className="text-xs text-slate-400 mb-5">
            {classes.length === 0
              ? "Create your first class section to get started."
              : "Try adjusting your search or filter."}
          </p>
          {classes.length === 0 && (
            <button
              onClick={openAdd}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-md"
            >
              + Create First Class
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Class / Section</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Academic Year</th>
                  <th className="px-5 py-3">Room</th>
                  <th className="px-5 py-3">Schedule</th>
                  <th className="px-5 py-3">Students</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-amber-50/30 dark:hover:bg-amber-500/5 transition-colors"
                  >
                    {/* Class / Section */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-sm shrink-0">
                          {c.className}{c.section}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-white text-xs">
                            Class {c.className} – {c.section}
                          </div>
                          {c.description && (
                            <div className="text-[10px] text-slate-400 mt-0.5 max-w-[140px] truncate">{c.description}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${badgeClass(c.subject)}`}>
                        {c.subject}
                      </span>
                    </td>

                    {/* Year */}
                    <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      {c.academicYear}
                    </td>

                    {/* Room */}
                    <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                      {c.roomNumber ? `🚪 ${c.roomNumber}` : <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </td>

                    {/* Schedule */}
                    <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-400 max-w-[130px]">
                      {c.schedule ? `⏰ ${c.schedule}` : <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </td>

                    {/* Students */}
                    <td className="px-5 py-3.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {c.totalStudents > 0 ? `👥 ${c.totalStudents}` : <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${c.isActive
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                        {c.isActive ? "● Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-lg font-bold text-[10px] transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/20 rounded-lg font-bold text-[10px] transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between items-center">
            <span>Showing {filtered.length} of {classes.length} classes</span>
            {/* <span>Data stored in PostgreSQL · TN Schools AI</span> */}
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────────── */}
      {isModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  {editingId ? "✏️ Edit Class" : "🏫 Create New Class"}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {editingId ? "Update class details in PostgreSQL." : "Add a new class section to your registry."}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Class + Section */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Class Number *</label>
                  <select
                    required
                    value={form.className}
                    onChange={(e) => setForm({ ...form, className: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    {CLASS_NUMS.map((c) => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Section *</label>
                  <select
                    required
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    {SECTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Subject *</label>
                <select
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                >
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Academic Year + Total Students */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Academic Year</label>
                  <select
                    value={form.academicYear}
                    onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Total Students</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.totalStudents}
                    onChange={(e) => setForm({ ...form, totalStudents: e.target.value })}
                    placeholder="e.g. 42"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Room + Schedule */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Room Number</label>
                  <input
                    type="text"
                    value={form.roomNumber}
                    onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                    placeholder="e.g. Room 12"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Schedule</label>
                  <input
                    type="text"
                    value={form.schedule}
                    onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                    placeholder="e.g. Mon/Wed 9–10AM"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Description (optional)</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short notes about this class..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold rounded-xl text-xs transition-colors shadow-md mt-1"
              >
                {submitting
                  ? "Saving to PostgreSQL..."
                  : editingId
                    ? "💾 Save Changes"
                    : "🏫 Create Class"}
              </button>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
