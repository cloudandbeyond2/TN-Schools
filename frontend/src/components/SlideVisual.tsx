"use client";
import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface SlideVisualProps {
  graphicType?: string;
  graphicData?: any;
  illustrationPrompt?: string;
  animationSuggestion?: string;
  title?: string;
  subtitle?: string;
  accent: {
    from: string;
    to: string;
    text: string;
    border: string;
    badge: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Accent colour map → hex (for inline SVG use)
// ─────────────────────────────────────────────────────────────────────────────
const ACCENT_HEX: Record<string, { pri: string; sec: string; light: string }> = {
  "from-blue-600":    { pri: "#2563eb", sec: "#4f46e5", light: "#eff6ff" },
  "from-emerald-600": { pri: "#059669", sec: "#0d9488", light: "#ecfdf5" },
  "from-violet-600":  { pri: "#7c3aed", sec: "#9333ea", light: "#f5f3ff" },
  "from-rose-600":    { pri: "#e11d48", sec: "#ec4899", light: "#fff1f2" },
  "from-amber-500":   { pri: "#f59e0b", sec: "#ea580c", light: "#fffbeb" },
};
function getHex(accent: SlideVisualProps["accent"]) {
  return ACCENT_HEX[accent.from] ?? { pri: "#2563eb", sec: "#4f46e5", light: "#eff6ff" };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero / Cover Slide
// ─────────────────────────────────────────────────────────────────────────────
function HeroCover({ accent, title, subtitle }: Pick<SlideVisualProps, "accent" | "title" | "subtitle">) {
  const { pri, sec, light } = getHex(accent);
  const textFill = accent?.from?.includes("amber") ? "#1e293b" : "white";
  return (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-2xl">
      <defs>
        <linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={light} />
          <stop offset="100%" stopColor="#f0f9ff" />
        </linearGradient>
        <radialGradient id="rg" cx="70%" cy="30%">
          <stop offset="0%" stopColor={pri} stopOpacity="0.15" />
          <stop offset="100%" stopColor={pri} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="220" rx="16" fill="url(#hg)" />
      <rect width="320" height="220" rx="16" fill="url(#rg)" />
      <circle cx="240" cy="50" r="70" fill="none" stroke={pri} strokeWidth="1.5" strokeDasharray="6 6" opacity="0.3" />
      <circle cx="240" cy="50" r="50" fill="none" stroke={sec} strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />
      {[60,90,120,150,180].map(y => <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="#e2e8f0" strokeWidth="0.5"/>)}
      {[80,160,240].map(x => <line key={x} x1={x} y1="0" x2={x} y2="220" stroke="#e2e8f0" strokeWidth="0.5"/>)}
      <circle cx="80" cy="110" r="52" fill={pri} opacity="0.12" />
      <circle cx="80" cy="110" r="38" fill={pri} opacity="0.18" />
      <circle cx="80" cy="110" r="26" fill={pri} />
      <text x="80" y="116" textAnchor="middle" fontSize="20" fill={textFill}>🎓</text>
      <rect x="148" y="78" width="4" height="64" rx="2" fill={pri} opacity="0.8" />
      <text x="162" y="100" fontSize="11" fontWeight="800" fill="#1e293b" fontFamily="sans-serif">
        {(title || "Lesson").substring(0, 24)}
      </text>
      <text x="162" y="115" fontSize="9" fill="#64748b" fontFamily="sans-serif">
        {(subtitle || "").substring(0, 28)}
      </text>
      {[[260,160],[280,140],[295,170],[270,185]].map(([cx,cy], i) =>
        <circle key={i} cx={cx} cy={cy} r="3" fill={sec} opacity="0.5"/>)}
      <path d="M0 195 Q80 180 160 195 Q240 210 320 195 L320 220 L0 220Z" fill={pri} opacity="0.08" />
      <text x="160" y="214" textAnchor="middle" fontSize="7" fill={pri} opacity="0.7" fontFamily="sans-serif" fontWeight="700">
        TAMIL NADU SMART SCHOOLS · AI INTELLIGENCE STUDIO
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Concept Mind-Map
// ─────────────────────────────────────────────────────────────────────────────
function ConceptMap({ graphicData, accent }: Pick<SlideVisualProps, "graphicData" | "accent">) {
  const { pri, sec, light } = getHex(accent);
  const textFill = accent?.from?.includes("amber") ? "#1e293b" : "white";
  const values: string[] = graphicData?.values || ["Concept A", "Concept B", "Concept C", "Concept D"];
  const label: string = graphicData?.label || "Core Concept";
  const positions: [number, number][] = [[65, 65], [255, 65], [65, 160], [255, 160]];
  return (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-2xl">
      <rect width="320" height="220" rx="14" fill={light} />
      <circle cx="160" cy="110" r="40" fill={pri} />
      <circle cx="160" cy="110" r="32" fill="white" fillOpacity="0.12" />
      <text x="160" y="107" textAnchor="middle" fontSize="9" fontWeight="800" fill={textFill} fontFamily="sans-serif">
        {label.substring(0, 14)}
      </text>
      <text x="160" y="119" textAnchor="middle" fontSize="8" fill={textFill} opacity="0.85" fontFamily="sans-serif">
        {label.substring(14, 26)}
      </text>
      {positions.slice(0, values.length).map(([cx, cy], i) => (
        <g key={i}>
          <line x1="160" y1="110" x2={cx} y2={cy} stroke={pri} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
          <circle cx={cx} cy={cy} r="30" fill="white" stroke={i % 2 === 0 ? pri : sec} strokeWidth="1.5" />
          <foreignObject x={cx - 26} y={cy - 26} width="52" height="52">
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ margin: 0, fontSize: '7px', lineHeight: '1.2', color: '#475569', fontFamily: 'sans-serif', fontWeight: 'bold', textAlign: 'center', wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {values[i]}
              </p>
            </div>
          </foreignObject>
        </g>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Formula / Equation Visual
// ─────────────────────────────────────────────────────────────────────────────
function FormulaVisual({ graphicData, accent }: Pick<SlideVisualProps, "graphicData" | "accent">) {
  const { pri, sec, light } = getHex(accent);
  const textFill = accent?.from?.includes("amber") ? "#1e293b" : "white";
  const formula: string = graphicData?.formula || graphicData?.label || "F = ma";
  const vars: string[] = graphicData?.variables || graphicData?.values || [];
  return (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-2xl">
      <defs>
        <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={light} />
          <stop offset="100%" stopColor="white" />
        </linearGradient>
      </defs>
      <rect width="320" height="220" rx="14" fill="url(#fg)" />
      {[40,80,120,160,200].map(y => <line key={y} x1="0" y1={y} x2="320" y2={y} stroke={pri} strokeWidth="0.4" opacity="0.1"/>)}
      <rect x="40" y="50" width="240" height="66" rx="14" fill="white" stroke={pri} strokeWidth="2" />
      <rect x="40" y="50" width="240" height="66" rx="14" fill={pri} fillOpacity="0.04" />
      <text x="160" y="93" textAnchor="middle" fontSize="28" fontWeight="900" fill={pri} fontFamily="'Courier New', monospace">
        {formula.substring(0, 16)}
      </text>
      <text x="160" y="136" textAnchor="middle" fontSize="8" fill="#94a3b8" fontFamily="sans-serif" fontWeight="600">WHERE:</text>
      {vars.slice(0, 4).map((v, i) => {
        const x = 46 + i * 68;
        return (
          <g key={i}>
            <rect x={x} y="144" width="62" height="22" rx="8" fill={pri} fillOpacity="0.1" stroke={pri} strokeWidth="0.8" strokeOpacity="0.3" />
            <text x={x + 31} y="159" textAnchor="middle" fontSize="7.5" fill={pri} fontWeight="700" fontFamily="sans-serif">
              {String(v).substring(0, 10)}
            </text>
          </g>
        );
      })}
      <circle cx="28" cy="110" r="18" fill="none" stroke={sec} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
      <circle cx="28" cy="110" r="5" fill={sec} opacity="0.3" />
      <circle cx="292" cy="110" r="18" fill="none" stroke={sec} strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
      <circle cx="292" cy="110" r="5" fill={sec} opacity="0.3" />
      <text x="160" y="208" textAnchor="middle" fontSize="7.5" fill={pri} opacity="0.6" fontFamily="sans-serif" fontWeight="700">
        PRIMARY FORMULA / முதன்மை சூத்திரம்
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Comparison Table
// ─────────────────────────────────────────────────────────────────────────────
function ComparisonVisual({ graphicData, accent }: Pick<SlideVisualProps, "graphicData" | "accent">) {
  const { pri, sec, light } = getHex(accent);
  const textFill = accent?.from?.includes("amber") ? "#1e293b" : "white";
  const values: string[] = graphicData?.values || ["Type A", "Type B", "Feature 1", "Feature 2", "Feature 3", "Feature 4"];
  const label: string = graphicData?.label || "Comparison";
  const leftHead = values[0] || "Column A";
  const rightHead = values[1] || "Column B";
  const rows = values.slice(2);
  return (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-2xl">
      <rect width="320" height="220" rx="14" fill={light} />
      <rect x="10" y="10" width="300" height="26" rx="8" fill={pri} />
      <text x="160" y="27" textAnchor="middle" fontSize="10" fontWeight="800" fill={textFill} fontFamily="sans-serif">
        {label.toUpperCase().substring(0, 32)}
      </text>
      {/* Column headers */}
      <rect x="16" y="42" width="132" height="22" rx="6" fill={pri} fillOpacity="0.15" />
      <text x="82" y="57" textAnchor="middle" fontSize="9" fontWeight="800" fill={pri} fontFamily="sans-serif">
        {leftHead.substring(0, 16)}
      </text>
      <rect x="172" y="42" width="132" height="22" rx="6" fill={sec} fillOpacity="0.15" />
      <text x="238" y="57" textAnchor="middle" fontSize="9" fontWeight="800" fill={sec} fontFamily="sans-serif">
        {rightHead.substring(0, 16)}
      </text>
      {/* VS divider */}
      <line x1="160" y1="42" x2="160" y2="210" stroke="#e2e8f0" strokeWidth="2" />
      <circle cx="160" cy="115" r="14" fill={pri} />
      <text x="160" y="119" textAnchor="middle" fontSize="8" fontWeight="900" fill={textFill} fontFamily="sans-serif">VS</text>
      {/* Rows */}
      {rows.slice(0, 4).map((item, i) => {
        const y = 70 + i * 32;
        const isLeft = i % 2 === 0;
        return (
          <g key={i}>
            <rect x={isLeft ? 16 : 172} y={y} width="132" height="24" rx="8"
              fill="white" stroke={isLeft ? pri : sec} strokeWidth="0.8" strokeOpacity="0.3" />
            <foreignObject x={isLeft ? 20 : 176} y={y + 2} width="124" height="20">
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ margin: 0, fontSize: '7.5px', lineHeight: '1.1', color: '#334155', fontFamily: 'sans-serif', fontWeight: '500', textAlign: 'center', wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item}
                </p>
              </div>
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Process Flow / Steps
// ─────────────────────────────────────────────────────────────────────────────
function ProcessFlow({ graphicData, accent }: Pick<SlideVisualProps, "graphicData" | "accent">) {
  const { pri, sec, light } = getHex(accent);
  const textFill = accent?.from?.includes("amber") ? "#1e293b" : "white";
  const steps: string[] = graphicData?.values || ["Observe", "Hypothesize", "Experiment", "Conclude"];
  const label: string = graphicData?.label || "Process";
  return (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-2xl">
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6Z" fill={pri} opacity="0.6" />
        </marker>
      </defs>
      <rect width="320" height="220" rx="14" fill={light} />
      <text x="160" y="22" textAnchor="middle" fontSize="9" fontWeight="800" fill={pri} fontFamily="sans-serif">
        {label.toUpperCase().substring(0, 36)}
      </text>
      {steps.slice(0, 4).map((step, i) => {
        const x = 16 + i * 76;
        const isLast = i === 3 || i === steps.length - 1;
        const color = i % 2 === 0 ? pri : sec;
        return (
          <g key={i}>
            {!isLast && (
              <line x1={x + 58} y1="110" x2={x + 74} y2="110"
                stroke={pri} strokeWidth="2" strokeOpacity="0.5" markerEnd="url(#arr)" />
            )}
            <rect x={x} y="66" width="58" height="86" rx="12" fill="white" stroke={color} strokeWidth="1.5" />
            <rect x={x} y="66" width="58" height="22" rx="8" fill={color} />
            <text x={x + 29} y="81" textAnchor="middle" fontSize="11" fontWeight="900" fill={textFill} fontFamily="sans-serif">
              0{i + 1}
            </text>
            <foreignObject x={x + 4} y={90} width="50" height="40">
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ margin: 0, fontSize: '6.5px', lineHeight: '1.2', color: color, fontFamily: 'sans-serif', fontWeight: 'bold', textAlign: 'center', wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {step}
                </p>
              </div>
            </foreignObject>
          </g>
        );
      })}
      <text x="160" y="175" textAnchor="middle" fontSize="8" fill={pri} opacity="0.6" fontFamily="sans-serif">
        படிநிலை செயல்முறை · Step-by-Step Process
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Lab / Experiment Diagram
// ─────────────────────────────────────────────────────────────────────────────
function LabDiagram({ graphicData, accent }: Pick<SlideVisualProps, "graphicData" | "accent">) {
  const { pri, sec, light } = getHex(accent);
  const textFill = accent?.from?.includes("amber") ? "#1e293b" : "white";
  const apparatus: string[] = graphicData?.values || ["Beaker", "Thermometer", "Flask"];
  return (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-2xl">
      <rect width="320" height="220" rx="14" fill={light} />
      {/* Header */}
      <text x="160" y="20" textAnchor="middle" fontSize="10" fontWeight="800" fill={pri} fontFamily="sans-serif">🔬 VIRTUAL LAB SETUP</text>
      <text x="160" y="33" textAnchor="middle" fontSize="7.5" fill="#64748b" fontFamily="sans-serif">ஆய்வக அமைப்பு · Apparatus</text>
      <line x1="20" y1="40" x2="300" y2="40" stroke={pri} strokeWidth="0.5" opacity="0.3" />
      {/* Lab bench */}
      <rect x="20" y="163" width="280" height="10" rx="4" fill="#94a3b8" />
      <rect x="30" y="173" width="10" height="30" rx="3" fill="#64748b" />
      <rect x="280" y="173" width="10" height="30" rx="3" fill="#64748b" />
      {/* Beaker */}
      <path d="M80 163 L68 105 L112 105 L100 163Z" fill="none" stroke={pri} strokeWidth="2" />
      <path d="M72 138 L108 138" stroke={pri} strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />
      <ellipse cx="90" cy="105" rx="22" ry="5.5" fill="none" stroke={pri} strokeWidth="1.5" />
      <path d="M80 163 L74 142 L106 142 L100 163Z" fill={pri} opacity="0.25" />
      <circle cx="88" cy="134" r="3" fill={sec} opacity="0.5" />
      <circle cx="95" cy="126" r="2.5" fill={sec} opacity="0.4" />
      <circle cx="84" cy="124" r="2" fill={sec} opacity="0.35" />
      {/* Thermometer */}
      <rect x="153" y="82" width="10" height="75" rx="5" fill="none" stroke="#dc2626" strokeWidth="1.5" />
      <rect x="155" y="124" width="6" height="33" rx="3" fill="#dc2626" opacity="0.7" />
      <circle cx="158" cy="162" r="7" fill="#dc2626" opacity="0.85" />
      <text x="172" y="110" fontSize="8" fill="#dc2626" fontWeight="700" fontFamily="sans-serif">°C</text>
      {/* Flask */}
      <ellipse cx="240" cy="156" rx="30" ry="10" fill={sec} fillOpacity="0.3" stroke={sec} strokeWidth="1.5" />
      <path d="M225 156 L215 104 L265 104 L255 156" fill="none" stroke={sec} strokeWidth="1.5" />
      <rect x="230" y="92" width="20" height="14" rx="4" fill="none" stroke={sec} strokeWidth="1.5" />
      <ellipse cx="240" cy="140" rx="20" ry="6" fill={sec} fillOpacity="0.15" />
      {/* Labels */}
      <text x="90" y="94" textAnchor="middle" fontSize="7.5" fill={pri} fontWeight="700" fontFamily="sans-serif">{apparatus[0] || "Beaker"}</text>
      <text x="158" y="74" textAnchor="middle" fontSize="7.5" fill="#dc2626" fontWeight="700" fontFamily="sans-serif">{apparatus[1] || "Thermometer"}</text>
      <text x="240" y="93" textAnchor="middle" fontSize="7.5" fill={sec} fontWeight="700" fontFamily="sans-serif">{apparatus[2] || "Flask"}</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Real-World Applications Grid
// ─────────────────────────────────────────────────────────────────────────────
function ApplicationsGrid({ graphicData, accent }: Pick<SlideVisualProps, "graphicData" | "accent">) {
  const { pri, sec, light } = getHex(accent);
  const textFill = accent?.from?.includes("amber") ? "#1e293b" : "white";
  const apps: string[] = graphicData?.values || ["Industrial Use", "Home Application", "Medical Field", "Transport"];
  const icons = ["🏭", "🏠", "🏥", "🚗", "🌾", "⚡"];
  return (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-2xl">
      <rect width="320" height="220" rx="14" fill={light} />
      <text x="160" y="20" textAnchor="middle" fontSize="10" fontWeight="800" fill={pri} fontFamily="sans-serif">🌍 REAL-WORLD APPLICATIONS</text>
      <text x="160" y="33" textAnchor="middle" fontSize="8" fill="#64748b" fontFamily="sans-serif">நடைமுறை பயன்பாடுகள்</text>
      {apps.slice(0, 4).map((app, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 16 + col * 152;
        const y = 44 + row * 84;
        const color = i % 2 === 0 ? pri : sec;
        return (
          <g key={i}>
            <rect x={x} y={y} width="138" height="72" rx="12" fill="white" stroke={color} strokeWidth="1.2" />
            <rect x={x} y={y} width="138" height="72" rx="12" fill={color} fillOpacity="0.04" />
            <text x={x + 20} y={y + 26} fontSize="18">{icons[i]}</text>
            <foreignObject x={x + 40} y={y + 8} width="88" height="56">
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                <p style={{ margin: 0, fontSize: '7.5px', lineHeight: '1.25', color: '#334155', fontFamily: 'sans-serif', fontWeight: 'bold', textAlign: 'left', wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {app}
                </p>
              </div>
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary / Mind-Map
// ─────────────────────────────────────────────────────────────────────────────
function SummaryMap({ graphicData, accent, title }: Pick<SlideVisualProps, "graphicData" | "accent" | "title">) {
  const { pri, sec, light } = getHex(accent);
  const textFill = accent?.from?.includes("amber") ? "#1e293b" : "white";
  const points: string[] = graphicData?.values || ["Key Point 1", "Key Point 2", "Key Point 3", "Key Point 4"];
  const angles = [-135, -45, 45, 135];
  return (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-2xl">
      <rect width="320" height="220" rx="14" fill={light} />
      <ellipse cx="160" cy="110" rx="54" ry="34" fill={pri} />
      <text x="160" y="107" textAnchor="middle" fontSize="9" fontWeight="800" fill={textFill} fontFamily="sans-serif">
        {(title || "Summary").substring(0, 14)}
      </text>
      <text x="160" y="120" textAnchor="middle" fontSize="8" fill={textFill} opacity="0.8" fontFamily="sans-serif">சுருக்கம்</text>
      {points.slice(0, 4).map((pt, i) => {
        const angle = (angles[i] * Math.PI) / 180;
        const ex = 160 + Math.cos(angle) * 108;
        const ey = 110 + Math.sin(angle) * 68;
        const mx = 160 + Math.cos(angle) * 62;
        const my = 110 + Math.sin(angle) * 40;
        return (
          <g key={i}>
            <line x1={mx} y1={my} x2={ex} y2={ey} stroke={i % 2 === 0 ? pri : sec} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
            <rect x={ex - 46} y={ey - 18} width="92" height="36" rx="10" fill="white" stroke={i % 2 === 0 ? pri : sec} strokeWidth="1" strokeOpacity="0.4" />
            <foreignObject x={ex - 42} y={ey - 14} width="84" height="28">
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ margin: 0, fontSize: '6.5px', lineHeight: '1.15', color: '#334155', fontFamily: 'sans-serif', fontWeight: 'bold', textAlign: 'center', wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {pt}
                </p>
              </div>
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quiz / Practice Questions
// ─────────────────────────────────────────────────────────────────────────────
function QuizVisual({ accent }: Pick<SlideVisualProps, "accent">) {
  const { pri, sec, light } = getHex(accent);
  const textFill = accent?.from?.includes("amber") ? "#1e293b" : "white";
  return (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-2xl">
      <rect width="320" height="220" rx="14" fill={light} />
      <text x="160" y="22" textAnchor="middle" fontSize="11" fontWeight="900" fill={pri} fontFamily="sans-serif">📝 PRACTICE QUIZ</text>
      <text x="160" y="36" textAnchor="middle" fontSize="8" fill="#64748b" fontFamily="sans-serif">சுய மதிப்பீடு · Self Assessment</text>
      {[0, 1, 2].map(i => (
        <g key={i}>
          <rect x="20" y={48 + i * 54} width="280" height="46" rx="10" fill="white"
            stroke={i === 0 ? pri : sec} strokeWidth="1" strokeOpacity="0.4" />
          <circle cx="42" cy={71 + i * 54} r="15" fill={i === 0 ? pri : sec} opacity="0.85" />
          <text x="42" y={75 + i * 54} textAnchor="middle" fontSize="10" fontWeight="900" fill={textFill} fontFamily="sans-serif">Q{i+1}</text>
          <rect x="68" y={56 + i * 54} width="220" height="9" rx="4" fill="#e2e8f0" />
          <rect x="68" y={70 + i * 54} width="160" height="7" rx="3" fill="#f1f5f9" />
          <rect x="68" y={82 + i * 54} width="120" height="7" rx="3" fill="#f1f5f9" />
        </g>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Illustration Prompt Fallback (rich card)
// ─────────────────────────────────────────────────────────────────────────────
function GenericVisual({ illustrationPrompt, animationSuggestion, accent }: Pick<SlideVisualProps, "illustrationPrompt" | "animationSuggestion" | "accent">) {
  const { pri, sec } = getHex(accent);
  return (
    <div className="w-full h-full flex flex-col gap-3">
      <div className="flex-1 rounded-2xl bg-white shadow-sm p-4 flex flex-col gap-2 border"
        style={{ borderColor: pri + "40" }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs"
            style={{ background: `linear-gradient(135deg, ${pri}, ${sec})` }}>🎨</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">AI Illustration Prompt</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed italic flex-1">
          {illustrationPrompt || "Generate a lesson plan to see AI illustration prompts for each slide."}
        </p>
      </div>
      {animationSuggestion && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3 flex flex-col gap-1 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block mb-0.5">🎬 Animation Cue</span>
          <p className="text-xs text-amber-800 leading-snug">{animationSuggestion}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Export — Dispatcher
// ─────────────────────────────────────────────────────────────────────────────
export default function SlideVisual({
  graphicType, graphicData, illustrationPrompt, animationSuggestion, title, subtitle, accent,
}: SlideVisualProps) {
  const type = (graphicType || "").toLowerCase().trim();

  if (type === "hero" || type === "cover" || type === "intro" || type === "thankyou" || type === "thank_you")
    return <HeroCover accent={accent} title={title} subtitle={subtitle} />;
  if (type === "concept" || type === "mindmap" || type === "objectives" || type === "learning_outcomes")
    return <ConceptMap graphicData={graphicData} accent={accent} />;
  if (type === "formula" || type === "equation" || type === "law" || type === "scientific_formula")
    return <FormulaVisual graphicData={graphicData} accent={accent} />;
  if (type === "comparison" || type === "compare" || type === "difference" || type === "vs")
    return <ComparisonVisual graphicData={graphicData} accent={accent} />;
  if (type === "process" || type === "flow" || type === "steps" || type === "working" || type === "working_principle")
    return <ProcessFlow graphicData={graphicData} accent={accent} />;
  if (type === "experiment" || type === "lab" || type === "activity" || type === "diy")
    return <LabDiagram graphicData={graphicData} accent={accent} />;
  if (type === "application" || type === "applications" || type === "realworld" || type === "daily_life")
    return <ApplicationsGrid graphicData={graphicData} accent={accent} />;
  if (type === "summary" || type === "recap" || type === "mindmap_summary")
    return <SummaryMap graphicData={graphicData} accent={accent} title={title} />;
  if (type === "quiz" || type === "questions" || type === "mcq" || type === "practice")
    return <QuizVisual accent={accent} />;

  return <GenericVisual illustrationPrompt={illustrationPrompt} animationSuggestion={animationSuggestion} accent={accent} />;
}
