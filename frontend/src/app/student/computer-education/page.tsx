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
  Zap,
  Play,
  RotateCcw,
  Database
} from "lucide-react";

type ComputerModule = {
  id: string;
  title: string;
  moduleType: string;
  description: string;
  gradeLevel: string;
  schoolId: string;
};

// Safe tailwind color mapping to prevent Next/Tailwind purge issues
const getStyleClasses = (color: string) => {
  switch (color) {
    case "blue":
      return { bgLight: "bg-blue-50 dark:bg-blue-900/10", bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800", fill: "bg-blue-500" };
    case "emerald":
      return { bgLight: "bg-emerald-50 dark:bg-emerald-900/10", bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800", fill: "bg-emerald-500" };
    case "purple":
      return { bgLight: "bg-purple-50 dark:bg-purple-900/10", bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800", fill: "bg-purple-500" };
    case "amber":
      return { bgLight: "bg-amber-50 dark:bg-amber-900/10", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800", fill: "bg-amber-500" };
    case "indigo":
      return { bgLight: "bg-indigo-50 dark:bg-indigo-900/10", bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-800", fill: "bg-indigo-500" };
    case "rose":
      return { bgLight: "bg-rose-50 dark:bg-rose-900/10", bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-600 dark:text-rose-400", border: "border-rose-200 dark:border-rose-800", fill: "bg-rose-500" };
    default:
      return { bgLight: "bg-slate-50 dark:bg-slate-900/10", bg: "bg-slate-100 dark:bg-slate-900/30", text: "text-slate-600 dark:text-slate-400", border: "border-slate-200 dark:border-slate-800", fill: "bg-slate-500" };
  }
};

export default function ComputerEducationPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [modules, setModules] = useState<ComputerModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  // Middle School Playground State
  const [spriteX, setSpriteX] = useState(50);
  const [spriteY, setSpriteY] = useState(50);
  const [spriteRotation, setSpriteRotation] = useState(0);
  const [spriteSpeech, setSpriteSpeech] = useState("Hi coding student!");

  // High School Sandbox State
  const [htmlInput, setHtmlInput] = useState(`<button style="background: linear-gradient(135deg, #6366f1, #a855f7); color: white; padding: 12px 24px; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; transition: transform 0.2s;" onclick="alert('Nice click!')">Click Me!</button>`);
  const [htmlPreview, setHtmlPreview] = useState("");

  // Higher Secondary SQL State
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM Computers WHERE status = 'Active';");
  const [sqlResult, setSqlResult] = useState<any[]>([]);

  // Typing Speed Challenge state
  const [showTypingModal, setShowTypingModal] = useState(false);
  const [typingSentence, setTypingSentence] = useState("");
  const [typingInput, setTypingInput] = useState("");
  const [typingStart, setTypingStart] = useState<number | null>(null);
  const [typingWpm, setTypingWpm] = useState(0);
  const [typingAccuracy, setTypingAccuracy] = useState(100);
  const [typingFinished, setTypingFinished] = useState(false);

  // Scratch Guide state
  const [showScratchModal, setShowScratchModal] = useState(false);

  // Open Typing Modal with random coding prompt
  const startTypingChallenge = () => {
    const sentences = [
      "computers are machines that process instructions using binary code.",
      "scratch uses colored blocks of code to build beautiful interactive stories.",
      "loops help us repeat actions without typing them over and over.",
      "variables are named boxes that hold information we want to use later.",
      "always practice safe browsing and never share your passwords with strangers.",
      "algorithms are step by step procedures used to solve problems or perform calculations.",
      "html creates the structure of a webpage while css makes it look styled and beautiful.",
      "javascript is a dynamic programming language that makes web pages interactive and lively.",
      "python is known for its simple readability, making it great for beginners and ai developers.",
      "cyber security protects our computers, networks, and data from unauthorized access.",
      "a database organizes and stores large amounts of information so we can search it quickly.",
      "the internet connects millions of computers worldwide, allowing us to share knowledge instantly.",
      "debugging is the process of finding and fixing errors or bugs in your code.",
      "cloud computing lets us store files and run programs on servers over the internet.",
      "open source software allows anyone to view, modify, and share its source code freely.",
      "artificial intelligence trains computers to think, learn, and make decisions like humans.",
      "compilers translate high level programming code into machine language that computers run.",
      "always lock your computer when you walk away to keep your personal files safe."
    ];
    const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
    setTypingSentence(randomSentence);
    setTypingInput("");
    setTypingStart(null);
    setTypingWpm(0);
    setTypingAccuracy(100);
    setTypingFinished(false);
    setShowTypingModal(true);
  };

  // Evaluate typed characters live
  const handleTypingChange = (val: string) => {
    if (typingFinished) return;
    if (!typingStart) {
      setTypingStart(Date.now());
    }
    
    setTypingInput(val);

    let correctChars = 0;
    const compareLength = Math.min(val.length, typingSentence.length);
    for (let i = 0; i < compareLength; i++) {
      if (val[i] === typingSentence[i]) {
        correctChars++;
      }
    }
    const acc = val.length > 0 ? Math.round((correctChars / val.length) * 100) : 100;
    setTypingAccuracy(acc);

    if (val === typingSentence) {
      setTypingFinished(true);
      const timeElapsed = (Date.now() - (typingStart || Date.now())) / 1000 / 60; // elapsed minutes
      const wordCount = typingSentence.split(" ").length;
      const wpmVal = Math.round(wordCount / (timeElapsed || 0.01));
      setTypingWpm(wpmVal);
      
      if (acc >= 90 && wpmVal >= 25) {
        Swal.fire({
          title: "🎉 Typing Master!",
          text: `You completed the challenge with ${wpmVal} WPM and ${acc}% Accuracy! You've earned a Typing Sticker! 🏆`,
          icon: "success"
        });
      } else {
        Swal.fire({
          title: "So close!",
          text: `Speed: ${wpmVal} WPM, Accuracy: ${acc}%. Target: 25 WPM, 90% Accuracy. Keep practicing! ⌨️`,
          icon: "info"
        });
      }
    }
  };

  // Execute Scratch block instructions on the playground canvas stage
  const executeGuideBlock = (command: string) => {
    if (command === "Move 15 steps") {
      const rad = (spriteRotation * Math.PI) / 180;
      setSpriteX(prev => Math.min(Math.max(prev + Math.cos(rad) * 15, 0), 100));
      setSpriteY(prev => Math.min(Math.max(prev + Math.sin(rad) * 15, 0), 100));
    } else if (command === "Turn Right 45°") {
      setSpriteRotation(prev => (prev + 45) % 360);
    } else if (command === "Turn Left 45°") {
      setSpriteRotation(prev => (prev - 45 + 360) % 360);
    } else if (command === "Say 'Hello!'") {
      setSpriteSpeech("Hello!");
    } else if (command === "Say 'Scratch is fun!'") {
      setSpriteSpeech("Scratch is fun!");
    } else if (command === "Clear Bubble") {
      setSpriteSpeech("");
    } else if (command === "Center Sprite") {
      setSpriteX(50);
      setSpriteY(50);
    } else if (command === "Jump to Top Right") {
      setSpriteX(80);
      setSpriteY(20);
    }

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Block run: ${command}`,
      showConfirmButton: false,
      timer: 1500
    });
  };

  // Update HTML Preview
  useEffect(() => {
    setHtmlPreview(htmlInput);
  }, [htmlInput]);

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

  // Fetch student profile using robust fallback logic
  useEffect(() => {
    async function fetchStudentProfile() {
      if (!session?.user) return;
      try {
        let foundStudent: any = null;
        const studentId = (session.user as any).studentId;
        const userId = (session.user as any).id;

        if (studentId) {
          const res = await fetch(`${API_URL}/api/students`);
          const json = await res.json();
          if (json.success) {
            foundStudent = json.data.find((s: any) => s.id === studentId);
          }
        }
        if (!foundStudent && userId) {
          const res = await fetch(`${API_URL}/api/students?userId=${userId}`);
          const json = await res.json();
          if (json.success && json.data && json.data.length > 0) {
            foundStudent = json.data[0];
          }
        }
        if (!foundStudent && session.user.email) {
          const rollNumber = session.user.email.split("@")[0];
          if (rollNumber) {
            const res = await fetch(`${API_URL}/api/students?schoolId=${(session.user as any).schoolId}`);
            const json = await res.json();
            if (json.success && json.data) {
              foundStudent = json.data.find(
                (s: any) => s.rollNumber?.toLowerCase() === rollNumber.toLowerCase()
              );
            }
          }
        }
        if (!foundStudent) {
          const res = await fetch(`${API_URL}/api/students`);
          const json = await res.json();
          if (json.success && json.data.length > 0) {
            foundStudent = json.data[0];
          }
        }
        if (foundStudent) {
          setStudentProfile(foundStudent);
        }
      } catch (err) {
        console.error("Failed to fetch student profile", err);
      }
    }
    fetchStudentProfile();
  }, [session, API_URL]);

  // Class ID based Filtering
  const classMatch = studentProfile?.class?.match(/\d+/);
  const classNum = classMatch ? parseInt(classMatch[0], 10) : 7; // Default to Grade 7

  let gradeBand: "middle" | "high" | "higher" = "middle";
  let gradeBandLabel = "Middle School (Grades 6-8)";
  let heroTitle = "Welcome to Scratch Coding Castle! 🏰";
  let heroDesc = "Let's learn logic using visual puzzle blocks. Drag blocks, move the kitty, and code your first adventure game!";

  if (classNum >= 9 && classNum <= 10) {
    gradeBand = "high";
    gradeBandLabel = "High School (Grades 9-10)";
    heroTitle = "Welcome to Python & Web Lab! 🐍";
    heroDesc = "Write real Python scripts, design your own beautiful HTML web pages, and explore how websites are built!";
  } else if (classNum >= 11) {
    gradeBand = "higher";
    gradeBandLabel = "Higher Secondary (Grades 11-12)";
    heroTitle = "Welcome to Advanced Dev & Databases! 🚀";
    heroDesc = "Master Data Structures, build robust databases using SQL, and write high-performance Javascript or C++ programs.";
  }

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

    const progress = Math.floor(Math.random() * 61) + 20; // Mock progress 20-80%
    const students = Math.floor(Math.random() * 21) + 15; // 15-35

    return { icon, color, progress, students };
  };

  const filteredModules = modules.filter((mod) => {
    const gl = mod.gradeLevel.toLowerCase();
    if (gradeBand === "middle") {
      return gl === "middle" || gl === "primary" || gl === "all grades" || gl === "basics";
    } else if (gradeBand === "high") {
      return gl === "high" || gl === "middle" || gl === "all grades";
    } else {
      // Higher secondary sees everything
      return true;
    }
  });

  // Execute Mock SQL Queries
  const runSQLQuery = () => {
    const clean = sqlQuery.trim().toLowerCase();
    const computersMock = [
      { id: 1, name: "System-A", status: "Active", OS: "Ubuntu 22.04" },
      { id: 2, name: "System-B", status: "Active", OS: "Windows 11" },
      { id: 3, name: "System-C", status: "Under Maintenance", OS: "Ubuntu 22.04" },
    ];
    const softwareMock = [
      { id: 1, name: "VS Code", type: "IDE", license: "FOSS" },
      { id: 2, name: "Scratch Offline", type: "Visual Coding", license: "FOSS" },
      { id: 3, name: "Python 3.10", type: "Runtime", license: "FOSS" },
    ];

    if (clean.includes("from computers")) {
      if (clean.includes("where status = 'active'") || clean.includes("where status='active'")) {
        setSqlResult(computersMock.filter(c => c.status === "Active"));
      } else {
        setSqlResult(computersMock);
      }
    } else if (clean.includes("from software")) {
      setSqlResult(softwareMock);
    } else {
      Swal.fire({
        title: "SQL Error",
        text: "Please query either 'Computers' or 'Software' tables (e.g. SELECT * FROM Computers;)",
        icon: "error"
      });
    }
  };

  // Run SQL on mount once
  useEffect(() => {
    if (gradeBand === "higher") {
      runSQLQuery();
    }
  }, [gradeBand]);

  return (
    <PortalLayout
      title="Computer Lab! 💻"
      subtitle={`Code, Play, and Learn Technology! · Class Level: ${gradeBandLabel}`}
    >
      <div className="flex flex-col gap-8 text-left">

        {/* Playful Hero */}
        <div className="relative rounded-[3rem] overflow-hidden shadow-xl bg-white dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-700 min-h-[250px] flex flex-col justify-end p-8 sm:p-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 z-0"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-50 dark:bg-sky-900/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 z-0"></div>

          <div className="absolute top-10 right-10 rotate-12 opacity-80 z-10">
            <Zap className="w-32 h-32 text-indigo-50 dark:text-slate-700/50" />
          </div>

          <div className="relative z-20 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-4 py-2 mb-4 font-black tracking-widest text-xs uppercase rounded-2xl shadow-sm rotate-[-2deg] border-2 border-indigo-200 dark:border-indigo-700/50">
              <Code2 className="w-4 h-4" /> Coding is Magic!
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white mb-4 tracking-tight drop-shadow-sm font-mono">{heroTitle}</h2>
            <p className="text-slate-600 dark:text-slate-350 font-bold mb-4 text-sm md:text-base leading-relaxed">
              {heroDesc}
            </p>
          </div>
        </div>

        {/* Grade Band Specific Live Playgrounds */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border-4 border-indigo-150 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-3xl rounded-bl-full pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg">
              {gradeBand === "middle" ? <Gamepad2 className="w-6 h-6 animate-bounce" /> : gradeBand === "high" ? <Code2 className="w-6 h-6" /> : <Database className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono">Interactive Laboratory</h3>
              <p className="text-xs text-slate-400">Test concepts with our live in-browser coding playground sandbox!</p>
            </div>
          </div>

          {/* Middle School Sandbox: Scratch Sprite Loop Simulator */}
          {gradeBand === "middle" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-black dark:text-white mb-3">🐱 Sprite Command Blocks</h4>
                  <p className="text-xs text-slate-500 mb-4">Click the blocks to execute code commands and move the scratch kitty sprite!</p>
                  
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        const rad = (spriteRotation * Math.PI) / 180;
                        setSpriteX(prev => Math.min(Math.max(prev + Math.cos(rad) * 15, 0), 100));
                        setSpriteY(prev => Math.min(Math.max(prev + Math.sin(rad) * 15, 0), 100));
                      }} 
                      className="w-full text-left bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between shadow-sm"
                    >
                      <span>🔵 Move 10 Steps</span>
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    
                    <button 
                      onClick={() => setSpriteRotation(prev => (prev + 15) % 360)} 
                      className="w-full text-left bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between shadow-sm"
                    >
                      <span>🔄 Turn Right 15 Degrees</span>
                      <Play className="w-3.5 h-3.5" />
                    </button>

                    <button 
                      onClick={() => {
                        const msgs = ["Coding is easy!", "Hello World!", "Scratch Rocks!", "Meow! 🐾"];
                        setSpriteSpeech(msgs[Math.floor(Math.random() * msgs.length)]);
                      }} 
                      className="w-full text-left bg-purple-500 hover:bg-purple-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between shadow-sm"
                    >
                      <span>💬 Say Random Greeting</span>
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setSpriteX(50);
                    setSpriteY(50);
                    setSpriteRotation(0);
                    setSpriteSpeech("Hi coding student!");
                  }} 
                  className="mt-6 flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-black dark:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Playground
                </button>
              </div>

              {/* Output Frame */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[220px] flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>Sprite Stage Window</span>
                  <span>x: {Math.round(spriteX - 50)} y: {Math.round(50 - spriteY)} dir: {spriteRotation}°</span>
                </div>

                {/* Kitty Stage */}
                <div className="relative flex-1 flex items-center justify-center">
                  <div 
                    className="absolute transition-all duration-300 ease-out flex flex-col items-center"
                    style={{
                      left: `${spriteX}%`,
                      top: `${spriteY}%`,
                      transform: `translate(-50%, -50%) rotate(${spriteRotation}deg)`
                    }}
                  >
                    {/* Speech bubble */}
                    <div className="bg-white text-slate-900 border-2 border-indigo-400 px-3 py-1.5 rounded-2xl text-[10px] font-black absolute bottom-12 whitespace-nowrap rotate-[0deg] shadow-lg animate-pulse-subtle">
                      {spriteSpeech}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-indigo-400 rotate-45"></div>
                    </div>
                    
                    <span className="text-4xl select-none">🐱</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* High School Sandbox: Live HTML/CSS Editor */}
          {gradeBand === "high" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-black dark:text-white">✍️ Edit HTML & CSS:</h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setHtmlInput(`<button style="background: red; color: white; border: none; border-radius: 8px; padding: 10px; font-weight: bold;">Red Alert Button</button>`)} 
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-black dark:text-white px-2 py-1 rounded"
                    >
                      Red Button
                    </button>
                    <button 
                      onClick={() => setHtmlInput(`<div style="padding: 16px; border-left: 5px solid #10b981; background: #e6f7f0; color: #065f46; border-radius: 8px;"><strong>Success Notice</strong><p style="margin: 4px 0 0 0; font-size:12px;">Welfare scheme active!</p></div>`)} 
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-black dark:text-white px-2 py-1 rounded"
                    >
                      Alert Card
                    </button>
                  </div>
                </div>
                <textarea
                  value={htmlInput}
                  onChange={(e) => setHtmlInput(e.target.value)}
                  className="w-full h-44 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500 resize-none shadow-inner"
                ></textarea>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="font-bold text-sm text-black dark:text-white">👁️ Live Render Frame:</h4>
                <div className="w-full h-44 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-750 rounded-2xl p-4 flex items-center justify-center overflow-auto">
                  <div dangerouslySetInnerHTML={{ __html: htmlPreview }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Higher Secondary Sandbox: SQL Compiler database runner */}
          {gradeBand === "higher" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="font-bold text-sm text-black dark:text-white mb-2">📋 Enter SQL Query:</h4>
                  <div className="flex gap-2 mb-2">
                    <button 
                      onClick={() => setSqlQuery("SELECT * FROM Computers WHERE status = 'Active';")} 
                      className="text-[10px] bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-850"
                    >
                      Query active computers
                    </button>
                    <button 
                      onClick={() => setSqlQuery("SELECT * FROM Software;")} 
                      className="text-[10px] bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-850"
                    >
                      List lab softwares
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    className="flex-1 bg-slate-900 text-emerald-400 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    onClick={runSQLQuery}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shrink-0 flex items-center gap-1.5 shadow-lg shadow-indigo-600/35 transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5" /> Execute
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-black dark:text-white mb-2">📊 Query Result Data Table:</h4>
                <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-xl overflow-x-auto text-[11px] font-mono h-36">
                  {sqlResult.length > 0 ? (
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-800 border-b border-slate-750 text-slate-400">
                          {Object.keys(sqlResult[0]).map((key) => (
                            <th key={key} className="px-3 py-2">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sqlResult.map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-800 hover:bg-slate-850">
                            {Object.values(row).map((val: any, cellIdx) => (
                              <td key={cellIdx} className="px-3 py-2">{val}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 italic">No query output results.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Main Content Area: Recommended Modules */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border-4 border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl rotate-[-5deg]">
                    <Terminal className="w-6 h-6" />
                  </div>
                  Recommended Path Modules
                </h3>
              </div>

              <div className="space-y-6">
                {loading ? (
                  <div className="text-center py-10 font-bold text-slate-500">Loading modules... ⏳</div>
                ) : filteredModules.length === 0 ? (
                  <div className="text-center py-10 font-bold text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-3xl border-4 border-dashed border-slate-200 dark:border-slate-700">No modules matching your grade level yet! 🚀</div>
                ) : filteredModules.map((mod, i) => {
                  const { icon, color, progress, students } = getModuleStyle(mod.title, i);
                  const styles = getStyleClasses(color);
                  return (
                    <div key={mod.id} className="p-6 rounded-[2rem] border-4 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 hover:-translate-y-1 hover:shadow-lg transition-all group relative">

                      <div className="flex items-center gap-6 mb-6">
                        <div className={`w-14 h-14 rounded-2xl ${styles.bg} ${styles.text} flex items-center justify-center shadow-inner shrink-0`}>
                          {React.cloneElement(icon as React.ReactElement, { className: "w-7 h-7" })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono truncate">{mod.title}</h4>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">{mod.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded-md ${styles.bg} ${styles.text} text-xs font-bold`}>{students} Students</span>
                            <span className={`px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase`}>{mod.gradeLevel}</span>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3 sm:block">
                          <span className={`text-2xl font-black ${styles.text} drop-shadow-sm`}>{progress}%</span>
                        </div>
                      </div>

                      {/* Playful Progress Bar */}
                      <div className="w-full h-4 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-inner border-2 border-slate-350 dark:border-slate-600 relative">
                        <div
                          className={`absolute top-0 left-0 h-full ${styles.fill} rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${progress}%` }}
                        >
                          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]"></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Resources & Stickers */}
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
                {gradeBand === "middle" ? (
                  <>
                    <button onClick={startTypingChallenge} className="w-full text-left p-4 rounded-2xl border-4 border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-slate-650 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all text-sm font-black text-slate-700 dark:text-slate-200 flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-100 text-slate-400 group-hover:text-emerald-500 transition-colors">⌨️</div>
                      Typing Speed Challenge
                    </button>
                    <button onClick={() => setShowScratchModal(true)} className="w-full text-left p-4 rounded-2xl border-4 border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-slate-650 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all text-sm font-black text-slate-700 dark:text-slate-200 flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-100 text-slate-400 group-hover:text-emerald-500 transition-colors">🐱</div>
                      Scratch Blocks Guide
                    </button>
                  </>
                ) : gradeBand === "high" ? (
                  <>
                    <button onClick={() => Swal.fire({ title: 'HTML Layouts', text: 'Learn tags: <h1>, <p>, <a>, and CSS flexbox! 🌐', icon: 'info' })} className="w-full text-left p-4 rounded-2xl border-4 border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-slate-650 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all text-sm font-black text-slate-700 dark:text-slate-200 flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-100 text-slate-400 group-hover:text-emerald-500 transition-colors">🌐</div>
                      Web Development Cheat Sheet
                    </button>
                    <button onClick={() => Swal.fire({ title: 'Python Reference', text: 'Python Syntax Guide: Lists, Functions and Conditional Statements! 🐍', icon: 'info' })} className="w-full text-left p-4 rounded-2xl border-4 border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-slate-650 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all text-sm font-black text-slate-700 dark:text-slate-200 flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-100 text-slate-400 group-hover:text-emerald-500 transition-colors">🐍</div>
                      Python Syntax Cheat Sheet
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => Swal.fire({ title: 'SQL Guide', text: 'Learn SELECT, INSERT, JOIN, and database schemas! 🗄️', icon: 'info' })} className="w-full text-left p-4 rounded-2xl border-4 border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-slate-650 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all text-sm font-black text-slate-700 dark:text-slate-200 flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-100 text-slate-400 group-hover:text-emerald-500 transition-colors">🗄️</div>
                      SQL Schema Quick Guide
                    </button>
                    <button onClick={() => Swal.fire({ title: 'Data Structures', text: 'Learn Arrays, Stacks, Queues, Linked Lists and Big-O notation! 🧠', icon: 'info' })} className="w-full text-left p-4 rounded-2xl border-4 border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-slate-650 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all text-sm font-black text-slate-700 dark:text-slate-200 flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-100 text-slate-400 group-hover:text-emerald-500 transition-colors">🧠</div>
                      DSA Reference Map
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Typing Speed Challenge Modal */}
      {showTypingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-xl p-8 border-4 border-indigo-400 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowTypingModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-xl"
            >
              ✕
            </button>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-2 font-mono">
              ⌨️ Typing Speed Challenge
            </h3>
            <p className="text-xs text-slate-400 mb-6">Type the sentence below as quickly and accurately as you can. Finish typing to get results.</p>
            
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl mb-6 text-left relative font-mono text-sm leading-relaxed">
              {typingSentence.split("").map((char, index) => {
                let color = "text-slate-400 dark:text-slate-600";
                if (index < typingInput.length) {
                  color = typingInput[index] === char ? "text-emerald-500 font-bold" : "text-rose-500 font-bold underline";
                }
                return <span key={index} className={color}>{char}</span>;
              })}
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={typingInput}
                onChange={(e) => handleTypingChange(e.target.value)}
                placeholder="Type here..."
                disabled={typingFinished}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 font-mono text-black dark:text-white"
                autoFocus
              />

              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350">
                <span>Accuracy: <strong className={typingAccuracy < 90 ? "text-rose-500" : "text-emerald-500"}>{typingAccuracy}%</strong></span>
                {typingFinished && (
                  <span>Speed: <strong className="text-indigo-600 dark:text-indigo-400">{typingWpm} WPM</strong></span>
                )}
                <span>Target: 25 WPM, 90% Acc</span>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  onClick={startTypingChallenge}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 text-black dark:text-white font-bold px-5 py-2.5 rounded-xl text-xs border border-slate-250 dark:border-slate-705"
                >
                  Reset Challenge
                </button>
                <button 
                  onClick={() => setShowTypingModal(false)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scratch Blocks Guide Modal */}
      {showScratchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] w-full max-w-2xl p-8 border-4 border-emerald-400 shadow-2xl relative max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in duration-200 text-left">
            <button 
              onClick={() => setShowScratchModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-xl"
            >
              ✕
            </button>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-2 font-mono">
              🐱 Scratch Blocks Guide
            </h3>
            <p className="text-xs text-slate-400 mb-6">Click any coding block to run its command and see it execute live on the playground sprite stage above!</p>

            <div className="space-y-6">
              {[
                {
                  name: "🔵 Motion Blocks",
                  desc: "Position, rotate, and navigate your character.",
                  blocks: [
                    { name: "Move 15 steps", cmd: "Move 15 steps" },
                    { name: "Turn Right 45°", cmd: "Turn Right 45°" },
                    { name: "Turn Left 45°", cmd: "Turn Left 45°" }
                  ]
                },
                {
                  name: "🔮 Looks Blocks",
                  desc: "Say things, change speech bubbles, and control graphics.",
                  blocks: [
                    { name: "Say 'Hello!'", cmd: "Say 'Hello!'" },
                    { name: "Say 'Scratch is fun!'", cmd: "Say 'Scratch is fun!'" },
                    { name: "Clear Bubble", cmd: "Clear Bubble" }
                  ]
                },
                {
                  name: "📍 Positioning Blocks",
                  desc: "Instantly warp to specific coordinates.",
                  blocks: [
                    { name: "Center Sprite", cmd: "Center Sprite" },
                    { name: "Jump to Top Right", cmd: "Jump to Top Right" }
                  ]
                }
              ].map((category, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-sm text-black dark:text-white mb-1">{category.name}</h4>
                  <p className="text-[10px] text-slate-500 mb-4">{category.desc}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {category.blocks.map((b, bIdx) => (
                      <button
                        key={bIdx}
                        onClick={() => {
                          executeGuideBlock(b.cmd);
                        }}
                        className="bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-750 hover:border-emerald-500 dark:hover:border-emerald-500 p-3 rounded-xl text-xs font-bold text-black dark:text-slate-200 flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
                      >
                        <span className="truncate">{b.name}</span>
                        <Play className="w-3 h-3 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-6">
              <button 
                onClick={() => setShowScratchModal(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
