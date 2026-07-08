"use client";
import PortalLayout from "@/components/PortalLayout";
import { Trophy, Calendar, MapPin, Plus, Medal, Trash2, Users, Pencil } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
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

const LEVELS: EventLevel[] = ["School", "Zonal", "District", "Division", "State", "National"];
const STATUSES: EventStatus[] = ["Upcoming", "Ongoing", "Completed", "Cancelled"];
const SPORTS = [
  "Athletics", "Football", "Volleyball", "Kabaddi", "Kho-Kho", "Cricket", "Basketball",
  "Throwball", "Handball", "Ball Badminton", "Badminton", "Table Tennis", "Chess",
  "Carrom", "Yoga", "Drill / Parade", "Athletics & All Games", "Other",
];

export default function SportsConductedPage() {
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<"All" | EventKind>("All");
  const [levelFilter, setLevelFilter] = useState<"All" | EventLevel>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | EventStatus>("All");
  const [editing, setEditing] = useState<SportsEvent | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    setEvents(petLoad(EVENTS_KEY, DEFAULT_EVENTS));
    setLoaded(true);
  }, []);

  const save = (next: SportsEvent[]) => {
    setEvents(next);
    petSave(EVENTS_KEY, next);
  };

  const filtered = useMemo(
    () =>
      events
        .filter((e) => tab === "All" || e.kind === tab)
        .filter((e) => levelFilter === "All" || e.level === levelFilter)
        .filter((e) => statusFilter === "All" || e.status === statusFilter)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [events, tab, levelFilter, statusFilter]
  );

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

  const removeEvent = (id: string) => {
    if (confirm("Delete this event from the log?")) save(events.filter((e) => e.id !== id));
  };

  return (
    <PortalLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-heading)]">Sports Events & Competitions</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              School games calendar, competition results and participation — {upcoming} upcoming · {completed} completed
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
          >
            <Plus size={16} /> Log New Event
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {LEVELS.map((level) => (
            <div key={level} className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border)] text-center">
              <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-1">{level}</div>
              <div className="text-2xl font-black text-[var(--text-heading)]">{levelStats.get(level) || 0}</div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">participants</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="flex gap-2">
            {(["All", "Event", "Competition"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  tab === t
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border)] hover:border-blue-400"
                }`}
              >
                {t === "All" ? "All" : t === "Event" ? "Sports Events" : "Competitions"}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value as any)} className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-xs font-semibold focus:outline-none">
              <option value="All">All Levels</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-xs font-semibold focus:outline-none">
              <option value="All">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-slate-50 dark:bg-slate-800/50 font-bold text-[var(--text-heading)]">
            Event Log ({filtered.length})
          </div>
          <div className="divide-y divide-[var(--border-light)]">
            {filtered.map((ev) => (
              <div key={ev.id} className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                <div className="flex items-start gap-4 min-w-0">
                  <div
                    className={`p-3 rounded-xl shrink-0 ${
                      ev.status === "Completed"
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                        : ev.status === "Cancelled"
                        ? "bg-slate-100 text-slate-400 dark:bg-slate-800"
                        : ev.status === "Ongoing"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                        : "bg-amber-100 text-amber-600 dark:bg-amber-900/30"
                    }`}
                  >
                    <Trophy size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-[var(--text-heading)]">{ev.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ev.kind === "Competition"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
                      }`}>
                        {ev.kind}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ev.status === "Completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : ev.status === "Cancelled"
                          ? "bg-slate-100 text-slate-500 dark:bg-slate-800"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {ev.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--text-muted)] font-semibold flex-wrap">
                      <span className="flex items-center gap-1"><Medal size={12} /> {ev.sport}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> {ev.level} · {ev.venue}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {ev.date}</span>
                    </div>
                    {ev.result && (
                      <div className="mt-1.5 text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                        <Trophy size={12} /> Result: {ev.result}
                      </div>
                    )}
                    {ev.notes && <div className="mt-1 text-xs text-[var(--text-muted)]">{ev.notes}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xl font-black text-[var(--text-heading)] flex items-center gap-1 justify-end">
                      <Users size={14} className="text-[var(--text-muted)]" /> {ev.participants}
                    </div>
                    <div className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider">Students</div>
                  </div>
                  <button onClick={() => setEditing(ev)} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" title="Edit / update result">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => removeEvent(ev.id)} className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
            {loaded && filtered.length === 0 && (
              <div className="p-10 text-center text-[var(--text-muted)]">No events match the current filter.</div>
            )}
          </div>
        </div>
      </div>

      {(showAdd || editing) && (
        <EventModal
          initial={editing}
          onClose={() => {
            setShowAdd(false);
            setEditing(null);
          }}
          onSave={(ev) => {
            if (editing) save(events.map((e) => (e.id === ev.id ? ev : e)));
            else save([{ ...ev, id: petId() }, ...events]);
            setShowAdd(false);
            setEditing(null);
          }}
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
  onSave: (ev: SportsEvent) => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [kind, setKind] = useState<EventKind>(initial?.kind || "Competition");
  const [sport, setSport] = useState(initial?.sport || "Athletics");
  const [level, setLevel] = useState<EventLevel>(initial?.level || "School");
  const [date, setDate] = useState(initial?.date || new Date().toISOString().slice(0, 10));
  const [venue, setVenue] = useState(initial?.venue || "");
  const [participants, setParticipants] = useState(initial?.participants || 0);
  const [status, setStatus] = useState<EventStatus>(initial?.status || "Upcoming");
  const [result, setResult] = useState(initial?.result || "");
  const [notes, setNotes] = useState(initial?.notes || "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initial?.id || "",
      name, kind, sport, level, date, venue, participants, status,
      result: result || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <ModalShell title={initial ? "Update Event" : "Log New Event"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Event / Competition Name">
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. District Kabaddi Championship" className={inputCls} />
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
              {SPORTS.map((s) => (
                <option key={s} value={s}>{s}</option>
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
        <Field label="Venue">
          <input required value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. School Main Ground" className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Participants">
            <input required type="number" min={0} value={participants} onChange={(e) => setParticipants(Number(e.target.value))} className={inputCls} />
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
          <input value={result} onChange={(e) => setResult(e.target.value)} placeholder="e.g. 2 Gold, 1 Silver — District Champions" className={inputCls} />
        </Field>
        <Field label="Notes (optional)">
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
        </Field>
        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
          {initial ? "Save Changes" : "Add to Event Log"}
        </button>
      </form>
    </ModalShell>
  );
}
