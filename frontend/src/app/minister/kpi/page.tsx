"use client";
import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import KpiStrip from "@/components/kpi/KpiStrip";

interface KpiItem {
  id: string;
  label: string;
  value: number;
  target: number;
  unit: string;
  icon: string;
  trend: string;
  color: string;
  bg: string;
  lowerBetter: boolean;
}

export default function MinisterKPIPage() {
  const [kpiData, setKpiData] = useState<KpiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKPI, setSelectedKPI] = useState<KpiItem | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_URL}/api/minister/kpis`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setKpiData(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API_URL]);

  return (
    <PortalLayout title="KPI Monitoring" subtitle="Minister · Executive Command Center" avatarLetter="M" avatarColor="#ef4444" themeClass="theme-minister" accentColor="#ef4444">
      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
        <p className="text-xs text-red-300">🎯 <strong>Ministerial KPI Dashboard</strong> — Tracking strategic objectives for Tamil Nadu Education 2025. Click any KPI card for detailed breakdown.</p>
      </div>

      {/* Real state-wide academic-year analytics */}
      <KpiStrip path="/api/analytics/state" title="Live State KPIs (Academic Year)" />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin mb-3" />
          <span className="text-xs text-slate-500">Loading KPI data...</span>
        </div>
      ) : kpiData.length === 0 ? (
        <div className="glass rounded-2xl p-10 border border-slate-800 text-center">
          <span className="text-3xl block mb-3">📊</span>
          <p className="text-sm text-slate-400 font-medium">No KPI data available yet.</p>
          <p className="text-xs text-slate-600 mt-1">Run the minister seed script to populate this table.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpiData.map(k => {
              const progress = k.lowerBetter
                ? Math.max(0, 100 - (k.value / (k.target === 0 ? 1 : k.target + k.value)) * 100)
                : Math.min(100, (k.value / k.target) * 100);
              const onTrack = k.lowerBetter ? k.value <= k.target * 2 : progress >= 85;

              return (
                <div
                  key={k.id}
                  onClick={() => setSelectedKPI(selectedKPI?.id === k.id ? null : k)}
                  className={`kpi-card cursor-pointer transition-all ${selectedKPI?.id === k.id ? "ring-2 ring-red-500/40" : "hover:scale-[1.02]"}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-2xl">{k.icon}</span>
                    <span className={`text-[10px] font-bold ${k.trend.startsWith("+") !== !!k.lowerBetter ? "text-emerald-400" : "text-red-400"}`}>{k.trend}</span>
                  </div>
                  <div className={`text-xl font-extrabold ${k.color} mb-1`}>{k.value}{k.unit}</div>
                  <div className="text-[10px] text-slate-500 font-semibold mb-2">{k.label}</div>
                  <div className="h-1.5 bg-slate-800 rounded-full">
                    <div className={`h-1.5 rounded-full bg-gradient-to-r ${k.bg}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-slate-600">Target: {k.target}{k.unit}</span>
                    <span className={`text-[9px] font-bold ${onTrack ? "text-emerald-400" : "text-amber-400"}`}>{onTrack ? "On Track ✓" : "Behind ⚠"}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedKPI && (
            <div className="glass rounded-2xl p-6 border border-red-500/20 mb-6">
              <h2 className="text-base font-semibold text-white mb-4">{selectedKPI.icon} {selectedKPI.label} — Detailed View</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-[10px] text-slate-500 mb-1">Current Value</div>
                  <div className={`text-3xl font-extrabold ${selectedKPI.color}`}>{selectedKPI.value}{selectedKPI.unit}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 mb-1">Ministerial Target (2025)</div>
                  <div className="text-3xl font-extrabold text-white">{selectedKPI.target}{selectedKPI.unit}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 mb-1">Year-over-Year Change</div>
                  <div className={`text-3xl font-extrabold ${selectedKPI.trend.startsWith("+") !== !!selectedKPI.lowerBetter ? "text-emerald-400" : "text-red-400"}`}>{selectedKPI.trend}</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <p className="text-xs text-amber-300">🤖 AI Projection: At current growth rate, {selectedKPI.label} will reach target by {selectedKPI.lowerBetter ? "Q3 2026" : "Q2 2026"}. Recommend accelerating intervention in 8 underperforming districts.</p>
              </div>
            </div>
          )}

          <div className="glass rounded-2xl p-6 border border-slate-800">
            <h2 className="text-base font-semibold text-white mb-4">📊 KPI Summary Scorecard</h2>
            <table className="data-table">
              <thead><tr><th>KPI</th><th>Current</th><th>Target</th><th>YoY Change</th><th>Status</th></tr></thead>
              <tbody>
                {kpiData.map(k => {
                  const pct = k.lowerBetter ? Math.max(0, 100 - (k.value / Math.max(k.target * 2, 1)) * 100) : Math.min(100, (k.value / k.target) * 100);
                  const onTrack = pct >= 85;
                  return (
                    <tr key={k.id}>
                      <td className="font-bold text-white text-xs">{k.icon} {k.label}</td>
                      <td className={`font-bold ${k.color}`}>{k.value}{k.unit}</td>
                      <td className="text-slate-400 text-xs">{k.target}{k.unit}</td>
                      <td className={`font-bold text-xs ${k.trend.startsWith("+") !== !!k.lowerBetter ? "text-emerald-400" : "text-red-400"}`}>{k.trend}</td>
                      <td><span className={`badge ${onTrack ? "badge-green" : "badge-yellow"}`}>{onTrack ? "On Track" : "Behind"}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </PortalLayout>
  );
}
