"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";

type ReportStatus = "Submitted" | "Acknowledged" | "In Progress" | "Resolved";
type ReportPriority = "Low" | "Medium" | "High" | "Urgent";
type ReportType = "Critical Alert" | "Category Summary" | "Full Infrastructure Report";

interface ResourceReport {
  id: string;
  schoolId: string;
  schoolName: string;
  schoolDistrict: string;
  schoolBlock: string;
  category: string | null;
  reportType: ReportType;
  priority: ReportPriority;
  subject: string;
  description: string | null;
  snapshot: any;
  status: ReportStatus;
  createdAt: string;
}

interface Summary {
  totalReports: number;
  urgentCount: number;
  openCount: number;
  resolvedCount: number;
  criticalAlerts: number;
  schoolsReporting: number;
  byDistrict: Record<string, number>;
}

const STATUS_FLOW: ReportStatus[] = ["Submitted", "Acknowledged", "In Progress", "Resolved"];

const STATUS_META: Record<ReportStatus, { badge: string; dot: string; next: ReportStatus | null; nextLabel: string }> = {
  Submitted:     { badge: "bg-blue-500/15 border border-blue-500/30 text-blue-300",       dot: "bg-blue-500",    next: "Acknowledged", nextLabel: "✓ Acknowledge" },
  Acknowledged:  { badge: "bg-violet-500/15 border border-violet-500/30 text-violet-300", dot: "bg-violet-500", next: "In Progress",  nextLabel: "▶ Start Progress" },
  "In Progress": { badge: "bg-amber-500/15 border border-amber-500/30 text-amber-300",   dot: "bg-amber-400",  next: "Resolved",     nextLabel: "✓ Mark Resolved" },
  Resolved:      { badge: "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300", dot: "bg-emerald-500", next: null, nextLabel: "" },
};

const PRIORITY_META: Record<ReportPriority, { chip: string; dot: string }> = {
  Low:    { chip: "bg-slate-500/15 border-slate-500/30 text-slate-300", dot: "bg-slate-400" },
  Medium: { chip: "bg-sky-500/15 border-sky-500/30 text-sky-300",       dot: "bg-sky-400" },
  High:   { chip: "bg-amber-500/15 border-amber-500/30 text-amber-300", dot: "bg-amber-400" },
  Urgent: { chip: "bg-rose-500/15 border-rose-500/30 text-rose-300",    dot: "bg-rose-500" },
};

const TYPE_ICON: Record<ReportType, string> = {
  "Critical Alert": "⚠️",
  "Category Summary": "📋",
  "Full Infrastructure Report": "📊",
};

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) url = `https://${url}`;
  return url;
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function MinisterInfrastructurePage() {
  const { data: session } = useSession();
  const ministerUserId: string = (session?.user as any)?.id || "";
  const API_BASE = getApiBase();

  const [reports, setReports] = useState<ResourceReport[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"All" | ReportStatus>("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | ReportPriority>("All");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [detailReport, setDetailReport] = useState<ResourceReport | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchReports = useCallback(async () => {
    if (!ministerUserId) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/hierarchy/minister/${ministerUserId}/resource-reports`);
      const json = await res.json();
      if (json.success) { setReports(json.data); setSummary(json.summary); }
      else setError(json.error || "Failed to load reports.");
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }, [ministerUserId, API_BASE]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleStatusUpdate = async (report: ResourceReport, newStatus: ReportStatus) => {
    setUpdatingId(report.id);
    try {
      const res = await fetch(
        `${API_BASE}/api/hierarchy/minister/${ministerUserId}/resource-reports/${report.id}`,
        { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) }
      );
      const json = await res.json();
      if (json.success) {
        setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: newStatus } : r));
        if (detailReport?.id === report.id) setDetailReport({ ...detailReport, status: newStatus });
        showToast(`✓ Marked as "${newStatus}"`);
      } else showToast(json.error || "Update failed.", "error");
    } catch { showToast("Network error.", "error"); }
    finally { setUpdatingId(null); }
  };

  const districtEntries = summary?.byDistrict
    ? Object.entries(summary.byDistrict).sort((a, b) => b[1] - a[1])
    : [];

  const filtered = reports.filter(r => {
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    if (priorityFilter !== "All" && r.priority !== priorityFilter) return false;
    if (districtFilter !== "All" && r.schoolDistrict !== districtFilter) return false;
    if (search && !r.schoolName.toLowerCase().includes(search.toLowerCase()) &&
      !r.subject.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const resolvedPct = summary && summary.totalReports > 0
    ? Math.round((summary.resolvedCount / summary.totalReports) * 100) : 0;

  return (
    <PortalLayout>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 fade-in">
        <div>
          <h2 className="text-base font-semibold text-white">🏗️ Infrastructure Reports — State View</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Critical infrastructure reports sent directly to the Minister from school headmasters across Tamil Nadu
          </p>
        </div>
        <button onClick={fetchReports} className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md">
          🔄 Refresh
        </button>
      </div>

      {toast && (
        <div className={`mb-5 p-3.5 rounded-xl text-xs font-semibold border fade-in ${
          toast.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-rose-500/10 border-rose-500/30 text-rose-300"
        }`}>{toast.msg}</div>
      )}

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
          <div className="glass p-5 rounded-2xl border border-slate-800 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Reports</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{summary.totalReports}</span>
              <span className="text-[10px] text-rose-400 font-bold">State-wide</span>
            </div>
            <div className="text-[10px] text-slate-500">
              From <span className="text-rose-300 font-semibold">{summary.schoolsReporting}</span> schools ·{" "}
              <span className="text-rose-300 font-semibold">{districtEntries.length}</span> districts
            </div>
          </div>
          <div className="glass p-5 rounded-2xl border border-slate-800 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Open / Urgent</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black ${summary.openCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>{summary.openCount}</span>
              <span className="text-[10px] text-rose-400 font-bold">{summary.urgentCount} Urgent</span>
            </div>
          </div>
          <div className="glass p-5 rounded-2xl border border-slate-800 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Critical Alerts</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black ${summary.criticalAlerts > 0 ? "text-rose-400" : "text-emerald-400"}`}>{summary.criticalAlerts}</span>
              <span className="text-[10px] text-rose-400 font-bold">Alerts</span>
            </div>
          </div>
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

      {/* District breakdown pills */}
      {districtEntries.length > 0 && (
        <div className="glass rounded-2xl p-5 border border-slate-800 mb-5 fade-in">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">📍 Reports by District</h3>
          <div className="flex flex-wrap gap-2">
            {districtEntries.map(([dist, count]) => (
              <button key={dist} onClick={() => setDistrictFilter(districtFilter === dist ? "All" : dist)}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                  districtFilter === dist
                    ? "bg-rose-600 border-rose-500 text-white"
                    : "bg-slate-900 border-slate-700 text-slate-300 hover:border-rose-500/50"
                }`}>
                {dist} <span className="opacity-70">({count})</span>
              </button>
            ))}
            {districtFilter !== "All" && (
              <button onClick={() => setDistrictFilter("All")}
                className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-400 text-[11px] font-bold">
                ✕ Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="glass rounded-2xl p-4 border border-slate-800 mb-5 fade-in">
        <div className="flex flex-wrap gap-3 items-center">
          <input type="text" placeholder="Search school or subject..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[180px] bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500">
            <option value="All">All Status</option>
            {STATUS_FLOW.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500">
            <option value="All">All Priority</option>
            {(["Low", "Medium", "High", "Urgent"] as ReportPriority[]).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <span className="text-[10px] text-slate-500 ml-auto font-semibold">{filtered.length} of {reports.length} reports</span>
        </div>
      </div>

      {/* Reports Table */}
      <div className="glass rounded-2xl border border-slate-800 overflow-hidden mb-6 fade-in">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">📨 Critical Reports — Sent to Minister</h3>
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Highest Authority</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500 text-xs gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-rose-500/20 border-t-rose-500 animate-spin" />
            Loading state-wide reports...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-400 text-xs">⚠️ {error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center">
            <div className="text-3xl mb-3">{reports.length === 0 ? "📭" : "🔍"}</div>
            <p className="text-slate-400 text-sm font-semibold">
              {reports.length === 0 ? "No reports received yet" : "No reports match filters"}
            </p>
            <p className="text-slate-600 text-xs mt-1">
              {reports.length === 0
                ? "Headmasters escalate critical infrastructure reports to Minister from their school portal"
                : "Try adjusting filters"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 text-left font-bold">School</th>
                  <th className="px-4 py-3 text-left font-bold">District</th>
                  <th className="px-4 py-3 text-left font-bold">Subject / Type</th>
                  <th className="px-4 py-3 text-left font-bold">Priority</th>
                  <th className="px-4 py-3 text-left font-bold">Status</th>
                  <th className="px-4 py-3 text-left font-bold">Date</th>
                  <th className="px-4 py-3 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const sm = STATUS_META[r.status];
                  const pm = PRIORITY_META[r.priority];
                  const isUpdating = updatingId === r.id;
                  return (
                    <tr key={r.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => setDetailReport(r)}>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white">{r.schoolName}</div>
                        <div className="text-[10px] text-slate-500">{r.schoolBlock}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-slate-300 text-[11px] font-semibold">{r.schoolDistrict}</span>
                      </td>
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <div className="text-[10px] text-rose-400 font-semibold mb-0.5">{TYPE_ICON[r.reportType]} {r.reportType}</div>
                        <div className="text-white text-[11px] line-clamp-1 font-medium">{r.subject}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${pm.chip}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${pm.dot}`} />{r.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${sm.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />{r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">{fmtDate(r.createdAt)}</td>
                      <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                        {sm.next ? (
                          <button disabled={isUpdating} onClick={() => handleStatusUpdate(r, sm.next!)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-[10px] font-bold rounded-lg transition-all whitespace-nowrap">
                            {isUpdating ? "..." : sm.nextLabel}
                          </button>
                        ) : <span className="text-[10px] text-emerald-400 font-bold">✓ Done</span>}
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDetailReport(null)}>
          <div className="w-full max-w-xl rounded-3xl p-6 space-y-4" style={{ background: "#090d16", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 25px 60px rgba(0,0,0,0.95)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold text-rose-400 mb-1">{TYPE_ICON[detailReport.reportType]} {detailReport.reportType}</div>
                <h3 className="text-base font-bold text-white">{detailReport.subject}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  From: <span className="text-rose-300 font-semibold">{detailReport.schoolName}</span>
                  {" · "}<span className="text-slate-500">{detailReport.schoolDistrict}</span>
                </p>
              </div>
              <button onClick={() => setDetailReport(null)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${PRIORITY_META[detailReport.priority].chip}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_META[detailReport.priority].dot}`} />{detailReport.priority} Priority
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_META[detailReport.status].badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[detailReport.status].dot}`} />{detailReport.status}
              </span>
              {detailReport.category && <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-semibold">🏷️ {detailReport.category}</span>}
              <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-[10px]">📅 {fmtDate(detailReport.createdAt)}</span>
            </div>
            {detailReport.description && (
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Description</div>
                <p className="text-xs text-slate-300 leading-relaxed">{detailReport.description}</p>
              </div>
            )}
            {detailReport.snapshot && (
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-3">School Snapshot</div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[
                    { l: "Total", v: detailReport.snapshot?.totalResources },
                    { l: "Functional", v: detailReport.snapshot?.functional, c: "text-emerald-400" },
                    { l: "Needs Repair", v: detailReport.snapshot?.needsRepair, c: "text-amber-400" },
                    { l: "Critical", v: detailReport.snapshot?.critical, c: "text-rose-400" },
                  ].map(item => (
                    <div key={item.l} className="bg-slate-800/40 rounded-lg p-2 text-center">
                      <div className="text-[9px] text-slate-500 mb-1">{item.l}</div>
                      <div className={`text-sm font-black ${(item as any).c || "text-white"}`}>{item.v ?? "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {STATUS_META[detailReport.status].next && (
              <button disabled={updatingId === detailReport.id}
                onClick={() => handleStatusUpdate(detailReport, STATUS_META[detailReport.status].next!)}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-lg">
                {updatingId === detailReport.id ? "Updating..." : STATUS_META[detailReport.status].nextLabel}
              </button>
            )}
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
