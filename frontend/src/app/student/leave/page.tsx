"use client";

import React, { useEffect, useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import { Calendar, FileText, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

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

  // Determine portal type from URL to adjust colors if needed
  const isParent = typeof window !== "undefined" && window.location.pathname.startsWith("/parent");
  
  const title = isParent ? "Child's Leave Reports" : "My Leave Reports";
  const subtitle = isParent ? "View leave requests submitted by teachers for your child." : "View leave requests submitted by teachers for you.";

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
          // Student logic
          const rollNumber = session.user.email?.split('@')[0];
          if (!rollNumber) return;

          const profileRes = await fetch(`${apiUrl}/api/headmaster/health/${rollNumber}`);
          const profileData = await profileRes.json();
          
          if (profileData.success && profileData.data && profileData.data.studentId) {
            const studentId = profileData.data.studentId;
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
    return leave.duration.startsWith(selectedMonth);
  });

  return (
    <PortalLayout title={title} subtitle={subtitle}>
      <div className="w-full mt-8">
        
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
