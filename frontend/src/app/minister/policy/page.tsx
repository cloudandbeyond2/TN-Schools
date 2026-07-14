"use client";
import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";

interface PolicyBrief {
  id: string;
  title: string;
  status: string;
  priority: string;
  impact: string;
  districts: number;
  since: string;
  aiScore: number;
}

const intelligenceReports = [
  { title: "Comparative Analysis: TN vs National Average", finding: "TN's 10th pass rate (85.4%) exceeds national avg (82.1%) by 3.3%. However, rural-urban gap remains at 8.2% — highest in 5 years.", action: "Targeted rural scheme required." },
  { title: "Early Warning: Dropout Surge in 12 Districts", finding: "AI model identifies 12 districts showing 3-month rolling dropout increase. Primarily driven by economic pressures post-monsoon.", action: "Emergency scholarship disbursement recommended." },
  { title: "Infrastructure ROI Analysis", finding: "Schools that received infrastructure upgrades in 2022-23 show 4.7% improvement in pass rates vs non-upgraded peers. High ROI demonstrated.", action: "Accelerate Phase 3 construction." },
];

export default function MinisterPolicyPage() {
  const [policies, setPolicies] = useState<PolicyBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_URL}/api/minister/policy`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setPolicies(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API_URL]);

  const sel = policies.find(p => p.id === active);
  const avgAiScore = policies.length > 0 ? Math.round(policies.reduce((s, p) => s + p.aiScore, 0) / policies.length) : 0;

  return (
    <PortalLayout title="Policy Intelligence" subtitle="Minister · Executive Command Center" avatarLetter="M" avatarColor="#ef4444" themeClass="theme-minister" accentColor="#ef4444">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Policies", value: loading ? "..." : policies.length.toString(), icon: "💡", color: "text-red-400" },
          { label: "Approved", value: loading ? "..." : policies.filter(p => p.status === "Approved").length.toString(), icon: "✅", color: "text-emerald-400" },
          { label: "Critical Priority", value: loading ? "..." : policies.filter(p => p.priority === "HIGH").length.toString(), icon: "🔴", color: "text-red-400" },
          { label: "Avg AI Score", value: loading ? "..." : `${avgAiScore}/100`, icon: "🤖", color: "text-violet-400" },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className={`text-2xl font-extrabold ${k.color} mb-1`}>{k.value}</div>
            <div className="text-xs text-slate-500 font-semibold">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-slate-800">
          <h2 className="text-base font-semibold text-white mb-4">💡 Active Policy Intelligence Board</h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin mb-3" />
              <span className="text-xs text-slate-500">Loading policy data...</span>
            </div>
          ) : policies.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-700 rounded-xl">
              <span className="text-3xl block mb-2">💡</span>
              <p className="text-sm text-slate-400 font-medium">No policy briefs available yet.</p>
              <p className="text-xs text-slate-600 mt-1">Run the minister seed script to populate this table.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {policies.map(p => (
                <div
                  key={p.id}
                  onClick={() => setActive(active === p.id ? null : p.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${active === p.id ? "border-red-500/40 bg-red-500/5" : "border-slate-800 bg-slate-900/60 hover:border-red-500/20"}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`badge text-[9px] ${p.status === "Approved" ? "badge-green" : p.status === "Active Alert" ? "badge-red" : p.status === "Needs Action" ? "badge-yellow" : "badge-blue"}`}>{p.status}</span>
                        <span className={`badge text-[9px] ${p.priority === "HIGH" ? "badge-red" : p.priority === "MEDIUM" ? "badge-yellow" : "badge-green"}`}>{p.priority}</span>
                      </div>
                      <div className="text-xs font-bold text-white">{p.title}</div>
                      <div className="text-[10px] text-slate-500">Impact: {p.impact} · {p.districts} districts · Since {p.since}</div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-[10px] text-slate-500 mb-1">AI Readiness</div>
                      <div className={`text-sm font-bold ${p.aiScore >= 85 ? "text-emerald-400" : p.aiScore >= 72 ? "text-amber-400" : "text-red-400"}`}>{p.aiScore}/100</div>
                    </div>
                  </div>
                  {active === p.id && (
                    <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-3">
                      <button onClick={e => { e.stopPropagation(); alert(`Policy brief exported for: ${p.title}`); }} className="py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all">Export Brief</button>
                      <button onClick={e => { e.stopPropagation(); alert(`Escalation notice sent for: ${p.title}`); }} className="py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-all">Escalate to Cabinet</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6 border border-slate-800">
          <h2 className="text-sm font-semibold text-white mb-4">🤖 Intelligence Reports</h2>
          <div className="space-y-4">
            {intelligenceReports.map((r, i) => (
              <div key={i} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="text-[10px] font-bold text-red-400 mb-1">{r.title}</div>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-2">{r.finding}</p>
                <div className="text-[9px] font-bold text-amber-400">💡 {r.action}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
