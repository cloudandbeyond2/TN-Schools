"use client";

import React, { useEffect, useState, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import ParentPortalBanner from "@/components/ParentPortalBanner";
import { useParentChildren, getApiBase, Child } from "@/lib/useParentChildren";

interface LeaveRequest {
  id: string;
  type: string;
  duration: string;
  reason: string;
  status: string;
  createdAt: string;
  studentName?: string;
  studentId?: string;
}

export default function ParentLeavePage() {
  const { parentId, children, activeChild, setActiveChild, childrenLoading } = useParentChildren();
  
  // Local state for leaves
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [leavesLoading, setLeavesLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string>("all");

  // Form states
  const [formChildId, setFormChildId] = useState<string>("");
  const [leaveType, setLeaveType] = useState<string>("Sick Leave");
  const [duration, setDuration] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string>("");
  const [formSuccess, setFormSuccess] = useState<string>("");

  // Filters & Pagination states
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  // Initialize form child selection
  useEffect(() => {
    if (children.length > 0) {
      setFormChildId(children[0].studentId);
    }
  }, [children]);

  // Fetch leaves from database
  const fetchLeaves = useCallback(async () => {
    if (!parentId || children.length === 0) {
      setLeavesLoading(false);
      return;
    }
    
    setLeavesLoading(true);
    const apiUrl = getApiBase();
    try {
      const allLeaves: LeaveRequest[] = [];
      const fetchTargets = selectedChildId === "all" 
        ? children 
        : children.filter(c => c.studentId === selectedChildId);

      for (const child of fetchTargets) {
        const res = await fetch(`${apiUrl}/api/students/${child.studentId}/leave`);
        const json = await res.json();
        if (json.success && json.data) {
          // Attach studentName for all Wards view clarification
          const leavesWithNames = json.data.map((l: LeaveRequest) => ({
            ...l,
            studentName: child.name
          }));
          allLeaves.push(...leavesWithNames);
        }
      }

      // Sort by date descending
      allLeaves.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setLeaves(allLeaves);
    } catch (error) {
      console.error("Failed to fetch leave requests:", error);
    } finally {
      setLeavesLoading(false);
    }
  }, [parentId, children, selectedChildId]);

  useEffect(() => {
    if (!childrenLoading && children.length > 0) {
      fetchLeaves();
    }
  }, [childrenLoading, children, selectedChildId, fetchLeaves]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedChildId, statusFilter, searchQuery]);

  // Handle Form Submission
  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formChildId) {
      setFormError("Please select a child.");
      return;
    }
    if (!duration.trim()) {
      setFormError("Please specify the duration.");
      return;
    }
    if (!reason.trim()) {
      setFormError("Please provide a reason for the leave.");
      return;
    }

    const selectedChild = children.find(c => c.studentId === formChildId);
    if (!selectedChild) {
      setFormError("Selected child record not found.");
      return;
    }

    setSubmitting(true);
    const apiUrl = getApiBase();

    try {
      const res = await fetch(`${apiUrl}/api/teacher/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: leaveType,
          duration: duration.trim(),
          reason: reason.trim(),
          studentId: selectedChild.studentId,
          studentName: selectedChild.name,
          schoolId: selectedChild.schoolId,
          userId: parentId, // Notifies parent of submission
          staffId: null // explicitly null for parent submission
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFormSuccess("Leave request submitted successfully!");
        setDuration("");
        setReason("");
        // Reload list
        fetchLeaves();
      } else {
        setFormError(json.error || "Failed to submit leave request.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setFormError("A network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // KPIs Calculations
  const totalSubmitted = leaves.length;
  const approvedCount = leaves.filter(l => l.status.toLowerCase() === "approved").length;
  const pendingCount = leaves.filter(l => l.status.toLowerCase() === "pending").length;
  const rejectedCount = leaves.filter(l => l.status.toLowerCase() === "rejected").length;

  // Filter leaves list
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredLeaves = leaves.filter(l => {
    const matchesStatus = statusFilter === "All" || l.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = !trimmedQuery || 
      l.type.toLowerCase().includes(trimmedQuery) ||
      l.reason.toLowerCase().includes(trimmedQuery) ||
      (l.studentName && l.studentName.toLowerCase().includes(trimmedQuery));
    return matchesStatus && matchesSearch;
  });

  // Pagination Math
  const totalPages = Math.ceil(filteredLeaves.length / pageSize) || 1;
  const paginatedLeaves = filteredLeaves.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return {
          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          icon: "fi fi-rr-check-circle"
        };
      case "rejected":
        return {
          bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
          icon: "fi fi-rr-cross-circle"
        };
      default:
        return {
          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          icon: "fi fi-rr-clock"
        };
    }
  };

  return (
    <PortalLayout
      title="Parent Portal"
      subtitle="Submit leave requests, track approval status, and view history."
      avatarLetter="P"
      avatarColor="#10b981"
      themeClass="theme-parent"
      accentColor="#10b981"
    >
      <ParentPortalBanner pageKey="leave" />

      {/* Child Switcher / Filter */}
      {children.length > 1 && (
        <div className="flex items-center gap-3 mb-5 p-3 bg-white dark:bg-slate-900/40 rounded-2xl flex-wrap border border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
            <i className="fi fi-rr-user text-[10px]"></i> View Child:
          </span>
          <button
            onClick={() => setSelectedChildId("all")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
              selectedChildId === "all"
                ? "bg-emerald-600 border-emerald-500 text-white shadow-sm"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            All Wards
          </button>
          {children.map(c => (
            <button
              key={c.studentId}
              onClick={() => setSelectedChildId(c.studentId)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
                selectedChildId === c.studentId
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              {c.name.split(" ")[0]} · Class {c.class}{c.section}
            </button>
          ))}
        </div>
      )}

      {/* KPI Cards Row (Responsive 2x2 or 1x4 Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
        {[
          { label: "Total Requests", value: totalSubmitted, icon: "fi fi-rr-document-signed", color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "Approved", value: approvedCount, icon: "fi fi-rr-check-circle", color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Pending Review", value: pendingCount, icon: "fi fi-rr-clock", color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
          { label: "Rejected", value: rejectedCount, icon: "fi fi-rr-cross-circle", color: "text-rose-500 dark:text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
        ].map((k, idx) => (
          <div key={idx} className="kpi-card text-left transition-colors duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${k.bg} ${k.color}`}>
                <i className={`${k.icon} text-lg`}></i>
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${k.color}`}>Leaves</span>
            </div>
            {childrenLoading || leavesLoading ? (
              <div className="h-8 w-16 bg-slate-700 rounded animate-pulse mb-1.5" />
            ) : (
              <div className={`text-3xl font-black ${k.color} mb-1`}>{k.value}</div>
            )}
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Main Grid: Form (1 col) & History (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Left Side: History Card (Takes 2/3 width on desktop) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 text-left flex flex-col justify-between h-full">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                  <i className="fi fi-rr-document-signed text-lg"></i>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-white">Leave History & Status</h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">Track approvals, search, and manage submitted request records.</p>
                </div>
              </div>
              
              {/* Search input */}
              <div className="relative w-full sm:w-48">
                <i className="fi fi-rr-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs"></i>
                <input
                  type="text"
                  placeholder="Search reason / type..."
                  value={searchQuery === " " ? "" : searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value || " ")}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex items-center justify-between gap-3 mb-5 overflow-x-auto pb-1 scrollbar-thin">
              <div className="flex gap-1.5">
                {["All", "Pending", "Approved", "Rejected"].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-200 border ${
                      statusFilter === s
                        ? "bg-emerald-600 border-emerald-500 text-white shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="text-[10px] font-bold text-slate-500 shrink-0">
                Filtered: {filteredLeaves.length} records
              </div>
            </div>

            {/* History List */}
            {leavesLoading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-slate-800/40 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredLeaves.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="w-12 h-12 mx-auto bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mb-3">
                  <i className="fi fi-rr-exclamation text-xl"></i>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">No leave records found</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Try altering your child switcher or status filters.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {paginatedLeaves.map((l) => {
                  const style = getStatusStyle(l.status);
                  return (
                    <div
                      key={l.id}
                      className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all duration-300"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-wider rounded-md">
                              {l.type}
                            </span>
                            <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border flex items-center gap-1.5 ${style.bg}`}>
                              <i className={style.icon}></i>
                              {l.status}
                            </span>
                            {selectedChildId === "all" && l.studentName && (
                              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                👶 {l.studentName}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs font-bold">
                            <i className="fi fi-rr-calendar text-slate-400 text-xs"></i>
                            <span>Duration: {l.duration}</span>
                          </div>
                          
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            <span className="font-bold text-slate-400 dark:text-slate-500 mr-1.5">Reason:</span>
                            {l.reason}
                          </p>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Submitted On</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                            {new Date(l.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {filteredLeaves.length > pageSize && (
            <div className="flex items-center justify-center gap-2 pt-6 mt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-800/10 hover:text-slate-700 dark:hover:text-slate-250 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                title="First Page"
              >
                <i className="fi fi-rr-angle-double-left"></i>
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-800/10 hover:text-slate-700 dark:hover:text-slate-250 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                title="Previous Page"
              >
                <i className="fi fi-rr-angle-left"></i>
              </button>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-3">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-800/10 hover:text-slate-700 dark:hover:text-slate-250 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                title="Next Page"
              >
                <i className="fi fi-rr-angle-right"></i>
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-800/10 hover:text-slate-700 dark:hover:text-slate-250 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                title="Last Page"
              >
                <i className="fi fi-rr-angle-double-right"></i>
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Request Submission Form (1/3 width on desktop) */}
        <div className="bg-white dark:bg-slate-900/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 text-left h-fit">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
              <i className="fi fi-rr-pencil text-lg"></i>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Submit Request</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Submit a formal child leave request to school.</p>
            </div>
          </div>

          <form onSubmit={handleSubmitLeave} className="space-y-4">
            
            {/* Child Selection Dropdown */}
            {children.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                  Select Child
                </label>
                <select
                  value={formChildId}
                  onChange={(e) => setFormChildId(e.target.value)}
                  disabled={submitting || children.length <= 1}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                >
                  {children.map(c => (
                    <option key={c.studentId} value={c.studentId}>
                      {c.name} (Class {c.class}{c.section})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Leave Type Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                Leave Type
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                disabled={submitting}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              >
                <option value="Sick Leave">Sick Leave</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Family Event">Family Event</option>
                <option value="Medical">Medical</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Duration Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                Duration / Dates
              </label>
              <input
                type="text"
                placeholder="e.g. 1 Day (12 Jul) or 3 Days (12-14 Jul)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                disabled={submitting}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            {/* Reason Textarea */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                Reason Details
              </label>
              <textarea
                rows={3}
                placeholder="Describe details for the class teacher's approval..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={submitting}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                required
              />
            </div>

            {/* Feedback Messages */}
            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                <i className="fi fi-rr-exclamation"></i> {formError}
              </div>
            )}
            {formSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                <i className="fi fi-rr-check-circle"></i> {formSuccess}
              </div>
            )}

            {/* Submit Button (Transitions only, no scale transforms to avoid hover issue) */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 border border-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 hover:border-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-600 transition-colors duration-250 cursor-pointer"
            >
              {submitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <i className="fi fi-rr-paper-plane text-xs"></i> Submit Request
                </>
              )}
            </button>

          </form>
        </div>

      </div>
    </PortalLayout>
  );
}
