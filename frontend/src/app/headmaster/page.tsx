"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { Users, GraduationCap, CalendarCheck, BookOpenCheck, TrendingUp, ArrowUpCircle, BarChart3, Presentation, Users2, Trophy } from "lucide-react";
import KpiCard from "@/components/kpi/KpiCard";
import AcademicYearSelect from "@/components/kpi/AcademicYearSelect";
import DistributionBar from "@/components/kpi/DistributionBar";
import { useKpis, useAcademicYears } from "@/components/kpi/useKpis";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};
const API_BASE = getApiBase();

interface StaffMember {
  id?: string;
  name: string;
  subject: string;
  attendance: number;
  performance: string;
  leaveUsed?: number;
}

interface StudentRecord {
  id?: string;
  risk: string;
}

export default function HeadmasterDashboard() {
  const { data: session } = useSession();
  const mySchoolId: string = (session?.user as any)?.schoolId || "";

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { years, selected: academicYear, setSelected: setAcademicYear } = useAcademicYears();
  const { data: kpis, loading: kpisLoading } = useKpis(
    mySchoolId ? `/api/analytics/school/${mySchoolId}` : null,
    academicYear
  );

  const fetchDashboardData = useCallback(async () => {
    if (!mySchoolId) return;
    setIsLoading(true);
    try {
      const [staffRes, stuRes] = await Promise.all([
        fetch(`${API_BASE}/api/headmaster/staff?schoolId=${mySchoolId}`),
        fetch(`${API_BASE}/api/headmaster/students?schoolId=${mySchoolId}`),
      ]);
      const [staffJson, stuJson] = await Promise.all([
        staffRes.json(),
        stuRes.json(),
      ]);
      if (staffJson.success) setStaff(staffJson.data);
      if (stuJson.success) setStudents(stuJson.data);
    } catch {
      // silent fail — dashboard is summary only
    } finally {
      setIsLoading(false);
    }
  }, [mySchoolId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const highRisk = students.filter((s) => s.risk === "High").length;
  const totalStudents = students.length;
  const totalStaff = staff.length;
  const excellentStaff = staff.filter((s) => s.performance === "Excellent").length;

  return (
    <PortalLayout>
      {/* Academic-year KPI header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 fade-in">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-amber-500" /> School KPIs</h2>
          <p className="text-[11px] text-slate-500">
            {kpis?.source === "snapshot" ? "Archived year — data from academic history records" : "Live data for the selected academic year"}
          </p>
        </div>
        <AcademicYearSelect years={years} value={academicYear} onChange={setAcademicYear} />
      </div>

      {/* KPI Row — real academic-year analytics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4 fade-in">
        <KpiCard
          label="Enrolled Students"
          value={kpisLoading || !kpis ? "…" : kpis.enrollment.total}
          icon={GraduationCap}
          color="text-blue-400"
          sub={academicYear ? `Academic year ${academicYear}` : undefined}
        />
        <KpiCard
          label="Attendance"
          value={kpisLoading || !kpis ? "…" : kpis.attendancePct != null ? `${kpis.attendancePct}%` : "—"}
          icon={CalendarCheck}
          color="text-emerald-400"
          sub="School-wide average"
        />
        <KpiCard
          label="Pass Rate"
          value={kpisLoading || !kpis ? "…" : kpis.marks.passPct != null ? `${kpis.marks.passPct}%` : "—"}
          icon={BookOpenCheck}
          color="text-violet-400"
          sub={kpis?.marks.averagePct != null ? `Avg marks ${kpis.marks.averagePct}%` : "Marks ≥ 35%"}
        />
        <KpiCard
          label="Teaching Staff"
          value={kpisLoading || !kpis ? "…" : kpis.teachers.total || totalStaff}
          icon={Users}
          color="text-amber-400"
          sub={`${excellentStaff} rated excellent`}
        />
      </div>

      {/* Distributions + promotion outcomes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6 fade-in-2">
        <div className="lg:col-span-2 glass rounded-2xl p-5 border border-slate-800 space-y-5">
          <DistributionBar title="Enrollment by class" data={kpis?.enrollment.byClass || {}} labelPrefix="Class " />
          <DistributionBar title="Gender split" data={kpis?.enrollment.byGender || {}} />
        </div>
        <div className="glass rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Promotions ({academicYear || "—"})</span>
            <Link href="/headmaster/promotions" className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <ArrowUpCircle size={11} /> Manage →
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
                <span className="text-slate-500">Batches awaiting BEO</span>
                <span className={`font-bold ${kpis.promotions.pendingBatches > 0 ? "text-amber-400" : "text-slate-300"}`}>
                  {kpis.promotions.pendingBatches}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500">Loading…</div>
          )}
        </div>
      </div>

      {/* Risk summary row (live watchlist) */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6 fade-in">
        <KpiCard label="High Risk Students" value={isLoading ? "…" : highRisk} icon={TrendingUp} color="text-red-400" sub="Needs intervention" />
        <KpiCard label="Safe Students" value={isLoading ? "…" : totalStudents - highRisk} color="text-emerald-400" sub="Low / medium risk" />
        <KpiCard label="Watchlist Records" value={isLoading ? "…" : totalStudents} color="text-blue-400" sub="Student monitoring" />
        <KpiCard
          label="Detained This Year"
          value={kpis ? kpis.promotions.detained : "…"}
          color="text-amber-400"
          sub="Re-enrolled in same class"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Staff Table */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 fade-in-2 border border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white flex items-center gap-2"><Presentation className="w-5 h-5 text-blue-400" /> Staff Performance</h2>
            <Link
              href="/headmaster/staff"
              id="headmaster-add-staff"
              className="text-xs text-blue-400 hover:text-blue-300 font-bold bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg transition-all"
            >
              View All Staff
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              <div className="w-6 h-6 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin mx-auto mb-3" />
              Loading staff data...
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              <div className="flex justify-center mb-2"><Presentation className="w-8 h-8 text-slate-600" /></div>
              <div className="font-semibold text-slate-400 mb-1">No staff records yet</div>
              <Link href="/headmaster/staff" className="text-blue-400 hover:underline">Go to Staff Management →</Link>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Subject</th>
                    <th>Attendance</th>
                    <th>Performance</th>
                    <th>Leave Days</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.slice(0, 8).map((s, i) => (
                    <tr key={s.id || i}>
                      <td className="font-bold text-white text-xs">{s.name}</td>
                      <td>{s.subject}</td>
                      <td>
                        <span className={`badge ${s.attendance >= 95 ? "badge-green" : s.attendance >= 90 ? "badge-yellow" : "badge-red"}`}>
                          {s.attendance}%
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${s.performance === "Excellent" ? "badge-green" : s.performance === "Good" ? "badge-blue" : "badge-yellow"}`}>
                          {s.performance}
                        </span>
                      </td>
                      <td className={(s.leaveUsed ?? 0) >= 3 ? "text-red-400" : "text-slate-400"}>
                        {s.leaveUsed ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Student Risk Summary */}
        <div className="glass rounded-2xl p-6 fade-in-3 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2"><Users2 className="w-5 h-5 text-amber-500" /> Student Risk Summary</h2>
            <Link href="/headmaster/students" className="text-xs text-blue-400 hover:text-blue-300 font-bold">
              View All →
            </Link>
          </div>
          {isLoading ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <div className="w-5 h-5 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin mx-auto mb-2" />
              Loading...
            </div>
          ) : totalStudents === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <div className="flex justify-center mb-2"><Users2 className="w-8 h-8 text-slate-600" /></div>
              <div>No student records yet</div>
              <Link href="/headmaster/students" className="text-blue-400 hover:underline mt-1 block">Add Students →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: "High Risk", count: students.filter(s => s.risk === "High").length, color: "text-red-400", bar: "bg-red-500" },
                { label: "Medium Risk", count: students.filter(s => s.risk === "Medium").length, color: "text-amber-400", bar: "bg-amber-500" },
                { label: "Low Risk", count: students.filter(s => s.risk === "Low").length, color: "text-emerald-400", bar: "bg-emerald-500" },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">{item.label}</span>
                    <span className={`font-bold ${item.color}`}>{item.count}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className={`${item.bar} h-1.5 rounded-full transition-all`}
                      style={{ width: totalStudents > 0 ? `${(item.count / totalStudents) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-slate-800 flex justify-between text-xs">
                <span className="text-slate-500">Total Students</span>
                <span className="font-bold text-white">{totalStudents}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* School Sports & Health Widget */}
      <div className="glass rounded-2xl p-6 fade-in-3 border border-slate-800 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> School Sports & Health</h2>
          <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">Ground: Good</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700">
             <div className="text-2xl font-black text-white">450</div>
             <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Participants</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700">
             <div className="text-2xl font-black text-amber-400">12</div>
             <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Gold Medals</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700">
             <div className="text-2xl font-black text-blue-400">85%</div>
             <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Avg Fitness</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700">
             <div className="text-2xl font-black text-red-400">2</div>
             <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Equip Alerts</div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 fade-in-4">
        {[
          { label: "Staff Management", icon: <i className="fi fi-rr-users"></i>, href: "/headmaster/staff", color: "border-blue-500/20 hover:border-blue-500/50" },
          { label: "Student Monitoring", icon: <i className="fi fi-rr-graduation-cap"></i>, href: "/headmaster/students", color: "border-emerald-500/20 hover:border-emerald-500/50" },
          { label: "Parents & PTA", icon: <i className="fi fi-rr-family"></i>, href: "/headmaster/parents", color: "border-amber-500/20 hover:border-amber-500/50" },
          { label: "Alumni Network", icon: <i className="fi fi-rr-diploma"></i>, href: "/headmaster/alumni", color: "border-purple-500/20 hover:border-purple-500/50" },
        ].map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={`glass rounded-2xl p-5 border ${link.color} flex flex-col items-center gap-3 text-center transition-all hover:scale-105 group`}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">{link.icon}</span>
            <span className="text-xs font-bold text-slate-300 group-hover:text-white">{link.label}</span>
          </Link>
        ))}
      </div>
    </PortalLayout>
  );
}
