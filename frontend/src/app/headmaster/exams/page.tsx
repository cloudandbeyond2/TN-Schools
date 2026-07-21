"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import { BookOpen, FlaskConical, Layers } from "lucide-react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";


type ExamType = "Unit Test" | "Quarterly" | "Half-Yearly" | "Annual" | "Model" | "Public";
type ExamMode = "Theory" | "Practical" | "Both";

interface ExamCalendar {
  id: number | string;
  name: string;
  classSection: string;
  subject: string;
  date: string;
  timeSlot: string;
  duration: string;         // NEW
  hall: string;
  invigilator: string;
  status: "Scheduled" | "In Progress" | "Completed";
  type: string;
  examMode: ExamMode;       // NEW
  theoryMaxMarks: number;   // NEW
  practicalMaxMarks: number;// NEW
  published: boolean;
}

interface Toast {
  message: string;
  type: "success" | "info" | "error";
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

const getFormMarksConfig = (subject: string, classSection: string) => {
  const isClass6to10 = !classSection.includes("Class 11") && !classSection.includes("Class 12");
  const config = SUBJECT_MARKS_CONFIG[subject] || { theory: 100, practical: 0, allowPractical: false };
  
  if (isClass6to10) {
    return {
      theoryMaxMarks: 100,
      practicalMaxMarks: 0,
      allowPractical: false
    };
  }
  
  return {
    theoryMaxMarks: config.theory,
    practicalMaxMarks: config.practical,
    allowPractical: config.allowPractical
  };
};

const TEACHERS_LIST = [
  "Ramani",
  "Usharani",
  "kalai",
  "shandhi"
];

const TIME_SLOTS = [
  "09:00 AM - 10:00 AM",   // 1 hr  – Unit Test / Short exam
  "09:00 AM - 10:30 AM",  // 1.5 hr
  "09:00 AM - 11:00 AM",  // 2 hr
  "09:00 AM - 11:30 AM",  // 2.5 hr
  "09:30 AM - 12:30 PM",  // 3 hr  – Term / Half-Yearly
  "10:00 AM - 12:00 PM",  // 2 hr
  "10:00 AM - 01:00 PM",  // 3 hr
  "02:00 PM - 03:00 PM",  // 1 hr
  "02:00 PM - 03:30 PM",  // 1.5 hr
  "02:00 PM - 04:00 PM",  // 2 hr
  "02:00 PM - 05:00 PM",  // 3 hr
];

// Compute duration label from a "HH:MM AM/PM - HH:MM AM/PM" slot string
function calcDurationFromSlot(slot: string): string {
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
}

const HALL_OPTIONS = [
  "Block A - Hall 1 (80 desks)",
  "Block A - Hall 2 (80 desks)",
  "Main Auditorium (250 desks)",
  "Science Wing - Lab 3 (40 desks)"
];

const SUBJECT_OPTIONS = [
  "Mathematics",
  "Science",
  "Social Science",
  "English",
  "Tamil",
  "Physics",
  "Chemistry",
  "Biology",
  "Environmental Studies (EVS)",
  "Physical Education (PT)",
  "Computer Science",
  "Accountancy",
  "Economics"
];

const EXAM_TYPES: ExamType[] = ["Unit Test", "Quarterly", "Half-Yearly", "Annual", "Model", "Public"];

// ── Derive total marks from mode ──────────────────────────────────────────────
function getTotalMarks(exam: ExamCalendar): number {
  const classStr = exam.classSection || "";
  const isClass6to10 = !classStr.includes("Class 11") && !classStr.includes("Class 12");
  
  if (isClass6to10) {
    return 100;
  }
  
  const config = SUBJECT_MARKS_CONFIG[exam.subject] || { theory: 100, practical: 0, allowPractical: false };
  if (!config.allowPractical) {
    return 100;
  }
  
  const mode = exam.examMode || "Theory";
  if (mode === "Theory") return 70;
  if (mode === "Practical") return 30;
  return 100; // Both
}

export default function HeadmasterExamsPage() {
  const { lang } = usePortalLanguage();
  const [exams, setExams] = useState<ExamCalendar[]>([]);
  const [isMounted, setIsMounted] = useState(false);

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
  
  const { data: session } = useSession();
  const mySchoolId: string = (session?.user as any)?.schoolId || "";
  const [teachers, setTeachers] = useState<string[]>(TEACHERS_LIST);

  // Fetch actual staff dynamically from backend if available
  useEffect(() => {
    const fetchStaff = async () => {
      if (!mySchoolId) return;
      try {
        const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${url}/api/headmaster/staff?schoolId=${mySchoolId}`);
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          const names = json.data.map((t: any) => t.name);
          setTeachers(names);
        }
      } catch (err) {
        console.error("Error fetching staff for exams list:", err);
      }
    };
    fetchStaff();
  }, [mySchoolId]);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Scheduled" | "In Progress" | "Completed">("All");
  const [classFilter, setClassFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamCalendar | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  // Other/Custom manually typed option states

  const defaultFormData = {
    name: "",
    classSection: "Class 10 (All)",
    subject: "Mathematics",
    date: "",
    timeSlot: "09:30 AM - 12:30 PM",
    duration: calcDurationFromSlot("09:30 AM - 12:30 PM"),
    hall: "Block A - Hall 1 (80 desks)",
    invigilator: "kalai",
    status: "Scheduled" as "Scheduled" | "In Progress" | "Completed",
    type: "Unit Test" as string,
    examMode: "Theory" as ExamMode,
    theoryMaxMarks: 100,
    practicalMaxMarks: 0,
    published: false
  };

  const [formData, setFormData] = useState(defaultFormData);

  // Auto-fill and lock marks depending on Class & Subject & Mode selection
  useEffect(() => {
    const activeClass = editingExam ? formData.classSection : (selectedClasses[0] || "Class 10 (All)");
    const { theoryMaxMarks, practicalMaxMarks, allowPractical } = getFormMarksConfig(formData.subject, activeClass);
    
    let newMode = formData.examMode;
    if (!allowPractical) {
      newMode = "Theory";
    }
    
    let activeTheory = 100;
    let activePractical = 0;
    
    if (allowPractical) {
      if (newMode === "Theory") {
        activeTheory = 70;
        activePractical = 0;
      } else if (newMode === "Practical") {
        activeTheory = 0;
        activePractical = 30;
      } else {
        activeTheory = 70;
        activePractical = 30;
      }
    } else {
      activeTheory = 100;
      activePractical = 0;
    }
    
    if (
      formData.examMode !== newMode ||
      formData.theoryMaxMarks !== activeTheory ||
      formData.practicalMaxMarks !== activePractical
    ) {
      setFormData(prev => ({
        ...prev,
        examMode: newMode,
        theoryMaxMarks: activeTheory,
        practicalMaxMarks: activePractical
      }));
    }
  }, [formData.subject, formData.classSection, selectedClasses, formData.examMode, editingExam]);

  // Global Toast State
  const [toast, setToast] = useState<Toast | null>(null);

  // Success Modal State (shown after scheduling an exam)
  interface SuccessModalData {
    examName: string;
    classes: string[];
    subject: string;
    date: string;
    timeSlot: string;
    duration: string;
    totalMarks: number;
    isEdit: boolean;
  }
  const [successModal, setSuccessModal] = useState<SuccessModalData | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const deconstructClassSection = (clsSecStr: string) => {
    const clean = clsSecStr.replace(/class/i, '').trim();
    const match = clean.match(/^(\d+)\s*\(([^)]+)\)/);
    if (match) {
      return { classVal: match[1], sectionVal: match[2] };
    }
    return { classVal: clean, sectionVal: 'All' };
  };

  const fetchExamsFromDB = async () => {
    if (!mySchoolId) return;
    try {
      const res = await fetch(`${API_URL}/api/exam-schedule?schoolId=${mySchoolId}`);
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
        try {
          setExams(JSON.parse(savedExams));
        } catch (e) {
          setExams([]);
        }
      }
    }
  };

  // Initialize and load from DB
  useEffect(() => {
    if (mySchoolId) {
      fetchExamsFromDB();
    } else {
      const savedExams = localStorage.getItem("hm_exams_v2");
      if (savedExams) {
        try { setExams(JSON.parse(savedExams)); } catch (e) {}
      }
    }
    setIsMounted(true);
  }, [mySchoolId]);

  const saveExams = (newExams: ExamCalendar[]) => {
    setExams(newExams);
    localStorage.setItem("hm_exams_v2", JSON.stringify(newExams));
  };

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Conflict Checking Engine
  const checkInvigilatorConflict = (teacher: string, date: string, timeSlot: string, currentId?: number | string) => {
    return exams.some(ex => 
      ex.invigilator === teacher && 
      ex.date === date && 
      ex.timeSlot === timeSlot && 
      String(ex.id) !== String(currentId)
    );
  };

  // Toggle Publish Status
  const togglePublishExam = async (id: number | string) => {
    const ex = exams.find(e => e.id === id);
    if (!ex) return;
    const nextPub = !ex.published;
    try {
      const res = await fetch(`${API_URL}/api/exam-schedule/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: nextPub }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(nextPub ? "Exam schedule published!" : "Exam schedule unpublished.");
        fetchExamsFromDB();
      }
    } catch (e) {
      showToast("Failed to update publish status", "error");
    }
  };

  // Publish All Schedules
  const handlePublishAll = async () => {
    try {
      const unpublished = exams.filter(ex => !ex.published);
      if (unpublished.length === 0) {
        showToast("All exams are already published", "info");
        return;
      }
      await Promise.all(
        unpublished.map(ex =>
          fetch(`${API_URL}/api/exam-schedule/${ex.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ published: true }),
          })
        )
      );
      showToast("✓ All exams published successfully to Teacher and Student portals!", "success");
      fetchExamsFromDB();
    } catch (e) {
      showToast("Failed to publish all exams", "error");
    }
  };

  // Clear All Schedules
  const handleClearAll = () => {
    setIsClearConfirmOpen(true);
  };

  const executeClearAll = async () => {
    if (!mySchoolId) return;
    try {
      const res = await fetch(`${API_URL}/api/exam-schedule`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId: mySchoolId }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("All exam schedules cleared successfully", "error");
        fetchExamsFromDB();
      }
    } catch (e) {
      showToast("Failed to clear exam schedules", "error");
    }
    setIsClearConfirmOpen(false);
  };

  // Progression handlers
  const handleStartExam = async (id: number | string) => {
    const ex = exams.find(e => e.id === id);
    if (!ex) return;
    try {
      const res = await fetch(`${API_URL}/api/exam-schedule/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "In Progress" }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`▶️ Exam "${ex.name}" has commenced!`, "success");
        fetchExamsFromDB();
      }
    } catch (e) {
      showToast("Failed to start exam", "error");
    }
  };

  const handleCompleteExam = async (id: number | string) => {
    const ex = exams.find(e => e.id === id);
    if (!ex) return;
    try {
      const res = await fetch(`${API_URL}/api/exam-schedule/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed" }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`✅ Exam "${ex.name}" marked as Completed!`, "success");
        fetchExamsFromDB();
      }
    } catch (e) {
      showToast("Failed to complete exam", "error");
    }
  };

  const handleRevertExamStatus = async (id: number | string) => {
    const ex = exams.find(e => e.id === id);
    if (!ex) return;
    let prev = "Scheduled";
    if (ex.status === "Completed") prev = "In Progress";
    try {
      const res = await fetch(`${API_URL}/api/exam-schedule/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: prev }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`🔄 Reverted status of "${ex.name}" to ${prev}`, "info");
        fetchExamsFromDB();
      }
    } catch (e) {
      showToast("Failed to revert exam status", "error");
    }
  };

  // CRUD handlers
  const handleOpenCreate = () => {
    setEditingExam(null);
    const today = new Date();
    today.setDate(today.getDate() + 2);
    const dateStr = today.toISOString().split("T")[0];
    
    setSelectedClasses(["Class 10 (All)"]);
    setFormData({
      ...defaultFormData,
      date: dateStr,
      invigilator: teachers[0] || "kalai",
    });

    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam: ExamCalendar) => {
    setEditingExam(exam);
    setSelectedClasses([exam.classSection]);
    setFormData({
      name: exam.name,
      classSection: exam.classSection,
      subject: exam.subject,
      date: exam.date,
      timeSlot: exam.timeSlot,
      duration: exam.duration || "3 Hours",
      hall: exam.hall,
      invigilator: exam.invigilator,
      status: exam.status,
      type: exam.type,
      examMode: exam.examMode || "Theory",
      theoryMaxMarks: exam.theoryMaxMarks ?? 100,
      practicalMaxMarks: exam.practicalMaxMarks ?? 0,
      published: exam.published
    });

    setIsModalOpen(true);
  };

  const handleDeleteExam = async (id: number | string) => {
    const examToDelete = exams.find(ex => ex.id === id);
    if (!examToDelete) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete "${examToDelete.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#334155",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/api/exam-schedule/${id}`, {
          method: "DELETE",
        });
        const json = await res.json();
        if (json.success) {
          showToast("Exam schedule deleted", "error");
          fetchExamsFromDB();
        }
      } catch (e) {
        showToast("Failed to delete exam schedule", "error");
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.date.trim()) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    // Validate marks
    if (formData.examMode !== "Practical" && formData.theoryMaxMarks <= 0) {
      showToast("Theory Max Marks must be greater than 0", "error");
      return;
    }
    if (formData.examMode !== "Theory" && formData.practicalMaxMarks <= 0) {
      showToast("Practical Max Marks must be greater than 0", "error");
      return;
    }

    const times = formData.timeSlot.split(" - ");
    const startTime = times[0];
    const endTime = times[1];

    if (editingExam) {
      const hasConflict = checkInvigilatorConflict(formData.invigilator, formData.date, formData.timeSlot, editingExam.id);
      if (hasConflict) {
        showToast(`❌ Conflict! ${formData.invigilator} is already invigilating at this date & time.`, "error");
        return;
      }

      const { classVal, sectionVal } = deconstructClassSection(formData.classSection);

      try {
        const res = await fetch(`${API_URL}/api/exam-schedule/${editingExam.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.name,
            examType: formData.type,
            class: classVal,
            section: sectionVal,
            subject: formData.subject,
            examDate: new Date(formData.date),
            startTime,
            endTime,
            maxMarks: formData.examMode === "Both"
              ? formData.theoryMaxMarks + formData.practicalMaxMarks
              : formData.examMode === "Practical" ? formData.practicalMaxMarks : formData.theoryMaxMarks,
            venue: formData.hall,
            invigilator: formData.invigilator,
            status: formData.status,
            examMode: formData.examMode,
            theoryMaxMarks: formData.theoryMaxMarks,
            practicalMaxMarks: formData.practicalMaxMarks,
            published: formData.published
          }),
        });

        const json = await res.json();
        if (json.success) {
          showToast("Exam schedule updated successfully!");
          fetchExamsFromDB();
          
          const totalMarks = formData.examMode === "Both"
            ? formData.theoryMaxMarks + formData.practicalMaxMarks
            : formData.examMode === "Practical" ? formData.practicalMaxMarks : formData.theoryMaxMarks;
            
          setSuccessModal({
            examName: formData.name,
            classes: [formData.classSection],
            subject: formData.subject,
            date: formData.date,
            timeSlot: formData.timeSlot,
            duration: formData.duration,
            totalMarks,
            isEdit: true,
          });
        }
      } catch (err) {
        showToast("Failed to update exam", "error");
      }
    } else {
      if (selectedClasses.length === 0) {
        showToast("Please select at least one class", "error");
        return;
      }

      const hasConflict = checkInvigilatorConflict(formData.invigilator, formData.date, formData.timeSlot);
      if (hasConflict) {
        showToast(`❌ Conflict! ${formData.invigilator} is already invigilating at this date & time.`, "error");
        return;
      }

      const bulkSchedules = selectedClasses.map((cls) => {
        const { classVal, sectionVal } = deconstructClassSection(cls);
        return {
          schoolId: mySchoolId,
          title: formData.name,
          examType: formData.type,
          class: classVal,
          section: sectionVal,
          subject: formData.subject,
          examDate: new Date(formData.date),
          startTime,
          endTime,
          maxMarks: formData.examMode === "Both"
            ? formData.theoryMaxMarks + formData.practicalMaxMarks
            : formData.examMode === "Practical" ? formData.practicalMaxMarks : formData.theoryMaxMarks,
          venue: formData.hall,
          invigilator: formData.invigilator,
          status: formData.status,
          examMode: formData.examMode,
          theoryMaxMarks: formData.theoryMaxMarks,
          practicalMaxMarks: formData.practicalMaxMarks,
          published: formData.published
        };
      });

      try {
        const res = await fetch(`${API_URL}/api/exam-schedule/bulk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schedules: bulkSchedules }),
        });
        const json = await res.json();
        if (json.success) {
          showToast(`Scheduled exams successfully for ${selectedClasses.length} classes!`);
          fetchExamsFromDB();
          
          const totalMarks = formData.examMode === "Both"
            ? formData.theoryMaxMarks + formData.practicalMaxMarks
            : formData.examMode === "Practical" ? formData.practicalMaxMarks : formData.theoryMaxMarks;
            
          setSuccessModal({
            examName: formData.name,
            classes: selectedClasses,
            subject: formData.subject,
            date: formData.date,
            timeSlot: formData.timeSlot,
            duration: formData.duration,
            totalMarks,
            isEdit: false,
          });
        }
      } catch (err) {
        showToast("Failed to create exam schedules", "error");
      }
    }
    setIsModalOpen(false);
  };

  // Calculate statistics
  const totalExams = exams.length;
  const scheduledCount = exams.filter((e) => e.status === "Scheduled").length;
  const inProgressCount = exams.filter((e) => e.status === "In Progress").length;
  const completedCount = exams.filter((e) => e.status === "Completed").length;
  const publishedCount = exams.filter((e) => e.published).length;

  // Unique lists for filters
  const classSections = ["All", ...Array.from(new Set(exams.map(e => e.classSection)))];
  const examTypesList: ("All" | ExamType)[] = ["All", ...EXAM_TYPES];

  // Badge colors depending on type
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

  const getModeBadgeStyle = (mode: ExamMode) => {
    switch (mode) {
      case "Theory":    return "bg-slate-500/10 border-slate-500/20 text-slate-300";
      case "Practical": return "bg-violet-500/10 border-violet-500/20 text-violet-300";
      case "Both":      return "bg-amber-500/10 border-amber-500/20 text-amber-300";
    }
  };

  const getModeIcon = (mode: ExamMode) => {
    switch (mode) {
      case "Theory":    return <i className="fi flex items-center justify-center fi-rr-book-open w-3 h-3"></i>;
      case "Practical": return <i className="fi flex items-center justify-center fi-rr-flask w-3 h-3"></i>;
      case "Both":      return <i className="fi flex items-center justify-center fi-rr-layer-group w-3 h-3"></i>;
    }
  };

  // Filtering Logic
  const filteredExams = exams.filter((ex) => {
    const matchesSearch = 
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ex.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || ex.status === statusFilter;
    const matchesClass = classFilter === "All" || ex.classSection === classFilter;
    const matchesType = typeFilter === "All" || ex.type === typeFilter;
    return matchesSearch && matchesStatus && matchesClass && matchesType;
  });

  // ── Marks helper for form UI ──────────────────────────────────────────────
  const showTheory    = formData.examMode === "Theory"    || formData.examMode === "Both";
  const showPractical = formData.examMode === "Practical" || formData.examMode === "Both";

  return (
    <>
      <PortalLayout
        title={lang === "தமிழ்" ? "தேர்வு அட்டவணை & இருக்கம் திட்டமிடல்" : "Exam Scheduling & Seating"}
      subtitle={`${session?.user?.name || "Headmaster"} · ${(session?.user as any)?.schoolName || "Holy Cross Higher Secondary School"} · DISE: ${(session?.user as any)?.schoolDise || "50001"}`}
      avatarLetter={(session?.user?.name || "Headmaster").charAt(0)}
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      {/* Toast Notifications */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl transition-all duration-305 transform translate-y-0 animate-slideIn ${
          toast.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : toast.type === "error"
            ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
            : "bg-blue-500/10 border-blue-500/30 text-blue-300"
        }`}>
          {toast.type === "success" && <i className="fi flex items-center justify-center fi-rr-check-circle text-lg w-5 h-5 text-emerald-400"></i>}
          {toast.type === "error" && <i className="fi flex items-center justify-center fi-rr-info text-lg w-5 h-5 text-rose-400"></i>}
          {toast.type === "info" && <i className="fi flex items-center justify-center fi-rr-clock text-lg w-5 h-5 text-blue-400"></i>}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* ── Success Modal ─────────────────────────────────────────────── */}
      {successModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">

            {/* Green glow top bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

            <div className="p-6 flex flex-col items-center text-center gap-4">

              {/* Animated checkmark circle */}
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 shadow-sm">
                <i className="fi flex items-center justify-center fi-rr-check-circle w-10 h-10 text-emerald-500"></i>
                {/* Pulsing ring */}
                <span className="absolute inset-0 rounded-full border-2 border-emerald-400/30 animate-ping" />
              </div>

              {/* Title */}
              <div>
                <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
                  {successModal.isEdit ? "Exam Updated" : "Exam Scheduled"}
                </p>
                <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
                  {successModal.examName}
                </h2>
                <p className="text-xs text-slate-500 mt-1">{successModal.subject}</p>
              </div>

              {/* Details grid */}
              <div className="w-full grid grid-cols-2 gap-3 mt-2">
                {/* Classes */}
                <div className="col-span-2 bg-white rounded-xl px-4 py-3 flex items-start gap-3 shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                  <i className="fi flex items-center justify-center fi-rr-tag w-4 h-4 text-blue-500 mt-0.5 shrink-0"></i>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold mb-0.5">Classes</p>
                    <p className="text-sm text-slate-900 font-bold">
                      {successModal.classes.length === 1
                        ? successModal.classes[0]
                        : `${successModal.classes.length} classes scheduled`}
                    </p>
                    {successModal.classes.length > 1 && (
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        {successModal.classes.slice(0, 3).join(", ")}
                        {successModal.classes.length > 3 ? ` +${successModal.classes.length - 3} more` : ""}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div className="bg-white rounded-xl px-3 py-3 flex items-start gap-3 shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                  <i className="fi flex items-center justify-center fi-rr-calendar w-4 h-4 text-violet-500 mt-0.5 shrink-0"></i>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold mb-0.5">Date</p>
                    <p className="text-sm text-slate-900 font-bold">
                      {new Date(successModal.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>

                {/* Duration */}
                <div className="bg-white rounded-xl px-3 py-3 flex items-start gap-3 shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                  <i className="fi flex items-center justify-center fi-rr-time-fast w-4 h-4 text-amber-500 mt-0.5 shrink-0"></i>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold mb-0.5">Duration</p>
                    <p className="text-sm text-slate-900 font-bold">{successModal.duration}</p>
                  </div>
                </div>

                {/* Time Slot */}
                <div className="bg-white rounded-xl px-3 py-3 flex items-start gap-3 shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                  <i className="fi flex items-center justify-center fi-rr-clock w-4 h-4 text-cyan-500 mt-0.5 shrink-0"></i>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold mb-0.5">Time Slot</p>
                    <p className="text-sm text-slate-900 font-bold">{successModal.timeSlot}</p>
                  </div>
                </div>

                {/* Total Marks */}
                <div className="bg-white rounded-xl px-3 py-3 flex items-start gap-3 shadow-[0_8px_16px_rgba(0,0,0,0.2)]">
                  <i className="fi flex items-center justify-center fi-rr-award w-4 h-4 text-rose-500 mt-0.5 shrink-0"></i>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold mb-0.5">Total Marks</p>
                    <p className="text-sm text-slate-900 font-bold">{successModal.totalMarks}</p>
                  </div>
                </div>
              </div>

              {/* Done button */}
              <button
                onClick={() => setSuccessModal(null)}
                className="w-full mt-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm transition-all shadow-[0_0_20px_#10b98140] flex items-center justify-center gap-2"
              >
                <i className="fi flex items-center justify-center fi-rr-check-circle text-base w-4 h-4"></i>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Counter Section */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.15)] hover:-translate-y-1 border border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-2xl shadow-inner">
            <i className="fi flex items-center justify-center fi-rr-document text-lg w-5 h-5"></i>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Total Exams</div>
            <div className="text-xl font-black mt-0.5">{totalExams}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.15)] hover:-translate-y-1 border border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-900/20 dark:to-sky-800/10 border border-sky-100 dark:border-sky-800 text-sky-600 dark:text-sky-400 rounded-2xl shadow-inner">
            <i className="fi flex items-center justify-center fi-rr-clock text-lg w-5 h-5"></i>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Scheduled</div>
            <div className="text-xl font-black mt-0.5">{scheduledCount}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.15)] hover:-translate-y-1 border border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 border border-amber-100 dark:border-amber-800 text-amber-600 dark:text-amber-400 rounded-2xl shadow-inner relative">
            <i className="fi flex items-center justify-center fi-rr-play text-lg w-5 h-5"></i>
            {inProgressCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">In Progress</div>
            <div className="text-xl font-black mt-0.5">{inProgressCount}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.15)] hover:-translate-y-1 border border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-inner">
            <i className="fi flex items-center justify-center fi-rr-check-circle text-lg w-5 h-5"></i>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Completed</div>
            <div className="text-xl font-black mt-0.5">{completedCount}</div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 col-span-2 lg:col-span-1 flex items-center gap-3 transition-all">
          <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400 rounded-2xl shadow-inner">
            <i className="fi flex items-center justify-center fi-rr-paper-plane text-lg w-5 h-5"></i>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Published</div>
            <div className="text-xl font-black mt-0.5">{publishedCount} / {totalExams}</div>
          </div>
        </div>
      </div>

      {/* Toolbar / Search & Filter Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <i className="fi flex items-center justify-center fi-rr-search text-base w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 transform -translate-y-1/2"></i>
          <input
            type="text"
            placeholder="Search exam name or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter Tab Group */}
          <div className="flex flex-wrap items-center bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl shadow-inner">
            {(["All", "Scheduled", "In Progress", "Completed"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  statusFilter === status
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Type Filter Dropdown */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl shadow-sm hover:border-blue-300 transition-colors">
            <i className="fi flex items-center justify-center fi-rr-tag w-3.5 h-3.5 text-slate-400"></i>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer w-full"
            >
              <option value="All">All Types</option>
              {EXAM_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Class Filter Dropdown */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl shadow-sm hover:border-blue-300 transition-colors">
            <i className="fi flex items-center justify-center fi-rr-filter w-3.5 h-3.5 text-slate-400"></i>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer w-full"
            >
              <option value="All">All Classes</option>
              {classSections.filter(c => c !== "All").map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6">
        {/* Exam schedules list */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 flex flex-col min-h-[400px] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fi flex items-center justify-center fi-rr-calendar text-lg w-5 h-5 text-blue-400"></i>
                Upcoming Examination Calendar
              </h2>
              <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-md">
                {filteredExams.length}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              
              <button 
                onClick={() => setIsInfoModalOpen(true)}
                className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <i className="fi flex items-center justify-center fi-rr-info text-base w-3.5 h-3.5"></i>
                Guidelines
              </button>
              <button 
                onClick={handleClearAll}
                disabled={exams.length === 0}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 ${
                  exams.length > 0 
                    ? "bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 shadow-sm cursor-pointer"
                    : "bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800 cursor-not-allowed"
                }`}
              >
                Clear All
              </button>

              <button 
                onClick={handlePublishAll}
                disabled={exams.length === 0}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  exams.length > 0
                    ? "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer"
                    : "bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800 cursor-not-allowed"
                }`}
              >
                <i className="fi flex items-center justify-center fi-rr-paper-plane w-3.5 h-3.5"></i>
                Publish All
              </button>
              
              <button 
                onClick={handleOpenCreate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
              >
                <i className="fi flex items-center justify-center fi-rr-plus text-base w-4 h-4"></i>
                Schedule Exam
              </button>
            </div>
          </div>

          {!isMounted ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-xs font-semibold text-slate-400">Loading exam database...</div>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
              <div className="p-4 bg-slate-900/40 rounded-full text-slate-500 border border-slate-800 mb-3">
                <i className="fi flex items-center justify-center fi-rr-info w-8 h-8"></i>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">No examinations scheduled</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Try modifying your search criteria or schedule a new exam session for this school portal.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full text-left border-collapse min-w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider">
                    <th className="p-4 align-middle whitespace-nowrap">Standard & Mode</th>
                    <th className="p-4 align-middle whitespace-nowrap">Exam Details</th>
                    <th className="p-4 align-middle whitespace-nowrap">Date & Time</th>
                    <th className="p-4 align-middle whitespace-nowrap">Room & Staff</th>
                    <th className="p-4 align-middle whitespace-nowrap">Status & Visibility</th>
                    <th className="p-4 align-middle text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredExams.map((ex) => (
                    <tr 
                      key={ex.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors text-xs text-slate-800 dark:text-slate-300 font-medium border-b border-slate-100 dark:border-slate-800/50 last:border-b-0"
                    >
                      {/* Standard & Mode */}
                      <td className="p-4 align-middle">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 rounded-md w-max">
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
                        <div className="space-y-1">
                          <div className="text-slate-900 dark:text-white font-extrabold text-sm leading-tight">{ex.subject}</div>
                          <div className="flex items-center gap-2 flex-wrap text-slate-500 text-xs font-semibold">
                            <span>{ex.name}</span>
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 border rounded uppercase ${getTypeBadgeStyle(ex.type)}`}>
                              {ex.type}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="p-4 align-middle whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-750 dark:text-slate-200 font-bold text-[13px]">
                            <i className="fi flex items-center justify-center fi-rr-calendar w-3.5 h-3.5 text-indigo-500"></i>
                            <span>{formatStudentFriendlyDate(ex.date)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
                            <i className="fi flex items-center justify-center fi-rr-clock w-3.5 h-3.5 text-amber-500"></i>
                            <span>{ex.timeSlot} <span className="text-slate-400 dark:text-slate-500">({ex.duration || "3 Hours"})</span></span>
                          </div>
                        </div>
                      </td>

                      {/* Room & Staff */}
                      <td className="p-4 align-middle">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400 font-bold">
                            <i className="fi flex items-center justify-center fi-rr-marker w-3.5 h-3.5 text-purple-500"></i>
                            <span>{ex.hall.split(" (")[0]}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                            <i className="fi flex items-center justify-center fi-rr-user-check w-3.5 h-3.5 text-emerald-600"></i>
                            <span>{ex.invigilator}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status & Visibility */}
                      <td className="p-4 align-middle">
                        <div className="flex flex-col gap-1.5">
                          {/* Status Badge */}
                          <span className={`px-2 py-0.5 text-[9px] font-black rounded-lg border uppercase tracking-wider text-center w-max ${
                            ex.status === "Scheduled"
                              ? "bg-blue-50 border-blue-200 text-blue-750"
                              : ex.status === "In Progress"
                              ? "bg-amber-50 border-amber-250 text-amber-800 font-extrabold shadow-sm"
                              : "bg-emerald-50 border-emerald-250 text-emerald-800"
                          }`}>
                            {ex.status}
                          </span>
                          
                          {/* Published Indicator */}
                          <button 
                            onClick={() => togglePublishExam(ex.id)}
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg flex items-center gap-1 border transition-all w-max cursor-pointer ${
                              ex.published
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {ex.published ? (
                              <><i className="fi flex items-center justify-center fi-rr-eye w-2.5 h-2.5 text-emerald-600"></i> Published</>
                            ) : (
                              <><i className="fi flex items-center justify-center fi-rr-eye-crossed w-2.5 h-2.5 text-slate-400"></i> Draft</>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {ex.status === "Scheduled" && (
                            <button
                              onClick={() => handleStartExam(ex.id)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                            >
                              <i className="fi flex items-center justify-center fi-rr-play w-2.5 h-2.5 fill-current"></i>
                              Start
                            </button>
                          )}

                          {ex.status === "In Progress" && (
                            <button
                              onClick={() => handleCompleteExam(ex.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                            >
                              <i className="fi flex items-center justify-center fi-rr-check w-2.5 h-2.5 stroke-[3]"></i>
                              Complete
                            </button>
                          )}

                          {ex.status === "Completed" && (
                            <button
                              onClick={() => handleRevertExamStatus(ex.id)}
                              title="Revert status"
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-xl transition-all cursor-pointer"
                            >
                              <i className="fi flex items-center justify-center fi-rr-refresh w-3.5 h-3.5"></i>
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEdit(ex)}
                            title="Edit details"
                            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 rounded-xl transition-all cursor-pointer"
                          >
                            <i className="fi flex items-center justify-center fi-rr-edit w-3.5 h-3.5"></i>
                          </button>

                          <button
                            onClick={() => handleDeleteExam(ex.id)}
                            title="Delete schedule"
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-all cursor-pointer"
                          >
                            <i className="fi flex items-center justify-center fi-rr-trash w-3.5 h-3.5"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        
      </div>

      
      {/* ─── Info Modal ─────────────────────────────────────── */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleUp">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fi flex items-center justify-center fi-rr-info text-base w-4 h-4 text-blue-500"></i>
                Guidelines & Marks Pattern
              </h3>
              <button 
                onClick={() => setIsInfoModalOpen(false)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-900 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all"
              >
                <i className="fi flex items-center justify-center fi-rr-cross text-base w-4 h-4"></i>
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {/* Sidebar Guidelines */}
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
              <i className="fi flex items-center justify-center fi-rr-square-check text-lg w-5 h-5 text-blue-400"></i>
              Scheduling Conflict Checker
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Our ERP actively monitors invigilator bookings. When assigning teachers to exam halls:
            </p>
            <ul className="space-y-2.5 text-[11px] text-slate-400 font-semibold">
              <li className="flex items-start gap-2 bg-slate-950/40 p-2.5 border border-slate-850 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                <span>Prevents assigning a teacher to multiple rooms on the same date and time slot.</span>
              </li>
              <li className="flex items-start gap-2 bg-slate-950/40 p-2.5 border border-slate-850 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                <span>Unpublished exams remain in draft state, invisible to students and teachers.</span>
              </li>
              <li className="flex items-start gap-2 bg-slate-950/40 p-2.5 border border-slate-850 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                <span>Clicking <strong>"Publish All"</strong> releases drafts instantly to teacher invigilation duty registers and student hall tickets.</span>
              </li>
            </ul>
          </div>

          {/* Marks Legend */}
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-1.5">
              <i className="fi flex items-center justify-center fi-rr-award text-base w-4 h-4 text-amber-400"></i>
              TN Govt. Marks Pattern
            </h3>
            <ul className="space-y-2 text-[10px] text-slate-400 font-semibold">
              {[
                { mode: "Theory", desc: "Written paper only — e.g. 100 Marks" },
                { mode: "Practical", desc: "Lab/Viva only — e.g. 50 Marks" },
                { mode: "Both", desc: "Theory + Practical — e.g. 70 + 30 = 100" },
              ].map((item) => (
                <li key={item.mode} className="flex items-start gap-2 bg-slate-950/40 p-2 border border-slate-850 rounded-xl">
                  <span className={`font-black text-[9px] px-1.5 py-0.5 rounded border mt-0.5 ${getModeBadgeStyle(item.mode as ExamMode)}`}>
                    {item.mode}
                  </span>
                  <span>{item.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Create / Edit Exam Modal ─────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-scaleUp">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <i className="fi flex items-center justify-center fi-rr-calendar text-base w-4 h-4 text-blue-400"></i>
                {editingExam ? "Edit Examination Details" : "Schedule New Examination"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-all"
              >
                <i className="fi flex items-center justify-center fi-rr-cross text-base w-4 h-4"></i>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto custom-scrollbar">

              {/* ① Exam Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Exam Name / Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Model Exam – Term I (2026)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              {/* ② Exam Type + Class (side by side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Exam Type <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      setFormData({ ...formData, type: e.target.value });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="Unit Test">Unit Test</option>
                    <option value="Quarterly">Quarterly Exam</option>
                    <option value="Half-Yearly">Half-Yearly Exam</option>
                    <option value="Annual">Annual Exam</option>
                    <option value="Model">Model Exam</option>
                    <option value="Public">Public Exam</option>
                  </select>
                </div>

                {/* Class Dropdown - shown in Edit mode */}
                {editingExam ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Class / Standard <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formData.classSection}
                      onChange={(e) => setFormData({ ...formData, classSection: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                    >
                      {CLASS_OPTIONS.map((cls) => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Subject <span className="text-rose-400">*</span></label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                    >
                      {SUBJECT_OPTIONS.map((subj) => (
                        <option key={subj} value={subj}>{subj}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* ③ Class Checkboxes - Create Mode only */}
              {!editingExam && (
                <div className="border-t border-slate-850 pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[11px] font-bold text-slate-450 uppercase tracking-wider">
                      Target Classes / Sections <span className="text-rose-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedClasses.length === CLASS_OPTIONS.length) {
                          setSelectedClasses([]);
                        } else {
                          setSelectedClasses([...CLASS_OPTIONS]);
                        }
                      }}
                      className="text-[10px] font-extrabold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {selectedClasses.length === CLASS_OPTIONS.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl max-h-[160px] overflow-y-auto custom-scrollbar">
                    {CLASS_OPTIONS.map((cls) => {
                      const isChecked = selectedClasses.includes(cls);
                      return (
                        <label 
                          key={cls} 
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold cursor-pointer transition-all ${
                            isChecked 
                              ? "bg-blue-600/10 border-blue-500/30 text-blue-300" 
                              : "bg-[var(--bg-card)] border-[var(--border-light)] text-[var(--text-muted)] hover:border-[var(--border)] hover:text-[var(--text-main)]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedClasses(selectedClasses.filter(c => c !== cls));
                              } else {
                                setSelectedClasses([...selectedClasses, cls]);
                              }
                            }}
                            className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-950 w-3.5 h-3.5"
                          />
                          <span className="whitespace-normal break-words">{cls}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ④ Subject (Edit mode) + Date + Duration */}
              {editingExam && (
                <div className="border-t border-slate-850 pt-3">
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Subject <span className="text-rose-400">*</span></label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                  >
                    {SUBJECT_OPTIONS.map((subj) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${!editingExam ? "border-t border-slate-850 pt-3" : ""}`}>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Exam Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                    <i className="fi flex items-center justify-center fi-rr-time-fast w-3 h-3"></i>
                    Duration
                  </label>
                  {/* Auto-calculated from Time Slot — read-only */}
                  <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-emerald-400 flex items-center gap-1.5 cursor-not-allowed select-none">
                    <i className="fi flex items-center justify-center fi-rr-time-fast w-3.5 h-3.5 text-emerald-500"></i>
                    {calcDurationFromSlot(formData.timeSlot)}
                    <span className="ml-auto text-[9px] text-slate-500 font-normal italic">auto</span>
                  </div>
                </div>
              </div>

              {/* ⑤ Exam Mode – Theory / Practical / Both */}
              <div className="border-t border-slate-850 pt-3">
                <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  Exam Mode <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Theory", "Practical", "Both"] as ExamMode[]).map((mode) => {
                    const activeClass = editingExam ? formData.classSection : (selectedClasses[0] || "Class 10 (All)");
                    const { allowPractical } = getFormMarksConfig(formData.subject, activeClass);
                    
                    if (!allowPractical && mode !== "Theory") {
                      return null;
                    }
                    
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            examMode: mode,
                            // Auto-reset unused marks
                            theoryMaxMarks: mode === "Practical" ? 0 : formData.theoryMaxMarks || 100,
                            practicalMaxMarks: mode === "Theory" ? 0 : formData.practicalMaxMarks || 50,
                          });
                        }}
                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-[10px] font-bold transition-all ${
                          formData.examMode === mode
                            ? mode === "Theory"
                              ? "bg-slate-500 border-slate-600 text-white shadow-sm"
                              : mode === "Practical"
                              ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                              : "bg-amber-600/20 border-amber-500/50 text-amber-300"
                            : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
                        }`}
                      >
                        {mode === "Theory" && <BookOpen className="w-4 h-4" />}
                        {mode === "Practical" && <FlaskConical className="w-4 h-4" />}
                        {mode === "Both" && <Layers className="w-4 h-4" />}
                        {mode}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ⑥ Max Marks — Theory & Practical (conditional) */}
              <div className={`grid gap-4 ${showTheory && showPractical ? "grid-cols-2" : "grid-cols-1"}`}>
                {showTheory && (
                  <div>
                    <label className="block text-[11px] font-bold text-blue-400/80 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                      <i className="fi flex items-center justify-center fi-rr-book-open w-3 h-3"></i>
                      Theory Max Marks <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      readOnly
                      required={showTheory}
                      value={formData.theoryMaxMarks}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-400 focus:outline-none cursor-not-allowed"
                    />
                  </div>
                )}

                {showPractical && (
                  <div>
                    <label className="block text-[11px] font-bold text-violet-400/80 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                      <i className="fi flex items-center justify-center fi-rr-flask w-3 h-3"></i>
                      Practical Max Marks <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      readOnly
                      required={showPractical}
                      value={formData.practicalMaxMarks}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-400 focus:outline-none cursor-not-allowed"
                    />
                  </div>
                )}
              </div>

              {/* Total marks preview pill */}
              <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold ${
                formData.examMode === "Both"
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                  : formData.examMode === "Practical"
                  ? "bg-violet-500/10 border-violet-500/20 text-violet-300"
                  : "bg-blue-500/10 border-blue-500/20 text-blue-300"
              }`}>
                <i className="fi flex items-center justify-center fi-rr-award text-base w-4 h-4"></i>
                <span>
                  Total Marks:&nbsp;
                  <strong>
                    {formData.examMode === "Both"
                      ? `${formData.theoryMaxMarks} (T) + ${formData.practicalMaxMarks} (P) = ${formData.theoryMaxMarks + formData.practicalMaxMarks}`
                      : formData.examMode === "Theory"
                      ? formData.theoryMaxMarks
                      : formData.practicalMaxMarks}
                  </strong>
                </span>
              </div>

              {/* ⑦ Time Slot + Hall + Invigilator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-850 pt-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Time Slot
                  </label>
                  <select
                    value={formData.timeSlot}
                    onChange={(e) => {
                      const slot = e.target.value;
                      // Auto-sync duration whenever the time slot changes
                      setFormData({ ...formData, timeSlot: slot, duration: calcDurationFromSlot(slot) });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                  >
                    {TIME_SLOTS.map((ts) => (
                      <option key={ts} value={ts}>
                        {ts} — {calcDurationFromSlot(ts)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Exam Hall
                  </label>
                  <select
                    value={formData.hall}
                    onChange={(e) => {
                      setFormData({ ...formData, hall: e.target.value });
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                  >
                    {HALL_OPTIONS.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Invigilator
                  </label>
                  <select
                    value={formData.invigilator}
                    onChange={(e) => setFormData({ ...formData, invigilator: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                  >
                    {teachers.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ⑧ Publish Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 text-base w-4 h-4 cursor-pointer"
                />
                <label htmlFor="published" className="text-xs font-bold text-slate-300 cursor-pointer select-none">
                  Publish immediately (Makes it visible to teachers and students)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-500/10 flex items-center gap-2"
                >
                  <i className="fi flex items-center justify-center fi-rr-check-circle text-base w-4 h-4"></i>
                  {editingExam ? "Save Changes" : "Schedule Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <i className="fi flex items-center justify-center fi-rr-info text-base w-4 h-4 text-rose-500"></i>
                Clear All Exam Schedules
              </h3>
              <button 
                onClick={() => setIsClearConfirmOpen(false)}
                className="p-1 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-all"
              >
                <i className="fi flex items-center justify-center fi-rr-cross text-base w-4 h-4"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                Are you sure you want to delete all scheduled exams and start fresh? This action cannot be undone.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-900/20 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-xl text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeClearAll}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-rose-500/10 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
    </>
  );
}
