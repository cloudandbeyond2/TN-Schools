"use client";

import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { LucideIcon } from "@/components/LucideIcon";
import { useStudentGroup } from "@/lib/useStudentGroup";
import { HS_LAB_CATEGORIES, HS_LAB_TITLES } from "@/data/hsGroups";
import type { Stream } from "@/data/scienceCenters";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

type FeaturedLab = {
  id: string;
  cls: number;
  title: string;
  subject: string;
  duration: string;
  level: string;
  icon: string;
  color: string;
  stream?: Stream;
};

const LAB_CLASSES = [6, 7, 8, 9, 10, 11, 12];

const getIconForSubject = (subject: string) => {
  if (subject.toLowerCase().includes("physic")) return "Atom";
  if (subject.toLowerCase().includes("chemi")) return "FlaskConical";
  if (subject.toLowerCase().includes("bio") || subject.toLowerCase().includes("zool") || subject.toLowerCase().includes("botan")) return "Dna";
  if (subject.toLowerCase().includes("comp") || subject.toLowerCase().includes("program")) return "Code";
  return "FlaskConical";
}

const getColorForSubject = (subject: string) => {
  if (subject.toLowerCase().includes("physic")) return "from-blue-500 to-cyan-500";
  if (subject.toLowerCase().includes("chemi")) return "from-emerald-500 to-teal-500";
  if (subject.toLowerCase().includes("bio") || subject.toLowerCase().includes("zool") || subject.toLowerCase().includes("botan")) return "from-lime-500 to-green-500";
  if (subject.toLowerCase().includes("comp") || subject.toLowerCase().includes("program")) return "from-purple-500 to-fuchsia-500";
  return "from-sky-500 to-blue-500";
}

export default function VirtualLabsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const studentClass = user?.class ? parseInt(user.class) : null;
  const studentGroup = useStudentGroup();
  const isHigherSecondary = (studentClass || 10) >= 11;

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeClass, setActiveClass] = useState<number | "All">("All");
  
  const [featuredLabs, setFeaturedLabs] = useState<FeaturedLab[]>([]);
  const [completedLabs, setCompletedLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentClass && LAB_CLASSES.includes(studentClass)) {
      setActiveClass(studentClass);
    }
  }, [studentClass]);
  
  useEffect(() => {
    const fetchLabs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/science/labs`);
        const json = await res.json();
        
        if (json.success) {
          const apiLabs = json.data || [];
          const mappedLabs: FeaturedLab[] = [];
          
          apiLabs.forEach((labGroup: any) => {
            const subjectName = labGroup.name.replace(" Lab", "");
            
            (labGroup.experiments || []).forEach((exp: any) => {
              const gradeStr = exp.grade || "Grade 10";
              const match = gradeStr.match(/\d+/);
              const cls = match ? parseInt(match[0]) : 10;
              
              mappedLabs.push({
                id: exp.id,
                cls: cls,
                title: exp.title || exp.name,
                subject: subjectName,
                duration: "30 mins",
                level: `Class ${cls}`,
                icon: getIconForSubject(subjectName),
                color: getColorForSubject(subjectName),
                stream: "Science"
              });
            });
          });
          setFeaturedLabs(mappedLabs);
        }
      } catch (err) {
        console.error("Error fetching labs:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLabs();
  }, []);

  const categories = useMemo(() => [
    "All",
    ...(isHigherSecondary
      ? HS_LAB_CATEGORIES[studentGroup]
      : ["Physics", "Chemistry", "Biology", "Computer Science"]),
  ], [isHigherSecondary, studentGroup]);

  useEffect(() => {
    setActiveCategory((prev) => (categories.includes(prev) ? prev : "All"));
  }, [categories]);

  const visibleLabs = featuredLabs.filter(
    (lab) =>
      (activeCategory === "All" || lab.subject === activeCategory) &&
      lab.cls === (studentClass || 10) &&
      (!isHigherSecondary || (lab.stream || "Science") === studentGroup)
  );

  const hero = isHigherSecondary
    ? HS_LAB_TITLES[studentGroup]
    : { title: "Virtual Science Labs", subtitle: "Perform safe, interactive 3D experiments from anywhere." };

  return (
    <PortalLayout
      title={hero.title}
      subtitle={hero.subtitle}
      avatarLetter="A"
      avatarColor="#06b6d4"
      themeClass="theme-student"
      accentColor="#06b6d4"
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50 w-fit overflow-x-auto">
           {categories.map(cat => (
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
              
              {loading && (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 text-center text-sm font-bold text-slate-500 dark:text-slate-400">
                  Loading virtual labs...
                </div>
              )}
              
              {!loading && visibleLabs.length === 0 && (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 text-center text-sm font-bold text-slate-500 dark:text-slate-400">
                  No experiments for this class & subject yet — try another class.
                </div>
              )}
              
              {!loading && visibleLabs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {visibleLabs.map((lab) => (
                     <div key={lab.id} className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden hover:-translate-y-1 hover:border-cyan-500/50 transition-all group flex flex-col cursor-pointer">
                        <div className={`h-32 bg-gradient-to-br ${lab.color} relative flex items-center justify-center group-hover:scale-105 transition-transform origin-bottom text-white`}>
                           <div className="absolute inset-0 bg-black/20"></div>
                           <div className="relative z-10 drop-shadow-xl"><LucideIcon name={lab.icon} className="w-12 h-12 stroke-[2.2]" /></div>
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
              )}
           </div>

           {/* Interactive Demo Teaser (circuit builder — Science / CS groups only) */}
           {(!isHigherSecondary || studentGroup === "Science" || studentGroup === "ComputerScience") && (
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
           )}

        </div>

        {/* Right Column: Progress & Hardware */}
        <div className="lg:col-span-1 space-y-6">
           
           <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
              <h3 className="font-bold text-black dark:text-white mb-4 flex items-center gap-2">
                <span className="text-xl">📊</span> Lab Report Card
              </h3>
              
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center mb-6">
                 <span className="block text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-1">{completedLabs.length}</span>
                 <span className="text-xs uppercase font-bold text-black dark:text-white tracking-wider">Experiments Completed</span>
              </div>

              <h4 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-3">Recent Evaluations</h4>
              <div className="space-y-3">
                 {completedLabs.length === 0 && (
                   <div className="text-xs text-slate-500 italic">No completed labs yet.</div>
                 )}
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
