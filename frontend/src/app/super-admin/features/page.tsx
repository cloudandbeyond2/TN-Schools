"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { getDefaultFeatureCatalog, PORTAL_DISPLAY } from "@/lib/moduleCatalog";

interface FeatureItem {
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

export default function FeatureToggles() {
  const { data: session } = useSession();
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = (session as any)?.backendToken;

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/features?kind=FEATURE`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (cancelled) return;

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setFeatures(data.data);
          setError(null);
        } else if (data.success) {
          // First run: seed the default catalog (features + modules), then keep features
          const syncRes = await fetch(`${API_URL}/api/features/sync`, {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({ items: getDefaultFeatureCatalog() }),
          });
          const syncData = await syncRes.json();
          if (!cancelled && syncData.success) {
            setFeatures(syncData.data.filter((f: FeatureItem & { kind: string }) => f.kind === "FEATURE"));
            setError(null);
          } else if (!cancelled) {
            setError(syncData.error || "Failed to seed feature catalog");
          }
        } else {
          setError(data.error || "Failed to load features");
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
  }, [token]);

  const toggleFeature = async (key: string, current: boolean) => {
    // Optimistic toggle with rollback
    setFeatures((prev) => prev.map((f) => (f.key === key ? { ...f, isEnabled: !current } : f)));
    try {
      const res = await fetch(`${API_URL}/api/features/${key}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ isEnabled: !current }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setError(null);
    } catch {
      setFeatures((prev) => prev.map((f) => (f.key === key ? { ...f, isEnabled: current } : f)));
      setError("Failed to update feature. Change was not saved.");
    }
  };

  const portalLabel = (f: FeatureItem) =>
    Object.entries(f.portals || {})
      .filter(([, on]) => on)
      .map(([p]) => PORTAL_DISPLAY[p] || p)
      .join(", ") || "All";

  const enabledCount = features.filter((f) => f.isEnabled).length;

  return (
    <PortalLayout>
      <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
        <p className="text-xs text-amber-300">
          🔧 <strong>Feature Toggles</strong> — Enable or disable platform features per portal. Changes take effect immediately across all users.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
          ⚠️ {error}
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
          {enabledCount} ENABLED
        </span>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full">
          {features.length - enabledCount} DISABLED
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-slate-600 border-t-amber-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div
              key={feature.key}
              className={`glass rounded-2xl p-5 border transition-all ${feature.isEnabled ? "border-green-500/20" : "border-slate-700/50"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{feature.icon || "⚙️"}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{feature.name}</h3>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded mt-1 inline-block">
                      {portalLabel(feature)}
                    </span>
                    <p className="text-xs text-slate-400 mt-2">{feature.description}</p>
                    {feature.routes.length > 0 && (
                      <p className="text-[9px] text-slate-600 font-mono mt-1">{feature.routes.join(", ")}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleFeature(feature.key, feature.isEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
                    feature.isEnabled ? "bg-green-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      feature.isEnabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
          {features.length === 0 && !error && (
            <div className="glass rounded-2xl p-12 text-center md:col-span-2">
              <span className="text-4xl">🔧</span>
              <p className="text-sm text-slate-400 mt-3">No features found.</p>
            </div>
          )}
        </div>
      )}
    </PortalLayout>
  );
}
