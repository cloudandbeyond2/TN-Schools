"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { FiEdit2 as FiEditIcon, FiTrash2 as FiTrashIcon } from "react-icons/fi";
import Swal from "sweetalert2";

interface BEOUser {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  isActive: boolean;
  schoolId: string | null;
  createdAt: string;
  block?: string;
  passwordHash?: string;
}

export default function ManageBEOsPage() {
  const { data: session } = useSession();
  const [beos, setBeos] = useState<BEOUser[]>([]);
  const [blocks, setBlocks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [district, setDistrict] = useState("");

  // Custom block add states
  const [isCustomBlock, setIsCustomBlock] = useState(false);
  const [customBlockName, setCustomBlockName] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [blockName, setBlockName] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchBeos = async () => {
    const deoId = (session?.user as any)?.id;
    const sessionDistrict = (session?.user as any)?.district;
    if (sessionDistrict) {
      setDistrict(sessionDistrict);
    }

    try {
      setLoading(true);
      if (deoId) {
        // Fetch BEOs & Schools under this logged-in DEO's district
        const res = await fetch(`${API_URL}/api/hierarchy/deo/${deoId}`);
        const json = await res.json();
        if (json.success && json.data) {
          const fetchedBeos = json.data.beos || [];
          setBeos(fetchedBeos);
          if (json.data.district) {
            setDistrict(json.data.district);
          }
          // Dynamic blocks list from schools AND existing BEOs of this district
          const schoolBlocks = (json.data.schools || []).map((s: any) => s.block);
          const beoBlocks = fetchedBeos.map((b: any) => b.block);
          const uniqueBlocks = Array.from(
            new Set([...schoolBlocks, ...beoBlocks].filter(Boolean))
          ) as string[];
          setBlocks(uniqueBlocks.sort());
        }
      } else {
        // Fallback to fetch all BEOs if no session
        const res = await fetch(`${API_URL}/api/users?role=BEO`);
        const json = await res.json();
        if (json.success) {
          setBeos(json.data);
        }
        const schoolRes = await fetch(`${API_URL}/api/schools`);
        const schoolData = await schoolRes.json();
        if (schoolData.success) {
          const schoolBlocks = (schoolData.data || []).map((s: any) => s.block);
          const beoBlocks = (json.data || []).map((b: any) => b.block);
          const uniqueBlocks = Array.from(
            new Set([...schoolBlocks, ...beoBlocks].filter(Boolean))
          ) as string[];
          setBlocks(uniqueBlocks.sort());
        }
      }
    } catch (err) {
      console.error("Error loading BEOs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeos();
  }, [session]);

  const refreshBeos = async () => {
    const deoId = (session?.user as any)?.id;
    try {
      if (deoId) {
        const res = await fetch(`${API_URL}/api/hierarchy/deo/${deoId}`);
        const json = await res.json();
        if (json.success && json.data) {
          const fetchedBeos = json.data.beos || [];
          setBeos(fetchedBeos);
          
          // Re-calculate dynamic block lists with any newly created custom blocks
          const schoolBlocks = (json.data.schools || []).map((s: any) => s.block);
          const beoBlocks = fetchedBeos.map((b: any) => b.block);
          const uniqueBlocks = Array.from(
            new Set([...schoolBlocks, ...beoBlocks].filter(Boolean))
          ) as string[];
          setBlocks(uniqueBlocks.sort());
        }
      } else {
        const res = await fetch(`${API_URL}/api/users?role=BEO`);
        const json = await res.json();
        if (json.success) {
          setBeos(json.data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (b: BEOUser) => {
    setEditingId(b.id);
    setName(b.name);
    setEmail(b.email);
    setMobile(b.mobile || "");
    setPassword("");
    setBlockName(b.block || "");
    setIsCustomBlock(false);
    setCustomBlockName("");
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setMobile("");
    setPassword("");
    setBlockName("");
    setIsCustomBlock(false);
    setCustomBlockName("");
    setIsModalOpen(false);
    setModalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setToast(null);
    setModalError(null);

    // 1. Full Name Validation
    if (name.trim().length < 3) {
      setModalError("⚠️ Full Name must be at least 3 characters long.");
      setSubmitting(false);
      return;
    }

    // 2. Email Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setModalError("⚠️ Please enter a valid email address.");
      setSubmitting(false);
      return;
    }

    // 3. Mobile Number Validation (if provided)
    if (mobile.trim()) {
      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(mobile.trim())) {
        setModalError("⚠️ Mobile number must be a valid 10-digit number.");
        setSubmitting(false);
        return;
      }
    }

    // 4. Password Validation (if provided)
    if (password && password.length < 6) {
      setModalError("⚠️ Password must be at least 6 characters long.");
      setSubmitting(false);
      return;
    }

    // 5. Block Jurisdiction Validation
    const finalBlock = isCustomBlock ? customBlockName.trim() : blockName;
    if (!finalBlock) {
      setModalError("⚠️ Block jurisdiction is required.");
      setSubmitting(false);
      return;
    }

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
        mobile: mobile.trim() || null,
        role: "BEO",
        district: district || undefined, // dynamic district assignment
        block: finalBlock,                 // custom or selected block assignment
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
        Swal.fire({
          title: "Success!",
          text: successMsg,
          icon: "success",
          confirmButtonColor: "#ec4899",
          background: document.documentElement.classList.contains("dark") ? "#0f172a" : "#ffffff",
          color: document.documentElement.classList.contains("dark") ? "#f1f5f9" : "#0f172a"
        });
        handleModalClose();
        refreshBeos();
      } else {
        setModalError(`⚠️ ${data.error || "Request failed."}`);
      }
    } catch (err) {
      setModalError("❌ Network error. Please try again.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleDelete = async (id: string, beoName: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete BEO ${beoName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ec4899",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      background: document.documentElement.classList.contains("dark") ? "#0f172a" : "#ffffff",
      color: document.documentElement.classList.contains("dark") ? "#f1f5f9" : "#0f172a"
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          title: "Deleted!",
          text: `BEO ${beoName} removed successfully!`,
          icon: "success",
          confirmButtonColor: "#ec4899",
          background: document.documentElement.classList.contains("dark") ? "#0f172a" : "#ffffff",
          color: document.documentElement.classList.contains("dark") ? "#f1f5f9" : "#0f172a"
        });
        refreshBeos();
      } else {
        Swal.fire({
          title: "Error!",
          text: data.error || "Failed to delete user.",
          icon: "error",
          confirmButtonColor: "#ec4899",
          background: document.documentElement.classList.contains("dark") ? "#0f172a" : "#ffffff",
          color: document.documentElement.classList.contains("dark") ? "#f1f5f9" : "#0f172a"
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error!",
        text: "Error deleting user.",
        icon: "error",
        confirmButtonColor: "#ec4899",
        background: document.documentElement.classList.contains("dark") ? "#0f172a" : "#ffffff",
        color: document.documentElement.classList.contains("dark") ? "#f1f5f9" : "#0f172a"
      });
    }
  };

  const filteredBeos = beos.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase()) ||
      (b.block && b.block.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <PortalLayout
      title="Manage BEOs"
      subtitle={district ? `DEO Officer · ${district} District` : "DEO Officer · Coimbatore District"}
      avatarLetter="D"
      avatarColor="#ec4899"
      themeClass="theme-deo"
      accentColor="#ec4899"
    >
      {/* Toast Alert */}
      {toast && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs font-semibold border shadow-lg ${
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300"
              : "bg-red-500/10 border-red-500/20 text-red-650 dark:text-red-300"
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
          <span className="badge bg-pink-500/10 text-pink-600 dark:text-pink-300 px-2 py-0.5 rounded text-[10px] font-bold mt-2 inline-block">Active Hierarchy</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">
            {district ? `${district} Blocks` : "District Blocks"}
          </span>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">{blocks.length}</div>
          <span className="badge bg-blue-500/10 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold mt-2 inline-block">Administrative Blocks</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">Block Coverage</span>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {blocks.length ? Math.min(100, Math.round((beos.length / blocks.length) * 100)) : 0}%
          </div>
          <span className="badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold mt-2 inline-block">Coverage Ratio</span>
        </div>
      </div>

      {/* Main List Container Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-white">🏢 Block Education Officers Registry</h2>
            <p className="text-xs text-slate-500 leading-relaxed">View, audit, and deploy block administrator credentials.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by name, email, block..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-pink-500 transition-colors w-full sm:w-64"
            />
            <button
              onClick={() => {
                setModalError(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0"
            >
              + Add BEO
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-pink-500/20 border-t-pink-500 animate-spin mb-3" />
            <span className="text-xs text-slate-500">Loading BEOs...</span>
          </div>
        ) : filteredBeos.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <span className="text-3xl block mb-2">🏢</span>
            <span className="text-xs text-slate-400 font-medium">No BEOs found matching search query.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">BEO Name</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Jurisdiction</th>
                  <th className="px-4 py-3">Created Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBeos.map((b) => (
                  <tr key={b.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-white text-xs">{b.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 font-mono">{b.email}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 font-mono">{b.mobile || "N/A"}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="bg-pink-500/10 text-pink-650 dark:text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {b.block ? `${b.block} Block` : "Unassigned"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(b)}
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg transition-all"
                          title="Edit BEO"
                        >
                          <FiEditIcon className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id, b.name)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-650 dark:text-red-400 border border-red-500/20 rounded-lg transition-all"
                          title="Delete BEO"
                        >
                          <FiTrashIcon className="text-sm" />
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
          <div className="w-full max-w-md rounded-3xl p-6 space-y-5 relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                🏢 {editingId ? "Edit BEO" : "Add Block Education Officer"}
              </h3>
              <button onClick={handleModalClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {modalError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-300 p-3.5 rounded-2xl text-[11px] font-semibold">
                  {modalError}
                </div>
              )}
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mr. Murugesan P."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. beo@coimbatore.tn.gov.in"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Mobile Number</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingId ? "Leave blank to keep unchanged" : "Default is 123456"}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Assign Block Jurisdiction</label>
                <select
                  required
                  value={isCustomBlock ? "__ADD_NEW__" : blockName}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "__ADD_NEW__") {
                      setIsCustomBlock(true);
                      setBlockName("");
                    } else {
                      setIsCustomBlock(false);
                      setBlockName(val);
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-pink-500 transition-colors"
                >
                  <option value="">-- Select a Block --</option>
                  {blocks.map((b) => (
                    <option key={b} value={b}>
                      {b} Block
                    </option>
                  ))}
                  <option value="__ADD_NEW__">+ Add New Block...</option>
                </select>
              </div>

              {isCustomBlock && (
                <div>
                  <label className="block text-[10px] text-pink-650 dark:text-pink-400 mb-1 font-semibold">New Block Name</label>
                  <input
                    type="text"
                    required
                    value={customBlockName}
                    onChange={(e) => setCustomBlockName(e.target.value)}
                    placeholder="e.g. Srirangam West"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-pink-500 transition-colors animate-fade-in"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-800 text-white font-bold rounded-xl text-xs transition-colors shadow-md mt-2"
              >
                {submitting ? "Processing..." : editingId ? "Save Changes" : "Add BEO"}
              </button>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
