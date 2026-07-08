"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PortalLayout from "@/components/PortalLayout";
import { Building2, GraduationCap, CalendarCheck, TrendingDown, ArrowUpCircle, BookOpenCheck, Trophy } from "lucide-react";
import KpiCard from "@/components/kpi/KpiCard";
import AcademicYearSelect from "@/components/kpi/AcademicYearSelect";
import DistributionBar from "@/components/kpi/DistributionBar";
import { useKpis, useAcademicYears } from "@/components/kpi/useKpis";

export default function BEODashboard() {
  const { data: session } = useSession();
  const myUserId: string = (session?.user as any)?.id || "";

  const { years, selected: academicYear, setSelected: setAcademicYear } = useAcademicYears();
  const { data: kpis, loading } = useKpis(myUserId ? "/api/analytics/block" : null, academicYear, {
    beoUserId: myUserId,
  });

  const bySchool = kpis?.bySchool || [];
  const ranked = [...bySchool].sort((a, b) => (b.attendancePct ?? -1) - (a.attendancePct ?? -1));

  return (
    <PortalLayout>
      {/* Header + academic year selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 fade-in">
        <div>
          <h2 className="text-base font-semibold text-white">📊 Block KPIs</h2>
          <p className="text-[11px] text-slate-500">
            {kpis?.source === "snapshot" ? "Archived year — data from academic history records" : "Live data for the selected academic year"}
          </p>
        </div>
        <AcademicYearSelect years={years} value={academicYear} onChange={setAcademicYear} />
      </div>

      {/* KPI Row — real block analytics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 fade-in">
        <KpiCard
          label="Total Schools"
          value={loading || !kpis ? "…" : kpis.totalSchools ?? 0}
          icon={Building2}
          color="text-violet-400"
          sub="Under this block"
        />
        <KpiCard
          label="Enrolled Students"
          value={loading || !kpis ? "…" : kpis.enrollment.total.toLocaleString()}
          icon={GraduationCap}
          color="text-emerald-400"
          sub={academicYear ? `Academic year ${academicYear}` : undefined}
        />
        <KpiCard
          label="Block Attendance"
          value={loading || !kpis ? "…" : kpis.attendancePct != null ? `${kpis.attendancePct}%` : "—"}
          icon={CalendarCheck}
          color="text-amber-400"
          sub="Year average"
        />
        <KpiCard
          label="Dropouts / Transfers"
          value={loading || !kpis ? "…" : kpis.dropouts.transferred}
          icon={TrendingDown}
          color="text-red-400"
          sub="From promotion records"
        />
      </div>

      {/* Second KPI row + distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 fade-in-2">
        <div className="lg:col-span-2 glass rounded-2xl p-5 border border-slate-800 space-y-5">
          <DistributionBar title="Block enrollment by class" data={kpis?.enrollment.byClass || {}} labelPrefix="Class " />
          <DistributionBar title="Gender split" data={kpis?.enrollment.byGender || {}} />
        </div>
        <div className="glass rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Promotions ({academicYear || "—"})</span>
            <Link href="/block-education-officer/promotions" className="text-[10px] font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1">
              <ArrowUpCircle size={11} /> Approvals →
            </Link>
          </div>
          {kpis ? (
            <div className="space-y-2 text-xs">
              {[
                { label: "Promoted", value: kpis.promotions.promoted, color: "text-emerald-400" },
                { label: "Graduated (12th)", value: kpis.promotions.graduated, color: "text-violet-400" },
                { label: "Detained", value: kpis.promotions.detained, color: "text-amber-400" },
                { label: "Transferred out", value: kpis.promotions.transferred, color: "text-slate-300" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-slate-400">{row.label}</span>
                  <span className={`font-bold ${row.color}`}>{row.value}</span>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t border-slate-800 flex justify-between">
                <span className="text-slate-500">Batches awaiting approval</span>
                <span className={`font-bold ${kpis.promotions.pendingBatches > 0 ? "text-amber-400" : "text-slate-300"}`}>
                  {kpis.promotions.pendingBatches}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 flex items-center gap-1"><BookOpenCheck size={11} /> Pass rate</span>
                <span className="font-bold text-slate-200">{kpis.marks.passPct != null ? `${kpis.marks.passPct}%` : "—"}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500">Loading…</div>
          )}
        </div>
      </div>

      {/* Block Sports Participation Widget */}
      <div className="glass rounded-2xl p-6 mb-6 fade-in-2 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> Block Sports Participation</h2>
          <span className="text-xs font-bold text-blue-400">Zone 4 Winner</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700">
             <div className="text-2xl font-black text-white">1,250</div>
             <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Total Athletes</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700">
             <div className="text-2xl font-black text-emerald-400">45</div>
             <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">State Level Reps</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700">
             <div className="text-2xl font-black text-amber-400">120</div>
             <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">District Medals</div>
          </div>
        </div>
      </div>

      {/* Per-school table — real data */}
      <div className="glass rounded-2xl p-6 mb-6 fade-in-2">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">🏆 Schools in Block — {academicYear || ""}</h2>
          <span className="text-[10px] text-slate-500 font-semibold">Ranked by attendance</span>
        </div>
        {ranked.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            {loading
              ? "Loading schools…"
              : "No schools are linked to this BEO account yet. Schools are linked via their block or BEO assignment."}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>School</th>
                <th>DISE</th>
                <th>Students</th>
                <th>Teachers</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((s, i) => (
                <tr key={s.schoolId}>
                  <td>
                    <span className={`badge ${i === 0 ? "badge-green" : i < 3 ? "badge-blue" : "badge-yellow"}`}>#{i + 1}</span>
                  </td>
                  <td className="font-medium text-white">{s.name}</td>
                  <td className="text-slate-400">{s.dise}</td>
                  <td>{s.students.toLocaleString()}</td>
                  <td>{s.teachers}</td>
                  <td>
                    {s.attendancePct != null ? (
                      <span className={`badge ${s.attendancePct >= 93 ? "badge-green" : s.attendancePct >= 85 ? "badge-yellow" : "badge-red"}`}>
                        {s.attendancePct}%
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PortalLayout>
  );
}
