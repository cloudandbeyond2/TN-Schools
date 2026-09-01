"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { Scale } from "lucide-react";

interface Grievance {
  id: string;
  petitioner: string;
  school: string;
  block: string;
  category: string;
  filed: string;
  status: string;
  ministerAction?: string;
  escalation?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const parsePetitioner = (str: string, ministerAction?: string) => {
  if (!str) return { name: "Student", school: "Holy Cross Hr Sec School", block: "Trichy" };

  let cleanStr = str.trim();

  // 1. Multi-paren match: "Rathna (TN-RPT-052920) (Holy Cross Hr Sec School, Trichy)"
  const multiParenMatch = cleanStr.match(/^(.*?)\s*(?:\((TN-RPT-[^\)]+)\))?\s*\(([^,]+),\s*([^\)]+)\)$/i);
  if (multiParenMatch) {
    const mainName = multiParenMatch[1].trim();
    const refCode = multiParenMatch[2] ? ` (${multiParenMatch[2].trim()})` : "";
    return {
      name: `${mainName}${refCode}`,
      school: multiParenMatch[3].trim(),
      block: multiParenMatch[4].trim()
    };
  }

  // 2. Single-paren match with comma: "Rathna (Holy Cross Hr Sec School, Trichy)"
  const singleParenMatch = cleanStr.match(/^(.*?)\s*\(([^,]+),\s*([^\)]+)\)$/);
  if (singleParenMatch) {
    return {
      name: singleParenMatch[1].trim(),
      school: singleParenMatch[2].trim(),
      block: singleParenMatch[3].trim()
    };
  }

  // 3. Extract school from ministerAction: "School: Holy Cross Hr Sec School | ..."
  let extractedSchool = "";
  let extractedBlock = "";
  if (ministerAction) {
    const schoolMatch = ministerAction.match(/School:\s*([^|]+)/i);
    if (schoolMatch && schoolMatch[1].trim()) {
      extractedSchool = schoolMatch[1].trim();
    }
    const blockMatch = ministerAction.match(/Location:\s*([^|]+)/i);
    if (blockMatch && blockMatch[1].trim()) {
      extractedBlock = blockMatch[1].trim();
    }
  }

  if (!extractedSchool || extractedSchool === "District School") {
    extractedSchool = "Holy Cross Hr Sec School";
  }
  if (!extractedBlock || extractedBlock === "District Block") {
    extractedBlock = "Trichy";
  }

  return { name: cleanStr, school: extractedSchool, block: extractedBlock };
};

const renderParsedActionDetails = (str: string) => {
  if (!str) return <p className="text-slate-400 text-xs italic">No details recorded.</p>;

  if (str.includes("|")) {
    const parts = str.split("|").map(p => p.trim());
    const fields: { key: string; val: string }[] = [];
    let detailedDesc = "";

    parts.forEach(part => {
      const colonIdx = part.indexOf(":");
      if (colonIdx !== -1) {
        const k = part.substring(0, colonIdx).trim();
        const v = part.substring(colonIdx + 1).trim();
        if (k.toLowerCase() === "details") {
          detailedDesc = v;
        } else {
          fields.push({ key: k, val: v });
        }
      } else {
        detailedDesc += (detailedDesc ? " " : "") + part;
      }
    });

    return (
      <div className="space-y-3">
        {fields.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
            {fields.map((f, i) => (
              <div key={i} className="text-xs">
                <span className="text-[10px] text-pink-400 font-bold block uppercase tracking-wider mb-0.5">
                  {f.key}
                </span>
                <span className="text-slate-200 font-semibold">{f.val}</span>
              </div>
            ))}
          </div>
        )}
        {detailedDesc && (
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-pink-400 font-bold block uppercase tracking-wider">
              Detailed Description
            </span>
            <p className="text-xs text-slate-100 leading-relaxed font-sans font-medium">
              {detailedDesc}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <p className="text-slate-200 text-xs leading-relaxed font-sans bg-slate-950/80 p-3 rounded-xl border border-slate-800">
      {str}
    </p>
  );
};

export default function DEOGrievancesPage() {
  const { data: session } = useSession();
  const district = (session?.user as any)?.district || "Coimbatore";

  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({ petitioner: "", school: "", block: "", category: "Scholarship Delay", filed: "", status: "Pending" });

  // ── Search, Filter & Pagination States ──
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [schoolFilter, setSchoolFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const categoriesList = Array.from(new Set(grievances.map(g => g.category)));
  const schoolsList = Array.from(new Set(grievances.map(g => g.school)));

  const filteredGrievances = grievances.filter(g => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      g.petitioner.toLowerCase().includes(query) ||
      g.school.toLowerCase().includes(query) ||
      g.block.toLowerCase().includes(query) ||
      g.category.toLowerCase().includes(query) ||
      g.id.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "Resolved" && g.status === "Resolved") ||
      (statusFilter === "Pending" && (g.status === "Pending" || g.status === "Intervention Pending")) ||
      (statusFilter === "Under Review" && (g.status === "Under Review" || g.status === "Counselled"));

    const matchesCategory =
      categoryFilter === "ALL" || g.category === categoryFilter;

    const matchesSchool =
      schoolFilter === "ALL" || g.school === schoolFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesSchool;
  });

  const totalPages = Math.max(1, Math.ceil(filteredGrievances.length / itemsPerPage));
  const activePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedGrievances = filteredGrievances.slice(startIndex, startIndex + itemsPerPage);

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/deo/grievances?district=${encodeURIComponent(district)}`);
      const json = await res.json();
      if (json.success && json.data) {
        const formatted = json.data.map((g: any) => {
          const parsed = parsePetitioner(g.petitioner, g.ministerAction);
          return {
            id: g.id,
            petitioner: parsed.name,
            school: parsed.school,
            block: parsed.block,
            category: g.category,
            filed: g.filed,
            status: g.status,
            ministerAction: g.ministerAction || "No extra details recorded.",
            escalation: g.escalation || "Medium"
          };
        });
        setGrievances(formatted);
      }
    } catch (e) {
      console.error("Error loading grievances:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, [session, district]);

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/deo/grievances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Resolved" })
      });
      setGrievances(p => p.map(g => g.id === id ? { ...g, status: "Resolved" } : g));
      if (selectedGrievance?.id === id) {
        setSelectedGrievance(prev => prev ? { ...prev, status: "Resolved" } : null);
      }
      setToast("✅ Grievance marked as resolved.");
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await fetch(`${API_URL}/api/deo/grievances?id=${encodeURIComponent(deleteConfirmId)}`, {
        method: "DELETE"
      });
      setGrievances(prev => prev.filter(g => g.id !== deleteConfirmId));
      if (selectedGrievance?.id === deleteConfirmId) {
        setSelectedGrievance(null);
      }
      setDeleteConfirmId(null);
      setToast("🗑️ Grievance record deleted successfully.");
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      console.error("Error deleting grievance:", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dbPetitioner = `${form.petitioner} (${form.school || "District School"}, ${form.block || "District Block"})`;
      const res = await fetch(`${API_URL}/api/deo/grievances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petitioner: dbPetitioner,
          district,
          category: form.category,
          filed: form.filed || new Date().toISOString().split("T")[0],
          status: "Pending"
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        const parsed = parsePetitioner(json.data.petitioner);
        const newGrievance = {
          id: json.data.id,
          petitioner: parsed.name,
          school: parsed.school,
          block: parsed.block,
          category: json.data.category,
          filed: json.data.filed,
          status: json.data.status,
          ministerAction: json.data.ministerAction || "No extra details recorded.",
          escalation: json.data.escalation || "Medium"
        };
        setGrievances(p => [newGrievance, ...p]);
        setIsModalOpen(false);
        setToast(`⚖️ Grievance from '${form.petitioner}' logged for review.`);
        setTimeout(() => setToast(null), 4000);
      }
    } catch (err) {
      console.error("Error creating grievance:", err);
    }
  };

  const simulateExcel = () => {
    setIsUploading(true);
    setTimeout(async () => {
      try {
        const mockUpload = {
          petitioner: "Mr. Arjun V. (Parent)",
          school: "GHS Singanallur",
          block: "CBE North",
          category: "Mid-Day Meal Complaint",
          filed: "2024-11-08",
          status: "Pending"
        };
        const dbPetitioner = `${mockUpload.petitioner} (${mockUpload.school}, ${mockUpload.block})`;
        const res = await fetch(`${API_URL}/api/deo/grievances`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            petitioner: dbPetitioner,
            district,
            category: mockUpload.category,
            filed: mockUpload.filed,
            status: mockUpload.status
          })
        });
        const json = await res.json();
        if (json.success && json.data) {
          const parsed = parsePetitioner(json.data.petitioner);
          const newGrievance = {
            id: json.data.id,
            petitioner: parsed.name,
            school: parsed.school,
            block: parsed.block,
            category: json.data.category,
            filed: json.data.filed,
            status: json.data.status,
            ministerAction: json.data.ministerAction || "Imported record",
            escalation: "Medium"
          };
          setGrievances(p => [newGrievance, ...p]);
          setToast("📊 Grievance register imported! 1 new record added.");
          setTimeout(() => setToast(null), 4000);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsUploading(false);
        setIsModalOpen(false);
      }
    }, 1500);
  };

  return (
    <PortalLayout title="Grievances" subtitle={`DEO Officer · ${district} District`} avatarLetter="D" avatarColor="#ec4899" themeClass="theme-deo" accentColor="#ec4899">
      {/* ── Simple Clean Hero Banner ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-pink-100 dark:bg-pink-950/60 rounded-2xl shrink-0 border border-pink-200 dark:border-pink-800/60 flex items-center justify-center shadow-sm">
            <Scale className="w-6 h-6 text-pink-600 dark:text-pink-400 shrink-0" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
              District Grievances Hub
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed max-w-2xl">
              Monitor, investigate, and resolve student wellness concerns, teacher conduct reports, and infrastructure grievances across {district} District.
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Grievances", value: grievances.length.toString(), icon: "fi-rr-scale-balanced", color: "text-pink-400" },
          { label: "Resolved", value: grievances.filter(g => g.status === "Resolved").length.toString(), icon: "fi-rr-check-circle", color: "text-emerald-400" },
          { label: "Pending", value: grievances.filter(g => g.status === "Pending" || g.status === "Intervention Pending").length.toString(), icon: "fi-rr-time-fast", color: "text-red-400" },
          { label: "Under Review", value: grievances.filter(g => g.status === "Under Review" || g.status === "Counselled").length.toString(), icon: "fi-rr-search", color: "text-amber-400" },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="text-2xl mb-2 text-pink-400"><i className={`fi ${k.icon}`} /></div>
            <div className={`text-2xl font-extrabold ${k.color} mb-1`}>{k.value}</div>
            <div className="text-xs text-slate-500 font-semibold">{k.label}</div>
          </div>
        ))}
      </div>
      {toast && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl flex items-center gap-2"><i className="fi fi-rr-check-circle" /> {toast}</div>}

      <div className="glass rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2"><i className="fi fi-rr-scale-balanced text-pink-400" /> District Grievance Register</h2>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-md transition-all cursor-pointer"><i className="fi fi-rr-plus text-xs" /> File Grievance</button>
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-5 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
          <div className="relative flex-1">
            <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search petitioner, school, block, ref..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs">✕</button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
              <option value="Under Review">Under Review</option>
            </select>

            <select
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 cursor-pointer max-w-[160px] truncate"
            >
              <option value="ALL">All Categories</option>
              {categoriesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={schoolFilter}
              onChange={e => { setSchoolFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 cursor-pointer max-w-[160px] truncate"
            >
              <option value="ALL">All Schools</option>
              {schoolsList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={itemsPerPage}
              onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500 cursor-pointer"
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="data-table w-full min-w-[700px]">
          <thead><tr><th>Petitioner</th><th>School</th><th>Block</th><th>Category</th><th>Filed</th><th>Status</th><th className="text-right">Action</th></tr></thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs text-slate-500">Loading grievances...</span>
                </td>
              </tr>
            ) : paginatedGrievances.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-xs text-slate-500">
                  {searchQuery || statusFilter !== "ALL" || categoryFilter !== "ALL"
                    ? "No grievances match your search or filter criteria."
                    : "No grievances logged for this district."}
                </td>
              </tr>
            ) : (
              paginatedGrievances.map(g => (
                <tr key={g.id}>
                  <td className="font-bold text-white text-xs">{g.petitioner}</td>
                  <td className="text-xs text-slate-400">{g.school}</td>
                  <td className="text-xs">{g.block}</td>
                  <td className="text-xs text-pink-400">{g.category}</td>
                  <td className="text-xs text-slate-500">{g.filed}</td>
                  <td><span className={`badge ${g.status === "Resolved" ? "badge-green" : g.status === "Pending" || g.status === "Intervention Pending" ? "badge-red" : "badge-yellow"}`}>{g.status}</span></td>
                  <td className="whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setSelectedGrievance(g)} className="inline-flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300 font-bold px-2.5 py-1 bg-pink-500/10 hover:bg-pink-500/20 rounded-lg transition-all cursor-pointer">
                        <i className="fi fi-rr-eye text-xs" /> View
                      </button>
                      {g.status !== "Resolved" ? (
                        <button onClick={() => handleResolve(g.id)} className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-bold px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-all cursor-pointer">
                          <i className="fi fi-rr-check-circle text-xs" /> Resolve
                        </button>
                      ) : (
                        <div className="w-[72px]" />
                      )}
                      <button onClick={() => setDeleteConfirmId(g.id)} className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-bold px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all cursor-pointer">
                        <i className="fi fi-rr-trash text-xs" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {/* ── Pagination Controls ── */}
        {!loading && filteredGrievances.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-800/80 text-xs text-slate-400">
            <div>
              Showing <span className="font-bold text-white">{startIndex + 1}</span> to{" "}
              <span className="font-bold text-white">{Math.min(startIndex + itemsPerPage, filteredGrievances.length)}</span> of{" "}
              <span className="font-bold text-white">{filteredGrievances.length}</span> entries
              {(searchQuery || statusFilter !== "ALL" || categoryFilter !== "ALL" || schoolFilter !== "ALL") && (
                <span className="text-pink-400 ml-1">(filtered from {grievances.length} total)</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={activePage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer inline-flex items-center gap-1 text-xs"
              >
                ‹ Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    page === activePage
                      ? "bg-pink-600 !text-white shadow-md shadow-pink-600/30"
                      : "bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={activePage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer inline-flex items-center gap-1 text-xs"
              >
                Next ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Grievance Details Modal */}
      {selectedGrievance && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 space-y-5" style={{ background: "#090d16", border: "1px solid rgba(236,72,153,0.3)", boxShadow: "0 20px 60px rgba(0,0,0,0.95)" }}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <i className="fi fi-rr-scale-balanced text-pink-400 text-lg" />
                <h3 style={{ color: "#ffffff" }} className="modal-title-white !text-white text-base font-black">Grievance Details</h3>
              </div>
              <button onClick={() => setSelectedGrievance(null)} className="text-slate-400 hover:text-white text-xs font-bold px-2.5 py-1 bg-slate-800 rounded-lg transition-all cursor-pointer">✕ Close</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Petitioner / Ref</span>
                  <span className="text-white font-bold">{selectedGrievance.petitioner}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Category</span>
                  <span className="text-pink-400 font-bold">{selectedGrievance.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Date Filed</span>
                  <span className="text-slate-300">{selectedGrievance.filed}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Priority Level</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${selectedGrievance.escalation === "Critical" ? "bg-red-500 text-white" : "bg-amber-500 text-slate-950"}`}>
                    {selectedGrievance.escalation || "Critical"}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Full Incident Details & Description</span>
                {renderParsedActionDetails(selectedGrievance.ministerAction || "")}
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Status:</span>
                  <span className={`badge ${selectedGrievance.status === "Resolved" ? "badge-green" : "badge-red"}`}>{selectedGrievance.status}</span>
                </div>
                {selectedGrievance.status !== "Resolved" && (
                  <button onClick={() => handleResolve(selectedGrievance.id)} className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer">
                    <i className="fi fi-rr-check-circle text-xs" /> Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 space-y-6" style={{ background: "#090d16", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 20px 50px rgba(0,0,0,0.95)" }}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 style={{ color: "#ffffff" }} className="modal-title-white !text-white text-sm font-bold flex items-center gap-2"><i className="fi fi-rr-document-signed text-pink-400" /> File New Grievance</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xs cursor-pointer">✕ Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="text-xs font-bold text-pink-400 uppercase tracking-wider">Manual Entry</div>
                {[{ label: "Petitioner Name", key: "petitioner", type: "text" }, { label: "School", key: "school", type: "text" }, { label: "Block", key: "block", type: "text" }, { label: "Date Filed", key: "filed", type: "date" }].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] text-slate-400 mb-1 font-semibold">{f.label}</label>
                    <input type={f.type} required value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500" />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500">
                    {["Scholarship Delay", "Transfer Issue", "Infrastructure Complaint", "Exam Results Issue", "Fee Irregularity", "Mid-Day Meal Complaint", "Teacher Misconduct", "Other"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs cursor-pointer">File Grievance</button>
              </form>
              <div className="border-l border-slate-800 pl-6 flex flex-col justify-center">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Excel Import</div>
                <div onClick={simulateExcel} className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-900/40 rounded-2xl p-6 text-center cursor-pointer min-h-[160px] flex flex-col items-center justify-center space-y-3">
                  {isUploading ? (<><div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" /><span className="text-[10px] text-slate-400">Parsing...</span></>) : (<><i className="fi fi-rr-file-excel text-3xl text-emerald-400" /><span className="text-xs font-bold text-white">Import Grievance Register</span><span className="text-[9px] text-slate-500">grievances_district.xlsx</span></>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Centered Delete Confirmation Modal ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-3xl p-6 space-y-5 border border-red-500/30 shadow-2xl text-center"
            style={{ background: "#090d16", boxShadow: "0 25px 70px rgba(239,68,68,0.25)" }}
          >
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto text-2xl">
              <i className="fi fi-rr-trash text-2xl" />
            </div>
            
            <div className="space-y-1">
              <h3 style={{ color: "#ffffff" }} className="modal-title-white !text-white text-lg font-black">
                Confirm Deletion
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Are you sure you want to permanently delete this grievance record? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
