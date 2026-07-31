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
  { id: "competitive", label: "Competitive examination resources", icon: "fi-sr-trophy", gradient: "from-yellow-400 to-amber-500" },
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

        {/* Premium Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-indigo-600 dark:bg-slate-900 p-4 sm:p-5 md:py-6 md:px-7 shadow-md border border-indigo-500/20 dark:border-white/10 group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600/40 dark:via-purple-600/40 dark:to-pink-600/40 opacity-90 dark:opacity-50 group-hover:opacity-100 dark:group-hover:opacity-70 transition-opacity duration-700" />
          <div className="absolute -right-10 -top-10 opacity-15 dark:opacity-5 transform rotate-12 scale-110 pointer-events-none transition-transform duration-1000 group-hover:scale-[1.2] text-white">
            <i className="fi fi-sr-library text-[150px] leading-none" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2.5 max-w-xl text-left">
              <p className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-extrabold !text-white bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-full border border-white/20 uppercase tracking-wider shadow-sm">
                <i className="fi fi-sr-sparkles text-[10px]" /> Premium Knowledge Hub
              </p>
              <p className="text-xl sm:text-2xl md:text-[26px] font-black tracking-tight font-sans leading-tight !text-amber-300 drop-shadow-md">
                Limitless Learning, Anytime.
              </p>
              <p className="!text-white text-xs leading-relaxed font-medium drop-shadow-sm opacity-95">
                Explore an extensive collection of E-books, Government materials, Video lectures, and Competitive exam prep. Your ultimate academic companion.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Categories Carousel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fi fi-sr-grid text-base text-indigo-650 dark:text-indigo-400 flex items-center" /> Browse by Category
            </h3>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-slate-700">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`snap-start shrink-0 relative overflow-hidden rounded-xl p-3 md:p-3.5 text-left transition-all duration-300 w-28 sm:w-32 md:w-40 group border ${isActive
                    ? "border-transparent ring-2 ring-indigo-500 shadow-md scale-105"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md"
                    }`}
                >
                  {isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-100 z-0`} />
                  )}
                  <div className="relative z-10 flex flex-col h-full gap-2 sm:gap-3">
                    <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-colors ${isActive ? "bg-white/20" : `bg-gradient-to-br ${cat.gradient} shadow-sm`
                      }`}>
                      <i className={`fi ${cat.icon} text-sm sm:text-base text-white flex items-center`} style={{ color: '#fff' }} />
                    </div>
                    <div>
                      <p className={`text-xs font-bold leading-snug ${isActive ? "!text-white/90" : "text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400"}`}>
                        {cat.label}
                      </p>
                      {!isActive && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
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
                  className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-1 flex flex-col h-full"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity duration-300 text-indigo-500">
                    <i className="fi fi-sr-trophy text-5xl" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full gap-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-650 dark:text-indigo-400 text-[10px] font-black rounded-full border border-indigo-100 dark:border-indigo-800/50">
                        {res.type?.toUpperCase() || 'RESOURCE'}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold shrink-0">
                        <i className="fi fi-sr-clock text-[10px] opacity-70 flex items-center" /> 5m read
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-slate-800 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                        {res.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Subject: {res.subject}</p>
                    </div>
                    <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-auto">
                      <div className="flex gap-1 flex-wrap">
                        {res.tags?.length > 0 ? res.tags.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md font-semibold">#{tag}</span>
                        )) : (
                          <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md font-semibold">#learning</span>
                        )}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-md shadow-indigo-500/30 shrink-0">
                        <i className="fi fi-sr-arrow-small-right text-base flex items-center" style={{ color: '#fff' }} />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
              {filteredResources.map((res) => {
                const isVideo = res.type.toLowerCase().includes('video');
                return (
                  <div key={res.id} onClick={() => {
                    const url = res.fileUrl?.startsWith('/')
                      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${res.fileUrl}`
                      : res.fileUrl;
                    window.open(url, '_blank')
                  }} className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-indigo-400/50">
                    {/* Media Thumbnail Area */}
                    <div className={`h-24 w-full relative overflow-hidden flex items-center justify-center ${isVideo ? 'bg-slate-900' : 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900'}`}>
                      {isVideo ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`https://images.unsplash.com/photo-1616469829581-73993eb86b02?w=800&q=80`} alt="Video Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                          <i className="fi fi-sr-play-alt text-3xl text-white drop-shadow-2xl relative z-10 group-hover:scale-110 transition-transform flex items-center" style={{ color: '#fff' }} />
                        </>
                      ) : (
                        <div className="transition-colors group-hover:scale-105 duration-550">
                          <i className="fi fi-sr-book text-4xl text-indigo-500/30 group-hover:text-indigo-500/60 transition-colors flex items-center" />
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider bg-white/95 dark:bg-black/90 backdrop-blur-sm text-slate-800 dark:text-white rounded shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                          {res.type}
                        </span>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-3.5 flex flex-col flex-1 text-left">
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-indigo-500 mb-1">{res.subject}</p>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {res.title}
                        </h4>
                      </div>

                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
                          <i className="fi fi-sr-document text-[10px] opacity-60 flex items-center" /> {res.size || 'PDF'}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                          Access <i className="fi fi-sr-arrow-small-right text-xs flex items-center" />
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
