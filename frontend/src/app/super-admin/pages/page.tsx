"use client";
import { useEffect, useMemo, useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { getPortalPagesCatalog, PORTAL_LABELS } from "@/lib/portalPagesCatalog";
import { LucideIcon } from "@/components/LucideIcon";

interface ManagedPage {
  _id: string;
  title: string;
  route: string;
  icon: string;
  portal: string;
  isEnabled: boolean;
  description?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const PORTAL_ORDER = Object.keys(PORTAL_LABELS);

export default function PageManagement() {
  const [pages, setPages] = useState<ManagedPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchPages = async () => {
    const res = await fetch(`${API_URL}/api/pages`);
    const data = await res.json();
    if (data.success) {
      setPages(data.data);
      setError(null);
      return data.data as ManagedPage[];
    }
    setError(data.error || "Failed to load pages");
    return [];
  };

  const syncCatalog = async () => {
    setSyncing(true);
    try {
      const catalog = getPortalPagesCatalog();
      const syncRes = await fetch(`${API_URL}/api/pages/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages: catalog }),
      });
      const syncData = await syncRes.json();
      if (syncData.success) {
        setPages(syncData.data);
        setError(null);
      } else {
        setError(syncData.error || "Failed to sync pages");
      }
    } catch {
      setError("Could not connect to API. Ensure backend is running on port 5000.");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const existing = await fetchPages();
        if (cancelled) return;
        setLoading(false);

        if (existing.length === 0) {
          await syncCatalog();
        } else {
          void syncCatalog();
        }
      } catch {
        if (!cancelled) {
          setError("Could not connect to API. Ensure backend is running on port 5000.");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const togglePage = async (id: string, isEnabled: boolean) => {
    try {
      const res = await fetch(`${API_URL}/api/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !isEnabled }),
      });
      const data = await res.json();
      if (data.success) {
        setPages((prev) => prev.map((p) => (p._id === id ? { ...p, isEnabled: !isEnabled } : p)));
      }
    } catch {
      setError("Failed to update page status");
    }
  };

  const bulkToggle = async (portal: string, enable: boolean) => {
    try {
      const res = await fetch(`${API_URL}/api/pages/bulk`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portal, isEnabled: enable }),
      });
      const data = await res.json();
      if (data.success) {
        setPages(data.data);
      }
    } catch {
      setError("Failed to bulk update pages");
    }
  };

  const filteredPages = useMemo(() => {
    if (!search) return pages;
    const q = search.toLowerCase();
    return pages.filter(
      (p) => p.title.toLowerCase().includes(q) || p.route.toLowerCase().includes(q)
    );
  }, [pages, search]);

  const groupedPages = useMemo(() => {
    const groups: Record<string, ManagedPage[]> = {};
    for (const portal of PORTAL_ORDER) {
      groups[portal] = [];
    }
    for (const page of filteredPages) {
      if (!groups[page.portal]) groups[page.portal] = [];
      groups[page.portal].push(page);
    }
    return groups;
  }, [filteredPages]);

  const stats = useMemo(() => {
    const enabled = pages.filter((p) => p.isEnabled).length;
    return { total: pages.length, enabled, disabled: pages.length - enabled };
  }, [pages]);

  return (
    <PortalLayout>
      <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <p className="text-xs text-blue-300">
          📄 <strong>Portal Page Access Control</strong> — Enable or disable sidebar pages for each portal. Disabled pages are hidden from that portal&apos;s navigation menu.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
          ⚠️ {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <span className="text-[10px] font-bold text-slate-300 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full">
          {stats.total} TOTAL PAGES
        </span>
        <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
          {stats.enabled} ENABLED
        </span>
        <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full">
          {stats.disabled} DISABLED
        </span>
        {syncing && (
          <span className="text-[10px] text-amber-400 flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border border-amber-400 border-t-transparent animate-spin" />
            Syncing catalog...
          </span>
        )}
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search pages by name or route..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-slate-600 border-t-amber-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-10">
          {PORTAL_ORDER.map((portal) => {
            const portalPages = groupedPages[portal] || [];
            if (portalPages.length === 0) return null;

            const info = PORTAL_LABELS[portal];
            const enabledInGroup = portalPages.filter((p) => p.isEnabled).length;

            return (
              <section key={portal}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="flex items-center"><LucideIcon name={info.icon} className="w-5 h-5" /></span>
                      {info.label}
                    </h2>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {enabledInGroup} of {portalPages.length} nav items enabled
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => bulkToggle(portal, true)}
                      className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-all"
                    >
                      Enable All
                    </button>
                    <button
                      onClick={() => bulkToggle(portal, false)}
                      className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all"
                    >
                      Disable All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portalPages.map((page) => (
                    <div
                      key={page._id}
                      className={`glass rounded-2xl p-5 border transition-all ${
                        page.isEnabled ? "border-green-500/20" : "border-slate-700/50 opacity-70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="text-2xl shrink-0 flex items-center justify-center w-8 h-8"><LucideIcon name={page.icon} className="w-6 h-6" /></span>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-white truncate">{page.title}</h3>
                            <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">{page.route}</p>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded mt-2 inline-block ${
                                page.isEnabled
                                  ? "text-green-400 bg-green-500/10 border border-green-500/20"
                                  : "text-slate-500 bg-slate-800 border border-slate-700"
                              }`}
                            >
                              {page.isEnabled ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => togglePage(page._id, page.isEnabled)}
                          className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
                            page.isEnabled ? "bg-green-500" : "bg-slate-700"
                          }`}
                          title={page.isEnabled ? "Disable page" : "Enable page"}
                          aria-label={page.isEnabled ? `Disable ${page.title}` : `Enable ${page.title}`}
                        >
                          <span
                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                              page.isEnabled ? "translate-x-6" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          {filteredPages.length === 0 && !error && (
            <div className="glass rounded-2xl p-12 text-center">
              <span className="text-4xl">📄</span>
              <p className="text-sm text-slate-400 mt-3">No pages match your search.</p>
            </div>
          )}
        </div>
      )}
    </PortalLayout>
  );
}
