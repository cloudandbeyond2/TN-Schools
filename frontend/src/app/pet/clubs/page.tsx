"use client";

import PortalLayout from "@/components/PortalLayout";
import { Users, Tent, Plus, MapPin, Search, UserPlus, Trash2, WifiOff, Clock, Landmark } from "lucide-react";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
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

const CLUB_ICONS = [
  { value: "fi fi-rr-running", label: "Running" },
  { value: "fi fi-rr-basketball", label: "Ball Sports" },
  { value: "fi fi-rr-gym", label: "Wellness / Gym" },
  { value: "fi fi-rr-chess-knight", label: "Chess" },
  { value: "fi fi-rr-spa", label: "Yoga / Spa" },
  { value: "fi fi-rr-trophy", label: "Trophy / Honors" },
  { value: "fi fi-rr-badge", label: "Badge / Award" },
  { value: "fi fi-rr-handshake", label: "NSS / JRC" },
  { value: "fi fi-rr-medical-star", label: "First Aid" },
  { value: "fi fi-rr-campground", label: "Scouts" },
  { value: "fi fi-rr-leaf", label: "Green Corps" },
  { value: "fi fi-rr-traffic-light", label: "RSP" },
  { value: "fi fi-rr-ribbon", label: "Red Ribbon" }
];

const CLUB_CATEGORIES = [
  "Sports", "Athletics", "Indoor", "Wellness",
  "NCC", "NSS", "JRC", "Scouts & Guides", "Green Corps", "RSP", "Red Ribbon", "Other",
];

const renderPetClubIcon = (iconStr: string) => {
  if (iconStr && iconStr.startsWith("fi ")) {
    return <i className={`${iconStr} text-xl text-blue-500`} />;
  }
  // legacy emoji mapping
  const s = iconStr || "";
  if (s === "🏃") return <i className="fi fi-rr-running text-xl text-blue-500" />;
  if (s === "⚽" || s === "🏐" || s === "🏀") return <i className="fi fi-rr-basketball text-xl text-blue-500" />;
  if (s === "🏏") return <i className="fi fi-rr-trophy text-xl text-blue-500" />;
  if (s === "🤼") return <i className="fi fi-rr-gym text-xl text-blue-500" />;
  if (s === "♟️") return <i className="fi fi-rr-chess-knight text-xl text-blue-500" />;
  if (s === "🧘") return <i className="fi fi-rr-spa text-xl text-blue-500" />;
  if (s === "🏸") return <i className="fi fi-rr-basketball text-xl text-blue-500" />;
  if (s === "🥇") return <i className="fi fi-rr-trophy text-xl text-blue-500" />;
  if (s === "🎖️") return <i className="fi fi-rr-badge text-xl text-blue-500" />;
  if (s === "🤝") return <i className="fi fi-rr-handshake text-xl text-blue-500" />;
  if (s === "⛑️") return <i className="fi fi-rr-medical-star text-xl text-blue-500" />;
  if (s === "🏕️") return <i className="fi fi-rr-campground text-xl text-blue-500" />;
  if (s === "🌱") return <i className="fi fi-rr-leaf text-xl text-blue-500" />;
  if (s === "🚦") return <i className="fi fi-rr-traffic-light text-xl text-blue-500" />;
  if (s === "🎗️") return <i className="fi fi-rr-ribbon text-xl text-blue-500" />;
  return <i className="fi fi-rr-users text-xl text-blue-500" />;
};

const getClubEligibility = (clubName: string) => {
  const name = clubName.toLowerCase();
  if (name.includes("service scheme") || name.includes("nss") || name.includes("ribbon") || name.includes("rrc")) {
    return { label: "Class 11 - 12", minClass: 11, maxClass: 12, levels: ["higher"] };
  }
  if (name.includes("cadet corps") || name.includes("ncc") || name.includes("safety patrol") || name.includes("rsp")) {
    return { label: "Class 9 - 12", minClass: 9, maxClass: 12, levels: ["high", "higher"] };
  }
  if (name.includes("red cross") || name.includes("jrc") || name.includes("scouts") || name.includes("guides") || name.includes("green corps") || name.includes("eco club")) {
    return { label: "Class 6 - 10", minClass: 6, maxClass: 10, levels: ["middle", "high"] };
  }
  return { label: "Class 6 - 12", minClass: 6, maxClass: 12, levels: ["middle", "high", "higher"] };
};

export default function ClubsPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId || "";

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

  const loadClubsAndCounts = useCallback(async () => {
    if (!schoolId) return;
    try {
      const res = await fetch(`${PET_API_BASE}/api/activities?schoolId=${schoolId}`, { signal: AbortSignal.timeout(12000) });
      const json = await res.json();
      if (!json.success) throw new Error("api error");
      const clubs: ApiClub[] = json.data.discoverClubs || [];
      setApiClubs(clubs);
      setMode("api");
      // fetch member counts in the background
      clubs.forEach(async (c) => {
        try {
          const r = await fetch(`${PET_API_BASE}/api/activities/club/${c.id}/members`);
          const j = await r.json();
          if (j.success) {
            setApiMemberCounts((prev) => ({ ...prev, [c.id]: j.data?.length || 0 }));
          }
        } catch {
          /* count stays unknown */
        }
      });
    } catch {
      setLocalClubs(petLoad(LOCAL_CLUBS_KEY, DEFAULT_LOCAL_CLUBS));
      setMode("local");
    }
  }, [schoolId]);

  useEffect(() => {
    loadClubsAndCounts();
  }, [loadClubsAndCounts]);

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
            coordinator: session?.user?.name || c.sponsor || "PET Staff",
            meetingTime: c.meetingTime || "TBD",
            description: c.description || "",
            memberCount: apiMemberCounts[c.id],
          }))
        : localClubs.map((c) => ({
            id: c.id,
            name: c.name,
            icon: c.icon,
            category: c.category,
            coordinator: session?.user?.name || c.coordinator,
            meetingTime: c.meetingTime,
            description: c.description,
            memberCount: c.members.length as number | undefined,
          }));
    const q = searchTerm.toLowerCase();
    return q ? list.filter((c) => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) : list;
  }, [mode, apiClubs, apiMemberCounts, localClubs, searchTerm, session]);

  const totalMembers = useMemo(() => {
    if (mode === "api") return Object.values(apiMemberCounts).reduce((a, b) => a + b, 0);
    return localClubs.reduce((a, c) => a + c.members.length, 0);
  }, [mode, apiMemberCounts, localClubs]);

  const clubCount = mode === "api" ? apiClubs.length : localClubs.length;

  // -------------------------------------------------------------------------
  // Create club
  // -------------------------------------------------------------------------

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
              icon: u.icon.startsWith("fi ") ? u.icon : `fi fi-rr-leaf`, // Map to Flaticon
              themeColor: "text-lime-600 dark:text-lime-400",
              themeBg: "bg-lime-500/10 border-lime-500/20",
              themeTagBg: "bg-lime-500/20",
              description: u.description,
              sponsor: "PET Staff",
              meetingTime: u.meetingTime,
              schoolId
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
          schoolId
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
    <PortalLayout
      title="Clubs & Activities Hub"
      subtitle="Extracurricular management for PE & Sports Staff"
      avatarLetter="P"
      avatarColor="#10b981"
      themeClass="theme-pet"
      accentColor="#10b981"
    >
      <div className="p-4 sm:p-6 w-full space-y-6 text-left">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fi fi-rr-users text-emerald-500" /> Clubs & Activities
            </h1>
            <p className="text-sm text-slate-500 mt-1">Create sports clubs, add students and track participation</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <button
              onClick={handleAddSchoolUnits}
              disabled={seedingUnits || mode === "loading" || !schoolId}
              title="Create NCC, NSS, JRC, Scouts & Guides, Green Corps, RSP, Red Ribbon and Sports Club"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-650/10"
            >
              <Landmark size={16} /> {seedingUnits ? "Adding..." : "Add School Units"}
            </button>
            <button
              onClick={() => setShowCreate(true)}
              disabled={!schoolId}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-500/10"
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-rose-400 to-red-500 rounded-3xl p-6 text-white shadow-xl hover:shadow-red-500/20 transition-all hover:-translate-y-1 group">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
            <Tent size={44} className="opacity-80 mb-4 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
            <div className="text-5xl font-black mb-1 drop-shadow-sm tracking-tight">{mode === "loading" ? "…" : clubCount}</div>
            <div className="text-sm font-semibold opacity-90 tracking-wide">Active School Clubs</div>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-white shadow-xl hover:shadow-orange-500/20 transition-all hover:-translate-y-1 group">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
            <Users size={44} className="opacity-80 mb-4 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
            <div className="text-5xl font-black mb-1 drop-shadow-sm tracking-tight">{mode === "loading" ? "…" : totalMembers}</div>
            <div className="text-sm font-semibold opacity-90 tracking-wide">Total Student Participants</div>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-sky-400 to-blue-500 rounded-3xl p-6 text-white shadow-xl hover:shadow-blue-500/20 transition-all hover:-translate-y-1 group">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
            <MapPin size={44} className="opacity-80 mb-4 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
            <div className="text-5xl font-black mb-1 drop-shadow-sm tracking-tight">{mode === "api" ? "Live Data" : "Local Demo"}</div>
            <div className="text-sm font-semibold opacity-90 tracking-wide">Data Source Connection</div>
          </div>
        </div>

        {mode === "loading" ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cards.map((club) => {
              const eligibility = getClubEligibility(club.name);
              return (
                <div key={club.id} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 duration-300 flex flex-col h-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="flex justify-between items-start mb-5 relative z-10">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 flex items-center justify-center shrink-0 border border-blue-100 dark:border-slate-700 shadow-sm group-hover:shadow-md transition-shadow group-hover:scale-105 duration-300">
                        {renderPetClubIcon(club.icon)}
                      </div>
                      <div className="min-w-0 pt-1">
                        <h3 className="text-base font-black text-slate-800 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{club.name}</h3>
                        <div className="text-xs text-slate-500 font-semibold mt-1 truncate">Coordinator: {club.coordinator}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                      {club.category}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {eligibility.label}
                    </span>
                  </div>

                {club.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-5 leading-relaxed line-clamp-3 relative z-10 flex-grow">{club.description}</p>
                )}

                <div className="grid grid-cols-2 gap-3 mb-5 mt-auto relative z-10">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60 group-hover:border-blue-200 dark:group-hover:border-blue-900/50 transition-colors">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Users size={12} className="text-slate-400" /> Members
                    </div>
                    <div className="text-lg font-black text-slate-800 dark:text-slate-200">
                      {club.memberCount ?? 0}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60 group-hover:border-blue-200 dark:group-hover:border-blue-900/50 transition-colors">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" /> Meeting
                    </div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate mt-1">{club.meetingTime}</div>
                  </div>
                </div>

                <div className="flex gap-2 relative z-10">
                  <button
                    onClick={() => setManageClubId(club.id)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 group-hover:border-transparent border border-slate-200 dark:border-slate-700 shadow-sm"
                  >
                    <UserPlus size={14} /> Manage
                  </button>
                  <button
                    onClick={() => handleDeleteClub(club.id, club.name)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 transition-all shadow-sm"
                    title="Delete club"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              );
            })}
            {cards.length === 0 && (
              <div className="col-span-2 text-center py-16 text-slate-500 italic text-xs">
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
          schoolId={schoolId}
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
  const [icon, setIcon] = useState("fi fi-rr-running");
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
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <Field label="Club Name">
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Athletics Club" className={inputCls} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              {CLUB_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Icon Visual">
            <select value={icon} onChange={(e) => setIcon(e.target.value)} className={inputCls}>
              {CLUB_ICONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Meeting Time">
          <input value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} placeholder="e.g. Mon & Thu, 4–5 PM" className={inputCls} />
        </Field>
        <Field label="About the Club">
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the club's activities and goals..." className={inputCls} />
        </Field>
        {error && <div className="text-sm text-red-500 font-semibold">{error}</div>}
        <button type="submit" disabled={submitting} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-blue-500/10">
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
  schoolId,
  onClose,
  onCountChange,
}: {
  clubId: string;
  clubName: string;
  schoolId: string;
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
          fetch(`${PET_API_BASE}/api/students?schoolId=${schoolId}`),
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
  }, [clubId, schoolId]);

  useEffect(() => {
    if (!loading) onCountChange(members.length);
  }, [members.length, loading, onCountChange]);

  const memberIds = useMemo(() => new Set(members.map((m) => m.studentId)), [members]);

  const candidates = useMemo(() => {
    const q = query.toLowerCase();
    const eligibility = getClubEligibility(clubName);
    return students
      .filter((s) => !memberIds.has(s.id))
      .filter((s) => {
        const studentClass = parseInt(s.class || "0", 10);
        return studentClass >= eligibility.minClass && studentClass <= eligibility.maxClass;
      })
      .filter((s) => !q || (s.user?.name || "").toLowerCase().includes(q) || `${s.class}${s.section}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [students, memberIds, query, clubName]);

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
  const eligibility = getClubEligibility(club.name);
  const candidates = LOCAL_STUDENT_ROSTER.filter((s) => !memberIds.has(s.id))
    .filter((s) => {
      const studentClass = parseInt(s.class || "0", 10);
      return studentClass >= eligibility.minClass && studentClass <= eligibility.maxClass;
    })
    .filter((s) => !q || s.name.toLowerCase().includes(q) || s.class.toLowerCase().includes(q))
    .slice(0, 8);

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
      <div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <UserPlus size={15} /> Add Students
        </h4>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or class..."
            className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          {candidates.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-white">{s.name}</div>
                <div className="text-[10px] text-slate-500 font-semibold">Class {s.class}</div>
              </div>
              <button
                onClick={() => onAdd(s.id)}
                disabled={busyId === s.id}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
              >
                <Plus size={12} /> Add
              </button>
            </div>
          ))}
          {candidates.length === 0 && <div className="text-xs text-slate-500 text-center py-6">No students found.</div>}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
          <Users size={15} /> Current Members ({members.length})
        </h4>
        {error && <div className="text-xs text-red-500 font-semibold mb-2">{error}</div>}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-white">{m.name}</div>
                <div className="text-[10px] text-slate-500 font-semibold">Class {m.class}</div>
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
            <div className="text-xs text-slate-500 text-center py-6">No members yet — add students from the left.</div>
          )}
        </div>
      </div>
    </div>
  );
}
