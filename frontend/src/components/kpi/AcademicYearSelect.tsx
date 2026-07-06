"use client";

import React from "react";
import { Calendar } from "lucide-react";

interface Props {
  years: string[];
  value: string | null;
  onChange: (year: string) => void;
  variant?: "dark" | "light";
}

export default function AcademicYearSelect({ years, value, onChange, variant = "dark" }: Props) {
  const cls =
    variant === "light"
      ? "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
      : "bg-slate-800 border border-slate-700 text-white";
  return (
    <div className="flex items-center gap-2">
      <Calendar size={14} className="text-slate-400" />
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`${cls} rounded-xl px-3 py-2 text-xs font-bold focus:outline-none`}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            AY {y}
          </option>
        ))}
      </select>
    </div>
  );
}
