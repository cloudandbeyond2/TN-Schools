"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Download,
  Eraser,
  FileText,
  HelpCircle,
  Highlighter,
  Image as ImageIcon,
  Languages,
  MousePointer2,
  Pencil,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import BoardCanvas, { BoardCanvasHandle, BoardTool } from "./BoardCanvas";
import QuizBoard from "./QuizBoard";
import type { BoardMcq, BoardPdf, BoardUnitInfo, Lang, LangDetail, UnitDetail } from "./types";

type BoardTab = "lesson" | "media" | "quiz";

interface BoardStageProps {
  unit: BoardUnitInfo;
  detail: UnitDetail | null;
  infographicUrl: string | null;
  pdfs: BoardPdf[];
  mcqs: BoardMcq[];
  onExit: () => void;
}

const PEN_COLORS = ["#dc2626", "#2563eb", "#059669", "#0f172a", "#facc15"];

const TABS: { key: BoardTab; label: string; icon: typeof BookOpen }[] = [
  { key: "lesson", label: "Lesson", icon: BookOpen },
  { key: "media", label: "Media", icon: ImageIcon },
  { key: "quiz", label: "Quiz", icon: HelpCircle },
];

/**
 * Fullscreen projection surface for a smart board. The surface is always a
 * white board with dark text via inline styles — globals.css rewrites many
 * Tailwind color classes with !important, so classes are used only for layout.
 */
export default function BoardStage({
  unit,
  detail,
  infographicUrl,
  pdfs,
  mcqs,
  onExit,
}: BoardStageProps) {
  const [tab, setTab] = useState<BoardTab>("lesson");
  const [lang, setLang] = useState<Lang>("en");
  const [tool, setTool] = useState<BoardTool>("cursor");
  const [color, setColor] = useState("#dc2626");
  const [activePdf, setActivePdf] = useState(0);
  const [exporting, setExporting] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<BoardCanvasHandle>(null);

  // A fresh board per view — annotations rarely make sense across tabs.
  useEffect(() => {
    canvasRef.current?.clear();
  }, [tab]);

  const hasTamil = !!detail?.ta;
  const langDetail = lang === "ta" && detail?.ta ? detail.ta : detail?.en ?? null;

  const exportPng = async () => {
    if (!stageRef.current || exporting) return;
    setExporting(true);
    
    const stage = stageRef.current;
    const scrollContainer = stage.firstElementChild as HTMLElement;
    
    if (!scrollContainer) {
      setExporting(false);
      return;
    }

    const origStageHeight = stage.style.height;
    const origStageOverflow = stage.style.overflow;
    const origScrollHeight = scrollContainer.style.height;
    const origScrollOverflow = scrollContainer.style.overflow;

    try {
      const fullHeight = scrollContainer.scrollHeight;

      // Temporarily expand to full height to capture everything
      stage.style.height = `${fullHeight}px`;
      stage.style.overflow = "visible";
      scrollContainer.style.height = `${fullHeight}px`;
      scrollContainer.style.overflow = "visible";

      // Wait for DOM to update and Canvas to resize
      await new Promise((r) => setTimeout(r, 150));

      const html2canvas = (await import("html2canvas")).default;
      const captured = await html2canvas(stage, { 
        backgroundColor: "#ffffff",
        windowHeight: fullHeight,
        height: fullHeight,
        scale: 2, // Better resolution for text readability
      });
      
      const link = document.createElement("a");
      link.download = `smart-class-unit-${unit.unitNumber}.png`;
      link.href = captured.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Board export failed:", err);
    } finally {
      // Restore styles
      stage.style.height = origStageHeight;
      stage.style.overflow = origStageOverflow;
      scrollContainer.style.height = origScrollHeight;
      scrollContainer.style.overflow = origScrollOverflow;
      
      setExporting(false);
    }
  };

  const toolButton = (t: BoardTool, Icon: typeof Pencil, title: string) => (
    <button
      key={t}
      onClick={() => setTool(t)}
      title={title}
      className="w-11 h-11 rounded-xl flex items-center justify-center transition-all"
      style={{
        background: tool === t ? "#f59e0b" : "#f1f5f9",
        color: tool === t ? "#ffffff" : "#475569",
      }}
    >
      <Icon className="w-5 h-5" />
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ background: "#ffffff", color: "#0f172a" }}
    >
      {/* ── Toolbar ── */}
      <div
        className="flex items-center gap-2 px-4 py-3 flex-wrap shrink-0"
        style={{ borderBottom: "2px solid #e2e8f0", background: "#ffffff" }}
      >
        <span
          className="px-4 py-2 rounded-xl text-sm font-black truncate max-w-[26rem]"
          style={{ background: "#fef3c7", color: "#b45309" }}
          title={`Class ${unit.className} · ${unit.subjectName}`}
        >
          Unit {unit.unitNumber}: {unit.name}
        </span>

        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: "#f1f5f9" }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-black transition-all"
              style={{
                background: tab === key ? "#0f172a" : "transparent",
                color: tab === key ? "#ffffff" : "#475569",
              }}
            >
              <Icon className="w-4 h-4" /> {label}
              {key === "quiz" && mcqs.length > 0 && (
                <span
                  className="ml-1 px-1.5 rounded-md text-xs"
                  style={{ background: "#f59e0b", color: "#ffffff" }}
                >
                  {mcqs.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Language toggle (lesson content only) */}
        <button
          onClick={() => hasTamil && setLang(lang === "en" ? "ta" : "en")}
          disabled={!hasTamil}
          title={hasTamil ? "Switch language" : "Tamil version not generated for this unit yet"}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black disabled:opacity-40"
          style={{ background: "#eff6ff", color: "#1d4ed8" }}
        >
          <Languages className="w-4 h-4" /> {lang === "en" ? "தமிழ்" : "EN"}
        </button>

        <div className="flex-1" />

        {/* Drawing tools */}
        <div className="flex items-center gap-1.5">
          {toolButton("cursor", MousePointer2, "Cursor — interact with content")}
          {toolButton("pen", Pencil, "Pen")}
          {toolButton("highlighter", Highlighter, "Highlighter")}
          {toolButton("eraser", Eraser, "Eraser")}
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1.5 px-2">
          {PEN_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              title={c}
              className="w-8 h-8 rounded-full transition-transform"
              style={{
                background: c,
                border: "3px solid #ffffff",
                outline: color === c ? "3px solid #f59e0b" : "2px solid #e2e8f0",
                transform: color === c ? "scale(1.15)" : "scale(1)",
              }}
            />
          ))}
        </div>

        <button
          onClick={() => canvasRef.current?.undo()}
          title="Undo last stroke"
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: "#f1f5f9", color: "#475569" }}
        >
          <Undo2 className="w-5 h-5" />
        </button>
        <button
          onClick={() => canvasRef.current?.clear()}
          title="Clear all annotations"
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: "#fef2f2", color: "#dc2626" }}
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <button
          onClick={exportPng}
          disabled={exporting}
          title="Export board as image (PDF frames may appear blank)"
          className="w-11 h-11 rounded-xl flex items-center justify-center disabled:opacity-40"
          style={{ background: "#f0fdf4", color: "#059669" }}
        >
          <Download className="w-5 h-5" />
        </button>
        <button
          onClick={onExit}
          title="Exit board mode"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-black"
          style={{ background: "#0f172a", color: "#ffffff" }}
        >
          <X className="w-4 h-4" /> Exit
        </button>
      </div>

      {/* ── Stage ── */}
      <div ref={stageRef} className="flex-1 relative overflow-hidden" style={{ background: "#ffffff" }}>
        <div className="absolute inset-0 overflow-y-auto">
          {tab === "lesson" && <LessonView unit={unit} detail={langDetail} lang={lang} />}
          {tab === "media" && (
            <MediaView
              infographicUrl={infographicUrl}
              pdfs={pdfs}
              activePdf={activePdf}
              onSelectPdf={setActivePdf}
            />
          )}
          {tab === "quiz" && <QuizBoard questions={mcqs} />}
        </div>
        <BoardCanvas ref={canvasRef} tool={tool} color={color} />
      </div>
    </div>
  );
}

/* ── Lesson view ─────────────────────────────────────────────────────────── */

function LessonView({
  unit,
  detail,
  lang,
}: {
  unit: BoardUnitInfo;
  detail: LangDetail | null;
  lang: Lang;
}) {
  if (!detail) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-10 text-center">
        <BookOpen className="w-16 h-16" style={{ color: "#94a3b8" }} />
        <p className="text-3xl font-black" style={{ color: "#0f172a" }}>
          No lesson insights generated yet
        </p>
        <p className="text-xl" style={{ color: "#64748b" }}>
          Open this unit in the Class Syllabus Board and generate its AI lesson insights first.
        </p>
      </div>
    );
  }

  const ta = lang === "ta";

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 flex flex-col gap-8 pb-24">
      {/* Hero */}
      <div>
        <p className="text-xl font-black uppercase tracking-widest" style={{ color: "#f59e0b" }}>
          Class {unit.className} · {unit.subjectName}
        </p>
        <h1 className="text-4xl md:text-6xl font-black leading-tight" style={{ color: "#0f172a" }}>
          Unit {unit.unitNumber}: {unit.name}
        </h1>
      </div>

      {/* Key concepts */}
      {detail.keyConcepts?.length > 0 && (
        <Section title={ta ? "முக்கிய கருத்துகள்" : "Key Concepts"} accent="#f59e0b">
          <ul className="flex flex-col gap-4">
            {detail.keyConcepts.map((c, i) => (
              <li key={i} className="flex items-start gap-4">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black flex-shrink-0 mt-1"
                  style={{ background: "#fef3c7", color: "#b45309" }}
                >
                  {i + 1}
                </span>
                <span className="text-2xl md:text-3xl font-bold leading-snug" style={{ color: "#1e293b" }}>
                  {c}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Teaching flow */}
      {detail.teachingFlow?.length > 0 && (
        <Section title={ta ? "கற்பித்தல் வரிசை" : "Teaching Flow"} accent="#2563eb">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detail.teachingFlow.map((step, i) => (
              <div
                key={i}
                className="rounded-2xl p-5"
                style={{ background: "#eff6ff", border: "2px solid #bfdbfe" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl font-black" style={{ color: "#1d4ed8" }}>
                    {i + 1}. {step.step}
                  </span>
                  {step.minutes > 0 && (
                    <span
                      className="px-3 py-1 rounded-full text-sm font-black"
                      style={{ background: "#1d4ed8", color: "#ffffff" }}
                    >
                      {step.minutes} min
                    </span>
                  )}
                </div>
                <p className="text-xl leading-relaxed" style={{ color: "#334155" }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Real-life connections */}
      {detail.realLifeConnections?.length > 0 && (
        <Section title={ta ? "நிஜ வாழ்க்கை தொடர்புகள்" : "Real-Life Connections"} accent="#059669">
          <ul className="flex flex-col gap-3">
            {detail.realLifeConnections.map((c, i) => (
              <li key={i} className="text-2xl leading-snug flex gap-3" style={{ color: "#1e293b" }}>
                <span style={{ color: "#059669" }}>●</span> {c}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Misconceptions */}
      {detail.commonMisconceptions?.length > 0 && (
        <Section title={ta ? "பொதுவான தவறான கருத்துகள்" : "Common Misconceptions"} accent="#dc2626">
          <ul className="flex flex-col gap-3">
            {detail.commonMisconceptions.map((m, i) => (
              <li
                key={i}
                className="text-2xl leading-snug rounded-2xl p-4"
                style={{ background: "#fef2f2", color: "#7f1d1d", border: "2px solid #fecaca" }}
              >
                {m}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Teacher script */}
      {detail.teacherScript && (
        <Section title={ta ? "ஆசிரியர் உரை" : "Teacher Script"} accent="#7c3aed">
          <p
            className="text-2xl leading-relaxed rounded-2xl p-6"
            style={{ background: "#faf5ff", color: "#3b0764", border: "2px solid #e9d5ff" }}
          >
            {detail.teacherScript}
          </p>
        </Section>
      )}

      {/* Student key points */}
      {detail.studentKeyPoints?.length > 0 && (
        <Section title={ta ? "மாணவர் முக்கிய குறிப்புகள்" : "Student Key Points"} accent="#0891b2">
          <ul className="flex flex-col gap-3">
            {detail.studentKeyPoints.map((p, i) => (
              <li key={i} className="text-2xl leading-snug flex gap-3" style={{ color: "#1e293b" }}>
                <span style={{ color: "#0891b2" }}>✔</span> {p}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3
        className="text-2xl md:text-3xl font-black uppercase tracking-wide mb-4 pb-2 inline-block"
        style={{ color: "#0f172a", borderBottom: `4px solid ${accent}` }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

/* ── Media view ──────────────────────────────────────────────────────────── */

function MediaView({
  infographicUrl,
  pdfs,
  activePdf,
  onSelectPdf,
}: {
  infographicUrl: string | null;
  pdfs: BoardPdf[];
  activePdf: number;
  onSelectPdf: (i: number) => void;
}) {
  if (!infographicUrl && pdfs.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-10 text-center">
        <ImageIcon className="w-16 h-16" style={{ color: "#94a3b8" }} />
        <p className="text-3xl font-black" style={{ color: "#0f172a" }}>
          No media for this unit
        </p>
        <p className="text-xl" style={{ color: "#64748b" }}>
          Infographics and PDFs added to this unit&apos;s topics will show here.
        </p>
      </div>
    );
  }

  const pdf = pdfs[Math.min(activePdf, pdfs.length - 1)];

  return (
    <div className="h-full flex flex-col p-4 md:p-6 gap-4">
      {pdfs.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {pdfs.map((p, i) => (
            <button
              key={i}
              onClick={() => onSelectPdf(i)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black"
              style={{
                background: i === activePdf ? "#0f172a" : "#f1f5f9",
                color: i === activePdf ? "#ffffff" : "#475569",
              }}
            >
              <FileText className="w-4 h-4" /> {p.title || `PDF ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 min-h-0 flex gap-4">
        {pdf && (
          <iframe
            src={pdf.url}
            title={pdf.title || "Unit PDF"}
            className="flex-1 h-full rounded-2xl"
            style={{ border: "2px solid #e2e8f0", background: "#f8fafc" }}
          />
        )}
        {infographicUrl && (
          <div
            className={`${pdf ? "w-2/5" : "flex-1"} h-full overflow-y-auto rounded-2xl p-2`}
            style={{ border: "2px solid #e2e8f0", background: "#f8fafc" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={infographicUrl} alt="Unit infographic" className="w-full h-auto rounded-xl" />
          </div>
        )}
      </div>
    </div>
  );
}
