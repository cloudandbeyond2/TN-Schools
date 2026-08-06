"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import PortalLayout from "@/components/PortalLayout";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import Swal from "sweetalert2";
import {
  TrendingUp,
  Award,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  X,
  BookOpen,
  GraduationCap,
  Sparkles,
  BarChart2,
  Calendar,
  Layers,
  ChevronRight,
  UserCheck,
  Plus,
  Trash2,
  Edit3,
  Save,
  RefreshCw
} from "lucide-react";

interface SubjectMark {
  id?: string;
  name: string;
  score: number;
  maxScore: number;
  grade: string;
  examType?: string;
}

interface StudentProgress {
  id: string;
  userId: string;
  name: string;
  emisNumber: string;
  class: string;
  section: string;
  rollNumber?: string;
  attendancePct: number;
  overallScore: number;
  homeworkCompletionPct: number;
  assessmentsCompleted: number;
  totalAssessments: number;
  subjects: SubjectMark[];
  remarks: string;
  status: "Excellent" | "On Track" | "Needs Attention";
}

interface ClassRoom {
  id: string;
  className: string;
  section: string;
  subject: string;
  totalStudents: number;
}

interface DbMark {
  id: string;
  studentId: string;
  subject: string;
  examType: string;
  maxMarks: number;
  scored: number;
  grade?: string;
  academicYear?: string;
}

const SUBJECT_LIST = [
  "Mathematics",
  "Science",
  "Social Science",
  "English",
  "Tamil",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
];

const EXAM_TYPES = [
  "Quarterly Exam",
  "Half-Yearly Exam",
  "Annual Exam",
  "Mid-Term Test",
  "Unit Test 1",
  "Unit Test 2",
];

function TeacherProgressContent() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const classFromQuery = searchParams.get("class") || "ALL";
  const schoolId = (session?.user as any)?.schoolId;
  const teacherId = (session?.user as any)?.id;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>(classFromQuery);
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [rawStudentsList, setRawStudentsList] = useState<any[]>([]);
  const [dbMarks, setDbMarks] = useState<DbMark[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);

  const [teacherNote, setTeacherNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Mark Entry Modal State
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [entryClass, setEntryClass] = useState<string>("10-A");
  const [entrySubject, setEntrySubject] = useState<string>("Mathematics");
  const [entryExamType, setEntryExamType] = useState<string>("Quarterly Exam");
  const [entryMaxMarks, setEntryMaxMarks] = useState<number>(100);
  const [markSheetScores, setMarkSheetScores] = useState<Record<string, { scored: number | ""; markId?: string }>>({});
  const [savingBulk, setSavingBulk] = useState(false);

  function getGrade(score: number, maxScore: number = 100): string {
    const pct = (score / (maxScore || 100)) * 100;
    if (pct >= 90) return "A1";
    if (pct >= 80) return "A2";
    if (pct >= 70) return "B1";
    if (pct >= 60) return "B2";
    if (pct >= 50) return "C1";
    if (pct >= 35) return "D";
    return "E";
  }

  // Fetch teacher classes, students & PostgreSQL database marks
  const fetchData = useCallback(async () => {
    if (!schoolId) return;
    try {
      setLoading(true);

      // 1. Fetch teacher's assigned classes
      let activeClasses: ClassRoom[] = [];
      if (teacherId) {
        const classRes = await fetch(`${API_URL}/api/classes?schoolId=${schoolId}&teacherId=${teacherId}`);
        const classData = await classRes.json();
        if (classData.success && Array.isArray(classData.data)) {
          activeClasses = classData.data;
          setClasses(activeClasses);
        }
      }

      // 2. Fetch students for the school
      const studentRes = await fetch(`${API_URL}/api/students?schoolId=${schoolId}`);
      const studentData = await studentRes.json();

      // 3. Fetch real PostgreSQL marks for all students in school
      const marksRes = await fetch(`${API_URL}/api/students/marks/class-wise?schoolId=${schoolId}`);
      const marksData = await marksRes.json();
      const fetchedDbMarks: DbMark[] = marksData.success && Array.isArray(marksData.data) ? marksData.data : [];
      setDbMarks(fetchedDbMarks);

      if (studentData.success && Array.isArray(studentData.data)) {
        const rawStudents = studentData.data;
        setRawStudentsList(rawStudents);

        let filteredByTeacher = rawStudents;
        if (activeClasses.length > 0) {
          filteredByTeacher = rawStudents.filter((st: any) =>
            activeClasses.some(
              (c) => String(c.className) === String(st.class) && String(c.section) === String(st.section)
            )
          );
        }

        // Format student progress records with PostgreSQL marks merged (no fake default mock subjects)
        const formatted: StudentProgress[] = filteredByTeacher.map((st: any, index: number) => {
          const seed = (st.id || "100").charCodeAt(0) + index * 7;

          // Find student's real marks in PostgreSQL database
          const studentDbMarks = fetchedDbMarks.filter((m) => m.studentId === st.id);

          // Find teacher's taught subject for this student's class
          const studentClassRecord = activeClasses.find(
            (c) => String(c.className) === String(st.class) && String(c.section) === String(st.section)
          );
          const classTaughtSubject = studentClassRecord?.subject || null;

          const subjectsList: SubjectMark[] = [];

          // Add all real marks stored in PostgreSQL for this student
          studentDbMarks.forEach((m) => {
            subjectsList.push({
              id: m.id,
              name: m.subject,
              score: m.scored,
              maxScore: m.maxMarks,
              grade: m.grade || getGrade(m.scored, m.maxMarks),
              examType: m.examType,
            });
          });

          // If the class has a taught subject (e.g. "Mathematics" for 11-B) and no DB mark exists for it yet,
          // add it as the primary subject entry waiting for mark entry
          if (
            classTaughtSubject &&
            !subjectsList.some((s) => s.name.toLowerCase() === classTaughtSubject.toLowerCase())
          ) {
            subjectsList.unshift({
              name: classTaughtSubject,
              score: 0,
              maxScore: 100,
              grade: "E",
            });
          }

          // Calculate overall score based only on real/taught subjects
          const validSubjects = subjectsList.filter((s) => s.id || s.score > 0);
          const totalScoreSum = validSubjects.reduce((acc, s) => acc + (s.score / s.maxScore) * 100, 0);
          const overallScore =
            validSubjects.length > 0
              ? Math.round(totalScoreSum / validSubjects.length)
              : subjectsList.length > 0 && subjectsList[0].score > 0
                ? Math.round((subjectsList[0].score / subjectsList[0].maxScore) * 100)
                : 0;

          const attendancePct = st.attendancePct !== undefined ? st.attendancePct : 0;
          const homeworkPct = st.homeworkPct !== undefined ? st.homeworkPct : 0;

          let status: StudentProgress["status"] = "On Track";
          if (overallScore >= 80) status = "Excellent";
          else if (overallScore > 0 && overallScore < 60) status = "Needs Attention";

          return {
            id: st.id,
            userId: st.userId,
            name: st.user?.name || `Student ${index + 1}`,
            emisNumber: st.emisNumber || st.user?.emisId || "",
            class: st.class || "",
            section: st.section || "",
            rollNumber: st.rollNumber || "",
            attendancePct,
            overallScore,
            homeworkCompletionPct: homeworkPct,
            assessmentsCompleted: studentDbMarks.length,
            totalAssessments: 10,
            subjects: subjectsList,
            remarks: st.remarks || "",
            status,
          };
        });

        setStudents(formatted);
      }
    } catch (err) {
      console.error("Failed to load progress data", err);
    } finally {
      setLoading(false);
    }
  }, [schoolId, teacherId, API_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Unique class options strictly from teacher's assigned PostgreSQL classes
  const classOptions = useMemo(() => {
    const set = new Set<string>();
    if (classes.length > 0) {
      classes.forEach((c) => {
        if (c.className && c.section) set.add(`${c.className}-${c.section}`);
      });
    } else {
      rawStudentsList.forEach((s) => {
        if (s.class && s.section) set.add(`${s.class}-${s.section}`);
      });
    }
    return Array.from(set).sort((a, b) => {
      const [clsA, secA] = a.split("-");
      const [clsB, secB] = b.split("-");
      const numA = parseInt(clsA) || 0;
      const numB = parseInt(clsB) || 0;
      if (numA !== numB) return numA - numB;
      return secA.localeCompare(secB);
    });
  }, [classes, rawStudentsList]);

  // Unique subjects taught by teacher across assigned classes
  const teacherSubjectOptions = useMemo(() => {
    const set = new Set<string>();
    classes.forEach((c) => {
      if (c.subject) set.add(c.subject);
    });
    if (set.size === 0) {
      SUBJECT_LIST.forEach((s) => set.add(s));
    }
    return Array.from(set).sort();
  }, [classes]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedClassFilter !== "ALL") {
        const [cls, sec] = selectedClassFilter.split("-");
        if (s.class !== cls || s.section !== sec) return false;
      }
      if (selectedTierFilter === "EXCELLENT" && s.status !== "Excellent") return false;
      if (selectedTierFilter === "ON_TRACK" && s.status !== "On Track") return false;
      if (selectedTierFilter === "NEEDS_ATTENTION" && s.status !== "Needs Attention") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.emisNumber.toLowerCase().includes(q) ||
          `${s.class}${s.section}`.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [students, selectedClassFilter, selectedTierFilter, searchQuery]);

  // Stats calculation
  const totalStudents = filteredStudents.length;
  const avgProgress = totalStudents > 0 ? Math.round(filteredStudents.reduce((acc, s) => acc + s.overallScore, 0) / totalStudents) : 0;
  const avgAttendance = totalStudents > 0 ? Math.round(filteredStudents.reduce((acc, s) => acc + s.attendancePct, 0) / totalStudents) : 0;
  const excellentCount = filteredStudents.filter((s) => s.status === "Excellent").length;
  const needsAttentionCount = filteredStudents.filter((s) => s.status === "Needs Attention").length;

  // Open Mark Entry Modal & Populate Students for Class
  const handleOpenMarkModal = () => {
    const targetClassString = selectedClassFilter !== "ALL" ? selectedClassFilter : classOptions[0] || "";
    if (!targetClassString) return;

    setEntryClass(targetClassString);
    const matchedClass = classes.find(
      (c) => `${c.className}-${c.section}` === targetClassString
    );
    const targetSub = matchedClass?.subject || teacherSubjectOptions[0] || "Mathematics";
    setEntrySubject(targetSub);

    populateMarkSheet(targetClassString, targetSub, entryExamType);
    setIsMarkModalOpen(true);
  };

  const populateMarkSheet = (classStr: string, subjectName: string, examTypeStr: string) => {
    const [cls, sec] = classStr.split("-");
    const classStudents = rawStudentsList.filter(
      (st) => String(st.class) === String(cls) && String(st.section) === String(sec)
    );

    const scoresMap: Record<string, { scored: number | ""; markId?: string }> = {};

    classStudents.forEach((st) => {
      // Find existing DB mark for this student, subject, and examType
      const existing = dbMarks.find(
        (m) =>
          m.studentId === st.id &&
          m.subject.toLowerCase() === subjectName.toLowerCase() &&
          (!examTypeStr || m.examType === examTypeStr)
      );

      if (existing) {
        scoresMap[st.id] = { scored: existing.scored, markId: existing.id };
      } else {
        scoresMap[st.id] = { scored: "" };
      }
    });

    setMarkSheetScores(scoresMap);
  };

  // Change class / subject inside Mark Modal
  const handleEntryClassChange = (newClass: string) => {
    setEntryClass(newClass);
    const matchedClass = classes.find(
      (c) => `${c.className}-${c.section}` === newClass
    );
    const targetSub = matchedClass?.subject || entrySubject;
    setEntrySubject(targetSub);
    populateMarkSheet(newClass, targetSub, entryExamType);
  };

  const handleEntrySubjectChange = (newSubject: string) => {
    setEntrySubject(newSubject);
    populateMarkSheet(entryClass, newSubject, entryExamType);
  };

  const handleEntryExamTypeChange = (newExam: string) => {
    setEntryExamType(newExam);
    populateMarkSheet(entryClass, entrySubject, newExam);
  };

  // Save Bulk Marks to PostgreSQL Database
  const handleSaveBulkMarks = async () => {
    const [cls, sec] = entryClass.split("-");
    const classStudents = rawStudentsList.filter(
      (st) => String(st.class) === String(cls) && String(st.section) === String(sec)
    );

    const marksToSubmit = [];

    for (const st of classStudents) {
      const entry = markSheetScores[st.id];
      if (entry && entry.scored !== "" && entry.scored !== undefined) {
        marksToSubmit.push({
          id: entry.markId,
          studentId: st.id,
          scored: Number(entry.scored),
          maxMarks: entryMaxMarks,
        });
      }
    }

    if (marksToSubmit.length === 0) {
      Swal.fire({
        icon: "warning",
        title: lang === "தமிழ்" ? "மதிப்பெண்கள் உள்ளிடப்படவில்லை" : "No Marks Entered",
        text: lang === "தமிழ்" ? "குறைந்தது ஒரு மாணவருக்கு மதிப்பெண் உள்ளிடவும்." : "Please enter marks for at least one student.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    try {
      setSavingBulk(true);
      const res = await fetch(`${API_URL}/api/students/marks/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: entrySubject,
          examType: entryExamType,
          maxMarks: entryMaxMarks,
          academicYear: "2024-25",
          teacherId,
          marks: marksToSubmit,
        }),
      });

      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: lang === "தமிழ்" ? "தரவுத்தளத்தில் சேமிக்கப்பட்டது!" : "Saved to Datas!",
          text: data.message || `${marksToSubmit.length} student marks saved successfully.`,
          timer: 2000,
          showConfirmButton: false,
        });
        setIsMarkModalOpen(false);
        fetchData();
      } else {
        Swal.fire({
          icon: "error",
          title: "Database Error",
          text: data.error || "Failed to save marks to Data.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Could not connect to backend server.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSavingBulk(false);
    }
  };

  // Delete a specific Mark from PostgreSQL
  const handleDeleteMark = async (markId: string, subjectName: string) => {
    const confirm = await Swal.fire({
      title: lang === "தமிழ்" ? "மதிப்பெண்ணை நீக்கவா?" : "Delete Mark Record?",
      html: `You are about to delete the <strong>${subjectName}</strong> mark entry from  database.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/students/marks/${markId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: data.message,
          timer: 1800,
          showConfirmButton: false,
        });
        if (selectedStudent) {
          setSelectedStudent((prev) =>
            prev ? { ...prev, subjects: prev.subjects.filter((s) => s.id !== markId) } : null
          );
        }
        fetchData();
      } else {
        Swal.fire({ icon: "error", title: "Error", text: data.error });
      }
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Network error" });
    }
  };

  // Save a single subject mark for a student to PostgreSQL database
  const handleSaveSingleSubjectMark = async (
    studentId: string,
    subjectName: string,
    scoreVal: number,
    maxScoreVal: number = 100
  ) => {
    try {
      const res = await fetch(`${API_URL}/api/students/${studentId}/marks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subjectName,
          scored: Number(scoreVal),
          maxMarks: Number(maxScoreVal),
          examType: "Quarterly Exam",
          teacherId,
          academicYear: "2024-25",
        }),
      });

      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: lang === "தமிழ்" ? "தரவுத்தளத்தில் சேமிக்கப்பட்டது!" : "Saved to Data!",
          text: data.message || `${subjectName} mark (${scoreVal}/${maxScoreVal}) saved successfully to database.`,
          timer: 1800,
          showConfirmButton: false,
        });

        const updatedGrade = getGrade(scoreVal, maxScoreVal);
        if (selectedStudent) {
          const updatedSubjects = selectedStudent.subjects.map((sub) =>
            sub.name === subjectName
              ? { ...sub, id: data.data?.id || sub.id, score: Number(scoreVal), grade: updatedGrade }
              : sub
          );
          const newSum = updatedSubjects.reduce((acc, s) => acc + (s.score / s.maxScore) * 100, 0);
          const newAvg = Math.round(newSum / updatedSubjects.length);

          setSelectedStudent((prev) =>
            prev ? { ...prev, subjects: updatedSubjects, overallScore: newAvg } : null
          );
        }

        fetchData();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Failed to save mark to database.",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Could not connect to backend server.",
      });
    }
  };

  const handleOpenStudentModal = (student: StudentProgress) => {
    setSelectedStudent(student);
    setTeacherNote(student.remarks);
  };

  const handleSaveNote = async () => {
    if (!selectedStudent) return;
    try {
      setSavingNote(true);

      // Save all subject marks for this student to PostgreSQL
      for (const sub of selectedStudent.subjects) {
        if (sub.score !== undefined && sub.score !== null) {
          await fetch(`${API_URL}/api/students/${selectedStudent.id}/marks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subject: sub.name,
              scored: Number(sub.score),
              maxMarks: Number(sub.maxScore || 100),
              examType: sub.examType || "Quarterly Exam",
              teacherId,
              academicYear: "2024-25",
            }),
          });
        }
      }

      // Update local state and close popup modal on success
      setStudents((prev) =>
        prev.map((st) => (st.id === selectedStudent.id ? { ...st, remarks: teacherNote } : st))
      );
      setSelectedStudent(null);

      Swal.fire({
        icon: "success",
        title: lang === "தமிழ்" ? "தரவுத்தளத்தில் சேமிக்கப்பட்டது!" : "Saved to Data!",
        text:
          lang === "தமிழ்"
            ? "மதிப்பெண்கள் மற்றும் ஆசிரியர் குறிப்பு தரவுத்தளத்தில் சேமிக்கப்பட்டது."
            : "Subject marks and teacher evaluation remarks saved to database.",
        timer: 2000,
        showConfirmButton: false,
      });

      fetchData();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Could not save progress to backend server.",
      });
    } finally {
      setSavingNote(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <PortalLayout>
      <div className="p-4 md:p-6 space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 rounded-2xl border border-amber-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
                <BarChart2 className="w-6 h-6" />
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-heading)]">
                {lang === "தமிழ்" ? "வகுப்பு & பாடம் மதிப்பெண் பதிவேடு" : "Class & Subject Mark Entry Dashboard"}
              </h1>
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {lang === "தமிழ்"
                ? "Data தரவுத்தளத்துடன் இணைக்கப்பட்ட வகுப்பு மற்றும் பாடம் வாரியான மதிப்பெண் பதிவேடு."
                : "Data-backed real-time class & subject mark entry, editing, and progress cards."}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleOpenMarkModal}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-extrabold text-xs transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {lang === "தமிழ்" ? "+ மதிப்பெண் பதிவு செய்" : "+ Enter / Manage Subject Marks"}
            </button>

            <button
              onClick={fetchData}
              className="p-2.5 bg-[var(--bg-card)] hover:bg-[var(--border)] text-[var(--text-heading)] rounded-xl border border-[var(--border)] transition-all"
              title="Refresh DB Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            {
              title: lang === "தமிழ்" ? "மொத்த மாணவர்கள்" : "TOTAL STUDENTS",
              value: `${totalStudents}`,
              subtitle: selectedClassFilter === "ALL" ? (lang === "தமிழ்" ? "அனைத்து வகுப்புகள்" : "All Classes") : `Class ${selectedClassFilter}`,
              icon: Users,
              color: "text-blue-500",
              bg: "bg-blue-500/10 border-blue-500/20",
            },
            {
              title: lang === "தமிழ்" ? "சராசரி முன்னேற்றம்" : "AVG PROGRESS",
              value: `${avgProgress}%`,
              subtitle: lang === "தமிழ்" ? "கற்றல் அடைவு சதவீதம்" : "Overall class average",
              icon: TrendingUp,
              color: "text-amber-500",
              bg: "bg-amber-500/10 border-amber-500/20",
            },
            {
              title: lang === "தமிழ்" ? "சராசரி வருகை" : "AVG ATTENDANCE",
              value: `${avgAttendance}%`,
              subtitle: lang === "தமிழ்" ? "வருகை சதவீதம்" : "Class presence rate",
              icon: Calendar,
              color: "text-emerald-500",
              bg: "bg-emerald-500/10 border-emerald-500/20",
            },
            {
              title: lang === "தமிழ்" ? "சிறந்த மாணவர்கள்" : "HIGH PERFORMERS",
              value: `${excellentCount}`,
              subtitle: lang === "தமிழ்" ? "80%க்கும் மேல் பெற்றோர்" : "Score ≥ 80%",
              icon: Award,
              color: "text-purple-500",
              bg: "bg-purple-500/10 border-purple-500/20",
            },
            {
              title: lang === "தமிழ்" ? "கவனம் தேவைப்படுவோர்" : "NEEDS ATTENTION",
              value: `${needsAttentionCount}`,
              subtitle: lang === "தமிழ்" ? "கூடுதல் பயிற்சி தேவை" : "Score < 60%",
              icon: AlertTriangle,
              color: "text-rose-500",
              bg: "bg-rose-500/10 border-rose-500/20",
            },
          ].map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div key={idx} className={`p-4 rounded-2xl border ${item.bg} bg-[var(--bg-card)] shadow-sm space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">
                    {item.title}
                  </span>
                  <IconComponent className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
                <div className="text-[11px] text-[var(--text-muted)] truncate">{item.subtitle}</div>
              </div>
            );
          })}
        </div>

        {/* Filters & Search */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Left: Class Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <div className="flex items-center gap-2 bg-[var(--bg-main)] px-3 py-2 rounded-xl border border-[var(--border)]">
              <Layers className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase text-[var(--text-muted)]">
                {lang === "தமிழ்" ? "வகுப்பு:" : "Class:"}
              </span>
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="bg-transparent text-sm font-semibold text-[var(--text-heading)] focus:outline-none cursor-pointer"
              >
                <option value="ALL">{lang === "தமிழ்" ? "அனைத்து வகுப்புகள்" : "All Assigned Classes"}</option>
                {classOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    Class {opt.replace("-", " Section ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Tier Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {[
                { key: "ALL", label: lang === "தமிழ்" ? "அனைத்தும்" : "All" },
                { key: "EXCELLENT", label: lang === "தமிழ்" ? "சிறந்தது (≥80%)" : "Excellent (≥80%)" },
                { key: "ON_TRACK", label: lang === "தமிழ்" ? "சீரானது (60-79%)" : "On Track (60-79%)" },
                { key: "NEEDS_ATTENTION", label: lang === "தமிழ்" ? "கவனம் தேவை (<60%)" : "Needs Help (<60%)" },
              ].map((tier) => (
                <button
                  key={tier.key}
                  onClick={() => setSelectedTierFilter(tier.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${selectedTierFilter === tier.key
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-heading)] border border-[var(--border)]"
                    }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder={lang === "தமிழ்" ? "பெயர் / EMIS மூலம் தேடு..." : "Search student or EMIS..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-main)] text-sm text-[var(--text-heading)] pl-9 pr-4 py-2 rounded-xl border border-[var(--border)] focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Student Progress Cards Grid */}
        {loading ? (
          <div className="text-center py-16 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent mb-3" />
            <p className="text-sm text-[var(--text-muted)]">
              {lang === "தமிழ்" ? "தரவுத்தளத்திலிருந்து மதிப்பெண்கள் ஏற்றப்படுகின்றன..." : "Loading Data student marks..."}
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-16 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] space-y-3">
            <GraduationCap className="w-12 h-12 text-[var(--text-muted)] mx-auto" />
            <h3 className="text-lg font-bold text-[var(--text-heading)]">
              {lang === "தமிழ்" ? "மாணவர்கள் கண்டறியப்படவில்லை" : "No Students Found"}
            </h3>
            <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">
              {lang === "தமிழ்"
                ? "தேர்ந்தெடுக்கப்பட்ட வடிகட்டி அல்லது வகுப்பிற்கு ஏற்ற மாணவர்கள் இல்லை."
                : "No student records match your selected class filter or search criteria."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStudents.map((st) => {
              const statusColor =
                st.status === "Excellent"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : st.status === "On Track"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";

              const progressBg =
                st.overallScore >= 80 ? "bg-emerald-500" : st.overallScore >= 60 ? "bg-amber-500" : "bg-rose-500";

              return (
                <div
                  key={st.id}
                  className="bg-[var(--bg-card)] border border-[var(--border)] hover:border-amber-500/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white font-extrabold flex items-center justify-center text-base shadow-sm">
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-[var(--text-heading)] text-base group-hover:text-amber-500 transition-colors">
                            {st.name}
                          </h3>
                          <p className="text-xs text-[var(--text-muted)]">
                            Class {st.class}-{st.section} • Roll No: #{st.rollNumber}
                          </p>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${statusColor}`}>
                        {st.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-[var(--text-muted)]">
                          {lang === "தமிழ்" ? "மொத்த அடைவு" : "Overall Achievement"}
                        </span>
                        <span className="font-bold text-[var(--text-heading)]">{st.overallScore}%</span>
                      </div>
                      <div className="w-full bg-[var(--bg-main)] h-2.5 rounded-full overflow-hidden border border-[var(--border)]">
                        <div
                          className={`h-full ${progressBg} transition-all duration-500 rounded-full`}
                          style={{ width: `${st.overallScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[var(--border)] text-xs">
                      <div className="bg-[var(--bg-main)] p-2.5 rounded-xl border border-[var(--border)]">
                        <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">
                          {lang === "தமிழ்" ? "வருகை" : "Attendance"}
                        </span>
                        <span className="font-bold text-[var(--text-heading)] text-sm">{st.attendancePct}%</span>
                      </div>
                      <div className="bg-[var(--bg-main)] p-2.5 rounded-xl border border-[var(--border)]">
                        <span className="text-[var(--text-muted)] block text-[10px] uppercase font-semibold">
                          {lang === "தமிழ்" ? "வீட்டுப்பாடம்" : "Homework"}
                        </span>
                        <span className="font-bold text-[var(--text-heading)] text-sm">
                          {st.homeworkCompletionPct}%
                        </span>
                      </div>
                    </div>

                    {/* Subject Pills Snippet */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {st.subjects.slice(0, 4).map((sub) => (
                        <span
                          key={sub.name}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border ${sub.id
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                            : "bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border)]"
                            }`}
                          title={sub.id ? "Stored in Data" : "Default estimate"}
                        >
                          {sub.name}: <strong className="text-[var(--text-heading)]">{sub.score}</strong>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Action */}
                  <button
                    onClick={() => handleOpenStudentModal(st)}
                    className="w-full py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-white rounded-xl font-bold text-xs border border-amber-500/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    {lang === "தமிழ்" ? "முன்னேற்ற அறிக்கை காண்க" : "View Detailed Progress Card"}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* PostgreSQL Class & Subject Mark Entry Modal */}
        {isMarkModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    {lang === "தமிழ்" ? "வகுப்பு & பாடம் மதிப்பெண் பதிவேடு" : "Enter Class & Subject Marks (Data)"}
                  </h2>
                  <p className="text-xs text-amber-100 mt-1">
                    {lang === "தமிழ்"
                      ? "தேர்ந்தெடுக்கப்பட்ட வகுப்பு மற்றும் பாடத்திற்கான மதிப்பெண்களை தரவுத்தளத்தில் பதிவு செய்க."
                      : "Enter or update student marks directly stored in Data backend database."}
                  </p>
                </div>
                <button
                  onClick={() => setIsMarkModalOpen(false)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full !text-black transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Controls */}
              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border)]">
                  {/* Select Class */}
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">
                      {lang === "தமிழ்" ? "வகுப்பு" : "Class & Section"}
                    </label>
                    <select
                      value={entryClass}
                      onChange={(e) => handleEntryClassChange(e.target.value)}
                      className="w-full bg-[var(--bg-card)] text-xs font-bold text-[var(--text-heading)] p-2.5 rounded-xl border border-[var(--border)] focus:outline-none focus:border-amber-500"
                    >
                      {classOptions.map((c) => (
                        <option key={c} value={c}>
                          Class {c.replace("-", " Sec ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Subject */}
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">
                      {lang === "தமிழ்" ? "பாடம்" : "Subject"}
                    </label>
                    <select
                      value={entrySubject}
                      onChange={(e) => handleEntrySubjectChange(e.target.value)}
                      className="w-full bg-[var(--bg-card)] text-xs font-bold text-[var(--text-heading)] p-2.5 rounded-xl border border-[var(--border)] focus:outline-none focus:border-amber-500"
                    >
                      {teacherSubjectOptions.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Exam Type */}
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">
                      {lang === "தமிழ்" ? "தேர்வு வகை" : "Exam Type"}
                    </label>
                    <select
                      value={entryExamType}
                      onChange={(e) => handleEntryExamTypeChange(e.target.value)}
                      className="w-full bg-[var(--bg-card)] text-xs font-bold text-[var(--text-heading)] p-2.5 rounded-xl border border-[var(--border)] focus:outline-none focus:border-amber-500"
                    >
                      {EXAM_TYPES.map((ex) => (
                        <option key={ex} value={ex}>
                          {ex}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Max Marks */}
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">
                      {lang === "தமிழ்" ? "அதிகபட்ச மதிப்பெண்" : "Max Marks"}
                    </label>
                    <input
                      type="number"
                      value={entryMaxMarks}
                      onChange={(e) => setEntryMaxMarks(Number(e.target.value) || 100)}
                      className="w-full bg-[var(--bg-card)] text-xs font-bold text-[var(--text-heading)] p-2.5 rounded-xl border border-[var(--border)] focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Mark Sheet Table */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                      {lang === "தமிழ்" ? "மாணவர் மதிப்பெண் பட்டியல்கள்" : `Students Roster — Class ${entryClass}`}
                    </h4>
                    <span className="text-xs text-amber-500 font-bold">
                      Subject: {entrySubject} ({entryExamType})
                    </span>
                  </div>

                  <div className="bg-[var(--bg-main)] rounded-2xl border border-[var(--border)] overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--bg-card)] border-b border-[var(--border)] text-[var(--text-muted)] font-bold uppercase">
                        <tr>
                          <th className="p-3">{lang === "தமிழ்" ? "மாணவர் பெயர்" : "Student Name"}</th>
                          <th className="p-3">{lang === "தமிழ்" ? "EMIS எண்ண" : "EMIS / Roll No"}</th>
                          <th className="p-3 text-center">{lang === "தமிழ்" ? "மதிப்பெண்" : `Scored (out of ${entryMaxMarks})`}</th>
                          <th className="p-3 text-center">{lang === "தமிழ்" ? "தரம்" : "Grade"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {rawStudentsList
                          .filter(
                            (st) =>
                              String(st.class) === String(entryClass.split("-")[0]) &&
                              String(st.section) === String(entryClass.split("-")[1])
                          )
                          .map((st, idx) => {
                            const scoreEntry = markSheetScores[st.id] || { scored: "" };
                            const currentVal = scoreEntry.scored;
                            const calcGrade = currentVal !== "" ? getGrade(Number(currentVal), entryMaxMarks) : "—";

                            return (
                              <tr key={st.id} className="hover:bg-[var(--bg-card)] transition-colors">
                                <td className="p-3 font-bold text-[var(--text-heading)] flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 font-bold text-xs flex items-center justify-center">
                                    {idx + 1}
                                  </div>
                                  {st.user?.name || `Student ${st.rollNumber || idx + 1}`}
                                </td>
                                <td className="p-3 text-[var(--text-muted)]">
                                  {st.emisNumber || st.user?.emisId || `EMIS330${1000 + idx}`}
                                </td>
                                <td className="p-3 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max={entryMaxMarks}
                                    placeholder="Scored"
                                    value={currentVal}
                                    onChange={(e) => {
                                      const val = e.target.value === "" ? "" : Number(e.target.value);
                                      setMarkSheetScores((prev) => ({
                                        ...prev,
                                        [st.id]: { ...prev[st.id], scored: val },
                                      }));
                                    }}
                                    className="w-24 bg-[var(--bg-card)] text-center text-xs font-bold text-[var(--text-heading)] py-1.5 px-2 rounded-xl border border-[var(--border)] focus:outline-none focus:border-amber-500"
                                  />
                                </td>
                                <td className="p-3 text-center font-extrabold text-amber-500">
                                  {calcGrade}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-[var(--bg-main)] p-4 border-t border-[var(--border)] flex items-center justify-between">
                <button
                  onClick={() => setIsMarkModalOpen(false)}
                  className="px-4 py-2 bg-[var(--bg-card)] text-[var(--text-heading)] font-bold text-xs rounded-xl border border-[var(--border)] hover:bg-[var(--border)] transition-all"
                >
                  {lang === "தமிழ்" ? "ரத்து செய்" : "Cancel"}
                </button>

                <button
                  onClick={handleSaveBulkMarks}
                  disabled={savingBulk}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {savingBulk
                    ? lang === "தமிழ்"
                      ? "சேமிக்கப்படுகிறது..."
                      : "Saving to Data..."
                    : lang === "தமிழ்"
                      ? "மதிப்பெண்களை சேமி"
                      : "Save All Marks to Data"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Student Progress Card Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md text-white font-black text-2xl flex items-center justify-center shadow-inner">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-black">{selectedStudent.name}</h2>
                    <p className="text-xs text-amber-100 mt-0.5">
                      EMIS: {selectedStudent.emisNumber} • Class {selectedStudent.class}-{selectedStudent.section} (Roll #{selectedStudent.rollNumber})
                    </p>
                    <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white uppercase tracking-wider">
                      Academic Progress Card 2024-25
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Score & Attendance Overview Bar */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-[var(--bg-main)] rounded-2xl border border-[var(--border)]">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">
                      {lang === "தமிழ்" ? "ஒட்டுமொத்த மதிப்பெண்" : "Overall Average"}
                    </span>
                    <span className="text-xl font-extrabold text-amber-500 mt-1 block">
                      {selectedStudent.overallScore}%
                    </span>
                  </div>
                  <div className="p-3 bg-[var(--bg-main)] rounded-2xl border border-[var(--border)]">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">
                      {lang === "தமிழ்" ? "வருகைப் பதிவு" : "Attendance Rate"}
                    </span>
                    <span className="text-xl font-extrabold text-emerald-500 mt-1 block">
                      {selectedStudent.attendancePct}%
                    </span>
                  </div>
                  <div className="p-3 bg-[var(--bg-main)] rounded-2xl border border-[var(--border)]">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">
                      {lang === "தமிழ்" ? "மதிப்பீடுகள்" : "Tests Taken"}
                    </span>
                    <span className="text-xl font-extrabold text-blue-500 mt-1 block">
                      {selectedStudent.assessmentsCompleted} / {selectedStudent.totalAssessments}
                    </span>
                  </div>
                </div>

                {/* Subject-wise Marks Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-amber-500" />
                      {lang === "தமிழ்" ? "பாடவாரியாக மதிப்பெண் நிலை" : "Subject Performance Breakdown"}
                    </h4>

                    {/* Add Subject Quick Action */}
                    {/* <div className="flex items-center gap-1.5">
                      <select
                        id="add-subject-select"
                        className="bg-[var(--bg-main)] text-[11px] font-bold text-[var(--text-heading)] px-2 py-1 rounded-lg border border-[var(--border)] focus:outline-none focus:border-amber-500"
                        defaultValue="Mathematics"
                      >
                        {SUBJECT_LIST.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          const el = document.getElementById("add-subject-select") as HTMLSelectElement;
                          const subName = el ? el.value : "Mathematics";
                          if (selectedStudent) {
                            if (selectedStudent.subjects.some((s) => s.name.toLowerCase() === subName.toLowerCase())) {
                              Swal.fire({
                                icon: "info",
                                title: "Subject Already Present",
                                text: `${subName} is already listed in the performance card.`,
                                timer: 1500,
                                showConfirmButton: false,
                              });
                              return;
                            }
                            setSelectedStudent({
                              ...selectedStudent,
                              subjects: [
                                ...selectedStudent.subjects,
                                { name: subName, score: 0, maxScore: 100, grade: "E" },
                              ],
                            });
                          }
                        }}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 shadow-sm"
                      >
                        <Plus className="w-3 h-3" />
                        {lang === "தமிழ்" ? "பாடம் சேர்" : "+ Add Subject"}
                      </button>
                    </div> */}
                  </div>
                  <div className="bg-[var(--bg-main)] rounded-2xl border border-[var(--border)] overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--bg-card)] border-b border-[var(--border)] text-[var(--text-muted)] font-bold uppercase">
                        <tr>
                          <th className="p-3">{lang === "தமிழ்" ? "பாடம்" : "Subject"}</th>
                          <th className="p-3 text-center">{lang === "தமிழ்" ? "மதிப்பெண்" : "Score"}</th>
                          <th className="p-3 text-center">{lang === "தமிழ்" ? "தரம்" : "Grade"}</th>
                          <th className="p-3">{lang === "தமிழ்" ? "முன்னேற்றம்" : "Progress"}</th>
                          <th className="p-3 text-right">{lang === "தமிழ்" ? "செயல்" : "Action"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {selectedStudent.subjects.map((sub) => (
                          <tr key={sub.name} className="hover:bg-[var(--bg-card)] transition-colors">
                            <td className="p-3 font-bold text-[var(--text-heading)]">{sub.name}</td>
                            <td className="p-3 text-center font-extrabold text-[var(--text-heading)]">
                              <div className="flex items-center justify-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  max={sub.maxScore}
                                  value={sub.score}
                                  onChange={(e) => {
                                    const val = Number(e.target.value) || 0;
                                    if (selectedStudent) {
                                      const updatedSubs = selectedStudent.subjects.map((s) =>
                                        s.name === sub.name ? { ...s, score: val, grade: getGrade(val, sub.maxScore) } : s
                                      );
                                      setSelectedStudent({ ...selectedStudent, subjects: updatedSubs });
                                    }
                                  }}
                                  className="w-14 text-center bg-[var(--bg-card)] border border-[var(--border)] rounded-lg py-1 px-1 text-xs font-extrabold text-[var(--text-heading)] focus:outline-none focus:border-amber-500"
                                />
                                <span className="text-[10px] text-[var(--text-muted)]">/ {sub.maxScore}</span>
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                {sub.grade}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="w-full bg-[var(--bg-card)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
                                <div
                                  className="bg-amber-500 h-full rounded-full"
                                  style={{ width: `${(sub.score / sub.maxScore) * 100}%` }}
                                />
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              {sub.id ? (
                                <button
                                  onClick={() => handleDeleteMark(sub.id!, sub.name)}
                                  className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                  title="Delete mark from Data"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              ) : (
                                <span className="text-[10px] text-[var(--text-muted)]">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Teacher Remarks & Action Notes */}
                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    {lang === "தமிழ்" ? "ஆசிரியர் கருத்து மற்றும் பரிந்துரைகள்" : "Teacher Evaluation & Remarks"}
                  </label>
                  <textarea
                    rows={3}
                    value={teacherNote}
                    onChange={(e) => setTeacherNote(e.target.value)}
                    placeholder={
                      lang === "தமிழ்"
                        ? "மாணவரின் கற்றல் முன்னேற்றம் குறித்து கருத்துக்களை எழுதவும்..."
                        : "Write teacher feedback and learning recommendations..."
                    }
                    className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl text-xs text-[var(--text-heading)] focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNote}
                      disabled={savingNote}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {savingNote
                        ? lang === "தமிழ்"
                          ? "சேமிக்கப்படுகிறது..."
                          : "Saving..."
                        : lang === "தமிழ்"
                          ? "குறிப்பைச் சேமி"
                          : "Save Remarks"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-[var(--bg-main)] p-4 border-t border-[var(--border)] flex items-center justify-between">
                <button
                  onClick={handlePrintReport}
                  className="px-4 py-2 bg-[var(--bg-card)] hover:bg-[var(--border)] text-[var(--text-heading)] font-bold text-xs rounded-xl border border-[var(--border)] transition-all flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-amber-500" />
                  {lang === "தமிழ்" ? "முன்னேற்ற அறிக்கையை அச்சிடு" : "Print Progress Card"}
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 bg-amber-500 text-white font-bold text-xs rounded-xl hover:bg-amber-600 transition-all"
                >
                  {lang === "தமிழ்" ? "மூடு" : "Close"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}

export default function TeacherProgressPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-main)]">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
      </div>
    }>
      <TeacherProgressContent />
    </Suspense>
  );
}
