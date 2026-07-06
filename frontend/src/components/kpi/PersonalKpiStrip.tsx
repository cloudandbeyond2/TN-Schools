"use client";

import React, { useState, useEffect } from "react";
import { CalendarCheck, BookOpenCheck, GraduationCap, Layers } from "lucide-react";
import KpiCard from "./KpiCard";
import AcademicYearSelect from "./AcademicYearSelect";
import { API_BASE, useAcademicYears } from "./useKpis";

interface PersonalKpis {
  academicYear: string;
  source: "live" | "snapshot";
  class: string;
  section: string;
  group: string | null;
  result: string | null;
  attendancePct: number | null;
  averageMarksPct: number | null;
  marksSummary: { subject: string; pct: number | null }[] | null;
}

interface Props {
  studentId: string | null;
  title?: string;
  variant?: "dark" | "light";
}

/**
 * Academic-year KPI row for a single student (student & parent panels).
 * Past years come from the promotion archive; the current year is live.
 */
export default function PersonalKpiStrip({ studentId, title = "My Academic KPIs", variant = "light" }: Props) {
  const { years, selected: academicYear, setSelected: setAcademicYear } = useAcademicYears();
  const [data, setData] = useState<PersonalKpis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!studentId || !academicYear) return;
    let cancelled = false;
    setLoading(true);
    fetch(`${API_BASE}/api/analytics/student/${studentId}?academicYear=${academicYear}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled && json.success) setData(json.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [studentId, academicYear]);

  if (!studentId) return null;

  const v = (val: string | number): string | number => (loading || !data ? "…" : val);
  const dark = variant === "dark";

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h2 className={`text-base font-semibold ${dark ? "text-white" : "text-slate-800 dark:text-white"}`}>📊 {title}</h2>
          <p className="text-[11px] text-slate-500">
            {data?.source === "snapshot" ? "Archived year — from your academic history" : "Live data for the selected academic year"}
          </p>
        </div>
        <AcademicYearSelect years={years} value={academicYear} onChange={setAcademicYear} variant={variant} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Class"
          value={v(data ? `${data.class}${data.section ? ` – ${data.section}` : ""}` : "")}
          icon={GraduationCap}
          color={dark ? "text-blue-400" : "text-blue-500"}
          variant={variant}
          sub={data?.group ? `HSC Group ${data.group}` : undefined}
        />
        <KpiCard
          label="Attendance"
          value={v(data?.attendancePct != null ? `${data.attendancePct}%` : "—")}
          icon={CalendarCheck}
          color={dark ? "text-emerald-400" : "text-emerald-500"}
          variant={variant}
          sub="Year average"
        />
        <KpiCard
          label="Average Marks"
          value={v(data?.averageMarksPct != null ? `${data.averageMarksPct}%` : "—")}
          icon={BookOpenCheck}
          color={dark ? "text-violet-400" : "text-violet-500"}
          variant={variant}
          sub={data?.averageMarksPct != null ? (data.averageMarksPct >= 35 ? "Above pass mark" : "Below pass mark") : undefined}
        />
        <KpiCard
          label="Subjects Tracked"
          value={v(data?.marksSummary?.length ?? 0)}
          icon={Layers}
          color={dark ? "text-amber-400" : "text-amber-500"}
          variant={variant}
          sub={data?.result ? `Year result: ${data.result}` : undefined}
        />
      </div>
    </div>
  );
}
