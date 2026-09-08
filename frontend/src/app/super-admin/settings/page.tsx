"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";

interface Settings {
  maintenanceMode: boolean;
  allowDemoLogin: boolean;
  enableAiFeatures: boolean;
  enableNotifications: boolean;
  enableBeoPortal: boolean;
  enableDeoPortal: boolean;
  enableCommissionerPortal: boolean;
  enableMinisterPortal: boolean;
  enablePetPortal: boolean;
  sessionTimeout: string;
  maxUploadSize: string;
  defaultLanguage: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  mobile?: string | null;
  isActive: boolean;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const DEFAULT_SETTINGS: Settings = {
  maintenanceMode: false,
  allowDemoLogin: true,
  enableAiFeatures: true,
  enableNotifications: true,
  enableBeoPortal: true,
  enableDeoPortal: true,
  enableCommissionerPortal: true,
  enableMinisterPortal: true,
  enablePetPortal: true,
  sessionTimeout: "30",
  maxUploadSize: "10",
  defaultLanguage: "English",
};

export default function PortalSettings() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.backendToken || (session as any)?.backendToken;
  const myId = (session?.user as any)?.id;

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", mobile: "", password: "" });
  const [pwModal, setPwModal] = useState<AdminUser | null>(null);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });

  const showToast = (kind: "ok" | "err", text: string) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    (async () => {
      try {
        const [settingsRes, adminsRes] = await Promise.all([
          fetch(`${API_URL}/api/superadmin/settings`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/superadmin/admins`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const settingsData = await settingsRes.json();
        const adminsData = await adminsRes.json();
        if (cancelled) return;
        if (settingsData.success && settingsData.data) {
          const d = settingsData.data;
          setSettings({
            ...DEFAULT_SETTINGS,
            ...d,
            enableBeoPortal: d.enableBeoPortal !== undefined ? Boolean(d.enableBeoPortal) : true,
            enableDeoPortal: d.enableDeoPortal !== undefined ? Boolean(d.enableDeoPortal) : true,
            enableCommissionerPortal: d.enableCommissionerPortal !== undefined ? Boolean(d.enableCommissionerPortal) : true,
            enableMinisterPortal: d.enableMinisterPortal !== undefined ? Boolean(d.enableMinisterPortal) : true,
            enablePetPortal: d.enablePetPortal !== undefined ? Boolean(d.enablePetPortal) : true,
          });
        }
        if (adminsData.success && Array.isArray(adminsData.data)) {
          setAdmins(adminsData.data);
        }
      } catch {
        if (!cancelled) showToast("err", "Could not connect to API. Ensure backend is running on port 5000.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const updateSetting = async (key: keyof Settings, value: string | boolean) => {
    // 1. Optimistic update in UI
    const previous = settings[key];
    setSettings((prev) => ({ ...prev, [key]: value }));

    // 2. Auto-save immediately to backend
    const currentToken = token || (session?.user as any)?.backendToken || (session as any)?.backendToken;
    if (currentToken) {
      try {
        const res = await fetch(`${API_URL}/api/superadmin/settings`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
          body: JSON.stringify({ [key]: value }),
        });
        const data = await res.json();
        if (data.success) {
          const statusText = value === false ? "DISABLED (Hidden across Portal & Home Page)" : "ENABLED (Visible across Portal & Home Page)";
          showToast("ok", `Auto-saved: ${String(key)} is now ${statusText}`);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("portalVisibilityChanged"));
          }
        } else {
          // Rollback on error
          setSettings((prev) => ({ ...prev, [key]: previous }));
          showToast("err", data.error || "Failed to auto-save setting");
        }
      } catch {
        setSettings((prev) => ({ ...prev, [key]: previous }));
        showToast("err", "Failed to connect to backend to save setting");
      }
    }
  };

  const saveSettings = async () => {
    const currentToken = token || (session?.user as any)?.backendToken || (session as any)?.backendToken;
    if (!currentToken) {
      showToast("err", "Missing authentication token. Please log in again.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/superadmin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        if (data.data) {
          const d = data.data;
          setSettings({
            ...DEFAULT_SETTINGS,
            ...d,
            enableBeoPortal: d.enableBeoPortal !== undefined ? Boolean(d.enableBeoPortal) : true,
            enableDeoPortal: d.enableDeoPortal !== undefined ? Boolean(d.enableDeoPortal) : true,
            enableCommissionerPortal: d.enableCommissionerPortal !== undefined ? Boolean(d.enableCommissionerPortal) : true,
            enableMinisterPortal: d.enableMinisterPortal !== undefined ? Boolean(d.enableMinisterPortal) : true,
            enablePetPortal: d.enablePetPortal !== undefined ? Boolean(d.enablePetPortal) : true,
          });
        }
        showToast("ok", "All settings saved. Home Page reflects changes immediately.");
      } else {
        showToast("err", data.error || "Failed to save settings");
      }
    } catch {
      showToast("err", "Failed to save settings. Check backend connection.");
    } finally {
      setSaving(false);
    }
  };

  const createAdmin = async () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      showToast("err", "Name, email and password are required");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/superadmin/admins`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(newAdmin),
      });
      const data = await res.json();
      if (data.success) {
        setAdmins((prev) => [...prev, data.data]);
        setShowCreate(false);
        setNewAdmin({ name: "", email: "", mobile: "", password: "" });
        showToast("ok", "Superadmin account created");
      } else {
        showToast("err", data.error || "Failed to create account");
      }
    } catch {
      showToast("err", "Failed to create account");
    }
  };

  const toggleActive = async (admin: AdminUser) => {
    try {
      const res = await fetch(`${API_URL}/api/superadmin/admins/${admin.id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ isActive: !admin.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setAdmins((prev) => prev.map((a) => (a.id === admin.id ? data.data : a)));
        showToast("ok", data.data.isActive ? "Account activated" : "Account deactivated");
      } else {
        showToast("err", data.error || "Failed to update account");
      }
    } catch {
      showToast("err", "Failed to update account");
    }
  };

  const changePassword = async () => {
    if (!pwModal) return;
    try {
      const res = await fetch(`${API_URL}/api/superadmin/admins/${pwModal.id}/password`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(pwForm),
      });
      const data = await res.json();
      if (data.success) {
        setPwModal(null);
        setPwForm({ currentPassword: "", newPassword: "" });
        showToast("ok", "Password updated");
      } else {
        showToast("err", data.error || "Failed to update password");
      }
    } catch {
      showToast("err", "Failed to update password");
    }
  };

  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${on ? "bg-emerald-500" : "bg-slate-700"
        }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition duration-200 ease-in-out ${on ? "translate-x-5" : "translate-x-0"
          }`}
      />
    </button>
  );

  return (
    <PortalLayout>
      {/* Header Banner */}
      <div className="mb-6 p-4 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <i className="fi fi-rr-settings-sliders text-amber-400"></i> Portal Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure global platform behavior, security parameters, and feature defaults</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="text-xs font-bold bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-md"
        >
          <i className="fi fi-rr-disk"></i> {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {toast && (
        <div
          className={`mb-6 p-3 rounded-xl text-xs border flex items-center gap-2 ${toast.kind === "ok"
            ? "bg-green-500/10 border-green-500/20 text-green-400"
            : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
        >
          <i className={toast.kind === "ok" ? "fi fi-rr-check-circle" : "fi fi-rr-triangle-warning"}></i>
          <span>{toast.text}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-slate-600 border-t-amber-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <i className="fi fi-rr-shield-check text-cyan-400"></i> Security & Access
            </h2>
            <div className="space-y-4">
              {[
                { key: "maintenanceMode" as const, label: "Maintenance Mode", desc: "Temporarily disable all portals for maintenance (superadmin stays accessible)" },
                { key: "allowDemoLogin" as const, label: "Allow Demo Login", desc: "Enable quick demo switchboard on login page" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between bg-slate-900/40 rounded-xl px-4 py-4 border border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-white">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                  </div>
                  <Toggle on={settings[item.key]} onClick={() => updateSetting(item.key, !settings[item.key])} />
                </div>
              ))}
              <div className="flex items-center justify-between bg-slate-900/40 rounded-xl px-4 py-4 border border-slate-800">
                <div>
                  <div className="text-xs font-bold text-white">Session Timeout</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Auto logout after inactivity (minutes)</div>
                </div>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting("sessionTimeout", e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="60">60 min</option>
                  <option value="120">120 min</option>
                </select>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <i className="fi fi-rr-robot text-purple-400"></i> AI & Features
            </h2>
            <div className="space-y-4">
              {[
                { key: "enableAiFeatures" as const, label: "AI Features", desc: "Enable AI tutor, lesson planner, and predictions globally (disables all AI & Learning modules when off)" },
                { key: "enableNotifications" as const, label: "Push Notifications", desc: "Send real-time alerts to parents and teachers" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between bg-slate-900/40 rounded-xl px-4 py-4 border border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-white">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                  </div>
                  <Toggle on={settings[item.key]} onClick={() => updateSetting(item.key, !settings[item.key])} />
                </div>
              ))}
            </div>
          </div>

          {/* ═══════ Portal & Section Visibility (Home Page & Navigation) ═══════ */}
          <div id="portal-visibility" className="glass rounded-2xl p-6 border border-amber-500/20 bg-gradient-to-b from-slate-900/80 to-slate-900/40">
            <div className="mb-5 flex items-start justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <i className="fi fi-rr-browser text-amber-400"></i> Portal & Section Visibility (Home Page & Navigation)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enable or disable portal sections. When disabled, the portal and its corresponding section, cards, and titles are automatically hidden from the Home Page.
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Live Home Page Sync
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  key: "enableBeoPortal" as const,
                  label: "Block Education Officer (BEO)",
                  tier: "District Level",
                  desc: "Block administration, school cluster visits, promotions, and MDM inspections.",
                  icon: "fi-rr-bank",
                  accent: "text-violet-400",
                  bg: "bg-violet-500/10",
                  border: "border-violet-500/20",
                },
                {
                  key: "enableDeoPortal" as const,
                  label: "District Education Officer (DEO)",
                  tier: "District Level",
                  desc: "District heatmaps, school rankings, dropout interventions, and resource distribution.",
                  icon: "fi-rr-map",
                  accent: "text-pink-400",
                  bg: "bg-pink-500/10",
                  border: "border-pink-500/20",
                },
                {
                  key: "enableCommissionerPortal" as const,
                  label: "Commissioner Portal",
                  tier: "State Level",
                  desc: "State directorate operations, policy monitoring, and district performance benchmarking.",
                  icon: "fi-rr-scale",
                  accent: "text-sky-400",
                  bg: "bg-sky-500/10",
                  border: "border-sky-500/20",
                },
                {
                  key: "enableMinisterPortal" as const,
                  label: "Minister Dashboard",
                  tier: "State Level",
                  desc: "Executive command center, statewide KPI monitoring, live telemetry, and AI forecasting.",
                  icon: "fi-rr-flag",
                  accent: "text-red-400",
                  bg: "bg-red-500/10",
                  border: "border-red-500/20",
                },
                {
                  key: "enablePetPortal" as const,
                  label: "PET Portal (Physical Education & Sports)",
                  tier: "School Level",
                  desc: "Physical education coaches, sports team rosters, fitness metrics, and sports equipment inventory.",
                  icon: "fi-rr-trophy",
                  accent: "text-amber-400",
                  bg: "bg-amber-500/10",
                  border: "border-amber-500/20",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className={`flex flex-col justify-between rounded-xl p-4 border transition-all ${
                    settings[item.key]
                      ? "bg-slate-900/60 border-slate-700/80 shadow-sm"
                      : "bg-slate-950/40 border-slate-800/60 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg ${item.bg} ${item.border} border flex items-center justify-center text-base ${item.accent}`}>
                        <i className={`fi ${item.icon}`}></i>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          {item.label}
                        </div>
                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                          {item.tier}
                        </span>
                      </div>
                    </div>
                    <Toggle on={settings[item.key]} onClick={() => updateSetting(item.key, !settings[item.key])} />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                    {item.desc}
                  </p>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Home Page Status:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        settings[item.key]
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {settings[item.key] ? "Visible on Home Page" : "Hidden from Home Page"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>



          {/* Superadmin accounts */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <i className="fi fi-rr-user-gear text-amber-400"></i> Superadmin Accounts
              </h2>
              <button
                onClick={() => setShowCreate(true)}
                className="text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition flex items-center gap-1.5"
              >
                <i className="fi fi-rr-user-add"></i> Add Superadmin
              </button>
            </div>
            <div className="space-y-3">
              {admins.map((admin) => (
                <div key={admin.id} className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 rounded-xl px-4 py-4 border border-slate-800">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      {admin.name}
                      {admin.id === myId && (
                        <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">YOU</span>
                      )}
                      {!admin.isActive && (
                        <span className="text-[9px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">INACTIVE</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate">{admin.email}{admin.mobile ? ` · ${admin.mobile}` : ""}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => { setPwModal(admin); setPwForm({ currentPassword: "", newPassword: "" }); }}
                      className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:text-white transition flex items-center gap-1"
                    >
                      <i className="fi fi-rr-key"></i> Change Password
                    </button>
                    {admin.id !== myId && (
                      <button
                        onClick={() => toggleActive(admin)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition ${admin.isActive
                          ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                          : "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"
                          }`}
                      >
                        {admin.isActive ? "Deactivate" : "Activate"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {admins.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">No superadmin accounts found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create superadmin modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <i className="fi fi-rr-user-add text-cyan-400"></i> New Superadmin
            </h3>
            <div className="space-y-3">
              {[
                { label: "Name", key: "name", type: "text", placeholder: "Full name" },
                { label: "Email", key: "email", type: "email", placeholder: "admin@example.com" },
                { label: "Mobile (optional)", key: "mobile", type: "text", placeholder: "10-digit mobile" },
                { label: "Password", key: "password", type: "password", placeholder: "Min 8 characters" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">{label}</label>
                  <input
                    type={type}
                    value={(newAdmin as any)[key]}
                    onChange={(e) => setNewAdmin((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreate(false)} className="flex-1 text-xs font-bold text-slate-400 bg-slate-800 py-2 rounded-lg border border-slate-700">Cancel</button>
              <button onClick={createAdmin} className="flex-1 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 py-2 rounded-lg transition">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Change password modal */}
      {pwModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <i className="fi fi-rr-key text-amber-400"></i> Change Password
            </h3>
            <p className="text-[10px] text-slate-500 mb-5">{pwModal.name} · {pwModal.email}</p>
            <div className="space-y-3">
              {pwModal.id === myId && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Current Password</label>
                  <input
                    type="password"
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">New Password</label>
                <input
                  type="password"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
                  placeholder="Min 8 characters"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setPwModal(null)} className="flex-1 text-xs font-bold text-slate-400 bg-slate-800 py-2 rounded-lg border border-slate-700">Cancel</button>
              <button onClick={changePassword} className="flex-1 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 py-2 rounded-lg transition">Update</button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
