"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";

type CulturalEvent = {
  id: string;
  title: string;
  eventDate: string;
  location: string;
  description: string;
  status: string;
};

// ==========================================
// 🎨 CATEGORY FLAT SVG ICONS (Vector Style)
// ==========================================
const ArtCraftIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#F3E8FF" />
    <path d="M46 32C46 39.732 39.732 46 32 46C27.5 46 25 43 21 43C17 43 14 40 14 32C14 22 22 16 32 16C42 16 46 24.268 46 32Z" fill="#C084FC" opacity="0.3"/>
    <path d="M44 32C44 38.6274 38.6274 44 32 44C28.2 44 26.5 41.5 22 41.5C17.5 41.5 15 39 15 32C15 23.5 21.5 18 32 18C42.5 18 44 25.3726 44 32Z" fill="#DDB088" />
    <circle cx="21" cy="32" r="3.5" fill="#F3E8FF" />
    <circle cx="28" cy="24" r="3" fill="#EF4444" />
    <circle cx="36" cy="26" r="3" fill="#3B82F6" />
    <circle cx="38" cy="34" r="3" fill="#10B981" />
    <circle cx="31" cy="37" r="3" fill="#F59E0B" />
    <path d="M47 15L43 19L45 21L49 17L47 15Z" fill="#1F2937" />
    <rect x="37" y="27" width="3" height="15" transform="rotate(-45 37 27)" fill="#9CA3AF" />
    <path d="M30 36L26 40C25 41 23.5 40.5 23 39.5C22.5 38.5 22 37 23 36L27 32" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
    <path d="M26 40C25.5 40.5 24.5 40.5 24 40C23.5 39.5 23.5 38.5 24 38L27 35" stroke="#EC4899" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const MusicDanceIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#DBEAFE" />
    <rect x="28" y="32" width="8" height="14" rx="4" fill="#9CA3AF" />
    <path d="M24 24C24 19.5817 27.5817 16 32 16C36.4183 16 40 19.5817 40 24V28C40 32.4183 36.4183 36 32 36C27.5817 36 24 32.4183 24 28V24Z" fill="#374151" />
    <path d="M24 24C24 21.5 27.5 20 32 20C36.5 20 40 21.5 40 24V26H24V24Z" fill="#D1D5DB" />
    <path d="M20 26C20 32 25 38 32 38C39 38 44 32 44 26" stroke="#4B5563" strokeWidth="3" strokeLinecap="round" />
    <line x1="32" y1="38" x2="32" y2="48" stroke="#4B5563" strokeWidth="3" />
    <line x1="26" y1="48" x2="38" y2="48" stroke="#4B5563" strokeWidth="3" strokeLinecap="round" />
    <path d="M46 16V24M46 18L52 16" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="43" cy="24" r="2.5" fill="#EC4899" />
    <path d="M16 18V26M16 20L22 18" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <circle cx="13" cy="26" r="2.5" fill="#3B82F6" />
  </svg>
);

const TraditionalIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#FEF3C7" />
    <path d="M22 46L38 14" stroke="#059669" strokeWidth="4" strokeLinecap="round" />
    <path d="M38 14C35 12 30 11 26 15" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M38 14C41 12 43 15 42 19" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <ellipse cx="32" cy="36" rx="14" ry="12" fill="#D97706" />
    <path d="M20 32C20 32 23 24 32 24C41 24 44 32 44 32" fill="#B45309" />
    <ellipse cx="32" cy="24" rx="9" ry="2.5" fill="#FBBF24" />
    <path d="M22 26C24 23 27 21 32 21C37 21 40 23 42 26C44 29 41 30 39 28C37 26 34 25 32 25C30 25 27 26 25 28C23 30 20 29 22 26Z" fill="#FFFDF5" />
    <path d="M20 36H44" stroke="#FFF" strokeWidth="1.5" strokeDasharray="3 3" />
    <polygon points="32,28 35,32 29,32" fill="#FFF" />
    <polygon points="26,32 29,36 23,36" fill="#FBBF24" />
    <polygon points="38,32 41,36 35,36" fill="#FBBF24" />
  </svg>
);

const DramaLiteraryIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#D1FAE5" />
    <path d="M16 22C16 18.5 21.5 17.5 26 19.5C30.5 21.5 31.5 27 30 32.5C28.5 38 22 41.5 17.5 39.5C13 37.5 16 25.5 16 22Z" fill="#10B981" />
    <circle cx="21" cy="26" r="1.5" fill="#FFF" />
    <circle cx="27" cy="28.5" r="1.5" fill="#FFF" />
    <path d="M20 33C21.5 35 24.5 35 26 33.5" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M48 26C48 22.5 42.5 21.5 38 23.5C33.5 25.5 32.5 31 34 36.5C35.5 42 42 45.5 46.5 43.5C51 41.5 48 29.5 48 26Z" fill="#3B82F6" />
    <circle cx="39" cy="30" r="1.5" fill="#FFF" />
    <circle cx="45" cy="32.5" r="1.5" fill="#FFF" />
    <path d="M43 39C41.5 37.5 39.5 37.5 38 38.5" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const SportsFunIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#FFE4E6" />
    <rect x="25" y="44" width="14" height="6" rx="1" fill="#4B5563" />
    <path d="M29 38H35V44H29V38Z" fill="#9CA3AF" />
    <path d="M18 20H46V32C46 39.732 39.732 40 32 40C24.268 40 18 39.732 18 32V20Z" fill="#FBBF24" />
    <path d="M18 24H14V30H18" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    <path d="M46 24H50V30H46" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    <polygon points="32,25 34,29 39,29 35,32 36,37 32,34 28,37 29,32 25,29 30,29" fill="#FFF" />
    <path d="M32 40L25 47H39L32 40Z" fill="#EF4444" />
  </svg>
);

const ScienceExhibitionIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#E0F2FE" />
    <ellipse cx="32" cy="30" rx="15" ry="5" transform="rotate(30 32 30)" stroke="#0ea5e9" strokeWidth="1.5" fill="none" opacity="0.5" />
    <ellipse cx="32" cy="30" rx="15" ry="5" transform="rotate(-30 32 30)" stroke="#0ea5e9" strokeWidth="1.5" fill="none" opacity="0.5" />
    <path d="M32 14C23.7157 14 18 19.7157 18 28C18 33 21 37 23.5 39C25.5 40.5 26 42.5 26 44.5V47H38V44.5C38 42.5 38.5 40.5 40.5 39C43 37 46 33 46 28C46 19.7157 40.2843 14 32 14Z" fill="#FBBF24" opacity="0.2" />
    <path d="M32 14C23.7157 14 18 19.7157 18 28C18 33 21 37 23.5 39C25.5 40.5 26 42.5 26 44.5V47H38V44.5C38 42.5 38.5 40.5 40.5 39C43 37 46 33 46 28C46 19.7157 40.2843 14 32 14Z" stroke="#0284c7" strokeWidth="3.5" strokeLinejoin="round" />
    <path d="M28 28L30 32H34L36 28" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <rect x="28" y="47" width="8" height="3" fill="#9CA3AF" />
    <rect x="29" y="50" width="6" height="2.5" fill="#4B5563" />
  </svg>
);

const DefaultIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#F4F6F7" />
    <circle cx="32" cy="32" r="16" fill="#3b82f6" />
    <circle cx="32" cy="32" r="8" fill="#60a5fa" />
    <circle cx="32" cy="32" r="4" fill="#FFFFFF" />
  </svg>
);

// Helper to choose the flat icon component
const renderFlatIcon = (category: string, className = "w-12 h-12") => {
  const sizeCls = className.includes("w-") ? "text-2xl" : "text-xl";
  switch (category) {
    case "Art & Craft":
      return <i className={`fi fi-sr-palette text-violet-600 dark:text-violet-400 ${sizeCls} ${className} flex items-center justify-center`} />;
    case "Music & Dance":
      return <i className={`fi fi-sr-music text-pink-600 dark:text-pink-400 ${sizeCls} ${className} flex items-center justify-center`} />;
    case "Traditional":
      return <i className={`fi fi-sr-scroll text-amber-600 dark:text-amber-400 ${sizeCls} ${className} flex items-center justify-center`} />;
    case "Drama & Literary":
      return <i className={`fi fi-sr-book-open-reader text-emerald-600 dark:text-emerald-400 ${sizeCls} ${className} flex items-center justify-center`} />;
    case "Sports & Fun":
      return <i className={`fi fi-sr-trophy text-rose-600 dark:text-rose-400 ${sizeCls} ${className} flex items-center justify-center`} />;
    case "Science & Exhibition":
      return <i className={`fi fi-sr-flask text-sky-600 dark:text-sky-400 ${sizeCls} ${className} flex items-center justify-center`} />;
    default:
      return <i className={`fi fi-sr-sparkles text-indigo-600 dark:text-indigo-400 ${sizeCls} ${className} flex items-center justify-center`} />;
  }
};

const getEventCategory = (title: string, description: string, locationStr: string): string => {
  try {
    const parsed = JSON.parse(locationStr);
    if (parsed.category) {
      const cat = parsed.category.toLowerCase();
      if (cat.includes("science") || cat.includes("tech") || cat.includes("expo") || cat.includes("exhibit")) return "Science & Exhibition";
      if (cat.includes("sport") || cat.includes("game") || cat.includes("fun")) return "Sports & Fun";
      if (cat.includes("art") || cat.includes("paint") || cat.includes("draw") || cat.includes("craft")) return "Art & Craft";
      if (cat.includes("music") || cat.includes("dance") || cat.includes("song") || cat.includes("choir")) return "Music & Dance";
      if (cat.includes("traditional") || cat.includes("heritage") || cat.includes("culture") || cat.includes("festival")) return "Traditional";
      if (cat.includes("drama") || cat.includes("theatre") || cat.includes("debate") || cat.includes("quiz")) return "Drama & Literary";
    }
  } catch (e) {}

  const text = `${title} ${description}`.toLowerCase();
  if (text.includes("science") || text.includes("tech") || text.includes("expo") || text.includes("robotics") || text.includes("innovat") || text.includes("experiment") || text.includes("math") || text.includes("exhibition") || text.includes("exhibit")) {
    return "Science & Exhibition";
  }
  if (text.includes("art") || text.includes("paint") || text.includes("draw") || text.includes("craft") || text.includes("design") || text.includes("kala") || text.includes("utsav")) {
    return "Art & Craft";
  }
  if (text.includes("music") || text.includes("dance") || text.includes("song") || text.includes("choir") || text.includes("singing") || text.includes("concert") || text.includes("drum") || text.includes("instrument") || text.includes("classical") || text.includes("performance") || strokeHasDance(text)) {
    return "Music & Dance";
  }
  if (text.includes("pongal") || text.includes("heritage") || text.includes("diwali") || text.includes("harvest") || text.includes("tamil") || text.includes("culture") || text.includes("traditional") || text.includes("festival")) {
    return "Traditional";
  }
  if (text.includes("drama") || text.includes("theatre") || text.includes("play") || text.includes("skit") || text.includes("acting") || text.includes("debate") || text.includes("quiz") || text.includes("literary") || text.includes("speech") || text.includes("elocution") || text.includes("poetry") || text.includes("write") || text.includes("reading")) {
    return "Drama & Literary";
  }
  if (text.includes("sports") || text.includes("game") || text.includes("run") || text.includes("athletic") || text.includes("football") || text.includes("cricket") || text.includes("chess") || text.includes("fun") || text.includes("celebration")) {
    return "Sports & Fun";
  }
  return "General";
};

const strokeHasDance = (text: string) => text.includes("dance") || text.includes("choir") || text.includes("music");

// Dynamic visual themes using ONLY safelisted and standard classes to prevent stripping
type VisualTheme = {
  accentColor: string;
  cardBg: string;
  cardBorder: string;
  cardHoverBorder: string;
  iconContainerBg: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  btnBg: string;
  btnHoverBg: string;
  btnText: string;
  pillBg: string;
  accentText: string;
};

const THEMES: Record<string, VisualTheme> = {
  "Art & Craft": {
    accentColor: "violet",
    cardBg: "bg-violet-50 hover:bg-violet-100 dark:bg-slate-900/60 dark:hover:bg-slate-900/80",
    cardBorder: "border-slate-200 dark:border-slate-800",
    cardHoverBorder: "hover:border-violet-400 dark:hover:border-violet-500",
    iconContainerBg: "bg-violet-100 dark:bg-violet-500/20",
    badgeBg: "bg-violet-100 dark:bg-violet-500/25",
    badgeBorder: "border-violet-400 dark:border-violet-500",
    badgeText: "text-violet-600 dark:text-violet-400",
    btnBg: "bg-violet-600 hover:bg-opacity-90 text-white",
    btnHoverBg: "hover:bg-violet-600",
    btnText: "text-white",
    pillBg: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
    accentText: "text-violet-600 dark:text-violet-400"
  },
  "Music & Dance": {
    accentColor: "indigo",
    cardBg: "bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-900/60 dark:hover:bg-slate-900/80",
    cardBorder: "border-slate-200 dark:border-slate-800",
    cardHoverBorder: "hover:border-indigo-400 dark:hover:border-indigo-500",
    iconContainerBg: "bg-indigo-100 dark:bg-indigo-500/20",
    badgeBg: "bg-indigo-100 dark:bg-indigo-500/25",
    badgeBorder: "border-indigo-400 dark:border-indigo-500",
    badgeText: "text-indigo-600 dark:text-indigo-400",
    btnBg: "bg-indigo-600 hover:bg-opacity-90 text-white",
    btnHoverBg: "hover:bg-indigo-600",
    btnText: "text-white",
    pillBg: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
    accentText: "text-indigo-600 dark:text-indigo-400"
  },
  "Traditional": {
    accentColor: "amber",
    cardBg: "bg-amber-50 hover:bg-amber-100 dark:bg-slate-900/60 dark:hover:bg-slate-900/80",
    cardBorder: "border-slate-200 dark:border-slate-800",
    cardHoverBorder: "hover:border-amber-400 dark:hover:border-amber-500",
    iconContainerBg: "bg-amber-100 dark:bg-amber-500/20",
    badgeBg: "bg-amber-100 dark:bg-amber-500/25",
    badgeBorder: "border-amber-400 dark:border-amber-500",
    badgeText: "text-amber-600 dark:text-amber-400",
    btnBg: "bg-amber-500 hover:bg-opacity-90 text-slate-900",
    btnHoverBg: "hover:bg-amber-500",
    btnText: "text-slate-900",
    pillBg: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    accentText: "text-amber-600 dark:text-amber-400"
  },
  "Drama & Literary": {
    accentColor: "emerald",
    cardBg: "bg-emerald-50 hover:bg-emerald-100 dark:bg-slate-900/60 dark:hover:bg-slate-900/80",
    cardBorder: "border-slate-200 dark:border-slate-800",
    cardHoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-500",
    iconContainerBg: "bg-emerald-100 dark:bg-emerald-500/20",
    badgeBg: "bg-emerald-100 dark:bg-emerald-500/25",
    badgeBorder: "border-emerald-400 dark:border-emerald-500",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    btnBg: "bg-emerald-600 hover:bg-opacity-90 text-white",
    btnHoverBg: "hover:bg-emerald-600",
    btnText: "text-white",
    pillBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    accentText: "text-emerald-600 dark:text-emerald-400"
  },
  "Sports & Fun": {
    accentColor: "rose",
    cardBg: "bg-rose-50 hover:bg-rose-100 dark:bg-slate-900/60 dark:hover:bg-slate-900/80",
    cardBorder: "border-slate-200 dark:border-slate-800",
    cardHoverBorder: "hover:border-rose-400 dark:hover:border-rose-500",
    iconContainerBg: "bg-rose-100 dark:bg-rose-500/20",
    badgeBg: "bg-rose-100 dark:bg-rose-500/25",
    badgeBorder: "border-rose-400 dark:border-rose-500",
    badgeText: "text-rose-600 dark:text-rose-400",
    btnBg: "bg-rose-600 hover:bg-opacity-90 text-white",
    btnHoverBg: "hover:bg-rose-600",
    btnText: "text-white",
    pillBg: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
    accentText: "text-rose-600 dark:text-rose-400"
  },
  "Science & Exhibition": {
    accentColor: "sky",
    cardBg: "bg-sky-50 hover:bg-sky-100 dark:bg-slate-900/60 dark:hover:bg-slate-900/80",
    cardBorder: "border-slate-200 dark:border-slate-800",
    cardHoverBorder: "hover:border-sky-400 dark:hover:border-sky-500",
    iconContainerBg: "bg-sky-100 dark:bg-sky-500/20",
    badgeBg: "bg-sky-100 dark:bg-sky-500/25",
    badgeBorder: "border-sky-400 dark:border-sky-500",
    badgeText: "text-sky-600 dark:text-sky-400",
    btnBg: "bg-sky-600 hover:bg-opacity-90 text-white",
    btnHoverBg: "hover:bg-sky-600",
    btnText: "text-white",
    pillBg: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
    accentText: "text-sky-600 dark:text-sky-400"
  },
  "General": {
    accentColor: "teal",
    cardBg: "bg-teal-50 hover:bg-teal-100 dark:bg-slate-900/60 dark:hover:bg-slate-900/80",
    cardBorder: "border-slate-200 dark:border-slate-800",
    cardHoverBorder: "hover:border-teal-400 dark:hover:border-teal-500",
    iconContainerBg: "bg-teal-100 dark:bg-teal-500/20",
    badgeBg: "bg-teal-100 dark:bg-teal-500/25",
    badgeBorder: "border-teal-400 dark:border-teal-500",
    badgeText: "text-teal-600 dark:text-teal-400",
    btnBg: "bg-teal-600 hover:bg-opacity-90 text-white",
    btnHoverBg: "hover:bg-teal-600",
    btnText: "text-white",
    pillBg: "bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400",
    accentText: "text-teal-600 dark:text-teal-400"
  }
};

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

export default function StudentCulturalEventsPage() {
  const { data: session } = useSession();
  const schoolId: string = (session?.user as any)?.schoolId || "";
  const studentClass: string = (session?.user as any)?.classId || "9th A";

  const [events, setEvents] = useState<CulturalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Registration and search states
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CulturalEvent | null>(null);
  const [registrations, setRegistrations] = useState<Record<string, any>>({});
  const [registrationType, setRegistrationType] = useState<"individual" | "group">("individual");
  const [isRepAuthorized, setIsRepAuthorized] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("soonest");
  const [showRegisteredOnly, setShowRegisteredOnly] = useState(false);

  // Sync with LocalStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cultural_registrations");
      if (stored) {
        setRegistrations(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading localStorage registrations:", e);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/teacher/cultural-events?schoolId=${schoolId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setEvents(json.data);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle Registration Modal Submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    if (registrationType === "group" && !isRepAuthorized) {
      Swal.fire({
        title: "Representative Authority Required",
        text: "Please verify that you are the Class Representative or an authorized Student Leader to register a group/class.",
        icon: "warning",
        confirmButtonText: "Okay",
        confirmButtonColor: "#4f46e5"
      });
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);
    
    let cls = "";
    let count = 1;
    let participantName = "";

    if (registrationType === "individual") {
      cls = studentClass;
      count = 1;
      participantName = formData.get("studentName") as string || (session?.user?.name || "Student");
    } else {
      cls = formData.get("class") as string || studentClass;
      count = parseInt(formData.get("count") as string) || 1;
    }

    const regItem = {
      type: registrationType,
      class: cls,
      count: count,
      participantName: participantName,
      registeredAt: new Date().toISOString(),
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title
    };

    const newRegistrations = {
      ...registrations,
      [selectedEvent.id]: regItem,
      [selectedEvent.title]: regItem
    };

    setRegistrations(newRegistrations);
    localStorage.setItem("cultural_registrations", JSON.stringify(newRegistrations));

    // Persist to server database
    try {
      fetch(`${API_BASE}/api/teacher/cultural-events/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          eventTitle: selectedEvent.title,
          participantName: participantName,
          class: cls,
          count: count,
          type: registrationType,
          schoolId: schoolId,
          studentId: (session?.user as any)?.id || ""
        })
      }).catch(err => console.error("Database register error", err));
    } catch (e) {
      console.error("Failed to post registration to server database", e);
    }

    setRegisterModalOpen(false);

    Swal.fire({
      title: "Successfully Registered!",
      text: registrationType === "individual"
        ? `Awesome! You have successfully registered for the event "${selectedEvent.title}"! 🎉`
        : `Yay! You registered class "${cls}" with ${count} students for the event "${selectedEvent.title}"! 🎉`,
      icon: "success",
      confirmButtonText: "Awesome!",
      confirmButtonColor: "#4f46e5"
    });
  };

  // Handle Cancellation of Registration
  const handleCancelRegistration = (eventId: string, eventTitle: string) => {
    Swal.fire({
      title: "Cancel Registration?",
      text: `Are you sure you want to cancel your class registration for "${eventTitle}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, cancel it"
    }).then((result) => {
      if (result.isConfirmed) {
        const newRegistrations = { ...registrations };
        delete newRegistrations[eventId];
        setRegistrations(newRegistrations);
        localStorage.setItem("cultural_registrations", JSON.stringify(newRegistrations));
        Swal.fire({
          title: "Cancelled",
          text: "Your registration has been cancelled successfully.",
          icon: "success",
          confirmButtonColor: "#4f46e5"
        });
      }
    });
  };

  // Open register modal helper
  const openRegisterModal = (evt: CulturalEvent) => {
    setSelectedEvent(evt);
    setRegistrationType("individual");
    setIsRepAuthorized(false);
    setRegisterModalOpen(true);
  };

  // Parse location utility
  const parseLocation = (locString: string) => {
    try {
      const parsed = JSON.parse(locString);
      return {
        coordinator: parsed.coordinator || "",
        category: parsed.category || "School Event",
        venue: parsed.venue || ""
      };
    } catch {
      return {
        coordinator: "",
        category: "School Event",
        venue: locString || ""
      };
    }
  };

  // Filters, Search and Sorter
  const filteredEvents = events
    .filter(evt => {
      const cat = getEventCategory(evt.title, evt.description, evt.location);
      const locDetails = parseLocation(evt.location);
      const matchesSearch =
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        locDetails.coordinator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        locDetails.venue.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || cat === selectedCategory;
      const matchesRegistered = !showRegisteredOnly || !!registrations[evt.id];

      return matchesSearch && matchesCategory && matchesRegistered;
    })
    .sort((a, b) => {
      const dateA = new Date(a.eventDate).getTime();
      const dateB = new Date(b.eventDate).getTime();
      return sortBy === "soonest" ? dateA - dateB : dateB - dateA;
    });

  // Calculate stats
  const totalEventsCount = events.length;
  const registeredEventsCount = Object.keys(registrations).length;
  
  // Find soonest upcoming event
  const soonestEvent = events
    .filter(e => new Date(e.eventDate).getTime() >= new Date().getTime())
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())[0];

  const categoriesSet = new Set(events.map(e => getEventCategory(e.title, e.description, e.location)));
  const uniqueCategoriesCount = categoriesSet.size;

  // Pick dynamic Featured Hero Event (upcoming) filter-aware
  const categoryFilteredEvents = events.filter(e => {
    if (selectedCategory === "All") return true;
    return getEventCategory(e.title, e.description, e.location) === selectedCategory;
  });

  const categorySoonestEvent = categoryFilteredEvents
    .filter(e => new Date(e.eventDate).getTime() >= new Date().getTime())
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())[0];

  const heroEvent = categorySoonestEvent || (categoryFilteredEvents.length > 0 ? categoryFilteredEvents[0] : null);
  const heroCategory = heroEvent ? getEventCategory(heroEvent.title, heroEvent.description, heroEvent.location) : "Traditional";

  return (
    <PortalLayout
      title="Culture & Fun!"
      subtitle="Join the dance, art, and music festivals!"
    >
      <div className="flex flex-col gap-8 w-full max-w-none text-left">
        {/* Dynamic & Premium Hero Banner */}
        {heroEvent ? (
          <div className="relative overflow-hidden rounded-2xl shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 md:p-6 transition-all duration-300">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left w-full">
              <div className="space-y-3 flex-1">
                <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-400 px-2.5 py-1 font-bold tracking-wider text-[10px] uppercase rounded-xl border border-yellow-200 dark:border-yellow-900/30 shadow-sm">
                  <i className="fi fi-sr-sparkles text-[10px]" /> Featured Event
                </div>
                
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
                  {heroEvent.title}
                </h2>
                
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
                  {heroEvent.description}
                </p>

                <div className="flex flex-wrap gap-3 pt-1 text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-850">
                    <i className="fi fi-rr-calendar-lines text-indigo-500" />
                    <span>{new Date(heroEvent.eventDate).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
                  </div>
                  {(() => {
                    const loc = parseLocation(heroEvent.location);
                    const displayLocStr = loc.venue && loc.coordinator
                      ? `${loc.venue} (Coord: ${loc.coordinator})`
                      : (loc.venue || (loc.coordinator ? `Coord: ${loc.coordinator}` : ""));
                    if (!displayLocStr) return null;
                    return (
                      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-850">
                        <i className="fi fi-rr-marker text-rose-500" />
                        <span>{displayLocStr}</span>
                      </div>
                    );
                  })()}
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  {registrations[heroEvent.id] ? (
                    <button
                      onClick={() => handleCancelRegistration(heroEvent.id, heroEvent.title)}
                      className="px-4 py-2 rounded-xl text-xs font-black border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100/50 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
                    >
                      <i className="fi fi-sr-checkbox text-xs" /> Registered ({registrations[heroEvent.id]?.type === "individual" ? "Individual" : "Group"})
                    </button>
                  ) : new Date(heroEvent.eventDate).getTime() < new Date().getTime() ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl text-xs font-black bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-650 cursor-not-allowed flex items-center gap-2 border border-slate-200 dark:border-slate-800"
                    >
                      <i className="fi fi-rr-ban text-xs" /> Event Closed
                    </button>
                  ) : (
                    <button
                      onClick={() => openRegisterModal(heroEvent)}
                      className="px-4 py-2 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-opacity-95 shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 border-b-4 border-black/20"
                    >
                      <i className="fi fi-sr-ticket text-xs" /> Register to Participate
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-center md:justify-end shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/20 flex items-center justify-center shadow-sm">
                  {renderFlatIcon(heroCategory, "w-10 h-10 sm:w-12 sm:h-12 drop-shadow-sm")}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Default Heritage Month Fallback if no database events */
          <div className="relative overflow-hidden rounded-2xl shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 md:p-6 transition-all duration-300">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left w-full">
              <div className="space-y-3 flex-1">
                <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-400 px-2.5 py-1 font-bold tracking-wider text-[10px] uppercase rounded-xl border border-yellow-200 dark:border-yellow-900/30 shadow-sm">
                  <i className="fi fi-sr-sparkles text-[10px]" /> Featured Event
                </div>
                
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
                  Tamil Heritage &amp; Arts Month
                </h2>
                
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
                  Let's celebrate our rich culture together! Join the state-wide celebrations featuring traditional games, art expos, folk dances, musical plays, and delicious traditional food!
                </p>

                <div className="flex flex-wrap gap-3 pt-1 text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-850">
                    <i className="fi fi-rr-calendar-lines text-indigo-500" />
                    <span>August 1 – August 31, 2026</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-850">
                    <i className="fi fi-rr-marker text-rose-500" />
                    <span>School Campus &amp; Auditorium</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center md:justify-end shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/20 flex items-center justify-center shadow-sm">
                  <i className="fi fi-sr-scroll text-amber-500 text-3xl sm:text-4xl" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 📊 Interactive Stats Overview Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Scheduled</span>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white">{totalEventsCount}</h4>
              <p className="text-[11px] text-slate-500 font-semibold">School festivals & events</p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <i className="fi fi-rr-calendar text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">My Registrations</span>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white">{registeredEventsCount}</h4>
              <p className="text-[11px] text-slate-500 font-semibold">Registered class programs</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <i className="fi fi-rr-ticket text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Soonest Event</span>
              <h4 className="text-sm font-black text-slate-800 dark:text-white truncate max-w-[140px]">
                {soonestEvent ? soonestEvent.title : "None Scheduled"}
              </h4>
              <p className="text-[11px] text-slate-500 font-semibold">
                {soonestEvent ? (
                  `${Math.max(0, Math.ceil((new Date(soonestEvent.eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days remaining`
                ) : (
                  "Plan new programs"
                )}
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl">
              <i className="fi fi-rr-clock text-2xl" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Diverse Tracks</span>
              <h4 className="text-2xl font-black text-slate-800 dark:text-white">{uniqueCategoriesCount}</h4>
              <p className="text-[11px] text-slate-500 font-semibold">Specialized event fields</p>
            </div>
            <div className="p-3 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-2xl">
              <i className="fi fi-rr-palette text-2xl" />
            </div>
          </div>

        </div>

        {/* 🔍 Search & Interactive Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 shadow-sm">
          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <i className="fi fi-rr-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search festivals, staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400"
            />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl py-2.5 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="soonest">Sort by: Soonest</option>
              <option value="latest">Sort by: Latest</option>
            </select>

            <button
              onClick={() => setShowRegisteredOnly(!showRegisteredOnly)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 border ${
                showRegisteredOnly
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-350 border-slate-200 dark:border-slate-700"
              }`}
            >
              <i className="fi fi-rr-ticket text-xs" />
              <span>Registered Only</span>
            </button>
          </div>
        </div>

        {/* Categories Horizontal Scrolling Pill List */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {["All", "Art & Craft", "Music & Dance", "Traditional", "Drama & Literary", "Sports & Fun", "Science & Exhibition"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border shadow-sm ${
                selectedCategory === cat
                  ? "bg-primary text-white border-primary ring-2 ring-primary/20 shadow-md shadow-primary/10"
                  : "bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 🗓️ Grid list of Event Cards */}
        <div>
          {loading ? (
            <div className="text-center py-20 font-bold text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-3">
              <i className="fi fi-rr-hourglass text-4xl animate-spin text-indigo-500" />
              <span className="text-sm">Fetching upcoming cultural events...</span>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-850/40 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-1 shadow-inner">
                <i className="fi fi-rr-party-horn text-3xl text-slate-400 dark:text-slate-600 animate-bounce" />
              </div>
              <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">No events found</h4>
              <p className="text-xs text-slate-400 font-semibold max-w-sm">
                Try modifying your filters, search terms, or check back later for newly scheduled cultural activities!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredEvents.map((evt) => {
                const category = getEventCategory(evt.title, evt.description, evt.location);
                const theme = THEMES[category] || THEMES["General"];
                const loc = parseLocation(evt.location);
                const isRegistered = !!registrations[evt.id];
                
                const isPastEvent = new Date(evt.eventDate).getTime() < new Date().getTime();
                const displayStatus = isPastEvent ? "CLOSED" : evt.status;

                return (
                  <div
                    key={evt.id}
                    className={`flex flex-col h-full rounded-2xl border ${theme.cardBorder} ${theme.cardBg} ${theme.cardHoverBorder} hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group overflow-hidden bg-white dark:bg-slate-800`}
                  >
                    {/* Card Banner / Icon Wrapper */}
                    <div className="relative p-4 flex justify-between items-center pb-3">
                      <div className={`w-12 h-12 rounded-xl ${theme.iconContainerBg} flex items-center justify-center transform group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300 shadow-sm shrink-0`}>
                        {renderFlatIcon(category, "text-2xl")}
                      </div>

                      {/* Top-right Status & Category Badge */}
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-lg border ${theme.badgeBorder} ${theme.badgeBg} ${theme.badgeText} shadow-sm`}>
                          {displayStatus}
                        </span>
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          {category}
                        </span>
                      </div>
                    </div>

                    {/* Middle Text Info */}
                    <div className="px-4 pb-3 space-y-1.5 flex-grow">
                      <h4 className="text-sm font-extrabold text-slate-800 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {evt.title}
                      </h4>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {evt.description}
                      </p>
                    </div>

                    {/* Event Meta Pills */}
                    <div className="px-4 pb-4 space-y-2">
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-350">
                        <div className="flex items-center gap-1">
                          <i className="fi fi-rr-calendar-lines text-indigo-500 text-xs" />
                          <span>
                            {new Date(evt.eventDate).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </span>
                        </div>
                        {loc.venue && (
                          <>
                            <span className="text-slate-350 dark:text-slate-700">|</span>
                            <div className="flex items-center gap-1 min-w-0 flex-1">
                              <i className="fi fi-rr-marker text-rose-500 text-xs shrink-0" />
                              <span className="truncate">{loc.venue}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Coordinator Detail If Exists */}
                      {loc.coordinator && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-550 dark:text-slate-400 px-0.5 truncate">
                          <i className="fi fi-rr-user text-slate-400 text-xs" />
                          <span className="truncate">Coord: {loc.coordinator}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button at bottom */}
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-850/80 mt-auto bg-slate-50/20 dark:bg-slate-900/10">
                      {isRegistered ? (
                        <button
                          onClick={() => handleCancelRegistration(evt.id, evt.title)}
                          className="w-full py-2.5 rounded-xl text-xs font-black border border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100/50 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                        >
                          <i className="fi fi-sr-checkbox text-xs" />
                          <span>Registered ({registrations[evt.id]?.type === "individual" ? "Individual" : "Group"})</span>
                        </button>
                      ) : evt.status.toLowerCase().includes("completed") || isPastEvent ? (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-xl text-xs font-black bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-650 cursor-not-allowed flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-800"
                        >
                          <i className="fi fi-rr-ban text-xs" />
                          <span>{isPastEvent ? "Event Closed" : "Completed Program"}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openRegisterModal(evt)}
                          className={`w-full py-2.5 rounded-xl text-xs font-black ${theme.btnBg} ${theme.btnText} hover:shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 border-b-4 border-black/20`}
                        >
                          <i className="fi fi-sr-ticket text-xs" />
                          <span>Register to Participate</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* 🎟️ Register Class Modal */}
      {registerModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 p-5">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl mb-5 border border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Enrollment Panel</span>
                <h3 className="text-lg font-black text-indigo-600 dark:text-indigo-400">Register to Participate</h3>
              </div>
              <button
                onClick={() => setRegisterModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 hover:scale-105 transition-all shadow-sm border border-slate-200 dark:border-slate-700"
              >
                <i className="fi fi-rr-cross-small text-xl" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRegisterSubmit} className="space-y-5 px-1">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                  Event Selection
                </label>
                <div className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-3 px-4 text-xs font-bold shadow-inner">
                  {selectedEvent.title}
                </div>
              </div>

              {/* Participation Mode Toggle */}
              <div>
                <label className="block text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-2">
                  Participation Mode
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setRegistrationType("individual")}
                    className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      registrationType === "individual"
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <i className="fi fi-rr-user text-xs" />
                    <span>Individual</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegistrationType("group")}
                    className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      registrationType === "group"
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <i className="fi fi-rr-users-alt text-xs" />
                    <span>Group / Class</span>
                  </button>
                </div>
              </div>

              {registrationType === "individual" ? (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                    Student Name
                  </label>
                  <input
                    required
                    name="studentName"
                    type="text"
                    defaultValue={session?.user?.name || "Karthik S."}
                    placeholder="e.g., Karthik S."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                        Class & Section
                      </label>
                      <input
                        required
                        name="class"
                        type="text"
                        defaultValue={studentClass}
                        placeholder="e.g., 9th A"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                        Student Count
                      </label>
                      <input
                        required
                        name="count"
                        type="number"
                        min="2"
                        max="60"
                        placeholder="15"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Representative Authorization Checkbox */}
                  <label className="flex items-start gap-3 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all select-none">
                    <input
                      type="checkbox"
                      checked={isRepAuthorized}
                      onChange={(e) => setIsRepAuthorized(e.target.checked)}
                      className="mt-0.5 w-4.5 h-4.5 text-indigo-650 border-slate-300 rounded focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                    />
                    <div className="text-[11px] font-bold text-indigo-950 dark:text-indigo-200 leading-snug">
                      I confirm that I am the Class Representative or an authorized student representative for this class/group.
                    </div>
                  </label>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl text-xs font-black text-slate-550 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registrationType === "group" && !isRepAuthorized}
                  className={`flex-1 py-3.5 rounded-2xl text-xs font-black text-white transition-all shadow-lg active:scale-95 border-b-4 border-black/20 flex items-center justify-center gap-2 ${
                    registrationType === "group" && !isRepAuthorized
                      ? "bg-slate-300 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none hover:bg-opacity-100 border-slate-400/20"
                      : "bg-primary hover:bg-opacity-95 shadow-indigo-500/20"
                  }`}
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </PortalLayout>
  );
}
