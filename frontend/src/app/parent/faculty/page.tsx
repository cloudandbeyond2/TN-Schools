"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import ParentPortalBanner from "@/components/ParentPortalBanner";
import { useParentChildren, getApiBase, Child } from "@/lib/useParentChildren";
import {
  Building2,
  Search,
  BookOpen,
  GraduationCap,
  Award,
  Calendar,
  ShieldCheck,
  Users,
  Filter,
  Info,
  CheckCircle2,
  ChevronRight,
  UserCheck,
  User,
  Sparkles
} from "lucide-react";

interface Headmaster {
  id: string;
  name: string;
  emisId: string;
  designation: string;
  role: string;
  qualification: string;
  experience: string;
  department: string;
  schoolName: string;
  gender: string;
}

interface Teacher {
  id: string;
  userId?: string | null;
  name: string;
  emisId: string;
  designation: string;
  subject: string;
  department: string;
  assignedClass?: string | null;
  assignedSection?: string | null;
  isClassTeacher: boolean;
  qualification: string;
  experience: string;
  gender: string;
  staffType: string;
}

interface SchoolInfo {
  id: string;
  name: string;
  dise: string;
  district: string;
  block: string;
  schoolType: string;
  mediumOfInstruction: string;
}

function ChildSwitcher({
  childList,
  active,
  onChange,
}: {
  childList: Child[];
  active: Child | null;
  onChange: (c: Child) => void;
}) {
  if (childList.length <= 1) return null;
  return (
    <div className="flex items-center gap-3 mb-6 p-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex-wrap shadow-sm">
      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5 text-emerald-600" /> Viewing Faculty For:
      </span>
      {childList.map((c) => (
        <button
          key={c.studentId}
          onClick={() => onChange(c)}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            active?.studentId === c.studentId
              ? "bg-emerald-600 text-white shadow-md scale-105"
              : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
          }`}
        >
          {c.name.split(" ")[0]} · Class {c.class}
          {c.section}
        </button>
      ))}
    </div>
  );
}

export default function ParentFacultyPage() {
  const { parentId, children, activeChild, setActiveChild, childrenLoading } = useParentChildren();

  const [school, setSchool] = useState<SchoolInfo | null>(null);
  const [headmasters, setHeadmasters] = useState<Headmaster[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "HM" | "CLASS_TEACHERS" | "SUBJECT_TEACHERS">("ALL");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | Headmaster | null>(null);

  const fetchFaculty = useCallback(async (schoolId?: string) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (schoolId) queryParams.set("schoolId", schoolId);
      else if (parentId) queryParams.set("parentId", parentId);

      const res = await fetch(`${getApiBase()}/api/parent/faculty?${queryParams.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSchool(json.data.school);
        setHeadmasters(json.data.headmasters || []);
        setTeachers(json.data.teachers || []);
      }
    } catch (err) {
      console.error("Error loading faculty data:", err);
    } finally {
      setLoading(false);
    }
  }, [parentId]);

  useEffect(() => {
    if (activeChild?.schoolId) {
      fetchFaculty(activeChild.schoolId);
    } else if (parentId) {
      fetchFaculty();
    }
  }, [activeChild?.schoolId, parentId, fetchFaculty]);

  // Filter logic
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.assignedClass && t.assignedClass.includes(searchQuery));

      if (!matchesSearch) return false;

      if (activeFilter === "CLASS_TEACHERS") return t.isClassTeacher;
      if (activeFilter === "SUBJECT_TEACHERS") return !t.isClassTeacher;
      return true;
    });
  }, [teachers, searchQuery, activeFilter]);

  const filteredHeadmasters = useMemo(() => {
    if (activeFilter === "CLASS_TEACHERS" || activeFilter === "SUBJECT_TEACHERS") return [];
    return headmasters.filter(
      (hm) =>
        hm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hm.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hm.qualification.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [headmasters, searchQuery, activeFilter]);

  const getAvatarGradient = (gender: string, isHM: boolean) => {
    if (isHM) return "from-amber-500 via-amber-600 to-amber-700 text-white shadow-amber-500/30";
    if (gender === "Female") return "from-rose-500 via-pink-600 to-rose-700 text-white shadow-pink-500/20";
    return "from-emerald-600 via-teal-600 to-emerald-800 text-white shadow-emerald-500/20";
  };

  const classTeacherCount = teachers.filter((t) => t.isClassTeacher).length;
  const subjectTeacherCount = teachers.filter((t) => !t.isClassTeacher).length;

  return (
    <PortalLayout>
      <div className="space-y-6 pb-12">
        {/* Banner */}
        <ParentPortalBanner pageKey="faculty" />

        {/* Child Switcher */}
        <ChildSwitcher childList={children} active={activeChild} onChange={setActiveChild} />

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Faculty</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {headmasters.length + teachers.length}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              Verified Academic Staff
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Leadership</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {headmasters.length}
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
              Headmaster / Principal
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Class Teachers</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {classTeacherCount}
            </div>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
              Section In-charges
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Subject Teachers</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {subjectTeacherCount}
            </div>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
              Subject Specialists
            </p>
          </div>
        </div>

        {/* Controls Bar: Search & Filter Tabs */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search faculty by teacher name, subject, or class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveFilter("ALL")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === "ALL"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              All Faculty ({headmasters.length + teachers.length})
            </button>
            <button
              onClick={() => setActiveFilter("HM")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === "HM"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Headmaster ({headmasters.length})
            </button>
            <button
              onClick={() => setActiveFilter("CLASS_TEACHERS")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === "CLASS_TEACHERS"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Class Teachers ({classTeacherCount})
            </button>
            <button
              onClick={() => setActiveFilter("SUBJECT_TEACHERS")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeFilter === "SUBJECT_TEACHERS"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Subject Teachers ({subjectTeacherCount})
            </button>
          </div>
        </div>

        {/* Content Directory */}
        {loading ? (
          <div className="py-24 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700/80 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
              Loading School Faculty Directory...
            </p>
          </div>
        ) : filteredHeadmasters.length === 0 && filteredTeachers.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-8 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No teachers found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              No faculty member matched your query &quot;{searchQuery}&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("ALL");
              }}
              className="mt-4 px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1. Headmaster & Principal Section */}
            {filteredHeadmasters.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Headmaster & School Administration
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredHeadmasters.map((hm) => (
                    <div
                      key={hm.id}
                      className="group relative bg-gradient-to-br from-amber-50/90 via-white to-amber-100/40 dark:from-amber-950/20 dark:via-slate-800 dark:to-slate-900 border-2 border-amber-300/80 dark:border-amber-500/40 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start gap-4">
                          {/* Profile Avatar Card */}
                          <div
                            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getAvatarGradient(
                              hm.gender,
                              true
                            )} flex items-center justify-center font-black text-2xl shadow-md shrink-0 ring-4 ring-amber-400/20`}
                          >
                            {hm.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow-sm">
                                Headmaster
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                EMIS: {hm.emisId}
                              </span>
                            </div>

                            <h4 className="text-lg font-black text-slate-900 dark:text-white mt-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                              {hm.name}
                            </h4>

                            <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                              {hm.designation}
                            </p>
                          </div>
                        </div>

                        {/* Credentials & Details */}
                        <div className="mt-5 pt-4 border-t border-amber-200/70 dark:border-slate-700/70 grid grid-cols-2 gap-3 text-xs">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" />
                            <span className="font-semibold truncate">{hm.qualification}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                            <span className="font-semibold truncate">{hm.experience}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-amber-100/70 dark:bg-amber-950/40 px-3.5 py-2 rounded-xl">
                        <span className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Institutional Head
                        </span>
                        <span className="font-bold text-slate-600 dark:text-slate-300">
                          {school?.name || "TN Govt. School"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Teachers Directory Section */}
            {filteredTeachers.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Teaching Staff ({filteredTeachers.length})
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    AY 2024-25 Roster
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredTeachers.map((t) => {
                    const isChildClassTeacher =
                      activeChild?.class &&
                      t.assignedClass &&
                      String(t.assignedClass) === String(activeChild.class) &&
                      (!activeChild.section || !t.assignedSection || t.assignedSection === activeChild.section);

                    return (
                      <div
                        key={t.id}
                        className={`group relative bg-white dark:bg-slate-800/90 border rounded-3xl p-5 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between ${
                          isChildClassTeacher
                            ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-800"
                            : "border-slate-200 dark:border-slate-700/80 hover:border-emerald-400"
                        }`}
                      >
                        <div>
                          {/* Card Header & Avatar */}
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getAvatarGradient(
                                t.gender,
                                false
                              )} flex items-center justify-center font-bold text-lg shadow-md shrink-0`}
                            >
                              {t.name.charAt(0).toUpperCase()}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {t.isClassTeacher ? (
                                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                                    Class Teacher
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                    Subject Teacher
                                  </span>
                                )}

                                {isChildClassTeacher && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 shadow-sm animate-pulse">
                                    Child&apos;s CT
                                  </span>
                                )}
                              </div>

                              <h4 className="text-base font-black text-slate-900 dark:text-white mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                {t.gender === "Female" ? "Mrs. " : "Mr. "}
                                {t.name}
                              </h4>

                              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 truncate">
                                {t.designation}
                              </p>
                            </div>
                          </div>

                          {/* Subjects & Class Tag Badges */}
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            <div className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{t.subject}</span>
                            </div>

                            {t.assignedClass && (
                              <div className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                                <span>
                                  Grade {t.assignedClass}
                                  {t.assignedSection ? ` - ${t.assignedSection}` : ""}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Footer Details */}
                        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <span className="flex items-center gap-1.5 truncate max-w-[150px]" title={t.qualification}>
                            <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                            {t.qualification}
                          </span>
                          <span className="flex items-center gap-1.5 shrink-0">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {t.experience}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informational Guidance Footer */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
          <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              Official Faculty Directory Guidelines
            </p>
            <p className="mt-0.5 leading-relaxed">
              Teacher profiles are displayed to help parents stay informed about the academic leadership and subject educators handling their children. For parent-teacher meetings or scheduling consultations, please visit the{" "}
              <a href="/parent/pta" className="text-emerald-600 dark:text-emerald-400 font-bold underline hover:text-emerald-700">
                PTA Meetings Portal
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
