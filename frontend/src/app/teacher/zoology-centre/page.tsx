"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import {
  BookOpen,
  CheckCircle2,
  Target,
  Newspaper,
  Sparkles,
  GraduationCap,
  Play,
  X,
  Globe,
  ShieldCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  ZOOLOGY_SYLLABUS,
  AVAILABLE_GRADES,
  ONLINE_RESEARCH,
  ZOO_APPROVAL_STATUS,
  zooApprovalName,
  type ZoologyUnit,
} from "@/data/zoologySyllabus";

const ACCENT: Record<string, string> = {
  emerald: "text-emerald-600", purple: "text-purple-600", amber: "text-amber-600",
  sky: "text-sky-600", orange: "text-orange-600", rose: "text-rose-600",
};

export default function TeacherZoologyStudioPage() {
  const { data: session } = useSession();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const schoolId = (session?.user as any)?.schoolId;
  const userId = (session?.user as any)?.id;

  const [grade, setGrade] = useState<number>(8);
  const [studioIndex, setStudioIndex] = useState<number | null>(null); // index into units for studio slides
  const [publishedByGrade, setPublishedByGrade] = useState<Record<number, string>>({}); // grade -> approval record id
  const [busy, setBusy] = useState(false);

  const data = ZOOLOGY_SYLLABUS[grade];

  // load current approvals from LabEquipment
  const loadApprovals = useCallback(async () => {
    if (!schoolId) return;
    try {
      const res = await fetch(`${API_URL}/api/teacher/labs?schoolId=${schoolId}`);
      const json = await res.json();
      const map: Record<number, string> = {};
      (json?.data || []).forEach((r: any) => {
        if (r.status === ZOO_APPROVAL_STATUS && r.classRoomId) map[Number(r.classRoomId)] = r.id;
      });
      setPublishedByGrade(map);
    } catch {
      /* ignore */
    }
  }, [schoolId, API_URL]);

  useEffect(() => { loadApprovals(); }, [loadApprovals]);

  const isPublished = publishedByGrade[grade] != null;

  const togglePublish = async () => {
    if (!schoolId) return;
    setBusy(true);
    try {
      if (isPublished) {
        await fetch(`${API_URL}/api/teacher/labs/${publishedByGrade[grade]}`, { method: "DELETE" });
      } else {
        await fetch(`${API_URL}/api/teacher/labs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: zooApprovalName(grade),
            status: ZOO_APPROVAL_STATUS,
            classRoomId: String(grade),
            classSection: "ALL",
            date: new Date().toISOString(),
            location: "Zoology Study Centre",
            schoolId,
            userId,
          }),
        });
      }
      await loadApprovals();
    } finally {
      setBusy(false);
    }
  };

  return (
    <PortalLayout title="Zoology Studio 🎬" subtitle="Preview & approve the student Zoology Centre — per class">
      <div className="flex flex-col gap-6 text-left">

        {/* grade selector + publish */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border-2 border-slate-100 dark:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-2xl"><GraduationCap className="w-6 h-6" /></div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Class to review</p>
              <div className="flex items-center gap-2 mt-1">
                {AVAILABLE_GRADES.map((g) => (
                  <button key={g} onClick={() => setGrade(g)}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-black transition-all ${grade === g ? "bg-indigo-500 text-white shadow" : "bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200"}`}>
                    Class {g}{publishedByGrade[g] != null && <CheckCircle2 className="inline w-3.5 h-3.5 ml-1" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-black px-3 py-1.5 rounded-xl ${isPublished ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              {isPublished ? "Published to students" : "Draft — not visible to students"}
            </span>
            <button onClick={togglePublish} disabled={busy}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60 ${isPublished ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600"}`}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {isPublished ? "Unpublish" : "Approve & Publish"}
            </button>
          </div>
        </div>

        {/* studio launch banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-7 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> {data.label} · {data.units.length} units
            </span>
            <h2 className="text-2xl font-black mb-1">{data.book}</h2>
            <p className="text-indigo-50/90 text-sm font-medium">Run Studio mode to see exactly what students will see, slide by slide. When it looks good, Approve &amp; Publish.</p>
          </div>
          <button onClick={() => setStudioIndex(0)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-700 text-sm font-black shadow hover:scale-105 transition-transform shrink-0">
            <Play className="w-5 h-5" /> Launch Studio
          </button>
        </div>

        {/* unit review grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {data.units.map((u, i) => (
            <button key={u.id} onClick={() => setStudioIndex(i)}
              className="text-left group bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-300 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <span className="text-4xl">{u.emoji}</span>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500">{u.textbookRef.split("·").pop()?.trim()}</span>
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">{u.title}</h3>
              {u.titleTa && <p className={`text-sm font-bold ${ACCENT[u.color]} mt-0.5`}>{u.titleTa}</p>}
              <div className="mt-auto pt-4 flex items-center gap-3 text-[11px] font-bold text-slate-400">
                <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" />{u.objectives.length}</span>
                <span className="flex items-center gap-1"><Newspaper className="w-3.5 h-3.5" />{u.research.length + u.news.length}</span>
                <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{(ONLINE_RESEARCH[u.id] || []).length}</span>
                <span className="ml-auto flex items-center gap-1 text-indigo-500"><Play className="w-3.5 h-3.5" />Preview</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* STUDIO MODE — full-screen slide preview */}
      {studioIndex != null && data.units[studioIndex] && (
        <StudioSlide
          unit={data.units[studioIndex]}
          index={studioIndex}
          total={data.units.length}
          onPrev={() => setStudioIndex((n) => (n! > 0 ? n! - 1 : n))}
          onNext={() => setStudioIndex((n) => (n! < data.units.length - 1 ? n! + 1 : n))}
          onClose={() => setStudioIndex(null)}
        />
      )}
    </PortalLayout>
  );
}

function StudioSlide({ unit, index, total, onPrev, onNext, onClose }: {
  unit: ZoologyUnit; index: number; total: number; onPrev: () => void; onNext: () => void; onClose: () => void;
}) {
  const links = ONLINE_RESEARCH[unit.id] || [];
  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/95 flex flex-col">
      {/* top bar */}
      <div className="flex items-center justify-between px-6 py-4 text-white/90">
        <span className="text-xs font-black uppercase tracking-widest text-indigo-300">Studio Preview · Slide {index + 1} / {total}</span>
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20"><X className="w-5 h-5" /></button>
      </div>

      {/* slide body */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-10 pb-6">
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-5xl">{unit.emoji}</span>
            <div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 leading-tight">{unit.title}</h2>
              {unit.titleTa && <p className={`text-lg font-bold ${ACCENT[unit.color]}`}>{unit.titleTa}</p>}
              <p className="text-xs font-bold text-slate-400 mt-1">📘 {unit.textbookRef}</p>
            </div>
          </div>

          <h3 className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-200 mb-2"><Target className="w-4 h-4" /> Learning objectives</h3>
          <ul className="space-y-1.5 mb-6">
            {unit.objectives.map((o, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"><CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />{o}</li>
            ))}
          </ul>

          {unit.figure && (
            <figure className="rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-700 mb-6 bg-slate-50 dark:bg-slate-900">
              {unit.figure.src
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={unit.figure.src} alt={unit.figure.caption} className="w-full max-h-80 object-contain bg-white" />
                : <div className="py-8 text-center text-slate-400 text-xs font-bold">Diagram in textbook {unit.figure.page}</div>}
              <figcaption className="px-4 py-2 text-[11px] font-bold text-slate-500 border-t border-slate-100 dark:border-slate-700">{unit.figure.caption}</figcaption>
            </figure>
          )}

          <div className="space-y-3 mb-6">
            {unit.concepts.map((con, i) => (
              <div key={i}>
                <h4 className={`text-sm font-black ${ACCENT[unit.color]}`}>{con.heading}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{con.body}</p>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            <div className="bg-sky-50 dark:bg-slate-900 rounded-2xl p-4 border-2 border-sky-100 dark:border-slate-700">
              <h4 className="flex items-center gap-1.5 text-xs font-black text-sky-700 uppercase mb-2"><Sparkles className="w-3.5 h-3.5" /> Latest research</h4>
              {unit.research.map((r, i) => <p key={i} className="text-xs text-slate-600 dark:text-slate-300 mb-1"><b>{r.title}</b> ({r.year}) — {r.body}</p>)}
            </div>
            <div className="bg-amber-50 dark:bg-slate-900 rounded-2xl p-4 border-2 border-amber-100 dark:border-slate-700">
              <h4 className="flex items-center gap-1.5 text-xs font-black text-amber-700 uppercase mb-2"><Newspaper className="w-3.5 h-3.5" /> In the news</h4>
              {unit.news.map((n, i) => <p key={i} className="text-xs text-slate-600 dark:text-slate-300 mb-1"><b>{n.title}</b> — {n.body}</p>)}
            </div>
          </div>

          {links.length > 0 && (
            <div className="mb-2">
              <h4 className="flex items-center gap-1.5 text-xs font-black text-indigo-700 uppercase mb-2"><Globe className="w-3.5 h-3.5" /> Online research</h4>
              <div className="flex flex-wrap gap-2">
                {links.map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-slate-900 border border-indigo-100 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100">
                    {l.title} <span className="text-indigo-400">· {l.source}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* nav */}
      <div className="flex items-center justify-between px-6 py-4">
        <button onClick={onPrev} disabled={index === 0} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-bold disabled:opacity-30 hover:bg-white/20"><ChevronLeft className="w-4 h-4" /> Prev</button>
        <span className="text-white/60 text-xs font-bold">Use ← / → to move between units</span>
        <button onClick={onNext} disabled={index === total - 1} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-bold disabled:opacity-30 hover:bg-white/20">Next <ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
