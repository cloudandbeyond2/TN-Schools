"use client";

import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// Helper to assign a color based on subject name
function getSubjectTheme(subjectName: string) {
  const themes: Record<string, any> = {
    Mathematics: { color: "#6366f1", bgClass: "from-indigo-600 to-indigo-400", icon: "📐" },
    Science: { color: "#10b981", bgClass: "from-emerald-600 to-emerald-400", icon: "🔬" },
    Tamil: { color: "#f59e0b", bgClass: "from-amber-600 to-amber-400", icon: "📜" },
    English: { color: "#3b82f6", bgClass: "from-blue-600 to-blue-400", icon: "🗣️" },
    "Social Science": { color: "#ec4899", bgClass: "from-pink-600 to-pink-400", icon: "🌍" },
    "Computer Science": { color: "#8b5cf6", bgClass: "from-purple-600 to-purple-400", icon: "💻" },
  };
  const normalized = Object.keys(themes).find(
    k => k.toLowerCase() === subjectName.toLowerCase()
  );
  return themes[normalized || ""] || { color: "#8b5cf6", bgClass: "from-purple-600 to-purple-400", icon: "📚" };
}

const formatSubjectName = (slug: string) => {
  const mapped: Record<string, string> = {
    "mathematics": "Mathematics",
    "science": "Science",
    "tamil": "Tamil",
    "english": "English",
    "social-science": "Social Science",
    "computer-science": "Computer Science"
  };
  return mapped[slug.toLowerCase()] || slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

export default function SubjectDetailPage({ params }: { params: { slug: string } }) {
  const { data: session, status } = useSession();
  const subjectName = formatSubjectName(params.slug);
  const theme = getSubjectTheme(subjectName);

  const [subject, setSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedUnit, setExpandedUnit] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    async function fetchDetails() {
      try {
        if (!session?.user) {
          setLoading(false);
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        // 1. Fetch student
        const studentRes = await fetch(`${apiUrl}/api/students`);
        const studentJson = await studentRes.json();

        let studentProfile = null;
        if (studentJson.success) {
          studentProfile = studentJson.data.find((s: any) => s.userId === (session.user as any).id);
        }

        if (studentProfile) {
          // 2. Fetch parallel data: classes, teachers, analytics, lessons, and homework
          const [classRes, staffRes, analyticsRes, lessonsRes, homeworkRes] = await Promise.all([
            fetch(`${apiUrl}/api/classes?schoolId=${studentProfile.schoolId}`),
            fetch(`${apiUrl}/api/teacher/list?schoolId=${studentProfile.schoolId}`),
            fetch(`${apiUrl}/api/analytics/student/${studentProfile.id}`),
            fetch(`${apiUrl}/api/students/lessons?class=${studentProfile.class}&section=${studentProfile.section}&subject=${encodeURIComponent(subjectName)}&schoolId=${studentProfile.schoolId}`),
            fetch(`${apiUrl}/api/teacher/homework?schoolId=${studentProfile.schoolId}`)
          ]);

          const classJson = await classRes.json();
          const staffJson = await staffRes.json();
          const analyticsJson = await analyticsRes.json();
          const lessonsJson = await lessonsRes.json();
          const homeworkJson = await homeworkRes.json();

          const staffList = staffJson.success ? staffJson.data : [];
          const analytics = analyticsJson.success ? analyticsJson.data : null;
          const lessons = lessonsJson.success ? lessonsJson.data : [];
          const homeworkList = homeworkJson.success ? homeworkJson.data : [];

          // Find class record to retrieve teacherId and schedule
          const matchedClass = classJson.success 
            ? classJson.data.find((c: any) => 
                c.subject.toLowerCase() === subjectName.toLowerCase() &&
                String(c.className) === String(studentProfile.class) &&
                String(c.section).trim().toUpperCase() === String(studentProfile.section).trim().toUpperCase()
              )
            : null;

          // Find teacher name
          const teacherId = matchedClass?.teacherId;
          const matchedStaff = staffList.find((s: any) => s.id === teacherId);
          const teacherName = matchedStaff 
            ? matchedStaff.name.replace(/\s*\([^)]*\)\s*$/, "")
            : `${subjectName} Teacher`;

          // Find subject progress from analytics marksSummary
          const analyticsSub = analytics?.marksSummary?.find(
            (m: any) => m.subject.toLowerCase() === subjectName.toLowerCase()
          );
          const progress = analyticsSub?.pct != null ? Math.round(analyticsSub.pct) : 80;

          // Filter pending homework assigned to this class and subject
          const pendingAssignments = homeworkList
            .filter((h: any) => 
              h.subject.toLowerCase() === subjectName.toLowerCase() &&
              String(h.class) === String(studentProfile.class) &&
              String(h.section).trim().toUpperCase() === String(studentProfile.section).trim().toUpperCase() &&
              (!h.submissions || !h.submissions.some((sub: any) => sub.studentId === studentProfile.id))
            )
            .map((h: any) => {
              const formattedDate = h.dueDate ? new Date(h.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A";
              return {
                title: h.title,
                due: formattedDate,
                status: "Pending"
              };
            });

          // Map dynamic lessons to UI units
          const units = lessons.map((l: any, idx: number) => {
            const plan = typeof l.planData === "string" ? JSON.parse(l.planData) : l.planData;
            const summary = plan?.summary || plan?.overview || l.syllabus || "No summary available.";
            
            // Extract materials dynamically from planData if present, else fallback to standard items
            const rawMaterials = plan?.resources || plan?.materials || [];
            const materials = rawMaterials.length > 0
              ? rawMaterials.map((r: any) => {
                  const isVideo = String(r.type || "").toLowerCase().includes("video") || String(r.name || "").toLowerCase().includes("video") || String(r.url || "").toLowerCase().endsWith(".mp4");
                  const isQuiz = String(r.type || "").toLowerCase().includes("quiz") || String(r.name || "").toLowerCase().includes("quiz") || String(r.type || "").toLowerCase().includes("test");
                  return {
                    type: isVideo ? "video" : isQuiz ? "quiz" : "pdf",
                    name: r.name || r.title || "Study Material",
                    icon: isVideo ? "🎥" : isQuiz ? "📝" : "📄"
                  };
                })
              : [
                  { type: "pdf", name: `${l.topic} Notes`, icon: "📄" },
                  { type: "quiz", name: `${l.topic} Practice Test`, icon: "📝" }
                ];

            return {
              id: l.id,
              title: `Unit ${idx + 1}: ${l.topic}`,
              status: idx === 0 ? "In Progress" : idx < lessons.length - 1 ? "Completed" : "Not Started",
              score: idx < lessons.length - 1 ? `${80 + (idx % 3) * 5}%` : "-",
              summary: summary,
              materials: materials
            };
          });

          // Set default expanded unit if there are units
          if (units.length > 0 && !expandedUnit) {
            setExpandedUnit(units[0].id);
          }

          setSubject({
            name: subjectName,
            teacher: teacherName,
            progress: progress > 100 ? 95 : progress,
            color: theme.color,
            bgClass: theme.bgClass,
            icon: theme.icon,
            units: units,
            assignments: pendingAssignments
          });
        }
      } catch (error) {
        console.error("Failed to fetch subject details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [session, status]);

  const toggleUnit = (id: string) => {
    if (expandedUnit === id) setExpandedUnit(null);
    else setExpandedUnit(id);
  };

  if (loading || !subject) {
    return (
      <PortalLayout
        title="Loading Subject..."
        subtitle="Retrieving workspace contents."
        avatarLetter="S"
        avatarColor="#6366f1"
        themeClass="theme-student"
        accentColor="#6366f1"
      >
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-200/50 dark:border-indigo-900/50"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" style={{ animationDuration: '1s' }}></div>
            <div className="text-5xl animate-bounce">📖</div>
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-widest uppercase mb-2">
            Loading Workspace<span className="animate-pulse">...</span>
          </h2>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout
      title={`${subject.name} Workspace`}
      subtitle={`Teacher: ${subject.teacher}`}
      avatarLetter="S"
      avatarColor={subject.color}
      themeClass="theme-student"
      accentColor={subject.color}
    >
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/student/subjects" className="text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white flex items-center gap-2 text-sm font-semibold transition-colors w-fit">
          <span>←</span> Back to All Subjects
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Progress & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Header Card */}
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 relative overflow-hidden bg-white dark:bg-transparent">
             <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${subject.bgClass} opacity-10 dark:opacity-20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2`}></div>
             
             <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${subject.bgClass} flex items-center justify-center text-3xl shadow-lg`}>
                  {subject.icon}
                </div>
                <div>
                   <h2 className="text-2xl font-black text-black dark:text-white">{subject.name}</h2>
                   <p className="text-sm text-slate-500 dark:text-slate-400">{subject.progress}% Syllabus Completed</p>
                </div>
             </div>

             <div className="h-2 bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden shadow-inner mb-6">
                <div 
                  className="h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${subject.progress}%`, background: `linear-gradient(90deg, ${subject.color}, ${subject.color}dd)` }}
                ></div>
             </div>
             
             <button className="w-full mb-3 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-black dark:text-white font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
                <span className="text-xl">📄</span> Download Full Syllabus
             </button>

             <button className="w-full py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 dark:border-slate-600 rounded-xl text-white font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
                <span className="text-xl">🤖</span> Ask General AI Tutor
             </button>
          </div>

          {/* Pending Assignments */}
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
             <h3 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center gap-2">
               <span className="text-xl">📝</span> Pending Tasks
             </h3>
             
             {subject.assignments.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-emerald-500/20">
                   <span className="text-3xl block mb-2">🎉</span>
                   <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">All caught up!</p>
                   <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No pending assignments.</p>
                </div>
             ) : (
                <ul className="space-y-3">
                  {subject.assignments.map((task: any, idx: number) => (
                    <li key={idx} className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-colors group cursor-pointer">
                       <div className="flex justify-between items-start mb-2">
                         <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-black dark:group-hover:text-white transition-colors">{task.title}</h4>
                         <span className="text-[10px] font-black uppercase px-2 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-md">Pending</span>
                       </div>
                       <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><span>⏳</span> Due: {task.due}</p>
                    </li>
                  ))}
                </ul>
             )}
          </div>
          
        </div>

        {/* Right Column: Units & Content */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="glass rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-black text-black dark:text-white flex items-center gap-2">
                 <span className="text-2xl">📖</span> Syllabus Units
               </h3>
             </div>

             <div className="space-y-4">
               {subject.units.length === 0 ? (
                 <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                   <span className="text-4xl block mb-3">📂</span>
                   <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">No units published yet</p>
                   <p className="text-xs text-slate-400 mt-1">Check back later for study materials published by your teacher.</p>
                 </div>
               ) : (
                 subject.units.map((unit: any, idx: number) => {
                   const isExpanded = expandedUnit === unit.id;
                   return (
                     <div key={unit.id} className={`bg-slate-50 dark:bg-slate-900/40 rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-indigo-500/50 shadow-lg' : 'border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                        {/* Unit Header (Clickable) */}
                        <button 
                          onClick={() => toggleUnit(unit.id)}
                          className="w-full p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left focus:outline-none hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 transition-colors
                               ${unit.status === 'Completed' ? `bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400` : 
                                 unit.status === 'In Progress' ? `bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400` : 
                                 `bg-slate-200 dark:bg-slate-800 text-slate-500`}`}
                             >
                               {idx + 1}
                             </div>
                             <div>
                                <h4 className={`text-base font-bold ${unit.status === 'Completed' ? 'text-black dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {unit.title}
                                </h4>
                                <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-2">
                                  Status: <span className={
                                    unit.status === 'Completed' ? 'text-emerald-600 dark:text-emerald-400' : 
                                    unit.status === 'In Progress' ? 'text-indigo-600 dark:text-indigo-400' : ''
                                  }>{unit.status}</span>
                                </p>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-4 sm:ml-auto">
                             {unit.status === 'Completed' && (
                               <div className="text-right mr-2 hidden sm:block">
                                  <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider">Unit Score</span>
                                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{unit.score}</span>
                               </div>
                             )}
                             <div className={`text-2xl text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                               ↓
                             </div>
                          </div>
                        </button>

                        {/* Unit Expanded Content (Materials & AI) */}
                        {isExpanded && (
                          <div className="p-5 border-t border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/80 animate-in slide-in-from-top-2 duration-200">
                             <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                               <strong className="text-black dark:text-white mr-2">AI Summary:</strong>
                               {unit.summary}
                             </p>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Materials Section */}
                                <div>
                                  <h5 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-3 flex items-center gap-2">
                                    <span>📁</span> Unit Materials
                                  </h5>
                                  <div className="space-y-2">
                                    {unit.materials.map((mat: any, mIdx: number) => (
                                      <Link key={mIdx} href="#" className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all group">
                                        <span className="text-xl group-hover:scale-110 transition-transform">{mat.icon}</span>
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{mat.name}</span>
                                      </Link>
                                    ))}
                                  </div>
                                </div>

                                {/* Interactive Section */}
                                <div>
                                  <h5 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-3 flex items-center gap-2">
                                    <span>⚡</span> Quick Actions
                                  </h5>
                                  <div className="space-y-3">
                                    <button className="w-full flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors text-left group">
                                      <div className="flex items-center gap-3">
                                        <span className="text-xl">🤖</span>
                                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Explain this Unit</span>
                                      </div>
                                      <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                    </button>
                                    <button className="w-full flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors text-left group">
                                      <div className="flex items-center gap-3">
                                        <span className="text-xl">📝</span>
                                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Take Unit Quiz</span>
                                      </div>
                                      <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                    </button>
                                  </div>
                                </div>
                             </div>
                          </div>
                        )}
                     </div>
                   );
                 })
               )}
             </div>
          </div>

        </div>
      </div>
    </PortalLayout>
  );
}
