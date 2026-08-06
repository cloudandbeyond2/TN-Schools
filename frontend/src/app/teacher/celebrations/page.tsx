"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Calendar } from "lucide-react";
import PortalLayout from "@/components/PortalLayout";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

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

export default function TeacherCelebrationsPage() {
  const { lang } = usePortalLanguage();
  const { data: session, status } = useSession();
  const schoolId = (session?.user as any)?.schoolId || "";

  const [activeTab, setActiveTab] = useState("today");
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  const [toastMsg, setToastMsg] = useState("");

  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDayEvent, setSelectedDayEvent] = useState<Celebration | null>(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Auto-select first event of the month when month changes
  useEffect(() => {
    const monthly = celebrations.filter(c => {
      const d = new Date(c.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    if (monthly.length > 0) {
      const hasSelectionInMonth = selectedDayEvent && monthly.some(m => m.id === selectedDayEvent.id);
      if (!hasSelectionInMonth) {
        setSelectedDayEvent(monthly[0]);
      }
    } else {
      if (selectedDayEvent !== null) {
        setSelectedDayEvent(null);
      }
    }
  }, [currentMonth, currentYear, celebrations, selectedDayEvent]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleJumpToNextEvent = () => {
    const today = new Date();
    const futureEvents = celebrations
      .filter(c => new Date(c.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (futureEvents.length > 0) {
      const nextEvent = futureEvents[0];
      const d = new Date(nextEvent.date);
      setCurrentMonth(d.getMonth());
      setCurrentYear(d.getFullYear());
      setSelectedDayEvent(nextEvent);
    } else if (celebrations.length > 0) {
      const allSorted = [...celebrations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const firstEvent = allSorted[0];
      const d = new Date(firstEvent.date);
      setCurrentMonth(d.getMonth());
      setCurrentYear(d.getFullYear());
      setSelectedDayEvent(firstEvent);
    } else {
      showToast("No events found in the system.");
    }
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

  const eventsInSelectedMonth = celebrations.filter(c => {
    const d = new Date(c.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  return (
    <PortalLayout
      title="School Celebrations"
      subtitle="Keep track of all the exciting events and school celebrations"
    >
      <div className="flex flex-col gap-6 sm:gap-8 text-left w-full">

        {/* Professional Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-700 text-white p-6 sm:p-10 shadow-lg">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 scale-150 pointer-events-none">
            <i className="fi fi-rr-calendar-star text-[160px]" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full font-medium tracking-wide text-xs uppercase mb-4 border border-white/20">
                <i className="fi fi-rr-star text-yellow-300" /> {lang === "தமிழ்" ? "பள்ளி நிகழ்வுகள்" : "School Events"}
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3 drop-shadow-sm flex items-center gap-3">
                {lang === "தமிழ்" ? "கொண்டாட்டங்கள் & விடுமுறைகள்" : "Celebrations & Holidays"}
              </h2>
              <p className="text-indigo-100 font-normal max-w-2xl text-sm sm:text-base leading-relaxed">
                {lang === "தமிழ்" ? "வரவிருக்கும் கொண்டாட்டங்கள், பண்டிகைகள் மற்றும் அதிகாரப்பூர்வ விடுமுறைகள் குறித்து உடனுக்குடன் தெரிந்துகொள்ளுங்கள். முன்கூட்டியே திட்டமிட்டு எமது பள்ளி சமூக நிகழ்வுகளில் தீவிரமாக பங்கேற்கவும்." : "Stay updated on upcoming celebrations, festivals, and official holidays. Plan ahead and actively participate in our school community events."}
              </p>
            </div>
            <button onClick={() => setCalendarModalOpen(true)} className="px-6 py-3 bg-white text-indigo-700 font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow-md hover:bg-indigo-50 active:scale-95 flex items-center gap-2 shrink-0 border border-indigo-100">
              <Calendar className="w-5 h-5 text-indigo-600 shrink-0 stroke-[2.2]" /> {lang === "தமிழ்" ? "காலெண்டரைப் பார்" : "View Calendar"}
            </button>
          </div>
        </div>

        <div className="w-full">
          {/* Main List */}
          <div className="theme-card p-0 rounded-2xl overflow-hidden">
            
            {/* Tabs */}
            <div className="flex border-b border-[var(--border)]">
              <button
                onClick={() => setActiveTab("today")}
                className={`flex-1 px-4 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all focus:outline-none border-b-2 ${activeTab === "today"
                  ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary-light)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card-hover)]"
                  }`}
              >
                <i className="fi fi-rr-sun" /> {lang === "தமிழ்" ? "இன்று" : "Today"}
              </button>
              <button
                onClick={() => setActiveTab("week")}
                className={`flex-1 px-4 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all focus:outline-none border-b-2 ${activeTab === "week"
                  ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary-light)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card-hover)]"
                  }`}
              >
                <i className="fi fi-rr-calendar" /> {lang === "தமிழ்" ? "அனைத்து நிகழ்வுகள்" : "All Events"}
              </button>
              <button
                onClick={() => setActiveTab("holiday")}
                className={`flex-1 px-4 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all focus:outline-none border-b-2 ${activeTab === "holiday"
                  ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary-light)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card-hover)]"
                  }`}
              >
                <i className="fi fi-rr-bank" /> {lang === "தமிழ்" ? "விடுமுறைகள்" : "Holidays"}
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {activeTab === "today" && (
                <div className="space-y-4">
                  {isLoading && (
                    <div className="flex items-center gap-3 text-sm text-slate-550 py-4">
                      <i className="fi fi-rr-spinner animate-spin text-indigo-600 text-lg" /> {lang === "தமிழ்" ? "இன்றைய நிகழ்வுகள் ஏற்றப்படுகின்றன..." : "Loading today's events..."}
                    </div>
                  )}

                  {!isLoading && todayCelebrations.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                        <i className="fi fi-rr-calendar-xmark text-slate-400 text-2xl" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-850 dark:text-slate-200">{lang === "தமிழ்" ? "இன்று எந்த நிகழ்வுகளும் இல்லை" : "No events today"}</h3>
                      <p className="text-sm text-slate-550 mt-2 font-medium">{lang === "தமிழ்" ? "வரவிருக்கும் அட்டவணைகளுக்கு அனைத்து நிகழ்வுகள் தாவலை சரிபார்க்கவும்." : "Check the All Events tab for upcoming schedules."}</p>
                    </div>
                  )}

                  {todayCelebrations.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 sm:p-6 rounded-xl border border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:shadow-md transition-shadow bg-[var(--bg-card)] relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-indigo-500/10 text-indigo-400">
                        <i className="fi fi-rr-party-horn text-xl" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                          <h4 className="text-lg font-semibold text-[var(--text-heading)]">{item.title}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium tracking-wide text-indigo-400 bg-indigo-500/20 uppercase">
                            {lang === "தமிழ்" ? "நிகழ்வு" : "Event"}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-[var(--text-muted)] mb-3">{item.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] font-bold">
                          <i className="fi fi-rr-calendar-day" /> {lang === "தமிழ்" ? "இன்று" : "Today"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "week" && (
                <div className="space-y-4">
                  {isLoading && (
                    <div className="flex items-center gap-3 text-sm text-slate-555 py-4">
                      <i className="fi fi-rr-spinner animate-spin text-indigo-600 text-lg" /> {lang === "தமிழ்" ? "வரவிருக்கும் நிகழ்வுகள் ஏற்றப்படுகின்றன..." : "Loading upcoming events..."}
                    </div>
                  )}

                  {!isLoading && weekCelebrations.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                        <i className="fi fi-rr-calendar-xmark text-slate-400 text-2xl" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-850 dark:text-slate-200">{lang === "தமிழ்" ? "நிகழ்வுகள் எதுவும் திட்டமிடப்படவில்லை" : "No events scheduled"}</h3>
                      <p className="text-sm text-slate-555 mt-2 font-medium">{lang === "தமிழ்" ? "தற்போது வரவிருக்கும் நிகழ்வுகள் எதுவும் இல்லை." : "There are no upcoming events at the moment."}</p>
                    </div>
                  )}

                  {weekCelebrations.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 sm:p-6 rounded-xl border border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:shadow-md transition-shadow bg-[var(--bg-card)] relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-400">
                        <i className="fi fi-rr-party-horn text-xl" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                          <h4 className="text-lg font-semibold text-[var(--text-heading)]">{item.title}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium tracking-wide text-blue-400 bg-blue-500/20 uppercase">
                            {lang === "தமிழ்" ? "நிகழ்வு" : "Event"}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-[var(--text-muted)] mb-3">{item.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] font-bold">
                          <i className="fi fi-rr-calendar" /> {new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "holiday" && (
                <div className="space-y-8">
                  {isLoading && (
                    <div className="flex items-center gap-3 text-sm text-[var(--text-muted)] py-4">
                      <i className="fi fi-rr-spinner animate-spin text-indigo-600 text-lg" /> {lang === "தமிழ்" ? "விடுமுறைகள் ஏற்றப்படுகின்றன..." : "Loading holidays..."}
                    </div>
                  )}

                  {!isLoading && holidays.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-[var(--bg-main)] rounded-full flex items-center justify-center mb-4 border border-[var(--border)]">
                        <i className="fi fi-rr-calendar-xmark text-slate-400 text-2xl" />
                      </div>
                      <h3 className="text-lg font-semibold text-[var(--text-heading)]">{lang === "தமிழ்" ? "விடுமுறைகள் எதுவும் பட்டியலிடப்படவில்லை" : "No holidays listed"}</h3>
                      <p className="text-sm text-[var(--text-muted)] mt-2 font-medium">{lang === "தமிழ்" ? "அதிகாரப்பூர்வ விடுமுறைகள் எதுவும் இன்னும் திட்டமிடப்படவில்லை." : "No official holidays have been scheduled yet."}</p>
                    </div>
                  )}

                  {!isLoading && sortedYears.map(year => (
                    <div key={year} className="space-y-4">
                      <div className="flex items-center gap-4 py-1">
                        <span className="text-sm font-semibold text-[var(--text-heading)] bg-[var(--bg-main)] px-3 py-1 rounded-md border border-[var(--border)] flex items-center gap-2">
                          <i className="fi fi-rr-calendar" /> {year} {lang === "தமிழ்" ? "விடுமுறைகள்" : "Holidays"}
                        </span>
                        <div className="flex-1 h-[1px] bg-[var(--border)]" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {holidaysByYear[year].map(item => (
                          <div
                            key={item.id}
                            className="p-5 rounded-xl border border-[var(--border)] flex items-start gap-4 hover:shadow-md transition-shadow bg-[var(--bg-card)] relative overflow-hidden"
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-400">
                              <i className="fi fi-rr-bank text-xl" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-3 mb-1">
                                <h4 className="text-lg font-semibold text-[var(--text-heading)]">{item.title}</h4>
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium tracking-wide text-amber-400 bg-amber-500/20 uppercase">
                                  {lang === "தமிழ்" ? "விடுமுறை" : "Holiday"}
                                </span>
                              </div>
                              {item.description && (
                                <p className="text-sm text-[var(--text-muted)] mb-3">{item.description}</p>
                              )}
                              <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] font-bold">
                                <i className="fi fi-rr-calendar" /> {new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
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
        </div>
      </div>

      {/* Calendar Modal */}
      {calendarModalOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-[var(--bg-card)] rounded-3xl w-full max-w-4xl shadow-2xl border border-[var(--border)] text-[var(--text-heading)] p-6 relative flex flex-col max-h-[90vh]">
            
            {/* Close Button */}
            <button
              onClick={() => setCalendarModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-[var(--bg-main)] border border-[var(--border)] rounded-full text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card-hover)] transition-colors"
            >
              <i className="fi fi-rr-cross text-xs" />
            </button>

            {/* Modal Header */}
            <div className="mb-4 flex items-center gap-2">
              <i className="fi fi-rr-calendar-lines text-indigo-500 text-xl" />
              <h3 className="text-lg font-bold text-[var(--text-heading)]">
                Interactive Event Calendar
              </h3>
            </div>

            {/* Split Grid for Calendar and Events List */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-1">
              
              {/* Calendar Column (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                {/* Month & Year Navigation */}
                <div className="flex justify-between items-center bg-[var(--bg-main)] p-3 rounded-xl border border-[var(--border)]">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 bg-[var(--bg-card)] rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors border border-[var(--border)] text-[var(--text-heading)]"
                  >
                    <i className="fi fi-rr-angle-left text-xs" />
                  </button>
                  <span className="text-sm font-semibold text-[var(--text-heading)]">
                    {monthNames[currentMonth]} {currentYear}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 bg-[var(--bg-card)] rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors border border-[var(--border)] text-[var(--text-heading)]"
                  >
                    <i className="fi fi-rr-angle-right text-xs" />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
                  {/* Day Headers */}
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                    <div key={d} className="text-xs font-semibold text-[var(--text-muted)] uppercase py-1">{d}</div>
                  ))}

                  {/* Pad previous month days */}
                  {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, i) => (
                    <div key={`pad-${i}`} className="aspect-square" />
                  ))}

                  {/* Month Days */}
                  {Array.from({ length: new Date(currentYear, currentMonth + 1, 0).getDate() }).map((_, i) => {
                    const dayNum = i + 1;
                    const dayCelebrations = celebrations.filter(c => {
                      const d = new Date(c.date);
                      return d.getDate() === dayNum && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                    });

                    const celebration = dayCelebrations[0];
                    const isHoliday = celebration?.type === "HOLIDAY";
                    const isEvent = celebration?.type === "EVENT";
                    
                    const isSelected = selectedDayEvent && 
                      new Date(selectedDayEvent.date).getDate() === dayNum &&
                      new Date(selectedDayEvent.date).getMonth() === currentMonth &&
                      new Date(selectedDayEvent.date).getFullYear() === currentYear;

                    return (
                      <button
                        key={`day-${dayNum}`}
                        onClick={() => celebration && setSelectedDayEvent(celebration)}
                        type="button"
                        className={`aspect-square rounded-xl font-medium text-xs sm:text-sm flex flex-col items-center justify-center relative transition-all border ${
                          isSelected
                            ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20"
                            : "border-transparent"
                        } ${
                          isHoliday
                            ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/30 cursor-pointer animate-none"
                            : isEvent
                              ? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border-indigo-500/30 cursor-pointer animate-none"
                              : "text-[var(--text-heading)] hover:bg-[var(--bg-card-hover)] cursor-default animate-none"
                        }`}
                      >
                        <span>{dayNum}</span>
                        {celebration && (
                          <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${
                            isHoliday ? "bg-amber-500" : "bg-indigo-500"
                          }`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex gap-4 text-xs mt-2 border-t border-[var(--border)] pt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-none"></span>
                    <span className="text-[var(--text-muted)] font-medium">School Event</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-none"></span>
                    <span className="text-[var(--text-muted)] font-medium">Govt Holiday</span>
                  </div>
                </div>
              </div>

              {/* Event List & Details Column (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-[var(--border)] pt-4 lg:pt-0 lg:pl-6 min-h-[300px]">
                
                {/* Header for Monthly List */}
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[var(--text-heading)] uppercase tracking-wider">
                    {monthNames[currentMonth]} Schedule
                  </h4>
                  <span className="px-2 py-0.5 bg-[var(--bg-main)] border border-[var(--border)] text-[10px] font-bold text-[var(--text-muted)] rounded-md">
                    {eventsInSelectedMonth.length} {eventsInSelectedMonth.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Monthly list contents */}
                <div className="flex-1 overflow-y-auto max-h-[220px] lg:max-h-none space-y-2 pr-1">
                  {eventsInSelectedMonth.length > 0 ? (
                    eventsInSelectedMonth.map(item => {
                      const isSelected = selectedDayEvent && selectedDayEvent.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedDayEvent(item)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-center ${
                            isSelected
                              ? "bg-[var(--bg-card-hover)] border-[var(--primary)] shadow-sm"
                              : "bg-[var(--bg-main)] border-[var(--border)] hover:bg-[var(--bg-card-hover)]"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            item.type === "HOLIDAY" 
                              ? "bg-amber-500/10 text-amber-400" 
                              : "bg-indigo-500/10 text-indigo-400"
                          }`}>
                            <i className={item.type === "HOLIDAY" ? "fi fi-rr-bank text-sm" : "fi fi-rr-party-horn text-sm"} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-semibold text-[var(--text-heading)] truncate">{item.title}</h5>
                            <p className="text-[10px] text-[var(--text-muted)] font-medium">
                              {new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                            </p>
                          </div>
                          <i className={`fi fi-rr-angle-small-right text-[var(--text-muted)] transition-transform ${isSelected ? "translate-x-0.5" : ""}`} />
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                      <i className="fi fi-rr-calendar-xmark text-[var(--text-muted)] text-3xl mb-2" />
                      <p className="text-xs text-[var(--text-muted)] font-bold">No events this month</p>
                      <button
                        onClick={handleJumpToNextEvent}
                        className="mt-3 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1.5 border border-indigo-500/30"
                      >
                        <i className="fi fi-rr-search-alt text-xs" /> Jump to Next Event
                      </button>
                    </div>
                  )}
                </div>

                {/* Selected Event Details Panel */}
                <div className="mt-auto border-t border-[var(--border)] pt-4">
                  {selectedDayEvent ? (
                    <div className="bg-[var(--bg-main)] border border-[var(--border)] rounded-xl p-4 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          selectedDayEvent.type === "HOLIDAY" 
                            ? "bg-amber-500/20 text-amber-400" 
                            : "bg-indigo-500/20 text-indigo-400"
                        }`}>
                          {selectedDayEvent.type === "HOLIDAY" ? "Holiday" : "Event"}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] font-medium">
                          {new Date(selectedDayEvent.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[var(--text-heading)] leading-tight">
                        {selectedDayEvent.title}
                      </h4>
                      {selectedDayEvent.description && (
                        <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                          {selectedDayEvent.description}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-[var(--bg-main)] border border-[var(--border)] rounded-xl p-4 text-center">
                      <p className="text-xs text-[var(--text-muted)] italic">
                        Select a date to view event details
                      </p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
