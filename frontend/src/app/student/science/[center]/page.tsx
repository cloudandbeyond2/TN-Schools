"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PortalLayout from "@/components/PortalLayout";
import { LucideIcon } from "@/components/LucideIcon";
import { Sparkles, ChevronLeft, TrendingUp, Award, ArrowLeft } from "lucide-react";
import { getCenterTopics } from "@/data/centerTopics";

export default function ScienceCenterPage() {
  const params = useParams();
  const slug = String(params?.center || "");
  const center = getCenterTopics(slug);

  const [progress, setProgress] = useState(0);
  const [badge, setBadge] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  if (!center) {
    return (
      <PortalLayout title="Science Center" subtitle="Not found">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
          <div className="text-5xl mb-3">🔭</div>
          <h3 className="text-lg font-black text-slate-700 dark:text-slate-200">This centre is being prepared</h3>
          <Link href="/student/science-campus" className="inline-flex items-center gap-1 mt-4 text-sm font-black text-sky-600">
            <ArrowLeft className="w-4 h-4" /> Back to Science Campus
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const totalItems = center.groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <PortalLayout title={center.title} subtitle={center.titleTa ? `${center.titleTa} · ${center.tagline}` : center.tagline}>
      <div className="flex flex-col gap-6 text-left">
        <Link href="/student/science-campus" className="inline-flex items-center gap-1 text-xs font-black text-slate-400 hover:text-slate-600">
          <ChevronLeft className="w-4 h-4" /> Science Campus
        </Link>

        {/* hero */}
        <div className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${center.grad} text-white p-8 shadow-lg`}>
          <div className="absolute -right-10 -top-10 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex items-start gap-5">
            <div className="w-16 h-16 rounded-3xl bg-white/15 flex items-center justify-center shrink-0">
              <LucideIcon name={center.icon} className="w-9 h-9 text-white" />
            </div>
            <div>
              <span className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> {totalItems} topics
              </span>
              <h2 className="text-2xl md:text-3xl font-black mb-1">{center.title}</h2>
              <p className="text-white/85 text-sm font-medium max-w-2xl">{center.tagline}</p>
            </div>
          </div>
        </div>

        {/* progress */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border-2 border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-200"><TrendingUp className="w-4 h-4 text-emerald-500" /> Explore progress</h3>
            <span className="text-sm font-black text-emerald-600">{progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          {badge && <span className="inline-flex items-center gap-1 mt-3 text-xs font-black px-3 py-1.5 rounded-lg bg-amber-500 text-white"><Award className="w-3.5 h-3.5" /> {center.title} Explorer!</span>}
        </div>

        {/* topic groups */}
        {center.groups.map((g) => (
          <section key={g.heading}>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3">{g.heading}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {g.items.map((it) => {
                const key = `${g.heading}:${it.label}`;
                const isActive = active === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActive(key);
                      setProgress((p) => {
                        const np = Math.min(100, p + Math.ceil(100 / totalItems));
                        if (np >= 100) setBadge(true);
                        return np;
                      });
                    }}
                    className={`group relative rounded-2xl p-4 border-2 text-left transition-all hover:-translate-y-1 hover:shadow-lg ${
                      isActive ? "border-emerald-400 bg-emerald-50 dark:bg-slate-900" : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800"
                    }`}
                  >
                    <span className="text-2xl">{it.emoji}</span>
                    <p className="text-xs font-black text-slate-700 dark:text-slate-200 mt-2 leading-tight">{it.label}</p>
                    <span className="text-[9px] font-black text-slate-300 group-hover:text-emerald-400">{isActive ? "✓ visited" : "explore"}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        {/* detail note */}
        {active && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border-2 border-emerald-100 dark:border-slate-700">
            <p className="text-sm font-black text-slate-800 dark:text-slate-100">{active.split(":").pop()}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Interactive 3D content, animations and a guided lesson for this topic are on the way. Meanwhile, ask the AI Tutor or open the Book Library for the related chapter.
            </p>
            <div className="flex gap-2 mt-3">
              <Link href="/student/ai-tutor" className="text-xs font-black px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200">🤖 Ask AI Tutor</Link>
              <Link href="/student/science-library" className="text-xs font-black px-3 py-1.5 rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200">📚 Book Library</Link>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
