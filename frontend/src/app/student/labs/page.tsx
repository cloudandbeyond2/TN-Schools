// "use client";

// import PortalLayout from "@/components/PortalLayout";
// import Link from "next/link";
// import { useState } from "react";

// const featuredLabs = [
//   { id: 1, title: "Ohm's Law Verification", subject: "Physics", duration: "25 mins", level: "Class 10", icon: "⚡", color: "from-blue-500 to-cyan-500", image: "circuit.png" },
//   { id: 2, title: "Acid-Base Titration", subject: "Chemistry", duration: "30 mins", level: "Class 11", icon: "🧪", color: "from-emerald-500 to-teal-500", image: "flask.png" },
//   { id: 3, title: "Human Heart Dissection (3D)", subject: "Biology", duration: "45 mins", level: "Class 12", icon: "🫀", color: "from-rose-500 to-pink-500", image: "heart.png" },
// ];

// const completedLabs = [
//   { title: "Photosynthesis Simulation", date: "June 15, 2026", score: "95%" },
//   { title: "Simple Pendulum", date: "June 10, 2026", score: "100%" },
// ];

// export default function VirtualLabsPage() {
//   const [activeCategory, setActiveCategory] = useState("All");

//   return (
//     <PortalLayout
//       title="Virtual Science Labs"
//       subtitle="Perform safe, interactive 3D experiments from anywhere."
//       avatarLetter="A"
//       avatarColor="#06b6d4"
//       themeClass="theme-student"
//       accentColor="#06b6d4"
//     >
//       <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-700/50 w-fit overflow-x-auto">
//            {["All", "Physics", "Chemistry", "Biology", "Computer Science"].map(cat => (
//              <button 
//                key={cat}
//                onClick={() => setActiveCategory(cat)}
//                className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${activeCategory === cat ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/20" : "text-slate-400 hover:text-white"}`}
//              >
//                {cat}
//              </button>
//            ))}
//         </div>
        
//         <button className="px-4 py-2 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
//            <span>🥽</span> Launch AR Mode
//         </button>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
//         {/* Left Column: Recommended & AR */}
//         <div className="lg:col-span-2 space-y-6">
           
//            <div className="glass rounded-3xl p-6 border border-slate-700/50">
//               <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
//                 <span className="text-2xl">✨</span> Recommended for You
//               </h2>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                  {featuredLabs.filter(lab => activeCategory === "All" || lab.subject === activeCategory).map((lab) => (
//                    <div key={lab.id} className="bg-slate-900/40 rounded-2xl border border-slate-700/50 overflow-hidden hover:-translate-y-1 hover:border-cyan-500/50 transition-all group flex flex-col cursor-pointer">
//                       <div className={`h-32 bg-gradient-to-br ${lab.color} relative flex items-center justify-center text-6xl group-hover:scale-105 transition-transform origin-bottom`}>
//                          <div className="absolute inset-0 bg-black/20"></div>
//                          <div className="relative z-10 drop-shadow-xl">{lab.icon}</div>
//                       </div>
//                       <div className="p-4 flex-1 flex flex-col">
//                          <div className="flex justify-between items-start mb-2">
//                             <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{lab.subject}</span>
//                             <span className="text-[10px] text-slate-500 font-bold">{lab.level}</span>
//                          </div>
//                          <h3 className="font-bold text-white text-base leading-tight mb-4 group-hover:text-cyan-300 transition-colors">{lab.title}</h3>
                         
//                          <div className="mt-auto flex items-center justify-between">
//                             <span className="text-xs text-slate-400 flex items-center gap-1">⏱️ {lab.duration}</span>
//                             <button className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-600 text-white rounded-lg text-xs font-bold transition-colors">
//                               Start Lab
//                             </button>
//                          </div>
//                       </div>
//                    </div>
//                  ))}
//               </div>
//            </div>

//            {/* Interactive Demo Teaser */}
//            <div className="glass rounded-3xl p-8 border border-cyan-500/30 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
//               <div className="absolute top-1/2 -translate-y-1/2 right-0 w-64 h-64 bg-cyan-500/20 blur-3xl rounded-full"></div>
              
//               <div className="relative z-10">
//                  <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-widest rounded-full mb-3 border border-cyan-500/30">New Feature</span>
//                  <h2 className="text-2xl font-black text-white mb-2">Build Your Own Circuit</h2>
//                  <p className="text-sm text-slate-300 max-w-md leading-relaxed mb-4">
//                    Drag and drop resistors, batteries, and LEDs on the virtual breadboard to see how electricity flows in real-time. If it short-circuits, it safely sparks!
//                  </p>
//                  <button className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-cyan-500/20 transition-all">
//                    Try Sandbox Mode
//                  </button>
//               </div>
              
//               <div className="text-8xl relative z-10 animate-[bounce_3s_infinite]">💡</div>
//            </div>

//         </div>

//         {/* Right Column: Progress & Hardware */}
//         <div className="lg:col-span-1 space-y-6">
           
//            <div className="glass rounded-3xl p-6 border border-slate-700/50">
//               <h3 className="font-bold text-white mb-4 flex items-center gap-2">
//                 <span className="text-xl">📊</span> Lab Report Card
//               </h3>
              
//               <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700 text-center mb-6">
//                  <span className="block text-4xl font-black text-emerald-400 mb-1">12</span>
//                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Experiments Completed</span>
//               </div>

//               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Recent Evaluations</h4>
//               <div className="space-y-3">
//                  {completedLabs.map((lab, idx) => (
//                    <div key={idx} className="bg-slate-900/40 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
//                       <div>
//                          <h5 className="text-sm font-bold text-slate-300 mb-0.5">{lab.title}</h5>
//                          <span className="text-[10px] text-slate-500">{lab.date}</span>
//                       </div>
//                       <div className="text-emerald-400 font-black text-sm bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
//                          {lab.score}
//                       </div>
//                    </div>
//                  ))}
//               </div>
//            </div>

//            <div className="glass rounded-3xl p-6 border border-slate-700/50 bg-slate-800/30">
//               <h3 className="font-bold text-white mb-2 flex items-center gap-2">
//                 <span className="text-xl">📦</span> School Hardware Kit
//               </h3>
//               <p className="text-xs text-slate-400 leading-relaxed mb-4">
//                 Did you know you can request a physical Arduino or Robotics kit from your school's Tinkering Lab to take home for the weekend?
//               </p>
//               <button className="w-full py-2 border border-slate-600 hover:bg-slate-700 rounded-xl text-xs font-bold text-white transition-colors">
//                  Check Kit Availability
//               </button>
"use client";

import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { LucideIcon } from "@/components/LucideIcon";

const featuredLabs = [
  // Class 6
  { id: 601, cls: 6, title: "Measuring Length & Motion", subject: "Physics", duration: "15 mins", level: "Class 6", icon: "Ruler", color: "from-blue-500 to-cyan-500" },
  { id: 602, cls: 6, title: "States of Matter", subject: "Chemistry", duration: "15 mins", level: "Class 6", icon: "Droplet", color: "from-emerald-500 to-teal-500" },
  { id: 603, cls: 6, title: "Parts of a Plant", subject: "Biology", duration: "15 mins", level: "Class 6", icon: "Sprout", color: "from-lime-500 to-green-500" },
  // Class 7
  { id: 701, cls: 7, title: "Heat & Temperature", subject: "Physics", duration: "18 mins", level: "Class 7", icon: "Thermometer", color: "from-blue-500 to-cyan-500" },
  { id: 702, cls: 7, title: "Acids, Bases & Salts", subject: "Chemistry", duration: "20 mins", level: "Class 7", icon: "FlaskConical", color: "from-emerald-500 to-teal-500" },
  { id: 703, cls: 7, title: "Digestion in Humans", subject: "Biology", duration: "20 mins", level: "Class 7", icon: "Activity", color: "from-lime-500 to-green-500" },
  // Class 8
  { id: 801, cls: 8, title: "Force & Pressure", subject: "Physics", duration: "20 mins", level: "Class 8", icon: "Magnet", color: "from-blue-500 to-cyan-500" },
  { id: 802, cls: 8, title: "Atomic Structure Basics", subject: "Chemistry", duration: "22 mins", level: "Class 8", icon: "Atom", color: "from-emerald-500 to-teal-500" },
  { id: 803, cls: 8, title: "Microorganisms", subject: "Biology", duration: "20 mins", level: "Class 8", icon: "Bug", color: "from-lime-500 to-green-500" },
  { id: 804, cls: 8, title: "Intro to Programming (Scratch)", subject: "Computer Science", duration: "25 mins", level: "Class 8", icon: "Puzzle", color: "from-purple-500 to-fuchsia-500" },
  // Class 9
  { id: 901, cls: 9, title: "Laws of Motion", subject: "Physics", duration: "25 mins", level: "Class 9", icon: "Rocket", color: "from-blue-500 to-cyan-500" },
  { id: 902, cls: 9, title: "Periodic Classification", subject: "Chemistry", duration: "25 mins", level: "Class 9", icon: "Grid", color: "from-emerald-500 to-teal-500" },
  { id: 903, cls: 9, title: "Cell Structure", subject: "Biology", duration: "22 mins", level: "Class 9", icon: "Dna", color: "from-lime-500 to-green-500" },
  { id: 904, cls: 9, title: "Algorithms & Flowcharts", subject: "Computer Science", duration: "25 mins", level: "Class 9", icon: "GitFork", color: "from-purple-500 to-fuchsia-500" },
  // Class 10
  { id: 1001, cls: 10, title: "Ohm's Law Verification", subject: "Physics", duration: "25 mins", level: "Class 10", icon: "Zap", color: "from-blue-500 to-cyan-500" },
  { id: 1002, cls: 10, title: "Types of Chemical Reactions", subject: "Chemistry", duration: "28 mins", level: "Class 10", icon: "FlaskConical", color: "from-emerald-500 to-teal-500" },
  { id: 1003, cls: 10, title: "Human Circulatory System (3D)", subject: "Biology", duration: "30 mins", level: "Class 10", icon: "HeartPulse", color: "from-rose-500 to-pink-500" },
  { id: 1004, cls: 10, title: "Python Basics", subject: "Computer Science", duration: "30 mins", level: "Class 10", icon: "Code", color: "from-purple-500 to-fuchsia-500" },
  // Class 11
  { id: 1101, cls: 11, title: "Projectile Motion", subject: "Physics", duration: "30 mins", level: "Class 11", icon: "Target", color: "from-blue-500 to-cyan-500" },
  { id: 1102, cls: 11, title: "Acid-Base Titration", subject: "Chemistry", duration: "30 mins", level: "Class 11", icon: "FlaskConical", color: "from-emerald-500 to-teal-500" },
  { id: 1103, cls: 11, title: "Photosynthesis Simulation", subject: "Biology", duration: "28 mins", level: "Class 11", icon: "Leaf", color: "from-lime-500 to-green-500" },
  { id: 1104, cls: 11, title: "C++ Loops & Arrays", subject: "Computer Science", duration: "35 mins", level: "Class 11", icon: "Cpu", color: "from-purple-500 to-fuchsia-500" },
  // Class 12
  { id: 1201, cls: 12, title: "Semiconductor Diodes", subject: "Physics", duration: "35 mins", level: "Class 12", icon: "Cpu", color: "from-blue-500 to-cyan-500" },
  { id: 1202, cls: 12, title: "Electrochemistry Cell", subject: "Chemistry", duration: "35 mins", level: "Class 12", icon: "BatteryCharging", color: "from-emerald-500 to-teal-500" },
  { id: 1203, cls: 12, title: "Human Heart Dissection (3D)", subject: "Biology", duration: "45 mins", level: "Class 12", icon: "HeartPulse", color: "from-rose-500 to-pink-500" },
  { id: 1204, cls: 12, title: "Database SQL Queries", subject: "Computer Science", duration: "35 mins", level: "Class 12", icon: "Database", color: "from-purple-500 to-fuchsia-500" },
];

const LAB_CLASSES = [6, 7, 8, 9, 10, 11, 12];

const completedLabs = [
  { title: "Photosynthesis Simulation", date: "June 15, 2026", score: "95%" },
  { title: "Simple Pendulum", date: "June 10, 2026", score: "100%" },
];

export default function VirtualLabsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const studentClass = user?.class ? parseInt(user.class) : null;

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeClass, setActiveClass] = useState<number | "All">("All");

  // Default active class selection to active student's grade class
  useEffect(() => {
    if (studentClass && LAB_CLASSES.includes(studentClass)) {
      setActiveClass(studentClass);
    }
  }, [studentClass]);

  const visibleLabs = featuredLabs.filter(
    (lab) =>
      (activeCategory === "All" || lab.subject === activeCategory) &&
      (lab.cls === (studentClass || 10))
  );

  return (
    <PortalLayout
      title="Virtual Science Labs"
      subtitle="Perform safe, interactive 3D experiments from anywhere."
      avatarLetter="A"
      avatarColor="#06b6d4"
      themeClass="theme-student"
      accentColor="#06b6d4"
    >

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50 w-fit overflow-x-auto">
           {["All", "Physics", "Chemistry", "Biology", "Computer Science"].map(cat => (
             <button
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${activeCategory === cat ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/20" : "text-black dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400"}`}
             >
               {cat}
             </button>
           ))}
        </div>

        <button className="px-4 py-2 border border-cyan-500/50 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
           <span>🥽</span> Launch AR Mode
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recommended & AR */}
        <div className="lg:col-span-2 space-y-6">
           
           <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
              <h2 className="text-xl font-bold text-black dark:text-white mb-6 flex items-center gap-2">
                <span className="text-2xl">✨</span> Recommended for You
              </h2>
              
              {visibleLabs.length === 0 && (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 text-center text-sm font-bold text-slate-500 dark:text-slate-400">
                  No experiments for this class & subject yet — try another class.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {visibleLabs.map((lab) => (
                   <div key={lab.id} className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden hover:-translate-y-1 hover:border-cyan-500/50 transition-all group flex flex-col cursor-pointer">
                      <div className="h-32 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 relative flex items-center justify-center group-hover:scale-105 transition-transform origin-bottom text-cyan-600 dark:text-cyan-400">
                         <LucideIcon name={lab.icon} className="w-12 h-12 stroke-[2.2]" />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] uppercase font-black tracking-widest text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{lab.subject}</span>
                            <span className="text-[10px] text-black dark:text-white font-bold">{lab.level}</span>
                         </div>
                         <h3 className="font-bold text-black dark:text-white text-base leading-tight mb-4 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">{lab.title}</h3>
                         
                         <div className="mt-auto flex items-center justify-between">
                            <span className="text-xs text-black dark:text-white flex items-center gap-1">⏱️ {lab.duration}</span>
                            <button className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-600 text-white rounded-lg text-xs font-bold transition-colors">
                              Start Lab
                            </button>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Interactive Demo Teaser */}
           <div className="glass rounded-3xl p-8 border border-cyan-500/30 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="absolute top-1/2 -translate-y-1/2 right-0 w-64 h-64 bg-cyan-500/20 blur-3xl rounded-full"></div>
              
              <div className="relative z-10">
                 <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-black uppercase tracking-widest rounded-full mb-3 border border-cyan-500/30">New Feature</span>
                 <h2 className="text-2xl font-black text-black dark:text-white mb-2">Build Your Own Circuit</h2>
                 <p className="text-sm text-black dark:text-white max-w-md leading-relaxed mb-4">
                   Drag and drop resistors, batteries, and LEDs on the virtual breadboard to see how electricity flows in real-time. If it short-circuits, it safely sparks!
                 </p>
                 <button className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-cyan-500/20 transition-all">
                   Try Sandbox Mode
                 </button>
              </div>
              
              <div className="text-8xl relative z-10 animate-[bounce_3s_infinite]">💡</div>
           </div>

        </div>

        {/* Right Column: Progress & Hardware */}
        <div className="lg:col-span-1 space-y-6">
           
           <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
              <h3 className="font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                <span className="text-xl">📊</span> Lab Report Card
              </h3>
              
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center mb-6">
                 <span className="block text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-1">12</span>
                 <span className="text-xs uppercase font-bold text-black dark:text-white tracking-wider">Experiments Completed</span>
              </div>

              <h4 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-3">Recent Evaluations</h4>
              <div className="space-y-3">
                 {completedLabs.map((lab, idx) => (
                   <div key={idx} className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                         <h5 className="text-sm font-bold text-black dark:text-white mb-0.5">{lab.title}</h5>
                         <span className="text-[10px] text-black dark:text-white">{lab.date}</span>
                      </div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-black text-sm bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                         {lab.score}
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30">
              <h3 className="font-bold text-black dark:text-white mb-2 flex items-center gap-2">
                <span className="text-xl">📦</span> School Hardware Kit
              </h3>
              <p className="text-xs text-black dark:text-white leading-relaxed mb-4">
                Did you know you can request a physical Arduino or Robotics kit from your school's Tinkering Lab to take home for the weekend?
              </p>
              <button className="w-full py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-black dark:text-white transition-colors">
                 Check Kit Availability
              </button>
           </div>

        </div>

      </div>
    </PortalLayout>
  );
}
