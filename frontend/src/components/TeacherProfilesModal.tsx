"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Search,
  Award,
  BookOpen,
  GraduationCap,
  Building2,
  Calendar,
  CheckCircle2,
  Filter,
  Sparkles,
  Info,
  ShieldCheck,
  User
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

interface TeacherProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId?: string | null;
  parentId?: string | null;
  childName?: string | null;
  childClass?: string | null;
  childSection?: string | null;
}

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

export default function TeacherProfilesModal({
  isOpen,
  onClose,
  schoolId,
  parentId,
  childName,
  childClass,
  childSection
}: TeacherProfilesModalProps) {
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState<SchoolInfo | null>(null);
  const [headmasters, setHeadmasters] = useState<Headmaster[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "HM" | "CLASS_TEACHERS" | "SUBJECT_TEACHERS">("ALL");
  const [selectedStaff, setSelectedStaff] = useState<Headmaster | Teacher | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchFaculty = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (schoolId) queryParams.set("schoolId", schoolId);
        if (parentId) queryParams.set("parentId", parentId);

        const res = await fetch(`${getApiBase()}/api/parent/faculty?${queryParams.toString()}`);
        const json = await res.json();
        if (json.success && json.data) {
          setSchool(json.data.school);
          setHeadmasters(json.data.headmasters || []);
          setTeachers(json.data.teachers || []);
        }
      } catch (err) {
        console.error("Failed to load faculty profiles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, [isOpen, schoolId, parentId]);

  // Filtered teachers list
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

  // Filtered headmasters list
  const filteredHeadmasters = useMemo(() => {
    if (activeFilter === "CLASS_TEACHERS" || activeFilter === "SUBJECT_TEACHERS") return [];
    return headmasters.filter(
      (hm) =>
        hm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hm.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hm.qualification.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [headmasters, searchQuery, activeFilter]);

  if (!isOpen) return null;

  const getAvatarGradient = (gender: string, isHM: boolean) => {
    if (isHM) return "from-amber-500 via-amber-600 to-amber-700 text-white shadow-amber-500/30";
    if (gender === "Female") return "from-rose-500 via-pink-600 to-rose-700 text-white shadow-pink-500/20";
    return "from-emerald-600 via-teal-600 to-emerald-800 text-white shadow-emerald-500/20";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div className="relative bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white p-5 sm:p-6 pb-6 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center text-2xl shadow-inner">
                <Building2 className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    School Faculty & Teachers
                  </h2>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                    Official Directory
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                  {school ? `${school.name} (DISE: ${school.dise || "330101"})` : "Government School Faculty"}
                </p>
                {childName && (
                  <p className="text-[11px] text-amber-300/90 font-medium mt-1">
                    Showing faculty for {childName} {childClass ? `· Class ${childClass}${childSection ? childSection : ""}` : ""}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search and Filters Bar */}
          <div className="relative z-10 mt-5 pt-4 border-t border-emerald-700/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-200/70" />
              <input
                type="text"
                placeholder="Search teacher by name, subject, or class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-white placeholder-emerald-200/50 focus:outline-none focus:border-amber-400 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-300 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setActiveFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  activeFilter === "ALL"
                    ? "bg-amber-400 text-slate-950 shadow-sm"
                    : "bg-emerald-950/50 text-emerald-200 hover:bg-emerald-800/60"
                }`}
              >
                All ({headmasters.length + teachers.length})
              </button>
              <button
                onClick={() => setActiveFilter("HM")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  activeFilter === "HM"
                    ? "bg-amber-400 text-slate-950 shadow-sm"
                    : "bg-emerald-950/50 text-emerald-200 hover:bg-emerald-800/60"
                }`}
              >
                Headmaster ({headmasters.length})
              </button>
              <button
                onClick={() => setActiveFilter("CLASS_TEACHERS")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  activeFilter === "CLASS_TEACHERS"
                    ? "bg-amber-400 text-slate-950 shadow-sm"
                    : "bg-emerald-950/50 text-emerald-200 hover:bg-emerald-800/60"
                }`}
              >
                Class Teachers ({teachers.filter((t) => t.isClassTeacher).length})
              </button>
              <button
                onClick={() => setActiveFilter("SUBJECT_TEACHERS")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  activeFilter === "SUBJECT_TEACHERS"
                    ? "bg-amber-400 text-slate-950 shadow-sm"
                    : "bg-emerald-950/50 text-emerald-200 hover:bg-emerald-800/60"
                }`}
              >
                Subject Teachers ({teachers.filter((t) => !t.isClassTeacher).length})
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Loading School Faculty Directory...</p>
            </div>
          ) : filteredHeadmasters.length === 0 && filteredTeachers.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No teachers found</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                No faculty members match your search &quot;{searchQuery}&quot;.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("ALL");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* Headmaster / Principal Section */}
              {filteredHeadmasters.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Headmaster & School Leadership
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredHeadmasters.map((hm) => (
                      <div
                        key={hm.id}
                        className="group relative bg-gradient-to-br from-amber-50/80 via-white to-amber-100/40 dark:from-amber-950/20 dark:via-slate-800 dark:to-slate-900 border-2 border-amber-300/70 dark:border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="flex items-start gap-4">
                          {/* Profile Avatar */}
                          <div
                            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getAvatarGradient(
                              hm.gender,
                              true
                            )} flex items-center justify-center font-black text-xl shadow-md shrink-0 ring-4 ring-amber-400/20`}
                          >
                            {hm.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500 text-slate-950">
                                Headmaster
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                EMIS: {hm.emisId}
                              </span>
                            </div>

                            <h4 className="text-base font-black text-slate-900 dark:text-white mt-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                              {hm.name}
                            </h4>

                            <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                              {hm.designation}
                            </p>
                          </div>
                        </div>

                        {/* Details grid */}
                        <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <GraduationCap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate font-medium">{hm.qualification}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate font-medium">{hm.experience}</span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-amber-100/60 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl">
                          <span className="flex items-center gap-1 font-semibold text-amber-800 dark:text-amber-300">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Institutional Head
                          </span>
                          <span className="font-bold text-slate-600 dark:text-slate-300">
                            TN Govt. School Admin
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Teaching Staff Section */}
              {filteredTeachers.length > 0 && (
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Teaching Staff ({filteredTeachers.length})
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Profiles updated for Academic Year 2024-25
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTeachers.map((t) => {
                      const isChildClassTeacher =
                        childClass &&
                        t.assignedClass &&
                        String(t.assignedClass) === String(childClass) &&
                        (!childSection || !t.assignedSection || t.assignedSection === childSection);

                      return (
                        <div
                          key={t.id}
                          className={`group relative bg-white dark:bg-slate-800/80 border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                            isChildClassTeacher
                              ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-gradient-to-b from-emerald-50/40 to-white dark:from-emerald-950/20 dark:to-slate-800"
                              : "border-slate-200 dark:border-slate-700/80 hover:border-emerald-400"
                          }`}
                        >
                          <div>
                            {/* Card Header with Avatar */}
                            <div className="flex items-start gap-3.5">
                              <div
                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarGradient(
                                  t.gender,
                                  false
                                )} flex items-center justify-center font-bold text-base shadow-sm shrink-0`}
                              >
                                {t.name.charAt(0).toUpperCase()}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {t.isClassTeacher ? (
                                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                                      Class Teacher
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                      Subject Teacher
                                    </span>
                                  )}

                                  {isChildClassTeacher && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                                      Your Child&apos;s CT
                                    </span>
                                  )}
                                </div>

                                <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                  {t.gender === "Female" ? "Mrs. " : "Mr. "}
                                  {t.name}
                                </h4>

                                <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 truncate">
                                  {t.designation}
                                </p>
                              </div>
                            </div>

                            {/* Subject & Class Badges */}
                            <div className="mt-3.5 flex flex-wrap gap-1.5">
                              <div className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                                <BookOpen className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span className="truncate">{t.subject}</span>
                              </div>

                              {t.assignedClass && (
                                <div className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/40 text-[11px] font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                                  <span>Grade {t.assignedClass}{t.assignedSection ? ` - ${t.assignedSection}` : ""}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Footer Details */}
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            <span className="flex items-center gap-1 truncate max-w-[130px]" title={t.qualification}>
                              <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {t.qualification}
                            </span>
                            <span className="flex items-center gap-1 shrink-0">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {t.experience}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info note */}
        <div className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              This directory provides verified academic profiles of teachers. For school meetings, please use the official PTA portal.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shrink-0"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
}
