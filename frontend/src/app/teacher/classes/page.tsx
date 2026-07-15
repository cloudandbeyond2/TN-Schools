"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import KpiStrip from "@/components/kpi/KpiStrip";

// ─── Types ─────────────────────────────────────────────────────
interface DailyClass {
  id: string;
  classRoomId: string;
  className: string;
  section: string;
  subject: string;
  period: number;
  timeSlot: string;
  status: 'Scheduled' | 'Completed' | 'Postponed';
  notes: string;
}

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
const SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H"];
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
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModal, setIsModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterSubj, setFilterSubj] = useState("All");
  const [filterClass, setFilterClass] = useState("All");
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Daily Classes State
  const [todayClasses, setTodayClasses] = useState<DailyClass[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<string[]>([]);

  // Fetch school configuration for valid classes
  useEffect(() => {
    if (!schoolId) return;
    const fetchSchoolDetails = async () => {
      try {
        const res = await fetch(`${API_URL}/api/schools/${schoolId}`);
        const data = await res.json();
        if (data.success && data.data?.classes) {
          setSchoolClasses(data.data.classes);
        }
      } catch (err) {
        console.error("Error fetching school details:", err);
      }
    };
    fetchSchoolDetails();
  }, [schoolId, API_URL]);
  
  // Modals State
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [postponeModalOpen, setPostponeModalOpen] = useState(false);
  const [selectedDailyClass, setSelectedDailyClass] = useState<DailyClass | null>(null);
  const [tempNote, setTempNote] = useState("");
  const [postponeReason, setPostponeReason] = useState("");
  const [intimateHM, setIntimateHM] = useState(true);

  // ── Fetch ────────────────────────────────────────────────────
  const fetchClasses = useCallback(async () => {
    if (!schoolId || !teacherId) return;
    setLoading(true);
    try {
      // 1. Fetch classes for this teacher in this school
      const classRes = await fetch(
        `${API_URL}/api/classes?schoolId=${schoolId}&teacherId=${teacherId}`
      );
      const classData = await classRes.json();
      const fetchedClasses: ClassRoom[] = classData.success ? classData.data : [];
      if (classData.success) setClasses(fetchedClasses);

      // 2. Fetch timetable for this teacher & derive today's schedule
      try {
        const timetableRes = await fetch(
          `${API_URL}/api/timetable/teacher/${teacherId}`
        );
        const timetableData = await timetableRes.json();
        if (timetableData.success) {
          const allSlots: any[] = timetableData.data;
          setTimetable(allSlots);

          // Filter to today's day-of-week (JS: 0=Sun,1=Mon,...,5=Fri,6=Sat)
          // Backend stores dayOfWeek as 1=Mon … 5=Fri
          const jsDow = new Date().getDay(); // 0=Sun … 6=Sat
          const todayDow = jsDow === 0 ? 7 : jsDow; // map Sun→7 so weekends show nothing
          const todaySlots = allSlots.filter(
            (s: any) => s.dayOfWeek === todayDow
          );

          // Map timetable slots → DailyClass shape
          const mapped: DailyClass[] = todaySlots.map((s: any) => {
            // Try to link to a ClassRoom record for classRoomId
            const matchedRoom = fetchedClasses.find(
              (cr) =>
                cr.className === String(s.class) &&
                cr.section === s.section &&
                cr.subject === s.subject
            );
            // Build a human-readable time slot from period number if not stored
            const periodTimes: Record<number, string> = {
              1: '09:00 AM – 09:45 AM',
              2: '09:50 AM – 10:35 AM',
              3: '10:45 AM – 11:30 AM',
              4: '11:35 AM – 12:20 PM',
              5: '01:00 PM – 01:45 PM',
              6: '01:50 PM – 02:35 PM',
              7: '02:40 PM – 03:25 PM',
              8: '03:30 PM – 04:15 PM',
            };
            return {
              id: s.id,
              classRoomId: matchedRoom?.id ?? s.classRoomId ?? '',
              className: String(s.class ?? s.className ?? ''),
              section: s.section ?? '',
              subject: s.subject ?? '',
              period: s.period ?? 1,
              timeSlot:
                s.startTime && s.endTime
                  ? `${s.startTime} – ${s.endTime}`
                  : periodTimes[s.period] ?? `Period ${s.period}`,
              status: (s.status as DailyClass['status']) ?? 'Scheduled',
              notes: s.notes ?? '',
            };
          });

          // Sort by period
          mapped.sort((a, b) => a.period - b.period);
          setTodayClasses(mapped);
        }
      } catch (err) {
        console.error('[timetable fetch]', err);
      }
    } catch (e) {
      console.error('[fetchClasses]', e);
    } finally {
      setLoading(false);
    }
  }, [schoolId, teacherId, API_URL]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);



  // Dynamic schedule autofill when creating class details
  useEffect(() => {
    if (!schoolId || !isModal || editingId) return;

    const fetchSchedulePreset = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/timetable?schoolId=${schoolId}&class=${form.className}&section=${form.section}`
        );
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          // Filter slots that match the selected subject
          const matchSlots = data.data.filter(
            (s: any) => s.subject.toLowerCase() === form.subject.toLowerCase()
          );
          if (matchSlots.length > 0) {
            const dayNames: Record<number, string> = { 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri" };
            const scheduleStr = matchSlots
              .sort((a: any, b: any) => {
                if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
                return a.period - b.period;
              })
              .map((s: any) => `${dayNames[s.dayOfWeek] || `Day ${s.dayOfWeek}`} (P${s.period})`)
              .join(", ");

            setForm((prev) => ({
              ...prev,
              schedule: scheduleStr,
            }));
          } else {
            setForm((prev) => ({
              ...prev,
              schedule: "",
            }));
          }
        } else {
          setForm((prev) => ({
            ...prev,
            schedule: "",
          }));
        }
      } catch (err) {
        console.error("Error auto-fetching schedule preset", err);
      }
    };

    fetchSchedulePreset();
  }, [form.className, form.section, form.subject, schoolId, isModal, editingId, API_URL]);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  // ── Daily Actions ────────────────────────────────────────────
  const handleOpenNotes = (c: DailyClass) => {
    setSelectedDailyClass(c);
    setTempNote(c.notes);
    setNotesModalOpen(true);
  };

  const handleSaveNotes = () => {
    if (!selectedDailyClass) return;
    setTodayClasses(prev => prev.map(tc => tc.id === selectedDailyClass.id ? { ...tc, notes: tempNote } : tc));
    setNotesModalOpen(false);
    showToast("Notes saved successfully!", "success");
  };

  const handleOpenPostpone = (c: DailyClass) => {
    setSelectedDailyClass(c);
    setPostponeReason("");
    setIntimateHM(true);
    setPostponeModalOpen(true);
  };

  const handleSavePostpone = () => {
    if (!selectedDailyClass) return;
    setTodayClasses(prev => prev.map(tc => tc.id === selectedDailyClass.id ? { ...tc, status: 'Postponed' } : tc));
    setPostponeModalOpen(false);
    showToast(`Class postponed.${intimateHM ? ' HM has been intimated.' : ''}`, "success");
  };

  // ── Open modal (add / edit) ──────────────────────────────────
  const openAdd = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      className: schoolClasses.length > 0 ? schoolClasses[0] : "10"
    });
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
  // Build unique class options from fetched PostgreSQL data (teacher-specific)
  const classOptions = Array.from(
    new Map(
      classes.map((c) => [`${c.className}-${c.section}`, { className: c.className, section: c.section }])
    ).values()
  ).sort((a, b) => {
    const numA = parseInt(a.className);
    const numB = parseInt(b.className);
    if (numA !== numB) return numA - numB;
    return a.section.localeCompare(b.section);
  });

  const filtered = classes.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      `class ${c.className}${c.section}`.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      (c.roomNumber || "").toLowerCase().includes(q) ||
      (c.schedule || "").toLowerCase().includes(q);
    const matchSubj = filterSubj === "All" || c.subject === filterSubj;
    const matchClass = !filterClass || filterClass === "All" || `${c.className}-${c.section}` === filterClass;
    return matchSearch && matchSubj && matchClass;
  });

  const activeCount = classes.filter((c) => c.isActive).length;
  const totalStudents = classes.reduce((a, c) => a + c.totalStudents, 0);
  const uniqueSubjects = Array.from(new Set(classes.map((c) => c.subject)));

  // Helper to dynamically compile schedule from timetable slots
  const getClassSchedule = (c: ClassRoom) => {
    const slots = timetable.filter(
      (s) => s.class === c.className && s.section === c.section
    );
    if (slots.length === 0) return c.schedule || "";

    const dayNames: Record<number, string> = { 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri" };
    return slots
      .sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
        return a.period - b.period;
      })
      .map((s) => `${dayNames[s.dayOfWeek] || `Day ${s.dayOfWeek}`} (P${s.period})`)
      .join(", ");
  };

  // ─── Render ────────────────────────────────────────────────
  return (
    <PortalLayout title="My Classes" subtitle="Manage your sections, student rosters, and schedules">
      {/* Academic-year school KPIs */}
      <KpiStrip path={schoolId ? `/api/analytics/school/${schoolId}` : null} title="School KPIs" variant="light" />

      {/* Toast */}
      {toast && (
        <div className={`mb-5 px-4 py-3 rounded-xl text-xs font-semibold border shadow-sm fade-in ${toast.type === "success"
          ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300"
          : "bg-red-50 border-red-200 text-red-800 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300"
          }`}>
          {toast.msg}
        </div>
      )}

      {/* Today's Schedule & Actions */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center mb-4">
          <i className="fi fi-rr-calendar-day mr-2 text-amber-500"></i> Today's Schedule
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {todayClasses.map(tc => (
            <div key={tc.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className={`text-[10px] px-2.5 py-1 rounded-full font-semibold inline-block mb-2 ${badgeClass(tc.subject)}`}>
                    {tc.subject}
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">Class {tc.className} - {tc.section}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <i className="fi fi-rr-clock-three mr-1"></i> Period {tc.period} ({tc.timeSlot})
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  tc.status === 'Completed' ? "bg-emerald-100 text-emerald-700" :
                  tc.status === 'Postponed' ? "bg-red-100 text-red-700" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {tc.status}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => showToast("Redirecting to Attendance Module...", "success")}
                  className="flex-1 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200 rounded-lg text-xs font-bold transition-colors"
                >
                  <i className="fi fi-rr-users-alt mr-1"></i> Attendance
                </button>
                <button 
                  onClick={() => handleOpenNotes(tc)}
                  className="flex-1 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-600 border border-violet-200 rounded-lg text-xs font-bold transition-colors"
                >
                  <i className="fi fi-rr-document mr-1"></i> Notes
                </button>
                {tc.status !== 'Postponed' && tc.status !== 'Completed' && (
                  <button 
                    onClick={() => handleOpenPostpone(tc)}
                    className="flex-none px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold transition-colors"
                    title="Postpone Class"
                  >
                    <i className="fi fi-rr-calendar-xmark"></i>
                  </button>
                )}
              </div>
            </div>
          ))}
          {todayClasses.length === 0 && (
            <div className="col-span-full py-8 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-slate-400 text-sm">No classes scheduled for today.</p>
            </div>
          )}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Classes", value: classes.length, icon: <i className="fi fi-rr-building"></i>, color: "text-amber-500" },
          { label: "Active Classes", value: activeCount, icon: <i className="fi fi-rr-check-circle"></i>, color: "text-emerald-500" },
          { label: "Total Students", value: totalStudents, icon: <i className="fi fi-rr-graduation-cap"></i>, color: "text-violet-500" },
          { label: "Subjects Taught", value: uniqueSubjects.length, icon: <i className="fi fi-rr-book-alt"></i>, color: "text-sky-500" },
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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white"><i className="fi fi-rr-clipboard mr-2 text-amber-500"></i>Class Directory</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Showing classes assigned to you from PostgreSQL — filter by class or subject.
              </p>
            </div>
            <button
              onClick={openAdd}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-md whitespace-nowrap self-start lg:self-auto"
            >
              + Create Class
            </button>
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            {/* Class Dropdown — fetched from DB */}
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Filter by Class</label>
              <select
                value={filterClass}
                onChange={(e) => { setFilterClass(e.target.value); }}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white focus:outline-none focus:border-amber-500 transition-colors min-w-[160px]"
              >
                <option value="All">All Classes</option>
                {classOptions.map((opt) => (
                  <option key={`${opt.className}-${opt.section}`} value={`${opt.className}-${opt.section}`}>
                    Class {opt.className} — {opt.section}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Dropdown */}
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Filter by Subject</label>
              <select
                value={filterSubj}
                onChange={(e) => setFilterSubj(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white focus:outline-none focus:border-amber-500 transition-colors min-w-[150px]"
              >
                <option value="All">All Subjects</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Search */}
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Search</label>
              <input
                type="text"
                placeholder="Class, subject, room..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 w-52 transition-colors"
              />
            </div>

            {/* Active Filter Chips */}
            {(filterClass !== "All" || filterSubj !== "All" || search) && (
              <div className="flex flex-wrap items-center gap-2 ml-auto">
                {filterClass !== "All" && (
                  <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    <i className="fi fi-rr-school"></i> Class {filterClass.replace('-', ' — ')}
                    <button onClick={() => setFilterClass("All")} className="ml-1 hover:text-amber-900">×</button>
                  </span>
                )}
                {filterSubj !== "All" && (
                  <span className="inline-flex items-center gap-1.5 bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    <i className="fi fi-rr-book-alt"></i> {filterSubj}
                    <button onClick={() => setFilterSubj("All")} className="ml-1 hover:text-sky-900">×</button>
                  </span>
                )}
                {search && (
                  <span className="inline-flex items-center gap-1.5 bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    <i className="fi fi-rr-search"></i> "{search}"
                    <button onClick={() => setSearch("")} className="ml-1 hover:text-slate-900">×</button>
                  </span>
                )}
                <button
                  onClick={() => { setFilterClass("All"); setFilterSubj("All"); setSearch(""); }}
                  className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-white underline"
                >
                  Clear all
                </button>
              </div>
            )}
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
          <span className="text-5xl block mb-4 text-slate-300 dark:text-slate-700"><i className="fi fi-rr-building"></i></span>
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
        <>
          {/* Mobile/Tablet Single Sentence Cards View */}
          <div className="block lg:hidden space-y-4">
            {filtered.map((c) => (
              <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                {/* Subject & Status */}
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${badgeClass(c.subject)}`}>
                    {c.subject}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${c.isActive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                    {c.isActive ? "● Active" : "Inactive"}
                  </span>
                </div>

                {/* Single Sentence Description */}
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed mb-4">
                  Class <span className="font-black text-amber-500">{c.className} – {c.section}</span> {c.description ? `(${c.description})` : ""} is scheduled for <span className="font-bold text-slate-800 dark:text-white">{c.subject}</span> in the <span className="font-bold">{c.academicYear}</span> academic year, meeting in <span className="font-bold">{c.roomNumber || "—"}</span> on <span className="font-bold">{getClassSchedule(c) || "—"}</span> with <span className="font-bold">{c.totalStudents || 0} students</span>.
                </p>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <button
                    onClick={() => openEdit(c)}
                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-lg font-bold text-[10px] transition-all"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/20 rounded-lg font-bold text-[10px] transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
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
                      <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {c.roomNumber ? (
                          <span className="inline-flex items-center gap-1.5">
                            <i className="fi fi-rr-door-open text-sm"></i>
                            <span>{c.roomNumber}</span>
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>

                      {/* Schedule */}
                      <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {getClassSchedule(c) ? (
                          <span className="inline-flex items-center gap-1.5 bg-amber-500/5 text-amber-600 dark:text-amber-400 border border-amber-500/10 px-2 py-1 rounded-lg text-[10px] font-bold">
                            <i className="fi fi-rr-clock text-xs"></i>
                            <span>{getClassSchedule(c)}</span>
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>

                      {/* Students */}
                      <td className="px-5 py-3.5 text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {c.totalStudents > 0 ? (
                          <span className="inline-flex items-center gap-1.5">
                            <i className="fi fi-rr-users text-sm"></i>
                            <span>{c.totalStudents}</span>
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-bold border ${c.isActive
                          ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 border-emerald-200 dark:border-emerald-800/80"
                          : "bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                          <span>{c.isActive ? "Active" : "Inactive"}</span>
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
            </div>
          </div>
        </>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────────── */}
      {isModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center">
                  {editingId ? <><i className="fi fi-rr-edit mr-2 text-amber-500"></i> Edit Class</> : <><i className="fi fi-rr-building mr-2 text-amber-500"></i> Create New Class</>}
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
                    {(schoolClasses.length > 0 ? schoolClasses : CLASS_NUMS).map((c) => (
                      <option key={c} value={c}>Class {c}</option>
                    ))}
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
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold rounded-xl text-xs transition-colors shadow-md mt-1 flex items-center justify-center gap-2"
              >
                {submitting
                  ? "Saving to PostgreSQL..."
                  : editingId
                    ? <><i className="fi fi-rr-disk"></i> Save Changes</>
                    : <><i className="fi fi-rr-building"></i> Create Class</>}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* ── Notes Modal ─────────────────────────────────── */}
      {notesModalOpen && selectedDailyClass && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center">
                <i className="fi fi-rr-document mr-2 text-violet-500"></i> Lesson Notes
              </h3>
              <button onClick={() => setNotesModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs px-2 py-1 rounded-lg">✕ Close</button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Class {selectedDailyClass.className}-{selectedDailyClass.section} • {selectedDailyClass.subject}
                </p>
                <p className="text-[10px] text-slate-500">{selectedDailyClass.timeSlot}</p>
              </div>
              <textarea
                rows={5}
                value={tempNote}
                onChange={(e) => setTempNote(e.target.value)}
                placeholder="Write your lesson plan, topics covered, or notes here..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors resize-none"
              />
              <button
                onClick={handleSaveNotes}
                className="w-full mt-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Postpone Modal ─────────────────────────────────── */}
      {postponeModalOpen && selectedDailyClass && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center">
                <i className="fi fi-rr-calendar-xmark mr-2 text-red-500"></i> Postpone Class
              </h3>
              <button onClick={() => setPostponeModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs px-2 py-1 rounded-lg">✕ Close</button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Class {selectedDailyClass.className}-{selectedDailyClass.section} • {selectedDailyClass.subject}
                </p>
                <p className="text-[10px] text-slate-500">{selectedDailyClass.timeSlot}</p>
              </div>
              <div className="mb-4">
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Reason for Postponement</label>
                <input
                  type="text"
                  value={postponeReason}
                  onChange={(e) => setPostponeReason(e.target.value)}
                  placeholder="e.g., Unwell, Meeting scheduled..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
              <div className="mb-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="intimateHM"
                  checked={intimateHM}
                  onChange={(e) => setIntimateHM(e.target.checked)}
                  className="rounded text-red-500 focus:ring-red-500"
                />
                <label htmlFor="intimateHM" className="text-xs text-slate-700 dark:text-slate-300">Intimate HM about this postponement</label>
              </div>
              <button
                onClick={handleSavePostpone}
                className="w-full mt-2 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
              >
                Confirm Postponement
              </button>
            </div>
          </div>
        </div>
      )}

    </PortalLayout>
  );
}
