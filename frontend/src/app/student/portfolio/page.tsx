"use client";

import PortalLayout from "@/components/PortalLayout";
import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
const API_BASE = "http://localhost:5000";

// --- Data Interfaces ---
interface Skill {
  id: string;
  name: string;
  level: number;
  color: string;
}

interface Project {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
  tags: string[];
  description: string;
}

interface Achievement {
  id: string;
  title: string;
  year: string;
  icon: string;
  color: string;
  bg: string;
}

interface Profile {
  name: string;
  email: string;
  class: string;
  section: string;
  stream: string;
  rollNumber: string;
  emisNumber: string;
  schoolName: string;
  bio: string;
  strengths: string[];
  areasOfGrowth: string[];
  termGoals: string[];
  leadershipRoles: string[];
  vocationalSkills: string[];
  languageFluency: Record<string, string>;
  projectsCount: number;
  awardsCount: number;
  attendanceRate: number;
  careerGoal: string;
  subjectInterests: string[];
  talentPrep: string[];
  communicationRole: string;
  teacherEndorsement: string;
  teacherName: string;
  parentEndorsement: string;
  parentName: string;
}

interface Club {
  name: string;
  role: string;
  category: string;
  icon: string | null;
}

interface SportsTeam {
  name: string;
  role: string;
  match: string | null;
}

interface SportsStat {
  label: string;
  value: string;
}

interface SportsEvent {
  title: string;
  date: string;
  type: string;
}

interface SportsData {
  teams: SportsTeam[];
  stats: SportsStat[];
  events: SportsEvent[];
}

interface SocialActivity {
  id: string;
  activityType: string;
  description: string | null;
  date: string;
  points: number;
  status: string;
}

interface MarkSummary {
  subject: string;
  examName: string;
  marksObtained: number;
  maxMarks: number;
  remarks: string | null;
}

interface LabAttempt {
  experimentTitle: string;
  completed: boolean;
  score: number | null;
  date: string;
}

interface PortfolioData {
  id: string;
  studentId: string;
  profile: Profile;
  skills: Skill[];
  projects: Project[];
  achievements: Achievement[];
  clubs: Club[];
  sports: SportsData | null;
  socialActivities: SocialActivity[];
  marksSummary: MarkSummary[];
  labAttempts: LabAttempt[];
}

function DigitalPortfolioContent() {
  const [activeTab, setActiveTab] = useState<"overview" | "academics" | "projects" | "activities">("overview");
  const [data, setData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { data: session } = useSession();

  const searchParams = useSearchParams();
  const queryStudentId = searchParams.get("studentId");
  const loggedInRole = (session?.user as any)?.role || "STUDENT";
  const loggedInStudentId = (session?.user as any)?.studentId;

  const isReadOnly =
    loggedInRole === "STUDENT" ||
    (queryStudentId !== null &&
      queryStudentId !== loggedInStudentId &&
      loggedInRole !== "TEACHER" &&
      loggedInRole !== "HEADMASTER");

  const themeClass =
    loggedInRole === "TEACHER"
      ? "theme-teacher"
      : loggedInRole === "HEADMASTER"
      ? "theme-headmaster"
      : "theme-student";

  // Filter States
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>("All");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("All");

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    bio: "",
    stream: "",
    strengths: "",
    areasOfGrowth: "",
    termGoals: "",
    leadershipRoles: "",
    languages: "",
    careerGoal: "",
    teacherEndorsement: "",
    teacherName: "",
    parentEndorsement: "",
    parentName: ""
  });

  const [skillForm, setSkillForm] = useState({
    name: "",
    level: 80,
    color: "from-indigo-500 to-purple-500"
  });

  const [projectForm, setProjectForm] = useState({
    title: "",
    category: "Science & Tech",
    date: new Date().getFullYear().toString(),
    tags: "",
    description: "",
    image: "code"
  });

  const [achievementForm, setAchievementForm] = useState({
    title: "",
    year: new Date().getFullYear().toString(),
    icon: "trophy",
    color: "text-amber-400",
    bg: "border-amber-500/30 bg-amber-500/10"
  });

  useEffect(() => {
    fetchPortfolio();
  }, [session, queryStudentId]);

  const fetchPortfolio = async () => {
    setIsLoading(true);
    try {
      const targetStudentId =
        queryStudentId || (session?.user as any)?.studentId || (session?.user as any)?.id || "teenu";

      const res = await fetch(`${API_BASE}/api/portfolio/${targetStudentId}`);
      const json = await res.json();

      let portfolioObj: PortfolioData | null = null;
      if (json.success && json.data) {
        portfolioObj = json.data;
      }

      if (!portfolioObj) {
        // Fallback default structure
        const userName = session?.user?.name || "Student";
        portfolioObj = {
          id: `pf-${targetStudentId}`,
          studentId: targetStudentId,
          profile: {
            name: userName,
            email: session?.user?.email || "",
            class: (session?.user as any)?.class || "10",
            section: (session?.user as any)?.section || "A",
            rollNumber: (session?.user as any)?.rollNumber || "1001",
            emisNumber: (session?.user as any)?.emisId || "EMIS789012",
            schoolName: (session?.user as any)?.schoolName || "Government Higher Secondary School",
            bio: "Passionate learner with a strong interest in science, mathematics, and technology.",
            stream: "General Science",
            strengths: ["Analytical Thinking", "Problem Solving", "Teamwork"],
            areasOfGrowth: ["Time Management", "Public Speaking"],
            termGoals: ["Score >90% in Science", "Complete Robotics Project"],
            leadershipRoles: ["Class Monitor", "Science Club Lead"],
            vocationalSkills: ["Basic Coding", "Circuit Design"],
            languageFluency: { Tamil: "Native", English: "Fluent" },
            projectsCount: 2,
            awardsCount: 3,
            attendanceRate: 94,
            careerGoal: "Software Engineer / Data Scientist",
            subjectInterests: ["Mathematics", "Physics", "Computer Science"],
            talentPrep: ["NTSE Aspirant"],
            communicationRole: "Debater",
            teacherEndorsement: "Demonstrates outstanding dedication in class and peer tutoring.",
            teacherName: "Mr. K. Arul",
            parentEndorsement: "Very hardworking at home and attentive to studies.",
            parentName: "S. Balan"
          },
          skills: [
            { id: "s1", name: "Python Programming", level: 85, color: "from-indigo-500 to-purple-500" },
            { id: "s2", name: "Science Modeling", level: 90, color: "from-emerald-500 to-teal-500" },
            { id: "s3", name: "Public Speaking", level: 75, color: "from-amber-500 to-orange-500" }
          ],
          projects: [
            {
              id: "p1",
              title: "Smart Solar Irrigation System",
              category: "Science Exhibition",
              date: "2025",
              image: "code",
              tags: ["IoT", "Solar", "AgriTech"],
              description: "An automated solar-powered soil moisture sensing system for efficient crop watering."
            }
          ],
          achievements: [
            { id: "a1", title: "District Level Science Quiz - 1st Rank", year: "2025", icon: "trophy", color: "text-amber-400", bg: "border-amber-500/30 bg-amber-500/10" },
            { id: "a2", title: "Perfect Attendance Award", year: "2024", icon: "star", color: "text-emerald-400", bg: "border-emerald-500/30 bg-emerald-500/10" }
          ],
          clubs: [
            { name: "Science & Innovation Club", role: "President", category: "Academic", icon: "flask" },
            { name: "Eco Club", role: "Active Member", category: "Environmental", icon: "leaf" }
          ],
          sports: {
            teams: [{ name: "School Athletics Team", role: "400m Sprinter", match: "District Level" }],
            stats: [
              { label: "100m Sprint", value: "12.4s" },
              { label: "Long Jump", value: "4.8m" }
            ],
            events: [{ title: "Annual Athletic Meet 2025", date: "Jan 2025", type: "Gold Medal" }]
          },
          socialActivities: [
            { id: "sa1", activityType: "NSS Tree Plantation", description: "Planted 50 saplings in school campus", date: "12 Feb 2025", points: 25, status: "Verified" }
          ],
          marksSummary: [
            { subject: "Tamil", examName: "Half Yearly", marksObtained: 88, maxMarks: 100, remarks: "Excellent" },
            { subject: "English", examName: "Half Yearly", marksObtained: 85, maxMarks: 100, remarks: "Good" },
            { subject: "Mathematics", examName: "Half Yearly", marksObtained: 96, maxMarks: 100, remarks: "Outstanding" },
            { subject: "Science", examName: "Half Yearly", marksObtained: 92, maxMarks: 100, remarks: "Excellent" },
            { subject: "Social Science", examName: "Half Yearly", marksObtained: 90, maxMarks: 100, remarks: "Very Good" }
          ],
          labAttempts: [
            { experimentTitle: "Ohm's Law Verification", completed: true, score: 100, date: "2025-01-15" },
            { experimentTitle: "Acid-Base Titration", completed: true, score: 95, date: "2025-02-02" }
          ]
        };
      }

      setData(portfolioObj);
      populateProfileForm(portfolioObj.profile);
    } catch (err) {
      console.error("Failed to fetch portfolio:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const populateProfileForm = (profile: Profile) => {
    setProfileForm({
      bio: profile.bio || "",
      stream: profile.stream || "",
      strengths: (profile.strengths || []).join(", "),
      areasOfGrowth: (profile.areasOfGrowth || []).join(", "),
      termGoals: (profile.termGoals || []).join(", "),
      leadershipRoles: (profile.leadershipRoles || []).join(", "),
      languages: Object.entries(profile.languageFluency || {})
        .map(([k, v]) => `${k}:${v}`)
        .join(", "),
      careerGoal: profile.careerGoal || "",
      teacherEndorsement: profile.teacherEndorsement || "",
      teacherName: profile.teacherName || "",
      parentEndorsement: profile.parentEndorsement || "",
      parentName: profile.parentName || ""
    });
  };

  // --- Dynamic CRUD Actions ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setIsSaving(true);

    try {
      const langFluency: Record<string, string> = {};
      profileForm.languages.split(",").forEach((item) => {
        const parts = item.split(":");
        if (parts.length === 2) {
          langFluency[parts[0].trim()] = parts[1].trim();
        }
      });

      const updatedProfile: Profile = {
        ...data.profile,
        bio: profileForm.bio,
        stream: profileForm.stream,
        strengths: profileForm.strengths.split(",").map((s) => s.trim()).filter(Boolean),
        areasOfGrowth: profileForm.areasOfGrowth.split(",").map((s) => s.trim()).filter(Boolean),
        termGoals: profileForm.termGoals.split(",").map((s) => s.trim()).filter(Boolean),
        leadershipRoles: profileForm.leadershipRoles.split(",").map((s) => s.trim()).filter(Boolean),
        languageFluency: langFluency,
        careerGoal: profileForm.careerGoal,
        teacherEndorsement: profileForm.teacherEndorsement,
        teacherName: profileForm.teacherName,
        parentEndorsement: profileForm.parentEndorsement,
        parentName: profileForm.parentName
      };

      const studentId = data.studentId;
      await fetch(`${API_BASE}/api/portfolio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          bio: profileForm.bio,
          stream: profileForm.stream,
          strengths: updatedProfile.strengths,
          areasOfGrowth: updatedProfile.areasOfGrowth,
          termGoals: updatedProfile.termGoals,
          leadershipRoles: updatedProfile.leadershipRoles,
          languageFluency: langFluency,
          careerGoal: profileForm.careerGoal,
          teacherEndorsement: profileForm.teacherEndorsement,
          teacherName: profileForm.teacherName,
          parentEndorsement: profileForm.parentEndorsement,
          parentName: profileForm.parentName
        })
      });

      setData({ ...data, profile: updatedProfile });
      setIsProfileModalOpen(false);
      Swal.fire({
        title: "Profile Updated",
        text: "Portfolio profile details saved successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#0f172a",
        color: "#f8fafc"
      });
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setIsSaving(true);

    try {
      const studentId = data.studentId;
      const res = await fetch(`${API_BASE}/api/portfolio/${studentId}/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skillForm)
      });
      const json = await res.json();

      const newSkill: Skill = json.data || {
        id: `s-${Date.now()}`,
        ...skillForm
      };

      setData({ ...data, skills: [...data.skills, newSkill] });
      setIsSkillModalOpen(false);
      setSkillForm({ name: "", level: 80, color: "from-indigo-500 to-purple-500" });
    } catch (err) {
      console.error("Error adding skill:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!data) return;
    const result = await Swal.fire({
      title: "Delete Skill?",
      text: "Are you sure you want to remove this skill from your portfolio?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#334155",
      confirmButtonText: "Yes, delete",
      background: "#0f172a",
      color: "#f8fafc"
    });

    if (!result.isConfirmed) return;

    try {
      await fetch(`${API_BASE}/api/portfolio/${data.studentId}/skills/${skillId}`, {
        method: "DELETE"
      });
      setData({ ...data, skills: data.skills.filter((s) => s.id !== skillId) });
    } catch (err) {
      console.error("Error deleting skill:", err);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setIsSaving(true);

    try {
      const studentId = data.studentId;
      const payload = {
        ...projectForm,
        tags: projectForm.tags.split(",").map((t) => t.trim()).filter(Boolean)
      };

      const res = await fetch(`${API_BASE}/api/portfolio/${studentId}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      const newProject: Project = json.data || {
        id: `p-${Date.now()}`,
        title: projectForm.title,
        category: projectForm.category,
        date: projectForm.date,
        image: projectForm.image,
        tags: payload.tags,
        description: projectForm.description
      };

      const updatedProjects = [...data.projects, newProject];
      setData({
        ...data,
        projects: updatedProjects,
        profile: { ...data.profile, projectsCount: updatedProjects.length }
      });
      setIsProjectModalOpen(false);
      setProjectForm({
        title: "",
        category: "Science & Tech",
        date: new Date().getFullYear().toString(),
        tags: "",
        description: "",
        image: "code"
      });
    } catch (err) {
      console.error("Error adding project:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!data) return;
    const result = await Swal.fire({
      title: "Delete Project?",
      text: "Remove this project entry?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#334155",
      confirmButtonText: "Yes, delete",
      background: "#0f172a",
      color: "#f8fafc"
    });

    if (!result.isConfirmed) return;

    try {
      await fetch(`${API_BASE}/api/portfolio/${data.studentId}/projects/${projectId}`, {
        method: "DELETE"
      });
      const updatedProjects = data.projects.filter((p) => p.id !== projectId);
      setData({
        ...data,
        projects: updatedProjects,
        profile: { ...data.profile, projectsCount: updatedProjects.length }
      });
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setIsSaving(true);

    try {
      const studentId = data.studentId;
      const res = await fetch(`${API_BASE}/api/portfolio/${studentId}/achievements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(achievementForm)
      });
      const json = await res.json();

      const newAch: Achievement = json.data || {
        id: `a-${Date.now()}`,
        ...achievementForm
      };

      const updatedAch = [...data.achievements, newAch];
      setData({
        ...data,
        achievements: updatedAch,
        profile: { ...data.profile, awardsCount: updatedAch.length }
      });
      setIsAchievementModalOpen(false);
      setAchievementForm({
        title: "",
        year: new Date().getFullYear().toString(),
        icon: "trophy",
        color: "text-amber-400",
        bg: "border-amber-500/30 bg-amber-500/10"
      });
    } catch (err) {
      console.error("Error adding achievement:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAchievement = async (achievementId: string) => {
    if (!data) return;
    const result = await Swal.fire({
      title: "Delete Award?",
      text: "Remove this honor from your portfolio?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#334155",
      confirmButtonText: "Yes, delete",
      background: "#0f172a",
      color: "#f8fafc"
    });

    if (!result.isConfirmed) return;

    try {
      await fetch(`${API_BASE}/api/portfolio/${data.studentId}/achievements/${achievementId}`, {
        method: "DELETE"
      });
      const updatedAch = data.achievements.filter((a) => a.id !== achievementId);
      setData({
        ...data,
        achievements: updatedAch,
        profile: { ...data.profile, awardsCount: updatedAch.length }
      });
    } catch (err) {
      console.error("Error deleting achievement:", err);
    }
  };

  const handleExportPDF = () => {
    if (!data) return;
    const printWin = window.open("", "_blank");
    if (!printWin) {
      window.print();
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Portfolio - ${data.profile.name}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; }
            .card { background: #1e293b; border-radius: 12px; padding: 16px; margin-bottom: 16px; border: 1px solid #334155; }
            h1 { font-size: 22px; color: #818cf8; margin: 0 0 6px 0; }
            h2 { font-size: 14px; color: #cbd5e1; border-bottom: 1px solid #334155; padding-bottom: 6px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            .badge { background: #312e81; color: #c7d2fe; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>${data.profile.name} — Student Portfolio</h1>
            <p style="font-size: 12px; color: #94a3b8;">${data.profile.schoolName} | Class ${data.profile.class}-${data.profile.section} | EMIS: ${data.profile.emisNumber}</p>
          </div>
          <div class="grid">
            <div class="card">
              <h2>Profile Overview</h2>
              <p style="font-size: 12px;"><strong>Stream:</strong> ${data.profile.stream}</p>
              <p style="font-size: 12px;"><strong>Career Goal:</strong> ${data.profile.careerGoal || "N/A"}</p>
              <p style="font-size: 12px;"><strong>Bio:</strong> ${data.profile.bio}</p>
            </div>
            <div class="card">
              <h2>Key Metrics</h2>
              <p style="font-size: 12px;"><strong>Attendance Rate:</strong> ${data.profile.attendanceRate}%</p>
              <p style="font-size: 12px;"><strong>Projects Cataloged:</strong> ${data.projects.length}</p>
              <p style="font-size: 12px;"><strong>Honors & Awards:</strong> ${data.achievements.length}</p>
            </div>
          </div>
          <div class="card">
            <h2>Projects</h2>
            ${data.projects.map((p) => `<div style="margin-bottom:8px;"><strong>${p.title}</strong> (${p.category}) - ${p.description}</div>`).join("")}
          </div>
          <div class="card">
            <h2>Honors & Awards</h2>
            ${data.achievements.map((a) => `<div style="margin-bottom:6px;">🏆 <strong>${a.title}</strong> (${a.year})</div>`).join("")}
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    setTimeout(() => printWin.print(), 300);
  };

  if (isLoading) {
    return (
      <PortalLayout title="Digital Portfolio" subtitle="Loading portfolio details..." themeClass={themeClass}>
        <div className="flex items-center justify-center min-h-[350px]">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PortalLayout>
    );
  }

  if (!data) {
    return (
      <PortalLayout title="Digital Portfolio" subtitle="Portfolio not found" themeClass={themeClass}>
        <div className="text-center text-slate-400 py-16">Unable to load student portfolio.</div>
      </PortalLayout>
    );
  }

  // Calculate dynamic aggregate marks %
  const totalObtained = data.marksSummary.reduce((acc, curr) => acc + curr.marksObtained, 0);
  const totalMax = data.marksSummary.reduce((acc, curr) => acc + curr.maxMarks, 0);
  const overallPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

  return (
    <PortalLayout
      title="Digital Portfolio"
      subtitle="A dynamic, clean showcase of academic progress, projects, skills & achievements."
      avatarLetter={data.profile.name.charAt(0)}
      avatarColor="#6366f1"
      themeClass={themeClass}
      accentColor="#6366f1"
    >
      {/* 🚀 Header & Student Hero Card */}
      <div className="glass rounded-3xl p-6 border border-slate-700/60 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-950/80 mb-6 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Student Profile Identity */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 border-2 border-indigo-400/40 flex items-center justify-center text-3xl font-black text-white shadow-lg shrink-0">
              {data.profile.name.substring(0, 2).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white">{data.profile.name}</h1>
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  Class {data.profile.class}-{data.profile.section}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  {data.profile.stream}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">{data.profile.schoolName}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-1">
                <span>EMIS: <strong className="text-amber-400">{data.profile.emisNumber}</strong></span>
                <span>•</span>
                <span>Roll: <strong className="text-slate-200">{data.profile.rollNumber}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {!isReadOnly && (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5"
              >
                <i className="fi fi-rr-edit text-indigo-400 text-xs flex items-center" /> Edit Profile
              </button>
            )}
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <i className="fi fi-rr-download text-xs flex items-center" /> Export PDF
            </button>
          </div>
        </div>

        {/* 📊 Key Dynamic Metrics Bar (4 Key Stats) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <i className="fi fi-rr-check-circle text-lg flex items-center" />
            </div>
            <div>
              <span className="block text-base font-black text-white">{data.profile.attendanceRate}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <i className="fi fi-rr-folder text-lg flex items-center" />
            </div>
            <div>
              <span className="block text-base font-black text-white">{data.projects.length}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projects</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <i className="fi fi-rr-trophy text-lg flex items-center" />
            </div>
            <div>
              <span className="block text-base font-black text-white">{data.achievements.length}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Awards</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <i className="fi fi-rr-graduation-cap text-lg flex items-center" />
            </div>
            <div>
              <span className="block text-base font-black text-white">{overallPercentage}%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🧭 Modern Dynamic Navigation Tabs */}
      <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 mb-6 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "overview"
              ? "bg-indigo-600 text-white shadow-md font-extrabold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <i className="fi fi-rr-user text-sm flex items-center" /> Overview & Profile
        </button>
        <button
          onClick={() => setActiveTab("academics")}
          className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "academics"
              ? "bg-indigo-600 text-white shadow-md font-extrabold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <i className="fi fi-rr-book-alt text-sm flex items-center" /> Academic Performance
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "projects"
              ? "bg-indigo-600 text-white shadow-md font-extrabold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <i className="fi fi-rr-sparkles text-sm flex items-center" /> Projects & Skills
        </button>
        <button
          onClick={() => setActiveTab("activities")}
          className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "activities"
              ? "bg-indigo-600 text-white shadow-md font-extrabold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <i className="fi fi-rr-award text-sm flex items-center" /> Honors & Activities
        </button>
      </div>

      {/* 📄 TAB 1: OVERVIEW & PROFILE */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Bio & Goals */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio & Motto */}
            <div className="glass rounded-3xl p-6 border border-slate-700/60 space-y-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <i className="fi fi-rr-user text-indigo-400 text-sm flex items-center" /> Biography & Motto
              </h3>
              <p className="text-xs text-slate-300 italic leading-relaxed bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                "{data.profile.bio || "No biography entered yet."}"
              </p>
            </div>

            {/* Strengths & Areas of Growth */}
            <div className="glass rounded-3xl p-6 border border-slate-700/60 space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <i className="fi fi-rr-target text-emerald-400 text-sm flex items-center" /> Core Competencies & Growth Goals
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider block">Key Strengths</span>
                  <div className="flex flex-wrap gap-1.5">
                    {data.profile.strengths.length > 0 ? (
                      data.profile.strengths.map((str, idx) => (
                        <span key={idx} className="text-xs font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                          {str}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">None specified.</span>
                    )}
                  </div>
                </div>

                {/* Growth Areas */}
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider block">Areas of Growth</span>
                  <div className="flex flex-wrap gap-1.5">
                    {data.profile.areasOfGrowth.length > 0 ? (
                      data.profile.areasOfGrowth.map((gro, idx) => (
                        <span key={idx} className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                          {gro}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">None specified.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Term Goals */}
              {data.profile.termGoals.length > 0 && (
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-black uppercase text-indigo-400 tracking-wider block">Active Term Objectives</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {data.profile.termGoals.map((goal, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <i className="fi fi-rr-star text-amber-400 text-xs shrink-0 flex items-center" />
                        <span>{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Verified Endorsements */}
            <div className="glass rounded-3xl p-6 border border-slate-700/60 space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <i className="fi fi-rr-shield-check text-teal-400 text-sm flex items-center" /> Verified Endorsements
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Teacher Endorsement */}
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-teal-400">Teacher Feedback</span>
                    <span className="text-[9px] font-bold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">Verified</span>
                  </div>
                  <p className="text-xs text-slate-300 italic">"{data.profile.teacherEndorsement || "No teacher endorsement logged yet."}"</p>
                  {data.profile.teacherName && (
                    <span className="text-[11px] font-bold text-slate-400 block text-right">— {data.profile.teacherName}</span>
                  )}
                </div>

                {/* Parent Endorsement */}
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-purple-400">Parent Feedback</span>
                    <span className="text-[9px] font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Verified</span>
                  </div>
                  <p className="text-xs text-slate-300 italic">"{data.profile.parentEndorsement || "No parent endorsement logged yet."}"</p>
                  {data.profile.parentName && (
                    <span className="text-[11px] font-bold text-slate-400 block text-right">— {data.profile.parentName}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Aspirations & Details */}
          <div className="space-y-6">
            {/* Career Aspiration */}
            <div className="glass rounded-3xl p-6 border border-slate-700/60 space-y-3">
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block">Career Aspiration</span>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <i className="fi fi-rr-sparkles text-amber-400 text-sm flex items-center" /> {data.profile.careerGoal || "Not specified"}
              </h4>
            </div>

            {/* Leadership Roles */}
            <div className="glass rounded-3xl p-6 border border-slate-700/60 space-y-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <i className="fi fi-rr-users text-indigo-400 text-sm flex items-center" /> Leadership & Roles
              </h3>
              {data.profile.leadershipRoles.length > 0 ? (
                <div className="space-y-2">
                  {data.profile.leadershipRoles.map((role, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-xs font-bold text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                      <span>{role}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No leadership roles listed.</p>
              )}
            </div>

            {/* Languages Known */}
            <div className="glass rounded-3xl p-6 border border-slate-700/60 space-y-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <i className="fi fi-rr-comment-alt text-emerald-400 text-sm flex items-center" /> Languages Known
              </h3>
              <div className="space-y-2">
                {Object.entries(data.profile.languageFluency || {}).length > 0 ? (
                  Object.entries(data.profile.languageFluency).map(([lang, val], idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-xs">
                      <span className="font-bold text-white">{lang}</span>
                      <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{val}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No language data.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📊 TAB 2: ACADEMIC PERFORMANCE */}
      {activeTab === "academics" && (
        <div className="space-y-6">
          {/* Subject Scores Table Card */}
          <div className="glass rounded-3xl p-6 border border-slate-700/60 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <i className="fi fi-rr-graduation-cap text-indigo-400 text-lg flex items-center" /> Subject Marks & Assessment Summary
                </h3>
                <p className="text-xs text-slate-400">Exam scores and verified marks log</p>
              </div>

              {/* Overall Score Badge */}
              <div className="bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-2xl flex items-center gap-3 shrink-0">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Overall Score</span>
                <span className="text-xl font-black text-amber-400">{overallPercentage}%</span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <i className="fi fi-rr-filter text-indigo-400 text-sm flex items-center" />
                <span className="font-bold text-slate-400">Exam:</span>
                <select
                  value={selectedExamFilter}
                  onChange={(e) => setSelectedExamFilter(e.target.value)}
                  className="bg-slate-950 text-white font-bold border border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                >
                  <option value="All">All Exams</option>
                  {Array.from(new Set(data.marksSummary.map((m) => m.examName))).map((ex, idx) => (
                    <option key={idx} value={ex}>{ex}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-400">Subject:</span>
                <select
                  value={selectedSubjectFilter}
                  onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                  className="bg-slate-950 text-indigo-300 font-bold border border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                >
                  <option value="All">All Subjects</option>
                  {Array.from(new Set(data.marksSummary.map((m) => m.subject))).map((sub, idx) => (
                    <option key={idx} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Marks Table */}
            {(() => {
              const filtered = data.marksSummary.filter((m) => {
                const matchExam = selectedExamFilter === "All" || m.examName.toLowerCase().includes(selectedExamFilter.toLowerCase());
                const matchSub = selectedSubjectFilter === "All" || m.subject.toLowerCase().includes(selectedSubjectFilter.toLowerCase());
                return matchExam && matchSub;
              });

              return (
                <div className="overflow-x-auto border border-slate-800 rounded-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/80 text-slate-400 text-[11px] font-extrabold uppercase border-b border-slate-800">
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">Assessment</th>
                        <th className="py-3 px-4 text-center">Score Scored</th>
                        <th className="py-3 px-4">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {filtered.length > 0 ? (
                        filtered.map((m, idx) => {
                          const pct = Math.round((m.marksObtained / m.maxMarks) * 100);
                          return (
                            <tr key={idx} className="hover:bg-slate-900/30 transition-colors">
                              <td className="py-3 px-4 font-bold text-white">{m.subject}</td>
                              <td className="py-3 px-4 text-slate-400">{m.examName}</td>
                              <td className="py-3 px-4 text-center">
                                <span
                                  className={`px-2.5 py-1 rounded-xl font-mono text-xs font-black ${
                                    pct >= 90
                                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                      : pct >= 75
                                      ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                                      : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                  }`}
                                >
                                  {m.marksObtained} / {m.maxMarks} ({pct}%)
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-300 italic">{m.remarks || "—"}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-500 italic text-xs">
                            No subject marks match the selected filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>

          {/* Science Lab Attempts (If any) */}
          {data.labAttempts.length > 0 && (
            <div className="glass rounded-3xl p-6 border border-slate-700/60 space-y-4">
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <i className="fi fi-rr-flask text-emerald-400 text-lg flex items-center" /> Practical Lab Experiments
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.labAttempts.map((lab, idx) => (
                  <div key={idx} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-white">{lab.experimentTitle}</h4>
                      <span className="text-[10px] text-slate-500">{new Date(lab.date).toLocaleDateString()}</span>
                    </div>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                      {lab.score !== null ? `${lab.score}% Score` : "Completed"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🚀 TAB 3: PROJECTS & SKILLS */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          {/* Student Projects Section */}
          <div className="glass rounded-3xl p-6 border border-slate-700/60 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <i className="fi fi-rr-folder text-indigo-400 text-lg flex items-center" /> Student Projects & Models
                </h3>
                <p className="text-xs text-slate-400">Innovations, models, and practical work</p>
              </div>

              {!isReadOnly && (
                <button
                  onClick={() => setIsProjectModalOpen(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                >
                  <i className="fi fi-rr-plus text-xs flex items-center" /> Add Project
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.projects.map((proj) => (
                <div key={proj.id} className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 relative group flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                        {proj.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">{proj.date}</span>
                    </div>
                    <h4 className="text-sm font-black text-white">{proj.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{proj.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    <div className="flex flex-wrap gap-1">
                      {proj.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[9px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {!isReadOnly && (
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete project"
                      >
                        <i className="fi fi-rr-trash text-sm flex items-center" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {data.projects.length === 0 && (
                <p className="col-span-2 text-xs text-slate-500 text-center py-8 italic">
                  No projects added yet. Click "Add Project" to showcase your work.
                </p>
              )}
            </div>
          </div>

          {/* Skill Matrix Section */}
          <div className="glass rounded-3xl p-6 border border-slate-700/60 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <i className="fi fi-rr-sparkles text-purple-400 text-lg flex items-center" /> Skill Matrix Profile
                </h3>
                <p className="text-xs text-slate-400">Technical and co-curricular competencies</p>
              </div>

              {!isReadOnly && (
                <button
                  onClick={() => setIsSkillModalOpen(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                >
                  <i className="fi fi-rr-plus text-xs flex items-center" /> Add Skill
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.skills.map((sk) => (
                <div key={sk.id} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 relative group flex justify-between items-center">
                  <div className="flex-1 mr-4 space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-white">{sk.name}</span>
                      <span className="text-indigo-400 font-mono">{sk.level}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${sk.color}`} style={{ width: `${sk.level}%` }}></div>
                    </div>
                  </div>

                  {!isReadOnly && (
                    <button
                      onClick={() => handleDeleteSkill(sk.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete skill"
                    >
                      <i className="fi fi-rr-trash text-sm flex items-center" />
                    </button>
                  )}
                </div>
              ))}

              {data.skills.length === 0 && (
                <p className="col-span-2 text-xs text-slate-500 text-center py-6 italic">
                  No custom skills listed. Click "Add Skill" to add your skills.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🏆 TAB 4: HONORS & ACTIVITIES */}
      {activeTab === "activities" && (
        <div className="space-y-6">
          {/* Honors & Awards */}
          <div className="glass rounded-3xl p-6 border border-slate-700/60 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <i className="fi fi-rr-trophy text-amber-400 text-lg flex items-center" /> Honors & Awards
                </h3>
                <p className="text-xs text-slate-400">Recognitions, competition ranks, and accolades</p>
              </div>

              {!isReadOnly && (
                <button
                  onClick={() => setIsAchievementModalOpen(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                >
                  <i className="fi fi-rr-plus text-xs flex items-center" /> Add Award
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.achievements.map((ach) => (
                <div key={ach.id} className={`p-4 rounded-2xl border flex items-center justify-between relative group ${ach.bg}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-amber-400">
                      <i className="fi fi-rr-trophy text-lg flex items-center" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                      <span className="text-[10px] font-black uppercase text-amber-400 block mt-0.5">Year: {ach.year}</span>
                    </div>
                  </div>

                  {!isReadOnly && (
                    <button
                      onClick={() => handleDeleteAchievement(ach.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete award"
                    >
                      <i className="fi fi-rr-trash text-sm flex items-center" />
                    </button>
                  )}
                </div>
              ))}

              {data.achievements.length === 0 && (
                <p className="col-span-2 text-xs text-slate-500 text-center py-6 italic">
                  No honors recorded yet. Click "Add Award" to log your recognitions.
                </p>
              )}
            </div>
          </div>

          {/* Registered Clubs & Sports */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Clubs */}
            <div className="glass rounded-3xl p-6 border border-slate-700/60 space-y-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <i className="fi fi-rr-users text-teal-400 text-sm flex items-center" /> Registered Clubs
              </h3>
              {data.clubs.length > 0 ? (
                <div className="space-y-2">
                  {data.clubs.map((c, idx) => (
                    <div key={idx} className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-bold text-white">{c.name}</h4>
                        <span className="text-[10px] text-slate-400">Role: {c.role}</span>
                      </div>
                      <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">{c.category}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No club memberships logged.</p>
              )}
            </div>

            {/* Sports & PET */}
            <div className="glass rounded-3xl p-6 border border-slate-700/60 space-y-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <i className="fi fi-rr-volleyball text-amber-400 text-sm flex items-center" /> Sports & Athletics
              </h3>
              {data.sports ? (
                <div className="space-y-3">
                  {data.sports.teams.map((t, idx) => (
                    <div key={idx} className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-bold text-white">{t.name}</h4>
                        <span className="text-[10px] text-slate-400">Role: {t.role}</span>
                      </div>
                      {t.match && <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{t.match}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No athletic records logged.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CRUD MODALS --- */}

      {/* 1. Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass rounded-3xl border border-slate-700/60 max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Customize Profile Details</h3>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-400 hover:text-white">
                <i className="fi fi-rr-cross text-sm flex items-center" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Biography / Motto</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 h-20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Stream</label>
                  <input
                    type="text"
                    value={profileForm.stream}
                    onChange={(e) => setProfileForm({ ...profileForm, stream: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Career Goal</label>
                  <input
                    type="text"
                    value={profileForm.careerGoal}
                    onChange={(e) => setProfileForm({ ...profileForm, careerGoal: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Strengths (comma separated)</label>
                <input
                  type="text"
                  value={profileForm.strengths}
                  onChange={(e) => setProfileForm({ ...profileForm, strengths: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Areas of Growth (comma separated)</label>
                <input
                  type="text"
                  value={profileForm.areasOfGrowth}
                  onChange={(e) => setProfileForm({ ...profileForm, areasOfGrowth: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Term Goals (comma separated)</label>
                <input
                  type="text"
                  value={profileForm.termGoals}
                  onChange={(e) => setProfileForm({ ...profileForm, termGoals: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-900 rounded-xl text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md"
                >
                  {isSaving ? "Saving..." : "Save Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Skill Modal */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass rounded-3xl border border-slate-700/60 max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Add Skill</h3>
              <button onClick={() => setIsSkillModalOpen(false)} className="text-slate-400 hover:text-white">
                <i className="fi fi-rr-cross text-sm flex items-center" />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Skill Name</label>
                <input
                  type="text"
                  value={skillForm.name}
                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Python Programming"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Proficiency Level ({skillForm.level}%)</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={skillForm.level}
                  onChange={(e) => setSkillForm({ ...skillForm, level: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSkillModalOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-900 rounded-xl text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md"
                >
                  {isSaving ? "Adding..." : "Add Skill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass rounded-3xl border border-slate-700/60 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Add Student Project</h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="text-slate-400 hover:text-white">
                <i className="fi fi-rr-cross text-sm flex items-center" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Project Title</label>
                <input
                  type="text"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Solar Water Filter"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Category</label>
                  <input
                    type="text"
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Completion Year</label>
                  <input
                    type="text"
                    value={projectForm.date}
                    onChange={(e) => setProjectForm({ ...projectForm, date: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Description</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 h-20"
                  placeholder="Describe your project work..."
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={projectForm.tags}
                  onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Physics, Innovation, IoT"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-900 rounded-xl text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md"
                >
                  {isSaving ? "Adding..." : "Add Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Achievement Modal */}
      {isAchievementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass rounded-3xl border border-slate-700/60 max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Add Honor / Award</h3>
              <button onClick={() => setIsAchievementModalOpen(false)} className="text-slate-400 hover:text-white">
                <i className="fi fi-rr-cross text-sm flex items-center" />
              </button>
            </div>

            <form onSubmit={handleAddAchievement} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Honor Title</label>
                <input
                  type="text"
                  value={achievementForm.title}
                  onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. District Science Exhibition - 1st Place"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Award Year</label>
                <input
                  type="text"
                  value={achievementForm.year}
                  onChange={(e) => setAchievementForm({ ...achievementForm, year: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAchievementModalOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-900 rounded-xl text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md"
                >
                  {isSaving ? "Adding..." : "Add Award"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

export default function DigitalPortfolioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        </div>
      }
    >
      <DigitalPortfolioContent />
    </Suspense>
  );
}
