/* eslint-disable @next/next/no-img-element */
"use client";

import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import html2canvas from "html2canvas";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface LangDetail {
  keyConcepts?: string[];
  realLifeConnections: string[];
  commonMisconceptions: string[];
  studentKeyPoints: string[];
}

interface UnitDetail {
  en: LangDetail | null;
  ta: LangDetail | null;
}

interface UnitInfo {
  id: string;
  name: string;
  unitNumber: number;
  isApproved: boolean;
  subject: {
    id: string;
    name: string;
    class: string;
    icon: string | null;
    color: string | null;
  };
}

type Lang = "en" | "ta";

const getSubjectIcon = (name: string): string => {
  const normalized = name.toLowerCase().trim();
  if (normalized.includes("tamil")) return "fi-sr-scroll";
  if (normalized.includes("english")) return "fi-sr-book";
  if (normalized.includes("math")) return "fi-sr-ruler-triangle";
  if (normalized.includes("science") && !normalized.includes("social")) return "fi-sr-flask";
  if (normalized.includes("social")) return "fi-sr-globe";
  if (normalized.includes("physics")) return "fi-sr-atom";
  if (normalized.includes("chemistry")) return "fi-sr-flask";
  if (normalized.includes("biology")) return "fi-sr-dna";
  if (normalized.includes("computer")) return "fi-sr-laptop";
  return "fi-sr-book"; // fallback
};

export default function StudentUnitDetailPage() {
  const params = useParams();
  const unitId = params.unitId as string;
  const { data: session, status: sessionStatus } = useSession();
  const schoolId = (session?.user as any)?.schoolId || "";
  const studentClass = (session?.user as any)?.class || "";
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [unit, setUnit] = useState<UnitInfo | null>(null);
  const [infographicUrl, setInfographicUrl] = useState<string | null>(null);
  const [detail, setDetail] = useState<UnitDetail | null>(null);
  const [lang, setLang] = useState<Lang>("en");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const captureRef = useRef<HTMLDivElement>(null);

  /* ── Data loading ──────────────────────────────────────────────────────── */

  useEffect(() => {
    if (sessionStatus === "loading") return;
    const loadUnit = async () => {
      setLoading(true);
      setError(null);
      try {
        const cleanClass = String(studentClass).match(/\d+/)?.[0] || String(studentClass);
        const url = `${API_URL}/api/centralized-content/units/${unitId}?schoolId=${encodeURIComponent(schoolId)}&forStudent=true&class=${cleanClass}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.success) {
          setUnit(json.data.unit);
          setInfographicUrl(json.data.infographic?.fileUrl || null);
          const raw = json.data.unitDetail;
          if (raw && raw.en) {
            setDetail({ en: raw.en, ta: raw.ta ?? null });
          } else if (raw) {
            setDetail({ en: raw, ta: null });
          } else {
            setDetail(null);
          }
        } else {
          setError(json.error || "This unit lesson guide is not published by your school for your grade standard yet.");
        }
      } catch {
        setError("Could not load this unit.");
      } finally {
        setLoading(false);
      }
    };

    loadUnit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId, schoolId, studentClass, sessionStatus]);

  /* ── JPG download ──────────────────────────────────────────────────────── */

  const handleDownload = useCallback(async () => {
    if (!captureRef.current || downloading) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const link = document.createElement("a");
      const safeName = (unit?.name || "unit").replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
      link.download = `${safeName}_unit${unit?.unitNumber || ""}_${lang}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.92);
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [downloading, unit, lang]);

  /* ── Derived ───────────────────────────────────────────────────────────── */

  const accent = unit?.subject.color || "#6366f1";
  const currentLangDetail: LangDetail | null = detail ? (detail[lang] ?? null) : null;
  const hasTamil = !!detail?.ta;

  /* ── Render ────────────────────────────────────────────────────────────── */

  return (
    <PortalLayout
      title="Unit Study Guide"
      subtitle="Visual summary and key points published for your class standard"
      avatarLetter="A"
      avatarColor="#6366f1"
      themeClass="theme-student"
      accentColor="#6366f1"
    >
      <Link
        href="/student/syllabus-board"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-black dark:hover:text-white mb-6 transition-colors"
      >
        <i className="fi fi-sr-arrow-left flex items-center text-xs" /> Back to Syllabus Board
      </Link>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-3" />
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider animate-pulse">
            Loading unit...
          </p>
        </div>
      ) : !unit ? (
        <div className="text-center p-12 glass rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
            {error || "Unit not found."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── Action bar: language toggle + download ── */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {lang === "en" ? "Language" : "மொழி"}
              </span>
              <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                {(["en", "ta"] as Lang[]).map((l) => {
                  const isActive = lang === l;
                  const disabled = l === "ta" && !hasTamil;
                  return (
                    <button
                      key={l}
                      onClick={() => !disabled && setLang(l)}
                      disabled={disabled}
                      title={disabled ? "Tamil not available for this unit" : undefined}
                      className={`px-4 py-2 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        isActive
                          ? "text-white"
                          : "text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                      style={isActive ? { background: `linear-gradient(135deg, ${accent}, ${accent}cc)` } : undefined}
                    >
                      {l === "en" ? "English" : "தமிழ்"}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={downloading || !currentLangDetail}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-sm bg-white dark:bg-slate-900/40"
            >
              {downloading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
                  {lang === "en" ? "Preparing..." : "தயாரிக்கிறது..."}
                </>
              ) : (
                <>
                  <i className="fi fi-sr-download flex items-center text-sm" />
                  {lang === "en" ? "Download JPG" : "JPG பதிவிறக்கம்"}
                </>
              )}
            </button>
          </div>

          {/* ── Capturable area ── */}
          <div ref={captureRef} className="bg-white rounded-3xl overflow-hidden">
            {/* Hero — infographic + unit header */}
            <div
              className="relative border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${accent}08 0%, transparent 55%)` }}
            >
              <div
                className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-15"
                style={{ background: accent }}
              />
              <div className="relative flex flex-col md:flex-row gap-6 p-6 items-start">
                {infographicUrl && (
                  <img
                    src={infographicUrl}
                    alt={unit.name}
                    className="w-full md:w-64 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <span
                    className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border mb-3"
                    style={{ background: `${accent}18`, borderColor: `${accent}44`, color: accent }}
                  >
                    <i className={`fi ${getSubjectIcon(unit.subject.name)} text-xs flex items-center`} />
                    <span>
                      {unit.subject.name} · Class {unit.subject.class} · Unit {unit.unitNumber}
                    </span>
                  </span>
                  <h2 className="text-2xl font-black text-black dark:text-white mb-2 leading-tight">
                    {unit.name}
                  </h2>
                  <p className="text-xs text-slate-500 max-w-xl">
                    {lang === "en"
                      ? "Study guide published by your teacher — key points, real-life examples, and things to think about."
                      : "உங்கள் ஆசிரியர் வெளியிட்ட படிப்பு வழிகாட்டி — முக்கிய குறிப்புகள், நிஜ வாழ்க்கை எடுத்துக்காட்டுகள்."}
                  </p>
                </div>
              </div>
            </div>

            {/* Content sections */}
            {!currentLangDetail ? (
              <div className="text-center p-14 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl mt-6">
                <i className="fi fi-sr-document text-4xl text-slate-350 dark:text-slate-600 block mb-3 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {lang === "ta"
                    ? "இந்த அலகிற்கு தமிழ் உள்ளடக்கம் இன்னும் கிடைக்கவில்லை."
                    : "Your teacher hasn't added study notes for this unit yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
                {/* Key Points */}
                {currentLangDetail.studentKeyPoints?.length > 0 && (
                  <SectionCard
                    iconClass="fi-sr-target"
                    title={lang === "en" ? "Key Points to Remember" : "நினைவில் கொள்ள வேண்டிய குறிப்புகள்"}
                    subtitle={lang === "en" ? "The most important takeaways from this unit" : "இந்த அலகின் மிக முக்கியமான குறிப்புகள்"}
                    gradientFrom={accent}
                  >
                    <ul className="space-y-2.5">
                      {currentLangDetail.studentKeyPoints.map((p, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
                          <span
                            className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0 shadow-sm"
                            style={{ background: accent }}
                          />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </SectionCard>
                )}

                {/* Real-life Connections */}
                {currentLangDetail.realLifeConnections?.length > 0 && (
                  <SectionCard
                    iconClass="fi-sr-globe"
                    title={lang === "en" ? "Where You'll See This in Real Life" : "நிஜ வாழ்க்கையில் எங்கு காண்பீர்கள்"}
                    subtitle={lang === "en" ? "Everyday examples that connect to this topic" : "இந்த தலைப்புடன் இணையும் அன்றாட எடுத்துக்காட்டுகள்"}
                    gradientFrom="#10b981"
                  >
                    <div className="space-y-2.5">
                      {currentLangDetail.realLifeConnections.map((p, i) => (
                        <div
                          key={i}
                          className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl p-3.5 border border-emerald-200/40 dark:border-emerald-800/30"
                        >
                          {p}
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {/* Think About It */}
                {currentLangDetail.commonMisconceptions?.length > 0 && (
                  <div className="lg:col-span-2">
                    <SectionCard
                      iconClass="fi-sr-comment-alt-question"
                      title={lang === "en" ? "Think About It..." : "சிந்தியுங்கள்..."}
                      subtitle={lang === "en" ? "Common questions and ideas to explore further" : "மேலும் ஆராய வேண்டிய பொதுவான கேள்விகள்"}
                      gradientFrom="#f59e0b"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {currentLangDetail.commonMisconceptions.map((p, i) => (
                          <div
                            key={i}
                            className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed border border-amber-300/40 bg-amber-50/50 dark:bg-amber-955/10 rounded-xl p-3.5"
                          >
                            {p}
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  </div>
                )}

                {/* Key Concepts (if available) */}
                {currentLangDetail.keyConcepts && currentLangDetail.keyConcepts.length > 0 && (
                  <div className="lg:col-span-2">
                    <SectionCard
                      iconClass="fi-sr-brain"
                      title={lang === "en" ? "Key Concepts" : "முคัญ கருத்துகள்"}
                      subtitle={lang === "en" ? "Core ideas to understand in this unit" : "இந்த அலகில் புரிந்துகொள்ள வேண்டிய அடிப்படை கருத்துகள்"}
                      gradientFrom="#8b5cf6"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {currentLangDetail.keyConcepts.map((p, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed bg-violet-50/50 dark:bg-violet-955/10 rounded-xl p-3 border border-violet-200/30 dark:border-violet-800/20">
                            <span className="mt-0.5 text-violet-500 font-bold text-xs">{i + 1}.</span>
                            {p}
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  </div>
                )}
              </div>
            )}

            {/* Footer watermark for download */}
            <div className="flex items-center justify-between px-6 py-4 mt-4 text-[10px] text-slate-450 border-t border-slate-100">
              <span>TN Schools AI Education Platform</span>
              <span>{unit.subject.name} · Class {unit.subject.class} · Unit {unit.unitNumber}: {unit.name}</span>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

/* ─── SectionCard ────────────────────────────────────────────────────────── */

function SectionCard({
  iconClass,
  title,
  subtitle,
  gradientFrom,
  children,
}: {
  iconClass: string;
  title: string;
  subtitle: string;
  gradientFrom: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-6 relative overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
        style={{ background: `linear-gradient(90deg, ${gradientFrom}, ${gradientFrom}55)` }}
      />
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 shadow-sm"
        style={{ background: `${gradientFrom}18`, border: `1px solid ${gradientFrom}33` }}
      >
        <i className={`fi ${iconClass} flex items-center text-sm`} style={{ color: gradientFrom }} />
      </div>
      <h3 className="text-sm font-black text-black dark:text-white mb-0.5">{title}</h3>
      <p className="text-[11px] text-slate-500 mb-4">{subtitle}</p>
      {children}
    </div>
  );
}
