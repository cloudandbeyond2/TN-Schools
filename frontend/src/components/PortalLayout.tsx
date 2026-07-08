"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { roleConfigs, NavItem, applyStudentGroup, StudentGroup } from "@/lib/navConfig";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "next-themes";
import { LucideIcon } from "@/components/LucideIcon";
import { Menu, Bell, Globe, ChevronDown, User, Settings, HelpCircle, LogOut } from "lucide-react";

interface PortalLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  avatarLetter?: string;
  avatarColor?: string;
  navItems?: NavItem[];
  themeClass?: string;
  accentColor?: string;
  hideSidebar?: boolean;
}

const translations = {
  English: {
    liveConnection: "Live Connection",
    notificationsTitle: "Notifications",
    markAllRead: "Mark all read",
    noNotifications: "No new notifications",
    profileTitle: "My Profile",
    settings: "Account Settings",
    help: "Help & Support",
    signOut: "Sign Out",
    role: "Role",
    notifications: {
      TEACHER: [
        "Senthil K. (Class 8A) flagged as high dropout risk. ⚠️",
        "New lesson plan generated for Grade 10 Science. 🔬",
        "Leave request Casual Leave approved by Headmaster. ✓",
      ],
      STUDENT: [
        "New assignment added: Science Lab Report. 📝",
        "You received a 'Star Scientist' badge from Mr. Ramesh! 🏅",
        "Upcoming Mock Test: Mathematics on Monday. 📅",
      ],
      PARENT: [
        "Arjun's attendance today marked Present (98% overall). 🟢",
        "New teacher note: Please check homework submission. 💬",
        "Upcoming PTA Meeting scheduled for June 24th. 🤝",
      ],
      DEFAULT: [
        "Welcome to the Tamil Nadu Smart Education Portal. 🏛️",
        "Please verify your profile details and EMIS registry. 👤",
        "Weekly state progress reports are now available. 📊",
      ]
    }
  },
  "தமிழ்": {
    nav: {
      "Student Portal": "மாணவர் வலைவாசல்",
      "Parent Portal": "பெற்றோர் வலைவாசல்",
      "Teacher Portal": "ஆசிரியர் வலைவாசல்",
      "Headmaster Portal": "தலைமையாசிரியர் வலைவாசல்",
      "Block Education Officer": "வட்டாரக் கல்வி அலுவலர்",
      "District Education Officer": "மாவட்டக் கல்வி அலுவலர்",
      "Commissioner Portal": "ஆணையர் வலைவாசல்",
      "Minister Dashboard": "அமைச்சர் முகப்பு",
      "Super Admin": "சூப்பர் அட்மின்",
      "Portal Home": "முகப்பு",
      "AI Tutor": "AI ஆசிரியர்",
      "AI Lessons": "AI பாடங்கள்",
      "Digital Library": "டிஜிட்டல் நூலகம்",
      "Personal Guide": "தனிப்பட்ட வழிகாட்டி",
      "Assessments": "மதிப்பீடுகள்",
      "Academic History": "கல்வி வரலாறு",
      "Dashboard": "டாஷ்போர்டு",
      "Academics & Subjects": "கல்வி & பாடங்கள்",
      "Learning Hub": "கற்றல் மையம்",
      "Class Syllabus Board": "வகுப்பு பாடத்திட்ட பலகை",
      "My Subjects": "எனது பாடங்கள்",
      "Homework": "வீட்டுப்பாடம்",
      "Self-Study Plan": "சுய-கற்றல் திட்டம்",
      "Exams & Assessments": "தேர்வுகள் & மதிப்பீடுகள்",
      "Fun Quizzes": "வேடிக்கை வினாடி வினாக்கள்",
      "Competitive Exams": "போட்டித் தேர்வுகள்",
      "Test Preparation": "தேர்வுத் தயாரிப்பு",
      "NEET Preparation": "நீட் தேர்வுத் தயாரிப்பு",
      "Maths Formulas": "கணித சூத்திரங்கள்",
      "Science Draw Mat": "அறிவியல் வரைதல் விரிப்பு",
      "Language Coaching": "மொழி பயிற்சி",
      "3D Preview": "3D முன்னோட்டம்",
      "Science Labs & Centers": "அறிவியல் ஆய்வகங்கள் & மையங்கள்",
      "Virtual Labs": "மெய்நிகர் ஆய்வகங்கள்",
      "Science Lab Support": "அறிவியல் ஆய்வக ஆதரவு",
      "Chemistry Lab": "வேதியியல் ஆய்வகம்",
      "Zoology Centre": "விலங்கியல் மையம்",
      "Science Campus": "அறிவியல் வளாகம்",
      "Science Book Library": "அறிவியல் நூலகம்",
      "Botany Centre": "தாவரவியல் மையம்",
      "Computer Education": "கணினி கல்வி",
      "Extracurricular & Wellbeing": "பாடத்திட்டம் அல்லாத & நல்வாழ்வு",
      "Sports & Athletics": "விளையாட்டு & தடகள",
      "Extracurriculars": "பாடத்திட்டம் அல்லாதவை",
      "Celebrations": "கொண்டாட்டங்கள்",
      "Cultural Events": "கலாச்சார நிகழ்வுகள்",
      "My Health Report": "எனது சுகாதார அறிக்கை",
      "Wellness": "நல்வாழ்வு",
      "School & Career": "பள்ளி & தொழில்",
      "Announcements": "அறிவிப்புகள்",
      "My Badges": "எனது பதக்கங்கள்",
      "Story Books": "கதை புத்தகங்கள்",
      "Digital Portfolio": "டிஜிட்டல் போர்ட்ஃபோலியோ",
      "Learning Platform": "கற்றல் தளம்",
      "School Press": "பள்ளி செய்தி இதழ்",
      "Welfare & Benefits": "நலன் & நன்மைகள்",
      "Leave Reports": "விடுப்பு அறிக்கைகள்",
      "Support & Safety": "ஆதரவு & பாதுகாப்பு",
      "Personal Counsellor": "தனிப்பட்ட ஆலோசகர்",
      "Report a Concern": "புகார் அளிக்கவும்",
      "Board Prep": "பொதுத் தேர்வுத் தயாரிப்பு",
      "Mock Tests": "மாதிரித் தேர்வுகள்",
      "Study Boost": "கற்றல் ஊக்கம்",
      "Career Aptitude": "தொழில் திறன்",
      "Scholarships": "உதவித்தொகைகள்",
      "NEET/JEE Prep": "NEET/JEE தயாரிப்பு",
      "College Admissions": "கல்லூரி சேர்க்கை",
      "My Classes": "எனது வகுப்புகள்",
      "Science Labs": "அறிவியல் ஆய்வகங்கள்",
      "Subject Analytics": "பொருள் பகுப்பாய்வு",
      "Academics & Guidance": "கல்வி & வழிகாட்டுதல்",
      "Admin & Tools": "நிர்வாகம் & கருவிகள்",
      "AI Lesson Planner": "AI பாடத் திட்டமிடுபவர்",
      "Question Generator": "கேள்வி உருவாக்கி",
      "AI Evaluation": "AI மதிப்பீடு",
      "Student Management": "மாணவர் நிர்வாகம்",
      "Student Profiles": "மாணவர் விவரங்கள்",
      "Student Status": "மாணவர் நிலை",
      "Homework Manager": "வீட்டுப்பாட மேலாளர்",
      "Scholarship Details": "உதவித்தொகை விவரங்கள்",
      "Student Analytics": "மாணவர் பகுப்பாய்வு",
      "Risk Alerts": "ஆபத்து எச்சரிக்கைகள்",
      "Parent Management": "பெற்றோர் நிர்வாகம்",
      "Resources & Admin": "வளங்கள் & நிர்வாகம்",
      "AI Material Hub": "AI பொருள் மையம்",
      "Add Materials": "பொருட்களைச் சேர்",
      "Daily Attendance": "தினசரி வருகை",
      "Leave Requests": "விடுப்பு கோரிக்கைகள்",
      "Club Events": "கிளப் நிகழ்வுகள்",
      "Interactive Modules": "ஊடாடும் தொகுதிகள்",
      "Child Performance": "குழந்தை செயல்பாடு",
      "Attendance": "வருகை",
      "Homework Status": "வீட்டுப்பாட நிலை",
      "Notifications": "அறிவிப்புகள்",
      "Child Health Report": "குழந்தை சுகாதார அறிக்கை",
      "AI Assistant": "AI உதவியாளர்",
      "Scholarship": "உதவித்தொகை",
      "PTA Meetings": "PTA கூட்டங்கள்",
      "People & Staff": "பணியாளர்கள்",
      "Student Monitoring": "மாணவர் கண்காணிப்பு",
      "Promotions": "பதவி உயர்வுகள்",
      "Staff Management": "பணியாளர் நிர்வாகம்",
      "Temporary Staff": "தற்காலிக பணியாளர்கள்",
      "Parents Details": "பெற்றோர்கள் விவரங்கள்",
      "School Alumni": "பள்ளி முன்னாள் மாணவர்கள்",
      "Academics & Records": "கல்வி & பதிவுகள்",
      "Timetable": "கால அட்டவணை",
      "Exam Schedule": "தேர்வு அட்டவணை",
      "Model Exam Results": "மாதிரி தேர்வு முடிவுகள்",
      "Manage Mock Tests": "மாதிரித் தேர்வுகளை நிர்வகி",
      "School Admin & Govt": "பள்ளி நிர்வாகம் & அரசு",
      "School Resources": "பள்ளி வளங்கள்",
      "Mid-Day Meal": "மதிய உணவு",
      "Govt Schemes Update": "அரசு திட்டங்கள் அப்டேட்",
      "Extra Curricular & Info": "கூடுதல் பாடத்திட்டம் & தகவல்",
      "Public Portal Page": "பொது வலைவாசல் பக்கம்",
      "School Events": "பள்ளி நிகழ்வுகள்",
      "Media Gallery": "மீடியா கேலரி",
      "Rewards & Honors": "வெகுமதிகள் & மரியாதைகள்",
      "School History": "பள்ளி வரலாறு",
      "Clubs & Activities": "கிளப்புகள் & செயல்பாடுகள்",
      "Promotion Approvals": "பதவி உயர்வு ஒப்புதல்கள்",
      "Manage Headmasters": "தலைமையாசிரியர்களை நிர்வகி",
      "School Comparisons": "பள்ளி ஒப்பீடுகள்",
      "Attendance Analytics": "வருகை பகுப்பாய்வு",
      "Exam Analytics": "தேர்வு பகுப்பாய்வு",
      "Infrastructure": "உள்கட்டமைப்பு",
      "Teacher Deployment": "ஆசிரியர் நியமனம்",
      "Dropouts Tracking": "இடைநின்றவர்கள் கண்காணிப்பு",
      "Schemes Update": "திட்டங்கள் அப்டேட்",
      "Grievances": "குறைகள்",
      "Financial Reports": "நிதி அறிக்கைகள்",
      "Circulars": "சுற்றறிக்கைகள்",
      "Connect with School": "பள்ளியுடன் தொடர்பு",
      "Manage BEOs": "BEO களை நிர்வகி",
      "District Overview": "மாவட்ட கண்ணோட்டம்",
      "School Rankings": "பள்ளி தரவரிசை",
      "Dropout Heatmap": "இடைநின்றவர்கள் வரைபடம்",
      "Teacher Analytics": "ஆசிரியர் பகுப்பாய்வு",
      "Scholarship Tracking": "உதவித்தொகை கண்காணிப்பு",
      "Learning Outcomes": "கற்றல் விளைவுகள்",
      "Block Comparisons": "வட்டார ஒப்பீடுகள்",
      "Schemes Tracking": "திட்டங்கள் கண்காணிப்பு",
      "Manage DEOs": "DEO களை நிர்வகி",
      "District Comparisons": "மாவட்ட ஒப்பீடுகள்",
      "Policy Monitoring": "கொள்கை கண்காணிப்பு",
      "Budget Utilization": "பட்ஜெட் பயன்பாடு",
      "School Performance": "பள்ளி செயல்பாடு",
      "Infrastructure Score": "உள்கட்டமைப்பு மதிப்பெண்",
      "State Analytics": "மாநில பகுப்பாய்வு",
      "Schemes Overview": "திட்டங்கள் கண்ணோட்டம்",
      "Grievances Redressal": "குறைகள் தீர்வு",
      "Command Center": "கட்டளை மையம்",
      "Manage Commissioners": "ஆணையர்களை நிர்வகி",
      "Live State View": "நேரடி மாநில பார்வை",
      "KPI Monitoring": "KPI கண்காணிப்பு",
      "AI Predictions": "AI கணிப்புகள்",
      "District Reports": "மாவட்ட அறிக்கைகள்",
      "Policy Intelligence": "கொள்கை நுண்ணறிவு",
      "Budget Overview": "பட்ஜெட் கண்ணோட்டம்",
      "Schemes Progress": "திட்டங்கள் முன்னேற்றம்",
      "Infrastructure Projects": "உள்கட்டமைப்பு திட்டங்கள்",
      "Public Grievances": "பொது மக்கள் குறைகள்",
      "Press & Media": "பத்திரிகை & ஊடகம்",
      "System Dashboard": "கணினி டாஷ்போர்டு",
      "People & Access": "பயனர்கள் & அணுகல்",
      "User Management": "பயனர் மேலாண்மை",
      "Role & Permissions": "பங்கு & அனுமதிகள்",
      "School Management": "பள்ளி மேலாண்மை",
      "Headmaster Management": "தலைமையாசிரியர் மேலாண்மை",
      "Academics & Content": "கல்வி & உள்ளடக்கம்",
      "PDF Syllabus Upload": "PDF பாடத்திட்ட பதிவேற்றம்",
      "Syllabus Management": "பாடத்திட்ட மேலாண்மை",
      "Material Library": "பொருள் நூலகம்",
      "Department Modules": "துறை தொகுதிகள்",
      "System & AI": "கணினி & AI",
      "Feature Toggles": "அம்ச மாற்றங்கள்",
      "AI Integration Setup": "AI ஒருங்கிணைப்பு அமைப்பு",
      "Data Flow Monitor": "தரவு ஓட்டம் கண்காணிப்பு",
      "Governance": "ஆளுமை",
      "Manage Ministers": "அமைச்சர்களை நிர்வகி",
      "Page Management": "பக்க மேலாண்மை",
      "Audit & Config": "தணிக்கை & கட்டமைப்பு",
      "System Logs": "கணினி பதிவுகள்",
      "Portal Settings": "வலைவாசல் அமைப்புகள்"
    },
    liveConnection: "நேரடி இணைப்பு",
    notificationsTitle: "அறிவிப்புகள்",
    markAllRead: "அனைத்தையும் படித்ததாகக் குறி",
    noNotifications: "புதிய அறிவிப்புகள் இல்லை",
    profileTitle: "எனது சுயவிவரம்",
    settings: "கணக்கு அமைப்புகள்",
    help: "உதவி & ஆதரவு",
    signOut: "வெளியேறு",
    role: "பங்கு",
    notifications: {
      TEACHER: [
        "செந்தில் கே. (வகுப்பு 8A) அதிக விலகல் அபாயத்தில் உள்ளார். ⚠️",
        "வகுப்பு 10 அறிவியலுக்கான புதிய பாடத்திட்டம் உருவாக்கப்பட்டது. 🔬",
        "உங்களின் தற்செயல் விடுப்பு கோரிக்கை தலைமையாசிரியரால் அங்கீகரிக்கப்பட்டது. ✓",
      ],
      STUDENT: [
        "புதிய ஒப்படைப்பு சேர்க்கப்பட்டது: அறிவியல் ஆய்வக அறிக்கை. 📝",
        "திரு. ரமேஷிடம் இருந்து 'நட்சத்திர விஞ்ஞானி' பேட்ஜ் பெற்றுள்ளீர்கள்! 🏅",
        "வரவிருக்கும் மாதிரித் தேர்வு: திங்கள் அன்று கணிதம். 📅",
      ],
      PARENT: [
        "அர்ஜுனின் இன்றைய வருகை பதிவு செய்யப்பட்டுள்ளது (ஒட்டுமொத்தமாக 98%). 🟢",
        "புதிய ஆசிரியர் குறிப்பு: வீட்டுப்பாடச் சமர்ப்பிப்பைச் சரிபார்க்கவும். 💬",
        "ஜூன் 24-ஆம் தேதி திட்டமிடப்பட்ட பெற்றோர் ஆசிரியர் கூட்டத்தில் பங்கேற்கவும். 🤝",
      ],
      DEFAULT: [
        "தமிழ்நாடு ஸ்மார்ட் கல்விப் போர்ட்டலுக்கு உங்களை வரவேற்கிறோம். 🏛️",
        "உங்கள் சுயவிவர விவரங்கள் மற்றும் EMIS பதிவைச் சரிபார்க்கவும். 👤",
        "வாராந்திர மாநில முன்னேற்ற அறிக்கைகள் இப்போது கிடைக்கின்றன. 📊",
      ]
    }
  }
};

export default function PortalLayout({
  children,
  title,
  subtitle,
  avatarLetter,
  avatarColor,
  navItems,
  themeClass,
  accentColor,
  hideSidebar = false,
}: PortalLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<"English" | "தமிழ்">("English");

  useEffect(() => {
    const savedLang = localStorage.getItem("portal-language");
    if (savedLang === "English" || savedLang === "தமிழ்") {
      setCurrentLanguage(savedLang);
    }
  }, []);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [activeStudentLevel, setActiveStudentLevel] = useState("STUDENT_HIGHER");
  const [studentGroup, setStudentGroup] = useState<StudentGroup>("Science");
  const [disabledRoutes, setDisabledRoutes] = useState<Set<string>>(new Set());
  const { data: session, status } = useSession();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Preserve and restore sidebar scroll position
  useEffect(() => {
    const savedScrollTop = sessionStorage.getItem("sidebar-scroll");
    if (savedScrollTop && navRef.current) {
      navRef.current.scrollTop = parseInt(savedScrollTop, 10);
    } else {
      const activeItem = navRef.current?.querySelector(".sidebar-item.active");
      if (activeItem) {
        activeItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [disabledRoutes, pathname]);

  const handleScroll = () => {
    if (navRef.current) {
      sessionStorage.setItem("sidebar-scroll", navRef.current.scrollTop.toString());
    }
  };

  const fetchNotifications = async () => {
    if (!session?.user) return;
    const userId = (session.user as any).id;
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications?userId=${userId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setNotificationsList(data.data);
        setUnreadCount(data.data.filter((n: any) => !n.read).length);
      }
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!session?.user) return;
    const userId = (session.user as any).id;
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        setNotificationsList(notificationsList.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Error marking notifications as read", err);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: "PUT",
      });
      const data = await res.json();
      if (data.success) {
        setNotificationsList(notificationsList.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Error marking notification as read", err);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [status, session]);
  
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep the sidebar's group (Science / Commerce / Computer Science) in sync
  // with the choice made on the Science Campus page.
  useEffect(() => {
    const readGroup = () => {
      const g = localStorage.getItem("studentGroup");
      if (g === "Science" || g === "Commerce" || g === "ComputerScience") {
        setStudentGroup(g);
      }
    };
    readGroup();
    window.addEventListener("studentGroupChange", readGroup);
    window.addEventListener("storage", readGroup);
    return () => {
      window.removeEventListener("studentGroupChange", readGroup);
      window.removeEventListener("storage", readGroup);
    };
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/student/middle-school")) {
      localStorage.setItem("studentLevel", "STUDENT_MIDDLE");
      setActiveStudentLevel("STUDENT_MIDDLE");
    } else if (pathname.startsWith("/student/high-school")) {
      localStorage.setItem("studentLevel", "STUDENT_HIGH");
      setActiveStudentLevel("STUDENT_HIGH");
    } else if (pathname.startsWith("/student/higher-secondary")) {
      localStorage.setItem("studentLevel", "STUDENT_HIGHER");
      setActiveStudentLevel("STUDENT_HIGHER");
    } else if (pathname !== "/student") {
      const stored = localStorage.getItem("studentLevel");
      if (stored) setActiveStudentLevel(stored);
    }
  }, [pathname]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    fetch(`${apiUrl}/api/pages`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const disabled = new Set<string>(
            data.data.filter((p: { isEnabled: boolean; route: string }) => !p.isEnabled).map((p: { route: string }) => p.route)
          );
          setDisabledRoutes(disabled);
        }
      })
      .catch(() => {});
  }, []);

  // Redirect to sign-in page if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Loading indicator screen
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center text-center p-6">
        <div className="w-10 h-10 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin mb-4" />
        <p className="text-xs text-[var(--text-muted)]">Checking credentials...</p>
      </div>
    );
  }

  // Double check auth fallback
  if (!session) {
    return null;
  }

  // Get active role from NextAuth token
  let userRole = (session?.user as any)?.role || "STUDENT";

  // Re-map student roles to specialized configurations based on path
  if (userRole === "STUDENT") {
    if (pathname.startsWith("/student/middle-school")) {
      userRole = "STUDENT_MIDDLE";
    } else if (pathname.startsWith("/student/high-school")) {
      userRole = "STUDENT_HIGH";
    } else if (pathname.startsWith("/student/higher-secondary")) {
      userRole = "STUDENT_HIGHER";
    } else if (pathname === "/student") {
      // Leave as generic STUDENT for the portal landing page
    } else {
      // Default to last active level for common tools
      userRole = activeStudentLevel;
    }
  }

  const currentConfig = roleConfigs[userRole];

  // Resolve configuration falling back to central store
  const isDark = mounted && theme === "dark";
  const resolvedAccentColor = isDark ? "#2dce89" : (accentColor || currentConfig?.accentColor || "#6366f1");
  const resolvedThemeClass = themeClass || currentConfig?.themeClass || "theme-student";
  let resolvedNavItems = navItems || currentConfig?.navItems || [];
  // Higher-secondary students in the Commerce / Computer Science group get a
  // group-specific "Science Labs & Centers" section.
  if (!navItems && userRole === "STUDENT_HIGHER") {
    resolvedNavItems = applyStudentGroup(resolvedNavItems, studentGroup);
  }
  
  // Subject-wise filtering mapping for interactive modules
  const subjectRoutes: Record<string, string[]> = {
    "Mathematics": ["/teacher/maths-formulas", "/teacher/3d-preview", "/teacher/neet-prep"],
    "Science": ["/teacher/science-draw-mat", "/teacher/science-lab-support", "/teacher/chemistry-lab", "/teacher/zoology-centre", "/teacher/labs", "/teacher/neet-prep", "/teacher/3d-preview"],
    "Physics": ["/teacher/science-draw-mat", "/teacher/science-lab-support", "/teacher/labs", "/teacher/neet-prep", "/teacher/3d-preview"],
    "Chemistry": ["/teacher/chemistry-lab", "/teacher/science-lab-support", "/teacher/labs", "/teacher/neet-prep", "/teacher/3d-preview"],
    "Biology": ["/teacher/zoology-centre", "/teacher/science-lab-support", "/teacher/labs", "/teacher/neet-prep", "/teacher/3d-preview"],
    "Zoology": ["/teacher/zoology-centre", "/teacher/science-lab-support", "/teacher/labs", "/teacher/neet-prep", "/teacher/3d-preview"],
    "Botany": ["/teacher/science-lab-support", "/teacher/labs", "/teacher/neet-prep", "/teacher/3d-preview"],
    "English": ["/teacher/language-coaching"],
    "Tamil": ["/teacher/language-coaching"],
    "Computer Science": ["/teacher/computer-education"],
  };

  const subjectRestrictedRoutes = new Set(Object.values(subjectRoutes).flat());
  const userSubject = (session?.user as any)?.subject || "";
  const userClass = (session?.user as any)?.class || "";

  let filteredNavItems: NavItem[] =
    userRole === "SUPERADMIN"
      ? resolvedNavItems
      : resolvedNavItems.filter((item) => {
          if (item.href !== "#" && item.label !== "---" && disabledRoutes.has(item.href)) {
            return false;
          }
          
          if (userRole === "TEACHER" && subjectRestrictedRoutes.has(item.href)) {
            // It's a restricted route, check if teacher's subject allows it
            const allowedRoutesForSubject = subjectRoutes[userSubject] || [];
            return allowedRoutesForSubject.includes(item.href);
          }

          if (item.label === "Maths Formulas") {
            const classNum = String(userClass).match(/\d+/)?.[0];
            return classNum === "6";
          }
          
          return true;
        });

  // Clean up empty sections (headers and dividers without following links)
  filteredNavItems = filteredNavItems.filter((item, i, arr) => {
    if (item.href === "#" || item.label === "---") {
      let hasChildren = false;
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[j].href !== "#" && arr[j].label !== "---") {
          hasChildren = true;
          break;
        }
        if (arr[j].href === "#" || arr[j].label === "---") {
          break;
        }
      }
      return hasChildren;
    }
    return true;
  });

  const resolvedTitle = title || currentConfig?.title || "Portal Dashboard";
  let resolvedSubtitle = subtitle || currentConfig?.subtitle || "";
  if (session?.user?.name) {
    const s = session.user as any;
    // Base replacement of default dummy names with actual logged-in user name
    resolvedSubtitle = resolvedSubtitle
      .replace("Mrs. Sumathi Devi", s.name)
      .replace("Sumathi Devi", s.name)
      .replace("Arjun Kumar", s.name)
      .replace("Arjun", s.name)
      .replace("Rajesh Kumar", s.name)
      .replace("Mr. Venkatesh R.", s.name)
      .replace("Mr. Murugesan P.", s.name)
      .replace("DEO Officer", s.name)
      .replace("Commissioner", s.name)
      .replace("Minister", s.name)
      .replace("System Management", s.name);

    if (s.schoolName && s.schoolDise) {
      if (userRole === "TEACHER") {
        const subject = s.subject || "General";
        resolvedSubtitle = `${s.name} · ${subject}`;
      } else {
        resolvedSubtitle = `${s.name} · ${s.schoolName} · DISE: ${s.schoolDise}`;
      }
    } else if (userRole === "TEACHER") {
      // Fallback if no school info
      const subject = s.subject || "General";
      resolvedSubtitle = `${s.name} · ${subject}`;
    }
  }
  const resolvedAvatarLetter = avatarLetter || currentConfig?.avatarLetter || "P";

  // Enforce access mapping rules
  let isAuthorized = true;
  let expectedRole = "";
  let fallbackPath = "/student";

  if (pathname.startsWith("/teacher")) {
    isAuthorized = userRole === "TEACHER" || pathname === "/teacher/profile";
    expectedRole = "TEACHER";
    fallbackPath = "/teacher";
  } else if (pathname.startsWith("/student")) {
    isAuthorized = userRole === "STUDENT" || userRole === "STUDENT_MIDDLE" || userRole === "STUDENT_HIGH" || userRole === "STUDENT_HIGHER";
    expectedRole = "STUDENT";
    fallbackPath = "/student";
  } else if (pathname.startsWith("/pet")) {
    isAuthorized = userRole === "PET";
    expectedRole = "PET";
    fallbackPath = "/pet";
  } else if (pathname.startsWith("/parent")) {
    isAuthorized = userRole === "PARENT";
    expectedRole = "PARENT";
    fallbackPath = "/parent";
  } else if (pathname.startsWith("/headmaster")) {
    isAuthorized = userRole === "HEADMASTER";
    expectedRole = "HEADMASTER";
    fallbackPath = "/headmaster";
  } else if (pathname.startsWith("/block-education-officer")) {
    isAuthorized = userRole === "BEO";
    expectedRole = "BEO";
    fallbackPath = "/block-education-officer";
  } else if (pathname.startsWith("/district-education-officer")) {
    isAuthorized = userRole === "DEO";
    expectedRole = "DEO";
    fallbackPath = "/district-education-officer";
  } else if (pathname.startsWith("/commissioner")) {
    isAuthorized = userRole === "COMMISSIONER";
    expectedRole = "COMMISSIONER";
    fallbackPath = "/commissioner";
  } else if (pathname.startsWith("/minister")) {
    isAuthorized = userRole === "MINISTER";
    expectedRole = "MINISTER";
    fallbackPath = "/minister";
  } else if (pathname.startsWith("/super-admin")) {
    isAuthorized = userRole === "SUPERADMIN";
    expectedRole = "SUPERADMIN";
    fallbackPath = "/super-admin";
  }

  // Render Access Denied error sheet if unauthorized role tries to access
  if (!isAuthorized) {
    let defaultDest = "/";
    if (userRole === "STUDENT" || userRole === "STUDENT_MIDDLE" || userRole === "STUDENT_HIGH" || userRole === "STUDENT_HIGHER") defaultDest = "/student";
    else if (userRole === "TEACHER") defaultDest = "/teacher";
    else if (userRole === "PET") defaultDest = "/pet";
    else if (userRole === "PARENT") defaultDest = "/parent";
    else if (userRole === "HEADMASTER") defaultDest = "/headmaster";
    else if (userRole === "BEO") defaultDest = "/block-education-officer";
    else if (userRole === "DEO") defaultDest = "/district-education-officer";
    else if (userRole === "COMMISSIONER") defaultDest = "/commissioner";
    else if (userRole === "MINISTER") defaultDest = "/minister";
    else if (userRole === "SUPERADMIN") defaultDest = "/super-admin";

    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-3xl space-y-5 flex flex-col items-center shadow-lg">
          <span className="text-4xl text-red-500">⚠️</span>
          <h2 className="text-[var(--text-heading)] text-lg font-bold">Unauthorized Portal Access</h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Your authenticated role is <strong className="text-red-400 font-bold">{userRole}</strong>.
            You are not authorized to view the <strong className="text-amber-500 font-bold">{expectedRole}</strong> dashboard pages.
          </p>
          <div className="flex gap-3 w-full pt-3">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex-1 py-2.5 rounded-xl border border-[var(--border-light)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--bg-card-hover)] transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={16} /> Sign Out
            </button>
            <Link
              href={defaultDest}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-semibold text-slate-950 transition-all flex items-center justify-center gap-2 text-center"
            >
              <i className="fi fi-rr-home"></i> My Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const t = translations[currentLanguage];
  let roleKey: "TEACHER" | "STUDENT" | "PARENT" | "DEFAULT" = "DEFAULT";
  if (userRole.includes("TEACHER")) {
    roleKey = "TEACHER";
  } else if (userRole.includes("STUDENT")) {
    roleKey = "STUDENT";
  } else if (userRole.includes("PARENT")) {
    roleKey = "PARENT";
  }
  const roleNotifications = t.notifications[roleKey];

  // Adjust avatar parameters dynamically using session profile data
  const displayName = session?.user?.name || resolvedTitle;
  const displayEmail = session?.user?.email || resolvedSubtitle;
  const userSection = (session?.user as any)?.section;
  const classDisplay = userClass && userSection ? `Class ${userClass} - ${userSection}` : (userClass ? `Class ${userClass}` : "");
  const letter = displayName ? displayName.charAt(0).toUpperCase() : resolvedAvatarLetter;

  return (
    <div className={`min-h-screen bg-[var(--bg-main)] ${resolvedThemeClass}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? "open" : ""}`}>
        {/* Logo Section */}
        <div className="px-6 mb-6 flex items-center gap-3 mt-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl shrink-0">🏛️</span>
            <div className="leading-tight text-left">
              <span className="block text-base font-black text-[var(--text-heading)]">TN Schools</span>
              <span className="block text-[10px] font-semibold text-[var(--text-muted)] tracking-wider">AI Ecosystem</span>
            </div>
          </Link>
        </div>

        {/* User Profile Section */}
        <div onClick={() => router.push("/teacher/profile")} className="mx-4 p-3 border border-[var(--border)] rounded-2xl flex items-center gap-3 mb-6 bg-slate-50/50 dark:bg-slate-900/20 hover:bg-slate-100/50 dark:hover:bg-slate-800/20 transition-all block cursor-pointer">
          <div className="relative shrink-0">
             <div
               className="w-10 h-10 rounded-full text-white text-base font-bold flex items-center justify-center shadow-sm"
               style={{ background: `linear-gradient(135deg, ${resolvedAccentColor}, ${resolvedAccentColor}dd)` }}
             >
               {letter}
             </div>
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--bg-sidebar)] rounded-full"></div>
          </div>
          <div className="min-w-0 text-left flex flex-col justify-center">
            <div className="text-sm font-bold text-[var(--text-heading)] truncate">{displayName}</div>
            {classDisplay && <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 truncate mt-0.5">{classDisplay}</div>}
            <div className="text-[10px] text-[var(--text-muted)] truncate capitalize">{userRole.replace(/_/g, " ").toLowerCase()}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav ref={navRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
          <div className="px-5 mb-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            MAIN
          </div>
          {filteredNavItems.map((item, index) => {
            if (item.label === "---") {
              return <div key={`sep-${index}`} className="my-4 mx-4 border-t border-[var(--border)]" />;
            }
            if (item.href === "#") {
              return (
                <div key={`header-${index}`} className="px-5 mt-6 mb-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  {currentLanguage === "தமிழ்" ? ((t as any).nav?.[item.label] || item.label) : item.label}
                </div>
              );
            }

            const isActive = pathname === item.href || (
              pathname.startsWith(item.href + "/") &&
              !filteredNavItems.some(otherItem => 
                otherItem.href !== item.href && 
                otherItem.href !== "#" && 
                pathname.startsWith(otherItem.href + "/") && 
                otherItem.href.length > item.href.length
              ) &&
              !filteredNavItems.some(otherItem =>
                otherItem.href !== item.href &&
                otherItem.href !== "#" &&
                pathname === otherItem.href
              )
            );
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-item ${isActive ? "active" : ""}`}
                scroll={false}
              >
                <span className={`flex items-center justify-center transition-opacity ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}>
                  {item.icon ? <LucideIcon name={item.icon as string} className="w-[18px] h-[18px]" /> : null}
                </span>
                <span>{currentLanguage === "தமிழ்" ? ((t as any).nav?.[item.label] || item.label) : item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 mt-4 mb-4">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="sidebar-item text-[var(--text-muted)] hover:text-red-500 text-left w-full flex items-center gap-2"
          >
            <LogOut size={18} className="opacity-80" />
            <span>{t.signOut}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Click outside overlays to close popups */}
      {(isNotificationsOpen || isProfileOpen || isLanguageDropdownOpen) && (
        <div
          className="fixed inset-0 z-20 bg-transparent"
          onClick={() => {
            setIsNotificationsOpen(false);
            setIsProfileOpen(false);
            setIsLanguageDropdownOpen(false);
          }}
        />
      )}

      {/* Main Content Area */}
      <div 
        className="main-content relative min-h-screen transition-all duration-300"
        style={hideSidebar ? { marginLeft: 0, width: '100%' } : undefined}
      >
        {/* Argon Header Background Gradient */}
        <div 
          className="absolute top-0 left-0 right-0 h-[300px] transition-all duration-300 pointer-events-none main-content-header-bg"
          style={{
            background: `linear-gradient(87deg, ${resolvedAccentColor} 0%, ${resolvedAccentColor}dd 100%)`
          }}
        />

        {/* Topbar */}
        <header className="topbar relative z-30 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 flex-1">
            {/* Mobile Menu Trigger (Hamburger) */}
            <button
              className="lg:hidden text-[var(--text-main)] p-2 rounded-xl hover:bg-[var(--sidebar-item-hover-bg)] active:scale-95 transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Simplified Logo on Mobile/Tablet */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity lg:hidden mr-2">
              <span className="text-xl shrink-0">🏛️</span>
              <div className="leading-none text-left">
                <span className="block text-xs font-black text-[var(--text-heading)]">TN Schools</span>
                <span className="block text-[8px] font-semibold text-[var(--text-muted)] tracking-wider">AI PORTAL</span>
              </div>
            </Link>

            {/* Desktop search bar or role identity */}
            {resolvedTitle ? (
              <div className="ml-2 text-left hidden lg:block animate-in fade-in duration-300">
                <h1 className="text-base lg:text-lg font-bold text-[var(--text-heading)] leading-tight">{resolvedTitle}</h1>
                {resolvedSubtitle && (
                  <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">{resolvedSubtitle}</p>
                )}
              </div>
            ) : (
              <div className="relative hidden lg:block max-w-md w-full ml-2">
                 <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]">🔍</span>
                 <input 
                   type="text" 
                   placeholder="Search pages, settings or... Ctrl K" 
                   className="w-full pl-10 pr-4 py-2 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-full text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                 />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-3.5 relative z-50">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Selector */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => {
                  setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
                  setIsNotificationsOpen(false);
                  setIsProfileOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--sidebar-item-hover-bg)] hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 active:scale-95"
                title="Language"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{currentLanguage}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
              {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-lg z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <button
                    onClick={() => {
                      setCurrentLanguage("English");
                      localStorage.setItem("portal-language", "English");
                      setIsLanguageDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-[var(--text-main)] hover:bg-[var(--sidebar-item-hover-bg)] transition-colors"
                  >
                    English
                  </button>
                  <button
                    onClick={() => {
                      setCurrentLanguage("தமிழ்");
                      localStorage.setItem("portal-language", "தமிழ்");
                      setIsLanguageDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-[var(--text-main)] hover:bg-[var(--sidebar-item-hover-bg)] transition-colors"
                  >
                    தமிழ்
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Button */}
            <div className="relative">
              <button
                id="portal-notifications-btn"
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                  setIsLanguageDropdownOpen(false);
                }}
                className="relative p-2 text-[var(--text-main)] hover:bg-[var(--sidebar-item-hover-bg)] rounded-full transition-all duration-200 active:scale-95"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold border-2 border-[var(--bg-card)] animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-250">
                  <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/10">
                    <span className="text-xs font-bold text-[var(--text-heading)]">{t.notificationsTitle}</span>
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-[var(--primary)] hover:underline font-semibold"
                    >
                      {t.markAllRead}
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notificationsList.length > 0 ? (
                      notificationsList.map((notif: any) => (
                        <div
                          key={notif.id}
                          onClick={() => !notif.read && handleMarkSingleRead(notif.id)}
                          className={`p-3.5 text-xs text-[var(--text-main)] border-b border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer flex justify-between items-start gap-2 ${
                            !notif.read ? "bg-[var(--primary)]/5 font-semibold text-[var(--text-heading)]" : ""
                          }`}
                        >
                          <div className="flex-1">
                            <div>{notif.message}</div>
                            <div className="text-[9px] text-[var(--text-muted)] mt-1 font-normal">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0 mt-1.5" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                        {t.noNotifications}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar Mini */}
            <div className="relative ml-1 flex items-center">
              <button
                className="w-9 h-9 rounded-full text-white text-xs font-bold flex items-center justify-center cursor-pointer shadow-sm border border-[var(--border)] active:scale-95 transition-all duration-200"
                style={{ background: `linear-gradient(135deg, ${resolvedAccentColor}, ${resolvedAccentColor}dd)` }}
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                  setIsLanguageDropdownOpen(false);
                }}
              >
                {letter}
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-12 top-0 w-56 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-1 duration-250">
                  <div className="px-4 py-2.5 border-b border-[var(--border)] mb-1">
                    <div className="text-xs font-bold text-[var(--text-heading)] truncate">{displayName}</div>
                    <div className="text-[10px] text-[var(--text-muted)] truncate">{displayEmail}</div>
                  </div>
                  <Link 
                    href="/teacher/profile" 
                    onClick={() => setIsProfileOpen(false)} 
                    scroll={false} 
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-[var(--text-main)] hover:bg-[var(--sidebar-item-hover-bg)] hover:text-[var(--portal-color,var(--primary))] transition-colors"
                  >
                    <User className="w-3.5 h-3.5" /> 
                    <span>{t.profileTitle}</span>
                  </Link>
                  <Link 
                    href="#" 
                    onClick={() => setIsProfileOpen(false)} 
                    scroll={false} 
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-[var(--text-main)] hover:bg-[var(--sidebar-item-hover-bg)] hover:text-[var(--portal-color,var(--primary))] transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" /> 
                    <span>{t.settings}</span>
                  </Link>
                  <Link 
                    href="#" 
                    onClick={() => setIsProfileOpen(false)} 
                    scroll={false} 
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-[var(--text-main)] hover:bg-[var(--sidebar-item-hover-bg)] hover:text-[var(--portal-color,var(--primary))] transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> 
                    <span>{t.help}</span>
                  </Link>
                  <div className="my-1 border-t border-[var(--border)]" />
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      signOut({ callbackUrl: "/" });
                    }} 
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> 
                    <span>{t.signOut}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Children content relative to sit above absolute background */}
        <main className="relative flex-1 p-4 md:p-6 lg:p-8">
          {/* Mobile/Tablet Page Header (visible below lg breakpoint) */}
          {resolvedTitle && (
            <div className="lg:hidden px-1 mb-5 text-left animate-in fade-in duration-300">
              <h1 className="text-xl font-black text-white leading-tight drop-shadow-sm">{resolvedTitle}</h1>
              {resolvedSubtitle && (
                <p className="text-xs text-white/85 font-semibold mt-1">{resolvedSubtitle}</p>
              )}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
