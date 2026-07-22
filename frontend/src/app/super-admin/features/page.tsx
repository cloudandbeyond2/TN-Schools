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
  const { data: session, status } = useSession();
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  }, [token, status]);

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

const getFlaticon = (key: string) => {
  const map: Record<string, string> = {
    "ai-tutor": "fi-rr-robot",
    "lesson-planner": "fi-rr-clipboard-list",
    "parent-assistant": "fi-rr-comments",
    "ai-evaluation": "fi-rr-document-signed",
    "question-generator": "fi-rr-interrogation",
    "personal-guide": "fi-rr-compass",
    "smart-class": "fi-rr-screen",
    "personal-counsellor": "fi-rr-heart",
    "dropout-heatmap": "fi-rr-flame",
    "live-state": "fi-rr-rss",
    "ai-predictions": "fi-rr-magic-wand",
  };
  return map[key] || "fi-rr-settings";
};

  return (
    <PortalLayout>
      <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
        <p className="text-xs text-amber-300 flex items-start gap-2">
          <i className="fi fi-rr-wrench text-base mt-0.5"></i>
          <span>
            <strong>Feature Toggles</strong> — Enable or disable platform features per portal. Changes take effect immediately across all users.
          </span>
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2">
          <i className="fi fi-rr-triangle-warning"></i> {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <i className="fi fi-rr-check-circle"></i> {enabledCount} ENABLED
        </span>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <i className="fi fi-rr-cross-circle"></i> {features.length - enabledCount} DISABLED
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-slate-600 border-t-amber-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div
              key={feature.key}
              className={`glass rounded-2xl p-4 sm:p-5 border transition-all hover:shadow-lg ${
                feature.isEnabled ? "border-green-500/30 bg-green-500/5" : "border-slate-700/50 hover:border-slate-600"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                    feature.isEnabled ? "bg-green-500/20 text-green-400" : "bg-slate-800 text-slate-400"
                  }`}>
                    <i className={`fi ${getFlaticon(feature.key)} text-xl sm:text-2xl`}></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <h3 className="text-sm font-bold text-white truncate">{feature.name}</h3>
                      {/* Mobile toggle (shows next to title on small screens if wrapping happens, else hidden) */}
                      <button
                        onClick={() => toggleFeature(feature.key, feature.isEnabled)}
                        className={`relative w-10 h-5 sm:hidden rounded-full transition-colors shrink-0 ${
                          feature.isEnabled ? "bg-green-500" : "bg-slate-700"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            feature.isEnabled ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                    
                    <div className="mt-1 flex flex-wrap gap-1">
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded truncate max-w-full border border-slate-700/50">
                        {portalLabel(feature)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-2">{feature.description}</p>
                    {feature.routes.length > 0 && (
                      <p className="text-[9px] text-slate-500 font-mono mt-1.5 truncate">
                        <i className="fi fi-rr-link-alt mr-1"></i>
                        {feature.routes.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
                {/* Desktop toggle */}
                <button
                  onClick={() => toggleFeature(feature.key, feature.isEnabled)}
                  className={`hidden sm:block relative w-12 h-6 rounded-full transition-colors shrink-0 ${
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
              <i className="fi fi-rr-box-open text-4xl text-slate-500 mb-3 block"></i>
              <p className="text-sm text-slate-400">No features found.</p>
            </div>
          )}
        </div>
      )}
    </PortalLayout>
  );
}
