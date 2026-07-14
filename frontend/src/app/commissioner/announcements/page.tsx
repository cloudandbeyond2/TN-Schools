"use client";
import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";

interface Announcement {
  id: string | number;
  title: string;
  body: string;
  target: string;
  date: string;
  priority: string;
}

export default function CommissionerAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", body: "", target: "All Districts", date: "", priority: "Medium" });
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${API_URL}/api/commissioner/announcements`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setAnnouncements(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [API_URL]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prepend to local state
    setAnnouncements(p => [{ ...form, id: p.length + 1 }, ...p]);
    setIsModalOpen(false);
    setToast(`📢 Announcement '${form.title}' broadcast to ${form.target}.`);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <PortalLayout title="Announcements" subtitle="Commissioner · State Operations" avatarLetter="C" avatarColor="#06b6d4" themeClass="theme-commissioner" accentColor="#06b6d4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Announcements", value: loading ? "..." : announcements.length.toString(), icon: "📢", color: "text-cyan-400" },
          { label: "High Priority", value: loading ? "..." : announcements.filter(a => a.priority === "High" || a.priority === "HIGH").length.toString(), icon: "🔴", color: "text-red-400" },
          { label: "Target: All Districts", value: loading ? "..." : announcements.filter(a => a.target === "All Districts").length.toString(), icon: "🗺️", color: "text-violet-400" },
          { label: "This Month", value: loading ? "..." : announcements.filter(a => a.date && (a.date.startsWith("2024-11") || a.date.includes("Nov"))).length.toString(), icon: "📅", color: "text-emerald-400" },
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
          <h2 className="text-base font-semibold text-white">📢 Commissioner's Announcements</h2>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl">+ Issue Announcement</button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin mb-3" />
            <span className="text-xs text-slate-500">Loading announcements...</span>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-700 rounded-xl">
            <span className="text-3xl block mb-2">📢</span>
            <p className="text-sm text-slate-400 font-medium">No announcements published yet.</p>
            <p className="text-xs text-slate-650 mt-1">Announcements created by the Commissioner will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map(a => (
              <div key={a.id} className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`badge text-[9px] ${a.priority === "High" || a.priority === "HIGH" ? "badge-red" : "badge-yellow"}`}>{a.priority}</span>
                    <span className="badge badge-blue text-[9px]">{a.target}</span>
                    <span className="text-[10px] text-slate-500">{a.date}</span>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{a.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl p-6 space-y-5" style={{ background: "#090d16", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 20px 50px rgba(0,0,0,0.95)" }}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">📢 Issue New Announcement</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Announcement Title</label>
                <input type="text" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Body / Details</label>
                <textarea rows={3} required value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Target</label>
                  <select value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                    {["All Districts", "All Schools", "All Teachers", "Selected Districts", "DEO Offices"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                    {["High", "Medium", "Low"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Date</label>
                  <input type="date" required value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500" />
                </div>
              </div>
              <button type="submit" className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs mt-2">Broadcast Announcement</button>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
