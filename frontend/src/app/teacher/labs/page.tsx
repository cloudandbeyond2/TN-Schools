"use client";
import { AlertTriangle, Bot, CheckCircle, FlaskConical, Users, Check, User, Star, Microscope } from "lucide-react";


import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

interface Experiment {
  id: string;
  name: string;
  classSection: string;
  status: "active" | "scheduled" | "completed";
  date: string;
  safetyCheck: boolean;
}

interface StudentLabGrade {
  id: string;
  name: string;
  conduct: string;
  reportStatus: "Submitted" | "Pending" | "Late";
  grade: string;
}

export default function ScienceLabsPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [studentGrades, setStudentGrades] = useState<StudentLabGrade[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Session states
  const [activeExp, setActiveExp] = useState<Experiment | null>(null);
  const [naohVolume, setNaohVolume] = useState(0);
  const [isFlowing, setIsFlowing] = useState(false);
  const [liveStudents, setLiveStudents] = useState<any[]>([]);

  // AI Generator States
  const [labTopic, setLabTopic] = useState("Photosynthesis Rate under Blue Light");
  const [labGrade, setLabGrade] = useState("9");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedManual, setGeneratedManual] = useState<any>(null);

  // Form state for creating a new session
  const [newLabName, setNewLabName] = useState("");
  const [newLabClass, setNewLabClass] = useState("");
  const [newLabDate, setNewLabDate] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!schoolId || !session?.user) return;
      const teacherId = (session.user as any).id;
      try {
        setLoading(true);
        // 1. Fetch teacher classes
        const classesRes = await fetch(`${API_URL}/api/classes?schoolId=${schoolId}&teacherId=${teacherId}`);
        const classesData = await classesRes.json();
        let activeClasses: any[] = [];
        if (classesData.success && Array.isArray(classesData.data)) {
          setTeacherClasses(classesData.data);
          activeClasses = classesData.data;
          if (classesData.data.length > 0) {
            setNewLabClass(`Class ${classesData.data[0].className}${classesData.data[0].section}`);
          }
        }

        if (activeClasses.length === 0) {
          setExperiments([]);
          setStudentGrades([]);
          setLoading(false);
          return;
        }

        // 2. Fetch Labs
        const labsRes = await fetch(`${API_URL}/api/teacher/labs?schoolId=${schoolId}`);
        const labsData = await labsRes.json();
        if (labsData.success && labsData.data) {
          // Filter labs to only show those matching teacher's classes
          const filteredLabs = labsData.data.filter((exp: any) =>
            activeClasses.some(tc => `Class ${tc.className}${tc.section}` === exp.classSection)
          );
          setExperiments(filteredLabs);
          
          // Check if there is an active session
          const active = filteredLabs.find((e: any) => e.status === "active");
          if (active) {
            setActiveExp(active);
          }
        }

        // 3. Fetch Students to populate roster
        const studentsRes = await fetch(`${API_URL}/api/students?schoolId=${schoolId}`);
        const studentsData = await studentsRes.json();
        if (studentsData.success && studentsData.data) {
          // Filter students to only show those belonging to teacher's classes
          const filteredStudents = studentsData.data.filter((st: any) =>
            activeClasses.some(tc => tc.className === st.class && tc.section === st.section)
          );
          
          const mappedGrades = filteredStudents.map((student: any, idx: number) => ({
            id: student.id,
            name: student.user?.name || "Student Name",
            conduct: idx % 3 === 0 ? "Excellent" : idx % 3 === 1 ? "Good" : "Needs Attention",
            reportStatus: idx % 4 === 0 ? "Pending" : idx % 4 === 1 ? "Late" : "Submitted",
            grade: idx % 3 === 0 ? "A" : idx % 3 === 1 ? "B" : "C",
          }));
          setStudentGrades(mappedGrades);
        }
      } catch (err) {
        console.error("Error loading labs page data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolId, API_URL, session]);

  const toggleSafety = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch(`${API_URL}/api/teacher/labs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ safetyCheck: !currentVal }),
      });
      const data = await res.json();
      if (data.success) {
        setExperiments(experiments.map((exp) => (exp.id === id ? { ...exp, safetyCheck: !currentVal } : exp)));
        Swal.fire({
          icon: "success",
          title: "Safety Status Updated",
          text: `Safety verification is now ${!currentVal ? "Verified " : "Unverified "}.`,
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: data.error || "Failed to update safety status.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error("Error updating safety check", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const startSession = async (exp: Experiment) => {
    try {
      const res = await fetch(`${API_URL}/api/teacher/labs/${exp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      const data = await res.json();
      if (data.success) {
        setExperiments(experiments.map((e) => (e.id === exp.id ? { ...e, status: "active" } : e)));
        setActiveExp({ ...exp, status: "active" });
        Swal.fire({
          icon: "success",
          title: "Session Started",
          text: `Lab session for "${exp.name}" is now live!`,
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to Start",
          text: data.error || "Failed to start the lab session.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error("Error starting session", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Could not connect to database.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const endSession = async (id: string) => {
    const result = await Swal.fire({
      title: "End Lab Session?",
      text: "This will complete the session and log student reports.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, complete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/teacher/labs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      const data = await res.json();
      if (data.success) {
        setExperiments(experiments.map((e) => (e.id === id ? { ...e, status: "completed" } : e)));
        setActiveExp(null);
        Swal.fire({
          icon: "success",
          title: "Session Completed",
          text: "The lab session has been recorded as completed.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to End",
          text: data.error || "Failed to end the lab session.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error("Error ending session", err);
    }
  };

  // Titration pH curve computation
  const getTitrationStats = (vol: number) => {
    let ph = 1.0;
    let desc = "Strongly Acidic (HCl)";
    let col = "rgba(255, 255, 255, 0.1)";
    
    if (vol < 18) {
      ph = 1.0 + (vol / 18) * 1.8;
    } else if (vol >= 18 && vol < 19.5) {
      ph = 2.8 + ((vol - 18) / 1.5) * 1.7;
      desc = "Weakly Acidic";
    } else if (vol >= 19.5 && vol < 20.5) {
      ph = 4.5 + (vol - 19.5) * 5.0;
      desc = ph >= 6.5 && ph <= 7.5 ? "Neutralized (Endpoint)" : ph < 6.5 ? "Slightly Acidic" : "Slightly Basic";
    } else if (vol >= 20.5 && vol < 22) {
      ph = 9.5 + ((vol - 20.5) / 1.5) * 1.5;
      desc = "Weakly Basic";
    } else {
      ph = 11.0 + ((vol - 22) / 3) * 1.0;
      desc = "Strongly Basic (NaOH)";
    }
    
    if (ph < 8.2) {
      col = "rgba(255, 255, 255, 0.15)";
    } else if (ph >= 8.2 && ph < 10) {
      const alpha = 0.15 + ((ph - 8.2) / 1.8) * 0.45;
      col = `rgba(244, 143, 177, ${alpha})`;
    } else {
      col = "rgba(233, 30, 99, 0.85)";
    }
    
    return { ph: Math.min(14, parseFloat(ph.toFixed(2))), desc, color: col };
  };

  const { ph: currentPh, desc: phDesc, color: solutionColor } = getTitrationStats(naohVolume);

  // Flow control hook
  useEffect(() => {
    let timer: any;
    if (isFlowing) {
      timer = setInterval(() => {
        setNaohVolume((v) => {
          const nextVal = parseFloat((v + 0.15).toFixed(2));
          if (nextVal >= 25) {
            setIsFlowing(false);
            return 25;
          }
          return nextVal;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isFlowing]);

  // Live student progress simulation
  useEffect(() => {
    if (!activeExp) {
      setLiveStudents([]);
      return;
    }
    
    const initialRoster = studentGrades.map((sg, idx) => {
      let statusText = "Ready to start";
      let progressVal = 0;
      if (idx % 4 === 0) {
        statusText = "Aligning apparatus";
        progressVal = 20;
      } else if (idx % 4 === 1) {
        statusText = "Standardizing solution";
        progressVal = 50;
      } else if (idx % 4 === 2) {
        statusText = "Titrating Trial 1";
        progressVal = 70;
      } else {
        statusText = "Ready to start";
        progressVal = 0;
      }
      return { ...sg, statusText, progressVal };
    });
    setLiveStudents(initialRoster);

    const interval = setInterval(() => {
      setLiveStudents((prev) =>
        prev.map((student) => {
          if (Math.random() > 0.4) {
            let nextProgress = student.progressVal + Math.floor(Math.random() * 15) + 5;
            if (nextProgress >= 100) {
              nextProgress = 100;
              return { ...student, progressVal: 100, statusText: "Finished experiment " };
            }
            
            let statusText = student.statusText;
            if (nextProgress > 20 && nextProgress <= 50) {
              statusText = "Standardizing solution";
            } else if (nextProgress > 50 && nextProgress <= 85) {
              statusText = "Titrating Trial 1";
            } else if (nextProgress > 85 && nextProgress < 100) {
              statusText = "Calculating volume & endpoint";
            }
            return { ...student, progressVal: nextProgress, statusText };
          }
          return student;
        })
      );
    }, 4500);

    return () => clearInterval(interval);
  }, [activeExp, studentGrades]);

  const handleGradeChange = (id: string, newGrade: string) => {
    setStudentGrades(
      studentGrades.map((sg) => (sg.id === id ? { ...sg, grade: newGrade, reportStatus: "Submitted" } : sg))
    );
  };

  const handleCreateLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabName || !newLabDate) return;

    try {
      const res = await fetch(`${API_URL}/api/teacher/labs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newLabName,
          classSection: newLabClass,
          status: "scheduled",
          date: newLabDate,
          safetyCheck: true,
          schoolId,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setExperiments([data.data, ...experiments]);
        setNewLabName("");
        setNewLabDate("");
        setShowAddForm(false);
        Swal.fire({
          icon: "success",
          title: "Lab Scheduled!",
          text: `Lab session "${newLabName}" scheduled successfully.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Creation Failed",
          text: data.error || "Failed to schedule lab session.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error("Error creating lab session", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleGenerateManual = () => {
    setIsGenerating(true);
    setGenerationStep(1);
    setGeneratedManual(null);

    setTimeout(() => {
      setGenerationStep(2);
      setTimeout(() => {
        setGenerationStep(3);
        setTimeout(() => {
          setIsGenerating(false);
          setGeneratedManual({
            title: `Lab Manual: Investigation of ${labTopic} (Grade ${labGrade})`,
            objective: `To measure how blue light wavelengths affect the rate of oxygen bubble formation in hydrilla plants.`,
            apparatus: [
              "Hydrilla plant",
              "Beaker of water",
              "Funnel",
              "Test tube",
              "Blue LED light source",
              "Sodium bicarbonate (CO2 source)",
              "Stopwatch",
            ],
            steps: [
              "Place a fresh cut hydrilla sprig inside a water beaker under an inverted funnel.",
              "Invert a water-filled test tube over the funnel stem to collect gas bubbles.",
              "Position the Blue LED light 10 cm away from the beaker.",
              "Wait 2 minutes for acclimatization, then start the stopwatch and count bubbles for 5 minutes.",
              "Record observations and calculate the rate of photosynthesis (bubbles per minute).",
            ],
            safety: "Handle water near electrical light sources with extreme caution. Do not look directly into high-intensity blue light.",
          });
        }, 1500);
      }, 1500);
    }, 1200);
  };

  if (activeExp) {
    return (
      <PortalLayout title={lang === "தமிழ்" ? "உலிவியல் ஆய்வகம்" : "Active Science Lab"} subtitle={lang === "தமிழ்" ? `நேரடி கண்காணிப்பு: ${activeExp.name}` : `Live monitoring of: ${activeExp.name}`}>
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => setActiveExp(null)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--text-heading)] hover:bg-[var(--bg-card-hover)] transition-all"
          >
            {lang === "தமிழ்" ? "← ஆய்வக நிர்வாகத்திர்கு" : "← Back to Lab Manager"}
          </button>
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-full animate-pulse">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              LIVE SESSION
            </span>
            <button
              onClick={() => endSession(activeExp.id)}
              className="py-2 px-4 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white text-xs transition-all shadow-md"
            >
              {lang === "தமிழ்" ? "அமர்வை முடி" : "End Session"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Simulation Panel */}
          <div className="lg:col-span-2 theme-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[var(--text-heading)]"><FlaskConical className="w-4 h-4 inline-block mr-1 text-inherit" /> Titration Simulation (Teacher Console)</h2>
                <button
                  onClick={() => {
                    setNaohVolume(0);
                    setIsFlowing(false);
                  }}
                  className="px-3 py-1 border border-[var(--border)] rounded-lg text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                >
                  Reset Simulator
                </button>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-6">
                Interact with the burette control below to add NaOH solution into the beaker containing HCl. Phenolphthalein will indicate the endpoint (neutralization) at pH 7-8.
              </p>
            </div>

            {/* Visualizer Frame */}
            <div className="bg-slate-900/10 dark:bg-slate-900/30 border border-[var(--border)] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-around gap-8 min-h-[340px]">
              {/* Burette Graphic */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Burette (NaOH)</span>
                <div className="w-[24px] h-[220px] bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-t-full relative shadow-inner flex items-end">
                  {/* Markings */}
                  <div className="absolute inset-0 flex flex-col justify-between p-1 select-none pointer-events-none opacity-40">
                    <span className="text-[8px] text-slate-500 font-mono">0ml</span>
                    <span className="text-[8px] text-slate-500 font-mono">5ml</span>
                    <span className="text-[8px] text-slate-500 font-mono">10ml</span>
                    <span className="text-[8px] text-slate-500 font-mono">15ml</span>
                    <span className="text-[8px] text-slate-500 font-mono">20ml</span>
                    <span className="text-[8px] text-slate-500 font-mono">25ml</span>
                  </div>
                  {/* Liquid fill */}
                  <div
                    className="w-full bg-cyan-400/40 rounded-b-md transition-all duration-300"
                    style={{ height: `${((25 - naohVolume) / 25) * 100}%` }}
                  />
                  {/* Liquid flow stream when flowing */}
                  {isFlowing && (
                    <div className="absolute -bottom-[65px] left-1/2 -translate-x-1/2 w-[2px] h-[70px] bg-cyan-400/30 animate-pulse" />
                  )}
                </div>
                <span className="text-xs font-bold text-[var(--text-heading)]">{naohVolume.toFixed(2)} / 25.0 mL</span>
              </div>

              {/* Stopcock Controls */}
              <div className="flex flex-col gap-3 max-w-[180px] w-full">
                <button
                  onClick={() => setNaohVolume((v) => Math.min(25, parseFloat((v + 0.1).toFixed(2))))}
                  disabled={naohVolume >= 25}
                  className="w-full py-2 bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--text-heading)] transition-all"
                >
                  + Add 0.1 mL (Drop)
                </button>
                <button
                  onClick={() => setNaohVolume((v) => Math.min(25, parseFloat((v + 1.0).toFixed(2))))}
                  disabled={naohVolume >= 25}
                  className="w-full py-2 bg-[var(--bg-main)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--text-heading)] transition-all"
                >
                  + Add 1.0 mL (Fast)
                </button>
                <button
                  onClick={() => setIsFlowing(!isFlowing)}
                  disabled={naohVolume >= 25}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isFlowing
                      ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  {isFlowing ? " Stop Flow" : "▶ Start Constant Flow"}
                </button>
              </div>

              {/* Beaker Graphic */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Beaker (HCl)</span>
                <div className="w-[110px] h-[130px] border-2 border-t-0 border-slate-300 dark:border-slate-700 rounded-b-2xl relative shadow-md flex items-end overflow-hidden">
                  {/* Markings */}
                  <div className="absolute inset-y-0 left-2 flex flex-col justify-between py-4 select-none pointer-events-none opacity-30">
                    <div className="w-2 border-t border-slate-500"></div>
                    <div className="w-2 border-t border-slate-500"></div>
                    <div className="w-2 border-t border-slate-500"></div>
                  </div>
                  {/* Solution liquid */}
                  <div
                    className="w-full rounded-b-xl transition-colors duration-500"
                    style={{
                      height: `${45 + (naohVolume / 25) * 25}%`,
                      backgroundColor: solutionColor,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-[var(--text-heading)]">{(50 + naohVolume).toFixed(1)} mL Total</span>
              </div>
            </div>

            {/* Readout Panels */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-[var(--border)]">
              <div>
                <span className="block text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Indicator</span>
                <span className="text-xs font-bold text-[var(--text-heading)]">Phenolphthalein</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Solution pH</span>
                <span className={`text-xs font-black ${currentPh >= 6.8 && currentPh <= 7.5 ? "text-emerald-500" : currentPh > 7.5 ? "text-pink-500" : "text-amber-500"}`}>{currentPh.toFixed(2)}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Liquid State</span>
                <span className="text-xs font-bold text-[var(--text-heading)]">{phDesc}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Endpoint Volume</span>
                <span className="text-xs font-bold text-[var(--text-heading)]">~20.0 mL NaOH</span>
              </div>
            </div>
          </div>

          {/* Roster & Live Students */}
          <div className="glass rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <h3 className="font-bold text-white text-base"><Users className="w-4 h-4 inline-block mr-1 text-inherit" /> Student Workspace Monitor</h3>
                <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full self-start sm:self-auto">
                  {liveStudents.length} Online
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Live feedback showing individual student laboratory simulation progress from their respective portals.
              </p>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {liveStudents.map((student) => (
                  <div key={student.id} className="bg-slate-900/40 p-3 rounded-xl border border-slate-800 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{student.name}</span>
                      <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${
                        student.progressVal === 100
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/25"
                      }`}>
                        {student.statusText}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          student.progressVal === 100 ? "bg-emerald-500" : "bg-indigo-500"
                        }`}
                        style={{ width: `${student.progressVal}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl mt-4">
              <span className="block text-[10px] uppercase font-bold text-red-400 mb-1"><AlertTriangle className="w-4 h-4 inline mr-1 text-amber-500" /> Safety Meter</span>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-[96%]" />
                </div>
                <span className="text-xs font-bold text-emerald-400">96% Safe</span>
              </div>
            </div>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title={lang === "தமிழ்" ? "அறிவியல் ஆய்வகம் நிர்வாகம்" : "Science Labs Manager"} subtitle={lang === "தமிழ்" ? "ஆய்வு முறைகள், ஆய்வக கைெயடுப்புகள் மற்றும் பாதுகாப்பு இணக்கம் நிர்வகி" : "Manage experimental sessions, lab manuals, and safety compliance."}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Lab Sessions */}
        <div className="lg:col-span-2 theme-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h2 className="text-base font-semibold text-[var(--text-heading)]"><FlaskConical className="w-4 h-4 inline-block mr-1 text-inherit" /> {lang === "தமிழ்" ? "ஆய்வக முறைகள்" : "Experimental Lab Sessions"}</h2>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-[var(--portal-color,var(--primary))] hover:brightness-95 text-white py-1.5 px-3 text-[11px] font-bold rounded-lg shadow-sm transition-all active:scale-95 inline-flex items-center justify-center whitespace-nowrap"
              >
                {showAddForm ? (lang === "தமிழ்" ? "ரத்து" : "Cancel") : (lang === "தமிழ்" ? "+ ஆய்வகம் திட்டமிடு" : "+ Schedule Lab")}
              </button>
              <span className="text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-main)] px-2.5 py-1 rounded-full whitespace-nowrap">
                Active: {experiments.filter((e) => e.status === "active").length}
              </span>
            </div>
          </div>

          {showAddForm && (
            <form onSubmit={handleCreateLab} className="mb-6 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] space-y-3">
              <h3 className="text-xs font-bold text-[var(--text-heading)] uppercase">{lang === "தமிழ்" ? "புதிய ஆய்வக முறை விவரங்கள்" : "New Lab Session Details"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Experiment Name"
                  value={newLabName}
                  onChange={(e) => setNewLabName(e.target.value)}
                  className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-2 text-xs text-[var(--text-heading)] outline-none"
                  required
                />
                <select
                  value={newLabClass}
                  onChange={(e) => setNewLabClass(e.target.value)}
                  className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-2 text-xs text-[var(--text-heading)] outline-none"
                >
                  {teacherClasses.length > 0 ? (
                    teacherClasses.map((cls) => (
                      <option key={cls.id} value={`Class ${cls.className}${cls.section}`}>
                        Class {cls.className}{cls.section}
                      </option>
                    ))
                  ) : (
                    <option value="">No Classes Assigned</option>
                  )}
                </select>
                <input
                  type="text"
                  placeholder="e.g. June 25, 2026, 11:30 AM"
                  value={newLabDate}
                  onChange={(e) => setNewLabDate(e.target.value)}
                  className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-2 text-xs text-[var(--text-heading)] outline-none"
                  required
                />
              </div>
              <button type="submit" className="bg-[var(--portal-color,var(--primary))] hover:brightness-95 text-white py-1.5 px-4 text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95 inline-flex items-center justify-center">
                Schedule Session
              </button>
            </form>
          )}

          {loading ? (
            <div className="text-center py-8 text-xs text-[var(--text-muted)]">                Loading lab sessions...</div>
          ) : experiments.length === 0 ? (
            <div className="text-center py-8 text-xs text-[var(--text-muted)]">{lang === "தமிழ்" ? "ஆய்வக முறைகள் எதுவும் திட்டமிடப்படவில்லை." : "No experimental sessions scheduled."}</div>
          ) : (
            <div className="space-y-4">
              {experiments.map((exp) => (
                <div
                  key={exp.id}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 hover-lift ${
                    exp.status === "active"
                      ? "bg-[var(--bg-card)] border-[var(--primary)] shadow-[0_4px_20px_rgba(79,70,229,0.15)] dark:shadow-[0_4px_20px_rgba(129,140,248,0.15)]"
                      : "bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--primary)]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        exp.status === "active"
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                          : exp.status === "completed"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-slate-50 text-slate-500 dark:bg-slate-500/10 dark:text-slate-400"
                      }`}
                    >
                      {exp.status === "active" ? "" : exp.status === "completed" ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : ""}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-[var(--text-heading)]">{exp.name}</span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                            exp.status === "active"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400"
                              : exp.status === "scheduled"
                              ? "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400"
                              : "bg-slate-50 text-slate-500 border border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/20 dark:text-slate-400"
                          }`}
                        >
                          {exp.status}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-main)]">
                        Target: <strong className="text-[var(--text-heading)]">{exp.classSection}</strong> · Scheduled: <span>{exp.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleSafety(exp.id, exp.safetyCheck)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 border transition-all ${
                        exp.safetyCheck
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                          : "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${exp.safetyCheck ? "bg-emerald-500" : "bg-red-500 animate-pulse"}`}></span>
                      {exp.safetyCheck ? "Safety Approved" : "Safety Unverified"}
                    </button>
                    {exp.status === "scheduled" && (
                      <button
                        onClick={() => startSession(exp)}
                        className="bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-slate-950 py-1.5 px-4 text-[11px] font-bold rounded-lg shadow-sm transition-all inline-flex items-center justify-center whitespace-nowrap"
                      >
                        Start Session
                      </button>
                    )}
                    {exp.status === "active" && (
                      <button
                        onClick={() => setActiveExp(exp)}
                        className="py-1.5 text-[11px] px-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-none"
                      >
                        View Session
                      </button>
                    )}
                    {exp.status === "completed" && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                        <Check className="w-4 h-4 inline-block mr-1 text-inherit" /> Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Manual Creator */}
        <div className="glass rounded-2xl p-6 border border-slate-800">
          <h2 className="text-base font-semibold text-white mb-4"><Bot className="w-4 h-4 inline mr-1 text-blue-500" /> AI Lab Manual Builder</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Experiment Topic</label>
              <input
                type="text"
                value={labTopic}
                onChange={(e) => setLabTopic(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="e.g. Acid Rain effects on Limestone"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Target Grade</label>
              <select
                value={labGrade}
                onChange={(e) => setLabGrade(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="6">Grade 6 - Basic Science</option>
                <option value="8">Grade 8 - Middle School Chemistry/Biology</option>
                <option value="9">Grade 9 - High School Biology</option>
                <option value="10">Grade 10 - Matriculation Science</option>
                <option value="12">Grade 12 - Higher Secondary Physics/Chemistry</option>
              </select>
            </div>

            <button
              onClick={handleGenerateManual}
              disabled={isGenerating}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? "Compiling Lab Blueprint..." : " Generate Lab Manual"}
            </button>
          </div>

          {/* Generator Steps Loading Screen */}
          {isGenerating && (
            <div className="mt-5 p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-amber-500/25 border-t-amber-500 rounded-full animate-spin" />
                <span className="text-xs text-slate-300 font-semibold">AI Assistant working...</span>
              </div>
              <div className="text-[10px] space-y-1.5">
                <div className={generationStep >= 1 ? "text-emerald-400" : "text-slate-500"}><Check className="w-4 h-4 inline-block mr-1 text-inherit" /> Verifying Tamil Nadu Science Syllabus guidelines...</div>
                <div className={generationStep >= 2 ? "text-emerald-400" : "text-slate-500"}>
                  {generationStep >= 2 ? " Drafting detailed safety manual and procedure..." : "· Drafting detailed safety manual and procedure..."}
                </div>
                <div className={generationStep >= 3 ? "text-emerald-400" : "text-slate-500"}>
                  {generationStep >= 3 ? " Formulating quiz and observations table..." : "· Formulating quiz and observations table..."}
                </div>
              </div>
            </div>
          )}

          {/* Generated Result display */}
          {generatedManual && !isGenerating && (
            <div className="mt-5 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-3 max-h-[300px] overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">Manual Generated Successfully</span>
                <span className="text-[10px] text-slate-500">AI Blueprint</span>
              </div>
              <h3 className="text-sm font-bold text-white">{generatedManual.title}</h3>
              <div>
                <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-1">Objective:</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{generatedManual.objective}</p>
              </div>
              <div>
                <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-1">Required Materials:</h4>
                <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1">
                  {generatedManual.apparatus.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-1">Procedure:</h4>
                <ol className="list-decimal pl-4 text-xs text-slate-300 space-y-1">
                  {generatedManual.steps.map((step: string, i: number) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
              <div className="p-2 bg-red-950/20 border border-red-500/20 rounded-lg">
                <h4 className="text-[10px] uppercase font-bold text-red-400 mb-0.5"><AlertTriangle className="w-4 h-4 inline mr-1 text-amber-500" /> Safety Precaution:</h4>
                <p className="text-[10.5px] text-red-300/80 leading-relaxed">{generatedManual.safety}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lab Roster & Grading */}
      <div className="glass rounded-2xl p-6 border border-slate-800">
        <h2 className="text-base font-semibold text-white mb-5"><User className="w-4 h-4 inline-block mr-1 text-inherit" /><Star className="w-4 h-4 inline-block mr-1 text-inherit" /><Microscope className="w-4 h-4 inline-block mr-1 text-inherit" /> Student Lab Roster & Grades</h2>
        {studentGrades.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">No students found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Lab Conduct</th>
                  <th>Report Status</th>
                  <th>Current Grade</th>
                  <th>Assign Grade</th>
                </tr>
              </thead>
              <tbody>
                {studentGrades.map((student) => (
                  <tr key={student.id}>
                    <td className="font-medium text-white">{student.name}</td>
                    <td>
                      <span
                        className={`badge ${
                          student.conduct === "Excellent"
                            ? "badge-green"
                            : student.conduct === "Good"
                            ? "badge-blue"
                            : "badge-yellow"
                        }`}
                      >
                        {student.conduct}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          student.reportStatus === "Submitted"
                            ? "badge-green"
                            : student.reportStatus === "Pending"
                            ? "badge-yellow"
                            : "badge-red"
                        }`}
                      >
                        {student.reportStatus}
                      </span>
                    </td>
                    <td className="text-white font-semibold">{student.grade}</td>
                    <td>
                      <select
                        value={student.grade}
                        onChange={(e) => handleGradeChange(student.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                      >
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="F">F</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
