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
import { getSession } from "next-auth/react";
import Swal from "sweetalert2";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/superadmin/academics`;

const authFetch = async (url: string, init: RequestInit = {}) => {
  const session = await getSession();
  const token = (session?.user as any)?.backendToken as string | undefined;
  const headers = new Headers(init?.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(url, { ...init, headers });
};

const getFileUrl = (url?: string) => {
  if (!url || url === "#") return "#";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:") || url.startsWith("data:")) return url;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  return url.startsWith("/") ? `${API_URL}${url}` : `${API_URL}/${url}`;
};

const getYouTubeEmbedUrl = (url?: string) => {
  if (!url) return "";
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
    }
  } catch {}
  return url;
};

/* ────────────────────────────────────────────────────────────
   Flaticon (uicons) glyph helper
   Every icon uses the standard CSS class `fi fi-rr-*`
──────────────────────────────────────────────────────────── */
const Fi = ({ name, className = "", style = {} }: { name: string; className?: string; style?: React.CSSProperties }) => (
  <i className={`fi fi-rr-${name} inline-flex items-center justify-center leading-none ${className}`} style={style} />
);

const SYLLABUS_CLASSES = [
  { id: "6", name: "Class 6", badge: "SSLC" },
  { id: "7", name: "Class 7", badge: "SSLC" },
  { id: "8", name: "Class 8", badge: "SSLC" },
  { id: "9", name: "Class 9", badge: "SSLC" },
  { id: "10", name: "Class 10", badge: "SSLC" },
  { id: "11", name: "Class 11", badge: "HSC" },
  { id: "12", name: "Class 12", badge: "HSC" },
];

const getSubjectIcon = (name: string) => {
  if (!name) return "📙";
  const n = name.toLowerCase();
  if (n.includes("tamil")) return "📜";
  if (n.includes("english")) return "🗣️";
  if (n.includes("math")) return "📐";
  if (n.includes("physic")) return "⚡";
  if (n.includes("chem")) return "🧪";
  if (n.includes("botany")) return "🌿";
  if (n.includes("zoology") || n.includes("bio")) return "🧬";
  if (n.includes("science") && !n.includes("social")) return "🔬";
  if (n.includes("social") || n.includes("geograph") || n.includes("history")) return "🌍";
  if (n.includes("computer") || n.includes("tech")) return "💻";
  if (n.includes("commerce") || n.includes("account") || n.includes("business")) return "💼";
  if (n.includes("economic")) return "📈";
  if (n.includes("art") || n.includes("craft")) return "🎨";
  return "📙";
};

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

interface ClassItem {
  id: string;
  name: string;
  status?: string;
}

interface SectionItem {
  id: string;
  name: string;
  status?: string;
}

const CATEGORIES = [
  { key: "overview", label: "Overview", shortLabel: "Overview", icon: "apps", gradient: "linear-gradient(135deg, #64748b, #475569)", blurb: "Review pending approvals and school metrics" },
  { key: "structure", label: "Class & Structure Setup", shortLabel: "Structure", icon: "settings-sliders", gradient: "linear-gradient(135deg, #059669, #0d9488)", blurb: "Configure classes, sections, and master subjects" },
  { key: "subjects", label: "Class Subjects", shortLabel: "Subjects", icon: "graduation-cap", gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)", blurb: "Configure subjects, sections, mediums & teachers" },
  { key: "syllabus", label: "Syllabus", shortLabel: "Syllabus", icon: "book-alt", gradient: "linear-gradient(135deg, #10b981, #059669)", blurb: "Term-wise unit maps with lesson tracking" },
  { key: "textbooks", label: "Textbooks", shortLabel: "Textbooks", icon: "book", gradient: "linear-gradient(135deg, #f59e0b, #d97706)", blurb: "Official Samacheer Kalvi textbooks & eBooks" },
  { key: "materials", label: "Study Materials", shortLabel: "Materials", icon: "document", gradient: "linear-gradient(135deg, #3b82f6, #0284c7)", blurb: "Question banks, model papers & worksheets" },
  { key: "notes", label: "Teacher Notes", shortLabel: "Notes", icon: "notebook", gradient: "linear-gradient(135deg, #ec4899, #e11d48)", blurb: "Class guides and revision notes shared by teachers" },
  { key: "videos", label: "Video Lessons", shortLabel: "Videos", icon: "play-alt", gradient: "linear-gradient(135deg, #ef4444, #ea580c)", blurb: "Recorded lecture videos & tutorial lessons" },
  { key: "digital", label: "Digital Content", shortLabel: "Digital", icon: "computer", gradient: "linear-gradient(135deg, #a855f7, #6366f1)", blurb: "Interactive labs, audio files & simulator links" },
  { key: "reference", label: "Reference Materials", shortLabel: "Reference", icon: "books", gradient: "linear-gradient(135deg, #06b6d4, #0891b2)", blurb: "Reference handbooks, board rules & glossaries" },
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

const renderTypeIcon = (type?: string) => {
  const t = (type || "").toUpperCase();
  if (t === "PDF") return <FcDocument className="text-2xl" />;
  if (t === "VIDEO") return <FcVideoFile className="text-2xl" />;
  if (t === "AUDIO") return <FcAudioFile className="text-2xl" />;
  if (t === "EBOOK") return <FcReadingEbook className="text-2xl" />;
  if (t === "DOC" || t === "WORKSHEET" || t === "PPT" || t === "PRESENTATION") return <FcDataSheet className="text-2xl" />;
  if (t === "LINK" || t === "INTERACTIVE") return <FcLink className="text-2xl" />;
  return <FcFolder className="text-2xl" />;
};

export default function SuperadminAcademicsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Structure Popup Modal States
  const [structureModal, setStructureModal] = useState<{
    isOpen: boolean;
    type: "class" | "section" | "subject";
    editId?: string | null;
  }>({ isOpen: false, type: "class", editId: null });
  const [structureInput, setStructureInput] = useState("");
  const [savingStructure, setSavingStructure] = useState(false);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);

  // Drag and Drop reorder handlers
  const handleDropClass = (dragIdx: number, dropIdx: number) => {
    if (dragIdx === dropIdx) return;
    const updated = [...classes];
    const [moved] = updated.splice(dragIdx, 1);
    updated.splice(dropIdx, 0, moved);
    setClasses(updated);
  };

  const handleDropSection = (dragIdx: number, dropIdx: number) => {
    if (dragIdx === dropIdx) return;
    const updated = [...sections];
    const [moved] = updated.splice(dragIdx, 1);
    updated.splice(dropIdx, 0, moved);
    setSections(updated);
  };

  const handleDropSubject = (dragIdx: number, dropIdx: number) => {
    if (dragIdx === dropIdx) return;
    const updated = [...subjects];
    const [moved] = updated.splice(dragIdx, 1);
    updated.splice(dropIdx, 0, moved);
    setSubjects(updated);
  };

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
  const [selectedSubjectNames, setSelectedSubjectNames] = useState<string[]>([]);
  const [customSubjectInput, setCustomSubjectInput] = useState("");
  const [subjectSearchQuery, setSubjectSearchQuery] = useState("");

  // Syllabus Management Dedicated States
  const [syllabusClass, setSyllabusClass] = useState<string>("7");
  const [selectedSyllabusSubject, setSelectedSyllabusSubject] = useState<string>("Tamil");
  const [syllabusSearchQuery, setSyllabusSearchQuery] = useState<string>("");

  // Dedicated Chapter Modal States
  const [chapterModal, setChapterModal] = useState<{
    isOpen: boolean;
    editId?: string | null;
  }>({ isOpen: false, editId: null });

  const [chapterForm, setChapterForm] = useState({
    unitNo: "1",
    subunitNo: "1.1",
    title: "",
    subtopics: ""
  });

  const [subchaptersList, setSubchaptersList] = useState<Array<{ no: string; title: string }>>([
    { no: "1.1", title: "" }
  ]);

  const [savingChapter, setSavingChapter] = useState(false);
  const [parsingSyllabus, setParsingSyllabus] = useState(false);

  const openAddChapterModal = () => {
    const nextUnit = String(syllabusChapters.length + 1);
    setChapterForm({
      unitNo: nextUnit,
      subunitNo: `${nextUnit}.1`,
      title: "",
      subtopics: ""
    });
    setSubchaptersList([
      { no: `${nextUnit}.1`, title: "" }
    ]);
    setChapterModal({ isOpen: true, editId: null });
  };

  const openEditChapterModal = (ch: any) => {
    const uNo = ch.chapterNumber || "1";
    const desc = ch.description || "";
    const rawItems = desc.split(/•|\n/).map((s: string) => s.trim()).filter(Boolean);

    const parsedList = rawItems.length > 0
      ? rawItems.map((item: string, idx: number) => {
          const matchNo = item.match(/^(\d+\.\d+)\s*(.*)/);
          if (matchNo) {
            return { no: matchNo[1], title: matchNo[2] || item };
          }
          return { no: `${uNo}.${idx + 1}`, title: item };
        })
      : [{ no: `${uNo}.1`, title: "" }];

    setChapterForm({
      unitNo: uNo,
      subunitNo: ch.meta?.match(/\d+\.\d+/)?.[0] || `${uNo}.1`,
      title: ch.chapter || ch.title || "",
      subtopics: desc
    });
    setSubchaptersList(parsedList);
    setChapterModal({ isOpen: true, editId: ch.id });
  };

  const addSubchapterRow = () => {
    setSubchaptersList(prev => {
      const nextIdx = prev.length + 1;
      const unitPrefix = chapterForm.unitNo || "1";
      return [...prev, { no: `${unitPrefix}.${nextIdx}`, title: "" }];
    });
  };

  const removeSubchapterRow = (index: number) => {
    setSubchaptersList(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      const unitPrefix = chapterForm.unitNo || "1";
      return filtered.map((item, i) => ({
        ...item,
        no: `${unitPrefix}.${i + 1}`
      }));
    });
  };

  const [ocrPreviewModal, setOcrPreviewModal] = useState<{
    isOpen: boolean;
    units: Array<{ unitNo: string; title: string; subtopics: string[] }>;
  }>({
    isOpen: false,
    units: []
  });

  const [editingOcrIdx, setEditingOcrIdx] = useState<number | null>(null);

  const handleUploadAndParseSyllabusImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingSyllabus(true);
    Swal.fire({
      title: "AI Analyzing Syllabus Image...",
      text: "Extracting chapters, terms, and sub-chapters from textbook image...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Image = event.target?.result as string;
      try {
        const res = await fetch(`${API_BASE}/parse-syllabus-ai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64Image,
            mimeType: file.type
          })
        });
        
        const json = await res.json();
        if (!json.success || !json.data || json.data.length === 0) {
          throw new Error(json.error || "Could not extract readable text from image. Please ensure the textbook index image is clear.");
        }

        Swal.close();
        setOcrPreviewModal({
          isOpen: true,
          units: json.data.map((u: any, idx: number) => ({
             unitNo: String(idx + 1),
             title: u.title,
             subtopics: u.subtopics || []
          }))
        });
      } catch (err: any) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "AI Parsing Error",
          text: err?.message || "Could not parse image syllabus. Please try again with a clearer image."
        });
      } finally {
        setParsingSyllabus(false);
        e.target.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveOcrUnitsToDb = async () => {
    if (ocrPreviewModal.units.length === 0) return;

    setSavingChapter(true);
    try {
      const targetSub = subjects.find(s => s.name.toLowerCase() === selectedSyllabusSubject.toLowerCase());

      for (let i = 0; i < ocrPreviewModal.units.length; i++) {
        const item = ocrPreviewModal.units[i];
        await fetch(`${API_BASE}/resources`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: item.title,
            chapter: item.title,
            subjectId: targetSub?.id || (subjects.length > 0 ? subjects[0].id : ""),
            category: "syllabus",
            type: "PDF",
            class: syllabusClass,
            topicName: item.subtopics.length > 0 ? `${item.subtopics.length} Subunits` : "1 Topic",
            chapterNumber: item.unitNo || String(syllabusChapters.length + i + 1),
            description: item.subtopics.join(" • ") || item.title,
            meta: "AI OCR Parsed • Auto Extracted",
            status: "Active"
          })
        });
      }

      await fetchResources();
      setOcrPreviewModal({ isOpen: false, units: [] });
      Swal.fire({
        icon: "success",
        title: "Syllabus Saved Successfully!",
        text: `Saved ${ocrPreviewModal.units.length} units & sub-chapters directly to PostgreSQL!`
      });
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Save Error",
        text: err?.message || "Failed to save syllabus units."
      });
    } finally {
      setSavingChapter(false);
    }
  };

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterForm.title.trim()) return;

    setSavingChapter(true);
    try {
      const targetSub = subjects.find(s => s.name.toLowerCase() === selectedSyllabusSubject.toLowerCase());
      const isEdit = Boolean(chapterModal.editId);
      const endpoint = isEdit ? `${API_BASE}/resources/${chapterModal.editId}` : `${API_BASE}/resources`;
      const method = isEdit ? "PUT" : "POST";

      const validSubs = subchaptersList.filter(s => s.title.trim().length > 0);
      const formattedSubtopics = validSubs.length > 0
        ? validSubs.map(s => `${s.no} ${s.title.trim()}`).join(" • ")
        : chapterForm.subtopics;

      const payload = {
        title: chapterForm.title.trim(),
        chapter: chapterForm.title.trim(),
        subjectId: targetSub?.id || (subjects.length > 0 ? subjects[0].id : ""),
        category: "syllabus",
        type: "PDF",
        class: syllabusClass,
        topicName: `${validSubs.length || 1} Subunits`,
        chapterNumber: chapterForm.unitNo || String(syllabusChapters.length + 1),
        description: formattedSubtopics || chapterForm.title.trim(),
        meta: `Subunit ${chapterForm.subunitNo || `${chapterForm.unitNo}.1`} • Active`,
        status: "Active"
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to ${isEdit ? "update" : "save"} chapter`);
      }

      Swal.fire({
        title: isEdit ? "Chapter Updated!" : "Chapter Added!",
        text: `Unit ${chapterForm.unitNo} ("${chapterForm.title.trim()}") saved directly to PostgreSQL!`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });

      setChapterModal({ isOpen: false, editId: null });
      fetchResources();
    } catch (err: any) {
      Swal.fire({
        title: "Error!",
        text: err.message || "Failed to save chapter.",
        icon: "error"
      });
    } finally {
      setSavingChapter(false);
    }
  };

  const dynamicSyllabusClasses = useMemo(() => {
    if (classes.length > 0) {
      return classes.map(c => {
        const cleanVal = String(c.name).replace(/^Class\s+/i, '').trim();
        const badgeStr = parseInt(cleanVal) >= 11 ? "HSC" : "SSLC";
        return {
          id: cleanVal,
          name: c.name.startsWith("Class") ? c.name : `Class ${c.name}`,
          badge: badgeStr
        };
      });
    }
    return SYLLABUS_CLASSES;
  }, [classes]);

  const syllabusSubjectsForClass = useMemo(() => {
    const cleanSyllabusClass = String(syllabusClass).replace(/^Class\s+/i, '').trim();

    const dbSubs = subjects.filter(s => {
      if (!s.class) return false;
      const cVal = String(s.class).replace(/^Class\s+/i, '').trim();
      return cVal === cleanSyllabusClass || String(s.class).trim() === cleanSyllabusClass;
    });

    const namesFromDb = Array.from(new Set(dbSubs.map(s => s.name).filter(Boolean)));

    if (namesFromDb.length > 0) {
      return namesFromDb.map(name => {
        const matched = dbSubs.find(s => s.name.toLowerCase() === name.toLowerCase());
        return {
          id: matched?.id || name,
          name: name,
          icon: matched?.icon || getSubjectIcon(name),
          color: matched?.color || "#6366f1"
        };
      });
    }

    const defaultCore = parseInt(cleanSyllabusClass) >= 11
      ? [
        "Tamil", "English",
        "Physics", "Chemistry", "Biology", "Mathematics",
        "Computer Science",
        "Commerce", "Accountancy", "Economics", "Computer Applications",
        "Business Mathematics",
        "History", "Geography", "Political Science",
        "Basic Electrical", "Agriculture Science", "Office Management"
      ]
      : ["Tamil", "English", "Mathematics", "Science", "Social Science"];

    return defaultCore.map(name => ({
      id: name,
      name: name,
      icon: getSubjectIcon(name),
      color: "#6366f1"
    }));
  }, [subjects, syllabusClass]);

  const filteredSyllabusSubjects = useMemo(() => {
    if (!searchQuery.trim()) return syllabusSubjectsForClass;
    const q = searchQuery.toLowerCase().trim();
    return syllabusSubjectsForClass.filter(sub =>
      sub.name.toLowerCase().includes(q)
    );
  }, [syllabusSubjectsForClass, searchQuery]);

  useEffect(() => {
    const activeList = filteredSyllabusSubjects;
    if (activeList.length > 0) {
      const exists = activeList.some(s => s.name.toLowerCase() === selectedSyllabusSubject.toLowerCase());
      if (!exists) {
        setSelectedSyllabusSubject(activeList[0].name);
      }
    }
  }, [syllabusClass, filteredSyllabusSubjects]);

  const syllabusChapters = useMemo(() => {
    const list = resources.filter(res => {
      const isSyllabus = res.category === "syllabus";
      if (!isSyllabus) return false;

      const resClass = res.class ? String(res.class).replace(/^Class\s+/i, '') : "";
      const matchClass = !resClass || resClass === syllabusClass;

      const resSub = subjects.find(s => s.id === res.subjectId);
      const subName = resSub?.name || res.title || "";
      const matchSubject = !selectedSyllabusSubject || subName.toLowerCase() === selectedSyllabusSubject.toLowerCase() || res.title.toLowerCase().includes(selectedSyllabusSubject.toLowerCase());

      const q = searchQuery.trim() || syllabusSearchQuery.trim();
      const matchSearch = q
        ? (res.title.toLowerCase().includes(q.toLowerCase()) ||
          (res.chapter && res.chapter.toLowerCase().includes(q.toLowerCase())) ||
          (res.topicName && res.topicName.toLowerCase().includes(q.toLowerCase())) ||
          (res.description && res.description.toLowerCase().includes(q.toLowerCase())))
        : true;

      return matchClass && matchSubject && matchSearch;
    });

    return list.sort((a, b) => {
      const extractNum = (item: any) => {
        const numStr = item.chapterNumber || item.chapter || item.title || "";
        const m = String(numStr).match(/\d+/);
        return m ? parseInt(m[0], 10) : 999;
      };
      return extractNum(a) - extractNum(b);
    });
  }, [resources, subjects, syllabusClass, selectedSyllabusSubject, searchQuery, syllabusSearchQuery]);

  const getSubjectStats = (subName: string) => {
    const items = resources.filter(res => {
      const isSyllabus = res.category === "syllabus";
      const resClass = res.class ? String(res.class).replace(/^Class\s+/i, '') : "";
      const matchClass = !resClass || resClass === syllabusClass;
      const resSub = subjects.find(s => s.id === res.subjectId);
      const sName = resSub?.name || "";
      const matchSub = sName.toLowerCase() === subName.toLowerCase() || res.title.toLowerCase().includes(subName.toLowerCase());
      return isSyllabus && matchClass && matchSub;
    });

    const total = items.length;
    const aiCount = items.filter(r => r.meta && r.meta.toLowerCase().includes("ai")).length;
    return { total, aiCount };
  };

  const allMasterSubjects = useMemo(() => {
    const dbNames = subjects.map(s => s.name);
    return Array.from(new Set([...dbNames, ...selectedSubjectNames])).filter(Boolean).sort();
  }, [subjects, selectedSubjectNames]);

  const [subjectForm, setSubjectForm] = useState({
    name: "", color: "", icon: "", class: "", section: "",
    subjectCode: "", medium: "", description: "", status: "Active",
    topicName: "", subtopic: ""
  });

  const [resourceForm, setResourceForm] = useState({
    title: "", subjectId: "", type: "PDF", url: "", meta: "", description: "", addedBy: "",
    class: "", section: "", group: "", term: "", chapterNumber: "", topicName: "", subtopic: "",
    learningOutcomes: "", medium: "", bookVersion: "", publisher: "", language: "",
    coverImage: "", materialType: "", downloadAllowed: true, chapter: "", lessonTitle: "",
    youtubeUrl: "", videoDuration: "", thumbnail: "", contentType: "", author: "", isbn: "", status: "Active", attachmentType: "Link"
  });

  useEffect(() => {
    fetchSubjects();
    fetchResources();
    fetchClasses();
    fetchSections();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await authFetch(`${API_BASE}/classes?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        // Sort numerically by the number in the class name (e.g. "Class 6" → 6)
        data.sort((a: ClassItem, b: ClassItem) => {
          const numA = parseInt(a.name.replace(/\D/g, "")) || 0;
          const numB = parseInt(b.name.replace(/\D/g, "")) || 0;
          return numA - numB;
        });
        setClasses(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSections = async () => {
    try {
      const res = await authFetch(`${API_BASE}/sections?_t=${Date.now()}`);
      if (res.ok) setSections(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/subjects?_t=${Date.now()}`);
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
      const res = await authFetch(`${API_BASE}/resources?_t=${Date.now()}`);
      if (res.ok) setResources(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Structure Action Handlers ---
  const handleSaveStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!structureInput.trim()) return;

    setSavingStructure(true);
    try {
      const isEdit = Boolean(structureModal.editId);
      const base = structureModal.type === "class" ? "classes" : structureModal.type === "section" ? "sections" : "subjects";
      const endpoint = isEdit ? `${API_BASE}/${base}/${structureModal.editId}` : `${API_BASE}/${base}`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: structureInput.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to ${isEdit ? "update" : "save"} ${structureModal.type}`);
      }

      Swal.fire({
        title: isEdit ? "Updated!" : "Saved!",
        text: `${structureModal.type.toUpperCase()} "${structureInput.trim()}" ${isEdit ? "updated" : "saved"} directly to PostgreSQL database!`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      setStructureInput("");
      setStructureModal({ isOpen: false, type: "class", editId: null });

      if (structureModal.type === "class") fetchClasses();
      else if (structureModal.type === "section") fetchSections();
      else fetchSubjects();
    } catch (err: any) {
      Swal.fire({
        title: "Error!",
        text: err.message || "Failed to save item.",
        icon: "error",
      });
    } finally {
      setSavingStructure(false);
    }
  };

  const handleDeleteClassItem = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Class?",
      text: "Are you sure you want to remove this class?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
    });
    if (result.isConfirmed) {
      try {
        await fetch(`${API_BASE}/classes/${id}`, { method: "DELETE" });
        fetchClasses();
        Swal.fire({ title: "Deleted!", icon: "success", timer: 1200, showConfirmButton: false });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteSectionItem = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Section?",
      text: "Are you sure you want to remove this section?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
    });
    if (result.isConfirmed) {
      try {
        await fetch(`${API_BASE}/sections/${id}`, { method: "DELETE" });
        fetchSections();
        Swal.fire({ title: "Deleted!", icon: "success", timer: 1200, showConfirmButton: false });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // --- Subject Actions ---
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (editSubjectId) {
      const url = `${API_BASE}/subjects/${editSubjectId}`;
      const payload = {
        ...subjectForm,
        color: subjectForm.color || "#6366f1",
        icon: subjectForm.icon || "📚"
      };

      try {
        const res = await fetch(url, {
          method: "PUT",
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
    } else {
      const namesToSave = selectedSubjectNames.length > 0
        ? selectedSubjectNames
        : (subjectForm.name ? [subjectForm.name] : []);

      if (namesToSave.length === 0) {
        setError("Please select or enter at least one subject.");
        return;
      }

      try {
        for (const subName of namesToSave) {
          const matchingSub = subjects.find(s => s.name === subName);
          const payload = {
            ...subjectForm,
            name: subName,
            color: matchingSub?.color || subjectForm.color || "#6366f1",
            icon: matchingSub?.icon || subjectForm.icon || "📚"
          };
          const res = await fetch(`${API_BASE}/subjects`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || `Failed to save subject "${subName}"`);
          }
        }
        setShowSubjectModal(false);
        fetchSubjects();
      } catch (err: any) {
        setError(err.message);
      }
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
      setSelectedSubjectNames([sub.name]);
      // Normalize class value: strip "Class " prefix if present so dropdown matches
      const classVal = (sub.class || "").replace(/^Class\s+/i, '');
      setSubjectForm({
        name: sub.name,
        color: sub.color || "#6366f1",
        icon: sub.icon || "📚",
        class: classVal,
        section: sub.section || "",
        subjectCode: sub.subjectCode || "",
        medium: sub.medium || "",
        description: sub.description || "",
        status: sub.status || "Active",
        topicName: (sub as any).topicName || "",
        subtopic: sub.description || ""
      });
    } else {
      setEditSubjectId(null);
      setSelectedSubjectNames([]);
      setCustomSubjectInput("");
      setSubjectSearchQuery("");
      setSubjectForm({ name: "", color: "#6366f1", icon: "📚", class: filterClass || "", section: filterSection || "", subjectCode: "", medium: "", description: "", status: "Active", topicName: "", subtopic: "" });
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
        category: activeTab !== "overview" && activeTab !== "structure" && activeTab !== "subjects" ? activeTab : (resourceForm.contentType || "materials"),
        title: resourceForm.title || resourceForm.topicName || resourceForm.chapter || "Untitled Resource",
        topicName: resourceForm.topicName,
        description: resourceForm.subtopic
          ? (resourceForm.description && resourceForm.description !== resourceForm.subtopic
              ? `${resourceForm.subtopic} • ${resourceForm.description}`
              : resourceForm.subtopic)
          : resourceForm.description
      };
      const res = await authFetch(url, {
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
      await authFetch(`${API_BASE}/resources/${id}`, { method: "DELETE" });
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
        subtopic: res.description || "",
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
        title: "", subjectId: "", type: "PDF", url: "", meta: "", description: "", addedBy: "Super Admin",
        class: "", section: "", group: "", term: "", chapterNumber: "", topicName: "", subtopic: "",
        learningOutcomes: "", medium: "", bookVersion: "", publisher: "", language: "",
        coverImage: "", materialType: "", downloadAllowed: true, chapter: "", lessonTitle: "",
        youtubeUrl: "", videoDuration: "", thumbnail: "",
        contentType: ["textbooks", "materials", "notes", "videos", "digital", "reference"].includes(activeTab) ? activeTab : "materials",
        author: "", isbn: "", status: "Active", attachmentType: "Link"
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
    if (key === "structure") {
      const uniqueSubjectsCount = Array.from(new Set(subjects.map(s => s.name))).length;
      return classes.length + sections.length + uniqueSubjectsCount;
    }
    if (key === "subjects") {
      return subjects.filter(s => {
        const hasClass = Boolean(s.class) && s.class !== "ALL";
        const matchClass = filterClass ? s.class === String(filterClass) : true;
        const matchSection = filterSection ? s.section === filterSection : true;
        return hasClass && matchClass && matchSection;
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
      const hasClass = Boolean(sub.class) && sub.class !== "ALL";
      const matchSearch = searchQuery.trim() ? sub.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
      const matchClass = filterClass ? sub.class === String(filterClass) : true;
      const matchSection = filterSection ? sub.section === filterSection : true;
      const matchStatus = statusFilter === "All" ? true : sub.status === statusFilter;
      const matchRail = selectedSubject === "All" ? true : sub.name === selectedSubject;
      return hasClass && matchSearch && matchClass && matchSection && matchStatus && matchRail;
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

        {/* ── Category Tabs ───────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-1.5 flex items-center gap-1 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth shadow-sm">
          {CATEGORIES.map((c) => {
            const active = activeTab === c.key;
            const count = (c.key === "overview") ? null : countByCategory(c.key);

            return (
              <button
                key={c.key}
                onClick={() => setActiveTab(c.key)}
                className={`shrink-0 flex-1 min-w-max flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer text-center select-none whitespace-nowrap ${active
                  ? `text-white shadow-md shadow-indigo-500/20 scale-[1.02]`
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                  }`}
                style={active ? { background: c.gradient } : undefined}
                title={c.label}
              >
                <Fi name={c.icon} className="text-xs shrink-0" />
                <span className="whitespace-nowrap">{c.label}</span>
                {count !== null && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${active ? "bg-white/25 text-white" : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
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
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm space-y-3">
          {/* Top Row: Search Input & Primary Add Action */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <FiSearchIcon className="text-sm" />
              </span>
              <input
                type="text"
                placeholder={`Search ${activeTab === "syllabus" ? "chapters & sub-chapters" : CATEGORIES.find((c) => c.key === activeTab)?.label.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 text-slate-700 dark:text-slate-200 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <FiXIcon className="text-xs" />
                </button>
              )}
            </div>

            {activeTab !== "structure" && (
              <button
                onClick={() => (activeTab === "subjects" ? openSubjectModal() : activeTab === "syllabus" ? setChapterModal({ isOpen: true, editId: null }) : openResourceModal())}
                className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 hover:shadow-lg active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <FiPlusIcon className="text-sm" />
                <span>Add {activeTab === "overview" ? "Resource" : activeTab === "syllabus" ? "Chapter" : CATEGORIES.find(c => c.key === activeTab)?.label}</span>
              </button>
            )}
          </div>

          {/* Bottom Row: Filter Dropdowns & Clear Button */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <FiFilterIcon className="text-xs" /> Filter:
            </span>

            {/* Subject Filter */}
            <select
              value={activeTab === "syllabus" ? (selectedSyllabusSubject || "All") : selectedSubject}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedSubject(val);
                if (activeTab === "syllabus") setSelectedSyllabusSubject(val === "All" ? (syllabusSubjectsForClass[0]?.name || "Tamil") : val);
              }}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-950 outline-none text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              <option value="All">All Subjects</option>
              {railSubjects.map(s => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-950 outline-none text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Approved</option>
              <option value="Inactive">Rejected</option>
            </select>

            {/* Class Filter */}
            <select
              value={activeTab === "syllabus" ? (syllabusClass || filterClass) : filterClass}
              onChange={(e) => {
                const val = e.target.value;
                setFilterClass(val);
                if (activeTab === "syllabus" && val) setSyllabusClass(val);
              }}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-950 outline-none text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              <option value="">All Classes</option>
              {classes.length > 0 ? (
                classes.map(c => {
                  const val = c.name.replace(/^Class\s+/i, '');
                  return <option key={c.id} value={val}>{c.name}</option>;
                })
              ) : (
                [...Array(12)].map((_, i) => (
                  <option key={i + 1} value={String(i + 1)}>Class {i + 1}</option>
                ))
              )}
            </select>

            {/* Section Filter */}
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-950 outline-none text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              <option value="">All Sections</option>
              {sections.length > 0 ? (
                sections.map(s => {
                  const val = s.name.replace(/^Section\s+/i, '');
                  return <option key={s.id} value={val}>{s.name}</option>;
                })
              ) : (
                ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(s => (
                  <option key={s} value={s}>Section {s}</option>
                ))
              )}
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
                className="px-2.5 py-1.5 border border-red-200 dark:border-red-900/50 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all cursor-pointer flex items-center gap-1"
                title="Clear Filters"
              >
                <FiXIcon className="text-xs" /> Clear
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

            {/* ══ STRUCTURE SETUP TAB (CLASS, SECTION, SUBJECT SETUP) ═════════ */}
            {activeTab === "structure" && (
              <div className="space-y-6 text-left">

                {/* 3 Master Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* 1. Classes Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black">
                            <Fi name="graduation-cap" className="text-lg" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">School Classes</h3>
                            <p className="text-[10px] text-slate-400">Total {classes.length} registered</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setStructureInput(""); setStructureModal({ isOpen: true, type: "class" }); }}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <FiPlusIcon size={12} /> Add Class
                        </button>
                      </div>

                      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                        {classes.length > 0 ? (
                          classes.map((c, idx) => (
                            <div
                              key={c.id}
                              draggable
                              onDragStart={(e) => e.dataTransfer.setData("text/plain", idx.toString())}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const dragIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
                                if (!isNaN(dragIdx)) handleDropClass(dragIdx, idx);
                              }}
                              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 group hover:border-teal-500/30 transition-all cursor-grab active:cursor-grabbing"
                            >
                              <div className="flex items-center gap-2">
                                <Fi name="menu" className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 text-xs shrink-0" />
                                <span className="w-2 h-2 rounded-full bg-teal-500" />
                                <span className="font-bold text-xs text-slate-700 dark:text-slate-200">{c.name}</span>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                  onClick={() => { setStructureInput(c.name); setStructureModal({ isOpen: true, type: "class", editId: c.id }); }}
                                  className="p-1 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-all cursor-pointer"
                                  title="Edit Class"
                                >
                                  <FiEditIcon size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteClassItem(c.id)}
                                  className="p-1 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                                  title="Delete Class"
                                >
                                  <FiTrashIcon size={13} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                            No classes created yet.<br />Click "+ Add Class" button above to add one.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. Sections Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                            <Fi name="layers" className="text-lg" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Class Sections</h3>
                            <p className="text-[10px] text-slate-400">Total {sections.length} registered</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setStructureInput(""); setStructureModal({ isOpen: true, type: "section", editId: null }); }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <FiPlusIcon size={12} /> Add Section
                        </button>
                      </div>

                      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                        {sections.length > 0 ? (
                          sections.map((s, idx) => (
                            <div
                              key={s.id}
                              draggable
                              onDragStart={(e) => e.dataTransfer.setData("text/plain", idx.toString())}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const dragIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
                                if (!isNaN(dragIdx)) handleDropSection(dragIdx, idx);
                              }}
                              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 group hover:border-emerald-500/30 transition-all cursor-grab active:cursor-grabbing"
                            >
                              <div className="flex items-center gap-2">
                                <Fi name="menu" className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 text-xs shrink-0" />
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="font-bold text-xs text-slate-700 dark:text-slate-200">{s.name}</span>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                  onClick={() => { setStructureInput(s.name); setStructureModal({ isOpen: true, type: "section", editId: s.id }); }}
                                  className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer"
                                  title="Edit Section"
                                >
                                  <FiEditIcon size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteSectionItem(s.id)}
                                  className="p-1 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                                  title="Delete Section"
                                >
                                  <FiTrashIcon size={13} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                            No sections created yet.<br />Click "+ Add Section" button above to add one.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3. Subjects Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                            <Fi name="book-alt" className="text-lg" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Master Subjects</h3>
                            <p className="text-[10px] text-slate-400">Total {Array.from(new Set(subjects.map(s => s.name))).length} registered</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setStructureInput(""); setStructureModal({ isOpen: true, type: "subject", editId: null }); }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <FiPlusIcon size={12} /> Add Subject
                        </button>
                      </div>

                      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                        {subjects.length > 0 ? (
                          Array.from(new Map(subjects.map(s => [s.name, s])).values()).map((sub, idx) => (
                            <div
                              key={sub.id}
                              draggable
                              onDragStart={(e) => e.dataTransfer.setData("text/plain", idx.toString())}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const dragIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
                                if (!isNaN(dragIdx)) handleDropSubject(dragIdx, idx);
                              }}
                              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 group hover:border-indigo-500/30 transition-all cursor-grab active:cursor-grabbing"
                            >
                              <div className="flex items-center gap-2">
                                <Fi name="menu" className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 text-xs shrink-0" />
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color || '#6366f1' }} />
                                <span className="font-bold text-xs text-slate-700 dark:text-slate-200">{sub.name}</span>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                  onClick={() => { setStructureInput(sub.name); setStructureModal({ isOpen: true, type: "subject", editId: sub.id }); }}
                                  className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer"
                                  title="Edit Subject"
                                >
                                  <FiEditIcon size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubject(sub.id)}
                                  className="p-1 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                                  title="Delete Subject"
                                >
                                  <FiTrashIcon size={13} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                            No subjects created yet.<br />Click "+ Add Subject" button above to add one.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

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
                                onClick={() => {
                                  if (res.url) {
                                    setPreviewResource(res);
                                  } else {
                                    setActiveTab(res.category);
                                  }
                                }}
                                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 flex flex-col justify-between overflow-hidden transition-all cursor-pointer"
                              >
                                <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full blur-3xl opacity-5" style={{ backgroundColor: t.color }} />
                                <div>
                                  <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${TYPE_COLORS[res.type] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                      {renderTypeIcon(res.type)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full border bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                                        {res.category.toUpperCase()}
                                      </span>
                                      {res.url && (
                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
                                          VIEW
                                        </span>
                                      )}
                                    </div>
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
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${sub.status === "Active"
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

            {/* ══ DEDICATED SYLLABUS MANAGEMENT TAB ════════════════════ */}
            {activeTab === "syllabus" && (
              <div className="space-y-6 text-left font-sans">

                {/* 2-Column Main Layout: Left Subjects Panel & Right Chapters Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: SUBJECTS List */}
                  <div className="lg:col-span-3 space-y-3">
                    <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                      SUBJECTS
                    </div>
                    <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                      {filteredSyllabusSubjects.length > 0 ? (
                        filteredSyllabusSubjects.map((sub) => {
                          const isSelected = selectedSyllabusSubject.toLowerCase() === sub.name.toLowerCase();
                          const stats = getSubjectStats(sub.name);
                          const iconSymbol = getSubjectIcon(sub.name);
                          return (
                            <div
                              key={sub.name}
                              onClick={() => setSelectedSyllabusSubject(sub.name)}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${isSelected
                                ? "bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 dark:border-amber-500/80 ring-2 ring-amber-400/20 shadow-md scale-[1.01]"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700/50 shadow-sm"
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl shrink-0 shadow-sm">
                                  {iconSymbol}
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 leading-snug">
                                    {sub.name}
                                  </h4>
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                                    {stats.total} chapters · {stats.aiCount} AI-mapped
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                          No subjects match "{searchQuery}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Chapters Detail Table & Controls */}
                  <div className="lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm min-h-[500px] flex flex-col justify-between">
                    <div>
                      {/* Header Bar */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                              {getSubjectIcon(selectedSyllabusSubject)}
                            </div>
                            <div>
                              <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                                {selectedSyllabusSubject} — Class {syllabusClass}
                              </h3>
                              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                {syllabusChapters.length} chapters · {syllabusChapters.filter(c => c.status === "Active").length} enabled · {syllabusChapters.filter(c => c.meta?.toLowerCase().includes("ai")).length} AI-mapped
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <label
                            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                            style={{ color: "#ffffff" }}
                          >
                            <Fi name="upload" className="text-xs text-white" />
                            <span style={{ color: "#ffffff" }} className="!text-white">Upload Image / Screenshot</span>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handleUploadAndParseSyllabusImage}
                              disabled={parsingSyllabus}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Table Area */}
                      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800/80">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              <th className="py-3 px-4 w-12 text-center">NO</th>
                              <th className="py-3 px-4">CHAPTER TITLE</th>
                              <th className="py-3 px-4">TOPICS</th>
                              <th className="py-3 px-4">AI MAPPING</th>
                              <th className="py-3 px-4 text-right">STATUS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
                            {syllabusChapters.length > 0 ? (
                              syllabusChapters.map((ch, idx) => (
                                <tr key={ch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors">
                                  <td className="py-3.5 px-4 font-extrabold text-slate-400 text-center">
                                    {String(ch.chapterNumber || idx + 1).padStart(2, '0')}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <div className="font-bold text-slate-800 dark:text-slate-100">{ch.chapter || ch.title}</div>
                                    {ch.description && (
                                      <div className="flex flex-wrap gap-1 mt-1.5">
                                        {ch.description.split(/•|\n/).map((sub: string, sIdx: number) => {
                                          const trimmed = sub.trim();
                                          if (!trimmed) return null;
                                          const unitNum = ch.chapterNumber || (idx + 1);
                                          const hasNo = /^\d+\.\d+/.test(trimmed);
                                          const displayText = hasNo ? trimmed : `${unitNum}.${sIdx + 1} ${trimmed}`;
                                          return (
                                            <span
                                              key={sIdx}
                                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                            >
                                              • {displayText}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-semibold">
                                    {ch.topicName || "General Topics"}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ch.meta?.toLowerCase().includes("ai")
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                      : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                                      }`}>
                                      {ch.meta?.toLowerCase().includes("ai") ? "Mapped" : "Not Mapped"}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ch.status === "Active"
                                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400"
                                        : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                                        }`}>
                                        {ch.status === "Active" ? "Enabled" : "Disabled"}
                                      </span>
                                      <button
                                        onClick={() => openEditChapterModal(ch)}
                                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                                        title="Edit Chapter"
                                      >
                                        <FiEditIcon size={13} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteResource(ch.id)}
                                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                        title="Delete Chapter"
                                      >
                                        <FiTrashIcon size={13} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="py-16 text-center text-slate-400">
                                  <div className="flex flex-col items-center justify-center">
                                    <Fi name="book-alt" className="text-3xl text-slate-300 dark:text-slate-700 mb-2" />
                                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                                      0 chapters added for {selectedSyllabusSubject} - Class {syllabusClass}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                                      Click the "+ Add Chapter" button in the top bar to add state board chapters and unit maps.
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ GENERAL RESOURCES TABS ══════════════════════ */}
            {activeTab !== "overview" && activeTab !== "subjects" && activeTab !== "syllabus" && (
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
                              {renderTypeIcon(res.type)}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Medium Badge */}
                              {res.medium && (
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                                  res.medium.toLowerCase() === "tamil"
                                    ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/50"
                                    : res.medium.toLowerCase() === "english"
                                      ? "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-800/50"
                                      : "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800/50"
                                }`}>
                                  {res.medium.toUpperCase()}
                                </span>
                              )}
                              {/* Status Badge */}
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${res.status === "Active"
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
                          <h3
                            onClick={() => res.url && setPreviewResource(res)}
                            className={`text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug mb-1 ${res.url ? "cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" : ""}`}
                          >
                            {res.title}
                          </h3>

                          {/* Topic, Subtopic & Custom Information for ALL tabs */}
                          {(res.topicName || res.description || res.chapterNumber || res.learningOutcomes) && (
                            <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold mb-2 flex flex-wrap items-center gap-1.5">
                              {res.chapterNumber && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                                  Ch {res.chapterNumber}
                                </span>
                              )}
                              {res.topicName && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50">
                                  📌 <span className="font-extrabold text-teal-800 dark:text-teal-200">Topic:</span> {res.topicName}
                                </span>
                              )}
                              {res.description && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                                  🏷️ <span className="font-extrabold text-indigo-800 dark:text-indigo-200">Subtopic:</span> {res.description}
                                </span>
                              )}
                              {res.learningOutcomes && (
                                <p className="text-[10px] text-slate-400 font-normal leading-relaxed mt-1 w-full">
                                  Outcomes: {res.learningOutcomes}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Bottom line: details & admin operations */}
                        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <Fi name="clock" className="text-xs" /> {res.meta || "N/A"}
                            {res.addedBy && <span> · By {res.addedBy}</span>}
                          </span>

                          <div className="flex gap-1">
                            {res.url && (
                              <button
                                onClick={() => setPreviewResource(res)}
                                className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                                title="View PDF / File Preview Popup"
                              >
                                <Fi name="eye" className="text-xs" /> View
                              </button>
                            )}
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
                                href={getFileUrl(res.url)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 bg-slate-500/10 hover:bg-slate-500 hover:text-white text-slate-600 dark:text-slate-400 rounded-lg transition-colors flex items-center justify-center"
                                title="Open Link in New Tab"
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

              </div>
            )}

          </motion.div>
        )}

      </div>

      {/* --- Subject Modal --- */}
      <AnimatePresence>
        {showSubjectModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-start sm:items-center justify-center">
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
              className="bg-white dark:bg-[#121824] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col relative z-10 border border-slate-100 dark:border-slate-800/80 text-left font-sans"
              key={editSubjectId ?? 'add-subject'}
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#121824] shrink-0 z-20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <FiPlusIcon size={16} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">
                      {editSubjectId ? "Edit Class Subject" : "Add New Class Subject"}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400">Configure subject, topic & subtopic structure</p>
                  </div>
                </div>
                <button onClick={() => setShowSubjectModal(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                  <FiXIcon className="text-lg" />
                </button>
              </div>
              <form onSubmit={handleSaveSubject} className="p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1 text-left font-sans">
                {error && <div className="text-red-500 text-sm bg-red-50/80 p-3 rounded-xl">{error}</div>}

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Class *</label>
                    <select required value={subjectForm.class} onChange={e => setSubjectForm({ ...subjectForm, class: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none">
                      <option value="">Select Class</option>
                      {classes.length > 0 ? (
                        classes.map(c => {
                          const val = c.name.replace(/^Class\s+/i, '');
                          return <option key={c.id} value={val}>{c.name}</option>;
                        })
                      ) : (
                        [...Array(12)].map((_, i) => <option key={i} value={String(i + 1)}>Class {i + 1}</option>)
                      )}
                    </select>
                  </div>
                </div>

                {!editSubjectId ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase text-slate-400">
                        Subject Name(s) * {selectedSubjectNames.length > 0 && <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">({selectedSubjectNames.length} selected)</span>}
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedSubjectNames(allMasterSubjects)}
                          className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedSubjectNames([])}
                          className="text-[10px] text-slate-400 font-bold hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Search filter */}
                    <div className="relative flex items-center">
                      <FiSearchIcon className="absolute left-3 text-slate-400 text-xs" size={13} />
                      <input
                        type="text"
                        placeholder="Search subjects..."
                        value={subjectSearchQuery}
                        onChange={(e) => setSubjectSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-8 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                      {subjectSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setSubjectSearchQuery("")}
                          className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                          <FiXIcon size={13} />
                        </button>
                      )}
                    </div>

                    {/* Chips list — filtered by search */}
                    <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50/50 dark:bg-slate-950/50 flex flex-wrap gap-1.5 custom-scrollbar">
                      {(() => {
                        const filtered = subjectSearchQuery.trim()
                          ? allMasterSubjects.filter(n => n.toLowerCase().includes(subjectSearchQuery.toLowerCase()))
                          : allMasterSubjects;
                        if (filtered.length === 0) {
                          return (
                            <p className="text-xs text-slate-400 p-2 text-center w-full">
                              {subjectSearchQuery ? `No subjects match "${subjectSearchQuery}"` : 'No subjects found.'}
                            </p>
                          );
                        }
                        return filtered.map((subName) => {
                          const isSelected = selectedSubjectNames.includes(subName);
                          return (
                            <span
                              key={subName}
                              className={`inline-flex items-center gap-1 pl-2.5 rounded-lg text-xs font-bold border transition-all ${isSelected
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                                }`}
                            >
                              {isSelected && <FiCheckIcon size={11} />}
                              <button
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedSubjectNames(selectedSubjectNames.filter(n => n !== subName));
                                  } else {
                                    setSelectedSubjectNames([...selectedSubjectNames, subName]);
                                  }
                                }}
                                className="py-1 cursor-pointer"
                              >
                                {subName}
                              </button>
                              {isSelected && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedSubjectNames(selectedSubjectNames.filter(n => n !== subName))}
                                  className="px-1.5 py-1 hover:bg-indigo-700 rounded-r-lg transition-colors cursor-pointer"
                                  title="Remove"
                                >
                                  <FiXIcon size={10} />
                                </button>
                              )}
                              {!isSelected && (
                                <span className="w-1.5" />
                              )}
                            </span>
                          );
                        });
                      })()}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Subject Name *</label>
                      <select
                        required
                        value={subjectForm.name}
                        onChange={e => {
                          const selectedSubName = e.target.value;
                          const matchingSub = subjects.find(s => s.name === selectedSubName);
                          setSubjectForm({
                            ...subjectForm,
                            name: selectedSubName,
                            color: matchingSub?.color || subjectForm.color,
                            icon: matchingSub?.icon || subjectForm.icon,
                            subjectCode: matchingSub?.subjectCode || subjectForm.subjectCode
                          });
                        }}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none font-medium"
                      >
                        <option value="">Select Subject</option>
                        {allMasterSubjects.map((subName) => (
                          <option key={subName} value={subName}>
                            {subName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Topic Name & Subtopic Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1">
                      Topic Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Algebra / Number Systems"
                      value={subjectForm.topicName || ""}
                      onChange={e => setSubjectForm({ ...subjectForm, topicName: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-xs sm:text-sm placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1">
                      Subtopic
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Quadratic Equations"
                      value={subjectForm.subtopic || ""}
                      onChange={e => setSubjectForm({ ...subjectForm, subtopic: e.target.value, description: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-xs sm:text-sm placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Medium</label>
                    <select value={subjectForm.medium} onChange={e => setSubjectForm({ ...subjectForm, medium: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none">
                      <option value="">Select Medium</option>
                      <option value="Tamil">Tamil</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Status</label>
                    <select value={subjectForm.status} onChange={e => setSubjectForm({ ...subjectForm, status: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none">
                      <option value="Active">Approved (Active)</option>
                      <option value="Inactive">Rejected (Inactive)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Color Theme</label>
                    <input type="color" value={subjectForm.color} onChange={e => setSubjectForm({ ...subjectForm, color: e.target.value })} className="w-full h-10 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 cursor-pointer outline-none p-1" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Emoji Icon</label>
                    <input type="text" placeholder="📚" value={subjectForm.icon} onChange={e => setSubjectForm({ ...subjectForm, icon: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description</label>
                  <textarea rows={2} value={subjectForm.description} onChange={e => setSubjectForm({ ...subjectForm, description: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none resize-none"></textarea>
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
          <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-start sm:items-center justify-center">
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
              className="bg-white dark:bg-[#121824] w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col relative z-10 border border-slate-100 dark:border-slate-800/80 text-left font-sans"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#121824] shrink-0 z-20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <FiPlusIcon size={16} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 leading-tight">
                      {editResourceId
                        ? `Edit ${CATEGORIES.find(t => t.key === activeTab)?.label || "Resource"}`
                        : activeTab === "overview"
                          ? "Add Academic Resource Item"
                          : `Add New ${CATEGORIES.find(t => t.key === activeTab)?.label || "Resource"}`}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                      {CATEGORIES.find(t => t.key === activeTab)?.blurb || "Configure topics, subtopics & learning resources"}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowResourceModal(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                  <FiXIcon className="text-lg" />
                </button>
              </div>

              <form onSubmit={handleSaveResource} className="p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1 text-left font-sans">
                {error && <div className="text-red-500 text-sm bg-red-50/80 p-3 rounded-xl">{error}</div>}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Class *</label>
                    <select
                      required
                      value={resourceForm.class}
                      onChange={e => {
                        const newClass = e.target.value;
                        const cleanNew = String(newClass).replace(/^Class\s+/i, '').trim();
                        const filtered = newClass ? subjects.filter(s => {
                          if (!s.class || s.class === "All" || s.class === "General") return true;
                          const sCls = String(s.class).replace(/^Class\s+/i, '').trim();
                          return sCls === cleanNew || String(s.class) === newClass || String(s.class) === `Class ${cleanNew}`;
                        }) : subjects;
                        const isStillValid = filtered.some(s => String(s.id) === String(resourceForm.subjectId));
                        setResourceForm({
                          ...resourceForm,
                          class: newClass,
                          subjectId: isStillValid ? resourceForm.subjectId : ""
                        });
                      }}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none"
                    >
                      <option value="">Select Class</option>
                      {classes.length > 0 ? (
                        classes.map(c => {
                          const val = c.name.replace(/^Class\s+/i, '');
                          return <option key={c.id} value={val}>{c.name}</option>;
                        })
                      ) : (
                        [...Array(12)].map((_, i) => <option key={i} value={String(i + 1)}>Class {i + 1}</option>)
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Subject *</label>
                    <select required value={resourceForm.subjectId} onChange={e => setResourceForm({ ...resourceForm, subjectId: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none">
                      <option value="" disabled>Select subject</option>
                      {(() => {
                        const cleanClass = String(resourceForm.class || "").replace(/^Class\s+/i, '').trim();
                        let filtered = subjects.filter(s => {
                          if (!cleanClass) return true;
                          if (!s.class || s.class === "All" || s.class === "General") return true;
                          const sCls = String(s.class).replace(/^Class\s+/i, '').trim();
                          return sCls === cleanClass || String(s.class) === cleanClass || String(s.class) === `Class ${cleanClass}`;
                        });
                        if (filtered.length === 0 && subjects.length > 0) {
                          filtered = subjects;
                        }
                        const unique = Array.from(new Map(filtered.map(s => [s.name.toLowerCase().trim(), s])).values());
                        return unique.map(s => <option key={s.id} value={s.id}>{s.name}</option>);
                      })()}
                    </select>
                  </div>
                </div>

                {/* Category Selection inside Overview */}
                {activeTab === "overview" && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Target Category *</label>
                    <select required value={resourceForm.contentType || "materials"} onChange={e => setResourceForm({ ...resourceForm, contentType: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none">
                      {CATEGORIES.filter(c => c.key !== "overview" && c.key !== "subjects").map(c => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Resource Title Field */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    {activeTab === "textbooks" ? "Book Title *" : activeTab === "notes" ? "Lesson Title *" : activeTab === "videos" ? "Video Title *" : activeTab === "digital" ? "Content Title *" : activeTab === "reference" ? "Reference Title *" : "Resource / Item Title *"}
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 10th Standard Mathematics Guide"
                    value={resourceForm.title}
                    onChange={e => setResourceForm({ ...resourceForm, title: e.target.value, lessonTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-xs sm:text-sm"
                  />
                </div>

                {/* Common Fields: Topic Name & Subtopic RIGHT BELOW TITLE for ALL tabs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Topic Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Algebra / Number Systems"
                      value={resourceForm.topicName}
                      onChange={e => setResourceForm({ ...resourceForm, topicName: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Subtopic</label>
                    <input
                      type="text"
                      placeholder="e.g. Quadratic Equations"
                      value={resourceForm.subtopic}
                      onChange={e => setResourceForm({ ...resourceForm, subtopic: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Dynamic Fields Based on activeTab */}
                {activeTab === "syllabus" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Term</label>
                        <select value={resourceForm.term} onChange={e => setResourceForm({ ...resourceForm, term: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none">
                          <option value="">Select Term</option>
                          <option value="Term 1">Term 1</option>
                          <option value="Term 2">Term 2</option>
                          <option value="Term 3">Term 3</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Unit / Chapter</label>
                        <input type="text" value={resourceForm.chapter} onChange={e => setResourceForm({ ...resourceForm, chapter: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Chapter Number</label>
                      <input type="text" value={resourceForm.chapterNumber} onChange={e => setResourceForm({ ...resourceForm, chapterNumber: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Learning Outcomes</label>
                      <textarea rows={2} value={resourceForm.learningOutcomes} onChange={e => setResourceForm({ ...resourceForm, learningOutcomes: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none resize-none"></textarea>
                    </div>
                  </>
                )}

                {activeTab === "textbooks" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Medium</label>
                        <select value={resourceForm.medium} onChange={e => setResourceForm({ ...resourceForm, medium: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none">
                          <option value="">Select Medium</option>
                          <option value="Tamil">Tamil</option>
                          <option value="English">English</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Version / Edition</label>
                        <input type="text" value={resourceForm.bookVersion} onChange={e => setResourceForm({ ...resourceForm, bookVersion: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Publisher</label>
                        <input type="text" value={resourceForm.publisher} onChange={e => setResourceForm({ ...resourceForm, publisher: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none" placeholder="SCERT / NCERT" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Cover Image URL</label>
                        <input type="text" value={resourceForm.coverImage} onChange={e => setResourceForm({ ...resourceForm, coverImage: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none" placeholder="https://..." />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "materials" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Material Type</label>
                      <select value={resourceForm.materialType} onChange={e => setResourceForm({ ...resourceForm, materialType: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none">
                        <option value="">Select Type</option>
                        <option value="PDF">PDF</option>
                        <option value="PPT">PPT</option>
                        <option value="DOC">DOC</option>
                        <option value="Worksheet">Worksheet</option>
                      </select>
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
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Chapter</label>
                      <input type="text" value={resourceForm.chapter} onChange={e => setResourceForm({ ...resourceForm, chapter: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none" />
                    </div>
                  </>
                )}

                {activeTab === "videos" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Chapter</label>
                      <input type="text" value={resourceForm.chapter} onChange={e => setResourceForm({ ...resourceForm, chapter: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">YouTube URL</label>
                        <input type="text" value={resourceForm.youtubeUrl} onChange={e => setResourceForm({ ...resourceForm, youtubeUrl: e.target.value, url: e.target.value, type: "Video" })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Duration</label>
                        <input type="text" value={resourceForm.videoDuration} onChange={e => setResourceForm({ ...resourceForm, videoDuration: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none" placeholder="e.g. 15 Mins" />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "digital" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Content Type</label>
                      <select value={resourceForm.contentType} onChange={e => setResourceForm({ ...resourceForm, contentType: e.target.value, type: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none">
                        <option value="">Select Type</option>
                        <option value="PDF">PDF</option>
                        <option value="Video">Video</option>
                        <option value="Audio">Audio</option>
                        <option value="Interactive">Interactive</option>
                        <option value="Presentation">Presentation</option>
                      </select>
                    </div>
                  </>
                )}

                {activeTab === "reference" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Author</label>
                        <input type="text" value={resourceForm.author} onChange={e => setResourceForm({ ...resourceForm, author: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Publisher</label>
                        <input type="text" value={resourceForm.publisher} onChange={e => setResourceForm({ ...resourceForm, publisher: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">ISBN (Optional)</label>
                      <input type="text" value={resourceForm.isbn} onChange={e => setResourceForm({ ...resourceForm, isbn: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none" />
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
                    <select value={resourceForm.attachmentType || "Link"} onChange={e => setResourceForm({ ...resourceForm, attachmentType: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none">
                      <option value="Link">Link (URL)</option>
                      <option value="Upload">File Upload</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Status</label>
                    <select value={resourceForm.status} onChange={e => setResourceForm({ ...resourceForm, status: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-905 text-slate-700 dark:text-slate-200 outline-none">
                      <option value="Active">Approved (Active)</option>
                      <option value="Inactive">Rejected (Inactive)</option>
                    </select>
                  </div>
                </div>

                <div>
                  {resourceForm.attachmentType === "Upload" ? (
                    <>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Upload File</label>
                      <div className="relative w-full px-4 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-950 cursor-pointer overflow-hidden min-h-[48px]">
                        <input type="file" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB
                          if (file.size > MAX_FILE_SIZE) {
                            Swal.fire({
                              icon: "error",
                              title: "File Too Large",
                              text: `The selected file is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Maximum allowed size is 500 MB.`
                            });
                            e.target.value = "";
                            return;
                          }

                          setResourceForm(prev => ({ ...prev, url: "Uploading..." }));

                          const formData = new FormData();
                          formData.append("file", file);

                          const ext = file.name.split('.').pop()?.toLowerCase() || '';
                          let detectedType = "PDF";
                          if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) detectedType = "Video";
                          else if (['mp3', 'wav', 'aac', 'm4a', 'flac'].includes(ext)) detectedType = "Audio";
                          else if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) detectedType = "DOC";
                          else if (['epub', 'mobi'].includes(ext)) detectedType = "eBook";
                          else if (['zip', 'html'].includes(ext)) detectedType = "Interactive";

                          try {
                            const res = await authFetch(`${API_BASE}/upload`, {
                              method: "POST",
                              body: formData
                            });

                            if (!res.ok) {
                              const errData = await res.json().catch(() => ({}));
                              throw new Error(errData.error || errData.message || errData.details || `Upload failed with status ${res.status}`);
                            }

                            const data = await res.json();
                            if (data.url) {
                              setResourceForm(prev => ({
                                ...prev,
                                url: data.url,
                                type: detectedType,
                                attachmentType: "Upload"
                              }));
                            }
                          } catch (err: any) {
                            console.error(err);
                            Swal.fire({ icon: "error", title: "Upload Failed", text: err.message || "File upload failed." });
                            setResourceForm(prev => ({ ...prev, url: "" }));
                          }
                        }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <span className="text-xs text-slate-500 font-medium">
                          {resourceForm.url === "Uploading..." ? "Uploading (large files may take a moment)..." : (resourceForm.url && resourceForm.url.startsWith('/uploads') ? '✓ ' + resourceForm.url.split('/').pop() : 'Click to Browse / Drag File (up to 500 MB)')}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <label className="block text-xs font-bold uppercase text-slate-400 mb-1">URL / Link</label>
                      <input type="text" value={resourceForm.url} onChange={e => setResourceForm({ ...resourceForm, url: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none" placeholder="https://..." />
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description</label>
                  <textarea rows={2} value={resourceForm.description} onChange={e => setResourceForm({ ...resourceForm, description: e.target.value })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 outline-none resize-none"></textarea>
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

      {/* ══ STRUCTURE SETUP SINGLE-FIELD POPUP MODAL ══════════════ */}
      <AnimatePresence>
        {structureModal.isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-start sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setStructureModal({ isOpen: false, type: "class" })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl relative z-10 overflow-hidden text-left flex flex-col max-h-[85vh] font-sans"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#121824] shrink-0 z-20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                    <FiPlusIcon size={16} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">
                      {structureModal.editId
                        ? `Edit ${structureModal.type === "class" ? "Class" : structureModal.type === "section" ? "Section" : "Subject"}`
                        : structureModal.type === "class"
                          ? "Add New Class"
                          : structureModal.type === "section"
                            ? "Add New Section"
                            : "Add New Subject"}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400">Save single field directly to PostgreSQL database</p>
                  </div>
                </div>
                <button
                  onClick={() => setStructureModal({ isOpen: false, type: "class", editId: null })}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <FiXIcon className="text-lg" />
                </button>
              </div>

              <form onSubmit={handleSaveStructure} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    {structureModal.type === "class" ? "Class Name" : structureModal.type === "section" ? "Section Name" : "Subject Name"}
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={structureInput}
                    onChange={(e) => setStructureInput(e.target.value)}
                    placeholder={
                      structureModal.type === "class"
                        ? "e.g. Class 10"
                        : structureModal.type === "section"
                          ? "e.g. Section A"
                          : "e.g. Mathematics"
                    }
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-teal-500/30 transition-all"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setStructureModal({ isOpen: false, type: "class", editId: null })}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingStructure}
                    className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-black shadow-md transition-all flex items-center gap-2"
                  >
                    {savingStructure ? "Saving to DB..." : structureModal.editId ? `Update ${structureModal.type.toUpperCase()}` : `Save ${structureModal.type.toUpperCase()}`}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══ DEDICATED ADD / EDIT CHAPTER POPUP MODAL ════════════════════ */}
      <AnimatePresence>
        {chapterModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setChapterModal({ isOpen: false, editId: null })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl relative z-10 overflow-hidden text-left flex flex-col max-h-[85vh] font-sans"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#121824] shrink-0 z-20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <FiPlusIcon size={16} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 leading-tight">
                      {chapterModal.editId ? "Edit Chapter" : "Add New Chapter"}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Term-wise unit maps with lesson tracking</p>
                  </div>
                </div>
                <button
                  onClick={() => setChapterModal({ isOpen: false, editId: null })}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <FiXIcon className="text-lg" />
                </button>
              </div>

              <form onSubmit={handleSaveChapter} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                {/* Combined Row for Unit No. & Chapter Title */}
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-4">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1.5">
                      UNIT NO.
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={chapterForm.unitNo}
                      onChange={(e) => {
                        const u = e.target.value;
                        setChapterForm({ ...chapterForm, unitNo: u, subunitNo: `${u}.1` });
                        setSubchaptersList(prev =>
                          prev.map((item, i) => ({
                            ...item,
                            no: `${u}.${i + 1}`
                          }))
                        );
                      }}
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-center"
                    />
                  </div>

                  <div className="col-span-8">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1.5">
                      CHAPTER TITLE / UNIT NAME
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={chapterForm.title}
                      onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                      placeholder="e.g. Prose & Poetry"
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
                      SUB-CHAPTERS / SUBUNITS
                    </label>
                    <button
                      type="button"
                      onClick={addSubchapterRow}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                    >
                      <FiPlusIcon size={12} /> Add Sub-chapter
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {subchaptersList.map((sub, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-[11px] font-black shrink-0">
                          {sub.no}
                        </span>
                        <input
                          type="text"
                          value={sub.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSubchaptersList(prev =>
                              prev.map((item, i) => (i === idx ? { ...item, title: val } : item))
                            );
                          }}
                          placeholder={idx === 0 ? "Prose: His First Flight" : idx === 1 ? "Poem: Life" : "Sub-chapter title"}
                          className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                        />
                        {subchaptersList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSubchapterRow(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors shrink-0 cursor-pointer"
                            title="Remove Sub-chapter"
                          >
                            <FiTrashIcon size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setChapterModal({ isOpen: false, editId: null })}
                    className="flex-1 py-2.5 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingChapter}
                    className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-md shadow-amber-500/25 transition-all cursor-pointer"
                  >
                    {savingChapter ? "Saving..." : chapterModal.editId ? "Update Chapter" : "Add Chapter"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══ UPLOADED IMAGE SYLLABUS PREVIEW & EDIT MODAL ════════════════ */}
      <AnimatePresence>
        {ocrPreviewModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setOcrPreviewModal({ isOpen: false, units: [] })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl relative z-10 overflow-hidden text-left font-sans max-h-[85vh] flex flex-col justify-between"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#121824] shrink-0 z-20">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl shrink-0">🤖</span>
                  <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">
                    AI OCR Parsed Syllabus Units
                  </h3>
                </div>
                <button
                  onClick={() => setOcrPreviewModal({ isOpen: false, units: [] })}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <FiXIcon className="text-lg" />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-between">
                {/* Top Banner (Matching user screenshot) */}
                <div className="p-4 bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/60 rounded-2xl flex items-center gap-3 mb-4 shadow-sm">
                  <span className="text-2xl shrink-0">🤖</span>
                  <div>
                    <h4 className="text-[11px] font-black uppercase text-indigo-950 dark:text-indigo-200 tracking-wider">
                      UPLOAD IMAGE OR SCREENSHOT TO LOAD SYLLABUS UNITS & SUBUNITS
                    </h4>
                    <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-300 mt-0.5">
                      Extracted {ocrPreviewModal.units.length} units/chapters. Click pencil to edit title or trash to delete.
                    </p>
                  </div>
                </div>

                {/* Parsed Units List (Matching user screenshot format with Edit & Delete icons) */}
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                  {ocrPreviewModal.units.map((unit, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 group hover:border-indigo-400 dark:hover:border-indigo-600/60 shadow-sm transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        {editingOcrIdx === idx ? (
                          <input
                            type="text"
                            value={unit.title}
                            onChange={(e) => {
                              const newTitle = e.target.value;
                              setOcrPreviewModal(prev => ({
                                ...prev,
                                units: prev.units.map((u, i) => i === idx ? { ...u, title: newTitle } : u)
                              }));
                            }}
                            className="w-full px-3 py-1.5 border border-indigo-400 dark:border-indigo-600 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none"
                          />
                        ) : (
                          <div>
                            <div className="font-extrabold text-xs text-slate-800 dark:text-slate-100 truncate">
                              {idx + 1}. {unit.title}
                            </div>
                            {unit.subtopics && unit.subtopics.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {unit.subtopics.map((sub, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                                  >
                                    • {sub}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingOcrIdx(editingOcrIdx === idx ? null : idx)}
                          className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Edit Chapter Title"
                        >
                          <FiEditIcon size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOcrPreviewModal(prev => ({
                              ...prev,
                              units: prev.units.filter((_, i) => i !== idx)
                            }));
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Delete Chapter"
                        >
                          <FiTrashIcon size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setOcrPreviewModal({ isOpen: false, units: [] })}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveOcrUnitsToDb}
                  disabled={savingChapter || ocrPreviewModal.units.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black shadow-md shadow-indigo-500/25 transition-all cursor-pointer flex items-center gap-2"
                >
                  {savingChapter ? "Saving..." : `Confirm & Save All (${ocrPreviewModal.units.length} Units)`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══ POPUP PDF / DOCUMENT / MEDIA PREVIEW MODAL ══════════════════════ */}
      <AnimatePresence>
        {previewResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
              onClick={() => setPreviewResource(null)}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${TYPE_COLORS[previewResource.type] || "bg-indigo-50 text-indigo-600 border-indigo-200"}`}>
                    {renderTypeIcon(previewResource.type)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate leading-tight">
                      {previewResource.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {previewResource.category} • {previewResource.type || "Document"} View
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {previewResource.url && (
                    <>
                      <a
                        href={getFileUrl(previewResource.url)}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold transition-all flex items-center gap-1.5"
                        title="Download File"
                      >
                        <Fi name="download" className="text-sm" />
                        <span className="hidden sm:inline">Download</span>
                      </a>

                      <a
                        href={getFileUrl(previewResource.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
                        title="Open in New Window"
                      >
                        <FiExternalLinkIcon size={13} />
                        <span className="hidden sm:inline">Open New Tab</span>
                      </a>
                    </>
                  )}

                  <button
                    onClick={() => setPreviewResource(null)}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <FiXIcon className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Viewport */}
              <div className="flex-1 bg-slate-950/90 overflow-hidden flex flex-col items-center justify-center min-h-[440px] relative">
                {previewResource.type === "Video" || (previewResource.url && (previewResource.url.includes("youtube.com") || previewResource.url.includes("youtu.be"))) ? (
                  <div className="w-full h-full aspect-video max-h-[75vh] flex items-center justify-center bg-black">
                    {previewResource.youtubeUrl || previewResource.url?.includes("youtube") || previewResource.url?.includes("youtu.be") ? (
                      <iframe
                        src={getYouTubeEmbedUrl(previewResource.youtubeUrl || previewResource.url)}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={previewResource.title}
                      />
                    ) : (
                      <video
                        src={getFileUrl(previewResource.url)}
                        controls
                        autoPlay
                        className="w-full h-full max-h-[75vh]"
                      >
                        Your browser does not support HTML5 video playback.
                      </video>
                    )}
                  </div>
                ) : previewResource.type === "Audio" ? (
                  <div className="w-full max-w-xl p-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center shadow-2xl my-auto">
                    <div className="w-20 h-20 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-3xl mb-4 border border-purple-500/30">
                      🎧
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">{previewResource.title}</h4>
                    <p className="text-xs text-slate-400 mb-6">{previewResource.description || "Audio Lesson Track"}</p>
                    <audio
                      src={getFileUrl(previewResource.url)}
                      controls
                      autoPlay
                      className="w-full"
                    >
                      Your browser does not support HTML5 audio player.
                    </audio>
                  </div>
                ) : (
                  /* PDF / Document Preview */
                  <div className="w-full h-[72vh] relative bg-slate-900 flex flex-col">
                    {previewResource.url ? (
                      <iframe
                        src={getFileUrl(previewResource.url)}
                        className="w-full h-full border-0 bg-white"
                        title={previewResource.title}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8">
                        <Fi name="document" className="text-5xl mb-3 text-slate-600" />
                        <p className="text-sm font-semibold">No direct file preview available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Info Footer */}
              <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {previewResource.medium && (
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300">
                      {previewResource.medium} Medium
                    </span>
                  )}
                  {previewResource.class && (
                    <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 font-bold text-indigo-600 dark:text-indigo-400">
                      Class {previewResource.class} {previewResource.section ? `(${previewResource.section})` : ""}
                    </span>
                  )}
                  {previewResource.term && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 font-bold text-amber-600 dark:text-amber-400">
                      {previewResource.term}
                    </span>
                  )}
                </div>

                <div className="text-slate-400 text-[11px] font-medium flex items-center gap-3">
                  {previewResource.addedBy && <span>Added by: <strong className="text-slate-600 dark:text-slate-300">{previewResource.addedBy}</strong></span>}
                  {previewResource.status && (
                    <span className={`font-bold ${previewResource.status === "Active" ? "text-emerald-500" : "text-amber-500"}`}>
                      ● {previewResource.status}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </PortalLayout>
  );
}
