"use client";
import PortalLayout from "@/components/PortalLayout";
import { Users, Tent, Plus, MapPin, Search, UserPlus, Trash2, WifiOff, Clock, Landmark } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { ModalShell, Field, inputCls } from "@/components/pet/PetUi";
import {
  PET_API_BASE,
  petLoad,
  petSave,
  petId,
  LocalClub,
  LOCAL_CLUBS_KEY,
  DEFAULT_LOCAL_CLUBS,
  LOCAL_STUDENT_ROSTER,
  SCHOOL_UNITS,
} from "@/lib/petData";

// ---------------------------------------------------------------------------
// Types for the API-backed mode
// ---------------------------------------------------------------------------

interface ApiClub {
  id: string;
  name: string;
  category: string;
  icon: string;
  sponsor?: string;
  meetingTime?: string;
  description?: string;
}

interface ApiMember {
  id: string;
  studentId: string;
  name: string;
  class: string;
  section: string;
  role: string;
}

interface ApiStudent {
  id: string;
  class: string;
  section: string;
  user?: { name: string };
}

const CLUB_ICONS = ["🏃", "⚽", "🏐", "🏏", "🤼", "♟️", "🧘", "🏸", "🏀", "🥇", "🎖️", "🤝", "⛑️", "🏕️", "🌱", "🚦", "🎗️"];
const CLUB_CATEGORIES = [
  "Sports", "Athletics", "Indoor", "Wellness",
  "NCC", "NSS", "JRC", "Scouts & Guides", "Green Corps", "RSP", "Red Ribbon", "Other",
];

export default function ClubsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [mode, setMode] = useState<"loading" | "api" | "local">("loading");

  // API mode state
  const [apiClubs, setApiClubs] = useState<ApiClub[]>([]);
  const [apiMemberCounts, setApiMemberCounts] = useState<Record<string, number>>({});

  // Local (offline) mode state
  const [localClubs, setLocalClubs] = useState<LocalClub[]>([]);

  // UI state
  const [showCreate, setShowCreate] = useState(false);
  const [manageClubId, setManageClubId] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Data loading: try the backend first, fall back to local demo data
  // -------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${PET_API_BASE}/api/activities`, { signal: AbortSignal.timeout(12000) });
        const json = await res.json();
        if (!json.success) throw new Error("api error");
        if (cancelled) return;
        const clubs: ApiClub[] = json.data.discoverClubs || [];
        setApiClubs(clubs);
        setMode("api");
        // fetch member counts in the background
        clubs.forEach(async (c) => {
          try {
            const r = await fetch(`${PET_API_BASE}/api/activities/club/${c.id}/members`);
            const j = await r.json();
            if (j.success && !cancelled) {
              setApiMemberCounts((prev) => ({ ...prev, [c.id]: j.count }));
            }
          } catch {
            /* count stays unknown */
          }
        });
      } catch {
        if (cancelled) return;
        setLocalClubs(petLoad(LOCAL_CLUBS_KEY, DEFAULT_LOCAL_CLUBS));
        setMode("local");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveLocalClubs = (next: LocalClub[]) => {
    setLocalClubs(next);
    petSave(LOCAL_CLUBS_KEY, next);
  };

  // Unified view over both modes for the club cards
  const cards = useMemo(() => {
    const list =
      mode === "api"
        ? apiClubs.map((c) => ({
            id: c.id,
            name: c.name,
            icon: c.icon,
            category: c.category,
            coordinator: c.sponsor || "—",
            meetingTime: c.meetingTime || "TBD",
            description: c.description || "",
            memberCount: apiMemberCounts[c.id],
          }))
        : localClubs.map((c) => ({
            id: c.id,
            name: c.name,
            icon: c.icon,
            category: c.category,
            coordinator: c.coordinator,
            meetingTime: c.meetingTime,
            description: c.description,
            memberCount: c.members.length as number | undefined,
          }));
    const q = searchTerm.toLowerCase();
    return q ? list.filter((c) => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) : list;
  }, [mode, apiClubs, apiMemberCounts, localClubs, searchTerm]);

  const totalMembers = useMemo(() => {
    if (mode === "api") return Object.values(apiMemberCounts).reduce((a, b) => a + b, 0);
    return localClubs.reduce((a, c) => a + c.members.length, 0);
  }, [mode, apiMemberCounts, localClubs]);

  const clubCount = mode === "api" ? apiClubs.length : localClubs.length;

  // -------------------------------------------------------------------------
  // Create club
  // -------------------------------------------------------------------------

  // One-click creation of the standard school-level units (NCC, NSS, JRC,
  // Scouts & Guides, National Green Corps, RSP, Red Ribbon, Sports Club).
  // Units that already exist (by name) are skipped.
  const [seedingUnits, setSeedingUnits] = useState(false);

  const handleAddSchoolUnits = async () => {
    setSeedingUnits(true);
    try {
      const existing = new Set(
        (mode === "api" ? apiClubs.map((c) => c.name) : localClubs.map((c) => c.name)).map((n) => n.toLowerCase())
      );
      const missing = SCHOOL_UNITS.filter((u) => !existing.has(u.name.toLowerCase()));
      if (missing.length === 0) {
        alert("All standard school units already exist.");
        return;
      }
      if (mode === "api") {
        for (const u of missing) {
          const res = await fetch(`${PET_API_BASE}/api/activities/clubs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: u.name,
              category: u.category,
              icon: u.icon,
              themeColor: "text-lime-600 dark:text-lime-400",
              themeBg: "bg-lime-500/10 border-lime-500/20",
              themeTagBg: "bg-lime-500/20",
              description: u.description,
              sponsor: "PET Staff",
              meetingTime: u.meetingTime,
            }),
          });
          const json = await res.json();
          if (json.success) {
            setApiClubs((prev) => [...prev, json.data]);
            setApiMemberCounts((prev) => ({ ...prev, [json.data.id]: 0 }));
          }
        }
      } else {
        const created: LocalClub[] = missing.map((u) => ({
          id: petId(),
          name: u.name,
          category: u.category,
          icon: u.icon,
          coordinator: "PET Staff",
          meetingTime: u.meetingTime,
          description: u.description,
          members: [],
        }));
        saveLocalClubs([...localClubs, ...created]);
      }
    } finally {
      setSeedingUnits(false);
    }
  };

  const handleDeleteClub = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? Members and events of this club will also be removed.`)) return;
    if (mode === "api") {
      try {
        const res = await fetch(`${PET_API_BASE}/api/activities/clubs/${id}`, { method: "DELETE" });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to delete club");
        setApiClubs((prev) => prev.filter((c) => c.id !== id));
      } catch (err) {
        alert(String(err instanceof Error ? err.message : err));
      }
    } else {
      saveLocalClubs(localClubs.filter((c) => c.id !== id));
    }
  };

  const handleCreateClub = async (form: { name: string; category: string; icon: string; meetingTime: string; description: string }) => {
    if (mode === "api") {
      const res = await fetch(`${PET_API_BASE}/api/activities/clubs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          icon: form.icon,
          themeColor: "text-lime-600 dark:text-lime-400",
          themeBg: "bg-lime-500/10 border-lime-500/20",
          themeTagBg: "bg-lime-500/20",
          description: form.description,
          sponsor: "PET Staff",
          meetingTime: form.meetingTime,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to create club");
      setApiClubs((prev) => [...prev, json.data]);
      setApiMemberCounts((prev) => ({ ...prev, [json.data.id]: 0 }));
    } else {
      const club: LocalClub = {
        id: petId(),
        name: form.name,
        category: form.category,
        icon: form.icon,
        coordinator: "PET Staff",
        meetingTime: form.meetingTime,
        description: form.description,
        members: [],
      };
      saveLocalClubs([...localClubs, club]);
    }
  };

  return (
    <PortalLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-heading)]">Clubs & Activities</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Create sports clubs, add students and track participation</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
              <input
                type="text"
                placeholder="Search clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-blue-500 w-64"
              />
            </div>
            <button
              onClick={handleAddSchoolUnits}
              disabled={seedingUnits || mode === "loading"}
              title="Create NCC, NSS, JRC, Scouts & Guides, Green Corps, RSP, Red Ribbon and Sports Club"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Landmark size={16} /> {seedingUnits ? "Adding..." : "Add School Units"}
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Plus size={16} /> New Club
            </button>
          </div>
        </div>

        {mode === "local" && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm font-semibold">
            <WifiOff size={16} /> Backend not reachable — working in local demo mode. Changes are saved on this device only.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <Tent size={40} className="opacity-80 mb-4" />
            <div className="text-4xl font-black mb-1">{mode === "loading" ? "…" : clubCount}</div>
            <div className="text-sm font-semibold opacity-90">Active School Clubs</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <Users size={40} className="opacity-80 mb-4" />
            <div className="text-4xl font-black mb-1">{mode === "loading" ? "…" : totalMembers}</div>
            <div className="text-sm font-semibold opacity-90">Total Student Participants</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <MapPin size={40} className="opacity-80 mb-4" />
            <div className="text-4xl font-black mb-1">{mode === "api" ? "Live" : "Local"}</div>
            <div className="text-sm font-semibold opacity-90">Data Source</div>
          </div>
        </div>

        {mode === "loading" ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cards.map((club) => (
              <div key={club.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm hover:border-blue-500/30 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                      {club.icon || "🏅"}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-heading)]">{club.name}</h3>
                      <div className="text-sm text-[var(--text-muted)] font-semibold mt-0.5">Coordinator: {club.coordinator}</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {club.category}
                  </span>
                </div>

                {club.description && (
                  <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed line-clamp-2">{club.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-[var(--border-light)]">
                    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Participants</div>
                    <div className="text-lg font-black text-[var(--text-heading)]">
                      {club.memberCount ?? "—"} <span className="text-xs text-[var(--text-muted)] font-medium">students</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-[var(--border-light)]">
                    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Clock size={10} /> Meeting Time
                    </div>
                    <div className="text-sm font-semibold text-[var(--text-heading)] truncate">{club.meetingTime}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setManageClubId(club.id)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[var(--text-heading)] font-semibold py-2 rounded-xl text-sm transition-colors border border-[var(--border)] flex items-center justify-center gap-2"
                  >
                    <UserPlus size={15} /> Manage Members
                  </button>
                  <button
                    onClick={() => handleDeleteClub(club.id, club.name)}
                    className="px-3 py-2 rounded-xl border border-[var(--border)] text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete club"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
            {cards.length === 0 && (
              <div className="col-span-2 text-center py-10 text-[var(--text-muted)]">
                No clubs found. Click <span className="font-bold">New Club</span> to create one.
              </div>
            )}
          </div>
        )}
      </div>

      {showCreate && <CreateClubModal onClose={() => setShowCreate(false)} onCreate={handleCreateClub} />}

      {manageClubId && mode === "api" && (
        <ApiMembersModal
          clubId={manageClubId}
          clubName={apiClubs.find((c) => c.id === manageClubId)?.name || "Club"}
          onClose={() => setManageClubId(null)}
          onCountChange={(count) => setApiMemberCounts((prev) => ({ ...prev, [manageClubId]: count }))}
        />
      )}

      {manageClubId && mode === "local" && (
        <LocalMembersModal
          club={localClubs.find((c) => c.id === manageClubId)!}
          onClose={() => setManageClubId(null)}
          onUpdate={(club) => saveLocalClubs(localClubs.map((c) => (c.id === club.id ? club : c)))}
        />
      )}
    </PortalLayout>
  );
}

// ---------------------------------------------------------------------------
// Create club modal
// ---------------------------------------------------------------------------

function CreateClubModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (form: { name: string; category: string; icon: string; meetingTime: string; description: string }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Sports");
  const [icon, setIcon] = useState("🏃");
  const [meetingTime, setMeetingTime] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await onCreate({ name, category, icon, meetingTime: meetingTime || "TBD", description });
      onClose();
    } catch (err) {
      setError(String(err instanceof Error ? err.message : err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell title="Create New Club" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Club Name">
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Athletics Club" className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              {CLUB_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Icon">
            <div className="flex flex-wrap gap-1.5">
              {CLUB_ICONS.map((em) => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setIcon(em)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition-colors ${
                    icon === em ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30" : "border-[var(--border)] hover:border-blue-300"
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </Field>
        </div>
        <Field label="Meeting Time">
          <input value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} placeholder="e.g. Mon & Thu, 4–5 PM" className={inputCls} />
        </Field>
        <Field label="About the Club">
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the club's activities and goals..." className={inputCls} />
        </Field>
        {error && <div className="text-sm text-red-500 font-semibold">{error}</div>}
        <button type="submit" disabled={submitting} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors">
          {submitting ? "Creating..." : "Create Club"}
        </button>
      </form>
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// Members modal — API mode (real students via /api/students + join/leave)
// ---------------------------------------------------------------------------

function ApiMembersModal({
  clubId,
  clubName,
  onClose,
  onCountChange,
}: {
  clubId: string;
  clubName: string;
  onClose: () => void;
  onCountChange: (count: number) => void;
}) {
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [mRes, sRes] = await Promise.all([
          fetch(`${PET_API_BASE}/api/activities/club/${clubId}/members`),
          fetch(`${PET_API_BASE}/api/students`),
        ]);
        const mJson = await mRes.json();
        const sJson = await sRes.json();
        if (mJson.success) setMembers(mJson.data);
        if (sJson.success) setStudents(sJson.data);
      } catch {
        setError("Failed to load members or students.");
      } finally {
        setLoading(false);
      }
    })();
  }, [clubId]);

  useEffect(() => {
    if (!loading) onCountChange(members.length);
  }, [members.length, loading, onCountChange]);

  const memberIds = useMemo(() => new Set(members.map((m) => m.studentId)), [members]);

  const candidates = useMemo(() => {
    const q = query.toLowerCase();
    return students
      .filter((s) => !memberIds.has(s.id))
      .filter((s) => !q || (s.user?.name || "").toLowerCase().includes(q) || `${s.class}${s.section}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [students, memberIds, query]);

  const addStudent = async (s: ApiStudent) => {
    setBusyId(s.id);
    setError("");
    try {
      const res = await fetch(`${PET_API_BASE}/api/activities/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId, studentId: s.id }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to add student");
      setMembers((prev) => [
        ...prev,
        { id: json.data.id, studentId: s.id, name: s.user?.name || "Student", class: s.class, section: s.section, role: "Member" },
      ]);
    } catch (err) {
      setError(String(err instanceof Error ? err.message : err));
    } finally {
      setBusyId(null);
    }
  };

  const removeStudent = async (m: ApiMember) => {
    setBusyId(m.studentId);
    setError("");
    try {
      const res = await fetch(`${PET_API_BASE}/api/activities/leave`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId, studentId: m.studentId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to remove student");
      setMembers((prev) => prev.filter((x) => x.studentId !== m.studentId));
    } catch (err) {
      setError(String(err instanceof Error ? err.message : err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ModalShell title={`Members — ${clubName}`} onClose={onClose} wide>
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <MembersLayout
          error={error}
          query={query}
          setQuery={setQuery}
          candidates={candidates.map((s) => ({ id: s.id, name: s.user?.name || "Student", class: `${s.class}${s.section || ""}` }))}
          members={members.map((m) => ({ id: m.studentId, name: m.name, class: `${m.class}${m.section || ""}` }))}
          busyId={busyId}
          onAdd={(id) => {
            const s = students.find((x) => x.id === id);
            if (s) addStudent(s);
          }}
          onRemove={(id) => {
            const m = members.find((x) => x.studentId === id);
            if (m) removeStudent(m);
          }}
        />
      )}
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// Members modal — local mode
// ---------------------------------------------------------------------------

function LocalMembersModal({
  club,
  onClose,
  onUpdate,
}: {
  club: LocalClub;
  onClose: () => void;
  onUpdate: (club: LocalClub) => void;
}) {
  const [query, setQuery] = useState("");
  const memberIds = new Set(club.members.map((m) => m.id));
  const q = query.toLowerCase();
  const candidates = LOCAL_STUDENT_ROSTER.filter((s) => !memberIds.has(s.id)).filter(
    (s) => !q || s.name.toLowerCase().includes(q) || s.class.toLowerCase().includes(q)
  ).slice(0, 8);

  return (
    <ModalShell title={`Members — ${club.name}`} onClose={onClose} wide>
      <MembersLayout
        error=""
        query={query}
        setQuery={setQuery}
        candidates={candidates}
        members={club.members}
        busyId={null}
        onAdd={(id) => {
          const s = LOCAL_STUDENT_ROSTER.find((x) => x.id === id);
          if (s) onUpdate({ ...club, members: [...club.members, s] });
        }}
        onRemove={(id) => onUpdate({ ...club, members: club.members.filter((m) => m.id !== id) })}
      />
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// Shared modal pieces
// ---------------------------------------------------------------------------

function MembersLayout({
  error,
  query,
  setQuery,
  candidates,
  members,
  busyId,
  onAdd,
  onRemove,
}: {
  error: string;
  query: string;
  setQuery: (v: string) => void;
  candidates: { id: string; name: string; class: string }[];
  members: { id: string; name: string; class: string }[];
  busyId: string | null;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-sm font-bold text-[var(--text-heading)] mb-3 flex items-center gap-2">
          <UserPlus size={15} /> Add Students
        </h4>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or class..."
            className="w-full pl-8 pr-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {candidates.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border-light)] bg-slate-50 dark:bg-slate-800/40">
              <div>
                <div className="text-sm font-bold text-[var(--text-heading)]">{s.name}</div>
                <div className="text-xs text-[var(--text-muted)] font-semibold">Class {s.class}</div>
              </div>
              <button
                onClick={() => onAdd(s.id)}
                disabled={busyId === s.id}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Plus size={12} /> Add
              </button>
            </div>
          ))}
          {candidates.length === 0 && <div className="text-xs text-[var(--text-muted)] text-center py-6">No students found.</div>}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-[var(--text-heading)] mb-3 flex items-center gap-2">
          <Users size={15} /> Current Members ({members.length})
        </h4>
        {error && <div className="text-xs text-red-500 font-semibold mb-2">{error}</div>}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border-light)]">
              <div>
                <div className="text-sm font-bold text-[var(--text-heading)]">{m.name}</div>
                <div className="text-xs text-[var(--text-muted)] font-semibold">Class {m.class}</div>
              </div>
              <button
                onClick={() => onRemove(m.id)}
                disabled={busyId === m.id}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60"
                title="Remove from club"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {members.length === 0 && (
            <div className="text-xs text-[var(--text-muted)] text-center py-6">No members yet — add students from the left.</div>
          )}
        </div>
      </div>
    </div>
  );
}

