"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import {
  FlaskConical, Atom, Dna, Wrench, Bug, Leaf, Globe, Rocket, HeartPulse,
  Brain, Landmark, BookOpen, Video, ListChecks, Bot, Lightbulb, Trophy,
  Compass, GraduationCap, Sparkles, ArrowRight, Lock, Sprout, Microscope,
  Users, Briefcase, Calculator, TrendingUp, BarChart3, Code, Cpu, Database,
} from "lucide-react";
import {
  SCIENCE_CENTERS, CENTER_GROUPS, STREAMS, type ScienceCenter, type Stream,
} from "@/data/scienceCenters";

const ICONS: Record<string, React.ElementType> = {
  FlaskConical, Atom, Dna, Wrench, Bug, Leaf, Globe, Rocket, HeartPulse,
  Brain, Landmark, BookOpen, Video, ListChecks, Bot, Lightbulb, Trophy,
  Compass, GraduationCap, Sprout, Microscope, Users, Briefcase, Calculator,
  TrendingUp, BarChart3, Code, Cpu, Database,
};

const ACCENT: Record<string, { grad: string; text: string; soft: string; ring: string }> = {
  emerald: { grad: "from-emerald-500 to-teal-600", text: "text-emerald-600", soft: "bg-emerald-50", ring: "hover:border-emerald-300" },
  sky: { grad: "from-sky-500 to-blue-600", text: "text-sky-600", soft: "bg-sky-50", ring: "hover:border-sky-300" },
  purple: { grad: "from-purple-500 to-fuchsia-600", text: "text-purple-600", soft: "bg-purple-50", ring: "hover:border-purple-300" },
  amber: { grad: "from-amber-500 to-orange-500", text: "text-amber-600", soft: "bg-amber-50", ring: "hover:border-amber-300" },
  rose: { grad: "from-rose-500 to-pink-600", text: "text-rose-600", soft: "bg-rose-50", ring: "hover:border-rose-300" },
  indigo: { grad: "from-indigo-500 to-violet-600", text: "text-indigo-600", soft: "bg-indigo-50", ring: "hover:border-indigo-300" },
  cyan: { grad: "from-cyan-500 to-sky-600", text: "text-cyan-600", soft: "bg-cyan-50", ring: "hover:border-cyan-300" },
  orange: { grad: "from-orange-500 to-red-500", text: "text-orange-600", soft: "bg-orange-50", ring: "hover:border-orange-300" },
  lime: { grad: "from-lime-500 to-green-600", text: "text-lime-600", soft: "bg-lime-50", ring: "hover:border-lime-300" },
};

function CenterCard({ c }: { c: ScienceCenter }) {
  const a = ACCENT[c.accent] || ACCENT.emerald;
  const Icon = ICONS[c.icon] || FlaskConical;
  const live = c.status === "live";
  const inner = (
    <div className={`relative h-full bg-white/80 dark:bg-slate-800/70 backdrop-blur rounded-3xl p-5 border-2 border-slate-100 dark:border-slate-700 ${live ? a.ring + " hover:-translate-y-1 hover:shadow-xl" : "opacity-70"} transition-all flex flex-col`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.grad} flex items-center justify-center text-white shadow-md`}>
          <Icon className="w-6 h-6" />
        </div>
        {live
          ? <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700">OPEN</span>
          : <span className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg bg-slate-100 text-slate-400"><Lock className="w-3 h-3" />SOON</span>}
      </div>
      <h3 className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight">{c.name}</h3>
      {c.nameTa && <p className={`text-xs font-bold ${a.text}`}>{c.nameTa}</p>}
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed flex-1">{c.desc}</p>
      {live && (
        <span className={`mt-3 inline-flex items-center gap-1 text-xs font-black ${a.text}`}>
          Enter <ArrowRight className="w-3.5 h-3.5" />
        </span>
      )}
    </div>
  );
  return live ? <Link href={c.route} className="block h-full">{inner}</Link> : <div className="h-full cursor-not-allowed">{inner}</div>;
}

export default function ScienceCampusPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const studentClass = parseInt(user?.class || "10");
  const isHigherSecondary = studentClass >= 11;

  const [stream, setStream] = useState<Stream>("Science");

  // Load the saved group (shared with the sidebar).
  useEffect(() => {
    if (isHigherSecondary) {
      const saved = localStorage.getItem("studentGroup") as Stream | null;
      if (saved === "Science" || saved === "Commerce" || saved === "ComputerScience") {
        setStream(saved);
      }
    } else {
      setStream("Science"); // Default to Science for general middle/high school
    }
  }, [isHigherSecondary]);

  const pickStream = (s: Stream) => {
    setStream(s);
    localStorage.setItem("studentGroup", s);
    // Let the sidebar (PortalLayout) update its menu immediately.
    window.dispatchEvent(new Event("studentGroupChange"));
  };

  const visible = SCIENCE_CENTERS.filter((c) => {
    // Under Class 11, students don't have streams, so filter out specialized Commerce/CS modules
    if (!isHigherSecondary) {
      if (c.group === "Commerce" || c.group === "Computer Science" || c.group === "For Teachers") {
        return false;
      }
      return c.streams.includes("Science");
    }
    // High Secondary students see stream-specific centers
    return c.streams.includes(stream);
  });

  const liveCount = visible.filter((c) => c.status === "live").length;
  const activeStream = STREAMS.find((s) => s.id === stream);

  return (
    <PortalLayout title="Digital Science Campus 🧪" subtitle="Science Labs & Centers — explore, experiment, discover">
      <div className="flex flex-col gap-7 text-left">

        {/* hero */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white p-8 shadow-lg">
          <div className="absolute -right-10 -top-10 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute right-24 bottom-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Class {studentClass} · Tamil & English
            </span>
            <h2 className="text-3xl font-black text-white mb-2">
  Welcome to your Science Campus
</h2>

<p className="text-white/90 text-sm font-medium leading-relaxed">
  Every centre connects your Class {studentClass} textbooks to experiments, 3D models, research and quizzes.
  {" "}
  {liveCount} centers are open {isHigherSecondary ? `for the ${activeStream?.label} stream` : "for your class"}.
</p>
          </div>
        </div>

        {/* stream / group switcher - ONLY shown for Class 11-12 Higher Secondary students */}
        {isHigherSecondary && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border-2 border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 shrink-0">Your group</span>
            <div className="flex flex-wrap gap-2">
              {STREAMS.map((s) => {
                const on = s.id === stream;
                return (
                  <button key={s.id} onClick={() => pickStream(s.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-black transition-all border-2 ${on
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300"}`}>
                    <span className="mr-1.5">{s.emoji}</span>{s.label}
                    <span className="ml-1 hidden sm:inline text-[11px] font-bold opacity-70">· {s.labelTa}</span>
                  </button>
                );
              })}
            </div>
            <span className="sm:ml-auto text-[11px] font-bold text-slate-400">
              Commerce & Computer Science students see a tailored set of centres.
            </span>
          </div>
        )}

        {/* grouped centers */}
        {CENTER_GROUPS.map((group) => {
          const items = visible.filter((c) => c.group === group);
          if (!items.length) return null;
          return (
            <section key={group}>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3">{group}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((c) => <CenterCard key={c.id} c={c} />)}
              </div>
            </section>
          );
        })}
      </div>
    </PortalLayout>
  );
}
