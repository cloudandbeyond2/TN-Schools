"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";

interface ScholarshipRecord { id: string; studentName: string; school: string; block: string; scheme: string; amount: string; status: string; }

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ScholarshipTrackingPage() {
  const { data: session } = useSession();
  const district = (session?.user as any)?.district || "Coimbatore";

  const [records, setRecords] = useState<ScholarshipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({ studentName: "", school: "", block: "", scheme: "SC/ST Pre-Matric", amount: "₹6,000", status: "Pending" });

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/deo/scholarships?district=${encodeURIComponent(district)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setRecords(json.data);
      }
    } catch (e) {
      console.error("Error loading scholarships:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, [session, district]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecords(p => [{
      id: `schol-${Math.random()}`,
      studentName: form.studentName,
      school: form.school,
      block: form.block,
      scheme: form.scheme,
      amount: form.amount,
      status: form.status
    }, ...p]);
    setIsModalOpen(false);
    setToast(`🎓 Scholarship record for '${form.studentName}' added to district tracker.`);
    setTimeout(() => setToast(null), 4000);
  };

  const simulateExcel = () => {
    setIsUploading(true);
    setTimeout(() => {
      setRecords(p => [
        { id: `schol-${Math.random()}`, studentName: "Divya K.", school: "GHSS Ganapathy", block: "CBE South", scheme: "OBC Post-Matric", amount: "₹12,000", status: "Pending" },
        { id: `schol-${Math.random()}`, studentName: "Siva T.", school: "GHS RS Puram", block: "CBE South", scheme: "Merit Scholarship", amount: "₹15,000", status: "Disbursed" },
        ...p
      ]);
      setIsUploading(false);
      setIsModalOpen(false);
      setToast("📊 Scholarship data imported! 2 new records added.");
      setTimeout(() => setToast(null), 4000);
    }, 1500);
  };

  return (
    <PortalLayout title="Scholarship Tracking" subtitle={`DEO Officer · ${district} District`} avatarLetter="D" avatarColor="#ec4899" themeClass="theme-deo" accentColor="#ec4899">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Scholarships", value: records.length.toString(), icon: "🎓", color: "text-pink-400" },
          { label: "Disbursed", value: records.filter(r => r.status === "Disbursed" || r.status === "Re-enrolled").length.toString(), icon: "✅", color: "text-emerald-400" },
          { label: "Pending", value: records.filter(r => r.status === "Pending" || r.status === "Intervention Pending").length.toString(), icon: "⏳", color: "text-amber-400" },
          { label: "Under Review", value: records.filter(r => r.status === "Under Review" || r.status === "Counselled").length.toString(), icon: "🔍", color: "text-blue-400" },
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
          <h2 className="text-base font-semibold text-white">🎓 District Scholarship Register</h2>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl">+ Add Record</button>
        </div>
        <table className="data-table">
          <thead><tr><th>Student</th><th>School</th><th>Block</th><th>Scheme</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs text-slate-500">Loading scholarships...</span>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-xs text-slate-500">
                  No scholarship transactions registered in this district.
                </td>
              </tr>
            ) : (
              records.map(r => (
                <tr key={r.id}>
                  <td className="font-bold text-white text-xs">{r.studentName}</td>
                  <td className="text-xs text-slate-400">{r.school}</td>
                  <td className="text-xs">{r.block}</td>
                  <td className="text-xs text-pink-400">{r.scheme}</td>
                  <td className="text-emerald-400 font-bold text-xs">{r.amount}</td>
                  <td><span className={`badge ${r.status === "Disbursed" || r.status === "Re-enrolled" ? "badge-green" : r.status === "Pending" || r.status === "Intervention Pending" ? "badge-yellow" : "badge-blue"}`}>{r.status}</span></td>
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
              <h3 className="text-sm font-bold text-white">🎓 Add Scholarship Record</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="text-xs font-bold text-pink-400 uppercase tracking-wider">Manual Entry</div>
                {[{ label: "Student Name", key: "studentName", type: "text" }, { label: "School", key: "school", type: "text" }, { label: "Block", key: "block", type: "text" }].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] text-slate-400 mb-1 font-semibold">{f.label}</label>
                    <input type={f.type} required value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500" />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Scheme</label>
                  <select value={form.scheme} onChange={e => setForm(p => ({ ...p, scheme: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500">
                    {["SC/ST Pre-Matric", "OBC Post-Matric", "Merit Scholarship", "First Generation", "Sports Scholarship"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs">Add Record</button>
              </form>
              <div className="border-l border-slate-800 pl-6 flex flex-col justify-center">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Excel Import</div>
                <div onClick={simulateExcel} className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-900/40 rounded-2xl p-6 text-center cursor-pointer min-h-[160px] flex flex-col items-center justify-center space-y-3">
                  {isUploading ? (<><div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" /><span className="text-[10px] text-slate-400">Parsing...</span></>) : (<><span className="text-3xl">🎓</span><span className="text-xs font-bold text-white">Import Scholarship List</span><span className="text-[9px] text-slate-500">scholarship_district.xlsx</span></>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
