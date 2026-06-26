"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { 
  BarChart2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  Megaphone, 
  Plus, 
  ChevronDown, 
  Filter, 
  User 
} from "lucide-react";

interface Notice {
  id: string;
  title: string;
  body: string;
  target: string;
  date: string;
  sender: string;
  pinned: boolean;
}

export default function TeacherDashboard() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [alumniCount, setAlumniCount] = useState<string>("2,840+");
  const [mentorsCount, setMentorsCount] = useState<string>("187 Staff");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [attendance, setAttendance] = useState({ present: 342, absent: 18, late: 24 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch Alumni count
        const alumniRes = await fetch(`${API_URL}/api/headmaster/alumni${schoolId ? `?schoolId=${schoolId}` : ""}`);
        const alumniData = await alumniRes.json();
        if (alumniData.success) {
          setAlumniCount(`${alumniData.count || alumniData.data?.length || 0} Alumni`);
        }

        // Fetch Mentors count
        const staffRes = await fetch(`${API_URL}/api/headmaster/staff${schoolId ? `?schoolId=${schoolId}` : ""}`);
        const staffData = await staffRes.json();
        if (staffData.success) {
          setMentorsCount(`${staffData.count || staffData.data?.length || 0} Staff`);
        }

        // Fetch Pinned/Recent announcements
        const annRes = await fetch(`${API_URL}/api/teacher/announcements${schoolId ? `?schoolId=${schoolId}` : ""}`);
        const annData = await annRes.json();
        if (annData.success && annData.data) {
          setNotices(annData.data.slice(0, 5)); // top 5 notices
        }

        // Fetch attendance stats today
        if (schoolId) {
          const attRes = await fetch(`${API_URL}/api/attendance/school/${schoolId}/today`);
          const attData = await attRes.json();
          if (attData.success && attData.data && attData.data.length > 0) {
            let p = 0, a = 0, l = 0;
            attData.data.forEach((r: any) => {
              if (r.status === "PRESENT") p = r._count.status;
              else if (r.status === "ABSENT") a = r._count.status;
              else if (r.status === "LATE") l = r._count.status;
            });
            if (p > 0 || a > 0 || l > 0) {
              setAttendance({ present: p, absent: a, late: l });
            }
          }
        }
      } catch (err) {
        console.error("Dashboard load error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [schoolId, API_URL]);

  const totalAttendance = attendance.present + attendance.absent + attendance.late;
  const presentPct = totalAttendance > 0 ? Math.round((attendance.present / totalAttendance) * 100) : 89;
  const absentPct = totalAttendance > 0 ? Math.round((attendance.absent / totalAttendance) * 100) : 5;
  const latePct = totalAttendance > 0 ? Math.round((attendance.late / totalAttendance) * 100) : 6;

  const kpiData = [
    { title: "ACTIVE ALUMNI", value: alumniCount, subtitle: "↑ 14% this year", icon: "👥", color: "blue", subColor: "text-blue-500", iconBg: "bg-blue-100 dark:bg-blue-500/15", iconColor: "text-blue-600 dark:text-blue-400", borderColor: "border-t-blue-500" },
    { title: "EMPLOYMENT RATE", value: "94.2%", subtitle: "Global top tier", icon: "💼", color: "green", subColor: "text-green-500", iconBg: "bg-green-100 dark:bg-green-500/15", iconColor: "text-green-600 dark:text-green-400", borderColor: "border-t-green-500" },
    { title: "FUNDS DONATED", value: "₹3.42 Lakhs", subtitle: "For library upgrade", icon: "🪙", color: "orange", subColor: "text-orange-500", iconBg: "bg-orange-100 dark:bg-orange-500/15", iconColor: "text-orange-600 dark:text-orange-400", borderColor: "border-t-orange-500" },
    { title: "ACTIVE MENTORS", value: mentorsCount, subtitle: "Providing career prep", icon: "🎓", color: "pink", subColor: "text-pink-500", iconBg: "bg-pink-100 dark:bg-pink-500/15", iconColor: "text-pink-600 dark:text-pink-400", borderColor: "border-t-pink-500" },
  ];

  return (
    <PortalLayout
      title="Dashboard"
      subtitle=""
    >
      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {kpiData.map((kpi, i) => (
          <div key={i} className={`theme-card border-t-4 ${kpi.borderColor} p-6 flex justify-between items-start relative overflow-hidden group`}>
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">{kpi.title}</p>
              <h3 className="text-2xl font-bold text-[var(--text-heading)] mb-2">{kpi.value}</h3>
              <p className={`text-xs ${kpi.subColor}`}>{kpi.subtitle}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${kpi.iconBg} ${kpi.iconColor} group-hover:scale-110 transition-transform`}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Student Attendance */}
        <div className="lg:col-span-1 theme-card p-6 flex flex-col">
          <div className="flex justify-between items-center gap-3 mb-6">
            <h2 className="text-base font-bold text-[var(--text-heading)] flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <BarChart2 className="w-4.5 h-4.5" />
              </div>
              <span>Student Attendance</span>
            </h2>
            <button className="text-xs bg-[var(--input-bg)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] px-3 py-1.5 rounded-xl font-bold border border-[var(--input-border)] flex items-center gap-1.5 transition-all shadow-sm active:scale-95">
              <span>All Classes</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mb-8">
            <div className="bg-emerald-500/5 rounded-xl p-3 text-center border-l-4 border-l-emerald-500 border border-emerald-500/10 shadow-sm relative overflow-hidden group">
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Present</p>
              <h3 className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mb-0.5 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{attendance.present}</span>
              </h3>
              <p className="text-[10px] text-emerald-500/80 font-bold">{presentPct}%</p>
            </div>
            <div className="bg-rose-500/5 rounded-xl p-3 text-center border-l-4 border-l-rose-500 border border-rose-500/10 shadow-sm relative overflow-hidden group">
              <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">Absent</p>
              <h3 className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 mb-0.5 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{attendance.absent}</span>
              </h3>
              <p className="text-[10px] text-rose-500/80 font-bold">{absentPct}%</p>
            </div>
            <div className="bg-amber-500/5 rounded-xl p-3 text-center border-l-4 border-l-amber-500 border border-amber-500/10 shadow-sm relative overflow-hidden group">
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Late</p>
              <h3 className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 mb-0.5 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{attendance.late}</span>
              </h3>
              <p className="text-[10px] text-amber-500/80 font-bold">{latePct}%</p>
            </div>
          </div>

          {/* Chart Wrapper with Y-axis column on the left */}
          <div className="flex gap-4 items-stretch h-[220px] mt-auto">
             {/* Y-Axis Label and Numbers */}
             <div className="flex items-center gap-2.5 text-[var(--text-muted)] text-[10px] select-none">
                <div className="whitespace-nowrap uppercase tracking-wider font-semibold [writing-mode:vertical-lr] rotate-180 pl-1 text-[9px]">
                   Number of Students
                </div>
                <div className="flex flex-col justify-between h-full py-1.5 pr-0.5 font-mono text-[9px] text-right w-6">
                   <span>400</span>
                   <span>300</span>
                   <span>200</span>
                </div>
             </div>

             {/* Chart Area */}
             <div className="flex-1 relative border-b border-l border-[var(--border-light)]">
                {/* Mock Chart Lines */}
                <div className="absolute left-0 bottom-[20%] w-full border-t border-[var(--border)] opacity-30"></div>
                <div className="absolute left-0 bottom-[50%] w-full border-t border-[var(--border)] opacity-30"></div>
                <div className="absolute left-0 bottom-[80%] w-full border-t border-[var(--border)] opacity-30"></div>
                
                {/* SVG Mock Line */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                   <defs>
                      <linearGradient id="attendance-area-grad" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                         <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                   </defs>
                   {/* Gradient Area Fill */}
                   <path 
                      d="M0,70 Q10,65 20,68 T40,75 T60,65 T80,72 T100,60 L100,100 L0,100 Z" 
                      fill="url(#attendance-area-grad)" 
                   />
                   {/* Thick Line Path */}
                   <path 
                      d="M0,70 Q10,65 20,68 T40,75 T60,65 T80,72 T100,60" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                   />
                   {/* Data dots with pulse rings */}
                   {[
                      { cx: 0, cy: 70 },
                      { cx: 20, cy: 68 },
                      { cx: 40, cy: 75 },
                      { cx: 60, cy: 65 },
                      { cx: 80, cy: 72 },
                      { cx: 100, cy: 60 }
                   ].map((pt, idx) => (
                      <g key={idx}>
                         <circle cx={pt.cx} cy={pt.cy} r="4" fill="rgba(16, 185, 129, 0.25)" className="animate-pulse" />
                         <circle cx={pt.cx} cy={pt.cy} r="2" fill="#10b981" />
                      </g>
                   ))}
                </svg>
             </div>
          </div>
        </div>

        {/* Noticeboard */}
        <div className="lg:col-span-2 theme-card p-0 flex flex-col relative overflow-hidden">
          <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
            <h2 className="text-base font-bold text-[var(--text-heading)] flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
                <Megaphone className="w-4.5 h-4.5" />
              </div>
              <span>Noticeboard & Announcements</span>
              {notices.length > 0 && (
                <span className="text-[9px] font-extrabold text-pink-600 dark:text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2.5 py-0.5 rounded-full ml-1.5 uppercase tracking-wider">
                  {notices.length} Active
                </span>
              )}
            </h2>
            <button className="p-1.5 hover:bg-[var(--sidebar-item-hover-bg)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-all">
              <Filter className="w-4 h-4 opacity-70" />
            </button>
          </div>

          <div className="flex border-b border-[var(--border)] bg-slate-50/50 dark:bg-slate-900/10">
            <button className="flex-1 py-3 text-xs font-bold text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 uppercase tracking-wider">All Announcements</button>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto max-h-[360px]">
            {loading ? (
              <div className="text-center text-xs py-12 text-[var(--text-muted)]">
                <div className="w-6 h-6 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin mx-auto mb-3" />
                Loading board...
              </div>
            ) : notices.length > 0 ? (
              notices.map((notice) => (
                <div key={notice.id} className="border border-[var(--border)] hover:border-indigo-500/20 rounded-2xl p-4.5 hover:shadow-lg hover:scale-[1.01] transition-all bg-[var(--bg-card)] flex gap-4 duration-300">
                  <div className="w-10 h-10 rounded-full text-white font-extrabold flex items-center justify-center shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm border border-white/10 text-xs">
                    {notice.sender.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 space-y-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${
                        notice.pinned 
                          ? "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400" 
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400"
                      }`}>
                        {notice.pinned ? "PINNED" : "NOTICE"}
                      </span>
                      <span className="text-[9px] text-[var(--text-muted)] font-extrabold bg-[var(--bg-main)] border border-[var(--border)] px-2 py-0.5 rounded-md uppercase tracking-wider">{notice.target}</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold ml-auto flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 opacity-60 text-slate-400" />
                        <span>{notice.date}</span>
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-heading)] mb-1">{notice.title}</h4>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">{notice.body}</p>
                    </div>
                    <div className="text-[10px] font-semibold text-[var(--text-muted)] flex items-center gap-1.5 bg-[var(--bg-main)]/50 border border-[var(--border)]/60 px-2 py-1 rounded-lg w-fit">
                      <User className="w-3.5 h-3.5 opacity-70 text-indigo-500" />
                      <span>{notice.sender}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-xs py-12 text-[var(--text-muted)] italic">No announcements to show.</div>
            )}
          </div>

          <Link 
            href="/teacher/announcements" 
            className="absolute bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group duration-300 z-10"
            title="Add Announcement"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </PortalLayout>
  );
}
