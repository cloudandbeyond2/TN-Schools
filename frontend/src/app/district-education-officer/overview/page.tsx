"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";

interface BlockDetail { name: string; schools: number; students: number; teachers: number; attendance: number; pass10: number; pass12: number; }

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DEOOverviewPage() {
  const { data: session } = useSession();
  const district = (session?.user as any)?.district || "Coimbatore";

  const [blocks, setBlocks] = useState<BlockDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/deo/performance?district=${encodeURIComponent(district)}`);
      const json = await res.json();
      if (json.success && json.data) {
        const formatted = json.data.map((b: any) => ({
          name: b.name,
          schools: b.schools,
          students: b.students,
          teachers: b.teachers,
          attendance: b.attendance,
          pass10: b.pass10,
          pass12: b.pass12
        }));
        setBlocks(formatted);
      }
    } catch (e) {
      console.error("Error loading overview data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [session, district]);

  const sel = blocks.find(b => b.name === selected);

  // Compute District Stats
  const totalSchools = blocks.reduce((sum, b) => sum + b.schools, 0);
  const totalStudents = blocks.reduce((sum, b) => sum + b.students, 0);
  const totalTeachers = blocks.reduce((sum, b) => sum + b.teachers, 0);
  const avgGpa = blocks.length > 0 ? (blocks.reduce((sum, b) => sum + (b.pass10 + b.pass12) / 2, 0) / blocks.length).toFixed(1) : "87.1";

  return (
    <PortalLayout
      title="District Overview"
      subtitle={`DEO Officer · ${district} District`}
      avatarLetter="D"
      avatarColor="#ec4899"
      themeClass="theme-deo"
      accentColor="#ec4899"
    >
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6 fade-in">
        {[
          { label: "Total Blocks", value: blocks.length.toString(), icon: "🗺️", color: "text-pink-400" },
          { label: "Total Schools", value: totalSchools.toString(), icon: "🏫", color: "text-violet-400" },
          { label: "Total Students", value: totalStudents.toLocaleString(), icon: "👨‍🎓", color: "text-emerald-400" },
          { label: "Total Teachers", value: totalTeachers.toLocaleString(), icon: "👩‍🏫", color: "text-amber-400" },
          { label: "District GPA", value: `${avgGpa}%`, icon: "📊", color: "text-cyan-400" },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className={`text-2xl font-extrabold ${k.color} mb-1`}>{k.value}</div>
            <div className="text-xs text-slate-500 font-semibold">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-slate-800">
          <h2 className="text-base font-semibold text-white mb-5">🗺️ Block-wise District Overview</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Block</th><th>Schools</th><th>Students</th><th>Teachers</th>
                <th>Attendance</th><th>10th %</th><th>12th %</th><th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mx-auto mb-2" />
                    <span className="text-xs text-slate-500">Loading overview...</span>
                  </td>
                </tr>
              ) : blocks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-xs text-slate-500">
                    No block aggregates registered.
                  </td>
                </tr>
              ) : (
                blocks.map(b => (
                  <tr key={b.name} className={selected === b.name ? "bg-pink-500/10" : ""}>
                    <td className="font-bold text-white text-xs">{b.name} Block</td>
                    <td>{b.schools}</td>
                    <td>{b.students.toLocaleString()}</td>
                    <td>{b.teachers}</td>
                    <td><span className={`badge ${b.attendance >= 90 ? "badge-green" : b.attendance >= 85 ? "badge-yellow" : "badge-red"}`}>{b.attendance}%</span></td>
                    <td className="text-slate-300">{b.pass10}%</td>
                    <td className="text-pink-400 font-semibold">{b.pass12}%</td>
                    <td><button onClick={() => setSelected(selected === b.name ? null : b.name)} className="text-xs text-pink-400 hover:text-pink-300 font-bold">View →</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="glass rounded-2xl p-6 border border-slate-800">
          <h2 className="text-sm font-semibold text-white mb-4">📋 Block Detail View</h2>
          {sel ? (
            <div className="space-y-3">
              <div className="text-pink-400 font-bold text-sm">{sel.name}</div>
              {[
                { label: "Schools", value: sel.schools },
                { label: "Students", value: sel.students.toLocaleString() },
                { label: "Teachers", value: sel.teachers },
                { label: "Attendance", value: `${sel.attendance}%` },
                { label: "10th Pass %", value: `${sel.pass10}%` },
                { label: "12th Pass %", value: `${sel.pass12}%` },
              ].map(r => (
                <div key={r.label} className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-400">{r.label}</span>
                  <span className="text-xs text-white font-bold">{r.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-600 text-xs mt-10">← Click a block row to see details</div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
