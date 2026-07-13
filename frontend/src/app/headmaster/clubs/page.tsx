"use client";

import PortalLayout from "@/components/PortalLayout";
import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Club {
  id: string;
  name: string;
  category: string;
  icon: string;
  themeColor: string;
}

export default function HeadmasterClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [teachers, setTeachers] = useState<{ id: string, name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Environment");
  const [icon, setIcon] = useState("🌱");
  const [themeColor, setThemeColor] = useState("text-emerald-600 dark:text-emerald-400");
  const [themeBg, setThemeBg] = useState("bg-emerald-500/10 border-emerald-500/20");
  const [themeTagBg, setThemeTagBg] = useState("bg-emerald-500/20");
  const [description, setDescription] = useState("");
  const [sponsor, setSponsor] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClubs();
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/teacher/list`);
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
  };

  const fetchClubs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/activities`);
      const json = await res.json();
      if (json.success) {
        setClubs(json.data.discoverClubs || []);
      }
    } catch (err) {
      console.error("Failed to fetch clubs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/activities/clubs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, category, icon, themeColor, themeBg, themeTagBg, description, sponsor, meetingTime
        })
      });
      const json = await res.json();
      if (json.success) {
        setClubs([...clubs, json.data]);
        setName("");
        alert("Club created successfully!");
      } else {
        alert("Error creating club.");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating club.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PortalLayout 
      title="Clubs & Activities Management" 
      subtitle="Create and manage extracurricular clubs for the school" 
      themeClass="theme-headmaster"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {/* Create Club Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Add New Club</h2>
          <form onSubmit={handleCreateClub} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Club Name</label>
              <input 
                required 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. Eco Warriors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-blue-500 transition-colors"
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
              <label className="block text-sm font-semibold mb-1">Icon (Emoji)</label>
              <input 
                required 
                type="text" 
                value={icon} 
                onChange={(e) => setIcon(e.target.value)} 
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Faculty Sponsor</label>
              <select 
                required 
                value={sponsor} 
                onChange={(e) => setSponsor(e.target.value)} 
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-blue-500 transition-colors"
              >
                {teachers.length === 0 && <option value="">Loading teachers...</option>}
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Meeting Time</label>
              <input 
                required 
                type="text" 
                value={meetingTime} 
                onChange={(e) => setMeetingTime(e.target.value)} 
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. Every Friday at 4 PM"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">About the Club</label>
              <textarea 
                required 
                rows={3}
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-blue-500 transition-colors custom-scrollbar"
                placeholder="Describe the club's activities and goals..."
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
            >
              {isSubmitting ? "Creating..." : "Create Club"}
            </button>
          </form>
        </div>

        {/* List of Clubs */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Existing Clubs ({clubs.length})</h2>
          {isLoading ? (
            <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {clubs.map(club => (
                <div key={club.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0">
                    {club.icon}
                  </div>
                  <div>
                    <h3 className="font-bold leading-tight">{club.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{club.category}</p>
                  </div>
                </div>
              ))}
              {clubs.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No clubs created yet.</p>}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
