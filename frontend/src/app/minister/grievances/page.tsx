"use client";
import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";

interface Grievance {
  id: string;
  petitioner: string;
  district: string;
  category: string;
  filed: string;
  status: string;
  escalation: string;
  ministerAction: string;
}

export default function MinisterGrievancesPage() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_URL}/api/minister/grievances`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setGrievances(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API_URL]);

  return (
    <PortalLayout title="Public Grievances" subtitle="Minister · Executive Command Center" avatarLetter="M" avatarColor="#ef4444" themeClass="theme-minister" accentColor="#ef4444">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Grievances", value: loading ? "..." : grievances.length.toString(), icon: "⚖️", color: "text-red-400" },
          { label: "Critical Escalation", value: loading ? "..." : grievances.filter(g => g.escalation === "Critical").length.toString(), icon: "🔴", color: "text-red-400" },
          { label: "Resolved", value: loading ? "..." : grievances.filter(g => g.status === "Resolved").length.toString(), icon: "✅", color: "text-emerald-400" },
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
          <h2 className="text-base font-semibold text-white">⚖️ Minister's Public Grievances Register</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin mb-3" />
            <span className="text-xs text-slate-500">Loading grievances...</span>
          </div>
        ) : grievances.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-700 rounded-xl">
            <span className="text-3xl block mb-2">⚖️</span>
            <p className="text-sm text-slate-400 font-medium">No grievances on record.</p>
            <p className="text-xs text-slate-600 mt-1">Grievance data will appear here once added to the database.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {grievances.map(g => (
              <div key={g.id} className={`p-4 rounded-xl border transition-all ${g.escalation === "Critical" && g.status !== "Resolved" ? "border-red-500/30 bg-red-500/5" : "border-slate-800 bg-slate-900/60"}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge text-[9px] ${g.escalation === "Critical" ? "badge-red" : g.escalation === "High" ? "badge-yellow" : "badge-blue"}`}>{g.escalation}</span>
                      <span className={`badge text-[9px] ${g.status === "Resolved" ? "badge-green" : g.status === "Pending" ? "badge-red" : "badge-yellow"}`}>{g.status}</span>
                      <span className="text-[10px] text-slate-500">{g.filed}</span>
                    </div>
                    <div className="text-xs font-bold text-white">{g.petitioner}</div>
                    <div className="text-[10px] text-slate-400">{g.category} · {g.district}</div>
                    <div className="text-[10px] text-amber-400 mt-1">🏛️ Ministerial Action: {g.ministerAction}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
