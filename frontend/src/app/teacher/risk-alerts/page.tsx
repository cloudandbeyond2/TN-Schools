"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import { AlertTriangle, Plus, Search, Mail, Edit, CheckCircle, Trash2, X, Users, Percent, TrendingDown, FileText, Check, Circle, Clipboard, Lightbulb } from "lucide-react";

interface AtRiskStudent {
  id: string;
  name: string;
  className: string;
  rollNumber: string;
  phone: string;
  parentName: string;
  riskLevel: "high" | "medium";
  issue: string;
  attendance: number;
  lastScore: number;
  notified: boolean;
  notificationMessage?: string;
  studentId?: string;
}

export default function RiskAlertsPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const teacherId = (session?.user as any)?.id;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Watchlist & Selectable Students State
  const [students, setStudents] = useState<AtRiskStudent[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search/Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Form Modals State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AtRiskStudent | null>(null);

  // Form Fields
  const [formStudentId, setFormStudentId] = useState("");
  const [formRiskLevel, setFormRiskLevel] = useState<"high" | "medium">("medium");
  const [formIssue, setFormIssue] = useState("");
  const [formAttendance, setFormAttendance] = useState("80");
  const [formLastScore, setFormLastScore] = useState("50");

  // Predefined common issues/indicators
  const commonIssues = [
    "High absenteeism + decline in math score averages below threshold",
    "Missing homework consistently + failing mock tests",
    "Low classroom participation + language barriers in evaluation",
    "Socio-economic hurdles impacting attendance & exam scores",
    "Struggles with basic formulas & theorem applications"
  ];

  // Notification Modal State
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [notifyStudent, setNotifyStudent] = useState<AtRiskStudent | null>(null);
  const [notifyMessage, setNotifyMessage] = useState("");
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  // Stats Counters
  const [stats, setStats] = useState({
    total: 0,
    highRisk: 0,
    medRisk: 0,
    notifiedCount: 0
  });

  const fetchData = async () => {
    if (!schoolId || !session?.user) return;
    try {
      setLoading(true);

      // 1. Fetch teacher's classes
      let tClasses: any[] = [];
      const classesRes = await fetch(`${API_URL}/api/classes?schoolId=${schoolId}&teacherId=${teacherId}`);
      const classesData = await classesRes.json();
      if (classesData.success && Array.isArray(classesData.data)) {
        tClasses = classesData.data;
        setTeacherClasses(tClasses);
      }

      // 2. Fetch all school students
      const studentsRes = await fetch(`${API_URL}/api/students?schoolId=${schoolId}`);
      const studentsData = await studentsRes.json();
      if (studentsData.success && Array.isArray(studentsData.data)) {
        // Filter students to only those in the teacher's classes
        const filteredAll = studentsData.data.filter((s: any) =>
          tClasses.some(tc => tc.className === s.class && tc.section === s.section)
        );
        setAllStudents(filteredAll);
      }

      // 3. Fetch current watchlist/risk alerts
      const res = await fetch(`${API_URL}/api/headmaster/students${schoolId ? `?schoolId=${schoolId}` : ""}`);
      const data = await res.json();
      if (data.success && data.data) {
        // Map backend structure to page structure
        let mapped: AtRiskStudent[] = data.data.map((st: any) => ({
          id: st.id,
          name: st.name,
          className: st.class,
          rollNumber: st.rollNumber,
          phone: st.phone,
          parentName: st.parentName,
          riskLevel: st.risk?.toLowerCase() === "high" ? "high" : "medium",
          issue: st.issue || "High absenteeism + decline in test scores",
          attendance: st.attendance !== null && st.attendance !== undefined ? st.attendance : 78,
          lastScore: st.lastScore !== null && st.lastScore !== undefined ? st.lastScore : 45,
          notified: st.notified || false,
          notificationMessage: st.notificationMessage || "",
          studentId: st.studentId
        }));

        // Filter alerts by teacher classes
        if (tClasses.length > 0) {
          mapped = mapped.filter((st: any) => {
            return tClasses.some((tc: any) => {
              const tcStr = `${tc.className}${tc.section}`.replace(/[-\s]/g, "").toUpperCase();
              let stClassStr = st.className.replace(/[-\s]/g, "").toUpperCase();
              stClassStr = stClassStr.replace(/^CLASS/i, "");
              return stClassStr === tcStr || stClassStr === tc.className.toUpperCase();
            });
          });
        }

        setStudents(mapped);

        // Update stats
        const high = mapped.filter(s => s.riskLevel === "high").length;
        const med = mapped.filter(s => s.riskLevel === "medium").length;
        const notified = mapped.filter(s => s.notified).length;
        setStats({
          total: mapped.length,
          highRisk: high,
          medRisk: med,
          notifiedCount: notified
        });
      }
    } catch (err) {
      console.error("Error loading watchlist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [schoolId, session, API_URL]);

  // Handle auto-fill student details on form select
  useEffect(() => {
    if (formStudentId && !editingAlert) {
      const selected = allStudents.find(s => s.id === formStudentId);
      if (selected) {
        // Find default warning based on scores or random default
        setFormIssue(commonIssues[Math.floor(Math.random() * commonIssues.length)]);
        setFormAttendance(String(Math.floor(Math.random() * 25) + 65));
        setFormLastScore(String(Math.floor(Math.random() * 30) + 30));
      }
    }
  }, [formStudentId]);

  // Open modal for Adding Alert
  const handleOpenAdd = () => {
    setEditingAlert(null);
    setFormStudentId(allStudents[0]?.id || "");
    setFormRiskLevel("medium");
    setFormIssue(commonIssues[0]);
    setFormAttendance("80");
    setFormLastScore("50");
    setIsFormOpen(true);
  };

  // Open modal for Editing Alert
  const handleOpenEdit = (student: AtRiskStudent) => {
    setEditingAlert(student);
    setFormStudentId(student.studentId || "");
    setFormRiskLevel(student.riskLevel);
    setFormIssue(student.issue);
    setFormAttendance(String(student.attendance));
    setFormLastScore(String(student.lastScore));
    setIsFormOpen(true);
  };

  // Save Risk Alert (POST or PUT)
  const handleSaveAlert = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formStudentId) {
      Swal.fire("Error", "Please select a student", "error");
      return;
    }

    const selectedSt = allStudents.find(s => s.id === formStudentId);
    
    // Construct body
    const body = {
      name: selectedSt ? selectedSt.user?.name : editingAlert?.name,
      rollNumber: selectedSt ? selectedSt.rollNumber : editingAlert?.rollNumber,
      class: selectedSt ? `${selectedSt.class}${selectedSt.section}` : editingAlert?.className,
      phone: selectedSt ? selectedSt.parentMobile : editingAlert?.phone,
      parentName: selectedSt ? selectedSt.parentName : editingAlert?.parentName,
      risk: formRiskLevel === "high" ? "High" : "Medium",
      issue: formIssue,
      attendance: parseFloat(formAttendance) || 0,
      lastScore: parseFloat(formLastScore) || 0,
      schoolId
    };

    try {
      let res;
      if (editingAlert) {
        // PUT request
        res = await fetch(`${API_URL}/api/headmaster/students/${editingAlert.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
      } else {
        // POST request
        res = await fetch(`${API_URL}/api/headmaster/students`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
      }

      const data = await res.json();
      if (data.success) {
        setIsFormOpen(false);
        Swal.fire({
          icon: "success",
          title: editingAlert ? "Alert Updated" : "Student Flagged",
          text: editingAlert 
            ? "The student's risk metrics have been updated." 
            : "The student has been added to the academic watchlist.",
          timer: 2000,
          showConfirmButton: false
        });
        fetchData();
      } else {
        Swal.fire("Error", data.error || "Failed to save alert details", "error");
      }
    } catch (err) {
      console.error("Save Alert Error:", err);
      Swal.fire("Error", "An unexpected error occurred while saving.", "error");
    }
  };

  // Open send notification dialog
  const handleOpenNotify = (student: AtRiskStudent) => {
    setNotifyStudent(student);
    const teacherName = session?.user?.name || "Mathematics Teacher";
    const template = `Dear ${student.parentName},\n\nThis is ${teacherName}, Mathematics teacher of ${student.name}. I'm reaching out to partner with you to support ${student.name}'s learning progress in Mathematics.\n\nCurrently, ${student.name} has an attendance rate of ${student.attendance}% and scored ${student.lastScore}% in the latest assessment. To help them master the concepts better, especially regarding "${student.issue}", we have prepared some simple home study practice tasks on their student portal.\n\nWorking together, we can help them catch up and boost their confidence! Please check their portal and let me know if you'd like to have a quick chat about their progress.\n\nWarm regards,\n${teacherName}`;
    setNotifyMessage(template);
    setIsNotifyOpen(true);
  };

  // Dispatch Notification (Trigger backend POST/PUT APIs)
  const handleSendNotification = async () => {
    if (!notifyStudent) return;
    try {
      setIsSendingNotif(true);

      // 1. Send Parent Notification
      const parentRes = await fetch(`${API_URL}/api/parent/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: notifyStudent.studentId,
          title: "Urgent Academic Alert",
          message: notifyMessage,
          type: "ACADEMIC_ALERT"
        })
      });

      // 2. Send Student In-App Alert (if student user exists)
      const studentObj = allStudents.find(s => s.id === notifyStudent.studentId);
      if (studentObj && studentObj.userId) {
        await fetch(`${API_URL}/api/notifications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: studentObj.userId,
            message: ` Learning Support: A few helpful Mathematics practice exercises have been added to your portal to help you catch up and improve. Let's work together to boost your score!`
          })
        });
      }

      // 3. Update Notified status in Watchlist table
      await fetch(`${API_URL}/api/headmaster/students/${notifyStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notified: true,
          notificationMessage: notifyMessage
        })
      });

      setIsNotifyOpen(false);
      Swal.fire({
        icon: "success",
        title: "Alert Notification Sent",
        text: `Sent successfully to parent ${notifyStudent.parentName} and student in-app portal.`,
        timer: 2000,
        showConfirmButton: false
      });
      fetchData();
    } catch (err) {
      console.error("Notify Error:", err);
      Swal.fire("Error", "Failed to send notifications. Try again.", "error");
    } finally {
      setIsSendingNotif(false);
    }
  };

  // Resolve / Delete Alert
  const handleResolveAlert = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "Resolve Risk Alert?",
      text: `Are you sure you want to resolve the watchlist alert for ${name}? This will remove them from the watchlist.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Resolve",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#64748b",
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/headmaster/students/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Alert Resolved",
          text: "Risk alert marked as resolved successfully!",
          timer: 2000,
          showConfirmButton: false
        });
        fetchData();
      } else {
        Swal.fire("Error", data.error || "Failed to resolve alert.", "error");
      }
    } catch (err) {
      console.error("Resolve Error:", err);
      Swal.fire("Error", "An unexpected error occurred.", "error");
    }
  };

  // Filters mapping
  const filteredStudents = students.filter(st => {
    const matchesSearch = st.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          st.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === "all" || st.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, riskFilter]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  return (
    <PortalLayout
      title="Risk Alerts"
      subtitle="Early-warning indicators identifying students requiring urgent academic support"
    >
      {/* Stats Board */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="block text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-wider">Total Alerts</span>
            <span className="text-2xl font-black text-[var(--text-heading)]">{stats.total}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-450">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="block text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-wider"><Circle className="w-4 h-4 inline-block mr-1 text-inherit" /> High Risk</span>
            <span className="text-2xl font-black text-rose-500">{stats.highRisk}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-450">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="block text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-wider"><Circle className="w-4 h-4 inline-block mr-1 text-inherit" /> Medium Risk</span>
            <span className="text-2xl font-black text-amber-500">{stats.medRisk}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-450">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="block text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-wider"><Mail className="w-4 h-4 inline-block mr-1 text-inherit" /> Notified Parents</span>
            <span className="text-2xl font-black text-emerald-500">{stats.notifiedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-450">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action and Filter bar */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4 mb-6 bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border)]">
        <div className="flex flex-col xl:flex-row gap-3 w-full xl:w-auto">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search student or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full xl:w-64 bg-[var(--bg-main)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-all"
            />
          </div>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--bg-main)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="all">All Risks</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full xl:w-auto px-4 py-2.5 bg-[var(--primary)] hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Flag Student</span>
        </button>
      </div>

      {/* Main Alert Grid / Table */}
      <div className="theme-card p-6 border border-[var(--border)] shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-sm font-bold text-[var(--text-heading)] uppercase tracking-wider flex items-center gap-2">
            <span><Clipboard className="w-4 h-4 inline-block mr-1 text-inherit" /> Watchlist Early-Warning Indicators</span>
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xs text-[var(--text-muted)] flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
            <span>Loading database watchlist...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[var(--border)] rounded-2xl text-[var(--text-muted)] text-xs flex flex-col items-center gap-2">
            <Users className="w-10 h-10 opacity-30 mb-2" />
            <span className="font-bold">No Risk Alerts Found</span>
            <span>Great! No students are matching your filter or flagged for watchlist.</span>
          </div>
        ) : (
          <>
            {/* Desktop/Laptop Table Layout */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="data-table w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="py-3 px-4 font-bold text-[var(--text-muted)] text-[10px] uppercase border-b border-[var(--border)]">Student Details</th>
                    <th className="py-3 px-4 font-bold text-[var(--text-muted)] text-[10px] uppercase border-b border-[var(--border)]">Risk Level</th>
                    <th className="py-3 px-4 font-bold text-[var(--text-muted)] text-[10px] uppercase border-b border(--border)]">Warning Indicator / Issue</th>
                    <th className="py-3 px-4 font-bold text-[var(--text-muted)] text-[10px] uppercase border-b border-[var(--border)] text-center">Attendance</th>
                    <th className="py-3 px-4 font-bold text-[var(--text-muted)] text-[10px] uppercase border-b border-[var(--border)] text-center">Last Score</th>
                    <th className="py-3 px-4 font-bold text-[var(--text-muted)] text-[10px] uppercase border-b border-[var(--border)] text-center">Alert Parent</th>
                    <th className="py-3 px-4 font-bold text-[var(--text-muted)] text-[10px] uppercase border-b border-[var(--border)] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]/40">
                  {currentStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-[var(--bg-card-hover)]/30 transition-colors">
                      {/* Student Info */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-[var(--text-heading)] text-sm">{st.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                          Class: {st.className} · Roll: {st.rollNumber}
                        </div>
                      </td>

                      {/* Risk Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`badge shrink-0 font-semibold text-[10px] px-2.5 py-1 rounded-full ${
                          st.riskLevel === "high" 
                            ? "bg-rose-500/10 text-rose-450 border border-rose-500/20" 
                            : "bg-amber-500/10 text-amber-450 border border-amber-500/20"
                        }`}>
                          {st.riskLevel.toUpperCase()}
                        </span>
                      </td>

                      {/* Warning Indicator */}
                      <td className="py-4 px-4 max-w-xs md:max-w-md">
                        <p className="text-[11px] text-[var(--text-main)] leading-relaxed line-clamp-2">
                          {st.issue}
                        </p>
                      </td>

                      {/* Attendance Metric */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <div className={`font-bold text-xs ${st.attendance < 75 ? "text-rose-400" : "text-[var(--text-heading)]"}`}>
                          {st.attendance}%
                        </div>
                        <div className="text-[9px] text-[var(--text-muted)] mt-0.5">
                          {st.attendance < 75 ? " Below limit" : "Good"}
                        </div>
                      </td>

                      {/* Last Score Metric */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <div className={`font-bold text-xs ${st.lastScore < 40 ? "text-rose-400" : "text-[var(--text-heading)]"}`}>
                          {st.lastScore}%
                        </div>
                        <div className="text-[9px] text-[var(--text-muted)] mt-0.5">
                          {st.lastScore < 40 ? " Critical" : "Passing"}
                        </div>
                      </td>

                      {/* Alert Parent Status */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        {st.notified ? (
                          <button 
                            onClick={() => {
                              Swal.fire({
                                title: `Notification Sent Details`,
                                html: `<div style="text-align: left; background-color: #0f172a; color: #e2e8f0; font-family: monospace; font-size: 11px; padding: 16px; border-radius: 12px; white-space: pre-wrap; line-height: 1.6; margin-top: 10px;">${st.notificationMessage}</div>`,
                                confirmButtonColor: "#f59e0b",
                                confirmButtonText: "Done"
                              });
                            }}
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                          >
                            <Check className="w-3 h-3" />
                            <span>Notified</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenNotify(st)}
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-lg border border-amber-500/20 hover:bg-amber-500/25 active:scale-95 transition-all"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Send Alert</span>
                          </button>
                        )}
                      </td>

                      {/* Action Column */}
                      <td className="py-4 px-4 whitespace-nowrap text-right text-xs font-medium space-x-1">
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-2 text-[var(--text-muted)] hover:text-amber-400 hover:bg-amber-500/5 rounded-lg transition-colors inline-flex"
                          title="Edit Risk metrics"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleResolveAlert(st.id, st.name)}
                          className="p-2 text-[var(--text-muted)] hover:text-emerald-400 hover:bg-emerald-500/5 rounded-lg transition-colors inline-flex"
                          title="Resolve alert"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Card Grid Layout */}
            <div className="block xl:hidden space-y-4">
              {currentStudents.map((st) => (
                <div key={st.id} className="bg-[var(--bg-main)]/20 border border-[var(--border)] p-4 rounded-2xl space-y-3.5 shadow-sm text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-[var(--text-heading)] text-sm leading-tight">{st.name}</h4>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">Class {st.className} · Roll {st.rollNumber}</p>
                    </div>
                    <span className={`badge shrink-0 font-semibold text-[9px] px-2 py-0.5 rounded-full ${
                      st.riskLevel === "high" 
                        ? "bg-rose-500/10 text-rose-450 border border-rose-500/20" 
                        : "bg-amber-500/10 text-amber-450 border border-amber-500/20"
                    }`}>
                      {st.riskLevel.toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-[var(--bg-main)]/35 p-3 rounded-xl border border-[var(--border)]/60 text-[11px] leading-relaxed text-[var(--text-main)]">
                    <span className="font-semibold block text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Issue/Indicator</span>
                    {st.issue}
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 bg-[var(--bg-main)]/45 p-2.5 rounded-xl border border-[var(--border)]/40 text-center">
                    <div>
                      <span className="block text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-0.5">Attendance</span>
                      <span className={`font-bold text-xs ${st.attendance < 75 ? "text-rose-400" : "text-[var(--text-heading)]"}`}>{st.attendance}%</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-0.5">Last Exam</span>
                      <span className={`font-bold text-xs ${st.lastScore < 40 ? "text-rose-400" : "text-[var(--text-heading)]"}`}>{st.lastScore}%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2.5 border-t border-[var(--border)]/60">
                    <div>
                      {st.notified ? (
                        <button 
                          onClick={() => {
                            Swal.fire({
                              title: `Notification Sent Details`,
                              html: `<div style="text-align: left; background-color: #0f172a; color: #e2e8f0; font-family: monospace; font-size: 11px; padding: 16px; border-radius: 12px; white-space: pre-wrap; line-height: 1.6; margin-top: 10px;">${st.notificationMessage}</div>`,
                              confirmButtonColor: "#f59e0b",
                              confirmButtonText: "Done"
                            });
                          }}
                          className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                        >
                          <Check className="w-3 h-3" />
                          <span>Notified</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenNotify(st)}
                          className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-lg border border-amber-500/20 hover:bg-amber-500/25 active:scale-95 transition-all"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Send Alert</span>
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(st)}
                        className="p-1.5 text-[var(--text-muted)] hover:text-amber-400 hover:bg-amber-500/5 rounded-lg transition-colors border border-[var(--border)]"
                        title="Edit Risk metrics"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleResolveAlert(st.id, st.name)}
                        className="p-1.5 text-[var(--text-muted)] hover:text-emerald-400 hover:bg-emerald-500/5 rounded-lg transition-colors border border-[var(--border)]"
                        title="Resolve alert"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 text-xs">
                <span className="text-[var(--text-muted)]">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} entries
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-[var(--border)] text-[var(--text-heading)] rounded-lg disabled:opacity-50 hover:bg-[var(--bg-card-hover)] transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 flex items-center justify-center text-[var(--text-heading)] font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-[var(--border)] text-[var(--text-heading)] rounded-lg disabled:opacity-50 hover:bg-[var(--bg-card-hover)] transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Flag / Edit Alert Modal Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border)]">
              <h3 className="text-sm font-black text-[var(--text-heading)] uppercase tracking-wider">
                {editingAlert ? ` Edit Risk Alert: ${editingAlert.name}` : " Flag Student for Watchlist"}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-heading)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveAlert} className="p-6 space-y-4">
              {/* Select Student */}
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-bold uppercase tracking-wider">Select Student</label>
                {editingAlert ? (
                  <div className="bg-[var(--bg-main)]/60 px-3 py-2.5 rounded-xl border border-[var(--border)] text-xs text-[var(--text-heading)] font-semibold">
                    {editingAlert.name} ({editingAlert.className} · Roll: {editingAlert.rollNumber})
                  </div>
                ) : (
                  <select
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  >
                    {allStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.user?.name} (Class {s.class}{s.section} · Roll: {s.rollNumber})
                      </option>
                    ))}
                    {allStudents.length === 0 && (
                      <option value="">No students available for selection</option>
                    )}
                  </select>
                )}
              </div>

              {/* Risk Level */}
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-bold uppercase tracking-wider">Risk Severity</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormRiskLevel("high")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      formRiskLevel === "high"
                        ? "border-rose-500 bg-rose-500/10 text-rose-450"
                        : "border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>HIGH RISK</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormRiskLevel("medium")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      formRiskLevel === "medium"
                        ? "border-amber-500 bg-amber-500/10 text-amber-450"
                        : "border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>MEDIUM RISK</span>
                  </button>
                </div>
              </div>

              {/* Attendance & Score */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-bold uppercase tracking-wider">Attendance Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formAttendance}
                    onChange={(e) => setFormAttendance(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-bold uppercase tracking-wider">Last Exam Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formLastScore}
                    onChange={(e) => setFormLastScore(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] font-mono"
                    required
                  />
                </div>
              </div>

              {/* Warning Indicator / Issue */}
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-bold uppercase tracking-wider">Warning Indicator / Issue</label>
                <select
                  onChange={(e) => setFormIssue(e.target.value)}
                  value={commonIssues.includes(formIssue) ? formIssue : "custom"}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] mb-2.5 focus:outline-none focus:border-[var(--primary)]"
                >
                  {commonIssues.map((issue, idx) => (
                    <option key={idx} value={issue}>
                      {issue}
                    </option>
                  ))}
                  <option value="custom">-- Custom indicator text --</option>
                </select>
                
                <textarea
                  value={formIssue}
                  onChange={(e) => setFormIssue(e.target.value)}
                  rows={3}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] resize-none leading-relaxed"
                  placeholder="Enter details about why this student is flagged..."
                  required
                />
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 justify-end pt-3 border-t border-[var(--border)]/60">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card-hover)] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--primary)] hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                >
                  {editingAlert ? "Save changes" : "Flag Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Parent Alert Notification Modal */}
      {isNotifyOpen && notifyStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border)] bg-amber-500/5">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>Dispatch Academic Alert Notification</span>
              </h3>
              <button 
                onClick={() => setIsNotifyOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-heading)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-[var(--bg-main)]/60 p-4 rounded-xl border border-[var(--border)] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)] font-medium">Recipient Parent:</span>
                  <span className="text-[var(--text-heading)] font-bold">{notifyStudent.parentName} ({notifyStudent.phone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)] font-medium">Student Subject:</span>
                  <span className="text-[var(--text-heading)] font-bold">Mathematics Alert (Grade {notifyStudent.className})</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[var(--text-muted)] mb-1.5 font-bold uppercase tracking-wider">SMS / In-App Notification Body</label>
                <textarea
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  rows={9}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3.5 py-3 text-xs text-[var(--text-heading)] font-mono focus:outline-none focus:border-[var(--primary)] resize-none leading-relaxed"
                  required
                />
              </div>

              <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/10 text-[10px] text-rose-300 leading-normal">
                <Lightbulb className="w-4 h-4 inline-block mr-1 text-inherit" /> <strong>Important Note:</strong> Sending this alert will dispatch a push notification to both the Parent Portal (linked to {notifyStudent.parentName}) and the Student Portal.
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 justify-end pt-3 border-t border-[var(--border)]/60">
                <button
                  type="button"
                  onClick={() => setIsNotifyOpen(false)}
                  className="px-4 py-2 border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card-hover)] transition-all"
                  disabled={isSendingNotif}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendNotification}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                  disabled={isSendingNotif}
                >
                  {isSendingNotif ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border border-white/20 border-t-white animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Send Alert Now</span>
                    </>
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
