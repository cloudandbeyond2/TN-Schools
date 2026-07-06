"use client";

import PortalLayout from "@/components/PortalLayout";
import GroupAwareExamList from "@/components/GroupAwareExamList";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";

const mockTests = [
  { name: "NEET Full Syllabus Mock 4", date: "Coming Sunday, 10:00 AM", duration: "3 Hours", status: "Upcoming", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  { name: "NEET Part Test: Human Physiology", date: "Yesterday", duration: "1 Hour", score: "280/360", status: "Completed", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  { name: "JEE Main Previous Year 2024", date: "Last Week", duration: "3 Hours", score: "185/300", status: "Completed", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
];

const subjectCoverage = [
  { subject: "Physics", percent: 68, color: "#3b82f6", strong: "Optics", weak: "Thermodynamics" },
  { subject: "Chemistry", percent: 85, color: "#10b981", strong: "Organic", weak: "Equilibrium" },
  { subject: "Biology", percent: 92, color: "#ec4899", strong: "Genetics", weak: "Plant Physiology" },
];

export default function CompetitivePrepPage() {
  const [activeTab, setActiveTab] = useState("NEET");
  const { data: session } = useSession();
  const studentId = (session?.user as any)?.studentId || null;
  const studentClass = (session?.user as any)?.class || null;

  return (
    <PortalLayout
      title={`${activeTab} Preparation Hub`}
      subtitle={`Track your syllabus, take mock tests, and get AI insights for your ${activeTab} goal.`}
      avatarLetter="A"
      avatarColor="#ef4444"
      themeClass="theme-student"
      accentColor="#ef4444"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-700/50 w-fit">
           <button 
             onClick={() => setActiveTab("NEET")}
             className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "NEET" ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-slate-400 hover:text-white"}`}
           >
             NEET (Medical)
           </button>
           <button 
             onClick={() => setActiveTab("JEE")}
             className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "JEE" ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-white"}`}
           >
             JEE (Engineering)
           </button>
        </div>
        <Link href="/student/higher-secondary" className="text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2">
          <span>←</span> Back to Dashboard
        </Link>
      </div>

      {/* Group-wise exam guidance (TN HSC Annexure-I groups) */}
      <div className="mb-6">
        <GroupAwareExamList studentId={studentId} studentClass={studentClass} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Top Stats Banner */}
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass rounded-3xl p-6 border border-slate-700/50 flex flex-col justify-center relative overflow-hidden group">
                 <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20 ${activeTab === "NEET" ? "bg-red-500" : "bg-blue-500"}`}></div>
                 <span className="text-3xl mb-2 group-hover:scale-110 transition-transform origin-left">⏳</span>
                 <h3 className="text-3xl font-black text-white">120 <span className="text-sm font-bold text-slate-400 uppercase">Days</span></h3>
                 <p className="text-xs text-slate-400 mt-1">Until {activeTab} Exam</p>
              </div>
              <div className="glass rounded-3xl p-6 border border-slate-700/50 flex flex-col justify-center relative overflow-hidden group">
                 <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20 bg-emerald-500"></div>
                 <span className="text-3xl mb-2 group-hover:scale-110 transition-transform origin-left">🎯</span>
                 <h3 className="text-3xl font-black text-white">{activeTab === "NEET" ? "650+" : "99"} <span className="text-sm font-bold text-slate-400 uppercase">{activeTab === "NEET" ? "Score" : "%ile"}</span></h3>
                 <p className="text-xs text-slate-400 mt-1">Your Target Goal</p>
              </div>
              <div className="glass rounded-3xl p-6 border border-slate-700/50 flex flex-col justify-center relative overflow-hidden group">
                 <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20 bg-purple-500"></div>
                 <span className="text-3xl mb-2 group-hover:scale-110 transition-transform origin-left">📈</span>
                 <h3 className="text-3xl font-black text-white">Top 5%</h3>
                 <p className="text-xs text-slate-400 mt-1">State Rank Prediction</p>
              </div>
           </div>

           {/* Syllabus Mastery Matrix */}
           <div className="glass rounded-3xl p-6 border border-slate-700/50">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-xl">📊</span> Syllabus Mastery Matrix
                </h2>
                <button className="text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">Detailed Report</button>
             </div>
             
             <div className="space-y-6">
                {subjectCoverage.filter(s => activeTab === "NEET" ? true : s.subject !== "Biology" || (s.subject === "Biology" && false) /* Mock logic for JEE math vs NEET bio */).map((subject, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-inner" style={{ backgroundColor: `${subject.color}20`, color: subject.color }}>
                          {subject.subject === "Physics" ? "⚛️" : subject.subject === "Chemistry" ? "🧪" : subject.subject === "Biology" ? "🧬" : "📐"}
                        </div>
                        <h3 className="font-bold text-white">{subject.subject}</h3>
                      </div>
                      <span className="text-sm font-black text-white">{subject.percent}%</span>
                    </div>
                    
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                      <div className="h-full rounded-full transition-all duration-1000 relative" style={{ width: `${subject.percent}%`, backgroundColor: subject.color }}>
                         <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-white/30 to-transparent"></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 flex items-center justify-between">
                         <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Strongest Area</span>
                         <span className="text-xs font-semibold text-emerald-100 truncate pl-2">{subject.strong}</span>
                       </div>
                       <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 flex items-center justify-between">
                         <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Needs Work</span>
                         <span className="text-xs font-semibold text-red-100 truncate pl-2">{subject.weak}</span>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
           </div>

           {/* AI Recommendations */}
           <div className={`glass rounded-3xl p-6 border ${activeTab === "NEET" ? "border-red-500/30" : "border-blue-500/30"} relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl opacity-10 rounded-full ${activeTab === "NEET" ? "bg-red-500" : "bg-blue-500"}`}></div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                <span className="text-2xl">🤖</span> AI Action Plan
              </h2>
              <div className="space-y-4 relative z-10">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 flex gap-4">
                   <div className="text-2xl">⚠️</div>
                   <div>
                     <h3 className="font-bold text-white text-sm mb-1">Focus on Thermodynamics</h3>
                     <p className="text-xs text-slate-400 leading-relaxed">Your accuracy in Physics Thermodynamics has dropped to 45% in the last 2 mock tests. I have prepared a custom 20-question practice set targeting your weak concepts.</p>
                     <button className={`mt-3 text-xs font-bold px-4 py-2 rounded-lg text-white shadow-lg transition-transform active:scale-95 ${activeTab === "NEET" ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}`}>
                       Start Custom Practice →
                     </button>
                   </div>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 flex gap-4">
                   <div className="text-2xl">⭐</div>
                   <div>
                     <h3 className="font-bold text-white text-sm mb-1">Biology Revision Strategy</h3>
                     <p className="text-xs text-slate-400 leading-relaxed">You are doing great in Genetics! To maintain this, I recommend scheduling a quick flashcard review session tomorrow morning.</p>
                   </div>
                </div>
              </div>
           </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
           
           {/* Mock Tests */}
           <div className="glass rounded-3xl p-6 border border-slate-700/50">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-lg font-bold text-white flex items-center gap-2">
                 <span className="text-xl">📝</span> Mock Tests
               </h2>
               <Link href="#" className={`text-xs font-bold hover:underline ${activeTab === "NEET" ? "text-red-400" : "text-blue-400"}`}>View All</Link>
             </div>

             <div className="space-y-4">
                {mockTests.map((test, idx) => (
                  <div key={idx} className={`bg-slate-900/40 p-4 rounded-xl border hover:border-slate-500 transition-colors cursor-pointer ${test.border}`}>
                     <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${test.bg} ${test.color}`}>{test.status}</span>
                        {test.score && <span className="text-sm font-black text-white">{test.score}</span>}
                     </div>
                     <h3 className="font-bold text-white text-sm mb-1">{test.name}</h3>
                     <p className="text-xs text-slate-400 flex items-center gap-2">
                       <span>📅 {test.date}</span>
                       <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                       <span>⏱️ {test.duration}</span>
                     </p>
                  </div>
                ))}
             </div>
             <button className={`w-full mt-4 py-3 rounded-xl text-sm font-bold text-white shadow-lg hover:brightness-110 transition-all ${activeTab === "NEET" ? "bg-gradient-to-r from-red-600 to-orange-500" : "bg-gradient-to-r from-blue-600 to-indigo-500"}`}>
               Take New Mock Test
             </button>
           </div>

           {/* Doubt Solving */}
           <div className="glass rounded-3xl p-6 border border-slate-700/50 text-center">
              <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center text-3xl mb-4 border border-slate-700 shadow-inner">
                📸
              </div>
              <h3 className="font-bold text-white mb-2">Stuck on a question?</h3>
              <p className="text-xs text-slate-400 mb-6 px-4">Take a photo of any MCQs you can't solve, and our AI will provide step-by-step video solutions.</p>
              <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-white font-bold transition-colors">
                Upload Question Photo
              </button>
           </div>

        </div>

      </div>
    </PortalLayout>
  );
}
