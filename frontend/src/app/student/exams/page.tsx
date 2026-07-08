"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import { 
  Calendar, MapPin, FileText, CheckCircle2, 
  Clock, AlertCircle, Printer, GraduationCap, 
  Sparkles, Tag, ShieldCheck, UserCheck, Timer,
  BookOpen, FlaskConical, Layers2, Award
} from "lucide-react";

type ExamType = "Unit Test" | "Quarterly" | "Half-Yearly" | "Annual" | "Model" | "Public";
type ExamMode = "Theory" | "Practical" | "Both";

interface ExamCalendar {
  id: number | string;
  name: string;
  classSection: string;
  subject: string;
  date: string; // ISO date format YYYY-MM-DD
  timeSlot: string;
  duration?: string;         // NEW
  hall: string;
  invigilator: string;
  status: "Scheduled" | "In Progress" | "Completed";
  type: string;
  examMode?: ExamMode;       // NEW
  theoryMaxMarks?: number;   // NEW
  practicalMaxMarks?: number;// NEW
  published: boolean;
}

export default function StudentExamsPage() {
  const { data: session } = useSession();
  const [exams, setExams] = useState<ExamCalendar[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [studentClass, setStudentClass] = useState("Class 10"); // Default mock class
  const [studentName, setStudentName] = useState("Arjun Kumar");
  const [emisNumber, setEmisNumber] = useState("3301234567");

  // State to trigger countdown recalculations every second
  const [currentTime, setCurrentTime] = useState(new Date());

  // Compute duration label from a "HH:MM AM/PM - HH:MM AM/PM" slot string
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

  const fetchExamsFromDB = async (schoolId: string) => {
    if (!schoolId) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
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
        localStorage.setItem("hm_exams_v2", JSON.stringify(mapped));
      }
    } catch (err) {
      console.error("Failed to fetch exams from database:", err);
      const savedExams = localStorage.getItem("hm_exams_v2");
      if (savedExams) {
        try { setExams(JSON.parse(savedExams)); } catch (e) {}
      }
    }
  };

  // Load profile and exams
  useEffect(() => {
    const schoolId = (session?.user as any)?.schoolId || "";
    if (schoolId) {
      fetchExamsFromDB(schoolId);
    } else {
      const savedExams = localStorage.getItem("hm_exams_v2");
      if (savedExams) {
        try { setExams(JSON.parse(savedExams)); } catch (err) {}
      }
    }

    // Fetch student profile from API
    const fetchStudentProfile = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/students`);
        const json = await res.json();
        if (json.success && session?.user) {
          const profile = json.data.find((s: any) => s.userId === (session.user as any).id);
          if (profile) {
            setStudentName(profile.name);
            setEmisNumber(profile.emisNumber || "3301234567");
            
            const match = profile.class.match(/Class\s+\d+/i);
            if (match) {
              setStudentClass(match[0]);
              sessionStorage.setItem("student_class_filter", match[0]);
            } else if (profile.class) {
              setStudentClass(profile.class);
              sessionStorage.setItem("student_class_filter", profile.class);
            }
          }
        }
      } catch (e) {
        if (session?.user?.name) {
          setStudentName(session.user.name);
          sessionStorage.setItem("student_class_filter", "Class 10");
        }
      }
    };

    fetchStudentProfile();
    setIsMounted(true);
  }, [session]);

  // Live timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync state if headmaster makes updates in another tab
  useEffect(() => {
    const handleSync = () => {
      const savedExams = localStorage.getItem("hm_exams_v2");
      if (savedExams) {
        try {
          setExams(JSON.parse(savedExams));
        } catch (e) {
          // ignore
        }
      }
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);
    document.addEventListener("visibilitychange", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
      document.removeEventListener("visibilitychange", handleSync);
    };
  }, []);

  // Filter exams relevant to this student's grade and must be PUBLISHED (exclude completed)
  const studentExams = exams.filter((ex) => {
    if (!ex.published) return false;
    if (ex.status === "Completed") return false;
    const exClassLower = ex.classSection.toLowerCase();
    const studClassLower = studentClass.toLowerCase(); // e.g. "class 10"
    return exClassLower.includes(studClassLower);
  });

  // Parse exam Date & Time to Date object
  const getExamDateTime = (dateStr: string, slotStr: string) => {
    try {
      const timePart = slotStr.split(" - ")[0]; // e.g. "09:30 AM"
      const [time, modifier] = timePart.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
      
      return new Date(`${dateStr}T${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`);
    } catch (e) {
      return new Date(dateStr);
    }
  };

  // Find next upcoming exam that is scheduled
  const upcomingExams = studentExams
    .filter(e => e.status === "Scheduled")
    .map(e => ({
      ...e,
      targetDateTime: getExamDateTime(e.date, e.timeSlot)
    }))
    .filter(e => e.targetDateTime.getTime() > currentTime.getTime())
    .sort((a, b) => a.targetDateTime.getTime() - b.targetDateTime.getTime());

  const nextExam = upcomingExams[0];

  // Helper to format date in a student friendly format: "18 Jul 2026 (Saturday)"
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

  // Helper to construct countdown output
  const getCountdownData = (targetDate: Date) => {
    const diff = targetDate.getTime() - currentTime.getTime();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, finished: false };
  };

  const handlePrint = () => {
    window.print();
  };

  // Badge colors
  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "Quarterly":
        return "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400";
      case "Half-Yearly":
        return "bg-cyan-500/10 border-cyan-500/20 text-cyan-400";
      case "Model":
        return "bg-orange-500/10 border-orange-500/20 text-orange-400";
      case "Public":
        return "bg-rose-500/10 border-rose-500/20 text-rose-400";
      case "Annual":
        return "bg-emerald-550/10 border-emerald-550/20 text-emerald-450";
      default: // Unit Test
        return "bg-indigo-500/10 border-indigo-500/20 text-indigo-400";
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

const SUBJECT_MARKS_CONFIG: Record<string, { theory: number; practical: number; allowPractical: boolean }> = {
  "Mathematics": { theory: 100, practical: 0, allowPractical: false },
  "Science": { theory: 100, practical: 0, allowPractical: false },
  "Social Science": { theory: 100, practical: 0, allowPractical: false },
  "English": { theory: 100, practical: 0, allowPractical: false },
  "Tamil": { theory: 100, practical: 0, allowPractical: false },
  "Physics": { theory: 70, practical: 30, allowPractical: true },
  "Chemistry": { theory: 70, practical: 30, allowPractical: true },
  "Biology": { theory: 70, practical: 30, allowPractical: true },
  "Environmental Studies (EVS)": { theory: 100, practical: 0, allowPractical: false },
  "Physical Education (PT)": { theory: 100, practical: 0, allowPractical: false },
  "Computer Science": { theory: 70, practical: 30, allowPractical: true },
  "Accountancy": { theory: 100, practical: 0, allowPractical: false },
  "Economics": { theory: 100, practical: 0, allowPractical: false }
};

  const getTotalMarksStr = (ex: ExamCalendar): string => {
    const classStr = ex.classSection || "";
    const isClass6to10 = !classStr.includes("Class 11") && !classStr.includes("Class 12");
    
    if (isClass6to10) {
      return "100 Marks";
    }
    
    const config = SUBJECT_MARKS_CONFIG[ex.subject] || { theory: 100, practical: 0, allowPractical: false };
    if (!config.allowPractical) {
      return "100 Marks";
    }
    
    const mode = ex.examMode || "Theory";
    if (mode === "Theory")    return "70 Marks";
    if (mode === "Practical") return "30 Marks";
    return "70 (T) + 30 (P) = 100 Marks";
  };

  return (
    <PortalLayout
      title="My Examination Schedule"
      subtitle={`${studentName} · ${studentClass} · EMIS: ${emisNumber}`}
      avatarLetter={(studentName || "Student").charAt(0)}
      avatarColor="#6366f1"
      themeClass="theme-student"
      accentColor="#6366f1"
    >
      {/* Countdown Panel for Next Upcoming Exam */}
      {nextExam && (
        <div className="rounded-2xl p-6 bg-slate-900 border border-slate-800 mb-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-400">
                <Timer className="w-4 h-4" />
              </span>
              <span className="text-[10px] text-indigo-450 font-extrabold uppercase tracking-wider">Next Upcoming Examination</span>
            </div>
            <h2 className="text-lg font-black text-white">{nextExam.name} ({nextExam.subject})</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> {formatStudentFriendlyDate(nextExam.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> {nextExam.timeSlot}
              </span>
              <span className="flex items-center gap-1 text-purple-300">
                <MapPin className="w-3.5 h-3.5 text-purple-400" /> Room: {nextExam.hall.split(" (")[0]}
              </span>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] ${getModeBadgeStyle(nextExam.examMode)}`}>
                {getModeIcon(nextExam.examMode)}
                {nextExam.examMode || "Theory"} Mode
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <Award className="w-3.5 h-3.5 text-amber-500" /> {getTotalMarksStr(nextExam)}
              </span>
            </div>
          </div>

          {/* Countdown Clock Widget */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 p-3 rounded-2xl">
            {(() => {
              const { days, hours, minutes, seconds } = getCountdownData(nextExam.targetDateTime);
              return (
                <>
                  <div className="text-center min-w-[50px] p-2 bg-slate-900 border border-slate-800 rounded-xl">
                    <div className="text-xl font-black text-white">{days.toString().padStart(2, "0")}</div>
                    <div className="text-[8px] text-slate-400 font-extrabold uppercase mt-0.5">Days</div>
                  </div>
                  <div className="text-xl font-bold text-slate-800">:</div>
                  <div className="text-center min-w-[50px] p-2 bg-slate-900 border border-slate-800 rounded-xl">
                    <div className="text-xl font-black text-white">{hours.toString().padStart(2, "0")}</div>
                    <div className="text-[8px] text-slate-400 font-extrabold uppercase mt-0.5">Hours</div>
                  </div>
                  <div className="text-xl font-bold text-slate-800">:</div>
                  <div className="text-center min-w-[50px] p-2 bg-slate-900 border border-slate-800 rounded-xl">
                    <div className="text-xl font-black text-white">{minutes.toString().padStart(2, "0")}</div>
                    <div className="text-[8px] text-slate-400 font-extrabold uppercase mt-0.5">Mins</div>
                  </div>
                  <div className="text-xl font-bold text-slate-800">:</div>
                  <div className="text-center min-w-[50px] p-2 bg-slate-900 border border-slate-850 rounded-xl">
                    <div className="text-xl font-black text-indigo-400">{seconds.toString().padStart(2, "0")}</div>
                    <div className="text-[8px] text-slate-400 font-extrabold uppercase mt-0.5">Secs</div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      <div className="mb-6">
        {/* Exam Schedule List */}
        <div className="glass rounded-2xl p-6 flex flex-col min-h-[400px] w-full">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Class assessment date sheet</h2>
            <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded-md">
              {studentExams.length}
            </span>
          </div>

          {!isMounted ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-xs font-semibold text-slate-400">Loading your assessments...</div>
            </div>
          ) : studentExams.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
              <div className="p-4 bg-slate-900/40 rounded-full text-slate-500 border border-slate-800 mb-3">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">No exam timetables published</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                The school has not published any exam schedules for your grade yet. Check back soon.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 font-black uppercase tracking-wider">
                    <th className="p-4 align-middle">Standard & Mode</th>
                    <th className="p-4 align-middle">Exam Details</th>
                    <th className="p-4 align-middle">Date & Time</th>
                    <th className="p-4 align-middle">Room & Invigilator</th>
                    <th className="p-4 align-middle text-right">Seating & Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentExams.map((ex) => (
                    <tr 
                      key={ex.id}
                      className={`hover:bg-slate-50/30 transition-colors text-xs text-slate-800 font-medium border-b border-slate-100 last:border-b-0 ${
                        ex.status === "Completed" ? "border-l-4 border-l-rose-400" :
                        ex.status === "In Progress" ? "border-l-4 border-l-amber-400" :
                        "border-l-4 border-l-emerald-400"
                      }`}
                    >
                      {/* Standard & Mode */}
                      <td className="p-4 align-middle">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md w-max">
                            {ex.classSection}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 border rounded-md w-max flex items-center gap-0.5 ${getModeBadgeStyle(ex.examMode || "Theory")}`}>
                            {getModeIcon(ex.examMode || "Theory")}
                            {ex.examMode || "Theory"}
                          </span>
                        </div>
                      </td>

                      {/* Exam Details (Subject + Name + Type Tag) */}
                      <td className="p-4 align-middle">
                        <div className="flex items-start gap-2.5">
                          {/* Animated status dot */}
                          <span className="mt-1.5 flex-shrink-0">
                            <span className={`relative flex h-2.5 w-2.5`}>
                              {ex.status === "Scheduled" && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              )}
                              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                                ex.status === "Completed" ? "bg-rose-500" :
                                ex.status === "In Progress" ? "bg-amber-400" :
                                "bg-emerald-500"
                              }`}></span>
                            </span>
                          </span>
                          <div className="space-y-1">
                            <div className="text-slate-900 font-extrabold text-sm leading-tight">{ex.subject}</div>
                            <div className="flex items-center gap-2 flex-wrap text-slate-500 text-xs font-semibold">
                              <span>{ex.name}</span>
                              <span className={`text-[8px] font-extrabold px-1.5 py-0.5 border rounded uppercase ${getTypeBadgeStyle(ex.type)}`}>
                                {ex.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="p-4 align-middle whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-750 font-bold text-[13px]">
                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{formatStudentFriendlyDate(ex.date)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-550 text-[11px] font-semibold">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>{ex.timeSlot} <span className="text-slate-450">({ex.duration || "3 Hours"})</span></span>
                          </div>
                        </div>
                      </td>

                      {/* Room & Staff */}
                      <td className="p-4 align-middle">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-purple-700 font-bold">
                            <MapPin className="w-3.5 h-3.5 text-purple-500" />
                            <span>{ex.hall.split(" (")[0]}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{ex.invigilator}</span>
                          </div>
                        </div>
                      </td>

                      {/* Seating & Status */}
                      <td className="p-4 align-middle text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          {/* Status pill with dot */}
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black rounded-full border uppercase tracking-wider w-max ${
                            ex.status === "Completed"
                              ? "bg-rose-50 border-rose-200 text-rose-700"
                              : ex.status === "In Progress"
                              ? "bg-amber-50 border-amber-200 text-amber-700"
                              : "bg-emerald-50 border-emerald-200 text-emerald-700"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              ex.status === "Completed" ? "bg-rose-500" :
                              ex.status === "In Progress" ? "bg-amber-400" :
                              "bg-emerald-500"
                            }`} />
                            {ex.status === "Completed" ? "Exam Done" :
                             ex.status === "In Progress" ? "Ongoing" :
                             "Upcoming"}
                          </span>
                          <div className="text-[9px] text-slate-500 font-semibold bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md w-max">
                            Desk: Assigned
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Exam Instructions & Tips Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Instructions Panel */}
            <div className="glass rounded-2xl p-5 border border-slate-200/60 bg-white/50 dark:bg-slate-900/50 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Important Exam Instructions
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-650 dark:text-slate-400 font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <span>Be present at the allocated exam hall at least **15 minutes** prior to the time slot.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <span>Bring all necessary stationery items. Borrowing items during the exam is strictly prohibited.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <span>Cell phones, smartwatches, and unauthorized reference sheets are strictly banned inside the hall.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <span>Locate your assigned desk seating upon entering the hall. Verify the seating registry at the entrance.</span>
                </li>
              </ul>
            </div>

            {/* Tips Panel */}
            <div className="glass rounded-2xl p-5 border border-slate-200/60 bg-white/50 dark:bg-slate-900/50 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Preparation & Exam Tips
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-650 dark:text-slate-400 font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <span>**Read the paper carefully**: Spend the first 10 minutes reading all questions before writing.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <span>**Manage your time**: Allocate time blocks to sections based on marks. Don't spend too much time on a single question.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <span>**Practical Sessions**: For lab-based exams, double check your apparatus connection before starting experiments.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <span>**Review your sheet**: Save the last 10 minutes to verify your answers, formulas, and diagrams.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
