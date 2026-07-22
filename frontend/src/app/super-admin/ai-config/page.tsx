"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";

interface AIService {
  key: string;
  name: string;
  provider: "GEMINI" | "OPENAI";
  providerLabel: string;
  model: string;
  icon: string;
  portal: string;
  purpose: string;
  isEnabled: boolean;
  apiKeyMasked: string; // masked value from server, '' when not set
  tokenLimit: number;
  color: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"];
const OPENAI_MODELS = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"];

// Known platform AI services. Config/keys/status load from the backend and
// merge over these; saving creates the backend doc for the service.
const SERVICE_CATALOG: Omit<AIService, "isEnabled" | "apiKeyMasked">[] = [
  { key: "ai-tutor", name: "AI Tutor", provider: "GEMINI", providerLabel: "Google Gemini", model: "gemini-2.0-flash", icon: "🤖", portal: "Student", purpose: "Personalized tutoring & doubt solving", tokenLimit: 10_000_000, color: "from-cyan-600 to-blue-700" },
  { key: "lesson-planner", name: "Lesson Planner", provider: "GEMINI", providerLabel: "Google Gemini", model: "gemini-1.5-flash", icon: "📋", portal: "Teacher", purpose: "Auto-generate lesson plans from syllabus", tokenLimit: 5_000_000, color: "from-amber-600 to-orange-700" },
  { key: "question-gen", name: "Question Generator", provider: "GEMINI", providerLabel: "Google Gemini", model: "gemini-1.5-pro", icon: "❓", portal: "Teacher", purpose: "AI-based exam question generation", tokenLimit: 5_000_000, color: "from-violet-600 to-purple-700" },
  { key: "parent-bot", name: "Parent Assistant", provider: "GEMINI", providerLabel: "Google Gemini", model: "gemini-2.0-flash", icon: "💬", portal: "Parent", purpose: "Chatbot for parent queries and guidance", tokenLimit: 2_000_000, color: "from-emerald-600 to-teal-700" },
  { key: "analytics-ai", name: "Analytics AI", provider: "GEMINI", providerLabel: "Google Gemini", model: "gemini-1.5-pro", icon: "📊", portal: "DEO/Commissioner", purpose: "Pattern detection in educational data", tokenLimit: 2_000_000, color: "from-pink-600 to-rose-700" },
  { key: "openai-fallback", name: "OpenAI Fallback", provider: "OPENAI", providerLabel: "OpenAI", model: "gpt-4o-mini", icon: "🔄", portal: "All", purpose: "Fallback when Gemini is unavailable", tokenLimit: 1_000_000, color: "from-slate-600 to-slate-800" },
];

export default function AIConfig() {
  const { data: session, status } = useSession();
  const token = (session?.user as any)?.backendToken || (session as any)?.backendToken;

  const [services, setServices] = useState<AIService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ model: string; tokenLimit: number; apiKey: string }>({ model: "", tokenLimit: 0, apiKey: "" });
  const [testResult, setTestResult] = useState<Record<string, { ok: boolean; message: string } | "pending" | null>>({});
  const [globalKey, setGlobalKey] = useState("");
  const [globalKeySaved, setGlobalKeySaved] = useState(false);
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
    if (status === "loading") return;
    if (!token) {
      setLoading(false);
      showToast("err", "Not authenticated. Missing token.");
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/superadmin/integrations/ai`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (cancelled) return;
        const saved: Record<string, any> = {};
        if (data.success && Array.isArray(data.data)) {
          for (const doc of data.data) saved[doc.key] = doc;
        }
        const globalDoc = saved["global-gemini"];
        if (globalDoc?.secrets?.apiKey) {
          setGlobalKey(globalDoc.secrets.apiKey);
          setGlobalKeySaved(true);
        }
        setServices(
          SERVICE_CATALOG.map((base) => {
            const doc = saved[base.key];
            return {
              ...base,
              model: doc?.config?.model || base.model,
              tokenLimit: doc?.config?.tokenLimit || base.tokenLimit,
              isEnabled: doc ? doc.isEnabled === true : base.provider === "GEMINI",
              apiKeyMasked: doc?.secrets?.apiKey || "",
            };
          })
        );
      } catch {
        if (!cancelled) {
          showToast("err", "Could not connect to API. Ensure backend is running on port 5000.");
          setServices(SERVICE_CATALOG.map((b) => ({ ...b, isEnabled: false, apiKeyMasked: "" })));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, status]);

  const putService = async (key: string, body: Record<string, unknown>) => {
    const res = await fetch(`${API_URL}/api/superadmin/integrations/ai/${key}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(body),
    });
    return res.json();
  };

  const saveGlobalKey = async () => {
    if (!globalKey || globalKey.includes("•")) {
      showToast("err", "Enter a new key to update it");
      return;
    }
    try {
      const data = await putService("global-gemini", {
        provider: "GEMINI",
        isEnabled: true,
        secrets: { apiKey: globalKey },
      });
      if (data.success) {
        setGlobalKey(data.data.secrets.apiKey || "");
        setGlobalKeySaved(true);
        showToast("ok", "Global Gemini key saved (encrypted). All Gemini services use it unless overridden.");
      } else {
        showToast("err", data.error || "Failed to save key");
      }
    } catch {
      showToast("err", "Failed to save key");
    }
  };

  const toggleStatus = async (s: AIService) => {
    setServices((prev) => prev.map((x) => (x.key === s.key ? { ...x, isEnabled: !s.isEnabled } : x)));
    try {
      const data = await putService(s.key, {
        provider: s.provider,
        isEnabled: !s.isEnabled,
        config: { model: s.model, tokenLimit: s.tokenLimit, portal: s.portal, purpose: s.purpose },
      });
      if (!data.success) throw new Error(data.error);
    } catch {
      setServices((prev) => prev.map((x) => (x.key === s.key ? { ...x, isEnabled: s.isEnabled } : x)));
      showToast("err", "Failed to update service");
    }
  };

  const openEdit = (s: AIService) => {
    setEditKey(s.key);
    setEditForm({ model: s.model, tokenLimit: s.tokenLimit, apiKey: s.apiKeyMasked });
  };

  const saveEdit = async () => {
    const s = services.find((x) => x.key === editKey);
    if (!s) return;
    try {
      const body: Record<string, unknown> = {
        provider: s.provider,
        isEnabled: s.isEnabled,
        config: { model: editForm.model, tokenLimit: editForm.tokenLimit, portal: s.portal, purpose: s.purpose },
      };
      // Masked/unchanged values keep the stored secret server-side
      if (editForm.apiKey && !editForm.apiKey.includes("•")) {
        body.secrets = { apiKey: editForm.apiKey };
      }
      const data = await putService(s.key, body);
      if (data.success) {
        setServices((prev) =>
          prev.map((x) =>
            x.key === s.key
              ? { ...x, model: editForm.model, tokenLimit: editForm.tokenLimit, apiKeyMasked: data.data.secrets?.apiKey || x.apiKeyMasked }
              : x
          )
        );
        setEditKey(null);
        showToast("ok", `${s.name} configuration saved`);
      } else {
        showToast("err", data.error || "Failed to save configuration");
      }
    } catch {
      showToast("err", "Failed to save configuration");
    }
  };

  const testAPI = async (s: AIService) => {
    setTestResult((prev) => ({ ...prev, [s.key]: "pending" }));
    try {
      const res = await fetch(`${API_URL}/api/superadmin/integrations/ai/${s.key}/test`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ provider: s.provider }),
      });
      const data = await res.json();
      setTestResult((prev) => ({
        ...prev,
        [s.key]: data.success && data.data ? { ok: data.data.ok, message: data.data.message } : { ok: false, message: data.error || "Test failed" },
      }));
    } catch {
      setTestResult((prev) => ({ ...prev, [s.key]: { ok: false, message: "Could not reach backend" } }));
    }
  };

  const editService = services.find((s) => s.key === editKey);
  const activeServices = services.filter((s) => s.isEnabled).length;

  return (
    <PortalLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">🤖 AI Integration & Setup</h1>
        <p className="text-xs text-slate-400 mt-1">Configure AI API keys, models, and token limits. Keys are encrypted at rest and shown masked.</p>
      </div>

      {toast && (
        <div className={`mb-4 p-3 rounded-xl text-xs border ${toast.kind === "ok" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          {toast.kind === "ok" ? "✅" : "⚠️"} {toast.text}
        </div>
      )}

      {/* Global API Key */}
      <div className="glass rounded-2xl p-5 border border-cyan-500/20 bg-cyan-500/5 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🔑</span>
          <div>
            <h3 className="text-sm font-bold text-white">Global Gemini API Key</h3>
            <p className="text-[10px] text-slate-400">Used by all Gemini-based services unless overridden per service. Falls back to the server&apos;s GEMINI_API_KEY env variable when unset.</p>
          </div>
          <div className="ml-auto">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${globalKeySaved ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-slate-400 bg-slate-800 border-slate-700"}`}>
              {globalKeySaved ? "● ACTIVE (DB)" : "○ ENV FALLBACK"}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            value={globalKey}
            onChange={(e) => setGlobalKey(e.target.value)}
            placeholder="Enter Gemini API key (AIza...)"
            className="flex-1 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-cyan-500"
          />
          <button onClick={saveGlobalKey} className="text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition">Update Key</button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Active AI Services", value: `${activeServices}/${services.length}`, icon: "🤖", color: "text-cyan-400" },
          { label: "Provider", value: "Gemini + OpenAI", icon: "📡", color: "text-blue-400" },
          { label: "Key Storage", value: "AES-256 Encrypted", icon: "🔐", color: "text-amber-400" },
          { label: "Global Key", value: globalKeySaved ? "Database" : "ENV", icon: "⚡", color: "text-violet-400" },
        ].map((k) => (
          <div key={k.label} className="glass rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xl">{k.icon}</span>
              <div>
                <div className={`text-sm font-extrabold ${k.color}`}>{k.value}</div>
                <div className="text-[10px] text-slate-500">{k.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-slate-600 border-t-cyan-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {services.map((s) => {
            const tr = testResult[s.key];
            return (
              <div key={s.key} className={`glass rounded-2xl p-5 border transition-all ${s.isEnabled ? "border-slate-700" : "border-slate-800/40 opacity-70"}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl shadow`}>{s.icon}</div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{s.name}</h3>
                      <p className="text-[10px] text-slate-500">{s.providerLabel} · <span className="font-mono">{s.model}</span></p>
                      <span className="text-[9px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded mt-1 inline-block">{s.portal}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => toggleStatus(s)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${s.isEnabled ? "bg-emerald-500" : "bg-slate-700"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${s.isEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${s.isEnabled ? "text-emerald-400" : "text-slate-500"}`}>
                      {s.isEnabled ? "ENABLED" : "DISABLED"}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 mb-3">{s.purpose}</p>

                <div className="flex justify-between text-[9px] text-slate-500 mb-4">
                  <span>Token limit: <strong className="text-white">{s.tokenLimit.toLocaleString()}</strong></span>
                  <span>Key: <strong className={s.apiKeyMasked ? "text-emerald-400" : "text-slate-400"}>{s.apiKeyMasked ? "service-specific" : s.provider === "GEMINI" ? "global/env" : "not set"}</strong></span>
                </div>

                {/* API Key (always masked; enter a new one via Edit Config) */}
                <div className="flex gap-2 mb-3">
                  <input
                    readOnly
                    value={s.apiKeyMasked || (s.provider === "GEMINI" ? "(uses global Gemini key)" : "(no key configured)")}
                    className="flex-1 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] rounded-lg px-2 py-1.5 font-mono focus:outline-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap items-center">
                  <button onClick={() => openEdit(s)} className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-lg hover:bg-blue-500/20 transition">Edit Config</button>
                  <button onClick={() => testAPI(s)} className="text-[10px] font-bold text-slate-300 bg-slate-800 border border-slate-700 px-3 py-1 rounded-lg hover:text-white transition">
                    {tr === "pending" ? "⏳ Testing..." : tr && tr !== null ? (tr.ok ? "✅ Connected" : "❌ Failed") : "🔌 Test API"}
                  </button>
                  {tr && tr !== "pending" && tr !== null && !tr.ok && (
                    <span className="text-[9px] text-red-400 truncate max-w-[220px]" title={tr.message}>{tr.message}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editKey && editService && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">⚙️ Configure {editService.name}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Model</label>
                <select
                  value={editForm.model}
                  onChange={(e) => setEditForm((f) => ({ ...f, model: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
                >
                  {(editService.provider === "GEMINI" ? GEMINI_MODELS : OPENAI_MODELS).map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Token Limit</label>
                <input
                  type="number"
                  value={editForm.tokenLimit}
                  onChange={(e) => setEditForm((f) => ({ ...f, tokenLimit: +e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Override API Key</label>
                <input
                  value={editForm.apiKey}
                  onChange={(e) => setEditForm((f) => ({ ...f, apiKey: e.target.value }))}
                  placeholder={editService.provider === "GEMINI" ? "Leave empty to use global key" : "sk-..."}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[9px] text-slate-600 mt-1">Masked values (••••) keep the previously saved key.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditKey(null)} className="flex-1 text-xs font-bold text-slate-400 bg-slate-800 py-2 rounded-lg border border-slate-700">Cancel</button>
              <button onClick={saveEdit} className="flex-1 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 py-2 rounded-lg transition">Save Config</button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
