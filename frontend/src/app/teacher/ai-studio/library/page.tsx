"use client";

// My AI Content — everything the teacher saved from the studio, re-openable,
// re-printable, and pushable into the Question Bank / Homework / Smart Class.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import PortalLayout from "@/components/PortalLayout";
import { apiFetch } from "@/lib/api";
import {
  STUDIO_GROUPS,
  PACK_DISPLAY,
  PUSH_TARGET_LABEL,
  OUTPUT_KIND_LABEL,
  type StudioSkill,
  type OutputKind,
  type SubjectPack,
  type PushTarget,
} from "@/lib/aiSkills";
import { OutputRenderer } from "@/components/ai-studio/renderers";
import { printOutput } from "@/components/ai-studio/printable";

interface AiContentRow {
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
  isPublished: boolean;
  createdAt: string;
}

export default function AIContentLibraryPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const [skills, setSkills] = useState<StudioSkill[]>([]);
  const [rows, setRows] = useState<AiContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [groupFilter, setGroupFilter] = useState<string>("ALL");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const skillByKey = useMemo(
    () => skills.reduce((acc, s) => ({ ...acc, [s.key]: s }), {} as Record<string, StudioSkill>),
    [skills]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [skillsRes, contentRes] = await Promise.all([
        apiFetch("/api/ai-studio/skills"),
        apiFetch("/api/ai-studio/content"),
      ]);
      const skillsJson = await skillsRes.json();
      const contentJson = await contentRes.json();
      if (skillsJson.success) setSkills(skillsJson.data.skills || []);
      if (!contentJson.success) throw new Error(contentJson.error || "Could not load your content");
      setRows(contentJson.data || []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const skill = skillByKey[r.skillKey];
      if (groupFilter !== "ALL" && skill?.group !== groupFilter) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.topic.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q) ||
        r.className.toLowerCase().includes(q)
      );
    });
  }, [rows, groupFilter, query, skillByKey]);

  const open = filtered.find((r) => r.id === openId) || null;

  const remove = async (row: AiContentRow) => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Delete this?",
      text: row.title,
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#e11d48",
    });
    if (!confirmed.isConfirmed) return;
    try {
      const res = await apiFetch(`/api/ai-studio/content/${row.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      if (openId === row.id) setOpenId(null);
    } catch (err) {
      Swal.fire("Could not delete", String(err), "error");
    }
  };

  const push = async (row: AiContentRow, target: PushTarget) => {
    try {
      const res = await apiFetch(`/api/ai-studio/content/${row.id}/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      Swal.fire({
        icon: "success",
        title: `Sent to ${PUSH_TARGET_LABEL[target]}`,
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire("Could not send", String(err), "error");
    }
  };

  const togglePublish = async (row: AiContentRow) => {
    try {
      const res = await apiFetch(`/api/ai-studio/content/${row.id}/publish`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !row.isPublished }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, isPublished: !r.isPublished } : r)));
    } catch (err) {
      Swal.fire("Could not change publish state", String(err), "error");
    }
  };

  return (
    <PortalLayout title="My AI Content" subtitle="Everything you generated in the AI Content Studio">
      <div className="space-y-4">
        {/* filters */}
        <div className="theme-card p-3 flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, topic, subject or class…"
            className="flex-1 min-w-[200px] rounded-xl bg-[var(--bg-main)] border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-heading)] outline-none focus:border-[var(--primary)]"
          />
          <div className="flex gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setGroupFilter("ALL")}
              className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                groupFilter === "ALL"
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)]"
              }`}
            >
              All
            </button>
            {STUDIO_GROUPS.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => setGroupFilter(g.key)}
                className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                  groupFilter === g.key
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                }`}
              >
                {g.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="theme-card p-4 h-28 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="theme-card p-4 border border-rose-500/30">
            <div className="text-xs font-bold text-rose-600 dark:text-rose-400">Could not load your content</div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1 break-words">{error}</div>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="theme-card p-10 text-center">
            <div className="text-3xl mb-3">📂</div>
            <h3 className="text-sm font-bold text-[var(--text-heading)]">Nothing saved yet</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Generate something in the AI Content Studio and press Save — it lands here.
            </p>
            <a
              href="/teacher/ai-studio"
              className="inline-block mt-4 text-[11px] font-bold px-3 py-2 rounded-xl bg-[var(--primary)] text-white hover:opacity-90"
            >
              ✨ Open AI Studio
            </a>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((row) => {
              const skill = skillByKey[row.skillKey];
              const pack = PACK_DISPLAY[row.subjectPack] || PACK_DISPLAY.GENERAL;
              return (
                <div
                  key={row.id}
                  className="theme-card p-4 flex flex-col gap-2 hover:border-[var(--primary)]/40 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold font-mono text-[var(--primary)]">
                      {skill?.command || row.skillKey}
                    </span>
                    {row.isPublished && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        Published
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-[var(--text-heading)] leading-snug line-clamp-2">
                    {row.title}
                  </h3>

                  <div className="flex flex-wrap gap-1 text-[9px] text-[var(--text-muted)]">
                    <span className="px-1.5 py-0.5 rounded border border-[var(--border)]">{row.className}</span>
                    {row.subject && (
                      <span className="px-1.5 py-0.5 rounded border border-[var(--border)]">{row.subject}</span>
                    )}
                    <span className="px-1.5 py-0.5 rounded border border-[var(--border)]">
                      {pack.icon} {pack.label}
                    </span>
                    <span className="px-1.5 py-0.5 rounded border border-[var(--border)]">
                      {OUTPUT_KIND_LABEL[row.outputKind] || row.outputKind}
                    </span>
                  </div>

                  <div className="text-[10px] text-[var(--text-muted)] mt-auto pt-1">
                    {new Date(row.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1 border-t border-[var(--border)]">
                    <button
                      type="button"
                      onClick={() => setOpenId(row.id)}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[var(--primary)] text-white hover:opacity-90"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        printOutput(row.outputKind, row.payload, {
                          skillLabel: skill?.label || row.skillKey,
                          subject: row.subject,
                          className: row.className,
                          section: row.section,
                          topic: row.topic,
                          teacherName: user?.name,
                        })
                      }
                      className="text-[10px] font-bold px-2 py-1 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40"
                    >
                      Print
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePublish(row)}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-emerald-500 hover:border-emerald-500/40"
                    >
                      {row.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(row)}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-rose-500 hover:border-rose-500/40 ml-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* viewer */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
          onClick={() => setOpenId(null)}
        >
          <div
            className="theme-card w-full max-w-3xl my-4 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center gap-1.5 mb-4 pb-3 border-b border-[var(--border)]">
              <span className="text-[11px] font-bold font-mono text-[var(--primary)] mr-auto">
                {skillByKey[open.skillKey]?.command || open.skillKey}
              </span>
              {(skillByKey[open.skillKey]?.pushTargets || []).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => push(open, t)}
                  className="text-[10px] font-bold px-2 py-1 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40"
                >
                  ➜ {PUSH_TARGET_LABEL[t]}
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  printOutput(open.outputKind, open.payload, {
                    skillLabel: skillByKey[open.skillKey]?.label || open.skillKey,
                    subject: open.subject,
                    className: open.className,
                    section: open.section,
                    topic: open.topic,
                    teacherName: user?.name,
                  })
                }
                className="text-[10px] font-bold px-2 py-1 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40"
              >
                ⤓ Print
              </button>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="text-[10px] font-bold px-2 py-1 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-rose-500"
              >
                ✕ Close
              </button>
            </div>
            <OutputRenderer outputKind={open.outputKind} payload={open.payload} />
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
