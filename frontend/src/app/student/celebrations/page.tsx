"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";

interface Celebration {
  id: string;
  title: string;
  date: string;
  description: string | null;
  type: string; // "EVENT" or "HOLIDAY"
}

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

export default function CelebrationsPage() {
  const { data: session, status } = useSession();
  const schoolId = (session?.user as any)?.schoolId || "";

  const [activeTab, setActiveTab] = useState("today");
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [preparations] = useState([
    { id: 1, task: "Decorate Main Hall 🎈", assignedTo: "Art Club", status: "In Progress", color: "pink" },
    { id: 2, task: "Order Cake for Principal's B'day 🎂", assignedTo: "Admin Staff", status: "Completed", color: "emerald" },
    { id: 3, task: "Setup Audio System 🎵", assignedTo: "IT Support", status: "Pending", color: "amber" },
  ]);

  const [toastMsg, setToastMsg] = useState("");

  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDayEvent, setSelectedDayEvent] = useState<Celebration | null>(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDayEvent(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDayEvent(null);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const fetchCelebrations = useCallback(async () => {
    if (!schoolId) {
      if (status !== "loading") {
        setIsLoading(false);
      }
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/celebrations?schoolId=${schoolId}`);
      const json = await res.json();
      if (json.success) {
        setCelebrations(json.data);
      }
    } catch (err) {
      console.error("Error loading celebrations:", err);
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, status]);

  useEffect(() => {
    fetchCelebrations();
  }, [fetchCelebrations]);

  // Date filter functions
  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

  const todayCelebrations = celebrations.filter(c => isToday(c.date) && c.type === "EVENT");
  const weekCelebrations = celebrations.filter(c => c.type === "EVENT"); // Show all celebrations scoped to this school ID
  const holidays = celebrations.filter(c => c.type === "HOLIDAY");

  // Group holidays by year
  const holidaysByYear = holidays.reduce((acc, curr) => {
    const year = new Date(curr.date).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(curr);
    return acc;
  }, {} as Record<number, Celebration[]>);

  const sortedYears = Object.keys(holidaysByYear).map(Number).sort((a, b) => a - b);
  sortedYears.forEach(year => {
    holidaysByYear[year].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  return (
    <PortalLayout
      title="School Celebrations! 🎉"
      subtitle="Keep track of all the exciting events and school celebrations!"
    >
      <div className="flex flex-col gap-6 sm:gap-8 text-left">

        {/* Playful Banner */}
        <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 text-white p-6 sm:p-8 shadow-xl border-4 border-pink-200">
          <div className="absolute right-0 top-0 opacity-20 transform translate-x-1/4 -translate-y-1/4 scale-150 pointer-events-none mix-blend-overlay hidden sm:block">
            <i className="fi fi-rr-party-horn text-[160px]" />
          </div>

          {/* Confetti simulation */}
          <div className="absolute top-10 left-10 w-3 h-3 bg-yellow-300 rounded-sm rotate-45 animate-bounce"></div>
          <div className="absolute top-20 left-1/3 w-3 h-3 bg-blue-300 rounded-full animate-ping"></div>
          <div className="absolute bottom-10 left-1/2 w-4 h-4 bg-emerald-300 rounded-sm rotate-12 animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-purple-300 rounded-full animate-bounce"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl font-black tracking-wider text-[10px] sm:text-xs uppercase mb-3 sm:mb-4 border-2 border-white/30 rotate-[-2deg]">
                <i className="fi fi-rr-star text-yellow-300 text-xs" /> School Events
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-2 sm:mb-3 drop-shadow-md flex items-center gap-2">
                Celebrations! <i className="fi fi-rr-party-horn text-yellow-300 text-xl sm:text-3xl" />
              </h2>
              <p className="text-pink-50 font-bold max-w-xl text-xs sm:text-sm md:text-base leading-relaxed">
                Check out all the exciting celebrations, festivals, and achievements happening at our school. Stay updated and participate in school events!
              </p>
            </div>
            <button onClick={() => setCalendarModalOpen(true)} className="px-5 py-3 sm:px-6 sm:py-4 bg-yellow-400 text-yellow-900 font-black text-xs sm:text-sm rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 flex items-center gap-2 sm:gap-3 shrink-0 border-4 border-yellow-200">
              <i className="fi fi-rr-calendar text-base sm:text-lg" /> View Calendar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          {/* Main List */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[2rem] sm:rounded-[2.5rem] shadow-lg border-4 border-rose-100 dark:border-slate-700 overflow-hidden">
            <div className="flex bg-rose-50 dark:bg-slate-900 p-1.5 sm:p-2 gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setActiveTab("today")}
                className={`flex-1 min-w-[100px] sm:min-w-0 px-3 py-2.5 sm:px-4 sm:py-3.5 text-[11px] sm:text-xs md:text-sm font-black flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl transition-all focus:outline-none ${activeTab === "today"
                  ? "bg-rose-500 text-white border-2 border-rose-500 shadow-md shadow-rose-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-rose-100 hover:text-rose-600 border-2 border-slate-100 dark:border-slate-700"
                  }`}
              >
                <i className="fi fi-rr-laugh text-xs sm:text-sm shrink-0" /> Today
              </button>
              <button
                onClick={() => setActiveTab("week")}
                className={`flex-1 min-w-[100px] sm:min-w-0 px-3 py-2.5 sm:px-4 sm:py-3.5 text-[11px] sm:text-xs md:text-sm font-black flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl transition-all focus:outline-none ${activeTab === "week"
                  ? "bg-rose-500 text-white border-2 border-rose-500 shadow-md shadow-rose-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-rose-100 hover:text-rose-600 border-2 border-slate-100 dark:border-slate-700"
                  }`}
              >
                <i className="fi fi-rr-calendar text-xs sm:text-sm shrink-0" /> All Events
              </button>
              <button
                onClick={() => setActiveTab("holiday")}
                className={`flex-1 min-w-[100px] sm:min-w-0 px-3 py-2.5 sm:px-4 sm:py-3.5 text-[11px] sm:text-xs md:text-sm font-black flex items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl transition-all focus:outline-none ${activeTab === "holiday"
                  ? "bg-rose-500 text-white border-2 border-rose-500 shadow-md shadow-rose-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-rose-100 hover:text-rose-600 border-2 border-slate-100 dark:border-slate-700"
                  }`}
              >
                <i className="fi fi-rr-bank text-xs sm:text-sm shrink-0" /> Holidays
              </button>
            </div>

            <div className="p-4 sm:p-8">
              {activeTab === "today" && (
                <div className="space-y-4 sm:space-y-6">
                  {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-550 font-bold p-4">
                      <i className="fi fi-rr-spinner animate-spin text-rose-500 text-sm" /> Checking for today's celebrations...
                    </div>
                  )}

                  {!isLoading && todayCelebrations.length === 0 && (
                    <div className="py-10 sm:py-12 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                        <i className="fi fi-rr-laugh text-slate-400 text-lg sm:text-2xl" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-700 dark:text-slate-300">No celebrations today...</h3>
                      <p className="text-[11px] sm:text-xs font-bold text-slate-550 mt-1">Check out the All Scheduled Events tab for other events!</p>
                    </div>
                  )}

                  {todayCelebrations.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 group hover:shadow-xl hover:-translate-y-1 transition-all bg-white dark:bg-slate-800 shadow-md shadow-slate-100 dark:shadow-none"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.2rem] sm:rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-12 transition-transform bg-pink-200 text-pink-600">
                        <i className="fi fi-rr-party-horn text-2xl sm:text-3xl" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <h4 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100">{item.title}</h4>
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black text-white shadow-sm rotate-[-5deg] bg-pink-500">
                            Celebration
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-xs sm:text-sm font-bold text-slate-500 mb-3">{item.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400">
                          <i className="fi fi-rr-calendar text-xs" /> Today
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "week" && (
                <div className="space-y-4 sm:space-y-6">
                  {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-550 font-bold p-4">
                      <i className="fi fi-rr-spinner animate-spin text-rose-500 text-sm" /> Checking for upcoming celebrations...
                    </div>
                  )}

                  {!isLoading && weekCelebrations.length === 0 && (
                    <div className="py-16 sm:py-20 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <i className="fi fi-rr-music text-slate-400 text-xl sm:text-3xl" />
                      </div>
                      <h3 className="text-lg sm:text-2xl font-black text-slate-700 dark:text-slate-300">Quiet week ahead...</h3>
                      <p className="text-xs sm:text-base font-bold text-slate-555 mt-2">No other parties scheduled yet!</p>
                    </div>
                  )}

                  {weekCelebrations.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 group hover:shadow-xl hover:-translate-y-1 transition-all bg-white dark:bg-slate-800 shadow-md shadow-slate-100 dark:shadow-none"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.2rem] sm:rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-12 transition-transform bg-pink-200 text-pink-600">
                        <i className="fi fi-rr-party-horn text-2xl sm:text-3xl" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <h4 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100">{item.title}</h4>
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black text-white shadow-sm rotate-[-5deg] bg-pink-500">
                            Celebration
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-xs sm:text-sm font-bold text-slate-500 mb-3">{item.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400">
                          <i className="fi fi-rr-calendar text-xs" /> {new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "holiday" && (
                <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                  {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-550 font-bold p-4">
                      <i className="fi fi-rr-spinner animate-spin text-rose-500 text-sm" /> Checking for holidays...
                    </div>
                  )}

                  {!isLoading && holidays.length === 0 && (
                    <div className="py-16 sm:py-20 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
                        <i className="fi fi-rr-gift text-slate-400 text-xl sm:text-3xl" />
                      </div>
                      <h3 className="text-lg sm:text-2xl font-black text-slate-700 dark:text-slate-300">No holidays listed</h3>
                      <p className="text-xs sm:text-base font-bold text-slate-555 mt-2">All days are working days! 📝</p>
                    </div>
                  )}

                  {!isLoading && sortedYears.map(year => (
                    <div key={year} className="space-y-4">
                      {/* Year Section Header */}
                      <div className="flex items-center gap-3 sm:gap-4 py-2">
                        <span className="text-xs sm:text-base font-black text-rose-500 bg-rose-50 dark:bg-slate-900 border border-rose-100 dark:border-slate-800 px-3 py-1.5 rounded-xl sm:rounded-2xl shadow-sm rotate-[-1deg] flex items-center gap-1.5">
                          <i className="fi fi-rr-calendar text-rose-500" /> {year} Government Holidays
                        </span>
                        <div className="flex-1 h-[2px] bg-gradient-to-r from-rose-200 to-transparent dark:from-slate-700" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {holidaysByYear[year].map(item => (
                          <div
                            key={item.id}
                            className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-700/50 flex items-start gap-3 sm:gap-4 hover:shadow-lg transition-all bg-white dark:bg-slate-800 shadow-md shadow-slate-100 dark:shadow-none"
                          >
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-inner bg-amber-100 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                              <i className="fi fi-rr-gift text-lg sm:text-xl" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm sm:text-base font-black text-slate-850 dark:text-slate-100 truncate">{item.title}</h4>
                              {item.description && (
                                <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 truncate">{item.description}</p>
                              )}
                              <div className="text-[10px] sm:text-xs font-bold text-slate-400 flex items-center gap-1.5">
                                <i className="fi fi-rr-clock text-xs" />
                                <span>{new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long" })}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preparation Checklist */}
          <div className="bg-white dark:bg-slate-800 p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-lg border-4 border-amber-100 dark:border-slate-700 h-fit relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-amber-100/50 dark:bg-amber-900/20 rounded-bl-full pointer-events-none z-0"></div>

            <h3 className="text-lg sm:text-xl font-black text-amber-900 dark:text-amber-100 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 relative z-10">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-xl rotate-12">
                <i className="fi fi-rr-check text-base sm:text-lg" />
              </div>
              Celebration Tasks
            </h3>

            <div className="space-y-3 sm:space-y-4 relative z-10">
              {preparations.map((prep) => (
                <div key={prep.id} className={`p-4 rounded-xl sm:rounded-2xl border-4 ${prep.status === 'Completed' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' :
                  prep.status === 'In Progress' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' :
                    'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                  }`}>
                  <div className="flex justify-between items-start mb-2 sm:mb-3 gap-2">
                    <h4 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 leading-tight">{prep.task}</h4>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] sm:text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <i className="fi fi-rr-users text-xs" />
                      <span className="text-slate-700 dark:text-slate-300">{prep.assignedTo}</span>
                    </div>
                    <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider border-2 shadow-sm ${prep.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                      prep.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                        'bg-white text-amber-600 border-amber-300'
                      }`}>
                      {prep.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Playful Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-full shadow-2xl shadow-pink-500/20 text-xs sm:text-base font-bold animate-[bounce_0.5s_ease-out] z-50 flex items-center gap-2 sm:gap-3 border-4 border-pink-500/30">
          <div className="w-3 h-3 bg-pink-400 rounded-full animate-ping"></div>
          {toastMsg}
        </div>
      )}

      {/* Calendar Modal */}
      {calendarModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-lg shadow-2xl border-4 border-pink-200 dark:border-slate-700 animate-in zoom-in-95 p-4 sm:p-6 relative">
            <button
              onClick={() => setCalendarModalOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-rose-100 dark:bg-slate-700 dark:hover:bg-slate-650 rounded-full text-slate-400 hover:text-rose-500 hover:scale-110 transition-all shadow-sm"
            >
              <i className="fi fi-rr-cross-small text-lg" />
            </button>

            <h3 className="text-xl sm:text-2xl font-black text-rose-500 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <i className="fi fi-rr-calendar text-rose-500 text-xl sm:text-2xl" /> Celebrations Calendar
            </h3>

            {/* Month & Year Navigation */}
            <div className="flex justify-between items-center mb-4 sm:mb-6 bg-rose-50 dark:bg-slate-900 p-2 sm:p-3 rounded-xl sm:rounded-2xl border-2 border-rose-100 dark:border-slate-700">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 sm:p-2 bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl hover:scale-110 transition-transform border-2 border-slate-100 dark:border-slate-700 text-rose-505 animate-none active:scale-95"
              >
                <i className="fi fi-rr-angle-left text-sm sm:text-base" />
              </button>
              <span className="text-sm sm:text-lg font-black text-slate-800 dark:text-slate-100">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 sm:p-2 bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl hover:scale-110 transition-transform border-2 border-slate-100 dark:border-slate-700 text-rose-505 animate-none active:scale-95"
              >
                <i className="fi fi-rr-angle-right text-sm sm:text-base" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center mb-4">
              {/* Day Headers */}
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                <div key={d} className="text-[10px] sm:text-xs font-black text-slate-450 dark:text-slate-500 uppercase">{d}</div>
              ))}

              {/* Pad previous month days */}
              {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, i) => (
                <div key={`pad-${i}`} className="aspect-square" />
              ))}

              {/* Month Days */}
              {Array.from({ length: new Date(currentYear, currentMonth + 1, 0).getDate() }).map((_, i) => {
                const dayNum = i + 1;

                // Find celebration matching this day
                const celebration = celebrations.find(c => {
                  const d = new Date(c.date);
                  return d.getDate() === dayNum && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                });

                const isHoliday = celebration?.type === "HOLIDAY";
                const isEvent = celebration?.type === "EVENT";

                return (
                  <button
                    key={`day-${dayNum}`}
                    onClick={() => celebration && setSelectedDayEvent(celebration)}
                    type="button"
                    className={`aspect-square rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm flex flex-col items-center justify-center relative transition-all ${isHoliday
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 hover:scale-110 cursor-pointer"
                      : isEvent
                        ? "bg-pink-500 text-white shadow-md shadow-pink-500/20 hover:scale-110 cursor-pointer"
                        : "hover:bg-rose-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-default"
                      }`}
                  >
                    <span>{dayNum}</span>
                    {celebration && (
                      <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 animate-pulse ${isHoliday ? "bg-yellow-100" : "bg-yellow-300"
                        }`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Celebration Details Section inside modal */}
            <div className="mt-4 min-h-[5rem] bg-rose-50/50 dark:bg-slate-900/50 border-2 border-dashed border-rose-100 dark:border-slate-700 rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col justify-center">
              {selectedDayEvent ? (
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-black text-white uppercase tracking-wider ${selectedDayEvent.type === "HOLIDAY" ? "bg-amber-500" : "bg-pink-500"
                      }`}>
                      {selectedDayEvent.type === "HOLIDAY" ? "Holiday" : "Celebration"}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-550">
                      {new Date(selectedDayEvent.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 leading-tight">
                    {selectedDayEvent.title}
                  </h4>
                  {selectedDayEvent.description && (
                    <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {selectedDayEvent.description}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-center text-[10px] sm:text-xs font-bold text-slate-400 italic">
                  Click on any highlighted day (pink for events, amber for holidays) to see details! 🎉
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
