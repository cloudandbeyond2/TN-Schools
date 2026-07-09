"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";

const SUBJECTS = ["Mathematics", "Science", "Tamil", "English", "Social Science"];
const FOCUS_OPTIONS = ["Exam Preparation", "Concept Mastery", "Homework & Projects Catchup", "Revision & Mock Tests"];

interface StudySlot {
  subject: string;
  time: string;
  topic: string;
  tip: string;
  completed?: boolean;
}

interface DaySchedule {
  day: string;
  slots: StudySlot[];
}

export default function StudyPlannerPage() {
  const { data: session } = useSession();
  const studentUserId = (session?.user as any)?.id;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [student, setStudent] = useState<any>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [averageMarks, setAverageMarks] = useState<string>("Loading...");

  // Form State
  const [availableHours, setAvailableHours] = useState<number>(3);
  const [upcomingExams, setUpcomingExams] = useState<string>("");
  const [selectedWeakSubjects, setSelectedWeakSubjects] = useState<string[]>([]);
  const [learningPriority, setLearningPriority] = useState<string>(FOCUS_OPTIONS[1]);
  
  // Schedule state
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  // Fetch Student & Marks
  useEffect(() => {
    if (!studentUserId) return;
    setLoadingStudent(true);
    fetch(`${API_URL}/api/students`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          const myStudent = json.data.find((s: any) => s.userId === studentUserId);
          const resolved = myStudent || json.data[0];
          setStudent(resolved);
          
          // Calculate average marks
          if (resolved.marks && resolved.marks.length > 0) {
            const subjectAverages = resolved.marks.reduce((acc: any, mark: any) => {
              const sub = mark.subject || 'General';
              if (!acc[sub]) acc[sub] = { scored: 0, max: 0 };
              acc[sub].scored += mark.scored;
              acc[sub].max += mark.maxMarks;
              return acc;
            }, {});

            const perfString = Object.keys(subjectAverages).map(sub => {
              const avg = Math.round((subjectAverages[sub].scored / subjectAverages[sub].max) * 100);
              return `${sub}: ${avg}%`;
            }).join(', ');
            setAverageMarks(perfString || "No grades logged yet");
          } else {
            setAverageMarks("No grades logged yet");
          }

          // Fetch active schedule
          fetchActiveSchedule(resolved.id);
        }
      })
      .catch((err) => console.error("Error fetching student:", err))
      .finally(() => setLoadingStudent(false));
  }, [studentUserId]);

  const fetchActiveSchedule = (studentId: string) => {
    setLoadingSchedule(true);
    fetch(`${API_URL}/api/student/${studentId}/study-schedule`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.scheduleData) {
          setWeeklySchedule(json.data.scheduleData.weeklySchedule || []);
        }
      })
      .catch((err) => console.error("Error loading schedule:", err))
      .finally(() => setLoadingSchedule(false));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    setGenerating(true);
    try {
      const res = await fetch(`${API_URL}/api/student/${student.id}/study-schedule/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availableHours,
          upcomingExams,
          weakSubjects: selectedWeakSubjects,
          learningPriority,
        })
      });
      const data = await res.json();
      if (data.success && data.data && data.data.scheduleData) {
        setWeeklySchedule(data.data.scheduleData.weeklySchedule || []);
        Swal.fire({
          icon: "success",
          title: "Schedule Formulated!",
          text: "Gemini AI has built your weekly custom study calendar successfully.",
          timer: 2500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Failed", data.error || "Failed to generate schedule.", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "An unexpected network error occurred.", "error");
    } finally {
      setGenerating(false);
    }
  };

  const toggleWeakSubject = (sub: string) => {
    if (selectedWeakSubjects.includes(sub)) {
      setSelectedWeakSubjects(selectedWeakSubjects.filter(s => s !== sub));
    } else {
      setSelectedWeakSubjects([...selectedWeakSubjects, sub]);
    }
  };

  const toggleSlotCompletion = (dayIndex: number, slotIndex: number) => {
    const updated = [...weeklySchedule];
    const slot = updated[dayIndex].slots[slotIndex];
    slot.completed = !slot.completed;
    setWeeklySchedule(updated);

    // Save updated completions to backend
    if (student) {
      fetch(`${API_URL}/api/student/${student.id}/study-schedule/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availableHours,
          upcomingExams,
          weakSubjects: selectedWeakSubjects,
          learningPriority,
          customSchedule: { weeklySchedule: updated } // Handles updating slots state
        })
      }).catch(e => console.error("Error saving slot update:", e));
    }
  };

  return (
    <PortalLayout
      title="AI Self-Study Planner 🗓️"
      subtitle="Input your availability, exam dates, and focus areas to generate an optimal weekly study schedule."
      avatarLetter="S"
      avatarColor="#6366f1"
      themeClass="theme-student"
      accentColor="#6366f1"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[30%_1fr] gap-6 pb-12 text-left">
        {/* Left Side: Planner Constraints Form */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#111a2c] shadow-sm">
            <h3 className="text-base font-bold text-black dark:text-slate-100 mb-5 flex items-center gap-2">
              <span>⚙️</span> Schedule Settings
            </h3>

            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Available Daily Time: {availableHours} Hrs</label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={availableHours}
                  onChange={(e) => setAvailableHours(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1 Hour</span>
                  <span>6 Hours</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Upcoming Exam / Deadline</label>
                <input
                  type="text"
                  placeholder="e.g. Science Mid-Term on July 20"
                  value={upcomingExams}
                  onChange={(e) => setUpcomingExams(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0d1626] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-black dark:text-slate-250 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">My Weak Subjects</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map(sub => {
                    const active = selectedWeakSubjects.includes(sub);
                    return (
                      <button
                        type="button"
                        key={sub}
                        onClick={() => toggleWeakSubject(sub)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          active 
                            ? "bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400"
                            : "bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.05] text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Learning Priority / Focus</label>
                <select
                  value={learningPriority}
                  onChange={(e) => setLearningPriority(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0d1626] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-black dark:text-slate-250 focus:outline-none focus:border-indigo-500"
                >
                  {FOCUS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] rounded-xl">
                <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">Performance Context</span>
                <p className="text-xs text-slate-500 mt-1">{averageMarks}</p>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Formulating Plan...
                  </>
                ) : (
                  <>
                    <span>🪄</span> Generate AI Timetable
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Weekly Timetable Display */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#111a2c] shadow-sm min-h-[500px] flex flex-col">
            <h3 className="text-base font-bold text-black dark:text-slate-100 mb-5 flex items-center gap-2">
              <span>📅</span> Weekly Study Timetable
            </h3>

            {loadingSchedule ? (
              <div className="flex-grow flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : weeklySchedule.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                <span className="text-5xl mb-4">🗓️</span>
                <h4 className="text-sm font-bold text-black dark:text-slate-250">No Active Study Schedule</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
                  Enter your available daily study hours and preferences on the left, and let Gemini AI build a custom, science-backed schedule for you!
                </p>
              </div>
            ) : (
              <div className="space-y-6 flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {weeklySchedule.map((day, dayIdx) => (
                    <div key={day.day} className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-500 mb-3 border-b border-slate-200 dark:border-white/[0.04] pb-1.5 flex justify-between items-center">
                          <span>{day.day}</span>
                          <span className="text-[10px] text-slate-400 capitalize">{day.slots.length} Study Slots</span>
                        </h4>
                        
                        <div className="space-y-3">
                          {day.slots.map((slot, slotIdx) => (
                            <div 
                              key={slotIdx} 
                              className={`p-3 rounded-xl border transition-all flex justify-between items-start gap-2 ${
                                slot.completed 
                                  ? "bg-emerald-500/[0.04] border-emerald-500/20" 
                                  : "bg-white dark:bg-[#0d1626] border-slate-200 dark:border-white/[0.06]"
                              }`}
                            >
                              <div className="flex-grow min-w-0">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  slot.subject === "Mathematics" ? "bg-blue-500/10 text-blue-500" :
                                  slot.subject === "Science" ? "bg-teal-500/10 text-teal-500" :
                                  slot.subject === "English" ? "bg-amber-500/10 text-amber-500" :
                                  "bg-purple-500/10 text-purple-500"
                                }`}>
                                  {slot.subject}
                                </span>
                                <h5 className={`font-semibold text-xs text-black dark:text-slate-200 mt-2 ${slot.completed ? "line-through text-slate-400" : ""}`}>
                                  {slot.topic}
                                </h5>
                                <p className="text-[10px] text-slate-400 mt-0.5">⏱️ {slot.time}</p>
                                {slot.tip && <p className="text-[10px] text-indigo-500 italic mt-1 font-sans">💡 {slot.tip}</p>}
                              </div>

                              <button
                                type="button"
                                onClick={() => toggleSlotCompletion(dayIdx, slotIdx)}
                                className={`w-5 h-5 rounded-md flex items-center justify-center text-xs shrink-0 border ${
                                  slot.completed 
                                    ? "bg-emerald-500 border-emerald-600 text-white" 
                                    : "border-slate-300 dark:border-white/[0.1] hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                                }`}
                              >
                                {slot.completed && "✓"}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
