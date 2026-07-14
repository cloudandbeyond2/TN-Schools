"use client";
import React, { useEffect, useState } from "react";
import PortalLayout from "@/components/PortalLayout";

interface StateKPI {
  label: string;
  value: string;
  trend: string;
  icon: string;
  color: string;
  sub: string;
}

interface BlockTrend {
  year: string;
  students: number;
  attendance: number;
  pass: number;
}

export default function CommissionerAnalyticsPage() {
  const [stateKPIs, setStateKPIs] = useState<StateKPI[]>([]);
  const [blockTrends, setBlockTrends] = useState<BlockTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_URL}/api/commissioner/analytics`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setStateKPIs(json.data.stateKPIs);
          setBlockTrends(json.data.blockTrends);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API_URL]);

  return (
    <PortalLayout title="State Analytics" subtitle="Commissioner · State Operations" avatarLetter="C" avatarColor="#06b6d4" themeClass="theme-commissioner" accentColor="#06b6d4">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin mb-3" />
          <span className="text-xs text-slate-500">Loading state analytics...</span>
        </div>
      ) : stateKPIs.length === 0 ? (
        <div className="glass rounded-2xl p-10 border border-slate-800 text-center">
          <span className="text-3xl block mb-3">📈</span>
          <p className="text-sm text-slate-400 font-medium">No analytics data available yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {stateKPIs.map(k => (
              <div key={k.label} className="kpi-card">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-2xl">{k.icon}</span>
                  <span className={`text-[10px] font-bold ${k.trend.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>{k.trend} {k.sub}</span>
                </div>
                <div className={`text-2xl font-extrabold ${k.color} mb-1`}>{k.value}</div>
                <div className="text-xs text-slate-500 font-semibold">{k.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="glass rounded-2xl p-6 border border-slate-800">
              <h2 className="text-base font-semibold text-white mb-4">📈 5-Year State Trend Analysis</h2>
              <div className="space-y-4">
                {blockTrends.map(t => (
                  <div key={t.year} className="flex items-center gap-4">
                    <span className="text-xs text-slate-500 font-bold w-10">{t.year}</span>
                    <div className="flex-1 space-y-1">
                      <div>
                        <div className="flex justify-between text-[9px] text-slate-500 mb-0.5"><span>Students (Lakh)</span><span>{t.students}L</span></div>
                        <div className="h-1.5 bg-slate-800 rounded-full"><div className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500" style={{ width: `${(t.students / 130) * 100}%` }} /></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] text-slate-500 mb-0.5"><span>Attendance</span><span>{t.attendance}%</span></div>
                        <div className="h-1.5 bg-slate-800 rounded-full"><div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${t.attendance}%` }} /></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[9px] text-slate-500 mb-0.5"><span>10th Pass %</span><span>{t.pass}%</span></div>
                        <div className="h-1.5 bg-slate-800 rounded-full"><div className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500" style={{ width: `${t.pass}%` }} /></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-slate-800">
              <h2 className="text-base font-semibold text-white mb-4">🤖 AI State Insights</h2>
              <div className="space-y-3">
                {[
                  { icon: "📈", text: "Student enrollment grew by 14.8% over 5 years. Positive demographic trend.", severity: "green" },
                  { icon: "🎯", text: "10th pass rate improved from 79% to 85.4%. On track to reach 90% by 2027.", severity: "green" },
                  { icon: "⚠️", text: "Rural districts still lag by 8-12% in pass rates. Targeted tuition programs needed.", severity: "amber" },
                  { icon: "🏗️", text: "Digital classroom penetration at 74%. Full coverage needed for 48K schools.", severity: "amber" },
                  { icon: "🔴", text: "Salem and Tirunelveli districts show dropout rates above 2%. Immediate intervention required.", severity: "red" },
                  { icon: "💡", text: "AI predicts state pass rate will cross 87% if current trajectory maintained.", severity: "green" },
                ].map((ins, i) => (
                  <div key={i} className={`flex gap-2 p-2.5 rounded-xl border ${ins.severity === "green" ? "bg-emerald-500/5 border-emerald-500/15" : ins.severity === "amber" ? "bg-amber-500/5 border-amber-500/15" : "bg-red-500/5 border-red-500/15"}`}>
                    <span className="text-xs">{ins.icon}</span>
                    <p className={`text-[10px] leading-relaxed ${ins.severity === "green" ? "text-emerald-300" : ins.severity === "amber" ? "text-amber-300" : "text-red-300"}`}>{ins.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </PortalLayout>
  );
}
