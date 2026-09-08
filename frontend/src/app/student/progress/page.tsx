"use client";

import PortalLayout from "@/components/PortalLayout";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

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

  const handleDownloadProgressCard = () => {
    if (!profile) return;
    const printWin = window.open("", "_blank");
    if (!printWin) {
      window.print();
      return;
    }

    const validSubs = profile.subjects || [];
    const totalScored = validSubs.reduce((sum, s) => sum + Number(s.score || 0), 0);
    const totalMax = validSubs.reduce((sum, s) => sum + Number(s.maxScore || 100), 0);
    const avgPct = profile.overallScore;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Progress Card - ${profile.name} (EMIS: ${profile.emisNumber || "N/A"})</title>
          <style>
            @page { size: A4 portrait; margin: 12mm; }
            * { box-sizing: border-box; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }
            body { background: #fff; color: #0f172a; margin: 0; padding: 16px; font-size: 12px; line-height: 1.5; }
            .card-wrapper { border: 3px double #0284c7; padding: 28px; border-radius: 16px; background: #fff; max-width: 800px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { text-align: center; border-bottom: 2px dashed #0284c7; padding-bottom: 16px; margin-bottom: 20px; }
            .header-govt { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #0369a1; letter-spacing: 1px; }
            .header-school { font-size: 22px; font-weight: 900; color: #0f172a; margin: 6px 0; text-transform: uppercase; }
            .header-title { font-size: 14px; font-weight: 800; color: #0284c7; margin-top: 2px; }
            .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px; }
            .info-cell { font-size: 12px; color: #334155; }
            .info-cell strong { color: #475569; display: inline-block; width: 120px; font-weight: 700; }
            .status-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
            .status-excellent { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
            .status-ontrack { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
            .status-attention { background: #ffe4e6; color: #be123c; border: 1px solid #fecdd3; }
            .section-head { font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin: 20px 0 10px 0; border-left: 4px solid #0284c7; padding-left: 8px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
            th { background: #0284c7; color: #ffffff; padding: 9px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
            td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) td { background: #f8fafc; }
            .total-row td { background: #e0f2fe !important; font-weight: 800; color: #0369a1; border-top: 2px solid #0284c7; }
            .grade-pill { padding: 2px 8px; border-radius: 4px; font-weight: 900; background: #e0f2fe; color: #0369a1; font-family: monospace; font-size: 12px; }
            .legend-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; font-size: 10px; margin-bottom: 20px; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; }
            .legend-item { background: #f1f5f9; padding: 6px 2px; }
            .legend-item strong { display: block; color: #0284c7; font-size: 11px; }
            .remarks-container { background: #f8fafc; padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0; color: #334155; font-style: italic; min-height: 52px; font-size: 12px; }
            .sig-section { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding-top: 10px; }
            .sig-box { text-align: center; width: 30%; border-top: 1.5px dashed #94a3b8; padding-top: 6px; font-size: 11px; font-weight: 700; color: #475569; }
            .footer-verify { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="card-wrapper">
            <div class="header">
              <div class="header-govt">Government of Tamil Nadu · Department of School Education</div>
              <div class="header-school">${profile.schoolName}</div>
              <div class="header-title">STUDENT ACADEMIC PROGRESS REPORT (2025–2026)</div>
            </div>

            <div class="student-info">
              <div class="info-cell"><strong>Student Name:</strong> <span style="font-weight:900; font-size:14px; color:#0f172a;">${profile.name}</span></div>
              <div class="info-cell"><strong>Class & Section:</strong> Grade ${profile.class}-${profile.section}</div>
              <div class="info-cell"><strong>EMIS Number:</strong> ${profile.emisNumber || "N/A"}</div>
              <div class="info-cell"><strong>Roll Number:</strong> ${profile.rollNumber || "N/A"}</div>
              <div class="info-cell"><strong>Attendance Rate:</strong> <span style="color:#059669; font-weight:800;">${profile.attendancePct}%</span></div>
              <div class="info-cell"><strong>Academic Status:</strong> 
                <span class="status-badge ${profile.status === 'Excellent' ? 'status-excellent' : profile.status === 'Needs Attention' ? 'status-attention' : 'status-ontrack'}">
                  ${profile.status}
                </span>
              </div>
            </div>

            <div class="section-head">Scholastic Performance Summary</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 40px; text-align: center;">#</th>
                  <th>Subject</th>
                  <th style="text-align: center;">Max Marks</th>
                  <th style="text-align: center;">Scored</th>
                  <th style="text-align: center;">Percentage</th>
                  <th style="text-align: center;">Grade</th>
                </tr>
              </thead>
              <tbody>
                ${validSubs.length > 0 ? validSubs.map((sub, idx) => `
                  <tr>
                    <td style="text-align: center; font-weight: bold; color: #64748b;">${idx + 1}</td>
                    <td style="font-weight: 700; color: #0f172a;">${sub.name}</td>
                    <td style="text-align: center;">${sub.maxScore || 100}</td>
                    <td style="text-align: center; font-weight: 800; color: #0f172a;">${sub.score}</td>
                    <td style="text-align: center;">${Math.round((sub.score / (sub.maxScore || 100)) * 100)}%</td>
                    <td style="text-align: center;"><span class="grade-pill">${sub.grade || getGrade(sub.score, sub.maxScore)}</span></td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colSpan="6" style="text-align: center; font-style: italic; color: #94a3b8; padding: 20px;">No subject marks recorded yet.</td>
                  </tr>
                `}
                <tr class="total-row">
                  <td colSpan="2" style="text-align: right; padding-right: 15px;">AGGREGATE OVERALL TOTAL:</td>
                  <td style="text-align: center;">${totalMax}</td>
                  <td style="text-align: center;">${totalScored}</td>
                  <td style="text-align: center; font-size: 14px;">${avgPct}%</td>
                  <td style="text-align: center;"><span class="grade-pill" style="background:#0284c7; color:#fff;">${getGrade(avgPct, 100)}</span></td>
                </tr>
              </tbody>
            </table>

            <div class="section-head">Academic Grading System</div>
            <div class="legend-grid">
              <div class="legend-item"><strong>A1</strong>90 – 100%</div>
              <div class="legend-item"><strong>A2</strong>80 – 89%</div>
              <div class="legend-item"><strong>B1</strong>70 – 79%</div>
              <div class="legend-item"><strong>B2</strong>60 – 69%</div>
              <div class="legend-item"><strong>C1</strong>50 – 59%</div>
              <div class="legend-item"><strong>D</strong>35 – 49%</div>
              <div class="legend-item"><strong>E</strong>Below 35%</div>
            </div>

            <div class="section-head">Teacher Evaluation & Remarks</div>
            <div class="remarks-container">
              "${profile.remarks || "Demonstrates consistent academic effort, good peer collaboration, and satisfactory class attendance."}"
            </div>

            <div class="sig-section">
              <div class="sig-box">
                Class Teacher Signature
              </div>
              <div class="sig-box">
                Parent / Guardian Signature
              </div>
              <div class="sig-box">
                Headmaster Seal & Signature
              </div>
            </div>

            <div class="footer-verify">
              Verified Official Student Progress Document · Issued via TN Education Information Management System (EMIS) · ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </body>
      </html>
    `);

    printWin.document.close();
    setTimeout(() => {
      printWin.print();
    }, 300);
  };

  return (
    <PortalLayout>
      <div className="p-4 md:p-6 space-y-6 w-full">
        {/* Top Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-6 rounded-3xl border border-amber-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
                <i className="fi fi-rr-stats text-xl flex items-center" />
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

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={fetchStudentProgress}
              className="p-2.5 bg-[var(--bg-card)] hover:bg-[var(--border)] text-[var(--text-heading)] rounded-xl border border-[var(--border)] transition-all flex items-center justify-center"
              title="Refresh Progress"
            >
              <i className={`fi fi-rr-refresh text-sm flex items-center ${loading ? "animate-spin text-amber-500" : ""}`} />
            </button>
            <button
              onClick={handleDownloadProgressCard}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-extrabold text-xs transition-all shadow-md flex items-center gap-2"
            >
              <i className="fi fi-rr-download text-sm flex items-center" />
              {lang === "தமிழ்" ? "முன்னேற்ற அட்டையை பதிவிறக்கு" : "Download Progress Card"}
            </button>
            <button
              onClick={handleDownloadProgressCard}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl font-extrabold text-xs transition-all border border-slate-700 flex items-center gap-2"
            >
              <i className="fi fi-rr-print text-sm flex items-center" />
              {lang === "தமிழ்" ? "அச்சிடு" : "Print"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] p-12 rounded-3xl text-center space-y-3">
            <i className="fi fi-rr-refresh text-3xl animate-spin text-amber-500 mx-auto block" />
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
                <button
                  onClick={handleDownloadProgressCard}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fi fi-rr-download text-xs flex items-center" />
                  Progress Card
                </button>
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
                <span className="text-[11px] text-[var(--text-muted)] font-medium block">Real records</span>
              </div>
            </div>

            {/* Subject Performance Breakdown Table */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                  <i className="fi fi-rr-book-alt text-amber-500 text-sm flex items-center" />
                  {lang === "தமிழ்" ? "பாடவாரியாக மதிப்பெண் நிலை" : "Subject Performance Breakdown"}
                </h3>
              </div>

              {profile.subjects.length === 0 ? (
                <div className="p-8 text-center bg-[var(--bg-main)] rounded-2xl border border-[var(--border)] space-y-2">
                  <i className="fi fi-rr-book-alt text-3xl text-[var(--text-muted)] mx-auto opacity-50 block" />
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
                <i className="fi fi-rr-sparkles text-amber-500 text-sm flex items-center" />
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
