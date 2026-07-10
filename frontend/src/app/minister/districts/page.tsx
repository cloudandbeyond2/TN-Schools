"use client";
import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";

interface DistrictReport {
  name: string;
  schools: number;
  students: number;
  attendance: number;
  pass10: number;
  pass12: number;
  dropout: number;
  infra: number;
  score: number;
  zone: string;
}

export default function MinisterDistrictsPage() {
  const [districts, setDistricts] = useState<DistrictReport[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("score");
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_URL}/api/analytics/minister/districts`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setDistricts(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API_URL]);

  const zones = ["All", "North", "South", "Central", "West", "Delta"];
  
  const filtered = districts
    .filter(d => selectedZone === "All" || d.zone === selectedZone)
    .sort((a, b) => (b as any)[sortBy] - (a as any)[sortBy]);

  // Compute card variables from districts list
  const maxScore = districts.length > 0 ? Math.max(...districts.map(d => d.score)) : 0;
  const belowAvgCount = districts.filter(d => d.score < 83).length;
  const stateAvgScore = districts.length > 0 
    ? Math.round(districts.reduce((s, d) => s + d.score, 0) / districts.length) 
    : 0;

  return (
    <PortalLayout title="District Reports" subtitle="Minister · Executive Command Center" avatarLetter="M" avatarColor="#ef4444" themeClass="theme-minister" accentColor="#ef4444">
      {loading ? (
        <div className="text-slate-400 text-xs py-10 text-center">Loading ministerial district performance reports...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Reporting Districts", value: districts.length.toString(), icon: "🗺️", color: "text-red-400" },
              { label: "Top Score", value: maxScore + "/100", icon: "🥇", color: "text-yellow-400" },
              { label: "Below Avg", value: belowAvgCount.toString(), icon: "⚠️", color: "text-amber-400" },
              { label: "State Avg Score", value: stateAvgScore + "/100", icon: "📊", color: "text-cyan-400" },
            ].map(k => (
              <div key={k.label} className="kpi-card">
                <div className="text-2xl mb-2">{k.icon}</div>
                <div className={`text-2xl font-extrabold ${k.color} mb-1`}>{k.value}</div>
                <div className="text-xs text-slate-500 font-semibold">{k.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mb-4 items-center">
            <div className="flex gap-2">
              {zones.map(z => (
                <button key={z} onClick={() => setSelectedZone(z)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedZone === z ? "bg-red-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}>{z}</button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-slate-500">Sort by:</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500">
                <option value="score">Overall Score</option>
                <option value="attendance">Attendance</option>
                <option value="pass10">10th Pass %</option>
                <option value="dropout">Dropout Rate</option>
              </select>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-slate-800 mb-6">
            <h2 className="text-base font-semibold text-white mb-4">🗺️ Ministerial District Report — {selectedZone} Zone</h2>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr><th>Rank</th><th>District</th><th>Zone</th><th>Schools</th><th>Students</th><th>Attendance</th><th>10th %</th><th>Dropout %</th><th>Infra</th><th>Score</th></tr>
                </thead>
                <tbody>
                  {filtered.map((d, i) => (
                    <tr key={d.name}>
                      <td><span className={`badge ${i === 0 ? "badge-green" : i <= 2 ? "badge-blue" : i >= filtered.length - 2 ? "badge-red" : "badge-yellow"}`}>#{i + 1}</span></td>
                      <td className="font-bold text-white text-xs">{d.name}</td>
                      <td className="text-xs text-slate-400">{d.zone}</td>
                      <td>{d.schools}</td>
                      <td>{d.students.toLocaleString()}</td>
                      <td><span className={`badge ${d.attendance >= 87 ? "badge-green" : d.attendance >= 84 ? "badge-yellow" : "badge-red"}`}>{d.attendance}%</span></td>
                      <td className="text-slate-300">{d.pass10}%</td>
                      <td><span className={`badge ${d.dropout <= 1.0 ? "badge-green" : d.dropout <= 1.5 ? "badge-yellow" : "badge-red"}`}>{d.dropout}%</span></td>
                      <td>{d.infra}/100</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 bg-slate-800 rounded-full w-10"><div className="h-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500" style={{ width: `${d.score}%` }} /></div>
                          <span className={`text-xs font-bold ${d.score >= 88 ? "text-emerald-400" : d.score >= 82 ? "text-amber-400" : "text-red-400"}`}>{d.score}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6 border border-slate-800">
              <h2 className="text-sm font-semibold text-white mb-4">🏆 Top Performers</h2>
              {[...districts].sort((a, b) => b.score - a.score).slice(0, 3).map((d, i) => (
                <div key={d.name} className="flex items-center justify-between py-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{(i === 0) ? "🥇" : (i === 1) ? "🥈" : "🥉"}</span>
                    <div>
                      <div className="text-xs font-bold text-white">{d.name}</div>
                      <div className="text-[10px] text-slate-500">{d.zone} Zone</div>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-bold text-sm">{d.score}/100</span>
                </div>
              ))}
            </div>
            <div className="glass rounded-2xl p-6 border border-slate-800">
              <h2 className="text-sm font-semibold text-white mb-4">🚨 Needs Attention</h2>
              {[...districts].sort((a, b) => a.score - b.score).slice(0, 3).map(d => (
                <div key={d.name} className="flex items-center justify-between py-3 border-b border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-white">{d.name}</div>
                    <div className="text-[10px] text-red-400">Dropout: {d.dropout}% · Infra: {d.infra}/100</div>
                  </div>
                  <span className="text-red-400 font-bold text-sm">{d.score}/100</span>
                </div>
              ))}
              <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-[10px] text-red-300">⚠️ Minister's attention recommended for lowest-scoring districts.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </PortalLayout>
  );
}
