"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import { CheckCircle2, XCircle, ChevronLeft, School, Clock } from "lucide-react";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};
const API_BASE = getApiBase();

interface PendingBatch {
  id: string;
  fromClass: string;
  fromAcademicYear: string;
  toAcademicYear: string;
  status: string;
  submittedAt?: string | null;
  school: { id: string; name: string; dise: string; block: string; district: string };
  _count?: { records: number };
}

interface RecordRow {
  id: string;
  result: string;
  toClass: string | null;
  toSection: string | null;
  toGroup: string | null;
  student: {
    rollNumber: string | null;
    section: string;
    user: { name: string };
  };
  yearStats?: { attendancePct: number | null; averageMarksPct: number | null } | null;
}

interface BatchDetail extends PendingBatch {
  records: RecordRow[];
}

export default function BeoPromotionApprovalsPage() {
  const { data: session } = useSession();
  const myUserId: string = (session?.user as any)?.id || "";

  const [pending, setPending] = useState<PendingBatch[]>([]);
  const [blockFilter, setBlockFilter] = useState("");
  const [detail, setDetail] = useState<BatchDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);

  const loadPending = useCallback(async () => {
    if (!myUserId && !blockFilter) return;
    const params = new URLSearchParams();
    if (myUserId) params.set("beoUserId", myUserId);
    if (blockFilter) params.set("block", blockFilter);
    try {
      const res = await fetch(`${API_BASE}/api/promotions/pending?${params.toString()}`);
      const json = await res.json();
      if (json.success) setPending(json.data);
    } catch {
      /* noop */
    }
  }, [myUserId, blockFilter]);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const openBatch = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/promotions/batches/${id}`);
      const json = await res.json();
      if (json.success) setDetail(json.data);
    } finally {
      setLoading(false);
    }
  };

  const approve = async () => {
    if (!detail) return;
    const confirm = await Swal.fire({
      title: "Approve promotion batch?",
      html: `<div style="font-size:13px">${detail.school.name}<br/>Class ${detail.fromClass} · ${detail.fromAcademicYear} → ${detail.toAcademicYear} · ${detail.records.length} students<br/><br/>Students will move to their new class and the year will be archived. This cannot be undone.</div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Approve & Execute",
      confirmButtonColor: "#059669",
    });
    if (!confirm.isConfirmed) return;
    setActing(true);
    try {
      const res = await fetch(`${API_BASE}/api/promotions/batches/${detail.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewedById: myUserId }),
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire("Approved", "Promotion executed. Student records have been updated and archived.", "success");
        setDetail(null);
        loadPending();
      } else {
        Swal.fire("Error", json.error || "Failed to approve", "error");
      }
    } finally {
      setActing(false);
    }
  };

  const reject = async () => {
    if (!detail) return;
    const { value: remarks } = await Swal.fire({
      title: "Reject batch",
      input: "textarea",
      inputLabel: "Remarks for the headmaster (required)",
      inputPlaceholder: "Explain what needs to be corrected…",
      showCancelButton: true,
      confirmButtonText: "Reject",
      confirmButtonColor: "#e11d48",
      inputValidator: (v) => (!v || !v.trim() ? "Remarks are required" : null),
    });
    if (!remarks) return;
    setActing(true);
    try {
      const res = await fetch(`${API_BASE}/api/promotions/batches/${detail.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewedById: myUserId, remarks }),
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire("Rejected", "The headmaster can now edit and resubmit the batch.", "success");
        setDetail(null);
        loadPending();
      } else {
        Swal.fire("Error", json.error || "Failed to reject", "error");
      }
    } finally {
      setActing(false);
    }
  };

  const resultCounts = detail
    ? detail.records.reduce<Record<string, number>>((acc, r) => {
        acc[r.result] = (acc[r.result] || 0) + 1;
        return acc;
      }, {})
    : {};

  return (
    <PortalLayout
      title="Promotion Approvals"
      subtitle="Review and approve academic-year promotions submitted by headmasters"
      avatarLetter="B"
      avatarColor="#8b5cf6"
      themeClass="theme-beo"
      accentColor="#8b5cf6"
    >
      {!detail && (
        <div className="glass rounded-2xl border border-slate-800 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock size={15} className="text-amber-400" /> Pending Batches ({pending.length})
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Approving a batch moves students to their next class and archives the completed year.
              </p>
            </div>
            <input
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              placeholder="Filter by block name…"
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white w-52"
            />
          </div>

          {pending.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">
              No promotion batches are waiting for approval.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase text-slate-500 border-b border-slate-800">
                  <th className="px-5 py-3">School</th>
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Academic Year</th>
                  <th className="px-5 py-3">Students</th>
                  <th className="px-5 py-3">Submitted</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((b) => (
                  <tr key={b.id} className="border-b border-slate-800/60 hover:bg-slate-800/20 text-sm">
                    <td className="px-5 py-3">
                      <div className="font-bold text-white flex items-center gap-2">
                        <School size={13} className="text-violet-400" /> {b.school.name}
                      </div>
                      <div className="text-[10px] text-slate-500">DISE {b.school.dise} · {b.school.block}</div>
                    </td>
                    <td className="px-5 py-3 text-slate-300 font-semibold">
                      {b.fromClass === "12" ? "12 (Pass-out)" : `${b.fromClass} → ${parseInt(b.fromClass) + 1}`}
                    </td>
                    <td className="px-5 py-3 text-slate-300">{b.fromAcademicYear} → {b.toAcademicYear}</td>
                    <td className="px-5 py-3 text-slate-300">{b._count?.records ?? "—"}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs">
                      {b.submittedAt ? new Date(b.submittedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => openBatch(b.id)} className="text-xs font-bold text-violet-400 hover:text-violet-300">
                        Review →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {loading && <div className="p-10 text-center text-slate-400 text-sm">Loading batch…</div>}

      {detail && !loading && (
        <div className="glass rounded-2xl border border-slate-800 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-white">
                <ChevronLeft size={18} />
              </button>
              <div>
                <h2 className="text-sm font-bold text-white">{detail.school.name}</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {detail.fromClass === "12" ? "Class 12 pass-out" : `Class ${detail.fromClass} → ${parseInt(detail.fromClass) + 1}`}
                  {" · "}{detail.fromAcademicYear} → {detail.toAcademicYear} · {detail.records.length} students
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={reject}
                disabled={acting}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-400 border border-rose-600/40 hover:bg-rose-500/10 px-4 py-2 rounded-xl"
              >
                <XCircle size={13} /> Reject
              </button>
              <button
                onClick={approve}
                disabled={acting}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl"
              >
                <CheckCircle2 size={13} /> Approve & Execute
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 px-5 pt-4">
            {Object.entries(resultCounts).map(([result, count]) => (
              <span key={result} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                {result}: {count}
              </span>
            ))}
          </div>

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
                  <th className="px-3 py-3">To</th>
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
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        r.result === "PROMOTED" || r.result === "GRADUATED"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : r.result === "DETAINED"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-slate-700/40 text-slate-300"
                      }`}>
                        {r.result}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-400 text-xs">
                      {r.result === "PROMOTED"
                        ? `Class ${r.toClass}${r.toSection ? ` · Sec ${r.toSection}` : ""}${r.toGroup ? ` · Group ${r.toGroup}` : ""}`
                        : r.result === "GRADUATED"
                        ? "Alumni"
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
