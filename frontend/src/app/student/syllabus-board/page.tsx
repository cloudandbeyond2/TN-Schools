/* eslint-disable @next/next/no-img-element */
"use client";

import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const getSubjectIcon = (name: string): string => {
  const normalized = name.toLowerCase().trim();
  if (normalized.includes("tamil")) return "fi-sr-scroll";
  if (normalized.includes("english")) return "fi-sr-book";
  if (normalized.includes("math")) return "fi-sr-ruler-triangle";
  if (normalized.includes("science") && !normalized.includes("social")) return "fi-sr-flask";
  if (normalized.includes("social")) return "fi-sr-globe";
  if (normalized.includes("physics")) return "fi-sr-atom";
  if (normalized.includes("chemistry")) return "fi-sr-flask";
  if (normalized.includes("biology")) return "fi-sr-dna";
  if (normalized.includes("computer")) return "fi-sr-laptop";
  return "fi-sr-book"; // fallback
};

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

interface Content {
  id: string;
  contentType: string;
  fileUrl: string | null;
}

interface UnitCard {
  unitId: string;
  unitNumber: number;
  unitName: string;
  imageUrl: string | null;
}

export default function StudentSyllabusBoardPage() {
  const { data: session, status } = useSession();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [selectedClass, setSelectedClass] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(true);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [unitCards, setUnitCards] = useState<UnitCard[]>([]);
  const [loadingUnits, setLoadingUnits] = useState<boolean>(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated" && session?.user) {
      const userClass = (session?.user as any)?.class;
      if (userClass) {
        const num = String(userClass).match(/\d+/)?.[0] || String(userClass);
        setSelectedClass(num);
        return;
      }
    }
    // Fallback if not authenticated or class is missing
    if (!selectedClass) {
      setSelectedClass("10"); // default to 10
    }
  }, [session, status, selectedClass]);

  useEffect(() => {
    if (!selectedClass) return;

    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      setSubjects([]);
      setSelectedSubject(null);
      setUnitCards([]);

      try {
        const studentId = (session?.user as any)?.studentId || "";
        const cleanClass = selectedClass.match(/\d+/)?.[0] || selectedClass;
        const url = studentId 
          ? `${API_URL}/api/centralized-content/subjects?class=${cleanClass}&studentId=${studentId}`
          : `${API_URL}/api/centralized-content/subjects?class=${cleanClass}`;
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
  }, [selectedClass, session]);

  const handleSelectSubject = async (sub: Subject) => {
    setSelectedSubject(sub);
    setUnitCards([]);
    setLoadingUnits(true);

    try {
      const schoolId = (session?.user as any)?.schoolId || "";
      const cleanClass = selectedClass.match(/\d+/)?.[0] || selectedClass;
      const url = `${API_URL}/api/centralized-content/subjects/${sub.id}/units?schoolId=${schoolId}&approvedOnly=true&class=${cleanClass}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!json.success) return;

      const units: Unit[] = json.data;

      const cards = await Promise.all(
        units.map(async (unit): Promise<UnitCard> => {
          const overviewTopic = unit.topics[0];
          if (!overviewTopic) return { unitId: unit.id, unitNumber: unit.unitNumber, unitName: unit.name, imageUrl: null };
          try {
            const cRes = await fetch(`${API_URL}/api/centralized-content/topics/${overviewTopic.id}/contents`);
            const cJson = await cRes.json();
            const infographic: Content | undefined = (cJson.data || []).find((c: Content) => c.contentType === "INFOGRAPHIC");
            return { unitId: unit.id, unitNumber: unit.unitNumber, unitName: unit.name, imageUrl: infographic?.fileUrl || null };
          } catch {
            return { unitId: unit.id, unitNumber: unit.unitNumber, unitName: unit.name, imageUrl: null };
          }
        })
      );

      cards.sort((a, b) => a.unitNumber - b.unitNumber);
      setUnitCards(cards);
    } catch (err) {
      console.error("Error fetching units", err);
    } finally {
      setLoadingUnits(false);
    }
  };

  return (
    <PortalLayout
      title="Class Syllabus Board"
      subtitle="Unit-by-unit visual summaries published for your class standard."
      avatarLetter="A"
      avatarColor="#6366f1"
      themeClass="theme-student"
      accentColor="#6366f1"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-start sm:items-center gap-3">
          <i className="fi fi-sr-clipboard-list text-xl sm:text-2xl text-indigo-600 dark:text-indigo-400 flex items-center shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-black text-black dark:text-white uppercase tracking-wider leading-tight">
              Syllabus Board
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              All centralized units published for your curriculum standard.
            </p>
          </div>
        </div>

        {selectedClass && (
          <div className="flex items-center gap-2 whitespace-nowrap shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60 self-start sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Grade:</span>
            <span className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-extrabold text-xs sm:text-sm rounded-xl border border-indigo-200/20 shadow-sm">
              <i className="fi fi-sr-graduation-cap flex items-center text-xs sm:text-sm" />
              Class {selectedClass}th Standard
            </span>
          </div>
        )}
      </div>

      {loadingSubjects ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-3" />
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider animate-pulse">Loading subjects...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center p-12 glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
          <i className="fi fi-sr-inbox text-5xl text-slate-350 dark:text-slate-600 block mb-4 mx-auto w-fit" />
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No syllabus board yet for Class {selectedClass}</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-6 flex-wrap">
            {subjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSelectSubject(sub)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                  selectedSubject?.id === sub.id
                    ? "text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-450"
                }`}
                style={
                  selectedSubject?.id === sub.id
                    ? { color: "#ffffff", background: `linear-gradient(135deg, ${sub.color || "#6366f1"}, ${sub.color || "#6366f1"}dd)`, borderColor: sub.color || "#6366f1" }
                    : undefined
                }
              >
                <i className={`fi ${getSubjectIcon(sub.name)} text-[13px] flex items-center`} />
                <span>{sub.name}</span>
              </button>
            ))}
          </div>

          {loadingUnits ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-3" />
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider animate-pulse">Loading units...</p>
            </div>
          ) : unitCards.length === 0 ? (
            <div className="text-center p-12 glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
              <i className="fi fi-sr-time-past text-5xl text-slate-350 dark:text-slate-600 block mb-4 mx-auto w-fit" />
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No units have been published yet for this subject.</p>
              <p className="text-xs text-slate-500 mt-2">Check back once the syllabus board is updated.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {unitCards.map((card) => (
                <Link
                  key={card.unitId}
                  href={`/student/syllabus-board/${card.unitId}`}
                  className="text-left rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 bg-white dark:bg-slate-955/40 block group"
                >
                  {card.imageUrl ? (
                    <img src={card.imageUrl} alt={card.unitName} className="w-full h-auto block group-hover:scale-[1.01] transition-transform duration-500" />

                  ) : (
                    <div className="h-44 bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 dark:from-slate-900/60 dark:to-slate-900/20 flex flex-col items-center justify-center p-6 text-center border-b border-slate-100 dark:border-slate-800/80 relative overflow-hidden group-hover:from-indigo-100/50 group-hover:to-indigo-200/20 transition-all duration-300 select-none">
                      {/* Decorative background grid pattern */}
                      <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.06] dark:opacity-[0.03]" />
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-inner relative z-10">
                        <i className="fi fi-sr-book text-lg text-indigo-550 dark:text-indigo-400 flex items-center" />
                      </div>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200 relative z-10 leading-snug">
                        Unit {card.unitNumber} Overview
                      </span>
                      <span className="text-[9px] text-indigo-650 dark:text-indigo-450 font-extrabold uppercase tracking-widest mt-1.5 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-100/20 dark:border-indigo-900/20 relative z-10">
                        Pending AI Map
                      </span>
                    </div>
                  )}
                  <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                      Unit {card.unitNumber}: {card.unitName}
                    </p>
                    <span className="text-[10px] text-indigo-500 font-bold flex-shrink-0">View →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </PortalLayout>
  );
}
