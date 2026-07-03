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

interface UnitDetail {
  realLifeConnections: string[];
  commonMisconceptions: string[];
  studentKeyPoints: string[];
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

  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [activeDetail, setActiveDetail] = useState<UnitDetail | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeName, setActiveName] = useState<string>("");
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Resolve the student's own class, same pattern as the centralized-content page
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userClass = (session?.user as any)?.class;
      if (userClass) {
        setSelectedClass(String(userClass));
      } else {
        setSelectedClass("8");
      }
    }
  }, [session, status]);

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
        console.error("Error fetching subjects", err);
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
      const res = await fetch(`${API_URL}/api/centralized-content/subjects/${sub.id}/units?approvedOnly=true`);
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

  const openUnit = async (card: UnitCard) => {
    setActiveUnitId(card.unitId);
    setActiveName(card.unitName);
    setActiveImage(card.imageUrl);
    setActiveDetail(null);
    setLoadingDetail(true);
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/units/${card.unitId}`);
      const json = await res.json();
      if (json.success) {
        setActiveDetail(json.data.unitDetail);
      }
    } catch (err) {
      console.error("Error fetching unit detail", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const accent = selectedSubject?.color || "#6366f1";

  return (
    <PortalLayout
      title="Class Syllabus Board"
      subtitle="Unit-by-unit visual summaries your teacher has published for your class."
      avatarLetter="A"
      avatarColor="#6366f1"
      themeClass="theme-student"
      accentColor="#6366f1"
    >
      <div className="flex items-center justify-between gap-4 mb-8 glass rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-wider mb-1">🗂️ Syllabus Board</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Only units your teacher has published appear here.</p>
        </div>
        <span className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-extrabold text-sm rounded-xl border border-indigo-200/20 shadow-sm">
          Class {selectedClass}th Standard
        </span>
      </div>

      {loadingSubjects ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-3" />
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider animate-pulse">Loading subjects...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center p-12 glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
          <span className="text-5xl block mb-4">📭</span>
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No syllabus board yet for Class {selectedClass}</p>
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
                    ? { background: `linear-gradient(135deg, ${sub.color || "#6366f1"}, ${sub.color || "#6366f1"}dd)`, borderColor: sub.color || "#6366f1" }
                    : undefined
                }
              >
                <span>{sub.icon || "📚"}</span> {sub.name}
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
              <span className="text-5xl block mb-4">🕓</span>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">Your teacher hasn't published any units yet.</p>
              <p className="text-xs text-slate-500 mt-2">Check back once your teacher shares this subject's syllabus board.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {unitCards.map((card) => (
                <button
                  key={card.unitId}
                  onClick={() => openUnit(card)}
                  className="text-left rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all bg-white dark:bg-slate-950/40"
                >
                  {card.imageUrl ? (
                    <img src={card.imageUrl} alt={card.unitName} className="w-full h-auto block" />
                  ) : (
                    <div className="h-40 flex items-center justify-center text-slate-400 text-xs font-semibold">Unit {card.unitNumber}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Detail modal */}
      {activeUnitId && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6" onClick={() => setActiveUnitId(null)}>
          <div className="max-w-xl w-full max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {activeImage && <img src={activeImage} alt={activeName} className="w-full h-auto rounded-t-3xl" />}
            <div className="p-6">
              {loadingDetail ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-3" />
                  <p className="text-slate-500 text-xs font-semibold">Loading...</p>
                </div>
              ) : !activeDetail ? (
                <div className="text-center py-6">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{activeName}</p>
                  <p className="text-xs text-slate-500 mt-2">Your teacher hasn't added extra notes for this unit yet — the visual summary above covers the key idea.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-black text-black dark:text-white mb-3">🎯 Key Points to Remember</h3>
                    <ul className="space-y-2">
                      {activeDetail.studentKeyPoints.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accent }} />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {activeDetail.realLifeConnections?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-black text-black dark:text-white mb-3">🌍 Where You'll See This in Real Life</h3>
                      <ul className="space-y-2">
                        {activeDetail.realLifeConnections.map((p, i) => (
                          <li key={i} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/30 rounded-xl p-3">
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {activeDetail.commonMisconceptions?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-black text-black dark:text-white mb-3">🤔 Think About It...</h3>
                      <ul className="space-y-2">
                        {activeDetail.commonMisconceptions.map((p, i) => (
                          <li key={i} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-amber-300/40 bg-amber-50/50 dark:bg-amber-950/10 rounded-xl p-3">
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => setActiveUnitId(null)}
              className="w-full py-3 text-xs font-bold text-white rounded-b-3xl"
              style={{ background: accent }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
