"use client";

import PortalLayout from "@/components/PortalLayout";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { 
  Trophy, Activity, Award, Calendar, Heart, 
  MapPin, Clock, Target,
  Users, ChevronRight, AlertTriangle, ChevronLeft, Shield
} from "lucide-react";
import { petLoad, AWARDS_KEY, DEFAULT_AWARDS } from "@/lib/petData";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface StudentSportsData {
  studentId: string;
  studentName: string;
  className: string;
  rollNumber: string;
  teams: any[];
  stats: any[];
  events: any[];
  logs: any[];
  injuries: any[];
  petFitness?: any;
  petEvents?: any[];
  awards?: any[];
  clubs?: any[];
}

export default function StudentSportsPortal() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<StudentSportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Tabs: overview (Health/Fitness), events, awards, clubs
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "awards" | "clubs">("overview");

  // Filters & Pagination for Events
  const [eventFilter, setEventFilter] = useState("All");
  const [eventKindFilter, setEventKindFilter] = useState("All");
  const [eventPage, setEventPage] = useState(1);
  const eventsPerPage = 5;

  // Filters & Pagination for Awards
  const [awardPage, setAwardPage] = useState(1);
  const awardsPerPage = 6;

  const [awardsPageData, setAwardsPageData] = useState<any[]>([]);

  async function fetchSportsData() {
    if (status === "loading") return;
    const targetStudentId = (session?.user as any)?.id || "demo-student";

    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/sports/${targetStudentId}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        
        // Also load prototype awards from local storage
        const allAwards = petLoad(AWARDS_KEY, DEFAULT_AWARDS);
        const myName = json.data.studentName.split(" ")[0]; // basic matching since names might differ slightly
        const myAwards = allAwards.filter((a: any) => a.student.includes(myName));
        setAwardsPageData(myAwards);
      }
    } catch (err) {
      console.error("Failed to fetch sports data:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSportsData();
  }, [session, status]);

  const filteredEvents = useMemo(() => {
    if (!data?.petEvents) return [];
    let list = data.petEvents;
    
    if (eventFilter !== "All") {
      list = list.filter((e: any) => e.status === eventFilter);
    }
    if (eventKindFilter !== "All") {
      list = list.filter((e: any) => e.kind === eventKindFilter);
    }
    return list;
  }, [data?.petEvents, eventFilter, eventKindFilter]);

  const paginatedEvents = useMemo(() => {
    const start = (eventPage - 1) * eventsPerPage;
    return filteredEvents.slice(start, start + eventsPerPage);
  }, [filteredEvents, eventPage]);

  const paginatedAwards = useMemo(() => {
    if (!awardsPageData) return [];
    const start = (awardPage - 1) * awardsPerPage;
    return awardsPageData.slice(start, start + awardsPerPage);
  }, [awardsPageData, awardPage]);

  if (isLoading) {
    return (
      <PortalLayout title="Sports & Athletics" subtitle="Loading your physical assessment..." themeClass="theme-student">
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-400">Loading live athletic records...</span>
        </div>
      </PortalLayout>
    );
  }

  if (!data) {
    return (
      <PortalLayout title="Sports & Athletics" subtitle="Data not found." themeClass="theme-student">
        <div className="text-center text-slate-400 mt-20 font-bold">Could not load sports data.</div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout
      title="Sports & Athletics"
      subtitle={`Track physical fitness, events, and health metrics for ${data.studentName} · Class ${data.className}`}
      avatarLetter={data.studentName.charAt(0)}
      avatarColor="#06b6d4"
      themeClass="theme-student"
      accentColor="#06b6d4"
    >
      {/* Modern Navigation Tabs */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 w-full md:w-fit mb-8 overflow-x-auto gap-1">
        {[
          { id: "overview", label: "Record & Health", icon: Activity },
          { id: "events", label: "Events & Competitions", icon: Calendar },
          { id: "awards", label: "Awards & Certificates", icon: Trophy },
          { id: "clubs", label: "Sports Clubs", icon: Shield }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setEventPage(1);
                setAwardPage(1);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all whitespace-nowrap ${
                isActive 
                  ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400"
                  : "text-slate-500 hover:bg-slate-50 hover:text-cyan-600 dark:hover:bg-slate-800"
              }`}
            >
              <Icon size={16} className={isActive ? "text-cyan-500" : "text-slate-400"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards">
        
        {/* TAB 1: HEALTH & FITNESS RECORD */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Heart className="text-rose-500" /> Health & Fitness Profile
            </h2>
            
            {!data.petFitness ? (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl text-center border border-slate-200 dark:border-slate-700 border-dashed">
                <AlertTriangle size={24} className="mx-auto text-amber-400 mb-2" />
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">No Fitness Record Found</h3>
                <p className="text-xs text-slate-500 mt-1">Your Physical Education Teacher has not recorded your fitness metrics yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* BMI Card */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">BMI & Vitals</div>
                  <div>
                    <div className="text-2xl font-black text-slate-800 dark:text-white">
                      {((data.petFitness.weightKg) / Math.pow(data.petFitness.heightCm / 100, 2)).toFixed(1)}
                    </div>
                    <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                      {data.petFitness.weightKg} kg / {data.petFitness.heightCm} cm
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Endurance</div>
                  <div>
                    <div className="text-2xl font-black text-slate-800 dark:text-white">{data.petFitness.endurance}/100</div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${data.petFitness.endurance}%` }} />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Strength</div>
                  <div>
                    <div className="text-2xl font-black text-slate-800 dark:text-white">{data.petFitness.strength}/100</div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: `${data.petFitness.strength}%` }} />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Speed</div>
                  <div>
                    <div className="text-2xl font-black text-slate-800 dark:text-white">{data.petFitness.speed}/100</div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${data.petFitness.speed}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EVENTS & COMPETITIONS */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Calendar className="text-blue-500" /> Events & Competitions
              </h2>
              
              {/* Filters */}
              <div className="flex gap-2">
                <select 
                  value={eventKindFilter} 
                  onChange={(e) => { setEventKindFilter(e.target.value); setEventPage(1); }}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
                >
                  <option value="All">All Types</option>
                  <option value="Event">Events</option>
                  <option value="Competition">Competitions</option>
                </select>
                <select 
                  value={eventFilter} 
                  onChange={(e) => { setEventFilter(e.target.value); setEventPage(1); }}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
                >
                  <option value="All">All Status</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {paginatedEvents.map(ev => (
                  <div key={ev.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center shrink-0">
                      <Trophy size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-extrabold text-slate-800 dark:text-white truncate">{ev.name}</h4>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          ev.status === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {ev.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {ev.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                        <span className="flex items-center gap-1"><MapPin size={12} /> {ev.venue}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {ev.date}</span>
                        <span className="flex items-center gap-1"><Target size={12} /> {ev.sport}</span>
                      </div>
                    </div>
                    {ev.result && (
                      <div className="shrink-0 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg text-xs font-bold text-yellow-700 dark:text-yellow-500 flex items-center gap-1.5">
                        <Award size={14} />
                        {ev.result}
                      </div>
                    )}
                  </div>
                ))}
                
                {filteredEvents.length === 0 && (
                  <div className="p-12 text-center">
                    <Calendar size={32} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 font-bold">No events found.</p>
                  </div>
                )}
              </div>
              
              {/* Pagination */}
              {filteredEvents.length > eventsPerPage && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <button 
                    onClick={() => setEventPage(p => Math.max(1, p - 1))}
                    disabled={eventPage === 1}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-bold text-slate-500">Page {eventPage} of {Math.ceil(filteredEvents.length / eventsPerPage)}</span>
                  <button 
                    onClick={() => setEventPage(p => Math.min(Math.ceil(filteredEvents.length / eventsPerPage), p + 1))}
                    disabled={eventPage === Math.ceil(filteredEvents.length / eventsPerPage)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: AWARDS & CERTIFICATES */}
        {activeTab === "awards" && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Award className="text-yellow-500" /> Awards & Certificates
            </h2>
            
            {(!awardsPageData || awardsPageData.length === 0) ? (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl text-center border border-slate-200 dark:border-slate-700 border-dashed">
                <Trophy size={32} className="mx-auto text-slate-300 mb-3" />
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">No Awards Yet</h3>
                <p className="text-xs text-slate-500 mt-1">Keep participating in sports events to earn certificates and medals.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedAwards.map(aw => {
                    const color = aw.medal === "Gold" ? "yellow" : aw.medal === "Silver" ? "slate" : aw.medal === "Bronze" ? "amber" : "cyan";
                    return (
                    <div key={aw.id} className="relative overflow-hidden bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group flex items-center gap-4">
                      <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform`} />
                      <div className={`w-12 h-12 shrink-0 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-500 flex items-center justify-center`}>
                        <Award size={20} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 dark:text-white text-sm line-clamp-1">{aw.event}</h4>
                        <p className="text-[10px] font-bold text-slate-500">{aw.sport} · {aw.date}</p>
                        <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-1">{aw.medal} {aw.certificateIssued ? "· Certified" : ""}</p>
                      </div>
                    </div>
                    )
                  })}
                </div>

                {/* Pagination */}
                {awardsPageData.length > awardsPerPage && (
                  <div className="flex justify-center gap-2 mt-6">
                    <button onClick={() => setAwardPage(p => Math.max(1, p - 1))} disabled={awardPage === 1} className="p-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-40"><ChevronLeft size={14} /></button>
                    <button onClick={() => setAwardPage(p => Math.min(Math.ceil(awardsPageData.length / awardsPerPage), p + 1))} disabled={awardPage === Math.ceil(awardsPageData.length / awardsPerPage)} className="p-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-40"><ChevronRight size={14} /></button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 4: CLUBS */}
        {activeTab === "clubs" && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Shield className="text-purple-500" /> Sports Clubs
            </h2>
            
            {(!data.clubs || data.clubs.length === 0) ? (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl text-center border border-slate-200 dark:border-slate-700 border-dashed">
                <Users size={32} className="mx-auto text-slate-300 mb-3" />
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Not in any clubs</h3>
                <p className="text-xs text-slate-500 mt-1">Join a sports club to participate in team activities and events.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.clubs.map((c: any) => (
                  <div key={c.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center shrink-0">
                      <Shield size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-sm">{c.club?.name || "Club"}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[9px] font-bold uppercase text-slate-600 dark:text-slate-400">
                          Role: {c.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </PortalLayout>
  );
}
