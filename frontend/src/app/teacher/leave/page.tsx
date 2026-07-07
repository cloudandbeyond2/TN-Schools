"use client";
import { Building2, Users, File, Clipboard, User, School } from "lucide-react";


import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";

interface LeaveRequest {
  id: string;
  type: string;
  duration: string;
  reason: string;
  studentName: string;
  status: "Approved" | "Pending" | "Rejected";
}

interface Staff {
  id: string;
  name: string;
  subject: string;
}

export default function LeaveRequestsPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);

  // Form State
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [studentId, setStudentId] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRequests = requests.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  useEffect(() => {
    const fetchData = async () => {
      if (!schoolId || !session?.user) return;
      const teacherId = (session.user as any).id;
      try {
        setLoading(true);
        // 1. Fetch teacher classes
        const classesRes = await fetch(`${API_URL}/api/classes?schoolId=${schoolId}&teacherId=${teacherId}`);
        const classesData = await classesRes.json();
        let activeClasses: any[] = [];
        if (classesData.success && Array.isArray(classesData.data)) {
          setTeacherClasses(classesData.data);
          activeClasses = classesData.data;
        }

        // 2. Fetch Leave history (all records for this school)
        const leaveRes = await fetch(`${API_URL}/api/teacher/leave?schoolId=${schoolId}`);
        const leaveData = await leaveRes.json();
        if (leaveData.success && leaveData.data) {
          setRequests(leaveData.data);
        }

        // 3. Fetch Students (filter by teacher's classes if available, else show all)
        const studentRes = await fetch(`${API_URL}/api/students?schoolId=${schoolId}`);
        const studentData = await studentRes.json();
        if (studentData.success && studentData.data) {
          const filteredStudents = activeClasses.length > 0
            ? studentData.data.filter((s: any) =>
                activeClasses.some(tc => tc.className === s.class && tc.section === s.section)
              )
            : studentData.data;

          const mappedStudents = filteredStudents.map((s: any) => ({
            id: s.id,
            name: s.user?.name || "Unknown Student",
            subject: `Class ${s.class}${s.section}`,
          }));
          setStaffList(mappedStudents);
          if (mappedStudents.length > 0) {
            setStudentId(mappedStudents[0].id);
          } else {
            setStudentId("");
          }
        }
      } catch (err) {
        console.error("Error loading leave page data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolId, API_URL, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !reason) return;

    const durationStr =
      startDate === endDate || !endDate
        ? `${startDate} (1 Day)`
        : `${startDate} to ${endDate}`;

    try {
      const res = await fetch(`${API_URL}/api/teacher/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: leaveType,
          duration: durationStr,
          reason,
          studentId,
          schoolId,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setRequests([data.data, ...requests]);
        setReason("");
        setStartDate("");
        setEndDate("");
        Swal.fire({
          icon: "success",
          title: "Submitted!",
          text: "Leave request submitted successfully! Parent and Headmaster notified.",
          confirmButtonColor: "#10b981",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text: data.error || "Failed to submit leave request.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error("Error submitting leave request", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected network error occurred.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const statCards = [
    {
      icon: <File className="w-5 h-5" />,
      accent: "bg-sky-400/70",
      iconBg: "bg-sky-400/10",
      label: "Total Leave Records",
      value: requests.length,
    },
    {
      icon: <Building2 className="w-5 h-5" />,
      accent: "bg-violet-400/70",
      iconBg: "bg-violet-400/10",
      label: "Classes Covered",
      value: "6 – 12",
    },
    {
      icon: <Users className="w-5 h-5" />,
      accent: "bg-emerald-400/70",
      iconBg: "bg-emerald-400/10",
      label: "Total Students",
      value: staffList.length,
    },
    {
      icon: <School className="w-5 h-5 text-amber-500" />,
      accent: "bg-amber-400/70",
      iconBg: "bg-amber-400/10",
      label: "School",
      value: "TN Govt School",
      small: true,
    },
  ];

  return (
    <PortalLayout
      title="Student Leave Management"
      subtitle="Track and request absences for students in your school."
    >
      {/* Outer wrapper: clamps width, kills any horizontal overflow at every breakpoint */}
      <div className="w-full max-w-full overflow-x-hidden">
        {/* Leave Quota Allowances */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-6">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="theme-card relative overflow-hidden p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] min-w-0"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 ${card.accent}`} />
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`flex-shrink-0 w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center text-base`}
                >
                  {card.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-wide font-semibold text-[var(--text-muted)] truncate">
                    {card.label}
                  </p>
                  <h2
                    className={`font-extrabold text-[var(--text-heading)] leading-tight truncate ${
                      card.small ? "text-base sm:text-lg" : "text-2xl"
                    }`}
                  >
                    {card.value}
                  </h2>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Containers */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6 mb-6">
          {/* Leave Application Form */}
          <div className="theme-card p-4 sm:p-5 lg:p-6 border border-[var(--border)] h-fit rounded-2xl bg-[var(--bg-card)] min-w-0">
            <h2 className="text-base font-semibold text-[var(--text-heading)] mb-4">
              <File className="w-4 h-4 inline-block mr-1 text-inherit" /> Request Leave
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">
                  Leave Category
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Medical Leave">Medical Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                  <option value="Duty Leave (OD)">Duty Leave (OD)</option>
                </select>
              </div>

              {/* Stacks to 1 column below 380px-ish screens, otherwise 2 columns */}
              <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">
                  Student Name
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                >
                  {staffList.length > 0 ? (
                    staffList.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.subject})
                      </option>
                    ))
                  ) : (
                    <option value="">No students found</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">
                  Reason for Absence
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain the reason briefly..."
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[var(--primary)] hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
              >
                Submit Leave Request
              </button>
            </form>
          </div>

          {/* History Panel */}
          <div className="xl:col-span-2 theme-card p-4 sm:p-5 lg:p-6 border border-[var(--border)] space-y-5 rounded-2xl bg-[var(--bg-card)] flex flex-col justify-between min-w-0">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-[var(--text-heading)] mb-4">
                <Clipboard className="w-4 h-4 inline-block mr-1 text-inherit" /> Previous Request History
              </h2>

              {toast && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl mb-4">
                  {toast}
                </div>
              )}

              {loading ? (
                <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                  Loading leave history...
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                  No leave requests found.
                </div>
              ) : (
                <>
                  {/* Desktop / tablet: table view, scrolls horizontally ONLY inside this box */}
                  <div className="hidden sm:block overflow-x-auto rounded-xl border border-[var(--border)]">
                    <table className="w-full text-left border-collapse min-w-[560px]">
                      <thead>
                        <tr className="bg-[var(--bg-main)] border-b border-[var(--border)] text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-extrabold">
                          <th className="p-3.5">Leave Type</th>
                          <th className="p-3.5">Period Details</th>
                          <th className="p-3.5">Reason</th>
                          <th className="p-3.5">Student Name</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {currentRequests.map((req) => (
                          <tr
                            key={req.id}
                            className="hover:bg-[var(--bg-main)] transition-colors"
                          >
                            <td className="p-3.5 font-bold text-[var(--text-heading)] text-xs">
                              {req.type}
                            </td>
                            <td className="p-3.5 text-xs text-[var(--text-heading)]">
                              {req.duration}
                            </td>
                            <td className="p-3.5 text-[var(--text-muted)] text-xs max-w-[150px] truncate">
                              {req.reason}
                            </td>
                            <td className="p-3.5 text-xs text-[var(--text-heading)]">
                              {req.studentName}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile: card list instead of a table, so nothing forces page-wide horizontal scroll */}
                  <div className="sm:hidden space-y-3">
                    {currentRequests.map((req) => (
                      <div
                        key={req.id}
                        className="rounded-xl border border-[var(--border)] p-3.5 bg-[var(--bg-main)] min-w-0"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-bold text-[var(--text-heading)] text-xs truncate">
                            {req.type}
                          </span>
                          <span className="text-[11px] text-[var(--text-muted)] flex-shrink-0">
                            {req.duration}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] mb-1.5 break-words">
                          {req.reason}
                        </p>
                        <p className="text-xs text-[var(--text-heading)] font-medium truncate">
                          <User className="w-4 h-4 inline-block mr-1 text-inherit" /> {req.studentName}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Pagination Controls Footer */}
            {!loading && requests.length > 0 && (
              <div className="flex flex-col xl:flex-row justify-between items-center gap-4 pt-4 border-t border-[var(--border)] mt-auto">
                <span className="text-xs text-[var(--text-muted)] text-center xl:text-left">
                  Showing{" "}
                  <strong className="text-[var(--text-heading)]">{indexOfFirst + 1}</strong> to{" "}
                  <strong className="text-[var(--text-heading)]">
                    {Math.min(indexOfLast, requests.length)}
                  </strong>{" "}
                  of <strong className="text-[var(--text-heading)]">{requests.length}</strong>{" "}
                  inquiries
                </span>

                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="p-2 text-xs rounded-xl border border-[var(--border)] text-[var(--text-heading)] bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 text-xs font-bold rounded-xl transition-all ${
                        currentPage === pageNum
                          ? "bg-[var(--primary)] text-slate-950"
                          : "border border-[var(--border)] text-[var(--text-heading)] hover:bg-[var(--bg-card-hover)]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="p-2 text-xs rounded-xl border border-[var(--border)] text-[var(--text-heading)] bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}