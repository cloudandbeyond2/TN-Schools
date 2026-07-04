"use client";

import { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface ConferenceSession {
  id: string;
  schoolId: string;
  schoolName: string;
  scheduledAt: string;
  scheduledBy: string;
  role: string;
  status: "upcoming" | "live" | "ended";
  notes?: string;
  createdAt: string;
  className?: string;
  section?: string;
}

interface School {
  id: string;
  name: string;
  district?: string;
}

export default function ConnectWithSchoolPage({ role }: { role: string }) {
  const { data: session } = useSession();

  const [schools, setSchools] = useState<School[]>([]);
  const [sessions, setSessions] = useState<ConferenceSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  const SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch schools
      const sRes = await fetch(`${API}/api/schools`);
      const sJson = await sRes.json();
      if (sJson.success) {
        setSchools(sJson.data || []);
      }

      // Fetch existing conference sessions (stored in localStorage for now)
      const stored = localStorage.getItem("tn_conference_sessions");
      if (stored) setSessions(JSON.parse(stored));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchoolId || !scheduledDate || !scheduledTime) return;

    setSubmitting(true);
    const school = schools.find((s) => s.id === selectedSchoolId);
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

    const newSession: ConferenceSession = {
      id: crypto.randomUUID(),
      schoolId: selectedSchoolId,
      schoolName: school?.name || "Unknown School",
      className: selectedClass,
      section: selectedSection,
      scheduledAt,
      scheduledBy: session?.user?.name || role,
      role,
      status: "upcoming",
      notes,
      createdAt: new Date().toISOString(),
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    localStorage.setItem("tn_conference_sessions", JSON.stringify(updated));

    setSelectedSchoolId("");
    setSelectedClass("");
    setSelectedSection("");
    setScheduledDate("");
    setScheduledTime("");
    setNotes("");
    setSuccessMsg(`✅ Conference with ${school?.name} scheduled for ${new Date(scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}!`);
    setTimeout(() => setSuccessMsg(""), 5000);
    setSubmitting(false);
  };

  const handleDelete = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    localStorage.setItem("tn_conference_sessions", JSON.stringify(updated));
  };

  const getStatusBadge = (status: string) => {
    if (status === "live")     return "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse";
    if (status === "upcoming") return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  };

  const getStatusLabel = (status: string) => {
    if (status === "live")     return "🔴 LIVE";
    if (status === "upcoming") return "📅 Upcoming";
    return "✅ Ended";
  };

  // Portal theme per role
  const THEME: Record<string, { color: string; accent: string; themeClass: string; avatar: string }> = {
    BEO:         { color: "#8b5cf6", accent: "#8b5cf6", themeClass: "theme-beo",          avatar: "B" },
    DEO:         { color: "#ec4899", accent: "#ec4899", themeClass: "theme-deo",          avatar: "D" },
    COMMISSIONER:{ color: "#06b6d4", accent: "#06b6d4", themeClass: "theme-commissioner", avatar: "C" },
    MINISTER:    { color: "#ef4444", accent: "#ef4444", themeClass: "theme-minister",     avatar: "M" },
  };

  const t = THEME[role] || THEME["BEO"];

  const upcoming = sessions.filter((s) => s.status === "upcoming" || s.status === "live");
  const past     = sessions.filter((s) => s.status === "ended");

  // Get today's date string for min date
  const today = new Date().toISOString().split("T")[0];

  return (
    <PortalLayout
      title="Connect with School"
      subtitle="Schedule and manage live video conferences with schools under your jurisdiction."
      avatarLetter={t.avatar}
      avatarColor={t.color}
      themeClass={t.themeClass}
      accentColor={t.accent}
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left: Schedule Form */}
        <div className="lg:col-span-2">
          <div className="theme-card p-6 border border-[var(--border)] rounded-3xl">
            <h2 className="text-base font-bold text-[var(--text-heading)] mb-1 flex items-center gap-2">
              <span>📡</span> Schedule a Conference
            </h2>
            <p className="text-xs text-[var(--text-muted)] mb-5">
              Select a school and pick the date &amp; time for your live session.
            </p>

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSchedule} className="space-y-4">
              {/* School Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">
                  Select School
                </label>
                {loading ? (
                  <div className="w-full h-10 rounded-xl bg-slate-800 animate-pulse"></div>
                ) : (
                  <select
                    required
                    value={selectedSchoolId}
                    onChange={(e) => setSelectedSchoolId(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  >
                    <option value="">-- Choose a school --</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}{school.district ? ` · ${school.district}` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Class and Section Dropdowns */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">
                    Class (Optional)
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  >
                    <option value="">-- All Classes --</option>
                    {CLASSES.map((c) => (
                      <option key={c} value={c}>Class {c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">
                    Section (Optional)
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  >
                    <option value="">-- All Sections --</option>
                    {SECTIONS.map((s) => (
                      <option key={s} value={s}>Section {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected School Preview */}
              {selectedSchoolId && (
                <div className="p-3 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center gap-3">
                  <span className="text-2xl">🏫</span>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-heading)]">
                      {schools.find((s) => s.id === selectedSchoolId)?.name}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">Ready to schedule conference</p>
                  </div>
                </div>
              )}

              {/* Date Picker */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">
                  Conference Date
                </label>
                <input
                  required
                  type="date"
                  min={today}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>

              {/* Time Picker */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">
                  Conference Time
                </label>
                <input
                  required
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">
                  Agenda / Notes <span className="font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Review attendance records, discuss infrastructure..."
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: t.color, color: "#fff" }}
              >
                {submitting ? "⏳ Scheduling..." : "📅 Schedule Conference"}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Scheduled Sessions */}
        <div className="lg:col-span-3 space-y-6">

          {/* Upcoming */}
          <div className="theme-card p-6 border border-[var(--border)] rounded-3xl">
            <h2 className="text-base font-bold text-[var(--text-heading)] mb-4 flex items-center gap-2">
              <span>📅</span> Upcoming Conferences
              <span className="ml-auto text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {upcoming.length} scheduled
              </span>
            </h2>

            <div className="space-y-3">
              {upcoming.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-2">📡</div>
                  <p className="text-xs text-[var(--text-muted)]">No conferences scheduled yet.</p>
                </div>
              ) : upcoming.map((s) => {
                const dt = new Date(s.scheduledAt);
                const isToday = new Date().toDateString() === dt.toDateString();
                return (
                  <div key={s.id} className="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-2xl p-4 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex flex-col items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-[var(--primary)] uppercase">
                            {dt.toLocaleDateString("en-US", { month: "short" })}
                          </span>
                          <span className="text-lg font-black text-[var(--text-heading)] leading-none">
                            {dt.getDate()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-sm font-bold text-[var(--text-heading)]">
                              {s.schoolName}
                              {s.className && ` - Class ${s.className}${s.section ? ` '${s.section}'` : ''}`}
                            </h3>
                            {isToday && (
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">TODAY</span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mb-2">
                            🕐 {dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                            {s.notes && <span className="ml-2">· {s.notes}</span>}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${getStatusBadge(s.status)}`}>
                              {getStatusLabel(s.status)}
                            </span>
                            <span className="text-[9px] text-[var(--text-muted)]">Scheduled by {s.scheduledBy}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition-colors flex items-center gap-1"
                          style={{ background: t.color }}
                        >
                          🎥 Join
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Past */}
          {past.length > 0 && (
            <div className="theme-card p-6 border border-[var(--border)] rounded-3xl">
              <h2 className="text-base font-bold text-[var(--text-heading)] mb-4 flex items-center gap-2">
                <span>✅</span> Past Conferences
              </h2>
              <div className="space-y-2">
                {past.map((s) => {
                  const dt = new Date(s.scheduledAt);
                  return (
                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] opacity-60">
                      <span className="text-xl">🏫</span>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-[var(--text-heading)]">{s.schoolName}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">
                          {dt.toLocaleDateString("en-IN", { dateStyle: "medium" })} · {dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${getStatusBadge("ended")}`}>Ended</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </PortalLayout>
  );
}
