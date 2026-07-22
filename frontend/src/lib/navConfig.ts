export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export interface PortalConfig {
  title: string;
  subtitle: string;
  avatarLetter: string;
  avatarColor: string;
  themeClass: string;
  accentColor: string;
  navItems: NavItem[];
}

export const portals = [
  {
    href: "/student",
    label: "Student Portal",
    icon: "GraduationCap",
    desc: "AI Tutor, Adaptive Learning, Quizzes, Career Guidance",
    color: "from-indigo-600 to-purple-600",
    border: "border-indigo-500/30",
    bg: "hover:bg-indigo-500/10",
  },
  {
    href: "/parent",
    label: "Parent Portal",
    icon: "Users",
    desc: "Child Performance, Notifications, AI Parent Assistant",
    color: "from-emerald-600 to-teal-600",
    border: "border-emerald-500/30",
    bg: "hover:bg-emerald-500/10",
  },
  {
    href: "/teacher",
    label: "Teacher Portal",
    icon: "Book",
    desc: "AI Lesson Planner, Question Generator, Student Analytics",
    color: "from-amber-600 to-orange-600",
    border: "border-amber-500/30",
    bg: "hover:bg-amber-500/10",
  },
  {
    href: "/headmaster",
    label: "Headmaster Portal",
    icon: "Building",
    desc: "School Management, Staff, Resources, Enrollment",
    color: "from-blue-600 to-cyan-600",
    border: "border-blue-500/30",
    bg: "hover:bg-blue-500/10",
  },
  {
    href: "/block-education-officer",
    label: "Block Education Officer",
    icon: "Building2",
    desc: "Manage School, Attendance & Exam Analytics",
    color: "from-violet-600 to-purple-600",
    border: "border-violet-500/30",
    bg: "hover:bg-violet-500/10",
  },
  {
    href: "/district-education-officer",
    label: "District Education Officer",
    icon: "Map",
    desc: "District Dashboard, Dropout Heatmap, School Ranking",
    color: "from-pink-600 to-rose-600",
    border: "border-pink-500/30",
    bg: "hover:bg-pink-500/10",
  },
  {
    href: "/commissioner",
    label: "Commissioner Portal",
    icon: "Scale",
    desc: "State Operations, Policy Monitoring, Budget Utilization",
    color: "from-cyan-600 to-sky-600",
    border: "border-cyan-500/30",
    bg: "hover:bg-cyan-500/10",
  },
  {
    href: "/minister",
    label: "Minister Dashboard",
    icon: "Building2",
    desc: "Executive Command Center, Live State View, KPI Monitoring",
    color: "from-red-600 to-orange-600",
    border: "border-red-500/30",
    bg: "hover:bg-red-500/10",
  },
  {
    href: "/super-admin",
    label: "Super Admin",
    icon: "Settings",
    desc: "Manage Custom Pages, Enable/Disable Features, View Logs",
    color: "from-slate-700 to-slate-900",
    border: "border-slate-500/30",
    bg: "hover:bg-slate-500/10",
  },
];

export const roleConfigs: Record<string, PortalConfig> = {
  STUDENT: {
    title: "Student Portal",
    subtitle: "Welcome back, Arjun Kumar · Class 10A · EMIS: 3301234567",
    avatarLetter: "A",
    avatarColor: "#6366f1",
    themeClass: "theme-student",
    accentColor: "#6366f1",
    navItems: [
      { label: "Dashboard", href: "/parent", icon: "Home" },
      { label: "Child Performance", href: "/parent/performance", icon: "Activity" },
      { label: "Attendance", href: "/parent/attendance", icon: "Calendar" },
      { label: "Homework Status", href: "/parent/homework", icon: "Edit3" },
      { label: "Notifications", href: "/parent/notifications", icon: "Bell" },
      { label: "Child Health Report", href: "/parent/health", icon: "HeartPulse" },
      { label: "Leave Reports", href: "/parent/leave", icon: "FileText" },
      { label: "AI Assistant", href: "/parent/ai-assistant", icon: "Bot" },
      { label: "Scholarship", href: "/parent/scholarship", icon: "GraduationCap" },
      { label: "PTA Meetings", href: "/parent/pta", icon: "Users" },
    ],
  },
  STUDENT_MIDDLE: {
    title: "Middle School Dashboard",
    subtitle: "Welcome back, Arjun! · Class 7B · You have 5 new badges waiting! 🌟",
    avatarLetter: "A",
    avatarColor: "#10b981",
    themeClass: "theme-student",
    accentColor: "#10b981",
    navItems: [
      { label: "Dashboard", href: "/student/middle-school", icon: "Home" },


      // ── Academics & Subjects ──────────────────────────
      { label: "---", href: "#", icon: "" },
      { label: "Academics & Subjects", href: "#", icon: "" },
      { label: "Academics Hub", href: "/student/academics", icon: "GraduationCap" },
      { label: "Syllabus", href: "/student/syllabus", icon: "BookOpen" },
      { label: "Learning Hub", href: "/student/centralized-content", icon: "Book" },
      { label: "Digital Library", href: "/student/digital-library", icon: "Library" },
      { label: "Class Syllabus Board", href: "/student/syllabus-board", icon: "LayoutGrid" },
      { label: "AI Lessons", href: "/student/lessons", icon: "Sparkles" },
      // { label: "My Subjects", href: "/student/subjects", icon: "BookOpen" },

      { label: "Self-Study Plan", href: "/student/study-plan", icon: "Zap" },
      { label: "AI Study Planner", href: "/student/study-planner", icon: "Calendar" },


      { label: "Homework", href: "/student/homework", icon: "Edit3" },
      { label: "Exams & Assessments", href: "#", icon: "" },
      { label: "Assessments", href: "/student/assessments", icon: "Edit3" },
      { label: "School Exams", href: "/student/exams", icon: "ClipboardList" },
      // { label: "Competitive Exams", href: "/student/competitive-exams", icon: "Trophy" },
      // { label: "Academic History", href: "/student/academic-history", icon: "ScrollText" },

      // ── Test Preparation ──────────────────────────────
      { label: "---", href: "#", icon: "" },
      { label: "Test Preparation", href: "#", icon: "" },
      { label: "AI Tutor", href: "/student/ai-tutor", icon: "Bot" },
      { label: "Personal Guide", href: "/student/personal-guide", icon: "Compass" },
      // { label: "NEET Preparation", href: "/student/neet-prep", icon: "Microscope" },
      { label: "Maths Formulas", href: "/student/maths-formulas", icon: "Calculator" },
      { label: "Science Draw Mat", href: "/student/science-draw-mat", icon: "Microscope" },
      { label: "Science Fact", href: "/student/science-fact", icon: "Sparkles" },
      { label: "Language Coaching", href: "/student/language-coaching", icon: "MessageSquare" },
      { label: "3D Preview", href: "/student/3d-preview", icon: "Box" },



      // ── Extracurricular & Wellbeing ───────────────────
      { label: "---", href: "#", icon: "" },
      { label: "Extracurricular & Wellbeing", href: "#", icon: "" },
      { label: "Sports & Athletics", href: "/student/sports", icon: "Activity" },
      { label: "Extracurriculars", href: "/student/activities", icon: "Smile" },
      { label: "Social Activities", href: "/student/social-activities", icon: "HeartHandshake" },
      { label: "Celebrations", href: "/student/celebrations", icon: "PartyPopper" },
      { label: "Cultural Events", href: "/student/cultural-events", icon: "Smile" },
      // { label: "My Health Report", href: "/student/health", icon: "HeartPulse" },

      // ── School & Career ───────────────────────────────
      { label: "---", href: "#", icon: "" },
      { label: "School & Career", href: "#", icon: "" },
      { label: "Announcements", href: "/student/announcements", icon: "Megaphone" },
      // { label: "My Badges", href: "/student/middle-school/badges", icon: "Award" },
      { label: "Story Books", href: "/student/middle-school/stories", icon: "Book" },
      { label: "Digital Portfolio", href: "/student/middle-school/portfolio", icon: "FolderOpen" },
      { label: "Learning Platform", href: "/student/middle-school/learning-platform", icon: "Monitor" },
      { label: "School Press", href: "/student/school-press", icon: "Newspaper" },
      { label: "Welfare & Benefits", href: "/student/welfare", icon: "Gift" },
      // { label: "Leave Reports", href: "/student/leave", icon: "FileText" },

      // ── Support & Safety ──────────────────────────────
      { label: "---", href: "#", icon: "" },
      { label: "Support & Safety", href: "#", icon: "" },
      { label: "Personal Counsellor", href: "/student/counsellor", icon: "Heart" },
      { label: "Report a Concern", href: "/student/report", icon: "ShieldAlert" },
    ],
  },
  STUDENT_HIGH: {
    title: "High School Dashboard",
    subtitle: "Welcome, Arjun · Class 10A · Focus Area: SSLC Board Preparation",
    avatarLetter: "A",
    avatarColor: "#ef4444",
    themeClass: "theme-student",
    accentColor: "#ef4444",
    navItems: [
      { label: "Dashboard", href: "/student/high-school", icon: "Home" },

      // ── Academics & Subjects ──────────────────────────
      { label: "---", href: "#", icon: "" },
      { label: "Academics & Subjects", href: "#", icon: "" },
      { label: "Academics Hub", href: "/student/academics", icon: "GraduationCap" },
      { label: "Syllabus", href: "/student/syllabus", icon: "BookOpen" },
      { label: "Learning Hub", href: "/student/centralized-content", icon: "Book" },
      { label: "Digital Library", href: "/student/digital-library", icon: "Library" },
      { label: "Class Syllabus Board", href: "/student/syllabus-board", icon: "LayoutGrid" },
      { label: "AI Lessons", href: "/student/lessons", icon: "Sparkles" },
      //{ label: "My Subjects", href: "/student/subjects", icon: "BookOpen" },

      { label: "Self-Study Plan", href: "/student/study-plan", icon: "Zap" },
      { label: "AI Study Planner", href: "/student/study-planner", icon: "Calendar" },


      { label: "Homework", href: "/student/homework", icon: "Edit3" },
      { label: "Exams & Assessments", href: "#", icon: "" },
      { label: "Board Prep", href: "/student/high-school/board-prep", icon: "Target" },
      { label: "Mock Tests", href: "/student/high-school/mock-tests", icon: "Edit3" },
      { label: "Model Exams", href: "/student/high-school/model-exams", icon: "ClipboardCheck" },
      { label: "Question Papers (PYQ)", href: "/student/high-school/question-papers", icon: "FileText" },
      { label: "Assessments", href: "/student/assessments", icon: "Edit3" },
      { label: "School Exams", href: "/student/exams", icon: "ClipboardList" },
      { label: "Competitive Exams", href: "/student/competitive-exams", icon: "Trophy" },
      // { label: "Academic History", href: "/student/academic-history", icon: "ScrollText" },

      // ── Test Preparation ──────────────────────────────
      { label: "---", href: "#", icon: "" },
      { label: "Test Preparation", href: "#", icon: "" },
      { label: "Prep Plans", href: "/student/high-school/prep-plans", icon: "BookOpen" },
      { label: "AI Revision Plan", href: "/student/high-school/revision-plan", icon: "Bot" },
      { label: "Performance Predictions", href: "/student/high-school/predictions", icon: "TrendingUp" },
      { label: "Study Boost", href: "/student/high-school/study-boost", icon: "Zap" },
      { label: "AI Tutor", href: "/student/ai-tutor", icon: "Bot" },
      { label: "Personal Guide", href: "/student/personal-guide", icon: "Compass" },
      // { label: "NEET Preparation", href: "/student/neet-prep", icon: "Microscope" },
      // Maths Formulas (/student/maths-formulas) is Class-6 Samacheer data only — not shown for 9-10.
      { label: "Science Draw Mat", href: "/student/science-draw-mat", icon: "Microscope" },
      { label: "Language Coaching", href: "/student/language-coaching", icon: "MessageSquare" },
      { label: "3D Preview", href: "/student/3d-preview", icon: "Box" },

      // ── Science Labs & Centers ────────────────────────
      { label: "---", href: "#", icon: "" },
      { label: "Science Labs & Centers", href: "#", icon: "" },
      { label: "Science Campus", href: "/student/science-campus", icon: "Sparkles" },
      { label: "Science Book Library", href: "/student/science-library", icon: "BookOpen" },
      { label: "Botany Centre", href: "/student/botany-centre", icon: "Leaf" },
      { label: "Virtual Labs", href: "/student/labs", icon: "FlaskConical" },
      // { label: "Science Lab Support", href: "/student/science-lab-support", icon: "FlaskConical" },

      // ── Extracurricular & Wellbeing ───────────────────
      { label: "---", href: "#", icon: "" },
      { label: "Extracurricular & Wellbeing", href: "#", icon: "" },
      { label: "Sports & Athletics", href: "/student/sports", icon: "Activity" },
      { label: "Extracurriculars", href: "/student/activities", icon: "Smile" },
      { label: "Social Activities", href: "/student/social-activities", icon: "HeartHandshake" },
      { label: "Celebrations", href: "/student/celebrations", icon: "PartyPopper" },
      { label: "Cultural Events", href: "/student/cultural-events", icon: "Smile" },
      { label: "My Health Report", href: "/student/health", icon: "HeartPulse" },
      // { label: "Wellness", href: "/student/wellness", icon: "Smile" },

      // ── School & Career ───────────────────────────────
      { label: "---", href: "#", icon: "" },
      { label: "School & Career", href: "#", icon: "" },
      { label: "Announcements", href: "/student/announcements", icon: "Megaphone" },
      { label: "Career Aptitude", href: "/student/high-school/career", icon: "Compass" },
      { label: "Scholarships", href: "/student/high-school/scholarships", icon: "GraduationCap" },
      { label: "Digital Portfolio", href: "/student/portfolio", icon: "FolderOpen" },
      { label: "Learning Platform", href: "/student/high-school/learning-platform", icon: "Monitor" },
      { label: "School Press", href: "/student/school-press", icon: "Newspaper" },
      { label: "Welfare & Benefits", href: "/student/welfare", icon: "Gift" },
      { label: "Leave Reports", href: "/student/leave", icon: "FileText" },

      // ── Support & Safety ──────────────────────────────
      { label: "---", href: "#", icon: "" },
      { label: "Support & Safety", href: "#", icon: "" },
      { label: "Personal Counsellor", href: "/student/counsellor", icon: "Heart" },
      { label: "Report a Concern", href: "/student/report", icon: "ShieldAlert" },
    ],
  },
  STUDENT_HIGHER: {
    title: "Higher Secondary Dashboard",
    subtitle: "Welcome, Arjun · Class 12 Biology Stream · Target: Medical Colleges",
    avatarLetter: "A",
    avatarColor: "#8b5cf6",
    themeClass: "theme-student",
    accentColor: "#8b5cf6",
    navItems: [
      { label: "Dashboard", href: "/student/higher-secondary", icon: "Home" },

      // ── Academics & Subjects ──────────────────────────
      { label: "---", href: "#", icon: "" },
      { label: "Academics & Subjects", href: "#", icon: "" },
      { label: "Academics Hub", href: "/student/academics", icon: "GraduationCap" },
      { label: "Syllabus", href: "/student/syllabus", icon: "BookOpen" },
      { label: "Learning Hub", href: "/student/centralized-content", icon: "Book" },
      { label: "Digital Library", href: "/student/digital-library", icon: "Library" },
      { label: "Class Syllabus Board", href: "/student/syllabus-board", icon: "LayoutGrid" },
      { label: "AI Lessons", href: "/student/lessons", icon: "Sparkles" },
      // { label: "My Subjects", href: "/student/subjects", icon: "BookOpen" },

      { label: "Self-Study Plan", href: "/student/study-plan", icon: "Zap" },
      { label: "AI Study Planner", href: "/student/study-planner", icon: "Calendar" },

      // ── Exams & Assessments ───────────────────────────
      { label: "---", href: "#", icon: "" },

      { label: "Exams & Assessments", href: "#", icon: "" },
      { label: "Homework", href: "/student/homework", icon: "Edit3" },
      { label: "Board Prep", href: "/student/higher-secondary/board-prep", icon: "Target" },
      { label: "Mock Tests", href: "/student/higher-secondary/mock-tests", icon: "Edit3" },
      { label: "Assessments", href: "/student/assessments", icon: "Edit3" },
      { label: "School Exams", href: "/student/exams", icon: "ClipboardList" },
      { label: "Competitive Exams", href: "/student/competitive-exams", icon: "Trophy" },
      // { label: "Academic History", href: "/student/academic-history", icon: "ScrollText" },

      // ── Test Preparation ──────────────────────────────
      { label: "---", href: "#", icon: "" },
      { label: "Test Preparation", href: "#", icon: "" },
      { label: "Competitive Exam Prep", href: "/student/higher-secondary/competitive", icon: "Rocket" },
      { label: "NEET Preparation", href: "/student/neet-prep", icon: "Microscope" },
      { label: "AI Tutor", href: "/student/ai-tutor", icon: "Bot" },
      { label: "Personal Guide", href: "/student/personal-guide", icon: "Compass" },
      { label: "Formula Bank", href: "/student/higher-secondary/formulae", icon: "Calculator" },
      { label: "Science Draw Mat", href: "/student/science-draw-mat", icon: "Microscope" },
      { label: "Language Coaching", href: "/student/language-coaching", icon: "MessageSquare" },
      { label: "3D Preview", href: "/student/3d-preview", icon: "Box" },

      // ── Science Labs & Centers ────────────────────────
      { label: "---", href: "#", icon: "" },
      { label: "Science Labs & Centers", href: "#", icon: "" },
      { label: "Science Campus", href: "/student/science-campus", icon: "Sparkles" },
      { label: "Science Book Library", href: "/student/science-library", icon: "BookOpen" },
      { label: "Botany Centre", href: "/student/botany-centre", icon: "Leaf" },
      { label: "Virtual Labs", href: "/student/labs", icon: "FlaskConical" },
      { label: "Science Lab Support", href: "/student/science-lab-support", icon: "FlaskConical" },
      { label: "Chemistry Lab", href: "/student/chemistry-lab", icon: "FlaskConical" },
      { label: "Zoology Centre", href: "/student/zoology-centre", icon: "Target" },
      { label: "Computer Education", href: "/student/computer-education", icon: "Monitor" },

      // ── Extracurricular & Wellbeing ───────────────────
      { label: "---", href: "#", icon: "" },
      { label: "Extracurricular & Wellbeing", href: "#", icon: "" },
      { label: "Sports & Athletics", href: "/student/sports", icon: "Activity" },
      { label: "Extracurriculars", href: "/student/activities", icon: "Smile" },
      { label: "Social Activities", href: "/student/social-activities", icon: "HeartHandshake" },
      { label: "Celebrations", href: "/student/celebrations", icon: "PartyPopper" },
      { label: "Cultural Events", href: "/student/cultural-events", icon: "Smile" },
      { label: "My Health Report", href: "/student/health", icon: "HeartPulse" },
      // { label: "Wellness", href: "/student/wellness", icon: "Smile" },

      // ── School & Career ───────────────────────────────
      { label: "---", href: "#", icon: "" },
      { label: "School & Career", href: "#", icon: "" },
      { label: "Announcements", href: "/student/announcements", icon: "Megaphone" },
      { label: "Career Guidance", href: "/student/career", icon: "Compass" },
      { label: "Scholarships", href: "/student/higher-secondary/scholarships", icon: "ScrollText" },
      { label: "Digital Portfolio", href: "/student/portfolio", icon: "FolderOpen" },
      { label: "Learning Platform", href: "/student/higher-secondary/learning-platform", icon: "Monitor" },
      { label: "School Press", href: "/student/school-press", icon: "Newspaper" },
      { label: "Welfare & Benefits", href: "/student/welfare", icon: "Gift" },
      { label: "Leave Reports", href: "/student/leave", icon: "FileText" },

      // ── Support & Safety ──────────────────────────────
      { label: "---", href: "#", icon: "" },
      { label: "Support & Safety", href: "#", icon: "" },
      { label: "Personal Counsellor", href: "/student/counsellor", icon: "Heart" },
      { label: "Report a Concern", href: "/student/report", icon: "ShieldAlert" },
    ],
  },

  PET: {
    title: "Physical Education Teacher",
    subtitle: "PET Staff · GHS Coimbatore",
    avatarLetter: "P",
    avatarColor: "#84cc16",
    themeClass: "theme-teacher",
    accentColor: "#84cc16",
    navItems: [
      { label: "Dashboard", href: "/pet", icon: "Home" },
      { label: "Student Records & Health", href: "/pet/records", icon: "HeartPulse" },
      { label: "Sports Events & Competitions", href: "/pet/sports-conducted", icon: "Activity" },
      { label: "Inventory & Equipments", href: "/pet/inventory", icon: "Package" },
      { label: "Awards & Certifications", href: "/pet/awards", icon: "Trophy" },
      { label: "Ground Condition", href: "/pet/ground-condition", icon: "Map" },
      { label: "Clubs & Activities", href: "/pet/clubs", icon: "Users" },
    ],
  },
  TEACHER: {
    title: "Teacher Dashboard",
    subtitle: "Mrs. Sumathi Devi · Mathematics · GHS Coimbatore",
    avatarLetter: "S",
    avatarColor: "#f59e0b",
    themeClass: "theme-teacher",
    accentColor: "#f59e0b",
    navItems: [
      { label: "My Classes", href: "/teacher/classes", icon: "Building" },
      { label: "Timetable & Proxies", href: "/teacher/timetable", icon: "Calendar" },
      { label: "Exam Schedule", href: "/teacher/exams", icon: "FileText" },
      { label: "Science Labs", href: "/teacher/labs", icon: "FlaskConical" },
      { label: "Subject Analytics", href: "/teacher/subject-analytics", icon: "Activity" },

      // Academics & Guidance
      { label: "Academics & Guidance", href: "#", icon: "" },
      { label: "Academics Hub", href: "/teacher/academics", icon: "BookOpen" },
      { label: "SSLC Board Prep", href: "/teacher/sslc-prep", icon: "Target" },
      { label: "NEET Preparation", href: "/teacher/neet-prep", icon: "Microscope" },
      { label: "Digital Library", href: "/teacher/digital-library", icon: "Book" },
      { label: "Personal Guide", href: "/teacher/personal-guide", icon: "Compass" },
      { label: "Competitive Exams", href: "/teacher/competitive-exams", icon: "Trophy" },

      // Common Menu & Tools
      { label: "Admin & Tools", href: "#", icon: "" },
      { label: "Class Syllabus Board", href: "/teacher/syllabus-board", icon: "LayoutGrid" },
      { label: "Smart Class", href: "/teacher/smart-class", icon: "Presentation" },
      { label: "AI Lesson Planner", href: "/teacher/lesson-planner", icon: "FileText" },
      { label: "Question Generator", href: "/teacher/questions", icon: "HelpCircle" },
      { label: "AI Evaluation", href: "/teacher/evaluation", icon: "CheckCircle" },

      // Student Management
      { label: "Student Management", href: "#", icon: "" },
      { label: "Student Profiles", href: "/teacher/student-profiles", icon: "User" },
      { label: "Student Status", href: "/teacher/student-status", icon: "TrendingUp" },
      { label: "Homework Manager", href: "/teacher/homework", icon: "Check" },
      { label: "Scholarship Details", href: "/teacher/scholarships", icon: "GraduationCap" },
      { label: "Social Activities Review", href: "/teacher/social-activities", icon: "HeartHandshake" },
      { label: "Student Analytics", href: "/teacher/analytics", icon: "Activity" },
      { label: "Risk Alerts", href: "/teacher/risk-alerts", icon: "ShieldAlert" },
      // { label: "Parent Management", href: "/teacher/parents", icon: "Users" },
      { label: "Sports & Athletics", href: "/teacher/sports", icon: "Trophy" },

      // Resources & Admin
      { label: "Resources & Admin", href: "#", icon: "" },
      // { label: "AI Material Hub", href: "/teacher/material-hub", icon: "✨" },
      { label: "Add Materials", href: "/teacher/add-materials", icon: "Book" },
      { label: "Daily Attendance", href: "/teacher/attendance", icon: "Calendar" },
      { label: "Announcements", href: "/teacher/announcements", icon: "Megaphone" },
      { label: "Leave Requests", href: "/teacher/leave", icon: "FileText" },
      { label: "Club Events", href: "/teacher/events", icon: "Calendar" },

      // Interactive Modules & Centers
      { label: "Interactive Modules", href: "#", icon: "" },
      { label: "Science Draw Mat", href: "/teacher/science-draw-mat", icon: "Microscope" },
      { label: "Science Fact", href: "/teacher/science-fact", icon: "Sparkles" },
      { label: "Maths Formulas", href: "/teacher/maths-formulas", icon: "Calculator" },
      { label: "Language Coaching", href: "/teacher/language-coaching", icon: "MessageSquare" },
      { label: "Science Lab Support", href: "/teacher/science-lab-support", icon: "FlaskConical" },
      { label: "Chemistry Lab", href: "/teacher/chemistry-lab", icon: "FlaskConical" },
      { label: "Zoology Centre", href: "/teacher/zoology-centre", icon: "Target" },
      { label: "3D Preview", href: "/teacher/3d-preview", icon: "Box" },
      { label: "Celebrations", href: "/teacher/celebrations", icon: "PartyPopper" },
      { label: "Cultural Events", href: "/teacher/cultural-events", icon: "Smile" },
      { label: "Computer Education", href: "/teacher/computer-education", icon: "Monitor" },
      { label: "School Press", href: "/teacher/school-press", icon: "Newspaper" },
    ],
  },
  PARENT: {
    title: "Parent Portal",
    subtitle: "Rajesh Kumar · Parent of Priya · Class 9B",
    avatarLetter: "R",
    avatarColor: "#10b981",
    themeClass: "theme-parent",
    accentColor: "#10b981",
    navItems: [
      { label: "Dashboard", href: "/parent", icon: "Home" },
      { label: "Child Performance", href: "/parent/performance", icon: "Activity" },
      { label: "Attendance", href: "/parent/attendance", icon: "Calendar" },
      { label: "Homework Status", href: "/parent/homework", icon: "Edit3" },
      { label: "Notifications", href: "/parent/notifications", icon: "Bell" },
      { label: "Child Health Report", href: "/parent/health", icon: "HeartPulse" },
      { label: "Leave Reports", href: "/parent/leave", icon: "FileText" },
      { label: "AI Assistant", href: "/parent/ai-assistant", icon: "Bot" },
      { label: "Scholarship", href: "/parent/scholarship", icon: "GraduationCap" },
      { label: "PTA Meetings", href: "/parent/pta", icon: "Users" },
    ],
  },
  HEADMASTER: {
    title: "Headmaster Portal",
    subtitle: "Mr. Venkatesh R. · GHS Coimbatore · DISE: 33012345",
    avatarLetter: "V",
    avatarColor: "#3b82f6",
    themeClass: "theme-headmaster",
    accentColor: "#3b82f6",
    navItems: [
      { label: "Dashboard", href: "/headmaster", icon: "fi fi-rr-home" },

      { label: "People & Staff", href: "#", icon: "" },
      { label: "Student Monitoring", href: "/headmaster/students", icon: "fi fi-rr-graduation-cap" },
      { label: "Promotions", href: "/headmaster/promotions", icon: "fi fi-rr-stats" },
      { label: "Staff Management", href: "/headmaster/staff", icon: "fi fi-rr-user" },
      { label: "Leave Requests", href: "/headmaster/leave", icon: "fi fi-rr-calendar" },
      { label: "Temporary Staff", href: "/headmaster/temporary-staff", icon: "fi fi-rr-users" },
      { label: "Parents Details", href: "/headmaster/parents", icon: "fi fi-rr-users" },
      { label: "School Alumni", href: "/headmaster/alumni", icon: "fi fi-rr-graduation-cap" },

      { label: "Academics & Records", href: "#", icon: "" },
      { label: "Academics Approvals", href: "/headmaster/academics", icon: "fi fi-rr-checkbox" },
      { label: "Attendance", href: "/headmaster/attendance", icon: "fi fi-rr-calendar" },
      { label: "Timetable", href: "/headmaster/timetable", icon: "fi fi-rr-calendar" },
      { label: "Exam Schedule", href: "/headmaster/exams", icon: "fi fi-rr-document-signed" },
      { label: "Model Exam Results", href: "/headmaster/model-exams", icon: "fi fi-rr-edit" },
      { label: "Manage Mock Tests", href: "/headmaster/mock-tests", icon: "fi fi-rr-edit" },
      { label: "SSLC Board Prep", href: "/headmaster/sslc-prep", icon: "fi fi-rr-stats" },
      { label: "Digital Library", href: "/headmaster/digital-library", icon: "fi fi-rr-book-alt" },

      { label: "School Admin & Govt", href: "#", icon: "" },
      { label: "School Resources", href: "/headmaster/resources", icon: "fi fi-rr-building" },
      { label: "Mid-Day Meal", href: "/headmaster/midday-meal", icon: "fi fi-rr-restaurant" },
      { label: "Scholarship", href: "/headmaster/scholarship", icon: "fi fi-rr-award" },
      { label: "Govt Scheme Management", href: "/headmaster/gov-schemes", icon: "fi fi-rr-bank" },

      { label: "Extra Curricular & Info", href: "#", icon: "" },
      { label: "Public Portal Page", href: "/headmaster/portal", icon: "fi fi-rr-globe" },
      { label: "School Events", href: "/headmaster/events", icon: "fi fi-rr-party-horn" },
      { label: "Celebrations", href: "/headmaster/celebrations", icon: "fi fi-rr-party-horn" },
      { label: "Media Gallery", href: "/headmaster/gallery", icon: "fi fi-rr-picture" },
      { label: "Rewards & Honors", href: "/headmaster/rewards", icon: "fi fi-rr-trophy" },
      { label: "School History", href: "/headmaster/history", icon: "fi fi-rr-document" },
      { label: "Clubs & Activities", href: "/headmaster/clubs", icon: "fi fi-rr-smile" },
      { label: "Social Responsibility", href: "/headmaster/social-activities", icon: "fi fi-rr-heart" },
    ],
  },
  BEO: {
    title: "Block Education Officer",
    subtitle: "Mr. Murugesan P. · Coimbatore South Block",
    avatarLetter: "M",
    avatarColor: "#8b5cf6",
    themeClass: "theme-beo",
    accentColor: "#8b5cf6",
    navItems: [
      { label: "Dashboard", href: "/block-education-officer", icon: "Home" },
      { label: "Manage School", href: "/block-education-officer/schools", icon: "Building" },
      { label: "Manage Headmasters", href: "/block-education-officer/headmasters", icon: "Building" },
      { label: "Attendance Analytics", href: "/block-education-officer/attendance", icon: "Calendar" },
      { label: "Exam Analytics", href: "/block-education-officer/exams", icon: "Activity" },
      { label: "Infrastructure", href: "/block-education-officer/infrastructure", icon: "Building" },
      { label: "Teacher Deployment", href: "/block-education-officer/teachers", icon: "User" },
      { label: "Dropouts Tracking", href: "/block-education-officer/dropouts", icon: "TrendingDown" },
      { label: "Schemes Update", href: "/block-education-officer/schemes", icon: "ScrollText" },
      { label: "Grievances", href: "/block-education-officer/grievances", icon: "Scale" },
      { label: "Financial Reports", href: "/block-education-officer/financials", icon: "Banknote" },
      { label: "Circulars", href: "/block-education-officer/circulars", icon: "Megaphone" },
      { label: "Promotion Approvals", href: "/block-education-officer/promotions", icon: "TrendingUp" },
      { label: "Connect with School", href: "/block-education-officer/connect", icon: "Radio" },
    ],
  },
  DEO: {
    title: "District Education Officer",
    subtitle: "DEO Officer · Coimbatore District",
    avatarLetter: "D",
    avatarColor: "#ec4899",
    themeClass: "theme-deo",
    accentColor: "#ec4899",
    navItems: [
      { label: "Dashboard", href: "/district-education-officer", icon: "Home" },
      { label: "Manage Blocks", href: "/district-education-officer/blocks", icon: "Map" },
      { label: "Manage BEOs", href: "/district-education-officer/beos", icon: "Building2" },
      { label: "District Overview", href: "/district-education-officer/overview", icon: "Map" },
      { label: "School Rankings", href: "/district-education-officer/rankings", icon: "Trophy" },
      { label: "Dropout Heatmap", href: "/district-education-officer/dropout", icon: "Circle" },
      { label: "Teacher Analytics", href: "/district-education-officer/teachers", icon: "User" },
      { label: "Scholarship Tracking", href: "/district-education-officer/scholarship", icon: "GraduationCap" },
      { label: "Learning Outcomes", href: "/district-education-officer/outcomes", icon: "TrendingUp" },
      { label: "Schemes Tracking", href: "/district-education-officer/schemes", icon: "ScrollText" },
      { label: "Infrastructure", href: "/district-education-officer/infrastructure", icon: "Building" },
      { label: "Grievances", href: "/district-education-officer/grievances", icon: "Scale" },
      { label: "Circulars", href: "/district-education-officer/circulars", icon: "Megaphone" },
      { label: "Connect with School", href: "/district-education-officer/connect", icon: "Radio" },
    ],
  },
  COMMISSIONER: {
    title: "Commissioner Portal",
    subtitle: "Commissioner · State Operations",
    avatarLetter: "C",
    avatarColor: "#06b6d4",
    themeClass: "theme-commissioner",
    accentColor: "#06b6d4",
    navItems: [
      { label: "Dashboard", href: "/commissioner", icon: "Home" },
      { label: "Manage DEOs", href: "/commissioner/deos", icon: "Map" },
      { label: "District Comparisons", href: "/commissioner/districts", icon: "Map" },
      { label: "Policy Monitoring", href: "/commissioner/policy", icon: "Scale" },
      { label: "Budget Utilization", href: "/commissioner/budget", icon: "Banknote" },
      { label: "School Performance", href: "/commissioner/performance", icon: "Activity" },
      { label: "Infrastructure Score", href: "/commissioner/infrastructure", icon: "Building" },
      { label: "State Analytics", href: "/commissioner/analytics", icon: "TrendingUp" },
      { label: "Teacher Deployment", href: "/commissioner/teachers", icon: "User" },
      { label: "Schemes Overview", href: "/commissioner/schemes", icon: "ScrollText" },
      { label: "Grievances Redressal", href: "/commissioner/grievances", icon: "Scale" },
      { label: "Announcements", href: "/commissioner/announcements", icon: "Megaphone" },
      { label: "Connect with School", href: "/commissioner/connect", icon: "Radio" },
    ],
  },
  MINISTER: {
    title: "Minister Dashboard",
    subtitle: "Minister · Executive Command Center",
    avatarLetter: "M",
    avatarColor: "#ef4444",
    themeClass: "theme-minister",
    accentColor: "#ef4444",
    navItems: [
      { label: "Command Center", href: "/minister", icon: "Building2" },
      { label: "Manage Commissioners", href: "/minister/commissioners", icon: "Scale" },
      { label: "Live State View", href: "/minister/live", icon: "Radio" },
      { label: "KPI Monitoring", href: "/minister/kpi", icon: "Activity" },
      { label: "AI Predictions", href: "/minister/predictions", icon: "Bot" },
      { label: "District Reports", href: "/minister/districts", icon: "Map" },
      { label: "Policy Intelligence", href: "/minister/policy", icon: "Lightbulb" },
      { label: "Budget Overview", href: "/minister/budget", icon: "Banknote" },
      { label: "Schemes Progress", href: "/minister/schemes", icon: "ScrollText" },
      { label: "Infrastructure Projects", href: "/minister/infrastructure", icon: "Building" },
      { label: "Public Grievances", href: "/minister/grievances", icon: "Scale" },
      { label: "Press & Media", href: "/minister/media", icon: "Newspaper" },
      { label: "Connect with School", href: "/minister/connect", icon: "Radio" },
    ],
  },

  SUPERADMIN: {
    title: "Super Admin Portal",
    subtitle: "System Management & Dynamic Governance",
    avatarLetter: "S",
    avatarColor: "#7c3aed",
    themeClass: "theme-superadmin",
    accentColor: "#7c3aed",
    navItems: [
      { label: "System Dashboard", href: "/super-admin", icon: "Activity" },
      { label: "People & Access", href: "#", icon: "" },

      { label: "DEO Management", href: "/super-admin/deos", icon: "Map" },
      { label: "User Management", href: "/super-admin/users", icon: "Users" },
      { label: "Role & Permissions", href: "/super-admin/roles", icon: "Lock" },
      { label: "School Management", href: "/super-admin/schools", icon: "Building" },
      { label: "Headmaster Management", href: "/super-admin/headmasters", icon: "User" },


      { label: "Academics & Content", href: "#", icon: "" },
      { label: "Academics Hub", href: "/super-admin/academics", icon: "GraduationCap" },
      { label: "Learning Hub", href: "/super-admin/learning-hub", icon: "Book" },
      { label: "PDF Syllabus Upload", href: "/super-admin/syllabus-upload", icon: "Upload" },
      { label: "Syllabus Management", href: "/super-admin/syllabus", icon: "BookOpen" },
      { label: "Material Library", href: "/super-admin/materials", icon: "Box" },
      { label: "Digital Library", href: "/super-admin/digital-library", icon: "Library" },
      { label: "Department Modules", href: "/super-admin/modules", icon: "Calendar" },
      { label: "Competitive Exams", href: "/super-admin/competitive-exams", icon: "Trophy" },

      { label: "System & AI", href: "#", icon: "" },
      { label: "Feature Toggles", href: "/super-admin/features", icon: "🔧" },
      { label: "AI Integration Setup", href: "/super-admin/ai-config", icon: "Bot" },
      { label: "External Storage", href: "/super-admin/storage", icon: "Database" },
      { label: "Data Flow Monitor", href: "/super-admin/data-flow", icon: "RefreshCw" },

      { label: "Governance", href: "#", icon: "" },
      { label: "Manage Ministers", href: "/super-admin/ministers", icon: "Building2" },
      { label: "Page Management", href: "/super-admin/pages", icon: "FileText" },
      { label: "Announcements", href: "/super-admin/announcements", icon: "Megaphone" },

      { label: "Audit & Config", href: "#", icon: "" },
      { label: "System Logs", href: "/super-admin/logs", icon: "FileText" },
      { label: "Portal Settings", href: "/super-admin/settings", icon: "Settings" },
    ],
  },
};

// ============================================================================
// Higher-secondary group / stream menus.
// Class 11-12 students pick a group (Science / Commerce / Computer Science).
// The "Science Labs & Centers" section of the sidebar swaps to match.
// ============================================================================

export type StudentGroup = "Science" | "Commerce" | "ComputerScience" | "Arts" | "Vocational";

// The section header label used to locate the block inside a nav config.
const SCIENCE_SECTION_LABEL = "Science Labs & Centers";

// Items shown under the section for each group (header excluded).
export const GROUP_SCIENCE_SECTIONS: Record<StudentGroup, NavItem[]> = {
  Science: [
    { label: "Science Campus", href: "/student/science-campus", icon: "Sparkles" },
    { label: "Science Book Library", href: "/student/science-library", icon: "BookOpen" },
    { label: "Botany Centre", href: "/student/botany-centre", icon: "Leaf" },
    { label: "Virtual Labs", href: "/student/labs", icon: "FlaskConical" },
    { label: "Science Lab Support", href: "/student/science-lab-support", icon: "FlaskConical" },
    { label: "Chemistry Center", href: "/student/chemistry-lab", icon: "FlaskConical" },
    { label: "Zoology Centre", href: "/student/zoology-centre", icon: "Target" },
    { label: "Computer Education", href: "/student/computer-education", icon: "Monitor" },
  ],
  Commerce: [
    { label: "Commerce Campus", href: "/student/science-campus", icon: "Sparkles" },
    { label: "Book Library", href: "/student/science-library", icon: "BookOpen" },
    { label: "Commerce & Business Lab", href: "/student/science/commerce-lab", icon: "Briefcase" },
    { label: "Accountancy Practice", href: "/student/science/accountancy", icon: "Calculator" },
    { label: "Economics Data Center", href: "/student/science/economics", icon: "TrendingUp" },
    { label: "Business Statistics", href: "/student/science/business-stats", icon: "BarChart3" },
    { label: "Computer Education", href: "/student/computer-education", icon: "Monitor" },
  ],
  ComputerScience: [
    { label: "CS Campus", href: "/student/science-campus", icon: "Sparkles" },
    { label: "Book Library", href: "/student/science-library", icon: "BookOpen" },
    { label: "Programming Lab", href: "/student/science/programming-lab", icon: "Code" },
    { label: "Computer Science Lab", href: "/student/science/cs-lab", icon: "Cpu" },
    { label: "Web Technology Lab", href: "/student/science/web-tech", icon: "Globe" },
    { label: "Database & SQL Lab", href: "/student/science/database-lab", icon: "Database" },
    { label: "AI & Machine Learning", href: "/student/science/ai-ml", icon: "Bot" },
    { label: "Robotics & AI Lab", href: "/student/science/robotics", icon: "Bot" },
    { label: "Computer Education", href: "/student/computer-education", icon: "Monitor" },
  ],
  Arts: [
    { label: "Arts Campus", href: "/student/science-campus", icon: "Sparkles" },
    { label: "Book Library", href: "/student/science-library", icon: "BookOpen" },
    { label: "Geography & Mapping", href: "/student/science/geography-lab", icon: "Globe" },
    { label: "History & Heritage Hub", href: "/student/science/history-hub", icon: "Landmark" },
    { label: "Civics & Politics Lab", href: "/student/science/civics-hub", icon: "Scale" },
    { label: "Economics Data Center", href: "/student/science/economics", icon: "TrendingUp" },
  ],
  Vocational: [
    { label: "Vocational Campus", href: "/student/science-campus", icon: "Sparkles" },
    { label: "Book Library", href: "/student/science-library", icon: "BookOpen" },
    { label: "Trades & Tech Hub", href: "/student/science/vocational-campus", icon: "Wrench" },
    { label: "Basic Electrical Lab", href: "/student/science/electrical-lab", icon: "Zap" },
    { label: "Agriculture Lab", href: "/student/science/agriculture-lab", icon: "Sprout" },
    { label: "Office & Web Design", href: "/student/science/office-mgmt", icon: "Award" },
  ],
};

// Test-prep links that only make sense for particular higher-secondary groups.
// Links not listed here are visible to every group.
const GROUP_RESTRICTED_LINKS: Record<string, StudentGroup[]> = {
  "/student/neet-prep": ["Science"],
  // /student/higher-secondary/competitive is group-aware, so every group keeps it.
  "/student/science-draw-mat": ["Science"],
};

// Return a copy of `items` with the Science Labs & Centers section replaced by
// the section that matches the student's group, and group-restricted links
// (NEET prep etc.) removed for groups they don't apply to.
export function applyStudentGroup(items: NavItem[], group: StudentGroup): NavItem[] {
  let result = items;
  if (group !== "Science") {
    const start = result.findIndex((it) => it.label === SCIENCE_SECTION_LABEL);
    if (start !== -1) {
      // The section runs until the next "---" separator (or end of list).
      let end = result.findIndex((it, i) => i > start && it.label === "---");
      if (end === -1) end = result.length;
      result = [
        ...result.slice(0, start + 1),
        ...GROUP_SCIENCE_SECTIONS[group],
        ...result.slice(end),
      ];
    }
  }
  return result.filter((it) => {
    const allowed = GROUP_RESTRICTED_LINKS[it.href];
    return !allowed || allowed.includes(group);
  });
}
