"use client";

import React, { useEffect, useState, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import { useParentChildren, getApiBase } from "@/lib/useParentChildren";
import Swal from "sweetalert2";

interface PTAMeeting {
  id: string;
  title: string;
  description: string | null;
  meetingDate: string;
  venue: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  agenda: string[];
  createdAt: string;
}

interface Notification {
  id: string;
  title?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function ParentPtaManagementPage() {
  const { data: session } = useSession();
  const { parentId, schoolId: sessionSchoolId, children, activeChild, setActiveChild, childrenLoading } = useParentChildren();
  const schoolId = activeChild?.schoolId || sessionSchoolId || (session?.user as any)?.schoolId as string | undefined;

  // UI state
  const [activeView, setActiveView] = useState<"Upcoming" | "Completed" | "All">("Upcoming");
  const [meetings, setMeetings] = useState<PTAMeeting[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [meetingsPage, setMeetingsPage] = useState(1);
  const pageSize = 6;
  const [rsvpStatus, setRsvpStatus] = useState<Record<string, "Accept" | "Decline" | "Tentative">>({});

  // Fetch PTA meetings and notifications
  const fetchData = useCallback(async () => {
    if (!schoolId) return;
    setLoadingLists(true);
    const apiUrl = getApiBase();
    try {
      const meetingRes = await fetch(`${apiUrl}/api/parent/pta-meetings?schoolId=${schoolId}`);
      const meetingJson = await meetingRes.json();
      if (meetingJson.success && meetingJson.data) {
        setMeetings(meetingJson.data);
        if (parentId) {
          const rsvps: Record<string, "Accept" | "Decline" | "Tentative"> = {};
          meetingJson.data.forEach((m: any) => {
            if (m.rsvps && m.rsvps[parentId]) {
              const val = m.rsvps[parentId];
              rsvps[m.id] = (typeof val === "object" && val) ? val.status : val;
            }
          });
          setRsvpStatus(rsvps);
        }
      }

      if (parentId) {
        const notifRes = await fetch(`${apiUrl}/api/parent/${parentId}/notifications`);
        const notifJson = await notifRes.json();
        if (notifJson.success && notifJson.data) {
          const filtered = notifJson.data.filter((n: Notification) =>
            n.message.toLowerCase().includes("pta") ||
            n.message.toLowerCase().includes("meeting")
          );
          setNotifications(filtered);
        }
      }
    } catch (error) {
      console.error("Failed to fetch PTA data:", error);
    } finally {
      setLoadingLists(false);
    }
  }, [schoolId, parentId]);

  useEffect(() => {
    if (!childrenLoading) fetchData();
  }, [childrenLoading, fetchData]);

  useEffect(() => {
    setMeetingsPage(1);
  }, [activeView, searchQuery]);

  // Attendance confirmation handler
  const handleRsvp = async (meetingId: string, status: "Accept" | "Decline") => {
    if (!parentId) return;
    const apiUrl = getApiBase();

    let reason: string | null = null;
    if (status === "Decline") {
      const { value: inputReason, isConfirmed } = await Swal.fire({
        title: "Why can you not attend?",
        input: "text",
        inputLabel: "Please provide a brief reason",
        inputPlaceholder: "e.g. Out of town, work conflict...",
        showCancelButton: true,
        confirmButtonText: "Submit",
        confirmButtonColor: "#ef4444",
        inputValidator: (value) => {
          if (!value) return "Please write a brief reason!";
        }
      });
      if (!isConfirmed) return;
      reason = inputReason || null;
    }

    try {
      const res = await fetch(`${apiUrl}/api/headmaster/pta-meetings/${meetingId}/rsvp`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId, rsvpStatus: status, reason })
      });
      const json = await res.json();
      if (json.success) {
        setRsvpStatus(prev => ({ ...prev, [meetingId]: status }));
        Swal.fire({
          icon: "success",
          title: status === "Accept" ? "✅ Attendance Confirmed!" : "Response Recorded",
          text: status === "Accept"
            ? "You have confirmed you will attend this meeting."
            : "You have marked that you cannot attend this meeting.",
          timer: 1800,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error("Failed to submit attendance:", error);
    }
  };

  const fmtDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    } catch { return d; }
  };

  const fmtTime = (d: string) => {
    try {
      return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch { return d; }
  };

  // KPIs
  const upcomingCount = meetings.filter(m => m.status === "Upcoming").length;
  const completedCount = meetings.filter(m => m.status === "Completed").length;
  const attendingCount = Object.values(rsvpStatus).filter(v => v === "Accept").length;

  // Filter
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredMeetings = meetings.filter(m => {
    const matchesView = activeView === "All" || m.status === activeView;
    const matchesSearch = !trimmedQuery ||
      m.title.toLowerCase().includes(trimmedQuery) ||
      (m.description && m.description.toLowerCase().includes(trimmedQuery)) ||
      m.venue.toLowerCase().includes(trimmedQuery);
    return matchesView && matchesSearch;
  });

  const totalPages = Math.ceil(filteredMeetings.length / pageSize) || 1;
  const paginatedMeetings = filteredMeetings.slice((meetingsPage - 1) * pageSize, meetingsPage * pageSize);

  return (
    <PortalLayout
      title="Parent Portal"
      subtitle="Parent-Teacher Association (PTA) Meetings"
      avatarLetter="P"
      avatarColor="#10b981"
      themeClass="theme-parent"
      accentColor="#10b981"
    >
      {/* Child Switcher */}
      {children.length > 1 && (
        <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-2xl flex-wrap">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5">
            <i className="fi fi-rr-user text-emerald-500 text-sm"></i> Active Student:
          </span>
          {children.map(c => (
            <button
              key={c.studentId}
              onClick={() => setActiveChild(c)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border flex items-center gap-1.5 ${
                activeChild?.studentId === c.studentId
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-sm"
                  : "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-850 text-slate-655 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80"
              }`}
            >
              {c.name.split(" ")[0]} · Class {c.class}{c.section}
            </button>
          ))}
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-4 mb-6 fade-in">
        {[
          { label: "Upcoming Meetings", value: upcomingCount, icon: "fi fi-rr-calendar", color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Completed Meetings", value: completedCount, icon: "fi fi-rr-check-circle", color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "Meetings I'm Attending", value: attendingCount, icon: "fi fi-rr-user-check", color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
        ].map((k, idx) => (
          <div key={idx} className="kpi-card text-left transition-colors duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${k.bg} ${k.color}`}>
                <i className={`${k.icon} text-lg`}></i>
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${k.color}`}>PTA</span>
            </div>
            {loadingLists ? (
              <div className="h-8 w-16 bg-slate-700 rounded animate-pulse mb-1.5" />
            ) : (
              <div className={`text-3xl font-black ${k.color} mb-1`}>{k.value}</div>
            )}
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Recent PTA Notifications */}
      {notifications.length > 0 && (
        <div className="mb-6 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex flex-col gap-2">
          <span className="text-[11px] font-black uppercase text-emerald-500 tracking-wider flex items-center gap-1.5">
            <i className="fi fi-rr-bell text-sm"></i> Recent PTA Notifications
          </span>
          {notifications.slice(0, 3).map(n => (
            <div key={n.id} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
              <i className="fi fi-rr-calendar text-emerald-500 mt-0.5 shrink-0"></i>
              <span>{n.title ? <strong>{n.title}: </strong> : null}{n.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Panel */}
      <div className="bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-6">
        {/* Header + Search + Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
              <i className="fi fi-rr-users text-lg"></i>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">PTA Meetings</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">School-wide parent-teacher meetings scheduled by your school.</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-52">
            <i className="fi fi-rr-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl text-xs text-slate-750 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-5">
          {(["Upcoming", "Completed", "All"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveView(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                activeView === tab
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
              }`}
            >
              {tab === "Upcoming" ? "📅 Upcoming" : tab === "Completed" ? "✅ Completed" : "📋 All Meetings"}
            </button>
          ))}
          <span className="ml-auto text-[10px] font-bold text-slate-400">{filteredMeetings.length} meeting{filteredMeetings.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Meetings List */}
        {loadingLists ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-36 bg-slate-800/40 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="w-14 h-14 mx-auto bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mb-4">
              <i className="fi fi-rr-calendar text-2xl"></i>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">No meetings found</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {activeView === "Upcoming" ? "No upcoming PTA meetings scheduled yet." : "No meetings match your search."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedMeetings.map(m => {
              const myStatus = rsvpStatus[m.id];
              const isUpcoming = m.status === "Upcoming";
              return (
                <div
                  key={m.id}
                  className={`p-5 rounded-2xl border transition-all duration-300 ${
                    isUpcoming
                      ? "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-emerald-300 dark:hover:border-emerald-800"
                      : "border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-900/20 opacity-80"
                  }`}
                >
                  {/* Meeting Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${
                          m.status === "Upcoming"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/25"
                            : m.status === "Completed"
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/25"
                            : "bg-slate-500/10 text-slate-500 border-slate-500/25"
                        }`}>
                          {m.status}
                        </span>
                        {myStatus === "Accept" && (
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border bg-emerald-500/10 text-emerald-600 border-emerald-500/25">
                            ✅ You are attending
                          </span>
                        )}
                        {myStatus === "Decline" && (
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border bg-rose-500/10 text-rose-500 border-rose-500/25">
                            ❌ Cannot attend
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white">{m.title}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{fmtDate(m.meetingDate)}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 justify-end">
                        <i className="fi fi-rr-clock"></i> {fmtTime(m.meetingDate)}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 justify-end">
                        <i className="fi fi-rr-marker"></i> {m.venue}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {m.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">{m.description}</p>
                  )}

                  {/* Agenda */}
                  {m.agenda.length > 0 && (
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">📋 Agenda</span>
                      <ul className="space-y-1">
                        {m.agenda.map((item, i) => (
                          <li key={i} className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
                            <span className="text-emerald-500 font-bold shrink-0">{i + 1}.</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Attendance Confirmation — only for Upcoming */}
                  {isUpcoming && (
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap gap-2 items-center">
                      <span className="text-[11px] font-semibold text-slate-500">Will you attend this meeting?</span>
                      <button
                        onClick={() => handleRsvp(m.id, "Accept")}
                        className={`px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-200 border cursor-pointer ${
                          myStatus === "Accept"
                            ? "bg-emerald-600 border-emerald-500 text-white shadow-sm"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-900/20"
                        }`}
                      >
                        ✅ Yes, I will attend
                      </button>
                      <button
                        onClick={() => handleRsvp(m.id, "Decline")}
                        className={`px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-200 border cursor-pointer ${
                          myStatus === "Decline"
                            ? "bg-rose-600 border-rose-500 text-white shadow-sm"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:border-rose-300 dark:hover:bg-rose-900/20"
                        }`}
                      >
                        ❌ No, I cannot attend
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setMeetingsPage(p => Math.max(p - 1, 1))}
              disabled={meetingsPage === 1}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <i className="fi fi-rr-angle-left"></i>
            </button>
            <span className="text-xs font-bold text-slate-500 px-3">Page {meetingsPage} of {totalPages}</span>
            <button
              onClick={() => setMeetingsPage(p => Math.min(p + 1, totalPages))}
              disabled={meetingsPage === totalPages}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <i className="fi fi-rr-angle-right"></i>
            </button>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
