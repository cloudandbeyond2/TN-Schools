"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import { 
  Users, 
  Calendar, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  UserMinus, 
  UserCheck, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical,
  BellRing,
  Info,
  CalendarDays,
  TrendingUp,
  SlidersHorizontal,
  X
} from "lucide-react";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};
const API_BASE = getApiBase();

interface StudentDailyLog {
  studentId: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "LEAVE" | "UNMARKED";
}

interface Summary {
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  unmarked: number;
  percentage: number;
}

interface ClassWiseStat {
  className: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  marked: number;
  percentage: number;
}

interface LateLog {
  id: string;
  studentId: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  status: string;
  time: string;
}

interface AbsenceAlert {
  studentId: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  attendancePct: number;
  consecutiveDaysAbsent: number;
  phone: string;
}

interface MonthlyTrend {
  month: string;
  year: number;
  percentage: number;
}

interface DailyTrend {
  date: string;
  percentage: number;
}

interface StatsData {
  summary: Summary;
  classWise: ClassWiseStat[];
  lateLogs: LateLog[];
  alerts: AbsenceAlert[];
  monthlyTrends: MonthlyTrend[];
  dailyTrends: DailyTrend[];
  dailyLogs: StudentDailyLog[];
}

export default function HeadmasterAttendancePage() {
  const { data: session } = useSession();
  const mySchoolId: string = (session?.user as any)?.schoolId || "";

  // Date and filter states
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [selectedClass, setSelectedClass] = useState<string>("All");
  const [selectedSection, setSelectedSection] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Tab state: 'daily' | 'monthly' | 'alerts' | 'late'
  const [activeTab, setActiveTab] = useState<"daily" | "monthly" | "alerts" | "late">("daily");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Stats data state
  const [data, setData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Fetch all stats
  const fetchStats = useCallback(async () => {
    if (!mySchoolId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/attendance/school/${mySchoolId}/stats?date=${selectedDate}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Error fetching attendance stats:", err);
    } finally {
      setIsLoading(false);
    }
  }, [mySchoolId, selectedDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle manual attendance status change
  const handleStatusChange = async (studentId: string, newStatus: string) => {
    if (!mySchoolId) return;
    setIsUpdating(studentId);
    try {
      const res = await fetch(`${API_BASE}/api/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: [
            {
              studentId,
              schoolId: mySchoolId,
              date: selectedDate,
              status: newStatus,
              method: "Manual",
              period: 0,
              subject: "General"
            }
          ],
          notifySMS: false
        })
      });
      const json = await res.json();
      if (json.success) {
        // Trigger quick toast message
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Attendance updated successfully",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          background: "#1e293b",
          color: "#fff"
        });
        // Reload stats
        await fetchStats();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setIsUpdating(null);
    }
  };

  // Trigger absence warning SMS to parent
  const handleNotifyParent = async (alert: AbsenceAlert) => {
    Swal.fire({
      title: "Send Attendance Alert?",
      text: `Do you want to send a low attendance warning SMS to ${alert.name}'s parent?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, Send SMS",
      background: "#1e293b",
      color: "#fff"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API_BASE}/api/attendance`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              records: [
                {
                  studentId: alert.studentId,
                  schoolId: mySchoolId,
                  date: selectedDate,
                  status: "ABSENT",
                  method: "Manual",
                  period: 0,
                  subject: "General"
                }
              ],
              notifySMS: true // This triggers SMS notifications on backend
            })
          });
          const json = await res.json();
          if (json.success) {
            Swal.fire({
              title: "Alert Dispatched!",
              text: `SMS warning successfully sent to +91 ${alert.phone}. Notification saved in parent portal.`,
              icon: "success",
              confirmButtonColor: "#3b82f6",
              background: "#1e293b",
              color: "#fff"
            });
            fetchStats();
          }
        } catch (err) {
          console.error("Error triggering notification:", err);
        }
      }
    });
  };

  // Reset filters helper
  const handleResetFilters = () => {
    setSelectedClass("All");
    setSelectedSection("All");
    setStatusFilter("All");
    setSearchTerm("");
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  // Extract classes and sections dynamically
  const classesList = ["6", "7", "8", "9", "10", "11", "12"];
  const sectionsList = ["A", "B", "C", "D", "E"];

  // Filter logs for the Daily Log list
  const filteredDailyLogs = React.useMemo(() => {
    if (!data?.dailyLogs) return [];
    return data.dailyLogs.filter((log) => {
      const matchClass = selectedClass === "All" || log.class === selectedClass;
      const matchSection = selectedSection === "All" || log.section === selectedSection;
      const matchStatus = statusFilter === "All" || log.status === statusFilter;
      
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = 
        log.name.toLowerCase().includes(searchLower) || 
        log.rollNumber.toLowerCase().includes(searchLower);

      return matchClass && matchSection && matchStatus && matchSearch;
    });
  }, [data?.dailyLogs, selectedClass, selectedSection, statusFilter, searchTerm]);

  // Paginated daily logs
  const totalPages = Math.ceil(filteredDailyLogs.length / pageSize);
  const paginatedLogs = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDailyLogs.slice(start, start + pageSize);
  }, [filteredDailyLogs, currentPage, pageSize]);

  // Reset page number on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClass, selectedSection, statusFilter, searchTerm]);

  // Calendar parameters calculation
  const calendarCells = React.useMemo(() => {
    if (!data?.dailyTrends) return [];
    const dateObj = new Date(selectedDate);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();

    // Get number of days in selected month
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const cells = [];
    for (let day = 1; day <= totalDays; day++) {
      const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      // Find trend matching this date
      const trend = data.dailyTrends.find(t => t.date === dayStr);
      cells.push({
        day,
        dateStr: dayStr,
        percentage: trend ? trend.percentage : null
      });
    }
    return cells;
  }, [data?.dailyTrends, selectedDate]);

  return (
    <PortalLayout
      title="School Attendance Hub"
      subtitle="Mr. Venkatesh R. · GHS Coimbatore · DISE: 33012345"
      avatarLetter="V"
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      {/* Search & Filter Panel */}
      <div className="glass rounded-2xl p-4 sm:p-5 border border-slate-800/80 mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">Dashboard Filters</h2>
          </div>
          <button 
            onClick={handleResetFilters}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-semibold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset All Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Class Filter */}
          <div className="flex flex-col space-y-1.5 text-left">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer transition-colors"
            >
              <option value="All">All Classes</option>
              {classesList.map(cls => (
                <option key={cls} value={cls}>Grade {cls}</option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div className="flex flex-col space-y-1.5 text-left">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer transition-colors"
            >
              <option value="All">All Sections</option>
              {sectionsList.map(sec => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="flex flex-col space-y-1.5 text-left">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target Date</label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer transition-colors"
              />
            </div>
          </div>

          {/* Search Box */}
          <div className="flex flex-col space-y-1.5 text-left">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Search Student</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name or roll..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Row (Styled as Flat Vector Icons Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Students",
            value: isLoading ? "..." : (data?.summary?.totalStudents || 0).toString(),
            icon: <Users className="w-5 h-5 text-blue-400" />,
            bg: "bg-blue-500/10 border-blue-500/20",
            iconBg: "bg-blue-500/20 text-blue-400",
            sub: "Registered School strength"
          },
          {
            label: "Presence Rate",
            value: isLoading ? "..." : `${data?.summary?.percentage || 0}%`,
            icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
            bg: "bg-emerald-500/10 border-emerald-500/20",
            iconBg: "bg-emerald-500/20 text-emerald-400",
            sub: "Overall Attendance Rate"
          },
          {
            label: "Absents Today",
            value: isLoading ? "..." : (data?.summary?.absent || 0).toString(),
            icon: <UserMinus className="w-5 h-5 text-rose-400" />,
            bg: "bg-rose-500/10 border-rose-500/20",
            iconBg: "bg-rose-500/20 text-rose-400",
            sub: "Requires watchlist review"
          },
          {
            label: "Late Arrivals",
            value: isLoading ? "..." : (data?.summary?.late || 0).toString(),
            icon: <Clock className="w-5 h-5 text-amber-400" />,
            bg: "bg-amber-500/10 border-amber-500/20",
            iconBg: "bg-amber-500/20 text-amber-400",
            sub: "Lateness statistics logged"
          }
        ].map((card, i) => (
          <div 
            key={i} 
            className={`glass rounded-2xl p-4 border flex items-center justify-between hover:scale-[1.02] hover:-translate-y-0.5 hover:border-slate-700 transition-all duration-300 shadow-sm ${card.bg}`}
          >
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{card.label}</span>
              <span className="text-lg sm:text-2xl font-black text-white mt-1.5">{card.value}</span>
              <span className="text-[9px] text-slate-500 font-semibold mt-1 truncate">{card.sub}</span>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ml-3 ${card.iconBg}`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Menu Panel */}
      <div className="glass rounded-2xl border border-slate-800/80 mb-6 overflow-hidden">
        <div className="flex border-b border-slate-800/80 bg-slate-900/40 p-2 overflow-x-auto gap-2">
          {[
            { id: "daily", label: "Daily Attendance Log", icon: <CalendarDays className="w-4 h-4" /> },
            { id: "monthly", label: "Monthly Presence & Charts", icon: <TrendingUp className="w-4 h-4" /> },
            { id: "alerts", label: "Absence Watchlist & Warnings", icon: <AlertTriangle className="w-4 h-4" /> },
            { id: "late", label: "Late Logs Today", icon: <Clock className="w-4 h-4" /> }
          ].map((tab) => {
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isTabActive 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Body Contents */}
        <div className="p-5 min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-xs gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
              <span>Fetching dashboard data...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: DAILY LOG */}
              {activeTab === "daily" && (
                <div className="space-y-4 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white">Daily Attendance Grid</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Edit status or verify daily marks. Total matched: {filteredDailyLogs.length}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">Status Filter:</span>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-200 cursor-pointer focus:outline-none focus:border-blue-500"
                      >
                        <option value="All">All Statuses</option>
                        <option value="PRESENT">Present</option>
                        <option value="ABSENT">Absent</option>
                        <option value="LATE">Late</option>
                        <option value="LEAVE">Leave</option>
                        <option value="UNMARKED">Unmarked</option>
                      </select>
                    </div>
                  </div>

                  {filteredDailyLogs.length === 0 ? (
                    <div className="text-center py-16 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                      <Info className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p className="text-xs font-bold">No attendance records found matching filters.</p>
                      <p className="text-[10px] text-slate-600 mt-1">Try resetting filter selectors or picking a different date.</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Roll Number</th>
                              <th>Student Name</th>
                              <th>Class & Section</th>
                              <th>Attendance Status</th>
                              <th className="text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedLogs.map((log) => (
                              <tr key={log.studentId} className="hover:bg-slate-800/20 transition-colors">
                                <td className="font-mono text-[11px] font-bold text-slate-400">{log.rollNumber}</td>
                                <td className="font-bold text-white text-xs">{log.name}</td>
                                <td>
                                  <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                    Grade {log.class} - {log.section}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge ${
                                    log.status === "PRESENT" 
                                      ? "badge-green" 
                                      : log.status === "ABSENT" 
                                      ? "badge-red" 
                                      : log.status === "LATE" 
                                      ? "badge-yellow" 
                                      : log.status === "LEAVE"
                                      ? "badge-blue"
                                      : "bg-slate-800 text-slate-400"
                                  }`}>
                                    {log.status}
                                  </span>
                                </td>
                                <td className="text-right">
                                  {isUpdating === log.studentId ? (
                                    <div className="w-5 h-5 rounded-full border border-blue-500/30 border-t-blue-500 animate-spin ml-auto" />
                                  ) : (
                                    <div className="inline-flex gap-1.5">
                                      <button
                                        onClick={() => handleStatusChange(log.studentId, "PRESENT")}
                                        disabled={log.status === "PRESENT"}
                                        className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 rounded-lg text-[10px] font-bold transition-all border border-emerald-500/20 disabled:opacity-30 disabled:hover:bg-emerald-500/10 disabled:hover:text-emerald-400"
                                      >
                                        Present
                                      </button>
                                      <button
                                        onClick={() => handleStatusChange(log.studentId, "ABSENT")}
                                        disabled={log.status === "ABSENT"}
                                        className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500 hover:text-slate-950 text-rose-400 rounded-lg text-[10px] font-bold transition-all border border-rose-500/20 disabled:opacity-30 disabled:hover:bg-rose-500/10 disabled:hover:text-rose-400"
                                      >
                                        Absent
                                      </button>
                                      <button
                                        onClick={() => handleStatusChange(log.studentId, "LATE")}
                                        disabled={log.status === "LATE"}
                                        className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-400 rounded-lg text-[10px] font-bold transition-all border border-amber-500/20 disabled:opacity-30 disabled:hover:bg-amber-500/10 disabled:hover:text-amber-400"
                                      >
                                        Late
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards List View */}
                      <div className="block md:hidden space-y-3">
                        {paginatedLogs.map((log) => (
                          <div 
                            key={log.studentId} 
                            className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3 flex flex-col text-left"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-white text-xs">{log.name}</h4>
                                <span className="font-mono text-[10px] text-slate-500">Roll: {log.rollNumber}</span>
                              </div>
                              <span className={`badge ${
                                log.status === "PRESENT" 
                                  ? "badge-green" 
                                  : log.status === "ABSENT" 
                                  ? "badge-red" 
                                  : log.status === "LATE" 
                                  ? "badge-yellow" 
                                  : log.status === "LEAVE"
                                  ? "badge-blue"
                                  : "bg-slate-800 text-slate-400"
                              }`}>
                                {log.status}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center pt-2 border-t border-slate-800/60">
                              <span className="text-[10px] font-bold text-slate-400">
                                Grade {log.class} - {log.section}
                              </span>
                              {isUpdating === log.studentId ? (
                                <div className="w-5 h-5 rounded-full border border-blue-500/30 border-t-blue-500 animate-spin" />
                              ) : (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleStatusChange(log.studentId, "PRESENT")}
                                    disabled={log.status === "PRESENT"}
                                    className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 rounded-md text-[9px] font-bold transition-all border border-emerald-500/20 disabled:opacity-30"
                                  >
                                    Present
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(log.studentId, "ABSENT")}
                                    disabled={log.status === "ABSENT"}
                                    className="px-2 py-0.5 bg-rose-500/10 hover:bg-rose-500 hover:text-slate-950 text-rose-400 rounded-md text-[9px] font-bold transition-all border border-rose-500/20 disabled:opacity-30"
                                  >
                                    Absent
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(log.studentId, "LATE")}
                                    disabled={log.status === "LATE"}
                                    className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-400 rounded-md text-[9px] font-bold transition-all border border-amber-500/20 disabled:opacity-30"
                                  >
                                    Late
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination Controls */}
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-slate-800/40">
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>
                            Showing {filteredDailyLogs.length === 0 ? 0 : ((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredDailyLogs.length)} of {filteredDailyLogs.length} students
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span>Show</span>
                            <select
                              value={pageSize}
                              onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(1);
                              }}
                              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-300 focus:outline-none focus:border-slate-700"
                            >
                              <option value={5}>5</option>
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                            </select>
                            <span>entries</span>
                          </div>
                        </div>
                        {totalPages > 0 && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs rounded-xl transition-colors border border-slate-700 disabled:cursor-not-allowed font-semibold flex items-center gap-1"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" /> Previous
                            </button>
                            <div className="px-3.5 py-1.5 bg-slate-900/50 text-slate-400 text-xs rounded-xl border border-slate-850 flex items-center font-bold">
                              Page {currentPage} of {totalPages}
                            </div>
                            <button
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs rounded-xl transition-colors border border-slate-700 disabled:cursor-not-allowed font-semibold flex items-center gap-1"
                            >
                              Next <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 2: MONTHLY TRENDS */}
              {activeTab === "monthly" && (
                <div className="space-y-6 text-left">
                  {/* Attendance Rate ring and trends bar */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Ring score */}
                    <div className="glass rounded-2xl p-5 border border-slate-800/80 flex flex-col items-center justify-center text-center">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Overall Month Score</h4>
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        {/* Circular Progress Bar SVG */}
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            stroke="#3b82f6" 
                            strokeWidth="8" 
                            fill="transparent" 
                            strokeDasharray={2 * Math.PI * 40}
                            strokeDashoffset={2 * Math.PI * 40 * (1 - (data?.summary?.percentage || 0) / 100)}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute flex flex-col">
                          <span className="text-xl sm:text-2xl font-black text-white">{data?.summary?.percentage || 0}%</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Present</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">Attendance rate calculated over all class segments on selected target date.</p>
                    </div>

                    {/* Monthly chart (6 months) */}
                    <div className="glass rounded-2xl p-5 border border-slate-800/80 md:col-span-2 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last 6 Months Presence Rate</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Average student attendance index month-on-month.</p>
                      </div>

                      {/* CSS-based Bar Chart */}
                      <div className="h-40 flex items-end justify-around gap-2 pt-4 px-2">
                        {data?.monthlyTrends?.map((trend, idx) => (
                          <div key={idx} className="flex flex-col items-center group w-full">
                            <div className="relative w-full flex flex-col justify-end h-28">
                              {/* Hover Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-slate-950 border border-slate-800 text-[10px] font-bold text-white px-2 py-0.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mb-1 z-10 whitespace-nowrap">
                                {trend.percentage}%
                              </div>
                              <div 
                                style={{ height: `${trend.percentage}%` }} 
                                className="w-6 sm:w-10 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg mx-auto group-hover:brightness-110 transition-all duration-300"
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 mt-2 truncate w-full text-center">
                              {trend.month}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                    {/* Monthly Calendar View */}
                    <div className="glass rounded-2xl p-5 border border-slate-800/80 lg:col-span-2 space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-white">Daily Heatmap Calendar</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Presence rates day-by-day. Colors represent attendance ranges.</p>
                      </div>

                      {/* Heatmap color guide */}
                      <div className="flex flex-wrap gap-3 items-center text-[10px] font-bold text-slate-500 border-b border-slate-800/60 pb-3">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/40" /> Good (&gt;=90%)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500/40" /> Warning (75-89%)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-rose-500/20 border border-rose-500/40" /> Critical (&lt;75%)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700/60" /> Future / No logs
                        </span>
                      </div>

                      {/* Calendar Grid */}
                      <div className="grid grid-cols-7 gap-2.5 pt-2">
                        {/* Day Headers */}
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                          <div key={day} className="text-center text-[9px] uppercase font-black text-slate-500 tracking-wider">
                            {day}
                          </div>
                        ))}

                        {/* Calendar cells */}
                        {calendarCells.map((cell) => {
                          const pct = cell.percentage;
                          
                          // Color mapping
                          let colorClass = "bg-slate-800/40 border-slate-850 text-slate-500";
                          if (pct !== null) {
                            if (pct >= 90) colorClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20";
                            else if (pct >= 75) colorClass = "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20";
                            else colorClass = "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20";
                          }

                          return (
                            <div
                              key={cell.day}
                              className={`aspect-square flex flex-col items-center justify-center rounded-xl border text-[10px] font-bold cursor-pointer transition-all duration-200 relative group ${colorClass}`}
                            >
                              <span>{cell.day}</span>
                              {pct !== null && (
                                <span className="text-[7px] opacity-75 font-normal mt-0.5">{pct}%</span>
                              )}

                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 bg-slate-950 border border-slate-800 px-2 py-1 rounded text-[9px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
                                <div>Date: {cell.dateStr}</div>
                                {pct !== null ? <div>Rate: {pct}% Present</div> : <div>No marks logged</div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Class-wise rankings */}
                    <div className="glass rounded-2xl p-5 border border-slate-800/80 space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-white">Class-wise Metrics</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Average presence percentage index by grade segment.</p>
                      </div>

                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                        {data?.classWise?.map((cls, idx) => (
                          <div key={idx} className="space-y-1.5 text-xs text-left">
                            <div className="flex justify-between items-center font-semibold">
                              <span className="text-white font-bold">{cls.className}</span>
                              <span className={`${
                                cls.percentage >= 90 
                                  ? "text-emerald-400" 
                                  : cls.percentage >= 80 
                                  ? "text-amber-400" 
                                  : "text-rose-400"
                              } font-bold`}>
                                {cls.percentage}%
                              </span>
                            </div>
                            
                            {/* Horizontal Progress Bar */}
                            <div className="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden">
                              <div 
                                style={{ width: `${cls.percentage}%` }}
                                className={`h-full rounded-full transition-all duration-500 ${
                                  cls.percentage >= 90 
                                    ? "bg-emerald-500" 
                                    : cls.percentage >= 80 
                                    ? "bg-amber-500" 
                                    : "bg-rose-500"
                                }`}
                              />
                            </div>
                            
                            <div className="flex justify-between text-[9px] text-slate-500">
                              <span>Total: {cls.total}</span>
                              <span>P: {cls.present} · A: {cls.absent} · L: {cls.late}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ABSENCE WATCHLIST */}
              {activeTab === "alerts" && (
                <div className="space-y-4 text-left">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">Absence Watchlist Warnings</h3>
                    <p className="text-xs text-slate-400 mt-0.5">System has flagged {data?.alerts?.length || 0} students with attendance below 75% or with consecutive absences (3+ days) this month.</p>
                  </div>

                  {(!data?.alerts || data.alerts.length === 0) ? (
                    <div className="text-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                      <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500/80" />
                      <p className="text-xs font-bold text-emerald-400">All student attendance rates are healthy!</p>
                      <p className="text-[10px] text-slate-650 mt-1">No warnings or critical dropout risks detected in this school segment.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.alerts.map((alert) => (
                        <div 
                          key={alert.studentId}
                          className="glass p-4 rounded-2xl border border-red-500/20 bg-red-500/[0.02] flex flex-col justify-between hover:border-red-500/40 hover:bg-red-500/[0.04] transition-all duration-300"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-white text-sm">{alert.name}</h4>
                                <span className="font-mono text-[10px] text-slate-500">Roll: {alert.rollNumber}</span>
                              </div>
                              <span className="bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-red-400 tracking-wider">
                                Risk Alert
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1.5 text-xs">
                              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-850">
                                <div className="text-[9px] uppercase font-bold text-slate-500">Monthly Average</div>
                                <div className="text-base font-black text-rose-400 mt-0.5">{alert.attendancePct}%</div>
                              </div>
                              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-850">
                                <div className="text-[9px] uppercase font-bold text-slate-500">Consecutive Absent</div>
                                <div className="text-base font-black text-amber-400 mt-0.5">{alert.consecutiveDaysAbsent} Days</div>
                              </div>
                            </div>

                            <div className="text-[10px] text-slate-400 pt-1">
                              <strong>Class:</strong> Grade {alert.class} - {alert.section} · <strong>Parent Mobile:</strong> +91 {alert.phone}
                            </div>
                          </div>

                          <div className="pt-4 mt-3 border-t border-slate-850/80 flex items-center justify-between">
                            <span className="text-[10px] text-red-400/80 flex items-center gap-1 font-semibold">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              Below compliance threshold (75%)
                            </span>
                            <button
                              onClick={() => handleNotifyParent(alert)}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/10"
                            >
                              <BellRing className="w-3.5 h-3.5" />
                              Notify Parent
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: LATE ARRIVALS */}
              {activeTab === "late" && (
                <div className="space-y-4 text-left">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">Late Attendance Log</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Students who arrived late to school today. Total logged: {data?.lateLogs?.length || 0}</p>
                  </div>

                  {(!data?.lateLogs || data.lateLogs.length === 0) ? (
                    <div className="text-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                      <CheckCircle2 className="w-9 h-9 mx-auto mb-2 text-emerald-500/80" />
                      <p className="text-xs font-bold text-emerald-400">No late arrivals today!</p>
                      <p className="text-[10px] text-slate-650 mt-1">All present students were logged before instruction period started.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Roll Number</th>
                            <th>Student Name</th>
                            <th>Class & Section</th>
                            <th>Arrival Time</th>
                            <th className="text-right">Quick Change</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.lateLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                              <td className="font-mono text-[11px] font-bold text-slate-400">{log.rollNumber}</td>
                              <td className="font-bold text-white text-xs">{log.name}</td>
                              <td>
                                <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                  Grade {log.class} - {log.section}
                                </span>
                              </td>
                              <td className="text-amber-400 font-semibold text-xs flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                {log.time}
                              </td>
                              <td className="text-right">
                                {isUpdating === log.studentId ? (
                                  <div className="w-4 h-4 rounded-full border border-blue-500/30 border-t-blue-500 animate-spin ml-auto" />
                                ) : (
                                  <button
                                    onClick={() => handleStatusChange(log.studentId, "PRESENT")}
                                    className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 rounded-lg text-[10px] font-bold transition-all border border-emerald-500/25"
                                  >
                                    Mark Present
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
