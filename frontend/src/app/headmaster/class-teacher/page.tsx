"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import {
  Users,
  UserCheck,
  Search,
  Download,
  Edit,
  Trash2,
  Plus,
  Filter,
  RefreshCw,
  BookOpen,
  Award,
  ShieldCheck,
  GraduationCap,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UserPlus
} from "lucide-react";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

interface StaffMetadata {
  address?: string;
  staffType: "Teaching" | "Non-Teaching";
  joiningDate?: string;
  workAllocation?: string;
  assignedClass?: string;
  assignedSection?: string;
  docAppointment?: string;
  isClassTeacher?: boolean;
}

interface StaffMember {
  id?: string;
  name: string;
  emisId: string;
  subject: string;
  phone: string;
  email: string;
  attendance: number;
  performance: "Excellent" | "Good" | "Average";
  leaveUsed: number;
  password?: string;
  createdAt?: string;
  address?: string;
  dob?: string;
  gender?: string;
  parsedMeta?: StaffMetadata;
}

interface ClassTeacherAssignment {
  classNum: string;
  sectionStr: string;
  classCode: string; // e.g. "6A"
  teacher: StaffMember | null;
}

const ALL_CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const ALL_SECTIONS = ["A", "B", "C"];

export default function HeadmasterClassTeachersPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const mySchoolId: string = (session?.user as any)?.schoolId || "";

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Tab View
  const [activeTab, setActiveTab] = useState<"roster" | "list" | "unassigned">("roster");

  // Search and Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGradeFilter, setSelectedGradeFilter] = useState("all");
  const [selectedSectionFilter, setSelectedSectionFilter] = useState("all");

  // Assignment Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetClass, setTargetClass] = useState("6");
  const [targetSection, setTargetSection] = useState("A");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  // Helper: Parse Address JSON
  const parseStaffAddress = (rawAddress: string | null | undefined, defaultSubject: string): StaffMetadata => {
    let parsedMeta: StaffMetadata = {
      address: "",
      staffType: defaultSubject === "Non-Teaching" || defaultSubject === "Office Staff" || defaultSubject === "Administrative" ? "Non-Teaching" : "Teaching",
      joiningDate: "",
      workAllocation: defaultSubject || "",
      docAppointment: "",
      isClassTeacher: false
    };

    if (rawAddress) {
      try {
        const parsed = JSON.parse(rawAddress);
        if (parsed && typeof parsed === "object") {
          parsedMeta = {
            address: parsed.address || "",
            staffType: parsed.staffType || parsedMeta.staffType,
            joiningDate: parsed.joiningDate || "",
            workAllocation: parsed.workAllocation || parsedMeta.workAllocation,
            assignedClass: parsed.assignedClass || "",
            assignedSection: parsed.assignedSection || "",
            docAppointment: parsed.docAppointment || "",
            isClassTeacher: Boolean(parsed.isClassTeacher || (parsed.workAllocation && parsed.workAllocation.toLowerCase().includes("class teacher")))
          };
        } else {
          parsedMeta.address = rawAddress;
        }
      } catch {
        parsedMeta.address = rawAddress;
      }
    }
    return parsedMeta;
  };

  // Fetch Staff Data
  const fetchData = useCallback(async () => {
    if (!mySchoolId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/staff?schoolId=${mySchoolId}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        const formattedStaff: StaffMember[] = json.data.map((s: StaffMember) => {
          const parsedMeta = parseStaffAddress(s.address, s.subject);
          return {
            ...s,
            parsedMeta
          };
        });
        setStaffList(formattedStaff);
      }
    } catch (err) {
      console.error("Error fetching staff data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [mySchoolId]);

  useEffect(() => {
    if (mySchoolId) {
      fetchData();
    }
  }, [mySchoolId, fetchData]);

  // Derived: List of Class Teachers
  const classTeachers = useMemo(() => {
    return staffList.filter(s => {
      const isTeaching = s.parsedMeta?.staffType === "Teaching" || (s.subject && s.subject !== "Non-Teaching");
      if (!isTeaching) return false;
      
      const isCT = Boolean(s.parsedMeta?.isClassTeacher || (s.parsedMeta?.workAllocation && s.parsedMeta.workAllocation.toLowerCase().includes("class teacher")));
      return isCT && (s.parsedMeta?.assignedClass || s.parsedMeta?.assignedSection);
    });
  }, [staffList]);

  // List of all Teaching Staff
  const teachingStaff = useMemo(() => {
    return staffList.filter(s => s.parsedMeta?.staffType === "Teaching" || (s.subject && s.subject !== "Non-Teaching"));
  }, [staffList]);

  // Matrix of Class-Section Assignments
  const classAssignments = useMemo(() => {
    const list: ClassTeacherAssignment[] = [];
    ALL_CLASSES.forEach(cls => {
      ALL_SECTIONS.forEach(sec => {
        const code = `${cls}${sec}`;
        const teacher = classTeachers.find(t => 
          t.parsedMeta?.assignedClass === cls && t.parsedMeta?.assignedSection === sec
        ) || null;
        list.push({ classNum: cls, sectionStr: sec, classCode: code, teacher });
      });
    });
    return list;
  }, [classTeachers]);

  // Filtered Class Assignments based on search and dropdowns
  const filteredAssignments = useMemo(() => {
    return classAssignments.filter(item => {
      // Grade filter
      if (selectedGradeFilter === "primary" && (parseInt(item.classNum) < 1 || parseInt(item.classNum) > 5)) return false;
      if (selectedGradeFilter === "middle" && (parseInt(item.classNum) < 6 || parseInt(item.classNum) > 8)) return false;
      if (selectedGradeFilter === "high" && (parseInt(item.classNum) < 9 || parseInt(item.classNum) > 10)) return false;
      if (selectedGradeFilter === "higher" && (parseInt(item.classNum) < 11 || parseInt(item.classNum) > 12)) return false;

      // Section filter
      if (selectedSectionFilter !== "all" && item.sectionStr !== selectedSectionFilter) return false;

      // Search term
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const codeMatch = item.classCode.toLowerCase().includes(term) || `class ${item.classNum}`.toLowerCase().includes(term);
      const nameMatch = item.teacher ? item.teacher.name.toLowerCase().includes(term) : false;
      const emisMatch = item.teacher ? item.teacher.emisId.toLowerCase().includes(term) : false;
      const subjMatch = item.teacher ? item.teacher.subject.toLowerCase().includes(term) : false;

      return codeMatch || nameMatch || emisMatch || subjMatch;
    });
  }, [classAssignments, selectedGradeFilter, selectedSectionFilter, searchTerm]);

  // Filtered Class Teachers list view
  const filteredClassTeachersList = useMemo(() => {
    return classTeachers.filter(s => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const clsCode = `${s.parsedMeta?.assignedClass}${s.parsedMeta?.assignedSection}`.toLowerCase();
      return (
        s.name.toLowerCase().includes(term) ||
        s.emisId.toLowerCase().includes(term) ||
        s.subject.toLowerCase().includes(term) ||
        clsCode.includes(term)
      );
    });
  }, [classTeachers, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const assignedCount = classTeachers.length;
    const totalPossibleClasses = classAssignments.length;
    const unassignedCount = classAssignments.filter(c => !c.teacher).length;
    const coveragePct = Math.round((assignedCount / totalPossibleClasses) * 100);

    return {
      assignedCount,
      totalPossibleClasses,
      unassignedCount,
      coveragePct
    };
  }, [classTeachers, classAssignments]);

  // Open Modal to Assign Class Teacher
  const openAssignModal = (classNum: string, sectionStr: string, currentTeacherId?: string) => {
    setTargetClass(classNum);
    setTargetSection(sectionStr);
    setSelectedTeacherId(currentTeacherId || "");
    setIsAssignModalOpen(true);
  };

  // Submit Class Teacher Assignment
  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId) {
      Swal.fire({
        title: "Selection Required",
        text: "Please select a teacher from the list to assign as Class Teacher.",
        icon: "warning",
        background: "var(--bg-card)",
        color: "var(--text-heading)"
      });
      return;
    }

    const selectedStaffObj = staffList.find(s => s.id === selectedTeacherId || s.emisId === selectedTeacherId);
    if (!selectedStaffObj) return;

    // Check if another teacher is already class teacher for this class & section
    const existingCT = classTeachers.find(s => 
      s.id !== selectedStaffObj.id &&
      s.parsedMeta?.assignedClass === targetClass &&
      s.parsedMeta?.assignedSection === targetSection
    );

    if (existingCT) {
      const result = await Swal.fire({
        title: "Reassign Class Teacher?",
        text: `${existingCT.name} is currently Class Teacher for Class ${targetClass}${targetSection}. Do you want to replace them with ${selectedStaffObj.name}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3b82f6",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, Reassign",
        background: "var(--bg-card)",
        color: "var(--text-heading)"
      });

      if (!result.isConfirmed) return;

      // Remove Class Teacher flag from existing teacher
      try {
        const oldMeta = existingCT.parsedMeta || { staffType: "Teaching" };
        const updatedOldMeta = JSON.stringify({
          ...oldMeta,
          isClassTeacher: false,
          workAllocation: oldMeta.workAllocation === "Class Teacher" ? "Subject Teacher" : oldMeta.workAllocation
        });
        await fetch(`${API_BASE}/api/headmaster/staff/${existingCT.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: updatedOldMeta })
        });
      } catch (err) {
        console.error("Error unassigning old class teacher:", err);
      }
    }

    setIsSaving(true);
    try {
      const currentMeta = selectedStaffObj.parsedMeta || { staffType: "Teaching" };
      const updatedMeta = JSON.stringify({
        ...currentMeta,
        assignedClass: targetClass,
        assignedSection: targetSection,
        isClassTeacher: true,
        workAllocation: "Class Teacher"
      });

      const res = await fetch(`${API_BASE}/api/headmaster/staff/${selectedStaffObj.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: updatedMeta })
      });

      const json = await res.json();
      if (json.success) {
        Swal.fire({
          title: "Class Teacher Assigned",
          text: `${selectedStaffObj.name} is now the Class Teacher for Class ${targetClass}${targetSection}.`,
          icon: "success",
          timer: 1800,
          showConfirmButton: false,
          background: "var(--bg-card)",
          color: "var(--text-heading)"
        });
        setIsAssignModalOpen(false);
        fetchData();
      } else {
        throw new Error(json.error);
      }
    } catch (err: any) {
      Swal.fire({
        title: "Assignment Failed",
        text: err.message || "Failed to update class teacher post.",
        icon: "error",
        background: "var(--bg-card)",
        color: "var(--text-heading)"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Remove Class Teacher Assignment
  const handleRemoveAssignment = async (staffId: string, teacherName: string, classCode: string) => {
    const result = await Swal.fire({
      title: "Remove Class Teacher Post?",
      text: `Are you sure you want to remove ${teacherName} as the Class Teacher for ${classCode}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Remove",
      background: "var(--bg-card)",
      color: "var(--text-heading)"
    });

    if (!result.isConfirmed) return;

    setIsSaving(true);
    try {
      const targetTeacher = staffList.find(s => s.id === staffId);
      if (!targetTeacher) return;

      const meta = targetTeacher.parsedMeta || { staffType: "Teaching" };
      const updatedMeta = JSON.stringify({
        ...meta,
        isClassTeacher: false,
        workAllocation: "Subject Teacher"
      });

      const res = await fetch(`${API_BASE}/api/headmaster/staff/${staffId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: updatedMeta })
      });

      const json = await res.json();
      if (json.success) {
        Swal.fire({
          title: "Post Removed",
          text: `Class Teacher status removed for ${teacherName}.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          background: "var(--bg-card)",
          color: "var(--text-heading)"
        });
        fetchData();
      } else {
        throw new Error(json.error);
      }
    } catch (err: any) {
      Swal.fire({
        title: "Removal Failed",
        text: err.message || "Error updating staff record.",
        icon: "error",
        background: "var(--bg-card)",
        color: "var(--text-heading)"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Export Class Teachers List to Excel
  const exportExcel = () => {
    const headers = [
      "Class & Section", "Class Teacher Name", "EMIS ID / Staff ID", "Subject", "Phone Number", "Email Address", "Attendance (%)", "Performance Rating"
    ];

    const rows = classAssignments
      .filter(c => c.teacher)
      .map(c => [
        `Class ${c.classCode}`,
        c.teacher!.name,
        c.teacher!.emisId,
        c.teacher!.subject,
        c.teacher!.phone,
        c.teacher!.email || "N/A",
        `${c.teacher!.attendance}%`,
        c.teacher!.performance
      ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Class Teachers");
    XLSX.writeFile(workbook, `Class_Teachers_List_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "வகுப்பு ஆசிரியர்கள் பட்டியல் & ஒதுக்கீடு" : "Class Teachers Directory & Allocation"}
      subtitle={lang === "தமிழ்" ? "பள்ளியின் அனைத்து வகுப்புகளுக்கும் வகுப்பு ஆசிரியர்களின் விபரம் மற்றும் புதிய பொறுப்புகள் ஒதுக்கீடு." : "Master roster of assigned Class Teachers for each grade & section."}
      avatarLetter="V"
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >

      {/* Top Header Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">

        {/* Card 1: Active Class Teachers */}
        <div className="glass rounded-2xl p-4 border border-slate-800 flex items-center justify-between hover:scale-[1.02] transition-all bg-gradient-to-br from-blue-500/10 to-transparent">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {lang === "தமிழ்" ? "வகுப்பு ஆசிரியர்கள்" : "Assigned Class Teachers"}
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.assignedCount}</span>
            <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
              {lang === "தமிழ்" ? "பொறுப்பில் உள்ளனர்" : "Active In-charge"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-500 dark:text-blue-400">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Classes */}
        <div className="glass rounded-2xl p-4 border border-slate-800 flex items-center justify-between hover:scale-[1.02] transition-all bg-gradient-to-br from-violet-500/10 to-transparent">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {lang === "தமிழ்" ? "மொத்த வகுப்புகள்" : "Total Class Sections"}
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalPossibleClasses}</span>
            <span className="text-[9px] text-violet-600 dark:text-violet-400 font-semibold mt-1">
              Class 1 to 12 (A, B, C)
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-500 dark:text-violet-400">
            <Building className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Unassigned Classes */}
        <div className="glass rounded-2xl p-4 border border-slate-800 flex items-center justify-between hover:scale-[1.02] transition-all bg-gradient-to-br from-amber-500/10 to-transparent">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {lang === "தமிழ்" ? "ஆசிரியர் இல்லாத வகுப்புகள்" : "Unassigned Classes"}
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.unassignedCount}</span>
            <span className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
              {lang === "தமிழ்" ? "ஒதுக்கீடு தேவை" : "Pending Allocation"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Faculty Roster */}
        <div className="glass rounded-2xl p-4 border border-slate-800 flex items-center justify-between hover:scale-[1.02] transition-all bg-gradient-to-br from-emerald-500/10 to-transparent">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {lang === "தமிழ்" ? "கற்பித்தல் ஆசிரியர்கள்" : "Teaching Faculty"}
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">{teachingStaff.length}</span>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              {stats.coveragePct}% Classes Covered
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Toolbar & Filters */}
      <div className="glass rounded-2xl p-4 border border-slate-800/60 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 fade-in">
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-full md:w-auto">
          {[
            { id: "roster", label: lang === "தமிழ்" ? "வகுப்பு வாரியாக" : "Class Roster Grid" },
            { id: "list", label: lang === "தமிழ்" ? "ஆசிரியர்கள் அட்டவணை" : "Teachers List View" },
            { id: "unassigned", label: `${lang === "தமிழ்" ? "ஒதுக்கப்படாதவை" : "Unassigned Classes"} (${stats.unassignedCount})` }
          ].map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${active
                  ? "bg-blue-600 text-white shadow-md font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Actions & Refresh */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => { setTargetClass("6"); setTargetSection("A"); setIsAssignModalOpen(true); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Assign Class Teacher</span>
          </button>

          <button
            onClick={exportExcel}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roster</span>
          </button>

          <button
            onClick={fetchData}
            title="Refresh Data"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

      </div>

      {/* Search & Filter Bar */}
      <div className="glass rounded-2xl p-4 border border-slate-800/60 mb-6 flex flex-wrap items-center gap-4 fade-in">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Class (e.g. 6A), Teacher Name, EMIS ID, Subject..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Grade Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500">Grade Level:</span>
          <select
            value={selectedGradeFilter}
            onChange={e => setSelectedGradeFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Classes (1 - 12)</option>
            <option value="primary">Primary (Class 1 - 5)</option>
            <option value="middle">Middle School (Class 6 - 8)</option>
            <option value="high">High School (Class 9 - 10)</option>
            <option value="higher">Higher Secondary (Class 11 - 12)</option>
          </select>
        </div>

        {/* Section Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500">Section:</span>
          <select
            value={selectedSectionFilter}
            onChange={e => setSelectedSectionFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Sections (A, B, C)</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>

      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="text-center py-24 flex flex-col items-center justify-center space-y-3 glass rounded-2xl border border-slate-800">
          <div className="w-8 h-8 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Loading Class Teachers Roster...</span>
        </div>
      ) : (
        <>
          {/* VIEW 1: CLASS ROSTER GRID */}
          {activeTab === "roster" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 fade-in">
              {filteredAssignments.map((item) => {
                const hasTeacher = Boolean(item.teacher);
                const teacher = item.teacher;

                return (
                  <div
                    key={item.classCode}
                    className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between relative group ${hasTeacher
                      ? "glass border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:shadow-lg bg-gradient-to-br from-blue-500/5 via-transparent to-transparent"
                      : "bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/30 border-dashed"
                      }`}
                  >
                    {/* Class Code Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-black text-xs shadow-md">
                          Class {item.classCode}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Section {item.sectionStr}
                        </span>
                      </div>

                      {hasTeacher ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Assigned
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Vacant
                        </span>
                      )}
                    </div>

                    {/* Teacher Info */}
                    {hasTeacher && teacher ? (
                      <div className="space-y-3 my-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                            {teacher.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white text-xs truncate" title={teacher.name}>
                              {teacher.name}
                            </h3>
                            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold truncate mt-0.5">
                              {teacher.subject} Teacher
                            </p>
                            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium truncate">
                              ID: {teacher.emisId}
                            </p>
                          </div>
                        </div>

                        {/* Contact & Attendance info */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-[10px] text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{teacher.phone || "N/A"}</span>
                          </div>
                          {teacher.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{teacher.email}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[9px] font-bold text-slate-500">Attendance:</span>
                            <span className="font-bold text-emerald-500">{teacher.attendance}%</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center space-y-2">
                        <p className="text-xs font-bold text-amber-500">No Class Teacher assigned</p>
                        <p className="text-[10px] text-slate-400 max-w-[180px] mx-auto">
                          Assign a faculty member as the Class Teacher for {item.classCode}.
                        </p>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-auto">
                      {hasTeacher && teacher ? (
                        <>
                          <button
                            onClick={() => openAssignModal(item.classNum, item.sectionStr, teacher.id)}
                            className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" /> Reassign
                          </button>

                          <button
                            onClick={() => handleRemoveAssignment(teacher.id!, teacher.name, item.classCode)}
                            className="px-2.5 py-1.5 text-red-400 hover:bg-red-500/10 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                            title="Remove Class Teacher post"
                          >
                            <Trash2 className="w-3 h-3" /> Unassign
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => openAssignModal(item.classNum, item.sectionStr)}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Assign Class Teacher
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 2: TEACHERS TABLE LIST */}
          {activeTab === "list" && (
            <div className="custom-card rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm fade-in">
              {filteredClassTeachersList.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-xs">
                  No assigned class teachers match your current filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-4">Assigned Class</th>
                        <th className="p-4">Class Teacher Name</th>
                        <th className="p-4">EMIS ID</th>
                        <th className="p-4">Subject</th>
                        <th className="p-4">Phone Number</th>
                        <th className="p-4">Attendance & Rating</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {filteredClassTeachersList.map(s => {
                        const classCode = `${s.parsedMeta?.assignedClass || ""}${s.parsedMeta?.assignedSection || ""}`;
                        return (
                          <tr key={s.id || s.emisId} className="hover:bg-slate-900/30 transition-colors">
                            <td className="p-4 font-black text-blue-400">
                              <span className="px-2.5 py-1 rounded-lg bg-blue-600/10 border border-blue-500/30">
                                Class {classCode}
                              </span>
                            </td>
                            <td className="p-4 font-bold text-white">
                              <div>{s.name}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{s.email || "N/A"}</div>
                            </td>
                            <td className="p-4 font-mono text-slate-300">{s.emisId}</td>
                            <td className="p-4 text-slate-300 font-medium">{s.subject}</td>
                            <td className="p-4 text-slate-400">{s.phone}</td>
                            <td className="p-4 space-y-1">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${s.attendance >= 95 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                                {s.attendance}% Attendance
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openAssignModal(s.parsedMeta?.assignedClass || "6", s.parsedMeta?.assignedSection || "A", s.id)}
                                  className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg border border-blue-500/20 transition-all"
                                  title="Change class assignment"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRemoveAssignment(s.id!, s.name, classCode)}
                                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg border border-red-500/20 transition-all"
                                  title="Remove Class Teacher post"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: UNASSIGNED CLASSES */}
          {activeTab === "unassigned" && (
            <div className="space-y-4 fade-in">
              <div className="glass p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-xs text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <span>The following class sections currently do not have a Class Teacher assigned. Click <b>Assign Teacher</b> to allocate a faculty member.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classAssignments.filter(c => !c.teacher).map(item => (
                  <div key={item.classCode} className="glass rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm">Class {item.classCode}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Section {item.sectionStr} · Vacant Post</p>
                    </div>
                    <button
                      onClick={() => openAssignModal(item.classNum, item.sectionStr)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Assign Teacher
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ASSIGN CLASS TEACHER MODAL */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl p-6 relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl text-slate-800 dark:text-slate-200">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                Assign Class Teacher for Class {targetClass}{targetSection}
              </h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-white text-xs font-semibold">✕ Close</button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs">
              
              {/* Class & Section Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-bold">Class</label>
                  <select
                    value={targetClass}
                    onChange={e => setTargetClass(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                  >
                    {ALL_CLASSES.map(cls => (
                      <option key={cls} value={cls}>Class {cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-bold">Section</label>
                  <select
                    value={targetSection}
                    onChange={e => setTargetSection(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                  >
                    {ALL_SECTIONS.map(sec => (
                      <option key={sec} value={sec}>Section {sec}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Select Faculty Member */}
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-bold">Select Teaching Faculty *</label>
                <select
                  required
                  value={selectedTeacherId}
                  onChange={e => setSelectedTeacherId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose Teacher --</option>
                  {teachingStaff.map(t => {
                    const currentCls = t.parsedMeta?.isClassTeacher && t.parsedMeta?.assignedClass && t.parsedMeta?.assignedSection 
                      ? ` (Currently Class Teacher: ${t.parsedMeta.assignedClass}${t.parsedMeta.assignedSection})` 
                      : "";
                    return (
                      <option key={t.id || t.emisId} value={t.id || t.emisId}>
                        {t.name} — {t.subject} (EMIS: {t.emisId}){currentCls}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  {isSaving ? "Saving..." : "💾 Confirm Assignment"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </PortalLayout>
  );
}
