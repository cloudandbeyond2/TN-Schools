"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { Leaf, Target, Sparkles, Newspaper, CheckCircle2, ChevronRight, X, Microscope } from "lucide-react";
import { BOTANY_SYLLABUS, BOTANY_GRADES, resolveGrade, type BotanyUnit } from "@/data/botanySyllabus";

const C: Record<string, { chip: string; ring: string; soft: string; text: string }> = {
  lime: { chip: "bg-lime-100 text-lime-700", ring: "border-lime-200 hover:border-lime-400", soft: "bg-lime-50", text: "text-lime-700" },
  sky: { chip: "bg-sky-100 text-sky-700", ring: "border-sky-200 hover:border-sky-400", soft: "bg-sky-50", text: "text-sky-700" },
  amber: { chip: "bg-amber-100 text-amber-700", ring: "border-amber-200 hover:border-amber-400", soft: "bg-amber-50", text: "text-amber-700" },
  emerald: { chip: "bg-emerald-100 text-emerald-700", ring: "border-emerald-200 hover:border-emerald-400", soft: "bg-emerald-50", text: "text-emerald-700" },
  purple: { chip: "bg-purple-100 text-purple-700", ring: "border-purple-200 hover:border-purple-400", soft: "bg-purple-50", text: "text-purple-700" },
  rose: { chip: "bg-rose-100 text-rose-700", ring: "border-rose-200 hover:border-rose-400", soft: "bg-rose-50", text: "text-rose-700" },
  orange: { chip: "bg-orange-100 text-orange-700", ring: "border-orange-200 hover:border-orange-400", soft: "bg-orange-50", text: "text-orange-700" },
};
const col = (k?: string) => C[k || "lime"] || C.lime;

export default function BotanyCentrePage() {
  const { data: session } = useSession();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const [grade, setGrade] = useState(8);
  const [detected, setDetected] = useState<number | null>(null);
  const [open, setOpen] = useState<BotanyUnit | null>(null);
  const [lang, setLang] = useState<"EN" | "TA">("EN");
  const [isLoading, setIsLoading] = useState(true);

  const t = (bilingualText: string) => {
    if (!bilingualText) return "";
    const pipeParts = bilingualText.split(/\s*\|\s*/);
    if (pipeParts.length > 1) {
      return lang === "EN" ? pipeParts[0].trim() : pipeParts[1].trim();
    }
    const slashParts = bilingualText.split(/\s*\/\s*/);
    if (slashParts.length > 1) {
      return lang === "EN" ? slashParts[0].trim() : slashParts[1].trim();
    }
    return bilingualText;
  };

  useEffect(() => {
    (async () => {
      try {
        if (!session?.user) {
          setIsLoading(false);
          return;
        }
        const res = await fetch(`${API_URL}/api/students`);
        const json = await res.json();
        const list = json?.data || json;
        if (Array.isArray(list)) {
          const me = list.find((s: any) => s.userId === (session.user as any).id);
          if (me?.class != null) { const g = resolveGrade(me.class); setDetected(g); setGrade(g); }
        }
      } catch { /* ignore */ } finally {
        setIsLoading(false);
      }
    })();
  }, [session, API_URL]);

  const data = BOTANY_SYLLABUS[grade];

  if (isLoading) {
    return (
      <PortalLayout title="Botany Centre 🌿" subtitle="Loading...">
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500"></div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout 
      title={lang === "EN" ? "Botany Centre 🌿" : "தாவரவியல் மையம் 🌿"} 
      subtitle={lang === "EN" ? "The plant world — mapped to your class syllabus" : "தாவர உலகம் - உங்கள் வகுப்புப் பாடத்திட்டத்துடன் இணைக்கப்பட்டுள்ளது"}
    >
      <div className="flex flex-col gap-6 text-left">
        {/* Language Toggle */}
        <div className="flex justify-end">
          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50 w-fit">
            <button
              onClick={() => setLang("EN")}
              className={`px-3.5 py-1 rounded-lg text-xs font-black transition-all ${lang === "EN" ? "bg-white dark:bg-slate-800 text-indigo-600 shadow" : "text-slate-500 hover:text-slate-800"}`}
            >
              English
            </button>
            <button
              onClick={() => setLang("TA")}
              className={`px-3.5 py-1 rounded-lg text-xs font-black transition-all ${lang === "TA" ? "bg-white dark:bg-slate-800 text-indigo-600 shadow" : "text-slate-500 hover:text-slate-800"}`}
            >
              தமிழ்
            </button>
          </div>
        </div>

        {/* grade lock */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border-2 border-slate-100 dark:border-slate-700 flex items-center gap-3">
          <div className="p-2.5 bg-lime-100 text-lime-600 rounded-2xl"><Leaf className="w-6 h-6" /></div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              {detected 
                ? (lang === "EN" ? "Your class" : "உங்களது வகுப்பு") 
                : (lang === "EN" ? "Choose your class" : "வகுப்பைத் தேர்ந்தெடுக்கவும்")}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {(detected ? [detected] : BOTANY_GRADES).map((g) => (
                <button key={g} onClick={() => !detected && setGrade(g)} disabled={!!detected}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-black transition-all ${grade === g ? "bg-lime-500 text-white shadow" : "bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200"} ${detected ? "cursor-default" : ""}`}>
                  {lang === "EN" ? `Class ${g}` : `${g}ஆம் வகுப்பு`}
                  {detected === g && <span className="ml-1 text-[10px]">· {lang === "EN" ? "your class" : "உங்களது வகுப்பு"}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* intro */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-lime-600 to-green-700 text-white p-7 shadow-lg">
          <Leaf className="absolute right-6 top-1/2 -translate-y-1/2 w-40 h-40 opacity-10" />
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> {t(data.label)} · {data.medium === "Tamil" ? (lang === "EN" ? "Tamil" : "தமிழ்") : (lang === "EN" ? "English" : "ஆங்கிலம்")} {lang === "EN" ? "medium" : "வழி"}
            </span>
            <h2 className="text-2xl font-black mb-2">{t(data.book)}</h2>
            <p className="text-lime-50/90 text-sm font-medium leading-relaxed">{t(data.intro)}</p>
          </div>
        </div>

        {/* units */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {data.units.map((u) => {
            const s = col(u.color);
            return (
              <button key={u.id} onClick={() => setOpen(u)}
                className={`text-left group bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 ${s.ring} dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col`}>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{u.emoji}</span>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${s.chip}`}>{t(u.textbookRef).split("·").pop()?.trim()}</span>
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">{t(u.title)}</h3>
                <p className="text-xs font-medium text-slate-400 mt-2 line-clamp-2">{t(u.concepts[0]?.body)}</p>
                <div className="mt-auto pt-4 flex items-center gap-3 text-[11px] font-bold text-slate-400">
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" />
                    {lang === "EN" ? `${u.objectives.length} goals` : `${u.objectives.length} இலக்குகள்`}
                  </span>
                  <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {open && <BotanyStudy lang={lang} unit={open} onClose={() => setOpen(null)} />}
    </PortalLayout>
  );
}

function BotanyStudy({ lang, unit, onClose }: { lang: "EN" | "TA"; unit: BotanyUnit; onClose: () => void }) {
  const s = col(unit.color);
  const [ans, setAns] = useState<Record<number, number>>({});

  const t = (bilingualText: string) => {
    if (!bilingualText) return "";
    const pipeParts = bilingualText.split(/\s*\|\s*/);
    if (pipeParts.length > 1) {
      return lang === "EN" ? pipeParts[0].trim() : pipeParts[1].trim();
    }
    const slashParts = bilingualText.split(/\s*\/\s*/);
    if (slashParts.length > 1) {
      return lang === "EN" ? slashParts[0].trim() : slashParts[1].trim();
    }
    return bilingualText;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-3xl my-6 shadow-2xl">
        <div className={`sticky top-0 z-20 rounded-t-3xl px-7 py-5 ${s.soft} dark:bg-slate-900 border-b-2 border-slate-100 dark:border-slate-700 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{unit.emoji}</span>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">{t(unit.title)}</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">📘 {t(unit.textbookRef)}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-white dark:bg-slate-700 rounded-full text-slate-500 hover:text-slate-800 shadow-sm"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-7 flex flex-col gap-6 text-left">
          <section>
            <h4 className="flex items-center gap-2 text-sm font-black text-slate-800 dark:text-slate-100 mb-3">
              <Target className={`w-4 h-4 ${s.text}`} /> 
              {lang === "EN" ? "What you'll be able to do" : "உங்களால் என்ன செய்ய முடியும் (கற்றல் விளைவுகள்)"}
            </h4>
            <ul className="space-y-2">
              {unit.objectives.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-350 font-medium">
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${s.text}`} />
                  {t(o)}
                </li>
              ))}
            </ul>
          </section>
          {unit.figure && (
            <figure className={`rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-700 ${s.soft} dark:bg-slate-900`}>
              {unit.figure.src
                ? <img src={unit.figure.src} alt={t(unit.figure.caption)} className="w-full max-h-96 object-contain bg-white" />
                : <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <Microscope className="w-10 h-10 mb-2" />
                    <span className="text-xs font-bold">{lang === "EN" ? `Diagram in textbook ${unit.figure.page}` : `பாடப்புத்தகம் பக்கம் ${unit.figure.page}-ல் உள்ள வரைபடம்`}</span>
                  </div>}
              <figcaption className="px-4 py-2.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 border-t-2 border-slate-100 dark:border-slate-700">{t(unit.figure.caption)}</figcaption>
            </figure>
          )}
          <section className="space-y-4">
            {unit.concepts.map((c2, i) => (
              <div key={i}>
                <h5 className={`text-sm font-black ${s.text} mb-1`}>{t(c2.heading)}</h5>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{t(c2.body)}</p>
              </div>
            ))}
          </section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section className="bg-sky-50 dark:bg-slate-900 rounded-2xl p-4 border-2 border-sky-100 dark:border-slate-700">
              <h4 className="flex items-center gap-2 text-xs font-black text-sky-700 uppercase tracking-wider mb-3">
                <Sparkles className="w-4 h-4" /> {lang === "EN" ? "Latest research" : "சமீபத்திய ஆராய்ச்சிகள்"}
              </h4>
              {unit.research.map((r, i) => (
                <p key={i} className="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                  <b>{t(r.title)}</b> ({r.year}) — {t(r.body)}
                </p>
              ))}
            </section>
            <section className="bg-amber-50 dark:bg-slate-900 rounded-2xl p-4 border-2 border-amber-100 dark:border-slate-700">
              <h4 className="flex items-center gap-2 text-xs font-black text-amber-700 uppercase tracking-wider mb-3">
                <Newspaper className="w-4 h-4" /> {lang === "EN" ? "In the news" : "செய்திகளில் இன்று"}
              </h4>
              {unit.news.map((n, i) => (
                <p key={i} className="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed font-medium">
                  <b>{t(n.title)}</b> — {t(n.body)}
                </p>
              ))}
            </section>
          </div>
          <section>
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-3">{lang === "EN" ? "Key words / Glossary" : "கலைச்சொற்கள் (விளக்கம்)"}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {unit.glossary.map((g, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-900 rounded-xl px-3 py-2 border border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-black text-slate-700 dark:text-slate-200">{t(g.term)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{t(g.def)}</p>
                </div>
              ))}
            </div>
          </section>
          <section className={`rounded-2xl p-5 ${s.soft} dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700`}>
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-4">
              {lang === "EN" ? "✅ Quick self-check" : "✅ விரைவு சுய-சரிபார்ப்பு"}
            </h4>
            <div className="space-y-5">
              {unit.quiz.map((quiz, qi) => {
                const chosen = ans[qi];
                return (
                  <div key={qi}>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">{qi + 1}. {t(quiz.q)}</p>
                    <div className="flex flex-wrap gap-2">
                      {quiz.options.map((opt, oi) => {
                        const answered = chosen != null;
                        const correct = oi === quiz.answer;
                        const st = !answered ? "bg-white dark:bg-slate-800 text-slate-600 border-slate-200 hover:border-slate-400"
                          : correct ? "bg-emerald-500 text-white border-emerald-500"
                          : oi === chosen ? "bg-rose-500 text-white border-rose-500"
                          : "bg-white dark:bg-slate-800 text-slate-400 border-slate-200";
                        return (
                          <button
                            key={oi}
                            disabled={answered}
                            onClick={() => setAns((a) => ({ ...a, [qi]: oi }))}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${st}`}
                          >
                            {t(opt)}
                          </button>
                        );
                      })}
                    </div>
                    {chosen != null && (
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-500 shrink-0" />
                        {t(quiz.explain)}
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
