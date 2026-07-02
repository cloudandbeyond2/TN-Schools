"use client";

import PortalLayout from "@/components/PortalLayout";
import { useState, useEffect } from "react";
import { Clock, Brain, FileText, Timer, Bot, Award, Target, Calendar, CheckSquare, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

const syllabusData = {
  "9": [
    { subject: "Mathematics", totalChapters: 9, completed: 5, color: "#ef4444" },
    { subject: "Science", totalChapters: 17, completed: 12, color: "#3b82f6" },
    { subject: "Social Science", totalChapters: 21, completed: 14, color: "#8b5cf6" },
    { subject: "English", totalChapters: 7, completed: 5, color: "#10b981" },
    { subject: "Tamil", totalChapters: 9, completed: 8, color: "#f59e0b" },
  ],
  "10": [
    { subject: "Mathematics", totalChapters: 15, completed: 9, color: "#ef4444" },
    { subject: "Science", totalChapters: 22, completed: 18, color: "#3b82f6" },
    { subject: "Social Science", totalChapters: 25, completed: 20, color: "#8b5cf6" },
    { subject: "English", totalChapters: 12, completed: 11, color: "#10b981" },
    { subject: "Tamil", totalChapters: 10, completed: 9, color: "#f59e0b" },
  ]
};

const aiWeaknessData = {
  "9": [
    {
      subject: "Mathematics",
      topic: "Algebra (Factorization)",
      impact: "High",
      accuracy: "48%",
      suggestion: "Practice factorization using identity formulas, complete 15 practice questions.",
      actionLink: "Start Practice"
    },
    {
      subject: "Science",
      topic: "Laws of Motion",
      impact: "Medium",
      accuracy: "60%",
      suggestion: "Watch visual interactive simulation of Newton's laws.",
      actionLink: "Launch Simulation"
    }
  ],
  "10": [
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
  ]
};

const paperData = {
  "9": [
    { year: "2024", type: "Annual Exam Paper", status: "Untouched", duration: "2.5 Hrs" },
    { year: "2023", type: "Annual Exam Paper", status: "Completed 100%", duration: "2.5 Hrs" },
    { year: "2024", type: "Half-Yearly Paper", status: "Completed 75%", duration: "2.5 Hrs" },
    { year: "2024", type: "Quarterly Paper", status: "Completed 90%", duration: "2.5 Hrs" },
  ],
  "10": [
    { year: "2024", type: "Board Paper", status: "Untouched", duration: "3 Hrs" },
    { year: "2023", type: "Board Paper", status: "Completed 80%", duration: "3 Hrs" },
    { year: "2022", type: "Board Paper", status: "Completed 100%", duration: "3 Hrs" },
    { year: "2024 PTA", type: "Model Paper", status: "Untouched", duration: "3 Hrs" },
  ]
};

const defaultGoals = {
  "9": [
    { task: "Revise Science Ch-2 (Motion) notes", done: true },
    { task: "Complete Algebra Exercise 3.2", done: false },
    { task: "Practice 9th Tamil grammar rules", done: false },
  ],
  "10": [
    { task: "Read Science Ch-4 (Carbon Compounds)", done: true },
    { task: "Solve 15 Math Trigonometry PYQs", done: false },
    { task: "Take Tamil Public Exam Mini-Mock", done: false },
  ]
};

export default function BoardPrepPage() {
  const { data: session } = useSession();
  const [student, setStudent] = useState<any>(null);
  const [selectedGrade, setSelectedGrade] = useState<"9" | "10">("10");
  const [activeTab, setActiveTab] = useState("overview");
  const [timerSeconds, setTimerSeconds] = useState(1500); // 25:00
  const [timerRunning, setTimerRunning] = useState(false);
  const [goals, setGoals] = useState<any>(defaultGoals);
  const [customGoalText, setCustomGoalText] = useState("");
  const [showAddGoal, setShowAddGoal] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/students`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          const myStudent = (session?.user as any)?.id 
            ? json.data.find((s: any) => s.userId === (session?.user as any)?.id)
            : null;
          const matchedStudent = myStudent || json.data[0];
          setStudent(matchedStudent);
          if (matchedStudent && (matchedStudent.class === "9" || matchedStudent.class === 9)) {
            setSelectedGrade("9");
          } else {
            setSelectedGrade("10");
          }
        }
      })
      .catch((err) => console.error(err));
  }, [session]);

  // Pomodoro Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const toggleTimer = () => {
    if (timerSeconds === 0) setTimerSeconds(1500);
    setTimerRunning(!timerRunning);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleGoal = (grade: "9" | "10", idx: number) => {
    const updatedGoals = { ...goals };
    updatedGoals[grade][idx].done = !updatedGoals[grade][idx].done;
    setGoals(updatedGoals);
  };

  const addCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoalText.trim()) return;
    const updatedGoals = { ...goals };
    updatedGoals[selectedGrade].push({ task: customGoalText, done: false });
    setGoals(updatedGoals);
    setCustomGoalText("");
    setShowAddGoal(false);
  };

  const userName = session?.user?.name || student?.user?.name || "Student";
  const subtitle = selectedGrade === "10" 
    ? "Your ultimate command center for scoring 480+ in 10th Boards."
    : "Succeed in Class 9 annual exams and build a solid foundation for your boards.";

  const currentSyllabus = syllabusData[selectedGrade];
  const currentWeaknesses = aiWeaknessData[selectedGrade];
  const currentPapers = paperData[selectedGrade];
  const currentGoals = goals[selectedGrade];

  return (
    <PortalLayout
      title={selectedGrade === "10" ? "SSLC Board Preparation" : "Class 9 Annual Exam Preparation"}
      subtitle={subtitle}
    >
      {/* Grade / Class Switcher */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-slate-400">
          Showing personalized prep for:
        </div>
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setSelectedGrade("9")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedGrade === "9"
                ? "bg-red-500 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Class 9 (Annuals)
          </button>
          <button
            onClick={() => setSelectedGrade("10")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedGrade === "10"
                ? "bg-red-500 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Class 10 (SSLC Boards)
          </button>
        </div>
      </div>

      {/* Top Countdown Banner */}
      <div className="glass rounded-2xl p-6 mb-6 fade-in flex flex-col md:flex-row items-center justify-between border-l-4 border-red-500 bg-red-900/10">
        <div>
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            Countdown to {selectedGrade === "10" ? "SSLC Public Exams" : "Class 9 Final Exams"} 
            <Clock className="w-5 h-5 text-red-400" />
          </h2>
          <p className="text-slate-400 text-sm">
            {selectedGrade === "10" 
              ? `Stay focused, ${userName}. Every day counts towards your goal of 480+!`
              : `Great foundations build high scores, ${userName}. Set your pace for Class 10!`}
          </p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <div className="bg-slate-900/80 rounded-xl p-3 text-center min-w-[80px] border border-red-500/30">
            <div className="text-2xl font-bold text-red-400">
              {selectedGrade === "10" ? "84" : "112"}
            </div>
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
          {selectedGrade === "10" ? "Previous Year Papers (PYQ)" : "Practice & Term Papers"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Main Content Area based on Tab */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "overview" && (
            <div className="glass rounded-2xl p-6 fade-in-2 border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-6">Syllabus Completion</h3>
              <div className="space-y-6">
                {currentSyllabus.map((sub, idx) => {
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
                        <p className="text-xs text-red-400 mt-2">Requires attention. Boost daily practice to stay on track!</p>
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
                <span className="bg-red-500/20 text-red-400 text-xs px-3 py-1 rounded-full border border-red-500/30">Auto-updated from practice drills</span>
              </div>
              <div className="space-y-4">
                {currentWeaknesses.map((weakness, idx) => (
                  <div key={idx} className="bg-slate-900/60 p-5 rounded-xl border border-slate-700 hover:border-red-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{weakness.subject}</span>
                        <h4 className="text-base font-bold text-red-400 mt-1">{weakness.topic}</h4>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs text-slate-500">Weightage</span>
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
                      <button className="ml-4 text-xs font-bold bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)] whitespace-nowrap">
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
              <h3 className="text-lg font-bold text-white mb-6">
                {selectedGrade === "10" ? "Previous Year Question Papers" : "Practice & Term Exam Papers"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentPapers.map((paper, idx) => (
                  <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 flex flex-col justify-between hover:-translate-y-1 transition-transform cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                      <FileText className="w-8 h-8 text-red-400" />
                      <span className={`text-xs font-bold px-2 py-1 rounded ${paper.status === 'Untouched' ? 'bg-slate-700 text-slate-300' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {paper.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">{paper.year} {paper.type}</h4>
                      <p className="text-xs text-slate-500 mb-4">All Subjects included. Time limit: {paper.duration}.</p>
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
            {selectedGrade === "10" ? (
              <>
                <div className="text-5xl font-black text-white mb-2">480<span className="text-2xl text-emerald-400">/500</span></div>
                <p className="text-xs text-slate-400">Based on your ambition: Computer Science Engineering at Anna University.</p>
              </>
            ) : (
              <>
                <div className="text-5xl font-black text-white mb-2">95%<span className="text-2xl text-emerald-400"> avg</span></div>
                <p className="text-xs text-slate-400">Secure Class 9 toppers list and build base for SSLC Centum goals next year.</p>
              </>
            )}
          </div>

          {/* Daily Goals */}
          <div className="glass rounded-2xl p-6 fade-in-4 border border-slate-700/50">
            <h3 className="text-base font-bold text-white mb-4">Daily Goals</h3>
            <div className="space-y-3">
              {currentGoals.map((goal: any, idx: number) => (
                <label key={idx} className="flex items-start gap-3 cursor-pointer group">
                  <div 
                    onClick={() => toggleGoal(selectedGrade, idx)}
                    className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${goal.done ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-800 border-slate-600 group-hover:border-red-400'}`}
                  >
                    {goal.done && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className={`text-sm ${goal.done ? 'text-slate-500 line-through' : 'text-slate-300 group-hover:text-white'}`}>{goal.task}</span>
                </label>
              ))}
            </div>

            {showAddGoal ? (
              <form onSubmit={addCustomGoal} className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="New goal..."
                  value={customGoalText}
                  onChange={(e) => setCustomGoalText(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 flex-1"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  Add
                </button>
              </form>
            ) : (
              <button 
                onClick={() => setShowAddGoal(true)}
                className="mt-5 w-full py-2 border border-slate-600 text-slate-400 text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Add Custom Goal +
              </button>
            )}
          </div>

          {/* Pomodoro Timer */}
          <div className="glass rounded-2xl p-6 fade-in-5 border border-slate-700/50 flex flex-col items-center justify-center py-8">
            <Timer className={`w-10 h-10 mb-3 transition-colors ${timerRunning ? "text-red-400 animate-pulse" : "text-emerald-400"}`} />
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Study Timer</h3>
            <div className="text-4xl font-mono font-bold text-white mb-4">{formatTime(timerSeconds)}</div>
            <button 
              onClick={toggleTimer}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${
                timerRunning 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-white hover:bg-slate-200 text-slate-900"
              }`}
            >
              {timerRunning ? "Pause Session" : "Start Focus Session"}
            </button>
          </div>
        </div>

      </div>
    </PortalLayout>
  );
}
