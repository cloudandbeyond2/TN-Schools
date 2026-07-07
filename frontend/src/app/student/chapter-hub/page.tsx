"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PortalLayout from "@/components/PortalLayout";
import {
  BookOpen, Bot, Volume2, Brain, FlaskConical, Box, Video, HelpCircle,
  FileText, TrendingUp, Award, Languages, ChevronLeft, Sparkles,
} from "lucide-react";
import { TN_BOOKS_SOURCE } from "@/data/scienceLibrary";

type Tile = {
  key: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  accent: string;
  href?: string;
  action?: "speakTa" | "speakEn";
  soon?: boolean;
};

function speak(text: string, lang: string) {
  try {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

function HubInner() {
  const params = useSearchParams();
  const cls = params.get("class") || "";
  const subject = params.get("subject") || "Science";
  const medium = params.get("medium") || "English";
  const chapter = params.get("chapter") || "Chapter";

  const [progress, setProgress] = useState(0);
  const [badge, setBadge] = useState(false);

  const tiles: Tile[] = [
    { key: "pdf", label: "Read PDF", desc: "Open the chapter in the textbook", icon: BookOpen, accent: "sky", href: TN_BOOKS_SOURCE },
    { key: "tutor", label: "AI Chapter Tutor", desc: "Ask anything about this chapter", icon: Bot, accent: "indigo", href: "/student/ai-tutor" },
    { key: "audioTa", label: "Tamil Audio Lesson", desc: "தமிழில் கேளுங்கள்", icon: Volume2, accent: "orange", action: "speakTa" },
    { key: "audioEn", label: "English Audio Lesson", desc: "Listen in English", icon: Languages, accent: "emerald", action: "speakEn" },
    { key: "mindmap", label: "Mind Map", desc: "See the chapter at a glance", icon: Brain, accent: "purple", soon: true },
    { key: "experiment", label: "Virtual Experiment", desc: "Try it in the 3D lab", icon: FlaskConical, accent: "cyan", href: "/student/labs" },
    { key: "3d", label: "3D Model", desc: "Rotate & zoom the model", icon: Box, accent: "rose", href: "/student/3d-preview" },
    { key: "video", label: "Experiment Video", desc: "Watch a demo", icon: Video, accent: "amber", soon: true },
    { key: "quiz", label: "Chapter Quiz", desc: "Test yourself", icon: HelpCircle, accent: "lime", soon: true },
    { key: "worksheet", label: "Practice Worksheet", desc: "Solve & submit", icon: FileText, accent: "sky", soon: true },
  ];

  const ACCENT: Record<string, string> = {
    sky: "from-sky-500 to-blue-600", indigo: "from-indigo-500 to-violet-600", orange: "from-orange-500 to-red-500",
    emerald: "from-emerald-500 to-teal-600", purple: "from-purple-500 to-fuchsia-600", cyan: "from-cyan-500 to-sky-600",
    rose: "from-rose-500 to-pink-600", amber: "from-amber-500 to-orange-500", lime: "from-lime-500 to-green-600",
  };

  const taLine = `${chapter} - இந்த பாடத்தை கற்போம். வகுப்பு ${cls}.`;
  const enLine = `Let's learn the chapter ${chapter} for class ${cls} ${subject}.`;

  return (
    <PortalLayout title="Chapter Learning Hub" subtitle={`Class ${cls} · ${subject} · ${medium} Medium`}>
      <div className="flex flex-col gap-6 text-left">
        <Link href="/student/science-library" className="inline-flex items-center gap-1 text-xs font-black text-slate-400 hover:text-slate-600">
          <ChevronLeft className="w-4 h-4" /> Back to Library
        </Link>

        {/* chapter hero */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-600 to-indigo-700 text-white p-8 shadow-lg">
          <div className="absolute -right-10 -top-10 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Class {cls} · {subject}
            </span>
            <h2 className="text-2xl md:text-3xl font-black mb-2">{chapter}</h2>
            <p className="text-violet-50/90 text-sm font-medium">Everything for this chapter in one place — read, listen, experiment, and test yourself.</p>
          </div>
        </div>

        {/* progress */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border-2 border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-200"><TrendingUp className="w-4 h-4 text-emerald-500" /> Your progress</h3>
            <span className="text-sm font-black text-emerald-600">{progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button onClick={() => setProgress((p) => Math.min(100, p + 20))} className="text-xs font-black px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Mark a step done (+20%)</button>
            {progress >= 100 && !badge && (
              <button onClick={() => setBadge(true)} className="text-xs font-black px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Claim badge</button>
            )}
            {badge && <span className="text-xs font-black px-3 py-1.5 rounded-lg bg-amber-500 text-white flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Chapter Champion!</span>}
          </div>
        </div>

        {/* feature tiles */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tiles.map((t) => {
            const Icon = t.icon;
            const inner = (
              <div className={`relative h-full bg-white dark:bg-slate-800 rounded-2xl p-4 border-2 border-slate-100 dark:border-slate-700 hover:-translate-y-1 hover:shadow-lg transition-all flex flex-col items-start ${t.soon ? "opacity-70" : ""}`}>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${ACCENT[t.accent]} flex items-center justify-center text-white shadow mb-3`}><Icon className="w-5 h-5" /></div>
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight">{t.label}</h4>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{t.desc}</p>
                {t.soon && <span className="absolute top-3 right-3 text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">SOON</span>}
              </div>
            );
            if (t.href) return <Link key={t.key} href={t.href} target={t.href.startsWith("http") ? "_blank" : undefined} className="block h-full">{inner}</Link>;
            if (t.action) return <button key={t.key} onClick={() => speak(t.action === "speakTa" ? taLine : enLine, t.action === "speakTa" ? "ta-IN" : "en-IN")} className="text-left h-full">{inner}</button>;
            return <div key={t.key} className="h-full cursor-not-allowed">{inner}</div>;
          })}
        </div>
      </div>
    </PortalLayout>
  );
}

export default function ChapterHubPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-400 text-sm font-bold">Loading chapter…</div>}>
      <HubInner />
    </Suspense>
  );
}
