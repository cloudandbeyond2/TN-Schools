"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import Swal from "sweetalert2";

interface CulturalEvent {
  id: string;
  title: string;
  eventDate: string;
  location: string;
  description: string;
  status: string;
}

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_URL = getApiBase();

export default function TeacherCulturalEventsPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const schoolId: string = (session?.user as any)?.schoolId || "";

  const [events, setEvents] = useState<CulturalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<CulturalEvent | null>(null);

  const [registrations, setRegistrations] = useState<Record<string, any>>({});
  const [viewRegistrationsOpen, setViewRegistrationsOpen] = useState(false);
  const [activeEventForReg, setActiveEventForReg] = useState<CulturalEvent | null>(null);

  const loadRegistrationsFromStorage = useCallback(async () => {
    // 1. Read local memory state
    try {
      const stored = localStorage.getItem("cultural_registrations");
      if (stored) {
        setRegistrations(JSON.parse(stored));
      }
    } catch (e) {}

    // 2. Fetch server database registrations for cross-device/browser sync
    try {
      const url = schoolId 
        ? `${API_URL}/api/teacher/cultural-events/registrations/all?schoolId=${schoolId}`
        : `${API_URL}/api/teacher/cultural-events/registrations/all`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data && Array.isArray(json.data)) {
        setRegistrations((prev) => {
          const updated = { ...prev };
          json.data.forEach((reg: any) => {
            if (reg.eventId) updated[reg.eventId] = reg;
            if (reg.eventTitle) updated[reg.eventTitle] = reg;
          });
          return updated;
        });
      }
    } catch (e) {}
  }, [schoolId]);

  useEffect(() => {
    loadRegistrationsFromStorage();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cultural_registrations" || !e.key) {
        loadRegistrationsFromStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", loadRegistrationsFromStorage);

    const interval = setInterval(loadRegistrationsFromStorage, 1500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", loadRegistrationsFromStorage);
      clearInterval(interval);
    };
  }, [loadRegistrationsFromStorage]);

  const getEventRegistrations = useCallback((eventId: string, eventTitle?: string) => {
    if (!registrations || Object.keys(registrations).length === 0) return [];
    
    const matched: any[] = [];
    const seen = new Set();

    const addIfUnique = (item: any) => {
      if (!item) return;
      const key = `${item.participantName || ''}-${item.class || ''}-${item.registeredAt || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        matched.push(item);
      }
    };

    if (registrations[eventId]) {
      const val = registrations[eventId];
      if (Array.isArray(val)) val.forEach(addIfUnique);
      else addIfUnique(val);
    }

    if (eventTitle && registrations[eventTitle]) {
      const val = registrations[eventTitle];
      if (Array.isArray(val)) val.forEach(addIfUnique);
      else addIfUnique(val);
    }

    const cleanTitle = (eventTitle || "").toLowerCase().trim();
    const cleanId = (eventId || "").toLowerCase().trim();

    Object.entries(registrations).forEach(([k, val]: [string, any]) => {
      const items = Array.isArray(val) ? val : [val];
      items.forEach((item) => {
        if (!item) return;

        const regId = (item.eventId || "").toLowerCase();
        const regTitle = (item.eventTitle || "").toLowerCase();
        const keyLow = k.toLowerCase();

        const idMatch = cleanId && (regId === cleanId || keyLow === cleanId);
        const titleMatch = cleanTitle && (regTitle === cleanTitle || keyLow === cleanTitle);
        
        let fuzzyMatch = false;
        if (cleanTitle) {
          const targetWords = cleanTitle.split(/[\s&,-]+/).filter(w => w.length > 3);
          const sourceText = `${regTitle} ${keyLow}`;
          if (targetWords.length > 0 && targetWords.some(w => sourceText.includes(w))) {
            fuzzyMatch = true;
          }
        }

        if (idMatch || titleMatch || fuzzyMatch) {
          addIfUnique(item);
        }
      });
    });

    return matched;
  }, [registrations]);

  const getRegistrationCountForEvent = useCallback((eventId: string, eventTitle?: string) => {
    return getEventRegistrations(eventId, eventTitle).length;
  }, [getEventRegistrations]);

  const openRegistrationsModal = (evt: CulturalEvent) => {
    setActiveEventForReg(evt);
    setViewRegistrationsOpen(true);
  };

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const url = schoolId
        ? `${API_URL}/api/teacher/cultural-events?schoolId=${schoolId}`
        : `${API_URL}/api/teacher/cultural-events`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setEvents(data.data);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error("Failed to fetch events", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleOpenCreate = () => {
    setIsEdit(false);
    setCurrentEvent(null);
    setEventModalOpen(true);
  };

  const handleOpenEdit = (evt: CulturalEvent) => {
    setIsEdit(true);
    setCurrentEvent(evt);
    setEventModalOpen(true);
  };

  const parseLocation = (locStr?: string) => {
    if (!locStr) return { category: "General", venue: "", coordinator: "" };
    try {
      const parsed = JSON.parse(locStr);
      return {
        category: parsed.category || "General",
        venue: parsed.venue || parsed.coordinator || "",
        coordinator: parsed.coordinator || ""
      };
    } catch {
      return { category: "General", venue: locStr, coordinator: locStr };
    }
  };

  const getEventCategory = (title: string, desc: string, locStr: string) => {
    const parsedLoc = parseLocation(locStr);
    if (parsedLoc.category && parsedLoc.category !== "General") return parsedLoc.category;

    const text = `${title} ${desc}`.toLowerCase();
    if (text.includes("art") || text.includes("craft") || text.includes("drawing") || text.includes("paint")) return "Art & Craft";
    if (text.includes("music") || text.includes("dance") || text.includes("sing") || text.includes("song")) return "Music & Dance";
    if (text.includes("traditional") || text.includes("pongal") || text.includes("tamil") || text.includes("heritage")) return "Traditional";
    if (text.includes("drama") || text.includes("play") || text.includes("skit") || text.includes("literary")) return "Drama & Literary";
    if (text.includes("sport") || text.includes("game") || text.includes("race") || text.includes("kabaddi")) return "Sports & Fun";
    if (text.includes("science") || text.includes("exhibition") || text.includes("expo") || text.includes("tech")) return "Science & Exhibition";
    return "General";
  };

  const getDisplayLocation = (locStr?: string) => {
    if (!locStr) return "";
    try {
      const parsed = JSON.parse(locStr);
      return parsed.coordinator || parsed.category || locStr;
    } catch {
      return locStr;
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    const result = await Swal.fire({
      title: lang === "தமிழ்" ? "நிகழ்வை ரத்து செய்யவா?" : "Cancel Event?",
      text: `Are you sure you want to cancel the event "${title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f43f5e",
      cancelButtonColor: "#3085d6",
      confirmButtonText: lang === "தமிழ்" ? "ஆம், ரத்து செய்!" : "Yes, cancel it!"
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/teacher/cultural-events/${id}?schoolId=${schoolId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        Swal.fire({
          title: lang === "தமிழ்" ? "ரத்து செய்யப்பட்டது!" : "Cancelled!",
          text: `"${title}" has been cancelled.`,
          icon: "success",
          confirmButtonColor: "#f43f5e"
        });
        fetchEvents();
      }
    } catch (err) {
      console.error("Failed to delete event", err);
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) return;

    const formData = new FormData(e.target as HTMLFormElement);
    let locationVal = formData.get("location") as string;
    if (isEdit && currentEvent?.location) {
      try {
        const parsed = JSON.parse(currentEvent.location);
        locationVal = JSON.stringify({
          category: parsed.category || "General",
          coordinator: formData.get("location")
        });
      } catch {
        // Not a JSON string
      }
    }

    const payload = {
      title: formData.get("title"),
      eventDate: formData.get("eventDate"),
      location: locationVal,
      description: formData.get("description") || "A wonderful cultural event!",
      status: formData.get("status"),
      schoolId
    };

    try {
      let url = `${API_URL}/api/teacher/cultural-events`;
      let method = "POST";

      if (isEdit && currentEvent) {
        url = `${API_URL}/api/teacher/cultural-events/${currentEvent.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setEventModalOpen(false);
        Swal.fire({
          title: "Success!",
          text: isEdit ? "Event updated successfully!" : "New event created!",
          icon: "success",
          confirmButtonColor: "#f43f5e"
        });
        fetchEvents();
      }
    } catch (err) {
      console.error("Failed to save event", err);
    }
  };

  const TraditionalIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#FEF3C7" />
      <path d="M20 44C20 35.1634 25.3726 28 32 28C38.6274 28 44 35.1634 44 44H20Z" fill="#F59E0B" />
      <path d="M32 12C25.3726 12 20 17.3726 20 24C20 30.6274 25.3726 36 32 36C38.6274 36 44 30.6274 44 24C44 17.3726 38.6274 12 32 12Z" fill="#D97706" />
      <circle cx="32" cy="24" r="6" fill="#FEF3C7" />
      <path d="M32 18V21M32 27V30M26 24H29M35 24H38" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  const renderFlatIcon = (category: string, className = "w-12 h-12") => {
    switch (category) {
      case "Art & Craft":
        return <i className={`fi fi-rr-palette text-violet-600 dark:text-violet-400 ${className} flex items-center justify-center`} />;
      case "Music & Dance":
        return <i className={`fi fi-rr-music text-pink-600 dark:text-pink-400 ${className} flex items-center justify-center`} />;
      case "Traditional":
        return <TraditionalIcon className={className} />;
      case "Drama & Literary":
        return <i className={`fi fi-rr-theater text-emerald-600 dark:text-emerald-400 ${className} flex items-center justify-center`} />;
      case "Sports & Fun":
        return <i className={`fi fi-rr-trophy text-rose-600 dark:text-rose-400 ${className} flex items-center justify-center`} />;
      case "Science & Exhibition":
        return <i className={`fi fi-rr-flask text-sky-600 dark:text-sky-400 ${className} flex items-center justify-center`} />;
      default:
        return <i className={`fi fi-rr-star text-indigo-600 dark:text-indigo-400 ${className} flex items-center justify-center`} />;
    }
  };

  type VisualTheme = {
    accentColor: string;
    cardBg: string;
    cardBorder: string;
    cardHoverBorder: string;
    iconContainerBg: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    btnBg: string;
    btnText: string;
  };

  const THEMES: Record<string, VisualTheme> = {
    "Art & Craft": {
      accentColor: "text-violet-600 dark:text-violet-400",
      cardBg: "bg-violet-50/50 hover:bg-violet-100/60 dark:bg-violet-950/20 dark:hover:bg-violet-950/40",
      cardBorder: "border-slate-200 dark:border-slate-800",
      cardHoverBorder: "hover:border-violet-400 dark:hover:border-violet-700",
      iconContainerBg: "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300",
      badgeBg: "bg-violet-100 dark:bg-violet-900/50",
      badgeText: "text-violet-700 dark:text-violet-300",
      badgeBorder: "border-violet-300 dark:border-violet-700",
      btnBg: "bg-violet-600 hover:bg-violet-700 text-white",
      btnText: "text-white"
    },
    "Music & Dance": {
      accentColor: "text-pink-600 dark:text-pink-400",
      cardBg: "bg-pink-50/50 hover:bg-pink-100/60 dark:bg-pink-950/20 dark:hover:bg-pink-950/40",
      cardBorder: "border-slate-200 dark:border-slate-800",
      cardHoverBorder: "hover:border-pink-400 dark:hover:border-pink-700",
      iconContainerBg: "bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300",
      badgeBg: "bg-pink-100 dark:bg-pink-900/50",
      badgeText: "text-pink-700 dark:text-pink-300",
      badgeBorder: "border-pink-300 dark:border-pink-700",
      btnBg: "bg-pink-600 hover:bg-pink-700 text-white",
      btnText: "text-white"
    },
    "Traditional": {
      accentColor: "text-amber-600 dark:text-amber-400",
      cardBg: "bg-amber-50/50 hover:bg-amber-100/60 dark:bg-amber-950/20 dark:hover:bg-amber-950/40",
      cardBorder: "border-slate-200 dark:border-slate-800",
      cardHoverBorder: "hover:border-amber-400 dark:hover:border-amber-700",
      iconContainerBg: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300",
      badgeBg: "bg-amber-100 dark:bg-amber-900/50",
      badgeText: "text-amber-700 dark:text-amber-300",
      badgeBorder: "border-amber-300 dark:border-amber-700",
      btnBg: "bg-amber-600 hover:bg-amber-700 text-white",
      btnText: "text-white"
    },
    "Drama & Literary": {
      accentColor: "text-emerald-600 dark:text-emerald-400",
      cardBg: "bg-emerald-50/50 hover:bg-emerald-100/60 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40",
      cardBorder: "border-slate-200 dark:border-slate-800",
      cardHoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-700",
      iconContainerBg: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300",
      badgeBg: "bg-emerald-100 dark:bg-emerald-900/50",
      badgeText: "text-emerald-700 dark:text-emerald-300",
      badgeBorder: "border-emerald-300 dark:border-emerald-700",
      btnBg: "bg-emerald-600 hover:bg-emerald-700 text-white",
      btnText: "text-white"
    },
    "Sports & Fun": {
      accentColor: "text-rose-600 dark:text-rose-400",
      cardBg: "bg-rose-50/50 hover:bg-rose-100/60 dark:bg-rose-950/20 dark:hover:bg-rose-950/40",
      cardBorder: "border-slate-200 dark:border-slate-800",
      cardHoverBorder: "hover:border-rose-400 dark:hover:border-rose-700",
      iconContainerBg: "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300",
      badgeBg: "bg-rose-100 dark:bg-rose-900/50",
      badgeText: "text-rose-700 dark:text-rose-300",
      badgeBorder: "border-rose-300 dark:border-rose-700",
      btnBg: "bg-rose-600 hover:bg-rose-700 text-white",
      btnText: "text-white"
    },
    "Science & Exhibition": {
      accentColor: "text-sky-600 dark:text-sky-400",
      cardBg: "bg-sky-50/50 hover:bg-sky-100/60 dark:bg-sky-950/20 dark:hover:bg-sky-950/40",
      cardBorder: "border-slate-200 dark:border-slate-800",
      cardHoverBorder: "hover:border-sky-400 dark:hover:border-sky-700",
      iconContainerBg: "bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-300",
      badgeBg: "bg-sky-100 dark:bg-sky-900/50",
      badgeText: "text-sky-700 dark:text-sky-300",
      badgeBorder: "border-sky-300 dark:border-sky-700",
      btnBg: "bg-sky-600 hover:bg-sky-700 text-white",
      btnText: "text-white"
    },
    "General": {
      accentColor: "text-indigo-600 dark:text-indigo-400",
      cardBg: "bg-indigo-50/50 hover:bg-indigo-100/60 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40",
      cardBorder: "border-slate-200 dark:border-slate-800",
      cardHoverBorder: "hover:border-indigo-400 dark:hover:border-indigo-700",
      iconContainerBg: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300",
      badgeBg: "bg-indigo-100 dark:bg-indigo-900/50",
      badgeText: "text-indigo-700 dark:text-indigo-300",
      badgeBorder: "border-indigo-300 dark:border-indigo-700",
      btnBg: "bg-indigo-600 hover:bg-indigo-700 text-white",
      btnText: "text-white"
    }
  };

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "கலை மற்றும் திருவிழாக்கள்!" : "Culture & Fun!"}
      subtitle={lang === "தமிழ்" ? "நடனம், கலை மற்றும் இசைத் திருவிழாக்களில் இணையுங்கள்!" : "Manage school festivals, traditional assemblies, and creative expos!"}
    >
      <div className="flex flex-col gap-8 max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 w-full text-left">
        
        {/* Dynamic & Premium Hero Banner */}
        <div className="relative overflow-hidden rounded-[2rem] shadow-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 p-6 sm:p-10 lg:p-12 transition-all duration-300">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-8 items-center text-left">
            <div className="lg:col-span-3 space-y-4">
              <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-400 px-3 py-1.5 font-bold tracking-wider text-xs uppercase rounded-xl border border-yellow-200 dark:border-yellow-900/30 shadow-sm">
                <i className="fi fi-sr-star text-xs" /> Extracurricular Panel
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
                {lang === "தமிழ்" ? "தமிழ் மரபு மாதம்" : "Tamil Heritage Month"}
              </h2>
              
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-semibold leading-relaxed max-w-2xl">
                {lang === "தமிழ்" ? "நமது வளமான கலாச்சாரத்தை ஒன்றாகக் கொண்டாடுவோம்! சுவையான உணவு, அழகான நடனங்கள், பாரம்பரிய விளையாட்டுகள் மற்றும் பல வேடிக்கைகள் இருக்கும்!" : "Let's celebrate our rich culture together! Schedule traditional games, art expos, folk dances, musical plays, and delicious traditional food!"}
              </p>

              <div className="pt-4 flex flex-wrap gap-4 items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500 max-w-lg leading-relaxed">
                  {lang === "தமிழ்" ? "💡 கலாச்சார அறிவிப்புகளைப் பதிவிடவும், பங்கேற்பாளர்களின் பட்டியலை நிர்வகிக்கவும், மற்றும் செயல்பாடுகளை ஒருங்கிணைக்கவும் புதிய நிகழ்வைச் சேர் என்பதைத் தேர்ந்தெடுக்கவும்." : "💡 Click the button to schedule new cultural programs, manage participant rosters, and assign event coordinators."}
                </p>
                <button
                  onClick={handleOpenCreate}
                  className="px-6 py-3.5 bg-primary hover:bg-opacity-95 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 border-b-4 border-black/20 flex items-center justify-center gap-2 shrink-0"
                >
                  <i className="fi fi-rr-plus text-xs" /> {lang === "தமிழ்" ? "புதிய நிகழ்வைச் சேர்" : "Add New Event"}
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 flex justify-center lg:justify-end">
              <div className="relative group p-4 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-inner">
                <TraditionalIcon className="w-44 h-44 sm:w-56 sm:h-56 transform group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300 drop-shadow-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-950/40 text-primary rounded-2xl rotate-[-5deg]">
                <i className="fi fi-rr-calendar-heart text-base sm:text-xl" />
              </div>
              {lang === "தமிழ்" ? "வரவிருக்கும் நிகழ்வுகள்" : "Upcoming Cultural Events"}
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-20 font-bold text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-3">
              <i className="fi fi-rr-hourglass text-4xl animate-spin text-indigo-500" />
              <span className="text-sm">{lang === "தமிழ்" ? "நிகழ்வுகள் ஏற்றப்படுகின்றன..." : "Fetching school cultural events..."}</span>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-850/40 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-1 shadow-inner">
                <i className="fi fi-rr-party-horn text-3xl text-slate-400 dark:text-slate-600 animate-bounce" />
              </div>
              <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">{lang === "தமிழ்" ? "நிகழ்வுகள் இன்னும் இல்லை!" : "No events scheduled"}</h4>
              <p className="text-xs text-slate-400 font-semibold max-w-sm">
                {lang === "தமிழ்" ? "புதிய நிகழ்வைச் சேர்க்க 'புதிய நிகழ்வைச் சேர்' என்பதை அழுத்தவும்." : "No upcoming cultural activities scheduled for this school yet. Click 'Add New Event' to create the first event!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {events.map((evt) => {
                const category = getEventCategory(evt.title, evt.description, evt.location);
                const theme = THEMES[category] || THEMES["General"];
                const loc = parseLocation(evt.location);

                return (
                  <div
                    key={evt.id}
                    className={`flex flex-col h-full rounded-3xl border ${theme.cardBorder} ${theme.cardBg} ${theme.cardHoverBorder} hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group overflow-hidden bg-white dark:bg-slate-800 relative text-left`}
                  >
                    {/* Card Header: Icon + Status & Action Controls */}
                    <div className="relative p-6 flex justify-between items-start pb-4">
                      <div className={`p-1.5 rounded-2xl ${theme.iconContainerBg} transform group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300 shadow-sm`}>
                        {renderFlatIcon(category, "w-14 h-14 drop-shadow-sm")}
                      </div>

                      {/* Top-right Controls: Status Badge + Edit/Delete Buttons */}
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border ${theme.badgeBorder} ${theme.badgeBg} ${theme.badgeText} shadow-sm`}>
                          {evt.status}
                        </span>
                        <button
                          onClick={() => handleOpenEdit(evt)}
                          title="Edit Event"
                          className="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all shadow-sm border border-slate-200 dark:border-slate-700 active:scale-95"
                        >
                          <i className="fi fi-rr-edit text-xs" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(evt.id, evt.title)}
                          title="Delete Event"
                          className="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition-all shadow-sm border border-slate-200 dark:border-slate-700 active:scale-95"
                        >
                          <i className="fi fi-rr-trash text-xs" />
                        </button>
                      </div>
                    </div>

                    {/* Middle Text Info */}
                    <div className="px-6 pb-4 space-y-2 flex-grow">
                      <h4 className="text-lg font-black text-slate-800 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-emerald-400 transition-colors">
                        {evt.title}
                      </h4>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {evt.description}
                      </p>
                    </div>

                    {/* Event Meta Pills */}
                    <div className="px-6 pb-5 space-y-2.5">
                      <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <i className="fi fi-rr-calendar-lines text-indigo-500 text-sm" />
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
                            <span className="text-slate-300 dark:text-slate-700">|</span>
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <i className="fi fi-rr-marker text-rose-500 text-sm shrink-0" />
                              <span className="truncate">{loc.venue}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {loc.coordinator && (
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 px-1 truncate">
                          <i className="fi fi-rr-user text-slate-400" />
                          <span className="truncate">Coord: {loc.coordinator}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Hint / View Registrations */}
                    <div className="px-6 pb-6 pt-1.5 border-t border-slate-100 dark:border-slate-800 mt-auto bg-slate-50/20 dark:bg-slate-900/10 flex flex-col gap-2">
                      <button
                        onClick={() => openRegistrationsModal(evt)}
                        className={`w-full py-3 rounded-2xl text-xs font-black ${theme.btnBg} text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 active:scale-95 border-b-4 border-black/20`}
                      >
                        <i className="fi fi-rr-users text-sm text-white" />
                        <span className="text-white">View Registered ({getRegistrationCountForEvent(evt.id, evt.title)})</span>
                      </button>
                      <div className="text-center text-[9px] font-black uppercase tracking-wider text-slate-400 mt-1 flex items-center justify-center gap-1.5">
                        <i className="fi fi-rr-info text-indigo-500 text-sm" />
                        <span>Managed on Student Portal</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Create / Edit Event Modal */}
      {eventModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 rounded-[2rem] w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 p-5">
            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl mb-5 border border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5 text-left">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Management Panel</span>
                <h3 className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                  {isEdit ? "Edit Event" : "Create New Event"}
                </h3>
              </div>
              <button
                onClick={() => setEventModalOpen(false)}
                className="w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 hover:scale-105 transition-all shadow-sm border border-slate-200 dark:border-slate-700"
              >
                <i className="fi fi-rr-cross-small text-xl" />
              </button>
            </div>
            <form onSubmit={handleSaveEvent} className="space-y-5 px-1 text-left">
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                  Event Title
                </label>
                <input
                  required
                  name="title"
                  defaultValue={currentEvent?.title}
                  type="text"
                  placeholder="e.g., Annual Arts Fest"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                  Description
                </label>
                <textarea
                  required
                  name="description"
                  defaultValue={currentEvent?.description}
                  placeholder="What's this event about?"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none h-24 shadow-inner"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                    Date
                  </label>
                  <input
                    required
                    name="eventDate"
                    defaultValue={currentEvent ? new Date(currentEvent.eventDate).toISOString().substring(0, 10) : ""}
                    type="date"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                    Location / Coordinator
                  </label>
                  <input
                    required
                    name="location"
                    defaultValue={getDisplayLocation(currentEvent?.location)}
                    type="text"
                    placeholder="e.g., Linga (Science)"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                  Status
                </label>
                <select
                  required
                  name="status"
                  defaultValue={currentEvent?.status || "Upcoming"}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-3.5 px-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Planning">Planning</option>
                  <option value="Open Now!">Open Now!</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEventModalOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl text-xs font-black text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl text-xs font-black text-white bg-primary hover:bg-opacity-95 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 border-b-4 border-black/20"
                >
                  {isEdit ? "Update Event" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registered Students Modal */}
      {viewRegistrationsOpen && activeEventForReg && (
        <div className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 rounded-[2rem] w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 p-5 text-left max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl mb-4 border border-slate-100 dark:border-slate-800 shrink-0">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Registered Participants</span>
                <h3 className="text-base font-black text-indigo-600 dark:text-indigo-400 truncate max-w-xs">
                  {activeEventForReg.title}
                </h3>
              </div>
              <button
                onClick={() => setViewRegistrationsOpen(false)}
                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 transition-all shadow-sm border border-slate-200 dark:border-slate-700"
              >
                <i className="fi fi-rr-cross-small text-lg" />
              </button>
            </div>

            {/* List Body */}
            <div className="overflow-y-auto flex-grow space-y-3 pr-1">
              {getEventRegistrations(activeEventForReg.id, activeEventForReg.title).length === 0 ? (
                <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <i className="fi fi-rr-users text-3xl text-slate-300 dark:text-slate-600 mb-2 block" />
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No students registered yet for this event.</p>
                </div>
              ) : (
                getEventRegistrations(activeEventForReg.id, activeEventForReg.title).map((reg: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-black text-slate-800 dark:text-white truncate">
                        {reg.participantName || reg.name || "Student"}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400">
                        Class: <span className="text-indigo-600 dark:text-indigo-400">{reg.class || reg.grade || "8-A"}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                        Registered
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 shrink-0 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400">
                Total: <strong className="text-slate-700 dark:text-slate-200">{getRegistrationCountForEvent(activeEventForReg.id, activeEventForReg.title)}</strong> Students
              </span>
              <button
                onClick={() => setViewRegistrationsOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </PortalLayout>
  );
}
