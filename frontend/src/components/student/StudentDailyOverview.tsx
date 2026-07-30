"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

/* Flaticon (uicons) glyph — the app loads uicons-regular-rounded globally */
const Fi = ({ name, className = "" }: { name: string; className?: string }) => (
  <i className={`fi fi-rr-${name} inline-flex items-center justify-center leading-none ${className}`} />
);

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};
const API_BASE = getApiBase();

/* ────────────────────────────────────────────────────────────
   Types
──────────────────────────────────────────────────────────── */
interface TimetableSlot {
  period: number;
  subject: string;
  startTime: string; // "09:30"
  endTime: string;   // "10:15"
  sample?: boolean;
}

interface HomeworkItem {
  id: string;
  title: string;
  subject: string;
  dueDate: string | null;
  status: string; // not_submitted | submitted | late_submission
}

interface ExamItem {
  id: string;
  title: string;
  examType: string;
  subject: string;
  examDate: string;
  startTime: string;
  venue?: string | null;
  section?: string;
  status?: string;
}

interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  pinned?: boolean;
  createdAt: string;
}

interface MarkItem {
  subject: string;
  scored: number;
  maxMarks: number;
}

/* Fallback timetable shown when the school has not published one yet */
const SAMPLE_TIMES: [string, string][] = [
  ["09:30", "10:15"],
  ["10:15", "11:00"],
  ["11:15", "12:00"],
  ["12:00", "12:45"],
  ["13:30", "14:15"],
  ["14:15", "15:00"],
  ["15:15", "16:00"],
];
const SAMPLE_SUBJECTS = ["Tamil", "English", "Mathematics", "Science", "Social Science", "Mathematics", "Physical Education"];

const SUBJECT_COLORS: Record<string, string> = {
  Tamil: "#f59e0b",
  English: "#3b82f6",
  Mathematics: "#6366f1",
  Science: "#10b981",
  "Social Science": "#ec4899",
  Physics: "#0ea5e9",
  Chemistry: "#8b5cf6",
  Biology: "#22c55e",
  "Computer Science": "#64748b",
  "Physical Education": "#f97316",
};
const subjectColor = (s: string) => SUBJECT_COLORS[s] || "#64748b";

const toMinutes = (t: string) => {
  const [h, m] = String(t).split(":").map((x) => parseInt(x, 10));
  return (h || 0) * 60 + (m || 0);
};

const fmtTime = (t: string) => {
  const [h, m] = String(t).split(":").map((x) => parseInt(x, 10));
  if (isNaN(h)) return t;
  const am = h < 12;
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m || 0).padStart(2, "0")} ${am ? "AM" : "PM"}`;
};

const daysUntil = (d: string | Date) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
};



interface StudentDailyOverviewProps {
  extraLeft?: React.ReactNode;
  extraRight?: React.ReactNode;
}

export default function StudentDailyOverview({ extraLeft, extraRight }: StudentDailyOverviewProps = {}) {
  const { data: session } = useSession();
  const { lang } = usePortalLanguage();

  const [timetable, setTimetable] = useState<TimetableSlot[] | null>(null);
  const [homework, setHomework] = useState<HomeworkItem[] | null>(null);
  const [exams, setExams] = useState<ExamItem[] | null>(null);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[] | null>(null);
  const [attendance, setAttendance] = useState<{ pct: number | null; today: string; present: number; total: number } | null>(null);
  const [marks, setMarks] = useState<MarkItem[]>([]);
  const [nowMin, setNowMin] = useState(() => new Date().getHours() * 60 + new Date().getMinutes());

  // Tick every minute so the "Now / Next" period highlight stays live
  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      setNowMin(d.getHours() * 60 + d.getMinutes());
    }, 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const u = session?.user as any;
    let cancelled = false;

    (async () => {
      // Resolve student identity (studentId + school/class/section) from the
      // session, falling back to the students list when fields are missing.
      let studentId = u?.studentId || null;
      let schoolId = u?.schoolId || null;
      let cls = u?.class ? String(u.class) : null;
      let section = u?.section ? String(u.section) : null;

      if (!studentId || !schoolId || !cls) {
        try {
          const studentParams = new URLSearchParams();
          if (u?.id) studentParams.set("userId", u.id);
          const res = await fetch(`${API_BASE}/api/students?${studentParams.toString()}`);
          const json = await res.json();
          const students = json.success && Array.isArray(json.data) ? json.data : json.success && json.data ? [json.data] : [];
          const me = u?.id
            ? students.find((s: any) => s.userId === u.id) || students[0]
            : students[0];
          if (me) {
            studentId = studentId || me.id;
            schoolId = schoolId || me.schoolId;
            cls = cls || String(me.class);
            section = section || (me.section ? String(me.section) : null);
          }
        } catch {}
      }

      // 2. Parse & normalize class and section (e.g., "11-B" -> class="11", section="B")
      let cleanClass = cls ? String(cls).trim() : "11";
      let cleanSection = section ? String(section).trim() : "";
      const numMatch = cleanClass.match(/\d+/);
      if (numMatch) {
        const secLetter = cleanClass.replace(/[^a-zA-Z]/g, "").trim();
        cleanClass = numMatch[0];
        if (!cleanSection && secLetter) cleanSection = secLetter;
      }

      const today = new Date();
      const dayOfWeek = today.getDay(); // 0=Sun … 6=Sat (matches Timetable.dayOfWeek)

      /* 1. Daily timetable + upcoming classes */
      if (schoolId && cleanClass) {
        const ttParams = new URLSearchParams();
        ttParams.set("schoolId", schoolId);
        ttParams.set("class", cleanClass);
        if (cleanSection) ttParams.set("section", cleanSection);

        fetch(`${API_BASE}/api/timetable?${ttParams.toString()}`)
          .then((r) => r.json())
          .then((json) => {
            if (cancelled) return;
            if (json.success && Array.isArray(json.data) && json.data.length > 0) {
              const allClassSlots = json.data;
              const todaySlots = allClassSlots.filter((s: any) => Number(s.dayOfWeek) === dayOfWeek);

              if (todaySlots.length > 0) {
                setTimetable(
                  todaySlots
                    .sort((a: any, b: any) => a.period - b.period)
                    .map((s: any) => ({ period: s.period, subject: s.subject, startTime: s.startTime, endTime: s.endTime, sample: false }))
                );
              } else {
                // Real timetable is published for this class, but no classes scheduled for today specifically
                setTimetable([]);
              }
            } else {
              // School has not published a timetable for this class yet — show a sample day
              setTimetable(
                dayOfWeek === 0
                  ? []
                  : SAMPLE_TIMES.map(([st, et], i) => ({
                      period: i + 1,
                      subject: SAMPLE_SUBJECTS[i % SAMPLE_SUBJECTS.length],
                      startTime: st,
                      endTime: et,
                      sample: true,
                    }))
              );
            }
          })
          .catch(() => !cancelled && setTimetable([]));
      } else {
        setTimetable([]);
      }

      /* 2. Pending homework */
      fetch(`${API_BASE}/api/students/${studentId}/homework`)
        .then((r) => r.json())
        .then((json) => {
          if (cancelled) return;
          if (json.success && Array.isArray(json.data)) {
            const pending = json.data
              .filter((h: any) => h.status === "not_submitted")
              .sort((a: any, b: any) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime());
            setHomework(pending);
          } else setHomework([]);
        })
        .catch(() => !cancelled && setHomework([]));

      /* 3. Upcoming examinations — only show real published exams from the headmaster */
      const examUrl = new URLSearchParams();
      if (schoolId) examUrl.set("schoolId", schoolId);
      if (cleanClass) examUrl.set("class", cleanClass);
      // Note: do NOT send section — fetch all class exams and filter client-side
      // so "All"-section exams always show for every student in that class

      fetch(`${API_BASE}/api/exam-schedule?${examUrl.toString()}`)
        .then((r) => r.json())
        .then((json) => {
          if (cancelled) return;
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const mine = json.data.filter(
              (e: any) => {
                // Exclude cancelled exams only
                if (e.status === "Cancelled" || e.status === "CANCELLED") return false;
                // Section filter: only filter if exam is narrowly scoped to a single letter section
                // Group names like "Commerce", "General", "Science", "All", or empty = visible to all students in the class
                const examSec = (e.section || "").trim();
                const isSingleLetterSection = /^[A-Z]$/i.test(examSec);
                if (cleanSection && isSingleLetterSection &&
                    examSec.toLowerCase() !== cleanSection.toLowerCase()) return false;
                return true;
              }
            );
            setExams(mine);
          } else {
            // No exams published by headmaster — show empty state, no dummy data
            setExams([]);
          }
        })
        .catch(() => {
          if (!cancelled) setExams([]);
        });

      /* 4. Attendance status (this month + today) */
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
      fetch(`${API_BASE}/api/attendance/${studentId}?from=${monthStart}`)
        .then((r) => r.json())
        .then((json) => {
          if (cancelled) return;
          if (json.success) {
            const todayStr = today.toISOString().slice(0, 10);
            const todayRec = (json.data || []).find((a: any) => String(a.date).slice(0, 10) === todayStr);
            setAttendance({
              pct: json.total > 0 ? json.percentage : null,
              today: todayRec ? todayRec.status : "NOT_MARKED",
              present: json.present || 0,
              total: json.total || 0,
            });
          } else setAttendance({ pct: null, today: "NOT_MARKED", present: 0, total: 0 });
        })
        .catch(() => !cancelled && setAttendance({ pct: null, today: "NOT_MARKED", present: 0, total: 0 }));

      const loadNotifications = () => {
        if (!u?.id) {
          setAnnouncements([]);
          return Promise.resolve();
        }
        return fetch(`${API_BASE}/api/notifications?userId=${u.id}`)
          .then((r) => r.json())
          .then((json) => {
            if (cancelled) return;
            if (json.success && Array.isArray(json.data) && json.data.length > 0) {
              setAnnouncements(
                json.data.slice(0, 8).map((n: any) => ({
                  id: n.id,
                  title: n.message,
                  body: "",
                  createdAt: n.createdAt,
                }))
              );
            } else setAnnouncements([]);
          })
          .catch(() => !cancelled && setAnnouncements([]));
      };

      if (schoolId && cls) {
        fetch(
          `${API_BASE}/api/students/announcements?schoolId=${schoolId}&class=${encodeURIComponent(cls)}&section=${encodeURIComponent(section || "")}`
        )
          .then((r) => r.json())
          .then((json) => {
            if (cancelled) return;
            if (json.success && Array.isArray(json.data) && json.data.length > 0) {
              const sorted = [...json.data].sort(
                (a: any, b: any) => Number(!!b.pinned) - Number(!!a.pinned) ||
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              setAnnouncements(sorted);
            } else loadNotifications();
          })
          .catch(() => loadNotifications());
      } else {
        loadNotifications();
      }

      /* 6. Marks — used to build learning recommendations & study suggestions */
      fetch(`${API_BASE}/api/students/${studentId}/marks`)
        .then((r) => r.json())
        .then((json) => {
          if (cancelled) return;
          if (json.success && Array.isArray(json.data)) setMarks(json.data);
        })
        .catch(() => {});
    })();

    return () => {
      cancelled = true;
    };
  }, [session]);

  /* ── derived: current / next period (upcoming classes) ── */
  const { currentPeriod, nextPeriods } = useMemo(() => {
    const slots = timetable || [];
    const current = slots.find((s) => nowMin >= toMinutes(s.startTime) && nowMin < toMinutes(s.endTime)) || null;
    const upcoming = slots.filter((s) => toMinutes(s.startTime) > nowMin);
    return { currentPeriod: current, nextPeriods: upcoming };
  }, [timetable, nowMin]);

  /* ── derived: subject averages → weakest subject ── */
  const subjectAverages = useMemo(() => {
    const bySubject: Record<string, { scored: number; max: number }> = {};
    for (const m of marks) {
      if (!m.maxMarks) continue;
      bySubject[m.subject] = bySubject[m.subject] || { scored: 0, max: 0 };
      bySubject[m.subject].scored += m.scored;
      bySubject[m.subject].max += m.maxMarks;
    }
    return Object.entries(bySubject)
      .map(([subject, v]) => ({ subject, pct: Math.round((v.scored / v.max) * 100) }))
      .sort((a, b) => a.pct - b.pct);
  }, [marks]);

  /* ── derived: AI study suggestions + learning recommendations ── */
  const suggestions = useMemo(() => {
    const out: { icon: string; color: string; text: React.ReactNode; href: string; action: string }[] = [];

    const weakest = subjectAverages[0];
    if (weakest && weakest.pct < 70) {
      out.push({
        icon: "chart-histogram",
        color: "#ef4444",
        text: (
          <>
            Your <strong>{weakest.subject}</strong> average is <strong>{weakest.pct}%</strong> — revise the current
            unit with video lessons and mind maps before your next test.
          </>
        ),
        href: "/student/academics",
        action: "Open study materials",
      });
    }

    const overdue = (homework || []).filter((h) => h.dueDate && daysUntil(h.dueDate) < 0);
    if (overdue.length > 0) {
      out.push({
        icon: "time-delete",
        color: "#f59e0b",
        text: (
          <>
            <strong>{overdue.length}</strong> homework {overdue.length === 1 ? "task is" : "tasks are"} past the due
            date — submit {overdue.length === 1 ? "it" : "them"} today to avoid losing marks.
          </>
        ),
        href: "/student/homework",
        action: "Finish homework",
      });
    } else if ((homework || []).length > 0) {
      out.push({
        icon: "pencil",
        color: "#3b82f6",
        text: (
          <>
            You have <strong>{homework!.length}</strong> pending homework{" "}
            {homework!.length === 1 ? "task" : "tasks"} — plan 30 minutes this evening to clear{" "}
            {homework!.length === 1 ? "it" : "the earliest one"}.
          </>
        ),
        href: "/student/homework",
        action: "View homework",
      });
    }

    const nextExam = (exams || [])[0];
    if (nextExam) {
      const d = daysUntil(nextExam.examDate);
      out.push({
        icon: "calendar-clock",
        color: "#8b5cf6",
        text: (
          <>
            <strong>{nextExam.subject}</strong> {nextExam.examType} exam is{" "}
            <strong>{d <= 0 ? "today" : d === 1 ? "tomorrow" : `in ${d} days`}</strong> — take a practice assessment to
            check your readiness.
          </>
        ),
        href: "/student/assessments",
        action: "Take a mock test",
      });
    }

    if (attendance && attendance.pct !== null && attendance.pct < 85) {
      out.push({
        icon: "calendar-check",
        color: "#10b981",
        text: (
          <>
            Your attendance this month is <strong>{attendance.pct}%</strong> — staying above 85% keeps you eligible
            for exams and scholarships.
          </>
        ),
        href: "/student/leave",
        action: "Check leave records",
      });
    }

    if (out.length === 0) {
      out.push({
        icon: "sparkles",
        color: "#6366f1",
        text: <>You are all caught up! Explore a new lesson or revise a completed unit to stay ahead.</>,
        href: "/student/academics",
        action: "Explore lessons",
      });
    }
    return out.slice(0, 4);
  }, [subjectAverages, homework, exams, attendance]);

  const recommendations = useMemo(() => {
    const weak = subjectAverages[0]?.subject;
    return [
      {
        icon: "play-alt",
        label: weak ? `${weak} video lessons` : "Video lessons",
        sub: weak ? "Boost your weakest subject" : "Learn with recorded classes",
        href: "/student/academics",
        color: "#ef4444",
      },
      {
        icon: "books",
        label: "Digital Library",
        sub: "Books & flashcards for revision",
        href: "/student/digital-library",
        color: "#6366f1",
      },
      {
        icon: "comment-alt",
        label: "Ask the AI Tutor",
        sub: "Clear a doubt in any subject",
        href: "/student/ai-tutor",
        color: "#10b981",
      },
    ];
  }, [subjectAverages]);

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const attendanceToday =
    attendance?.today === "PRESENT"
      ? { label: lang === "தமிழ்" ? "இன்று வருகை" : "Present today", color: "#10b981", icon: "check" }
      : attendance?.today === "ABSENT"
      ? { label: lang === "தமிழ்" ? "இன்று வரவில்லை" : "Absent today", color: "#ef4444", icon: "cross-small" }
      : attendance?.today === "LATE"
      ? { label: lang === "தமிழ்" ? "இன்று தாமதம்" : "Marked late today", color: "#f59e0b", icon: "clock" }
      : { label: lang === "தமிழ்" ? "இன்னும் குறிக்கப்படவில்லை" : "Not marked yet", color: "#64748b", icon: "clock" };

  return (
    <div className="mb-6 space-y-4">
      {/* ── Header strip ─────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[var(--text-heading)] flex items-center gap-2">
            <Fi name="calendar" className="text-base text-indigo-500" /> {lang === "தமிழ்" ? "இன்றைய பார்வையில்" : "Today at a Glance"}
          </h2>
          <p className="text-[11px] text-[var(--text-muted)]">{todayLabel}</p>
        </div>
        {nextPeriods.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10">
            <Fi name="bell-school" className="text-xs text-indigo-500" />
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              {lang === "தமிழ்" ? `அடுத்த வகுப்பு: ${nextPeriods[0].subject} (${fmtTime(nextPeriods[0].startTime)})` : `Next class: ${nextPeriods[0].subject} at ${fmtTime(nextPeriods[0].startTime)}`}
            </span>
          </div>
        )}
      </div>

      {/* ── Main Overview Grid ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Left Column Stack */}
        <div className="space-y-4">
          {/* Daily timetable & upcoming classes */}
          <div className="glass rounded-2xl p-5 border border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[var(--text-heading)] flex items-center gap-2">
                <Fi name="calendar-lines" className="text-sm text-indigo-500" /> {lang === "தமிழ்" ? "இன்றைய பாட அட்டவணை" : "Today's Timetable"}
              </h3>
              {timetable?.[0]?.sample && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                  {lang === "தமிழ்" ? "மாதிரி — அட்டவணை இன்னும் வெளியிடப்படவில்லை" : "Sample — timetable not published yet"}
                </span>
              )}
            </div>

            {timetable === null ? (
              <CardLoading />
            ) : timetable.length === 0 ? (
              <EmptyNote icon="moon-stars" text={lang === "தமிழ்" ? "இன்று வகுப்புகள் எதுவும் திட்டமிடப்படவில்லை." : "No classes scheduled today. Enjoy your holiday — or revise a unit you found hard!"} />
            ) : (
              <div className="space-y-1.5">
                {timetable.map((slot) => {
                  const isNow = currentPeriod?.period === slot.period;
                  const isNext = nextPeriods[0]?.period === slot.period;
                  const done = toMinutes(slot.endTime) <= nowMin;
                  return (
                    <div
                      key={slot.period}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-colors ${
                        isNow
                          ? "border-emerald-500/50 bg-emerald-500/10"
                          : isNext
                          ? "border-indigo-500/40 bg-indigo-500/5"
                          : "border-[var(--border)]"
                      } ${done ? "opacity-55" : ""}`}
                    >
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
                        style={{ backgroundColor: `${subjectColor(slot.subject)}1a`, color: subjectColor(slot.subject) }}
                      >
                        P{slot.period}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[var(--text-heading)] truncate">{slot.subject}</div>
                        <div className="text-[10px] text-[var(--text-muted)] font-semibold">
                          {fmtTime(slot.startTime)} – {fmtTime(slot.endTime)}
                        </div>
                      </div>
                      {isNow && (
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-1 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {lang === "தமிழ்" ? "இப்போது" : "Now"}
                        </span>
                      )}
                      {isNext && (
                        <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/15 px-2 py-1 rounded-full">
                          {lang === "தமிழ்" ? "அடுத்து" : "Up next"}
                        </span>
                      )}
                      {done && <Fi name="check" className="text-xs text-[var(--text-muted)]" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Exams & Teacher Announcements Sub-grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upcoming examinations */}
            <div className="glass rounded-2xl p-5 border border-[var(--border)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[var(--text-heading)] flex items-center gap-2">
                  <Fi name="diploma" className="text-sm text-purple-500" /> {lang === "தமிழ்" ? "வரவிருக்கும் தேர்வுகள்" : "Upcoming Exams"}
                </h3>
                <Link href="/student/exams" className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline">
                  {lang === "தமிழ்" ? "முழு அட்டவணை" : "Full schedule"}
                </Link>
              </div>
              {exams === null ? (
                <CardLoading />
              ) : exams.length === 0 ? (
                <EmptyNote icon="calendar" text={lang === "தமிழ்" ? "தேர்வுகள் எதுவும் இன்னும் திட்டமிடப்படவில்லை." : "No exams scheduled yet. Keep revising — the schedule will appear here."} />
              ) : (
                <div className="space-y-2">
                  {exams.slice(0, 4).map((e) => {
                    const d = daysUntil(e.examDate);
                    return (
                      <div key={e.id} className="flex items-center gap-3 px-3 py-2 rounded-xl border border-[var(--border)]">
                        <div
                          className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0"
                          style={{ backgroundColor: `${subjectColor(e.subject)}14`, color: subjectColor(e.subject) }}
                        >
                          <span className="text-sm font-black leading-none">{new Date(e.examDate).getDate()}</span>
                          <span className="text-[8px] font-bold uppercase">
                            {new Date(e.examDate).toLocaleDateString(undefined, { month: "short" })}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[var(--text-heading)] truncate">
                            {e.subject} · {e.examType}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] font-semibold truncate">
                            {fmtTime(e.startTime)}
                            {e.venue ? ` · ${e.venue}` : ""}
                          </div>
                        </div>
                        <span
                          className={`text-[9px] font-black px-2.5 py-1 rounded-full shrink-0 uppercase tracking-wider ${
                            e.status === "In Progress" || e.status === "ONGOING"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                              : d <= 0
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                              : d <= 3
                              ? "bg-red-500/10 text-red-500 border border-red-500/30"
                              : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                          }`}
                        >
                          {e.status === "In Progress" || e.status === "ONGOING"
                            ? (lang === "தமிழ்" ? "நடக்கிறது" : "Ongoing")
                            : d <= 0
                            ? (lang === "தமிழ்" ? "இன்று" : "Today")
                            : d === 1
                            ? (lang === "தமிழ்" ? "நாளை" : "Tomorrow")
                            : `${d} ${lang === "தமிழ்" ? "நாட்கள்" : "days"}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Teacher announcements */}
            <div className="glass rounded-2xl p-5 border border-[var(--border)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[var(--text-heading)] flex items-center gap-2">
                  <Fi name="megaphone" className="text-sm text-amber-500" /> {lang === "தமிழ்" ? "ஆசிரியர் அறிவிப்புகள்" : "Teacher Announcements"}
                </h3>
                <Link
                  href="/student/announcements"
                  className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  {lang === "தமிழ்" ? "அனைத்தையும் பார்" : "View all"}
                </Link>
              </div>
              {announcements === null ? (
                <CardLoading />
              ) : announcements.length === 0 ? (
                <EmptyNote icon="bell" text={lang === "தமிழ்" ? "இப்போது புதிய அறிவிப்புகள் இல்லை." : "No announcements right now. New messages from your teachers will appear here."} />
              ) : (
                <div className="space-y-2">
                  {announcements.slice(0, 3).map((a) => (
                    <div key={a.id} className="px-3 py-2 rounded-xl border border-[var(--border)]">
                      <div className="flex items-start gap-2">
                        {a.pinned && <Fi name="thumbtack" className="text-[10px] text-amber-500 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[var(--text-heading)] leading-snug line-clamp-2">{a.title}</div>
                          {a.body && (
                            <div className="text-[10px] text-[var(--text-muted)] leading-relaxed line-clamp-2 mt-0.5">{a.body}</div>
                          )}
                          <div className="text-[9px] text-[var(--text-muted)] font-semibold mt-1">
                            {new Date(a.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {extraLeft}
        </div>

        {/* Right Sidebar Stack */}
        <div className="space-y-4">
          {/* Attendance & Homework Sub-grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Attendance status */}
            <div className="glass rounded-2xl p-5 border border-[var(--border)]">
              <h3 className="text-sm font-bold text-[var(--text-heading)] flex items-center gap-2 mb-3">
                <Fi name="calendar-check" className="text-sm text-emerald-500" /> {lang === "தமிழ்" ? "வருகைப்பதிவு நிலை" : "Attendance Status"}
              </h3>
              {attendance === null ? (
                <CardLoading />
              ) : (
                <div className="space-y-3">
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                    style={{ borderColor: `${attendanceToday.color}55`, backgroundColor: `${attendanceToday.color}14` }}
                  >
                    <span style={{ color: attendanceToday.color }}>
                      <Fi name={attendanceToday.icon} className="text-sm" />
                    </span>
                    <span className="text-xs font-bold" style={{ color: attendanceToday.color }}>
                      {attendanceToday.label}
                    </span>
                  </div>
                  {attendance.pct !== null ? (
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-[var(--text-muted)] mb-1.5">
                        <span>{lang === "தமிழ்" ? "இந்த மாதம்" : "This month"}</span>
                        <span>
                          {attendance.present}/{attendance.total} {lang === "தமிழ்" ? "நாட்கள்" : "days"} · {attendance.pct}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${attendance.pct}%`,
                            background: attendance.pct >= 85 ? "#10b981" : attendance.pct >= 70 ? "#f59e0b" : "#ef4444",
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-[var(--text-muted)] italic">{lang === "தமிழ்" ? "இந்த மாதம் இதுவரை வருகைப்பதிவு இல்லை." : "No attendance recorded this month yet."}</p>
                  )}
                  <Link
                    href="/student/leave"
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                  >
                    {lang === "தமிழ்" ? "விடுப்பு கோரிக்கைகள் & வரலாறு" : "Leave requests & history"} <Fi name="arrow-small-right" className="text-xs" />
                  </Link>
                </div>
              )}
            </div>

            {/* Pending homework */}
            <div className="glass rounded-2xl p-5 border border-[var(--border)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[var(--text-heading)] flex items-center gap-2">
                  <Fi name="pencil" className="text-sm text-blue-500" /> {lang === "தமிழ்" ? "நிலுவையில் உள்ள வீட்டுப்பாடம்" : "Pending Homework"}
                </h3>
                {homework && homework.length > 0 && (
                  <span className="text-[10px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                    {homework.length}
                  </span>
                )}
              </div>
              {homework === null ? (
                <CardLoading />
              ) : homework.length === 0 ? (
                <EmptyNote icon="check" text={lang === "தமிழ்" ? "நிலுவையில் வீட்டுப்பாடம் இல்லை — அனைத்தும் முடிந்தது!" : "No pending homework — you're all caught up!"} />
              ) : (
                <div className="space-y-2">
                  {homework.slice(0, 3).map((h) => {
                    const d = h.dueDate ? daysUntil(h.dueDate) : null;
                    const overdue = d !== null && d < 0;
                    return (
                      <Link
                        key={h.id}
                        href="/student/homework"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors"
                      >
                        <span
                          className="w-1.5 h-8 rounded-full shrink-0"
                          style={{ backgroundColor: overdue ? "#ef4444" : subjectColor(h.subject) }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[var(--text-heading)] truncate">{h.title}</div>
                          <div className={`text-[10px] font-semibold ${overdue ? "text-red-500" : "text-[var(--text-muted)]"}`}>
                            {h.subject}
                            {d !== null &&
                              ` · ${overdue ? (lang === "தமிழ்" ? `${Math.abs(d)} நாட்கள் தாமதம்` : `Overdue by ${Math.abs(d)} day${Math.abs(d) === 1 ? "" : "s"}`) : d === 0 ? (lang === "தமிழ்" ? "இன்று கடைசி நாள்" : "Due today") : d === 1 ? (lang === "தமிழ்" ? "நாளை கடைசி நாள்" : "Due tomorrow") : (lang === "தமிழ்" ? `${d} நாட்களில் கடைசி நாள்` : `Due in ${d} days`)}`}
                          </div>
                        </div>
                        <Fi name="angle-small-right" className="text-sm text-[var(--text-muted)]" />
                      </Link>
                    );
                  })}
                  <Link
                    href="/student/homework"
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    {lang === "தமிழ்" ? "அனைத்து வீட்டுப்பாடங்களும்" : "All homework"} <Fi name="arrow-small-right" className="text-xs" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* AI study suggestions + learning recommendations */}
          <div className="glass rounded-2xl p-5 border border-indigo-500/40 bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900/60 shadow-xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl opacity-25 bg-gradient-to-br from-indigo-500 to-fuchsia-500 pointer-events-none" />
            <div className="flex items-center justify-between mb-1 relative z-10">
              <h3 className="text-sm font-bold text-[var(--text-heading)] flex items-center gap-2">
                <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Fi name="sparkles" className="text-sm" />
                </span>
                {lang === "தமிழ்" ? "AI கற்றல் பரிந்துரைகள்" : "AI Study Suggestions"}
              </h3>
            </div>
            <p className="text-[9px] text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-3 relative z-10">
              {lang === "தமிழ்" ? "மதிப்பெண்கள், வீட்டுப்பாடம் மற்றும் வருகைப் பதிவிலிருந்து உருவாக்கப்பட்டது" : "Generated from your marks, homework & attendance"}
            </p>
            <div className="space-y-2 relative z-10">
              {suggestions.map((s, i) => (
                <Link
                  key={i}
                  href={s.href}
                  className="flex items-start gap-2.5 px-3 py-2 rounded-xl border border-indigo-500/20 bg-slate-900/40 hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-all group shadow-sm"
                >
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-inner"
                    style={{ backgroundColor: `${s.color}1e`, color: s.color }}
                  >
                    <Fi name={s.icon} className="text-xs" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[var(--text-main)] leading-relaxed font-medium">{s.text}</p>
                    <span
                      className="text-[10px] font-bold inline-flex items-center gap-1 mt-1 group-hover:gap-1.5 transition-all"
                      style={{ color: s.color }}
                    >
                      {s.action} <Fi name="arrow-small-right" className="text-[10px]" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Learning recommendations */}
            <div className="mt-3 pt-3 border-t border-[var(--border)] relative z-10">
              <div className="text-[9px] text-[var(--text-muted)] font-semibold uppercase tracking-wider mb-2">
                {lang === "தமிழ்" ? "உங்களுக்காக பரிந்துரைக்கப்பட்டவை" : "Recommended for you"}
              </div>
              <div className="space-y-1.5">
                {recommendations.map((r) => (
                  <Link
                    key={r.href}
                    href={r.href}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-[var(--bg-card-hover)] transition-colors"
                  >
                    <span style={{ color: r.color }}>
                      <Fi name={r.icon} className="text-sm" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-[var(--text-heading)] block truncate">{r.label}</span>
                      <span className="text-[9px] text-[var(--text-muted)] block truncate">{r.sub}</span>
                    </div>
                    <Fi name="angle-small-right" className="text-xs text-[var(--text-muted)]" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {extraRight}
        </div>
      </div>
    </div>
  );
}

/* ── small shared bits ─────────────────────────────────── */
function CardLoading() {
  return (
    <div className="space-y-2 animate-pulse py-1">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-9 rounded-xl bg-slate-200/60 dark:bg-slate-800/60" />
      ))}
    </div>
  );
}

function EmptyNote({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-4 rounded-xl border border-dashed border-[var(--border)]">
      <Fi name={icon} className="text-lg text-[var(--text-muted)]" />
      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{text}</p>
    </div>
  );
}
