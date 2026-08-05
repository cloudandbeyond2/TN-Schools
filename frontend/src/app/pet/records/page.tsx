"use client";
import PortalLayout from "@/components/PortalLayout";
import PETPortalBanner from "@/components/PETPortalBanner";
import {
  Search, HeartPulse, Brain, Plus, Pencil, Trash2, Users, WifiOff, Ruler, Scale,
  Activity, Flame, Dumbbell, Zap, Wind, Waves, Eye, Droplets, Stethoscope,
  LayoutGrid, List, Download, ClipboardCheck, CalendarCheck, AlertTriangle, Cloud,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { ModalShell, Field, inputCls } from "@/components/pet/PetUi";
import {
  FitnessRecord,
  FitnessAssessment,
  HealthIndicators,
  ActivityLevel,
  ACTIVITY_LEVELS,
  DEFAULT_RECORDS,
  RECORDS_KEY,
  PET_API_BASE,
  petLoad,
  petSave,
  petId,
  computeBmi,
  bmiCategory,
  overallFitness,
  fitnessGrade,
  heartRateStatus,
  activityStatus,
  normalizeFitnessRecord,
} from "@/lib/petData";
import {
  fetchFitnessRecords,
  createFitnessRecord,
  createFitnessRecordsBulk,
  updateFitnessRecord,
  deleteFitnessRecord,
} from "@/lib/petFitnessApi";

const SPORT_OPTIONS = [
  "Athletics", "Football", "Volleyball", "Kabaddi", "Kho-Kho", "Cricket", "Basketball",
  "Throwball", "Handball", "Ball Badminton", "Badminton", "Table Tennis", "Chess", "Yoga", "General Fitness",
];

const MENTAL: FitnessRecord["mentalHealth"][] = ["Excellent", "Good", "Average", "Stressed"];
const BLOOD_GROUPS = ["", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const VISION_OPTIONS: HealthIndicators["vision"][] = ["Normal", "Glasses", "Needs Check"];

// Badge tones shared across the page (light + dark variants).
const TONES: Record<"green" | "blue" | "amber" | "red", string> = {
  green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const AVATAR_COLORS = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-rose-500", "bg-amber-500", "bg-cyan-500"];
const avatarColor = (name: string) =>
  AVATAR_COLORS[name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];

// A student needs attention when any tracked signal is off-target.
function needsAttention(r: FitnessRecord): string[] {
  const reasons: string[] = [];
  const bmi = computeBmi(r.heightCm, r.weightKg);
  if (bmi > 0 && bmiCategory(bmi).tone !== "green") reasons.push(`BMI ${bmiCategory(bmi).label}`);
  if (r.fitnessScore < 50) reasons.push("Low fitness score");
  if (r.mentalHealth === "Stressed") reasons.push("Stressed");
  if (r.health.restingHeartRate > 100) reasons.push("High resting HR");
  if (r.health.vision === "Needs Check") reasons.push("Vision check due");
  if (activityStatus(r.activityLevel, r.weeklyActivityHrs).tone === "red") reasons.push("Low physical activity");
  return reasons;
}

export default function StudentRecordsPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const [records, setRecords] = useState<FitnessRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [bmiFilter, setBmiFilter] = useState("All");
  const [view, setView] = useState<"table" | "cards">("table");
  const [editing, setEditing] = useState<FitnessRecord | null>(null);
  const [viewing, setViewing] = useState<FitnessRecord | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showClassAdd, setShowClassAdd] = useState(false);

  // "server": records live in the school database (all edits hit the API,
  // localStorage doubles as a cache so the dashboard stays in sync).
  // "local": backend unreachable — device-local records, as before.
  const [source, setSource] = useState<"server" | "local">("local");

  useEffect(() => {
    (async () => {
      try {
        const recs = await fetchFitnessRecords();
        setRecords(recs);
        petSave(RECORDS_KEY, recs);
        setSource("server");
      } catch {
        // Normalize older localStorage snapshots to the extended schema.
        setRecords(petLoad(RECORDS_KEY, DEFAULT_RECORDS).map(normalizeFitnessRecord));
        setSource("local");
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Update state + localStorage cache (single source of truth for the UI).
  const persist = (next: FitnessRecord[]) => {
    setRecords(next);
    petSave(RECORDS_KEY, next);
  };

  const syncFailed = (action: string, err: unknown) => {
    alert(`Could not ${action} on the server — ${err instanceof Error ? err.message : "request failed"}. Please retry.`);
  };

  const addRecord = async (rec: FitnessRecord) => {
    if (source === "server") {
      try {
        const created = await createFitnessRecord(rec);
        persist([created, ...records]);
      } catch (err) {
        syncFailed("add the record", err);
      }
    } else {
      persist([{ ...rec, id: petId() }, ...records]);
    }
  };

  const editRecord = async (rec: FitnessRecord) => {
    if (source === "server") {
      try {
        const updated = await updateFitnessRecord(rec);
        persist(records.map((r) => (r.id === updated.id ? updated : r)));
      } catch (err) {
        syncFailed("save the changes", err);
      }
    } else {
      persist(records.map((r) => (r.id === rec.id ? rec : r)));
    }
  };

  const removeRecord = async (rec: FitnessRecord) => {
    if (!confirm(`Remove record for ${rec.name}?`)) return;
    if (source === "server") {
      try {
        await deleteFitnessRecord(rec.id);
        persist(records.filter((r) => r.id !== rec.id));
      } catch (err) {
        syncFailed("delete the record", err);
      }
    } else {
      persist(records.filter((r) => r.id !== rec.id));
    }
  };

  const addBulk = async (students: { name: string; class: string; sport: string }[]) => {
    const drafts = students.map((s) =>
      normalizeFitnessRecord({
        id: "",
        name: s.name,
        class: s.class,
        fitnessScore: 70,
        sport: s.sport,
        status: "New — measurements pending",
      })
    );
    if (source === "server") {
      try {
        const created = await createFitnessRecordsBulk(drafts);
        persist([...created, ...records]);
      } catch (err) {
        syncFailed("register the students", err);
      }
    } else {
      persist([...drafts.map((d) => ({ ...d, id: petId() })), ...records]);
    }
  };

  const classes = useMemo(() => ["All", ...Array.from(new Set(records.map((r) => r.class))).sort()], [records]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return records
      .filter((r) => classFilter === "All" || r.class === classFilter)
      .filter((r) => {
        if (bmiFilter === "All") return true;
        const bmi = computeBmi(r.heightCm, r.weightKg);
        if (bmiFilter === "Pending") return bmi === 0;
        return bmi > 0 && bmiCategory(bmi).label === bmiFilter;
      })
      .filter((r) => !q || r.name.toLowerCase().includes(q) || r.sport.toLowerCase().includes(q));
  }, [records, search, classFilter, bmiFilter]);

  // ── Summary stats ────────────────────────────────────────────────
  const measured = records.filter((r) => r.heightCm > 0 && r.weightKg > 0);
  const avgFitness = records.length
    ? Math.round(records.reduce((a, r) => a + r.fitnessScore, 0) / records.length)
    : 0;
  const avgBmi = measured.length
    ? Math.round((measured.reduce((a, r) => a + computeBmi(r.heightCm, r.weightKg), 0) / measured.length) * 10) / 10
    : 0;
  const avgActivityHrs = records.length
    ? Math.round((records.reduce((a, r) => a + r.weeklyActivityHrs, 0) / records.length) * 10) / 10
    : 0;
  const attentionList = records.filter((r) => needsAttention(r).length > 0);

  const bmiDist = useMemo(() => {
    const dist = { Underweight: 0, Healthy: 0, Overweight: 0, Obese: 0 };
    measured.forEach((r) => {
      const label = bmiCategory(computeBmi(r.heightCm, r.weightKg)).label as keyof typeof dist;
      if (label in dist) dist[label]++;
    });
    return dist;
  }, [records]); // eslint-disable-line react-hooks/exhaustive-deps

  const exportCsv = () => {
    const header = [
      "Name", "Class", "Sport", "Height (cm)", "Weight (kg)", "BMI", "BMI Category",
      "Fitness Score", "Endurance", "Strength", "Flexibility", "Speed", "Last Assessed",
      "Activity Level", "Weekly Activity (hrs)", "Resting HR", "Blood Group", "Vision",
      "Last Checkup", "Mental Health", "Remarks",
    ];
    const rows = filtered.map((r) => {
      const bmi = computeBmi(r.heightCm, r.weightKg);
      return [
        r.name, r.class, r.sport, r.heightCm || "", r.weightKg || "", bmi || "",
        bmi ? bmiCategory(bmi).label : "", r.fitnessScore, r.assessment.endurance,
        r.assessment.strength, r.assessment.flexibility, r.assessment.speed,
        r.assessment.lastAssessed || "", r.activityLevel, r.weeklyActivityHrs,
        r.health.restingHeartRate || "", r.health.bloodGroup, r.health.vision,
        r.health.lastCheckup || "", r.mentalHealth, r.status,
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
    });
    const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student-fitness-records.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PortalLayout>
      <div className="p-6 w-full space-y-6">
        {/* ── Header ─────────────────────────────────────────────── */}
        <PETPortalBanner
          pageKey="records"
          rightElement={
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={exportCsv}
                className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] hover:border-blue-400 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors text-[var(--text-heading)]"
                title="Export filtered records as CSV"
              >
                <Download size={15} /> Export
              </button>
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
          }
        />


        {/* ── Summary stat cards ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20"
            title="Students Tracked" value={String(records.length)}
            sub={`${measured.length} measured · ${records.length - measured.length} pending`}
          />
          <StatCard
            icon={Scale} color="text-violet-500" bg="bg-violet-50 dark:bg-violet-900/20"
            title="Average BMI" value={avgBmi ? String(avgBmi) : "—"}
            sub={`${bmiDist.Healthy}/${measured.length} in healthy range`}
          />
          <StatCard
            icon={HeartPulse} color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-900/20"
            title="Avg Fitness Score" value={`${avgFitness}%`}
            sub={fitnessGrade(avgFitness).label}
          />
          <StatCard
            icon={AlertTriangle} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20"
            title="Need Attention" value={String(attentionList.length)}
            sub={avgActivityHrs ? `Avg activity ${avgActivityHrs} hrs/week` : "No activity data"}
          />
        </div>

        {/* ── BMI distribution ───────────────────────────────────── */}
        {measured.length > 0 && (
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[var(--text-heading)] flex items-center gap-2">
                <Scale size={15} className="text-violet-500" /> Class BMI Distribution
              </h3>
              <span className="text-xs font-semibold text-[var(--text-muted)]">{measured.length} students measured</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              {([
                ["Underweight", "bg-amber-400"],
                ["Healthy", "bg-green-500"],
                ["Overweight", "bg-orange-400"],
                ["Obese", "bg-red-500"],
              ] as const).map(([label, cls]) =>
                bmiDist[label] > 0 ? (
                  <div
                    key={label}
                    className={`${cls} transition-all`}
                    style={{ width: `${(bmiDist[label] / measured.length) * 100}%` }}
                    title={`${label}: ${bmiDist[label]}`}
                  />
                ) : null
              )}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs font-semibold text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Underweight ({bmiDist.Underweight})</span>
              <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Healthy ({bmiDist.Healthy})</span>
              <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" /> Overweight ({bmiDist.Overweight})</span>
              <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Obese ({bmiDist.Obese})</span>
            </div>
          </div>
        )}

        {/* ── Filters & view toggle ──────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <input
              type="text"
              placeholder="Search student or sport..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-blue-500"
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
          <select
            value={bmiFilter}
            onChange={(e) => setBmiFilter(e.target.value)}
            className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-sm font-semibold focus:outline-none"
          >
            {["All", "Underweight", "Healthy", "Overweight", "Obese", "Pending"].map((c) => (
              <option key={c} value={c}>{c === "All" ? "All BMI" : c === "Pending" ? "Measurements Pending" : c}</option>
            ))}
          </select>
          <div className="flex rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--bg-card)]">
            <button
              onClick={() => setView("table")}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm font-bold transition-colors ${view === "table" ? "bg-blue-600 text-white" : "text-[var(--text-muted)] hover:text-blue-600"}`}
              title="Table view"
            >
              <List size={15} /> Table
            </button>
            <button
              onClick={() => setView("cards")}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm font-bold transition-colors ${view === "cards" ? "bg-blue-600 text-white" : "text-[var(--text-muted)] hover:text-blue-600"}`}
              title="Card view"
            >
              <LayoutGrid size={15} /> Cards
            </button>
          </div>
        </div>

        {/* ── Records ────────────────────────────────────────────── */}
        {view === "table" ? (
          <RecordsTable
            records={filtered}
            loaded={loaded}
            onView={setViewing}
            onEdit={setEditing}
            onDelete={removeRecord}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <StudentCard
                key={s.id}
                record={s}
                onView={() => setViewing(s)}
                onEdit={() => setEditing(s)}
                onDelete={() => removeRecord(s)}
              />
            ))}
            {loaded && filtered.length === 0 && (
              <div className="col-span-full p-10 text-center text-[var(--text-muted)] bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]">
                No students match the current filter.
              </div>
            )}
          </div>
        )}
      </div>

      {viewing && (
        <ProfileModal
          record={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => {
            setEditing(viewing);
            setViewing(null);
          }}
        />
      )}

      {showClassAdd && (
        <ClassRosterModal
          schoolId={schoolId}
          existingNames={new Set(records.map((r) => `${r.name}|${r.class}`))}
          onClose={() => setShowClassAdd(false)}
          onAdd={(students) => {
            addBulk(students);
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
            if (editing) editRecord(rec);
            else addRecord(rec);
            setShowAdd(false);
            setEditing(null);
          }}
        />
      )}
    </PortalLayout>
  );
}

// ---------------------------------------------------------------------------
// Summary stat card
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon, color, bg, title, value, sub,
}: {
  icon: React.ElementType; color: string; bg: string; title: string; value: string; sub: string;
}) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-sm p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${bg}`}>
        <Icon size={22} className={color} />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{title}</div>
        <div className="text-2xl font-black text-[var(--text-heading)] mt-0.5">{value}</div>
        <div className="text-xs font-semibold text-[var(--text-muted)] mt-0.5 truncate">{sub}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table view
// ---------------------------------------------------------------------------

function RecordsTable({
  records, loaded, onView, onEdit, onDelete,
}: {
  records: FitnessRecord[];
  loaded: boolean;
  onView: (r: FitnessRecord) => void;
  onEdit: (r: FitnessRecord) => void;
  onDelete: (r: FitnessRecord) => void;
}) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border)] text-[var(--text-muted)] uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-4 font-bold">Student</th>
              <th className="p-4 font-bold">Height / Weight</th>
              <th className="p-4 font-bold">BMI</th>
              <th className="p-4 font-bold">Fitness</th>
              <th className="p-4 font-bold">Physical Activity</th>
              <th className="p-4 font-bold">Health</th>
              <th className="p-4 font-bold">Remarks</th>
              <th className="p-4 font-bold text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)]">
            {records.map((s) => {
              const bmi = computeBmi(s.heightCm, s.weightKg);
              const cat = bmiCategory(bmi);
              const grade = fitnessGrade(s.fitnessScore);
              const act = activityStatus(s.activityLevel, s.weeklyActivityHrs);
              const hr = heartRateStatus(s.health.restingHeartRate);
              return (
                <tr
                  key={s.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer"
                  onClick={() => onView(s)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${avatarColor(s.name)} text-white flex items-center justify-center font-black text-sm shrink-0`}>
                        {s.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[var(--text-heading)] truncate">{s.name}</div>
                        <div className="text-xs text-[var(--text-muted)] font-semibold truncate">
                          Class {s.class} · {s.sport || "—"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-semibold whitespace-nowrap">
                    {s.heightCm > 0 && s.weightKg > 0 ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs"><Ruler size={12} className="text-blue-400" /> {s.heightCm} cm</div>
                        <div className="flex items-center gap-1.5 text-xs"><Scale size={12} className="text-violet-400" /> {s.weightKg} kg</div>
                      </div>
                    ) : (
                      <span className="text-[var(--text-muted)]">— pending</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${TONES[cat.tone]}`}>
                      {bmi > 0 ? `${bmi} · ${cat.label}` : "—"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 min-w-[130px]">
                      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${s.fitnessScore >= 80 ? "bg-green-500" : s.fitnessScore >= 65 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${s.fitnessScore}%` }}
                        />
                      </div>
                      <span className="font-bold text-xs">{s.fitnessScore}%</span>
                    </div>
                    <div className={`mt-1 text-[10px] font-bold ${grade.tone === "green" ? "text-green-600" : grade.tone === "blue" ? "text-blue-600" : grade.tone === "amber" ? "text-amber-600" : "text-red-500"}`}>
                      {grade.label}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs font-bold text-[var(--text-heading)] flex items-center gap-1.5">
                      <Flame size={12} className="text-orange-500" /> {s.activityLevel}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] font-semibold mt-0.5">{s.weeklyActivityHrs} hrs/week</div>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${TONES[act.tone]}`}>{act.label}</span>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-max ${TONES[hr.tone]}`}>
                        <HeartPulse size={10} /> {s.health.restingHeartRate ? `${s.health.restingHeartRate} bpm` : "HR —"}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-max ${
                        s.mentalHealth === "Stressed" ? TONES.amber : TONES.green
                      }`}>
                        <Brain size={10} /> {s.mentalHealth}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-[var(--text-muted)] font-semibold max-w-[160px]">
                    <div className="truncate" title={s.status}>{s.status}</div>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onEdit(s)} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => onDelete(s)} className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {loaded && records.length === 0 && (
              <tr>
                <td colSpan={8} className="p-10 text-center text-[var(--text-muted)]">No students match the current filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card view
// ---------------------------------------------------------------------------

function StudentCard({
  record: s, onView, onEdit, onDelete,
}: {
  record: FitnessRecord;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const bmi = computeBmi(s.heightCm, s.weightKg);
  const cat = bmiCategory(bmi);
  const act = activityStatus(s.activityLevel, s.weeklyActivityHrs);
  const alerts = needsAttention(s);
  return (
    <div
      className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-sm p-5 space-y-4 hover:border-blue-400 transition-colors cursor-pointer"
      onClick={onView}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-11 h-11 rounded-full ${avatarColor(s.name)} text-white flex items-center justify-center font-black shrink-0`}>
            {s.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-[var(--text-heading)] truncate">{s.name}</div>
            <div className="text-xs text-[var(--text-muted)] font-semibold truncate">Class {s.class} · {s.sport || "—"}</div>
          </div>
        </div>
        <FitnessRing score={s.fitnessScore} size={48} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-2">
          <div className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Height</div>
          <div className="text-sm font-black text-[var(--text-heading)]">{s.heightCm > 0 ? `${s.heightCm}` : "—"}<span className="text-[10px] font-bold text-[var(--text-muted)]"> cm</span></div>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-2">
          <div className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Weight</div>
          <div className="text-sm font-black text-[var(--text-heading)]">{s.weightKg > 0 ? `${s.weightKg}` : "—"}<span className="text-[10px] font-bold text-[var(--text-muted)]"> kg</span></div>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-2">
          <div className="text-[10px] font-bold uppercase text-[var(--text-muted)]">BMI</div>
          <div className="text-sm font-black text-[var(--text-heading)]">{bmi > 0 ? bmi : "—"}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {bmi > 0 && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${TONES[cat.tone]}`}>{cat.label}</span>}
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${TONES[act.tone]}`}>
          <Flame size={10} /> {s.activityLevel} · {s.weeklyActivityHrs}h/wk
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${s.mentalHealth === "Stressed" ? TONES.amber : TONES.green}`}>
          <Brain size={10} /> {s.mentalHealth}
        </span>
      </div>

      {alerts.length > 0 && (
        <div className="flex items-start gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
          <AlertTriangle size={12} className="shrink-0 mt-0.5" /> {alerts.join(" · ")}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-[var(--border-light)]" onClick={(e) => e.stopPropagation()}>
        <span className="text-[11px] font-semibold text-[var(--text-muted)] truncate pr-2">{s.status}</span>
        <div className="flex shrink-0">
          <button onClick={onEdit} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" title="Edit">
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Circular fitness score indicator.
function FitnessRing({ score, size }: { score: number; size: number }) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = score >= 80 ? "#22c55e" : score >= 65 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} title={`Fitness score ${score}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-slate-100 dark:text-slate-800" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-[var(--text-heading)]">{score}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Student profile modal — full fitness & health breakdown
// ---------------------------------------------------------------------------

const ASSESSMENT_META = [
  { key: "endurance" as const, label: "Endurance", icon: Wind, hint: "600m run / beep test", color: "bg-cyan-500" },
  { key: "strength" as const, label: "Strength", icon: Dumbbell, hint: "Sit-ups / push-ups", color: "bg-violet-500" },
  { key: "flexibility" as const, label: "Flexibility", icon: Waves, hint: "Sit & reach", color: "bg-emerald-500" },
  { key: "speed" as const, label: "Speed", icon: Zap, hint: "50m dash", color: "bg-amber-500" },
];

function ProfileModal({ record: s, onClose, onEdit }: { record: FitnessRecord; onClose: () => void; onEdit: () => void }) {
  const bmi = computeBmi(s.heightCm, s.weightKg);
  const cat = bmiCategory(bmi);
  const grade = fitnessGrade(s.fitnessScore);
  const hr = heartRateStatus(s.health.restingHeartRate);
  const act = activityStatus(s.activityLevel, s.weeklyActivityHrs);
  const alerts = needsAttention(s);

  return (
    <ModalShell title="Student Fitness Profile" onClose={onClose} wide>
      <div className="space-y-5">
        {/* Identity + score */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${avatarColor(s.name)} text-white flex items-center justify-center font-black text-xl`}>
              {s.name.charAt(0)}
            </div>
            <div>
              <div className="text-lg font-black text-[var(--text-heading)]">{s.name}</div>
              <div className="text-sm text-[var(--text-muted)] font-semibold">Class {s.class} · {s.sport || "No sport assigned"}</div>
              {s.status && <div className="text-xs text-[var(--text-muted)] font-semibold mt-0.5">{s.status}</div>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FitnessRing score={s.fitnessScore} size={64} />
            <div>
              <div className="text-xs font-bold uppercase text-[var(--text-muted)]">Overall</div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${TONES[grade.tone]}`}>{grade.label}</span>
            </div>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm font-semibold">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <span>Attention: {alerts.join(" · ")}</span>
          </div>
        )}

        {/* Body measurements */}
        <section>
          <SectionTitle icon={Ruler} text="Body Measurements" />
          <div className="grid grid-cols-3 gap-3">
            <MetricTile label="Height" value={s.heightCm > 0 ? `${s.heightCm} cm` : "Pending"} />
            <MetricTile label="Weight" value={s.weightKg > 0 ? `${s.weightKg} kg` : "Pending"} />
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 text-center">
              <div className="text-[10px] font-bold uppercase text-[var(--text-muted)]">BMI</div>
              <div className="text-base font-black text-[var(--text-heading)]">{bmi > 0 ? bmi : "—"}</div>
              {bmi > 0 && <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${TONES[cat.tone]}`}>{cat.label}</span>}
            </div>
          </div>
        </section>

        {/* Fitness assessment */}
        <section>
          <SectionTitle
            icon={ClipboardCheck}
            text="Fitness Assessment"
            right={s.assessment.lastAssessed ? `Last assessed ${s.assessment.lastAssessed}` : "Not assessed yet"}
          />
          <div className="space-y-3">
            {ASSESSMENT_META.map(({ key, label, icon: Icon, hint, color }) => (
              <div key={key} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-32 shrink-0">
                  <Icon size={14} className="text-[var(--text-muted)]" />
                  <span className="text-xs font-bold text-[var(--text-heading)]">{label}</span>
                </div>
                <div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${s.assessment[key]}%` }} />
                </div>
                <span className="text-xs font-black w-9 text-right">{s.assessment[key]}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-semibold w-28 hidden sm:block">{hint}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Physical activity */}
        <section>
          <SectionTitle icon={Activity} text="Physical Activity" />
          <div className="grid grid-cols-3 gap-3">
            <MetricTile label="Activity Level" value={s.activityLevel} />
            <MetricTile label="Weekly Activity" value={`${s.weeklyActivityHrs} hrs`} />
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 text-center flex flex-col items-center justify-center">
              <div className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">WHO Target</div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${TONES[act.tone]}`}>{act.label}</span>
            </div>
          </div>
        </section>

        {/* Health indicators */}
        <section>
          <SectionTitle icon={Stethoscope} text="Health Indicators" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 text-center">
              <div className="text-[10px] font-bold uppercase text-[var(--text-muted)] flex items-center justify-center gap-1"><HeartPulse size={11} /> Resting HR</div>
              <div className="text-base font-black text-[var(--text-heading)]">{s.health.restingHeartRate ? `${s.health.restingHeartRate}` : "—"}<span className="text-[10px] font-bold text-[var(--text-muted)]"> bpm</span></div>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${TONES[hr.tone]}`}>{hr.label}</span>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 text-center">
              <div className="text-[10px] font-bold uppercase text-[var(--text-muted)] flex items-center justify-center gap-1"><Droplets size={11} /> Blood Group</div>
              <div className="text-base font-black text-[var(--text-heading)]">{s.health.bloodGroup || "—"}</div>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 text-center">
              <div className="text-[10px] font-bold uppercase text-[var(--text-muted)] flex items-center justify-center gap-1"><Eye size={11} /> Vision</div>
              <div className="text-sm font-black text-[var(--text-heading)] mt-1">{s.health.vision}</div>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 text-center">
              <div className="text-[10px] font-bold uppercase text-[var(--text-muted)] flex items-center justify-center gap-1"><Brain size={11} /> Mental Health</div>
              <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${s.mentalHealth === "Stressed" ? TONES.amber : TONES.green}`}>{s.mentalHealth}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs font-semibold text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <CalendarCheck size={12} /> Last checkup: {s.health.lastCheckup || "not recorded"}
            </span>
            {s.health.notes && <span>Notes: {s.health.notes}</span>}
          </div>
        </section>

        <button
          onClick={onEdit}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Pencil size={15} /> Edit Record
        </button>
      </div>
    </ModalShell>
  );
}

function SectionTitle({ icon: Icon, text, right }: { icon: React.ElementType; text: string; right?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
        <Icon size={13} /> {text}
      </h4>
      {right && <span className="text-[11px] font-semibold text-[var(--text-muted)]">{right}</span>}
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 text-center">
      <div className="text-[10px] font-bold uppercase text-[var(--text-muted)]">{label}</div>
      <div className="text-base font-black text-[var(--text-heading)] mt-0.5">{value}</div>
    </div>
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

function ClassRosterModal({
  existingNames,
  schoolId,
  onClose,
  onAdd,
}: {
  existingNames: Set<string>;
  schoolId?: string;
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
      let url = `${PET_API_BASE}/api/students?class=${encodeURIComponent(cls)}&section=${encodeURIComponent(section)}`;
      if (schoolId) url += `&schoolId=${schoolId}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
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

// ---------------------------------------------------------------------------
// Add / edit record modal — sectioned form covering measurements, assessment,
// activity and health indicators. Overall fitness score is derived from the
// four assessment components.
// ---------------------------------------------------------------------------

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
  const [assessment, setAssessment] = useState<FitnessAssessment>(
    initial?.assessment ?? { endurance: 70, strength: 70, flexibility: 70, speed: 70 }
  );
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(initial?.activityLevel || "Moderate");
  const [weeklyActivityHrs, setWeeklyActivityHrs] = useState(initial?.weeklyActivityHrs ?? 5);
  const [health, setHealth] = useState<HealthIndicators>(
    initial?.health ?? { restingHeartRate: 0, bloodGroup: "", vision: "Normal" }
  );
  const [mentalHealth, setMentalHealth] = useState<FitnessRecord["mentalHealth"]>(initial?.mentalHealth || "Good");
  const [sport, setSport] = useState(initial?.sport || "");
  const [status, setStatus] = useState(initial?.status || "");

  const bmi = computeBmi(heightCm, weightKg);
  const cat = bmiCategory(bmi);
  const fitnessScore = overallFitness(assessment);
  const grade = fitnessGrade(fitnessScore);

  const setAssess = (key: keyof FitnessAssessment, value: number | string) =>
    setAssessment((a) => ({ ...a, [key]: value }));
  const setHealthField = <K extends keyof HealthIndicators>(key: K, value: HealthIndicators[K]) =>
    setHealth((h) => ({ ...h, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initial?.id || "",
      name, class: cls, heightCm, weightKg,
      fitnessScore, assessment, activityLevel, weeklyActivityHrs, health,
      mentalHealth, sport, status,
    });
  };

  return (
    <ModalShell title={initial ? "Edit Fitness Record" : "Add Fitness Record"} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-5">
        {/* Student */}
        <section>
          <SectionTitle icon={Users} text="Student" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Student Name">
              <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Class">
              <input required value={cls} onChange={(e) => setCls(e.target.value)} placeholder="e.g. 10A" className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Field label="Sport / Discipline">
              <input value={sport} onChange={(e) => setSport(e.target.value)} placeholder="e.g. Kabaddi" className={inputCls} />
            </Field>
            <Field label="Remarks">
              <input value={status} onChange={(e) => setStatus(e.target.value)} placeholder="e.g. District squad, monitor diet" className={inputCls} />
            </Field>
          </div>
        </section>

        {/* Body measurements */}
        <section>
          <SectionTitle icon={Ruler} text="Body Measurements" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Height (cm)">
              <input required type="number" min={80} max={220} value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Weight (kg)">
              <input required type="number" min={15} max={150} value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} className={inputCls} />
            </Field>
          </div>
          <div className={`mt-3 px-4 py-2.5 rounded-xl border text-sm font-semibold flex items-center justify-between ${
            cat.tone === "green"
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : cat.tone === "red"
              ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
          }`}>
            <span>Calculated BMI: <span className="font-black">{bmi || "—"}</span></span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${TONES[cat.tone]}`}>{cat.label}</span>
          </div>
        </section>

        {/* Fitness assessment */}
        <section>
          <SectionTitle icon={ClipboardCheck} text="Fitness Assessment" right={`Overall ${fitnessScore}% · ${grade.label}`} />
          <div className="space-y-3">
            {ASSESSMENT_META.map(({ key, label, icon: Icon, hint }) => (
              <div key={key} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-36 shrink-0">
                  <Icon size={14} className="text-[var(--text-muted)]" />
                  <div>
                    <div className="text-xs font-bold text-[var(--text-heading)]">{label}</div>
                    <div className="text-[10px] text-[var(--text-muted)] font-semibold">{hint}</div>
                  </div>
                </div>
                <input
                  type="range" min={0} max={100}
                  value={assessment[key] as number}
                  onChange={(e) => setAssess(key, Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs font-black w-9 text-right">{assessment[key]}</span>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Field label="Assessment Date">
              <input
                type="date"
                value={assessment.lastAssessed || ""}
                onChange={(e) => setAssess("lastAssessed", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        </section>

        {/* Physical activity */}
        <section>
          <SectionTitle icon={Activity} text="Physical Activity" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Activity Level">
              <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)} className={inputCls}>
                {ACTIVITY_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </Field>
            <Field label={`Weekly Activity (${weeklyActivityHrs} hrs)`}>
              <input
                type="range" min={0} max={20}
                value={weeklyActivityHrs}
                onChange={(e) => setWeeklyActivityHrs(Number(e.target.value))}
                className="w-full mt-2.5"
              />
            </Field>
          </div>
        </section>

        {/* Health indicators */}
        <section>
          <SectionTitle icon={Stethoscope} text="Health Indicators" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Resting Heart Rate (bpm, 0 if unknown)">
              <input type="number" min={0} max={220} value={health.restingHeartRate} onChange={(e) => setHealthField("restingHeartRate", Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Blood Group">
              <select value={health.bloodGroup} onChange={(e) => setHealthField("bloodGroup", e.target.value)} className={inputCls}>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g || "unknown"} value={g}>{g || "Unknown"}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Field label="Vision">
              <select value={health.vision} onChange={(e) => setHealthField("vision", e.target.value as HealthIndicators["vision"])} className={inputCls}>
                {VISION_OPTIONS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Mental Health">
              <select value={mentalHealth} onChange={(e) => setMentalHealth(e.target.value as FitnessRecord["mentalHealth"])} className={inputCls}>
                {MENTAL.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Field label="Last Health Checkup">
              <input type="date" value={health.lastCheckup || ""} onChange={(e) => setHealthField("lastCheckup", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Health Notes (allergies, conditions)">
              <input value={health.notes || ""} onChange={(e) => setHealthField("notes", e.target.value)} placeholder="e.g. Dust allergy" className={inputCls} />
            </Field>
          </div>
        </section>

        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
          {initial ? "Save Changes" : "Add Record"}
        </button>
      </form>
    </ModalShell>
  );
}
