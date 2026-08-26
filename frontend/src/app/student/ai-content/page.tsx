"use client";

// Class Materials — what the teacher published from the AI Content Studio.
//
// Scoped to the student's own class and section by GET /api/ai-studio/published.
// Content saved without a section is treated as whole-class, so it reaches
// every section.
//
// Read-only by design: students can read, print and study, never edit.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { apiFetch } from "@/lib/api";
import {
  PACK_DISPLAY,
  OUTPUT_KIND_LABEL,
  type OutputKind,
  type SubjectPack,
} from "@/lib/aiSkills";
import { OutputRenderer } from "@/components/ai-studio/renderers";
import { printOutput } from "@/components/ai-studio/printable";

interface PublishedItem {
  id: string;
  skillKey: string;
  outputKind: OutputKind;
  subjectPack: SubjectPack;
  subject: string;
  className: string;
  section: string | null;
  topic: string;
  title: string;
  language: string;
  payload: any;
  publishedAt: string | null;
}

// Student-facing labels — students should not see teacher command names.
const KIND_BADGE: Record<string, { label: string; icon: string; tone: string }> = {
  worksheet: { label: "Worksheet", icon: "fi fi-rr-file-edit", tone: "text-purple-600 dark:text-purple-400 border-purple-500/30 bg-purple-500/10" },
  questionSet: { label: "Practice questions", icon: "fi fi-rr-list-check", tone: "text-cyan-600 dark:text-cyan-400 border-cyan-500/30 bg-cyan-500/10" },
  document: { label: "Notes", icon: "fi fi-rr-document", tone: "text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10" },
  cardList: { label: "Key points", icon: "fi fi-rr-layer-group", tone: "text-teal-600 dark:text-teal-400 border-teal-500/30 bg-teal-500/10" },
  matrix: { label: "Guide", icon: "fi fi-rr-grid", tone: "text-indigo-600 dark:text-indigo-400 border-indigo-500/30 bg-indigo-500/10" },
  slides: { label: "Slides", icon: "fi fi-rr-presentation", tone: "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  infographic: { label: "Infographic", icon: "fi fi-rr-chart-pie", tone: "text-sky-600 dark:text-sky-400 border-sky-500/30 bg-sky-500/10" },
};

export default function StudentAIContentPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const studentClass: string | undefined = user?.class;
  const studentSection: string | null = user?.section || null;
  const schoolId: string | undefined = user?.schoolId;

  const [items, setItems] = useState<PublishedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [isFullWidth, setIsFullWidth] = useState(false);

  const load = useCallback(async () => {
    if (!studentClass) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("class", String(studentClass));
      if (studentSection) params.set("section", studentSection);
      if (schoolId) params.set("schoolId", schoolId);
      const res = await apiFetch(`/api/ai-studio/published?${params.toString()}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Could not load your class materials");
      setItems(json.data || []);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Can't reach the server right now. Try again in a moment."
          : String(err instanceof Error ? err.message : err)
      );
    } finally {
      setLoading(false);
    }
  }, [studentClass, studentSection, schoolId]);

  useEffect(() => {
    load();
  }, [load]);

  const subjects = useMemo(
    () => Array.from(new Set(items.map((i) => i.subject).filter(Boolean))).sort(),
    [items]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (subjectFilter !== "ALL" && i.subject !== subjectFilter) return false;
      if (!q) return true;
      return i.title.toLowerCase().includes(q) || i.topic.toLowerCase().includes(q);
    });
  }, [items, subjectFilter, query]);

  const open = filtered.find((i) => i.id === openId) || null;

  return (
    <PortalLayout
      title="Class Materials"
      subtitle="Worksheets, notes and practice your teacher published for your class"
    >
      <div className="space-y-4">
        {/* filters */}
        <div className="theme-card p-3 flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or topic…"
            className="flex-1 min-w-[200px] rounded-xl bg-[var(--bg-main)] border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-heading)] outline-none focus:border-[var(--primary)]"
          />
          {subjects.length > 0 && (
            <div className="flex gap-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSubjectFilter("ALL")}
                className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                  subjectFilter === "ALL"
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                }`}
              >
                All subjects
              </button>
              {subjects.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubjectFilter(s)}
                  className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                    subjectFilter === s
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="theme-card p-4 h-32 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="theme-card p-4 border border-rose-500/30">
            <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
              Could not load your materials
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1 break-words">{error}</div>
            <button
              type="button"
              onClick={load}
              className="mt-2 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="theme-card p-10 text-center">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="text-sm font-bold text-[var(--text-heading)]">Nothing published yet</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
              When your teacher publishes a worksheet, notes or practice questions for{" "}
              {studentClass ? `Class ${String(studentClass).replace(/^Class\s*/i, "")}` : "your class"}
              , it will appear here.
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => {
              const badge = KIND_BADGE[item.outputKind] || KIND_BADGE.document;
              const pack = PACK_DISPLAY[item.subjectPack] || PACK_DISPLAY.GENERAL;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOpenId(item.id)}
                  className="theme-card p-4 text-left flex flex-col gap-2 hover:border-[var(--primary)]/40 hover:-translate-y-0.5 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${badge.tone}`}
                    >
                      <i className={badge.icon} />
                      {badge.label}
                    </span>
                    <span className="text-lg leading-none">{pack.icon}</span>
                  </div>

                  <h3 className="text-xs font-bold text-[var(--text-heading)] leading-snug line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-[10px] text-[var(--text-muted)] line-clamp-1">{item.topic}</p>

                  <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-[var(--border)]">
                    <span className="text-[9px] text-[var(--text-muted)]">{item.subject}</span>
                    {item.publishedAt && (
                      <span className="text-[9px] text-[var(--text-muted)]">
                        {new Date(item.publishedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* full-screen reader */}
      {open && (
        <div className="fixed inset-0 z-50 bg-[var(--bg-main)] overflow-y-auto">
          <div className="sticky top-0 z-10 bg-[var(--bg-card)] border-b border-[var(--border)] px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setOpenId(null)}
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40"
            >
              ← Back
            </button>
            <div className="min-w-0 mr-auto">
              <div className="text-xs font-bold text-[var(--text-heading)] truncate">{open.title}</div>
              <div className="text-[10px] text-[var(--text-muted)]">
                {open.subject} · {OUTPUT_KIND_LABEL[open.outputKind] || open.outputKind}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsFullWidth((v) => !v)}
              className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition ${
                isFullWidth
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40"
              }`}
            >
              {isFullWidth ? "↙ Standard View" : "⛶ Full View"}
            </button>
            <button
              type="button"
              onClick={() =>
                printOutput(open.outputKind, open.payload, {
                  skillLabel: KIND_BADGE[open.outputKind]?.label || "Material",
                  subject: open.subject,
                  className: open.className,
                  section: open.section,
                  topic: open.topic,
                })
              }
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40"
            >
              ⤓ Print
            </button>
          </div>

          <div className={`mx-auto w-full transition-all duration-300 p-4 sm:p-6 lg:p-8 ${isFullWidth ? "max-w-[96vw]" : "max-w-4xl"}`}>
            {/* No onEdit — students read, they never edit. */}
            <OutputRenderer outputKind={open.outputKind} payload={open.payload} />
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
