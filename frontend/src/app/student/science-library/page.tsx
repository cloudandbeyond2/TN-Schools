"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import PortalLayout from "@/components/PortalLayout";
import { BookOpen, Search, ExternalLink, Filter, Layers, ChevronRight } from "lucide-react";
import { SCIENCE_BOOKS, ALL_CLASSES, ALL_SUBJECTS, TN_BOOKS_SOURCE, type ScienceBook } from "@/data/scienceLibrary";

const SUBJECT_COLOR: Record<string, string> = {
  Science: "bg-emerald-100 text-emerald-700",
  Physics: "bg-sky-100 text-sky-700",
  Chemistry: "bg-orange-100 text-orange-700",
  "Bio-Botany": "bg-lime-100 text-lime-700",
  "Bio-Zoology": "bg-purple-100 text-purple-700",
};

export default function ScienceLibraryPage() {
  const [cls, setCls] = useState<number | "all">("all");
  const [medium, setMedium] = useState<"all" | "Tamil" | "English">("all");
  const [subject, setSubject] = useState<string>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<ScienceBook | null>(null);

  const books = useMemo(
    () =>
      SCIENCE_BOOKS.filter(
        (b) =>
          (cls === "all" || b.class === cls) &&
          (medium === "all" || b.medium === medium) &&
          (subject === "all" || b.subject === subject) &&
          (q === "" ||
            `${b.subject} ${b.class} ${b.medium}`.toLowerCase().includes(q.toLowerCase()) ||
            (b.chapters || []).some((c) => c.toLowerCase().includes(q.toLowerCase())))
      ),
    [cls, medium, subject, q]
  );

  return (
    <PortalLayout title="Science Book Library 📚" subtitle="All Tamil Nadu Government science books · Class 6-12 · Tamil & English">
      <div className="flex flex-col gap-5 text-left">

        {/* filter bar */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border-2 border-slate-100 dark:border-slate-700 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search books or chapters…"
              className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl py-2.5 pl-11 pr-4 text-sm font-bold text-slate-800 dark:text-white" />
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select value={cls} onChange={(e) => setCls(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-black text-slate-700 dark:text-white">
                <option value="all">All classes</option>
                {ALL_CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
            <select value={medium} onChange={(e) => setMedium(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-black text-slate-700 dark:text-white">
              <option value="all">Both media</option>
              <option value="Tamil">Tamil Medium</option>
              <option value="English">English Medium</option>
            </select>
            <select value={subject} onChange={(e) => setSubject(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-black text-slate-700 dark:text-white">
              <option value="all">All subjects</option>
              {ALL_SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="ml-auto text-xs font-black text-slate-400">{books.length} books</span>
          </div>
        </div>

        {/* book grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {books.map((b) => (
            <button key={b.id} onClick={() => setOpen(b)}
              className="text-left group bg-white dark:bg-slate-800 rounded-2xl p-5 border-2 border-slate-100 dark:border-slate-700 hover:border-sky-300 hover:-translate-y-1 hover:shadow-lg transition-all flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow"><BookOpen className="w-5 h-5" /></div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${SUBJECT_COLOR[b.subject] || "bg-slate-100 text-slate-600"}`}>{b.subject}</span>
              </div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight">Class {b.class} · {b.subject}</h3>
              <p className="text-xs font-bold text-slate-400 mt-0.5">{b.medium} Medium · {b.year}</p>
              {b.chapters && <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1"><Layers className="w-3 h-3" />{b.chapters.length} chapters</p>}
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-black text-sky-600">Open <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /></span>
            </button>
          ))}
        </div>
      </div>

      {/* book detail drawer */}
      {open && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setOpen(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl my-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-7 border-b-2 border-slate-100 dark:border-slate-700 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow"><BookOpen className="w-7 h-7" /></div>
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Class {open.class} · {open.subject}</h2>
                <p className="text-xs font-bold text-slate-400">{open.medium} Medium · Samacheer Kalvi {open.year}</p>
              </div>
            </div>
            <div className="p-7">
              <div className="flex flex-wrap gap-2 mb-5">
                <a href={open.pdfUrl || open.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-black hover:bg-sky-600">
                  <BookOpen className="w-4 h-4" /> Read / Download PDF <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              {open.chapters ? (
                <>
                  <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 mb-3">Chapters — open the Learning Hub</h3>
                  <div className="space-y-2">
                    {open.chapters.map((ch, i) => (
                      <Link key={i}
                        href={`/student/chapter-hub?class=${open.class}&subject=${encodeURIComponent(open.subject)}&medium=${open.medium}&chapter=${encodeURIComponent(ch)}`}
                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 hover:border-sky-300 transition-all">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{i + 1}. {ch}</span>
                        <ChevronRight className="w-4 h-4 text-sky-500" />
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400 font-medium">Chapter list for this book will appear here once imported. Use the PDF link above to read it now.</p>
              )}
              <p className="text-[11px] text-slate-400 mt-5">Source: official Tamil Nadu textbooks portal ({TN_BOOKS_SOURCE}).</p>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
