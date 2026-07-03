"use client";

import PortalLayout from "@/components/PortalLayout";
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
  topics: Topic[];
}

interface Content {
  id: string;
  contentType: string;
  title: string;
  fileUrl: string | null;
  fileContent: string | null;
}

interface UnitCard {
  unitId: string;
  unitNumber: number;
  unitName: string;
  imageUrl: string | null;
  altText: string | null;
}

const CLASS_OPTIONS = ["6", "7", "8", "9", "10"];
const SECTION_OPTIONS = ["A", "B", "C", "D", "E"];

export default function TeacherSyllabusBoardPage() {
  const [selectedClass, setSelectedClass] = useState<string>("8");
  const [selectedSection, setSelectedSection] = useState<string>("A");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(true);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [unitCards, setUnitCards] = useState<UnitCard[]>([]);
  const [loadingUnits, setLoadingUnits] = useState<boolean>(false);

  const [lightbox, setLightbox] = useState<UnitCard | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Fetch subjects whenever the selected class changes
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      setSubjects([]);
      setSelectedSubject(null);
      setUnitCards([]);

      try {
        const res = await fetch(`${API_URL}/api/centralized-content/subjects?class=${selectedClass}`);
        const json = await res.json();
        if (json.success) {
          setSubjects(json.data);
          if (json.data.length > 0) {
            handleSelectSubject(json.data[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching central subjects", err);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]);

  const handleSelectSubject = async (sub: Subject) => {
    setSelectedSubject(sub);
    setUnitCards([]);
    setLoadingUnits(true);

    try {
      const res = await fetch(`${API_URL}/api/centralized-content/subjects/${sub.id}/units`);
      const json = await res.json();
      if (!json.success) return;

      const units: Unit[] = json.data;

      const cards = await Promise.all(
        units.map(async (unit): Promise<UnitCard> => {
          const overviewTopic = unit.topics[0];
          if (!overviewTopic) {
            return { unitId: unit.id, unitNumber: unit.unitNumber, unitName: unit.name, imageUrl: null, altText: null };
          }
          try {
            const cRes = await fetch(`${API_URL}/api/centralized-content/topics/${overviewTopic.id}/contents`);
            const cJson = await cRes.json();
            const infographic: Content | undefined = (cJson.data || []).find(
              (c: Content) => c.contentType === "INFOGRAPHIC"
            );
            return {
              unitId: unit.id,
              unitNumber: unit.unitNumber,
              unitName: unit.name,
              imageUrl: infographic?.fileUrl || null,
              altText: infographic?.fileContent || infographic?.title || unit.name,
            };
          } catch {
            return { unitId: unit.id, unitNumber: unit.unitNumber, unitName: unit.name, imageUrl: null, altText: null };
          }
        })
      );

      cards.sort((a, b) => a.unitNumber - b.unitNumber);
      setUnitCards(cards);
    } catch (err) {
      console.error("Error fetching central units", err);
    } finally {
      setLoadingUnits(false);
    }
  };

  const subjectColor = selectedSubject?.color || "#f59e0b";

  return (
    <PortalLayout
      title="Class Syllabus Board"
      subtitle="Unit-wise visual reference to plan your lessons, at a glance."
      avatarLetter="S"
      avatarColor="#f59e0b"
      themeClass="theme-teacher"
      accentColor="#f59e0b"
    >
      {/* Header: Class / Section selectors + subject tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 glass rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-wider mb-1">
            🗂️ Plan by Unit
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pick your class & section, then browse each unit's visual summary before planning a lesson.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Class</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-extrabold text-sm rounded-xl border border-amber-200/30 shadow-sm focus:outline-none"
            >
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}th
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Section</span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3 py-2 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-extrabold text-sm rounded-xl border border-amber-200/30 shadow-sm focus:outline-none"
            >
              {SECTION_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subject tabs */}
      {loadingSubjects ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-10 h-10 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin mb-3" />
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider animate-pulse">Loading subjects...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center p-12 glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
          <span className="text-5xl block mb-4">📭</span>
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No syllabus content yet for Class {selectedClass}</p>
          <p className="text-xs text-slate-500 mt-2">Try Class 8, which has the full Math & Science unit board.</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-6 flex-wrap">
            {subjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSelectSubject(sub)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                  selectedSubject?.id === sub.id
                    ? "text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-400"
                }`}
                style={
                  selectedSubject?.id === sub.id
                    ? { background: `linear-gradient(135deg, ${sub.color || "#f59e0b"}, ${sub.color || "#f59e0b"}dd)`, borderColor: sub.color || "#f59e0b" }
                    : undefined
                }
              >
                <span>{sub.icon || "📚"}</span> {sub.name}
              </button>
            ))}
          </div>

          {/* Unit grid */}
          {loadingUnits ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin mb-3" />
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider animate-pulse">Loading units...</p>
            </div>
          ) : unitCards.length === 0 ? (
            <div className="text-center p-12 glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
              <span className="text-5xl block mb-4">📖</span>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No units found for this subject yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {unitCards.map((card) => (
                <button
                  key={card.unitId}
                  onClick={() => card.imageUrl && setLightbox(card)}
                  className="text-left rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all bg-white dark:bg-slate-950/40"
                  title={`${card.unitName} — Class ${selectedClass}${selectedSection} planning reference`}
                >
                  {card.imageUrl ? (
                    <img src={card.imageUrl} alt={card.altText || card.unitName} className="w-full h-auto block" />
                  ) : (
                    <div className="h-40 flex items-center justify-center text-slate-400 text-xs font-semibold">
                      No visual available for Unit {card.unitNumber}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <div className="max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.imageUrl || ""} alt={lightbox.altText || lightbox.unitName} className="w-full h-auto rounded-2xl shadow-2xl" />
            <button
              onClick={() => setLightbox(null)}
              className="mt-4 mx-auto block px-5 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: subjectColor }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
