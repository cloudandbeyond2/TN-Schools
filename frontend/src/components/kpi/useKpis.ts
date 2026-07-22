"use client";

import { useState, useEffect } from "react";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};
export const API_BASE = getApiBase();

export interface KpiData {
  academicYear: string;
  source: "live" | "snapshot";
  enrollment: { total: number; byClass: Record<string, number>; byGender: Record<string, number> };
  attendancePct: number | null;
  marks: { averagePct: number | null; passPct: number | null };
  promotions: { promoted: number; detained: number; graduated: number; transferred: number; pendingBatches: number };
  dropouts: { transferred: number };
  teachers: { total: number };
  totalSchools?: number;
  sports?: {
    totalAthletes: number;
    stateReps: number;
    districtMedals: number;
  };
  bySchool?: Array<{
    schoolId: string;
    name: string;
    dise: string;
    block: string;
    district: string;
    students: number;
    teachers: number;
    attendancePct: number | null;
  }>;
  byDistrict?: Array<{ district: string; schools: number; students: number }>;
}

/**
 * Fetches KPI data from an /api/analytics endpoint, re-fetching when the
 * academic year changes. `path` is the endpoint path without query string,
 * e.g. `/api/analytics/school/abc123`.
 */
export function useKpis(path: string | null, academicYear: string | null, extraParams?: Record<string, string>) {
  const [data, setData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extraKey = extraParams ? JSON.stringify(extraParams) : "";

  useEffect(() => {
    if (!path || !academicYear) return;
    const params = new URLSearchParams({ academicYear, ...(extraParams || {}) });
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}${path}?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success) setData(json.data);
        else setError(json.error || "Failed to load analytics");
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, academicYear, extraKey]);

  return { data, loading, error };
}

/** Fetches the list of academic years available for the selector. */
export function useAcademicYears() {
  const [years, setYears] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/analytics/academic-years`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setYears(json.data);
          setSelected((prev) => prev || json.current || json.data[0] || null);
        }
      })
      .catch(() => {});
  }, []);

  return { years, selected, setSelected };
}
