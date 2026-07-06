"use client";

import React from "react";

const PALETTE = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-lime-500",
  "bg-fuchsia-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-pink-500",
];

interface Props {
  title: string;
  /** e.g. { "8": 42, "9": 38 } or { Male: 120, Female: 130 } */
  data: Record<string, number>;
  /** Prefix for segment labels, e.g. "Class " */
  labelPrefix?: string;
  variant?: "dark" | "light";
}

/** Horizontal stacked segment bar with a legend — chart-library-free. */
export default function DistributionBar({ title, data, labelPrefix = "", variant = "dark" }: Props) {
  const entries = Object.entries(data)
    .filter(([, v]) => v > 0)
    .sort(([a], [b]) => {
      const na = parseInt(a, 10);
      const nb = parseInt(b, 10);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const isDark = variant === "dark";

  if (total === 0) {
    return (
      <div>
        <div className={`text-[10px] uppercase font-bold tracking-wider mb-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{title}</div>
        <div className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>No data for this year.</div>
      </div>
    );
  }

  return (
    <div>
      <div className={`text-[10px] uppercase font-bold tracking-wider mb-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{title}</div>
      <div className={`flex h-3 w-full rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100 dark:bg-slate-800"}`}>
        {entries.map(([key, v], i) => (
          <div
            key={key}
            className={`${PALETTE[i % PALETTE.length]} h-full`}
            style={{ width: `${(v / total) * 100}%` }}
            title={`${labelPrefix}${key}: ${v}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {entries.map(([key, v], i) => (
          <span key={key} className={`flex items-center gap-1 text-[10px] font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <span className={`w-2 h-2 rounded-full ${PALETTE[i % PALETTE.length]}`} />
            {labelPrefix}{key}: <strong className={isDark ? "text-slate-200" : "text-slate-700 dark:text-slate-200"}>{v}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}
