"use client";

import PortalLayout from "@/components/PortalLayout";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import {
  BarChart2,
  BookOpen,
  Award,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Printer,
  Sparkles,
  RefreshCw,
  Clock,
  ShieldCheck,
} from "lucide-react";

interface SubjectMark {
  id?: string;
  name: string;
  score: number;
  maxScore: number;
  grade: string;
  examType?: string;
}

interface StudentProfile {
  id: string;
  name: string;
  emisNumber: string;
  class: string;
  section: string;
  rollNumber: string;
  schoolName: string;
  attendancePct: number;
  remarks: string;
  subjects: SubjectMark[];
  overallScore: number;
  status: "Excellent" | "On Track" | "Needs Attention";
}

function getGrade(score: number, maxScore: number = 100): string {
  const pct = (score / (maxScore || 100)) * 100;
  if (pct >= 90) return "A1";
  if (pct >= 80) return "A2";
  if (pct >= 70) return "B1";
  if (pct >= 60) return "B2";
  if (pct >= 50) return "C1";
  if (pct >= 35) return "D";
  return "E";
}

export default function StudentProgressPage() {
  const { data: session } = useSession();
  const { lang } = usePortalLanguage();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchStudentProgress = useCallback(async () => {
    try {
      setLoading(true);

      const userId = (session?.user as any)?.id;
      const userSchoolId = (session?.user as any)?.schoolId;
      const userName = session?.user?.name || "Student";

      let studentData: any = null;
      let studentId = "";
      let cls = "11";
      let sec = "B";
      let emis = "";
      let roll = "";

      // 1. Fetch Student Info
      if (userId) {
        const studentRes = await fetch(`${API_URL}/api/students/profile?userId=${userId}`);
        const result = await studentRes.json();
        if (result.success && result.data) {
          studentData = result.data;
          studentId = studentData.id;
          cls = studentData.class || "11";
          sec = studentData.section || "B";
          emis = studentData.emisNumber || "";
          roll = studentData.rollNumber || "";
        }
      }

      // Fallback lookup if student profile not resolved by userId
      if (!studentId && userSchoolId) {
        const allRes = await fetch(`${API_URL}/api/students?schoolId=${userSchoolId}`);
        const allData = await allRes.json();
        if (allData.success && Array.isArray(allData.data) && allData.data.length > 0) {
          const match = allData.data.find((s: any) => s.userId === userId) || allData.data[0];
          studentData = match;
          studentId = match.id;
          cls = match.class || "11";
          sec = match.section || "B";
          emis = match.emisNumber || "";
          roll = match.rollNumber || "";
        }
      }

      // 2. Fetch Real PostgreSQL Database Marks
      let dbMarks: any[] = [];
      if (userSchoolId) {
        const marksRes = await fetch(
          `${API_URL}/api/students/marks/class-wise?schoolId=${userSchoolId}&class=${cls}&section=${sec}`
        );
        const marksData = await marksRes.json();
        if (marksData.success && Array.isArray(marksData.data)) {
          dbMarks = marksData.data.filter((m: any) => !studentId || m.studentId === studentId);
        }
      }

      // 3. Format Subjects List from PostgreSQL Marks
      const subjectsList: SubjectMark[] = dbMarks.map((m: any) => ({
        id: m.id,
        name: m.subject,
        score: m.scored,
        maxScore: m.maxMarks,
        grade: m.grade || getGrade(m.scored, m.maxMarks),
        examType: m.examType,
      }));

      // Calculate Overall Score %
      const validSubjects = subjectsList.filter((s) => s.score !== undefined);
      const totalPctSum = validSubjects.reduce((acc, s) => acc + (s.score / (s.maxScore || 100)) * 100, 0);
      const overallScore = validSubjects.length > 0 ? Math.round(totalPctSum / validSubjects.length) : 0;

      let status: StudentProfile["status"] = "On Track";
      if (overallScore >= 80) status = "Excellent";
      else if (overallScore > 0 && overallScore < 60) status = "Needs Attention";

      setProfile({
        id: studentId,
        name: userName,
        emisNumber: emis,
        class: cls,
        section: sec,
        rollNumber: roll,
        schoolName: (session?.user as any)?.schoolName || "Punitha Arockiya Annai Higher Secondary School",
        attendancePct: studentData?.attendancePct || 92,
        remarks: studentData?.remarks || "",
        subjects: subjectsList,
        overallScore,
        status,
      });
    } catch (err) {
      console.error("Failed to load student progress", err);
    } finally {
      setLoading(false);
    }
  }, [session, API_URL]);

  useEffect(() => {
    fetchStudentProgress();
  }, [fetchStudentProgress]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <PortalLayout>
      <div className="p-4 md:p-6 space-y-6 w-full">
        {/* Top Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 rounded-3xl border border-amber-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
                <BarChart2 className="w-6 h-6" />
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--text-heading)]">
                {lang === "தமிழ்" ? "எனது கல்விக் முன்னேற்றம்" : "My Academic Progress"}
              </h1>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1.5 font-medium">
              {lang === "தமிழ்"
                ? "உங்கள் பாடவாரியாக மதிப்பெண்கள், தரங்கள் மற்றும் ஆசிரியரின் மதிப்பீட்டுக் குறிப்புகள்."
                : "Real-time subject scores, academic performance grades, and teacher evaluation remarks."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStudentProgress}
              className="p-2.5 bg-[var(--bg-card)] hover:bg-[var(--border)] text-[var(--text-heading)] rounded-xl border border-[var(--border)] transition-all"
              title="Refresh Progress"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-500" : ""}`} />
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-extrabold text-xs transition-all shadow-md flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              {lang === "தமிழ்" ? "அறிக்கையை அச்சிடு" : "Print Progress Card"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] p-12 rounded-3xl text-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
            <p className="text-sm font-semibold text-[var(--text-muted)]">
              {lang === "தமிழ்" ? "முன்னேற்றத் தரவுகள் ஏற்றப்படுகின்றன..." : "Loading Academic Progress..."}
            </p>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Student Profile Identity Card */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-2xl flex items-center justify-center shadow-sm">
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[var(--text-heading)]">{profile.name}</h2>
                  <p className="text-xs font-semibold text-[var(--text-muted)] mt-0.5">
                    Class {profile.class}-{profile.section} {profile.rollNumber ? `· Roll #${profile.rollNumber}` : ""}{" "}
                    {profile.emisNumber ? `· EMIS: ${profile.emisNumber}` : ""}
                  </p>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mt-1">
                    {profile.schoolName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border ${
                    profile.status === "Excellent"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : profile.status === "On Track"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                  }`}
                >
                  Status: {profile.status}
                </span>
              </div>
            </div>

            {/* KPI Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[var(--bg-card)] border border-[var(--border)] p-5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider block">
                  {lang === "தமிழ்" ? "மொத்த சராசரி" : "Overall Average"}
                </span>
                <div className="text-3xl font-black text-amber-500">{profile.overallScore}%</div>
                <span className="text-[11px] text-[var(--text-muted)] font-medium block">Academic score average</span>
              </div>

              <div className="bg-[var(--bg-card)] border border-[var(--border)] p-5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider block">
                  {lang === "தமிழ்" ? "வருகை சதவீதம்" : "Attendance Rate"}
                </span>
                <div className="text-3xl font-black text-emerald-500">{profile.attendancePct}%</div>
                <span className="text-[11px] text-[var(--text-muted)] font-medium block">Total presence rate</span>
              </div>

              <div className="bg-[var(--bg-card)] border border-[var(--border)] p-5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider block">
                  {lang === "தமிழ்" ? "மதிப்பெண் பதிவுகள்" : "Subjects Recorded"}
                </span>
                <div className="text-3xl font-black text-blue-500">{profile.subjects.length}</div>
                <span className="text-[11px] text-[var(--text-muted)] font-medium block">Real PostgreSQL records</span>
              </div>
            </div>

            {/* Subject Performance Breakdown Table */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  {lang === "தமிழ்" ? "பாடவாரியாக மதிப்பெண் நிலை" : "Subject Performance Breakdown"}
                </h3>
              </div>

              {profile.subjects.length === 0 ? (
                <div className="p-8 text-center bg-[var(--bg-main)] rounded-2xl border border-[var(--border)] space-y-2">
                  <BookOpen className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
                  <p className="text-xs font-semibold text-[var(--text-muted)]">
                    {lang === "தமிழ்"
                      ? "இன்னும் எந்த பாடத்திற்கும் மதிப்பெண் பதிவு செய்யப்படவில்லை."
                      : "No subject marks recorded yet by your teacher."}
                  </p>
                </div>
              ) : (
                <div className="bg-[var(--bg-main)] rounded-2xl border border-[var(--border)] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--bg-card)] border-b border-[var(--border)] text-[var(--text-muted)] font-bold uppercase">
                      <tr>
                        <th className="p-3.5">{lang === "தமிழ்" ? "பாடம்" : "Subject"}</th>
                        <th className="p-3.5 text-center">{lang === "தமிழ்" ? "மதிப்பெண்" : "Score"}</th>
                        <th className="p-3.5 text-center">{lang === "தமிழ்" ? "தரம்" : "Grade"}</th>
                        <th className="p-3.5">{lang === "தமிழ்" ? "முன்னேற்றம்" : "Progress"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {profile.subjects.map((sub) => (
                        <tr key={sub.name} className="hover:bg-[var(--bg-card)] transition-colors">
                          <td className="p-3.5 font-bold text-[var(--text-heading)]">{sub.name}</td>
                          <td className="p-3.5 text-center font-extrabold text-[var(--text-heading)]">
                            {sub.score} / {sub.maxScore}
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              {sub.grade}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="w-full bg-[var(--bg-card)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
                              <div
                                className="bg-amber-500 h-full rounded-full"
                                style={{ width: `${(sub.score / sub.maxScore) * 100}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Teacher Evaluation & Remarks */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-3xl shadow-sm space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {lang === "தமிழ்" ? "ஆசிரியர் கருத்து மற்றும் பரிந்துரைகள்" : "Teacher Evaluation & Remarks"}
              </h3>
              <div className="p-4 bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl text-xs text-[var(--text-heading)] leading-relaxed">
                {profile.remarks ? (
                  <p className="font-medium">{profile.remarks}</p>
                ) : (
                  <p className="text-[var(--text-muted)] italic">
                    {lang === "தமிழ்"
                      ? "ஆசிரியரிடமிருந்து கருத்துகள் எதுவும் இல்லை."
                      : "No evaluation remarks entered by teacher yet."}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </PortalLayout>
  );
}
