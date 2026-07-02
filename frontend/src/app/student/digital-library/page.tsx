"use client";

import React, { useState, useEffect, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { BookOpen, Search, Book, Video, ArrowRight, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

interface LibraryResource {
  id: string;
  title: string;
  type: string;
  subject: string;
  class: string;
  size: string;
  description: string;
  tags: string[];
  fileUrl?: string;
  aiContent?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const subjectColor: Record<string, string> = {
  Physics: "#3b82f6",
  Chemistry: "#ec4899",
  Biology: "#10b981",
  Mathematics: "#6366f1",
  History: "#f97316",
  Tamil: "#a855f7",
  English: "#06b6d4",
};

export default function DigitalLibraryPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;

  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Resources" },
    { id: "PDF", label: "PDF Documents" },
    { id: "Video", label: "Video Lessons" },
    { id: "Worksheet", label: "Worksheets" },
    { id: "E-Book", label: "E-Books" },
  ];

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (schoolId) params.append("schoolId", schoolId);
      const res = await fetch(`${API}/api/digital-library?${params}`);
      const data = await res.json();
      if (data.success) setResources(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleReadClick = async (res: LibraryResource) => {
    if (res.fileUrl) {
      window.open(res.fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // Fallback: Show pre-generated AI content if available from the database
    if (res.aiContent) {
      Swal.fire({
        title: `<span class="text-indigo-600">${res.title}</span>`,
        html: `<div class="text-left text-sm max-h-[60vh] overflow-y-auto mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl leading-relaxed">${res.aiContent}</div>`,
        width: 800,
        showCloseButton: true,
        confirmButtonText: "Close",
        confirmButtonColor: "#4f46e5",
      });
    } else {
      Swal.fire("Unavailable", `"${res.title}" is currently unavailable. Please ask your teacher to provide a link or generate study notes.`, "info");
    }
  };

  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || res.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PortalLayout title="Digital Library 📖" subtitle="Access digital textbooks, guides, and interactive lessons" accentColor="#6366f1">
      <div className="space-y-6 text-left animate-in fade-in duration-300">
        
        {/* Search & Banner */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 md:p-8 shadow-xl border-2 md:border-4 border-indigo-100 dark:border-indigo-950">
          <div className="absolute right-0 top-0 opacity-20 transform translate-x-1/4 -translate-y-1/4 scale-150 pointer-events-none mix-blend-overlay">
            <BookOpen className="w-64 h-64" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <h2 className="text-2xl md:text-4xl font-black font-mono tracking-tight">Expand Your Knowledge!</h2>
            <p className="text-indigo-100 font-bold max-w-xl text-xs md:text-base">
              Search and view learning materials curated by educators. Read online or download to practice offline.
            </p>
            
            {/* Search Input */}
            <div className="relative max-w-md mt-2">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject, title, or topic..."
                className="w-full bg-white dark:bg-slate-900 border-0 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 dark:text-slate-100 shadow-md focus:ring-2 focus:ring-indigo-300 focus:outline-none transition-all placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Categories Tab selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap border-2 ${
                selectedCategory === cat.id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                  : "bg-[var(--bg-card)] border-slate-100 dark:border-slate-800 text-[var(--text-muted)] hover:text-[var(--text-main)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" /></div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)] text-sm italic">
            No digital resources match your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((res) => {
              const color = subjectColor[res.subject] || "#8b5cf6";
              return (
                <div
                  key={res.id}
                  className="bg-[var(--bg-card)] border-2 border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span
                        className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border tracking-wider"
                        style={{ color: color, borderColor: `${color}30`, backgroundColor: `${color}10` }}
                      >
                        {res.subject}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        4.8
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-[var(--text-heading)] mb-1.5 leading-snug">{res.title}</h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">{res.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]">
                        {res.type === "Video" ? <Video className="w-4 h-4" /> : <Book className="w-4 h-4" />}
                      </div>
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        {res.type} • {res.size}
                      </span>
                    </div>

                    <button
                      onClick={() => handleReadClick(res)}
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                      {res.type === "Video" ? "Watch" : "Read"} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </PortalLayout>
  );
}
