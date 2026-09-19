"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
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
  studentClass?: string | null;
  studentSection?: string | null;
  className?: string | null;
  sectionName?: string | null;
}

interface ClassRoom {
  id?: string;
  className: string;
  section: string;
}

export default function HeadmasterLeavePage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const schoolId: string = (session?.user as any)?.schoolId || "";

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tabs & Search State
  const [activeTab, setActiveTab] = useState<"Pending" | "History">("Pending");
  const [activeRoleTab, setActiveRoleTab] = useState<"Student" | "Teacher">("Student");
  const [searchTerm, setSearchTerm] = useState("");

  // Class & Section Filters
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedSection, setSelectedSection] = useState<string>("ALL");

  // View Mode: "grouped" (separately shown per Class & Section) or "table" (list view)
  const [viewMode, setViewMode] = useState<"grouped" | "table">("grouped");

  const fetchData = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const [leaveRes, classRes] = await Promise.all([
        fetch(`${API_BASE}/api/teacher/leave?schoolId=${schoolId}`),
        fetch(`${API_BASE}/api/classes?schoolId=${schoolId}`)
      ]);

      const leaveJson = await leaveRes.json();
      if (leaveJson.success) {
        setRequests(leaveJson.data || []);
      }

      const classJson = await classRes.json();
      if (classJson.success && Array.isArray(classJson.data)) {
        setClassRooms(classJson.data);
      }
    } catch (err) {
      console.error("Error fetching leave requests / classes", err);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Extract available unique Class options
  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();
    // From school classRooms list
    classRooms.forEach(cr => {
      if (cr.className) classSet.add(cr.className.trim());
    });
    // From fetched student leave requests
    requests.forEach(req => {
      if (req.studentId) {
        const c = req.studentClass || req.className;
        if (c) classSet.add(c.trim());
      }
    });
    return Array.from(classSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [classRooms, requests]);

  // Extract available unique Section options for selected class (or all)
  const availableSections = useMemo(() => {
    const sectionSet = new Set<string>();
    classRooms.forEach(cr => {
      if (selectedClass === "ALL" || cr.className.trim() === selectedClass) {
        if (cr.section) sectionSet.add(cr.section.trim());
      }
    });
    requests.forEach(req => {
      if (req.studentId) {
        const c = (req.studentClass || req.className || "").trim();
        const s = (req.studentSection || req.sectionName || "").trim();
        if (selectedClass === "ALL" || c === selectedClass) {
          if (s) sectionSet.add(s);
        }
      }
    });
    return Array.from(sectionSet).sort();
  }, [classRooms, requests, selectedClass]);

  const handleAction = async (id: string, status: "Approved" | "Rejected") => {
    const isApproved = status === "Approved";
    
    const result = await Swal.fire({
      title: isApproved 
        ? (lang === "தமிழ்" ? 'விடுப்பை அனுமதிக்கவா?' : 'Approve Leave Request?') 
        : (lang === "தமிழ்" ? 'விடுப்பை நிராகரிக்கவா?' : 'Reject Leave Request?'),
      text: isApproved 
        ? (lang === "தமிழ்" ? "இந்த விடுப்பு கோரிக்கையை அனுமதிக்க உறுதிசெய்கிறீர்களா?" : "Are you sure you want to approve this leave request?")
        : (lang === "தமிழ்" ? "இந்த விடுப்பு கோரிக்கையை நிராகரிக்க உறுதிசெய்கிறீர்களா?" : "Are you sure you want to reject this leave request?"),
      icon: isApproved ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: isApproved ? '#10b981' : '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: isApproved 
        ? (lang === "தமிழ்" ? 'ஆம், அனுமதி' : 'Yes, Approve')
        : (lang === "தமிழ்" ? 'ஆம், நிராகரி' : 'Yes, Reject'),
      cancelButtonText: lang === "தமிழ்" ? 'ரத்து' : 'Cancel',
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
          title: lang === "தமிழ்" ? 'வெற்றி!' : 'Success!',
          text: lang === "தமிழ்" ? `விடுப்பு நிலை மாற்றப்பட்டது.` : `Leave request has been ${status.toLowerCase()}.`,
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

  // Filtered requests logic
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesTab = activeTab === "Pending" ? req.status === "Pending" : req.status !== "Pending";
      const isStudent = !!req.studentId;
      const matchesRole = activeRoleTab === "Student" ? isStudent : (!req.studentId && !!req.staffId);

      if (!matchesTab || !matchesRole) return false;

      // Class and Section filters apply to Student leaves
      if (activeRoleTab === "Student") {
        const reqClass = (req.studentClass || req.className || "Unassigned").trim();
        const reqSection = (req.studentSection || req.sectionName || "General").trim();

        if (selectedClass !== "ALL" && reqClass.toLowerCase() !== selectedClass.toLowerCase()) {
          return false;
        }
        if (selectedSection !== "ALL" && reqSection.toLowerCase() !== selectedSection.toLowerCase()) {
          return false;
        }
      }

      const q = searchTerm.toLowerCase().trim();
      if (!q) return true;

      const reqClass = req.studentClass || req.className || "";
      const reqSec = req.studentSection || req.sectionName || "";

      return (
        req.studentName.toLowerCase().includes(q) ||
        req.reason.toLowerCase().includes(q) ||
        req.type.toLowerCase().includes(q) ||
        reqClass.toLowerCase().includes(q) ||
        reqSec.toLowerCase().includes(q)
      );
    });
  }, [requests, activeTab, activeRoleTab, selectedClass, selectedSection, searchTerm]);

  // Grouped requests per Class & Section
  const groupedStudentRequests = useMemo(() => {
    if (activeRoleTab !== "Student") return [];

    const map = new Map<string, { key: string; className: string; sectionName: string; items: LeaveRequest[] }>();

    filteredRequests.forEach((req) => {
      const c = (req.studentClass || req.className || (lang === "தமிழ்" ? "குறிப்பிடப்படாத பிரிவு" : "Unassigned")).trim();
      const s = (req.studentSection || req.sectionName || "-").trim();
      const key = `${c}__${s}`;

      if (!map.has(key)) {
        map.set(key, { key, className: c, sectionName: s, items: [] });
      }
      map.get(key)!.items.push(req);
    });

    const groups = Array.from(map.values());
    groups.sort((a, b) => {
      if (a.className !== b.className) {
        return a.className.localeCompare(b.className, undefined, { numeric: true });
      }
      return a.sectionName.localeCompare(b.sectionName);
    });

    return groups;
  }, [filteredRequests, activeRoleTab, lang]);

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "விடுபு மேலாண்மை" : "Leave Management"}
      subtitle={lang === "தமிழ்" ? "வகுப்பு மற்றும் பிரிவு வாரியாக மாணவர்களின் விடுமுறை கோரிக்கைகளை நிர்வகிக்கவும்" : "Review and approve student & staff leave requests grouped separately by class and section"}
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
          .leave-portal-container .custom-tab-btn.active-view {
            background: #0284c7;
            color: #ffffff;
          }
          .leave-portal-container .custom-select {
            background: #ffffff;
            border: 1px solid #cbd5e1;
            color: #0f172a;
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
            border-bottom: 1px solid #e2e8f0;
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
          .leave-portal-container .group-header {
            background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
            border-bottom: 1px solid #dbeafe;
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
            background: rgba(59, 130, 246, 0.15);
            color: #60a5fa;
            border: 1px solid rgba(59, 130, 246, 0.3);
          }
          .dark .leave-portal-container .custom-tab-btn.active-view {
            background: rgba(14, 165, 233, 0.2);
            color: #38bdf8;
            border: 1px solid rgba(14, 165, 233, 0.3);
          }
          .dark .leave-portal-container .custom-select {
            background: rgba(2, 6, 23, 0.6);
            border: 1px solid rgba(51, 65, 85, 0.6);
            color: #ffffff;
          }
          .dark .leave-portal-container .custom-search {
            background: rgba(2, 6, 23, 0.6);
            border: 1px solid rgba(51, 65, 85, 0.6);
            color: #ffffff;
          }
          .dark .leave-portal-container .custom-table-header {
            background: rgba(2, 6, 23, 0.3);
            border-bottom: 1px solid rgba(51, 65, 85, 0.6);
            color: #64748b;
          }
          .dark .leave-portal-container .custom-table-row {
            border-bottom: 1px solid rgba(51, 65, 85, 0.4);
            color: #cbd5e1;
          }
          .dark .leave-portal-container .custom-table-row:hover {
            background: rgba(30, 41, 59, 0.3);
          }
          .dark .leave-portal-container .custom-text-name {
            color: #ffffff;
          }
          .dark .leave-portal-container .custom-text-muted {
            color: #94a3b8;
          }
          .dark .leave-portal-container .group-header {
            background: rgba(30, 41, 59, 0.4);
            border-bottom: 1px solid rgba(51, 65, 85, 0.6);
          }
        `}} />

        {/* Action & Filter Bar */}
        <div className="flex flex-col gap-4 custom-card p-4 sm:p-5 rounded-2xl shadow-sm">
          {/* Top Bar: Tabs & Search */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto overflow-x-auto">
              {/* Role Tabs */}
              <div className="flex p-1 custom-tab-container rounded-xl">
                <button
                  onClick={() => {
                    setActiveRoleTab("Student");
                  }}
                  className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap custom-tab-btn ${
                    activeRoleTab === "Student" ? "active-student" : ""
                  }`}
                >
                  <i className="fi fi-rr-student mr-2 text-xs" />
                  {lang === "தமிழ்" ? "மாணவர் விடுபுகள்" : "Student Leaves"}
                </button>
                <button
                  onClick={() => {
                    setActiveRoleTab("Teacher");
                  }}
                  className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap custom-tab-btn ${
                    activeRoleTab === "Teacher" ? "active-teacher" : ""
                  }`}
                >
                  <i className="fi fi-rr-chalkboard-teacher mr-2 text-xs" />
                  {lang === "தமிழ்" ? "ஆசிரியர் விடுபுகள்" : "Teacher Leaves"}
                </button>
              </div>

              {/* Status Tabs */}
              <div className="flex p-1 custom-tab-container rounded-xl">
                <button
                  onClick={() => setActiveTab("Pending")}
                  className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap custom-tab-btn ${
                    activeTab === "Pending" ? "active-status" : ""
                  }`}
                >
                  <i className="fi fi-rr-clock mr-1.5 text-xs text-amber-500" />
                  {lang === "தமிழ்" ? "நிலுவையில் உள்ளவை" : "Pending"}
                </button>
                <button
                  onClick={() => setActiveTab("History")}
                  className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap custom-tab-btn ${
                    activeTab === "History" ? "active-status" : ""
                  }`}
                >
                  <i className="fi fi-rr-time-past mr-1.5 text-xs text-blue-500" />
                  {lang === "தமிழ்" ? "வரலாறு" : "History"}
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <i className="fi fi-rr-search absolute left-3.5 top-1/2 -translate-y-1/2 text-xs custom-text-muted" />
              <input
                type="text"
                placeholder={lang === "தமிழ்" ? "பெயர், பிரிவு அல்லது காரணத்தால் தேட..." : "Search by name, class or reason..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs custom-search focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Class & Section Filter Controls (Visible when Student Leaves tab is active) */}
          {activeRoleTab === "Student" && (
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800/80">
              <div className="flex flex-wrap items-center gap-3">
                {/* Class Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold custom-text-muted flex items-center gap-1">
                    <i className="fi fi-rr-school text-blue-500" />
                    {lang === "தமிழ்" ? "வகுப்பு:" : "Class:"}
                  </span>
                  <select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setSelectedSection("ALL");
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold custom-select focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="ALL">
                      {lang === "தமிழ்" ? "அனைத்து வகுப்புகளும்" : "All Classes"}
                    </option>
                    {availableClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        {lang === "தமிழ்" ? `வகுப்பு ${cls}` : `Class ${cls}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold custom-text-muted flex items-center gap-1">
                    <i className="fi fi-rr-users-alt text-indigo-500" />
                    {lang === "தமிழ்" ? "பிரிவு:" : "Section:"}
                  </span>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold custom-select focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="ALL">
                      {lang === "தமிழ்" ? "அனைத்து பிரிவுகளும்" : "All Sections"}
                    </option>
                    {availableSections.map((sec) => (
                      <option key={sec} value={sec}>
                        {lang === "தமிழ்" ? `பிரிவு ${sec}` : `Section ${sec}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reset Filters */}
                {(selectedClass !== "ALL" || selectedSection !== "ALL" || searchTerm) && (
                  <button
                    onClick={() => {
                      setSelectedClass("ALL");
                      setSelectedSection("ALL");
                      setSearchTerm("");
                    }}
                    className="px-2.5 py-1 text-xs font-semibold text-red-500 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <i className="fi fi-rr-cross-small" />
                    {lang === "தமிழ்" ? "வடிகட்டியை நீக்கு" : "Clear Filters"}
                  </button>
                )}
              </div>

              {/* View Mode Toggle: Grouped vs Table */}
              <div className="flex p-1 custom-tab-container rounded-xl self-start sm:self-auto">
                <button
                  onClick={() => setViewMode("grouped")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 custom-tab-btn ${
                    viewMode === "grouped" ? "active-view" : ""
                  }`}
                  title="Show students grouped separately by Class and Section"
                >
                  <i className="fi fi-rr-apps text-xs" />
                  {lang === "தமிழ்" ? "வகுப்பு வாரியாக" : "Class & Section View"}
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 custom-tab-btn ${
                    viewMode === "table" ? "active-view" : ""
                  }`}
                  title="Show all requests in flat table format"
                >
                  <i className="fi fi-rr-list text-xs" />
                  {lang === "தமிழ்" ? "பட்டியல் பார்வை" : "Flat List"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content Container */}
        {loading ? (
          <div className="custom-card rounded-2xl p-12 text-center text-xs sm:text-sm custom-text-muted animate-pulse">
            <i className="fi fi-rr-spinner text-2xl text-blue-500 animate-spin mb-2 block" />
            {lang === "தமிழ்" ? "தரவுகள் ஏற்றப்படுகின்றன..." : "Loading leave requests..."}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="custom-card rounded-2xl p-12 text-center text-xs sm:text-sm custom-text-muted">
            <i className="fi fi-rr-calendar-minus text-3xl text-slate-400 mb-3 block" />
            {lang === "தமிழ்" ? "விடுமுறை கோரிக்கைகள் எதுவும் கிடைக்கவில்லை." : `No ${activeTab.toLowerCase()} requests found.`}
          </div>
        ) : activeRoleTab === "Student" && viewMode === "grouped" ? (
          /* ========================================================================= */
          /* GROUPED VIEW: Separate section cards for EACH Class & Section */
          /* ========================================================================= */
          <div className="flex flex-col gap-6 w-full">
            {groupedStudentRequests.map((group) => (
              <div key={group.key} className="custom-card rounded-2xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800">
                {/* Class & Section Header */}
                <div className="p-4 group-header flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center font-black text-sm">
                      <i className="fi fi-rr-school" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold custom-text-name flex items-center gap-2">
                        {lang === "தமிழ்" ? `வகுப்பு ${group.className} - பிரிவு ${group.sectionName}` : `Class ${group.className} - Section ${group.sectionName}`}
                      </h3>
                      <p className="text-[10px] sm:text-xs custom-text-muted">
                        {group.items.length} {group.items.length === 1 ? 'student leave request' : 'student leave requests'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-xs font-bold px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/20">
                      {group.className !== "Unassigned" ? `Class ${group.className}` : "General"}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-500/20">
                      {group.sectionName !== "-" ? `Sec ${group.sectionName}` : "Sec -"}
                    </span>
                  </div>
                </div>

                {/* Group Table */}
                <div className="p-0 overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="custom-table-header text-[10px] uppercase tracking-wider">
                        <th className="px-4 py-3">Student Name</th>
                        <th className="px-4 py-3">Leave Type</th>
                        <th className="px-4 py-3">Duration</th>
                        <th className="px-4 py-3">Reason</th>
                        <th className="px-4 py-3">Status</th>
                        {activeTab === "Pending" && <th className="px-4 py-3 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((req) => (
                        <tr key={req.id} className="custom-table-row text-[11px] sm:text-xs transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold custom-text-name text-xs sm:text-sm flex items-center gap-2">
                              {req.studentName}
                            </div>
                            <div className="text-[10px] text-blue-500 font-semibold mt-0.5">
                              {req.studentClass ? `Class ${req.studentClass} (Sec ${req.studentSection || 'A'})` : 'Student'}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold">{req.type}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <i className="fi fi-rr-calendar text-xs custom-text-muted" />
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
                                  ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20"
                                  : req.status === "Rejected"
                                  ? "bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20"
                                  : "bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20"
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
                                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1"
                                >
                                  <i className="fi fi-rr-check" />
                                  {lang === "தமிழ்" ? "அனுமதி" : "Approve"}
                                </button>
                                <button
                                  onClick={() => handleAction(req.id, "Rejected")}
                                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] sm:text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1"
                                >
                                  <i className="fi fi-rr-cross" />
                                  {lang === "தமிழ்" ? "நிராகரி" : "Reject"}
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ========================================================================= */
          /* FLAT TABLE VIEW (For Teachers or when List View is toggled) */
          /* ========================================================================= */
          <div className="custom-card rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between custom-table-header">
              <h2 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <i className="fi fi-rr-document-signed text-base text-blue-500" />
                {activeTab} {activeRoleTab} Requests
              </h2>
              <div className="text-[10px] sm:text-xs font-bold px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/20">
                {filteredRequests.length} Total
              </div>
            </div>

            <div className="p-0 overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="custom-table-header text-[10px] uppercase tracking-wider">
                    <th className="px-4 py-3">Name / Role</th>
                    {activeRoleTab === "Student" && <th className="px-4 py-3">Class & Section</th>}
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
                      {activeRoleTab === "Student" && (
                        <td className="px-4 py-3 font-semibold">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            Class {req.studentClass || req.className || '-'} ({req.studentSection || req.sectionName || '-'})
                          </span>
                        </td>
                      )}
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
                              ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20"
                              : req.status === "Rejected"
                              ? "bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20"
                              : "bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20"
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
                              className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1"
                            >
                              <i className="fi fi-rr-check" />
                              {lang === "தமிழ்" ? "அனுமதி" : "Approve"}
                            </button>
                            <button
                              onClick={() => handleAction(req.id, "Rejected")}
                              className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] sm:text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1"
                            >
                              <i className="fi fi-rr-cross" />
                              {lang === "தமிழ்" ? "நிராகரி" : "Reject"}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
