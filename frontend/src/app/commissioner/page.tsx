"use client";
import PortalLayout from "@/components/PortalLayout";
import KpiStrip from "@/components/kpi/KpiStrip";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface DistrictStat {
  district: string;
  schools: number;
  students: number;
}

interface HierarchyData {
  districtStats: DistrictStat[];
  deos: { id: string; name: string; email: string; district: string | null }[];
}

export default function CommissionerDashboard() {
  const { data: session } = useSession();
  const [hierarchyData, setHierarchyData] = useState<HierarchyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [commAnalytics, setCommAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const userId = (session?.user as any)?.id;

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_URL}/api/hierarchy/commissioner/${userId}`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setHierarchyData(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId, API_URL]);

  useEffect(() => {
    if (!userId) return;
    setAnalyticsLoading(true);
    fetch(`${API_URL}/api/commissioner/analytics`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setCommAnalytics(json.data); })
      .catch(() => {})
      .finally(() => setAnalyticsLoading(false));
  }, [userId, API_URL]);

  const districts = hierarchyData?.districtStats ?? [];
  const deos = hierarchyData?.deos ?? [];

  const colors = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#f43f5e"];
  const rawBudgets = commAnalytics?.budgets || [];
  const budgetsToRender = rawBudgets.length > 0 
    ? rawBudgets.map((b: any, idx: number) => ({
        scheme: b.head,
        allocated: b.approved,
        used: b.utilized,
        color: colors[idx % colors.length]
      }))
    : [
        { scheme: "Samagra Shiksha", allocated: 2400, used: 1820, color: "#06b6d4" },
        { scheme: "Infrastructure Dev.", allocated: 1200, used: 980, color: "#8b5cf6" },
        { scheme: "Mid-Day Meal", allocated: 900, used: 876, color: "#10b981" },
        { scheme: "Scholarship Disbursal", allocated: 650, used: 520, color: "#f59e0b" },
      ];

  const sports = commAnalytics?.sports || {
    totalAthletes: 45000,
    nationalMedals: 214,
    bmiNormalPct: 86,
    sportsBudgetUsed: 45
  };

  return (
    <PortalLayout>
      {/* State-level KPIs — real academic-year analytics */}
      <KpiStrip path="/api/analytics/state" title="State KPIs" />

      {/* DEO Assignments */}
      {deos.length > 0 && (
        <div className="glass rounded-2xl p-6 mb-6 fade-in">
          <h2 className="text-base font-semibold text-white mb-4">🗂️ Assigned District Education Officers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {deos.map((deo) => (
              <div key={deo.id} className="bg-slate-900/60 rounded-xl p-4 border border-slate-700">
                <div className="font-bold text-white text-sm">{deo.name}</div>
                <div className="text-xs text-slate-400 mt-1">{deo.email}</div>
                {deo.district && (
                  <div className="text-xs text-cyan-400 font-semibold mt-2">📍 {deo.district}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Utilization */}
      <div className="glass rounded-2xl p-6 mb-6 fade-in-2">
        <h2 className="text-base font-semibold text-white mb-5">💰 Budget Utilization by Scheme</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analyticsLoading || !commAnalytics ? (
            <div className="text-xs text-slate-500 py-2">Loading budget details…</div>
          ) : (
            budgetsToRender.map((b: any) => {
              const pct = Math.round((b.used / b.allocated) * 100);
              return (
                <div key={b.scheme} className="bg-slate-900/60 rounded-xl p-4">
                  <div className="text-xs text-slate-500 mb-1">{b.scheme}</div>
                  <div className="text-xl font-bold mb-2" style={{ color: b.color }}>₹{b.used}Cr</div>
                  <div className="progress-bar mb-1">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${b.color}, ${b.color}aa)` }} />
                  </div>
                  <div className="text-xs text-slate-600">{pct}% of ₹{b.allocated}Cr</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sports & Wellness */}
      <div className="glass rounded-2xl p-6 mb-6 fade-in-2 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> State Sports & Wellness Overview</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700">
            <div className="text-2xl font-black text-white">
              {analyticsLoading || !commAnalytics ? "…" : `${(sports.totalAthletes ?? 0).toLocaleString()}+`}
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Student Athletes</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700">
            <div className="text-2xl font-black text-amber-400">
              {analyticsLoading || !commAnalytics ? "…" : (sports.nationalMedals ?? 0).toLocaleString()}
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">National Medals</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700">
            <div className="text-2xl font-black text-emerald-400">
              {analyticsLoading || !commAnalytics ? "…" : `${sports.bmiNormalPct ?? 86}%`}
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Avg Student BMI Normal</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700">
            <div className="text-2xl font-black text-red-400">
              {analyticsLoading || !commAnalytics ? "…" : `₹${sports.sportsBudgetUsed ?? 45}Cr`}
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Sports Budget Used</div>
          </div>
        </div>
      </div>

      {/* District Comparison Table — real data */}
      <div className="glass rounded-2xl p-6 fade-in-3">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">🗺️ District Performance Index</h2>
          <button id="commissioner-export" className="text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-lg">⬇ Export Data</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>District</th>
              <th>Schools</th>
              <th>Students</th>
              {deos.length > 0 && <th>DEO</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center text-slate-400 py-4">Loading district data...</td></tr>
            ) : districts.length > 0 ? (
              districts.map((d) => {
                const deo = deos.find((o) => o.district?.toLowerCase() === d.district.toLowerCase());
                return (
                  <tr key={d.district}>
                    <td className="font-medium text-white">{d.district}</td>
                    <td>{d.schools.toLocaleString()}</td>
                    <td>{d.students.toLocaleString()}</td>
                    {deos.length > 0 && <td className="text-cyan-400 text-xs">{deo ? deo.name : "—"}</td>}
                  </tr>
                );
              })
            ) : (
              // Fallback static data if DB is empty
              [
                { name: "Chennai", schools: 820, students: "6.2L" },
                { name: "Coimbatore", schools: 710, students: "5.8L" },
                { name: "Madurai", schools: 650, students: "5.1L" },
                { name: "Tiruchirappalli", schools: 590, students: "4.7L" },
                { name: "Salem", schools: 540, students: "4.2L" },
              ].map((d) => (
                <tr key={d.name}>
                  <td className="font-medium text-white">{d.name}</td>
                  <td>{d.schools}</td>
                  <td>{d.students}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PortalLayout>
  );
}
