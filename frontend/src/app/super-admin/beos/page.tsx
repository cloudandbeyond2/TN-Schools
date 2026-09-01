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
  "Tirunelveli",
  "Tiruppur",
  "Tiruvallur",
  "Tiruvannamalai",
  "Tiruvarur",
  "Vellore",
  "Viluppuram",
  "Virudhunagar",
];

export default function ManageBeosPage() {
  const [beos, setBeos] = useState<BEOUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
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

  const filteredBeos = beos.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.email && b.email.toLowerCase().includes(search.toLowerCase())) ||
      (b.block && b.block.toLowerCase().includes(search.toLowerCase())) ||
      (b.district && b.district.toLowerCase().includes(search.toLowerCase()));

    const matchesDistrict = selectedDistrict === "All" || b.district === selectedDistrict;

    return matchesSearch && matchesDistrict;
  });

  const totalBlocksCount = new Set(beos.map((b) => b.block).filter(Boolean)).size;
  const activeDistrictsCount = new Set(beos.map((b) => b.district).filter(Boolean)).size;

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
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">Total BEOs</span>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">{beos.length}</div>
          <span className="badge bg-purple-500/10 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded text-[10px] font-bold mt-2 inline-block">Block Educational Officers</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">Covered Blocks</span>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">{totalBlocksCount || 413}</div>
          <span className="badge bg-blue-500/10 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold mt-2 inline-block">Tamil Nadu Educational Blocks</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">Covered Districts</span>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">{activeDistrictsCount || 38}</div>
          <span className="badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold mt-2 inline-block">Across State</span>
        </div>
      </div>

      {/* Main List Container Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-white">🏢 Block Educational Officers (BEOs)</h2>
            <p className="text-xs text-slate-500 leading-relaxed">Manage BEO credentials, block jurisdictions, and school supervision authority.</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-slate-500 transition-colors"
            >
              <option value="All">All Districts</option>
              {TN_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search by name, block, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-slate-500 transition-colors w-full sm:w-56"
            />
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0"
            >
              + Add BEO
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mb-2"></div>
            <p className="text-xs text-slate-400">Loading BEOs...</p>
          </div>
        ) : filteredBeos.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <span className="text-3xl mb-2 block">🏢</span>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No BEOs Found</p>
            <p className="text-xs text-slate-400 mt-1">Get started by creating a new Block Educational Officer profile above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">BEO Officer</th>
                  <th className="py-3 px-4">Assigned Block</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredBeos.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center text-xs">
                        {b.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div>{b.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{b.email}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium text-[11px]">
                        📍 {b.block || "Unassigned Block"}
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
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(b.id, b.name)}
                          className="px-2.5 py-1 text-[11px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
              {editingId ? "✏️ Edit BEO Officer" : "🏢 Add New BEO Officer"}
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
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingId ? "Save Changes" : "Create BEO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
