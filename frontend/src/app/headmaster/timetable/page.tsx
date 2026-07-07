"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import { Calendar, Users, Shield, Plus, Edit2, Trash2, HelpCircle, Check, AlertCircle, Grid, List, CheckCircle, Clock } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  subject: string;
  email?: string;
  phone?: string;
  isBusy?: boolean;
  busyWithClass?: string | null;
}

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
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" }
];

const SUBJECTS = [
  "Mathematics", "Science", "Social Science", "English", "Tamil",
  "Physics", "Chemistry", "Biology", "History", "Geography",
  "Computer Science", "Commerce", "Economics", "Accountancy"
];

const PERIOD_TIMES: Record<number, { start: string; end: string }> = {
  1: { start: "09:30", end: "10:15" },
  2: { start: "10:15", end: "11:00" },
  3: { start: "11:15", end: "12:00" },
  4: { start: "12:00", end: "12:45" },
  5: { start: "13:30", end: "14:15" },
};

export default function HeadmasterTimetablePage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const schoolId = user?.schoolId || "";
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // State variables
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [proxyAvailabilityTeachers, setProxyAvailabilityTeachers] = useState<Teacher[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [proxies, setProxies] = useState<ProxyAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // View toggle state (Timeline list vs Master Grid matrix)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Date/Day selectors
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [activeDayOfWeek, setActiveDayOfWeek] = useState<number>(1);

  // Filter state
  const [filterClass, setFilterClass] = useState<string>("All");
  const [filterSection, setFilterSection] = useState<string>("All");

  // Modal states
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  
  // Slot form state
  const [slotForm, setSlotForm] = useState({
    class: "10",
    section: "A",
    dayOfWeek: 1,
    period: 1,
    subject: "Mathematics",
    teacherId: "",
    startTime: "09:30",
    endTime: "10:15"
  });

  // Proxy form state
  const [selectedTimetableId, setSelectedTimetableId] = useState<string>("");
  const [proxyTeacherId, setProxyTeacherId] = useState<string>("");
  const [proxyNotes, setProxyNotes] = useState<string>("");

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

  // Fetch all initial data
  const fetchData = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      // 1. Fetch Teachers
      const teachersRes = await fetch(`${API_URL}/api/timetable/teachers?schoolId=${schoolId}`);
      const teachersData = await teachersRes.json();
      if (teachersData.success) {
        setTeachers(teachersData.data);
      }

      // 2. Fetch Timetable
      const timetableRes = await fetch(`${API_URL}/api/timetable?schoolId=${schoolId}`);
      const timetableData = await timetableRes.json();
      if (timetableData.success) {
        setTimetable(timetableData.data);
      }

      // 3. Fetch Proxies for selected date
      const proxiesRes = await fetch(`${API_URL}/api/timetable/proxy?schoolId=${schoolId}&date=${selectedDate}`);
      const proxiesData = await proxiesRes.json();
      if (proxiesData.success) {
        setProxies(proxiesData.data);
      }
    } catch (e) {
      console.error("Error loading timetable data", e);
    } finally {
      setLoading(false);
    }
  }, [schoolId, selectedDate, API_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch proxies only when date changes
  const fetchProxies = useCallback(async () => {
    if (!schoolId || !selectedDate) return;
    try {
      const res = await fetch(`${API_URL}/api/timetable/proxy?schoolId=${schoolId}&date=${selectedDate}`);
      const data = await res.json();
      if (data.success) {
        setProxies(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [schoolId, selectedDate, API_URL]);

  useEffect(() => {
    if (!loading) {
      fetchProxies();
    }
  }, [selectedDate, fetchProxies]);

  // Query teacher busy/free availability for proxy select dropdown
  const queryProxyAvailability = useCallback(async (slotId: string) => {
    if (!schoolId || !slotId) {
      setProxyAvailabilityTeachers([]);
      return;
    }
    const slot = timetable.find(s => s.id === slotId);
    if (!slot) return;

    try {
      const res = await fetch(`${API_URL}/api/timetable/teachers?schoolId=${schoolId}&dayOfWeek=${activeDayOfWeek}&period=${slot.period}`);
      const data = await res.json();
      if (data.success) {
        setProxyAvailabilityTeachers(data.data);
      }
    } catch (e) {
      console.error("Error fetching teacher busy availability states", e);
    }
  }, [schoolId, activeDayOfWeek, timetable, API_URL]);

  // Triggers availability queries when selected slot changes
  useEffect(() => {
    if (selectedTimetableId) {
      queryProxyAvailability(selectedTimetableId);
    } else {
      setProxyAvailabilityTeachers([]);
    }
  }, [selectedTimetableId, queryProxyAvailability]);

  // Open modal to add a new slot
  const openAddSlot = (classVal?: string, sectionVal?: string, periodVal?: number) => {
    setEditingSlot(null);
    setSlotForm({
      class: classVal || "10",
      section: sectionVal || "A",
      dayOfWeek: activeDayOfWeek,
      period: periodVal || 1,
      subject: "Mathematics",
      teacherId: teachers[0]?.id || "",
      startTime: PERIOD_TIMES[periodVal || 1]?.start || "09:30",
      endTime: PERIOD_TIMES[periodVal || 1]?.end || "10:15"
    });
    setIsSlotModalOpen(true);
  };

  // Open modal to edit an existing slot
  const openEditSlot = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setSlotForm({
      class: slot.class,
      section: slot.section,
      dayOfWeek: slot.dayOfWeek,
      period: slot.period,
      subject: slot.subject,
      teacherId: slot.teacherId || "",
      startTime: slot.startTime,
      endTime: slot.endTime
    });
    setIsSlotModalOpen(true);
  };

  // Handle period time preset auto-updates when period changes
  const handlePeriodChange = (pNum: number) => {
    const times = PERIOD_TIMES[pNum] || { start: "09:30", end: "10:15" };
    setSlotForm(prev => ({
      ...prev,
      period: pNum,
      startTime: times.start,
      endTime: times.end
    }));
  };

  // Submit weekly timetable slot (create or update)
  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) return;

    setSubmitting(true);
    const payload = {
      schoolId,
      ...slotForm,
      dayOfWeek: parseInt(String(slotForm.dayOfWeek)),
      period: parseInt(String(slotForm.period))
    };

    try {
      const url = editingSlot ? `${API_URL}/api/timetable/${editingSlot.id}` : `${API_URL}/api/timetable`;
      const method = editingSlot ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: data.message || "Timetable slot successfully saved",
          timer: 1500,
          showConfirmButton: false
        });
        setIsSlotModalOpen(false);
        fetchData();
      } else {
        Swal.fire({
          icon: "error",
          title: "Scheduling Conflict!",
          text: data.error || "Failed to save slot"
        });
      }
    } catch {
      Swal.fire({ icon: "error", title: "Network Error", text: "Could not reach server" });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete timetable slot
  const handleDeleteSlot = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Slot?",
      text: "Are you sure you want to delete this weekly timetable slot?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b"
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/timetable/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        Swal.fire({ icon: "success", title: "Deleted!", timer: 1000, showConfirmButton: false });
        fetchData();
      }
    } catch {
      Swal.fire({ icon: "error", title: "Network Error" });
    }
  };

  // Assign Proxy
  const handleAssignProxy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId || !selectedTimetableId || !proxyTeacherId) {
      Swal.fire({ icon: "warning", title: "Incomplete details", text: "Please select both a timetable slot and a proxy teacher" });
      return;
    }

    const selectedSlot = timetable.find(s => s.id === selectedTimetableId);
    if (!selectedSlot) return;

    const payload = {
      schoolId,
      date: selectedDate,
      period: selectedSlot.period,
      timetableId: selectedSlot.id,
      absentTeacherId: selectedSlot.teacherId || "",
      proxyTeacherId,
      notes: proxyNotes
    };

    try {
      const res = await fetch(`${API_URL}/api/timetable/proxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Proxy Confirmed!",
          text: "The substitute teacher has been notified.",
          timer: 2000,
          showConfirmButton: false
        });
        setSelectedTimetableId("");
        setProxyTeacherId("");
        setProxyNotes("");
        fetchProxies();
      } else {
        Swal.fire({ icon: "error", title: "Substitution Conflict", text: data.error });
      }
    } catch {
      Swal.fire({ icon: "error", title: "Network Error" });
    }
  };

  // Populate Demo Timetable helper
  const handlePopulateDemo = async () => {
    if (!schoolId || teachers.length === 0) {
      Swal.fire({ icon: "info", title: "Requires Teachers", text: "Please ensure your school has registered staff first." });
      return;
    }

    const demoSlots = [
      { class: "10", section: "A", dayOfWeek: 1, period: 1, subject: "Mathematics", startTime: "09:30", endTime: "10:15", teacherId: teachers[0]?.id },
      { class: "9", section: "B", dayOfWeek: 1, period: 2, subject: "Science", startTime: "10:15", endTime: "11:00", teacherId: teachers[1]?.id || teachers[0]?.id },
      { class: "8", section: "A", dayOfWeek: 1, period: 3, subject: "Tamil", startTime: "11:15", endTime: "12:00", teacherId: teachers[2]?.id || teachers[0]?.id },
      { class: "11", section: "C", dayOfWeek: 1, period: 4, subject: "English", startTime: "12:00", endTime: "12:45", teacherId: teachers[3]?.id || teachers[0]?.id },
      { class: "12", section: "B", dayOfWeek: 1, period: 5, subject: "Social Science", startTime: "13:30", endTime: "14:15", teacherId: teachers[4]?.id || teachers[0]?.id },
      
      { class: "9", section: "B", dayOfWeek: 2, period: 1, subject: "Mathematics", startTime: "09:30", endTime: "10:15", teacherId: teachers[0]?.id },
      { class: "10", section: "A", dayOfWeek: 2, period: 2, subject: "Science", startTime: "10:15", endTime: "11:00", teacherId: teachers[1]?.id || teachers[0]?.id },
      { class: "12", section: "B", dayOfWeek: 2, period: 3, subject: "English", startTime: "11:15", endTime: "12:00", teacherId: teachers[3]?.id || teachers[0]?.id },
      { class: "8", section: "A", dayOfWeek: 2, period: 4, subject: "Social Science", startTime: "12:00", endTime: "12:45", teacherId: teachers[4]?.id || teachers[0]?.id },
      { class: "11", section: "C", dayOfWeek: 2, period: 5, subject: "Tamil", startTime: "13:30", endTime: "14:15", teacherId: teachers[2]?.id || teachers[0]?.id },
    ];

    setLoading(true);
    try {
      for (const slot of demoSlots) {
        await fetch(`${API_URL}/api/timetable`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schoolId, ...slot })
        });
      }
      Swal.fire({ icon: "success", title: "Demo Timetable Loaded!", timer: 1500 });
      fetchData();
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "Failed to populate" });
    } finally {
      setLoading(false);
    }
  };

  // Helper to get teacher name by ID
  const getTeacherName = (tId: string | null) => {
    if (!tId) return "No Teacher Assigned";
    const found = teachers.find(t => t.id === tId);
    return found ? found.name : "Unknown Teacher";
  };

  // Find proxy details for a specific slot
  const getProxyForSlot = (slotId: string) => {
    return proxies.find(p => p.timetableId === slotId);
  };

  // Filtering timetable slots for active day
  const filteredSlots = timetable.filter(slot => {
    if (slot.dayOfWeek !== activeDayOfWeek) return false;
    if (filterClass !== "All" && slot.class !== filterClass) return false;
    if (filterSection !== "All" && slot.section !== filterSection) return false;
    return true;
  });

  // Extract unique class/sections to construct the Master grid matrix
  const allClassSections = Array.from(
    new Set(timetable.map(s => `${s.class}-${s.section}`))
  ).sort((a, b) => {
    const [classA, secA] = a.split("-");
    const [classB, secB] = b.split("-");
    const numA = parseInt(classA) || 0;
    const numB = parseInt(classB) || 0;
    if (numA !== numB) return numA - numB;
    return secA.localeCompare(secB);
  });

  const availableSlotsForProxy = timetable.filter(slot => slot.dayOfWeek === activeDayOfWeek);
  const selectedSlotForProxyDetails = timetable.find(s => s.id === selectedTimetableId);

  return (
    <PortalLayout
      title="Master Timetable & Proxies"
      subtitle={user?.name ? `${user.name} · School Admin Dashboard` : "School Headmaster Portal"}
      avatarLetter={user?.name ? user.name.charAt(0) : "H"}
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      {/* Date selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span>📅 Select Operation Date</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">
              Check daily school-wide schedules and assign teacher proxies.
            </p>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-colors w-full sm:w-auto"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-center shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Proxy Substitutions Today</span>
            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-black">
              {proxies.length} Active
            </span>
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">
            {proxies.length > 0 ? `🤝 Substitution Active` : `✅ Normal Schedules`}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Timetable Schedule Grid Area (2 Columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            {/* View toggles & Buttons */}
            <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white">🗓️ Weekly Class Period Mappings</h2>
                  
                  {/* View Toggles */}
                  <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-850">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold ${
                        viewMode === "list" 
                          ? "bg-blue-600 text-white shadow-sm" 
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      }`}
                      title="Timeline List View"
                    >
                      <List className="w-3.5 h-3.5" /> Timeline
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold ${
                        viewMode === "grid" 
                          ? "bg-blue-600 text-white shadow-sm" 
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      }`}
                      title="Master Grid Matrix View"
                    >
                      <Grid className="w-3.5 h-3.5" /> Master Grid
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  {timetable.length === 0 && !loading && (
                    <button
                      onClick={handlePopulateDemo}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-350 rounded-xl text-[10px] font-bold transition-all border border-slate-200 dark:border-slate-700"
                    >
                      Populate Demo Slots
                    </button>
                  )}
                  <button
                    onClick={() => openAddSlot()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black transition-all flex items-center gap-1 shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Slot
                  </button>
                </div>
              </div>

              {/* Day selection tabs */}
              <div className="flex flex-wrap gap-1 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => setActiveDayOfWeek(day.value)}
                    className={`flex-1 min-w-[50px] py-2 rounded-lg text-xs font-bold transition-all ${
                      activeDayOfWeek === day.value
                        ? "bg-blue-600 text-white shadow-md font-extrabold"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    <span className="hidden sm:inline">{day.label}</span>
                    <span className="inline sm:hidden">{day.short}</span>
                  </button>
                ))}
              </div>

              {/* Filters (Shown only in list mode) */}
              {viewMode === "list" && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Class Filter</label>
                    <select
                      value={filterClass}
                      onChange={(e) => setFilterClass(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="All">All Classes</option>
                      {Array.from(new Set(timetable.map(s => s.class))).sort().map(cls => (
                        <option key={cls} value={cls}>Class {cls}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Section Filter</label>
                    <select
                      value={filterSection}
                      onChange={(e) => setFilterSection(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="All">All Sections</option>
                      {Array.from(new Set(timetable.map(s => s.section))).sort().map(sec => (
                        <option key={sec} value={sec}>Section {sec}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* List/Grid View Render Area */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 animate-spin rounded-full mb-2" />
                <span className="text-xs text-slate-400 font-medium">Fetching active timetable...</span>
              </div>
            ) : timetable.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <span className="text-3xl block mb-2">🗓️</span>
                <h3 className="text-xs font-bold text-slate-650 dark:text-white">No Timetable Slots Configured</h3>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                  No classes configured. Press "+ Add Slot" or "Populate Demo Slots" to build your daily timetable.
                </p>
              </div>
            ) : viewMode === "list" ? (
              /* VIEW MODE 1: TIMELINE LIST */
              filteredSlots.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-xs text-slate-400">No classes fit this filter on this day.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredSlots.map((slot) => {
                    const proxy = getProxyForSlot(slot.id);
                    return (
                      <div
                        key={slot.id}
                        className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-105 dark:border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group relative overflow-hidden transition-all hover:border-slate-250 dark:hover:border-slate-800"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase text-blue-500 dark:text-blue-400 bg-blue-500/15 border border-blue-500/10 px-2 py-0.5 rounded-md">
                              Period {slot.period}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>

                          <h3 className="text-xs font-black text-slate-800 dark:text-white mt-1.5">
                            {slot.subject}
                          </h3>
                          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                            Class: <strong className="text-slate-700 dark:text-slate-350">{slot.class}{slot.section}</strong>
                          </div>

                          {proxy && (
                            <div className="mt-2.5 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-1.5 max-w-fit">
                              <span className="text-[9px] text-amber-600 dark:text-amber-400 font-extrabold">
                                ⚠️ Proxy Substitution: {getTeacherName(proxy.proxyTeacherId)} covers for absent {getTeacherName(proxy.absentTeacherId)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end gap-2.5 border-t sm:border-t-0 border-slate-105 dark:border-slate-900 pt-2.5 sm:pt-0">
                          <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            👩‍🏫 {getTeacherName(slot.teacherId)}
                          </div>

                          <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditSlot(slot)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                              title="Edit Slot"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                              title="Delete Slot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* VIEW MODE 2: PRODUCTION MASTER GRID MATRIX (Classes vs. Periods) */
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse table-fixed min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase">
                      <th className="px-4 py-3 w-[120px] text-center">Class / Sec</th>
                      {[1, 2, 3, 4, 5].map(pNum => (
                        <th key={pNum} className="px-4 py-3 text-center border-l border-slate-200 dark:border-slate-800">
                          Period {pNum}
                          <span className="block text-[8px] font-medium text-slate-400 normal-case mt-0.5">
                            {PERIOD_TIMES[pNum]?.start}-{PERIOD_TIMES[pNum]?.end}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allClassSections.map(clsSec => {
                      const [cls, sec] = clsSec.split("-");
                      return (
                        <tr key={clsSec} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-950/20">
                          {/* Class cell */}
                          <td className="px-4 py-3 font-black text-center text-xs text-blue-600 dark:text-blue-400 bg-slate-50/20 dark:bg-slate-950/10">
                            Class {cls}{sec}
                          </td>

                          {/* Periods cells */}
                          {[1, 2, 3, 4, 5].map(pNum => {
                            const slot = timetable.find(
                              s => s.dayOfWeek === activeDayOfWeek && s.class === cls && s.section === sec && s.period === pNum
                            );
                            const proxy = slot ? getProxyForSlot(slot.id) : null;

                            return (
                              <td key={pNum} className="px-3 py-3 border-l border-slate-200 dark:border-slate-800 text-center relative h-[80px]">
                                {slot ? (
                                  <div className="h-full flex flex-col justify-between group">
                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-0.5 shadow-sm transition-opacity">
                                      <button 
                                        onClick={() => openEditSlot(slot)} 
                                        className="text-slate-400 hover:text-blue-500 p-0.5"
                                        title="Edit Slot"
                                      >
                                        <Edit2 className="w-2.5 h-2.5" />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteSlot(slot.id)} 
                                        className="text-slate-400 hover:text-red-500 p-0.5"
                                        title="Delete Slot"
                                      >
                                        <Trash2 className="w-2.5 h-2.5" />
                                      </button>
                                    </div>

                                    <div>
                                      <div className="text-[10px] font-black text-slate-800 dark:text-white truncate">
                                        {slot.subject}
                                      </div>
                                      <div className="text-[9px] text-slate-505 truncate mt-0.5">
                                        👨‍🏫 {getTeacherName(slot.teacherId)}
                                      </div>
                                    </div>

                                    {proxy && (
                                      <span className="text-[8px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold border border-amber-500/20 px-1 py-0.5 rounded block truncate mt-1">
                                        🤝 Proxy: {getTeacherName(proxy.proxyTeacherId).split(" ")[0]}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  /* Empty slot button */
                                  <button
                                    onClick={() => openAddSlot(cls, sec, pNum)}
                                    className="w-full h-full border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-slate-350 transition-all text-slate-350 group"
                                  >
                                    <Plus className="w-4 h-4 opacity-30 group-hover:opacity-85 transition-opacity" />
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
            )}
          </div>
        </div>

        {/* Proxy Assignment Box (1 Column) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span>🤝 Arrange Teacher Proxy</span>
            </h2>
            <p className="text-[11px] text-slate-505 mt-1">
              Select a schedule slot below, and the dropdown will dynamically check who is available.
            </p>
          </div>

          {timetable.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl">
              <span className="text-xl block">📝</span>
              <p className="text-[10px] text-slate-400 mt-1 px-3">
                Timetable must be populated before arranging substitutions.
              </p>
            </div>
          ) : (
            <form onSubmit={handleAssignProxy} className="space-y-4">
              {/* Select class period slot */}
              <div>
                <label className="block text-[10px] text-slate-500 mb-1.5 font-semibold">Select Scheduled Period Slot</label>
                <select
                  required
                  value={selectedTimetableId}
                  onChange={(e) => setSelectedTimetableId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-850 dark:text-white focus:outline-none"
                >
                  <option value="">-- Choose Class Period --</option>
                  {availableSlotsForProxy.map(slot => (
                    <option key={slot.id} value={slot.id}>
                      Period {slot.period} - Class {slot.class}{slot.section} ({slot.subject})
                    </option>
                  ))}
                </select>
              </div>

              {/* Show original absent teacher automatically */}
              {selectedSlotForProxyDetails && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-750 dark:text-red-400 rounded-xl text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-[10px] block uppercase tracking-wider">Absent Staff Member</span>
                    <strong className="block text-xs mt-0.5">{getTeacherName(selectedSlotForProxyDetails.teacherId)}</strong>
                    <span className="text-[10px] text-red-650 dark:text-red-300">Teaching Subject: {selectedSlotForProxyDetails.subject}</span>
                  </div>
                </div>
              )}

              {/* Select proxy teacher (Filtered with availability check) */}
              <div>
                <label className="block text-[10px] text-slate-500 mb-1.5 font-semibold">Select Substitute Proxy Teacher</label>
                <select
                  required
                  value={proxyTeacherId}
                  disabled={!selectedTimetableId}
                  onChange={(e) => setProxyTeacherId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-850 dark:text-white focus:outline-none disabled:opacity-50"
                >
                  <option value="">
                    {!selectedTimetableId ? "-- Select schedule slot first --" : "-- Choose Substitute Teacher --"}
                  </option>
                  {proxyAvailabilityTeachers
                    .filter(t => !selectedSlotForProxyDetails || t.id !== selectedSlotForProxyDetails.teacherId)
                    .map(t => (
                      <option key={t.id} value={t.id} disabled={t.isBusy}>
                        {t.name} ({t.subject}) — {t.isBusy ? `❌ BUSY (${t.busyWithClass})` : `🟢 FREE`}
                      </option>
                    ))}
                </select>
              </div>

              {/* Substitute notes */}
              <div>
                <label className="block text-[10px] text-slate-500 mb-1.5 font-semibold">Substitution Notes (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Coverage due to personal medical leave"
                  value={proxyNotes}
                  onChange={(e) => setProxyNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedTimetableId || !proxyTeacherId}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-205 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-black rounded-xl text-xs transition-colors shadow-md mt-1"
              >
                Confirm Proxy Substitution
              </button>
            </form>
          )}

          {/* Active proxy list summary */}
          {proxies.length > 0 && (
            <div className="mt-6 border-t border-slate-150 dark:border-slate-800 pt-5">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Active Substitutions ({proxies.length})</h4>
              <div className="space-y-2">
                {proxies.map(p => {
                  const details = timetable.find(s => s.id === p.timetableId);
                  return (
                    <div key={p.id} className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-900 rounded-xl text-[10px]">
                      <div className="font-extrabold text-slate-700 dark:text-slate-350">
                        Class {details?.class || "?"}{details?.section || "?"} · Period {p.period}
                      </div>
                      <div className="text-slate-500 mt-1 font-medium">
                        replaces <strong className="text-red-500">{getTeacherName(p.absentTeacherId)}</strong> with <strong className="text-green-600 dark:text-green-400">{getTeacherName(p.proxyTeacherId)}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Weekly Timetable Slot Add/Edit Modal ────────────────────────────── */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-900 flex justify-between items-center bg-slate-50/50 dark:bg-slate-955">
              <div>
                <h3 className="text-sm font-bold text-slate-850 dark:text-white">
                  {editingSlot ? "✏️ Edit Timetable Slot" : "➕ Add Weekly Class Slot"}
                </h3>
                <p className="text-[10px] text-slate-505 mt-0.5">
                  Define a scheduled period slot for a class section.
                </p>
              </div>
              <button
                onClick={() => setIsSlotModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSlot} className="p-6 space-y-4">
              {/* Class & Section */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Class Level *</label>
                  <select
                    value={slotForm.class}
                    onChange={(e) => setSlotForm(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                  >
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map(cls => (
                      <option key={cls} value={cls}>Class {cls}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Section *</label>
                  <select
                    value={slotForm.section}
                    onChange={(e) => setSlotForm(prev => ({ ...prev, section: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                  >
                    {["A", "B", "C", "D", "E", "F", "G"].map(sec => (
                      <option key={sec} value={sec}>Section {sec}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Day of Week & Period */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Weekly Day *</label>
                  <select
                    value={slotForm.dayOfWeek}
                    onChange={(e) => setSlotForm(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                  >
                    {DAYS_OF_WEEK.map(day => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Period Number *</label>
                  <select
                    value={slotForm.period}
                    onChange={(e) => handlePeriodChange(parseInt(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map(pNum => (
                      <option key={pNum} value={pNum}>Period {pNum}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Teaching Subject *</label>
                <select
                  value={slotForm.subject}
                  onChange={(e) => setSlotForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                >
                  {SUBJECTS.map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>

              {/* Teacher Assign */}
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Assigned Instructor *</label>
                <select
                  required
                  value={slotForm.teacherId}
                  onChange={(e) => setSlotForm(prev => ({ ...prev, teacherId: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="">-- Choose Instructor --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject})
                    </option>
                  ))}
                </select>
              </div>

              {/* Start and End Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Start Time *</label>
                  <input
                    type="text"
                    required
                    value={slotForm.startTime}
                    onChange={(e) => setSlotForm(prev => ({ ...prev, startTime: e.target.value }))}
                    placeholder="e.g. 09:30"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">End Time *</label>
                  <input
                    type="text"
                    required
                    value={slotForm.endTime}
                    onChange={(e) => setSlotForm(prev => ({ ...prev, endTime: e.target.value }))}
                    placeholder="e.g. 10:15"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black rounded-xl text-xs transition-colors shadow-md mt-2"
              >
                {submitting ? "Saving changes..." : editingSlot ? "Save Weekly Slot Changes" : "Confirm and Create Slot"}
              </button>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
