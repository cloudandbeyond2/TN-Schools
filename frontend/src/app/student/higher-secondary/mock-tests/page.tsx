"use client";

import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function MockTestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  
  const [testHistory, setTestHistory] = useState<any[]>([]);
  const [upcomingTests, setUpcomingTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // For AI error analysis, ideally this would come from a backend AI service
  // analyzing the student's wrong answers. For now, we clear the dummy data.
  const weakTopics: any[] = [];

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (status === "loading") return;
    
    const fetchTests = async () => {
      const studentId = (session?.user as any)?.id;
      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/mock-tests/student/${studentId}`);
        const data = await res.json();
        
        if (data.success && data.data) {
          const history: any[] = [];
          const upcoming: any[] = [];

          data.data.forEach((assignment: any) => {
            const test = assignment.mockTest;
            const hasSubmitted = assignment.submissions && assignment.submissions.length > 0;
            
            if (hasSubmitted) {
              const submission = assignment.submissions[0];
              const score = submission.score;
              const total = test.totalMarks;
              const accuracy = Math.round((score / total) * 100) + "%";
              
              history.push({
                id: test.id.substring(0, 8), // shorten UUID for display
                name: test.title,
                date: new Date(submission.submittedAt || Date.now()).toLocaleDateString(),
                score: score,
                total: total,
                accuracy: accuracy,
                percentile: "--", // Need percentile calculation logic on backend
                rank: "--",
                totalStudents: "--",
                timeTaken: "--",
                status: "Completed",
                originalAssignmentId: assignment.id
              });
            } else {
              upcoming.push({
                id: test.id,
                name: test.title,
                date: assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "No Due Date",
                time: assignment.dueDate ? new Date(assignment.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-",
                duration: `${test.duration} Mins`,
                syllabus: test.subject,
                type: test.schoolId ? "School Level" : "State-wide Mock",
                color: test.schoolId ? "from-pink-500 to-rose-600" : "from-amber-500 to-orange-600",
                originalAssignmentId: assignment.id
              });
            }
          });

          setTestHistory(history);
          setUpcomingTests(upcoming);
        }
      } catch (err) {
        console.error("Failed to fetch mock tests", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [session, status]);

  const handleTakeTest = (assignmentId: string) => {
    // Redirect to the actual test taking page
    router.push(`/student/mock-tests`);
  };

  return (
    <PortalLayout
      title="Mock Tests & Analytics"
      subtitle="Evaluate your exam readiness, track your rank progression, and analyze your mistakes."
      avatarLetter={(session?.user?.name || "S").charAt(0).toUpperCase()}
      avatarColor="#f59e0b"
      themeClass="theme-student"
      accentColor="#f59e0b"
    >
      <div className="mb-6 flex items-center gap-4">
         <Link href="/student/higher-secondary" className="text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
            <span>←</span> Back to Dashboard
         </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Upcoming & Analytics */}
        <div className="lg:col-span-1 space-y-6">
           
           {/* Upcoming Tests Banner */}
           <div className="glass rounded-3xl p-6 border border-slate-700/50 bg-slate-900/40 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full"></div>
             <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 relative z-10">
               <span className="text-xl">⏰</span> Upcoming Tests
             </h2>
             
             {loading ? (
               <div className="text-center py-4 text-slate-400 text-sm">Loading tests...</div>
             ) : upcomingTests.length === 0 ? (
               <div className="text-center py-4 text-slate-400 text-sm">No upcoming tests assigned.</div>
             ) : (
               <div className="space-y-4 relative z-10">
                 {upcomingTests.map((test, idx) => (
                   <div key={idx} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 relative overflow-hidden group hover:border-slate-500 transition-colors">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${test.color}`}></div>
                      <div className="pl-3">
                         <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1 block">{test.type}</span>
                         <h3 className="font-bold text-white text-sm mb-2">{test.name}</h3>
                         <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                           <div className="flex items-center gap-1"><span>📅</span> {test.date}</div>
                           <div className="flex items-center gap-1"><span>⏱️</span> {test.duration}</div>
                         </div>
                         <p className="text-xs text-slate-500 mt-2">Subject: {test.syllabus}</p>
                         <button 
                           onClick={() => handleTakeTest(test.originalAssignmentId)}
                           className="mt-3 w-full py-1.5 bg-slate-700 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors"
                         >
                           Start Now
                         </button>
                      </div>
                   </div>
                 ))}
               </div>
             )}
             
             <button 
               onClick={() => router.push("/student/mock-tests")}
               className="w-full mt-4 py-3 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 rounded-xl text-white text-sm font-bold shadow-lg transition-all active:scale-95"
             >
               View All Exams Hub
             </button>
           </div>

           {/* AI Performance Analysis */}
           <div className="glass rounded-3xl p-6 border border-slate-700/50">
             <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
               <span className="text-xl">🤖</span> AI Error Analysis
             </h2>
             <p className="text-xs text-slate-400 leading-relaxed mb-4">Based on your last 5 mock tests, I have identified patterns in the questions you get wrong. Focus on these areas to improve your score.</p>
             
             {weakTopics.length > 0 ? (
               <div className="space-y-3">
                 {weakTopics.map((topic, idx) => (
                   <div key={idx} className="bg-slate-900/60 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white mb-0.5">{topic.topic}</h4>
                        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">{topic.subject} • {topic.impact} Impact</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs font-black text-red-400">{topic.accuracy}</span>
                        <span className="text-[10px] text-slate-500">Accuracy</span>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-6 bg-slate-900/40 rounded-xl border border-slate-800">
                 <p className="text-xs text-slate-500">Not enough test data to analyze yet.</p>
               </div>
             )}
             
             <button className="w-full mt-4 py-2 border border-slate-600 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors" disabled>
               Generate Remedial Practice →
             </button>
           </div>

        </div>

        {/* Right Column: Test History & Leaderboard */}
        <div className="lg:col-span-2">
           <div className="glass rounded-3xl p-6 border border-slate-700/50 h-full flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">📈</span> Mock Test History
                </h2>
                
                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-700/50 w-fit">
                   <button 
                     onClick={() => setFilter("all")}
                     className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === "all" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}
                   >
                     All Tests
                   </button>
                   <button 
                     onClick={() => setFilter("neet")}
                     className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === "neet" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}
                   >
                     NEET Only
                   </button>
                   <button 
                     onClick={() => setFilter("hsc")}
                     className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === "hsc" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}
                   >
                     HSC Board
                   </button>
                </div>
              </div>

              {/* Progress Chart Placeholder */}
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 mb-6 flex items-end justify-between gap-2 h-48 relative overflow-hidden group">
                 {/* Fake Chart Bars - Still using static layout for visual representation */}
                 {testHistory.length > 0 ? (
                   <div className="absolute inset-0 flex items-end justify-around px-4 pb-8 pt-12">
                     {testHistory.slice(-8).map((test, i) => {
                        const height = Math.max(10, (test.score / test.total) * 100);
                        return (
                         <div key={i} className="w-[8%] bg-gradient-to-t from-amber-600/80 to-amber-400 rounded-t-sm relative group/bar hover:brightness-125 transition-all cursor-pointer" style={{ height: `${height}%` }}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20">
                              Score: {test.score}
                            </div>
                         </div>
                        )
                     })}
                   </div>
                 ) : (
                   <div className="absolute inset-0 flex items-center justify-center">
                     <p className="text-slate-500 text-sm">No test history to display.</p>
                   </div>
                 )}
                 <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                   Score Trend
                 </div>
              </div>

              {/* History List */}
              <div className="flex-1 overflow-auto pr-2 space-y-3">
                 {loading ? (
                   <div className="text-center py-8 text-slate-400 text-sm">Loading history...</div>
                 ) : (
                   <>
                     {testHistory
                        .filter(t => filter === "all" ? true : filter === "neet" ? t.name.toLowerCase().includes("neet") : t.name.toLowerCase().includes("hsc"))
                        .map((test, idx) => (
                       <div key={idx} className="bg-slate-800/40 hover:bg-slate-800 p-4 rounded-xl border border-slate-700/50 transition-colors cursor-pointer group">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                             
                             {/* Test Info */}
                             <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                   <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">{test.id}</span>
                                   <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">{test.status}</span>
                                </div>
                                <h3 className="text-sm font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">{test.name}</h3>
                                <p className="text-xs text-slate-400 flex gap-3">
                                  <span>📅 {test.date}</span>
                                  {test.timeTaken !== "--" && <span>⏱️ {test.timeTaken}</span>}
                                </p>
                             </div>

                             {/* Score & Rank */}
                             <div className="flex items-center gap-6 md:border-l border-slate-700 md:pl-6">
                                <div className="text-center">
                                  <span className="block text-lg font-black text-white leading-none">{test.score}<span className="text-sm text-slate-500">/{test.total}</span></span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 block">Score</span>
                                </div>
                                <div className="text-center">
                                  <span className="block text-lg font-black text-amber-400 leading-none">{test.accuracy}</span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 block">Accuracy</span>
                                </div>
                                <div className="text-center hidden sm:block">
                                  <span className="block text-lg font-black text-white leading-none">{test.rank}</span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 block">Rank</span>
                                </div>
                                <div>
                                   <button className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white hover:bg-amber-500 transition-colors">
                                     →
                                   </button>
                                </div>
                             </div>
                             
                          </div>
                       </div>
                     ))}
                     
                     {testHistory.filter(t => filter === "all" ? true : filter === "neet" ? t.name.toLowerCase().includes("neet") : t.name.toLowerCase().includes("hsc")).length === 0 && (
                       <div className="text-center py-8">
                          <div className="text-4xl mb-2">📭</div>
                          <p className="text-slate-400 text-sm">No completed tests found.</p>
                       </div>
                     )}
                   </>
                 )}
              </div>
           </div>
        </div>

      </div>
    </PortalLayout>
  );
}
