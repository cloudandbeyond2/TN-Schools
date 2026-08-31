"use client";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { getDefaultFeatureCatalog } from "@/lib/moduleCatalog";
import {
  INSTITUTION_MODES,
  INSTITUTION_DISABLED_PORTALS,
  PORTAL_CATALOG,
  portalForRoute,
  type InstitutionType,
} from "@/lib/portalCatalog";

interface PortalRow {
  key: string;
  name: string;
  prefix: string;
  isEnabled: boolean;
  moduleCount: number;
  enabledModuleCount: number;
}

interface ModuleRow {
  _id: string;
  key: string;
  name: string;
  icon?: string;
  description?: string;
  category?: string;
  kind: "FEATURE" | "MODULE";
  routes: string[];
  portals: Record<string, boolean>;
  isEnabled: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const META = Object.fromEntries(PORTAL_CATALOG.map((p) => [p.key, p]));

function Toggle({
  on,
  onClick,
  disabled,
}: {
  on: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
      } ${on ? "bg-emerald-500 hover:bg-emerald-600" : "bg-slate-700 hover:bg-slate-600 border border-slate-600"}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function PortalControl() {
  const { data: session, status } = useSession();
  const [portals, setPortals] = useState<PortalRow[]>([]);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [institutionType, setInstitutionType] = useState<InstitutionType>("GOVERNMENT");
  const [activePortal, setActivePortal] = useState<string>("STUDENT");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const token = (session?.user as any)?.backendToken || (session as any)?.backendToken;
  const authHeaders = useMemo(
    () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` }),
    [token]
  );

  const applyView = (data: {
    institutionType?: string;
    portals?: PortalRow[];
    modules?: ModuleRow[];
  }) => {
    if (data.institutionType) setInstitutionType(data.institutionType as InstitutionType);
    if (Array.isArray(data.portals)) setPortals(data.portals);
    if (Array.isArray(data.modules)) setModules(data.modules);
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
        const res = await fetch(`${API_URL}/api/features/portals`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (cancelled) return;
        if (!data.success) {
          setError(data.error || "Failed to load portal settings");
          return;
        }

        // First run: seed the shared feature/module catalog, then re-read so
        // the per-portal module counts are populated.
        if (Array.isArray(data.data.modules) && data.data.modules.length === 0) {
          const syncRes = await fetch(`${API_URL}/api/features/sync`, {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({ items: getDefaultFeatureCatalog() }),
          });
          const syncData = await syncRes.json();
          if (!cancelled && syncData.success) {
            const reread = await fetch(`${API_URL}/api/features/portals`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const rereadData = await reread.json();
            if (!cancelled && rereadData.success) {
              applyView(rereadData.data);
              setError(null);
              return;
            }
          }
        }

        applyView(data.data);
        setError(null);
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

  const togglePortal = async (key: string, current: boolean) => {
    setPortals((prev) => prev.map((p) => (p.key === key ? { ...p, isEnabled: !current } : p)));
    setNotice(null);
    try {
      const res = await fetch(`${API_URL}/api/features/portals`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ portals: { [key]: !current } }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      applyView(data.data);
      setError(null);
    } catch {
      setPortals((prev) => prev.map((p) => (p.key === key ? { ...p, isEnabled: current } : p)));
      setError("Failed to update portal. Change was not saved.");
    }
  };

  const applyInstitution = async (type: InstitutionType) => {
    const mode = INSTITUTION_MODES.find((m) => m.key === type);
    const disabled = INSTITUTION_DISABLED_PORTALS[type];
    const confirmed = window.confirm(
      `Switch this deployment to "${mode?.name}"?\n\n` +
        (disabled.length
          ? `These portals will be turned OFF: ${disabled.join(", ")}.`
          : "All portals will be turned ON.") +
        "\n\nThis overwrites the current portal switches."
    );
    if (!confirmed) return;

    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`${API_URL}/api/features/portals/preset`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ institutionType: type }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      applyView(data.data);
      setError(null);
      setNotice(`Deployment set to ${mode?.name}. Portal switches updated.`);
    } catch {
      setError("Failed to apply institution mode. Nothing was changed.");
    } finally {
      setBusy(false);
    }
  };

  // Modules that own at least one route inside the selected portal.
  const portalModules = useMemo(
    () => modules.filter((m) => m.routes.some((r) => portalForRoute(r) === activePortal)),
    [modules, activePortal]
  );

  const isModuleOnForPortal = (m: ModuleRow) => m.isEnabled && m.portals?.[activePortal] !== false;

  const toggleModuleForPortal = async (m: ModuleRow, portal: string) => {
    const next = !isModuleOnForPortal(m);
    // Re-enabling a module whose master switch is off must also flip the master
    // switch, otherwise the portal toggle would read as on but stay gated.
    const body: Record<string, unknown> = { portals: { [portal]: next } };
    if (next && !m.isEnabled) body.isEnabled = true;

    const snapshot = modules;
    setModules((prev) =>
      prev.map((x) =>
        x.key === m.key
          ? {
              ...x,
              isEnabled: next ? true : x.isEnabled,
              portals: { ...(x.portals || {}), [portal]: next },
            }
          : x
      )
    );
    setNotice(null);
    try {
      const res = await fetch(`${API_URL}/api/features/${m.key}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setPortals((prev) =>
        prev.map((p) =>
          p.key === portal
            ? { ...p, enabledModuleCount: p.enabledModuleCount + (next ? 1 : -1) }
            : p
        )
      );
      setError(null);
    } catch {
      setModules(snapshot);
      setError("Failed to update module. Change was not saved.");
    }
  };

  const toggleModuleMaster = async (m: ModuleRow) => {
    const next = !m.isEnabled;
    const snapshot = modules;
    setModules((prev) => prev.map((x) => (x.key === m.key ? { ...x, isEnabled: next } : x)));
    setNotice(null);
    try {
      const res = await fetch(`${API_URL}/api/features/${m.key}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ isEnabled: next }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setError(null);
    } catch {
      setModules(snapshot);
      setError("Failed to update module. Change was not saved.");
    }
  };

  const enabledPortals = portals.filter((p) => p.isEnabled).length;
  const activeMeta = META[activePortal];
  const activeRow = portals.find((p) => p.key === activePortal);
  const disabledModuleCount = portalModules.filter((m) => !isModuleOnForPortal(m)).length;

  return (
    <PortalLayout>
      <div className="mb-4 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
        <p className="text-xs text-violet-300 flex items-start gap-2">
          <i className="fi fi-rr-traffic-light-go text-base mt-0.5"></i>
          <span>
            <strong>Portal Control</strong> — Choose the institution type, switch entire portals on
            or off, and highlight-manage the modules inside each portal. A disabled portal refuses
            login for its users, disappears from navigation, and shows a &quot;Portal Disabled&quot;
            screen to anyone already signed in. Super Admin is never blocked.
          </span>
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
          <i className="fi fi-rr-triangle-warning"></i> {error}
        </div>
      )}
      {notice && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <i className="fi fi-rr-check-circle"></i> {notice}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-slate-600 border-t-violet-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Institution type ─────────────────────────────────── */}
          <section className="mb-8">
            <h2 className="text-sm font-black text-white uppercase tracking-wide mb-1">
              Institution Type
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Sets which portals this deployment needs. Private and aided institutions have no
              government officer chain above them.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {INSTITUTION_MODES.map((mode) => {
                const active = institutionType === mode.key;
                return (
                  <button
                    key={mode.key}
                    type="button"
                    disabled={busy}
                    onClick={() => applyInstitution(mode.key)}
                    className={`glass text-left rounded-2xl p-4 border transition-all disabled:opacity-60 ${
                      active
                        ? "border-violet-500/60 bg-violet-500/10 shadow-lg"
                        : "border-slate-700/50 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          active ? "bg-violet-500/20 text-violet-300" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        <i className={`fi ${mode.icon} text-xl`}></i>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">{mode.name}</h3>
                        <p className="text-[10px] text-slate-400 truncate">{mode.summary}</p>
                      </div>
                      {active && (
                        <span className="ml-auto text-[9px] font-black text-violet-300 bg-violet-500/20 border border-violet-500/30 px-2 py-0.5 rounded-full">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-3 leading-relaxed">{mode.detail}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Portal switches ──────────────────────────────────── */}
          <section className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h2 className="text-sm font-black text-white uppercase tracking-wide mr-1">
                Portal Availability
              </h2>
              <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <i className="fi fi-rr-check-circle"></i> {enabledPortals} ENABLED
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <i className="fi fi-rr-cross-circle"></i> {portals.length - enabledPortals} DISABLED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portals.map((portal) => {
                const meta = META[portal.key];
                return (
                  <div
                    key={portal.key}
                    className={`glass rounded-2xl p-4 sm:p-5 border transition-all hover:shadow-lg ${
                      portal.isEnabled
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-red-500/30 bg-red-500/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                            portal.isEnabled
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          <i className={`fi ${meta?.icon || "fi-rr-apps"} text-xl`}></i>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-white">{portal.name}</h3>
                            {meta?.governmentOnly && (
                              <span className="text-[9px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                                GOVT ONLY
                              </span>
                            )}
                            {!portal.isEnabled && (
                              <span className="text-[9px] font-bold text-red-300 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full">
                                DISABLED
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mt-1.5 line-clamp-2">
                            {meta?.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="text-[9px] text-slate-500 font-mono">
                              <i className="fi fi-rr-link-alt mr-1"></i>
                              {portal.prefix}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400">
                              {portal.enabledModuleCount}/{portal.moduleCount} modules on
                            </span>
                            <button
                              type="button"
                              onClick={() => setActivePortal(portal.key)}
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                                activePortal === portal.key
                                  ? "text-violet-200 bg-violet-500/20 border-violet-500/40"
                                  : "text-slate-300 bg-slate-800 border-slate-700 hover:border-slate-500"
                              }`}
                            >
                              MANAGE MODULES
                            </button>
                          </div>
                        </div>
                      </div>
                      <Toggle
                        on={portal.isEnabled}
                        onClick={() => togglePortal(portal.key, portal.isEnabled)}
                      />
                    </div>
                  </div>
                );
              })}
              {portals.length === 0 && !error && (
                <div className="glass rounded-2xl p-12 text-center md:col-span-2">
                  <i className="fi fi-rr-box-open text-4xl text-slate-500 mb-3 block"></i>
                  <p className="text-sm text-slate-400">No portals found.</p>
                </div>
              )}
            </div>
          </section>

          {/* ── Highlighted module control for the selected portal ── */}
          <section>
            <h2 className="text-sm font-black text-white uppercase tracking-wide mb-1">
              Module Highlights — {activeMeta?.name || activePortal}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Modules that serve this portal. Turning one off here hides it from this portal only;
              other portals keep it. Disabled modules stay highlighted in red.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {PORTAL_CATALOG.map((p) => {
                const row = portals.find((r) => r.key === p.key);
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setActivePortal(p.key)}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${
                      activePortal === p.key
                        ? "text-white bg-violet-600 border-violet-500"
                        : "text-slate-300 bg-slate-800 border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    <i className={`fi ${p.icon}`}></i>
                    {p.name}
                    {row && !row.isEnabled && <span className="text-red-300">off</span>}
                  </button>
                );
              })}
            </div>

            {activeRow && !activeRow.isEnabled && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                <i className="fi fi-rr-triangle-warning"></i>
                The {activeRow.name} portal is switched off, so none of these modules are reachable
                until the portal is re-enabled.
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <i className="fi fi-rr-check-circle"></i>
                {portalModules.length - disabledModuleCount} ON
              </span>
              <span className="text-[10px] font-bold text-red-300 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <i className="fi fi-rr-cross-circle"></i> {disabledModuleCount} OFF
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portalModules.map((m) => {
                const on = isModuleOnForPortal(m);
                const portalRoutes = m.routes.filter((r) => portalForRoute(r) === activePortal);
                return (
                  <div
                    key={m.key}
                    className={`glass rounded-2xl p-4 border transition-all ${
                      on
                        ? "border-slate-700/50 hover:border-slate-600"
                        : "border-red-500/40 bg-red-500/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span className="text-xl shrink-0">{m.icon || "🔧"}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-white">{m.name}</h3>
                            <span className="text-[9px] font-bold text-slate-400 bg-slate-900/80 border border-slate-700/50 px-2 py-0.5 rounded">
                              {m.kind}
                            </span>
                            {m.category && (
                              <span className="text-[9px] font-bold text-slate-400 bg-slate-900/80 border border-slate-700/50 px-2 py-0.5 rounded">
                                {m.category}
                              </span>
                            )}
                            {!m.isEnabled && (
                              <span className="text-[9px] font-bold text-red-300 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full">
                                OFF EVERYWHERE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mt-1.5 line-clamp-2">
                            {m.description}
                          </p>
                          <p className="text-[9px] text-slate-500 font-mono mt-1.5 truncate">
                            <i className="fi fi-rr-link-alt mr-1"></i>
                            {portalRoutes.join(", ")}
                          </p>
                          <button
                            type="button"
                            onClick={() => toggleModuleMaster(m)}
                            className="mt-2 text-[9px] font-bold text-slate-300 bg-slate-800 border border-slate-700 hover:border-slate-500 px-2 py-1 rounded-full transition-colors"
                          >
                            {m.isEnabled ? "Disable in every portal" : "Enable in every portal"}
                          </button>
                        </div>
                      </div>
                      <Toggle on={on} onClick={() => toggleModuleForPortal(m, activePortal)} />
                    </div>
                  </div>
                );
              })}
              {portalModules.length === 0 && (
                <div className="glass rounded-2xl p-12 text-center md:col-span-2">
                  <i className="fi fi-rr-box-open text-4xl text-slate-500 mb-3 block"></i>
                  <p className="text-sm text-slate-400">
                    No catalog modules are mapped to this portal yet.
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </PortalLayout>
  );
}
