"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import { TrendingUp, Award, Microscope, ClipboardEdit, MessageSquare, Star, Trophy } from "lucide-react";

interface RosterStudent {
  id: string;
  name: string;
  class: string;
  engagement: "High" | "Medium" | "Low";
  badges: string[];
}

interface StudentBadge {
  id: string;
  studentId: string;
  studentName: string;
  classSection: string;
  badge: string;
  remark: string | null;
}

export default function StudentStatusPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [students, setStudents] = useState<RosterStudent[]>([]);
  const [rawStudents, setRawStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Award badge state
  const [targetStudentId, setTargetStudentId] = useState("");
  const [selectedBadge, setSelectedBadge] = useState(" Star Scientist");
  const [customComment, setCustomComment] = useState("");
  const [awardNotification, setAwardNotification] = useState<string | null>(null);

  const availableBadges = [
    { label: "Star Scientist", desc: "Awarded for exceptional scientific work", icon: <Microscope className="w-4 h-4 inline mr-2 text-blue-500" /> },
    { label: "Homework Pro", desc: "Awarded for 100% homework submission", icon: <ClipboardEdit className="w-4 h-4 inline mr-2 text-green-500" /> },
    { label: "Active Speaker", desc: "Awarded for healthy class discussions", icon: <MessageSquare className="w-4 h-4 inline mr-2 text-orange-500" /> },
    { label: "Mentor Star", desc: "Awarded for helping peers in studies", icon: <Star className="w-4 h-4 inline mr-2 text-amber-500" /> },
  ];

  const fetchData = async () => {
    if (!schoolId || !session?.user) return;
    const teacherId = (session.user as any).id;
    try {
      setLoading(true);
      
      // 1. Fetch teacher classes
      const classesRes = await fetch(`${API_URL}/api/classes?schoolId=${schoolId}&teacherId=${teacherId}`);
      const classesData = await classesRes.json();
      let activeClasses: any[] = [];
      if (classesData.success && Array.isArray(classesData.data)) {
        setTeacherClasses(classesData.data);
        activeClasses = classesData.data;
      }

      if (activeClasses.length === 0) {
        setStudents([]);
        setRawStudents([]);
        setTargetStudentId("");
        setLoading(false);
        return;
      }

      // 2. Fetch students
      const studentsRes = await fetch(`${API_URL}/api/students?schoolId=${schoolId}`);
      const studentsData = await studentsRes.json();

      // 3. Fetch badges
      const badgesRes = await fetch(`${API_URL}/api/teacher/badges?schoolId=${schoolId}`);
      const badgesData = await badgesRes.json();

      if (studentsData.success && studentsData.data) {
        const filteredStudents = studentsData.data.filter((s: any) =>
          activeClasses.some(tc => tc.className === s.class && tc.section === s.section)
        );
        setRawStudents(filteredStudents);
        
        const badgesList: StudentBadge[] = badgesData.success ? badgesData.data : [];

        const mappedRoster: RosterStudent[] = filteredStudents.map((st: any, idx: number) => {
          // Filter badges for this student
          const studentBadges = badgesList
            .filter((b) => b.studentId === st.id)
            .map((b) => b.badge);

          // engagement derived from index/mock logic or attendance
          const attendanceVal = 90 - (idx % 12);
          let eng: RosterStudent["engagement"] = "Medium";
          if (attendanceVal >= 88) eng = "High";
          else if (attendanceVal < 82) eng = "Low";

          return {
            id: st.id,
            name: st.user?.name || "Student Name",
            class: `${st.class}${st.section}`,
            engagement: eng,
            badges: studentBadges,
          };
        });

        setStudents(mappedRoster);
        if (mappedRoster.length > 0) {
          setTargetStudentId(mappedRoster[0].id);
        } else {
          setTargetStudentId("");
        }
      }
    } catch (err) {
      console.error("Error loading status data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [schoolId, API_URL, session]);

  const handleAwardBadge = async () => {
    const studentObj = students.find((s) => s.id === targetStudentId);
    if (!studentObj) return;

    // Check if student already has this badge in UI
    if (studentObj.badges.includes(selectedBadge)) {
      Swal.fire({
        icon: "warning",
        title: "Already Awarded",
        text: `${studentObj.name} already has the "${selectedBadge}" badge.`,
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/teacher/badges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: targetStudentId,
          studentName: studentObj.name,
          classSection: studentObj.class,
          badge: selectedBadge,
          remark: customComment || "Great work!",
        }),
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Badge Awarded!",
          text: `Successfully awarded "${selectedBadge}" to ${studentObj.name}!`,
          timer: 2500,
          showConfirmButton: false,
        });
        
        // Refresh local data to reflect badge changes
        fetchData();
        setCustomComment("");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Failed to award badge.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error("Error awarding badge", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const totalPages = Math.ceil(students.length / itemsPerPage);
  const paginatedStudents = students.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <PortalLayout title="Student Status & Engagement" subtitle="Award virtual badges and monitor student classroom participation metrics.">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Engagement status board */}
        <div className="xl:col-span-2 theme-card p-6 border border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--text-heading)] mb-5 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-[var(--primary)]" /> Student Engagement & Badges Roster</h2>
          {loading ? (
            <div className="text-center py-12 text-xs text-[var(--text-muted)]">Loading student status roster...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-xs text-[var(--text-muted)]">No students found.</div>
          ) : (
            <>
              {/* Table view for Large Desktops */}
              <div className="hidden xl:block overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Class</th>
                      <th>Engagement</th>
                      <th>Badges Awarded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((student) => (
                      <tr key={student.id}>
                        <td className="font-medium text-[var(--text-heading)]">{student.name}</td>
                        <td>{student.class}</td>
                        <td>
                          <span
                            className={`badge ${
                              student.engagement === "High"
                                ? "badge-green"
                                : student.engagement === "Medium"
                                ? "badge-blue"
                                : "badge-red"
                            }`}
                          >
                            {student.engagement} Engagement
                          </span>
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                            {student.badges.length > 0 ? (
                              student.badges.map((badge, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-bold px-2 py-0.5 bg-[var(--primary)]/10 text-amber-400 border border-[var(--primary)]/20 rounded-lg shrink-0 whitespace-nowrap"
                                >
                                  <Award className="w-3 h-3 inline mr-1 opacity-70" /> {badge.trim()}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-[var(--text-muted)] italic">No badges awarded</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card view for Mobile, Tablet, Small Laptop */}
              <div className="xl:hidden grid grid-cols-1 gap-3">
                {paginatedStudents.map((student) => (
                  <div key={student.id} className="p-4 bg-[var(--bg-main)]/30 border border-[var(--border)] rounded-2xl flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-[var(--text-heading)] text-sm">{student.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Class: {student.class}</div>
                      </div>
                      <span
                        className={`badge shrink-0 ${
                          student.engagement === "High"
                            ? "badge-green"
                            : student.engagement === "Medium"
                            ? "badge-blue"
                            : "badge-red"
                        }`}
                      >
                        {student.engagement}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-1.5">Badges Awarded</span>
                      <div className="flex flex-wrap gap-1.5">
                        {student.badges.length > 0 ? (
                          student.badges.map((badge, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-bold px-2 py-0.5 bg-[var(--primary)]/10 text-amber-400 border border-[var(--primary)]/20 rounded-lg shrink-0 whitespace-nowrap"
                            >
                              <Award className="w-3 h-3 inline mr-1 opacity-70" /> {badge.trim()}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-[var(--text-muted)] italic">No badges awarded yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 theme-card border border-[var(--border)] rounded-2xl">
                  <div className="text-xs text-[var(--text-muted)] font-semibold">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, students.length)} of {students.length} entries
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
        </div>

        {/* Badge dispatch workspace */}
        <div className="theme-card p-6 border border-[var(--border)] space-y-5">
          <div>
            <h2 className="text-base font-semibold text-[var(--text-heading)] mb-1 flex items-center"><Award className="w-5 h-5 mr-2 text-amber-500" /> Award Virtual Badges</h2>
            <p className="text-xs text-[var(--text-muted)]">Reward student achievements. Awarded badges appear directly on the student portal.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">Select Student</label>
              <select
                value={targetStudentId}
                onChange={(e) => setTargetStudentId(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.class})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">Select Badge</label>
              <select
                value={selectedBadge}
                onChange={(e) => setSelectedBadge(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              >
                {availableBadges.map((b) => (
                  <option key={b.label} value={b.label}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">Custom Remark</label>
              <textarea
                value={customComment}
                onChange={(e) => setCustomComment(e.target.value)}
                rows={2}
                className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                placeholder="Write a warm note..."
              />
            </div>

            <button
              onClick={handleAwardBadge}
              className="w-full py-2.5 bg-[var(--primary)] hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
               Award & Dispatch Badge
            </button>
          </div>

          {awardNotification && (
            <div
              className={`p-3.5 rounded-xl text-xs leading-relaxed border ${
                awardNotification.startsWith("")
                  ? "bg-red-500/10 border-red-500/20 text-red-300"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              }`}
            >
              {awardNotification}
            </div>
          )}
        </div>
      </div>

      {/* Badge descriptions registry */}
      <div className="theme-card p-6 border border-[var(--border)]">
        <h2 className="text-base font-semibold text-[var(--text-heading)] mb-4"><Trophy className="w-4 h-4 inline mr-1 text-amber-500" /> Badge Directory definitions</h2>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {availableBadges.map((b, idx) => (
            <div key={idx} className="p-4 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-xl">
              <div className="text-lg font-bold text-[var(--text-heading)] mb-1.5">{b.label}</div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed font-normal">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}

