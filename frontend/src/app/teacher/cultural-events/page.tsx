"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import {
  Palette,
  Music,
  Tent,
  Ticket,
  MapPin,
  CalendarHeart,
  X,
  Sparkles,
  Heart,
  Camera,
  Star,
  Plus,
  Pencil,
  Trash2
} from "lucide-react";

type CulturalEvent = {
  id: string;
  title: string;
  eventDate: string;
  location: string;
  description: string;
  status: string;
  schoolId: string;
};

export default function CulturalEventsPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [events, setEvents] = useState<CulturalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal for registering students
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  // Modal for creating/editing event
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<CulturalEvent | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!schoolId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/teacher/cultural-events?schoolId=${schoolId}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setLoading(false);
    }
  }, [schoolId, API_URL]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterModalOpen(false);
    Swal.fire({
      title: "Registered!",
      text: "Yay! You are registered for the event! 🎉",
      icon: "success",
      confirmButtonColor: "#f43f5e"
    });
  };

  const handleOpenCreate = () => {
    setIsEdit(false);
    setCurrentEvent(null);
    setEventModalOpen(true);
  };

  const handleOpenEdit = (evt: CulturalEvent) => {
    setIsEdit(true);
    setCurrentEvent(evt);
    setEventModalOpen(true);
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    const result = await Swal.fire({
      title: "Delete Event?",
      text: `Are you sure you want to cancel "${title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f43f5e",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, cancel it! 🗑️"
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/teacher/cultural-events/${id}?schoolId=${schoolId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        Swal.fire({
          title: "Cancelled!",
          text: `"${title}" has been cancelled.`,
          icon: "success",
          confirmButtonColor: "#f43f5e"
        });
        fetchEvents();
      }
    } catch (err) {
      console.error("Failed to delete event", err);
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const payload = {
      title: formData.get("title"),
      eventDate: formData.get("eventDate"),
      location: formData.get("location"),
      description: formData.get("description") || "A wonderful cultural event!",
      status: formData.get("status"),
      schoolId
    };

    try {
      let url = `${API_URL}/api/teacher/cultural-events`;
      let method = "POST";

      if (isEdit && currentEvent) {
        url = `${API_URL}/api/teacher/cultural-events/${currentEvent.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setEventModalOpen(false);
        Swal.fire({
          title: "Success!",
          text: isEdit ? "Event updated successfully! ✨" : "New event created! 🎉",
          icon: "success",
          confirmButtonColor: "#f43f5e"
        });
        fetchEvents();
      }
    } catch (err) {
      console.error("Failed to save event", err);
    }
  };

  // Helper to pick icon and color based on title or status
  const getEventStyle = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("art") || t.includes("paint")) return { icon: <Palette className="w-6 h-6" />, color: "purple" };
    if (t.includes("music") || t.includes("choir")) return { icon: <Music className="w-6 h-6" />, color: "blue" };
    if (t.includes("pongal") || t.includes("heritage")) return { icon: <Tent className="w-6 h-6" />, color: "orange" };
    return { icon: <Star className="w-6 h-6" />, color: "rose" };
  };

  return (
    <PortalLayout
      title="Culture & Fun! 🎭"
      subtitle="Join the dance, art, and music festivals!"
    >
      <div className="flex flex-col gap-8">

        {/* Clean White Card Featured Event Hero */}
        <div className="relative rounded-[3rem] overflow-hidden shadow-xl bg-white dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-700 min-h-[350px] flex flex-col justify-end p-8 sm:p-12">
          
          {/* Subtle Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-50 dark:bg-rose-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 z-0"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-50 dark:bg-amber-900/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 z-0"></div>

          <div className="absolute top-10 right-10 rotate-12 opacity-80 z-10">
            <Camera className="w-32 h-32 text-slate-100 dark:text-slate-700/50" />
          </div>

          <div className="relative z-20 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 px-4 py-2 mb-4 font-black tracking-widest text-xs uppercase rounded-2xl shadow-sm rotate-[-2deg] border-2 border-yellow-200 dark:border-yellow-700/50">
              <Star className="w-4 h-4" /> The Big Event!
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-800 dark:text-white mb-4 tracking-tight drop-shadow-sm">Tamil Heritage Month ✨</h2>
            <p className="text-slate-600 dark:text-slate-300 font-bold mb-8 text-sm md:text-lg leading-relaxed">
              Let's celebrate our rich culture together! There will be yummy food, beautiful dances, traditional games, and lots of fun!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={() => setRegisterModalOpen(true)} className="w-full py-4 bg-rose-500 text-white font-black text-sm rounded-2xl transition-all shadow-md shadow-rose-500/30 hover:bg-rose-600 hover:scale-105 active:scale-95 border-b-4 border-rose-700 flex items-center justify-center gap-2">
                Join the Fun! 🎫
              </button>
              <button onClick={() => Swal.fire({ title: 'Schedule', text: 'Downloading the fun schedule! 📅', icon: 'info' })} className="w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-sm rounded-2xl transition-all shadow-sm hover:bg-slate-200 dark:hover:bg-slate-600 border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center gap-2">
                See What's Happening
              </button>
              <button onClick={handleOpenCreate} className="w-full py-4 bg-emerald-400 text-emerald-900 font-black text-sm rounded-2xl transition-all shadow-md shadow-emerald-400/30 hover:scale-105 active:scale-95 border-b-4 border-emerald-600 flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /> Add New Event
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Events Grid */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border-4 border-purple-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl rotate-[-5deg]">
                <CalendarHeart className="w-6 h-6" />
              </div>
              Cool Upcoming Stuff
            </h3>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-1 xl:col-span-3 text-center py-10 font-bold text-slate-500">Loading events... ⏳</div>
            ) : events.length === 0 ? (
              <div className="col-span-1 xl:col-span-3 text-center py-10 font-bold text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-3xl border-4 border-dashed border-slate-200 dark:border-slate-700">No events yet! Go add some! 🎉</div>
            ) : events.map((evt, i) => {
              const { icon, color } = getEventStyle(evt.title);
              return (
                <div key={i} className={`p-6 rounded-[2.5rem] border-4 border-${color}-100 dark:border-slate-700 hover:border-${color}-300 bg-${color}-50/50 hover:bg-${color}-50 dark:bg-slate-900/50 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 flex flex-col h-full group relative`}>

                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={() => handleOpenEdit(evt)} className="p-2 bg-white dark:bg-slate-800 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors shadow-sm border border-slate-200 dark:border-slate-700">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteEvent(evt.id, evt.title)} className="p-2 bg-white dark:bg-slate-800 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors shadow-sm border border-slate-200 dark:border-slate-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-${color}-200 text-${color}-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform shadow-inner`}>
                      {icon}
                    </div>
                    <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-xl border-2 bg-white dark:bg-slate-800 text-${color}-600 border-${color}-200 shadow-sm rotate-3`}>
                      {evt.status}
                    </span>
                  </div>

                  <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-4 pr-16">{evt.title}</h4>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{evt.description}</p>

                  <div className="space-y-3 mt-auto text-sm font-bold text-slate-500 bg-white dark:bg-slate-800 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 bg-${color}-100 rounded-lg text-${color}-600`}>
                        <CalendarHeart className="w-4 h-4" />
                      </div>
                      {new Date(evt.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 bg-${color}-100 rounded-lg text-${color}-600`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      {evt.location}
                    </div>
                  </div>

                  <div className="mt-6">
                    <button onClick={() => setRegisterModalOpen(true)} className={`w-full py-3 rounded-2xl text-sm font-black text-white bg-${color}-500 hover:bg-${color}-600 transition-colors shadow-md shadow-${color}-500/30 active:scale-95 flex items-center justify-center gap-2 border-b-4 border-${color}-700`}>
                      <Ticket className="w-4 h-4" /> Get Tickets!
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* Fun Register Students Modal */}
      {registerModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] w-full max-w-md shadow-2xl border-4 border-rose-200 dark:border-slate-700 animate-in zoom-in-95 p-3">
            <div className="flex justify-between items-center p-6 bg-rose-50 dark:bg-slate-900 rounded-[2.5rem] mb-6">
              <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">Join the Party!</h3>
              <button onClick={() => setRegisterModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 hover:scale-110 transition-all shadow-sm">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleRegister} className="p-4 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Which Event? 🎭</label>
                <select required name="event" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-4 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-300 transition-all">
                  {events.map((e) => (
                    <option key={e.id} value={e.title}>{e.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Class 🎒</label>
                  <input required name="class" type="text" placeholder="e.g., 9th A" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-4 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-300 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">How Many? 🧑‍🤝‍🧑</label>
                  <input required name="count" type="number" min="1" max="60" placeholder="10" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-4 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-300 transition-all" />
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setRegisterModalOpen(false)} className="flex-1 py-4 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-2 border-slate-200 dark:border-slate-700">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-4 rounded-2xl text-sm font-black text-grey bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/30 active:scale-95 border-b-4 border-rose-700">
                  Register! 🎉
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Event Modal */}
      {eventModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[3rem] w-full max-w-md shadow-2xl border-4 border-purple-200 dark:border-slate-700 animate-in zoom-in-95 p-3">
            <div className="flex justify-between items-center p-6 bg-purple-50 dark:bg-slate-900 rounded-[2.5rem] mb-6">
              <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {isEdit ? "Edit Event 🎨" : "New Event! 🎪"}
              </h3>
              <button onClick={() => setEventModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-purple-500 hover:scale-110 transition-all shadow-sm">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveEvent} className="p-4 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Event Title ✨</label>
                <input required name="title" defaultValue={currentEvent?.title} type="text" placeholder="e.g., Annual Arts Fest" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-4 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Description 📝</label>
                <textarea required name="description" defaultValue={currentEvent?.description} placeholder="What's this event about?" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-4 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all resize-none h-24" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Date 📅</label>
                  <input required name="eventDate" defaultValue={currentEvent ? new Date(currentEvent.eventDate).toISOString().substring(0, 10) : ""} type="date" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-4 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Location 📍</label>
                  <input required name="location" defaultValue={currentEvent?.location} type="text" placeholder="e.g., Auditorium" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-4 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Status 🎯</label>
                <select required name="status" defaultValue={currentEvent?.status || "Upcoming"} className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-4 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all">
                  <option value="Upcoming">Upcoming ⏳</option>
                  <option value="Planning">Planning 📝</option>
                  <option value="Open Now!">Open Now! 🎉</option>
                </select>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setEventModalOpen(false)} className="flex-1 py-4 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-2 border-slate-200 dark:border-slate-700">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-4 rounded-2xl text-sm font-black text-grey bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg shadow-purple-500/30 active:scale-95 border-b-4 border-purple-700">
                  {isEdit ? "Update Event" : "Create Event!"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </PortalLayout>
  );
}
