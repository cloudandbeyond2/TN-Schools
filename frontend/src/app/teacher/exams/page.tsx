"use client";

import React, { useState, useEffect, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import { 
  Calendar, MapPin, FileText, CheckCircle2, 
  Clock, AlertCircle, Filter, Search, GraduationCap,
  ShieldAlert, Sparkles, UserCheck, BookOpen, FlaskConical, 
  Layers2, Timer, Award, ChevronLeft, Lock, Unlock
} from "lucide-react";

type ExamType = "Unit Test" | "Quarterly" | "Half-Yearly" | "Annual" | "Model" | "Public";
type ExamMode = "Theory" | "Practical" | "Both";

interface ExamCalendar {
  id: number | string;
  name: string;
  classSection: string;
  subject: string;
  date: string;
  timeSlot: string;
  duration?: string;
  hall: string;
  invigilator: string;
  status: "Scheduled" | "In Progress" | "Completed";
  type: string;
  examMode?: ExamMode;
  theoryMaxMarks?: number;
  practicalMaxMarks?: number;
  published: boolean;
}

const CLASS_OPTIONS = [
  "Class 6 (All)",
  "Class 7 (All)",
  "Class 8 (All)",
  "Class 9 (All)",
  "Class 10 (All)",
  "Class 11 (General)",
  "Class 11 (Science)",
  "Class 11 (Commerce)",
  "Class 12 (General)",
  "Class 12 (Biology)",
  "Class 12 (Computer Science)",
  "Class 12 (Commerce)",
];

const CLASSES = ["6","7","8","9","10","11","12"];

const SUBJECTS = [
  { key: "tamil",        label: "Tamil",        color: "text-purple-400" },
  { key: "english",      label: "English",      color: "text-blue-400"   },
  { key: "mathematics",  label: "Maths",        color: "text-emerald-400"},
  { key: "science",      label: "Science",      color: "text-amber-400"  },
  { key: "socialScience",label: "Social",       color: "text-rose-400"   },
];
const PASS_MARK = 35;

// Dynamic Subject Resolver for 11th/12th Groups
function getGroupSubjects(groupName: string | null | undefined) {
  const normalized = String(groupName || "").trim().toLowerCase();

  // Biology Group
  if (normalized === "2503" || normalized.includes("biology") || normalized === "2601" || normalized === "science") {
    return [
      { key: "tamil",        label: "Tamil",        color: "text-purple-400" },
      { key: "english",      label: "English",      color: "text-blue-400"   },
      { key: "mathematics",  label: "Maths",        color: "text-emerald-400"},
      { key: "science",      label: "Physics",      color: "text-orange-400" },
      { key: "socialScience",label: "Chemistry",    color: "text-pink-400"   },
      { key: "extraSubject", label: "Biology",      color: "text-emerald-500"},
    ];
  }

  // Computer Science Group
  if (normalized === "2502" || normalized.includes("computer science") || normalized === "2501") {
    return [
      { key: "tamil",        label: "Tamil",        color: "text-purple-400" },
      { key: "english",      label: "English",      color: "text-blue-400"   },
      { key: "mathematics",  label: "Maths",        color: "text-emerald-400"},
      { key: "science",      label: "Physics",      color: "text-orange-400" },
      { key: "socialScience",label: "Chemistry",    color: "text-pink-400"   },
      { key: "extraSubject", label: "Comp Sci",     color: "text-cyan-400"   },
    ];
  }

  // Pure Science Group
  if (normalized === "2608" || normalized.includes("pure science") || normalized === "2504") {
    return [
      { key: "tamil",        label: "Tamil",        color: "text-purple-400" },
      { key: "english",      label: "English",      color: "text-blue-400"   },
      { key: "mathematics",  label: "Physics",      color: "text-orange-400" },
      { key: "science",      label: "Chemistry",    color: "text-pink-400"   },
      { key: "socialScience",label: "Botany",       color: "text-teal-400"   },
      { key: "extraSubject", label: "Zoology",      color: "text-lime-400"   },
    ];
  }

  // Commerce Group
  if (normalized === "2704" || normalized === "2702" || normalized === "2701" || normalized.includes("commerce")) {
    const isCompApp = normalized === "2702" || normalized.includes("computer applications");
    return [
      { key: "tamil",        label: "Tamil",        color: "text-purple-400" },
      { key: "english",      label: "English",      color: "text-blue-400"   },
      { key: "mathematics",  label: "Commerce",     color: "text-amber-400"  },
      { key: "science",      label: "Accountancy",  color: "text-indigo-400" },
      { key: "socialScience",label: "Economics",    color: "text-rose-400"   },
      { key: "extraSubject", label: isCompApp ? "Comp App" : "Business Math", color: "text-teal-500" },
    ];
  }

  return SUBJECTS;
}

function calcLocal(row: any, isHsc: boolean) {
  const vals = [row.tamil, row.english, row.mathematics, row.science, row.socialScience]
    .filter(v => v != null) as number[];
  if (row.extraSubject != null) vals.push(row.extraSubject);
  const total = vals.length ? vals.reduce((a, b) => a + b, 0) : null;
  const maxTotal = isHsc ? 600 : 500;
  const pct = total != null ? parseFloat(((total / maxTotal) * 100).toFixed(1)) : null;
  const isPassed = vals.length > 0 ? vals.every(v => v >= PASS_MARK) : null;
  return { total, pct, isPassed, maxTotal };
}

export default function TeacherExamsPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId || "";
  const [exams, setExams] = useState<ExamCalendar[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [teacherName, setTeacherName] = useState("kalai");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Scheduled" | "In Progress" | "Completed">("All");
  const [classFilter, setClassFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // Tab View state
  const [activeTab, setActiveTab] = useState<"duties" | "results">("duties");

  // Model Exam results states
  const [modelExams, setModelExams] = useState<any[]>([]);
  const [activeClassTab, setActiveClassTab] = useState("6");
  const [loadingModelExams, setLoadingModelExams] = useState(false);
  const [selectedModelExam, setSelectedModelExam] = useState<any | null>(null);
  const [modelExamRows, setModelExamRows] = useState<any[]>([]);
  const [loadingModelRows, setLoadingModelRows] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Helper to format date
  const formatStudentFriendlyDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
      const day = d.toLocaleDateString("en-US", { day: "numeric" });
      const month = d.toLocaleDateString("en-US", { month: "short" });
      const year = d.toLocaleDateString("en-US", { year: "numeric" });
      return `${day} ${month} ${year} (${weekday})`;
    } catch (e) {
      return dateStr;
    }
  };

  const calcDurationFromSlot = (slot: string): string => {
    try {
      const [startRaw, endRaw] = slot.split(" - ").map((s) => s.trim());
      const toMinutes = (t: string) => {
        const [time, meridiem] = t.split(" ");
        let [h, m] = time.split(":").map(Number);
        if (meridiem === "PM" && h !== 12) h += 12;
        if (meridiem === "AM" && h === 12) h = 0;
        return h * 60 + m;
      };
      const diff = toMinutes(endRaw) - toMinutes(startRaw);
      if (diff <= 0) return "—";
      const hrs  = Math.floor(diff / 60);
      const mins = diff % 60;
      if (mins === 0) return hrs === 1 ? "1 Hour" : `${hrs} Hours`;
      return `${hrs}h ${mins}m`;
    } catch {
      return "—";
    }
  };

  const fetchExamsFromDB = useCallback(async (schoolId: string) => {
    if (!schoolId) return;
    try {
      const res = await fetch(`${API_URL}/api/exam-schedule?schoolId=${schoolId}`);
      const json = await res.json();
      if (json.success && json.data) {
        const mapped: ExamCalendar[] = json.data.map((item: any) => {
          const startTimeStr = item.startTime;
          const endTimeStr = item.endTime;
          const timeSlot = `${startTimeStr} - ${endTimeStr}`;
          
          return {
            id: item.id,
            name: item.title,
            classSection: `Class ${item.class} (${item.section})`,
            subject: item.subject,
            date: item.examDate.split("T")[0],
            timeSlot,
            duration: item.duration || calcDurationFromSlot(timeSlot),
            hall: item.venue,
            invigilator: item.invigilator || "",
            status: item.status as any,
            type: item.examType,
            examMode: item.examMode as any,
            theoryMaxMarks: item.theoryMaxMarks,
            practicalMaxMarks: item.practicalMaxMarks,
            published: item.published
          };
        });
        setExams(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch exams from database:", err);
    }
  }, [API_URL]);

  // Fetch model exams for results tab
  const fetchModelExams = useCallback(async () => {
    if (!schoolId) return;
    setLoadingModelExams(true);
    try {
      const res = await fetch(`${API_URL}/api/headmaster/model-exams?schoolId=${schoolId}&class=${activeClassTab}`);
      const json = await res.json();
      if (json.success) {
        setModelExams(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch model exams:", err);
    } finally {
      setLoadingModelExams(false);
    }
  }, [schoolId, activeClassTab, API_URL]);

  // Load results rows
  const openModelExam = async (exam: any) => {
    setSelectedModelExam(exam);
    setLoadingModelRows(true);
    try {
      const res = await fetch(`${API_URL}/api/headmaster/model-exams/${exam.id}`);
      const json = await res.json();
      if (json.success) {
        setModelExamRows(json.data.results);
      }
    } catch (err) {
      console.error("Failed to fetch model exam results:", err);
    } finally {
      setLoadingModelRows(false);
    }
  };

  useEffect(() => {
    if (schoolId) {
      fetchExamsFromDB(schoolId);
    }
    if (session?.user?.name) {
      setTeacherName(session.user.name);
    }
    setIsMounted(true);
  }, [session, schoolId, fetchExamsFromDB]);

  useEffect(() => {
    if (activeTab === "results") {
      fetchModelExams();
    }
  }, [activeTab, fetchModelExams]);

  const publishedExams = exams.filter(e => e.published);
  const myDuties = publishedExams.filter(e => e.invigilator === teacherName);

  const upcomingDutyNotifications = myDuties.filter(e => {
    if (e.status === "Completed") return false;
    const examDate = new Date(e.date);
    const currentDate = new Date("2026-07-07");
    const diffTime = examDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  });

  const totalExams = publishedExams.length;
  const myDutiesCount = myDuties.length;
  const myPendingDuties = myDuties.filter(e => e.status !== "Completed").length;

  const examTypesList: ("All" | ExamType)[] = ["All", "Unit Test", "Quarterly", "Half-Yearly", "Annual", "Model", "Public"];

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "Quarterly":   return "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400";
      case "Half-Yearly": return "bg-cyan-500/10 border-cyan-500/20 text-cyan-400";
      case "Model":       return "bg-orange-500/10 border-orange-500/20 text-orange-400";
      case "Public":      return "bg-rose-500/10 border-rose-500/20 text-rose-400";
      case "Annual":      return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      default:            return "bg-indigo-500/10 border-indigo-500/20 text-indigo-400";
    }
  };

  const getModeBadgeStyle = (mode: ExamMode = "Theory") => {
    switch (mode) {
      case "Theory":    return "bg-blue-500/10 border-blue-500/20 text-blue-300";
      case "Practical": return "bg-violet-500/10 border-violet-500/20 text-violet-300";
      case "Both":      return "bg-amber-500/10 border-amber-500/20 text-amber-300";
    }
  };

  const getModeIcon = (mode: ExamMode = "Theory") => {
    switch (mode) {
      case "Theory":    return <BookOpen className="w-3 h-3" />;
      case "Practical": return <FlaskConical className="w-3 h-3" />;
      case "Both":      return <Layers2 className="w-3 h-3" />;
    }
  };

  const getTotalMarks = (ex: ExamCalendar): string => {
    return "100 Marks";
  };

  const handleUpdateDutyStatus = async (id: number | string, newStatus: "Scheduled" | "In Progress" | "Completed") => {
    try {
      const res = await fetch(`${API_URL}/api/exam-schedule/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success && schoolId) {
        fetchExamsFromDB(schoolId);
      }
    } catch (e) {
      console.error("Failed to update exam status", e);
    }
  };

  const filteredExams = myDuties.filter((ex) => {
    const matchesSearch = 
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ex.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || ex.status === statusFilter;
    const matchesClass = classFilter === "All" || ex.classSection === classFilter;
    const matchesType = typeFilter === "All" || ex.type === typeFilter;
    return matchesSearch && matchesStatus && matchesClass && matchesType;
  });

  // Dynamic subjects for active model exam
  const isHsc = selectedModelExam?.class === "11" || selectedModelExam?.class === "12";
  const activeSubjects = selectedModelExam 
    ? (isHsc ? getGroupSubjects(selectedModelExam.group) : SUBJECTS)
    : SUBJECTS;

  return (
    <PortalLayout
      title="Examination Center & Analytics"
      subtitle={`${teacherName} · ${(session?.user as any)?.schoolName || "Holy Cross Higher Secondary School"} · Teacher Exam Desk`}
      avatarLetter={(teacherName || "Teacher").charAt(0)}
      avatarColor="#f59e0b"
      themeClass="theme-teacher"
      accentColor="#f59e0b"
    >
      {/* Tab Navigation */}
      <div className="flex bg-slate-950 border border-slate-800 p-1.5 rounded-2xl mb-6 w-fit">
        <button
          onClick={() => { setActiveTab("duties"); setSelectedModelExam(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === "duties"
              ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Calendar className="w-4 h-4" /> Exam Schedules &amp; Duties
        </button>
        <button
          onClick={() => setActiveTab("results")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === "results"
              ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Award className="w-4 h-4" /> Model Exam Results
        </button>
      </div>

      {activeTab === "duties" ? (
        /* ── Tab 1: Duties and Schedules ── */
        <div>
          {/* Stats Counter Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="glass rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Published Exams</div>
                <div className="text-xl font-black mt-0.5">{totalExams}</div>
              </div>
            </div>

            <div className="glass rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">My Total Duties</div>
                <div className="text-xl font-black mt-0.5">{myDutiesCount}</div>
              </div>
            </div>

            <div className="glass rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl relative">
                <Clock className="w-5 h-5" />
                {myPendingDuties > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_6px_rgba(244,63,94,0.9)]" />
                )}
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">My Pending Duties</div>
                <div className="text-xl font-black mt-0.5">{myPendingDuties}</div>
              </div>
            </div>

            <div className="glass rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Completed</div>
                <div className="text-xl font-black mt-0.5">{myDutiesCount - myPendingDuties}</div>
              </div>
            </div>
          </div>

          {/* Warning Banners */}
          {upcomingDutyNotifications.length > 0 && (
            <div className="space-y-3 mb-6">
              {upcomingDutyNotifications.map(duty => (
                <div key={`notif-${duty.id}`} className="p-4 bg-amber-50 border border-amber-200/80 text-amber-900 rounded-2xl flex flex-col sm:flex-row gap-3 shadow-sm">
                  <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <strong className="text-xs font-black block uppercase tracking-wider text-amber-900">⚠️ Upcoming Invigilation Duty Notification</strong>
                    <p className="text-xs mt-1 font-semibold leading-relaxed text-amber-800">
                      You are assigned to invigilate the <strong className="text-slate-900 font-extrabold">{duty.name} ({duty.subject})</strong> for <strong className="text-slate-900 font-bold">{duty.classSection}</strong> on <strong className="text-amber-900 underline">{formatStudentFriendlyDate(duty.date)}</strong> at <strong className="text-slate-900 font-bold">{duty.timeSlot}</strong>. Seating Room: <strong className="text-purple-900 font-bold">{duty.hall.split(" (")[0]}</strong>.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass rounded-2xl p-6 flex flex-col min-h-[400px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-5 mb-5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <h2 className="text-sm font-bold text-white">My Assigned Exam Duties</h2>
                  <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-md">
                    {filteredExams.length}
                  </span>
                </div>
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Quick search exam/subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:bg-slate-950 transition-all"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2.5 mb-5 border-b border-slate-850 pb-4">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-300 focus:outline-none cursor-pointer hover:border-slate-700"
                >
                  <option value="All">All Types</option>
                  {examTypesList.filter(t => t !== "All").map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-300 focus:outline-none cursor-pointer hover:border-slate-700"
                >
                  <option value="All">All Classes</option>
                  {CLASS_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <div className="flex bg-slate-950 border border-slate-800 p-0.5 rounded-xl ml-auto">
                  {(["All", "Scheduled", "In Progress", "Completed"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        statusFilter === s 
                          ? "bg-amber-500 text-white font-extrabold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {!isMounted ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <div className="text-xs font-semibold text-slate-400">Loading schedules...</div>
                </div>
              ) : filteredExams.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
                  <div className="p-4 bg-slate-900/40 rounded-full text-slate-500 border border-slate-800 mb-3">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">No exam timetables published</h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Headmaster has not published any exam schedules yet, or check your filter parameters.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredExams.map((ex) => (
                    <div
                      key={ex.id}
                      className="p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex gap-2 items-center flex-wrap">
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            {ex.classSection}
                          </span>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 border rounded-md uppercase ${getTypeBadgeStyle(ex.type)}`}>
                            {ex.type}
                          </span>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 border rounded-md flex items-center gap-1 ${getModeBadgeStyle(ex.examMode)}`}>
                            {getModeIcon(ex.examMode)}
                            {ex.examMode || "Theory"}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/50 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {formatStudentFriendlyDate(ex.date)}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/50 flex items-center gap-1">
                            <Timer className="w-3 h-3 text-slate-500" />
                            {ex.duration || "3 Hours"}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white">{ex.name}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 font-semibold">
                          <div>Subject: <span className="text-slate-200 font-bold">{ex.subject}</span></div>
                          <div>Invigilator: <span className="text-white font-bold">{ex.invigilator}</span></div>
                          <div className="flex items-center gap-1">
                            <Award className="w-3 h-3 text-amber-400" />
                            <span className="text-amber-300 font-bold">{getTotalMarks(ex)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3">
                        <span className={`badge px-2.5 py-0.5 text-[9px] font-black rounded-lg border uppercase tracking-wider ${
                          ex.status === "Scheduled" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                          ex.status === "In Progress" ? "bg-rose-500/20 border-rose-500/30 text-rose-300 font-extrabold shadow-[0_0_10px_rgba(244,63,94,0.3)]" :
                          "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        }`}>
                          {ex.status}
                        </span>
                        <div className="text-[10px] text-purple-300 font-bold flex items-center gap-1 bg-purple-950/20 border border-purple-900/35 px-2 py-1 rounded-lg">
                          <MapPin className="w-3.5 h-3.5 text-purple-400" />
                          {ex.hall.split(" (")[0]}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              <div className="glass rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-500" />
                  My Invigilation Duties
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Timetable as scheduled by the Headmaster office.
                </p>

                {myDuties.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-650 border border-dashed border-[var(--border)] rounded-xl bg-[var(--input-bg)] font-semibold italic">
                    No invigilation duties assigned to you.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                    {myDuties.map((duty) => (
                      <div 
                        key={`duty-${duty.id}`} 
                        className={`p-5 rounded-2xl border flex flex-col gap-3 relative ${
                          duty.status === "Completed" ? "bg-slate-900/10 border-slate-800 opacity-80" : "glass border-slate-800/80 shadow-sm"
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                          <span className="flex items-center gap-1 font-bold text-slate-350">
                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                            {formatStudentFriendlyDate(duty.date)}
                          </span>
                          <span className="text-amber-400 font-extrabold uppercase bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg text-[10px]">
                            {duty.duration || "3 Hours"}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white leading-snug">{duty.name}</h4>
                          <div className="text-xs text-slate-400 font-medium mt-1.5 space-y-1">
                            <div>Class: <strong className="text-white font-extrabold">{duty.classSection}</strong></div>
                            <div>Subject: <strong className="text-white font-extrabold">{duty.subject}</strong></div>
                            <div>Time Slot: <strong className="text-indigo-400 font-extrabold">{duty.timeSlot}</strong></div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                              duty.examMode === "Practical" ? "bg-violet-500/10 border-violet-500/20 text-violet-300" :
                              duty.examMode === "Both" ? "bg-amber-500/10 border-amber-500/20 text-amber-300" :
                              "bg-blue-500/10 border-blue-500/20 text-blue-300"
                            }`}>
                              {getModeIcon(duty.examMode)}
                              {duty.examMode || "Theory"}
                            </span>
                            <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Award className="w-3 h-3 text-amber-500" />
                              {duty.examMode === "Both"
                                ? `${duty.theoryMaxMarks} (T) + ${duty.practicalMaxMarks} (P) = 100 Marks`
                                : duty.examMode === "Practical"
                                ? `${duty.practicalMaxMarks} Marks`
                                : `${duty.theoryMaxMarks ?? 100} Marks`}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3 mt-1 text-xs font-semibold">
                          <div className="flex items-center gap-1 text-purple-400 font-bold">
                            <MapPin className="w-3.5 h-3.5 text-purple-500" />
                            {duty.hall}
                          </div>
                          <div className="flex items-center gap-2">
                            {duty.status === "Scheduled" && (
                              <button
                                onClick={() => handleUpdateDutyStatus(duty.id, "In Progress")}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-extrabold uppercase transition-all shadow-sm cursor-pointer"
                              >
                                Start Duty
                              </button>
                            )}
                            {duty.status === "In Progress" && (
                              <button
                                onClick={() => handleUpdateDutyStatus(duty.id, "Completed")}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-extrabold uppercase transition-all shadow-sm cursor-pointer"
                              >
                                Complete Duty
                              </button>
                            )}
                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                              duty.status === "Scheduled" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                              duty.status === "In Progress" ? "bg-rose-500/10 border-rose-500/20 text-rose-450 font-bold shadow-[0_0_10px_rgba(244,63,94,0.1)]" :
                              "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            }`}>
                              {duty.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass rounded-2xl p-5">
                <h3 className="text-xs font-bold text-white mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Supervision Protocols
                </h3>
                <ul className="space-y-2.5 text-[10px] text-slate-400 font-semibold">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
                    <span>Arrive at your assigned exam hall at least 15 minutes before slot.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
                    <span>Verify student hall ticket passes and QR codes upon room entry.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Tab 2: Model Exam Results View ── */
        <div className="fade-in">
          {selectedModelExam ? (
            /* Inside single exam results view */
            <div>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setSelectedModelExam(null)} className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors">
                  <ChevronLeft className="w-4 h-4 text-slate-350" />
                </button>
                <div>
                  <h1 className="text-base font-black text-white">{selectedModelExam.examName}</h1>
                  <p className="text-xs text-slate-400">
                    Class {selectedModelExam.class} — Section {selectedModelExam.section} 
                    {selectedModelExam.group ? ` (EMIS Code: ${selectedModelExam.group})` : ""} · {selectedModelExam.academicYear} · {selectedModelExam.examType}
                  </p>
                </div>
                {selectedModelExam.isLocked ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold rounded-full">
                    <Lock className="w-3 h-3" /> Lock Confirmed (Read-Only)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-full">
                    <Unlock className="w-3 h-3" /> Draft / Open
                  </span>
                )}
              </div>

              {/* Roster Table card */}
              <div className="glass rounded-2xl border border-slate-800 mb-6 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white">📋 Student Mark List</h2>
                  <span className="text-xs text-slate-400">
                    {modelExamRows.length} Students · Pass Score: 35
                  </span>
                </div>

                {loadingModelRows ? (
                  <div className="flex items-center justify-center py-16 text-slate-400 text-sm animate-pulse">Loading marks roster…</div>
                ) : modelExamRows.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <BookOpen className="w-10 h-10 text-slate-700" />
                    <p className="text-slate-500 text-sm">No marks entries recorded yet for this exam session.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[900px]">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="py-3 pl-5 text-left w-8">#</th>
                          <th className="py-3 text-left">Student Name</th>
                          <th className="py-3 text-left">Roll No</th>
                          {activeSubjects.map(s => (
                            <th key={s.key} className={`py-3 text-center ${s.color}`}>{s.label}</th>
                          ))}
                          <th className="py-3 text-center text-white font-black">Total</th>
                          <th className="py-3 text-center">%</th>
                          <th className="py-3 text-center pr-5">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {modelExamRows.map((row, idx) => {
                          const { total, pct, isPassed, maxTotal } = calcLocal(row, isHsc);
                          return (
                            <tr key={row.studentId || idx} className="hover:bg-slate-800/20 transition-colors">
                              <td className="py-3 pl-5 text-slate-500">{idx + 1}</td>
                              <td className="py-3 font-semibold text-white whitespace-nowrap">{row.studentName}</td>
                              <td className="py-3 text-slate-400 font-mono text-[11px]">{row.rollNumber}</td>
                              {activeSubjects.map(s => (
                                <td key={s.key} className="py-3 text-center">
                                  <span className={`font-semibold text-sm ${(row as any)[s.key] != null ? ((row as any)[s.key] < PASS_MARK ? "text-red-400" : "text-slate-200") : "text-slate-650"}`}>
                                    {(row as any)[s.key] != null ? (row as any)[s.key] : "—"}
                                  </span>
                                </td>
                              ))}
                              <td className="py-3 text-center">
                                <span className={`font-black text-sm ${total == null ? "text-slate-600" : isPassed ? "text-emerald-400" : "text-red-400"}`}>
                                  {total != null ? `${total}/${maxTotal}` : "—"}
                                </span>
                              </td>
                              <td className="py-3 text-center text-slate-300">{pct != null ? `${pct}%` : "—"}</td>
                              <td className="py-3 text-center pr-5">
                                {isPassed != null ? (
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isPassed ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                                    {isPassed ? "PASS" : "FAIL"}
                                  </span>
                                ) : <span className="text-slate-600">—</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Exams list page view for teacher */
            <div>
              {/* Class Selection Tabs */}
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <span className="text-xs text-slate-500 font-bold mr-1">CLASS</span>
                {CLASSES.map(cls => (
                  <button key={cls}
                    onClick={() => { setActiveClassTab(cls); }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeClassTab === cls ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"}`}
                  >
                    Class {cls}
                  </button>
                ))}
              </div>

              {/* Exams list */}
              <div className="glass rounded-2xl border border-slate-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white">📋 Class {activeClassTab} — Model Exam Results List</h2>
                  {loadingModelExams && <span className="text-xs text-slate-500 animate-pulse">Loading…</span>}
                </div>

                {!loadingModelExams && modelExams.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <BookOpen className="w-10 h-10 text-slate-700" />
                    <p className="text-slate-500 text-sm font-semibold">No model exam records found for Class {activeClassTab}</p>
                    <p className="text-slate-600 text-xs">Model exams are created and published by the Headmaster.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60">
                    {modelExams.map(exam => (
                      <div key={exam.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors group">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-2 h-10 rounded-full flex-shrink-0 ${exam.isLocked ? "bg-red-500" : "bg-emerald-500"}`} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-white">{exam.examName}</span>
                              <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full text-slate-400">{exam.examType}</span>
                              {exam.group && <span className="text-[10px] bg-blue-600/15 border border-blue-500/30 px-2 py-0.5 rounded-full text-blue-400">EMIS: {exam.group}</span>}
                              {exam.isLocked && <span className="text-[10px] bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded-full text-red-400 flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> Locked</span>}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Section {exam.section} · {exam.academicYear}
                              {exam.examDate ? ` · ${new Date(exam.examDate).toLocaleDateString("en-IN")}` : ""}
                              {" · "}<span className="text-blue-400 font-semibold">{exam._count?.results || 0} students marked</span>
                            </p>
                          </div>
                        </div>
                        <button onClick={() => openModelExam(exam)} className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-xl transition-colors">
                          🔍 View Marks roster
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </PortalLayout>
  );
}
