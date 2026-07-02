"use client";

import { useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { BookOpen, Search, Book, Video, Download, ArrowRight, Star } from "lucide-react";

export default function DigitalLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Resources" },
    { id: "textbooks", label: "Textbooks" },
    { id: "reference", label: "Reference Books" },
    { id: "videos", label: "Video Lessons" },
  ];

  const resources = [
    {
      id: "1",
      title: "Class 10 - Mathematics Textbook",
      category: "textbooks",
      subject: "Mathematics",
      rating: 4.8,
      type: "pdf",
      size: "12.4 MB",
      desc: "Full textbook covering Algebra, Geometry, Trigonometry, and Statistics.",
      accent: "#3b82f6",
    },
    {
      id: "2",
      title: "Concepts of Physics (Vol 1)",
      category: "reference",
      subject: "Physics",
      rating: 4.9,
      type: "pdf",
      size: "18.1 MB",
      desc: "Detailed explanations of mechanics, wave motion, and heat.",
      accent: "#ec4899",
    },
    {
      id: "3",
      title: "Organic Chemistry Made Easy",
      category: "reference",
      subject: "Chemistry",
      rating: 4.7,
      type: "pdf",
      size: "8.5 MB",
      desc: "A simplified student guide to hydrocarbon structures and functional groups.",
      accent: "#10b981",
    },
    {
      id: "4",
      title: "Understanding Ecosystems & Biodiversity",
      category: "videos",
      subject: "Biology",
      rating: 4.9,
      type: "video",
      size: "15 min",
      desc: "Video simulation of trophic levels and conservation strategies.",
      accent: "#eab308",
    },
    {
      id: "5",
      title: "Tamil Literature - Classical Poetry",
      category: "textbooks",
      subject: "Tamil",
      rating: 4.6,
      type: "pdf",
      size: "6.2 MB",
      desc: "Anthology of Sangam poetry and modern compositions with annotations.",
      accent: "#a855f7",
    },
    {
      id: "6",
      title: "Modern World History & India",
      category: "textbooks",
      subject: "Social Science",
      rating: 4.5,
      type: "pdf",
      size: "14.3 MB",
      desc: "Comprehensive review of the Indian national movement and post-independence events.",
      accent: "#f97316",
    },
  ];

  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || res.category === selectedCategory;
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="bg-[var(--bg-card)] border-2 border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span
                    className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border tracking-wider"
                    style={{ color: res.accent, borderColor: `${res.accent}30`, backgroundColor: `${res.accent}10` }}
                  >
                    {res.subject}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    {res.rating}
                  </div>
                </div>

                <h3 className="text-base font-bold text-[var(--text-heading)] mb-1.5 leading-snug">{res.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">{res.desc}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]">
                    {res.type === "pdf" ? <Book className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {res.type} • {res.size}
                  </span>
                </div>

                <button
                  onClick={() => alert(`Opening "${res.title}"...`)}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  {res.type === "pdf" ? "Read" : "Watch"} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filteredResources.length === 0 && (
            <div className="col-span-full text-center py-12 text-[var(--text-muted)] text-sm italic">
              No digital resources match your criteria.
            </div>
          )}
        </div>

      </div>
    </PortalLayout>
  );
}
