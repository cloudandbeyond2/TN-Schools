"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import * as XLSX from "xlsx";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

interface AlumniRecord {
  id?: string;
  name: string;
  batch: string;
  contribution: string;
  role: string;
  phone: string;
  email: string;
  location: string;
  value: string;
  createdAt?: string;
}

interface ParsedPreviewAlumni {
  id: number;
  name: string;
  batch: string;
  contribution: string;
  role: string;
  phone: string;
  email: string;
  location: string;
  value: string;
  isValid: boolean;
  validationError?: string;
}

export default function AlumniPage() {
  const { data: session } = useSession();
  // Headmaster's own school — derived directly from session, never changes
  const mySchoolId: string = (session?.user as any)?.schoolId || "";
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [alumni, setAlumni] = useState<AlumniRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch schools list (to display the school name)
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/schools`);
        const json = await res.json();
        if (json.success) {
          setSchools(json.data);
        }
      } catch (err) {
        console.error("Error fetching schools:", err);
      }
    };
    fetchSchools();
  }, []);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBatch, setNewBatch] = useState("2005");
  const [newContribution, setNewContribution] = useState("");
  const [newRole, setNewRole] = useState("Alumni Member");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newValue, setNewValue] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [previewAlumni, setPreviewAlumni] = useState<ParsedPreviewAlumni[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  // ── Fetch alumni — always scoped to this headmaster's school ────────
  const fetchAlumni = useCallback(async () => {
    if (!mySchoolId) return; // wait until session has loaded
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/alumni?schoolId=${mySchoolId}`);
      const json = await res.json();
      if (json.success) {
        setAlumni(json.data);
      } else {
        showToast("⚠️ Could not load alumni contributions from server.", "error");
      }
    } catch {
      showToast("🔴 Server offline — could not load alumni contributions.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [mySchoolId]);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  // ── Delete alumni record ──────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this alumni contribution record?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/alumni/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("🎉 Alumni contribution removed successfully.");
        setAlumni(prev => prev.filter(a => a.id !== id));
      } else {
        showToast("❌ Failed to remove alumni record.", "error");
      }
    } catch {
      showToast("🔴 Network error — could not remove alumni record.", "error");
    }
  };

  // ── Calculate KPI stats dynamically ──────────────────────────────
  const parseCurrency = (val: string): number => {
    if (!val || val === "N/A") return 0;
    // strip non-numeric characters except decimals
    const sanitized = val.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(sanitized);
    return isNaN(parsed) ? 0 : parsed;
  };

  const totalDonations = alumni.reduce((sum, item) => sum + parseCurrency(item.value), 0);
  const projectsFundedCount = alumni.filter(item => parseCurrency(item.value) >= 150000).length;

  const formatRupees = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const downloadExcelTemplate = () => {
    const headers = [
      "Alumni Name", 
      "Batch Year", 
      "Current Role", 
      "Phone Number", 
      "Email Address", 
      "Current Location", 
      "Contribution Value", 
      "Contribution Details"
    ];
    const sampleData = [
      {
        "Alumni Name": "Dr. S. Ramakrishnan",
        "Batch Year": "1994",
        "Current Role": "Software Architect",
        "Phone Number": "9876543240",
        "Email Address": "ramakrishnan@gmail.com",
        "Current Location": "USA",
        "Contribution Value": "450000",
        "Contribution Details": "Donated 20 computers to the new science lab"
      },
      {
        "Alumni Name": "Mrs. K. Meena",
        "Batch Year": "1988",
        "Current Role": "IAS Officer",
        "Phone Number": "9876543241",
        "Email Address": "meena.k@ias.gov.in",
        "Current Location": "Chennai",
        "Contribution Value": "150000",
        "Contribution Details": "Sponsored yearly higher ed scholarships for 5 girls"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Alumni Template");
    XLSX.writeFile(workbook, "alumni_contributions_template.xlsx");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  };

  const parseFile = (file: File) => {
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        interface ExcelAlumniRow {
          "Alumni Name"?: string;
          "Batch Year"?: string;
          "Current Role"?: string;
          "Phone Number"?: string;
          "Email Address"?: string;
          "Current Location"?: string;
          "Contribution Value"?: string;
          "Contribution Details"?: string;
        }

        const parsedData = XLSX.utils.sheet_to_json<ExcelAlumniRow>(sheet);

        const validated: ParsedPreviewAlumni[] = parsedData.map((row, idx) => {
          const name = row["Alumni Name"]?.toString().trim() || "";
          const batch = row["Batch Year"]?.toString().trim() || "";
          const role = row["Current Role"]?.toString().trim() || "";
          const phone = row["Phone Number"]?.toString().trim() || "";
          const email = row["Email Address"]?.toString().trim() || "";
          const location = row["Current Location"]?.toString().trim() || "";
          const value = row["Contribution Value"]?.toString().trim() || "";
          const contribution = row["Contribution Details"]?.toString().trim() || "";

          const isValid = name !== "" && contribution !== "";

          return {
            id: idx,
            name,
            batch: batch || "N/A",
            role: role || "Alumni Member",
            phone: phone || "Not Provided",
            email: email || "Not Provided",
            location: location || "N/A",
            value: value || "N/A",
            contribution,
            isValid,
            validationError: !name 
              ? "Alumni Name is missing" 
              : !contribution 
                ? "Contribution Details are missing" 
                : undefined
          };
        });

        setPreviewAlumni(validated);
        showToast(`📊 Loaded ${validated.length} alumni records. Review preview in the modal.`);
      } catch (err) {
        console.error(err);
        showToast("❌ Failed to parse file. Make sure it is a valid Excel or CSV sheet.", "error");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = async () => {
    const validAlumni = previewAlumni.filter(s => s.isValid);
    if (validAlumni.length === 0) {
      showToast("⚠️ No valid alumni records to import.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/alumni/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alumni: validAlumni.map(a => ({
            name: a.name,
            batch: a.batch,
            contribution: a.contribution,
            role: a.role,
            phone: a.phone,
            email: a.email,
            location: a.location,
            value: a.value,
            schoolId: mySchoolId || null,
          }))
        })
      });
      const json = await res.json();
      if (json.success) {
        showToast(`🎉 Successfully imported ${json.created} alumni contribution records!`);
        fetchAlumni();
        setPreviewAlumni([]);
        setIsModalOpen(false);
      } else {
        showToast("❌ Failed to save alumni records.", "error");
      }
    } catch {
      showToast("🔴 Network error — could not save imported records.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newContribution) return;

    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/alumni`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          batch: newBatch,
          contribution: newContribution,
          role: newRole,
          phone: newPhone || "N/A",
          email: newEmail || "N/A",
          location: newLocation || "N/A",
          value: newValue || "N/A",
          schoolId: mySchoolId || null,
        })
      });
      const json = await res.json();
      if (json.success) {
        showToast(`🎉 Alumni record for ${newName} successfully registered.`);
        // Immediately add to local state so user sees it without logout/login
        if (json.data) {
          setAlumni((prev) => {
            const exists = prev.find((a) => a.id === json.data.id);
            return exists ? prev : [json.data, ...prev];
          });
        }
        fetchAlumni();
        setNewName("");
        setNewContribution("");
        setNewBatch("2005");
        setNewRole("Alumni Member");
        setNewPhone("");
        setNewEmail("");
        setNewLocation("");
        setNewValue("");
        setIsModalOpen(false);
      } else {
        showToast("❌ Failed to save alumni record.", "error");
      }
    } catch {
      showToast("🔴 Network error — could not save alumni record.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PortalLayout
      title="School Alumni Network"
      subtitle="Mr. Venkatesh R. · GHS Coimbatore · DISE: 33012345"
      avatarLetter="V"
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      {/* School Badge — locked to this headmaster's school */}
      <div className="glass rounded-2xl p-4 border border-slate-800 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 fade-in">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Managed Institution</h3>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Alumni data is scoped to your assigned school only.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 rounded-xl px-4 py-2 w-full sm:w-auto">
          <span className="text-blue-400 text-base">🏫</span>
          <span className="text-xs font-bold text-blue-300">
            {schools.find((s) => s.id === mySchoolId)?.name || (mySchoolId ? "Your School" : "No school linked")}
          </span>
          <span className="ml-2 px-2 py-0.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-[9px] font-bold text-blue-400 uppercase tracking-wider">Assigned</span>
        </div>
      </div>

      {/* Metric totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 fade-in">
        <div className="glass rounded-2xl p-6 text-center border border-slate-800">
          <div className="text-3xl mb-2">🎓</div>
          <div className="text-2xl font-black text-white mb-0.5">{isLoading ? "..." : alumni.length}</div>
          <div className="text-[10px] text-slate-500 font-extrabold uppercase">Registered Alumni Contributors</div>
        </div>
        <div className="glass rounded-2xl p-6 text-center border border-slate-800">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-black text-emerald-400 mb-0.5">{isLoading ? "..." : formatRupees(totalDonations)}</div>
          <div className="text-[10px] text-slate-500 font-extrabold uppercase">Donations Received</div>
        </div>
        <div className="glass rounded-2xl p-6 text-center border border-slate-800">
          <div className="text-3xl mb-2">🏗️</div>
          <div className="text-2xl font-black text-blue-400 mb-0.5">{isLoading ? "..." : projectsFundedCount}</div>
          <div className="text-[10px] text-slate-500 font-extrabold uppercase">Major Projects Funded (&gt;= ₹1.5L)</div>
        </div>
      </div>

      {toast && (
        <div className={`mb-6 p-4 border text-xs rounded-xl shadow-lg ${
          toast.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-300" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Main Directory panel */}
      <div className="glass rounded-2xl p-6 border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-white">🏆 Notable Alumni Contributions</h2>
            {isLoading && <div className="w-4 h-4 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
          >
            + Register Alumni Contribution
          </button>
        </div>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {alumni.length === 0 && !isLoading ? (
            <div className="text-center py-12 text-slate-500 text-xs bg-slate-900/40 rounded-xl border border-slate-850">
              No alumni contributions found. Click "+ Register Alumni Contribution" to add data.
            </div>
          ) : (
            alumni.map((al) => (
              <div 
                key={al.id} 
                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/95 hover:bg-white text-slate-800 border border-slate-200 rounded-xl gap-4 shadow-md hover:shadow-lg transition-all duration-200 relative group"
              >
                <div className="flex-1 pr-16">
                  <div className="font-extrabold text-blue-700 text-xs mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-slate-900 text-sm sm:text-base">{al.name}</span>
                    <span className="text-[10px] text-slate-500 font-bold">Batch of {al.batch}</span>
                    <span className="text-[9px] text-slate-400 font-semibold">({al.location})</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-2 font-semibold">{al.contribution}</div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-semibold space-x-2">
                    <span>Ph: {al.phone}</span>
                    <span>•</span>
                    <span>Email: {al.email}</span>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end gap-1.5 whitespace-nowrap self-start md:self-auto">
                  <div className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg">
                    {al.role}
                  </div>
                  {al.value !== "N/A" && (
                    <span className="text-[10px] sm:text-xs text-emerald-650 font-extrabold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg shadow-sm">
                      Value: {al.value.startsWith("₹") ? al.value : `₹${al.value}`}
                    </span>
                  )}
                </div>
                {al.id && (
                  <button
                    onClick={() => handleDelete(al.id!)}
                    className="absolute top-4 right-4 text-[9px] sm:text-[10px] text-red-650 hover:text-red-800 font-bold border border-red-200 hover:border-red-300 px-2 py-0.5 rounded-lg bg-red-50 hover:bg-red-100/50 transition-colors shadow-sm"
                  >
                    ✕ Remove
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-4xl rounded-3xl p-6 space-y-6 relative transition-all duration-300"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)"
            }}
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                {previewAlumni.length > 0 ? "📋 Preview Alumni Contributions Import" : "🎓 Register Alumni Contribution"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setPreviewAlumni([]);
                }}
                className="text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                ✕ Close
              </button>
            </div>

            {previewAlumni.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <div className="font-bold text-emerald-600 uppercase tracking-wider">
                    Parsed {previewAlumni.length} Alumni Records
                  </div>
                  <div className="text-slate-500 font-semibold">
                    {previewAlumni.filter(s => !s.isValid).length} invalid rows found
                  </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100 sticky top-0">
                          <th className="p-3 text-slate-700 font-semibold">Alumni Name</th>
                          <th className="p-3 text-slate-700 font-semibold">Batch</th>
                          <th className="p-3 text-slate-700 font-semibold">Role</th>
                          <th className="p-3 text-slate-700 font-semibold">Phone Number</th>
                          <th className="p-3 text-slate-700 font-semibold">Email</th>
                          <th className="p-3 text-slate-700 font-semibold">Location</th>
                          <th className="p-3 text-slate-700 font-semibold">Contribution Value</th>
                          <th className="p-3 text-slate-700 font-semibold">Details</th>
                          <th className="p-3 text-slate-700 font-semibold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {previewAlumni.map((s) => (
                          <tr 
                            key={s.id} 
                            className={s.isValid ? "hover:bg-slate-100/80 text-slate-800" : "bg-red-50/70 hover:bg-red-100/70 text-slate-800"}
                          >
                            <td className="p-3 font-semibold text-slate-900">
                              {s.name || <span className="text-red-500 italic">Name Missing</span>}
                            </td>
                            <td className="p-3 text-slate-700">{s.batch}</td>
                            <td className="p-3 text-slate-800">{s.role}</td>
                            <td className="p-3 text-slate-700">{s.phone}</td>
                            <td className="p-3 text-slate-700">{s.email}</td>
                            <td className="p-3 text-slate-700">{s.location}</td>
                            <td className="p-3 text-slate-700">{s.value}</td>
                            <td className="p-3 text-slate-600 truncate max-w-[120px]" title={s.contribution}>{s.contribution}</td>
                            <td className="p-3 text-right">
                              {s.isValid ? (
                                <span className="text-emerald-600 font-medium">✓ Ready</span>
                              ) : (
                                <span className="text-red-500 font-semibold" title={s.validationError}>
                                  ⚠️ Invalid
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={handleConfirmImport}
                    disabled={isSaving || previewAlumni.filter(s => s.isValid).length === 0}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center space-x-2"
                  >
                    {isSaving && <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                    <span>Confirm Import ({previewAlumni.filter(s => s.isValid).length} Records)</span>
                  </button>
                  <button
                    onClick={() => setPreviewAlumni([])}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors border border-slate-200"
                  >
                    Discard
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form Input */}
                <form onSubmit={handleManualSubmit} className="space-y-3">
                  <div className="text-xs font-bold text-blue-650 uppercase tracking-wider mb-1">Manual Entry</div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Alumni Name</label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Dr. Ramakrishnan"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Batch Year</label>
                      <input
                        type="text"
                        required
                        value={newBatch}
                        onChange={(e) => setNewBatch(e.target.value)}
                        placeholder="e.g. 1994"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Current Role</label>
                      <input
                        type="text"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        placeholder="e.g. IAS Officer"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Current Location</label>
                      <input
                        type="text"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="e.g. Chennai"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Phone Number</label>
                      <input
                        type="text"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="e.g. 9876543240"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Email Address</label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="e.g. ram@gmail.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Contribution Value (₹)</label>
                      <input
                        type="text"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder="e.g. 200000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Contribution Details</label>
                    <textarea
                      value={newContribution}
                      onChange={(e) => setNewContribution(e.target.value)}
                      placeholder="e.g. Donated 20 desktop terminals..."
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-md mt-2 flex items-center justify-center gap-2"
                  >
                    {isSaving && <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                    <span>Save Contribution</span>
                  </button>
                </form>

                {/* Excel Import */}
                <div className="border-l border-slate-200 pl-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex justify-between items-center">
                      <span>Excel Import</span>
                      <button
                        onClick={downloadExcelTemplate}
                        type="button"
                        className="text-[10px] text-blue-600 hover:text-blue-700 font-bold underline cursor-pointer"
                      >
                        📥 Get Template
                      </button>
                    </div>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 min-h-[160px] border-2 border-dashed ${
                        isDragging 
                          ? "border-emerald-500 bg-emerald-50" 
                          : "border-slate-300 bg-white hover:border-emerald-500"
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                          <span className="text-[10px] text-slate-500">Parsing spreadsheet...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-4xl">📊</span>
                          <span className="text-xs font-bold text-slate-800">Import Alumni Roster</span>
                          <span className="text-[9px] text-slate-500 leading-normal">
                            Drag & drop Excel or click to upload
                          </span>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) parseFile(file);
                      }}
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                    />
                  </div>

                  <div className="text-[10px] text-slate-400 italic leading-relaxed pt-4">
                    * Upload template matches EMIS standard schema (Columns: Alumni Name, Batch Year, Current Role, Phone Number, Email Address, Current Location, Contribution Value, Contribution Details).
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
