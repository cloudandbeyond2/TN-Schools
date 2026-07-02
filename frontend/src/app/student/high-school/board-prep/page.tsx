"use client";

import PortalLayout from "@/components/PortalLayout";
import { useState } from "react";
import { Clock, Brain, FileText, Timer, Bot } from "lucide-react";


const syllabusProgress = [
  { subject: "Mathematics", totalChapters: 15, completed: 9, color: "#ef4444" },
  { subject: "Science", totalChapters: 22, completed: 18, color: "#3b82f6" },
  { subject: "Social Science", totalChapters: 25, completed: 20, color: "#8b5cf6" },
  { subject: "English", totalChapters: 12, completed: 11, color: "#10b981" },
  { subject: "Tamil", totalChapters: 10, completed: 9, color: "#f59e0b" },
];

const aiWeaknesses = [
  {
    subject: "Mathematics",
    topic: "Trigonometry",
    impact: "High",
    accuracy: "42%",
    suggestion: "Watch 3D visual lab on Right Angles, practice 20 PYQs.",
    actionLink: "Start AI Module"
  },
  {
    subject: "Science",
    topic: "Carbon & its Compounds",
    impact: "Medium",
    accuracy: "55%",
    suggestion: "Review organic nomenclature cheat sheet.",
    actionLink: "View Cheat Sheet"
  }
];

const previousPapers = [
  { year: "2024", type: "Board Paper", status: "Untouched" },
  { year: "2023", type: "Board Paper", status: "Completed 80%" },
  { year: "2022", type: "Board Paper", status: "Completed 100%" },
  { year: "2024 PTA", type: "Model Paper", status: "Untouched" },
];

export default function BoardPrepPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <PortalLayout
      title="SSLC Board Preparation"
      subtitle="Your ultimate command center for scoring 480+ in 10th Boards."
    >
      {/* Top Countdown Banner */}
      <div className="glass rounded-2xl p-6 mb-6 fade-in flex flex-col md:flex-row items-center justify-between border-l-4 border-red-500 bg-red-900/10">
        <div>
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">Countdown to SSLC Public Exams <Clock className="w-5 h-5 text-red-400" /></h2>
          <p className="text-slate-400 text-sm">Stay focused, Arjun. Every day counts towards your goal of 480+!</p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <div className="bg-slate-900/80 rounded-xl p-3 text-center min-w-[80px] border border-red-500/30">
            <div className="text-2xl font-bold text-red-400">84</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Days</div>
          </div>
          <div className="bg-slate-900/80 rounded-xl p-3 text-center min-w-[80px] border border-slate-700">
            <div className="text-2xl font-bold text-white">12</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Hrs</div>
          </div>
          <div className="bg-slate-900/80 rounded-xl p-3 text-center min-w-[80px] border border-slate-700">
            <div className="text-2xl font-bold text-white">45</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Mins</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-700/50 pb-2">
        <button 
          onClick={() => setActiveTab("overview")}
          className={`text-sm font-semibold px-4 py-2 transition-all ${activeTab === "overview" ? "text-red-400 border-b-2 border-red-400" : "text-slate-400 hover:text-white"}`}
        >
          Syllabus Tracker
        </button>
        <button 
          onClick={() => setActiveTab("ai-analysis")}
          className={`text-sm font-semibold px-4 py-2 transition-all flex items-center gap-1.5 ${activeTab === "ai-analysis" ? "text-red-400 border-b-2 border-red-400" : "text-slate-400 hover:text-white"}`}
        >
          AI Weakness Detector <Bot className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setActiveTab("pyq")}
          className={`text-sm font-semibold px-4 py-2 transition-all ${activeTab === "pyq" ? "text-red-400 border-b-2 border-red-400" : "text-slate-400 hover:text-white"}`}
        >
          Previous Year Papers (PYQ)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Main Content Area based on Tab */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "overview" && (
            <div className="glass rounded-2xl p-6 fade-in-2 border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-6">Syllabus Completion</h3>
              <div className="space-y-6">
                {syllabusProgress.map((sub, idx) => {
                  const percent = Math.round((sub.completed / sub.totalChapters) * 100);
                  return (
                    <div key={idx}>
                      <div className="flex justify-between items-end mb-2">
                        <span className="font-semibold text-slate-200">{sub.subject}</span>
                        <span className="text-xs font-mono text-slate-400">{sub.completed}/{sub.totalChapters} Ch. ({percent}%)</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000" 
                          style={{ width: `${percent}%`, backgroundColor: sub.color }}
                        />
                      </div>
                      {percent < 70 && (
                        <p className="text-xs text-red-400 mt-2">Requires immediate attention. You are behind schedule!</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === "ai-analysis" && (
            <div className="glass rounded-2xl p-6 fade-in-2 border border-red-500/20 bg-gradient-to-br from-red-900/10 to-transparent">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                  <Brain className="w-5 h-5 text-red-400" /> AI Weakness Detector
                </h3>
                <span className="bg-red-500/20 text-red-400 text-xs px-3 py-1 rounded-full border border-red-500/30">Auto-updated from recent mocks</span>
              </div>
              <div className="space-y-4">
                {aiWeaknesses.map((weakness, idx) => (
                  <div key={idx} className="bg-slate-900/60 p-5 rounded-xl border border-slate-700 hover:border-red-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{weakness.subject}</span>
                        <h4 className="text-base font-bold text-red-400 mt-1">{weakness.topic}</h4>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs text-slate-500">Exam Impact</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded mt-1 inline-block ${weakness.impact === 'High' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}>
                          {weakness.impact} Weightage
                        </span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <span className="text-sm text-slate-400">Current Accuracy: <strong className="text-white">{weakness.accuracy}</strong></span>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg flex items-center justify-between">
                      <p className="text-sm text-slate-300 flex-1">{weakness.suggestion}</p>
                      <button className="ml-4 text-xs font-bold bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                        {weakness.actionLink}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "pyq" && (
            <div className="glass rounded-2xl p-6 fade-in-2 border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-6">Previous Year Question Papers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {previousPapers.map((paper, idx) => (
                  <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 flex flex-col justify-between hover:-translate-y-1 transition-transform cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                      <FileText className="w-8 h-8 text-red-400" />
                      <span className={`text-xs font-bold px-2 py-1 rounded ${paper.status === 'Untouched' ? 'bg-slate-700 text-slate-300' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {paper.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">{paper.year} {paper.type}</h4>
                      <p className="text-xs text-slate-500 mb-4">All Subjects included. Time limit: 3 Hrs.</p>
                    </div>
                    <button className="w-full py-2 bg-slate-800 group-hover:bg-red-500/20 group-hover:text-red-400 text-slate-300 text-sm font-semibold rounded-lg transition-colors border border-transparent group-hover:border-red-500/30">
                      Start Test Mode
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar / Quick Actions */}
        <div className="space-y-6">
          {/* Target Card */}
          <div className="glass rounded-2xl p-6 border-t-4 border-emerald-500 fade-in-3 bg-emerald-900/10">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">My Target</h3>
            <div className="text-5xl font-black text-white mb-2">480<span className="text-2xl text-emerald-400">/500</span></div>
            <p className="text-xs text-slate-400">Based on your ambition: Computer Science Engineering at Anna University.</p>
          </div>

          {/* Daily Goals */}
          <div className="glass rounded-2xl p-6 fade-in-4 border border-slate-700/50">
            <h3 className="text-base font-bold text-white mb-4">Daily Goals</h3>
            <div className="space-y-3">
              {[
                { task: "Read Science Ch-4", done: true },
                { task: "Solve 15 Math PYQs", done: false },
                { task: "Take Tamil Mini-Mock", done: false },
              ].map((goal, idx) => (
                <label key={idx} className="flex items-start gap-3 cursor-pointer group">
                  <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${goal.done ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-800 border-slate-600 group-hover:border-red-400'}`}>
                    {goal.done && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className={`text-sm ${goal.done ? 'text-slate-500 line-through' : 'text-slate-300 group-hover:text-white'}`}>{goal.task}</span>
                </label>
              ))}
            </div>
            <button className="mt-5 w-full py-2 border border-slate-600 text-slate-400 text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors">
              Add Custom Goal +
            </button>
          </div>

          {/* Pomodoro Timer */}
          <div className="glass rounded-2xl p-6 fade-in-5 border border-slate-700/50 flex flex-col items-center justify-center py-8">
            <Timer className="w-10 h-10 text-emerald-400 mb-3" />
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Study Timer</h3>
            <div className="text-4xl font-mono font-bold text-white mb-4">25:00</div>
            <button className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold text-sm hover:bg-slate-200 transition-colors">
              Start Focus Session
            </button>
          </div>
        </div>

      </div>
    </PortalLayout>
  );
}
