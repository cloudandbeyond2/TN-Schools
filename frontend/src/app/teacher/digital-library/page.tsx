"use client";

import React, { useState, useEffect, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

interface LibraryResource {
  id: string;
  title: string;
  type: string;
  subject: string;
  class: string;
  size: string;
  uploadDate: string;
  downloads: number;
  views: number;
  description: string;
  tags: string[];
  isActive: boolean;
  fileUrl?: string;
  aiContent?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const typeIcon: Record<string, string> = { PDF: "📄", Video: "🎬", "E-Book": "📚", Worksheet: "📋", PPT: "📊", Audio: "🎵" };
const typeColor: Record<string, string> = {
  PDF: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  Video: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  "E-Book": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Worksheet: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  PPT: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  Audio: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
};
const subjectColor: Record<string, string> = {
  Physics: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Chemistry: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  Biology: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Mathematics: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  History: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Tamil: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  English: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
};

const emptyForm = { title: "", type: "PDF", subject: "Physics", class: "11", size: "N/A", description: "", tags: "", fileUrl: "", aiContent: "" };

export default function DigitalLibraryPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const teacherId = (session?.user as any)?.id;

  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterClass, setFilterClass] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Array<{ question: string; options: string[]; answerIndex: number }>>([]);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (schoolId) params.append("schoolId", schoolId);
      const res = await fetch(`${API}/api/digital-library?${params}`);
      const data = await res.json();
      if (data.success) setResources(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [schoolId]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const filtered = resources.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = r.title.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q) || (r.tags || []).some((t) => t.toLowerCase().includes(q));
    return matchSearch && (filterType === "All" || r.type === filterType) && (filterSubject === "All" || r.subject === filterSubject) && (filterClass === "All" || r.class === filterClass);
  });

  const handleOpenAdd = () => { 
    setForm(emptyForm); 
    setQuizQuestions([]);
    setEditId(null); 
    setShowModal(true); 
  };
  const handleOpenEdit = (r: LibraryResource) => {
    let loadedQuiz: any[] = [];
    if (r.aiContent) {
      try {
        const data = JSON.parse(r.aiContent);
        if (Array.isArray(data.quiz)) {
          loadedQuiz = data.quiz;
        }
      } catch (e) {}
    }
    setForm({ title: r.title, type: r.type, subject: r.subject, class: r.class, size: r.size, description: r.description || "", tags: (r.tags || []).join(", "), fileUrl: r.fileUrl || "", aiContent: r.aiContent || "" });
    setQuizQuestions(loadedQuiz);
    setEditId(r.id); 
    setShowModal(true);
  };

  const handleGenerateAi = async () => {
    if (!form.title) return Swal.fire({ icon: "warning", title: "Missing Title", text: "Please enter a resource title first." });
    setGeneratingAi(true);
    try {
      const res = await fetch(`${API}/api/ai/generate-resource-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, subject: form.subject, type: form.type, description: form.description }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setForm({ ...form, aiContent: data.data });
        Swal.fire({ icon: "success", title: "Generated!", text: "AI Study Notes generated successfully." });
      } else {
        throw new Error("Failed to generate content.");
      }
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to generate AI content." });
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleGenerateAiQuiz = async () => {
    if (!form.title) return Swal.fire({ icon: "warning", title: "Missing Title", text: "Please enter a resource title first." });
    setGeneratingQuiz(true);
    try {
      const res = await fetch(`${API}/api/ai/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: form.class,
          subject: form.subject,
          topic: form.title,
          difficulty: "Hard",
          mcqCount: 10,
          shortCount: 0,
          longCount: 0
        }),
      });
      const data = await res.json();
      if (data.success && data.data && Array.isArray(data.data)) {
        const letterMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
        const mappedQuestions = data.data
          .filter((q: any) => q.type === "mcq" && q.options)
          .map((q: any) => {
            const cleanAnswer = q.answer.trim().charAt(0).toUpperCase();
            return {
              question: q.text,
              options: q.options,
              answerIndex: letterMap[cleanAnswer] !== undefined ? letterMap[cleanAnswer] : 0
            };
          });

        if (mappedQuestions.length > 0) {
          setQuizQuestions(mappedQuestions);
          Swal.fire({ icon: "success", title: "Generated!", text: "Generated 10 hard multiple choice questions for your quiz." });
        } else {
          throw new Error("No MCQs returned");
        }
      } else {
        throw new Error("Failed to generate quiz.");
      }
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to generate AI Quiz." });
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.type || !form.subject || !form.class) {
      return Swal.fire({ icon: "error", title: "Oops...", text: "Title, Type, Subject and Class are required." });
    }
    setSaving(true);
    try {
      let explanation = "";
      if (form.aiContent) {
        try {
          const parsed = JSON.parse(form.aiContent);
          explanation = parsed.explanation || parsed.content || form.aiContent;
        } catch (e) {
          explanation = form.aiContent;
        }
      }
      const aiContentJson = JSON.stringify({
        explanation,
        keyNotes: [],
        quiz: quizQuestions
      });

      const body = { 
        ...form, 
        aiContent: aiContentJson,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean), 
        schoolId, 
        teacherId 
      };
      const url = editId ? `${API}/api/digital-library/${editId}` : `${API}/api/digital-library`;
      const res = await fetch(url, { method: editId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchResources();
        Swal.fire({
          icon: "success",
          title: editId ? "Resource Updated" : "Resource Uploaded",
          text: `"${form.title}" saved successfully to Digital Library!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({ icon: "error", title: "Error", text: data.error || "Failed to save" });
      }
    } catch (e) {
      Swal.fire({ icon: "error", title: "Network Error", text: "Something went wrong." });
    }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API}/api/digital-library/${id}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            fetchResources();
            Swal.fire("Deleted!", `"${title}" has been deleted from Digital Library.`, "success");
          } else {
            Swal.fire("Error!", data.error || "Failed to delete resource.", "error");
          }
        } catch (e) {
          Swal.fire("Error!", "Network error. Failed to delete.", "error");
        }
      }
    });
  };

  const totalDownloads = resources.reduce((a, r) => a + (r.downloads || 0), 0);
  const totalViews = resources.reduce((a, r) => a + (r.views || 0), 0);

  return (
    <PortalLayout title="Digital Library" subtitle="Upload, manage and share educational resources with students">

      {/* ── KPI Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Resources", value: resources.length, icon: "📚", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
          { label: "Total Downloads", value: totalDownloads, icon: "⬇️", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
          { label: "Total Views", value: totalViews, icon: "👁", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/20" },
          { label: "Subjects Covered", value: new Set(resources.map((r) => r.subject)).size, icon: "🎓", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <div className={`w-9 h-9 ${kpi.bg} rounded-xl flex items-center justify-center text-lg mb-3`}>{kpi.icon}</div>
            <div className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* ── Resource Type Quick Access ─────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">📂 Resource Categories</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {Object.entries(typeIcon).map(([type, icon]) => {
            const count = resources.filter((r) => r.type === type).length;
            return (
              <button key={type} onClick={() => setFilterType(filterType === type ? "All" : type)}
                className={`flex flex-col items-center p-3 rounded-xl border transition-all ${filterType === type ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20" : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-amber-300"}`}>
                <span className="text-2xl mb-1">{icon}</span>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{type}</span>
                <span className="text-[10px] text-slate-400">{count} items</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <input type="text" placeholder="Search resources, subjects, tags..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 flex-1 transition-colors" />
          <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white focus:outline-none focus:border-amber-500">
            <option value="All">All Subjects</option>
            {["Physics", "Chemistry", "Biology", "Mathematics", "Tamil", "English", "History"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white focus:outline-none focus:border-amber-500">
            <option value="All">All Classes</option>
            {["1","2","3","4","5","6","7","8","9","10","11","12"].map((c) => <option key={c} value={c}>Class {c}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg text-xs transition-all ${viewMode === "grid" ? "bg-amber-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>⊞</button>
            <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg text-xs transition-all ${viewMode === "list" ? "bg-amber-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>☰</button>
          </div>
          <button onClick={handleOpenAdd} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-md whitespace-nowrap">⬆ Upload Resource</button>
        </div>
      </div>

      {/* ── Results count ─────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-400">Showing <span className="font-bold text-slate-600 dark:text-slate-300">{filtered.length}</span> of {resources.length} resources</p>
        {loading && <span className="text-xs text-amber-500 animate-pulse">Loading...</span>}
      </div>

      {/* ── Resources Grid ────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">No resources found. <button onClick={handleOpenAdd} className="text-amber-500 underline ml-1">Upload the first one</button></div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((resource) => (
            <div key={resource.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0">{typeIcon[resource.type] || "📄"}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-amber-500 transition-colors leading-tight">{resource.title}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${typeColor[resource.type] || ""}`}>{resource.type}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${subjectColor[resource.subject] || "bg-slate-100 text-slate-600"}`}>{resource.subject}</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mb-3 leading-relaxed line-clamp-2">{resource.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {(resource.tags || []).map((tag) => <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded font-medium">#{tag}</span>)}
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex gap-3 text-[10px] text-slate-400">
                  <span>⬇ {resource.downloads}</span><span>👁 {resource.views}</span><span>📦 {resource.size}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenEdit(resource)} className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-lg font-bold text-[10px] transition-all">Edit</button>
                  <button onClick={() => handleDelete(resource.id, resource.title)} className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/20 rounded-lg font-bold text-[10px] transition-all">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {["Resource", "Type", "Subject", "Class", "Size", "Downloads", "Views", "Actions"].map((h) => <th key={h} className="px-5 py-3">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map((resource) => (
                  <tr key={resource.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-amber-50/30 dark:hover:bg-amber-500/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{typeIcon[resource.type] || "📄"}</span>
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-white">{resource.title}</div>
                          <div className="text-[10px] text-slate-400">{new Date(resource.uploadDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${typeColor[resource.type] || ""}`}>{resource.type}</span></td>
                    <td className="px-5 py-3.5"><span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${subjectColor[resource.subject] || "bg-slate-100 text-slate-600"}`}>{resource.subject}</span></td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-300">Class {resource.class}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">{resource.size}</td>
                    <td className="px-5 py-3.5 text-xs font-bold text-emerald-500">{resource.downloads}</td>
                    <td className="px-5 py-3.5 text-xs font-bold text-blue-500">{resource.views}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleOpenEdit(resource)} className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-lg font-bold text-[10px] transition-all">Edit</button>
                        <button onClick={() => handleDelete(resource.id, resource.title)} className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/20 rounded-lg font-bold text-[10px] transition-all">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ──────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">{editId ? "✏️ Edit Resource" : "⬆ Upload New Resource"}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Add educational materials to the digital library</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">✕ Close</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Resource Title *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Class 12 Physics Notes" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Type *</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-amber-500">
                    {Object.keys(typeIcon).map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Subject *</label>
                  <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-amber-500">
                    {["Physics", "Chemistry", "Biology", "Mathematics", "Tamil", "English", "History", "Social Science"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Class *</label>
                  <select value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-amber-500">
                    {["1","2","3","4","5","6","7","8","9","10","11","12"].map((c) => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                </div>
                {form.type !== "Video" && form.type !== "Audio" && (
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1 font-semibold">File Size</label>
                    <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} placeholder="e.g. 2.4 MB" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold">
                  {form.type === "Video" ? "YouTube / Video URL" : form.type === "Audio" ? "Audio URL (e.g. Spotify, Drive)" : "File Link / Drive URL"}
                </label>
                <input value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} placeholder="https://..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500" />
                
                {!form.fileUrl && (
                  <div className="mt-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">✨ AI Study Notes Fallback</h4>
                        <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-0.5 max-w-[250px]">Since there is no URL, you can auto-generate study notes for students to read instead.</p>
                      </div>
                      <button onClick={handleGenerateAi} disabled={generatingAi} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-[10px] font-bold rounded-lg transition-colors whitespace-nowrap shadow-sm">
                        {generatingAi ? "Generating..." : form.aiContent ? "🔄 Regenerate Notes" : "🪄 Generate Notes"}
                      </button>
                    </div>
                    {form.aiContent && <div className="mt-2 p-2 bg-white/60 dark:bg-black/20 rounded-lg text-[10px] text-slate-600 dark:text-slate-300 line-clamp-3 italic">"{form.aiContent.replace(/<[^>]+>/g, '').slice(0, 150)}..."</div>}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Tags (comma separated)</label>
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="e.g. NEET, Board Exam, Revision" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500" />
              </div>
              
              {/* 🎯 Practice Quiz Section */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">🎯 Practice Quiz Questions</h4>
                    <p className="text-[9px] text-slate-400 mt-0.5">Assign custom or AI-generated MCQs to this study material.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={handleGenerateAiQuiz} 
                    disabled={generatingQuiz} 
                    className="px-3 py-1.5 disabled:opacity-60 text-white text-[10px] font-black rounded-lg transition-colors whitespace-nowrap shadow-sm flex items-center gap-1 border-none cursor-pointer"
                    style={{ background: 'linear-gradient(to right, #4f46e5, #9333ea)', color: '#ffffff' }}
                  >
                    {generatingQuiz ? "Generating 10 Qs..." : "🪄 Generate 10 Hard MCQs"}
                  </button>
                </div>

                {/* Questions List & Manual Editor */}
                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                  {quizQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl space-y-2.5 relative text-left">
                      <button 
                        type="button"
                        onClick={() => setQuizQuestions(prev => prev.filter((_, idx) => idx !== qIdx))}
                        className="absolute top-2.5 right-2.5 text-red-500 hover:text-red-700 text-xs font-extrabold border-none bg-transparent cursor-pointer"
                      >
                        ✕ Remove
                      </button>
                      
                      <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                          Question {qIdx + 1}
                        </span>
                        <input 
                          value={q.question} 
                          onChange={(e) => {
                            const updated = [...quizQuestions];
                            updated[qIdx].question = e.target.value;
                            setQuizQuestions(updated);
                          }}
                          placeholder="Type question here..." 
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="space-y-0.5">
                            <label className="block text-[8px] font-bold text-slate-400">Option {oIdx + 1}</label>
                            <input 
                              value={opt} 
                              onChange={(e) => {
                                const updated = [...quizQuestions];
                                updated[qIdx].options[oIdx] = e.target.value;
                                setQuizQuestions(updated);
                              }}
                              placeholder={`Option ${oIdx + 1}`} 
                              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-white"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-[9px] font-semibold text-slate-500">Correct Option:</label>
                        <select 
                          value={q.answerIndex} 
                          onChange={(e) => {
                            const updated = [...quizQuestions];
                            updated[qIdx].answerIndex = parseInt(e.target.value);
                            setQuizQuestions(updated);
                          }}
                          className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-white focus:outline-none"
                        >
                          {q.options.map((_, oIdx) => (
                            <option key={oIdx} value={oIdx}>Option {oIdx + 1}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}

                  {/* Add manual question button */}
                  <button 
                    type="button"
                    onClick={() => setQuizQuestions(prev => [
                      ...prev, 
                      { question: "", options: ["", "", "", ""], answerIndex: 0 }
                    ])}
                    className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-450 hover:text-slate-650 hover:border-slate-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 bg-transparent cursor-pointer"
                  >
                    ➕ Add Question Manually
                  </button>
                </div>
              </div>

              <button onClick={handleSave} disabled={saving} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold rounded-xl text-xs transition-colors shadow-md border-none cursor-pointer">
                {saving ? "Saving..." : editId ? "✅ Save Changes" : "📚 Upload to Digital Library"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
