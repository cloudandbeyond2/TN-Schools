"use client";
import { useState, useEffect, useRef } from "react";
import PortalLayout from "@/components/PortalLayout";
import { apiFetch } from "@/lib/api";

type ContentType = "PDF" | "Video" | "Slides" | "Audio" | "Image";
type Portal = "Student" | "Teacher" | "Parent" | "Headmaster" | "All";

interface Material {
  id: string | number;
  title: string;
  type: ContentType;
  subject: string;
  class: string;
  chapter: string;
  portal: Portal;
  size: string;
  uploadedBy: string;
  date: string;
  status: "active" | "draft" | "archived";
  aiTagged: boolean;
}

const typeIcons: Record<ContentType, React.ReactNode> = {
  PDF: <i className="fi fi-rr-file-pdf text-red-400"></i>,
  Video: <i className="fi fi-rr-video-camera text-blue-400"></i>,
  Slides: <i className="fi fi-rr-stats text-amber-400"></i>,
  Audio: <i className="fi fi-rr-music text-emerald-400"></i>,
  Image: <i className="fi fi-rr-picture text-pink-400"></i>,
};

const typeColors: Record<ContentType, string> = {
  PDF: "text-red-400 bg-red-500/10 border-red-500/30",
  Video: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  Slides: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  Audio: "text-green-400 bg-green-500/10 border-green-500/30",
  Image: "text-pink-400 bg-pink-500/10 border-pink-500/30",
};

const statusColors: Record<Material["status"], string> = {
  active: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  draft: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  archived: "text-slate-400 bg-slate-700 border-slate-600",
};

const SUBJECTS = ["All Subjects", "Mathematics", "Science", "Physics", "Chemistry", "Biology", "Tamil", "English", "Social Science", "Computer Science", "General", "Administration"];
const CLASSES = ["All Classes", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];
const PORTALS: Portal[] = ["Student", "Teacher", "Parent", "Headmaster", "All"];

const emptyForm = { title: "", type: "PDF" as ContentType, subject: "Mathematics", class: "Class 10", chapter: "", portal: "Student" as Portal };

export default function MaterialLibrary() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("All Subjects");
  const [filterClass, setFilterClass] = useState("All Classes");
  const [filterType, setFilterType] = useState<"All" | ContentType>("All");
  const [filterStatus, setFilterStatus] = useState<"All" | Material["status"]>("All");
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  const fetchMaterials = async () => {
    try {
      const res = await apiFetch("/api/materials");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMaterials(json.data);
      }
    } catch (err) {
      console.warn("Could not fetch materials from API:", err);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const filtered = materials.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject === "All Subjects" || m.subject === filterSubject;
    const matchClass = filterClass === "All Classes" || m.class === filterClass;
    const matchType = filterType === "All" || m.type === filterType;
    const matchStatus = filterStatus === "All" || m.status === filterStatus;
    return matchSearch && matchSubject && matchClass && matchType && matchStatus;
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachedFile(file);
      if (!form.title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
        setForm((f) => ({ ...f, title: nameWithoutExt }));
      }
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf") setForm((f) => ({ ...f, type: "PDF" }));
      else if (["mp4", "webm", "mkv"].includes(ext || "")) setForm((f) => ({ ...f, type: "Video" }));
      else if (["ppt", "pptx"].includes(ext || "")) setForm((f) => ({ ...f, type: "Slides" }));
      else if (["mp3", "wav", "aac"].includes(ext || "")) setForm((f) => ({ ...f, type: "Audio" }));
      else if (["png", "jpg", "jpeg", "webp"].includes(ext || "")) setForm((f) => ({ ...f, type: "Image" }));
    }
  };

  const handleBulkFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setBulkFiles(Array.from(e.target.files));
    }
  };

  const updateStatus = async (id: string | number, nextStatus: Material["status"]) => {
    setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, status: nextStatus } : m)));
    try {
      await apiFetch(`/api/materials/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch {}
  };

  const toggleAI = async (id: string | number) => {
    const target = materials.find((m) => m.id === id);
    if (!target) return;
    const nextAi = !target.aiTagged;
    setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, aiTagged: nextAi } : m)));
    try {
      await apiFetch(`/api/materials/${id}`, {
        method: "PUT",
        body: JSON.stringify({ aiTagged: nextAi }),
      });
    } catch {}
  };

  const deleteMaterial = async (id: string | number) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    try {
      await apiFetch(`/api/materials/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete material from backend:", err);
    }
  };

  const addMaterial = async () => {
    if (!form.title) return;
    const fileSizeStr = attachedFile ? formatFileSize(attachedFile.size) : "1.5 MB";
    const payload = { ...form, size: fileSizeStr };

    try {
      const res = await apiFetch("/api/materials", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setMaterials((prev) => [json.data, ...prev]);
      }
    } catch (err) {
      console.error("Error creating material:", err);
    }
    setShowModal(false);
    setForm(emptyForm);
    setAttachedFile(null);
  };

  const submitBulkUpload = async () => {
    if (bulkFiles.length === 0) return;
    const newItems: Material[] = [];
    for (const f of bulkFiles) {
      const nameWithoutExt = f.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
      const ext = f.name.split(".").pop()?.toLowerCase();
      let type: ContentType = "PDF";
      if (["mp4", "webm"].includes(ext || "")) type = "Video";
      else if (["ppt", "pptx"].includes(ext || "")) type = "Slides";
      else if (["mp3", "wav"].includes(ext || "")) type = "Audio";
      else if (["png", "jpg", "jpeg"].includes(ext || "")) type = "Image";

      const itemData = {
        title: nameWithoutExt,
        type,
        subject: "General",
        class: "Class 10",
        chapter: "—",
        portal: "Student" as Portal,
        size: formatFileSize(f.size),
      };

      try {
        const res = await apiFetch("/api/materials", {
          method: "POST",
          body: JSON.stringify(itemData),
        });
        const json = await res.json();
        if (json.success && json.data) {
          newItems.push(json.data);
        }
      } catch (err) {
        console.error("Error bulk creating material:", err);
      }
    }
    setMaterials((prev) => [...newItems, ...prev]);
    setShowBulkModal(false);
    setBulkFiles([]);
  };

  const byType = (t: ContentType) => materials.filter((m) => m.type === t).length;

  return (
    <PortalLayout>
      {/* Header Banner */}
      <div className="mb-6 p-4 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-lg font-bold text-white"><i className="fi fi-rr-box-alt text-amber-400 mr-2"></i>Material Library</h1>
          <p className="text-xs text-slate-400 mt-1">Upload and manage learning materials — PDFs, videos, slides, and audio across all portals</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBulkModal(true)} className="text-xs font-bold bg-slate-800 border border-slate-700 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition flex items-center gap-1.5">
            <i className="fi fi-rr-file-upload"></i> Bulk Upload
          </button>
          <button onClick={() => setShowModal(true)} className="text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-md">
            <i className="fi fi-rr-plus"></i> Add Material
          </button>
        </div>
      </div>

      {/* Type Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
        {(["PDF", "Video", "Slides", "Audio", "Image"] as ContentType[]).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType((prev) => (prev === t ? "All" : t))}
            className={`glass rounded-xl p-3 border text-center transition ${filterType === t ? "border-pink-500 bg-pink-500/10" : "border-slate-800 hover:border-slate-700"}`}
          >
            <div className="text-xl mb-1 flex items-center justify-center">{typeIcons[t]}</div>
            <div className="text-sm font-extrabold text-white">{byType(t)}</div>
            <div className="text-[10px] text-slate-500 font-semibold">{t}</div>
          </button>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="glass rounded-2xl p-4 mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <i className="fi fi-rr-search text-slate-500 text-sm ml-2"></i>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search materials..."
            className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
          >
            {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </select>

          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
          >
            {CLASSES.map((c) => <option key={c}>{c}</option>)}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
          >
            <option value="All">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <i className="fi fi-rr-box-alt text-3xl text-slate-600 block mb-2"></i>
            <div className="text-xs font-semibold text-slate-400">No materials found</div>
            <div className="text-[10px] text-slate-500 mt-1">Click &quot;+ Add Material&quot; above to upload learning materials.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider bg-slate-900/50">
                  <th className="p-3.5">Material</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Subject / Class</th>
                  <th className="p-3.5">Portal</th>
                  <th className="p-3.5">Size</th>
                  <th className="p-3.5">AI</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-white leading-snug">{m.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{m.uploadedBy} · {m.date}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 w-max ${typeColors[m.type]}`}>
                        {typeIcons[m.type]} {m.type}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-200">{m.subject}</div>
                      <div className="text-[10px] text-slate-500">{m.class}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{m.portal}</span>
                    </td>
                    <td className="p-3.5 text-slate-400">{m.size}</td>
                    <td className="p-3.5">
                      <button
                        onClick={() => toggleAI(m.id)}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition flex items-center gap-1 ${
                          m.aiTagged ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" : "text-slate-500 bg-slate-800 border-slate-700"
                        }`}
                      >
                        <i className="fi fi-rr-robot"></i> {m.aiTagged ? "ON" : "OFF"}
                      </button>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={m.status}
                        onChange={(e) => updateStatus(m.id, e.target.value as Material["status"])}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition focus:outline-none cursor-pointer ${statusColors[m.status]}`}
                      >
                        <option value="active" className="bg-slate-900 text-emerald-400">ACTIVE</option>
                        <option value="draft" className="bg-slate-900 text-amber-400">DRAFT</option>
                        <option value="archived" className="bg-slate-900 text-slate-400">ARCHIVED</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => deleteMaterial(m.id)}
                        className="text-[10px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 justify-end ml-auto bg-red-500/10 px-2.5 py-1 rounded border border-red-500/20 transition"
                      >
                        <i className="fi fi-rr-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add New Material Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <i className="fi fi-rr-box-alt text-amber-400"></i> Add New Material
            </h3>
            
            {/* File Attachment Drop Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-pink-500/50 bg-slate-800/60 rounded-xl p-4 text-center cursor-pointer transition mb-4 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.pptx,.mp4,.mp3,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
              {attachedFile ? (
                <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <i className="fi fi-rr-document text-pink-400 text-lg"></i>
                    <div className="text-left min-w-0">
                      <div className="text-xs font-bold text-white truncate">{attachedFile.name}</div>
                      <div className="text-[10px] text-slate-400">{formatFileSize(attachedFile.size)}</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAttachedFile(null);
                    }}
                    className="text-slate-400 hover:text-red-400 text-xs p-1"
                  >
                    <i className="fi fi-rr-cross"></i>
                  </button>
                </div>
              ) : (
                <div>
                  <i className="fi fi-rr-cloud-upload text-2xl text-pink-400 group-hover:scale-110 transition-transform block mb-1"></i>
                  <div className="text-xs font-bold text-slate-200">Click to Attach PDF or Media File</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Supports PDF, Video, Audio, Slides, and Images</div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Material title"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Type", key: "type", options: ["PDF", "Video", "Slides", "Audio", "Image"] as ContentType[] },
                  { label: "Portal", key: "portal", options: PORTALS },
                ].map(({ label, key, options }) => (
                  <div key={key}>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">{label}</label>
                    <select
                      value={(form as any)[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
                    >
                      {options.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
                  >
                    {SUBJECTS.slice(1).map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Class</label>
                  <select
                    value={form.class}
                    onChange={(e) => setForm((f) => ({ ...f, class: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-pink-500"
                  >
                    {CLASSES.slice(1).map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowModal(false); setAttachedFile(null); }} className="flex-1 text-xs font-bold text-slate-400 bg-slate-800 py-2 rounded-lg border border-slate-700">
                Cancel
              </button>
              <button onClick={addMaterial} className="flex-1 text-xs font-bold text-white bg-pink-600 hover:bg-pink-500 py-2 rounded-lg transition flex items-center justify-center gap-1">
                <i className="fi fi-rr-plus"></i> Add Material
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <i className="fi fi-rr-file-upload text-blue-400"></i> Bulk Material Upload
            </h3>

            <div 
              onClick={() => bulkFileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 bg-slate-800/60 rounded-xl p-6 text-center cursor-pointer transition mb-4 group"
            >
              <input
                ref={bulkFileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.pptx,.mp4,.mp3,.png,.jpg,.jpeg"
                onChange={handleBulkFilesChange}
                className="hidden"
              />
              <i className="fi fi-rr-cloud-upload text-3xl text-blue-400 group-hover:scale-110 transition-transform block mb-2"></i>
              <div className="text-xs font-bold text-slate-200">Click to Select Multiple Files</div>
              <div className="text-[10px] text-slate-500 mt-1">Upload multiple textbook PDFs or study resources at once</div>
            </div>

            {bulkFiles.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-1.5 mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Selected Files ({bulkFiles.length}):</div>
                {bulkFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="truncate flex-1 mr-2">{file.name}</span>
                    <span className="text-[10px] text-slate-500 shrink-0">{formatFileSize(file.size)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowBulkModal(false); setBulkFiles([]); }} className="flex-1 text-xs font-bold text-slate-400 bg-slate-800 py-2 rounded-lg border border-slate-700">
                Cancel
              </button>
              <button onClick={submitBulkUpload} className="flex-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 py-2 rounded-lg transition flex items-center justify-center gap-1">
                <i className="fi fi-rr-upload"></i> Upload {bulkFiles.length > 0 ? `(${bulkFiles.length})` : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
