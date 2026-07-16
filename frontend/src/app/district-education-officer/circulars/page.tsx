"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";

interface Circular { id: string; title: string; issuedBy: string; date: string; priority: string; category: string; acknowledged: number; total: number; }

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DEOCircularsPage() {
  const { data: session } = useSession();
  const district = (session?.user as any)?.district || "Coimbatore";

  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({ title: "", issuedBy: "", date: "", priority: "Medium", category: "General" });

  const fetchCirculars = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/deo/circulars`);
      const json = await res.json();
      if (json.success && json.data) {
        const formatted = json.data.map((c: any) => {
          const parts = c.body.split(" | details: ");
          const issuedBy = parts[0] || "DEO Office";
          
          let acknowledged = 45;
          let total = 93;
          if (c.readReceipts) {
            const matches = c.readReceipts.match(/(\d+)\/(\d+)\s+read/);
            if (matches) {
              acknowledged = parseInt(matches[1]);
              total = parseInt(matches[2]);
            }
          }

          return {
            id: c.id,
            title: c.title,
            issuedBy,
            date: c.date || "Today",
            priority: c.pinned ? "High" : "Medium",
            category: c.target || "General",
            acknowledged,
            total
          };
        });
        setCirculars(formatted);
      }
    } catch (e) {
      console.error("Error loading circulars:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCirculars();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bodyText = `${form.issuedBy || "DEO Office"} | details: Circular announcement detail`;
      const res = await fetch(`${API_URL}/api/deo/circulars`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          body: bodyText,
          target: form.category,
          date: form.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        const newCircular = {
          id: json.data.id,
          title: json.data.title,
          issuedBy: form.issuedBy || "DEO Office",
          date: json.data.date,
          priority: "Medium",
          category: json.data.target,
          acknowledged: 0,
          total: 93
        };
        setCirculars(p => [newCircular, ...p]);
        setIsModalOpen(false);
        setToast(`📢 Circular '${form.title}' issued to all 93 schools.`);
        setTimeout(() => setToast(null), 4000);
      }
    } catch (err) {
      console.error("Error issuing circular:", err);
    }
  };

  const simulateExcel = () => {
    setIsUploading(true);
    setTimeout(async () => {
      try {
        const mockUpload = {
          title: "New Health Policy 2025",
          issuedBy: "Health Dept.",
          category: "Health",
          date: "2024-11-10"
        };
        const bodyText = `${mockUpload.issuedBy} | details: Excel imported announcement`;
        const res = await fetch(`${API_URL}/api/deo/circulars`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: mockUpload.title,
            body: bodyText,
            target: mockUpload.category,
            date: mockUpload.date
          })
        });
        const json = await res.json();
        if (json.success && json.data) {
          const newCircular = {
            id: json.data.id,
            title: json.data.title,
            issuedBy: mockUpload.issuedBy,
            date: json.data.date,
            priority: "Medium",
            category: json.data.target,
            acknowledged: 0,
            total: 93
          };
          setCirculars(p => [newCircular, ...p]);
          setToast("📊 Circular list imported! 1 new circular added.");
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
    <PortalLayout title="Circulars" subtitle={`DEO Officer · ${district} District`} avatarLetter="D" avatarColor="#ec4899" themeClass="theme-deo" accentColor="#ec4899">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Circulars", value: circulars.length.toString(), icon: "📢", color: "text-pink-400" },
          { label: "High Priority", value: circulars.filter(c => c.priority === "High").length.toString(), icon: "🔴", color: "text-red-400" },
          { label: "Full Acknowledgment", value: circulars.filter(c => c.acknowledged === c.total).length.toString(), icon: "✅", color: "text-emerald-400" },
          { label: "Pending Ack.", value: circulars.filter(c => c.acknowledged < c.total).length.toString(), icon: "⏳", color: "text-amber-400" },
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
          <h2 className="text-base font-semibold text-white">📢 District Circulars Board</h2>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl">+ Issue Circular</button>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mx-auto mb-2" />
              <span className="text-xs text-slate-500">Loading circulars...</span>
            </div>
          ) : circulars.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No circulars posted for this district.
            </div>
          ) : (
            circulars.map(c => (
              <div key={c.id} className="flex items-start justify-between p-4 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-pink-500/30 transition-all">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge text-[9px] ${c.priority === "High" ? "badge-red" : c.priority === "Medium" ? "badge-yellow" : "badge-green"}`}>{c.priority}</span>
                    <span className="badge badge-blue text-[9px]">{c.category}</span>
                    <span className="text-[10px] text-slate-500">{c.date}</span>
                  </div>
                  <div className="text-xs font-bold text-white mb-1">{c.title}</div>
                  <div className="text-[10px] text-slate-500">Issued by: {c.issuedBy}</div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-[10px] text-slate-400 mb-1">Acknowledged</div>
                  <div className={`text-sm font-bold ${c.acknowledged === c.total ? "text-emerald-400" : "text-amber-400"}`}>{c.acknowledged}/{c.total}</div>
                  <div className="h-1 bg-slate-800 rounded-full mt-1 w-16">
                    <div className="h-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${(c.acknowledged / c.total) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl p-6 space-y-6" style={{ background: "#090d16", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 20px 50px rgba(0,0,0,0.95)" }}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">📢 Issue New Circular</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="text-xs font-bold text-pink-400 uppercase tracking-wider">Manual Entry</div>
                {[{ label: "Circular Title", key: "title", type: "text" }, { label: "Issued By", key: "issuedBy", type: "text" }, { label: "Date", key: "date", type: "date" }].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] text-slate-400 mb-1 font-semibold">{f.label}</label>
                    <input type={f.type} required value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500" />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                    {["High", "Medium", "Low"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                    {["General", "Exam", "Finance", "Health", "Compliance", "Events", "Nutrition"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs">Issue Circular</button>
              </form>
              <div className="border-l border-slate-800 pl-6 flex flex-col justify-center">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Excel Import</div>
                <div onClick={simulateExcel} className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-900/40 rounded-2xl p-6 text-center cursor-pointer min-h-[160px] flex flex-col items-center justify-center space-y-3">
                  {isUploading ? (<><div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" /><span className="text-[10px] text-slate-400">Parsing...</span></>) : (<><span className="text-3xl">📢</span><span className="text-xs font-bold text-white">Import Circulars List</span><span className="text-[9px] text-slate-500">district_circulars.xlsx</span></>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
