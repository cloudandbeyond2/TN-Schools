"use client";

import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";

const API_BASE = "http://localhost:5000";

// --- Custom Flat SVG Icons (No Emojis) ---
const AcademicCapIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </svg>
);

const TrophyIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
    <path d="M12 2a7.7 7.7 0 0 1 7.54 8H4.46A7.7 7.7 0 0 1 12 2z" />
  </svg>
);

const FolderIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const CompassIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const SportsIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M6 12c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <path d="M12 6V2m0 20v-4" />
    <path d="M18 12h4M2 12h4" />
  </svg>
);

const UsersIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const BookIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const BoltIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const StarIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ChatIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CodeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const TrashIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const PlusIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const ShareIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const DownloadIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const CloseIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SettingsIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// --- interfaces ---
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
  themeColor: string | null;
  themeBg: string | null;
}

interface SportsTeam {
  name: string;
  role: string;
  icon: string | null;
  color: string | null;
  match: string | null;
}

interface SportsStat {
  label: string;
  value: string;
  icon: string | null;
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

interface Scholarship {
  name: string;
  amount: number;
  status: string;
  academicYear: string;
}

interface LabAttempt {
  experimentTitle: string;
  completed: boolean;
  score: number | null;
  date: string;
}

interface ReadingProgress {
  chapterTitle: string;
  pagesRead: number;
  completed: boolean;
}

interface SchoolPress {
  activityType: string;
  description: string | null;
  points: number;
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
  scholarships: Scholarship[];
  labAttempts: LabAttempt[];
  readingProgress: ReadingProgress[];
  schoolPress: SchoolPress[];
}

export default function DigitalPortfolioPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [data, setData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { data: session } = useSession();

  const searchParams = useSearchParams();
  const queryStudentId = searchParams.get("studentId");
  const loggedInRole = (session?.user as any)?.role || "STUDENT";
  const loggedInStudentId = (session?.user as any)?.studentId;
  
  const studentId = queryStudentId || loggedInStudentId || "demo-student";
  const isReadOnly = loggedInRole === "TEACHER" || loggedInRole === "HEADMASTER" || (queryStudentId !== null && queryStudentId !== loggedInStudentId);
  const themeClass = loggedInRole === "TEACHER" ? "theme-teacher" : loggedInRole === "HEADMASTER" ? "theme-headmaster" : "theme-student";

  const extractClassNum = (classStr: string): number => {
    const match = String(classStr || "").match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);

  // Forms state
  const [profileForm, setProfileForm] = useState({
    bio: "",
    stream: "",
    strengths: "",
    areasOfGrowth: "",
    termGoals: "",
    leadershipRoles: "",
    vocationalSkills: "",
    languages: "",
    careerGoal: "",
    subjectInterests: "",
    talentPrep: "",
    communicationRole: "",
    teacherEndorsement: "",
    teacherName: "",
    parentEndorsement: "",
    parentName: ""
  });

  const [skillForm, setSkillForm] = useState({
    name: "",
    level: 75,
    color: "from-indigo-500 to-purple-500"
  });

  const [projectForm, setProjectForm] = useState({
    title: "",
    category: "",
    date: new Date().getFullYear().toString(),
    tags: "",
    description: "",
    image: "code" // Name of flat SVG icon mapping
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
  }, [session]);

  const fetchPortfolio = async () => {
    try {
      const targetStudentId = queryStudentId || (session?.user as any)?.studentId || "demo-student";
      const res = await fetch(`${API_BASE}/api/portfolio/${targetStudentId}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        // Initialize profile form
        setProfileForm({
          bio: json.data.profile.bio,
          stream: json.data.profile.stream,
          strengths: json.data.profile.strengths.join(", "),
          areasOfGrowth: json.data.profile.areasOfGrowth.join(", "),
          termGoals: json.data.profile.termGoals.join(", "),
          leadershipRoles: json.data.profile.leadershipRoles.join(", "),
          vocationalSkills: json.data.profile.vocationalSkills.join(", "),
          languages: Object.entries(json.data.profile.languageFluency)
            .map(([k, v]) => `${k}:${v}`)
            .join(", "),
          careerGoal: json.data.profile.careerGoal || "",
          subjectInterests: (json.data.profile.subjectInterests || []).join(", "),
          talentPrep: (json.data.profile.talentPrep || []).join(", "),
          communicationRole: json.data.profile.communicationRole || "",
          teacherEndorsement: json.data.profile.teacherEndorsement || "",
          teacherName: json.data.profile.teacherName || "",
          parentEndorsement: json.data.profile.parentEndorsement || "",
          parentName: json.data.profile.parentName || ""
        });
      }
    } catch (err) {
      console.error("Failed to fetch portfolio:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setIsSaving(true);

    try {
      const langFluency: Record<string, string> = {};
      profileForm.languages.split(",").forEach(item => {
        const parts = item.split(":");
        if (parts.length === 2) {
          langFluency[parts[0].trim()] = parts[1].trim();
        }
      });

      const studentId = (session?.user as any)?.studentId || "demo-student";
      const res = await fetch(`${API_BASE}/api/portfolio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          bio: profileForm.bio,
          stream: profileForm.stream,
          strengths: profileForm.strengths.split(",").map(s => s.trim()).filter(Boolean),
          areasOfGrowth: profileForm.areasOfGrowth.split(",").map(s => s.trim()).filter(Boolean),
          termGoals: profileForm.termGoals.split(",").map(s => s.trim()).filter(Boolean),
          leadershipRoles: profileForm.leadershipRoles.split(",").map(s => s.trim()).filter(Boolean),
          vocationalSkills: profileForm.vocationalSkills.split(",").map(s => s.trim()).filter(Boolean),
          languageFluency: langFluency,
          careerGoal: profileForm.careerGoal,
          subjectInterests: profileForm.subjectInterests.split(",").map(s => s.trim()).filter(Boolean),
          talentPrep: profileForm.talentPrep.split(",").map(s => s.trim()).filter(Boolean),
          communicationRole: profileForm.communicationRole,
          teacherEndorsement: profileForm.teacherEndorsement,
          teacherName: profileForm.teacherName,
          parentEndorsement: profileForm.parentEndorsement,
          parentName: profileForm.parentName
        })
      });

      const json = await res.json();
      if (json.success) {
        await fetchPortfolio();
        setIsProfileModalOpen(false);
      }
    } catch (err) {
      console.error("Error saving profile details:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setIsSaving(true);

    try {
      const studentId = (session?.user as any)?.studentId || "demo-student";
      const res = await fetch(`${API_BASE}/api/portfolio/${studentId}/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skillForm)
      });

      const json = await res.json();
      if (json.success) {
        await fetchPortfolio();
        setIsSkillModalOpen(false);
        setSkillForm({ name: "", level: 75, color: "from-indigo-500 to-purple-500" });
      }
    } catch (err) {
      console.error("Error adding skill:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this skill?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#334155",
      confirmButtonText: "Yes, delete it!",
      background: "#0f172a",
      color: "#f8fafc"
    });

    if (!result.isConfirmed) return;

    try {
      const studentId = (session?.user as any)?.studentId || "demo-student";
      const res = await fetch(`${API_BASE}/api/portfolio/${studentId}/skills/${skillId}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        await fetchPortfolio();
        Swal.fire({
          title: "Deleted!",
          text: "Your skill has been deleted.",
          icon: "success",
          background: "#0f172a",
          color: "#f8fafc",
          confirmButtonColor: "#4f46e5"
        });
      }
    } catch (err) {
      console.error("Error deleting skill:", err);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setIsSaving(true);

    try {
      const studentId = (session?.user as any)?.studentId || "demo-student";
      const res = await fetch(`${API_BASE}/api/portfolio/${studentId}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...projectForm,
          tags: projectForm.tags.split(",").map(t => t.trim()).filter(Boolean)
        })
      });

      const json = await res.json();
      if (json.success) {
        await fetchPortfolio();
        setIsProjectModalOpen(false);
        setProjectForm({
          title: "",
          category: "",
          date: new Date().getFullYear().toString(),
          tags: "",
          description: "",
          image: "code"
        });
      }
    } catch (err) {
      console.error("Error adding project:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this project?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#334155",
      confirmButtonText: "Yes, delete it!",
      background: "#0f172a",
      color: "#f8fafc"
    });

    if (!result.isConfirmed) return;

    try {
      const studentId = (session?.user as any)?.studentId || "demo-student";
      const res = await fetch(`${API_BASE}/api/portfolio/${studentId}/projects/${projectId}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        await fetchPortfolio();
        Swal.fire({
          title: "Deleted!",
          text: "Your project has been deleted.",
          icon: "success",
          background: "#0f172a",
          color: "#f8fafc",
          confirmButtonColor: "#4f46e5"
        });
      }
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setIsSaving(true);

    try {
      const studentId = (session?.user as any)?.studentId || "demo-student";
      const res = await fetch(`${API_BASE}/api/portfolio/${studentId}/achievements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(achievementForm)
      });

      const json = await res.json();
      if (json.success) {
        await fetchPortfolio();
        setIsAchievementModalOpen(false);
        setAchievementForm({
          title: "",
          year: new Date().getFullYear().toString(),
          icon: "trophy",
          color: "text-amber-400",
          bg: "border-amber-500/30 bg-amber-500/10"
        });
      }
    } catch (err) {
      console.error("Error adding achievement:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAchievement = async (achievementId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this achievement?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#334155",
      confirmButtonText: "Yes, delete it!",
      background: "#0f172a",
      color: "#f8fafc"
    });

    if (!result.isConfirmed) return;

    try {
      const studentId = (session?.user as any)?.studentId || "demo-student";
      const res = await fetch(`${API_BASE}/api/portfolio/${studentId}/achievements/${achievementId}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        await fetchPortfolio();
        Swal.fire({
          title: "Deleted!",
          text: "Your achievement has been deleted.",
          icon: "success",
          background: "#0f172a",
          color: "#f8fafc",
          confirmButtonColor: "#4f46e5"
        });
      }
    } catch (err) {
      console.error("Error deleting achievement:", err);
    }
  };

  const getStudentTier = (gradeStr: string) => {
    const num = extractClassNum(gradeStr);
    if (num >= 6 && num <= 8) return "Middle School (Grades 6-8)";
    if (num >= 9 && num <= 10) return "High School (Grades 9-10)";
    if (num >= 11 && num <= 12) return "Higher Secondary (Grades 11-12)";
    return "Secondary";
  };

  const getTierColor = (gradeStr: string) => {
    const num = extractClassNum(gradeStr);
    if (num >= 6 && num <= 8) {
      return "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30";
    } else if (num >= 9 && num <= 10) {
      return "from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/30";
    } else {
      return "from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30";
    }
  };

  const renderIconByName = (name: string, colorClass: string = "text-indigo-400") => {
    switch (name.toLowerCase()) {
      case "trophy":
        return <TrophyIcon className={`w-5 h-5 ${colorClass}`} />;
      case "cap":
      case "academics":
        return <AcademicCapIcon className={`w-5 h-5 ${colorClass}`} />;
      case "folder":
      case "project":
        return <FolderIcon className={`w-5 h-5 ${colorClass}`} />;
      case "code":
        return <CodeIcon className={`w-5 h-5 ${colorClass}`} />;
      case "compass":
      case "goal":
        return <CompassIcon className={`w-5 h-5 ${colorClass}`} />;
      case "sports":
        return <SportsIcon className={`w-5 h-5 ${colorClass}`} />;
      case "users":
      case "club":
        return <UsersIcon className={`w-5 h-5 ${colorClass}`} />;
      case "book":
      case "reading":
        return <BookIcon className={`w-5 h-5 ${colorClass}`} />;
      case "bolt":
      case "skill":
        return <BoltIcon className={`w-5 h-5 ${colorClass}`} />;
      case "star":
        return <StarIcon className={`w-5 h-5 ${colorClass}`} />;
      case "chat":
      case "feedback":
        return <ChatIcon className={`w-5 h-5 ${colorClass}`} />;
      default:
        return <TrophyIcon className={`w-5 h-5 ${colorClass}`} />;
    }
  };

  if (isLoading) {
    return (
      <PortalLayout title="Digital Portfolio" subtitle="Loading your portfolio..." themeClass={themeClass}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PortalLayout>
    );
  }

  if (!data) {
    return (
      <PortalLayout title="Digital Portfolio" subtitle="Portfolio not found." themeClass={themeClass}>
        <div className="text-center text-slate-400 mt-20">Could not load portfolio data.</div>
      </PortalLayout>
    );
  }

  const studentTier = getStudentTier(data.profile.class);
  const tierColorStyle = getTierColor(data.profile.class);

  return (
    <PortalLayout
      title="Digital Portfolio"
      subtitle="A dynamic, responsive digital showcase of your school career achievements and development."
      avatarLetter={data.profile.name.charAt(0)}
      avatarColor="#6366f1"
      themeClass={themeClass}
      accentColor="#6366f1"
    >
      {/* Top Banner / Action Bar */}
      <div className="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-wrap bg-slate-900/50 p-1.5 rounded-xl border border-slate-700/50 w-fit gap-1">
          <button 
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === "profile" ? "bg-indigo-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
          >
            <CompassIcon className="w-4 h-4" /> Profile & Goals
          </button>
          <button 
            onClick={() => setActiveTab("academics")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === "academics" ? "bg-indigo-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
          >
            <AcademicCapIcon className="w-4 h-4" /> {extractClassNum(data.profile.class) <= 8 ? "Academics" : "Academics & Labs"}
          </button>
          <button 
            onClick={() => setActiveTab("cocurricular")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === "cocurricular" ? "bg-indigo-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
          >
            <SportsIcon className="w-4 h-4" /> Co-curricular & Sports
          </button>
          <button 
            onClick={() => setActiveTab("projects")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === "projects" ? "bg-indigo-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
          >
            <FolderIcon className="w-4 h-4" /> Projects & Honors
          </button>
          <button 
            onClick={() => setActiveTab("resume")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === "resume" ? "bg-indigo-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
          >
            <BookIcon className="w-4 h-4" /> Academic Timeline
          </button>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2">
            <ShareIcon /> Share Portfolio
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold text-white transition-colors shadow-lg flex items-center gap-2">
            <DownloadIcon /> Export PDF
          </button>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Panel: Profile Detail & SWOT Card */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Main Dynamic Profile Card */}
          <div className="glass rounded-3xl p-6 border border-slate-700/50 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full"></div>
            
            {/* Student Avatar - dynamic based on initials */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-4 border-slate-700 mx-auto overflow-hidden mb-4 relative z-10 flex items-center justify-center text-3xl font-black text-white">
              {data.profile.name.substring(0, 2).toUpperCase()}
            </div>

            {/* Tier Badge */}
            <div className={`mx-auto mb-3 px-3 py-1 rounded-full border text-[10px] uppercase font-black tracking-wider w-fit bg-gradient-to-r ${tierColorStyle}`}>
              {studentTier}
            </div>
            
            <h2 className="text-2xl font-black text-white mb-1 relative z-10">{data.profile.name}</h2>
            <p className="text-xs text-indigo-400 font-bold mb-1 relative z-10">EMIS: {data.profile.emisNumber} • Roll: {data.profile.rollNumber}</p>
            <p className="text-sm text-slate-300 font-medium mb-4 relative z-10">{data.profile.schoolName}</p>
            <p className="text-xs text-slate-400 bg-slate-950/30 py-1.5 px-3 rounded-lg border border-slate-800/80 mb-4 inline-block font-bold">
              Class {data.profile.class}-{data.profile.section} • {data.profile.stream}
            </p>
            
            <p className="text-xs text-slate-300 leading-relaxed mb-6 relative z-10 text-center italic">
              "{data.profile.bio}"
            </p>

            {/* Micro Stats Grid */}
            <div className="grid grid-cols-3 gap-3 relative z-10">
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="block text-lg font-black text-white">{data.profile.projectsCount}</span>
                <span className="text-[9px] uppercase font-bold text-slate-500">Projects</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="block text-lg font-black text-white">{data.profile.awardsCount}</span>
                <span className="text-[9px] uppercase font-bold text-slate-500">Awards</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="block text-lg font-black text-emerald-400">{data.profile.attendanceRate}%</span>
                <span className="text-[9px] uppercase font-bold text-slate-500">Attendance</span>
              </div>
            </div>

            {!isReadOnly && (
              <button 
                onClick={() => setIsProfileModalOpen(true)}
                className="mt-5 w-full py-2 bg-slate-800 hover:bg-slate-700/80 text-white rounded-xl text-xs font-bold transition-all border border-slate-700/60 flex items-center justify-center gap-1.5"
              >
                <EditIcon className="w-3.5 h-3.5 text-slate-400" /> Customize Profile
              </button>
            )}
          </div>

          {/* Attendance Tracking Circular Progress Ring */}
          <div className="glass rounded-3xl p-6 border border-slate-700/50">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <StarIcon className="w-4 h-4 text-emerald-400" /> Attendance Dedication
            </h3>
            
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-emerald-500 transition-all duration-1000" strokeDasharray={`${data.profile.attendanceRate}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-white">
                  {data.profile.attendanceRate}%
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-300 font-bold">Excellent Commitment</p>
                <p className="text-[10px] text-slate-400 mt-1">Maintaining attendance above 90% supports higher academic gains and demonstrates persistence.</p>
              </div>
            </div>
          </div>

          {/* SWOT Growth Mindset Section */}
          <div className="glass rounded-3xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CompassIcon className="w-4 h-4 text-rose-400" /> Growth & SWOT
              </h3>
              {!isReadOnly && <button onClick={() => setIsProfileModalOpen(true)} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-black uppercase">Edit</button>}
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold block mb-1">My Strengths</span>
                <div className="flex flex-wrap gap-1.5">
                  {data.profile.strengths.map((str, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{str}</span>
                  ))}
                  {data.profile.strengths.length === 0 && <span className="text-xs text-slate-500">None defined.</span>}
                </div>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold block mb-1">Areas of Growth</span>
                <div className="flex flex-wrap gap-1.5">
                  {data.profile.areasOfGrowth.map((gro, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{gro}</span>
                  ))}
                  {data.profile.areasOfGrowth.length === 0 && <span className="text-xs text-slate-500">None defined.</span>}
                </div>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold block mb-1">Active Term Goals</span>
                <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                  {data.profile.termGoals.map((goa, idx) => (
                    <li key={idx}>{goa}</li>
                  ))}
                  {data.profile.termGoals.length === 0 && <li className="text-slate-500 list-none pl-0">None logged yet.</li>}
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Right Panel: Dynamic Tab Details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Profile & Goals Details Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              
              {/* SWOT / Career Aspiration Adaptations (Grade specific) */}
              <div className="glass rounded-3xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <CompassIcon className="w-5 h-5 text-indigo-400" /> Career & Study Aspirations
                </h3>
                
                {/* 6th-8th: Middle school hobbies & reading */}
                {extractClassNum(data.profile.class) >= 6 && extractClassNum(data.profile.class) <= 8 && (
                  <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 space-y-4">
                    <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">Middle School Exploration Phase</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      At this stage, you are exploring diverse subjects, building foundational skills, and reading widely to expand your vocabulary and reasoning.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-xs font-bold text-slate-400 mb-2">Subject Interests</h5>
                        <div className="flex flex-wrap gap-1.5">
                          {data.profile.subjectInterests.map((sub, idx) => (
                            <span key={idx} className="text-xs text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg">{sub}</span>
                          ))}
                          {data.profile.subjectInterests.length === 0 && <span className="text-xs text-slate-500">None logged.</span>}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-400 mb-2">Reading Tracker Accomplishments</h5>
                        <ul className="text-xs text-slate-300 space-y-1">
                          {data.readingProgress.slice(0, 3).map((rp, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span>📖 {rp.chapterTitle}</span>
                              <span className="text-emerald-400 font-bold">{rp.completed ? "Read" : `${rp.pagesRead} pages`}</span>
                            </li>
                          ))}
                          {data.readingProgress.length === 0 && <li className="text-slate-500">No books cataloged in reading records.</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* 9th-10th: High school streams and board prep */}
                {extractClassNum(data.profile.class) >= 9 && extractClassNum(data.profile.class) <= 10 && (
                  <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 space-y-4">
                    <h4 className="text-xs font-black uppercase text-teal-400 tracking-wider font-bold">Secondary School stream & board prep</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Preparing for key secondary board assessments and talent search tests like NMMS and NTSE to enable specialized high school tracks.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-xs font-bold text-slate-400 mb-1.5">Stream Preference (11th Grade)</h5>
                        <div className="text-sm text-white font-bold bg-slate-950/40 py-2 px-3 rounded-lg border border-slate-800">
                          {data.profile.stream === "General" ? "Science Stream (Maths, Physics, Chemistry, CS)" : data.profile.stream}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-400 mb-1.5">Talent Exams / Board prep</h5>
                        <div className="flex flex-wrap gap-2">
                          {data.profile.talentPrep.map((tp, idx) => (
                            <span key={idx} className="text-[10px] font-black uppercase text-teal-400 bg-teal-500/10 border border-teal-500/30 px-3 py-1 rounded-lg">{tp}</span>
                          ))}
                          {data.profile.talentPrep.length === 0 && <span className="text-xs text-slate-500">None logged.</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 11th-12th: Higher secondary college prep & career */}
                {extractClassNum(data.profile.class) >= 11 && (
                  <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 space-y-4">
                    <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider">Higher Secondary College & Career Alignment</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Structuring subject expertise to align with professional college placements and competitive entries (NEET, JEE, CLAT, UPSC).
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-xs font-bold text-slate-400 mb-1">Career Goal Target</h5>
                        <p className="text-sm font-bold text-white">{data.profile.careerGoal}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-400 mb-1">Entrance prep tracker</h5>
                        <div className="flex flex-wrap gap-2">
                          {data.profile.talentPrep.map((tp, idx) => (
                            <span key={idx} className="text-[10px] font-black uppercase text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-lg inline-block">{tp}</span>
                          ))}
                          {data.profile.talentPrep.length === 0 && <span className="text-xs text-slate-500">None logged.</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Language Lab & Communication Proficiency */}
              <div className="glass rounded-3xl p-6 border border-slate-700/50">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <ChatIcon className="w-5 h-5 text-indigo-400" /> Language & Communication (Language Lab)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 mb-2">Fluency & Speaking Levels</h4>
                    <div className="space-y-2">
                      {Object.entries(data.profile.languageFluency).map(([lang, flu], idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-xs font-bold text-white">{lang}</span>
                          <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{flu}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 mb-2">Speech & Reading Milestones</h4>
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300">Books Read:</span>
                        <span className="font-bold text-white">{data.readingProgress.filter(rp => rp.completed).length} Chapters</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300">Debate Club Roles:</span>
                        <span className="font-bold text-indigo-400">
                          {data.clubs?.find(c => c.name.toLowerCase().includes("debate"))?.role || data.profile.communicationRole || "Member"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leadership & Vocational Skills Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Leadership Roles */}
                <div className="glass rounded-3xl p-6 border border-slate-700/50">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <UsersIcon className="w-4 h-4 text-amber-400" /> Leadership Roles
                  </h3>
                  <div className="space-y-2">
                    {data.profile.leadershipRoles.map((role, idx) => (
                      <div key={idx} className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
                        <span className="text-xs font-bold text-white">{role}</span>
                      </div>
                    ))}
                    {data.profile.leadershipRoles.length === 0 && <p className="text-xs text-slate-500">None assigned yet.</p>}
                  </div>
                </div>

                {/* Vocational & Practical Skills */}
                <div className="glass rounded-3xl p-6 border border-slate-700/50">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <BoltIcon className="w-4 h-4 text-emerald-400" /> Practical & Vocational
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.profile.vocationalSkills.map((vsk, idx) => (
                      <span key={idx} className="text-xs font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/25">
                        🛠️ {vsk}
                      </span>
                    ))}
                    {data.profile.vocationalSkills.length === 0 && <p className="text-xs text-slate-500">None logged yet.</p>}
                  </div>
                </div>

              </div>

              {/* Teacher & Parent Endorsements */}
              <div className="glass rounded-3xl p-6 border border-slate-700/50">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <ChatIcon className="w-5 h-5 text-purple-400" /> Verified Endorsements
                </h3>
                <div className="space-y-4">
                  <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 relative">
                    <p className="text-xs text-slate-300 italic mb-2">
                      "{data.profile.teacherEndorsement}"
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-indigo-400 font-bold uppercase">
                      <span>— {data.profile.teacherName} (Class Teacher)</span>
                      <span className="bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Verified Teacher</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 relative">
                    <p className="text-xs text-slate-300 italic mb-2">
                      "{data.profile.parentEndorsement}"
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-purple-400 font-bold uppercase">
                      <span>— {data.profile.parentName} (Parent)</span>
                      <span className="bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Verified Parent</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Academic & Lab Achievements Tab */}
          {activeTab === "academics" && (
            <div className="space-y-6">
              
              {/* Academic Marks Summary */}
              <div className="glass rounded-3xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <AcademicCapIcon className="w-5 h-5 text-indigo-400" /> Academic Assessments
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase">
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">Assessment</th>
                        <th className="py-3 px-4 text-center">Score</th>
                        <th className="py-3 px-4">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-xs">
                      {data.marksSummary.map((mark, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/20 transition-colors">
                          <td className="py-3.5 px-4 text-white font-bold">{mark.subject}</td>
                          <td className="py-3.5 px-4 text-slate-400">{mark.examName}</td>
                          <td className="py-3.5 px-4 text-center font-black text-indigo-400">{mark.marksObtained} / {mark.maxMarks}</td>
                          <td className="py-3.5 px-4 text-slate-300 italic">{mark.remarks || "Excellent"}</td>
                        </tr>
                      ))}
                      {data.marksSummary.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-500">No marks entered.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Science Lab & Practical Experiments (High School & HSC Only) */}
              {extractClassNum(data.profile.class) > 8 && (
                <div className="glass rounded-3xl p-6 border border-slate-700/50">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <BoltIcon className="w-5 h-5 text-emerald-400" /> Science Lab & Experiments
                  </h3>
                  <div className="space-y-3">
                    {data.labAttempts.map((la, idx) => (
                      <div key={idx} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-bold text-white">{la.experimentTitle}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">Attempted on {new Date(la.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-400 block">{la.score !== null ? `${la.score}% Score` : "Completed"}</span>
                          <span className="text-[9px] uppercase font-bold text-slate-500">{la.completed ? "Verified" : "Pending review"}</span>
                        </div>
                      </div>
                    ))}
                    {data.labAttempts.length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-4">No lab experiment records in database.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Scholarships Record */}
              <div className="glass rounded-3xl p-6 border border-slate-700/50">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5 text-yellow-400" /> Earned Scholarships
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.scholarships.map((sch, idx) => (
                    <div key={idx} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-white">{sch.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-1">Year: {sch.academicYear}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-yellow-400 block">₹{sch.amount.toLocaleString()}</span>
                        <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{sch.status}</span>
                      </div>
                    </div>
                  ))}
                  {data.scholarships.length === 0 && (
                    <p className="col-span-2 text-xs text-slate-500 text-center py-4">No scholarship disbursements logged.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Co-curricular & Sports Tab */}
          {activeTab === "cocurricular" && (
            <div className="space-y-6">
              
              {/* Registered School Clubs */}
              <div className="glass rounded-3xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-teal-400" /> Registered Clubs & Societies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.clubs.map((club, idx) => (
                    <div key={idx} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex items-start gap-3.5">
                      <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl text-2xl">
                        {renderIconByName("club", "text-teal-400")}
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-black tracking-widest text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">{club.category}</span>
                        <h4 className="text-sm font-bold text-white mt-1.5">{club.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Assigned Role: <span className="text-indigo-400 font-bold">{club.role}</span></p>
                      </div>
                    </div>
                  ))}
                  {data.clubs.length === 0 && (
                    <p className="col-span-2 text-xs text-slate-500 text-center py-4">No active club memberships reported.</p>
                  )}
                </div>
              </div>

              {/* Sports Teams & Health Record */}
              <div className="glass rounded-3xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <SportsIcon className="w-5 h-5 text-amber-400" /> Sports & Fitness Portfolio
                </h3>
                {data.sports ? (
                  <div className="space-y-6">
                    {/* Fitness Stats */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fitness metrics</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {data.sports.stats.map((stat, idx) => (
                          <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-center">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">{stat.label}</span>
                            <span className="text-base font-black text-white">{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Team Memberships */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Represented Sports Teams</h4>
                      <div className="space-y-2">
                        {data.sports.teams.map((team, idx) => (
                          <div key={idx} className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 flex justify-between items-center">
                            <div>
                              <h5 className="text-xs font-bold text-white">{team.name}</h5>
                              <p className="text-[10px] text-slate-500 mt-0.5">Role: {team.role}</p>
                            </div>
                            <span className="text-[10px] font-black uppercase text-indigo-400">{team.match || "Active Player"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">No sports profile logged in physical education system.</p>
                )}
              </div>

              {/* Social Community Services (NSS/NCC) */}
              <div className="glass rounded-3xl p-6 border border-slate-700/50">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-emerald-400" /> Social & Community Services (NCC/NSS)
                </h3>
                <div className="space-y-3">
                  {data.socialActivities.map((act, idx) => (
                    <div key={idx} className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-white">{act.activityType}</h4>
                        <p className="text-[10px] text-slate-400 mt-1">{act.description || "Active Participation"}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-400 block">+{act.points} Pts</span>
                        <span className="text-[9px] uppercase font-bold text-slate-500">{act.status}</span>
                      </div>
                    </div>
                  ))}
                  {data.socialActivities.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-4">No volunteering activities found.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Projects & Achievements Tab */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              
              {/* Projects showcase */}
              <div className="glass rounded-3xl p-6 border border-slate-700/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FolderIcon className="w-5 h-5 text-indigo-400" /> Student Projects & Models
                  </h3>
                  {!isReadOnly && (
                    <button 
                      onClick={() => setIsProjectModalOpen(true)}
                      className="py-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <PlusIcon /> Add Project
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {data.projects.map((proj) => (
                    <div key={proj.id} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-5 relative group">
                      {!isReadOnly && (
                        <button 
                          onClick={() => handleDeleteProject(proj.id)}
                          className="absolute top-4 right-4 p-1.5 bg-slate-950/60 text-slate-400 hover:text-rose-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-slate-800"
                          title="Delete Project"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                      
                      <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700/50 shrink-0 flex items-center justify-center">
                        {renderIconByName(proj.image, "text-indigo-400 w-7 h-7")}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] uppercase font-black tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{proj.category}</span>
                          <span className="text-[10px] text-slate-500 font-bold">{proj.date}</span>
                        </div>
                        <h4 className="text-base font-bold text-white mb-2">{proj.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed mb-3">{proj.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {proj.tags.map((tag, tIdx) => (
                            <span key={tIdx} className="text-[9px] font-bold text-slate-300 bg-slate-850 px-2 py-0.5 rounded border border-slate-800">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {data.projects.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-6">No custom projects cataloged. Click "Add Project" to add your work.</p>
                  )}
                </div>
              </div>

              {/* Skill Matrix */}
              <div className="glass rounded-3xl p-6 border border-slate-700/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <BoltIcon className="w-5 h-5 text-indigo-400" /> Skill Matrix Profile
                  </h3>
                  {!isReadOnly && (
                    <button 
                      onClick={() => setIsSkillModalOpen(true)}
                      className="py-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <PlusIcon /> Add Skill
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {data.skills.map((skill) => (
                    <div key={skill.id} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 relative group flex justify-between items-center">
                      <div className="flex-1 mr-4">
                        <div className="flex justify-between items-end mb-1.5">
                          <span className="text-xs font-bold text-white">{skill.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{skill.level}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${skill.color}`} style={{ width: `${skill.level}%` }}></div>
                        </div>
                      </div>
                      {!isReadOnly && (
                        <button 
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-slate-950 border border-slate-850 rounded hover:text-rose-400 text-slate-400"
                          title="Delete Skill"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {data.skills.length === 0 && (
                    <p className="col-span-2 text-xs text-slate-500 text-center py-4">No custom skills loaded. Click "Add Skill" to begin.</p>
                  )}
                </div>
              </div>

              {/* Custom Honors & Achievements */}
              <div className="glass rounded-3xl p-6 border border-slate-700/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <TrophyIcon className="w-5 h-5 text-yellow-400" /> Honors & Custom Awards
                  </h3>
                  {!isReadOnly && (
                    <button 
                      onClick={() => setIsAchievementModalOpen(true)}
                      className="py-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <PlusIcon /> Add Achievement
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.achievements.map((ach) => (
                    <div key={ach.id} className={`p-4 rounded-xl border flex items-center gap-4 relative group ${ach.bg}`}>
                      {!isReadOnly && (
                        <button 
                          onClick={() => handleDeleteAchievement(ach.id)}
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-slate-950 border border-slate-850 rounded-lg hover:text-rose-500 text-slate-400"
                          title="Delete Achievement"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      )}

                      <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/40 shrink-0">
                        {renderIconByName(ach.icon, ach.color)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                        <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider block mt-0.5">Year: {ach.year}</span>
                      </div>
                    </div>
                  ))}
                  {data.achievements.length === 0 && (
                    <p className="col-span-2 text-xs text-slate-500 text-center py-4">No custom achievements added. Click "Add Achievement" to begin.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Academic Timeline Tab */}
          {activeTab === "resume" && (
            <div className="glass rounded-3xl p-6 border border-slate-700/50 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookIcon className="w-5 h-5 text-indigo-400" /> Academic & Portfolio Timeline
              </h3>
              
              <div className="relative border-l border-slate-800 pl-6 ml-4 space-y-8">
                
                {/* Current Enrolled Class */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-slate-950"></div>
                  {extractClassNum(data.profile.class) >= 6 && extractClassNum(data.profile.class) <= 8 ? (
                    <>
                      <h4 className="text-sm font-bold text-white">Currently Enrolled Middle School Student</h4>
                      <span className="text-[10px] font-bold text-indigo-400 block mb-1">Grade {data.profile.class}-{data.profile.section} • Exploration Phase</span>
                      <p className="text-xs text-slate-400">Actively enrolled at {data.profile.schoolName}. Engaged in foundational subjects, club activities, and reading programs.</p>
                    </>
                  ) : extractClassNum(data.profile.class) >= 9 && extractClassNum(data.profile.class) <= 10 ? (
                    <>
                      <h4 className="text-sm font-bold text-white">Currently Enrolled High School Student</h4>
                      <span className="text-[10px] font-bold text-indigo-400 block mb-1">Grade {data.profile.class}-{data.profile.section} • {data.profile.stream === "General" ? "Science & Board Prep" : data.profile.stream}</span>
                      <p className="text-xs text-slate-400">Actively enrolled at {data.profile.schoolName}. Engaged in core subjects, lab experiments, and board exam preparation.</p>
                    </>
                  ) : (
                    <>
                      <h4 className="text-sm font-bold text-white">Currently Enrolled Higher Secondary Student</h4>
                      <span className="text-[10px] font-bold text-indigo-400 block mb-1">Grade {data.profile.class}-{data.profile.section} • {data.profile.stream}</span>
                      <p className="text-xs text-slate-400">Actively enrolled at {data.profile.schoolName}. Focused on advanced stream specialization, lab work, and college entrance preparations.</p>
                    </>
                  )}
                </div>

                {/* Projects timeline */}
                {data.projects.map((proj, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-slate-950"></div>
                    <h4 className="text-sm font-bold text-white">Project: {proj.title}</h4>
                    <span className="text-[10px] font-bold text-emerald-400 block mb-1">{proj.date} • {proj.category}</span>
                    <p className="text-xs text-slate-400">{proj.description}</p>
                  </div>
                ))}

                {/* Achievements timeline */}
                {data.achievements.map((ach, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-yellow-500 ring-4 ring-slate-950"></div>
                    <h4 className="text-sm font-bold text-white">Honored: {ach.title}</h4>
                    <span className="text-[10px] font-bold text-yellow-400 block mb-1">Academic Year {ach.year}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* --- MODALS (CRUD) --- */}
      
      {/* 1. Customize Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass rounded-3xl border border-slate-700/60 max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Customize Profile Details</h3>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-400 hover:text-white"><CloseIcon /></button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Biography / Motto</label>
                <textarea 
                  value={profileForm.bio}
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 h-20"
                  placeholder="Tell us about yourself..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Career / Academic Stream</label>
                  <input 
                    type="text"
                    value={profileForm.stream}
                    onChange={e => setProfileForm({ ...profileForm, stream: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="General, Science, Commerce, Arts..."
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Leadership Roles (comma separated)</label>
                  <input 
                    type="text"
                    value={profileForm.leadershipRoles}
                    onChange={e => setProfileForm({ ...profileForm, leadershipRoles: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Class Monitor, SPL..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Strengths (comma separated)</label>
                  <input 
                    type="text"
                    value={profileForm.strengths}
                    onChange={e => setProfileForm({ ...profileForm, strengths: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Coding, Sports, Public Speaking..."
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Areas of Growth (comma separated)</label>
                  <input 
                    type="text"
                    value={profileForm.areasOfGrowth}
                    onChange={e => setProfileForm({ ...profileForm, areasOfGrowth: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Time management, Handwriting..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Term Goals (comma separated)</label>
                <input 
                  type="text"
                  value={profileForm.termGoals}
                  onChange={e => setProfileForm({ ...profileForm, termGoals: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Score 90% in Math, Complete Science project..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Vocational Skills (comma separated)</label>
                  <input 
                    type="text"
                    value={profileForm.vocationalSkills}
                    onChange={e => setProfileForm({ ...profileForm, vocationalSkills: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Basic Electronics, Sewing, Coding..."
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Languages (e.g. Tamil:Native, English:Fluent)</label>
                  <input 
                    type="text"
                    value={profileForm.languages}
                    onChange={e => setProfileForm({ ...profileForm, languages: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Tamil:Native, English:Fluent..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Career Goal (HSC focus)</label>
                  <input 
                    type="text"
                    value={profileForm.careerGoal}
                    onChange={e => setProfileForm({ ...profileForm, careerGoal: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Engineering (Computer Science & AI), Medical..."
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Debate / Speech Role</label>
                  <input 
                    type="text"
                    value={profileForm.communicationRole}
                    onChange={e => setProfileForm({ ...profileForm, communicationRole: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Speaker / Lead, Member..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Teacher Remarks</label>
                  <textarea 
                    value={profileForm.teacherEndorsement}
                    onChange={e => setProfileForm({ ...profileForm, teacherEndorsement: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 h-16"
                    placeholder="Enter teacher feedback remarks..."
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Teacher Name</label>
                  <input 
                    type="text"
                    value={profileForm.teacherName}
                    onChange={e => setProfileForm({ ...profileForm, teacherName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Mrs. Abirami"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Parent Remarks</label>
                  <textarea 
                    value={profileForm.parentEndorsement}
                    onChange={e => setProfileForm({ ...profileForm, parentEndorsement: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 h-16"
                    placeholder="Enter parent feedback remarks..."
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Parent Name</label>
                  <input 
                    type="text"
                    value={profileForm.parentName}
                    onChange={e => setProfileForm({ ...profileForm, parentName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Mr. Balasubramanian"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Subject Interests (Middle school, comma separated)</label>
                  <input 
                    type="text"
                    value={profileForm.subjectInterests}
                    onChange={e => setProfileForm({ ...profileForm, subjectInterests: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Environmental Science, Math..."
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Talent Search / Entrance Prep (comma separated)</label>
                  <input 
                    type="text"
                    value={profileForm.talentPrep}
                    onChange={e => setProfileForm({ ...profileForm, talentPrep: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="NTSE Prep Active, JEE Mock Target Active..."
                  />
                </div>
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl font-bold shadow-lg"
                >
                  {isSaving ? "Saving..." : "Save Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Skill Modal */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass rounded-3xl border border-slate-700/60 max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Portfolio Skill</h3>
              <button onClick={() => setIsSkillModalOpen(false)} className="text-slate-400 hover:text-white"><CloseIcon /></button>
            </div>
            
            <form onSubmit={handleAddSkill} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Skill Name</label>
                <input 
                  type="text"
                  value={skillForm.name}
                  onChange={e => setSkillForm({ ...skillForm, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Python Programming, Painting"
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
                  onChange={e => setSkillForm({ ...skillForm, level: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Theme Gradient Color</label>
                <select 
                  value={skillForm.color}
                  onChange={e => setSkillForm({ ...skillForm, color: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="from-indigo-500 to-purple-500">Indigo to Purple</option>
                  <option value="from-emerald-500 to-teal-500">Emerald to Teal</option>
                  <option value="from-amber-500 to-orange-500">Amber to Orange</option>
                  <option value="from-rose-500 to-pink-500">Rose to Pink</option>
                  <option value="from-sky-500 to-blue-500">Sky to Blue</option>
                </select>
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl font-bold shadow-lg"
                >
                  {isSaving ? "Adding..." : "Add Skill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass rounded-3xl border border-slate-700/60 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Student Project</h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="text-slate-400 hover:text-white"><CloseIcon /></button>
            </div>
            
            <form onSubmit={handleAddProject} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Project Title</label>
                  <input 
                    type="text"
                    value={projectForm.title}
                    onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Science Model"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Category</label>
                  <input 
                    type="text"
                    value={projectForm.category}
                    onChange={e => setProjectForm({ ...projectForm, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Science Exhibition, Coding..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Completion Year</label>
                  <input 
                    type="text"
                    value={projectForm.date}
                    onChange={e => setProjectForm({ ...projectForm, date: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Icon Representation</label>
                  <select 
                    value={projectForm.image}
                    onChange={e => setProjectForm({ ...projectForm, image: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="code">Code Editor SVG</option>
                    <option value="cap">Academic Cap SVG</option>
                    <option value="trophy">Trophy SVG</option>
                    <option value="folder">Folder SVG</option>
                    <option value="sports">Ball SVG</option>
                    <option value="book">Open Book SVG</option>
                    <option value="bolt">Flash SVG</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Project Tags (comma separated)</label>
                <input 
                  type="text"
                  value={projectForm.tags}
                  onChange={e => setProjectForm({ ...projectForm, tags: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Physics, Arduino, C++..."
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Brief Description</label>
                <textarea 
                  value={projectForm.description}
                  onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 h-20"
                  placeholder="Explain what you built and how it functions..."
                  required
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl font-bold shadow-lg"
                >
                  {isSaving ? "Adding..." : "Add Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add Achievement Modal */}
      {isAchievementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass rounded-3xl border border-slate-700/60 max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Custom Honor / Award</h3>
              <button onClick={() => setIsAchievementModalOpen(false)} className="text-slate-400 hover:text-white"><CloseIcon /></button>
            </div>
            
            <form onSubmit={handleAddAchievement} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Honor Title</label>
                <input 
                  type="text"
                  value={achievementForm.title}
                  onChange={e => setAchievementForm({ ...achievementForm, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. 1st Place district Chess, Olympiad Gold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Award Year</label>
                  <input 
                    type="text"
                    value={achievementForm.year}
                    onChange={e => setAchievementForm({ ...achievementForm, year: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Award Icon</label>
                  <select 
                    value={achievementForm.icon}
                    onChange={e => setAchievementForm({ ...achievementForm, icon: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="trophy">Trophy</option>
                    <option value="cap">Graduation Cap</option>
                    <option value="star">Star Badge</option>
                    <option value="bolt">Flash Bolt</option>
                    <option value="sports">Athletics Ball</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Aesthetic Color Theme</label>
                <select 
                  value={achievementForm.color}
                  onChange={e => {
                    const val = e.target.value;
                    let bgVal = "border-slate-500/30 bg-slate-500/10";
                    if (val === "text-amber-400") bgVal = "border-amber-500/30 bg-amber-500/10";
                    else if (val === "text-emerald-400") bgVal = "border-emerald-500/30 bg-emerald-500/10";
                    else if (val === "text-indigo-400") bgVal = "border-indigo-500/30 bg-indigo-500/10";
                    else if (val === "text-rose-400") bgVal = "border-rose-500/30 bg-rose-500/10";
                    setAchievementForm({ ...achievementForm, color: val, bg: bgVal });
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="text-amber-400">Gold / Yellow Theme</option>
                  <option value="text-indigo-400">Indigo / Purple Theme</option>
                  <option value="text-emerald-400">Teal / Green Theme</option>
                  <option value="text-rose-400">Rose / Red Theme</option>
                </select>
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl font-bold shadow-lg"
                >
                  {isSaving ? "Adding..." : "Add Honor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </PortalLayout>
  );
}
