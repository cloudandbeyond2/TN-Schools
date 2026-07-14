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
  score: number;
  zone: string;
}

export default function CommissionerDistrictsPage() {
  const [districts, setDistricts] = useState<DistrictReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_URL}/api/commissioner/districts`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setDistricts(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API_URL]);

  const sel = districts.find(d => d.name === selected);

  return (
    <PortalLayout title="District Comparisons" subtitle="Commissioner · State Operations" avatarLetter="C" avatarColor="#06b6d4" themeClass="theme-commissioner" accentColor="#06b6d4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Monitored Districts", value: loading ? "..." : districts.length.toString() || "38", icon: "🗺️", color: "text-cyan-400" },
          { label: "State Schools", value: loading ? "..." : districts.reduce((s, d) => s + d.schools, 0).toLocaleString() || "48,000+", icon: "🏫", color: "text-violet-400" },
          { label: "State Students", value: loading ? "..." : (districts.reduce((s, d) => s + d.students, 0) / 100000).toFixed(2) + "L" || "1.2 Cr", icon: "👨‍🎓", color: "text-emerald-400" },
          { label: "State Avg Attendance", value: loading ? "..." : (districts.reduce((s, d) => s + d.attendance, 0) / (districts.length || 1)).toFixed(1) + "%" || "85%", icon: "📅", color: "text-amber-400" },
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
          <span className="text-xs text-slate-500">Loading district performance comparison...</span>
        </div>
      ) : districts.length === 0 ? (
        <div className="glass rounded-2xl p-10 border border-slate-800 text-center">
          <span className="text-3xl block mb-3">🗺️</span>
          <p className="text-sm text-slate-400 font-medium">No district performance reports found.</p>
          <p className="text-xs text-slate-600 mt-1">Please populate the performance database using seed scripts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass rounded-2xl p-6 border border-slate-800">
            <h2 className="text-base font-semibold text-white mb-4">🗺️ District Performance Comparison</h2>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Rank</th><th>District</th><th>Schools</th><th>Students</th><th>Attendance</th><th>10th %</th><th>12th %</th><th>Detail</th></tr></thead>
                <tbody>
                  {districts.map((d, i) => (
                    <tr key={d.name} className={selected === d.name ? "bg-cyan-500/10" : ""}>
                      <td><span className={`badge ${i === 0 ? "badge-green" : i <= 2 ? "badge-blue" : "badge-yellow"}`}>#{i + 1}</span></td>
                      <td className="font-bold text-white text-xs">{d.name}</td>
                      <td>{d.schools}</td>
                      <td>{d.students.toLocaleString()}</td>
                      <td><span className={`badge ${d.attendance >= 88 ? "badge-green" : d.attendance >= 84 ? "badge-yellow" : "badge-red"}`}>{d.attendance}%</span></td>
                      <td className="text-slate-300">{d.pass10}%</td>
                      <td className="text-cyan-400 font-semibold">{d.pass12}%</td>
                      <td><button onClick={() => setSelected(selected === d.name ? null : d.name)} className="text-xs text-cyan-400 hover:text-cyan-300 font-bold">View →</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="glass rounded-2xl p-6 border border-slate-800">
            <h2 className="text-sm font-semibold text-white mb-4">📋 District Detail</h2>
            {sel ? (
              <div className="space-y-3">
                <div className="text-cyan-400 font-bold text-sm">{sel.name} District</div>
                {[
                  { label: "Schools", value: sel.schools }, { label: "Students", value: sel.students.toLocaleString() },
                  { label: "Attendance", value: `${sel.attendance}%` }, { label: "10th Pass %", value: `${sel.pass10}%` },
                  { label: "12th Pass %", value: `${sel.pass12}%` }, { label: "Zone", value: sel.zone },
                ].map(r => (
                  <div key={r.label} className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs text-slate-400">{r.label}</span>
                    <span className="text-xs text-white font-bold">{r.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-650 text-xs mt-10">← Click a district row to see details</div>
            )}
            <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
              <p className="text-[10px] text-cyan-300">🤖 AI: Chennai leads state in pass rates. Tirunelveli needs targeted intervention for attendance improvement.</p>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
