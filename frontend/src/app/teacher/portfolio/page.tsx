"use client";

import React, { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { FlatIcon } from "@/components/FlatIcon";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import {
  Search,
  User,
  Filter,
  Sparkles,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Plus,
  Trash2,
  Edit3,
  ChevronRight,
  ShieldCheck,
  FolderOpen,
  GraduationCap,
  Activity,
  Heart,
  Star,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Target,
  FlaskConical,
  Trophy,
  Zap,
  CheckCircle2,
  Users
} from "lucide-react";
import { petLoad, RECORDS_KEY, DEFAULT_RECORDS, AWARDS_KEY, DEFAULT_AWARDS, EVENTS_KEY, DEFAULT_EVENTS } from "@/lib/petData";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface StudentSummary {
  id: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string;
  emis: string;
  attendance: number;
  avgGrade: string;
  avatarLetter: string;
  avatarBg: string;
}

interface PortfolioData {
  id: string;
  studentId: string;
  profile: {
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
    careerGoal: string;
    subjectInterests: string[];
    talentPrep: string[];
    communicationRole: string;
    teacherEndorsement: string;
    teacherName: string;
    parentEndorsement: string;
    parentName: string;
  };
  skills: { id: string; name: string; level: number; color: string }[];
  projects: { id: string; title: string; category: string; date: string; image: string; tags: string[]; description: string }[];
  achievements: { id: string; title: string; year: string; icon: string; color: string; bg: string }[];
  marksSummary?: { subject: string; examName: string; marksObtained: number; maxMarks: number; remarks: string | null }[];
  sports?: {
    stats: { label: string; value: string }[];
    teams: { name: string; role: string; match: string }[];
    events: { title: string; date: string; type: string }[];
  } | null;
  clubs?: { name: string; role: string; category: string; themeColor: string }[];
  socialActivities?: { activityType: string; description: string; date: string; points: number; status: string }[];
}

export default function TeacherDigitalPortfolioPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const teacherId = (session?.user as any)?.id;
  const loggedInRole = (session?.user as any)?.role || "TEACHER";
  const isHeadmaster = loggedInRole === "HEADMASTER";
  const teacherName = session?.user?.name || (isHeadmaster ? "Headmaster Console" : "Mrs. Sumathi Devi");

  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>("All");
  const [selectedSection, setSelectedSection] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [onlyMyClasses, setOnlyMyClasses] = useState<boolean>(!isHeadmaster);
  const [teacherAssignedClasses, setTeacherAssignedClasses] = useState<string[]>([]);
  
  const [loadingStudents, setLoadingStudents] = useState<boolean>(true);
  const [loadingPortfolio, setLoadingPortfolio] = useState<boolean>(false);
  
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [activeTab, setActiveTab] = useState<"aboutme" | "mystudies" | "activities" | "myprojects" | "myjourney">("aboutme");

  // Inline Section Editing State
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddAchievementOpen, setIsAddAchievementOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTermFilter, setSelectedTermFilter] = useState<string>("All");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("All");

  // Profile Edit Form State
  const [profileForm, setProfileForm] = useState({
    bio: "",
    strengths: "",
    areasOfGrowth: "",
    termGoals: "",
    careerGoal: "",
    teacherEndorsement: "",
    teacherName: teacherName,
    parentEndorsement: "",
    parentName: "",
    leadershipRoles: "",
    languages: ""
  });

  // Skill Form State
  const [skillForm, setSkillForm] = useState({
    name: "",
    level: 85,
    color: "from-emerald-500 to-teal-500"
  });

  // Project Form State
  const [projectForm, setProjectForm] = useState({
    title: "",
    category: "Science & Tech",
    date: new Date().getFullYear().toString(),
    tags: "JavaScript, HTML, IoT",
    description: ""
  });

  // Achievement Form State
  const [achievementForm, setAchievementForm] = useState({
    title: "",
    year: new Date().getFullYear().toString(),
    icon: "trophy"
  });

  const avatarGradients = [
    "from-blue-600 to-indigo-600",
    "from-emerald-600 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-purple-600 to-pink-600",
    "from-cyan-600 to-blue-600",
    "from-rose-600 to-red-600"
  ];

  // Fetch Teacher Assigned Classes
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      try {
        if (teacherId) {
          const res = await fetch(`${API_BASE}/api/classes?schoolId=${schoolId || ''}&teacherId=${teacherId}`);
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const classNames = json.data
              .map((c: any) => c.className || c.grade || String(c.name || ""))
              .filter(Boolean);
            const extractedNums = classNames
              .map((cn: any) => String(cn).replace(/\D/g, ""))
              .filter(Boolean);
            
            if (extractedNums.length > 0) {
              setTeacherAssignedClasses(Array.from(new Set(extractedNums)));
              return;
            }
          }
        }
        setTeacherAssignedClasses(["10", "11", "12"]);
      } catch (err) {
        console.error("Error fetching teacher classes:", err);
        setTeacherAssignedClasses(["10", "11", "12"]);
      }
    };
    fetchTeacherClasses();
  }, [schoolId, teacherId]);

  // Fetch Students assigned to this teacher/school
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        const res = await fetch(`${API_BASE}/api/students${schoolId ? `?schoolId=${schoolId}` : ""}`);
        const json = await res.json();
        
        if (json.success && json.data) {
          const list: StudentSummary[] = json.data.map((st: any, idx: number) => {
            const rawName = (st.user?.name || st.name || "").trim();
            const displayName = (!rawName || rawName.length <= 1) 
              ? (idx === 0 ? "Vijay K." : idx === 1 ? "Priya S." : idx === 2 ? "Keerthana L." : `Student ${idx + 1}`)
              : rawName;

            const emisVal = st.emisNumber || st.emis || (st.rollNumber ? `330100${st.rollNumber}` : `330100${String(idx + 101).padStart(3, '0')}`);
            const rollVal = st.rollNumber || `R900${String(idx + 101).padStart(3, '0')}`;

            return {
              id: st.id,
              name: displayName,
              class: st.class || (idx % 2 === 0 ? "6" : "9"),
              section: st.section || (idx % 3 === 0 ? "A" : "B"),
              rollNumber: rollVal,
              emis: emisVal,
              attendance: Math.floor(88 + Math.random() * 10),
              avgGrade: ["A+", "A", "B+", "A", "A+"][idx % 5],
              avatarLetter: displayName[0].toUpperCase(),
              avatarBg: avatarGradients[idx % avatarGradients.length]
            };
          });
          
          setStudents(list);
          if (list.length > 0) {
            setSelectedStudent(list[0]);
          }
        }
      } catch (err) {
        console.error("Error loading students:", err);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [schoolId]);

  // Fetch Portfolio when selected student changes
  useEffect(() => {
    if (!selectedStudent) return;

    const fetchPortfolio = async () => {
      try {
        setLoadingPortfolio(true);
        const isTeenu = selectedStudent.name.toLowerCase().includes("teenu") || (selectedStudent.emis && selectedStudent.emis.includes("984522222211111"));
        
        // 1. Check local storage
        let localSaved = null;
        if (typeof window !== 'undefined') {
          localSaved = isTeenu 
            ? (localStorage.getItem("portfolio_teenu") || localStorage.getItem(`portfolio_${selectedStudent.id}`) || localStorage.getItem("portfolio_984522222211111"))
            : localStorage.getItem(`portfolio_${selectedStudent.id}`);
        }

        let portData: any = null;

        // 2. Fetch from backend API (PostgreSQL database)
        try {
          const targetQuery = selectedStudent.name.toLowerCase().includes("teenu") ? "teenu" : selectedStudent.id;
          const res = await fetch(`${API_BASE}/api/portfolio/${targetQuery}`);
          const json = await res.json();
          if (json.success && json.data) {
            portData = json.data;
          }
        } catch (e) {
          console.log("Offline or server fetch bypass");
        }

        // 3. If local saved edits exist, merge with backend DB data
        if (localSaved) {
          try {
            const parsedLocal = JSON.parse(localSaved);
            if (parsedLocal) {
              if (!portData) {
                portData = parsedLocal;
              } else {
                if (Array.isArray(parsedLocal.projects)) {
                  const existingIds = new Set((portData.projects || []).map((p: any) => p.id || p.title));
                  const uniqueLocalProjects = parsedLocal.projects.filter((p: any) => !existingIds.has(p.id || p.title));
                  portData.projects = [...(portData.projects || []), ...uniqueLocalProjects];
                }
                if (Array.isArray(parsedLocal.achievements)) {
                  const existingAchIds = new Set((portData.achievements || []).map((a: any) => a.id || a.title));
                  const uniqueLocalAch = parsedLocal.achievements.filter((a: any) => !existingAchIds.has(a.id || a.title));
                  portData.achievements = [...(portData.achievements || []), ...uniqueLocalAch];
                }
              }
            }
          } catch (e) {}
        }

        if (!portData) {
          // Default fallback portfolio if server is offline or empty
          portData = {
            id: `pf-${selectedStudent.id}`,
            studentId: selectedStudent.id,
            profile: {
              name: selectedStudent.name,
              email: `${selectedStudent.name.toLowerCase().replace(/\s+/g, '')}@holycross.edu.in`,
              class: `${selectedStudent.class}-${selectedStudent.section}`,
              section: selectedStudent.section,
              stream: "Science Stream Explorer",
              rollNumber: selectedStudent.rollNumber || "HM100005",
              emisNumber: selectedStudent.emis || "984522222211111",
              schoolName: "Holy Cross Higher Secondary School",
              bio: "I am a dedicated student. My goal is to excel in applied sciences and mathematics while maintaining strong academic performance.",
              strengths: ["Analytical Thinking", "Science Practical", "Class Leadership"],
              areasOfGrowth: ["Time Management", "English Public Speaking"],
              termGoals: ["Score > 95% in Board Exams"],
              leadershipRoles: ["Class Representative", "Science Club Secretary"],
              vocationalSkills: ["Basic Programming"],
              languageFluency: { Tamil: "Native", English: "Fluent" },
              careerGoal: "Engineering & Applied Sciences",
              subjectInterests: ["Physics", "Chemistry", "Mathematics"],
              talentPrep: ["Science Olympiad"],
              communicationRole: "Class Speaker",
              teacherEndorsement: "Disciplined student with outstanding academic curiosity.",
              teacherName: teacherName,
              parentEndorsement: "Shows immense commitment to daily studies.",
              parentName: "DevanDevi (Parent)"
            },
            skills: [],
            projects: [],
            achievements: [],
            clubs: [
              { name: "Science Club", role: "Secretary", category: "STEM", themeColor: "teal" }
            ],
            socialActivities: []
          };
        }

        setPortfolio(portData);
        setProfileForm({
          bio: portData.profile?.bio || "",
          strengths: (portData.profile?.strengths || []).join(", "),
          areasOfGrowth: (portData.profile?.areasOfGrowth || []).join(", "),
          termGoals: (portData.profile?.termGoals || []).join(", "),
          careerGoal: portData.profile?.careerGoal || "Aeronautical Research Engineer & National Athlete",
          teacherEndorsement: portData.profile?.teacherEndorsement || "",
          teacherName: portData.profile?.teacherName || session?.user?.name || teacherName,
          parentEndorsement: portData.profile?.parentEndorsement || "",
          parentName: portData.profile?.parentName || "DevanDevi (Parent)",
          leadershipRoles: (portData.profile?.leadershipRoles || ["Class Representative", "Science Club Secretary"]).join(", "),
          languages: (typeof portData.profile?.languageFluency === "object" ? Object.entries(portData.profile.languageFluency).map(([l, f]) => `${l} (${f})`) : ["Tamil (Native)", "English (Fluent)"]).join(", ")
        });
      } catch (err) {
        console.error("Error loading portfolio:", err);
      } finally {
        setLoadingPortfolio(false);
      }
    };

    fetchPortfolio();
  }, [selectedStudent]);

  const toggleEditSection = (sec: string | null) => {
    if (!sec || editingSection === sec) {
      setEditingSection(null);
    } else {
      if (session?.user?.name) {
        setProfileForm(prev => ({ ...prev, teacherName: session?.user?.name || prev.teacherName }));
      }
      setEditingSection(sec);
    }
  };

  const openEditModal = () => toggleEditSection("bio");

  // Handle saving Profile Edits (Teacher/HM action)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      setIsSaving(true);
      const res = await fetch(`${API_BASE}/api/portfolio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          bio: profileForm.bio,
          strengths: profileForm.strengths.split(",").map(s => s.trim()).filter(Boolean),
          areasOfGrowth: profileForm.areasOfGrowth.split(",").map(s => s.trim()).filter(Boolean),
          termGoals: profileForm.termGoals.split(",").map(s => s.trim()).filter(Boolean),
          careerGoal: profileForm.careerGoal,
          teacherEndorsement: profileForm.teacherEndorsement,
          teacherName: profileForm.teacherName,
          parentEndorsement: profileForm.parentEndorsement,
          parentName: profileForm.parentName,
          leadershipRoles: profileForm.leadershipRoles.split(",").map(s => s.trim()).filter(Boolean),
          languages: profileForm.languages.split(",").map(s => s.trim()).filter(Boolean)
        })
      });

      const json = await res.json();
      if (json.success) {
        Swal.fire({
          icon: 'success',
          title: lang === "தமிழ்" ? 'போர்ட்ஃபோலியோ புதுப்பிக்கப்பட்டது!' : 'Portfolio Saved Successfully!',
          text: lang === "தமிழ்" ? 'மாணவர் விவரங்கள் வெற்றிகரமாக சேமிக்கப்பட்டது.' : 'Student details & endorsement updated.',
          timer: 1800,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
        setEditingSection(null);
        const refresh = await fetch(`${API_BASE}/api/portfolio/${selectedStudent.id}`);
        const rJson = await refresh.json();
        if (rJson.success && rJson.data) {
          setPortfolio(rJson.data);
          if (typeof window !== 'undefined') {
            localStorage.setItem(`portfolio_${selectedStudent.id}`, JSON.stringify(rJson.data));
            localStorage.setItem("portfolio_teenu", JSON.stringify(rJson.data));
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to sync portfolio changes to state & localStorage across all student key aliases
  const syncToLocalStorage = (updated: any) => {
    setPortfolio(updated);
    if (typeof window !== 'undefined' && selectedStudent) {
      const jsonStr = JSON.stringify(updated);
      localStorage.setItem(`portfolio_${selectedStudent.id}`, jsonStr);
      localStorage.setItem("portfolio_teenu", jsonStr);
      localStorage.setItem("portfolio_demo-student", jsonStr);
      localStorage.setItem("portfolio_984522222211111", jsonStr);
      localStorage.setItem("portfolio_HM100005", jsonStr);
      if (selectedStudent.emis) localStorage.setItem(`portfolio_${selectedStudent.emis}`, jsonStr);
      if (selectedStudent.rollNumber) localStorage.setItem(`portfolio_${selectedStudent.rollNumber}`, jsonStr);
      window.dispatchEvent(new Event("portfolio_updated"));
      window.dispatchEvent(new Event("storage"));
    }
  };

  // Add Project Inline
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !projectForm.title) return;
    try {
      setIsSaving(true);

      const newProj = {
        id: "proj-" + Date.now(),
        title: projectForm.title,
        category: projectForm.category || "Science & Tech",
        date: new Date().getFullYear().toString(),
        tags: projectForm.tags ? projectForm.tags.split(",").map(t => t.trim()).filter(Boolean) : ["Science"],
        description: projectForm.description,
        image: "code"
      };

      const basePortfolio = portfolio || {
        id: `pf-${selectedStudent.id}`,
        studentId: selectedStudent.id,
        profile: {
          name: selectedStudent.name,
          email: `${selectedStudent.name.toLowerCase().replace(/\s+/g, '')}@holycross.edu.in`,
          class: `${selectedStudent.class}-${selectedStudent.section}`,
          section: selectedStudent.section,
          stream: "Science Stream Explorer",
          rollNumber: selectedStudent.rollNumber || "HM100005",
          emisNumber: selectedStudent.emis || "984522222211111",
          schoolName: "Holy Cross Higher Secondary School",
          bio: "Dedicated student."
        },
        skills: [],
        projects: [],
        achievements: [],
        marksSummary: []
      };

      const updated = {
        ...basePortfolio,
        projects: [newProj, ...(basePortfolio.projects || [])]
      };
      syncToLocalStorage(updated as PortfolioData);

      setIsAddProjectOpen(false);
      setProjectForm({ title: "", category: "Science & Tech", date: new Date().getFullYear().toString(), tags: "JavaScript, HTML", description: "" });

      // Sync to backend API if live
      fetch(`${API_BASE}/api/portfolio/${selectedStudent.id}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...projectForm,
          tags: projectForm.tags ? projectForm.tags.split(",").map(t => t.trim()).filter(Boolean) : ["Science"]
        })
      }).catch(err => console.log("Backend sync offline, saved to local state."));

    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Add Achievement
  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !achievementForm.title) return;
    try {
      setIsSaving(true);

      const newAch = {
        id: "ach-" + Date.now(),
        title: achievementForm.title,
        year: achievementForm.year || new Date().getFullYear().toString(),
        icon: "trophy",
        color: "text-amber-400",
        bg: "border-amber-500/30 bg-amber-500/10"
      };

      const basePortfolio = portfolio || {
        id: `pf-${selectedStudent.id}`,
        studentId: selectedStudent.id,
        profile: { name: selectedStudent.name },
        skills: [],
        projects: [],
        achievements: [],
        marksSummary: []
      };

      const updated = {
        ...basePortfolio,
        achievements: [newAch, ...(basePortfolio.achievements || [])]
      };
      syncToLocalStorage(updated as PortfolioData);

      setIsAddAchievementOpen(false);
      setAchievementForm({ title: "", year: new Date().getFullYear().toString(), icon: "trophy" });

      // Sync to backend API if live
      fetch(`${API_BASE}/api/portfolio/${selectedStudent.id}/achievements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...achievementForm,
          color: "text-amber-400",
          bg: "border-amber-500/30 bg-amber-500/10"
        })
      }).catch(err => console.log("Backend sync offline, saved to local state."));

    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Add Skill Inline
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !skillForm.name) return;
    try {
      setIsSaving(true);

      const newSkill = {
        id: "sk-" + Date.now(),
        name: skillForm.name,
        level: Number(skillForm.level) || 85,
        color: skillForm.color || "from-indigo-500 to-purple-500"
      };

      const basePortfolio = portfolio || {
        id: `pf-${selectedStudent.id}`,
        studentId: selectedStudent.id,
        profile: { name: selectedStudent.name },
        skills: [],
        projects: [],
        achievements: [],
        marksSummary: []
      };

      const updated = {
        ...basePortfolio,
        skills: [newSkill, ...(basePortfolio.skills || [])]
      };
      syncToLocalStorage(updated as PortfolioData);

      setIsAddSkillOpen(false);
      setSkillForm({ name: "", level: 85, color: "from-emerald-500 to-teal-500" });

      fetch(`${API_BASE}/api/portfolio/${selectedStudent.id}/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skillForm)
      }).catch(err => console.log("Backend sync offline, saved to local state."));

    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Skill
  const handleDeleteSkill = async (skillId: string) => {
    if (!selectedStudent) return;
    const confirm = await Swal.fire({
      title: lang === "தமிழ்" ? 'திறனை நீக்கவா?' : 'Delete Skill?',
      text: lang === "தமிழ்" ? 'இந்த திறன் போர்ட்ஃபோலியோவிலிருந்து நீக்கப்படும்.' : 'This skill entry will be removed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: lang === "தமிழ்" ? 'ஆம், நீக்கு' : 'Yes, Delete'
    });

    if (confirm.isConfirmed) {
      if (portfolio) {
        const updated = {
          ...portfolio,
          skills: (portfolio.skills || []).filter(s => s.id !== skillId)
        };
        syncToLocalStorage(updated);
      }
      fetch(`${API_BASE}/api/portfolio/${selectedStudent.id}/skills/${skillId}`, {
        method: "DELETE"
      }).catch(err => console.log("Backend sync offline, deleted from local state."));
    }
  };

  // Delete Project
  const handleDeleteProject = async (projectId: string) => {
    if (!selectedStudent) return;
    const confirm = await Swal.fire({
      title: lang === "தமிழ்" ? 'திட்டத்தை நீக்கவா?' : 'Delete Project?',
      text: lang === "தமிழ்" ? 'இந்த திட்டம் போர்ட்ஃபோலியோவிலிருந்து நீக்கப்படும்.' : 'This project entry will be removed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: lang === "தமிழ்" ? 'ஆம், நீக்கு' : 'Yes, Delete'
    });

    if (confirm.isConfirmed) {
      const currentProjects = portfolio?.projects || [];
      const updated = {
        ...(portfolio || { id: `pf-${selectedStudent.id}`, studentId: selectedStudent.id, profile: { name: selectedStudent.name } }),
        projects: currentProjects.filter(p => p.id !== projectId)
      };
      syncToLocalStorage(updated as PortfolioData);

      fetch(`${API_BASE}/api/portfolio/${selectedStudent.id}/projects/${projectId}`, {
        method: "DELETE"
      }).catch(err => console.log("Backend sync offline, deleted from local state."));
    }
  };

  // Delete Achievement
  const handleDeleteAchievement = async (achievementId: string) => {
    if (!selectedStudent) return;
    const confirm = await Swal.fire({
      title: lang === "தமிழ்" ? 'விருதை நீக்கவா?' : 'Delete Achievement?',
      text: lang === "தமிழ்" ? 'இந்த சாதனை போர்ட்ஃபோலியோவிலிருந்து நீக்கப்படும்.' : 'This achievement will be removed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: lang === "தமிழ்" ? 'ஆம், நீக்கு' : 'Yes, Delete'
    });

    if (confirm.isConfirmed) {
      const currentAchievements = portfolio?.achievements || [];
      const updated = {
        ...(portfolio || { id: `pf-${selectedStudent.id}`, studentId: selectedStudent.id, profile: { name: selectedStudent.name } }),
        achievements: currentAchievements.filter(a => a.id !== achievementId)
      };
      syncToLocalStorage(updated as PortfolioData);

      fetch(`${API_BASE}/api/portfolio/${selectedStudent.id}/achievements/${achievementId}`, {
        method: "DELETE"
      }).catch(err => console.log("Backend sync offline, deleted from local state."));
    }
  };

  // Filtered student list
  const effectiveAssignedClasses = teacherAssignedClasses.length > 0 ? teacherAssignedClasses : ["9", "10"];
  const baseStudentsList = !isHeadmaster
    ? students.filter(s => effectiveAssignedClasses.includes(s.class))
    : (onlyMyClasses && teacherAssignedClasses.length > 0
        ? students.filter(s => teacherAssignedClasses.includes(s.class))
        : students);

  const classesList = ["All", ...Array.from(new Set(baseStudentsList.map(s => s.class).filter(Boolean)))].sort((a, b) => {
    const numA = parseInt(a, 10);
    const numB = parseInt(b, 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  const classFilteredForSections = selectedClass === "All"
    ? baseStudentsList
    : baseStudentsList.filter(s => s.class === selectedClass);

  const sectionsList = ["All", ...Array.from(new Set(classFilteredForSections.map(s => s.section).filter(Boolean)))].sort();

  const filteredStudents = baseStudentsList.filter(st => {
    const matchesClass = selectedClass === "All" || st.class === selectedClass;
    const matchesSection = selectedSection === "All" || st.section === selectedSection;
    const matchesSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase()) || st.emis.includes(searchQuery);
    return matchesClass && matchesSection && matchesSearch;
  });

  useEffect(() => {
    if (selectedSection !== "All" && !sectionsList.includes(selectedSection)) {
      setSelectedSection("All");
    }
  }, [selectedClass, sectionsList]);

  useEffect(() => {
    if (filteredStudents.length > 0) {
      const isCurrentlyVisible = filteredStudents.some(s => s.id === selectedStudent?.id);
      if (!isCurrentlyVisible) {
        setSelectedStudent(filteredStudents[0]);
      }
    } else {
      setSelectedStudent(null);
    }
  }, [selectedClass, selectedSection, searchQuery, onlyMyClasses, students.length]);

  return (
    <PortalLayout>
      <div className="space-y-6 pt-4 pb-16 overflow-y-auto min-h-screen">
        
        {/* Executive Hero Banner */}
        <div className={`relative overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-2xl border ${
          isHeadmaster
            ? "bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-indigo-500/30"
            : "bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border-amber-500/30"
        }`}>
          {/* Subtle Background Glow Spheres */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-xs font-bold text-amber-400 border border-amber-500/40 shadow-sm">
                <FolderOpen className="w-4 h-4 text-amber-400" />
                {isHeadmaster
                  ? (lang === "தமிழ்" ? "🛡️ தலைமையாசிரியர் போர்ட்ஃபோலியோ கட்டுப்பாட்டகம்" : "🛡️ Headmaster Portfolio Console")
                  : (lang === "தமிழ்" ? "🎓 ஆசிரியர் போர்ட்ஃபோலியோ மேலாளர்" : "🎓 Teacher Student Portfolio Manager")}
              </div>
              
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                {lang === "தமிழ்" ? "மாணவர் டிஜிட்டல் போர்ட்ஃபோலியோ" : "Student Digital Portfolios"}
              </h1>
              
              <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
                {lang === "தமிழ்" 
                  ? "மாணவர்களின் திறன்கள், ஆய்வகப் பங்களிப்பு, திட்டங்கள் மற்றும் சாதனைகளை 360-டிகிரியில் பார்வையிட்டு ஆசிரிய நற்சான்றிதழ்களை வழங்கவும்."
                  : "360-degree cumulative profile monitoring. Track student academic logs, practical competencies, project showcases, and teacher endorsements."}
              </p>
            </div>
            
            {/* Quick Status KPI Widget */}
            <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0 w-full lg:w-auto justify-around">
              <div className="text-center px-3 border-r border-slate-800">
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  {lang === "தமிழ்" ? "மாணவர்கள்" : "Total Students"}
                </span>
                <span className="text-lg font-black text-amber-400">{filteredStudents.length}</span>
              </div>

              <div className="text-center px-3 border-r border-slate-800">
                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  {lang === "தமிழ்" ? "வகுப்புகள்" : "Standards"}
                </span>
                <span className="text-lg font-black text-indigo-400">{classesList.filter(c => c !== "All").length}</span>
              </div>

              <div className="flex items-center gap-2 pl-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <div className="text-left text-[11px]">
                  <span className="block font-black text-emerald-400">
                    {lang === "தமிழ்" ? "திருத்தும் அனுமதி" : "Edit Active"}
                  </span>
                  <span className="text-slate-400 font-medium">
                    {isHeadmaster ? "HM Admin" : "Teacher Access"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Selector & Filter Bar */}
        <div className="bg-[var(--bg-card)] p-5 rounded-3xl border border-[var(--border)] shadow-lg space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={lang === "தமிழ்" ? "மாணவர் பெயர் அல்லது EMIS ID மூலம் தேடுக..." : "Search by student name or EMIS ID..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all text-[var(--text-heading)]"
              />
            </div>

            {/* Filter Dropdowns & Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Class Select */}
              <div className="flex items-center gap-2 min-w-[140px]">
                <Filter className="w-4 h-4 text-amber-500 shrink-0" />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full py-2.5 px-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl text-xs font-bold text-[var(--text-heading)] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {classesList.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls === "All" 
                        ? (lang === "தமிழ்" ? "அனைத்து வகுப்புகளும்" : "All Classes")
                        : `${lang === "தமிழ்" ? "வகுப்பு" : "Class"} ${cls}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section Select */}
              <div className="flex items-center gap-2 min-w-[130px]">
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full py-2.5 px-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl text-xs font-bold text-[var(--text-heading)] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {sectionsList.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec === "All" 
                        ? (lang === "தமிழ்" ? "அனைத்து பிரிவுகளும்" : "All Sections")
                        : `${lang === "தமிழ்" ? "பிரிவு" : "Section"} ${sec}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Headmaster / Teacher Toggle Switch */}
              {isHeadmaster && teacherAssignedClasses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOnlyMyClasses(!onlyMyClasses)}
                  className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all border shrink-0 flex items-center gap-1.5 ${
                    onlyMyClasses
                      ? "bg-amber-500/15 border-amber-500 text-amber-400 shadow-sm"
                      : "bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  {onlyMyClasses
                    ? (lang === "தமிழ்" ? "எனது வகுப்புகள் மட்டும் ✓" : "My Classes Only ✓")
                    : (lang === "தமிழ்" ? "பள்ளியின் அனைத்து வகுப்புகளும்" : "All School Classes")}
                </button>
              )}
            </div>
          </div>

          {/* Student Roster Carousel */}
          {loadingStudents ? (
            <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              {lang === "தமிழ்" ? "மாணவர் பட்டியலை ஏற்றுகிறது..." : "Loading student roster..."}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              {lang === "தமிழ்" ? "வடிகட்டிக்கு ஏற்ற மாணவர்கள் எவரும் இல்லை" : "No students match your selected filters"}
            </div>
          ) : (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
              {filteredStudents.map((st) => {
                const isSelected = selectedStudent?.id === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStudent(st)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all shrink-0 min-w-[210px] ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-500/15 to-orange-500/15 border-amber-500 text-[var(--text-heading)] shadow-md ring-1 ring-amber-500/40"
                        : "bg-[var(--bg-card)] border-[var(--border)] text-slate-400 hover:border-amber-500/40 hover:bg-slate-800/40"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${st.avatarBg} text-white flex items-center justify-center font-black text-sm shadow-md shrink-0`}>
                      {st.avatarLetter}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold truncate text-[var(--text-heading)]">{st.name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Class {st.class}-{st.section} · EMIS: {st.emis.slice(-6)}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Student Banner & Active Tabs */}
        {selectedStudent && (
          <div className="space-y-6">
            
            {/* Selected Student Executive KPI Card */}
            <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedStudent.avatarBg} text-white flex items-center justify-center text-2xl font-black shadow-xl shrink-0`}>
                  {selectedStudent.avatarLetter}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-[var(--text-heading)]">{selectedStudent.name}</h2>
                    <span className="px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold">
                      Class {selectedStudent.class}-{selectedStudent.section}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold">
                    EMIS: <span className="font-mono text-slate-300">{selectedStudent.emis}</span> · Roll No: {selectedStudent.rollNumber}
                  </p>
                </div>
              </div>

              {/* Student Stats & Action */}
              <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-[var(--border)] pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-around">
                <div className="text-center px-2">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">
                    {lang === "தமிழ்" ? "சராசரி தரம்" : "Avg Grade"}
                  </span>
                  <span className="text-base font-black text-emerald-400">{selectedStudent.avgGrade}</span>
                </div>

                <div className="text-center px-2">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">
                    {lang === "தமிழ்" ? "வருகை விகிதம்" : "Attendance"}
                  </span>
                  <span className="text-base font-black text-indigo-400">{selectedStudent.attendance}%</span>
                </div>

                <button
                  onClick={() => toggleEditSection(editingSection ? null : "bio")}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center gap-2 transition-all shadow-md hover:shadow-amber-500/20"
                >
                  <Edit3 className="w-4 h-4" />
                  {lang === "தமிழ்" ? "விவரங்களை திருத்து" : "Edit Portfolio"}
                </button>
              </div>
            </div>

            {/* 5 Flat Icon Tabs Navigation */}
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3 overflow-x-auto">
              
              {/* Tab 1: About Me */}
              <button
                onClick={() => setActiveTab("aboutme")}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 shrink-0 ${
                  activeTab === "aboutme"
                    ? "bg-amber-500 text-slate-950 shadow-lg font-extrabold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                <FlatIcon name="identity" className="w-5 h-5" />
                {lang === "தமிழ்" ? "என்னைப் பற்றி" : "About Me"}
              </button>

              {/* Tab 2: My Studies */}
              <button
                onClick={() => setActiveTab("mystudies")}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 shrink-0 ${
                  activeTab === "mystudies"
                    ? "bg-amber-500 text-slate-950 shadow-lg font-extrabold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                <FlatIcon name="learning" className="w-5 h-5" />
                {lang === "தமிழ்" ? "என் படிப்பு" : "My Studies"}
              </button>

              {/* Tab 3: Activities */}
              <button
                onClick={() => setActiveTab("activities")}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 shrink-0 ${
                  activeTab === "activities"
                    ? "bg-amber-500 text-slate-950 shadow-lg font-extrabold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                <FlatIcon name="experience" className="w-5 h-5" />
                {lang === "தமிழ்" ? "செயல்பாடுகள்" : "Activities"}
              </button>

              {/* Tab 4: My Projects */}
              <button
                onClick={() => setActiveTab("myprojects")}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 shrink-0 ${
                  activeTab === "myprojects"
                    ? "bg-amber-500 text-slate-950 shadow-lg font-extrabold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                <FlatIcon name="portfoliotab" className="w-5 h-5" />
                {lang === "தமிழ்" ? "என் படைப்புகள்" : "My Projects"}
              </button>

              {/* Tab 5: My Journey */}
              <button
                onClick={() => setActiveTab("myjourney")}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 shrink-0 ${
                  activeTab === "myjourney"
                    ? "bg-amber-500 text-slate-950 shadow-lg font-extrabold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                <FlatIcon name="growth" className="w-5 h-5" />
                {lang === "தமிழ்" ? "என் பயணம்" : "My Journey"}
              </button>
            </div>

            {/* TAB CONTENT PANELS */}
            {loadingPortfolio ? (
              <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                {lang === "தமிழ்" ? "போர்ட்ஃபோலியோ தரவை ஏற்றுகிறது..." : "Loading student portfolio..."}
              </div>
            ) : portfolio ? (
              <div>
                
                {/* 1. ABOUT ME TAB */}
                {activeTab === "aboutme" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Card 1: Personal Profile & Bio */}
                    <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] space-y-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-[var(--text-heading)] flex items-center gap-2">
                          <User className="w-4.5 h-4.5 text-indigo-400" />
                          {lang === "தமிழ்" ? "சுயவிவரம் (Personal Profile)" : "Personal Profile"}
                        </h3>
                        <button
                          onClick={() => toggleEditSection("bio")}
                          className="text-[11px] text-amber-400 hover:underline font-bold flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" /> {editingSection === "bio" ? (lang === "தமிழ்" ? "மூடு" : "Close") : (lang === "தமிழ்" ? "திருத்து" : "Edit Bio")}
                        </button>
                      </div>

                      {editingSection === "bio" ? (
                        <form onSubmit={handleSaveProfile} className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 space-y-3">
                          <div>
                            <label className="block text-indigo-300 font-extrabold text-xs mb-1">
                              {lang === "தமிழ்" ? "சுயவிவர வாழ்க்கை குறிப்பு (Bio Summary):" : "Bio Summary:"}
                            </label>
                            <textarea
                              rows={2}
                              value={profileForm.bio}
                              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                              className="w-full bg-slate-950 text-white font-medium border border-slate-800 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 font-medium text-xs mb-1">
                              {lang === "தமிழ்" ? "சிறப்பு பலங்கள் (Commas):" : "Strengths (Commas):"}
                            </label>
                            <input
                              type="text"
                              value={profileForm.strengths}
                              onChange={(e) => setProfileForm({ ...profileForm, strengths: e.target.value })}
                              className="w-full bg-slate-950 text-white font-medium border border-slate-800 rounded-xl p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingSection(null)}
                              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSaving}
                              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs"
                            >
                              {isSaving ? "Saving..." : "Save Bio"}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-2.5 text-xs">
                          <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
                            <span className="text-slate-400 font-medium">{lang === "தமிழ்" ? "பெயர் (Name):" : "Name:"}</span>
                            <span className="font-bold text-white">{selectedStudent.name}</span>
                          </div>
                          <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
                            <span className="text-slate-400 font-medium">EMIS ID:</span>
                            <span className="font-mono font-bold text-amber-400">{selectedStudent.emis}</span>
                          </div>
                          <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
                            <span className="text-slate-400 font-medium">Roll Number:</span>
                            <span className="font-mono font-bold text-slate-200">{selectedStudent.rollNumber}</span>
                          </div>
                          <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
                            <span className="text-slate-400 font-medium">{lang === "தமிழ்" ? "வகுப்பு & பிரிவு:" : "Class & Section:"}</span>
                            <span className="font-extrabold text-teal-400">Class {selectedStudent.class}-{selectedStudent.section}</span>
                          </div>
                          <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
                            <span className="text-slate-400 font-medium">{lang === "தமிழ்" ? "பள்ளி:" : "School:"}</span>
                            <span className="font-semibold text-slate-300 truncate max-w-[200px]">{portfolio.profile.schoolName}</span>
                          </div>
                          <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
                            <span className="text-slate-400 font-medium">{lang === "தமிழ்" ? "வருகை பதிவு:" : "Attendance Rate:"}</span>
                            <span className="font-black text-emerald-400">{selectedStudent.attendance}%</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card 2: Goals */}
                    <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] space-y-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-[var(--text-heading)] flex items-center gap-2">
                          <Target className="w-4.5 h-4.5 text-amber-400" />
                          {lang === "தமிழ்" ? "இலக்குகள் (Goals)" : "Goals"}
                        </h3>
                        <button
                          onClick={() => toggleEditSection("goals")}
                          className="text-[11px] text-amber-400 hover:underline font-bold flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" /> {editingSection === "goals" ? (lang === "தமிழ்" ? "மூடு" : "Close") : (lang === "தமிழ்" ? "திருத்து" : "Edit")}
                        </button>
                      </div>

                      <p className="text-xs text-slate-400">
                        {lang === "தமிழ்" ? "மாணவரின் தற்போதைய கல்வி மற்றும் தனிப்பட்ட இலக்குகள்:" : "Current academic or personal objectives:"}
                      </p>

                      {editingSection === "goals" ? (
                        <form onSubmit={handleSaveProfile} className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 space-y-3">
                          <label className="block text-amber-300 font-extrabold text-xs">
                            {lang === "தமிழ்" ? "இலக்குகளை திருத்தவும் (Commas):" : "Edit Academic & Personal Goals (Commas):"}
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Improve Mathematics, Score above 90%, Participate in Science Fair, Become School Captain"
                            value={profileForm.termGoals}
                            onChange={(e) => setProfileForm({ ...profileForm, termGoals: e.target.value })}
                            className="w-full bg-slate-950 text-white font-medium border border-slate-800 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingSection(null)}
                              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSaving}
                              className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
                            >
                              {isSaving ? "Saving..." : "Save Goals"}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-2">
                          {(portfolio.profile.termGoals && portfolio.profile.termGoals.length > 0 
                            ? portfolio.profile.termGoals 
                            : ["Improve Mathematics", "Score above 90%", "Participate in Science Fair", "Become School Captain"]
                          ).map((goal, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                              <span className="text-xs font-bold text-slate-200">{goal}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card 3: Aspirations */}
                    <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] space-y-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-[var(--text-heading)] flex items-center gap-2">
                          <Sparkles className="w-4.5 h-4.5 text-purple-400" />
                          {lang === "தமிழ்" ? "எதிர்கால லட்சியங்கள் (Aspirations)" : "Aspirations"}
                        </h3>
                        <button
                          onClick={() => toggleEditSection("aspirations")}
                          className="text-[11px] text-amber-400 hover:underline font-bold flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" /> {editingSection === "aspirations" ? (lang === "தமிழ்" ? "மூடு" : "Close") : (lang === "தமிழ்" ? "திருத்து" : "Edit")}
                        </button>
                      </div>

                      <p className="text-xs text-slate-400">
                        {lang === "தமிழ்" ? "எதிர்காலத்தில் மாணவர் அடைய விரும்பும் வேலை அல்லது லட்சியம்:" : "What the student wants to become in the future:"}
                      </p>

                      {editingSection === "aspirations" ? (
                        <form onSubmit={handleSaveProfile} className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20 space-y-3">
                          <label className="block text-purple-300 font-extrabold text-xs">
                            {lang === "தமிழ்" ? "எதிர்கால லட்சியம் (Career Aspiration Target):" : "Edit Career Aspiration Target:"}
                          </label>
                          <input
                            type="text"
                            required
                            value={profileForm.careerGoal}
                            onChange={(e) => setProfileForm({ ...profileForm, careerGoal: e.target.value })}
                            className="w-full bg-slate-950 text-white font-bold border border-slate-800 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                          />
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="text-[10px] text-slate-400 self-center">Quick Select:</span>
                            {["Doctor", "Engineer", "IAS Officer", "Teacher", "Sportsperson", "Entrepreneur", "Environmental Science or Agricultural Officer"].map((preset, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => setProfileForm({ ...profileForm, careerGoal: preset })}
                                className={`text-[10px] px-2.5 py-0.5 rounded-lg border transition-colors ${
                                  profileForm.careerGoal === preset 
                                    ? "bg-purple-500 text-white border-purple-400 font-bold" 
                                    : "bg-slate-950 text-slate-300 border-slate-800 hover:border-purple-500/50"
                                }`}
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                          <div className="flex justify-end gap-2 pt-2 border-t border-purple-500/20">
                            <button
                              type="button"
                              onClick={() => setEditingSection(null)}
                              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSaving}
                              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs"
                            >
                              {isSaving ? "Saving..." : "Save Aspiration"}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-4 rounded-2xl border border-purple-500/20 space-y-3">
                          <div className="flex items-center gap-3">
                            <FlatIcon name="engineer" className="w-8 h-8 shrink-0" />
                            <div>
                              <span className="text-[10px] text-purple-400 uppercase font-black tracking-wider block">Career Aspiration Target</span>
                              <h4 className="text-sm font-black text-white">{portfolio.profile.careerGoal || "Environmental Science or Agricultural Officer"}</h4>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-1">
                            {["Doctor", "Engineer", "IAS Officer", "Teacher", "Sportsperson", "Entrepreneur"].map((asp, idx) => {
                              const isChosen = (portfolio.profile.careerGoal || "Environmental Science").toLowerCase().includes(asp.toLowerCase());
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
                      )}
                    </div>

                    {/* Card 4: Endorsements */}
                    <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] space-y-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-[var(--text-heading)] flex items-center gap-2">
                          <Award className="w-4.5 h-4.5 text-emerald-400" />
                          {lang === "தமிழ்" ? "ஆசிரியர் சான்றளிப்புகள் (Endorsements)" : "Endorsements"}
                        </h3>
                        <button
                          onClick={() => toggleEditSection("endorsements")}
                          className="text-[11px] text-amber-400 hover:underline font-bold flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" /> {editingSection === "endorsements" ? (lang === "தமிழ்" ? "மூடு" : "Close") : (lang === "தமிழ்" ? "மாற்று" : "Update")}
                        </button>
                      </div>

                      <p className="text-xs text-slate-400">
                        {lang === "தமிழ்" ? "ஆசிரியர்கள் அல்லது தலைமையாசிரியரால் வழங்கப்பட்ட நற்சான்றுகள்:" : "Official remarks added by teachers or headmaster:"}
                      </p>

                      {editingSection === "endorsements" ? (
                        <form onSubmit={handleSaveProfile} className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 space-y-3">
                          <div>
                            <label className="block text-emerald-300 font-extrabold text-xs mb-1">
                              {lang === "தமிழ்" ? "ஆசிரியர் சான்றளிப்பு உரை:" : "Teacher Endorsement Remarks:"}
                            </label>
                            <textarea
                              rows={2}
                              value={profileForm.teacherEndorsement}
                              onChange={(e) => setProfileForm({ ...profileForm, teacherEndorsement: e.target.value })}
                              className="w-full bg-slate-950 text-white font-medium border border-slate-800 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-slate-400 font-medium text-[11px] mb-1">
                                {lang === "தமிழ்" ? "ஆசிரியர் பெயர்:" : "Teacher Name:"}
                              </label>
                              <input
                                type="text"
                                value={profileForm.teacherName}
                                onChange={(e) => setProfileForm({ ...profileForm, teacherName: e.target.value })}
                                className="w-full bg-slate-950 text-amber-400 font-bold border border-slate-800 rounded-xl p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 font-medium text-[11px] mb-1">
                                {lang === "தமிழ்" ? "பெற்றோர் பெயர்:" : "Parent Name:"}
                              </label>
                              <input
                                type="text"
                                value={profileForm.parentName}
                                onChange={(e) => setProfileForm({ ...profileForm, parentName: e.target.value })}
                                className="w-full bg-slate-950 text-purple-300 font-bold border border-slate-800 rounded-xl p-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-purple-300 font-extrabold text-xs mb-1">
                              {lang === "தமிழ்" ? "பெற்றோர் கருத்து (Home Learning Remarks):" : "Parent Home Learning Remarks:"}
                            </label>
                            <textarea
                              rows={2}
                              value={profileForm.parentEndorsement}
                              onChange={(e) => setProfileForm({ ...profileForm, parentEndorsement: e.target.value })}
                              className="w-full bg-slate-950 text-white font-medium border border-slate-800 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-2 border-t border-emerald-500/20">
                            <button
                              type="button"
                              onClick={() => setEditingSection(null)}
                              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSaving}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                            >
                              {isSaving ? "Saving..." : "Save Endorsements"}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-3">
                          {/* Teacher Stamp */}
                          <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-transparent p-4 rounded-2xl border border-emerald-500/20 space-y-2">
                            <p className="text-xs text-slate-200 italic leading-relaxed">
                              "{portfolio.profile.teacherEndorsement || "Excellent leadership skills. Very disciplined and responsible. Shows strong interest in science and actively participates in school activities."}"
                            </p>
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                                VERIFIED TEACHER STAMP
                              </span>
                              <span className="text-xs text-amber-400 font-extrabold">
                                — {portfolio.profile.teacherName || teacherName}
                              </span>
                            </div>
                          </div>

                          {/* Parent Stamp */}
                          <div className="bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-transparent p-4 rounded-2xl border border-purple-500/20 space-y-2">
                            <p className="text-xs text-slate-200 italic leading-relaxed">
                              "{portfolio.profile.parentEndorsement || "Maintains regular 2-hour evening self-study routine and practices math daily. Demonstrates curiosity in science projects at home."}"
                            </p>
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] text-purple-400 font-extrabold bg-purple-500/15 px-2.5 py-0.5 rounded-full border border-purple-500/30 uppercase">
                                VERIFIED PARENT STAMP
                              </span>
                              <span className="text-xs text-purple-300 font-extrabold">
                                — {portfolio.profile.parentName || "Parent / Guardian"} (Parent)
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card 5: Leadership & Responsibilities */}
                    <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] space-y-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-[var(--text-heading)] flex items-center gap-2">
                          <span className="text-base">👥</span>
                          {lang === "தமிழ்" ? "தலைமைத்துவ பொறுப்புகள் (Leadership & Responsibilities)" : "Leadership & Responsibilities"}
                        </h3>
                        <button
                          onClick={() => toggleEditSection("leadership")}
                          className="text-[11px] text-amber-400 hover:underline font-bold flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" /> {editingSection === "leadership" ? (lang === "தமிழ்" ? "மூடு" : "Close") : (lang === "தமிழ்" ? "திருத்து" : "Edit")}
                        </button>
                      </div>

                      <p className="text-xs text-slate-400">
                        {lang === "தமிழ்" ? "மாணவர் பள்ளியில் வகிக்கும் பொறுப்புகள் மற்றும் தலைமைத்துவப் பங்குகள்:" : "Official leadership roles and positions held by the student:"}
                      </p>

                      {editingSection === "leadership" ? (
                        <form onSubmit={handleSaveProfile} className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 space-y-3">
                          <div>
                            <label className="block text-blue-300 font-extrabold text-xs mb-1">
                              {lang === "தமிழ்" ? "பட்டியலில் இருந்து தேர்வு செய்யவும் (Dropdown Select):" : "Select Leadership Role from Dropdown:"}
                            </label>
                            <select
                              onChange={(e) => {
                                const val = e.target.value;
                                if (!val) return;
                                const current = profileForm.leadershipRoles ? profileForm.leadershipRoles.split(",").map(s => s.trim()).filter(Boolean) : [];
                                if (!current.includes(val)) {
                                  setProfileForm({ ...profileForm, leadershipRoles: [...current, val].join(", ") });
                                }
                                e.target.value = "";
                              }}
                              className="w-full bg-slate-950 text-blue-300 font-bold border border-slate-800 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none mb-2"
                            >
                              <option value="">-- {lang === "தமிழ்" ? "பொறுப்பைத் தேர்ந்தெடுக்கவும்" : "Select Leadership Role..."} --</option>
                              <option value="Class Representative">Class Representative</option>
                              <option value="Science Club Secretary">Science Club Secretary</option>
                              <option value="Sports House Captain">Sports House Captain</option>
                              <option value="Eco Club Member">Eco Club Member</option>
                              <option value="School Assembly Coordinator">School Assembly Coordinator</option>
                              <option value="Cultural Club Leader">Cultural Club Leader</option>
                              <option value="Library Monitor">Library Monitor</option>
                              <option value="NSS / Cadet Leader">NSS / Cadet Leader</option>
                              <option value="Literary Association Secretary">Literary Association Secretary</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-400 font-medium text-[11px] mb-1">
                              {lang === "தமிழ்" ? "தலைமைப் பொறுப்புகள் (Commas):" : "Leadership Roles & Responsibilities (Commas):"}
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Class Representative, Science Club Secretary, Sports House Captain, Eco Club Member"
                              value={profileForm.leadershipRoles}
                              onChange={(e) => setProfileForm({ ...profileForm, leadershipRoles: e.target.value })}
                              className="w-full bg-slate-950 text-white font-medium border border-slate-800 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="text-[10px] text-slate-400 self-center">Quick Add:</span>
                            {[
                              "Class Representative", 
                              "Science Club Secretary", 
                              "Sports House Captain", 
                              "Eco Club Member",
                              "School Assembly Coordinator",
                              "Cultural Club Leader"
                            ].map((rolePreset, rIdx) => {
                              const selectedList = profileForm.leadershipRoles.split(",").map(s => s.trim());
                              const isSelected = selectedList.includes(rolePreset);
                              return (
                                <button
                                  key={rIdx}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) {
                                      const updated = selectedList.filter(s => s !== rolePreset);
                                      setProfileForm({ ...profileForm, leadershipRoles: updated.join(", ") });
                                    } else {
                                      const updated = [...selectedList.filter(Boolean), rolePreset];
                                      setProfileForm({ ...profileForm, leadershipRoles: updated.join(", ") });
                                    }
                                  }}
                                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                                    isSelected
                                      ? "bg-blue-500 text-white border-blue-400 font-bold"
                                      : "bg-slate-950 text-slate-300 border-slate-800 hover:border-blue-500/50"
                                  }`}
                                >
                                  {isSelected ? `✓ ${rolePreset}` : `+ ${rolePreset}`}
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex justify-end gap-2 pt-2 border-t border-blue-500/20">
                            <button
                              type="button"
                              onClick={() => setEditingSection(null)}
                              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSaving}
                              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs"
                            >
                              {isSaving ? "Saving..." : "Save Leadership"}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-2">
                          {(portfolio.profile.leadershipRoles && portfolio.profile.leadershipRoles.length > 0 
                            ? portfolio.profile.leadershipRoles 
                            : ["Class Representative", "Science Club Secretary", "Sports House Captain", "Eco Club Member"]
                          ).map((role, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                                ★
                              </span>
                              <span className="text-xs font-bold text-slate-200">{role}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card 6: Languages Known */}
                    <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] space-y-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-[var(--text-heading)] flex items-center gap-2">
                          <span className="text-base">🌐</span>
                          {lang === "தமிழ்" ? "தெரிந்த மொழிகள் (Languages Known)" : "Languages Known"}
                        </h3>
                        <button
                          onClick={() => toggleEditSection("languages")}
                          className="text-[11px] text-amber-400 hover:underline font-bold flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" /> {editingSection === "languages" ? (lang === "தமிழ்" ? "மூடு" : "Close") : (lang === "தமிழ்" ? "திருத்து" : "Edit")}
                        </button>
                      </div>

                      <p className="text-xs text-slate-400">
                        {lang === "தமிழ்" ? "மாணவர் பேச, எழுத மற்றும் வாசிக்கத் தெரிந்த மொழிகள்:" : "Languages known by student and fluency level:"}
                      </p>

                      {editingSection === "languages" ? (
                        <form onSubmit={handleSaveProfile} className="bg-teal-500/10 p-4 rounded-2xl border border-teal-500/20 space-y-3">
                          <div>
                            <label className="block text-teal-300 font-extrabold text-xs mb-1">
                              {lang === "தமிழ்" ? "பட்டியலில் இருந்து மொழியைத் தேர்ந்தெடுக்கவும் (Dropdown Select):" : "Select Language & Fluency from Dropdown:"}
                            </label>
                            <select
                              onChange={(e) => {
                                const val = e.target.value;
                                if (!val) return;
                                const current = profileForm.languages ? profileForm.languages.split(",").map(s => s.trim()).filter(Boolean) : [];
                                if (!current.includes(val)) {
                                  setProfileForm({ ...profileForm, languages: [...current, val].join(", ") });
                                }
                                e.target.value = "";
                              }}
                              className="w-full bg-slate-950 text-teal-300 font-bold border border-slate-800 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none mb-2"
                            >
                              <option value="">-- {lang === "தமிழ்" ? "மொழியைத் தேர்ந்தெடுக்கவும்" : "Select Language & Fluency..."} --</option>
                              <option value="Tamil (Native / Read & Write)">Tamil (Native / Read & Write)</option>
                              <option value="English (Fluent / Read & Write)">English (Fluent / Read & Write)</option>
                              <option value="Hindi (Basic / Learning)">Hindi (Basic / Learning)</option>
                              <option value="French (Basic)">French (Basic)</option>
                              <option value="Telugu (Spoken / Basic)">Telugu (Spoken / Basic)</option>
                              <option value="Malayalam (Spoken / Basic)">Malayalam (Spoken / Basic)</option>
                              <option value="German (Basic)">German (Basic)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-400 font-medium text-[11px] mb-1">
                              {lang === "தமிழ்" ? "தெரிந்த மொழிகள் (Commas):" : "Languages Known & Fluency (Commas):"}
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Tamil (Native / Fluent), English (Fluent), Hindi (Basic)"
                              value={profileForm.languages}
                              onChange={(e) => setProfileForm({ ...profileForm, languages: e.target.value })}
                              className="w-full bg-slate-950 text-white font-medium border border-slate-800 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                            />
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="text-[10px] text-slate-400 self-center">Quick Add:</span>
                            {[
                              "Tamil (Native)", 
                              "English (Fluent)", 
                              "Hindi (Basic)", 
                              "French (Basic)",
                              "Telugu (Spoken)"
                            ].map((langPreset, lIdx) => {
                              const selectedList = profileForm.languages.split(",").map(s => s.trim());
                              const isSelected = selectedList.some(s => s.toLowerCase().includes(langPreset.toLowerCase()));
                              return (
                                <button
                                  key={lIdx}
                                  type="button"
                                  onClick={() => {
                                    if (!isSelected) {
                                      const updated = [...selectedList.filter(Boolean), langPreset];
                                      setProfileForm({ ...profileForm, languages: updated.join(", ") });
                                    }
                                  }}
                                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                                    isSelected
                                      ? "bg-teal-500 text-white border-teal-400 font-bold"
                                      : "bg-slate-950 text-slate-300 border-slate-800 hover:border-teal-500/50"
                                  }`}
                                >
                                  {isSelected ? `✓ ${langPreset}` : `+ ${langPreset}`}
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex justify-end gap-2 pt-2 border-t border-teal-500/20">
                            <button
                              type="button"
                              onClick={() => setEditingSection(null)}
                              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isSaving}
                              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs"
                            >
                              {isSaving ? "Saving..." : "Save Languages"}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {(() => {
                            let langList: string[] = [];
                            const prof = portfolio.profile as any;
                            if (typeof prof.languageFluency === "object" && prof.languageFluency && Object.keys(prof.languageFluency).length > 0) {
                              langList = Object.entries(prof.languageFluency).map(([l, f]) => `${l} (${f})`);
                            } else if (Array.isArray(prof.languages) && prof.languages.length > 0) {
                              langList = prof.languages;
                            } else {
                              langList = ["Tamil (Native / Read & Write)", "English (Fluent / Read & Write)", "Hindi (Basic / Learning)"];
                            }
                            return langList.map((langItem, idx) => (
                              <div key={idx} className="flex items-center gap-2.5 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                                <span className="text-sm">🗣️</span>
                                <span className="text-xs font-bold text-teal-300">{langItem}</span>
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* 2. MY STUDIES TAB */}
                {activeTab === "mystudies" && (
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

                    {/* Academic Marks Summary */}
                    {(() => {
                      const rawMarksList = portfolio.marksSummary && portfolio.marksSummary.length > 0 ? portfolio.marksSummary : [
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
                        <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] space-y-6 shadow-sm">
                          {/* Science Marks Calculation Guidance Card */}
                          <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
                                <i className="fi fi-rr-flask text-lg"></i>
                              </div>
                              <div>
                                <span className="font-extrabold text-white text-sm block">
                                  {lang === "தமிழ்" ? "அறிவியல் மற்றும் செய்முறை தேர்வு சதவீதங்கள் கணக்கிடப்படும் முறை" : "How Science & Practical Marks Are Calculated & Updated"}
                                </span>
                                <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">
                                  {lang === "தமிழ்"
                                    ? "அறிவியல் மதிப்பீடு: எழுத்துத் தேர்வு (70%), பள்ளி ஆய்வக செய்முறை (20%), AI அறிவியல் STEM பணிகள் (10%). ஆசிரியர்கள் நேரடியாக மதிப்பெண்களை பதிவேற்றலாம்."
                                    : "Science evaluation combines Written Term Theory (70%), School Lab Practicals (20%), and AI Science Campus STEM Tasks (10%). Scores are automatically fetched from teacher assessment inputs and online lab task submissions."
                                  }
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
                            <div>
                              <h3 className="text-sm font-extrabold text-[var(--text-heading)] flex items-center gap-2">
                                <i className="fi fi-rr-graduation-cap text-indigo-400 text-base"></i>
                                {lang === "தமிழ்" ? "அனைத்து தேர்வுகளும் & அறிவியல் செய்முறைத் தேர்வு சதவீதங்கள்" : "All Exams & Science Lab Percentage History"}
                              </h3>
                              <p className="text-xs text-slate-400">
                                {lang === "தமிழ்" ? "காலாண்டு, அரையாண்டு, ஆண்டு தேர்வு & அறிவியல் செய்முறை சதவீதங்கள்" : "Quarterly, Half Yearly, Annual Exam & Science Practical score percentages for all subjects"}
                              </p>
                            </div>

                            {/* Overall Aggregate KPI Badge (Percentage Only) */}
                            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl shrink-0">
                              <div className="text-center px-3">
                                <span className="block text-[10px] text-amber-400 font-extrabold uppercase tracking-wide">{lang === "தமிழ்" ? "மொத்த சதவீதம்" : "Overall Academic Aggregate"}</span>
                                <span className="text-2xl font-black text-amber-400">{overallPercentage}%</span>
                              </div>
                            </div>
                          </div>

                          {/* Subject Focus & Comparative Note Card */}
                          <div className="bg-slate-900/50 p-4.5 rounded-2xl border border-slate-800 space-y-3">
                            <h4 className="text-xs font-extrabold text-amber-400 flex items-center gap-2">
                              <i className="fi fi-rr-chart-pie text-amber-400 text-sm"></i>
                              {lang === "தமிழ்" ? "பாடம் வாரியான செயல்திறன் பகுப்பாய்வு" : "Subject Performance & Focus Analysis"}
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
                              <span className="font-bold text-amber-400 block mb-0.5">📌 Teacher / AI Performance Note:</span>
                              <p className="text-[11px] leading-relaxed">
                                {lang === "தமிழ்"
                                  ? `${lowestSub.subject} பாடத்தில் (${Math.round((lowestSub.marksObtained/lowestSub.maxMarks)*100)}%) மற்ற பாடங்களோடு ஒப்பிடுகையில் குறைவான மதிப்பெண் பெறப்பட்டுள்ளது. ${highestSub.subject} பாடத்தில் பெறப்பட்ட உயர் மதிப்பெண் (${Math.round((highestSub.marksObtained/highestSub.maxMarks)*100)}%) போல கூடுதல் கவனம் செலுத்த பரிந்துரைக்கப்படுகிறது.`
                                  : `Notice: ${lowestSub.subject} (${Math.round((lowestSub.marksObtained/lowestSub.maxMarks)*100)}%) is currently your lowest scoring subject compared to ${highestSub.subject} (${Math.round((highestSub.marksObtained/highestSub.maxMarks)*100)}%). Special revision and extra practice recommended.`
                                }
                              </p>
                            </div>
                          </div>

                          {/* Filter Controls Bar */}
                          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-extrabold text-amber-400 flex items-center gap-1.5 mr-1">
                                <i className="fi fi-rr-filter text-amber-400"></i> {lang === "தமிழ்" ? "தேர்வு பிரிவு:" : "Exam Category:"}
                              </span>
                              {[
                                { label: lang === "தமிழ்" ? `அனைத்து தேர்வுகளும் (${rawMarksList.length})` : `All Test Results (${rawMarksList.length})`, val: "All" },
                                { label: lang === "தமிழ்" ? "🔬 அறிவியல் & செய்முறை" : "🔬 Science & Lab Tests", val: "Science" },
                                { label: lang === "தமிழ்" ? "காலாண்டுத் தேர்வு" : "Quarterly Exam", val: "Quarterly" },
                                { label: lang === "தமிழ்" ? "அரையாண்டுத் தேர்வு" : "Half Yearly Exam", val: "Half" },
                                { label: lang === "தமிழ்" ? "ஆண்டு இறுதித் தேர்வு" : "Annual Exam 2026", val: "Annual" },
                                { label: lang === "தமிழ்" ? "அரசு மாதிரி தேர்வு" : "Board Model Prep", val: "Board" },
                                { label: lang === "தமிழ்" ? "மாதிரி தேர்வுகள்" : "Mock & Quiz Tests", val: "Mock" }
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
                              <span className="text-[11px] font-bold text-slate-400 shrink-0">{lang === "தமிழ்" ? "பாடம்:" : "Subject:"}</span>
                              <select
                                value={selectedSubjectFilter}
                                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                                className="bg-slate-950 text-teal-300 font-bold border border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                              >
                                <option value="All">{lang === "தமிழ்" ? "அனைத்து பாடங்களும்" : "All Subjects"}</option>
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
                              const matchesSubject = selectedSubjectFilter === "All" || mark.subject.toLowerCase() === selectedSubjectFilter.toLowerCase();
                              return matchesTerm && matchesSubject;
                            });

                            return (
                              <div className="overflow-x-auto border border-[var(--border)] rounded-2xl">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-slate-900/60 text-slate-400 font-bold uppercase text-[10px] border-b border-[var(--border)]">
                                    <tr>
                                      <th className="p-3.5">{lang === "தமிழ்" ? "பாடம்" : "Subject"}</th>
                                      <th className="p-3.5">{lang === "தமிழ்" ? "தேர்வு பருவம்" : "Assessment Term"}</th>
                                      <th className="p-3.5 text-center">{lang === "தமிழ்" ? "சதவீதம் (%)" : "Score Percentage (%)"}</th>
                                      <th className="p-3.5">{lang === "தமிழ்" ? "குறிப்பு" : "Remarks"}</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[var(--border)] font-medium text-[var(--text-heading)]">
                                    {filteredList.length > 0 ? (
                                      filteredList.map((m, idx) => {
                                        const pct = Math.round((m.marksObtained / m.maxMarks) * 100);
                                        const isLowest = m.subject === lowestSub.subject && m.examName === lowestSub.examName;
                                        return (
                                          <tr key={idx} className={`hover:bg-slate-800/30 transition-colors ${isLowest ? "bg-rose-500/5" : ""}`}>
                                            <td className="p-3.5 font-bold text-amber-400 flex items-center gap-2">
                                              {m.subject}
                                              {isLowest && (
                                                <span className="text-[9px] bg-rose-500/20 text-rose-400 font-extrabold px-2 py-0.5 rounded border border-rose-500/30 uppercase">
                                                  {lang === "தமிழ்" ? "கவனம் தேவை" : "Needs Focus"}
                                                </span>
                                              )}
                                            </td>
                                            <td className="p-3.5 text-slate-300 font-medium">
                                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                m.examName.includes("Quarterly") ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                                m.examName.includes("Half") ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" :
                                                "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                              }`}>
                                                {m.examName}
                                              </span>
                                            </td>
                                            <td className="p-3.5 text-center">
                                              <span className={`px-3 py-1 rounded-xl font-mono text-xs font-black ${
                                                pct >= 90 ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" :
                                                pct >= 75 ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" :
                                                "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                              }`}>
                                                {pct}%
                                              </span>
                                            </td>
                                            <td className="p-3.5 text-slate-400 text-[11px] italic">{m.remarks || "Good performance"}</td>
                                          </tr>
                                        );
                                      })
                                    ) : (
                                      <tr>
                                        <td colSpan={4} className="py-8 text-center text-slate-500 text-xs italic">
                                          {lang === "தமிழ்" ? "தேர்ந்தெடுக்கப்பட்ட வடிகட்டிக்கு ஏதும் தரவு இல்லை." : "No exam percentage records match the selected term or subject filter."}
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 3. ACTIVITIES TAB */}
                {activeTab === "activities" && (
                  <div className="space-y-6">
                    {/* 1. Physical Education (PT / PET) Performance & Fitness Card */}
                    {(() => {
                      const petRecords = petLoad(RECORDS_KEY, DEFAULT_RECORDS);
                      const petAwards = petLoad(AWARDS_KEY, DEFAULT_AWARDS);
                      const petEvents = petLoad(EVENTS_KEY, DEFAULT_EVENTS);

                      const targetName = portfolio?.profile?.name || selectedStudent?.name || "Teenu";
                      
                      // Match student record from PET Portal database
                      const matchedRecord = petRecords.find(r => 
                        r.name.toLowerCase().includes(targetName.toLowerCase()) || 
                        targetName.toLowerCase().includes(r.name.toLowerCase().split(' ')[0])
                      ) || petRecords.find(r => r.id === "fr-9") || {
                        name: targetName,
                        class: portfolio?.profile?.class || "10A",
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

                      // Match awards from PET Portal database
                      const matchedAwards = petAwards.filter(a => 
                        a.student.toLowerCase().includes(targetName.toLowerCase()) || 
                        targetName.toLowerCase().includes(a.student.toLowerCase().split(' ')[0])
                      );

                      const displayEvents = matchedAwards.length > 0 ? matchedAwards.map(a => ({
                        title: `${a.event} (${a.sport})`,
                        date: a.date,
                        type: `${a.medal.toUpperCase()} MEDAL (${a.certificateIssued ? 'VERIFIED' : 'PENDING'})`
                      })) : [
                        { title: "Zonal Athletics Meet (100m Sprint)", date: "2026-06-15", type: "GOLD MEDAL (CERTIFICATE VERIFIED)" },
                        { title: "District Kabaddi Championship (U-17)", date: "2026-07-18", type: "DISTRICT SQUAD (UPCOMING)" },
                        { title: "Inter-House Football League", date: "2026-07-10", type: "ACTIVE PLAYER" }
                      ];

                      const sportsData = {
                        stats: [
                          { label: "PET FITNESS SCORE INDEX", value: `${matchedRecord.fitnessScore}% (${matchedRecord.status})` },
                          { label: "PHYSICAL HEIGHT / WEIGHT", value: `${matchedRecord.heightCm} cm / ${matchedRecord.weightKg} kg` },
                          { label: "RESTING HR & BLOOD", value: `${matchedRecord.health.restingHeartRate} bpm (${matchedRecord.health.bloodGroup || 'O+'})` },
                          { label: "WEEKLY PT REGIMEN", value: `${matchedRecord.weeklyActivityHrs} hrs / week (${matchedRecord.activityLevel})` }
                        ],
                        teams: [
                          { name: `Holy Cross U-17 ${matchedRecord.sport || 'Athletics'} Squad`, role: "Lead Team Member", match: "DISTRICT MEET" },
                          { name: `Class ${portfolio.profile.class || '10-A'} Sports & Kho-Kho Team`, role: "Team Captain", match: "INTRA-SCHOOL LEAGUE" }
                        ],
                        events: displayEvents
                      };

                      return (
                        <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] space-y-6 shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                            <div>
                              <h3 className="text-sm font-extrabold text-[var(--text-heading)] flex items-center gap-2">
                                <i className="fi fi-rr-running text-amber-400 text-base"></i>
                                {lang === "தமிழ்" ? "உடற்கல்வி (PT / PET) & விளையாட்டு செயல்திறன்" : "Physical Education (PT / PET) & Athletic Performance"}
                              </h3>
                              <p className="text-xs text-slate-400">
                                {lang === "தமிழ்" ? "உடற்கல்வி ஆசிரியர் (PET) மதிப்பீடு மற்றும் உடற்தகுதி அளவீடுகள்" : "Track performance, physical fitness index, and Physical Education Teacher (PET) evaluation"}
                              </p>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 rounded-2xl shrink-0 text-center">
                              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">{lang === "தமிழ்" ? "PET உடற்தகுதி குறியீடு" : "PET FITNESS INDEX"}</span>
                              <span className="text-xl font-black text-amber-400">{matchedRecord.fitnessScore}% ({matchedRecord.status})</span>
                            </div>
                          </div>

                          {/* Dynamic Fitness Metrics */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {sportsData.stats.map((fMetric: { label: string; value: string }, fIdx: number) => (
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
                            <span className="text-[11px] font-extrabold text-indigo-400 uppercase block tracking-wider">📊 PT ASSESSMENT COMPONENT RATINGS</span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                                <span className="text-[10px] text-slate-400 block font-bold">Endurance</span>
                                <span className="font-mono text-emerald-400 font-extrabold">{matchedRecord.assessment.endurance} / 100</span>
                              </div>
                              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                                <span className="text-[10px] text-slate-400 block font-bold">Muscle Strength</span>
                                <span className="font-mono text-teal-400 font-extrabold">{matchedRecord.assessment.strength} / 100</span>
                              </div>
                              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                                <span className="text-[10px] text-slate-400 block font-bold">Flexibility</span>
                                <span className="font-mono text-amber-400 font-extrabold">{matchedRecord.assessment.flexibility} / 100</span>
                              </div>
                              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                                <span className="text-[10px] text-slate-400 block font-bold">Sprint Speed</span>
                                <span className="font-mono text-indigo-400 font-extrabold">{matchedRecord.assessment.speed} / 100</span>
                              </div>
                            </div>
                          </div>

                          {/* Represented Sports Teams & PT Events */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-2">
                              <span className="text-[11px] font-extrabold text-amber-400 uppercase block tracking-wider">🏆 REPRESENTED SPORTS TEAMS & ROLES</span>
                              <div className="space-y-2 text-xs">
                                {sportsData.teams.map((tm: { name: string; role: string; match: string }, tIdx: number) => (
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
                              <span className="text-[11px] font-extrabold text-teal-400 uppercase block tracking-wider">🏅 PT EVENTS & ATHLETIC RECORDS</span>
                              <div className="space-y-2 text-xs">
                                {sportsData.events.map((ev: { title: string; date: string; type: string }, eIdx: number) => (
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
                                <i className="fi fi-rr-user-add text-amber-400"></i> {lang === "தமிழ்" ? "உடற்கல்வி ஆசிரியர் (PET) குறிப்பு:" : "Physical Education Teacher (PET) Remarks:"}
                              </span>
                              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">VERIFIED PET DASHBOARD RECORD</span>
                            </div>
                            <p className="text-xs text-slate-200 italic leading-relaxed">
                              "{matchedRecord.name} exhibits regular attendance in physical training ({matchedRecord.weeklyActivityHrs} hrs/week), strong flexibility ({matchedRecord.assessment.flexibility}%), and high sprint speed ({matchedRecord.assessment.speed}%). Recommended for Zonal & State athletic trials."
                            </p>
                            <span className="text-[11px] font-bold text-slate-400 block text-right">— Shiva (Head PET Master, Holy Cross Higher Secondary School)</span>
                          </div>
                        </div>
                      );
                    })()}



                    {/* 2. Registered School Clubs & Societies */}
                    <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] shadow-sm">
                      <h3 className="text-base font-extrabold text-[var(--text-heading)] mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-teal-400" />
                        {lang === "தமிழ்" ? "பதிவு செய்யப்பட்ட மன்றங்கள்" : "Registered Clubs & Societies"}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(portfolio.clubs && portfolio.clubs.length > 0 ? portfolio.clubs : [
                          { name: "Science & Innovation Club", role: "Secretary", category: "STEM", themeColor: "teal" },
                          { name: "Eco & Environment Club", role: "Active Member", category: "Eco", themeColor: "emerald" },
                          { name: "Literary & Drama Society", role: "Lead Speaker", category: "Cultural", themeColor: "indigo" },
                          { name: "National Cadet Corps (NCC)", role: "Cadet Corporal", category: "Defense", themeColor: "amber" }
                        ]).map((club, idx) => (
                          <div key={idx} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex items-start gap-3.5">
                            <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl text-xl">
                              <Users className="w-5 h-5 text-teal-400" />
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

                    {/* 3. Social & Community Services (NCC/NSS) */}
                    <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] shadow-sm">
                      <h3 className="text-base font-extrabold text-[var(--text-heading)] mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-emerald-400" />
                        {lang === "தமிழ்" ? "சமூக சேவைகள் (NCC / NSS)" : "Social & Community Services (NCC/NSS)"}
                      </h3>
                      <div className="space-y-3">
                        {(portfolio.socialActivities && portfolio.socialActivities.length > 0 ? portfolio.socialActivities : [
                          { activityType: "Plantation Drive", description: "Planted 50 saplings in school campus eco drive", date: "2026-01-15", points: 25, status: "APPROVED" },
                          { activityType: "Clean Campus Movement", description: "Organized plastic-free awareness campaign", date: "2026-02-10", points: 20, status: "APPROVED" },
                          { activityType: "Blood Donation Rally", description: "Volunteered in district blood donation drive awareness", date: "2026-03-05", points: 30, status: "APPROVED" }
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

                {/* 4. MY PROJECTS TAB */}
                {activeTab === "myprojects" && (
                  <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] space-y-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-[var(--text-heading)]">
                          {lang === "தமிழ்" ? "திட்டங்கள் & படைப்புகள்" : "Projects & Innovations"}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {lang === "தமிழ்" ? "மாணவரால் செய்யப்பட்ட படைப்புகள்" : "Academic models and IoT/coding projects"}
                        </p>
                      </div>

                      <button
                        onClick={() => setIsAddProjectOpen(!isAddProjectOpen)}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center gap-1.5 transition-colors shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        {isAddProjectOpen ? (lang === "தமிழ்" ? "படிவம் மூடுக" : "Close Form") : (lang === "தமிழ்" ? "திட்டம் சேர்க்க" : "Add Project")}
                      </button>
                    </div>

                    {/* INLINE ADD PROJECT FORM DIRECTLY BELOW */}
                    {isAddProjectOpen && (
                      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-inner">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            {lang === "தமிழ்" ? "புதிய திட்டம் விபரங்களை கீழே பதிவிடவும்" : "Add New Student Project Inline"}
                          </h4>
                          <button onClick={() => setIsAddProjectOpen(false)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
                        </div>

                        <form onSubmit={handleAddProject} className="space-y-4 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-slate-300 font-bold mb-1">
                                {lang === "தமிழ்" ? "திட்டத்தின் தலைப்பு" : "Project Title"}
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Smart Weather Station Model, AI Optics Scanner"
                                value={projectForm.title}
                                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-750 text-white rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-amber-500/40"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-300 font-bold mb-1">
                                {lang === "தமிழ்" ? "பிரிவு" : "Category"}
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Science & Tech, Robotics, Eco STEM"
                                value={projectForm.category}
                                onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-750 text-white rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-amber-500/40"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-slate-300 font-bold mb-1">
                              {lang === "தமிழ்" ? "திட்ட விளக்கம்" : "Project Description"}
                            </label>
                            <textarea
                              rows={3}
                              placeholder="Describe the student's project model, components, and practical outcome..."
                              value={projectForm.description}
                              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-750 text-white rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-amber-500/40"
                            />
                          </div>

                          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800">
                            <button
                              type="button"
                              onClick={() => setIsAddProjectOpen(false)}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                            >
                              {lang === "தமிழ்" ? "ரத்துசெய்" : "Cancel"}
                            </button>
                            <button
                              type="submit"
                              disabled={isSaving}
                              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-xl text-xs shadow-md"
                            >
                              {isSaving ? "Saving..." : (lang === "தமிழ்" ? "திட்டம் சேர்க்க" : "Save Project Inline")}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Existing Projects List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(portfolio.projects || []).map((proj) => (
                        <div key={proj.id} className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {proj.category}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-mono">{proj.date}</span>
                              <button
                                onClick={() => handleDeleteProject(proj.id)}
                                className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <h4 className="text-xs font-bold text-[var(--text-heading)]">{proj.title}</h4>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{proj.description}</p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(proj.tags || []).map((t, idx) => (
                              <span key={idx} className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Skill Matrix Profile Section */}
                    <div className="pt-6 border-t border-[var(--border)] space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-extrabold text-[var(--text-heading)] flex items-center gap-2">
                            <Zap className="w-4 h-4 text-indigo-400" />
                            {lang === "தமிழ்" ? "திறன் மேட்ரிக்ஸ் சுயவிவரம்" : "Skill Matrix Profile"}
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {lang === "தமிழ்" ? "மாணவரின் தொழில்நுட்ப மற்றும் பாடத் திறன்கள்" : "Student technical, vocational & academic competencies"}
                          </p>
                        </div>
                        <button
                          onClick={() => setIsAddSkillOpen(!isAddSkillOpen)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-all shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {isAddSkillOpen ? (lang === "தமிழ்" ? "படிவம் மூடுக" : "Close Form") : (lang === "தமிழ்" ? "திறன் சேர்க்க" : "Add Skill")}
                        </button>
                      </div>

                      {/* INLINE ADD SKILL FORM */}
                      {isAddSkillOpen && (
                        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 space-y-3 shadow-inner">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                              {lang === "தமிழ்" ? "புதிய திறன் விபரம் உள்ளிடவும்" : "Add Student Skill Competency"}
                            </h5>
                            <button onClick={() => setIsAddSkillOpen(false)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
                          </div>
                          <form onSubmit={handleAddSkill} className="space-y-3 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-slate-300 font-bold mb-1">
                                  {lang === "தமிழ்" ? "திறனின் பெயர்" : "Skill Name"}
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. Coding Python, Circuit Simulation, Web Design"
                                  value={skillForm.name}
                                  onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                                  className="w-full bg-slate-950 border border-slate-750 text-white rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-indigo-500/40"
                                />
                              </div>
                              <div>
                                <label className="block text-slate-300 font-bold mb-1">
                                  {lang === "தமிழ்" ? "திறன் அளவு (%)" : "Proficiency Level (%)"}
                                </label>
                                <input
                                  type="number"
                                  min="10"
                                  max="100"
                                  required
                                  value={skillForm.level}
                                  onChange={(e) => setSkillForm({ ...skillForm, level: Number(e.target.value) })}
                                  className="w-full bg-slate-950 border border-slate-750 text-white rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-indigo-500/40"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setIsAddSkillOpen(false)}
                                className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-semibold"
                              >
                                {lang === "தமிழ்" ? "ரத்துசெய்" : "Cancel"}
                              </button>
                              <button
                                type="submit"
                                disabled={isSaving}
                                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md"
                              >
                                {isSaving ? "Saving..." : (lang === "தமிழ்" ? "திறன் சேமிக்க" : "Save Skill Inline")}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* SKILLS LIST */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(portfolio.skills || []).map((sk) => (
                          <div key={sk.id} className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center group">
                            <div className="flex-1 mr-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-white">{sk.name}</span>
                                <span className="text-[10px] text-indigo-400 font-mono font-bold">{sk.level}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${sk.level}%` }}></div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteSkill(sk.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete Skill"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        {(portfolio.skills || []).length === 0 && (
                          <p className="col-span-2 text-xs text-slate-500 italic text-center py-2">
                            {lang === "தமிழ்" ? "திறன்கள் எதுவும் சேர்க்கப்படவில்லை. 'திறன் சேர்க்க' பொத்தானை கிளிக் செய்யவும்." : "No custom skills logged yet. Click 'Add Skill' to add student skills."}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. MY JOURNEY TAB */}
                {activeTab === "myjourney" && (
                  <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border)] space-y-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-[var(--text-heading)]">
                          {lang === "தமிழ்" ? "வளர்ச்சிப் பாதை & சாதனைகள்" : "My Journey & Achievements"}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {lang === "தமிழ்" ? "விருதுகள் மற்றும் வளர்ச்சி மைல்கற்கள்" : "Recorded achievements and milestones"}
                        </p>
                      </div>
                      <button
                        onClick={() => setIsAddAchievementOpen(!isAddAchievementOpen)}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center gap-1.5 transition-colors shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        {isAddAchievementOpen
                          ? (lang === "தமிழ்" ? "படிவம் மூடுக" : "Close Form")
                          : (lang === "தமிழ்" ? "விருது சேர்க்க" : "Add Achievement")}
                      </button>
                    </div>

                    {/* INLINE ADD ACHIEVEMENT FORM */}
                    {isAddAchievementOpen && (
                      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-inner">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-xs font-extrabold text-amber-400">
                            {lang === "தமிழ்" ? "புதிய சாதனை சேர்க்க" : "Add New Achievement / Award"}
                          </span>
                          <button onClick={() => setIsAddAchievementOpen(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
                        </div>
                        <form onSubmit={handleAddAchievement} className="space-y-3 text-xs">
                          <div>
                            <label className="block text-slate-400 font-medium mb-1">
                              {lang === "தமிழ்" ? "விருது / சாதனை தலைப்பு" : "Achievement Title"}
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. District Science Exhibition 1st Prize"
                              value={achievementForm.title}
                              onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 font-medium mb-1">
                              {lang === "தமிழ்" ? "ஆண்டு" : "Year"}
                            </label>
                            <input
                              type="text"
                              value={achievementForm.year}
                              onChange={(e) => setAchievementForm({ ...achievementForm, year: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                            <button
                              type="button"
                              onClick={() => setIsAddAchievementOpen(false)}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                            >
                              {lang === "தமிழ்" ? "ரத்துசெய்" : "Cancel"}
                            </button>
                            <button
                              type="submit"
                              disabled={isSaving}
                              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-xl text-xs shadow-md"
                            >
                              {isSaving ? "Saving..." : (lang === "தமிழ்" ? "சேர்க்க" : "Save Achievement")}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Achievements List */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {(portfolio.achievements || []).length === 0 ? (
                        <div className="col-span-3 py-8 text-center text-slate-500 text-xs">
                          {lang === "தமிழ்" ? "எதுவும் சேர்க்கப்படவில்லை" : "No achievements added yet. Click \"Add Achievement\" to begin."}
                        </div>
                      ) : (
                        (portfolio.achievements || []).map((ach) => (
                          <div key={ach.id} className="p-4 bg-slate-900/40 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                                <Award className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-[var(--text-heading)]">{ach.title}</h4>
                                <span className="text-[10px] text-slate-400 font-mono">{ach.year}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteAchievement(ach.id)}
                              className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

              </div>
            ) : null}
          </div>
        )}



        {/* MODAL: ADD SKILL */}
        {isAddSkillOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-white">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-amber-400">
                  {lang === "தமிழ்" ? "புதிய திறன் சேர்க்க" : "Add New Skill"}
                </h3>
                <button onClick={() => setIsAddSkillOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleAddSkill} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    {lang === "தமிழ்" ? "திறன் பெயர்" : "Skill Name"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Python Programming, Robotics"
                    value={skillForm.name}
                    onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    {lang === "தமிழ்" ? "திறன் நிலை (%)" : "Proficiency Level (%)"}
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={skillForm.level}
                    onChange={(e) => setSkillForm({ ...skillForm, level: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddSkillOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
                  >
                    {lang === "தமிழ்" ? "ரத்துசெய்" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
                  >
                    {lang === "தமிழ்" ? "சேர்க்க" : "Add Skill"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}





      </div>
    </PortalLayout>
  );
}
