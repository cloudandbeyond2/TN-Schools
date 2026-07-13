"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

interface Club {
  id: string;
  name: string;
  category: string;
  icon: string;
  themeColor: string;
  sponsor: string;
  meetingTime: string;
  description: string;
}

const flaticonOptions = [
  { label: "🌱 Leaf (Environment)", value: "fi fi-rr-leaf" },
  { label: "🌍 Globe (Environment)", value: "fi fi-rr-globe" },
  { label: "🎨 Palette (Arts)", value: "fi fi-rr-palette" },
  { label: "🎵 Music Note (Arts)", value: "fi fi-rr-music" },
  { label: "🔬 Flask (Science)", value: "fi fi-rr-flask" },
  { label: "💻 Computer (Science)", value: "fi fi-rr-laptop" },
  { label: "📚 Book Reader (Literature)", value: "fi fi-rr-book-open-reader" },
  { label: "🎓 Graduation Cap (Academics)", value: "fi fi-rr-graduation-cap" },
  { label: "🧮 Calculator (Academics)", value: "fi fi-rr-calculator" },
  { label: "🏆 Trophy (Sports)", value: "fi fi-rr-trophy" }
];

export default function HeadmasterClubsPage() {
  const { data: session } = useSession();
  const schoolId: string = (session?.user as any)?.schoolId || "";

  const [clubs, setClubs] = useState<Club[]>([]);
  const [teachers, setTeachers] = useState<{ id: string, name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Environment");
  const [icon, setIcon] = useState("fi fi-rr-leaf");
  const [themeColor, setThemeColor] = useState("text-emerald-650 dark:text-emerald-450");
  const [themeBg, setThemeBg] = useState("bg-emerald-500/10 border-emerald-500/20");
  const [themeTagBg, setThemeTagBg] = useState("bg-emerald-500/20");
  const [description, setDescription] = useState("");
  const [sponsor, setSponsor] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto map theme classes when category changes for rich styling
  useEffect(() => {
    switch (category) {
      case "Environment":
        setIcon("fi fi-rr-leaf");
        setThemeColor("text-emerald-500 dark:text-emerald-400");
        setThemeBg("bg-emerald-500/10 border-emerald-500/20");
        setThemeTagBg("bg-emerald-500/20");
        break;
      case "Arts":
        setIcon("fi fi-rr-palette");
        setThemeColor("text-amber-500 dark:text-amber-400");
        setThemeBg("bg-amber-500/10 border-amber-500/20");
        setThemeTagBg("bg-amber-500/20");
        break;
      case "Science":
        setIcon("fi fi-rr-flask");
        setThemeColor("text-purple-500 dark:text-purple-400");
        setThemeBg("bg-purple-500/10 border-purple-500/20");
        setThemeTagBg("bg-purple-500/20");
        break;
      case "Literature":
        setIcon("fi fi-rr-book-open-reader");
        setThemeColor("text-blue-500 dark:text-blue-400");
        setThemeBg("bg-blue-500/10 border-blue-500/20");
        setThemeTagBg("bg-blue-500/20");
        break;
      case "Academics":
        setIcon("fi fi-rr-graduation-cap");
        setThemeColor("text-indigo-500 dark:text-indigo-400");
        setThemeBg("bg-indigo-500/10 border-indigo-500/20");
        setThemeTagBg("bg-indigo-500/20");
        break;
      case "Sports":
        setIcon("fi fi-rr-trophy");
        setThemeColor("text-orange-500 dark:text-orange-400");
        setThemeBg("bg-orange-500/10 border-orange-500/20");
        setThemeTagBg("bg-orange-500/20");
        break;
      default:
        setIcon("fi fi-rr-users");
        setThemeColor("text-slate-500 dark:text-slate-400");
        setThemeBg("bg-slate-500/10 border-slate-500/20");
        setThemeTagBg("bg-slate-500/20");
    }
  }, [category]);

  const fetchClubs = useCallback(async () => {
    if (!schoolId) return;
    try {
      const res = await fetch(`${API_BASE}/api/activities?schoolId=${schoolId}`);
      const json = await res.json();
      if (json.success) {
        setClubs(json.data.discoverClubs || []);
      }
    } catch (err) {
      console.error("Failed to fetch clubs:", err);
    } finally {
      setIsLoading(false);
    }
  }, [schoolId]);

  const fetchTeachers = useCallback(async () => {
    if (!schoolId) return;
    try {
      const res = await fetch(`${API_BASE}/api/teacher/list?schoolId=${schoolId}`);
      const json = await res.json();
      if (json.success) {
        setTeachers(json.data || []);
        if (json.data && json.data.length > 0) {
          setSponsor(json.data[0].name);
        }
      }
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchClubs();
    fetchTeachers();
  }, [fetchClubs, fetchTeachers]);

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/activities/clubs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          icon,
          themeColor,
          themeBg,
          themeTagBg,
          description,
          sponsor,
          meetingTime,
          schoolId
        })
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire({
          title: "Club Created!",
          text: `"${name}" has been successfully registered.`,
          icon: "success",
          confirmButtonColor: "#3b82f6"
        });
        setName("");
        setDescription("");
        setMeetingTime("");
        fetchClubs();
      } else {
        Swal.fire("Error", json.error || "Failed to create club.", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Server error during club registration.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryThemeClass = (cat: string) => {
    switch (cat) {
      case "Environment": return "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400";
      case "Arts": return "bg-amber-500/10 border-amber-500/20 text-amber-500 dark:text-amber-400";
      case "Science": return "bg-purple-500/10 border-purple-500/20 text-purple-500 dark:text-purple-400";
      case "Literature": return "bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400";
      case "Academics": return "bg-indigo-500/10 border-indigo-500/20 text-indigo-500 dark:text-indigo-400";
      case "Sports": return "bg-orange-500/10 border-orange-500/20 text-orange-500 dark:text-orange-400";
      default: return "bg-slate-500/10 border-slate-500/20 text-slate-500 dark:text-slate-400";
    }
  };

  return (
    <PortalLayout 
      title="Clubs & Activities Management" 
      subtitle="Create and manage extracurricular clubs for the school" 
      themeClass="theme-headmaster"
      avatarLetter="V"
      avatarColor="#3b82f6"
      accentColor="#3b82f6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        {/* Create Club Form */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
          <h2 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
            <i className="fi fi-rr-add-document text-blue-500" /> Add New Club
          </h2>
          <form onSubmit={handleCreateClub} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">Club Name</label>
              <input 
                required 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors text-slate-800 dark:text-white"
                placeholder="e.g. Eco Warriors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-900 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors text-slate-800 dark:text-white cursor-pointer"
                >
                  <option value="Environment">Environment</option>
                  <option value="Arts">Arts</option>
                  <option value="Science">Science</option>
                  <option value="Literature">Literature</option>
                  <option value="Academics">Academics</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">Icon Visual</label>
                <select 
                  value={icon} 
                  onChange={(e) => setIcon(e.target.value)} 
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-900 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors text-slate-800 dark:text-white cursor-pointer"
                >
                  {flaticonOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">Faculty Sponsor</label>
              <select 
                required 
                value={sponsor} 
                onChange={(e) => setSponsor(e.target.value)} 
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-900 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors text-slate-800 dark:text-white cursor-pointer"
              >
                {teachers.length === 0 && <option value="">Loading school staff...</option>}
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">Meeting Time</label>
              <input 
                required 
                type="text" 
                value={meetingTime} 
                onChange={(e) => setMeetingTime(e.target.value)} 
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors text-slate-800 dark:text-white"
                placeholder="e.g. Every Friday at 4 PM"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">About the Club</label>
              <textarea 
                required 
                rows={3}
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors custom-scrollbar resize-none text-slate-800 dark:text-white"
                placeholder="Describe the club's activities and goals..."
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || !schoolId}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 text-xs disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Club"}
            </button>
          </form>
        </div>

        {/* List of Clubs */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
            <i className="fi fi-rr-users text-blue-500" /> Existing Clubs ({clubs.length})
          </h2>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 text-xs gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
              <span>Loading clubs...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
              {clubs.map(club => (
                <div 
                  key={club.id} 
                  className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex gap-3 hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.01] transition-all duration-300 bg-slate-50/50 dark:bg-slate-900/40"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${getCategoryThemeClass(club.category)}`}>
                    {club.icon && club.icon.startsWith("fi ") ? (
                      <i className={`${club.icon} text-lg`} />
                    ) : (
                      <span className="text-lg">{club.icon || "🌱"}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold leading-tight text-slate-800 dark:text-white text-xs truncate">{club.name}</h3>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {club.category}
                    </span>
                    <div className="mt-2 space-y-1 text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                      <div><strong>Sponsor:</strong> {club.sponsor}</div>
                      <div><strong>Meets:</strong> {club.meetingTime}</div>
                      <p className="mt-1 line-clamp-2 text-slate-400 leading-relaxed">{club.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              {clubs.length === 0 && (
                <div className="sm:col-span-2 text-center py-16 text-slate-550 dark:text-slate-400 italic text-xs">
                  No clubs registered for this school yet. Use the registration form on the left.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
