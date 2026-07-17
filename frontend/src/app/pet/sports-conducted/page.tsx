"use client";
import PortalLayout from "@/components/PortalLayout";
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Plus, 
  Medal, 
  Trash2, 
  Users, 
  Pencil, 
  Search, 
  Database, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  CheckCircle,
  Activity,
  X
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { ModalShell, Field, inputCls } from "@/components/pet/PetUi";
import {
  SportsEvent,
  EventLevel,
  EventKind,
  EventStatus,
  DEFAULT_EVENTS,
  EVENTS_KEY,
  petLoad,
  petSave,
  petId,
} from "@/lib/petData";
import {
  fetchSportsEvents,
  createSportsEvent,
  createSportsEventsBulk,
  updateSportsEvent,
  deleteSportsEvent,
  fetchStudents,
} from "@/lib/petSportsApi";

const LEVELS: EventLevel[] = ["Intra-School", "Inter-School", "District", "State", "National"];
const STATUSES: EventStatus[] = ["Upcoming", "Ongoing", "Completed", "Cancelled"];
const SPORT_CATEGORIES = [
  {
    label: "Outdoor Team Games",
    sports: ["Football", "Volleyball", "Kabaddi", "Kho-Kho", "Cricket", "Basketball", "Throwball", "Handball", "Ball Badminton"]
  },
  {
    label: "Track & Field",
    sports: ["Athletics", "Athletics & All Games"]
  },
  {
    label: "Racket & Indoor Games",
    sports: ["Badminton", "Table Tennis", "Chess", "Carrom"]
  },
  {
    label: "Fitness & Demonstration",
    sports: ["Yoga", "Drill / Parade"]
  },
  {
    label: "Other",
    sports: ["Other"]
  }
];
const SPORTS = SPORT_CATEGORIES.flatMap(cat => cat.sports);

export default function SportsConductedPage() {
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [source, setSource] = useState<"local" | "server">("local");
  const [loadingAction, setLoadingAction] = useState(false);
  
  // Filters
  const [tab, setTab] = useState<"All" | EventKind>("All");
  const [levelFilter, setLevelFilter] = useState<"All" | EventLevel>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | EventStatus>("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const [editing, setEditing] = useState<SportsEvent | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const loadData = async () => {
    try {
      const srvEvents = await fetchSportsEvents();
      
      // Auto-sync custom local events created while offline
      const localEvents = petLoad(EVENTS_KEY, DEFAULT_EVENTS);
      const unsynced = localEvents.filter(le => 
        !srvEvents.some(se => se.name === le.name && se.date === le.date) &&
        !le.id.startsWith("ev-")
      );

      let finalEvents = srvEvents;
      if (unsynced.length > 0) {
        console.log("Uploading unsynced offline events to database:", unsynced);
        try {
          const synced = await createSportsEventsBulk(unsynced.map(({ id, ...rest }) => rest));
          finalEvents = [...synced, ...srvEvents];
        } catch (syncErr) {
          console.error("Failed to sync offline events to database:", syncErr);
        }
      }

      setEvents(finalEvents);
      petSave(EVENTS_KEY, finalEvents);
      setSource("server");
    } catch (err) {
      console.warn("Falling back to local storage:", err);
      setEvents(petLoad(EVENTS_KEY, DEFAULT_EVENTS));
      setSource("local");
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (ev: SportsEvent, studentIds?: string[]) => {
    setLoadingAction(true);
    try {
      if (editing) {
        if (source === "server") {
          const updated = await updateSportsEvent(ev);
          const next = events.map((e) => (e.id === ev.id ? updated : e));
          setEvents(next);
          petSave(EVENTS_KEY, next);
        } else {
          const next = events.map((e) => (e.id === ev.id ? ev : e));
          setEvents(next);
          petSave(EVENTS_KEY, next);
        }
      } else {
        if (source === "server") {
          const { id, ...rest } = ev; // strip client temporary id
          const created = await createSportsEvent({ ...rest, studentIds } as any);
          const next = [created, ...events];
          setEvents(next);
          petSave(EVENTS_KEY, next);
        } else {
          const next = [{ ...ev, id: petId() }, ...events];
          setEvents(next);
          petSave(EVENTS_KEY, next);
        }
      }
      setShowAdd(false);
      setEditing(null);
    } catch (err) {
      alert(`Could not save changes to the database: ${err instanceof Error ? err.message : "request failed"}.`);
    } finally {
      setLoadingAction(false);
    }
  };

  const removeEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event from the log?")) return;
    setLoadingAction(true);
    try {
      if (source === "server") {
        await deleteSportsEvent(id);
      }
      const next = events.filter((e) => e.id !== id);
      setEvents(next);
      petSave(EVENTS_KEY, next);
    } catch (err) {
      alert(`Could not delete the event from the database: ${err instanceof Error ? err.message : "request failed"}.`);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleImportDefaults = async () => {
    if (events.length > 0 && !confirm("Import the default TN school sports calendar? Existing events will be kept.")) return;
    setLoadingAction(true);
    try {
      if (source === "server") {
        const cleaned = DEFAULT_EVENTS.map(({ id, ...rest }) => rest);
        const created = await createSportsEventsBulk(cleaned);
        const next = [...created, ...events];
        setEvents(next);
        petSave(EVENTS_KEY, next);
      } else {
        const next = [...DEFAULT_EVENTS, ...events];
        setEvents(next);
        petSave(EVENTS_KEY, next);
      }
    } catch (err) {
      alert(`Could not import defaults: ${err instanceof Error ? err.message : "request failed"}.`);
    } finally {
      setLoadingAction(false);
    }
  };

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [tab, levelFilter, statusFilter, searchQuery]);

  // Derived filtered events
  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => tab === "All" || e.kind === tab)
      .filter((e) => levelFilter === "All" || e.level === levelFilter)
      .filter((e) => statusFilter === "All" || e.status === statusFilter)
      .filter((e) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          e.name.toLowerCase().includes(query) ||
          e.sport.toLowerCase().includes(query) ||
          e.venue.toLowerCase().includes(query) ||
          (e.result && e.result.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date)); // Sort latest events first
  }, [events, tab, levelFilter, statusFilter, searchQuery]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / itemsPerPage));
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(start, start + itemsPerPage);
  }, [filteredEvents, currentPage]);

  // Participants per level, computed from real data (not random numbers)
  const levelStats = useMemo(() => {
    const map = new Map<EventLevel, number>();
    LEVELS.forEach((l) => map.set(l, 0));
    events.forEach((e) => {
      if (e.status !== "Cancelled") map.set(e.level, (map.get(e.level) || 0) + e.participants);
    });
    return map;
  }, [events]);

  const upcoming = events.filter((e) => e.status === "Upcoming").length;
  const completed = events.filter((e) => e.status === "Completed").length;

  return (
    <PortalLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-black text-[var(--text-heading)] tracking-tight">Sports Events & Competitions</h1>
              
              {/* Dynamic Connection Indicator */}
              {loaded && (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm ${
                  source === "server" 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
                    : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${source === "server" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                  <Database size={12} className="opacity-80" />
                  {source === "server" ? "Cloud Sync Active" : "Local Storage Fallback"}
                </div>
              )}
            </div>
            <p className="text-sm text-[var(--text-muted)] font-semibold">
              School games calendar, competition results and participation — {upcoming} upcoming · {completed} completed
            </p>
          </div>
          <div className="flex items-center gap-2">
            {events.length === 0 && loaded && (
              <button
                onClick={handleImportDefaults}
                disabled={loadingAction}
                className="px-4 py-2 border border-slate-300 hover:border-blue-500 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                <RefreshCw size={14} className={loadingAction ? "animate-spin" : ""} /> Seed default calendar
              </button>
            )}
            <button
              onClick={() => setShowAdd(true)}
              disabled={loadingAction}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 disabled:opacity-50"
            >
              <Plus size={16} /> Log New Event
            </button>
          </div>
        </div>

        {/* Level Stats Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {LEVELS.map((level) => (
            <div 
              key={level} 
              className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border)] transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between"
            >
              <div>
                <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-1">{level}</div>
                <div className="text-3xl font-black text-[var(--text-heading)] tracking-tight">
                  {levelStats.get(level) || 0}
                </div>
              </div>
              <div className="text-[10px] text-[var(--text-muted)] mt-2 font-bold flex items-center gap-1">
                <Users size={12} className="opacity-75" /> Total participants
              </div>
            </div>
          ))}
        </div>

        {/* Filter & Search Bar Container */}
        <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border)] flex flex-col gap-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">
            
            {/* Kind Filters */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl gap-1 shrink-0">
              {(["All", "Event", "Competition"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 lg:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    tab === t
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-[var(--text-muted)] hover:text-blue-500"
                  }`}
                >
                  {t === "All" ? "All" : t === "Event" ? "Sports Events" : "Competitions"}
                </button>
              ))}
            </div>

            {/* Controls Right Section */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center w-full lg:w-auto">
              
              {/* Search Bar */}
              <div className="relative flex-1 md:w-64">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search events, sports, results..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs font-semibold rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-heading)] placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                />
              </div>

              {/* Select Level */}
              <select 
                value={levelFilter} 
                onChange={(e) => setLevelFilter(e.target.value as any)} 
                className="px-3.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-xs font-bold focus:outline-none focus:border-blue-500 text-[var(--text-heading)]"
              >
                <option value="All">All Levels</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>

              {/* Select Status */}
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as any)} 
                className="px-3.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-xs font-bold focus:outline-none focus:border-blue-500 text-[var(--text-heading)]"
              >
                <option value="All">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Main Events List */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
          
          {/* Header */}
          <div className="p-4 border-b border-[var(--border)] bg-slate-50/50 dark:bg-slate-800/40 font-bold text-[var(--text-heading)] flex justify-between items-center flex-wrap gap-2 text-sm">
            <span>Event Log ({filteredEvents.length})</span>
            {filteredEvents.length > 0 && (
              <span className="text-xs text-[var(--text-muted)] font-semibold">
                Showing {Math.min(filteredEvents.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(filteredEvents.length, currentPage * itemsPerPage)} of {filteredEvents.length}
              </span>
            )}
          </div>

          {/* List Contents */}
          <div className="divide-y divide-[var(--border)]">
            
            {paginatedEvents.map((ev) => (
              <div 
                key={ev.id} 
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors duration-200"
              >
                <div className="flex items-start gap-4 min-w-0">
                  
                  {/* Status Indicator Icon */}
                  <div
                    className={`p-3 rounded-xl shrink-0 transition-transform ${
                      ev.status === "Completed"
                        ? "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400"
                        : ev.status === "Cancelled"
                        ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                        : ev.status === "Ongoing"
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
                        : "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                    }`}
                  >
                    <Trophy size={18} />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-[var(--text-heading)] text-sm tracking-tight">{ev.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase ${
                        ev.kind === "Competition"
                          ? "bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/40"
                          : "bg-sky-50 text-sky-600 border border-sky-200 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/40"
                      }`}>
                        {ev.kind}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase ${
                        ev.status === "Completed"
                          ? "bg-green-50 text-green-600 border border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/40"
                          : ev.status === "Cancelled"
                          ? "bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/80"
                          : ev.status === "Ongoing"
                          ? "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/40"
                          : "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40"
                      }`}>
                        {ev.status}
                      </span>
                      {ev.targetClasses && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50">
                          {ev.targetClasses}
                        </span>
                      )}
                      {ev.ageGroup && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50">
                          {ev.ageGroup}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-x-3.5 gap-y-1.5 text-xs text-[var(--text-muted)] font-bold flex-wrap">
                      <span className="flex items-center gap-1"><Medal size={12} className="opacity-75" /> {ev.sport}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} className="opacity-75" /> {ev.level} · {ev.venue}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} className="opacity-75" /> {ev.date}</span>
                    </div>

                    {ev.result && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                        <Trophy size={11} />
                        Result: {ev.result}
                      </div>
                    )}
                    {ev.notes && <div className="text-xs text-[var(--text-muted)] leading-relaxed italic opacity-85">{ev.notes}</div>}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 border-t md:border-t-0 border-[var(--border)] pt-3.5 md:pt-0">
                  <div className="text-left md:text-right">
                    <div className="text-xl font-black text-[var(--text-heading)] flex items-center gap-1 justify-start md:justify-end tracking-tight">
                      <Users size={14} className="text-[var(--text-muted)] opacity-75" /> {ev.participants}
                    </div>
                    <div className="text-[9px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">Students</div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setEditing(ev)} 
                      disabled={loadingAction}
                      className="p-2 rounded-xl text-[var(--text-muted)] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-[var(--border)] transition-colors disabled:opacity-50" 
                      title="Edit / Update Result"
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      onClick={() => removeEvent(ev.id)} 
                      disabled={loadingAction}
                      className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/25 border border-[var(--border)] transition-colors disabled:opacity-50" 
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {loaded && paginatedEvents.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                <AlertTriangle size={36} className="text-slate-350 dark:text-slate-650" />
                <h4 className="font-extrabold text-[var(--text-heading)]">No events match the current filter.</h4>
                <p className="text-xs text-[var(--text-muted)] font-bold max-w-md">
                  Try adjusting your search query, or clear some filters to discover the sports event calendar.
                </p>
                {events.length === 0 && (
                  <button 
                    onClick={handleImportDefaults}
                    disabled={loadingAction}
                    className="mt-2 px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-[var(--border)] rounded-xl transition-all"
                  >
                    Import standard TN School calendar
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {filteredEvents.length > itemsPerPage && (
            <div className="p-4 border-t border-[var(--border)] bg-slate-50/25 dark:bg-slate-800/20 flex items-center justify-between flex-wrap gap-3">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loadingAction}
                className="px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs font-bold flex items-center gap-1 text-[var(--text-heading)] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={14} /> Previous
              </button>

              {/* Page indicators */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-7.5 h-7.5 text-xs font-extrabold rounded-lg border transition-all ${
                      currentPage === p
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "border-[var(--border)] text-[var(--text-muted)] hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loadingAction}
                className="px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs font-bold flex items-center gap-1 text-[var(--text-heading)] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Log/Edit Event Modal */}
      {(showAdd || editing) && (
        <EventModal
          initial={editing}
          onClose={() => {
            setShowAdd(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}
    </PortalLayout>
  );
}

function EventModal({
  initial,
  onClose,
  onSave,
}: {
  initial: SportsEvent | null;
  onClose: () => void;
  onSave: (ev: SportsEvent, studentIds?: string[]) => void;
}) {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [activeClassTab, setActiveClassTab] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name || "");
  const [kind, setKind] = useState<EventKind>(initial?.kind || "Competition");
  const [sport, setSport] = useState(initial?.sport || "Athletics");
  const [level, setLevel] = useState<EventLevel>(initial?.level || "Intra-School");
  const [date, setDate] = useState(initial?.date || new Date().toISOString().slice(0, 10));
  const [venue, setVenue] = useState(initial?.venue || "");
  const [participants, setParticipants] = useState(initial?.participants || 0);
  const [status, setStatus] = useState<EventStatus>(initial?.status || "Upcoming");
  const [result, setResult] = useState(initial?.result || "");
  const [notes, setNotes] = useState(initial?.notes || "");
  
  // Section/standards and age category fields
  const [targetClasses, setTargetClasses] = useState(initial?.targetClasses || "All Classes");
  const [ageGroup, setAgeGroup] = useState(initial?.ageGroup || "Open");

  useEffect(() => {
    if (schoolId) {
      fetchStudents(schoolId)
        .then(setAllStudents)
        .catch(err => console.error("Error loading students:", err));
    }
  }, [schoolId]);

  const studentsInActiveClass = useMemo(() => {
    if (!activeClassTab) return [];
    return allStudents.filter(s => {
      const clsStr = String(s.class).trim();
      return clsStr === activeClassTab || clsStr === `0${activeClassTab}`;
    });
  }, [allStudents, activeClassTab]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalNotes = notes;
    if (selectedStudentIds.length > 0) {
      const names = selectedStudentIds
        .map(id => allStudents.find(s => s.id === id))
        .filter(Boolean)
        .map(s => `${s.user.name} (${s.class}-${s.section})`)
        .join(", ");
      finalNotes = (notes ? notes + "\n\n" : "") + `Participating Students: ${names}`;
    }

    onSave({
      id: initial?.id || "",
      name, 
      kind, 
      sport, 
      level, 
      date, 
      venue, 
      participants: participants || selectedStudentIds.length, 
      status,
      result: result || undefined,
      notes: finalNotes || undefined,
      targetClasses,
      ageGroup,
    }, selectedStudentIds.length > 0 ? selectedStudentIds : undefined);
  };

  return (
    <ModalShell title={initial ? "Update Event" : "Log New Event"} onClose={onClose} wide={true}>
      <form onSubmit={submit} className="space-y-4">
        
        <Field label="Event / Competition Name">
          <input 
            required 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. District Kabaddi Championship" 
            className={inputCls} 
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Type">
            <select value={kind} onChange={(e) => setKind(e.target.value as EventKind)} className={inputCls}>
              <option value="Event">Sports Event</option>
              <option value="Competition">Competition</option>
            </select>
          </Field>
          
          <Field label="Sport / Discipline">
            <select value={sport} onChange={(e) => setSport(e.target.value)} className={inputCls}>
              {SPORT_CATEGORIES.map((cat) => (
                <optgroup key={cat.label} label={cat.label}>
                  {cat.sports.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Level">
            <select value={level} onChange={(e) => setLevel(e.target.value as EventLevel)} className={inputCls}>
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </Field>
          
          <Field label="Date">
            <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Eligible Standards (Target)">
            <select value={targetClasses} onChange={(e) => setTargetClasses(e.target.value)} className={inputCls}>
              <option value="All Classes">All Classes (General)</option>
              <option value="Class 6-8">Class 6-8 (Middle School)</option>
              <option value="Class 9-10">Class 9-10 (High School)</option>
              <option value="Class 11-12">Class 11-12 (Higher Secondary)</option>
            </select>
          </Field>
          
          <Field label="Eligibility / Age Group">
            <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className={inputCls}>
              <option value="Open">Open (All Ages)</option>
              <option value="Under-14">Under-14 (Sub-Junior)</option>
              <option value="Under-17">Under-17 (Junior)</option>
              <option value="Under-19">Under-19 (Senior)</option>
            </select>
          </Field>
        </div>

        <Field label="Venue">
          <input 
            required 
            value={venue} 
            onChange={(e) => setVenue(e.target.value)} 
            placeholder="e.g. School Main Ground" 
            className={inputCls} 
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Participants">
            <input 
              required 
              type="number" 
              min={0} 
              value={participants} 
              onChange={(e) => setParticipants(Number(e.target.value))} 
              className={inputCls} 
            />
          </Field>
          
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as EventStatus)} className={inputCls}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Result / Medals (optional)">
          <input 
            value={result} 
            onChange={(e) => setResult(e.target.value)} 
            placeholder="e.g. 2 Gold, 1 Silver — District Champions" 
            className={inputCls} 
          />
        </Field>

        {/* Student Search & Multi-Select by Class */}
        <Field label="Select Participating Students (Optional)">
          <div className="space-y-3">
            {/* Class Pill Selectors */}
            <div className="flex flex-wrap gap-2">
              {["6", "7", "8", "9", "10", "11", "12"].map((clsNum) => {
                const isActive = activeClassTab === clsNum;
                const count = allStudents.filter(s => {
                  const c = String(s.class).trim();
                  return c === clsNum || c === `0${clsNum}`;
                }).length;

                return (
                  <button
                    key={clsNum}
                    type="button"
                    onClick={() => setActiveClassTab(isActive ? null : clsNum)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600 shadow-blue-500/10"
                        : "bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-muted)] hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    Class {clsNum}
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                      isActive ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-850 text-[var(--text-muted)]"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Students List in Active Class */}
            {activeClassTab && (
              <div className="border border-[var(--border)] rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/10 max-h-52 overflow-y-auto space-y-2 transition-all">
                <div className="text-xs text-[var(--text-muted)] font-bold mb-2 flex justify-between items-center">
                  <span>Students in Class {activeClassTab}:</span>
                  <button 
                    type="button" 
                    onClick={() => setActiveClassTab(null)}
                    className="text-[var(--text-muted)] hover:text-red-500 font-bold"
                  >
                    Close Roster
                  </button>
                </div>
                {studentsInActiveClass.length === 0 ? (
                  <div className="text-xs text-[var(--text-muted)] italic p-2">
                    No students registered in Class {activeClassTab}.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {studentsInActiveClass.map((student) => {
                      const isChecked = selectedStudentIds.includes(student.id);
                      return (
                        <label
                          key={student.id}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-850 ${
                            isChecked
                              ? "bg-blue-50/40 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-450 dark:border-blue-900/50"
                              : "bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-main)]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedStudentIds(prev => prev.filter(id => id !== student.id));
                              } else {
                                setSelectedStudentIds(prev => [...prev, student.id]);
                              }
                            }}
                            className="w-3.5 h-3.5 rounded text-blue-600 border-slate-350 focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="truncate">{student.user.name}</p>
                            <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase">Section {student.section} · Roll {student.rollNumber}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Selected Students Badges */}
            {selectedStudentIds.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs text-[var(--text-muted)] font-bold">
                  Selected Athletes ({selectedStudentIds.length}):
                </div>
                <div className="flex flex-wrap gap-1.5 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-[var(--border)] max-h-28 overflow-y-auto">
                  {selectedStudentIds.map(id => {
                    const s = allStudents.find(x => x.id === id);
                    if (!s) return null;
                    return (
                      <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50 shadow-sm transition-all">
                        {s.user.name} (Class {s.class}-{s.section})
                        <button
                          type="button"
                          onClick={() => setSelectedStudentIds(prev => prev.filter(x => x !== id))}
                          className="hover:text-red-500 hover:scale-110 transition-all ml-0.5"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Field>

        <Field label="Notes (optional)">
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
        </Field>

        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transition-colors">
          {initial ? "Save Changes" : "Add to Event Log"}
        </button>
      </form>
    </ModalShell>
  );
}
