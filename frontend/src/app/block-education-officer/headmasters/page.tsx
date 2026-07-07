"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";

interface HeadmasterUser {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  isActive: boolean;
  schoolId: string | null;
  school?: {
    name: string;
    dise: string;
  } | null;
  createdAt: string;
  passwordHash?: string;
}

interface School {
  id: string;
  name: string;
  dise: string;
}

export default function ManageHeadmastersPage() {
  const [headmasters, setHeadmasters] = useState<HeadmasterUser[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [schoolId, setSchoolId] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchHeadmasters = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users?role=HEADMASTER`);
      const data = await res.json();
      if (data.success) {
        // Fetch schools to map details
        const schoolRes = await fetch(`${API_URL}/api/schools`);
        const schoolData = await schoolRes.json();
        const schoolMap = new Map<string, School>();
        if (schoolData.success) {
          schoolData.data.forEach((s: School) => schoolMap.set(s.id, s));
          setSchools(schoolData.data);
        }

        const mapped = data.data.map((u: any) => ({
          ...u,
          school: u.schoolId ? schoolMap.get(u.schoolId) : null,
        }));
        setHeadmasters(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeadmasters();
  }, []);

  const handleEditClick = (h: HeadmasterUser) => {
    setEditingId(h.id);
    setName(h.name);
    setEmail(h.email);
    setMobile(h.mobile || "");
    setPassword(h.passwordHash || "");
    setSchoolId(h.schoolId || "");
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setMobile("");
    setPassword("");
    setSchoolId("");
    setModalError(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);

    const endpoint = editingId ? `${API_URL}/api/users/${editingId}` : `${API_URL}/api/users`;
    const method = editingId ? "PUT" : "POST";
    const successMsg = editingId
      ? `🎉 Headmaster ${name} updated successfully!`
      : `🎉 Headmaster ${name} added successfully!`;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          mobile: mobile || undefined,
          role: "HEADMASTER",
          password: password || undefined,
          schoolId: schoolId || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Success: show page-level toast and close modal
        setToast({ message: successMsg, type: "success" });
        handleModalClose();
        fetchHeadmasters();
        setTimeout(() => setToast(null), 5000);
      } else {
        // Error: show inside the modal so it's not hidden behind the overlay
        const errMsg = data.error || "Request failed.";
        const friendlyMsg = errMsg.toLowerCase().includes("mobile") || errMsg.toLowerCase().includes("phone")
          ? "⚠️ This mobile number is already registered. Please use a different number."
          : errMsg.toLowerCase().includes("email")
          ? "⚠️ This email address is already in use. Please use a different email."
          : `⚠️ ${errMsg}`;
        setModalError(friendlyMsg);
      }
    } catch (err) {
      setModalError("❌ Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, hName: string) => {
    if (!confirm(`Are you sure you want to delete Headmaster ${hName}?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setToast({ message: `🗑️ Headmaster ${hName} removed successfully!`, type: "success" });
        fetchHeadmasters();
      } else {
        setToast({ message: `⚠️ ${data.error || "Failed to delete user."}`, type: "error" });
      }
    } catch (err) {
      setToast({ message: "❌ Error deleting user.", type: "error" });
    } finally {
      setTimeout(() => setToast(null), 5000);
    }
  };

  const filteredHeadmasters = headmasters.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.email.toLowerCase().includes(search.toLowerCase()) ||
      (h.school?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PortalLayout
      title="Manage Headmasters"
      subtitle="Mr. Murugesan P. · Coimbatore South Block"
      avatarLetter="M"
      avatarColor="#8b5cf6"
      themeClass="theme-beo"
      accentColor="#8b5cf6"
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
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">Total Headmasters</span>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">{headmasters.length}</div>
          <span className="badge badge-purple mt-2">Active Hierarchy</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">Schools Assigned</span>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {headmasters.filter((h) => h.schoolId).length} / {schools.length}
          </div>
          <span className="badge badge-blue mt-2">Coverage</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">Unassigned Schools</span>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {Math.max(0, schools.length - headmasters.filter((h) => h.schoolId).length)}
          </div>
          <span className="badge badge-yellow mt-2">Needs Assignment</span>
        </div>
      </div>

      {/* Main List Container Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-white">🏫 Block Headmasters Registry</h2>
            <p className="text-xs text-slate-500 leading-relaxed">View, audit, and deploy headmaster credentials.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by name, school, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors w-full sm:w-64"
            />
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0"
            >
              + Add Headmaster
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin mb-3" />
            <span className="text-xs text-slate-500">Loading headmasters...</span>
          </div>
        ) : filteredHeadmasters.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <span className="text-3xl block mb-2">🏫</span>
            <span className="text-xs text-slate-400 font-medium">No headmasters found matching search query.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Headmaster Name</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Assigned School</th>
                  <th className="px-4 py-3">Created Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHeadmasters.map((h) => (
                  <tr key={h.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-white text-xs">{h.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 font-mono">{h.email}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 font-mono">{h.mobile || "N/A"}</td>
                    <td className="px-4 py-3 text-xs text-blue-500 dark:text-blue-400 font-semibold">
                      {h.school ? (
                        <div>
                          <div>{h.school.name}</div>
                          <div className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">DISE: {h.school.dise}</div>
                        </div>
                      ) : (
                        <span className="text-amber-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {new Date(h.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(h)}
                          className="px-2.5 py-1 bg-violet-500/10 hover:bg-violet-500/20 text-violet-650 dark:text-violet-400 border border-violet-500/20 rounded-md font-bold text-[10px] transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(h.id, h.name)}
                          className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-650 dark:text-red-400 border border-red-500/20 rounded-md font-bold text-[10px] transition-all"
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
          <div className="w-full max-w-md rounded-3xl p-6 space-y-5 relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                🏫 {editingId ? "Edit Headmaster" : "Add Block Headmaster"}
              </h3>
              <button onClick={handleModalClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            {/* Inline error banner — visible INSIDE the modal, not behind it */}
            {modalError && (
              <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 rounded-xl px-4 py-3 text-xs font-semibold animate-pulse-once">
                <span className="text-base leading-none mt-0.5">🚫</span>
                <div className="flex-1">
                  <p className="font-bold text-red-800 dark:text-red-200 mb-0.5">Registration Failed</p>
                  <p className="font-medium text-red-600 dark:text-red-300">{modalError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalError(null)}
                  className="text-red-400 hover:text-red-600 dark:hover:text-red-200 text-sm font-bold leading-none mt-0.5 shrink-0"
                >
                  ✕
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mr. Venkatesh R."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. headmaster@school.com"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Mobile Number</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingId ? "Leave blank to keep unchanged" : "Default is 123456"}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Assign School</label>
                <select
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="">-- Select a School --</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.dise})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 text-white font-bold rounded-xl text-xs transition-colors shadow-md mt-2"
              >
                {submitting ? "Processing..." : editingId ? "Save Changes" : "Add Headmaster"}
              </button>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
