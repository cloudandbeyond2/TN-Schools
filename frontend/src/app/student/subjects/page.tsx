"use client";

import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// Helper to assign a color based on subject name
function getSubjectTheme(subjectName: string) {
  const themes: Record<string, any> = {
    Mathematics: { color: "#6366f1", gradient: "from-indigo-600 to-indigo-400", icon: "📐" },
    Science: { color: "#10b981", gradient: "from-emerald-600 to-emerald-400", icon: "🔬" },
    Tamil: { color: "#f59e0b", gradient: "from-amber-600 to-amber-400", icon: "📜" },
    English: { color: "#3b82f6", gradient: "from-blue-600 to-blue-400", icon: "🗣️" },
    "Social Science": { color: "#ec4899", gradient: "from-pink-600 to-pink-400", icon: "🌍" },
    "Computer Science": { color: "#8b5cf6", gradient: "from-purple-600 to-purple-400", icon: "💻" },
  };
  return themes[subjectName] || { color: "#64748b", gradient: "from-slate-600 to-slate-400", icon: "📚" };
}

export default function SubjectsPage() {
  const { data: session, status } = useSession();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    async function fetchSubjects() {
      try {
        if (!session?.user) {
          setLoading(false);
          return;
        }

        // 1. Fetch student to get class, section, schoolId
        const studentRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/students`);
        const studentJson = await studentRes.json();

        let studentProfile = null;
        if (studentJson.success) {
          studentProfile = studentJson.data.find((s: any) => s.userId === (session.user as any).id);
        }

        if (studentProfile) {
          // 2. Fetch classes for this school
          const classRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/classes?schoolId=${studentProfile.schoolId}`);
          const classJson = await classRes.json();

          if (classJson.success) {
            // 3. Filter classes that match student's class and section
            const studentClasses = classJson.data.filter((c: any) =>
              c.className === studentProfile.class &&
              c.section === studentProfile.section
            );

            // 4. Map to UI format with fallback mocked data for progress
            const mappedSubjects = studentClasses.map((c: any) => {
              const theme = getSubjectTheme(c.subject);
              // Generate some random looking but deterministic fake progress data based on subject length
              const progress = (c.subject.length * 7) % 100 + 10; // e.g. 50-90
              const assignments = c.subject.length % 3;

              return {
                id: c.id,
                name: c.subject,
                teacher: "Assigned Teacher", // We don't fetch teacher name in this simple query yet
                progress: progress > 100 ? 95 : progress,
                color: theme.color,
                gradient: theme.gradient,
                icon: theme.icon,
                nextClass: c.schedule || "Upcoming soon",
                assignments: assignments,
                chaptersCompleted: Math.floor(progress / 10),
                totalChapters: 10
              };
            });

            setSubjects(mappedSubjects);
          }
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSubjects();
  }, [session, status]);

  if (loading) {
    return (
      <PortalLayout
        title="My Subjects"
        subtitle="Track your syllabus progress and access learning materials."
        avatarLetter="A"
        avatarColor="#6366f1"
        themeClass="theme-student"
        accentColor="#6366f1"
      >
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-200/50 dark:border-indigo-900/50"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" style={{ animationDuration: '1s' }}></div>
            <div className="text-5xl animate-bounce">📚</div>
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-widest uppercase mb-2">
            Loading Subjects<span className="animate-pulse">...</span>
          </h2>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout
      title="My Subjects"
      subtitle="Track your syllabus progress and access learning materials."
      avatarLetter="A"
      avatarColor="#6366f1"
      themeClass="theme-student"
      accentColor="#6366f1"
    >
      {subjects.length === 0 ? (
        <div className="text-center p-12 glass rounded-3xl border border-slate-200 dark:border-slate-700">
          <p className="text-xl text-slate-500">No subjects found for your class. Please contact your school administrator.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {subjects.map((subject, index) => (
            <div key={index} className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-500/50 hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col h-full bg-white dark:bg-transparent">

              {/* Background Glow Effect */}
              <div
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40"
                style={{ backgroundColor: subject.color }}
              ></div>

              {/* Header */}
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subject.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                  {subject.icon}
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-black dark:text-white">{subject.progress}%</span>
                  <span className="block text-xs text-black dark:text-white font-medium uppercase tracking-wider">Completed</span>
                </div>
              </div>

              {/* Subject Info */}
              <div className="mb-6 relative z-10">
                <h2 className="text-xl font-bold text-black dark:text-white mb-1">{subject.name}</h2>
                <p className="text-sm text-black dark:text-white flex items-center gap-2">
                  <span>👨‍🏫</span> {subject.teacher}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6 relative z-10">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-black dark:text-white font-medium">Syllabus Progress</span>
                  <span className="text-black dark:text-white">{subject.chaptersCompleted} of {subject.totalChapters} Ch</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-1000 relative"
                    style={{ width: `${subject.progress}%`, background: `linear-gradient(90deg, ${subject.color}, ${subject.color}dd)` }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 w-6 bg-gradient-to-l from-white/30 to-transparent"></div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6 relative z-10 mt-auto">
                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700/50 flex flex-col justify-center">
                  <span className="text-xs text-black dark:text-white mb-1">Next Class</span>
                  <span className="text-sm font-semibold text-black dark:text-white truncate" title={subject.nextClass}>{subject.nextClass}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700/50 flex flex-col justify-center">
                  <span className="text-xs text-black dark:text-white mb-1">Pending Tasks</span>
                  <span className={`text-sm font-semibold ${subject.assignments > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {subject.assignments > 0 ? `${subject.assignments} Assignments` : 'All caught up!'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 relative z-10">
                <Link
                  href={`/student/subjects/${subject.name.toLowerCase().replace(" ", "-")}`}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all active:scale-95 text-center flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${subject.color}, ${subject.color}dd)` }}
                >
                  Go to Subject →
                </Link>
                <Link
                  href={`/student/ai-tutor?subject=${encodeURIComponent(subject.name)}&question=${encodeURIComponent(`Hi! Can you tutor me in ${subject.name}? I want to learn this subject.`)}`}
                  className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 transition-colors tooltip-trigger relative group/btn flex items-center justify-center cursor-pointer"
                >
                  🤖
                  <span className="absolute -top-10 right-0 md:left-1/2 md:-translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Ask AI Tutor
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}