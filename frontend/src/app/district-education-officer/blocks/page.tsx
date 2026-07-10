"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";

interface BlockData {
  name: string;
  schoolCount: number;
  studentCount: number;
  beoName: string;
  beoEmail: string;
  beoMobile: string;
  rank: number;
}

export default function BlockComparisonsPage() {
  const { data: session } = useSession();
  const [blocksData, setBlocksData] = useState<BlockData[]>([]);
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalSchools, setTotalSchools] = useState(0);
  const [totalBeos, setTotalBeos] = useState(0);
  const [search, setSearch] = useState("");

  // Modal & block creation states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBlockName, setNewBlockName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchData = async () => {
    const deoId = (session?.user as any)?.id;
    const sessionDistrict = (session?.user as any)?.district;
    if (sessionDistrict) {
      setDistrict(sessionDistrict);
    }

    if (!deoId) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/hierarchy/deo/${deoId}`);
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.district) {
          setDistrict(json.data.district);
        }

        const schools = json.data.schools || [];
        const beos = json.data.beos || [];

        // Aggregate block data from schools and BEOs
        const schoolBlocks = schools.map((s: any) => s.block);
        const beoBlocks = beos.map((b: any) => b.block);
        const uniqueBlockNames = Array.from(
          new Set([...schoolBlocks, ...beoBlocks].filter(Boolean))
        ) as string[];

        const aggregated: BlockData[] = uniqueBlockNames.map((bname, idx) => {
          const schoolsInBlock = schools.filter((s: any) => s.block === bname);
          const beoInBlock = beos.find((b: any) => b.block === bname);

          const studentCount = schoolsInBlock.reduce(
            (sum: number, s: any) => sum + (s._count?.students || 0),
            0
          );

          return {
            name: bname,
            schoolCount: schoolsInBlock.length,
            studentCount,
            beoName: beoInBlock ? beoInBlock.name : "Unassigned",
            beoEmail: beoInBlock ? beoInBlock.email : "",
            beoMobile: beoInBlock ? beoInBlock.mobile : "",
            rank: idx + 1,
          };
        });

        // Sort primarily by school count desc
        aggregated.sort((a, b) => b.schoolCount - a.schoolCount);
        aggregated.forEach((item, idx) => {
          item.rank = idx + 1;
        });

        setBlocksData(aggregated);
        setTotalSchools(schools.length);
        setTotalBeos(beos.length);
      }
    } catch (err) {
      console.error("Error loading block metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockName.trim()) return;
    setSubmitting(true);
    setToast(null);

    try {
      const diseCode = Math.floor(1000000000 + Math.random() * 9000000000).toString(); // 10 digit code
      const payload = {
        dise: diseCode,
        name: `Government High School ${newBlockName.trim()}`,
        district: district || "Trichy",
        block: newBlockName.trim(),
        schoolType: "Government",
        mediumOfInstruction: "Tamil",
      };

      const res = await fetch(`${API_URL}/api/schools`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setToast({ message: `🎉 Block "${newBlockName.trim()}" created successfully with a sample school!`, type: "success" });
        setNewBlockName("");
        setIsModalOpen(false);
        fetchData();
      } else {
        setToast({ message: `⚠️ ${json.error || "Failed to create block."}`, type: "error" });
      }
    } catch (err) {
      setToast({ message: "❌ Network error. Please try again.", type: "error" });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const filteredBlocks = blocksData.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.beoName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PortalLayout
      title="Manage Blocks"
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

      {/* Grid cards of active blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">Total Blocks</span>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">{blocksData.length}</div>
          <span className="badge bg-pink-500/10 text-pink-650 dark:text-pink-400 px-2 py-0.5 rounded text-[10px] font-bold mt-2 inline-block">Registered Blocks</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">Total Schools</span>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">{totalSchools}</div>
          <span className="badge bg-blue-500/10 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold mt-2 inline-block">Academic Institutions</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">Active BEOs</span>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">{totalBeos}</div>
          <span className="badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold mt-2 inline-block">Block Officers Assigned</span>
        </div>
      </div>

      {/* Main Blocks Registry Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-white">📊 Block Comparisons & Management</h2>
            <p className="text-xs text-slate-500 leading-relaxed">Review BEO distributions, student load, and register new sub-district block jurisdictions.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by block, BEO..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-pink-500 transition-colors w-full sm:w-64"
            />
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0"
            >
              + Add Block
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-pink-500/20 border-t-pink-500 animate-spin mb-3" />
            <span className="text-xs text-slate-500">Loading blocks...</span>
          </div>
        ) : filteredBlocks.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <span className="text-3xl block mb-2">🗺️</span>
            <span className="text-xs text-slate-400 font-medium">No blocks found matching search.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Block Jurisdiction</th>
                  <th className="px-4 py-3">Assigned BEO</th>
                  <th className="px-4 py-3">Schools Count</th>
                  <th className="px-4 py-3">Total Students</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlocks.map((b) => (
                  <tr key={b.name} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 text-xs font-bold text-slate-800 dark:text-white">
                      <span className={`badge ${b.rank === 1 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : b.rank <= 3 ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" : "bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border border-slate-250 dark:border-slate-700"} px-2 py-0.5 rounded text-[10px] font-semibold`}>
                        #{b.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-white text-xs">{b.name} Block</td>
                    <td className="px-4 py-3 text-xs">
                      {b.beoName === "Unassigned" ? (
                        <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold inline-block">
                          ⚠️ {b.beoName}
                        </span>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-slate-850 dark:text-slate-200 font-bold">{b.beoName}</span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5">{b.beoEmail}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 font-medium">{b.schoolCount}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 font-mono">{b.studentCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      {b.beoName === "Unassigned" ? (
                        <Link
                          href="/district-education-officer/beos"
                          className="px-2.5 py-1 bg-pink-500/10 hover:bg-pink-500/20 text-pink-650 dark:text-pink-400 border border-pink-500/20 rounded-md font-bold text-[10px] transition-all inline-block"
                        >
                          Assign BEO
                        </Link>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold italic">Complete</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Block Modal Card */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl p-6 space-y-5 relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                🗺️ Add New Block Jurisdiction
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Registering a new block creates the sub-district record in <strong>{district || "Trichy"}</strong> and automatically provisions an initial Government High School inside it to kickstart registries.
            </p>

            <form onSubmit={handleAddBlock} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Block Jurisdiction Name</label>
                <input
                  type="text"
                  required
                  value={newBlockName}
                  onChange={(e) => setNewBlockName(e.target.value)}
                  placeholder="e.g. Trichy West, Lalgudi North"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-850 text-white font-bold rounded-xl text-xs transition-colors shadow-md mt-2"
              >
                {submitting ? "Creating Block..." : "Create Block"}
              </button>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
