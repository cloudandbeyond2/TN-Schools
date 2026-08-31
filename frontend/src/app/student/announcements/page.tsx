"use client";

import PortalLayout from "@/components/PortalLayout";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Announcement {
  id: string;
  title: string;
  body: string;
  target: string;
  date: string;
  sender: string;
  pinned: boolean;
  createdAt: string;
}

// Clean raw emojis, replacement chars, and lone surrogates cleanly (ES5 compatible)
function sanitizeUnicodeText(str: string): string {
  if (!str) return "";
  var clean = str.replace(/[\uFFFD\uD800-\uDFFF]/g, '');
  clean = clean.replace(/^(?:[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|\uFE0F|\u200D|\s|\uFFFD)+/, '');
  return clean.trim();
}

// Flat Icon & Specific Title Generator
function formatNotification(sender: string, title: string, body: string, target?: string, studentClass?: string) {
  const text = `${title} ${body}`.toLowerCase();
  
  // Clean raw emojis from beginning of body text
  let cleanBody = sanitizeUnicodeText(body);

  // Dynamic exact teacher name resolution
  let dynamicSender = sender;
  let clsStr = "";
  if (studentClass) {
    const cleanCls = String(studentClass).trim();
    if (cleanCls.toLowerCase().startsWith("class")) {
      clsStr = ` (${cleanCls})`;
    } else {
      clsStr = ` (Class ${cleanCls})`;
    }
  }

  if (!sender || sender === "System Automated" || sender === "System") {
    if (text.includes("sport") || text.includes("competition") || text.includes("athletics") || text.includes("badminton") || text.includes("chess") || text.includes("football") || text.includes("stadium")) {
      dynamicSender = "Physical Education Dept";
    } else if (text.includes("social activity") || text.includes("approved") || text.includes("remarks") || text.includes("teacher")) {
      dynamicSender = "Class Teacher";
    } else if (text.includes("badge") || text.includes("unlocked") || text.includes("volunteer") || text.includes("changemaker")) {
      dynamicSender = "Awards & Recognition Committee";
    } else if (text.includes("science") || text.includes("lab") || text.includes("exhibition") || text.includes("robotics")) {
      dynamicSender = "Science Dept";
    } else {
      dynamicSender = "Headmaster Office";
    }
  }

  let type = "General";
  let rawTitle = title && title !== "Personal Alert" ? title : "School Circular";
  let formattedTitle = sanitizeUnicodeText(rawTitle) || "School Circular";
  let iconClass = "fi fi-rr-bullhorn";
  let color = "text-emerald-600 dark:text-emerald-400";
  let bg = "bg-emerald-50/60 dark:bg-emerald-950/20";
  let border = "border-emerald-200/80 dark:border-emerald-900/40";
  let badgeBg = "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
  let iconBg = "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300";

  // 1. Badges & Achievements
  if (text.includes("badge") || text.includes("unlocked") || text.includes("achievement") || text.includes("volunteer") || text.includes("changemaker")) {
    type = "Personal Alert";
    formattedTitle = (!title || title === "Personal Alert") ? "Achievement Badge Unlocked!" : sanitizeUnicodeText(title);
    iconClass = "fi fi-rr-trophy";
    color = "text-amber-600 dark:text-amber-400";
    bg = "bg-amber-50/60 dark:bg-amber-950/20";
    border = "border-amber-200/80 dark:border-amber-900/40";
    badgeBg = "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    iconBg = "bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300";
  }
  // 2. Approvals & Dashboard Remarks
  else if (text.includes("approved") || text.includes("activity") || text.includes("remarks") || text.includes("verified")) {
    type = "Personal Alert";
    formattedTitle = (!title || title === "Personal Alert") ? "Social Activity Approved" : sanitizeUnicodeText(title);
    iconClass = "fi fi-rr-badge-check";
    color = "text-amber-600 dark:text-amber-400";
    bg = "bg-amber-50/60 dark:bg-amber-950/20";
    border = "border-amber-200/80 dark:border-amber-900/40";
    badgeBg = "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    iconBg = "bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300";
  }
  // 3. Urgent / Emergency
  else if (
    text.includes("urgent") || text.includes("closure") || text.includes("emergency") ||
    text.includes("closed") || text.includes("holiday") || text.includes("heavy rain") ||
    text.includes("bus route") || text.includes("water supply") || text.includes("parent meeting")
  ) {
    type = "Urgent";
    formattedTitle = (!title || title === "Personal Alert") ? "Urgent School Notice" : sanitizeUnicodeText(title);
    iconClass = "fi fi-rr-alarm-exclamation";
    color = "text-rose-600 dark:text-rose-400";
    bg = "bg-rose-50/60 dark:bg-rose-950/20";
    border = "border-rose-200/80 dark:border-rose-900/40";
    badgeBg = "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
    iconBg = "bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300";
  }
  // 4. Academic / Exams / Study Material
  else if (
    text.includes("exam") || text.includes("timetable") || text.includes("test") ||
    text.includes("homework") || text.includes("quiz") || text.includes("practical") ||
    text.includes("study") || text.includes("material") || text.includes("progress") ||
    text.includes("report") || text.includes("library") || text.includes("scholarship") ||
    text.includes("workshop") || text.includes("submission") || text.includes("chapter")
  ) {
    type = "Academic";
    formattedTitle = (!title || title === "Personal Alert") ? "Academic Notice" : sanitizeUnicodeText(title);
    iconClass = "fi fi-rr-graduation-cap";
    color = "text-sky-600 dark:text-sky-400";
    bg = "bg-sky-50/60 dark:bg-sky-950/20";
    border = "border-sky-200/80 dark:border-sky-900/40";
    badgeBg = "bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800";
    iconBg = "bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-300";
  }
  // 5. Events & Sports Competitions
  else if (
    text.includes("fair") || text.includes("event") || text.includes("cultural") ||
    text.includes("sports") || text.includes("competition") || text.includes("celebration") ||
    text.includes("chess") || text.includes("match") || text.includes("tournament")
  ) {
    type = "Event";
    formattedTitle = (!title || title === "Personal Alert") ? "Event & Sports Update" : sanitizeUnicodeText(title);
    iconClass = "fi fi-rr-calendar-clock";
    color = "text-violet-600 dark:text-violet-400";
    bg = "bg-violet-50/60 dark:bg-violet-950/20";
    border = "border-violet-200/80 dark:border-violet-900/40";
    badgeBg = "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800";
    iconBg = "bg-violet-100 dark:bg-violet-900/60 text-violet-600 dark:text-violet-300";
  }

  return {
    type,
    formattedTitle,
    cleanBody,
    dynamicSender,
    iconClass,
    color,
    bg,
    border,
    badgeBg,
    iconBg
  };
}

export default function AnnouncementsPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const studentClass = (session?.user as any)?.class;
  const section = (session?.user as any)?.section;
  const userId = (session?.user as any)?.id;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize readIds from localStorage
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("student_read_notification_ids");
        if (stored) return new Set(JSON.parse(stored));
      } catch (e) {}
    }
    return new Set();
  });

  // Save to localStorage whenever readIds changes
  useEffect(() => {
    try {
      localStorage.setItem("student_read_notification_ids", JSON.stringify(Array.from(readIds)));
    } catch (e) {}
  }, [readIds]);
  
  // Interactive Filter & Search & Pagination States
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [studentLevelPath, setStudentLevelPath] = useState("middle-school");
  
  const router = useRouter();

  useEffect(() => {
    if (!schoolId || !studentClass || !userId) return;

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [annRes, notifRes] = await Promise.all([
          fetch(`${API_URL}/api/students/announcements?schoolId=${schoolId}&class=${studentClass}&section=${section || ''}`),
          fetch(`${API_URL}/api/notifications?userId=${userId}`)
        ]);
        
        const annResult = await annRes.json();
        const notifResult = await notifRes.json();

        let allItems: Announcement[] = [];
        
        if (annResult.success && Array.isArray(annResult.data)) {
          allItems = [...annResult.data];
        }

        if (notifResult.success && Array.isArray(notifResult.data)) {
          const mappedNotifs = notifResult.data.map((n: any) => ({
            id: n.id,
            title: n.title || "Personal Alert",
            body: n.message || "",
            target: "Personal",
            date: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "",
            sender: "System Automated",
            pinned: false,
            createdAt: n.createdAt || new Date().toISOString()
          }));
          allItems = [...allItems, ...mappedNotifs];
        }

        // Deduplicate items by body & title to avoid twin cards
        const seenKeys = new Set<string>();
        const uniqueItems: Announcement[] = [];
        for (const item of allItems) {
          const normBody = (item.body || "").trim().toLowerCase();
          const normTitle = (item.title || "").trim().toLowerCase();
          const key = `${normTitle}:::${normBody}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueItems.push(item);
          }
        }

        // Sort combined list by date descending
        uniqueItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setAnnouncements(uniqueItems);
      } catch (err) {
        console.error("Error fetching announcements/notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [schoolId, studentClass, section, userId, API_URL]);

  useEffect(() => {
    const level = localStorage.getItem("studentLevel");
    if (level === "STUDENT_MIDDLE") setStudentLevelPath("middle-school");
    else if (level === "STUDENT_HIGH") setStudentLevelPath("high-school");
    else if (level === "STUDENT_HIGHER") setStudentLevelPath("higher-secondary");
  }, []);

  // Filtered Announcements Calculation
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(ann => {
      const formatted = formatNotification(ann.sender, ann.title, ann.body, ann.target);
      const isUnread = !readIds.has(ann.id);

      if (activeFilter === "Unread" && !isUnread) return false;
      if (activeFilter !== "All" && activeFilter !== "Unread" && formatted.type !== activeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${formatted.formattedTitle} ${formatted.cleanBody} ${ann.sender} ${formatted.type}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [announcements, activeFilter, searchQuery, readIds]);

  // Reset pagination when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredAnnouncements.length / itemsPerPage));
  const paginatedAnnouncements = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAnnouncements.slice(start, start + itemsPerPage);
  }, [filteredAnnouncements, currentPage, itemsPerPage]);

  // Statistics
  const unreadCount = announcements.filter(a => !readIds.has(a.id)).length;
  const urgentCount = announcements.filter(a => formatNotification(a.sender, a.title, a.body, a.target).type === "Urgent").length;

  const markAllRead = async () => {
    const allIds = new Set(announcements.map(a => a.id));
    setReadIds(allIds);
    try {
      localStorage.setItem("student_read_notification_ids", JSON.stringify(Array.from(allIds)));
      if (userId) {
        fetch(`${API_URL}/api/notifications/read-all`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
        }).catch(() => null);
      }
    } catch (e) {}
  };

  const handleCardClick = (ann: Announcement) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(ann.id);
      try {
        localStorage.setItem("student_read_notification_ids", JSON.stringify(Array.from(next)));
      } catch (e) {}
      return next;
    });

    if (userId) {
      fetch(`${API_URL}/api/notifications/${ann.id}/read`, {
        method: "PUT"
      }).catch(() => null);
    }
    
    const text = (ann.title + " " + ann.body).toLowerCase();
    
    if (text.includes("homework") || text.includes("assignment")) {
      router.push(`/student/homework`);
    } else if (text.includes("exam") || text.includes("test") || text.includes("marks") || text.includes("grade")) {
      router.push(`/student/exams`);
    } else if (text.includes("badge") || text.includes("portfolio")) {
      router.push('/student/portfolio');
    } else if (text.includes("scholarship")) {
      router.push(`/student/scholarships`);
    } else if (text.includes("attendance") || text.includes("present")) {
      router.push(`/student/academic-history`);
    }
  };

  return (
    <PortalLayout
      title="School Announcements"
      subtitle={`School notices & personal alerts for Class ${studentClass || "..."}`}
      avatarLetter="A"
      avatarColor="#f59e0b"
      themeClass="theme-student"
      accentColor="#f59e0b"
    >
      <div className="flex flex-col gap-6 w-full text-left">
        
        {/* 🌟 Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl glass border border-[var(--border)] p-5 sm:p-6 shadow-sm transition-all w-full">
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full">
            <div className="space-y-2 w-full md:max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 font-semibold text-xs uppercase tracking-wider rounded-xl border border-amber-500/20 shadow-sm">
                <i className="fi fi-rr-bell text-xs" /> Notification Center
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-heading)] tracking-tight">
                Latest Announcements
              </h2>
              <p className="text-[var(--text-muted)] text-xs sm:text-sm font-normal leading-relaxed">
                Stay updated with circulars, exam schedules, personal achievement badges, and emergency notices.
              </p>
            </div>

            <button
              onClick={markAllRead}
              className="w-full md:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 shrink-0 border-b-2 border-black/20"
            >
              <i className="fi fi-rr-check-circle text-sm" />
              <span>Mark All as Read</span>
            </button>
          </div>

          {/* 📊 KPI Summary Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-[var(--border)]">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-[var(--border)] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-base shrink-0">
                <i className="fi fi-rr-bullhorn" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase text-[var(--text-muted)] block tracking-wider">Total Alerts</span>
                <span className="text-base font-bold text-[var(--text-heading)]">{announcements.length}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-[var(--border)] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center text-base shrink-0">
                <i className="fi fi-rr-envelope-open" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase text-[var(--text-muted)] block tracking-wider">Unread</span>
                <span className="text-base font-bold text-sky-600 dark:text-sky-400">{unreadCount}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-[var(--border)] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-base shrink-0">
                <i className="fi fi-rr-alarm-exclamation" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase text-[var(--text-muted)] block tracking-wider">Urgent</span>
                <span className="text-base font-bold text-rose-600 dark:text-rose-400">{urgentCount}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-[var(--border)] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-base shrink-0">
                <i className="fi fi-rr-check-double" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase text-[var(--text-muted)] block tracking-wider">Read</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{announcements.length - unreadCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🔍 Interactive Search Bar & Category Filter Pills */}
        <div className="flex flex-col gap-4 glass rounded-2xl p-4 sm:p-5 border border-[var(--border)] shadow-sm">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:max-w-md">
              <i className="fi fi-rr-search absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm" />
              <input
                type="text"
                placeholder="Search by keyword, title, sender..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/80 border border-[var(--border)] text-[var(--text-main)] rounded-xl py-2.5 pl-10 pr-10 text-xs font-normal focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder-[var(--text-muted)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-heading)] text-xs p-1"
                >
                  <i className="fi fi-rr-cross-small text-sm" />
                </button>
              )}
            </div>

            {/* Items Per Page Selector */}
            <div className="flex items-center gap-2 self-end md:self-auto text-xs font-medium text-[var(--text-muted)]">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[var(--text-muted)]">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-900/80 border border-[var(--border)] text-[var(--text-main)] rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {[
              { id: "All", label: "All", icon: "fi fi-rr-apps" },
              { id: "Unread", label: "Unread", icon: "fi fi-rr-envelope" },
              { id: "Personal Alert", label: "Personal", icon: "fi fi-rr-portrait" },
              { id: "Urgent", label: "Urgent", icon: "fi fi-rr-alarm-exclamation" },
              { id: "Academic", label: "Academic", icon: "fi fi-rr-graduation-cap" },
              { id: "Event", label: "Events", icon: "fi fi-rr-calendar-clock" },
              { id: "General", label: "General", icon: "fi fi-rr-bullhorn" },
            ].map((cat) => {
              const isActive = activeFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilter(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                    isActive
                      ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                      : "bg-slate-50 text-[var(--text-main)] hover:bg-amber-500/10 hover:text-amber-600 border-[var(--border)] dark:bg-slate-900/80"
                  }`}
                >
                  <i className={`${cat.icon} text-xs`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 📋 Notification Cards Feed */}
        <div className="glass rounded-2xl p-4 sm:p-6 lg:p-8 border border-[var(--border)] shadow-sm min-h-[450px] flex flex-col justify-between">
          
          {loading ? (
            <div className="text-center py-24 font-medium text-[var(--text-muted)] flex flex-col items-center justify-center gap-3">
              <i className="fi fi-rr-hourglass text-4xl animate-spin text-amber-500" />
              <span className="text-xs sm:text-sm">Loading announcements & notices...</span>
            </div>
          ) : paginatedAnnouncements.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-3 my-auto">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-2xl text-[var(--text-muted)]">
                <i className="fi fi-rr-inbox" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-heading)]">No notifications found</h3>
              <p className="text-xs text-[var(--text-muted)] font-normal max-w-xs leading-relaxed">
                {searchQuery || activeFilter !== "All"
                  ? "No notices match your selected filter or search keyword. Try clearing filters!"
                  : "You're all caught up! Check back later for new school announcements."}
              </p>
              {(searchQuery || activeFilter !== "All") && (
                <button
                  onClick={() => { setActiveFilter("All"); setSearchQuery(""); }}
                  className="mt-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-[var(--text-main)] text-xs font-semibold rounded-xl transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedAnnouncements.map((ann) => {
                const formatted = formatNotification(ann.sender, ann.title, ann.body, ann.target, studentClass);
                const isUnread = !readIds.has(ann.id);

                return (
                  <div
                    key={ann.id}
                    onClick={() => handleCardClick(ann)}
                    className={`relative p-5 sm:p-6 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${formatted.bg} ${
                      isUnread
                        ? `${formatted.border} ring-2 ring-amber-500/20`
                        : "border-[var(--border)] hover:border-amber-500/40 bg-white dark:bg-slate-900/40"
                    }`}
                  >
                    {/* Unread Glow & Pinned Badges */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      {ann.pinned && (
                        <span className="text-[9px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                          <i className="fi fi-rr-bookmark text-xs" /> Pinned
                        </span>
                      )}
                      {isUnread && (
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start gap-4 pr-0 sm:pr-12 mt-6 sm:mt-0">
                      {/* Flat Icon Container */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm border ${
                        isUnread ? `${formatted.iconBg} ${formatted.border}` : "bg-slate-100 dark:bg-slate-800 text-[var(--text-main)] border-[var(--border)]"
                      }`}>
                        <i className={formatted.iconClass} />
                      </div>

                      {/* Notification Body Info */}
                      <div className="flex-1 w-full space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] uppercase font-semibold tracking-wider px-2.5 py-0.5 rounded-md border ${formatted.badgeBg}`}>
                            {formatted.type}
                          </span>
                          <h3 className="text-base sm:text-lg font-bold text-[var(--text-heading)] leading-snug">
                            {formatted.formattedTitle}
                          </h3>
                        </div>

                        <p className="text-xs sm:text-sm font-normal text-[var(--text-main)] leading-relaxed">
                          {formatted.cleanBody}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
                          <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                            <i className="fi fi-rr-user-pen text-amber-500" />
                            <span>Posted by:</span>
                            <span className="text-[var(--text-heading)] font-semibold">{formatted.dynamicSender}</span>
                          </div>

                          <div className="flex items-center gap-1.5 font-medium">
                            <i className="fi fi-rr-calendar-clock text-[var(--text-muted)]" />
                            <span>{ann.date || new Date(ann.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 📄 Modern Responsive Pagination Bar */}
          {!loading && filteredAnnouncements.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-[var(--border)]">
              <div className="text-xs font-normal text-[var(--text-muted)] text-center sm:text-left">
                Showing <span className="text-[var(--text-heading)] font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                <span className="text-[var(--text-heading)] font-semibold">{Math.min(currentPage * itemsPerPage, filteredAnnouncements.length)}</span> of{" "}
                <span className="text-[var(--text-heading)] font-semibold">{filteredAnnouncements.length}</span> notifications
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  {/* Prev Button */}
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 disabled:opacity-40 text-[var(--text-main)] rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center disabled:cursor-not-allowed border border-[var(--border)]"
                    title="Previous Page"
                  >
                    <i className="fi fi-rr-angle-left text-sm" />
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all flex items-center justify-center border ${
                        currentPage === pageNum
                          ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800 text-[var(--text-main)] border-[var(--border)] hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 disabled:opacity-40 text-[var(--text-main)] rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center disabled:cursor-not-allowed border border-[var(--border)]"
                    title="Next Page"
                  >
                    <i className="fi fi-rr-angle-right text-sm" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </PortalLayout>
  );
}