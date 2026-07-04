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
        // Filter schools for BEO's block if needed, but listing all block schools
        const filteredByBlock = data.data.filter((s: School) => 
          s.block.toLowerCase().includes("coimbatore south") || 
          s.block.toLowerCase().includes("south")
        );
        setSchools(filteredByBlock.length > 0 ? filteredByBlock : data.data);
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
    setName("");
    setHeadmasterName("");
    setAddress("");
    setDistrict("");
    setBlock("");
    setPincode("");
    setSchoolType("Government");
    setMediumOfInstruction("Tamil");
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dise.trim() || !name.trim()) {
      setToast({ message: "⚠️ School DISE code and name are required", type: "error" });
      return;
    }
    setSubmitting(true);
    setToast(null);

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
    const successMsg = editingId
      ? `🎉 School '${name}' updated successfully!`
      : `🎉 School '${name}' registered successfully!`;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ message: successMsg, type: "success" });
        handleModalClose();
        fetchSchools();
      } else {
        setToast({ message: `⚠️ ${data.error || "Operation failed."}`, type: "error" });
      }
    } catch (err) {
      setToast({ message: "❌ Error connecting to server.", type: "error" });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleDelete = async (id: string, sName: string) => {
    if (!confirm(`Are you sure you want to delete school '${sName}'?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/schools/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setToast({ message: `🗑️ School '${sName}' deleted successfully!`, type: "success" });
        fetchSchools();
      } else {
        setToast({ message: `⚠️ ${data.error || "Failed to delete school."}`, type: "error" });
      }
    } catch (err) {
      setToast({ message: "❌ Network error. Failed to delete school.", type: "error" });
    } finally {
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
              onChange={(e) => setSearchQuery(e.target.value)}
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
                {filteredSchools.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300 text-xs">
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-550 dark:text-slate-400 mb-1 font-semibold">DISE Code (School ID)</label>
                  <input
                    type="text"
                    required
                    value={dise}
                    onChange={(e) => setDise(e.target.value)}
                    placeholder="e.g. 33120100101"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
                  />
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
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-550 dark:text-slate-400 mb-1 font-semibold">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="641045"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
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
    </PortalLayout>
  );
}

