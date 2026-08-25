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

export function DocumentRenderer({ payload, onEdit }: RendererProps) {
  const sections: any[] = Array.isArray(payload?.sections) ? payload.sections : [];
  const keyTerms: any[] = Array.isArray(payload?.keyTerms) ? payload.keyTerms : [];
  const notes: string[] = Array.isArray(payload?.teacherNotes) ? payload.teacherNotes : [];
  const totalMins = sections.reduce((n, s) => n + (Number(s?.durationMins) || 0), 0);

  return (
    <div className="space-y-4">
      <OutputHeader
        title={payload?.title || ""}
        subtitle={payload?.subtitle}
        path={["title"]}
        onEdit={onEdit}
        meta={
          <>
            {totalMins > 0 && <Pill tone="accent">⏱ {totalMins} min total</Pill>}
            <Pill>{sections.length} sections</Pill>
          </>
        }
      />

      {payload?.summary && (
        <SectionCard tone="muted">
          <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1.5">
            Summary
          </div>
          <Editable
            value={payload.summary}
            path={["summary"]}
            onEdit={onEdit}
            className="text-xs leading-relaxed text-[var(--text-heading)]"
          />
        </SectionCard>
      )}

      {sections.map((s, i) => (
        <SectionCard key={i}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <Editable
              as="h4"
              value={s?.heading || ""}
              path={["sections", i, "heading"]}
              onEdit={onEdit}
              className="text-sm font-bold text-[var(--text-heading)]"
            />
            {Number(s?.durationMins) > 0 && <Pill tone="accent">{s.durationMins} min</Pill>}
          </div>
          {s?.body && (
            <Editable
              value={s.body}
              path={["sections", i, "body"]}
              onEdit={onEdit}
              className="text-xs leading-relaxed text-[var(--text-muted)] mb-2 whitespace-pre-wrap"
            />
          )}
          {Array.isArray(s?.bullets) && s.bullets.length > 0 && (
            <ul className="space-y-1.5">
              {s.bullets.map((b: string, j: number) => (
                <li key={j} className="flex gap-2 text-xs text-[var(--text-heading)] leading-relaxed">
                  <span className="text-[var(--primary)] font-bold shrink-0 mt-0.5">▸</span>
                  <Editable
                    as="span"
                    value={b}
                    path={["sections", i, "bullets", j]}
                    onEdit={onEdit}
                    className="flex-1"
                  />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      ))}

      {keyTerms.length > 0 && (
        <SectionCard>
          <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-2">
            Key Terms
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {keyTerms.map((t, i) => (
              <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--bg-main)] p-2.5">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <Editable
                    as="span"
                    value={t?.term || ""}
                    path={["keyTerms", i, "term"]}
                    onEdit={onEdit}
                    className="text-xs font-bold text-[var(--text-heading)]"
                  />
                  {t?.tamil && (
                    <span className="text-[11px] text-[var(--primary)] font-semibold">{t.tamil}</span>
                  )}
                </div>
                <Editable
                  value={t?.meaning || ""}
                  path={["keyTerms", i, "meaning"]}
                  onEdit={onEdit}
                  className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed"
                />
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {notes.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-2">
            📌 Teacher Notes
          </div>
          <ul className="space-y-1.5">
            {notes.map((n, i) => (
              <li key={i} className="flex gap-2 text-xs text-[var(--text-heading)] leading-relaxed">
                <span className="text-amber-500 shrink-0">•</span>
                <Editable as="span" value={n} path={["teacherNotes", i]} onEdit={onEdit} className="flex-1" />
              </li>
            ))}
          </ul>
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
// slides — /presentation
// ---------------------------------------------------------------------------

export function SlidesRenderer({ payload, onEdit }: RendererProps) {
  const slides: any[] = Array.isArray(payload?.slides) ? payload.slides : [];
  const [active, setActive] = React.useState(0);
  const slide = slides[Math.min(active, Math.max(slides.length - 1, 0))];

  if (slides.length === 0) {
    return <div className="text-xs text-[var(--text-muted)]">No slides were generated.</div>;
  }

  return (
    <div className="space-y-4">
      <OutputHeader
        title={payload?.title || ""}
        path={["title"]}
        onEdit={onEdit}
        meta={<Pill tone="accent">{slides.length} slides</Pill>}
      />

      {/* Projector-style stage */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
        <div className="aspect-[16/9] p-6 flex flex-col">
          <Editable
            as="h3"
            value={slide?.title || ""}
            path={["slides", active, "title"]}
            onEdit={onEdit}
            className="text-base font-bold text-[var(--text-heading)] mb-4 pb-3 border-b border-[var(--border)]"
          />
          <ul className="space-y-2.5 flex-1 overflow-y-auto">
            {(Array.isArray(slide?.bullets) ? slide.bullets : []).map((b: string, j: number) => (
              <li key={j} className="flex gap-2.5 text-sm text-[var(--text-heading)] leading-relaxed">
                <span className="text-[var(--primary)] font-bold shrink-0">▸</span>
                <Editable
                  as="span"
                  value={b}
                  path={["slides", active, "bullets", j]}
                  onEdit={onEdit}
                  className="flex-1"
                />
              </li>
            ))}
          </ul>
          <div className="text-[10px] text-[var(--text-muted)] text-right mt-2">
            {active + 1} / {slides.length}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {slide?.visualHint && (
          <SectionCard tone="muted">
            <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1.5">
              🎨 Show / draw this
            </div>
            <Editable
              value={slide.visualHint}
              path={["slides", active, "visualHint"]}
              onEdit={onEdit}
              className="text-[11px] text-[var(--text-heading)] leading-relaxed"
            />
          </SectionCard>
        )}
        {slide?.speakerNotes && (
          <SectionCard tone="muted">
            <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1.5">
              🗣 Say this
            </div>
            <Editable
              value={slide.speakerNotes}
              path={["slides", active, "speakerNotes"]}
              onEdit={onEdit}
              className="text-[11px] text-[var(--text-heading)] leading-relaxed"
            />
          </SectionCard>
        )}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {slides.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            title={s?.title}
            className={`shrink-0 px-3 py-2 rounded-lg border text-[10px] font-bold max-w-[120px] truncate transition ${
              i === active
                ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--primary)]/40"
            }`}
          >
            {i + 1}. {s?.title || "Slide"}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dispatcher + loading skeletons
// ---------------------------------------------------------------------------

const RENDERERS: Record<OutputKind, React.ComponentType<RendererProps>> = {
  document: DocumentRenderer,
  questionSet: QuestionSetRenderer,
  worksheet: WorksheetRenderer,
  matrix: MatrixRenderer,
  cardList: CardListRenderer,
  slides: SlidesRenderer,
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
