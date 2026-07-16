"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";

interface School { rank: number; name: string; block: string; students: number; pass10: number; pass12: number; composite: number; }

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SchoolRankingsPage() {
  const { data: session } = useSession();
  const district = (session?.user as any)?.district || "Coimbatore";

  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({ name: "", block: "", students: "500", pass10: "80", pass12: "75" });

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/deo/rankings?district=${encodeURIComponent(district)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSchools(json.data);
      }
    } catch (e) {
      console.error("Error loading rankings:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [session, district]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const composite = (Number(form.pass10) + Number(form.pass12)) / 2;
    const updated = [...schools, { rank: 0, name: form.name, block: form.block, students: Number(form.students), pass10: Number(form.pass10), pass12: Number(form.pass12), composite }]
      .sort((a, b) => b.composite - a.composite).map((s, i) => ({ ...s, rank: i + 1 }));
    setSchools(updated);
    setForm({ name: "", block: "", students: "500", pass10: "80", pass12: "75" });
    setIsModalOpen(false);
    setToast(`🏆 School '${form.name}' ranked and added to district index.`);
    setTimeout(() => setToast(null), 4000);
  };

  const simulateExcel = () => {
    setIsUploading(true);
    setTimeout(() => {
      const extras: School[] = [
        { rank: 0, name: "GHSS Vadavalli", block: "CBE South", students: 890, pass10: 87, pass12: 81, composite: 84 },
        { rank: 0, name: "GHS Kinathukadavu", block: "Pollachi", students: 650, pass10: 76, pass12: 70, composite: 73 },
      ];
      const updated = [...schools, ...extras].sort((a, b) => b.composite - a.composite).map((s, i) => ({ ...s, rank: i + 1 }));
      setSchools(updated);
      setIsUploading(false);
      setIsModalOpen(false);
      setToast("📊 District school ranking spreadsheet parsed! 2 new schools ranked.");
      setTimeout(() => setToast(null), 4000);
    }, 1500);
  };

  return (
    <PortalLayout title="School Rankings" subtitle="DEO Officer · Coimbatore District" avatarLetter="D" avatarColor="#ec4899" themeClass="theme-deo" accentColor="#ec4899">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Ranked Schools", value: schools.length.toString(), icon: "🏫", color: "text-pink-400" },
          { label: "Top Composite", value: `${schools[0]?.composite}%`, icon: "🥇", color: "text-yellow-400" },
          { label: "Avg Composite", value: `${(schools.reduce((s, x) => s + x.composite, 0) / schools.length).toFixed(1)}%`, icon: "📊", color: "text-cyan-400" },
          { label: "Below 75%", value: schools.filter(s => s.composite < 75).length.toString(), icon: "⚠️", color: "text-red-400" },
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
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-semibold text-white">🏆 District School Rankings</h2>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl transition-all">+ Add School</button>
        </div>
        <table className="data-table">
          <thead><tr><th>Rank</th><th>School</th><th>Block</th><th>Students</th><th>10th %</th><th>12th %</th><th>Composite</th></tr></thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs text-slate-500">Loading rankings...</span>
                </td>
              </tr>
            ) : schools.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-xs text-slate-500">
                  No schools registered in this district rankings index.
                </td>
              </tr>
            ) : (
              schools.map(s => (
                <tr key={s.name}>
                  <td><span className={`badge ${s.rank === 1 ? "badge-green" : s.rank <= 3 ? "badge-blue" : s.rank <= 5 ? "badge-yellow" : "badge-red"}`}>#{s.rank}</span></td>
                  <td className="font-bold text-white text-xs">{s.name}</td>
                  <td className="text-slate-400 text-xs">{s.block}</td>
                  <td>{s.students.toLocaleString()}</td>
                  <td className="text-slate-300">{s.pass10}%</td>
                  <td className="text-slate-300">{s.pass12}%</td>
                  <td><span className={`font-bold text-sm ${s.composite >= 88 ? "text-emerald-400" : s.composite >= 80 ? "text-amber-400" : "text-red-400"}`}>{s.composite}%</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl p-6 space-y-6" style={{ background: "#090d16", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 20px 50px rgba(0,0,0,0.95)" }}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">🏆 Add School to Rankings</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="text-xs font-bold text-pink-400 uppercase tracking-wider">Manual Entry</div>
                {[{ label: "School Name", key: "name", type: "text", ph: "GHS Example" }, { label: "Block", key: "block", type: "text", ph: "Pollachi" }, { label: "Students", key: "students", type: "number", ph: "500" }, { label: "10th Pass %", key: "pass10", type: "number", ph: "80" }, { label: "12th Pass %", key: "pass12", type: "number", ph: "75" }].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] text-slate-400 mb-1 font-semibold">{f.label}</label>
                    <input type={f.type} required value={(form as any)[f.key]} placeholder={f.ph} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500" />
                  </div>
                ))}
                <button type="submit" className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs">Rank & Add</button>
              </form>
              <div className="border-l border-slate-800 pl-6 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Excel Import</div>
                  <div onClick={simulateExcel} className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-900/40 rounded-2xl p-6 text-center cursor-pointer min-h-[180px] flex flex-col items-center justify-center space-y-3">
                    {isUploading ? (<><div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" /><span className="text-[10px] text-slate-400">Parsing...</span></>) : (<><span className="text-3xl">📊</span><span className="text-xs font-bold text-white">Import Rankings Sheet</span><span className="text-[9px] text-slate-500">Click to simulate district_rankings.xlsx</span></>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
