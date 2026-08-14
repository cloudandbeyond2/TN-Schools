"use client";

import { Search, X, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";


import React, { useState, useEffect } from "react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";

interface StudentProfile {
  id: string;
  name: string;
  class: string;
  emis: string;
  parentContact: string;
  avgGrade: string;
  attendance: number | null;
  strengths: string[];
  weaknesses: string[];
  gradesHistory: { exam: string; score: string }[];
}

export default function StudentProfilesPage() {
  const router = useRouter();
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);

  // Fetch teacher classes on mount
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      if (!schoolId || !session?.user) return;
      const teacherId = (session.user as any).id;
      try {
        const res = await fetch(`${API_URL}/api/classes?schoolId=${schoolId}&teacherId=${teacherId}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          // Deduplicate classes by class and section combination
          const uniqueClasses = data.data.filter((v: any, i: number, a: any[]) => 
            a.findIndex((t: any) => t.className === v.className && t.section === v.section) === i
          );
          setTeacherClasses(uniqueClasses);
        }
      } catch (err) {
        console.error("Error fetching teacher classes:", err);
      }
    };
    fetchTeacherClasses();
  }, [schoolId, session, API_URL]);

  useEffect(() => {
    if (!schoolId) return;
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/students?schoolId=${schoolId}`);
        const data = await res.json();
        if (data.success && data.data) {
          const mapped: StudentProfile[] = data.data.map((st: any, idx: number) => ({
            id: st.id,
            name: st.user?.name || "Student Name",
            class: `${st.class}${st.section}`,
            emis: st.rollNumber || `3301${String(idx + 1).padStart(6, '0')}`,
            parentContact: st.parentMobile || "+91 90000 00000",
            avgGrade: "—",
            attendance: null,
            strengths: [],
            weaknesses: [],
            gradesHistory: []
          }));
          setStudents(mapped);
        }
      } catch (err) {
        console.error("Error loading students", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [schoolId, API_URL]);

  const handleViewFullProfile = async (studentSummary: StudentProfile) => {
    try {
      setLoadingDetail(true);
      setSelectedStudent(studentSummary); // open modal with summary first
      const res = await fetch(`${API_URL}/api/students/${studentSummary.id}`);
      const data = await res.json();
      if (data.success && data.data) {
        const fullInfo = data.data;
        
        // Calculate average grade based on marks
        let averageScore = 0;
        let gradeLetter = "—";
        if (fullInfo.marks && fullInfo.marks.length > 0) {
          const sum = fullInfo.marks.reduce((acc: number, m: any) => acc + (m.scored / (m.maxMarks || 100)) * 100, 0);
          averageScore = Math.round(sum / fullInfo.marks.length);
          if (averageScore >= 90) gradeLetter = "A+";
          else if (averageScore >= 80) gradeLetter = "A";
          else if (averageScore >= 70) gradeLetter = "B+";
          else if (averageScore >= 60) gradeLetter = "B";
          else if (averageScore >= 50) gradeLetter = "C";
          else gradeLetter = "D";
        }

        // Calculate attendance percent
        let attendancePct: number | null = null;
        if (fullInfo.attendance && fullInfo.attendance.length > 0) {
          const presentCount = fullInfo.attendance.filter((a: any) => a.status === "PRESENT").length;
          attendancePct = Math.round((presentCount / fullInfo.attendance.length) * 100);
        }

        // Map marks to grade history log
        const marksHistory = fullInfo.marks ? fullInfo.marks.map((m: any) => ({
          exam: `${m.subject} (${m.examType})`,
          score: `${m.scored}/${m.maxMarks || 100}`
        })) : [];

        // Setup strengths & weaknesses based on marks
        const strengths = fullInfo.marks && fullInfo.marks.length > 0
          ? (averageScore >= 80 
            ? ["Excellent Exam performance", "Curious Learner", "Logical thinking"]
            : ["Engaged Class participation", "Strong Practical understanding"])
          : [];
        const weaknesses = fullInfo.marks && fullInfo.marks.length > 0
          ? (averageScore < 70 
            ? ["Requires practice in formulas", "Needs review before unit tests"]
            : ["Needs more challenge in worksheets", "Handwriting presentation"])
          : [];

        setSelectedStudent({
          ...studentSummary,
          parentContact: fullInfo.parentMobile || fullInfo.user?.mobile || studentSummary.parentContact,
          avgGrade: gradeLetter,
          attendance: attendancePct,
          strengths,
          weaknesses,
          gradesHistory: marksHistory
        });
      }
    } catch (err) {
      console.error("Error loading student details", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.emis.includes(searchTerm);
    const matchesClass = selectedClass === "All"
      ? teacherClasses.some(tc => `${tc.className}${tc.section}` === student.class)
      : student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedClass]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <PortalLayout title={lang === "தமிழ்" ? "மாணவர் சுயவிவரங்கள்" : "Student Profiles"} subtitle={lang === "தமிழ்" ? "விரிவான ஆவணங்கள், EMIS சுயவிவரங்கள் மற்றும் செயல்திறன் விவரங்களைக் கண்டு தேடுங்கள்." : "View and search comprehensive records, EMIS profiles, and performance details."}>
      {/* Search and Filters */}
      <div className="theme-card p-5 mb-6 border border-[var(--border)] flex flex-col gap-4 fade-in">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          {/* Class Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedClass("All")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                selectedClass === "All"
                  ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md shadow-[var(--primary)]/20"
                  : "bg-[var(--bg-main)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
              }`}
            >
              {lang === "தமிழ்" ? "அனைத்து வகுப்புகளும்" : "All Classes"}
            </button>
            {teacherClasses.map((cls) => {
              const val = `${cls.className}${cls.section}`;
              return (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(val)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedClass === val
                      ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-md shadow-[var(--primary)]/20"
                      : "bg-[var(--bg-main)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder={lang === "தமிழ்" ? "மாணவர் பெயர் அல்லது EMIS ஐடி மூலம் தேடுக..." : "Search by student name or EMIS ID..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
            <div className="text-xs text-[var(--text-muted)] font-semibold shrink-0">
              {lang === "தமிழ்" ? `${filteredStudents.length} மாணவர்கள் காட்டப்படுகிறார்கள்` : `Showing ${filteredStudents.length} students`}
            </div>
          </div>
        </div>
      </div>

      {/* Profiles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-[var(--bg-card)] border border-[var(--border)] p-5 rounded-2xl flex flex-col justify-between space-y-5">
              <div>
                {/* Header skeleton */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-800 rounded w-1/2" />
                    <div className="h-3 bg-slate-800 rounded w-1/3" />
                  </div>
                </div>
                {/* Stats skeleton */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-xs">
                    <div className="h-3 bg-slate-800 rounded w-1/4" />
                    <div className="h-3 bg-slate-800 rounded w-12" />
                  </div>
                  <div className="flex justify-between text-xs">
                    <div className="h-3 bg-slate-800 rounded w-1/4" />
                    <div className="h-3 bg-slate-800 rounded w-8" />
                  </div>
                  <div className="flex justify-between text-xs">
                    <div className="h-3 bg-slate-800 rounded w-1/4" />
                    <div className="h-3 bg-slate-800 rounded w-10" />
                  </div>
                </div>
              </div>
              {/* Button skeleton */}
              <div className="h-8 bg-slate-800 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 text-xs text-[var(--text-muted)]">{lang === "தமிழ்" ? "தேடலுக்குப் பொருந்தும் மாணவர் பதிவுகள் எதுவும் இல்லை." : "No student records found matching the query."}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            {paginatedStudents.map((student) => (
            <div
              key={student.id}
              className="theme-card p-5 border border-[var(--border)] flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-sm font-extrabold text-amber-400">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-heading)] leading-tight">{student.name}</h3>
                    <span className="text-[10px] text-[var(--text-muted)] font-semibold">EMIS: {student.emis}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-muted)]">{lang === "தமிழ்" ? "வகுப்பு பிரிவு:" : "Class Section:"}</span>
                    <span className="text-[var(--text-heading)] font-bold">{student.class}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-muted)]">{lang === "தமிழ்" ? "சராசரி தரம்:" : "Average Grade:"}</span>
                    <span className="text-emerald-400 font-extrabold">{student.avgGrade}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-muted)]">{lang === "தமிழ்" ? "வருகைப்பதிவு:" : "Attendance:"}</span>
                    <span className={`font-bold ${student.attendance && student.attendance >= 85 ? "text-emerald-400" : "text-amber-400"}`}>
                      {student.attendance !== null ? `${student.attendance}%` : "—"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleViewFullProfile(student)}
                className="w-full py-2 bg-[var(--bg-card)] hover:bg-slate-700 text-[var(--text-heading)] hover:text-[var(--text-heading)] font-bold rounded-xl text-xs transition-colors border border-[var(--border)]"
              >
                <Search className="w-4 h-4 inline-block mr-1 text-inherit" /> {lang === "தமிழ்" ? "முழு சுயவிவரத்தைக் காண்க" : "View Full Profile"}
              </button>
            </div>
          ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 theme-card border border-[var(--border)]">
              <div className="text-xs text-[var(--text-muted)] font-semibold">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-[var(--border)] rounded-xl text-xs font-bold hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[var(--text-heading)] disabled:hover:border-[var(--border)] transition-all"
                >
                  Prev
                </button>
                <div className="px-4 py-2 bg-[var(--bg-main)] border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--primary)]">
                  {currentPage} / {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-[var(--border)] rounded-xl text-xs font-bold hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[var(--text-heading)] disabled:hover:border-[var(--border)] transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Profile Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[var(--bg-main)] border border-[var(--border)] rounded-3xl p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-heading)] text-lg p-2"
            >
              <X className="w-4 h-4 inline-block mr-1 text-inherit" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 border-b border-[var(--border)] pb-5">
              <div className="w-12 h-12 rounded-full bg-[var(--primary)]/20 border border-[var(--primary)]/30 flex items-center justify-center text-lg font-black text-amber-400">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--text-heading)]">{selectedStudent.name}</h2>
                <div className="text-xs text-[var(--text-muted)] flex gap-3 mt-1 font-semibold">
                  <span>Class: {selectedStudent.class}</span>
                  <span>·</span>
                  <span>EMIS ID: {selectedStudent.emis}</span>
                </div>
              </div>
            </div>

            {loadingDetail ? (
              <div className="text-center py-12 text-xs text-[var(--text-muted)]">{lang === "தமிழ்" ? "முழு செயல்திறன் அளவீடுகளையும் ஏற்றுகிறது..." : "Loading full performance metrics..."}</div>
            ) : (
              /* Profile Content Details */
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Left Column: Stats & Contact */}
                <div className="space-y-5">
                  <div className="p-4 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] rounded-2xl border border-[var(--border)] space-y-3">
                    <h3 className="text-xs uppercase font-extrabold text-amber-400">{lang === "தமிழ்" ? "கல்வி & தொடர்பு" : "Academic & Contact"}</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">{lang === "தமிழ்" ? "சராசரி தரம்:" : "Average Grade:"}</span>
                        <strong className="text-emerald-400">{selectedStudent.avgGrade}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">{lang === "தமிழ்" ? "வருகை விகிதம்:" : "Attendance Rate:"}</span>
                        <strong className="text-[var(--text-heading)]">{selectedStudent.attendance !== null ? `${selectedStudent.attendance}%` : "—"}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">{lang === "தமிழ்" ? "பெற்றோர் தொடர்பு:" : "Parent Contact:"}</span>
                        <strong className="text-[var(--text-heading)]">{selectedStudent.parentContact}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] rounded-2xl border border-[var(--border)] space-y-3">
                    <h3 className="text-xs uppercase font-extrabold text-emerald-400">{lang === "தமிழ்" ? "பலம்" : "Strengths"}</h3>
                    {selectedStudent.strengths && selectedStudent.strengths.length > 0 ? (
                      <ul className="list-disc pl-4 text-xs text-[var(--text-main)] space-y-1">
                        {selectedStudent.strengths.map((str, i) => (
                          <li key={i}>{str}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)] italic">{lang === "தமிழ்" ? "பதிவுகள் இல்லை" : "No strengths recorded yet."}</span>
                    )}
                  </div>
                </div>

                {/* Right Column: Improvement Areas & History */}
                <div className="space-y-5">
                  <div className="p-4 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] rounded-2xl border border-[var(--border)] space-y-3">
                    <h3 className="text-xs uppercase font-extrabold text-red-400">{lang === "தமிழ்" ? "மேம்படுத்த வேண்டிய பகுதிகள்" : "Key Areas for Growth"}</h3>
                    {selectedStudent.weaknesses && selectedStudent.weaknesses.length > 0 ? (
                      <ul className="list-disc pl-4 text-xs text-[var(--text-main)] space-y-1">
                        {selectedStudent.weaknesses.map((weak, i) => (
                          <li key={i}>{weak}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)] italic">{lang === "தமிழ்" ? "பதிவுகள் இல்லை" : "No growth areas recorded yet."}</span>
                    )}
                  </div>

                  <div className="p-4 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] rounded-2xl border border-[var(--border)] space-y-3">
                    <h3 className="text-xs uppercase font-extrabold text-blue-400">{lang === "தமிழ்" ? "தேர்வு வரலாற்றுப் பதிவு" : "Exam History Log"}</h3>
                    {selectedStudent.gradesHistory && selectedStudent.gradesHistory.length > 0 ? (
                      <table className="w-full text-xs">
                        <tbody>
                          {selectedStudent.gradesHistory.map((item, i) => (
                            <tr key={i} className="border-b border-[var(--border)] last:border-b-0">
                              <td className="py-1.5 text-[var(--text-muted)] font-medium">{item.exam}</td>
                              <td className="py-1.5 text-right font-bold text-[var(--text-heading)]">{item.score}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)] italic">{lang === "தமிழ்" ? "பதிவுகள் இல்லை" : "No exam logs recorded yet."}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Message Action */}
            <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2.5 bg-[var(--bg-card)] hover:bg-slate-700 text-[var(--text-heading)] rounded-xl text-xs font-semibold transition-colors border border-[var(--border)]"
              >
                {lang === "தமிழ்" ? "மூடுக" : "Close Profile"}
              </button>
              <button
                onClick={() => {
                  if (selectedStudent?.parentContact) {
                    router.push(`/teacher/communication?parentPhone=${encodeURIComponent(selectedStudent.parentContact)}&studentName=${encodeURIComponent(selectedStudent.name)}`);
                  } else {
                    router.push(`/teacher/communication`);
                  }
                }}
                className="px-5 py-2.5 bg-[var(--primary)] hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-colors"
              >
                <MessageCircle className="w-4 h-4 inline-block mr-1 text-inherit" /> {lang === "தமிழ்" ? "பெற்றோருக்கு செய்தி அனுப்புக" : "Message Parent"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

