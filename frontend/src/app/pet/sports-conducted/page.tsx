"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import PETPortalBanner from "@/components/PETPortalBanner";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
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
  X,
  Filter,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
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
  clearAllSportsEvents,
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

const LEVEL_GRADIENTS: Record<EventLevel, string> = {
  "Intra-School": "from-blue-500 to-indigo-600",
  "Inter-School": "from-cyan-500 to-blue-600",
  "District": "from-violet-500 to-purple-600",
  "State": "from-amber-500 to-orange-600",
  "National": "from-rose-500 to-pink-600",
};

export default function SportsConductedPage() {
  const { lang } = usePortalLanguage();
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
  const itemsPerPage = 10;

  const [editing, setEditing] = useState<SportsEvent | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);

  const persist = (next: SportsEvent[]) => {
    setEvents(next);
    petSave(EVENTS_KEY, next);
  };

  const loadData = async () => {
    try {
      const srvEvents = await fetchSportsEvents();
      if (srvEvents && srvEvents.length > 0) {
        setEvents(srvEvents);
        petSave(EVENTS_KEY, srvEvents);
        setSource("server");
      } else {
        const local = petLoad<SportsEvent[]>(EVENTS_KEY, []);
        setEvents(local);
        setSource("local");
      }
    } catch (err) {
      console.warn("Falling back to local storage:", err);
      setEvents(petLoad<SportsEvent[]>(EVENTS_KEY, []));
      setSource("local");
    } finally {
      setLoaded(true);
    }
  };

  const executeClearAll = async () => {
    setLoadingAction(true);
    try {
      persist([]);
      if (source === "server") {
        try {
          await clearAllSportsEvents();
        } catch (err) {
          console.warn("Could not clear events on server API:", err);
        }
      }
    } finally {
      setLoadingAction(false);
      setShowClearConfirm(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (ev: SportsEvent, studentIds?: string[]) => {
    setLoadingAction(true);
    try {
      if (editing) {
        // Optimistic UI update
        const next = events.map((e) => (e.id === ev.id ? ev : e));
        persist(next);
        if (source === "server") {
          try {
            await updateSportsEvent(ev);
          } catch (err) {
            console.warn("Could not sync event update to server API:", err);
          }
        }
      } else {
        const tempId = ev.id || petId();
        const newEv = { ...ev, id: tempId };
        const next = [newEv, ...events];
        persist(next);
        if (source === "server") {
          try {
            const { id, ...rest } = ev;
            const created = await createSportsEvent({ ...rest, studentIds } as any);
            persist([created, ...events.filter((e) => e.id !== tempId)]);
          } catch (err) {
            console.warn("Could not sync created event to server API:", err);
          }
        }
      }
      setShowAdd(false);
      setEditing(null);
    } finally {
      setLoadingAction(false);
    }
  };

  const removeEvent = async (id: string) => {
    setLoadingAction(true);
    try {
      const next = events.filter((e) => e.id !== id);
      persist(next);
      if (source === "server") {
        try {
          await deleteSportsEvent(id);
        } catch (err) {
          console.warn("Could not delete event from server API:", err);
        }
      }
      setDeletingId(null);
    } finally {
      setLoadingAction(false);
    }
  };

  const executeImportDefaults = async () => {
    setShowSeedConfirm(false);
    setLoadingAction(true);
    try {
      const next = [...DEFAULT_EVENTS, ...events];
      persist(next);
      if (source === "server") {
        try {
          const cleaned = DEFAULT_EVENTS.map(({ id, ...rest }) => rest);
          await createSportsEventsBulk(cleaned);
        } catch (err) {
          console.warn("Could not bulk sync defaults to server API:", err);
        }
      }
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
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [events, tab, levelFilter, statusFilter, searchQuery]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / itemsPerPage));
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(start, start + itemsPerPage);
  }, [filteredEvents, currentPage]);

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
      <div className="p-4 sm:p-6 w-full space-y-6 text-slate-800 dark:text-slate-100">
        
        {/* ── Top Hero Header Banner ──────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/20">
                  <Trophy size={20} />
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Sports Events & Competitions
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
                School sports calendar, tournament results, eligible standards, and student athlete registrations ({upcoming} upcoming · {completed} completed).
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {events.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  disabled={loadingAction}
                  className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  title="Clear all events to start with a blank calendar"
                >
                  <Trash2 size={14} className="text-rose-400" /> Clear Events
                </button>
              )}
              <button
                onClick={() => setShowAdd(true)}
                disabled={loadingAction}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <Plus size={16} /> Log New Event
              </button>
            </div>
          </div>
        </div>

        {/* ── Level Participation Metric Grid ──────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {LEVELS.map((level) => (
            <div 
              key={level} 
              className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${LEVEL_GRADIENTS[level]}`} />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{level}</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                  {levelStats.get(level) || 0}
                </div>
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Users size={12} className="text-blue-500" /> Total Athletes
              </div>
            </div>
          ))}
        </div>

        {/* ── Controls, Search & Filter Bar ────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-4">
          
          {/* Kind Segmented Tabs */}
          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
            {(["All", "Event", "Competition"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  tab === t
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {t === "All" ? "All Types" : t === "Event" ? "Sports Events" : "Competitions"}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search event name, sport, venue, or medals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400 hidden sm:block" />
            <select 
              value={levelFilter} 
              onChange={(e) => setLevelFilter(e.target.value as any)} 
              className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
            >
              <option value="All">All Levels</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as any)} 
              className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
            >
              <option value="All">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Main Events Log List ────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between font-bold text-xs">
            <span className="uppercase tracking-wider text-slate-400">
              Sports Calendar Log ({filteredEvents.length} Events)
            </span>
            {filteredEvents.length > 0 && (
              <span className="text-slate-500">
                Showing {Math.min(filteredEvents.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(filteredEvents.length, currentPage * itemsPerPage)} of {filteredEvents.length}
              </span>
            )}
          </div>

          {/* List Items */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {paginatedEvents.map((ev) => (
              <div 
                key={ev.id} 
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all group"
              >
                <div className="flex items-start gap-4 min-w-0">
                  
                  {/* Status Trophy Badge */}
                  <div
                    className={`p-3.5 rounded-2xl shrink-0 transition-all ${
                      ev.status === "Completed"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : ev.status === "Cancelled"
                        ? "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                        : ev.status === "Ongoing"
                        ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                        : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    }`}
                  >
                    <Trophy size={20} />
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {ev.name}
                      </h3>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        ev.kind === "Competition"
                          ? "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400"
                          : "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400"
                      }`}>
                        {ev.kind}
                      </span>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        ev.status === "Completed"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : ev.status === "Cancelled"
                          ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          : ev.status === "Ongoing"
                          ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}>
                        {ev.status}
                      </span>

                      {ev.targetClasses && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:text-blue-400">
                          {ev.targetClasses}
                        </span>
                      )}

                      {ev.ageGroup && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:text-rose-400">
                          {ev.ageGroup}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
                      <span className="flex items-center gap-1.5"><Medal size={13} className="text-blue-500" /> {ev.sport}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={13} className="text-violet-500" /> {ev.level} · {ev.venue}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={13} className="text-emerald-500" /> {ev.date}</span>
                    </div>

                    {ev.result && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <Trophy size={12} />
                        Result: {ev.result}
                      </div>
                    )}
                    {ev.notes && <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2">{ev.notes}</p>}
                  </div>
                </div>

                {/* Right side stats & actions */}
                <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left md:text-right space-y-0.5">
                    <div className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5 justify-start md:justify-end">
                      <Users size={15} className="text-slate-400" /> {ev.participants}
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Athletes</div>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setEditing(ev)} 
                      disabled={loadingAction}
                      className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50" 
                      title="Edit Event"
                    >
                      <Pencil size={15} />
                    </button>
                    <button 
                      onClick={() => setDeletingId(ev.id)} 
                      disabled={loadingAction}
                      className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-50" 
                      title="Delete Event"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {loaded && paginatedEvents.length === 0 && (
              <div className="p-12 text-center space-y-3">
                <Trophy size={36} className="mx-auto text-slate-400" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">No sports events recorded yet.</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Log your school sports competitions, tournaments, and events manually.
                </p>
                <button 
                  onClick={() => setShowAdd(true)}
                  disabled={loadingAction}
                  className="mt-2 px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-sm inline-flex items-center gap-2"
                >
                  <Plus size={14} /> Log New Event
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredEvents.length > itemsPerPage && (
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between flex-wrap gap-3">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loadingAction}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 transition-all shadow-sm"
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-7.5 h-7.5 text-xs font-bold rounded-xl border transition-all ${
                      currentPage === p
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loadingAction}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 transition-all shadow-sm"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-4">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle size={28} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Event Log</h3>
              <p className="text-xs text-slate-500">Are you sure you want to delete this event log from the calendar?</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                disabled={loadingAction}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => removeEvent(deletingId)}
                disabled={loadingAction}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-colors flex items-center justify-center gap-2"
              >
                {loadingAction ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-4">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 size={28} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Clear All Events</h3>
              <p className="text-xs text-slate-500">Are you sure you want to clear all events from the calendar? You can re-seed standard events anytime.</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                disabled={loadingAction}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeClearAll}
                disabled={loadingAction}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-colors flex items-center justify-center gap-2"
              >
                {loadingAction ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />} Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seed Calendar Confirmation Modal */}
      {showSeedConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-4">
            <div className="w-14 h-14 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
              <Database size={28} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Seed Standard Calendar</h3>
              <p className="text-xs text-slate-500">This will add the standard Tamil Nadu school sports calendar events alongside your existing events. Proceed?</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSeedConfirm(false)}
                disabled={loadingAction}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeImportDefaults}
                disabled={loadingAction}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors flex items-center justify-center gap-2"
              >
                {loadingAction ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} />} Seed Events
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log/Edit Event Modal */}
      {(showAdd || editing) && (
        <EventModal
          initial={editing}
          isLoading={loadingAction}
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
  isLoading,
  onClose,
  onSave,
}: {
  initial: SportsEvent | null;
  isLoading?: boolean;
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
    <ModalShell title={initial ? "Update Sports Event Log" : "Log New Sports Event"} onClose={onClose} wide={true}>
      <form onSubmit={submit} className="space-y-4 text-xs">
        
        <Field label="Event / Competition Name">
          <input 
            required 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Zonal Athletics Meet 2026" 
            className={inputCls} 
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
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

        <div className="grid grid-cols-2 gap-3">
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

        <div className="grid grid-cols-2 gap-3">
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
              <option value="Under-17">Junior (Under-17)</option>
              <option value="Under-19">Senior (Under-19)</option>
            </select>
          </Field>
        </div>

        <Field label="Venue">
          <input 
            required 
            value={venue} 
            onChange={(e) => setVenue(e.target.value)} 
            placeholder="e.g. SDAT Stadium, District Main Field" 
            className={inputCls} 
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Participants (Athletes Count)">
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

        {/* Student Selection */}
        <Field label="Map Participating Students from Class Roster (Optional)">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
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
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Class {clsNum}
                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${
                      isActive ? "bg-blue-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {activeClassTab && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-3 bg-slate-50/50 dark:bg-slate-800/40 max-h-48 overflow-y-auto space-y-2">
                <div className="text-[11px] font-bold text-slate-500 flex justify-between items-center">
                  <span>Students in Class {activeClassTab}:</span>
                  <button type="button" onClick={() => setActiveClassTab(null)} className="text-slate-400 hover:text-rose-500 font-bold">
                    Close Roster
                  </button>
                </div>
                {studentsInActiveClass.length === 0 ? (
                  <div className="text-xs text-slate-400 italic p-1">No students found in Class {activeClassTab}.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {studentsInActiveClass.map((student) => {
                      const isChecked = selectedStudentIds.includes(student.id);
                      return (
                        <label
                          key={student.id}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                            isChecked
                              ? "bg-blue-50 dark:bg-blue-900/30 border-blue-400 text-blue-700 dark:text-blue-300"
                              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
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
                            className="w-3.5 h-3.5 rounded text-blue-600"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-bold">{student.user.name}</p>
                            <p className="text-[9px] text-slate-400">Sec {student.section} · Roll {student.rollNumber}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {selectedStudentIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                {selectedStudentIds.map(id => {
                  const s = allStudents.find(x => x.id === id);
                  if (!s) return null;
                  return (
                    <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:text-blue-400">
                      {s.user.name} (Class {s.class}-{s.section})
                      <button
                        type="button"
                        onClick={() => setSelectedStudentIds(prev => prev.filter(x => x !== id))}
                        className="hover:text-rose-500"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </Field>

        <Field label="Notes (optional)">
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} placeholder="Additional tournament details..." />
        </Field>

        <button type="submit" disabled={isLoading} className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {isLoading ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : (initial ? "Save Changes" : "Log Event")}
        </button>
      </form>
    </ModalShell>
  );
}
