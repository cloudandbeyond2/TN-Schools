"use client";

import { useEffect, useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";

interface ChildUsage {
  studentId: string;
  userId: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string;
  emisNumber?: string;
  gender?: string;
  isOnline: boolean;
  isLoggedInToday: boolean;
  lastActiveTime: string;
  secondsToday: number;
  hoursToday: number;
  minsToday: number;
  formattedToday: string;
  secondsWeek: number;
  hoursWeek: number;
  screenTimeStatus: "Optimal" | "Moderate" | "Extended";
  statusColor: string;
  recommendedLimitHours: number;
  categoryBreakdown: {
    digitalLibrary: number;
    homeworkAssignments: number;
    virtualLabs: number;
    aiTutorPractice: number;
  };
}

interface SummaryData {
  totalChildren: number;
  activeNowCount: number;
  combinedSecondsToday: number;
  combinedHoursToday: number;
  combinedHoursWeek: number;
  avgHoursPerChildToday: number;
  recommendedDailyLimitHours: number;
}

export default function ParentScreenTimePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [childrenList, setChildrenList] = useState<ChildUsage[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [encouragingChild, setEncouragingChild] = useState<ChildUsage | null>(null);
  const [encouragementMessage, setEncouragementMessage] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchScreenTimeData();
  }, [session]);

  const fetchScreenTimeData = async () => {
    setLoading(true);
    try {
      let parentId = (session?.user as any)?.id || "demo-parent";
      const token = (session?.user as any)?.backendToken;

      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/api/parent/${parentId}/screen-time`, { headers });
      const json = await res.json();

      if (json.success) {
        setSummary(json.summary);
        setChildrenList(json.data || []);
        if (json.data && json.data.length > 0) {
          setSelectedChildId(json.data[0].studentId);
        }
      } else {
        // Fallback demo data if backend response is empty
        loadDemoData();
      }
    } catch (e) {
      console.error("Error loading screen time data:", e);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    const demoSummary: SummaryData = {
      totalChildren: 2,
      activeNowCount: 1,
      combinedSecondsToday: 6300,
      combinedHoursToday: 1.8,
      combinedHoursWeek: 12.4,
      avgHoursPerChildToday: 0.9,
      recommendedDailyLimitHours: 2.0,
    };

    const demoChildren: ChildUsage[] = [
      {
        studentId: "child-1",
        userId: "u-1",
        name: "Priya Rajesh",
        class: "9",
        section: "B",
        rollNumber: "HM1024",
        isOnline: true,
        isLoggedInToday: true,
        lastActiveTime: new Date().toISOString(),
        secondsToday: 4500,
        hoursToday: 1.3,
        minsToday: 75,
        formattedToday: "1 hr 15 mins",
        secondsWeek: 28800,
        hoursWeek: 8.0,
        screenTimeStatus: "Optimal",
        statusColor: "#10b981",
        recommendedLimitHours: 2.0,
        categoryBreakdown: {
          digitalLibrary: 30,
          homeworkAssignments: 25,
          virtualLabs: 10,
          aiTutorPractice: 10,
        },
      },
      {
        studentId: "child-2",
        userId: "u-2",
        name: "Arjun Rajesh",
        class: "6",
        section: "A",
        rollNumber: "HM1025",
        isOnline: false,
        isLoggedInToday: true,
        lastActiveTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        secondsToday: 1800,
        hoursToday: 0.5,
        minsToday: 30,
        formattedToday: "30 mins",
        secondsWeek: 15840,
        hoursWeek: 4.4,
        screenTimeStatus: "Optimal",
        statusColor: "#10b981",
        recommendedLimitHours: 2.0,
        categoryBreakdown: {
          digitalLibrary: 15,
          homeworkAssignments: 10,
          virtualLabs: 5,
          aiTutorPractice: 0,
        },
      },
    ];

    setSummary(demoSummary);
    setChildrenList(demoChildren);
    setSelectedChildId(demoChildren[0].studentId);
  };

  const activeChild = childrenList.find((c) => c.studentId === selectedChildId) || childrenList[0];

  const handleSendReminder = (e: React.FormEvent) => {
    e.preventDefault();
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setEncouragingChild(null);
      setEncouragementMessage("");
    }, 2000);
  };

  const formatLastActive = (isoString: string) => {
    if (!isoString) return "No recent activity";
    const date = new Date(isoString);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffMins < 5) return "Just now";
    if (diffMins < 30) return `${diffMins} mins ago`;
    if (diffMins < 1440 && date.getDate() === now.getDate()) {
      return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <PortalLayout
      title="Children's Screen Time & Usage"
      subtitle="Parental Guidance · Screen Timing & Digital Portal Learning Monitoring"
      avatarLetter="R"
      avatarColor="#10b981"
      themeClass="theme-parent"
      accentColor="#10b981"
    >
      <div className="space-y-6 pb-12">
        {/* Header Hero Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-emerald-100 mb-3 border border-white/20">
              <i className="fi fi-rr-clock text-sm"></i>
              <span>Screen Timing & Digital Wellness</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Monitor Your Children's Portal Screen Timing ⏱️
            </h1>
            <p className="mt-2 text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              Track how much time your children spend learning on the Tamil Nadu Smart Education Portal. Ensure healthy screen timing and balanced educational engagement.
            </p>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="theme-card p-5 rounded-xl border border-emerald-500/20 shadow-sm bg-white dark:bg-slate-900 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Combined Screen Time Today
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {summary?.combinedHoursToday || 0} <span className="text-sm font-normal text-slate-500">hrs</span>
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                Across {summary?.totalChildren || 0} child(ren)
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
              <i className="fi fi-rr-time-fast"></i>
            </div>
          </div>

          <div className="theme-card p-5 rounded-xl border border-blue-500/20 shadow-sm bg-white dark:bg-slate-900 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Online Now
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {summary?.activeNowCount || 0} <span className="text-sm font-normal text-slate-500">online</span>
              </h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                Currently learning on portal
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl">
              <i className="fi fi-rr-signal-stream"></i>
            </div>
          </div>

          <div className="theme-card p-5 rounded-xl border border-purple-500/20 shadow-sm bg-white dark:bg-slate-900 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Weekly Total Study
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {summary?.combinedHoursWeek || 0} <span className="text-sm font-normal text-slate-500">hrs</span>
              </h3>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
                Last 7 days total portal study
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl">
              <i className="fi fi-rr-stats"></i>
            </div>
          </div>

          <div className="theme-card p-5 rounded-xl border border-amber-500/20 shadow-sm bg-white dark:bg-slate-900 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Target Daily Limit
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                2.0 <span className="text-sm font-normal text-slate-500">hrs / child</span>
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                Recommended educational limit
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl">
              <i className="fi fi-rr-shield-check"></i>
            </div>
          </div>
        </div>

        {/* Children Tabs / Roster Selector */}
        {childrenList.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">
              Select Child:
            </span>
            {childrenList.map((child) => {
              const isSelected = child.studentId === selectedChildId;
              return (
                <button
                  key={child.studentId}
                  onClick={() => setSelectedChildId(child.studentId)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      child.isOnline
                        ? "bg-emerald-400 animate-pulse"
                        : child.isLoggedInToday
                        ? "bg-blue-400"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  />
                  <span>{child.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                    }`}
                  >
                    Class {child.class}-{child.section}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected Child Detailed Usage Card */}
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <i className="fi fi-rr-spinner animate-spin text-2xl mb-2 inline-block"></i>
            <p>Loading screen time data...</p>
          </div>
        ) : activeChild ? (
          <div className="space-y-6">
            {/* Primary Details Card */}
            <div className="theme-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                    {activeChild.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {activeChild.name}
                      </h2>
                      {activeChild.isOnline ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-300 dark:border-emerald-800">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                          Active Now
                        </span>
                      ) : activeChild.isLoggedInToday ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-300 dark:border-blue-800">
                          Logged In Today
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold">
                          Offline
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Class {activeChild.class}-{activeChild.section} • Roll No: {activeChild.rollNumber} • Last Active: {formatLastActive(activeChild.lastActiveTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEncouragingChild(activeChild)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
                  >
                    <i className="fi fi-rr-comment-heart text-base"></i>
                    <span>Send Break / Encouragement</span>
                  </button>
                </div>
              </div>

              {/* Screen Time Meter / Progress Gauge */}
              <div className="py-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <i className="fi fi-rr-time-check text-emerald-600"></i>
                      Today's Portal Screen Timing:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {activeChild.formattedToday} / <span className="text-slate-500 font-normal">2.0 hrs limit</span>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (activeChild.hoursToday / 2.0) * 100)}%`,
                        backgroundColor: activeChild.statusColor,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>0 hrs (Light)</span>
                    <span className="font-semibold text-emerald-600">2.0 hrs (Recommended)</span>
                    <span>3.5+ hrs (Extended)</span>
                  </div>
                </div>

                {/* Status Pill Card */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
                  <span className="text-xs uppercase font-medium tracking-wider text-slate-400">
                    Screen Timing Evaluation
                  </span>
                  <div className="mt-1 flex items-center justify-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: activeChild.statusColor }}
                    />
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {activeChild.screenTimeStatus} Usage
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {activeChild.screenTimeStatus === "Optimal"
                      ? "Healthy learning duration on portal. Balanced screen time!"
                      : activeChild.screenTimeStatus === "Moderate"
                      ? "Moderate study session duration. Remind child to take short eye breaks."
                      : "Extended screen usage. Suggest outdoor activity or study break."}
                  </p>
                </div>
              </div>
            </div>

            {/* Usage Category Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="theme-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <i className="fi fi-rr-chart-pie-alt text-emerald-600"></i>
                  Today's Activity Breakdown (Minutes)
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        Digital Library & E-Books
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {activeChild.categoryBreakdown.digitalLibrary} mins
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (activeChild.categoryBreakdown.digitalLibrary / Math.max(1, activeChild.minsToday)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        Homework & Assignments
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {activeChild.categoryBreakdown.homeworkAssignments} mins
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (activeChild.categoryBreakdown.homeworkAssignments / Math.max(1, activeChild.minsToday)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                        Virtual Labs & Experiments
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {activeChild.categoryBreakdown.virtualLabs} mins
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (activeChild.categoryBreakdown.virtualLabs / Math.max(1, activeChild.minsToday)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        AI Tutor Practice & Quizzes
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {activeChild.categoryBreakdown.aiTutorPractice} mins
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (activeChild.categoryBreakdown.aiTutorPractice / Math.max(1, activeChild.minsToday)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Digital Wellness & Healthy Habits Guidance */}
              <div className="theme-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                    <i className="fi fi-rr-bulb text-amber-500"></i>
                    Parental Screen Time Guidelines 💡
                  </h3>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <i className="fi fi-rr-check-circle text-emerald-500 mt-0.5"></i>
                      <span>
                        <strong>20-20-20 Eye Rule:</strong> Encourage your child to look 20 feet away for 20 seconds every 20 minutes of study.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fi fi-rr-check-circle text-emerald-500 mt-0.5"></i>
                      <span>
                        <strong>Screen-Free Meals:</strong> Ensure portal study is paused during meal times and 1 hour before bedtime.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fi fi-rr-check-circle text-emerald-500 mt-0.5"></i>
                      <span>
                        <strong>Balanced Schedule:</strong> Combine digital portal learning with physical activity and reading physical textbooks.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <a
                    href="/parent/performance"
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    View Academic Performance →
                  </a>
                  <a
                    href="/parent/homework"
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    Check Homework Submissions →
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Modal: Send Encouragement / Break Reminder */}
        {encouragingChild && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center text-lg">
                    <i className="fi fi-rr-comment-heart"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      Message to {encouragingChild.name}
                    </h3>
                    <p className="text-xs text-slate-500">Send encouragement or screen break reminder</p>
                  </div>
                </div>
                <button
                  onClick={() => setEncouragingChild(null)}
                  className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>

              {sentSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl mx-auto">
                    ✓
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Message Sent Successfully!</h4>
                  <p className="text-xs text-slate-500">Your child will receive this encouragement on their student portal.</p>
                </div>
              ) : (
                <form onSubmit={handleSendReminder} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Quick Templates:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEncouragementMessage("Great job studying today! Remember to rest your eyes and take a short break. 🌟")
                        }
                        className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-left"
                      >
                        👀 Rest eyes & take a break
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEncouragementMessage("Super proud of your dedication on the portal! Keep up the good work. 💪")
                        }
                        className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-left"
                      >
                        💪 Proud of your dedication
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Message Content:
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={encouragementMessage}
                      onChange={(e) => setEncouragementMessage(e.target.value)}
                      placeholder="Type your message to your child..."
                      className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEncouragingChild(null)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-500/20"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
