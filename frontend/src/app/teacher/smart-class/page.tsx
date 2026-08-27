"use client";

import PortalLayout from "@/components/PortalLayout";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import BoardStage from "@/components/smart-class/BoardStage";
import type {
  BoardMcq,
  BoardPdf,
  BoardUnitInfo,
  UnitDetail,
} from "@/components/smart-class/types";
import { API_URL, apiFetch } from "@/lib/api";
import { BookOpen, Eye, FileText, HelpCircle, MonitorPlay, Presentation, Printer, Sparkles, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { OutputRenderer } from "@/components/ai-studio/renderers";
import { printOutput } from "@/components/ai-studio/printable";

/* ─── Types ──────────────────────────────────────────────────────────────── */

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
  mcqs?: unknown;
}

interface ClassRoom {
  id: string;
  className: string;
  section: string;
  subject: string;
}

interface BoardPayload {
  unit: BoardUnitInfo;
  detail: UnitDetail | null;
  infographicUrl: string | null;
  pdfs: BoardPdf[];
  mcqs: BoardMcq[];
}

interface PublishedAiItem {
  id: string;
  skillKey: string;
  outputKind: any;
  subjectPack: any;
  subject: string;
  className: string;
  section: string | null;
  unit?: string | null;
  topic: string;
  title: string;
  language: string;
  payload: any;
  publishedAt: string | null;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

/** Uploaded files come back as backend-relative "/uploads/..." paths. */
const resolveFileUrl = (u: string | null | undefined): string | null =>
  !u ? null : u.startsWith("/") ? `${API_URL}${u}` : u;

/** Helper to safely convert strings or objects ({term, tamil, meaning}, etc.) into text */
const stringifyItem = (item: any): string => {
  if (item == null) return "";
  if (typeof item === "string") return item;
  if (typeof item === "number" || typeof item === "boolean") return String(item);
  if (typeof item === "object") {
    if (item.term || item.word || item.concept || item.misconception || item.heading || item.title) {
      const main = item.term || item.word || item.concept || item.misconception || item.heading || item.title;
      const sub = item.tamil || item.meaning || item.definition || item.correction || item.description || item.explanation;
      if (main && sub) return `${main} — ${sub}`;
      if (main) return main;
      if (sub) return sub;
    }
    return Object.values(item)
      .map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
      .filter(Boolean)
      .join(" - ");
  }
  return String(item);
};

const stringifyArr = (arr: any): string[] => {
  if (!Array.isArray(arr)) return [];
  return arr.map(stringifyItem).filter(Boolean);
};

/**
 * CentralContent.mcqs holds { question, options, answer, rationale } where
 * `answer` is the full option string ("B) 5"), not an index. Match by full
 * trimmed string, falling back to the "B)" letter prefix.
 */
const normalizeMcqs = (raw: unknown): BoardMcq[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m: any) => m && typeof m.question === "string" && Array.isArray(m.options))
    .map((m: any) => {
      const options = m.options.map(String);
      const answer = typeof m.answer === "string" ? m.answer.trim() : "";
      let correctIndex = options.findIndex((o: string) => o.trim() === answer);
      if (correctIndex === -1 && answer) {
        const letter = answer.charAt(0).toUpperCase();
        correctIndex = options.findIndex((o: string) =>
          o.trim().toUpperCase().startsWith(`${letter})`)
        );
      }
      return {
        q: m.question,
        options,
        correctIndex,
        answer,
        rationale: typeof m.rationale === "string" ? m.rationale : "",
      };
    });
};

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function TeacherSmartClassPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const user = session?.user as any;
  const schoolId = user?.schoolId || "";
  const teacherId = user?.id || "";

  const [teacherClasses, setTeacherClasses] = useState<ClassRoom[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedClass, setSelectedClass] = useState("");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const [payload, setPayload] = useState<BoardPayload | null>(null);
  const [loadingPayload, setLoadingPayload] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);

  const [aiStudioItems, setAiStudioItems] = useState<PublishedAiItem[]>([]);
  const [loadingAiItems, setLoadingAiItems] = useState(false);
  const [activeAiItem, setActiveAiItem] = useState<PublishedAiItem | null>(null);

  /* ── Teacher's classes ── */
  const fetchTeacherClasses = useCallback(async () => {
    if (!schoolId || !teacherId) return;
    setLoadingClasses(true);
    try {
      const res = await apiFetch(`/api/classes?schoolId=${schoolId}&teacherId=${teacherId}`);
      const json = await res.json();
      if (json.success) setTeacherClasses(json.data);
    } catch (err) {
      console.error("Error fetching teacher classes:", err);
    } finally {
      setLoadingClasses(false);
    }
  }, [schoolId, teacherId]);

  useEffect(() => {
    fetchTeacherClasses();
  }, [fetchTeacherClasses]);

  const classOptions = Array.from(new Set(teacherClasses.map((c) => c.className))).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );

  useEffect(() => {
    if (classOptions.length > 0 && !selectedClass) setSelectedClass(classOptions[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherClasses]);

  /* ── Published AI Studio Items ── */
  const fetchAiStudioItems = useCallback(async () => {
    if (!selectedClass) return;
    setLoadingAiItems(true);
    try {
      const params = new URLSearchParams();
      params.set("class", selectedClass);
      if (selectedSubject) params.set("subject", selectedSubject.name);
      if (schoolId) params.set("schoolId", schoolId);
      const res = await apiFetch(`/api/ai-studio/published?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAiStudioItems(json.data);
      } else {
        setAiStudioItems([]);
      }
    } catch (err) {
      console.error("Error fetching published AI Studio items:", err);
      setAiStudioItems([]);
    } finally {
      setLoadingAiItems(false);
    }
  }, [selectedClass, selectedSubject, schoolId]);

  useEffect(() => {
    fetchAiStudioItems();
  }, [fetchAiStudioItems]);

  /* ── Subjects for the class ── */
  useEffect(() => {
    if (!selectedClass) return;
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      setSubjects([]);
      setSelectedSubject(null);
      setUnits([]);
      setSelectedUnitId(null);
      setPayload(null);
      try {
        // Classes 11/12 gate subjects by student group; a teacher preparing the
        // board needs all of them, so fetch every group and merge unique.
        const isHigherSecondary = selectedClass === "11" || selectedClass === "12";
        const groupParams = isHigherSecondary
          ? ["&group=Biology", "&group=Computer%20Science", "&group=Commerce"]
          : [""];
        const responses = await Promise.all(
          groupParams.map((g) =>
            apiFetch(`/api/centralized-content/subjects?class=${selectedClass}${g}`)
              .then((r) => r.json())
              .catch(() => ({ success: false, data: [] }))
          )
        );
        const merged = new Map<string, Subject>();
        for (const json of responses) {
          if (json.success && Array.isArray(json.data)) {
            for (const sub of json.data as Subject[]) merged.set(sub.id, sub);
          }
        }
        const subjectList = Array.from(merged.values());
        setSubjects(subjectList);
        if (subjectList.length > 0) handleSelectSubject(subjectList[0]);
      } catch (err) {
        console.error("Error fetching central subjects:", err);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]);

  /* ── Units for the subject ── */
  const handleSelectSubject = async (sub: Subject) => {
    setSelectedSubject(sub);
    setUnits([]);
    setSelectedUnitId(null);
    setPayload(null);
    setLoadingUnits(true);
    try {
      const res = await apiFetch(`/api/centralized-content/subjects/${sub.id}/units`);
      const json = await res.json();
      if (json.success) {
        const sorted = (json.data as Unit[]).slice().sort((a, b) => a.unitNumber - b.unitNumber);
        setUnits(sorted);
      }
    } catch (err) {
      console.error("Error fetching central units:", err);
    } finally {
      setLoadingUnits(false);
    }
  };

  /* ── Board payload for the unit ── */
  const handleSelectUnit = async (unit: Unit) => {
    setSelectedUnitId(unit.id);
    setPayload(null);
    setLoadingPayload(true);
    try {
      const [unitRes, ...contentResults] = await Promise.all([
        apiFetch(`/api/centralized-content/units/${unit.id}`).then((r) => r.json()),
        ...unit.topics.map((t) =>
          apiFetch(`/api/centralized-content/topics/${t.id}/contents`)
            .then((r) => r.json())
            .catch(() => ({ success: false, data: [] }))
        ),
      ]);

      if (!unitRes.success) throw new Error(unitRes.error || "Unit not found");

      // Normalize legacy flat unit detail (no .en key) into the bilingual shape
      const rawDetail = unitRes.data.unitDetail;
      const detail: UnitDetail | null = rawDetail
        ? rawDetail.en
          ? rawDetail
          : { en: rawDetail, ta: null }
        : null;

      const contents: Content[] = contentResults.flatMap((r: any) =>
        r?.success && Array.isArray(r.data) ? r.data : []
      );

      const pdfs: BoardPdf[] = contents
        .filter(
          (c) =>
            c.contentType === "PDF" || (c.fileUrl && c.fileUrl.toLowerCase().endsWith(".pdf"))
        )
        .map((c) => ({ title: c.title, url: resolveFileUrl(c.fileUrl) }))
        .filter((p): p is BoardPdf => !!p.url);

      const mcqs: BoardMcq[] = contents
        .filter((c) => c.contentType === "MCQ")
        .flatMap((c) => normalizeMcqs(c.mcqs));

      setPayload({
        unit: {
          name: unit.name,
          unitNumber: unit.unitNumber,
          subjectName: selectedSubject?.name || unitRes.data.unit?.subject?.name || "",
          className: selectedClass,
        },
        detail,
        infographicUrl: resolveFileUrl(unitRes.data.infographic?.fileUrl),
        pdfs,
        mcqs,
      });
    } catch (err) {
      console.error("Error loading board payload:", err);
    } finally {
      setLoadingPayload(false);
    }
  };

  const launchAiLessonOnBoard = (item: PublishedAiItem) => {
    const payloadData = item.payload || {};
    const sections = Array.isArray(payloadData.sections)
      ? payloadData.sections
      : Array.isArray(payloadData.steps)
      ? payloadData.steps
      : Array.isArray(payloadData.slides)
      ? payloadData.slides
      : Array.isArray(payloadData.cards)
      ? payloadData.cards
      : Array.isArray(payloadData.items)
      ? payloadData.items
      : [];

    const keyTermsRaw = payloadData.keyTerms || payloadData.vocabulary || payloadData.keyConcepts || payloadData.keyIdeas || payloadData.terms || [];
    const realWorldRaw = payloadData.realWorldConnections || payloadData.examples || payloadData.applications || [];
    const misconceptionsRaw = payloadData.misconceptions || payloadData.commonMisconceptions || [];
    const objectivesRaw = payloadData.objectives || payloadData.goals || payloadData.outcomes || payloadData.studentKeyPoints || [];

    const detail: UnitDetail = {
      en: {
        keyConcepts: stringifyArr(keyTermsRaw),
        realLifeConnections: stringifyArr(realWorldRaw),
        commonMisconceptions: stringifyArr(misconceptionsRaw),
        teachingFlow: sections.map((s: any, idx: number) => ({
          step: stringifyItem(s.heading || s.title || s.name || s.topic || `Section ${idx + 1}`),
          minutes: Number(s.durationMins || s.minutes || s.time) || 10,
          description: Array.isArray(s.keyIdeas)
            ? stringifyArr(s.keyIdeas).join(". ")
            : Array.isArray(s.items)
            ? stringifyArr(s.items).join(". ")
            : Array.isArray(s.points)
            ? stringifyArr(s.points).join(". ")
            : stringifyItem(s.description || s.teacherNotes || s.content || s.text || s.prompt || s.body || "")
        })),
        teacherScript: stringifyItem(payloadData.summary || payloadData.overview || payloadData.introduction || payloadData.description || item.title || item.topic),
        studentKeyPoints: stringifyArr(objectivesRaw)
      },
      ta: null
    };

    setPayload({
      unit: {
        name: item.unit || item.topic || item.title,
        unitNumber: 1,
        subjectName: item.subject,
        className: item.className
      },
      detail,
      infographicUrl: item.outputKind === "INFOGRAPHIC" && item.payload?.imageUrl ? resolveFileUrl(item.payload.imageUrl) : null,
      pdfs: [],
      mcqs: Array.isArray(payloadData.questions)
        ? normalizeMcqs(payloadData.questions)
        : Array.isArray(payloadData.mcqs)
        ? normalizeMcqs(payloadData.mcqs)
        : []
    });
    setBoardOpen(true);
    if (typeof document !== "undefined" && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  /* ── Fullscreen board mode ── */
  const enterBoard = () => {
    if (!payload) return;
    setBoardOpen(true);
    if (typeof document !== "undefined" && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => console.log(err));
    }
  };

  const exitBoard = useCallback(() => {
    setBoardOpen(false);
    if (typeof document !== "undefined" && document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch((err) => console.log(err));
    }
  }, []);

  // Esc / browser-initiated fullscreen exit also closes the board overlay
  useEffect(() => {
    if (!boardOpen) return;
    const onChange = () => {
      if (!document.fullscreenElement) setBoardOpen(false);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [boardOpen]);

  const accent = selectedSubject?.color || "#f59e0b";

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "ஸ்மார்ட் வகுப்பு" : "Smart Class"}
      subtitle={lang === "தமிழ்" ? "ஸ்மார்ட் போர்டிலிருந்து உங்கள் வகுப்பை நேரடியாக நடத்துங்கள் — பாடம், ஊடகம் மற்றும் வினாடி வினா அனைத்தும் ஒரே திரையில்." : "Conduct your class live from the smart board — lesson, media and quiz in one screen."}
      avatarLetter="S"
      avatarColor="#f59e0b"
      themeClass="theme-teacher"
      accentColor="#f59e0b"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 glass rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-wider mb-1">
            {lang === "தமிழ்" ? "போர்டைத் தயார் செய்யவும்" : "Prepare the Board"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {lang === "தமிழ்" ? "உங்கள் வகுப்பு, பாடம் மற்றும் அலகைத் தேர்ந்தெடுக்கவும் — பின்னர் குறிப்பு மற்றும் வினாடி வினா கருவிகளுடன் முழுத் திரையில் காண்பிக்கவும்." : "Pick your class, subject and unit — then project it fullscreen with annotation and quiz tools."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {lang === "தமிழ்" ? "வகுப்பு" : "Class"}
          </span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-extrabold text-sm rounded-xl border border-amber-200/30 shadow-sm focus:outline-none"
          >
            {classOptions.map((c) => (
              <option key={c} value={c}>
                {lang === "தமிழ்" ? `வகுப்பு ${c}` : `Class ${c}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingClasses || loadingSubjects ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-10 h-10 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin mb-3" />
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider animate-pulse">
            {lang === "தமிழ்" ? "ஏற்றப்படுகிறது..." : "Loading..."}
          </p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center p-12 glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
          <Presentation className="w-10 h-10 mx-auto mb-4 text-slate-400" />
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
            {lang === "தமிழ்" ? `வகுப்பு ${selectedClass}-க்கு இன்னும் பாடத்திட்ட உள்ளடக்கம் இல்லை` : `No syllabus content yet for Class ${selectedClass}`}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {lang === "தமிழ்" ? "மத்திய பாடத்திட்டத்திலிருந்து வெளியிடப்பட்ட அலகுகள் இங்கே தோன்றும்." : "Units from the centralized syllabus appear here once published."}
          </p>
        </div>
      ) : (
        <>
          {/* Subject tabs */}
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
                    ? {
                        background: `linear-gradient(135deg, ${sub.color || "#f59e0b"}, ${
                          sub.color || "#f59e0b"
                        }dd)`,
                        borderColor: sub.color || "#f59e0b",
                      }
                    : undefined
                }
              >
                <span>{sub.icon || ""}</span> {sub.name}
              </button>
            ))}
          </div>

          {/* AI Studio Pushed Contents Section */}
          <div className="mb-8 p-5 glass rounded-3xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20 backdrop-blur-md">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  {lang === "தமிழ்" ? "AI ஸ்டுடியோவிலிருந்து அனுப்பப்பட்ட உள்ளடக்கங்கள்" : "AI Studio Pushed Contents"}
                </h3>
                {aiStudioItems.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    {aiStudioItems.length}
                  </span>
                )}
              </div>
              <button
                onClick={fetchAiStudioItems}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                ⟳ {lang === "தமிழ்" ? "புதுப்பி" : "Refresh"}
              </button>
            </div>

            {loadingAiItems ? (
              <div className="flex items-center gap-2 py-3 text-xs text-slate-500 font-medium">
                <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                {lang === "தமிழ்" ? "அனுப்பப்பட்ட உள்ளடக்கங்கள் ஏற்றப்படுகின்றன..." : "Loading pushed AI contents..."}
              </div>
            ) : aiStudioItems.length === 0 ? (
              <p className="text-xs text-slate-500">
                {lang === "தமிழ்"
                  ? "AI Studio-வில் உருவாகிய பாடங்களை '➜ Smart Class' கிளிக் செய்து இங்கே அனுப்பலாம்."
                  : "Content pushed from AI Studio using '➜ Smart Class' will appear here ready for presentation."}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {aiStudioItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-amber-500/30 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between shadow-sm transition hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-md">
                          /{item.skillKey}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 mb-1">
                        {item.title || item.topic}
                      </h4>
                      {item.unit && (
                        <p className="text-xs text-slate-500 truncate mb-3">
                          {lang === "தமிழ்" ? `அலகு: ${item.unit}` : `Unit: ${item.unit}`}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                      <button
                        onClick={() => {
                          if (item.outputKind === "LESSON_PLAN" || item.payload?.sections) {
                            launchAiLessonOnBoard(item);
                          } else {
                            setActiveAiItem(item);
                          }
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-600 transition"
                      >
                        <MonitorPlay className="w-3.5 h-3.5" />
                        {lang === "தமிழ்" ? "போர்டில் திரையிடு" : "Present on Board"}
                      </button>

                      <button
                        onClick={() => setActiveAiItem(item)}
                        title="Preview / Print"
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unit cards */}
          {loadingUnits ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-10 h-10 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin mb-3" />
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider animate-pulse">
                {lang === "தமிழ்" ? "அலகுகள் ஏற்றப்படுகின்றன..." : "Loading units..."}
              </p>
            </div>
          ) : units.length === 0 ? (
            <div className="text-center p-12 glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
              <BookOpen className="w-10 h-10 mx-auto mb-4 text-slate-400" />
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                {lang === "தமிழ்" ? "இந்த பாடத்திற்கு இன்னும் அலகுகள் எதுவும் இல்லை." : "No units found for this subject yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
              {units.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => handleSelectUnit(unit)}
                  className={`text-left rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg bg-white dark:bg-slate-950/40 ${
                    selectedUnitId === unit.id
                      ? "shadow-lg"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                  style={selectedUnitId === unit.id ? { borderColor: accent, borderWidth: 2 } : undefined}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className="text-xs font-black uppercase tracking-wider"
                      style={{ color: accent }}
                    >
                      {lang === "தமிழ்" ? `அலகு ${unit.unitNumber}` : `Unit ${unit.unitNumber}`}
                    </span>
                    {unit.isApproved && (
                      <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400">
                        {lang === "தமிழ்" ? "வெளியிடப்பட்டது" : "Published"}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{unit.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === "தமிழ்" 
                      ? `${unit.topics.length} தலைப்பு${unit.topics.length === 1 ? "" : "கள்"}` 
                      : `${unit.topics.length} topic${unit.topics.length === 1 ? "" : "s"}`
                    }
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Board launcher */}
          {selectedUnitId && (
            <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {loadingPayload ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin" />
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    {lang === "தமிழ்" ? "போர்டு உள்ளடக்கம் தயாரிக்கப்படுகிறது..." : "Preparing board content..."}
                  </p>
                </div>
              ) : payload ? (
                <>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border ${
                        payload.detail
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/30"
                          : "bg-slate-100 dark:bg-slate-800/50 text-slate-500 border-slate-200/30"
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      {payload.detail 
                        ? (lang === "தமிழ்" ? "பாட நுண்ணறிவு தயார்" : "Lesson insights ready") 
                        : (lang === "தமிழ்" ? "பாட நுண்ணறிவு இல்லை" : "No lesson insights")
                      }
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border ${
                        payload.pdfs.length > 0 || payload.infographicUrl
                          ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200/30"
                          : "bg-slate-100 dark:bg-slate-800/50 text-slate-500 border-slate-200/30"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      {lang === "தமிழ்" 
                        ? `${payload.pdfs.length} PDF கோப்பு${payload.pdfs.length === 1 ? "" : "கள்"}` 
                        : `${payload.pdfs.length} PDF${payload.pdfs.length === 1 ? "" : "s"}`
                      }
                      {payload.infographicUrl ? (lang === "தமிழ்" ? " + தகவல் வரைபடம்" : " + infographic") : ""}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border ${
                        payload.mcqs.length > 0
                          ? "bg-amber-50 dark:bg-amber-955/30 text-amber-700 dark:text-amber-400 border-amber-200/30"
                          : "bg-slate-100 dark:bg-slate-800/50 text-slate-500 border-slate-200/30"
                      }`}
                    >
                      <HelpCircle className="w-4 h-4" />
                      {lang === "தமிழ்" 
                        ? `${payload.mcqs.length} வினாடி வினா வினா${payload.mcqs.length === 1 ? "" : "க்கள்"}` 
                        : `${payload.mcqs.length} quiz question${payload.mcqs.length === 1 ? "" : "s"}`
                      }
                    </span>
                  </div>
                  <button
                    onClick={enterBoard}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-black text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                    style={{ background: `linear-gradient(135deg, ${accent}, ${accent}dd)` }}
                  >
                    <MonitorPlay className="w-5 h-5" /> {lang === "தமிழ்" ? "போர்டு பயன்முறையில் நுழையவும்" : "Enter Board Mode"}
                  </button>
                </>
              ) : (
                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                  {lang === "தமிழ்" ? "இந்த அலகின் உள்ளடக்கத்தை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்." : "Could not load this unit's content. Please try again."}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* Fullscreen board overlay */}
      {boardOpen && payload && (
        <BoardStage
          unit={payload.unit}
          detail={payload.detail}
          infographicUrl={payload.infographicUrl}
          pdfs={payload.pdfs}
          mcqs={payload.mcqs}
          onExit={exitBoard}
        />
      )}

      {/* AI Content Preview / Presenter Modal */}
      {activeAiItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div>
                <div className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                  /{activeAiItem.skillKey} · {activeAiItem.subject} · {activeAiItem.className}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {activeAiItem.title || activeAiItem.topic}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    printOutput(activeAiItem.outputKind, activeAiItem.payload, {
                      skillLabel: activeAiItem.skillKey,
                      subject: activeAiItem.subject,
                      className: activeAiItem.className,
                      topic: activeAiItem.topic,
                      teacherName: user?.name
                    });
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Printer className="w-3.5 h-3.5" /> {lang === "தமிழ்" ? "அச்சிடு / PDF" : "Print / PDF"}
                </button>

                <button
                  onClick={() => setActiveAiItem(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <OutputRenderer
                outputKind={activeAiItem.outputKind}
                payload={activeAiItem.payload}
              />
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
