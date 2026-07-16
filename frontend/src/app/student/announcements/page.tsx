"use client";

import PortalLayout from "@/components/PortalLayout";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

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

// Map DB announcements to display config
function getAnnouncementStyle(sender: string, title: string) {
  const t = title.toLowerCase();

  // Urgent
  if (
    t.includes("urgent") || t.includes("closure") || t.includes("emergency") ||
    t.includes("closed") || t.includes("holiday") || t.includes("heavy rain") ||
    t.includes("bus route") || t.includes("water supply") || t.includes("parent meeting")
  ) {
    return { type: "Urgent", icon: "⛈️", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10 border-red-500/30" };
  }

  // Academic
  if (
    t.includes("exam") || t.includes("timetable") || t.includes("test") ||
    t.includes("homework") || t.includes("quiz") || t.includes("practical") ||
    t.includes("study") || t.includes("material") || t.includes("progress") ||
    t.includes("report") || t.includes("library") || t.includes("scholarship") ||
    t.includes("workshop") || t.includes("submission") || t.includes("chapter") ||
    t.includes("mathematics") || t.includes("science") || t.includes("coaching")
  ) {
    return { type: "Academic", icon: "📅", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" };
  }

  // Event
  if (
    t.includes("fair") || t.includes("event") || t.includes("cultural") ||
    t.includes("sports") || t.includes("competition") || t.includes("celebration") ||
    t.includes("audition") || t.includes("plantation") || t.includes("independence") ||
    t.includes("teachers") || t.includes("dance") || t.includes("music") ||
    t.includes("drawing") || t.includes("speech") || t.includes("campaign") ||
    t.includes("annual") || t.includes("day")
  ) {
    return { type: "Event", icon: "🔬", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" };
  }

  // General (fallback)
  return { type: "General", icon: "📢", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" };
}

export default function AnnouncementsPage() {
  const { data: session } = useSession();
    // 👇 ADD THIS HERE
  useEffect(() => {
    console.log("Student Session:", session?.user);
  }, [session]);
  const schoolId = (session?.user as any)?.schoolId;
  const studentClass = (session?.user as any)?.class; // e.g. "10A"
  const section = (session?.user as any)?.section;  // ← add this line
  const userId = (session?.user as any)?.id;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

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

        // Sort combined list by date descending
        allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setAnnouncements(allItems);
      } catch (err) {
        console.error("Error fetching announcements/notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [schoolId, studentClass, section, userId]);

  const unreadCount = announcements.filter(a => !readIds.has(a.id)).length;

  const filteredAnnouncements = announcements;
  
  const totalPages = Math.ceil(filteredAnnouncements.length / ITEMS_PER_PAGE);
  const paginatedAnnouncements = filteredAnnouncements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const markAllRead = () => {
    setReadIds(new Set(announcements.map(a => a.id)));
  };

  return (
    <PortalLayout
      title="School Announcements"
      subtitle={`Showing all announcements for Class ${studentClass || "..."}`}
      avatarLetter="A"
      avatarColor="#f59e0b"
      themeClass="theme-student"
      accentColor="#f59e0b"
    >
      <div className="w-full">
        {/* Announcement List */}
        <div className="glass rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700/50 min-h-[600px] bg-white dark:bg-transparent shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
              <span>📢</span>
              Latest Notifications
            </h2>
            <button
              onClick={markAllRead}
              className="text-xs font-bold text-black dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-xl"
            >
              <span>✓</span> Mark All as Read
            </button>
          </div>



            {loading ? (
              <div className="text-center py-20 text-sm text-slate-500">Loading announcements...</div>
            ) : (
              <div className="space-y-4">
                {paginatedAnnouncements.map((ann) => {
                  const style = getAnnouncementStyle(ann.sender, ann.title);
                  const isUnread = !readIds.has(ann.id);

                  return (
                    <div
                      key={ann.id}
                      onClick={() => setReadIds(prev => new Set([...prev, ann.id]))}
                      className={`relative p-6 rounded-2xl border transition-all hover:-translate-y-1 cursor-pointer bg-slate-50 dark:bg-slate-900/60 ${
                        isUnread ? style.bg : "border-slate-200 dark:border-slate-700/50 hover:border-slate-400"
                      }`}
                    >
                      {ann.pinned && (
                        <span className="absolute top-3 right-3 text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                          📌 Pinned
                        </span>
                      )}
                      {isUnread && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                      )}

                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-slate-100 dark:bg-slate-800 border ${
                          isUnread ? `${style.color} border-current` : "text-black dark:text-white border-slate-200 dark:border-slate-700"
                        }`}>
                          {style.icon}
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded border ${
                                isUnread ? `${style.color} border-current` : "text-black dark:text-white border-slate-300 dark:border-slate-600"
                              }`}>
                                {style.type}
                              </span>
                              <h3 className="text-lg font-bold text-black dark:text-white">{ann.title}</h3>
                            </div>
                            <span className="text-[10px] font-bold text-black dark:text-white uppercase tracking-wider whitespace-nowrap">
                              {ann.date || new Date(ann.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <p className="text-sm text-black dark:text-white leading-relaxed mb-3">{ann.body}</p>

                          <div className="flex items-center gap-2 text-xs font-bold text-black dark:text-white">
                            <span>✍️ Posted by:</span>
                            <span>{ann.sender}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredAnnouncements.length === 0 && !loading && (
                  <div className="text-center py-20">
                    <div className="text-5xl mb-4 opacity-50">📭</div>
                    <h3 className="text-lg text-black dark:text-white font-bold mb-1">You're all caught up!</h3>
                  </div>
                )}
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200 dark:border-slate-700/50">
                    <span className="text-sm font-semibold text-slate-500">
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 disabled:opacity-50 text-black dark:text-white rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 disabled:opacity-50 text-black dark:text-white rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
    </PortalLayout>
  );
}