"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";

// The categories standardizing on uicons
const CATEGORIES = [
  { id: "all", label: "All Resources", icon: "fi-sr-layers", gradient: "from-indigo-500 to-purple-600" },
  { id: "e-books", label: "E-books", icon: "fi-sr-book", gradient: "from-blue-500 to-cyan-500" },
  { id: "reference", label: "Reference books", icon: "fi-sr-notebook", gradient: "from-emerald-500 to-teal-500" },
  { id: "video", label: "Educational videos", icon: "fi-sr-video-camera", gradient: "from-rose-500 to-pink-500" },
  { id: "government", label: "Government learning materials", icon: "fi-sr-bank", gradient: "from-amber-500 to-orange-500" },
  { id: "research", label: "Research content", icon: "fi-sr-search-alt", gradient: "from-fuchsia-500 to-purple-500" },
  { id: "competitive", label: "Competitive exams", icon: "fi-sr-trophy", gradient: "from-yellow-400 to-amber-500" },
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
    <PortalLayout title="Digital Library" subtitle="Access a vast repository of premium learning materials" accentColor="#6366f1">
      <div className="space-y-6 text-left animate-in fade-in duration-500 pb-20">

        {/* Simple White Banner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:px-8 md:py-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <i className="fi fi-sr-book-alt text-2xl flex items-center" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                DIGITAL LIBRARY
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Explore thousands of books, videos, and reference materials tailored for you.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto ml-16 md:ml-0">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              YOUR GRADE:
            </span>
            <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-bold flex items-center gap-2 border border-indigo-100 dark:border-indigo-800/50">
              <i className="fi fi-sr-graduation-cap flex items-center" /> Class {(session?.user as any)?.class || '7'}th Standard
            </div>
          </div>
        </div>

        {/* Search Bar (Moved out of the banner) */}
        <div className="relative w-full max-w-2xl flex items-center group/search mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/search:text-indigo-500 transition-colors">
            <i className="fi fi-sr-search text-lg" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for books, topics, or subjects..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-400 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 shadow-sm transition-all outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <i className="fi fi-sr-cross-circle text-base" />
            </button>
          )}
        </div>

        {/* Dynamic Categories */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fi fi-sr-grid text-indigo-500" /> Browse by Category
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 p-1">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-full transition-all duration-300 border font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md cursor-pointer
                    ${isActive
                      ? `bg-gradient-to-r ${cat.gradient} text-white border-transparent shadow-md font-extrabold`
                      : `bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400`
                    }`}
                >
                  <i className={`fi ${cat.icon} ${isActive ? "text-white" : "text-slate-400"}`} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Section (if All Resources is selected) */}
        {selectedCategory === "all" && !searchQuery && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 px-2">
              <i className="fi fi-sr-trending-up text-base text-rose-500 flex items-center" /> Trending This Week
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
              {resources.slice(0, 3).map((res) => (
                <div 
                  key={`trend-${res.id}`} 
                  onClick={() => {
                    const url = res.fileUrl?.startsWith('/')
                      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${res.fileUrl}`
                      : res.fileUrl;
                    window.open(url, '_blank');
                  }} 
                  className="group relative bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 text-indigo-500">
                    <i className="fi fi-sr-trophy text-6xl" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col h-full gap-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black tracking-widest rounded-full border border-indigo-100 dark:border-indigo-800/50">
                        {res.type?.toUpperCase() || 'RESOURCE'}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                        <i className="fi fi-sr-clock text-[10px]" /> 5m read
                      </span>
                    </div>
                    
                    <div className="flex-1 mt-2">
                      <h4 className="text-lg font-black text-slate-800 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {res.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium flex items-center gap-1.5">
                        <i className="fi fi-sr-book text-[10px]" /> {res.subject}
                      </p>
                    </div>
                    
                    <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 mt-auto">
                      <div className="flex gap-1.5 flex-wrap">
                        {res.tags?.length > 0 ? res.tags.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-semibold">#{tag}</span>
                        )) : (
                          <span className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-semibold">#learning</span>
                        )}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center transform group-hover:scale-110 group-hover:bg-indigo-500 transition-all shadow-md shadow-indigo-500/20 shrink-0">
                        <i className="fi fi-sr-arrow-small-right text-lg" style={{ color: '#fff' }} />
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
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fi fi-sr-library text-base text-indigo-600 dark:text-indigo-400 flex items-center" />
              {selectedCategory === "all" ? "All Library Resources" : CATEGORIES.find(c => c.id === selectedCategory)?.label}
            </h3>
            <span className="text-xs text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full w-fit">
              {filteredResources.length} items
            </span>
          </div>

          {filteredResources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
              <i className="fi fi-sr-inbox-out text-5xl mb-4 text-slate-350 dark:text-slate-600 block mx-auto" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">No resources found</h3>
              <p className="text-slate-500 mt-2 max-w-md">Try adjusting your search or selecting a different category to find what you're looking for.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
              {filteredResources.map((res) => {
                const isVideo = res.type.toLowerCase().includes('video');
                return (
                  <div key={res.id} onClick={() => {
                    const url = res.fileUrl?.startsWith('/')
                      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${res.fileUrl}`
                      : res.fileUrl;
                    window.open(url, '_blank')
                  }} className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-indigo-400/50 hover:-translate-y-1">
                    {/* Media Thumbnail Area */}
                    <div className={`h-36 w-full relative overflow-hidden flex items-center justify-center ${isVideo ? 'bg-slate-900' : 'bg-gradient-to-br from-indigo-50 to-slate-100 dark:from-slate-800 dark:to-slate-900'}`}>
                      {isVideo ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`https://images.unsplash.com/photo-1616469829581-73993eb86b02?w=800&q=80`} alt="Video Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" />
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                            <i className="fi fi-sr-play text-xl text-white pl-1" />
                          </div>
                        </>
                      ) : (
                        <div className="transition-transform group-hover:scale-110 duration-500">
                          <i className="fi fi-sr-book-alt text-6xl text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors" />
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-white/90 dark:bg-black/80 backdrop-blur-md text-slate-800 dark:text-white rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                          {res.type}
                        </span>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 flex flex-col flex-1 text-left">
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-1.5 uppercase tracking-wide">{res.subject}</p>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {res.title}
                        </h4>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                          <i className="fi fi-sr-document" /> {res.size || 'PDF'}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          Access <i className="fi fi-sr-arrow-small-right" />
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
