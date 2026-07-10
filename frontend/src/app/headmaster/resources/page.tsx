"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";

// ─── Types ───────────────────────────────────────────────────────────────────

type ResourceCategory =
  | "Classrooms"
  | "Laboratories"
  | "Computers"
  | "Smart Classrooms"
  | "Libraries"
  | "Toilets"
  | "Drinking Water"
  | "Electricity"
  | "Internet Facilities";

type ResourceStatus = "Excellent" | "Good" | "Needs Repair" | "Critical";
type ViewTab = "monitor" | "table" | "reports";

type OfficialRole = "BEO" | "DEO" | "Commissioner" | "Minister";
type ReportType = "Critical Alert" | "Category Summary" | "Full Infrastructure Report";
type ReportPriority = "Low" | "Medium" | "High" | "Urgent";
type ReportStatus = "Submitted" | "Acknowledged" | "In Progress" | "Resolved";

interface SchoolResource {
  id: string;
  schoolId: string;
  category: ResourceCategory;
  name: string;
  totalCount: number | null;
  functionalCount: number | null;
  status: ResourceStatus;
  remarks: string | null;
  lastAudited: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ResourceReport {
  id: string;
  schoolId: string;
  resourceId: string | null;
  category: ResourceCategory | null;
  recipientRole: OfficialRole;
  reportType: ReportType;
  priority: ReportPriority;
  subject: string;
  description: string | null;
  snapshot: any;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES: ResourceCategory[] = [
  "Classrooms",
  "Laboratories",
  "Computers",
  "Smart Classrooms",
  "Libraries",
  "Toilets",
  "Drinking Water",
  "Electricity",
  "Internet Facilities",
];

// Flaticon UIcons (regular-rounded set, loaded globally in layout.tsx)
const CATEGORY_META: Record<
  ResourceCategory,
  { icon: string; color: string; bg: string; border: string }
> = {
  Classrooms:           { icon: "fi fi-rr-school",          color: "text-blue-400",    bg: "bg-blue-500/18",    border: "border-blue-500/30" },
  Laboratories:         { icon: "fi fi-rr-flask",           color: "text-violet-400",  bg: "bg-violet-500/18",  border: "border-violet-500/30" },
  Computers:            { icon: "fi fi-rr-computer",        color: "text-cyan-400",    bg: "bg-cyan-500/18",    border: "border-cyan-500/30" },
  "Smart Classrooms":   { icon: "fi fi-rr-screen",          color: "text-indigo-400",  bg: "bg-indigo-500/18",  border: "border-indigo-500/30" },
  Libraries:            { icon: "fi fi-rr-book-alt",        color: "text-amber-400",   bg: "bg-amber-500/18",   border: "border-amber-500/30" },
  Toilets:              { icon: "fi fi-rr-restroom-simple", color: "text-teal-400",    bg: "bg-teal-500/18",    border: "border-teal-500/30" },
  "Drinking Water":     { icon: "fi fi-rr-raindrops",       color: "text-sky-400",     bg: "bg-sky-500/18",     border: "border-sky-500/30" },
  Electricity:          { icon: "fi fi-rr-bolt",            color: "text-yellow-400",  bg: "bg-yellow-500/18",  border: "border-yellow-500/30" },
  "Internet Facilities":{ icon: "fi fi-rr-wifi",            color: "text-emerald-400", bg: "bg-emerald-500/18", border: "border-emerald-500/30" },
};

const STATUS_META: Record<ResourceStatus, { badge: string; dot: string; row: string }> = {
  Excellent:      { badge: "badge-green",  dot: "bg-emerald-400", row: "text-emerald-400" },
  Good:           { badge: "badge-green",  dot: "bg-teal-400",    row: "text-teal-400" },
  "Needs Repair": { badge: "badge-yellow", dot: "bg-amber-400",   row: "text-amber-400" },
  Critical:       { badge: "badge-red",    dot: "bg-rose-500",    row: "text-rose-400" },
};

const PROGRESS_COLOR: Record<ResourceStatus, string> = {
  Excellent:      "bg-emerald-500",
  Good:           "bg-teal-400",
  "Needs Repair": "bg-amber-400",
  Critical:       "bg-rose-500",
};

// Escalation chain — lowest to highest authority
const OFFICIALS: {
  role: OfficialRole;
  title: string;
  desc: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  accent: string;
}[] = [
  {
    role: "BEO",
    title: "Block Educational Officer",
    desc: "First point of escalation — block-level infrastructure & repairs",
    icon: "fi fi-rr-briefcase",
    color: "text-sky-400", bg: "bg-sky-500/15", border: "border-sky-500/30", accent: "bg-sky-600",
  },
  {
    role: "DEO",
    title: "District Educational Officer",
    desc: "District-level sanctions, fund allocation & inspections",
    icon: "fi fi-rr-building",
    color: "text-violet-400", bg: "bg-violet-500/15", border: "border-violet-500/30", accent: "bg-violet-600",
  },
  {
    role: "Commissioner",
    title: "Commissioner of School Education",
    desc: "State directorate — policy, major projects & compliance",
    icon: "fi fi-rr-government-user",
    color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30", accent: "bg-amber-600",
  },
  {
    role: "Minister",
    title: "Minister for School Education",
    desc: "Highest authority — critical emergencies & special sanctions",
    icon: "fi fi-rr-landmark",
    color: "text-rose-400", bg: "bg-rose-500/15", border: "border-rose-500/30", accent: "bg-rose-600",
  },
];

const OFFICIAL_META = Object.fromEntries(OFFICIALS.map(o => [o.role, o])) as Record<OfficialRole, (typeof OFFICIALS)[number]>;

const REPORT_TYPES: { id: ReportType; icon: string; hint: string }[] = [
  { id: "Critical Alert",               icon: "fi fi-rr-triangle-warning", hint: "Urgent issue needing immediate action" },
  { id: "Category Summary",             icon: "fi fi-rr-clipboard-list",   hint: "Status report for one facility category" },
  { id: "Full Infrastructure Report",   icon: "fi fi-rr-chart-histogram",  hint: "Complete school infrastructure overview" },
];

const PRIORITY_META: Record<ReportPriority, { chip: string; dot: string }> = {
  Low:    { chip: "bg-slate-500/15 border-slate-500/30 text-slate-300",   dot: "bg-slate-400" },
  Medium: { chip: "bg-sky-500/15 border-sky-500/30 text-sky-300",         dot: "bg-sky-400" },
  High:   { chip: "bg-amber-500/15 border-amber-500/30 text-amber-300",   dot: "bg-amber-400" },
  Urgent: { chip: "bg-rose-500/15 border-rose-500/30 text-rose-300",      dot: "bg-rose-500" },
};

const REPORT_STATUS_FLOW: ReportStatus[] = ["Submitted", "Acknowledged", "In Progress", "Resolved"];

const REPORT_STATUS_META: Record<ReportStatus, { icon: string; color: string; bg: string; bar: string }> = {
  Submitted:     { icon: "fi fi-rr-paper-plane",   color: "text-blue-400",    bg: "bg-blue-500/15 border-blue-500/30",       bar: "bg-blue-500" },
  Acknowledged:  { icon: "fi fi-rr-envelope-open", color: "text-violet-400",  bg: "bg-violet-500/15 border-violet-500/30",   bar: "bg-violet-500" },
  "In Progress": { icon: "fi fi-rr-hourglass",     color: "text-amber-400",   bg: "bg-amber-500/15 border-amber-500/30",     bar: "bg-amber-500" },
  Resolved:      { icon: "fi fi-rr-check-circle",  color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30", bar: "bg-emerald-500" },
};

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const emptyForm = (cat: ResourceCategory = "Classrooms") => ({
  category: cat,
  name: "",
  totalCount: "",
  functionalCount: "",
  status: "Good" as ResourceStatus,
  remarks: "",
  lastAudited: "",
});

const emptyReportForm = () => ({
  recipientRole: "BEO" as OfficialRole,
  reportType: "Category Summary" as ReportType,
  category: "Classrooms" as ResourceCategory,
  priority: "Medium" as ReportPriority,
  subject: "",
  description: "",
  resourceId: null as string | null,
  subjectTouched: false,
});

const PLACEHOLDER: Record<ResourceCategory, string> = {
  Classrooms:            "e.g. Classroom 10A – Block B",
  Laboratories:          "e.g. Physics & Chemistry Lab",
  Computers:             "e.g. Computer Lab – Ground Floor",
  "Smart Classrooms":    "e.g. Smart Board Room 8B",
  Libraries:             "e.g. Central Library & Reading Room",
  Toilets:               "e.g. Girls Toilet Block – West Wing",
  "Drinking Water":      "e.g. RO Water Unit – Main Block",
  Electricity:           "e.g. Solar Panel Grid – Block A",
  "Internet Facilities": "e.g. Wi-Fi Zone – Admin Block",
};

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const getInitialDetailForm = (category: ResourceCategory) => {
  switch (category) {
    case "Classrooms":
      return { blackboards: "1", blackboardCondition: "Good", desksTotal: "", desksFunctional: "", chairsTotal: "", chairsFunctional: "", fansTotal: "", fansFunctional: "" };
    case "Laboratories":
      return { labType: "Science", safetyKits: "1", labEquipmentsStatus: "", chemicalsStock: "Adequate" };
    case "Computers":
      return { computersTotal: "", computersFunctional: "", projectorsTotal: "", projectorsFunctional: "", lanWorking: "Yes" };
    case "Smart Classrooms":
      return { smartBoardsTotal: "", smartBoardsFunctional: "", soundSystemWorking: "Yes", projectorCondition: "Good" };
    case "Libraries":
      return { booksCount: "", shelvesCount: "", readingTables: "" };
    case "Toilets":
      return { waterSupply: "Yes", flushFunctional: "Yes", cleaningFrequency: "Daily" };
    case "Drinking Water":
      return { roPurifiersTotal: "", roPurifiersFunctional: "", waterSource: "Borewell", tdsValue: "" };
    case "Electricity":
      return { powerSource: "Grid", batteryBackup: "Good", outageHours: "" };
    case "Internet Facilities":
      return { connectionType: "Fiber", speedMbps: "", routerWorking: "Yes" };
    default:
      return {};
  }
};

const getComputedCounts = (cat: ResourceCategory, det: any, formTotal: string, formFunc: string) => {
  let tc: number | null = formTotal !== "" ? Number(formTotal) : null;
  let fc: number | null = formFunc !== "" ? Number(formFunc) : null;
  
  switch (cat) {
    case "Classrooms":
      tc = (Number(det.desksTotal) || 0) + (Number(det.chairsTotal) || 0) + (Number(det.fansTotal) || 0);
      fc = (Number(det.desksFunctional) || 0) + (Number(det.chairsFunctional) || 0) + (Number(det.fansFunctional) || 0);
      if (tc === 0) { tc = null; fc = null; }
      break;
    case "Computers":
      tc = Number(det.computersTotal) || null;
      fc = Number(det.computersFunctional) || null;
      break;
    case "Smart Classrooms":
      tc = Number(det.smartBoardsTotal) || null;
      fc = Number(det.smartBoardsFunctional) || null;
      break;
    case "Drinking Water":
      tc = Number(det.roPurifiersTotal) || null;
      fc = Number(det.roPurifiersFunctional) || null;
      break;
  }
  return { totalCount: tc, functionalCount: fc };
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  const { data: session } = useSession();
  const schoolId: string = (session?.user as any)?.schoolId || "";
  const API_BASE = getApiBase();

  // State
  const [resources, setResources] = useState<SchoolResource[]>([]);
  const [reports, setReports] = useState<ResourceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<ViewTab>("monitor");
  const [filterCat, setFilterCat] = useState<"All" | ResourceCategory>("All");
  const [reportFilter, setReportFilter] = useState<"All" | OfficialRole>("All");

  // Resource modal
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<SchoolResource | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [details, setDetails] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!editTarget && showModal) {
      setDetails(getInitialDetailForm(form.category));
    }
  }, [form.category, editTarget, showModal]);

  // Report modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState(emptyReportForm());
  const [sendingReport, setSendingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<SchoolResource | null>(null);
  const [deleteReportTarget, setDeleteReportTarget] = useState<ResourceReport | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchResources = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    setError(null);
    try {
      const [resRes, repRes] = await Promise.all([
        fetch(`${API_BASE}/api/headmaster/school-resources?schoolId=${schoolId}`),
        fetch(`${API_BASE}/api/headmaster/resource-reports?schoolId=${schoolId}`),
      ]);
      const resJson = await resRes.json();
      const repJson = await repRes.json();
      if (resJson.success) setResources(resJson.data);
      else setError(resJson.error || "Failed to load resources.");
      if (repJson.success) setReports(repJson.data);
    } catch {
      setError("Network error. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  }, [schoolId, API_BASE]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const total       = resources.length;
  const functional  = resources.filter(r => r.status === "Excellent" || r.status === "Good").length;
  const needsRepair = resources.filter(r => r.status === "Needs Repair").length;
  const critical    = resources.filter(r => r.status === "Critical").length;
  const openReports = reports.filter(r => r.status !== "Resolved").length;

  // Overall infrastructure health (0–100)
  const healthScore = total === 0 ? null
    : Math.round(resources.reduce((acc, r) => acc +
        (r.status === "Excellent" ? 100 : r.status === "Good" ? 80 : r.status === "Needs Repair" ? 45 : 10), 0) / total);
  const healthColor = healthScore == null ? "text-slate-500"
    : healthScore >= 75 ? "text-emerald-400" : healthScore >= 50 ? "text-amber-400" : "text-rose-400";
  const healthStroke = healthScore == null ? "#64748b"
    : healthScore >= 75 ? "#34d399" : healthScore >= 50 ? "#fbbf24" : "#fb7185";

  const countOf = (cat: ResourceCategory) => resources.filter(r => r.category === cat).length;

  // ── Filtered lists ────────────────────────────────────────────────────────
  const tableRows = filterCat === "All" ? resources : resources.filter(r => r.category === filterCat);
  const reportRows = reportFilter === "All" ? reports : reports.filter(r => r.recipientRole === reportFilter);

  // Snapshot of live stats attached to every report sent
  const buildSnapshot = (cat: ResourceCategory | null) => {
    const snap: any = {
      capturedAt: new Date().toISOString(),
      totalResources: total,
      functional,
      needsRepair,
      critical,
      healthScore,
    };
    if (cat) {
      const items = resources.filter(r => r.category === cat);
      snap.category = {
        name: cat,
        records: items.length,
        totalCount: items.reduce((a, r) => a + (r.totalCount ?? 0), 0),
        functionalCount: items.reduce((a, r) => a + (r.functionalCount ?? 0), 0),
        critical: items.filter(r => r.status === "Critical").length,
      };
    }
    return snap;
  };

  // Auto-draft subject line from selections (until user edits it manually)
  const draftSubject = (f: typeof reportForm) => {
    if (f.reportType === "Full Infrastructure Report") return "Full Infrastructure Status Report – All Facilities";
    if (f.reportType === "Critical Alert") return `URGENT: ${f.category} – Critical condition, immediate action required`;
    return `${f.category} – Facility status summary & requirements`;
  };

  const effectiveSubject = reportForm.subjectTouched ? reportForm.subject : draftSubject(reportForm);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Resource modal helpers ────────────────────────────────────────────────
  const openAdd = (cat: ResourceCategory = "Classrooms") => {
    setEditTarget(null);
    setForm(emptyForm(cat));
    setDetails(getInitialDetailForm(cat));
    setSaveError(null);
    setShowModal(true);
  };

  const openEdit = (r: SchoolResource) => {
    setEditTarget(r);
    let parsedDetails = {};
    let userRemarks = r.remarks || "";
    if (r.remarks && r.remarks.startsWith("{")) {
      try {
        const parsed = JSON.parse(r.remarks);
        if (parsed.isDetailed) {
          parsedDetails = parsed.data || {};
          userRemarks = parsed.userRemarks || "";
        }
      } catch (e) {
        // Fallback if not JSON
      }
    }
    setForm({
      category: r.category,
      name: r.name,
      totalCount: r.totalCount != null ? String(r.totalCount) : "",
      functionalCount: r.functionalCount != null ? String(r.functionalCount) : "",
      status: r.status,
      remarks: userRemarks,
      lastAudited: r.lastAudited ? new Date(r.lastAudited).toISOString().split("T")[0] : "",
    });
    setDetails(parsedDetails);
    setSaveError(null);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditTarget(null); setDetails({}); setSaveError(null); };

  // ── Report modal helpers ──────────────────────────────────────────────────
  const openReport = (opts?: { recipient?: OfficialRole; resource?: SchoolResource; category?: ResourceCategory }) => {
    const base = emptyReportForm();
    if (opts?.recipient) base.recipientRole = opts.recipient;
    if (opts?.category) base.category = opts.category;
    if (opts?.resource) {
      base.category = opts.resource.category;
      base.resourceId = opts.resource.id;
      if (opts.resource.status === "Critical") {
        base.reportType = "Critical Alert";
        base.priority = "Urgent";
      } else if (opts.resource.status === "Needs Repair") {
        base.reportType = "Critical Alert";
        base.priority = "High";
      }
      base.description = `Regarding "${opts.resource.name}" (${opts.resource.category}) — current status: ${opts.resource.status}.` +
        (opts.resource.remarks ? ` Remarks: ${opts.resource.remarks}` : "");
    }
    setReportForm(base);
    setReportError(null);
    setShowReportModal(true);
  };

  const closeReportModal = () => { setShowReportModal(false); setReportError(null); };

  // ── Save resource ─────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) return;
    setSaving(true);
    setSaveError(null);

    const computed = getComputedCounts(form.category, details, form.totalCount, form.functionalCount);
    const payload = {
      schoolId,
      category: form.category,
      name: form.name.trim(),
      totalCount: computed.totalCount,
      functionalCount: computed.functionalCount,
      status: form.status,
      remarks: JSON.stringify({
        isDetailed: true,
        data: details,
        userRemarks: form.remarks.trim() || null
      }),
      lastAudited: form.lastAudited || null,
    };
    try {
      const url = editTarget
        ? `${API_BASE}/api/headmaster/school-resources/${editTarget.id}`
        : `${API_BASE}/api/headmaster/school-resources`;
      const res = await fetch(url, {
        method: editTarget ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        closeModal();
        await fetchResources();
        showToast(editTarget ? `✓ "${json.data.name}" updated.` : `✓ "${json.data.name}" added!`);
      } else {
        setSaveError(json.error || "Failed to save.");
      }
    } catch {
      setSaveError("Network error. Could not save.");
    } finally {
      setSaving(false);
    }
  };

  // ── Send report ───────────────────────────────────────────────────────────
  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) return;
    setSendingReport(true);
    setReportError(null);
    const isFull = reportForm.reportType === "Full Infrastructure Report";
    const payload = {
      schoolId,
      resourceId: reportForm.resourceId,
      category: isFull ? null : reportForm.category,
      recipientRole: reportForm.recipientRole,
      reportType: reportForm.reportType,
      priority: reportForm.priority,
      subject: effectiveSubject.trim(),
      description: reportForm.description.trim() || null,
      snapshot: buildSnapshot(isFull ? null : reportForm.category),
    };
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/resource-reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        closeReportModal();
        await fetchResources();
        setViewTab("reports");
        showToast(`📨 Report sent to ${OFFICIAL_META[reportForm.recipientRole].title}.`);
      } else {
        setReportError(json.error || "Failed to send report.");
      }
    } catch {
      setReportError("Network error. Could not send report.");
    } finally {
      setSendingReport(false);
    }
  };

  // ── Update report status ──────────────────────────────────────────────────
  const updateReportStatus = async (report: ResourceReport, status: ReportStatus) => {
    if (report.status === status) return;
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/resource-reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        setReports(prev => prev.map(r => (r.id === report.id ? json.data : r)));
        showToast(`✓ Report marked "${status}".`);
      } else {
        showToast(json.error || "Update failed.", "error");
      }
    } catch {
      showToast("Network error.", "error");
    }
  };

  // ── Deletes ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/school-resources/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setDeleteTarget(null);
        await fetchResources();
        showToast("🗑️ Resource deleted.");
      } else {
        showToast(json.error || "Delete failed.", "error");
        setDeleteTarget(null);
      }
    } catch {
      showToast("Network error.", "error");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!deleteReportTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/resource-reports/${deleteReportTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setReports(prev => prev.filter(r => r.id !== deleteReportTarget.id));
        showToast("🗑️ Report deleted.");
      } else {
        showToast(json.error || "Delete failed.", "error");
      }
    } catch {
      showToast("Network error.", "error");
    } finally {
      setDeleteReportTarget(null);
      setDeleting(false);
    }
  };

  const renderDetailFields = () => {
    const handleDetailChange = (key: string, val: string) => {
      setDetails((prev: any) => ({ ...prev, [key]: val }));
    };

    switch (form.category) {
      case "Classrooms":
        return (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] uppercase font-bold text-blue-400 tracking-wider mb-1">Classroom Audit Details</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Blackboard Count</label>
                <input
                  type="number" min="0"
                  value={details.blackboards || "0"}
                  onChange={e => handleDetailChange("blackboards", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Blackboard Condition</label>
                <select
                  value={details.blackboardCondition || "Good"}
                  onChange={e => handleDetailChange("blackboardCondition", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Needs Repair">Needs Repair</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Total Desks</label>
                <input
                  type="number" min="0"
                  value={details.desksTotal || ""}
                  onChange={e => handleDetailChange("desksTotal", e.target.value)}
                  placeholder="e.g. 30"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Functional Desks</label>
                <input
                  type="number" min="0"
                  value={details.desksFunctional || ""}
                  onChange={e => handleDetailChange("desksFunctional", e.target.value)}
                  placeholder="e.g. 28"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Total Chairs</label>
                <input
                  type="number" min="0"
                  value={details.chairsTotal || ""}
                  onChange={e => handleDetailChange("chairsTotal", e.target.value)}
                  placeholder="e.g. 30"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Functional Chairs</label>
                <input
                  type="number" min="0"
                  value={details.chairsFunctional || ""}
                  onChange={e => handleDetailChange("chairsFunctional", e.target.value)}
                  placeholder="e.g. 28"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Total Fans</label>
                <input
                  type="number" min="0"
                  value={details.fansTotal || ""}
                  onChange={e => handleDetailChange("fansTotal", e.target.value)}
                  placeholder="e.g. 4"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Functional Fans</label>
                <input
                  type="number" min="0"
                  value={details.fansFunctional || ""}
                  onChange={e => handleDetailChange("fansFunctional", e.target.value)}
                  placeholder="e.g. 4"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case "Laboratories":
        return (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] uppercase font-bold text-violet-400 tracking-wider mb-1">Laboratory Audit Details</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Lab Type</label>
                <select
                  value={details.labType || "Science"}
                  onChange={e => handleDetailChange("labType", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Science">Science (General)</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Safety Kits Count</label>
                <input
                  type="number" min="0"
                  value={details.safetyKits || "0"}
                  onChange={e => handleDetailChange("safetyKits", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] text-slate-400 font-bold mb-1">Equipment Condition Remarks</label>
              <input
                type="text"
                value={details.labEquipmentsStatus || ""}
                onChange={e => handleDetailChange("labEquipmentsStatus", e.target.value)}
                placeholder="e.g. Microscopes functional, test tubes stocked"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[9px] text-slate-400 font-bold mb-1">Chemicals & Consumables Stock</label>
              <select
                value={details.chemicalsStock || "Adequate"}
                onChange={e => handleDetailChange("chemicalsStock", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Adequate">Adequate Stock</option>
                <option value="Low">Low Stock (Needs Refill)</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="N/A">Not Applicable</option>
              </select>
            </div>
          </div>
        );

      case "Computers":
        return (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-1">Computer Lab Audit Details</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Total Computers</label>
                <input
                  type="number" min="0"
                  value={details.computersTotal || ""}
                  onChange={e => handleDetailChange("computersTotal", e.target.value)}
                  placeholder="e.g. 20"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Functional Computers</label>
                <input
                  type="number" min="0"
                  value={details.computersFunctional || ""}
                  onChange={e => handleDetailChange("computersFunctional", e.target.value)}
                  placeholder="e.g. 18"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Total Projectors</label>
                <input
                  type="number" min="0"
                  value={details.projectorsTotal || ""}
                  onChange={e => handleDetailChange("projectorsTotal", e.target.value)}
                  placeholder="e.g. 1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Functional Projectors</label>
                <input
                  type="number" min="0"
                  value={details.projectorsFunctional || ""}
                  onChange={e => handleDetailChange("projectorsFunctional", e.target.value)}
                  placeholder="e.g. 1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] text-slate-400 font-bold mb-1">LAN Network Working</label>
              <select
                value={details.lanWorking || "Yes"}
                onChange={e => handleDetailChange("lanWorking", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Yes">Yes, fully connected</option>
                <option value="Partial">Partial / Slow</option>
                <option value="No">No connection</option>
              </select>
            </div>
          </div>
        );

      case "Smart Classrooms":
        return (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider mb-1">Smart Classroom Audit Details</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Total Smart Boards</label>
                <input
                  type="number" min="0"
                  value={details.smartBoardsTotal || ""}
                  onChange={e => handleDetailChange("smartBoardsTotal", e.target.value)}
                  placeholder="e.g. 2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Functional Smart Boards</label>
                <input
                  type="number" min="0"
                  value={details.smartBoardsFunctional || ""}
                  onChange={e => handleDetailChange("smartBoardsFunctional", e.target.value)}
                  placeholder="e.g. 2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Audio System Working</label>
                <select
                  value={details.soundSystemWorking || "Yes"}
                  onChange={e => handleDetailChange("soundSystemWorking", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Projector Condition</label>
                <select
                  value={details.projectorCondition || "Good"}
                  onChange={e => handleDetailChange("projectorCondition", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Good">Good / Working</option>
                  <option value="Needs Repair">Needs Repair</option>
                  <option value="N/A">No Projector</option>
                </select>
              </div>
            </div>
          </div>
        );

      case "Libraries":
        return (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] uppercase font-bold text-amber-400 tracking-wider mb-1">Library Audit Details</h4>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Books Count</label>
                <input
                  type="number" min="0"
                  value={details.booksCount || ""}
                  onChange={e => handleDetailChange("booksCount", e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Shelves Count</label>
                <input
                  type="number" min="0"
                  value={details.shelvesCount || ""}
                  onChange={e => handleDetailChange("shelvesCount", e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Tables Count</label>
                <input
                  type="number" min="0"
                  value={details.readingTables || ""}
                  onChange={e => handleDetailChange("readingTables", e.target.value)}
                  placeholder="e.g. 4"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case "Toilets":
        return (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] uppercase font-bold text-teal-400 tracking-wider mb-1">Toilet Audit Details</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Running Water Supply</label>
                <select
                  value={details.waterSupply || "Yes"}
                  onChange={e => handleDetailChange("waterSupply", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Intermittent">Intermittent</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Flush Condition</label>
                <select
                  value={details.flushFunctional || "Yes"}
                  onChange={e => handleDetailChange("flushFunctional", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Yes">All Functional</option>
                  <option value="Partial">Some Need Repair</option>
                  <option value="No">Not Working</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[9px] text-slate-400 font-bold mb-1">Cleaning Frequency</label>
              <select
                value={details.cleaningFrequency || "Daily"}
                onChange={e => handleDetailChange("cleaningFrequency", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Twice Daily">Twice Daily</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Needs Cleaning">Needs Immediate Cleaning</option>
              </select>
            </div>
          </div>
        );

      case "Drinking Water":
        return (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] uppercase font-bold text-sky-400 tracking-wider mb-1">Drinking Water Audit Details</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Total RO Purifiers</label>
                <input
                  type="number" min="0"
                  value={details.roPurifiersTotal || ""}
                  onChange={e => handleDetailChange("roPurifiersTotal", e.target.value)}
                  placeholder="e.g. 2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Functional RO Purifiers</label>
                <input
                  type="number" min="0"
                  value={details.roPurifiersFunctional || ""}
                  onChange={e => handleDetailChange("roPurifiersFunctional", e.target.value)}
                  placeholder="e.g. 2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Water Source</label>
                <select
                  value={details.waterSource || "Borewell"}
                  onChange={e => handleDetailChange("waterSource", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Borewell">Borewell</option>
                  <option value="Corporation">Corporation Supply</option>
                  <option value="Water Tanker">Water Tanker</option>
                  <option value="Rainwater">Rainwater Harvesting</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">TDS Value (PPM)</label>
                <input
                  type="number" min="0"
                  value={details.tdsValue || ""}
                  onChange={e => handleDetailChange("tdsValue", e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case "Electricity":
        return (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] uppercase font-bold text-yellow-400 tracking-wider mb-1">Electricity Audit Details</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Primary Power Source</label>
                <select
                  value={details.powerSource || "Grid"}
                  onChange={e => handleDetailChange("powerSource", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Grid">State Grid (EB)</option>
                  <option value="Solar">Solar Panels</option>
                  <option value="Generator">Generator</option>
                  <option value="Hybrid">Hybrid (Grid + Solar)</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Backup Battery Condition</label>
                <select
                  value={details.batteryBackup || "Good"}
                  onChange={e => handleDetailChange("batteryBackup", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Needs Replacement">Needs Replacement</option>
                  <option value="No Backup">No Battery Backup</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[9px] text-slate-400 font-bold mb-1">Avg Daily Power Outage (Hours)</label>
              <input
                type="number" step="0.5" min="0"
                value={details.outageHours || ""}
                onChange={e => handleDetailChange("outageHours", e.target.value)}
                placeholder="e.g. 1.5"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        );

      case "Internet Facilities":
        return (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider mb-1">Internet Facility Details</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Connection Type</label>
                <select
                  value={details.connectionType || "Fiber"}
                  onChange={e => handleDetailChange("connectionType", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Fiber">Fiber Optic</option>
                  <option value="Broadband">DSL Broadband</option>
                  <option value="WiFi-Hotspot">Wi-Fi Hotspot (4G/5G)</option>
                  <option value="No Connection">No Connection</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] text-slate-400 font-bold mb-1">Internet Speed (Mbps)</label>
                <input
                  type="number" min="0"
                  value={details.speedMbps || ""}
                  onChange={e => handleDetailChange("speedMbps", e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] text-slate-400 font-bold mb-1">Main Router Status</label>
              <select
                value={details.routerWorking || "Yes"}
                onChange={e => handleDetailChange("routerWorking", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Yes">Working / Active</option>
                <option value="Needs Repair">Needs Repair / Replacement</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <PortalLayout
      title="School Resource Management"
      subtitle="Monitor · Infrastructure · Escalation to Officials"
      avatarLetter="R"
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      {/* ── Toast ──────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-2xl text-xs font-bold shadow-2xl border transition-all
          ${toast.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : "bg-rose-500/10 border-rose-500/30 text-rose-300"}`}>
          {toast.msg}
        </div>
      )}

      {/* ── KPI Strip + Health Ring ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {[
          { label: "Total Resources", value: total,       icon: "fi fi-rr-apps",             color: "text-blue-400",    glow: "from-blue-500/10" },
          { label: "Functional",      value: functional,  icon: "fi fi-rr-check-circle",     color: "text-emerald-400", glow: "from-emerald-500/10" },
          { label: "Needs Repair",    value: needsRepair, icon: "fi fi-rr-triangle-warning", color: "text-amber-400",   glow: "from-amber-500/10" },
          { label: "Critical",        value: critical,    icon: "fi fi-rr-exclamation",      color: "text-rose-400",    glow: "from-rose-500/10" },
          { label: "Open Reports",    value: openReports, icon: "fi fi-rr-paper-plane",      color: "text-violet-400",  glow: "from-violet-500/10" },
        ].map(k => (
          <div key={k.label}
            className={`relative overflow-hidden glass p-4 rounded-2xl border border-slate-800 bg-gradient-to-br ${k.glow} to-transparent transition-transform hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
              <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">{k.label}</p>
              <i className={`${k.icon} ${k.color} text-sm leading-none opacity-70`} aria-hidden />
            </div>
            <p className={`text-2xl sm:text-3xl font-black mt-1 ${k.color}`}>{loading ? "—" : k.value}</p>
          </div>
        ))}

        {/* Health ring */}
        <div className="relative glass p-3 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
          <div className="relative w-14 h-14">
            <svg viewBox="0 0 40 40" className="w-14 h-14 -rotate-90">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#1e293b" strokeWidth="5" />
              <circle
                cx="20" cy="20" r="16" fill="none"
                stroke={healthStroke} strokeWidth="5" strokeLinecap="round"
                strokeDasharray={`${((healthScore ?? 0) / 100) * 100.5} 100.5`}
                className="transition-all duration-700"
              />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-xs font-black ${healthColor}`}>
              {loading ? "—" : healthScore == null ? "–" : healthScore}
            </span>
          </div>
          <p className="text-[8px] uppercase font-bold text-slate-500 tracking-widest mt-1.5">Health Score</p>
        </div>
      </div>

      {/* ── 3×3 Category Grid ─────────────────────────────────────────── */}
      <div className="glass rounded-2xl border border-slate-800 p-4 sm:p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <i className="fi fi-rr-chart-histogram text-blue-400 leading-none" aria-hidden /> Category Overview
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Click any category to add a resource</p>
          </div>
          <div className="flex gap-2">
            <button
              id="btn-report-officials"
              onClick={() => openReport()}
              className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-[11px] font-bold transition-all active:scale-95"
            >
              <i className="fi fi-rr-bullhorn leading-none" aria-hidden /> <span className="hidden sm:inline">Report to</span> Officials
            </button>
            <button
              id="btn-add-resource"
              onClick={() => openAdd()}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold transition-all active:scale-95"
            >
              <span className="text-base leading-none">+</span> Add Resource
            </button>
          </div>
        </div>

        {/* 3 columns × 3 rows */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {CATEGORIES.map((cat) => {
            const m = CATEGORY_META[cat];
            const cnt = countOf(cat);
            const catCritical = resources.filter(r => r.category === cat && r.status === "Critical").length;
            return (
              <button
                key={cat}
                id={`cat-btn-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => openAdd(cat)}
                className={`group relative flex flex-col items-center justify-center gap-1.5 p-3 sm:p-4 rounded-2xl border transition-all duration-300 active:scale-95 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20
                  ${m.bg} ${m.border}`}
              >
                {/* Count / critical badge */}
                {cnt > 0 && (
                  <span className={`absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full border
                    ${catCritical > 0
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                      : `${m.bg} ${m.color} ${m.border}`}`}>
                    {catCritical > 0 ? `${catCritical} ⚠` : cnt}
                  </span>
                )}
                <i className={`${m.icon} text-xl sm:text-2xl leading-none ${m.color} transition-transform duration-300 group-hover:scale-110`} aria-hidden />
                <span className={`text-[9px] sm:text-[10px] font-bold text-center leading-tight ${m.color}`}>
                  {cat}
                </span>
                <span className="text-[9px] text-slate-500 font-semibold group-hover:text-slate-400 transition-colors">
                  {loading ? "…" : `${cnt} ${cnt === 1 ? "record" : "records"}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Bar ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-2xl mb-4 w-full sm:w-fit">
        {[
          { id: "monitor" as ViewTab, label: "Monitor",         icon: "fi fi-rr-grid" },
          { id: "table"   as ViewTab, label: "Total Resources", icon: "fi fi-rr-table-list" },
          { id: "reports" as ViewTab, label: "Official Reports",icon: "fi fi-rr-paper-plane", badge: openReports },
        ].map(t => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            onClick={() => setViewTab(t.id)}
            className={`relative flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all
              ${viewTab === t.id
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            <i className={`${t.icon} leading-none`} aria-hidden />
            <span>{t.label}</span>
            {t.badge != null && t.badge > 0 && (
              <span className="ml-1 min-w-[16px] h-4 px-1 rounded-full bg-violet-600 text-white text-[8px] font-black flex items-center justify-center">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Loading / Error ────────────────────────────────────────────── */}
      {loading && (
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-slate-500 text-sm">Loading resources…</p>
        </div>
      )}
      {!loading && error && (
        <div className="py-10 text-center">
          <p className="text-rose-400 text-sm mb-3">{error}</p>
          <button onClick={fetchResources} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold">Retry</button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          VIEW 1 — MONITOR (Card Grid)
      ══════════════════════════════════════════════════════════════════ */}
      {!loading && !error && viewTab === "monitor" && (
        <div className="glass rounded-2xl border border-slate-800 p-4 sm:p-6">
          {resources.length === 0 ? (
            <div className="py-16 text-center">
              <i className="fi fi-rr-house-building text-5xl text-slate-600 leading-none" aria-hidden />
              <p className="text-slate-400 font-semibold text-sm mb-1 mt-3">No resources recorded yet</p>
              <p className="text-slate-600 text-xs mb-4">Click any category above to add your first resource.</p>
              <button onClick={() => openAdd()} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold">+ Add First Resource</button>
            </div>
          ) : (
            <>
              <p className="text-[10px] text-slate-500 font-semibold mb-4">
                Showing {resources.length} resource{resources.length !== 1 ? "s" : ""} across all categories
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {resources.map(res => {
                  const m  = CATEGORY_META[res.category];
                  const sm = STATUS_META[res.status];
                  const pct = res.totalCount && res.functionalCount != null
                    ? Math.min(100, Math.round((res.functionalCount / res.totalCount) * 100))
                    : null;
                  const escalatable = res.status === "Critical" || res.status === "Needs Repair";
                  return (
                    <div key={res.id}
                      className={`group p-4 bg-slate-900/70 rounded-2xl border transition-all duration-200
                        ${res.status === "Critical" ? "border-rose-500/30 hover:border-rose-500/60" : "border-slate-800 hover:border-slate-700"}`}>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.bg} border ${m.border} shrink-0`}>
                            <i className={`${m.icon} text-base leading-none ${m.color}`} aria-hidden />
                          </div>
                          <div>
                            <span className={`text-[9px] font-extrabold uppercase ${m.color}`}>{res.category}</span>
                            <h3 className="text-xs font-bold text-white leading-snug line-clamp-1">{res.name}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`w-2 h-2 rounded-full ${sm.dot} ${res.status === "Critical" ? "animate-pulse" : ""}`} />
                          <span className={`badge ${sm.badge} text-[8px] whitespace-nowrap`}>{res.status}</span>
                        </div>
                      </div>

                      {/* Count + Progress */}
                      {pct !== null && (
                        <>
                          <div className="flex items-center justify-between mb-1.5 text-[10px]">
                            <span className="text-slate-500">
                              Functional: <span className="text-white font-bold">{res.functionalCount}</span> / <span className="text-slate-400">{res.totalCount}</span>
                            </span>
                            <span className={`font-black ${m.color}`}>{pct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                            <div
                              className={`h-full rounded-full ${PROGRESS_COLOR[res.status]} transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </>
                      )}
                      {res.totalCount != null && res.functionalCount == null && (
                        <p className="text-[10px] text-slate-500 mb-2">Total: <span className="text-white font-bold">{res.totalCount}</span></p>
                      )}

                      {/* Detailed Metadata or Remarks */}
                      {res.remarks && (() => {
                        let parsedRemarks = res.remarks;
                        let detailTags: string[] = [];
                        if (res.remarks.startsWith("{")) {
                          try {
                            const parsed = JSON.parse(res.remarks);
                            if (parsed.isDetailed) {
                              parsedRemarks = parsed.userRemarks || "";
                              const det = parsed.data || {};
                              if (res.category === "Classrooms") {
                                if (det.blackboards) detailTags.push(`Blackboards: ${det.blackboards} (${det.blackboardCondition || "Good"})`);
                                if (det.desksTotal) detailTags.push(`Desks: ${det.desksFunctional || 0}/${det.desksTotal}`);
                                if (det.chairsTotal) detailTags.push(`Chairs: ${det.chairsFunctional || 0}/${det.chairsTotal}`);
                                if (det.fansTotal) detailTags.push(`Fans: ${det.fansFunctional || 0}/${det.fansTotal}`);
                              } else if (res.category === "Laboratories") {
                                detailTags.push(`Type: ${det.labType || "Science"}`);
                                if (det.safetyKits) detailTags.push(`Safety Kits: ${det.safetyKits}`);
                                if (det.labEquipmentsStatus) detailTags.push(`Equip: ${det.labEquipmentsStatus}`);
                                if (det.chemicalsStock) detailTags.push(`Chemicals: ${det.chemicalsStock}`);
                              } else if (res.category === "Computers") {
                                if (det.computersTotal) detailTags.push(`PCs: ${det.computersFunctional || 0}/${det.computersTotal}`);
                                if (det.projectorsTotal) detailTags.push(`Proj: ${det.projectorsFunctional || 0}/${det.projectorsTotal}`);
                                if (det.lanWorking) detailTags.push(`LAN: ${det.lanWorking}`);
                              } else if (res.category === "Smart Classrooms") {
                                if (det.smartBoardsTotal) detailTags.push(`Boards: ${det.smartBoardsFunctional || 0}/${det.smartBoardsTotal}`);
                                if (det.soundSystemWorking) detailTags.push(`Audio: ${det.soundSystemWorking === "Yes" ? "Working" : "No"}`);
                                if (det.projectorCondition) detailTags.push(`Proj: ${det.projectorCondition}`);
                              } else if (res.category === "Libraries") {
                                if (det.booksCount) detailTags.push(`Books: ${det.booksCount}`);
                                if (det.shelvesCount) detailTags.push(`Shelves: ${det.shelvesCount}`);
                                if (det.readingTables) detailTags.push(`Tables: ${det.readingTables}`);
                              } else if (res.category === "Toilets") {
                                detailTags.push(`Water: ${det.waterSupply}`);
                                detailTags.push(`Flush: ${det.flushFunctional}`);
                                detailTags.push(`Clean: ${det.cleaningFrequency}`);
                              } else if (res.category === "Drinking Water") {
                                if (det.roPurifiersTotal) detailTags.push(`RO: ${det.roPurifiersFunctional || 0}/${det.roPurifiersTotal}`);
                                if (det.waterSource) detailTags.push(`Source: ${det.waterSource}`);
                                if (det.tdsValue) detailTags.push(`TDS: ${det.tdsValue} ppm`);
                              } else if (res.category === "Electricity") {
                                detailTags.push(`Source: ${det.powerSource}`);
                                detailTags.push(`Backup: ${det.batteryBackup}`);
                                if (det.outageHours) detailTags.push(`Outage: ${det.outageHours}h/d`);
                              } else if (res.category === "Internet Facilities") {
                                detailTags.push(`Type: ${det.connectionType}`);
                                if (det.speedMbps) detailTags.push(`Speed: ${det.speedMbps} Mbps`);
                                if (det.routerWorking) detailTags.push(`Router: ${det.routerWorking === "Yes" ? "OK" : "Repair"}`);
                              }
                            }
                          } catch (e) {}
                        }
                        return (
                          <div className="space-y-1.5 mb-2">
                            {detailTags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {detailTags.map((tag, idx) => (
                                  <span key={idx} className="bg-slate-950 text-[8px] font-bold text-slate-400 px-1.5 py-0.5 rounded-md border border-slate-800">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            {parsedRemarks && (
                              <p className="text-[10px] text-slate-500 italic line-clamp-2">"{parsedRemarks}"</p>
                            )}
                          </div>
                        );
                      })()}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800 mt-2">
                        <span className="text-[9px] text-slate-600 font-semibold">
                          {res.lastAudited ? `Audited ${fmtDate(res.lastAudited)}` : "No audit date"}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {escalatable && (
                            <button
                              onClick={() => openReport({ resource: res })}
                              title="Escalate to higher officials"
                              className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold bg-slate-800 hover:bg-violet-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                            ><i className="fi fi-rr-bullhorn leading-none" aria-hidden /> Escalate</button>
                          )}
                          <button
                            onClick={() => openEdit(res)}
                            className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                          ><i className="fi fi-rr-pencil leading-none" aria-hidden /> Edit</button>
                          <button
                            onClick={() => setDeleteTarget(res)}
                            className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                          ><i className="fi fi-rr-trash leading-none" aria-hidden /> Del</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          VIEW 2 — TOTAL RESOURCES TABLE
      ══════════════════════════════════════════════════════════════════ */}
      {!loading && !error && viewTab === "table" && (
        <div className="glass rounded-2xl border border-slate-800 overflow-hidden">
          {/* Table toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <i className="fi fi-rr-table-list text-blue-400 leading-none" aria-hidden /> Total Resources
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">{tableRows.length} record{tableRows.length !== 1 ? "s" : ""}</p>
            </div>
            {/* Category filter */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setFilterCat("All")}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all
                  ${filterCat === "All" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
              >All</button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all
                    ${filterCat === cat ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                >
                  <i className={`${CATEGORY_META[cat].icon} text-[10px] leading-none`} aria-hidden />
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Responsive table */}
          {tableRows.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-slate-500 text-sm">No resources found for selected category.</p>
              <button onClick={() => openAdd()} className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold">+ Add Resource</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-800">
                    {["#", "Category", "Name", "Total", "Functional", "%", "Status", "Last Audit", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[9px] uppercase font-bold text-slate-500 tracking-widest whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((res, idx) => {
                    const m  = CATEGORY_META[res.category];
                    const sm = STATUS_META[res.status];
                    const pct = res.totalCount && res.functionalCount != null
                      ? Math.min(100, Math.round((res.functionalCount / res.totalCount) * 100))
                      : null;
                    return (
                      <tr key={res.id}
                        className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors group">
                        {/* # */}
                        <td className="px-4 py-3 text-[11px] text-slate-600 font-semibold">{idx + 1}</td>

                        {/* Category */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center ${m.bg} border ${m.border}`}>
                              <i className={`${m.icon} text-[11px] leading-none ${m.color}`} aria-hidden />
                            </span>
                            <span className={`text-[10px] font-bold ${m.color} whitespace-nowrap`}>{res.category}</span>
                          </div>
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold text-white max-w-[180px] block truncate">{res.name}</span>
                          {res.remarks && (() => {
                            let parsedRemarks = res.remarks;
                            let subDetails = "";
                            if (res.remarks.startsWith("{")) {
                              try {
                                const parsed = JSON.parse(res.remarks);
                                if (parsed.isDetailed) {
                                  parsedRemarks = parsed.userRemarks || "";
                                  const det = parsed.data || {};
                                  const parts = [];
                                  if (res.category === "Classrooms") {
                                    if (det.blackboards) parts.push(`Blackboards: ${det.blackboards}`);
                                    if (det.desksTotal) parts.push(`Desks: ${det.desksFunctional || 0}/${det.desksTotal}`);
                                  } else if (res.category === "Computers" && det.computersTotal) {
                                    parts.push(`PCs: ${det.computersFunctional || 0}/${det.computersTotal}`);
                                  } else if (res.category === "Toilets") {
                                    parts.push(`Water: ${det.waterSupply}`);
                                  } else if (res.category === "Internet Facilities") {
                                    parts.push(`Type: ${det.connectionType}`);
                                  } else if (res.category === "Drinking Water" && det.roPurifiersTotal) {
                                    parts.push(`RO: ${det.roPurifiersFunctional || 0}/${det.roPurifiersTotal}`);
                                  }
                                  subDetails = parts.join(" | ");
                                }
                              } catch(e) {}
                            }
                            return (
                              <span className="text-[9px] text-slate-500 italic block truncate max-w-[180px]">
                                {subDetails ? `${subDetails}${parsedRemarks ? ` — ${parsedRemarks}` : ""}` : parsedRemarks}
                              </span>
                            );
                          })()}
                        </td>

                        {/* Total */}
                        <td className="px-4 py-3 text-xs font-bold text-slate-300">{res.totalCount ?? "—"}</td>

                        {/* Functional */}
                        <td className="px-4 py-3 text-xs font-bold text-emerald-400">{res.functionalCount ?? "—"}</td>

                        {/* % + mini bar */}
                        <td className="px-4 py-3">
                          {pct !== null ? (
                            <div className="flex flex-col gap-1 min-w-[48px]">
                              <span className={`text-[10px] font-black ${m.color}`}>{pct}%</span>
                              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${PROGRESS_COLOR[res.status]}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          ) : <span className="text-slate-600 text-[10px]">—</span>}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
                            <span className={`text-[10px] font-bold ${sm.row} whitespace-nowrap`}>{res.status}</span>
                          </div>
                        </td>

                        {/* Last Audit */}
                        <td className="px-4 py-3 text-[10px] text-slate-500 whitespace-nowrap">
                          {fmtDate(res.lastAudited)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {(res.status === "Critical" || res.status === "Needs Repair") && (
                              <button
                                onClick={() => openReport({ resource: res })}
                                title="Escalate to higher officials"
                                className="px-2 py-1 text-[9px] font-bold bg-slate-800 hover:bg-violet-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                              ><i className="fi fi-rr-bullhorn leading-none" aria-hidden /></button>
                            )}
                            <button
                              onClick={() => openEdit(res)}
                              className="px-2.5 py-1 text-[9px] font-bold bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition-colors whitespace-nowrap"
                            >Edit</button>
                            <button
                              onClick={() => setDeleteTarget(res)}
                              className="px-2.5 py-1 text-[9px] font-bold bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                            >Del</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table footer summary */}
          {tableRows.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-t border-slate-800 bg-slate-900/40">
              <span className="text-[10px] text-slate-500 font-semibold">
                {tableRows.length} record{tableRows.length !== 1 ? "s" : ""}
              </span>
              {(["Excellent", "Good", "Needs Repair", "Critical"] as ResourceStatus[]).map(s => {
                const cnt = tableRows.filter(r => r.status === s).length;
                if (!cnt) return null;
                return (
                  <span key={s} className={`flex items-center gap-1 text-[10px] font-bold ${STATUS_META[s].row}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[s].dot}`} />
                    {s}: {cnt}
                  </span>
                );
              })}
              <button
                onClick={() => openAdd()}
                className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold transition-colors"
              >+ Add</button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          VIEW 3 — OFFICIAL REPORTS (BEO / DEO / Commissioner / Minister)
      ══════════════════════════════════════════════════════════════════ */}
      {!loading && !error && viewTab === "reports" && (
        <div className="space-y-5">

          {/* Escalation chain */}
          <div className="glass rounded-2xl border border-slate-800 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <i className="fi fi-rr-government-flag text-violet-400 leading-none" aria-hidden /> Escalation Chain
                </h2>
                <p className="text-[10px] text-slate-500 mt-0.5">Click an official to send them a report directly</p>
              </div>
              <button
                id="btn-new-report"
                onClick={() => openReport()}
                className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-[11px] font-bold transition-all active:scale-95"
              >
                <i className="fi fi-rr-paper-plane leading-none" aria-hidden /> New Report
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {OFFICIALS.map((o, i) => {
                const sent = reports.filter(r => r.recipientRole === o.role).length;
                const open = reports.filter(r => r.recipientRole === o.role && r.status !== "Resolved").length;
                return (
                  <button
                    key={o.role}
                    id={`official-${o.role.toLowerCase()}`}
                    onClick={() => openReport({ recipient: o.role })}
                    className={`group relative text-left p-4 rounded-2xl border transition-all duration-300 active:scale-95 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 ${o.bg} ${o.border}`}
                  >
                    {/* Chain step number */}
                    <span className="absolute top-3 right-3 text-[9px] font-black text-slate-600">
                      {i < OFFICIALS.length - 1 ? `LEVEL ${i + 1} →` : `LEVEL ${i + 1}`}
                    </span>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${o.bg} border ${o.border} mb-2.5`}>
                      <i className={`${o.icon} text-lg leading-none ${o.color} transition-transform duration-300 group-hover:scale-110`} aria-hidden />
                    </div>
                    <p className={`text-xs font-black ${o.color}`}>{o.role}</p>
                    <p className="text-[10px] font-bold text-white leading-tight mt-0.5">{o.title}</p>
                    <p className="text-[9px] text-slate-500 leading-snug mt-1.5 line-clamp-2">{o.desc}</p>
                    <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-800/70">
                      <span className="text-[9px] text-slate-500 font-semibold">{sent} sent</span>
                      {open > 0 && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${o.bg} ${o.color} border ${o.border}`}>
                          {open} open
                        </span>
                      )}
                      <i className={`fi fi-rr-arrow-up-right ml-auto text-[10px] leading-none ${o.color} opacity-0 group-hover:opacity-100 transition-opacity`} aria-hidden />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Report history */}
          <div className="glass rounded-2xl border border-slate-800 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-slate-800">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <i className="fi fi-rr-inbox-out text-violet-400 leading-none" aria-hidden /> Report History
                </h2>
                <p className="text-[10px] text-slate-500 mt-0.5">{reportRows.length} report{reportRows.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setReportFilter("All")}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all
                    ${reportFilter === "All" ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                >All</button>
                {OFFICIALS.map(o => (
                  <button
                    key={o.role}
                    onClick={() => setReportFilter(o.role)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all
                      ${reportFilter === o.role ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                  >
                    <i className={`${o.icon} text-[10px] leading-none`} aria-hidden />
                    <span>{o.role}</span>
                  </button>
                ))}
              </div>
            </div>

            {reportRows.length === 0 ? (
              <div className="py-14 text-center">
                <i className="fi fi-rr-envelope text-4xl text-slate-600 leading-none" aria-hidden />
                <p className="text-slate-400 font-semibold text-sm mt-3 mb-1">No reports sent yet</p>
                <p className="text-slate-600 text-xs mb-4">Escalate infrastructure issues to BEO, DEO, Commissioner or Minister.</p>
                <button onClick={() => openReport()} className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold">
                  Send First Report
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {reportRows.map(rep => {
                  const off = OFFICIAL_META[rep.recipientRole];
                  const pm = PRIORITY_META[rep.priority] ?? PRIORITY_META.Medium;
                  const stIdx = REPORT_STATUS_FLOW.indexOf(rep.status);
                  const catMeta = rep.category ? CATEGORY_META[rep.category] : null;
                  return (
                    <div key={rep.id} className="p-4 sm:p-5 hover:bg-slate-800/20 transition-colors group">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-3">
                        {/* Recipient avatar */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${off.bg} border ${off.border} shrink-0`}>
                          <i className={`${off.icon} text-base leading-none ${off.color}`} aria-hidden />
                        </div>

                        {/* Body */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className={`text-[10px] font-black ${off.color}`}>{rep.recipientRole}</span>
                            <span className="text-[9px] text-slate-600">·</span>
                            <span className="text-[9px] text-slate-500 font-semibold">{off.title}</span>
                            <span className={`ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[8px] font-black ${pm.chip}`}>
                              <span className={`w-1 h-1 rounded-full ${pm.dot}`} /> {rep.priority.toUpperCase()}
                            </span>
                            {catMeta && rep.category && (
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[8px] font-bold ${catMeta.bg} ${catMeta.border} ${catMeta.color}`}>
                                <i className={`${catMeta.icon} text-[8px] leading-none`} aria-hidden /> {rep.category}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-white leading-snug">{rep.subject}</p>
                          {rep.description && (
                            <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{rep.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 mt-1.5">
                            <span className="text-[9px] text-slate-600 font-semibold flex items-center gap-1">
                              <i className="fi fi-rr-calendar-clock leading-none" aria-hidden /> {fmtDate(rep.createdAt)}
                            </span>
                            <span className="text-[9px] text-slate-600 font-semibold">{rep.reportType}</span>
                            {rep.snapshot?.healthScore != null && (
                              <span className="text-[9px] text-slate-600 font-semibold">Health at send: {rep.snapshot.healthScore}/100</span>
                            )}
                          </div>
                        </div>

                        {/* Status stepper + actions */}
                        <div className="lg:w-64 shrink-0">
                          <div className="flex items-center gap-1 mb-1.5">
                            {REPORT_STATUS_FLOW.map((s, i) => {
                              const meta = REPORT_STATUS_META[s];
                              const active = i <= stIdx;
                              return (
                                <React.Fragment key={s}>
                                  {i > 0 && <span className={`flex-1 h-0.5 rounded ${i <= stIdx ? meta.bar : "bg-slate-800"}`} />}
                                  <button
                                    onClick={() => updateReportStatus(rep, s)}
                                    title={`Mark as ${s}`}
                                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all active:scale-90
                                      ${active ? `${meta.bg} ${meta.color}` : "bg-slate-900 border-slate-700 text-slate-600 hover:border-slate-500"}`}
                                  >
                                    <i className={`${meta.icon} text-[9px] leading-none`} aria-hidden />
                                  </button>
                                </React.Fragment>
                              );
                            })}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-black ${REPORT_STATUS_META[rep.status]?.color ?? "text-slate-400"}`}>
                              <i className={`${REPORT_STATUS_META[rep.status]?.icon ?? "fi fi-rr-info"} leading-none`} aria-hidden />
                              {rep.status}
                            </span>
                            <button
                              onClick={() => setDeleteReportTarget(rep)}
                              className="opacity-0 group-hover:opacity-100 px-2 py-1 text-[9px] font-bold bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white rounded-lg transition-all"
                            ><i className="fi fi-rr-trash leading-none" aria-hidden /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          ADD / EDIT RESOURCE MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full sm:max-w-lg bg-slate-950 border border-slate-800 sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <i className={`${editTarget ? "fi fi-rr-pencil" : "fi fi-rr-apps"} text-blue-400 leading-none`} aria-hidden />
                  {editTarget ? "Edit Resource" : `Add ${form.category}`}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {editTarget ? "Update resource details below." : "Fill in the details for this infrastructure item."}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors shrink-0"
              >✕</button>
            </div>

            {/* Scrollable form body */}
            <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto flex-1">

              {/* Category — 3×3 grid */}
              {!editTarget && (
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {CATEGORIES.map(cat => {
                      const m = CATEGORY_META[cat];
                      const sel = form.category === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, category: cat }))}
                          className={`group flex flex-col items-center justify-center gap-1.5 py-3.5 px-1 rounded-2xl border text-center transition-all duration-300 active:scale-95 hover:scale-[1.03]
                            ${sel
                              ? `${m.bg} ${m.border} ${m.color} ring-2 ring-blue-500/25 font-extrabold shadow-md shadow-black/10`
                              : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300"}`}
                        >
                          <i className={`${m.icon} text-lg leading-none transition-transform duration-300 ${sel ? m.color : "text-slate-500 group-hover:scale-110"}`} aria-hidden />
                          <span className="text-[9px] font-bold leading-tight">{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  Name / Label <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-resource-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={PLACEHOLDER[form.category]}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Custom Details */}
              {renderDetailFields()}

              {/* Counts */}
              {!["Classrooms", "Computers", "Smart Classrooms", "Drinking Water"].includes(form.category) && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Total Count</label>
                    <input
                      id="input-total-count"
                      type="number" min="0"
                      value={form.totalCount}
                      onChange={e => setForm(f => ({ ...f, totalCount: e.target.value }))}
                      placeholder="e.g. 40"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Functional</label>
                    <input
                      id="input-functional-count"
                      type="number" min="0"
                      value={form.functionalCount}
                      onChange={e => setForm(f => ({ ...f, functionalCount: e.target.value }))}
                      placeholder="e.g. 36"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Status</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(["Excellent", "Good", "Needs Repair", "Critical"] as ResourceStatus[]).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, status: s }))}
                      className={`py-2 rounded-xl border text-[10px] font-bold transition-all
                        ${form.status === s
                          ? s === "Critical"    ? "bg-rose-600/20 border-rose-500/50 text-rose-300"
                          : s === "Needs Repair"? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                          : "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                          : "bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300"}`}
                    >{s}</button>
                  ))}
                </div>
              </div>

              {/* Audit date + Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Last Audit Date</label>
                  <input
                    id="input-last-audited"
                    type="date"
                    value={form.lastAudited}
                    onChange={e => setForm(f => ({ ...f, lastAudited: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Remarks</label>
                  <input
                    id="input-remarks"
                    type="text"
                    value={form.remarks}
                    onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                    placeholder="Optional notes…"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {saveError && (
                <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">{saveError}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1 pb-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                >Cancel</button>
                <button
                  id="btn-save-resource"
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  {saving ? "Saving…" : editTarget ? "Save Changes" : "Add Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SEND REPORT MODAL (→ BEO / DEO / Commissioner / Minister)
      ══════════════════════════════════════════════════════════════════ */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full sm:max-w-xl bg-slate-950 border border-slate-800 sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <i className="fi fi-rr-bullhorn text-violet-400 leading-none" aria-hidden /> Report to Higher Officials
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Escalate infrastructure needs up the chain — BEO → DEO → Commissioner → Minister
                </p>
              </div>
              <button
                onClick={closeReportModal}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors shrink-0"
              >✕</button>
            </div>

            <form onSubmit={handleSendReport} className="p-5 space-y-4 overflow-y-auto flex-1">

              {/* Recipient */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                  Send To <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {OFFICIALS.map(o => {
                    const sel = reportForm.recipientRole === o.role;
                    return (
                      <button
                        key={o.role}
                        type="button"
                        id={`recipient-${o.role.toLowerCase()}`}
                        onClick={() => setReportForm(f => ({ ...f, recipientRole: o.role }))}
                        className={`group flex flex-col items-center justify-center gap-1 py-3 px-1 rounded-2xl border text-center transition-all duration-300 active:scale-95 hover:scale-[1.03]
                          ${sel
                            ? `${o.bg} ${o.border} ${o.color} ring-2 ring-violet-500/25 shadow-md shadow-black/10`
                            : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300"}`}
                      >
                        <i className={`${o.icon} text-lg leading-none transition-transform duration-300 ${sel ? o.color : "text-slate-500 group-hover:scale-110"}`} aria-hidden />
                        <span className="text-[10px] font-black leading-tight">{o.role}</span>
                        <span className="text-[8px] font-semibold leading-tight opacity-80 line-clamp-1 px-0.5">{o.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Report type */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Report Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {REPORT_TYPES.map(t => {
                    const sel = reportForm.reportType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setReportForm(f => ({ ...f, reportType: t.id }))}
                        className={`flex items-center sm:flex-col sm:items-start gap-2 sm:gap-1 p-2.5 rounded-xl border text-left transition-all
                          ${sel
                            ? "bg-violet-500/15 border-violet-500/40 text-violet-300"
                            : "bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300"}`}
                      >
                        <i className={`${t.icon} text-sm leading-none shrink-0`} aria-hidden />
                        <span>
                          <span className="block text-[10px] font-bold leading-tight">{t.id}</span>
                          <span className="block text-[8px] opacity-70 leading-tight mt-0.5">{t.hint}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category (hidden for full report) */}
              {reportForm.reportType !== "Full Infrastructure Report" && (
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Facility Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map(cat => {
                      const m = CATEGORY_META[cat];
                      const sel = reportForm.category === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setReportForm(f => ({ ...f, category: cat, resourceId: null }))}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[9px] font-bold transition-all
                            ${sel ? `${m.bg} ${m.border} ${m.color}` : "bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-600"}`}
                        >
                          <i className={`${m.icon} text-[10px] leading-none`} aria-hidden /> {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Priority */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Priority</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(Object.keys(PRIORITY_META) as ReportPriority[]).map(p => {
                    const pm = PRIORITY_META[p];
                    const sel = reportForm.priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setReportForm(f => ({ ...f, priority: p }))}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-[10px] font-bold transition-all
                          ${sel ? pm.chip : "bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300"}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${pm.dot}`} /> {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  Subject <span className="text-rose-500">*</span>
                  <span className="normal-case font-semibold text-slate-600 ml-1.5">(auto-drafted — edit freely)</span>
                </label>
                <input
                  id="input-report-subject"
                  type="text"
                  required
                  value={effectiveSubject}
                  onChange={e => setReportForm(f => ({ ...f, subject: e.target.value, subjectTouched: true }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Details / Justification</label>
                <textarea
                  id="input-report-description"
                  rows={3}
                  value={reportForm.description}
                  onChange={e => setReportForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the issue, funds required, number of students affected…"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                />
              </div>

              {/* Auto-attached snapshot preview */}
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-2 flex items-center gap-1.5">
                  <i className="fi fi-rr-memo-circle-check text-emerald-400 leading-none" aria-hidden /> Live data attached automatically
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="text-[10px] text-slate-400"><b className="text-white">{total}</b> resources</span>
                  <span className="text-[10px] text-emerald-400"><b>{functional}</b> functional</span>
                  <span className="text-[10px] text-amber-400"><b>{needsRepair}</b> need repair</span>
                  <span className="text-[10px] text-rose-400"><b>{critical}</b> critical</span>
                  {healthScore != null && <span className={`text-[10px] ${healthColor}`}>health <b>{healthScore}/100</b></span>}
                  {reportForm.reportType !== "Full Infrastructure Report" && (
                    <span className="text-[10px] text-slate-400">
                      <b className="text-white">{countOf(reportForm.category)}</b> {reportForm.category} record{countOf(reportForm.category) !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              {reportError && (
                <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">{reportError}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1 pb-1">
                <button
                  type="button"
                  onClick={closeReportModal}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                >Cancel</button>
                <button
                  id="btn-send-report"
                  type="submit"
                  disabled={sendingReport}
                  className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <i className="fi fi-rr-paper-plane leading-none" aria-hidden />
                  {sendingReport ? "Sending…" : `Send to ${reportForm.recipientRole}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          DELETE CONFIRM — RESOURCE
      ══════════════════════════════════════════════════════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full sm:max-w-sm bg-slate-950 border border-rose-500/30 sm:rounded-3xl rounded-t-3xl shadow-2xl p-6">
            <div className="text-center mb-3"><i className="fi fi-rr-trash text-4xl text-rose-400 leading-none" aria-hidden /></div>
            <h3 className="text-sm font-bold text-white text-center mb-1">Delete Resource?</h3>
            <p className="text-xs text-slate-300 font-semibold text-center mb-1">"{deleteTarget.name}"</p>
            <p className="text-[10px] text-slate-500 text-center mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >Cancel</button>
              <button
                id="btn-confirm-delete"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs"
              >
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          DELETE CONFIRM — REPORT
      ══════════════════════════════════════════════════════════════════ */}
      {deleteReportTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full sm:max-w-sm bg-slate-950 border border-rose-500/30 sm:rounded-3xl rounded-t-3xl shadow-2xl p-6">
            <div className="text-center mb-3"><i className="fi fi-rr-trash text-4xl text-rose-400 leading-none" aria-hidden /></div>
            <h3 className="text-sm font-bold text-white text-center mb-1">Delete Report?</h3>
            <p className="text-xs text-slate-300 font-semibold text-center mb-1 line-clamp-2">"{deleteReportTarget.subject}"</p>
            <p className="text-[10px] text-slate-500 text-center mb-5">Sent to {deleteReportTarget.recipientRole}. This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteReportTarget(null)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >Cancel</button>
              <button
                id="btn-confirm-delete-report"
                onClick={handleDeleteReport}
                disabled={deleting}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs"
              >
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </PortalLayout>
  );
}
