"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { Calendar, CheckCircle, XCircle, Clock, Search, FileText } from "lucide-react";
import Swal from "sweetalert2";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};
const API_BASE = getApiBase();

interface LeaveRequest {
  id: string;
  type: string;
  duration: string;
  reason: string;
  studentName: string;
  status: "Approved" | "Pending" | "Rejected";
  createdAt: string;
  studentId?: string | null;
  staffId?: string | null;
}

export default function HeadmasterLeavePage() {
  const { data: session } = useSession();
  const schoolId: string = (session?.user as any)?.schoolId || "";

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Pending" | "History">("Pending");
  const [activeRoleTab, setActiveRoleTab] = useState<"Student" | "Teacher">("Student");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/teacher/leave?schoolId=${schoolId}`);
      const json = await res.json();
      if (json.success) {
        setRequests(json.data);
      }
    } catch (err) {
      console.error("Error fetching leave requests", err);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (id: string, status: "Approved" | "Rejected") => {
    const isApproved = status === "Approved";
    
    const result = await Swal.fire({
      title: isApproved ? 'Approve Leave Request?' : 'Reject Leave Request?',
      text: isApproved ? "Are you sure you want to approve this leave request?" : "Are you sure you want to reject this leave request?",
      icon: isApproved ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: isApproved ? '#10b981' : '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: isApproved ? 'Yes, Approve' : 'Yes, Reject',
      background: 'var(--bg-card)',
      color: 'var(--text-heading)',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/api/headmaster/leave/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, approvedById: (session?.user as any)?.id }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        Swal.fire({
          title: 'Success!',
          text: `Leave request has been ${status.toLowerCase()}.`,
          icon: 'success',
          confirmButtonColor: '#3b82f6',
          background: 'var(--bg-card)',
          color: 'var(--text-heading)',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: data.error || 'Failed to update leave status.',
          icon: 'error',
          background: 'var(--bg-card)',
          color: 'var(--text-heading)',
        });
      }
    } catch (error) {
      console.error("Error updating leave status", error);
      Swal.fire({
        title: 'Error!',
        text: 'An error occurred while updating the status.',
        icon: 'error',
        background: 'var(--bg-card)',
        color: 'var(--text-heading)',
      });
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesTab = activeTab === "Pending" ? req.status === "Pending" : req.status !== "Pending";
    const matchesRole = activeRoleTab === "Student" ? !!req.studentId : (!req.studentId && !!req.staffId);
    const matchesSearch =
      req.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesRole && matchesSearch;
  });

  return (
    <PortalLayout>
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in zoom-in duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-heading)] tracking-tight">
              Leave Management
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1 font-medium">
              Review and approve leave requests for your school.
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border)] shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto overflow-x-auto">
            {/* Role Tabs */}
            <div className="flex p-1 bg-[var(--bg-main)] rounded-xl border border-[var(--border)]">
              <button
                onClick={() => setActiveRoleTab("Student")}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeRoleTab === "Student"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card-hover)]"
                }`}
              >
                Student Leaves
              </button>
              <button
                onClick={() => setActiveRoleTab("Teacher")}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeRoleTab === "Teacher"
                    ? "bg-amber-600 text-white shadow-md"
                    : "text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card-hover)]"
                }`}
              >
                Teacher Leaves
              </button>
            </div>

            {/* Status Tabs */}
            <div className="flex p-1 bg-[var(--bg-main)] rounded-xl border border-[var(--border)]">
              <button
                onClick={() => setActiveTab("Pending")}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === "Pending"
                    ? "bg-[var(--primary)] text-slate-950 shadow-md"
                    : "text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card-hover)]"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveTab("History")}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === "History"
                    ? "bg-[var(--primary)] text-slate-950 shadow-md"
                    : "text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card-hover)]"
                }`}
              >
                History
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by name or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] text-sm text-[var(--text-heading)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
            />
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden flex flex-col flex-1">
          <div className="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-main)]/50">
            <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-heading)] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--primary)]" />
              {activeTab} Requests
            </h2>
            <div className="text-xs font-bold px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full">
              {filteredRequests.length} Total
            </div>
          </div>

          <div className="p-0 overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-sm text-[var(--text-muted)] animate-pulse">
                Loading requests...
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-sm text-[var(--text-muted)]">
                No {activeTab.toLowerCase()} requests found.
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[var(--bg-main)] border-b border-[var(--border)] text-[var(--text-muted)] text-xs uppercase tracking-wider font-extrabold">
                    <th className="p-4">Name / Role</th>
                    <th className="p-4">Leave Type</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Reason</th>
                    <th className="p-4">Status</th>
                    {activeTab === "Pending" && <th className="p-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-[var(--bg-main)] transition-colors group">
                      <td className="p-4">
                        <div className="font-bold text-[var(--text-heading)] text-sm">{req.studentName}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-0.5">
                          {req.studentId ? "Student" : req.staffId ? "Staff/Teacher" : "Unknown"}
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-[var(--text-heading)]">{req.type}</td>
                      <td className="p-4 text-sm text-[var(--text-heading)] flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                        {req.duration}
                      </td>
                      <td className="p-4 text-sm text-[var(--text-muted)] max-w-xs truncate" title={req.reason}>
                        {req.reason}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            req.status === "Approved"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : req.status === "Rejected"
                              ? "bg-red-500/10 text-red-500 border border-red-500/20"
                              : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          }`}
                        >
                          {req.status === "Approved" ? (
                            <CheckCircle className="w-3.5 h-3.5" />
                          ) : req.status === "Rejected" ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          {req.status}
                        </span>
                      </td>
                      {activeTab === "Pending" && (
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2 transition-opacity">
                            <button
                              onClick={() => handleAction(req.id, "Approved")}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(req.id, "Rejected")}
                              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
