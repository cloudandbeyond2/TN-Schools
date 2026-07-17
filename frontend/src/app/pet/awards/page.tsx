"use client";
import PortalLayout from "@/components/PortalLayout";
import { Trophy, Medal, Award, Plus, Trash2, CheckCircle2, Clock } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { ModalShell, Field, inputCls } from "@/components/pet/PetUi";
import {
  AwardRecord,
  MedalType,
  EventLevel,
  DEFAULT_AWARDS,
  AWARDS_KEY,
  petLoad,
  petSave,
  petId,
} from "@/lib/petData";

const MEDALS: MedalType[] = ["Gold", "Silver", "Bronze", "Trophy", "Certificate"];
const LEVELS: EventLevel[] = ["Intra-School", "Inter-School", "District", "State", "National"];

export default function AwardsPage() {
  const [awards, setAwards] = useState<AwardRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [levelFilter, setLevelFilter] = useState<"All" | EventLevel>("All");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    setAwards(petLoad(AWARDS_KEY, DEFAULT_AWARDS));
    setLoaded(true);
  }, []);

  const save = (next: AwardRecord[]) => {
    setAwards(next);
    petSave(AWARDS_KEY, next);
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

  const pendingCerts = awards.filter((a) => !a.certificateIssued).length;

  const toggleCert = (id: string) =>
    save(awards.map((a) => (a.id === id ? { ...a, certificateIssued: !a.certificateIssued } : a)));

  return (
    <PortalLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
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
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <Trophy size={40} className="opacity-80 mb-4" />
            <div className="text-4xl font-black mb-1">{tally.Gold}</div>
            <div className="text-sm font-semibold opacity-90">Gold Medals This Year</div>
          </div>
          <div className="bg-gradient-to-br from-slate-400 to-slate-600 rounded-2xl p-6 text-white shadow-lg">
            <Medal size={40} className="opacity-80 mb-4" />
            <div className="text-4xl font-black mb-1">{tally.Silver}</div>
            <div className="text-sm font-semibold opacity-90">Silver Medals This Year</div>
          </div>
          <div className="bg-gradient-to-br from-amber-700 to-amber-900 rounded-2xl p-6 text-white shadow-lg">
            <Award size={40} className="opacity-80 mb-4" />
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
                {filtered.map((a) => (
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
                        onClick={() => {
                          if (confirm(`Delete award for ${a.student}?`)) save(awards.filter((x) => x.id !== a.id));
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
        </div>
      </div>

      {showAdd && (
        <AddAwardModal
          onClose={() => setShowAdd(false)}
          onAdd={(a) => {
            save([{ ...a, id: petId() }, ...awards]);
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
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (a: Omit<AwardRecord, "id">) => void;
}) {
  const [student, setStudent] = useState("");
  const [cls, setCls] = useState("");
  const [sport, setSport] = useState("");
  const [event, setEvent] = useState("");
  const [level, setLevel] = useState<EventLevel>("Intra-School");
  const [medal, setMedal] = useState<MedalType>("Gold");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [certificateIssued, setCertificateIssued] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ student, class: cls, sport, event, level, medal, date, certificateIssued });
  };

  return (
    <ModalShell title="Add Award / Achievement" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Student / Team">
            <input required value={student} onChange={(e) => setStudent(e.target.value)} placeholder="e.g. Arjun K." className={inputCls} />
          </Field>
          <Field label="Class / Group">
            <input required value={cls} onChange={(e) => setCls(e.target.value)} placeholder="e.g. 10A or U-17" className={inputCls} />
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
