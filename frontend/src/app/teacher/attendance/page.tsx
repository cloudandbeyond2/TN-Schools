"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import { Users, CheckCircle2, AlertCircle, TrendingUp, Calendar, Filter, Save, Check, ArrowRight, ClipboardList, Grid, Clipboard } from "lucide-react";

interface AttendanceStudent {
  id: string;
  name: string;
  rollNo: string;
  className: string;
  section: string;
  status: "Present" | "Absent" | "Late";
}

interface WeeklyRecord {
  date: string;
  dayOfWeek: number;
  status: "PRESENT" | "ABSENT" | "LATE";
}

interface WeeklyStudent {
  id: string;
  name: string;
  rollNo: string;
  className: string;
  section: string;
  records: WeeklyRecord[];
}

export default function AttendancePage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Tabs: 'daily' | 'weekly'
  const [activeTab, setActiveTab] = useState<"daily" | "weekly">("daily");

  // Selection States
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedWeek, setSelectedWeek] = useState<"current" | "last">("current");

  // Roster / Data States
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [weeklyStudents, setWeeklyStudents] = useState<WeeklyStudent[]>([]);
  const [weeklyRange, setWeeklyRange] = useState<{ start: string; end: string } | null>(null);

  // Loading & UI States
  const [loading, setLoading] = useState(true);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [sendSMS, setSendSMS] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch teacher classes on mount
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      if (!schoolId || !session?.user) return;
      const teacherId = (session.user as any).id;
      try {
        const res = await fetch(`${API_URL}/api/classes?schoolId=${schoolId}&teacherId=${teacherId}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setTeacherClasses(data.data);
          if (data.data.length > 0) {
            setSelectedClass(`${data.data[0].className}${data.data[0].section}`);
          }
        }
      } catch (err) {
        console.error("Error fetching teacher classes:", err);
      }
    };
    fetchTeacherClasses();
  }, [schoolId, session, API_URL]);

  // Fetch Daily Students & Saved Attendance for that Date
  const fetchStudents = async () => {
    if (!schoolId || !selectedClass) {
      setStudents([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const clsNum = selectedClass.replace(/\D/g, "");
      const secLetter = selectedClass.replace(/\d/g, "").toUpperCase();

      // 1. Fetch Students Roster
      const resRoster = await fetch(`${API_URL}/api/students?schoolId=${schoolId}&class=${clsNum}&section=${secLetter}`);
      const resultRoster = await resRoster.json();

      // 2. Fetch Saved Attendance for this Class and Date
      const resSaved = await fetch(`${API_URL}/api/attendance/class-date?schoolId=${schoolId}&class=${clsNum}&section=${secLetter}&date=${selectedDate}`);
      const resultSaved = await resSaved.json();
      const savedRecords = resultSaved.success && Array.isArray(resultSaved.data) ? resultSaved.data : [];

      if (resultRoster.success && resultRoster.data) {
        const studentList = resultRoster.data.map((s: any, idx: number) => {
          // Find if there is a saved record for this student
          const saved = savedRecords.find((r: any) => r.studentId === s.id);
          let status: "Present" | "Absent" | "Late" = "Present"; // default to Present if no saved record
          if (saved) {
            if (saved.status === "PRESENT") status = "Present";
            else if (saved.status === "ABSENT") status = "Absent";
            else if (saved.status === "LATE") status = "Late";
          }
          return {
            id: s.id,
            name: s.user?.name || `Student ${idx + 1}`,
            rollNo: s.rollNumber || `${clsNum}${secLetter}${String(idx + 1).padStart(2, '0')}`,
            className: clsNum,
            section: secLetter,
            status,
          };
        });
        setStudents(studentList);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("Error loading daily roster checklist:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Weekly Attendance Records
  const fetchWeeklyAttendance = async () => {
    if (!schoolId || !selectedClass) {
      setWeeklyStudents([]);
      return;
    }
    try {
      setWeeklyLoading(true);
      const clsNum = selectedClass.replace(/\D/g, "");
      const secLetter = selectedClass.replace(/\d/g, "").toUpperCase();

      const res = await fetch(
        `${API_URL}/api/attendance/weekly?schoolId=${schoolId}&class=${clsNum}&section=${secLetter}&week=${selectedWeek}`
      );
      const result = await res.json();
      if (result.success) {
        setWeeklyStudents(result.students || []);
        if (result.weekRange) {
          const opt: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
          const startStr = new Date(result.weekRange.start).toLocaleDateString("en-IN", opt);
          const endStr = new Date(result.weekRange.end).toLocaleDateString("en-IN", opt);
          setWeeklyRange({ start: startStr, end: endStr });
        }
      } else {
        setWeeklyStudents([]);
      }
    } catch (err) {
      console.error("Error loading weekly attendance:", err);
      setWeeklyStudents([]);
    } finally {
      setWeeklyLoading(false);
    }
  };

  // Trigger Daily Fetch on class, school, or date change
  useEffect(() => {
    if (activeTab === "daily") {
      setCurrentPage(1);
      fetchStudents();
    }
  }, [schoolId, selectedClass, selectedDate, activeTab]);

  // Trigger Weekly Fetch on class, school, or week filter change
  useEffect(() => {
    if (activeTab === "weekly") {
      setCurrentPage(1);
      fetchWeeklyAttendance();
    }
  }, [schoolId, selectedClass, selectedWeek, activeTab]);

  const handleStatusChange = (id: string, newStatus: AttendanceStudent["status"]) => {
    setStudents(
      students.map((student) =>
        student.id === id ? { ...student, status: newStatus } : student
      )
    );
  };

  const markAllPresent = () => {
    setStudents(students.map((student) => ({ ...student, status: "Present" })));
  };

  const handleSaveAttendance = async () => {
    if (students.length === 0 || !schoolId) return;

    const presentCount = students.filter((s) => s.status === "Present").length;
    const absentCount = students.filter((s) => s.status === "Absent").length;
    const lateCount = students.filter((s) => s.status === "Late").length;
    const attendancePercentage = Math.round((presentCount / students.length) * 100);

    const records = students.map((s) => ({
      studentId: s.id,
      schoolId: schoolId,
      date: new Date(selectedDate),
      status: s.status.toUpperCase(), // PRESENT, ABSENT, LATE
      method: "Manual",
    }));

    try {
      const res = await fetch(`${API_URL}/api/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records, notifySMS: sendSMS }),
      });
      const result = await res.json();
      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Attendance Saved Successfully!",
          text: `Present: ${presentCount} | Absent: ${absentCount} | Late: ${lateCount} (${attendancePercentage}% Rate). ${sendSMS && absentCount > 0 ? "Parent SMS alerts dispatched successfully." : "Parent SMS alerts skipped/none absent."
            }`,
          confirmButtonColor: "#3b82f6",
        });
        // If we are on the weekly tab, refresh it too
        if (activeTab === "weekly") {
          fetchWeeklyAttendance();
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Error Saving Sheet",
          text: result.error || "Failed to update database record.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error("Error saving attendance:", err);
      Swal.fire({
        icon: "error",
        title: "Network Connection Error",
        text: "Could not reach the server. Please try again.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const presentCount = students.filter((s) => s.status === "Present").length;
  const absentCount = students.filter((s) => s.status === "Absent").length;
  const lateCount = students.filter((s) => s.status === "Late").length;
  const attendanceRate = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  // Helper to get status indicators for weekly grid
  const getWeeklyStatusNode = (records: WeeklyRecord[], dayIndex: number) => {
    // dayIndex: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
    const rec = records.find(r => r.dayOfWeek === dayIndex);
    if (!rec) {
      return (
        <span className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 text-[10px] text-gray-400 font-bold border border-gray-200" title="No Record">
          -
        </span>
      );
    }

    if (rec.status === "PRESENT") {
      return (
        <span className="w-6 h-6 rounded-full flex items-center justify-center bg-green-50 text-green-600 text-[10px] font-black border border-green-200" title={`Present (${rec.date})`}>
          P
        </span>
      );
    }

    if (rec.status === "ABSENT") {
      return (
        <span className="w-6 h-6 rounded-full flex items-center justify-center bg-red-50 text-red-600 text-[10px] font-black border border-red-200" title={`Absent (${rec.date})`}>
          A
        </span>
      );
    }

    if (rec.status === "LATE") {
      return (
        <span className="w-6 h-6 rounded-full flex items-center justify-center bg-amber-50 text-amber-600 text-[10px] font-black border border-amber-200" title={`Late (${rec.date})`}>
          L
        </span>
      );
    }

    return (
      <span className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 text-[10px] text-gray-400 font-bold border border-gray-200">
        -
      </span>
    );
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentStudents = students.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(students.length / itemsPerPage);

  const currentWeeklyStudents = weeklyStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalWeeklyPages = Math.ceil(weeklyStudents.length / itemsPerPage);

  // Pagination UI Component
  const renderPagination = (total: number) => {
    if (total <= 1) return null;
    return (
      <div className="flex items-center justify-between mt-6 px-2">
        <span className="text-xs font-semibold text-gray-500">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, activeTab === 'daily' ? students.length : weeklyStudents.length)} of {activeTab === 'daily' ? students.length : weeklyStudents.length} entries
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${currentPage === i + 1
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(total, p + 1))}
            disabled={currentPage === total}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <PortalLayout
      title="Daily Attendance Tracker"
      subtitle="Scope and record student attendance. Auto-notifies parents instantly on absence."
    >

      {/* Tab Switcher & Filters */}
      <div className="glass rounded-2xl p-5 mb-6 border border-slate-800 flex flex-col xl:flex-row justify-between items-stretch gap-4 fade-in">

        {/* Left Side: Segmented Tab control + Class Select */}
        <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center">

          {/* Tab Selector */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setActiveTab("daily")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "daily"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
                }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Daily Checklist</span>
            </button>
            <button
              onClick={() => setActiveTab("weekly")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "weekly"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
                }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Weekly History</span>
            </button>
          </div>

          {/* Class Select Dropdown */}
          <div className="flex-1 min-w-[200px]">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {teacherClasses.length > 0 ? (
                teacherClasses.map((cls) => (
                  <option key={cls.id} value={`${cls.className}${cls.section}`}>
                    Class {cls.className}{cls.section} - {cls.subject}
                  </option>
                ))
              ) : (
                <option value="">No Classes Assigned</option>
              )}
            </select>
          </div>
        </div>

        {/* Right Side: Conditional Date Picker / Week Filter & Actions */}
        <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-end">

          {/* Date Picker (Only on Daily Checklist) */}
          {activeTab === "daily" && (
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 gap-2 shrink-0">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-100 focus:outline-none border-none cursor-pointer"
              />
            </div>
          )}

          {/* Week Filter (Only on Weekly History Grid) */}
          {activeTab === "weekly" && (
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
              <button
                onClick={() => setSelectedWeek("current")}
                className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${selectedWeek === "current"
                    ? "bg-slate-800 text-blue-400 border border-blue-500/25"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                Current Week
              </button>
              <button
                onClick={() => setSelectedWeek("last")}
                className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${selectedWeek === "last"
                    ? "bg-slate-800 text-blue-400 border border-blue-500/25"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                Last Week
              </button>
            </div>
          )}

          {/* Actions (Only on Daily Checklist) */}
          {activeTab === "daily" && (
            <div className="flex gap-2 items-center flex-wrap">
              {/* Parent SMS Toggle */}
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 shrink-0 select-none">
                <input
                  type="checkbox"
                  id="smsAbsentToggle"
                  checked={sendSMS}
                  onChange={(e) => setSendSMS(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-950 border-slate-800 rounded focus:ring-blue-500 cursor-pointer accent-blue-600"
                />
                <label
                  htmlFor="smsAbsentToggle"
                  className="text-xs font-bold text-slate-300 cursor-pointer"
                >
                  SMS Absent Parents
                </label>
              </div>

              <button
                onClick={markAllPresent}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
              >
                Mark All Present
              </button>
              <button
                onClick={handleSaveAttendance}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Sheet</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Roster / Stats Content Area */}
      {activeTab === "daily" ? (
        <>
          {/* Realtime Attendance Stats (Daily Tab) */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Students", value: students.length, color: "text-slate-100", icon: Users, bg: "bg-blue-500/10 border-blue-500/20" },
              { label: "Present Today", value: presentCount, color: "text-emerald-400", icon: CheckCircle2, bg: "bg-emerald-500/10 border-emerald-500/20" },
              { label: "Absent Today", value: absentCount, color: "text-rose-400", icon: AlertCircle, bg: "bg-rose-500/10 border-rose-500/20" },
              { label: "Attendance Rate", value: `${attendanceRate}%`, color: "text-amber-400", icon: TrendingUp, bg: "bg-amber-500/10 border-amber-500/20" },
            ].map((stat, i) => {
              const IconComponent = stat.icon;
              return (
                <div key={i} className={`glass rounded-2xl p-4 border ${stat.bg} flex items-center justify-between shadow-sm hover:scale-[1.02] transition-transform`}>
                  <div className="text-left min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1 truncate">{stat.label}</span>
                    <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-900 border border-slate-800 shrink-0">
                    <IconComponent className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Roster Checklist Card */}
          <div className="glass rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="text-blue-500"><Clipboard className="w-4 h-4 inline-block mr-1 text-inherit" /></span>
                <span>Roster Checklist — Class {selectedClass}</span>
              </h2>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Date: {selectedDate}</span>
            </div>

            <div className="overflow-x-auto w-full">
              {loading ? (
                <div className="text-center py-16 text-slate-500 text-xs">
                  <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin mx-auto mb-3" />
                  <span>Loading class roster...</span>
                </div>
              ) : students.length > 0 ? (
                <>
                  {/* Table view for Large Desktops */}
                  <div className="hidden xl:block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-white border-b border-gray-100">
                          <th className="p-4 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Roll No</th>
                          <th className="p-4 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Student Name</th>
                          <th className="p-4 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Class & Sec</th>
                          <th className="p-4 text-slate-500 font-bold uppercase tracking-wider text-[10px] text-center">Status Selection</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {currentStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="p-4 font-bold text-gray-500 text-xs">{student.rollNo}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                  {student.name.charAt(0)}
                                </div>
                                <span className="font-semibold text-gray-800 text-sm">{student.name}</span>
                              </div>
                            </td>
                            <td className="p-4 font-semibold text-gray-500 text-xs">{student.className} - {student.section}</td>
                            <td className="p-4">
                              <div className="flex justify-center">
                                <div className="flex bg-white border border-gray-200 rounded-full p-1 max-w-[280px] w-full items-center relative">
                                  <button
                                    onClick={() => handleStatusChange(student.id, "Present")}
                                    className={`flex-1 h-7 rounded-full text-[10px] font-bold uppercase transition-all duration-300 flex items-center justify-center z-10 ${student.status === "Present"
                                        ? "bg-white shadow-[0_0_10px_rgba(16,185,129,0.25)] border border-emerald-100 text-gray-700"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                      }`}
                                  >
                                    PRESENT
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(student.id, "Absent")}
                                    className={`flex-1 h-7 rounded-full text-[10px] font-bold uppercase transition-all duration-300 flex items-center justify-center z-10 ${student.status === "Absent"
                                        ? "bg-white shadow-[0_0_10px_rgba(244,63,94,0.25)] border border-rose-100 text-gray-700"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                      }`}
                                  >
                                    ABSENT
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(student.id, "Late")}
                                    className={`flex-1 h-7 rounded-full text-[10px] font-bold uppercase transition-all duration-300 flex items-center justify-center z-10 ${student.status === "Late"
                                        ? "bg-white shadow-[0_0_10px_rgba(245,158,11,0.25)] border border-amber-100 text-gray-700"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                      }`}
                                  >
                                    LATE
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Card view for Mobile, Tablet, and Small Laptop */}
                  <div className="xl:hidden grid grid-cols-1 gap-4">
                    {currentStudents.map((student) => (
                      <div key={student.id} className="p-5 bg-white border border-gray-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-sm">
                            {student.name.charAt(0)}
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider mb-0.5">{student.rollNo} • Class {student.className}-{student.section}</span>
                            <span className="font-semibold text-gray-800 text-base">{student.name}</span>
                          </div>
                        </div>
                        <div className="flex bg-white border border-gray-200 rounded-full p-1 w-full sm:w-auto max-w-[320px] items-center relative">
                          <button
                            onClick={() => handleStatusChange(student.id, "Present")}
                            className={`flex-1 py-1.5 h-8 rounded-full text-[10px] font-bold uppercase transition-all duration-300 flex items-center justify-center z-10 ${student.status === "Present"
                                ? "bg-white shadow-[0_0_10px_rgba(16,185,129,0.25)] border border-emerald-100 text-gray-700"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                              }`}
                          >
                            PRESENT
                          </button>
                          <button
                            onClick={() => handleStatusChange(student.id, "Absent")}
                            className={`flex-1 py-1.5 h-8 rounded-full text-[10px] font-bold uppercase transition-all duration-300 flex items-center justify-center z-10 ${student.status === "Absent"
                                ? "bg-white shadow-[0_0_10px_rgba(244,63,94,0.25)] border border-rose-100 text-gray-700"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                              }`}
                          >
                            ABSENT
                          </button>
                          <button
                            onClick={() => handleStatusChange(student.id, "Late")}
                            className={`flex-1 py-1.5 h-8 rounded-full text-[10px] font-bold uppercase transition-all duration-300 flex items-center justify-center z-10 ${student.status === "Late"
                                ? "bg-white shadow-[0_0_10px_rgba(245,158,11,0.25)] border border-amber-100 text-gray-700"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                              }`}
                          >
                            LATE
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {renderPagination(totalPages)}
                </>
              ) : (
                <div className="text-center py-16 text-slate-500 text-xs italic">
                  {teacherClasses.length === 0
                    ? "No teaching classrooms are assigned to you yet."
                    : `No students are registered in Class ${selectedClass} yet.`}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Weekly Summary Grid Tab */
        <div className="glass rounded-2xl p-6 border border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 border-b border-slate-800 pb-3 gap-2">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span className="text-blue-500"><Calendar className="w-4 h-4 inline-block mr-1 text-inherit" /></span>
              <span>Weekly Attendance Summary — Class {selectedClass}</span>
            </h2>
            {weeklyRange && (
              <span className="text-[10px] bg-blue-600/10 border border-blue-500/25 text-blue-300 rounded-full px-3.5 py-0.5 font-bold uppercase tracking-wider">
                {weeklyRange.start} — {weeklyRange.end}
              </span>
            )}
          </div>

          {/* Grid Legend */}
          <div className="flex items-center gap-4 flex-wrap text-[10px] text-slate-400 font-bold uppercase mb-4 pb-2 border-b border-slate-900">
            <span className="text-slate-500">Legend:</span>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black">P</span>
              <span>Present</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center font-black">A</span>
              <span>Absent</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">L</span>
              <span>Late</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-slate-800 text-slate-500 border border-slate-700/50 flex items-center justify-center font-bold">-</span>
              <span>Unmarked</span>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            {weeklyLoading ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin mx-auto mb-3" />
                <span>Loading weekly data...</span>
              </div>
            ) : weeklyStudents.length > 0 ? (
              <>
                {/* Table view for Large Desktops */}
                <div className="hidden xl:block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-gray-100 text-center">
                        <th className="p-4 text-slate-500 font-bold uppercase tracking-wider text-[10px] text-left">Roll No</th>
                        <th className="p-4 text-slate-500 font-bold uppercase tracking-wider text-[10px] text-left">Class & Sec</th>
                        <th className="p-4 text-slate-500 font-bold uppercase tracking-wider text-[10px] text-left">Student Name</th>
                        <th className="p-4 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Mon</th>
                        <th className="p-4 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Tue</th>
                        <th className="p-4 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Wed</th>
                        <th className="p-4 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Thu</th>
                        <th className="p-4 text-slate-500 font-bold uppercase tracking-wider text-[10px]">Fri</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {currentWeeklyStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="p-4 font-bold text-gray-500 text-left text-xs">{student.rollNo}</td>
                          <td className="p-4 font-semibold text-gray-500 text-left text-xs">{student.className} - {student.section}</td>
                          <td className="p-4 text-left">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                {student.name.charAt(0)}
                              </div>
                              <span className="font-semibold text-gray-800 text-sm">{student.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center"><div className="flex justify-center">{getWeeklyStatusNode(student.records, 1)}</div></td>
                          <td className="p-4 text-center"><div className="flex justify-center">{getWeeklyStatusNode(student.records, 2)}</div></td>
                          <td className="p-4 text-center"><div className="flex justify-center">{getWeeklyStatusNode(student.records, 3)}</div></td>
                          <td className="p-4 text-center"><div className="flex justify-center">{getWeeklyStatusNode(student.records, 4)}</div></td>
                          <td className="p-4 text-center"><div className="flex justify-center">{getWeeklyStatusNode(student.records, 5)}</div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cards view for Mobile, Tablet, Small Laptop */}
                <div className="xl:hidden grid grid-cols-1 gap-4">
                  {currentWeeklyStudents.map((student) => (
                    <div key={student.id} className="p-5 bg-white border border-gray-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {student.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider mb-0.5">{student.rollNo} • Class {student.className}-{student.section}</span>
                          <span className="font-semibold text-gray-800 text-base">{student.name}</span>
                        </div>
                      </div>
                      <div className="flex gap-3 sm:gap-4 items-center w-full sm:w-auto justify-between sm:justify-end bg-gray-50 p-2 rounded-xl border border-gray-200">
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] text-gray-400 font-bold uppercase mb-1">M</span>
                          {getWeeklyStatusNode(student.records, 1)}
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] text-gray-400 font-bold uppercase mb-1">T</span>
                          {getWeeklyStatusNode(student.records, 2)}
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] text-gray-400 font-bold uppercase mb-1">W</span>
                          {getWeeklyStatusNode(student.records, 3)}
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] text-gray-400 font-bold uppercase mb-1">T</span>
                          {getWeeklyStatusNode(student.records, 4)}
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] text-gray-400 font-bold uppercase mb-1">F</span>
                          {getWeeklyStatusNode(student.records, 5)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {renderPagination(totalWeeklyPages)}
              </>
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs italic">
                No students found in Class {selectedClass}.
              </div>
            )}
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
