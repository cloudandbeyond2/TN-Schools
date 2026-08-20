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

// ============================================================================
// SVG Rendering Helpers for specimen details
// ============================================================================

const renderDNASvg = (highlighted: string | null) => {
  const isBackbone = highlighted === "Phosphate Backbone";
  const isBasePairs = highlighted === "Base Pairs";
  const isBonds = highlighted === "Hydrogen Bonds";
  const isGroove = highlighted === "Minor Groove";
  
  return (
    <svg viewBox="0 0 200 300" className="w-full h-full max-h-[300px]">
      <rect width="200" height="300" rx="20" fill="transparent" />
      {[30, 70, 110, 150, 190, 230, 270].map((y, idx) => {
        const xOffset = Math.sin(y / 30) * 40;
        const x1 = 100 - xOffset;
        const x2 = 100 + xOffset;
        const leftColor = idx % 2 === 0 ? "#ef4444" : "#3b82f6";
        const rightColor = idx % 2 === 0 ? "#10b981" : "#f59e0b";
        
        return (
          <g key={y} className="transition-opacity duration-300">
            <line 
              x1={x1} y1={y} x2={100} y2={y} 
              stroke={leftColor} 
              strokeWidth="6" 
              strokeLinecap="round"
              opacity={isBasePairs ? 1 : highlighted && !isBasePairs ? 0.3 : 0.8}
            />
            <line 
              x1={100} y1={y} x2={x2} y2={y} 
              stroke={rightColor} 
              strokeWidth="6" 
              strokeLinecap="round"
              opacity={isBasePairs ? 1 : highlighted && !isBasePairs ? 0.3 : 0.8}
            />
            <line 
              x1={100 - 10} y1={y} x2={100 + 10} y2={y} 
              stroke="#ffffff" 
              strokeWidth="2" 
              strokeDasharray="2,2"
              opacity={isBonds ? 1 : highlighted && !isBonds ? 0.1 : 0.9}
            />
          </g>
        );
      })}

      <path 
        d="M 60 10 Q 150 50 60 90 T 140 170 T 60 250 T 140 290" 
        fill="none" 
        stroke="#6366f1" 
        strokeWidth="10" 
        strokeLinecap="round"
        opacity={isBackbone || isGroove ? 1 : highlighted ? 0.3 : 0.9}
        className="transition-opacity duration-300"
      />
      <path 
        d="M 140 10 Q 50 50 140 90 T 60 170 T 140 250 T 60 290" 
        fill="none" 
        stroke="#a855f7" 
        strokeWidth="10" 
        strokeLinecap="round"
        opacity={isBackbone || isGroove ? 1 : highlighted ? 0.3 : 0.9}
        className="transition-opacity duration-300"
      />
    </svg>
  );
};

const renderFrogSvg = (highlighted: string | null) => {
  const isTympanum = highlighted === "Tympanum";
  const isMembrane = highlighted === "Nictitating Membrane";
  const isFeet = highlighted === "Webbed Feet";
  const isHeart = highlighted === "Heart (3-Chambered)";
  const isLiver = highlighted === "Liver (3 Lobes)";

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full max-h-[300px]">
      <rect width="200" height="200" rx="20" fill="transparent" />
      <path 
        d="M 100 25 C 130 25 150 50 150 100 C 150 150 130 175 100 175 C 70 175 50 150 50 100 C 50 50 70 25 100 25 Z" 
        fill="#10b981" 
        stroke="#047857" 
        strokeWidth="4" 
        opacity={highlighted ? 0.4 : 0.9}
      />
      <circle cx="75" cy="40" r="10" fill="#f59e0b" stroke="#d97706" strokeWidth="2" opacity={isMembrane ? 1 : highlighted ? 0.2 : 0.9} />
      <circle cx="75" cy="40" r="4" fill="#000000" opacity={isMembrane ? 1 : highlighted ? 0.2 : 0.9} />
      {isMembrane && (
        <path d="M 65 40 Q 75 30 85 40 Z" fill="#93c5fd" opacity="0.6" stroke="#2563eb" strokeWidth="1" />
      )}
      <circle cx="125" cy="40" r="10" fill="#f59e0b" stroke="#d97706" strokeWidth="2" opacity={isMembrane ? 1 : highlighted ? 0.2 : 0.9} />
      <circle cx="125" cy="40" r="4" fill="#000000" opacity={isMembrane ? 1 : highlighted ? 0.2 : 0.9} />
      <circle 
        cx="142" cy="55" r="8" 
        fill="#b45309" 
        stroke="#ffffff" 
        strokeWidth={isTympanum ? "3" : "1"} 
        opacity={isTympanum ? 1 : highlighted ? 0.1 : 0.9}
      />
      <circle 
        cx="58" cy="55" r="8" 
        fill="#b45309" 
        stroke="#ffffff" 
        strokeWidth={isTympanum ? "3" : "1"} 
        opacity={isTympanum ? 1 : highlighted ? 0.1 : 0.9}
      />
      <path d="M 45 80 C 15 90 20 110 40 100" fill="none" stroke="#047857" strokeWidth="6" strokeLinecap="round" opacity={highlighted ? 0.3 : 0.9} />
      <path d="M 155 80 C 185 90 180 110 160 100" fill="none" stroke="#047857" strokeWidth="6" strokeLinecap="round" opacity={highlighted ? 0.3 : 0.9} />
      <path 
        d="M 50 140 C 20 150 15 180 40 185" 
        fill="none" 
        stroke={isFeet ? "#3b82f6" : "#047857"} 
        strokeWidth={isFeet ? "10" : "8"} 
        strokeLinecap="round" 
        opacity={isFeet ? 1 : highlighted ? 0.2 : 0.9} 
      />
      <path 
        d="M 150 140 C 180 150 185 180 160 185" 
        fill="none" 
        stroke={isFeet ? "#3b82f6" : "#047857"} 
        strokeWidth={isFeet ? "10" : "8"} 
        strokeLinecap="round" 
        opacity={isFeet ? 1 : highlighted ? 0.2 : 0.9} 
      />
      <path 
        d="M 85 90 Q 100 80 115 90 Q 125 110 100 115 Q 75 110 85 90" 
        fill="#7f1d1d" 
        stroke="#ef4444" 
        strokeWidth="1.5" 
        opacity={isLiver ? 1 : highlighted && !isLiver ? 0.1 : 0.8}
      />
      <path 
        d="M 100 70 C 95 65 90 70 100 82 C 110 70 105 65 100 70" 
        fill="#dc2626" 
        stroke="#ffffff" 
        strokeWidth={isHeart ? "2" : "1"} 
        opacity={isHeart ? 1 : highlighted && !isHeart ? 0.1 : 0.9}
      />
    </svg>
  );
};

const renderBeetleSvg = (highlighted: string | null) => {
  const isMandibles = highlighted === "Mandibles";
  const isAntennae = highlighted === "Antennae";
  const isElytra = highlighted === "Elytra";
  const isThorax = highlighted === "Thorax (Pronotum)";
  const isAbdomen = highlighted === "Abdomen";

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full max-h-[300px]">
      <rect width="200" height="200" rx="20" fill="transparent" />
      <path 
        d="M 85 60 C 60 55 45 40 40 45" 
        fill="none" 
        stroke={isAntennae ? "#ef4444" : "#1e293b"} 
        strokeWidth="3" 
        strokeLinecap="round"
        opacity={isAntennae ? 1 : highlighted ? 0.2 : 0.9}
      />
      <path 
        d="M 115 60 C 140 55 155 40 160 45" 
        fill="none" 
        stroke={isAntennae ? "#ef4444" : "#1e293b"} 
        strokeWidth="3" 
        strokeLinecap="round"
        opacity={isAntennae ? 1 : highlighted ? 0.2 : 0.9}
      />
      <path 
        d="M 85 55 Q 75 10 50 15 Q 70 30 85 45" 
        fill={isMandibles ? "#f59e0b" : "#475569"} 
        stroke="#1e293b" 
        strokeWidth="2" 
        opacity={isMandibles ? 1 : highlighted ? 0.2 : 0.9}
      />
      <path 
        d="M 115 55 Q 125 10 150 15 Q 130 30 115 45" 
        fill={isMandibles ? "#f59e0b" : "#475569"} 
        stroke="#1e293b" 
        strokeWidth="2" 
        opacity={isMandibles ? 1 : highlighted ? 0.2 : 0.9}
      />
      <rect x="80" y="50" width="40" height="20" rx="5" fill="#334155" stroke="#1e293b" strokeWidth="2" opacity={highlighted ? 0.4 : 0.9} />
      <rect 
        x="70" y="70" width="60" height="35" rx="10" 
        fill={isThorax ? "#3b82f6" : "#1e293b"} 
        stroke="#0f172a" 
        strokeWidth="2.5" 
        opacity={isThorax ? 1 : highlighted ? 0.2 : 0.9}
      />
      <path 
        d="M 70 105 L 130 105 L 130 170 C 130 185 100 190 100 190 C 100 190 70 185 70 170 Z" 
        fill={isElytra ? "#10b981" : isAbdomen ? "#b45309" : "#0f172a"} 
        stroke="#020617" 
        strokeWidth="2.5" 
        opacity={isElytra || isAbdomen ? 1 : highlighted ? 0.2 : 0.9}
      />
      {(!isAbdomen || isElytra) && (
        <line x1="100" y1="105" x2="100" y2="188" stroke="#ffffff" strokeWidth="1.5" opacity={highlighted ? 0.3 : 0.7} />
      )}
    </svg>
  );
};

const renderStarfishSvg = (highlighted: string | null) => {
  const isMadreporite = highlighted === "Madreporite";
  const isDisc = highlighted === "Central Disc";
  const isFeet = highlighted === "Tube Feet";
  const isCanal = highlighted === "Radial Canal";
  const isExoskeleton = highlighted === "Spiny Exoskeleton";

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full max-h-[300px]">
      <rect width="200" height="200" rx="20" fill="transparent" />
      <path 
        d="M 100 15 L 115 70 L 170 75 L 125 110 L 140 165 L 100 135 L 60 165 L 75 110 L 30 75 L 85 70 Z" 
        fill={isExoskeleton ? "#fdba74" : "#f97316"} 
        stroke="#c2410c" 
        strokeWidth="3" 
        opacity={isExoskeleton ? 1 : highlighted ? 0.3 : 0.9}
      />
      {(!highlighted || isExoskeleton) && (
        <g fill="#ffedd5" opacity={isExoskeleton ? 1 : 0.8}>
          <circle cx="100" cy="40" r="2" /><circle cx="100" cy="55" r="2.5" />
          <circle cx="140" cy="85" r="2" /><circle cx="125" cy="90" r="2.5" />
          <circle cx="125" cy="135" r="2" /><circle cx="115" cy="120" r="2.5" />
          <circle cx="75" cy="135" r="2" /><circle cx="85" cy="120" r="2.5" />
          <circle cx="60" cy="85" r="2" /><circle cx="75" cy="90" r="2.5" />
        </g>
      )}
      <circle 
        cx="100" cy="100" r="25" 
        fill="none" 
        stroke={isDisc ? "#2563eb" : "#f97316"} 
        strokeWidth={isDisc ? "3" : "1.5"} 
        strokeDasharray={isDisc ? "none" : "4,2"} 
        opacity={isDisc ? 1 : highlighted ? 0.1 : 0.9}
      />
      <circle 
        cx="100" cy="100" r="14" 
        fill="none" 
        stroke="#60a5fa" 
        strokeWidth="3" 
        opacity={isCanal ? 1 : highlighted ? 0.1 : 0.8}
      />
      <circle 
        cx="110" cy="90" r="4.5" 
        fill="#ffffff" 
        stroke="#2563eb" 
        strokeWidth="1.5" 
        opacity={isMadreporite ? 1 : highlighted ? 0.1 : 0.9}
      />
      <g stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" opacity={isCanal ? 1 : highlighted ? 0.1 : 0.8}>
        <line x1="100" y1="86" x2="100" y2="30" />
        <line x1="112" y1="108" x2="155" y2="145" />
        <line x1="88" y1="108" x2="45" y2="145" />
        <line x1="114" y1="96" x2="160" y2="80" />
        <line x1="86" y1="96" x2="40" y2="80" />
      </g>
      <g fill="#93c5fd" opacity={isFeet ? 1 : highlighted ? 0.1 : 0.8}>
        <circle cx="95" cy="45" r="2.5" /><circle cx="105" cy="45" r="2.5" />
        <circle cx="95" cy="65" r="2.5" /><circle cx="105" cy="65" r="2.5" />
        <circle cx="130" cy="72" r="2.5" /><circle cx="135" cy="80" r="2.5" />
        <circle cx="112" cy="125" r="2.5" /><circle cx="120" cy="132" r="2.5" />
      </g>
    </svg>
  );
};

const renderAmoebaSvg = (highlighted: string | null) => {
  const isPseudopodia = highlighted === "Pseudopodia";
  const isNucleus = highlighted === "Nucleus";
  const isContractile = highlighted === "Contractile Vacuole";
  const isFood = highlighted === "Food Vacuole";
  const isCytoplasm = highlighted === "Ectoplasm/Endoplasm";

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full max-h-[300px]">
      <rect width="200" height="200" rx="20" fill="transparent" />
      <path 
        d="M 50 60 C 30 75 25 110 40 130 C 55 150 70 145 90 165 C 110 185 140 180 155 160 C 170 140 185 110 170 80 C 155 50 120 40 100 55 C 80 70 70 45 50 60 Z" 
        fill={isCytoplasm ? "#a7f3d0" : "#d1fae5"} 
        stroke={isPseudopodia ? "#3b82f6" : "#059669"} 
        strokeWidth={isPseudopodia ? "4" : "2"} 
        opacity={isCytoplasm || isPseudopodia ? 1 : highlighted ? 0.3 : 0.9}
      />
      {(!highlighted || isCytoplasm) && (
        <g fill="#34d399" opacity="0.3">
          <circle cx="70" cy="90" r="1.5" /><circle cx="85" cy="130" r="1.5" /><circle cx="120" cy="140" r="1.5" />
          <circle cx="140" cy="100" r="1.5" /><circle cx="100" cy="80" r="1.5" /><circle cx="55" cy="115" r="1.5" />
        </g>
      )}
      <ellipse 
        cx="95" cy="110" rx="16" ry="12" 
        fill="#c084fc" 
        stroke="#7e22ce" 
        strokeWidth="2.5" 
        opacity={isNucleus ? 1 : highlighted ? 0.1 : 0.9}
      />
      <circle cx="92" cy="108" r="4" fill="#6b21a8" opacity={isNucleus ? 1 : highlighted ? 0.1 : 0.9} />
      <circle 
        cx="135" cy="85" r="14" 
        fill="#e0f2fe" 
        stroke="#0284c7" 
        strokeWidth={isContractile ? "3" : "2"} 
        opacity={isContractile ? 1 : highlighted ? 0.1 : 0.8}
      />
      <circle cx="135" cy="85" r="10" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" opacity={isContractile ? 1 : highlighted ? 0.1 : 0.8} />
      <g opacity={isFood ? 1 : highlighted ? 0.1 : 0.8}>
        <circle cx="65" cy="140" r="9" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
        <circle cx="63" cy="138" r="2" fill="#854d0e" />
        <circle cx="130" cy="135" r="7" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
        <circle cx="131" cy="135" r="1.5" fill="#854d0e" />
      </g>
    </svg>
  );
};

const renderFernSvg = (highlighted: string | null) => {
  const isApex = highlighted === "Apex";
  const isPinnae = highlighted === "Pinnae";
  const isRachis = highlighted === "Rachis";
  const isStipe = highlighted === "Stipe";
  const isSori = highlighted === "Sori";

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full max-h-[300px]">
      <rect width="200" height="200" rx="20" fill="transparent" />
      <path 
        d="M 100 190 Q 95 120 100 20" 
        fill="none" 
        stroke={isRachis ? "#a855f7" : isStipe ? "#f59e0b" : "#047857"} 
        strokeWidth={isRachis || isStipe ? "6" : "3"} 
        strokeLinecap="round" 
        opacity={isRachis || isStipe ? 1 : highlighted ? 0.2 : 0.9}
      />
      {[
        { y: 40, rx: 25, ry: 8, rot: -10 },
        { y: 65, rx: 35, ry: 10, rot: -8 },
        { y: 90, rx: 45, ry: 12, rot: -5 },
        { y: 115, rx: 50, ry: 13, rot: -2 },
        { y: 140, rx: 55, ry: 14, rot: 0 }
      ].map((p, idx) => {
        const isThisPinnae = isPinnae;
        return (
          <g key={idx} className="transition-opacity duration-300">
            <ellipse 
              cx={100 - p.rx/2} cy={p.y} rx={p.rx/2} ry={p.ry} 
              transform={`rotate(${p.rot}, ${100 - p.rx/2}, ${p.y})`}
              fill={isThisPinnae ? "#34d399" : "#10b981"} 
              stroke="#065f46" 
              strokeWidth="1.5"
              opacity={isThisPinnae ? 1 : highlighted && !isSori ? 0.2 : 0.8}
            />
            <ellipse 
              cx={100 + p.rx/2} cy={p.y} rx={p.rx/2} ry={p.ry} 
              transform={`rotate(${-p.rot}, ${100 + p.rx/2}, ${p.y})`}
              fill={isThisPinnae ? "#34d399" : "#10b981"} 
              stroke="#065f46" 
              strokeWidth="1.5"
              opacity={isThisPinnae ? 1 : highlighted && !isSori ? 0.2 : 0.8}
            />
            {(isSori || !highlighted) && (
              <g fill="#ca8a04" opacity={isSori ? 1 : 0.9}>
                <circle cx={100 - p.rx/3} cy={p.y - p.ry/2} r="2.5" />
                <circle cx={100 - 2*p.rx/3} cy={p.y - p.ry/3} r="2.5" />
                <circle cx={100 + p.rx/3} cy={p.y - p.ry/2} r="2.5" />
                <circle cx={100 + 2*p.rx/3} cy={p.y - p.ry/3} r="2.5" />
              </g>
            )}
          </g>
        );
      })}
      <circle 
        cx="100" cy="20" r="7" 
        fill="none" 
        stroke="#f43f5e" 
        strokeWidth={isApex ? "3.5" : "0"} 
        className="transition-all duration-300"
      />
    </svg>
  );
};

const renderDNACloseUp = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect width="100" height="100" fill="#f8fafc" rx="10" />
    <text x="15" y="45" fill="#ef4444" className="text-xs font-black">A</text>
    <text x="75" y="45" fill="#10b981" className="text-xs font-black">T</text>
    <line x1="30" y1="41" x2="70" y2="41" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3,3" />
    <line x1="30" y1="49" x2="70" y2="49" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3,3" />
    <text x="50" y="75" textAnchor="middle" fill="#64748b" className="text-[8px] font-bold">2 Hydrogen Bonds</text>
  </svg>
);

const renderFrogCloseUp = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect width="100" height="100" fill="#f8fafc" rx="10" />
    <path d="M 10 10 L 30 70 L 60 90 L 90 60 L 70 30 Z" fill="#d1fae5" stroke="#10b981" strokeWidth="1" />
    <path d="M 30 70 Q 50 50 70 30 M 40 40 Q 50 60 60 90 M 20 30 Q 40 60 90 60" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.7" />
    <text x="50" y="85" textAnchor="middle" fill="#047857" className="text-[7px] font-bold">Webbing & Capillaries</text>
  </svg>
);

const renderBeetleCloseUp = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect width="100" height="100" fill="#f8fafc" rx="10" />
    <path d="M 20 20 L 50 40 L 40 80 L 80 90" fill="none" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
    <line x1="35" y1="30" x2="25" y2="35" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="45" y1="36" x2="38" y2="45" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="45" y1="60" x2="35" y2="62" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="42" y1="70" x2="32" y2="68" stroke="#94a3b8" strokeWidth="1.5" />
    <text x="50" y="15" textAnchor="middle" fill="#475569" className="text-[7px] font-bold">Sensory Hairs (Olfaction)</text>
  </svg>
);

const renderStarfishCloseUp = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect width="100" height="100" fill="#f8fafc" rx="10" />
    <circle cx="50" cy="30" r="12" fill="#93c5fd" stroke="#2563eb" strokeWidth="1.5" />
    <path d="M 42 38 L 42 75 C 42 82 58 82 58 75 L 58 38 Z" fill="#dbeafe" stroke="#2563eb" strokeWidth="1.5" />
    <ellipse cx="50" cy="76" rx="10" ry="4" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
    <text x="50" y="92" textAnchor="middle" fill="#1e3a8a" className="text-[7px] font-bold">Ampulla & Tube Foot</text>
  </svg>
);

const renderAmoebaCloseUp = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect width="100" height="100" fill="#f8fafc" rx="10" />
    <path d="M 20 20 C 35 40 40 45 45 35 C 50 25 55 10 70 20 C 85 30 75 60 50 65 Z" fill="#d1fae5" stroke="#059669" strokeWidth="1" />
    <circle cx="48" cy="28" r="6" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
    <text x="50" y="85" textAnchor="middle" fill="#047857" className="text-[7px] font-bold">Phagocytosis (Ingestion)</text>
  </svg>
);

const renderFernCloseUp = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect width="100" height="100" fill="#f8fafc" rx="10" />
    <circle cx="50" cy="50" r="35" fill="none" stroke="#b45309" strokeWidth="2" strokeDasharray="3,3" />
    <circle cx="50" cy="50" r="10" fill="#ca8a04" opacity="0.8" />
    <circle cx="40" cy="40" r="8" fill="#ca8a04" opacity="0.8" />
    <circle cx="62" cy="42" r="9" fill="#ca8a04" opacity="0.8" />
    <circle cx="38" cy="58" r="9" fill="#ca8a04" opacity="0.8" />
    <circle cx="58" cy="58" r="8" fill="#ca8a04" opacity="0.8" />
    <circle cx="50" cy="32" r="7" fill="#ca8a04" opacity="0.8" />
    <circle cx="50" cy="68" r="7" fill="#ca8a04" opacity="0.8" />
    <text x="50" y="94" textAnchor="middle" fill="#78350f" className="text-[7px] font-bold">Sorus & Sporangia (Spores)</text>
  </svg>
);

// Samacheer Kalvi Practicals Specimen Renderers
const renderHydraSvg = (highlighted: string | null) => {
  const isTentacles = highlighted === "Tentacles";
  const isBody = highlighted === "Body Column";
  const isBud = highlighted === "Budding Zone";
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full max-h-[260px]">
      <rect width="200" height="200" rx="20" fill="transparent" />
      <path 
        d="M 100 170 C 95 110 100 70 100 60" 
        fill="none" 
        stroke={isBody ? "#fb7185" : "#10b981"} 
        strokeWidth="12" 
        strokeLinecap="round" 
        opacity={isBody ? 1 : highlighted ? 0.3 : 0.9} 
      />
      <path 
        d="M 98 120 C 80 115 70 100 65 95" 
        fill="none" 
        stroke={isBud ? "#fb7185" : "#10b981"} 
        strokeWidth="8" 
        strokeLinecap="round" 
        opacity={isBud ? 1 : highlighted ? 0.3 : 0.9} 
      />
      <path 
        d="M 100 60 Q 80 30 70 20 M 100 60 Q 90 25 90 15 M 100 60 Q 110 25 110 15 M 100 60 Q 120 30 130 20" 
        fill="none" 
        stroke={isTentacles ? "#fb7185" : "#059669"} 
        strokeWidth="4" 
        strokeLinecap="round" 
        opacity={isTentacles ? 1 : highlighted ? 0.3 : 0.9} 
      />
    </svg>
  );
};

const renderHydraIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full max-h-[140px]">
    <rect width="200" height="120" rx="15" fill="#0f172a" />
    <path d="M 100 105 C 95 70 100 45 100 40" fill="none" stroke="#34d399" strokeWidth="8" strokeLinecap="round" />
    <path d="M 100 40 Q 80 20 70 15 M 100 40 Q 92 18 90 10 M 100 40 Q 108 18 110 10 M 100 40 Q 120 20 130 15" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
    <text x="100" y="112" textAnchor="middle" fill="#34d399" className="text-[10px] font-black tracking-wider">Hydra vulgaris (Budding)</text>
  </svg>
);

const renderHydraCloseUp = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect width="100" height="100" fill="#f8fafc" rx="10" />
    <path d="M 50 20 C 35 45 35 75 50 85 C 65 75 65 45 50 20 Z" fill="#d1fae5" stroke="#10b981" strokeWidth="1.5" />
    <path d="M 50 20 L 50 45" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
    <text x="50" y="92" textAnchor="middle" fill="#047857" className="text-[7px] font-bold">Cnidocyte Stinger</text>
  </svg>
);

const renderAscarisSvg = (highlighted: string | null) => {
  const isMouth = highlighted === "Mouth Parts";
  const isTail = highlighted === "Curved Tail";
  const isBody = highlighted === "Cuticle Body";
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full max-h-[260px]">
      <rect width="200" height="200" rx="20" fill="transparent" />
      <path 
        d="M 50 30 Q 100 25 150 70 T 130 170" 
        fill="none" 
        stroke={isBody ? "#f43f5e" : "#fbcfe8"} 
        strokeWidth="10" 
        strokeLinecap="round" 
        opacity={isBody ? 1 : highlighted ? 0.3 : 0.9} 
      />
      <circle cx="50" cy="30" r="8" fill={isMouth ? "#f43f5e" : "#db2777"} opacity={isMouth ? 1 : highlighted ? 0.3 : 0.9} />
      <path 
        d="M 130 170 Q 120 185 105 180" 
        fill="none" 
        stroke={isTail ? "#f43f5e" : "#db2777"} 
        strokeWidth="6" 
        strokeLinecap="round" 
        opacity={isTail ? 1 : highlighted ? 0.3 : 0.9} 
      />
    </svg>
  );
};

const renderAscarisIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full max-h-[140px]">
    <rect width="200" height="120" rx="15" fill="#fdf2f8" />
    <path d="M 30 40 Q 100 25 170 65 T 150 100" fill="none" stroke="#fbcfe8" strokeWidth="8" strokeLinecap="round" />
    <path d="M 30 40 Q 100 25 170 65 T 150 100" fill="none" stroke="#f472b6" strokeWidth="4" strokeLinecap="round" />
    <text x="100" y="112" textAnchor="middle" fill="#db2777" className="text-[10px] font-black tracking-wider">Ascaris lumbricoides</text>
  </svg>
);

const renderAscarisCloseUp = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect width="100" height="100" fill="#f8fafc" rx="10" />
    <circle cx="50" cy="50" r="30" fill="none" stroke="#db2777" strokeWidth="3" />
    <circle cx="50" cy="50" r="10" fill="#fbcfe8" />
    <text x="50" y="92" textAnchor="middle" fill="#db2777" className="text-[7px] font-bold">Cuticle Layer T.S.</text>
  </svg>
);

const renderPlasmodiumSvg = (highlighted: string | null) => {
  const isRbc = highlighted === "Host Erythrocyte";
  const isRing = highlighted === "Signet Ring Trophozoite";
  const isNucleus = highlighted === "Chromatin Dot";
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full max-h-[260px]">
      <rect width="200" height="200" rx="20" fill="transparent" />
      <circle cx="100" cy="100" r="80" fill={isRbc ? "#fecdd3" : "#ffe4e6"} stroke="#f43f5e" strokeWidth="4" opacity={isRbc ? 1 : highlighted ? 0.3 : 0.8} />
      <circle cx="110" cy="90" r="25" fill="none" stroke={isRing ? "#4f46e5" : "#818cf8"} strokeWidth="5" opacity={isRing ? 1 : highlighted ? 0.3 : 0.9} />
      <circle cx="128" cy="78" r="8" fill={isNucleus ? "#f43f5e" : "#be123c"} opacity={isNucleus ? 1 : highlighted ? 0.3 : 0.9} />
    </svg>
  );
};

const renderPlasmodiumIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full max-h-[140px]">
    <rect width="200" height="120" rx="15" fill="#881337" />
    <circle cx="100" cy="60" r="45" fill="#fda4af" opacity="0.4" />
    <circle cx="110" cy="55" r="15" fill="none" stroke="#f472b6" strokeWidth="3" />
    <circle cx="120" cy="48" r="5" fill="#f43f5e" />
    <text x="100" y="112" textAnchor="middle" fill="#fecdd3" className="text-[10px] font-black tracking-wider">Plasmodium Signet Ring</text>
  </svg>
);

const renderPlasmodiumCloseUp = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect width="100" height="100" fill="#f8fafc" rx="10" />
    <path d="M 30 70 L 40 40 L 70 30 L 60 70 Z" fill="#818cf8" opacity="0.7" />
    <text x="50" y="92" textAnchor="middle" fill="#4f46e5" className="text-[7px] font-bold">Merozoite Apex</text>
  </svg>
);

const renderMitosisSvg = (highlighted: string | null) => {
  const isWall = highlighted === "Cell Wall";
  const isChromosomes = highlighted === "Spindle Fibres & Chromosomes";
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full max-h-[260px]">
      <rect width="200" height="200" rx="20" fill="transparent" />
      <rect x="20" y="20" width="160" height="160" rx="10" fill="none" stroke={isWall ? "#10b981" : "#34d399"} strokeWidth="5" opacity={isWall ? 1 : highlighted ? 0.3 : 0.9} />
      <line x1="100" y1="40" x2="100" y2="160" stroke="#a855f7" strokeWidth="2" strokeDasharray="5,5" opacity={isChromosomes ? 1 : highlighted ? 0.3 : 0.5} />
      <path d="M 90 70 L 100 100 L 90 130 M 110 70 L 100 100 L 110 130" fill="none" stroke={isChromosomes ? "#c084fc" : "#a855f7"} strokeWidth="6" strokeLinecap="round" opacity={isChromosomes ? 1 : highlighted ? 0.3 : 0.9} />
    </svg>
  );
};

const renderMitosisIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full max-h-[140px]">
    <rect width="200" height="120" rx="15" fill="#4c1d95" />
    <rect x="40" y="20" width="120" height="80" rx="5" fill="none" stroke="#c084fc" strokeWidth="3" />
    <path d="M 80 40 L 95 60 L 80 80 M 120 40 L 105 60 L 120 80" fill="none" stroke="#e9d5ff" strokeWidth="4" strokeLinecap="round" />
    <text x="100" y="112" textAnchor="middle" fill="#e9d5ff" className="text-[10px] font-black tracking-wider">Metaphase (Allium cepa)</text>
  </svg>
);

const renderMitosisCloseUp = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect width="100" height="100" fill="#f8fafc" rx="10" />
    <circle cx="50" cy="50" r="15" fill="#c084fc" opacity="0.3" />
    <path d="M 45 40 L 55 60 M 55 40 L 45 60" stroke="#a855f7" strokeWidth="3" />
    <text x="50" y="92" textAnchor="middle" fill="#701a75" className="text-[7px] font-bold">Centromere & Chromatids</text>
  </svg>
);

const renderPigeonSvg = (highlighted: string | null) => {
  const isBeak = highlighted === "Pneumatic Beak";
  const isWings = highlighted === "Keel & Wing Bones";
  const isSacs = highlighted === "Respiratory Air Sacs";
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full max-h-[260px]">
      <rect width="200" height="200" rx="20" fill="transparent" />
      <path d="M 60 80 C 70 50 110 50 130 70 C 150 90 160 120 120 160 C 90 190 60 160 60 140 Z" fill="none" stroke={isWings ? "#f59e0b" : "#bfdbfe"} strokeWidth="5" opacity={isWings ? 1 : highlighted ? 0.3 : 0.8} />
      <path d="M 60 80 L 40 85 L 60 95 Z" fill={isBeak ? "#ef4444" : "#f59e0b"} opacity={isBeak ? 1 : highlighted ? 0.3 : 0.9} />
      <circle cx="100" cy="100" r="15" fill={isSacs ? "#60a5fa" : "#93c5fd"} opacity={isSacs ? 1 : highlighted ? 0.3 : 0.6} />
      <circle cx="120" cy="115" r="10" fill={isSacs ? "#60a5fa" : "#93c5fd"} opacity={isSacs ? 1 : highlighted ? 0.3 : 0.6} />
    </svg>
  );
};

const renderPigeonIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full max-h-[140px]">
    <rect width="200" height="120" rx="15" fill="#0f172a" />
    <path d="M 50 80 C 60 50 100 50 120 70 C 140 90 150 110 120 100 Z" fill="#64748b" />
    <path d="M 50 80 L 35 85 L 50 90 Z" fill="#f59e0b" />
    <text x="100" y="112" textAnchor="middle" fill="#93c5fd" className="text-[10px] font-black tracking-wider">Columba livia (Rock Pigeon)</text>
  </svg>
);

const renderPigeonCloseUp = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <rect width="100" height="100" fill="#f8fafc" rx="10" />
    <circle cx="50" cy="25" r="2" fill="none" />
    <circle cx="50" cy="50" r="25" fill="none" stroke="#64748b" strokeWidth="4" />
    <line x1="30" y1="40" x2="70" y2="60" stroke="#94a3b8" strokeWidth="1.5" />
    <line x1="35" y1="65" x2="65" y2="35" stroke="#94a3b8" strokeWidth="1.5" />
    <text x="50" y="92" textAnchor="middle" fill="#334155" className="text-[7px] font-bold">Pneumatic Air Struts</text>
  </svg>
);

// Illustrations
const renderDNALogicalIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full max-h-[140px]">
    <defs>
      <linearGradient id="backboneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <rect width="200" height="120" rx="15" fill="#1e1b4b" />
    <path d="M 10 30 Q 50 90 100 30 T 190 30" fill="none" stroke="url(#backboneGrad)" strokeWidth="6" strokeLinecap="round" />
    <path d="M 10 90 Q 50 30 100 90 T 190 90" fill="none" stroke="url(#backboneGrad)" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
    {[25, 55, 85, 115, 145, 175].map((x, i) => {
      const y1 = 30 + Math.sin(x/30)*30;
      const y2 = 90 - Math.sin(x/30)*30;
      return (
        <line key={x} x1={x} y1={y1} x2={x} y2={y2} stroke="#38bdf8" strokeWidth="3" strokeDasharray="1,1" />
      );
    })}
    <text x="100" y="110" textAnchor="middle" fill="#93c5fd" className="text-[10px] font-black tracking-wider">3D Double Helix Model</text>
  </svg>
);

const renderFrogLogicalIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full max-h-[140px]">
    <rect width="200" height="120" rx="15" fill="#064e3b" />
    <ellipse cx="100" cy="100" rx="80" ry="25" fill="#374151" />
    <ellipse cx="100" cy="98" rx="75" ry="20" fill="#4b5563" />
    <ellipse cx="100" cy="70" rx="35" ry="20" fill="#10b981" />
    <circle cx="85" cy="65" r="4" fill="#047857" />
    <circle cx="115" cy="65" r="4" fill="#047857" />
    <circle cx="100" cy="60" r="5" fill="#047857" />
    <circle cx="100" cy="78" r="3" fill="#047857" />
    <path d="M 65 70 C 65 50 135 50 135 70 Z" fill="#10b981" />
    <circle cx="82" cy="55" r="7" fill="#fbbf24" />
    <circle cx="82" cy="55" r="3" fill="#000000" />
    <circle cx="118" cy="55" r="7" fill="#fbbf24" />
    <circle cx="118" cy="55" r="3" fill="#000000" />
    <path d="M 65 75 Q 50 85 55 95" fill="none" stroke="#059669" strokeWidth="8" strokeLinecap="round" />
    <path d="M 135 75 Q 150 85 145 95" fill="none" stroke="#059669" strokeWidth="8" strokeLinecap="round" />
    <text x="100" y="112" textAnchor="middle" fill="#a7f3d0" className="text-[10px] font-black tracking-wider">Hoplobatrachus tigerinus</text>
  </svg>
);

const renderBeetleLogicalIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full max-h-[140px]">
    <rect width="200" height="120" rx="15" fill="#1c1917" />
    <rect x="20" y="90" width="160" height="15" rx="5" fill="#78350f" />
    <line x1="20" y1="97" x2="180" y2="97" stroke="#451a03" strokeWidth="2" />
    <rect x="80" y="45" width="40" height="50" rx="15" fill="#292524" />
    <rect x="85" y="30" width="30" height="15" rx="5" fill="#44403c" />
    <path d="M 90 30 Q 80 10 70 15 Q 85 22 92 30" fill="#78716c" />
    <path d="M 110 30 Q 120 10 130 15 Q 115 22 108 30" fill="#78716c" />
    <path d="M 80 50 L 60 45" fill="none" stroke="#44403c" strokeWidth="3" strokeLinecap="round" />
    <path d="M 120 50 L 140 45" fill="none" stroke="#44403c" strokeWidth="3" strokeLinecap="round" />
    <path d="M 80 70 L 60 75" fill="none" stroke="#44403c" strokeWidth="3" strokeLinecap="round" />
    <path d="M 120 70 L 140 75" fill="none" stroke="#44403c" strokeWidth="3" strokeLinecap="round" />
    <text x="100" y="112" textAnchor="middle" fill="#d6d3d1" className="text-[10px] font-black tracking-wider">Lucanidae (Stag Beetle)</text>
  </svg>
);

const renderStarfishLogicalIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full max-h-[140px]">
    <rect width="200" height="120" rx="15" fill="#0f172a" />
    <path d="M 0 100 Q 100 80 200 100 L 200 120 L 0 120 Z" fill="#fef08a" opacity="0.3" />
    <g transform="translate(100, 60) scale(0.6)">
      <path d="M 0 -70 L 18 -15 L 70 0 L 18 15 L 0 70 L -18 15 L -70 0 L -18 -15 Z" fill="#ea580c" stroke="#9a3412" strokeWidth="4" />
      <circle cx="0" cy="-35" r="3" fill="#ffedd5" />
      <circle cx="35" cy="0" r="3" fill="#ffedd5" />
      <circle cx="0" cy="35" r="3" fill="#ffedd5" />
      <circle cx="-35" cy="0" r="3" fill="#ffedd5" />
      <circle cx="0" cy="0" r="6" fill="#ffedd5" />
    </g>
    <text x="100" y="112" textAnchor="middle" fill="#fdba74" className="text-[10px] font-black tracking-wider">Asterias rubens (Sea Star)</text>
  </svg>
);

const renderAmoebaLogicalIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full max-h-[140px]">
    <rect width="200" height="120" rx="15" fill="#090d16" />
    <circle cx="100" cy="60" r="50" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
    <path d="M 75 40 C 60 50 65 75 80 85 C 95 95 125 90 135 70 C 145 50 120 40 100 45 C 90 50 85 30 75 40 Z" fill="#38bdf8" fillOpacity="0.4" stroke="#0284c7" strokeWidth="2" />
    <circle cx="102" cy="65" r="7" fill="#818cf8" stroke="#4f46e5" strokeWidth="1.5" />
    <circle cx="85" cy="70" r="5" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1" />
    <circle cx="120" cy="55" r="4" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
    <text x="100" y="112" textAnchor="middle" fill="#bae6fd" className="text-[10px] font-black tracking-wider">Microscopic Phase Contrast</text>
  </svg>
);

const renderFernLogicalIllustration = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full max-h-[140px]">
    <rect width="200" height="120" rx="15" fill="#022c22" />
    <path d="M 30 110 Q 90 60 180 80" fill="none" stroke="#065f46" strokeWidth="6" strokeLinecap="round" opacity="0.3" />
    <path d="M 20 100 Q 80 30 170 40" fill="none" stroke="#059669" strokeWidth="4" strokeLinecap="round" />
    {[45, 65, 85, 105, 125, 145].map((x) => {
      const y = 100 + Math.sin(x/40)*-40;
      return (
        <g key={x}>
          <path d={`M ${x} ${y} Q ${x-10} ${y-15} ${x-15} ${y-12}`} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
          <path d={`M ${x} ${y} Q ${x+10} ${y-15} ${x+15} ${y-12}`} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    })}
    <text x="100" y="112" textAnchor="middle" fill="#a7f3d0" className="text-[10px] font-black tracking-wider">Pteridophyta (Fern Leaf)</text>
  </svg>
);

const SPECIMEN_DETAILS: Record<string, {
  parts: { name: string; desc: string }[];
  tip: string;
  question: string;
  closeupTitle: string;
  closeupDesc: string;
  visualFact: string;
  renderIllustration: () => React.ReactNode;
  renderSvg: (highlighted: string | null) => React.ReactNode;
  renderCloseUpSvg: () => React.ReactNode;
}> = {
  "dna double helix": {
    parts: [
      { name: "Phosphate Backbone", desc: "The strong outer frame made of sugar and phosphate molecules." },
      { name: "Base Pairs", desc: "Adenine-Thymine (A-T) and Cytosine-Guanine (C-G) pairs carrying the genetic code." },
      { name: "Hydrogen Bonds", desc: "Weak chemical bonds that hold the base pairs together in the middle." },
      { name: "Minor Groove", desc: "The smaller gap in the twisting DNA strands where proteins can bind." }
    ],
    tip: "Explain to students that human DNA is so long that if you uncoiled it, it would stretch to the Moon and back 150 times!",
    question: "Why do you think the hydrogen bonds are weak instead of strong covalent bonds?",
    closeupTitle: "Hydrogen Bond Zoom",
    closeupDesc: "Close-up of A-T and C-G pairings showing the 2 and 3 hydrogen bonds connecting the nucleotides.",
    visualFact: "If you uncoiled all the DNA in your body, it would stretch to Pluto and back!",
    renderIllustration: renderDNALogicalIllustration,
    renderSvg: renderDNASvg,
    renderCloseUpSvg: renderDNACloseUp
  },
  "indian bullfrog": {
    parts: [
      { name: "Tympanum", desc: "External hearing organ that acts like an eardrum." },
      { name: "Nictitating Membrane", desc: "Transparent third eyelid that protects the eye and keeps it moist while swimming." },
      { name: "Webbed Feet", desc: "Folds of skin between toes that act like paddles for swimming." },
      { name: "Heart (3-Chambered)", desc: "Consists of two atria and one ventricle, mixing oxygenated and deoxygenated blood." },
      { name: "Liver (3 Lobes)", desc: "Produces bile and filters toxins, relatively large compared to body size." }
    ],
    tip: "Point out the tympanum (the circular patch behind the eye) which functions like an eardrum for hearing on land and underwater!",
    question: "How does the frog's skin help it breathe underwater?",
    closeupTitle: "Webbing Structure",
    closeupDesc: "Close-up of the webbed skin structure showing the network of capillaries that assist in respiration.",
    visualFact: "Indian Bullfrogs can change color from dull olive-green to bright yellow during the breeding season!",
    renderIllustration: renderFrogLogicalIllustration,
    renderSvg: renderFrogSvg,
    renderCloseUpSvg: renderFrogCloseUp
  },
  "giant stag beetle": {
    parts: [
      { name: "Mandibles", desc: "Elongated jaws used by males to wrestle rivals during mating season." },
      { name: "Antennae", desc: "Elbowed sensory organs used to smell food, sense vibration, and navigate." },
      { name: "Elytra", desc: "Modified front wings that act as protective shields for the delicate flying wings underneath." },
      { name: "Thorax (Pronotum)", desc: "The muscular chest section that supports the legs and wings." },
      { name: "Abdomen", desc: "Segmented rear containing the digestive and reproductive organs." }
    ],
    tip: "Explain that male stag beetles use their massive mandibles to wrestle rivals, not for biting humans or eating!",
    question: "What purpose do you think the hard outer shell (elytra) serves for the beetle?",
    closeupTitle: "Antenna Detail",
    closeupDesc: "Elbowed structure showing microscopic sensory receptors that detect pheromones and food sources.",
    visualFact: "Stag beetles spend up to 7 years living underground as larvae, but only live for a few weeks as adult beetles!",
    renderIllustration: renderBeetleLogicalIllustration,
    renderSvg: renderBeetleSvg,
    renderCloseUpSvg: renderBeetleCloseUp
  },
  "starfish specimen": {
    parts: [
      { name: "Madreporite", desc: "The porous sieve plate that draws seawater into the water vascular system." },
      { name: "Central Disc", desc: "The core body area containing the mouth, stomach, and starts of all radial canals." },
      { name: "Tube Feet", desc: "Hydraulic suction cups controlled by water pressure, used for walking and opening prey." },
      { name: "Radial Canal", desc: "Water tubes that run the length of each arm to power the tube feet." },
      { name: "Spiny Exoskeleton", desc: "Calcium carbonate plates (ossicles) that provide structural protection." }
    ],
    tip: "Highlight the water vascular system — they pump seawater to operate their tube feet like hydraulic suction cups!",
    question: "If a starfish loses one of its arms, what happens?",
    closeupTitle: "Tube Foot Mechanism",
    closeupDesc: "Magnification of the ampulla bulb and the suction cup structure that creates hydraulic movement.",
    visualFact: "Starfish don't have blood! Instead, they pump sea water through their entire body to transport nutrients.",
    renderIllustration: renderStarfishLogicalIllustration,
    renderSvg: renderStarfishSvg,
    renderCloseUpSvg: renderStarfishCloseUp
  },
  "amoeba proteus": {
    parts: [
      { name: "Pseudopodia", desc: "Temporary 'false feet' created by flowing cytoplasm, used for crawling and capturing prey." },
      { name: "Nucleus", desc: "The control centre of the cell, containing DNA." },
      { name: "Contractile Vacuole", desc: "Pumps excess water out of the cell to prevent the amoeba from swelling and bursting." },
      { name: "Food Vacuole", desc: "Temporary stomach where digestion of engulfed algae or bacteria occurs." },
      { name: "Ectoplasm/Endoplasm", desc: "Gel-like outer layer and fluid-like inner layer that enable cytoplasmic streaming." }
    ],
    tip: "Watch the contractile vacuole contract and expand; it acts like a pump to keep the freshwater amoeba from bursting!",
    question: "How does a single-celled organism like amoeba eat food without a mouth?",
    closeupTitle: "Food Ingestion",
    closeupDesc: "Diagram of phagocytosis, showing how the pseudopodia surround and engulf a food particle.",
    visualFact: "Amoebas are practically immortal! Instead of dying, they divide themselves into two identical clones through binary fission.",
    renderIllustration: renderAmoebaLogicalIllustration,
    renderSvg: renderAmoebaSvg,
    renderCloseUpSvg: renderAmoebaCloseUp
  },
  "fern leaf section": {
    parts: [
      { name: "Apex", desc: "The growing tip where new leaflets emerge." },
      { name: "Pinnae", desc: "The individual leaf divisions (leaflets) extending from the main stem." },
      { name: "Rachis", desc: "The central axis of the frond supporting the pinnae." },
      { name: "Stipe", desc: "The lower leaf stalk connecting the frond to the rhizome." },
      { name: "Sori", desc: "Clusters of spore-producing bags (sporangia) for reproduction." }
    ],
    tip: "Flip a fern leaf to show students the brown dots (sori). They aren't dirt or a disease, they are packages containing millions of reproductive spores!",
    question: "How is reproducing by spores different from reproducing by seeds?",
    closeupTitle: "Sorus Close-up",
    closeupDesc: "Detailed view of the sporangia clusters containing spores, situated on the underside of a leaflet.",
    visualFact: "Ferns existed on Earth 200 million years before dinosaurs! They are living fossils that reproduce without seeds.",
    renderIllustration: renderFernLogicalIllustration,
    renderSvg: renderFernSvg,
    renderCloseUpSvg: renderFernCloseUp
  },
  "hydra specimen": {
    parts: [
      { name: "Tentacles", desc: "Slender appendages surrounding the mouth containing stinging cells for capture." },
      { name: "Body Column", desc: "The main tubular trunk that contracts or stretches." },
      { name: "Budding Zone", desc: "The area near the base where a small offspring grows and eventually detaches." }
    ],
    tip: "Point out the tentacles and budding zone. Discuss asexual reproduction (budding) in simple multicellular organisms.",
    question: "How does the stinging cell (cnidocyte) help Hydra capture prey and defend itself?",
    closeupTitle: "Cnidocyte Structure",
    closeupDesc: "Close-up showing the coiled stinging thread (nematocyst) inside the cell ready to fire.",
    visualFact: "Hydras are biologically immortal! They do not show signs of aging and can regenerate their entire body from a tiny piece.",
    renderIllustration: renderHydraIllustration,
    renderSvg: renderHydraSvg,
    renderCloseUpSvg: renderHydraCloseUp
  },
  "ascaris roundworm": {
    parts: [
      { name: "Mouth Parts", desc: "Has three lips used for attaching to the host's intestinal wall." },
      { name: "Curved Tail", desc: "The curved posterior end characteristic of male worms, containing pineal spicules." },
      { name: "Cuticle Body", desc: "A tough, smooth outer layer that protects the parasite from host digestive enzymes." }
    ],
    tip: "Show the distinct sexual dimorphism: males are smaller with a curved tail, while females are larger with a straight tail.",
    question: "What adaptations make Ascaris an effective intestinal parasite in humans?",
    closeupTitle: "Cuticle Layer T.S.",
    closeupDesc: "Cross-section illustrating the multi-layered proteinaceous cuticle guarding the syncytial epidermis.",
    visualFact: "A single female Ascaris worm can lay up to 200,000 eggs per day in the host's intestine!",
    renderIllustration: renderAscarisIllustration,
    renderSvg: renderAscarisSvg,
    renderCloseUpSvg: renderAscarisCloseUp
  },
  "plasmodium ring stage": {
    parts: [
      { name: "Host Erythrocyte", desc: "Human red blood cell housing the replicating intracellular parasite." },
      { name: "Signet Ring Trophozoite", desc: "The active feeding stage resembling a ring with a large vacuole." },
      { name: "Chromatin Dot", desc: "The dark nucleus of the parasite visible at one edge of the ring." }
    ],
    tip: "Have students look for the distinct 'signet ring' shape inside the red blood cell, which is the young trophozoite stage of the parasite.",
    question: "Why does the parasite choose to replicate inside red blood cells?",
    closeupTitle: "Merozoite Apex",
    closeupDesc: "Detailed structural view of the apical complex organelles used to penetrate erythrocyte membranes.",
    visualFact: "The malaria parasite has a complex lifecycle requiring two hosts: female Anopheles mosquitoes and humans.",
    renderIllustration: renderPlasmodiumIllustration,
    renderSvg: renderPlasmodiumSvg,
    renderCloseUpSvg: renderPlasmodiumCloseUp
  },
  "onion root tip mitosis": {
    parts: [
      { name: "Cell Wall", desc: "Rigid outer cellulose layer defining the rectangular cell boundaries." },
      { name: "Spindle Fibres & Chromosomes", desc: "Protein fibres that pull the aligned chromatids to opposite poles." },
      { name: "Cytoplasm Division", desc: "The formation of a cell plate in telophase to partition the cells." }
    ],
    tip: "Help students identify the different stages of mitosis: Prophase, Metaphase, Anaphase, and Telophase on the slide.",
    question: "Why is it important for the chromosomes to align perfectly at the metaphase plate before dividing?",
    closeupTitle: "Centromere & Chromatids",
    closeupDesc: "Detailed magnification showing the centromere connecting twin sister chromatids.",
    visualFact: "Mitosis is the process of cell division where one parent cell splits into two identical daughter cells, maintaining the chromosome number!",
    renderIllustration: renderMitosisIllustration,
    renderSvg: renderMitosisSvg,
    renderCloseUpSvg: renderMitosisCloseUp
  },
  "rock pigeon": {
    parts: [
      { name: "Pneumatic Beak", desc: "Lightweight keratinized jaw structure adapted for seed pecking." },
      { name: "Keel & Wing Bones", desc: "The large keel bone (sternum) where powerful flight muscles are attached." },
      { name: "Respiratory Air Sacs", desc: "Internal air reservoirs that provide a continuous flow of fresh oxygen to lungs." }
    ],
    tip: "Point out the streamlined body shape and the large keel bone (sternum) where powerful flight muscles are attached.",
    question: "How do pneumatic bones and air sacs assist a bird during high-altitude flight?",
    closeupTitle: "Pneumatic Bone",
    closeupDesc: "Cross-section showing hollow struts and air cavities that reduce bone density and weight without losing strength.",
    visualFact: "Pigeons have hollow (pneumatic) bones filled with air to reduce body weight for efficient flight!",
    renderIllustration: renderPigeonIllustration,
    renderSvg: renderPigeonSvg,
    renderCloseUpSvg: renderPigeonCloseUp
  }
};

const getSpecimenDetails = (name: string) => {
  const n = name.toLowerCase().trim();
  if (n.includes("dna")) return SPECIMEN_DETAILS["dna double helix"];
  if (n.includes("frog") || n.includes("bullfrog")) return SPECIMEN_DETAILS["indian bullfrog"];
  if (n.includes("beetle")) return SPECIMEN_DETAILS["giant stag beetle"];
  if (n.includes("starfish")) return SPECIMEN_DETAILS["starfish specimen"];
  if (n.includes("amoeba")) return SPECIMEN_DETAILS["amoeba proteus"];
  if (n.includes("fern") || n.includes("leaf")) return SPECIMEN_DETAILS["fern leaf section"];
  if (n.includes("hydra")) return SPECIMEN_DETAILS["hydra specimen"];
  if (n.includes("ascaris") || n.includes("worm")) return SPECIMEN_DETAILS["ascaris roundworm"];
  if (n.includes("plasmodium") || n.includes("malaria")) return SPECIMEN_DETAILS["plasmodium ring stage"];
  if (n.includes("onion") || n.includes("mitosis")) return SPECIMEN_DETAILS["onion root tip mitosis"];
  if (n.includes("pigeon") || n.includes("bird")) return SPECIMEN_DETAILS["rock pigeon"];
  
  return {
    parts: [
      { name: "External Layer", desc: "The protective outer skin or cell wall guarding the specimen." },
      { name: "Internal Structure", desc: "The core organs or organelles performing biological functions." },
      { name: "Functional Parts", desc: "Features that allow the organism to move, eat, or interact with its environment." }
    ],
    tip: "Encourage students to observe the visual symmetry and distinct anatomical layers of the specimen.",
    question: "What characteristics help this organism survive in its natural habitat?",
    closeupTitle: "Microscopic Zoom",
    closeupDesc: "Magnified detail of the specimen's tissue structure showing cellular composition.",
    visualFact: "Biology centers around understanding the relationships and cellular behaviors of all life forms.",
    renderIllustration: () => (
      <svg viewBox="0 0 200 120" className="w-full h-full max-h-[140px]">
        <rect width="200" height="120" rx="15" fill="#0f172a" />
        <circle cx="100" cy="60" r="40" fill="#1e293b" stroke="#334155" strokeWidth="2" />
        <text x="100" y="112" textAnchor="middle" fill="#94a3b8" className="text-[10px] font-black tracking-wider">Specimen Observation</text>
      </svg>
    ),
    renderSvg: (highlighted: string | null) => (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[300px]">
        <rect width="200" height="200" rx="20" fill="transparent" />
        <circle cx="100" cy="100" r="60" fill="#f1f5f9" stroke="#64748b" strokeWidth="3" opacity={highlighted ? 0.4 : 0.9} />
        <circle cx="100" cy="100" r="30" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" opacity={highlighted ? 0.4 : 0.9} />
        <path d="M 60 100 L 140 100 M 100 60 L 100 140" stroke="#cbd5e1" strokeWidth="1.5" />
      </svg>
    ),
    renderCloseUpSvg: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect width="100" height="100" fill="#f8fafc" rx="10" />
        <circle cx="50" cy="50" r="25" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
        <text x="50" y="90" textAnchor="middle" fill="#64748b" className="text-[7px] font-bold">Cellular View</text>
      </svg>
    )
  };
};

export default function ZoologyCentrePage() {
  const { data: session } = useSession();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const schoolId = (session?.user as any)?.schoolId;

  const [tab, setTab] = useState<Tab>("study");
  const [grade, setGrade] = useState<number>(8);
  const [detected, setDetected] = useState<number | null>(null);
  const [allowedGrades, setAllowedGrades] = useState<number[]>(AVAILABLE_GRADES);
  const [openUnit, setOpenUnit] = useState<ZoologyUnit | null>(null);
  const [inspectSpec, setInspectSpec] = useState<Specimen | null>(null);
  const [highlightedPart, setHighlightedPart] = useState<string | null>(null);

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
            const rawClassStr = String(me.class).toLowerCase();
            const roman: Record<string, number> = { viii: 8, x: 10, xi: 11, ix: 9, xii: 12 };
            let parsedClass: number | null = null;
            for (const [r, cl] of Object.entries(roman)) {
              if (new RegExp(`\\b${r}\\b`).test(rawClassStr)) {
                parsedClass = cl;
                break;
              }
            }
            if (parsedClass === null) {
              const num = parseInt(rawClassStr.replace(/[^0-9]/g, ""), 10);
              parsedClass = isNaN(num) ? null : num;
            }

            let levelGrades = AVAILABLE_GRADES;
            if (parsedClass !== null) {
              if (parsedClass >= 11) {
                levelGrades = [11];
              } else if (parsedClass === 9 || parsedClass === 10) {
                levelGrades = [10];
              } else if (parsedClass <= 8) {
                levelGrades = [8];
              }
            }
            setAllowedGrades(levelGrades);

            if (parsedClass && AVAILABLE_GRADES.includes(parsedClass)) {
              setDetected(parsedClass);
              setGrade(parsedClass);
            } else {
              // Default to closest available grade but do not lock
              const g = resolveGrade(me.class);
              setGrade(g);
              setDetected(null);
            }
          }
        }
      } catch {
        /* fall back to manual switcher */
      }
    })();
  }, [session, API_URL]);

  const gradeData = ZOOLOGY_SYLLABUS[grade];

  // --- has a teacher approved (published) this grade? ---
  const [published, setPublished] = useState<boolean | null>(true);
  useEffect(() => {
    setPublished(true);
  }, [grade]);

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

  const filteredSpecimens = (() => {
    const seenNames = new Set<string>();
    const res: Specimen[] = [];
    specimens.forEach(s => {
      const isMatch = s.name.toLowerCase().includes(q.toLowerCase()) || s.category.toLowerCase().includes(q.toLowerCase());
      if (isMatch) {
        const nameKey = s.name.toLowerCase().trim();
        if (!seenNames.has(nameKey)) {
          seenNames.add(nameKey);
          res.push(s);
        }
      }
    });
    return res;
  })();

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
                {detected ? "Your class" : (allowedGrades.length === 1 ? "Syllabus Class" : "Choose your class")}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {(detected ? [detected] : allowedGrades).map((g) => (
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
                <p className="text-2xl font-black mb-2" style={{ color: "#fff" }}>{gradeData.book}</p>
                <p className="!text-white/85 text-sm font-medium leading-relaxed">{gradeData.intro}</p>
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
                <div className="p-2 bg-emerald-100 text-emerald-650 rounded-xl"><Dna className="w-6 h-6" /></div>
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
          <div className="bg-white dark:bg-slate-905 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center">
                  <i className="fi fi-rr-bug text-lg"></i>
                </div>
                Lab Specimen Collection
              </h3>
              <div className="relative w-full sm:w-72">
                <i className="fi fi-rr-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search specimens…"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                />
              </div>
            </div>
            {loadingSpec ? (
              <div className="text-center py-16 text-slate-400 text-xs font-bold animate-pulse">Loading specimens…</div>
            ) : filteredSpecimens.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSpecimens.map((sp) => {
                  const getIconClass = (category: string) => {
                    const c = category.toLowerCase();
                    if (c.includes("genetics")) return "fi fi-rr-dna";
                    if (c.includes("anatomy")) return "fi fi-rr-paw";
                    if (c.includes("marine")) return "fi fi-rr-fish";
                    if (c.includes("botany")) return "fi fi-rr-leaf";
                    return "fi fi-rr-bug";
                  };

                  const getColors = (category: string) => {
                    const c = category.toLowerCase();
                    if (c.includes("genetics")) return { softBg: "bg-purple-50 dark:bg-purple-950/30", textColor: "text-purple-500 dark:text-purple-450", border: "border-purple-100/50" };
                    if (c.includes("anatomy")) return { softBg: "bg-amber-50 dark:bg-amber-950/30", textColor: "text-amber-500 dark:text-amber-450", border: "border-amber-100/50" };
                    if (c.includes("marine")) return { softBg: "bg-sky-50 dark:bg-sky-950/30", textColor: "text-sky-500 dark:text-sky-450", border: "border-sky-100/50" };
                    if (c.includes("botany")) return { softBg: "bg-emerald-50 dark:bg-emerald-950/30", textColor: "text-emerald-500 dark:text-emerald-450", border: "border-emerald-100/50" };
                    return { softBg: "bg-emerald-50 dark:bg-emerald-950/30", textColor: "text-emerald-500 dark:text-emerald-450", border: "border-emerald-100/50" };
                  };

                  const icClass = getIconClass(sp.category);
                  const s = getColors(sp.category);

                  return (
                    <button 
                      key={sp.id} 
                      onClick={() => setInspectSpec(sp)}
                      className="text-left group p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col h-full cursor-pointer focus:outline-none"
                    >
                      <div className="flex justify-between items-start mb-4 z-10">
                        <div className={`w-12 h-12 rounded-xl ${s.softBg} ${s.textColor} flex items-center justify-center border ${s.border}`}>
                          <i className={`${icClass} text-lg`}></i>
                        </div>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mb-1 z-10 leading-snug">{sp.name}</h4>
                      <p className="text-[11px] font-bold text-slate-450 mb-4 z-10 uppercase tracking-wide">{sp.category}</p>
                      
                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center z-10 w-full">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 px-2.5 py-1 rounded-lg">
                          {sp.type}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-sm font-bold bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                No specimens catalogued for your school yet. Ask your teacher to add lab specimens. <i className="fi fi-rr-bug ml-1 text-inherit animate-bounce"></i>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============ UNIT STUDY MODAL ============ */}
      {openUnit && <UnitStudyView unit={openUnit} onClose={() => setOpenUnit(null)} />}

      {/* ============ INSPECT SPECIMEN MODAL ============ */}
      {inspectSpec && (() => {
        const details = getSpecimenDetails(inspectSpec.name);
        return (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl shadow-2xl animate-in zoom-in-95 p-6 md:p-8 relative overflow-hidden flex flex-col lg:flex-row gap-8 border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              
              <button 
                onClick={() => {
                  setInspectSpec(null);
                  setHighlightedPart(null);
                }} 
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-slate-800 transition-all shadow-sm z-20"
              >
                <i className="fi fi-rr-cross-small text-lg"></i>
              </button>

              {/* Left Column: Visuals & Diagrams */}
              <div className="flex-1 flex flex-col space-y-6">
                
                {/* 1. Real Specimen Photo / Scientific Illustration */}
                <div className="w-full bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-150 dark:border-slate-850 flex flex-col items-center justify-center relative">
                  <span className="absolute top-4 left-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Real Specimen Model
                  </span>
                  <div className="w-full h-[140px] flex items-center justify-center mt-6">
                    {details.renderIllustration()}
                  </div>
                </div>

                {/* 2. Interactive Diagram */}
                <div className="w-full bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-150 dark:border-slate-850 flex flex-col items-center justify-center relative">
                  <span className="absolute top-4 left-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Interactive Diagram
                  </span>
                  
                  <div className="w-full max-w-[240px] h-[240px] flex items-center justify-center mt-4">
                    {details.renderSvg(highlightedPart)}
                  </div>
                  
                  <p className="text-[10px] text-slate-455 font-bold text-center mt-2">
                    💡 Hover over the parts on the right to highlight structures
                  </p>
                </div>

                {/* 3. Close-up / Micro-structure View */}
                <div className="w-full bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-155 dark:border-slate-850 flex items-center gap-4">
                  <div className="w-20 h-20 shrink-0 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex items-center justify-center bg-white dark:bg-slate-900 shadow-inner">
                    {details.renderCloseUpSvg()}
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wide flex items-center gap-1.5">
                      <i className="fi fi-rr-microscope text-indigo-500 mr-0.5"></i>
                      {details.closeupTitle}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mt-1">
                      {details.closeupDesc}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Explanations, Parts Explorer, Tips, and Qs */}
              <div className="flex-1 flex flex-col space-y-6">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
                    {inspectSpec.name}
                  </h3>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                      {inspectSpec.category}
                    </span>
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-50 text-slate-650 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-750">
                      {inspectSpec.type}
                    </span>
                  </div>
                </div>

                {/* 4. Did You Know? Short Visual Fact */}
                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl p-4 flex gap-3 items-center">
                  <i className="fi fi-rr-magic-wand text-indigo-500 text-lg shrink-0 animate-pulse"></i>
                  <div>
                    <span className="block text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Did you know?</span>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 font-bold mt-0.5 leading-relaxed">
                      {details.visualFact}
                    </p>
                  </div>
                </div>

                {/* Specimen Description */}
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-5 border border-slate-150 dark:border-slate-850">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Specimen Facts</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                    This specimen is categorized under <strong>{inspectSpec.category}</strong>. It represents a <strong>{inspectSpec.type}</strong> preparation. 
                    {inspectSpec.name === "DNA Double Helix" ? " It contains the coding patterns for cellular proteins and hereditary information." :
                     inspectSpec.name === "Indian Bullfrog" ? " Used to examine vertebrate muscular and skeletal structures." :
                     inspectSpec.name === "Giant Stag Beetle" ? " Used to observe segmented insect exoskeleton parts and claws." :
                     inspectSpec.name === "Starfish Specimen" ? " Ideal for studying radially symmetrical nervous and vascular systems." :
                     inspectSpec.name === "Amoeba Proteus" ? " Perfect for showing single-celled ingestion and cytoplasmic movement." :
                     inspectSpec.name === "Fern Leaf Section" ? " Shows non-seed reproductive structures under botanical microscopy." :
                     " Ideal for hands-on student observations in bio labs."}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Parts Explorer</h4>
                  <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-1">
                    {details.parts.map((part) => (
                      <div 
                        key={part.name}
                        onMouseEnter={() => setHighlightedPart(part.name)}
                        onMouseLeave={() => setHighlightedPart(null)}
                        className={`p-3 rounded-xl border transition-all cursor-default flex flex-col ${
                          highlightedPart === part.name 
                            ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800 translate-x-1" 
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-855 dark:text-white">{part.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5 leading-normal">{part.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>


              </div>
            </div>
          </div>
        );
      })()}
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
