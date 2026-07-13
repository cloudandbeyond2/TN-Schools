"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";

// Removed lucide-react imports to use Flaticons exclusively

type CulturalEvent = {
  id: string;
  title: string;
  eventDate: string;
  location: string;
  description: string;
  status: string;
};

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

export default function StudentCulturalEventsPage() {
  const { data: session } = useSession();
  const schoolId: string = (session?.user as any)?.schoolId || "";
  const studentClass: string = (session?.user as any)?.classId || "9th A";

  const [events, setEvents] = useState<CulturalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/teacher/cultural-events?schoolId=${schoolId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setEvents(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const eventName = formData.get("event") as string;
    const cls = formData.get("class") as string;
    const count = formData.get("count") as string;

    setRegisterModalOpen(false);

    Swal.fire({
      title: "Successfully Registered!",
      text: `Yay! You registered class ${cls} with ${count} students for the event "${eventName}"! 🎉`,
      icon: "success",
      confirmButtonText: "Awesome!",
      confirmButtonColor: "#f43f5e"
    });
  };

  // Helper to pick icon and color based on title or status
  const getEventStyle = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("art") || t.includes("paint")) return { icon: <i className="fi fi-rr-palette text-xl" />, color: "purple" };
    if (t.includes("music") || t.includes("choir")) return { icon: <i className="fi fi-rr-music text-xl" />, color: "blue" };
    if (t.includes("pongal") || t.includes("heritage")) return { icon: <i className="fi fi-rr-shop text-xl" />, color: "orange" };
    return { icon: <i className="fi fi-rr-star text-xl" />, color: "rose" };
  };

  return (
    <PortalLayout
      title="Culture & Fun! "
      subtitle="Join the dance, art, and music festivals!"
    >
      <div className="flex flex-col gap-6 sm:gap-8 text-left">

        {/* Clean White Card Featured Event Hero */}
        <div className="relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-xl bg-white dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-700 min-h-[300px] sm:min-h-[350px] flex flex-col justify-end p-6 sm:p-12">
          
          {/* Subtle Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-50 dark:bg-rose-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 z-0"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-50 dark:bg-amber-900/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 z-0"></div>

          <div className="absolute top-10 right-10 rotate-12 opacity-85 z-10 hidden sm:block">
            <i className="fi fi-rr-camera text-slate-100 dark:text-slate-700/50 text-[120px]" />
          </div>

          <div className="relative z-20 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 px-3 py-1.5 sm:px-4 sm:py-2 mb-3 sm:mb-4 font-black tracking-widest text-[10px] sm:text-xs uppercase rounded-xl sm:rounded-2xl shadow-sm rotate-[-2deg] border-2 border-yellow-200 dark:border-yellow-700/50">
              <i className="fi fi-rr-star text-xs" /> The Big Event!
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 dark:text-white mb-3 sm:mb-4 tracking-tight drop-shadow-sm flex items-center gap-2">
              Tamil Heritage Month <i className="fi fi-rr-magic-wand text-pink-500 text-xl sm:text-2xl" />
            </h2>
            <p className="text-slate-650 dark:text-slate-350 font-bold mb-6 sm:mb-8 text-xs sm:text-sm md:text-base leading-relaxed">
              Let's celebrate our rich culture together! There will be yummy food, beautiful dances, traditional games, and lots of fun!
            </p>
          </div>
        </div>

        {/* Upcoming Events Grid */}
        <div className="bg-white dark:bg-slate-800 p-5 sm:p-8 rounded-[2rem] sm:rounded-[3rem] shadow-xl border-4 border-purple-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-purple-100 text-purple-600 rounded-xl sm:rounded-2xl rotate-[-5deg]">
                <i className="fi fi-rr-calendar-heart text-base sm:text-xl" />
              </div>
              Cool Upcoming Stuff
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {loading ? (
              <div className="col-span-1 lg:col-span-3 text-center py-10 font-bold text-slate-500">
                Loading events... <i className="fi fi-rr-hourglass text-sm animate-spin inline-block ml-1" />
              </div>
            ) : events.length === 0 ? (
              <div className="col-span-1 lg:col-span-3 text-center py-10 font-bold text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-3xl border-4 border-dashed border-slate-200 dark:border-slate-700">
                No events scheduled. <i className="fi fi-rr-party-horn text-sm inline-block ml-1 animate-bounce" />
              </div>
            ) : events.map((evt, i) => {
              const { icon, color } = getEventStyle(evt.title);
              return (
                <div key={i} className={`p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border-4 border-${color}-100 dark:border-slate-700 hover:border-${color}-300 bg-${color}-50/50 hover:bg-${color}-50 dark:bg-slate-900/50 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 flex flex-col h-full group relative`}>

                  <div className="flex justify-between items-start mb-4 sm:mb-6">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-${color}-200 text-${color}-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-transform shadow-inner`}>
                      {icon}
                    </div>
                    <span className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-lg sm:rounded-xl border-2 bg-white dark:bg-slate-800 text-${color}-600 border-${color}-200 shadow-sm rotate-3`}>
                      {evt.status}
                    </span>
                  </div>

                  <h4 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 mb-3 sm:mb-4 pr-16">{evt.title}</h4>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">{evt.description}</p>

                  <div className="space-y-2 sm:space-y-3 mt-auto text-xs sm:text-sm font-bold text-slate-500 bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 bg-${color}-100 rounded-lg text-${color}-600`}>
                        <i className="fi fi-rr-calendar-heart text-xs sm:text-sm" />
                      </div>
                      {new Date(evt.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 bg-${color}-100 rounded-lg text-${color}-600`}>
                        <i className="fi fi-rr-marker text-xs sm:text-sm" />
                      </div>
                      {(() => {
                        try {
                          const parsed = JSON.parse(evt.location);
                          return parsed.coordinator ? `Coord: ${parsed.coordinator}` : (parsed.category || "School");
                        } catch {
                          return evt.location;
                        }
                      })()}
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6 text-center text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center gap-1.5 shadow-sm">
                    <i className="fi fi-rr-info text-blue-500 text-sm" />
                    <span>Contact Staff to register & get tickets</span>
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
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] sm:rounded-[3rem] w-full max-w-md shadow-2xl border-4 border-rose-200 dark:border-slate-700 animate-in zoom-in-95 p-3">
            <div className="flex justify-between items-center p-4 sm:p-6 bg-rose-50 dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2.5rem] mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">Join the Party!</h3>
              <button onClick={() => setRegisterModalOpen(false)} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-rose-500 hover:scale-110 transition-all shadow-sm">
                <i className="fi fi-rr-cross-small text-base sm:text-lg" />
              </button>
            </div>
            <form onSubmit={handleRegister} className="p-2 sm:p-4 space-y-4 sm:space-y-6">
              <div>
                <label className="block text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                  Which Event? <i className="fi fi-rr-ticket text-xs sm:text-sm inline-block ml-1" />
                </label>
                <select required name="event" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-3 px-3 sm:py-4 sm:px-4 text-xs sm:text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-300 transition-all">
                  {events.map((e) => (
                    <option key={e.id} value={e.title}>{e.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                    Class <i className="fi fi-rr-briefcase text-xs sm:text-sm inline-block ml-1" />
                  </label>
                  <input required name="class" type="text" defaultValue={studentClass} placeholder="e.g., 9th A" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-3 px-3 sm:py-4 sm:px-4 text-xs sm:text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-300 transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                    How Many? <i className="fi fi-rr-user text-xs sm:text-sm inline-block ml-1" />
                  </label>
                  <input required name="count" type="number" min="1" max="60" placeholder="10" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl py-3 px-3 sm:py-4 sm:px-4 text-xs sm:text-sm font-bold focus:outline-none focus:ring-4 focus:ring-rose-300 transition-all" />
                </div>
              </div>
              <div className="pt-4 sm:pt-6 flex gap-4">
                <button type="button" onClick={() => setRegisterModalOpen(false)} className="flex-1 py-3 sm:py-4 rounded-2xl text-xs sm:text-sm font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-2 border-slate-200 dark:border-slate-700">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 sm:py-4 rounded-2xl text-xs sm:text-sm font-black text-grey bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/30 active:scale-95 border-b-4 border-rose-700 flex items-center justify-center gap-2">
                  Register! <i className="fi fi-rr-party-horn text-xs sm:text-sm" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </PortalLayout>
  );
}
