"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import PETPortalBanner from "@/components/PETPortalBanner";
import {
  Search, HeartPulse, Brain, Plus, Pencil, Trash2, Users, WifiOff, Ruler, Scale,
  Activity, Flame, Dumbbell, Zap, Wind, Waves, Eye, Droplets, Stethoscope,
  LayoutGrid, List, Download, ClipboardCheck, CalendarCheck, AlertTriangle, Database,
  Sparkles, CheckCircle2, X, Filter, ArrowUpRight, ChevronRight, RefreshCw, ShieldAlert
} from "lucide-react";
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

// Modernized color badge styling palette
const BADGE_STYLES: Record<"green" | "blue" | "amber" | "red", { bg: string; border: string; text: string; dot: string }> = {
  green: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    border: "border-emerald-500/30",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  blue: {
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    border: "border-blue-500/30",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  amber: {
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    border: "border-amber-500/30",
    text: "text-amber-800 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  red: {
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
    border: "border-rose-500/30",
    text: "text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
  },
};

const AVATAR_GRADIENTS = [
  "from-blue-600 via-indigo-600 to-violet-600",
  "from-emerald-600 via-teal-600 to-cyan-600",
  "from-violet-600 via-purple-600 to-fuchsia-600",
  "from-rose-600 via-pink-600 to-red-600",
  "from-amber-500 via-orange-600 to-red-600",
];

const avatarGradient = (name: string) =>
  AVATAR_GRADIENTS[name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_GRADIENTS.length];

function needsAttention(r: FitnessRecord): string[] {
  const reasons: string[] = [];
  const bmi = computeBmi(r.heightCm, r.weightKg);
  if (bmi > 0 && bmiCategory(bmi).tone !== "green") reasons.push(`BMI ${bmiCategory(bmi).label}`);
  if (r.fitnessScore < 50) reasons.push("Low fitness score");
  if (r.mentalHealth === "Stressed") reasons.push("High Stress");
  if (r.health.restingHeartRate > 100) reasons.push("High resting HR");
  if (r.health.vision === "Needs Check") reasons.push("Vision check due");
  if (activityStatus(r.activityLevel, r.weeklyActivityHrs).tone === "red") reasons.push("Low activity");
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
  const [source, setSource] = useState<"server" | "local">("local");

  useEffect(() => {
    (async () => {
      try {
        const recs = await fetchFitnessRecords();
        setRecords(recs);
        petSave(RECORDS_KEY, recs);
        setSource("server");
      } catch {
        setRecords(petLoad(RECORDS_KEY, DEFAULT_RECORDS).map(normalizeFitnessRecord));
        setSource("local");
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persist = (next: FitnessRecord[]) => {
    setRecords(next);
    petSave(RECORDS_KEY, next);
  };

  const addRecord = async (rec: FitnessRecord) => {
    const tempId = rec.id || petId();
    const newRec = { ...rec, id: tempId };
    const updated = [newRec, ...records];
    persist(updated);
    if (source === "server") {
      try {
        const created = await createFitnessRecord(rec);
        persist([created, ...records.filter((r) => r.id !== tempId)]);
      } catch (err) {
        console.warn("Could not sync record to server, saved locally:", err);
      }
    }
  };

  const editRecord = async (rec: FitnessRecord) => {
    // Optimistic UI update: update state immediately so front-end reflects changes right away
    const updated = records.map((r) => (r.id === rec.id ? rec : r));
    persist(updated);
    if (source === "server") {
      try {
        await updateFitnessRecord(rec);
      } catch (err) {
        console.warn("Could not sync update to server, saved locally:", err);
      }
    }
  };

  const removeRecord = async (rec: FitnessRecord) => {
    if (!confirm(`Remove record for ${rec.name}?`)) return;
    const updated = records.filter((r) => r.id !== rec.id);
    persist(updated);
    if (source === "server") {
      try {
        await deleteFitnessRecord(rec.id);
      } catch (err) {
        console.warn("Could not sync deletion to server, saved locally:", err);
      }
    }
  };

  const addBulk = async (students: { name: string; class: string; sport: string }[]) => {
    const drafts = students.map((s) =>
      normalizeFitnessRecord({
        id: petId(),
        name: s.name,
        class: s.class,
        fitnessScore: 70,
        sport: s.sport,
        status: "New — measurements pending",
      })
    );
    persist([...drafts, ...records]);
    if (source === "server") {
      try {
        const created = await createFitnessRecordsBulk(drafts);
        const draftIds = new Set(drafts.map((d) => d.id));
        persist([...created, ...records.filter((r) => !draftIds.has(r.id))]);
      } catch (err) {
        console.warn("Could not sync bulk students to server, saved locally:", err);
      }
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

  // Statistics calculations
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
  }, [records]);

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
      <div className="p-4 sm:p-6 w-full space-y-6 text-slate-800 dark:text-slate-100">
        
        {/* ── Top Header Banner & Quick Actions ───────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/20">
                  <Activity size={20} />
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Student Records & Health
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
                Comprehensive physical health indicators, BMI analytics, fitness scores, and sports readiness metrics for all students.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={exportCsv}
                className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 border border-slate-700 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download size={15} className="text-blue-400" /> Export CSV
              </button>
              <button
                onClick={() => setShowClassAdd(true)}
                className="px-4 py-2.5 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-emerald-900/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Users size={15} /> Add by Class
              </button>
              <button
                onClick={() => setShowAdd(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={16} /> Add Record
              </button>
            </div>
          </div>
        </div>

        {/* ── High-Impact Metric Dashboard ────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Students Tracked"
            value={records.length}
            sub={`${measured.length} measured · ${records.length - measured.length} pending`}
            icon={Users}
            gradient="from-blue-500 to-indigo-600"
            iconBg="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          />
          <MetricCard
            title="Average BMI"
            value={avgBmi ? `${avgBmi}` : "—"}
            sub={`${bmiDist.Healthy}/${measured.length} students in healthy range`}
            icon={Scale}
            gradient="from-violet-500 to-purple-600"
            iconBg="bg-violet-500/10 text-violet-600 dark:text-violet-400"
          />
          <MetricCard
            title="Avg Fitness Score"
            value={`${avgFitness}%`}
            sub={`Overall Grade: ${fitnessGrade(avgFitness).label}`}
            icon={HeartPulse}
            gradient="from-emerald-500 to-teal-600"
            iconBg="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          />
          <MetricCard
            title="Needs Attention"
            value={attentionList.length}
            sub={avgActivityHrs ? `Avg activity ${avgActivityHrs} hrs/week` : "Requires physical review"}
            icon={AlertTriangle}
            gradient="from-amber-500 to-rose-600"
            iconBg="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          />
        </div>

        {/* ── Modern Controls, Filters & Search ───────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-4">
          
          {/* Glass Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Filter by student name or sport discipline..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-slate-400 hidden sm:block" />
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
              >
                {classes.map((c) => (
                  <option key={c} value={c}>{c === "All" ? "All Classes" : `Class ${c}`}</option>
                ))}
              </select>

              <select
                value={bmiFilter}
                onChange={(e) => setBmiFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
              >
                {["All", "Underweight", "Healthy", "Overweight", "Obese", "Pending"].map((c) => (
                  <option key={c} value={c}>{c === "All" ? "All BMI Status" : c === "Pending" ? "Pending Measurements" : c}</option>
                ))}
              </select>
            </div>

            {/* Segmented View Switcher */}
            <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setView("table")}
                className={`px-4 py-1.5 flex items-center gap-2 text-xs font-bold rounded-xl transition-all ${
                  view === "table"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <List size={15} /> Table
              </button>
              <button
                onClick={() => setView("cards")}
                className={`px-4 py-1.5 flex items-center gap-2 text-xs font-bold rounded-xl transition-all ${
                  view === "cards"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <LayoutGrid size={15} /> Cards
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Data View (Table / Cards) ─────────────────────── */}
        {view === "table" ? (
          <ModernTable
            records={filtered}
            loaded={loaded}
            onView={setViewing}
            onEdit={setEditing}
            onDelete={removeRecord}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s) => (
              <ModernCard
                key={s.id}
                record={s}
                onView={() => setViewing(s)}
                onEdit={() => setEditing(s)}
                onDelete={() => removeRecord(s)}
              />
            ))}
            {loaded && filtered.length === 0 && (
              <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <Search size={36} className="mx-auto mb-3 text-slate-400" />
                <div className="text-base font-bold text-slate-800 dark:text-white">No matching student records</div>
                <div className="text-xs text-slate-500 mt-1">Try resetting filters or adding new student records.</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Dialog Modals ───────────────────────────────────────── */}
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
// Metric Card
// ---------------------------------------------------------------------------
function MetricCard({
  title,
  value,
  sub,
  icon: Icon,
  gradient,
  iconBg,
}: {
  title: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3 transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</div>
        </div>
        <div className={`p-3 rounded-2xl ${iconBg}`}>
          <Icon size={22} />
        </div>
      </div>
      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{sub}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modern Table View
// ---------------------------------------------------------------------------
function ModernTable({
  records,
  loaded,
  onView,
  onEdit,
  onDelete,
}: {
  records: FitnessRecord[];
  loaded: boolean;
  onView: (r: FitnessRecord) => void;
  onEdit: (r: FitnessRecord) => void;
  onDelete: (r: FitnessRecord) => void;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
              <th className="py-4 px-5">Student</th>
              <th className="py-4 px-5">Height / Weight</th>
              <th className="py-4 px-5">BMI Status</th>
              <th className="py-4 px-5">Fitness Assessment</th>
              <th className="py-4 px-5">Activity</th>
              <th className="py-4 px-5">Health Flags</th>
              <th className="py-4 px-5">Remarks</th>
              <th className="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {records.map((s) => {
              const bmi = computeBmi(s.heightCm, s.weightKg);
              const cat = bmiCategory(bmi);
              const tone = BADGE_STYLES[cat.tone];
              const grade = fitnessGrade(s.fitnessScore);
              const act = activityStatus(s.activityLevel, s.weeklyActivityHrs);
              const hr = heartRateStatus(s.health.restingHeartRate);

              return (
                <tr
                  key={s.id}
                  onClick={() => onView(s)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  {/* Student */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${avatarGradient(s.name)} text-white flex items-center justify-center font-black text-sm shadow-md shrink-0`}>
                        {s.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">{s.name}</div>
                        <div className="text-[11px] text-slate-400 font-semibold truncate">Class {s.class} · {s.sport || "General"}</div>
                      </div>
                    </div>
                  </td>

                  {/* Measurements */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    {s.heightCm > 0 && s.weightKg > 0 ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[11px]">
                          <Ruler size={11} /> {s.heightCm} cm
                        </span>
                        <div />
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold text-[11px]">
                          <Scale size={11} /> {s.weightKg} kg
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Measurements pending</span>
                    )}
                  </td>

                  {/* BMI */}
                  <td className="py-4 px-5 whitespace-nowrap">
                    {bmi > 0 ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${tone.bg} ${tone.border} ${tone.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
                        {bmi} · {cat.label}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Fitness */}
                  <td className="py-4 px-5">
                    <div className="space-y-1.5 min-w-[130px]">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-black text-slate-800 dark:text-slate-200">{s.fitnessScore}%</span>
                        <span className="text-[10px] font-bold text-slate-400">{grade.label}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            s.fitnessScore >= 80 ? "bg-emerald-500" : s.fitnessScore >= 65 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${s.fitnessScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Activity */}
                  <td className="py-4 px-5">
                    <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Flame size={13} className="text-orange-500" /> {s.activityLevel}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 mt-0.5">{s.weeklyActivityHrs} hrs/week</div>
                  </td>

                  {/* Health */}
                  <td className="py-4 px-5">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${BADGE_STYLES[hr.tone].bg} ${BADGE_STYLES[hr.tone].text} ${BADGE_STYLES[hr.tone].border}`}>
                        <HeartPulse size={10} /> {s.health.restingHeartRate ? `${s.health.restingHeartRate} bpm` : "HR —"}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${
                        s.mentalHealth === "Stressed" ? BADGE_STYLES.amber.bg : BADGE_STYLES.green.bg
                      } ${s.mentalHealth === "Stressed" ? BADGE_STYLES.amber.text : BADGE_STYLES.green.text}`}>
                        <Brain size={10} /> {s.mentalHealth}
                      </span>
                    </div>
                  </td>

                  {/* Remarks */}
                  <td className="py-4 px-5 text-slate-500 dark:text-slate-400 max-w-[140px] truncate font-medium">
                    {s.status}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onEdit(s)}
                      className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                      title="Edit Student"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(s)}
                      className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {loaded && records.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">No student records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modern Card View
// ---------------------------------------------------------------------------
function ModernCard({
  record: s,
  onView,
  onEdit,
  onDelete,
}: {
  record: FitnessRecord;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const bmi = computeBmi(s.heightCm, s.weightKg);
  const cat = bmiCategory(bmi);
  const tone = BADGE_STYLES[cat.tone];
  const act = activityStatus(s.activityLevel, s.weeklyActivityHrs);
  const alerts = needsAttention(s);

  return (
    <div
      onClick={onView}
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md hover:border-blue-500/40 transition-all cursor-pointer space-y-4 flex flex-col justify-between"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatarGradient(s.name)} text-white flex items-center justify-center font-black text-base shadow-md shrink-0`}>
              {s.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{s.name}</h3>
              <p className="text-xs font-semibold text-slate-400">Class {s.class} · {s.sport || "General"}</p>
            </div>
          </div>
          <FitnessRing score={s.fitnessScore} size={48} />
        </div>

        {/* 3-Pill Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-[9px] font-bold uppercase text-slate-400">Height</div>
            <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">{s.heightCm > 0 ? `${s.heightCm} cm` : "—"}</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-[9px] font-bold uppercase text-slate-400">Weight</div>
            <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">{s.weightKg > 0 ? `${s.weightKg} kg` : "—"}</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-[9px] font-bold uppercase text-slate-400">BMI</div>
            <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">{bmi > 0 ? bmi : "—"}</div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          {bmi > 0 && (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${tone.bg} ${tone.border} ${tone.text}`}>
              {cat.label}
            </span>
          )}
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 ${BADGE_STYLES[act.tone].bg} ${BADGE_STYLES[act.tone].text} ${BADGE_STYLES[act.tone].border}`}>
            <Flame size={11} /> {s.activityLevel}
          </span>
        </div>

        {/* Warnings */}
        {alerts.length > 0 && (
          <div className="flex items-start gap-2 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold">
            <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-500" />
            <span className="truncate">{alerts.join(" · ")}</span>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
        <span className="text-xs text-slate-400 font-medium truncate pr-2">{s.status}</span>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors" title="Edit">
            <Pencil size={15} />
          </button>
          <button onClick={onDelete} className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors" title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Circular SVG score ring
function FitnessRing({ score, size }: { score: number; size: number }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = score >= 80 ? "#10b981" : score >= 65 ? "#f59e0b" : "#f43f5e";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-slate-100 dark:text-slate-800" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-900 dark:text-white">{score}</span>
    </div>
  );
}

// Dynamic class-wise physical fitness test standards & age-appropriate criteria
function getClassAssessmentMeta(studentClass: string) {
  const num = parseInt((studentClass || "").replace(/\D/g, ""), 10) || 10;

  if (num <= 5) {
    // Primary School (Class 1 to 5)
    return {
      gradeLabel: "Primary School (Class 1-5 Standard)",
      meta: [
        { key: "endurance" as const, label: "Endurance", icon: Wind, hint: "200m / 300m run (Class 1-5)", color: "bg-cyan-500" },
        { key: "strength" as const, label: "Strength", icon: Dumbbell, hint: "Standing broad jump / Curl-ups", color: "bg-violet-500" },
        { key: "flexibility" as const, label: "Flexibility", icon: Waves, hint: "Sit & reach test", color: "bg-emerald-500" },
        { key: "speed" as const, label: "Speed", icon: Zap, hint: "30m dash sprint", color: "bg-amber-500" },
      ],
    };
  } else if (num <= 8) {
    // Middle School (Class 6 to 8)
    return {
      gradeLabel: "Middle School (Class 6-8 Standard)",
      meta: [
        { key: "endurance" as const, label: "Endurance", icon: Wind, hint: "400m run / shuttle run (Class 6-8)", color: "bg-cyan-500" },
        { key: "strength" as const, label: "Strength", icon: Dumbbell, hint: "Modified push-ups / Sit-ups", color: "bg-violet-500" },
        { key: "flexibility" as const, label: "Flexibility", icon: Waves, hint: "Sit & reach test", color: "bg-emerald-500" },
        { key: "speed" as const, label: "Speed", icon: Zap, hint: "40m dash sprint", color: "bg-amber-500" },
      ],
    };
  } else if (num <= 10) {
    // High School (Class 9 to 10)
    return {
      gradeLabel: "High School (Class 9-10 Standard)",
      meta: [
        { key: "endurance" as const, label: "Endurance", icon: Wind, hint: "600m run / beep test (Class 9-10)", color: "bg-cyan-500" },
        { key: "strength" as const, label: "Strength", icon: Dumbbell, hint: "Standard sit-ups / push-ups", color: "bg-violet-500" },
        { key: "flexibility" as const, label: "Flexibility", icon: Waves, hint: "Sit & reach test", color: "bg-emerald-500" },
        { key: "speed" as const, label: "Speed", icon: Zap, hint: "50m dash", color: "bg-amber-500" },
      ],
    };
  } else {
    // Higher Secondary (Class 11 to 12)
    return {
      gradeLabel: "Higher Secondary (Class 11-12 Standard)",
      meta: [
        { key: "endurance" as const, label: "Endurance", icon: Wind, hint: "800m run / 12-min Cooper test (Class 11-12)", color: "bg-cyan-500" },
        { key: "strength" as const, label: "Strength", icon: Dumbbell, hint: "Pull-ups & max push-ups", color: "bg-violet-500" },
        { key: "flexibility" as const, label: "Flexibility", icon: Waves, hint: "Advanced sit & reach", color: "bg-emerald-500" },
        { key: "speed" as const, label: "Speed", icon: Zap, hint: "100m sprint", color: "bg-amber-500" },
      ],
    };
  }
}

function ProfileModal({ record: s, onClose, onEdit }: { record: FitnessRecord; onClose: () => void; onEdit: () => void }) {
  const bmi = computeBmi(s.heightCm, s.weightKg);
  const cat = bmiCategory(bmi);
  const grade = fitnessGrade(s.fitnessScore);
  const hr = heartRateStatus(s.health.restingHeartRate);
  const alerts = needsAttention(s);
  const { gradeLabel, meta } = getClassAssessmentMeta(s.class);

  return (
    <ModalShell title="Student Health & Fitness Profile" onClose={onClose} wide>
      <div className="space-y-6">
        {/* Profile Card */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarGradient(s.name)} text-white flex items-center justify-center font-black text-xl shadow-md`}>
              {s.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">{s.name}</h2>
              <p className="text-xs text-slate-400 font-semibold">Class {s.class} · {s.sport || "General Fitness"}</p>
              {s.status && <p className="text-xs text-blue-500 font-semibold mt-0.5">{s.status}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FitnessRing score={s.fitnessScore} size={54} />
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Overall Grade</div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border inline-block ${BADGE_STYLES[grade.tone].bg} ${BADGE_STYLES[grade.tone].text} ${BADGE_STYLES[grade.tone].border}`}>
                {grade.label}
              </span>
            </div>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold">
            <AlertTriangle size={16} className="shrink-0 text-amber-500 mt-0.5" />
            <span>Health Attention Flag: {alerts.join(" · ")}</span>
          </div>
        )}

        {/* Measurements */}
        <section className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Ruler size={14} className="text-blue-500" /> Body Measurements
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-[10px] font-bold uppercase text-slate-400">Height</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{s.heightCm > 0 ? `${s.heightCm} cm` : "—"}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-[10px] font-bold uppercase text-slate-400">Weight</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{s.weightKg > 0 ? `${s.weightKg} kg` : "—"}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-[10px] font-bold uppercase text-slate-400">BMI</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{bmi > 0 ? bmi : "—"}</div>
              {bmi > 0 && (
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${BADGE_STYLES[cat.tone].bg} ${BADGE_STYLES[cat.tone].text} ${BADGE_STYLES[cat.tone].border}`}>
                  {cat.label}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Fitness Sub-scores */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ClipboardCheck size={14} className="text-blue-500" /> Fitness Performance Breakdown
            </h4>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
              {gradeLabel}
            </span>
          </div>
          <div className="space-y-3">
            {meta.map(({ key, label, icon: Icon, hint, color }) => (
              <div key={key} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-44 shrink-0">
                  <Icon size={14} className="text-slate-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{label}</span>
                    <span className="text-[10px] text-slate-400 font-medium block">{hint}</span>
                  </div>
                </div>
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${s.assessment[key]}%` }} />
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white w-8 text-right">{s.assessment[key]}</span>
              </div>
            ))}
          </div>
        </section>

        <button
          onClick={onEdit}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Pencil size={15} /> Edit Record
        </button>
      </div>
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// Add Students by Class Modal
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
    <ModalShell title="Add Students by Class Roster" onClose={onClose} wide>
      <div className="space-y-4 text-xs">
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 h-[38px] transition-all shadow-md"
          >
            <Search size={14} /> {loading ? "Loading..." : "Load Roster"}
          </button>
        </div>

        {offline && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-medium">
            Backend API offline — roster search unavailable. Use "Add Record" for manual entry.
          </div>
        )}

        {fetched && !offline && (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {students.map((s) => {
              const already = existingNames.has(`${s.name}|${s.class}${s.section}`);
              return (
                <label
                  key={s.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border ${
                    already ? "opacity-50" : "cursor-pointer hover:border-blue-500"
                  } ${selected.has(s.id) ? "bg-blue-50 dark:bg-blue-950/30 border-blue-500" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800"}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      disabled={already}
                      checked={selected.has(s.id)}
                      onChange={() => toggle(s.id)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                      <div className="text-[10px] text-slate-400">Class {s.class}{s.section}</div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        <button
          onClick={submit}
          disabled={selected.size === 0}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-md"
        >
          Add {selected.size > 0 ? `${selected.size} ` : ""}Students to Records
        </button>
      </div>
    </ModalShell>
  );
}

// ---------------------------------------------------------------------------
// Add / Edit Single Record Modal
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
  const [heightCm, setHeightCm] = useState<number>(initial?.heightCm ?? 0);
  const [weightKg, setWeightKg] = useState<number>(initial?.weightKg ?? 0);
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
      mentalHealth, sport, status: status || (heightCm > 0 && weightKg > 0 ? "Measured" : "New — measurements pending"),
    });
  };

  return (
    <ModalShell title={initial ? "Edit Student Fitness Record" : "Add Student Fitness Record"} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-5 text-xs">
        {/* Student General Info */}
        <section className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Users size={14} className="text-blue-500" /> Student Profile Info
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Student Name">
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className={inputCls} />
            </Field>
            <Field label="Class / Section">
              <input required value={cls} onChange={(e) => setCls(e.target.value)} placeholder="e.g. 10A" className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sport / Discipline">
              <input value={sport} onChange={(e) => setSport(e.target.value)} placeholder="e.g. Athletics" className={inputCls} />
            </Field>
            <Field label="Remarks / Notes">
              <input value={status} onChange={(e) => setStatus(e.target.value)} placeholder="e.g. District squad player" className={inputCls} />
            </Field>
          </div>
        </section>

        {/* Body Measurements */}
        <section className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Ruler size={14} className="text-blue-500" /> Height & Weight
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Height (cm)">
              <input
                type="number"
                min={0}
                max={250}
                value={heightCm === 0 ? "" : heightCm}
                onChange={(e) => setHeightCm(e.target.value === "" ? 0 : Number(e.target.value))}
                placeholder="Enter height in cm (e.g. 150)"
                className={inputCls}
              />
            </Field>
            <Field label="Weight (kg)">
              <input
                type="number"
                min={0}
                max={250}
                value={weightKg === 0 ? "" : weightKg}
                onChange={(e) => setWeightKg(e.target.value === "" ? 0 : Number(e.target.value))}
                placeholder="Enter weight in kg (e.g. 45)"
                className={inputCls}
              />
            </Field>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between font-bold">
            <span>Calculated BMI: <span className="text-slate-900 dark:text-white">{bmi > 0 ? bmi : "— (Pending Measurements)"}</span></span>
            {bmi > 0 && <span className="text-blue-600 dark:text-blue-400">{cat.label}</span>}
          </div>
        </section>

        {/* Fitness Assessment Sliders */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ClipboardCheck size={14} className="text-blue-500" /> Fitness Performance
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                {getClassAssessmentMeta(cls).gradeLabel}
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">Score: {fitnessScore}% ({grade.label})</span>
            </div>
          </div>
          <div className="space-y-3">
            {getClassAssessmentMeta(cls).meta.map(({ key, label, hint }) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-44 shrink-0">
                  <div className="font-bold text-slate-900 dark:text-white">{label}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{hint}</div>
                </div>
                <input
                  type="range" min={0} max={100}
                  value={assessment[key] as number}
                  onChange={(e) => setAssess(key, Number(e.target.value))}
                  className="flex-1 accent-blue-600"
                />
                <span className="font-black text-slate-900 dark:text-white w-8 text-right">{assessment[key]}</span>
              </div>
            ))}
          </div>
        </section>

        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg mt-2"
        >
          {initial ? "Save Changes" : "Create Fitness Record"}
        </button>
      </form>
    </ModalShell>
  );
}
