"use client";

import React, { useState, useEffect, useRef } from "react";
import PortalLayout from "@/components/PortalLayout";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";

interface ParentRecord {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string | null;
  studentName: string;
  studentClass: string;
  term: string;
  schoolId: string | null;
  createdAt: string;
}

interface School {
  id: string;
  name: string;
  dise: string;
}

export default function TeacherParentsPage() {
  const { data: session } = useSession();
  const sessionSchoolId = (session?.user as any)?.schoolId;
  const teacherId = (session?.user as any)?.id;

  const [parents, setParents] = useState<ParentRecord[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [role, setRole] = useState("Parent");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [term, setTerm] = useState("2025-26");
  const [schoolId, setSchoolId] = useState("");
  const [password, setPassword] = useState("123456");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchParentsAndSchools = async () => {
    try {
      setLoading(true);
      
      // Fetch Parents with session school ID filter if available
      const res = await fetch(`${API_URL}/api/headmaster/parents${sessionSchoolId ? `?schoolId=${sessionSchoolId}` : ""}`);
      const parentData = await res.json();
      
      // Fetch Schools
      const schoolRes = await fetch(`${API_URL}/api/schools`);
      const schoolData = await schoolRes.json();
      
      if (schoolData.success) {
        setSchools(schoolData.data);
      }
      
      if (parentData.success) {
        setParents(parentData.data);
      } else {
        setToast({ message: `Error loading parents: ${parentData.error}`, type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "❌ Failed to fetch database records.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch teacher classes
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      if (!sessionSchoolId || !teacherId) return;
      try {
        const res = await fetch(`${API_URL}/api/classes?schoolId=${sessionSchoolId}&teacherId=${teacherId}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setTeacherClasses(data.data);
          if (data.data.length > 0) {
            setStudentClass(`${data.data[0].className}${data.data[0].section}`);
          }
        }
      } catch (err) {
        console.error("Error fetching teacher classes:", err);
      }
    };
    fetchTeacherClasses();
  }, [sessionSchoolId, teacherId, API_URL]);

  // Fetch parents when school ID is available/changed
  useEffect(() => {
    fetchParentsAndSchools();
  }, [sessionSchoolId]);

  const handleEditClick = (p: ParentRecord) => {
    setEditingId(p.id);
    setName(p.name);
    setRole(p.role);
    setPhone(p.phone);
    setEmail(p.email || "");
    setStudentName(p.studentName);
    setStudentClass(p.studentClass);
    setTerm(p.term);
    setSchoolId(p.schoolId || "");
    setPassword("");
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setEditingId(null);
    setName("");
    setRole("Parent");
    setPhone("");
    setEmail("");
    setStudentName("");
    if (teacherClasses.length > 0) {
      setStudentClass(`${teacherClasses[0].className}${teacherClasses[0].section}`);
    } else {
      setStudentClass("");
    }
    setTerm("2025-26");
    setSchoolId("");
    setPassword("123456");
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !role.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Parent name, phone, and role are required.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }
    setSubmitting(true);
    setToast(null);

    const payload = {
      name: name.trim(),
      role,
      phone: phone.trim(),
      email: email.trim() || null,
      studentName: studentName.trim() || "N/A",
      studentClass: studentClass.trim() || "N/A",
      term,
      schoolId: schoolId || null,
      password: password || undefined,
    };

    const endpoint = editingId ? `${API_URL}/api/headmaster/parents/${editingId}` : `${API_URL}/api/headmaster/parents`;
    const method = editingId ? "PUT" : "POST";
    const successMsg = editingId
      ? `Parent record for ${name} updated successfully!`
      : `Parent record for ${name} added successfully!`;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: successMsg,
          timer: 2000,
          showConfirmButton: false,
        });
        handleModalClose();
        fetchParentsAndSchools();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: data.error || "Request failed.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Network error. Please try again.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, pName: string) => {
    const result = await Swal.fire({
      title: "Delete Parent Record?",
      text: `Are you sure you want to delete the parent record for ${pName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/headmaster/parents/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: `Parent record for ${pName} deleted successfully.`,
          timer: 2000,
          showConfirmButton: false,
        });
        fetchParentsAndSchools();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Failed to delete record.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error deleting record.",
        confirmButtonColor: "#ef4444",
      });
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

        const parentsData = rawData.map((row: any) => ({
          name: String(row["Parent Name"] || row["name"] || row["parentName"] || "").trim(),
          role: String(row["Role"] || row["Designation"] || row["role"] || "Parent").trim(),
          phone: String(row["Phone Number"] || row["Phone"] || row["phone"] || "").trim(),
          email: String(row["Email"] || row["email"] || "").trim() || null,
          studentName: String(row["Student Name"] || row["studentName"] || "N/A").trim(),
          studentClass: String(row["Student Class"] || row["Class"] || row["class"] || "N/A").trim(),
          term: String(row["Term"] || row["Academic Year"] || row["term"] || "2025-26").trim(),
          password: String(row["Password"] || row["password"] || "123456").trim(),
          schoolId: sessionSchoolId || schoolId || null,
        })).filter((p) => p.name && p.phone && p.role);

        if (parentsData.length === 0) {
          setToast({ message: "⚠️ No valid records found. Ensure columns 'Parent Name', 'Role', and 'Phone Number' are populated.", type: "error" });
          setIsUploading(false);
          return;
        }

        const res = await fetch(`${API_URL}/api/headmaster/parents/bulk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parents: parentsData }),
        });
        const resData = await res.json();
        if (resData.success) {
          Swal.fire({
            icon: "success",
            title: "Import Successful!",
            text: `Registered/Updated ${resData.created} parents from Excel.`,
          });
          fetchParentsAndSchools();
          if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
          Swal.fire({
            icon: "error",
            title: "Import Failed",
            text: resData.error || "Bulk import failed.",
            confirmButtonColor: "#ef4444",
          });
        }
      } catch (err) {
        console.error("Excel import error:", err);
        Swal.fire({
          icon: "error",
          title: "Parser Error",
          text: "Error parsing spreadsheet file.",
          confirmButtonColor: "#ef4444",
        });
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadSampleExcel = () => {
    const sampleData = [
      {
        "Parent Name": "Mr. Rajesh Kumar",
        "Role": "PTA President",
        "Phone Number": "9876543210",
        "Email": "rajesh@example.com",
        "Student Name": "Priya",
        "Student Class": "9",
        "Term": "2025-26",
        "Password": "password123"
      },
      {
        "Parent Name": "Mrs. Meenakshi S.",
        "Role": "Parent",
        "Phone Number": "9876543211",
        "Email": "meenakshi@example.com",
        "Student Name": "Karthik",
        "Student Class": "10",
        "Term": "2025-26",
        "Password": "password123"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ParentsTemplate");
    XLSX.writeFile(wb, "parents_bulk_import_template.xlsx");
  };

  const filteredParents = parents.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.studentName.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      (p.email || "").toLowerCase().includes(search.toLowerCase());

    const matchesClass = teacherClasses.some((tc) => {
      const tcStr = `${tc.className}${tc.section}`.replace(/[-\s]/g, "").toUpperCase();
      let pClassStr = p.studentClass.replace(/[-\s]/g, "").toUpperCase();
      pClassStr = pClassStr.replace(/^CLASS/i, "");
      return pClassStr === tcStr || pClassStr === tc.className.toUpperCase();
    });

    return matchesSearch && matchesClass;
  });

  const getSchoolName = (id: string | null) => {
    if (!id) return "Unassigned";
    const school = schools.find((s) => s.id === id);
    return school ? school.name : "N/A";
  };

  return (
    <PortalLayout
      title="PTA & Parents Registry"
      subtitle="Manage parent contacts, student associations, and school PTA committees"
    >
      {/* Toast Alert */}
      {toast && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs font-semibold border shadow-lg ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* KPI Section with Premium White Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">Total Parents</span>
          <div className="text-2xl font-black text-slate-800 dark:text-white">{filteredParents.length}</div>
          <span className="text-[9px] text-slate-450 dark:text-slate-500 font-semibold">Registered in system</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">PTA Committee Members</span>
          <div className="text-2xl font-black text-slate-800 dark:text-white">
            {filteredParents.filter((p) => p.role !== "Parent").length}
          </div>
          <span className="text-[9px] text-slate-450 dark:text-slate-500 font-semibold">Executive body</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">Schools Connected</span>
          <div className="text-2xl font-black text-slate-800 dark:text-white">
            {new Set(filteredParents.map((p) => p.schoolId).filter(Boolean)).size}
          </div>
          <span className="text-[9px] text-slate-450 dark:text-slate-500 font-semibold">Separate campuses</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block mb-1">PTA Term</span>
          <div className="text-2xl font-black text-slate-800 dark:text-white">2025-26</div>
          <span className="text-[9px] text-slate-450 dark:text-slate-500 font-semibold">Current active cohort</span>
        </div>
      </div>

      {/* Main List Table in White Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-850 dark:text-white">👥 Parents & PTA Registry</h2>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
              Verify parent contact details, assign them to schools, and update PTA designations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search by name, student, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-450 focus:outline-none focus:border-violet-500 transition-colors w-full sm:w-60"
            />
            
            <button
              onClick={downloadSampleExcel}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              📥 Template
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
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
              onClick={() => {
                setSchoolId(sessionSchoolId || "");
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0"
            >
              + Register Parent
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin mb-3" />
            <span className="text-xs text-slate-450">Loading parents database...</span>
          </div>
        ) : filteredParents.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <span className="text-4xl block mb-2">👥</span>
            <span className="text-xs text-slate-400 font-medium">No parent records found.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Parent Name</th>
                  <th className="px-4 py-3">Role / Designation</th>
                  <th className="px-4 py-3">Phone & Email</th>
                  <th className="px-4 py-3">Associated Student</th>
                  <th className="px-4 py-3">School Name</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParents.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-slate-850 dark:text-white text-xs">{p.name}</td>
                    <td className="px-4 py-3 text-xs">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                          p.role === "Parent"
                            ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            : p.role.includes("President") || p.role.includes("Secretary")
                            ? "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-400"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400"
                        }`}
                      >
                        {p.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="font-semibold text-slate-700 dark:text-slate-300 font-mono">{p.phone}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.email || "No Email"}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="font-semibold text-slate-705 dark:text-slate-200">🎓 {p.studentName}</div>
                      <div className="text-[10px] text-slate-450">Class {p.studentClass} · {p.term}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                      🏫 {getSchoolName(p.schoolId)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="px-2.5 py-1 bg-violet-500/10 hover:bg-violet-500/20 text-violet-700 dark:text-violet-450 border border-violet-500/20 rounded-md font-bold text-[10px] transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
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

      {/* Register / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl p-6 space-y-5 relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-850 dark:text-white">
                👤 {editingId ? "Edit Parent Details" : "Register Student Parent"}
              </h3>
              <button
                onClick={handleModalClose}
                className="text-slate-450 hover:text-slate-700 dark:hover:text-white text-xs"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Parent Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mr. Rajesh Kumar"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Role / Designation</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    <option value="Parent">Parent / Guardian</option>
                    <option value="PTA President">PTA President</option>
                    <option value="PTA Vice President">PTA Vice President</option>
                    <option value="PTA Secretary">PTA Secretary</option>
                    <option value="PTA Treasurer">PTA Treasurer</option>
                    <option value="PTA Executive Member">PTA Executive Member</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. parent@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Student Name</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Ram"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Class</label>
                  <select
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    {teacherClasses.length === 0 ? (
                      <option value="">No classes</option>
                    ) : (
                      teacherClasses.map((cls) => (
                        <option key={cls.id} value={`${cls.className}${cls.section}`}>
                          Class {cls.className}{cls.section}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">PTA Term</label>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="2025-26"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">School Assignment</label>
                <select
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-violet-500 transition-colors"
                >
                  {schools
                    .filter((s) => s.id === sessionSchoolId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.dise})</option>
                    ))}
                  {schools.filter((s) => s.id === sessionSchoolId).length === 0 && (
                    <option value="">No assigned school found</option>
                  )}
                </select>
              </div>

              {!editingId && (
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">Portal Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Default is 123456"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-850 text-white font-bold rounded-xl text-xs transition-colors shadow-md mt-2"
              >
                {submitting ? "Saving data..." : editingId ? "Save Changes" : "Register Parent"}
              </button>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
