// "use client";

// import PortalLayout from "@/components/PortalLayout";


// const projects = [
//   { title: "Solar System Model", subject: "Science", date: "Last Week", type: "Craft", grade: "Super Star! ⭐", icon: "🪐", color: "#10b981" },
//   { title: "My Favorite Animal Essay", subject: "English", date: "2 Weeks Ago", type: "Writing", grade: "Great Job! 👍", icon: "🐶", color: "#f59e0b" },
//   { title: "Math Puzzle Challenge", subject: "Mathematics", date: "Last Month", type: "Game", grade: "Math Wizard! 🧙‍♂️", icon: "🧩", color: "#6366f1" },
//   { title: "History of Cholas", subject: "Social Science", date: "Last Month", type: "Drawing", grade: "Creative! 🎨", icon: "👑", color: "#ec4899" }
// ];

// const badges = [
//   { name: "Super Reader", description: "Read 10 story books this month!", icon: "📖", color: "from-emerald-400 to-teal-500" },
//   { name: "Math Ninja", description: "Solved all puzzles perfectly!", icon: "🥷", color: "from-indigo-400 to-purple-500" },
//   { name: "Kindness Star", description: "Helped a classmate today!", icon: "⭐", color: "from-amber-400 to-orange-500" },
//   { name: "Science Explorer", description: "Completed 5 virtual lab experiments", icon: "🔬", color: "from-blue-400 to-cyan-500" }
// ];

// const skills = [
//   { name: "Creativity ✨", level: 90, color: "#f59e0b" },
//   { name: "Teamwork 🤝", level: 85, color: "#10b981" },
//   { name: "Curiosity 🕵️‍♂️", level: 95, color: "#ec4899" },
//   { name: "Focus 🎯", level: 70, color: "#3b82f6" }
// ];

// export default function MiddleSchoolPortfolio() {
//   return (
//     <PortalLayout
//       title="My Fun Portfolio 🎨"
//       subtitle="Look at all the awesome things you have done, Arjun!"
//     >
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//         {/* Profile Summary */}
//         <div className="glass rounded-3xl p-6 fade-in flex flex-col items-center text-center border-2 border-emerald-500/20 bg-emerald-900/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
//           <div className="relative">
//              <div className="w-28 h-28 rounded-full flex items-center justify-center text-5xl font-bold mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)] border-4 border-emerald-400"
//                   style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "white" }}>
//                A
//              </div>
//              <div className="absolute -bottom-2 -right-2 text-4xl animate-bounce" style={{ animationDuration: '3s' }}>
//                 🌟
//              </div>
//           </div>
//           <h2 className="text-2xl font-black text-white mb-1 tracking-wide">Arjun Kumar</h2>
//           <p className="text-sm font-bold text-emerald-400 mb-5">Class 7B • Roll No. 12</p>
//           <div className="flex flex-wrap justify-center gap-2 mb-6">
//             <span className="px-4 py-1.5 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold border-2 border-amber-500/30 shadow-sm">🚀 Space Lover</span>
//             <span className="px-4 py-1.5 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold border-2 border-purple-500/30 shadow-sm">🎨 Artist</span>
//           </div>
//           <div className="w-full bg-slate-900/50 rounded-2xl p-4 border border-slate-700/50">
//              <div className="flex justify-between items-center mb-3">
//                 <span className="text-sm font-semibold text-slate-300 flex items-center gap-2"><span>📂</span> Awesome Projects</span>
//                 <span className="text-base font-black text-emerald-400">18</span>
//              </div>
//              <div className="flex justify-between items-center mb-3">
//                 <span className="text-sm font-semibold text-slate-300 flex items-center gap-2"><span>🏅</span> Badges Collected</span>
//                 <span className="text-base font-black text-amber-400">{badges.length}</span>
//              </div>
//              <div className="flex justify-between items-center">
//                 <span className="text-sm font-semibold text-slate-300 flex items-center gap-2"><span>🏆</span> Current Level</span>
//                 <span className="text-base font-black text-purple-400">Lvl 12</span>
//              </div>
//           </div>
//         </div>

//         {/* Featured Projects */}
//         <div className="lg:col-span-2 glass rounded-3xl p-6 fade-in-2 border border-slate-700/50">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-xl font-black text-white flex items-center gap-3">
//               <span className="text-3xl">✨</span> Your Best Work
//             </h2>
//             <button className="text-sm font-bold bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-4 py-2 rounded-xl transition-colors border border-emerald-500/30">
//               + Add New
//             </button>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//             {projects.map((p, i) => (
//               <div key={i} className="bg-slate-900/60 border-2 border-slate-700/50 rounded-2xl p-5 hover:border-emerald-500/50 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer group flex flex-col justify-between">
//                 <div>
//                   <div className="flex justify-between items-start mb-4">
//                     <div className="text-4xl bg-slate-800 p-3 rounded-2xl group-hover:scale-110 transition-transform">{p.icon}</div>
//                     <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors border border-transparent group-hover:border-emerald-500/30">{p.grade}</span>
//                   </div>
//                   <h3 className="text-base font-bold text-white mb-1.5">{p.title}</h3>
//                   <p className="text-sm font-medium text-slate-400 mb-4">{p.subject} • {p.type}</p>
//                 </div>
//                 <div className="flex justify-between items-center text-xs mt-auto">
//                   <span className="font-bold text-slate-500 bg-slate-800 px-3 py-1 rounded-lg">{p.date}</span>
//                   <button className="font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Open <span className="text-lg leading-none">→</span></button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
//         {/* Badges & Achievements */}
//         <div className="glass rounded-3xl p-6 fade-in-3 border border-slate-700/50">
//           <div className="flex items-center justify-between mb-6">
//              <h2 className="text-xl font-black text-white flex items-center gap-3">
//                <span className="text-3xl">🏅</span> Badge Collection
//              </h2>
//              <button className="text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors bg-amber-400/10 px-4 py-2 rounded-xl">See All Badges →</button>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {badges.map((b, i) => (
//               <div key={i} className="flex flex-col items-center text-center gap-3 bg-slate-900/40 p-5 rounded-2xl border-2 border-slate-700/30 hover:bg-slate-800/50 hover:border-amber-500/30 transition-colors cursor-default">
//                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br ${b.color} shadow-lg shrink-0 transform hover:rotate-12 transition-transform`}>
//                   {b.icon}
//                 </div>
//                 <div>
//                   <h3 className="text-sm font-black text-white mb-1">{b.name}</h3>
//                   <p className="text-xs font-medium text-slate-400 leading-snug">{b.description}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Skills Radar / Progress */}
//         <div className="glass rounded-3xl p-6 fade-in-4 flex flex-col border border-slate-700/50 bg-gradient-to-br from-transparent to-emerald-900/5">
//           <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
//              <span className="text-3xl">🎯</span> Super Skills
//           </h2>
//           <div className="space-y-6 flex-1">
//             {skills.map((s, i) => (
//                <div key={i} className="group">
//                   <div className="flex justify-between text-sm mb-2.5">
//                     <span className="text-slate-200 font-bold">{s.name}</span>
//                     <span className="text-emerald-400 font-black tracking-wider text-xs bg-emerald-400/10 px-2 py-0.5 rounded-md">{s.level} XP</span>
//                   </div>
//                   <div className="h-3.5 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
//                     <div className="h-full rounded-full transition-all duration-1000 relative group-hover:brightness-125" style={{ width: `${s.level}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}dd)` }}>
//                        <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white/30 to-transparent"></div>
//                        <div className="absolute top-0 bottom-0 left-0 right-0 overflow-hidden">
//                           <div className="w-full h-full opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.5) 10px, rgba(255,255,255,0.5) 20px)' }}></div>
//                        </div>
//                     </div>
//                   </div>
//                </div>
//             ))}
//           </div>
//           <div className="mt-8 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-2xl p-5 text-center shadow-lg relative overflow-hidden">
//              <div className="absolute -right-4 -bottom-4 text-6xl opacity-10">👩‍🏫</div>
//              <p className="text-sm text-emerald-200 font-medium relative z-10 leading-relaxed">
//                 "Arjun is a fantastic learner! The solar system model was out of this world! Keep up the great reading!"
//              </p>
//              <p className="text-xs text-emerald-400 mt-3 font-black tracking-wide relative z-10 uppercase">— Mrs. Anjali (Class Teacher)</p>
//           </div>
//         </div>
//       </div>
//     </PortalLayout>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Swal from "sweetalert2";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

const BADGE_META: Record<string, { icon: string; color: string }> = {
  "🔬 Star Scientist":  { icon: "fi-sr-microscope", color: "from-blue-400 to-indigo-500" },
  "📝 Homework Pro":   { icon: "fi-sr-document-signed", color: "from-amber-400 to-orange-500" },
  "💬 Active Speaker": { icon: "fi-sr-comment-alt", color: "from-emerald-400 to-teal-500" },
  "🌟 Mentor Star":    { icon: "fi-sr-star", color: "from-purple-400 to-fuchsia-500" },
};

const renderIcon = (iconStr: string) => {
  if (!iconStr) return <i className="fi fi-sr-document"></i>;
  if (iconStr.startsWith("fi-")) {
    return <i className={`fi ${iconStr}`}></i>;
  }
  const map: Record<string, string> = {
    "🪐": "fi-sr-planet",
    "🐶": "fi-sr-dog",
    "🧩": "fi-sr-puzzle-piece",
    "👑": "fi-sr-crown",
    "📁": "fi-sr-folder",
    "📖": "fi-sr-book-alt",
    "🥷": "fi-sr-user-ninja",
    "⭐": "fi-sr-star",
    "🔬": "fi-sr-microscope",
    "📝": "fi-sr-document-signed",
    "💬": "fi-sr-comment",
    "🌟": "fi-sr-star",
    "🐝": "fi-sr-bug"
  };
  const mapped = map[iconStr] || "fi-sr-sparkles";
  return <i className={`fi ${mapped}`}></i>;
};

export default function MiddleSchoolPortfolio() {
  const { data: session } = useSession();
  const [student, setStudent] = useState<any>(null);
  const [earnedBadges, setEarnedBadges] = useState<any[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(true);

  // Dynamic Portfolio states
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [skillsList, setSkillsList] = useState<any[]>([]);
  const [bio, setBio] = useState<string>("I love science, stargazing and drawing!");
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [teacherRemark, setTeacherRemark] = useState<string>("Is a fantastic learner! Keep up the great work.");
  const [teacherName, setTeacherName] = useState<string>("Mrs. Anjali (Class Teacher)");

  const fetchPortfolioDetails = (studentId: string) => {
    setPortfolioLoading(true);
    fetch(`${API_BASE}/api/students/${studentId}/portfolio`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const colorMap: Record<string, string> = {
            "Science": "#10b981",
            "English": "#f59e0b",
            "Mathematics": "#6366f1",
            "Social Science": "#ec4899"
          };

          const shapedProjects = (json.data.projects || []).map((p: any) => ({
            title: p.title,
            subject: p.category,
            date: p.date,
            type: p.tags?.[0] || "Project",
            grade: p.description,
            icon: p.image || "📁",
            color: colorMap[p.category] || "#3b82f6"
          }));

          setProjectsList(shapedProjects);
          setSkillsList(json.data.skills || []);
          if (json.data.bio) {
            setBio(json.data.bio);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setPortfolioLoading(false));
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/students`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          const myStudent = (session?.user as any)?.id 
            ? json.data.find((s: any) => s.userId === (session?.user as any)?.id)
            : null;
          const resolved = myStudent || json.data[0];
          setStudent(resolved);

          // Fetch detailed student data (marks, attendance)
          fetch(`${API_BASE}/api/students/${resolved.id}`)
            .then(res => res.json())
            .then(detailJson => {
              if (detailJson.success && detailJson.data) {
                setStudent(detailJson.data);
              }
            }).catch(() => {});

          // Fetch dynamic portfolio data
          fetchPortfolioDetails(resolved.id);

          // Fetch homework to find dynamic teacher remarks
          fetch(`${API_BASE}/api/students/${resolved.id}/homework`)
            .then(r => r.json())
            .then(hwJson => {
              if (hwJson.success && hwJson.data) {
                const graded = hwJson.data.find((h: any) => h.feedback);
                if (graded) {
                  setTeacherRemark(graded.feedback);
                  setTeacherName(`Mrs. Lakshmi (${graded.subject || 'Teacher'})`);
                }
              }
            }).catch(() => {});

          // Fetch badges for this student
          const schoolId = (session?.user as any)?.schoolId;
          const url = schoolId
            ? `${API_BASE}/api/teacher/badges?schoolId=${schoolId}`
            : `${API_BASE}/api/teacher/badges`;

          return fetch(url)
            .then((r) => r.json())
            .then((bJson) => {
              if (bJson.success) {
                const filtered = resolved
                  ? bJson.data.filter((b: any) => b.studentId === resolved.id)
                  : bJson.data;
                const shaped = filtered.map((b: any) => {
                  const meta = BADGE_META[b.badge] || { icon: "fi-sr-medal", color: "from-slate-400 to-slate-600" };
                  return {
                    id: b.id,
                    name: b.badge.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim(),
                    icon: meta.icon,
                    color: meta.color,
                    description: b.remark || "Awarded by your teacher",
                  };
                });
                setEarnedBadges(shaped);
                
                // Fallback to latest badge remark if no homework feedback
                const badgeWithRemark = filtered.find((b: any) => b.remark);
                if (badgeWithRemark) {
                  setTeacherRemark(badgeWithRemark.remark);
                }
              }
            });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setBadgesLoading(false));
  }, [session]);

  const handleAddProject = async () => {
    if (!student) return;

    const { value: formValues } = await Swal.fire({
      title: "Add New Project",
      html: `
        <div class="text-left space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Project Title</label>
            <input id="swal-title" class="w-full border p-2 rounded-lg text-sm" placeholder="e.g. My Plant Growth Log" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Subject (Category)</label>
            <select id="swal-category" class="w-full border p-2 rounded-lg text-sm">
              <option value="Science">Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="English">English</option>
              <option value="Social Science">Social Science</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Icon Emoji</label>
            <input id="swal-image" class="w-full border p-2 rounded-lg text-sm" placeholder="e.g. 🌱, 🪐, 🎨, 🔬" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Type Tag</label>
            <input id="swal-tag" class="w-full border p-2 rounded-lg text-sm" placeholder="e.g. Experiment, Craft, Essay" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Feedback/Grade</label>
            <input id="swal-desc" class="w-full border p-2 rounded-lg text-sm" placeholder="e.g. Super Star! ⭐" />
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return {
          title: (document.getElementById("swal-title") as HTMLInputElement).value,
          category: (document.getElementById("swal-category") as HTMLSelectElement).value,
          image: (document.getElementById("swal-image") as HTMLInputElement).value || "📁",
          tags: [(document.getElementById("swal-tag") as HTMLInputElement).value || "Project"],
          description: (document.getElementById("swal-desc") as HTMLInputElement).value || "Great Job! 👍"
        };
      }
    });

    if (formValues) {
      if (!formValues.title) {
        Swal.fire("Error", "Project title is required", "error");
        return;
      }

      fetch(`${API_BASE}/api/students/${student.id}/portfolio/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues)
      })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          Swal.fire("Success", "Project added to your portfolio!", "success");
          fetchPortfolioDetails(student.id);
        } else {
          Swal.fire("Error", json.error || "Failed to add project", "error");
        }
      })
      .catch(err => {
        console.error(err);
        Swal.fire("Error", "Could not connect to server", "error");
      });
    }
  };

  const userName = session?.user?.name || student?.user?.name || "Student";
  const firstName = userName.split(" ")[0] || "Student";
  const userInitial = userName.charAt(0).toUpperCase();

  const totalXP = skillsList.reduce((sum, s) => sum + s.level, 0);
  const calculatedLevel = totalXP > 0 ? Math.floor(totalXP / 30) + 1 : 1;

  return (
    <PortalLayout
      title="My Fun Portfolio 🎨"
      subtitle={`Look at all the awesome things you have done, ${firstName}!`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="flex flex-col gap-6">
        {/* Profile Summary */}
        <div className="glass rounded-3xl p-6 fade-in flex flex-col items-center text-center border-2 border-emerald-500/20 bg-emerald-50 dark:bg-emerald-900/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <div className="relative">
             <div className="w-28 h-28 rounded-full flex items-center justify-center text-5xl font-bold mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)] border-4 border-emerald-400"
                  style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "white" }}>
               {userInitial}
             </div>
             <div className="absolute -bottom-2 -right-2 text-4xl animate-bounce" style={{ animationDuration: '3s' }}>
                <i className="fi fi-sr-star text-yellow-400 drop-shadow-md"></i>
             </div>
          </div>
          <h2 className="text-2xl font-black text-black dark:text-white mb-1 tracking-wide">{userName}</h2>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-5">
            Class {student?.class || "7"}{student?.section || "B"} • Roll No. {student?.rollNumber || "12"}
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {student?.group && (
              <span className="px-4 py-1.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold border-2 border-amber-500/30 shadow-sm flex items-center gap-1.5">
                <i className="fi fi-sr-rocket"></i> {student.group}
              </span>
            )}
            <span className="px-4 py-1.5 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold border-2 border-purple-500/30 shadow-sm flex items-center gap-1.5">
              <i className="fi fi-sr-backpack"></i> Middle Schooler
            </span>
          </div>
          <div className="w-full bg-white dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-black dark:text-slate-300 flex items-center gap-2"><i className="fi fi-sr-folder text-emerald-500"></i> Awesome Projects</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  {portfolioLoading ? "…" : projectsList.length}
                </span>
             </div>
             <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-black dark:text-slate-300 flex items-center gap-2"><i className="fi fi-sr-medal text-amber-500"></i> Badges Collected</span>
                <span className="text-base font-black text-amber-600 dark:text-amber-400">{badgesLoading ? "…" : earnedBadges.length}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-black dark:text-slate-300 flex items-center gap-2"><i className="fi fi-sr-trophy text-purple-500"></i> Current Level</span>
                <span className="text-base font-black text-purple-600 dark:text-purple-400">Lvl {calculatedLevel}</span>
             </div>
          </div>
        </div>

        {/* Academic Details */}
        <div className="glass rounded-3xl p-6 fade-in border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent text-left shadow-[0_0_20px_rgba(0,0,0,0.02)] dark:shadow-[0_0_20px_rgba(0,0,0,0.2)]">
          <h2 className="text-lg font-black text-black dark:text-white mb-4 flex items-center gap-2">
            <i className="fi fi-sr-graduation-cap text-indigo-500"></i> Academic Stats
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Avg. Score</span>
              <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                {student?.marks && student.marks.length > 0 
                  ? Math.round(student.marks.reduce((a: any, b: any) => a + ((b.scored/(b.maxMarks||100))*100), 0) / student.marks.length) + "%" 
                  : "85%"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Attendance</span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {student?.attendance && student.attendance.length > 0
                  ? Math.round((student.attendance.filter((a: any) => a.status === 'Present').length / student.attendance.length) * 100) + "%"
                  : "92%"}
              </span>
            </div>
          </div>
        </div>
      </div>

        {/* Featured Projects */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 fade-in-2 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent text-left">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <h2 className="text-xl font-black text-black dark:text-white flex items-center gap-3">
              <i className="fi fi-sr-sparkles text-amber-400"></i> Your Best Work
            </h2>
            <button 
              onClick={handleAddProject}
              className="text-sm font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/30 px-4 py-2 rounded-xl transition-colors border border-emerald-500/30"
            >
              + Add New
            </button>
          </div>
          {portfolioLoading ? (
            <div className="text-center py-10 font-bold text-slate-500">Loading portfolio projects... ⏳</div>
          ) : projectsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projectsList.map((p, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 hover:border-emerald-500/50 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer group flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-4xl bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl group-hover:scale-110 transition-transform flex items-center justify-center w-16 h-16">{renderIcon(p.icon)}</div>
                      <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-black dark:text-slate-300 group-hover:bg-emerald-500/20 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors border border-transparent group-hover:border-emerald-500/30">{p.grade}</span>
                    </div>
                    <h3 className="text-base font-bold text-black dark:text-white mb-1.5">{p.title}</h3>
                    <p className="text-sm font-medium text-black dark:text-slate-400 mb-4">{p.subject} • {p.type}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-auto">
                    <span className="font-bold text-black dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">{p.date}</span>
                    <button className="font-bold text-emerald-600 dark:text-emerald-400 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex items-center gap-1">Open <span className="text-lg leading-none">→</span></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500">No projects added yet! Click "+ Add New" to start your showcase.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Badges & Achievements */}
        <div className="glass rounded-3xl p-6 fade-in-3 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent text-left">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
             <h2 className="text-xl font-black text-black dark:text-white flex items-center gap-3">
               <i className="fi fi-sr-medal text-amber-500"></i> Badge Collection
             </h2>
             <Link href="/student/middle-school/badges" className="text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors bg-amber-400/10 px-4 py-2 rounded-xl">See All Badges →</Link>
          </div>
          {badgesLoading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div></div>
          ) : earnedBadges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {earnedBadges.slice(0, 4).map((b) => (
                <div key={b.id} className="flex flex-col items-center text-center gap-3 bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:border-amber-500/30 transition-colors cursor-default">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br ${b.color} shadow-lg shrink-0 transform hover:rotate-12 transition-transform text-white`}>
                    {renderIcon(b.icon)}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-black dark:text-white mb-1">{b.name}</h3>
                    <p className="text-xs font-medium text-black dark:text-slate-400 leading-snug">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="text-4xl mb-3"><i className="fi fi-sr-badge text-slate-300"></i></div>
              <p className="text-sm text-slate-500 dark:text-slate-400">No badges yet! Keep up the great work.</p>
            </div>
          )}
        </div>

        {/* Skills Radar / Progress */}
        <div className="glass rounded-3xl p-6 fade-in-4 flex flex-col border border-slate-200 dark:border-slate-700/50 bg-gradient-to-br from-white to-emerald-50/50 dark:from-transparent dark:to-emerald-900/5 text-left">
          <h2 className="text-xl font-black text-black dark:text-white mb-6 flex items-center gap-3">
             <i className="fi fi-sr-bullseye text-emerald-500"></i> Super Skills
          </h2>
          <div className="space-y-6 flex-1">
            {(portfolioLoading ? [
              { name: "Creativity ✨", level: 90, color: "#f59e0b" },
              { name: "Teamwork 🤝", level: 85, color: "#10b981" },
              { name: "Curiosity 🕵️‍♂️", level: 95, color: "#ec4899" },
              { name: "Focus 🎯", level: 70, color: "#3b82f6" }
            ] : skillsList).map((s, i) => (
               <div key={i} className="group">
                  <div className="flex justify-between text-sm mb-2.5">
                    <span className="text-black dark:text-slate-200 font-bold">{s.name.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim()}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black tracking-wider text-xs bg-emerald-400/10 px-2 py-0.5 rounded-md">{s.level} XP</span>
                  </div>
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700/50 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 relative group-hover:brightness-125 ${s.color?.startsWith("from-") ? `bg-gradient-to-r ${s.color}` : ""}`} 
                      style={s.color?.startsWith("from-") ? { width: `${s.level}%` } : { width: `${s.level}%`, background: `linear-gradient(90deg, ${s.color || '#10b981'}, ${(s.color || '#10b981')}dd)` }}
                    >
                       <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white/30 to-transparent"></div>
                       <div className="absolute top-0 bottom-0 left-0 right-0 overflow-hidden">
                          <div className="w-full h-full opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.5) 10px, rgba(255,255,255,0.5) 20px)' }}></div>
                       </div>
                    </div>
                  </div>
               </div>
            ))}
          </div>
          <div className="mt-8 bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-500/20 rounded-2xl p-5 text-center shadow-lg relative overflow-hidden">
             <div className="absolute -right-4 -bottom-4 text-6xl opacity-10"><i className="fi fi-sr-chalkboard-user"></i></div>
             <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium relative z-10 leading-relaxed">
                "{teacherRemark}"
             </p>
             <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-black tracking-wide relative z-10 uppercase">— {teacherName}</p>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
