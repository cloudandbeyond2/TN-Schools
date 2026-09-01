"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface DeoUser {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  isActive: boolean;
  createdAt: string;
  district: string | null;
  passwordHash?: string;
}

type SortField = "name" | "email" | "mobile" | "district" | "createdAt";
type SortOrder = "asc" | "desc";

const TN_DISTRICTS = [
  "Chennai",
  "Coimbatore",
  "Cuddalore",
  "Dharmapuri",
  "Dindigul",
  "Erode",
  "Kanchipuram",
  "Kanyakumari",
  "Karur",
  "Krishnagiri",
  "Madurai",
  "Nagapattinam",
  "Namakkal",
  "Nilgiris",
  "Perambalur",
  "Pudukkottai",
  "Ramanathapuram",
  "Salem",
  "Sivaganga",
  "Thanjavur",
  "Theni",
  "Thoothukudi",
  "Tiruchirappalli",
  "Trichy",
  "Tirunelveli",
  "Tiruppur",
  "Tiruvallur",
  "Tiruvannamalai",
  "Tiruvarur",
  "Vellore",
  "Viluppuram",
  "Virudhunagar",
];

export default function ManageDeosPage() {
  const [deos, setDeos] = useState<DeoUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [district, setDistrict] = useState("Coimbatore");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchDeos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/hierarchy/users?role=DEO`);
      const data = await res.json();
      if (data.success) {
        setDeos(data.data);
      }
    } catch (err) {
      console.error("Error fetching DEOs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeos();
  }, []);

  const handleEditClick = (d: DeoUser) => {
    setEditingId(d.id);
    setName(d.name);
    setEmail(d.email || "");
    setMobile(d.mobile || "");
    setPassword("");
    setDistrict(d.district || "Coimbatore");
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setMobile("");
    setPassword("");
    setDistrict("Coimbatore");
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
      ? `🎉 DEO ${name} updated successfully!`
      : `🎉 DEO ${name} added successfully!`;

    try {
      const payload: any = {
        name,
        email,
        mobile: mobile || undefined,
        role: "DEO",
        district,
      };

      if (password) {
        payload.password = password;
      } else if (!isEdit) {
        payload.password = "123456"; // default password
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
        fetchDeos();
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

  const handleDelete = async (id: string, deoName: string) => {
    if (!confirm(`Are you sure you want to delete DEO ${deoName}?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setToast({ message: `🗑️ DEO ${deoName} removed successfully!`, type: "success" });
        fetchDeos();
      } else {
        setToast({ message: `⚠️ ${data.error || "Failed to delete user."}`, type: "error" });
      }
    } catch (err) {
      setToast({ message: "❌ Error deleting user.", type: "error" });
    } finally {
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortField(null);
        setSortOrder("asc");
      }
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredDeos = deos.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.email && d.email.toLowerCase().includes(search.toLowerCase())) ||
      (d.district && d.district.toLowerCase().includes(search.toLowerCase()))
  );

  const sortedDeos = [...filteredDeos].sort((a, b) => {
    if (!sortField) return 0;

    let valA: string | number = "";
    let valB: string | number = "";

    if (sortField === "createdAt") {
      valA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      valB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    } else {
      valA = (a[sortField] || "").toString().toLowerCase();
      valB = (b[sortField] || "").toString().toLowerCase();
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const activeDistrictsCount = new Set(deos.map((d) => d.district).filter(Boolean)).size;

  return (
    <PortalLayout
      title="DEO Management"
      subtitle="Super Admin Portal · System Governance"
      avatarLetter="S"
      avatarColor="#7c3aed"
      themeClass="theme-superadmin"
      accentColor="#7c3aed"
    >
      {/* Toast Alert */}
      {toast && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs font-semibold border shadow-lg ${
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300"
              : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-300"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">Total DEOs</span>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">{deos.length}</div>
          <span className="badge bg-purple-500/10 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded text-[10px] font-bold mt-2 inline-block">Active Hierarchy</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">Active Districts</span>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">{activeDistrictsCount}</div>
          <span className="badge bg-blue-500/10 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold mt-2 inline-block">Tamil Nadu Coverage</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">Portal Status</span>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">Active</div>
          <span className="badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold mt-2 inline-block">Operational</span>
        </div>
      </div>

      {/* Main List Container Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-white">🗺️ District Education Officers</h2>
            <p className="text-xs text-slate-500 leading-relaxed">Manage system access and district scopes for regional education administrators.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by name, email, district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-slate-500 transition-colors w-full sm:w-64"
            />
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0"
            >
              + Add DEO
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin mb-3" />
            <span className="text-xs text-slate-500">Loading DEOs...</span>
          </div>
        ) : filteredDeos.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <span className="text-3xl block mb-2">🗺️</span>
            <span className="text-xs text-slate-400 font-medium">No District Education Officers found.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th
                    onClick={() => handleSort("name")}
                    className="px-4 py-3 cursor-pointer select-none hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>DEO Name</span>
                      {sortField === "name" ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("email")}
                    className="px-4 py-3 cursor-pointer select-none hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Email Address</span>
                      {sortField === "email" ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("mobile")}
                    className="px-4 py-3 cursor-pointer select-none hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Mobile</span>
                      {sortField === "mobile" ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("district")}
                    className="px-4 py-3 cursor-pointer select-none hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Assigned District</span>
                      {sortField === "district" ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("createdAt")}
                    className="px-4 py-3 cursor-pointer select-none hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Created Date</span>
                      {sortField === "createdAt" ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedDeos.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-white text-xs">{d.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 font-mono">{d.email || "N/A"}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 font-mono">{d.mobile || "N/A"}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {d.district || "Unassigned"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(d)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md font-bold text-[10px] transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(d.id, d.name)}
                          className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-md font-bold text-[10px] transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal Card */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <style>{`
            :root:not(.dark) .deo-modal-title,
            html:not(.dark) .deo-modal-title {
              color: #0f172a !important;
            }
            .dark .deo-modal-title,
            html.dark .deo-modal-title {
              color: #ffffff !important;
            }
          `}</style>
          <div className="w-full max-w-md rounded-3xl p-6 space-y-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="deo-modal-title text-sm font-bold">
                🗺️ {editingId ? "Edit DEO Officer" : "Add DEO Officer"}
              </div>
              <button onClick={handleModalClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mr. Senthil Kumar"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-slate-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. deo.cbe@tn.gov.in"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-slate-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Mobile Number</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-slate-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingId ? "Leave blank to keep unchanged" : "Default is 123456"}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-slate-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Assigned District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-slate-500 transition-colors"
                >
                  {TN_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-md mt-2"
              >
                {submitting ? "Processing..." : editingId ? "Save Changes" : "Add DEO"}
              </button>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
