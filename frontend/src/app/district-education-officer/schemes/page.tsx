"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";

interface Scheme { id: string; name: string; target: string; allocated: string; utilized: string; blocks: number; status: string; }

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DEOSchemesPage() {
  const { data: session } = useSession();
  const district = (session?.user as any)?.district || "Coimbatore";

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({ name: "", target: "", allocated: "₹1.0 Cr", utilized: "₹0.5 Cr", blocks: "3", status: "Ongoing" });

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/deo/schemes`);
      const json = await res.json();
      if (json.success && json.data) {
        const formatted = json.data.map((s: any) => {
          let allocatedNum = parseFloat(s.budget.replace(/[^0-9.]/g, "")) || 1.0;
          let utilizedNum = allocatedNum * (s.progress || 100) / 100;
          return {
            id: s.id,
            name: s.name,
            target: s.beneficiaries || "Eligible Students",
            allocated: s.budget,
            utilized: `₹${utilizedNum.toFixed(1)} Cr`,
            blocks: 5,
            status: s.status
          };
        });
        setSchemes(formatted);
      }
    } catch (e) {
      console.error("Error loading schemes:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [session]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSchemes(p => [...p, {
      id: `scheme-${Math.random()}`,
      name: form.name,
      target: form.target,
      allocated: form.allocated,
      utilized: form.utilized,
      blocks: Number(form.blocks),
      status: form.status
    }]);
    setIsModalOpen(false);
    setToast(`📜 Scheme '${form.name}' added to district tracker.`);
    setTimeout(() => setToast(null), 4000);
  };

  const simulateExcel = () => {
    setIsUploading(true);
    setTimeout(() => {
      setSchemes(p => [
        ...p,
        { id: `scheme-${Math.random()}`, name: "Library Book Grant", target: "93 schools", allocated: "₹0.8 Cr", utilized: "₹0.6 Cr", blocks: 5, status: "Active" },
      ]);
      setIsUploading(false);
      setIsModalOpen(false);
      setToast("📊 Schemes spreadsheet imported! 1 new scheme added.");
      setTimeout(() => setToast(null), 4000);
    }, 1500);
  };

  const totalAllocatedVal = schemes.reduce((sum, s) => sum + (parseFloat(s.allocated.replace(/[^0-9.]/g, "")) || 0), 0);
  const totalUtilizedVal = schemes.reduce((sum, s) => sum + (parseFloat(s.utilized.replace(/[^0-9.]/g, "")) || 0), 0);
  const utilizationRate = totalAllocatedVal > 0 ? Math.round((totalUtilizedVal / totalAllocatedVal) * 100) : 90;

  return (
    <PortalLayout title="Schemes Tracking" subtitle={`DEO Officer · ${district} District`} avatarLetter="D" avatarColor="#ec4899" themeClass="theme-deo" accentColor="#ec4899">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Schemes", value: schemes.filter(s => s.status === "Active" || s.status === "Ongoing").length.toString(), icon: "📜", color: "text-pink-400" },
          { label: "Total Allocated", value: `₹${totalAllocatedVal.toFixed(1)} Cr`, icon: "💰", color: "text-emerald-400" },
          { label: "Total Utilized", value: `₹${totalUtilizedVal.toFixed(1)} Cr`, icon: "✅", color: "text-amber-400" },
          { label: "Utilization Rate", value: `${utilizationRate}%`, icon: "📊", color: "text-cyan-400" },
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
          <h2 className="text-base font-semibold text-white">📜 District Schemes Tracker</h2>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl">+ Add Scheme</button>
        </div>
        <table className="data-table">
          <thead><tr><th>Scheme</th><th>Target</th><th>Allocated</th><th>Utilized</th><th>Blocks</th><th>Status</th></tr></thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs text-slate-500">Loading schemes...</span>
                </td>
              </tr>
            ) : schemes.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-xs text-slate-500">
                  No welfare schemes registered in this district.
                </td>
              </tr>
            ) : (
              schemes.map(s => (
                <tr key={s.id}>
                  <td className="font-bold text-white text-xs">{s.name}</td>
                  <td className="text-xs text-slate-400">{s.target}</td>
                  <td className="text-emerald-400 font-bold text-xs">{s.allocated}</td>
                  <td className="text-amber-400 text-xs">{s.utilized}</td>
                  <td className="text-xs">{s.blocks} blocks</td>
                  <td><span className={`badge ${s.status === "Active" ? "badge-green" : "badge-blue"}`}>{s.status}</span></td>
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
              <h3 className="text-sm font-bold text-white">📜 Add District Scheme</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="text-xs font-bold text-pink-400 uppercase tracking-wider">Manual Entry</div>
                {[{ label: "Scheme Name", key: "name", type: "text" }, { label: "Target Group", key: "target", type: "text" }, { label: "Allocated Budget", key: "allocated", type: "text" }, { label: "Utilized Budget", key: "utilized", type: "text" }, { label: "No. of Blocks", key: "blocks", type: "number" }].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] text-slate-400 mb-1 font-semibold">{f.label}</label>
                    <input type={f.type} required value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500" />
                  </div>
                ))}
                <button type="submit" className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs">Add Scheme</button>
              </form>
              <div className="border-l border-slate-800 pl-6 flex flex-col justify-center">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Excel Import</div>
                <div onClick={simulateExcel} className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-900/40 rounded-2xl p-6 text-center cursor-pointer min-h-[160px] flex flex-col items-center justify-center space-y-3">
                  {isUploading ? (<><div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" /><span className="text-[10px] text-slate-400">Parsing...</span></>) : (<><span className="text-3xl">📜</span><span className="text-xs font-bold text-white">Import Schemes Data</span><span className="text-[9px] text-slate-500">district_schemes.xlsx</span></>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
