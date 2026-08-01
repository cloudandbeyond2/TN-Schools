"use client";

import React, { useState, useEffect, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";


type ExamType = "Unit Test" | "Quarterly" | "Half-Yearly" | "Annual" | "Model" | "Public";
type ExamMode = "Theory" | "Practical" | "Both";

interface ExamCalendar {
  id: number | string;
  name: string;
  classSection: string;
  subject: string;
  date: string; // ISO date format YYYY-MM-DD
  timeSlot: string;
  duration?: string;
  hall: string;
  invigilator: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  type: string;
  examMode?: ExamMode;
  theoryMaxMarks?: number;
  practicalMaxMarks?: number;
  published: boolean;
}

const PASS_MARK = 35;

const SUBJECTS = [
  { key: "tamil",        label: "Tamil",        color: "text-purple-400" },
  { key: "english",      label: "English",      color: "text-blue-400"   },
  { key: "mathematics",  label: "Maths",        color: "text-emerald-400"},
  { key: "science",      label: "Science",      color: "text-amber-400"  },
  { key: "socialScience",label: "Social Science", color: "text-rose-400"  },
];

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



const translations = {
  en: {
    title: "My Examinations & Marks",
    subtitle: (name: string, cls: string, emis: string) => `${name} · ${cls} · EMIS: ${emis}`,
    tabCalendar: "Exam Timetables",
    tabMarks: "My Model Exam Marks",
    nextUpcoming: "Next Upcoming Examination",
    room: "Room",
    mode: "Mode",
    marks: "Marks",
    days: "Days",
    hours: "Hours",
    mins: "Mins",
    secs: "Secs",
    dateSheet: "Class assessment date sheet",
    noSchedules: "No exam timetables published",
    noSchedulesDesc: "The school has not published any exam schedules for your grade yet. Check back soon.",
    thStandardMode: "Standard & Mode",
    thExamDetails: "Exam Details",
    thDateTime: "Date & Time",
    thRoomInvigilator: "Room & Invigilator",
    thSeatingStatus: "Seating & Status",
    deskAssigned: "Desk: Assigned",
    examDone: "Exam Done",
    ongoing: "Ongoing",
    upcoming: "Upcoming",
    instructionsTitle: "Important Exam Instructions",
    instructions1: "Be present at the allocated exam hall at least **15 minutes** prior to the time slot.",
    instructions2: "Bring all necessary stationery items. Borrowing items during the exam is strictly prohibited.",
    tipsTitle: "Preparation & Exam Tips",
    tips1: "**Read the paper carefully**: Spend the first 10 minutes reading all questions.",
    tips2: "**Review your sheet**: Save the last 10 minutes to verify your answers and formulas.",
    marksTitle: "My Model & Revision Exam Marks",
    marksDesc: "Only locked/finalized exam results verified by the Headmaster office are displayed here.",
    loadingReportCards: "Loading report cards…",
    noResults: "No exam results published yet",
    noResultsDesc: "Your marks cards will appear here automatically once the Headmaster inputs and locks your results in the system.",
    emisGroup: "EMIS Group",
    academicYear: "Academic Year",
    class: "Class",
    conductedOn: "Conducted on",
    finalScore: "Final Score",
    percentage: "Percentage",
    pass: "PASS",
    fail: "FAIL",
    theory: "Theory",
    practical: "Practical",
    both: "Both"
  },
  ta: {
    title: "என் தேர்வுகள் மற்றும் மதிப்பெண்கள்",
    subtitle: (name: string, cls: string, emis: string) => `${name} · ${cls} · EMIS: ${emis}`,
    tabCalendar: "தேர்வு கால அட்டவணைகள்",
    tabMarks: "மாதிரி தேர்வு மதிப்பெண்கள்",
    nextUpcoming: "அடுத்த வரவிருக்கும் தேர்வு",
    room: "அறை",
    mode: "முறை",
    marks: "மதிப்பெண்கள்",
    days: "நாட்கள்",
    hours: "மணி",
    mins: "நிமி",
    secs: "நொடிகள்",
    dateSheet: "வகுப்பு மதிப்பீட்டு தேதித்தாள்",
    noSchedules: "எந்த தேர்வு அட்டவணையும் வெளியிடப்படவில்லை",
    noSchedulesDesc: "பள்ளி உங்கள் வகுப்புக்கு எந்த தேர்வு அட்டவணையையும் இன்னும் வெளியிடவில்லை. விரைவில் மீண்டும் பார்க்கவும்.",
    thStandardMode: "வகுப்பு மற்றும் முறை",
    thExamDetails: "தேர்வு விவரங்கள்",
    thDateTime: "தேதி மற்றும் நேரம்",
    thRoomInvigilator: "அறை மற்றும் கண்காணிப்பாளர்",
    thSeatingStatus: "இருக்கை மற்றும் நிலை",
    deskAssigned: "மேசை: ஒதுக்கப்பட்டுள்ளது",
    examDone: "தேர்வு முடிந்தது",
    ongoing: "நடக்கிறது",
    upcoming: "வரவிருக்கிறது",
    instructionsTitle: "முக்கிய தேர்வு வழிமுறைகள்",
    instructions1: "தேர்வு தொடங்குவதற்கு குறைந்தது 15 நிமிடங்களுக்கு முன்பாக தேர்வு அறையில் இருக்க வேண்டும்.",
    instructions2: "தேவையான அனைத்து பொருட்களையும் கொண்டு வரவும். தேர்வு நேரத்தில் மற்றவர்களிடம் கடன் வாங்குவது கண்டிப்பாக தடைசெய்யப்பட்டுள்ளது.",
    tipsTitle: "தயாரிப்பு மற்றும் தேர்வு குறிப்புகள்",
    tips1: "**வினாத்தாளை கவனமாக படிக்கவும்**: முதல் 10 நிமிடங்களை அனைத்து கேள்விகளையும் படிக்க செலவிடவும்.",
    tips2: "**விடைத்தாளை சரிபார்க்கவும்**: உங்கள் பதில்கள் மற்றும் சூத்திரங்களை சரிபார்க்க கடைசி 10 நிமிடங்களை சேமிக்கவும்.",
    marksTitle: "என் மாதிரி மற்றும் திருப்புதல் தேர்வு மதிப்பெண்கள்",
    marksDesc: "தலைமையாசிரியர் அலுவலகத்தால் சரிபார்க்கப்பட்டு இறுதி செய்யப்பட்ட தேர்வு முடிவுகள் மட்டுமே இங்கு காட்டப்படும்.",
    loadingReportCards: "மதிப்பெண் அட்டைகளை ஏற்றுகிறது...",
    noResults: "எந்த தேர்வு முடிவுகளும் இன்னும் வெளியிடப்படவில்லை",
    noResultsDesc: "தலைமையாசிரியர் உங்கள் முடிவுகளை கணினியில் உள்ளிட்டு உறுதிசெய்தவுடன் உங்கள் மதிப்பெண் அட்டைகள் தானாகவே இங்கே தோன்றும்.",
    emisGroup: "எமிஸ் குழு",
    academicYear: "கல்வி ஆண்டு",
    class: "வகுப்பு",
    conductedOn: "நடைபெற்ற தேதி",
    finalScore: "இறுதி மதிப்பெண்",
    percentage: "சதவீதம்",
    pass: "தேர்ச்சி",
    fail: "தோல்வி",
    theory: "எழுத்து",
    practical: "செய்முறை",
    both: "இரண்டும்"
  }
};

function getSubjectTranslation(label: string, lang: "en" | "ta") {
  if (lang === "en") return label;
  const t: Record<string, string> = {
    tamil: "தமிழ்",
    english: "ஆங்கிலம்",
    mathematics: "கணிதம்",
    maths: "கணிதம்",
    science: "அறிவியல்",
    "social science": "சமூக அறிவியல்",
    physics: "இயற்பியல்",
    chemistry: "வேதியியல்",
    biology: "உயிரியல்",
    "comp sci": "கணினி அறிவியல்",
    "computer science": "கணினி அறிவியல்",
    botany: "தாவரவியல்",
    zoology: "விலங்கியல்",
    commerce: "வணிகவியல்",
    accountancy: "கணக்குப்பதிவியல்",
    economics: "பொருளாதாரம்",
    "comp app": "கணினி பயன்பாடுகள்",
    "business math": "வணிக கணிதம்"
  };
  return t[label.toLowerCase()] || label;
}

export default function StudentExamsPage() {
  const { data: session } = useSession();
  const [exams, setExams] = useState<ExamCalendar[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [studentClass, setStudentClass] = useState("Class 10");
  const [studentName, setStudentName] = useState("Arjun Kumar");
  const [emisNumber, setEmisNumber] = useState("3301234567");

  const [lang, setLang] = useState<"en" | "ta">("en");
  const t = translations[lang];

  // Tab View state
  const [activeTab, setActiveTab] = useState<"calendar" | "marks">("calendar");

  // Student results states
  const [studentResults, setStudentResults] = useState<any[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

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

  const fetchExamsFromDB = async (schoolId: string, studentClass?: string) => {
    if (!schoolId) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const params = new URLSearchParams({ schoolId });
      // Filter by class on the server — only show this student's class exams
      if (studentClass) params.set("class", studentClass);
      const res = await fetch(`${API_URL}/api/exam-schedule?${params.toString()}`);
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
  };

  // Fetch student model exam results
  const fetchStudentResults = useCallback(async () => {
    const studentId = (session?.user as any)?.studentId;
    if (!studentId) return;
    setLoadingResults(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/headmaster/model-exams/student/${studentId}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const uniqueMap = new Map();
        for (const item of json.data) {
          const ex = item.exam || {};
          const key = `${ex.examName || ""}_${ex.academicYear || ""}_${ex.class || ""}_${ex.section || ""}_${ex.examType || ""}`;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
          }
        }
        setStudentResults(Array.from(uniqueMap.values()));
      }
    } catch (err) {
      console.error("Failed to fetch student results:", err);
    } finally {
      setLoadingResults(false);
    }
  }, [session]);

  // Load profile and exams
  useEffect(() => {
    const user = session?.user as any;
    if (user) {
      if (user.name) setStudentName(user.name);
      const rawClass = user.class || user.className || user.classId || "";
      // Normalize: "11-B" or "11B" → "11"
      const classNum = rawClass ? String(rawClass).match(/\d+/)?.[0] || "" : "";
      if (classNum) setStudentClass(`Class ${classNum}`);
      if (user.emisId || user.emisNumber) setEmisNumber(user.emisId || user.emisNumber);
    }

    const schoolId = (session?.user as any)?.schoolId || "";
    const userId   = (session?.user as any)?.id || "";
    const rawClass = (session?.user as any)?.class || (session?.user as any)?.className || "";
    const classNum = rawClass ? String(rawClass).match(/\d+/)?.[0] || "" : "";

    if (schoolId) {
      fetchExamsFromDB(schoolId, classNum || undefined);
    }

    // Fetch student profile to fill in name, emisNumber, and fallback schoolId/class
    const fetchStudentProfile = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const params = new URLSearchParams();
        if (userId) params.set("userId", userId);
        const res = await fetch(`${API_URL}/api/students?${params.toString()}`);
        const json = await res.json();
        if (json.success && json.data) {
          const students = Array.isArray(json.data) ? json.data : [json.data];
          const profile = userId
            ? students.find((s: any) => s.userId === userId) || students[0]
            : students[0];
          if (profile) {
            setStudentName(profile.name || profile.studentName || "");
            setEmisNumber(profile.emisNumber || "—");

            const profileClassNum = String(profile.class || "").match(/\d+/)?.[0] || "";
            if (profileClassNum) setStudentClass(`Class ${profileClassNum}`);

            // Re-fetch exams with profile schoolId + class if session was missing them
            if (!schoolId && profile.schoolId) {
              fetchExamsFromDB(profile.schoolId, profileClassNum || undefined);
            } else if (schoolId && !classNum && profileClassNum) {
              fetchExamsFromDB(schoolId, profileClassNum);
            }
          }
        }
      } catch (e) {
        if (session?.user?.name) {
          setStudentName(session.user.name);
        }
      }
    };

    fetchStudentProfile();
    setIsMounted(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Live timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === "marks") {
      fetchStudentResults();
    }
  }, [activeTab, fetchStudentResults]);

  // Show all real exams from DB; exclude only Cancelled ones
  const effectiveExams = exams;

  const studentExams = effectiveExams.filter(
    (ex) => ex.status !== "Cancelled" && (ex.status as string) !== "CANCELLED"
  );

  const getExamDateTime = (dateStr: string, slotStr: string) => {
    try {
      const timePart = slotStr.split(" - ")[0];
      const [time, modifier] = timePart.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
      
      return new Date(`${dateStr}T${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`);
    } catch (e) {
      return new Date(dateStr);
    }
  };

  const upcomingExams = studentExams
    .filter(e => e.status === "Scheduled")
    .map(e => ({
      ...e,
      targetDateTime: getExamDateTime(e.date, e.timeSlot)
    }))
    .filter(e => e.targetDateTime.getTime() > currentTime.getTime())
    .sort((a, b) => a.targetDateTime.getTime() - b.targetDateTime.getTime());

  const nextExam = upcomingExams[0];

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

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "Quarterly":   return "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400";
      case "Half-Yearly": return "bg-cyan-500/10 border-cyan-500/20 text-cyan-400";
      case "Model":       return "bg-orange-500/10 border-orange-500/20 text-orange-400";
      case "Public":      return "bg-rose-500/10 border-rose-500/20 text-rose-400";
      case "Annual":      return "bg-emerald-550/10 border-emerald-550/20 text-emerald-450";
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
      case "Theory":    return <i className="fi fi-rr-book-open-reader text-[10px]"></i>;
      case "Practical": return <i className="fi fi-rr-flask text-[10px]"></i>;
      case "Both":      return <i className="fi fi-rr-layer-group text-[10px]"></i>;
    }
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
    if (mode === "Theory")    return `70 ${t.marks}`;
    if (mode === "Practical") return `30 ${t.marks}`;
    return `70 (T) + 30 (P) = 100 ${t.marks}`;
  };

  return (
    <PortalLayout
      title={t.title}
      subtitle={t.subtitle(studentName, studentClass, emisNumber)}
      avatarLetter={(studentName || "Student").charAt(0)}
      avatarColor="#6366f1"
      themeClass="theme-student"
      accentColor="#6366f1"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 glass rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <i className="fi fi-sr-clipboard-list text-2xl text-indigo-600 dark:text-indigo-400 flex items-center" />
          <div>
            <h2 className="text-lg sm:text-xl font-black text-black dark:text-white uppercase tracking-wider leading-tight">
              {lang === "ta" ? "பள்ளி தேர்வுகள் & அட்டவணை" : "School Exams & Timetable"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === "ta" ? "உங்கள் பள்ளியின் தேர்வு அட்டவணை, ஹால் அனுமதி மற்றும் அதிகாரப்பூர்வ முடிவுகள்." : "Official school examination timetables, seat allocation, hall permissions, and term report cards."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0 self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{lang === "ta" ? "வகுப்பு:" : "Your Grade:"}</span>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-extrabold text-xs sm:text-sm rounded-xl border border-indigo-200/20 shadow-sm">
            <i className="fi fi-sr-graduation-cap flex items-center text-sm" />
            {lang === "ta" ? `வகுப்பு ${studentClass}` : `Class ${studentClass || "10"}th Standard`}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-4 sm:mb-6 gap-3 print:hidden">
        {/* Navigation tabs */}
        <div className="flex bg-slate-950 border border-slate-800 p-1 sm:p-1.5 rounded-2xl w-full sm:w-fit">
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-black transition-all ${
              activeTab === "calendar"
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <i className="fi fi-rr-calendar"></i> {t.tabCalendar}
          </button>
          <button
            onClick={() => setActiveTab("marks")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-black transition-all ${
              activeTab === "marks"
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <i className="fi fi-rr-award"></i> {t.tabMarks}
          </button>
        </div>
        
        {/* Language Toggle */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl w-fit self-end sm:self-auto">
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${lang === "en" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"}`}
          >
            English
          </button>
          <button
            onClick={() => setLang("ta")}
            className={`px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${lang === "ta" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"}`}
          >
            தமிழ்
          </button>
        </div>
      </div>

      {activeTab === "calendar" ? (
        /* ── Tab 1: Timetables and Countdown ── */
        <div>
          {/* Countdown Panel for Next Upcoming Exam */}
          {nextExam && (
            <div className="rounded-2xl p-3.5 sm:p-6 bg-slate-900 border border-slate-800 mb-4 sm:mb-6 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 shadow-xl">
              <div className="space-y-1.5 sm:space-y-2 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-400 flex items-center justify-center">
                    <i className="fi fi-rr-stopwatch text-xs sm:text-sm leading-none"></i>
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-indigo-450 font-extrabold uppercase tracking-wider">{t.nextUpcoming}</span>
                </div>
                <h2 className="text-sm sm:text-base md:text-lg font-black text-white leading-tight">{nextExam.name} ({getSubjectTranslation(nextExam.subject, lang)})</h2>
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] sm:text-xs text-slate-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <i className="fi fi-rr-calendar text-slate-500"></i> {formatStudentFriendlyDate(nextExam.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="fi fi-rr-clock text-slate-500"></i> {nextExam.timeSlot}
                  </span>
                  <span className="flex items-center gap-1 text-purple-300">
                    <i className="fi fi-rr-marker text-purple-400"></i> {t.room}: {nextExam.hall.split(" (")[0]}
                  </span>
                  <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] sm:text-[10px] ${getModeBadgeStyle(nextExam.examMode)}`}>
                    {getModeIcon(nextExam.examMode)}
                    {lang === "ta" ? (nextExam.examMode === "Theory" ? t.theory : nextExam.examMode === "Practical" ? t.practical : nextExam.examMode === "Both" ? t.both : t.theory) : (nextExam.examMode || "Theory")} {t.mode}
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <i className="fi fi-rr-award text-amber-500"></i> {getTotalMarksStr(nextExam)}
                  </span>
                </div>
              </div>

              {/* Countdown Clock Widget */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 bg-slate-950 border border-slate-850 p-2 sm:p-3 rounded-xl sm:rounded-2xl w-full sm:w-auto mt-1 sm:mt-0">
                {(() => {
                  const { days, hours, minutes, seconds } = getCountdownData(nextExam.targetDateTime);
                  return (
                    <>
                      <div className="text-center min-w-[38px] sm:min-w-[50px] p-1 sm:p-2 bg-slate-900 border border-slate-800 rounded-lg sm:rounded-xl">
                        <div className="text-base sm:text-xl font-black text-white">{days.toString().padStart(2, "0")}</div>
                        <div className="text-[7px] sm:text-[8px] text-slate-400 font-extrabold uppercase mt-0.5">{t.days}</div>
                      </div>
                      <div className="text-base sm:text-xl font-bold text-slate-800">:</div>
                      <div className="text-center min-w-[38px] sm:min-w-[50px] p-1 sm:p-2 bg-slate-900 border border-slate-800 rounded-lg sm:rounded-xl">
                        <div className="text-base sm:text-xl font-black text-white">{hours.toString().padStart(2, "0")}</div>
                        <div className="text-[7px] sm:text-[8px] text-slate-400 font-extrabold uppercase mt-0.5">{t.hours}</div>
                      </div>
                      <div className="text-base sm:text-xl font-bold text-slate-800">:</div>
                      <div className="text-center min-w-[38px] sm:min-w-[50px] p-1 sm:p-2 bg-slate-900 border border-slate-800 rounded-lg sm:rounded-xl">
                        <div className="text-base sm:text-xl font-black text-white">{minutes.toString().padStart(2, "0")}</div>
                        <div className="text-[7px] sm:text-[8px] text-slate-400 font-extrabold uppercase mt-0.5">{t.mins}</div>
                      </div>
                      <div className="text-base sm:text-xl font-bold text-slate-800">:</div>
                      <div className="text-center min-w-[38px] sm:min-w-[50px] p-1 sm:p-2 bg-slate-900 border border-slate-850 rounded-lg sm:rounded-xl">
                        <div className="text-base sm:text-xl font-black text-indigo-400">{seconds.toString().padStart(2, "0")}</div>
                        <div className="text-[7px] sm:text-[8px] text-slate-400 font-extrabold uppercase mt-0.5">{t.secs}</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          <div className="mb-6">
            {/* Exam Schedule List */}
            <div className="glass rounded-2xl p-3.5 sm:p-6 flex flex-col min-h-[300px] sm:min-h-[400px] w-full">
              <div className="flex items-center gap-2 mb-3.5 sm:mb-5">
                <i className="fi fi-rr-calendar text-lg sm:text-xl text-indigo-400 leading-none"></i>
                <h2 className="text-xs sm:text-sm font-bold text-white">{t.dateSheet}</h2>
                <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md">
                  {studentExams.length}
                </span>
              </div>

              {!isMounted ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <div className="text-xs font-semibold text-slate-400">Loading your assessments...</div>
                </div>
              ) : studentExams.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
                  <div className="p-3 sm:p-4 bg-slate-900/40 rounded-full text-slate-500 border border-slate-800 mb-3 flex items-center justify-center">
                    <i className="fi fi-rr-info text-xl sm:text-2xl leading-none"></i>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white mb-1">{t.noSchedules}</h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 max-w-sm">
                    {t.noSchedulesDesc}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[9px] sm:text-[10px] text-slate-500 font-black uppercase tracking-wider">
                        <th className="p-2.5 sm:p-4 align-middle whitespace-nowrap">{t.thStandardMode}</th>
                        <th className="p-2.5 sm:p-4 align-middle whitespace-nowrap">{t.thExamDetails}</th>
                        <th className="p-2.5 sm:p-4 align-middle whitespace-nowrap">{t.thDateTime}</th>
                        <th className="p-2.5 sm:p-4 align-middle whitespace-nowrap">{t.thRoomInvigilator}</th>
                        <th className="p-2.5 sm:p-4 align-middle text-right whitespace-nowrap">{t.thSeatingStatus}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentExams.map((ex) => (
                        <tr 
                          key={ex.id}
                          className={`hover:bg-slate-50/30 transition-colors text-[11px] sm:text-xs text-slate-800 font-medium border-b border-slate-100 last:border-b-0 ${
                            ex.status === "Completed" ? "border-l-4 border-l-rose-400" :
                            ex.status === "In Progress" ? "border-l-4 border-l-amber-400" :
                            "border-l-4 border-l-emerald-400"
                          }`}
                        >
                          <td className="p-2.5 sm:p-4 align-middle whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] sm:text-[10px] font-black uppercase px-1.5 sm:px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md w-max">
                                {ex.classSection}
                              </span>
                              <span className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 border rounded-md w-max flex items-center gap-0.5 ${getModeBadgeStyle(ex.examMode || "Theory")}`}>
                                {getModeIcon(ex.examMode || "Theory")}
                                {ex.examMode || "Theory"}
                              </span>
                            </div>
                          </td>

                          <td className="p-2.5 sm:p-4 align-middle min-w-[180px] sm:min-w-[200px]">
                            <div className="flex items-start gap-2 sm:gap-2.5">
                              <span className="mt-1 flex-shrink-0">
                                <span className={`relative flex h-2 w-2 sm:h-2.5 sm:w-2.5`}>
                                  {ex.status === "Scheduled" && (
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  )}
                                  <span className={`relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 ${
                                    ex.status === "Completed" ? "bg-rose-500" :
                                    ex.status === "In Progress" ? "bg-amber-400" :
                                    "bg-emerald-500"
                                  }`}></span>
                                </span>
                              </span>
                              <div className="space-y-0.5 sm:space-y-1">
                                <div className="text-slate-900 font-extrabold text-xs sm:text-sm leading-tight">{ex.subject}</div>
                                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-slate-500 text-[11px] sm:text-xs font-semibold">
                                  <span>{ex.name}</span>
                                  <span className={`text-[8px] font-extrabold px-1 sm:px-1.5 py-0.5 border rounded uppercase ${getTypeBadgeStyle(ex.type)}`}>
                                    {ex.type}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-2.5 sm:p-4 align-middle whitespace-nowrap">
                            <div className="space-y-0.5 sm:space-y-1">
                              <div className="flex items-center gap-1.5 text-slate-750 font-bold text-xs sm:text-[13px]">
                                <i className="fi fi-rr-calendar text-indigo-500"></i>
                                <span>{formatStudentFriendlyDate(ex.date)}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-550 text-[10px] sm:text-[11px] font-semibold">
                                <i className="fi fi-rr-clock text-amber-500"></i>
                                <span>{ex.timeSlot} <span className="text-slate-450">({ex.duration || "3 Hours"})</span></span>
                              </div>
                            </div>
                          </td>

                          <td className="p-2.5 sm:p-4 align-middle whitespace-nowrap">
                            <div className="space-y-0.5 sm:space-y-1">
                              <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs sm:text-sm">
                                <i className="fi fi-rr-marker text-purple-500"></i>
                                <span>{ex.hall.split(" (")[0]}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-[10px] sm:text-xs">
                                <i className="fi fi-rr-user-check text-emerald-600"></i>
                                <span>{ex.invigilator}</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-2.5 sm:p-4 align-middle text-right whitespace-nowrap">
                            <div className="flex flex-col items-end gap-1 sm:gap-1.5">
                              <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[8px] sm:text-[9px] font-black rounded-full border uppercase tracking-wider w-max ${
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
                                {ex.status === "Completed" ? t.examDone :
                                 ex.status === "In Progress" ? t.ongoing :
                                 t.upcoming}
                              </span>
                              <div className="text-[8px] sm:text-[9px] text-slate-500 font-semibold bg-slate-50 border border-slate-200 px-1.5 sm:px-2 py-0.5 rounded-md w-max">
                                {t.deskAssigned}
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
              <div className="mt-4 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="glass rounded-2xl p-3.5 sm:p-5 border border-slate-200/60 bg-white/50 dark:bg-slate-900/50 shadow-sm">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white mb-2 sm:mb-3 flex items-center gap-2">
                    <i className="fi fi-rr-stars text-indigo-500"></i>
                    {t.instructionsTitle}
                  </h3>
                  <ul className="space-y-2 text-[11px] sm:text-xs text-slate-650 dark:text-slate-400 font-medium">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 flex-shrink-0" />
                      <span>{t.instructions1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 flex-shrink-0" />
                      <span>{t.instructions2}</span>
                    </li>
                  </ul>
                </div>

                <div className="glass rounded-2xl p-3.5 sm:p-5 border border-slate-200/60 bg-white/50 dark:bg-slate-900/50 shadow-sm">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white mb-2 sm:mb-3 flex items-center gap-2">
                    <i className="fi fi-rr-award text-amber-500"></i>
                    {t.tipsTitle}
                  </h3>
                  <ul className="space-y-2.5 text-xs text-slate-650 dark:text-slate-400 font-medium">
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <span>{t.tips1}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <span>{t.tips2}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Tab 2: Model Exam Results View ── */
        <div className="fade-in">
          <div className="glass rounded-2xl sm:rounded-3xl border border-slate-250 bg-white p-3.5 sm:p-6 shadow-xl dark:border-slate-850 dark:bg-slate-950">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mb-1.5 sm:mb-2 flex items-center gap-2">
              <i className="fi fi-rr-award text-base sm:text-lg text-indigo-500 leading-none"></i>
              {t.marksTitle}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed mb-4 sm:mb-6">
              {t.marksDesc}
            </p>

            {loadingResults ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-3">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <div className="text-xs font-semibold text-slate-400 animate-pulse">{t.loadingReportCards}</div>
              </div>
            ) : studentResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/40 dark:bg-slate-950/20">
                <i className="fi fi-rr-document text-3xl sm:text-4xl text-slate-300 dark:text-slate-800"></i>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">{t.noResults}</h3>
                <p className="text-[11px] sm:text-xs text-slate-400 max-w-xs text-center leading-relaxed">
                  {t.noResultsDesc}
                </p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {studentResults.map((result) => {
                  const exam = result.exam;
                  const isHsc = exam.class === "11" || exam.class === "12";
                  const subjectsList = isHsc ? getGroupSubjects(exam.group) : SUBJECTS;
                  const { total, pct, isPassed, maxTotal } = calcLocal(result, isHsc);

                  return (
                    <div 
                      key={result.id} 
                      className={`p-3.5 sm:p-6 rounded-2xl border-2 transition-all duration-300 ${
                        isPassed 
                          ? "bg-slate-50/50 border-emerald-500/20 hover:border-emerald-500/35 dark:bg-slate-900/10" 
                          : "bg-slate-50/50 border-rose-500/20 hover:border-rose-500/35 dark:bg-slate-900/10"
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800 pb-3 sm:pb-4 mb-3.5 sm:mb-5">
                        <div>
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{getSubjectTranslation(exam.examName, lang)}</h3>
                            <span className="text-[8px] sm:text-[9px] bg-slate-100 border border-slate-250 px-1.5 sm:px-2 py-0.5 rounded-full text-slate-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400">
                              {getSubjectTranslation(exam.examType, lang)}
                            </span>
                            {exam.group && (
                              <span className="text-[8px] sm:text-[9px] bg-indigo-50 border border-indigo-150 px-1.5 sm:px-2 py-0.5 rounded-full text-indigo-650 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-400">
                                {t.emisGroup}: {exam.group}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
                            {t.academicYear} {exam.academicYear} · {t.class} {exam.class} ({exam.section})
                            {exam.examDate ? ` · ${t.conductedOn} ${new Date(exam.examDate).toLocaleDateString("en-IN")}` : ""}
                          </p>
                        </div>

                        {/* Overall badge metrics */}
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 sm:gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/50 dark:border-slate-850/50">
                          <div className="text-left sm:text-right">
                            <div className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">{t.finalScore}</div>
                            <div className="text-sm sm:text-lg font-black text-slate-800 dark:text-white leading-none mt-0.5 sm:mt-1">
                              {total}/{maxTotal}
                            </div>
                          </div>
                          <div className="w-[1px] h-6 sm:h-8 bg-slate-200 dark:bg-slate-850" />
                          <div className="text-center sm:text-right">
                            <div className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-wider font-extrabold">{t.percentage}</div>
                            <div className="text-sm sm:text-lg font-black text-indigo-600 dark:text-indigo-400 leading-none mt-0.5 sm:mt-1">
                              {pct}%
                            </div>
                          </div>
                          <div className="w-[1px] h-6 sm:h-8 bg-slate-200 dark:bg-slate-850" />
                          <span className={`px-2.5 py-1 sm:px-3 rounded-lg text-[10px] sm:text-xs font-black tracking-wider ${
                            isPassed 
                              ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400" 
                              : "bg-rose-500/10 border border-rose-500/25 text-rose-500 dark:text-rose-450"
                          }`}>
                            {isPassed ? t.pass : t.fail}
                          </span>
                        </div>
                      </div>

                      {/* Marks breakdown grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                        {subjectsList.map((subj) => {
                          const markVal = (result as any)[subj.key];
                          const hasMark = markVal != null;
                          const isFailedSubj = hasMark && markVal < PASS_MARK;

                          return (
                            <div 
                              key={subj.key} 
                              className={`p-2.5 sm:p-3.5 rounded-xl border flex flex-col items-center justify-center text-center relative ${
                                !hasMark ? "bg-slate-50/30 border-slate-200 dark:bg-slate-900/10 dark:border-slate-850" :
                                isFailedSubj
                                  ? "bg-rose-500/5 border-rose-500/15 dark:bg-rose-950/10 dark:border-rose-900/30"
                                  : "bg-slate-50/80 border-slate-200 dark:bg-slate-900/40 dark:border-slate-850"
                              }`}
                            >
                              <div className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${subj.color}`}>
                                {getSubjectTranslation(subj.label, lang)}
                              </div>
                              <div className="mt-1.5 sm:mt-2 flex items-baseline gap-0.5">
                                <span className={`text-base sm:text-xl font-black ${
                                  !hasMark ? "text-slate-350 dark:text-slate-700" :
                                  isFailedSubj ? "text-rose-500" : "text-slate-800 dark:text-slate-200"
                                }`}>
                                  {hasMark ? markVal : "—"}
                                </span>
                                {hasMark && <span className="text-[9px] sm:text-[10px] text-slate-400">/100</span>}
                              </div>
                              
                              {hasMark && (
                                <span className={`text-[8px] sm:text-[9px] font-extrabold mt-1 sm:mt-1.5 px-1.5 py-0.5 rounded-md ${
                                  isFailedSubj 
                                    ? "bg-rose-500/10 text-rose-500" 
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-400"
                                }`}>
                                  {isFailedSubj ? t.fail : t.pass}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
