"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import PortalLayout from "@/components/PortalLayout";
import {
  SCIENCE_CENTERS, CENTER_GROUPS, STREAMS, type ScienceCenter, type Stream,
} from "@/data/scienceCenters";

// Flaticon class map keyed by the legacy icon name used in scienceCenters data
const ICON_CLASS: Record<string, string> = {
  FlaskConical: "fi fi-sr-flask",
  Atom: "fi fi-sr-atom",
  Dna: "fi fi-sr-dna",
  Wrench: "fi fi-sr-wrench",
  Bug: "fi fi-sr-bug",
  Leaf: "fi fi-sr-leaf",
  Globe: "fi fi-sr-globe",
  Rocket: "fi fi-sr-rocket",
  HeartPulse: "fi fi-sr-heart-rate",
  Brain: "fi fi-sr-brain",
  Landmark: "fi fi-sr-landmark",
  BookOpen: "fi fi-sr-book-open-reader",
  Video: "fi fi-sr-play-alt",
  ListChecks: "fi fi-sr-clipboard-list-check",
  Bot: "fi fi-sr-robot",
  Lightbulb: "fi fi-sr-lightbulb",
  Trophy: "fi fi-sr-trophy",
  Compass: "fi fi-sr-compass",
  GraduationCap: "fi fi-sr-graduation-cap",
  Sparkles: "fi fi-sr-sparkles",
  ArrowRight: "fi fi-sr-arrow-right",
  Lock: "fi fi-sr-lock",
  Sprout: "fi fi-sr-sprout",
  Microscope: "fi fi-sr-microscope",
  Users: "fi fi-sr-users",
  Briefcase: "fi fi-sr-briefcase",
  Calculator: "fi fi-sr-calculator",
  TrendingUp: "fi fi-sr-trending-up",
  BarChart3: "fi fi-sr-chart-histogram",
  Code: "fi fi-sr-code-branch",
  Cpu: "fi fi-sr-microchip",
  Database: "fi fi-sr-database",
  Box: "fi fi-sr-box",
};

const ACCENT: Record<string, { grad: string; text: string; soft: string; ring: string; iconColor: string }> = {
  emerald: { grad: "from-emerald-500 to-teal-600", text: "text-emerald-600", soft: "bg-emerald-50 dark:bg-emerald-950/40", ring: "hover:border-emerald-300 dark:hover:border-emerald-700", iconColor: "#059669" },
  sky: { grad: "from-sky-500 to-blue-600", text: "text-sky-600", soft: "bg-sky-50 dark:bg-sky-950/40", ring: "hover:border-sky-300 dark:hover:border-sky-700", iconColor: "#0284c7" },
  purple: { grad: "from-purple-500 to-fuchsia-600", text: "text-purple-600", soft: "bg-purple-50 dark:bg-purple-950/40", ring: "hover:border-purple-300 dark:hover:border-purple-700", iconColor: "#9333ea" },
  amber: { grad: "from-amber-500 to-orange-500", text: "text-amber-600", soft: "bg-amber-50 dark:bg-amber-950/40", ring: "hover:border-amber-300 dark:hover:border-amber-700", iconColor: "#d97706" },
  rose: { grad: "from-rose-500 to-pink-600", text: "text-rose-600", soft: "bg-rose-50 dark:bg-rose-950/40", ring: "hover:border-rose-300 dark:hover:border-rose-700", iconColor: "#e11d48" },
  indigo: { grad: "from-indigo-500 to-violet-600", text: "text-indigo-600", soft: "bg-indigo-50 dark:bg-indigo-950/40", ring: "hover:border-indigo-300 dark:hover:border-indigo-700", iconColor: "#4f46e5" },
  cyan: { grad: "from-cyan-500 to-sky-600", text: "text-cyan-600", soft: "bg-cyan-50 dark:bg-cyan-950/40", ring: "hover:border-cyan-300 dark:hover:border-cyan-700", iconColor: "#0891b2" },
  orange: { grad: "from-orange-500 to-red-500", text: "text-orange-600", soft: "bg-orange-50 dark:bg-orange-950/40", ring: "hover:border-orange-300 dark:hover:border-orange-700", iconColor: "#ea580c" },
  lime: { grad: "from-lime-500 to-green-600", text: "text-lime-600", soft: "bg-lime-50 dark:bg-lime-950/40", ring: "hover:border-lime-300 dark:hover:border-lime-700", iconColor: "#65a30d" },
};

const itemVariants: import("framer-motion").Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
};

function CenterCard({ c }: { c: ScienceCenter }) {
  const a = ACCENT[c.accent] || ACCENT.emerald;
  const iconClass = ICON_CLASS[c.icon] || "fi fi-sr-flask";
  const live = c.status === "live";
  const inner = (
    <motion.div
      variants={itemVariants}
      whileHover={live ? { y: -5, scale: 1.02 } : {}}
      whileTap={live ? { scale: 0.98 } : {}}
      className={`relative h-full bg-white/80 dark:bg-slate-800/70 backdrop-blur rounded-3xl p-5 border-2 border-slate-100 dark:border-slate-700 ${live ? a.ring + " shadow-sm hover:shadow-xl" : "opacity-70"} transition-all flex flex-col`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${a.soft} flex items-center justify-center border border-slate-100 dark:border-slate-700/50 shadow-sm`}>
          <i className={`${iconClass} text-xl flex items-center`} style={{ color: a.iconColor, WebkitTextFillColor: a.iconColor }} />
        </div>
        {live
          ? <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700">OPEN</span>
          : <span className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg bg-slate-100 text-slate-400">
              <i className="fi fi-sr-lock text-xs flex items-center" /> SOON
            </span>}
      </div>
      <h3 className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight">{c.name}</h3>
      {c.nameTa && <p className={`text-xs font-bold ${a.text}`}>{c.nameTa}</p>}
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed flex-1">{c.desc}</p>
      {live && (
        <span className={`mt-3 inline-flex items-center gap-1 text-xs font-black ${a.text}`}>
          Enter <i className="fi fi-sr-arrow-right text-xs flex items-center" />
        </span>
      )}
    </motion.div>
  );
  return live ? <Link href={c.route} className="block h-full">{inner}</Link> : <div className="h-full cursor-not-allowed">{inner}</div>;
}

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

const mapDbStreamToStream = (dbStream: string): Stream => {
  const s = String(dbStream || "").toLowerCase();
  if (s.includes("science & math") || s.includes("computer science")) return "ComputerScience";
  if (s.includes("commerce") || s.includes("accountancy")) return "Commerce";
  if (s.includes("arts") || s.includes("humanities")) return "Arts";
  if (s.includes("vocational")) return "Vocational";
  return "Science";
};

const mapStreamToDbStream = (stream: Stream): string => {
  if (stream === "ComputerScience") return "Computer Science & Math";
  if (stream === "Commerce") return "Commerce & Accountancy";
  if (stream === "Arts") return "Arts & Humanities";
  if (stream === "Vocational") return "Vocational Education";
  return "Pure Science & Bio";
};

export default function ScienceCampusPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const studentClass = parseInt(user?.class || "10");
  const isHigherSecondary = studentClass >= 11;

  const [stream, setStream] = useState<Stream>("Science");
  const [studentId, setStudentId] = useState<string | null>(null);

  // 1. Fetch studentId on session change
  useEffect(() => {
    if (!user?.id) return;

    if (user.studentId) {
      setStudentId(user.studentId);
      return;
    }

    fetch(`${API_BASE}/api/students`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          const myStudent = json.data.find((s: any) => s.userId === user.id);
          if (myStudent) setStudentId(myStudent.id);
        }
      })
      .catch((err) => console.error("Error loading student profile in campus page:", err));
  }, [user]);

  // 2. Load the saved group (shared with the sidebar) and fallback to DB stream.
  useEffect(() => {
    if (!isHigherSecondary) {
      setStream("Science");
      return;
    }

    // Check local storage first for quick display
    const saved = localStorage.getItem("studentGroup") as Stream | null;
    if (saved === "Science" || saved === "Commerce" || saved === "ComputerScience" || saved === "Arts" || saved === "Vocational") {
      setStream(saved);
    }
  }, [isHigherSecondary]);

  // 3. Keep group in sync with database portfolio stream
  useEffect(() => {
    if (!studentId || !isHigherSecondary) return;

    fetch(`${API_BASE}/api/students/${studentId}/dashboard-summary`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const mapped = mapDbStreamToStream(json.data.stream);
          setStream(mapped);
          localStorage.setItem("studentGroup", mapped);
          window.dispatchEvent(new Event("studentGroupChange"));
        }
      })
      .catch((err) => console.error("Error syncing stream with DB:", err));
  }, [studentId, isHigherSecondary]);

  const visible = SCIENCE_CENTERS.filter((c) => {
    // Under Class 11, students don't have streams, so filter out specialized Commerce/CS modules
    if (!isHigherSecondary) {
      if (c.group === "Commerce" || c.group === "Computer Science" || c.group === "For Teachers") {
        return false;
      }
      // Hide Higher Secondary specific subjects like Botany and Zoology from Classes < 11
      if (c.id === "botany" || c.id === "zoology") {
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
      <div className="flex flex-col gap-7 text-left w-full pb-16">

        {/* Modern Glassmorphism Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl py-4 px-6 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/30 shrink-0 shadow-sm">
              <i className="fi fi-sr-flask text-xl flex items-center" style={{ color: "#4f46e5", WebkitTextFillColor: "#4f46e5" }} />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-1 flex items-center gap-1.5">
                <i className="fi fi-sr-sparkles text-amber-400 flex items-center text-[10px]" />
                Class {studentClass} · Tamil & English
              </span>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider leading-none mb-1">
                Digital Science Campus
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight max-w-xl">
                Every centre connects your Class {studentClass} textbooks to experiments, 3D models, research and quizzes.{" "}
                <span className="font-black text-emerald-600 dark:text-emerald-400">{liveCount} centers open</span>
                {isHigherSecondary ? ` for the ${activeStream?.label} stream` : " for your class"}.
              </p>
            </div>
          </div>

          {/* Stream / Class badge pill */}
          <div className="shrink-0 flex flex-col items-center sm:items-end gap-1">
            <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fi fi-sr-graduation-cap flex items-center" />
              {isHigherSecondary ? activeStream?.label || stream : `Class ${studentClass}`}
            </span>
            <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <i className="fi fi-sr-check-circle flex items-center" />
              {liveCount} Labs Open
            </span>
          </div>
        </div>

        {/* grouped centers */}
        {CENTER_GROUPS.map((group) => {
          const items = visible.filter((c) => c.group === group);
          if (!items.length) return null;
          return (
            <section key={group}>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3">{group}</h3>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {items.map((c) => <CenterCard key={c.id} c={c} />)}
              </motion.div>
            </section>
          );
        })}
      </div>
    </PortalLayout>
  );
}
