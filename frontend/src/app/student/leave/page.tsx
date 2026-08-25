"use client";

import React, { useEffect, useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import { Calendar, FileText, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

interface LeaveRequest {
  id: string;
  type: string;
  duration: string;
  reason: string;
  status: string;
  createdAt: string;
}

export default function StudentLeavePage() {
  const { data: session } = useSession();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const { lang } = usePortalLanguage();
  const isTa = lang === "தமிழ்";

  // Determine portal type from URL to adjust colors if needed
  const isParent = typeof window !== "undefined" && window.location.pathname.startsWith("/parent");
  
  const title = isParent ? "Child's Leave Reports" : "My Leave Reports";
  const subtitle = isParent ? "View leave requests submitted by teachers for your child." : "View leave requests submitted by teachers for you.";

  const bannerData = {
    title: isTa 
      ? (isParent ? "குழந்தையின் விடுப்பு அறிக்கைகள்" : "எனது விடுப்பு அறிக்கைகள்")
      : (isParent ? "Child's Leave Reports" : "My Leave Reports"),
    desc: isTa
      ? (isParent ? "உங்கள் குழந்தைக்கு ஆசிரியர்களால் சமர்ப்பிக்கப்பட்ட விடுப்பு விண்ணப்பங்களை இங்கே பார்க்கவும்." : "உங்களுக்காக ஆசிரியர்களால் சமர்ப்பிக்கப்பட்ட விடுப்பு விண்ணப்பங்களை இங்கே பார்க்கவும்.")
      : (isParent ? "View leave requests submitted by teachers for your child." : "View leave requests submitted by teachers for you."),
    portalTag: isTa
      ? (isParent ? "பெற்றோர் வலைவாசல்" : "மாணவர் வலைவாசல்")
      : (isParent ? "Parent Portal" : "Student Portal"),
    yearTag: isTa ? "கல்வி ஆண்டு 2024-25" : "Academic Year 2024-25",
    rightPill: isTa ? "விடுப்பு தளம்" : "Leave Desk"
  };

  useEffect(() => {
    async function fetchLeaves() {
      if (!session?.user) {
        setLoading(false);
        return;
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      
      try {
        if (isParent) {
          // Parent logic
          const parentId = (session.user as any).id;
          const childRes = await fetch(`${apiUrl}/api/parent/${parentId}/children`);
          const childData = await childRes.json();
          if (childData.success && childData.data && childData.data.length > 0) {
            const allLeaves: LeaveRequest[] = [];
            for (const child of childData.data) {
              const studentId = child.studentId;
              const leaveRes = await fetch(`${apiUrl}/api/students/${studentId}/leave`);
              const leaveData = await leaveRes.json();
              if (leaveData.success) {
                allLeaves.push(...leaveData.data);
              }
            }
            // Sort by date descending
            allLeaves.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setLeaves(allLeaves);
          }
        } else {
          // Student logic — get studentId from session (set during login)
          let studentId = (session.user as any).studentId as string | null;

          if (!studentId) {
            // Fallback: look up student by userId (for sessions created before the auth update)
            const userId = (session.user as any).id;
            const profileRes = await fetch(`${apiUrl}/api/students?userId=${userId}`);
            const profileData = await profileRes.json();
            if (profileData.success && profileData.data && profileData.data.length > 0) {
              studentId = profileData.data[0].id;
            }
          }

          if (!studentId) {
            // Last resort: try roll number from email
            const rollNumber = session.user.email?.split('@')[0];
            if (rollNumber) {
              // Use headmaster health only as a last resort for studentId (check student by rollNumber)
              const studentsRes = await fetch(`${apiUrl}/api/students?schoolId=${(session.user as any).schoolId}`);
              const studentsData = await studentsRes.json();
              if (studentsData.success && studentsData.data) {
                const match = studentsData.data.find((s: any) =>
                  s.rollNumber?.toLowerCase() === rollNumber.toLowerCase()
                );
                if (match) studentId = match.id;
              }
            }
          }

          if (studentId) {
            const leaveRes = await fetch(`${apiUrl}/api/students/${studentId}/leave`);
            const leaveData = await leaveRes.json();
            if (leaveData.success) {
              setLeaves(leaveData.data);
            }
          }
        }

      } catch (error) {
        console.error("Failed to fetch leave reports:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLeaves();
  }, [session]);

  const getStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'approved': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-rose-500" />;
      default: return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'approved': return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case 'rejected': return "bg-rose-100 text-rose-700 border-rose-200";
      default: return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    if (!selectedMonth) return true;
    
    // 1. Fallback: If duration starts with selectedMonth (e.g. "2026-08")
    if (leave.duration && leave.duration.startsWith(selectedMonth)) {
      return true;
    }
    
    // 2. Compare against submission date (createdAt) which is standard ISO date
    if (leave.createdAt) {
      const createdDate = new Date(leave.createdAt);
      if (!isNaN(createdDate.getTime())) {
        const year = createdDate.getFullYear();
        const month = String(createdDate.getMonth() + 1).padStart(2, "0");
        const createdMonthStr = `${year}-${month}`;
        if (createdMonthStr === selectedMonth) {
          return true;
        }
      }
    }
    
    // 3. Match against the duration string (e.g. "21-08-26", "2026-08-12 to 2026-08-16", "June 25, 2026")
    const [selYear, selMonth] = selectedMonth.split("-"); // e.g. ["2026", "08"]
    if (selYear && selMonth && leave.duration) {
      const shortYear = selYear.slice(-2); // "26"
      
      // Check for DD-MM-YY or similar (e.g., "21-08-26")
      const dmyRegex = new RegExp(`\\b\\d{1,2}-${selMonth}-${shortYear}\\b`);
      
      // Check for YYYY-MM-DD or similar (e.g., "2026-08-21")
      const ymdRegex = new RegExp(`\\b${selYear}-${selMonth}-\\d{1,2}\\b`);
      
      // Check for verbal month (e.g. "August" or "Aug")
      const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
      const monthShorts = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      const monthIndex = parseInt(selMonth, 10) - 1;
      const monthName = monthNames[monthIndex];
      const monthShort = monthShorts[monthIndex];
      
      const durationLower = leave.duration.toLowerCase();
      const hasMonthName = monthName && (durationLower.includes(monthName) || durationLower.includes(monthShort));
      const hasYear = durationLower.includes(selYear) || durationLower.includes(shortYear);
      
      if (dmyRegex.test(leave.duration) || ymdRegex.test(leave.duration) || (hasMonthName && hasYear)) {
        return true;
      }
    }
    
    return false;
  });

  return (
    <PortalLayout>
      <div className="w-full space-y-6 mt-6 font-sans text-slate-800 dark:text-slate-100">
        
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-4 glass rounded-2xl p-4 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
          {/* Left */}
          <div>
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="text-[8.5px] font-black uppercase tracking-widest text-indigo-650 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                {bannerData.portalTag}
              </span>
              <span className="text-[8.5px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                {bannerData.yearTag}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-805 dark:text-white uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
              <i className="fi fi-sr-calendar-clock text-indigo-600 dark:text-indigo-400 flex items-center text-sm sm:text-base" />
              {bannerData.title}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              {bannerData.desc}
            </p>
          </div>
          {/* Right */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0 self-end sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs rounded-xl border border-indigo-200/20 shadow-sm">
              <i className="fi fi-sr-document-signed flex items-center text-xs" />
              {bannerData.rightPill}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border-2 border-slate-100 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white">Leave History</h2>
                <p className="text-sm font-medium text-slate-500">Record of all leaves submitted by staff</p>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <input 
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full sm:w-48 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 font-bold">
              Loading leave records...
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-300 mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <p className="text-slate-500 font-bold text-lg">No leave records found.</p>
              <p className="text-sm text-slate-400 mt-1">There are currently no leaves submitted for this student in the selected month.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLeaves.map((leave) => (
                <div key={leave.id} className="p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors bg-slate-50 dark:bg-slate-900/50 group">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-black uppercase tracking-wider rounded-lg">
                          {leave.type}
                        </span>
                        <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg border flex items-center gap-1.5 ${getStatusColor(leave.status)}`}>
                          {getStatusIcon(leave.status)}
                          {leave.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="font-bold text-sm">{leave.duration}</span>
                      </div>
                      
                      <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
                        <span className="font-bold text-slate-400 mr-2">Reason:</span>
                        {leave.reason}
                      </p>
                    </div>
                    
                    <div className="text-left sm:text-right shrink-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submitted On</p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-300">
                        {new Date(leave.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </PortalLayout>
  );
}
