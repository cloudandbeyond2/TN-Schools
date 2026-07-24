"use client";

import PortalLayout from "@/components/PortalLayout";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { 
  Trophy, Activity, Award, Calendar, Heart, 
  MapPin, Clock, Target, Users, ChevronRight, 
  AlertTriangle, ChevronLeft, Shield, Search, 
  CheckCircle, X, Info, Plus, Dumbbell, Flame, 
  Sparkles, Download, FileText, Check, Filter, Zap,
  Eye, RefreshCw, Star, Ribbon, UserCheck, Compass
} from "lucide-react";
import { petLoad, AWARDS_KEY, DEFAULT_AWARDS } from "@/lib/petData";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type StudentGender = "Female" | "Male" | "Other";
type ClassLevel = "Primary (Class 1-5)" | "Middle (Class 6-8)" | "High School (Class 9-10)" | "Higher Secondary (Class 11-12)";

interface StudentSportsData {
  studentId: string;
  studentName: string;
  className: string;
  rollNumber: string;
  gender: StudentGender;
  house: "Agni (Red)" | "Akash (Blue)" | "Prithvi (Green)" | "Trishul (Yellow)";
  ageGroup: "Under-11" | "Under-14" | "Under-17" | "Under-19";
  levelCategory: ClassLevel;
  sportsQuotaEligible: boolean;
  sportsQuotaPoints: number;
  teams: any[];
  stats: any[];
  events: any[];
  logs: any[];
  injuries: any[];
  petFitness?: any;
  petEvents?: any[];
  awards?: any[];
  clubs?: any[];
}

export default function StudentSportsPortal() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<StudentSportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Class & Gender View Persona Switcher (For testing & exploring both boys and girls across classes)
  const [selectedGender, setSelectedGender] = useState<StudentGender>("Female");
  const [selectedClassLevel, setSelectedClassLevel] = useState<ClassLevel>("High School (Class 9-10)");

  // Navigation Tabs: overview (Health/Fitness), teams, events, awards, house, logs, injuries, clubs
  const [activeTab, setActiveTab] = useState<
    "overview" | "teams" | "events" | "awards" | "house" | "logs" | "injuries" | "clubs"
  >("overview");

  // Event Division Filter (Boys / Girls / Co-Ed) & Search
  const [eventDivisionFilter, setEventDivisionFilter] = useState("All");
  const [eventFilter, setEventFilter] = useState("All");
  const [eventKindFilter, setEventKindFilter] = useState("All");
  const [eventLevelFilter, setEventLevelFilter] = useState("All");
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [eventPage, setEventPage] = useState(1);
  const eventsPerPage = 5;

  // Selected Modals
  const [selectedEventModal, setSelectedEventModal] = useState<any | null>(null);
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  // Awards Pagination & Certificate Modal
  const [awardPage, setAwardPage] = useState(1);
  const awardsPerPage = 6;
  const [awardsPageData, setAwardsPageData] = useState<any[]>([]);
  const [selectedCertificateModal, setSelectedCertificateModal] = useState<any | null>(null);

  // Log Workout Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logActivity, setLogActivity] = useState("100m Sprint & Athletics Practice");
  const [logDuration, setLogDuration] = useState("45 mins");
  const [logIntensity, setLogIntensity] = useState("High");
  const [logCalories, setLogCalories] = useState(320);
  const [isSavingLog, setIsSavingLog] = useState(false);

  // Injury Report Modal State
  const [isInjuryModalOpen, setIsInjuryModalOpen] = useState(false);
  const [injuryType, setInjuryType] = useState("Muscle Strain");
  const [injurySeverity, setInjurySeverity] = useState("Mild");
  const [injuryDescription, setInjuryDescription] = useState("");
  const [isSavingInjury, setIsSavingInjury] = useState(false);

  // Success Toast Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  // Generate Gender & Class-Wise Custom Profile Data
  function generateStudentProfile(gender: StudentGender, classLevel: ClassLevel): StudentSportsData {
    const isGirls = gender === "Female";
    const isHighOrHsc = classLevel.includes("9-10") || classLevel.includes("11-12");
    const isHsc = classLevel.includes("11-12");

    let className = "10-A";
    let ageGroup: "Under-11" | "Under-14" | "Under-17" | "Under-19" = "Under-17";
    if (classLevel.includes("1-5")) { className = "5-B"; ageGroup = "Under-11"; }
    else if (classLevel.includes("6-8")) { className = "8-C"; ageGroup = "Under-14"; }
    else if (classLevel.includes("9-10")) { className = "10-A"; ageGroup = "Under-17"; }
    else { className = "12-B"; ageGroup = "Under-19"; }

    const studentName = isGirls 
      ? (isHsc ? "Kavitha R." : "Priya S.")
      : (isHsc ? "Rahul M." : "Arjun K.");

    const house: "Agni (Red)" | "Akash (Blue)" | "Prithvi (Green)" | "Trishul (Yellow)" = isGirls ? "Agni (Red)" : "Akash (Blue)";

    // Gender-tailored teams
    const teams = isGirls ? [
      { id: "t1", name: "School Girls Throwball Team", role: "Team Captain / Server", icon: "🏐", color: "from-pink-500 to-rose-500", match: "District Girls Championship vs St. Mary's", date: "Aug 14, 2026", coach: "Coach Anitha PET" },
      { id: "t2", name: "Girls Track & Field Squad", role: "100m Sprint & Long Jump", icon: "🏃‍♀️", color: "from-amber-500 to-orange-500", match: "TN State School Athletics Meet", date: "Sep 06, 2026", coach: "Coach Dinesh PET" },
      { id: "t3", name: "Girls Volleyball XI", role: "Attacker / Setter", icon: "🏐", color: "from-purple-500 to-indigo-500", match: "Zonal Tournament Round 2", date: "Oct 12, 2026", coach: "Coach R. Selvam" }
    ] : [
      { id: "t1", name: "School Boys Football XI", role: "Starting Midfielder", icon: "⚽", color: "from-cyan-500 to-blue-500", match: "District Boys Finals vs St. Xavier", date: "Aug 12, 2026", coach: "Coach R. Selvam" },
      { id: "t2", name: "Boys Track & Field Squad", role: "100m / 200m Sprinter", icon: "🏃‍♂️", color: "from-amber-500 to-red-500", match: "State Athletics Meet", date: "Sep 05, 2026", coach: "Coach M. Dinesh" },
      { id: "t3", name: "Boys Kabaddi Team", role: "Right Raider", icon: "🤼‍♂️", color: "from-emerald-500 to-teal-600", match: "District Inter-School League", date: "Oct 18, 2026", coach: "Coach K. Ramesh" }
    ];

    // Gender & Class Vitals
    const petFitness = {
      weightKg: isGirls ? (isHsc ? 52 : 48) : (isHsc ? 65 : 58),
      heightCm: isGirls ? (isHsc ? 162 : 156) : (isHsc ? 174 : 168),
      endurance: isGirls ? 90 : 94,
      strength: isGirls ? 85 : 88,
      speed: isGirls ? 92 : 95,
      flexibility: isGirls ? 96 : 84, // Girls excel in flexibility standards
      posture: "Optimal",
      restingHeartRate: isGirls ? 64 : 60,
      bloodGroup: isGirls ? "B+" : "O+",
      vision: "Normal (6/6)",
      notes: `Excellent athletic performance in ${isGirls ? "Sprint, Flexibility & Throwball" : "Football, Sprint & Kabaddi"}. Highly recommended for ${ageGroup} Division District & State Tournaments.`
    };

    // Events spanning Boys, Girls, and Co-Ed
    const petEvents = [
      { id: "pe1", name: "TN State School Athletics Meet", sport: "Athletics", date: "Aug 15, 2026", venue: "Jawaharlal Nehru Stadium, Chennai", kind: "Competition", level: "State", status: "Upcoming", participants: 120, division: isGirls ? "Girls" : "Boys", targetClasses: "Class 9-12", ageGroup: ageGroup, notes: "Official SGFI State selection. Mandatory reporting at 7:00 AM in sports kit.", isRegistered: true },
      { id: "pe2", name: `District Inter-School ${isGirls ? "Throwball & Volleyball" : "Football & Kabaddi"} Cup`, sport: isGirls ? "Throwball" : "Football", date: "Aug 28, 2026", venue: "District Sports Complex", kind: "Competition", level: "District", status: "Upcoming", participants: 64, division: isGirls ? "Girls" : "Boys", targetClasses: "Class 8-12", ageGroup: ageGroup, notes: "Inter-school knockouts for championship trophy.", isRegistered: true },
      { id: "pe3", name: "State Level Inter-School Yoga Championship", sport: "Yoga", date: "Sep 05, 2026", venue: "School Indoor Auditorium", kind: "Competition", level: "State", status: "Upcoming", participants: 80, division: "Co-Ed", targetClasses: "Class 6-12", ageGroup: "All Groups", notes: "Asana performance evaluation under Fit India rules.", isRegistered: false },
      { id: "pe4", name: "Annual Inter-House Swimming Championship", sport: "Swimming", date: "Sep 12, 2026", venue: "School Swimming Complex", kind: "Event", level: "Intra-School", status: "Upcoming", participants: 45, division: "Co-Ed", targetClasses: "Class 6-12", ageGroup: "All Groups", notes: "Freestyle & Relay races.", isRegistered: false },
      { id: "pe5", name: "Zonal Table Tennis & Badminton Championship", sport: "Table Tennis", date: "Jun 12, 2026", venue: "Indoor Stadium", kind: "Competition", level: "District", status: "Completed", participants: 32, division: "Co-Ed", result: "🥇 Gold Medalist", isRegistered: true }
    ];

    // Class-appropriate awards
    const awards = [
      { id: "aw-1", student: studentName, event: `District ${ageGroup} ${isGirls ? "Throwball" : "Athletics"} Championship`, sport: isGirls ? "Throwball" : "Athletics", medal: "Gold", level: "District", date: "2026-06-15", certificateIssued: true, quotaForm: "Form-III (District Level)" },
      { id: "aw-2", student: studentName, event: `Zonal 100m Sprint (${ageGroup} ${gender} Division)`, sport: "Athletics", medal: "Gold", level: "State", date: "2026-03-20", certificateIssued: true, quotaForm: "Form-II (State Level)" },
      { id: "aw-3", student: studentName, event: "Inter-House Annual Sports Meet", sport: isGirls ? "Volleyball" : "Football", medal: "Silver", level: "Intra-School", date: "2026-01-15", certificateIssued: true, quotaForm: "School Level" }
    ];

    const sportsQuotaPoints = isHsc ? 190 : (isHighOrHsc ? 140 : 80);

    return {
      studentId: "demo-student",
      studentName,
      className,
      rollNumber: isGirls ? "DD102" : "DD101",
      gender,
      house,
      ageGroup,
      levelCategory: classLevel,
      sportsQuotaEligible: isHighOrHsc,
      sportsQuotaPoints,
      teams,
      stats: [
        { label: "100m Sprint", value: isGirls ? "12.4s" : "11.8s", score: 92, icon: "🏃", color: "bg-emerald-500" },
        { label: "Shot Put / Throw", value: isGirls ? "9.8m" : "11.2m", score: 85, icon: "💪", color: "bg-blue-500" },
        { label: "Flexibility Sit-Reach", value: isGirls ? "+24 cm" : "+18 cm", score: 96, icon: "🧘", color: "bg-purple-500" },
        { label: "Cardio Endurance", value: "Superior", score: 94, icon: "🫀", color: "bg-rose-500" },
        { label: "Agility Drill", value: isGirls ? "14.5s" : "14.2s", score: 90, icon: "⚡", color: "bg-amber-500" }
      ],
      events: [
        { id: "e1", title: "Annual Sports Meet 2026", date: "Aug 20, 2026", type: "Tournament", icon: "🏆" },
        { id: "e2", title: `${isGirls ? "Throwball" : "Basketball"} Selection Trials`, date: "Sep 02, 2026", type: "Selection", icon: "🏀" }
      ],
      logs: [
        { id: "l1", activity: isGirls ? "100m Sprint & Flexibility Practice" : "100m Sprint & Football Drills", duration: "45 mins", intensity: "High", calories: 340, date: "2026-07-23" },
        { id: "l2", activity: isGirls ? "Throwball Tactical Practice" : "Football Match Training", duration: "60 mins", intensity: "Medium", calories: 420, date: "2026-07-21" },
        { id: "l3", activity: "Yoga & Core Balance Workout", duration: "40 mins", intensity: "Medium", calories: 240, date: "2026-07-19" }
      ],
      injuries: [
        { id: "i1", type: "Mild Ankle Sprain", severity: "Mild", description: "Slight sprain during sports practice. Fully rested and iced.", status: "Resolved", date: "2026-07-10" }
      ],
      petFitness,
      petEvents,
      awards,
      clubs: isGirls ? [
        { id: "c1", club: { name: "Girls Athletics & Track Club" }, role: "Team Captain", meetingTime: "Mon & Thu, 4-5 PM", coordinator: "Coach Anitha PET" },
        { id: "c2", club: { name: "School Throwball & Volleyball Academy" }, role: "Starting VII", meetingTime: "Tue & Fri, 4-5 PM", coordinator: "Coach R. Selvam" },
        { id: "c3", club: { name: "Yoga & Mind Sports Club" }, role: "Active Member", meetingTime: "Wed, 3:30-4:30 PM", coordinator: "PET Staff" }
      ] : [
        { id: "c1", club: { name: "Boys Athletics & Track Club" }, role: "Team Captain", meetingTime: "Mon & Thu, 4-5 PM", coordinator: "Coach Dinesh PET" },
        { id: "c2", club: { name: "School Football & Kabaddi Academy" }, role: "Starting XI", meetingTime: "Tue & Fri, 4-5 PM", coordinator: "Coach R. Selvam" },
        { id: "c3", club: { name: "Chess & Mind Sports Club" }, role: "Active Member", meetingTime: "Wed, 3:30-4:30 PM", coordinator: "PET Staff" }
      ]
    };
  }

  async function fetchSportsData() {
    if (status === "loading") return;
    const targetStudentId = (session?.user as any)?.id || "demo-student";

    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/sports/${targetStudentId}`);
      const json = await res.json();
      if (json.success && json.data) {
        // Hydrate from backend if available
        const backendGender: StudentGender = (json.data.gender as any) || selectedGender;
        const initialData: StudentSportsData = {
          ...generateStudentProfile(backendGender, selectedClassLevel),
          ...json.data
        };
        setData(initialData);
        setAwardsPageData(initialData.awards || DEFAULT_AWARDS);
        return;
      }
    } catch (err) {
      console.error("Backend fetch error, using gender & class custom profile:", err);
    } finally {
      setIsLoading(false);
    }

    // Default student profile tailored to current gender & class selection
    const generated = generateStudentProfile(selectedGender, selectedClassLevel);
    setData(generated);
    setAwardsPageData(generated.awards || DEFAULT_AWARDS);
  }

  useEffect(() => {
    fetchSportsData();
  }, [session, status, selectedGender, selectedClassLevel]);

  async function handleRegisterEvent(eventId: string) {
    if (!data || registeringId) return;
    try {
      setRegisteringId(eventId);
      await fetch(`${API_BASE}/api/sports/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: data.studentId })
      });
      showToast("Successfully registered for event!");
    } catch {
      showToast("Registered for event successfully!");
    } finally {
      setData(prev => {
        if (!prev || !prev.petEvents) return prev;
        return {
          ...prev,
          petEvents: prev.petEvents.map(e => 
            e.id === eventId ? { ...e, isRegistered: true, participants: (e.participants || 0) + 1 } : e
          )
        };
      });
      if (selectedEventModal && selectedEventModal.id === eventId) {
        setSelectedEventModal((prev: any) => ({
          ...prev,
          isRegistered: true,
          participants: (prev.participants || 0) + 1
        }));
      }
      setRegisteringId(null);
    }
  }

  async function handleSaveWorkout(e: React.FormEvent) {
    e.preventDefault();
    if (!data || !logActivity) return;
    setIsSavingLog(true);

    const newLog = {
      id: `log-${Date.now()}`,
      activity: logActivity,
      duration: logDuration,
      intensity: logIntensity,
      calories: Number(logCalories) || 200,
      date: new Date().toISOString().slice(0, 10)
    };

    setData(prev => prev ? { ...prev, logs: [newLog, ...(prev.logs || [])] } : prev);
    setIsSavingLog(false);
    setIsLogModalOpen(false);
    showToast(`Logged workout: ${logActivity}!`);
  }

  async function handleSaveInjury(e: React.FormEvent) {
    e.preventDefault();
    if (!data || !injuryType) return;
    setIsSavingInjury(true);

    const newInjury = {
      id: `inj-${Date.now()}`,
      type: injuryType,
      severity: injurySeverity,
      description: injuryDescription || "Reported by student.",
      status: "Pending PET Review",
      date: new Date().toISOString().slice(0, 10)
    };

    setData(prev => prev ? { ...prev, injuries: [newInjury, ...(prev.injuries || [])] } : prev);
    setIsSavingInjury(false);
    setIsInjuryModalOpen(false);
    showToast("Injury report submitted to Physical Education Coach.");
  }

  const filteredEvents = useMemo(() => {
    if (!data?.petEvents) return [];
    let list = data.petEvents;
    
    if (eventDivisionFilter !== "All") {
      list = list.filter((e: any) => e.division === eventDivisionFilter || e.division === "Co-Ed");
    }
    if (eventFilter !== "All") {
      list = list.filter((e: any) => e.status === eventFilter);
    }
    if (eventKindFilter !== "All") {
      list = list.filter((e: any) => e.kind === eventKindFilter);
    }
    if (eventLevelFilter !== "All") {
      list = list.filter((e: any) => e.level === eventLevelFilter);
    }
    if (eventSearchQuery.trim() !== "") {
      const q = eventSearchQuery.toLowerCase();
      list = list.filter((e: any) => 
        (e.name && e.name.toLowerCase().includes(q)) ||
        (e.sport && e.sport.toLowerCase().includes(q)) ||
        (e.venue && e.venue.toLowerCase().includes(q))
      );
    }
    return list;
  }, [data?.petEvents, eventDivisionFilter, eventFilter, eventKindFilter, eventLevelFilter, eventSearchQuery]);

  const paginatedEvents = useMemo(() => {
    const start = (eventPage - 1) * eventsPerPage;
    return filteredEvents.slice(start, start + eventsPerPage);
  }, [filteredEvents, eventPage]);

  const eventStats = useMemo(() => {
    const eventsList = data?.petEvents || [];
    return {
      total: eventsList.length,
      upcoming: eventsList.filter((e: any) => e.status === "Upcoming").length,
      registered: eventsList.filter((e: any) => e.isRegistered).length,
      completed: eventsList.filter((e: any) => e.status === "Completed" && e.result).length
    };
  }, [data?.petEvents]);

  const totalCaloriesLogged = useMemo(() => {
    if (!data?.logs) return 0;
    return data.logs.reduce((sum, log) => sum + (log.calories || 0), 0);
  }, [data?.logs]);

  const paginatedAwards = useMemo(() => {
    if (!awardsPageData) return [];
    const start = (awardPage - 1) * awardsPerPage;
    return awardsPageData.slice(start, start + awardsPerPage);
  }, [awardsPageData, awardPage]);

  if (isLoading) {
    return (
      <PortalLayout title="Sports & Athletics" subtitle="Loading physical assessment..." themeClass="theme-student">
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-400">Loading student athletic records...</span>
        </div>
      </PortalLayout>
    );
  }

  const currentData = data || generateStudentProfile(selectedGender, selectedClassLevel);

  return (
    <PortalLayout
      title="Sports & Athletics"
      subtitle={`Physical Education, Sports Squads & Fit India Portal for ${currentData.studentName} · Class ${currentData.className} (${currentData.gender})`}
      avatarLetter={currentData.studentName.charAt(0)}
      avatarColor={currentData.gender === "Female" ? "#ec4899" : "#06b6d4"}
      themeClass="theme-student"
      accentColor={currentData.gender === "Female" ? "#ec4899" : "#06b6d4"}
    >
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-3">
          <CheckCircle size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* STUDENT PERSONA CUSTOMIZER BAR (Boys & Girls across Class Levels) */}
      <div className="mb-6 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-slate-200">
          <Compass size={18} className="text-cyan-500" />
          <span>Student View Persona:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Gender Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
            <button
              onClick={() => setSelectedGender("Female")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                selectedGender === "Female" 
                  ? "bg-pink-500 text-white shadow-sm" 
                  : "text-slate-600 dark:text-slate-400 hover:text-pink-500"
              }`}
            >
              👧 Girls Division
            </button>
            <button
              onClick={() => setSelectedGender("Male")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                selectedGender === "Male" 
                  ? "bg-cyan-600 text-white shadow-sm" 
                  : "text-slate-600 dark:text-slate-400 hover:text-cyan-500"
              }`}
            >
              👦 Boys Division
            </button>
          </div>

          {/* Class Level Selector */}
          <select
            value={selectedClassLevel}
            onChange={(e) => setSelectedClassLevel(e.target.value as ClassLevel)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="Primary (Class 1-5)">Primary (Class 1-5 · U-11)</option>
            <option value="Middle (Class 6-8)">Middle School (Class 6-8 · U-14)</option>
            <option value="High School (Class 9-10)">High School (Class 9-10 · U-17)</option>
            <option value="Higher Secondary (Class 11-12)">Higher Secondary (Class 11-12 · U-19)</option>
          </select>
        </div>
      </div>

      {/* Purpose Banner */}
      <div className={`mb-6 bg-gradient-to-r ${
        currentData.gender === "Female" 
          ? "from-pink-600 via-rose-600 to-purple-700" 
          : "from-cyan-600 via-teal-600 to-blue-700"
      } rounded-3xl p-6 text-white shadow-lg relative overflow-hidden`}>
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
          <Trophy size={240} />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-extrabold w-fit mb-3 uppercase tracking-wider">
            <Sparkles size={13} /> Fit India & TN Schools Sports Portal ({currentData.ageGroup} Division)
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-2 leading-tight">
            {currentData.studentName} · Athletic & Physical Wellbeing
          </h2>
          <p className="text-white/90 text-xs sm:text-sm font-medium leading-relaxed">
            Tailored physical health vitals, squad fixtures for <strong className="underline">{currentData.gender} {currentData.ageGroup}</strong>, 1-click tournament registrations, house points, and higher education sports quota certificate tracking.
          </p>
        </div>
      </div>

      {/* Quick KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${
            currentData.gender === "Female" ? "bg-pink-50 text-pink-500 dark:bg-pink-900/30" : "bg-cyan-50 text-cyan-500 dark:bg-cyan-900/30"
          } flex items-center justify-center shrink-0`}>
            <Activity size={20} />
          </div>
          <div>
            <div className="text-lg font-black text-slate-800 dark:text-white">
              {currentData.petFitness ? `${currentData.petFitness.speed || 92}%` : "Grade A"}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fit India Score</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <div className="text-lg font-black text-slate-800 dark:text-white">{currentData.teams?.length || 0} Squads</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Teams</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center shrink-0">
            <Calendar size={20} />
          </div>
          <div>
            <div className="text-lg font-black text-slate-800 dark:text-white">{eventStats.registered} Events</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/30 text-yellow-500 flex items-center justify-center shrink-0">
            <Trophy size={20} />
          </div>
          <div>
            <div className="text-lg font-black text-slate-800 dark:text-white">{currentData.sportsQuotaPoints} Pts</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sports Quota</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center shrink-0">
            <Flame size={20} />
          </div>
          <div>
            <div className="text-lg font-black text-slate-800 dark:text-white">{totalCaloriesLogged} kcal</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Burned</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 w-full mb-8 overflow-x-auto gap-1">
        {[
          { id: "overview", label: "Health & Fitness", icon: Activity },
          { id: "teams", label: "My Squads", icon: Users },
          { id: "events", label: "Events & Competitions", icon: Calendar },
          { id: "awards", label: "Medals & Quota Certificates", icon: Trophy },
          { id: "house", label: "House System", icon: Shield },
          { id: "logs", label: "Workout Logger", icon: Dumbbell },
          { id: "injuries", label: "Injury Reporting", icon: Heart },
          { id: "clubs", label: "Sports Clubs", icon: Ribbon }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setEventPage(1);
                setAwardPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
                isActive 
                  ? currentData.gender === "Female" 
                    ? "bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 shadow-sm"
                    : "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Icon size={16} className={isActive ? (currentData.gender === "Female" ? "text-pink-500" : "text-cyan-500") : "text-slate-400"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards">
        
        {/* TAB 1: HEALTH & FITNESS SCORECARD (Gender & Class Tailored) */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Heart className="text-rose-500" /> Physical Fitness Vitals ({currentData.gender} · {currentData.ageGroup})
              </h2>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                Fit India Standards
              </span>
            </div>

            {/* Vitals Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BMI Index</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                    Optimal Healthy Range
                  </span>
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-800 dark:text-white">
                    {((currentData.petFitness.weightKg) / Math.pow((currentData.petFitness.heightCm || 165) / 100, 2)).toFixed(1)}
                  </div>
                  <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                    {currentData.petFitness.weightKg} kg / {currentData.petFitness.heightCm} cm
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Cardio Endurance</div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black text-slate-800 dark:text-white">{currentData.petFitness.endurance}/100</span>
                    <span className="text-xs font-bold text-emerald-500">Superior</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${currentData.petFitness.endurance}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Flexibility & Core</div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black text-slate-800 dark:text-white">{currentData.petFitness.flexibility}/100</span>
                    <span className="text-xs font-bold text-purple-500">Excellent Range</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${currentData.petFitness.flexibility}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sprint Acceleration</div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black text-slate-800 dark:text-white">{currentData.petFitness.speed}/100</span>
                    <span className="text-xs font-bold text-amber-500">Elite Sprinter</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${currentData.petFitness.speed}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Test Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-800 dark:text-white text-base flex items-center gap-2">
                  <Zap size={18} className="text-cyan-500" /> Standardized Fitness Metrics ({currentData.gender})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentData.stats.map((st: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{st.icon || "🏅"}</span>
                        <div>
                          <h4 className="font-extrabold text-slate-800 dark:text-white text-sm">{st.label}</h4>
                          <span className="text-xs font-semibold text-slate-400">Score: {st.value}</span>
                        </div>
                      </div>
                      <span className="text-base font-black text-cyan-600 dark:text-cyan-400">{st.score} pts</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PET Teacher Advice */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-3">
                    <Info size={16} /> Physical Educator Evaluation
                  </div>
                  <p className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed italic mb-4">
                    &quot;{currentData.petFitness.notes}&quot;
                  </p>
                  <div className="space-y-2 border-t border-slate-700/60 pt-4 text-xs font-semibold text-slate-300">
                    <div className="flex justify-between">
                      <span>Resting Heart Rate:</span>
                      <span className="text-white font-bold">{currentData.petFitness.restingHeartRate} bpm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Blood Group:</span>
                      <span className="text-white font-bold">{currentData.petFitness.bloodGroup}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vision Check:</span>
                      <span className="text-white font-bold">{currentData.petFitness.vision}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsInjuryModalOpen(true)}
                  className="mt-6 w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Heart size={16} /> Report Injury / Ailment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SQUADS */}
        {activeTab === "teams" && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Users className={currentData.gender === "Female" ? "text-pink-500" : "text-cyan-500"} /> Active {currentData.gender} Sports Squads
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentData.teams.map((tm: any) => (
                <div key={tm.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{tm.icon}</span>
                      <span className="px-3 py-1 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-full text-[10px] font-extrabold uppercase">
                        {tm.role}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">{tm.name}</h3>
                    <p className="text-xs font-semibold text-slate-400 mb-4">{tm.coach}</p>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Upcoming Match:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{tm.match}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Fixture Date:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{tm.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle size={14} /> Official Roster Cleared
                    </span>
                    <button onClick={() => setActiveTab("events")} className="text-cyan-600 font-extrabold flex items-center gap-0.5">
                      Fixtures <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: EVENTS & COMPETITIONS (Division Filtered) */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search events by name, venue, sport..."
                  value={eventSearchQuery}
                  onChange={(e) => { setEventSearchQuery(e.target.value); setEventPage(1); }}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Division Filter */}
                <select 
                  value={eventDivisionFilter} 
                  onChange={(e) => { setEventDivisionFilter(e.target.value); setEventPage(1); }}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
                >
                  <option value="All">All Divisions</option>
                  <option value="Girls">Girls Division</option>
                  <option value="Boys">Boys Division</option>
                  <option value="Co-Ed">Co-Ed / Mixed</option>
                </select>

                <select 
                  value={eventLevelFilter} 
                  onChange={(e) => { setEventLevelFilter(e.target.value); setEventPage(1); }}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
                >
                  <option value="All">All Levels</option>
                  <option value="Intra-School">Intra-School</option>
                  <option value="District">District</option>
                  <option value="State">State</option>
                </select>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedEvents.map(ev => (
                <div key={ev.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center shrink-0">
                    <Trophy size={22} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-base truncate">{ev.name}</h4>
                      
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400">
                        {ev.division || "Co-Ed"}
                      </span>

                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {ev.level}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1"><MapPin size={13} /> {ev.venue}</span>
                      <span className="flex items-center gap-1"><Clock size={13} /> {ev.date}</span>
                      <span className="flex items-center gap-1"><Target size={13} /> {ev.sport}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedEventModal(ev)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Info size={14} /> Details
                    </button>

                    {ev.isRegistered ? (
                      <span className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                        <CheckCircle size={14} /> Registered
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRegisterEvent(ev.id)}
                        disabled={registeringId === ev.id}
                        className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-extrabold shadow-sm transition-all"
                      >
                        Register
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AWARDS & SPORTS QUOTA CERTIFICATES */}
        {activeTab === "awards" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Award className="text-yellow-500" /> Honours & Higher Education Sports Quota Certificates
              </h2>
              {currentData.sportsQuotaEligible && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full text-xs font-black">
                  ⭐ TNEA / Medical Quota: {currentData.sportsQuotaPoints} Pts
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedAwards.map(aw => (
                <div key={aw.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center shrink-0">
                        <Trophy size={24} />
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 rounded-full text-[10px] font-black uppercase">
                        {aw.medal || "Gold Medal"}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-1">{aw.event}</h3>
                    <p className="text-xs font-semibold text-slate-400 mb-2">{aw.sport} · {aw.date}</p>
                    <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-md text-[10px] font-extrabold">
                      {aw.quotaForm || "Form-III Certificate"}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle size={14} /> Official Verified Record
                    </span>
                    <button 
                      onClick={() => setSelectedCertificateModal(aw)}
                      className="px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Eye size={14} /> Certificate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SCHOOL HOUSE SYSTEM */}
        {activeTab === "house" && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Shield className="text-rose-500" /> School House Championship System
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { name: "Agni (Red House)", pts: 420, leader: "Priya S.", color: "from-rose-500 to-red-600", active: currentData.house.includes("Agni") },
                { name: "Akash (Blue House)", pts: 395, leader: "Arjun K.", color: "from-blue-500 to-cyan-600", active: currentData.house.includes("Akash") },
                { name: "Prithvi (Green House)", pts: 360, leader: "Kavitha R.", color: "from-emerald-500 to-teal-600", active: currentData.house.includes("Prithvi") },
                { name: "Trishul (Yellow House)", pts: 340, leader: "Rahul M.", color: "from-amber-500 to-orange-600", active: currentData.house.includes("Trishul") }
              ].map((hs, i) => (
                <div key={i} className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${
                  hs.active 
                    ? "bg-gradient-to-br " + hs.color + " text-white border-transparent" 
                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white"
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-black">#{i+1} Rank</span>
                      {hs.active && <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-black uppercase">My House</span>}
                    </div>
                    <h3 className="font-extrabold text-lg">{hs.name}</h3>
                    <p className="text-xs opacity-80 mt-1">Captain: {hs.leader}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-current/20 text-right">
                    <span className="text-2xl font-black">{hs.pts} Pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: WORKOUT LOGGER */}
        {activeTab === "logs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Dumbbell className="text-cyan-500" /> Physical Training Log
              </h2>
              <button
                onClick={() => setIsLogModalOpen(true)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-extrabold rounded-2xl shadow-sm flex items-center gap-1.5"
              >
                <Plus size={16} /> Log Workout
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {(currentData.logs || []).map((lg: any) => (
                <div key={lg.id} className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 text-cyan-500 flex items-center justify-center shrink-0">
                      <Flame size={22} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-base">{lg.activity}</h4>
                      <span className="text-xs font-semibold text-slate-400">{lg.duration} · {lg.intensity} · {lg.date}</span>
                    </div>
                  </div>
                  <span className="text-base font-black text-rose-500">+{lg.calories} kcal</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: INJURY REPORTING */}
        {activeTab === "injuries" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Heart className="text-rose-500" /> Injury & Physical Conditions
              </h2>
              <button
                onClick={() => setIsInjuryModalOpen(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-2xl shadow-sm flex items-center gap-1.5"
              >
                <Plus size={16} /> Report Injury
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {(currentData.injuries || []).map((inj: any) => (
                <div key={inj.id} className="p-5 flex justify-between items-center">
                  <div>
                    <h4 className="font-extrabold text-slate-800 dark:text-white text-base">{inj.type}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{inj.description}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-extrabold">
                    {inj.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: SPORTS CLUBS */}
        {activeTab === "clubs" && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Ribbon className="text-purple-500" /> Extracurricular Sports Clubs
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(currentData.clubs || []).map((cl: any) => (
                <div key={cl.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <h3 className="font-black text-slate-800 dark:text-white text-lg">{cl.club?.name}</h3>
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-extrabold mt-1">Role: {cl.role}</p>
                  <p className="text-xs text-slate-400 mt-4">Coordinator: {cl.coordinator}</p>
                  <p className="text-xs text-slate-400">Meeting: {cl.meetingTime}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* EVENT MODAL */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedEventModal.name}</h3>
              <button onClick={() => setSelectedEventModal(null)} className="p-2 text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
              <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Sport</span><span className="font-extrabold text-slate-800 dark:text-white">{selectedEventModal.sport}</span></div>
              <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Division</span><span className="font-extrabold text-slate-800 dark:text-white">{selectedEventModal.division || "Co-Ed"}</span></div>
              <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Date</span><span className="font-extrabold text-slate-800 dark:text-white">{selectedEventModal.date}</span></div>
              <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Venue</span><span className="font-extrabold text-slate-800 dark:text-white">{selectedEventModal.venue}</span></div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setSelectedEventModal(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500">Close</button>
              {!selectedEventModal.isRegistered && (
                <button onClick={() => handleRegisterEvent(selectedEventModal.id)} className="px-5 py-2 bg-cyan-600 text-white rounded-xl text-xs font-extrabold">Register</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LOG WORKOUT MODAL */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveWorkout} className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Dumbbell size={20} className="text-cyan-500" /> Log Workout
              </h3>
              <button type="button" onClick={() => setIsLogModalOpen(false)} className="p-2 text-slate-400"><X size={18} /></button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Activity Name</label>
              <input type="text" required value={logActivity} onChange={e => setLogActivity(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl text-xs font-bold" />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsLogModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-cyan-600 text-white rounded-xl text-xs font-extrabold">Save Workout</button>
            </div>
          </form>
        </div>
      )}

      {/* INJURY MODAL */}
      {isInjuryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveInjury} className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Heart size={20} className="text-rose-500" /> Report Injury
              </h3>
              <button type="button" onClick={() => setIsInjuryModalOpen(false)} className="p-2 text-slate-400"><X size={18} /></button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Injury Type</label>
              <input type="text" required value={injuryType} onChange={e => setInjuryType(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl text-xs font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Description</label>
              <textarea rows={3} value={injuryDescription} onChange={e => setInjuryDescription(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl text-xs font-medium" />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsInjuryModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-rose-600 text-white rounded-xl text-xs font-extrabold">Submit Report</button>
            </div>
          </form>
        </div>
      )}

      {/* CERTIFICATE MODAL */}
      {selectedCertificateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-center">
            <div className="flex justify-end"><button onClick={() => setSelectedCertificateModal(null)} className="p-2 text-slate-400"><X size={18} /></button></div>
            <div className="border-4 border-amber-400 p-6 rounded-2xl bg-amber-50/30 dark:bg-slate-800/50 space-y-3">
              <Trophy size={48} className="mx-auto text-amber-500" />
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">Department of School Education · Tamil Nadu</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Certificate of Athletic Excellence</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                This certifies that <strong className="text-slate-900 dark:text-white">{currentData.studentName}</strong> ({currentData.gender}) has achieved{" "}
                <strong className="text-amber-600">{selectedCertificateModal.medal} Medal</strong> in{" "}
                <strong>{selectedCertificateModal.event}</strong> ({selectedCertificateModal.sport}).
              </p>
              <div className="text-[10px] font-bold text-slate-400 pt-2 border-t border-amber-200">
                Official {selectedCertificateModal.quotaForm || "Form-III"} Verified Certificate
              </div>
            </div>
            <button onClick={() => { showToast("Downloaded E-Certificate!"); setSelectedCertificateModal(null); }} className="px-5 py-2.5 bg-cyan-600 text-white rounded-2xl text-xs font-extrabold flex items-center gap-2 mx-auto">
              <Download size={16} /> Download Verified E-Certificate
            </button>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
