"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import {
  School,
  FlaskConical,
  Laptop,
  Tv,
  Library,
  Bath,
  Droplet,
  Zap,
  Wifi,
  Trash2,
  Edit2
} from "lucide-react";

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
type ViewTab = "monitor" | "table";

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

const CATEGORY_META: Record<
  ResourceCategory,
  { icon: React.ComponentType<any>; color: string; bg: string; border: string }
> = {
  Classrooms:           { icon: School,       color: "text-blue-400",     bg: "bg-blue-500/18",     border: "border-blue-500/30" },
  Laboratories:         { icon: FlaskConical, color: "text-violet-400",   bg: "bg-violet-500/18",   border: "border-violet-500/30" },
  Computers:            { icon: Laptop,       color: "text-cyan-400",     bg: "bg-cyan-500/18",     border: "border-cyan-500/30" },
  "Smart Classrooms":   { icon: Tv,           color: "text-indigo-400",   bg: "bg-indigo-500/18",   border: "border-indigo-500/30" },
  Libraries:            { icon: Library,      color: "text-amber-400",    bg: "bg-amber-500/18",    border: "border-amber-500/30" },
  Toilets:              { icon: Bath,         color: "text-teal-400",     bg: "bg-teal-500/18",     border: "border-teal-500/30" },
  "Drinking Water":     { icon: Droplet,      color: "text-sky-400",      bg: "bg-sky-500/18",      border: "border-sky-500/30" },
  Electricity:          { icon: Zap,          color: "text-yellow-400",   bg: "bg-yellow-500/18",   border: "border-yellow-500/30" },
  "Internet Facilities":{ icon: Wifi,         color: "text-emerald-400",  bg: "bg-emerald-500/18",  border: "border-emerald-500/30" },
};

const STATUS_META: Record<
  ResourceStatus,
  { badge: string; dot: string; row: string }
> = {
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  const { data: session } = useSession();
  const schoolId: string = (session?.user as any)?.schoolId || "";
  const API_BASE = getApiBase();

  // State
  const [resources, setResources] = useState<SchoolResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<ViewTab>("monitor");
  const [filterCat, setFilterCat] = useState<"All" | ResourceCategory>("All");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<SchoolResource | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<SchoolResource | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchResources = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/school-resources?schoolId=${schoolId}`);
      const json = await res.json();
      if (json.success) setResources(json.data);
      else setError(json.error || "Failed to load resources.");
    } catch {
      setError("Network error. Please check the backend connection.");
    } finally {
      setLoading(false);
    }
  }, [schoolId, API_BASE]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const total      = resources.length;
  const functional = resources.filter(r => r.status === "Excellent" || r.status === "Good").length;
  const needsRepair= resources.filter(r => r.status === "Needs Repair").length;
  const critical   = resources.filter(r => r.status === "Critical").length;

  const countOf = (cat: ResourceCategory) => resources.filter(r => r.category === cat).length;

  // ── Filtered list (table) ─────────────────────────────────────────────────
  const tableRows = filterCat === "All" ? resources : resources.filter(r => r.category === filterCat);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openAdd = (cat: ResourceCategory = "Classrooms") => {
    setEditTarget(null);
    setForm(emptyForm(cat));
    setSaveError(null);
    setShowModal(true);
  };

  const openEdit = (r: SchoolResource) => {
    setEditTarget(r);
    setForm({
      category: r.category,
      name: r.name,
      totalCount: r.totalCount != null ? String(r.totalCount) : "",
      functionalCount: r.functionalCount != null ? String(r.functionalCount) : "",
      status: r.status,
      remarks: r.remarks || "",
      lastAudited: r.lastAudited ? new Date(r.lastAudited).toISOString().split("T")[0] : "",
    });
    setSaveError(null);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditTarget(null); setSaveError(null); };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) return;
    setSaving(true);
    setSaveError(null);
    const payload = {
      schoolId,
      category: form.category,
      name: form.name.trim(),
      totalCount: form.totalCount !== "" ? Number(form.totalCount) : null,
      functionalCount: form.functionalCount !== "" ? Number(form.functionalCount) : null,
      status: form.status,
      remarks: form.remarks.trim() || null,
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

  // ── Delete ────────────────────────────────────────────────────────────────
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

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <PortalLayout
      title="School Resource Management"
      subtitle="Monitor · Infrastructure · Facilities"
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

      {/* ── KPI Strip ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Resources",  value: total,       color: "text-blue-400",    glow: "from-blue-500/10" },
          { label: "Functional",        value: functional,  color: "text-emerald-400", glow: "from-emerald-500/10" },
          { label: "Needs Repair",      value: needsRepair, color: "text-amber-400",   glow: "from-amber-500/10" },
          { label: "Critical",          value: critical,    color: "text-rose-400",    glow: "from-rose-500/10" },
        ].map(k => (
          <div key={k.label}
            className={`relative overflow-hidden glass p-4 rounded-2xl border border-slate-800 bg-gradient-to-br ${k.glow} to-transparent`}>
            <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">{k.label}</p>
            <p className={`text-2xl sm:text-3xl font-black mt-1 ${k.color}`}>{loading ? "—" : k.value}</p>
          </div>
        ))}
      </div>

      {/* ── 3×3 Category Grid ─────────────────────────────────────────── */}
      <div className="glass rounded-2xl border border-slate-800 p-4 sm:p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white">📊 Category Overview</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Click any category to add a resource</p>
          </div>
          <button
            id="btn-add-resource"
            onClick={() => openAdd()}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold transition-all active:scale-95"
          >
            <span className="text-base leading-none">+</span> Add Resource
          </button>
        </div>

        {/* 3 columns × 3 rows */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {CATEGORIES.map((cat) => {
            const m = CATEGORY_META[cat];
            const cnt = countOf(cat);
            const Icon = m.icon;
            const hoverBorder = `hover:${m.border.replace('/20', '/60')}`;
            return (
              <button
                key={cat}
                id={`cat-btn-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => openAdd(cat)}
                className={`group relative flex flex-col items-center justify-center gap-1.5 p-3 sm:p-4 rounded-2xl border transition-all duration-300 active:scale-95 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20
                  ${m.bg} ${m.border} ${hoverBorder}`}
              >
                {/* Count badge */}
                {cnt > 0 && (
                  <span className={`absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full ${m.bg} ${m.color} border ${m.border}`}>
                    {cnt}
                  </span>
                )}
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${m.color} transition-transform duration-300 group-hover:scale-110`} />
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
          { id: "monitor" as ViewTab, label: "🏗️ Monitor", desc: "Card View" },
          { id: "table"   as ViewTab, label: "📋 Total Resources", desc: "Table View" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setViewTab(t.id)}
            className={`flex-1 sm:flex-none flex flex-col items-center sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all
              ${viewTab === t.id
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
          >
            <span>{t.label}</span>
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
              <div className="text-5xl mb-3">🏗️</div>
              <p className="text-slate-400 font-semibold text-sm mb-1">No resources recorded yet</p>
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
                  const CardIcon = m.icon;
                  const pct = res.totalCount && res.functionalCount != null
                    ? Math.min(100, Math.round((res.functionalCount / res.totalCount) * 100))
                    : null;
                  return (
                    <div key={res.id}
                      className="group p-4 bg-slate-900/70 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all duration-200">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.bg} border ${m.border} shrink-0`}>
                            <CardIcon className={`w-4 h-4 ${m.color}`} />
                          </div>
                          <div>
                            <span className={`text-[9px] font-extrabold uppercase ${m.color}`}>{res.category}</span>
                            <h3 className="text-xs font-bold text-white leading-snug line-clamp-1">{res.name}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`w-2 h-2 rounded-full ${sm.dot}`} />
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
                              className={`h-full rounded-full ${PROGRESS_COLOR[res.status]}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </>
                      )}
                      {res.totalCount != null && res.functionalCount == null && (
                        <p className="text-[10px] text-slate-500 mb-2">Total: <span className="text-white font-bold">{res.totalCount}</span></p>
                      )}

                      {/* Remarks */}
                      {res.remarks && (
                        <p className="text-[10px] text-slate-500 italic mb-2 line-clamp-2">"{res.remarks}"</p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800 mt-2">
                        <span className="text-[9px] text-slate-600 font-semibold">
                          {res.lastAudited
                            ? `Audited ${new Date(res.lastAudited).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                            : "No audit date"}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(res)}
                            className="px-2 py-1 text-[9px] font-bold bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                          >Edit</button>
                          <button
                            onClick={() => setDeleteTarget(res)}
                            className="px-2 py-1 text-[9px] font-bold bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                          >Del</button>
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
              <h2 className="text-sm font-bold text-white">📋 Total Resources</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">{tableRows.length} record{tableRows.length !== 1 ? "s" : ""}</p>
            </div>
            {/* Category filter */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setFilterCat("All")}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all
                  ${filterCat === "All" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
              >All</button>
              {CATEGORIES.map(cat => {
                const Icon = CATEGORY_META[cat].icon;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCat(cat)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all
                      ${filterCat === cat ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{cat}</span>
                  </button>
                );
              })}
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
                    const TableIcon = m.icon;
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
                              <TableIcon className={`w-3.5 h-3.5 ${m.color}`} />
                            </span>
                            <span className={`text-[10px] font-bold ${m.color} whitespace-nowrap`}>{res.category}</span>
                          </div>
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold text-white max-w-[180px] block truncate">{res.name}</span>
                          {res.remarks && (
                            <span className="text-[9px] text-slate-500 italic block truncate max-w-[180px]">{res.remarks}</span>
                          )}
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
                          {res.lastAudited
                            ? new Date(res.lastAudited).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                            : "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
          ADD / EDIT MODAL
      ══════════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full sm:max-w-lg bg-slate-950 border border-slate-800 sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {editTarget ? "✏️ Edit Resource" : `➕ Add ${form.category}`}
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
                      const Icon = m.icon;
                      
                      // Brighter design when selected
                      const selBg = m.bg.replace('/18', '/30');
                      const selBorder = m.border.replace('/30', '/80');
                      const ringColor = m.border.replace('border-', 'ring-').replace('/30', '/25');

                      // Dynamic hover classes (colors matching category theme)
                      const hoverBg = `hover:${m.bg}`;
                      const hoverBorder = `hover:${m.border.replace('/30', '/60')}`;
                      const hoverText = `hover:${m.color}`;
                      const groupHoverText = `group-hover:${m.color}`;

                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, category: cat }))}
                          className={`group flex flex-col items-center justify-center gap-1.5 py-3.5 px-1 rounded-2xl border text-center transition-all duration-300 active:scale-95 hover:scale-[1.03]
                            ${sel 
                              ? `${selBg} ${selBorder} ${m.color} ring-2 ${ringColor} font-extrabold shadow-md shadow-black/10` 
                              : `bg-slate-950 border-slate-800 text-slate-500 ${hoverBg} ${hoverBorder} ${hoverText}`}`}
                        >
                          <Icon className={`w-5 h-5 transition-all duration-350 ${sel ? m.color : `text-slate-500 ${groupHoverText} group-hover:scale-110`}`} />
                          <span className="text-[9px] font-bold leading-tight transition-colors duration-350">{cat}</span>
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

              {/* Counts */}
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
          DELETE CONFIRM
      ══════════════════════════════════════════════════════════════════ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full sm:max-w-sm bg-slate-950 border border-rose-500/30 sm:rounded-3xl rounded-t-3xl shadow-2xl p-6">
            <div className="text-4xl mb-3 text-center">🗑️</div>
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

    </PortalLayout>
  );
}
