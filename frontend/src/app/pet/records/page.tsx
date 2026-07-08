"use client";
import PortalLayout from "@/components/PortalLayout";
import { Search, HeartPulse, Brain, Plus, Pencil, Trash2, Users, WifiOff } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { ModalShell, Field, inputCls } from "@/components/pet/PetUi";
import {
  FitnessRecord,
  DEFAULT_RECORDS,
  RECORDS_KEY,
  PET_API_BASE,
  petLoad,
  petSave,
  petId,
  computeBmi,
  bmiCategory,
} from "@/lib/petData";

const SPORT_OPTIONS = [
  "Athletics", "Football", "Volleyball", "Kabaddi", "Kho-Kho", "Cricket", "Basketball",
  "Throwball", "Handball", "Ball Badminton", "Badminton", "Table Tennis", "Chess", "Yoga", "General Fitness",
];

const MENTAL: FitnessRecord["mentalHealth"][] = ["Excellent", "Good", "Average", "Stressed"];

export default function StudentRecordsPage() {
  const [records, setRecords] = useState<FitnessRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [editing, setEditing] = useState<FitnessRecord | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showClassAdd, setShowClassAdd] = useState(false);

  useEffect(() => {
    setRecords(petLoad(RECORDS_KEY, DEFAULT_RECORDS));
    setLoaded(true);
  }, []);

  const save = (next: FitnessRecord[]) => {
    setRecords(next);
    petSave(RECORDS_KEY, next);
  };

  const classes = useMemo(() => ["All", ...Array.from(new Set(records.map((r) => r.class))).sort()], [records]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return records
      .filter((r) => classFilter === "All" || r.class === classFilter)
      .filter((r) => !q || r.name.toLowerCase().includes(q) || r.sport.toLowerCase().includes(q));
  }, [records, search, classFilter]);

  const avgFitness = records.length
    ? Math.round(records.reduce((a, r) => a + r.fitnessScore, 0) / records.length)
    : 0;
  const stressedCount = records.filter((r) => r.mentalHealth === "Stressed").length;

  return (
    <PortalLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-heading)]">Student Records & Health</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {records.length} athletes tracked · Avg fitness {avgFitness}% · {stressedCount} need attention
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
              <input
                type="text"
                placeholder="Search student or sport..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm font-semibold focus:outline-none"
            >
              {classes.map((c) => (
                <option key={c} value={c}>{c === "All" ? "All Classes" : `Class ${c}`}</option>
              ))}
            </select>
            <button
              onClick={() => setShowClassAdd(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Users size={16} /> Add by Class
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Plus size={16} /> Add Record
            </button>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 font-bold">Student</th>
                  <th className="p-4 font-bold">Class</th>
                  <th className="p-4 font-bold">Sport</th>
                  <th className="p-4 font-bold">Height / Weight</th>
                  <th className="p-4 font-bold">BMI</th>
                  <th className="p-4 font-bold">Fitness Score</th>
                  <th className="p-4 font-bold">Mental Health</th>
                  <th className="p-4 font-bold">Remarks</th>
                  <th className="p-4 font-bold text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filtered.map((s) => {
                  const bmi = computeBmi(s.heightCm, s.weightKg);
                  const cat = bmiCategory(bmi);
                  const tones = {
                    green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                    red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                  };
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-4 font-bold text-[var(--text-heading)]">{s.name}</td>
                      <td className="p-4 text-[var(--text-muted)] font-semibold">{s.class}</td>
                      <td className="p-4 text-[var(--text-muted)] font-semibold">{s.sport}</td>
                      <td className="p-4 font-semibold whitespace-nowrap">
                        {s.heightCm > 0 && s.weightKg > 0 ? `${s.heightCm} cm · ${s.weightKg} kg` : "— pending"}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${tones[cat.tone]}`}>
                          {bmi} · {cat.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 min-w-[110px]">
                          <HeartPulse size={14} className="text-red-500 shrink-0" />
                          <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${s.fitnessScore >= 80 ? "bg-green-500" : s.fitnessScore >= 65 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${s.fitnessScore}%` }}
                            />
                          </div>
                          <span className="font-bold text-xs">{s.fitnessScore}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max ${
                          s.mentalHealth === "Stressed"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}>
                          <Brain size={12} /> {s.mentalHealth}
                        </span>
                      </td>
                      <td className="p-4 text-[var(--text-muted)] font-semibold">{s.status}</td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button onClick={() => setEditing(s)} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove record for ${s.name}?`)) save(records.filter((r) => r.id !== s.id));
                          }}
                          className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {loaded && filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-10 text-center text-[var(--text-muted)]">No students match the current filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showClassAdd && (
        <ClassAddModal
          existingNames={new Set(records.map((r) => `${r.name}|${r.class}`))}
          onClose={() => setShowClassAdd(false)}
          onAdd={(students) => {
            const added: FitnessRecord[] = students.map((s) => ({
              id: petId(),
              name: s.name,
              class: s.class,
              heightCm: 0,
              weightKg: 0,
              fitnessScore: 70,
              mentalHealth: "Good",
              sport: s.sport,
              status: "New — measurements pending",
            }));
            save([...added, ...records]);
            setShowClassAdd(false);
          }}
        />
      )}

      {(showAdd || editing) && (
        <RecordModal
          initial={editing}
          onClose={() => {
            setShowAdd(false);
            setEditing(null);
          }}
          onSave={(rec) => {
            if (editing) save(records.map((r) => (r.id === rec.id ? rec : r)));
            else save([{ ...rec, id: petId() }, ...records]);
            setShowAdd(false);
            setEditing(null);
          }}
        />
      )}
    </PortalLayout>
  );
}

// ---------------------------------------------------------------------------
// Class-wise add: pull real students of a class/section from the backend and
// register the selected ones as sports students in one go.
// ---------------------------------------------------------------------------

interface RosterStudent {
  id: string;
  name: string;
  class: string;
  section: string;
}

function ClassAddModal({
  existingNames,
  onClose,
  onAdd,
}: {
  existingNames: Set<string>;
  onClose: () => void;
  onAdd: (students: { name: string; class: string; sport: string }[]) => void;
}) {
  const [cls, setCls] = useState("10");
  const [section, setSection] = useState("A");
  const [sport, setSport] = useState(SPORT_OPTIONS[0]);
  const [students, setStudents] = useState<RosterStudent[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const [fetched, setFetched] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    setOffline(false);
    try {
      const res = await fetch(
        `${PET_API_BASE}/api/students?class=${encodeURIComponent(cls)}&section=${encodeURIComponent(section)}`,
        { signal: AbortSignal.timeout(12000) }
      );
      const json = await res.json();
      if (!json.success) throw new Error("api error");
      const roster: RosterStudent[] = (json.data || []).map((s: any) => ({
        id: s.id,
        name: s.user?.name || "Student",
        class: s.class,
        section: s.section || "",
      }));
      setStudents(roster);
      setSelected(new Set());
      setFetched(true);
    } catch {
      setOffline(true);
      setStudents([]);
      setFetched(true);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectable = students.filter((s) => !existingNames.has(`${s.name}|${s.class}${s.section}`));

  const submit = () => {
    const chosen = students
      .filter((s) => selected.has(s.id))
      .map((s) => ({ name: s.name, class: `${s.class}${s.section}`, sport }));
    if (chosen.length > 0) onAdd(chosen);
  };

  return (
    <ModalShell title="Add Sports Students by Class" onClose={onClose} wide>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
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
          <Field label="Sport / Discipline">
            <select value={sport} onChange={(e) => setSport(e.target.value)} className={inputCls}>
              {SPORT_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <button
            onClick={loadStudents}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 h-[38px]"
          >
            <Search size={15} /> {loading ? "Loading..." : "Load Students"}
          </button>
        </div>

        {offline && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm font-semibold">
            <WifiOff size={15} /> Backend not reachable — student roster unavailable. Use "Add Record" for manual entry.
          </div>
        )}

        {fetched && !offline && (
          <>
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-muted)]">
              <span>
                {students.length} students in Class {cls}{section} · {selected.size} selected
              </span>
              {selectable.length > 0 && (
                <button
                  onClick={() =>
                    setSelected(selected.size === selectable.length ? new Set() : new Set(selectable.map((s) => s.id)))
                  }
                  className="text-blue-500 hover:underline"
                >
                  {selected.size === selectable.length ? "Clear all" : "Select all"}
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {students.map((s) => {
                const already = existingNames.has(`${s.name}|${s.class}${s.section}`);
                return (
                  <label
                    key={s.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border border-[var(--border-light)] ${
                      already ? "opacity-50" : "cursor-pointer hover:border-blue-400"
                    } ${selected.has(s.id) ? "bg-blue-50 dark:bg-blue-900/20 border-blue-400" : "bg-slate-50 dark:bg-slate-800/40"}`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        disabled={already}
                        checked={selected.has(s.id)}
                        onChange={() => toggle(s.id)}
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="text-sm font-bold text-[var(--text-heading)]">{s.name}</div>
                        <div className="text-xs text-[var(--text-muted)] font-semibold">
                          Class {s.class}{s.section}
                          {already && " · already in records"}
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
              {students.length === 0 && (
                <div className="text-xs text-[var(--text-muted)] text-center py-6">
                  No students found for Class {cls}{section}.
                </div>
              )}
            </div>
          </>
        )}

        <button
          onClick={submit}
          disabled={selected.size === 0}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
        >
          Add {selected.size > 0 ? `${selected.size} ` : ""}Students to Sports Records
        </button>
      </div>
    </ModalShell>
  );
}

function RecordModal({
  initial,
  onClose,
  onSave,
}: {
  initial: FitnessRecord | null;
  onClose: () => void;
  onSave: (rec: FitnessRecord) => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [cls, setCls] = useState(initial?.class || "");
  const [heightCm, setHeightCm] = useState(initial?.heightCm || 150);
  const [weightKg, setWeightKg] = useState(initial?.weightKg || 45);
  const [fitnessScore, setFitnessScore] = useState(initial?.fitnessScore || 70);
  const [mentalHealth, setMentalHealth] = useState<FitnessRecord["mentalHealth"]>(initial?.mentalHealth || "Good");
  const [sport, setSport] = useState(initial?.sport || "");
  const [status, setStatus] = useState(initial?.status || "");

  const bmi = computeBmi(heightCm, weightKg);
  const cat = bmiCategory(bmi);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: initial?.id || "", name, class: cls, heightCm, weightKg, fitnessScore, mentalHealth, sport, status });
  };

  return (
    <ModalShell title={initial ? "Edit Health Record" : "Add Health Record"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Student Name">
            <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Class">
            <input required value={cls} onChange={(e) => setCls(e.target.value)} placeholder="e.g. 10A" className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Height (cm)">
            <input required type="number" min={80} max={220} value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} className={inputCls} />
          </Field>
          <Field label="Weight (kg)">
            <input required type="number" min={15} max={150} value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} className={inputCls} />
          </Field>
        </div>
        <div className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-[var(--border-light)] text-sm font-semibold">
          Calculated BMI: <span className="font-black">{bmi}</span> — {cat.label}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label={`Fitness Score (${fitnessScore}%)`}>
            <input type="range" min={0} max={100} value={fitnessScore} onChange={(e) => setFitnessScore(Number(e.target.value))} className="w-full" />
          </Field>
          <Field label="Mental Health">
            <select value={mentalHealth} onChange={(e) => setMentalHealth(e.target.value as FitnessRecord["mentalHealth"])} className={inputCls}>
              {MENTAL.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Sport / Discipline">
          <input value={sport} onChange={(e) => setSport(e.target.value)} placeholder="e.g. Kabaddi" className={inputCls} />
        </Field>
        <Field label="Remarks">
          <input value={status} onChange={(e) => setStatus(e.target.value)} placeholder="e.g. District squad, monitor diet" className={inputCls} />
        </Field>
        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
          {initial ? "Save Changes" : "Add Record"}
        </button>
      </form>
    </ModalShell>
  );
}
