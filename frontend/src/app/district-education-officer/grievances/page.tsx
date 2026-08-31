"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";

interface Grievance {
  id: string;
  petitioner: string;
  school: string;
  block: string;
  category: string;
  filed: string;
  status: string;
  ministerAction?: string;
  escalation?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const parsePetitioner = (str: string) => {
  const match = str.match(/^(.*?)\s*\((.*?),\s*(.*?)\)$/);
  if (match) {
    return { name: match[1], school: match[2], block: match[3] };
  }
  return { name: str, school: "District School", block: "District Block" };
};

export default function DEOGrievancesPage() {
  const { data: session } = useSession();
  const district = (session?.user as any)?.district || "Coimbatore";

  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({ petitioner: "", school: "", block: "", category: "Scholarship Delay", filed: "", status: "Pending" });

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/deo/grievances?district=${encodeURIComponent(district)}`);
      const json = await res.json();
      if (json.success && json.data) {
        const formatted = json.data.map((g: any) => {
          const parsed = parsePetitioner(g.petitioner);
          return {
            id: g.id,
            petitioner: parsed.name,
            school: parsed.school,
            block: parsed.block,
            category: g.category,
            filed: g.filed,
            status: g.status,
            ministerAction: g.ministerAction || "No extra details recorded.",
            escalation: g.escalation || "Medium"
          };
        });
        setGrievances(formatted);
      }
    } catch (e) {
      console.error("Error loading grievances:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, [session, district]);

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/deo/grievances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Resolved" })
      });
      setGrievances(p => p.map(g => g.id === id ? { ...g, status: "Resolved" } : g));
      if (selectedGrievance?.id === id) {
        setSelectedGrievance(prev => prev ? { ...prev, status: "Resolved" } : null);
      }
      setToast("✅ Grievance marked as resolved.");
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dbPetitioner = `${form.petitioner} (${form.school || "District School"}, ${form.block || "District Block"})`;
      const res = await fetch(`${API_URL}/api/deo/grievances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petitioner: dbPetitioner,
          district,
          category: form.category,
          filed: form.filed || new Date().toISOString().split("T")[0],
          status: "Pending"
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        const parsed = parsePetitioner(json.data.petitioner);
        const newGrievance = {
          id: json.data.id,
          petitioner: parsed.name,
          school: parsed.school,
          block: parsed.block,
          category: json.data.category,
          filed: json.data.filed,
          status: json.data.status,
          ministerAction: json.data.ministerAction || "No extra details recorded.",
          escalation: json.data.escalation || "Medium"
        };
        setGrievances(p => [newGrievance, ...p]);
        setIsModalOpen(false);
        setToast(`⚖️ Grievance from '${form.petitioner}' logged for review.`);
        setTimeout(() => setToast(null), 4000);
      }
    } catch (err) {
      console.error("Error creating grievance:", err);
    }
  };

  const simulateExcel = () => {
    setIsUploading(true);
    setTimeout(async () => {
      try {
        const mockUpload = {
          petitioner: "Mr. Arjun V. (Parent)",
          school: "GHS Singanallur",
          block: "CBE North",
          category: "Mid-Day Meal Complaint",
          filed: "2024-11-08",
          status: "Pending"
        };
        const dbPetitioner = `${mockUpload.petitioner} (${mockUpload.school}, ${mockUpload.block})`;
        const res = await fetch(`${API_URL}/api/deo/grievances`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            petitioner: dbPetitioner,
            district,
            category: mockUpload.category,
            filed: mockUpload.filed,
            status: mockUpload.status
          })
        });
        const json = await res.json();
        if (json.success && json.data) {
          const parsed = parsePetitioner(json.data.petitioner);
          const newGrievance = {
            id: json.data.id,
            petitioner: parsed.name,
            school: parsed.school,
            block: parsed.block,
            category: json.data.category,
            filed: json.data.filed,
            status: json.data.status,
            ministerAction: json.data.ministerAction || "Imported record",
            escalation: "Medium"
          };
          setGrievances(p => [newGrievance, ...p]);
          setToast("📊 Grievance register imported! 1 new record added.");
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
    <PortalLayout title="Grievances" subtitle={`DEO Officer · ${district} District`} avatarLetter="D" avatarColor="#ec4899" themeClass="theme-deo" accentColor="#ec4899">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Grievances", value: grievances.length.toString(), icon: "⚖️", color: "text-pink-400" },
          { label: "Resolved", value: grievances.filter(g => g.status === "Resolved").length.toString(), icon: "✅", color: "text-emerald-400" },
          { label: "Pending", value: grievances.filter(g => g.status === "Pending" || g.status === "Intervention Pending").length.toString(), icon: "⏳", color: "text-red-400" },
          { label: "Under Review", value: grievances.filter(g => g.status === "Under Review" || g.status === "Counselled").length.toString(), icon: "🔍", color: "text-amber-400" },
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
          <h2 className="text-base font-semibold text-white">⚖️ District Grievance Register</h2>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl">+ File Grievance</button>
        </div>
        <table className="data-table">
          <thead><tr><th>Petitioner</th><th>School</th><th>Block</th><th>Category</th><th>Filed</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs text-slate-500">Loading grievances...</span>
                </td>
              </tr>
            ) : grievances.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-xs text-slate-500">
                  No grievances logged for this district.
                </td>
              </tr>
            ) : (
              grievances.map(g => (
                <tr key={g.id}>
                  <td className="font-bold text-white text-xs">{g.petitioner}</td>
                  <td className="text-xs text-slate-400">{g.school}</td>
                  <td className="text-xs">{g.block}</td>
                  <td className="text-xs text-pink-400">{g.category}</td>
                  <td className="text-xs text-slate-500">{g.filed}</td>
                  <td><span className={`badge ${g.status === "Resolved" ? "badge-green" : g.status === "Pending" || g.status === "Intervention Pending" ? "badge-red" : "badge-yellow"}`}>{g.status}</span></td>
                  <td className="space-x-2">
                    <button onClick={() => setSelectedGrievance(g)} className="text-xs text-pink-400 hover:text-pink-300 font-bold px-2 py-1 bg-pink-500/10 rounded-md">👁️ View</button>
                    {g.status !== "Resolved" && (
                      <button onClick={() => handleResolve(g.id)} className="text-xs text-emerald-400 hover:text-emerald-300 font-bold px-2 py-1 bg-emerald-500/10 rounded-md">Resolve</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Grievance Details Modal */}
      {selectedGrievance && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl p-6 space-y-5" style={{ background: "#090d16", border: "1px solid rgba(236,72,153,0.3)", boxShadow: "0 20px 60px rgba(0,0,0,0.95)" }}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚖️</span>
                <h3 style={{ color: "#ffffff" }} className="modal-title-white !text-white text-base font-black">Grievance Details</h3>
              </div>
              <button onClick={() => setSelectedGrievance(null)} className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg">✕ Close</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Petitioner / Ref</span>
                  <span className="text-white font-bold">{selectedGrievance.petitioner}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Category</span>
                  <span className="text-pink-400 font-bold">{selectedGrievance.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Date Filed</span>
                  <span className="text-slate-300">{selectedGrievance.filed}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Priority Level</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${selectedGrievance.escalation === "Critical" ? "bg-red-500 text-white" : "bg-amber-500 text-slate-950"}`}>
                    {selectedGrievance.escalation || "Critical"}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Full Incident Details & Description</span>
                <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  {selectedGrievance.ministerAction}
                </p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Status:</span>
                  <span className={`badge ${selectedGrievance.status === "Resolved" ? "badge-green" : "badge-red"}`}>{selectedGrievance.status}</span>
                </div>
                {selectedGrievance.status !== "Resolved" && (
                  <button onClick={() => handleResolve(selectedGrievance.id)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-md">
                    ✓ Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl p-6 space-y-6" style={{ background: "#090d16", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 20px 50px rgba(0,0,0,0.95)" }}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 style={{ color: "#ffffff" }} className="modal-title-white !text-white text-sm font-bold">⚖️ File New Grievance</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="text-xs font-bold text-pink-400 uppercase tracking-wider">Manual Entry</div>
                {[{ label: "Petitioner Name", key: "petitioner", type: "text" }, { label: "School", key: "school", type: "text" }, { label: "Block", key: "block", type: "text" }, { label: "Date Filed", key: "filed", type: "date" }].map(f => (
                  <div key={f.key}>
                    <label className="block text-[10px] text-slate-400 mb-1 font-semibold">{f.label}</label>
                    <input type={f.type} required value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500" />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500">
                    {["Scholarship Delay", "Transfer Issue", "Infrastructure Complaint", "Exam Results Issue", "Fee Irregularity", "Mid-Day Meal Complaint", "Teacher Misconduct", "Other"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs">File Grievance</button>
              </form>
              <div className="border-l border-slate-800 pl-6 flex flex-col justify-center">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Excel Import</div>
                <div onClick={simulateExcel} className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-900/40 rounded-2xl p-6 text-center cursor-pointer min-h-[160px] flex flex-col items-center justify-center space-y-3">
                  {isUploading ? (<><div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" /><span className="text-[10px] text-slate-400">Parsing...</span></>) : (<><span className="text-3xl">⚖️</span><span className="text-xs font-bold text-white">Import Grievance Register</span><span className="text-[9px] text-slate-500">grievances_district.xlsx</span></>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
