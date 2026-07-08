"use client";
import { Building2, Users, File, Clipboard, User, School, Calendar, FileText } from "lucide-react";


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
  studentId?: string | null;
  staffId?: string | null;
}

interface Staff {
  id: string;
  name: string;
  subject: string;
}

export default function LeaveRequestsPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const userName = session?.user?.name || "Teacher";
  const teacherId = (session?.user as any)?.id;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);

  // Tab State
  const [activeTab, setActiveTab] = useState<"Student" | "Teacher">("Student");
  const [recordTab, setRecordTab] = useState<"Pending" | "History">("Pending");

  // Form State
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [studentId, setStudentId] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setLeaveType("");
    setCurrentPage(1);
  }, [activeTab, recordTab]);

  const filteredRequests = requests.filter((req) => {
    const matchesRole = activeTab === "Student" ? !!req.studentId : !req.studentId;
    const matchesStatus = recordTab === "Pending" ? req.status === "Pending" : req.status !== "Pending";
    return matchesRole && matchesStatus;
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  useEffect(() => {
    const fetchData = async () => {
      if (!schoolId || !session?.user) return;
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

        // 2. Fetch Leave history (only for this teacher's staff account)
        const leaveRes = await fetch(`${API_URL}/api/teacher/leave?schoolId=${schoolId}&userId=${teacherId}`);
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
          setStudentId("");
        }
      } catch (err) {
        console.error("Error loading leave page data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolId, API_URL, session, teacherId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;
    if (leaveType === "Other (Specify)" && !reason) return;

    const finalReason = leaveType === "Other (Specify)" ? reason : leaveType;

    const durationStr =
      startDate === endDate || !endDate
        ? `${startDate} (1 Day)`
        : `${startDate} to ${endDate}`;

    try {
      const payload: any = {
        type: leaveType,
        duration: durationStr,
        reason: finalReason,
        schoolId,
        staffId: teacherId,
      };

      if (activeTab === "Student") {
        payload.studentId = studentId;
      } else {
        payload.studentName = userName;
      }

      const res = await fetch(`${API_URL}/api/teacher/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
          text: "Leave request submitted successfully!",
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
      value: filteredRequests.length,
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
      title="Leave Management"
      subtitle="Track and request absences."
    >
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
                    className={`font-extrabold text-[var(--text-heading)] leading-tight truncate ${card.small ? "text-base sm:text-lg" : "text-2xl"
                      }`}
                  >
                    {card.value}
                  </h2>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 sm:gap-4 mb-6">
          <button
            onClick={() => setActiveTab("Student")}
            className={`px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${activeTab === "Student"
                ? "bg-[var(--primary)] text-slate-950 shadow-md shadow-[var(--primary)]/20"
                : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:border-[var(--primary)]/50"
              }`}
          >
            <Users className="w-4 h-4" /> Student Leave
          </button>
          <button
            onClick={() => setActiveTab("Teacher")}
            className={`px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${activeTab === "Teacher"
                ? "bg-[var(--primary)] text-slate-950 shadow-md shadow-[var(--primary)]/20"
                : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:border-[var(--primary)]/50"
              }`}
          >
            <User className="w-4 h-4" /> My Leave
          </button>
        </div>

        {/* Main Containers */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6 mb-6">
          {/* Leave Application Form */}
          <div className="theme-card p-4 sm:p-5 lg:p-6 border border-[var(--border)] h-fit rounded-2xl bg-[var(--bg-card)] min-w-0">
            <h2 className="text-base font-semibold text-[var(--text-heading)] mb-4">
              <FileText className="w-4 h-4 inline-block mr-1 text-[var(--primary)]" />{" "}
              {activeTab === "Student" ? "Request Student Leave" : "Request My Leave"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">
                  Leave Category
                </label>
                <select
                  required
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                >
                  <option value="" disabled>Select Leave Category</option>
                  {activeTab === "Student" ? (
                    <>
                      <optgroup label="Medical Reasons">
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Fever">Fever</option>
                        <option value="Cold and Cough">Cold and Cough</option>
                        <option value="Stomach Pain">Stomach Pain</option>
                        <option value="Headache">Headache</option>
                        <option value="Medical Checkup">Medical Checkup</option>
                        <option value="Hospital Visit">Hospital Visit</option>
                        <option value="Hospital Admission">Hospital Admission</option>
                        <option value="Surgery Recovery">Surgery Recovery</option>
                        <option value="Dental Appointment">Dental Appointment</option>
                      </optgroup>
                      <optgroup label="Family Reasons">
                        <option value="Family Function">Family Function</option>
                        <option value="Marriage Function">Marriage Function</option>
                        <option value="Family Emergency">Family Emergency</option>
                        <option value="Death in Family">Death in Family</option>
                        <option value="Parent Medical Emergency">Parent Medical Emergency</option>
                        <option value="Sibling Medical Emergency">Sibling Medical Emergency</option>
                        <option value="Child Care (for adult students)">Child Care (for adult students)</option>
                      </optgroup>
                      <optgroup label="Personal Reasons">
                        <option value="Personal Work">Personal Work</option>
                        <option value="Religious Function">Religious Function</option>
                        <option value="Passport/ID Appointment">Passport/ID Appointment</option>
                        <option value="Bank Work">Bank Work</option>
                        <option value="House Shifting">House Shifting</option>
                      </optgroup>
                      <optgroup label="Academic Reasons">
                        <option value="Competitive Examination">Competitive Examination</option>
                        <option value="Entrance Examination">Entrance Examination</option>
                        <option value="Scholarship Examination">Scholarship Examination</option>
                        <option value="Educational Competition">Educational Competition</option>
                        <option value="Science Exhibition">Science Exhibition</option>
                        <option value="Sports Competition">Sports Competition</option>
                        <option value="Cultural Event">Cultural Event</option>
                        <option value="NCC/NSS Camp">NCC/NSS Camp</option>
                      </optgroup>
                      <optgroup label="Travel Reasons">
                        <option value="Outstation Travel">Outstation Travel</option>
                        <option value="Vacation">Vacation</option>
                        <option value="Transport Strike">Transport Strike</option>
                        <option value="Vehicle Breakdown">Vehicle Breakdown</option>
                        <option value="Weather Conditions">Weather Conditions</option>
                      </optgroup>
                      <optgroup label="Emergency Reasons">
                        <option value="Natural Disaster">Natural Disaster</option>
                        <option value="Flood">Flood</option>
                        <option value="Cyclone">Cyclone</option>
                        <option value="Heavy Rain">Heavy Rain</option>
                        <option value="Accident">Accident</option>
                      </optgroup>
                      <optgroup label="School-Related Reasons">
                        <option value="Official School Activity">Official School Activity</option>
                        <option value="Educational Tour">Educational Tour</option>
                        <option value="Study Leave">Study Leave</option>
                        <option value="Examination Preparation">Examination Preparation</option>
                        <option value="School Representation">School Representation</option>
                      </optgroup>
                      <optgroup label="Other Reasons">
                        <option value="Other (Specify)">Other (Specify)</option>
                      </optgroup>
                    </>
                  ) : (
                    <>
                      <optgroup label="Personal Reasons">
                        <option value="Personal Work">Personal Work</option>
                        <option value="Family Function">Family Function</option>
                        <option value="Family Emergency">Family Emergency</option>
                        <option value="House Shifting">House Shifting</option>
                        <option value="Bank Work">Bank Work</option>
                        <option value="Government Office Work">Government Office Work</option>
                        <option value="Passport/Visa Appointment">Passport/Visa Appointment</option>
                        <option value="Marriage Ceremony">Marriage Ceremony</option>
                        <option value="Religious Function">Religious Function</option>
                      </optgroup>
                      <optgroup label="Medical Reasons">
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Fever">Fever</option>
                        <option value="Medical Checkup">Medical Checkup</option>
                        <option value="Hospital Admission">Hospital Admission</option>
                        <option value="Surgery Recovery">Surgery Recovery</option>
                        <option value="Dental Treatment">Dental Treatment</option>
                        <option value="Eye Checkup">Eye Checkup</option>
                        <option value="Pregnancy Checkup">Pregnancy Checkup</option>
                        <option value="Maternity Leave">Maternity Leave</option>
                        <option value="Paternity Leave">Paternity Leave</option>
                      </optgroup>
                      <optgroup label="Family Reasons">
                        <option value="Child Care">Child Care</option>
                        <option value="Parent Medical Emergency">Parent Medical Emergency</option>
                        <option value="Spouse Medical Emergency">Spouse Medical Emergency</option>
                        <option value="Death in Family (Bereavement Leave)">Death in Family (Bereavement Leave)</option>
                        <option value="Elder Care">Elder Care</option>
                      </optgroup>
                      <optgroup label="Official Reasons">
                        <option value="Official Duty">Official Duty</option>
                        <option value="Training Program">Training Program</option>
                        <option value="Workshop Attendance">Workshop Attendance</option>
                        <option value="Seminar/Conference">Seminar/Conference</option>
                        <option value="Examination Duty">Examination Duty</option>
                        <option value="Election Duty">Election Duty</option>
                        <option value="Educational Tour">Educational Tour</option>
                        <option value="School Official Assignment">School Official Assignment</option>
                      </optgroup>
                      <optgroup label="Education Reasons">
                        <option value="Higher Education Exam">Higher Education Exam</option>
                        <option value="Competitive Examination">Competitive Examination</option>
                        <option value="University Practical Exam">University Practical Exam</option>
                        <option value="Research Work">Research Work</option>
                      </optgroup>
                      <optgroup label="Travel Reasons">
                        <option value="Outstation Travel">Outstation Travel</option>
                        <option value="Vacation Leave">Vacation Leave</option>
                        <option value="Public Transport Strike">Public Transport Strike</option>
                        <option value="Weather Conditions">Weather Conditions</option>
                      </optgroup>
                      <optgroup label="Emergency Reasons">
                        <option value="Natural Disaster">Natural Disaster</option>
                        <option value="Flood">Flood</option>
                        <option value="Cyclone">Cyclone</option>
                        <option value="Accident">Accident</option>
                        <option value="Vehicle Breakdown">Vehicle Breakdown</option>
                        <option value="Power/Electricity Emergency">Power/Electricity Emergency</option>
                      </optgroup>
                      <optgroup label="Other Reasons">
                        <option value="Other (Specify)">Other (Specify)</option>
                      </optgroup>
                    </>
                  )}
                </select>
              </div>

              {/* Stacks to 1 column below 380px-ish screens, otherwise 2 columns */}
              <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-9 bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                </div>
                <div className="min-w-0">
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-9 bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {activeTab === "Student" ? (
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">
                    Student Name
                  </label>
                  <select
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  >
                    <option value="" disabled>Select Student Name</option>
                    {staffList.length > 0 ? (
                      staffList.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.subject})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No students found</option>
                    )}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">
                    Teacher Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    disabled
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] opacity-70 cursor-not-allowed"
                  />
                </div>
              )}

              {leaveType === "Other (Specify)" && (
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
              )}

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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-base font-semibold text-[var(--text-heading)]">
                  <Clipboard className="w-4 h-4 inline-block mr-1 text-[var(--primary)]" />{" "}
                  {recordTab === "Pending" ? "Pending Requests" : "Leave History"}
                </h2>
                
                {/* Record Tabs */}
                <div className="flex p-1 bg-[var(--bg-main)] rounded-xl border border-[var(--border)]">
                  <button
                    onClick={() => setRecordTab("Pending")}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      recordTab === "Pending"
                        ? "bg-[var(--primary)] text-slate-950 shadow-md"
                        : "text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card-hover)]"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setRecordTab("History")}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      recordTab === "History"
                        ? "bg-[var(--primary)] text-slate-950 shadow-md"
                        : "text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card-hover)]"
                    }`}
                  >
                    History
                  </button>
                </div>
              </div>

              {toast && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl mb-4">
                  {toast}
                </div>
              )}

              {loading ? (
                <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                  Loading leave history...
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                  No leave requests found.
                </div>
              ) : (
                <>
                  {/* Desktop / tablet: table view */}
                  <div className="hidden sm:block overflow-x-auto rounded-xl border border-[var(--border)]">
                    <table className="w-full text-left border-collapse min-w-[560px]">
                      <thead>
                        <tr className="bg-[var(--bg-main)] border-b border-[var(--border)] text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-extrabold">
                          <th className="p-3.5">Leave Type</th>
                          <th className="p-3.5">Period Details</th>
                          <th className="p-3.5">Reason</th>
                          <th className="p-3.5">Name</th>
                          <th className="p-3.5 text-center">Status</th>
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
                            <td className="p-3.5 text-center">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${
                                  req.status === "Approved"
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : req.status === "Rejected"
                                    ? "bg-red-500/10 text-red-500"
                                    : "bg-amber-500/10 text-amber-500"
                                }`}
                              >
                                {req.status || "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile: card list */}
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
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-[var(--text-heading)] font-medium truncate">
                            <User className="w-4 h-4 inline-block mr-1 text-inherit" /> {req.studentName}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${
                              req.status === "Approved"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : req.status === "Rejected"
                                ? "bg-red-500/10 text-red-500"
                                : "bg-amber-500/10 text-amber-500"
                            }`}
                          >
                            {req.status || "Pending"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Pagination Controls */}
            {!loading && filteredRequests.length > 0 && (
              <div className="flex flex-col xl:flex-row justify-between items-center gap-4 pt-4 border-t border-[var(--border)] mt-auto">
                <span className="text-[11px] text-[var(--text-muted)]">
                  Showing <span className="font-bold text-[var(--text-heading)]">{filteredRequests.length > 0 ? indexOfFirst + 1 : 0}</span> to{" "}
                  <span className="font-bold text-[var(--text-heading)]">
                    {Math.min(indexOfLast, filteredRequests.length)}
                  </span>{" "}
                  of <span className="font-bold text-[var(--text-heading)]">{filteredRequests.length}</span> inquiries
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
                      className={`w-8 h-8 text-xs font-bold rounded-xl transition-all ${currentPage === pageNum
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