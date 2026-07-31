"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};
const API_BASE = getApiBase();

interface Exam {
  id: string;
  examName: string;
  category: string;
  conductedBy: string;
  examDate: string;
  registrationDeadline: string;
  status: string;
  eligibility: string;
  website: string | null;
  examLevel?: string | null;
}

interface ExamWithReason {
  exam: Exam;
  reason: string;
}

interface Recommendations {
  group: {
    code: string;
    name: string;
    subjects: string[];
    streamCategory: string;
    streamLabel: string;
  } | null;
  groupNotSet: boolean;
  recommended: ExamWithReason[];
  others: ExamWithReason[];
}

const categoryIcon: Record<string, string> = {
  Medical: "🏥", Engineering: "⚙️", "Civil Services": "🏛️", Management: "📈",
  Banking: "🏦", Defence: "🛡️", Law: "⚖️", Design: "🎨", "Government Jobs": "🏢", Other: "📖",
};

// Where "prepare this subject" should send the student
function subjectPrepLink(subject: string): { href: string; label: string } {
  const s = subject.toLowerCase();
  if (s.includes("physics") || s.includes("chemistry") || s.includes("biology") || s.includes("botany") || s.includes("zoology") || s.includes("bio-chem") || s.includes("micro")) {
    return { href: "/student/neet-prep", label: "NEET-style practice" };
  }
  if (s.includes("math")) {
    return { href: "/student/higher-secondary/board-prep", label: "Board & JEE prep" };
  }
  return { href: "/student/centralized-content", label: "Syllabus content" };
}

function ExamCard({ item, highlight }: { item: ExamWithReason; highlight: boolean }) {
  const { exam, reason } = item;
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all ${
        highlight ? "border-violet-300 dark:border-violet-800 ring-1 ring-violet-200 dark:ring-violet-900" : "border-slate-200 dark:border-slate-800"
      }`}
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0">
          {categoryIcon[exam.category] || "📖"}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">{exam.examName}</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">By {exam.conductedBy}</p>
        </div>
        {exam.examLevel && (
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {exam.examLevel}
          </span>
        )}
      </div>

      <div className={`text-[10px] font-semibold rounded-lg px-2.5 py-1.5 mb-3 ${
        highlight
          ? "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
          : "bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400"
      }`}>
        {highlight ? "✅ " : "ℹ️ "}{reason}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-2">
          <div className="text-[9px] text-slate-400 font-semibold mb-0.5">📋 Reg. Deadline</div>
          <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{exam.registrationDeadline}</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-2">
          <div className="text-[9px] text-slate-400 font-semibold mb-0.5">📅 Exam Date</div>
          <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{exam.examDate}</div>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 mb-3">{exam.eligibility}</p>

      {exam.website && (
        <a
          href={exam.website.startsWith("http") ? exam.website : `https://${exam.website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-violet-500 hover:underline"
        >
          🌐 Official website →
        </a>
      )}
    </div>
  );
}

interface Props {
  studentId: string | null;
  /** Student's class from session, e.g. "12" */
  studentClass: string | null;
  schoolId?: string | null;
}

/**
 * Group-aware competitive exam guidance for 11th–12th students.
 * Reads the student's HSC group (DGE Annexure-I code) and splits the
 * exam catalog into "recommended for your group" vs "other exams",
 * plus subject-wise preparation shortcuts.
 * Renders nothing for classes below 11.
 */
export default function GroupAwareExamList({ studentId, studentClass, schoolId }: Props) {
  const [recs, setRecs] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOthers, setShowOthers] = useState(false);

  const classNum = parseInt(studentClass || "0", 10);
  const isHsc = classNum === 11 || classNum === 12;

  useEffect(() => {
    if (!isHsc) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        let group = "";
        if (studentId) {
          const res = await fetch(`${API_BASE}/api/students/${studentId}`);
          const json = await res.json();
          group = json?.data?.group || json?.group || "";
        }
        let recUrl = `${API_BASE}/api/competitive-exams/recommendations?group=${encodeURIComponent(group)}&class=${classNum}`;
        if (schoolId) {
          recUrl += `&schoolId=${encodeURIComponent(schoolId)}`;
        }
        const recRes = await fetch(recUrl);
        const recJson = await recRes.json();
        if (!cancelled && recJson.success) setRecs(recJson.data);
      } catch {
        /* noop */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [studentId, classNum, isHsc, schoolId]);

  if (!isHsc) return null;

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
      </div>
    );
  }
  if (!recs) return null;

  return (
    <div className="space-y-6">
      {/* Group banner */}
      {recs.group ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white p-6 shadow-xl">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
              🎯 {recs.group.streamLabel}
            </span>
            <h3 className="text-xl md:text-2xl font-black tracking-tight">Group {recs.group.code}</h3>
            <p className="text-white/85 text-xs md:text-sm font-medium mt-1">
              Your Part-III subjects: {recs.group.subjects.join(" · ")}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 text-xs text-amber-700 dark:text-amber-300 font-semibold">
          ⚠️ Your HSC group is not set yet. Ask your school office to select your official group code (e.g. 2503) — then this page can recommend exams that match your subjects.
        </div>
      )}

      {/* Recommended */}
      {recs.recommended.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">🌟 Recommended for your group</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recs.recommended.map((item) => (
              <ExamCard key={item.exam.id} item={item} highlight />
            ))}
          </div>
        </div>
      )}

      {/* Subject-wise preparation */}
      {recs.group && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">📚 Prepare subject by subject</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recs.group.subjects.map((subject) => {
              const link = subjectPrepLink(subject);
              return (
                <Link
                  key={subject}
                  href={link.href}
                  className="group bg-slate-50 dark:bg-slate-950 rounded-xl p-3 border border-slate-100 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all"
                >
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-violet-400">
                    {subject}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{link.label} →</div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Other exams — collapsed */}
      {recs.others.length > 0 && (
        <div>
          <button
            onClick={() => setShowOthers(!showOthers)}
            className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-violet-500 mb-3"
          >
            {showOthers ? "▲ Hide" : "▼ Show"} other exams ({recs.others.length})
          </button>
          {showOthers && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {recs.others.map((item) => (
                <ExamCard key={item.exam.id} item={item} highlight={false} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
