"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

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
  fatherName?: string | null;
  motherName?: string | null;
  parentName?: string | null;
  parentMobile?: string | null;
  phoneNumber?: string | null;
  parentEmail?: string | null;
  user: { name: string; mobile?: string | null; email?: string | null };
}

interface PTAMeeting {
  id: string;
  title: string;
  description: string | null;
  meetingDate: string;
  venue: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  agenda: string[];
  acceptCount?: number;
  declineCount?: number;
  tentativeCount?: number;
  rsvps?: any;
}

// Helper: a meeting is "expired" if its date is in the past but still marked Upcoming
const isExpiredMeeting = (m: PTAMeeting): boolean => {
  return m.status === "Upcoming" && new Date(m.meetingDate) < new Date();
};

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
  id?: string;
  topic: string;
  raisedBy: string;
  status: "Under Review" | "Approved" | "Resolved";
  border?: string;
  bg?: string;
}

export default function ParentsPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  // Headmaster's own school — derived directly from session, never changes
  const mySchoolId: string = (session?.user as any)?.schoolId || "";
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [committee, setCommittee] = useState<CommitteeMember[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [ptaMeetings, setPtaMeetings] = useState<PTAMeeting[]>([]);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
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



  const [activeSubTab, setActiveSubTab] = useState<"meetings" | "officers" | "directory">("meetings");
  const [parentClassFilter, setParentClassFilter] = useState("all");
  const [parentDirectorySearch, setParentDirectorySearch] = useState("");
  const [parentCurrentPage, setParentCurrentPage] = useState(1);
  const [parentRowsPerPage, setParentRowsPerPage] = useState(10);
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
  const [studentSearchTerm, setStudentSearchTerm] = useState("");

  const filteredStudents = useMemo(() => {
    if (!studentSearchTerm.trim()) return students;
    const term = studentSearchTerm.toLowerCase();
    return students.filter(s =>
      s.user?.name?.toLowerCase().includes(term) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(term)) ||
      `class ${s.class}${s.section}`.toLowerCase().includes(term) ||
      `${s.class}${s.section}`.toLowerCase().includes(term)
    );
  }, [students, studentSearchTerm]);

  // Derived Parent Directory with Student & Login info
  const parentDirectory = useMemo(() => {
    const list: Array<{
      id: string;
      parentName: string;
      phone: string;
      email: string;
      studentName: string;
      studentClass: string;
      rawClass: string;
      password?: string;
      isPTA: boolean;
      ptaRole?: string;
    }> = [];

    students.forEach((s) => {
      const pName = s.parentName || s.fatherName || s.motherName || `${s.user?.name || "Student"}'s Parent`;
      const pPhone = s.parentMobile || s.phoneNumber || s.user?.mobile || "N/A";
      const pEmail = s.parentEmail || s.user?.email || "N/A";
      const ptaMatch = committee.find(c =>
        (c.linkedStudents?.some(l => l.student.id === s.id)) ||
        (c.phone && c.phone === pPhone && pPhone !== "N/A") ||
        (c.studentName && c.studentName.toLowerCase() === s.user?.name?.toLowerCase())
      );

      list.push({
        id: s.id,
        parentName: pName,
        phone: pPhone,
        email: pEmail,
        studentName: s.user?.name || "N/A",
        studentClass: `Class ${s.class}${s.section ? `-${s.section}` : ""}`,
        rawClass: String(s.class || "").replace(/^Class\s*/i, "").trim(),
        password: "123456",
        isPTA: !!ptaMatch,
        ptaRole: ptaMatch?.role
      });
    });

    return list;
  }, [students, committee]);

  const filteredParentDirectory = useMemo(() => {
    return parentDirectory.filter(p => {
      // Class filter (6 to 12)
      let matchesClass = true;
      if (parentClassFilter !== "all") {
        const clsNum = String(p.rawClass).toLowerCase();
        const targetCls = parentClassFilter.toLowerCase();
        matchesClass = clsNum === targetCls || clsNum.includes(targetCls);
      }

      // Search filter (parentName, phone, email, studentName)
      let matchesSearch = true;
      if (parentDirectorySearch.trim()) {
        const q = parentDirectorySearch.toLowerCase();
        matchesSearch =
          p.parentName.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.studentName.toLowerCase().includes(q) ||
          p.studentClass.toLowerCase().includes(q);
      }

      return matchesClass && matchesSearch;
    });
  }, [parentDirectory, parentClassFilter, parentDirectorySearch]);

  // Reset to Page 1 when filter or search changes
  useEffect(() => {
    setParentCurrentPage(1);
  }, [parentClassFilter, parentDirectorySearch]);

  const totalParentPages = Math.ceil(filteredParentDirectory.length / parentRowsPerPage) || 1;

  const paginatedParentDirectory = useMemo(() => {
    const start = (parentCurrentPage - 1) * parentRowsPerPage;
    return filteredParentDirectory.slice(start, start + parentRowsPerPage);
  }, [filteredParentDirectory, parentCurrentPage, parentRowsPerPage]);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    if (!studentId) return;

    const found = students.find(s => s.id === studentId);
    if (found) {
      const pName = found.parentName || found.fatherName || found.motherName || `${found.user?.name || "Student"}'s Parent`;
      const pPhone = found.parentMobile || found.phoneNumber || found.user?.mobile || "";
      const pEmail = found.parentEmail || found.user?.email || "";

      if (pName) setNewName(pName);
      if (pPhone) setNewPhone(pPhone);
      if (pEmail) setNewEmail(pEmail);
    }
  };

  // Grievance Form & Handlers
  const [isGrvModalOpen, setIsGrvModalOpen] = useState(false);
  const [newGrvTopic, setNewGrvTopic] = useState("");
  const [newGrvRaisedBy, setNewGrvRaisedBy] = useState("PTA Committee");

  const handleCreateGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGrvTopic.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/grievances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId: mySchoolId,
          topic: newGrvTopic,
          raisedBy: newGrvRaisedBy,
          status: "Under Review"
        })
      });
      const json = await res.json();
      if (json.success) {
        setGrievances(prev => [json.data, ...prev]);
        showToast("✅ Grievance submitted dynamically!");
        setIsGrvModalOpen(false);
        setNewGrvTopic("");
      }
    } catch {
      showToast("🔴 Error submitting grievance", "error");
    }
  };

  const handleUpdateGrievanceStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/headmaster/grievances/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json();
      if (json.success) {
        setGrievances(prev => prev.map(g => g.id === id ? { ...g, status: newStatus as any } : g));
        showToast(`✅ Status updated to ${newStatus}`);
      }
    } catch {
      showToast("🔴 Error updating status", "error");
    }
  };
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
    setIsLoading(true);
    try {
      const q = mySchoolId ? `?schoolId=${encodeURIComponent(mySchoolId)}` : "";
      const [parRes, stuRes, ptaRes, grvRes] = await Promise.all([
        fetch(`${API_BASE}/api/headmaster/parents${q}`),
        fetch(`${API_BASE}/api/students${q}`),
        fetch(`${API_BASE}/api/headmaster/pta-meetings${q}`),
        fetch(`${API_BASE}/api/headmaster/grievances${q}`)
      ]);
      const [parJson, stuJson, ptaJson, grvJson] = await Promise.all([
        parRes.json(),
        stuRes.json(),
        ptaRes.json(),
        grvRes.json()
      ]);

      if (parJson.success) setCommittee(parJson.data);
      if (stuJson.success) setStudents(stuJson.data);
      if (ptaJson.success) setPtaMeetings(ptaJson.data);
      if (grvJson.success) setGrievances(grvJson.data);
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

  // Only show truly future meetings in "Next Meeting" banner
  const nextUpcomingMeeting = ptaMeetings.find(m => m.status === "Upcoming" && !isExpiredMeeting(m)) || null;
  const fmtDate = (d: string) => new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  // ── Mark meeting as Completed ────────────────────────────────
  const handleMarkCompleted = async (meetingId: string, meetingTitle: string) => {
    const result = await Swal.fire({
      title: "Mark as Completed?",
      html: `<p style="font-size:13px;color:#475569">This will mark <strong style="color:#1e293b">${meetingTitle}</strong> as <strong style="color:#3b82f6">Completed</strong>.<br/>Parents will see it in their Completed tab.</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Mark Completed",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3b82f6",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/api/headmaster/pta-meetings/${meetingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed" }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("✅ Meeting marked as Completed.");
        setPtaMeetings(prev =>
          prev.map(m => m.id === meetingId ? { ...m, status: "Completed" } : m)
        );
      } else {
        showToast("❌ Failed to update meeting status.", "error");
      }
    } catch {
      showToast("🔴 Network error.", "error");
    }
  };

  const showDeclineReasons = (m: PTAMeeting) => {
    const rsvps = m.rsvps || {};
    const declines = Object.entries(rsvps)
      .filter(([_, r]: any) => (typeof r === 'object' ? r.status : r) === 'Decline');

    if (declines.length === 0) return;

    const contentHtml = declines.map(([pId, r]: any) => {
      const parentName = committee.find(p => p.id === pId)?.name || "Registered Parent";
      const reasonText = (typeof r === 'object' ? r.reason : '') || "No reason specified";
      return `<div style="text-align: left; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
        <strong style="color: #1e293b;">${parentName}</strong>: 
        <span style="color: #dc2626; font-style: italic; font-weight: 650;">"${reasonText}"</span>
      </div>`;
    }).join('');

    Swal.fire({
      title: 'Decline Reasons',
      html: `<div style="max-height: 300px; overflow-y: auto;">${contentHtml}</div>`,
      confirmButtonText: 'Close',
      confirmButtonColor: '#3b82f6',
    });
  };

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "பரிசுகள் & பிடியெ கமிட்டி" : "Parents & PTA Committee"}
      subtitle={lang === "தமிழ்" ? "படிக்கம் முகாம் மேலாண்மை மற்றும் பெற்றோர் தொடர்பு களம்." : "PTA Committee management and parent engagement platform."}
      avatarLetter="V"
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >


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
          {ptaMeetings.some(isExpiredMeeting) && (
            <div className="mt-1.5 flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-[10px] font-bold text-amber-400">
                {ptaMeetings.filter(isExpiredMeeting).length} expired — needs action
              </span>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className={`mb-6 p-4 border text-xs rounded-xl shadow-lg ${toast.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-300" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
          }`}>
          {toast.msg}
        </div>
      )}

      {/* Sub-Tabs Navigation Toolbar */}
      <div className="glass rounded-2xl p-4 border border-slate-800/60 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 fade-in">
        {/* Sub-Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto overflow-x-auto">
          {[
            { id: "meetings", label: "PTA Meetings" },
            { id: "officers", label: "PTA Core Officers" },
            { id: "directory", label: "Parent Directory" }
          ].map(subTab => {
            const active = activeSubTab === subTab.id;
            return (
              <button
                key={subTab.id}
                onClick={() => setActiveSubTab(subTab.id as any)}
                className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${active
                  ? "bg-blue-600 text-white shadow-md font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
              >
                {subTab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: PTA Meetings */}
      {activeSubTab === "meetings" && (
        <div className="glass rounded-2xl p-6 border border-slate-800 flex flex-col mb-6 fade-in">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-white">Scheduled PTA Meetings</h3>
              {isLoading && <div className="w-4 h-4 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />}
            </div>
            <button
              onClick={() => setIsPtaModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Schedule PTA Meeting
            </button>
          </div>
          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {ptaMeetings.length === 0 && !isLoading ? (
              <div className="text-center py-12 text-slate-500 text-xs bg-slate-900/40 rounded-xl border border-slate-850">
                No PTA meetings scheduled.
              </div>
            ) : (
              ptaMeetings.map((m) => {
                const expired = isExpiredMeeting(m);
                return (
                  <div key={m.id} className={`p-5 border rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 ${
                    expired
                      ? "border-amber-200/80 bg-amber-50/90 dark:bg-amber-950/20 dark:border-amber-800/60"
                      : m.status === "Completed"
                      ? "border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90"
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Header: Title + Status Badge */}
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">
                            {m.title}
                          </h4>
                          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border flex items-center gap-1.5 ${
                              expired
                                ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700"
                                : m.status === "Upcoming"
                                ? "bg-emerald-100/90 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700"
                                : m.status === "Completed"
                                ? "bg-blue-100/90 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700"
                                : "bg-slate-100 text-slate-600 border-slate-300"
                            }`}>
                              {expired ? (
                                <><svg className="w-3 h-3 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Expired</>
                              ) : m.status === "Upcoming" ? (
                                <><svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>Upcoming</>
                              ) : m.status === "Completed" ? (
                                <><svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Completed</>
                              ) : (
                                "Cancelled"
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Date, Time & Venue Chips */}
                        <div className="flex items-center gap-3 flex-wrap text-xs font-semibold mt-2.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                            <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {fmtDate(m.meetingDate)}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                            <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {m.venue}
                          </span>
                        </div>

                        {/* RSVP Summary Pills */}
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            Accepted: {m.acceptCount || 0}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
                            <svg className="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            Declined: {m.declineCount || 0}
                            {(m.declineCount || 0) > 0 && (
                              <button
                                onClick={() => showDeclineReasons(m)}
                                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 font-bold underline ml-1 cursor-pointer"
                              >
                                (View Reasons)
                              </button>
                            )}
                          </span>
                        </div>

                        {/* Description / Notice callout box */}
                        {m.description && (
                          <div className="mt-3 p-3 bg-blue-50/60 dark:bg-slate-950/50 border-l-4 border-blue-500 rounded-r-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                            <span className="font-bold text-blue-600 dark:text-blue-400 mr-1.5 uppercase text-[10px] tracking-wide">Notice:</span>
                            {m.description}
                          </div>
                        )}

                        {/* Agenda Points - Clean bulleted list */}
                        {m.agenda && m.agenda.length > 0 && (
                          <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002-2V7a2 2 0 00-2-2h2m2 0h4m-4 0a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                              Agenda Points:
                            </div>
                            <ul className="space-y-1.5 pl-1">
                              {m.agenda.map((point, idx) => (
                                <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Action buttons (Top Right / Bottom Right) */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-1">
                        <button
                          onClick={() => setMeetingToDelete(m)}
                          className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold border border-rose-200 dark:border-rose-900/50 px-2.5 py-1.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Delete
                        </button>

                        {expired && (
                          <button
                            onClick={() => handleMarkCompleted(m.id, m.title)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: PTA Core Officers */}
      {activeSubTab === "officers" && (
        <div className="glass rounded-2xl p-6 border border-slate-800 flex flex-col mb-6 fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">PTA Core Officers</h3>
              {isLoading && <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Register PTA Officer
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[550px] overflow-y-auto pr-1">
            {committee.length === 0 && !isLoading ? (
              <div className="col-span-full text-center py-12 text-slate-500 text-xs bg-slate-900/40 rounded-xl border border-slate-850">
                No PTA committee officers found.
              </div>
            ) : (
              committee.map((p) => {
                const linkedNames = p.linkedStudents?.map(l => `${l.student.user.name} (Cls ${l.student.class})`).join(', ');
                const displayWard = linkedNames ? linkedNames : (p.studentName !== "N/A" ? `${p.studentName} (${p.studentClass})` : "N/A");

                const isValidTerm = p.term && (p.term.includes("-") || p.term.toLowerCase().includes("term") || /^\d{4}/.test(p.term));
                const displayTerm = isValidTerm ? p.term : "2025-26";
                let displayRelation = "Father";
                if (!isValidTerm && p.term && p.term !== "N/A") {
                  displayRelation = p.term;
                } else if (p.role.toLowerCase().includes("mother")) {
                  displayRelation = "Mother";
                } else if (p.role.toLowerCase().includes("guardian")) {
                  displayRelation = "Guardian";
                }

                return (
                  <div key={p.id} className="p-4 border border-slate-200 rounded-xl bg-white/95 hover:bg-white text-slate-800 shadow-md transition-all duration-200 group flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="font-extrabold text-slate-900 text-sm truncate">{p.name}</div>
                          <div className="text-[10.5px] text-blue-600 font-bold mt-0.5 mb-1 truncate">{p.role}</div>
                          <div className="text-[11px] text-slate-700 font-bold">{p.phone}</div>
                          {p.email && <div className="text-[10px] text-slate-500 font-medium mt-0.5 break-all">{p.email}</div>}
                        </div>
                        <button
                          onClick={() => setParentToDelete(p)}
                          className="shrink-0 text-[10px] text-red-600 hover:text-red-800 font-bold border border-red-200 hover:border-red-300 px-2 py-1 rounded-lg bg-red-50 transition-colors shadow-sm flex items-center gap-0.5 cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 mt-3 pt-2 flex flex-col gap-1 text-[10px] text-slate-500 font-semibold">
                      <div>
                        <span>Student / Child: </span>
                        <span className="text-slate-800 font-bold">{displayWard}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9.5px]">
                        <span>Academic Term: <span className="text-indigo-600 font-bold">{displayTerm}</span></span>
                        {displayRelation && (
                          <span>Relation: <span className="text-slate-700 font-bold">{displayRelation}</span></span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Parent Directory */}
      {activeSubTab === "directory" && (
        <div className="space-y-4 mb-6 fade-in font-sans">
          {/* Search, Class Filter & Rows Per Page Bar */}
          <div className="glass rounded-2xl p-4 border border-slate-200 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <input
                type="text"
                placeholder="🔍 Search parent name, phone, email, or student..."
                value={parentDirectorySearch}
                onChange={e => setParentDirectorySearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Class Filter (6th to 12th) */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Class:</span>
                <select
                  value={parentClassFilter}
                  onChange={e => setParentClassFilter(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
                >
                  <option value="all">All Classes</option>
                  {["6", "7", "8", "9", "10", "11", "12"].map(cls => (
                    <option key={cls} value={cls}>Class {cls}</option>
                  ))}
                </select>
              </div>

              {/* Rows Per Page Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Show:</span>
                <select
                  value={parentRowsPerPage}
                  onChange={e => {
                    setParentRowsPerPage(Number(e.target.value));
                    setParentCurrentPage(1);
                  }}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
                >
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Parents Table */}
          <div className="custom-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm bg-white dark:bg-slate-900/90">
            {isLoading ? (
              <div className="text-center py-16 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Loading Parent Directory...</span>
              </div>
            ) : filteredParentDirectory.length === 0 ? (
              <div className="text-center py-16 text-slate-500 dark:text-slate-400 text-xs font-medium">
                No matching parent records found in the directory.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-4">Parent Name</th>
                        <th className="p-4">Parent Of (Student & Class)</th>
                        <th className="p-4">Phone Number</th>
                        <th className="p-4">Email Address</th>
                        <th className="p-4">Portal Password</th>
                        <th className="p-4 text-center">PTA Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {paginatedParentDirectory.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="p-4 font-bold text-slate-900 dark:text-white">
                            <div>{p.parentName}</div>
                          </td>
                          <td className="p-4 font-semibold">
                            <div className="text-blue-600 dark:text-blue-400 font-bold">{p.studentName}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{p.studentClass}</div>
                          </td>
                          <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{p.phone}</td>
                          <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">{p.email}</td>
                          <td className="p-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">{p.password || "123456"}</td>
                          <td className="p-4 text-center">
                            {p.isPTA ? (
                              <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-[10px] font-bold">
                                {p.ptaRole || "PTA Officer"}
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
                                General Parent
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Clear & Visible Pagination Controls Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <div>
                    Showing <span className="font-bold text-slate-900 dark:text-white">{(parentCurrentPage - 1) * parentRowsPerPage + 1}</span> to{" "}
                    <span className="font-bold text-slate-900 dark:text-white">
                      {Math.min(parentCurrentPage * parentRowsPerPage, filteredParentDirectory.length)}
                    </span>{" "}
                    of <span className="font-bold text-slate-900 dark:text-white">{filteredParentDirectory.length}</span> parent records
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={parentCurrentPage <= 1}
                      onClick={() => setParentCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                    >
                      ← Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalParentPages }, (_, i) => i + 1)
                        .filter(page => page === 1 || page === totalParentPages || Math.abs(page - parentCurrentPage) <= 1)
                        .map((page, idx, arr) => {
                          const prevPage = arr[idx - 1];
                          const showEllipsis = prevPage && page - prevPage > 1;
                          return (
                            <React.Fragment key={page}>
                              {showEllipsis && <span className="px-1 text-slate-400 dark:text-slate-600 font-bold">...</span>}
                              <button
                                onClick={() => setParentCurrentPage(page)}
                                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  parentCurrentPage === page
                                    ? "bg-blue-600 text-white shadow-md font-black"
                                    : "bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}
                    </div>

                    <button
                      disabled={parentCurrentPage >= totalParentPages}
                      onClick={() => setParentCurrentPage(prev => Math.min(prev + 1, totalParentPages))}
                      className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Parent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl rounded-3xl p-6 space-y-6 relative transition-all duration-300 bg-slate-900 border border-slate-800 shadow-2xl text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 100 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Register PTA Committee Member
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xs font-semibold">✕ Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Input */}
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div className="text-xs font-bold text-blue-650 uppercase tracking-wider mb-1">Manual Entry</div>

                {/* Step 1: Select Student First */}
                <div>
                  <label className="block text-[10px] text-blue-400 mb-1 font-bold">1. Select Student / Child (Auto-fills Parent Details)</label>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      placeholder="🔍 Type student name, roll no, or class to filter..."
                      value={studentSearchTerm}
                      onChange={e => setStudentSearchTerm(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                    <select
                      value={selectedStudentId}
                      onChange={e => handleStudentSelect(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold"
                    >
                      <option value="">-- Choose Student / Ward ({filteredStudents.length} matching) --</option>
                      {filteredStudents.map(s => (
                        <option key={s.id} value={s.id}>{s.user?.name} ({s.rollNumber || "No Roll"}) - Class {s.class}{s.section}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 font-semibold">2. Parent Name</label>
                    <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Committee Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold"
                    >
                      <option value="PTA President">PTA President</option>
                      <option value="PTA Vice President">PTA Vice President</option>
                      <option value="PTA Secretary">PTA Secretary</option>
                      <option value="PTA Treasurer">PTA Treasurer</option>
                      <option value="Executive Committee Member">Executive Committee Member</option>
                      <option value="Parent Representative">Parent Representative</option>
                      <option value="Teacher Representative">Teacher Representative</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Phone Number</label>
                    <input type="text" required value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Email Address</label>
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Committee Term</label>
                    <input type="text" required value={newTerm} onChange={(e) => setNewTerm(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Portal Password</label>
                    <input type="text" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800" />
                  </div>
                </div>

                <button type="submit" disabled={isSaving} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md mt-2">
                  Save Officer Roster
                </button>
              </form>

              {/* Excel Import */}
              <div className="border-l border-slate-800 pl-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex justify-between items-center">
                    <span>Excel Import</span>
                    <button onClick={downloadExcelTemplate} type="button" className="text-[10px] text-blue-400 font-bold flex items-center gap-1 hover:underline">
                      <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Template
                    </button>
                  </div>
                  <div onClick={() => fileInputRef.current?.click()} className="rounded-2xl p-6 text-center cursor-pointer min-h-[160px] border-2 border-dashed border-slate-700 bg-slate-950/20 hover:border-emerald-500 flex flex-col items-center justify-center space-y-3">
                    <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <span className="text-xs font-bold text-white">Import PTA Roster</span>
                    <span className="text-[9px] text-slate-400">Drag & drop Excel or click</span>
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
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Schedule PTA Meeting
              </h3>
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-white">
            <h3 className="text-lg font-bold text-white text-center mb-2">Remove PTA Officer?</h3>
            <p className="text-sm text-slate-400 text-center mb-6">Are you sure you want to remove <span className="font-bold text-white">{parentToDelete.name}</span>?</p>
            <div className="flex gap-3">
              <button onClick={() => setParentToDelete(null)} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs">Cancel</button>
              <button onClick={confirmDeleteParent} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs">Yes, Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Meeting */}
      {meetingToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-white">
            <h3 className="text-lg font-bold text-white text-center mb-2">Delete Meeting?</h3>
            <p className="text-sm text-slate-400 text-center mb-6">Are you sure you want to delete <span className="font-bold text-white">{meetingToDelete.title}</span>?</p>
            <div className="flex gap-3">
              <button onClick={() => setMeetingToDelete(null)} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs">Cancel</button>
              <button onClick={confirmDeleteMeeting} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
