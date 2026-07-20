"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { getDefaultFeatureCatalog, MODULE_PORTALS, PORTAL_DISPLAY } from "@/lib/moduleCatalog";

interface ModuleItem {
  _id: string;
  key: string;
  name: string;
  icon?: string;
  description?: string;
  category?: string;
  routes: string[];
  portals: Record<string, boolean>;
  isEnabled: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const portalColors: Record<string, string> = {
  STUDENT: "#6366f1", TEACHER: "#f59e0b", PARENT: "#10b981", HEADMASTER: "#3b82f6",
  BEO: "#8b5cf6", DEO: "#ec4899", COMMISSIONER: "#06b6d4", MINISTER: "#ef4444",
};

const CATEGORY_OPTIONS = ["Academic", "AI & Learning", "Content", "Analytics", "Welfare", "Communication", "Finance", "Extracurricular", "Support"];

export default function DepartmentModules() {
  const { data: session } = useSession();
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState("All");
  const [filterPortal, setFilterPortal] = useState<string>("All");
  const [showModal, setShowModal] = useState(false);
  const [newMod, setNewMod] = useState({
    name: "", icon: "📌", description: "", category: "Academic", route: "",
    portals: Object.fromEntries(MODULE_PORTALS.map((p) => [p, false])) as Record<string, boolean>,
  });
  const token = (session?.user as any)?.backendToken || (session as any)?.backendToken;

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!token) {
      setLoading(false);
      setError("Not authenticated. Missing token.");
      return;
    }
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/features?kind=MODULE`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (cancelled) return;

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setModules(data.data);
          setError(null);
        } else if (data.success) {
          // First run: seed the default catalog, then keep modules
          const syncRes = await fetch(`${API_URL}/api/features/sync`, {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({ items: getDefaultFeatureCatalog() }),
          });
          const syncData = await syncRes.json();
          if (!cancelled && syncData.success) {
            setModules(syncData.data.filter((m: ModuleItem & { kind: string }) => m.kind === "MODULE"));
            setError(null);
          } else if (!cancelled) {
            setError(syncData.error || "Failed to seed module catalog");
          }
        } else {
          setError(data.error || "Failed to load modules");
        }
      } catch {
        if (!cancelled) setError("Could not connect to API. Ensure backend is running on port 5000.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, status]);

  const togglePortal = async (mod: ModuleItem, portal: string) => {
    const current = mod.portals?.[portal] === true;
    // Optimistic update with rollback
    setModules((prev) => prev.map((m) => m.key === mod.key ? { ...m, portals: { ...m.portals, [portal]: !current } } : m));
    try {
      const res = await fetch(`${API_URL}/api/features/${mod.key}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ portals: { [portal]: !current } }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setError(null);
    } catch {
      setModules((prev) => prev.map((m) => m.key === mod.key ? { ...m, portals: { ...m.portals, [portal]: current } } : m));
      setError("Failed to update module. Change was not saved.");
    }
  };

  const toggleMaster = async (mod: ModuleItem) => {
    const current = mod.isEnabled;
    setModules((prev) => prev.map((m) => (m.key === mod.key ? { ...m, isEnabled: !current } : m)));
    try {
      const res = await fetch(`${API_URL}/api/features/${mod.key}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ isEnabled: !current }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setError(null);
    } catch {
      setModules((prev) => prev.map((m) => (m.key === mod.key ? { ...m, isEnabled: current } : m)));
      setError("Failed to update module. Change was not saved.");
    }
  };

  const addModule = async () => {
    if (!newMod.name) return;
    const key = newMod.name.toLowerCase().replace(/\s+/g, "-");
    try {
      const res = await fetch(`${API_URL}/api/features`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          key,
          name: newMod.name,
          icon: newMod.icon,
          description: newMod.description,
          category: newMod.category,
          kind: "MODULE",
          routes: newMod.route ? [newMod.route] : [],
          portals: newMod.portals,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModules((prev) => [...prev, data.data]);
        setShowModal(false);
        setNewMod({ name: "", icon: "📌", description: "", category: "Academic", route: "", portals: Object.fromEntries(MODULE_PORTALS.map((p) => [p, false])) as Record<string, boolean> });
        setError(null);
      } else {
        setError(data.error || "Failed to add module");
      }
    } catch {
      setError("Failed to add module");
    }
  };

  const categories = Array.from(new Set(modules.map((m) => m.category).filter(Boolean))) as string[];

  const filtered = modules.filter((m) => {
    const matchCat = filterCat === "All" || m.category === filterCat;
    const matchPortal = filterPortal === "All" || m.portals?.[filterPortal];
    return matchCat && matchPortal;
  });

  const enabledCount = (m: ModuleItem) => MODULE_PORTALS.filter((p) => m.portals?.[p]).length;

  return (
    <PortalLayout>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white">🗓️ Department Module Management</h1>
          <p className="text-xs text-slate-400 mt-1">Control which modules are active for each portal. Click toggle cells to enable or disable per portal. Disabled modules are hidden from navigation and blocked for direct access.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="text-xs font-bold bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-4 py-2 rounded-lg transition">+ Add Module</button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
          ⚠️ {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Modules", value: modules.length, icon: "📦", color: "text-fuchsia-400" },
          { label: "Active Deployments", value: modules.reduce((a, m) => a + enabledCount(m), 0), icon: "✅", color: "text-emerald-400" },
          { label: "AI Modules", value: modules.filter((m) => m.category === "AI & Learning").length, icon: "🤖", color: "text-cyan-400" },
          { label: "Categories", value: categories.length, icon: "🗂️", color: "text-amber-400" },
        ].map((k) => (
          <div key={k.label} className="glass rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{k.icon}</span>
              <div>
                <div className={`text-xl font-extrabold ${k.color}`}>{k.value}</div>
                <div className="text-[10px] text-slate-500">{k.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="flex gap-2 flex-wrap">
          {["All", ...categories].map((cat) => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`text-[10px] font-bold px-3 py-1 rounded-full transition ${
                filterCat === cat ? "bg-fuchsia-600 text-white" : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
              }`}>{cat}</button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap ml-4">
          {["All", ...MODULE_PORTALS].map((p) => (
            <button key={p} onClick={() => setFilterPortal(p)}
              className={`text-[10px] font-bold px-2 py-1 rounded-full transition ${
                filterPortal === p ? "text-white" : "bg-slate-800 text-slate-500 border border-slate-700 hover:text-white"
              }`}
              style={filterPortal === p && p !== "All" ? { backgroundColor: portalColors[p] + "33", borderColor: portalColors[p] + "55", color: portalColors[p] } : {}}>
              {p === "All" ? "All" : PORTAL_DISPLAY[p]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-slate-600 border-t-fuchsia-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((mod) => (
            <div key={mod.key} className={`glass rounded-2xl p-5 border transition-all ${mod.isEnabled ? "border-slate-800 hover:border-slate-600" : "border-red-500/20 opacity-70"}`}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl shrink-0">{mod.icon || "📦"}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-bold text-white">{mod.name}</h3>
                    {mod.category && (
                      <span className="text-[9px] font-bold text-fuchsia-400 bg-fuchsia-500/10 border border-fuchsia-500/20 px-2 py-0.5 rounded">{mod.category}</span>
                    )}
                    {!mod.isEnabled && (
                      <span className="text-[9px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">DISABLED</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">{mod.description}</p>
                  <p className="text-[9px] text-slate-600 font-mono mt-0.5">{mod.routes.join(", ")}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-[10px] font-bold text-slate-500">{enabledCount(mod)}/{MODULE_PORTALS.length} portals</div>
                  <button
                    onClick={() => toggleMaster(mod)}
                    title={mod.isEnabled ? "Disable module everywhere" : "Enable module"}
                    className={`relative w-12 h-6 rounded-full transition-colors ${mod.isEnabled ? "bg-green-500" : "bg-slate-700"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${mod.isEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
                  </button>
                </div>
              </div>

              {/* Portal toggles */}
              <div className="flex flex-wrap gap-2">
                {MODULE_PORTALS.map((portal) => {
                  const isOn = mod.portals?.[portal] === true;
                  return (
                    <button key={portal} onClick={() => togglePortal(mod, portal)}
                      className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                        isOn
                          ? "text-white border-transparent"
                          : "bg-slate-900 text-slate-600 border-slate-800 hover:border-slate-600 hover:text-slate-400"
                      }`}
                      style={isOn ? { backgroundColor: portalColors[portal] + "33", borderColor: portalColors[portal] + "66", color: portalColors[portal] } : {}}>
                      {isOn ? "✓" : "+"} {PORTAL_DISPLAY[portal]}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {filtered.length === 0 && !error && (
            <div className="glass rounded-2xl p-12 text-center">
              <span className="text-4xl">📦</span>
              <p className="text-sm text-slate-400 mt-3">No modules match the current filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Module Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-base font-bold text-white mb-5">➕ Add New Module</h3>
            <div className="space-y-3">
              {[
                { label: "Module Name", key: "name", placeholder: "e.g. Student Wellness" },
                { label: "Icon (emoji)", key: "icon", placeholder: "e.g. 💚" },
                { label: "Description", key: "description", placeholder: "What does this module do?" },
                { label: "Route", key: "route", placeholder: "/portal/module-name" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">{label}</label>
                  <input value={(newMod as any)[key]} onChange={(e) => setNewMod((f) => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-fuchsia-500" />
                </div>
              ))}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Category</label>
                <select value={newMod.category} onChange={(e) => setNewMod((f) => ({ ...f, category: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-fuchsia-500">
                  {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase">Enable for Portals</label>
                <div className="flex flex-wrap gap-2">
                  {MODULE_PORTALS.map((p) => (
                    <button key={p} onClick={() => setNewMod((f) => ({ ...f, portals: { ...f.portals, [p]: !f.portals[p] } }))}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                        newMod.portals[p] ? "text-white bg-fuchsia-600 border-fuchsia-500" : "text-slate-500 bg-slate-800 border-slate-700"
                      }`}>{PORTAL_DISPLAY[p]}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 text-xs font-bold text-slate-400 bg-slate-800 py-2 rounded-lg border border-slate-700">Cancel</button>
              <button onClick={addModule} className="flex-1 text-xs font-bold text-white bg-fuchsia-600 hover:bg-fuchsia-500 py-2 rounded-lg transition">Add Module</button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
