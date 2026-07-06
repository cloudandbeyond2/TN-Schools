"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  /** Tailwind text color class for the value, e.g. "text-emerald-400" */
  color?: string;
  /** Change vs previous year, already formatted (e.g. "+4.2%") */
  delta?: string | null;
  deltaPositive?: boolean;
  /** dark = HM/BEO glass style, light = student/parent card style */
  variant?: "dark" | "light";
}

export default function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  delta,
  deltaPositive = true,
  variant = "dark",
}: KpiCardProps) {
  if (variant === "light") {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{label}</span>
          {Icon && <Icon size={15} className={color || "text-slate-400"} />}
        </div>
        <div className="flex items-baseline gap-2 mt-1.5">
          <span className={`text-xl font-black ${color || "text-slate-800 dark:text-white"}`}>{value}</span>
          {delta && (
            <span className={`text-[10px] font-bold ${deltaPositive ? "text-emerald-500" : "text-rose-500"}`}>{delta}</span>
          )}
        </div>
        {sub && <div className="text-[10px] text-slate-400 mt-1 font-semibold">{sub}</div>}
      </div>
    );
  }

  return (
    <div className="glass p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{label}</span>
        {Icon && <Icon size={16} className={color || "text-slate-400"} />}
      </div>
      <div className="flex items-baseline gap-2 mt-2">
        <span className={`text-2xl font-black ${color || "text-white"}`}>{value}</span>
        {delta && (
          <span className={`text-[10px] font-bold ${deltaPositive ? "text-emerald-400" : "text-rose-400"}`}>{delta}</span>
        )}
      </div>
      {sub && <div className="text-[11px] text-slate-500 mt-2 font-semibold">{sub}</div>}
    </div>
  );
}
