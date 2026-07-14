"use client";
import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";

interface PerformanceDistrict {
  name: string;
  pass10: number;
  pass12: number;
  attendance: number;
  dropout: number;
  score: number;
}

const metrics = [
  { key: "pass10", label: "10th Pass %", color: "from-cyan-500 to-sky-500" },
  { key: "pass12", label: "12th Pass %", color: "from-violet-500 to-purple-500" },
  { key: "attendance", label: "Attendance %", color: "from-emerald-500 to-teal-500" },
];

export default function CommissionerPerformancePage() {
  const [districts, setDistricts] = useState<PerformanceDistrict[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_URL}/api/commissioner/performance`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const mapped = json.data.map((d: any) => ({
            name: d.name,
            pass10: d.pass10,
            pass12: d.pass12,
            attendance: d.attendance,
            dropout: d.dropout,
            score: d.score
          }));
          setDistricts(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API_URL]);

  const state10 = districts.length > 0 ? (districts.reduce((s, d) => s + d.pass10, 0) / districts.length).toFixed(1) : "0";
  const state12 = districts.length > 0 ? (districts.reduce((s, d) => s + d.pass12, 0) / districts.length).toFixed(1) : "0";
  const stateAtt = districts.length > 0 ? (districts.reduce((s, d) => s + d.attendance, 0) / districts.length).toFixed(1) : "0";
  const stateDrop = districts.length > 0 ? (districts.reduce((s, d) => s + d.dropout, 0) / districts.length).toFixed(2) : "0";

  return (
    <PortalLayout title="School Performance" subtitle="Commissioner · State Operations" avatarLetter="C" avatarColor="#06b6d4" themeClass="theme-commissioner" accentColor="#06b6d4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "State 10th Pass %", value: loading ? "..." : `${state10}%`, icon: "📊", color: "text-cyan-400" },
          { label: "State 12th Pass %", value: loading ? "..." : `${state12}%`, icon: "🎓", color: "text-violet-400" },
          { label: "State Avg Attendance", value: loading ? "..." : `${stateAtt}%`, icon: "📅", color: "text-emerald-400" },
          { label: "State Dropout Rate", value: loading ? "..." : `${stateDrop}%`, icon: "📉", color: "text-red-400" },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className={`text-2xl font-extrabold ${k.color} mb-1`}>{k.value}</div>
            <div className="text-xs text-slate-500 font-semibold">{k.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin mb-3" />
          <span className="text-xs text-slate-500">Loading performance scores...</span>
        </div>
      ) : districts.length === 0 ? (
        <div className="glass rounded-2xl p-10 border border-slate-800 text-center">
          <span className="text-3xl block mb-3">📊</span>
          <p className="text-sm text-slate-400 font-medium">No performance scorecard data found.</p>
          <p className="text-xs text-slate-650 mt-1">Please populate the performance database using seed scripts.</p>
        </div>
      ) : (
        <>
          <div className="glass rounded-2xl p-6 border border-slate-800 mb-6">
            <h2 className="text-base font-semibold text-white mb-4">📊 District Performance Scores</h2>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>District</th><th>10th Pass %</th><th>12th Pass %</th><th>Attendance</th><th>Dropout %</th><th>Performance Score</th></tr></thead>
                <tbody>
                  {districts.map((d, i) => (
                    <tr key={d.name}>
                      <td className="font-bold text-white text-xs">
                        <span className={`badge mr-2 ${i === 0 ? "badge-green" : i <= 2 ? "badge-blue" : "badge-yellow"}`}>#{i + 1}</span>
                        {d.name}
                      </td>
                      <td>{d.pass10}%</td>
                      <td>{d.pass12}%</td>
                      <td><span className={`badge ${d.attendance >= 88 ? "badge-green" : d.attendance >= 84 ? "badge-yellow" : "badge-red"}`}>{d.attendance}%</span></td>
                      <td><span className={`badge ${d.dropout <= 1.0 ? "badge-green" : d.dropout <= 1.5 ? "badge-yellow" : "badge-red"}`}>{d.dropout}%</span></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-2 bg-slate-800 rounded-full w-16"><div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500" style={{ width: `${d.score}%` }} /></div>
                          <span className={`text-sm font-bold ${d.score >= 88 ? "text-emerald-400" : d.score >= 82 ? "text-amber-400" : "text-red-400"}`}>{d.score}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.map(m => (
              <div key={m.key} className="glass rounded-2xl p-6 border border-slate-800">
                <h2 className="text-sm font-semibold text-white mb-4">📈 {m.label}</h2>
                {[...districts].sort((a, b) => (b as any)[m.key] - (a as any)[m.key]).map(d => (
                  <div key={d.name} className="mb-2">
                    <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">{d.name}</span><span className="text-white font-bold">{(d as any)[m.key]}%</span></div>
                    <div className="h-1.5 bg-slate-800 rounded-full"><div className={`h-1.5 rounded-full bg-gradient-to-r ${m.color}`} style={{ width: `${(d as any)[m.key]}%` }} /></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </PortalLayout>
  );
}
