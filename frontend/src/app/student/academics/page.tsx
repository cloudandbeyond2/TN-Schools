"use client";

import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";

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
  addedBy?: string;
  date?: string;
  progress?: number; // for videos (0-100)
  isNew?: boolean;
  popular?: boolean;
  url?: string;
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
}

/* ────────────────────────────────────────────────────────────
   Subject themes & default data (Tamil Nadu Samacheer Kalvi)
──────────────────────────────────────────────────────────── */
const SUBJECT_THEMES: Record<string, { color: string; gradient: string; icon: string }> = {
  Tamil: { color: "#f59e0b", gradient: "from-amber-500 to-orange-500", icon: "📜" },
  English: { color: "#3b82f6", gradient: "from-blue-500 to-sky-500", icon: "🗣️" },
  Mathematics: { color: "#6366f1", gradient: "from-indigo-500 to-violet-500", icon: "📐" },
  Science: { color: "#10b981", gradient: "from-emerald-500 to-teal-500", icon: "🔬" },
  "Social Science": { color: "#ec4899", gradient: "from-pink-500 to-rose-500", icon: "🌍" },
  Physics: { color: "#0ea5e9", gradient: "from-sky-500 to-cyan-500", icon: "⚛️" },
  Chemistry: { color: "#8b5cf6", gradient: "from-purple-500 to-violet-500", icon: "🧪" },
  Biology: { color: "#22c55e", gradient: "from-green-500 to-emerald-500", icon: "🧬" },
  "Computer Science": { color: "#64748b", gradient: "from-slate-500 to-slate-600", icon: "💻" },
};

const DEFAULT_TEACHERS: Record<string, string> = {
  Tamil: "Mrs. Kalaiselvi M.",
  English: "Mr. Joseph Antony",
  Mathematics: "Mr. Ramesh Kumar",
  Science: "Mrs. Priya Lakshmi",
  "Social Science": "Mr. Senthil Vel",
  Physics: "Dr. Anand Krishnan",
  Chemistry: "Mrs. Deepa Rani",
  Biology: "Dr. Meena Sundaram",
  "Computer Science": "Mr. Karthik Raja",
};

function subjectsForClass(cls: number): string[] {
  if (cls >= 11) return ["Tamil", "English", "Physics", "Chemistry", "Biology", "Mathematics"];
  return ["Tamil", "English", "Mathematics", "Science", "Social Science"];
}

function buildSubjectInfo(name: string, idx: number): SubjectInfo {
  const theme = SUBJECT_THEMES[name] || { color: "#64748b", gradient: "from-slate-500 to-slate-600", icon: "📚" };
  const progress = [72, 64, 81, 58, 69, 76][idx % 6];
  const units = 8 + (idx % 3);
  return {
    name,
    ...theme,
    teacher: DEFAULT_TEACHERS[name] || "Class Teacher",
    progress,
    units,
    unitsDone: Math.round((progress / 100) * units),
  };
}

/* Demo syllabus units per subject */
const SYLLABUS_TOPICS: Record<string, string[][]> = {
  Tamil: [
    ["இயற்கை வளம்", "செய்யுள் நயம்", "இலக்கணம் – எழுத்து"],
    ["பாரதியார் கவிதைகள்", "உரைநடை", "இலக்கணம் – சொல்"],
    ["சிலப்பதிகாரம்", "மொழிப்பயிற்சி", "கட்டுரை எழுதுதல்"],
    ["திருக்குறள்", "புதுக்கவிதை", "இலக்கணம் – தொடர்"],
  ],
  English: [
    ["Prose: The Last Lesson", "Poem: Life", "Grammar: Tenses"],
    ["Prose: His First Flight", "Poem: The Grumble Family", "Writing: Letter"],
    ["Supplementary Reader", "Grammar: Voice & Speech", "Comprehension"],
    ["Poem: No Men Are Foreign", "Writing: Essay & Report", "Vocabulary"],
  ],
  Mathematics: [
    ["Relations & Functions", "Sets Revision", "Problem Solving"],
    ["Numbers & Sequences", "AP and GP", "Special Series"],
    ["Algebra", "Simultaneous Equations", "Polynomials & GCD"],
    ["Geometry", "Similar Triangles", "Circles & Tangents"],
  ],
  Science: [
    ["Laws of Motion", "Force & Inertia", "Gravitation"],
    ["Periodic Classification", "Atomic Structure", "Chemical Bonding"],
    ["Structure of Living Organisms", "Plant Physiology", "Life Processes"],
    ["Electricity & Circuits", "Magnetism", "Energy Sources"],
  ],
  "Social Science": [
    ["Outbreak of World War I", "The World After WWI", "Nationalism in India"],
    ["India – Location & Physiography", "Climate & Rivers", "Resources"],
    ["Indian Constitution", "Central Government", "State Government"],
    ["Gross Domestic Product", "Globalization & Trade", "Food Security"],
  ],
  Physics: [
    ["Electrostatics", "Coulomb's Law", "Electric Potential"],
    ["Current Electricity", "Ohm's Law & Circuits", "Kirchhoff's Rules"],
    ["Magnetism & Magnetic Effects", "Biot-Savart Law", "Ampere's Law"],
    ["Electromagnetic Induction", "AC Circuits", "Transformers"],
  ],
  Chemistry: [
    ["Metallurgy", "Occurrence of Metals", "Extraction Processes"],
    ["p-Block Elements", "Group 13 & 14", "Oxides & Halides"],
    ["Coordination Chemistry", "Werner's Theory", "Isomerism"],
    ["Chemical Kinetics", "Rate Laws", "Arrhenius Equation"],
  ],
  Biology: [
    ["Reproduction in Organisms", "Sexual Reproduction in Plants", "Pollination"],
    ["Genetics", "Mendelian Inheritance", "Chromosomal Basis"],
    ["Biotechnology", "Principles & Processes", "Applications"],
    ["Ecology", "Ecosystem Dynamics", "Biodiversity Conservation"],
  ],
  "Computer Science": [
    ["Function & Scoping", "Python Basics", "Control Structures"],
    ["Data Structures", "Lists & Tuples", "Dictionaries"],
    ["Database Concepts", "SQL Fundamentals", "Normalization"],
    ["Computer Networks", "Internet Basics", "Network Security"],
  ],
};

function buildSyllabus(subject: string): SyllabusUnit[] {
  const topics = SYLLABUS_TOPICS[subject] || SYLLABUS_TOPICS["Science"];
  const statuses: SyllabusUnit["status"][] = ["completed", "completed", "in-progress", "upcoming"];
  return topics.map((t, i) => ({
    unit: `Unit ${i + 1}`,
    title: t[0],
    topics: t,
    status: statuses[i],
    term: i < 2 ? "Term I" : "Term II",
  }));
}

/* Demo resource library, generated per subject */
function buildResources(subjects: string[], cls: string): Resource[] {
  const out: Resource[] = [];
  subjects.forEach((s, si) => {
    const slug = s.toLowerCase().replace(/\s+/g, "-");
    // Textbooks
    if (s === "Tamil") {
      out.push({
        id: `${slug}-tb-real-1`,
        title: `10th Std Tamil Text Book`,
        subject: s,
        category: "textbooks",
        type: "PDF",
        meta: "Class 10 Textbook",
        description: `Official Samacheer Kalvi Tamil Textbook for Class 10.`,
        isNew: true,
        popular: true,
        url: "https://drive.google.com/file/d/126HDzwgKz1gNaSXWJSow2upisHXVe57-/preview"
      });
    }
    out.push(
      {
        id: `${slug}-tb-1`,
        title: `${s} – Samacheer Kalvi Textbook (Term I)`,
        subject: s,
        category: "textbooks",
        type: "PDF",
        meta: "312 pages · 24 MB",
        description: `Official Tamil Nadu State Board textbook for Class ${cls} ${s}, Term I. Includes all units with exercises.`,
        isNew: si === 0,
        popular: si < 2,
      },
      {
        id: `${slug}-tb-2`,
        title: `${s} – Samacheer Kalvi Textbook (Term II)`,
        subject: s,
        category: "textbooks",
        type: "eBook",
        meta: "298 pages · 21 MB",
        description: `Official Tamil Nadu State Board textbook for Class ${cls} ${s}, Term II with interactive eBook features.`,
      }
    );
    // Study materials
    out.push(
      {
        id: `${slug}-sm-1`,
        title: `${s} Unit-wise Important Questions`,
        subject: s,
        category: "materials",
        type: "PDF",
        meta: "48 pages · 3.2 MB",
        description: "Curated 2, 5 and 10-mark questions for every unit with marking scheme hints.",
        popular: true,
      },
      {
        id: `${slug}-sm-2`,
        title: `${s} Mind Maps & Quick Revision Charts`,
        subject: s,
        category: "materials",
        type: "PDF",
        meta: "22 pages · 5.8 MB",
        description: "One-page visual summaries of each unit for rapid revision before exams.",
        isNew: si % 2 === 0,
      },
      {
        id: `${slug}-sm-3`,
        title: `${s} Practice Worksheets (with answers)`,
        subject: s,
        category: "materials",
        type: "DOC",
        meta: "16 worksheets · 1.9 MB",
        description: "Printable practice worksheets aligned to the current term portion, answer keys included.",
      }
    );
    // Teacher notes
    out.push(
      {
        id: `${slug}-tn-1`,
        title: `Unit ${((si + 2) % 4) + 1} Class Notes – ${s}`,
        subject: s,
        category: "notes",
        type: "PDF",
        meta: "12 pages · 1.1 MB",
        description: "Handwritten class notes covering board-focused points, uploaded after this week's classes.",
        addedBy: DEFAULT_TEACHERS[s] || "Class Teacher",
        date: "2 days ago",
        isNew: true,
      },
      {
        id: `${slug}-tn-2`,
        title: `Exam Tips & Common Mistakes – ${s}`,
        subject: s,
        category: "notes",
        type: "DOC",
        meta: "6 pages · 420 KB",
        description: "Teacher's checklist of frequently lost marks and how to avoid them in the board pattern.",
        addedBy: DEFAULT_TEACHERS[s] || "Class Teacher",
        date: "1 week ago",
      }
    );
    // Video lessons
    if (s === "Mathematics") {
      out.push({
        id: `${slug}-vid-real-1`,
        title: `10th Maths (Tamil Medium): ஓர் உறவை 'R' குறியீடு...`,
        subject: s,
        category: "videos",
        type: "Video",
        meta: "Class 10 Video",
        description: `Relations using R notation and ordered pairs.`,
        progress: 0,
        popular: true,
        url: "/source/video/ஓர் உறவை 'R' குறியீடு மற்றும் வரிசைச் சோடிகளின் மூலமாக வெளிப்படுத்துதல்._720.mp4"
      });
    }
    if (s === "Science" || s === "Physics") {
      out.push({
        id: `${slug}-vid-real-1`,
        title: `10th Physics (Tamil Medium): நியூட்டனின் பொது ஈர்ப்பியல் விதி`,
        subject: s,
        category: "videos",
        type: "Video",
        meta: "Class 10 Video",
        description: `Newton's Law of Universal Gravitation.`,
        progress: 0,
        popular: true,
        url: "/source/video/நியூட்டனின் பொது ஈர்ப்பியல் விதி_720.mp4"
      });
      out.push({
        id: `${slug}-vid-real-2`,
        title: `10th Science (Tamil Medium): ஆல்பா, பீட்டா மற்றும் காமா கதிர்கள் பண்புகள்`,
        subject: s,
        category: "videos",
        type: "Video",
        meta: "Class 10 Video",
        description: `Properties of Alpha, Beta, and Gamma Rays.`,
        progress: 0,
        popular: false,
        url: "https://d1fiv8ydi7ukjo.cloudfront.net/manarkeni/video/fc7ae090-db2c-11ef-9d3e-635aff381b6a.mp4"
      });
    }

    const vids = [
      { t: "Concept Explainer", d: "18:42", p: [80, 35, 0][si % 3] },
      { t: "Solved Examples Walkthrough", d: "24:10", p: [100, 0, 55][si % 3] },
      { t: "One-Shot Unit Revision", d: "41:05", p: 0 },
    ];
    vids.forEach((v, vi) =>
      out.push({
        id: `${slug}-vid-${vi + 1}`,
        title: `${s}: ${v.t}`,
        subject: s,
        category: "videos",
        type: "Video",
        meta: v.d,
        description: `Video lesson in Tamil & English covering key ${s} concepts from the current unit.`,
        progress: v.p,
        popular: vi === 0,
      })
    );
    // Digital content
    out.push(
      {
        id: `${slug}-dc-1`,
        title: `${s} Interactive Simulation Lab`,
        subject: s,
        category: "digital",
        type: "Interactive",
        meta: "Interactive · Works offline",
        description: "Hands-on interactive module — drag, experiment and visualise concepts step by step.",
        isNew: si % 3 === 0,
      },
      {
        id: `${slug}-dc-2`,
        title: `${s} Audio Lessons (Tamil medium)`,
        subject: s,
        category: "digital",
        type: "Audio",
        meta: "8 episodes · 2h 40m",
        description: "Listen-and-learn audio series for revision on the go, mapped to the syllabus units.",
      },
      {
        id: `${slug}-dc-3`,
        title: `${s} Educational Comic (Tamil)`,
        subject: s,
        category: "digital",
        type: "PDF",
        meta: "Visual Learning",
        description: "Engaging educational comic mapped to the syllabus to make learning fun.",
        url: "https://d1xhvnydnrsiid.cloudfront.net/ee9c95a0-fccc-11f0-9df5-e5268b529681.pdf",
        isNew: true,
      }
    );
    // Reference materials
    out.push(
      {
        id: `${slug}-ref-1`,
        title: `${s} Previous Year Question Papers (2019–2025)`,
        subject: s,
        category: "reference",
        type: "PDF",
        meta: "7 papers · 9.4 MB",
        description: "Board and mid-term question papers with official answer keys for exam pattern practice.",
        popular: true,
      },
      {
        id: `${slug}-ref-2`,
        title: `${s} Glossary & Formula Handbook`,
        subject: s,
        category: "reference",
        type: "eBook",
        meta: "64 pages · 4.1 MB",
        description: "All key terms, definitions and formulas in one searchable reference handbook.",
      }
    );
  });
  return out;
}

/* ────────────────────────────────────────────────────────────
   Category metadata for tabs & overview cards (flaticon names)
──────────────────────────────────────────────────────────── */
const CATEGORIES: {
  key: CategoryKey;
  label: string;
  icon: string;
  gradient: string;
  blurb: string;
}[] = [
  { key: "overview", label: "Overview", icon: "apps", gradient: "from-slate-500 to-slate-600", blurb: "" },
  { key: "subjects", label: "Class Subjects", icon: "graduation-cap", gradient: "from-indigo-500 to-violet-500", blurb: "Your subjects, teachers and progress at a glance" },
  { key: "syllabus", label: "Syllabus", icon: "book-alt", gradient: "from-emerald-500 to-teal-500", blurb: "Term-wise units with completion tracking" },
  { key: "textbooks", label: "Textbooks", icon: "book", gradient: "from-amber-500 to-orange-500", blurb: "Official Samacheer Kalvi textbooks & eBooks" },
  { key: "materials", label: "Study Materials", icon: "document", gradient: "from-blue-500 to-sky-500", blurb: "Question banks, worksheets & revision charts" },
  { key: "notes", label: "Teacher Notes", icon: "notebook", gradient: "from-pink-500 to-rose-500", blurb: "Class notes and tips shared by your teachers" },
  { key: "videos", label: "Video Lessons", icon: "play-alt", gradient: "from-red-500 to-orange-500", blurb: "Recorded lessons with resume support" },
  { key: "digital", label: "Digital Content", icon: "computer", gradient: "from-purple-500 to-violet-500", blurb: "Interactive sims, audio lessons & more" },
  { key: "reference", label: "Reference Materials", icon: "books", gradient: "from-cyan-500 to-sky-500", blurb: "Past papers, glossaries & handbooks" },
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
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<CategoryKey>("overview");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});

  const studentClass = String((session?.user as any)?.class || "10");
  const classNum = parseInt(studentClass.match(/\d+/)?.[0] || "10", 10);

  const subjects = useMemo(
    () => subjectsForClass(classNum).map((s, i) => buildSubjectInfo(s, i)),
    [classNum]
  );
  const resources = useMemo(
    () => buildResources(subjects.map((s) => s.name), studentClass),
    [subjects, studentClass]
  );

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

  // Close preview on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPreviewResource(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const subjectTheme = (name: string) =>
    subjects.find((s) => s.name === name) || buildSubjectInfo(name, 0);

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
              className={`p-1.5 rounded-lg transition-all active:scale-90 ${
                saved
                  ? "text-amber-500 bg-amber-500/10"
                  : "text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-500/10"
              }`}
              title={saved ? "Remove bookmark" : "Bookmark for later"}
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
              <Fi name="eye" className="text-xs" /> {r.category === "videos" ? "Watch" : "Open"}
            </button>
            <button
              className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card-hover)] active:scale-95 transition-all"
              title="Download for offline use"
            >
              <Fi name="download" className="text-sm" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const VideoCard = ({ r }: { r: Resource }) => {
    const t = subjectTheme(r.subject);
    const saved = bookmarks.includes(r.id);
    return (
      <div className="glass rounded-2xl border border-[var(--border)] overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all group flex flex-col">
        {/* Thumbnail */}
        <button
          onClick={() => setPreviewResource(r)}
          className={`relative h-32 bg-gradient-to-br ${t.gradient} flex items-center justify-center overflow-hidden`}
        >
          <span className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
          <span className="text-4xl opacity-40 absolute left-4 bottom-3">{t.icon}</span>
          <span className="w-14 h-14 rounded-full bg-white/25 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
            <Fi name="play" className="text-3xl" />
          </span>
          <span
            className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/60 px-2 py-0.5 rounded-md flex items-center gap-1"
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
                <Fi name="check" className="text-[10px]" /> Completed
              </span>
            ) : (r.progress || 0) > 0 ? (
              <span className="text-[10px] font-bold text-orange-500">{r.progress}% watched</span>
            ) : (
              <span className="text-[10px] font-semibold text-[var(--text-muted)]">Not started</span>
            )}
            <button
              onClick={() => setPreviewResource(r)}
              className="text-[11px] font-bold flex items-center gap-1 hover:gap-1.5 transition-all"
              style={{ color: t.color }}
            >
              {(r.progress || 0) > 0 && r.progress !== 100 ? "Resume" : "Watch"}{" "}
              <Fi name="arrow-small-right" className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ── render ──────────────────────────────────────────── */
  return (
    <PortalLayout
      title="Academics & Subjects"
      subtitle="Everything you need to learn — subjects, syllabus, books, notes and videos in one place."
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
                Class {studentClass} · Tamil Nadu State Board
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-black mb-1" style={{ color: "#fff" }}>
              Academics & Subjects Hub
            </div>
            <p className="text-sm max-w-xl" style={{ color: "rgba(255,255,255,0.9)" }}>
              Browse your class subjects, follow the syllabus, and open textbooks, study materials,
              teacher notes, video lessons and reference content — all from one place.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            {[
              { label: "Subjects", value: subjects.length, icon: "graduation-cap" },
              { label: "Resources", value: resources.length, icon: "document" },
              { label: "Videos", value: resources.filter((r) => r.category === "videos").length, icon: "play-alt" },
              { label: "Saved", value: bookmarks.length, icon: "bookmark" },
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
          <Fi name="apps" className="text-sm" /> All Subjects
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
                  ? `bg-gradient-to-br ${c.gradient} shadow-md`
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
              placeholder={`Search ${CATEGORIES.find((c) => c.key === activeTab)?.label.toLowerCase()}...`}
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
            Saved only {bookmarks.length > 0 && `(${bookmarks.length})`}
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
                    {count} {c.key === "subjects" ? "subjects" : c.key === "syllabus" ? "units" : "items"}
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
                  <Fi name="play-alt" className="text-base text-red-500" /> Continue Watching
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

          {/* New this week */}
          {newThisWeek.length > 0 && (
            <div>
              <h2 className="text-base font-black text-[var(--text-heading)] flex items-center gap-2 mb-3">
                <Fi name="sparkles" className="text-base text-emerald-500" /> New This Week
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
              <Fi name="chart-histogram" className="text-base text-indigo-500" /> Go Deeper
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Full Syllabus Board", href: "/student/syllabus-board", icon: "apps" },
                { label: "Learning Hub", href: "/student/centralized-content", icon: "brain" },
                { label: "Digital Library", href: "/student/digital-library", icon: "books" },
                { label: "AI Lessons", href: "/student/lessons", icon: "sparkles" },
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
                      Syllabus done
                    </span>
                  </div>
                </div>
                <h2 className="text-lg font-black text-[var(--text-heading)] mb-0.5 relative z-10">{s.name}</h2>
                <p className="text-xs text-[var(--text-muted)] mb-4 relative z-10">👨‍🏫 {s.teacher}</p>

                <div className="mb-4 relative z-10">
                  <div className="flex justify-between text-[10px] font-bold text-[var(--text-muted)] mb-1.5">
                    <span>
                      {s.unitsDone} of {s.units} units completed
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
                    { key: "textbooks" as CategoryKey, icon: "book", label: "Books" },
                    { key: "materials" as CategoryKey, icon: "document", label: "Notes" },
                    { key: "videos" as CategoryKey, icon: "play-alt", label: "Videos" },
                    { key: "syllabus" as CategoryKey, icon: "book-alt", label: "Units" },
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
      {activeTab === "syllabus" && (
        <div className="space-y-5">
          {syllabusSubjects.map((s) => {
            const units = buildSyllabus(s.name);
            return (
              <div key={s.name} className="glass rounded-2xl border border-[var(--border)] overflow-hidden">
                <div
                  className="px-5 py-4 flex items-center justify-between"
                  style={{ background: `linear-gradient(90deg, ${s.color}22, transparent)` }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-lg shadow`}
                    >
                      {s.icon}
                    </span>
                    <div>
                      <h2 className="text-sm font-black text-[var(--text-heading)]">{s.name} Syllabus</h2>
                      <p className="text-[10px] text-[var(--text-muted)] font-semibold">
                        Class {studentClass} · TN State Board · {units.length} units this year
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/student/syllabus"
                    className="text-[11px] font-bold flex items-center gap-1 hover:gap-1.5 transition-all"
                    style={{ color: s.color }}
                  >
                    Full syllabus <Fi name="arrow-small-right" className="text-xs" />
                  </Link>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {units.map((u) => {
                    const key = `${s.name}-${u.unit}`;
                    const open = !!expandedUnits[key];
                    return (
                      <div key={key}>
                        <button
                          onClick={() => setExpandedUnits((p) => ({ ...p, [key]: !p[key] }))}
                          className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--bg-card-hover)] transition-colors text-left"
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                              u.status === "completed"
                                ? "bg-emerald-500/15 text-emerald-500"
                                : u.status === "in-progress"
                                ? "bg-amber-500/15 text-amber-500"
                                : "bg-slate-500/10 text-[var(--text-muted)]"
                            }`}
                          >
                            {u.status === "completed" ? (
                              <Fi name="check" className="text-[10px]" />
                            ) : u.status === "in-progress" ? (
                              <Fi name="clock" className="text-xs" />
                            ) : (
                              <Fi name="book-alt" className="text-[10px]" />
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-[var(--text-heading)]">
                              {u.unit}: {u.title}
                            </span>
                            <span className="block text-[10px] text-[var(--text-muted)] font-semibold">
                              {u.term} ·{" "}
                              {u.status === "completed"
                                ? "Completed"
                                : u.status === "in-progress"
                                ? "In progress — current unit"
                                : "Upcoming"}
                            </span>
                          </div>
                          <Fi
                            name="angle-small-down"
                            className={`text-base text-[var(--text-muted)] transition-transform ${
                              open ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {open && (
                          <div className="px-5 pb-4 pl-14">
                            <ul className="space-y-1.5">
                              {u.topics.map((t) => (
                                <li
                                  key={t}
                                  className="text-xs text-[var(--text-main)] flex items-center gap-2"
                                >
                                  <span
                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{ backgroundColor: s.color }}
                                  />
                                  {t}
                                </li>
                              ))}
                            </ul>
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => {
                                  setSelectedSubject(s.name);
                                  setActiveTab("videos");
                                }}
                                className="text-[10px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all inline-flex items-center gap-1"
                                style={{ background: s.color, color: "#fff" }}
                              >
                                <Fi name="play" className="text-[9px]" /> Watch lessons
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedSubject(s.name);
                                  setActiveTab("materials");
                                }}
                                className="text-[10px] font-bold px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] active:scale-95 transition-all inline-flex items-center gap-1"
                              >
                                <Fi name="document" className="text-[9px]" /> Study materials
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ VIDEO LESSONS TAB ════════════════════════════ */}
      {activeTab === "videos" &&
        (filteredResources.length === 0 ? (
          <EmptyState saved={showSavedOnly} />
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
          <EmptyState saved={showSavedOnly} />
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
            {/* Modal header strip */}
            <div
              className={`h-36 bg-gradient-to-br ${subjectTheme(previewResource.subject).gradient} relative flex items-center justify-center`}
            >
              <span className="text-6xl opacity-30 absolute left-6 bottom-3">
                {subjectTheme(previewResource.subject).icon}
              </span>
              {previewResource.category === "videos" ? (
                <span
                  className="w-16 h-16 rounded-full bg-white/25 backdrop-blur flex items-center justify-center shadow-lg"
                  style={{ color: "#fff" }}
                >
                  <Fi name="play" className="text-3xl" />
                </span>
              ) : (
                <span
                  className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur flex items-center justify-center shadow-lg"
                  style={{ color: "#fff" }}
                >
                  <Fi name={TYPE_ICONS[previewResource.type]} className="text-3xl" />
                </span>
              )}
              <button
                onClick={() => setPreviewResource(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/25 hover:bg-black/45 active:scale-90 transition-all"
                style={{ color: "#fff" }}
              >
                <Fi name="cross-small" className="text-base" />
              </button>
            </div>

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
                  Shared by <span className="font-bold">{previewResource.addedBy}</span> ·{" "}
                  {previewResource.date}
                </p>
              )}

              {/* ── Inline Tamil Audio Player ──────────────────────── */}
              {previewResource.type === "Audio" && previewResource.subject === "Tamil" && (
                <TamilAudioPlayer />
              )}

              {/* ── Inline Video Player ────────────────────────────── */}
              {previewResource.type === "Video" && previewResource.url && (
                <div className="mb-4 rounded-2xl overflow-hidden shadow-lg border border-[var(--border)] bg-black">
                  <video
                    src={previewResource.url}
                    controls
                    className="w-full aspect-video"
                    controlsList="nodownload"
                  />
                </div>
              )}

              {/* ── Inline PDF Viewer ────────────────────────────── */}
              {previewResource.type === "PDF" && previewResource.url && (
                <div className="mb-4 rounded-2xl overflow-hidden shadow-lg border border-[var(--border)] bg-white">
                  <iframe
                    src={previewResource.url}
                    className="w-full aspect-[3/4] sm:aspect-[16/10]"
                    allow="autoplay"
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    if (previewResource.url && previewResource.type !== "Video") {
                      window.open(previewResource.url, "_blank");
                    }
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
                        ? `Resume at ${previewResource.progress}%`
                        : "Play lesson"}
                    </>
                  ) : (
                    <>
                      <Fi name="eye" className="text-sm" /> Open full view
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
                  {bookmarks.includes(previewResource.id) ? "Saved" : "Save"}
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border border-[var(--border)] text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] active:scale-95 transition-all">
                  <Fi name="download" className="text-sm" /> Download
                </button>
                <Link
                  href="/student/ai-tutor"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border border-indigo-500/40 text-indigo-500 hover:bg-indigo-500/10 active:scale-95 transition-all"
                >
                  <Fi name="comment-alt" className="text-sm" /> Ask AI Tutor
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

/* ── Empty state ─────────────────────────────────────── */
function EmptyState({ saved }: { saved: boolean }) {
  return (
    <div className="glass rounded-3xl border border-[var(--border)] p-12 text-center">
      <div className="text-5xl mb-4 text-[var(--text-muted)]">
        <Fi name={saved ? "bookmark" : "search"} className="text-5xl" />
      </div>
      <h3 className="text-base font-black text-[var(--text-heading)] mb-1">
        {saved ? "No saved items here yet" : "Nothing matches your search"}
      </h3>
      <p className="text-sm text-[var(--text-muted)]">
        {saved
          ? "Tap the bookmark icon on any resource to keep it handy here."
          : "Try a different keyword, or pick another subject from the chips above."}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Tamil Audio Player — 10th Std MP3 Lessons
   Served from /source/ (Next.js public folder)
═══════════════════════════════════════════════════════════ */
const TAMIL_TRACKS = [
  { id: "10-1-1", src: "/source/10 - 1 - 1.mp3", title: "Iyal 1 – Part 1", titleTamil: "இயல் 1 – பகுதி 1", iyal: 1 },
  { id: "10-2-1", src: "/source/10 - 2 - 1.mp3", title: "Iyal 2 – Part 1", titleTamil: "இயல் 2 – பகுதி 1", iyal: 2 },
  { id: "10-2-2", src: "/source/10 - 2 - 2.mp3", title: "Iyal 2 – Part 2", titleTamil: "இயல் 2 – பகுதி 2", iyal: 2 },
];

function TamilAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const fmt = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  const play = (track: typeof TAMIL_TRACKS[0]) => {
    if (!audioRef.current) return;
    if (activeId === track.id && playing) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }
    if (activeId !== track.id) {
      audioRef.current.src = track.src;
      audioRef.current.load();
      setProgress(0); setCurrentTime(0); setDuration(0);
    }
    setActiveId(track.id);
    audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
  };

  const onTime = () => {
    if (!audioRef.current) return;
    const c = audioRef.current.currentTime, d = audioRef.current.duration || 0;
    setCurrentTime(c); setDuration(d); setProgress(d > 0 ? (c / d) * 100 : 0);
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || !duration) return;
    const v = Number(e.target.value);
    audioRef.current.currentTime = (v / 100) * duration;
    setProgress(v);
  };

  const iyals = [1, 2];

  return (
    <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">🎵</span>
        <div>
          <div className="text-xs font-black text-[var(--text-heading)]">10th Tamil Audio Lessons</div>
          <div className="text-[10px] text-[var(--text-muted)]">வகுப்பு 10 – தமிழ் ஒலிப் பாடங்கள்</div>
        </div>
      </div>

      <audio ref={audioRef} onTimeUpdate={onTime} onLoadedMetadata={onTime} onEnded={() => { setPlaying(false); setProgress(0); }} />

      {iyals.map(iyal => (
        <div key={iyal}>
          <div className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1.5">
            இயல் {iyal} — Iyal {iyal}
          </div>
          <div className="space-y-1.5">
            {TAMIL_TRACKS.filter(t => t.iyal === iyal).map(track => {
              const isActive = activeId === track.id;
              return (
                <div
                  key={track.id}
                  className={`rounded-xl border-2 p-2.5 transition-all ${
                    isActive ? "border-amber-500 bg-amber-500/10" : "border-[var(--border)] hover:border-amber-400/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => play(track)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90 ${
                        isActive && playing ? "bg-amber-500 text-white" : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                      }`}
                    >
                      {isActive && playing ? (
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                          <rect x="5" y="4" width="4" height="16" rx="1"/><rect x="15" y="4" width="4" height="16" rx="1"/>
                        </svg>
                      ) : (
                        <Fi name="play" className="text-xs" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[var(--text-heading)] truncate">{track.title}</div>
                      <div className="text-[9px] text-[var(--text-muted)]">{track.titleTamil}</div>
                      {isActive && (
                        <div className="mt-1.5 space-y-0.5">
                          <input type="range" min={0} max={100} step={0.1} value={progress} onChange={seek}
                            className="w-full h-1 accent-amber-500 cursor-pointer" />
                          <div className="flex justify-between text-[9px] font-bold text-[var(--text-muted)]">
                            <span>{fmt(currentTime)}</span><span>{fmt(duration)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
