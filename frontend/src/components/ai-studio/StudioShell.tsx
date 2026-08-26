"use client";

// AI Content Studio — the three-pane workspace shared by the hub page and
// every /teacher/ai-studio/[group] page.
//
//   ┌ SkillPalette ─┬ Context + Composer ─┬ Output ────────┐
//   │ / to filter   │ class · subject ·   │ render, edit,  │
//   │ grouped list  │ topic · pack chip   │ save, print,   │
//   │               │ skill-specific入力  │ push, publish  │
//   └───────────────┴─────────────────────┴────────────────┘
//
// Skills, their enabled state and their class ranges come from
// GET /api/ai-studio/skills so superadmin changes land without a redeploy.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { API_URL, apiFetch } from "@/lib/api";
import {
  STUDIO_GROUPS,
  PACK_DISPLAY,
  PUSH_TARGET_LABEL,
  OUTPUT_KIND_LABEL,
  GROUP_SHORT,
  subjectToPack,
  skillBlockedReason,
  gradeFromClassName,
  type StudioSkill,
  type SkillGroup,
  type SubjectPack,
  type PushTarget,
} from "@/lib/aiSkills";
import { OutputRenderer, OutputSkeleton, type EditFn } from "./renderers";
import { printOutput } from "./printable";

interface ClassRoom {
  id: string;
  className: string;
  section?: string;
  subject?: string;
}

interface GenerationResult {
  skillKey: string;
  outputKind: any;
  subjectPack: SubjectPack;
  subject: string;
  className: string;
  section: string | null;
  topic: string;
  language: string;
  payload: any;
}

const REFINEMENTS = [
  { label: "Make it easier", instruction: "Simplify the language and reduce the difficulty by one level. Keep the same structure." },
  { label: "Make it harder", instruction: "Raise the difficulty by one level and add more demanding application items." },
  { label: "More examples", instruction: "Add more worked examples and concrete illustrations throughout." },
  { label: "Shorter", instruction: "Cut this down to about two-thirds of its current length, keeping only the strongest content." },
  { label: "Translate to Tamil", instruction: "Rewrite all student-facing content in natural classroom Tamil, keeping technical terms in English in brackets." },
];

export default function StudioShell({ initialGroup }: { initialGroup?: SkillGroup }) {
  const { data: session } = useSession();
  const user = session?.user as any;
  const schoolId = user?.schoolId;
  const teacherId = user?.id;
  const sessionSubject: string | undefined = user?.subject;

  // ── skill catalog ────────────────────────────────────────────────────────
  const [skills, setSkills] = useState<StudioSkill[]>([]);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // ── selection + context ──────────────────────────────────────────────────
  const [activeGroup, setActiveGroup] = useState<SkillGroup | "ALL">(initialGroup || "ALL");
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");
  const [subjectOptions, setSubjectOptions] = useState<{ id: string; name: string }[]>([]);
  const [unitOptions, setUnitOptions] = useState<{ id: string; name: string }[]>([]);
  const [unit, setUnit] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState<"english" | "tamil">("english");
  const [extras, setExtras] = useState<Record<string, string>>({});

  const [packOverride, setPackOverride] = useState<SubjectPack | null>(null);
  const [packMenuOpen, setPackMenuOpen] = useState(false);

  // ── generation ───────────────────────────────────────────────────────────
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  /** Output pane expanded to the full viewport for reading long content. */
  const [fullscreen, setFullscreen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const selectedSkill = useMemo(
    () => skills.find((s) => s.key === selectedKey) || null,
    [skills, selectedKey]
  );

  const activePack: SubjectPack = packOverride || subjectToPack(subject || sessionSubject);

  // ── load catalog ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/api/ai-studio/skills");
        const json = await res.json();
        if (cancelled) return;
        if (!json.success) throw new Error(json.error || "Could not load the skill catalog");
        setSkills(json.data.skills || []);
        setAiEnabled(json.data.aiEnabled !== false);
      } catch (err) {
        // A network-level failure means the API is unreachable (server down,
        // wrong NEXT_PUBLIC_API_URL). Teachers should not be shown "TypeError:
        // Failed to fetch" — say what is wrong and what to do.
        if (cancelled) return;
        const offline = err instanceof TypeError;
        setCatalogError(
          offline
            ? "Can't reach the server. Check that the backend is running, then reload."
            : String(err instanceof Error ? err.message : err)
        );
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── load the teacher's classrooms ────────────────────────────────────────
  useEffect(() => {
    if (!schoolId) return;
    let cancelled = false;
    (async () => {
      try {
        let url = `${API_URL}/api/classes?schoolId=${schoolId}`;
        if (teacherId) url += `&teacherId=${teacherId}`;
        let res = await fetch(url);
        let json = await res.json();
        let rooms: ClassRoom[] = json?.success && Array.isArray(json.data) ? json.data : [];
        // Same fallback the other teacher pages use when the teacher-scoped
        // lookup comes back empty.
        if (rooms.length === 0) {
          res = await fetch(`${API_URL}/api/classes?schoolId=${schoolId}`);
          json = await res.json();
          rooms = json?.success && Array.isArray(json.data) ? json.data : [];
        }
        if (cancelled) return;
        setClasses(rooms);
        if (rooms.length > 0) {
          const first = rooms[0];
          setClassName(first.className?.startsWith("Class") ? first.className : `Class ${first.className}`);
          setSection(first.section || "");
          if (first.subject) setSubject(first.subject);
        } else if (sessionSubject) {
          setSubject(sessionSubject);
        }
      } catch {
        /* classroom list is a convenience; the teacher can still type a topic */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [schoolId, teacherId, sessionSubject]);

  // ── central content: subjects for the chosen class, units for the subject ─
  useEffect(() => {
    const grade = gradeFromClassName(className);
    if (!grade) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/centralized-content/subjects?class=${grade}`);
        const json = await res.json();
        if (cancelled) return;
        const list = Array.isArray(json?.data)
          ? json.data.map((s: any) => ({ id: s.id, name: s.name || s.subjectName }))
          : [];
        setSubjectOptions(list);
      } catch {
        if (!cancelled) setSubjectOptions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [className]);

  useEffect(() => {
    const match = subjectOptions.find((s) => s.name === subject);
    if (!match) {
      setUnitOptions([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/centralized-content/subjects/${match.id}/units`);
        const json = await res.json();
        if (cancelled) return;
        setUnitOptions(
          Array.isArray(json?.data) ? json.data.map((u: any) => ({ id: u.id, name: u.name || u.title })) : []
        );
      } catch {
        if (!cancelled) setUnitOptions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [subject, subjectOptions]);

  // ── "/" focuses the palette, like the command sheet ──────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const editing =
        tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement)?.isContentEditable;
      if (e.key === "/" && !editing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setPackMenuOpen(false);
        setFullscreen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Reset per-skill inputs when the skill changes.
  useEffect(() => {
    if (!selectedSkill) return;
    const next: Record<string, string> = {};
    for (const input of selectedSkill.inputs) {
      next[input.key] = input.default !== undefined ? String(input.default) : "";
    }
    setExtras(next);
    setResult(null);
    setSavedId(null);
    setGenError(null);
  }, [selectedKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── filtered palette ─────────────────────────────────────────────────────
  const visibleSkills = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\//, "");
    return skills.filter((s) => {
      if (activeGroup !== "ALL" && s.group !== activeGroup) return false;
      if (!q) return true;
      return (
        s.command.toLowerCase().includes(q) ||
        s.label.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    });
  }, [skills, activeGroup, query]);

  const grouped = useMemo(() => {
    return STUDIO_GROUPS.map((g) => ({
      group: g,
      items: visibleSkills.filter((s) => s.group === g.key),
    })).filter((g) => g.items.length > 0);
  }, [visibleSkills]);

  const blockedReason = selectedSkill ? skillBlockedReason(selectedSkill, className) : null;

  // ── generate ─────────────────────────────────────────────────────────────
  const generate = useCallback(
    async (refineInstruction?: string) => {
      if (!selectedSkill) return;
      if (!topic.trim()) {
        Swal.fire("Add a topic", "Type the topic or chapter you're teaching.", "warning");
        return;
      }
      if (blockedReason) {
        Swal.fire("Not available", blockedReason, "info");
        return;
      }

      setGenerating(true);
      setGenError(null);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await apiFetch("/api/ai-studio/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            skillKey: selectedSkill.key,
            subject: subject || sessionSubject || "",
            subjectPack: activePack,
            className,
            section: section || null,
            unit: unit || undefined,
            topic: topic.trim(),
            language,
            extras,
            ...(refineInstruction && result
              ? { refineInstruction, refineOf: result.payload }
              : {}),
          }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Generation failed");
        setResult(json.data);
        setSavedId(null);
        setEditMode(false);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setGenError(String(err?.message || err));
      } finally {
        setGenerating(false);
        abortRef.current = null;
      }
    },
    [selectedSkill, topic, blockedReason, subject, sessionSubject, activePack, className, section, unit, language, extras, result]
  );

  const cancelGeneration = () => {
    abortRef.current?.abort();
    setGenerating(false);
  };

  // ── inline editing writes back into the payload ──────────────────────────
  const handleEdit: EditFn = useCallback((path, value) => {
    setResult((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      let cursor: any = next.payload;
      for (let i = 0; i < path.length - 1; i++) cursor = cursor?.[path[i]];
      if (cursor) cursor[path[path.length - 1]] = value;
      return next;
    });
    setSavedId(null); // edited after saving — needs saving again
  }, []);

  // ── save / print / push / publish ────────────────────────────────────────
  // Returns the new id so ensureSaved() can chain — reading savedId straight
  // after calling save() would see the stale value.
  const save = async (): Promise<string | null> => {
    if (!result || !selectedSkill) return null;
    setSaving(true);
    try {
      const res = await apiFetch("/api/ai-studio/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillKey: result.skillKey,
          outputKind: result.outputKind,
          subjectPack: result.subjectPack,
          subject: result.subject,
          className: result.className,
          section: result.section,
          topic: result.topic,
          title: result.payload?.title || result.topic,
          language: result.language,
          payload: result.payload,
          schoolId,
          teacherId,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSavedId(json.data.id);
      Swal.fire({ icon: "success", title: "Saved to My AI Content", timer: 1400, showConfirmButton: false });
      return json.data.id as string;
    } catch (err) {
      Swal.fire("Could not save", String(err), "error");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const ensureSaved = async (): Promise<string | null> => savedId || (await save());

  const print = () => {
    if (!result || !selectedSkill) return;
    const ok = printOutput(result.outputKind, result.payload, {
      skillLabel: selectedSkill.label,
      subject: result.subject,
      className: result.className,
      section: result.section,
      topic: result.topic,
      teacherName: user?.name,
    });
    if (!ok) {
      Swal.fire(
        "Popup blocked",
        "Allow popups for this site, then press Print again. Choose “Save as PDF” in the print dialog.",
        "warning"
      );
    }
  };

  const push = async (target: PushTarget) => {
    if (!result) return;
    const id = await ensureSaved();
    if (!id) {
      Swal.fire("Save first", "The content has to be saved before it can be sent on.", "info");
      return;
    }
    try {
      const res = await apiFetch(`/api/ai-studio/content/${id}/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      Swal.fire({
        icon: "success",
        title: `Sent to ${PUSH_TARGET_LABEL[target]}`,
        text: json.pushed ? `${json.pushed} item(s) added.` : undefined,
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire("Could not send", String(err), "error");
    }
  };

  const publish = async () => {
    if (!result) return;
    const id = await ensureSaved();
    if (!id) return;
    try {
      const res = await apiFetch(`/api/ai-studio/content/${id}/publish`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: true }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      Swal.fire({ icon: "success", title: "Published to students", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Could not publish", String(err), "error");
    }
  };

  // ── derived display bits ─────────────────────────────────────────────────
  const classOptions = useMemo(() => {
    const list: string[] = [];
    for (const c of classes) {
      const name = c.className?.startsWith("Class") ? c.className : `Class ${c.className}`;
      if (name && !list.includes(name)) list.push(name);
    }
    if (list.length === 0) {
      for (let i = 1; i <= 12; i++) list.push(`Class ${i}`);
    }
    return list;
  }, [classes]);

  const sectionOptions = useMemo(() => {
    const list = classes
      .filter((c) => (c.className?.startsWith("Class") ? c.className : `Class ${c.className}`) === className)
      .map((c) => c.section)
      .filter((s): s is string => Boolean(s));
    return Array.from(new Set(list));
  }, [classes, className]);

  const pack = PACK_DISPLAY[activePack];

  if (!aiEnabled) {
    return (
      <div className="theme-card p-8 text-center">
        <div className="text-3xl mb-3">🚫</div>
        <h3 className="text-sm font-bold text-[var(--text-heading)]">AI features are turned off</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Your administrator has disabled AI features for this platform.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_340px_minmax(0,1fr)]">
      {/* ── Pane 1: skill palette ─────────────────────────────────────────── */}
      <aside className="theme-card p-3 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] flex flex-col">
        <div className="relative mb-2">
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Press / to search 20 skills"
            className="w-full rounded-xl bg-[var(--bg-main)] border border-[var(--border)] pl-8 pr-3 py-2 text-xs text-[var(--text-heading)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs">🔍</span>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-2 mb-1 -mx-1 px-1">
          <button
            type="button"
            onClick={() => setActiveGroup("ALL")}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
              activeGroup === "ALL"
                ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)]"
            }`}
          >
            All 20
          </button>
          {STUDIO_GROUPS.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => setActiveGroup(g.key)}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                activeGroup === g.key
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)]"
              }`}
            >
              {GROUP_SHORT[g.key]}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {catalogLoading && (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-11 rounded-xl bg-[var(--border)] animate-pulse" />
              ))}
            </div>
          )}

          {catalogError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3">
              <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mb-1">
                Skills unavailable
              </div>
              <div className="text-[10px] text-[var(--text-muted)] leading-relaxed">{catalogError}</div>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-2 text-[10px] font-bold px-2 py-1 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40"
              >
                Reload
              </button>
            </div>
          )}

          {!catalogLoading && !catalogError && grouped.length === 0 && (
            <div className="text-[11px] text-[var(--text-muted)] p-2">No skill matches “{query}”.</div>
          )}

          {grouped.map(({ group, items }) => (
            <div key={group.key}>
              <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] px-1 mb-1.5">
                {group.label}
              </div>
              <div className="space-y-1">
                {items.map((s) => {
                  const reason = skillBlockedReason(s, className);
                  const isSelected = s.key === selectedKey;
                  return (
                    <div key={s.key} className="relative group/skill">
                      <button
                        type="button"
                        onClick={() => setSelectedKey(s.key)}
                        className={`w-full text-left rounded-xl px-2 py-2 border transition flex items-start gap-2 ${
                          isSelected
                            ? "border-[var(--primary)] bg-[var(--primary)]/10"
                            : "border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-main)]"
                        } ${reason ? "opacity-50" : ""}`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-white text-[13px] ${s.accent} ${
                            reason ? "grayscale" : ""
                          }`}
                        >
                          <i className={s.icon} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block text-[11px] font-bold font-mono truncate ${
                              isSelected ? "text-[var(--primary)]" : "text-[var(--text-heading)]"
                            }`}
                          >
                            {s.command}
                          </span>
                          <span className="block text-[10px] text-[var(--text-muted)] leading-snug truncate">
                            {reason ? (
                              <span className="text-amber-600 dark:text-amber-400">🔒 {reason}</span>
                            ) : (
                              s.label
                            )}
                          </span>
                        </span>
                      </button>

                      {/* Hover card — the full brief for this skill. Pointer-events
                          off so it never blocks the click underneath. */}
                      <div className="pointer-events-none absolute left-full top-0 ml-2 z-40 w-64 opacity-0 translate-x-1 group-hover/skill:opacity-100 group-hover/skill:translate-x-0 transition-all duration-150 hidden lg:block">
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-xl p-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-white text-[11px] ${s.accent}`}>
                              <i className={s.icon} />
                            </span>
                            <div className="min-w-0">
                              <div className="text-[11px] font-bold text-[var(--text-heading)] leading-tight">
                                {s.label}
                              </div>
                              <div className="text-[9px] font-mono text-[var(--primary)]">{s.command}</div>
                            </div>
                          </div>

                          <p className="text-[10px] text-[var(--text-muted)] leading-relaxed mb-2">
                            {s.description}
                          </p>

                          <div className="rounded-lg bg-[var(--bg-main)] border border-[var(--border)] px-2 py-1.5 mb-2">
                            <div className="text-[8px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-0.5">
                              You get
                            </div>
                            <div className="text-[10px] text-[var(--text-heading)] leading-relaxed">
                              {s.preview}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-[var(--border)] text-[var(--text-muted)]">
                              {OUTPUT_KIND_LABEL[s.outputKind] || s.outputKind}
                            </span>
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-[var(--border)] text-[var(--text-muted)]">
                              Class {s.classMin}–{s.classMax}
                            </span>
                            {s.pushTargets.map((t) => (
                              <span
                                key={t}
                                className="text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)]"
                              >
                                ➜ {PUSH_TARGET_LABEL[t]}
                              </span>
                            ))}
                          </div>

                          {reason && (
                            <div className="mt-2 pt-2 border-t border-[var(--border)] text-[9px] font-bold text-amber-600 dark:text-amber-400">
                              🔒 {reason}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Pane 2: context + composer ────────────────────────────────────── */}
      <section className="theme-card p-4 xl:sticky xl:top-4 xl:self-start space-y-3">
        {!selectedSkill ? (
          <div className="text-center py-10">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="text-sm font-bold text-[var(--text-heading)]">Pick a skill to start</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
              20 AI content skills, each one tuned to how your subject is actually taught.
              <br />
              Press <kbd className="px-1 py-0.5 rounded bg-[var(--bg-main)] border border-[var(--border)] text-[10px]">/</kbd> to search.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2 pb-3 border-b border-[var(--border)]">
              <span className={`w-8 h-8 rounded-xl ${selectedSkill.accent} text-white flex items-center justify-center shrink-0`}>
                <i className={selectedSkill.icon} />
              </span>
              <div className="min-w-0">
                <div className="text-xs font-bold font-mono text-[var(--primary)]">{selectedSkill.command}</div>
                <div className="text-[11px] text-[var(--text-muted)] leading-snug">{selectedSkill.description}</div>
              </div>
            </div>

            {/* class · section · subject · unit */}
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">Class</span>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-[var(--bg-card)] border border-[var(--border)] px-2.5 py-2 text-xs text-[var(--text-heading)] outline-none focus:border-[var(--primary)]"
                >
                  {classOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">Section</span>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-[var(--bg-card)] border border-[var(--border)] px-2.5 py-2 text-xs text-[var(--text-heading)] outline-none focus:border-[var(--primary)]"
                >
                  <option value="">All</option>
                  {sectionOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">Subject</span>
              {subjectOptions.length > 0 ? (
                <select
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setPackOverride(null); // re-detect the pack from the new subject
                    setUnit("");
                  }}
                  className="mt-1 w-full rounded-xl bg-[var(--bg-card)] border border-[var(--border)] px-2.5 py-2 text-xs text-[var(--text-heading)] outline-none focus:border-[var(--primary)]"
                >
                  <option value="">Select subject</option>
                  {subjectOptions.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setPackOverride(null);
                  }}
                  placeholder="e.g. Mathematics"
                  className="mt-1 w-full rounded-xl bg-[var(--bg-card)] border border-[var(--border)] px-2.5 py-2 text-xs text-[var(--text-heading)] outline-none focus:border-[var(--primary)]"
                />
              )}
            </label>

            {unitOptions.length > 0 && (
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">Unit</span>
                <select
                  value={unit}
                  onChange={(e) => {
                    setUnit(e.target.value);
                    if (e.target.value && !topic) setTopic(e.target.value);
                  }}
                  className="mt-1 w-full rounded-xl bg-[var(--bg-card)] border border-[var(--border)] px-2.5 py-2 text-xs text-[var(--text-heading)] outline-none focus:border-[var(--primary)]"
                >
                  <option value="">Not linked</option>
                  {unitOptions.map((u) => (
                    <option key={u.id} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </label>
            )}

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">Topic / chapter</span>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Quadratic Equations"
                className="mt-1 w-full rounded-xl bg-[var(--bg-card)] border border-[var(--border)] px-2.5 py-2 text-xs text-[var(--text-heading)] outline-none focus:border-[var(--primary)]"
              />
            </label>

            {/* subject pack chip — the adaptation the teacher can see and override */}
            <div className="relative">
              <div className="flex items-center gap-2 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-2.5 py-2">
                <span className="text-base leading-none">{pack.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold text-[var(--primary)]">{pack.label} method</div>
                  <div className="text-[10px] text-[var(--text-muted)] leading-snug truncate">
                    {packOverride ? "Chosen by you" : "Detected from your subject"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPackMenuOpen((v) => !v)}
                  className="text-[10px] font-bold text-[var(--primary)] hover:underline shrink-0"
                >
                  change
                </button>
              </div>

              {packMenuOpen && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-lg p-1">
                  {(Object.keys(PACK_DISPLAY) as SubjectPack[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        setPackOverride(k);
                        setPackMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[11px] transition ${
                        k === activePack
                          ? "bg-[var(--primary)]/10 text-[var(--primary)] font-bold"
                          : "text-[var(--text-heading)] hover:bg-[var(--bg-main)]"
                      }`}
                    >
                      <span>{PACK_DISPLAY[k].icon}</span>
                      {PACK_DISPLAY[k].label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* skill-specific inputs */}
            {selectedSkill.inputs.length > 0 && (
              <div className="space-y-2 pt-1">
                {selectedSkill.inputs.map((input) => (
                  <label key={input.key} className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                      {input.label}
                    </span>
                    {input.type === "select" ? (
                      <select
                        value={extras[input.key] ?? ""}
                        onChange={(e) => setExtras((p) => ({ ...p, [input.key]: e.target.value }))}
                        className="mt-1 w-full rounded-xl bg-[var(--bg-card)] border border-[var(--border)] px-2.5 py-2 text-xs text-[var(--text-heading)] outline-none focus:border-[var(--primary)]"
                      >
                        {(input.options || []).map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    ) : input.type === "textarea" ? (
                      <textarea
                        value={extras[input.key] ?? ""}
                        onChange={(e) => setExtras((p) => ({ ...p, [input.key]: e.target.value }))}
                        placeholder={input.placeholder}
                        rows={4}
                        className="mt-1 w-full rounded-xl bg-[var(--bg-card)] border border-[var(--border)] px-2.5 py-2 text-xs text-[var(--text-heading)] outline-none focus:border-[var(--primary)] resize-y"
                      />
                    ) : (
                      <input
                        type={input.type}
                        value={extras[input.key] ?? ""}
                        onChange={(e) => setExtras((p) => ({ ...p, [input.key]: e.target.value }))}
                        placeholder={input.placeholder}
                        className="mt-1 w-full rounded-xl bg-[var(--bg-card)] border border-[var(--border)] px-2.5 py-2 text-xs text-[var(--text-heading)] outline-none focus:border-[var(--primary)]"
                      />
                    )}
                    {input.hint && (
                      <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block">{input.hint}</span>
                    )}
                  </label>
                ))}
              </div>
            )}

            {/* language */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-main)] border border-[var(--border)]">
              {(["english", "tamil"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  className={`flex-1 text-[11px] font-bold py-1.5 rounded-lg transition ${
                    language === l ? "bg-[var(--primary)] text-white" : "text-[var(--text-muted)]"
                  }`}
                >
                  {l === "english" ? "English" : "தமிழ்"}
                </button>
              ))}
            </div>

            {/* what you'll get — updates live with the pack */}
            <div className="rounded-xl bg-[var(--bg-main)] border border-[var(--border)] px-2.5 py-2">
              <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">
                What you'll get
              </div>
              <div className="text-[11px] text-[var(--text-heading)] leading-relaxed">
                {selectedSkill.preview}, written the {pack.label} way.
              </div>
            </div>

            {blockedReason && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-2 text-[11px] text-amber-700 dark:text-amber-300">
                🔒 {blockedReason}
              </div>
            )}

            {generating ? (
              <button
                type="button"
                onClick={cancelGeneration}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] py-2.5 text-xs font-bold hover:text-rose-500 hover:border-rose-500/40 transition"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => generate()}
                disabled={Boolean(blockedReason)}
                className="w-full rounded-xl bg-[var(--primary)] text-white py-2.5 text-xs font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ✨ Generate
              </button>
            )}
          </>
        )}
      </section>

      {/* ── Pane 3: output ────────────────────────────────────────────────── */}
      {/* Expanding swaps this pane's grid slot for a fixed full-viewport panel.
          Same element and same state, so nothing re-renders or is lost. */}
      <section
        className={
          fullscreen
            ? "fixed inset-0 z-50 overflow-y-auto bg-[var(--bg-main)] p-4 sm:p-6 lg:p-10"
            : "theme-card p-4 xl:col-span-1 lg:col-span-2 xl:col-start-3 min-h-[320px]"
        }
      >
        <div className={fullscreen ? "mx-auto w-full max-w-5xl" : "contents"}>
        {generating && selectedSkill && (
          <div>
            <div className="flex items-center gap-2 mb-4 text-[11px] font-bold text-[var(--primary)]">
              <span className="w-3 h-3 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
              Writing your {selectedSkill.label.toLowerCase()} the {pack.label} way…
            </div>
            <OutputSkeleton outputKind={selectedSkill.outputKind} />
          </div>
        )}

        {!generating && genError && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
            <div className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">Generation failed</div>
            <div className="text-[11px] text-[var(--text-muted)] leading-relaxed break-words">{genError}</div>
            <button
              type="button"
              onClick={() => generate()}
              className="mt-3 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-heading)] hover:border-[var(--primary)]/40"
            >
              Try again
            </button>
          </div>
        )}

        {!generating && !genError && !result && (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="text-3xl mb-3">📄</div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-[280px]">
              Your generated content appears here. You can edit it inline, print it, save it to your library,
              or send it straight into the Question Bank, Homework or Smart Class.
            </p>
          </div>
        )}

        {!generating && result && selectedSkill && (
          <>
            {/* action bar */}
            <div className="flex flex-wrap items-center gap-1.5 mb-4 pb-3 border-b border-[var(--border)]">
              <button
                type="button"
                onClick={() => generate()}
                className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40 transition"
              >
                ⟳ Regenerate
              </button>
              <button
                type="button"
                onClick={() => setEditMode((v) => !v)}
                className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition ${
                  editMode
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40"
                }`}
              >
                {editMode ? "✓ Editing" : "✎ Edit"}
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving || Boolean(savedId)}
                className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-40 transition"
              >
                {savedId ? "✓ Saved" : saving ? "Saving…" : "💾 Save"}
              </button>
              <button
                type="button"
                onClick={print}
                className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40 transition"
              >
                ⤓ Print / PDF
              </button>
              {selectedSkill.pushTargets.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => push(t)}
                  className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40 transition"
                >
                  ➜ {PUSH_TARGET_LABEL[t]}
                </button>
              ))}
              <button
                type="button"
                onClick={publish}
                className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-emerald-500 hover:border-emerald-500/40 transition"
              >
                ⇧ Publish
              </button>

              <button
                type="button"
                onClick={() => setFullscreen((v) => !v)}
                title={fullscreen ? "Back to the studio (Esc)" : "Read it full width"}
                className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition ml-auto ${
                  fullscreen
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40"
                }`}
              >
                {fullscreen ? "✕ Close full view" : "⛶ Full view"}
              </button>
            </div>

            {editMode && (
              <div className="mb-3 rounded-lg bg-[var(--primary)]/5 border border-[var(--primary)]/20 px-2.5 py-1.5 text-[10px] text-[var(--primary)]">
                Click any text to edit it. Changes are kept when you save.
              </div>
            )}

            <OutputRenderer
              outputKind={result.outputKind}
              payload={result.payload}
              onEdit={editMode ? handleEdit : undefined}
            />

            {/* refine bar */}
            <div className="mt-5 pt-4 border-t border-[var(--border)]">
              <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                Not quite right?
              </div>
              <div className="flex flex-wrap gap-1.5">
                {REFINEMENTS.map((r) => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => generate(r.instruction)}
                    className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40 transition"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        </div>
      </section>
    </div>
  );
}
