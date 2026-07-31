"use client";

import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useStudentGroup } from "@/lib/useStudentGroup";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import { HS_GROUP_SUBJECTS, HS_GROUP_LABELS, getGroupSubjectsForClass } from "@/data/hsGroups";

/* ────────────────────────────────────────────────────────────
   Flaticon (uicons) glyph — the app loads uicons-regular-rounded,
   so every icon on this page is a `fi fi-rr-*` class.
──────────────────────────────────────────────────────────── */
const Fi = ({ name, className = "" }: { name: string; className?: string }) => (
  <i className={`fi fi-rr-${name} inline-flex items-center justify-center leading-none ${className}`} />
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
  category: Exclude<CategoryKey, "overview" | "subjects" | "syllabus">;
  type: "PDF" | "DOC" | "Video" | "Audio" | "Interactive" | "eBook" | "Link";
  meta: string; // size / pages / duration
  description: string;
  url?: string;
  addedBy?: string;
  date?: string;
  progress?: number; // for videos (0-100)
  isNew?: boolean;
  popular?: boolean;
}

interface SubjectInfo {
  name: string;
  color: string;
  gradient: string;
  icon: string;
  teacher: string;
  progress: number;
  units: number;
  unitsDone: number;
}

interface SyllabusUnit {
  unit: string;
  title: string;
  topics: string[];
  status: "completed" | "in-progress" | "upcoming";
  term: string;
  url?: string;
}

/* ────────────────────────────────────────────────────────────
   Category metadata for tabs & overview cards (flaticon names)
──────────────────────────────────────────────────────────── */
const getCategories = (lang: string): {
  key: CategoryKey;
  label: string;
  icon: string;
  gradient: string;
  blurb: string;
}[] => [
  { key: "overview", label: lang === "தமிழ்" ? "மேலோட்டம்" : "Overview", icon: "apps", gradient: "from-slate-500 to-slate-600", blurb: "" },
  { key: "subjects", label: lang === "தமிழ்" ? "வகுப்பு பாடங்கள்" : "Class Subjects", icon: "graduation-cap", gradient: "from-indigo-500 to-violet-500", blurb: lang === "தமிழ்" ? "உங்கள் பாடங்கள், ஆசிரியர்கள் மற்றும் முன்னேற்றம் ஒரே பார்வையில்" : "Your subjects, teachers and progress at a glance" },
  { key: "syllabus", label: lang === "தமிழ்" ? "பாடத்திட்டம்" : "Syllabus", icon: "book-alt", gradient: "from-emerald-500 to-teal-500", blurb: lang === "தமிழ்" ? "பருவம் வாரியாக அலகுகள் மற்றும் நிறைவு கண்காணிப்பு" : "Term-wise units with completion tracking" },
  { key: "textbooks", label: lang === "தமிழ்" ? "பாடப்புத்தகங்கள்" : "Textbooks", icon: "book", gradient: "from-amber-500 to-orange-500", blurb: lang === "தமிழ்" ? "அதிகாரப்பூர்வ சமச்சீர் கல்வி பாடப்புத்தகங்கள் & மின்னூல்கள்" : "Official Samacheer Kalvi textbooks & eBooks" },
  { key: "materials", label: lang === "தமிழ்" ? "படிப்புப் பொருட்கள்" : "Study Materials", icon: "document", gradient: "from-blue-500 to-sky-500", blurb: lang === "தமிழ்" ? "வினா வங்கி, வேலைத்தாள்கள் & திருப்புதல் வரைபடங்கள்" : "Question banks, worksheets & revision charts" },
  { key: "notes", label: lang === "தமிழ்" ? "ஆசிரியர் குறிப்புகள்" : "Teacher Notes", icon: "notebook", gradient: "from-pink-500 to-rose-500", blurb: lang === "தமிழ்" ? "வகுப்பு குறிப்புகள் மற்றும் ஆசிரியர்கள் பகிர்ந்த உதவிக்குறிப்புகள்" : "Class notes and tips shared by your teachers" },
  { key: "videos", label: lang === "தமிழ்" ? "வீடியோ பாடங்கள்" : "Video Lessons", icon: "play-alt", gradient: "from-red-500 to-orange-500", blurb: lang === "தமிழ்" ? "தொடர்ந்து பார்க்கும் வசதியுடன் பதிவுசெய்யப்பட்ட பாடங்கள்" : "Recorded lessons with resume support" },
  { key: "digital", label: lang === "தமிழ்" ? "டிஜிட்டல் உள்ளடக்கம்" : "Digital Content", icon: "computer", gradient: "from-purple-500 to-violet-500", blurb: lang === "தமிழ்" ? "செயல்முறை மாதிரிகள், ஆடியோ பாடங்கள் & மேலும்" : "Interactive sims, audio lessons & more" },
  { key: "reference", label: lang === "தமிழ்" ? "குறிப்புப் பொருட்கள்" : "Reference Materials", icon: "books", gradient: "from-cyan-500 to-sky-500", blurb: lang === "தமிழ்" ? "முந்தைய வினாத்தாள்கள், கலைச்சொற்கள் & கையேடுகள்" : "Past papers, glossaries & handbooks" },
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

/* ────────────────────────────────────────────────────────────
   Page component
──────────────────────────────────────────────────────────── */
export default function AcademicsHubPage() {
  const { data: session, status } = useSession();
  const { lang } = usePortalLanguage();
  const CATEGORIES = useMemo(() => getCategories(lang), [lang]);

  const [activeTab, setActiveTab] = useState<CategoryKey>("overview");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const [activeMedia, setActiveMedia] = useState<{
    type: "video" | "pdf";
    url: string;
    title: string;
  } | null>(null);

  // Extract class ONLY from the loaded session — never fallback to a default class
  // to avoid fetching wrong class subjects before session is ready.
  const rawClass = (session?.user as any)?.class;
  const studentClass = rawClass ? String(rawClass) : null;
  const studentSchoolId = (session?.user as any)?.schoolId || "";
  const classNum = studentClass ? (parseInt(studentClass.match(/\d+/)?.[0] || "0", 10) || 0) : 0;
  const isHigherSecondary = classNum >= 11;
  const studentGroup = useStudentGroup();

  const [dbSubjects, setDbSubjects] = useState<SubjectInfo[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [syllabusData, setSyllabusData] = useState<Record<string, SyllabusUnit[]>>({});
  const [loading, setLoading] = useState(true);

  const studentId = String((session?.user as any)?.id || "");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const schoolQuery = studentSchoolId ? `&schoolId=${encodeURIComponent(studentSchoolId)}` : "";
        
        // 1. Fetch Subjects for this class & school
        const subjectsRes = await fetch(`${API_URL}/api/superadmin/academics/subjects?class=${classNum}&status=Active${schoolQuery}`);
        const subjectsJson = await subjectsRes.json();
        
        // 2. Fetch Resources for this class & school
        const resourcesRes = await fetch(`${API_URL}/api/superadmin/academics/resources?class=${classNum}&status=Active${schoolQuery}`);
        const resourcesJson = await resourcesRes.json();

        const fetchedSyllabus: Record<string, SyllabusUnit[]> = {};
        if (Array.isArray(resourcesJson)) {
          resourcesJson.forEach((res: any) => {
            if (res.category === "syllabus") {
              const subName = res.subject?.name || "General";
              if (!fetchedSyllabus[subName]) {
                fetchedSyllabus[subName] = [];
              }
              
              fetchedSyllabus[subName].push({
                unit: res.chapterNumber || res.chapter || `Unit ${fetchedSyllabus[subName].length + 1}`,
                title: res.topicName || res.title,
                topics: res.description ? [res.description] : ["Curriculum details"],
                status: "in-progress",
                term: res.term || "Term 1",
                url: res.url
              });
            }
          });
        }
        
        const userStream = (session?.user as any)?.stream || (session?.user as any)?.group || studentGroup;
        const expectedGroupSubs = getGroupSubjectsForClass(classNum, userStream);
        const allowedSubNames = new Set(expectedGroupSubs.map((s) => s.name.toLowerCase()));

        if (Array.isArray(subjectsJson)) {
          const fetchedSubjects: SubjectInfo[] = [];

          subjectsJson.forEach((sub: any) => {
            const subName = sub.name;
            if (allowedSubNames.has(subName.toLowerCase())) {
              const expMatch = expectedGroupSubs.find((e) => e.name.toLowerCase() === subName.toLowerCase());
              const color = sub.color || expMatch?.color || "#64748b";
              const gradient = `from-[${color}] to-slate-600`;
              const icon = sub.icon || expMatch?.icon || "📚";
              const unitsCount = fetchedSyllabus[subName]?.length || 0;

              fetchedSubjects.push({
                name: subName,
                color,
                gradient,
                icon,
                teacher: "Class Teacher",
                progress: 0,
                units: unitsCount,
                unitsDone: 0,
              });
            }
          });

          // Ensure all expected group subjects exist for this student's group
          expectedGroupSubs.forEach((exp) => {
            if (!fetchedSubjects.some((s) => s.name.toLowerCase() === exp.name.toLowerCase())) {
              fetchedSubjects.push({
                name: exp.name,
                color: exp.color,
                gradient: `from-[${exp.color}] to-slate-600`,
                icon: exp.icon,
                teacher: "Class Teacher",
                progress: 0,
                units: fetchedSyllabus[exp.name]?.length || 0,
                unitsDone: 0,
              });
            }
          });

          setDbSubjects(fetchedSubjects);
          setSyllabusData(fetchedSyllabus);
        }

        if (Array.isArray(resourcesJson)) {
          const fetchedResources: Resource[] = resourcesJson
            .filter((res: any) => {
              const sName = res.subject?.name;
              if (!sName || sName === "General") return true;
              return allowedSubNames.has(sName.toLowerCase());
            })
            .map((res: any) => {
              return {
                id: res.id,
                title: res.title,
                subject: res.subject?.name || "General",
                category: res.category as any,
                type: res.type as any,
                meta: res.meta || "N/A",
                description: res.description || "",
                url: res.url,
                addedBy: res.addedBy || "Admin",
                isNew: res.isNew || false,
                popular: res.popular || false,
              };
            });
          setResources(fetchedResources);
        }
      } catch (err) {
        console.error("Failed to fetch academics data", err);
      } finally {
        setLoading(false);
      }
    }
    
    // Only fetch when session is authenticated and we have a valid class number
    if (classNum && classNum > 0 && status === "authenticated") {
      fetchData();
    }
  }, [classNum, studentId, status]);

  // Return database-fetched subjects for this student's class
  const subjects = useMemo<SubjectInfo[]>(() => {
    return dbSubjects;
  }, [dbSubjects]);

  // Load / persist bookmarks
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]");
      if (Array.isArray(saved)) setBookmarks(saved);
    } catch {}
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id];
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
      return next;
    });
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return "https://www.youtube.com/embed/d7n7DdB-bHY";
    try {
      if (url.includes("/embed/")) return url;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }
    } catch {}
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return url;
    }
    if (!url.startsWith("http") && !url.startsWith("/")) {
      return `https://www.youtube.com/embed/${url}`;
    }
    return url;
  };

  const getFileUrl = (url: string) => {
    if (!url || url === "#") return "#";
    if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return url.startsWith("/") ? `${API_URL}${url}` : `${API_URL}/${url}`;
  };

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
    } catch {}
    return null;
  };

  const handleDownload = async (resource: Resource) => {
    if (!resource.url) {
      alert(lang === "தமிழ்" ? "இந்த வளத்திற்கு பதிவிறக்க இணைப்பு இல்லை." : "No download URL available for this resource.");
      return;
    }
    const downloadUrl = getFileUrl(resource.url);
    
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      
      let filename = resource.title;
      if (resource.url.includes(".")) {
        const ext = resource.url.split(".").pop();
        if (ext && ext.length < 5) {
          filename += `.${ext}`;
        }
      } else {
        filename += resource.type === "Video" ? ".mp4" : ".pdf";
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Direct blob download failed, falling back to open tab", err);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.target = "_blank";
      link.download = resource.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Close preview on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPreviewResource(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const subjectTheme = (name: string) =>
    subjects.find((s) => s.name === name) || {
      name,
      color: "#64748b",
      gradient: "from-slate-500 to-slate-600",
      icon: "📚",
      teacher: lang === "தமிழ்" ? "வகுப்பு ஆசிரியர்" : "Class Teacher",
      progress: 0,
      units: 0,
      unitsDone: 0
    };

  /* Filtered resource list for the active tab */
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      if (activeTab !== "overview" && activeTab !== "subjects" && activeTab !== "syllabus" && r.category !== activeTab) return false;
      if (selectedSubject !== "All" && r.subject !== selectedSubject) return false;
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
  }, [resources, activeTab, selectedSubject, search, showSavedOnly, bookmarks]);

  const countByCategory = (cat: string) =>
    resources.filter(
      (r) => r.category === cat && (selectedSubject === "All" || r.subject === selectedSubject)
    ).length;

  const continueWatching = resources.filter(
    (r) => r.category === "videos" && (r.progress || 0) > 0 && (r.progress || 0) < 100
  );
  const newThisWeek = resources.filter((r) => r.isNew);

  const syllabusSubjects = selectedSubject === "All" ? subjects : subjects.filter((s) => s.name === selectedSubject);

  /* ── shared bits ─────────────────────────────────────── */
  const SubjectBadge = ({ name }: { name: string }) => {
    const t = subjectTheme(name);
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
        style={{ backgroundColor: `${t.color}1a`, color: t.color }}
      >
        {t.icon} {name}
      </span>
    );
  };

  const ResourceCard = ({ r }: { r: Resource }) => {
    const saved = bookmarks.includes(r.id);
    const t = subjectTheme(r.subject);
    return (
      <div className="glass rounded-2xl p-5 border border-[var(--border)] hover:-translate-y-1 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
        <div
          className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-25 transition-opacity"
          style={{ backgroundColor: t.color }}
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
                {lang === "தமிழ்" ? "புதியது" : "New"}
              </span>
            )}
            {r.popular && (
              <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full flex items-center gap-0.5">
                <Fi name="star" className="text-[10px]" /> {lang === "தமிழ்" ? "பிரபலம்" : "Popular"}
              </span>
            )}
            <button
              onClick={() => toggleBookmark(r.id)}
              className={`p-1.5 rounded-lg transition-all active:scale-90 ${
                saved
                  ? "text-amber-500 bg-amber-500/10"
                  : "text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-500/10"
              }`}
              title={saved ? (lang === "தமிழ்" ? "புக்மார்க்கை நீக்கு" : "Remove bookmark") : (lang === "தமிழ்" ? "புக்மார்க் செய்" : "Bookmark for later")}
            >
              <Fi name={saved ? "bookmark" : "bookmark"} className={`text-base ${saved ? "" : "opacity-70"}`} />
            </button>
          </div>
        </div>

        <div className="mb-1.5 relative z-10">
          <SubjectBadge name={r.subject} />
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
              onClick={() => setPreviewResource(r)}
              className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md active:scale-95 transition-all"
              style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}cc)`, color: "#fff" }}
            >
              <Fi name="eye" className="text-xs" /> {lang === "தமிழ்" ? (r.category === "videos" ? "பார்" : "திற") : (r.category === "videos" ? "Watch" : "Open")}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const VideoCard = ({ r }: { r: Resource }) => {
    const t = subjectTheme(r.subject);
    const saved = bookmarks.includes(r.id);
    const youtubeThumbnail = getYouTubeThumbnailUrl(r.url || "");
    return (
      <div className="glass rounded-2xl border border-[var(--border)] overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all group flex flex-col">
        {/* Thumbnail */}
        <button
          onClick={() => setPreviewResource(r)}
          className={`relative h-32 bg-gradient-to-br ${t.gradient} flex items-center justify-center overflow-hidden`}
        >
          {youtubeThumbnail ? (
            <img src={youtubeThumbnail} alt={r.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <>
              <span className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
              <span className="text-4xl opacity-40 absolute left-4 bottom-3">{t.icon}</span>
            </>
          )}
          <span className="w-14 h-14 rounded-full bg-white/25 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg z-10">
            <Fi name="play" className="text-3xl" />
          </span>
          <span
            className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/60 px-2 py-0.5 rounded-md flex items-center gap-1 z-10"
            style={{ color: "#fff" }}
          >
            <Fi name="clock" className="text-[10px]" /> {r.meta}
          </span>
          {(r.progress || 0) > 0 && (
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
              <span
                className="block h-full bg-red-500"
                style={{ width: `${r.progress}%` }}
              />
            </span>
          )}
        </button>
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <SubjectBadge name={r.subject} />
            <button
              onClick={() => toggleBookmark(r.id)}
              className={`p-1 rounded-md transition-all active:scale-90 ${
                saved ? "text-amber-500" : "text-[var(--text-muted)] hover:text-amber-500"
              }`}
            >
              <Fi name="bookmark" className={`text-base ${saved ? "" : "opacity-70"}`} />
            </button>
          </div>
          <h3 className="text-sm font-bold text-[var(--text-heading)] leading-snug mb-2">{r.title}</h3>
          <div className="mt-auto flex items-center justify-between">
            {r.progress === 100 ? (
              <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                <Fi name="check" className="text-[10px]" /> {lang === "தமிழ்" ? "முடிக்கப்பட்டது" : "Completed"}
              </span>
            ) : (r.progress || 0) > 0 ? (
              <span className="text-[10px] font-bold text-orange-500">{r.progress}% {lang === "தமிழ்" ? "பார்க்கப்பட்டது" : "watched"}</span>
            ) : (
              <span className="text-[10px] font-semibold text-[var(--text-muted)]">{lang === "தமிழ்" ? "தொடங்கப்படவில்லை" : "Not started"}</span>
            )}
            <button
              onClick={() => setPreviewResource(r)}
              className="text-[11px] font-bold flex items-center gap-1 hover:gap-1.5 transition-all"
              style={{ color: t.color }}
            >
              {(r.progress || 0) > 0 && r.progress !== 100 ? (lang === "தமிழ்" ? "தொடர்க" : "Resume") : (lang === "தமிழ்" ? "பார்" : "Watch")}{" "}
              <Fi name="arrow-small-right" className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ── render ──────────────────────────────────────────── */
  if (loading) {
    return (
      <PortalLayout
        title={lang === "தமிழ்" ? "பாடங்கள் & பாடப்பிரிவுகள்" : "Academics & Subjects"}
        subtitle={lang === "தமிழ்" ? "நீங்கள் கற்க வேண்டிய அனைத்தும் — பாடங்கள், பாடத்திட்டம், புத்தகங்கள், குறிப்புகள் மற்றும் வீடியோக்கள் ஒரே இடத்தில்." : "Everything you need to learn — subjects, syllabus, books, notes and videos in one place."}
        themeClass="theme-student"
      >
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "பாடங்கள் & பாடப்பிரிவுகள்" : "Academics & Subjects"}
      subtitle={lang === "தமிழ்" ? "நீங்கள் கற்க வேண்டிய அனைத்தும் — பாடங்கள், பாடத்திட்டம், புத்தகங்கள், குறிப்புகள் மற்றும் வீடியோக்கள் ஒரே இடத்தில்." : "Everything you need to learn — subjects, syllabus, books, notes and videos in one place."}
      themeClass="theme-student"
    >
      {/* ── Hero banner ─────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden mb-6 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 p-6 md:p-8 shadow-xl">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-fuchsia-400/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center"
                style={{ color: "#fff" }}
              >
                <Fi name="graduation-cap" className="text-xl" />
              </span>
              <span
                className="text-[11px] font-black uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                {lang === "தமிழ்" ? `வகுப்பு ${studentClass} · தமிழ்நாடு மாநிலப் பாடத்திட்டம்` : `Class ${studentClass} · Tamil Nadu State Board`}
                {isHigherSecondary ? ` · ${HS_GROUP_LABELS[studentGroup]}` : ""}
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: "#fff" }}>
              {lang === "தமிழ்" ? "பாடங்கள் & பாடப்பிரிவுகள் மையம்" : "Academics & Subjects Hub"}
            </div>
            <p className="text-sm max-w-xl" style={{ color: "rgba(255,255,255,0.9)" }}>
              {lang === "தமிழ்"
                ? "உங்கள் வகுப்பு பாடங்களை ஆராயுங்கள், பாடத்திட்டத்தைப் பின்பற்றுங்கள், பாடப்புத்தகங்கள், படிப்புப் பொருட்கள், ஆசிரியர் குறிப்புகள், வீடியோ பாடங்கள் மற்றும் குறிப்பு உள்ளடக்கங்களைத் திறக்கவும் — அனைத்தும் ஒரே இடத்தில்."
                : "Browse your class subjects, follow the syllabus, and open textbooks, study materials, teacher notes, video lessons and reference content — all from one place."}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            {[
              { label: lang === "தமிழ்" ? "பாடங்கள்" : "Subjects", value: subjects.length, icon: "graduation-cap" },
              { label: lang === "தமிழ்" ? "வளங்கள்" : "Resources", value: resources.length, icon: "document" },
              { label: lang === "தமிழ்" ? "வீடியோக்கள்" : "Videos", value: resources.filter((r) => r.category === "videos").length, icon: "play-alt" },
              { label: lang === "தமிழ்" ? "சேமித்தவை" : "Saved", value: bookmarks.length, icon: "bookmark" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white/15 backdrop-blur rounded-2xl px-4 py-3 text-center border border-white/20"
              >
                <Fi name={s.icon} className="text-sm mx-auto mb-1 text-[#fff]/80" />
                <div className="text-xl font-black text-[#fff] leading-none">{s.value}</div>
                <div className="text-[10px] font-bold text-[#fff]/75 uppercase tracking-wider mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Subject filter rail ─────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1 scrollbar-thin">
        <button
          onClick={() => setSelectedSubject("All")}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all active:scale-95 ${
            selectedSubject === "All"
              ? "bg-indigo-600 border-indigo-600 shadow-md"
              : "glass border-[var(--border)] text-[var(--text-main)] hover:border-indigo-400"
          }`}
          style={selectedSubject === "All" ? { color: "#fff" } : undefined}
        >
          <Fi name="apps" className="text-sm" /> {lang === "தமிழ்" ? "அனைத்து பாடங்களும்" : "All Subjects"}
        </button>
        {subjects.map((s) => {
          const active = selectedSubject === s.name;
          return (
            <button
              key={s.name}
              onClick={() => setSelectedSubject(active ? "All" : s.name)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                active ? "shadow-md" : "glass text-[var(--text-main)] hover:shadow"
              }`}
              style={
                active
                  ? { backgroundColor: s.color, borderColor: s.color, color: "#fff" }
                  : { borderColor: `${s.color}55` }
              }
            >
              <span>{s.icon}</span> {s.name}
            </button>
          );
        })}
      </div>

      {/* ── Category tabs ───────────────────────────────── */}
      <div className="glass rounded-2xl border border-[var(--border)] p-1.5 mb-5 flex gap-1 overflow-x-auto scrollbar-thin">
        {CATEGORIES.map((c) => {
          const active = activeTab === c.key;
          const count =
            c.key === "overview" || c.key === "subjects" || c.key === "syllabus"
              ? null
              : countByCategory(c.key);
          return (
            <button
              key={c.key}
              onClick={() => setActiveTab(c.key)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                active
                  ? `bg-gradient-to-br ${c.gradient} shadow-md text-white`
                  : "text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card-hover)]"
              }`}
              style={active ? { color: "#fff" } : undefined}
            >
              <Fi name={c.icon} className="text-sm" />
              {c.label}
              {count !== null && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                    active ? "bg-white/25" : "bg-[var(--bg-card-hover)] border border-[var(--border)]"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Toolbar (search + saved filter) ─────────────── */}
      {activeTab !== "overview" && activeTab !== "subjects" && activeTab !== "syllabus" && (
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              <Fi name="search" className="text-sm" />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "தமிழ்" ? `தேடு (${CATEGORIES.find((c) => c.key === activeTab)?.label})...` : `Search ${CATEGORIES.find((c) => c.key === activeTab)?.label.toLowerCase()}...`}
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
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
              showSavedOnly
                ? "bg-amber-500 border-amber-500 shadow-md"
                : "glass border-[var(--border)] text-[var(--text-main)] hover:border-amber-400"
            }`}
            style={showSavedOnly ? { color: "#fff" } : undefined}
          >
            <Fi name="bookmark" className="text-sm" />
            {lang === "தமிழ்" ? "சேமித்தவை மட்டும்" : "Saved only"} {bookmarks.length > 0 && `(${bookmarks.length})`}
          </button>
        </div>
      )}

      {/* ══ OVERVIEW TAB ═════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.filter((c) => c.key !== "overview").map((c) => {
              const count =
                c.key === "subjects"
                  ? subjects.length
                  : c.key === "syllabus"
                  ? syllabusSubjects.length * 4
                  : countByCategory(c.key);
              return (
                <button
                  key={c.key}
                  onClick={() => setActiveTab(c.key)}
                  className="glass rounded-2xl p-5 border border-[var(--border)] text-left hover:-translate-y-1 hover:shadow-xl transition-all group relative overflow-hidden"
                >
                  <div
                    className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-15 group-hover:opacity-35 transition-opacity bg-gradient-to-br ${c.gradient}`}
                  />
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform`}
                    style={{ color: "#fff" }}
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
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                    {count} {c.key === "subjects" ? (lang === "தமிழ்" ? "பாடங்கள்" : "subjects") : c.key === "syllabus" ? (lang === "தமிழ்" ? "அலகுகள்" : "units") : (lang === "தமிழ்" ? "பொருட்கள்" : "items")}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Continue watching */}
          {continueWatching.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-black text-[var(--text-heading)] flex items-center gap-2">
                  <Fi name="play-alt" className="text-base text-red-500" /> {lang === "தமிழ்" ? "தொடர்ந்து பாருங்கள்" : "Continue Watching"}
                </h2>
                <button
                  onClick={() => setActiveTab("videos")}
                  className="text-xs font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1"
                >
                  {lang === "தமிழ்" ? "அனைத்து வீடியோக்களும்" : "All videos"} <Fi name="angle-small-right" className="text-sm" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {continueWatching.slice(0, 4).map((r) => (
                  <VideoCard key={r.id} r={r} />
                ))}
              </div>
            </div>
          )}

          {/* New this week */}
          {newThisWeek.length > 0 && (
            <div>
              <h2 className="text-base font-black text-[var(--text-heading)] flex items-center gap-2 mb-3">
                <Fi name="sparkles" className="text-base text-emerald-500" /> {lang === "தமிழ்" ? "இந்த வாரம் புதியவை" : "New This Week"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {newThisWeek.slice(0, 6).map((r) => (
                  <ResourceCard key={r.id} r={r} />
                ))}
              </div>
            </div>
          )}

          {/* Quick links to deeper tools */}
          <div className="glass rounded-2xl border border-[var(--border)] p-5">
            <h2 className="text-sm font-black text-[var(--text-heading)] mb-3 flex items-center gap-2">
              <Fi name="chart-histogram" className="text-base text-indigo-500" /> {lang === "தமிழ்" ? "மேலும் அறிய" : "Go Deeper"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: lang === "தமிழ்" ? "முழு பாடத்திட்ட பலகை" : "Full Syllabus Board", href: "/student/syllabus-board", icon: "apps" },
                { label: lang === "தமிழ்" ? "கற்றல் மையம்" : "Learning Hub", href: "/student/centralized-content", icon: "brain" },
                { label: lang === "தமிழ்" ? "டிஜிட்டல் நூலகம்" : "Digital Library", href: "/student/digital-library", icon: "books" },
                { label: lang === "தமிழ்" ? "AI பாடங்கள்" : "AI Lessons", href: "/student/lessons", icon: "sparkles" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-[var(--border)] hover:border-indigo-400 hover:bg-[var(--bg-card-hover)] hover:-translate-y-0.5 transition-all group"
                >
                  <span className="text-xl text-indigo-500">
                    <Fi name={l.icon} className="text-xl" />
                  </span>
                  <span className="text-xs font-bold text-[var(--text-heading)] group-hover:text-indigo-500 transition-colors">
                    {l.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ CLASS SUBJECTS TAB ═══════════════════════════ */}
      {activeTab === "subjects" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(selectedSubject === "All" ? subjects : subjects.filter((s) => s.name === selectedSubject)).map(
            (s) => (
              <div
                key={s.name}
                className="glass rounded-2xl p-6 border border-[var(--border)] hover:-translate-y-1 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col"
              >
                <div
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-15 group-hover:opacity-30 transition-opacity"
                  style={{ backgroundColor: s.color }}
                />
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-105 transition-transform`}
                  >
                    {s.icon}
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[var(--text-heading)]">{s.progress}%</span>
                    <span className="block text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                      {lang === "தமிழ்" ? "பாடத்திட்டம் முடிந்தது" : "Syllabus done"}
                    </span>
                  </div>
                </div>
                <h2 className="text-lg font-black text-[var(--text-heading)] mb-0.5 relative z-10">{s.name}</h2>
                <p className="text-xs text-[var(--text-muted)] mb-4 relative z-10">👨‍🏫 {s.teacher}</p>

                <div className="mb-4 relative z-10">
                  <div className="flex justify-between text-[10px] font-bold text-[var(--text-muted)] mb-1.5">
                    <span>
                      {lang === "தமிழ்" ? `${s.units} அலகுகளில் ${s.unitsDone} முடிந்தது` : `${s.unitsDone} of ${s.units} units completed`}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${s.progress}%`,
                        background: `linear-gradient(90deg, ${s.color}, ${s.color}bb)`,
                      }}
                    />
                  </div>
                </div>

                {/* Per-subject resource shortcuts */}
                <div className="grid grid-cols-4 gap-2 mt-auto relative z-10">
                  {[
                    { key: "textbooks" as CategoryKey, icon: "book", label: lang === "தமிழ்" ? "புத்தகங்கள்" : "Books" },
                    { key: "materials" as CategoryKey, icon: "document", label: lang === "தமிழ்" ? "குறிப்புகள்" : "Notes" },
                    { key: "videos" as CategoryKey, icon: "play-alt", label: lang === "தமிழ்" ? "வீடியோக்கள்" : "Videos" },
                    { key: "syllabus" as CategoryKey, icon: "book-alt", label: lang === "தமிழ்" ? "அலகுகள்" : "Units" },
                  ].map((a) => (
                    <button
                      key={a.key}
                      onClick={() => {
                        setSelectedSubject(s.name);
                        setActiveTab(a.key);
                      }}
                      className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-card-hover)] hover:-translate-y-0.5 active:scale-95 transition-all"
                      title={`Open ${s.name} ${a.label.toLowerCase()}`}
                    >
                      <span style={{ color: s.color }}>
                        <Fi name={a.icon} className="text-base" />
                      </span>
                      <span className="text-[9px] font-bold text-[var(--text-muted)]">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* ══ SYLLABUS TAB ═════════════════════════════════ */}
      {activeTab === "syllabus" && (() => {
        const activeSubName = selectedSubject === "All" ? (subjects[0]?.name || "Accountancy") : selectedSubject;
        const currentSubjectInfo = subjects.find(s => s.name.toLowerCase() === activeSubName.toLowerCase()) || subjects[0];
        const activeChapters = syllabusData[activeSubName] || [];

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left font-sans">
            {/* Left Column: SUBJECTS List Sidebar */}
            <div className="lg:col-span-4 space-y-3">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                SUBJECTS
              </div>
              <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1.5 custom-scrollbar">
                {subjects.map((sub) => {
                  const isSelected = activeSubName.toLowerCase() === sub.name.toLowerCase();
                  const chList = syllabusData[sub.name] || [];
                  const aiCount = chList.filter(c => c.url?.toLowerCase().includes("ai") || c.title?.toLowerCase().includes("ai")).length;

                  return (
                    <div
                      key={sub.name}
                      onClick={() => setSelectedSubject(sub.name)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? "bg-amber-50/80 dark:bg-amber-950/30 border-amber-400 dark:border-amber-500/80 ring-2 ring-amber-400/20 shadow-sm"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700/50 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl shrink-0">{sub.icon}</span>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 leading-snug">
                            {sub.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                            {chList.length}/0 chapters · {aiCount} AI
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Chapters Detail Table */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm min-h-[550px] flex flex-col justify-between">
              <div>
                {/* Header Bar */}
                <div className="pb-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{currentSubjectInfo?.icon || "📚"}</span>
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
                      {activeSubName} — Class {studentClass}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    {activeChapters.length} chapters · {activeChapters.length} enabled · 0 AI-mapped
                  </p>
                </div>

                {/* Table Area */}
                <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800/80">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        <th className="py-3 px-4 w-12 text-center">NO</th>
                        <th className="py-3 px-4">CHAPTER TITLE</th>
                        <th className="py-3 px-4">TOPICS</th>
                        <th className="py-3 px-4 text-right">AI MAPPING</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
                      {activeChapters.length > 0 ? (
                        activeChapters.map((ch, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors">
                            <td className="py-3.5 px-4 font-extrabold text-slate-400 text-center">
                              {String(ch.unit || idx + 1).padStart(2, '0').replace(/^Unit\s+/i, '')}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-800 dark:text-slate-100">{ch.title || ch.unit}</div>
                              {ch.topics && Array.isArray(ch.topics) && ch.topics.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {ch.topics.flatMap((tp, tIdx) =>
                                    tp.split(/•|\n/).map((sItem, sIdx) => {
                                      const trimmed = sItem.trim();
                                      if (!trimmed) return null;
                                      const unitNum = ch.unit?.match(/\d+/)?.[0] || (idx + 1);
                                      const hasNo = /^\d+\.\d+/.test(trimmed);
                                      const displayText = hasNo ? trimmed : `${unitNum}.${sIdx + 1} ${trimmed}`;
                                      return (
                                        <span
                                          key={`${tIdx}-${sIdx}`}
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                        >
                                          • {displayText}
                                        </span>
                                      );
                                    })
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-bold">
                              {ch.topics?.length || 1} Topics
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                                Not Mapped
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-16 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center">
                              <span className="text-3xl mb-2">📚</span>
                              <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                                0 chapters added for {activeSubName} — Class {studentClass}
                              </p>
                              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                                State board syllabus chapters and units will appear here.
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
        );
      })()}

      {/* ══ VIDEO LESSONS TAB ════════════════════════════ */}
      {activeTab === "videos" &&
        (filteredResources.length === 0 ? (
          <EmptyState saved={showSavedOnly} lang={lang} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredResources.map((r) => (
              <VideoCard key={r.id} r={r} />
            ))}
          </div>
        ))}

      {/* ══ RESOURCE GRID TABS (textbooks / materials / notes / digital / reference) ══ */}
      {["textbooks", "materials", "notes", "digital", "reference"].includes(activeTab) &&
        (filteredResources.length === 0 ? (
          <EmptyState saved={showSavedOnly} lang={lang} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((r) => (
              <ResourceCard key={r.id} r={r} />
            ))}
          </div>
        ))}

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
            {previewResource.category === "videos" && previewResource.url ? (
              <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                {previewResource.url.includes("youtube.com") || previewResource.url.includes("youtu.be") || previewResource.url.includes("youtube") ? (
                  <iframe
                    src={getYouTubeEmbedUrl(previewResource.url)}
                    className="w-full h-full border-0 animate-in fade-in"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={previewResource.title}
                  />
                ) : (
                  <video 
                    src={getFileUrl(previewResource.url)} 
                    controls 
                    autoPlay 
                    className="w-full h-full object-contain animate-in fade-in"
                  />
                )}
                <button
                  onClick={() => setPreviewResource(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/80 active:scale-90 transition-all z-10"
                  style={{ color: "#fff" }}
                >
                  <Fi name="cross-small" className="text-base" />
                </button>
              </div>
            ) : (
              <div
                className="h-36 relative flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${subjectTheme(previewResource.subject).color || '#64748b'}, #475569)`
                }}
              >
                <span className="text-6xl opacity-30 absolute left-6 bottom-3">
                  {subjectTheme(previewResource.subject).icon}
                </span>
                <span
                  className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur flex items-center justify-center shadow-lg"
                  style={{ color: "#fff" }}
                >
                  <Fi name={TYPE_ICONS[previewResource.type]} className="text-3xl" />
                </span>
                <button
                  onClick={() => setPreviewResource(null)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/25 hover:bg-black/45 active:scale-90 transition-all"
                  style={{ color: "#fff" }}
                >
                  <Fi name="cross-small" className="text-base" />
                </button>
              </div>
            )}

            <div className="p-6">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <SubjectBadge name={previewResource.subject} />
                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full border ${TYPE_COLORS[previewResource.type]}`}
                >
                  {previewResource.type}
                </span>
                <span className="text-[10px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
                  <Fi name="clock" className="text-[10px]" /> {previewResource.meta}
                </span>
              </div>
              <h2 className="text-lg font-black text-[var(--text-heading)] mb-2">
                {previewResource.title}
              </h2>
              <p className="text-sm text-[var(--text-main)] leading-relaxed mb-4">
                {previewResource.description}
              </p>
              {previewResource.addedBy && (
                <p className="text-xs text-[var(--text-muted)] mb-4">
                  {lang === "தமிழ்" ? "பகிர்ந்தவர்" : "Shared by"} <span className="font-bold">{previewResource.addedBy}</span> ·{" "}
                  {previewResource.date}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const isVideo = previewResource.category === "videos" || previewResource.type === "Video";
                    setActiveMedia({
                      type: isVideo ? "video" : "pdf",
                      url: previewResource.url || (isVideo ? "https://www.youtube.com/embed/d7n7DdB-bHY" : "/sample-syllabus.pdf"),
                      title: previewResource.title,
                    });
                  }}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${subjectTheme(previewResource.subject).color}, ${subjectTheme(previewResource.subject).color}cc)`,
                    color: "#fff",
                  }}
                >
                  {previewResource.category === "videos" ? (
                    <>
                      <Fi name="play" className="text-sm" />
                      {(previewResource.progress || 0) > 0 && previewResource.progress !== 100
                        ? (lang === "தமிழ்" ? `${previewResource.progress}% இல் தொடர்க` : `Resume at ${previewResource.progress}%`)
                        : (lang === "தமிழ்" ? "பாடத்தை இயக்கு" : "Play lesson")}
                    </>
                  ) : (
                    <>
                      <Fi name="eye" className="text-sm" /> {lang === "தமிழ்" ? "முழுப்பார்வையில் திற" : "Open full view"}
                    </>
                  )}
                </button>
                <button
                  onClick={() => toggleBookmark(previewResource.id)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border transition-all active:scale-95 ${
                    bookmarks.includes(previewResource.id)
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-500"
                      : "border-[var(--border)] text-[var(--text-main)] hover:border-amber-400"
                  }`}
                >
                  <Fi name="bookmark" className="text-sm" />
                  {bookmarks.includes(previewResource.id) ? (lang === "தமிழ்" ? "சேமிக்கப்பட்டது" : "Saved") : (lang === "தமிழ்" ? "சேமி" : "Save")}
                </button>
                <button 
                  onClick={() => handleDownload(previewResource)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] active:scale-95 transition-all"
                >
                  <Fi name="download" className="text-sm" /> {lang === "தமிழ்" ? "பதிவிறக்கு" : "Download"}
                </button>
                <Link
                  href={`/student/ai-tutor?subject=${encodeURIComponent(previewResource.subject)}&question=${encodeURIComponent(`Can you explain the concepts and key details covered in the lesson "${previewResource.title}" under ${previewResource.subject}?`)}`}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border border-indigo-500/40 text-indigo-500 hover:bg-indigo-500/10 active:scale-95 transition-all"
                >
                  <Fi name="comment-alt" className="text-sm" /> {lang === "தமிழ்" ? "AI ஆசிரியரிடம் கேள்" : "Ask AI Tutor"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───── Media Preview Modal (Video / PDF Player Popup) ───── */}
      {activeMedia && (
        <div 
          className="fixed inset-0 z-[120] bg-black/60 flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200"
          onClick={() => setActiveMedia(null)}
        >
          <div 
            className="w-full max-w-4xl bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0 bg-[var(--bg-card)]/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                  <Fi name={activeMedia.type === "video" ? "play" : "document"} className="text-indigo-400 text-sm" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[var(--text-heading)] truncate max-w-md md:max-w-xl">
                    {activeMedia.title}
                  </h3>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                    {activeMedia.type === "video" ? (lang === "தமிழ்" ? "வீடியோ பாடம்" : "Video Lesson") : (lang === "தமிழ்" ? "ஆவணம் / PDF பார்வை" : "Document / PDF View")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveMedia(null)}
                className="p-2 rounded-xl bg-[var(--border)] hover:bg-[var(--border)]/80 text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-all active:scale-90"
              >
                <Fi name="cross-small" className="text-base" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 bg-[var(--bg-card)] flex-1 flex flex-col justify-center items-center">
              {activeMedia.type === "video" ? (
                <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-[var(--border)] bg-black">
                  {activeMedia.url.includes("youtube.com") || activeMedia.url.includes("youtu.be") || activeMedia.url.includes("youtube") ? (
                    <iframe
                      src={getYouTubeEmbedUrl(activeMedia.url)}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={activeMedia.title}
                    />
                  ) : (
                    <video 
                      src={getFileUrl(activeMedia.url)} 
                      controls 
                      autoPlay 
                      className="w-full h-full"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              ) : (
                <div className="w-full h-[60vh] rounded-2xl overflow-hidden shadow-lg border border-[var(--border)] bg-[var(--bg-card)]">
                  {/* PDF view using iframe */}
                  <iframe
                    src={getFileUrl(activeMedia.url)}
                    className="w-full h-full border-0"
                    title={activeMedia.title}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

/* ── Empty state ─────────────────────────────────────── */
function EmptyState({ saved, lang }: { saved: boolean; lang?: string }) {
  return (
    <div className="glass rounded-3xl border border-[var(--border)] p-12 text-center">
      <div className="text-5xl mb-4 text-[var(--text-muted)]">
        <Fi name={saved ? "bookmark" : "search"} className="text-5xl" />
      </div>
      <h3 className="text-base font-black text-[var(--text-heading)] mb-1">
        {saved 
          ? (lang === "தமிழ்" ? "இங்கு சேமிக்கப்பட்ட பொருட்கள் எதுவும் இல்லை" : "No saved items here yet")
          : (lang === "தமிழ்" ? "உங்கள் தேடலுக்குப் பொருந்தும் எதுவும் இல்லை" : "Nothing matches your search")}
      </h3>
      <p className="text-sm text-[var(--text-muted)]">
        {saved
          ? (lang === "தமிழ்" ? "எந்தவொரு பாடப் பொருளிலும் உள்ள புக்மார்க் ஐகானைத் தட்டி சேமித்து வைக்கலாம்." : "Tap the bookmark icon on any resource to keep it handy here.")
          : (lang === "தமிழ்" ? "வேறு முக்கியச் சொல்லை முயலுங்கள், அல்லது மேலே உள்ள பாடங்களில் ஒன்றைத் தேர்ந்தெடுக்கவும்." : "Try a different keyword, or pick another subject from the chips above.")}
      </p>
    </div>
  );
}
