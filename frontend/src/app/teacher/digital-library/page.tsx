"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { Upload, CheckCircle2, AlertCircle, BookOpen, Trash2, Edit3, X, Loader2, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

const CATEGORIES = [
  "E-books",
  "Reference books",
  "Educational videos",
  "Government learning materials",
  "Research content",
  "Competitive examination resources"
];
const CLASSES = ["6", "7", "8", "9", "10", "11", "12"];

export default function TeacherDigitalLibraryPage() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    title: "", type: "", subject: "", class: "", description: "", fileUrl: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [items, setItems] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [classroomsLoaded, setClassroomsLoaded] = useState(false);

  const teacherClasses = Array.from(new Set(classrooms.map((c) => c.className))).sort();
  const finalClasses = teacherClasses;

  const activeSubjects = Array.from(
    new Set(
      classrooms
        .filter((c) => c.className === formData.class)
        .map((c) => c.subject)
        .filter(Boolean)
    )
  ).sort();
  const finalSubjects = activeSubjects as string[];

  const handleClassChange = (newClass: string) => {
    const newSubjects = Array.from(
      new Set(
        classrooms
          .filter((c) => c.className === newClass)
          .map((c) => c.subject)
          .filter(Boolean)
      )
    ).sort() as string[];
    setFormData((prev) => ({
      ...prev,
      class: newClass,
      subject: newSubjects.includes(prev.subject) ? prev.subject : (newSubjects[0] || "")
    }));
  };

  useEffect(() => {
    const fetchClassrooms = async () => {
      const schoolId = (session?.user as any)?.schoolId;
      const teacherId = (session?.user as any)?.id;
      if (!schoolId || !teacherId) return;
      try {
        const getApiUrl = () => {
          if (typeof window !== "undefined") {
            if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
              return "http://localhost:5000";
            }
          }
          return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        };
        const API_URL = getApiUrl();
        const res = await fetch(`${API_URL}/api/classes?schoolId=${schoolId}&teacherId=${teacherId}`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.success && Array.isArray(json.data)) {
            setClassrooms(json.data);
            setClassroomsLoaded(true);
            if (!editingId && json.data.length > 0) {
              // Placeholders will be shown until the user explicitly selects a class/subject
            } else {
              setClassroomsLoaded(true);
            }
          }
        }
      } catch (err) {
        console.error("Error loading teacher classrooms", err);
        setClassroomsLoaded(true);
      }
    };
    fetchClassrooms();
  }, [session, editingId]);

  const fetchItems = async () => {
    if (!session?.user) return;
    try {
      const getApiUrl = () => {
        if (typeof window !== "undefined") {
          if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
            return "http://localhost:5000";
          }
        }
        return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      };
      const API_URL = getApiUrl();
      const schoolId = (session.user as any).schoolId;
      const teacherId = (session.user as any).id;

      if (schoolId) {
        const res = await fetch(`${API_URL}/api/digital-library-upload/school/${schoolId}`);
        if (res.ok) {
          const resData = await res.json();
          if (resData.success && Array.isArray(resData.data)) {
            // Filter to show only items uploaded by this specific teacher
            const teacherItems = resData.data.filter((item: any) => item.uploadedById === teacherId);
            setItems(teacherItems);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch contributed items", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [session]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("type", formData.type);
      submitData.append("subject", formData.subject);
      submitData.append("class", formData.class);
      submitData.append("description", formData.description);
      submitData.append("fileUrl", formData.fileUrl);
      submitData.append("role", "TEACHER");
      submitData.append("userId", (session?.user as any)?.id || "");
      submitData.append("schoolId", (session?.user as any)?.schoolId || "");
      
      if (selectedFile) {
        if (selectedFile.size > 4.5 * 1024 * 1024) {
          Swal.fire({
            icon: "warning",
            title: "File too large",
            text: "File size exceeds the 4.5MB serverless upload limit. Please optimize the file size or provide a direct File URL instead.",
            confirmButtonColor: "#3b82f6",
            background: document.documentElement.classList.contains("dark") ? "#1e293b" : "#ffffff",
            color: document.documentElement.classList.contains("dark") ? "#f1f5f9" : "#0f172a"
          });
          setLoading(false);
          return;
        }
        submitData.append("file", selectedFile);
      }

      const getApiUrl = () => {
        if (typeof window !== "undefined") {
          if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
            return "http://localhost:5000";
          }
        }
        return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      };
      const API_URL = getApiUrl();

      const url = editingId 
        ? `${API_URL}/api/digital-library-upload/${editingId}`
        : `${API_URL}/api/digital-library-upload`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        body: submitData
      });
      
      if (!res.ok) {
        if (res.status === 413) {
          throw new Error("File is too large for the upload gateway (limit 4.5MB). Please use a smaller file size.");
        }
        if (res.status === 404) {
          throw new Error("Upload service is currently unavailable. Please contact the administrator.");
        }
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: editingId ? "Updated!" : "Submitted!",
          text: editingId 
            ? "Resource updated successfully! It is now pending Headmaster approval." 
            : "Resource submitted successfully! It is now pending Headmaster approval.",
          confirmButtonColor: "#10b981",
          background: document.documentElement.classList.contains("dark") ? "#1e293b" : "#ffffff",
          color: document.documentElement.classList.contains("dark") ? "#f1f5f9" : "#0f172a"
        });
        setFormData({ title: "", type: "E-books", subject: "", class: "10", description: "", fileUrl: "" });
        setSelectedFile(null);
        setEditingId(null);
        setShowModal(false);
        fetchItems();
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: data.error || "Failed to submit resource.",
          confirmButtonColor: "#ef4444",
          background: document.documentElement.classList.contains("dark") ? "#1e293b" : "#ffffff",
          color: document.documentElement.classList.contains("dark") ? "#f1f5f9" : "#0f172a"
        });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "An error occurred during submission." });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || "",
      type: item.type || "E-books",
      subject: item.subject || "",
      class: item.class || "10",
      description: item.description || "",
      fileUrl: item.fileUrl || ""
    });
    setSelectedFile(null);
    setMessage(null);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: "",
      type: "",
      subject: "",
      class: "",
      description: "",
      fileUrl: ""
    });
    setSelectedFile(null);
    setMessage(null);
    setShowModal(true);
  };

  const closeCreateModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
      background: document.documentElement.classList.contains("dark") ? "#1e293b" : "#ffffff",
      color: document.documentElement.classList.contains("dark") ? "#f1f5f9" : "#0f172a"
    });

    if (!result.isConfirmed) return;

    try {
      const getApiUrl = () => {
        if (typeof window !== "undefined") {
          if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
            return "http://localhost:5000";
          }
        }
        return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      };
      const API_URL = getApiUrl();
      const res = await fetch(`${API_URL}/api/digital-library-upload/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        Swal.fire({
          title: "Deleted!",
          text: "Resource has been deleted successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          background: document.documentElement.classList.contains("dark") ? "#1e293b" : "#ffffff",
          color: document.documentElement.classList.contains("dark") ? "#f1f5f9" : "#0f172a"
        });
        fetchItems();
        if (editingId === id) {
          closeCreateModal();
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: "Failed to delete resource.",
          confirmButtonColor: "#ef4444",
          background: document.documentElement.classList.contains("dark") ? "#1e293b" : "#ffffff",
          color: document.documentElement.classList.contains("dark") ? "#f1f5f9" : "#0f172a"
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "An error occurred while deleting the resource.",
        confirmButtonColor: "#ef4444",
        background: document.documentElement.classList.contains("dark") ? "#1e293b" : "#ffffff",
        color: document.documentElement.classList.contains("dark") ? "#f1f5f9" : "#0f172a"
      });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "REJECTED":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      default:
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    }
  };

  return (
    <PortalLayout title="Contribute to Library" subtitle="Share valuable resources with your students" accentColor="#10b981">
      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-8 pt-4">

        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-auto text-slate-400 hover:text-slate-650 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Contributed Items List Dashboard */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 p-8 text-left w-full">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                📚 Your Contributed Resources ({items.length})
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Manage and track your submitted textbooks, video lessons, and reference books.</p>
            </div>
            <button 
              onClick={openCreateModal}
              className="bg-emerald-600 hover:bg-emerald-750 text-white font-bold py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 text-xs"
              style={{ backgroundColor: "#059669" }} // fallback color to ensure visibility
            >
              <Plus className="w-4 h-4" /> Submit New Resource
            </button>
          </div>

          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
              <p className="text-sm">Loading contributed resources...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-slate-400 border border-dashed border-slate-250 dark:border-slate-800 rounded-2xl">
              <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="font-bold text-slate-750 dark:text-slate-300 mb-1">No resources found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">Use the submit resource button to contribute your first educational resource to the school library.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-450">
                    <th className="py-4 px-4">Title</th>
                    <th className="py-4 px-4">Class & Subject</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {items.map((item) => (
                    <tr key={item.id} className="text-sm hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800 dark:text-white">{item.title}</div>
                        {item.description && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 max-w-xs">{item.description}</div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-705 dark:text-slate-305">Class {item.class}</div>
                        <div className="text-xs text-slate-505 capitalize">{item.subject}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-medium text-slate-650 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/40 dark:border-slate-700/40">
                          {item.type}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${getStatusBadgeClass(item.approvalStatus)}`}>
                          {item.approvalStatus === "APPROVED" ? "Approved" : item.approvalStatus === "REJECTED" ? "Rejected" : "Pending"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-2 text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/20 rounded-xl transition-all"
                            title="Edit Resource"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-slate-505 hover:text-rose-650 dark:hover:text-rose-400 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/20 rounded-xl transition-all"
                            title="Delete Resource"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ── RESOURCE DIALOG MODAL POPUP ────────────────────── */}
      {showModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.4)" }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 text-left relative">
            
            <button 
              onClick={closeCreateModal}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {editingId ? "Edit Resource details" : "Submit New Resource"}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Fill out the fields to publish study materials to students.</p>
              </div>
            </div>

            <form onSubmit={handleUpload} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-705 dark:text-slate-300">Title *</label>
                  <input type="text" required placeholder="Enter resource title..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 outline-none transition-all dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-705 dark:text-slate-300">Category *</label>
                  <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 outline-none transition-all dark:text-white">
                    <option value="" disabled>Select Category</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-705 dark:text-slate-300">Class Level *</label>
                  <select
                    required
                    value={formData.class}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 outline-none transition-all dark:text-white"
                  >
                    <option value="" disabled>Select Class Level</option>
                    {finalClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        Class {cls}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-705 dark:text-slate-300">Subject *</label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 outline-none transition-all dark:text-white"
                  >
                    <option value="" disabled>Select Subject</option>
                    {finalSubjects.map((subj) => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-705 dark:text-slate-300">File Upload (PDF/Image/Video)</label>
                  <input type="file" accept="image/*,application/pdf,video/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 outline-none transition-all dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-705 dark:text-slate-300">OR File URL</label>
                  <input type="url" value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 outline-none transition-all dark:text-white" placeholder="https://example.com/file" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-705 dark:text-slate-300">Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 outline-none transition-all dark:text-white" placeholder="Explain what students will learn..." />
              </div>

              <div className="pt-4 flex justify-end gap-3 font-bold text-xs">
                <button type="button" onClick={closeCreateModal} className="border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 px-6 rounded-xl transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> {editingId ? "Updating..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      {editingId ? "Update Resource" : "Submit for Approval"} <Upload className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
