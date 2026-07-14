"use client";
import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";

interface Project {
  id: string;
  name: string;
  district: string;
  type: string;
  budget: string;
  completion: number;
  deadline: string;
  status: string;
}

export default function MinisterInfrastructurePage() {
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_URL}/api/minister/infrastructure`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setData(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API_URL]);

  const avgCompletion = data.length > 0 ? Math.round(data.reduce((s, p) => s + p.completion, 0) / data.length) : 0;

  return (
    <PortalLayout title="Infrastructure Projects" subtitle="Minister · Executive Command Center" avatarLetter="M" avatarColor="#ef4444" themeClass="theme-minister" accentColor="#ef4444">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Projects", value: loading ? "..." : data.length.toString(), icon: "🏗️", color: "text-red-400" },
          { label: "Near Complete", value: loading ? "..." : data.filter(p => p.status === "Near Complete").length.toString(), icon: "✅", color: "text-emerald-400" },
          { label: "Delayed", value: loading ? "..." : data.filter(p => p.status === "Delayed").length.toString(), icon: "⚠️", color: "text-amber-400" },
          { label: "Avg Completion", value: loading ? "..." : `${avgCompletion}%`, icon: "📊", color: "text-cyan-400" },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className={`text-2xl font-extrabold ${k.color} mb-1`}>{k.value}</div>
            <div className="text-xs text-slate-500 font-semibold">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6 border border-slate-800 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-white">🏗️ Ministerial Infrastructure Projects Tracker</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin mb-3" />
            <span className="text-xs text-slate-500">Loading infrastructure data...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-700 rounded-xl">
            <span className="text-3xl block mb-2">🏗️</span>
            <p className="text-sm text-slate-400 font-medium">No infrastructure projects on record.</p>
            <p className="text-xs text-slate-600 mt-1">Project data will appear here once added to the database.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map(p => (
              <div
                key={p.id}
                onClick={() => setSelected(selected === p.id ? null : p.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${selected === p.id ? "border-red-500/40 bg-red-500/5" : "border-slate-800 bg-slate-900/60 hover:border-red-500/20"}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge text-[9px] ${p.status === "On Track" ? "badge-green" : p.status === "Near Complete" ? "badge-blue" : "badge-red"}`}>{p.status}</span>
                      <span className="badge badge-yellow text-[9px]">{p.type}</span>
                      <span className="text-[10px] text-slate-500">{p.district} · Due: {p.deadline}</span>
                    </div>
                    <div className="text-xs font-bold text-white">{p.name}</div>
                    <div className="text-[10px] text-red-400 font-bold">{p.budget}</div>
                  </div>
                  <div className={`text-xl font-extrabold ml-4 ${p.completion >= 80 ? "text-emerald-400" : p.completion >= 60 ? "text-amber-400" : "text-red-400"}`}>{p.completion}%</div>
                </div>
                <div className="h-2 bg-slate-800 rounded-full">
                  <div className={`h-2 rounded-full bg-gradient-to-r transition-all ${p.completion >= 80 ? "from-emerald-500 to-teal-500" : p.completion >= 60 ? "from-amber-500 to-yellow-500" : "from-red-500 to-orange-500"}`} style={{ width: `${p.completion}%` }} />
                </div>
                {selected === p.id && p.status === "Delayed" && (
                  <div className="mt-3 pt-3 border-t border-slate-800 flex gap-3">
                    <button onClick={e => { e.stopPropagation(); alert(`Urgent directive issued for: ${p.name}. PWD notified.`); }} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-xl">🚨 Issue Urgent Directive</button>
                    <button onClick={e => { e.stopPropagation(); alert(`Inspection team dispatched for: ${p.name}.`); }} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold rounded-xl">🔍 Dispatch Inspection Team</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
