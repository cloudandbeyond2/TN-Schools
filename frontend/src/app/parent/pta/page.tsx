"use client";

import React, { useEffect, useState, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import ParentPortalBanner from "@/components/ParentPortalBanner";
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

// A meeting is "expired" when its date is past but HM hasn't confirmed Completed yet
const isExpiredMeeting = (m: PTAMeeting): boolean =>
  m.status === "Upcoming" && new Date(m.meetingDate) < new Date();

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

  const [activeView, setActiveView] = useState<"Upcoming" | "Completed" | "All">("All");
  const [meetings, setMeetings] = useState<PTAMeeting[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [meetingsPage, setMeetingsPage] = useState(1);
  const pageSize = 5;
  const [rsvpStatus, setRsvpStatus] = useState<Record<string, "Accept" | "Decline" | "Tentative">>({});

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

  const fmtShortDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch { return d; }
  };

  // KPIs — expired meetings still count as upcoming for display
  const upcomingCount = meetings.filter(m => m.status === "Upcoming" && !isExpiredMeeting(m)).length;
  const completedCount = meetings.filter(m => m.status === "Completed").length;
  const expiredCount = meetings.filter(isExpiredMeeting).length;
  const attendingCount = Object.values(rsvpStatus).filter(v => v === "Accept").length;

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

  const tabs = [
    { key: "All" as const, label: "All Meetings", icon: "fi fi-rr-apps", count: meetings.length },
    { key: "Upcoming" as const, label: "Upcoming", icon: "fi fi-rr-calendar", count: upcomingCount },
    { key: "Completed" as const, label: "Completed", icon: "fi fi-rr-badge-check", count: completedCount },
  ];

  return (
    <PortalLayout
      title="Parent Portal"
      subtitle="Parent-Teacher Association (PTA) Meetings"
      avatarLetter="P"
      avatarColor="#10b981"
      themeClass="theme-parent"
      accentColor="#10b981"
    >
      <style>{`
        .pta-glow { box-shadow: 0 0 0 1px rgba(16,185,129,0.15), 0 4px 24px rgba(16,185,129,0.08); }
        .pta-card-upcoming { border-left: 3px solid #10b981; }
        .pta-card-completed { border-left: 3px solid #3b82f6; }
        .pta-card-cancelled { border-left: 3px solid #6b7280; }
        .pta-tab-active { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #fff; box-shadow: 0 4px 12px rgba(16,185,129,0.35); }
        .pta-tab-inactive { background: transparent; }
        .pta-page-btn { width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;transition:all 0.2s;border:1.5px solid; }
        .pta-page-btn-active { background:linear-gradient(135deg,#059669,#10b981);color:#fff;border-color:#10b981;box-shadow:0 2px 10px rgba(16,185,129,0.35); }
        .pta-page-btn-inactive { background:transparent;color:#64748b;border-color:#e2e8f0; }
        .dark .pta-page-btn-inactive { border-color:#334155;color:#94a3b8; }
        .pta-page-btn-inactive:hover:not(:disabled) { border-color:#10b981;color:#10b981; }
        .pta-completed-strip { background: linear-gradient(90deg,rgba(59,130,246,0.08) 0%,transparent 100%); }
        .pta-receipt { background:linear-gradient(135deg,rgba(16,185,129,0.06) 0%,rgba(59,130,246,0.06) 100%);border:1px dashed rgba(16,185,129,0.3);border-radius:14px; }
        .fade-slide-in { animation: fadeslide 0.4s ease both; }
        @keyframes fadeslide { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        .kpi-shine { position:relative;overflow:hidden; }
        .kpi-shine::after { content:'';position:absolute;top:-50%;left:-60%;width:40%;height:200%;background:linear-gradient(120deg,transparent,rgba(255,255,255,0.06),transparent);transform:skewX(-20deg);animation:shine 3s ease infinite; }
        @keyframes shine { 0%{left:-60%} 100%{left:140%} }
        .agenda-dot { width:6px;height:6px;border-radius:50%;background:#10b981;flex-shrink:0;margin-top:5px; }
        .completed-check-ring { width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#06b6d4);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(59,130,246,0.35); }
      `}</style>

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
                  : "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              }`}
            >
              {c.name.split(" ")[0]} · Class {c.class}{c.section}
            </button>
          ))}
        </div>
      )}

      <ParentPortalBanner pageKey="pta" />

      {/* ─── KPI Row ─── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Upcoming", value: upcomingCount, icon: "fi fi-rr-calendar-clock",
            gradient: "from-emerald-500 to-teal-400", shadow: "rgba(16,185,129,0.3)",
            bg: "bg-emerald-500/8 dark:bg-emerald-500/10", border: "border-emerald-500/20",
          },
          {
            label: "Completed", value: completedCount, icon: "fi fi-rr-badge-check",
            gradient: "from-blue-500 to-cyan-400", shadow: "rgba(59,130,246,0.3)",
            bg: "bg-blue-500/8 dark:bg-blue-500/10", border: "border-blue-500/20",
          },
          {
            label: "I'm Attending", value: attendingCount, icon: "fi fi-rr-user-check",
            gradient: "from-violet-500 to-purple-400", shadow: "rgba(139,92,246,0.3)",
            bg: "bg-violet-500/8 dark:bg-violet-500/10", border: "border-violet-500/20",
          },
        ].map((k, idx) => (
          <div key={idx} className={`kpi-shine relative p-5 rounded-2xl border ${k.border} ${k.bg} transition-all duration-300`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${k.gradient} flex items-center justify-center`}
                style={{ boxShadow: `0 4px 14px ${k.shadow}` }}>
                <i className={`${k.icon} text-white text-base`}></i>
              </div>
              <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 mt-1">PTA</span>
            </div>
            {loadingLists ? (
              <div className="h-9 w-14 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse mb-1" />
            ) : (
              <div className={`text-4xl font-black bg-gradient-to-br ${k.gradient} bg-clip-text text-transparent leading-tight`}>{k.value}</div>
            )}
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">{k.label} Meetings</div>
          </div>
        ))}
      </div>

      {/* Expired meetings alert banner */}
      {expiredCount > 0 && (
        <div className="mb-5 p-4 bg-amber-500/8 border border-amber-500/25 rounded-2xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0 mt-0.5">
            <i className="fi fi-rr-time-past text-amber-500 text-sm"></i>
          </div>
          <div>
            <p className="text-xs font-black text-amber-600 dark:text-amber-400">
              {expiredCount} meeting{expiredCount > 1 ? "s have" : " has"} passed without a status update
            </p>
            <p className="text-[11px] text-amber-500/80 mt-0.5">
              Your school's headmaster will confirm these as Completed soon. They will then move to your Completed tab.
            </p>
          </div>
        </div>
      )}

      {/* ─── PTA Notifications ─── */}
      {notifications.length > 0 && (
        <div className="mb-5 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-2">
          <span className="text-[11px] font-black uppercase text-emerald-500 tracking-wider flex items-center gap-2">
            <i className="fi fi-rr-bell-ring text-sm"></i> Recent PTA Notifications
          </span>
          {notifications.slice(0, 3).map(n => (
            <div key={n.id} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
              <i className="fi fi-rr-calendar text-emerald-500 mt-0.5 shrink-0"></i>
              <span>{n.title ? <strong>{n.title}: </strong> : null}{n.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* ─── Main Panel ─── */}
      <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800/80 overflow-hidden">

        {/* Panel Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center"
                style={{ boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}>
                <i className="fi fi-rr-users text-white text-base"></i>
              </div>
              <div>
                <h2 className="text-base font-black text-slate-800 dark:text-white">PTA Meetings</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">School-wide parent-teacher meetings scheduled by your school.</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-56">
              <i className="fi fi-rr-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
              <input
                type="text"
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <i className="fi fi-rr-cross-small text-sm"></i>
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                  activeView === tab.key
                    ? "pta-tab-active border-transparent"
                    : "pta-tab-inactive border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600"
                }`}
              >
                <i className={`${tab.icon} text-xs`}></i>
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                  activeView === tab.key ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
            <span className="ml-auto text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <i className="fi fi-rr-list text-xs"></i>
              {filteredMeetings.length} result{filteredMeetings.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Meetings List */}
        <div className="p-6">
          {loadingLists ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800/40 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="w-16 h-16 mx-auto bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-700 mb-4">
                <i className="fi fi-rr-calendar text-3xl"></i>
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-black text-sm">No meetings found</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 max-w-xs mx-auto">
                {activeView === "Upcoming"
                  ? "No upcoming PTA meetings have been scheduled by your school yet."
                  : activeView === "Completed"
                  ? "No meetings have been marked as completed yet."
                  : "No meetings match your search query."}
              </p>
            </div>
          ) : (
            <div className="space-y-4 fade-slide-in">
              {paginatedMeetings.map((m, idx) => {
                const myStatus = rsvpStatus[m.id];
                const isUpcoming = m.status === "Upcoming" && !isExpiredMeeting(m);
                const expired = isExpiredMeeting(m);
                const isCompleted = m.status === "Completed";
                const didAttend = isCompleted && myStatus === "Accept";

                return (
                  <div
                    key={m.id}
                    style={{ animationDelay: `${idx * 60}ms` }}
                    className={`fade-slide-in rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isUpcoming
                        ? "pta-card-upcoming border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:shadow-md dark:hover:shadow-slate-900/50"
                        : expired
                        ? "border-l-[3px] border-amber-400 border-y-amber-200/50 border-r-amber-200/50 dark:border-y-slate-800/50 dark:border-r-slate-800/50 bg-amber-50/50 dark:bg-amber-900/10"
                        : isCompleted
                        ? "pta-card-completed border-slate-100 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-900/20"
                        : "pta-card-cancelled border-slate-100 dark:border-slate-800/40 bg-slate-50/30 dark:bg-slate-900/10 opacity-60"
                    }`}
                  >
                    {/* Expired: warning bar */}
                    {expired && (
                      <div className="px-5 py-2 bg-amber-400/10 border-b border-amber-400/20 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <i className="fi fi-rr-time-past text-amber-500 text-sm"></i>
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Meeting Date Passed</span>
                        </div>
                        <span className="text-[9px] font-bold text-amber-500/80 italic">Awaiting HM confirmation</span>
                      </div>
                    )}

                    {/* Completed: summary bar */}
                    {isCompleted && (
                      <div className="pta-completed-strip px-5 py-2.5 flex items-center justify-between gap-3 border-b border-blue-500/10">
                        <div className="flex items-center gap-2">
                          <i className="fi fi-rr-badge-check text-blue-500 text-sm"></i>
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-500">Meeting Completed</span>
                        </div>
                        {didAttend && (
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <i className="fi fi-rr-user-check"></i> You attended
                          </span>
                        )}
                        {myStatus === "Decline" && (
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <i className="fi fi-rr-cross-small"></i> You did not attend
                          </span>
                        )}
                      </div>
                    )}

                    <div className="p-5">
                      {/* Meeting Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          {/* Status badge + RSVP badge */}
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg border ${
                              expired
                                ? "bg-amber-100 text-amber-700 dark:text-amber-400 border-amber-300/60"
                                : m.status === "Upcoming"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : m.status === "Completed"
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                            }`}>
                              {expired ? "⏰ Expired" : m.status === "Upcoming" ? "📅 Upcoming" : m.status === "Completed" ? "✅ Completed" : "🚫 Cancelled"}
                            </span>
                            {isUpcoming && myStatus === "Accept" && (
                              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                ✓ Attending
                              </span>
                            )}
                            {isUpcoming && myStatus === "Decline" && (
                              <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg border bg-rose-500/10 text-rose-500 border-rose-500/25">
                                ✕ Cannot Attend
                              </span>
                            )}
                          </div>
                          <h3 className={`text-sm font-black ${isCompleted ? "text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-white"}`}>
                            {m.title}
                          </h3>
                        </div>

                        {/* Date / time / venue */}
                        <div className={`shrink-0 text-right ${isCompleted ? "opacity-70" : ""}`}>
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{fmtDate(m.meetingDate)}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 justify-end">
                            <i className="fi fi-rr-clock text-xs"></i> {fmtTime(m.meetingDate)}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 justify-end">
                            <i className="fi fi-rr-marker text-xs"></i> {m.venue}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      {m.description && (
                        <p className={`text-xs leading-relaxed mb-3 ${isCompleted ? "text-slate-400 dark:text-slate-500" : "text-slate-600 dark:text-slate-300"}`}>
                          {m.description}
                        </p>
                      )}

                      {/* Agenda */}
                      {m.agenda.length > 0 && (
                        <div className={`pt-3 border-t mb-3 ${isCompleted ? "border-slate-100 dark:border-slate-800/40" : "border-slate-200 dark:border-slate-800"}`}>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                            <i className="fi fi-rr-list text-xs"></i> Agenda
                          </span>
                          <ul className="space-y-1.5">
                            {m.agenda.map((item, i) => (
                              <li key={i} className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
                                <div className={`agenda-dot mt-[5px] ${isCompleted ? "bg-blue-400" : "bg-emerald-500"}`}></div>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* ── Upcoming: RSVP buttons ── */}
                      {isUpcoming && (
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 items-center">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">Will you attend this meeting?</span>
                          <button
                            onClick={() => handleRsvp(m.id, "Accept")}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all duration-200 border cursor-pointer ${
                              myStatus === "Accept"
                                ? "bg-emerald-600 border-emerald-500 text-white shadow-sm"
                                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-900/20 hover:text-emerald-700"
                            }`}
                          >
                            ✅ Yes, I will attend
                          </button>
                          <button
                            onClick={() => handleRsvp(m.id, "Decline")}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all duration-200 border cursor-pointer ${
                              myStatus === "Decline"
                                ? "bg-rose-600 border-rose-500 text-white shadow-sm"
                                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:border-rose-300 dark:hover:bg-rose-900/20 hover:text-rose-600"
                            }`}
                          >
                            ❌ No, I cannot attend
                          </button>
                        </div>
                      )}

                      {/* ── Expired: info note (no RSVP actions) ── */}
                      {expired && (
                        <div className="pt-3 border-t border-amber-200/50 dark:border-amber-800/30">
                          <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-900/15 rounded-xl border border-amber-200/60 dark:border-amber-800/30">
                            <i className="fi fi-rr-info text-amber-500 text-sm shrink-0 mt-0.5"></i>
                            <div>
                              <p className="text-[11px] font-black text-amber-700 dark:text-amber-400">This meeting has passed</p>
                              <p className="text-[10px] text-amber-600/80 dark:text-amber-500/70 mt-0.5">
                                The headmaster will update the status to Completed. It will then appear in your Completed tab.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── Completed: attendance receipt ── */}
                      {isCompleted && myStatus && (
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/40">
                          <div className="pta-receipt p-3.5 flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm ${
                              myStatus === "Accept"
                                ? "bg-emerald-500/20 text-emerald-500"
                                : "bg-slate-400/15 text-slate-400"
                            }`}>
                              <i className={`fi ${myStatus === "Accept" ? "fi-rr-user-check" : "fi-rr-user-minus"}`}></i>
                            </div>
                            <div>
                              <p className={`text-[11px] font-black ${myStatus === "Accept" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                                {myStatus === "Accept" ? "You attended this meeting" : "You did not attend this meeting"}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {myStatus === "Accept"
                                  ? `Your attendance was confirmed on ${fmtShortDate(m.meetingDate)}.`
                                  : "Your response was recorded as 'Cannot attend'."}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Completed: no RSVP yet */}
                      {isCompleted && !myStatus && (
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/40">
                          <p className="text-[11px] text-slate-400 italic flex items-center gap-1.5">
                            <i className="fi fi-rr-info text-xs"></i> No RSVP was recorded for this meeting.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── Pagination ─── */}
          {!loadingLists && filteredMeetings.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
              {/* Results info */}
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                Showing <span className="font-black text-slate-600 dark:text-slate-300">{(meetingsPage - 1) * pageSize + 1}–{Math.min(meetingsPage * pageSize, filteredMeetings.length)}</span> of <span className="font-black text-slate-600 dark:text-slate-300">{filteredMeetings.length}</span> meetings
              </span>

              {/* Page controls */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  {/* Prev */}
                  <button
                    onClick={() => setMeetingsPage(p => Math.max(p - 1, 1))}
                    disabled={meetingsPage === 1}
                    className="pta-page-btn pta-page-btn-inactive disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Previous page"
                  >
                    <i className="fi fi-rr-angle-left text-xs"></i>
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    const isActive = page === meetingsPage;
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - meetingsPage) <= 1;
                    const showEllipsisBefore = page === 2 && meetingsPage > 3;
                    const showEllipsisAfter = page === totalPages - 1 && meetingsPage < totalPages - 2;

                    if (!showPage) {
                      if (showEllipsisBefore || showEllipsisAfter) {
                        return (
                          <span key={`e-${page}`} className="text-slate-400 font-bold text-xs px-1 select-none">···</span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => setMeetingsPage(page)}
                        className={`pta-page-btn ${isActive ? "pta-page-btn-active" : "pta-page-btn-inactive"}`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {/* Next */}
                  <button
                    onClick={() => setMeetingsPage(p => Math.min(p + 1, totalPages))}
                    disabled={meetingsPage === totalPages}
                    className="pta-page-btn pta-page-btn-inactive disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Next page"
                  >
                    <i className="fi fi-rr-angle-right text-xs"></i>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
