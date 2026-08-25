"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

interface Celebration {
  id: string;
  title: string;
  date: string;
  description: string | null;
  type: string; // "EVENT" or "HOLIDAY"
  createdAt?: string;
}

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

export default function HeadmasterCelebrationsPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const mySchoolId: string = (session?.user as any)?.schoolId || "";

  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter, Search & Pagination State
  const [filterType, setFilterType] = useState<"ALL" | "EVENT" | "HOLIDAY">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form State
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("EVENT");

  const handleStartEdit = (item: Celebration) => {
    setEditingId(item.id);
    setTitle(item.title);
    const dateOnly = item.date ? item.date.substring(0, 10) : "";
    setDate(dateOnly);
    setDescription(item.description || "");
    setType(item.type);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setDate("");
    setDescription("");
    setType("EVENT");
  };

  // Fetch celebrations scoped to headmaster's school
  const fetchCelebrations = useCallback(async () => {
    if (!mySchoolId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/celebrations?schoolId=${mySchoolId}`);
      const json = await res.json();
      if (json.success) {
        setCelebrations(json.data);
      } else {
        Swal.fire({
          title: "Error!",
          text: "Could not load celebrations from server.",
          icon: "error",
          confirmButtonColor: "#ef4444"
        });
      }
    } catch {
      Swal.fire({
        title: "Error!",
        text: "Server offline — could not load celebrations.",
        icon: "error",
        confirmButtonColor: "#ef4444"
      });
    } finally {
      setIsLoading(false);
    }
  }, [mySchoolId]);

  useEffect(() => {
    fetchCelebrations();
  }, [fetchCelebrations]);

  // Handle adding or updating celebration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !mySchoolId) {
      Swal.fire({
        title: "Incomplete Form",
        text: "Please fill in all required fields.",
        icon: "warning",
        confirmButtonColor: "#3b82f6"
      });
      return;
    }

    setIsSaving(true);
    try {
      const url = editingId ? `${API_BASE}/api/celebrations/${editingId}` : `${API_BASE}/api/celebrations`;
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date,
          description: description || null,
          type,
          schoolId: mySchoolId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire({
          title: "Success!",
          text: editingId ? "Celebration updated successfully! 🎉" : "Celebration added successfully! 🎉",
          icon: "success",
          confirmButtonColor: "#3b82f6"
        });
        handleCancelEdit();
        fetchCelebrations();
      } else {
        Swal.fire({
          title: "Save Failed",
          text: json.error,
          icon: "error",
          confirmButtonColor: "#ef4444"
        });
      }
    } catch {
      Swal.fire({
        title: "Error!",
        text: "Server offline — could not save celebration.",
        icon: "error",
        confirmButtonColor: "#ef4444"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle deleting celebration
  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3b82f6",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_BASE}/api/celebrations/${id}`, {
          method: "DELETE",
        });
        const json = await res.json();
        if (json.success) {
          Swal.fire({
            title: "Deleted!",
            text: "Celebration removed successfully.",
            icon: "success",
            confirmButtonColor: "#3b82f6"
          });
          fetchCelebrations();
        } else {
          Swal.fire({
            title: "Failed!",
            text: `Failed to delete: ${json.error}`,
            icon: "error",
            confirmButtonColor: "#ef4444"
          });
        }
      } catch {
        Swal.fire({
          title: "Error!",
          text: "Server offline — delete failed.",
          icon: "error",
          confirmButtonColor: "#ef4444"
        });
      }
    }
  };

  const filteredCelebrations = celebrations.filter((item) => {
    const matchesType = filterType === "ALL" || item.type === filterType;
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const totalPages = Math.ceil(filteredCelebrations.length / itemsPerPage) || 1;
  const paginatedCelebrations = filteredCelebrations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchQuery]);

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "கொண்டாட்டங்கள் மேலாளர்" : "Celebrations Manager"}
      subtitle={lang === "தமிழ்" ? "பள்ளி கொண்டாட்டங்கள், பண்டிகைகள் மற்றும் விடுமுறை நாட்களை நிர்வகிக்கவும்." : "Schedule school celebrations, festivals, and holidays."}
      avatarLetter="V"
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-left relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 bg-pink-50 dark:bg-pink-950/40 text-pink-500 rounded-xl shrink-0 border border-pink-100 dark:border-pink-900/50">
              <i className="fi fi-rr-party-horn text-xl" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {lang === "தமிழ்" ? "பள்ளி கொண்டாட்டங்கள் & நிகழ்வுகள் மையம்" : "School Celebrations & Events Hub"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed max-w-2xl">
                {lang === "தமிழ்"
                  ? "பள்ளி திருவிழாக்கள், தேசிய கொண்டாட்டங்கள் மற்றும் விடுமுறை நாட்களை அட்டவணைப்படுத்தி ஆசிரியர் தளத்துடன் ஒத்திசைக்கவும்."
                  : "Schedule and manage national festivals, annual day functions, sports meets, and government holidays across the school calendar."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 shrink-0 self-start md:self-auto">
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 px-4 py-2 rounded-2xl flex flex-col items-center min-w-[90px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">{lang === "தமிழ்" ? "நிகழ்வுகள்" : "Total Events"}</span>
              <span className="text-base font-bold text-pink-600 dark:text-pink-400 mt-0.5">{celebrations.length}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 px-4 py-2 rounded-2xl flex flex-col items-center min-w-[90px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">{lang === "தமிழ்" ? "விடுமுறைகள்" : "Holidays"}</span>
              <span className="text-base font-bold text-slate-800 dark:text-white mt-0.5">{celebrations.filter(c => c.type === "HOLIDAY").length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Celebration List */}
        <div className="lg:col-span-2 space-y-4">

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setFilterType("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterType === "ALL"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  {lang === "தமிழ்" ? "அனைத்தும்" : "All"} ({celebrations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("EVENT")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterType === "EVENT"
                      ? "bg-pink-600 text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  {lang === "தமிழ்" ? "நிகழ்வுகள்" : "Events"} ({celebrations.filter(c => c.type === "EVENT").length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("HOLIDAY")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterType === "HOLIDAY"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  {lang === "தமிழ்" ? "விடுமுறைகள்" : "Holidays"} ({celebrations.filter(c => c.type === "HOLIDAY").length})
                </button>
              </div>

              <div className="relative flex-1 max-w-xs">
                <i className="fi fi-rr-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder={lang === "தமிழ்" ? "தேடுங்கள்..." : "Search celebrations..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* List items */}
            {isLoading ? (
              <div className="glass rounded-2xl p-8 border border-slate-800 flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin mb-3" />
                <span className="text-xs text-slate-400 font-medium">{lang === "தமிழ்" ? "ஏற்றப்படுகிறது..." : "Loading celebrations..."}</span>
              </div>
            ) : filteredCelebrations.length === 0 ? (
              <div className="glass rounded-2xl p-8 border border-slate-800 text-center">
                <span className="text-3xl block mb-2">📅</span>
                <span className="text-xs text-slate-400 font-medium">{lang === "தமிழ்" ? "கொண்டாட்டங்கள் அல்லது நிகழ்வுகள் எதுவும் காணப்படவில்லை." : "No celebrations or events registered yet."}</span>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {paginatedCelebrations.map((item) => (
                  <div
                    key={item.id}
                    className="glass rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:border-slate-700 transition-colors animate-in fade-in duration-300"
                  >
                    <div className="flex items-start gap-4">
                      {/* Celebration Icon */}
                      <div className={`p-2.5 sm:p-3 rounded-xl shrink-0 border ${
                        item.type === "HOLIDAY" 
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                          : "bg-pink-500/10 text-pink-400 border-pink-500/20"
                      }`}>
                        {item.type === "HOLIDAY" ? (
                          <i className="fi fi-rr-gift text-base sm:text-lg" />
                        ) : (
                          <i className="fi fi-rr-party-horn text-base sm:text-lg" />
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.type === "HOLIDAY" ? (
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border bg-amber-500/15 text-amber-400 border-amber-500/20">
                              {lang === "தமிழ்" ? "அரசு விடுமுறை" : "Government Holiday"}
                            </span>
                          ) : (
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border bg-pink-500/15 text-pink-400 border-pink-500/20">
                              {lang === "தமிழ்" ? "பள்ளி நிகழ்வு" : "School Event"}
                            </span>
                          )}
                          <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold flex items-center gap-1">
                            <i className="fi fi-rr-calendar text-blue-400" />
                            {new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-white leading-tight">{item.title}</h3>
                        {item.description && (
                          <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed max-w-xl">{item.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(item)}
                        className="p-1.5 sm:p-2 border border-slate-700 hover:border-blue-500 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                        title={lang === "தமிழ்" ? "திருத்து" : "Edit Celebration"}
                      >
                        <i className="fi fi-rr-edit text-xs sm:text-sm" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 sm:p-2 border border-red-500/20 hover:border-red-500/50 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                        title={lang === "தமிழ்" ? "நீக்கு" : "Delete Celebration"}
                      >
                        <i className="fi fi-rr-trash text-xs sm:text-sm" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Bar */}
            {filteredCelebrations.length > itemsPerPage && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 font-medium">
                <span>
                  {lang === "தமிழ்" 
                    ? `மொத்தம் ${filteredCelebrations.length} இல் ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredCelebrations.length)} காட்டப்படுகிறது`
                    : `Showing ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredCelebrations.length)} of ${filteredCelebrations.length} items`}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs flex items-center gap-1"
                  >
                    <i className="fi fi-rr-angle-left text-xs" /> {lang === "தமிழ்" ? "முந்தைய" : "Previous"}
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-xl text-xs font-bold transition-all ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white shadow-sm"
                          : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs flex items-center gap-1"
                  >
                    {lang === "தமிழ்" ? "அடுத்தது" : "Next"} <i className="fi fi-rr-angle-right text-xs" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Creation Form */}
          <div className="glass rounded-2xl p-4 sm:p-6 border border-slate-800 h-fit">
            <h2 className="text-sm sm:text-base font-semibold mb-2 flex items-center gap-2">
              {editingId ? (
                <i className="fi fi-rr-edit text-blue-500 text-base" />
              ) : (
                <i className="fi fi-rr-plus text-blue-500 text-base" />
              )}
              {editingId ? (lang === "தமிழ்" ? "நிகழ்வு / கொண்டாட்டம் திருத்து" : "Edit Event / Celebration") : (lang === "தமிழ்" ? "நிகழ்வு / கொண்டாட்டம் சேர்" : "Add Event / Celebration")}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-555 leading-relaxed mb-4">
              {editingId ? (lang === "தமிழ்" ? "தேர்ந்தெடுக்கப்பட்ட கொண்டாட்டத்தின் விவரங்களை மாற்றவும்." : "Modify the details of the selected celebration.") : (lang === "தமிழ்" ? "பள்ளி கொண்டாட்டங்கள் அல்லது பண்டிகைகளை திட்டமிடுங்கள்." : "Schedule school celebrations or festivals.")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] sm:text-[10px] text-slate-400 mb-1 sm:mb-1.5 font-bold uppercase tracking-wider">{lang === "தமிழ்" ? "தலைப்பு *" : "Title *"}</label>
                <input
                  type="text"
                  placeholder={lang === "தமிழ்" ? "எ.கா., ஆண்டு விழா, விளையாட்டு விழா" : "E.g., Annual Day, Sports Festival"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] sm:text-[10px] text-slate-400 mb-1 sm:mb-1.5 font-bold uppercase tracking-wider">{lang === "தமிழ்" ? "தேதி *" : "Date *"}</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] sm:text-[10px] text-slate-400 mb-1 sm:mb-1.5 font-bold uppercase tracking-wider">{lang === "தமிழ்" ? "வகை *" : "Type *"}</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="EVENT">{lang === "தமிழ்" ? "பள்ளி நிகழ்வு" : "School Event"}</option>
                  <option value="HOLIDAY">{lang === "தமிழ்" ? "அரசு விடுமுறை" : "Government Holiday"}</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] sm:text-[10px] text-slate-400 mb-1 sm:mb-1.5 font-bold uppercase tracking-wider">{lang === "தமிழ்" ? "குறிப்புகள் / விளக்கம்" : "Remarks / Description"}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={lang === "தமிழ்" ? "எ.கா., காலை 9 மணிக்கு தலைமையாசிரியர் உரை. மதிய உணவிற்கு பின் கலை நிகழ்ச்சிகள்." : "E.g., Principal speech at 9 AM. Cultural events after lunch."}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-[11px] sm:text-xs transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <i className="fi fi-rr-spinner animate-spin text-xs" />{" "}
                      {editingId ? (lang === "தமிழ்" ? "புதுப்பிக்கப்படுகிறது..." : "Updating...") : (lang === "தமிழ்" ? "சேமிக்கப்படுகிறது..." : "Saving...")}
                    </>
                  ) : (
                    <>
                      <i className="fi fi-rr-check text-xs" />{" "}
                      {editingId ? (lang === "தமிழ்" ? "திருத்தங்களைச் சேமி" : "Update Celebration") : (lang === "தமிழ்" ? "போர்ட்டலில் சேர்" : "Add to Portal")}
                    </>
                  )}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-[11px] sm:text-xs transition-colors border border-slate-750"
                  >
                    {lang === "தமிழ்" ? "திருத்தத்தை ரத்துசெய்" : "Cancel Edit"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
    </PortalLayout>
  );
}
