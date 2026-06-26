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

interface StaffMember {
  id?: string;
  name: string;
  emisId: string;
  subject: string;
  phone: string;
  email: string;
  attendance: number;
  performance: "Excellent" | "Good" | "Average";
  leaveUsed: number;
  password: string;
  createdAt?: string;
}

interface ParsedPreviewTeacher {
  id: number;
  name: string;
  emisId: string;
  subject: string;
  phone: string;
  email: string;
  attendance: number;
  performance: "Excellent" | "Good" | "Average";
  leaveUsed: number;
  password: string;
  isValid: boolean;
  validationError?: string;
}

export default function StaffManagementPage() {
  const { data: session } = useSession();
  // Headmaster's own school — derived directly from session, never changes
  const mySchoolId: string = (session?.user as any)?.schoolId || "";
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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


  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmisId, setNewEmisId] = useState("");
  const [newSubject, setNewSubject] = useState("Science");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newAttendance, setNewAttendance] = useState<number>(100);
  const [newPerformance, setNewPerformance] = useState<"Excellent" | "Good" | "Average">("Good");
  const [newLeave, setNewLeave] = useState<number>(0);
  const [newPassword, setNewPassword] = useState("123456");

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [previewTeachers, setPreviewTeachers] = useState<ParsedPreviewTeacher[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<StaffMember | null>(null);
  const [editForm, setEditForm] = useState<Partial<StaffMember>>({});

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  // ── Fetch staff — always scoped to this headmaster's school ──────
  const fetchStaff = useCallback(async () => {
    if (!mySchoolId) return; // wait until session has loaded
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/staff?schoolId=${mySchoolId}`);
      const json = await res.json();
      if (json.success) {
        setStaff(json.data);
      } else {
        showToast("⚠️ Could not load staff from server.", "error");
      }
    } catch {
      showToast("🔴 Server offline — could not load staff.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [mySchoolId]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  // ── Excel download template ─────────────────────────────────────
  const downloadExcelTemplate = () => {
    const headers = [
      "Teacher Name", "EMIS ID", "Subject Speciality", "Phone Number",
      "Email Address", "Attendance Rate (%)", "Performance Index",
      "Leave Balance Used", "Password",
    ];
    const sampleData = [
      {
        "Teacher Name": "Mrs. Sumathi Devi", "EMIS ID": "TCH201",
        "Subject Speciality": "Mathematics", "Phone Number": "9876543220",
        "Email Address": "sumathi@emis.tn.gov.in", "Attendance Rate (%)": 96,
        "Performance Index": "Excellent", "Leave Balance Used": 1, "Password": "password123",
      },
      {
        "Teacher Name": "Mr. Rajan K.", "EMIS ID": "TCH202",
        "Subject Speciality": "Science", "Phone Number": "9876543221",
        "Email Address": "rajan@emis.tn.gov.in", "Attendance Rate (%)": 92,
        "Performance Index": "Good", "Leave Balance Used": 0, "Password": "password123",
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staff Template");
    XLSX.writeFile(workbook, "teacher_import_template.xlsx");
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
        interface ExcelTeacherRow {
          "Teacher Name"?: string; "EMIS ID"?: string; "Subject Speciality"?: string;
          "Phone Number"?: string; "Email Address"?: string;
          "Attendance Rate (%)"?: string | number; "Performance Index"?: string;
          "Leave Balance Used"?: string | number; "Password"?: string;
        }
        const parsedData = XLSX.utils.sheet_to_json<ExcelTeacherRow>(sheet);
        const validated: ParsedPreviewTeacher[] = parsedData.map((row, idx) => {
          const name = row["Teacher Name"]?.toString().trim() || "";
          const emisId = row["EMIS ID"]?.toString().trim() || "";
          const subject = row["Subject Speciality"]?.toString().trim() || "";
          const phone = row["Phone Number"]?.toString().trim() || "";
          const email = row["Email Address"]?.toString().trim() || "";
          const rawAttendance = row["Attendance Rate (%)"];
          const rawPerformance = row["Performance Index"]?.toString().trim() || "";
          const rawLeave = row["Leave Balance Used"];
          const password = row["Password"]?.toString().trim() || "123456";
          let attendance = 100;
          if (rawAttendance !== undefined) attendance = parseFloat(rawAttendance.toString()) || 100;
          let leaveUsed = 0;
          if (rawLeave !== undefined) leaveUsed = parseInt(rawLeave.toString(), 10) || 0;
          let performance: "Excellent" | "Good" | "Average" = "Good";
          if (rawPerformance === "Excellent" || rawPerformance === "Average") performance = rawPerformance;
          const isValid = name !== "" && emisId !== "";
          return {
            id: idx, name, emisId, subject: subject || "General",
            phone: phone || "Not Provided", email: email || "Not Provided",
            attendance, performance, leaveUsed, password, isValid,
            validationError: !name ? "Name is missing" : !emisId ? "EMIS ID is missing" : undefined,
          };
        });
        setPreviewTeachers(validated);
        showToast(`📊 Loaded ${validated.length} teachers. Review preview in the modal.`);
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

  // ── Save bulk import to PostgreSQL ──────────────────────────────
  const handleConfirmImport = async () => {
    const validTeachers = previewTeachers.filter((s) => s.isValid).map((t) => ({
      ...t,
      schoolId: mySchoolId || null,
    }));
    if (validTeachers.length === 0) { showToast("⚠️ No valid teachers to import.", "error"); return; }
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/staff/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staff: validTeachers }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`🎉 Successfully saved ${json.created} teachers to database!`);
        setPreviewTeachers([]);
        setIsAddModalOpen(false);
        // Refetch to show all newly imported staff immediately
        fetchStaff();
      } else {
        showToast(`❌ Import failed: ${json.error}`, "error");
      }
    } catch {
      showToast("🔴 Server offline — could not save to database.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Save single manual entry to PostgreSQL ──────────────────────
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmisId) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName, emisId: newEmisId, subject: newSubject,
          phone: newPhone || "N/A", email: newEmail || null,
          attendance: newAttendance, performance: newPerformance,
          leaveUsed: newLeave, password: newPassword || "123456",
          schoolId: mySchoolId || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`🎉 ${newName} registered to teaching staff registry!`);
        // Immediately add new record to local state so it shows without needing logout/login
        if (json.data) {
          setStaff((prev) => {
            const exists = prev.find((s) => s.id === json.data.id);
            return exists ? prev : [json.data, ...prev];
          });
        }
        setNewName(""); setNewEmisId(""); setNewSubject("Science"); setNewPhone("");
        setNewEmail(""); setNewAttendance(100); setNewPerformance("Good"); setNewLeave(0); setNewPassword("123456");
        setIsAddModalOpen(false);
        // Also refetch to ensure full sync
        fetchStaff();
      } else {
        showToast(`❌ Could not save: ${json.error}`, "error");
      }
    } catch {
      showToast("🔴 Server offline — could not save record.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete staff member ─────────────────────────────────────────
  const confirmDelete = async () => {
    if (!staffToDelete?.id) return;
    try {
      await fetch(`${API_BASE}/api/headmaster/staff/${staffToDelete.id}`, { method: "DELETE" });
      setStaff((prev) => prev.filter((s) => s.id !== staffToDelete.id));
      showToast("🗑️ Staff member removed.");
    } catch {
      showToast("🔴 Could not delete — server error.", "error");
    } finally {
      setStaffToDelete(null);
    }
  };

  // ── Edit staff member ─────────────────────────────────────────
  const openEditModal = (s: StaffMember) => {
    setStaffToEdit(s);
    setEditForm({
      name: s.name,
      emisId: s.emisId,
      subject: s.subject,
      phone: s.phone,
      email: s.email,
      attendance: s.attendance,
      performance: s.performance,
      leaveUsed: s.leaveUsed,
      password: s.password
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffToEdit?.id) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/staff/${staffToEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`🎉 ${editForm.name} updated successfully!`);
        setIsEditModalOpen(false);
        fetchStaff();
      } else {
        showToast(`❌ Could not update: ${json.error}`, "error");
      }
    } catch {
      showToast("🔴 Server offline — could not update record.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const totalPages = Math.ceil(staff.length / pageSize);
  const paginatedStaff = staff.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <PortalLayout
      title="Staff Management"
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
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Staff data is scoped to your assigned school only.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 rounded-xl px-4 py-2 w-full sm:w-auto">
          <span className="text-blue-400 text-base">🏫</span>
          <span className="text-xs font-bold text-blue-300">
            {schools.find((s) => s.id === mySchoolId)?.name || (mySchoolId ? "Your School" : "No school linked")}
          </span>
          <span className="ml-2 px-2 py-0.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-[9px] font-bold text-blue-400 uppercase tracking-wider">Assigned</span>
        </div>
      </div>

      {/* Staff Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
        {[
          { label: "Total Teaching Staff", value: staff.length, icon: "👩‍🏫", color: "text-blue-400", bg: "bg-blue-500/10", sub: "Permanent" },
          { label: "Staff Present Today", value: staff.filter((s) => s.attendance >= 90).length, icon: "🟢", color: "text-emerald-400", bg: "bg-emerald-500/10", sub: "Healthy attendance" },
          { label: "Total Leave Days", value: staff.reduce((acc, curr) => acc + (curr.leaveUsed ?? 0), 0), icon: "📄", color: "text-amber-400", bg: "bg-amber-500/10", sub: "This term cumulative" },
          { label: "Excellent Performers", value: staff.filter((s) => s.performance === "Excellent").length, icon: "⭐", color: "text-cyan-400", bg: "bg-cyan-500/10", sub: "Top rated staff" },
        ].map((kpi) => (
          <div key={kpi.label} className="glass rounded-2xl p-4 border border-slate-800 flex items-center justify-between hover:scale-[1.02] transition-all shadow-sm">
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{kpi.label}</span>
              <span className={`text-2xl font-black ${kpi.color} mt-1`}>{kpi.value}</span>
              <span className="text-[10px] text-slate-500 font-semibold mt-0.5 truncate">{kpi.sub}</span>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${kpi.bg} ${kpi.color} shrink-0 ml-2 shadow-sm`}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <div className={`mb-6 p-4 border text-xs rounded-xl shadow-lg ${toast.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-300" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"}`}>
          {toast.msg}
        </div>
      )}

      {/* Main Table */}
      <div className="glass rounded-2xl p-6 border border-slate-800 mb-6">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-white">👩‍🏫 Teaching Staff Directory</h2>
            {isLoading && <div className="w-4 h-4 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />}
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
          >
            + Add Teacher
          </button>
        </div>

        {staff.length === 0 && !isLoading ? (
          <div className="text-center py-12 text-slate-500 text-xs">No staff records found. Click "+ Add Teacher" to get started.</div>
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Teacher Details</th>
                  <th>Subject Speciality</th>
                  <th>Attendance Rate</th>
                  <th>Performance Index</th>
                  <th>Leave Balance Used</th>
                  <th>Added Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStaff.map((s) => (
                  <tr key={s.id || s.emisId}>
                    <td className="font-bold text-green text-xs py-3">
                      <div>{s.name}</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-1 space-x-2 flex flex-wrap">
                        <span>ID: {s.emisId || "N/A"}</span>
                        <span>•</span>
                        <span>Ph: {s.phone || "N/A"}</span>
                        <span>•</span>
                        <span>Email: {s.email || "N/A"}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Pass: {s.password}</div>
                    </td>
                    <td>{s.subject}</td>
                    <td>
                      <span className={`badge ${s.attendance >= 95 ? "badge-green" : s.attendance >= 90 ? "badge-yellow" : "badge-red"}`}>
                        {s.attendance}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        s.performance === "Excellent" ? "badge-green" : s.performance === "Good" ? "badge-blue" : "badge-yellow"
                      }`}>
                        {s.performance}
                      </span>
                    </td>
                    <td className={(s.leaveUsed ?? 0) >= 2 ? "text-red-400 font-bold" : "text-slate-400"}>{s.leaveUsed ?? 0} days</td>
                    <td className="text-slate-500 text-[10px]">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(s)}
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold border border-blue-500/20 px-2 py-1 rounded-lg transition-colors"
                        >
                          ✎ Edit
                        </button>
                        {s.id && (
                          <button
                            onClick={() => setStaffToDelete(s)}
                            className="text-[10px] text-red-400 hover:text-red-300 font-semibold border border-red-500/20 px-2 py-1 rounded-lg transition-colors"
                          >
                            ✕ Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-slate-400">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, staff.length)} of {staff.length} entries
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs rounded-lg transition-colors border border-slate-700"
                >
                  Previous
                </button>
                <div className="px-3 py-1 bg-slate-900/50 text-slate-400 text-xs rounded-lg border border-slate-800">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs rounded-lg transition-colors border border-slate-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {staffToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl p-6 relative bg-white border border-slate-200 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Remove Staff Member?</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to remove <strong>{staffToDelete.name}</strong> from the registry? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setStaffToDelete(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {isEditModalOpen && staffToEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl p-6 relative bg-white border border-slate-200 shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">✎ Edit Staff Member</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-slate-800 text-xs font-semibold">✕ Close</button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Full Name</label>
                  <input type="text" required value={editForm.name || ""} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1 font-semibold">EMIS ID (Cannot be changed)</label>
                  <input type="text" disabled value={editForm.emisId || ""} className="w-full bg-slate-200 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-600 cursor-not-allowed" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Subject</label>
                  <select value={editForm.subject || ""} onChange={(e) => setEditForm({...editForm, subject: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500">
                    <option value="Mathematics">Mathematics</option><option value="Science">Science</option><option value="English">English</option><option value="Tamil">Tamil</option><option value="Social Science">Social Science</option><option value="Computer Science">Computer Science</option><option value="Physical Education">Physical Education</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Performance Index</label>
                  <select value={editForm.performance || "Good"} onChange={(e) => setEditForm({...editForm, performance: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500">
                    <option value="Excellent">Excellent</option><option value="Good">Good</option><option value="Average">Average</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Phone Number</label>
                  <input type="text" value={editForm.phone || ""} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Email Address</label>
                  <input type="email" value={editForm.email || ""} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Attendance Rate (%)</label>
                  <input type="number" min="0" max="100" value={editForm.attendance || 0} onChange={(e) => setEditForm({...editForm, attendance: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Leave Balance Used</label>
                  <input type="number" min="0" value={editForm.leaveUsed || 0} onChange={(e) => setEditForm({...editForm, leaveUsed: parseInt(e.target.value, 10) || 0})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Update Password</label>
                <input type="text" value={editForm.password || ""} onChange={(e) => setEditForm({...editForm, password: e.target.value})} placeholder="Leave blank to keep current password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500" />
              </div>
              <button type="submit" disabled={isSaving} className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-md mt-2 flex items-center justify-center gap-2">
                {isSaving ? <><div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving...</> : "💾 Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add teacher modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-4xl rounded-3xl p-6 space-y-6 relative transition-all duration-300"
            style={{ background: "#ffffff", border: "1px solid rgba(0, 0, 0, 0.08)", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)" }}
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                {previewTeachers.length > 0 ? "📋 Preview Staff Import" : "👩‍🏫 Register New Teaching Faculty"}
              </h3>
              <button
                onClick={() => { setIsAddModalOpen(false); setPreviewTeachers([]); }}
                className="text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                ✕ Close
              </button>
            </div>

            {previewTeachers.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <div className="font-bold text-emerald-600 uppercase tracking-wider">Parsed {previewTeachers.length} Teachers</div>
                  <div className="text-slate-500 font-semibold">{previewTeachers.filter((s) => !s.isValid).length} invalid rows found</div>
                </div>
                <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded-xl bg-slate-50/50">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100 sticky top-0">
                          <th className="p-3 text-slate-700 font-semibold">Teacher Name</th>
                          <th className="p-3 text-slate-700 font-semibold">ID</th>
                          <th className="p-3 text-slate-700 font-semibold">Subject</th>
                          <th className="p-3 text-slate-700 font-semibold">Phone</th>
                          <th className="p-3 text-slate-700 font-semibold">Email</th>
                          <th className="p-3 text-slate-700 font-semibold">Attendance</th>
                          <th className="p-3 text-slate-700 font-semibold">Performance</th>
                          <th className="p-3 text-slate-700 font-semibold">Leave</th>
                          <th className="p-3 text-slate-700 font-semibold">Password</th>
                          <th className="p-3 text-slate-700 font-semibold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {previewTeachers.map((s) => (
                          <tr key={s.id} className={s.isValid ? "hover:bg-slate-100/80 text-slate-800" : "bg-red-50/70 text-slate-800"}>
                            <td className="p-3 font-semibold text-slate-900">{s.name || <span className="text-red-500 italic">Name Missing</span>}</td>
                            <td className="p-3 text-slate-700">{s.emisId || <span className="text-red-500 italic">ID Missing</span>}</td>
                            <td className="p-3 text-slate-800">{s.subject}</td>
                            <td className="p-3 text-slate-700">{s.phone}</td>
                            <td className="p-3 text-slate-700">{s.email}</td>
                            <td className="p-3 text-slate-700">{s.attendance}%</td>
                            <td className="p-3 text-slate-700">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                s.performance === "Excellent" ? "bg-green-50 text-green-700 border border-green-200" :
                                s.performance === "Good" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                                "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}>{s.performance}</span>
                            </td>
                            <td className="p-3 text-slate-700">{s.leaveUsed} days</td>
                            <td className="p-3 text-slate-700">{s.password}</td>
                            <td className="p-3 text-right">
                              {s.isValid ? <span className="text-emerald-600 font-medium">✓ Ready</span> : <span className="text-red-500 font-semibold">⚠️ Invalid</span>}
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
                    disabled={previewTeachers.filter((s) => s.isValid).length === 0 || isSaving}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <><div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving to DB...</>
                    ) : `💾 Save to Database (${previewTeachers.filter((s) => s.isValid).length} Teachers)`}
                  </button>
                  <button
                    onClick={() => setPreviewTeachers([])}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors border border-slate-200"
                  >Discard</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form */}
                <form onSubmit={handleAddStaff} className="space-y-3">
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Manual Entry</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Full Name</label>
                      <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Mr. Vignesh K."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">ID</label>
                      <input type="text" required value={newEmisId} onChange={(e) => setNewEmisId(e.target.value)}
                        placeholder="e.g. TCH206"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Subject Specialty</label>
                      <select value={newSubject} onChange={(e) => setNewSubject(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors">
                        <option value="Mathematics">Mathematics</option>
                        <option value="Science">Science</option>
                        <option value="English">English</option>
                        <option value="Tamil">Tamil</option>
                        <option value="Social Science">Social Science</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Physical Education">Physical Education</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Performance Index</label>
                      <select value={newPerformance} onChange={(e) => setNewPerformance(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors">
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Average">Average</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Phone Number</label>
                      <input type="text" required value={newPhone} onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="e.g. 9876543225"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Email Address</label>
                      <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="e.g. vignesh@emis.tn.gov.in"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Attendance Rate (%)</label>
                      <input type="number" min="0" max="100" required value={newAttendance}
                        onChange={(e) => setNewAttendance(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Leave Balance Used</label>
                      <input type="number" min="0" required value={newLeave}
                        onChange={(e) => setNewLeave(parseInt(e.target.value, 10) || 0)}
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
                    ) : "💾 Register Teacher"}
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
                          <span className="text-xs font-bold text-slate-800">Import Teacher Roster</span>
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
    </PortalLayout>
  );
}
