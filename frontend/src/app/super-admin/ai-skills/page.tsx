"use client";

// AI Skill Control — the superadmin control plane for the teacher AI Content
// Studio. Every one of the 20 skills can be switched off, restricted to a class
// range, bound to a model and token budget, and have its prompt scaffold and
// per-subject structure retuned without a deploy.
//
// Backend: /api/superadmin/ai-skills (superadmin.aiSkills.routes.ts)

import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import PortalLayout from "@/components/PortalLayout";
import { apiFetch } from "@/lib/api";

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"];
const CLASSES = Array.from({ length: 12 }, (_, i) => i + 1);

interface PackDirective {
  label: string;
  icon: string;
  value: string;
  default: string;
  isModified: boolean;
}

interface AdminSkill {
  key: string;
  command: string;
  label: string;
  description: string;
  group: string;
  outputKind: string;
  icon: string;
  accent: string;
  preview: string;
  isEnabled: boolean;
  classMin: number;
  classMax: number;
  model: string;
  maxTokens: number;
  basePrompt: string;
  defaultBasePrompt: string;
  isPromptModified: boolean;
  packDirectives: Record<string, PackDirective>;
  defaults: { model: string; maxTokens: number; classMin: number; classMax: number };
  updatedBy?: string;
  updatedAt?: string;
}

interface GroupMeta {
  key: string;
  slug: string;
  label: string;
  icon: string;
  blurb: string;
}

export default function AISkillControlPage() {
  const [skills, setSkills] = useState<AdminSkill[]>([]);
  const [groups, setGroups] = useState<GroupMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // drawer state
  const [editKey, setEditKey] = useState<string | null>(null);
  const [draftPrompt, setDraftPrompt] = useState("");
  const [draftPacks, setDraftPacks] = useState<Record<string, string>>({});
  const [activePack, setActivePack] = useState<string>("MATHS");
  const [preview, setPreview] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);

  const editing = useMemo(() => skills.find((s) => s.key === editKey) || null, [skills, editKey]);

  const dirty = useMemo(() => {
    if (!editing) return false;
    if (draftPrompt !== editing.basePrompt) return true;
    return Object.entries(draftPacks).some(([k, v]) => v !== editing.packDirectives[k]?.value);
  }, [editing, draftPrompt, draftPacks]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/superadmin/ai-skills");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Could not load AI skills");
      setSkills(json.data.skills || []);
      setGroups(json.data.groups || []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const applyUpdated = (updated: AdminSkill) =>
    setSkills((prev) => prev.map((s) => (s.key === updated.key ? updated : s)));

  const patch = async (key: string, body: Record<string, unknown>) => {
    setSavingKey(key);
    try {
      const res = await apiFetch(`/api/superadmin/ai-skills/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      applyUpdated(json.data);
      return json.data as AdminSkill;
    } catch (err) {
      Swal.fire("Could not save", String(err), "error");
      return null;
    } finally {
      setSavingKey(null);
    }
  };

  const bulk = async (keys: string[], isEnabled: boolean) => {
    try {
      const res = await apiFetch("/api/superadmin/ai-skills/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys, isEnabled }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSkills(json.data || []);
    } catch (err) {
      Swal.fire("Could not update", String(err), "error");
    }
  };

  const openDrawer = (skill: AdminSkill) => {
    setEditKey(skill.key);
    setDraftPrompt(skill.basePrompt);
    setDraftPacks(
      Object.entries(skill.packDirectives).reduce(
        (acc, [k, v]) => ({ ...acc, [k]: v.value }),
        {} as Record<string, string>
      )
    );
    setActivePack(Object.keys(skill.packDirectives)[0] || "MATHS");
    setPreview(null);
  };

  const closeDrawer = async () => {
    if (dirty) {
      const confirmed = await Swal.fire({
        icon: "warning",
        title: "Discard unsaved changes?",
        showCancelButton: true,
        confirmButtonText: "Discard",
        confirmButtonColor: "#e11d48",
      });
      if (!confirmed.isConfirmed) return;
    }
    setEditKey(null);
    setPreview(null);
  };

  const saveDrawer = async () => {
    if (!editing) return;
    const updated = await patch(editing.key, {
      basePrompt: draftPrompt,
      packDirectives: draftPacks,
    });
    if (updated) {
      setDraftPrompt(updated.basePrompt);
      setDraftPacks(
        Object.entries(updated.packDirectives).reduce(
          (acc, [k, v]) => ({ ...acc, [k]: v.value }),
          {} as Record<string, string>
        )
      );
      Swal.fire({ icon: "success", title: "Saved", timer: 1200, showConfirmButton: false });
    }
  };

  const resetSkill = async (skill: AdminSkill) => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: `Reset ${skill.command}?`,
      text: "Its prompt, subject directives, model, token budget and class range all go back to the shipped defaults.",
      showCancelButton: true,
      confirmButtonText: "Reset",
      confirmButtonColor: "#e11d48",
    });
    if (!confirmed.isConfirmed) return;
    try {
      const res = await apiFetch(`/api/superadmin/ai-skills/${skill.key}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      applyUpdated(json.data);
      if (editKey === skill.key) openDrawer(json.data);
    } catch (err) {
      Swal.fire("Could not reset", String(err), "error");
    }
  };

  const runPreview = async () => {
    if (!editing) return;
    setPreviewing(true);
    try {
      const res = await apiFetch(`/api/superadmin/ai-skills/${editing.key}/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pack: activePack,
          className: "Class 10",
          topic: "Sample Topic",
          basePrompt: draftPrompt,
          packDirective: draftPacks[activePack],
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setPreview(json.data.prompt);
    } catch (err) {
      Swal.fire("Preview failed", String(err), "error");
    } finally {
      setPreviewing(false);
    }
  };

  const byGroup = useMemo(
    () =>
      groups
        .map((g) => ({ group: g, items: skills.filter((s) => s.group === g.key) }))
        .filter((g) => g.items.length > 0),
    [groups, skills]
  );

  const enabledCount = skills.filter((s) => s.isEnabled).length;

  return (
    <PortalLayout
      title="AI Skill Control"
      subtitle="Govern the 20 teacher content-generation skills"
    >
      <div className="space-y-4">
        {/* summary + global actions */}
        <div className="theme-card p-4 flex flex-wrap items-center gap-3">
          <div className="mr-auto">
            <div className="text-sm font-bold text-[var(--text-heading)]">
              {enabledCount} of {skills.length} skills enabled
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Disabled skills disappear from the teacher palette and are refused by the API.
            </div>
          </div>
          <button
            type="button"
            onClick={() => bulk(skills.map((s) => s.key), true)}
            className="text-[11px] font-bold px-3 py-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-emerald-500 hover:border-emerald-500/40 transition"
          >
            Enable all
          </button>
          <button
            type="button"
            onClick={() => bulk(skills.map((s) => s.key), false)}
            className="text-[11px] font-bold px-3 py-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-rose-500 hover:border-rose-500/40 transition"
          >
            Disable all
          </button>
        </div>

        {loading && (
          <div className="theme-card p-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-[var(--border)] animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="theme-card p-4 border border-rose-500/30">
            <div className="text-xs font-bold text-rose-600 dark:text-rose-400">Could not load</div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1 break-words">{error}</div>
          </div>
        )}

        {!loading &&
          byGroup.map(({ group, items }) => (
            <div key={group.key} className="theme-card overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-main)]">
                <div className="mr-auto">
                  <div className="text-xs font-bold text-[var(--text-heading)]">{group.label}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">{group.blurb}</div>
                </div>
                <button
                  type="button"
                  onClick={() => bulk(items.map((s) => s.key), true)}
                  className="text-[10px] font-bold px-2 py-1 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-emerald-500"
                >
                  Enable group
                </button>
                <button
                  type="button"
                  onClick={() => bulk(items.map((s) => s.key), false)}
                  className="text-[10px] font-bold px-2 py-1 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-rose-500"
                >
                  Disable group
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left border-collapse">
                  <thead>
                    <tr className="text-[9px] uppercase tracking-widest text-[var(--text-muted)]">
                      <th className="px-4 py-2 font-bold">Skill</th>
                      <th className="px-3 py-2 font-bold">On</th>
                      <th className="px-3 py-2 font-bold">Classes</th>
                      <th className="px-3 py-2 font-bold">Model</th>
                      <th className="px-3 py-2 font-bold">Max tokens</th>
                      <th className="px-3 py-2 font-bold">Prompt</th>
                      <th className="px-4 py-2 font-bold" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((s) => {
                      const busy = savingKey === s.key;
                      return (
                        <tr key={s.key} className="border-t border-[var(--border)] align-middle">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${s.accent}`} />
                              <div>
                                <div className="text-[11px] font-bold font-mono text-[var(--primary)]">
                                  {s.command}
                                </div>
                                <div className="text-[10px] text-[var(--text-muted)]">{s.label}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-2.5">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => patch(s.key, { isEnabled: !s.isEnabled })}
                              aria-pressed={s.isEnabled}
                              className={`w-9 h-5 rounded-full transition relative disabled:opacity-50 ${
                                s.isEnabled ? "bg-emerald-500" : "bg-[var(--border)]"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                                  s.isEnabled ? "left-[1.15rem]" : "left-0.5"
                                }`}
                              />
                            </button>
                          </td>

                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1">
                              <select
                                value={s.classMin}
                                disabled={busy}
                                onChange={(e) =>
                                  patch(s.key, { classMin: Number(e.target.value), classMax: s.classMax })
                                }
                                className="rounded-lg bg-[var(--bg-main)] border border-[var(--border)] px-1.5 py-1 text-[11px] text-[var(--text-heading)] outline-none focus:border-[var(--primary)]"
                              >
                                {CLASSES.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                              <span className="text-[10px] text-[var(--text-muted)]">–</span>
                              <select
                                value={s.classMax}
                                disabled={busy}
                                onChange={(e) =>
                                  patch(s.key, { classMin: s.classMin, classMax: Number(e.target.value) })
                                }
                                className="rounded-lg bg-[var(--bg-main)] border border-[var(--border)] px-1.5 py-1 text-[11px] text-[var(--text-heading)] outline-none focus:border-[var(--primary)]"
                              >
                                {CLASSES.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </div>
                          </td>

                          <td className="px-3 py-2.5">
                            <select
                              value={s.model}
                              disabled={busy}
                              onChange={(e) => patch(s.key, { model: e.target.value })}
                              className="rounded-lg bg-[var(--bg-main)] border border-[var(--border)] px-2 py-1 text-[11px] text-[var(--text-heading)] outline-none focus:border-[var(--primary)]"
                            >
                              {Array.from(new Set([...GEMINI_MODELS, s.model])).map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </td>

                          <td className="px-3 py-2.5">
                            <input
                              type="number"
                              defaultValue={s.maxTokens}
                              min={512}
                              max={65536}
                              step={512}
                              disabled={busy}
                              onBlur={(e) => {
                                const n = Number(e.target.value);
                                if (n !== s.maxTokens) patch(s.key, { maxTokens: n });
                              }}
                              className="w-20 rounded-lg bg-[var(--bg-main)] border border-[var(--border)] px-2 py-1 text-[11px] text-[var(--text-heading)] outline-none focus:border-[var(--primary)]"
                            />
                          </td>

                          <td className="px-3 py-2.5">
                            {s.isPromptModified ||
                            Object.values(s.packDirectives).some((p) => p.isModified) ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                Customised
                              </span>
                            ) : (
                              <span className="text-[10px] text-[var(--text-muted)]">Default</span>
                            )}
                          </td>

                          <td className="px-4 py-2.5">
                            <div className="flex gap-1 justify-end">
                              <button
                                type="button"
                                onClick={() => openDrawer(s)}
                                className="text-[10px] font-bold px-2 py-1 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => resetSkill(s)}
                                className="text-[10px] font-bold px-2 py-1 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-rose-500 hover:border-rose-500/40"
                              >
                                Reset
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
      </div>

      {/* ── edit drawer ─────────────────────────────────────────────────── */}
      {editing && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end"
          onClick={closeDrawer}
        >
          <div
            className="w-full max-w-2xl h-full bg-[var(--bg-card)] border-l border-[var(--border)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-[var(--bg-card)] border-b border-[var(--border)] px-5 py-3 flex items-center gap-2">
              <div className="mr-auto">
                <div className="text-xs font-bold font-mono text-[var(--primary)]">{editing.command}</div>
                <div className="text-[10px] text-[var(--text-muted)]">
                  {editing.label} · {editing.outputKind}
                  {editing.updatedBy && ` · last edited by ${editing.updatedBy}`}
                </div>
              </div>
              {dirty && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Unsaved
                </span>
              )}
              <button
                type="button"
                onClick={saveDrawer}
                disabled={!dirty || savingKey === editing.key}
                className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-40"
              >
                Save
              </button>
              <button
                type="button"
                onClick={closeDrawer}
                className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-rose-500"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* base prompt */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mr-auto">
                    Prompt scaffold
                  </span>
                  <button
                    type="button"
                    onClick={() => setDraftPrompt(editing.defaultBasePrompt)}
                    className="text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--primary)]"
                  >
                    Restore default
                  </button>
                </div>
                <textarea
                  value={draftPrompt}
                  onChange={(e) => setDraftPrompt(e.target.value)}
                  rows={12}
                  spellCheck={false}
                  className="w-full rounded-xl bg-[var(--bg-main)] border border-[var(--border)] px-3 py-2.5 text-[11px] font-mono leading-relaxed text-[var(--text-heading)] outline-none focus:border-[var(--primary)] resize-y"
                />
                <div className="text-[10px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  Placeholders:{" "}
                  <code className="text-[var(--primary)]">
                    {"{{class}} {{grade}} {{subject}} {{topic}} {{unit}}"}
                  </code>
                  {editing.preview && <> — plus this skill&apos;s own inputs.</>}
                </div>
              </div>

              {/* subject pack directives */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1.5">
                  Subject structure — how this skill adapts per subject
                </div>
                <div className="flex gap-1 overflow-x-auto pb-2">
                  {Object.entries(editing.packDirectives).map(([k, p]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setActivePack(k)}
                      className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                        activePack === k
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                      }`}
                    >
                      {p.icon} {p.label}
                      {draftPacks[k] !== p.default && <span className="ml-1 text-amber-500">•</span>}
                    </button>
                  ))}
                </div>
                <textarea
                  value={draftPacks[activePack] ?? ""}
                  onChange={(e) => setDraftPacks((prev) => ({ ...prev, [activePack]: e.target.value }))}
                  rows={7}
                  spellCheck={false}
                  className="w-full rounded-xl bg-[var(--bg-main)] border border-[var(--border)] px-3 py-2.5 text-[11px] font-mono leading-relaxed text-[var(--text-heading)] outline-none focus:border-[var(--primary)] resize-y"
                />
                <button
                  type="button"
                  onClick={() =>
                    setDraftPacks((prev) => ({
                      ...prev,
                      [activePack]: editing.packDirectives[activePack]?.default || "",
                    }))
                  }
                  className="text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--primary)] mt-1.5"
                >
                  Restore {editing.packDirectives[activePack]?.label} default
                </button>
              </div>

              {/* prompt preview */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mr-auto">
                    Final prompt preview
                  </span>
                  <button
                    type="button"
                    onClick={runPreview}
                    disabled={previewing}
                    className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40 disabled:opacity-50"
                  >
                    {previewing ? "Rendering…" : "Preview with these edits"}
                  </button>
                </div>
                {preview ? (
                  <pre className="rounded-xl bg-[var(--bg-main)] border border-[var(--border)] p-3 text-[10px] font-mono leading-relaxed text-[var(--text-muted)] whitespace-pre-wrap max-h-80 overflow-y-auto">
                    {preview}
                  </pre>
                ) : (
                  <div className="rounded-xl border border-dashed border-[var(--border)] p-4 text-[10px] text-[var(--text-muted)] text-center">
                    Renders the exact prompt sent to the model for a Class 10 sample, using your unsaved edits.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
