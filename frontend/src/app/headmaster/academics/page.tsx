"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { FiEdit2, FiTrash2, FiPlus, FiX, FiSearch, FiFilter, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { FcFolder, FcDocument, FcVideoFile, FcLink, FcAudioFile, FcReadingEbook, FcDataSheet } from "react-icons/fc";
import Swal from "sweetalert2";

// const API_BASE = "http://localhost:5000/api/superadmin/academics";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Subject {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  class?: string;
  section?: string;
  subjectCode?: string;
  medium?: string;
  description?: string;
  status?: string;
}

interface Resource {
  id: string;
  title: string;
  subjectId: string;
  category: string;
  type: string;
  url?: string;
  meta?: string;
  description?: string;
  addedBy?: string;
  class?: string;
  section?: string;
  group?: string;
  term?: string;
  chapterNumber?: string;
  topicName?: string;
  learningOutcomes?: string;
  medium?: string;
  bookVersion?: string;
  publisher?: string;
  language?: string;
  coverImage?: string;
  materialType?: string;
  downloadAllowed?: boolean;
  chapter?: string;
  lessonTitle?: string;
  youtubeUrl?: string;
  videoDuration?: string;
  thumbnail?: string;
  contentType?: string;
  author?: string;
  isbn?: string;
  status?: string;
  attachmentType?: string;
}

const TABS = [
  { id: "subjects", label: "Class Subjects" },
  { id: "syllabus", label: "Syllabus" },
  { id: "textbooks", label: "Textbooks" },
  { id: "materials", label: "Study Materials" },
  { id: "notes", label: "Teacher Notes" },
  { id: "videos", label: "Video Lessons" },
  { id: "digital", label: "Digital Content" },
  { id: "reference", label: "Reference Materials" },
];

const RESOURCE_TYPES = ["PDF", "DOC", "Video", "Audio", "Interactive", "eBook", "Link"];

const ALL_SUBJECTS = [
  "Tamil", "English", "Mathematics", "Science", "Social Science", "Physics", "Chemistry", "Biology",
  "Computer Science", "Botany", "Zoology", "Commerce", "Accountancy", "Economics", "History",
  "Geography", "Physical Education", "Environmental Science", "Moral Science", "General Knowledge"
];

const getResourceIcon = (type: string) => {
  switch (type) {
    case 'PDF': return <FcDocument className="text-4xl drop-shadow-sm" />;
    case 'Video': return <FcVideoFile className="text-4xl drop-shadow-sm" />;
    case 'Link': return <FcLink className="text-4xl drop-shadow-sm" />;
    case 'Audio': return <FcAudioFile className="text-4xl drop-shadow-sm" />;
    case 'eBook': return <FcReadingEbook className="text-4xl drop-shadow-sm" />;
    case 'DOC': return <FcDataSheet className="text-4xl drop-shadow-sm" />;
    default: return <FcFolder className="text-4xl drop-shadow-sm" />;
  }
}

export default function HeadmasterAcademicsPage() {
  const [activeTab, setActiveTab] = useState("subjects");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal States
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editSubjectId, setEditSubjectId] = useState<string | null>(null);
  const [editResourceId, setEditResourceId] = useState<string | null>(null);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);

  // Form States
  const [subjectForm, setSubjectForm] = useState({
    name: "", color: "", icon: "", class: "", section: "",
    subjectCode: "", medium: "", description: "", status: "Active"
  });
  const [resourceForm, setResourceForm] = useState({
    title: "", subjectId: "", type: "PDF", url: "", meta: "", description: "", addedBy: "",
    class: "", section: "", group: "", term: "", chapterNumber: "", topicName: "",
    learningOutcomes: "", medium: "", bookVersion: "", publisher: "", language: "",
    coverImage: "", materialType: "", downloadAllowed: true, chapter: "", lessonTitle: "",
    youtubeUrl: "", videoDuration: "", thumbnail: "", contentType: "", author: "", isbn: "", status: "Active", attachmentType: "Link"
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (activeTab !== "subjects") {
      fetchResources(activeTab);
    }
  }, [activeTab]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/subjects?_t=${Date.now()}`);
      if (res.ok) setSubjects(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async (category: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/resources?category=${category}&_t=${Date.now()}`);
      if (res.ok) setResources(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Subject Actions ---
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const method = editSubjectId ? "PUT" : "POST";
    const url = editSubjectId ? `${API_BASE}/subjects/${editSubjectId}` : `${API_BASE}/subjects`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subjectForm),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save subject");
      }
      setShowSubjectModal(false);
      fetchSubjects();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Are you sure? This will delete all related resources.")) return;
    try {
      await fetch(`${API_BASE}/subjects/${id}`, { method: "DELETE" });
      fetchSubjects();
    } catch (err) {
      console.error(err);
    }
  };

  const openSubjectModal = (sub?: Subject) => {
    if (sub) {
      setEditSubjectId(sub.id);
      setSubjectForm({
        name: sub.name, color: sub.color || "", icon: sub.icon || "",
        class: sub.class || "", section: sub.section || "",
        subjectCode: sub.subjectCode || "", medium: sub.medium || "",
        description: sub.description || "", status: sub.status || "Active"
      });
    } else {
      setEditSubjectId(null);
      setSubjectForm({ name: "", color: "", icon: "", class: "", section: "", subjectCode: "", medium: "", description: "", status: "Active" });
    }
    setError("");
    setShowSubjectModal(true);
  };

  // --- Resource Actions ---
  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const method = editResourceId ? "PUT" : "POST";
    const url = editResourceId ? `${API_BASE}/resources/${editResourceId}` : `${API_BASE}/resources`;

    try {
      const payload = {
        ...resourceForm,
        category: activeTab,
        title: resourceForm.title || resourceForm.topicName || resourceForm.chapter || "Untitled Resource"
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save resource");
      }
      setShowResourceModal(false);
      fetchResources(activeTab);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetch(`${API_BASE}/resources/${id}`, { method: "DELETE" });
      fetchResources(activeTab);
    } catch (err) {
      console.error(err);
    }
  };

  const openResourceModal = (res?: Resource) => {
    if (res) {
      setEditResourceId(res.id);
      setResourceForm({
        title: res.title, subjectId: res.subjectId, type: res.type, url: res.url || "",
        meta: res.meta || "", description: res.description || "", addedBy: res.addedBy || "",
        class: res.class || "", section: res.section || "", group: res.group || "",
        term: res.term || "", chapterNumber: res.chapterNumber || "", topicName: res.topicName || "",
        learningOutcomes: res.learningOutcomes || "", medium: res.medium || "",
        bookVersion: res.bookVersion || "", publisher: res.publisher || "", language: res.language || "",
        coverImage: res.coverImage || "", materialType: res.materialType || "",
        downloadAllowed: res.downloadAllowed ?? true, chapter: res.chapter || "",
        lessonTitle: res.lessonTitle || "", youtubeUrl: res.youtubeUrl || "",
        videoDuration: res.videoDuration || "", thumbnail: res.thumbnail || "",
        contentType: res.contentType || "", author: res.author || "", isbn: res.isbn || "",
        status: res.status || "Active",
        attachmentType: res.attachmentType || "Link"
      });
    } else {
      setEditResourceId(null);
      setResourceForm({
        title: "", subjectId: subjects[0]?.id || "", type: "PDF", url: "", meta: "", description: "", addedBy: "",
        class: "", section: "", group: "", term: "", chapterNumber: "", topicName: "",
        learningOutcomes: "", medium: "", bookVersion: "", publisher: "", language: "",
        coverImage: "", materialType: "", downloadAllowed: true, chapter: "", lessonTitle: "",
        youtubeUrl: "", videoDuration: "", thumbnail: "", contentType: "", author: "", isbn: "", status: "Active", attachmentType: "Link"
      });
    }
    setError("");
    setShowResourceModal(true);
  };

  const handleUpdateSubjectStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/subjects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        Swal.fire({
          title: newStatus === "Active" ? "Approved!" : "Rejected!",
          text: `Subject has been ${newStatus === "Active" ? "approved" : "rejected"} successfully.`,
          icon: newStatus === "Active" ? "success" : "error",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      fetchSubjects();
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error!",
        text: "Something went wrong.",
        icon: "error",
      });
    }
  };

  const handleUpdateResourceStatus = async (id: string, newStatus: string) => {
    try {
      const resource = resources.find(r => r.id === id);
      if (!resource) return;

      const res = await fetch(`${API_BASE}/resources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...resource, status: newStatus }),
      });
      if (res.ok) {
        Swal.fire({
          title: newStatus === "Active" ? "Approved!" : "Rejected!",
          text: `Resource has been ${newStatus === "Active" ? "approved" : "rejected"} successfully.`,
          icon: newStatus === "Active" ? "success" : "error",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      fetchResources(activeTab);
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error!",
        text: "Something went wrong.",
        icon: "error",
      });
    }
  };

  const filteredSubjects = subjects.filter(sub => {
    const matchSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "All" || sub.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredResources = resources.filter(res => {
    const matchSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.description && res.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchClass = filterClass ? res.class === String(filterClass) : true;
    const matchSection = filterSection ? res.section === filterSection : true;
    const matchStatus = statusFilter === "All" || res.status === statusFilter;
    return matchSearch && matchClass && matchSection && matchStatus;
  });

  return (
    <PortalLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] p-6 lg:p-10 transition-colors duration-500">

        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800/60">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-black text-slate-900 dark:text-white tracking-tight"
              >
                Academics Approvals
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium"
              >
                Review and approve subjects, syllabus, and study materials.
              </motion.p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-auto">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow w-full sm:w-64 shadow-sm text-slate-700 dark:text-slate-200"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`flex items-center justify-center gap-2 px-4 py-2 ${showFilterMenu ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'} border rounded-lg text-sm font-semibold shadow-sm transition-colors w-full sm:w-auto`}
                >
                  <FiFilter />
                  Filter
                </button>
                <AnimatePresence>
                  {showFilterMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl p-4 z-30"
                    >
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-3">Filters</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-500 mb-1 block">Status</label>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 dark:text-slate-200"
                          >
                            <option value="All">All Statuses</option>
                            <option value="Active">Approved (Active)</option>
                            <option value="Pending">Pending</option>
                            <option value="Inactive">Rejected (Inactive)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500 mb-1 block">Class</label>
                          <select
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                            className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 dark:text-slate-200"
                          >
                            <option value="">All Classes</option>
                            {[...Array(12)].map((_, i) => (
                              <option key={i + 1} value={String(i + 1)}>Class {i + 1}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-500 mb-1 block">Section</label>
                          <select
                            value={filterSection}
                            onChange={(e) => setFilterSection(e.target.value)}
                            className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 dark:text-slate-200"
                          >
                            <option value="">All Sections</option>
                            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(s => (
                              <option key={s} value={s}>Section {s}</option>
                            ))}
                          </select>
                        </div>
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => { setFilterClass(""); setFilterSection(""); setStatusFilter("All"); }}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                          >
                            Clear Filters
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => (activeTab === "subjects" ? openSubjectModal() : openResourceModal())}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:shadow-md hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-bold text-sm w-full sm:w-auto"
              >
                <FiPlus className="text-lg" />
                Add {TABS.find(t => t.id === activeTab)?.label}
              </motion.button>
            </div>
          </div>

          {/* Clean Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-xl whitespace-nowrap font-bold text-sm transition-all duration-200 ${activeTab === tab.id
                  ? "bg-slate-100 text-slate-800 border-2 border-slate-300 shadow-sm dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600"
                  : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white shadow-sm"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <motion.div
            layout
            className="min-h-[500px]"
          >
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : activeTab === "subjects" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              >
                <AnimatePresence>
                  {filteredSubjects.map((sub, idx) => (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 flex flex-col items-center text-center transition-all"
                    >
                      <div className="w-16 h-16 mb-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <FcFolder className="text-4xl" />
                      </div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{sub.name}</h3>

                      <div className="mt-2 text-sm text-slate-500">
                        Status: <span className={`font-semibold ${sub.status === 'Active' ? 'text-green-600' : sub.status === 'Inactive' ? 'text-red-500' : 'text-amber-500'}`}>{sub.status === 'Active' ? 'APPROVED' : sub.status === 'Inactive' ? 'REJECTED' : 'PENDING'}</span>
                      </div>

                      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleUpdateSubjectStatus(sub.id, "Active")} title="Approve" className="p-2 text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors">
                          <FiCheck size={16} />
                        </button>
                        <button onClick={() => handleUpdateSubjectStatus(sub.id, "Inactive")} title="Reject" className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                          <FiX size={16} />
                        </button>
                        <button onClick={() => openSubjectModal(sub)} title="Edit" className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors">
                          <FiEdit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteSubject(sub.id)} title="Delete" className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredSubjects.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-500 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <FcFolder className="text-6xl mb-4 grayscale opacity-40" />
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No subjects yet</p>
                    <p className="text-sm mt-1">Click 'Add Subject' to create your first class subject.</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-4"
              >
                <AnimatePresence>
                  {filteredResources.map((res, idx) => (
                    <motion.div
                      key={res.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-5 w-full">
                        <div className="w-14 h-14 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                          {getResourceIcon(res.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                              {res.title}
                            </h3>
                            <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 tracking-wide border border-slate-200 dark:border-slate-700">
                              {res.type}
                            </span>
                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wide border ${res.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50' : res.status === 'Inactive' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50' : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50'}`}>
                              {res.status === 'Active' ? 'APPROVED' : res.status === 'Inactive' ? 'REJECTED' : 'PENDING'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 flex flex-wrap gap-x-2 gap-y-1">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{subjects.find((s) => s.id === res.subjectId)?.name || "General"}</span>
                            {res.class && <span className="flex items-center gap-2 before:content-['•'] before:text-slate-300">Class {res.class}</span>}
                            {res.section && <span className="flex items-center gap-2 before:content-['•'] before:text-slate-300">Sec {res.section}</span>}
                            {res.meta && <span className="flex items-center gap-2 before:content-['•'] before:text-slate-300">{res.meta}</span>}
                          </p>
                          {res.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                              {res.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleUpdateResourceStatus(res.id, "Active")} title="Approve" className="p-2.5 bg-white dark:bg-slate-800 rounded-lg text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                          <FiCheck size={18} />
                        </button>
                        <button onClick={() => handleUpdateResourceStatus(res.id, "Inactive")} title="Reject" className="p-2.5 bg-white dark:bg-slate-800 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                          <FiX size={18} />
                        </button>
                        <button onClick={() => openResourceModal(res)} title="Edit" className="p-2.5 bg-white dark:bg-slate-800 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                          <FiEdit2 size={18} />
                        </button>
                        <button onClick={() => handleDeleteResource(res.id)} title="Delete" className="p-2.5 bg-white dark:bg-slate-800 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredResources.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-24 text-slate-500 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <FcDocument className="text-6xl mb-4 grayscale opacity-40" />
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No resources found</p>
                    <p className="text-sm mt-1">Click 'Add Resource' to upload files for this category.</p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* --- Subject Modal --- */}
        <AnimatePresence>
          {showSubjectModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowSubjectModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white/95 dark:bg-[#1e1e2d]/95 backdrop-blur-2xl w-full max-w-md rounded-[2rem] shadow-2xl overflow-visible relative z-10 border border-white/20 dark:border-gray-700/50"
              >
                <div className="flex justify-between items-center p-6 border-b border-gray-100/50 dark:border-gray-800/50">
                  <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100">{editSubjectId ? "Edit Subject" : "Add Subject"}</h3>
                  <button onClick={() => setShowSubjectModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                    <FiX className="text-xl" />
                  </button>
                </div>
                <form onSubmit={handleSaveSubject} className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                  {error && <div className="text-red-500 text-sm bg-red-50/80 p-3 rounded-xl">{error}</div>}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Class *</label>
                      <select required value={subjectForm.class} onChange={e => setSubjectForm({ ...subjectForm, class: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none">
                        <option value="">Select Class</option>
                        {[...Array(12)].map((_, i) => <option key={i} value={String(i + 1)}>Class {i + 1}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Section (Optional)</label>
                      <select value={subjectForm.section} onChange={e => setSubjectForm({ ...subjectForm, section: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none">
                        <option value="">Any</option>
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Subject *</label>
                      <div onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 cursor-pointer flex justify-between items-center outline-none">
                        <span className={subjectForm.name ? "text-gray-900 dark:text-white" : "text-gray-500"}>{subjectForm.name || "Select"}</span>
                        <span className="text-xs text-gray-400">▼</span>
                      </div>
                      <AnimatePresence>
                        {isSubjectDropdownOpen && (
                          <motion.div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1e1e2d] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                            {ALL_SUBJECTS.map((subject) => (
                              <div key={subject} onClick={() => { setSubjectForm({ ...subjectForm, name: subject }); setIsSubjectDropdownOpen(false); }} className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 font-medium border-b border-gray-50 dark:border-gray-800/50">{subject}</div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Subject Code</label>
                      <input type="text" value={subjectForm.subjectCode} onChange={e => setSubjectForm({ ...subjectForm, subjectCode: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Medium</label>
                      <select value={subjectForm.medium} onChange={e => setSubjectForm({ ...subjectForm, medium: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none">
                        <option value="">Select Medium</option>
                        <option value="Tamil">Tamil</option>
                        <option value="English">English</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Status</label>
                      <select value={subjectForm.status} onChange={e => setSubjectForm({ ...subjectForm, status: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Description</label>
                    <textarea rows={2} value={subjectForm.description} onChange={e => setSubjectForm({ ...subjectForm, description: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none resize-none"></textarea>
                  </div>

                  <div className="flex justify-end gap-3 mt-2">
                    <button type="button" onClick={() => setShowSubjectModal(false)} className="px-5 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg font-bold">Save Subject</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- Resource Modal --- */}
        <AnimatePresence>
          {showResourceModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setShowResourceModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white/95 dark:bg-[#1e1e2d]/95 backdrop-blur-2xl w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto relative z-10 border border-white/20 dark:border-gray-700/50"
              >
                <div className="flex justify-between items-center p-6 border-b border-gray-100/50 dark:border-gray-800/50 sticky top-0 bg-white/80 dark:bg-[#1e1e2d]/80 backdrop-blur-md z-20">
                  <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100">{editResourceId ? `Edit ${TABS.find(t => t.id === activeTab)?.label}` : `Add ${TABS.find(t => t.id === activeTab)?.label}`}</h3>
                  <button onClick={() => setShowResourceModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                    <FiX className="text-xl" />
                  </button>
                </div>
                <form onSubmit={handleSaveResource} className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                  {error && <div className="text-red-500 text-sm bg-red-50/80 p-3 rounded-xl">{error}</div>}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Class *</label>
                      <select required value={resourceForm.class} onChange={e => setResourceForm({ ...resourceForm, class: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none">
                        <option value="">Select Class</option>
                        {[...Array(12)].map((_, i) => <option key={i} value={String(i + 1)}>Class {i + 1}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Subject *</label>
                      <select required value={resourceForm.subjectId} onChange={e => setResourceForm({ ...resourceForm, subjectId: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none">
                        <option value="" disabled>Select subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Fields Based on Tab */}
                  {activeTab === "syllabus" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Term</label>
                          <select value={resourceForm.term} onChange={e => setResourceForm({ ...resourceForm, term: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none">
                            <option value="">Select Term</option>
                            <option value="Term 1">Term 1</option><option value="Term 2">Term 2</option><option value="Term 3">Term 3</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Unit / Chapter</label>
                          <input type="text" value={resourceForm.chapter} onChange={e => setResourceForm({ ...resourceForm, chapter: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Chapter Number</label>
                          <input type="text" value={resourceForm.chapterNumber} onChange={e => setResourceForm({ ...resourceForm, chapterNumber: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Topic Name</label>
                          <input type="text" value={resourceForm.topicName} onChange={e => setResourceForm({ ...resourceForm, topicName: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Learning Outcomes</label>
                        <textarea rows={2} value={resourceForm.learningOutcomes} onChange={e => setResourceForm({ ...resourceForm, learningOutcomes: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none"></textarea>
                      </div>
                    </>
                  )}

                  {activeTab === "textbooks" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Book Title *</label>
                          <input required type="text" value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Medium</label>
                          <select value={resourceForm.medium} onChange={e => setResourceForm({ ...resourceForm, medium: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none">
                            <option value="">Select Medium</option><option value="Tamil">Tamil</option><option value="English">English</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Version / Edition</label>
                          <input type="text" value={resourceForm.bookVersion} onChange={e => setResourceForm({ ...resourceForm, bookVersion: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Publisher</label>
                          <input type="text" value={resourceForm.publisher} onChange={e => setResourceForm({ ...resourceForm, publisher: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none" placeholder="SCERT / NCERT" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Language</label>
                          <input type="text" value={resourceForm.language} onChange={e => setResourceForm({ ...resourceForm, language: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Cover Image URL</label>
                          <input type="text" value={resourceForm.coverImage} onChange={e => setResourceForm({ ...resourceForm, coverImage: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none" />
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "materials" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Material Title *</label>
                          <input required type="text" value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Material Type</label>
                          <select value={resourceForm.materialType} onChange={e => setResourceForm({ ...resourceForm, materialType: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none">
                            <option value="">Select Type</option><option value="PDF">PDF</option><option value="PPT">PPT</option><option value="DOC">DOC</option><option value="Worksheet">Worksheet</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <input type="checkbox" checked={resourceForm.downloadAllowed} onChange={e => setResourceForm({ ...resourceForm, downloadAllowed: e.target.checked })} className="rounded text-blue-500 focus:ring-blue-500/50" />
                          Download Allowed
                        </label>
                      </div>
                    </>
                  )}

                  {activeTab === "notes" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Chapter</label>
                          <input type="text" value={resourceForm.chapter} onChange={e => setResourceForm({ ...resourceForm, chapter: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Lesson Title *</label>
                          <input required type="text" value={resourceForm.lessonTitle} onChange={e => setResourceForm({ ...resourceForm, lessonTitle: e.target.value, title: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none" />
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "videos" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Chapter</label>
                          <input type="text" value={resourceForm.chapter} onChange={e => setResourceForm({ ...resourceForm, chapter: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Video Title *</label>
                          <input required type="text" value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">YouTube URL</label>
                          <input type="text" value={resourceForm.youtubeUrl} onChange={e => setResourceForm({ ...resourceForm, youtubeUrl: e.target.value, url: e.target.value, type: "Video" })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Duration</label>
                          <input type="text" value={resourceForm.videoDuration} onChange={e => setResourceForm({ ...resourceForm, videoDuration: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none" placeholder="e.g. 15 Mins" />
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "digital" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Content Title *</label>
                          <input required type="text" value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Content Type</label>
                          <select value={resourceForm.contentType} onChange={e => setResourceForm({ ...resourceForm, contentType: e.target.value, type: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none">
                            <option value="">Select Type</option><option value="PDF">PDF</option><option value="Video">Video</option><option value="Audio">Audio</option><option value="Interactive">Interactive</option><option value="Presentation">Presentation</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === "reference" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Reference Title *</label>
                          <input required type="text" value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Author</label>
                          <input type="text" value={resourceForm.author} onChange={e => setResourceForm({ ...resourceForm, author: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Publisher</label>
                          <input type="text" value={resourceForm.publisher} onChange={e => setResourceForm({ ...resourceForm, publisher: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">ISBN (Optional)</label>
                          <input type="text" value={resourceForm.isbn} onChange={e => setResourceForm({ ...resourceForm, isbn: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none" />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Common Elements across Resources */}
                  {activeTab === "syllabus" ? (
                    <input type="hidden" value={resourceForm.title} />
                  ) : null}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Attachment Type</label>
                      <select value={resourceForm.attachmentType || "Link"} onChange={e => setResourceForm({ ...resourceForm, attachmentType: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none">
                        <option value="Link">Link (URL)</option>
                        <option value="Upload">File Upload</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Status</label>
                      <select value={resourceForm.status} onChange={e => setResourceForm({ ...resourceForm, status: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none">
                        <option value="Active">Active</option><option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    {resourceForm.attachmentType === "Upload" ? (
                      <>
                        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Upload File</label>
                        <div className="relative w-full px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center bg-white/50 dark:bg-black/20 cursor-pointer overflow-hidden">
                          <input type="file" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setResourceForm({ ...resourceForm, url: `/uploads/${file.name}` });
                          }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          <span className="text-sm text-gray-500 font-medium">
                            {resourceForm.url && resourceForm.url.startsWith('/uploads') ? '✓ ' + resourceForm.url.split('/').pop() : 'Click to Browse / Drag File'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">URL / Link</label>
                        <input type="text" value={resourceForm.url} onChange={e => setResourceForm({ ...resourceForm, url: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none" placeholder="https://..." />
                      </>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Description</label>
                    <textarea rows={2} value={resourceForm.description} onChange={e => setResourceForm({ ...resourceForm, description: e.target.value })} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-black/20 outline-none resize-none"></textarea>
                  </div>

                  <div className="flex justify-end gap-3 mt-2">
                    <button type="button" onClick={() => setShowResourceModal(false)} className="px-5 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg font-bold">Save {TABS.find(t => t.id === activeTab)?.label}</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PortalLayout>
  );
}
