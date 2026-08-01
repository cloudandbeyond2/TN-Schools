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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-start sm:items-center gap-3">
          <i className="fi fi-sr-graduation-cap text-xl sm:text-2xl text-indigo-600 dark:text-indigo-400 flex items-center shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-black text-black dark:text-white uppercase tracking-wider leading-tight">
              Scholarships Tracker & Hub
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Track your applications, check eligibility, upload documents and view state scholarship notifications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60 self-start sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Grade:</span>
          <span className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 font-extrabold text-xs sm:text-sm rounded-xl border border-indigo-200/20 shadow-sm">
            <i className="fi fi-sr-graduation-cap flex items-center text-xs sm:text-sm" />
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
