"use client";
import { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { apiFetch } from "@/lib/api";

type Priority = "info" | "warning" | "critical";
type TargetPortal = "All" | "Student" | "Teacher" | "Parent" | "Headmaster" | "BEO" | "DEO" | "Commissioner" | "Minister";

interface Announcement {
  id: string | number;
  title: string;
  body: string;
  priority: Priority;
  target: TargetPortal;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  status: "active" | "scheduled" | "expired";
  views: number;
}

const PORTALS: TargetPortal[] = ["All","Student","Teacher","Parent","Headmaster","BEO","DEO","Commissioner","Minister"];

const priorityStyles: Record<Priority, { color:string; badge:string; icon:React.ReactNode; border:string }> = {
  info:     { color:"text-blue-400", badge:"bg-blue-500/10 border-blue-500/30 text-blue-400", icon:<i className="fi fi-rr-info text-blue-400"></i>, border:"border-blue-500/20" },
  warning:  { color:"text-amber-400", badge:"bg-amber-500/10 border-amber-500/30 text-amber-400", icon:<i className="fi fi-rr-triangle-warning text-amber-400"></i>, border:"border-amber-500/20" },
  critical: { color:"text-red-400", badge:"bg-red-500/10 border-red-500/30 text-red-400", icon:<i className="fi fi-rr-exclamation text-red-400"></i>, border:"border-red-500/20" },
};

const statusColors: Record<Announcement["status"], string> = {
  active:"text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  scheduled:"text-blue-400 bg-blue-500/10 border-blue-500/30",
  expired:"text-slate-500 bg-slate-800 border-slate-700",
};

const initialAnnouncements: Announcement[] = [];

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [filterPriority, setFilterPriority] = useState<"All" | Priority>("All");
  const [filterTarget, setFilterTarget] = useState<"All" | TargetPortal>("All");
  const [filterStatus, setFilterStatus] = useState<"All" | Announcement["status"]>("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title:"", body:"", priority:"info" as Priority, target:"All" as TargetPortal, expiresAt:"" });
  const [preview, setPreview] = useState<Announcement | null>(null);

  const fetchAnnouncements = async () => {
    try {
      const res = await apiFetch("/api/announcements");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAnnouncements(json.data);
      }
    } catch (e) {
      console.warn("Could not fetch announcements from API", e);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const filtered = announcements.filter((a) => {
    const matchP = filterPriority === "All" || a.priority === filterPriority;
    const matchT = filterTarget === "All" || a.target === filterTarget || a.target === "All";
    const matchS = filterStatus === "All" || a.status === filterStatus;
    return matchP && matchT && matchS;
  });

  const publish = async () => {
    if (!form.title || !form.body) return;
    try {
      const res = await apiFetch("/api/announcements", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setAnnouncements((prev) => [json.data, ...prev]);
      } else {
        setAnnouncements((prev) => [{
          id: Date.now(), ...form, createdBy:"Super Admin",
          createdAt: new Date().toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }),
          status:"active", views:0,
        }, ...prev]);
      }
    } catch {
      setAnnouncements((prev) => [{
        id: Date.now(), ...form, createdBy:"Super Admin",
        createdAt: new Date().toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }),
        status:"active", views:0,
      }, ...prev]);
    }
    setShowModal(false);
    setForm({ title:"", body:"", priority:"info", target:"All", expiresAt:"" });
  };

  const expire = async (id: number | string) => {
    setAnnouncements((prev) => prev.map((a) => a.id === id ? { ...a, status:"expired" as const } : a));
    try {
      await apiFetch(`/api/announcements/${id}/expire`, { method: "PUT" });
    } catch {}
  };

  const deleteAnn = async (id: number | string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    try {
      await apiFetch(`/api/announcements/${id}`, { method: "DELETE" });
    } catch {}
  };

  const active = announcements.filter((a) => a.status === "active").length;
  const totalViews = announcements.reduce((a, b) => a + b.views, 0);

  return (
    <PortalLayout>
      {/* Header Banner */}
      <div className="mb-6 p-4 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-lg font-bold text-white"><i className="fi fi-rr-megaphone text-amber-400 mr-2"></i>System Announcements</h1>
          <p className="text-xs text-slate-400 mt-1">Broadcast important notices to specific portals or all users across Tamil Nadu</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowModal(true)} className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-md">
            <i className="fi fi-rr-megaphone"></i> Publish Announcement
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label:"Active", value:active, icon:<i className="fi fi-rr-check-circle text-emerald-400 text-xl"></i>, color:"text-emerald-400" },
          { label:"Scheduled", value:announcements.filter((a) => a.status==="scheduled").length, icon:<i className="fi fi-rr-clock text-blue-400 text-xl"></i>, color:"text-blue-400" },
          { label:"Total Views", value:`${(totalViews/1000).toFixed(0)}K`, icon:<i className="fi fi-rr-eye text-amber-400 text-xl"></i>, color:"text-amber-400" },
          { label:"Total Sent", value:announcements.length, icon:<i className="fi fi-rr-paper-plane text-violet-400 text-xl"></i>, color:"text-violet-400" },
        ].map((k) => (
          <div key={k.label} className="glass rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-3">
              <span>{k.icon}</span>
              <div>
                <div className={`text-xl font-extrabold ${k.color}`}>{k.value}</div>
                <div className="text-[10px] text-slate-500 font-semibold">{k.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="flex gap-2">
          {(["All","info","warning","critical"] as const).map((p) => (
            <button key={p} onClick={() => setFilterPriority(p)}
              className={`text-[10px] font-bold px-3 py-1 rounded-full transition capitalize border flex items-center gap-1 ${
                filterPriority === p
                  ? p === "All" ? "bg-slate-600 text-white border-slate-500" : priorityStyles[p as Priority].badge
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
              }`}>
              {p === "All" ? "All Priority" : <>{priorityStyles[p as Priority].icon} <span className="capitalize">{p}</span></>}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(["All","active","scheduled","expired"] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`text-[10px] font-bold px-3 py-1 rounded-full transition capitalize border ${
                filterStatus === s ? "bg-amber-500 text-slate-900 border-amber-500" : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
              }`}>{s}</button>
          ))}
        </div>
        <select value={filterTarget} onChange={(e) => setFilterTarget(e.target.value as any)}
          className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-1 focus:outline-none focus:border-amber-500">
          {PORTALS.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-slate-500 border border-slate-800">
            <i className="fi fi-rr-megaphone text-3xl text-slate-600 block mb-2"></i>
            <div className="text-xs font-semibold text-slate-400">No announcements found</div>
            <div className="text-[10px] text-slate-500 mt-1">Click &quot;Publish Announcement&quot; above to create a new announcement.</div>
          </div>
        ) : (
          filtered.map((a) => {
            const ps = priorityStyles[a.priority];
            return (
              <div key={a.id} className={`glass rounded-2xl p-5 border ${ps.border} transition-all hover:border-opacity-50 ${a.status === "expired" ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{ps.icon}</span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{a.title}</h3>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${ps.badge}`}>{a.priority.toUpperCase()}</span>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">→ {a.target}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusColors[a.status]}`}>{a.status.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[9px] text-slate-500">{a.createdAt}</div>
                    <div className="text-[9px] text-slate-600">by {a.createdBy}</div>
                    <div className="text-[9px] text-amber-400 mt-1 flex items-center justify-end gap-1"><i className="fi fi-rr-eye"></i> {a.views.toLocaleString()}</div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 ml-8 mb-3">{a.body}</p>
                <div className="flex gap-2 ml-8">
                  <button onClick={() => setPreview(a)} className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-lg hover:bg-blue-500/20 transition flex items-center gap-1"><i className="fi fi-rr-eye"></i> Preview</button>
                  {a.status !== "expired" && <button onClick={() => expire(a.id)} className="text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1 rounded-lg hover:text-white transition flex items-center gap-1"><i className="fi fi-rr-clock"></i> Expire Now</button>}
                  <button onClick={() => deleteAnn(a.id)} className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-lg hover:bg-red-500/20 transition flex items-center gap-1"><i className="fi fi-rr-trash"></i> Delete</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Publish Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <i className="fi fi-rr-megaphone text-amber-400"></i> Publish New Announcement
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Title</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Announcement title"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Message Body</label>
                <textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} placeholder="Full announcement text..." rows={4}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2 py-2 focus:outline-none focus:border-amber-500">
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Target Portal</label>
                  <select value={form.target} onChange={(e) => setForm((f) => ({ ...f, target: e.target.value as TargetPortal }))}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2 py-2 focus:outline-none focus:border-amber-500">
                    {PORTALS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Expires</label>
                  <input type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2 py-2 focus:outline-none focus:border-amber-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 text-xs font-bold text-slate-400 bg-slate-800 py-2 rounded-lg border border-slate-700">Cancel</button>
              <button onClick={publish} className="flex-1 text-xs font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 py-2 rounded-lg transition flex items-center justify-center gap-1.5">
                <i className="fi fi-rr-megaphone"></i> Publish Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className={`bg-slate-900 border ${priorityStyles[preview.priority].border} rounded-2xl p-6 w-full max-w-sm shadow-2xl`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{priorityStyles[preview.priority].icon}</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${priorityStyles[preview.priority].badge}`}>{preview.priority.toUpperCase()}</span>
              <span className="text-[9px] text-slate-500">→ {preview.target}</span>
            </div>
            <h3 className="text-sm font-bold text-white mb-2">{preview.title}</h3>
            <p className="text-xs text-slate-400 mb-4">{preview.body}</p>
            <div className="text-[10px] text-slate-600">Published: {preview.createdAt} · Expires: {preview.expiresAt || "—"}</div>
            <button onClick={() => setPreview(null)} className="mt-4 w-full text-xs font-bold text-slate-400 bg-slate-800 py-2 rounded-lg border border-slate-700">Close Preview</button>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
