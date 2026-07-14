"use client";
import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";

interface Policy {
  id: string | number;
  name: string;
  category: string;
  launched: string;
  districts: number;
  compliance: number;
  status: string;
}

export default function CommissionerPolicyPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_URL}/api/commissioner/policy`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          // Map backend MinisterPolicyBrief (title -> name, since -> launched, aiScore -> compliance, priority -> category)
          const mapped = json.data.map((p: any) => ({
            id: p.id,
            name: p.title,
            category: p.priority || "General",
            launched: p.since,
            districts: p.districts,
            compliance: p.aiScore,
            status: p.status
          }));
          setPolicies(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API_URL]);

  const activeCount = policies.filter(p => p.status.includes("Active")).length;
  const avgComp = policies.length > 0 ? Math.round(policies.reduce((s, p) => s + p.compliance, 0) / policies.length) : 0;
  const reviewCount = policies.filter(p => p.status.includes("Review") || p.status.includes("Action")).length;
  const rolloutCount = policies.filter(p => p.status.includes("Rollout") || p.status.includes("Needs")).length;

  return (
    <PortalLayout title="Policy Monitoring" subtitle="Commissioner · State Operations" avatarLetter="C" avatarColor="#06b6d4" themeClass="theme-commissioner" accentColor="#06b6d4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Policies", value: loading ? "..." : activeCount.toString(), icon: "⚖️", color: "text-cyan-400" },
          { label: "State Avg Compliance", value: loading ? "..." : `${avgComp}%`, icon: "📊", color: "text-emerald-400" },
          { label: "Under Review", value: loading ? "..." : reviewCount.toString(), icon: "🔍", color: "text-amber-400" },
          { label: "In Rollout", value: loading ? "..." : rolloutCount.toString(), icon: "🚀", color: "text-violet-400" },
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
          <h2 className="text-base font-semibold text-white">⚖️ State Policy Monitor</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin mb-3" />
            <span className="text-xs text-slate-500">Loading policy monitor...</span>
          </div>
        ) : policies.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-700 rounded-xl">
            <span className="text-3xl block mb-2">⚖️</span>
            <p className="text-sm text-slate-400 font-medium">No policies found.</p>
            <p className="text-xs text-slate-650 mt-1">Please run seed files to load policy data.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {policies.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-all">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge text-[9px] ${p.status.includes("Active") ? "badge-green" : p.status.includes("Rollout") ? "badge-blue" : "badge-yellow"}`}>{p.status}</span>
                    <span className="badge badge-pink text-[9px]">{p.category}</span>
                  </div>
                  <div className="text-xs font-bold text-white">{p.name}</div>
                  <div className="text-[10px] text-slate-500">Launched: {p.launched} · {p.districts} districts</div>
                </div>
                <div className="text-right ml-4 w-24">
                  <div className={`text-sm font-bold ${p.compliance >= 85 ? "text-emerald-400" : p.compliance >= 70 ? "text-amber-400" : "text-red-400"}`}>{p.compliance}%</div>
                  <div className="text-[10px] text-slate-500">Compliance</div>
                  <div className="h-1.5 bg-slate-800 rounded-full mt-1"><div className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500" style={{ width: `${p.compliance}%` }} /></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
