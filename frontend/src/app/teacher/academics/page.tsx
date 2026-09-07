"use client";

import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import { FiChevronLeft as FiChevronLeftIcon, FiChevronRight as FiChevronRightIcon } from "react-icons/fi";

/* ────────────────────────────────────────────────────────────
   Flaticon (uicons) glyph
──────────────────────────────────────────────────────────── */
const Fi = ({ name, className = "", style = {} }: { name: string; className?: string; style?: React.CSSProperties }) => (
  <i className={`fi fi-rr-${name} inline-flex items-center justify-center leading-none ${className}`} style={style} />
);

/* ────────────────────────────────────────────────────────────
   Types
──────────────────────────────────────────────────────────── */
type CategoryKey =
  | "overview"
  | "subjects"
  | "syllabus"
  | "textbooks"
  | "materials"
  | "notes"
  | "videos"
  | "digital"
  | "reference";

interface Resource {
  id: string;
  title: string;
  subject: string;
  subjectId?: string;
  category: Exclude<CategoryKey, "overview" | "subjects">;
  type: "PDF" | "DOC" | "Video" | "Audio" | "Interactive" | "eBook" | "Link";
  meta: string;
  description: string;
  addedBy?: string;
  date?: string;
  progress?: number;
  isNew?: boolean;
  popular?: boolean;
  url?: string;
  class?: string;
  section?: string;
  term?: string;
}

interface SubjectInfo {
  id: string;
  name: string;
  class: string;
  section?: string;
  color: string;
  gradient: string;
  icon: string;
  teacher: string;
  progress: number;
  units: number;
  unitsDone: number;
}

interface SyllabusUnit {
  id: string;
  unitNumber: string;
  title: string;
  subject: string;
  class: string;
  term: string;
  topics: string[];
  status: "completed" | "in-progress" | "upcoming";
  completionPct: number;
  url?: string;
}

interface ClassAssignment {
  id: string;
  className: string;
  section: string;
  subject: string;
  roomNumber?: string;
  schedule?: string;
  totalStudents?: number;
}

const SCHOOL_BOARDS = [
  { id: "State Board", label: "Tamil Nadu State Board (Government / Samacheer)", shortLabel: "State Board (Govt)", icon: "bank", badge: "TN State Board" },
  { id: "CBSE", label: "CBSE (Central Board of Secondary Education - NCERT)", shortLabel: "CBSE (NCERT)", icon: "graduation-cap", badge: "CBSE Board" },
  { id: "ICSE", label: "ICSE (CISCE Board)", shortLabel: "ICSE", icon: "book", badge: "ICSE" },
  { id: "Matriculation", label: "Matriculation Board", shortLabel: "Matriculation", icon: "diploma", badge: "Matric" },
  { id: "All", label: "All School Boards", shortLabel: "All Boards", icon: "apps", badge: "All" },
];

/* ────────────────────────────────────────────────────────────
   Category Metadata
──────────────────────────────────────────────────────────── */
const CATEGORIES: {
  key: CategoryKey;
  label: string;
  icon: string;
  gradient: string;
  blurb: string;
}[] = [
    { key: "overview", label: "Overview", icon: "apps", gradient: "from-slate-500 to-slate-600", blurb: "Complete overview of all academic resources" },
    { key: "subjects", label: "Class Subjects", icon: "graduation-cap", gradient: "from-indigo-500 to-violet-500", blurb: "Your assigned subjects, classes, and progress" },
    { key: "syllabus", label: "Syllabus", icon: "book-alt", gradient: "from-emerald-500 to-teal-500", blurb: "Term-wise curriculum units & topic breakdowns" },
    { key: "textbooks", label: "Textbooks", icon: "book", gradient: "from-amber-500 to-orange-500", blurb: "Official Samacheer Kalvi & NCERT textbooks & eBooks" },
    { key: "materials", label: "Study Materials", icon: "document", gradient: "from-blue-500 to-sky-500", blurb: "Question banks, worksheets & formula charts" },
    { key: "notes", label: "Teacher Notes", icon: "notebook", gradient: "from-pink-500 to-rose-500", blurb: "Class lecture notes & revision guides" },
    { key: "videos", label: "Video Lessons", icon: "play-alt", gradient: "from-red-500 to-orange-500", blurb: "Recorded video lectures with playback support" },
    { key: "digital", label: "Digital Content", icon: "computer", gradient: "from-purple-500 to-violet-500", blurb: "Interactive 3D sims, audio lessons & quizzes" },
    { key: "reference", label: "Reference Materials", icon: "books", gradient: "from-cyan-500 to-sky-500", blurb: "Past board question papers & blueprint guides" },
  ];

const TYPE_ICONS: Record<Resource["type"], string> = {
  PDF: "document",
  DOC: "document",
  Video: "video-camera",
  Audio: "headset",
  Interactive: "cursor-finger",
  eBook: "book",
  Link: "globe",
};

const TYPE_COLORS: Record<Resource["type"], string> = {
  PDF: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  DOC: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Video: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  Audio: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Interactive: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  eBook: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Link: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
};

const BOOKMARK_KEY = "academics-bookmarks";

const SUBJECT_THEMES: Record<string, { color: string; gradient: string; icon: string }> = {
  Physics: { color: "#6366f1", gradient: "from-indigo-500 to-violet-600", icon: "⚛️" },
  Mathematics: { color: "#ec4899", gradient: "from-pink-500 to-rose-600", icon: "📐" },
  Chemistry: { color: "#10b981", gradient: "from-emerald-500 to-teal-600", icon: "🧪" },
  Biology: { color: "#f59e0b", gradient: "from-amber-500 to-orange-600", icon: "🧬" },
  English: { color: "#3b82f6", gradient: "from-blue-500 to-sky-600", icon: "📖" },
  Tamil: { color: "#8b5cf6", gradient: "from-purple-500 to-violet-600", icon: "✍️" },
  "Social Science": { color: "#06b6d4", gradient: "from-cyan-500 to-teal-600", icon: "🌍" },
  "Computer Science": { color: "#14b8a6", gradient: "from-teal-500 to-emerald-600", icon: "💻" },
};

const getCategoryGradient = (key: CategoryKey) => {
  switch (key) {
    case "overview": return "linear-gradient(135deg, #64748b, #475569)";
    case "subjects": return "linear-gradient(135deg, #6366f1, #8b5cf6)";
    case "syllabus": return "linear-gradient(135deg, #10b981, #0d9488)";
    case "textbooks": return "linear-gradient(135deg, #f59e0b, #ea580c)";
    case "materials": return "linear-gradient(135deg, #3b82f6, #0284c7)";
    case "notes": return "linear-gradient(135deg, #ec4899, #f43f5e)";
    case "videos": return "linear-gradient(135deg, #ef4444, #f97316)";
    case "digital": return "linear-gradient(135deg, #a855f7, #7c3aed)";
    case "reference": return "linear-gradient(135deg, #06b6d4, #0284c7)";
    default: return "linear-gradient(135deg, #6366f1, #8b5cf6)";
  }
};

export default function AcademicsHubPage() {
  const { t } = usePortalLanguage();
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<CategoryKey>("overview");
  const [selectedBoard, setSelectedBoard] = useState<string>("State Board");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);

  const [assignedClasses, setAssignedClasses] = useState<ClassAssignment[]>([]);
  const [dbSubjects, setDbSubjects] = useState<any[]>([]);
  const [dbResources, setDbResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tabs horizontal scroll navigation
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = tabsContainerRef.current;
    if (el) {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
  };

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(checkScroll, 150);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [dbResources, dbSubjects]);

  useEffect(() => {
    checkScroll();
  }, [activeTab]);

  const scrollTabs = (direction: "left" | "right") => {
    const el = tabsContainerRef.current;
    if (el) {
      const scrollAmount = Math.max(el.clientWidth * 0.55, 240);
      el.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
      setTimeout(checkScroll, 350);
    }
  };

  // Dedicated Syllabus Management UI States
  const [syllabusClass, setSyllabusClass] = useState<string>("11");
  const [selectedSyllabusSubject, setSelectedSyllabusSubject] = useState<string>("Mathematics");
  const [syllabusSearchQuery, setSyllabusSearchQuery] = useState<string>("");

  // AI Modal State
  const [teacherAIModal, setTeacherAIModal] = useState<{
    isOpen: boolean;
    resource: Resource | null;
    syllabusUnit: SyllabusUnit | null;
    option: string | null;
    responseText: string;
    isGenerating: boolean;
  }>({
    isOpen: false,
    resource: null,
    syllabusUnit: null,
    option: null,
    responseText: "",
    isGenerating: false,
  });

  // Load bookmarks
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]");
      if (Array.isArray(saved)) setBookmarks(saved);
    } catch { }
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id];
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Fetch classes, subjects, and resources
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return;
      setIsLoading(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const user = session.user as any;
        const teacherId = user.id;
        const schoolId = user.schoolId;

        // 1. Fetch assigned classes
        let teacherClassesList: ClassAssignment[] = [];
        if (teacherId && schoolId) {
          const classesRes = await fetch(`${API_URL}/api/classes?schoolId=${schoolId}&teacherId=${teacherId}`);
          if (classesRes.ok) {
            const classesData = await classesRes.json();
            teacherClassesList = Array.isArray(classesData) ? classesData : (classesData.data || []);
          }
        }

        // Default fallback classes if none returned
        if (teacherClassesList.length === 0) {
          teacherClassesList = [
            { id: "c11a", className: "11", section: "A", subject: "Physics", roomNumber: "Room 10", schedule: "Mon (P1), Fri (P1)", totalStudents: 22 },
            { id: "c11b", className: "11", section: "B", subject: "Mathematics", roomNumber: "Room 12", schedule: "Mon (P2), Wed (P1)", totalStudents: 20 },
            { id: "c12a", className: "12", section: "A", subject: "Mathematics", roomNumber: "Room 02", schedule: "Mon (P3), Tue (P1)", totalStudents: 22 },
          ];
        }
        setAssignedClasses(teacherClassesList);

        // 2. Fetch DB subjects & resources with board filtering
        const boardQuery = selectedBoard && selectedBoard !== "All" ? `board=${encodeURIComponent(selectedBoard)}` : "";
        const subUrl = `${API_URL}/api/superadmin/academics/subjects?status=Active${boardQuery ? `&${boardQuery}` : ""}`;
        const resUrl = `${API_URL}/api/superadmin/academics/resources${boardQuery ? `?${boardQuery}` : ""}`;

        const [subRes, resRes] = await Promise.all([
          fetch(subUrl),
          fetch(resUrl)
        ]);

        if (subRes.ok) {
          const data = await subRes.json();
          setDbSubjects(Array.isArray(data) ? data : []);
        }
        if (resRes.ok) {
          const data = await resRes.json();
          setDbResources(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch academics data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [session, selectedBoard]);

  // Sync default syllabus class and subject with assignedClasses
  useEffect(() => {
    if (assignedClasses.length > 0) {
      const firstClass = assignedClasses[0];
      setSyllabusClass(firstClass.className);
      setSelectedSyllabusSubject(firstClass.subject);
    }
  }, [assignedClasses]);

  // Unique subject list for filter buttons
  const availableSubjectsList = useMemo(() => {
    const subjectsMap = new Map<string, { name: string; classes: string[]; color: string; icon: string }>();

    assignedClasses.forEach((c) => {
      const name = c.subject;
      const classTag = `Class ${c.className}${c.section ? "-" + c.section : ""}`;
      const existing = subjectsMap.get(name);

      const theme = SUBJECT_THEMES[name] || { color: "#6366f1", icon: "📚" };

      if (existing) {
        if (!existing.classes.includes(classTag)) {
          existing.classes.push(classTag);
        }
      } else {
        subjectsMap.set(name, {
          name,
          classes: [classTag],
          color: theme.color,
          icon: theme.icon,
        });
      }
    });

    return Array.from(subjectsMap.values());
  }, [assignedClasses]);

  // Combined Master Data (DB resources + Generated Class & Subject Data)
  const masterAcademicsData = useMemo(() => {
    const allResources: Resource[] = [];
    const allSyllabus: SyllabusUnit[] = [];
    const teacherName = session?.user?.name || "Class Teacher";

    // 1. Process DB resources matching assigned teacher classes ONLY
    dbResources.forEach((r) => {
      let subName = r.subject?.name || "General";
      if (!subName || subName === "General") {
        const foundSub = dbSubjects.find(s => s.id === r.subjectId);
        if (foundSub) subName = foundSub.name;
      }

      // Strict check: Only include resources matching one of the teacher's created/assigned classes and subjects
      if (assignedClasses.length > 0) {
        const isTeacherClass = assignedClasses.some((c) => {
          const subMatch = c.subject.toLowerCase() === subName.toLowerCase();
          const cleanRClass = (r.class || "").replace(/^Class\s*/i, "").trim().toLowerCase();
          const cleanCClass = c.className.trim().toLowerCase();
          const gradeMatch = !cleanRClass || cleanRClass.includes(cleanCClass) || cleanCClass.includes(cleanRClass);
          return subMatch && gradeMatch;
        });
        if (!isTeacherClass) return; // Exclude resources for classes/subjects not taught by this teacher
      }

      // Standardize category
      let category: Resource["category"] = "materials";
      const catLower = (r.category || "").toLowerCase();
      if (catLower.includes("textbook") || catLower.includes("book")) category = "textbooks";
      else if (catLower.includes("material") || catLower.includes("worksheets") || catLower.includes("question")) category = "materials";
      else if (catLower.includes("note")) category = "notes";
      else if (catLower.includes("video")) category = "videos";
      else if (catLower.includes("digital") || catLower.includes("interactive") || catLower.includes("audio")) category = "digital";
      else if (catLower.includes("reference") || catLower.includes("paper")) category = "reference";
      else if (catLower.includes("syllabus")) category = "syllabus";

      const type: Resource["type"] = r.type || (category === "videos" ? "Video" : "PDF");

      allResources.push({
        id: r.id || `db-${Math.random()}`,
        title: r.title || r.topicName || r.chapter || "Untitled Academic Resource",
        subject: subName,
        subjectId: r.subjectId,
        category,
        type,
        meta: r.meta || (type === "Video" ? "30 mins Video" : "PDF Document"),
        description: r.description || "Official curriculum resource provided for TN State Board academics.",
        addedBy: r.addedBy || teacherName,
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Recently",
        progress: type === "Video" ? (r.progress !== undefined ? r.progress : 45) : undefined,
        isNew: r.isNew || false,
        popular: r.popular || true,
        url: r.url || r.youtubeUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        class: r.class || assignedClasses[0]?.className || "11",
      });

      // Populate syllabus units from DB resources
      if (category === "syllabus" || catLower.includes("syllabus")) {
        const rawTopics = (r.description || "")
          .split(/•|\n/)
          .map((s: string) => s.trim())
          .filter(Boolean);

        const topics = rawTopics.length > 0 ? rawTopics : [r.topicName || "1 Subunits"];
        const unitNum = r.chapterNumber ? `Unit ${r.chapterNumber}` : `Unit ${allSyllabus.length + 1}`;
        const clsStr = r.class ? (r.class.startsWith("Class") ? r.class : `Class ${r.class}`) : `Class ${assignedClasses[0]?.className || "11"}`;

        allSyllabus.push({
          id: r.id || `syl-${Math.random()}`,
          unitNumber: unitNum,
          title: r.chapter || r.title || r.lessonTitle || "Syllabus Unit",
          subject: subName,
          class: clsStr,
          term: r.term || "Term 1",
          topics,
          status: (r.status?.toLowerCase() === "completed" || r.status?.toLowerCase() === "enabled" || r.status?.toLowerCase() === "active") ? "completed" : "in-progress",
          completionPct: (r.status?.toLowerCase() === "completed" || r.status?.toLowerCase() === "enabled" || r.status?.toLowerCase() === "active") ? 100 : 75,
          url: r.url || "#",
        });
      }
    });

    return { resources: allResources, syllabus: allSyllabus };
  }, [dbResources, dbSubjects, assignedClasses, session]);

  // Filtering function strictly enforcing Class & Subject condition
  const isMatchClassAndSubject = useCallback((itemClass?: string, itemSubject?: string) => {
    // Subject filter
    if (selectedSubject !== "All") {
      if (!itemSubject || itemSubject.toLowerCase() !== selectedSubject.toLowerCase()) {
        return false;
      }
    }

    // Class filter condition
    if (selectedClass !== "ALL") {
      if (!itemClass) return true; // General applies to all
      const cleanSelected = selectedClass.replace(/^Class\s*/i, "").trim().toLowerCase();
      const cleanItem = itemClass.replace(/^Class\s*/i, "").trim().toLowerCase();

      const selNum = cleanSelected.match(/\d+/)?.[0];
      const itemNum = cleanItem.match(/\d+/)?.[0];

      if (cleanSelected.includes("-")) {
        // Class-section filter e.g. "7-a"
        if (cleanItem === cleanSelected) return true;
        if (itemNum && selNum && selNum === itemNum && !cleanItem.includes("-")) return true;
        return false;
      } else {
        // Grade level filter e.g. "7"
        if (selNum && itemNum && selNum === itemNum) return true;
        if (cleanItem === cleanSelected) return true;
        return false;
      }
    }

    return true;
  }, [selectedClass, selectedSubject]);

  // Filtered resources for current view & tab
  const filteredResources = useMemo(() => {
    return masterAcademicsData.resources.filter((r) => {
      if (!isMatchClassAndSubject(r.class, r.subject)) return false;
      if (activeTab !== "overview" && activeTab !== "subjects" && r.category !== activeTab) return false;
      if (showSavedOnly && !bookmarks.includes(r.id)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [masterAcademicsData.resources, isMatchClassAndSubject, activeTab, showSavedOnly, bookmarks, search]);

  // Filtered syllabus for syllabus tab
  const filteredSyllabus = useMemo(() => {
    return masterAcademicsData.syllabus.filter((s) => {
      return isMatchClassAndSubject(s.class, s.subject);
    });
  }, [masterAcademicsData.syllabus, isMatchClassAndSubject]);

  const syllabusSubjectsForClass = useMemo(() => {
    const subsMap = new Map<string, { name: string; icon: string }>();

    assignedClasses.forEach((c) => {
      const theme = SUBJECT_THEMES[c.subject] || { icon: "📚" };
      subsMap.set(c.subject.toLowerCase(), { name: c.subject, icon: theme.icon });
    });

    return Array.from(subsMap.values());
  }, [assignedClasses]);

  const teacherSyllabusChapters = useMemo(() => {
    return masterAcademicsData.syllabus.filter((unit) => {
      const matchSubject = !selectedSyllabusSubject || unit.subject.toLowerCase() === selectedSyllabusSubject.toLowerCase();
      const matchClass = !syllabusClass || unit.class.toLowerCase().includes(syllabusClass.toLowerCase());
      const matchSearch = !syllabusSearchQuery.trim() ||
        unit.title.toLowerCase().includes(syllabusSearchQuery.toLowerCase()) ||
        unit.topics.some((t) => t.toLowerCase().includes(syllabusSearchQuery.toLowerCase()));

      return matchSubject && matchClass && matchSearch;
    });
  }, [masterAcademicsData.syllabus, selectedSyllabusSubject, syllabusClass, syllabusSearchQuery]);

  // Category counts
  const countByCategory = useCallback((catKey: CategoryKey) => {
    if (catKey === "syllabus") {
      return filteredSyllabus.length;
    }
    return masterAcademicsData.resources.filter((r) => {
      return r.category === catKey && isMatchClassAndSubject(r.class, r.subject);
    }).length;
  }, [masterAcademicsData, filteredSyllabus.length, isMatchClassAndSubject]);

  const continueWatching = useMemo(() => {
    return filteredResources.filter((r) => r.category === "videos" && (r.progress || 0) > 0 && (r.progress || 0) < 100);
  }, [filteredResources]);

  const newThisWeek = useMemo(() => {
    return filteredResources.filter((r) => r.isNew);
  }, [filteredResources]);

  const getYouTubeThumbnailUrl = (url: string) => {
    if (!url) return null;
    try {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
          return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
        }
      }
    } catch { }
    return null;
  };

  const getFileUrl = (url: string) => {
    if (!url || url === "#") return "#";
    if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return url.startsWith("/") ? `${API_URL}${url}` : `${API_URL}/${url}`;
  };

  const handleDownload = async (resource: Resource) => {
    if (!resource.url) {
      alert("No download link available for this resource.");
      return;
    }
    const downloadUrl = getFileUrl(resource.url);
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error("Network response error");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      let filename = `${resource.subject}_${resource.title}`.replace(/[^a-zA-Z0-9_\-]/g, "_");
      filename += resource.type === "Video" ? ".mp4" : ".pdf";
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(downloadUrl, "_blank");
    }
  };

  // AI Teacher Generator
  const handleAITeacherGenerate = async (optKey: string, customPrompt?: string) => {
    const targetTitle = teacherAIModal.resource?.title || teacherAIModal.syllabusUnit?.title || "Topic Lesson";
    const targetSubject = teacherAIModal.resource?.subject || teacherAIModal.syllabusUnit?.subject || "Subject";
    const targetClass = teacherAIModal.resource?.class || teacherAIModal.syllabusUnit?.class || "Class 10";

    setTeacherAIModal(prev => ({ ...prev, option: optKey, isGenerating: true }));

    let prompt = "";
    if (optKey === "lesson-plan") {
      prompt = `Create a comprehensive lesson plan for "${targetTitle}" (${targetSubject}, ${targetClass}). Include: 1. Learning Objectives, 2. Introduction, 3. Core concepts breakdown, 4. Interactive questions, 5. Classroom activity.`;
    } else if (optKey === "quiz") {
      prompt = `Generate a 5-question multiple choice quiz with answers and detailed explanations for "${targetTitle}" (${targetSubject}, ${targetClass}).`;
    } else if (optKey === "notes") {
      prompt = `Extract summary revision notes, key definitions, and key formulas for "${targetTitle}" (${targetSubject}, ${targetClass}).`;
    } else if (optKey === "worksheet") {
      prompt = `Create a student practice worksheet with 3 short-answer questions and 2 conceptual thinking problems for "${targetTitle}".`;
    } else if (optKey === "custom" && customPrompt) {
      prompt = customPrompt;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/ai/chat-tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: targetSubject,
          grade: targetClass,
          messages: [],
          currentMessage: prompt,
          language: "bilingual"
        })
      });
      const data = await res.json();
      if (data.success && data.text) {
        setTeacherAIModal(prev => ({ ...prev, responseText: data.text, isGenerating: false }));
      } else {
        throw new Error("Generation error");
      }
    } catch {
      setTimeout(() => {
        const mockText = `📚 TEACHER AI GENERATED CONTENT: ${optKey.toUpperCase()}\nTopic: ${targetTitle}\nSubject: ${targetSubject} | ${targetClass}\n\n🎯 LEARNING OBJECTIVES:\n• Master core concepts and equations of ${targetTitle}.\n• Solve standard 5-mark state board examination problems.\n• Relate theories to practical real-world applications.\n\n📝 CONTENT BREAKDOWN:\n1. Key Definition: Fundamental laws and standard notations.\n2. Key Equation: Solved numerical steps with clear explanations.\n3. Board Exam Tip: Common mistakes to avoid during final writing.\n\n❓ QUICK QUIZ / CHECK FOR UNDERSTANDING:\nQ1. Define the primary concept in 2 sentences.\nQ2. State two applications in modern technology.`;
        setTeacherAIModal(prev => ({ ...prev, responseText: mockText, isGenerating: false }));
      }, 1200);
    }
  };

  const handleSaveGeneratedResource = async () => {
    if (!teacherAIModal.responseText) return;
    const targetTitle = teacherAIModal.resource?.title || teacherAIModal.syllabusUnit?.title || "AI Lesson Notes";
    const targetSubject = teacherAIModal.resource?.subject || teacherAIModal.syllabusUnit?.subject || "Physics";
    const targetClass = teacherAIModal.resource?.class || teacherAIModal.syllabusUnit?.class || "11";

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    let foundSub = dbSubjects.find(s => s.name === targetSubject);
    const subjectId = foundSub?.id || dbSubjects[0]?.id || "sub-default";

    const newResData = {
      title: `${teacherAIModal.option === "lesson-plan" ? "Lesson Plan" : teacherAIModal.option === "quiz" ? "Quiz" : "Notes"} - ${targetTitle}`,
      subjectId: subjectId,
      category: teacherAIModal.option === "lesson-plan" ? "materials" : "notes",
      type: "DOC",
      meta: "Generated by Teacher AI",
      description: teacherAIModal.responseText.substring(0, 180) + "...",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      status: "Active",
      class: targetClass,
      addedBy: session?.user?.name || "Class Teacher"
    };

    try {
      const res = await fetch(`${API_URL}/api/superadmin/academics/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newResData)
      });
      if (res.ok) {
        const savedRes = await res.json();
        setDbResources(prev => [savedRes, ...prev]);
      }
    } catch {
      // Local addition
      setDbResources(prev => [{ ...newResData, id: `gen-${Date.now()}` }, ...prev]);
    }
    alert("Resource successfully created and added to Academics Hub!");
    setTeacherAIModal(prev => ({ ...prev, isOpen: false }));
  };

  // Close modal on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPreviewResource(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ── Component Cards ── */
  const SubjectBadge = ({ name, classNameTag }: { name: string; classNameTag?: string }) => {
    const theme = SUBJECT_THEMES[name] || { color: "#6366f1", icon: "📚" };
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
        style={{ backgroundColor: `${theme.color}1a`, color: theme.color }}
      >
        {theme.icon} {name} {classNameTag ? `· ${classNameTag}` : ""}
      </span>
    );
  };

  const ResourceCard = ({ r }: { r: Resource }) => {
    const saved = bookmarks.includes(r.id);
    const theme = SUBJECT_THEMES[r.subject] || { color: "#6366f1", icon: "📚" };
    return (
      <div className="glass rounded-2xl p-5 border border-[var(--border)] hover:-translate-y-1 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
        <div
          className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-25 transition-opacity"
          style={{ backgroundColor: theme.color }}
        />
        <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
          <div
            className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${TYPE_COLORS[r.type]}`}
          >
            <Fi name={TYPE_ICONS[r.type]} className="text-xl" />
          </div>
          <div className="flex items-center gap-1.5">
            {r.isNew && (
              <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full">
                New
              </span>
            )}
            {r.popular && (
              <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full flex items-center gap-0.5">
                <Fi name="star" className="text-[10px]" /> Popular
              </span>
            )}
            <button
              onClick={() => toggleBookmark(r.id)}
              className={`p-1.5 rounded-lg transition-all active:scale-90 ${saved
                ? "text-amber-500 bg-amber-500/10"
                : "text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-500/10"
                }`}
              title={saved ? "Remove bookmark" : "Bookmark for later"}
            >
              <Fi name="bookmark" className={`text-base ${saved ? "" : "opacity-70"}`} />
            </button>
          </div>
        </div>

        <div className="mb-1.5 relative z-10">
          <SubjectBadge name={r.subject} classNameTag={r.class} />
        </div>
        <h3 className="text-sm font-bold text-[var(--text-heading)] leading-snug mb-1.5 relative z-10">
          {r.title}
        </h3>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3 line-clamp-2 relative z-10">
          {r.description}
        </p>

        {r.addedBy && (
          <p className="text-[10px] text-[var(--text-muted)] mb-2 relative z-10">
            👨‍🏫 <span className="font-semibold">{r.addedBy}</span> · {r.date}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border)] relative z-10">
          <span className="text-[10px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
            <Fi name="clock" className="text-xs" /> {r.meta}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() =>
                setTeacherAIModal({
                  isOpen: true,
                  resource: r,
                  syllabusUnit: null,
                  option: "lesson-plan",
                  responseText: "",
                  isGenerating: false,
                })
              }
              className="p-1.5 rounded-lg border border-[var(--border)] text-indigo-500 hover:bg-indigo-500/10 text-xs"
              title="AI Lesson Generator"
            >
              <Fi name="sparkles" className="text-xs" />
            </button>
            <button
              onClick={() => handleDownload(r)}
              className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-emerald-500 hover:bg-emerald-500/10 text-xs"
              title="Download Resource"
            >
              <Fi name="download" className="text-xs" />
            </button>
            <button
              onClick={() => setPreviewResource(r)}
              className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md active:scale-95 transition-all"
              style={{ background: `linear-gradient(135deg, ${theme.color}, ${theme.color}cc)`, color: "#fff" }}
            >
              <Fi name="eye" className="text-xs" /> Open
            </button>
          </div>
        </div>
      </div>
    );
  };

  const VideoCard = ({ r }: { r: Resource }) => {
    const theme = SUBJECT_THEMES[r.subject] || { color: "#6366f1", icon: "📚", gradient: "from-indigo-500 to-violet-600" };
    const saved = bookmarks.includes(r.id);
    const youtubeThumbnail = getYouTubeThumbnailUrl(r.url || "");
    return (
      <div className="glass rounded-2xl border border-[var(--border)] overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all group flex flex-col">
        <button
          onClick={() => setPreviewResource(r)}
          className={`relative h-36 bg-gradient-to-br ${theme.gradient} flex items-center justify-center overflow-hidden`}
        >
          {youtubeThumbnail ? (
            <img src={youtubeThumbnail} alt={r.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <>
              <span className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
              <span className="text-5xl opacity-30 absolute left-4 bottom-3">{theme.icon}</span>
            </>
          )}
          <span className="w-14 h-14 rounded-full bg-white/30 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg z-10">
            <Fi name="play" className="text-3xl text-white" />
          </span>
          <span
            className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/70 px-2 py-0.5 rounded-md flex items-center gap-1 z-10 text-white"
          >
            <Fi name="clock" className="text-[10px]" /> {r.meta}
          </span>
          {(r.progress || 0) > 0 && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
              <span className="block h-full bg-red-500" style={{ width: `${r.progress}%` }} />
            </span>
          )}
        </button>
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <SubjectBadge name={r.subject} classNameTag={r.class} />
            <button
              onClick={() => toggleBookmark(r.id)}
              className={`p-1 rounded-md transition-all active:scale-90 ${saved ? "text-amber-500" : "text-[var(--text-muted)] hover:text-amber-500"
                }`}
            >
              <Fi name="bookmark" className={`text-base ${saved ? "" : "opacity-70"}`} />
            </button>
          </div>
          <h3 className="text-sm font-bold text-[var(--text-heading)] leading-snug mb-2">{r.title}</h3>
          <div className="mt-auto flex items-center justify-between pt-2 border-t border-[var(--border)]">
            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
              <Fi name="check" className="text-[10px]" /> {r.progress}% Watched
            </span>
            <button
              onClick={() => setPreviewResource(r)}
              className="text-[11px] font-bold flex items-center gap-1 hover:gap-1.5 transition-all"
              style={{ color: theme.color }}
            >
              Watch Video <Fi name="arrow-small-right" className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <PortalLayout
      title="Teacher Academics & Subjects Hub"
      subtitle="Class & Subject based curriculum content, syllabus tracking, textbooks, materials, and AI tools."
      themeClass="theme-teacher"
    >
      {/* ── Hero Banner ── */}
      <div className="hero-band relative rounded-3xl overflow-hidden mb-6 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 md:p-8 shadow-xl text-white">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-fuchsia-400/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 justify-between text-white">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center !text-white" style={{ color: "#ffffff" }}>
                <Fi name={selectedBoard === "CBSE" ? "graduation-cap" : "bank"} className="text-xl text-white" style={{ color: "#ffffff" }} />
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur text-white border border-white/20" style={{ color: "#ffffff" }}>
                Teacher Academic Workspace
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur text-white border border-white/25" style={{ color: "#ffffff" }}>
                {selectedBoard === "CBSE" ? "CBSE (NCERT)" : selectedBoard === "ICSE" ? "ICSE (CISCE)" : selectedBoard === "Matriculation" ? "Matriculation" : selectedBoard === "All" ? "All School Boards" : "Tamil Nadu State Board"}
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-black mb-1 !text-white" style={{ color: "#ffffff" }}>
              Class &amp; Subject Curriculum Hub
            </p>
            <p className="text-sm max-w-xl mb-4 !text-white/95" style={{ color: "rgba(255, 255, 255, 0.95)" }}>
              {selectedBoard === "CBSE"
                ? "Browse CBSE curriculum, NCERT textbooks, AISSE/AISSCE materials, and generate AI lesson plans for your assigned classes."
                : "Browse textbooks, syllabus units, study materials, video lessons, and generate AI lesson plans for your assigned classes."}
            </p>

            {/* Board Selector Quick Switcher Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 mr-1 text-white" style={{ color: "#ffffff" }}>
                <Fi name="settings-sliders" className="text-xs text-white" style={{ color: "#ffffff" }} />
                <span style={{ color: "#ffffff" }}>Board:</span>
              </span>
              {SCHOOL_BOARDS.map(b => {
                const isActive = selectedBoard === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBoard(b.id)}
                    style={isActive ? { color: "#000000", backgroundColor: "#ffffff" } : { color: "#ffffff", backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer select-none ${isActive
                      ? "hero-board-active !text-black !bg-white shadow-lg scale-105"
                      : "hover:bg-white/30 border border-white/25 !text-white"
                      }`}
                  >
                    <Fi name={b.icon} className={`text-xs ${isActive ? "!text-black" : "!text-white"}`} style={isActive ? { color: "#000000" } : { color: "#ffffff" }} />
                    <span className={isActive ? "!text-black font-black" : "!text-white"} style={isActive ? { color: "#000000" } : { color: "#ffffff" }}>{b.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            {[
              { label: "Classes", value: assignedClasses.length, icon: "graduation-cap" },
              { label: "Subjects", value: availableSubjectsList.length, icon: "books" },
              { label: "Resources", value: masterAcademicsData.resources.length, icon: "document" },
              { label: "Saved", value: bookmarks.length, icon: "bookmark" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/20 backdrop-blur rounded-2xl px-4 py-3 text-center border border-white/30 text-white"
              >
                <Fi name={s.icon} className="text-sm mx-auto mb-1 !text-white" />
                <div className="text-2xl font-black !text-white leading-none mb-1" style={{ color: "#ffffff" }}>{s.value}</div>
                <div className="text-[10px] font-black !text-white uppercase tracking-wider" style={{ color: "#ffffff" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Class & Subject Filter Rail ── */}
      <div className="glass rounded-2xl p-4 border border-[var(--border)] mb-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Class Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-[var(--text-heading)] shrink-0 flex items-center gap-1.5">
            <Fi name="filter" className="text-indigo-500" /> Filter Class:
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3.5 py-2 glass border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--text-heading)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all cursor-pointer bg-[var(--bg-card)]"
          >
            <option value="ALL">All My Assigned Classes ({assignedClasses.length})</option>
            {assignedClasses.map((c) => {
              const val = `Class ${c.className}-${c.section}`;
              return (
                <option key={c.id} value={val}>
                  Class {c.className} - {c.section} ({c.subject})
                </option>
              );
            })}
          </select>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-thin py-1">
          <button
            onClick={() => setSelectedSubject("All")}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${selectedSubject === "All"
              ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
              : "glass border-[var(--border)] text-[var(--text-main)] hover:border-indigo-400"
              }`}
          >
            <Fi name="apps" className="text-xs" /> All Subjects
          </button>
          {availableSubjectsList.map((s) => {
            const active = selectedSubject === s.name;
            return (
              <button
                key={s.name}
                onClick={() => setSelectedSubject(active ? "All" : s.name)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95 ${active ? "shadow-md text-white" : "glass text-[var(--text-main)] hover:shadow"
                  }`}
                style={
                  active
                    ? { backgroundColor: s.color, borderColor: s.color }
                    : { borderColor: `${s.color}55` }
                }
              >
                <span>{s.icon}</span> {s.name}{" "}
                <span className="text-[9px] opacity-75 font-normal">
                  ({s.classes.join(", ").replace(/Class\s*/g, "")})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Category Tabs with Arrow Navigation ── */}
      <div className="relative flex items-center group mb-5">
        {/* Left Arrow Mark */}
        {canScrollLeft && (
          <div className="absolute left-0 inset-y-0 z-20 flex items-center pl-1.5 pr-4 bg-gradient-to-r from-[var(--bg-card,#ffffff)] via-[var(--bg-card,#ffffff)]/95 to-transparent rounded-l-2xl pointer-events-none">
            <button
              onClick={() => scrollTabs("left")}
              type="button"
              className="pointer-events-auto h-7 w-7 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 hover:scale-110 active:scale-95 transition-all cursor-pointer"
              aria-label="Scroll left"
              title="Previous tabs"
            >
              <FiChevronLeftIcon className="text-sm" />
            </button>
          </div>
        )}

        {/* Scrollable Tabs */}
        <div
          ref={tabsContainerRef}
          onScroll={checkScroll}
          className="w-full glass rounded-2xl border border-[var(--border)] p-1.5 flex gap-1 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
        >
          {CATEGORIES.map((c) => {
            const active = activeTab === c.key;
            const count = c.key === "overview" || c.key === "subjects" ? null : countByCategory(c.key);

            return (
              <button
                key={c.key}
                onClick={() => setActiveTab(c.key)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 select-none whitespace-nowrap cursor-pointer ${active
                  ? "shadow-md text-white font-extrabold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card-hover)]"
                  }`}
                style={active ? { background: getCategoryGradient(c.key) } : undefined}
              >
                <Fi name={c.icon} className="text-sm" />
                <span>{c.label}</span>
                {count !== null && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${active ? "bg-white/25 text-white" : "bg-[var(--bg-card-hover)] border border-[var(--border)]"
                      }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Arrow Mark */}
        {canScrollRight && (
          <div className="absolute right-0 inset-y-0 z-20 flex items-center pr-1.5 pl-4 bg-gradient-to-l from-[var(--bg-card,#ffffff)] via-[var(--bg-card,#ffffff)]/95 to-transparent rounded-r-2xl pointer-events-none">
            <button
              onClick={() => scrollTabs("right")}
              type="button"
              className="pointer-events-auto h-7 w-7 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 hover:scale-110 active:scale-95 transition-all cursor-pointer"
              aria-label="Scroll right"
              title="Next tabs"
            >
              <FiChevronRightIcon className="text-sm" />
            </button>
          </div>
        )}
      </div>

      {/* ── Search Bar ── */}
      {activeTab !== "overview" && activeTab !== "subjects" && activeTab !== "syllabus" && (
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              <Fi name="search" className="text-sm" />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-10 pr-4 py-2.5 glass border border-[var(--border)] rounded-xl text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-heading)]"
              >
                <Fi name="cross-small" className="text-base" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${showSavedOnly
              ? "bg-amber-500 border-amber-500 text-white shadow-md"
              : "glass border-[var(--border)] text-[var(--text-main)] hover:border-amber-400"
              }`}
          >
            <Fi name="bookmark" className="text-sm" />
            Saved Only {bookmarks.length > 0 && `(${bookmarks.length})`}
          </button>
        </div>
      )}

      {/* ══ OVERVIEW TAB ═════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.filter((c) => c.key !== "overview").map((c) => {
              const count =
                c.key === "subjects"
                  ? assignedClasses.length
                  : c.key === "syllabus"
                    ? filteredSyllabus.length
                    : countByCategory(c.key);
              return (
                <button
                  key={c.key}
                  onClick={() => setActiveTab(c.key)}
                  className="glass rounded-2xl p-5 border border-[var(--border)] text-left hover:-translate-y-1 hover:shadow-xl transition-all group relative overflow-hidden"
                >
                  <div
                    className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-15 group-hover:opacity-35 transition-opacity"
                    style={{ background: getCategoryGradient(c.key) }}
                  />
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform text-white"
                    style={{ background: getCategoryGradient(c.key) }}
                  >
                    <Fi name={c.icon} className="text-xl" />
                  </div>
                  <h3 className="text-sm font-black text-[var(--text-heading)] mb-1 flex items-center gap-1.5">
                    {c.label}
                    <Fi
                      name="arrow-small-right"
                      className="text-sm opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    />
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-2">{c.blurb}</p>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">
                    {count} {c.key === "subjects" ? "Classes" : c.key === "syllabus" ? "Units" : "Items"} Available
                  </span>
                </button>
              );
            })}
          </div>

          {/* Continue Watching */}
          {continueWatching.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-black text-[var(--text-heading)] flex items-center gap-2">
                  <Fi name="play-alt" className="text-base text-red-500" /> Continue Watching Lessons
                </h2>
                <button
                  onClick={() => setActiveTab("videos")}
                  className="text-xs font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1"
                >
                  All videos <Fi name="angle-small-right" className="text-sm" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {continueWatching.slice(0, 4).map((r) => (
                  <VideoCard key={r.id} r={r} />
                ))}
              </div>
            </div>
          )}

          {/* Recent Resources */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-black text-[var(--text-heading)] flex items-center gap-2">
                <Fi name="sparkles" className="text-base text-emerald-500" /> Featured Academic Resources
              </h2>
              {selectedClass !== "ALL" && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
                  <Fi name="filter" className="text-xs" /> Class Condition: <strong className="font-black">{selectedClass}</strong>
                  <button
                    onClick={() => setSelectedClass("ALL")}
                    className="ml-1 hover:text-red-500 text-xs font-bold"
                    title="Clear Class Condition"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResources.slice(0, 6).map((r) => (
                  <ResourceCard key={r.id} r={r} />
                ))}
              </div>
            ) : (
              <div className="glass rounded-2xl p-8 text-center border border-[var(--border)] flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xl mb-2">
                  <Fi name="document" />
                </div>
                <h4 className="text-sm font-black text-[var(--text-heading)] mb-1">
                  No Academic Resources Posted Yet
                </h4>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mb-3">
                  Super Admin has not posted resources in PostgreSQL for your assigned classes ({assignedClasses.map(c => `Class ${c.className} ${c.subject}`).join(", ")}) yet.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ CLASS SUBJECTS TAB ═══════════════════════════ */}
      {activeTab === "subjects" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assignedClasses
            .filter((c) => {
              if (selectedSubject !== "All" && c.subject.toLowerCase() !== selectedSubject.toLowerCase()) return false;
              if (selectedClass !== "ALL") {
                const fullCls = `Class ${c.className}-${c.section}`;
                if (fullCls.toLowerCase() !== selectedClass.toLowerCase() && c.className !== selectedClass) return false;
              }
              return true;
            })
            .map((c) => {
              const theme = SUBJECT_THEMES[c.subject] || { color: "#6366f1", icon: "📚", gradient: "from-indigo-500 to-violet-600" };
              const subSyllabus = masterAcademicsData.syllabus.filter(
                (s) => s.subject.toLowerCase() === c.subject.toLowerCase() && isMatchClassAndSubject(s.class, s.subject)
              );
              const doneUnits = subSyllabus.filter((s) => s.status === "completed").length;
              const totalUnits = subSyllabus.length;
              const progressPct = totalUnits > 0 ? Math.round((doneUnits / totalUnits) * 100) : 0;

              return (
                <div
                  key={c.id}
                  className="glass rounded-2xl p-6 border border-[var(--border)] hover:-translate-y-1 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col"
                >
                  <div
                    className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-15 group-hover:opacity-30 transition-opacity"
                    style={{ backgroundColor: theme.color }}
                  />
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-105 transition-transform text-white`}
                    >
                      {theme.icon}
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-[var(--text-heading)]">{progressPct}%</span>
                      <span className="block text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                        Syllabus done
                      </span>
                    </div>
                  </div>

                  <h2 className="text-lg font-black text-[var(--text-heading)] mb-0.5 relative z-10">
                    {c.subject}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mb-3 relative z-10 flex items-center gap-2">
                    <span className="font-bold text-indigo-500">Class {c.className} - {c.section}</span>
                    <span>· {c.roomNumber || "Room 10"}</span>
                  </p>

                  <div className="mb-4 relative z-10">
                    <div className="flex justify-between text-[10px] font-bold text-[var(--text-muted)] mb-1.5">
                      <span>{doneUnits} of {totalUnits} Units Completed</span>
                      <span>{progressPct}% Progress</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${progressPct}%`,
                          background: `linear-gradient(90deg, ${theme.color}, ${theme.color}bb)`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-auto relative z-10">
                    {[
                      { key: "textbooks" as CategoryKey, icon: "book", label: "Books" },
                      { key: "materials" as CategoryKey, icon: "document", label: "Notes" },
                      { key: "videos" as CategoryKey, icon: "play-alt", label: "Videos" },
                      { key: "syllabus" as CategoryKey, icon: "book-alt", label: "Units" },
                    ].map((a) => (
                      <button
                        key={a.key}
                        onClick={() => {
                          setSelectedSubject(c.subject);
                          setSelectedClass(`Class ${c.className}-${c.section}`);
                          setActiveTab(a.key);
                        }}
                        className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-card-hover)] hover:-translate-y-0.5 active:scale-95 transition-all"
                      >
                        <span style={{ color: theme.color }}>
                          <Fi name={a.icon} className="text-base" />
                        </span>
                        <span className="text-[9px] font-bold text-[var(--text-muted)]">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ══ DEDICATED SYLLABUS MANAGEMENT TAB ════════════════════ */}
      {activeTab === "syllabus" && (
        <div className="space-y-6 text-left font-sans">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                  <Fi name="book-alt" className="text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[var(--text-heading)]">
                    Syllabus Management
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Manage state curriculum by class, subject, and chapter. Control AI mapping and chapter visibility.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal Class Pills Selection Bar */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {assignedClasses.map((cls) => {
              const fullClassName = `Class ${cls.className}-${cls.section}`;
              const isSelected = syllabusClass === cls.className || syllabusClass === fullClassName;
              return (
                <button
                  key={cls.id}
                  onClick={() => {
                    setSyllabusClass(cls.className);
                    setSelectedSyllabusSubject(cls.subject);
                    setSelectedClass(fullClassName);
                  }}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${isSelected
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/25 scale-[1.02]"
                      : "glass border border-[var(--border)] text-[var(--text-main)] hover:border-amber-400"
                    }`}
                >
                  <span>{fullClassName}</span>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md transition-colors ${isSelected
                        ? "bg-white/20 text-white"
                        : "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50"
                      }`}
                  >
                    {cls.subject}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 2-Column Main Layout: Left Subjects Panel & Right Chapters Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: SUBJECTS List */}
            <div className="lg:col-span-3 space-y-3">
              <div className="text-[11px] font-black uppercase tracking-wider text-[var(--text-muted)] px-1">
                SUBJECTS
              </div>
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                {syllabusSubjectsForClass.map((sub) => {
                  const isSelected = selectedSyllabusSubject.toLowerCase() === sub.name.toLowerCase();
                  const chapters = masterAcademicsData.syllabus.filter((unit) => {
                    const matchSubject = unit.subject.toLowerCase() === sub.name.toLowerCase();
                    const matchClass = !syllabusClass || unit.class.toLowerCase().includes(syllabusClass.toLowerCase());
                    return matchSubject && matchClass;
                  });
                  const totalCount = chapters.length;
                  const aiCount = chapters.filter((c) => c.topics.some((t) => t.toLowerCase().includes("ai"))).length;

                  return (
                    <div
                      key={sub.name}
                      onClick={() => {
                        setSelectedSyllabusSubject(sub.name);
                        setSelectedSubject(sub.name);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${isSelected
                          ? "bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 border-l-[5px] !border-l-amber-500 dark:!border-l-amber-400 shadow-sm"
                          : "glass border-[var(--border)] border-l-[5px] border-l-transparent hover:border-slate-300 dark:hover:border-slate-700 hover:border-l-amber-300 shadow-sm"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl shrink-0">{sub.icon}</span>
                        <div>
                          <h4 className={`font-extrabold text-sm leading-snug ${isSelected ? "text-amber-950 dark:text-amber-100" : "text-[var(--text-heading)]"}`}>
                            {sub.name}
                          </h4>
                          <p className="text-[10px] text-[var(--text-muted)] font-semibold mt-0.5">
                            {totalCount} chapters · {aiCount} AI
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Chapters Detail Table & Controls */}
            <div className="lg:col-span-9 glass border border-[var(--border)] rounded-3xl p-6 shadow-sm min-h-[500px] flex flex-col justify-between">
              <div>
                {/* Header Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[var(--border)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{SUBJECT_THEMES[selectedSyllabusSubject]?.icon || "📐"}</span>
                      <h3 className="text-lg font-black text-[var(--text-heading)]">
                        {selectedSyllabusSubject} — Class {syllabusClass}
                      </h3>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] font-semibold mt-0.5">
                      {teacherSyllabusChapters.length} chapters · {teacherSyllabusChapters.filter((c) => c.status === "completed").length} enabled · 0 AI-mapped
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Fi name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs" />
                      <input
                        type="text"
                        placeholder="Search chapters..."
                        value={syllabusSearchQuery}
                        onChange={(e) => setSyllabusSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-2 border border-[var(--border)] rounded-xl text-xs bg-[var(--bg-card)] outline-none text-[var(--text-heading)] focus:ring-2 focus:ring-amber-500/20 w-48 md:w-60"
                      />
                      {syllabusSearchQuery && (
                        <button
                          onClick={() => setSyllabusSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setTeacherAIModal({
                          isOpen: true,
                          resource: null,
                          syllabusUnit: null,
                          option: "lesson-plan",
                          responseText: "",
                          isGenerating: false,
                        });
                      }}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                      style={{ color: "#ffffff" }}
                    >
                      <Fi name="upload" className="text-xs !text-white" />
                      <span style={{ color: "#ffffff" }}>Upload Image / Screenshot</span>
                    </button>

                    <button
                      onClick={() => {
                        setTeacherAIModal({
                          isOpen: true,
                          resource: null,
                          syllabusUnit: null,
                          option: "lesson-plan",
                          responseText: "",
                          isGenerating: false,
                        });
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      + Chapter
                    </button>
                  </div>
                </div>

                {/* Table Area */}
                <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--border)]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[var(--bg-card-hover)] border-b border-[var(--border)] text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                        <th className="py-3 px-4 w-12 text-center">NO</th>
                        <th className="py-3 px-4">CHAPTER TITLE</th>
                        <th className="py-3 px-4">TOPICS</th>
                        <th className="py-3 px-4">AI MAPPING</th>
                        <th className="py-3 px-4 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] text-xs font-medium">
                      {teacherSyllabusChapters.length > 0 ? (
                        teacherSyllabusChapters.map((ch, idx) => (
                          <tr key={ch.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                            <td className="py-3.5 px-4 font-extrabold text-[var(--text-muted)] text-center">
                              {String(idx + 1).padStart(2, "0")}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-[var(--text-heading)]">{ch.title}</div>
                              {ch.topics && ch.topics.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {ch.topics.map((t, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--bg-card-hover)] text-[var(--text-main)] border border-[var(--border)]"
                                    >
                                      • {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-[var(--text-muted)]">
                              {ch.topics.length} Subunits
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                                Not Mapped
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">
                                  Enabled
                                </span>
                                <button
                                  onClick={() =>
                                    setTeacherAIModal({
                                      isOpen: true,
                                      resource: null,
                                      syllabusUnit: ch,
                                      option: "lesson-plan",
                                      responseText: "",
                                      isGenerating: false,
                                    })
                                  }
                                  className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-all"
                                  title="Generate AI Lesson Plan"
                                >
                                  <Fi name="sparkles" className="text-xs" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-16 text-center text-[var(--text-muted)]">
                            <div className="flex flex-col items-center justify-center">
                              <Fi name="book-alt" className="text-4xl text-amber-500/40 mb-2" />
                              <p className="font-bold text-sm text-[var(--text-heading)]">No chapters found</p>
                              <p className="text-xs text-[var(--text-muted)] mt-1">
                                Super Admin has not created chapters for {selectedSyllabusSubject} (Class {syllabusClass}) yet.
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

      {/* ══ VIDEO LESSONS TAB ════════════════════════════ */}
      {activeTab === "videos" && (
        filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredResources.map((r) => (
              <VideoCard key={r.id} r={r} />
            ))}
          </div>
        ) : (
          <div className="glass rounded-3xl p-12 text-center border border-[var(--border)] my-6 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center text-3xl mb-3">
              <Fi name="play-alt" />
            </div>
            <h3 className="text-base font-black text-[var(--text-heading)] mb-1">
              No Video Lessons Posted Yet
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-md">
              No video lesson resources found in PostgreSQL for your assigned classes ({assignedClasses.map(c => `Class ${c.className} ${c.subject}`).join(", ")}) yet.
            </p>
          </div>
        )
      )}

      {/* ══ RESOURCE GRID TABS (textbooks / materials / notes / digital / reference) ══ */}
      {["textbooks", "materials", "notes", "digital", "reference"].includes(activeTab) && (
        filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((r) => (
              <ResourceCard key={r.id} r={r} />
            ))}
          </div>
        ) : (
          <div className="glass rounded-3xl p-12 text-center border border-[var(--border)] my-6 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl mb-3">
              <Fi name="book" />
            </div>
            <h3 className="text-base font-black text-[var(--text-heading)] mb-1">
              No {CATEGORIES.find(c => c.key === activeTab)?.label} Posted Yet
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-md">
              No original resources posted by Super Admin in PostgreSQL for your assigned classes ({assignedClasses.map(c => `Class ${c.className} ${c.subject}`).join(", ")}) under this category.
            </p>
          </div>
        )
      )}

      {/* ══ PREVIEW MODAL ════════════════════════════════ */}
      {previewResource && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewResource(null)}
        >
          <div
            className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SubjectBadge name={previewResource.subject} classNameTag={previewResource.class} />
                <h3 className="text-base font-black text-[var(--text-heading)]">{previewResource.title}</h3>
              </div>
              <button
                onClick={() => setPreviewResource(null)}
                className="p-1.5 rounded-full hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)]"
              >
                <Fi name="cross-small" className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {previewResource.type === "Video" ? (
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner">
                  <iframe
                    src={previewResource.url?.includes("embed") ? previewResource.url : `https://www.youtube.com/embed/d7n7DdB-bHY`}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-[var(--border)]">
                  <p className="text-sm text-[var(--text-main)] leading-relaxed">{previewResource.description}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  Format: {previewResource.type} · Added by {previewResource.addedBy}
                </span>
                <button
                  onClick={() => handleDownload(previewResource)}
                  className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition-all"
                >
                  <Fi name="download" className="text-sm" /> Download File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ AI TEACHER TUTOR MODAL ═════════════════════════ */}
      {teacherAIModal.isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setTeacherAIModal(prev => ({ ...prev, isOpen: false }))}
        >
          <div
            className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[var(--border)] bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Fi name="sparkles" className="text-lg text-white" />
                </span>
                <div>
                  <h3 className="text-base font-black">AI Teacher Assistant</h3>
                  <p className="text-[11px] text-white/80">
                    Instant Lesson Plans, Quizzes, & Worksheets
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTeacherAIModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-full hover:bg-white/20 text-white"
              >
                <Fi name="cross-small" className="text-xl" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "lesson-plan", label: "Lesson Plan", icon: "book-alt" },
                  { key: "quiz", label: "5-MCQ Quiz", icon: "interrogation" },
                  { key: "notes", label: "Revision Notes", icon: "notebook" },
                  { key: "worksheet", label: "Worksheet", icon: "document" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handleAITeacherGenerate(opt.key)}
                    disabled={teacherAIModal.isGenerating}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${teacherAIModal.option === opt.key
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                      : "glass border-[var(--border)] text-[var(--text-heading)] hover:border-indigo-400"
                      }`}
                  >
                    <Fi name={opt.icon} className="text-xs" /> {opt.label}
                  </button>
                ))}
              </div>

              {teacherAIModal.isGenerating ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                  <span className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-[var(--text-heading)]">Generating AI Content...</p>
                </div>
              ) : teacherAIModal.responseText ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-[var(--border)] text-xs text-[var(--text-main)] font-mono whitespace-pre-wrap leading-relaxed">
                  {teacherAIModal.responseText}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                  Select an option above to generate tailored content for this topic.
                </div>
              )}
            </div>

            {teacherAIModal.responseText && (
              <div className="p-4 border-t border-[var(--border)] flex items-center justify-between bg-[var(--bg-card)]">
                <span className="text-[11px] text-[var(--text-muted)]">Ready to publish to Academics Hub?</span>
                <button
                  onClick={handleSaveGeneratedResource}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition-all"
                >
                  <Fi name="disk" className="text-xs" /> Save & Publish to Class
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
