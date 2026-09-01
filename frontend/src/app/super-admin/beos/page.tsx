"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";

interface BEOUser {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  isActive: boolean;
  createdAt: string;
  district?: string | null;
  block?: string | null;
}

type SortField = "name" | "email" | "block" | "district" | "mobile" | "isActive" | "createdAt";
type SortOrder = "asc" | "desc";

const TN_DISTRICTS = [
  "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode",
  "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam",
  "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Salem",
  "Sivaganga", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
  "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar",
];

export default function ManageBeosPage() {
  const [beos, setBeos] = useState<BEOUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All");

  // Sorting State
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [district, setDistrict] = useState("Chennai");
  const [block, setBlock] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchBeos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users?role=BEO`);
      const data = await res.json();
      if (data.success) {
        setBeos(data.data);
      }
    } catch (err) {
      console.error("Error fetching BEOs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeos();
  }, []);

  // Reset pagination when search, district, or itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDistrict, itemsPerPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleEditClick = (b: BEOUser) => {
    setEditingId(b.id);
    setName(b.name);
    setEmail(b.email || "");
    setMobile(b.mobile || "");
    setPassword("");
    setDistrict(b.district || "Chennai");
    setBlock(b.block || "");
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setMobile("");
    setPassword("");
    setDistrict("Chennai");
    setBlock("");
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setToast(null);

    const isEdit = !!editingId;
    const endpoint = isEdit ? `${API_URL}/api/users/${editingId}` : `${API_URL}/api/hierarchy/create-officer`;
    const method = isEdit ? "PUT" : "POST";
    const successMsg = isEdit
      ? `🎉 BEO ${name} updated successfully!`
      : `🎉 BEO ${name} added successfully!`;

    try {
      const payload: any = {
        name,
        email,
        mobile: mobile || undefined,
        role: "BEO",
        district,
        block: block || undefined,
      };

      if (password) {
        payload.password = password;
      } else if (!isEdit) {
        payload.password = "123456";
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setToast({ message: successMsg, type: "success" });
        handleModalClose();
        fetchBeos();
      } else {
        setToast({ message: `⚠️ ${data.error || "Request failed."}`, type: "error" });
      }
    } catch (err) {
      setToast({ message: "❌ Network error. Please try again.", type: "error" });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleDelete = async (id: string, beoName: string) => {
    if (!confirm(`Are you sure you want to delete BEO ${beoName}?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setToast({ message: `🗑️ BEO ${beoName} removed successfully!`, type: "success" });
        fetchBeos();
      } else {
        setToast({ message: `⚠️ ${data.error || "Failed to delete user."}`, type: "error" });
      }
    } catch (err) {
      setToast({ message: "❌ Error deleting user.", type: "error" });
    } finally {
      setTimeout(() => setToast(null), 5000);
    }
  };

  // Filtered BEO list
  const filteredBeos = beos.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.email && b.email.toLowerCase().includes(search.toLowerCase())) ||
      (b.block && b.block.toLowerCase().includes(search.toLowerCase())) ||
      (b.district && b.district.toLowerCase().includes(search.toLowerCase()));

    const matchesDistrict = selectedDistrict === "All" || b.district === selectedDistrict;

    return matchesSearch && matchesDistrict;
  });

  // Sorted BEO list
  const sortedBeos = [...filteredBeos].sort((a, b) => {
    let valA: any = a[sortField] || "";
    let valB: any = b[sortField] || "";

    if (sortField === "createdAt") {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    } else if (typeof valA === "boolean") {
      valA = valA ? 1 : 0;
      valB = valB ? 1 : 0;
    } else if (typeof valA === "string") {
      valA = valA.toLowerCase();
      valB = (valB as string).toLowerCase();
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Paginated BEO list
  const totalPages = Math.max(1, Math.ceil(sortedBeos.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, sortedBeos.length);
  const paginatedBeos = sortedBeos.slice(startIndex, endIndex);

  const totalBlocksCount = new Set(beos.map((b) => b.block).filter(Boolean)).size;
  const activeDistrictsCount = new Set(beos.map((b) => b.district).filter(Boolean)).size;

  const renderSortHeader = (field: SortField, label: string) => {
    const isSorted = sortField === field;
    return (
      <th
        onClick={() => handleSort(field)}
        className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors select-none"
      >
        <div className="flex items-center gap-1.5">
          <span>{label}</span>
          <i
            className={`fi text-xs text-slate-400 ${
              isSorted
                ? sortOrder === "asc"
                  ? "fi-rr-arrow-small-up text-purple-600 dark:text-purple-400 font-bold"
                  : "fi-rr-arrow-small-down text-purple-600 dark:text-purple-400 font-bold"
                : "fi-rr-sort-alt opacity-40 hover:opacity-100"
            }`}
          ></i>
        </div>
      </th>
    );
  };

  return (
    <PortalLayout
      title="BEO Management"
      subtitle="Super Admin Portal · Block Administration"
      avatarLetter="S"
      avatarColor="#7c3aed"
      themeClass="theme-superadmin"
      accentColor="#7c3aed"
    >
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] max-w-md p-4 rounded-2xl text-xs font-semibold border shadow-2xl backdrop-blur-md transition-all flex items-center justify-between gap-3 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/25"
              : "bg-red-600 text-white border-red-500 shadow-red-500/25"
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-white/80 hover:text-white text-sm font-bold ml-2 shrink-0">
            ✕
          </button>
        </div>
      )}

      {/* Overview stats cards with Flaticon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Total BEOs</span>
            <i className="fi fi-rr-users-alt text-purple-500 text-lg"></i>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">{beos.length}</div>
          <span className="badge bg-purple-500/10 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded text-[10px] font-bold mt-2 inline-block">Block Educational Officers</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Covered Blocks</span>
            <i className="fi fi-rr-building text-blue-500 text-lg"></i>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">{totalBlocksCount || 413}</div>
          <span className="badge bg-blue-500/10 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold mt-2 inline-block">Tamil Nadu Educational Blocks</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Covered Districts</span>
            <i className="fi fi-rr-map-marker-home text-emerald-500 text-lg"></i>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">{activeDistrictsCount || 38}</div>
          <span className="badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold mt-2 inline-block">Across State</span>
        </div>
      </div>

      {/* Main List Container Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fi fi-rr-building text-purple-600 dark:text-purple-400"></i> Block Educational Officers (BEOs)
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">Manage BEO credentials, block jurisdictions, and school supervision authority.</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <div className="relative">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-slate-500 transition-colors"
              >
                <option value="All">All Districts</option>
                {TN_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <i className="fi fi-rr-filter absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
            </div>
            <div className="relative w-full sm:w-56">
              <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input
                type="text"
                placeholder="Search by name, block, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-slate-500 transition-colors"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5"
            >
              <i className="fi fi-rr-user-add"></i> + Add BEO
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mb-2"></div>
            <p className="text-xs text-slate-400">Loading BEOs...</p>
          </div>
        ) : paginatedBeos.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <i className="fi fi-rr-folder-open text-4xl text-slate-400 mb-2 block"></i>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No BEOs Found</p>
            <p className="text-xs text-slate-400 mt-1">Get started by creating a new Block Educational Officer profile above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {renderSortHeader("name", "BEO Officer")}
                  {renderSortHeader("block", "Assigned Block")}
                  {renderSortHeader("district", "District")}
                  {renderSortHeader("mobile", "Contact")}
                  {renderSortHeader("isActive", "Status")}
                  {renderSortHeader("createdAt", "Created Date")}
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {paginatedBeos.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center text-xs shrink-0">
                        {b.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div>{b.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{b.email}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium text-[11px]">
                        <i className="fi fi-rr-marker text-xs"></i> {b.block || "Unassigned Block"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-200 font-medium">
                      {b.district || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {b.mobile || "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.isActive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {b.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(b.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleEditClick(b)}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <i className="fi fi-rr-edit text-xs"></i> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(b.id, b.name)}
                          className="px-2.5 py-1 text-[11px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <i className="fi fi-rr-trash text-xs"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && sortedBeos.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entries per page</span>
              <span className="text-slate-400 ml-2">
                (Showing {sortedBeos.length === 0 ? 0 : startIndex + 1} to {endIndex} of {sortedBeos.length} BEOs)
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
              >
                <i className="fi fi-rr-angle-left text-xs"></i> Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | string)[]>((acc, page, idx, src) => {
                  if (idx > 0 && typeof src[idx - 1] === "number" && (page as number) - (src[idx - 1] as number) > 1) {
                    acc.push("...");
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, index) =>
                  typeof item === "number" ? (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                        currentPage === item
                          ? "bg-purple-600 text-white shadow-sm"
                          : "border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {item}
                    </button>
                  ) : (
                    <span key={`ellipsis-${index}`} className="px-1 text-slate-400">
                      ...
                    </span>
                  )
                )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
              >
                Next <i className="fi fi-rr-angle-right text-xs"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
              <i className="fi fi-rr-user-add text-purple-600 dark:text-purple-400"></i>
              {editingId ? "Edit BEO Officer" : "Add New BEO Officer"}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              {editingId
                ? "Update BEO contact info, district, and educational block."
                : "Register a Block Educational Officer to supervise elementary & secondary schools."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S. Muthuraman M.Ed."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. beo.pollachi@tnschools.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9842123456"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    District *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    {TN_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Block Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pollachi North"
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {editingId ? "Password (leave empty to keep unchanged)" : "Password (default: 123456)"}
                </label>
                <input
                  type="password"
                  placeholder={editingId ? "Leave blank to keep same" : "Set password (optional)"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <i className="fi fi-rr-cross-small"></i> Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <i className="fi fi-rr-check"></i> {submitting ? "Saving..." : editingId ? "Save Changes" : "Create BEO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
