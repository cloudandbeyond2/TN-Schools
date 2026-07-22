"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PortalLayout from "@/components/PortalLayout";
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  Users, 
  FileText, 
  HelpCircle, 
  CheckSquare, 
  ArrowRight,
  Coffee,
  Bookmark,
  Plus,
  X,
  Save
} from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

interface TimetableSlot {
  id: string;
  schoolId: string;
  class: string;
  section: string;
  dayOfWeek: number;
  period: number;
  subject: string;
  teacherId: string | null;
  startTime: string;
  endTime: string;
}

interface ProxyAssignment {
  id: string;
  schoolId: string;
  date: string;
  period: number;
  timetableId: string;
  absentTeacherId: string;
  proxyTeacherId: string;
  notes: string | null;
  timetable?: TimetableSlot;
  school?: {
    name: string;
  };
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
  { value: 0, label: "Sunday", short: "Sun" }
];

export default function TeacherTimetablePage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const teacherId = user?.id || "";
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // State variables
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [proxies, setProxies] = useState<ProxyAssignment[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
const [loading, setLoading] = useState<boolean>(false);
  const { lang } = usePortalLanguage();
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("weekly");

  // Add Class Modal States
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ dayOfWeek: number; period: number } | null>(null);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [pendingSlots, setPendingSlots] = useState<any[]>([]);

  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  // Date and Day Selectors
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [activeDayOfWeek, setActiveDayOfWeek] = useState<number>(1);

  // Sync date selection to active day of week (Mon-Fri)
  useEffect(() => {
    if (selectedDate) {
      const d = new Date(selectedDate);
      const day = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
      if (day === 0 || day === 6) {
        setActiveDayOfWeek(1); // Default to Monday for weekends
      } else {
        setActiveDayOfWeek(day);
      }
    }
  }, [selectedDate]);

  // Fetch all timetable and proxy data
  const fetchData = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    try {
      // 1. Fetch Teacher Timetable
      const timetableRes = await fetch(`${API_URL}/api/timetable/teacher/${teacherId}`);
      const timetableData = await timetableRes.json();
      if (timetableData.success) {
        setTimetable(timetableData.data);
      }

      // 2. Fetch Teacher Proxy Assignments (duties)
      const proxiesRes = await fetch(`${API_URL}/api/timetable/proxy/teacher/${teacherId}`);
      const proxiesData = await proxiesRes.json();
      if (proxiesData.success) {
        setProxies(proxiesData.data);
      }

      // 3. Fetch teachers map
      if (user?.schoolId) {
        const teachersRes = await fetch(`${API_URL}/api/timetable/teachers?schoolId=${user.schoolId}`);
        const teachersData = await teachersRes.json();
        if (teachersData.success) {
          setTeachers(teachersData.data);
        }
        
        // 4. Fetch teacher's assigned classes
        const classesRes = await fetch(`${API_URL}/api/classes?schoolId=${user.schoolId}&teacherId=${teacherId}`);
        const classesData = await classesRes.json();
        if (classesData.success) {
          setTeacherClasses(classesData.data);
        }
      }
    } catch (e) {
      console.error("Error loading teacher timetable", e);
    } finally {
      setLoading(false);
    }
  }, [teacherId, user?.schoolId, API_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Resolve Teacher Name helper
  const getTeacherName = (tId: string | null) => {
    if (!tId) return "Teacher";
    if (tId === teacherId) return "You";
    const found = teachers.find(t => t.id === tId);
    return found ? found.name : "Teacher";
  };

  const handleAddClass = () => {
    if (!selectedSlot || !selectedClassId || !user?.schoolId) return;

    const selectedCls = teacherClasses.find(c => c.id === selectedClassId);
    if (!selectedCls) return;

    const times = selectedSlot.period === 1 ? { start: "09:30", end: "10:15" } : 
                  selectedSlot.period === 2 ? { start: "10:15", end: "11:00" } : 
                  selectedSlot.period === 3 ? { start: "11:15", end: "12:00" } : 
                  selectedSlot.period === 4 ? { start: "12:00", end: "12:45" } : 
                  selectedSlot.period === 5 ? { start: "13:30", end: "14:15" } : 
                  selectedSlot.period === 6 ? { start: "14:15", end: "15:00" } :
                  selectedSlot.period === 7 ? { start: "15:15", end: "16:00" } : { start: "16:00", end: "16:45" };

    const newSlot = {
      schoolId: user.schoolId,
      class: selectedCls.className,
      section: selectedCls.section,
      dayOfWeek: selectedSlot.dayOfWeek,
      period: selectedSlot.period,
      subject: selectedCls.subject,
      teacherId: teacherId,
      startTime: times.start,
      endTime: times.end,
    };

    // Replace any existing pending slot for the same day & period
    setPendingSlots(prev => {
      const filtered = prev.filter(s => !(s.dayOfWeek === selectedSlot.dayOfWeek && s.period === selectedSlot.period));
      return [...filtered, newSlot];
    });
    
    setShowAddModal(false);
  };

  const handleSaveTotalSchedule = async () => {
    if (pendingSlots.length === 0) return;
    setIsSaving(true);
    let successCount = 0;
    
    try {
      for (const slot of pendingSlots) {
        const res = await fetch(`${API_URL}/api/timetable`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(slot),
        });
        const data = await res.json();
        if (data.success) {
          successCount++;
        }
      }

      if (successCount === pendingSlots.length) {
        Swal.fire({
          icon: "success",
          title: "Schedule Saved",
          text: `Successfully saved ${successCount} classes to your timetable.`,
          confirmButtonColor: "#10b981",
        });
        setPendingSlots([]);
        fetchData();
      } else {
        Swal.fire({
          icon: "warning",
          title: "Partial Save",
          text: `Saved ${successCount} out of ${pendingSlots.length} classes. Some may have had conflicts.`,
        });
        setPendingSlots([]);
        fetchData();
      }
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Network error saving schedule.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/timetable/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "Class schedule removed successfully.",
          timer: 1500,
          showConfirmButton: false
        });
        fetchData();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Could not delete slot.",
        });
      }
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Network error deleting schedule.",
      });
    }
  };

  const handleEditSlotSubmit = async () => {
    if (!editingSlot || !selectedClassId || !user?.schoolId) return;

    const selectedCls = teacherClasses.find(c => c.id === selectedClassId);
    if (!selectedCls) return;

    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/timetable/${editingSlot.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId: user.schoolId,
          class: selectedCls.className,
          section: selectedCls.section,
          subject: selectedCls.subject,
          teacherId: teacherId,
          dayOfWeek: editingSlot.dayOfWeek,
          period: editingSlot.period,
          startTime: editingSlot.startTime,
          endTime: editingSlot.endTime,
        })
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Schedule updated successfully.",
          timer: 1500,
          showConfirmButton: false
        });
        setShowEditModal(false);
        fetchData();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Could not update slot.",
        });
      }
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Network error updating schedule.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSlotClick = (slot: any, isPending: boolean) => {
    if (isPending) {
      Swal.fire({
        title: "Remove Pending Class?",
        text: `Do you want to remove ${slot.subject} from this period?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Remove",
        cancelButtonText: "Keep",
        confirmButtonColor: "#ef4444"
      }).then((result) => {
        if (result.isConfirmed) {
          setPendingSlots(prev => prev.filter(s => !(s.dayOfWeek === slot.dayOfWeek && s.period === slot.period)));
        }
      });
    } else {
      Swal.fire({
        title: "Manage Scheduled Class",
        text: `What would you like to do with ${slot.subject} for Class ${slot.class}${slot.section}?`,
        icon: "info",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "Edit",
        denyButtonText: "Delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#3b82f6",
        denyButtonColor: "#ef4444"
      }).then((result) => {
        if (result.isConfirmed) {
          // Edit
          setEditingSlot(slot);
          const matchedClass = teacherClasses.find(c => c.className === slot.class && c.section === slot.section && c.subject === slot.subject);
          setSelectedClassId(matchedClass ? matchedClass.id : "");
          setShowEditModal(true);
        } else if (result.isDenied) {
          // Delete
          Swal.fire({
            title: "Are you sure?",
            text: "This will remove the class from your schedule.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            confirmButtonColor: "#ef4444"
          }).then((delResult) => {
            if (delResult.isConfirmed) {
              handleDeleteSlot(slot.id);
            }
          });
        }
      });
    }
  };

  // Filter regular timetable slots for the active day of week
  const regularSlots = timetable.filter(s => s.dayOfWeek === activeDayOfWeek);

  // Get proxy duties for the selected date
  const selectedDateProxies = proxies.filter(p => {
    const pDate = p.date.split("T")[0];
    return pDate === selectedDate;
  });

  // Distinguish between duties where the teacher is proxy (substituting) vs absent
  const substitutingDuties = selectedDateProxies.filter(p => p.proxyTeacherId === teacherId || p.proxyTeacherId === user?.id);
  const absentCoverages = selectedDateProxies.filter(p => p.absentTeacherId === teacherId || p.absentTeacherId === user?.id);

  // Construct the dynamic daily period schedule by combining regular schedule and overlaying proxies
  const dailySchedule = [1, 2, 3, 4, 5, 6, 7, 8].map(periodNumber => {
    const times = periodNumber === 1 ? { start: "09:30", end: "10:15" } : 
                  periodNumber === 2 ? { start: "10:15", end: "11:00" } : 
                  periodNumber === 3 ? { start: "11:15", end: "12:00" } : 
                  periodNumber === 4 ? { start: "12:00", end: "12:45" } : 
                  periodNumber === 5 ? { start: "13:30", end: "14:15" } : 
                  periodNumber === 6 ? { start: "14:15", end: "15:00" } :
                  periodNumber === 7 ? { start: "15:15", end: "16:00" } : { start: "16:00", end: "16:45" };

    // 1. Check if there is an active proxy where this teacher is covering this period today
    const proxyDuty = substitutingDuties.find(p => p.period === periodNumber);
    if (proxyDuty) {
      return {
        period: periodNumber,
        isProxyDuty: true,
        isCoveredByAnother: false,
        subject: proxyDuty.timetable?.subject || "Substitution",
        classSection: `${proxyDuty.timetable?.class || ""}${proxyDuty.timetable?.section || ""}`,
        originalTeacher: getTeacherName(proxyDuty.absentTeacherId),
        startTime: proxyDuty.timetable?.startTime || times.start,
        endTime: proxyDuty.timetable?.endTime || times.end,
        notes: proxyDuty.notes || "Assigned by Headmaster"
      };
    }

    // 2. Check if the teacher has a regular slot in this period
    const regularSlot = regularSlots.find(s => s.period === periodNumber);
    
    // Check if this regular slot is covered by a proxy because this teacher is absent today
    const isCovered = absentCoverages.find(p => p.period === periodNumber);

    if (regularSlot) {
      return {
        period: periodNumber,
        isProxyDuty: false,
        isCoveredByAnother: !!isCovered,
        proxyTeacherName: isCovered ? getTeacherName(isCovered.proxyTeacherId) : null,
        subject: regularSlot.subject,
        classSection: `${regularSlot.class}${regularSlot.section}`,
        originalTeacher: "You",
        startTime: regularSlot.startTime,
        endTime: regularSlot.endTime,
        notes: isCovered ? `Covered by proxy: ${getTeacherName(isCovered.proxyTeacherId)}` : ""
      };
    }

    // 3. Free period
    return {
      period: periodNumber,
      isFree: true,
      startTime: times.start,
      endTime: times.end,
    };
  });

  // Divide schedule into teaching classes and free periods
  const activeTeachingPeriods = dailySchedule.filter(s => !s.isFree);
  const freePeriods = dailySchedule.filter(s => s.isFree);

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "அட்டவணை & ப்ராக்சிகள்" : "Timetable & Proxies"}
      subtitle={user?.name ? `${user.name} · ஆசிரியர் அட்டவணை டாஷ்போர்ட்` : "ஆசிரியர் போர்டல்"}
      avatarLetter={user?.name ? user.name.charAt(0) : "T"}
      avatarColor="#f59e0b"
      themeClass="theme-teacher"
      accentColor="#f59e0b"
    >
      {/* Date selector controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span>📅 {lang === "தமிழ்" ? "தேர்ந்தெடுக்கப்பட்ட தேதி பார்வை" : "Selected Date View"}</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-1">
            {lang === "தமிழ்" ? "இந்த தேதிக்கான உங்கள் அட்டவணை, காலியிடங்கள், ப்ராக்சி கடமைகளை பார்க்கவும்." : "Check your schedule, free periods, and proxy duties for this date."}
          </p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 transition-colors w-full sm:w-auto"
        />
      </div>

      {/* Proxy Duty Alerts Section */}
      {selectedDateProxies.length > 0 && (
        <div className="space-y-3.5 mb-6">
          {substitutingDuties.map(p => (
            <div key={p.id} className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-2xl flex gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <strong className="text-xs font-black block uppercase tracking-wider">🤝 Substitution Proxy Duty Alert</strong>
                <p className="text-xs mt-1 font-semibold leading-relaxed">
                  Headmaster has assigned you to cover <strong className="underline">Period {p.period}</strong> today for class <strong className="text-slate-850 dark:text-white font-extrabold">{p.timetable?.class}{p.timetable?.section} ({p.timetable?.subject})</strong> in place of absent colleague <strong className="underline">{getTeacherName(p.absentTeacherId)}</strong>.
                </p>
                {p.notes && <span className="text-[10px] block mt-1.5 opacity-80">HM Note: "{p.notes}"</span>}
              </div>
            </div>
          ))}

          {absentCoverages.map(p => (
            <div key={p.id} className="p-4 bg-slate-100/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 text-slate-650 dark:text-slate-400 rounded-2xl flex gap-3 shadow-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-slate-450 mt-0.5" />
              <div>
                <strong className="text-xs font-black block uppercase tracking-wider">ℹ️ Class Coverage Notification (Absent)</strong>
                <p className="text-xs mt-1 font-medium leading-relaxed">
                  Your regular <strong className="underline">Period {p.period}</strong> class with <strong className="font-bold">{p.timetable?.class}{p.timetable?.section}</strong> is covered today by substitute teacher <strong className="text-slate-850 dark:text-white font-extrabold">{getTeacherName(p.proxyTeacherId)}</strong>.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main schedule card with Day selectors */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">🗓️ {lang === "தமிழ்" ? "வார அட்டவணை & செயலில் காலங்கள்" : "Weekly Schedule & Active Period Mappings"}</h2>
            <p className="text-[10px] text-slate-500 mt-1">
              {viewMode === "weekly" ? (lang === "தமிழ்" ? "உங்கள் முழு வார அட்டவணையைப் பார்க்கவும்." : "View your full weekly schedule.") : (lang === "தமிழ்" ? "நாள் தேர்வு செய்து உங்கள் அட்டவணை நேரவரிசையை ஏற்றவும்." : "Select a weekday to load your schedule timeline.")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("weekly")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "weekly"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setViewMode("daily")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "daily"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Daily
              </button>
            </div>

            {pendingSlots.length > 0 && viewMode === "weekly" && (
              <button
                onClick={handleSaveTotalSchedule}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? (lang === "தமிழ்" ? "சேமிக்கிறது..." : "Saving...") : `${lang === "தமிழ்" ? "மொத்த அட்டவணை சேமி" : "Save Total Schedule"} (${pendingSlots.length})`}
              </button>
            )}

            {/* Days Tabs selector - Only show in daily view */}
            {viewMode === "daily" && (
          <div className="flex bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-900 p-1 rounded-xl w-full sm:w-auto">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day.value}
                onClick={() => {
                  const current = new Date(selectedDate);
                  const currentDay = current.getDay();
                  const diff = day.value - currentDay;
                  current.setDate(current.getDate() + diff);
                  setSelectedDate(current.toISOString().split("T")[0]);
                }}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeDayOfWeek === day.value
                    ? "bg-amber-500 text-white shadow-md font-extrabold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                {day.short}
              </button>
            ))}
          </div>
          )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-amber-500/20 border-t-amber-500 animate-spin rounded-full mb-2" />
            <span className="text-xs text-slate-400 font-medium">Fetching schedule...</span>
          </div>
        ) : viewMode === "daily" && activeDayOfWeek === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-red-200 dark:border-red-900/50 rounded-2xl bg-red-50/50 dark:bg-red-950/20">
            <span className="text-4xl block mb-3">🏖️</span>
            <h3 className="text-sm font-bold text-red-600 dark:text-red-400">Sunday - Weekly Holiday</h3>
            <p className="text-[10px] text-red-500/70 dark:text-red-400/70 mt-1 max-w-[280px] mx-auto leading-relaxed">
              School is closed on Sundays. Enjoy your weekend!
            </p>
          </div>
        ) : viewMode === "weekly" ? (
          /* WEEKLY CALENDAR MATRIX */
          <div className="overflow-x-auto pb-4">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-xs font-bold text-slate-500 text-left w-32">Period / Time</th>
                  {DAYS_OF_WEEK.map(day => (
                    <th key={day.value} className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-xs font-bold text-slate-800 dark:text-white text-center">
                      {day.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { type: 'period', num: 1 },
                  { type: 'period', num: 2 },
                  { type: 'break', label: 'Morning Break', time: '11:00 - 11:15' },
                  { type: 'period', num: 3 },
                  { type: 'period', num: 4 },
                  { type: 'break', label: 'Lunch Break', time: '12:45 - 13:30' },
                  { type: 'period', num: 5 },
                  { type: 'period', num: 6 },
                  { type: 'period', num: 7 },
                  { type: 'period', num: 8, label: 'PET/Extra' },
                ].map((row, idx) => {
                  if (row.type === 'break') {
                    return (
                      <tr key={`break-${idx}`}>
                        <td colSpan={DAYS_OF_WEEK.length + 1} className="p-2 border border-slate-200 dark:border-slate-800 bg-amber-50 dark:bg-amber-900/10 text-center text-amber-700 dark:text-amber-500 text-xs font-bold tracking-widest uppercase">
                          ☕ {row.label} <span className="opacity-70 text-[10px] ml-2 normal-case tracking-normal font-medium">({row.time})</span>
                        </td>
                      </tr>
                    );
                  }

                  const periodNumber = row.num as number;
                  const times = periodNumber === 1 ? { start: "09:30", end: "10:15" } : 
                                periodNumber === 2 ? { start: "10:15", end: "11:00" } : 
                                periodNumber === 3 ? { start: "11:15", end: "12:00" } : 
                                periodNumber === 4 ? { start: "12:00", end: "12:45" } : 
                                periodNumber === 5 ? { start: "13:30", end: "14:15" } : 
                                periodNumber === 6 ? { start: "14:15", end: "15:00" } :
                                periodNumber === 7 ? { start: "15:15", end: "16:00" } : { start: "16:00", end: "16:45" };
                  
                  return (
                    <tr key={`p-${periodNumber}`}>
                      <td className="p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="text-xs font-bold text-slate-800 dark:text-white whitespace-nowrap">Period {periodNumber}</div>
                        {row.label && <div className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{row.label}</div>}
                        <div className="text-[10px] text-slate-500 mt-1">{times.start} - {times.end}</div>
                      </td>
                      {DAYS_OF_WEEK.map(day => {
                        const savedSlot = timetable.find(s => s.dayOfWeek === day.value && s.period === periodNumber);
                        const pendingSlot = pendingSlots.find(s => s.dayOfWeek === day.value && s.period === periodNumber);
                        const slot = pendingSlot || savedSlot;
                        
                        // Render empty for Sunday if needed, but we included Sunday in DAYS_OF_WEEK
                        if (day.value === 0) {
                          return (
                            <td key={`${day.value}-${periodNumber}`} className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 align-top h-24">
                            </td>
                          );
                        }

                        return (
                          <td key={`${day.value}-${periodNumber}`} className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 align-top h-24">
                            {slot ? (
                              <div 
                                onClick={() => handleSlotClick(slot, !!pendingSlot)}
                                className={`border p-2 rounded-lg h-full flex flex-col justify-between transition-colors relative cursor-pointer hover:shadow-md ${pendingSlot ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-300 border-dashed dark:border-sky-700 hover:border-sky-400' : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 hover:border-amber-400 dark:hover:border-amber-500/50'}`}
                              >
                                {pendingSlot && (
                                  <span className="absolute -top-2 -right-2 bg-sky-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">Unsaved</span>
                                )}
                                <div>
                                  <div className={`text-xs font-bold ${periodNumber === 8 ? 'text-emerald-700 dark:text-emerald-400' : pendingSlot ? 'text-sky-800 dark:text-sky-300' : 'text-slate-800 dark:text-white'}`}>{slot.subject}</div>
                                  <div className={`text-[10px] mt-0.5 flex items-center gap-1 font-semibold ${pendingSlot ? 'text-sky-600 dark:text-sky-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                    <Users className="w-3 h-3" /> Class {slot.class}{slot.section}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedSlot({ dayOfWeek: day.value, period: periodNumber });
                                  setSelectedClassId("");
                                  setShowAddModal(true);
                                }}
                                className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium opacity-60 hover:opacity-100 bg-slate-50/50 hover:bg-emerald-50 dark:bg-slate-950/20 dark:hover:bg-emerald-900/10 rounded-lg border border-dashed border-slate-200 hover:border-emerald-300 dark:border-slate-800 dark:hover:border-emerald-700/50 transition-all group"
                              >
                                <span className="group-hover:hidden">{lang === "தமிழ்" ? "இலவச" : "Free"}</span>
                                <span className="hidden group-hover:flex items-center gap-1 font-bold">
                                  <Plus className="w-3 h-3" /> {lang === "தமிழ்" ? "பாடம் சேர்க்க" : "Add Class"}
                                </span>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* COLUMN-WISE SCHEDULE DIVISION */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* COLUMN 1: Active Classes & Teaching Duties */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
                <span className="text-lg">📚</span>
                <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">
                  Teaching Schedule ({activeTeachingPeriods.length})
                </h3>
              </div>

              {activeTeachingPeriods.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-950/20 border-2 border-dashed border-slate-150 dark:border-slate-850 rounded-2xl">
                  <span className="text-2xl block mb-1">☕</span>
                  <h4 className="text-xs font-bold text-slate-650 dark:text-white">No Teaching Classes today</h4>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                    You have no scheduled teaching classes for this day. Enjoy your free time!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTeachingPeriods.map((slot) => (
                    <div
                      key={`slot-${slot.period}`}
                      className={`p-5 rounded-2xl border bg-white dark:bg-slate-950 flex flex-col justify-between gap-4 relative overflow-hidden transition-all shadow-sm ${
                        slot.isProxyDuty 
                          ? "border-l-4 border-l-amber-500 border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10" 
                          : slot.isCoveredByAnother 
                          ? "border-l-4 border-l-slate-300 border-slate-200 dark:border-slate-850 opacity-70" 
                          : "border-l-4 border-l-emerald-500 border-slate-100 dark:border-slate-900"
                      }`}
                    >
                      {/* Period Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                            slot.isProxyDuty 
                              ? "bg-amber-500 text-white" 
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10"
                          }`}>
                            Period {slot.period}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {slot.startTime} - {slot.endTime}
                          </span>
                        </div>

                        {slot.isProxyDuty && (
                          <span className="text-[9px] font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/25 px-2 py-0.5 rounded-md">
                            Proxy Substitute
                          </span>
                        )}

                        {slot.isCoveredByAnother && (
                          <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-900 text-slate-505 px-2 py-0.5 rounded-md">
                            Covered by Substitute
                          </span>
                        )}
                      </div>

                      {/* Subject Name & Classroom details */}
                      <div>
                        <h4 className="text-xs font-black text-slate-850 dark:text-white">
                          {slot.subject}
                        </h4>
                        <div className="text-[10px] text-slate-500 mt-1 font-semibold flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" /> Class <strong className="text-slate-700 dark:text-slate-350">{slot.classSection}</strong>
                        </div>
                      </div>

                      {/* Display substitute actions if not covered */}
                      {!slot.isCoveredByAnother ? (
                        <div className="flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-900 pt-3.5 mt-1.5">
                          <Link
                            href="/teacher/lesson-planner"
                            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-slate-300 text-[10px] font-black rounded-lg transition-colors flex items-center gap-1 border border-slate-150 dark:border-slate-800"
                          >
                            <FileText className="w-3 h-3" /> Lesson Plan
                          </Link>
                          <Link
                            href="/teacher/questions"
                            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-slate-300 text-[10px] font-black rounded-lg transition-colors flex items-center gap-1 border border-slate-150 dark:border-slate-800"
                          >
                            <HelpCircle className="w-3 h-3" /> Q-Generator
                          </Link>
                          <Link
                            href="/teacher/evaluation"
                            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-slate-300 text-[10px] font-black rounded-lg transition-colors flex items-center gap-1 border border-slate-150 dark:border-slate-800"
                          >
                            <CheckSquare className="w-3 h-3" /> Grading
                          </Link>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-slate-50/50 dark:bg-slate-900/35 text-[10px] text-slate-500 rounded-xl leading-relaxed">
                          🧑‍🏫 <strong>{slot.proxyTeacherName}</strong> is covering this class. You are off-duty.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* COLUMN 2: Free & Preparation Periods */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
                <span className="text-lg">☕</span>
                <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">
                  Prep Time & Free Periods ({freePeriods.length})
                </h3>
              </div>

              {freePeriods.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-950/20 border-2 border-dashed border-slate-150 dark:border-slate-850 rounded-2xl">
                  <span className="text-2xl block mb-1">🏃‍♂️</span>
                  <h4 className="text-xs font-bold text-slate-650 dark:text-white">Full Schedule Today</h4>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                    You have classes scheduled in every single period today. Stay energized!
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {freePeriods.map((slot) => (
                    <div
                      key={`free-${slot.period}`}
                      className="p-4 bg-slate-50/40 dark:bg-slate-950/10 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl flex flex-col gap-3 transition-all hover:border-slate-300 dark:hover:border-slate-800"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                            Period {slot.period}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold flex items-center gap-1">
                          <Coffee className="w-3.5 h-3.5" /> Prep Hours
                        </span>
                      </div>

                      {/* Prep suggestions content block */}
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-350">
                          Preparation / Lesson Planning Time
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                          Use this period to structure your upcoming classes, draft evaluations, or review student reports.
                        </p>
                      </div>

                      {/* Short suggestions links */}
                      <div className="flex gap-3 pt-2.5 border-t border-slate-100 dark:border-slate-850">
                        <Link
                          href="/teacher/add-materials"
                          className="text-[10px] font-bold text-amber-500 hover:text-amber-600 flex items-center gap-0.5 transition-colors"
                        >
                          <Bookmark className="w-3 h-3" /> Upload Materials <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                        <Link
                          href="/teacher/student-profiles"
                          className="text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-250 flex items-center gap-0.5 transition-colors"
                        >
                          <Users className="w-3 h-3" /> Student Profiles <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {showAddModal && selectedSlot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                Assign Class to Period {selectedSlot.period}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                  Day: {DAYS_OF_WEEK.find(d => d.value === selectedSlot.dayOfWeek)?.label}
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                  Select Class
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="">-- Choose a Class --</option>
                  {teacherClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      Class {cls.className}{cls.section} - {cls.subject}
                    </option>
                  ))}
                </select>
                {teacherClasses.length === 0 && (
                  <p className="text-[10px] text-amber-500 mt-1">
                    You have no assigned classes.
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleAddClass}
                disabled={!selectedClassId}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
              >
                Set Class
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingSlot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                Edit Class for Period {editingSlot.period}
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                  Day: {DAYS_OF_WEEK.find(d => d.value === editingSlot.dayOfWeek)?.label}
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                  Select New Class
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">-- Choose a Class --</option>
                  {teacherClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      Class {cls.className}{cls.section} - {cls.subject}
                    </option>
                  ))}
                </select>
                {teacherClasses.length === 0 && (
                  <p className="text-[10px] text-amber-500 mt-1">
                    You have no assigned classes.
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleEditSlotSubmit}
                disabled={!selectedClassId || isSaving}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
              >
                Update Class
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

