"use client";
import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";

interface BudgetItem {
  id: string | number;
  scheme: string;
  category: string;
  allocated: number;
  utilized: number;
  districts: number;
}

export default function CommissionerBudgetPage() {
  const [budget, setBudget] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_URL}/api/commissioner/budget`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          // Map backend MinisterBudget model (head -> scheme, approved -> allocated, etc)
          const mapped = json.data.map((b: any) => ({
            id: b.id,
            scheme: b.head,
            category: b.category,
            allocated: b.approved,
            utilized: b.utilized,
            districts: b.districts || 38
          }));
          setBudget(mapped);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API_URL]);

  const totalAlloc = budget.reduce((s, b) => s + b.allocated, 0);
  const totalUtil = budget.reduce((s, b) => s + b.utilized, 0);

  return (
    <PortalLayout title="Budget Utilization" subtitle="Commissioner · State Operations" avatarLetter="C" avatarColor="#06b6d4" themeClass="theme-commissioner" accentColor="#06b6d4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Allocated", value: loading ? "..." : `₹${(totalAlloc / 100).toFixed(1)}Cr`, icon: "💰", color: "text-cyan-400" },
          { label: "Total Utilized", value: loading ? "..." : `₹${(totalUtil / 100).toFixed(1)}Cr`, icon: "✅", color: "text-emerald-400" },
          { label: "Utilization Rate", value: loading ? "..." : totalAlloc > 0 ? `${Math.round((totalUtil / totalAlloc) * 100)}%` : "N/A", icon: "📊", color: "text-amber-400" },
          { label: "Unspent Balance", value: loading ? "..." : `₹${((totalAlloc - totalUtil) / 100).toFixed(1)}Cr`, icon: "⏳", color: "text-red-400" },
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
          <h2 className="text-base font-semibold text-white">💰 State Budget Utilization Tracker</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin mb-3" />
            <span className="text-xs text-slate-500">Loading budget data...</span>
          </div>
        ) : budget.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-700 rounded-xl">
            <span className="text-3xl block mb-2">💰</span>
            <p className="text-sm text-slate-400 font-medium">No budget allocations found.</p>
            <p className="text-xs text-slate-650 mt-1">Budget data will be displayed once seeded or loaded into the database.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {budget.map(b => {
              const pct = Math.round((b.utilized / b.allocated) * 100);
              return (
                <div key={b.id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-xs font-bold text-white">{b.scheme}</div>
                      <div className="text-[10px] text-slate-500">{b.category} · {b.districts} districts</div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold text-xs">₹{b.utilized}L</span>
                      <span className="text-slate-500 text-[10px]"> / ₹{b.allocated}L</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-800 rounded-full">
                      <div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className={`text-xs font-bold ${pct >= 90 ? "text-emerald-400" : pct >= 70 ? "text-amber-400" : "text-red-400"}`}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
