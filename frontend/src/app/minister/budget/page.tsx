"use client";
import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";

interface BudgetAlloc {
  id: string;
  head: string;
  category: string;
  approved: number;
  released: number;
  utilized: number;
  fy: string;
}

export default function MinisterBudgetPage() {
  const [data, setData] = useState<BudgetAlloc[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_URL}/api/minister/budget`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setData(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API_URL]);

  const totalApproved = data.reduce((s, a) => s + a.approved, 0);
  const totalReleased = data.reduce((s, a) => s + a.released, 0);
  const totalUtilized = data.reduce((s, a) => s + a.utilized, 0);

  return (
    <PortalLayout title="Budget Overview" subtitle="Minister · Executive Command Center" avatarLetter="M" avatarColor="#ef4444" themeClass="theme-minister" accentColor="#ef4444">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Approved", value: loading ? "..." : `₹${(totalApproved / 100).toFixed(0)} Cr`, icon: "💰", color: "text-red-400" },
          { label: "Released to Depts", value: loading ? "..." : `₹${(totalReleased / 100).toFixed(0)} Cr`, icon: "✅", color: "text-cyan-400" },
          { label: "Utilized", value: loading ? "..." : `₹${(totalUtilized / 100).toFixed(0)} Cr`, icon: "📊", color: "text-emerald-400" },
          { label: "Utilization Rate", value: loading ? "..." : totalApproved > 0 ? `${Math.round((totalUtilized / totalApproved) * 100)}%` : "N/A", icon: "📈", color: "text-amber-400" },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className={`text-2xl font-extrabold ${k.color} mb-1`}>{k.value}</div>
            <div className="text-xs text-slate-500 font-semibold">{k.label}</div>
          </div>
        ))}
      </div>

      {toast && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl">{toast}</div>}

      <div className="glass rounded-2xl p-6 border border-slate-800 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">💰 FY 2024-25 — Education Budget Overview</h2>
            <p className="text-xs text-slate-500 mt-1">Total Approved Budget: ₹{(totalApproved / 100).toFixed(0)} Crore</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin mb-3" />
            <span className="text-xs text-slate-500">Loading budget data...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-700 rounded-xl">
            <span className="text-3xl block mb-2">💰</span>
            <p className="text-sm text-slate-400 font-medium">No budget data available yet.</p>
            <p className="text-xs text-slate-600 mt-1">Run the minister seed script to populate this table.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map(a => {
              const relPct = Math.round((a.released / a.approved) * 100);
              const utilPct = Math.round((a.utilized / a.approved) * 100);
              return (
                <div key={a.id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-xs font-bold text-white">{a.head}</div>
                      <div className="text-[10px] text-slate-500">{a.category} · FY {a.fy}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-red-400 font-bold text-xs">₹{a.approved}L approved</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-slate-500 w-16">Released</span>
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full"><div className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500" style={{ width: `${relPct}%` }} /></div>
                      <span className="text-[10px] text-cyan-400 font-bold w-10 text-right">{relPct}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-slate-500 w-16">Utilized</span>
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full"><div className={`h-1.5 rounded-full bg-gradient-to-r ${utilPct >= 85 ? "from-emerald-500 to-teal-500" : utilPct >= 65 ? "from-amber-500 to-yellow-500" : "from-red-500 to-orange-500"}`} style={{ width: `${utilPct}%` }} /></div>
                      <span className={`text-[10px] font-bold w-10 text-right ${utilPct >= 85 ? "text-emerald-400" : utilPct >= 65 ? "text-amber-400" : "text-red-400"}`}>{utilPct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
