"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};
const API_BASE = getApiBase();

interface StudentRecord {
  id?: string;
  risk: string;
  class?: string;
  section?: string;
  user?: { name: string };
}

interface StaffRecord {
  id?: string;
  attendance: number;
}

export default function HeadmasterAttendancePage() {
  const { data: session } = useSession();
  const mySchoolId: string = (session?.user as any)?.schoolId || "";

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchData = useCallback(async () => {
    if (!mySchoolId) return;
    setIsLoading(true);
    try {
      const [stuRes, stRes] = await Promise.all([
        fetch(`${API_BASE}/api/headmaster/students?schoolId=${mySchoolId}`),
        fetch(`${API_BASE}/api/headmaster/staff?schoolId=${mySchoolId}`),
      ]);
      const [stuJson, stJson] = await Promise.all([stuRes.json(), stRes.json()]);
      if (stuJson.success) setStudents(stuJson.data);
      if (stJson.success) setStaff(stJson.data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [mySchoolId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalStudents = students.length;
  const highRiskStudents = students.filter((s) => s.risk === "High").length;
  const totalStaff = staff.length;
  const staffPresentCount = staff.filter((s) => s.attendance >= 90).length;
  const staffAttendancePct = totalStaff > 0
    ? ((staffPresentCount / totalStaff) * 100).toFixed(1)
    : "0.0";

  // Group students by class
  const byClass = students.reduce<Record<string, { present: number; absent: number }>>((acc, s) => {
    const cls = s.class ? `Class ${s.class}${s.section ? s.section : ""}` : "Unassigned";
    if (!acc[cls]) acc[cls] = { present: 0, absent: 0 };
    if (s.risk === "High") {
      acc[cls].absent += 1;
    } else {
      acc[cls].present += 1;
    }
    return acc;
  }, {});

  const classRows = Object.entries(byClass).map(([grade, data]) => ({
    grade,
    total: data.present + data.absent,
    present: data.present,
    absent: data.absent,
    percent: data.present + data.absent > 0
      ? Math.round((data.present / (data.present + data.absent)) * 100 * 10) / 10
      : 0,
  }));

  const totalPages = Math.ceil(classRows.length / pageSize);
  const paginatedRows = classRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // High risk students as absence warnings
  const highRiskList = students
    .filter((s) => s.risk === "High")
    .slice(0, 5)
    .map((s) => ({
      name: s.user?.name || "Unknown",
      class: s.class ? `Class ${s.class}${s.section || ""}` : "N/A",
    }));

  return (
    <PortalLayout
      title="Daily Attendance Analytics"
      subtitle="Mr. Venkatesh R. · GHS Coimbatore · DISE: 33012345"
      avatarLetter="V"
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      {/* Metrics Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6 fade-in">
        {[
          {
            label: "Total Students",
            value: isLoading ? "..." : totalStudents.toString(),
            icon: "👨‍🎓",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            sub: "In watchlist",
          },
          {
            label: "High Risk Students",
            value: isLoading ? "..." : highRiskStudents.toString(),
            icon: "🔴",
            color: "text-red-400",
            bg: "bg-red-500/10",
            sub: "Needs intervention",
          },
          {
            label: "Staff Attendance",
            value: isLoading ? "..." : `${staffAttendancePct}%`,
            icon: "👩‍🏫",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            sub: isLoading ? "..." : `${staffPresentCount} / ${totalStaff} present`,
          },
          {
            label: "Safe Students",
            value: isLoading ? "..." : (totalStudents - highRiskStudents).toString(),
            icon: "✅",
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
            sub: "Low / Medium risk",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="glass rounded-2xl p-3 sm:p-4 border border-slate-800 flex items-center justify-between hover:scale-[1.02] transition-all shadow-sm">
            <div className="flex flex-col text-left min-w-0">
              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{kpi.label}</span>
              <span className={`text-sm sm:text-2xl font-black ${kpi.color} mt-1`}>{kpi.value}</span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-semibold mt-0.5 truncate">{kpi.sub}</span>
            </div>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-sm sm:text-lg ${kpi.bg} ${kpi.color} shrink-0 ml-2 shadow-sm`}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Class summary table */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-slate-800">
          <h2 className="text-base font-semibold text-white mb-5">🏫 Student Distribution by Class</h2>
          {isLoading ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              <div className="w-6 h-6 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin mx-auto mb-3" />
              Loading class data...
            </div>
          ) : classRows.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              <div className="text-3xl mb-2">📋</div>
              <div>No student records found for your school.</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto w-full">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Total</th>
                      <th>Normal</th>
                      <th>High Risk</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.map((g) => (
                      <tr key={g.grade}>
                        <td className="font-bold text-white text-xs">{g.grade}</td>
                        <td>{g.total}</td>
                        <td className="text-emerald-400 font-bold">{g.present}</td>
                        <td className="text-red-400 font-bold">{g.absent}</td>
                        <td>
                          <span className={`badge ${g.percent >= 80 ? "badge-green" : "badge-yellow"}`}>
                            {g.percent}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 pt-4 border-t border-slate-800/40">
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>
                    Showing {classRows.length === 0 ? 0 : ((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, classRows.length)} of {classRows.length} entries
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span>Show</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-300 focus:outline-none focus:border-slate-700"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                    <span>entries</span>
                  </div>
                </div>
                {totalPages > 0 && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs rounded-lg transition-colors border border-slate-700 disabled:cursor-not-allowed font-semibold"
                    >
                      Previous
                    </button>
                    <div className="px-3 py-1 bg-slate-900/50 text-slate-400 text-xs rounded-lg border border-slate-800 flex items-center font-semibold">
                      Page {currentPage} of {totalPages}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-slate-800/50 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs rounded-lg transition-colors border border-slate-700 disabled:cursor-not-allowed font-semibold"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* High risk warnings */}
        <div className="glass rounded-2xl p-6 border border-slate-800">
          <h2 className="text-base font-semibold text-white mb-4">⚠️ High Risk Students</h2>
          {isLoading ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <div className="w-5 h-5 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin mx-auto mb-2" />
              Loading...
            </div>
          ) : highRiskList.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <div className="text-3xl mb-2">✅</div>
              <div className="font-semibold text-emerald-400">No high-risk students!</div>
              <div className="mt-1">All students are at low or medium risk.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {highRiskList.map((s, idx) => (
                <div key={idx} className="p-3.5 border border-red-500/20 bg-red-500/5 rounded-xl text-xs space-y-1">
                  <h4 className="font-bold text-white">{s.name}</h4>
                  <span className="text-[10px] text-slate-400">{s.class}</span>
                  <div className="pt-1">
                    <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-bold">
                      High Risk
                    </span>
                  </div>
                </div>
              ))}
              {highRiskStudents > 5 && (
                <div className="text-center text-[10px] text-slate-500 pt-2">
                  +{highRiskStudents - 5} more high risk students
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
