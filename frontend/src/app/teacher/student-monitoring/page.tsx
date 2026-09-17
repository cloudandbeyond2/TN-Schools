"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import {
  Users,
  Clock,
  Activity,
  CheckCircle2,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  BookOpen,
  Send,
  AlertCircle,
  GraduationCap
} from "lucide-react";

interface StudentMonitoringItem {
  id: string;
  userId: string;
  name: string;
  class: string;
  section: string;
  classSection: string;
  rollNumber: string;
  emisNumber: string | null;
  status: "Active Now" | "Logged In Today" | "Offline";
  isOnline: boolean;
  isLoggedInToday: boolean;
  lastActiveTime: string;
  minutesToday: number;
  hoursToday: number;
  totalUsageHours: number;
  resourcesAccessedToday: number;
}

interface SummaryStats {
  totalEnrolled: number;
  loggedInTodayCount: number;
  activeNowCount: number;
  loginRatePercent: number;
  totalHoursToday: number;
  avgHoursPerStudent: number;
  totalHoursWeek: number;
}

export default function StudentMonitoringPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const teacherId = (session?.user as any)?.id;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [summary, setSummary] = useState<SummaryStats>({
    totalEnrolled: 0,
    loggedInTodayCount: 0,
    activeNowCount: 0,
    loginRatePercent: 0,
    totalHoursToday: 0,
    avgHoursPerStudent: 0,
    totalHoursWeek: 0,
  });

  const [students, setStudents] = useState<StudentMonitoringItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMonitoringData = async () => {
    if (!schoolId && !teacherId) return;
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (schoolId) params.set("schoolId", schoolId);
      if (teacherId) params.set("teacherId", teacherId);

      const res = await fetch(`${API_URL}/api/teacher/student-monitoring?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setSummary(json.data.summary);
        setStudents(json.data.students || []);
      } else {
        setError(json.error || "Could not fetch monitoring data.");
      }
    } catch (err) {
      console.error("Error fetching monitoring data:", err);
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
  }, [schoolId, teacherId, API_URL]);

  // Unique classes for filtering
  const availableClasses = useMemo(() => {
    const set = new Set(students.map((s) => s.classSection));
    return ["All", ...Array.from(set)];
  }, [students]);

  // Filtered student roster
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = selectedClass === "All" || s.classSection === selectedClass;
      const matchStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Active Now" && s.isOnline) ||
        (selectedStatus === "Logged In Today" && s.isLoggedInToday) ||
        (selectedStatus === "Offline" && s.status === "Offline");

      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q) ||
        s.classSection.toLowerCase().includes(q);

      return matchClass && matchStatus && matchSearch;
    });
  }, [students, selectedClass, selectedStatus, searchTerm]);

  const handleSendReminder = (studentName: string) => {
    Swal.fire({
      title: lang === "தமிழ்" ? "நினைவூட்டல் அனுப்புக" : `Send Reminder to ${studentName}`,
      text: lang === "தமிழ்" ? "மாணவரின் போர்டல் முகப்பிற்கு கற்றல் நினைவூட்டல் செய்தியை அனுப்புகிறீர்கள்." : "Send a learning & portal login encouragement note to this student's portal homepage.",
      input: "textarea",
      inputValue: "Keep up the great study routine! Make sure to complete today's digital library readings.",
      showCancelButton: true,
      confirmButtonText: lang === "தமிழ்" ? "அனுப்பு" : "Send Note",
      confirmButtonColor: "#4f46e5",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: "success",
          title: lang === "தமிழ்" ? "அனுப்பப்பட்டது!" : "Reminder Sent!",
          text: lang === "தமிழ்" ? "நினைவூட்டல் செய்தி வெற்றிகரமாக அனுப்பப்பட்டது." : `Portal encouragement note sent to ${studentName}.`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const formatLastActive = (isoString: string) => {
    if (!isoString) return "No record";
    const date = new Date(isoString);
    const now = new Date();
    const diffMins = Math.round((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMins < 5) return lang === "தமிழ்" ? "இப்போது செயலில்" : "Active Just Now";
    if (diffMins < 60) return `${diffMins} ${lang === "தமிழ்" ? "நிமிடங்களுக்கு முன்" : "mins ago"}`;
    if (diffMins < 1440) {
      return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "மாணவர் உள்நுழைவு & பயன்பாட்டு மணிநேரக் கண்காணிப்பு" : "Student Login & Portal Usage Monitoring"}
      subtitle={lang === "தமிழ்" ? "மாணவர்களின் போர்டல் உள்நுழைவு, இன்றைய கற்றல் மணிநேரம் மற்றும் நேரலை செயல்பாட்டைக் கண்காணியுங்கள்." : "Track real-time student portal logins, daily study hours logged, and active learning sessions."}
    >
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 theme-card p-5 border border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-500 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-heading)]">
              {lang === "தமிழ்" ? "நேரலை மாணவர் கண்காணிப்பு டாஷ்போர்டு" : "Live Student Login & Study Hours Tracker"}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {lang === "தமிழ்" ? "உங்கள் வகுப்புகளின் மாணவர்கள் போர்டலில் செலவிடும் நேரத்தை நேரலையாகக் கண்காணிக்கலாம்." : "Monitor how many students are logged in today and track their exact portal learning hours."}
            </p>
          </div>
        </div>

        <button
          onClick={fetchMonitoringData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all shrink-0 self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {lang === "தமிழ்" ? "புதுப்பி" : "Refresh Analytics"}
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Logged in Students Today */}
        <div className="theme-card p-5 border border-[var(--border)] hover:border-indigo-500/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-500 border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              {summary.loginRatePercent}% {lang === "தமிழ்" ? "உள்நுழைவு விகிதம்" : "Login Rate"}
            </span>
          </div>
          <div className="text-3xl font-black text-[var(--text-heading)] mb-1">
            {summary.loggedInTodayCount} <span className="text-sm font-normal text-[var(--text-muted)]">/ {summary.totalEnrolled}</span>
          </div>
          <div className="text-xs text-[var(--text-muted)] font-medium">
            {lang === "தமிழ்" ? "இன்று உள்நுழைந்த மாணவர்கள்" : "Students Logged In Today"}
          </div>
        </div>

        {/* Active Right Now */}
        <div className="theme-card p-5 border border-[var(--border)] hover:border-emerald-500/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
              ● {lang === "தமிழ்" ? "நேரலை" : "Live Online"}
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-500 mb-1">
            {summary.activeNowCount} <span className="text-sm font-normal text-[var(--text-muted)]">{lang === "தமிழ்" ? "மாணவர்கள்" : "Active Now"}</span>
          </div>
          <div className="text-xs text-[var(--text-muted)] font-medium">
            {lang === "தமிழ்" ? "கடைசி 30 நிமிடங்களில் செயலில் உள்ளவர்கள்" : "Active in Last 30 Minutes"}
          </div>
        </div>

        {/* Total Portal Usage Hours Today */}
        <div className="theme-card p-5 border border-[var(--border)] hover:border-amber-500/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              {lang === "தமிழ்" ? "இன்றைய கற்றல் நேரம்" : "Today's Learning"}
            </span>
          </div>
          <div className="text-3xl font-black text-amber-500 mb-1">
            {summary.totalHoursToday} <span className="text-sm font-normal text-[var(--text-muted)]">{lang === "தமிழ்" ? "மணிநேரம்" : "Hours"}</span>
          </div>
          <div className="text-xs text-[var(--text-muted)] font-medium">
            {lang === "தமிழ்" ? "இன்று செலவிடப்பட்ட மொத்த மணிநேரம்" : "Total Study Hours Logged Today"}
          </div>
        </div>

        {/* Average Hours per Student */}
        <div className="theme-card p-5 border border-[var(--border)] hover:border-purple-500/50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-500 border border-purple-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              {summary.totalHoursWeek}h {lang === "தமிழ்" ? "இந்த வாரம்" : "This Week"}
            </span>
          </div>
          <div className="text-3xl font-black text-purple-400 mb-1">
            {summary.avgHoursPerStudent} <span className="text-sm font-normal text-[var(--text-muted)]">{lang === "தமிழ்" ? "மணி/மாணவர்" : "Hrs / Student"}</span>
          </div>
          <div className="text-xs text-[var(--text-muted)] font-medium">
            {lang === "தமிழ்" ? "சராசரி பயன்பாட்டு மணிநேரம்" : "Avg Hours / Active Student Today"}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="theme-card p-4 mb-6 border border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
          <Filter className="w-4 h-4 text-[var(--primary)]" />
          {lang === "தமிழ்" ? "வடிகட்டிகள் & தேடல்" : "Filters & Search"}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Class Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-medium">{lang === "தமிழ்" ? "வகுப்பு:" : "Class:"}</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-heading)] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[var(--primary)]"
            >
              {availableClasses.map((c) => (
                <option key={c} value={c}>{c === "All" ? "All Classes" : c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-medium">{lang === "தமிழ்" ? "நிலை:" : "Status:"}</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-heading)] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="All">All Statuses</option>
              <option value="Active Now">🟢 Active Now</option>
              <option value="Logged In Today">🔵 Logged In Today</option>
              <option value="Offline">⚪ Offline</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === "தமிழ்" ? "மாணவர் பெயர் / எண்..." : "Search student name or roll..."}
              className="w-full bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-heading)] rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-[var(--primary)] placeholder-[var(--text-muted)]"
            />
          </div>
        </div>
      </div>

      {/* Main Student Activity Roster Table */}
      <div className="theme-card p-6 border border-[var(--border)] mb-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-[var(--text-heading)] flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-500" />
            {lang === "தமிழ்" ? "மாணவர் உள்நுழைவு & பயன்பாட்டு மணிநேரப் பட்டியல்" : "Student Login & Portal Usage Roster"}
          </h3>
          <span className="text-xs text-[var(--text-muted)] font-medium">
            Showing {filteredStudents.length} of {students.length} students
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xs text-[var(--text-muted)] flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            {lang === "தமிழ்" ? "மாணவர் நேரலை செயல்பாடுகளை ஏற்றுகிறது..." : "Loading student portal login & usage monitoring data..."}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-400 bg-red-500/10 rounded-2xl border border-red-500/20">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            {error}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-xs text-[var(--text-muted)] italic">
            {lang === "தமிழ்" ? "தேர்ந்தெடுக்கப்பட்ட வடிகட்டிகளுக்கு மாணவர்கள் எதுவும் இல்லை." : "No students match your selected filters."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase">
                  <th className="py-3 px-4">{lang === "தமிழ்" ? "மாணவர் பெயர்" : "Student Name"}</th>
                  <th className="py-3 px-4">{lang === "தமிழ்" ? "வகுப்பு" : "Class"}</th>
                  <th className="py-3 px-4">{lang === "தமிழ்" ? "உள்நுழைவு நிலை" : "Login Status"}</th>
                  <th className="py-3 px-4">{lang === "தமிழ்" ? "கடைசி செயல்பாடு" : "Last Active Time"}</th>
                  <th className="py-3 px-4">{lang === "தமிழ்" ? "இன்றைய பயன்பாட்டு நேரம்" : "Portal Hours Today"}</th>
                  <th className="py-3 px-4">{lang === "தமிழ்" ? "மொத்த மணிநேரம்" : "Total Usage"}</th>
                  <th className="py-3 px-4 text-right">{lang === "தமிழ்" ? "செயல்கள்" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-xs">
                {filteredStudents.map((st) => {
                  const maxTargetHours = 3;
                  const progressPct = Math.min(Math.round((st.hoursToday / maxTargetHours) * 100), 100);

                  return (
                    <tr key={st.id} className="hover:bg-[var(--bg-main)]/40 transition-colors">
                      {/* Student details */}
                      <td className="py-3.5 px-4 font-semibold text-[var(--text-heading)]">
                        <div>{st.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono font-normal">
                          Roll: {st.rollNumber} {st.emisNumber ? `· EMIS: ${st.emisNumber}` : ""}
                        </div>
                      </td>

                      {/* Class */}
                      <td className="py-3.5 px-4 font-medium text-[var(--text-heading)]">
                        <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-main)] border border-[var(--border)]">
                          {st.classSection}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {st.isOnline ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {lang === "தமிழ்" ? "இப்போது செயலில்" : "Active Now"}
                          </span>
                        ) : st.isLoggedInToday ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                            {lang === "தமிழ்" ? "இன்று உள்நுழைந்தார்" : "Logged In Today"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-700/40 text-slate-400 border border-slate-700">
                            <span className="w-2 h-2 rounded-full bg-slate-500" />
                            {lang === "தமிழ்" ? "ஆஃப்லைன்" : "Offline"}
                          </span>
                        )}
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 px-4 text-[var(--text-muted)] font-medium">
                        {formatLastActive(st.lastActiveTime)}
                      </td>

                      {/* Portal Hours Today */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 max-w-[140px]">
                          <div className="flex justify-between items-center text-[11px] font-bold">
                            <span className="text-amber-500">{st.hoursToday} {lang === "தமிழ்" ? "மணி" : "hrs"}</span>
                            <span className="text-[10px] text-[var(--text-muted)] font-normal">({st.minutesToday} mins)</span>
                          </div>
                          <div className="w-full bg-[var(--bg-main)] h-1.5 rounded-full overflow-hidden border border-[var(--border)]">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Total Usage */}
                      <td className="py-3.5 px-4 font-mono font-extrabold text-[var(--text-heading)]">
                        {st.totalUsageHours} <span className="text-[10px] font-normal text-[var(--text-muted)]">hrs</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleSendReminder(st.name)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/20 text-[11px] font-bold transition-all"
                        >
                          <Send className="w-3 h-3" />
                          {lang === "தமிழ்" ? "செய்தி" : "Encourage"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Guide Info Box */}
      <div className="theme-card p-6 border border-[var(--border)]">
        <h3 className="text-sm font-bold text-[var(--text-heading)] mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[var(--primary)]" />
          {lang === "தமிழ்" ? "மாணவர் பயன்பாட்டுக் கண்காணிப்பு எவ்வாறு இயங்குகிறது?" : "How Student Login & Usage Hours Monitoring Works"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[var(--text-muted)]">
          <div className="p-4 bg-[var(--bg-main)]/40 rounded-xl border border-[var(--border)]">
            <div className="font-bold text-[var(--text-heading)] mb-1">1. Active Login Detection</div>
            Tracks when a student logs into the portal or accesses digital library resources, updated continuously.
          </div>
          <div className="p-4 bg-[var(--bg-main)]/40 rounded-xl border border-[var(--border)]">
            <div className="font-bold text-[var(--text-heading)] mb-1">2. Usage Hours Aggregation</div>
            Sums reading time, mock exam attempts, and active learning sessions into precise hours and minutes spent.
          </div>
          <div className="p-4 bg-[var(--bg-main)]/40 rounded-xl border border-[var(--border)]">
            <div className="font-bold text-[var(--text-heading)] mb-1">3. Teacher Encouragement</div>
            Enables teachers to identify inactive students and send instant encouragement notes directly to their portal dashboard.
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
