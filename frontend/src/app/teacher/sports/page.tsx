// "use client";

// import PortalLayout from "@/components/PortalLayout";
// import { useState, useEffect } from "react";
// import { useSession } from "next-auth/react";
// import Swal from "sweetalert2";
// import { 
//   Trophy, 
//   Activity, 
//   Users, 
//   Calendar, 
//   Heart, 
//   PlusCircle, 
//   X, 
//   Edit, 
//   UserPlus, 
//   Check, 
//   AlertTriangle,
//   UserCheck,
//   Search,
//   Sliders
// } from "lucide-react";

// const API_BASE = "http://localhost:5000";

// interface RosterStudent {
//   studentId: string;
//   name: string;
//   rollNumber: string;
//   className: string;
//   hasProfile: boolean;
//   profileId: string | null;
//   stats: Array<{ label: string; value: string; score: number; icon: string; color: string }>;
//   teams: Array<{ name: string; role: string }>;
//   logsCount: number;
// }

// interface LeaderboardEntry {
//   name: string;
//   className: string;
//   rollNumber: string;
//   value: string;
//   score: number;
// }

// interface InjuryReport {
//   id: string;
//   studentId: string;
//   studentName: string;
//   className: string;
//   type: string;
//   severity: string;
//   description: string;
//   status: string;
//   date: string;
//   createdAt: string;
// }

// export default function PETeacherSportsPage() {
//   const { data: session, status } = useSession();
//   const schoolId = (session?.user as any)?.schoolId;

//   const [activeTab, setActiveTab] = useState("roster");
//   const [section, setSection] = useState("high"); // middle, high, hsc
//   const [roster, setRoster] = useState<RosterStudent[]>([]);
//   const [injuries, setInjuries] = useState<InjuryReport[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isLoading, setIsLoading] = useState(true);

//   // Score Modal States
//   const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState<RosterStudent | null>(null);
  
//   // Custom stats inputs
//   const [sprintVal, setSprintVal] = useState("12.5s");
//   const [sprintScore, setSprintScore] = useState(85);
//   const [shotPutVal, setShotPutVal] = useState("9.8m");
//   const [shotPutScore, setShotPutScore] = useState(80);
//   const [cardioVal, setCardioVal] = useState("Excellent");
//   const [cardioScore, setCardioScore] = useState(90);
//   const [agilityVal, setAgilityVal] = useState("Above Average");
//   const [agilityScore, setAgilityScore] = useState(78);
//   const [overallVal, setOverallVal] = useState("Grade A");
//   const [overallScore, setOverallScore] = useState(88);
//   const [isSavingScores, setIsSavingScores] = useState(false);

//   // Team Assignment Modal States
//   const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
//   const [teamStudent, setTeamStudent] = useState<RosterStudent | null>(null);
//   const [teamName, setTeamName] = useState("School Football Team");
//   const [teamRole, setTeamRole] = useState("Midfielder");
//   const [teamIcon, setTeamIcon] = useState("⚽");
//   const [teamColor, setTeamColor] = useState("from-blue-500 to-cyan-500");
//   const [teamMatch, setTeamMatch] = useState("Inter-school Championship");
//   const [teamDate, setTeamDate] = useState("Friday, 4:00 PM");
//   const [isSavingTeam, setIsSavingTeam] = useState(false);

//   // Event Scheduler Modal States
//   const [isEventModalOpen, setIsEventModalOpen] = useState(false);
//   const [eventStudent, setEventStudent] = useState<RosterStudent | null>(null);
//   const [eventTitle, setEventTitle] = useState("Basketball Team Tryouts");
//   const [eventDate, setEventDate] = useState("Nov 15, 2026");
//   const [eventType, setEventType] = useState("Selection Trials");
//   const [eventIcon, setEventIcon] = useState("🏀");
//   const [isSavingEvent, setIsSavingEvent] = useState(false);

//   const handleOpenEventModal = (student: RosterStudent) => {
//     setEventStudent(student);
//     setIsEventModalOpen(true);
//   };

//   const handleSaveEvent = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!eventStudent) return;

//     try {
//       setIsSavingEvent(true);
//       const res = await fetch(`${API_BASE}/api/sports/profile/${eventStudent.studentId}/events`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           title: eventTitle,
//           date: eventDate,
//           type: eventType,
//           icon: eventIcon
//         })
//       });
//       const json = await res.json();
//       if (json.success) {
//         Swal.fire("Event Scheduled", `Successfully scheduled ${eventTitle} for ${eventStudent.name}`, "success");
//         setIsEventModalOpen(false);
//         fetchRosterData();
//       } else {
//         Swal.fire("Error", json.error || "Failed to schedule event", "error");
//       }
//     } catch (err) {
//       Swal.fire("Error", "Server connection failed", "error");
//     } finally {
//       setIsSavingEvent(false);
//     }
//   };

//   // 1. Fetch Roster & Leaderboard based on section
//   async function fetchRosterData() {
//     try {
//       setIsLoading(true);
//       const res = await fetch(`${API_BASE}/api/sports/section/${section}?schoolId=${schoolId || ""}`);
//       const json = await res.json();
//       if (json.success) {
//         setRoster(json.data.roster);
//       }
//     } catch (err) {
//       console.error("Failed to fetch roster data:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   // 2. Fetch Injury Tracker data
//   async function fetchInjuriesData() {
//     try {
//       const res = await fetch(`${API_BASE}/api/sports/injuries/all`);
//       const json = await res.json();
//       if (json.success) {
//         setInjuries(json.data);
//       }
//     } catch (err) {
//       console.error("Failed to fetch injuries list:", err);
//     }
//   }

//   useEffect(() => {
//     if (activeTab === "roster") {
//       fetchRosterData();
//     } else if (activeTab === "injuries") {
//       fetchInjuriesData();
//     }
//   }, [section, activeTab, session, status]);

//   // 3. Open score update modal
//   const handleOpenScores = (student: RosterStudent) => {
//     setSelectedStudent(student);
    
//     // Pre-populate if stats exist
//     const sprint = student.stats.find(s => s.label === "Sprint Speed");
//     setSprintVal(sprint ? sprint.value : "12.5s");
//     setSprintScore(sprint ? sprint.score : 85);

//     const shotPut = student.stats.find(s => s.label === "Shot Put");
//     setShotPutVal(shotPut ? shotPut.value : "9.8m");
//     setShotPutScore(shotPut ? shotPut.score : 80);

//     const cardio = student.stats.find(s => s.label === "Cardio Endurance");
//     setCardioVal(cardio ? cardio.value : "Excellent");
//     setCardioScore(cardio ? cardio.score : 90);

//     const agility = student.stats.find(s => s.label === "Agility");
//     setAgilityVal(agility ? agility.value : "Above Average");
//     setAgilityScore(agility ? agility.score : 78);

//     const overall = student.stats.find(s => s.label === "Overall Fitness");
//     setOverallVal(overall ? overall.value : "Grade A");
//     setOverallScore(overall ? overall.score : 88);

//     setIsScoreModalOpen(true);
//   };

//   // 4. Save Fitness & Event Scores
//   const handleSaveScores = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedStudent) return;

//     try {
//       setIsSavingScores(true);
//       const res = await fetch(`${API_BASE}/api/sports/profile/${selectedStudent.studentId}/stats`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           stats: [
//             { label: "Sprint Speed", value: sprintVal, score: sprintScore, icon: "⚡", color: "bg-amber-500" },
//             { label: "Shot Put", value: shotPutVal, score: shotPutScore, icon: "☄️", color: "bg-orange-500" },
//             { label: "Cardio Endurance", value: cardioVal, score: cardioScore, icon: "🫀", color: "bg-rose-500" },
//             { label: "Agility", value: agilityVal, score: agilityScore, icon: "🤸‍♂️", color: "bg-blue-500" },
//             { label: "Overall Fitness", value: overallVal, score: overallScore, icon: "💪", color: "bg-emerald-500" }
//           ]
//         })
//       });
//       const json = await res.json();
//       if (json.success) {
//         Swal.fire("Scores Saved", `Successfully updated physical profile for ${selectedStudent.name}`, "success");
//         setIsScoreModalOpen(false);
//         fetchRosterData();
//       } else {
//         Swal.fire("Error", json.error || "Failed to update stats", "error");
//       }
//     } catch (err) {
//       Swal.fire("Error", "Server connection failed", "error");
//     } finally {
//       setIsSavingScores(false);
//     }
//   };

//   // 5. Open team assignment modal
//   const handleOpenTeamModal = (student: RosterStudent) => {
//     setTeamStudent(student);
//     setIsTeamModalOpen(true);
//   };

//   // 6. Save Team Membership
//   const handleSaveTeam = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!teamStudent) return;

//     try {
//       setIsSavingTeam(true);
//       const res = await fetch(`${API_BASE}/api/sports/profile/${teamStudent.studentId}/teams`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: teamName,
//           role: teamRole,
//           icon: teamIcon,
//           color: teamColor,
//           match: teamMatch,
//           date: teamDate
//         })
//       });
//       const json = await res.json();
//       if (json.success) {
//         Swal.fire("Team Assigned", `Successfully enrolled ${teamStudent.name} into ${teamName}`, "success");
//         setIsTeamModalOpen(false);
//         fetchRosterData();
//       } else {
//         Swal.fire("Error", json.error || "Failed to assign team", "error");
//       }
//     } catch (err) {
//       Swal.fire("Error", "Server connection failed", "error");
//     } finally {
//       setIsSavingTeam(false);
//     }
//   };

//   // 7. Update Injury Resolution Status
//   const handleUpdateInjuryStatus = async (id: string, newStatus: string) => {
//     try {
//       const res = await fetch(`${API_BASE}/api/sports/injury/${id}/status`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: newStatus })
//       });
//       const json = await res.json();
//       if (json.success) {
//         Swal.fire({
//           title: "Status Updated",
//           text: `Recovery status set to "${newStatus}"`,
//           icon: "success",
//           toast: true,
//           position: "top-end",
//           timer: 2500,
//           showConfirmButton: false
//         });
//         fetchInjuriesData();
//       }
//     } catch (err) {
//       Swal.fire("Error", "Failed to update recovery status", "error");
//     }
//   };

//   // Filter roster based on query
//   const filteredRoster = roster.filter(s => 
//     s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     s.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <PortalLayout
//       title="Sports & Athletics Desk"
//       subtitle="Physical Education Assessment, Sports Teams mapping, & Injury tracking board."
//       avatarLetter="C"
//       avatarColor="#06b6d4"
//       themeClass="theme-teacher"
//       accentColor="#06b6d4"
//     >
//       {/* Top Tabs */}
//       <div className="flex flex-col xl:flex-row bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50 w-full xl:w-fit mb-6 gap-1">
//         <button 
//           onClick={() => setActiveTab("roster")}
//           className={`flex-1 xl:flex-initial px-6 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${activeTab === "roster" ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "text-black dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400"}`}
//         >
//           📋 Student Roster & Scores
//         </button>
//         <button 
//           onClick={() => setActiveTab("injuries")}
//           className={`flex-1 xl:flex-initial px-6 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${activeTab === "injuries" ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "text-black dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400"}`}
//         >
//           🚑 Injury Tracker ({injuries.filter(i => i.status === 'Pending' || i.status === 'Under Treatment').length})
//         </button>
//       </div>

//       {/* TAB 1: STUDENT ROSTER & SCORE BOARD */}
//       {activeTab === "roster" && (
//         <div className="space-y-6">
//           <div className="theme-card p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
//             {/* Header filters */}
//             <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
              
//               {/* Section Filters */}
//               <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs w-full xl:w-auto">
//                 {[
//                   ["middle", "Middle (6-8)"],
//                   ["high", "High (9-10)"],
//                   ["hsc", "HSC (11-12)"]
//                 ].map(([key, label]) => (
//                   <button
//                     key={key}
//                     onClick={() => setSection(key)}
//                     className={`flex-1 xl:flex-none px-4 py-2 rounded-md font-bold transition-all ${section === key ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"}`}
//                   >
//                     {label}
//                   </button>
//                 ))}
//               </div>

//               {/* Roster Search */}
//               <div className="relative w-full xl:w-72">
//                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                 <input
//                   type="text"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   placeholder="Search students by name, roll..."
//                   className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-cyan-550 focus:bg-white transition-colors text-black dark:text-white"
//                 />
//               </div>

//             </div>

//             {/* Roster Data List */}
//             {isLoading ? (
//               <div className="text-center py-20 text-xs text-slate-400 flex flex-col items-center gap-2">
//                 <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
//                 <span>Loading athletic roster...</span>
//               </div>
//             ) : filteredRoster.length === 0 ? (
//               <div className="text-center py-16 text-slate-400 text-xs">
//                 No students match your filter queries.
//               </div>
//             ) : (
//               <>
//                 {/* Desktop View Table */}
//                 <div className="hidden xl:block overflow-x-auto">
//                   <table className="w-full text-left border-collapse text-xs">
//                     <thead>
//                       <tr className="border-b border-slate-200 dark:border-slate-800">
//                         <th className="py-3 px-4 font-bold text-slate-450 uppercase tracking-wider">Student Details</th>
//                         <th className="py-3 px-4 font-bold text-slate-450 uppercase tracking-wider">Assigned Sports Clubs</th>
//                         <th className="py-3 px-4 font-bold text-slate-450 uppercase tracking-wider text-center">Sprint (100m)</th>
//                         <th className="py-3 px-4 font-bold text-slate-450 uppercase tracking-wider text-center">Shot Put</th>
//                         <th className="py-3 px-4 font-bold text-slate-450 uppercase tracking-wider text-center">Cardio</th>
//                         <th className="py-3 px-4 font-bold text-slate-450 uppercase tracking-wider text-center">Overall Pts</th>
//                         <th className="py-3 px-4 font-bold text-slate-450 uppercase tracking-wider text-right">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
//                       {filteredRoster.map((student) => {
//                         const sprint = student.stats.find(s => s.label === "Sprint Speed");
//                         const shotPut = student.stats.find(s => s.label === "Shot Put");
//                         const cardio = student.stats.find(s => s.label === "Cardio Endurance");
//                         const overall = student.stats.find(s => s.label === "Overall Fitness");

//                         return (
//                           <tr key={student.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
//                             {/* Student Info */}
//                             <td className="py-4 px-4 whitespace-nowrap">
//                               <div className="font-bold text-black dark:text-white text-sm">{student.name}</div>
//                               <div className="text-[10px] text-slate-400 mt-0.5">
//                                 Class: {student.className} · Roll: {student.rollNumber}
//                               </div>
//                             </td>

//                             {/* Teams */}
//                             <td className="py-4 px-4">
//                               <div className="flex flex-wrap gap-1.5 max-w-xs">
//                                 {student.teams.map((t, idx) => (
//                                   <span key={idx} className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-lg border border-cyan-500/20 font-medium text-[9px] uppercase tracking-wider">
//                                     {t.name} ({t.role})
//                                   </span>
//                                 ))}
//                                 {student.teams.length === 0 && (
//                                   <span className="text-slate-400 font-medium">None</span>
//                                 )}
//                               </div>
//                             </td>

//                             {/* 100m Sprint */}
//                             <td className="py-4 px-4 text-center whitespace-nowrap">
//                               <div className="font-bold text-black dark:text-white">{sprint ? sprint.value : "—"}</div>
//                               <div className="text-[9px] text-slate-400 mt-0.5">{sprint ? `${sprint.score} pts` : ""}</div>
//                             </td>

//                             {/* Shot Put */}
//                             <td className="py-4 px-4 text-center whitespace-nowrap">
//                               <div className="font-bold text-black dark:text-white">{shotPut ? shotPut.value : "—"}</div>
//                               <div className="text-[9px] text-slate-400 mt-0.5">{shotPut ? `${shotPut.score} pts` : ""}</div>
//                             </td>

//                             {/* Cardio */}
//                             <td className="py-4 px-4 text-center whitespace-nowrap">
//                               <div className="font-bold text-black dark:text-white">{cardio ? cardio.value : "—"}</div>
//                               <div className="text-[9px] text-slate-400 mt-0.5">{cardio ? `${cardio.score} pts` : ""}</div>
//                             </td>

//                             {/* Overall Pts */}
//                             <td className="py-4 px-4 text-center whitespace-nowrap">
//                               <div className="w-12 mx-auto bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl p-1 text-center border border-emerald-500/20 font-black text-sm">
//                                 {overall ? overall.score : "—"}
//                               </div>
//                             </td>

//                             {/* Actions */}
//                             <td className="py-4 px-4 whitespace-nowrap text-right space-x-1.5">
//                               <button
//                                 onClick={() => handleOpenScores(student)}
//                                 className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-white px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold transition-all active:scale-95"
//                                 title="Update physical stats & scores"
//                               >
//                                 <Sliders className="w-3.5 h-3.5" />
//                                 <span>Update Scores</span>
//                               </button>
//                               <button
//                                 onClick={() => handleOpenTeamModal(student)}
//                                 className="inline-flex items-center gap-1 bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 px-2.5 py-1.5 rounded-lg border border-cyan-500/20 font-bold transition-all active:scale-95"
//                                 title="Assign student to sports team"
//                               >
//                                 <UserPlus className="w-3.5 h-3.5" />
//                                 <span>Enroll Team</span>
//                               </button>
//                               <button
//                                 onClick={() => handleOpenEventModal(student)}
//                                 className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-650 dark:text-emerald-400 hover:bg-emerald-500/20 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 font-bold transition-all active:scale-95"
//                                 title="Schedule upcoming sports event or trials"
//                               >
//                                 <Calendar className="w-3.5 h-3.5" />
//                                 <span>Schedule Event</span>
//                               </button>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Mobile/Tablet Card View */}
//                 <div className="xl:hidden grid grid-cols-1 gap-4">
//                   {filteredRoster.map((student) => {
//                     const sprint = student.stats.find(s => s.label === "Sprint Speed");
//                     const shotPut = student.stats.find(s => s.label === "Shot Put");
//                     const cardio = student.stats.find(s => s.label === "Cardio Endurance");
//                     const overall = student.stats.find(s => s.label === "Overall Fitness");

//                     return (
//                       <div key={student.studentId} className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-205 dark:border-slate-800/80 flex flex-col justify-between gap-4 text-xs hover:border-slate-400 dark:hover:border-slate-700 transition-colors">
//                         <div className="flex justify-between items-start">
//                           <div>
//                             <div className="font-bold text-sm text-black dark:text-white">{student.name}</div>
//                             <div className="text-[10px] text-slate-400 mt-0.5">
//                               Class: {student.className} · Roll: {student.rollNumber}
//                             </div>
//                           </div>
//                           <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-xl border border-emerald-500/20 font-black text-xs">
//                             {overall ? `${overall.score} pts` : "—"}
//                           </div>
//                         </div>

//                         {/* Teams */}
//                         <div className="space-y-1">
//                           <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Teams / Clubs:</span>
//                           <div className="flex flex-wrap gap-1.5">
//                             {student.teams.map((t, idx) => (
//                               <span key={idx} className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-lg border border-cyan-500/20 font-medium text-[9px] uppercase tracking-wider">
//                                 {t.name} ({t.role})
//                               </span>
//                             ))}
//                             {student.teams.length === 0 && (
//                               <span className="text-slate-400">None</span>
//                             )}
//                           </div>
//                         </div>

//                         {/* Physical stats list */}
//                         <div className="grid grid-cols-3 gap-2 bg-white dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/40 text-center">
//                           <div>
//                             <div className="font-bold text-black dark:text-white">{sprint ? sprint.value : "—"}</div>
//                             <div className="text-[9px] text-slate-450 mt-0.5">Sprint (100m)</div>
//                           </div>
//                           <div>
//                             <div className="font-bold text-black dark:text-white">{shotPut ? shotPut.value : "—"}</div>
//                             <div className="text-[9px] text-slate-450 mt-0.5">Shot Put</div>
//                           </div>
//                           <div>
//                             <div className="font-bold text-black dark:text-white">{cardio ? cardio.value : "—"}</div>
//                             <div className="text-[9px] text-slate-450 mt-0.5">Cardio</div>
//                           </div>
//                         </div>

//                         {/* Actions */}
//                         <div className="flex gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/30">
//                           <button
//                             onClick={() => handleOpenScores(student)}
//                             className="flex-1 inline-flex items-center justify-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-white py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold transition-all active:scale-95"
//                           >
//                             <Sliders className="w-3.5 h-3.5" />
//                             <span>Scores</span>
//                           </button>
//                           <button
//                             onClick={() => handleOpenTeamModal(student)}
//                             className="flex-1 inline-flex items-center justify-center gap-1 bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 py-2 rounded-xl border border-cyan-500/20 font-bold transition-all active:scale-95"
//                           >
//                             <UserPlus className="w-3.5 h-3.5" />
//                             <span>Team</span>
//                           </button>
//                           <button
//                             onClick={() => handleOpenEventModal(student)}
//                             className="flex-1 inline-flex items-center justify-center gap-1 bg-emerald-500/15 text-emerald-650 dark:text-emerald-400 hover:bg-emerald-500/20 py-2 rounded-xl border border-emerald-500/20 font-bold transition-all active:scale-95"
//                           >
//                             <Calendar className="w-3.5 h-3.5" />
//                             <span>Event</span>
//                           </button>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       )}

//       {/* TAB 2: INJURY TRACKER BOARD */}
//       {activeTab === "injuries" && (
//         <div className="space-y-6">
//           <div className="theme-card p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
//             <h2 className="text-lg font-bold text-black dark:text-white mb-6 flex items-center gap-2">
//               <span className="text-xl">🚑</span> Active Injury Reports & Medical Status
//             </h2>

//             {injuries.length === 0 ? (
//               <div className="text-center py-16 text-slate-400 text-xs">
//                 No injury reports filed. All students are healthy!
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {injuries.map((report) => (
//                   <div key={report.id} className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 text-xs">
                    
//                     {/* Injury Details */}
//                     <div className="space-y-1.5 flex-1">
//                       <div className="flex items-center gap-3">
//                         <span className="font-bold text-sm text-black dark:text-white">{report.studentName}</span>
//                         <span className="text-slate-400">Class: {report.className}</span>
//                         <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
//                           report.severity === 'Severe' ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20 shadow-sm' :
//                           report.severity === 'Moderate' ? 'bg-amber-500/10 text-amber-455 border border-amber-500/20' :
//                           'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'
//                         }`}>{report.severity} Severity</span>
//                       </div>
                      
//                       <div className="font-bold text-slate-800 dark:text-slate-200">
//                         Type: <span className="text-rose-500">{report.type}</span>
//                       </div>
                      
//                       <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">{report.description || "No descriptions detailed"}</p>
                      
//                       <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
//                         📅 Event: {report.date} · Filed: {new Date(report.createdAt).toLocaleDateString()}
//                       </div>
//                     </div>

//                     {/* Action dropdown */}
//                     <div className="flex items-center gap-3 shrink-0 self-end xl:self-center">
//                       <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Recovery status:</span>
//                       <select
//                         value={report.status}
//                         onChange={(e) => handleUpdateInjuryStatus(report.id, e.target.value)}
//                         className={`font-bold px-3 py-2 rounded-xl border focus:outline-none text-xs ${
//                           report.status === 'Cleared to Play' || report.status === 'Recovered' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' :
//                           report.status === 'Under Treatment' ? 'bg-amber-500/10 text-amber-500 border-amber-500/25' :
//                           'bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-250 dark:border-slate-800'
//                         }`}
//                       >
//                         <option value="Pending">Pending Audit</option>
//                         <option value="Under Treatment">Under Treatment / Nurse Care</option>
//                         <option value="Recovered">Recovered</option>
//                         <option value="Cleared to Play">Cleared to Play (Ready)</option>
//                       </select>
//                     </div>

//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* MODAL 1: UPDATE SPORTS & FITNESS SCORES */}
//       {isScoreModalOpen && selectedStudent && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
//           <div className="bg-white dark:bg-[#111a2c] border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
//             {/* Header */}
//             <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
//               <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
//                 <Sliders className="w-4 h-4 text-cyan-500" />
//                 <span>Update PE Scores: {selectedStudent.name}</span>
//               </h3>
//               <button 
//                 onClick={() => setIsScoreModalOpen(false)}
//                 className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Body */}
//             <form onSubmit={handleSaveScores} className="p-6 space-y-4 text-xs">
//               <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50 font-bold mb-4">
//                 Student class: {selectedStudent.className} · Roll: {selectedStudent.rollNumber}
//               </div>

//               {/* 100m Sprint */}
//               <div className="space-y-2 border-b border-slate-100 dark:border-slate-800/50 pb-3">
//                 <div className="flex justify-between font-bold">
//                   <span>⚡ 100m Running Sprint</span>
//                   <span className="text-cyan-600 dark:text-cyan-400">{sprintScore} Pts</span>
//                 </div>
//                 <div className="grid grid-cols-3 gap-3 items-center">
//                   <input
//                     type="text"
//                     value={sprintVal}
//                     onChange={(e) => setSprintVal(e.target.value)}
//                     placeholder="e.g. 12.4s"
//                     className="bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-center font-bold text-black dark:text-white focus:outline-none focus:border-cyan-500"
//                     required
//                   />
//                   <input
//                     type="range"
//                     min="0"
//                     max="100"
//                     value={sprintScore}
//                     onChange={(e) => setSprintScore(Number(e.target.value))}
//                     className="col-span-2 accent-cyan-500"
//                   />
//                 </div>
//               </div>

//               {/* Shot Put */}
//               <div className="space-y-2 border-b border-slate-100 dark:border-slate-800/50 pb-3">
//                 <div className="flex justify-between font-bold">
//                   <span>☄️ Shot Put Distance</span>
//                   <span className="text-cyan-600 dark:text-cyan-400">{shotPutScore} Pts</span>
//                 </div>
//                 <div className="grid grid-cols-3 gap-3 items-center">
//                   <input
//                     type="text"
//                     value={shotPutVal}
//                     onChange={(e) => setShotPutVal(e.target.value)}
//                     placeholder="e.g. 9.8m"
//                     className="bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-center font-bold text-black dark:text-white focus:outline-none focus:border-cyan-500"
//                     required
//                   />
//                   <input
//                     type="range"
//                     min="0"
//                     max="100"
//                     value={shotPutScore}
//                     onChange={(e) => setShotPutScore(Number(e.target.value))}
//                     className="col-span-2 accent-cyan-500"
//                   />
//                 </div>
//               </div>

//               {/* Cardio */}
//               <div className="space-y-2 border-b border-slate-100 dark:border-slate-800/50 pb-3">
//                 <div className="flex justify-between font-bold">
//                   <span>🫀 Cardio Endurance</span>
//                   <span className="text-cyan-600 dark:text-cyan-400">{cardioScore} Pts</span>
//                 </div>
//                 <div className="grid grid-cols-3 gap-3 items-center">
//                   <input
//                     type="text"
//                     value={cardioVal}
//                     onChange={(e) => setCardioVal(e.target.value)}
//                     placeholder="e.g. Excellent / Good"
//                     className="bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-center font-bold text-black dark:text-white focus:outline-none focus:border-cyan-500"
//                     required
//                   />
//                   <input
//                     type="range"
//                     min="0"
//                     max="100"
//                     value={cardioScore}
//                     onChange={(e) => setCardioScore(Number(e.target.value))}
//                     className="col-span-2 accent-cyan-500"
//                   />
//                 </div>
//               </div>

//               {/* Agility */}
//               <div className="space-y-2 border-b border-slate-100 dark:border-slate-800/50 pb-3">
//                 <div className="flex justify-between font-bold">
//                   <span>🤸‍♂️ Agility</span>
//                   <span className="text-cyan-600 dark:text-cyan-400">{agilityScore} Pts</span>
//                 </div>
//                 <div className="grid grid-cols-3 gap-3 items-center">
//                   <input
//                     type="text"
//                     value={agilityVal}
//                     onChange={(e) => setAgilityVal(e.target.value)}
//                     placeholder="e.g. Good / Average"
//                     className="bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-center font-bold text-black dark:text-white focus:outline-none focus:border-cyan-500"
//                     required
//                   />
//                   <input
//                     type="range"
//                     min="0"
//                     max="100"
//                     value={agilityScore}
//                     onChange={(e) => setAgilityScore(Number(e.target.value))}
//                     className="col-span-2 accent-cyan-500"
//                   />
//                 </div>
//               </div>

//               {/* Overall Fitness */}
//               <div className="space-y-2 pb-3">
//                 <div className="flex justify-between font-bold">
//                   <span>💪 Overall Athletic Grade</span>
//                   <span className="text-cyan-600 dark:text-cyan-400">{overallScore} Pts</span>
//                 </div>
//                 <div className="grid grid-cols-3 gap-3 items-center">
//                   <input
//                     type="text"
//                     value={overallVal}
//                     onChange={(e) => setOverallVal(e.target.value)}
//                     placeholder="e.g. Grade A / B+"
//                     className="bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-center font-bold text-black dark:text-white focus:outline-none focus:border-cyan-500"
//                     required
//                   />
//                   <input
//                     type="range"
//                     min="0"
//                     max="100"
//                     value={overallScore}
//                     onChange={(e) => setOverallScore(Number(e.target.value))}
//                     className="col-span-2 accent-cyan-500"
//                   />
//                 </div>
//               </div>

//               {/* Footer */}
//               <div className="flex gap-3 pt-4 border-t border-slate-150 dark:border-slate-800">
//                 <button
//                   type="button"
//                   onClick={() => setIsScoreModalOpen(false)}
//                   className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-white rounded-xl font-bold transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={isSavingScores}
//                   className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-450 text-white rounded-xl font-bold transition-colors shadow-lg shadow-cyan-500/20"
//                 >
//                   {isSavingScores ? "Saving..." : "Save Scores"}
//                 </button>
//               </div>

//             </form>
//           </div>
//         </div>
//       )}

//       {/* MODAL 2: ASSIGN STUDENT TO SPORTS TEAM */}
//       {isTeamModalOpen && teamStudent && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
//           <div className="bg-white dark:bg-[#111a2c] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
//             {/* Header */}
//             <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
//               <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
//                 <UserPlus className="w-4 h-4 text-cyan-500" />
//                 <span>Enroll in Team: {teamStudent.name}</span>
//               </h3>
//               <button 
//                 onClick={() => setIsTeamModalOpen(false)}
//                 className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Body */}
//             <form onSubmit={handleSaveTeam} className="p-6 space-y-4 text-xs">
              
//               {/* Select Team */}
//               <div>
//                 <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Select Team / Club</label>
//                 <select
//                   value={teamName}
//                   onChange={(e) => {
//                     setTeamName(e.target.value);
//                     // Match icons & color gradients based on sport choice
//                     if (e.target.value.includes("Football")) { setTeamIcon("⚽"); setTeamColor("from-blue-500 to-cyan-500"); }
//                     else if (e.target.value.includes("Athletics") || e.target.value.includes("Sprint")) { setTeamIcon("🏃‍♂️"); setTeamColor("from-orange-500 to-amber-500"); }
//                     else if (e.target.value.includes("Basketball")) { setTeamIcon("🏀"); setTeamColor("from-orange-600 to-red-500"); }
//                     else if (e.target.value.includes("Volleyball")) { setTeamIcon("🏐"); setTeamColor("from-indigo-500 to-purple-500"); }
//                     else if (e.target.value.includes("Kabaddi") || e.target.value.includes("Kho-Kho")) { setTeamIcon("🤼"); setTeamColor("from-amber-600 to-amber-800"); }
//                     else { setTeamIcon("🏆"); setTeamColor("from-emerald-500 to-teal-500"); }
//                   }}
//                   className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-cyan-550"
//                 >
//                   <option value="School Football Team">School Football Team</option>
//                   <option value="Athletics Club">Athletics Club</option>
//                   <option value="Basketball Team">Basketball Team</option>
//                   <option value="Volleyball Team">Volleyball Team</option>
//                   <option value="Kabaddi Club">Kabaddi Club</option>
//                   <option value="Kho-Kho Club">Kho-Kho Club</option>
//                   <option value="Cricket Academy">Cricket Academy</option>
//                   <option value="Badminton Club">Badminton Club</option>
//                 </select>
//               </div>

//               {/* Role */}
//               <div>
//                 <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Athlete Role</label>
//                 <input
//                   type="text"
//                   value={teamRole}
//                   onChange={(e) => setTeamRole(e.target.value)}
//                   placeholder="e.g. Captain, Midfielder, Raider, Sprinter (100m)"
//                   className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-cyan-550"
//                   required
//                 />
//               </div>

//               {/* Next Event / Match */}
//               <div>
//                 <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Upcoming Match / Event</label>
//                 <input
//                   type="text"
//                   value={teamMatch}
//                   onChange={(e) => setTeamMatch(e.target.value)}
//                   placeholder="e.g., Inter-school Quarterfinals or Zonal Meet"
//                   className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-cyan-550"
//                   required
//                 />
//               </div>

//               {/* Match Date */}
//               <div>
//                 <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Schedule / Date</label>
//                 <input
//                   type="text"
//                   value={teamDate}
//                   onChange={(e) => setTeamDate(e.target.value)}
//                   placeholder="e.g., This Friday, 4:00 PM or Nov 12"
//                   className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-cyan-550"
//                   required
//                 />
//               </div>

//               {/* Action Buttons */}
//               <div className="flex gap-3 pt-3 border-t border-slate-150 dark:border-slate-800">
//                 <button
//                   type="button"
//                   onClick={() => setIsTeamModalOpen(false)}
//                   className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-white rounded-xl font-bold transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={isSavingTeam}
//                   className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-450 text-white rounded-xl font-bold transition-colors shadow-lg shadow-cyan-500/20"
//                 >
//                   {isSavingTeam ? "Enrolling..." : "Enroll Team"}
//                 </button>
//               </div>

//             </form>
//           </div>
//         </div>
//       )}

//       {/* MODAL 3: SCHEDULE SPORTS EVENT */}
//       {isEventModalOpen && eventStudent && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
//           <div className="bg-white dark:bg-[#111a2c] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
//             {/* Header */}
//             <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
//               <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
//                 <Calendar className="w-4 h-4 text-emerald-500" />
//                 <span>Schedule Event: {eventStudent.name}</span>
//               </h3>
//               <button 
//                 onClick={() => setIsEventModalOpen(false)}
//                 className="text-slate-400 hover:text-slate-650 dark:hover:text-white"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Body */}
//             <form onSubmit={handleSaveEvent} className="p-6 space-y-4 text-xs">
              
//               {/* Event Title */}
//               <div>
//                 <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Event Title</label>
//                 <input
//                   type="text"
//                   value={eventTitle}
//                   onChange={(e) => setEventTitle(e.target.value)}
//                   placeholder="e.g. Annual Sports Meet, Basketball Selection Trials"
//                   className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-emerald-500"
//                   required
//                 />
//               </div>

//               {/* Event Date */}
//               <div>
//                 <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Date & Time</label>
//                 <input
//                   type="text"
//                   value={eventDate}
//                   onChange={(e) => setEventDate(e.target.value)}
//                   placeholder="e.g. Nov 15, 2026 or Oct 23, 2026"
//                   className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-emerald-500"
//                   required
//                 />
//               </div>

//               {/* Event Type and Icon */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Event Scope</label>
//                   <select
//                     value={eventType}
//                     onChange={(e) => setEventType(e.target.value)}
//                     className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-emerald-550"
//                   >
//                     <option value="Selection Trials">Selection Trials</option>
//                     <option value="School Tournament">School Tournament</option>
//                     <option value="Fitness Assessment">Fitness Assessment</option>
//                     <option value="Sports Day">Sports Day Meet</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Event Sport Icon</label>
//                   <select
//                     value={eventIcon}
//                     onChange={(e) => setEventIcon(e.target.value)}
//                     className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-emerald-550"
//                   >
//                     <option value="🏆">🏆 Tournament</option>
//                     <option value="🏀">🏀 Basketball</option>
//                     <option value="⚽">⚽ Football</option>
//                     <option value="🏃‍♂️">🏃‍♂️ Athletics / Sprint</option>
//                     <option value="🏐">🏐 Volleyball</option>
//                     <option value="📅">📅 General Date</option>
//                   </select>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex gap-3 pt-3 border-t border-slate-150 dark:border-slate-800">
//                 <button
//                   type="button"
//                   onClick={() => setIsEventModalOpen(false)}
//                   className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-white rounded-xl font-bold transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={isSavingEvent}
//                   className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-450 text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-500/20"
//                 >
//                   {isSavingEvent ? "Scheduling..." : "Schedule Event"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </PortalLayout>
//   );
// }
"use client";

import PortalLayout from "@/components/PortalLayout";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import {
  Trophy,
  Activity,
  Users,
  Calendar,
  Heart,
  PlusCircle,
  X,
  Edit,
  UserPlus,
  Check,
  AlertTriangle,
  UserCheck,
  Search,
  Sliders
} from "lucide-react";

const API_BASE = "http://localhost:5000";

const SECTION_METRICS: {
  [key: string]: Array<{ label: string; defaultVal: string; icon: string; color: string }>
} = {
  middle: [
    { label: "Sprint Speed (100m)", defaultVal: "14.5s", icon: "⚡", color: "bg-amber-500" },
    { label: "Standing Broad Jump", defaultVal: "1.85m", icon: "📏", color: "bg-cyan-500" },
    { label: "Shuttle Run (Agility)", defaultVal: "10.6s", icon: "🏃", color: "bg-blue-500" },
    { label: "Flexibility (Sit & Reach)", defaultVal: "Excellent", icon: "🧘", color: "bg-rose-500" },
    { label: "Overall Fitness", defaultVal: "Grade A", icon: "💪", color: "bg-emerald-500" }
  ],
  high: [
    { label: "Sprint Speed", defaultVal: "12.5s", icon: "⚡", color: "bg-amber-500" },
    { label: "Shot Put", defaultVal: "9.8m", icon: "⚪", color: "bg-orange-500" },
    { label: "Cardio Endurance", defaultVal: "Excellent", icon: "❤️", color: "bg-rose-500" },
    { label: "Agility", defaultVal: "Above Average", icon: "🏃", color: "bg-blue-500" },
    { label: "Overall Fitness", defaultVal: "Grade A", icon: "💪", color: "bg-emerald-500" }
  ],
  hsc: [
    { label: "Sprint Speed (100m)", defaultVal: "12.1s", icon: "⚡", color: "bg-amber-500" },
    { label: "Shot Put", defaultVal: "11.2m", icon: "⚪", color: "bg-orange-500" },
    { label: "Beep Test (Cardio)", defaultVal: "Level 9.5", icon: "🏃", color: "bg-rose-500" },
    { label: "Agility (Shuttle Run)", defaultVal: "Above Average", icon: "🏃", color: "bg-blue-500" },
    { label: "Overall Fitness", defaultVal: "Grade A", icon: "💪", color: "bg-emerald-500" }
  ]
};

const getSectionFromClass = (className: string) => {
  if (!className) return "high";
  const classNum = parseInt(className.replace(/\D/g, ""), 10);
  if (classNum >= 6 && classNum <= 8) return "middle";
  if (classNum >= 11 && classNum <= 12) return "hsc";
  return "high";
};

interface RosterStudent {
  studentId: string;
  name: string;
  rollNumber: string;
  className: string;
  hasProfile: boolean;
  profileId: string | null;
  stats: Array<{ label: string; value: string; score: number; icon: string; color: string }>;
  teams: Array<{ name: string; role: string }>;
  logsCount: number;
}

interface LeaderboardEntry {
  name: string;
  className: string;
  rollNumber: string;
  value: string;
  score: number;
}

interface InjuryReport {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  type: string;
  severity: string;
  description: string;
  status: string;
  date: string;
  createdAt: string;
}

export default function PETeacherSportsPage() {
  const { data: session, status } = useSession();
  const schoolId = (session?.user as any)?.schoolId;

  const [activeTab, setActiveTab] = useState("roster");
  const [section, setSection] = useState("high"); // middle, high, hsc
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [injuries, setInjuries] = useState<InjuryReport[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPE, setIsPE] = useState<boolean | null>(null);

  // Score Modal States
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<RosterStudent | null>(null);
  const [isSavingScores, setIsSavingScores] = useState(false);
  const [modalStats, setModalStats] = useState<Array<{ label: string; value: string; score: number; icon: string; color: string }>>([]);

  // Team Assignment Modal States
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamStudent, setTeamStudent] = useState<RosterStudent | null>(null);
  const [teamName, setTeamName] = useState("School Football Team");
  const [teamRole, setTeamRole] = useState("Midfielder");
  const [teamIcon, setTeamIcon] = useState("⚽");
  const [teamColor, setTeamColor] = useState("from-blue-500 to-cyan-500");
  const [teamMatch, setTeamMatch] = useState("Inter-school Championship");
  const [teamDate, setTeamDate] = useState("Friday, 4:00 PM");
  const [isSavingTeam, setIsSavingTeam] = useState(false);

  // Event Scheduler Modal States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventStudent, setEventStudent] = useState<RosterStudent | null>(null);
  const [eventTitle, setEventTitle] = useState("Basketball Team Tryouts");
  const [eventDate, setEventDate] = useState("Nov 15, 2026");
  const [eventType, setEventType] = useState("Selection Trials");
  const [eventIcon, setEventIcon] = useState("🏀");
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  const handleOpenEventModal = (student: RosterStudent) => {
    setEventStudent(student);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventStudent) return;

    try {
      setIsSavingEvent(true);
      const res = await fetch(`${API_BASE}/api/sports/profile/${eventStudent.studentId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: eventTitle,
          date: eventDate,
          type: eventType,
          icon: eventIcon
        })
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire("Event Scheduled", `Successfully scheduled ${eventTitle} for ${eventStudent.name}`, "success");
        setIsEventModalOpen(false);
        fetchRosterData();
      } else {
        Swal.fire("Error", json.error || "Failed to schedule event", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Server connection failed", "error");
    } finally {
      setIsSavingEvent(false);
    }
  };

  // 1. Fetch Roster & Leaderboard based on section
  async function fetchRosterData() {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/sports/section/${section}?schoolId=${schoolId || ""}`);
      const json = await res.json();
      if (json.success) {
        setRoster(json.data.roster);
      }
    } catch (err) {
      console.error("Failed to fetch roster data:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // 2. Fetch Injury Tracker data
  async function fetchInjuriesData() {
    try {
      const res = await fetch(`${API_BASE}/api/sports/injuries/all`);
      const json = await res.json();
      if (json.success) {
        setInjuries(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch injuries list:", err);
    }
  }

  // 3. Check whether logged-in teacher has Physical Education specialty
  useEffect(() => {
    async function checkTeacherProfile() {
      if (status !== "authenticated" || !session?.user) return;
      const userId = (session.user as any).id;
      if (!userId) return;

      try {
        const res = await fetch(`${API_BASE}/api/teacher/profile/${userId}`);
        const json = await res.json();
        if (json.success && json.data) {
          const subjects = json.data.subjects || [];
          const hasPE = subjects.some((s: string) =>
            s.toLowerCase().includes("physical education") ||
            s.toLowerCase() === "pe" ||
            s.toLowerCase().includes("sports")
          );
          setIsPE(hasPE);
        } else {
          setIsPE(false);
        }
      } catch (err) {
        console.error("Error checking teacher profile:", err);
        setIsPE(false);
      }
    }
    checkTeacherProfile();
  }, [session, status]);

  useEffect(() => {
    if (activeTab === "roster") {
      fetchRosterData();
    } else if (activeTab === "injuries") {
      fetchInjuriesData();
    }
  }, [section, activeTab, session, status]);

  // 4. Open score update modal (section-aware)
  const handleOpenScores = (student: RosterStudent) => {
    setSelectedStudent(student);

    const sec = getSectionFromClass(student.className);
    const metrics = SECTION_METRICS[sec];

    // Load student's existing stats or pre-populate defaults
    const loadedStats = metrics.map(m => {
      const existing = student.stats.find(s => s.label === m.label);
      return {
        label: m.label,
        value: existing ? existing.value : m.defaultVal,
        score: existing ? existing.score : 80,
        icon: m.icon,
        color: m.color
      };
    });

    setModalStats(loadedStats);
    setIsScoreModalOpen(true);
  };

  // 5. Save Fitness & Event Scores
  const handleSaveScores = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      setIsSavingScores(true);
      const res = await fetch(`${API_BASE}/api/sports/profile/${selectedStudent.studentId}/stats`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stats: modalStats
        })
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire("Scores Saved", `Successfully updated physical profile for ${selectedStudent.name}`, "success");
        setIsScoreModalOpen(false);
        fetchRosterData();
      } else {
        Swal.fire("Error", json.error || "Failed to update stats", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Server connection failed", "error");
    } finally {
      setIsSavingScores(false);
    }
  };

  // 6. Open team assignment modal
  const handleOpenTeamModal = (student: RosterStudent) => {
    setTeamStudent(student);
    setIsTeamModalOpen(true);
  };

  // 7. Save Team Membership
  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamStudent) return;

    try {
      setIsSavingTeam(true);
      const res = await fetch(`${API_BASE}/api/sports/profile/${teamStudent.studentId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamName,
          role: teamRole,
          icon: teamIcon,
          color: teamColor,
          match: teamMatch,
          date: teamDate
        })
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire("Team Assigned", `Successfully enrolled ${teamStudent.name} into ${teamName}`, "success");
        setIsTeamModalOpen(false);
        fetchRosterData();
      } else {
        Swal.fire("Error", json.error || "Failed to assign team", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Server connection failed", "error");
    } finally {
      setIsSavingTeam(false);
    }
  };

  // 8. Update Injury Resolution Status
  const handleUpdateInjuryStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/sports/injury/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire({
          title: "Status Updated",
          text: `Recovery status set to "${newStatus}"`,
          icon: "success",
          toast: true,
          position: "top-end",
          timer: 2500,
          showConfirmButton: false
        });
        fetchInjuriesData();
      }
    } catch (err) {
      Swal.fire("Error", "Failed to update recovery status", "error");
    }
  };

  // Filter roster based on query
  const filteredRoster = roster.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PortalLayout
      title="Sports & Athletics Desk"
      subtitle="Physical Education Assessment, Sports Teams mapping, & Injury tracking board."
      avatarLetter="C"
      avatarColor="#06b6d4"
      themeClass="theme-teacher"
      accentColor="#06b6d4"
    >
      {isPE === false && (
        <div className="mb-6 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-sm animate-in fade-in duration-300">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
          <div>
            <span className="block text-sm font-extrabold leading-none mb-1">View-Only Portal Access</span>
            <span className="block opacity-80 mt-1">You are logged in as {session?.user?.name || "Teacher"}. Only teachers with a "Physical Education" specialty can update student sports scores, enroll teams, or schedule events.</span>
          </div>
        </div>
      )}

      {/* Top Tabs */}
      <div className="flex flex-col xl:flex-row bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50 w-full xl:w-fit mb-6 gap-1">
        <button
          onClick={() => setActiveTab("roster")}
          className={`flex-1 xl:flex-initial px-6 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${activeTab === "roster" ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "text-black dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400"}`}
        >
          📋 Student Roster & Scores
        </button>
        <button
          onClick={() => setActiveTab("injuries")}
          className={`flex-1 xl:flex-initial px-6 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${activeTab === "injuries" ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "text-black dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400"}`}
        >
          🚑 Injury Tracker ({injuries.filter(i => i.status === 'Pending' || i.status === 'Under Treatment').length})
        </button>
      </div>

      {/* TAB 1: STUDENT ROSTER & SCORE BOARD */}
      {activeTab === "roster" && (
        <div className="space-y-6">
          <div className="theme-card p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Header filters */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">

              {/* Section Filters */}
              <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs w-full xl:w-auto">
                {[
                  ["middle", "Middle (6-8)"],
                  ["high", "High (9-10)"],
                  ["hsc", "HSC (11-12)"]
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSection(key)}
                    className={`flex-1 xl:flex-none px-4 py-2 rounded-md font-bold transition-all ${section === key ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-350"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Roster Search */}
              <div className="relative w-full xl:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students by name, roll..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-cyan-550 focus:bg-white transition-colors text-black dark:text-white"
                />
              </div>

            </div>

            {/* Roster Data List */}
            {isLoading ? (
              <div className="text-center py-20 text-xs text-slate-400 flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading athletic roster...</span>
              </div>
            ) : filteredRoster.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                No students match your filter queries.
              </div>
            ) : (
              <>
                {/* Desktop View Table */}
                <div className="hidden xl:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <th className="py-3 px-4 font-bold text-slate-450 uppercase tracking-wider">Student Details</th>
                        <th className="py-3 px-4 font-bold text-slate-450 uppercase tracking-wider">Assigned Sports Clubs</th>
                        {section === "middle" && (
                          <>
                            <th className="py-3 px-4 font-bold text-slate-450 uppercase tracking-wider text-center">Sprint (100m)</th>
                            <th className="py-3 px-4 font-bold text-slate-450 uppercase tracking-wider text-center">Broad Jump</th>
                            <th className="py-3 px-4 font-bold text-slate-450 uppercase tracking-wider text-center">Shuttle Run</th>
                          </>
                        )}
                        {section === "high" && (
                          <>
                            <th className="py-3 px-4 font-bold text-slate-450 uppercase tracking-wider text-center">Sprint Speed</th>
                            <th className="py-3 px-4 font-bold text-slate-450 uppercase tracking-wider text-center">Shot Put</th>
                            <th className="py-3 px-4 font-bold text-slate-450 uppercase tracking-wider text-center">Cardio</th>
                          </>
                        )}
                        {section === "hsc" && (
                          <>
                            <th className="py-3 px-4 font-bold text-slate-450 uppercase tracking-wider text-center">Sprint Speed</th>
                            <th className="py-3 px-4 font-bold text-slate-450 uppercase tracking-wider text-center">Shot Put</th>
                            <th className="py-3 px-4 font-bold text-slate-450 uppercase tracking-wider text-center">Beep Test</th>
                          </>
                        )}
                        <th className="py-3 px-4 font-bold text-slate-450 uppercase tracking-wider text-center">Overall Pts</th>
                        <th className="py-3 px-4 font-bold text-slate-450 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                      {filteredRoster.map((student) => {
                        let col1Val = "—", col1Score = "";
                        let col2Val = "—", col2Score = "";
                        let col3Val = "—", col3Score = "";

                        if (section === "middle") {
                          const s = student.stats.find(x => x.label === "Sprint Speed (100m)");
                          if (s) { col1Val = s.value; col1Score = `${s.score} pts`; }
                          const bj = student.stats.find(x => x.label === "Standing Broad Jump");
                          if (bj) { col2Val = bj.value; col2Score = `${bj.score} pts`; }
                          const ag = student.stats.find(x => x.label === "Shuttle Run (Agility)");
                          if (ag) { col3Val = ag.value; col3Score = `${ag.score} pts`; }
                        } else if (section === "high") {
                          const s = student.stats.find(x => x.label === "Sprint Speed");
                          if (s) { col1Val = s.value; col1Score = `${s.score} pts`; }
                          const sp = student.stats.find(x => x.label === "Shot Put");
                          if (sp) { col2Val = sp.value; col2Score = `${sp.score} pts`; }
                          const c = student.stats.find(x => x.label === "Cardio Endurance");
                          if (c) { col3Val = c.value; col3Score = `${c.score} pts`; }
                        } else if (section === "hsc") {
                          const s = student.stats.find(x => x.label === "Sprint Speed (100m)");
                          if (s) { col1Val = s.value; col1Score = `${s.score} pts`; }
                          const sp = student.stats.find(x => x.label === "Shot Put");
                          if (sp) { col2Val = sp.value; col2Score = `${sp.score} pts`; }
                          const b = student.stats.find(x => x.label === "Beep Test (Cardio)");
                          if (b) { col3Val = b.value; col3Score = `${b.score} pts`; }
                        }

                        const overall = student.stats.find(s => s.label === "Overall Fitness");

                        return (
                          <tr key={student.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                            {/* Student Info */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="font-bold text-black dark:text-white text-sm">{student.name}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Class: {student.className} · Roll: {student.rollNumber}
                              </div>
                            </td>

                            {/* Teams */}
                            <td className="py-4 px-4">
                              <div className="flex flex-wrap gap-1.5 max-w-xs">
                                {student.teams.map((t, idx) => (
                                  <span key={idx} className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-lg border border-cyan-500/20 font-medium text-[9px] uppercase tracking-wider">
                                    {t.name} ({t.role})
                                  </span>
                                ))}
                                {student.teams.length === 0 && (
                                  <span className="text-slate-400 font-medium">None</span>
                                )}
                              </div>
                            </td>

                            {/* Col 1 */}
                            <td className="py-4 px-4 text-center whitespace-nowrap">
                              <div className="font-bold text-black dark:text-white">{col1Val}</div>
                              <div className="text-[9px] text-slate-400 mt-0.5">{col1Score}</div>
                            </td>

                            {/* Col 2 */}
                            <td className="py-4 px-4 text-center whitespace-nowrap">
                              <div className="font-bold text-black dark:text-white">{col2Val}</div>
                              <div className="text-[9px] text-slate-400 mt-0.5">{col2Score}</div>
                            </td>

                            {/* Col 3 */}
                            <td className="py-4 px-4 text-center whitespace-nowrap">
                              <div className="font-bold text-black dark:text-white">{col3Val}</div>
                              <div className="text-[9px] text-slate-400 mt-0.5">{col3Score}</div>
                            </td>

                            {/* Overall Pts */}
                            <td className="py-4 px-4 text-center whitespace-nowrap">
                              <div className="w-12 mx-auto bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl p-1 text-center border border-emerald-500/20 font-black text-sm">
                                {overall ? overall.score : "—"}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-4 whitespace-nowrap text-right space-x-1.5">
                              <button
                                onClick={() => handleOpenScores(student)}
                                disabled={isPE === false}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-bold transition-all ${
                                  isPE === false
                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-800/40 opacity-40 cursor-not-allowed"
                                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-white border-slate-200 dark:border-slate-700 active:scale-95"
                                }`}
                                title={isPE === false ? "Only PE teachers can update scores" : "Update physical stats & scores"}
                              >
                                <Sliders className="w-3.5 h-3.5" />
                                <span>Update Scores</span>
                              </button>
                              <button
                                onClick={() => handleOpenTeamModal(student)}
                                disabled={isPE === false}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-bold transition-all ${
                                  isPE === false
                                    ? "bg-cyan-500/5 text-cyan-600/40 border-cyan-500/10 opacity-40 cursor-not-allowed"
                                    : "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/20 active:scale-95"
                                }`}
                                title={isPE === false ? "Only PE teachers can enroll teams" : "Assign student to sports team"}
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Enroll Team</span>
                              </button>
                              <button
                                onClick={() => handleOpenEventModal(student)}
                                disabled={isPE === false}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-bold transition-all ${
                                  isPE === false
                                    ? "bg-emerald-500/5 text-emerald-600/40 border-emerald-500/10 opacity-40 cursor-not-allowed"
                                    : "bg-emerald-500/15 text-emerald-650 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 active:scale-95"
                                }`}
                                title={isPE === false ? "Only PE teachers can schedule events" : "Schedule upcoming sports event or trials"}
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Schedule Event</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRoster.map((student) => {
                    let col1Val = "—", col1Label = "Sprint";
                    let col2Val = "—", col2Label = "Shot Put";
                    let col3Val = "—", col3Label = "Cardio";

                    if (section === "middle") {
                      col1Label = "Sprint (100m)";
                      col2Label = "Broad Jump";
                      col3Label = "Shuttle Run";
                      const s = student.stats.find(x => x.label === "Sprint Speed (100m)");
                      if (s) col1Val = s.value;
                      const bj = student.stats.find(x => x.label === "Standing Broad Jump");
                      if (bj) col2Val = bj.value;
                      const ag = student.stats.find(x => x.label === "Shuttle Run (Agility)");
                      if (ag) col3Val = ag.value;
                    } else if (section === "high") {
                      col1Label = "Sprint Speed";
                      col2Label = "Shot Put";
                      col3Label = "Cardio";
                      const s = student.stats.find(x => x.label === "Sprint Speed");
                      if (s) col1Val = s.value;
                      const sp = student.stats.find(x => x.label === "Shot Put");
                      if (sp) col2Val = sp.value;
                      const c = student.stats.find(x => x.label === "Cardio Endurance");
                      if (c) col3Val = c.value;
                    } else if (section === "hsc") {
                      col1Label = "Sprint Speed";
                      col2Label = "Shot Put";
                      col3Label = "Beep Test";
                      const s = student.stats.find(x => x.label === "Sprint Speed (100m)");
                      if (s) col1Val = s.value;
                      const sp = student.stats.find(x => x.label === "Shot Put");
                      if (sp) col2Val = sp.value;
                      const b = student.stats.find(x => x.label === "Beep Test (Cardio)");
                      if (b) col3Val = b.value;
                    }

                    const overall = student.stats.find(s => s.label === "Overall Fitness");

                    return (
                      <div key={student.studentId} className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-205 dark:border-slate-800/80 flex flex-col justify-between gap-4 text-xs hover:border-slate-400 dark:hover:border-slate-700 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-sm text-black dark:text-white">{student.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Class: {student.className} · Roll: {student.rollNumber}
                            </div>
                          </div>
                          <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-xl border border-emerald-500/20 font-black text-xs">
                            {overall ? `${overall.score} pts` : "—"}
                          </div>
                        </div>

                        {/* Teams */}
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Teams / Clubs:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {student.teams.map((t, idx) => (
                              <span key={idx} className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-lg border border-cyan-500/20 font-medium text-[9px] uppercase tracking-wider">
                                {t.name} ({t.role})
                              </span>
                            ))}
                            {student.teams.length === 0 && (
                              <span className="text-slate-400">None</span>
                            )}
                          </div>
                        </div>

                        {/* Physical stats list */}
                        <div className="grid grid-cols-3 gap-2 bg-white dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/40 text-center">
                          <div>
                            <div className="font-bold text-black dark:text-white">{col1Val}</div>
                            <div className="text-[9px] text-slate-450 mt-0.5">{col1Label}</div>
                          </div>
                          <div>
                            <div className="font-bold text-black dark:text-white">{col2Val}</div>
                            <div className="text-[9px] text-slate-450 mt-0.5">{col2Label}</div>
                          </div>
                          <div>
                            <div className="font-bold text-black dark:text-white">{col3Val}</div>
                            <div className="text-[9px] text-slate-450 mt-0.5">{col3Label}</div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/30">
                          <button
                            onClick={() => handleOpenScores(student)}
                            disabled={isPE === false}
                            className={`flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-xl border font-bold transition-all ${
                              isPE === false
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-800/40 opacity-40 cursor-not-allowed"
                                : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-white border-slate-200 dark:border-slate-700 active:scale-95"
                            }`}
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Scores</span>
                          </button>
                          <button
                            onClick={() => handleOpenTeamModal(student)}
                            disabled={isPE === false}
                            className={`flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-xl border font-bold transition-all ${
                              isPE === false
                                ? "bg-cyan-500/5 text-cyan-600/40 border-cyan-500/10 opacity-40 cursor-not-allowed"
                                : "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/20 active:scale-95"
                            }`}
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Team</span>
                          </button>
                          <button
                            onClick={() => handleOpenEventModal(student)}
                            disabled={isPE === false}
                            className={`flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-xl border font-bold transition-all ${
                              isPE === false
                                ? "bg-emerald-500/5 text-emerald-650/40 border-emerald-500/10 opacity-40 cursor-not-allowed"
                                : "bg-emerald-500/15 text-emerald-650 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 active:scale-95"
                            }`}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Event</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INJURY TRACKER BOARD */}
      {activeTab === "injuries" && (
        <div className="space-y-6">
          <div className="theme-card p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-black dark:text-white mb-6 flex items-center gap-2">
              <span className="text-xl">🚑</span> Active Injury Reports & Medical Status
            </h2>

            {injuries.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                No injury reports filed. All students are healthy!
              </div>
            ) : (
              <div className="space-y-4">
                {injuries.map((report) => (
                  <div key={report.id} className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 text-xs">

                    {/* Injury Details */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-black dark:text-white">{report.studentName}</span>
                        <span className="text-slate-400">Class: {report.className}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          report.severity === 'Severe' ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20 shadow-sm' :
                          report.severity === 'Moderate' ? 'bg-amber-500/10 text-amber-455 border border-amber-500/20' :
                          'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'
                        }`}>{report.severity} Severity</span>
                      </div>

                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        Type: <span className="text-rose-500">{report.type}</span>
                      </div>

                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">{report.description || "No descriptions detailed"}</p>

                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        📅 Event: {report.date} · Filed: {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Action dropdown */}
                    <div className="flex items-center gap-3 shrink-0 self-end xl:self-center">
                      <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Recovery status:</span>
                      <select
                        value={report.status}
                        onChange={(e) => handleUpdateInjuryStatus(report.id, e.target.value)}
                        className={`font-bold px-3 py-2 rounded-xl border focus:outline-none text-xs ${
                          report.status === 'Cleared to Play' || report.status === 'Recovered' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' :
                          report.status === 'Under Treatment' ? 'bg-amber-500/10 text-amber-500 border-amber-500/25' :
                          'bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-250 dark:border-slate-800'
                        }`}
                      >
                        <option value="Pending">Pending Audit</option>
                        <option value="Under Treatment">Under Treatment / Nurse Care</option>
                        <option value="Recovered">Recovered</option>
                        <option value="Cleared to Play">Cleared to Play (Ready)</option>
                      </select>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: UPDATE SPORTS & FITNESS SCORES */}
      {isScoreModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111a2c] border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-500" />
                <span>Update PE Scores: {selectedStudent.name}</span>
              </h3>
              <button
                onClick={() => setIsScoreModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveScores} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50 font-bold mb-4">
                Student class: {selectedStudent.className} · Roll: {selectedStudent.rollNumber}
              </div>

              {modalStats.map((stat, idx) => (
                <div key={idx} className="space-y-2 border-b border-slate-100 dark:border-slate-800/50 pb-3 last:border-b-0">
                  <div className="flex justify-between font-bold">
                    <span>{stat.icon} {stat.label}</span>
                    <span className="text-cyan-600 dark:text-cyan-400">{stat.score} Pts</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 items-center">
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => {
                        const nextStats = [...modalStats];
                        nextStats[idx].value = e.target.value;
                        setModalStats(nextStats);
                      }}
                      placeholder="e.g. Value"
                      className="bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2 text-center font-bold text-black dark:text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stat.score}
                      onChange={(e) => {
                        const nextStats = [...modalStats];
                        nextStats[idx].score = Number(e.target.value);
                        setModalStats(nextStats);
                      }}
                      className="col-span-2 accent-cyan-500"
                    />
                  </div>
                </div>
              ))}

              {/* Footer */}
              <div className="flex gap-3 pt-4 border-t border-slate-150 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsScoreModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-white rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingScores}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-450 text-white rounded-xl font-bold transition-colors shadow-lg shadow-cyan-500/20"
                >
                  {isSavingScores ? "Saving..." : "Save Scores"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN STUDENT TO SPORTS TEAM */}
      {isTeamModalOpen && teamStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111a2c] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-cyan-500" />
                <span>Enroll in Team: {teamStudent.name}</span>
              </h3>
              <button
                onClick={() => setIsTeamModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveTeam} className="p-6 space-y-4 text-xs">

              {/* Select Team */}
              <div>
                <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Select Team / Club</label>
                <select
                  value={teamName}
                  onChange={(e) => {
                    setTeamName(e.target.value);
                    // Match icons & color gradients based on sport choice
                    if (e.target.value.includes("Football")) { setTeamIcon("⚽"); setTeamColor("from-blue-500 to-cyan-500"); }
                    else if (e.target.value.includes("Athletics") || e.target.value.includes("Sprint")) { setTeamIcon("🏃‍♂️"); setTeamColor("from-orange-500 to-amber-500"); }
                    else if (e.target.value.includes("Basketball")) { setTeamIcon("🏀"); setTeamColor("from-orange-600 to-red-500"); }
                    else if (e.target.value.includes("Volleyball")) { setTeamIcon("🏐"); setTeamColor("from-indigo-500 to-purple-500"); }
                    else if (e.target.value.includes("Kabaddi") || e.target.value.includes("Kho-Kho")) { setTeamIcon("🤼"); setTeamColor("from-amber-600 to-amber-800"); }
                    else { setTeamIcon("🏆"); setTeamColor("from-emerald-500 to-teal-500"); }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-cyan-550"
                >
                  <option value="School Football Team">School Football Team</option>
                  <option value="Athletics Club">Athletics Club</option>
                  <option value="Basketball Team">Basketball Team</option>
                  <option value="Volleyball Team">Volleyball Team</option>
                  <option value="Kabaddi Club">Kabaddi Club</option>
                  <option value="Kho-Kho Club">Kho-Kho Club</option>
                  <option value="Cricket Academy">Cricket Academy</option>
                  <option value="Badminton Club">Badminton Club</option>
                </select>
              </div>

              {/* Role */}
              <div>
                <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Athlete Role</label>
                <input
                  type="text"
                  value={teamRole}
                  onChange={(e) => setTeamRole(e.target.value)}
                  placeholder="e.g. Captain, Midfielder, Raider, Sprinter (100m)"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-cyan-550"
                  required
                />
              </div>

              {/* Next Event / Match */}
              <div>
                <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Upcoming Match / Event</label>
                <input
                  type="text"
                  value={teamMatch}
                  onChange={(e) => setTeamMatch(e.target.value)}
                  placeholder="e.g., Inter-school Quarterfinals or Zonal Meet"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-cyan-550"
                  required
                />
              </div>

              {/* Match Date */}
              <div>
                <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Schedule / Date</label>
                <input
                  type="text"
                  value={teamDate}
                  onChange={(e) => setTeamDate(e.target.value)}
                  placeholder="e.g., This Friday, 4:00 PM or Nov 12"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-cyan-550"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-150 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-white rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTeam}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-450 text-white rounded-xl font-bold transition-colors shadow-lg shadow-cyan-500/20"
                >
                  {isSavingTeam ? "Enrolling..." : "Enroll Team"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SCHEDULE SPORTS EVENT */}
      {isEventModalOpen && eventStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111a2c] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>Schedule Event: {eventStudent.name}</span>
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveEvent} className="p-6 space-y-4 text-xs">

              {/* Event Title */}
              <div>
                <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Event Title</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Annual Sports Meet, Basketball Selection Trials"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Date & Time</label>
                <input
                  type="text"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="e.g. Nov 15, 2026 or Oct 23, 2026"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Event Type and Icon */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Event Scope</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-emerald-550"
                  >
                    <option value="Selection Trials">Selection Trials</option>
                    <option value="School Tournament">School Tournament</option>
                    <option value="Fitness Assessment">Fitness Assessment</option>
                    <option value="Sports Day">Sports Day Meet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-450 mb-1.5 font-bold uppercase tracking-wider">Event Sport Icon</label>
                  <select
                    value={eventIcon}
                    onChange={(e) => setEventIcon(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-black dark:text-white focus:outline-none focus:border-emerald-550"
                  >
                    <option value="🏆">🏆 Tournament</option>
                    <option value="🏀">🏀 Basketball</option>
                    <option value="⚽">⚽ Football</option>
                    <option value="🏃‍♂️">🏃‍♂️ Athletics / Sprint</option>
                    <option value="🏐">🏐 Volleyball</option>
                    <option value="📅">📅 General Date</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-150 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-white rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEvent}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-450 text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-500/20"
                >
                  {isSavingEvent ? "Scheduling..." : "Schedule Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}