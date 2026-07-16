"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";

interface InfraItem { id: string; school: string; block: string; type: string; status: string; priority: string; budget: string; year: string; }

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DEOInfrastructurePage() {
  const { data: session } = useSession();
  const district = (session?.user as any)?.district || "Coimbatore";

  const [items, setItems] = useState<InfraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({ school: "", block: "", type: "", status: "Planned", priority: "Medium", budget: "₹5L", year: "2025" });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/deo/infrastructure?district=${encodeURIComponent(district)}`);
      const json = await res.json();
      if (json.success && json.data) {
        const formatted = json.data.map((p: any) => ({
          id: p.id,
          school: p.name,
          block: p.block || "Coimbatore Block",
          type: p.type,
          status: p.status,
          priority: p.priority || "Medium",
          budget: p.budget,
          year: p.deadline
        }));
        setItems(formatted);
      }
    } catch (e) {
      console.error("Error loading infrastructure projects:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [session, district]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/deo/infrastructure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, district })
      });
      const json = await res.json();
      if (json.success && json.data) {
        const newProj = {
          id: json.data.id,
          school: json.data.name,
          block: json.data.block || form.block || "Coimbatore Block",
          type: json.data.type,
          status: json.data.status,
          priority: json.data.priority || form.priority,
          budget: json.data.budget,
          year: json.data.deadline
        };
        setItems(p => [newProj, ...p]);
        setIsModalOpen(false);
        setToast(`🏗️ Infrastructure project for '${form.school}' logged successfully.`);
        setTimeout(() => setToast(null), 4000);
      }
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  const simulateExcel = () => {
    setIsUploading(true);
    setTimeout(async () => {
      try {
        const mockUpload = {
          school: "GHS Vadavalli",
          block: "CBE South",
          type: "Lab Renovation",
          status: "Tendered",
          priority: "Medium",
          budget: "₹7L",
          deadline: "2025"
        };
        const res = await fetch(`${API_URL}/api/deo/infrastructure`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...mockUpload, district })
        });
        const json = await res.json();
        if (json.success && json.data) {
          const newProj = {
            id: json.data.id,
            school: json.data.name,
            block: json.data.block || mockUpload.block,
            type: json.data.type,
            status: json.data.status,
            priority: json.data.priority || mockUpload.priority,
            budget: json.data.budget,
            year: json.data.deadline
          };
          setItems(p => [newProj, ...p]);
          setToast("📊 Infrastructure project list imported! 1 new project added.");
          setTimeout(() => setToast(null), 4000);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsUploading(false);
        setIsModalOpen(false);
      }
    }, 1500);
  };

  return (
    <PortalLayout title="Infrastructure" subtitle={`DEO Officer · ${district} District`} avatarLetter="D" avatarColor="#ec4899" themeClass="theme-deo" accentColor="#ec4899">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Projects", value: items.length.toString(), icon: "🏗️", color: "text-pink-400" },
          { label: "Completed", value: items.filter(i => i.status === "Completed").length.toString(), icon: "✅", color: "text-emerald-400" },
          { label: "In Progress", value: items.filter(i => i.status === "In Progress").length.toString(), icon: "🔨", color: "text-amber-400" },
          { label: "High Priority", value: items.filter(i => i.priority === "High").length.toString(), icon: "⚠️", color: "text-red-400" },
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
          <h2 className="text-base font-semibold text-white">🏗️ District Infrastructure Projects</h2>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl">+ Log Project</button>
        </div>
        <table className="data-table">
          <thead><tr><th>School</th><th>Block</th><th>Project Type</th><th>Budget</th><th>Priority</th><th>Status</th></tr></thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs text-slate-500">Loading projects...</span>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-xs text-slate-500">
                  No infrastructure projects logged for this district.
                </td>
              </tr>
            ) : (
              items.map(i => (
                <tr key={i.id}>
                  <td className="font-bold text-white text-xs">{i.school}</td>
                  <td className="text-xs text-slate-400">{i.block}</td>
                  <td className="text-xs text-pink-400">{i.type}</td>
                  <td className="text-emerald-400 font-bold text-xs">{i.budget}</td>
                  <td><span className={`badge ${i.priority === "High" ? "badge-red" : i.priority === "Medium" ? "badge-yellow" : "badge-green"}`}>{i.priority}</span></td>
                  <td><span className={`badge ${i.status === "Completed" ? "badge-green" : i.status === "In Progress" ? "badge-blue" : i.status === "Tendered" ? "badge-yellow" : "badge-red"}`}>{i.status}</span></td>
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
              <h3 className="text-sm font-bold text-white">🏗️ Log Infrastructure Project</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="text-xs font-bold text-pink-400 uppercase tracking-wider">Manual Entry</div>
                {[{ label: "School Name", key: "school", type: "text" }, { label: "Block", key: "block", type: "text" }, { label: "Project Type", key: "type", type: "text" }, { label: "Budget", key: "budget", type: "text" }, { label: "Year", key: "year", type: "text" }].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] text-slate-400 mb-1 font-semibold">{f.label}</label>
                    <input type={f.type} required value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500" />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500">
                    {["High", "Medium", "Low"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs">Log Project</button>
              </form>
              <div className="border-l border-slate-800 pl-6 flex flex-col justify-center">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Excel Import</div>
                <div onClick={simulateExcel} className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-900/40 rounded-2xl p-6 text-center cursor-pointer min-h-[160px] flex flex-col items-center justify-center space-y-3">
                  {isUploading ? (<><div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" /><span className="text-[10px] text-slate-400">Parsing...</span></>) : (<><span className="text-3xl">🏗️</span><span className="text-xs font-bold text-white">Import Projects Data</span><span className="text-[9px] text-slate-500">infrastructure_district.xlsx</span></>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
