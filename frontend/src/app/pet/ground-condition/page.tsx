"use client";
import PortalLayout from "@/components/PortalLayout";
import { Map, Plus, Wrench, ClipboardList, Trash2, Landmark, TrendingUp } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { ModalShell, Field, inputCls } from "@/components/pet/PetUi";
import {
  Facility,
  FacilityStatus,
  MaintenanceLog,
  ImprovementPlan,
  ImprovementStatus,
  DEFAULT_FACILITIES,
  DEFAULT_MAINTENANCE,
  DEFAULT_IMPROVEMENTS,
  FACILITIES_KEY,
  MAINTENANCE_KEY,
  IMPROVEMENTS_KEY,
  petLoad,
  petSave,
  petId,
} from "@/lib/petData";

const IMPROVEMENT_STATUSES: ImprovementStatus[] = ["Proposed", "Submitted", "Approved", "In Progress", "Completed"];

const improvementStatusStyles: Record<ImprovementStatus, string> = {
  Proposed: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  Submitted: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "In Progress": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const STATUSES: FacilityStatus[] = ["Ready for Use", "Needs Maintenance", "Under Maintenance", "Unusable"];

const statusStyles: Record<FacilityStatus, string> = {
  "Ready for Use": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "Needs Maintenance": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Under Maintenance": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Unusable: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function GroundConditionPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [improvements, setImprovements] = useState<ImprovementPlan[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showAddFacility, setShowAddFacility] = useState(false);
  const [showAddImprovement, setShowAddImprovement] = useState(false);
  const [logFacility, setLogFacility] = useState<Facility | null>(null);

  useEffect(() => {
    setFacilities(petLoad(FACILITIES_KEY, DEFAULT_FACILITIES));
    setLogs(petLoad(MAINTENANCE_KEY, DEFAULT_MAINTENANCE));
    setImprovements(petLoad(IMPROVEMENTS_KEY, DEFAULT_IMPROVEMENTS));
    setLoaded(true);
  }, []);

  const saveImprovements = (next: ImprovementPlan[]) => {
    setImprovements(next);
    petSave(IMPROVEMENTS_KEY, next);
  };

  const saveFacilities = (next: Facility[]) => {
    setFacilities(next);
    petSave(FACILITIES_KEY, next);
  };

  const saveLogs = (next: MaintenanceLog[]) => {
    setLogs(next);
    petSave(MAINTENANCE_KEY, next);
  };

  const setStatus = (id: string, status: FacilityStatus) =>
    saveFacilities(facilities.map((f) => (f.id === id ? { ...f, status } : f)));

  const readyCount = facilities.filter((f) => f.status === "Ready for Use").length;
  const attention = facilities.length - readyCount;

  const recentLogs = useMemo(
    () => [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8),
    [logs]
  );

  const facilityName = (id: string) => facilities.find((f) => f.id === id)?.name || "—";

  return (
    <PortalLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-heading)]">Ground Condition & Maintenance</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {facilities.length} facilities · {readyCount} ready for use · {attention} need attention
            </p>
          </div>
          <button
            onClick={() => setShowAddFacility(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
          >
            <Plus size={16} /> Add Facility
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {facilities.map((f) => (
            <div key={f.id} className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border)] shadow-sm flex flex-col">
              <div className="flex items-start justify-between mb-4 gap-2">
                <h3 className="text-base font-bold flex items-center gap-2 text-[var(--text-heading)]">
                  <Map className="text-green-500 shrink-0" size={18} /> {f.name}
                </h3>
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full whitespace-nowrap ${statusStyles[f.status]}`}>
                  {f.status}
                </span>
              </div>
              <div className="space-y-2.5 text-sm flex-1">
                <Row label="Type" value={f.type} />
                <Row label="Surface" value={f.surface} />
                <Row label="Last Maintained" value={f.lastMaintained} />
                {f.notes && <div className="text-xs text-[var(--text-muted)] pt-1 border-t border-[var(--border-light)]">{f.notes}</div>}
              </div>
              <div className="flex gap-2 mt-4">
                <select
                  value={f.status}
                  onChange={(e) => setStatus(f.id, e.target.value as FacilityStatus)}
                  className="flex-1 px-2 py-2 rounded-xl border border-[var(--border)] bg-transparent text-xs font-semibold focus:outline-none focus:border-blue-500"
                  title="Update status"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  onClick={() => setLogFacility(f)}
                  className="px-3 py-2 rounded-xl border border-[var(--border)] text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-[var(--text-heading)]"
                  title="Log maintenance work"
                >
                  <Wrench size={13} /> Log Work
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Remove ${f.name}?`)) saveFacilities(facilities.filter((x) => x.id !== f.id));
                  }}
                  className="px-2.5 py-2 rounded-xl border border-[var(--border)] text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Remove facility"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Facility improvement plans — TN sports development schemes */}
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-3">
            <div className="font-bold text-[var(--text-heading)] flex items-center gap-2">
              <TrendingUp size={16} /> Facility Improvement Plans
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider hidden md:inline">
                SDAT · Khelo India · Sports for All · MP/MLA Fund
              </span>
            </div>
            <button
              onClick={() => setShowAddImprovement(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <Plus size={13} /> New Proposal
            </button>
          </div>
          <div className="divide-y divide-[var(--border-light)]">
            {improvements.map((p) => (
              <div key={p.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[var(--text-heading)]">{p.title}</div>
                  <div className="text-xs text-[var(--text-muted)] font-semibold mt-0.5 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1"><Landmark size={11} /> {p.scheme}</span>
                    <span>· Est. {p.estimate}</span>
                  </div>
                  {p.notes && <div className="text-xs text-[var(--text-muted)] mt-1">{p.notes}</div>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={p.status}
                    onChange={(e) =>
                      saveImprovements(improvements.map((x) => (x.id === p.id ? { ...x, status: e.target.value as ImprovementStatus } : x)))
                    }
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border-0 focus:outline-none cursor-pointer ${improvementStatusStyles[p.status]}`}
                    title="Update status"
                  >
                    {IMPROVEMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      if (confirm("Remove this proposal?")) saveImprovements(improvements.filter((x) => x.id !== p.id));
                    }}
                    className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete proposal"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {loaded && improvements.length === 0 && (
              <div className="p-8 text-center text-[var(--text-muted)] text-sm">No improvement proposals yet.</div>
            )}
          </div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] bg-slate-50 dark:bg-slate-800/50 font-bold text-[var(--text-heading)] flex items-center gap-2">
            <ClipboardList size={16} /> Recent Maintenance Log
          </div>
          <div className="divide-y divide-[var(--border-light)]">
            {recentLogs.map((l) => (
              <div key={l.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-[var(--text-heading)]">{l.work}</div>
                  <div className="text-xs text-[var(--text-muted)] font-semibold mt-0.5">
                    {facilityName(l.facilityId)} · by {l.by}
                  </div>
                </div>
                <div className="text-xs font-bold text-[var(--text-muted)] whitespace-nowrap">{l.date}</div>
              </div>
            ))}
            {loaded && recentLogs.length === 0 && (
              <div className="p-8 text-center text-[var(--text-muted)] text-sm">No maintenance work logged yet.</div>
            )}
          </div>
        </div>
      </div>

      {showAddFacility && (
        <AddFacilityModal
          onClose={() => setShowAddFacility(false)}
          onAdd={(f) => {
            saveFacilities([...facilities, { ...f, id: petId() }]);
            setShowAddFacility(false);
          }}
        />
      )}

      {showAddImprovement && (
        <AddImprovementModal
          onClose={() => setShowAddImprovement(false)}
          onAdd={(p) => {
            saveImprovements([{ ...p, id: petId() }, ...improvements]);
            setShowAddImprovement(false);
          }}
        />
      )}

      {logFacility && (
        <LogWorkModal
          facility={logFacility}
          onClose={() => setLogFacility(null)}
          onLog={(work, by) => {
            const date = new Date().toISOString().slice(0, 10);
            saveLogs([{ id: petId(), facilityId: logFacility.id, date, work, by }, ...logs]);
            saveFacilities(facilities.map((f) => (f.id === logFacility.id ? { ...f, lastMaintained: date } : f)));
            setLogFacility(null);
          }}
        />
      )}
    </PortalLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="font-bold text-[var(--text-heading)]">{value}</span>
    </div>
  );
}

function AddFacilityModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (f: Omit<Facility, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Outdoor Court");
  const [surface, setSurface] = useState("");
  const [status, setStatus] = useState<FacilityStatus>("Ready for Use");
  const [notes, setNotes] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name, type, surface, status, lastMaintained: new Date().toISOString().slice(0, 10), notes: notes || undefined });
  };

  return (
    <ModalShell title="Add Facility" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Facility Name">
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Handball Court" className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Type">
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
              {["Outdoor Field", "Outdoor Court", "Track", "Indoor", "Field Event Area", "Other"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Surface">
            <input required value={surface} onChange={(e) => setSurface(e.target.value)} placeholder="e.g. Concrete" className={inputCls} />
          </Field>
        </div>
        <Field label="Current Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as FacilityStatus)} className={inputCls}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Notes (optional)">
          <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
        </Field>
        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
          Add Facility
        </button>
      </form>
    </ModalShell>
  );
}

const TN_SCHEMES = [
  "SDAT Infrastructure Grant",
  "Khelo India — School Infrastructure",
  "CM's Anaivarukkum Viliyattu (Sports for All)",
  "MP / MLA Local Area Development Fund",
  "Samagra Shiksha (Sports & Physical Education Grant)",
  "PTA / School Management Committee",
  "Corporate CSR",
  "Other",
];

function AddImprovementModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (p: Omit<ImprovementPlan, "id">) => void;
}) {
  const [title, setTitle] = useState("");
  const [scheme, setScheme] = useState(TN_SCHEMES[0]);
  const [estimate, setEstimate] = useState("");
  const [status, setStatus] = useState<ImprovementStatus>("Proposed");
  const [notes, setNotes] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ title, scheme, estimate: estimate || "TBD", status, notes: notes || undefined });
  };

  return (
    <ModalShell title="New Facility Improvement Proposal" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Improvement / Work Description">
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Synthetic basketball court with lighting" className={inputCls} />
        </Field>
        <Field label="Funding Scheme / Authority">
          <select value={scheme} onChange={(e) => setScheme(e.target.value)} className={inputCls}>
            {TN_SCHEMES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Cost Estimate">
            <input value={estimate} onChange={(e) => setEstimate(e.target.value)} placeholder="e.g. ₹5 L" className={inputCls} />
          </Field>
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as ImprovementStatus)} className={inputCls}>
              {IMPROVEMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Notes (optional)">
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
        </Field>
        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
          Add Proposal
        </button>
      </form>
    </ModalShell>
  );
}

function LogWorkModal({
  facility,
  onClose,
  onLog,
}: {
  facility: Facility;
  onClose: () => void;
  onLog: (work: string, by: string) => void;
}) {
  const [work, setWork] = useState("");
  const [by, setBy] = useState("Ground Staff");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onLog(work, by);
  };

  return (
    <ModalShell title={`Log Maintenance — ${facility.name}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Work Done">
          <textarea required rows={3} value={work} onChange={(e) => setWork(e.target.value)} placeholder="e.g. Court swept, net replaced" className={inputCls} />
        </Field>
        <Field label="Done By">
          <input required value={by} onChange={(e) => setBy(e.target.value)} className={inputCls} />
        </Field>
        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
          Save Log Entry
        </button>
      </form>
    </ModalShell>
  );
}
