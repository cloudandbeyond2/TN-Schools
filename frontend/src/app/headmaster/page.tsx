"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";

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
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
        {[
          {
            label: "Total Students",
            value: isLoading ? "..." : totalStudents.toString(),
            icon: "👨‍🎓",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            sub: "Watchlist records",
          },
          {
            label: "Teaching Staff",
            value: isLoading ? "..." : totalStaff.toString(),
            icon: "👩‍🏫",
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            sub: isLoading ? "Loading..." : `${excellentStaff} excellent`,
          },
          {
            label: "High Risk Students",
            value: isLoading ? "..." : highRisk.toString(),
            icon: "⚠️",
            color: "text-red-400",
            bg: "bg-red-500/10",
            sub: "Needs intervention",
          },
          {
            label: "Safe Students",
            value: isLoading ? "..." : (totalStudents - highRisk).toString(),
            icon: "✅",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            sub: "Low / Medium risk",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="glass rounded-2xl p-4 border border-slate-800 flex items-center justify-between hover:scale-[1.02] transition-all shadow-sm">
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{kpi.label}</span>
              <span className={`text-2xl font-black ${kpi.color} mt-1`}>{kpi.value}</span>
              <span className="text-[10px] text-slate-500 font-semibold mt-0.5 truncate">{kpi.sub}</span>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${kpi.bg} ${kpi.color} shrink-0 ml-2 shadow-sm`}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Staff Table */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 fade-in-2 border border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-white">👩‍🏫 Staff Performance</h2>
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
              <div className="text-3xl mb-2">👩‍🏫</div>
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
            <h2 className="text-base font-semibold text-white">⚠️ Student Risk Summary</h2>
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
              <div className="text-3xl mb-2">📋</div>
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

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 fade-in-4">
        {[
          { label: "Staff Management", icon: "👩‍🏫", href: "/headmaster/staff", color: "border-blue-500/20 hover:border-blue-500/50" },
          { label: "Student Monitoring", icon: "👨‍🎓", href: "/headmaster/students", color: "border-emerald-500/20 hover:border-emerald-500/50" },
          { label: "Parents & PTA", icon: "👨‍👩‍👧", href: "/headmaster/parents", color: "border-amber-500/20 hover:border-amber-500/50" },
          { label: "Alumni Network", icon: "🎓", href: "/headmaster/alumni", color: "border-purple-500/20 hover:border-purple-500/50" },
        ].map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={`glass rounded-2xl p-5 border ${link.color} flex flex-col items-center gap-3 text-center transition-all hover:scale-105 group`}
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">{link.icon}</span>
            <span className="text-xs font-bold text-slate-300 group-hover:text-white">{link.label}</span>
          </Link>
        ))}
      </div>
    </PortalLayout>
  );
}
