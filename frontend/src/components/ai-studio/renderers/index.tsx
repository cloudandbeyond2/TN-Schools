"use client";

// Renderers for the six AI Content Studio output kinds.
//
// Every renderer takes the raw payload plus an optional `onEdit(path, value)`.
// When onEdit is supplied the text becomes contentEditable, so a teacher can
// correct the AI before saving — teachers rarely ship raw output.
//
// Styling follows the teacher portal conventions: theme-card panels, CSS
// variables only (never hardcoded colours, so dark mode works), text-xs scale.

import React from "react";
import type { OutputKind } from "@/lib/aiSkills";
import { InfographicRenderer } from "@/components/InfographicRenderer";

export type EditFn = (path: (string | number)[], value: string) => void;

interface RendererProps {
  payload: any;
  onEdit?: EditFn;
}

// ---------------------------------------------------------------------------
// Editable primitive
// ---------------------------------------------------------------------------

function Editable({
  value,
  path,
  onEdit,
  className = "",
  as = "div",
  placeholder,
}: {
  value: string;
  path: (string | number)[];
  onEdit?: EditFn;
  className?: string;
  as?: "div" | "span" | "h3" | "h4" | "p" | "li";
  placeholder?: string;
}) {
  const Tag = as as any;
  if (!onEdit) {
    return <Tag className={className}>{value || placeholder || ""}</Tag>;
  }
  return (
    <Tag
      className={`${className} outline-none rounded px-1 -mx-1 focus:ring-2 focus:ring-[var(--primary)]/50 hover:bg-[var(--primary)]/5 transition`}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const next = e.currentTarget.innerText;
        if (next !== value) onEdit(path, next);
      }}
    >
      {value || ""}
    </Tag>
  );
}

function SectionCard({
  children,
  tone = "card",
}: {
  children: React.ReactNode;
  tone?: "card" | "muted";
}) {
  return (
    <div
      className={`rounded-xl border border-[var(--border)] p-4 ${
        tone === "muted" ? "bg-[var(--bg-main)]" : "bg-[var(--bg-card)]"
      }`}
    >
      {children}
    </div>
  );
}

function Pill({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "accent" | "warn" }) {
  const tones: Record<string, string> = {
    default: "bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border)]",
    accent: "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30",
    warn: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function OutputHeader({
  title,
  subtitle,
  meta,
  path,
  onEdit,
}: {
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
  path: (string | number)[];
  onEdit?: EditFn;
}) {
  return (
    <div className="mb-4 pb-4 border-b border-[var(--border)]">
      <Editable
        as="h3"
        value={title}
        path={path}
        onEdit={onEdit}
        className="text-lg font-bold text-[var(--text-heading)] leading-snug"
        placeholder="Untitled"
      />
      {subtitle !== undefined && subtitle !== "" && (
        <Editable
          as="p"
          value={subtitle}
          path={["subtitle"]}
          onEdit={onEdit}
          className="text-xs text-[var(--text-muted)] mt-1"
        />
      )}
      {meta && <div className="flex flex-wrap gap-1.5 mt-2">{meta}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// document — /lesson /explain /activity /project /feedback
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// document — /lesson /explain /activity /project /feedback (Enhanced Study Notes)
// ---------------------------------------------------------------------------

export function DocumentRenderer({ payload, onEdit }: RendererProps) {
  const sections: any[] = Array.isArray(payload?.sections) ? payload.sections : [];
  const keyTerms: any[] = Array.isArray(payload?.keyTerms) ? payload.keyTerms : [];
  const notes: string[] = Array.isArray(payload?.teacherNotes) ? payload.teacherNotes : [];
  const totalMins = sections.reduce((n, s) => n + (Number(s?.durationMins) || 0), 0);

  const scrollToSection = (index: number) => {
    const el = document.getElementById(`doc-section-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/50 p-5 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              📖 Study Notes & Lesson Guide
            </span>
            {totalMins > 0 && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ⏱ {totalMins} min read
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {sections.length} section{sections.length > 1 ? "s" : ""}
            </span>
          </div>

          <Editable
            as="h1"
            value={payload?.title || "Study Notes"}
            path={["title"]}
            onEdit={onEdit}
            className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug"
          />

          {payload?.subtitle && (
            <p className="text-xs sm:text-sm text-indigo-200/80 leading-relaxed max-w-3xl">
              {payload.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Table of Contents Section Jumper */}
      {sections.length > 1 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3 space-y-2">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            <span>⚡ Quick Jump to Section:</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {sections.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToSection(i)}
                className="shrink-0 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-main)] text-xs font-semibold text-[var(--text-heading)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition truncate max-w-[200px]"
              >
                {i + 1}. {s?.heading || `Section ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Executive Summary Card */}
      {payload?.summary && (
        <div className="rounded-2xl border-l-4 border-l-indigo-500 border border-[var(--border)] bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent p-5 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-xs">
              💡
            </span>
            <span>Key Summary</span>
          </div>
          <Editable
            value={payload.summary}
            path={["summary"]}
            onEdit={onEdit}
            className="text-xs sm:text-sm leading-relaxed text-[var(--text-heading)] font-medium"
          />
        </div>
      )}

      {/* Main Sections List */}
      <div className="space-y-5">
        {sections.map((s, i) => (
          <div
            id={`doc-section-${i}`}
            key={i}
            className="theme-card p-5 sm:p-6 border border-[var(--border)] hover:border-[var(--primary)]/40 transition-all space-y-4 shadow-sm"
          >
            {/* Section Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--border)]">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Editable
                  as="h3"
                  value={s?.heading || ""}
                  path={["sections", i, "heading"]}
                  onEdit={onEdit}
                  className="text-base sm:text-lg font-extrabold text-[var(--text-heading)] leading-snug"
                />
              </div>

              {Number(s?.durationMins) > 0 && (
                <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30">
                  ⏱ {s.durationMins} min
                </span>
              )}
            </div>

            {/* Section Main Body Text */}
            {s?.body && (
              <Editable
                value={s.body}
                path={["sections", i, "body"]}
                onEdit={onEdit}
                className="text-xs sm:text-sm leading-relaxed text-[var(--text-heading)] whitespace-pre-wrap font-normal"
              />
            )}

            {/* Section Key Bullets / Takeaways */}
            {Array.isArray(s?.bullets) && s.bullets.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Key Points:
                </div>
                <div className="grid gap-2">
                  {s.bullets.map((b: string, j: number) => (
                    <div
                      key={j}
                      className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border)] flex items-start gap-2.5 hover:border-[var(--primary)]/30 transition"
                    >
                      <span className="w-5 h-5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        ▸
                      </span>
                      <Editable
                        as="div"
                        value={b}
                        path={["sections", i, "bullets", j]}
                        onEdit={onEdit}
                        className="flex-1 text-xs sm:text-sm text-[var(--text-heading)] leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Key Terms Glossary Grid */}
      {keyTerms.length > 0 && (
        <div className="theme-card p-5 sm:p-6 space-y-4 border border-[var(--border)]">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
            <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
              🔑
            </span>
            <h3 className="text-sm font-extrabold text-[var(--text-heading)] uppercase tracking-wide">
              Key Glossary Terms ({keyTerms.length})
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {keyTerms.map((t, i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-3.5 space-y-1.5 hover:border-emerald-500/40 transition"
              >
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <Editable
                    as="span"
                    value={t?.term || ""}
                    path={["keyTerms", i, "term"]}
                    onEdit={onEdit}
                    className="text-xs font-extrabold text-[var(--text-heading)]"
                  />
                  {t?.tamil && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {t.tamil}
                    </span>
                  )}
                </div>
                <Editable
                  value={t?.meaning || ""}
                  path={["keyTerms", i, "meaning"]}
                  onEdit={onEdit}
                  className="text-xs text-[var(--text-muted)] leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teacher Notes Callout */}
      {notes.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 space-y-3">
          <div className="text-xs font-extrabold uppercase tracking-wide text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-xs">
              📌
            </span>
            <span>Teacher Guidelines & Learning Tips</span>
          </div>
          <div className="space-y-2">
            {notes.map((n, i) => (
              <div key={i} className="flex gap-2.5 text-xs text-[var(--text-heading)] leading-relaxed">
                <span className="text-amber-500 font-bold shrink-0">•</span>
                <Editable as="span" value={n} path={["teacherNotes", i]} onEdit={onEdit} className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// questionSet — /quiz /mcq /questions /assessment /answer-key
// ---------------------------------------------------------------------------

const DIFFICULTY_TONE: Record<string, string> = {
  easy: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  hard: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
};

export function QuestionSetRenderer({ payload, onEdit }: RendererProps) {
  const questions: any[] = Array.isArray(payload?.questions) ? payload.questions : [];
  const [showAnswers, setShowAnswers] = React.useState(true);

  return (
    <div className="space-y-4">
      <OutputHeader
        title={payload?.title || ""}
        path={["title"]}
        onEdit={onEdit}
        meta={
          <>
            <Pill tone="accent">{questions.length} questions</Pill>
            {payload?.totalMarks > 0 && <Pill>{payload.totalMarks} marks</Pill>}
            {payload?.durationMins > 0 && <Pill>⏱ {payload.durationMins} min</Pill>}
          </>
        }
      />

      {payload?.instructions && (
        <SectionCard tone="muted">
          <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1.5">
            Instructions
          </div>
          <Editable
            value={payload.instructions}
            path={["instructions"]}
            onEdit={onEdit}
            className="text-xs leading-relaxed text-[var(--text-heading)] whitespace-pre-wrap"
          />
        </SectionCard>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowAnswers((v) => !v)}
          className="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40 transition"
        >
          {showAnswers ? "🙈 Hide answers" : "👁 Show answers"}
        </button>
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => {
          const tone = DIFFICULTY_TONE[String(q?.difficulty || "").toLowerCase()] || DIFFICULTY_TONE.medium;
          return (
            <SectionCard key={i}>
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-lg bg-[var(--primary)] text-white text-[11px] font-bold flex items-center justify-center">
                  {q?.number ?? i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <Editable
                    value={q?.text || ""}
                    path={["questions", i, "text"]}
                    onEdit={onEdit}
                    className="text-xs font-semibold text-[var(--text-heading)] leading-relaxed"
                  />

                  {Array.isArray(q?.options) && q.options.length > 0 && (
                    <div className="grid gap-1.5 mt-2 sm:grid-cols-2">
                      {q.options.map((opt: string, j: number) => {
                        const isAnswer = showAnswers && opt && opt === q?.answer;
                        return (
                          <div
                            key={j}
                            className={`text-[11px] px-2.5 py-1.5 rounded-lg border leading-relaxed ${
                              isAnswer
                                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold"
                                : "border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-muted)]"
                            }`}
                          >
                            <Editable as="span" value={opt} path={["questions", i, "options", j]} onEdit={onEdit} />
                            {isAnswer && <span className="ml-1">✓</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {showAnswers && (
                    <div className="mt-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-2.5 py-2">
                      <div className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-0.5">
                        Answer
                      </div>
                      <Editable
                        value={q?.answer || ""}
                        path={["questions", i, "answer"]}
                        onEdit={onEdit}
                        className="text-[11px] text-[var(--text-heading)] leading-relaxed whitespace-pre-wrap"
                      />
                      {q?.explanation && (
                        <Editable
                          value={q.explanation}
                          path={["questions", i, "explanation"]}
                          onEdit={onEdit}
                          className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-relaxed whitespace-pre-wrap"
                        />
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {q?.type && <Pill>{q.type}</Pill>}
                    {q?.difficulty && (
                      <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold ${tone}`}>
                        {q.difficulty}
                      </span>
                    )}
                    {q?.marks > 0 && <Pill tone="accent">{q.marks} mark{q.marks > 1 ? "s" : ""}</Pill>}
                  </div>
                </div>
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// worksheet — /worksheet /homework
// ---------------------------------------------------------------------------

export function WorksheetRenderer({ payload, onEdit }: RendererProps) {
  const sections: any[] = Array.isArray(payload?.sections) ? payload.sections : [];
  const answerKey: any[] = Array.isArray(payload?.answerKey) ? payload.answerKey : [];
  const commonErrors: string[] = Array.isArray(payload?.commonErrors) ? payload.commonErrors : [];
  const [tab, setTab] = React.useState<"sheet" | "key">("sheet");

  const totalItems = sections.reduce(
    (n, s) => n + (Array.isArray(s?.items) ? s.items.length : 0),
    0
  );

  return (
    <div className="space-y-4">
      <OutputHeader
        title={payload?.title || ""}
        path={["title"]}
        onEdit={onEdit}
        meta={
          <>
            <Pill tone="accent">{totalItems} items</Pill>
            {payload?.estimatedMins > 0 && <Pill>⏱ ~{payload.estimatedMins} min</Pill>}
            <Pill>{answerKey.length} answers</Pill>
          </>
        }
      />

      <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border)]">
        {(["sheet", "key"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 text-[11px] font-bold py-2 rounded-lg transition ${
              tab === t
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-heading)]"
            }`}
          >
            {t === "sheet" ? "📄 Student Sheet" : "🔑 Answer Key"}
          </button>
        ))}
      </div>

      {tab === "sheet" ? (
        <div className="space-y-3">
          {payload?.instructions && (
            <SectionCard tone="muted">
              <Editable
                value={payload.instructions}
                path={["instructions"]}
                onEdit={onEdit}
                className="text-xs leading-relaxed text-[var(--text-heading)] whitespace-pre-wrap"
              />
            </SectionCard>
          )}

          {payload?.passage && String(payload.passage).trim() !== "" && (
            <SectionCard>
              <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">
                Read this first
              </div>
              <Editable
                value={payload.passage}
                path={["passage"]}
                onEdit={onEdit}
                className="text-xs leading-relaxed text-[var(--text-heading)] whitespace-pre-wrap font-serif"
              />
            </SectionCard>
          )}

          {sections.map((s, i) => (
            <SectionCard key={i}>
              <Editable
                as="h4"
                value={s?.heading || ""}
                path={["sections", i, "heading"]}
                onEdit={onEdit}
                className="text-sm font-bold text-[var(--text-heading)] mb-1"
              />
              {s?.intro && (
                <Editable
                  value={s.intro}
                  path={["sections", i, "intro"]}
                  onEdit={onEdit}
                  className="text-[11px] text-[var(--text-muted)] mb-3 leading-relaxed"
                />
              )}
              <div className="space-y-3">
                {(Array.isArray(s?.items) ? s.items : []).map((item: any, j: number) => (
                  <div key={j}>
                    <div className="flex gap-2">
                      <span className="text-xs font-bold text-[var(--primary)] shrink-0">
                        {item?.number ?? j + 1}.
                      </span>
                      <Editable
                        value={item?.prompt || ""}
                        path={["sections", i, "items", j, "prompt"]}
                        onEdit={onEdit}
                        className="text-xs text-[var(--text-heading)] leading-relaxed flex-1"
                      />
                    </div>
                    {Number(item?.workingLines) > 0 && (
                      <div className="ml-6 mt-1.5 space-y-2" aria-hidden>
                        {Array.from({ length: Math.min(Number(item.workingLines), 12) }).map((_, k) => (
                          <div key={k} className="border-b border-dashed border-[var(--border)]" />
                        ))}
                      </div>
                    )}
                    {item?.hint && (
                      <div className="ml-6 mt-1 text-[10px] text-[var(--text-muted)] italic">💡 {item.hint}</div>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <SectionCard>
            <div className="space-y-2.5">
              {answerKey.map((a, i) => (
                <div key={i} className="flex gap-2.5">
                  <span className="shrink-0 w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center justify-center">
                    {a?.number ?? i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <Editable
                      value={a?.answer || ""}
                      path={["answerKey", i, "answer"]}
                      onEdit={onEdit}
                      className="text-xs font-semibold text-[var(--text-heading)] leading-relaxed whitespace-pre-wrap"
                    />
                    {Array.isArray(a?.workedSteps) && a.workedSteps.length > 0 && (
                      <ol className="mt-1 space-y-0.5">
                        {a.workedSteps.map((step: string, j: number) => (
                          <li key={j} className="text-[11px] text-[var(--text-muted)] leading-relaxed flex gap-1.5">
                            <span className="text-[var(--primary)] shrink-0">{j + 1}.</span>
                            <Editable
                              as="span"
                              value={step}
                              path={["answerKey", i, "workedSteps", j]}
                              onEdit={onEdit}
                              className="flex-1"
                            />
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {commonErrors.length > 0 && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
              <div className="text-[10px] font-bold uppercase tracking-wide text-rose-600 dark:text-rose-400 mb-2">
                ⚠️ Watch for these mistakes
              </div>
              <ul className="space-y-1.5">
                {commonErrors.map((e, i) => (
                  <li key={i} className="flex gap-2 text-xs text-[var(--text-heading)] leading-relaxed">
                    <span className="text-rose-500 shrink-0">•</span>
                    <Editable as="span" value={e} path={["commonErrors", i]} onEdit={onEdit} className="flex-1" />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// matrix — /rubric /differentiate
// ---------------------------------------------------------------------------

export function MatrixRenderer({ payload, onEdit }: RendererProps) {
  const columns: string[] = Array.isArray(payload?.columns) ? payload.columns : [];
  const rows: any[] = Array.isArray(payload?.rows) ? payload.rows : [];
  const legend: string[] = Array.isArray(payload?.legend) ? payload.legend : [];

  return (
    <div className="space-y-4">
      <OutputHeader
        title={payload?.title || ""}
        path={["title"]}
        onEdit={onEdit}
        meta={
          <>
            <Pill tone="accent">{rows.length} criteria</Pill>
            <Pill>{columns.length} levels</Pill>
          </>
        }
      />

      {payload?.description && (
        <SectionCard tone="muted">
          <Editable
            value={payload.description}
            path={["description"]}
            onEdit={onEdit}
            className="text-xs leading-relaxed text-[var(--text-heading)]"
          />
        </SectionCard>
      )}

      {/* Wide tables must scroll inside their own container, never the page */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="bg-[var(--bg-main)]">
              <th className="p-3 text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] border-b border-[var(--border)] sticky left-0 bg-[var(--bg-main)] min-w-[140px]">
                Criterion
              </th>
              {columns.map((c, i) => (
                <th
                  key={i}
                  className="p-3 text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] border-b border-l border-[var(--border)] min-w-[160px]"
                >
                  <Editable as="span" value={c} path={["columns", i]} onEdit={onEdit} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="align-top">
                <td className="p-3 border-b border-[var(--border)] sticky left-0 bg-[var(--bg-card)]">
                  <Editable
                    value={r?.label || ""}
                    path={["rows", i, "label"]}
                    onEdit={onEdit}
                    className="text-xs font-bold text-[var(--text-heading)] leading-snug"
                  />
                  {r?.weight && String(r.weight).trim() !== "" && (
                    <div className="mt-1">
                      <Pill tone="accent">{r.weight}</Pill>
                    </div>
                  )}
                </td>
                {columns.map((_, j) => (
                  <td key={j} className="p-3 border-b border-l border-[var(--border)]">
                    <Editable
                      value={(Array.isArray(r?.cells) ? r.cells[j] : "") || ""}
                      path={["rows", i, "cells", j]}
                      onEdit={onEdit}
                      className="text-[11px] text-[var(--text-muted)] leading-relaxed"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {legend.length > 0 && (
        <SectionCard tone="muted">
          <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">
            How to use this
          </div>
          <ul className="space-y-1.5">
            {legend.map((l, i) => (
              <li key={i} className="flex gap-2 text-xs text-[var(--text-heading)] leading-relaxed">
                <span className="text-[var(--primary)] shrink-0">•</span>
                <Editable as="span" value={l} path={["legend", i]} onEdit={onEdit} className="flex-1" />
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// cardList — /examples /simplify /revision /discussion /engage
// ---------------------------------------------------------------------------

export function CardListRenderer({ payload, onEdit }: RendererProps) {
  const cards: any[] = Array.isArray(payload?.cards) ? payload.cards : [];

  return (
    <div className="space-y-4">
      <OutputHeader
        title={payload?.title || ""}
        path={["title"]}
        onEdit={onEdit}
        meta={<Pill tone="accent">{cards.length} cards</Pill>}
      />

      {payload?.intro && (
        <SectionCard tone="muted">
          <Editable
            value={payload.intro}
            path={["intro"]}
            onEdit={onEdit}
            className="text-xs leading-relaxed text-[var(--text-heading)]"
          />
        </SectionCard>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((c, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 hover:border-[var(--primary)]/40 transition"
          >
            <div className="flex items-start gap-2.5 mb-2">
              <span className="text-xl leading-none shrink-0">{c?.icon || "•"}</span>
              <Editable
                as="h4"
                value={c?.title || ""}
                path={["cards", i, "title"]}
                onEdit={onEdit}
                className="text-xs font-bold text-[var(--text-heading)] leading-snug flex-1"
              />
            </div>
            <Editable
              value={c?.body || ""}
              path={["cards", i, "body"]}
              onEdit={onEdit}
              className="text-[11px] text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap"
            />
            {c?.tag && (
              <div className="mt-2.5">
                <Pill>{c.tag}</Pill>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// slides — /presentation (Clean Single-Theme Slide Deck Renderer)
// ---------------------------------------------------------------------------

export function SlidesRenderer({ payload, onEdit }: RendererProps) {
  const slides: any[] = Array.isArray(payload?.slides) ? payload.slides : [];
  const [active, setActive] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isTheater, setIsTheater] = React.useState(false);

  const slide = slides[Math.min(active, Math.max(slides.length - 1, 0))];

  // Auto-play interval
  React.useEffect(() => {
    if (!isPlaying || slides.length === 0) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  if (slides.length === 0) {
    return <div className="text-xs text-[var(--text-muted)]">No slides were generated.</div>;
  }

  const prevSlide = () => setActive((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  const nextSlide = () => setActive((prev) => (prev < slides.length - 1 ? prev + 1 : 0));

  const progressPercent = Math.round(((active + 1) / slides.length) * 100);

  return (
    <div className={`space-y-5 ${isTheater ? "fixed inset-0 z-50 bg-[var(--bg-main)] p-4 sm:p-8 overflow-y-auto" : ""}`}>
      {/* Top Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <OutputHeader
          title={payload?.title || "Presentation Deck"}
          path={["title"]}
          onEdit={onEdit}
          meta={<Pill tone="accent">📊 {slides.length} Interactive Slides</Pill>}
        />

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={() => setIsPlaying((v) => !v)}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
              isPlaying
                ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] font-extrabold"
                : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)]/40 hover:text-[var(--text-heading)]"
            }`}
          >
            {isPlaying ? "⏸ Pause Slideshow" : "▶ Auto-Play"}
          </button>

          <button
            type="button"
            onClick={() => setIsTheater((v) => !v)}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition ${
              isTheater
                ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-sm"
                : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)]/40 hover:text-[var(--text-heading)]"
            }`}
          >
            {isTheater ? "↙ Exit Theater" : "⛶ Theater Mode"}
          </button>
        </div>
      </div>

      {/* Slide Presentation Canvas */}
      <div className="theme-card rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-lg overflow-hidden flex flex-col justify-between min-h-[360px] sm:min-h-[440px] relative">
        {/* Top Progress Line */}
        <div className="h-1.5 w-full bg-[var(--border)]">
          <div
            className="h-full bg-[var(--primary)] transition-all duration-300 rounded-r-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Slide Stage Header */}
        <div className="p-4 sm:p-5 pb-3 border-b border-[var(--border)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] truncate max-w-xs sm:max-w-md">
              {payload?.title || "Presentation"}
            </span>
          </div>

          <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)]">
            SLIDE {String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
        </div>

        {/* Slide Body Content */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
          {/* Slide Heading */}
          <div className="space-y-2">
            <Editable
              as="h2"
              value={slide?.title || ""}
              path={["slides", active, "title"]}
              onEdit={onEdit}
              className="text-lg sm:text-xl font-extrabold text-[var(--text-heading)] leading-snug"
            />
          </div>

          {/* Slide Bullet Point Cards */}
          <div className="space-y-2.5 my-auto overflow-y-auto max-h-[340px] pr-1">
            {(Array.isArray(slide?.bullets) ? slide.bullets : []).map((bullet: string, j: number) => (
              <div
                key={j}
                className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] flex items-start gap-3 hover:border-[var(--primary)]/40 transition"
              >
                <span className="w-6 h-6 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  ▸
                </span>
                <Editable
                  as="div"
                  value={bullet}
                  path={["slides", active, "bullets", j]}
                  onEdit={onEdit}
                  className="flex-1 text-xs sm:text-sm font-semibold text-[var(--text-heading)] leading-relaxed"
                />
              </div>
            ))}
          </div>

          {/* Slide Navigation Footer */}
          <div className="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevSlide}
                className="px-3.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-heading)] font-bold hover:border-[var(--primary)] hover:text-[var(--primary)] transition flex items-center gap-1"
              >
                ← Prev Slide
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="px-3.5 py-1.5 rounded-xl bg-[var(--primary)] text-white font-bold hover:opacity-90 transition flex items-center gap-1 shadow-sm"
              >
                Next Slide →
              </button>
            </div>

            {slides[active + 1] && (
              <span className="text-[11px] text-[var(--text-muted)] truncate max-w-[240px] hidden sm:inline-block">
                Next: <span className="font-semibold text-[var(--text-heading)]">{slides[active + 1]?.title}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filmstrip Thumbnail Bar */}
      <div className="space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
          Slides Navigation ({slides.length}):
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {slides.map((s, i) => {
            const isActive = i === active;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={`shrink-0 text-left w-36 sm:w-44 p-2.5 rounded-xl border transition ${
                  isActive
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] font-bold shadow-sm"
                    : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:border-[var(--primary)]/30"
                }`}
              >
                <div className="flex items-center justify-between text-[9px] font-bold mb-1">
                  <span>Slide #{i + 1}</span>
                  <span>{(s?.bullets || []).length} pts</span>
                </div>
                <div className="text-xs truncate">{s?.title || `Slide ${i + 1}`}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Hint & Speaker Notes Cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {slide?.visualHint && (
          <SectionCard tone="muted">
            <div className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--primary)] mb-1.5 flex items-center gap-1.5">
              <span>🎨 Visual & Drawing Guide</span>
            </div>
            <Editable
              value={slide.visualHint}
              path={["slides", active, "visualHint"]}
              onEdit={onEdit}
              className="text-xs text-[var(--text-heading)] leading-relaxed"
            />
          </SectionCard>
        )}
        {slide?.speakerNotes && (
          <SectionCard tone="muted">
            <div className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--primary)] mb-1.5 flex items-center gap-1.5">
              <span>🗣️ Speaker Notes</span>
            </div>
            <Editable
              value={slide.speakerNotes}
              path={["slides", active, "speakerNotes"]}
              onEdit={onEdit}
              className="text-xs text-[var(--text-heading)] leading-relaxed"
            />
          </SectionCard>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dispatcher + loading skeletons
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// infographic — /infographic
//
// Delegates to the existing poster renderer used by AI Lesson Creator. The
// studio schema mirrors VISUAL_DESIGN_SCHEMA field for field, so no adapter is
// needed. Not inline-editable: it is a laid-out visual, not a text document —
// regenerate or refine it instead.
// ---------------------------------------------------------------------------

const INFOGRAPHIC_STYLES = ["Exam point of view", "General knowledge", "Know more"] as const;

export function InfographicOutput({ payload }: RendererProps) {
  const [style, setStyle] = React.useState<string>(payload?.__focus || "General knowledge");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mr-1">
          Poster style
        </span>
        {INFOGRAPHIC_STYLES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStyle(s)}
            className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
              style === s
                ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <InfographicRenderer data={payload} focus={style} />
      </div>
    </div>
  );
}

const RENDERERS: Record<OutputKind, React.ComponentType<RendererProps>> = {
  document: DocumentRenderer,
  questionSet: QuestionSetRenderer,
  worksheet: WorksheetRenderer,
  matrix: MatrixRenderer,
  cardList: CardListRenderer,
  slides: SlidesRenderer,
  infographic: InfographicOutput,
};

export function OutputRenderer({
  outputKind,
  payload,
  onEdit,
}: {
  outputKind: OutputKind;
  payload: any;
  onEdit?: EditFn;
}) {
  const Component = RENDERERS[outputKind] || DocumentRenderer;
  if (!payload) return null;
  return <Component payload={payload} onEdit={onEdit} />;
}

function Bar({ w = "100%", h = "0.75rem" }: { w?: string; h?: string }) {
  return (
    <div
      className="rounded bg-[var(--border)] animate-pulse"
      style={{ width: w, height: h }}
    />
  );
}

/** Skeleton shaped like the target output, so the wait previews the result. */
export function OutputSkeleton({ outputKind }: { outputKind: OutputKind }) {
  if (outputKind === "matrix") {
    return (
      <div className="space-y-3">
        <Bar w="55%" h="1.1rem" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 16 }).map((_, i) => (
            <Bar key={i} h="2.5rem" />
          ))}
        </div>
      </div>
    );
  }
  if (outputKind === "cardList") {
    return (
      <div className="space-y-3">
        <Bar w="45%" h="1.1rem" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--border)] p-4 space-y-2">
              <Bar w="60%" />
              <Bar />
              <Bar w="80%" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (outputKind === "infographic") {
    return (
      <div className="space-y-3">
        <Bar w="40%" h="1.1rem" />
        <div className="rounded-xl border border-[var(--border)] p-5 space-y-4">
          <Bar w="65%" h="1.6rem" />
          <Bar w="45%" />
          <Bar h="9rem" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Bar key={i} h="3.5rem" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (outputKind === "slides") {
    return (
      <div className="space-y-3">
        <Bar w="45%" h="1.1rem" />
        <div className="aspect-[16/9] rounded-xl border border-[var(--border)] p-6 space-y-3">
          <Bar w="70%" h="1.2rem" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Bar key={i} w={`${85 - i * 8}%`} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <Bar w="55%" h="1.1rem" />
      <Bar w="35%" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-[var(--border)] p-4 space-y-2">
          <Bar w="40%" />
          <Bar />
          <Bar w="90%" />
          <Bar w="65%" />
        </div>
      ))}
    </div>
  );
}
