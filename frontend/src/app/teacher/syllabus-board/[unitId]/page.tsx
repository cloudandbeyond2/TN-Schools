"use client";

import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface TeachingStep {
  step: string;
  minutes: number;
  description: string;
}

interface LangDetail {
  keyConcepts: string[];
  realLifeConnections: string[];
  commonMisconceptions: string[];
  teachingFlow: TeachingStep[];
  teacherScript: string;
  studentKeyPoints: string[];
}

/** Bilingual shape returned by the backend */
interface UnitDetail {
  en: LangDetail;
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

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function TeacherUnitDetailPage() {
  const params = useParams();
  const unitId = params.unitId as string;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [unit, setUnit] = useState<UnitInfo | null>(null);
  const [infographicUrl, setInfographicUrl] = useState<string | null>(null);
  const [detail, setDetail] = useState<UnitDetail | null>(null);
  const [lang, setLang] = useState<Lang>("en");

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  /* ── Data loading ──────────────────────────────────────────────────────── */

  const loadUnit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/units/${unitId}`);
      const json = await res.json();
      if (json.success) {
        setUnit(json.data.unit);
        setInfographicUrl(json.data.infographic?.fileUrl || null);
        const raw = json.data.unitDetail;
        // Normalize: old flat records (no .en key) get wrapped
        if (raw && !raw.en) {
          setDetail({ en: raw, ta: null });
        } else {
          setDetail(raw ?? null);
        }
      } else {
        setError(json.error || "Unit not found");
      }
    } catch {
      setError("Could not load this unit.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  /* ── AI generation ─────────────────────────────────────────────────────── */

  const handleGenerate = async (regenerate: boolean) => {
    setGenerating(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(
        `${API_URL}/api/centralized-content/units/${unitId}/generate-detail`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ regenerate }),
        }
      );
      const json = await res.json();
      if (json.success) {
        const raw = json.data;
        if (raw && !raw.en) {
          setDetail({ en: raw, ta: null });
        } else {
          setDetail(raw ?? null);
        }
        setSuccessMsg(
          regenerate
            ? "Regenerated in English & Tamil "
            : "AI lesson insights generated in English & Tamil "
        );
      } else {
        setError(json.error || "AI generation failed.");
      }
    } catch {
      setError("AI generation failed. Check that the backend and GEMINI_API_KEY are configured.");
    } finally {
      setGenerating(false);
    }
  };

  /* ── Approve / Publish ─────────────────────────────────────────────────── */

  const handleApprove = async (isApproved: boolean) => {
    if (!detail) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_URL}/api/centralized-content/units/${unitId}/approve`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isApproved, editedDetail: detail }),
        }
      );
      const json = await res.json();
      if (json.success) {
        setUnit((prev) => (prev ? { ...prev, isApproved } : prev));
        setSuccessMsg(isApproved ? "Published to students!" : "Unpublished.");
      } else {
        setError(json.error || "Could not update approval status.");
      }
    } catch {
      setError("Could not update approval status.");
    } finally {
      setSaving(false);
    }
  };

  /* ── In-place editing helpers ──────────────────────────────────────────── */

  const activeLang: LangDetail | null = detail ? (detail[lang] ?? null) : null;

  const updateLangList = (
    field: "keyConcepts" | "realLifeConnections" | "commonMisconceptions" | "studentKeyPoints",
    index: number,
    value: string
  ) => {
    if (!detail || !activeLang) return;
    const updated: LangDetail = {
      ...activeLang,
      [field]: activeLang[field].map((v, i) => (i === index ? value : v)),
    };
    setDetail({ ...detail, [lang]: updated });
  };

  const updateFlowStep = (index: number, key: keyof TeachingStep, value: string | number) => {
    if (!detail || !activeLang) return;
    const updated: LangDetail = {
      ...activeLang,
      teachingFlow: activeLang.teachingFlow.map((s, i) =>
        i === index ? { ...s, [key]: value } : s
      ),
    };
    setDetail({ ...detail, [lang]: updated });
  };

  const updateScript = (value: string) => {
    if (!detail || !activeLang) return;
    setDetail({ ...detail, [lang]: { ...activeLang, teacherScript: value } });
  };

  /* ── Derived ───────────────────────────────────────────────────────────── */

  const accent = unit?.subject.color || "#f59e0b";
  const hasTamil = !!detail?.ta;

  /* ── Render ────────────────────────────────────────────────────────────── */

  return (
    <PortalLayout
      title="Unit Lesson Insights"
      subtitle="AI-assisted bilingual planning — English & Tamil"
      avatarLetter="S"
      avatarColor="#f59e0b"
      themeClass="theme-teacher"
      accentColor="#f59e0b"
    >
      <Link
        href="/teacher/syllabus-board"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-black dark:hover:text-white mb-6 transition-colors"
      >
        <i className="fi fi-rr-arrow-left"></i> Back to Syllabus Board
      </Link>

      {/* ── Loading ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin mb-3" />
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider animate-pulse">
            Loading unit...
          </p>
        </div>
      ) : !unit ? (
        <div className="text-center p-12 glass rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center w-full">
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
            {error || "Unit not found."}
          </p>
        </div>
      ) : (
        <div className="space-y-6 w-full">

          {/* ── Hero header ── */}
          <div
            className="relative rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900/30 w-full"
            style={{ background: `linear-gradient(135deg, ${accent}10 0%, transparent 55%)` }}
          >
            {/* Decorative orb */}
            <div
              className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-20"
              style={{ background: accent }}
            />
            <div className="relative flex flex-col md:flex-row gap-6 p-6 items-start">
              {infographicUrl && (
                <img
                  src={infographicUrl}
                  alt={unit.name}
                  className="w-full md:w-72 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span
                    className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border"
                    style={{
                      background: `${accent}18`,
                      borderColor: `${accent}44`,
                      color: accent,
                    }}
                  >
                    {unit.subject.icon || ""} {unit.subject.name} · Class {unit.subject.class} · Unit {unit.unitNumber}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg ${
                      unit.isApproved
                        ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                        : "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {unit.isApproved ? <><i className="fi fi-rr-check-circle inline mr-1"></i> Published to Students</> : " Draft"}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-black dark:text-white mb-2 leading-tight">
                  {unit.name}
                </h2>
                <p className="text-xs text-slate-500 max-w-xl mb-5">
                  Generate bilingual AI lesson insights, tweak anything, then publish — students see a simplified version on their own syllabus board.
                </p>

                <div className="flex flex-wrap gap-2 w-full">
                  <button
                    onClick={() => handleGenerate(!!detail)}
                    disabled={generating}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                    style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
                  >
                    {generating
                      ? " Generating..."
                      : detail
                      ? " Regenerate (EN + தமிழ்)"
                      : " Generate AI Insights (EN + தமிழ்)"}
                  </button>

                  {detail && (
                    <button
                      onClick={() => handleApprove(!unit.isApproved)}
                      disabled={saving}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-60 active:scale-95 flex items-center gap-1 ${
                        unit.isApproved
                          ? "border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                      }`}
                    >
                      {saving ? "Saving..." : unit.isApproved ? "Unpublish" : <><i className="fi fi-rr-check-circle inline"></i> Approve & Publish</>}
                    </button>
                  )}
                </div>

                {error && (
                  <p className="text-xs text-rose-600 mt-3 font-semibold"><i className="fi fi-rr-triangle-warning inline mr-1 text-amber-500"></i> {error}</p>
                )}
                {successMsg && (
                  <p className="text-xs text-emerald-600 mt-3 font-semibold">{successMsg}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Generating spinner ── */}
          {generating && (
            <div className="flex flex-col items-center justify-center w-full py-12 glass rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
              <div
                className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-4"
                style={{ borderColor: `${accent}44`, borderTopColor: accent }}
              />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 text-center px-4">
                Generating bilingual insights with Gemini…
              </p>
              <p className="text-xs text-slate-500 mt-1 text-center px-4">
                English & Tamil in one call — this takes 10–20 seconds.
              </p>
            </div>
          )}

          {/* ── Empty state ── */}
          {!detail && !generating && (
            <div className="text-center w-full flex flex-col items-center justify-center p-14 glass rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
              <span className="text-5xl block mb-4"><i className="fi fi-rr-user inline mr-1 text-indigo-500"></i></span>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No lesson insights yet for this unit.
              </p>
              <p className="text-xs text-slate-500 mt-2 px-4">
                Click &quot;Generate AI Insights&quot; above — Gemini will produce English &amp; Tamil in one call.
              </p>
            </div>
          )}

          {/* ── Insights panel ── */}
          {detail && !generating && (
            <div className="w-full flex flex-col gap-6">
              {/* Language toggle */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Language
                </span>
                <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm w-full sm:w-auto">
                  {(["en", "ta"] as Lang[]).map((l) => {
                    const isActive = lang === l;
                    const disabled = l === "ta" && !hasTamil;
                    return (
                      <button
                        key={l}
                        onClick={() => !disabled && setLang(l)}
                        disabled={disabled}
                        title={
                          disabled
                            ? "Tamil not generated yet — click Regenerate"
                            : undefined
                        }
                        className={`flex-1 sm:flex-none px-4 py-3 sm:py-2 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                          isActive
                            ? "text-white"
                            : "text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                        style={
                          isActive
                            ? {
                                background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                              }
                            : undefined
                        }
                      >
                        {l === "en" ? " English" : " தமிழ்"}
                      </button>
                    );
                  })}
                </div>
                {!hasTamil && (
                  <span className="text-[10px] text-amber-600 font-semibold mt-2 sm:mt-0 w-full sm:w-auto">
                    Tamil not available — click Regenerate to get both languages.
                  </span>
                )}
              </div>

              {/* Cards grid */}
              {activeLang ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full animate-in fade-in slide-in-from-bottom-4 duration-300">

                  {/* Key Concepts */}
                  <InsightCard
                    icon={<i className="fi fi-rr-key text-indigo-500"></i>}
                    title={lang === "en" ? "Key Concepts" : "முக்கிய கருத்துகள்"}
                    subtitle={
                      lang === "en"
                        ? "What students must walk away understanding"
                        : "மாணவர்கள் புரிந்துகொள்ள வேண்டியவை"
                    }
                    gradientFrom="#6366f1"
                    accent={accent}
                  >
                    <EditableList
                      items={activeLang.keyConcepts}
                      accent="#6366f1"
                      onChange={(i, v) => updateLangList("keyConcepts", i, v)}
                    />
                  </InsightCard>

                  {/* Real-life Connections */}
                  <InsightCard
                    icon={<i className="fi fi-rr-globe text-emerald-500"></i>}
                    title={lang === "en" ? "Real-life Connections" : "நிஜ வாழ்க்கை இணைப்புகள்"}
                    subtitle={
                      lang === "en"
                        ? "Concrete Tamil Nadu-relevant examples"
                        : "தமிழ்நாட்டிற்கு தொடர்புடைய உதாரணங்கள்"
                    }
                    gradientFrom="#10b981"
                    accent={accent}
                  >
                    <EditableList
                      items={activeLang.realLifeConnections}
                      accent="#10b981"
                      onChange={(i, v) => updateLangList("realLifeConnections", i, v)}
                    />
                  </InsightCard>

                  {/* Common Misconceptions */}
                  <InsightCard
                    icon={<i className="fi fi-rr-bug text-red-500"></i>}
                    title={lang === "en" ? "Common Misconceptions" : "பொதுவான தவறான கருத்துகள்"}
                    subtitle={
                      lang === "en"
                        ? "Pre-empt these before they take root"
                        : "இவற்றை முன்கூட்டியே தடுக்கவும்"
                    }
                    gradientFrom="#ef4444"
                    accent={accent}
                  >
                    <EditableList
                      items={activeLang.commonMisconceptions}
                      accent="#ef4444"
                      onChange={(i, v) => updateLangList("commonMisconceptions", i, v)}
                    />
                  </InsightCard>

                  {/* Student Key Points */}
                  <InsightCard
                    icon={<i className="fi fi-rr-graduation-cap text-purple-500"></i>}
                    title={lang === "en" ? "Student Key Points" : "மாணவர் முக்கிய குறிப்புகள்"}
                    subtitle={
                      lang === "en"
                        ? "Simplified takeaways students will see once published"
                        : "வெளியிட்ட பிறகு மாணவர்கள் காணும் எளிய குறிப்புகள்"
                    }
                    gradientFrom="#8b5cf6"
                    accent={accent}
                  >
                    <EditableList
                      items={activeLang.studentKeyPoints}
                      accent="#8b5cf6"
                      onChange={(i, v) => updateLangList("studentKeyPoints", i, v)}
                    />
                  </InsightCard>

                  {/* Teaching Flow */}
                  <div className="lg:col-span-2 glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-4 sm:p-6 overflow-hidden relative w-full">
                    <div
                      className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
                      style={{ background: `linear-gradient(90deg, ${accent}, ${accent}55)` }}
                    />
                    <h3 className="text-sm font-black text-black dark:text-white mb-1">
                      <i className="fi fi-rr-time-fast inline-block mr-1 text-inherit"></i><i className="fi fi-rr-star inline-block mr-1 text-inherit"></i>{" "}
                      {lang === "en"
                        ? "Suggested Teaching Flow"
                        : "பரிந்துரைக்கப்பட்ட கற்பித்தல் திட்டம்"}
                    </h3>
                    <p className="text-xs text-slate-500 mb-5">
                      {lang === "en"
                        ? "Ready lesson pacing for a ~45 minute period"
                        : "~45 நிமிட வகுப்புக்கான தயாரான பாட திட்டம்"}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pt-2">
                      {activeLang.teachingFlow.map((step, i) => (
                        <div
                          key={i}
                          className="rounded-2xl border p-4 relative flex flex-col h-full min-h-[140px]"
                          style={{ borderColor: `${accent}33`, background: `${accent}08` }}
                        >
                          <span
                            className="absolute -top-2.5 left-3 text-[9px] font-black px-2 py-0.5 rounded-full text-white"
                            style={{ background: accent }}
                          >
                            {i + 1}
                          </span>
                          <div className="flex items-center justify-between mb-2 mt-1">
                            <input
                              value={step.step}
                              onChange={(e) => updateFlowStep(i, "step", e.target.value)}
                              className="font-bold text-xs bg-transparent border-0 focus:outline-none w-2/3 truncate"
                              style={{ color: accent }}
                            />
                            <div className="flex items-center gap-0.5 shrink-0">
                              <input
                                type="number"
                                value={step.minutes}
                                onChange={(e) =>
                                  updateFlowStep(i, "minutes", Number(e.target.value))
                                }
                                className="w-8 text-right text-[10px] font-bold bg-transparent border-0 focus:outline-none text-slate-400"
                              />
                              <span className="text-[10px] text-slate-400">min</span>
                            </div>
                          </div>
                          <textarea
                            value={step.description}
                            onChange={(e) => updateFlowStep(i, "description", e.target.value)}
                            rows={4}
                            className="w-full flex-grow text-[11px] text-slate-600 dark:text-slate-300 bg-transparent border-0 resize-none focus:outline-none leading-relaxed"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Teacher Script */}
                  <div className="lg:col-span-2 glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-4 sm:p-6 relative overflow-hidden w-full">
                    <div
                      className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
                      style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }}
                    />
                    <h3 className="text-sm font-black text-black dark:text-white mb-1">
                      <i className="fi fi-rr-comment inline-block mr-1 text-inherit"></i><i className="fi fi-rr-star inline-block mr-1 text-inherit"></i>{" "}
                      {lang === "en"
                        ? "How I'd Explain This to My Class"
                        : "என் வகுப்பிற்கு இதை எப்படி விளக்குவேன்"}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      {lang === "en"
                        ? "Ready-to-use spoken introduction — edit it to match your own voice"
                        : "தயாரான வாய்மொழி அறிமுகம் — உங்கள் பாணியில் திருத்தவும்"}
                    </p>
                    <textarea
                      value={activeLang.teacherScript}
                      onChange={(e) => updateScript(e.target.value)}
                      rows={8}
                      className="w-full text-sm leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50/60 dark:bg-slate-950/30 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 focus:outline-none resize-y"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center w-full p-10 glass rounded-3xl border border-dashed border-amber-300 dark:border-amber-700">
                  <span className="text-4xl block mb-3"><i className="fi fi-rr-globe inline-block mr-1 text-inherit"></i></span>
                  <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                    Tamil not generated for this unit yet.
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Click &quot;Regenerate (EN + தமிழ்)&quot; above to get both languages.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </PortalLayout>
  );
}

/* ─── InsightCard ─────────────────────────────────────────────────────────── */

function InsightCard({
  icon,
  title,
  subtitle,
  gradientFrom,
  accent,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gradientFrom: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-4 sm:p-6 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group w-full">
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
        style={{ background: `linear-gradient(90deg, ${gradientFrom}, ${gradientFrom}55)` }}
      />
      {/* Emoji bubble */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3 shadow-sm"
        style={{ background: `${gradientFrom}18`, border: `1px solid ${gradientFrom}33` }}
      >
        {icon}
      </div>
      <h3 className="text-sm font-black text-black dark:text-white mb-0.5">{title}</h3>
      <p className="text-[11px] text-slate-500 mb-4">{subtitle}</p>
      {children}
    </div>
  );
}

/* ─── EditableList ────────────────────────────────────────────────────────── */

function EditableList({
  items,
  accent,
  onChange,
}: {
  items: string[];
  accent: string;
  onChange: (index: number, value: string) => void;
}) {
  return (
    <div className="space-y-2 w-full">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 w-full">
          <span
            className="mt-2.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: accent }}
          />
          <textarea
            value={item}
            onChange={(e) => onChange(i, e.target.value)}
            rows={2}
            className="flex-1 w-full text-xs leading-relaxed text-slate-700 dark:text-slate-300 bg-transparent border-0 resize-none focus:outline-none focus:bg-slate-50/80 dark:focus:bg-slate-950/40 rounded-lg px-1 transition-colors"
          />
        </div>
      ))}
    </div>
  );
}
