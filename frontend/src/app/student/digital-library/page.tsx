"use client";

import React, { useState, useEffect, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { 
  BookOpen, 
  Search, 
  Book, 
  Video, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Library,
  FileText,
  Building2,
  FlaskConical,
  Trophy,
  PlayCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock
} from "lucide-react";
import { useSession } from "next-auth/react";

// The categories the user requested
const CATEGORIES = [
  { id: "all", label: "All Resources", flaticon: "https://cdn-icons-png.flaticon.com/128/2232/2232688.png", gradient: "from-indigo-500 to-purple-600" },
  { id: "e-books", label: "E-books", flaticon: "https://cdn-icons-png.flaticon.com/128/3389/3389081.png", gradient: "from-blue-500 to-cyan-500" },
  { id: "reference", label: "Reference books", flaticon: "https://cdn-icons-png.flaticon.com/128/3145/3145765.png", gradient: "from-emerald-500 to-teal-500" },
  { id: "video", label: "Educational videos", flaticon: "https://cdn-icons-png.flaticon.com/128/2965/2965611.png", gradient: "from-rose-500 to-pink-500" },
  { id: "government", label: "Government learning materials", flaticon: "https://cdn-icons-png.flaticon.com/128/1974/1974052.png", gradient: "from-amber-500 to-orange-500" },
  { id: "research", label: "Research content", flaticon: "https://cdn-icons-png.flaticon.com/128/939/939329.png", gradient: "from-fuchsia-500 to-purple-500" },
  { id: "competitive", label: "Competitive examination resources", flaticon: "https://cdn-icons-png.flaticon.com/128/3112/3112946.png", gradient: "from-yellow-400 to-amber-500" },
];

// We will load resources dynamically


export default function DigitalLibraryPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isClient, setIsClient] = useState(false);
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    setIsClient(true);
    const fetchResources = async () => {
      try {
        let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/digital-library-upload`;
        if ((session?.user as any)?.schoolId) {
          url += `?schoolId=${(session?.user as any)?.schoolId}`;
        }
        
        const userClass = (session?.user as any)?.class;
        if (userClass) {
          url += url.includes('?') ? `&class=${userClass}` : `?class=${userClass}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setResources(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (session) {
      fetchResources();
    }
  }, [session]);

  const filteredResources = resources.filter((res) => {
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          res.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || res.type === CATEGORIES.find(c => c.id === selectedCategory)?.label;
    return matchesSearch && matchesCategory;
  });

  if (!isClient) return null; // Avoid hydration mismatch

  return (
    <PortalLayout title="Digital Library 📖" subtitle="Access a vast repository of premium learning materials" accentColor="#6366f1">
      <div className="space-y-8 text-left animate-in fade-in duration-500 pb-20">
        
        {/* Premium Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-indigo-600 dark:bg-slate-900 p-6 sm:p-8 md:p-12 shadow-2xl border border-indigo-500/20 dark:border-white/10 group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600/40 dark:via-purple-600/40 dark:to-pink-600/40 opacity-90 dark:opacity-50 group-hover:opacity-100 dark:group-hover:opacity-70 transition-opacity duration-700" />
          <div className="absolute -right-16 -top-16 opacity-20 dark:opacity-10 transform rotate-12 scale-150 pointer-events-none transition-transform duration-1000 group-hover:scale-[1.6]">
            <img src="https://cdn-icons-png.flaticon.com/128/2232/2232688.png" className="w-96 h-96 grayscale invert" alt="library bg" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-full border border-white/30 dark:border-white/20 text-white uppercase tracking-widest shadow-xl">
                <img src="https://cdn-icons-png.flaticon.com/128/1666/1666579.png" className="w-4 h-4" alt="sparkles" /> Premium Knowledge Hub
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight font-sans leading-tight !text-amber-300 drop-shadow-lg">
                Limitless Learning, Anytime.
              </h2>
              <p className="!text-white/90 text-base md:text-lg leading-relaxed font-medium drop-shadow">
                Explore an extensive collection of E-books, Government materials, Video lectures, and Competitive exam prep. Your ultimate academic companion.
              </p>
            </div>

            {/* Premium Search box */}
            {/* <div className="w-full md:w-96 bg-white dark:bg-white/10 backdrop-blur-2xl border border-transparent dark:border-white/20 p-2 pl-4 rounded-2xl shadow-xl flex items-center gap-3 transition-all focus-within:shadow-2xl focus-within:scale-[1.02]">
              <img src="https://cdn-icons-png.flaticon.com/128/6149/6149867.png" className="w-5 h-5 opacity-70 grayscale" alt="search" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources, topics..."
                className="w-full bg-transparent border-0 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/50 focus:ring-0 focus:outline-none text-base pr-2"
              />
            </div> */}
          </div>
        </div>

        {/* Dynamic Categories Carousel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <img src="https://cdn-icons-png.flaticon.com/128/6532/6532057.png" className="w-6 h-6" alt="layers" /> Browse by Category
            </h3>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-slate-700">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`snap-start shrink-0 relative overflow-hidden rounded-2xl p-4 md:p-5 text-left transition-all duration-300 w-40 sm:w-44 md:w-56 group border ${
                    isActive 
                      ? "border-transparent ring-2 ring-indigo-500 shadow-xl scale-105" 
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg"
                  }`}
                >
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-100 z-0`} />
                  )}
                  <div className="relative z-10 flex flex-col h-full gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-colors ${
                      isActive ? "bg-white/20" : `bg-gradient-to-br ${cat.gradient} shadow-md`
                    }`}>
                      <img src={cat.flaticon} className="w-5 h-5 sm:w-6 sm:h-6 brightness-0 invert opacity-90" alt={cat.label} />
                    </div>
                    <div>
                      <h4 className={`font-bold leading-tight ${isActive ? "text-white" : "text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400"}`}>
                        {cat.label}
                      </h4>
                      {!isActive && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          Explore collection
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Section (if All Resources is selected) */}
        {selectedCategory === "all" && !searchQuery && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 px-2">
              <img src="https://cdn-icons-png.flaticon.com/128/3041/3041490.png" className="w-6 h-6" alt="trending" /> Trending This Week
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
              {resources.slice(0, 3).map((res) => (
                <div key={`trend-${res.id}`} onClick={() => {
                  const url = res.fileUrl?.startsWith('/') 
                    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${res.fileUrl}` 
                    : res.fileUrl;
                  window.open(url, '_blank');
                }} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-1">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                    <img src="https://cdn-icons-png.flaticon.com/128/3112/3112946.png" className="w-24 h-24 grayscale" alt="trophy bg" />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full border border-indigo-100 dark:border-indigo-800/50">
                        {res.type.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <img src="https://cdn-icons-png.flaticon.com/128/2972/2972531.png" className="w-3.5 h-3.5 opacity-70 grayscale" alt="clock" /> 5m read
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-800 dark:text-white line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                        {res.title}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Subject: {res.subject}</p>
                    </div>
                    <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                      <div className="flex gap-1">
                        {res.tags?.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md font-semibold">#{tag}</span>
                        ))}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/30">
                        <img src="https://cdn-icons-png.flaticon.com/128/2989/2989988.png" className="w-4 h-4 invert" alt="go" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-2 sm:gap-0">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <img src="https://cdn-icons-png.flaticon.com/128/2232/2232688.png" className="w-6 h-6" alt="library" /> 
              {selectedCategory === "all" ? "All Library Resources" : CATEGORIES.find(c => c.id === selectedCategory)?.label}
            </h3>
            <span className="text-sm text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full w-fit">
              {filteredResources.length} items
            </span>
          </div>

          {filteredResources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
              <img src="https://cdn-icons-png.flaticon.com/128/6149/6149867.png" className="w-16 h-16 mb-4 opacity-50 grayscale" alt="empty" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">No resources found</h3>
              <p className="text-slate-500 mt-2 max-w-md">Try adjusting your search or selecting a different category to find what you're looking for.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
              {filteredResources.map((res) => {
                const isVideo = res.type.toLowerCase().includes('video');
                return (
                  <div key={res.id} onClick={() => {
                    const url = res.fileUrl?.startsWith('/') 
                      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${res.fileUrl}` 
                      : res.fileUrl;
                    window.open(url, '_blank');
                  }} className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-indigo-400/50">
                    {/* Media Thumbnail Area */}
                    <div className={`h-32 w-full relative overflow-hidden flex items-center justify-center ${isVideo ? 'bg-slate-900' : 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900'}`}>
                      {isVideo ? (
                        <>
                          <img src={`https://images.unsplash.com/photo-1616469829581-73993eb86b02?w=800&q=80`} alt="Video Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                          <img src="https://cdn-icons-png.flaticon.com/128/3176/3176388.png" className="w-12 h-12 invert drop-shadow-2xl relative z-10 group-hover:scale-110 transition-transform" alt="play" />
                        </>
                      ) : (
                        <div className="transition-colors group-hover:scale-110 duration-500">
                          <img src="https://cdn-icons-png.flaticon.com/128/3389/3389081.png" className="w-16 h-16 opacity-30 group-hover:opacity-60 transition-opacity" alt="book thumbnail" />
                        </div>
                      )}
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-white/90 dark:bg-black/80 backdrop-blur-sm text-slate-800 dark:text-white rounded-md shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                          {res.type}
                        </span>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-indigo-500 mb-1.5">{res.subject}</p>
                        <h4 className="font-bold text-slate-800 dark:text-white leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {res.title}
                        </h4>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                          <img src="https://cdn-icons-png.flaticon.com/128/2983/2983155.png" className="w-3 h-3 grayscale opacity-60" alt="doc" /> {res.size || 'PDF'}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-indigo-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                          Access <img src="https://cdn-icons-png.flaticon.com/128/2989/2989988.png" className="w-3.5 h-3.5 opacity-80" alt="go" />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
