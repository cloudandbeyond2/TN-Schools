"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useParentChildren, getApiBase, Child } from "@/lib/useParentChildren";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, CheckCircle, Clock, AlertTriangle, MessageSquare, 
  Calendar, ChevronLeft, ChevronRight, Search, Filter, 
  TrendingUp, Award, Info, X, SlidersHorizontal
} from "lucide-react";

interface HomeworkItem {
  id: string;
  title: string;
  className: string;
  dueDate: string;
  status: string;
  description: string;
  subject: string;
  submissionStatus: string; // 'submitted' | 'pending'
  score: string;
  submittedDate: string;
  feedback?: string | null;
}

interface HomeworkStats {
  submitted: number;
  pending: number;
  missed: number;
  total: number;
  rate: number;
}

function ChildSwitcher({ childList, active, onChange }: { childList: Child[]; active: Child | null; onChange: (c: Child) => void }) {
  if (childList.length <= 1) return null;
  return (
    <div className="flex items-center gap-3 mb-6 p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex-wrap backdrop-blur-md">
      <span className="text-xs text-slate-455 font-semibold flex items-center gap-1.5 px-2">
        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
        Selecting Child:
      </span>
      {childList.map(c => (
        <button 
          key={c.studentId} 
          onClick={() => onChange(c)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 active:scale-[0.97] ${
            active?.studentId === c.studentId 
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/20" 
              : "bg-slate-800/70 text-slate-300 border border-slate-700/40 hover:bg-slate-750 hover:text-white md:hover:border-slate-600"
          }`}
        >
          {c.name.split(" ")[0]} · Class {c.class}{c.section}
        </button>
      ))}
    </div>
  );
}

export default function HomeworkPage() {
  const { parentId, children, activeChild, setActiveChild, childrenLoading } = useParentChildren();

  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [loading, setLoading]   = useState(false);

  // Filters & Controls
  const [filterType, setFilterType] = useState<"all" | "pending" | "submitted" | "missed" | "comments">("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"due-asc" | "due-desc" | "title-asc">("due-asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  const isOverdue = useCallback((dueDateStr: string): boolean => {
    if (!dueDateStr || dueDateStr === "—") return false;
    try {
      const dueDate = new Date(dueDateStr);
      if (isNaN(dueDate.getTime())) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    } catch {
      return false;
    }
  }, []);

  const getDaysDifference = useCallback((dueDateStr: string): string => {
    if (!dueDateStr || dueDateStr === "—") return "";
    try {
      const dueDate = new Date(dueDateStr);
      if (isNaN(dueDate.getTime())) return "";
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Due today";
      if (diffDays === 1) return "Due tomorrow";
      if (diffDays === -1) return "Overdue by 1 day";
      if (diffDays < -1) return `Overdue by ${Math.abs(diffDays)} days`;
      return `Due in ${diffDays} days`;
    } catch {
      return "";
    }
  }, []);

  const fetchHomework = useCallback(async (child: Child) => {
    if (!parentId) return;
    setLoading(true);
    try {
      const res  = await fetch(`${getApiBase()}/api/parent/${parentId}/child/${child.studentId}/homework`);
      const json = await res.json();
      if (json.success && json.data?.homework) {
        setHomework(json.data.homework);
      } else {
        setHomework([]);
      }
    } catch {
      setHomework([]);
    } finally { 
      setLoading(false); 
    }
  }, [parentId]);

  useEffect(() => { 
    if (activeChild) {
      fetchHomework(activeChild);
      setCurrentPage(1);
    } 
  }, [activeChild, fetchHomework]);

  // Derived classification and statistics
  const classifiedHomework = useMemo(() => {
    return homework.map(item => {
      let calcStatus = item.submissionStatus; // 'submitted'
      const isPast = isOverdue(item.dueDate);
      
      if (item.submissionStatus === "pending") {
        if (isPast) {
          calcStatus = "missed";
        } else {
          calcStatus = "pending";
        }
      }
      return {
        ...item,
        computedStatus: calcStatus
      };
    });
  }, [homework, isOverdue]);

  const stats: HomeworkStats = useMemo(() => {
    const total = classifiedHomework.length;
    const submitted = classifiedHomework.filter(h => h.computedStatus === "submitted").length;
    const pending = classifiedHomework.filter(h => h.computedStatus === "pending").length;
    const missed = classifiedHomework.filter(h => h.computedStatus === "missed").length;
    const rate = total > 0 ? Math.round((submitted / total) * 100) : 0;
    return { total, submitted, pending, missed, rate };
  }, [classifiedHomework]);

  const averageGradePercent = useMemo(() => {
    const gradedList = homework.filter(h => h.submissionStatus === "submitted" && h.score !== "—");
    let sum = 0;
    let count = 0;
    gradedList.forEach(h => {
      const match = h.score.match(/(\d+)\s*\/\s*(\d+)/);
      if (match) {
        const obtained = parseFloat(match[1]);
        const total = parseFloat(match[2]);
        if (total > 0) {
          sum += (obtained / total) * 100;
          count++;
        }
      }
    });
    return count > 0 ? Math.round(sum / count) : null;
  }, [homework]);

  // Dynamic Subjects List for filter
  const subjects = useMemo(() => {
    const subs = new Set(homework.map(h => h.subject || "General"));
    return Array.from(subs).sort();
  }, [homework]);

  // Filter, Search and Sort Logic
  const filteredAndSorted = useMemo(() => {
    let result = classifiedHomework;

    // Status Filter
    if (filterType !== "all") {
      if (filterType === "comments") {
        result = result.filter(h => h.feedback && h.feedback.trim() !== "");
      } else {
        result = result.filter(h => h.computedStatus === filterType);
      }
    }

    // Subject Filter
    if (subjectFilter !== "all") {
      result = result.filter(h => (h.subject || "General").toLowerCase() === subjectFilter.toLowerCase());
    }

    // Search query filter
    if (searchQuery && searchQuery.trim() !== "") {
      const term = searchQuery.toLowerCase();
      result = result.filter(h => 
        h.title.toLowerCase().includes(term) || 
        h.description.toLowerCase().includes(term) ||
        (h.subject || "").toLowerCase().includes(term)
      );
    }

    // Sort Logic
    result = [...result].sort((a, b) => {
      if (sortBy === "due-asc") {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === "due-desc") {
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    return result;
  }, [classifiedHomework, filterType, subjectFilter, searchQuery, sortBy]);

  // Paginated homework items
  const paginatedHomework = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSorted.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSorted, currentPage]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Smooth scroll back to list controls on page change
      const element = document.getElementById("list-filters-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1); // Reset to page 1 on new search
  };

  const handleStatusChange = (status: typeof filterType) => {
    setFilterType(status);
    setCurrentPage(1);
  };

  const handleSubjectChange = (subject: string) => {
    setSubjectFilter(subject);
    setCurrentPage(1);
  };

  return (
    <PortalLayout>
      {/* Child Selector */}
      <ChildSwitcher childList={children} active={activeChild} onChange={setActiveChild} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { 
            label: "Total Assigned", 
            value: stats.total, 
            icon: BookOpen, 
            color: "text-indigo-400", 
            bgColor: "bg-indigo-500/10",
            borderColor: "border-indigo-500/20"
          },
          { 
            label: "Submitted", 
            value: stats.submitted, 
            icon: CheckCircle, 
            color: "text-emerald-400", 
            bgColor: "bg-emerald-500/10",
            borderColor: "border-emerald-500/20"
          },
          { 
            label: "Pending", 
            value: stats.pending, 
            icon: Clock, 
            color: "text-amber-400", 
            bgColor: "bg-amber-500/10",
            borderColor: "border-amber-500/20"
          },
          { 
            label: "Missed / Overdue", 
            value: stats.missed, 
            icon: AlertTriangle, 
            color: "text-rose-400", 
            bgColor: "bg-rose-500/10",
            borderColor: "border-rose-500/20"
          },
        ].map(k => (
          <div 
            key={k.label} 
            className={`p-5 rounded-2xl bg-slate-900/60 border ${k.borderColor} backdrop-blur-md flex items-center justify-between transition-all duration-350 active:scale-[0.98] md:hover:scale-[1.02] md:hover:bg-slate-900/80 md:hover:border-slate-700/60`}
          >
            <div>
              <div className="text-xs text-slate-400 font-semibold mb-1">{k.label}</div>
              {loading || childrenLoading ? (
                <div className="h-8 w-12 bg-slate-800 rounded animate-pulse my-1" />
              ) : (
                <div className={`text-2xl font-black ${k.color}`}>{k.value}</div>
              )}
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${k.bgColor}`}>
              <k.icon className={`w-6 h-6 ${k.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Submission Performance & Grades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Progress Bar 1: Submission Rate */}
        <div className="bg-slate-900/60 border border-slate-800/40 p-5 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-slate-200">Overall Submission Rate</span>
            </div>
            <span className={`text-xs font-extrabold px-2 py-0.5 rounded-lg ${
              stats.rate >= 80 ? "text-emerald-400 bg-emerald-500/10" : stats.rate >= 60 ? "text-amber-400 bg-amber-500/10" : "text-rose-400 bg-rose-500/10"
            }`}>
              {stats.rate}%
            </span>
          </div>
          <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stats.rate}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                background: stats.rate >= 80 
                  ? "linear-gradient(90deg, #10b981, #059669)" 
                  : stats.rate >= 60 
                  ? "linear-gradient(90deg, #f59e0b, #d97706)" 
                  : "linear-gradient(90deg, #f43f5e, #e11d48)",
              }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-medium">Calculated across all assignments posted this semester.</div>
        </div>

        {/* Progress Bar 2: Performance Grade */}
        <div className="bg-slate-900/60 border border-slate-800/40 p-5 rounded-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-bold text-slate-200">Average Performance Score</span>
            </div>
            <span className={`text-xs font-extrabold px-2 py-0.5 rounded-lg ${
              averageGradePercent && averageGradePercent >= 80 
                ? "text-teal-400 bg-teal-500/10" 
                : averageGradePercent && averageGradePercent >= 60 
                ? "text-amber-400 bg-amber-500/10" 
                : "text-rose-400 bg-rose-500/10"
            }`}>
              {averageGradePercent !== null ? `${averageGradePercent}%` : "No Grades"}
            </span>
          </div>
          <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${averageGradePercent || 0}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                background: averageGradePercent && averageGradePercent >= 80 
                  ? "linear-gradient(90deg, #14b8a6, #0d9488)" 
                  : averageGradePercent && averageGradePercent >= 60 
                  ? "linear-gradient(90deg, #f59e0b, #d97706)" 
                  : "linear-gradient(90deg, #f43f5e, #e11d48)",
              }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-2 font-medium">Derived from graded submissions.</div>
        </div>
      </div>

      {/* Main Filter & List Container */}
      <div id="list-filters-section" className="bg-slate-900/60 border border-slate-850 rounded-3xl p-6 backdrop-blur-md mb-8">
        
        {/* Filters and Controls header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                Homework Syllabus & Tasks
              </h2>
              <p className="text-xs text-slate-400 mt-1">Search, filter and verify your child's homework deliverables.</p>
            </div>
            
            {/* Sorting controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Sort By:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-955 border border-slate-805 text-slate-350 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-emerald-600 transition-all cursor-pointer"
              >
                <option value="due-asc">Due Date: Nearest First</option>
                <option value="due-desc">Due Date: Furthest First</option>
                <option value="title-asc">Alphabetical: A-Z</option>
              </select>
            </div>
          </div>

          {/* Search and Dropdowns Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Search Bar */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search homework by title, keywords or details..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-550 outline-none focus:border-emerald-500/50 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Subject Dropdown Filter */}
            <div className="relative">
              <select
                value={subjectFilter}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-950/60 border border-slate-800 text-xs text-slate-300 font-bold rounded-xl outline-none focus:border-emerald-500/50 appearance-none transition-all cursor-pointer"
              >
                <option value="all">All Subjects</option>
                {subjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-400 pointer-events-none" />
            </div>

          </div>

          {/* Status filter tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800/80 overflow-x-auto scrollbar-none gap-2 pb-1 pt-2">
            {[
              { id: "all", label: "All Tasks", count: stats.total },
              { id: "pending", label: "Pending", count: stats.pending },
              { id: "submitted", label: "Submitted", count: stats.submitted },
              { id: "missed", label: "Missed", count: stats.missed },
              { id: "comments", label: "Teacher Comments", count: classifiedHomework.filter(h => h.feedback).length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleStatusChange(tab.id as any)}
                className={`relative px-4 py-2.5 text-xs font-black whitespace-nowrap transition-all duration-300 border-b-2 active:scale-95 ${
                  filterType === tab.id 
                    ? "text-emerald-600 dark:text-emerald-450 border-emerald-500" 
                    : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-800"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${
                    filterType === tab.id 
                      ? "bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400" 
                      : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-450"
                  }`}>
                    {tab.count}
                  </span>
                </div>
              </button>
            ))}
          </div>

        </div>

        {/* Homework List Container */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-950/40 border border-slate-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/20 border border-slate-900/50 rounded-2xl">
            <Info className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-350">No Assignments Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">There are no homework entries matching the current selection criteria.</p>
            {(filterType !== "all" || subjectFilter !== "all" || searchQuery !== "") && (
              <button
                onClick={() => {
                  setFilterType("all");
                  setSubjectFilter("all");
                  setSearchQuery("");
                }}
                className="mt-4 px-4 py-2 bg-slate-800 text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-700 transition-all active:scale-[0.98]"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {paginatedHomework.map((h) => {
                const badgeText = h.computedStatus === "submitted" 
                  ? "Submitted" 
                  : h.computedStatus === "missed" 
                  ? "Missed" 
                  : "Pending";
                  
                const statusTheme = h.computedStatus === "submitted"
                  ? { border: "border-emerald-500/20 bg-emerald-500/5", badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", iconColor: "text-emerald-400" }
                  : h.computedStatus === "missed"
                  ? { border: "border-rose-500/20 bg-rose-500/5", badge: "text-rose-400 bg-rose-500/10 border-rose-500/20", iconColor: "text-rose-400" }
                  : { border: "border-amber-500/20 bg-amber-500/5", badge: "text-amber-400 bg-amber-500/10 border-amber-500/20", iconColor: "text-amber-400" };

                const diffText = getDaysDifference(h.dueDate);

                return (
                  <motion.div
                    layout
                    key={h.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`p-5 rounded-2xl border transition-all duration-300 active:scale-[0.99] md:hover:scale-[1.005] md:hover:bg-slate-900/40 ${statusTheme.border}`}
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      
                      <div className="flex-1 space-y-2">
                        
                        {/* Title, Subject tag and status badge */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-950 text-slate-350 border border-slate-800 flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-slate-400" />
                            {h.subject || "General"}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusTheme.badge}`}>
                            {badgeText}
                          </span>
                          {h.computedStatus !== "submitted" && diffText && (
                            <span className={`text-[10px] font-bold ${
                              h.computedStatus === "missed" ? "text-rose-400" : "text-amber-400"
                            }`}>
                              ({diffText})
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-black text-white">{h.title}</h3>
                        
                        {/* Description */}
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">{h.description}</p>
                        
                        {/* Meta information footer */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-xs text-slate-500 font-semibold">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Due: {h.dueDate}
                          </span>
                          <span className="text-slate-700">•</span>
                          <span>Class Room: {h.className}</span>
                          
                          {h.computedStatus === "submitted" && h.submittedDate !== "—" && (
                            <>
                              <span className="text-slate-700">•</span>
                              <span>Uploaded: {h.submittedDate}</span>
                            </>
                          )}

                          {h.computedStatus === "submitted" && h.score !== "—" && (
                            <>
                              <span className="text-slate-700">•</span>
                              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                                <Award className="w-3.5 h-3.5 text-emerald-400" />
                                Scored: {h.score}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Teacher remarks section */}
                        {h.feedback && (
                          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 border-l-4 border-l-teal-500 flex gap-3 items-start shadow-sm">
                            <MessageSquare className="w-4 h-4 text-teal-650 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <div className="text-[10px] text-teal-600 dark:text-teal-400 font-black uppercase tracking-wider">Teacher Comments</div>
                              <p className="text-xs italic text-slate-750 dark:text-slate-200 font-medium">"{h.feedback}"</p>
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Icon container side badge */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-950 border border-slate-800/80 ${statusTheme.iconColor}`}>
                        {h.computedStatus === "submitted" ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : h.computedStatus === "missed" ? (
                          <AlertTriangle className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-800/60">
            
            {/* Range description */}
            <div className="text-xs text-slate-400 font-bold">
              Showing <span className="text-slate-200">{((currentPage - 1) * itemsPerPage) + 1}</span> to{" "}
              <span className="text-slate-200">
                {Math.min(currentPage * itemsPerPage, filteredAndSorted.length)}
              </span>{" "}
              of <span className="text-slate-200">{filteredAndSorted.length}</span> assignments
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              
              {/* Previous page */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-400 transition-all hover:bg-slate-900 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page indices */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`min-w-9 h-9 rounded-xl text-xs font-black transition-all duration-300 active:scale-95 ${
                    currentPage === page
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/30"
                      : "bg-slate-950/30 text-slate-400 border border-slate-800 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next page */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-400 transition-all hover:bg-slate-900 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

            </div>

          </div>
        )}

      </div>
    </PortalLayout>
  );
}
