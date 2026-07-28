"use client";

import React, { useState, useRef, useEffect } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface InfographicModule {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

interface InfographicStat {
  label: string;
  value: string;
  desc: string;
}

interface InfographicWorkflowStep {
  step: string;
  desc: string;
  icon: string;
}

interface InfographicTermRow {
  english: string;
  tamil: string;
  definition: string;
}

interface InfographicData {
  // New dynamic schema
  heroTitle?: string;
  heroSubtitle?: string;
  heroIcon?: string;
  conceptColor?: string;
  modules?: InfographicModule[];
  stats?: InfographicStat[];
  workflow?: InfographicWorkflowStep[];
  formulaBox?: string;
  formulaExplain?: string;
  lawTitle?: string;
  lawDesc?: string;
  termTable?: InfographicTermRow[];
  constantName?: string;
  constantValue?: string;
  constantExplain?: string;
  // Legacy schema fallbacks
  title?: string;
  subtitle?: string;
}

interface InfographicProps {
  topic: string;
  subject: string;
  data: InfographicData | null | undefined;
}

// ---------------------------------------------------------------------------
// Color palette mapping
// ---------------------------------------------------------------------------
const COLOR_MAP: Record<string, { primary: string; light: string; ring: string; text: string; badge: string; border: string; gradient: string }> = {
  emerald: {
    primary: "bg-emerald-500",
    light: "bg-emerald-50",
    ring: "ring-emerald-400/20",
    text: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-600",
    border: "border-emerald-400",
    gradient: "from-emerald-50 via-white to-teal-50",
  },
  sky: {
    primary: "bg-sky-500",
    light: "bg-sky-50",
    ring: "ring-sky-400/20",
    text: "text-sky-600",
    badge: "bg-sky-50 text-sky-600",
    border: "border-sky-400",
    gradient: "from-sky-50 via-white to-cyan-50",
  },
  indigo: {
    primary: "bg-indigo-500",
    light: "bg-indigo-50",
    ring: "ring-indigo-400/20",
    text: "text-indigo-600",
    badge: "bg-indigo-50 text-indigo-600",
    border: "border-indigo-400",
    gradient: "from-indigo-50 via-white to-purple-50",
  },
  amber: {
    primary: "bg-amber-500",
    light: "bg-amber-50",
    ring: "ring-amber-400/20",
    text: "text-amber-600",
    badge: "bg-amber-50 text-amber-600",
    border: "border-amber-400",
    gradient: "from-amber-50 via-white to-orange-50",
  },
  rose: {
    primary: "bg-rose-500",
    light: "bg-rose-50",
    ring: "ring-rose-400/20",
    text: "text-rose-600",
    badge: "bg-rose-50 text-rose-600",
    border: "border-rose-400",
    gradient: "from-rose-50 via-white to-pink-50",
  },
  teal: {
    primary: "bg-teal-500",
    light: "bg-teal-50",
    ring: "ring-teal-400/20",
    text: "text-teal-600",
    badge: "bg-teal-50 text-teal-600",
    border: "border-teal-400",
    gradient: "from-teal-50 via-white to-cyan-50",
  },
  violet: {
    primary: "bg-violet-500",
    light: "bg-violet-50",
    ring: "ring-violet-400/20",
    text: "text-violet-600",
    badge: "bg-violet-50 text-violet-600",
    border: "border-violet-400",
    gradient: "from-violet-50 via-white to-purple-50",
  },
};

// Educational AI image via Pollinations (free, no key)
const pol = (prompt: string, w = 1000, h = 600) => {
  // Append safety and style constraints to ensure school-appropriate imagery
  const safePrompt = `${prompt}, safe for middle school children, educational vector textbook illustration, family friendly, no inappropriate content`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(safePrompt)}?width=${w}&height=${h}&nologo=true`;
};

// ---------------------------------------------------------------------------
// Download helper
// ---------------------------------------------------------------------------
function downloadInfographic(infographicRef: React.RefObject<HTMLDivElement | null>, topic: string) {
  // Use print for reliable screenshot
  window.print();
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function InteractiveInfographic({ topic, subject, data }: InfographicProps) {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const infographicRef = useRef<HTMLDivElement>(null);

  // Reset open module when topic changes
  useEffect(() => {
    setActiveModule(null);
  }, [topic]);

  // Resolve color scheme
  const colorKey = data?.conceptColor || "emerald";
  const colors = COLOR_MAP[colorKey] || COLOR_MAP.emerald;

  // Bilingual formatter helper
  const cleanBilingual = (title: string) => {
    if (!title) return "";
    return title.replace(/\s*\/\s*/g, " / ");
  };

  // Resolve display title & icon
  const heroTitle = cleanBilingual(data?.heroTitle || data?.title || topic);
  const heroSubtitle = cleanBilingual(data?.heroSubtitle || data?.subtitle || subject);
  const heroIcon = data?.heroIcon || "📚";

  // Resolve modules — fall back gracefully if missing
  const modules: InfographicModule[] = data?.modules || [];
  const stats: InfographicStat[] = data?.stats || [];
  const workflow: InfographicWorkflowStep[] = data?.workflow || [];
  const termTable: InfographicTermRow[] = data?.termTable || [];

  return (
    <div ref={infographicRef} className="w-full font-sans space-y-5 print:space-y-4">

      {/* ================================================================== */}
      {/* HEADER                                                              */}
      {/* ================================================================== */}
      <div className={`bg-gradient-to-br ${colors.gradient} border border-slate-200 rounded-3xl p-5 md:p-7 shadow-xl relative overflow-hidden`}>
        {/* Decorative circles */}
        <div className={`absolute -top-10 -right-10 w-48 h-48 ${colors.primary} opacity-5 rounded-full`} />
        <div className={`absolute -bottom-8 -left-8 w-32 h-32 ${colors.primary} opacity-5 rounded-full`} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`text-4xl md:text-5xl p-3 bg-white rounded-2xl shadow-md border ${colors.border} border-opacity-30`}>
              {heroIcon}
            </div>
            <div>
              <span className={`text-[10px] font-black ${colors.text} uppercase tracking-widest block mb-1`}>
                Tamil Nadu Smart Schools · AI Intelligence Studio
              </span>
              <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {heroTitle}
              </h1>
              <p className={`text-sm font-bold ${colors.text} mt-1 opacity-80`}>{heroSubtitle}</p>
            </div>
          </div>

          <button
            onClick={() => downloadInfographic(infographicRef, topic)}
            className={`shrink-0 px-4 py-2 rounded-xl ${colors.primary} hover:opacity-90 text-white font-bold text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md print:hidden`}
          >
            <span>⬇️</span> Download / Print
          </button>
        </div>
      </div>

      {/* ================================================================== */}
      {/* REALISTIC CONCEPT VISUAL (Pollinations)                            */}
      {/* ================================================================== */}
      <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-md relative bg-slate-100">
        <img
          src={pol(`${topic}, ${subject}, core concept visualization, colorful educational infographic style, bright clean background`, 1200, 440)}
          alt={heroTitle}
          loading="lazy"
          className="w-full h-40 md:h-56 object-cover"
          onError={(e) => {
            const target = e.currentTarget;
            const parent = target.parentElement;
            if (!parent) return;
            target.style.display = 'none';
            const fb = document.createElement('div');
            fb.className = 'w-full h-40 md:h-56 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-100 to-slate-200';
            fb.innerHTML = `<span style="font-size:3rem;line-height:1">${heroIcon}</span><p style="font-size:13px;font-weight:700;color:#64748b;text-align:center;max-width:280px;padding:0 12px">${heroTitle}</p>`;
            parent.insertBefore(fb, parent.firstChild);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent flex items-end p-5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.85)" }}>
              <i className="fi fi-sr-picture leading-none" /> Real-World Visual · காட்சி விளக்கம்
            </span>
            <p className="font-bold text-sm md:text-lg" style={{ color: "#fff" }}>{heroTitle} — {heroSubtitle}</p>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* MAIN GRID — Hero + Modules + Stats                                 */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ---- Formula & Law Hero (left) ---- */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border-b border-slate-200 pb-2 mb-1">
            <span className={`text-[10px] font-black ${colors.text} uppercase tracking-wider block`}>
              Formulas & Constants / சூத்திரங்கள் & மாறிலிகள்
            </span>
            <h3 className="text-slate-800 font-extrabold text-sm">Reference Values</h3>
          </div>

          {/* Formula Box */}
          {data?.formulaBox && (
            <div className={`bg-white border ${colors.border} rounded-3xl p-5 shadow-sm text-center`}>
              <span className={`text-[9px] font-black ${colors.text} uppercase tracking-widest block mb-2`}>
                Primary Formula / முதன்மை சூத்திரம்
              </span>
              <div className={`text-xl md:text-2xl font-black ${colors.text} py-3 px-4 ${colors.light} rounded-2xl inline-block border ${colors.border} border-opacity-40 shadow-inner max-w-full break-words leading-relaxed`}>
                {data.formulaBox}
              </div>
              {data.formulaExplain && (
                <p className="text-slate-600 text-xs font-medium mt-3 leading-relaxed text-left break-words">
                  {data.formulaExplain}
                </p>
              )}
            </div>
          )}

          {/* Law / Theorem */}
          {data?.lawTitle && (
            <div className={`bg-white border border-slate-200 rounded-3xl p-5 shadow-md`}>
              <span className={`text-[9px] font-black ${colors.text} uppercase tracking-widest block mb-1`}>
                {data.lawTitle}
              </span>
              <p className="text-slate-700 text-xs font-medium leading-relaxed">{data.lawDesc}</p>
            </div>
          )}

          {/* Constant / Boundary Value */}
          {data?.constantName && (
            <div className={`${colors.light} border ${colors.border} border-opacity-40 rounded-3xl p-4 shadow-sm flex items-center gap-4`}>
              <div className={`shrink-0 p-3 bg-white rounded-2xl shadow border ${colors.border} border-opacity-30 text-center min-w-[64px]`}>
                <div className={`text-[9px] font-bold ${colors.text} uppercase tracking-wider leading-none mb-1 break-words`}>{data.constantName}</div>
                <div className={`text-sm font-black ${colors.text} break-words`}>{data.constantValue}</div>
              </div>
              <p className="text-slate-600 text-xs font-medium leading-relaxed break-words">{data.constantExplain}</p>
            </div>
          )}

          {/* Term Table */}
          {termTable.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-md overflow-hidden">
              <span className={`text-[9px] font-black ${colors.text} uppercase tracking-widest block mb-3`}>
                Bilingual Key Terms / இருமொழி கலைச்சொற்கள்
              </span>
              <table className="w-full text-left text-xs table-fixed">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-2 font-black text-slate-500 text-[9px] uppercase tracking-wider w-[25%]">English</th>
                    <th className="pb-2 font-black text-slate-500 text-[9px] uppercase tracking-wider w-[25%]">Tamil</th>
                    <th className="pb-2 font-black text-slate-500 text-[9px] uppercase tracking-wider w-[50%]">Definition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {termTable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 pr-2 font-semibold text-slate-800 text-[11px] break-words">{row.english}</td>
                      <td className={`py-2.5 pr-2 font-semibold ${colors.text} text-[11px] break-words`}>{row.tamil}</td>
                      <td className="py-2.5 text-slate-500 text-[10px] leading-snug break-words">{row.definition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ---- Interactive Concept Modules (center) ---- */}
        <div className="lg:col-span-4 space-y-3">
          <div className="border-b border-slate-200 pb-2 mb-1">
            <span className={`text-[10px] font-black ${colors.text} uppercase tracking-wider block`}>
              Key Concepts / முக்கிய கருத்துகள்
            </span>
            <h3 className="text-slate-800 font-extrabold text-sm">Interactive Learning Modules</h3>
          </div>

          {modules.length === 0 ? (
            <div className="text-center p-8 text-slate-500 text-sm bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-2xl block mb-2">⚠️</span>
              <p className="font-bold mb-1">Visual Data Missing</p>
              <p className="text-xs">This lesson plan was generated before the visual engine was updated. Please <strong>Generate a New Lesson Plan</strong> to unlock interactive infographics.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {modules.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => setActiveModule(activeModule === mod.id ? null : mod.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-300 flex items-start gap-3 shadow-sm ${
                    activeModule === mod.id
                      ? `${colors.light} ${colors.border} ring-2 ${colors.ring}`
                      : "bg-white hover:bg-slate-50 border-slate-200"
                  }`}
                >
                  <span className="text-xl p-2 rounded-xl bg-white shadow-sm shrink-0 border border-slate-100">
                    {mod.icon}
                  </span>
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-extrabold text-xs text-slate-800 leading-snug break-words">{mod.title}</h4>
                    <p className="text-[10.5px] text-slate-500 leading-relaxed font-medium break-words">
                      {activeModule === mod.id
                        ? mod.desc
                        : "Click to explore this concept in detail..."}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ---- Statistics / KPI Cards (right) ---- */}
        <div className="lg:col-span-3 space-y-3">
          <div className="border-b border-slate-200 pb-2 mb-1">
            <span className={`text-[10px] font-black ${colors.text} uppercase tracking-wider block`}>
              Key Facts & Figures
            </span>
            <h3 className="text-slate-800 font-extrabold text-sm">Topic KPIs</h3>
          </div>

          {stats.length === 0 ? (
            <div className="text-center p-6 text-slate-500 text-sm bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-xs">Regenerate plan to see stats.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.map((stat, idx) => {
                const statColors = [colors.text, "text-sky-600", "text-amber-600"];
                return (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider break-words">
                      {stat.label}
                    </span>
                    <div className="mt-1.5">
                      <span className={`${
                        String(stat.value).length > 10
                          ? 'text-xs font-bold'
                          : 'text-lg font-black font-mono'
                      } ${statColors[idx % statColors.length]} break-words leading-snug block`}>
                        {stat.value}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium leading-snug break-words">{stat.desc}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ================================================================== */}
      {/* WORKFLOW / STEP-BY-STEP BOTTOM                                      */}
      {/* ================================================================== */}
      {workflow.length > 0 && (
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className={`text-[10px] font-black ${colors.text} uppercase tracking-wider block`}>
                Step-by-Step Learning Roadmap
              </span>
              <h3 className="text-slate-800 font-extrabold text-sm">
                How to Master {topic} — படிநிலை வழிகாட்டி
              </h3>
            </div>
            <span className={`text-[9px] ${colors.badge} font-bold px-2 py-1 rounded-full uppercase tracking-wider`}>
              Lesson Roadmap
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
            {workflow.map((work, idx) => (
              <div
                key={idx}
                className={`bg-white border border-slate-200 p-4 rounded-2xl shadow-sm relative group hover:${colors.light} hover:${colors.border} transition-colors flex flex-col justify-between h-full`}
              >
                <div>
                  <div className={`absolute top-3 right-3 z-10 text-xs font-mono font-black text-white/90 drop-shadow`}>
                    0{idx + 1}
                  </div>
                  <div className="relative w-full h-24 rounded-2xl overflow-hidden mb-3 border border-slate-100 bg-slate-100">
                    <img
                      src={pol(`${work.step} in ${topic}, ${subject}, simple educational diagram, clean vector style, bright background`, 400, 240)}
                      alt={work.step}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const parent = target.parentElement;
                        if (!parent) return;
                        target.style.display = 'none';
                        const fb = document.createElement('div');
                        fb.className = 'w-full h-full flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-slate-100 to-slate-200';
                        fb.innerHTML = `<span style="font-size:1.75rem;line-height:1">${work.icon}</span><p style="font-size:9px;font-weight:700;color:#64748b;text-align:center;max-width:100px;padding:0 6px;margin:0">${work.step}</p>`;
                        parent.insertBefore(fb, parent.firstChild);
                      }}
                    />
                    <span className="absolute bottom-1 left-1 text-xl drop-shadow-md">{work.icon}</span>
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-800 leading-snug">{work.step}</h4>
                  <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed font-medium">{work.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* FOOTER                                                              */}
      {/* ================================================================== */}
      <div className={`flex justify-between items-center pr-2 pt-2 border-t border-slate-100`}>
        <span className="text-[9px] font-medium text-slate-400">
          {subject} · Grade content · Tamil Nadu State Board
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Powered by</span>
          <span className={`text-[9px] font-mono font-black ${colors.text}`}>Intelligence Studio</span>
        </div>
      </div>
    </div>
  );
}
