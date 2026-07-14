"use client";
import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";

interface PressItem {
  id: string;
  type: string;
  title: string;
  outlet: string;
  date: string;
  sentiment: string;
  reach: string;
}

const typeIcons: Record<string, string> = {
  "Press Release": "📋",
  "Media Coverage": "📰",
  "Interview": "🎙️",
  "Event": "🎉",
};

export default function MinisterMediaPage() {
  const [press, setPress] = useState<PressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("All");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_URL}/api/minister/media`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setPress(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API_URL]);

  const types = ["All", "Press Release", "Media Coverage", "Interview", "Event"];
  const filtered = press.filter(p => filterType === "All" || p.type === filterType);

  return (
    <PortalLayout title="Press & Media" subtitle="Minister · Executive Command Center" avatarLetter="M" avatarColor="#ef4444" themeClass="theme-minister" accentColor="#ef4444">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Media Items", value: loading ? "..." : press.length.toString(), icon: "📰", color: "text-red-400" },
          { label: "Positive Coverage", value: loading ? "..." : press.filter(p => p.sentiment === "Positive").length.toString(), icon: "✅", color: "text-emerald-400" },
          { label: "Negative Coverage", value: loading ? "..." : press.filter(p => p.sentiment === "Negative").length.toString(), icon: "⚠️", color: "text-red-400" },
          { label: "Total Reach", value: "5 Cr+", icon: "👁️", color: "text-amber-400" },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className={`text-2xl font-extrabold ${k.color} mb-1`}>{k.value}</div>
            <div className="text-xs text-slate-500 font-semibold">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        {types.map(t => (
          <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filterType === t ? "bg-red-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>
            {t !== "All" && typeIcons[t]} {t}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl p-6 border border-slate-800">
        <h2 className="text-base font-semibold text-white mb-4">📰 Minister's Press & Media Registry</h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin mb-3" />
            <span className="text-xs text-slate-500">Loading media data...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-700 rounded-xl">
            <span className="text-3xl block mb-2">📰</span>
            <p className="text-sm text-slate-400 font-medium">{filterType === "All" ? "No media records available yet." : `No ${filterType} items found.`}</p>
            {filterType === "All" && <p className="text-xs text-slate-600 mt-1">Media data will appear here once added to the database.</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(p => (
              <div key={p.id} className={`flex items-start justify-between p-4 rounded-xl border transition-all hover:border-red-500/20 ${p.sentiment === "Negative" ? "border-red-500/20 bg-red-500/5" : "border-slate-800 bg-slate-900/60"}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{typeIcons[p.type] || "📄"}</span>
                    <span className="badge badge-blue text-[9px]">{p.type}</span>
                    <span className={`badge text-[9px] ${p.sentiment === "Positive" ? "badge-green" : "badge-red"}`}>{p.sentiment}</span>
                    <span className="text-[10px] text-slate-500">{p.date}</span>
                  </div>
                  <div className="text-xs font-bold text-white">{p.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{p.outlet} · Reach: {p.reach}</div>
                </div>
                {p.sentiment === "Negative" && (
                  <button onClick={() => alert(`Counter-narrative briefing drafted for: ${p.title}`)} className="ml-4 px-3 py-1.5 bg-red-600/30 hover:bg-red-600/60 text-red-300 text-[10px] font-bold rounded-xl border border-red-500/30 transition-all whitespace-nowrap">
                    📋 Draft Response
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
