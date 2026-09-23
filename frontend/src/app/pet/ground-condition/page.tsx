"use client";
import PortalLayout from "@/components/PortalLayout";
import PETPortalBanner from "@/components/PETPortalBanner";
import { Map, Plus, Wrench, ClipboardList, Trash2, Landmark, TrendingUp, Pencil } from "lucide-react";
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
import {
  fetchFacilities,
  fetchImprovements,
  fetchLogs,
  createFacilityApi,
  createImprovementApi,
  createLogApi,
  updateFacilityApi,
  updateImprovementApi,
  deleteFacilityApi,
  deleteImprovementApi,
  updateLogApi,
  deleteLogApi,
} from "@/lib/petGroundsApi";

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
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [editingImprovement, setEditingImprovement] = useState<ImprovementPlan | null>(null);
  const [editingLog, setEditingLog] = useState<MaintenanceLog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; type: "facility" | "proposal" | "log" } | null>(null);

  const loadData = async () => {
    const [facs, imps, lgs] = await Promise.all([
      fetchFacilities(),
      fetchImprovements(),
      fetchLogs(),
    ]);
    const validFacs = Array.isArray(facs) && facs.length > 0 ? facs.filter((f) => f && f.id) : petLoad(FACILITIES_KEY, DEFAULT_FACILITIES);
    const validImps = Array.isArray(imps) && imps.length > 0 ? imps.filter((i) => i && i.id) : petLoad(IMPROVEMENTS_KEY, DEFAULT_IMPROVEMENTS);
    const validLogs = Array.isArray(lgs) && lgs.length > 0 ? lgs.filter((l) => l && l.id) : petLoad(MAINTENANCE_KEY, DEFAULT_MAINTENANCE);
    setFacilities(validFacs);
    setImprovements(validImps);
    setLogs(validLogs);
    setLoaded(true);
  };

  useEffect(() => {
    loadData();
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
      <div className="p-6 w-full mx-auto space-y-6">
        <PETPortalBanner
          pageKey="ground"
          customDesc={`${facilities.length} facilities · ${readyCount} ready for use · ${attention} need attention`}
          rightElement={
            <button
              onClick={() => setShowAddFacility(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Plus size={16} /> Add Facility
            </button>
          }
        />

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
                  onClick={() => setEditingFacility(f)}
                  className="px-2.5 py-2 rounded-xl border border-[var(--border)] text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  title="Edit facility"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: f.id, name: f.name, type: "facility" })}
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
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between gap-3">
            <div className="font-extrabold text-[var(--text-heading)] flex items-center gap-2 text-base">
              <TrendingUp size={18} className="text-blue-500" /> Facility Improvement Plans
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider hidden md:inline">
                SDAT · Khelo India · Sports for All · MP/MLA Fund
              </span>
            </div>
            <button
              onClick={() => setShowAddImprovement(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus size={14} /> New Proposal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {improvements.map((p) => (
              <div key={p.id} className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border)] shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-base font-bold text-[var(--text-heading)] leading-snug">{p.title}</h4>
                    <select
                      value={p.status}
                      onChange={async (e) => {
                        const nextStatus = e.target.value as ImprovementStatus;
                        await updateImprovementApi(p.id, { status: nextStatus });
                        saveImprovements(improvements.map((x) => (x.id === p.id ? { ...x, status: nextStatus } : x)));
                      }}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border-0 focus:outline-none cursor-pointer shrink-0 ${improvementStatusStyles[p.status]}`}
                      title="Update status"
                    >
                      {IMPROVEMENT_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 text-sm">
                    <Row label="Funding Scheme" value={p.scheme} />
                    <Row label="Cost Estimate" value={`Est. ${p.estimate}`} />
                    {p.notes && <div className="text-xs text-[var(--text-muted)] pt-1 border-t border-[var(--border-light)]">{p.notes}</div>}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-light)]">
                  <button
                    onClick={() => setEditingImprovement(p)}
                    className="px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs font-bold text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-1.5"
                    title="Edit proposal"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: p.id, name: p.title, type: "proposal" })}
                    className="px-2.5 py-1.5 rounded-xl border border-[var(--border)] text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete proposal"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            {loaded && improvements.length === 0 && (
              <div className="col-span-full bg-[var(--bg-card)] p-8 rounded-2xl border border-[var(--border)] text-center text-[var(--text-muted)] text-sm font-medium">
                No improvement proposals logged yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="font-extrabold text-[var(--text-heading)] flex items-center gap-2 text-base">
            <ClipboardList size={18} className="text-amber-500" /> Recent Maintenance Log ({recentLogs.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {recentLogs.map((l) => (
              <div key={l.id} className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border)] shadow-sm flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-base font-bold text-[var(--text-heading)] leading-snug">{l.work}</h4>
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 whitespace-nowrap shrink-0">
                      {l.date}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <Row label="Facility" value={facilityName(l.facilityId)} />
                    <Row label="Maintained By" value={l.by} />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-light)]">
                  <button
                    onClick={() => setEditingLog(l)}
                    className="px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs font-bold text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-1.5"
                    title="Edit maintenance log"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: l.id, name: l.work, type: "log" })}
                    className="px-2.5 py-1.5 rounded-xl border border-[var(--border)] text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete log"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            {loaded && recentLogs.length === 0 && (
              <div className="col-span-full bg-[var(--bg-card)] p-8 rounded-2xl border border-[var(--border)] text-center text-[var(--text-muted)] text-sm font-medium">
                No maintenance work logged yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[var(--text-heading)]">
                Delete {deleteTarget.type === "facility" ? "Facility" : deleteTarget.type === "proposal" ? "Improvement Proposal" : "Maintenance Log"}?
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-medium mt-1">
                Are you sure you want to delete <span className="font-bold text-[var(--text-heading)]">"{deleteTarget.name}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (deleteTarget.type === "facility") {
                    await deleteFacilityApi(deleteTarget.id);
                    saveFacilities(facilities.filter((x) => x.id !== deleteTarget.id));
                  } else if (deleteTarget.type === "proposal") {
                    await deleteImprovementApi(deleteTarget.id);
                    saveImprovements(improvements.filter((x) => x.id !== deleteTarget.id));
                  } else {
                    await deleteLogApi(deleteTarget.id);
                    saveLogs(logs.filter((x) => x.id !== deleteTarget.id));
                  }
                  setDeleteTarget(null);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddFacility && (
        <AddFacilityModal
          onClose={() => setShowAddFacility(false)}
          onAdd={async (f) => {
            const created = await createFacilityApi(f);
            saveFacilities([...facilities, created]);
            setShowAddFacility(false);
          }}
        />
      )}

      {editingFacility && (
        <EditFacilityModal
          facility={editingFacility}
          onClose={() => setEditingFacility(null)}
          onSave={async (updated) => {
            await updateFacilityApi(updated.id, updated);
            saveFacilities(facilities.map((x) => (x.id === updated.id ? updated : x)));
            setEditingFacility(null);
          }}
        />
      )}

      {showAddImprovement && (
        <AddImprovementModal
          onClose={() => setShowAddImprovement(false)}
          onAdd={async (p) => {
            const created = await createImprovementApi(p);
            saveImprovements([created, ...improvements]);
            setShowAddImprovement(false);
          }}
        />
      )}

      {editingImprovement && (
        <EditImprovementModal
          improvement={editingImprovement}
          onClose={() => setEditingImprovement(null)}
          onSave={async (updated) => {
            await updateImprovementApi(updated.id, updated);
            saveImprovements(improvements.map((x) => (x.id === updated.id ? updated : x)));
            setEditingImprovement(null);
          }}
        />
      )}

      {editingLog && (
        <EditLogModal
          log={editingLog}
          facilities={facilities}
          onClose={() => setEditingLog(null)}
          onSave={async (updated) => {
            await updateLogApi(updated.id, updated);
            saveLogs(logs.map((x) => (x.id === updated.id ? updated : x)));
            setEditingLog(null);
          }}
        />
      )}

      {logFacility && (
        <LogWorkModal
          facility={logFacility}
          onClose={() => setLogFacility(null)}
          onLog={async (work, by) => {
            const date = new Date().toISOString().slice(0, 10);
            const createdLog = await createLogApi({ facilityId: logFacility.id, date, work, by });
            saveLogs([createdLog, ...logs]);
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

function EditFacilityModal({
  facility,
  onClose,
  onSave,
}: {
  facility: Facility;
  onClose: () => void;
  onSave: (updated: Facility) => void;
}) {
  const [name, setName] = useState(facility.name);
  const [type, setType] = useState(facility.type);
  const [surface, setSurface] = useState(facility.surface);
  const [status, setStatus] = useState<FacilityStatus>(facility.status);
  const [notes, setNotes] = useState(facility.notes || "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...facility, name, type, surface, status, notes: notes || undefined });
  };

  return (
    <ModalShell title={`Edit Facility — ${facility.name}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Facility Name">
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
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
            <input required value={surface} onChange={(e) => setSurface(e.target.value)} className={inputCls} />
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
          Save Changes
        </button>
      </form>
    </ModalShell>
  );
}

function EditImprovementModal({
  improvement,
  onClose,
  onSave,
}: {
  improvement: ImprovementPlan;
  onClose: () => void;
  onSave: (updated: ImprovementPlan) => void;
}) {
  const [title, setTitle] = useState(improvement.title);
  const [scheme, setScheme] = useState(improvement.scheme);
  const [estimate, setEstimate] = useState(improvement.estimate);
  const [status, setStatus] = useState<ImprovementStatus>(improvement.status);
  const [notes, setNotes] = useState(improvement.notes || "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...improvement, title, scheme, estimate, status, notes: notes || undefined });
  };

  return (
    <ModalShell title={`Edit Proposal — ${improvement.title}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Improvement / Work Description">
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
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
            <input value={estimate} onChange={(e) => setEstimate(e.target.value)} className={inputCls} />
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
          Save Changes
        </button>
      </form>
    </ModalShell>
  );
}

function EditLogModal({
  log,
  facilities,
  onClose,
  onSave,
}: {
  log: MaintenanceLog;
  facilities: Facility[];
  onClose: () => void;
  onSave: (updated: MaintenanceLog) => void;
}) {
  const [work, setWork] = useState(log.work);
  const [facilityId, setFacilityId] = useState(log.facilityId);
  const [by, setBy] = useState(log.by);
  const [date, setDate] = useState(log.date);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...log, work, facilityId, by, date });
  };

  return (
    <ModalShell title="Edit Maintenance Log" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Maintenance Work Description">
          <input required value={work} onChange={(e) => setWork(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Target Facility">
          <select value={facilityId} onChange={(e) => setFacilityId(e.target.value)} className={inputCls}>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Maintained By">
            <input required value={by} onChange={(e) => setBy(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Date">
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
          Save Changes
        </button>
      </form>
    </ModalShell>
  );
}
