"use client";
import PortalLayout from "@/components/PortalLayout";
import { Trophy, Medal, Award, Plus, Trash2, CheckCircle2, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { ModalShell, Field, inputCls } from "@/components/pet/PetUi";
import {
  AwardRecord,
  MedalType,
  EventLevel,
  PET_API_BASE,
} from "@/lib/petData";

const MEDALS: MedalType[] = ["Gold", "Silver", "Bronze", "Trophy", "Certificate"];
const LEVELS: EventLevel[] = ["Intra-School", "Inter-School", "District", "State", "National"];

export default function AwardsPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const [awards, setAwards] = useState<AwardRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [levelFilter, setLevelFilter] = useState<"All" | EventLevel>("All");
  const [showAdd, setShowAdd] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    try {
      const res = await fetch(`${PET_API_BASE}/api/pet/awards`);
      const json = await res.json();
      if (json.success) {
        setAwards(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch awards", err);
    } finally {
      setLoaded(true);
    }
  };

  const tally = useMemo(() => {
    const t = { Gold: 0, Silver: 0, Bronze: 0, Trophy: 0, Certificate: 0 };
    awards.forEach((a) => {
      t[a.medal] += 1;
    });
    return t;
  }, [awards]);

  const filtered = useMemo(
    () =>
      awards
        .filter((a) => levelFilter === "All" || a.level === levelFilter)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [awards, levelFilter]
  );

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [levelFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedAwards = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const pendingCerts = awards.filter((a) => !a.certificateIssued).length;

  const toggleCert = async (id: string) => {
    const award = awards.find((a) => a.id === id);
    if (!award) return;
    const nextStatus = !award.certificateIssued;
    // Optimistic UI update
    setAwards(awards.map((a) => (a.id === id ? { ...a, certificateIssued: nextStatus } : a)));
    try {
      await fetch(`${PET_API_BASE}/api/pet/awards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...award, certificateIssued: nextStatus }),
      });
    } catch (err) {
      console.error("Failed to update certificate status", err);
    }
  };

  return (
    <PortalLayout>
      <div className="p-6 w-full space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-heading)]">Awards & Certifications</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              School wall of fame · {awards.length} achievements · {pendingCerts} certificates pending
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as any)}
              className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm font-semibold focus:outline-none"
            >
              <option value="All">All Levels</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Plus size={16} /> Add Award
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 rounded-3xl p-6 text-amber-700 dark:text-amber-400 shadow-sm border border-amber-200/50 dark:border-amber-800/50 transition-all hover:shadow-md hover:-translate-y-1">
            <Trophy size={40} className="mb-4" />
            <div className="text-4xl font-black mb-1">{tally.Gold}</div>
            <div className="text-sm font-semibold opacity-90">Gold Medals This Year</div>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/40 dark:to-slate-800/20 rounded-3xl p-6 text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200/50 dark:border-slate-700/50 transition-all hover:shadow-md hover:-translate-y-1">
            <Medal size={40} className="mb-4" />
            <div className="text-4xl font-black mb-1">{tally.Silver}</div>
            <div className="text-sm font-semibold opacity-90">Silver Medals This Year</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-3xl p-6 text-orange-800 dark:text-orange-400 shadow-sm border border-orange-200/50 dark:border-orange-800/50 transition-all hover:shadow-md hover:-translate-y-1">
            <Award size={40} className="mb-4" />
            <div className="text-4xl font-black mb-1">{tally.Bronze}</div>
            <div className="text-sm font-semibold opacity-90">Bronze Medals This Year</div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-slate-50 dark:bg-slate-800/50 font-bold text-[var(--text-heading)]">
            Achievements ({filtered.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 font-bold">Student / Team</th>
                  <th className="p-4 font-bold">Sport</th>
                  <th className="p-4 font-bold">Event</th>
                  <th className="p-4 font-bold">Level</th>
                  <th className="p-4 font-bold">Award</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Certificate</th>
                  <th className="p-4 font-bold text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {paginatedAwards.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="p-4 font-bold text-[var(--text-heading)]">
                      {a.student}
                      <span className="text-xs text-[var(--text-muted)] font-semibold ml-2">({a.class})</span>
                    </td>
                    <td className="p-4 text-[var(--text-muted)] font-semibold">{a.sport}</td>
                    <td className="p-4 text-[var(--text-muted)] font-semibold">{a.event}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {a.level}
                      </span>
                    </td>
                    <td className="p-4">
                      <MedalBadge medal={a.medal} />
                    </td>
                    <td className="p-4 text-[var(--text-muted)] font-semibold whitespace-nowrap">{a.date}</td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleCert(a.id)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-colors ${
                          a.certificateIssued
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200"
                        }`}
                        title="Click to toggle"
                      >
                        {a.certificateIssued ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {a.certificateIssued ? "Issued" : "Pending"}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={async () => {
                          if (confirm(`Delete award for ${a.student}?`)) {
                            setAwards(awards.filter((x) => x.id !== a.id));
                            try {
                              await fetch(`${PET_API_BASE}/api/pet/awards/${a.id}`, { method: "DELETE" });
                            } catch (err) {
                              console.error("Failed to delete award", err);
                            }
                          }
                        }}
                        className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {loaded && filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-[var(--text-muted)]">No awards recorded for this level yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="p-4 border-t border-[var(--border)] flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <span className="text-sm text-[var(--text-muted)] font-medium">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-2 border border-[var(--border)] rounded-lg hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                        currentPage === i + 1
                          ? "bg-blue-600 text-white"
                          : "hover:bg-[var(--bg-hover)] text-[var(--text-muted)]"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 border border-[var(--border)] rounded-lg hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <AddAwardModal
          schoolId={schoolId}
          onClose={() => setShowAdd(false)}
          onAdd={async (a) => {
            try {
              const res = await fetch(`${PET_API_BASE}/api/pet/awards`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(a),
              });
              const json = await res.json();
              if (json.success) {
                setAwards([json.data, ...awards]);
              }
            } catch (err) {
              console.error("Failed to create award", err);
            }
            setShowAdd(false);
          }}
        />
      )}
    </PortalLayout>
  );
}

function MedalBadge({ medal }: { medal: MedalType }) {
  const styles: Record<MedalType, string> = {
    Gold: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Silver: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    Bronze: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    Trophy: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Certificate: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max ${styles[medal]}`}>
      <Medal size={12} /> {medal}
    </span>
  );
}

function AddAwardModal({
  schoolId,
  onClose,
  onAdd,
}: {
  schoolId?: string;
  onClose: () => void;
  onAdd: (a: Omit<AwardRecord, "id">) => void;
}) {
  const [student, setStudent] = useState("");
  const [cls, setCls] = useState("10");
  const [section, setSection] = useState("A");
  const [sport, setSport] = useState("");
  const [event, setEvent] = useState("");
  const [level, setLevel] = useState<EventLevel>("Intra-School");
  const [medal, setMedal] = useState<MedalType>("Gold");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [certificateIssued, setCertificateIssued] = useState(false);
  const [studentsList, setStudentsList] = useState<{name: string, id: string}[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    const fetchClassStudents = async () => {
      setLoadingStudents(true);
      try {
        let url = `${PET_API_BASE}/api/students?class=${encodeURIComponent(cls)}&section=${encodeURIComponent(section)}`;
        if (schoolId) url += `&schoolId=${schoolId}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        const json = await res.json();
        if (json.success && json.data) {
          const list = json.data.map((s: any) => ({
            id: s.id,
            name: s.user?.name || s.name || "Student",
          }));
          setStudentsList(list);
          if (list.length > 0 && !list.find((x: any) => x.name === student)) {
            setStudent(list[0].name);
          } else if (list.length === 0) {
            setStudent("");
          }
        }
      } catch (err) {
        console.error("Failed to load students", err);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchClassStudents();
  }, [cls, section, schoolId]); // intentionally omitting `student` to avoid re-fetching on name change

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ student, class: `${cls}${section}`, sport, event, level, medal, date, certificateIssued });
  };

  return (
    <ModalShell title="Add Award / Achievement" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Class">
            <select value={cls} onChange={(e) => setCls(e.target.value)} className={inputCls}>
              {["6", "7", "8", "9", "10", "11", "12"].map((c) => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </Field>
          <Field label="Section">
            <select value={section} onChange={(e) => setSection(e.target.value)} className={inputCls}>
              {["A", "B", "C", "D", "E"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Student / Team">
            {studentsList.length > 0 ? (
              <select required value={student} onChange={(e) => setStudent(e.target.value)} className={inputCls}>
                {studentsList.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            ) : (
              <input required value={student} onChange={(e) => setStudent(e.target.value)} placeholder={loadingStudents ? "Loading..." : "Enter manually..."} className={inputCls} />
            )}
          </Field>
        </div>
        <Field label="Sport / Discipline">
          <input required value={sport} onChange={(e) => setSport(e.target.value)} placeholder="e.g. Athletics — 100m Sprint" className={inputCls} />
        </Field>
        <Field label="Event / Competition">
          <input required value={event} onChange={(e) => setEvent(e.target.value)} placeholder="e.g. Zonal Athletics Meet" className={inputCls} />
        </Field>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Level">
            <select value={level} onChange={(e) => setLevel(e.target.value as EventLevel)} className={inputCls}>
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </Field>
          <Field label="Award">
            <select value={medal} onChange={(e) => setMedal(e.target.value as MedalType)} className={inputCls}>
              {MEDALS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label="Date">
            <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text-heading)] cursor-pointer">
          <input type="checkbox" checked={certificateIssued} onChange={(e) => setCertificateIssued(e.target.checked)} className="w-4 h-4" />
          Certificate already issued
        </label>
        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
          Add to Wall of Fame
        </button>
      </form>
    </ModalShell>
  );
}
