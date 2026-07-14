"use client";

import React, { useState, useEffect, useMemo } from "react";
import PortalLayout from "@/components/PortalLayout";
import { 
  FiEdit2 as FiEditIcon, 
  FiTrash2 as FiTrashIcon, 
  FiPlus as FiPlusIcon, 
  FiX as FiXIcon, 
  FiSearch as FiSearchIcon, 
  FiFilter as FiFilterIcon, 
  FiCheck as FiCheckIcon,
  FiExternalLink as FiExternalLinkIcon
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { FcFolder, FcDocument, FcVideoFile, FcLink, FcAudioFile, FcReadingEbook, FcDataSheet } from "react-icons/fc";
import Swal from "sweetalert2";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/superadmin/academics`;

/* ────────────────────────────────────────────────────────────
   Flaticon (uicons) glyph helper
   Every icon uses the standard CSS class `fi fi-rr-*`
──────────────────────────────────────────────────────────── */
const Fi = ({ name, className = "", style = {} }: { name: string; className?: string; style?: React.CSSProperties }) => (
  <i className={`fi fi-rr-${name} inline-flex items-center justify-center leading-none ${className}`} style={style} />
);

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
  subject?: Subject;
}

const CATEGORIES = [
  { key: "overview", label: "Overview", icon: "apps", gradient: "linear-gradient(135deg, #64748b, #475569)", blurb: "Review pending approvals and school metrics" },
  { key: "subjects", label: "Class Subjects", icon: "graduation-cap", gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)", blurb: "Configure subjects, sections, mediums & teachers" },
  { key: "syllabus", label: "Syllabus", icon: "book-alt", gradient: "linear-gradient(135deg, #10b981, #059669)", blurb: "Term-wise unit maps with lesson tracking" },
  { key: "textbooks", label: "Textbooks", icon: "book", gradient: "linear-gradient(135deg, #f59e0b, #d97706)", blurb: "Official Samacheer Kalvi textbooks & eBooks" },
  { key: "materials", label: "Study Materials", icon: "document", gradient: "linear-gradient(135deg, #3b82f6, #0284c7)", blurb: "Question banks, model papers & worksheets" },
  { key: "notes", label: "Teacher Notes", icon: "notebook", gradient: "linear-gradient(135deg, #ec4899, #e11d48)", blurb: "Class guides and revision notes shared by teachers" },
  { key: "videos", label: "Video Lessons", icon: "play-alt", gradient: "linear-gradient(135deg, #ef4444, #ea580c)", blurb: "Recorded lecture videos & tutorial lessons" },
  { key: "digital", label: "Digital Content", icon: "computer", gradient: "linear-gradient(135deg, #a855f7, #6366f1)", blurb: "Interactive labs, audio files & simulator links" },
  { key: "reference", label: "Reference Materials", icon: "books", gradient: "linear-gradient(135deg, #06b6d4, #0891b2)", blurb: "Reference handbooks, board rules & glossaries" },
];

const RESOURCE_TYPES = ["PDF", "DOC", "Video", "Audio", "Interactive", "eBook", "Link"];

const ALL_SUBJECTS = [
  "Tamil", "English", "Mathematics", "Science", "Social Science", "Physics", "Chemistry", "Biology",
  "Computer Science", "Botany", "Zoology", "Commerce", "Accountancy", "Economics", "History",
  "Geography", "Physical Education", "Environmental Science", "Moral Science", "General Knowledge"
];

const TYPE_ICONS: Record<string, string> = {
  PDF: "document",
  DOC: "document",
  Video: "video-camera",
  Audio: "headset",
  Interactive: "cursor-finger",
  eBook: "book",
  Link: "globe",
};

const TYPE_COLORS: Record<string, string> = {
  PDF: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  DOC: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Video: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  Audio: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Interactive: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  eBook: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Link: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
};

export default function SuperadminAcademicsPage() {
  const [activeTab, setActiveTab] = useState("overview");
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
  const [selectedSubject, setSelectedSubject] = useState("All");

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
    fetchResources();
  }, []);

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

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/resources?_t=${Date.now()}`);
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

    const payload = {
      ...subjectForm,
      color: subjectForm.color || "#6366f1",
      icon: subjectForm.icon || "📚"
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete all related resources.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });
    if (!result.isConfirmed) return;

    try {
      await fetch(`${API_BASE}/subjects/${id}`, { method: "DELETE" });
      fetchSubjects();
      fetchResources();
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
        category: activeTab === "overview" ? (resourceForm.contentType || "materials") : activeTab,
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
      fetchResources();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteResource = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This resource will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });
    if (!result.isConfirmed) return;

    try {
      await fetch(`${API_BASE}/resources/${id}`, { method: "DELETE" });
      fetchResources();
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
        title: "", subjectId: subjects[0]?.id || "", type: "PDF", url: "", meta: "", description: "", addedBy: "Super Admin",
        class: filterClass || "", section: filterSection || "", group: "", term: "", chapterNumber: "", topicName: "",
        learningOutcomes: "", medium: "", bookVersion: "", publisher: "", language: "",
        coverImage: "", materialType: "", downloadAllowed: true, chapter: "", lessonTitle: "",
        youtubeUrl: "", videoDuration: "", thumbnail: "", contentType: "materials", author: "", isbn: "", status: "Active", attachmentType: "Link"
      });
    }
    setError("");
    setShowResourceModal(true);
  };

  // --- Calculations for Hero Banner Stats & Rails ---
  const stats = useMemo(() => {
    const filteredSubs = subjects.filter(sub => {
      const matchClass = filterClass ? sub.class === String(filterClass) : true;
      const matchSection = filterSection ? sub.section === filterSection : true;
      return matchClass && matchSection;
    });

    const filteredRes = resources.filter(res => {
      const matchClass = filterClass ? res.class === String(filterClass) : true;
      const matchSection = filterSection ? res.section === filterSection : true;
      return matchClass && matchSection;
    });

    const videosCount = filteredRes.filter(res => res.category === "videos" || res.type === "Video").length;

    return {
      subjects: filteredSubs.length,
      resources: filteredRes.length,
      videos: videosCount,
    };
  }, [subjects, resources, filterClass, filterSection]);

  const railSubjects = useMemo(() => {
    const classFiltered = subjects.filter(s => filterClass ? s.class === String(filterClass) : true);
    const uniqueNames = Array.from(new Set(classFiltered.map(s => s.name)));
    return uniqueNames.map(name => {
      const found = subjects.find(s => s.name === name);
      return {
        name,
        color: found?.color || "#6366f1",
        icon: found?.icon || "📚",
      };
    });
  }, [subjects, filterClass]);

  const countByCategory = (key: string) => {
    if (key === "subjects") {
      return subjects.filter(s => {
        const matchClass = filterClass ? s.class === String(filterClass) : true;
        const matchSection = filterSection ? s.section === filterSection : true;
        return matchClass && matchSection;
      }).length;
    }
    return resources.filter(r => {
      if (r.category !== key) return false;
      const matchClass = filterClass ? r.class === String(filterClass) : true;
      const matchSection = filterSection ? r.section === filterSection : true;
      const resSubName = subjects.find(s => s.id === r.subjectId)?.name || "General";
      const matchRail = selectedSubject === "All" ? true : resSubName === selectedSubject;
      return matchClass && matchSection && matchRail;
    }).length;
  };

  // --- Filtered lists for the tabs ---
  const filteredSubjects = useMemo(() => {
    return subjects.filter(sub => {
      const matchSearch = searchQuery.trim() ? sub.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
      const matchClass = filterClass ? sub.class === String(filterClass) : true;
      const matchSection = filterSection ? sub.section === filterSection : true;
      const matchStatus = statusFilter === "All" ? true : sub.status === statusFilter;
      const matchRail = selectedSubject === "All" ? true : sub.name === selectedSubject;
      return matchSearch && matchClass && matchSection && matchStatus && matchRail;
    });
  }, [subjects, searchQuery, filterClass, filterSection, statusFilter, selectedSubject]);

  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      if (activeTab !== "overview" && activeTab !== "subjects" && res.category !== activeTab) return false;
      const matchSearch = searchQuery.trim() ? (
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (res.description && res.description.toLowerCase().includes(searchQuery.toLowerCase()))
      ) : true;
      const matchClass = filterClass ? res.class === String(filterClass) : true;
      const matchSection = filterSection ? res.section === filterSection : true;
      const matchStatus = statusFilter === "All" ? true : res.status === statusFilter;
      const resSubName = subjects.find(s => s.id === res.subjectId)?.name || "General";
      const matchRail = selectedSubject === "All" ? true : resSubName === selectedSubject;
      return matchSearch && matchClass && matchSection && matchStatus && matchRail;
    });
  }, [resources, subjects, activeTab, searchQuery, filterClass, filterSection, statusFilter, selectedSubject]);

  // Global search resources across ALL categories (when on Overview page)
  const globalSearchedResources = useMemo(() => {
    if (!searchQuery.trim() || activeTab !== "overview") return [];
    const query = searchQuery.trim().toLowerCase();
    return resources.filter(res => {
      const matchSearch = res.title.toLowerCase().includes(query) ||
        (res.description && res.description.toLowerCase().includes(query)) ||
        res.category.toLowerCase().includes(query);
      const matchClass = filterClass ? res.class === String(filterClass) : true;
      const matchSection = filterSection ? res.section === filterSection : true;
      const matchStatus = statusFilter === "All" ? true : res.status === statusFilter;
      const resSubName = subjects.find(s => s.id === res.subjectId)?.name || "General";
      const matchRail = selectedSubject === "All" ? true : resSubName === selectedSubject;
      return matchSearch && matchClass && matchSection && matchStatus && matchRail;
    });
  }, [resources, subjects, activeTab, searchQuery, filterClass, filterSection, statusFilter, selectedSubject]);

  const subjectTheme = (name: string) => {
    const found = subjects.find(s => s.name === name);
    return {
      name,
      color: found?.color || "#6366f1",
      gradient: `from-[${found?.color || '#6366f1'}] to-slate-600`,
      icon: found?.icon || "📚",
    };
  };

  return (
    <PortalLayout
      title="Super Admin Academics Hub"
      subtitle="Verify, edit and approve class subjects, syllabus, lecture notes and study resources."
      themeClass="theme-super-admin"
    >
      <div className="space-y-6">
        
        {/* ── Hero Banner ─────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 p-6 md:p-8 shadow-xl">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-fuchsia-400/20 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 justify-between text-left">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center" style={{ color: "#ffffff" }}>
                  <Fi name="graduation-cap" className="text-xl" style={{ color: "#ffffff" }} />
                </span>
                <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: "rgba(255, 255, 255, 0.85)" }}>
                  {filterClass ? `Class ${filterClass}` : "All Classes"} · Tamil Nadu State Board
                </span>
              </div>
              <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: "#ffffff" }}>
                Academics & Subjects Hub
              </div>
              <p className="text-sm max-w-xl leading-relaxed" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                Review class subjects, term plans, textbooks, learning notes, mock-tests and educational media. Manage teacher uploads and curriculum alignment.
              </p>
            </div>
            
            {/* Stats count boxes */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
              {[
                { label: "Subjects", value: stats.subjects, icon: "graduation-cap" },
                { label: "Resources", value: stats.resources, icon: "document" },
                { label: "Videos", value: stats.videos, icon: "play-alt" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="backdrop-blur rounded-2xl px-4 py-3 text-center border transition-all bg-white/15 border-white/20"
                >
                  <Fi name={s.icon} className="text-sm mx-auto mb-1" style={{ color: "rgba(255, 255, 255, 0.8)" }} />
                  <div className="text-xl font-black leading-none" style={{ color: "#ffffff" }}>
                    {s.value}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: "rgba(255, 255, 255, 0.75)" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Subject Filter Rail ─────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none scroll-smooth">
          <button
            onClick={() => setSelectedSubject("All")}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all active:scale-95 ${
              selectedSubject === "All"
                ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-400"
            }`}
          >
            <Fi name="apps" className="text-sm" /> All Subjects
          </button>
          {railSubjects.map((s) => {
            const active = selectedSubject === s.name;
            return (
              <button
                key={s.name}
                onClick={() => setSelectedSubject(active ? "All" : s.name)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                  active ? "text-white shadow-md" : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:shadow"
                }`}
                style={
                  active
                    ? { backgroundColor: s.color, borderColor: s.color }
                    : { borderColor: `${s.color}55` }
                }
              >
                <span>{s.icon}</span> {s.name}
              </button>
            );
          })}
        </div>

        {/* ── Category Tabs ───────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-1.5 flex gap-1 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((c) => {
            const active = activeTab === c.key;
            const count = (c.key === "overview" || c.key === "subjects" || c.key === "syllabus") ? null : countByCategory(c.key);
            
            return (
              <button
                key={c.key}
                onClick={() => setActiveTab(c.key)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  active
                    ? `text-white shadow-md`
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                style={active ? { background: c.gradient } : undefined}
              >
                <Fi name={c.icon} className="text-sm" />
                {c.label}
                {count !== null && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                      active ? "bg-white/25" : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Toolbar: Search, Filters & Add Button ───────── */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm">
          {/* Left search */}
          <div className="relative w-full md:flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <FiSearchIcon className="text-sm" />
            </span>
            <input
              type="text"
              placeholder={`Search ${CATEGORIES.find((c) => c.key === activeTab)?.label.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-955 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-700 dark:text-slate-200 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <FiXIcon className="text-sm" />
              </button>
            )}
          </div>

          {/* Filters & Add Action */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold bg-slate-55 dark:bg-slate-955 outline-none text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Approved</option>
              <option value="Inactive">Rejected</option>
            </select>

            {/* Class Filter */}
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold bg-slate-55 dark:bg-slate-955 outline-none text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Classes</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={String(i + 1)}>Class {i + 1}</option>
              ))}
            </select>

            {/* Section Filter */}
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold bg-slate-55 dark:bg-slate-955 outline-none text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Sections</option>
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(s => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>

            {/* Clear Button */}
            {(filterClass || filterSection || statusFilter !== "All" || selectedSubject !== "All" || searchQuery) && (
              <button
                onClick={() => {
                  setFilterClass("");
                  setFilterSection("");
                  setStatusFilter("All");
                  setSelectedSubject("All");
                  setSearchQuery("");
                }}
                className="p-2 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                title="Clear Filters"
              >
                Clear
              </button>
            )}

            {/* Add Subject/Resource Button */}
            {activeTab !== "overview" && (
              <button
                onClick={() => (activeTab === "subjects" ? openSubjectModal() : openResourceModal())}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg active:scale-95 transition-all ml-auto md:ml-0"
              >
                <FiPlusIcon className="text-sm" />
                Add {CATEGORIES.find(c => c.key === activeTab)?.label}
              </button>
            )}
          </div>
        </div>

        {/* ══ CONTENT PANELS ════════════════════════════════ */}
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <motion.div layout className="min-h-[400px]">
            
            {/* ══ OVERVIEW TAB ═══════════════════════════════ */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                
                {/* Search Results Combined View (If user entered a search query) */}
                {searchQuery.trim() !== "" ? (
                  <div className="space-y-6 text-left">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
                        Search Results for "{searchQuery}"
                      </h3>
                      <button 
                        onClick={() => setSearchQuery("")}
                        className="text-xs text-indigo-500 hover:text-indigo-600 font-bold"
                      >
                        Clear Search
                      </button>
                    </div>

                    {/* Matching Subjects Section */}
                    {filteredSubjects.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                          Matching Subjects ({filteredSubjects.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {filteredSubjects.map(sub => (
                            <div
                              key={sub.id}
                              onClick={() => { setActiveTab("subjects"); }}
                              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm hover:shadow hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 shadow-sm"
                                  style={{
                                    background: `linear-gradient(135deg, ${sub.color || "#6366f1"}, ${sub.color || "#6366f1"}cc)`,
                                    color: "#fff"
                                  }}
                                >
                                  {sub.icon || "📚"}
                                </div>
                                <div className="truncate">
                                  <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{sub.name}</h5>
                                  <p className="text-[10px] text-slate-400 mt-0.5">Class {sub.class || "All"} · {sub.medium || "English"}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matching Resources Section */}
                    {globalSearchedResources.length > 0 ? (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                          Matching Resources ({globalSearchedResources.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {globalSearchedResources.map(res => {
                            const subInfo = subjects.find(s => s.id === res.subjectId);
                            const subName = subInfo?.name || "General";
                            const t = subjectTheme(subName);
                            
                            return (
                              <div
                                key={res.id}
                                onClick={() => { setActiveTab(res.category); }}
                                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 flex flex-col justify-between overflow-hidden transition-all cursor-pointer"
                              >
                                <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-3xl opacity-5" style={{ backgroundColor: t.color }} />
                                <div>
                                  <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${TYPE_COLORS[res.type] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                      <Fi name={TYPE_ICONS[res.type] || "document"} className="text-lg" />
                                    </div>
                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full border bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                                      {res.category.toUpperCase()}
                                    </span>
                                  </div>
                                  <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate mb-1">{res.title}</h5>
                                  <p className="text-[10px] text-slate-400 flex flex-wrap gap-x-2 gap-y-0.5 mb-2">
                                    <span className="font-semibold text-slate-500">{subName}</span>
                                    {res.class && <span>· Class {res.class}</span>}
                                    {res.type && <span>· {res.type}</span>}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{res.description}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      filteredSubjects.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                          <FiSearchIcon className="text-3xl text-slate-400 mb-2 animate-pulse" />
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No results found</p>
                          <p className="text-xs text-slate-500 mt-1">We couldn't find any subjects or resources matching "{searchQuery}".</p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <>
                    {/* Categories Overview Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                      {CATEGORIES.filter((c) => c.key !== "overview").map((c) => {
                        const count = countByCategory(c.key);
                        return (
                          <button
                            key={c.key}
                            onClick={() => setActiveTab(c.key)}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:-translate-y-1 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col"
                          >
                            <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: c.gradient }} />
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg mb-3 group-hover:scale-110 transition-transform" style={{ background: c.gradient, color: "#ffffff" }}>
                              <Fi name={c.icon} className="text-xl" style={{ color: "#ffffff" }} />
                            </div>
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                              {c.label}
                              <Fi name="arrow-small-right" className="text-sm opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3 flex-1">{c.blurb}</p>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              {count} {c.key === "subjects" ? "subjects" : c.key === "syllabus" ? "units" : "items"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

              </div>
            )}

            {/* ══ CLASS SUBJECTS TAB ═══════════════════════════ */}
            {activeTab === "subjects" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                <AnimatePresence>
                  {filteredSubjects.map((sub, idx) => (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.04 }}
                      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 flex flex-col justify-between transition-all text-left"
                    >
                      {/* Top Corner Details */}
                      <div className="flex justify-between items-start mb-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow animate-fade-in"
                          style={{
                            background: `linear-gradient(135deg, ${sub.color || "#6366f1"}, ${sub.color || "#6366f1"}cc)`,
                            color: "#fff"
                          }}
                        >
                          {sub.icon || "📚"}
                        </div>
                        
                        {/* Status Label Badge */}
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                          sub.status === "Active" 
                            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/50" 
                            : sub.status === "Inactive"
                            ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/50"
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50"
                        }`}>
                          {sub.status === "Active" ? "APPROVED" : sub.status === "Inactive" ? "REJECTED" : "PENDING"}
                        </span>
                      </div>

                      {/* Header content */}
                      <div>
                        <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">{sub.name}</h3>
                        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
                          Class {sub.class || "All"} {sub.section ? `· Sec ${sub.section}` : ""}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                          {sub.description || "No description provided for this subject."}
                        </p>
                      </div>

                      {/* Metadata Details & Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                          {sub.subjectCode && <span>Code: {sub.subjectCode}</span>}
                          {sub.medium && <span className="block mt-0.5">{sub.medium} Medium</span>}
                        </div>
                        
                        {/* Interactive operations */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openSubjectModal(sub)}
                            className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500 hover:text-white text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEditIcon size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(sub.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-600 dark:text-red-400 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrashIcon size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredSubjects.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                    <FcFolder className="text-5xl mb-3 grayscale opacity-50" />
                    <p className="text-base font-bold text-slate-800 dark:text-slate-200">No subjects matching filters</p>
                    <p className="text-xs text-slate-500 mt-1">Clear your search filters or click 'Add Class Subjects' to add a subject.</p>
                  </div>
                )}
              </div>
            )}

            {/* ══ GENERAL RESOURCES TABS ══════════════════════ */}
            {activeTab !== "overview" && activeTab !== "subjects" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {filteredResources.map((res, idx) => {
                    const subInfo = subjects.find(s => s.id === res.subjectId);
                    const subName = subInfo?.name || "General";
                    const t = subjectTheme(subName);
                    
                    return (
                      <motion.div
                        key={res.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.03 }}
                        className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 flex flex-col justify-between relative overflow-hidden transition-all text-left"
                      >
                        {/* Subject blur overlay background */}
                        <div
                          className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-5 group-hover:opacity-15 transition-opacity"
                          style={{ backgroundColor: t.color }}
                        />

                        {/* Top layout line */}
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${TYPE_COLORS[res.type] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                              <Fi name={TYPE_ICONS[res.type] || "document"} className="text-xl" />
                            </div>
                            
                            <div className="flex items-center gap-1.5">
                              {/* Status Badge */}
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                                res.status === "Active"
                                  ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/50"
                                  : res.status === "Inactive"
                                  ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/50"
                                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50"
                              }`}>
                                {res.status === "Active" ? "APPROVED" : res.status === "Inactive" ? "REJECTED" : "PENDING"}
                              </span>
                            </div>
                          </div>

                          {/* Category and Subject Badges */}
                          <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            <span
                              className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: `${t.color}1a`, color: t.color }}
                            >
                              {t.icon} {subName}
                            </span>
                            
                            {res.class && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                                Class {res.class} {res.section ? `· Sec ${res.section}` : ""}
                              </span>
                            )}
                            {res.term && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                                {res.term}
                              </span>
                            )}
                            {res.type && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                                {res.type}
                              </span>
                            )}
                          </div>

                          {/* Titles */}
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug mb-1">
                            {res.title}
                          </h3>
                          
                          {/* Syllabus Custom Information */}
                          {res.category === "syllabus" && (
                            <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold mb-1">
                              {res.chapterNumber && <span>Ch {res.chapterNumber}: </span>}
                              {res.topicName && <span>{res.topicName}</span>}
                              {res.learningOutcomes && (
                                <p className="text-[10px] text-slate-400 font-normal leading-relaxed mt-1">
                                  Outcomes: {res.learningOutcomes}
                                </p>
                              )}
                            </div>
                          )}

                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
                            {res.description || "No description provided for this resource."}
                          </p>
                        </div>

                        {/* Bottom line: details & admin operations */}
                        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <Fi name="clock" className="text-xs" /> {res.meta || "N/A"}
                            {res.addedBy && <span> · By {res.addedBy}</span>}
                          </span>

                          <div className="flex gap-1">
                            <button
                              onClick={() => openResourceModal(res)}
                              className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500 hover:text-white text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors"
                              title="Edit Details"
                            >
                              <FiEditIcon size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteResource(res.id)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-600 dark:text-red-400 rounded-lg transition-colors"
                              title="Delete permanently"
                            >
                              <FiTrashIcon size={13} />
                            </button>
                            {res.url && (
                              <a
                                href={res.url.startsWith("/") ? `${API_BASE.replace('/api/superadmin/academics', '')}${res.url}` : res.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 bg-slate-500/10 hover:bg-slate-500 hover:text-white text-slate-600 dark:text-slate-400 rounded-lg transition-colors flex items-center justify-center"
                                title="Open Link"
                              >
                                <FiExternalLinkIcon size={13} />
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {filteredResources.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center">
                    <FcDocument className="text-5xl mb-3 grayscale opacity-50" />
                    <p className="text-base font-bold text-slate-800 dark:text-slate-200">No resources found</p>
                    <p className="text-xs text-slate-500 mt-1">Clear your filter criteria or click 'Add' to upload curriculum materials.</p>
                  </div>
                )}
              </div>
            )}

          </motion.div>
        )}

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
              className="bg-white dark:bg-[#121824] w-full max-w-md rounded-[2rem] shadow-2xl overflow-visible relative z-10 border border-slate-100 dark:border-slate-800/80"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/60">
                <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100">
                  {editSubjectId ? "Edit Subject" : "Add Subject"}
                </h3>
                <button onClick={() => setShowSubjectModal(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                  <FiXIcon className="text-xl" />
                </button>
              </div>
              <form onSubmit={handleSaveSubject} className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto custom-scrollbar text-left font-sans">
                {error && <div className="text-red-500 text-sm bg-red-50/80 p-3 rounded-xl">{error}</div>}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Class *</label>
                    <select required value={subjectForm.class} onChange={e => setSubjectForm({ ...subjectForm, class: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none">
                      <option value="">Select Class</option>
                      {[...Array(12)].map((_, i) => <option key={i} value={String(i + 1)}>Class {i + 1}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Section (Optional)</label>
                    <select value={subjectForm.section} onChange={e => setSubjectForm({ ...subjectForm, section: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none">
                      <option value="">Any</option>
                      {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Subject Name *</label>
                    <div onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 cursor-pointer flex justify-between items-center outline-none">
                      <span className={subjectForm.name ? "" : "text-slate-400"}>{subjectForm.name || "Select"}</span>
                      <span className="text-xs text-slate-400">▼</span>
                    </div>
                    <AnimatePresence>
                      {isSubjectDropdownOpen && (
                        <motion.div className="absolute z-55 w-full mt-1 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                          {ALL_SUBJECTS.map((subject) => (
                            <div key={subject} onClick={() => { setSubjectForm({ ...subjectForm, name: subject }); setIsSubjectDropdownOpen(false); }} className="px-4 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-200 font-medium border-b border-slate-100 dark:border-slate-800/40">{subject}</div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Subject Code</label>
                    <input type="text" value={subjectForm.subjectCode} onChange={e => setSubjectForm({ ...subjectForm, subjectCode: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Medium</label>
                    <select value={subjectForm.medium} onChange={e => setSubjectForm({ ...subjectForm, medium: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none">
                      <option value="">Select Medium</option>
                      <option value="Tamil">Tamil</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Status</label>
                    <select value={subjectForm.status} onChange={e => setSubjectForm({ ...subjectForm, status: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none">
                      <option value="Active">Approved (Active)</option>
                      <option value="Inactive">Rejected (Inactive)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Color Theme</label>
                    <input type="color" value={subjectForm.color} onChange={e => setSubjectForm({ ...subjectForm, color: e.target.value })} className="w-full h-10 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 cursor-pointer outline-none p-1" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Emoji Icon</label>
                    <input type="text" placeholder="📚" value={subjectForm.icon} onChange={e => setSubjectForm({ ...subjectForm, icon: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description</label>
                  <textarea rows={2} value={subjectForm.description} onChange={e => setSubjectForm({ ...subjectForm, description: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none resize-none"></textarea>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setShowSubjectModal(false)} className="px-5 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-bold transition-colors">Save Subject</button>
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
              className="bg-white dark:bg-[#121824] w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto relative z-10 border border-slate-100 dark:border-slate-800/80"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/60 sticky top-0 bg-white/80 dark:bg-[#121824]/80 backdrop-blur-md z-20">
                <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100">
                  {editResourceId ? `Edit ${CATEGORIES.find(t => t.key === activeTab)?.label}` : `Add ${CATEGORIES.find(t => t.key === activeTab)?.label}`}
                </h3>
                <button onClick={() => setShowResourceModal(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                  <FiXIcon className="text-xl" />
                </button>
              </div>
              
              <form onSubmit={handleSaveResource} className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto custom-scrollbar text-left font-sans">
                {error && <div className="text-red-500 text-sm bg-red-50/80 p-3 rounded-xl">{error}</div>}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Class *</label>
                    <select required value={resourceForm.class} onChange={e => setResourceForm({ ...resourceForm, class: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none">
                      <option value="">Select Class</option>
                      {[...Array(12)].map((_, i) => <option key={i} value={String(i + 1)}>Class {i + 1}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Subject *</label>
                    <select required value={resourceForm.subjectId} onChange={e => setResourceForm({ ...resourceForm, subjectId: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none">
                      <option value="" disabled>Select subject</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name} (Class {s.class})</option>)}
                    </select>
                  </div>
                </div>

                {/* Category Selection inside Overview */}
                {activeTab === "overview" && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Target Category *</label>
                    <select required value={resourceForm.contentType || "materials"} onChange={e => setResourceForm({ ...resourceForm, contentType: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none">
                      {CATEGORIES.filter(c => c.key !== "overview" && c.key !== "subjects").map(c => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Dynamic Fields Based on activeTab */}
                {activeTab === "syllabus" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Term</label>
                        <select value={resourceForm.term} onChange={e => setResourceForm({ ...resourceForm, term: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none">
                          <option value="">Select Term</option>
                          <option value="Term 1">Term 1</option>
                          <option value="Term 2">Term 2</option>
                          <option value="Term 3">Term 3</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Unit / Chapter</label>
                        <input type="text" value={resourceForm.chapter} onChange={e => setResourceForm({ ...resourceForm, chapter: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Chapter Number</label>
                        <input type="text" value={resourceForm.chapterNumber} onChange={e => setResourceForm({ ...resourceForm, chapterNumber: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Topic Name</label>
                        <input type="text" value={resourceForm.topicName} onChange={e => setResourceForm({ ...resourceForm, topicName: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Learning Outcomes</label>
                      <textarea rows={2} value={resourceForm.learningOutcomes} onChange={e => setResourceForm({ ...resourceForm, learningOutcomes: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none resize-none"></textarea>
                    </div>
                  </>
                )}

                {activeTab === "textbooks" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Book Title *</label>
                        <input required type="text" value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Medium</label>
                        <select value={resourceForm.medium} onChange={e => setResourceForm({ ...resourceForm, medium: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none">
                          <option value="">Select Medium</option>
                          <option value="Tamil">Tamil</option>
                          <option value="English">English</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Version / Edition</label>
                        <input type="text" value={resourceForm.bookVersion} onChange={e => setResourceForm({ ...resourceForm, bookVersion: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Publisher</label>
                        <input type="text" value={resourceForm.publisher} onChange={e => setResourceForm({ ...resourceForm, publisher: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" placeholder="SCERT / NCERT" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Language</label>
                        <input type="text" value={resourceForm.language} onChange={e => setResourceForm({ ...resourceForm, language: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Cover Image URL</label>
                        <input type="text" value={resourceForm.coverImage} onChange={e => setResourceForm({ ...resourceForm, coverImage: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "materials" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Material Title *</label>
                        <input required type="text" value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Material Type</label>
                        <select value={resourceForm.materialType} onChange={e => setResourceForm({ ...resourceForm, materialType: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none">
                          <option value="">Select Type</option>
                          <option value="PDF">PDF</option>
                          <option value="PPT">PPT</option>
                          <option value="DOC">DOC</option>
                          <option value="Worksheet">Worksheet</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input type="checkbox" checked={resourceForm.downloadAllowed} onChange={e => setResourceForm({ ...resourceForm, downloadAllowed: e.target.checked })} className="rounded text-indigo-600 focus:ring-indigo-500/50" />
                        Download Allowed
                      </label>
                    </div>
                  </>
                )}

                {activeTab === "notes" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Chapter</label>
                        <input type="text" value={resourceForm.chapter} onChange={e => setResourceForm({ ...resourceForm, chapter: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Lesson Title *</label>
                        <input required type="text" value={resourceForm.lessonTitle} onChange={e => setResourceForm({ ...resourceForm, lessonTitle: e.target.value, title: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "videos" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Chapter</label>
                        <input type="text" value={resourceForm.chapter} onChange={e => setResourceForm({ ...resourceForm, chapter: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Video Title *</label>
                        <input required type="text" value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">YouTube URL</label>
                        <input type="text" value={resourceForm.youtubeUrl} onChange={e => setResourceForm({ ...resourceForm, youtubeUrl: e.target.value, url: e.target.value, type: "Video" })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Duration</label>
                        <input type="text" value={resourceForm.videoDuration} onChange={e => setResourceForm({ ...resourceForm, videoDuration: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" placeholder="e.g. 15 Mins" />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "digital" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Content Title *</label>
                        <input required type="text" value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Content Type</label>
                        <select value={resourceForm.contentType} onChange={e => setResourceForm({ ...resourceForm, contentType: e.target.value, type: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none">
                          <option value="">Select Type</option>
                          <option value="PDF">PDF</option>
                          <option value="Video">Video</option>
                          <option value="Audio">Audio</option>
                          <option value="Interactive">Interactive</option>
                          <option value="Presentation">Presentation</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "reference" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Reference Title *</label>
                        <input required type="text" value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Author</label>
                        <input type="text" value={resourceForm.author} onChange={e => setResourceForm({ ...resourceForm, author: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Publisher</label>
                        <input type="text" value={resourceForm.publisher} onChange={e => setResourceForm({ ...resourceForm, publisher: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">ISBN (Optional)</label>
                        <input type="text" value={resourceForm.isbn} onChange={e => setResourceForm({ ...resourceForm, isbn: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                    </div>
                  </>
                )}

                {/* Common Fields */}
                {activeTab === "syllabus" ? (
                  <input type="hidden" value={resourceForm.title} />
                ) : null}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Attachment Type</label>
                    <select value={resourceForm.attachmentType || "Link"} onChange={e => setResourceForm({ ...resourceForm, attachmentType: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none">
                      <option value="Link">Link (URL)</option>
                      <option value="Upload">File Upload</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Status</label>
                    <select value={resourceForm.status} onChange={e => setResourceForm({ ...resourceForm, status: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none">
                      <option value="Active">Approved (Active)</option>
                      <option value="Inactive">Rejected (Inactive)</option>
                    </select>
                  </div>
                </div>

                <div>
                  {resourceForm.attachmentType === "Upload" ? (
                    <>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Upload File</label>
                      <div className="relative w-full px-4 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-955 cursor-pointer overflow-hidden min-h-[48px]">
                        <input type="file" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          setResourceForm(prev => ({ ...prev, url: "Uploading..." }));
                          
                          const formData = new FormData();
                          formData.append("file", file);
                          
                          try {
                            const res = await fetch(`${API_BASE}/upload`, {
                              method: "POST",
                              body: formData
                            });
                            
                            if (!res.ok) {
                              throw new Error("Upload failed");
                            }
                            
                            const data = await res.json();
                            if (data.url) {
                              setResourceForm(prev => ({ ...prev, url: data.url }));
                            }
                          } catch (err) {
                            console.error(err);
                            alert("File upload failed. Defaulting to local path.");
                            setResourceForm(prev => ({ ...prev, url: `/uploads/${file.name}` }));
                          }
                        }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <span className="text-xs text-slate-500 font-medium">
                          {resourceForm.url === "Uploading..." ? "Uploading..." : (resourceForm.url && resourceForm.url.startsWith('/uploads') ? '✓ ' + resourceForm.url.split('/').pop() : 'Click to Browse / Drag File')}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">URL / Link</label>
                      <input type="text" value={resourceForm.url} onChange={e => setResourceForm({ ...resourceForm, url: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none" placeholder="https://..." />
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description</label>
                  <textarea rows={2} value={resourceForm.description} onChange={e => setResourceForm({ ...resourceForm, description: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-200 outline-none resize-none"></textarea>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setShowResourceModal(false)} className="px-5 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-bold transition-colors">
                    Save {CATEGORIES.find(t => t.key === activeTab)?.label}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </PortalLayout>
  );
}
