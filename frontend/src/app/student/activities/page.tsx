"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import Swal from "sweetalert2";

interface Club {
  id: string;
  name: string;
  category: string;
  icon: string;
  description?: string;
  sponsor?: string;
  meetingTime?: string;
}

interface ClubMember {
  name: string;
  role: string;
  icon: string;
  category: string;
  nextEvent: string;
}

interface ClubEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  icon: string;
  themeColor: string;
}

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

const getCategoryTheme = (cat: string) => {
  switch (cat) {
    case "Environment": return {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      tagBg: "bg-emerald-500/20",
      gradient: "from-emerald-500 to-teal-600"
    };
    case "Arts": return {
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      tagBg: "bg-amber-500/20",
      gradient: "from-amber-500 to-orange-600"
    };
    case "Science": return {
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
      tagBg: "bg-purple-500/20",
      gradient: "from-purple-500 to-indigo-650"
    };
    case "Literature": return {
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      tagBg: "bg-blue-500/20",
      gradient: "from-blue-500 to-cyan-600"
    };
    case "Academics": return {
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
      tagBg: "bg-indigo-500/20",
      gradient: "from-indigo-500 to-violet-600"
    };
    case "Sports": return {
      color: "text-orange-400",
      bg: "bg-orange-500/10 border-orange-500/20",
      tagBg: "bg-orange-500/20",
      gradient: "from-orange-500 to-red-600"
    };
    default: return {
      color: "text-slate-400",
      bg: "bg-slate-500/10 border-slate-500/20",
      tagBg: "bg-slate-500/20",
      gradient: "from-slate-500 to-slate-700"
    };
  }
};

const renderFlaticon = (iconStr: string, sizeClass = "text-xl", colorClass = "text-blue-450") => {
  const s = iconStr || "";
  if (s.startsWith("fi ")) {
    return <i className={`${s} ${sizeClass} ${colorClass}`} />;
  }
  // Mapping legacy emojis
  if (s === "🌱") return <i className={`fi fi-rr-leaf ${sizeClass} ${colorClass}`} />;
  if (s === "🎭") return <i className={`fi fi-rr-palette ${sizeClass} ${colorClass}`} />;
  if (s === "🔬") return <i className={`fi fi-rr-flask ${sizeClass} ${colorClass}`} />;
  if (s === "🏆") return <i className={`fi fi-rr-trophy ${sizeClass} ${colorClass}`} />;
  if (s === "♾️") return <i className={`fi fi-rr-calculator ${sizeClass} ${colorClass}`} />;
  if (s === "✍️") return <i className={`fi fi-rr-book-open-reader ${sizeClass} ${colorClass}`} />;
  if (s === "💻") return <i className={`fi fi-rr-laptop ${sizeClass} ${colorClass}`} />;
  if (s === "🤖") return <i className={`fi fi-rr-bot ${sizeClass} ${colorClass}`} />;
  if (s === "🎙️") return <i className={`fi fi-rr-microphone ${sizeClass} ${colorClass}`} />;
  if (s === "🎨") return <i className={`fi fi-rr-paint-brush ${sizeClass} ${colorClass}`} />;
  if (s === "🗓️") return <i className={`fi fi-rr-calendar-clock ${sizeClass} ${colorClass}`} />;
  if (s === "⭐") return <i className={`fi fi-rr-star ${sizeClass} ${colorClass}`} />;
  return <i className={`fi fi-rr-users ${sizeClass} ${colorClass}`} />;
};

export default function ExtracurricularsPage() {
  const { data: session, status } = useSession();
  const schoolId = (session?.user as any)?.schoolId || "";

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [discoverClubs, setDiscoverClubs] = useState<Club[]>([]);
  const [myClubs, setMyClubs] = useState<ClubMember[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<ClubEvent[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!schoolId) return;
    try {
      const res = await fetch(`${API_BASE}/api/activities?schoolId=${schoolId}`);
      const json = await res.json();

      if (json.success && json.data) {
        const clubsList: Club[] = json.data.discoverClubs || [];
        setDiscoverClubs(clubsList);

        // Fetch member list counts
        clubsList.forEach(async (c) => {
          try {
            const r = await fetch(`${API_BASE}/api/activities/club/${c.id}/members`);
            const j = await r.json();
            if (j.success && j.data) {
              setMemberCounts(prev => ({ ...prev, [c.id]: j.data.length }));
            }
          } catch {
            // ignore
          }
        });

        // Format event dates
        const formattedEvents = (json.data.upcomingEvents || []).map((e: any) => {
          const dateObj = new Date(e.eventDate);
          return {
            ...e,
            date: dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
          };
        });
        setUpcomingEvents(formattedEvents);

        // Fetch logged-in student's joined clubs
        let fetchedRealClubs = false;
        if (session?.user) {
          const studentRes = await fetch(`${API_BASE}/api/students?schoolId=${schoolId}`);
          const studentJson = await studentRes.json();
          if (studentJson.success) {
            const myStudent = studentJson.data.find((s: any) => s.userId === (session.user as any).id);
            if (myStudent) {
              const myClubsRes = await fetch(`${API_BASE}/api/activities/student/${myStudent.id}`);
              const myClubsJson = await myClubsRes.json();
              if (myClubsJson.success && myClubsJson.data?.myClubs) {
                setMyClubs(myClubsJson.data.myClubs);
                fetchedRealClubs = true;
              }
            }
          }
        }

        if (!fetchedRealClubs) {
          setMyClubs([]); // Clean, dynamic empty state if student has not joined any clubs
        }
      }
    } catch (error) {
      console.error("Failed to fetch activities", error);
    } finally {
      setLoading(false);
    }
  }, [session, schoolId]);

  useEffect(() => {
    if (status === "loading") return;
    fetchActivities();
  }, [status, fetchActivities]);

  const filteredClubs = useMemo(() => {
    return discoverClubs.filter(club => {
      const matchesTab = activeTab === "all" || club.category.toLowerCase() === activeTab.toLowerCase();
      const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [discoverClubs, activeTab, searchQuery]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        {/* Animated Rings */}
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-purple-200/50 dark:border-purple-900/50"></div>
          <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" style={{ animationDuration: '1.5s' }}></div>
          <div className="absolute inset-2 rounded-full border-4 border-emerald-500 border-b-transparent animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
          <div className="text-3xl text-purple-600 animate-bounce" style={{ animationDuration: '2s' }}>
            <i className="fi fi-rr-palette" />
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-widest uppercase mb-2">
          Loading<span className="animate-pulse">...</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-xs flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
          Discovering clubs and events for you
        </p>
      </div>
    );
  }

  return (
    <PortalLayout
      title="Extracurricular Activities"
      subtitle="Discover your passions, build new skills, and connect with peers outside the classroom."
      avatarLetter="A"
      avatarColor="#8b5cf6"
      themeClass="theme-student"
      accentColor="#8b5cf6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        {/* Left Column: My Clubs & Events */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* My Clubs */}
          <div className="glass rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
            <h2 className="text-base font-bold text-black dark:text-white mb-4 flex items-center gap-2">
              {renderFlaticon("⭐", "text-lg text-amber-500")} My Clubs
            </h2>
            <div className="space-y-4">
              {myClubs.map((club, idx) => {
                const theme = getCategoryTheme(club.category);
                return (
                  <div key={idx} className="relative overflow-hidden rounded-2xl p-4 border border-slate-200 dark:border-slate-700/50 group cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                    <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                    <div className="relative z-10 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                        {renderFlaticon(club.icon, "text-xl", theme.color)}
                      </div>
                      <div>
                        <h3 className="font-bold text-black dark:text-white text-xs leading-snug mb-1">{club.name}</h3>
                        <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-black dark:text-slate-300">{club.role}</span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2.5 flex items-center gap-1.5 font-medium">
                          <i className="fi fi-rr-calendar-clock text-slate-400" /> {club.nextEvent}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {myClubs.length === 0 && (
                <div className="text-center py-8 text-slate-550 dark:text-slate-400 text-xs italic">
                  You haven't joined any school clubs yet.
                </div>
              )}
            </div>
            <Link href="/student/activities/directory" className="block text-center w-full mt-4 py-2.5 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold text-black dark:text-slate-400 hover:text-purple-600 dark:hover:text-white hover:border-purple-400 dark:hover:border-slate-400 transition-colors">
              + Join another club
            </Link>
          </div>

          {/* Upcoming Events Calendar */}
          <div className="glass rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
                {renderFlaticon("🗓️", "text-lg text-purple-500")} Upcoming Events
              </h2>
              <button 
                onClick={(e) => { e.preventDefault(); Swal.fire("Information", "Interactive Calendar view is coming soon!", "info"); }} 
                className="text-[11px] text-purple-650 dark:text-purple-400 hover:text-purple-755 dark:hover:text-purple-300 font-bold"
              >
                View Calendar
              </button>
            </div>
            
            <ul className="space-y-0">
              {upcomingEvents.map((event, idx) => (
                <li key={idx} className="relative flex gap-4 pb-4">
                  {/* Timeline line */}
                  {idx !== upcomingEvents.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-slate-200 dark:bg-slate-800"></div>
                  )}
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-850 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 z-10">
                    {renderFlaticon(event.icon, "text-xs", event.themeColor)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-black dark:text-white truncate">{event.title}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1 font-semibold">
                      <span>{event.date}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-650"></span>
                      <span className={event.themeColor}>{event.type}</span>
                    </p>
                  </div>
                </li>
              ))}

              {upcomingEvents.length === 0 && (
                <div className="text-center py-6 text-slate-550 dark:text-slate-400 text-xs italic">
                  No upcoming events logged.
                </div>
              )}
            </ul>
          </div>

          {/* Activity Portfolio Shortcut */}
          <div className="glass rounded-3xl p-5 sm:p-6 border border-purple-500/30 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-transparent">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-500/30">
                <i className="fi fi-rr-trophy text-2xl" />
              </div>
              <div>
                <h3 className="font-bold text-black dark:text-white text-xs sm:text-sm">Activity Portfolio</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Track your extracurricular achievements.</p>
              </div>
            </div>
            <Link href="/student/middle-school/portfolio" className="block text-center w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-500/20">
              View Portfolio
            </Link>
          </div>
        </div>

        {/* Right Column: Discover Clubs Grid */}
        <div className="lg:col-span-2">
          <div className="glass rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/50 min-h-full bg-white dark:bg-transparent">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-base sm:text-lg font-bold text-black dark:text-white flex items-center gap-2">
                <i className="fi fi-rr-search text-purple-500 text-lg sm:text-xl" /> Discover Clubs & Societies
              </h2>
              
              <div className="relative w-full sm:w-auto">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clubs..." 
                  className="w-full sm:w-64 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 pl-10 text-xs text-black dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-slate-550">
                  <i className="fi fi-rr-search text-xs" />
                </span>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
              {['all', 'arts', 'science', 'environment', 'academics', 'literature'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                    activeTab === tab 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-slate-105 dark:bg-slate-800 text-black dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-purple-600 dark:hover:text-white border border-slate-200 dark:border-slate-750'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Clubs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredClubs.map((club) => {
                const theme = getCategoryTheme(club.category);
                return (
                  <div key={club.id} className={`rounded-2xl p-5 border ${theme.bg} transition-all hover:-translate-y-1 cursor-pointer group flex flex-col justify-between h-full bg-slate-950/20`}>
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-slate-100 dark:bg-slate-900/50 w-14 h-14 rounded-xl flex items-center justify-center border border-slate-250 dark:border-slate-800 group-hover:scale-110 transition-transform shrink-0">
                          {renderFlaticon(club.icon, "text-2xl", theme.color)}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${theme.tagBg} ${theme.color}`}>
                          {club.category}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-black dark:text-white mb-1 line-clamp-1">{club.name}</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1 font-semibold">
                        <i className="fi fi-rr-users text-slate-400" /> {memberCounts[club.id] ?? 0} Active Members
                      </p>
                    </div>
                    <Link 
                      href={`/student/activities`}
                      className={`block text-center w-full py-2.5 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-all ${theme.color}`}
                    >
                      Learn More & Join
                    </Link>
                  </div>
                );
              })}
              
              {filteredClubs.length === 0 && (
                <div className="col-span-full text-center py-16 text-slate-550 dark:text-slate-400 italic text-xs">
                  <div className="text-4xl mb-3">👻</div>
                  <h3 className="text-black dark:text-white font-bold mb-1">No clubs found</h3>
                  <p className="text-slate-400">Try selecting a different category.</p>
                </div>
              )}
            </div>

            {/* Create Club Banner */}
            <div className="mt-8 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 border border-purple-500/30 p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full"></div>
              <div className="relative z-10 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-black dark:text-white mb-1">Can't find what you're looking for?</h3>
                <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed">You can start your own club! Gather 5 students and a faculty sponsor to apply.</p>
              </div>
              <button 
                onClick={() => Swal.fire("Extracurricular Hub", "Please submit your club proposal to Mr. Ramesh (PET coordinator) in the physical sports office.", "info")}
                className="relative z-10 shrink-0 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-purple-900 rounded-xl text-xs font-bold shadow-lg hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors"
              >
                Start a Club
              </button>
            </div>

          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
