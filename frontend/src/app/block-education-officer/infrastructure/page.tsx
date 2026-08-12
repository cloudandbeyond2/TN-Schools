"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";

// ─── Types ───────────────────────────────────────────────────────────────────

type ReportStatus = "Submitted" | "Acknowledged" | "In Progress" | "Resolved";
type ReportPriority = "Low" | "Medium" | "High" | "Urgent";
type ReportType = "Critical Alert" | "Category Summary" | "Full Infrastructure Report";

interface ResourceReport {
  id: string;
  schoolId: string;
  schoolName: string;
  schoolDistrict: string;
  schoolBlock: string;
  resourceId: string | null;
  category: string | null;
  recipientRole: string;
  reportType: ReportType;
  priority: ReportPriority;
  subject: string;
  description: string | null;
  snapshot: any;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

interface Summary {
  totalReports: number;
  urgentCount: number;
  openCount: number;
  resolvedCount: number;
  criticalAlerts: number;
  totalSchools: number;
  schoolsReporting: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_FLOW: ReportStatus[] = ["Submitted", "Acknowledged", "In Progress", "Resolved"];

const STATUS_META: Record<ReportStatus, { badge: string; dot: string; next: ReportStatus | null; nextLabel: string }> = {
  Submitted:     { badge: "bg-blue-500/15 border border-blue-500/30 text-blue-300",    dot: "bg-blue-500",    next: "Acknowledged", nextLabel: "✓ Acknowledge" },
  Acknowledged:  { badge: "bg-violet-500/15 border border-violet-500/30 text-violet-300", dot: "bg-violet-500", next: "In Progress",  nextLabel: "▶ Start Progress" },
  "In Progress": { badge: "bg-amber-500/15 border border-amber-500/30 text-amber-300",  dot: "bg-amber-400",  next: "Resolved",     nextLabel: "✓ Mark Resolved" },
  Resolved:      { badge: "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300", dot: "bg-emerald-500", next: null, nextLabel: "" },
};

const PRIORITY_META: Record<ReportPriority, { chip: string; dot: string }> = {
  Low:    { chip: "bg-slate-500/15 border-slate-500/30 text-slate-300",  dot: "bg-slate-400" },
  Medium: { chip: "bg-sky-500/15 border-sky-500/30 text-sky-300",        dot: "bg-sky-400" },
  High:   { chip: "bg-amber-500/15 border-amber-500/30 text-amber-300",  dot: "bg-amber-400" },
  Urgent: { chip: "bg-rose-500/15 border-rose-500/30 text-rose-300",     dot: "bg-rose-500" },
};

const TYPE_META: Record<ReportType, { icon: string; color: string }> = {
  "Critical Alert":            { icon: "⚠️", color: "text-rose-400" },
  "Category Summary":          { icon: "📋", color: "text-sky-400" },
  "Full Infrastructure Report":{ icon: "📊", color: "text-amber-400" },
};

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) url = `https://${url}`;
  return url;
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InfrastructurePage() {
  const { data: session } = useSession();
  const beoUserId: string = (session?.user as any)?.id || "";
  const API_BASE = getApiBase();

  const [reports, setReports] = useState<ResourceReport[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<"All" | ReportStatus>("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | ReportPriority>("All");
  const [typeFilter, setTypeFilter] = useState<"All" | ReportType>("All");
  const [search, setSearch] = useState("");

  // Status update
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Detail view
  const [detailReport, setDetailReport] = useState<ResourceReport | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    if (!beoUserId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/hierarchy/beo/${beoUserId}/resource-reports`
      );
      const json = await res.json();
      if (json.success) {
        setReports(json.data);
        setSummary(json.summary);
      } else {
        setError(json.error || "Failed to load reports.");
      }
    } catch {
      setError("Network error. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  }, [beoUserId, API_BASE]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  // ── Update report status ──────────────────────────────────────────────────
  const handleStatusUpdate = async (report: ResourceReport, newStatus: ReportStatus) => {
    setUpdatingId(report.id);
    try {
      const res = await fetch(
        `${API_BASE}/api/hierarchy/beo/${beoUserId}/resource-reports/${report.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const json = await res.json();
      if (json.success) {
        setReports((prev) =>
          prev.map((r) => (r.id === report.id ? { ...r, status: newStatus } : r))
        );
        if (detailReport?.id === report.id) setDetailReport({ ...detailReport, status: newStatus });
        setSummary((prev) => {
          if (!prev) return prev;
          const wasResolved = report.status === "Resolved";
          const nowResolved = newStatus === "Resolved";
          return {
            ...prev,
            resolvedCount: prev.resolvedCount + (nowResolved ? 1 : wasResolved ? -1 : 0),
            openCount: prev.openCount + (nowResolved ? -1 : wasResolved ? 1 : 0),
          };
        });
        showToast(`✓ Report marked as "${newStatus}"`);
      } else {
        showToast(json.error || "Update failed.", "error");
      }
    } catch {
      showToast("Network error.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Filtered rows ─────────────────────────────────────────────────────────
  const filtered = reports.filter((r) => {
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    if (priorityFilter !== "All" && r.priority !== priorityFilter) return false;
    if (typeFilter !== "All" && r.reportType !== typeFilter) return false;
    if (search && !r.schoolName.toLowerCase().includes(search.toLowerCase()) &&
      !r.subject.toLowerCase().includes(search.toLowerCase()) &&
      !(r.category || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // ── KPI Helpers ───────────────────────────────────────────────────────────
  const urgentPct = summary && summary.totalReports > 0
    ? Math.round((summary.urgentCount / summary.totalReports) * 100) : 0;
  const resolvedPct = summary && summary.totalReports > 0
    ? Math.round((summary.resolvedCount / summary.totalReports) * 100) : 0;

  return (
    <PortalLayout>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 fade-in">
        <div>
          <h2 className="text-base font-semibold text-white">🏗️ Infrastructure Reports</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Live resource reports sent by school headmasters to your block office
          </p>
        </div>
        <button
          onClick={fetchReports}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`mb-5 p-3.5 rounded-xl text-xs font-semibold border fade-in ${
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
          {/* Total Reports */}
          <div className="glass p-5 rounded-2xl border border-slate-800 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Reports</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{summary.totalReports}</span>
              <span className="text-[10px] text-violet-400 font-bold">Received</span>
            </div>
            <div className="text-[10px] text-slate-500">
              From <span className="text-violet-300 font-semibold">{summary.schoolsReporting}</span> of{" "}
              <span className="text-white font-semibold">{summary.totalSchools}</span> schools
            </div>
          </div>

          {/* Open / Pending */}
          <div className="glass p-5 rounded-2xl border border-slate-800 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Open</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black ${summary.openCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                {summary.openCount}
              </span>
              <span className="text-[10px] text-amber-400 font-bold">Pending</span>
            </div>
            <div className="text-[10px] text-slate-500">
              <span className="text-rose-400 font-semibold">{summary.urgentCount}</span> urgent priority
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="glass p-5 rounded-2xl border border-slate-800 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Critical Alerts</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black ${summary.criticalAlerts > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                {summary.criticalAlerts}
              </span>
              <span className="text-[10px] text-rose-400 font-bold">Alerts</span>
            </div>
            <div className="w-full bg-slate-900 h-1 rounded-full mt-1 overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: `${urgentPct}%` }} />
            </div>
          </div>

          {/* Resolved */}
          <div className="glass p-5 rounded-2xl border border-slate-800 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Resolved</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">{summary.resolvedCount}</span>
              <span className="text-[10px] text-emerald-400 font-bold">{resolvedPct}%</span>
            </div>
            <div className="w-full bg-slate-900 h-1 rounded-full mt-1 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${resolvedPct}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="glass rounded-2xl p-4 border border-slate-800 mb-5 fade-in">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <input
            type="text"
            placeholder="Search school, subject, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 transition-colors"
          >
            <option value="All">All Status</option>
            {STATUS_FLOW.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 transition-colors"
          >
            <option value="All">All Priority</option>
            {(["Low", "Medium", "High", "Urgent"] as ReportPriority[]).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 transition-colors"
          >
            <option value="All">All Types</option>
            {(["Critical Alert", "Category Summary", "Full Infrastructure Report"] as ReportType[]).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <span className="text-[10px] text-slate-500 ml-auto font-semibold">
            {filtered.length} of {reports.length} reports
          </span>
        </div>
      </div>

      {/* Reports Table */}
      <div className="glass rounded-2xl border border-slate-800 overflow-hidden mb-6 fade-in">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">📨 Reports from Schools</h3>
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            Sent to BEO — Your Block
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500 text-xs gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
            Loading infrastructure reports...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-400 text-xs">⚠️ {error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center">
            <div className="text-3xl mb-3">{reports.length === 0 ? "📭" : "🔍"}</div>
            <p className="text-slate-400 text-sm font-semibold">
              {reports.length === 0
                ? "No reports received yet"
                : "No reports match your filters"}
            </p>
            <p className="text-slate-600 text-xs mt-1">
              {reports.length === 0
                ? "Headmasters will send infrastructure reports to BEO from their school portal"
                : "Try adjusting your search or filter"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 text-left font-bold">School</th>
                  <th className="px-4 py-3 text-left font-bold">Subject / Type</th>
                  <th className="px-4 py-3 text-left font-bold">Category</th>
                  <th className="px-4 py-3 text-left font-bold">Priority</th>
                  <th className="px-4 py-3 text-left font-bold">Status</th>
                  <th className="px-4 py-3 text-left font-bold">Date</th>
                  <th className="px-4 py-3 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const sm = STATUS_META[r.status];
                  const pm = PRIORITY_META[r.priority];
                  const tm = TYPE_META[r.reportType];
                  const isUpdating = updatingId === r.id;
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors group cursor-pointer"
                      onClick={() => setDetailReport(r)}
                    >
                      {/* School */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white">{r.schoolName}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{r.schoolBlock || r.schoolDistrict}</div>
                      </td>

                      {/* Subject / Type */}
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <div className={`flex items-center gap-1.5 font-semibold ${tm.color} mb-0.5`}>
                          <span>{tm.icon}</span>
                          <span className="text-[10px] uppercase tracking-wide">{r.reportType}</span>
                        </div>
                        <div className="text-white text-[11px] leading-snug line-clamp-1 font-medium">
                          {r.subject}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5">
                        <span className="text-slate-300">{r.category || "All"}</span>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${pm.chip}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${pm.dot}`} />
                          {r.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${sm.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
                          {r.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-slate-400">
                        {fmtDate(r.createdAt)}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        {sm.next ? (
                          <button
                            disabled={isUpdating}
                            onClick={() => handleStatusUpdate(r, sm.next!)}
                            className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-[10px] font-bold rounded-lg transition-all whitespace-nowrap"
                          >
                            {isUpdating ? "..." : sm.nextLabel}
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-bold">✓ Done</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailReport && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDetailReport(null)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl p-6 space-y-5"
            style={{
              background: "#090d16",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.95)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className={`text-xs font-bold mb-1 ${TYPE_META[detailReport.reportType].color}`}>
                  {TYPE_META[detailReport.reportType].icon} {detailReport.reportType}
                </div>
                <h3 className="text-base font-bold text-white leading-snug">{detailReport.subject}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  From: <span className="text-violet-300 font-semibold">{detailReport.schoolName}</span>
                  {detailReport.schoolBlock && <span className="text-slate-500"> · {detailReport.schoolBlock}</span>}
                </p>
              </div>
              <button
                onClick={() => setDetailReport(null)}
                className="text-slate-400 hover:text-white text-xs mt-1"
              >
                ✕ Close
              </button>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${PRIORITY_META[detailReport.priority].chip}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_META[detailReport.priority].dot}`} />
                {detailReport.priority} Priority
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_META[detailReport.status].badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[detailReport.status].dot}`} />
                {detailReport.status}
              </span>
              {detailReport.category && (
                <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-semibold">
                  🏷️ {detailReport.category}
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px]">
                📅 {fmtDate(detailReport.createdAt)}
              </span>
            </div>

            {/* Description */}
            {detailReport.description && (
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Description</div>
                <p className="text-xs text-slate-300 leading-relaxed">{detailReport.description}</p>
              </div>
            )}

            {/* Snapshot */}
            {detailReport.snapshot && (
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-3">School Snapshot (at time of report)</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[
                    { label: "Total Resources", val: detailReport.snapshot?.totalResources ?? "—" },
                    { label: "Functional", val: detailReport.snapshot?.functional ?? "—", color: "text-emerald-400" },
                    { label: "Needs Repair", val: detailReport.snapshot?.needsRepair ?? "—", color: "text-amber-400" },
                    { label: "Critical", val: detailReport.snapshot?.critical ?? "—", color: "text-rose-400" },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-800/40 rounded-lg p-2.5">
                      <div className="text-[10px] text-slate-500 mb-1">{item.label}</div>
                      <div className={`text-base font-black ${item.color || "text-white"}`}>{item.val}</div>
                    </div>
                  ))}
                </div>
                {detailReport.snapshot?.healthScore != null && (
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-[10px] text-slate-500">Health Score:</span>
                    <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          detailReport.snapshot.healthScore >= 75 ? "bg-emerald-500" :
                          detailReport.snapshot.healthScore >= 50 ? "bg-amber-400" : "bg-rose-500"
                        }`}
                        style={{ width: `${detailReport.snapshot.healthScore}%` }}
                      />
                    </div>
                    <span className={`text-xs font-black ${
                      detailReport.snapshot.healthScore >= 75 ? "text-emerald-400" :
                      detailReport.snapshot.healthScore >= 50 ? "text-amber-400" : "text-rose-400"
                    }`}>{detailReport.snapshot.healthScore}%</span>
                  </div>
                )}
              </div>
            )}

            {/* Status progress bar */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-3">Report Progress</div>
              <div className="flex items-center gap-0">
                {STATUS_FLOW.map((s, i) => {
                  const stepIdx = STATUS_FLOW.indexOf(detailReport.status);
                  const isActive = i === stepIdx;
                  const isDone = i < stepIdx;
                  return (
                    <React.Fragment key={s}>
                      <div className={`flex flex-col items-center gap-1 min-w-[60px]`}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] font-black transition-all ${
                          isDone ? "bg-emerald-500 border-emerald-500 text-white" :
                          isActive ? "bg-violet-600 border-violet-500 text-white" :
                          "bg-slate-900 border-slate-700 text-slate-600"
                        }`}>
                          {isDone ? "✓" : i + 1}
                        </div>
                        <span className={`text-[9px] font-semibold text-center leading-tight ${isActive ? "text-violet-300" : isDone ? "text-emerald-400" : "text-slate-600"}`}>
                          {s}
                        </span>
                      </div>
                      {i < STATUS_FLOW.length - 1 && (
                        <div className={`flex-1 h-0.5 mb-4 transition-all ${i < stepIdx ? "bg-emerald-500" : "bg-slate-800"}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Action Button */}
            {STATUS_META[detailReport.status].next && (
              <button
                disabled={updatingId === detailReport.id}
                onClick={() => handleStatusUpdate(detailReport, STATUS_META[detailReport.status].next!)}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-lg"
              >
                {updatingId === detailReport.id ? "Updating..." : STATUS_META[detailReport.status].nextLabel}
              </button>
            )}
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
