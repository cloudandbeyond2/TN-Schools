"use client";

import PortalLayout from "@/components/PortalLayout";
import { useState, useEffect } from "react";

const API_BASE = "http://localhost:5000";

interface Club {
  id: string;
  name: string;
  category: string;
  icon: string;
  themeColor: string;
}

interface ClubEvent {
  id: string;
  title: string;
  eventDate: string;
  type: string;
  icon: string;
  themeColor: string;
  clubId: string;
}

export default function TeacherEventsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [type, setType] = useState("Competition");
  const [clubId, setClubId] = useState("");
  const [icon, setIcon] = useState("🏆");
  const [themeColor, setThemeColor] = useState("text-amber-600 dark:text-amber-400");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/activities`);
      const json = await res.json();
      if (json.success) {
        setClubs(json.data.discoverClubs || []);
        setEvents(json.data.upcomingEvents || []);
        if (json.data.discoverClubs?.length > 0) {
          setClubId(json.data.discoverClubs[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/activities/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, eventDate, type, icon, themeColor, clubId
        })
      });
      const json = await res.json();
      if (json.success) {
        setEvents([...events, json.data].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()));
        setTitle("");
        setEventDate("");
        alert("Event scheduled successfully!");
      } else {
        alert("Error scheduling event.");
      }
    } catch (err) {
      console.error(err);
      alert("Error scheduling event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PortalLayout 
      title="Club Events Management" 
      subtitle="Schedule and manage extracurricular events for clubs" 
      themeClass="theme-teacher"
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 text-left">
        {/* Create Event Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Schedule New Event</h2>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Event Title</label>
              <input 
                required 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-amber-500 transition-colors"
                placeholder="e.g. Annual Science Fair"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Event Date</label>
              <input 
                required 
                type="date" 
                value={eventDate} 
                onChange={(e) => setEventDate(e.target.value)} 
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Associated Club</label>
              <select 
                required
                value={clubId} 
                onChange={(e) => setClubId(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-amber-500 transition-colors"
              >
                {clubs.map(club => (
                  <option key={club.id} value={club.id}>{club.name} ({club.category})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Event Type</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="School-wide">School-wide</option>
                    <option value="Competition">Competition</option>
                    <option value="Showcase">Showcase</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Icon (Emoji)</label>
                  <input 
                    required 
                    type="text" 
                    value={icon} 
                    onChange={(e) => setIcon(e.target.value)} 
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting || clubs.length === 0}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Scheduling..." : "Schedule Event"}
            </button>
            {clubs.length === 0 && <p className="text-xs text-red-500 text-center">A club must be created before scheduling events.</p>}
          </form>
        </div>

        {/* List of Events */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold mb-4">Upcoming Events ({events.length})</h2>
          {isLoading ? (
            <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[500px]">
              {events.map((event, idx) => {
                const club = clubs.find(c => c.id === event.clubId);
                return (
                <div key={event.id || idx} className="relative flex gap-4 pb-4">
                  {idx !== events.length - 1 && (
                    <div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-slate-200 dark:bg-slate-800"></div>
                  )}
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 z-10 text-sm">
                    {event.icon}
                  </div>
                  <div className="pt-1.5 bg-slate-50 dark:bg-slate-800/50 flex-1 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <h4 className="text-sm font-bold text-black dark:text-white leading-tight mb-1">{event.title}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mb-2">
                      <span>{new Date(event.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">{event.type}</span>
                    </p>
                    {club && (
                       <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white dark:bg-slate-700 text-[10px] font-bold border border-slate-200 dark:border-slate-600">
                         <span>{club.icon}</span> {club.name}
                       </div>
                    )}
                  </div>
                </div>
              )})}
              {events.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No upcoming events scheduled.</p>}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
