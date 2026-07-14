"use client";
import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";

interface Scheme {
  id: string | number;
  name: string;
  budget: string;
  beneficiaries: string;
  districts: number;
  progress: number;
  status: string;
}

export default function CommissionerSchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_URL}/api/commissioner/schemes`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const mapped = json.data.map((s: any) => ({
            id: s.id,
            name: s.name,
            budget: s.budget,
            beneficiaries: s.beneficiaries,
            districts: s.districts || 38,
            progress: s.progress,
            status: s.status
          }));
          setSchemes(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API_URL]);

  const activeCount = schemes.filter(s => s.status.includes("Active") || s.status.includes("Ongoing")).length;
  const avgProgress = schemes.length > 0 ? Math.round(schemes.reduce((s, x) => s + x.progress, 0) / schemes.length) : 0;

  return (
    <PortalLayout title="Schemes Overview" subtitle="Commissioner · State Operations" avatarLetter="C" avatarColor="#06b6d4" themeClass="theme-commissioner" accentColor="#06b6d4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Schemes", value: loading ? "..." : activeCount.toString(), icon: "📜", color: "text-cyan-400" },
          { label: "Total Budget", value: "₹24,630 Cr", icon: "💰", color: "text-emerald-400" },
          { label: "Beneficiaries", value: "1.5 Cr+", icon: "👨‍🎓", color: "text-amber-400" },
          { label: "Avg Progress", value: loading ? "..." : `${avgProgress}%`, icon: "📊", color: "text-violet-400" },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className={`text-2xl font-extrabold ${k.color} mb-1`}>{k.value}</div>
            <div className="text-xs text-slate-500 font-semibold">{k.label}</div>
          </div>
        ))}
      </div>
      {toast && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl">{toast}</div>}

      <div className="glass rounded-2xl p-6 border border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-white">📜 State Education Schemes</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin mb-3" />
            <span className="text-xs text-slate-500">Loading schemes...</span>
          </div>
        ) : schemes.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-700 rounded-xl">
            <span className="text-3xl block mb-2">📜</span>
            <p className="text-sm text-slate-400 font-medium">No education schemes found.</p>
            <p className="text-xs text-slate-655 mt-1">Please populate the schemes database using seed scripts.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schemes.map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-cyan-500/30 transition-all">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge text-[9px] ${s.status === "Active" || s.status === "Ongoing" ? "badge-green" : s.status === "Rollout" ? "badge-blue" : "badge-yellow"}`}>{s.status}</span>
                    <span className="text-[10px] text-slate-500">{s.districts} districts · {s.beneficiaries}</span>
                  </div>
                  <div className="text-xs font-bold text-white">{s.name}</div>
                  <div className="text-[10px] text-cyan-400 font-bold">{s.budget}</div>
                </div>
                <div className="text-right ml-4 w-24">
                  <div className={`text-sm font-bold ${s.progress >= 90 ? "text-emerald-400" : s.progress >= 70 ? "text-amber-400" : "text-red-400"}`}>{s.progress}%</div>
                  <div className="text-[10px] text-slate-500">Progress</div>
                  <div className="h-1.5 bg-slate-800 rounded-full mt-1"><div className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500" style={{ width: `${s.progress}%` }} /></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
