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

interface StudentLinkInfo {
  linkId: string;
  isPrimary: boolean;
  student: {
    id: string;
    class: string;
    section: string;
    rollNumber: string | null;
    user: { name: string };
  };
}

interface CommitteeMember {
  id?: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  studentName: string;
  studentClass: string;
  term: string;
  password?: string;
  createdAt?: string;
  linkedStudents?: StudentLinkInfo[];
}

interface Student {
  id: string;
  class: string;
  section: string;
  rollNumber: string | null;
  user: { name: string };
}

interface PTAMeeting {
  id: string;
  title: string;
  description: string | null;
  meetingDate: string;
  venue: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  agenda: string[];
}

interface ParsedPreviewPTAMember {
  id: number;
  name: string;
  role: string;
  phone: string;
  email: string;
  studentName: string;
  studentClass: string;
  term: string;
  password: string;
  isValid: boolean;
  validationError?: string;
}

interface Grievance {
  topic: string;
  raisedBy: string;
  status: "Under Review" | "Approved" | "Resolved";
  border: string;
  bg: string;
}

export default function ParentsPage() {
  const { data: session } = useSession();
  // Headmaster's own school — derived directly from session, never changes
  const mySchoolId: string = (session?.user as any)?.schoolId || "";
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [committee, setCommittee] = useState<CommitteeMember[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [ptaMeetings, setPtaMeetings] = useState<PTAMeeting[]>([]);
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


  const [grievances] = useState<Grievance[]>([
    { topic: "Transport facility delays in Zone B", raisedBy: "12 parents", status: "Under Review", border: "border-amber-500/20", bg: "bg-amber-500/10 text-amber-400" },
    { topic: "Request for extra special classes for 10th", raisedBy: "PTA Committee", status: "Approved", border: "border-emerald-500/20", bg: "bg-emerald-500/10 text-emerald-400" },
    { topic: "RO Water filter service required in block C", raisedBy: "Class 7 Representative", status: "Resolved", border: "border-blue-500/20", bg: "bg-blue-500/10 text-blue-400" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPtaModalOpen, setIsPtaModalOpen] = useState(false);

  // Parent Form
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("Committee Member (Parent)");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newTerm, setNewTerm] = useState("2025-26");
  const [newPassword, setNewPassword] = useState("123456");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // PTA Meeting Form
  const [newPtaTitle, setNewPtaTitle] = useState("");
  const [newPtaDesc, setNewPtaDesc] = useState("");
  const [newPtaDate, setNewPtaDate] = useState("");
  const [newPtaVenue, setNewPtaVenue] = useState("School Auditorium");
  const [newPtaAgenda, setNewPtaAgenda] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [parentToDelete, setParentToDelete] = useState<CommitteeMember | null>(null);
  const [meetingToDelete, setMeetingToDelete] = useState<PTAMeeting | null>(null);
  const [previewMembers, setPreviewMembers] = useState<ParsedPreviewPTAMember[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchData = useCallback(async () => {
    if (!mySchoolId) return; // wait until session has loaded
    setIsLoading(true);
    try {
      const [parRes, stuRes, ptaRes] = await Promise.all([
        fetch(`${API_BASE}/api/headmaster/parents?schoolId=${mySchoolId}`),
        fetch(`${API_BASE}/api/students?schoolId=${mySchoolId}`),
        fetch(`${API_BASE}/api/headmaster/pta-meetings?schoolId=${mySchoolId}`)
      ]);
      const [parJson, stuJson, ptaJson] = await Promise.all([
        parRes.json(),
        stuRes.json(),
        ptaRes.json()
      ]);

      if (parJson.success) setCommittee(parJson.data);
      if (stuJson.success) setStudents(stuJson.data);
      if (ptaJson.success) setPtaMeetings(ptaJson.data);
    } catch {
      showToast("🔴 Server offline — could not load data.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [mySchoolId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Delete a committee member ────────────────────────────────────
  const confirmDeleteParent = async () => {
    if (!parentToDelete) return;
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/parents/${parentToDelete.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("🎉 PTA officer removed successfully.");
        setCommittee(prev => prev.filter(p => p.id !== parentToDelete.id));
      } else {
        showToast("❌ Failed to remove PTA officer.", "error");
      }
    } catch {
      showToast("🔴 Network error — could not remove PTA officer.", "error");
    } finally {
      setParentToDelete(null);
    }
  };

  // ── Delete PTA meeting ────────────────────────────────────
  const confirmDeleteMeeting = async () => {
    if (!meetingToDelete) return;
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/pta-meetings/${meetingToDelete.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("🎉 PTA meeting removed successfully.");
        setPtaMeetings(prev => prev.filter(p => p.id !== meetingToDelete.id));
      } else {
        showToast("❌ Failed to remove PTA meeting.", "error");
      }
    } catch {
      showToast("🔴 Network error — could not remove PTA meeting.", "error");
    } finally {
      setMeetingToDelete(null);
    }
  };

  const downloadExcelTemplate = () => {
    const headers = [
      "Parent Name",
      "Committee Role",
      "Phone Number",
      "Email Address",
      "Ward Name",
      "Ward Class & Section",
      "Committee Term",
      "Password"
    ];
    const sampleData = [
      {
        "Parent Name": "Mr. R. Kumar",
        "Committee Role": "President (Parent)",
        "Phone Number": "+91 98765 43210",
        "Email Address": "kumar.r@gmail.com",
        "Ward Name": "K. Ramesh",
        "Ward Class & Section": "Class 10A",
        "Committee Term": "2025-26",
        "Password": "password123"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PTA Template");
    XLSX.writeFile(workbook, "pta_committee_template.xlsx");
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

        interface ExcelPTARow {
          "Parent Name"?: string;
          "Committee Role"?: string;
          "Phone Number"?: string;
          "Email Address"?: string;
          "Ward Name"?: string;
          "Ward Class & Section"?: string;
          "Committee Term"?: string;
          "Password"?: string;
        }

        const parsedData = XLSX.utils.sheet_to_json<ExcelPTARow>(sheet);

        const validated: ParsedPreviewPTAMember[] = parsedData.map((row, idx) => {
          const name = row["Parent Name"]?.toString().trim() || "";
          const role = row["Committee Role"]?.toString().trim() || "";
          const phone = row["Phone Number"]?.toString().trim() || "";
          const email = row["Email Address"]?.toString().trim() || "";
          const studentName = row["Ward Name"]?.toString().trim() || "";
          const studentClass = row["Ward Class & Section"]?.toString().trim() || "";
          const term = row["Committee Term"]?.toString().trim() || "2025-26";
          const password = row["Password"]?.toString().trim() || "123456";

          const isValid = name !== "" && role !== "" && phone !== "";

          return {
            id: idx,
            name,
            role,
            phone: phone || "Not Provided",
            email: email || "Not Provided",
            studentName: studentName || "N/A",
            studentClass: studentClass || "N/A",
            term,
            password,
            isValid,
            validationError: !name ? "Parent Name missing" : !role ? "Role missing" : !phone ? "Phone missing" : undefined
          };
        });

        setPreviewMembers(validated);
        showToast(`📊 Loaded ${validated.length} PTA officers.`);
      } catch (err) {
        console.error(err);
        showToast("❌ Failed to parse file.", "error");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = async () => {
    const validMembers = previewMembers.filter(s => s.isValid);
    if (validMembers.length === 0) {
      showToast("⚠️ No valid PTA officers to import.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/parents/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parents: validMembers.map(m => ({
            name: m.name,
            role: m.role,
            phone: m.phone,
            email: m.email === "Not Provided" ? null : m.email,
            studentName: m.studentName,
            studentClass: m.studentClass,
            term: m.term,
            password: m.password,
            schoolId: mySchoolId || null,
          }))
        })
      });
      const json = await res.json();
      if (json.success) {
        showToast(`🎉 Successfully imported ${json.created} PTA committee officers!`);
        fetchData();
        setPreviewMembers([]);
        setIsModalOpen(false);
      } else {
        showToast("❌ Failed to save PTA officers.", "error");
      }
    } catch {
      showToast("🔴 Network error.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone || !newRole) return;

    setIsSaving(true);
    try {
      const selStudent = students.find(s => s.id === selectedStudentId);
      const studentName = selStudent ? selStudent.user.name : "N/A";
      const studentClass = selStudent ? `Class ${selStudent.class}${selStudent.section}` : "N/A";

      const res = await fetch(`${API_BASE}/api/headmaster/parents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          role: newRole,
          phone: newPhone,
          email: newEmail || null,
          studentName,
          studentClass,
          term: newTerm,
          password: newPassword || "123456",
          schoolId: mySchoolId || null,
        })
      });
      const json = await res.json();
      if (json.success) {
        // Now link student
        if (selectedStudentId) {
          await fetch(`${API_BASE}/api/headmaster/parents/${json.data.id}/link-student`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId: selectedStudentId, isPrimary: true })
          });
        }
        showToast(`🎉 PTA Officer ${newName} successfully registered.`);
        // Immediately add to local state so user sees it without logout/login
        if (json.data) {
          setCommittee((prev) => {
            const exists = prev.find((p) => p.id === json.data.id);
            return exists ? prev : [json.data, ...prev];
          });
        }
        fetchData();
        setNewName("");
        setNewPhone("");
        setNewEmail("");
        setSelectedStudentId("");
        setNewTerm("2025-26");
        setNewPassword("123456");
        setIsModalOpen(false);
      } else {
        showToast("❌ Failed to save PTA officer.", "error");
      }
    } catch {
      showToast("🔴 Network error — could not save PTA officer.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPtaTitle || !newPtaDate) return;
    setIsSaving(true);
    try {
      const agendaArray = newPtaAgenda.split("\n").filter(a => a.trim() !== "");
      const res = await fetch(`${API_BASE}/api/headmaster/pta-meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPtaTitle,
          description: newPtaDesc,
          meetingDate: newPtaDate,
          venue: newPtaVenue,
          agenda: agendaArray,
          schoolId: mySchoolId || null,
        })
      });
      const json = await res.json();
      if (json.success) {
        showToast(`🎉 PTA Meeting created.`);
        fetchData();
        setNewPtaTitle("");
        setNewPtaDesc("");
        setNewPtaDate("");
        setNewPtaAgenda("");
        setIsPtaModalOpen(false);
      } else {
        showToast("❌ Failed to save meeting.", "error");
      }
    } catch {
      showToast("🔴 Network error.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const nextUpcomingMeeting = ptaMeetings.find(m => m.status === "Upcoming") || ptaMeetings[0];
  const fmtDate = (d: string) => new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  return (
    <PortalLayout
      title="Parents & PTA Committee"
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
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Parent & PTA data is scoped to your assigned school only.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 rounded-xl px-4 py-2 w-full sm:w-auto">
          <span className="text-blue-400 text-base">🏫</span>
          <span className="text-xs font-bold text-blue-300">
            {schools.find((s) => s.id === mySchoolId)?.name || (mySchoolId ? "Your School" : "No school linked")}
          </span>
          <span className="ml-2 px-2 py-0.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-[9px] font-bold text-blue-400 uppercase tracking-wider">Assigned</span>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Parents Teachers Association (PTA)</h2>
          <p className="text-xs text-slate-400">View active committee members, meeting records and address parental grievances.</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Next PTA Meeting</div>
          <div className="text-sm font-bold text-amber-400 mt-1">
            {nextUpcomingMeeting ? fmtDate(nextUpcomingMeeting.meetingDate) : "None Scheduled"}
          </div>
        </div>
      </div>

      {toast && (
        <div className={`mb-6 p-4 border text-xs rounded-xl shadow-lg ${toast.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-300" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
          }`}>
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Core committee */}
        <div className="glass rounded-2xl p-6 border border-slate-800 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-white">PTA Core Committee Officers</h3>
              {isLoading && <div className="w-4 h-4 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-xl transition-all shadow-md whitespace-nowrap"
            >
              + Register PTA Officer
            </button>
          </div>
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {committee.length === 0 && !isLoading ? (
              <div className="text-center py-12 text-slate-500 text-xs bg-slate-900/40 rounded-xl border border-slate-850">
                No PTA committee officers found.
              </div>
            ) : (
              committee.map((p) => {
                const linkedNames = p.linkedStudents?.map(l => `${l.student.user.name} (Cls ${l.student.class})`).join(', ');
                const displayWard = linkedNames ? linkedNames : (p.studentName !== "N/A" ? `${p.studentName} (${p.studentClass})` : "N/A");

                return (
                  <div key={p.id} className="p-4 border border-slate-200 rounded-xl bg-white/95 hover:bg-white text-slate-800 shadow-md transition-all duration-200 relative group">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 pr-24">
                      <div>
                        <div className="font-extrabold text-slate-900 text-xs sm:text-sm">{p.name}</div>
                        <div className="text-[10px] sm:text-xs text-blue-600 font-bold mt-0.5">{p.role}</div>
                      </div>
                      <div className="sm:text-right">
                        <div className="text-[10px] sm:text-xs text-slate-700 font-bold">{p.phone}</div>
                        {p.email && <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium mt-0.5 break-all sm:break-normal">{p.email}</div>}
                      </div>
                    </div>
                    <div className="border-t border-slate-100 mt-2.5 pt-2 flex flex-col gap-1 text-[9px] sm:text-[10px] text-slate-500 font-semibold">
                      <span>Ward: <span className="text-slate-800 font-bold">{displayWard}</span></span>
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                        <span>Pwd: <span className="text-blue-650 font-bold">{p.password || "123456"}</span></span>
                        <span>Term: {p.term}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setParentToDelete(p)}
                      className="absolute top-4 right-4 text-[9px] text-red-600 hover:text-red-800 font-bold border border-red-200 hover:border-red-300 px-2 py-1 rounded-lg bg-red-50 transition-colors shadow-sm flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Grievances list */}
      <div className="glass rounded-2xl p-6 border border-slate-800 mb-6">
        <h3 className="text-sm font-bold text-white mb-4">Recent Parental Grievances & Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {grievances.map((g, i) => (
            <div key={i} className={`p-3.5 border-l-2 ${g.border} bg-slate-900/60 rounded-r-xl`}>
              <div className="flex justify-between items-start gap-2 mb-1.5">
                <h4 className="text-xs font-bold text-white leading-relaxed">{g.topic}</h4>
                <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${g.bg} whitespace-nowrap`}>
                  {g.status}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold">Raised by: {g.raisedBy}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Parent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl rounded-3xl p-6 space-y-6 relative transition-all duration-300" style={{ background: "#ffffff", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)" }}>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">👪 Register PTA Committee Member</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-800 text-xs font-semibold">✕ Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Input */}
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div className="text-xs font-bold text-blue-650 uppercase tracking-wider mb-1">Manual Entry</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Parent Name</label>
                    <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Committee Role</label>
                    <input type="text" required value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Phone Number</label>
                    <input type="text" required value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Email Address</label>
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Link Student (Optional but recommended)</label>
                  <select
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                  >
                    <option value="">-- Do not link student --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.user.name} ({s.rollNumber}) - Class {s.class}{s.section}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Committee Term</label>
                    <input type="text" required value={newTerm} onChange={(e) => setNewTerm(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-1 font-semibold">Portal Password</label>
                    <input type="text" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800" />
                  </div>
                </div>

                <button type="submit" disabled={isSaving} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md mt-2">
                  Save Officer Roster
                </button>
              </form>

              {/* Excel Import */}
              <div className="border-l border-slate-200 pl-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex justify-between items-center">
                    <span>Excel Import</span>
                    <button onClick={downloadExcelTemplate} type="button" className="text-[10px] text-blue-600 font-bold underline">📥 Template</button>
                  </div>
                  <div onClick={() => fileInputRef.current?.click()} className="rounded-2xl p-6 text-center cursor-pointer min-h-[160px] border-2 border-dashed border-slate-300 hover:border-emerald-500 flex flex-col items-center justify-center space-y-3">
                    <span className="text-4xl">📊</span>
                    <span className="text-xs font-bold text-slate-800">Import PTA Roster</span>
                    <span className="text-[9px] text-slate-500">Drag & drop Excel or click</span>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={(e) => { const file = e.target.files?.[0]; if (file) parseFile(file); }} accept=".xlsx,.xls,.csv" className="hidden" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PTA Meeting Modal */}
      {isPtaModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl p-6 space-y-4 relative bg-slate-900 border border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">🤝 Schedule PTA Meeting</h3>
              <button onClick={() => setIsPtaModalOpen(false)} className="text-slate-400 hover:text-white text-xs font-semibold">✕ Close</button>
            </div>
            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Meeting Title</label>
                <input type="text" required value={newPtaTitle} onChange={(e) => setNewPtaTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" placeholder="e.g. Term 1 Review" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Date & Time</label>
                  <input type="datetime-local" required value={newPtaDate} onChange={(e) => setNewPtaDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Venue</label>
                  <input type="text" value={newPtaVenue} onChange={(e) => setNewPtaVenue(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Description / Notice</label>
                <textarea rows={2} value={newPtaDesc} onChange={(e) => setNewPtaDesc(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" placeholder="Optional brief" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Agenda Points (One per line)</label>
                <textarea rows={4} value={newPtaAgenda} onChange={(e) => setNewPtaAgenda(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" placeholder="Discuss exam scores&#10;School fees&#10;Annual day" />
              </div>
              <button type="submit" disabled={isSaving} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors">
                Schedule Meeting
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Parent */}
      {parentToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Remove PTA Officer?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">Are you sure you want to remove <span className="font-bold text-slate-700">{parentToDelete.name}</span>?</p>
            <div className="flex gap-3">
              <button onClick={() => setParentToDelete(null)} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs">Cancel</button>
              <button onClick={confirmDeleteParent} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs">Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Meeting */}
      {meetingToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Delete Meeting?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">Are you sure you want to delete <span className="font-bold text-slate-700">{meetingToDelete.title}</span>?</p>
            <div className="flex gap-3">
              <button onClick={() => setMeetingToDelete(null)} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs">Cancel</button>
              <button onClick={confirmDeleteMeeting} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
