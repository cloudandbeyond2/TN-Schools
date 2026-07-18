"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";

interface DropoutRecord { id: string; studentName: string; school: string; block: string; class: string; reason: string; date: string; status: string; district: string; }

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DropoutHeatmapPage() {
  const { data: session } = useSession();
  const district = (session?.user as any)?.district || "Coimbatore";

  const [records, setRecords] = useState<DropoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({ studentName: "", school: "", block: "", class: "8th", reason: "Economic", date: "", status: "Intervention Pending" });

  const fetchDropouts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/deo/dropouts?district=${encodeURIComponent(district)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setRecords(json.data);
      }
    } catch (e) {
      console.error("Error loading dropouts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropouts();
  }, [session, district]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/deo/dropouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, district })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setRecords(p => [json.data, ...p]);
        setIsModalOpen(false);
        setToast(`⚠️ Dropout record for '${form.studentName}' logged. Intervention team notified.`);
        setTimeout(() => setToast(null), 4000);
      }
    } catch (err) {
      console.error("Error logging dropout:", err);
    }
  };

  const simulateExcel = () => {
    setIsUploading(true);
    setTimeout(async () => {
      try {
        const mockUploads = [
          { studentName: "Rajan A.", school: "GHS Annur", block: "Annur", class: "9th", reason: "Economic", date: "2024-11-10", status: "Intervention Pending" },
          { studentName: "Meena S.", school: "GHS Pollachi", block: "Pollachi", class: "7th", reason: "Migration", date: "2024-11-12", status: "Dropped" },
        ];

        const added: DropoutRecord[] = [];
        for (const item of mockUploads) {
          const res = await fetch(`${API_URL}/api/deo/dropouts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...item, district })
          });
          const json = await res.json();
          if (json.success && json.data) {
            added.push(json.data);
          }
        }

        if (added.length > 0) {
          setRecords(p => [...added, ...p]);
          setToast(`📋 Dropout register spreadsheet imported! ${added.length} new cases logged.`);
          setTimeout(() => setToast(null), 4000);
        }
      } catch (e) {
        console.error("Excel simulation error:", e);
      } finally {
        setIsUploading(false);
        setIsModalOpen(false);
      }
    }, 1500);
  };

  const dbBlocks = Array.from(new Set(records.map(r => r.block).filter(Boolean)));
  const defaultBlocks = district === "Coimbatore" ? ["Annur", "Mettupalayam", "Pollachi", "Coimbatore North", "Coimbatore South"] : [];
  const allBlockNames = Array.from(new Set([...defaultBlocks, ...dbBlocks]));

  const blockRisk = allBlockNames.map(bName => {
    const dbCount = records.filter(r => r.block.toLowerCase().trim() === bName.toLowerCase().trim()).length;
    const baseline = bName === "Annur" ? 55 : bName === "Mettupalayam" ? 40 : bName === "Pollachi" ? 30 : bName === "Coimbatore North" ? 22 : bName === "Coimbatore South" ? 15 : 0;
    const totalCount = baseline + dbCount;
    const risk = totalCount > 45 ? "HIGH" : totalCount > 25 ? "MEDIUM" : "LOW";
    return { name: bName, count: totalCount, risk };
  });

  blockRisk.sort((a, b) => b.count - a.count);

  return (
    <PortalLayout title="Dropout Heatmap" subtitle={`DEO Officer · ${district} District`} avatarLetter="D" avatarColor="#ec4899" themeClass="theme-deo" accentColor="#ec4899">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Dropouts", value: loading ? "..." : records.length.toString(), icon: "📉", color: "text-red-400" },
          { label: "Pending Intervention", value: loading ? "..." : records.filter(r => r.status === "Intervention Pending").length.toString(), icon: "⚠️", color: "text-amber-400" },
          { label: "Re-enrolled", value: loading ? "..." : records.filter(r => r.status === "Re-enrolled").length.toString(), icon: "✅", color: "text-emerald-400" },
          { label: "High Risk Blocks", value: loading ? "..." : blockRisk.filter(b => b.risk === "HIGH").length.toString(), icon: "🔴", color: "text-red-400" },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className={`text-2xl font-extrabold ${k.color} mb-1`}>{k.value}</div>
            <div className="text-xs text-slate-500 font-semibold">{k.label}</div>
          </div>
        ))}
      </div>
      {toast && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl">{toast}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="glass rounded-2xl p-6 border border-slate-800">
          <h2 className="text-sm font-semibold text-white mb-4">🔴 Dropout Risk Heatmap</h2>
          <div className="space-y-3">
            {blockRisk.map(b => (
              <div key={b.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{b.name}</span>
                  <span className={`font-bold ${b.risk === "HIGH" ? "text-red-400" : b.risk === "MEDIUM" ? "text-amber-400" : "text-emerald-400"}`}>{b.count} students</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min((b.count / 60) * 100, 100)}%`, background: b.risk === "HIGH" ? "linear-gradient(90deg,#ef4444,#dc2626)" : b.risk === "MEDIUM" ? "linear-gradient(90deg,#f59e0b,#d97706)" : "linear-gradient(90deg,#10b981,#059669)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-white">📋 Dropout Register</h2>
            <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl">+ Log Dropout</button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Student</th><th>School</th><th>Block</th><th>Class</th><th>Reason</th><th>Status</th></tr></thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <div className="w-6 h-6 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mx-auto mb-2" />
                      <span className="text-xs text-slate-500">Loading records...</span>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-xs text-slate-500">
                      No dropout records logged for this district.
                    </td>
                  </tr>
                ) : (
                  records.map(r => (
                    <tr key={r.id}>
                      <td className="font-bold text-white text-xs">{r.studentName}</td>
                      <td className="text-slate-400 text-xs">{r.school}</td>
                      <td className="text-xs">{r.block}</td>
                      <td className="text-xs">{r.class || "8th"}</td>
                      <td className="text-xs text-amber-400">{r.reason}</td>
                      <td><span className={`badge ${r.status === "Re-enrolled" ? "badge-green" : r.status === "Dropped" ? "badge-red" : "badge-yellow"}`}>{r.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl p-6 space-y-6" style={{ background: "#090d16", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 20px 50px rgba(0,0,0,0.95)" }}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">📋 Log Dropout Record</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="text-xs font-bold text-pink-400 uppercase tracking-wider">Manual Entry</div>
                {[{ label: "Student Name", key: "studentName", type: "text" }, { label: "School", key: "school", type: "text" }, { label: "Block", key: "block", type: "text" }, { label: "Date", key: "date", type: "date" }].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] text-slate-400 mb-1 font-semibold">{f.label}</label>
                    <input type={f.type} required value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500" />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Reason</label>
                  <select value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500">
                    {["Economic", "Migration", "Marriage", "Child Labor", "Health", "Other"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs">Log Record</button>
              </form>
              <div className="border-l border-slate-800 pl-6 flex flex-col justify-center">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Excel Import</div>
                <div onClick={simulateExcel} className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-900/40 rounded-2xl p-6 text-center cursor-pointer min-h-[160px] flex flex-col items-center justify-center space-y-3">
                  {isUploading ? (<><div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" /><span className="text-[10px] text-slate-400">Parsing...</span></>) : (<><span className="text-3xl">📋</span><span className="text-xs font-bold text-white">Import Dropout Register</span><span className="text-[9px] text-slate-500">dropout_register.xlsx</span></>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
