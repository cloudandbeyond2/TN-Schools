"use client";

import React, { useState, useEffect, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

interface ScholarshipApp {
  id: string;
  studentName: string;
  classSection: string;
  schemeName: string;
  amount: number;
  status: "Disbursed" | "Approved" | "Pending Verification" | "Rejected";
  emisId: string;
}

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

export default function ScholarshipPage() {
  const { data: session } = useSession();
  const schoolId: string = (session?.user as any)?.schoolId || "";

  const [applications, setApplications] = useState<ScholarshipApp[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string; class: string; emisNumber: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"All" | "Disbursed" | "Approved" | "Pending Verification">("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Verification Form State
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("EMIS-VERIFY-2026");
  const [verifyToast, setVerifyToast] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    if (!schoolId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/teacher/scholarships?schoolId=${schoolId}`);
      const json = await res.json();
      if (json.success) {
        const mapped = json.data.map((app: any) => ({
          id: app.id,
          studentName: app.student?.user?.name || "Unknown Student",
          classSection: `${app.student?.class || ""}-${app.student?.section || ""}`,
          schemeName: app.scheme,
          amount: app.amount,
          status: app.status === "PENDING" ? "Pending Verification" : (app.status === "APPROVED" ? "Approved" : (app.status === "DISBURSED" ? "Disbursed" : "Rejected")),
          emisId: app.student?.emisNumber || app.student?.rollNumber || "—"
        }));
        setApplications(mapped);
      }

      // Fetch students for the create modal
      const studentRes = await fetch(`${API_BASE}/api/headmaster/students?schoolId=${schoolId}`);
      const studentJson = await studentRes.json();
      if (studentJson.success) {
        setStudents(studentJson.data.map((s: any) => ({
          id: s.id,
          name: s.user?.name || "Unknown",
          class: `${s.class}-${s.section}`,
          emisNumber: s.emisNumber || "N/A"
        })));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    const firstPending = applications.find(app => app.status === "Pending Verification");
    if (firstPending && !selectedAppId) {
      setSelectedAppId(firstPending.id);
    }
  }, [applications, selectedAppId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, applications.length]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId) return;
    if (!verificationCode.trim()) {
      Swal.fire("Validation Error", "Please enter the EMIS Verification Key.", "error");
      return;
    }
    const matchedApp = applications.find(a => a.id === selectedAppId);
    if (!matchedApp) return;

    try {
      const res = await fetch(`${API_BASE}/api/teacher/scholarships/${selectedAppId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" })
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire({
          title: "Verified & Approved!",
          text: `Application for ${matchedApp.studentName} verified and state treasury release approved!`,
          icon: "success"
        });
        setSelectedAppId(""); // Reset to let effect pick the next pending application
        setVerificationCode(""); // Clear the input
        fetchApplications(); // Refresh list
      } else {
        Swal.fire("Error", "Failed to verify scholarship: " + (json.error || "Unknown error"), "error");
      }
    } catch (err) {
      console.error("Error verifying scholarship:", err);
      Swal.fire("Error", "Server error occurred during verification.", "error");
    }
  };

  const handleCreate = async () => {
    if (students.length === 0) {
      Swal.fire("Error", "No students found to assign a scholarship to.", "error");
      return;
    }

    const studentOptions = students.map(s => `<option value="${s.id}">${s.name} (${s.class}) - EMIS: ${s.emisNumber}</option>`).join('');

    const { value: formValues } = await Swal.fire({
      title: 'Allocate New Scholarship',
      html:
        `<div class="text-left">
          <label class="block text-xs text-slate-500 mb-1 font-bold">Select Student</label>
          <select id="swal-student" class="w-full p-2 mb-3 border rounded text-sm text-slate-800 bg-white">
            ${studentOptions}
          </select>
          <label class="block text-xs text-slate-500 mb-1 font-bold">Scholarship Scheme Name</label>
          <input id="swal-scheme" class="w-full p-2 mb-3 border rounded text-sm text-slate-800 bg-white" placeholder="e.g. Merit Cum Means">
          <label class="block text-xs text-slate-500 mb-1 font-bold">Amount (₹)</label>
          <input id="swal-amount" type="number" class="w-full p-2 border rounded text-sm text-slate-800 bg-white" placeholder="e.g. 5000">
        </div>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Create Allocation',
      confirmButtonColor: '#3b82f6',
      preConfirm: () => {
        const studentId = (document.getElementById('swal-student') as HTMLSelectElement).value;
        const scheme = (document.getElementById('swal-scheme') as HTMLInputElement).value;
        const amount = (document.getElementById('swal-amount') as HTMLInputElement).value;
        
        if (!studentId || !scheme || !amount) {
          Swal.showValidationMessage('All fields are required');
          return false;
        }
        return { studentId, scheme, amount: Number(amount) };
      }
    });

    if (formValues) {
      try {
        const res = await fetch(`${API_BASE}/api/teacher/scholarships`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formValues)
        });
        const json = await res.json();
        if (json.success) {
          Swal.fire("Created!", "Scholarship allocation created successfully.", "success");
          fetchApplications();
        } else {
          Swal.fire("Error", "Failed to create scholarship: " + json.error, "error");
        }
      } catch (err) {
        console.error("Error creating scholarship:", err);
        Swal.fire("Error", "Server error occurred while creating.", "error");
      }
    }
  };

  const handleDelete = async (id: string, studentName: string) => {
    const result = await Swal.fire({
      title: 'Delete Allocation?',
      text: `Are you sure you want to delete the scholarship for ${studentName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_BASE}/api/teacher/scholarships/${id}`, {
          method: "DELETE"
        });
        const json = await res.json();
        if (json.success) {
          Swal.fire("Deleted!", "The scholarship has been removed.", "success");
          fetchApplications();
        } else {
          Swal.fire("Error", "Failed to delete: " + json.error, "error");
        }
      } catch (err) {
        console.error("Error deleting:", err);
        Swal.fire("Error", "Server error occurred while deleting.", "error");
      }
    }
  };


  const totalDisbursed = applications
    .filter((a) => a.status === "Disbursed")
    .reduce((sum, a) => sum + a.amount, 0);

  const approvedCount = applications.filter((a) => a.status === "Approved").length;
  const pendingCount = applications.filter((a) => a.status === "Pending Verification").length;

  const conversionPct = applications.length > 0
    ? Math.round((applications.filter((a) => a.status === "Approved" || a.status === "Disbursed").length / applications.length) * 100)
    : 100;

  const filteredApps = applications.filter(
    (app) => activeFilter === "All" || app.status === activeFilter
  );

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <PortalLayout
      title="Scholarship Distribution & Verification Desk"
      subtitle={`${session?.user?.name || "Headmaster"} · School ID: ${schoolId || "33012345"}`}
      avatarLetter={session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "H"}
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Disbursed Funds",
            value: `₹${totalDisbursed.toLocaleString()}`,
            sub: "Credited direct to Aadhaar linked accounts.",
            icon: <i className="fi fi-rr-sack-dollar text-lg" />,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10"
          },
          {
            label: "Approved Batches",
            value: `${approvedCount} ${approvedCount === 1 ? "Application" : "Applications"}`,
            sub: "Ready for Treasury officer authorization.",
            icon: <i className="fi fi-rr-checkbox text-lg" />,
            color: "text-blue-400",
            bg: "bg-blue-500/10"
          },
          {
            label: "Pending EMIS Audits",
            value: `${pendingCount} ${pendingCount === 1 ? "Application" : "Applications"}`,
            sub: "Verify academic records & community tags.",
            icon: <i className="fi fi-rr-clipboard-list text-lg" />,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
          },
          {
            label: "Target Conversion",
            value: `${conversionPct}%`,
            sub: "Active mapping for eligible students.",
            icon: <i className="fi fi-rr-arrow-trend-up text-lg" />,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10"
          }
        ].map((kpi, idx) => (
          <div key={idx} className="glass p-4 rounded-2xl border border-slate-800 flex items-center justify-between hover:scale-[1.02] transition-all shadow-sm">
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider truncate">{kpi.label}</span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-xl font-black text-white">{kpi.value}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">
                {kpi.sub}
              </div>
            </div>
            <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color} shrink-0 ml-3 flex items-center justify-center`}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Application Directory */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <i className="fi fi-rr-graduation-cap text-blue-400" /> Community Scholarship Register
              </h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <p className="text-xs text-slate-500 leading-relaxed">Applicants flagged for social welfare bursary allocations.</p>
                <button
                  onClick={handleCreate}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] transition-colors flex items-center gap-1.5 w-fit"
                >
                  <i className="fi fi-rr-plus" /> Create Allocation
                </button>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
              {(["All", "Disbursed", "Approved", "Pending Verification"] as const).map((filterVal) => (
                <button
                  key={filterVal}
                  onClick={() => setActiveFilter(filterVal)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    activeFilter === filterVal
                      ? "bg-blue-600 text-white font-extrabold"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {filterVal === "Pending Verification" ? "Pending" : filterVal}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-405 font-bold flex items-center justify-center gap-2">
              <i className="fi fi-rr-spinner animate-spin text-lg" /> Loading scholarship records...
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedApps.map((app) => (
                <div
                  key={app.id}
                  className="p-4 bg-slate-900/60 rounded-xl border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-slate-800 text-slate-350 border border-slate-700 rounded-md">
                        {app.schemeName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">EMIS: {app.emisId}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-0.5">{app.studentName}</h3>
                    <div className="text-xs text-slate-400">
                      Grade: <strong className="text-slate-300">{app.classSection}</strong> · Amount: <span className="text-emerald-400 font-bold">₹{app.amount}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`badge ${
                      app.status === "Disbursed"
                        ? "badge-green"
                        : app.status === "Approved"
                        ? "badge-blue"
                        : "badge-yellow"
                    }`}>
                      {app.status}
                    </span>
                    <button
                      onClick={() => handleDelete(app.id, app.studentName)}
                      className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors border border-red-500/20"
                      title="Delete Allocation"
                    >
                      <i className="fi fi-rr-trash" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredApps.length === 0 && (
                <div className="py-6 text-center text-slate-500 italic">
                  No matching applications found.
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80 pt-4 mt-6">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="w-full sm:w-auto px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-white rounded-xl border border-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className="fi fi-rr-angle-left text-[10px]" /> Previous
                  </button>
                  
                  <div className="flex items-center gap-1.5 flex-wrap justify-center font-bold">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentPage === pageNumber
                            ? "bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/20"
                            : "bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800/80"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="w-full sm:w-auto px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-white rounded-xl border border-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Next <i className="fi fi-rr-angle-right text-[10px]" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Verification workspace */}
        <div className="glass rounded-2xl p-6 border border-slate-800 h-fit">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-2">
            <i className="fi fi-rr-checkbox text-blue-400" /> Verify Candidate Data
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Perform EMIS Community Cert audits and clear pending scholarship grants for processing.
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Select Student</label>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                {applications
                  .filter((app) => app.status === "Pending Verification")
                  .map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.studentName} ({app.classSection})
                    </option>
                  ))}
                {applications.filter((app) => app.status === "Pending Verification").length === 0 && (
                  <option value="">No pending audits remaining</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-semibold">EMIS Verification Key</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                required
              />
            </div>

            <button
              type="submit"
              disabled={applications.filter((app) => app.status === "Pending Verification").length === 0}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Verify Communities Cert & Approve
            </button>
          </form>

          {verifyToast && (
            <div className="mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl leading-relaxed">
              {verifyToast}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
