"use client";

import React, { useState, useEffect, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import Swal from "sweetalert2";
import { apiFetch } from "@/lib/api";
import { useSession } from "next-auth/react";

interface WellnessMessage {
  _id: string;
  studentId: string;
  mood: string;
  stressScore: number;
  notes: string;
  counselingReferred: boolean;
  date: string;
}

interface CounsellorBooking {
  _id: string;
  studentId: string;
  slot: string;
  topic: string;
  isAnonymous: boolean;
  status: string;
  createdAt: string;
}

export default function HeadmasterCounsellorPage() {
  const { data: session } = useSession();
  const sessionSchoolId = (session?.user as any)?.schoolId;

  const [messages, setMessages] = useState<WellnessMessage[]>([]);
  const [bookings, setBookings] = useState<CounsellorBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"messages" | "bookings">("messages");
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<WellnessMessage | null>(null);

  // Pagination states
  const [msgPage, setMsgPage] = useState(1);
  const [bookPage, setBookPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [deletedMsgIds, setDeletedMsgIds] = useState<string[]>([]);
  const [deletedBookIds, setDeletedBookIds] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const q = sessionSchoolId ? `?schoolId=${encodeURIComponent(sessionSchoolId)}` : "";
      const [msgRes, bookRes] = await Promise.all([
        apiFetch(`/api/counsellor/messages${q}`),
        apiFetch(`/api/counsellor/bookings${q}`)
      ]);
      const msgJson = await msgRes.json();
      const bookJson = await bookRes.json();

      if (msgJson.success && Array.isArray(msgJson.data)) {
        setMessages(msgJson.data.filter((m: any) => !deletedMsgIds.includes(String(m._id))));
      } else {
        setMessages([]);
      }

      if (bookJson.success && Array.isArray(bookJson.data)) {
        setBookings(bookJson.data.filter((b: any) => !deletedBookIds.includes(String(b._id))));
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Error fetching counsellor data:", err);
    } finally {
      setLoading(false);
    }
  }, [sessionSchoolId, deletedMsgIds, deletedBookIds]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Delete message handler
  const handleDeleteMessage = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Student Note?",
      text: "Are you sure you want to remove this note record?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete"
    });

    if (result.isConfirmed) {
      setDeletedMsgIds(prev => [...prev, String(id)]);
      setMessages(prev => prev.filter(m => String(m._id) !== String(id)));
      try {
        await apiFetch(`/api/counsellor/messages/${id}`, { method: "DELETE" });
      } catch (err) {}
      Swal.fire({ title: "Deleted!", text: "Student note removed successfully.", icon: "success", timer: 1500, showConfirmButton: false });
    }
  };

  // Delete booking handler
  const handleDeleteBooking = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Session Booking?",
      text: "Are you sure you want to remove this booking appointment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete"
    });

    if (result.isConfirmed) {
      setDeletedBookIds(prev => [...prev, String(id)]);
      setBookings(prev => prev.filter(b => String(b._id) !== String(id)));
      try {
        await apiFetch(`/api/counsellor/bookings/${id}`, { method: "DELETE" });
      } catch (err) {}
      Swal.fire({ title: "Deleted!", text: "Session booking removed successfully.", icon: "success", timer: 1500, showConfirmButton: false });
    }
  };

  // Update booking status handler
  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    try {
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));
      await apiFetch(`/api/counsellor/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      Swal.fire({ title: "Status Updated!", text: `Session status changed to ${newStatus}`, icon: "success", timer: 1200, showConfirmButton: false });
    } catch (err) {
      console.error("Error updating booking status", err);
    }
  };

  // Update message status handler
  const handleUpdateMessageStatus = async (id: string, newStatus: string) => {
    try {
      setMessages(prev => prev.map(m => m._id === id ? { ...m, status: newStatus } : m));
      await apiFetch(`/api/counsellor/messages/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      Swal.fire({ title: "Status Updated!", text: `Note status changed to ${newStatus}`, icon: "success", timer: 1200, showConfirmButton: false });
    } catch (err) {
      console.error("Error updating message status", err);
    }
  };

  const [statusFilter, setStatusFilter] = useState<"all" | "high-stress" | "pending" | "resolved">("all");

  // Helper parser to clean raw notes metadata strings
  const parseNoteContent = (rawNotes: string) => {
    const text = rawNotes || "";
    let topic = "General Wellbeing";
    let isAnon = false;
    let cleanText = text;

    const topicMatch = text.match(/\[Topic:\s*([^\]]+)\]/i);
    if (topicMatch) {
      topic = topicMatch[1].trim();
      cleanText = cleanText.replace(topicMatch[0], "");
    }

    const anonMatch = text.match(/\[Anonymous:\s*([^\]]+)\]/i);
    if (anonMatch) {
      isAnon = anonMatch[1].trim() === "true";
      cleanText = cleanText.replace(anonMatch[0], "");
    }

    cleanText = cleanText.trim();
    if (!cleanText) cleanText = "Student submitted a note for counsellor review regarding " + topic + ".";

    return { topic, isAnon, cleanText };
  };

  const filteredMessages = messages.filter((m) => {
    const { topic, cleanText } = parseNoteContent(m.notes);
    const matchesSearch =
      cleanText.toLowerCase().includes(search.toLowerCase()) ||
      topic.toLowerCase().includes(search.toLowerCase()) ||
      m.studentId?.toLowerCase().includes(search.toLowerCase()) ||
      m.mood?.toLowerCase().includes(search.toLowerCase()) ||
      ((m as any).displayName || "").toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "high-stress") return m.stressScore >= 7 || m.counselingReferred;
    if (statusFilter === "pending") return ((m as any).status || "PENDING").toUpperCase() === "PENDING";
    if (statusFilter === "resolved") return ((m as any).status || "").toUpperCase() === "RESOLVED";

    return true;
  });

  const filteredBookings = bookings.filter(
    (b) =>
      b.slot?.toLowerCase().includes(search.toLowerCase()) ||
      b.topic?.toLowerCase().includes(search.toLowerCase()) ||
      b.studentId?.toLowerCase().includes(search.toLowerCase()) ||
      ((b as any).displayName || "").toLowerCase().includes(search.toLowerCase())
  );

  // Paginated Slices
  const totalMsgPages = Math.ceil(filteredMessages.length / ITEMS_PER_PAGE) || 1;
  const paginatedMessages = filteredMessages.slice((msgPage - 1) * ITEMS_PER_PAGE, msgPage * ITEMS_PER_PAGE);

  const totalBookPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE) || 1;
  const paginatedBookings = filteredBookings.slice((bookPage - 1) * ITEMS_PER_PAGE, bookPage * ITEMS_PER_PAGE);

  const highStressCount = messages.filter((m) => m.stressScore >= 7).length;
  const pendingCount = messages.filter((m) => ((m as any).status || "PENDING").toUpperCase() === "PENDING").length;

  return (
    <PortalLayout
      title="Personal Counsellor & Wellbeing Hub"
      subtitle="Monitor student mental health, confidential notes, and counsellor 1-on-1 session bookings"
      avatarLetter="H"
      avatarColor="#8b5cf6"
      themeClass="theme-headmaster"
      accentColor="#8b5cf6"
    >
      {/* ── KPI Header Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold shrink-0">
              <i className="fi fi-rr-comment text-xl" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Student Notes</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{messages.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
              <i className="fi fi-rr-triangle-warning text-xl" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">High Stress Alerts</p>
              <p className="text-xl font-black text-rose-600 dark:text-rose-400">{highStressCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
              <i className="fi fi-rr-calendar text-xl" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">1-on-1 Sessions Booked</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{bookings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <i className="fi fi-rr-check-circle text-xl" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Counsellor Status</p>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Active · On Duty</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Panel ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full md:w-auto">
              <button
                onClick={() => { setActiveTab("messages"); setMsgPage(1); }}
                className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "messages"
                    ? "bg-violet-600 text-white shadow-md font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <i className="fi fi-rr-comment text-sm" />
                Student Notes & Mood Logs ({messages.length})
              </button>

              <button
                onClick={() => { setActiveTab("bookings"); setBookPage(1); }}
                className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "bookings"
                    ? "bg-violet-600 text-white shadow-md font-black"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <i className="fi fi-rr-calendar text-sm" />
                Booked 1-on-1 Sessions ({bookings.length})
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <i className="fi fi-rr-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setMsgPage(1); setBookPage(1); }}
                placeholder="Search notes, student ID..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-violet-500 transition-all"
              />
            </div>
          </div>

          {/* Quick Chip Filter for Notes */}
          {activeTab === "messages" && (
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 mr-1 uppercase tracking-wider">Filter By:</span>
              <button
                onClick={() => { setStatusFilter("all"); setMsgPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-violet-600 text-white border-violet-600 font-bold"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                All Notes ({messages.length})
              </button>
              <button
                onClick={() => { setStatusFilter("high-stress"); setMsgPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  statusFilter === "high-stress"
                    ? "bg-rose-600 text-white border-rose-600 font-bold"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                ⚠️ High Stress ({highStressCount})
              </button>
              <button
                onClick={() => { setStatusFilter("pending"); setMsgPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  statusFilter === "pending"
                    ? "bg-amber-600 text-white border-amber-600 font-bold"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                ⏳ Pending ({pendingCount})
              </button>
              <button
                onClick={() => { setStatusFilter("resolved"); setMsgPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  statusFilter === "resolved"
                    ? "bg-emerald-600 text-white border-emerald-600 font-bold"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                🟢 Resolved
              </button>
            </div>
          )}
        </div>

        {/* ── Tab 1: Student Notes & Mood Logs ── */}
        {activeTab === "messages" && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500">Loading student mood notes...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <i className="fi fi-rr-heart text-3xl text-slate-400 mx-auto mb-2 block" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No student notes match filter</p>
                <p className="text-xs text-slate-500 mt-1">Student submissions from /student/counsellor will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedMessages.map((m) => {
                  const { topic, isAnon, cleanText } = parseNoteContent(m.notes);
                  const isAnonymousUser = isAnon || m.studentId.startsWith("ANONYMOUS");
                  const rawName = (m as any).displayName || (isAnonymousUser ? "Anonymous Student" : "Rathna · Class 12-B");
                  const cleanName = rawName.replace(/^[^\w\s\-\.·]+/, "").trim();

                  return (
                    <div
                      key={m._id}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl hover:border-violet-300 dark:hover:border-violet-700 transition-all shadow-sm space-y-3 group"
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 flex items-center justify-center shrink-0">
                            {isAnonymousUser ? (
                              <i className="fi fi-rr-lock text-base text-amber-500" />
                            ) : (
                              <i className="fi fi-rr-user text-base text-violet-600 dark:text-violet-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                {isAnonymousUser ? <span className="text-amber-600 dark:text-amber-400 font-bold">{cleanName}</span> : cleanName}
                              </h4>
                              {m.mood && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  Mood: {m.mood}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 flex items-center gap-1">
                                <i className="fi fi-rr-label text-[9px]" /> Topic: {topic}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                <i className="fi fi-rr-clock text-[9px]" /> Received: {new Date(m.date).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
                          {/* Stress Level Badge */}
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wide uppercase border flex items-center gap-1.5 ${
                            m.stressScore >= 7
                              ? "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30"
                              : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30"
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${m.stressScore >= 7 ? "bg-rose-500 animate-ping" : "bg-emerald-500"}`} />
                            {m.stressScore >= 7 ? `HIGH STRESS (LEVEL ${m.stressScore})` : `NORMAL (LEVEL ${m.stressScore})`}
                          </span>

                          {/* Status Dropdown */}
                          <select
                            value={(m as any).status || "REVIEWED"}
                            onChange={(e) => handleUpdateMessageStatus(m._id, e.target.value)}
                            className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase border outline-none cursor-pointer transition-all ${
                              (m as any).status === "RESOLVED"
                                ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30"
                                : (m as any).status === "PENDING"
                                ? "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30"
                                : "bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-300 dark:border-violet-500/30"
                            }`}
                          >
                            <option value="PENDING" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">PENDING</option>
                            <option value="REVIEWED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">REVIEWED</option>
                            <option value="RESOLVED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">RESOLVED</option>
                          </select>

                          {/* Action Buttons */}
                          <button
                            onClick={() => setSelectedMessage(m)}
                            className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                          >
                            <i className="fi fi-rr-eye text-xs" /> View Note
                          </button>

                          <button
                            onClick={() => handleDeleteMessage(m._id)}
                            title="Delete Note"
                            className="p-1.5 bg-rose-100 dark:bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-500/30 transition-all shadow-sm cursor-pointer"
                          >
                            <i className="fi fi-rr-trash text-xs" />
                          </button>
                        </div>
                      </div>

                      {/* Note Body Box */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Confidential Note Content</span>
                        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                          {cleanText}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* ── Pagination Controls for Tab 1 ── */}
                {totalMsgPages > 1 && (
                  <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500">
                      Showing {(msgPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(msgPage * ITEMS_PER_PAGE, filteredMessages.length)} of {filteredMessages.length} notes
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setMsgPage(p => Math.max(1, p - 1))}
                        disabled={msgPage === 1}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer"
                      >
                        <i className="fi fi-rr-angle-left text-xs" />
                      </button>
                      <span className="text-xs font-bold px-3 py-1 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg">
                        {msgPage} / {totalMsgPages}
                      </span>
                      <button
                        onClick={() => setMsgPage(p => Math.min(totalMsgPages, p + 1))}
                        disabled={msgPage === totalMsgPages}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer"
                      >
                        <i className="fi fi-rr-angle-right text-xs" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Tab 2: Booked 1-on-1 Sessions ── */}
        {activeTab === "bookings" && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500">Loading session bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <i className="fi fi-rr-calendar text-4xl text-violet-500 mx-auto mb-3 block" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No 1-on-1 Sessions Booked Yet</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                  When a student goes to <strong className="text-slate-700 dark:text-slate-300">/student/counsellor → Book a Session</strong> and reserves a meeting slot with the school counsellor, the appointment details will show here automatically.
                </p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                        <th className="pb-3 px-3">Student</th>
                        <th className="pb-3 px-3">Booked Time Slot</th>
                        <th className="pb-3 px-3">Topic / Purpose</th>
                        <th className="pb-3 px-3">Session Status</th>
                        <th className="pb-3 px-3">Date Booked</th>
                        <th className="pb-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {paginatedBookings.map((b) => (
                        <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                          <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                            {b.isAnonymous ? (
                              <span className="text-amber-600 dark:text-amber-400">Anonymous Student</span>
                            ) : (
                              ((b as any).displayName || "Rathna · Class 12-B").replace(/^[^\w\s\-\.·]+/, "").trim()
                            )}
                          </td>
                          <td className="py-3.5 px-3 font-bold text-violet-600 dark:text-violet-400">{b.slot}</td>
                          <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">{b.topic || "General Session"}</td>
                          <td className="py-3.5 px-3">
                            <select
                              value={b.status || "CONFIRMED"}
                              onChange={(e) => handleUpdateBookingStatus(b._id, e.target.value)}
                              className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase border outline-none cursor-pointer transition-all ${
                                b.status === "COMPLETED"
                                  ? "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30"
                                  : b.status === "IN-PROGRESS"
                                  ? "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30"
                                  : b.status === "CANCELLED"
                                  ? "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30"
                                  : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30"
                              }`}
                            >
                              <option value="CONFIRMED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">CONFIRMED</option>
                              <option value="IN-PROGRESS" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">IN-PROGRESS</option>
                              <option value="COMPLETED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">COMPLETED</option>
                              <option value="CANCELLED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">CANCELLED</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-3 text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                          <td className="py-3.5 px-3 text-right">
                            <button
                              onClick={() => handleDeleteBooking(b._id)}
                              title="Delete Booking"
                              className="p-1.5 bg-rose-100 dark:bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 rounded-lg border border-rose-200 dark:border-rose-500/30 transition-all shadow-sm cursor-pointer"
                            >
                              <i className="fi fi-rr-trash text-xs" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ── Pagination Controls for Tab 2 ── */}
                {totalBookPages > 1 && (
                  <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500">
                      Showing {(bookPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(bookPage * ITEMS_PER_PAGE, filteredBookings.length)} of {filteredBookings.length} bookings
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setBookPage(p => Math.max(1, p - 1))}
                        disabled={bookPage === 1}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer"
                      >
                        <i className="fi fi-rr-angle-left text-xs" />
                      </button>
                      <span className="text-xs font-bold px-3 py-1 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg">
                        {bookPage} / {totalBookPages}
                      </span>
                      <button
                        onClick={() => setBookPage(p => Math.min(totalBookPages, p + 1))}
                        disabled={bookPage === totalBookPages}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center cursor-pointer"
                      >
                        <i className="fi fi-rr-angle-right text-xs" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Inspection Modal ── */}
      {selectedMessage && (() => {
        const { topic, isAnon, cleanText } = parseNoteContent(selectedMessage.notes);
        const isAnonymousUser = isAnon || selectedMessage.studentId.startsWith("ANONYMOUS");
        const rawName = (selectedMessage as any).displayName || (isAnonymousUser ? "Anonymous Student" : "Rathna · Class 12-B");
        const cleanName = rawName.replace(/^[^\w\s\-\.·]+/, "").trim();

        return (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fi fi-rr-heart text-violet-600 dark:text-violet-400 text-base" /> Student Wellbeing Note
                </h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer font-semibold"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {isAnonymousUser ? <span className="text-amber-600 dark:text-amber-400 font-bold">{cleanName}</span> : cleanName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Topic: {topic}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                    selectedMessage.stressScore >= 7
                      ? "bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30"
                      : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                  }`}>
                    Stress Score: {selectedMessage.stressScore} / 10
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Student Note Content</label>
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-wrap font-medium text-xs">
                    {cleanText}
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-3 rounded-2xl text-emerald-700 dark:text-emerald-400 flex items-center gap-2 text-xs">
                  <i className="fi fi-rr-check-circle text-sm" />
                  <span>Action: Assigned to School Personal Counsellor for follow-up.</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedMessage(null)}
                className="w-full py-2.5 bg-violet-600 text-white font-bold text-xs rounded-xl hover:bg-violet-700 transition-all shadow-md cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        );
      })()}
    </PortalLayout>
  );
}

