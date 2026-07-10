"use client";
import PortalLayout from "@/components/PortalLayout";
import { useEffect, useState } from "react";

interface StateKpi {
  enrollment: { total: number };
  attendancePct: number | null;
  totalSchools: number;
  byDistrict: { district: string; schools: number; students: number }[];
  governanceUsers?: {
    ministers: number; commissioners: number; deos: number; beos: number; headmasters: number;
  };
}

const staticKpis = [
  { label: "10th Pass %", value: "87.4%", target: "90%", trend: "+2.1%", status: "on-track", icon: "📘" },
  { label: "12th Pass %", value: "81.2%", target: "85%", trend: "+1.8%", status: "on-track", icon: "📗" },
  { label: "Teacher Efficiency", value: "82%", target: "88%", trend: "+0.5%", status: "at-risk", icon: "🧑‍🏫" },
  { label: "Scholarship Delivery", value: "94.2%", target: "98%", trend: "+3.2%", status: "on-track", icon: "🎓" },
  { label: "Dropout Rate", value: "1.8%", target: "<1.5%", trend: "-0.2%", status: "at-risk", icon: "⚠️" },
  { label: "Infrastructure Score", value: "78/100", target: "85/100", trend: "+3pts", status: "on-track", icon: "🏗️" },
  { label: "National Sports Ranks", value: "Top 5", target: "Top 3", trend: "+2", status: "on-track", icon: "🏆" },
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
          <div className="flex gap-2">
            <span className="text-[10px] font-bold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">ON TRACK: {staticKpis.filter(k => k.status === "on-track").length}</span>
            <span className="text-[10px] font-bold text-orange-700 bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-full">AT RISK: {staticKpis.filter(k => k.status === "at-risk").length}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staticKpis.map((kpi) => (
            <div key={kpi.label} className={`p-5 rounded-xl border transition-shadow hover:shadow-md ${kpi.status === "on-track" ? "border-green-200 bg-green-50/50" : "border-orange-200 bg-orange-50/50"}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{kpi.icon}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${kpi.status === "on-track" ? "text-green-700 bg-green-100 border-green-200" : "text-orange-700 bg-orange-100 border-orange-200"}`}>
                  {kpi.status === "on-track" ? "ON TRACK" : "AT RISK"}
                </span>
              </div>
              <div className="text-2xl font-extrabold text-gray-800 mb-1">{kpi.value}</div>
              <div className="text-xs font-semibold text-gray-500 mb-3">{kpi.label}</div>
              <div className="flex justify-between text-[10px] font-medium border-t border-gray-200 pt-2">
                <span className="text-gray-500">Target: {kpi.target}</span>
                <span className={kpi.trend.startsWith("+") ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{kpi.trend} YoY</span>
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
            {[
              { label: "Dropout Prediction (Next Year)", value: "~14,200 students", severity: "red", icon: "📉" },
              { label: "10th Board Pass % Prediction", value: "88.9%", severity: "green", icon: "📊" },
              { label: "12th Board Pass % Prediction", value: "83.1%", severity: "green", icon: "📊" },
              { label: "Teacher Shortage by 2026", value: "4,200 positions", severity: "orange", icon: "🧑‍🏫" },
              { label: "Infrastructure Investment Needed", value: "820 Crore", severity: "orange", icon: "🏗️" },
            ].map((p) => (
              <div key={p.label} className={`flex items-center justify-between p-3 rounded-xl border bg-white shadow-sm ${p.severity === "red" ? "border-red-200" : p.severity === "green" ? "border-green-200" : "border-orange-200"}`}>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${p.severity === "red" ? "bg-red-50 text-red-600" : p.severity === "green" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}>{p.icon}</div>
                  <span>{p.label}</span>
                </div>
                <span className={`text-sm font-bold ${p.severity === "red" ? "text-red-600" : p.severity === "green" ? "text-green-600" : "text-orange-600"}`}>{p.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="theme-card bg-white rounded-2xl p-6 border-t-4 border-t-amber-500">
          <h2 className="text-base font-bold text-gray-800 mb-4">💡 Policy Intelligence</h2>
          <div className="space-y-3">
            {[
              { title: "Dropout Hotspots", desc: "5 blocks in Tirunelveli & Krishnagiri districts show dropout risk >3%. Recommend targeted scholarship drives.", priority: "HIGH", color: "red" },
              { title: "Teacher Deployment Gap", desc: "Mathematics and Science teacher shortage is critical in 12 districts. Consider redeployment plan.", priority: "HIGH", color: "red" },
              { title: "Digital Lab Expansion", desc: "38% of rural schools lack internet access. PM-SHRI and EMIS integration recommended.", priority: "MEDIUM", color: "orange" },
            ].map((p) => (
              <div key={p.title} className={`p-4 rounded-xl border shadow-sm bg-white ${p.color === "red" ? "border-red-200" : "border-orange-200"}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-sm font-bold text-gray-800">{p.title}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${p.color === "red" ? "text-red-700 bg-red-100 border-red-200" : "text-orange-700 bg-orange-100 border-orange-200"}`}>{p.priority}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
