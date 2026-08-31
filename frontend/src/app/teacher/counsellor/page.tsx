"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";

interface WellnessMessage {
  _id: string;
  studentId: string;
  studentName?: string;
  className?: string;
  section?: string;
  displayName?: string;
  mood: string;
  stressScore: number;
  notes: string;
  counselingReferred: boolean;
  date: string;
  isAnonymous?: boolean;
  status?: string;
}

interface CounsellorBooking {
  _id: string;
  studentId: string;
  studentName?: string;
  className?: string;
  section?: string;
  displayName?: string;
  slot: string;
  topic: string;
  isAnonymous?: boolean;
  status?: string;
  createdAt?: string;
}

export default function TeacherCounsellorPage() {
  const [messages, setMessages] = useState<WellnessMessage[]>([]);
  const [bookings, setBookings] = useState<CounsellorBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"messages" | "bookings">("messages");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "high-stress" | "pending" | "resolved">("all");
  const [selectedMessage, setSelectedMessage] = useState<WellnessMessage | null>(null);

  // Pagination states
  const [msgPage, setMsgPage] = useState(1);
  const [bookPage, setBookPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchData = async () => {
    try {
      const [msgRes, bookRes] = await Promise.all([
        fetch(`${API_URL}/api/counsellor/messages`),
        fetch(`${API_URL}/api/counsellor/bookings`)
      ]);
      const msgJson = await msgRes.json();
      const bookJson = await bookRes.json();

      if (msgJson.success && Array.isArray(msgJson.data)) {
        setMessages(msgJson.data);
      }
      if (bookJson.success && Array.isArray(bookJson.data)) {
        setBookings(bookJson.data);
      }
    } catch (err) {
      console.error("Error fetching teacher counsellor data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [API_URL]);

  // Helper parser to clean raw notes metadata strings
  const parseNoteContent = (rawNotes: string) => {
    const text = rawNotes || "";
    let topic = "Personal & Emotional";
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
    if (!cleanText) cleanText = "Student submitted note for counsellor review regarding " + topic + ".";

    return { topic, isAnon, cleanText };
  };

  // Filter messages by search term and chip status
  const filteredMessages = messages.filter(m => {
    const { topic, cleanText } = parseNoteContent(m.notes);
    const matchesSearch =
      (m.displayName || "").toLowerCase().includes(search.toLowerCase()) ||
      cleanText.toLowerCase().includes(search.toLowerCase()) ||
      topic.toLowerCase().includes(search.toLowerCase()) ||
      (m.studentName || "").toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "high-stress") return m.stressScore >= 7 || m.counselingReferred;
    if (statusFilter === "pending") return (m.status || "PENDING").toUpperCase() === "PENDING";
    if (statusFilter === "resolved") return (m.status || "").toUpperCase() === "RESOLVED";

    return true;
  });

  const filteredBookings = bookings.filter(b =>
    (b.displayName || "").toLowerCase().includes(search.toLowerCase()) ||
    (b.topic || "").toLowerCase().includes(search.toLowerCase()) ||
    (b.slot || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalMsgPages = Math.ceil(filteredMessages.length / ITEMS_PER_PAGE) || 1;
  const paginatedMessages = filteredMessages.slice((msgPage - 1) * ITEMS_PER_PAGE, msgPage * ITEMS_PER_PAGE);

  const totalBookPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE) || 1;
  const paginatedBookings = filteredBookings.slice((bookPage - 1) * ITEMS_PER_PAGE, bookPage * ITEMS_PER_PAGE);

  const highStressCount = messages.filter(m => m.stressScore >= 7 || m.counselingReferred).length;
  const pendingCount = messages.filter(m => (m.status || "PENDING").toUpperCase() === "PENDING").length;

  const getMoodEmoji = (mood?: string) => {
    const m = (mood || "").toLowerCase();
    if (m.includes("happy") || m.includes("great") || m.includes("good")) return "😊";
    if (m.includes("sad")) return "😢";
    if (m.includes("angry")) return "😡";
    if (m.includes("anxious") || m.includes("stress")) return "😰";
    return "😐";
  };

  const getStatusBadge = (status?: string) => {
    const s = (status || "PENDING").toUpperCase();
    if (s === "RESOLVED") {
      return { text: "🟢 RESOLVED", bg: "bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 border-emerald-500/40" };
    }
    if (s === "COMPLETED") {
      return { text: "🟢 COMPLETED", bg: "bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 border-emerald-500/40" };
    }
    if (s === "CONFIRMED") {
      return { text: "🟢 CONFIRMED", bg: "bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 border-emerald-500/40" };
    }
    if (s === "REVIEWED") {
      return { text: "🟣 HM REVIEWED", bg: "bg-violet-500/15 text-violet-950 dark:text-violet-200 border-violet-500/40" };
    }
    if (s === "IN-PROGRESS") {
      return { text: "🟣 IN-PROGRESS", bg: "bg-violet-500/15 text-violet-950 dark:text-violet-200 border-violet-500/40" };
    }
    if (s === "CANCELLED") {
      return { text: "🔴 CANCELLED", bg: "bg-rose-500/15 text-rose-950 dark:text-rose-200 border-rose-500/40" };
    }
    return { text: "🟡 PENDING HM ACTION", bg: "bg-amber-500/15 text-amber-950 dark:text-amber-200 border-amber-500/40" };
  };

  return (
    <PortalLayout
      title="Personal Counsellor & Wellbeing"
      subtitle="Class Teacher Dashboard · Monitor confidential student notes & 1-on-1 session appointments."
    >
      <div className="space-y-5 sm:space-y-6 w-full pb-12">
        {/* Top Hero Banner with High Contrast & Fully Responsive Layout */}
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-600/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border border-amber-500/30 dark:border-slate-800 p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl shadow-md space-y-4 relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 bg-amber-500/20 text-amber-950 dark:text-amber-200 font-extrabold border border-amber-500/40 rounded-full text-[11px] sm:text-xs flex items-center gap-1.5 shadow-sm">
              👁️ Class Teacher Read-Only View
            </span>
            <span className="px-3 py-1.5 bg-indigo-500/20 text-indigo-950 dark:text-indigo-200 font-extrabold border border-indigo-500/40 rounded-full text-[11px] sm:text-xs flex items-center gap-1.5 shadow-sm">
              🛡️ Confidential Safety
            </span>
            <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-950 dark:text-emerald-200 font-extrabold border border-emerald-500/40 rounded-full text-[11px] sm:text-xs flex items-center gap-1.5 shadow-sm">
              ⏱️ Real-Time Live Sync (3s)
            </span>
          </div>

          <div className="max-w-3xl space-y-1.5">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Student Wellbeing & Counsellor Activity Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              As a Class Teacher, monitor confidential emotional notes, mood indicators, and scheduled 1-on-1 counsellor appointments submitted by your class students. Official status actions and counselor responses are handled exclusively by the Headmaster.
            </p>
          </div>
        </div>

        {/* Responsive Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-lg hover:border-amber-500/40 transition-all duration-200 space-y-3 cursor-default hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Total Notes</span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-base sm:text-lg font-bold">
                💬
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[var(--text-heading)]">{messages.length}</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5 font-medium">Submitted by class students</div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-lg hover:border-rose-500/40 transition-all duration-200 space-y-3 cursor-default hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">High Stress Alerts</span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-base sm:text-lg font-bold">
                ⚠️
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-rose-500">{highStressCount}</div>
              <div className="text-[11px] text-rose-600/80 font-medium mt-0.5">Stress score Level 7+ alerts</div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-lg hover:border-emerald-500/40 transition-all duration-200 space-y-3 cursor-default hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Sessions Booked</span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-base sm:text-lg font-bold">
                📅
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-500">{bookings.length}</div>
              <div className="text-[11px] text-emerald-600/80 font-medium mt-0.5">1-on-1 Appointments</div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-lg hover:border-amber-500/40 transition-all duration-200 space-y-3 cursor-default hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Pending HM Review</span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-base sm:text-lg font-bold">
                ⏳
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-amber-500">{pendingCount}</div>
              <div className="text-[11px] text-amber-600/80 font-medium mt-0.5">Awaiting Headmaster response</div>
            </div>
          </div>
        </div>

        {/* Tab & Filter Controls */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
            {/* Main Tab Switcher */}
            <div className="flex bg-[var(--bg-card)] border border-[var(--border)] p-1 rounded-xl sm:rounded-2xl w-full sm:w-auto shadow-sm">
              <button
                onClick={() => { setActiveTab("messages"); setMsgPage(1); }}
                className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "messages"
                    ? "bg-amber-500 text-white shadow-md hover:bg-amber-600"
                    : "text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-main)]"
                }`}
              >
                💬 Student Notes ({messages.length})
              </button>
              <button
                onClick={() => { setActiveTab("bookings"); setBookPage(1); }}
                className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "bookings"
                    ? "bg-amber-500 text-white shadow-md hover:bg-amber-600"
                    : "text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-main)]"
                }`}
              >
                📅 1-on-1 Sessions ({bookings.length})
              </button>
            </div>

            {/* Search Input Box */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search student, class, note topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl sm:rounded-2xl px-4 py-2.5 pl-10 text-xs text-[var(--text-heading)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-amber-500 transition-all shadow-sm"
              />
              <span className="absolute left-3.5 top-3 text-xs text-[var(--text-muted)]">🔍</span>
            </div>
          </div>

          {/* Quick Chip Filter for Notes */}
          {activeTab === "messages" && (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-muted)] mr-1.5 uppercase tracking-wider">Filter By:</span>
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  statusFilter === "all"
                    ? "bg-amber-500/20 border-amber-500/60 text-amber-950 dark:text-amber-200 font-extrabold"
                    : "bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-main)]"
                }`}
              >
                All Notes ({messages.length})
              </button>
              <button
                onClick={() => setStatusFilter("high-stress")}
                className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  statusFilter === "high-stress"
                    ? "bg-rose-500/20 border-rose-500/60 text-rose-950 dark:text-rose-200 font-extrabold"
                    : "bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-main)]"
                }`}
              >
                ⚠️ High Stress ({highStressCount})
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  statusFilter === "pending"
                    ? "bg-amber-500/20 border-amber-500/60 text-amber-950 dark:text-amber-200 font-extrabold"
                    : "bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-main)]"
                }`}
              >
                ⏳ Pending Review ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter("resolved")}
                className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  statusFilter === "resolved"
                    ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-950 dark:text-emerald-200 font-extrabold"
                    : "bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-main)]"
                }`}
              >
                🟢 Resolved
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-20 text-center space-y-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl sm:rounded-3xl">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-semibold text-[var(--text-muted)]">Fetching live student wellbeing logs...</p>
          </div>
        ) : activeTab === "messages" ? (
          <div className="space-y-4">
            {paginatedMessages.length === 0 ? (
              <div className="py-16 sm:py-20 text-center bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl sm:rounded-3xl space-y-3 p-4">
                <p className="text-3xl sm:text-4xl">🌱</p>
                <h4 className="text-sm sm:text-base font-bold text-[var(--text-heading)]">No Notes Match Your Filter</h4>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  No confidential student notes found matching the selected filter query.
                </p>
              </div>
            ) : (
              paginatedMessages.map((m) => {
                const { topic, isAnon, cleanText } = parseNoteContent(m.notes);
                const statusBadge = getStatusBadge(m.status);
                const moodEmoji = getMoodEmoji(m.mood);
                const isAnonymousUser = isAnon || m.isAnonymous;
                const rawName = m.displayName || (isAnonymousUser ? "Anonymous Student" : `${m.studentName || "Rathna"} · Class ${m.className || "12"}-${m.section || "B"}`);
                const cleanName = rawName.replace(/^[^\w\s\-\.·]+/, "").trim();

                return (
                  <div
                    key={m._id}
                    className="bg-[var(--bg-card)] border border-[var(--border)] p-4 sm:p-6 rounded-2xl sm:rounded-3xl hover:border-amber-500/50 hover:shadow-lg transition-all duration-200 space-y-4 shadow-sm"
                  >
                    {/* Responsive Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-light)] pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg sm:text-xl shrink-0 border border-amber-500/30 shadow-sm">
                          {isAnonymousUser ? <i className="fi fi-rr-lock text-xl text-amber-500" /> : <i className="fi fi-rr-user text-xl text-indigo-500" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-bold text-[var(--text-heading)]">
                              {isAnonymousUser ? <span className="text-amber-600 dark:text-amber-400 font-bold">{cleanName}</span> : cleanName}
                            </h4>
                            <span className="text-xs sm:text-sm">{moodEmoji}</span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30 flex items-center gap-1">
                              <i className="fi fi-rr-label text-[10px]" /> Topic: {topic}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] font-medium flex items-center gap-1">
                              <i className="fi fi-rr-clock text-[10px]" /> Received: {new Date(m.date).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                        {/* Stress Level Badge */}
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase border flex items-center gap-1.5 ${
                          m.stressScore >= 7
                            ? "bg-rose-500/20 text-rose-950 dark:text-rose-200 border-rose-500/40"
                            : "bg-emerald-500/20 text-emerald-950 dark:text-emerald-200 border-emerald-500/40"
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${m.stressScore >= 7 ? "bg-rose-500 animate-ping" : "bg-emerald-500"}`} />
                          {m.stressScore >= 7 ? `HIGH STRESS (LEVEL ${m.stressScore})` : `NORMAL (LEVEL ${m.stressScore})`}
                        </span>

                        {/* Headmaster Action Status Badge */}
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase ${statusBadge.bg}`}>
                          {statusBadge.text}
                        </span>

                        {/* Detail Modal Trigger Button */}
                        <button
                          onClick={() => setSelectedMessage(m)}
                          className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md hover:scale-105 flex items-center gap-1.5"
                        >
                          <i className="fi fi-rr-eye text-xs" /> View Detailed Note
                        </button>
                      </div>
                    </div>

                    {/* Note Content Box */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Confidential Note Content</span>
                      <div className="bg-[var(--bg-main)] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[var(--border-light)] text-xs text-[var(--text-heading)] leading-relaxed font-medium">
                        {cleanText}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Pagination Controls */}
            {totalMsgPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <span className="text-xs text-[var(--text-muted)] font-medium">Page {msgPage} of {totalMsgPages}</span>
                <div className="flex gap-2">
                  <button
                    disabled={msgPage === 1}
                    onClick={() => setMsgPage(p => p - 1)}
                    className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card)] disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={msgPage === totalMsgPages}
                    onClick={() => setMsgPage(p => p + 1)}
                    className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card)] disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedBookings.length === 0 ? (
              <div className="py-16 sm:py-20 text-center bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl sm:rounded-3xl space-y-3 p-4">
                <p className="text-3xl sm:text-4xl">📅</p>
                <h4 className="text-sm sm:text-base font-bold text-[var(--text-heading)]">No Appointments Booked</h4>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  No 1-on-1 counsellor appointments have been booked yet by students.
                </p>
              </div>
            ) : (
              paginatedBookings.map((b) => {
                const statusBadge = getStatusBadge(b.status);

                return (
                  <div
                    key={b._id}
                    className="bg-[var(--bg-card)] border border-[var(--border)] p-4 sm:p-6 rounded-2xl sm:rounded-3xl hover:border-amber-500/50 hover:shadow-lg transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg sm:text-xl shrink-0 border border-emerald-500/30">
                        <i className="fi fi-rr-calendar text-xl" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[var(--text-heading)]">
                          {b.isAnonymous ? (
                            <span className="text-amber-600 dark:text-amber-400">Anonymous Student</span>
                          ) : (
                            (b.displayName || `${b.studentName || "Rathna"} · Class ${b.className || "12"}-${b.section || "B"}`).replace(/^[^\w\s\-\.·]+/, "").trim()
                          )}
                        </h4>
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                          <i className="fi fi-rr-clock text-xs" /> Scheduled Slot: {b.slot}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          Discussion Topic: <strong className="text-[var(--text-heading)]">{b.topic}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-extrabold border uppercase ${statusBadge.bg}`}>
                        {statusBadge.text}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {/* Pagination Controls */}
            {totalBookPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <span className="text-xs text-[var(--text-muted)] font-medium">Page {bookPage} of {totalBookPages}</span>
                <div className="flex gap-2">
                  <button
                    disabled={bookPage === 1}
                    onClick={() => setBookPage(p => p - 1)}
                    className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card)] disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={bookPage === totalBookPages}
                    onClick={() => setBookPage(p => p + 1)}
                    className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card)] disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detailed Inspection Modal Window */}
        {selectedMessage && (() => {
          const { topic, isAnon, cleanText } = parseNoteContent(selectedMessage.notes);
          const statusBadge = getStatusBadge(selectedMessage.status);

          return (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
              <div className="bg-[var(--bg-card)] border border-[var(--border)] w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-5 sm:space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="absolute top-5 right-5 sm:top-6 sm:right-6 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-heading)] flex items-center justify-center text-xs sm:text-sm font-bold border border-[var(--border)] hover:bg-amber-500 hover:text-white transition-all"
                >
                  ✕
                </button>

                <div className="flex items-center gap-3 sm:gap-3.5 border-b border-[var(--border)] pb-4 sm:pb-5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-xl sm:text-2xl font-bold border border-amber-500/30">
                    <i className="fi fi-rr-comment text-xl" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[var(--text-heading)]">
                      { (selectedMessage.displayName || (isAnon || selectedMessage.isAnonymous ? "Anonymous Student" : "Student Note")).replace(/^[^\w\s\-\.·]+/, "").trim() }
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[var(--text-muted)] font-medium mt-0.5">
                      Class Teacher Read-Only Inspection Modal
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[var(--bg-main)] p-3.5 rounded-2xl border border-[var(--border-light)] space-y-1">
                      <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Stress Score</span>
                      <p className={`text-xs sm:text-sm font-black ${selectedMessage.stressScore >= 7 ? "text-rose-500" : "text-emerald-500"}`}>
                        Level {selectedMessage.stressScore} ({selectedMessage.stressScore >= 7 ? "High Stress Alert" : "Normal"})
                      </p>
                    </div>

                    <div className="bg-[var(--bg-main)] p-3.5 rounded-2xl border border-[var(--border-light)] space-y-1">
                      <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">HM Action Status</span>
                      <div className="pt-0.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase ${statusBadge.bg}`}>
                          {statusBadge.text}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--bg-main)] p-3.5 rounded-2xl border border-[var(--border-light)] space-y-1">
                    <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Topic & Confidentiality</span>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-amber-500/15 text-amber-950 dark:text-amber-200 border border-amber-500/30">
                        🏷️ Topic: {topic}
                      </span>
                      <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-indigo-500/15 text-indigo-950 dark:text-indigo-200 border border-indigo-500/30">
                        {isAnon || selectedMessage.isAnonymous ? "🔒 Anonymous Note" : "👤 Direct Student Submission"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] sm:text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Full Confidential Note Message</label>
                    <div className="bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border-light)] text-xs text-[var(--text-heading)] leading-relaxed font-medium whitespace-pre-wrap">
                      {cleanText}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="w-full py-3 sm:py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-md active:scale-95"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </PortalLayout>
  );
}
