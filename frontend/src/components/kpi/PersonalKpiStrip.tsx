"use client";

import React, { useState, useEffect } from "react";
import KpiCard from "./KpiCard";
import { API_BASE } from "./useKpis";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

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
  hideHeader?: boolean;
}

/**
 * Current-year KPI row for a single student (student & parent panels).
 * Always shows live data for the student's most recent academic year — no year selector.
 * The backend auto-detects the correct year from the student's own mark records.
 */
export default function PersonalKpiStrip({ studentId, title, variant = "light", hideHeader = false }: Props) {
  const { lang } = usePortalLanguage();
  const [data, setData] = useState<PersonalKpis | null>(null);
  const [loading, setLoading] = useState(false);

  const defaultTitle = lang === "தமிழ்" ? "எனது கல்வி செயல்திறன் குறிகாட்டிகள்" : "My Academic KPIs";
  const displayTitle = title || defaultTitle;

  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    setLoading(true);
    // No academicYear param — backend auto-detects from student's latest marks
    fetch(`${API_BASE}/api/analytics/student/${studentId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled && json.success) setData(json.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [studentId]);

  if (!studentId) return null;

  const v = (val: string | number): string | number => (loading || !data ? "…" : val);
  const dark = variant === "dark";

  return (
    <div className="mb-6">
      {!hideHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className={`text-base font-semibold flex items-center ${dark ? "text-white" : "text-slate-800 dark:text-white"}`}>
              <i className="fi fi-rr-chart-histogram text-emerald-500 mr-2"></i> {displayTitle}
            </h2>
            <p className="text-[11px] text-slate-500">
              {lang === "தமிழ்" ? "கல்வி ஆண்டிற்கான நேரடி தரவு" : "Live data for academic year"}{data?.academicYear ? ` ${data.academicYear}` : ""}
            </p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label={lang === "தமிழ்" ? "வகுப்பு" : "Class"}
          value={v(data ? `${data.class}${data.section ? ` – ${data.section}` : ""}` : "")}
          flaticonClass="fi-rr-graduation-cap"
          color={dark ? "text-blue-400" : "text-blue-500"}
          variant={variant}
          sub={data?.group ? (lang === "தமிழ்" ? `HSC பிரிவு ${data.group}` : `HSC Group ${data.group}`) : undefined}
        />
        <KpiCard
          label={lang === "தமிழ்" ? "வருகைப்பதிவு" : "Attendance"}
          value={v(data?.attendancePct != null ? `${data.attendancePct}%` : "—")}
          flaticonClass="fi-rr-calendar"
          color={dark ? "text-emerald-400" : "text-emerald-500"}
          variant={variant}
          sub={lang === "தமிழ்" ? "ஆண்டு சராசரி" : "Year average"}
        />
        <KpiCard
          label={lang === "தமிழ்" ? "சராசரி மதிப்பெண்கள்" : "Average Marks"}
          value={v(data?.averageMarksPct != null ? `${data.averageMarksPct}%` : "—")}
          flaticonClass="fi-rr-stats"
          color={dark ? "text-violet-400" : "text-violet-500"}
          variant={variant}
          sub={data?.averageMarksPct != null ? (data.averageMarksPct >= 35 ? (lang === "தமிழ்" ? "தேர்ச்சி மதிப்பெண்ணுக்கு மேல்" : "Above pass mark") : (lang === "தமிழ்" ? "தேர்ச்சி மதிப்பெண்ணுக்கு கீழ்" : "Below pass mark")) : undefined}
        />
        <KpiCard
          label={lang === "தமிழ்" ? "கண்காணிக்கப்படும் பாடங்கள்" : "Subjects Tracked"}
          value={v(data?.marksSummary?.length ?? 0)}
          flaticonClass="fi-rr-layers"
          color={dark ? "text-amber-400" : "text-amber-500"}
          variant={variant}
          sub={data?.result ? (lang === "தமிழ்" ? `ஆண்டு முடிவு: ${data.result}` : `Year result: ${data.result}`) : undefined}
        />
      </div>
    </div>
  );
}
