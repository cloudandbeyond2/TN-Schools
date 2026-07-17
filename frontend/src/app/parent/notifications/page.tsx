"use client";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import { getApiBase } from "@/lib/useParentChildren";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, Calendar, BarChart2, FileText, Users, GraduationCap, Megaphone, 
  RefreshCw, RotateCcw, X, Search, ChevronDown, Check, Trash2, 
  ArrowUpDown, SlidersHorizontal, Sliders, CheckSquare, Clock, Filter, Eye, AlertCircle,
  Trophy
} from "lucide-react";

interface Child {
  studentId: string;
  name: string;
  class: string;
  section: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  studentId: string | null;
  createdAt: string;
}

interface UndoToast {
  visible: boolean;
  message: string;
  onUndo: () => void;
  onDismiss?: () => void;
}

const CATEGORIES = [
  { id: "ALL", label: "All Categories", icon: Bell, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { id: "attendance", label: "Attendance", icon: Calendar, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { id: "marks", label: "Academics", icon: BarChart2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { id: "homework", label: "Homework", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "pta", label: "PTA Meetings", icon: Users, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { id: "scholarship", label: "Welfare", icon: GraduationCap, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { id: "sports", label: "Sports & Games", icon: Trophy, color: "text-amber-600", bg: "bg-amber-600/10", border: "border-amber-600/20" },
  { id: "general", label: "Announcements", icon: Megaphone, color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20" }
];

// Helper to highlight matching text search
const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 px-0.5 rounded font-bold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

export default function NotificationsPage() {
  const { data: session } = useSession();
  const parentId = (session?.user as any)?.id as string | undefined;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [children, setChildren]           = useState<Child[]>([]);
  const [loading, setLoading]             = useState(true);
  const [markingAll, setMarkingAll]       = useState(false);
  const [refreshing, setRefreshing]       = useState(false);

  // Filter & Search States
  const [selectedChildId, setSelectedChildId] = useState<string>("ALL");
  const [filterCategory, setFilterCategory]   = useState<string>("ALL");
  const [filterStatus, setFilterStatus]       = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [dateFilter, setDateFilter]           = useState<"ALL" | "TODAY" | "WEEK" | "MONTH">("ALL");
  const [searchQuery, setSearchQuery]         = useState<string>("");
  const [sortOrder, setSortOrder]             = useState<"NEWEST" | "OLDEST">("NEWEST");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // default to 6 for a balanced grid row rendering

  // Undo Toast state
  const [toast, setToast] = useState<UndoToast | null>(null);

  // Active Notification Detail Modal
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);

  // Keep references to active delete timeouts
  const deleteTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // Clean up delete timeouts on unmount
  useEffect(() => {
    return () => {
      Object.keys(deleteTimeouts.current).forEach(id => {
        clearTimeout(deleteTimeouts.current[id]);
        if (parentId) {
          fetch(`${getApiBase()}/api/parent/${parentId}/notifications/${id}`, { method: "DELETE" }).catch(() => {});
        }
      });
    };
  }, [parentId]);

  // ── Fetch children list ─────────────────────────────────────────
  const fetchChildren = useCallback(async () => {
    if (!parentId) return;
    try {
      const res = await fetch(`${getApiBase()}/api/parent/${parentId}/children`);
      const json = await res.json();
      if (json.success) setChildren(json.data);
    } catch {/* offline */}
  }, [parentId]);

  // ── Fetch notifications ──────────────────────────────────────────
  const fetchNotifications = useCallback(async (isSilent = false) => {
    if (!parentId) return;
    if (!isSilent) setLoading(true);
    try {
      const res  = await fetch(`${getApiBase()}/api/parent/${parentId}/notifications`);
      const json = await res.json();
      if (json.success) {
        // Exclude notifications that are in active delete timeouts
        const activeDeletes = Object.keys(deleteTimeouts.current);
        const filteredData = json.data.filter((n: Notification) => !activeDeletes.includes(n.id));
        setNotifications(filteredData);
        
        // Calculate unread count excluding the ones deleted locally
        const unreadFiltered = filteredData.filter((n: Notification) => !n.isRead).length;
        setUnreadCount(unreadFiltered);
      }
    } catch {/* offline */}
    finally { if (!isSilent) setLoading(false); }
  }, [parentId]);

  useEffect(() => {
    fetchChildren();
    fetchNotifications();
  }, [fetchChildren, fetchNotifications]);

  // Dynamic refresh action
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchChildren(), fetchNotifications(true)]);
    setRefreshing(false);
  };

  // Mark single alert as read with Undo support
  const markAsRead = async (id: string) => {
    if (!parentId) return;
    const notif = notifications.find(n => n.id === id);
    if (!notif || notif.isRead) return;

    try {
      await fetch(`${getApiBase()}/api/parent/${parentId}/notifications/${id}/read`, { method: "PUT" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Trigger Undo Toast
      setToast({
        visible: true,
        message: "Notification marked as read.",
        onUndo: async () => {
          try {
            await fetch(`${getApiBase()}/api/parent/${parentId}/notifications/${id}/unread`, { method: "PUT" });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
            setUnreadCount(prev => prev + 1);
          } catch (err) {
            console.error("Failed to undo read status:", err);
          }
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Mark single alert as unread (toggle from modal) with Undo support
  const markAsUnread = async (id: string) => {
    if (!parentId) return;
    const notif = notifications.find(n => n.id === id);
    if (!notif || !notif.isRead) return;

    try {
      await fetch(`${getApiBase()}/api/parent/${parentId}/notifications/${id}/unread`, { method: "PUT" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
      setUnreadCount(prev => prev + 1);

      // Trigger Undo Toast
      setToast({
        visible: true,
        message: "Notification marked as unread.",
        onUndo: async () => {
          try {
            await fetch(`${getApiBase()}/api/parent/${parentId}/notifications/${id}/read`, { method: "PUT" });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
          } catch (err) {
            console.error("Failed to undo unread status:", err);
          }
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all unread notifications as read with Undo support
  const markAllRead = async () => {
    if (!parentId || unreadCount === 0) return;
    setMarkingAll(true);
    
    // Track which ones are currently unread so we can undo them specifically
    const previousUnreadIds = notifications.filter(n => !n.isRead).map(n => n.id);

    try {
      await fetch(`${getApiBase()}/api/parent/${parentId}/notifications/read-all`, { method: "PUT" });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);

      // Trigger Undo Toast
      setToast({
        visible: true,
        message: `${previousUnreadIds.length} notifications marked as read.`,
        onUndo: async () => {
          try {
            await fetch(`${getApiBase()}/api/parent/${parentId}/notifications/unread-all`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ids: previousUnreadIds })
            });
            setNotifications(prev => prev.map(n => previousUnreadIds.includes(n.id) ? { ...n, isRead: false } : n));
            setUnreadCount(previousUnreadIds.length);
          } catch (err) {
            console.error("Failed to undo mark all read:", err);
          }
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingAll(false);
    }
  };

  // Dismiss / Lazy delete notification
  const dismissNotification = (id: string) => {
    if (!parentId) return;
    const notificationToDismiss = notifications.find(n => n.id === id);
    if (!notificationToDismiss) return;

    // Optimistically remove from state
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (!notificationToDismiss.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    if (activeNotification?.id === id) {
      setActiveNotification(null);
    }

    // Set delete timeout
    const timeoutId = setTimeout(async () => {
      try {
        await fetch(`${getApiBase()}/api/parent/${parentId}/notifications/${id}`, { method: "DELETE" });
        delete deleteTimeouts.current[id];
      } catch (err) {
        console.error("Failed to delete notification in database:", err);
      }
    }, 5000);

    deleteTimeouts.current[id] = timeoutId;

    // Show Toast
    setToast({
      visible: true,
      message: "Notification dismissed.",
      onUndo: () => {
        // Revert local changes
        setNotifications(prev => {
          const updated = [...prev, notificationToDismiss];
          return updated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        });
        if (!notificationToDismiss.isRead) {
          setUnreadCount(prev => prev + 1);
        }
        clearTimeout(deleteTimeouts.current[id]);
        delete deleteTimeouts.current[id];
      },
      onDismiss: () => {
        clearTimeout(deleteTimeouts.current[id]);
        delete deleteTimeouts.current[id];
        fetch(`${getApiBase()}/api/parent/${parentId}/notifications/${id}`, { method: "DELETE" }).catch(() => {});
      }
    });
  };

  // Clear filters with Undo support
  const handleClearAllFilters = () => {
    const prevFilters = {
      selectedChildId,
      filterCategory,
      filterStatus,
      dateFilter,
      searchQuery,
      sortOrder
    };

    // Reset filters
    setSelectedChildId("ALL");
    setFilterCategory("ALL");
    setFilterStatus("ALL");
    setDateFilter("ALL");
    setSearchQuery("");
    setSortOrder("NEWEST");
  };

  // Check if any filter is active
  const isFiltersActive = useMemo(() => {
    return selectedChildId !== "ALL" || 
      filterCategory !== "ALL" || 
      filterStatus !== "ALL" || 
      dateFilter !== "ALL" || 
      searchQuery !== "" || 
      sortOrder !== "NEWEST";
  }, [selectedChildId, filterCategory, filterStatus, dateFilter, searchQuery, sortOrder]);

  // Auto-dismiss toast timer
  useEffect(() => {
    if (toast && toast.visible) {
      const timer = setTimeout(() => {
        if (toast.onDismiss) toast.onDismiss();
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Resolve matching notification categories case-insensitively
  const matchNotifType = useCallback((type: string, filterVal: string): boolean => {
    const t = type.toUpperCase();
    const f = filterVal.toUpperCase();
    if (f === "MARKS" || f === "ACADEMICS") {
      return t.includes("MARK") || t.includes("ACADEMIC");
    }
    if (f === "WELFARE" || f === "SCHOLARSHIP") {
      return t.includes("SCHOLARSHIP") || t.includes("WELFARE") || t.includes("BENEFIT");
    }
    if (f === "HOMEWORK") return t.includes("HOMEWORK");
    if (f === "PTA") return t.includes("PTA");
    if (f === "ATTENDANCE") return t.includes("ATTENDANCE");
    if (f === "SPORTS") return t.includes("SPORT");
    return t === f;
  }, []);

  // Map category code to metadata
  const notifMeta = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes("ATTENDANCE")) {
      return { icon: Calendar, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Attendance" };
    }
    if (t.includes("MARK") || t.includes("ACADEMIC")) {
      return { icon: BarChart2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Academics" };
    }
    if (t.includes("HOMEWORK")) {
      return { icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Homework" };
    }
    if (t.includes("PTA")) {
      return { icon: Users, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", label: "PTA Meeting" };
    }
    if (t.includes("SCHOLARSHIP") || t.includes("WELFARE") || t.includes("BENEFIT")) {
      return { icon: GraduationCap, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", label: "Welfare" };
    }
    if (t.includes("SPORT")) {
      return { icon: Trophy, color: "text-amber-600", bg: "bg-amber-600/10", border: "border-amber-600/20", label: "Sports" };
    }
    return { icon: Megaphone, color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20", label: "Announcement" };
  };

  // Date boundary check helpers
  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  };

  const isWithinDays = (dateStr: string, days: number) => {
    const d = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diffDays = (now - d) / (1000 * 60 * 60 * 24);
    return diffDays <= days;
  };

  // ── Filtered & Sorted notifications list ────────────────────────
  const filteredNotifications = useMemo(() => {
    let result = notifications.filter(n => {
      // 1. Filter by specific child
      const matchesChild = selectedChildId === "ALL" || !n.studentId || n.studentId === selectedChildId;
      
      // 2. Filter by category type
      const matchesCategory = filterCategory === "ALL" || matchNotifType(n.type, filterCategory);

      // 3. Filter by read/unread status
      const matchesStatus = filterStatus === "ALL" || (filterStatus === "UNREAD" ? !n.isRead : n.isRead);

      // 4. Filter by Date range
      const matchesDate = 
        dateFilter === "ALL" ||
        (dateFilter === "TODAY" && isToday(n.createdAt)) ||
        (dateFilter === "WEEK" && isWithinDays(n.createdAt, 7)) ||
        (dateFilter === "MONTH" && isWithinDays(n.createdAt, 30));

      // 5. Search query matching title or message content
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        n.title.toLowerCase().includes(query) || 
        n.message.toLowerCase().includes(query);

      return matchesChild && matchesCategory && matchesStatus && matchesDate && matchesSearch;
    });

    // Sort order
    return result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === "NEWEST" ? timeB - timeA : timeA - timeB;
    });
  }, [notifications, selectedChildId, filterCategory, filterStatus, dateFilter, searchQuery, sortOrder, matchNotifType]);

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedChildId, filterCategory, filterStatus, dateFilter, searchQuery, sortOrder]);

  // Paginated chunk
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(start, start + itemsPerPage);
  }, [filteredNotifications, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  // Friendly date helper
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <PortalLayout>
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-50/50 via-teal-50/20 to-indigo-50/20 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950 -z-10 pointer-events-none transition-colors duration-500" />

      {/* Main Container expanded to match other portal modules */}
      <div className="w-full py-2 space-y-6 md:space-y-8">
        
        {/* ── Stats Overview Row ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* KPI: Total Alerts */}
          <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-2xl flex items-center gap-5 shadow-sm transition-all hover:shadow-md">
            <span className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Bell className="w-5.5 h-5.5" />
            </span>
            <div className="ml-1">
              <div className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider">Total Alerts</div>
              <div className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{notifications.length}</div>
            </div>
          </div>

          {/* KPI: Unread Alerts */}
          <button
            onClick={() => { setFilterStatus("UNREAD"); setFilterCategory("ALL"); }}
            className={`p-6 rounded-2xl border flex items-center gap-5 text-left transition-all ${
              filterStatus === "UNREAD"
                ? "bg-amber-500/5 dark:bg-amber-500/5 border-amber-500/40 ring-1 ring-amber-500/20"
                : "bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border-slate-200/60 dark:border-slate-800/80 hover:border-slate-355 dark:hover:border-slate-700"
            }`}
          >
            <span className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            </span>
            <div className="ml-1">
              <div className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider">Unread Messages</div>
              <div className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{unreadCount}</div>
            </div>
          </button>

          {/* KPI: Quick Actions */}
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0 || markingAll}
            className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/80 hover:border-emerald-500/30 p-6 rounded-2xl flex items-center gap-5 shadow-sm transition-all disabled:opacity-50 group text-left w-full"
          >
            <span className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Check className="w-5.5 h-5.5" />
            </span>
            <div className="ml-1">
              <div className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider">Quick Actions</div>
              <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                {markingAll ? "Marking..." : unreadCount > 0 ? "Mark All As Read" : "All Messages Read ✓"}
              </div>
            </div>
          </button>

          {/* KPI: Sync Control */}
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/80 hover:border-blue-500/30 p-6 rounded-2xl flex items-center gap-5 shadow-sm transition-all disabled:opacity-50 group text-left w-full"
          >
            <span className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:rotate-180 transition-transform duration-500">
              <RefreshCw className={`w-5.5 h-5.5 ${refreshing ? "animate-spin" : ""}`} />
            </span>
            <div className="ml-1">
              <div className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 tracking-wider">Sync Control</div>
              <div className="text-sm font-black text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                {refreshing ? "Syncing..." : "Sync Live Data ⟳"}
              </div>
            </div>
          </button>
        </div>

        {/* ── Advanced Filters Card & Search Panel ────────────────── */}
        <div className="bg-white/75 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-sm backdrop-blur-md">
          <div className="flex flex-col xl:flex-row gap-6 justify-between items-stretch xl:items-center">
            {/* Search bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notifications by title or keywords..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-3 text-xs text-slate-700 dark:text-slate-350 outline-none placeholder:text-slate-455 focus:border-emerald-500 dark:focus:border-emerald-500/80 focus:bg-white dark:focus:bg-slate-950 transition-all font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtering Dropdowns & Sorting Row */}
            <div className="flex flex-wrap gap-4 items-center w-full xl:w-auto justify-start sm:justify-end">


              {/* Date Range Selector Dropdown */}
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value as any)}
                  className="bg-slate-50/70 dark:bg-slate-955/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 pl-3 pr-8 py-3 rounded-xl text-xs outline-none cursor-pointer focus:border-emerald-500 transition-all font-bold w-full sm:w-36 appearance-none"
                >
                  <option value="ALL">All Time</option>
                  <option value="TODAY">Today</option>
                  <option value="WEEK">Last 7 Days</option>
                  <option value="MONTH">Last 30 Days</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Status Select Buttons */}
              <div className="bg-slate-100/80 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800/80 flex gap-0.5 w-full sm:w-auto justify-around">
                {(["ALL", "UNREAD", "READ"] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-2.5 rounded-lg text-[10px] font-extrabold capitalize transition-all ${
                      filterStatus === status
                        ? "bg-white dark:bg-slate-900 text-emerald-605 dark:text-emerald-400 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    {status === "ALL" ? "All" : status.toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Sort Toggle Button */}
              <button
                onClick={() => setSortOrder(p => p === "NEWEST" ? "OLDEST" : "NEWEST")}
                className="px-3.5 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/70 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-350 hover:border-slate-350 dark:hover:border-slate-700 transition-all flex items-center gap-2 shrink-0 font-bold"
                title="Toggle Sort Order"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">{sortOrder === "NEWEST" ? "Newest First" : "Oldest First"}</span>
              </button>

              {/* Clear All Filters Button */}
              {isFiltersActive && (
                <button
                  onClick={handleClearAllFilters}
                  className="px-3.5 py-3 border border-amber-500/20 hover:border-amber-500/40 rounded-xl bg-amber-500/10 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all flex items-center gap-1.5 shrink-0 font-black animate-pulse"
                  title="Clear All Filters"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Categories Strip with more spacing */}
          <div className="flex gap-3.5 mt-8 overflow-x-auto whitespace-nowrap scroll-smooth pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {CATEGORIES.map(cat => {
              const count = cat.id === "ALL"
                ? notifications.length
                : notifications.filter(n => matchNotifType(n.type, cat.id)).length;
              
              if (cat.id !== "ALL" && count === 0) return null;

              const isSelected = filterCategory === cat.id;
              const IconComponent = cat.icon;

              return (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`text-[10px] px-5 py-3 rounded-xl font-bold border transition-all flex items-center gap-2.5 shrink-0 ${
                    isSelected
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 shadow-sm scale-105"
                      : "bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700"
                  }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-500" : "text-slate-400"}`} />
                  <span>{cat.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold transition-colors ${
                    isSelected ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Page Size Selector Row ── */}
        <div className="flex items-center justify-between text-xs text-slate-550 dark:text-slate-400 px-1 font-bold">
          <span>Showing {filteredNotifications.length} matching alerts</span>
          <div className="flex items-center gap-2">
            <span>Show:</span>
            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 pl-2 pr-6 cursor-pointer outline-none focus:border-emerald-500 appearance-none font-bold text-xs"
              >
                <option value={6}>6 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
              </select>
              <ChevronDown className="w-2.5 h-2.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── Notifications Results Grid (Spacious 3-column layout) ───────────────────────────── */}
        <div className="relative min-h-[300px]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-44 bg-slate-100 dark:bg-slate-900/60 rounded-2xl animate-pulse border border-slate-200/20 dark:border-slate-800/40" />
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-20 text-center shadow-sm backdrop-blur-md flex flex-col items-center justify-center">
              <Bell className="w-12 h-12 text-slate-300 dark:text-slate-750 mb-4 animate-bounce" />
              <h3 className="text-slate-855 dark:text-white font-black text-base mb-1">No Notifications Found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                We couldn&apos;t find any alerts matching your search criteria. Try modifying your filters or keywords.
              </p>
              {isFiltersActive && (
                <button
                  onClick={handleClearAllFilters}
                  className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                >
                  Clear Active Filters
                </button>
              )}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {paginatedNotifications.map(n => {
                  const meta = notifMeta(n.type);
                  const IconComp = meta.icon;
                  const child = children.find(c => c.studentId === n.studentId);
                  const childName = child?.name.split(" ")[0];

                  return (
                    <motion.div
                      key={n.id}
                      layoutId={`card-${n.id}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden group shadow-sm bg-white/70 dark:bg-slate-900/40 backdrop-blur-sm ${
                        !n.isRead 
                          ? "border-emerald-500/20 dark:border-emerald-500/20 ring-1 ring-emerald-500/5 dark:ring-emerald-500/10 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:shadow-md hover:-translate-y-0.5" 
                          : "border-slate-200 dark:border-slate-800/60 opacity-85 hover:opacity-100 hover:border-slate-350 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5"
                      }`}
                      onClick={() => setActiveNotification(n)}
                    >
                      {/* Visual Unread Left Banner */}
                      {!n.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                      )}

                      {/* Header Row */}
                      <div className="flex items-center justify-between gap-4 mb-5">
                        <div className="flex items-center gap-3">
                          <span className={`w-10 h-10 rounded-xl ${meta.bg} border ${meta.border} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                            <IconComp className={`w-4.5 h-4.5 ${meta.color}`} />
                          </span>
                          <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full border ${meta.bg} ${meta.border} ${meta.color}`}>
                            {meta.label}
                          </span>
                        </div>
                        
                        {/* Date & Child Tag */}
                        <div className="flex items-center gap-3 shrink-0">
                          {childName && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              Child: {childName}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {formatTime(n.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="mb-5">
                        <h4 className={`text-sm font-black leading-snug truncate mb-2 ${!n.isRead ? "text-slate-800 dark:text-white" : "text-slate-600 dark:text-slate-350"}`}>
                          <HighlightText text={n.title} highlight={searchQuery} />
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal line-clamp-2">
                          <HighlightText text={n.message} highlight={searchQuery} />
                        </p>
                      </div>

                      {/* Actions Footer */}
                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-auto">
                        <div>
                          {!n.isRead ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                              className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5" /> Mark read
                            </button>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); markAsUnread(n.id); }}
                              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-2"
                            >
                              <CheckSquare className="w-3.5 h-3.5" /> Mark unread
                            </button>
                          )}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }}
                          className="p-1.5 px-2.5 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 border border-rose-500/10 hover:border-rose-500/30 transition-all flex items-center gap-2 text-[10px] font-extrabold"
                          title="Dismiss notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Dismiss</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </div>

        {/* ── Responsive Pagination Panel ──────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 text-xs gap-3">
            <span className="text-slate-500 dark:text-slate-400 font-bold">
              Showing Page {currentPage} of {totalPages} ({filteredNotifications.length} items)
            </span>
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 font-bold hover:border-slate-350 dark:hover:border-slate-700 transition-all flex items-center gap-1"
              >
                <span>Prev</span>
              </button>
              
              {/* Page indicators */}
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`w-8 h-8 rounded-xl text-[10px] font-extrabold transition-all border ${
                      currentPage === num
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 font-bold hover:border-slate-350 dark:hover:border-slate-700 transition-all flex items-center gap-1"
              >
                <span>Next</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Toast Undo Notification Center ──────────────────────────── */}
      <AnimatePresence>
        {toast && toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              width: "380px",
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "16px",
              padding: "16px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              zIndex: 9999,
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Icon */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#34d399", flexShrink: 0
              }}>
                <RotateCcw style={{ width: "16px", height: "16px", animation: "spin 3s linear infinite" }} />
              </span>
              {/* Text */}
              <div>
                <div style={{ color: "#ffffff", fontWeight: 700, fontSize: "13px", lineHeight: "1.4" }}>
                  {toast.message}
                </div>
                <div style={{ color: "#94a3b8", fontSize: "10px", marginTop: "2px" }}>
                  You can undo this action within 5s
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              <button
                onClick={() => { toast.onUndo(); setToast(null); }}
                style={{
                  padding: "6px 14px",
                  background: "#10b981",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "11px",
                  fontWeight: 800,
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Undo
              </button>
              <button
                onClick={() => { if (toast.onDismiss) toast.onDismiss(); setToast(null); }}
                style={{
                  padding: "6px",
                  background: "transparent",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  borderRadius: "8px",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
                title="Dismiss"
              >
                <X style={{ width: "14px", height: "14px" }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Slide-Over / Modal Notification Detail Drawer ────────────── */}
      <AnimatePresence>
        {activeNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveNotification(null)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 shadow-2xl z-10 overflow-hidden"
            >
              {/* Colored Category background accent */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${notifMeta(activeNotification.type).bg}`} />

              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full border ${notifMeta(activeNotification.type).bg} ${notifMeta(activeNotification.type).border} ${notifMeta(activeNotification.type).color}`}>
                  {notifMeta(activeNotification.type).label}
                </span>
                <button
                  onClick={() => setActiveNotification(null)}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-450 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Metadata */}
              <h3 className="text-lg font-black text-slate-800 dark:text-white leading-snug mb-3">
                {activeNotification.title}
              </h3>

              <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-5 mb-5">
                {children.find(c => c.studentId === activeNotification.studentId) && (
                  <span className="font-extrabold px-2 py-0.5 bg-slate-150 dark:bg-slate-850 rounded-md text-slate-655 dark:text-slate-400">
                    Child: {children.find(c => c.studentId === activeNotification.studentId)?.name}
                  </span>
                )}
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTime(activeNotification.createdAt)}
                </span>
              </div>

              {/* Detailed Message Content */}
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto mb-6">
                {activeNotification.message}
              </div>

              {/* Bottom Actions Panel */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex gap-2">
                  {!activeNotification.isRead ? (
                    <button
                      onClick={() => {
                        markAsRead(activeNotification.id);
                        setActiveNotification(null);
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/25 flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Read</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        markAsUnread(activeNotification.id);
                        setActiveNotification(null);
                      }}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-750 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Mark Unread</span>
                    </button>
                  )}

                  <button
                    onClick={() => dismissNotification(activeNotification.id)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-rose-500/10"
                    style={{ color: "#ffffff" }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Dismiss Alert</span>
                  </button>
                </div>

                <button
                  onClick={() => setActiveNotification(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PortalLayout>
  );
}
