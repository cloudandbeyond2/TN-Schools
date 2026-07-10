"use client";
import PortalLayout from "@/components/PortalLayout";
import { useEffect, useState } from "react";

interface KpiItem {
  label: string;
  value: number;
  target: number;
  unit: string;
  icon: string;
  trend: string;
  color: string;
  bg: string;
  lowerBetter: boolean;
}

interface PredictionItem {
  id: string;
  category: string;
  title: string;
  prediction: string;
  confidence: number;
  trend: string;
  detail: string;
  recommendations: string[];
  color: string;
}

interface PolicyItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  impact: string;
  districts: number;
  since: string;
  aiScore: number;
}

interface StateKpi {
  enrollment: { total: number };
  attendancePct: number | null;
  totalSchools: number;
  byDistrict: { district: string; schools: number; students: number }[];
  governanceUsers?: {
    ministers: number; commissioners: number; deos: number; beos: number; headmasters: number;
  };
  kpis?: KpiItem[];
  predictions?: PredictionItem[];
  policies?: PolicyItem[];
}

const staticKpis = [
  { label: "10th Pass %", value: 87.4, target: 90.0, unit: "%", icon: "📘", trend: "+2.1%", color: "text-green-600", bg: "bg-green-50/50", lowerBetter: false },
  { label: "12th Pass %", value: 81.2, target: 85.0, unit: "%", icon: "📗", trend: "+1.8%", color: "text-green-600", bg: "bg-green-50/50", lowerBetter: false },
  { label: "Teacher Efficiency", value: 82.0, target: 88.0, unit: "%", icon: "👩‍🏫", trend: "+0.5%", color: "text-orange-600", bg: "bg-orange-50/50", lowerBetter: false },
  { label: "Scholarship Delivery", value: 94.2, target: 98.0, unit: "%", icon: "🎓", trend: "+3.2%", color: "text-green-600", bg: "bg-green-50/50", lowerBetter: false },
  { label: "Dropout Rate", value: 1.8, target: 1.5, unit: "%", icon: "⚠️", trend: "-0.2%", color: "text-orange-600", bg: "bg-orange-50/50", lowerBetter: true },
  { label: "Infrastructure Score", value: 78.0, target: 85.0, unit: "/100", icon: "🏗️", trend: "+3pts", color: "text-green-600", bg: "bg-green-50/50", lowerBetter: false },
  { label: "National Sports Ranks", value: 5.0, target: 3.0, unit: "Rank", icon: "🏆", trend: "+2", color: "text-green-600", bg: "bg-green-50/50", lowerBetter: true },
];

export default function MinisterDashboard() {
  const [stateData, setStateData] = useState<StateKpi | null>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_URL}/api/analytics/minister`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setStateData(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API_URL]);

  const totalStudents = stateData?.enrollment?.total ?? null;
  const attendancePct = stateData?.attendancePct ?? null;
  const totalSchools = stateData?.totalSchools ?? null;
  const byDistrict = stateData?.byDistrict ?? [];
  const govUsers = stateData?.governanceUsers;

  const displayKpis = stateData?.kpis && stateData.kpis.length > 0
    ? stateData.kpis
    : staticKpis;

  const displayPredictions = stateData?.predictions && stateData.predictions.length > 0
    ? stateData.predictions
    : [
        { id: "p1", title: "Dropout Prediction (Next Year)", prediction: "~14,200 students", color: "red", detail: "AI models suggest high risk of dropouts in Krishnagiri & Tirunelveli blocks due to agrarian shifts." },
        { id: "p2", title: "10th Board Pass % Prediction", prediction: "88.9%", color: "green", detail: "Based on mid-term model exams, class performance is expected to exceed last year's rate." },
        { id: "p3", title: "12th Board Pass % Prediction", prediction: "83.1%", color: "green", detail: "Steady growth across Government Higher Secondary Schools in Science stream." },
        { id: "p4", title: "Teacher Shortage by 2026", prediction: "4,200 positions", color: "orange", detail: "Retirement and new school upgradations will create vacancies primarily in Mathematics & Science subjects." },
        { id: "p5", title: "Infrastructure Investment Needed", prediction: "₹820 Crore", color: "orange", detail: "Required budget for digital lab rollouts and restroom renovation across 1,200 rural schools." }
      ];

  const displayPolicies = stateData?.policies && stateData.policies.length > 0
    ? stateData.policies
    : [
        { id: "pol1", title: "Dropout Hotspots", priority: "HIGH", impact: "5 blocks in Tirunelveli & Krishnagiri districts show dropout risk >3%. Recommend targeted scholarship drives." },
        { id: "pol2", title: "Teacher Deployment Gap", priority: "HIGH", impact: "Mathematics and Science teacher shortage is critical in 12 districts. Consider redeployment plan." },
        { id: "pol3", title: "Digital Lab Expansion", priority: "MEDIUM", impact: "38% of rural schools lack internet access. PM-SHRI and EMIS integration recommended." }
      ];

  return (
    <PortalLayout>
      {/* Executive Live State View */}
      <div className="theme-card bg-white rounded-2xl p-6 mb-6 fade-in border-t-4 border-t-red-500">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-800">🏛️ Tamil Nadu Education — Live State View</h2>
            <p className="text-xs text-gray-500 mt-0.5">Real-time database data · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-bold text-green-700">Live Feed</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: loading ? "..." : totalStudents ? totalStudents.toLocaleString("en-IN") : "N/A", icon: "🎓", color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
            { label: "Attendance Today", value: loading ? "..." : attendancePct !== null ? `${attendancePct.toFixed(1)}%` : "N/A", icon: "📅", color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
            { label: "Total Schools", value: loading ? "..." : totalSchools ? totalSchools.toLocaleString("en-IN") : "N/A", icon: "🏫", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
            { label: "Active Districts", value: loading ? "..." : byDistrict.length > 0 ? String(byDistrict.length) : "N/A", icon: "🗺️", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-5 text-center border ${s.border} ${s.bg}`}>
              <div className="text-3xl mb-2 flex justify-center">{s.icon}</div>
              <div className={`text-2xl font-extrabold ${s.color} mb-1`}>{s.value}</div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Governance Chain Status */}
      {govUsers && (
        <div className="theme-card bg-white rounded-2xl p-6 mb-6 fade-in border-t-4 border-t-indigo-500">
          <h2 className="text-base font-bold text-gray-800 mb-4">🏛️ Governance Chain — User Accounts</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Ministers", count: govUsers.ministers, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
              { label: "Commissioners", count: govUsers.commissioners, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
              { label: "DEOs", count: govUsers.deos, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
              { label: "BEOs", count: govUsers.beos, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
              { label: "Headmasters", count: govUsers.headmasters, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
            ].map((g) => (
              <div key={g.label} className={`rounded-xl p-4 text-center border ${g.border} ${g.bg}`}>
                <div className={`text-3xl font-black ${g.color} mb-1`}>{g.count}</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{g.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Monitoring Table */}
      <div className="theme-card bg-white rounded-2xl p-6 mb-6 fade-in-2 border-t-4 border-t-blue-500">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-800">📊 State KPI Monitoring</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayKpis.map((kpi) => (
            <div key={kpi.label} className="p-5 rounded-xl border transition-shadow hover:shadow-md border-green-200 bg-green-50/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{kpi.icon}</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded border text-green-700 bg-green-100 border-green-200">
                  MONITORING
                </span>
              </div>
              <div className="text-2xl font-extrabold text-gray-800 mb-1">{kpi.value}{kpi.unit}</div>
              <div className="text-xs font-semibold text-gray-500 mb-3">{kpi.label}</div>
              <div className="flex justify-between text-[10px] font-medium border-t border-gray-200 pt-2">
                <span className="text-gray-500">Target: {kpi.target}{kpi.unit}</span>
                <span className="text-green-600 font-bold">{kpi.trend} YoY</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* District Breakdown */}
      {byDistrict.length > 0 && (
        <div className="theme-card bg-white rounded-2xl p-6 mb-6 fade-in-2 border-t-4 border-t-cyan-500">
          <h2 className="text-base font-bold text-gray-800 mb-4">🗺️ District Breakdown — Live</h2>
          <div className="overflow-x-auto">
            <table className="data-table w-full text-sm">
              <thead><tr><th className="text-left p-2">District</th><th className="text-right p-2">Schools</th><th className="text-right p-2">Students</th></tr></thead>
              <tbody>
                {byDistrict.map((d) => (
                  <tr key={d.district} className="border-t border-gray-100">
                    <td className="p-2 font-medium text-gray-800">{d.district}</td>
                    <td className="p-2 text-right text-gray-600">{d.schools.toLocaleString()}</td>
                    <td className="p-2 text-right text-gray-600">{d.students.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Governance Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 fade-in-3">
        <div className="theme-card bg-white rounded-2xl p-6 border-t-4 border-t-purple-500">
          <h2 className="text-base font-bold text-gray-800 mb-4">🤖 AI Governance Predictions</h2>
          <div className="space-y-3">
            {displayPredictions.map((p) => (
              <div key={p.id || p.title} className={`flex items-center justify-between p-3 rounded-xl border bg-white shadow-sm ${p.color === "red" ? "border-red-200" : p.color === "green" ? "border-green-200" : "border-orange-200"}`}>
                <div className="flex flex-col gap-1 text-xs font-medium text-gray-600 max-w-[70%]">
                  <span className="font-bold text-gray-800">{p.title}</span>
                  <span className="text-[10px] text-gray-500">{p.detail}</span>
                </div>
                <span className={`text-sm font-bold ${p.color === "red" ? "text-red-650" : p.color === "green" ? "text-green-600" : "text-orange-600"}`}>{p.prediction}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="theme-card bg-white rounded-2xl p-6 border-t-4 border-t-amber-500">
          <h2 className="text-base font-bold text-gray-800 mb-4">💡 Policy Intelligence</h2>
          <div className="space-y-3">
            {displayPolicies.map((p) => (
              <div key={p.id || p.title} className="p-4 rounded-xl border shadow-sm bg-white border-orange-200">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-sm font-bold text-gray-800">{p.title}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded border text-orange-700 bg-orange-100 border-orange-200">ACTIVE</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{p.impact}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
