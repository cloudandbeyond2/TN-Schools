"use client";

import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface Subject {
  id: string;
  name: string;
  class: string;
  icon: string | null;
  color: string | null;
}

interface Topic {
  id: string;
  name: string;
  topicNumber: number;
}

interface Unit {
  id: string;
  name: string;
  unitNumber: number;
  isApproved: boolean;
  topics: Topic[];
}

export default function StudentSyllabusPage() {
  const { data: session, status } = useSession();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [studentClass, setStudentClass] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(true);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState<boolean>(false);
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Determine student class from session, default to "10"
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userClass = (session?.user as any)?.class;
      if (userClass) {
        setStudentClass(String(userClass));
      } else {
        setStudentClass("10"); // Fallback standard
      }
    } else if (status === "unauthenticated") {
      setStudentClass("10"); // Fallback standard
    }
  }, [session, status]);

  // Fetch subjects when studentClass is set
  useEffect(() => {
    if (!studentClass) return;

    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      setSubjects([]);
      setSelectedSubject(null);
      setUnits([]);
      setExpandedUnitId(null);

      try {
        const studentId = (session?.user as any)?.studentId || "";
        const url = studentId 
          ? `${API_URL}/api/centralized-content/subjects?class=${studentClass}&studentId=${studentId}`
          : `${API_URL}/api/centralized-content/subjects?class=${studentClass}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.success) {
          setSubjects(json.data);
          if (json.data.length > 0) {
            handleSelectSubject(json.data[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching subjects", err);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentClass, session]);

  const handleSelectSubject = async (sub: Subject) => {
    setSelectedSubject(sub);
    setUnits([]);
    setExpandedUnitId(null);
    setLoadingUnits(true);

    try {
      const res = await fetch(`${API_URL}/api/centralized-content/subjects/${sub.id}/units`);
      const json = await res.json();
      if (!json.success) return;

      const unitsData: Unit[] = json.data;
      unitsData.sort((a, b) => a.unitNumber - b.unitNumber);
      setUnits(unitsData);
    } catch (err) {
      console.error("Error fetching units", err);
    } finally {
      setLoadingUnits(false);
    }
  };

  const filteredUnits = units.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PortalLayout
      title="Syllabus"
      subtitle="View curriculum chapters and topics for your class standard."
      avatarLetter="A"
      avatarColor="#6366f1"
      themeClass="theme-student"
      accentColor="#6366f1"
    >
      {/* Header Info */}
      <div className="flex items-center justify-between gap-4 mb-6 glass rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-wider mb-1">
            📖 My Class Syllabus
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Browse chapters, topics, and lessons assigned to your standard.
          </p>
        </div>
        <span className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-extrabold text-sm rounded-xl border border-indigo-200/20 shadow-sm">
          Class {studentClass}th Standard
        </span>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        {/* Left: Subjects Sidebar */}
        <div className="glass rounded-2xl p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Subjects
          </h3>
          {loadingSubjects ? (
            <div className="py-8 flex flex-col items-center">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-[10px] text-slate-500">Loading...</span>
            </div>
          ) : subjects.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No subjects created for your standard.</p>
          ) : (
            <div className="space-y-2">
              {subjects.map((sub) => {
                const isSelected = sub.id === selectedSubject?.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSelectSubject(sub)}
                    className={`w-full text-left rounded-xl p-3 transition border ${
                      isSelected
                        ? "bg-indigo-550 text-white font-bold shadow-md border-indigo-550"
                        : "bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-650 dark:text-slate-300"
                    }`}
                    style={isSelected ? { background: `linear-gradient(135deg, ${sub.color || "#6366f1"}, ${sub.color || "#6366f1"}dd)` } : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base flex items-center justify-center">
                        {sub.icon || "📚"}
                      </span>
                      <span className="text-xs font-semibold">{sub.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Chapters/Units Table */}
        <div className="lg:col-span-3 glass rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30">
          {selectedSubject ? (
            <>
              {/* Table Header Controls */}
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2">
                    {selectedSubject.icon || "📚"} {selectedSubject.name} — Class {studentClass}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {units.length} units listed · {units.filter((u) => u.isApproved).length} approved
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search chapters..."
                    className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 w-44"
                  />
                </div>
              </div>

              {/* Table Container */}
              {loadingUnits ? (
                <div className="py-20 flex flex-col items-center">
                  <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <span className="text-xs text-slate-400 animate-pulse">Loading curriculum data...</span>
                </div>
              ) : filteredUnits.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-xs">
                  {searchQuery ? "No units match your search query." : "No units found for this subject."}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                        <th className="py-3 px-4 w-16">No</th>
                        <th className="py-3 px-4">Chapter / Unit Title</th>
                        <th className="py-3 px-4 w-28">Topics</th>
                        <th className="py-3 px-4 w-28 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                      {filteredUnits.map((u) => {
                        const isExpanded = expandedUnitId === u.id;
                        // Dynamically check if topicNumber: 1 is the "Unit Overview"
                        const hasOverview = u.topics.some((t) => t.topicNumber === 1 && (t.name === "Unit Overview" || t.name === "Overview"));
                        const realLessons = hasOverview ? u.topics.filter((t) => t.topicNumber !== 1) : u.topics;
                        return (
                          <React.Fragment key={u.id}>
                            <tr
                              onClick={() => setExpandedUnitId(isExpanded ? null : u.id)}
                              className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors cursor-pointer"
                            >
                              <td className="py-4 px-4 font-extrabold text-indigo-600 dark:text-indigo-400">
                                {u.unitNumber}
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-xs font-semibold text-slate-800 dark:text-white">
                                  {u.name}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-xs text-slate-400 font-medium">
                                {realLessons.length} topic{realLessons.length !== 1 ? "s" : ""}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                    u.isApproved
                                      ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400"
                                      : "text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400"
                                  }`}
                                >
                                  {u.isApproved ? "Published" : "Draft"}
                                </span>
                              </td>
                            </tr>

                            {/* Subtopics Nested View */}
                            {isExpanded && (
                              <tr>
                                <td colSpan={4} className="bg-slate-50/50 dark:bg-slate-950/30 p-4 border-b border-slate-200 dark:border-slate-800">
                                  <div className="pl-6 space-y-3">
                                    <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                                      <span>📚</span> Lessons & Subtopics inside Unit {u.unitNumber}
                                    </h4>
                                    {realLessons.length === 0 ? (
                                      <p className="text-xs text-slate-550 italic pl-1">
                                        No subtopics recorded under this unit.
                                      </p>
                                    ) : (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1">
                                        {realLessons.map((t, idx) => (
                                          <div
                                            key={t.id}
                                            className="flex items-center gap-2.5 text-xs text-slate-650 dark:text-slate-350 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/40 p-2 rounded-lg"
                                          >
                                            <span className="font-extrabold text-indigo-600 dark:text-indigo-500/75 shrink-0">
                                              {u.unitNumber}.{hasOverview ? t.topicNumber - 1 : t.topicNumber}
                                            </span>
                                            <span className="truncate">{t.name}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs">
              👈 Select a subject from the sidebar to inspect its syllabus
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}

// Helper to support React fragment rendering inside iteration
import React from "react";
