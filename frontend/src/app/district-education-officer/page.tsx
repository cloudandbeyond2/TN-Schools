"use client";
import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import KpiStrip from "@/components/kpi/KpiStrip";
import { API_BASE } from "@/components/kpi/useKpis";


const blocks = [
  { block: "Coimbatore South", schools: 24, students: 22450, attendance: 91, dropouts: 17, rank: 1 },
  { block: "Coimbatore North", schools: 21, students: 19800, attendance: 89, dropouts: 23, rank: 2 },
  { block: "Pollachi", schools: 18, students: 16200, attendance: 87, dropouts: 31, rank: 3 },
  { block: "Mettupalayam", schools: 16, students: 14100, attendance: 85, dropouts: 42, rank: 4 },
  { block: "Annur", schools: 14, students: 11800, attendance: 83, dropouts: 58, rank: 5 },
];

export default function DEODashboard() {
  const [districts, setDistricts] = useState<string[]>([]);
  const [district, setDistrict] = useState<string>("");

  useEffect(() => {
    fetch(`${API_BASE}/api/schools`)
      .then((r) => r.json())
      .then((json) => {
        const list: any[] = Array.isArray(json) ? json : json.data || [];
        const uniq = Array.from(new Set(list.map((s: any) => s.district).filter(Boolean))).sort() as string[];
        setDistricts(uniq);
        setDistrict((d) => d || uniq[0] || "");
      })
      .catch(() => {});
  }, []);

  return (
    <PortalLayout
      title="DEO Dashboard"
      subtitle="DEO Officer · Coimbatore District"
      avatarLetter="D"
      avatarColor="#ec4899"
      themeClass="theme-deo"
      accentColor="#ec4899"
    >
      {/* Real academic-year KPIs for the selected district */}
      <KpiStrip
        path={district ? `/api/analytics/district/${encodeURIComponent(district)}` : null}
        title={`District KPIs${district ? ` — ${district}` : ""}`}
        controls={
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
          >
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        }
      />

      {/* Block-wise Comparison */}
      <div className="glass rounded-2xl p-6 mb-6 fade-in-2">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">🗺️ Block-wise Performance</h2>
          <span className="badge badge-pink" style={{ background: "rgba(236,72,153,0.15)", color: "#f472b6" }}>Coimbatore District</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Block</th>
              <th>Schools</th>
              <th>Students</th>
              <th>Attendance</th>
              <th>Dropouts</th>
              <th>Block Rank</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((b) => (
              <tr key={b.block}>
                <td className="font-medium text-white">{b.block}</td>
                <td>{b.schools}</td>
                <td>{b.students.toLocaleString()}</td>
                <td>
                  <span className={`badge ${b.attendance >= 90 ? "badge-green" : b.attendance >= 86 ? "badge-yellow" : "badge-red"}`}>{b.attendance}%</span>
                </td>
                <td>
                  <span className={`badge ${b.dropouts <= 20 ? "badge-green" : b.dropouts <= 40 ? "badge-yellow" : "badge-red"}`}>{b.dropouts}</span>
                </td>
                <td>
                  <span className={`badge ${b.rank === 1 ? "badge-green" : b.rank <= 3 ? "badge-blue" : "badge-red"}`}>#{b.rank}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dropout Heatmap + AI Prediction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 fade-in-3">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">🔴 Dropout Risk Heatmap</h2>
          <div className="space-y-2">
            {blocks.map((b) => {
              const risk = b.dropouts > 40 ? "HIGH" : b.dropouts > 25 ? "MEDIUM" : "LOW";
              const pct = Math.round((b.dropouts / 84350) * 100 * 10);
              return (
                <div key={b.block} className="flex items-center gap-3">
                  <div className="w-28 text-xs text-slate-400 truncate">{b.block}</div>
                  <div className="flex-1 progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(pct * 3, 100)}%`,
                        background: risk === "HIGH" ? "linear-gradient(90deg, #ef4444, #dc2626)" : risk === "MEDIUM" ? "linear-gradient(90deg, #f59e0b, #d97706)" : "linear-gradient(90deg, #10b981, #059669)",
                      }}
                    />
                  </div>
                  <span className={`badge w-16 text-center ${risk === "HIGH" ? "badge-red" : risk === "MEDIUM" ? "badge-yellow" : "badge-green"}`}>{risk}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-600 mt-4">📍 AI identifies Annur block as highest dropout zone. Recommend immediate intervention.</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">🤖 AI Predictions</h2>
          <div className="space-y-3">
            {[
              { label: "Projected Dropouts (Next Quarter)", value: "89", icon: "📉", severity: "red" },
              { label: "10th Board Pass % Prediction", value: "87.4%", icon: "📊", severity: "green" },
              { label: "12th Board Pass % Prediction", value: "81.2%", icon: "📊", severity: "green" },
              { label: "Teacher Shortage Forecast", value: "12 positions", icon: "👩‍🏫", severity: "yellow" },
              { label: "Infrastructure Needs", value: "7 schools", icon: "🏗️", severity: "yellow" },
            ].map((p) => (
              <div key={p.label} className="flex items-center justify-between py-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span>{p.icon}</span>
                  <span className="text-xs text-slate-400">{p.label}</span>
                </div>
                <span className={`text-sm font-bold ${p.severity === "red" ? "text-red-400" : p.severity === "green" ? "text-emerald-400" : "text-amber-400"}`}>{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
