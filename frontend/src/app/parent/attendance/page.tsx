"use client";
import { useEffect, useState, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import ParentPortalBanner from "@/components/ParentPortalBanner";
import { useParentChildren, getApiBase, Child } from "@/lib/useParentChildren";
import { Calendar, ChevronRight, Info, CheckCircle2, XCircle, BarChart3, AlertCircle } from "lucide-react";

interface MonthData {
  month: string;
  total: number;
  present: number;
  late: number;
  absent: number;
  leave: number;
  percentage: number;
  offset: number;
}

interface DayRecord {
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "LEAVE";
  method: string | null;
}

const STATUS_STYLE: Record<string, { label: string; cls: string; dot: string }> = {
  PRESENT: { label: "Present",  cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
  LATE:    { label: "Late",     cls: "text-amber-400   bg-amber-500/10   border-amber-500/20",   dot: "bg-amber-400"   },
  ABSENT:  { label: "Absent",   cls: "text-red-400     bg-red-500/10     border-red-500/20",     dot: "bg-red-400"     },
  LEAVE:   { label: "Leave",    cls: "text-blue-400    bg-blue-500/10    border-blue-500/20",    dot: "bg-blue-400"    },
};

function ChildSwitcher({ childList, active, onChange }: { childList: Child[]; active: Child | null; onChange: (c: Child) => void }) {
  if (childList.length <= 1) return null;
  return (
    <div className="flex items-center gap-3 mb-5 p-3 glass rounded-2xl flex-wrap">
      <span className="text-xs text-slate-400 font-semibold">👶 Viewing:</span>
      {childList.map(c => (
        <button key={c.studentId} onClick={() => onChange(c)}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            active?.studentId === c.studentId ? "bg-emerald-600 text-white shadow-md animate-scale" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}>
          {c.name.split(" ")[0]} · Class {c.class}{c.section}
        </button>
      ))}
    </div>
  );
}

export default function AttendancePage() {
  const { parentId, children, activeChild, setActiveChild, childrenLoading } = useParentChildren();

  const [monthly, setMonthly]   = useState<MonthData[]>([]);
  const [recent, setRecent]     = useState<DayRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selectedOffset, setSelectedOffset] = useState<number>(0);
  const [hasManuallySelected, setHasManuallySelected] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Fetch parent child attendance
  const fetchAttendance = useCallback(async (child: Child, offset: number) => {
    if (!parentId) return;
    setLoading(true);
    try {
      const res  = await fetch(`${getApiBase()}/api/parent/${parentId}/child/${child.studentId}/attendance?offset=${offset}`);
      const json = await res.json();
      if (json.success) {
        setMonthly(json.data.monthly);
        setRecent(json.data.recentRecords);
        
        // If we haven't manually switched months yet and the current month is empty,
        // automatically default to the latest month that has records so the dashboard is not blank!
        if (!hasManuallySelected) {
          const activeMonthWithData = json.data.monthly
            .slice()
            .reverse() // check most recent first (July, June, May...)
            .find((m: any) => m.total > 0);
          
          if (activeMonthWithData && activeMonthWithData.offset !== undefined && activeMonthWithData.offset !== offset) {
            setSelectedOffset(activeMonthWithData.offset);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching parent child attendance:", err);
    } finally {
      setLoading(false);
    }
  }, [parentId, hasManuallySelected]);

  // Fetch when child or selected offset changes
  useEffect(() => {
    if (activeChild) {
      fetchAttendance(activeChild, selectedOffset);
    }
  }, [activeChild, selectedOffset, fetchAttendance]);

  // Reset offset selection when switching children
  useEffect(() => {
    setSelectedOffset(0);
    setHasManuallySelected(false);
    setStatusFilter("All");
  }, [activeChild]);

  // Reset status filter when selected offset changes
  useEffect(() => {
    setStatusFilter("All");
  }, [selectedOffset]);

  // Find active month data
  const currentMonth = monthly.find(m => m.offset === selectedOffset) || monthly[monthly.length - 1];

  const totalPresent = monthly.reduce((s, m) => s + m.present + m.late, 0);
  const totalDays    = monthly.reduce((s, m) => s + m.total, 0);
  const overallPct   = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;

  // Filter daily logs by selected status
  const filteredRecent = recent.filter(r => statusFilter === "All" || r.status === statusFilter);

  return (
    <PortalLayout
      title="Parent Portal"
      subtitle={`${activeChild?.name || 'Child'} · ${activeChild?.rollNumber || 'N/A'}`}
      avatarLetter="P"
      avatarColor="#10b981"
      themeClass="theme-parent"
      accentColor="#10b981"
    >
      <ChildSwitcher childList={children} active={activeChild} onChange={setActiveChild} />

      <ParentPortalBanner pageKey="attendance" />

      {/* Header KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
        {[
          { 
            label: "Monthly Presence",    
            value: currentMonth && currentMonth.total > 0 ? `${currentMonth.percentage}%` : "—", 
            icon: <i className="fi fi-rr-calendar"></i>, 
            color: "text-emerald-400", 
            sub: currentMonth?.month ?? "" 
          },
          { 
            label: "Present Days",  
            value: currentMonth ? String(currentMonth.present + currentMonth.late) : "—",  
            icon: <i className="fi fi-rr-checkbox"></i>, 
            color: "text-green-400",   
            sub: currentMonth?.month ?? "Active month" 
          },
          { 
            label: "Absent Days",   
            value: currentMonth ? String(currentMonth.absent)  : "—",  
            icon: <i className="fi fi-rr-ban"></i>, 
            color: "text-red-400",     
            sub: currentMonth?.month ?? "Active month" 
          },
          { 
            label: "Overall Index",  
            value: totalDays > 0 ? `${overallPct}%` : "—",                                    
            icon: <i className="fi fi-rr-chart-simple"></i>, 
            color: "text-blue-400",   
            sub: "Last 6 Months" 
          },
        ].map(k => (
          <div key={k.label} className="kpi-card hover:scale-[1.02] hover:-translate-y-0.5 border border-slate-800/80 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl flex items-center justify-center">{k.icon}</span>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${k.color}`}>{k.sub}</span>
            </div>
            {loading || childrenLoading
              ? <div className="h-8 w-20 bg-slate-700 rounded animate-pulse mb-1.5" />
              : <div className={`text-2xl sm:text-3xl font-black ${k.color} mb-1`}>{k.value}</div>
            }
            <div className="text-xs text-slate-500 font-semibold">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 6-Month Bar Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-5 sm:p-6 border border-slate-800/80 fade-in-2 text-left">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <i className="fi fi-rr-chart-histogram text-lg text-emerald-500 shrink-0"></i>
                Monthly Attendance (Last 6 Months)
              </h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Click any month below to view detailed breakdown and logs.</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-12 bg-slate-800/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : monthly.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
              <Info className="w-8 h-8 mx-auto mb-2 text-slate-650" />
              No attendance records registered.
            </div>
          ) : (
            <div className="space-y-2">
              {monthly.map(m => {
                const isSelected = selectedOffset === m.offset;
                return (
                  <div 
                    key={m.month} 
                    onClick={() => {
                      setSelectedOffset(m.offset);
                      setHasManuallySelected(true);
                    }}
                    className={`flex items-center gap-4 p-2.5 rounded-xl cursor-pointer hover:bg-slate-800/40 transition-all border ${
                      isSelected 
                        ? "bg-slate-800/80 border-emerald-500/30 shadow-md shadow-emerald-500/[0.02]" 
                        : "border-transparent"
                    }`}
                  >
                    <div className="w-20 text-[11px] text-slate-400 font-bold shrink-0">{m.month}</div>
                    
                    <div className="flex-1 relative h-6 bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
                      {m.total > 0 ? (
                        <div
                          className="h-full rounded-l-md transition-all duration-700"
                          style={{
                            width: `${m.percentage}%`,
                            background: m.percentage >= 90
                              ? "linear-gradient(90deg, #10b981, #059669)"
                              : m.percentage >= 75
                              ? "linear-gradient(90deg, #f59e0b, #d97706)"
                              : "linear-gradient(90deg, #ef4444, #dc2626)",
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[9px] text-slate-600 font-bold">
                          No Days Registered
                        </div>
                      )}
                    </div>
                    
                    <div className={`w-12 text-right text-xs font-black shrink-0 ${
                      m.total === 0
                        ? "text-slate-600"
                        : m.percentage >= 90 
                        ? "text-emerald-400" 
                        : m.percentage >= 75 
                        ? "text-amber-400" 
                        : "text-red-400"
                    }`}>
                      {m.total > 0 ? `${m.percentage}%` : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary Breakdown */}
        <div className="glass rounded-2xl p-5 sm:p-6 border border-slate-800/80 fade-in-3 text-left flex flex-col justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <i className="fi fi-rr-document text-lg text-emerald-500 shrink-0"></i>
              {currentMonth?.month || "Active Month"} Breakdown
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Summary breakdowns for selected period.</p>
          </div>

          {loading ? (
            <div className="space-y-3 mt-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-14 bg-slate-800/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : currentMonth && currentMonth.total > 0 ? (
            <div className="space-y-3 mt-4">
              {(["PRESENT", "LATE", "ABSENT", "LEAVE"] as const).map(s => {
                const style = STATUS_STYLE[s];
                const count = s === "PRESENT" ? currentMonth.present
                            : s === "LATE" ? currentMonth.late
                            : s === "ABSENT" ? currentMonth.absent
                            : currentMonth.leave;
                const pct = currentMonth.total > 0 ? Math.round((count / currentMonth.total) * 100) : 0;
                return (
                  <div key={s} className={`p-3 rounded-xl border flex items-center justify-between hover:scale-[1.01] transition-transform ${style.cls}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                      <span className="text-xs font-bold">{style.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black">{count}</div>
                      <div className="text-[10px] opacity-75 font-semibold">{pct}%</div>
                    </div>
                  </div>
                );
              })}
              <div className="text-center text-[10px] text-slate-500 font-bold pt-2">
                Total marked school days: {currentMonth.total}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl mt-4">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-650" />
              No breakdown records available for {currentMonth?.month || "selected month"}.
            </div>
          )}
        </div>
      </div>

      {/* Recent Daily Log */}
      <div className="glass rounded-2xl p-5 sm:p-6 border border-slate-800/80 fade-in-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <i className="fi fi-rr-list text-lg text-emerald-500 shrink-0"></i>
              {currentMonth?.month || "Active Month"} Attendance Logs
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Detailed lists of student attendance status entries for this month.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Month Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Month:</span>
              <select
                value={selectedOffset}
                onChange={(e) => {
                  setSelectedOffset(Number(e.target.value));
                  setHasManuallySelected(true);
                }}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-200 cursor-pointer focus:outline-none focus:border-emerald-500"
              >
                {monthly.map(m => (
                  <option key={m.offset} value={m.offset}>
                    {m.month}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-200 cursor-pointer focus:outline-none focus:border-emerald-500"
              >
                <option value="All">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
                <option value="LEAVE">Leave</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 bg-slate-800/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
            <Info className="w-8 h-8 mx-auto mb-2 text-slate-650" />
            No logs recorded for {currentMonth?.month || "selected month"}.
          </div>
        ) : filteredRecent.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
            <Info className="w-8 h-8 mx-auto mb-2 text-slate-650" />
            No logs recorded matching selected status filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecent.map((r, i) => {
                  const style = STATUS_STYLE[r.status] ?? STATUS_STYLE["PRESENT"];
                  return (
                    <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                      <td className="font-bold text-white text-xs">
                        {new Date(r.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                      </td>
                      <td>
                        <span className={`badge px-2.5 py-0.5 rounded-full text-[10px] font-black border ${style.cls}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="text-slate-400 font-semibold text-xs">{r.method ?? "Manual"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
