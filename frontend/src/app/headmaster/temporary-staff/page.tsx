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

interface TempStaffMember {
  id?: string;
  name: string;
  role: string;
  agency: string;
  joined: string;
  status: string;
  phone: string;
  email: string;
  duration: string;
  salary: string;
  password: string;
  createdAt?: string;
}

interface ParsedPreviewTempStaff {
  id: number;
  name: string;
  role: string;
  agency: string;
  joined: string;
  phone: string;
  email: string;
  duration: string;
  salary: string;
  password: string;
  isValid: boolean;
  validationError?: string;
}

export default function TemporaryStaffPage() {
  const { data: session } = useSession();
  // Headmaster's own school — derived directly from session, never changes
  const mySchoolId: string = (session?.user as any)?.schoolId || "";
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [temps, setTemps] = useState<TempStaffMember[]>([]);
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
  const [newRole, setNewRole] = useState("Guest Teacher (Science)");
  const [newAgency, setNewAgency] = useState("Direct Contract");
  const [newJoined, setNewJoined] = useState("June 2026");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDuration, setNewDuration] = useState("12 Months");
  const [newSalary, setNewSalary] = useState("₹15,000");
  const [newPassword, setNewPassword] = useState("123456");

  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [previewStaff, setPreviewStaff] = useState<ParsedPreviewTempStaff[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempStaffToDelete, setTempStaffToDelete] = useState<TempStaffMember | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<TempStaffMember | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  // ── Fetch from PostgreSQL — always scoped to this headmaster's school ───
  const fetchTemps = useCallback(async () => {
    if (!mySchoolId) return; // wait until session has loaded
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/temp-staff?schoolId=${mySchoolId}`);
      const json = await res.json();
      if (json.success) {
        setTemps(json.data);
      } else {
        showToast("⚠️ Could not load temp staff from server.", "error");
      }
    } catch {
      showToast("🔴 Server offline — could not load data.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [mySchoolId]);

  useEffect(() => { fetchTemps(); }, [fetchTemps]);

  const downloadExcelTemplate = () => {
    const headers = ["Staff Name", "Designated Role", "Source / Agency", "Joined Date", "Phone Number", "Email Address", "Contract Duration", "Monthly Stipend", "Password"];
    const sampleData = [
      { "Staff Name": "Mr. Karthick M.", "Designated Role": "Guest Teacher (Math)", "Source / Agency": "Direct Contract", "Joined Date": "Jan 2026", "Phone Number": "9876543230", "Email Address": "karthick@emis.tn.gov.in", "Contract Duration": "12 Months", "Monthly Stipend": "₹18,000", "Password": "password123" },
      { "Staff Name": "Mrs. Revathi P.", "Designated Role": "Cleaning Staff", "Source / Agency": "TN Outsourcing Ltd", "Joined Date": "Aug 2025", "Phone Number": "9876543231", "Email Address": "revathi@emis.tn.gov.in", "Contract Duration": "24 Months", "Monthly Stipend": "₹10,500", "Password": "password123" },
    ];
    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Temp Staff Template");
    XLSX.writeFile(workbook, "temporary_staff_template.xlsx");
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
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
        interface ExcelTempRow {
          "Staff Name"?: string; "Designated Role"?: string; "Source / Agency"?: string;
          "Joined Date"?: string; "Phone Number"?: string; "Email Address"?: string;
          "Contract Duration"?: string; "Monthly Stipend"?: string | number; "Password"?: string;
        }
        const parsedData = XLSX.utils.sheet_to_json<ExcelTempRow>(sheet);
        const validated: ParsedPreviewTempStaff[] = parsedData.map((row, idx) => {
          const name = row["Staff Name"]?.toString().trim() || "";
          const role = row["Designated Role"]?.toString().trim() || "";
          const agency = row["Source / Agency"]?.toString().trim() || "";
          const joined = row["Joined Date"]?.toString().trim() || "";
          const phone = row["Phone Number"]?.toString().trim() || "";
          const email = row["Email Address"]?.toString().trim() || "";
          const duration = row["Contract Duration"]?.toString().trim() || "12 Months";
          const salary = row["Monthly Stipend"]?.toString().trim() || "N/A";
          const password = row["Password"]?.toString().trim() || "123456";
          const isValid = name !== "" && role !== "";
          return { id: idx, name, role, agency: agency || "Direct Contract", joined: joined || "June 2026", phone: phone || "Not Provided", email: email || "Not Provided", duration, salary, password, isValid, validationError: !name ? "Name is missing" : !role ? "Role is missing" : undefined };
        });
        setPreviewStaff(validated);
        showToast(`📊 Loaded ${validated.length} staff records. Review preview before saving.`);
      } catch (err) {
        console.error(err);
        showToast("❌ Failed to parse file. Make sure it is a valid Excel or CSV sheet.", "error");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  // ── Save bulk to PostgreSQL ─────────────────────────────────────
  const handleConfirmImport = async () => {
    const validStaff = previewStaff.filter((s) => s.isValid).map((s) => ({
      ...s,
      schoolId: mySchoolId || null,
    }));
    if (validStaff.length === 0) { showToast("⚠️ No valid staff to import.", "error"); return; }
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/temp-staff/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staff: validStaff }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`🎉 Saved ${json.created} contract staff to database!`);
        setPreviewStaff([]);
        setIsModalOpen(false);
        fetchTemps();
      } else {
        showToast(`❌ Import failed: ${json.error}`, "error");
      }
    } catch {
      showToast("🔴 Server offline — could not save to database.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Save single manual entry ────────────────────────────────────
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRole) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/temp-staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName, role: newRole, agency: newAgency, joined: newJoined,
          phone: newPhone || "N/A", email: newEmail || "N/A", duration: newDuration,
          salary: newSalary, password: newPassword || "123456",
          schoolId: mySchoolId || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`🎉 Contract staff ${newName} registered and saved!`);
        // Immediately add to local state so user sees it without logout/login
        if (json.data) {
          setTemps((prev) => {
            const exists = prev.find((t) => t.id === json.data.id);
            return exists ? prev : [json.data, ...prev];
          });
        }
        setNewName(""); setNewRole("Guest Teacher (Science)"); setNewAgency("Direct Contract");
        setNewJoined("June 2026"); setNewPhone(""); setNewEmail(""); setNewDuration("12 Months");
        setNewSalary("₹15,000"); setNewPassword("123456");
        setIsModalOpen(false);
        fetchTemps();
      } else {
        showToast(`❌ Could not save: ${json.error}`, "error");
      }
    } catch {
      showToast("🔴 Server offline — could not save record.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete temp staff member ─────────────────────────────────────
  const confirmDelete = async () => {
    if (!tempStaffToDelete?.id) return;
    try {
      await fetch(`${API_BASE}/api/headmaster/temp-staff/${tempStaffToDelete.id}`, { method: "DELETE" });
      setTemps((prev) => prev.filter((t) => t.id !== tempStaffToDelete.id));
      showToast("🗑️ Contract staff record removed.");
    } catch {
      showToast("🔴 Could not delete — server error.", "error");
    } finally {
      setTempStaffToDelete(null);
    }
  };

  return (
    <PortalLayout
      title="Temporary & Contract Staff"
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
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Temporary staff data is scoped to your assigned school only.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 rounded-xl px-4 py-2 w-full sm:w-auto">
          <span className="text-blue-400 text-base">🏫</span>
          <span className="text-xs font-bold text-blue-300">
            {schools.find((s) => s.id === mySchoolId)?.name || (mySchoolId ? "Your School" : "No school linked")}
          </span>
          <span className="ml-2 px-2 py-0.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-[9px] font-bold text-blue-400 uppercase tracking-wider">Assigned</span>
        </div>
      </div>

      {/* Metric summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 fade-in">
        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <div className="text-slate-400 text-sm mb-2 font-medium">Total Contract Staff</div>
          <div className="text-3xl font-extrabold text-blue-400">{isLoading ? "—" : temps.length} staff</div>
        </div>
        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <div className="text-slate-400 text-sm mb-2 font-medium">Agency Outsourced</div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {isLoading ? "—" : temps.filter((t) => t.agency.includes("Outsourcing") || t.agency.includes("Scheme")).length} staff
          </div>
        </div>
        <div className="glass rounded-2xl p-6 border border-slate-700/50">
          <div className="text-slate-400 text-sm mb-2 font-medium">Direct Contracts</div>
          <div className="text-3xl font-extrabold text-amber-400">
            {isLoading ? "—" : temps.filter((t) => t.agency === "Direct Contract").length} staff
          </div>
        </div>
      </div>

      {toast && (
        <div className={`mb-6 p-4 border text-xs rounded-xl shadow-lg ${toast.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-300" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"}`}>
          {toast.msg}
        </div>
      )}

      {/* Directory Table */}
      <div className="glass rounded-2xl p-6 border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-white">📋 Contract Staff Directory</h2>
            {isLoading && <div className="w-4 h-4 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
          >
            + Add Contract Staff
          </button>
        </div>

        {temps.length === 0 && !isLoading ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            <div className="text-3xl mb-3">🤝</div>
            <div className="font-semibold text-slate-400 mb-1">No contract staff records yet</div>
            <div>Use the form or Excel import to add records to the database.</div>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Staff Details</th>
                  <th>Designated Role</th>
                  <th>Source / Agency</th>
                  <th>Joined Date</th>
                  <th>Stipend & Contract</th>
                  <th>Password</th>
                  <th>Added On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {temps.map((t) => (
                  <tr key={t.id || t.name}>
                    <td className="font-bold text-xs py-3">
                      <div>{t.name}</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-1 space-x-2 flex flex-wrap">
                        <span>Ph: {t.phone || "N/A"}</span>
                        <span>•</span>
                        <span>Email: {t.email || "N/A"}</span>
                      </div>
                    </td>
                    <td>{t.role}</td>
                    <td>{t.agency}</td>
                    <td>{t.joined}</td>
                    <td>
                      <div className="text-xs text-blue-400 font-semibold">{t.salary}</div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">{t.duration}</div>
                    </td>
                    <td className="text-slate-300 font-medium text-xs">{t.password || "123456"}</td>
                    <td className="text-[10px] text-slate-500">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td>
    {t.id && (
      <div className="flex flex-row gap-2 justify-center">
        <button
          onClick={() => {
            setStaffToEdit(t);
            setIsEditModalOpen(true);
          }}
          className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold border border-blue-500/20 px-2 py-1 rounded-lg transition-colors flex items-center justify-center"
        >
          ✎
        </button>

        <button
          onClick={() => setTempStaffToDelete(t)}
          className="text-[10px] text-red-400 hover:text-red-300 font-semibold border border-red-500/20 px-2 py-1 rounded-lg transition-colors flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    )}
  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-4xl rounded-3xl p-6 space-y-6 relative transition-all duration-300"
            style={{ background: "#ffffff", border: "1px solid rgba(0, 0, 0, 0.08)", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)" }}
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                {previewStaff.length > 0 ? "📋 Preview Contract Staff Import" : "🤝 Register Temporary & Contract Staff"}
              </h3>
              <button
                onClick={() => { setIsModalOpen(false); setPreviewStaff([]); }}
                className="text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                ✕ Close
              </button>
            </div>

            {previewStaff.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <div className="font-bold text-emerald-600 uppercase tracking-wider">Parsed {previewStaff.length} Staff Members</div>
                  <div className="text-slate-500 font-semibold">{previewStaff.filter((s) => !s.isValid).length} invalid rows found</div>
                </div>
                <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100 sticky top-0">
                          <th className="p-3 text-slate-700 font-semibold">Staff Name</th>
                          <th className="p-3 text-slate-700 font-semibold">Designated Role</th>
                          <th className="p-3 text-slate-700 font-semibold">Agency</th>
                          <th className="p-3 text-slate-700 font-semibold">Joined</th>
                          <th className="p-3 text-slate-700 font-semibold">Phone</th>
                          <th className="p-3 text-slate-700 font-semibold">Email</th>
                          <th className="p-3 text-slate-700 font-semibold">Duration</th>
                          <th className="p-3 text-slate-700 font-semibold">Stipend</th>
                          <th className="p-3 text-slate-700 font-semibold">Password</th>
                          <th className="p-3 text-slate-700 font-semibold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {previewStaff.map((s) => (
                          <tr key={s.id} className={s.isValid ? "hover:bg-slate-100/80 text-slate-800" : "bg-red-50/70 text-slate-800"}>
                            <td className="p-3 font-semibold text-slate-900">{s.name || <span className="text-red-500 italic">Name Missing</span>}</td>
                            <td className="p-3 text-slate-700">{s.role || <span className="text-red-500 italic">Role Missing</span>}</td>
                            <td className="p-3 text-slate-800">{s.agency}</td>
                            <td className="p-3 text-slate-700">{s.joined}</td>
                            <td className="p-3 text-slate-700">{s.phone}</td>
                            <td className="p-3 text-slate-700">{s.email}</td>
                            <td className="p-3 text-slate-700">{s.duration}</td>
                            <td className="p-3 text-slate-700">{s.salary}</td>
                            <td className="p-3 text-slate-700">{s.password}</td>
                            <td className="p-3 text-right">
                              {s.isValid ? <span className="text-emerald-600 font-medium">✓ Ready</span> : <span className="text-red-500 font-semibold" title={s.validationError}>⚠️ Invalid</span>}
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
                    disabled={previewStaff.filter((s) => s.isValid).length === 0 || isSaving}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <><div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving to DB...</>
                    ) : `💾 Save to Database (${previewStaff.filter((s) => s.isValid).length} Staff)`}
                  </button>
                  <button
                    onClick={() => setPreviewStaff([])}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors border border-slate-200"
                  >Discard</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form */}
                <form onSubmit={handleManualSubmit} className="space-y-3">
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Manual Entry</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Full Name</label>
                      <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Mr. Rajesh P."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Designated Role</label>
                      <input type="text" required value={newRole} onChange={(e) => setNewRole(e.target.value)}
                        placeholder="e.g. Guest Teacher (Math)"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Agency / Source</label>
                      <select value={newAgency} onChange={(e) => setNewAgency(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors">
                        <option value="Direct Contract">Direct Contract</option>
                        <option value="TN Outsourcing Ltd">TN Outsourcing Ltd</option>
                        <option value="Govt Scheme Contract">Govt Scheme Contract</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Joined Date</label>
                      <input type="text" required value={newJoined} onChange={(e) => setNewJoined(e.target.value)}
                        placeholder="e.g. June 2026"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Phone Number</label>
                      <input type="text" required value={newPhone} onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="e.g. 9876543235"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Email Address</label>
                      <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="e.g. rajesh@emis.tn.gov.in"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Contract Duration</label>
                      <input type="text" required value={newDuration} onChange={(e) => setNewDuration(e.target.value)}
                        placeholder="e.g. 12 Months"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Monthly Stipend</label>
                      <input type="text" required value={newSalary} onChange={(e) => setNewSalary(e.target.value)}
                        placeholder="e.g. ₹15,000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Default Portal Password</label>
                    <input type="text" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="e.g. password123"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                  </div>
                  <button type="submit" disabled={isSaving}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-md mt-2 flex items-center justify-center gap-2">
                    {isSaving ? (
                      <><div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving...</>
                    ) : "💾 Save Contract Record"}
                  </button>
                </form>

                {/* Excel Import */}
                <div className="border-l border-slate-200 pl-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex justify-between items-center">
                      <span>Excel Import</span>
                      <button onClick={downloadExcelTemplate} type="button"
                        className="text-[10px] text-blue-600 hover:text-blue-700 font-bold underline cursor-pointer">
                        📥 Get Template
                      </button>
                    </div>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 min-h-[160px] border-2 border-dashed ${
                        isDragging ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-white hover:border-emerald-500"
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
                          <span className="text-xs font-bold text-slate-800">Import Staff Roster</span>
                          <span className="text-[9px] text-slate-500 leading-normal">Drag & drop Excel or click to upload</span>
                        </>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef}
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) parseFile(file); }}
                      accept=".xlsx,.xls,.csv" className="hidden" />
                  </div>
                  <div className="text-[10px] text-slate-400 italic leading-relaxed pt-4">
                    * Data is stored in PostgreSQL — persists across sessions and refreshes.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {tempStaffToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl p-6 relative bg-white border border-slate-200 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Remove Temporary Staff?</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-800">{tempStaffToDelete.name}</strong> from the registry? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setTempStaffToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && staffToEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-2xl rounded-3xl p-6 space-y-6 relative transition-all duration-300 bg-white"
            style={{ border: "1px solid rgba(0, 0, 0, 0.08)", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)" }}
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">✎ Edit Temporary Staff</h3>
              <button
                onClick={() => { setIsEditModalOpen(false); setStaffToEdit(null); }}
                className="text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                ✕ Close
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSaving(true);
              try {
                const res = await fetch(`${API_BASE}/api/headmaster/temp-staff/${staffToEdit.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(staffToEdit),
                });
                const json = await res.json();
                if (json.success) {
                  showToast(`🎉 Contract staff ${staffToEdit.name} updated successfully!`);
                  setIsEditModalOpen(false);
                  fetchTemps();
                } else {
                  showToast(`❌ Could not update: ${json.error}`, "error");
                }
              } catch {
                showToast("🔴 Server offline — could not update record.", "error");
              } finally {
                setIsSaving(false);
              }
            }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Full Name</label>
                  <input type="text" required value={staffToEdit.name} onChange={(e) => setStaffToEdit({ ...staffToEdit, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Designated Role</label>
                  <input type="text" required value={staffToEdit.role} onChange={(e) => setStaffToEdit({ ...staffToEdit, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500 transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Agency / Source</label>
                  <select value={staffToEdit.agency} onChange={(e) => setStaffToEdit({ ...staffToEdit, agency: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500 transition-colors">
                    <option value="Direct Contract">Direct Contract</option>
                    <option value="TN Outsourcing Ltd">TN Outsourcing Ltd</option>
                    <option value="Govt Scheme Contract">Govt Scheme Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Joined Date</label>
                  <input type="text" required value={staffToEdit.joined} onChange={(e) => setStaffToEdit({ ...staffToEdit, joined: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500 transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Phone Number</label>
                  <input type="text" required value={staffToEdit.phone} onChange={(e) => setStaffToEdit({ ...staffToEdit, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Email Address</label>
                  <input type="email" required value={staffToEdit.email} onChange={(e) => setStaffToEdit({ ...staffToEdit, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500 transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Contract Duration</label>
                  <input type="text" required value={staffToEdit.duration} onChange={(e) => setStaffToEdit({ ...staffToEdit, duration: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Monthly Stipend</label>
                  <input type="text" required value={staffToEdit.salary} onChange={(e) => setStaffToEdit({ ...staffToEdit, salary: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Update Password</label>
                <input type="text" value={staffToEdit.password} onChange={(e) => setStaffToEdit({ ...staffToEdit, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500 transition-colors" />
              </div>
              <button type="submit" disabled={isSaving}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-md mt-2 flex items-center justify-center gap-2">
                {isSaving ? (
                  <><div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving...</>
                ) : "💾 Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
