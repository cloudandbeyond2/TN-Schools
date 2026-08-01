"use client";

export const dynamic = "force-dynamic";

import PortalLayout from "@/components/PortalLayout";
import ScholarshipTrackingHub from "@/components/student/ScholarshipTrackingHub";

export default function HighSchoolScholarshipsPage() {
  return (
    <PortalLayout
      title="Scholarships Tracker & Hub"
      subtitle="Track your applications, check eligibility, upload documents and check notifications."
      avatarLetter="S"
      avatarColor="#ef4444"
      themeClass="theme-student"
      accentColor="#ef4444"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 glass rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <i className="fi fi-sr-graduation-cap text-2xl text-indigo-600 dark:text-indigo-400 flex items-center" />
          <div>
            <h2 className="text-lg sm:text-xl font-black text-black dark:text-white uppercase tracking-wider leading-tight">
              Scholarships Tracker & Hub
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track your applications, check eligibility, upload documents and view state scholarship notifications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0 self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Grade:</span>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-extrabold text-xs sm:text-sm rounded-xl border border-indigo-200/20 shadow-sm">
            <i className="fi fi-sr-graduation-cap flex items-center text-sm" />
            Class 10th Standard
          </span>
        </div>
      </div>

      <ScholarshipTrackingHub
        classLevel={10}
        dashboardLink="/student/high-school"
        accentColor="#ef4444"
        themeClass="theme-student"
      />
    </PortalLayout>
  );
}
