"use client";

// Student AI Studio — view published AI-generated content by subject and unit title.
//
// Fetches published content scoped to the student's class and section via
// GET /api/ai-studio/published.
// Organizes content hierarchy: Subject -> Unit Title -> Content Cards.

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
  unit?: string | null;
  topic: string;
  title: string;
  language: string;
  payload: any;
  publishedAt: string | null;
}

// Student-friendly badges for content types
const KIND_BADGE: Record<string, { label: string; icon: string; tone: string }> = {
  worksheet: { label: "Worksheet", icon: "fi fi-rr-file-edit", tone: "text-purple-600 dark:text-purple-400 border-purple-500/30 bg-purple-500/10" },
  questionSet: { label: "Practice Questions", icon: "fi fi-rr-list-check", tone: "text-cyan-600 dark:text-cyan-400 border-cyan-500/30 bg-cyan-500/10" },
  document: { label: "Study Notes", icon: "fi fi-rr-document", tone: "text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10" },
  cardList: { label: "Key Concepts", icon: "fi fi-rr-layer-group", tone: "text-teal-600 dark:text-teal-400 border-teal-500/30 bg-teal-500/10" },
  matrix: { label: "Learning Guide", icon: "fi fi-rr-grid", tone: "text-indigo-600 dark:text-indigo-400 border-indigo-500/30 bg-indigo-500/10" },
  slides: { label: "Presentation", icon: "fi fi-rr-presentation", tone: "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  infographic: { label: "Visual Graphic", icon: "fi fi-rr-chart-pie", tone: "text-sky-600 dark:text-sky-400 border-sky-500/30 bg-sky-500/10" },
};

export default function StudentAIStudioPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const studentClass: string | undefined = user?.class;
  const studentSection: string | null = user?.section || null;
  const schoolId: string | undefined = user?.schoolId;

  const [items, setItems] = useState<PublishedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedUnit, setSelectedUnit] = useState<string>("ALL");
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
      if (!json.success) throw new Error(json.error || "Could not load AI Studio materials");
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

  // Handle ESC key to close full view or reader modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullWidth) {
          setIsFullWidth(false);
        } else if (openId) {
          setOpenId(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullWidth, openId]);

  // List of all available subjects
  const subjects = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.subject && item.subject.trim()) {
        set.add(item.subject.trim());
      }
    });
    return Array.from(set).sort();
  }, [items]);

  // Group items by Subject -> Unit Title
  const groupedContent = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result: Record<string, Record<string, PublishedItem[]>> = {};

    items.forEach((item) => {
      const subj = item.subject?.trim() || "General Subject";
      if (selectedSubject !== "ALL" && subj !== selectedSubject) return;

      const unitTitle =
        item.unit?.trim() ||
        item.payload?.unit?.trim() ||
        (item.topic ? `Topic: ${item.topic}` : "General Unit");

      if (selectedUnit !== "ALL" && unitTitle !== selectedUnit) return;

      if (
        q &&
        !item.title.toLowerCase().includes(q) &&
        !item.topic.toLowerCase().includes(q) &&
        !subj.toLowerCase().includes(q) &&
        !unitTitle.toLowerCase().includes(q)
      ) {
        return;
      }

      if (!result[subj]) result[subj] = {};
      if (!result[subj][unitTitle]) result[subj][unitTitle] = [];
      result[subj][unitTitle].push(item);
    });

    return result;
  }, [items, selectedSubject, selectedUnit, query]);

  // List of units for selected subject
  const availableUnits = useMemo(() => {
    const unitsSet = new Set<string>();
    items.forEach((item) => {
      const subj = item.subject?.trim() || "General Subject";
      if (selectedSubject !== "ALL" && subj !== selectedSubject) return;
      const unitTitle =
        item.unit?.trim() ||
        item.payload?.unit?.trim() ||
        (item.topic ? `Topic: ${item.topic}` : "General Unit");
      unitsSet.add(unitTitle);
    });
    return Array.from(unitsSet).sort();
  }, [items, selectedSubject]);

  const open = items.find((i) => i.id === openId) || null;

  return (
    <PortalLayout
      title="AI Studio"
      subtitle="Access published study materials, units, worksheets & practice tasks for all your subjects"
    >
      <div className="space-y-6">
        {/* Controls & Search Header */}
        <div className="theme-card p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search materials by title, unit, topic or subject…"
                className="w-full rounded-xl bg-[var(--bg-main)] border border-[var(--border)] pl-9 pr-3 py-2 text-xs text-[var(--text-heading)] outline-none focus:border-[var(--primary)] transition"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">🔍</span>
            </div>

            {selectedSubject !== "ALL" && availableUnits.length > 0 && (
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="rounded-xl bg-[var(--bg-main)] border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-heading)] outline-none focus:border-[var(--primary)]"
              >
                <option value="ALL">All Units</option>
                {availableUnits.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Subjects Navigation Pills */}
          {subjects.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-[var(--border)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] shrink-0 mr-1">
                Subjects:
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedSubject("ALL");
                  setSelectedUnit("ALL");
                }}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                  selectedSubject === "ALL"
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-sm"
                    : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                }`}
              >
                All Subjects ({items.length})
              </button>

              {subjects.map((subj) => {
                const count = items.filter((i) => i.subject?.trim() === subj).length;
                const isSelected = selectedSubject === subj;
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => {
                      setSelectedSubject(subj);
                      setSelectedUnit("ALL");
                    }}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-sm"
                        : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                    }`}
                  >
                    <span>📘 {subj}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? "bg-white/20 text-white" : "bg-[var(--border)] text-[var(--text-muted)]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="theme-card p-6 space-y-4 animate-pulse">
                <div className="h-6 w-48 bg-[var(--border)] rounded-lg" />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-32 bg-[var(--border)] rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="theme-card p-6 border border-rose-500/30">
            <div className="text-sm font-bold text-rose-600 dark:text-rose-400">
              Could not load AI Studio materials
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1">{error}</div>
            <button
              type="button"
              onClick={load}
              className="mt-3 text-xs font-bold px-3 py-1.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && Object.keys(groupedContent).length === 0 && (
          <div className="theme-card p-12 text-center">
            <div className="text-4xl mb-3">✨</div>
            <h3 className="text-base font-bold text-[var(--text-heading)]">No Published AI Studio Content Yet</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md mx-auto leading-relaxed">
              When your subject teachers publish generated unit lessons, worksheets, notes or practice questions for{" "}
              {studentClass ? `Class ${String(studentClass).replace(/^Class\s*/i, "")}` : "your class"}
              , they will be organized under each subject and unit title right here.
            </p>
          </div>
        )}

        {/* Main Hierarchy: Subject Sections -> Units -> Content Cards */}
        {!loading &&
          !error &&
          Object.entries(groupedContent).map(([subjectName, unitsMap]) => (
            <div key={subjectName} className="space-y-4">
              {/* Subject Header */}
              <div className="flex items-center gap-2 pb-2 border-b-2 border-[var(--primary)]/30">
                <span className="text-xl">📚</span>
                <h2 className="text-base font-extrabold text-[var(--text-heading)] tracking-tight">
                  {subjectName}
                </h2>
                <span className="text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 border border-[var(--primary)]/20 px-2 py-0.5 rounded-full ml-auto">
                  {Object.values(unitsMap).reduce((acc, list) => acc + list.length, 0)} Materials
                </span>
              </div>

              {/* Units Under This Subject */}
              <div className="space-y-6">
                {Object.entries(unitsMap).map(([unitTitle, contentList]) => (
                  <div
                    key={unitTitle}
                    className="theme-card p-4 sm:p-5 border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all shadow-sm"
                  >
                    {/* Unit Header Title */}
                    <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-[var(--border)]">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs font-black">
                          📌
                        </span>
                        <div>
                          <h3 className="text-xs font-bold text-[var(--text-heading)] uppercase tracking-wide">
                            {unitTitle}
                          </h3>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {contentList.length} interactive item{contentList.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--bg-main)] border border-[var(--border)] px-2 py-1 rounded-lg">
                        {subjectName}
                      </span>
                    </div>

                    {/* Content Cards Grid */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {contentList.map((item) => {
                        const badge = KIND_BADGE[item.outputKind] || KIND_BADGE.document;
                        const pack = PACK_DISPLAY[item.subjectPack] || PACK_DISPLAY.GENERAL;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setOpenId(item.id)}
                            className="group/card text-left p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--bg-card)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${badge.tone}`}
                                >
                                  <i className={badge.icon} />
                                  {badge.label}
                                </span>
                                <span className="text-base leading-none" title={pack.label}>
                                  {pack.icon}
                                </span>
                              </div>

                              <h4 className="text-xs font-bold text-[var(--text-heading)] group-hover/card:text-[var(--primary)] transition line-clamp-2 leading-snug">
                                {item.title}
                              </h4>

                              <p className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                                {item.topic}
                              </p>
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-[var(--border)] text-[9px] text-[var(--text-muted)]">
                              <span className="font-semibold text-[var(--primary)] group-hover/card:underline flex items-center gap-0.5">
                                View Content →
                              </span>
                              {item.publishedAt && (
                                <span>
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
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Full-Screen Content Reader Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setOpenId(null)}
        >
          <div
            className={`theme-card w-full my-4 p-5 sm:p-6 transition-all duration-300 shadow-2xl ${
              isFullWidth ? "max-w-[96vw] xl:max-w-[92vw]" : "max-w-4xl"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header bar */}
            <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-[var(--border)]">
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40 transition"
              >
                ← Back to AI Studio
              </button>

              <div className="min-w-0 mr-auto">
                <div className="text-xs font-bold text-[var(--text-heading)] truncate">{open.title}</div>
                <div className="text-[10px] text-[var(--text-muted)]">
                  {open.subject} · {open.unit || "Unit Content"} · {OUTPUT_KIND_LABEL[open.outputKind] || open.outputKind}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsFullWidth((v) => !v)}
                  title={isFullWidth ? "Standard view width" : "Expand to maximum width view"}
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
                      skillLabel: KIND_BADGE[open.outputKind]?.label || "AI Studio Content",
                      subject: open.subject,
                      className: open.className,
                      section: open.section,
                      topic: open.topic,
                    })
                  }
                  className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40 transition"
                >
                  ⤓ Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setOpenId(null)}
                  className="text-[11px] font-bold px-2 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-rose-500 hover:border-rose-500/40 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className={isFullWidth ? "w-full overflow-x-auto" : ""}>
              <OutputRenderer outputKind={open.outputKind} payload={open.payload} />
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
