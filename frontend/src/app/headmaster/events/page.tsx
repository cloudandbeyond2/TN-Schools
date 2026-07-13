"use client";

import React, { useState, useEffect, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};
const API_BASE = getApiBase();

interface SchoolEvent {
  id: string;
  title: string;
  category: "Sports" | "Academic" | "Cultural" | "General";
  date: string;
  coordinator: string;
  status: "Scheduled" | "In Preparation" | "Completed";
  description: string;
}

interface CulturalEventBackend {
  id: string;
  title: string;
  eventDate: string;
  location: string;
  description: string;
  status: string;
  schoolId?: string | null;
}

export default function EventsPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId || "";

  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [staffList, setStaffList] = useState<{ id: string; name: string; subject: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"All" | "Upcoming" | "Completed">("All");

  // Event Scheduler Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"Sports" | "Academic" | "Cultural" | "General">("Academic");
  const [newDate, setNewDate] = useState("");
  const [newCoordinator, setNewCoordinator] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [eventToast, setEventToast] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/teacher/cultural-events?schoolId=${schoolId}`);
      const json = await res.json();
      if (json.success && json.data) {
        const mapped: SchoolEvent[] = json.data.map((b: CulturalEventBackend) => {
          let category: SchoolEvent["category"] = "General";
          let coordinator = "Mrs. Sumathi Devi (Math)";
          
          try {
            const meta = JSON.parse(b.location);
            if (meta.category) category = meta.category;
            if (meta.coordinator) coordinator = meta.coordinator;
          } catch {
            coordinator = b.location || "Mrs. Sumathi Devi (Math)";
          }

          // Format Date nicely
          const dateObj = new Date(b.eventDate);
          const formattedDate = dateObj.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
          });

          // Status mapping
          let status: SchoolEvent["status"] = "Scheduled";
          if (b.status === "Completed") {
            status = "Completed";
          } else if (b.status === "In Preparation" || b.status === "upcoming" || b.status === "Upcoming") {
            status = "In Preparation";
          }

          return {
            id: b.id,
            title: b.title,
            category,
            date: formattedDate,
            coordinator,
            status,
            description: b.description
          };
        });

        // Sort events chronologically descending (newest created or newest date first)
        setEvents(mapped);
      }
      // Fetch permanent staff list
      const staffRes = await fetch(`${API_BASE}/api/headmaster/staff?schoolId=${schoolId}`);
      const staffJson = await staffRes.json();
      if (staffJson.success && staffJson.data) {
        setStaffList(staffJson.data.map((s: any) => ({
          id: s.id,
          name: s.name,
          subject: s.subject || "General"
        })));
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    if (staffList.length > 0) {
      const first = staffList[0];
      setNewCoordinator(`${first.name} (${first.subject})`);
    }
  }, [staffList]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate || !schoolId) return;

    // Serialize category and coordinator inside location field
    const location = JSON.stringify({
      category: newCategory,
      coordinator: newCoordinator
    });

    const body = {
      title: newTitle,
      eventDate: new Date(newDate).toISOString(),
      location,
      description: newDesc || "No additional description provided.",
      status: "Upcoming", // maps to "In Preparation"
      schoolId
    };

    try {
      const res = await fetch(`${API_BASE}/api/teacher/cultural-events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (json.success) {
        setEventToast(`✓ Event '${newTitle}' scheduled successfully! Added to the billboard.`);
        // Reset Form
        setNewTitle("");
        setNewDate("");
        setNewDesc("");
        // Reload data
        fetchData();
      } else {
        setEventToast(`❌ Error: ${json.error || "Failed to create event."}`);
      }
    } catch (err) {
      console.error(err);
      setEventToast(`❌ Error: Network failed to publish event.`);
    }

    setTimeout(() => setEventToast(null), 4000);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Event?",
      text: "Are you sure you want to delete this event?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete",
      background: 'var(--bg-card)',
      color: 'var(--text-heading)'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/api/teacher/cultural-events/${id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire({
          title: "Deleted!",
          text: "Event has been deleted successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          background: 'var(--bg-card)',
          color: 'var(--text-heading)'
        });
        fetchData();
      } else {
        Swal.fire("Error", json.error || "Failed to delete event", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Network error while deleting event", "error");
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Completed") return ev.status === "Completed";
    // Upcoming includes Scheduled and In Preparation
    return ev.status === "Scheduled" || ev.status === "In Preparation";
  });

  return (
    <PortalLayout
      title="School Events Billboard"
      subtitle="Mr. Venkatesh R. · GHS Coimbatore · DISE: 33012345"
      avatarLetter="V"
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Event cards listing */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-2xl p-4 sm:p-6 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                <i className="fi fi-rr-party-horn text-blue-500 text-base" /> Calendar of Activities
              </h2>
              
              {/* Event toggle filters */}
              <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto max-w-full">
                {(["All", "Upcoming", "Completed"] as const).map((filterVal) => (
                  <button
                    key={filterVal}
                    onClick={() => setActiveFilter(filterVal)}
                    className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                      activeFilter === filterVal
                        ? "bg-blue-600 text-white font-extrabold"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {filterVal}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mb-1 leading-relaxed">
              Track timelines, sports qualifiers, exhibitions, and parent council summits planned for this academic year.
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {loading ? (
              <div className="glass rounded-2xl p-12 border border-slate-800 text-center text-slate-400 animate-pulse text-[11px] sm:text-xs">
                Loading school events...
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="glass rounded-2xl p-8 border border-slate-800 text-center text-slate-550 italic text-[11px] sm:text-xs">
                No events currently found under this category.
              </div>
            ) : (
              filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="glass rounded-2xl p-4 sm:p-6 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:border-slate-750 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  <div className="space-y-1.5 sm:space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
                        {ev.category}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold flex items-center gap-1">
                        <i className="fi fi-rr-calendar text-blue-400" /> {ev.date}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white leading-tight">{ev.title}</h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed max-w-xl">{ev.description}</p>
                    <div className="text-[10px] sm:text-[11px] text-slate-500 font-semibold">
                      Coordinator: <strong className="text-slate-400 font-bold">{ev.coordinator}</strong>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0 flex flex-col items-start sm:items-end gap-1.5 sm:gap-2">
                    <span className={`badge text-[9px] sm:text-[10px] px-2.5 py-1 ${
                      ev.status === "Scheduled"
                        ? "badge-blue"
                        : ev.status === "In Preparation"
                        ? "badge-yellow"
                        : "badge-green"
                    }`}>
                      {ev.status}
                    </span>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="text-[9px] sm:text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors mt-0.5 flex items-center gap-1"
                    >
                      <i className="fi fi-rr-trash" /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Event scheduler tool */}
        <div className="glass rounded-2xl p-4 sm:p-6 border border-slate-800 h-fit">
          <h2 className="text-sm sm:text-base font-semibold text-white mb-2 flex items-center gap-2">
            <i className="fi fi-rr-calendar-plus text-blue-500 text-base" /> Schedule New Activity
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed mb-4">
            Announce new sport meet dates, cultural matches, or internal exams to students, teachers, and parents portals.
          </p>

          <form onSubmit={handleAddEvent} className="space-y-4">
            <div>
              <label className="block text-[10px] sm:text-xs text-slate-400 mb-1.5 font-semibold">Event Title</label>
              <input
                type="text"
                placeholder="E.g., Chess Tournament Finals"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] sm:text-xs text-slate-400 mb-1.5 font-semibold">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="Academic">Academic</option>
                  <option value="Sports">Sports</option>
                  <option value="Cultural">Cultural</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs text-slate-400 mb-1.5 font-semibold">Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs text-white focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs text-slate-400 mb-1.5 font-semibold">Assign Coordinator Staff</label>
              <select
                value={newCoordinator}
                onChange={(e) => setNewCoordinator(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                {staffList.map((s) => (
                  <option key={s.id} value={`${s.name} (${s.subject})`}>
                    {s.name} ({s.subject})
                  </option>
                ))}
                {staffList.length === 0 && (
                  <option value="Mrs. Sumathi Devi (Math)">Mrs. Sumathi Devi (Math)</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs text-slate-400 mb-1.5 font-semibold">Brief Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="E.g., Matches to take place in main grounds. High school finals."
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[11px] sm:text-xs transition-colors"
            >
              Publish Event to Portals
            </button>
          </form>

          {eventToast && (
            <div className="mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] sm:text-xs rounded-xl leading-relaxed">
              {eventToast}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
