"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import { ArrowUpCircle, CheckCircle2, Clock, XCircle, FileEdit, RefreshCw, Send, ChevronLeft, GraduationCap } from "lucide-react";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};
const API_BASE = getApiBase();

interface BatchSummary {
  id: string;
  fromClass: string;
  fromAcademicYear: string;
  toAcademicYear: string;
  status: "DRAFT" | "PENDING_BEO_APPROVAL" | "APPROVED" | "REJECTED";
  reviewRemarks?: string | null;
  submittedAt?: string | null;
  executedAt?: string | null;
  _count?: { records: number };
}

interface HscGroup {
  code: string;
  name: string;
  partIIISubjects: string[];
  streamCategory: string;
}

interface RecordRow {
  id: string;
  studentId: string;
  result: "PROMOTED" | "DETAINED" | "TRANSFERRED" | "GRADUATED";
  toClass: string | null;
  toSection: string | null;
  toGroup: string | null;
  remarks: string | null;
  applied: boolean;
  student: {
    id: string;
    rollNumber: string | null;
    section: string;
    group: string | null;
    gender: string | null;
    user: { name: string };
  };
  yearStats?: { attendancePct: number | null; averageMarksPct: number | null } | null;
}

interface BatchDetail extends BatchSummary {
  records: RecordRow[];
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-slate-700/40 text-slate-300 border-slate-600",
  PENDING_BEO_APPROVAL: "bg-amber-500/10 text-amber-400 border-amber-600/40",
  APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-600/40",
  REJECTED: "bg-rose-500/10 text-rose-400 border-rose-600/40",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_BEO_APPROVAL: "Pending BEO Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

export default function PromotionsPage() {
  const { data: session } = useSession();
  const mySchoolId: string = (session?.user as any)?.schoolId || "";
  const myUserId: string = (session?.user as any)?.id || "";

  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [groups, setGroups] = useState<HscGroup[]>([]);
  const [detail, setDetail] = useState<BatchDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ fromClass: "8", fromAcademicYear: "" });

  const loadBatches = useCallback(async () => {
    if (!mySchoolId) return;
    try {
      const res = await fetch(`${API_BASE}/api/promotions/batches?schoolId=${mySchoolId}`);
      const json = await res.json();
      if (json.success) setBatches(json.data);
    } catch {
      /* noop */
    }
  }, [mySchoolId]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  useEffect(() => {
    fetch(`${API_BASE}/api/analytics/academic-years`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setYears(json.data);
          setForm((f) => ({ ...f, fromAcademicYear: f.fromAcademicYear || json.current || json.data[0] || "" }));
        }
      })
      .catch(() => {});
    fetch(`${API_BASE}/api/competitive-exams/groups`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setGroups(json.data);
      })
      .catch(() => {});
  }, []);

  const openBatch = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/promotions/batches/${id}`);
      const json = await res.json();
      if (json.success) setDetail(json.data);
      else Swal.fire("Error", json.error || "Failed to load batch", "error");
    } finally {
      setLoading(false);
    }
  };

  const createBatch = async () => {
    if (!form.fromClass || !form.fromAcademicYear) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/promotions/batches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId: mySchoolId, ...form, submittedById: myUserId }),
      });
      const json = await res.json();
      if (json.success) {
        setShowCreate(false);
        await loadBatches();
        await openBatch(json.data.id);
      } else if (json.existingBatchId) {
        setShowCreate(false);
        await openBatch(json.existingBatchId);
      } else {
        Swal.fire("Cannot create batch", json.error || "Unknown error", "warning");
      }
    } finally {
      setSaving(false);
    }
  };

  const editable = detail && (detail.status === "DRAFT" || detail.status === "REJECTED");
  const isFinalClass = detail?.fromClass === "12";

  const updateRecord = (id: string, patch: Partial<RecordRow>) => {
    if (!detail) return;
    setDetail({
      ...detail,
      records: detail.records.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  };

  const saveDraft = async (silent = false): Promise<boolean> => {
    if (!detail) return false;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/promotions/batches/${detail.id}/records`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records: detail.records.map((r) => ({
            id: r.id,
            result: r.result,
            toClass: r.toClass,
            toSection: r.toSection,
            toGroup: r.toGroup,
            remarks: r.remarks,
          })),
        }),
      });
      const json = await res.json();
      if (!json.success) {
        Swal.fire("Validation failed", json.error || "Could not save decisions", "warning");
        return false;
      }
      if (!silent) Swal.fire({ title: "Draft saved", icon: "success", timer: 1400, showConfirmButton: false });
      return true;
    } finally {
      setSaving(false);
    }
  };

  const submitBatch = async () => {
    if (!detail) return;
    const ok = await saveDraft(true);
    if (!ok) return;
    const confirm = await Swal.fire({
      title: "Submit for BEO approval?",
      text: `Class ${detail.fromClass} · ${detail.fromAcademicYear} → ${detail.toAcademicYear}. Decisions cannot be edited while pending.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Submit",
    });
    if (!confirm.isConfirmed) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/promotions/batches/${detail.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submittedById: myUserId }),
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire("Submitted", "The batch is now awaiting BEO approval.", "success");
        await loadBatches();
        await openBatch(detail.id);
      } else {
        Swal.fire("Error", json.error || "Failed to submit", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const refreshStudents = async () => {
    if (!detail) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/promotions/batches/${detail.id}/refresh-students`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        Swal.fire({ title: `Synced (${json.added} added, ${json.removed} removed)`, icon: "success", timer: 1600, showConfirmButton: false });
        await openBatch(detail.id);
      } else {
        Swal.fire("Error", json.error || "Failed to refresh", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const resultOptions = isFinalClass
    ? ["GRADUATED", "DETAINED", "TRANSFERRED"]
    : ["PROMOTED", "DETAINED", "TRANSFERRED"];

  const counts = {
    draft: batches.filter((b) => b.status === "DRAFT").length,
    pending: batches.filter((b) => b.status === "PENDING_BEO_APPROVAL").length,
    approved: batches.filter((b) => b.status === "APPROVED").length,
    rejected: batches.filter((b) => b.status === "REJECTED").length,
  };

  return (
    <PortalLayout
      title="Student Promotions"
      subtitle="Academic-year class promotions with BEO approval"
      avatarLetter="P"
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      {!detail && (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Draft Batches", value: counts.draft, icon: FileEdit, color: "text-slate-300" },
              { label: "Pending BEO Approval", value: counts.pending, icon: Clock, color: "text-amber-400" },
              { label: "Approved", value: counts.approved, icon: CheckCircle2, color: "text-emerald-400" },
              { label: "Rejected", value: counts.rejected, icon: XCircle, color: "text-rose-400" },
            ].map((c) => (
              <div key={c.label} className="glass p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{c.label}</span>
                  <c.icon size={16} className={c.color} />
                </div>
                <div className={`text-2xl font-black mt-2 ${c.color}`}>{c.value}</div>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-white">Promotion Batches</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">One batch per class per academic year. BEO approval moves students to the next class and archives the year.</p>
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
              >
                <ArrowUpCircle size={14} /> New Promotion Batch
              </button>
            </div>

            {batches.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm">
                No promotion batches yet. Create one to promote a class into the next academic year.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase text-slate-500 border-b border-slate-800">
                    <th className="px-5 py-3">Class</th>
                    <th className="px-5 py-3">Academic Year</th>
                    <th className="px-5 py-3">Students</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((b) => (
                    <tr key={b.id} className="border-b border-slate-800/60 hover:bg-slate-800/20 text-sm">
                      <td className="px-5 py-3 font-bold text-white">
                        {b.fromClass === "12" ? "Class 12 (Pass-out)" : `Class ${b.fromClass} → ${parseInt(b.fromClass) + 1}`}
                      </td>
                      <td className="px-5 py-3 text-slate-300">
                        {b.fromAcademicYear} → {b.toAcademicYear}
                      </td>
                      <td className="px-5 py-3 text-slate-300">{b._count?.records ?? "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[b.status]}`}>
                          {STATUS_LABELS[b.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => openBatch(b.id)}
                          className="text-xs font-bold text-blue-400 hover:text-blue-300"
                        >
                          {b.status === "DRAFT" || b.status === "REJECTED" ? "Edit decisions →" : "View →"}
                        </button>
                        {(b.status === "DRAFT" || b.status === "REJECTED") && (
                          <button
                            onClick={async () => {
                              const c = await Swal.fire({ title: "Delete this draft batch?", icon: "warning", showCancelButton: true, confirmButtonText: "Delete", confirmButtonColor: "#e11d48" });
                              if (!c.isConfirmed) return;
                              await fetch(`${API_BASE}/api/promotions/batches/${b.id}`, { method: "DELETE" });
                              loadBatches();
                            }}
                            className="ml-3 text-xs font-bold text-rose-400 hover:text-rose-300"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {loading && <div className="p-10 text-center text-slate-400 text-sm">Loading batch…</div>}

      {detail && !loading && (
        <div className="glass rounded-2xl border border-slate-800 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <button onClick={() => { setDetail(null); loadBatches(); }} className="text-slate-400 hover:text-white">
                <ChevronLeft size={18} />
              </button>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  {isFinalClass ? "Class 12 Pass-out" : `Class ${detail.fromClass} → ${parseInt(detail.fromClass) + 1}`}
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[detail.status]}`}>
                    {STATUS_LABELS[detail.status]}
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {detail.fromAcademicYear} → {detail.toAcademicYear} · {detail.records.length} students
                </p>
              </div>
            </div>
            {editable && (
              <div className="flex items-center gap-2">
                <button
                  onClick={refreshStudents}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-300 border border-slate-700 hover:border-slate-500 px-3 py-2 rounded-xl"
                >
                  <RefreshCw size={12} /> Sync Students
                </button>
                <button
                  onClick={() => saveDraft()}
                  disabled={saving}
                  className="text-xs font-bold text-white bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl"
                >
                  Save Draft
                </button>
                <button
                  onClick={submitBatch}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl"
                >
                  <Send size={12} /> Submit for BEO Approval
                </button>
              </div>
            )}
          </div>

          {detail.status === "REJECTED" && detail.reviewRemarks && (
            <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-600/40 text-xs text-rose-300">
              <strong>BEO remarks:</strong> {detail.reviewRemarks} — update the decisions below and resubmit.
            </div>
          )}
          {detail.status === "APPROVED" && (
            <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-600/40 text-xs text-emerald-300 flex items-center gap-2">
              <GraduationCap size={14} />
              Approved and executed{detail.executedAt ? ` on ${new Date(detail.executedAt).toLocaleDateString()}` : ""}. The previous year&apos;s data is archived in each student&apos;s academic history.
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left mt-2">
              <thead>
                <tr className="text-[10px] uppercase text-slate-500 border-b border-slate-800">
                  <th className="px-5 py-3">Student</th>
                  <th className="px-3 py-3">Roll No</th>
                  <th className="px-3 py-3">Section</th>
                  <th className="px-3 py-3">Attendance</th>
                  <th className="px-3 py-3">Avg Marks</th>
                  <th className="px-3 py-3">Decision</th>
                  {!isFinalClass && <th className="px-3 py-3">To Section</th>}
                  {detail.records.some((r) => r.toClass === "11") || (!isFinalClass && parseInt(detail.fromClass) + 1 === 11) ? (
                    <th className="px-3 py-3">HSC Group</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {detail.records.map((r) => (
                  <tr key={r.id} className="border-b border-slate-800/60 text-sm">
                    <td className="px-5 py-2.5 font-semibold text-white">{r.student.user.name}</td>
                    <td className="px-3 py-2.5 text-slate-400">{r.student.rollNumber || "—"}</td>
                    <td className="px-3 py-2.5 text-slate-400">{r.student.section}</td>
                    <td className="px-3 py-2.5">
                      <span className={`font-bold ${r.yearStats?.attendancePct != null && r.yearStats.attendancePct < 75 ? "text-rose-400" : "text-slate-300"}`}>
                        {r.yearStats?.attendancePct != null ? `${r.yearStats.attendancePct}%` : "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`font-bold ${r.yearStats?.averageMarksPct != null && r.yearStats.averageMarksPct < 35 ? "text-rose-400" : "text-slate-300"}`}>
                        {r.yearStats?.averageMarksPct != null ? `${r.yearStats.averageMarksPct}%` : "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {editable ? (
                        <select
                          value={r.result}
                          onChange={(e) => {
                            const result = e.target.value as RecordRow["result"];
                            updateRecord(r.id, {
                              result,
                              toClass: result === "PROMOTED" ? String(parseInt(detail.fromClass) + 1) : null,
                              toSection: result === "PROMOTED" ? r.toSection || r.student.section : null,
                              toGroup: result === "PROMOTED" ? r.toGroup : null,
                            });
                          }}
                          className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                        >
                          {resultOptions.map((o) => (
                            <option key={o} value={o}>{o.charAt(0) + o.slice(1).toLowerCase()}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          r.result === "PROMOTED" || r.result === "GRADUATED"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : r.result === "DETAINED"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-slate-700/40 text-slate-300"
                        }`}>
                          {r.result}
                        </span>
                      )}
                    </td>
                    {!isFinalClass && (
                      <td className="px-3 py-2.5">
                        {editable && r.result === "PROMOTED" ? (
                          <input
                            value={r.toSection || ""}
                            onChange={(e) => updateRecord(r.id, { toSection: e.target.value.toUpperCase() })}
                            className="w-14 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                          />
                        ) : (
                          <span className="text-slate-400">{r.toSection || "—"}</span>
                        )}
                      </td>
                    )}
                    {(r.toClass === "11" || (!isFinalClass && parseInt(detail.fromClass) + 1 === 11)) && (
                      <td className="px-3 py-2.5">
                        {editable && r.result === "PROMOTED" ? (
                          <select
                            value={r.toGroup || ""}
                            onChange={(e) => updateRecord(r.id, { toGroup: e.target.value || null })}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white max-w-[220px]"
                          >
                            <option value="">Select group…</option>
                            {groups.map((g) => (
                              <option key={g.code} value={g.code}>{g.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-slate-400">{r.toGroup || "—"}</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="glass rounded-2xl border border-slate-700 p-6 w-full max-w-md bg-slate-900">
            <h3 className="text-sm font-bold text-white mb-4">New Promotion Batch</h3>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Academic year being completed</label>
            <select
              value={form.fromAcademicYear}
              onChange={(e) => setForm({ ...form, fromAcademicYear: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white mb-4"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Class to promote</label>
            <select
              value={form.fromClass}
              onChange={(e) => setForm({ ...form, fromClass: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white mb-2"
            >
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c === "12" ? "Class 12 (pass-out / alumni)" : `Class ${c} → Class ${parseInt(c) + 1}`}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mb-5">
              All active students of this class are added with a default decision, which you can adjust per student before submitting.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="text-xs font-bold text-slate-300 px-4 py-2 rounded-xl border border-slate-700">
                Cancel
              </button>
              <button
                onClick={createBatch}
                disabled={saving}
                className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl"
              >
                {saving ? "Creating…" : "Create Batch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
