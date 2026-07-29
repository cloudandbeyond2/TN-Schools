"use client";
import { Mailbox, Book } from "lucide-react";

import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

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
  isApproved: boolean;
}

interface ClassRoom {
  id: string;
  className: string;
  section: string;
  subject: string;
}

export default function TeacherSyllabusBoardPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const user = session?.user as any;
  const schoolId = user?.schoolId || "";
  const teacherId = user?.id || "";
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Teacher's assigned classes from DB
  const [teacherClasses, setTeacherClasses] = useState<ClassRoom[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [unitCards, setUnitCards] = useState<UnitCard[]>([]);
  const [loadingUnits, setLoadingUnits] = useState<boolean>(false);

  // ── Fetch teacher's classes from DB ─────────────────────────
  const fetchTeacherClasses = useCallback(async () => {
    if (!schoolId || !teacherId) return;
    setLoadingClasses(true);
    try {
      const res = await fetch(`${API_URL}/api/classes?schoolId=${schoolId}&teacherId=${teacherId}`);
      const data = await res.json();
      if (data.success) {
        setTeacherClasses(data.data);
      }
    } catch (err) {
      console.error("Error fetching teacher classes:", err);
    } finally {
      setLoadingClasses(false);
    }
  }, [schoolId, teacherId, API_URL]);

  useEffect(() => { fetchTeacherClasses(); }, [fetchTeacherClasses]);

  // Derive unique class numbers and sections from teacher's real data
  const classOptions = Array.from(
    new Set(teacherClasses.map((c) => c.className))
  ).sort((a, b) => parseInt(a) - parseInt(b));

  const sectionOptions = Array.from(
    new Set(
      teacherClasses
        .filter((c) => c.className === selectedClass)
        .map((c) => c.section)
    )
  ).sort();

  // Auto-select first class when teacher classes load
  useEffect(() => {
    if (classOptions.length > 0 && !selectedClass) {
      setSelectedClass(classOptions[0]);
    }
  }, [teacherClasses]);

  // Auto-select first section when class changes
  useEffect(() => {
    if (sectionOptions.length > 0) {
      if (!sectionOptions.includes(selectedSection)) {
        setSelectedSection(sectionOptions[0]);
      }
    }
  }, [selectedClass, teacherClasses]);

  // ── Fetch subjects when class changes ───────────────────────
  useEffect(() => {
    if (!selectedClass) return;

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
            return { unitId: unit.id, unitNumber: unit.unitNumber, unitName: unit.name, imageUrl: null, altText: null, isApproved: unit.isApproved };
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
              isApproved: unit.isApproved,
            };
          } catch {
            return { unitId: unit.id, unitNumber: unit.unitNumber, unitName: unit.name, imageUrl: null, altText: null, isApproved: unit.isApproved };
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

  const publishedCount = unitCards.filter((c) => c.isApproved).length;
  const accent = selectedSubject?.color || "#f59e0b";

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "வகுப்பு பாடத்திட்ட பலகை" : "Class Syllabus Board"}
      subtitle={lang === "தமிழ்" ? "பாடத்திட்டம் மேலோட்டமாக ஒவ்வோரு பிரிவிற்கும் காட்சி உலகம்." : "Unit-wise visual reference to plan your lessons, at a glance."}
      avatarLetter="S"
      avatarColor="#f59e0b"
      themeClass="theme-teacher"
      accentColor="#f59e0b"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 glass rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-wider mb-1">
            {lang === "தமிழ்" ? "பிரிவு் மூலம் திட்டமிடு" : "Plan by Unit"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === "தமிழ்" ? "உங்கள் வகுப்பு & பிரிவைத் தேர்வு செய்து, பாடத்திட்டம் திட்டமிடும் முன் ஒவ்வோரு பிரிவிற் காட்சி சுருக்கத்தைப் பாருங்கள்." : "Pick your class & section, then browse each unit's visual summary before planning a lesson."}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Published count chip */}
          {unitCards.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs rounded-xl border border-emerald-200/30 shadow-sm">
              {publishedCount}/{unitCards.length} {lang === "தமிழ்" ? "பொதுப்படுத்தப்பட்டது" : "published"}
            </span>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{lang === "தமிழ்" ? "வகுப்பு" : "Class"}</span>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="px-3 py-2 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-extrabold text-sm rounded-xl border border-amber-200/30 shadow-sm focus:outline-none">
              {classOptions.map((c) => (
                <option key={c} value={c}>{lang === "தமிழ்" ? `வகுப்பு ${c}` : `Class ${c}`}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{lang === "தமிழ்" ? "பிரிவு" : "Section"}</span>
            <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="px-3 py-2 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-extrabold text-sm rounded-xl border border-amber-200/30 shadow-sm focus:outline-none">
              {sectionOptions.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* Subject tabs */}
      {loadingSubjects ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-10 h-10 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin mb-3" />
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider animate-pulse">{lang === "தமிழ்" ? "பாடங்கள் ஏற்றுகிறது..." : "Loading subjects..."}</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center p-12 glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
          <span className="text-5xl block mb-4"><Mailbox className="w-4 h-4 inline-block mr-1 text-inherit" /></span>
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{lang === "தமிழ்" ? `வகுப்பு ${selectedClass} க்கு ஊள்ளடக்கம் இதுவரை இல்லை` : `No syllabus content yet for Class ${selectedClass}`}</p>
          <p className="text-xs text-slate-500 mt-2">{lang === "தமிழ்" ? "வகுப்பு 8 உங்களுக்கு முழு கணிதம் & அரிவியல் பிரிவு பலகையுடன் உள்ளது." : "Try Class 8, which has the full Math & Science unit board."}</p>
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
                <span>{sub.icon || ""}</span> {sub.name}
              </button>
            ))}
          </div>

          {/* Unit grid */}
          {loadingUnits ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin mb-3" />
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider animate-pulse">{lang === "தமிழ்" ? "பிரிவுகள் ஏற்றுகிறது..." : "Loading units..."}</p>
            </div>
          ) : unitCards.length === 0 ? (
            <div className="text-center p-12 glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
              <span className="text-5xl block mb-4"><Book className="w-4 h-4 inline-block mr-1 text-inherit" /></span>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{lang === "தமிழ்" ? "இது பாடத்திற்கு எநத பிரிவும் காணப்படவில்லை." : "No units found for this subject yet."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {unitCards.map((card) => (
                <Link
                  key={card.unitId}
                  href={`/teacher/syllabus-board/${card.unitId}`}
                  className="relative text-left rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-200 bg-white dark:bg-slate-950/40 flex flex-col group"
                  title={`${card.unitName} — open lesson insights (Class ${selectedClass}${selectedSection})`}
                >
                  <div className="relative overflow-hidden flex-1">
                    {/* Published badge */}
                    {card.isApproved && (
                      <span className="absolute top-2.5 right-2.5 z-10 text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg bg-emerald-600 text-white shadow-sm">
                        {lang === "தமிழ்" ? "பொதுப்படுத்தப்பட்டது" : "Published"}
                      </span>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 z-[5] bg-black/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-4 pointer-events-none">
                      <div 
                        className="text-xs font-bold px-4 py-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                        style={{ backgroundColor: "rgba(15, 23, 42, 0.9)", color: "#ffffff" }}
                      >
                        {lang === "தமிழ்" ? "பாடத்திட்ட விளக்கம் திறக்கு →" : "Open lesson insights →"}
                      </div>
                    </div>

                    {card.imageUrl ? (
                      <img src={card.imageUrl} alt={card.altText || card.unitName} className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-300" />
                    ) : (
                      <div className="h-40 flex items-center justify-center text-slate-400 text-xs font-semibold bg-slate-50 dark:bg-slate-900/50">
                        {lang === "தமிழ்" ? `பிரிவு ${card.unitNumber} க்கு காட்சி இல்லை` : `No visual available for Unit ${card.unitNumber}`}
                      </div>
                    )}
                  </div>

                  {/* Card footer */}
                  <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-white dark:bg-slate-950/40 relative z-10 shrink-0">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                      {lang === "தமிழ்" ? `பிரிவு ${card.unitNumber}: ${card.unitName}` : `Unit ${card.unitNumber}: ${card.unitName}`}
                    </p>
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: card.isApproved ? "#10b981" : "#d1d5db" }}
                      title={card.isApproved ? "Published" : "Draft"}
                    />
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
