"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import {
  Monitor,
  Terminal,
  Code2,
  Cpu,
  BookMarked,
  Trophy,
  Keyboard,
  Gamepad2,
  Rocket,
  Zap
} from "lucide-react";

type ComputerModule = {
  id: string;
  title: string;
  moduleType: string;
  description: string;
  gradeLevel: string;
  schoolId: string;
};

export default function ComputerEducationPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [modules, setModules] = useState<ComputerModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  const fetchModules = useCallback(async () => {
    if (!schoolId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/teacher/computer-education?schoolId=${schoolId}`);
      const data = await res.json();
      if (data.success) {
        setModules(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch modules", error);
    } finally {
      setLoading(false);
    }
  }, [schoolId, API_URL]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // Fetch student profile for class-based filtering
  useEffect(() => {
    async function fetchStudentProfile() {
      if (!session?.user) return;
      try {
        const res = await fetch(`${API_URL}/api/students`);
        const json = await res.json();
        if (json.success) {
          const profile = json.data.find((s: any) => s.userId === (session.user as any).id);
          if (profile) {
            setStudentProfile(profile);
          }
        }
      } catch (err) {
        console.error("Failed to fetch student profile", err);
      }
    }
    fetchStudentProfile();
  }, [session, API_URL]);

  const getModuleStyle = (title: string, index: number) => {
    const t = title.toLowerCase();
    let icon = <Monitor />;
    let color = "blue";

    if (t.includes("scratch") || t.includes("game")) { icon = <Gamepad2 />; color = "emerald"; }
    else if (t.includes("safe") || t.includes("web")) { icon = <Terminal />; color = "purple"; }
    else if (t.includes("machine") || t.includes("hardware")) { icon = <Cpu />; color = "amber"; }
    else if (t.includes("code") || t.includes("program")) { icon = <Code2 />; color = "indigo"; }
    else if (t.includes("type") || t.includes("keyboard")) { icon = <Keyboard />; color = "rose"; }
    else { icon = <Rocket />; color = ["blue", "emerald", "purple", "amber", "indigo", "rose"][index % 6]; }

    // Mock progress and students for UI
    const progress = Math.floor(Math.random() * 101); // 0-100
    const students = Math.floor(Math.random() * 30) + 15; // 15-45

    return { icon, color, progress, students };
  };

  // Class ID based Filtering:
  // Parse student class number (e.g. Class 7B -> 7)
  const classMatch = studentProfile?.class?.match(/\d+/);
  const classNum = classMatch ? parseInt(classMatch[0], 10) : 6;

  const filteredModules = modules.filter((mod) => {
    const gl = mod.gradeLevel.toLowerCase();
    // Primary: Classes 1-5
    // Middle: Classes 6-8
    // High: Classes 9-10
    // Higher: Classes 11-12
    if (classNum <= 5) {
      return gl === "primary" || gl === "all grades" || gl === "basics";
    } else if (classNum <= 8) {
      return gl === "middle" || gl === "primary" || gl === "all grades" || gl === "basics";
    } else if (classNum <= 10) {
      return gl === "high" || gl === "middle" || gl === "primary" || gl === "all grades";
    } else {
      // Classes 11-12 (Higher Secondary) see everything
      return true;
    }
  });

  return (
    <PortalLayout
      title="Computer Lab! 💻"
      subtitle="Code, Play, and Learn Technology!"
    >
      <div className="flex flex-col gap-8 text-left">

        {/* Playful Hero */}
        <div className="relative rounded-[3rem] overflow-hidden shadow-xl bg-white dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-700 min-h-[300px] flex flex-col justify-end p-8 sm:p-12">

          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 z-0"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-50 dark:bg-sky-900/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 z-0"></div>

          <div className="absolute top-10 right-10 rotate-12 opacity-80 z-10">
            <Zap className="w-32 h-32 text-slate-100 dark:text-slate-700/50" />
          </div>

          <div className="relative z-20 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-4 py-2 mb-4 font-black tracking-widest text-xs uppercase rounded-2xl shadow-sm rotate-[-2deg] border-2 border-indigo-200 dark:border-indigo-700/50">
              <Code2 className="w-4 h-4" /> Coding is Magic!
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white mb-4 tracking-tight drop-shadow-sm font-mono">Future Innovators</h2>
            <p className="text-slate-600 dark:text-slate-300 font-bold mb-8 text-sm md:text-lg leading-relaxed">
              Welcome to the computer lab! Here we build games, write code, and discover how machines work. Let's make something amazing today!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Main Content Area */}
          <div className="xl:col-span-2 space-y-8">

            <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border-4 border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl rotate-[-5deg]">
                    <Terminal className="w-6 h-6" />
                  </div>
                  Learning Paths for You
                </h3>
              </div>

              <div className="space-y-6">
                {loading ? (
                  <div className="text-center py-10 font-bold text-slate-500">Loading modules... ⏳</div>
                ) : filteredModules.length === 0 ? (
                  <div className="text-center py-10 font-bold text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-3xl border-4 border-dashed border-slate-200 dark:border-slate-700">No modules matching your grade level yet! 🚀</div>
                ) : filteredModules.map((mod, i) => {
                  const { icon, color, progress, students } = getModuleStyle(mod.title, i);
                  return (
                    <div key={mod.id} className="p-6 rounded-[2rem] border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 hover:-translate-y-1 hover:shadow-lg transition-all group relative">

                      <div className="flex items-center gap-6 mb-6">
                        <div className={`w-14 h-14 rounded-2xl bg-${color}-100 text-${color}-600 flex items-center justify-center shadow-inner shrink-0`}>
                          {React.cloneElement(icon as React.ReactElement, { className: "w-7 h-7" })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono truncate">{mod.title}</h4>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">{mod.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded-md bg-${color}-100 text-${color}-700 text-xs font-bold`}>{students} Students</span>
                            <span className={`px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase`}>{mod.gradeLevel}</span>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3 sm:block">
                          <span className={`text-2xl font-black text-${color}-600 drop-shadow-sm`}>{progress}%</span>
                        </div>
                      </div>

                      {/* Playful Progress Bar */}
                      <div className="w-full h-4 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-inner border-2 border-slate-300 dark:border-slate-600 relative">
                        <div
                          className={`absolute top-0 left-0 h-full bg-${color}-500 rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${progress}%` }}
                        >
                          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]"></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>

          {/* Quick Resources & Badges */}
          <div className="space-y-8">

            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border-4 border-amber-100 dark:border-slate-700 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 dark:bg-amber-900/20 rounded-bl-full pointer-events-none"></div>

              <div className="w-20 h-20 mx-auto bg-amber-100 text-amber-500 rounded-3xl flex items-center justify-center mb-4 shadow-inner rotate-12">
                <Trophy className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-amber-900 dark:text-amber-100 mb-2">My Rewards & Badges!</h3>
              <p className="text-sm font-bold text-slate-500 mb-6">Earn cool digital badges by code completion and typing speed!</p>

              <button onClick={() => Swal.fire({ title: 'Stickers!', text: 'Opening my badge book! 🌟', icon: 'success' })} className="w-full py-3 rounded-2xl bg-amber-400 text-amber-900 font-black text-sm shadow-lg shadow-amber-500/30 hover:bg-amber-300 active:scale-95 transition-all border-b-4 border-amber-500">
                View My Stickers!
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border-4 border-emerald-100 dark:border-slate-700">
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl rotate-[-5deg]">
                  <BookMarked className="w-6 h-6" />
                </div>
                Learning Guides
              </h3>

              <div className="space-y-4">
                <button onClick={() => Swal.fire({ title: 'Shortcuts', text: 'Opening Keyboard Shortcuts cheat sheet... ⌨️', icon: 'info' })} className="w-full text-left p-4 rounded-2xl border-4 border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-slate-650 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all text-sm font-black text-slate-700 dark:text-slate-200 flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-100 text-slate-400 group-hover:text-emerald-500 transition-colors">⌨️</div>
                  Keyboard Shortcuts
                </button>
                <button onClick={() => Swal.fire({ title: 'Scratch Reference', text: 'Opening Scratch code reference block booklet! 🐱', icon: 'info' })} className="w-full text-left p-4 rounded-2xl border-4 border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-slate-650 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all text-sm font-black text-slate-700 dark:text-slate-200 flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-100 text-slate-400 group-hover:text-emerald-500 transition-colors">🐱</div>
                  Scratch Block Reference
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
