"use client";

import React from "react";
import { Building2, GraduationCap, CalendarCheck, BookOpenCheck, Users } from "lucide-react";
import KpiCard from "./KpiCard";
import AcademicYearSelect from "./AcademicYearSelect";
import { useKpis, useAcademicYears } from "./useKpis";

interface Props {
  /** Analytics endpoint path, e.g. "/api/analytics/state" */
  path: string | null;
  extraParams?: Record<string, string>;
  title?: string;
  variant?: "dark" | "light";
  /** Extra controls rendered next to the year selector (e.g. a district picker) */
  controls?: React.ReactNode;
}

/**
 * Self-contained academic-year KPI row: year selector + real KPI cards
 * driven by the /api/analytics endpoints. Drop into any dashboard.
 */
export default function KpiStrip({ path, extraParams, title = "Academic KPIs", variant = "dark", controls }: Props) {
  const { years, selected: academicYear, setSelected: setAcademicYear } = useAcademicYears();
  const { data: kpis, loading } = useKpis(path, academicYear, extraParams);

  const dark = variant === "dark";
  const v = (val: React.ReactNode) => (loading || !kpis ? "…" : val);

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h2 className={`text-base font-semibold ${dark ? "text-white" : "text-slate-800 dark:text-white"}`}>📊 {title}</h2>
          <p className="text-[11px] text-slate-500">
            {kpis?.source === "snapshot" ? "Archived year — from academic history records" : "Live data for the selected academic year"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {controls}
          <AcademicYearSelect years={years} value={academicYear} onChange={setAcademicYear} variant={variant} />
        </div>
      </div>
      <div className={`grid grid-cols-2 ${kpis?.totalSchools != null ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-3`}>
        {kpis?.totalSchools != null && (
          <KpiCard label="Schools" value={v(kpis!.totalSchools!)} icon={Building2} color={dark ? "text-violet-400" : "text-violet-500"} variant={variant} />
        )}
        <KpiCard
          label="Enrolled Students"
          value={v(kpis ? kpis.enrollment.total.toLocaleString() : "")}
          icon={GraduationCap}
          color={dark ? "text-blue-400" : "text-blue-500"}
          variant={variant}
        />
        <KpiCard
          label="Attendance"
          value={v(kpis?.attendancePct != null ? `${kpis.attendancePct}%` : "—")}
          icon={CalendarCheck}
          color={dark ? "text-emerald-400" : "text-emerald-500"}
          variant={variant}
          sub="Year average"
        />
        <KpiCard
          label="Pass Rate"
          value={v(kpis?.marks.passPct != null ? `${kpis.marks.passPct}%` : "—")}
          icon={BookOpenCheck}
          color={dark ? "text-amber-400" : "text-amber-500"}
          variant={variant}
          sub={kpis?.marks.averagePct != null ? `Avg marks ${kpis.marks.averagePct}%` : undefined}
        />
        <KpiCard
          label="Promotions"
          value={v(kpis ? kpis.promotions.promoted + kpis.promotions.graduated : "")}
          icon={Users}
          color={dark ? "text-rose-400" : "text-rose-500"}
          variant={variant}
          sub={kpis ? `${kpis.promotions.detained} detained · ${kpis.promotions.transferred} transferred` : undefined}
        />
      </div>
    </div>
  );
}
