"use client";

import PortalLayout from "@/components/PortalLayout";
import { FlatIcon } from "@/components/FlatIcon";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { petLoad, RECORDS_KEY, DEFAULT_RECORDS } from "@/lib/petData";

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
  const [activeTab, setActiveTab] = useState("aboutme");
  const [data, setData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { data: session } = useSession();

  const searchParams = useSearchParams();
  const queryStudentId = searchParams.get("studentId");
  const loggedInRole = (session?.user as any)?.role || "STUDENT";
  const loggedInStudentId = (session?.user as any)?.studentId;
  
  const studentId = queryStudentId || loggedInStudentId || "demo-student";
  // Students have read-only access. Teachers and Headmasters can edit student portfolios.
  const isReadOnly = loggedInRole === "STUDENT" || (queryStudentId !== null && queryStudentId !== loggedInStudentId && loggedInRole !== "TEACHER" && loggedInRole !== "HEADMASTER");
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
  const [selectedTermFilter, setSelectedTermFilter] = useState<string>("All");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("All");

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
    if (typeof window !== 'undefined') {
      window.addEventListener("portfolio_updated", fetchPortfolio);
      window.addEventListener("storage", fetchPortfolio);
      window.addEventListener("focus", fetchPortfolio);
      const interval = setInterval(fetchPortfolio, 2000);
      return () => {
        window.removeEventListener("portfolio_updated", fetchPortfolio);
        window.removeEventListener("storage", fetchPortfolio);
        window.removeEventListener("focus", fetchPortfolio);
        clearInterval(interval);
      };
    }
  }, [session]);

  const fetchPortfolio = async () => {
    try {
      const targetStudentId = queryStudentId || (session?.user as any)?.studentId || "teenu";
      
      const emis = (session?.user as any)?.emisId || (session?.user as any)?.emis || "984522222211111";
      const roll = (session?.user as any)?.rollNumber || "HM100005";
      
      let localTeacherEdit: string | null = null;
      if (typeof window !== 'undefined') {
        const candidateKeys = [
          `portfolio_${targetStudentId}`,
          "portfolio_teenu",
          `portfolio_${emis}`,
          `portfolio_${roll}`,
          "portfolio_984522222211111",
          "portfolio_HM100005",
          "portfolio_demo-student"
        ];

        for (const key of candidateKeys) {
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              // Purge test script objects & static seed items so ONLY Kalai Teacher's live UI entries display
              if (Array.isArray(parsed?.projects)) {
                parsed.projects = parsed.projects.filter((p: any) => 
                  p.title !== "Solar Powered Irrigation System" && 
                  p.title !== "Robotics AI Rover" && 
                  p.title !== "tst" && 
                  p.title !== "Science mdel"
                );
              }
              if (Array.isArray(parsed?.achievements)) {
                parsed.achievements = parsed.achievements.filter((a: any) => 
                  a.title !== "1st Place - District STEM Hackathon 2026"
                );
              }
              if (Array.isArray(parsed?.skills)) {
                parsed.skills = parsed.skills.filter((s: any) => 
                  !s.name.toLowerCase().includes("phython")
                );
              }
              localTeacherEdit = JSON.stringify(parsed);
              break;
            } catch (e) {
              localTeacherEdit = stored;
              break;
            }
          }
        }
      }
      
      let portfolioObj: PortfolioData | null = null;

      if (localTeacherEdit) {
        try {
          portfolioObj = JSON.parse(localTeacherEdit);
        } catch (e) {
          console.error("Error parsing local portfolio edit", e);
        }
      }

      // If no local teacher edit, fetch from server API
      if (!portfolioObj) {
        try {
          const res = await fetch(`${API_BASE}/api/portfolio/${targetStudentId}`);
          const json = await res.json();
          if (json.success && json.data) {
            portfolioObj = json.data;
          }
        } catch (err) {
          console.log("Offline or server error fetching portfolio");
        }
      }

      // Default to Teenu Holy Cross Higher Secondary School dynamic profile if no server data or if server returns static "Test Student"
      if (!portfolioObj || portfolioObj.profile.name === "Test Student" || portfolioObj.profile.name === "Arjun K.") {
        portfolioObj = {
          id: "pf-teenu",
          studentId: "teenu",
          profile: {
            name: "Teenu",
            email: "teenu@holycross.edu.in",
            class: "10-A",
            section: "A",
            rollNumber: "HM100005",
            emisNumber: "984522222211111",
            schoolName: "Holy Cross Higher Secondary School",
            projectsCount: 2,
            awardsCount: 2,
            attendanceRate: 98,
            bio: "I am a dedicated Class 10-A student at Holy Cross Higher Secondary School. My goal is to excel in applied sciences, mathematics, and athletic competitions while maintaining strong academic performance.",
            stream: "Science Stream Explorer",
            strengths: ["Analytical Thinking", "Science Titration Practical", "100m Athletic Sprint", "Class Leadership"],
            areasOfGrowth: ["Time Management in Board Preps", "Advanced English Public Speaking"],
            termGoals: ["Score > 95% in SSLC Board Examination 2026", "Win District Gold Medal in Zonal Athletics"],
            leadershipRoles: ["Class 10-A Sports Captain", "Science Club Secretary"],
            vocationalSkills: ["Python Circuit Simulation", "Optics Lab Calibration"],
            languageFluency: { Tamil: "Native", English: "Fluent" },
            careerGoal: "Aeronautical Research Engineer & National Athlete",
            subjectInterests: ["Physics & Optics", "Chemistry Titration", "Mathematics & Geometry"],
            talentPrep: ["National Science Olympiad", "Zonal Athletics Meet"],
            communicationRole: "Class Representative & Science Club Speaker",
            teacherEndorsement: "Teenu is an exceptionally bright, disciplined student with outstanding academic curiosity and leadership skills. Regularly leads class science projects.",
            teacherName: "M. Kalai (Class 10-A Teacher)",
            parentEndorsement: "Teenu shows immense commitment to her daily studies, morning athletic drills, and science experiments. We are proud of her academic growth.",
            parentName: "DevanDevi (Parent)"
          },
          skills: [],
          projects: [],
          achievements: [],
          clubs: [
            { name: "Science & Innovation Club", role: "Secretary", category: "STEM", icon: null, themeColor: "teal", themeBg: null },
            { name: "Eco & Environment Club", role: "Active Member", category: "Eco", icon: null, themeColor: "emerald", themeBg: null },
            { name: "National Cadet Corps (NCC)", role: "Cadet Corporal", category: "Defense", icon: null, themeColor: "amber", themeBg: null }
          ],
          sports: null,
          socialActivities: [
            { id: "sa-1", activityType: "Plantation Drive", description: "Planted 50 saplings in school campus eco drive", date: "2026-01-15", points: 25, status: "APPROVED" },
            { id: "sa-2", activityType: "Clean Campus Movement", description: "Organized plastic-free awareness campaign", date: "2026-02-10", points: 20, status: "APPROVED" },
            { id: "sa-3", activityType: "Blood Donation Rally", description: "Volunteered in district blood donation drive awareness", date: "2026-03-05", points: 30, status: "APPROVED" }
          ],
          marksSummary: [],
          scholarships: [],
          labAttempts: [],
          readingProgress: [],
          schoolPress: []
        };
      }

      // If local teacher edit was found, strictly enforce projects, achievements & endorsements from the teacher portal
      if (localTeacherEdit && portfolioObj) {
        try {
          const parsedTeacherEdit = JSON.parse(localTeacherEdit);
          if (parsedTeacherEdit) {
            if (Array.isArray(parsedTeacherEdit.projects)) {
              portfolioObj.projects = parsedTeacherEdit.projects;
            }
            if (Array.isArray(parsedTeacherEdit.achievements)) {
              portfolioObj.achievements = parsedTeacherEdit.achievements;
            }
            if (Array.isArray(parsedTeacherEdit.skills)) {
              portfolioObj.skills = parsedTeacherEdit.skills;
            }
            if (parsedTeacherEdit.profile?.teacherEndorsement) {
              portfolioObj.profile.teacherEndorsement = parsedTeacherEdit.profile.teacherEndorsement;
            }
            if (parsedTeacherEdit.profile?.teacherName) {
              portfolioObj.profile.teacherName = parsedTeacherEdit.profile.teacherName;
            }
          }
        } catch (e) {}
      }

      if (portfolioObj) {
        setData(portfolioObj);
        setProfileForm({
          bio: portfolioObj.profile.bio || "",
          stream: portfolioObj.profile.stream || "",
          strengths: (portfolioObj.profile.strengths || []).join(", "),
          areasOfGrowth: (portfolioObj.profile.areasOfGrowth || []).join(", "),
          termGoals: (portfolioObj.profile.termGoals || []).join(", "),
          leadershipRoles: (portfolioObj.profile.leadershipRoles || []).join(", "),
          vocationalSkills: (portfolioObj.profile.vocationalSkills || []).join(", "),
          languages: Object.entries(portfolioObj.profile.languageFluency || {})
            .map(([k, v]) => `${k}:${v}`)
            .join(", "),
          careerGoal: portfolioObj.profile.careerGoal || "",
          subjectInterests: (portfolioObj.profile.subjectInterests || []).join(", "),
          talentPrep: (portfolioObj.profile.talentPrep || []).join(", "),
          communicationRole: portfolioObj.profile.communicationRole || "",
          teacherEndorsement: portfolioObj.profile.teacherEndorsement || "",
          teacherName: portfolioObj.profile.teacherName || "",
          parentEndorsement: portfolioObj.profile.parentEndorsement || "",
          parentName: portfolioObj.profile.parentName || ""
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

  const handleExportPDF = () => {
    if (!data) return;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }

    const projectsHTML = (data.projects || []).map(p => `
      <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 14px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #818cf8; background: rgba(99,102,241,0.15); padding: 3px 8px; border-radius: 4px;">${p.category}</span>
          <span style="font-size: 11px; color: #94a3b8; font-weight: 600;">${p.date}</span>
        </div>
        <h4 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 4px 0;">${p.title}</h4>
        <p style="font-size: 11px; color: #cbd5e1; line-height: 1.5; margin: 6px 0;">${p.description || 'No description provided.'}</p>
        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;">
          ${(p.tags || []).map(t => `<span style="font-size: 9px; font-weight: 700; color: #e2e8f0; background: #1e293b; padding: 2px 6px; border-radius: 4px;">#${t}</span>`).join('')}
        </div>
      </div>
    `).join('') || '<p style="font-size: 12px; color: #64748b;">No projects recorded.</p>';

    const achievementsHTML = (data.achievements || []).map(a => `
      <div style="background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.25); border-radius: 10px; padding: 12px; margin-bottom: 10px; display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 20px;">🏆</div>
        <div>
          <h5 style="font-size: 13px; font-weight: 700; color: #ffffff; margin: 0;">${a.title}</h5>
          <span style="font-size: 10px; font-weight: 700; color: #fbbf24; text-transform: uppercase;">Year: ${a.year}</span>
        </div>
      </div>
    `).join('') || '<p style="font-size: 12px; color: #64748b;">No awards recorded.</p>';

    const skillsHTML = (data.skills || []).map(s => `
      <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 10px 14px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #ffffff; margin-bottom: 6px;">
          <span>${s.name}</span>
          <span style="color: #818cf8;">${s.level}%</span>
        </div>
        <div style="width: 100%; height: 6px; background: #020617; border-radius: 999px; overflow: hidden;">
          <div style="height: 100%; width: ${s.level}%; background: linear-gradient(to right, #6366f1, #a855f7);"></div>
        </div>
      </div>
    `).join('') || '<p style="font-size: 12px; color: #64748b;">No custom skills logged.</p>';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Digital Portfolio - ${data.profile.name}</title>
          <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.1.0/uicons-regular-rounded/css/uicons-regular-rounded.css">
          <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.1.0/uicons-bold-rounded/css/uicons-bold-rounded.css">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              background-color: #020617;
              color: #f8fafc;
              margin: 0;
              padding: 24px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header-banner {
              background: linear-gradient(to right, #0f172a, #1e1b4b, #0f172a);
              border: 1px solid #312e81;
              border-radius: 16px;
              padding: 20px 24px;
              margin-bottom: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 16px;
            }
            .title { font-size: 20px; font-weight: 900; color: #ffffff; margin: 0 0 4px 0; }
            .subtitle { font-size: 11px; color: #a5b4fc; margin: 0; font-weight: 600; }
            .badge { background: rgba(99,102,241,0.2); border: 1px solid #6366f1; color: #a5b4fc; padding: 4px 10px; border-radius: 999px; font-size: 10px; font-weight: 800; display: inline-block; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .section-card { background: #0b0f19; border: 1px solid #1e293b; border-radius: 16px; padding: 18px; margin-bottom: 16px; }
            .section-title { font-size: 13px; font-weight: 800; color: #f8fafc; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #1e293b; padding-bottom: 8px; }
            .info-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
            .info-value { font-size: 12px; font-weight: 700; color: #ffffff; }
            @media (max-width: 768px) {
              body { padding: 12px; }
              .grid-2 { grid-template-columns: 1fr; gap: 12px; }
              .header-banner { flex-direction: column; text-align: center; align-items: center; }
            }
            @media print {
              body { background-color: #020617 !important; color: #f8fafc !important; padding: 0 !important; }
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div>
              <div class="badge"><i class="fi fi-rr-graduation-cap"></i> TAMIL NADU SCHOOL EDUCATION DEPARTMENT</div>
              <h1 class="title" style="margin-top: 6px;">${data.profile.name} — Digital Portfolio</h1>
              <p class="subtitle">${data.profile.schoolName || 'Holy Cross Higher Secondary School'} • Class ${data.profile.class}-${data.profile.section || 'A'}</p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 11px; color: #94a3b8; font-weight: 700;">EMIS: ${data.profile.emisNumber || '984522222211111'}</div>
              <div style="font-size: 11px; color: #94a3b8; font-weight: 700;">ROLL NO: ${data.profile.rollNumber || 'HM100005'}</div>
              <div style="font-size: 10px; color: #34d399; font-weight: 800; margin-top: 4px;"><i class="fi fi-rr-checkbox"></i> VERIFIED OFFICIAL RECORD</div>
            </div>
          </div>

          <div class="grid-2">
            <div>
              <div class="section-card">
                <div class="section-title" style="color: #818cf8;"><i class="fi fi-rr-id-card"></i> Student Overview & Profile</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                  <div>
                    <div class="info-label">Academic Stream</div>
                    <div class="info-value">${data.profile.stream || 'Science Stream Explorer'}</div>
                  </div>
                  <div>
                    <div class="info-label">Attendance Rate</div>
                    <div class="info-value" style="color: #34d399;">91% (Excellent Commitment)</div>
                  </div>
                </div>
                <div style="margin-bottom: 8px;">
                  <div class="info-label">Biography / Motto</div>
                  <p style="font-size: 11px; color: #cbd5e1; line-height: 1.5; margin: 4px 0;">"${data.profile.bio || 'Dedicated student striving for excellence in science and engineering.'}"</p>
                </div>
              </div>

              <div class="section-card">
                <div class="section-title" style="color: #34d399;"><i class="fi fi-rr-user-add"></i> Verified Teacher Endorsements</div>
                <div style="background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.2); border-radius: 10px; padding: 12px; margin-bottom: 10px;">
                  <span style="font-size: 10px; font-weight: 800; color: #34d399; text-transform: uppercase;">Class Teacher Endorsement</span>
                  <p style="font-size: 11px; color: #e2e8f0; font-style: italic; margin: 4px 0 6px 0;">"${data.profile.teacherEndorsement || 'Disciplined student with outstanding academic curiosity and analytical problem solving skills.'}"</p>
                  <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-align: right; display: block;">— ${data.profile.teacherName || 'Kalai Teacher'} (Class Teacher) [VERIFIED]</span>
                </div>
              </div>

              <div class="section-card">
                <div class="section-title" style="color: #fbbf24;"><i class="fi fi-rr-running"></i> Sports & PT Master Assessment (Shiva Master)</div>
                <div style="background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2); border-radius: 10px; padding: 12px;">
                  <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; color: #fbbf24; margin-bottom: 6px;">
                    <span>PET FITNESS INDEX</span>
                    <span>78% (Healthy — Fit)</span>
                  </div>
                  <p style="font-size: 11px; color: #e2e8f0; font-style: italic; margin: 4px 0 6px 0;">"Teenu exhibits regular attendance in physical training (8 hrs/week), strong flexibility (84%), and high sprint speed (80%). Recommended for Zonal & State athletic trials."</p>
                  <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-align: right; display: block;">— Shiva (Head PET Master, Holy Cross Higher Secondary School)</span>
                </div>
              </div>
            </div>

            <div>
              <div class="section-card">
                <div class="section-title" style="color: #818cf8;"><i class="fi fi-rr-folder"></i> Projects & Innovations</div>
                ${projectsHTML}
              </div>

              <div class="section-card">
                <div class="section-title" style="color: #a855f7;"><i class="fi fi-rr-bolt"></i> Skill Matrix Profile</div>
                ${skillsHTML}
              </div>

              <div class="section-card">
                <div class="section-title" style="color: #fbbf24;"><i class="fi fi-rr-trophy"></i> Honors & Custom Awards</div>
                ${achievementsHTML}
              </div>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
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
            onClick={() => setActiveTab("aboutme")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === "aboutme" ? "bg-indigo-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
          >
            <FlatIcon name="identity" className="w-5 h-5" /> About Me
          </button>
          <button 
            onClick={() => setActiveTab("mystudies")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === "mystudies" ? "bg-indigo-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
          >
            <FlatIcon name="learning" className="w-5 h-5" /> My Studies
          </button>
          <button 
            onClick={() => setActiveTab("activities")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === "activities" ? "bg-indigo-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
          >
            <FlatIcon name="experience" className="w-5 h-5" /> Activities
          </button>
          <button 
            onClick={() => setActiveTab("myprojects")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === "myprojects" ? "bg-indigo-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
          >
            <FlatIcon name="portfoliotab" className="w-5 h-5" /> My Projects
          </button>
          <button 
            onClick={() => setActiveTab("myjourney")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === "myjourney" ? "bg-indigo-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
          >
            <FlatIcon name="growth" className="w-5 h-5" /> My Journey
          </button>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2">
            <ShareIcon /> Share Portfolio
          </button>
          <button 
            onClick={handleExportPDF}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold text-white transition-colors shadow-lg flex items-center gap-2"
          >
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

          {/* SWOT Growth Mindset Section — only show if student has real data */}
          {(data.profile.strengths.length > 0 || data.profile.areasOfGrowth.length > 0 || data.profile.termGoals.length > 0) && (
            <div className="glass rounded-3xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CompassIcon className="w-4 h-4 text-rose-400" /> Growth &amp; SWOT
                </h3>
                {!isReadOnly && <button onClick={() => setIsProfileModalOpen(true)} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-black uppercase">Edit</button>}
              </div>

              <div className="space-y-4">
                {data.profile.strengths.length > 0 && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold block mb-1">My Strengths</span>
                    <div className="flex flex-wrap gap-1.5">
                      {data.profile.strengths.map((str, idx) => (
                        <span key={idx} className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{str}</span>
                      ))}
                    </div>
                  </div>
                )}

                {data.profile.areasOfGrowth.length > 0 && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold block mb-1">Areas of Growth</span>
                    <div className="flex flex-wrap gap-1.5">
                      {data.profile.areasOfGrowth.map((gro, idx) => (
                        <span key={idx} className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{gro}</span>
                      ))}
                    </div>
                  </div>
                )}

                {data.profile.termGoals.length > 0 && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold block mb-1">Active Term Goals</span>
                    <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                      {data.profile.termGoals.map((goa, idx) => (
                        <li key={idx}>{goa}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Panel: Dynamic Tab Details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Profile & Goals Details Tab */}
          {activeTab === "aboutme" && (
            <div className="space-y-6">
              
              {/* Card 1: Personal Profile */}
              <div className="glass rounded-3xl p-6 border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CompassIcon className="w-5 h-5 text-indigo-400" /> Personal Profile
                  </h3>
                  <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    Basic Student Information
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Name:</span>
                    <span className="font-bold text-white">{data.profile.name}</span>
                  </div>
                  <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">EMIS ID:</span>
                    <span className="font-mono font-bold text-amber-400">{data.profile.emisNumber}</span>
                  </div>
                  <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Roll Number:</span>
                    <span className="font-mono font-bold text-slate-200">{data.profile.rollNumber}</span>
                  </div>
                  <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Class & Section:</span>
                    <span className="font-bold text-teal-400">Class {data.profile.class}-{data.profile.section}</span>
                  </div>
                  <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-800 flex justify-between items-center col-span-1 md:col-span-2">
                    <span className="text-slate-400">School:</span>
                    <span className="font-semibold text-slate-300">{data.profile.schoolName}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Goals */}
              <div className="glass rounded-3xl p-6 border border-slate-700/50">
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-amber-400" /> Academic & Personal Goals
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Current academic and personal development objectives set for this term:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(data.profile.termGoals && data.profile.termGoals.length > 0 
                    ? data.profile.termGoals 
                    : ["Improve Mathematics", "Score above 90%", "Participate in Science Fair", "Become School Captain"]
                  ).map((goal, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
                      <span className="text-xs font-bold text-slate-200">{goal}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Aspirations */}
              <div className="glass rounded-3xl p-6 border border-slate-700/50">
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <FolderIcon className="w-5 h-5 text-purple-400" /> Future Aspirations
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Career goals and future achievements targeted by the student:
                </p>

                <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-4 rounded-2xl border border-purple-500/20 space-y-3">
                  <div className="flex items-center gap-3">
                    <FlatIcon name="engineer" className="w-8 h-8 shrink-0" />
                    <div>
                      <span className="text-[10px] text-purple-400 uppercase font-black tracking-wider block">Target Career Path</span>
                      <h4 className="text-sm font-black text-white">{data.profile.careerGoal || "Engineer / Computer Scientist"}</h4>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {["Doctor", "Engineer", "IAS Officer", "Teacher", "Sportsperson", "Entrepreneur"].map((asp, idx) => {
                      const isChosen = (data.profile.careerGoal || "Engineer").toLowerCase().includes(asp.toLowerCase());
                      return (
                        <span key={idx} className={`text-[10px] font-extrabold px-3 py-1 rounded-xl border ${
                          isChosen
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm"
                            : "bg-slate-900/40 text-slate-400 border-slate-800"
                        }`}>
                          {isChosen ? `✓ ${asp}` : asp}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Card 4: Endorsements */}
              <div className="glass rounded-3xl p-6 border border-slate-700/50">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <ChatIcon className="w-5 h-5 text-emerald-400" /> Verified Endorsements
                </h3>
                <div className="space-y-4">
                  <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      "{data.profile.teacherEndorsement || "Excellent leadership skills. Very disciplined and responsible. Shows strong interest in science and actively participates in school activities."}"
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-emerald-400 font-bold uppercase pt-1">
                      <span>— {data.profile.teacherName} (Class Teacher)</span>
                      <span className="bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">VERIFIED TEACHER</span>
                    </div>
                  </div>

                  {data.profile.parentEndorsement && (
                    <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        "{data.profile.parentEndorsement}"
                      </p>
                      <div className="flex justify-between items-center text-[10px] text-purple-400 font-bold uppercase pt-1">
                        <span>— {data.profile.parentName} (Parent)</span>
                        <span className="bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">VERIFIED PARENT</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 5: Leadership & Responsibilities */}
              <div className="glass rounded-3xl p-6 border border-slate-700/50">
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-lg">👥</span> Leadership & Responsibilities
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Official leadership roles and positions held by the student in school:
                </p>

                <div className="space-y-2">
                  {(data.profile.leadershipRoles && data.profile.leadershipRoles.length > 0 
                    ? data.profile.leadershipRoles 
                    : ["Class Representative", "Science Club Secretary", "Sports House Captain", "Eco Club Member"]
                  ).map((role, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
                      <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                        ★
                      </span>
                      <span className="text-xs font-bold text-slate-200">{role}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 6: Languages Known */}
              <div className="glass rounded-3xl p-6 border border-slate-700/50">
                <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-lg">🌐</span> Languages Known
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Languages known by student and fluency level:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(() => {
                    let langList: string[] = [];
                    const p = data.profile as any;
                    if (typeof p.languageFluency === "object" && p.languageFluency && Object.keys(p.languageFluency).length > 0) {
                      langList = Object.entries(p.languageFluency).map(([l, f]) => `${l} (${f})`);
                    } else if (Array.isArray(p.languages) && p.languages.length > 0) {
                      langList = p.languages;
                    } else {
                      langList = ["Tamil (Native / Read & Write)", "English (Fluent / Read & Write)", "Hindi (Basic / Learning)"];
                    }
                    return langList.map((langItem, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
                        <span className="text-sm">🗣️</span>
                        <span className="text-xs font-bold text-teal-300">{langItem}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

            </div>
          )}

          {/* Academic & Lab Achievements Tab */}
          {activeTab === "mystudies" && (() => {
            const rawMarksList = data.marksSummary && data.marksSummary.length > 0 ? data.marksSummary : [
              // Quarterly Exam
              { subject: "Tamil", examName: "Quarterly Exam", marksObtained: 88, maxMarks: 100, remarks: "Good literature expression" },
              { subject: "English", examName: "Quarterly Exam", marksObtained: 85, maxMarks: 100, remarks: "Strong reading comprehension" },
              { subject: "Mathematics", examName: "Quarterly Exam", marksObtained: 90, maxMarks: 100, remarks: "Solid algebra foundation" },
              { subject: "Science", examName: "Quarterly Exam", marksObtained: 88, maxMarks: 100, remarks: "Active lab participation" },
              { subject: "Social Science", examName: "Quarterly Exam", marksObtained: 84, maxMarks: 100, remarks: "Needs more map practice" },

              // Half Yearly Exam
              { subject: "Tamil", examName: "Half Yearly Exam", marksObtained: 90, maxMarks: 100, remarks: "Improved essay writing" },
              { subject: "English", examName: "Half Yearly Exam", marksObtained: 86, maxMarks: 100, remarks: "Good grammar accuracy" },
              { subject: "Mathematics", examName: "Half Yearly Exam", marksObtained: 92, maxMarks: 100, remarks: "Consistent geometry scores" },
              { subject: "Science", examName: "Half Yearly Exam", marksObtained: 89, maxMarks: 100, remarks: "Great physics model" },
              { subject: "Social Science", examName: "Half Yearly Exam", marksObtained: 85, maxMarks: 100, remarks: "Better historical timeline grasp" },

              // Annual Exam 2026
              { subject: "Tamil", examName: "Annual Exam 2026", marksObtained: 92, maxMarks: 100, remarks: "Outstanding literature grasp" },
              { subject: "English", examName: "Annual Exam 2026", marksObtained: 88, maxMarks: 100, remarks: "Fluent vocabulary & grammar" },
              { subject: "Mathematics", examName: "Annual Exam 2026", marksObtained: 95, maxMarks: 100, remarks: "Excellent problem solving" },
              { subject: "Science", examName: "Annual Exam 2026", marksObtained: 90, maxMarks: 100, remarks: "Great lab demonstration" },
              { subject: "Social Science", examName: "Annual Exam 2026", marksObtained: 86, maxMarks: 100, remarks: "Good analytical understanding" },

              // Board Model Prep
              { subject: "Mathematics", examName: "SSLC Board Model Prep Test", marksObtained: 96, maxMarks: 100, remarks: "Top scorer in Board Model Test" },
              { subject: "Science", examName: "SSLC Board Model Prep Test", marksObtained: 92, maxMarks: 100, remarks: "Strong formula retention" },
              { subject: "Tamil", examName: "SSLC Board Model Prep Test", marksObtained: 94, maxMarks: 100, remarks: "Flawless grammar section" },
              { subject: "English", examName: "SSLC Board Model Prep Test", marksObtained: 90, maxMarks: 100, remarks: "High score in essay composition" },
              { subject: "Social Science", examName: "SSLC Board Model Prep Test", marksObtained: 88, maxMarks: 100, remarks: "Accurate map location identification" },

              // Mock & Quiz Tests
              { subject: "English", examName: "English Mock & Quiz Test", marksObtained: 92, maxMarks: 100, remarks: "High reading comprehension score" },
              { subject: "Mathematics", examName: "Mathematics AI Mock Quiz", marksObtained: 98, maxMarks: 100, remarks: "Perfect score in Geometry & Trig" },
              { subject: "Science", examName: "Science Mock & Quiz Test", marksObtained: 95, maxMarks: 100, remarks: "Great physics & chemistry responses" },
              { subject: "Tamil", examName: "Tamil Literature Mock Quiz", marksObtained: 91, maxMarks: 100, remarks: "Prompt poetry analysis response" },
              { subject: "Social Science", examName: "Social Science Diagnostic Mock", marksObtained: 87, maxMarks: 100, remarks: "Good historical timeline recall" },

              // Science Practical & Lab STEM Tests
              { subject: "Science", examName: "Physics Circuit Lab Practical", marksObtained: 96, maxMarks: 100, remarks: "Ohm's law verification & circuit assembly" },
              { subject: "Science", examName: "Chemistry Titration Practical", marksObtained: 94, maxMarks: 100, remarks: "Acid-base indicator titration accuracy" },
              { subject: "Science", examName: "Botany Microscope Specimen Test", marksObtained: 95, maxMarks: 100, remarks: "Stomata slide preparation & cell structure labeling" },
              { subject: "Science", examName: "AI Science Campus 3D Optics Task", marksObtained: 98, maxMarks: 100, remarks: "Completed Lens & Refraction 3D simulation" },
              { subject: "Science", examName: "Annual Practical Viva Test", marksObtained: 92, maxMarks: 100, remarks: "High score in lab viva & experiment logbook" }
            ];

            const totalObtained = rawMarksList.reduce((acc, curr) => acc + curr.marksObtained, 0);
            const totalMax = rawMarksList.reduce((acc, curr) => acc + curr.maxMarks, 0);
            const overallPercentage = Math.round((totalObtained / totalMax) * 100);

            const sortedMarks = [...rawMarksList].sort((a, b) => (b.marksObtained / b.maxMarks) - (a.marksObtained / a.maxMarks));
            const highestSub = sortedMarks[0];
            const lowestSub = sortedMarks[sortedMarks.length - 1];

            return (
              <div className="space-y-6">
                
                {/* Exam Growth & Term Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { term: "Quarterly Exam", pct: "87%", label: "Term 1 Average", color: "text-blue-400 border-blue-500/20 bg-blue-500/10" },
                    { term: "Half Yearly Exam", pct: "88.4%", label: "Term 2 Average", color: "text-teal-400 border-teal-500/20 bg-teal-500/10" },
                    { term: "Annual Exam 2026", pct: "90.2%", label: "Final Term (Growth 📈)", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" }
                  ].map((tCard, tIdx) => (
                    <div key={tIdx} className={`p-4 rounded-2xl border ${tCard.color} space-y-1`}>
                      <span className="text-[10px] font-extrabold uppercase opacity-80 block">{tCard.term}</span>
                      <div className="flex justify-between items-baseline">
                        <span className="text-2xl font-black">{tCard.pct}</span>
                        <span className="text-[10px] font-bold opacity-75">{tCard.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Science Marks Calculation Guidance Card */}
                <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
                      <i className="fi fi-rr-flask text-lg"></i>
                    </div>
                    <div>
                      <span className="font-extrabold text-white text-sm block">How Science & Practical Marks Are Calculated & Updated</span>
                      <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">
                        Science evaluation combines <strong>Written Term Theory (70%)</strong>, <strong>School Lab Practicals (20%)</strong>, and <strong>AI Science Campus STEM Tasks (10%)</strong>. Scores are automatically fetched from teacher assessment inputs and online lab task submissions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Academic Marks Summary */}
                <div className="glass rounded-3xl p-6 border border-slate-700/50 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <i className="fi fi-rr-graduation-cap text-indigo-400 text-lg"></i>
                        All Exams & Science Lab Percentage History
                      </h3>
                      <p className="text-xs text-slate-400">
                        Quarterly, Half Yearly, Annual Exam & Science Practical score percentages for all subjects
                      </p>
                    </div>

                    {/* Overall Aggregate KPI Badge (Percentage Only) */}
                    <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl shrink-0">
                      <div className="text-center px-3">
                        <span className="block text-[10px] text-amber-400 font-extrabold uppercase tracking-wide">Overall Academic Aggregate</span>
                        <span className="text-2xl font-black text-amber-400">{overallPercentage}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Subject Performance Focus & Low-Mark Note */}
                  <div className="bg-slate-900/50 p-4.5 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="text-xs font-extrabold text-amber-400 flex items-center gap-2">
                      <i className="fi fi-rr-chart-pie text-amber-400 text-sm"></i>
                      Subject Performance & Focus Analysis
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Highest Subject */}
                      <div className="bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase text-emerald-400 block">🏆 Highest Scoring Subject</span>
                          <span className="font-bold text-white text-sm">{highestSub.subject} ({highestSub.examName})</span>
                        </div>
                        <span className="font-mono font-black text-emerald-400 text-base">{Math.round((highestSub.marksObtained/highestSub.maxMarks)*100)}%</span>
                      </div>

                      {/* Lowest Subject */}
                      <div className="bg-rose-500/10 p-3.5 rounded-xl border border-rose-500/20 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase text-rose-400 block">⚠️ Lowest Scoring Subject (Needs Focus)</span>
                          <span className="font-bold text-white text-sm">{lowestSub.subject} ({lowestSub.examName})</span>
                        </div>
                        <span className="font-mono font-black text-rose-400 text-base">{Math.round((lowestSub.marksObtained/lowestSub.maxMarks)*100)}%</span>
                      </div>
                    </div>

                    {/* Analysis Note */}
                    <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 text-xs text-slate-200">
                      <span className="font-bold text-amber-400 block mb-0.5">📌 Performance Recommendation Note:</span>
                      <p className="text-[11px] leading-relaxed">
                        Notice: <strong>{lowestSub.subject}</strong> ({Math.round((lowestSub.marksObtained/lowestSub.maxMarks)*100)}%) is currently your lowest scoring subject compared to <strong>{highestSub.subject}</strong> ({Math.round((highestSub.marksObtained/highestSub.maxMarks)*100)}%). Focus on revision and practice exercises in {lowestSub.subject}.
                      </p>
                    </div>
                  </div>

                  {/* Filter Controls Bar */}
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-extrabold text-amber-400 flex items-center gap-1.5 mr-1">
                        <i className="fi fi-rr-filter text-amber-400"></i> Exam Category:
                      </span>
                      {[
                        { label: `All Test Results (${rawMarksList.length})`, val: "All" },
                        { label: "🔬 Science & Lab Tests", val: "Science" },
                        { label: "Quarterly Exam", val: "Quarterly" },
                        { label: "Half Yearly Exam", val: "Half" },
                        { label: "Annual Exam 2026", val: "Annual" },
                        { label: "Board Model Prep", val: "Board" },
                        { label: "Mock & Quiz Tests", val: "Mock" }
                      ].map((tFilter, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => setSelectedTermFilter(tFilter.val)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${
                            selectedTermFilter === tFilter.val
                              ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md"
                              : "bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-500/40"
                          }`}
                        >
                          {tFilter.label}
                        </button>
                      ))}
                    </div>

                    {/* Subject Filter Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 shrink-0">Subject:</span>
                      <select
                        value={selectedSubjectFilter}
                        onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                        className="bg-slate-950 text-teal-300 font-bold border border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="All">All Subjects</option>
                        {Array.from(new Set(rawMarksList.map(m => m.subject))).map((subj, sIdx) => (
                          <option key={sIdx} value={subj}>{subj}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Filtered All Term Exams Marks Percentage Table */}
                  {(() => {
                    const filteredList = rawMarksList.filter(mark => {
                      const matchesTerm = selectedTermFilter === "All" ||
                        mark.examName.toLowerCase().includes(selectedTermFilter.toLowerCase()) ||
                        mark.subject.toLowerCase().includes(selectedTermFilter.toLowerCase());
                      const matchesSubject = selectedSubjectFilter === "All" || mark.subject.toLowerCase().includes(selectedSubjectFilter.toLowerCase());
                      return matchesTerm && matchesSubject;
                    });

                    return (
                      <div className="overflow-x-auto border border-slate-800 rounded-2xl">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-900/80 text-slate-400 text-[11px] font-extrabold uppercase border-b border-slate-800">
                              <th className="py-3.5 px-4">Subject</th>
                              <th className="py-3.5 px-4">Assessment Term</th>
                              <th className="py-3.5 px-4 text-center">Score Percentage (%)</th>
                              <th className="py-3.5 px-4">Remarks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/40 text-xs">
                            {filteredList.length > 0 ? (
                              filteredList.map((mark, idx) => {
                                const pct = Math.round((mark.marksObtained / mark.maxMarks) * 100);
                                const isLowest = mark.subject === lowestSub.subject && mark.examName === lowestSub.examName;
                                return (
                                  <tr key={idx} className={`hover:bg-slate-900/30 transition-colors ${isLowest ? "bg-rose-500/5" : ""}`}>
                                    <td className="py-3.5 px-4 text-white font-bold flex items-center gap-2">
                                      {mark.subject}
                                      {isLowest && (
                                        <span className="text-[9px] bg-rose-500/20 text-rose-400 font-extrabold px-2 py-0.5 rounded border border-rose-500/30 uppercase">
                                          Needs Focus
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-400 font-medium">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        mark.examName.includes("Quarterly") ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                        mark.examName.includes("Half") ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" :
                                        mark.examName.includes("Board") ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                                        mark.examName.includes("Mock") ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                                        "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                      }`}>
                                        {mark.examName}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                      <span className={`px-3 py-1 rounded-xl font-mono text-xs font-black ${
                                        pct >= 90 ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" :
                                        pct >= 75 ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" :
                                        "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                      }`}>
                                        {pct}%
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-slate-300 italic">{mark.remarks || "Good performance"}</td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={4} className="py-8 text-center text-slate-500 text-xs italic">
                                  No exam percentage records match the selected term or subject filter.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>

              {/* Science Lab & Practical Experiments (High School & HSC Only) */}
              {extractClassNum(data.profile.class) > 8 && (() => {
                const labList = data.labAttempts && data.labAttempts.length > 0 ? data.labAttempts : [
                  { experimentTitle: "Ohm's Law Verification & Circuit Assembly", score: 96, completed: true, date: "2026-02-15" },
                  { experimentTitle: "Acid-Base Neutralization Titration", score: 94, completed: true, date: "2026-02-18" },
                  { experimentTitle: "Plant Cell Stomata Slide Observation", score: 95, completed: true, date: "2026-03-01" },
                  { experimentTitle: "3D Optics Refraction Simulation", score: 98, completed: true, date: "2026-03-10" }
                ];
                return (
                  <div className="glass rounded-3xl p-6 border border-slate-700/50">
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <BoltIcon className="w-5 h-5 text-emerald-400" /> Science Lab & Experiments
                    </h3>
                    <div className="space-y-3">
                      {labList.map((la, idx) => (
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
                    </div>
                  </div>
                );
              })()}



            </div>
          );
        })()}

          {/* Co-curricular & Experience Tab */}
          {activeTab === "activities" && (
            <div className="space-y-6">
              
              {/* 1. Physical Education (PT / PET) Performance & Fitness Card */}
              {(() => {
                const petRecords = petLoad(RECORDS_KEY, DEFAULT_RECORDS);
                const teenuRecord = petRecords.find(r => r.name.toLowerCase().includes("teenu") || r.id === "fr-9") || {
                  name: "Teenu",
                  class: "10A",
                  heightCm: 145,
                  weightKg: 40,
                  fitnessScore: 78,
                  assessment: { endurance: 76, strength: 72, flexibility: 84, speed: 80, lastAssessed: "2026-06-20" },
                  activityLevel: "Active",
                  weeklyActivityHrs: 8,
                  health: { restingHeartRate: 70, bloodGroup: "O+", vision: "Normal", lastCheckup: "2026-06-10" },
                  mentalHealth: "Good",
                  sport: "Athletics",
                  status: "Healthy — Fit"
                };

                const sportsData = {
                  stats: [
                    { label: "PET Fitness Score Index", value: `${teenuRecord.fitnessScore}% (${teenuRecord.status})` },
                    { label: "Physical Height / Weight", value: `${teenuRecord.heightCm} cm / ${teenuRecord.weightKg} kg` },
                    { label: "Resting HR & Blood", value: `${teenuRecord.health.restingHeartRate} bpm (${teenuRecord.health.bloodGroup})` },
                    { label: "Weekly PT Regimen", value: `${teenuRecord.weeklyActivityHrs} hrs / week (${teenuRecord.activityLevel})` }
                  ],
                  teams: [
                    { name: "Holy Cross U-17 Athletics Squad", role: "Lead 100m Sprinter", match: "District Meet" },
                    { name: `Class ${data.profile.class} Sports & Kho-Kho Team`, role: "Team Captain", match: "Intra-School League" }
                  ],
                  events: [
                    { title: "Zonal Athletics Meet (100m Sprint)", date: "2026-06-15", type: "Gold Medal (Certificate Verified)" },
                    { title: "District Kabaddi Championship (U-17)", date: "2026-07-18", type: "District Squad (Upcoming)" },
                    { title: "Inter-House Football League", date: "2026-07-10", type: "Active Player" }
                  ]
                };

                return (
                  <div className="glass rounded-3xl p-6 border border-slate-700/50 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <i className="fi fi-rr-running text-amber-400 text-xl"></i>
                          Physical Education (PT / PET) & Athletic Performance
                        </h3>
                        <p className="text-xs text-slate-400">
                          Track performance, physical fitness index, and Physical Education Teacher (PET) evaluation
                        </p>
                      </div>
                      <div className="bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 rounded-2xl shrink-0 text-center">
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">PET Fitness Index</span>
                        <span className="text-xl font-black text-amber-400">{teenuRecord.fitnessScore}% ({teenuRecord.status})</span>
                      </div>
                    </div>

                    {/* Dynamic Fitness Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {sportsData.stats.map((fMetric, fIdx) => (
                        <div key={fIdx} className="p-4 rounded-2xl border text-amber-400 border-amber-500/20 bg-amber-500/10 space-y-1">
                          <span className="text-[10px] font-extrabold uppercase opacity-80 block">{fMetric.label}</span>
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm font-black text-white">{fMetric.value}</span>
                            <span className="text-[9px] font-bold uppercase opacity-80 text-emerald-400">PET VERIFIED</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Component Assessment Breakdown */}
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <span className="text-[11px] font-extrabold text-indigo-400 uppercase block tracking-wider">📊 PT Assessment Component Ratings</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                          <span className="text-[10px] text-slate-400 block font-bold">Endurance</span>
                          <span className="font-mono text-emerald-400 font-extrabold">{teenuRecord.assessment.endurance} / 100</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                          <span className="text-[10px] text-slate-400 block font-bold">Muscle Strength</span>
                          <span className="font-mono text-teal-400 font-extrabold">{teenuRecord.assessment.strength} / 100</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                          <span className="text-[10px] text-slate-400 block font-bold">Flexibility</span>
                          <span className="font-mono text-amber-400 font-extrabold">{teenuRecord.assessment.flexibility} / 100</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                          <span className="text-[10px] text-slate-400 block font-bold">Sprint Speed</span>
                          <span className="font-mono text-indigo-400 font-extrabold">{teenuRecord.assessment.speed} / 100</span>
                        </div>
                      </div>
                    </div>

                    {/* Represented Sports Teams & PT Events */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <span className="text-[11px] font-extrabold text-amber-400 uppercase block tracking-wider">🏆 Represented Sports Teams & Roles</span>
                        <div className="space-y-2 text-xs">
                          {sportsData.teams.map((tm, tIdx) => (
                            <div key={tIdx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex justify-between items-center">
                              <div>
                                <span className="font-bold text-white block">{tm.name}</span>
                                <span className="text-[10px] text-slate-400">Role: {tm.role}</span>
                              </div>
                              <span className="text-[10px] font-black text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded">{tm.match}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <span className="text-[11px] font-extrabold text-teal-400 uppercase block tracking-wider">🏅 PT Events & Athletic Records</span>
                        <div className="space-y-2 text-xs">
                          {sportsData.events.map((ev, eIdx) => (
                            <div key={eIdx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex justify-between items-center">
                              <div>
                                <span className="font-bold text-white block">{ev.title}</span>
                                <span className="text-[10px] text-slate-400">{ev.date}</span>
                              </div>
                              <span className="text-[10px] font-black text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded">{ev.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* PET Teacher Endorsement */}
                    <div className="bg-slate-900/50 p-4.5 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-amber-400 flex items-center gap-1.5">
                          <i className="fi fi-rr-user-add text-amber-400"></i> Physical Education Teacher (PET) Remarks:
                        </span>
                        <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">VERIFIED PET DASHBOARD RECORD</span>
                      </div>
                      <p className="text-xs text-slate-200 italic leading-relaxed">
                        "{teenuRecord.name} exhibits regular attendance in physical training ({teenuRecord.weeklyActivityHrs} hrs/week), strong flexibility ({teenuRecord.assessment.flexibility}%), and high sprint speed ({teenuRecord.assessment.speed}%). Recommended for Zonal & State athletic trials."
                      </p>
                      <span className="text-[11px] font-bold text-slate-400 block text-right">— Shiva (Head PET Master, Holy Cross Higher Secondary School)</span>
                    </div>
                  </div>
                );
              })()}



              {/* Registered School Clubs */}
              <div className="glass rounded-3xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-teal-400" /> Registered Clubs & Societies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(data.clubs && data.clubs.length > 0 ? data.clubs : [
                    { name: "Science & Innovation Club", role: "Secretary", category: "STEM", themeColor: "teal" },
                    { name: "Eco & Environment Club", role: "Active Member", category: "Eco", themeColor: "emerald" },
                    { name: "Literary & Drama Society", role: "Lead Speaker", category: "Cultural", themeColor: "indigo" },
                    { name: "National Cadet Corps (NCC)", role: "Cadet Corporal", category: "Defense", themeColor: "amber" }
                  ]).map((club, idx) => (
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
                </div>
              </div>

              {/* Social Community Services (NSS/NCC) */}
              <div className="glass rounded-3xl p-6 border border-slate-700/50">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-emerald-400" /> Social & Community Services (NCC/NSS)
                </h3>
                <div className="space-y-3">
                  {(data.socialActivities && data.socialActivities.length > 0 ? data.socialActivities : [
                    { activityType: "Plantation Drive", description: "Planted 50 saplings in school campus eco drive", date: "2026-01-15", points: 25, status: "APPROVED" },
                    { activityType: "Clean Campus Movement", description: "Organized plastic-free awareness campaign", date: "2026-02-10", points: 20, status: "APPROVED" }
                  ]).map((act, idx) => (
                    <div key={idx} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {act.activityType}
                        </span>
                        <p className="text-xs font-bold text-white mt-1">{act.description}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{act.date}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-amber-400 block">+{act.points} Pts</span>
                        <span className="text-[9px] uppercase font-bold text-emerald-400">{act.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Projects & Achievements Tab */}
          {activeTab === "myprojects" && (
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

            </div>
          )}

          {/* Academic Timeline & Honors Tab */}
          {activeTab === "myjourney" && (
            <div className="space-y-6">
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
