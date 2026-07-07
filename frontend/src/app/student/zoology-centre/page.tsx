"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import {
  Dna,
  Leaf,
  Search,
  X,
  BookOpen,
  FlaskConical,
  Microscope,
  Target,
  Newspaper,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  ChevronRight,
  Bug,
  Globe,
} from "lucide-react";
import {
  ZOOLOGY_SYLLABUS,
  AVAILABLE_GRADES,
  ONLINE_RESEARCH,
  ZOO_APPROVAL_STATUS,
  resolveGrade,
  type ZoologyUnit,
} from "@/data/zoologySyllabus";

type Tab = "study" | "lab" | "explore";

type Specimen = {
  id: string;
  name: string;
  category: string;
  type?: string;
};

// Tailwind class sets per unit accent colour
const COLORS: Record<string, { chip: string; ring: string; bar: string; soft: string; text: string }> = {
  emerald: { chip: "bg-emerald-100 text-emerald-700", ring: "border-emerald-200 hover:border-emerald-400", bar: "bg-emerald-500", soft: "bg-emerald-50", text: "text-emerald-700" },
  purple: { chip: "bg-purple-100 text-purple-700", ring: "border-purple-200 hover:border-purple-400", bar: "bg-purple-500", soft: "bg-purple-50", text: "text-purple-700" },
  amber: { chip: "bg-amber-100 text-amber-700", ring: "border-amber-200 hover:border-amber-400", bar: "bg-amber-500", soft: "bg-amber-50", text: "text-amber-700" },
  sky: { chip: "bg-sky-100 text-sky-700", ring: "border-sky-200 hover:border-sky-400", bar: "bg-sky-500", soft: "bg-sky-50", text: "text-sky-700" },
  orange: { chip: "bg-orange-100 text-orange-700", ring: "border-orange-200 hover:border-orange-400", bar: "bg-orange-500", soft: "bg-orange-50", text: "text-orange-700" },
  rose: { chip: "bg-rose-100 text-rose-700", ring: "border-rose-200 hover:border-rose-400", bar: "bg-rose-500", soft: "bg-rose-50", text: "text-rose-700" },
};
const c = (k?: string) => COLORS[k || "emerald"] || COLORS.emerald;

export default function ZoologyCentrePage() {
  const { data: session } = useSession();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const schoolId = (session?.user as any)?.schoolId;

  const [tab, setTab] = useState<Tab>("study");
  const [grade, setGrade] = useState<number>(8);
  const [detected, setDetected] = useState<number | null>(null);
  const [openUnit, setOpenUnit] = useState<ZoologyUnit | null>(null);

  // --- detect the student's grade from their profile ---
  useEffect(() => {
    (async () => {
      try {
        if (!session?.user) return;
        const res = await fetch(`${API_URL}/api/students`);
        const json = await res.json();
        const list = json?.data || json;
        if (Array.isArray(list)) {
          const me = list.find((s: any) => s.userId === (session.user as any).id);
          if (me?.class != null) {
            const g = resolveGrade(me.class);
            setDetected(g);
            setGrade(g);
          }
        }
      } catch {
        /* fall back to manual switcher */
      }
    })();
  }, [session, API_URL]);

  const gradeData = ZOOLOGY_SYLLABUS[grade];

  // --- has a teacher approved (published) this grade? ---
  const [published, setPublished] = useState<boolean | null>(null);
  useEffect(() => {
    (async () => {
      try {
        if (!schoolId) { setPublished(true); return; }
        const res = await fetch(`${API_URL}/api/teacher/labs?schoolId=${schoolId}`);
        const json = await res.json();
        const ok = (json?.data || []).some(
          (r: any) => r.status === ZOO_APPROVAL_STATUS && Number(r.classRoomId) === grade
        );
        setPublished(ok);
      } catch {
        setPublished(true);
      }
    })();
  }, [schoolId, grade, API_URL]);

  // --- specimen explorer (existing behaviour, retained) ---
  const [specimens, setSpecimens] = useState<Specimen[]>([]);
  const [loadingSpec, setLoadingSpec] = useState(false);
  const [q, setQ] = useState("");
  const [sim, setSim] = useState(
    "https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_all.html"
  );

  const fetchSpecimens = useCallback(async () => {
    if (!schoolId) return;
    try {
      setLoadingSpec(true);
      const res = await fetch(`${API_URL}/api/teacher/labs?schoolId=${schoolId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSpecimens(
          data.data
            .filter((i: any) => i.status === "zoology-specimen")
            .map((i: any) => ({
              id: i.id,
              name: i.name,
              category: i.classRoomId || "Microbiology",
              type: i.classSection || "Live Prep",
            }))
        );
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingSpec(false);
    }
  }, [schoolId, API_URL]);

  useEffect(() => {
    if (tab === "explore") fetchSpecimens();
  }, [tab, fetchSpecimens]);

  const filteredSpecimens = specimens.filter(
    (s) => s.name.toLowerCase().includes(q.toLowerCase()) || s.category.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <PortalLayout
      title="Zoology Study Centre 🔬"
      subtitle="Learn the animal world — mapped to your class syllabus"
    >
      <div className="flex flex-col gap-6 text-left animate-in fade-in duration-300">

        {/* ---- Grade selector + tabs ---- */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border-2 border-slate-100 dark:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-2xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                {detected ? "Your class" : "Choose your class"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {(detected ? [detected] : AVAILABLE_GRADES).map((g) => (
                  <button
                    key={g}
                    onClick={() => !detected && setGrade(g)}
                    disabled={!!detected}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-black transition-all ${
                      grade === g
                        ? "bg-emerald-500 text-white shadow"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200"
                    } ${detected ? "cursor-default" : ""}`}
                  >
                    Class {g}
                    {detected === g && <span className="ml-1 text-[10px]">• your class</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
            {([
              ["study", "Study Units", <BookOpen key="a" className="w-4 h-4" />],
              ["lab", "Virtual Lab", <FlaskConical key="b" className="w-4 h-4" />],
              ["explore", "Specimens", <Microscope key="c" className="w-4 h-4" />],
            ] as [Tab, string, React.ReactNode][]).map(([key, label, icon]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  tab === key ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ============ STUDY UNITS ============ */}
        {tab === "study" && gradeData && (
          <>
            {/* teacher-voice intro banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-7 shadow-lg">
              <Leaf className="absolute right-6 top-1/2 -translate-y-1/2 w-40 h-40 opacity-10" />
              <div className="relative z-10 max-w-3xl">
                <span className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> {gradeData.label} · {gradeData.medium} medium
                </span>
                <h2 className="text-2xl font-black mb-2">{gradeData.book}</h2>
                <p className="text-emerald-50/90 text-sm font-medium leading-relaxed">{gradeData.intro}</p>
              </div>
            </div>

            {/* unit grid */}
            {published === false ? (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="text-5xl mb-3">🧑‍🏫</div>
                <h3 className="text-lg font-black text-slate-700 dark:text-slate-200">Your teacher is preparing this centre</h3>
                <p className="text-sm text-slate-400 font-medium mt-1">Class {grade} zoology lessons will appear here once your teacher approves them in Studio.</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {gradeData.units.map((u) => {
                const s = c(u.color);
                return (
                  <button
                    key={u.id}
                    onClick={() => setOpenUnit(u)}
                    className={`text-left group bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 ${s.ring} dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-4xl">{u.emoji}</span>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${s.chip}`}>{u.textbookRef.split("·").pop()?.trim()}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">{u.title}</h3>
                    {u.titleTa && <p className={`text-sm font-bold ${s.text} mt-0.5`}>{u.titleTa}</p>}
                    <p className="text-xs font-medium text-slate-400 mt-2 line-clamp-2">{u.concepts[0]?.body}</p>
                    <div className="mt-auto pt-4 flex items-center gap-3 text-[11px] font-bold text-slate-400">
                      <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" />{u.objectives.length} goals</span>
                      <span className="flex items-center gap-1"><Newspaper className="w-3.5 h-3.5" />{u.research.length + u.news.length} updates</span>
                      <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
            )}
          </>
        )}

        {/* ============ VIRTUAL LAB ============ */}
        {tab === "lab" && (
          <div className="bg-white dark:bg-slate-800 p-7 rounded-3xl shadow-sm border-2 border-emerald-100 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><Dna className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Virtual Biology Sandbox</h3>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">Run natural-selection, gene-expression and vision experiments live.</p>
                </div>
              </div>
              <select
                value={sim}
                onChange={(e) => setSim(e.target.value)}
                className="w-full sm:w-72 bg-slate-50 dark:bg-slate-900 border-2 border-emerald-100 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-3 py-2.5 text-xs font-black"
              >
                <option value="https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_all.html">🐰 Natural Selection (Evolution)</option>
                <option value="https://phet.colorado.edu/sims/html/gene-expression-essentials/latest/gene-expression-essentials_all.html">🧬 Gene Expression Essentials</option>
                <option value="https://phet.colorado.edu/sims/html/color-vision/latest/color-vision_all.html">👁️ Color Vision Experiment</option>
              </select>
            </div>
            <div className="rounded-2xl border-2 border-slate-100 dark:border-slate-900 overflow-hidden bg-slate-950 aspect-[16/9] w-full">
              <iframe src={sim} className="w-full h-full border-none" allowFullScreen title="Biology Simulation" />
            </div>
          </div>
        )}

        {/* ============ SPECIMEN EXPLORER ============ */}
        {tab === "explore" && (
          <div className="bg-white dark:bg-slate-800 p-7 rounded-3xl shadow-sm border-2 border-emerald-100 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><Bug className="w-6 h-6" /></div>
                Lab Specimen Collection
              </h3>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search specimens…"
                  className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-emerald-100 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-2.5 pl-11 pr-4 text-sm font-bold"
                />
              </div>
            </div>
            {loadingSpec ? (
              <div className="text-center py-16 text-slate-400 text-xs font-bold">Loading specimens…</div>
            ) : filteredSpecimens.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSpecimens.map((sp) => (
                  <div key={sp.id} className="p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40">
                    <p className="text-[10px] font-black text-slate-400 uppercase">{sp.category}</p>
                    <h4 className="text-base font-black text-slate-800 dark:text-slate-100 mt-1">{sp.name}</h4>
                    <span className="inline-block mt-3 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">{sp.type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-sm font-bold bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                No specimens catalogued for your school yet. Ask your teacher to add lab specimens. 🦋
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============ UNIT STUDY MODAL ============ */}
      {openUnit && <UnitStudyView unit={openUnit} onClose={() => setOpenUnit(null)} />}
    </PortalLayout>
  );
}

// ---------------------------------------------------------------------------
// Unit study view — objectives, concepts, figure, research, news, glossary, quiz
// ---------------------------------------------------------------------------
function UnitStudyView({ unit, onClose }: { unit: ZoologyUnit; onClose: () => void }) {
  const s = c(unit.color);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-3xl my-6 shadow-2xl animate-in zoom-in-95 relative">
        {/* header */}
        <div className={`sticky top-0 z-20 rounded-t-3xl px-7 py-5 ${s.soft} dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-700 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{unit.emoji}</span>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">{unit.title}</h3>
              {unit.titleTa && <p className={`text-sm font-bold ${s.text}`}>{unit.titleTa}</p>}
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">📘 {unit.textbookRef}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-700 rounded-full text-slate-500 hover:text-slate-800 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-7 flex flex-col gap-6">
          {/* objectives */}
          <section>
            <h4 className="flex items-center gap-2 text-sm font-black text-slate-800 dark:text-slate-100 mb-3">
              <Target className={`w-4 h-4 ${s.text}`} /> What you&apos;ll be able to do
            </h4>
            <ul className="space-y-2">
              {unit.objectives.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${s.text}`} /> {o}
                </li>
              ))}
            </ul>
          </section>

          {/* figure */}
          {unit.figure && (
            <figure className={`rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-700 ${s.soft} dark:bg-slate-900`}>
              {unit.figure.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={unit.figure.src} alt={unit.figure.caption} className="w-full max-h-96 object-contain bg-white" />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <Microscope className="w-10 h-10 mb-2" />
                  <span className="text-xs font-bold">Diagram in textbook {unit.figure.page}</span>
                </div>
              )}
              <figcaption className="px-4 py-2.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 border-t-2 border-slate-100 dark:border-slate-700">
                {unit.figure.caption}
              </figcaption>
            </figure>
          )}

          {/* concepts */}
          <section className="space-y-4">
            {unit.concepts.map((con, i) => (
              <div key={i}>
                <h5 className={`text-sm font-black ${s.text} mb-1`}>{con.heading}</h5>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{con.body}</p>
              </div>
            ))}
          </section>

          {/* research + news */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section className="bg-sky-50 dark:bg-slate-900 rounded-2xl p-4 border-2 border-sky-100 dark:border-slate-700">
              <h4 className="flex items-center gap-2 text-xs font-black text-sky-700 uppercase tracking-wider mb-3">
                <Sparkles className="w-4 h-4" /> Latest research
              </h4>
              <div className="space-y-3">
                {unit.research.map((r, i) => (
                  <div key={i}>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100">{r.title} <span className="text-[10px] font-bold text-sky-500">· {r.year}</span></p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{r.body}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="bg-amber-50 dark:bg-slate-900 rounded-2xl p-4 border-2 border-amber-100 dark:border-slate-700">
              <h4 className="flex items-center gap-2 text-xs font-black text-amber-700 uppercase tracking-wider mb-3">
                <Newspaper className="w-4 h-4" /> In the news
              </h4>
              <div className="space-y-3">
                {unit.news.map((n, i) => (
                  <div key={i}>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100">{n.title} <span className="text-[10px] font-bold text-amber-600">· {n.tag}</span></p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{n.body}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* online research */}
          {(ONLINE_RESEARCH[unit.id] || []).length > 0 && (
            <section>
              <h4 className="flex items-center gap-2 text-sm font-black text-slate-800 dark:text-slate-100 mb-3">
                <Globe className="w-4 h-4 text-indigo-500" /> Explore online
              </h4>
              <div className="flex flex-wrap gap-2">
                {(ONLINE_RESEARCH[unit.id] || []).map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-slate-900 border border-indigo-100 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100">
                    {l.title} <span className="text-indigo-400">· {l.source}</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* glossary */}
          <section>
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-3">Key words / கலைச்சொற்கள்</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {unit.glossary.map((g, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-900 rounded-xl px-3 py-2 border border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                    {g.term}{g.ta && <span className={`ml-1 text-xs font-bold ${s.text}`}>· {g.ta}</span>}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{g.def}</p>
                </div>
              ))}
            </div>
          </section>

          {/* self-check quiz */}
          <section className={`rounded-2xl p-5 ${s.soft} dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700`}>
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-4">✅ Quick self-check</h4>
            <div className="space-y-5">
              {unit.quiz.map((quiz, qi) => {
                const chosen = answers[qi];
                return (
                  <div key={qi}>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">{qi + 1}. {quiz.q}</p>
                    <div className="flex flex-wrap gap-2">
                      {quiz.options.map((opt, oi) => {
                        const answered = chosen != null;
                        const correct = oi === quiz.answer;
                        const state = !answered
                          ? "bg-white dark:bg-slate-800 text-slate-600 border-slate-200 hover:border-slate-400"
                          : correct
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : oi === chosen
                          ? "bg-rose-500 text-white border-rose-500"
                          : "bg-white dark:bg-slate-800 text-slate-400 border-slate-200";
                        return (
                          <button
                            key={oi}
                            disabled={answered}
                            onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${state}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {chosen != null && (
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-500 shrink-0" /> {quiz.explain}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
