"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  Users,
  UserPlus,
  Search,
  Filter,
  Trash2,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckSquare,
  Square,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Layers,
  ChevronRight,
} from "lucide-react";
import {
  PET_API_BASE,
  petLoad,
  petSave,
  LocalClub,
  LOCAL_CLUBS_KEY,
  LOCAL_STUDENT_ROSTER,
} from "@/lib/petData";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApiClub {
  id: string;
  name: string;
  category: string;
  icon: string;
  sponsor?: string;
  meetingTime?: string;
  description?: string;
  schoolId?: string;
}

interface ApiMember {
  id: string;
  studentId: string;
  name: string;
  class: string;
  section: string;
  role: string;
  joinedAt?: string;
}

interface ApiStudent {
  id: string;
  class: string;
  section: string;
  user?: { name: string };
  admissionNumber?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const renderPetClubIcon = (iconStr: string) => {
  if (iconStr && iconStr.startsWith("fi ")) {
    return <i className={`${iconStr} text-3xl text-blue-500`} />;
  }
  const s = iconStr || "";
  if (s === "🏃") return <i className="fi fi-rr-running text-3xl text-blue-500" />;
  if (s === "⚽" || s === "🏐" || s === "🏀") return <i className="fi fi-rr-basketball text-3xl text-blue-500" />;
  if (s === "🏏") return <i className="fi fi-rr-trophy text-3xl text-blue-500" />;
  if (s === "🤼") return <i className="fi fi-rr-gym text-3xl text-blue-500" />;
  if (s === "♟️") return <i className="fi fi-rr-chess-knight text-3xl text-blue-500" />;
  if (s === "🧘") return <i className="fi fi-rr-spa text-3xl text-blue-500" />;
  if (s === "🤝") return <i className="fi fi-rr-handshake text-3xl text-blue-500" />;
  if (s === "⛑️") return <i className="fi fi-rr-medical-star text-3xl text-blue-500" />;
  if (s === "🏕️") return <i className="fi fi-rr-campground text-3xl text-blue-500" />;
  if (s === "🌱") return <i className="fi fi-rr-leaf text-3xl text-blue-500" />;
  if (s === "🚦") return <i className="fi fi-rr-traffic-light text-3xl text-blue-500" />;
  if (s === "🎗️") return <i className="fi fi-rr-ribbon text-3xl text-blue-500" />;
  return <i className="fi fi-rr-users text-3xl text-blue-500" />;
};

const getClubEligibility = (clubName: string) => {
  const name = clubName.toLowerCase();
  if (name.includes("service scheme") || name.includes("nss") || name.includes("ribbon") || name.includes("rrc")) {
    return { label: "Class 11 - 12", minClass: 11, maxClass: 12, levels: ["higher"], description: "Higher Secondary only" };
  }
  if (name.includes("cadet corps") || name.includes("ncc") || name.includes("safety patrol") || name.includes("rsp")) {
    return { label: "Class 9 - 12", minClass: 9, maxClass: 12, levels: ["high", "higher"], description: "High & Higher Secondary" };
  }
  if (name.includes("red cross") || name.includes("jrc") || name.includes("scouts") || name.includes("guides") || name.includes("green corps") || name.includes("eco club")) {
    return { label: "Class 6 - 10", minClass: 6, maxClass: 10, levels: ["middle", "high"], description: "Middle & High School" };
  }
  return { label: "Class 6 - 12", minClass: 6, maxClass: 12, levels: ["middle", "high", "higher"], description: "All Standards (Class 6 to 12)" };
};

const extractClassNum = (raw?: string): number => {
  if (!raw) return 0;
  const match = String(raw).match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

const normalizeSection = (raw?: string): string => {
  if (!raw) return "";
  return String(raw).trim().toUpperCase();
};

export default function ManageClubPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId || "";

  const clubId = (params?.id as string) || "";

  const [club, setClub] = useState<ApiClub | null>(null);
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"api" | "local">("api");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [enforceEligibility, setEnforceEligibility] = useState(true);

  // View state: "split" or "tabs"
  const [viewMode, setViewMode] = useState<"split" | "tabs">("split");
  const [activeTab, setActiveTab] = useState<"add" | "members">("add");

  // Multi-selection for bulk add
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [bulkAdding, setBulkAdding] = useState(false);

  // -------------------------------------------------------------------------
  // Data Loading
  // -------------------------------------------------------------------------
  const loadData = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);

    try {
      // 1. Fetch club info and members from API
      const [clubRes, membersRes, studentsRes] = await Promise.all([
        fetch(`${PET_API_BASE}/api/activities/club/${clubId}`),
        fetch(`${PET_API_BASE}/api/activities/club/${clubId}/members`),
        fetch(`${PET_API_BASE}/api/students?schoolId=${schoolId}`),
      ]);

      const clubJson = await clubRes.json();
      const membersJson = await membersRes.json();
      const studentsJson = await studentsRes.json();

      if (clubJson.success && clubJson.data) {
        setClub(clubJson.data);
        setMode("api");
      } else {
        throw new Error("API club not found");
      }

      if (membersJson.success && Array.isArray(membersJson.data)) {
        setMembers(membersJson.data);
      }

      if (studentsJson.success && Array.isArray(studentsJson.data)) {
        setStudents(studentsJson.data);
      }
    } catch (err) {
      console.warn("Backend API unavailable or club missing, falling back to local storage:", err);
      // Fallback to local mode
      const localList = petLoad<LocalClub[]>(LOCAL_CLUBS_KEY, []);
      const foundLocal = localList.find((c) => c.id === clubId);

      if (foundLocal) {
        setClub({
          id: foundLocal.id,
          name: foundLocal.name,
          category: foundLocal.category,
          icon: foundLocal.icon,
          sponsor: foundLocal.coordinator,
          meetingTime: foundLocal.meetingTime,
          description: foundLocal.description,
        });
        setMembers(
          foundLocal.members.map((m) => {
            const classNum = extractClassNum(m.class);
            const sec = m.class.replace(/\d+/g, "").trim();
            return {
              id: m.id,
              studentId: m.id,
              name: m.name,
              class: classNum ? String(classNum) : m.class,
              section: sec,
              role: "Member",
            };
          })
        );
        // Map local roster to ApiStudent shape
        setStudents(
          LOCAL_STUDENT_ROSTER.map((s) => {
            const cNum = extractClassNum(s.class);
            const sSec = s.class.replace(/\d+/g, "").trim();
            return {
              id: s.id,
              class: cNum ? String(cNum) : s.class,
              section: sSec,
              user: { name: s.name },
            };
          })
        );
        setMode("local");
      } else {
        // If not found in local either, create a fallback
        setClub({
          id: clubId,
          name: "School Activity Club",
          category: "Sports",
          icon: "fi fi-rr-star",
          meetingTime: "Mon & Thu, 4:00 PM",
        });
        setMode("local");
      }
    } finally {
      setLoading(false);
    }
  }, [clubId, schoolId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // -------------------------------------------------------------------------
  // Filtering & Computed Options
  // -------------------------------------------------------------------------
  const eligibility = useMemo(() => {
    return getClubEligibility(club?.name || "");
  }, [club?.name]);

  // Current enrolled member IDs
  const memberStudentIds = useMemo(() => {
    return new Set(members.map((m) => m.studentId));
  }, [members]);

  // Collect all unique classes present in students and members
  const availableClasses = useMemo(() => {
    const classSet = new Set<number>();
    // Default school standards 6 through 12
    for (let c = 6; c <= 12; c++) {
      classSet.add(c);
    }
    students.forEach((s) => {
      const c = extractClassNum(s.class);
      if (c > 0) classSet.add(c);
    });
    members.forEach((m) => {
      const c = extractClassNum(m.class);
      if (c > 0) classSet.add(c);
    });
    return Array.from(classSet).sort((a, b) => a - b);
  }, [students, members]);

  // Collect all unique sections
  const availableSections = useMemo(() => {
    const secSet = new Set<string>(["A", "B", "C", "D"]);
    students.forEach((s) => {
      const sec = normalizeSection(s.section);
      if (sec) secSet.add(sec);
    });
    members.forEach((m) => {
      const sec = normalizeSection(m.section);
      if (sec) secSet.add(sec);
    });
    return Array.from(secSet).sort();
  }, [students, members]);

  // Candidates available to add (not yet in the club)
  const filteredCandidates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return students.filter((s) => {
      // 1. Must NOT already be a member
      if (memberStudentIds.has(s.id)) return false;

      const studentClass = extractClassNum(s.class);
      const studentSec = normalizeSection(s.section);
      const studentName = (s.user?.name || "").toLowerCase();

      // 2. Eligibility filter (if enabled)
      if (enforceEligibility) {
        if (studentClass < eligibility.minClass || studentClass > eligibility.maxClass) {
          return false;
        }
      }

      // 3. Class filter
      if (selectedClass !== "all") {
        if (studentClass !== parseInt(selectedClass, 10)) return false;
      }

      // 4. Section filter
      if (selectedSection !== "all") {
        if (studentSec !== selectedSection.toUpperCase()) return false;
      }

      // 5. Search query
      if (q) {
        const matchesName = studentName.includes(q);
        const matchesClassSec = `${studentClass}${studentSec}`.toLowerCase().includes(q) || `class ${studentClass}`.toLowerCase().includes(q);
        const matchesAdm = s.admissionNumber ? s.admissionNumber.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesClassSec && !matchesAdm) return false;
      }

      return true;
    });
  }, [students, memberStudentIds, enforceEligibility, eligibility, selectedClass, selectedSection, searchQuery]);

  // Enrolled members filtered by the same Class, Section, and Search
  const filteredMembers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return members.filter((m) => {
      const memberClass = extractClassNum(m.class);
      const memberSec = normalizeSection(m.section);
      const memberName = (m.name || "").toLowerCase();

      // 1. Class filter
      if (selectedClass !== "all") {
        if (memberClass !== parseInt(selectedClass, 10)) return false;
      }

      // 2. Section filter
      if (selectedSection !== "all") {
        if (memberSec !== selectedSection.toUpperCase()) return false;
      }

      // 3. Search query
      if (q) {
        const matchesName = memberName.includes(q);
        const matchesClassSec = `${memberClass}${memberSec}`.toLowerCase().includes(q) || `class ${memberClass}`.toLowerCase().includes(q);
        if (!matchesName && !matchesClassSec) return false;
      }

      return true;
    });
  }, [members, selectedClass, selectedSection, searchQuery]);

  // -------------------------------------------------------------------------
  // Actions: Add Single, Remove Single, Bulk Add
  // -------------------------------------------------------------------------

  const handleAddStudent = async (student: ApiStudent) => {
    setBusyId(student.id);
    try {
      if (mode === "api") {
        const res = await fetch(`${PET_API_BASE}/api/activities/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clubId, studentId: student.id }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to add student");

        setMembers((prev) => [
          ...prev,
          {
            id: json.data?.id || `m-${Date.now()}`,
            studentId: student.id,
            name: student.user?.name || "Student",
            class: student.class,
            section: student.section,
            role: "Member",
            joinedAt: new Date().toISOString(),
          },
        ]);
      } else {
        // Local mode update
        const localList = petLoad<LocalClub[]>(LOCAL_CLUBS_KEY, []);
        const updated = localList.map((c) => {
          if (c.id === clubId) {
            return {
              ...c,
              members: [
                ...c.members,
                {
                  id: student.id,
                  name: student.user?.name || "Student",
                  class: `${student.class}${student.section ? student.section : ""}`,
                },
              ],
            };
          }
          return c;
        });
        petSave(LOCAL_CLUBS_KEY, updated);

        setMembers((prev) => [
          ...prev,
          {
            id: student.id,
            studentId: student.id,
            name: student.user?.name || "Student",
            class: student.class,
            section: student.section,
            role: "Member",
            joinedAt: new Date().toISOString(),
          },
        ]);
      }

      setSelectedCandidates((prev) => {
        const next = new Set(prev);
        next.delete(student.id);
        return next;
      });

      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
      Toast.fire({
        icon: "success",
        title: `${student.user?.name || "Student"} enrolled into ${club?.name}!`,
      });
    } catch (err: any) {
      Swal.fire({
        title: "Enrollment Failed",
        text: err?.message || "Could not add student to club.",
        icon: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleRemoveMember = async (member: ApiMember) => {
    const confirm = await Swal.fire({
      title: `Remove ${member.name}?`,
      text: `Are you sure you want to remove this student from ${club?.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Remove",
    });

    if (!confirm.isConfirmed) return;

    setBusyId(member.studentId);
    try {
      if (mode === "api") {
        const res = await fetch(`${PET_API_BASE}/api/activities/leave`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clubId, studentId: member.studentId }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to remove student");
      } else {
        const localList = petLoad<LocalClub[]>(LOCAL_CLUBS_KEY, []);
        const updated = localList.map((c) => {
          if (c.id === clubId) {
            return {
              ...c,
              members: c.members.filter((m) => m.id !== member.studentId),
            };
          }
          return c;
        });
        petSave(LOCAL_CLUBS_KEY, updated);
      }

      setMembers((prev) => prev.filter((m) => m.studentId !== member.studentId));

      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
      Toast.fire({
        icon: "info",
        title: `${member.name} removed from club`,
      });
    } catch (err: any) {
      Swal.fire({
        title: "Error",
        text: err?.message || "Failed to remove student from club.",
        icon: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  // Toggle selection for bulk add
  const toggleCandidateSelection = (id: string) => {
    setSelectedCandidates((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Select all visible candidates
  const toggleSelectAllVisible = () => {
    const visibleIds = filteredCandidates.map((c) => c.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedCandidates.has(id));

    if (allSelected) {
      setSelectedCandidates((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedCandidates((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  // Bulk add selected candidates
  const handleBulkAdd = async () => {
    const idsToAdd = Array.from(selectedCandidates);
    if (idsToAdd.length === 0) return;

    const confirm = await Swal.fire({
      title: `Enroll ${idsToAdd.length} Students?`,
      text: `Do you want to enroll ${idsToAdd.length} selected students into ${club?.name}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      confirmButtonText: `Yes, Enroll All (${idsToAdd.length})`,
    });

    if (!confirm.isConfirmed) return;

    setBulkAdding(true);
    let successCount = 0;
    const newMembersList: ApiMember[] = [];

    for (const sId of idsToAdd) {
      const student = students.find((s) => s.id === sId);
      if (!student) continue;

      try {
        if (mode === "api") {
          const res = await fetch(`${PET_API_BASE}/api/activities/join`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clubId, studentId: sId }),
          });
          const json = await res.json();
          if (json.success) {
            successCount++;
            newMembersList.push({
              id: json.data?.id || `m-${Date.now()}-${sId}`,
              studentId: sId,
              name: student.user?.name || "Student",
              class: student.class,
              section: student.section,
              role: "Member",
              joinedAt: new Date().toISOString(),
            });
          }
        } else {
          successCount++;
          newMembersList.push({
            id: sId,
            studentId: sId,
            name: student.user?.name || "Student",
            class: student.class,
            section: student.section,
            role: "Member",
            joinedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error(`Failed to enroll student ${sId}:`, err);
      }
    }

    if (mode === "local" && newMembersList.length > 0) {
      const localList = petLoad<LocalClub[]>(LOCAL_CLUBS_KEY, []);
      const updated = localList.map((c) => {
        if (c.id === clubId) {
          return {
            ...c,
            members: [
              ...c.members,
              ...newMembersList.map((m) => ({
                id: m.studentId,
                name: m.name,
                class: `${m.class}${m.section || ""}`,
              })),
            ],
          };
        }
        return c;
      });
      petSave(LOCAL_CLUBS_KEY, updated);
    }

    setMembers((prev) => [...prev, ...newMembersList]);
    setSelectedCandidates(new Set());
    setBulkAdding(false);

    Swal.fire({
      title: "Bulk Enrollment Complete",
      text: `Successfully enrolled ${successCount} students into ${club?.name}.`,
      icon: "success",
      confirmButtonColor: "#2563eb",
    });
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <PortalLayout
        title="Manage Club Roster"
        subtitle="Loading club details and student roster..."
        avatarLetter="P"
        avatarColor="#2563eb"
        themeClass="theme-pet"
        accentColor="#2563eb"
      >
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Loading club records...</span>
        </div>
      </PortalLayout>
    );
  }

  const isEligibleClass = (classNum: number) => {
    return classNum >= eligibility.minClass && classNum <= eligibility.maxClass;
  };

  const isAllVisibleSelected =
    filteredCandidates.length > 0 && filteredCandidates.every((c) => selectedCandidates.has(c.id));

  return (
    <PortalLayout
      title={`Manage Roster — ${club?.name || "Club"}`}
      subtitle="Class & Section wise student enrollment and member assignment"
      avatarLetter="P"
      avatarColor="#2563eb"
      themeClass="theme-pet"
      accentColor="#2563eb"
    >
      <div className="space-y-6 text-left">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/pet/clubs"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl shadow-sm"
          >
            <ArrowLeft size={15} /> Back to Clubs & Societies
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all shadow-sm"
              title="Refresh roster data"
            >
              <RefreshCw size={15} />
            </button>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode("split")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  viewMode === "split"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => setViewMode("tabs")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  viewMode === "tabs"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                Tabbed View
              </button>
            </div>
          </div>
        </div>

        {/* Club Details Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-inner">
                {renderPetClubIcon(club?.icon || "")}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    {club?.category || "Activity"}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                    <ShieldCheck size={12} /> {eligibility.label} ({eligibility.description})
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  {club?.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-blue-500" />
                    {club?.meetingTime || "Weekly Activity"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <GraduationCap size={13} className="text-purple-500" />
                    Sponsor: {club?.sponsor || "Physical Education Teacher (PET)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
              <div className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center min-w-[110px]">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Members</div>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{members.length}</div>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center min-w-[110px]">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Available to Add</div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {filteredCandidates.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Class and Section Wise Filter Bar */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Filter size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Class & Section Filters</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Target students by standard and section for quick club enrollment
                </p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-72">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student by name or roll..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Class Pill Filters */}
            <div className="md:col-span-8 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-blue-500" /> Class / Standard:
                </span>
                <label className="flex items-center gap-1.5 text-[11px] cursor-pointer text-slate-500 hover:text-blue-600">
                  <input
                    type="checkbox"
                    checked={enforceEligibility}
                    onChange={(e) => setEnforceEligibility(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Show only eligible classes ({eligibility.label})</span>
                </label>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedClass("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedClass === "all"
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  All Standards
                </button>
                {availableClasses.map((clsNum) => {
                  const eligible = isEligibleClass(clsNum);
                  return (
                    <button
                      key={clsNum}
                      onClick={() => setSelectedClass(String(clsNum))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                        selectedClass === String(clsNum)
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : eligible
                          ? "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                          : "bg-slate-100/50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 border-dashed border-slate-200 dark:border-slate-800 opacity-60"
                      }`}
                    >
                      <span>Class {clsNum}</span>
                      {eligible && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Eligible standard" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section Filter */}
            <div className="md:col-span-4 space-y-2">
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Layers size={14} className="text-blue-500" /> Section:
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedSection("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedSection === "all"
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  All
                </button>
                {availableSections.map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setSelectedSection(sec)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedSection === sec
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                    }`}
                  >
                    Sec {sec}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tab switcher for tabbed mode */}
        {viewMode === "tabs" && (
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab("add")}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === "add"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
              }`}
            >
              <UserPlus size={15} /> Add Students ({filteredCandidates.length})
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === "members"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
              }`}
            >
              <Users size={15} /> Enrolled Members ({filteredMembers.length})
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* Main Content Area: Split View OR Tabbed View */}
        {/* ========================================================================= */}
        <div
          className={`grid gap-6 ${
            viewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {/* ------------------------------------------------------------------- */}
          {/* COLUMN 1: Add Eligible Students */}
          {/* ------------------------------------------------------------------- */}
          {(viewMode === "split" || activeTab === "add") && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full min-h-[520px]">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserPlus size={16} className="text-blue-500" />
                    Available Students to Enroll
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Showing {filteredCandidates.length} eligible students
                    {selectedClass !== "all" && ` • Class ${selectedClass}`}
                    {selectedSection !== "all" && ` • Section ${selectedSection}`}
                  </p>
                </div>

                {filteredCandidates.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleSelectAllVisible}
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center gap-1 border border-slate-200 dark:border-slate-700 transition-colors"
                      title="Select / deselect all visible students"
                    >
                      {isAllVisibleSelected ? (
                        <>
                          <CheckSquare size={13} className="text-blue-600" /> Deselect All
                        </>
                      ) : (
                        <>
                          <Square size={13} /> Select All
                        </>
                      )}
                    </button>

                    {selectedCandidates.size > 0 && (
                      <button
                        onClick={handleBulkAdd}
                        disabled={bulkAdding}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/30 transition-all animate-in fade-in"
                      >
                        {bulkAdding ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Plus size={13} />
                        )}
                        Enroll ({selectedCandidates.size})
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Student Candidate Roster */}
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px] pr-1.5 custom-scrollbar">
                {filteredCandidates.map((student) => {
                  const isSelected = selectedCandidates.has(student.id);
                  const isBusy = busyId === student.id;
                  const cNum = extractClassNum(student.class);
                  const sec = normalizeSection(student.section);

                  return (
                    <div
                      key={student.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-blue-50/70 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800"
                          : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => toggleCandidateSelection(student.id)}
                          className="text-slate-400 hover:text-blue-600 p-0.5"
                        >
                          {isSelected ? (
                            <CheckSquare size={17} className="text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Square size={17} />
                          )}
                        </button>
                        <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs shrink-0">
                          {(student.user?.name || "S")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {student.user?.name || "Student"}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                              Class {cNum || student.class} - {sec || "A"}
                            </span>
                            {student.admissionNumber && (
                              <span>Adm: {student.admissionNumber}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddStudent(student)}
                        disabled={isBusy || bulkAdding}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-all shadow-sm"
                      >
                        {isBusy ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Plus size={13} />
                        )}
                        <span>Add</span>
                      </button>
                    </div>
                  );
                })}

                {filteredCandidates.length === 0 && (
                  <div className="text-center py-16 text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                    <CheckCircle2 size={32} className="text-emerald-500/50 mb-1" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">No available students found</span>
                    <span className="text-[11px] max-w-xs text-slate-400">
                      All matching students in this class/section might already be enrolled, or they are outside the standard eligibility window.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* COLUMN 2: Enrolled Members */}
          {/* ------------------------------------------------------------------- */}
          {(viewMode === "split" || activeTab === "members") && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full min-h-[520px]">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users size={16} className="text-blue-500" />
                    Enrolled Club Members ({members.length})
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Filtered view: {filteredMembers.length} member{filteredMembers.length === 1 ? "" : "s"}
                  </p>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {members.length} Enrolled
                </span>
              </div>

              {/* Members Roster */}
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px] pr-1.5 custom-scrollbar">
                {filteredMembers.map((member) => {
                  const isBusy = busyId === member.studentId;
                  const cNum = extractClassNum(member.class);
                  const sec = normalizeSection(member.section);

                  return (
                    <div
                      key={member.studentId}
                      className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-500/20">
                          {(member.name || "M")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {member.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                              Class {cNum || member.class} - {sec || "A"}
                            </span>
                            <span className="text-blue-600 dark:text-blue-400 font-bold">
                              {member.role || "Member"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveMember(member)}
                        disabled={isBusy}
                        className="px-2.5 py-1.5 text-red-500 hover:text-white hover:bg-red-500 border border-red-200 dark:border-red-900/40 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shrink-0"
                        title="Remove member from club"
                      >
                        {isBusy ? (
                          <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                        <span>Remove</span>
                      </button>
                    </div>
                  );
                })}

                {filteredMembers.length === 0 && (
                  <div className="text-center py-16 text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                    <Users size={32} className="text-slate-400/50 mb-1" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">No members matching filters</span>
                    <span className="text-[11px] max-w-xs text-slate-400">
                      {members.length === 0
                        ? "This club does not have any enrolled students yet. Use the Add Students panel to enroll candidates."
                        : "No enrolled members found for the selected Class/Section."}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
