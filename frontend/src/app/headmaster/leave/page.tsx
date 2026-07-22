"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
// Lucide icon imports removed in favor of Flaticon classes
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
  const { lang } = usePortalLanguage();
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
    <PortalLayout
      title={lang === "தமிழ்" ? "விடுபு மேலாண்மை" : "Leave Management"}
      subtitle={lang === "தமிழ்" ? "மாணவர்கள் மற்றும் பணியாளர்களின் விடுமுறை கோரிக்கைகளை மதிப்பிட்டு அனுமதிக்கவும்" : "Review and approve student and staff leave requests for your school"}
      avatarLetter="V"
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      <div className="leave-portal-container flex flex-col gap-6 w-full animate-in fade-in zoom-in duration-500">
        
        <style dangerouslySetInnerHTML={{__html: `
          /* Local light mode styles */
          .leave-portal-container .custom-card {
            background: #ffffff;
            border: 1px solid #cbd5e1;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          .leave-portal-container .custom-tab-container {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
          }
          .leave-portal-container .custom-tab-btn {
            color: #475569;
          }
          .leave-portal-container .custom-tab-btn:hover {
            color: #0f172a;
            background: #e2e8f0;
          }
          .leave-portal-container .custom-tab-btn.active-student {
            background: #2563eb;
            color: #ffffff;
          }
          .leave-portal-container .custom-tab-btn.active-teacher {
            background: #d97706;
            color: #ffffff;
          }
          .leave-portal-container .custom-tab-btn.active-status {
            background: #2563eb;
            color: #ffffff;
          }
          .leave-portal-container .custom-search {
            background: #ffffff;
            border: 1px solid #cbd5e1;
            color: #0f172a;
          }
          .leave-portal-container .custom-search::placeholder {
            color: #94a3b8;
          }
          .leave-portal-container .custom-table-header {
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            color: #475569;
          }
          .leave-portal-container .custom-table-row {
            border-bottom: 1px solid #cbd5e1;
            color: #334155;
          }
          .leave-portal-container .custom-table-row:hover {
            background: #f8fafc;
          }
          .leave-portal-container .custom-text-name {
            color: #0f172a;
          }
          .leave-portal-container .custom-text-muted {
            color: #64748b;
          }

          /* Local dark mode overrides */
          .dark .leave-portal-container .custom-card {
            background: rgba(15, 23, 42, 0.45);
            border: 1px solid rgba(51, 65, 85, 0.6);
            box-shadow: none;
          }
          .dark .leave-portal-container .custom-tab-container {
            background: rgba(2, 6, 23, 0.6);
            border: 1px solid rgba(51, 65, 85, 0.6);
          }
          .dark .leave-portal-container .custom-tab-btn {
            color: #94a3b8;
          }
          .dark .leave-portal-container .custom-tab-btn:hover {
            color: #ffffff;
            background: rgba(30, 41, 59, 0.5);
          }
          .dark .leave-portal-container .custom-tab-btn.active-student {
            background: #2563eb;
            color: #ffffff;
          }
          .dark .leave-portal-container .custom-tab-btn.active-teacher {
            background: #d97706;
            color: #ffffff;
          }
          .dark .leave-portal-container .custom-tab-btn.active-status {
            background: rgba(59, 130, 246, 0.1);
            color: #60a5fa;
            border: 1px solid rgba(59, 130, 246, 0.2);
          }
          .dark .leave-portal-container .custom-search {
            background: rgba(2, 6, 23, 0.6);
            border: 1px solid rgba(51, 65, 85, 0.6);
            color: #ffffff;
          }
          .dark .leave-portal-container .custom-table-header {
            background: rgba(2, 6, 23, 0.2);
            border-bottom: 1px solid rgba(51, 65, 85, 0.6);
            color: #64748b;
          }
          .dark .leave-portal-container .custom-table-row {
            border-bottom: 1px solid rgba(51, 65, 85, 0.4);
            color: #cbd5e1;
          }
          .dark .leave-portal-container .custom-table-row:hover {
            background: rgba(30, 41, 59, 0.2);
          }
          .dark .leave-portal-container .custom-text-name {
            color: #ffffff;
          }
          .dark .leave-portal-container .custom-text-muted {
            color: #64748b;
          }
        `}} />

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between custom-card p-4 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto overflow-x-auto">
            {/* Role Tabs */}
            <div className="flex p-1 custom-tab-container rounded-xl">
              <button
                onClick={() => setActiveRoleTab("Student")}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap custom-tab-btn ${
                  activeRoleTab === "Student" ? "active-student" : ""
                }`}
              >
                {lang === "தமிழ்" ? "மாணவர் விடுபுகள்" : "Student Leaves"}
              </button>
              <button
                onClick={() => setActiveRoleTab("Teacher")}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap custom-tab-btn ${
                  activeRoleTab === "Teacher" ? "active-teacher" : ""
                }`}
              >
                {lang === "தமிழ்" ? "ஆசிரியர் விடுபுகள்" : "Teacher Leaves"}
              </button>
            </div>

            {/* Status Tabs */}
            <div className="flex p-1 custom-tab-container rounded-xl">
              <button
                onClick={() => setActiveTab("Pending")}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap custom-tab-btn ${
                  activeTab === "Pending" ? "active-status" : ""
                }`}
              >
                {lang === "தமிழ்" ? "விடுபு கோரிக்கைகள்" : "Pending"}
              </button>
              <button
                onClick={() => setActiveTab("History")}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap custom-tab-btn ${
                  activeTab === "History" ? "active-status" : ""
                }`}
              >
                {lang === "தமிழ்" ? "வரலாறு" : "History"}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <i className="fi fi-rr-search absolute left-3.5 top-1/2 -translate-y-1/2 text-xs custom-text-muted" />
            <input
              type="text"
              placeholder={lang === "தமிழ்" ? "பெயர் அல்லது காரணத்தின்மூலம் தேடுக..." : "Search by name or reason..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs custom-search focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Requests List */}
        <div className="custom-card rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between custom-table-header">
            <h2 className="text-sm sm:text-base font-bold flex items-center gap-2">
              <i className="fi fi-rr-document-signed text-base text-blue-500" />
              {activeTab} Requests
            </h2>
            <div className="text-[10px] sm:text-xs font-bold px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/20">
              {filteredRequests.length} Total
            </div>
          </div>

          <div className="p-0 overflow-x-auto w-full">
            {loading ? (
              <div className="text-center py-12 text-xs sm:text-sm custom-text-muted animate-pulse">
                Loading requests...
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-xs sm:text-sm custom-text-muted">
                No {activeTab.toLowerCase()} requests found.
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="custom-table-header text-[10px] uppercase tracking-wider">
                    <th className="px-4 py-3">Name / Role</th>
                    <th className="px-4 py-3">Leave Type</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Status</th>
                    {activeTab === "Pending" && <th className="px-4 py-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="custom-table-row text-[11px] sm:text-xs transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold custom-text-name text-xs sm:text-sm">{req.studentName}</div>
                        <div className="text-[10px] sm:text-xs custom-text-muted mt-0.5">
                          {req.studentId ? "Student" : req.staffId ? "Staff/Teacher" : "Unknown"}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold">{req.type}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <i className="fi fi-rr-calendar text-xs sm:text-sm custom-text-muted" />
                          {req.duration}
                        </div>
                      </td>
                      <td className="px-4 py-3 custom-text-muted max-w-xs truncate" title={req.reason}>
                        {req.reason}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                            req.status === "Approved"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : req.status === "Rejected"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {req.status === "Approved" ? (
                            <i className="fi fi-rr-check-circle text-xs" />
                          ) : req.status === "Rejected" ? (
                            <i className="fi fi-rr-cross-circle text-xs" />
                          ) : (
                            <i className="fi fi-rr-clock text-xs" />
                          )}
                          {req.status}
                        </span>
                      </td>
                      {activeTab === "Pending" && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleAction(req.id, "Approved")}
                              className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-xs font-bold rounded-lg transition-colors shadow-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(req.id, "Rejected")}
                              className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] sm:text-xs font-bold rounded-lg transition-colors shadow-sm"
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
