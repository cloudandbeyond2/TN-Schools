"use client";

import React, { useState, useEffect, useRef } from "react";
import PortalLayout from "@/components/PortalLayout";
import * as XLSX from "xlsx";

interface School {
  id: string;
  dise: string;
  name: string;
  address: string | null;
  headmasterName: string | null;
  district: string;
  block: string;
  pincode: string | null;
  schoolType: string;
  mediumOfInstruction: string;
  createdAt: string;
  _count?: {
    students: number;
    teachers: number;
  };
}

export default function BlockSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [pincodeError, setPincodeError] = useState("");
  const [diseError, setDiseError] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination
  const PAGE_SIZE = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  // Form Fields
  const [dise, setDise] = useState("");
  const [name, setName] = useState("");
  const [headmasterName, setHeadmasterName] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [block, setBlock] = useState("");
  const [pincode, setPincode] = useState("");
  const [schoolType, setSchoolType] = useState("Government");
  const [mediumOfInstruction, setMediumOfInstruction] = useState("Tamil");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/schools`);
      const data = await res.json();
      if (data.success) {
        // Show ALL schools registered by this BEO — no hardcoded block filter
        setSchools(data.data);
      } else {
        setToast({ message: `Error loading schools: ${data.error}`, type: "error" });
      }
    } catch (err) {
      console.error("Fetch schools error:", err);
      setToast({ message: "Network error loading schools", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleEditClick = (s: School) => {
    setEditingId(s.id);
    setDise(s.dise);
    setName(s.name);
    setHeadmasterName(s.headmasterName || "");
    setAddress(s.address || "");
    setDistrict(s.district || "");
    setBlock(s.block || "");
    setPincode(s.pincode || "");
    setSchoolType(s.schoolType || "Government");
    setMediumOfInstruction(s.mediumOfInstruction || "Tamil");
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setEditingId(null);
    setDise("");
    setDiseError("");
    setName("");
    setHeadmasterName("");
    setAddress("");
    setDistrict("");
    setBlock("");
    setPincode("");
    setPincodeError("");
    setModalError(null);
    setModalSuccess(null);
    setSchoolType("Government");
    setMediumOfInstruction("Tamil");
    setIsModalOpen(false);
  };

  const handleDiseChange = (val: string) => {
    // Only allow digits, max 11 characters (standard TN DISE format)
    const cleaned = val.replace(/\D/g, "").slice(0, 11);
    setDise(cleaned);
    if (cleaned.length > 0 && cleaned.length < 11) {
      setDiseError("DISE Code must be exactly 11 digits");
    } else {
      setDiseError("");
    }
  };

  const handlePincodeChange = (val: string) => {
    // Allow only digits, max 6
    const cleaned = val.replace(/\D/g, "").slice(0, 6);
    setPincode(cleaned);
    if (cleaned.length > 0 && cleaned.length < 6) {
      setPincodeError("Pincode must be exactly 6 digits");
    } else {
      setPincodeError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // DISE validation
    if (!dise.trim()) {
      setDiseError("DISE Code is required");
      return;
    }
    if (!/^\d{11}$/.test(dise.trim())) {
      setDiseError("DISE Code must be exactly 11 digits");
      return;
    }
    if (!name.trim()) {
      setModalError("⚠️ School Name is required");
      return;
    }
    // Pincode restriction: must be empty or exactly 6 digits
    if (pincode.trim() && !/^\d{6}$/.test(pincode.trim())) {
      setPincodeError("Pincode must be exactly 6 digits");
      return;
    }
    setSubmitting(true);
    setModalError(null);
    setModalSuccess(null);
    setPincodeError("");
    setDiseError("");

    const payload = {
      dise: dise.trim(),
      name: name.trim(),
      headmasterName: headmasterName.trim() || "N/A",
      address: address.trim() || null,
      district,
      block,
      pincode: pincode.trim() || null,
      schoolType,
      mediumOfInstruction,
    };

    const endpoint = editingId ? `${API_URL}/api/schools/${editingId}` : `${API_URL}/api/schools`;
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        const savedName = name.trim();
        const isNew = !editingId;
        const savedId = data.data?.id || null;
        // Show success inside modal briefly, then close
        setModalSuccess(isNew
          ? `✅ School '${savedName}' registered successfully! It will now appear in the list.`
          : `✅ School '${savedName}' updated successfully!`);
        // Store new ID before async fetch so it's available to highlight the row
        if (isNew && savedId) setLastAddedId(savedId);
        setTimeout(async () => {
          handleModalClose();
          await fetchSchools();
          if (isNew) {
            // Jump to last page after data loads
            setCurrentPage(9999);
          }
          setToast({ message: isNew
            ? `🎉 School '${savedName}' registered!`
            : `🎉 School '${savedName}' updated!`, type: "success" });
          setTimeout(() => setToast(null), 5000);
        }, 900);
      } else {
        const errMsg = data.error || "Operation failed.";
        setModalError(`⚠️ ${errMsg}`);
      }
    } catch (err) {
      setModalError("❌ Error connecting to server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string, sName: string) => {
    // Open professional custom confirm dialog instead of browser native confirm()
    setDeleteTarget({ id, name: sName });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/schools/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setToast({ message: `🗑️ School '${deleteTarget.name}' deleted successfully!`, type: "success" });
        setDeleteTarget(null);
        fetchSchools();
      } else {
        setToast({ message: `⚠️ ${data.error || "Failed to delete school."}`, type: "error" });
        setDeleteTarget(null);
      }
    } catch (err) {
      setToast({ message: "❌ Network error. Failed to delete school.", type: "error" });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setToast(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws);

        if (rawData.length === 0) {
          setToast({ message: "⚠️ Excel file appears to be empty.", type: "error" });
          setIsUploading(false);
          return;
        }

        const records = rawData.map((row: any) => ({
          dise: String(row["DISE Code"] || row["School ID"] || row["dise"] || row["schoolId"] || "").trim(),
          name: String(row["School Name"] || row["name"] || row["schoolName"] || "").trim(),
          headmasterName: String(row["Headmaster Name"] || row["headmaster"] || row["headmasterName"] || "N/A").trim(),
          address: String(row["Address"] || row["address"] || "").trim() || null,
          district: String(row["District"] || row["district"] || "").trim(),
          block: String(row["Block"] || row["block"] || "").trim(),
          pincode: String(row["Pincode"] || row["pincode"] || "").trim() || null,
          schoolType: String(row["School Type"] || row["schoolType"] || "Government").trim(),
          mediumOfInstruction: String(row["Medium"] || row["mediumOfInstruction"] || "Tamil").trim(),
        })).filter(r => r.dise && r.name);

        if (records.length === 0) {
          setToast({ message: "⚠️ No valid records found. Ensure columns 'DISE Code' and 'School Name' are populated.", type: "error" });
          setIsUploading(false);
          return;
        }

        const res = await fetch(`${API_URL}/api/schools/bulk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ records }),
        });
        const resData = await res.json();
        if (resData.success) {
          setToast({ message: `📊 Excel import successful! Registered/Updated ${resData.count} schools.`, type: "success" });
          fetchSchools();
          if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
          setToast({ message: `⚠️ Excel import failed: ${resData.error}`, type: "error" });
        }
      } catch (err) {
        console.error("Excel import error:", err);
        setToast({ message: "❌ Error parsing spreadsheet file.", type: "error" });
      } finally {
        setIsUploading(false);
        setTimeout(() => setToast(null), 5000);
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadSampleExcel = () => {
    const sampleData = [
      {
        "School Name": "GHS Coimbatore South",
        "DISE Code": "33120100101",
        "Address": "123 Trichy Road, Ramanathapuram",
        "District": "Coimbatore",
        "Block": "Coimbatore South",
        "Pincode": "641045",
        "School Type": "Government",
        "Medium": "English"
      },
      {
        "School Name": "GHS Peelamedu Boys",
        "DISE Code": "33120100102",
        "Address": "45 Kamarajar Street, Peelamedu",
        "District": "Coimbatore",
        "Block": "Coimbatore South",
        "Pincode": "641004",
        "School Type": "Government",
        "Medium": "Tamil"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SchoolsTemplate");
    XLSX.writeFile(wb, "schools_bulk_import_template.xlsx");
  };

  const filteredSchools = schools.filter((s) => {
    const term = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.dise.toLowerCase().includes(term) ||
      (s.headmasterName || "").toLowerCase().includes(term) ||
      (s.address || "").toLowerCase().includes(term)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredSchools.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedSchools = filteredSchools.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <PortalLayout
      title="Block Schools Registry"
      subtitle="Mr. Murugesan P. · Coimbatore South Block"
      avatarLetter="M"
      avatarColor="#8b5cf6"
      themeClass="theme-beo"
      accentColor="#8b5cf6"
    >
      {/* Toast Alert */}
      {toast && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs font-semibold border shadow-lg fade-in ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* BEO Block Summaries in White/Premium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6 fade-in">
        {[
          { label: "Total Block Schools", value: schools.length.toString(), icon: "🏫", color: "text-violet-600 dark:text-violet-400", sub: "Registered in block" },
          { label: "Government Schools", value: schools.filter(s => s.schoolType === "Government").length.toString(), icon: "🏛️", color: "text-emerald-600 dark:text-emerald-400", sub: "Direct state run" },
          { label: "Medium of Instruction (Tamil)", value: schools.filter(s => s.mediumOfInstruction === "Tamil").length.toString(), icon: "📚", color: "text-amber-600 dark:text-amber-400", sub: "Regional language" },
          { label: "Assigned Headmasters", value: schools.filter(s => s.headmasterName && s.headmasterName !== "N/A").length.toString(), icon: "👤", color: "text-cyan-600 dark:text-cyan-400", sub: "Leader deployed" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{kpi.icon}</span>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{kpi.sub}</span>
            </div>
            <div className={`text-2xl font-black ${kpi.color} mb-1`}>{kpi.value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Directory Main Card - Light White Themed */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-6 fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">🏆 Block Schools Index</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Manage schools under Block jurisdiction, audit settings, and bulk upload DISE records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search school, ID or headmaster..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-805 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors w-full sm:w-60"
            />
            
            <button
              onClick={downloadSampleExcel}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              📥 Template
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              {isUploading ? "Uploading..." : "📊 Excel Upload"}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleExcelUpload}
              accept=".xlsx, .xls"
              className="hidden"
            />

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-all shadow-md whitespace-nowrap"
            >
              + Register School
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin mb-3" />
            <span className="text-xs text-slate-450">Loading schools from PostgreSQL...</span>
          </div>
        ) : filteredSchools.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <span className="text-4xl block mb-3">🏫</span>
            <h3 className="text-xs font-bold text-slate-700 dark:text-white mb-1">No Schools Found</h3>
            <p className="text-[11px] text-slate-450">Try modifying your search or upload an Excel list to register schools.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">DISE Code (School ID)</th>
                  <th className="px-4 py-3">School Name</th>
                  <th className="px-4 py-3">Headmaster Name</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Category / Medium</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSchools.map((s) => (
                  <tr
                    key={s.id}
                    className={`border-b border-slate-100 dark:border-slate-800/50 transition-colors ${
                      s.id === lastAddedId
                        ? "bg-emerald-50 dark:bg-emerald-500/10 animate-pulse-once"
                        : "hover:bg-slate-50/50 dark:hover:bg-slate-900/40"
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">
                      {s.id === lastAddedId && (
                        <span className="inline-block mr-1.5 text-emerald-500 text-[9px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/20 px-1.5 py-0.5 rounded">NEW</span>
                      )}
                      {s.dise}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-850 dark:text-white text-xs">
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                      👤 {s.headmasterName || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      📍 {s.address || "Not provided"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] px-2 py-0.5 bg-violet-100 text-violet-750 dark:bg-violet-950 dark:text-violet-400 font-semibold rounded w-fit">
                          {s.schoolType}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          🗣️ {s.mediumOfInstruction} Medium
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <a
                          href={`/school/${s.dise}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-md font-bold text-[10px] transition-all"
                        >
                          🌐 Portal
                        </a>
                        <button
                          onClick={() => handleEditClick(s)}
                          className="px-2.5 py-1 bg-violet-500/10 hover:bg-violet-500/20 text-violet-700 dark:text-violet-450 border border-violet-500/20 rounded-md font-bold text-[10px] transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-450 border border-red-500/20 rounded-md font-bold text-[10px] transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  Showing <span className="font-bold text-slate-600 dark:text-slate-300">{(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredSchools.length)}</span> of{" "}
                  <span className="font-bold text-slate-600 dark:text-slate-300">{filteredSchools.length}</span> schools
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={safePage === 1}
                    className="px-2 py-1 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >«</button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >‹ Prev</button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                    .reduce<(number | string)[]>((acc, p, idx, arr) => {
                      if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "..." ? (
                        <span key={`ellipsis-${i}`} className="px-1.5 text-[10px] text-slate-400">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p as number)}
                          className={`w-7 h-7 text-[10px] font-bold rounded-lg border transition-all ${
                            safePage === p
                              ? "bg-violet-600 border-violet-600 text-white shadow-sm"
                              : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >Next ›</button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={safePage === totalPages}
                    className="px-2 py-1 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >»</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Modal Card */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl p-6 space-y-5 relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-850 dark:text-white">
                🏫 {editingId ? "Edit School Details" : "Register Block School"}
              </h3>
              <button
                onClick={handleModalClose}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-white text-xs"
              >
                ✕ Close
              </button>
            </div>

            {/* Inline Success Banner — visible INSIDE modal */}
            {modalSuccess && (
              <div className="flex items-start gap-2.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl px-4 py-3 text-xs font-semibold">
                <span className="text-base leading-none mt-0.5">✅</span>
                <div className="flex-1">
                  <p className="font-bold text-emerald-800 dark:text-emerald-200 mb-0.5">Saved Successfully</p>
                  <p className="font-medium text-emerald-600 dark:text-emerald-300">{modalSuccess}</p>
                </div>
              </div>
            )}

            {/* Inline Error Banner — visible INSIDE modal, not behind overlay */}
            {modalError && (
              <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 rounded-xl px-4 py-3 text-xs font-semibold">
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-550 dark:text-slate-400 mb-1 font-semibold">
                    DISE Code (School ID)
                    <span className="ml-1 text-slate-400 font-normal">(11 digits)</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={dise}
                    onChange={(e) => handleDiseChange(e.target.value)}
                    placeholder="e.g. 33120100101"
                    maxLength={11}
                    className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none transition-colors ${
                      diseError
                        ? "border-red-400 dark:border-red-500 focus:border-red-500"
                        : dise.length === 11
                        ? "border-emerald-400 dark:border-emerald-600 focus:border-emerald-500"
                        : "border-slate-200 dark:border-slate-800 focus:border-violet-500"
                    }`}
                  />
                  {diseError && (
                    <p className="mt-1 text-[10px] text-red-500 font-semibold">⚠️ {diseError}</p>
                  )}
                  {!diseError && dise.length === 11 && (
                    <p className="mt-1 text-[10px] text-emerald-500 font-semibold">✓ Valid DISE Code</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] text-slate-550 dark:text-slate-400 mb-1 font-semibold">School Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. GHS Coimbatore"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>



              <div>
                <label className="block text-[10px] text-slate-550 dark:text-slate-400 mb-1 font-semibold">School Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 123 Trichy Road, Ramanathapuram"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-550 dark:text-slate-400 mb-1 font-semibold">District</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-550 dark:text-slate-400 mb-1 font-semibold">Block Jurisdiction</label>
                  <input
                    type="text"
                    required
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    placeholder="e.g. Coimbatore South"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-550 dark:text-slate-400 mb-1 font-semibold">
                    Pincode
                    <span className="ml-1 text-slate-400 font-normal">(6 digits)</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    placeholder="641045"
                    maxLength={6}
                    className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none transition-colors ${
                      pincodeError
                        ? "border-red-400 dark:border-red-500 focus:border-red-500"
                        : pincode.length === 6
                        ? "border-emerald-400 dark:border-emerald-600 focus:border-emerald-500"
                        : "border-slate-200 dark:border-slate-800 focus:border-violet-500"
                    }`}
                  />
                  {pincodeError && (
                    <p className="mt-1 text-[10px] text-red-500 font-semibold flex items-center gap-1">
                      ⚠️ {pincodeError}
                    </p>
                  )}
                  {!pincodeError && pincode.length === 6 && (
                    <p className="mt-1 text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                      ✓ Valid pincode
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] text-slate-550 dark:text-slate-400 mb-1 font-semibold">School Type</label>
                  <select
                    value={schoolType}
                    onChange={(e) => setSchoolType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-805 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    <option value="Government">Government</option>
                    <option value="Aided">Aided</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-850 text-white font-bold rounded-xl text-xs transition-colors shadow-md mt-2"
              >
                {submitting ? "Saving data..." : editingId ? "Save Changes" : "Register School"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* ── Professional Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Red top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-rose-600" />

            <div className="p-6">
              {/* Icon + Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/15 flex items-center justify-center shrink-0">
                  <span className="text-xl">🗑️</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Delete School</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">This action cannot be undone</p>
                </div>
              </div>

              {/* Message */}
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl px-4 py-3 mb-5">
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Are you sure you want to permanently delete{" "}
                  <span className="font-bold text-red-600 dark:text-red-400">&ldquo;{deleteTarget.name}&rdquo;</span>?
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  All students, teachers and records linked to this school will also be affected.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {deleting ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>🗑️ Yes, Delete School</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

