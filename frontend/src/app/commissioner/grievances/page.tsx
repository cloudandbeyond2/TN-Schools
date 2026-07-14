"use client";
import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";

interface Grievance {
  id: string | number;
  petitioner: string;
  district: string;
  category: string;
  filed: string;
  status: string;
  escalation: string;
}

export default function CommissionerGrievancesPage() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_URL}/api/commissioner/grievances`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setGrievances(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API_URL]);

  return (
    <PortalLayout title="Grievances Redressal" subtitle="Commissioner · State Operations" avatarLetter="C" avatarColor="#06b6d4" themeClass="theme-commissioner" accentColor="#06b6d4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Grievances", value: loading ? "..." : grievances.length.toString(), icon: "⚖️", color: "text-cyan-400" },
          { label: "Resolved", value: loading ? "..." : grievances.filter(g => g.status === "Resolved").length.toString(), icon: "✅", color: "text-emerald-400" },
          { label: "High Escalation", value: loading ? "..." : grievances.filter(g => g.escalation === "High" || g.escalation === "Critical" || g.escalation === "HIGH").length.toString(), icon: "🔴", color: "text-red-400" },
          { label: "Pending Action", value: loading ? "..." : grievances.filter(g => g.status === "Pending").length.toString(), icon: "⏳", color: "text-amber-400" },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className={`text-2xl font-extrabold ${k.color} mb-1`}>{k.value}</div>
            <div className="text-xs text-slate-500 font-semibold">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6 border border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-white">⚖️ State Grievances Redressal Board</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin mb-3" />
            <span className="text-xs text-slate-500">Loading grievances...</span>
          </div>
        ) : grievances.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-700 rounded-xl">
            <span className="text-3xl block mb-2">⚖️</span>
            <p className="text-sm text-slate-400 font-medium">No grievances filed yet.</p>
            <p className="text-xs text-slate-650 mt-1">State level grievances will appear here once registered.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Petitioner</th><th>District</th><th>Category</th><th>Filed</th><th>Escalation</th><th>Status</th></tr></thead>
              <tbody>
                {grievances.map(g => (
                  <tr key={g.id}>
                    <td className="font-bold text-white text-xs">{g.petitioner}</td>
                    <td className="text-xs text-slate-400">{g.district}</td>
                    <td className="text-xs text-cyan-400">{g.category}</td>
                    <td className="text-xs text-slate-500">{g.filed}</td>
                    <td><span className={`badge ${g.escalation === "High" || g.escalation === "Critical" || g.escalation === "HIGH" ? "badge-red" : g.escalation === "Medium" ? "badge-yellow" : "badge-green"}`}>{g.escalation}</span></td>
                    <td><span className={`badge ${g.status === "Resolved" ? "badge-green" : g.status === "Pending" ? "badge-red" : "badge-yellow"}`}>{g.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
