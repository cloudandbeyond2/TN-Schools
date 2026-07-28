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
import { BookOpen, FileText, HelpCircle, MonitorPlay, Presentation } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

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

/* ─── Helpers ────────────────────────────────────────────────────────────── */

/** Uploaded files come back as backend-relative "/uploads/..." paths. */
const resolveFileUrl = (u: string | null | undefined): string | null =>
  !u ? null : u.startsWith("/") ? `${API_URL}${u}` : u;

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
    </PortalLayout>
  );
}
