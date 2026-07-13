"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";

interface Club {
  id: string;
  name: string;
  category: string;
  icon: string;
  themeColor?: string;
  themeBg?: string;
  themeTagBg?: string;
}

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

const getCategoryThemeClass = (cat: string) => {
  switch (cat) {
    case "Environment": return {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      tagBg: "bg-emerald-500/20"
    };
    case "Arts": return {
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      tagBg: "bg-amber-500/20"
    };
    case "Science": return {
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
      tagBg: "bg-purple-500/20"
    };
    case "Literature": return {
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      tagBg: "bg-blue-500/20"
    };
    case "Academics": return {
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
      tagBg: "bg-indigo-500/20"
    };
    case "Sports": return {
      color: "text-orange-400",
      bg: "bg-orange-500/10 border-orange-500/20",
      tagBg: "bg-orange-500/20"
    };
    default: return {
      color: "text-slate-400",
      bg: "bg-slate-500/10 border-slate-500/20",
      tagBg: "bg-slate-500/20"
    };
  }
};

const renderClubIcon = (iconStr: string, colorClass: string) => {
  if (iconStr && iconStr.startsWith("fi ")) {
    return <i className={`${iconStr} ${colorClass} text-3xl`} />;
  }
  const s = iconStr || "";
  if (s === "🌱") return <i className={`fi fi-rr-leaf ${colorClass} text-3xl`} />;
  if (s === "🎭") return <i className={`fi fi-rr-palette ${colorClass} text-3xl`} />;
  if (s === "♾️") return <i className={`fi fi-rr-calculator ${colorClass} text-3xl`} />;
  if (s === "✍️") return <i className={`fi fi-rr-edit ${colorClass} text-3xl`} />;
  if (s === "📸") return <i className={`fi fi-rr-camera ${colorClass} text-3xl`} />;
  if (s === "🔭") return <i className={`fi fi-rr-flask ${colorClass} text-3xl`} />;
  if (s === "♟️") return <i className={`fi fi-rr-trophy ${colorClass} text-3xl`} />;
  if (s === "💻") return <i className={`fi fi-rr-laptop ${colorClass} text-3xl`} />;
  return <i className={`fi fi-rr-users ${colorClass} text-3xl`} />;
};

export default function ClubsDirectoryPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId || "";

  const [clubs, setClubs] = useState<Club[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const fetchClubs = useCallback(async () => {
    if (!schoolId) return;
    try {
      const res = await fetch(`${API_BASE}/api/activities?schoolId=${schoolId}`);
      const json = await res.json();
      if (json.success) {
        const discoverClubs = json.data.discoverClubs || [];
        setClubs(discoverClubs);

        // Fetch members list for counts in background
        discoverClubs.forEach(async (c: Club) => {
          try {
            const r = await fetch(`${API_BASE}/api/activities/club/${c.id}/members`);
            const j = await r.json();
            if (j.success && j.data) {
              setMemberCounts(prev => ({ ...prev, [c.id]: j.data.length }));
            }
          } catch (err) {
            console.error("Count fetch failed", err);
          }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  const filteredClubs = useMemo(() => {
    return clubs.filter(club => {
      const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "all" || club.category.toLowerCase() === activeCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [clubs, searchTerm, activeCategory]);

  return (
    <PortalLayout
      title="Clubs & Societies Directory"
      subtitle="Browse the complete directory of student organizations at GHS Coimbatore."
      avatarLetter="A"
      avatarColor="#8b5cf6"
      themeClass="theme-student"
      accentColor="#8b5cf6"
    >
      <div className="mb-6 text-left">
        <Link href="/student/activities" className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors w-fit">
          <span>←</span> Back to Activities Hub
        </Link>
      </div>

      <div className="glass rounded-3xl p-4 sm:p-6 border border-slate-700/50 min-h-screen text-left">
        {/* Search and Filter */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search all clubs..." 
              className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 pl-12 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors shadow-inner"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">
              <i className="fi fi-rr-search text-slate-400" />
            </span>
          </div>

          <div className="flex overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 gap-2 hide-scrollbar">
            {['all', 'academics', 'arts', 'environment', 'literature', 'science', 'sports'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveCategory(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                  activeCategory === tab 
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-xs gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
            <span>Loading clubs directory...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredClubs.map((club) => {
              const theme = getCategoryThemeClass(club.category);
              return (
                <div key={club.id} className={`rounded-2xl p-6 border ${theme.bg} transition-all hover:-translate-y-2 cursor-pointer group flex flex-col h-full bg-slate-900/20`}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-slate-900/50 w-20 h-20 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all">
                      {renderClubIcon(club.icon, theme.color)}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${theme.tagBg} ${theme.color}`}>
                      {club.category}
                    </span>
                  </div>
                  
                  <div className="mt-auto">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{club.name}</h3>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-900"></div>
                        <div className="w-6 h-6 rounded-full bg-slate-600 border-2 border-slate-900"></div>
                        <div className="w-6 h-6 rounded-full bg-slate-500 border-2 border-slate-900"></div>
                      </div>
                      <p className="text-xs text-slate-450 font-bold">
                        {memberCounts[club.id] ?? 0} Members
                      </p>
                    </div>
                    <Link 
                      href={`/student/activities`}
                      className={`block text-center w-full py-3 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 border border-slate-700/50 transition-colors ${theme.color}`}
                    >
                      View Club Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredClubs.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">👻</div>
            <h3 className="text-xl text-white font-bold mb-2">No clubs found</h3>
            <p className="text-slate-400">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
