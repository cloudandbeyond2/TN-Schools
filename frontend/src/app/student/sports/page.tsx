"use client";

import PortalLayout from "@/components/PortalLayout";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { 
  Trophy, 
  Activity, 
  Award, 
  Calendar, 
  Heart, 
  User, 
  PlusCircle, 
  X, 
  AlertTriangle,
  Flame,
  CheckCircle,
  HelpCircle
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Team {
  name: string;
  role: string;
  icon: string;
  color: string;
  match: string;
  date: string;
}

interface FitnessStat {
  label: string;
  value: string;
  score: number;
  icon: string;
  color: string;
}

interface Event {
  title: string;
  date: string;
  type: string;
  icon: string;
}

interface HealthLog {
  date: string;
  activity: string;
  duration: string;
  calories: number;
  intensity: string;
}

interface Injury {
  id: string;
  type: string;
  severity: string;
  description: string;
  status: string;
  date: string;
}

interface StudentSportsData {
  studentId: string;
  studentName: string;
  className: string;
  rollNumber: string;
  teams: Team[];
  stats: FitnessStat[];
  events: Event[];
  logs: HealthLog[];
  injuries: Injury[];
}

interface LeaderboardEntry {
  name: string;
  className: string;
  rollNumber: string;
  value: string;
  score: number;
}

interface LeaderboardData {
  roster: any[];
  leaderboard: { [key: string]: LeaderboardEntry[] };
}

export default function SportsPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState<StudentSportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Leaderboard state
  const [leaderboardSection, setLeaderboardSection] = useState("high"); // default high school
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [activeLeaderboardCategory, setActiveLeaderboardCategory] = useState("Overall Fitness");
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  // Injury modal state
  const [isInjuryModalOpen, setIsInjuryModalOpen] = useState(false);
  const [injuryType, setInjuryType] = useState("Sprain");
  const [injurySeverity, setInjurySeverity] = useState("Mild");
  const [injuryDesc, setInjuryDesc] = useState("");
  const [injuryDate, setInjuryDate] = useState("Today");
  const [isSubmittingInjury, setIsSubmittingInjury] = useState(false);

  // Activity modal state
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityName, setActivityName] = useState("Football Practice");
  const [activityDuration, setActivityDuration] = useState("1h 30m");
  const [activityIntensity, setActivityIntensity] = useState("High");
  const [activityCalories, setActivityCalories] = useState(450);
  const [activityDate, setActivityDate] = useState("Today");
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false);

  // Submit Activity Log
  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    const targetStudentId = (session?.user as any)?.id || "demo-student";

    try {
      setIsSubmittingActivity(true);
      const res = await fetch(`${API_BASE}/api/sports/profile/${targetStudentId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity: activityName,
          duration: activityDuration,
          intensity: activityIntensity,
          calories: activityCalories,
          date: activityDate
        })
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire({
          title: "Workout Logged",
          text: `Your workout log has been registered successfully.`,
          icon: "success",
          confirmButtonColor: "#06b6d4"
        });
        setIsActivityModalOpen(false);
        fetchSportsData();
      } else {
        Swal.fire("Error", json.error || "Failed to log workout", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Server connection failed", "error");
    } finally {
      setIsSubmittingActivity(false);
    }
  };

  // 1. Fetch Student Sports Profile
  async function fetchSportsData() {
    if (status === "loading") return;
    const targetStudentId = (session?.user as any)?.id || "demo-student";

    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/sports/${targetStudentId}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        
        // Resolve student's section automatically to pre-load relevant leaderboard
        const className = json.data.className || "";
        const classNum = parseInt(className.replace(/\D/g, ""), 10);
        if (classNum >= 6 && classNum <= 8) {
          setLeaderboardSection("middle");
        } else if (classNum >= 11 && classNum <= 12) {
          setLeaderboardSection("hsc");
        } else {
          setLeaderboardSection("high");
        }
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

  // 2. Fetch Leaderboard Data when section switches or tab changes to leaderboard
  useEffect(() => {
    if (activeTab !== "leaderboard") return;

    async function fetchLeaderboard() {
      try {
        setIsLoadingLeaderboard(true);
        const res = await fetch(`${API_BASE}/api/sports/section/${leaderboardSection}`);
        const json = await res.json();
        if (json.success) {
          setLeaderboardData(json.data);
          
          // Set first available category as active
          const categories = Object.keys(json.data.leaderboard);
          if (categories.length > 0 && !categories.includes(activeLeaderboardCategory)) {
            setActiveLeaderboardCategory(categories[0]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard data:", err);
      } finally {
        setIsLoadingLeaderboard(false);
      }
    }
    fetchLeaderboard();
  }, [leaderboardSection, activeTab]);

  // 3. Handle Injury Submission
  const handleReportInjury = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.studentId) return;

    try {
      setIsSubmittingInjury(true);
      const res = await fetch(`${API_BASE}/api/sports/injury`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: data.studentId,
          type: injuryType,
          severity: injurySeverity,
          description: injuryDesc,
          date: injuryDate
        })
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire({
          title: "Injury Report Filed",
          text: "The physical coach and school medical unit have been notified.",
          icon: "success",
          confirmButtonColor: "#06b6d4"
        });
        setIsInjuryModalOpen(false);
        setInjuryDesc("");
        // Reload sports profile to display new injury report
        fetchSportsData();
      } else {
        Swal.fire("Error", json.error || "Failed to file report", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Server connection failed", "error");
    } finally {
      setIsSubmittingInjury(false);
    }
  };

  if (isLoading) {
    return (
      <PortalLayout title="Sports & Athletics" subtitle="Loading your physical assessment..." themeClass="theme-student">
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400">Loading live athletic records...</span>
        </div>
      </PortalLayout>
    );
  }

  if (!data) {
    return (
      <PortalLayout title="Sports & Athletics" subtitle="Data not found." themeClass="theme-student">
        <div className="text-center text-slate-400 mt-20">Could not load sports data.</div>
      </PortalLayout>
    );
  }

  const { teams: myTeams, stats: fitnessStats, events: upcomingEvents, logs: healthLog, injuries: myInjuries } = data;

  return (
    <PortalLayout
      title="Sports & Athletics"
      subtitle={`Track physical fitness, team events, and health metrics for ${data.studentName} · ${(() => {
        const classNum = parseInt(data.className.replace(/\D/g, ""), 10);
        if (classNum >= 6 && classNum <= 8) return "Middle School (Grades 6-8)";
        if (classNum >= 11 && classNum <= 12) return "Higher Secondary (Grades 11-12)";
        return "High School (Grades 9-10)";
      })()} Sports.`}
      avatarLetter={data.studentName.charAt(0)}
      avatarColor="#06b6d4"
      themeClass="theme-student"
      accentColor="#06b6d4"
    >
      {/* Tab Selectors */}
      <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50 w-full md:w-fit mb-6 overflow-x-auto">
        <button 
          onClick={() => setActiveTab("overview")}
          className={`flex-1 md:flex-initial px-6 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${activeTab === "overview" ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "text-black dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400"}`}
        >
          My Overview
        </button>
        <button 
          onClick={() => setActiveTab("teams")}
          className={`flex-1 md:flex-initial px-6 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${activeTab === "teams" ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "text-black dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400"}`}
        >
          Teams & Clubs
        </button>
        <button 
          onClick={() => setActiveTab("leaderboard")}
          className={`flex-1 md:flex-initial px-6 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${activeTab === "leaderboard" ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "text-black dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400"}`}
        >
          School Leaderboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main tab content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <>
              {/* Dynamic Physical Profile stats */}
              <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 relative overflow-hidden bg-white dark:bg-transparent">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full"></div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
                  <h2 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
                    <span className="text-2xl">📊</span> Physical Assessment Profile
                  </h2>
                  <span className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-3 py-1 rounded-xl border border-cyan-500/20 font-black text-[10px] uppercase tracking-wider w-fit">
                    {(() => {
                      const classNum = parseInt(data.className.replace(/\D/g, ""), 10);
                      if (classNum >= 6 && classNum <= 8) return "Middle School (Grades 6-8) Program";
                      if (classNum >= 11 && classNum <= 12) return "Higher Secondary (Grades 11-12) Program";
                      return "High School (Grades 9-10) Program";
                    })()}
                  </span>
                </div>
                
                {fitnessStats.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No physical scores logged by coach yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 relative z-10">
                    {fitnessStats.map((stat, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex flex-col items-center justify-center text-center group hover:border-cyan-500/50 transition-colors">
                        <div className="relative w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-slate-300 dark:text-slate-700"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            />
                            <path
                              className={`${stat.color.replace('bg-', 'text-')}`}
                              strokeDasharray={`${stat.score}, 100`}
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            />
                          </svg>
                          <span className="text-2xl relative z-10">{stat.icon}</span>
                        </div>
                        <span className="text-lg font-black text-black dark:text-white leading-none mb-1">{stat.value}</span>
                        <span className="text-[10px] uppercase font-bold text-black dark:text-slate-400 tracking-wider">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Workout log */}
              <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                    <span className="text-xl">🔥</span> Activity Log
                  </h2>
                  <button
                    onClick={() => setIsActivityModalOpen(true)}
                    className="flex items-center gap-1 bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg border border-cyan-500/20 font-bold text-[11px] transition-all active:scale-95 shadow-sm"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Log Exercise</span>
                  </button>
                </div>

                {healthLog.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No workout logs registered yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700/50">
                          <th className="py-3 px-4 text-xs font-bold text-black dark:text-white uppercase tracking-wider">Date</th>
                          <th className="py-3 px-4 text-xs font-bold text-black dark:text-white uppercase tracking-wider">Activity</th>
                          <th className="py-3 px-4 text-xs font-bold text-black dark:text-white uppercase tracking-wider">Duration</th>
                          <th className="py-3 px-4 text-xs font-bold text-black dark:text-white uppercase tracking-wider">Intensity</th>
                          <th className="py-3 px-4 text-xs font-bold text-black dark:text-white uppercase tracking-wider text-right">Calories</th>
                        </tr>
                      </thead>
                      <tbody>
                        {healthLog.map((log, idx) => (
                          <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="py-4 px-4 text-sm text-black dark:text-slate-400 font-medium">{log.date}</td>
                            <td className="py-4 px-4 text-sm font-bold text-black dark:text-white">{log.activity}</td>
                            <td className="py-4 px-4 text-sm text-black dark:text-slate-300">{log.duration}</td>
                            <td className="py-4 px-4">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded border 
                                ${log.intensity === 'High' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' : 
                                  log.intensity === 'Maximum' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' : 
                                  'bg-emerald-500/10 text-emerald-650 dark:text-emerald-500 border-emerald-500/20'}`}
                              >
                                {log.intensity}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm font-bold text-cyan-600 dark:text-cyan-400 text-right">{log.calories} kcal</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Personal Injuries tracking */}
              <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
                <h2 className="text-lg font-bold text-black dark:text-white mb-6 flex items-center gap-2">
                  <span className="text-xl">🚑</span> My Safety & Injury Logs
                </h2>
                
                {myInjuries.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No active injuries reported. Stay safe!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myInjuries.map((injury) => (
                      <div key={injury.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-black dark:text-white text-sm">{injury.type}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              injury.severity === 'Severe' ? 'bg-rose-500/10 text-rose-550 border border-rose-500/20' :
                              injury.severity === 'Moderate' ? 'bg-amber-500/10 text-amber-550 border border-amber-500/20' :
                              'bg-cyan-500/10 text-cyan-600 border border-cyan-500/20'
                            }`}>{injury.severity}</span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{injury.description || "No description provided"}</p>
                          <span className="text-[10px] text-slate-400 block mt-1.5">📅 Reported: {injury.date}</span>
                        </div>
                        
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[10px] border ${
                            injury.status === 'Cleared to Play' || injury.status === 'Recovered' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                            injury.status === 'Under Treatment' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            'bg-slate-500/10 text-slate-450 border-slate-500/20'
                          }`}>
                            {injury.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: TEAMS & CLUBS */}
          {activeTab === "teams" && (
            <div className="space-y-6">
              <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
                <h2 className="text-lg font-bold text-black dark:text-white mb-6 flex items-center gap-2">
                  <span className="text-xl">🏆</span> Active Teams & Club Rosters
                </h2>

                {myTeams.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    You are not assigned to any sports clubs or active rosters.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myTeams.map((team, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${team.color} flex items-center justify-center text-2xl shadow-lg shrink-0`}>
                            {team.icon}
                          </div>
                          <div>
                            <h3 className="font-black text-black dark:text-white text-base leading-tight">{team.name}</h3>
                            <p className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mt-0.5">{team.role}</p>
                          </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200 dark:border-slate-700 text-xs">
                          <p className="font-bold text-black dark:text-slate-350 truncate">Match: {team.match}</p>
                          <p className="text-slate-400 mt-1 font-semibold">📅 Schedule: {team.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming school wide tournaments/events */}
              <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
                <h2 className="text-lg font-bold text-black dark:text-white mb-6 flex items-center gap-2">
                  <span className="text-xl">🏟️</span> Upcoming Tournaments & Selection Trials
                </h2>

                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">No scheduled sports events.</div>
                ) : (
                  <div className="space-y-4">
                    {upcomingEvents.map((event, idx) => (
                      <div key={idx} className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-900/20 rounded-xl border border-slate-200/50 dark:border-slate-700/30">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-lg shrink-0">
                          {event.icon}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-black dark:text-white">{event.title}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">
                            <span>{event.date}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                            <span className="text-cyan-600 dark:text-cyan-400 font-bold">{event.type}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LEADERBOARDS */}
          {activeTab === "leaderboard" && (
            <div className="space-y-6">
              <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
                
                {/* Header & Section select */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                      <span className="text-xl">🎖️</span> School Athletic Leaderboards
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Top performing students ranked by PE scores</p>
                  </div>
                  
                  {/* Section Badge (Read-only for students so they only see their own competitive category) */}
                  <span className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-3 py-1.5 rounded-xl border border-cyan-500/20 font-bold text-xs uppercase tracking-wider">
                    {leaderboardSection === 'middle' ? 'Middle School (6-8)' : leaderboardSection === 'hsc' ? 'HSC (11-12)' : 'High School (9-10)'}
                  </span>
                </div>

                {isLoadingLeaderboard ? (
                  <div className="text-center py-16 text-xs text-slate-400 flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading section leaderboard...</span>
                  </div>
                ) : !leaderboardData || Object.keys(leaderboardData.leaderboard).length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    No leaderboard scores recorded for this section.
                  </div>
                ) : (
                  <div>
                    {/* Leaderboard Event tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                      {Object.keys(leaderboardData.leaderboard).map((category) => (
                        <button
                          key={category}
                          onClick={() => setActiveLeaderboardCategory(category)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${
                            activeLeaderboardCategory === category 
                              ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30" 
                              : "bg-slate-50 dark:bg-slate-900/30 text-slate-500 border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>

                    {/* Rankings List */}
                    <div className="space-y-2">
                      {(leaderboardData.leaderboard[activeLeaderboardCategory] || []).map((entry, index) => (
                        <div 
                          key={index} 
                          className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs transition-all ${
                            entry.name === data.studentName
                              ? "bg-cyan-500/10 border-cyan-500/40 shadow-sm"
                              : "bg-slate-50/50 dark:bg-slate-900/35 border-slate-200 dark:border-slate-800/40"
                          }`}
                        >
                          {/* Rank badge + Name */}
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black ${
                              index === 0 ? 'bg-amber-400 text-amber-950 font-black shadow-sm shadow-amber-400/20' :
                              index === 1 ? 'bg-slate-300 text-slate-900' :
                              index === 2 ? 'bg-amber-600 text-amber-100 shadow-sm shadow-amber-750/15' :
                              'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}>
                              {index + 1}
                            </span>
                            <div>
                              <div className="font-bold text-black dark:text-white text-sm">
                                {entry.name} {entry.name === data.studentName && <span className="text-[10px] bg-cyan-500 text-white px-1.5 py-0.5 rounded ml-1">You</span>}
                              </div>
                              <span className="text-[10px] text-slate-400 mt-0.5">Class {entry.className} · Roll {entry.rollNumber}</span>
                            </div>
                          </div>

                          {/* Metric scores */}
                          <div className="flex items-center gap-5 text-right">
                            <div>
                              <span className="font-bold text-black dark:text-white text-sm block">{entry.value}</span>
                              <span className="text-[9px] uppercase tracking-wider text-slate-400">Score</span>
                            </div>
                            <div className="w-12 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 text-center border border-slate-200/50 dark:border-slate-850">
                              <span className="font-black text-cyan-600 dark:text-cyan-400 text-sm">{entry.score}</span>
                              <span className="block text-[8px] uppercase font-bold text-slate-400 leading-none">Pts</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {(!leaderboardData.leaderboard[activeLeaderboardCategory] || leaderboardData.leaderboard[activeLeaderboardCategory].length === 0) && (
                        <div className="text-center py-8 text-slate-400 text-xs">No entries for this category.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Static info cards (My Teams, Events summary, Injury Button) */}
        <div className="space-y-6">
          
          {/* Quick list of Teams */}
          {activeTab !== "teams" && (
            <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
              <h2 className="text-lg font-bold text-black dark:text-white mb-6 flex items-center gap-2">
                <span className="text-xl">🏆</span> My Teams
              </h2>
              <div className="space-y-4">
                {myTeams.map((team, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 relative overflow-hidden group hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${team.color} flex items-center justify-center text-xl shadow-lg shrink-0`}>
                        {team.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-black dark:text-white text-sm leading-none">{team.name}</h3>
                        <p className="text-[9px] font-bold text-black dark:text-slate-400 uppercase tracking-wider mt-1">{team.role}</p>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800/80 rounded-lg p-2.5 border border-slate-200 dark:border-slate-700 text-[11px]">
                      <p className="font-bold text-black dark:text-slate-300 truncate">Next: {team.match}</p>
                      <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold mt-0.5">📅 {team.date}</p>
                    </div>
                  </div>
                ))}
                {myTeams.length === 0 && (
                  <div className="text-center py-4 text-xs text-slate-400">No active team memberships.</div>
                )}
              </div>
            </div>
          )}

          {/* Quick list of Events */}
          {activeTab !== "teams" && (
            <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
              <h2 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                <span className="text-xl">📅</span> Upcoming Events
              </h2>
              <div className="space-y-4">
                {upcomingEvents.map((event, idx) => (
                  <div key={idx} className="relative flex gap-4 pb-1">
                    {idx !== upcomingEvents.length - 1 && (
                      <div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-slate-200 dark:bg-slate-800"></div>
                    )}
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 z-10 text-sm">
                      {event.icon}
                    </div>
                    <div className="pt-0.5">
                      <h4 className="text-sm font-bold text-black dark:text-white leading-tight">{event.title}</h4>
                      <p className="text-[10px] text-black dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{event.date}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                        <span className="text-cyan-600 dark:text-cyan-400 font-bold">{event.type}</span>
                      </p>
                    </div>
                  </div>
                ))}
                {upcomingEvents.length === 0 && (
                  <div className="text-center py-4 text-xs text-slate-400">No upcoming events scheduled.</div>
                )}
              </div>
            </div>
          )}

          {/* Report Injury Card & Trigger Button */}
          <div className="glass rounded-3xl p-6 border border-rose-500/30 bg-gradient-to-br from-rose-50 to-white dark:from-rose-900/10 dark:to-transparent">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center text-2xl border border-rose-500/30 shrink-0">
                🚑
              </div>
              <div>
                <h3 className="font-bold text-black dark:text-white text-base">Report Injury</h3>
                <p className="text-xs text-slate-400">Notify the school nurse & PE coach immediately.</p>
              </div>
            </div>
            <button 
              onClick={() => setIsInjuryModalOpen(true)}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-rose-500/25 active:scale-[0.98]"
            >
              Fill Injury Form
            </button>
          </div>

        </div>

      </div>

      {/* REPORT INJURY MODAL DIALOG */}
      {isInjuryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111a2c] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Report Athletic Injury</span>
              </h3>
              <button 
                onClick={() => setIsInjuryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleReportInjury} className="p-6 space-y-4 text-xs">
              {/* Injury Type */}
              <div>
                <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Injury Type</label>
                <select
                  value={injuryType}
                  onChange={(e) => setInjuryType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Sprain / Strain">Sprain / Strain (Ankle, Wrist, Muscle)</option>
                  <option value="Fracture / Dislocation">Fracture / Dislocation</option>
                  <option value="Cuts / Bruises / Bleeding">Cuts / Bruises / Bleeding</option>
                  <option value="Heat Exhaustion / Cramps">Heat Exhaustion / Cramps</option>
                  <option value="Concussion / Head Trauma">Concussion / Head Trauma</option>
                  <option value="Other Physical Injury">Other Physical Injury</option>
                </select>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Severity Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Mild", "Moderate", "Severe"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setInjurySeverity(level)}
                      className={`py-2 rounded-xl font-bold border transition-colors ${
                        injurySeverity === level
                          ? level === "Severe" 
                            ? "bg-rose-500/15 text-rose-550 border-rose-500/40"
                            : level === "Moderate"
                              ? "bg-amber-500/15 text-amber-550 border-amber-500/40"
                              : "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/40"
                          : "bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Date / Time of Incident</label>
                <input
                  type="text"
                  value={injuryDate}
                  onChange={(e) => setInjuryDate(e.target.value)}
                  placeholder="e.g., Today, 4:00 PM or Oct 18, Morning"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Describe what happened</label>
                <textarea
                  value={injuryDesc}
                  onChange={(e) => setInjuryDesc(e.target.value)}
                  placeholder="Explain how the injury occurred and where the pain is located..."
                  className="w-full h-24 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-cyan-500 resize-none"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-150 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInjuryModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-white rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingInjury}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-400 text-white rounded-xl font-bold transition-colors shadow-lg shadow-rose-500/20"
                >
                  {isSubmittingInjury ? "Submitting..." : "Send Injury Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LOG WORKOUT / EXERCISE */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111a2c] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-cyan-500" />
                <span>Log Exercise Workout</span>
              </h3>
              <button 
                onClick={() => setIsActivityModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleLogActivity} className="p-6 space-y-4 text-xs">
              
              {/* Activity name */}
              <div>
                <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Exercise / Sport Activity</label>
                <input
                  type="text"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  placeholder="e.g. Football Practice, Running, Yoga, Cricket match"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* Duration and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Duration</label>
                  <input
                    type="text"
                    value={activityDuration}
                    onChange={(e) => setActivityDuration(e.target.value)}
                    placeholder="e.g. 1h 30m or 45m"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Date</label>
                  <input
                    type="text"
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                    placeholder="e.g. Today or Oct 18"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              {/* Intensity and Calories */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Intensity</label>
                  <select
                    value={activityIntensity}
                    onChange={(e) => setActivityIntensity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-cyan-550"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Maximum">Maximum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Calories Burned (kcal)</label>
                  <input
                    type="number"
                    value={activityCalories}
                    onChange={(e) => setActivityCalories(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-150 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-white rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingActivity}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-405 text-white rounded-xl font-bold transition-colors shadow-lg shadow-cyan-500/20"
                >
                  {isSubmittingActivity ? "Logging..." : "Log Workout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
