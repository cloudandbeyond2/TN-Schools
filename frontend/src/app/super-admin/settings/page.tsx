"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";

interface Settings {
  maintenanceMode: boolean;
  allowDemoLogin: boolean;
  enableAiFeatures: boolean;
  enableNotifications: boolean;
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
  sessionTimeout: "30",
  maxUploadSize: "10",
  defaultLanguage: "English",
};

export default function PortalSettings() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.backendToken;
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

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

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
          setSettings({ ...DEFAULT_SETTINGS, ...settingsData.data });
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

  const updateSetting = (key: keyof Settings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/superadmin/settings`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        showToast("ok", "Settings saved. Maintenance mode and AI toggles apply immediately.");
      } else {
        showToast("err", data.error || "Failed to save settings");
      }
    } catch {
      showToast("err", "Failed to save settings");
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
      onClick={onClick}
      className={`relative w-12 h-6 rounded-full transition-colors ${on ? "bg-green-500" : "bg-slate-700"}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-6" : "translate-x-0.5"
        }`}
      />
    </button>
  );

  return (
    <PortalLayout>
      <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
        <p className="text-xs text-cyan-300">
          ⚙️ <strong>Portal Settings</strong> — Configure global platform behavior, security, and feature defaults.
        </p>
      </div>

      {toast && (
        <div
          className={`mb-4 p-3 rounded-xl text-xs border ${
            toast.kind === "ok"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {toast.kind === "ok" ? "✅" : "⚠️"} {toast.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-slate-600 border-t-cyan-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-5">🔒 Security & Access</h2>
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
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
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
            <h2 className="text-base font-semibold text-white mb-5">🤖 AI & Features</h2>
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

          <div className="glass rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-5">🌐 Localization</h2>
            <div className="flex items-center justify-between bg-slate-900/40 rounded-xl px-4 py-4 border border-slate-800">
              <div>
                <div className="text-xs font-bold text-white">Default Language</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Platform default for new users</div>
              </div>
              <select
                value={settings.defaultLanguage}
                onChange={(e) => updateSetting("defaultLanguage", e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                <option value="English">English</option>
                <option value="தமிழ்">தமிழ் (Tamil)</option>
              </select>
            </div>
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-slate-950 font-black text-xs transition-colors"
          >
            {saving ? "Saving..." : "💾 Save Settings"}
          </button>

          {/* Superadmin accounts */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">👑 Superadmin Accounts</h2>
              <button
                onClick={() => setShowCreate(true)}
                className="text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition"
              >
                + Add Superadmin
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
                      className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:text-white transition"
                    >
                      Change Password
                    </button>
                    {admin.id !== myId && (
                      <button
                        onClick={() => toggleActive(admin)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition ${
                          admin.isActive
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
            <h3 className="text-base font-bold text-white mb-5">➕ New Superadmin</h3>
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
            <h3 className="text-base font-bold text-white mb-1">🔑 Change Password</h3>
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
