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

const getClubEligibility = (clubName: string) => {
  const name = clubName.toLowerCase();
  if (name.includes("service scheme") || name.includes("nss") || name.includes("ribbon") || name.includes("rrc")) {
    return { label: "Class 11 - 12", minClass: 11, maxClass: 12, levels: ["higher"] };
  }
  if (name.includes("cadet corps") || name.includes("ncc") || name.includes("safety patrol") || name.includes("rsp")) {
    return { label: "Class 9 - 12", minClass: 9, maxClass: 12, levels: ["high", "higher"] };
  }
  if (name.includes("red cross") || name.includes("jrc") || name.includes("scouts") || name.includes("guides") || name.includes("green corps") || name.includes("eco club")) {
    return { label: "Class 6 - 10", minClass: 6, maxClass: 10, levels: ["middle", "high"] };
  }
  return { label: "Class 6 - 12", minClass: 6, maxClass: 12, levels: ["middle", "high", "higher"] };
};

export default function ClubsDirectoryPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId || "";

  const [clubs, setClubs] = useState<Club[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedStandard, setSelectedStandard] = useState<string>("all");
  const [studentProfile, setStudentProfile] = useState<any>(null);

  const fetchClubs = useCallback(async () => {
    if (!schoolId) return;
    try {
      const res = await fetch(`${API_BASE}/api/activities?schoolId=${schoolId}`);
      const json = await res.json();
      if (json.success) {
        const discoverClubs = json.data.discoverClubs || [];
        setClubs(discoverClubs);

        // Fetch logged-in student's profile to determine default standard filter and class
        if (session?.user) {
          const studentRes = await fetch(`${API_BASE}/api/students?schoolId=${schoolId}`);
          const studentJson = await studentRes.json();
          if (studentJson.success) {
            const myStudent = studentJson.data.find((s: any) => s.userId === (session.user as any).id);
            if (myStudent) {
              setStudentProfile(myStudent);
              const studentClassNum = parseInt(myStudent.class || "0", 10);
              if (studentClassNum >= 11) {
                setSelectedStandard("higher");
              } else if (studentClassNum >= 9) {
                setSelectedStandard("high");
              } else if (studentClassNum >= 6) {
                setSelectedStandard("middle");
              }
            }
          }
        }

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
  }, [session, schoolId]);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  const targetStandard = useMemo(() => {
    if (!studentProfile) return selectedStandard;
    const studentClassNum = parseInt(studentProfile.class || "0", 10);
    if (studentClassNum >= 11) return "higher";
    if (studentClassNum >= 9) return "high";
    return "middle";
  }, [studentProfile, selectedStandard]);

  const filteredClubs = useMemo(() => {
    return clubs.filter(club => {
      const eligibility = getClubEligibility(club.name);
      const matchesStandard = targetStandard === "all" || eligibility.levels.includes(targetStandard);
      const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "all" || club.category.toLowerCase() === activeCategory.toLowerCase();
      return matchesStandard && matchesSearch && matchesCategory;
    });
  }, [clubs, targetStandard, searchTerm, activeCategory]);

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    cats.add("all");
    clubs.forEach(club => {
      const eligibility = getClubEligibility(club.name);
      const matchesStandard = targetStandard === "all" || eligibility.levels.includes(targetStandard);
      if (matchesStandard && club.category) {
        cats.add(club.category.toLowerCase());
      }
    });
    return Array.from(cats);
  }, [clubs, targetStandard]);

  useEffect(() => {
    if (activeCategory !== "all" && !availableCategories.includes(activeCategory)) {
      setActiveCategory("all");
    }
  }, [availableCategories, activeCategory]);

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
        {/* Standard Selector Tab - Only shown for Admins/Staff to browse dynamically */}
        {!studentProfile && (
          <div className="mb-6 bg-slate-900/30 p-4 rounded-2xl border border-slate-800/65 text-left">
            <div className="text-[10px] font-black uppercase text-slate-450 mb-3 tracking-widest flex items-center gap-1.5">
              <i className="fi fi-rr-settings text-purple-500" /> Dynamic Standard-wise Selection
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "All Classes (6-12)", icon: "🏫" },
                { value: "middle", label: "Middle (Class 6-8)", icon: "🎒" },
                { value: "high", label: "High School (Class 9-10)", icon: "🎯" },
                { value: "higher", label: "Higher Sec (Class 11-12)", icon: "🚀" }
              ].map((std) => (
                <button 
                  key={std.value}
                  onClick={() => setSelectedStandard(std.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    selectedStandard === std.value 
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/10' 
                      : 'bg-slate-800 text-slate-450 hover:border-slate-400 hover:text-white border-slate-700'
                  }`}
                >
                  <span>{std.icon}</span> {std.label}
                </button>
              ))}
            </div>
          </div>
        )}

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
            {availableCategories.map((tab) => (
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
              const eligibility = getClubEligibility(club.name);

              return (
                <div key={club.id} className={`rounded-2xl p-6 border ${theme.bg} transition-all hover:-translate-y-2 cursor-pointer group flex flex-col h-full bg-slate-900/20`}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-slate-900/50 w-20 h-20 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all">
                      {renderClubIcon(club.icon, theme.color)}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${theme.tagBg} ${theme.color}`}>
                        {club.category}
                      </span>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-450 border border-slate-700">
                        {eligibility.label}
                      </span>
                    </div>
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
