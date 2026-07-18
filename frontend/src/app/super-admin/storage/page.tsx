"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";

type Provider = "LOCAL" | "S3" | "CUSTOM";

interface StorageState {
  provider: Provider;
  isEnabled: boolean;
  config: {
    region?: string;
    bucket?: string;
    publicBaseUrl?: string;
    baseUrl?: string;
  };
  secrets: {
    accessKeyId?: string;
    secretAccessKey?: string;
    apiKey?: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const PROVIDERS: { key: Provider; label: string; icon: string; desc: string }[] = [
  { key: "LOCAL", label: "Local Disk", icon: "💾", desc: "Store files on the backend server (development only — not persistent on cloud hosts)" },
  { key: "S3", label: "AWS S3", icon: "☁️", desc: "Upload files to an Amazon S3 bucket" },
  { key: "CUSTOM", label: "Custom Server", icon: "🖥️", desc: "POST files to your own storage server's /upload endpoint" },
];

export default function ExternalStorage() {
  const { data: session } = useSession();
  const token = (session as any)?.backendToken;

  const [state, setState] = useState<StorageState>({ provider: "LOCAL", isEnabled: false, config: {}, secrets: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; latencyMs: number } | null>(null);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

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
        const res = await fetch(`${API_URL}/api/superadmin/integrations/storage`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled && data.success && data.data) {
          setState({
            provider: data.data.provider || "LOCAL",
            isEnabled: data.data.isEnabled === true,
            config: data.data.config || {},
            secrets: data.data.secrets || {},
          });
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

  const setConfig = (key: string, value: string) =>
    setState((s) => ({ ...s, config: { ...s.config, [key]: value } }));
  const setSecret = (key: string, value: string) =>
    setState((s) => ({ ...s, secrets: { ...s.secrets, [key]: value } }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/superadmin/integrations/storage`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(state),
      });
      const data = await res.json();
      if (data.success) {
        setState({
          provider: data.data.provider,
          isEnabled: data.data.isEnabled,
          config: data.data.config || {},
          secrets: data.data.secrets || {},
        });
        showToast("ok", "Storage configuration saved. New uploads now use this provider.");
      } else {
        showToast("err", data.error || "Failed to save configuration");
      }
    } catch {
      showToast("err", "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${API_URL}/api/superadmin/integrations/storage/test`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(state),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTestResult(data.data);
      } else {
        setTestResult({ ok: false, message: data.error || "Test failed", latencyMs: 0 });
      }
    } catch {
      setTestResult({ ok: false, message: "Could not reach backend", latencyMs: 0 });
    } finally {
      setTesting(false);
    }
  };

  const SecretInput = ({ label, field, placeholder }: { label: string; field: keyof StorageState["secrets"]; placeholder: string }) => (
    <div>
      <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">{label}</label>
      <input
        type="text"
        autoComplete="off"
        value={state.secrets[field] || ""}
        onChange={(e) => setSecret(field, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-emerald-500"
      />
      <p className="text-[9px] text-slate-600 mt-1">Masked values (••••) keep the previously saved secret. Type a new value to replace it.</p>
    </div>
  );

  return (
    <PortalLayout>
      <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
        <p className="text-xs text-emerald-300">
          ☁️ <strong>External Storage</strong> — Configure where uploaded files (syllabus PDFs, digital library resources) are stored. Credentials are encrypted at rest and never shown again in full.
        </p>
      </div>

      {toast && (
        <div className={`mb-4 p-3 rounded-xl text-xs border ${toast.kind === "ok" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          {toast.kind === "ok" ? "✅" : "⚠️"} {toast.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-slate-600 border-t-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active provider + enable */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">Storage Provider</h2>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                  state.isEnabled && state.provider !== "LOCAL"
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : "text-slate-400 bg-slate-800 border-slate-700"
                }`}>
                  ACTIVE: {state.isEnabled && state.provider !== "LOCAL" ? state.provider : "LOCAL (default)"}
                </span>
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                  Use external provider
                  <button
                    onClick={() => setState((s) => ({ ...s, isEnabled: !s.isEnabled }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${state.isEnabled ? "bg-emerald-500" : "bg-slate-700"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${state.isEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
                  </button>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PROVIDERS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setState((s) => ({ ...s, provider: p.key }))}
                  className={`text-left rounded-xl p-4 border transition-all ${
                    state.provider === p.key
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-slate-800 bg-slate-900/40 hover:border-slate-600"
                  }`}
                >
                  <div className="text-2xl mb-2">{p.icon}</div>
                  <div className="text-xs font-bold text-white">{p.label}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{p.desc}</div>
                </button>
              ))}
            </div>
            {state.provider === "LOCAL" && (
              <p className="text-[10px] text-amber-400 mt-3">
                ⚠️ Local disk is fine for development, but files do not persist on cloud hosts (Vercel/Render). Use S3 or a custom server in production.
              </p>
            )}
          </div>

          {/* Provider details */}
          {state.provider === "S3" && (
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-semibold text-white">AWS S3 Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Region</label>
                  <input
                    value={state.config.region || ""}
                    onChange={(e) => setConfig("region", e.target.value)}
                    placeholder="e.g. ap-south-1"
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Bucket Name</label>
                  <input
                    value={state.config.bucket || ""}
                    onChange={(e) => setConfig("bucket", e.target.value)}
                    placeholder="e.g. tn-schools-uploads"
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <SecretInput label="Access Key ID" field="accessKeyId" placeholder="AKIA..." />
                <SecretInput label="Secret Access Key" field="secretAccessKey" placeholder="Secret key" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Public Base URL (optional, e.g. CloudFront)</label>
                <input
                  value={state.config.publicBaseUrl || ""}
                  onChange={(e) => setConfig("publicBaseUrl", e.target.value)}
                  placeholder="https://cdn.example.com"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[9px] text-slate-600 mt-1">If your bucket is private, serve files through a CDN or public domain and set it here.</p>
              </div>
            </div>
          )}

          {state.provider === "CUSTOM" && (
            <div className="glass rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-semibold text-white">Custom Server Details</h2>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Base URL</label>
                <input
                  value={state.config.baseUrl || ""}
                  onChange={(e) => setConfig("baseUrl", e.target.value)}
                  placeholder="https://storage.example.com"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[9px] text-slate-600 mt-1">Files are POSTed as multipart form-data to <span className="font-mono">{"<base-url>"}/upload</span>; the server must respond with {"{ url }"}.</p>
              </div>
              <SecretInput label="API Key" field="apiKey" placeholder="Bearer token sent with each upload" />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={test}
              disabled={testing}
              className="flex-1 min-w-[180px] py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-60 border border-slate-700 text-white font-black text-xs transition-colors"
            >
              {testing ? "Testing..." : "🔌 Test Connection"}
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 min-w-[180px] py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-slate-950 font-black text-xs transition-colors"
            >
              {saving ? "Saving..." : "💾 Save Configuration"}
            </button>
          </div>

          {testResult && (
            <div className={`p-4 rounded-xl text-xs border ${testResult.ok ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
              {testResult.ok ? "✅" : "❌"} {testResult.message}
              {testResult.latencyMs > 0 && <span className="text-slate-500"> · {testResult.latencyMs}ms</span>}
            </div>
          )}
        </div>
      )}
    </PortalLayout>
  );
}
