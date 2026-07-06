"use client";
import React, { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import KpiStrip from "@/components/kpi/KpiStrip";

const kpiData = [
  { label: "Enrollment Rate", value: 94.2, target: 100, unit: "%", icon: "👨‍🎓", trend: "+2.1%", color: "text-red-400", bg: "from-red-500 to-orange-500" },
  { label: "State 10th Pass %", value: 85.4, target: 90, unit: "%", icon: "📊", trend: "+1.6%", color: "text-amber-400", bg: "from-amber-500 to-yellow-500" },
  { label: "State 12th Pass %", value: 80.9, target: 85, unit: "%", icon: "🎓", trend: "+1.2%", color: "text-violet-400", bg: "from-violet-500 to-purple-500" },
  { label: "Dropout Rate", value: 1.45, target: 0.5, unit: "%", icon: "📉", trend: "-0.3%", color: "text-emerald-400", bg: "from-emerald-500 to-teal-500", lowerBetter: true },
  { label: "Teacher Vacancy", value: 1250, target: 0, unit: " posts", icon: "👩‍🏫", trend: "-180", color: "text-cyan-400", bg: "from-cyan-500 to-sky-500", lowerBetter: true },
  { label: "Digital Classrooms", value: 74, target: 100, unit: "%", icon: "💻", trend: "+8%", color: "text-pink-400", bg: "from-pink-500 to-rose-500" },
  { label: "Mid-Day Meal Coverage", value: 98.5, target: 100, unit: "%", icon: "🍛", trend: "+0.5%", color: "text-orange-400", bg: "from-orange-500 to-red-500" },
  { label: "Infrastructure Score", value: 82, target: 95, unit: "/100", icon: "🏗️", trend: "+3pts", color: "text-blue-400", bg: "from-blue-500 to-cyan-500" },
];

export default function MinisterKPIPage() {
  const [selectedKPI, setSelectedKPI] = useState<typeof kpiData[0] | null>(null);

  return (
    <PortalLayout title="KPI Monitoring" subtitle="Minister · Executive Command Center" avatarLetter="M" avatarColor="#ef4444" themeClass="theme-minister" accentColor="#ef4444">
      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
        <p className="text-xs text-red-300">🎯 <strong>Ministerial KPI Dashboard</strong> — Tracking 8 strategic objectives for Tamil Nadu Education 2025. Click any KPI card for detailed breakdown.</p>
      </div>

      {/* Real state-wide academic-year analytics */}
      <KpiStrip path="/api/analytics/state" title="Live State KPIs (Academic Year)" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiData.map(k => {
          const progress = k.lowerBetter
            ? Math.max(0, 100 - (k.value / (k.target === 0 ? 1 : k.target + k.value)) * 100)
            : Math.min(100, (k.value / k.target) * 100);
          const onTrack = k.lowerBetter ? k.value <= k.target * 2 : progress >= 85;

          return (
            <div
              key={k.label}
              onClick={() => setSelectedKPI(selectedKPI?.label === k.label ? null : k)}
              className={`kpi-card cursor-pointer transition-all ${selectedKPI?.label === k.label ? "ring-2 ring-red-500/40" : "hover:scale-[1.02]"}`}
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
                <tr key={k.label}>
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
    </PortalLayout>
  );
}
