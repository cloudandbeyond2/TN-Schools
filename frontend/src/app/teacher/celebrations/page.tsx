"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { 
  PartyPopper, 
  CalendarDays, 
  Gift, 
  Cake,
  Clock,
  CheckCircle2,
  Users,
  X,
  Star,
  Music,
  Smile,
  Building,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

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
  
  const [preparations, setPreparations] = useState([
    { id: 1, task: "Decorate Main Hall 🎈", assignedTo: "Art Club", status: "In Progress", color: "pink" },
    { id: 2, task: "Order Cake for Principal's B'day 🎂", assignedTo: "Admin Staff", status: "Completed", color: "emerald" },
    { id: 3, task: "Setup Audio System 🎵", assignedTo: "IT Support", status: "Pending", color: "amber" },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
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

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const task = formData.get("task") as string;
    const assignedTo = formData.get("assignedTo") as string;
    
    setPreparations([...preparations, { id: Date.now(), task: task + " ✨", assignedTo, status: "Pending", color: "blue" }]);
    setModalOpen(false);
    showToast("Awesome! New task added! 🎉");
  };

  const cycleStatus = (id: number) => {
    setPreparations(preparations.map(p => {
      if (p.id === id) {
        let nextStatus = "Pending";
        let nextColor = "amber";
        if (p.status === "Pending") { nextStatus = "In Progress"; nextColor = "blue"; }
        else if (p.status === "In Progress") { nextStatus = "Completed"; nextColor = "emerald"; }
        showToast(`Task marked as ${nextStatus}! ${nextStatus === 'Completed' ? 'Great job! 🌟' : ''}`);
        return { ...p, status: nextStatus, color: nextColor };
      }
      return p;
    }));
  };

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
      <div className="flex flex-col gap-8">
        
        {/* Playful Banner */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 text-white p-8 shadow-xl border-4 border-pink-200">
          <div className="absolute right-0 top-0 opacity-20 transform translate-x-1/4 -translate-y-1/4 scale-150 pointer-events-none mix-blend-overlay">
            <PartyPopper className="w-64 h-64" />
          </div>
          
          {/* Confetti simulation */}
          <div className="absolute top-10 left-10 w-3 h-3 bg-yellow-300 rounded-sm rotate-45 animate-bounce"></div>
          <div className="absolute top-20 left-1/3 w-3 h-3 bg-blue-300 rounded-full animate-ping"></div>
          <div className="absolute bottom-10 left-1/2 w-4 h-4 bg-emerald-300 rounded-sm rotate-12 animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-purple-300 rounded-full animate-bounce"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl font-black tracking-wider text-xs uppercase mb-4 border-2 border-white/30 rotate-[-2deg]">
                <Star className="w-4 h-4 text-yellow-300" /> School Events
              </div>
              <h2 className="text-4xl font-black tracking-tight mb-3 drop-shadow-md">Celebrations! 🎈</h2>
              <p className="text-pink-55 font-bold max-w-xl text-base leading-relaxed">
                Check out all the exciting celebrations, festivals, and achievements happening at our school. Stay updated and participate in school events!
              </p>
            </div>
            <button onClick={() => setCalendarModalOpen(true)} className="px-6 py-4 bg-yellow-400 text-yellow-900 font-black text-sm rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 flex items-center gap-3 shrink-0 border-4 border-yellow-200">
              <CalendarDays className="w-6 h-6" /> View Calendar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main List */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-lg border-4 border-rose-100 dark:border-slate-700 overflow-hidden">
            <div className="flex bg-rose-50 dark:bg-slate-900 p-2 gap-2 flex-wrap sm:flex-nowrap">
              <button 
                onClick={() => setActiveTab("today")}
                className={`flex-1 min-w-[80px] sm:min-w-0 px-2 py-3 sm:px-4 md:px-6 md:py-4 text-[10px] sm:text-xs md:text-sm lg:text-base font-black flex items-center justify-center gap-1.5 sm:gap-2 rounded-2xl transition-all focus:outline-none ${
                  activeTab === "today" 
                    ? "bg-rose-500 text-white border-2 border-rose-500 shadow-md shadow-rose-500/20" 
                    : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-rose-100 hover:text-rose-600 border-2 border-slate-100 dark:border-slate-700"
                }`}
              >
                <Smile className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0" /> Today's Celebrations
              </button>
              <button 
                onClick={() => setActiveTab("week")}
                className={`flex-1 min-w-[80px] sm:min-w-0 px-2 py-3 sm:px-4 md:px-6 md:py-4 text-[10px] sm:text-xs md:text-sm lg:text-base font-black flex items-center justify-center gap-1.5 sm:gap-2 rounded-2xl transition-all focus:outline-none ${
                  activeTab === "week" 
                    ? "bg-rose-500 text-white border-2 border-rose-500 shadow-md shadow-rose-500/20" 
                    : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-rose-100 hover:text-rose-600 border-2 border-slate-100 dark:border-slate-700"
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0" /> All Scheduled Events
              </button>
              <button 
                onClick={() => setActiveTab("holiday")}
                className={`flex-1 min-w-[80px] sm:min-w-0 px-2 py-3 sm:px-4 md:px-6 md:py-4 text-[10px] sm:text-xs md:text-sm lg:text-base font-black flex items-center justify-center gap-1.5 sm:gap-2 rounded-2xl transition-all focus:outline-none ${
                  activeTab === "holiday" 
                    ? "bg-rose-500 text-white border-2 border-rose-500 shadow-md shadow-rose-500/20" 
                    : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-rose-100 hover:text-rose-600 border-2 border-slate-100 dark:border-slate-700"
                }`}
              >
                <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0" /> Government Holidays
              </button>
            </div>

            <div className="p-8">
              {activeTab === "today" && (
                <div className="space-y-6">
                  {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-550 font-bold p-4">
                      <Loader2 className="w-4 h-4 animate-spin text-rose-500" /> Checking for today's celebrations...
                    </div>
                  )}

                  {!isLoading && todayCelebrations.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                        <Smile className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-black text-slate-700 dark:text-slate-300">No celebrations today...</h3>
                      <p className="text-xs font-bold text-slate-500 mt-1">Check out the Later This Week tab for other events!</p>
                    </div>
                  )}

                  {todayCelebrations.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center gap-6 group hover:shadow-xl hover:-translate-y-1 transition-all bg-white dark:bg-slate-800 shadow-md shadow-slate-100 dark:shadow-none"
                    >
                      <div className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-12 transition-transform bg-pink-200 text-pink-600">
                        <PartyPopper className="w-10 h-10" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">{item.title}</h4>
                          <span className="px-3 py-1 rounded-xl text-xs font-black text-white shadow-sm rotate-[-5deg] bg-pink-500">
                            Celebration
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm font-bold text-slate-500 mb-3">{item.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          <CalendarDays className="w-4 h-4" /> Today
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "week" && (
                <div className="space-y-6">
                  {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-550 font-bold p-4">
                      <Loader2 className="w-4 h-4 animate-spin text-rose-500" /> Checking for upcoming celebrations...
                    </div>
                  )}

                  {!isLoading && weekCelebrations.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                      <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 animate-pulse">
                         <Music className="w-12 h-12 text-slate-400" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-700 dark:text-slate-300">Quiet week ahead...</h3>
                      <p className="text-base font-bold text-slate-550 mt-2">No other parties scheduled yet!</p>
                    </div>
                  )}

                  {weekCelebrations.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center gap-6 group hover:shadow-xl hover:-translate-y-1 transition-all bg-white dark:bg-slate-800 shadow-md shadow-slate-100 dark:shadow-none"
                    >
                      <div className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-12 transition-transform bg-pink-200 text-pink-600">
                        <PartyPopper className="w-10 h-10" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">{item.title}</h4>
                          <span className="px-3 py-1 rounded-xl text-xs font-black text-white shadow-sm rotate-[-5deg] bg-pink-500">
                            Celebration
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm font-bold text-slate-500 mb-3">{item.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          <CalendarDays className="w-4 h-4" /> {new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "holiday" && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-550 font-bold p-4">
                      <Loader2 className="w-4 h-4 animate-spin text-rose-500" /> Checking for holidays...
                    </div>
                  )}

                  {!isLoading && holidays.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                      <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
                        <Gift className="w-12 h-12 text-slate-400" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-700 dark:text-slate-300">No holidays listed</h3>
                      <p className="text-base font-bold text-slate-550 mt-2">All days are working days! 📝</p>
                    </div>
                  )}

                  {!isLoading && sortedYears.map(year => (
                    <div key={year} className="space-y-4">
                      {/* Year Section Header */}
                      <div className="flex items-center gap-4 py-2">
                        <span className="text-base font-black text-rose-500 bg-rose-50 dark:bg-slate-900 border border-rose-100 dark:border-slate-800 px-4 py-1.5 rounded-2xl shadow-sm rotate-[-1deg]">
                          📅 {year} Government Holidays
                        </span>
                        <div className="flex-1 h-[2px] bg-gradient-to-r from-rose-200 to-transparent dark:from-slate-700" />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {holidaysByYear[year].map(item => (
                          <div 
                            key={item.id} 
                            className="p-5 rounded-3xl border border-slate-100 dark:border-slate-700/50 flex items-start gap-4 hover:shadow-lg transition-all bg-white dark:bg-slate-800 shadow-md shadow-slate-100 dark:shadow-none"
                          >
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner bg-amber-100 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
                              <Gift className="w-7 h-7" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-black text-slate-850 dark:text-slate-100 truncate">{item.title}</h4>
                              {item.description && (
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-405 mb-2 truncate">{item.description}</p>
                              )}
                              <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
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
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-lg border-4 border-amber-100 dark:border-slate-700 h-fit relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 dark:bg-amber-900/20 rounded-bl-full pointer-events-none"></div>
             
             <h3 className="text-xl font-black text-amber-900 dark:text-amber-100 mb-6 flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl rotate-12">
                   <CheckCircle2 className="w-6 h-6" />
                </div>
                Celebration Tasks
             </h3>

             <div className="space-y-4">
               {preparations.map((prep) => (
                 <div key={prep.id} onClick={() => cycleStatus(prep.id)} className={`p-4 rounded-2xl border-4 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all ${
                     prep.status === 'Completed' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' :
                     prep.status === 'In Progress' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' :
                     'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                 }`}>
                    <div className="flex justify-between items-start mb-3 gap-2">
                       <h4 className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight">{prep.task}</h4>
                    </div>
                    <div className="flex justify-between items-center">
                       <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          <span className="text-slate-700 dark:text-slate-300">{prep.assignedTo}</span>
                       </div>
                       <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border-2 shadow-sm ${
                          prep.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                          prep.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                          'bg-white text-amber-600 border-amber-300'
                       }`}>
                          {prep.status}
                       </span>
                    </div>
                 </div>
               ))}
             </div>
             
             <button onClick={() => setModalOpen(true)} className="w-full mt-6 py-4 rounded-2xl text-sm font-black text-amber-600 bg-amber-50 hover:bg-amber-100 transition-all border-4 border-dashed border-amber-300 active:scale-95 shadow-sm">
                + Add a Task!
             </button>
          </div>

        </div>
      </div>

      {/* Playful Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl shadow-pink-500/20 text-base font-bold animate-[bounce_0.5s_ease-out] z-50 flex items-center gap-3 border-4 border-pink-500/30">
          <div className="w-4 h-4 bg-pink-400 rounded-full animate-ping"></div>
          {toastMsg}
        </div>
      )}

      {/* Add Task Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-md shadow-2xl border-4 border-amber-200 dark:border-slate-700 animate-in zoom-in-95 p-2">
            <div className="flex justify-between items-center p-6 bg-amber-50 dark:bg-slate-900 rounded-[2rem] mb-4">
              <h3 className="text-xl font-black text-amber-600 dark:text-amber-500">What needs to be done?</h3>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full text-slate-400 hover:text-amber-500 hover:scale-110 transition-all shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTask} className="p-4 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">The Task 📝</label>
                <input required name="task" type="text" placeholder="e.g., Buy balloons!" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Who's doing it? 🧑‍🤝‍🧑</label>
                <input required name="assignedTo" type="text" placeholder="e.g., The Party Committee" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-2 border-slate-200 dark:border-slate-700">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 rounded-2xl text-sm font-black text-amber-900 bg-amber-400 hover:bg-amber-300 transition-all shadow-lg shadow-amber-500/30 border-2 border-amber-200 active:scale-95">
                  Add It! ✅
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {calendarModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-lg shadow-2xl border-4 border-pink-200 dark:border-slate-700 animate-in zoom-in-95 p-6 relative">
            <button 
              onClick={() => setCalendarModalOpen(false)} 
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-rose-100 dark:bg-slate-700 dark:hover:bg-slate-650 rounded-full text-slate-400 hover:text-rose-500 hover:scale-110 transition-all shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-black text-rose-500 mb-6 flex items-center gap-3">
              <CalendarDays className="w-7 h-7" /> Celebrations Calendar
            </h3>

            {/* Month & Year Navigation */}
            <div className="flex justify-between items-center mb-6 bg-rose-50 dark:bg-slate-900 p-3 rounded-2xl border-2 border-rose-100 dark:border-slate-700">
              <button 
                onClick={handlePrevMonth}
                className="p-2 bg-white dark:bg-slate-800 rounded-xl hover:scale-110 transition-transform border-2 border-slate-100 dark:border-slate-700 text-rose-500 animate-none active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-lg font-black text-slate-800 dark:text-slate-100">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <button 
                onClick={handleNextMonth}
                className="p-2 bg-white dark:bg-slate-800 rounded-xl hover:scale-110 transition-transform border-2 border-slate-100 dark:border-slate-700 text-rose-500 animate-none active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 text-center mb-4">
              {/* Day Headers */}
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                <div key={d} className="text-xs font-black text-slate-450 dark:text-slate-500 uppercase">{d}</div>
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
                    className={`aspect-square rounded-xl font-bold text-sm flex flex-col items-center justify-center relative transition-all ${
                      isHoliday 
                        ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 hover:scale-110 cursor-pointer"
                        : isEvent 
                          ? "bg-pink-500 text-white shadow-md shadow-pink-500/20 hover:scale-110 cursor-pointer" 
                          : "hover:bg-rose-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-default"
                    }`}
                  >
                    <span>{dayNum}</span>
                    {celebration && (
                      <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 animate-pulse ${
                        isHoliday ? "bg-yellow-100" : "bg-yellow-300"
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Celebration Details Section inside modal */}
            <div className="mt-4 min-h-[5.5rem] bg-rose-50/50 dark:bg-slate-900/50 border-2 border-dashed border-rose-100 dark:border-slate-700 rounded-3xl p-4 flex flex-col justify-center">
              {selectedDayEvent ? (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black text-white uppercase tracking-wider ${
                      selectedDayEvent.type === "HOLIDAY" ? "bg-amber-500" : "bg-pink-500"
                    }`}>
                      {selectedDayEvent.type === "HOLIDAY" ? "Holiday" : "Celebration"}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-450">
                      {new Date(selectedDayEvent.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight">
                    {selectedDayEvent.title}
                  </h4>
              {selectedDayEvent.description && (
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {selectedDayEvent.description}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-center text-xs font-bold text-slate-400 italic">
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
