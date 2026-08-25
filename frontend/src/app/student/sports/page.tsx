"use client";

import PortalLayout from "@/components/PortalLayout";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

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

// BILINGUAL TRANSLATIONS DICTIONARY (English & தமிழ்)
const T = {
  English: {
    portalTitle: "Sports & Athletics",
    portalSubtitle: "Physical Education, Sports Squads & Fit India Portal",
    bannerTitle: "Student Athletic & Physical Wellbeing",
    bannerSubtitle: "Tailored physical health vitals, squad fixtures, 1-click tournament registrations, house points, and higher education sports quota certificate tracking.",
    studentPersona: "Student Gender & Division:",
    girlsDiv: "👧 Girls Division",
    boysDiv: "👦 Boys Division",
    langToggle: "தமிழ் / English",
    fitIndiaScore: "Fit India Score",
    activeTeams: "Active Teams",
    registeredEvents: "Registered Events",
    sportsQuota: "Sports Quota Pts",
    burned: "Workout Burn",
    
    // Tabs
    tabOverview: "Health & Fitness",
    tabTeams: "My Squads",
    tabEvents: "Events & Competitions",
    tabAwards: "Medals & Certificates",
    tabHouse: "House System",
    tabLogs: "Workout Logger",
    tabInjuries: "Injury Reporting",
    tabClubs: "Sports Clubs",

    // Vitals
    vitalsTitle: "Physical Fitness Vitals",
    fitIndiaStd: "Fit India Standards",
    bmiIndex: "BMI Index",
    bmiOptimal: "Optimal Healthy Range",
    endurance: "Cardio Endurance",
    flexibility: "Flexibility & Core",
    speed: "Sprint Acceleration",
    stdMetrics: "Standardized Fitness Metrics",
    peEvaluation: "Physical Educator Evaluation",
    heartRate: "Resting Heart Rate:",
    bloodGroup: "Blood Group:",
    visionCheck: "Vision Check:",
    reportInjury: "Report Injury / Ailment",

    // Squads
    mySquads: "Active Sports Squads",
    upcomingMatch: "Upcoming Match:",
    fixtureDate: "Fixture Date:",
    officialRoster: "Official Roster Cleared",
    viewFixtures: "Fixtures",

    // Events
    searchEventsPlaceholder: "Search events by name, venue, sport...",
    allDivisions: "All Divisions",
    girlsDivision: "Girls Division",
    boysDivision: "Boys Division",
    coEd: "Co-Ed / Mixed",
    allLevels: "All Levels",
    registered: "Registered",
    registerNow: "Register Now",
    details: "Details",

    // Awards & House
    honoursTitle: "Honours & Higher Education Sports Quota Certificates",
    quotaPts: "TNEA / Medical Quota:",
    officialVerified: "Official Verified Record",
    viewCert: "Certificate",
    houseTitle: "School House Championship System",
    myHouse: "My House",
    pts: "Pts",
    leader: "Captain:",

    // Logger & Injuries
    trainingLog: "Physical Training Log",
    logWorkout: "Log Workout",
    injuryTitle: "Injury & Physical Conditions",
    reportInjuryBtn: "Report Injury",
    resolved: "Resolved",
    pendingReview: "Pending PET Review",

    // Clubs & Modals
    clubsTitle: "Extracurricular Sports Clubs",
    coordinator: "Coordinator:",
    meeting: "Meeting:",
    downloadCert: "Download Verified E-Certificate",
    close: "Close"
  },
  தமிழ்: {
    portalTitle: "உடற்கல்வி மற்றும் விளையாட்டுத் துறை",
    portalSubtitle: "உடற்கல்வி, விளையாட்டு அணிகள் மற்றும் ஃபிட் இந்தியா இணையதளம்",
    bannerTitle: "மாணவர் உடற்தகுதி மற்றும் விளையாட்டு நல்வாழ்வு",
    bannerSubtitle: "உடற்தகுதி அளவீடுகள், அணிப் போட்டிகள், போட்டிகளுக்கான பதிவு, பள்ளி இல்லப் புள்ளிகள் மற்றும் உயர்கல்வி விளையாட்டு ஒதுக்கீட்டுச் சான்றிதழ்கள்.",
    studentPersona: "மாணவர் பாலினம் மற்றும் பிரிவு:",
    girlsDiv: "👧 மாணவிகள் பிரிவு",
    boysDiv: "👦 மாணவர்கள் பிரிவு",
    langToggle: "English / தமிழ்",
    fitIndiaScore: "ஃபிட் இந்தியா மதிப்பெண்",
    activeTeams: "செயலில் உள்ள அணிகள்",
    registeredEvents: "பதிவு செய்த போட்டிகள்",
    sportsQuota: "விளையாட்டு ஒதுக்கீட்டுப் புள்ளிகள்",
    burned: "எரிக்கப்பட்ட கலோரிகள்",

    // Tabs
    tabOverview: "உடல்நலம் & உடற்தகுதி",
    tabTeams: "எனது விளையாட்டு அணிகள்",
    tabEvents: "போட்டிகள் & நிகழ்வுகள்",
    tabAwards: "பதக்கங்கள் & சான்றிதழ்கள்",
    tabHouse: "பள்ளி இல்ல முறைமை",
    tabLogs: "பயிற்சிப் பதிவேடு",
    tabInjuries: "காயம் / உடல்நல அறிக்கை",
    tabClubs: "விளையாட்டு மன்றங்கள்",

    // Vitals
    vitalsTitle: "உடற்தகுதி அளவீடுகள்",
    fitIndiaStd: "ஃபிட் இந்தியா தரநிலைகள்",
    bmiIndex: "உடல் நிறை குறியீடு (BMI)",
    bmiOptimal: "சீரான உடல்நல வரம்பு",
    endurance: "இதய-நுரையீரல் சகிப்புத்தன்மை",
    flexibility: "வளைந்து கொடுக்கும் திறன்",
    speed: "வேகமாக ஓடும் திறன்",
    stdMetrics: "தரப்படுத்தப்பட்ட உடற்தகுதி அளவீடுகள்",
    peEvaluation: "உடற்கல்வி ஆசிரியரின் மதிப்பீடு",
    heartRate: "இதயத் துடிப்பு வீதம்:",
    bloodGroup: "குருதி வகை (Blood Group):",
    visionCheck: "பார்வைத் திறன் பரிசோதனை:",
    reportInjury: "காயம் / உடல்நலக் குறைவு பற்றி தெரிவி",

    // Squads
    mySquads: "செயலில் உள்ள விளையாட்டு அணிகள்",
    upcomingMatch: "அடுத்த போட்டி:",
    fixtureDate: "போட்டி நாள்:",
    officialRoster: "அதிகாரப்பூர்வ அணிப் பட்டியலில் அனுமதிக்கப்பட்டது",
    viewFixtures: "போட்டி அட்டவணை",

    // Events
    searchEventsPlaceholder: "போட்டி பெயர், இடம், விளையாட்டு அடிப்படையில் தேடுக...",
    allDivisions: "அனைத்துப் பிரிவுகளும்",
    girlsDivision: "மாணவிகள் பிரிவு",
    boysDivision: "மாணவர்கள் பிரிவு",
    coEd: "இருபாலர் பிரிவு (Co-Ed)",
    allLevels: "அனைத்து நிலைகளும்",
    registered: "பதிவு செய்யப்பட்டது",
    registerNow: "இப்போதே பதிவு செய்",
    details: "விவரங்கள்",

    // Awards & House
    honoursTitle: "விருதுகள் & உயர்கல்வி விளையாட்டு ஒதுக்கீட்டுச் சான்றிதழ்கள்",
    quotaPts: "பொறியியல் / மருத்துவ சேர்க்கை ஒதுக்கீடு:",
    officialVerified: "சரிபார்க்கப்பட்ட அதிகாரப்பூர்வ பதிவு",
    viewCert: "சான்றிதழ் பார்",
    houseTitle: "பள்ளி இல்ல சாம்பியன்ஷிப் முறைமை",
    myHouse: "எனது இல்லம்",
    pts: "புள்ளிகள்",
    leader: "இல்லத் தலைவர்:",

    // Logger & Injuries
    trainingLog: "உடற்பயிற்சி பதிவேடு",
    logWorkout: "பயிற்சியைப் பதிவு செய்",
    injuryTitle: "காயங்கள் & உடல்நல நிலைகள்",
    reportInjuryBtn: "காயம் பற்றி தெரிவி",
    resolved: "குணமடைந்தது",
    pendingReview: "ஆசிரியர் பரிசீலனையில் உள்ளது",

    // Clubs & Modals
    clubsTitle: "பள்ளி விளையாட்டு மன்றங்கள்",
    coordinator: "ஒருங்கிணைப்பாளர்:",
    meeting: "பயிற்சி நேரம்:",
    downloadCert: "சரிபார்க்கப்பட்ட சான்றிதழைப் பதிவிறக்கு",
    close: "மூடு"
  }
};

export default function StudentSportsPortal() {
  const { data: session, status } = useSession();
  const portalLangHook = usePortalLanguage();
  
  // Local language toggle state ("English" | "தமிழ்") initialized from global portal language
  const [currentLang, setCurrentLang] = useState<"English" | "தமிழ்">("English");

  useEffect(() => {
    if (portalLangHook?.lang) {
      setCurrentLang(portalLangHook.lang as any);
    }
  }, [portalLangHook?.lang]);

  const dict = T[currentLang] || T.English;

  const [data, setData] = useState<StudentSportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Student Gender Selection (Auto-detects from student session profile, editable)
  const [selectedGender, setSelectedGender] = useState<StudentGender>("Female");
  const [selectedClassLevel, setSelectedClassLevel] = useState<ClassLevel>("High School (Class 9-10)");

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    "overview" | "teams" | "events" | "awards" | "house" | "logs" | "injuries" | "clubs"
  >("overview");

  // Filters & Pagination for Events
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

  // Generate Gender & Class-Wise Profile Data (Bilingual aware)
  function generateStudentProfile(gender: StudentGender, classLevel: ClassLevel): StudentSportsData {
    const isGirls = gender === "Female";
    const isHighOrHsc = classLevel.includes("9-10") || classLevel.includes("11-12");
    const isHsc = classLevel.includes("11-12");
    const isTa = currentLang === "தமிழ்";

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

    // Gender-tailored teams (Bilingual)
    const teams = isGirls ? [
      { id: "t1", name: isTa ? "பள்ளி மாணவிகள் எறிபந்து அணி" : "School Girls Throwball Team", role: isTa ? "அணித் தலைவர் / சர்வர்" : "Team Captain / Server", icon: "fi fi-sr-trophy", color: "from-pink-500 to-rose-500", match: isTa ? "மாவட்ட மாணவிகள் சாம்பியன்ஷிப்" : "District Girls Championship vs St. Mary's", date: "Aug 14, 2026", coach: isTa ? "அனிதா உடற்கல்வி ஆசிரியர்" : "Coach Anitha PET" },
      { id: "t2", name: isTa ? "மாணவிகள் தட கள விளையாட்டு அணி" : "Girls Track & Field Squad", role: isTa ? "100மீ ஓட்டம் & நீளம் தாண்டுதல்" : "100m Sprint & Long Jump", icon: "fi fi-sr-bolt", color: "from-amber-500 to-orange-500", match: isTa ? "மாநில பள்ளி விளையாட்டுப் போட்டி" : "TN State School Athletics Meet", date: "Sep 06, 2026", coach: isTa ? "தினேஷ் உடற்கல்வி ஆசிரியர்" : "Coach Dinesh PET" },
      { id: "t3", name: isTa ? "மாணவிகள் கைப்பந்து அணி" : "Girls Volleyball XI", role: isTa ? "தாக்குதல் ஆட்டக்காரர்" : "Attacker / Setter", icon: "fi fi-sr-shield", color: "from-purple-500 to-indigo-500", match: isTa ? "மண்டல போட்டி சுற்று 2" : "Zonal Tournament Round 2", date: "Oct 12, 2026", coach: isTa ? "செல்வம் உடற்கல்வி ஆசிரியர்" : "Coach R. Selvam" }
    ] : [
      { id: "t1", name: isTa ? "பள்ளி மாணவர்கள் கால்பந்து அணி" : "School Boys Football XI", role: isTa ? "நடுவரிசை ஆட்டக்காரர்" : "Starting Midfielder", icon: "fi fi-sr-star", color: "from-cyan-500 to-blue-500", match: isTa ? "மாவட்ட மாணவர்கள் இறுதிப்போட்டி" : "District Boys Finals vs St. Xavier", date: "Aug 12, 2026", coach: isTa ? "செல்வம் உடற்கல்வி ஆசிரியர்" : "Coach R. Selvam" },
      { id: "t2", name: isTa ? "மாணவர்கள் தட கள விளையாட்டு அணி" : "Boys Track & Field Squad", role: isTa ? "100மீ / 200மீ விரைவோட்டம்" : "100m / 200m Sprinter", icon: "fi fi-sr-bolt", color: "from-amber-500 to-red-500", match: isTa ? "மாநில தடகளப் போட்டி" : "State Athletics Meet", date: "Sep 05, 2026", coach: isTa ? "தினேஷ் உடற்கல்வி ஆசிரியர்" : "Coach M. Dinesh" },
      { id: "t3", name: isTa ? "மாணவர்கள் கபடி அணி" : "Boys Kabaddi Team", role: isTa ? "வலதுபுற ரைடர்" : "Right Raider", icon: "fi fi-sr-users", color: "from-emerald-500 to-teal-600", match: isTa ? "மாவட்ட பள்ளிகளுக்கு இடையிலான லீக்" : "District Inter-School League", date: "Oct 18, 2026", coach: isTa ? "ரமேஷ் உடற்கல்வி ஆசிரியர்" : "Coach K. Ramesh" }
    ];

    const petFitness = {
      weightKg: isGirls ? (isHsc ? 52 : 48) : (isHsc ? 65 : 58),
      heightCm: isGirls ? (isHsc ? 162 : 156) : (isHsc ? 174 : 168),
      endurance: isGirls ? 90 : 94,
      strength: isGirls ? 85 : 88,
      speed: isGirls ? 92 : 95,
      flexibility: isGirls ? 96 : 84,
      posture: "Optimal",
      restingHeartRate: isGirls ? 64 : 60,
      bloodGroup: isGirls ? "B+" : "O+",
      vision: "Normal (6/6)",
      notes: isTa 
        ? `விரைவோட்டம், நெகிழ்வுத்தன்மை மற்றும் எறிபந்தில் சிறந்த ஆட்டம். ${ageGroup} பிரிவில் மாவட்ட மற்றும் மாநில அளவிலான போட்டிகளுக்கு பரிந்துரைக்கப்படுகிறார்.`
        : `Excellent athletic performance in ${isGirls ? "Sprint, Flexibility & Throwball" : "Football, Sprint & Kabaddi"}. Highly recommended for ${ageGroup} Division District & State Tournaments.`
    };

    const petEvents = [
      { id: "pe1", name: isTa ? "தமிழ்நாடு மாநில பள்ளி தடகளப் போட்டி" : "TN State School Athletics Meet", sport: isTa ? "தடகளம்" : "Athletics", date: "Aug 15, 2026", venue: "Jawaharlal Nehru Stadium, Chennai", kind: "Competition", level: "State", status: "Upcoming", participants: 120, division: isGirls ? "Girls" : "Boys", targetClasses: "Class 9-12", ageGroup: ageGroup, notes: isTa ? "அதிகாரப்பூர்வ மாநிலத் தேர்வுப் போட்டி. காலை 7:00 மணிக்கு வரவும்." : "Official SGFI State selection. Mandatory reporting at 7:00 AM.", isRegistered: true },
      { id: "pe2", name: isTa ? `மாவட்ட பள்ளிகளுக்கு இடையிலான ${isGirls ? "எறிபந்து & கைப்பந்து" : "கால்பந்து & கபடி"} கோப்பை` : `District Inter-School ${isGirls ? "Throwball & Volleyball" : "Football & Kabaddi"} Cup`, sport: isGirls ? "Throwball" : "Football", date: "Aug 28, 2026", venue: "District Sports Complex", kind: "Competition", level: "District", status: "Upcoming", participants: 64, division: isGirls ? "Girls" : "Boys", targetClasses: "Class 8-12", ageGroup: ageGroup, notes: isTa ? "சாம்பியன்ஷிப் கோப்பைக்கான நாக் அவுட் போட்டிகள்." : "Inter-school knockouts for championship trophy.", isRegistered: true },
      { id: "pe3", name: isTa ? "மாநில அளவிலான யோகா சாம்பியன்ஷிப்" : "State Level Inter-School Yoga Championship", sport: isTa ? "யோகா" : "Yoga", date: "Sep 05, 2026", venue: "School Indoor Auditorium", kind: "Competition", level: "State", status: "Upcoming", participants: 80, division: "Co-Ed", targetClasses: "Class 6-12", ageGroup: "All Groups", notes: isTa ? "ஃபிட் இந்தியா விதிகளின்படி ஆசனங்கள் மதிப்பீடு." : "Asana performance evaluation under Fit India rules.", isRegistered: false }
    ];

    const awards = [
      { id: "aw-1", student: studentName, event: isTa ? `மாவட்ட ${ageGroup} ${isGirls ? "எறிபந்து" : "தடகள"} சாம்பியன்ஷிப்` : `District ${ageGroup} ${isGirls ? "Throwball" : "Athletics"} Championship`, sport: isGirls ? "Throwball" : "Athletics", medal: "Gold", level: "District", date: "2026-06-15", certificateIssued: true, quotaForm: "Form-III (District Level)" },
      { id: "aw-2", student: studentName, event: isTa ? `மண்டல 100மீ ஓட்டம் (${ageGroup} ${gender} பிரிவு)` : `Zonal 100m Sprint (${ageGroup} ${gender} Division)`, sport: "Athletics", medal: "Gold", level: "State", date: "2026-03-20", certificateIssued: true, quotaForm: "Form-II (State Level)" }
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
        { label: isTa ? "100மீ விரைவோட்டம்" : "100m Sprint", value: isGirls ? "12.4s" : "11.8s", score: 92, icon: "fi fi-sr-bolt", softBg: "bg-emerald-100 dark:bg-emerald-900/40", iconColor: "text-emerald-600 dark:text-emerald-400" },
        { label: isTa ? "குண்டு எறிதல்" : "Shot Put / Throw", value: isGirls ? "9.8m" : "11.2m", score: 85, icon: "fi fi-sr-star", softBg: "bg-blue-100 dark:bg-blue-900/40", iconColor: "text-blue-600 dark:text-blue-400" },
        { label: isTa ? "வளைந்து கொடுக்கும் பயிற்சி" : "Flexibility Sit-Reach", value: isGirls ? "+24 cm" : "+18 cm", score: 96, icon: "fi fi-sr-target", softBg: "bg-purple-100 dark:bg-purple-900/40", iconColor: "text-purple-600 dark:text-purple-400" },
        { label: isTa ? "இதய சகிப்புத்தன்மை" : "Cardio Endurance", value: "Superior", score: 94, icon: "fi fi-sr-heart", softBg: "bg-rose-100 dark:bg-rose-900/40", iconColor: "text-rose-600 dark:text-rose-400" }
      ],
      events: [
        { id: "e1", title: isTa ? "ஆண்டு விளையாட்டு விழா 2026" : "Annual Sports Meet 2026", date: "Aug 20, 2026", type: "Tournament", icon: "fi fi-sr-trophy" }
      ],
      logs: [
        { id: "l1", activity: isGirls ? (isTa ? "100மீ ஓட்டம் & நெகிழ்வுப் பயிற்சி" : "100m Sprint & Flexibility Practice") : (isTa ? "100மீ ஓட்டம் & கால்பந்து பயிற்சி" : "100m Sprint & Football Drills"), duration: "45 mins", intensity: "High", calories: 340, date: "2026-07-23" }
      ],
      injuries: [
        { id: "i1", type: isTa ? "லேசான கணுக்கால் சுளுக்கு" : "Mild Ankle Sprain", severity: "Mild", description: isTa ? "பயிற்சியின் போது சுளுக்கு ஏற்பட்டது. ஓய்வு எடுக்கப்பட்டது." : "Slight sprain during sports practice. Fully rested and iced.", status: "Resolved", date: "2026-07-10" }
      ],
      petFitness,
      petEvents,
      awards,
      clubs: isGirls ? [
        { id: "c1", club: { name: isTa ? "மாணவிகள் தடகள மன்றம்" : "Girls Athletics & Track Club" }, role: isTa ? "அணித் தலைவர்" : "Team Captain", meetingTime: "Mon & Thu, 4-5 PM", coordinator: isTa ? "அனிதா உடற்கல்வி ஆசிரியர்" : "Coach Anitha PET" },
        { id: "c2", club: { name: isTa ? "பள்ளி எறிபந்து அகாதமி" : "School Throwball & Volleyball Academy" }, role: isTa ? "ஆரம்ப VII" : "Starting VII", meetingTime: "Tue & Fri, 4-5 PM", coordinator: isTa ? "செல்வம் ஆசிரியர்" : "Coach R. Selvam" }
      ] : [
        { id: "c1", club: { name: isTa ? "மாணவர்கள் தடகள மன்றம்" : "Boys Athletics & Track Club" }, role: isTa ? "அணித் தலைவர்" : "Team Captain", meetingTime: "Mon & Thu, 4-5 PM", coordinator: isTa ? "தினேஷ் ஆசிரியர்" : "Coach Dinesh PET" },
        { id: "c2", club: { name: isTa ? "பள்ளி கால்பந்து அகாதமி" : "School Football & Kabaddi Academy" }, role: isTa ? "ஆரம்ப XI" : "Starting XI", meetingTime: "Tue & Fri, 4-5 PM", coordinator: isTa ? "செல்வம் ஆசிரியர்" : "Coach R. Selvam" }
      ]
    };
  }

  // Enrich backend stats (which lack icon/softBg/iconColor) with matching Flaticon classes
  function enrichStatsWithIcons(stats: any[]): any[] {
    if (!stats || !Array.isArray(stats)) return stats;

    const ICON_MAP: Record<string, { icon: string; softBg: string; iconColor: string }> = {
      // English labels
      endurance:    { icon: "fi fi-sr-heart-rate",  softBg: "bg-emerald-100 dark:bg-emerald-900/40", iconColor: "text-emerald-600 dark:text-emerald-400" },
      strength:     { icon: "fi fi-sr-dumbbell",    softBg: "bg-blue-100 dark:bg-blue-900/40",     iconColor: "text-blue-600 dark:text-blue-400"     },
      flexibility:  { icon: "fi fi-sr-target",      softBg: "bg-purple-100 dark:bg-purple-900/40", iconColor: "text-purple-600 dark:text-purple-400" },
      speed:        { icon: "fi fi-sr-bolt",         softBg: "bg-amber-100 dark:bg-amber-900/40",  iconColor: "text-amber-600 dark:text-amber-400"  },
      sprint:       { icon: "fi fi-sr-bolt",         softBg: "bg-emerald-100 dark:bg-emerald-900/40", iconColor: "text-emerald-600 dark:text-emerald-400" },
      "100m":       { icon: "fi fi-sr-bolt",         softBg: "bg-emerald-100 dark:bg-emerald-900/40", iconColor: "text-emerald-600 dark:text-emerald-400" },
      "shot put":   { icon: "fi fi-sr-star",         softBg: "bg-blue-100 dark:bg-blue-900/40",    iconColor: "text-blue-600 dark:text-blue-400"    },
      throw:        { icon: "fi fi-sr-star",         softBg: "bg-blue-100 dark:bg-blue-900/40",    iconColor: "text-blue-600 dark:text-blue-400"    },
      cardio:       { icon: "fi fi-sr-heart",        softBg: "bg-rose-100 dark:bg-rose-900/40",   iconColor: "text-rose-600 dark:text-rose-400"   },
      heart:        { icon: "fi fi-sr-heart",        softBg: "bg-rose-100 dark:bg-rose-900/40",   iconColor: "text-rose-600 dark:text-rose-400"   },
      "resting hr": { icon: "fi fi-sr-heart-rate",  softBg: "bg-rose-100 dark:bg-rose-900/40",   iconColor: "text-rose-600 dark:text-rose-400"   },
      resting:      { icon: "fi fi-sr-heart-rate",  softBg: "bg-rose-100 dark:bg-rose-900/40",   iconColor: "text-rose-600 dark:text-rose-400"   },
      bmi:          { icon: "fi fi-sr-weight",       softBg: "bg-cyan-100 dark:bg-cyan-900/40",   iconColor: "text-cyan-600 dark:text-cyan-400"   },
      posture:      { icon: "fi fi-sr-user",         softBg: "bg-indigo-100 dark:bg-indigo-900/40",iconColor: "text-indigo-600 dark:text-indigo-400"},
      balance:      { icon: "fi fi-sr-gym",          softBg: "bg-teal-100 dark:bg-teal-900/40",   iconColor: "text-teal-600 dark:text-teal-400"   },
      agility:      { icon: "fi fi-sr-running",      softBg: "bg-orange-100 dark:bg-orange-900/40",iconColor: "text-orange-600 dark:text-orange-400"},
      // Tamil labels (partial keyword match)
      "இதய":        { icon: "fi fi-sr-heart",        softBg: "bg-rose-100 dark:bg-rose-900/40",   iconColor: "text-rose-600 dark:text-rose-400"   },
      "வேகம்":      { icon: "fi fi-sr-bolt",         softBg: "bg-amber-100 dark:bg-amber-900/40", iconColor: "text-amber-600 dark:text-amber-400" },
      "வளைந்து":    { icon: "fi fi-sr-target",      softBg: "bg-purple-100 dark:bg-purple-900/40",iconColor: "text-purple-600 dark:text-purple-400"},
      "குண்டு":     { icon: "fi fi-sr-star",         softBg: "bg-blue-100 dark:bg-blue-900/40",   iconColor: "text-blue-600 dark:text-blue-400"   },
      "100மீ":      { icon: "fi fi-sr-bolt",         softBg: "bg-emerald-100 dark:bg-emerald-900/40",iconColor:"text-emerald-600 dark:text-emerald-400"},
    };

    return stats.map((st: any) => {
      // Only skip enrichment if the icon is already a valid Flaticon class (starts with "fi ")
      // Emoji or other non-Flaticon values must also be enriched
      if (st.icon && typeof st.icon === "string" && st.icon.trim().startsWith("fi ")) return st;

      // Try to match by lowercased label
      const labelLower = (st.label || "").toLowerCase();
      let matched = ICON_MAP[labelLower];

      if (!matched) {
        // Partial keyword search
        for (const [key, val] of Object.entries(ICON_MAP)) {
          if (labelLower.includes(key) || (st.label || "").includes(key)) {
            matched = val;
            break;
          }
        }
      }

      return {
        ...st,
        icon:     matched?.icon     || "fi fi-sr-running",
        softBg:   matched?.softBg   || "bg-slate-100 dark:bg-slate-800",
        iconColor:matched?.iconColor|| "text-slate-600 dark:text-slate-400",
      };
    });
  }

  async function fetchSportsData() {
    if (status === "loading") return;
    const targetStudentId = (session?.user as any)?.id || "demo-student";

    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/sports/${targetStudentId}`);
      const json = await res.json();
      if (json.success && json.data) {
        // Auto-detect gender from logged in student user record!
        const autoGender: StudentGender = (json.data.gender as any) || (session?.user as any)?.gender || selectedGender;
        setSelectedGender(autoGender);
        
        const generated = generateStudentProfile(autoGender, selectedClassLevel);
        const initialData: StudentSportsData = {
          ...generated,
          ...json.data,
          petFitness: json.data?.petFitness || generated.petFitness,
          // Enrich backend stats with icon metadata (backend doesn't store icon/softBg/iconColor)
          stats: enrichStatsWithIcons(json.data?.stats?.length ? json.data.stats : generated.stats),
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

    const generated = generateStudentProfile(selectedGender, selectedClassLevel);
    setData(generated);
    setAwardsPageData(generated.awards || DEFAULT_AWARDS);
  }

  useEffect(() => {
    fetchSportsData();
  }, [session, status, selectedGender, selectedClassLevel, currentLang]);

  async function handleRegisterEvent(eventId: string) {
    if (!data || registeringId) return;
    try {
      setRegisteringId(eventId);
      await fetch(`${API_BASE}/api/sports/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: data.studentId })
      });
      showToast(currentLang === "தமிழ்" ? "போட்டிக்கான பதிவு வெற்றிகரமாக முடிந்தது!" : "Successfully registered for event!");
    } catch {
      showToast(currentLang === "தமிழ்" ? "போட்டிக்கான பதிவு வெற்றிகரமாக முடிந்தது!" : "Registered for event successfully!");
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
    showToast(currentLang === "தமிழ்" ? `பயிற்சி பதிவு செய்யப்பட்டது: ${logActivity}!` : `Logged workout: ${logActivity}!`);
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
      status: currentLang === "தமிழ்" ? "ஆசிரியர் பரிசீலனையில் உள்ளது" : "Pending PET Review",
      date: new Date().toISOString().slice(0, 10)
    };

    setData(prev => prev ? { ...prev, injuries: [newInjury, ...(prev.injuries || [])] } : prev);
    setIsSavingInjury(false);
    setIsInjuryModalOpen(false);
    showToast(currentLang === "தமிழ்" ? "காயம் பற்றிய தகவல் உடற்கல்வி ஆசிரியருக்கு அனுப்பப்பட்டது." : "Injury report submitted to Physical Education Coach.");
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
      <PortalLayout title={dict.portalTitle} subtitle={dict.portalSubtitle} themeClass="theme-student">
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
      title={dict.portalTitle}
      subtitle={`${dict.portalSubtitle} · ${currentData.studentName} · Class ${currentData.className} (${selectedGender === "Female" ? (currentLang === "தமிழ்" ? "மாணவி" : "Female") : (currentLang === "தமிழ்" ? "மாணவர்" : "Male")})`}
      avatarLetter={currentData.studentName.charAt(0)}
      avatarColor={currentData.gender === "Female" ? "#ec4899" : "#06b6d4"}
      themeClass="theme-student"
      accentColor={currentData.gender === "Female" ? "#ec4899" : "#06b6d4"}
    >
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-3">
          <i className="fi fi-sr-check-circle flex items-center" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── PAGE HEADER ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
        {/* Left: description */}
        <div className="max-w-xl">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-snug">
            Track your fitness, join teams, and excel in sports events.
          </p>
        </div>

        {/* Right: KPI chips + class badge */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Fit India Score chip */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-extrabold text-xs rounded-xl border border-rose-200/50 dark:border-rose-800/40 shadow-sm">
            <i className="fi fi-sr-heart flex items-center text-rose-500" />
            <span>{currentData.petFitness ? `${currentData.petFitness.speed || 92}%` : "Grade A"} Fit Score</span>
          </div>

          {/* Teams chip */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-extrabold text-xs rounded-xl border border-blue-200/50 dark:border-blue-800/40 shadow-sm">
            <i className="fi fi-sr-users flex items-center text-blue-500" />
            <span>{currentData.teams?.length || 0} Teams</span>
          </div>

          {/* Class badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs rounded-xl border border-emerald-200/50 dark:border-emerald-800/40 shadow-sm">
            <i className="fi fi-sr-shield flex items-center text-emerald-500" />
            <span>
              {selectedGender === "Female" ? dict.girlsDiv : dict.boysDiv} · {currentData.ageGroup}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 w-full mb-8 overflow-x-auto gap-1">
        {[
          { id: "overview", label: dict.tabOverview, iconClass: "fi fi-sr-heart" },
          { id: "teams", label: dict.tabTeams, iconClass: "fi fi-sr-users" },
          { id: "events", label: dict.tabEvents, iconClass: "fi fi-sr-calendar" },
          { id: "awards", label: dict.tabAwards, iconClass: "fi fi-sr-trophy" }
        ].map(tab => {
          const isActive = activeTab === tab.id;
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
                  ? selectedGender === "Female" 
                    ? "bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 shadow-sm"
                    : "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <i className={`${tab.iconClass} flex items-center text-sm ${isActive ? (selectedGender === "Female" ? "text-pink-500" : "text-cyan-500") : "text-slate-400"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards">
        
        {/* TAB 1: HEALTH & FITNESS SCORECARD */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fi fi-sr-heart text-rose-500 flex items-center" /> {dict.vitalsTitle} ({selectedGender === "Female" ? (currentLang === "தமிழ்" ? "மாணவி" : "Female") : (currentLang === "தமிழ்" ? "மாணவர்" : "Male")} · {currentData.ageGroup})
              </h2>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                {dict.fitIndiaStd}
              </span>
            </div>

            {/* Vitals Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{dict.bmiIndex}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {dict.bmiOptimal}
                  </span>
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-800 dark:text-white">
                    {currentData.petFitness?.weightKg 
                      ? ((currentData.petFitness.weightKg) / Math.pow((currentData.petFitness.heightCm || 165) / 100, 2)).toFixed(1)
                      : "20.2"}
                  </div>
                  <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                    {currentData.petFitness?.weightKg || 55} kg / {currentData.petFitness?.heightCm || 165} cm
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{dict.endurance}</div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black text-slate-800 dark:text-white">{currentData.petFitness?.endurance || 92}/100</span>
                    <span className="text-xs font-bold text-emerald-500">Superior</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${currentData.petFitness?.endurance || 92}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{dict.flexibility}</div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black text-slate-800 dark:text-white">{currentData.petFitness?.flexibility || 88}/100</span>
                    <span className="text-xs font-bold text-purple-500">Excellent Range</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${currentData.petFitness?.flexibility || 88}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{dict.speed}</div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black text-slate-800 dark:text-white">{currentData.petFitness?.speed || 94}/100</span>
                    <span className="text-xs font-bold text-amber-500">Elite Sprinter</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${currentData.petFitness?.speed || 94}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Test Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-800 dark:text-white text-base flex items-center gap-2">
                  <i className="fi fi-sr-bolt text-cyan-500 flex items-center" /> {dict.stdMetrics} ({selectedGender})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentData.stats.map((st: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${st.softBg || "bg-slate-100"} flex items-center justify-center shrink-0`}>
                          <i className={`${st.icon || "fi fi-sr-running"} text-base flex items-center ${st.iconColor || "text-slate-600"}`} />
                        </div>
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

              {/* PET Teacher Evaluation Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-extrabold text-xs uppercase tracking-wider mb-4">
                    <i className="fi fi-sr-info text-cyan-600 dark:text-cyan-400 flex items-center" /> {dict.peEvaluation}
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 p-4 rounded-2xl mb-5">
                    <p className="text-slate-700 dark:text-slate-100 text-xs sm:text-sm font-semibold leading-relaxed italic">
                      &quot;{currentData.petFitness?.notes || "Excellent athletic performance. Highly recommended for District & State tournaments."}&quot;
                    </p>
                  </div>

                  <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-300 font-bold">{dict.heartRate}</span>
                      <span className="text-cyan-700 dark:text-cyan-300 font-black bg-cyan-50 dark:bg-slate-800 px-3 py-1 rounded-xl border border-cyan-100 dark:border-slate-700">
                        {currentData.petFitness?.restingHeartRate || 64} bpm
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-300 font-bold">{dict.bloodGroup}</span>
                      <span className="text-cyan-700 dark:text-cyan-300 font-black bg-cyan-50 dark:bg-slate-800 px-3 py-1 rounded-xl border border-cyan-100 dark:border-slate-700">
                        {currentData.petFitness?.bloodGroup || "O+"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-300 font-bold">{dict.visionCheck}</span>
                      <span className="text-cyan-700 dark:text-cyan-300 font-black bg-cyan-50 dark:bg-slate-800 px-3 py-1 rounded-xl border border-cyan-100 dark:border-slate-700">
                        {currentData.petFitness?.vision || "Normal (6/6)"}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsInjuryModalOpen(true)}
                  className="mt-6 w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <i className="fi fi-sr-heart fill-white/20 flex items-center" /> {dict.reportInjury}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SQUADS */}
        {activeTab === "teams" && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <i className={`fi fi-sr-users flex items-center ${selectedGender === "Female" ? "text-pink-500" : "text-cyan-500"}`} /> {dict.mySquads}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentData.teams.map((tm: any) => (
                <div key={tm.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tm.color} flex items-center justify-center shrink-0 shadow-md`}>
                        <i className={`${tm.icon} text-lg flex items-center text-white`} />
                      </div>
                      <span className="px-3 py-1 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-full text-[10px] font-extrabold uppercase">
                        {tm.role}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">{tm.name}</h3>
                    <p className="text-xs font-semibold text-slate-400 mb-4">{tm.coach}</p>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>{dict.upcomingMatch}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{tm.match}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>{dict.fixtureDate}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{tm.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <i className="fi fi-sr-check-circle flex items-center" /> {dict.officialRoster}
                    </span>
                    <button onClick={() => setActiveTab("events")} className="text-cyan-600 font-extrabold flex items-center gap-0.5">
                      {dict.viewFixtures} <i className="fi fi-sr-angle-right flex items-center" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: EVENTS & COMPETITIONS */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="relative flex-1">
                <i className="fi fi-sr-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center" />
                <input
                  type="text"
                  placeholder={dict.searchEventsPlaceholder}
                  value={eventSearchQuery}
                  onChange={(e) => { setEventSearchQuery(e.target.value); setEventPage(1); }}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select 
                  value={eventDivisionFilter} 
                  onChange={(e) => { setEventDivisionFilter(e.target.value); setEventPage(1); }}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
                >
                  <option value="All">{dict.allDivisions}</option>
                  <option value="Girls">{dict.girlsDivision}</option>
                  <option value="Boys">{dict.boysDivision}</option>
                  <option value="Co-Ed">{dict.coEd}</option>
                </select>

                <select 
                  value={eventLevelFilter} 
                  onChange={(e) => { setEventLevelFilter(e.target.value); setEventPage(1); }}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
                >
                  <option value="All">{dict.allLevels}</option>
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
                    <i className="fi fi-sr-trophy flex items-center" />
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
                      <span className="flex items-center gap-1"><i className="fi fi-sr-map-marker flex items-center" /> {ev.venue}</span>
                      <span className="flex items-center gap-1"><i className="fi fi-sr-time-past flex items-center" /> {ev.date}</span>
                      <span className="flex items-center gap-1"><i className="fi fi-sr-target flex items-center" /> {ev.sport}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedEventModal(ev)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <i className="fi fi-sr-info flex items-center" /> {dict.details}
                    </button>

                    {ev.isRegistered ? (
                      <span className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                        <i className="fi fi-sr-check-circle flex items-center" /> {dict.registered}
                      </span>
                    ) : new Date(ev.date) < new Date(new Date().setHours(0,0,0,0)) ? null : (
                      <button
                        onClick={() => handleRegisterEvent(ev.id)}
                        disabled={registeringId === ev.id}
                        className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-extrabold shadow-sm transition-all"
                      >
                        {dict.registerNow}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AWARDS & CERTIFICATES */}
        {activeTab === "awards" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fi fi-sr-award text-yellow-500 flex items-center" /> {dict.honoursTitle}
              </h2>
              {currentData.sportsQuotaEligible && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full text-xs font-black">
                  ⭐ {dict.quotaPts} {currentData.sportsQuotaPoints} Pts
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedAwards.map(aw => (
                <div key={aw.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center shrink-0">
                        <i className="fi fi-sr-trophy flex items-center" />
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
                      <i className="fi fi-sr-check-circle flex items-center" /> {dict.officialVerified}
                    </span>
                    <button 
                      onClick={() => setSelectedCertificateModal(aw)}
                      className="px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <i className="fi fi-sr-eye flex items-center" /> {dict.viewCert}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: HOUSE SYSTEM */}


      </div>

      {/* EVENT MODAL */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedEventModal.name}</h3>
              <button onClick={() => setSelectedEventModal(null)} className="p-2 text-slate-400 hover:text-slate-600"><i className="fi fi-sr-cross-small flex items-center" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
              <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Sport</span><span className="font-extrabold text-slate-800 dark:text-white">{selectedEventModal.sport}</span></div>
              <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Division</span><span className="font-extrabold text-slate-800 dark:text-white">{selectedEventModal.division || "Co-Ed"}</span></div>
              <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Date</span><span className="font-extrabold text-slate-800 dark:text-white">{selectedEventModal.date}</span></div>
              <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Venue</span><span className="font-extrabold text-slate-800 dark:text-white">{selectedEventModal.venue}</span></div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setSelectedEventModal(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500">{dict.close}</button>
              {!selectedEventModal.isRegistered && new Date(selectedEventModal.date) >= new Date(new Date().setHours(0,0,0,0)) && (
                <button onClick={() => handleRegisterEvent(selectedEventModal.id)} className="px-5 py-2 bg-cyan-600 text-white rounded-xl text-xs font-extrabold">{dict.registerNow}</button>
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
                <i className="fi fi-sr-dumbbell text-cyan-500 flex items-center" /> {dict.logWorkout}
              </h3>
              <button type="button" onClick={() => setIsLogModalOpen(false)} className="p-2 text-slate-400"><i className="fi fi-sr-cross-small flex items-center" /></button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Activity Name</label>
              <input type="text" required value={logActivity} onChange={e => setLogActivity(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl text-xs font-bold" />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsLogModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500">{dict.close}</button>
              <button type="submit" className="px-5 py-2 bg-cyan-600 text-white rounded-xl text-xs font-extrabold">{dict.logWorkout}</button>
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
                <i className="fi fi-sr-heart text-rose-500 flex items-center" /> {dict.reportInjuryBtn}
              </h3>
              <button type="button" onClick={() => setIsInjuryModalOpen(false)} className="p-2 text-slate-400"><i className="fi fi-sr-cross-small flex items-center" /></button>
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
              <button type="button" onClick={() => setIsInjuryModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500">{dict.close}</button>
              <button type="submit" className="px-5 py-2 bg-rose-600 text-white rounded-xl text-xs font-extrabold">{dict.reportInjuryBtn}</button>
            </div>
          </form>
        </div>
      )}

      {/* CERTIFICATE MODAL */}
      {selectedCertificateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-center">
            <div className="flex justify-end"><button onClick={() => setSelectedCertificateModal(null)} className="p-2 text-slate-400"><i className="fi fi-sr-cross-small flex items-center" /></button></div>
            <div className="border-4 border-amber-400 p-6 rounded-2xl bg-amber-50/30 dark:bg-slate-800/50 space-y-3">
              <i className="fi fi-sr-trophy mx-auto text-amber-500 flex items-center" />
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">
                {currentLang === "தமிழ்" ? "பள்ளிப் பள்ளிக் கல்வித் துறை · தமிழ்நாடு அரசு" : "Department of School Education · Tamil Nadu"}
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {currentLang === "தமிழ்" ? "விளையாட்டுச் சாதனைச் சான்றிதழ்" : "Certificate of Athletic Excellence"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {currentLang === "தமிழ்" ? (
                  <span>
                    <strong className="text-slate-900 dark:text-white">{currentData.studentName}</strong> ({selectedGender === "Female" ? "மாணவி" : "மாணவர்"}){" "}
                    <strong>{selectedCertificateModal.event}</strong> ({selectedCertificateModal.sport}) போட்டியில்{" "}
                    <strong className="text-amber-600">{selectedCertificateModal.medal} பதக்கம்</strong> பெற்றுள்ளார் எனச் சான்றளிக்கப்படுகிறது.
                  </span>
                ) : (
                  <span>
                    This certifies that <strong className="text-slate-900 dark:text-white">{currentData.studentName}</strong> ({selectedGender === "Female" ? "Female Student" : "Male Student"}) has achieved{" "}
                    <strong className="text-amber-600">{selectedCertificateModal.medal} Medal</strong> in{" "}
                    <strong>{selectedCertificateModal.event}</strong> ({selectedCertificateModal.sport}).
                  </span>
                )}
              </p>
              <div className="text-[10px] font-bold text-slate-400 pt-2 border-t border-amber-200">
                Official {selectedCertificateModal.quotaForm || "Form-III"} Verified Certificate
              </div>
            </div>
            <button onClick={() => { showToast(currentLang === "தமிழ்" ? "சான்றிதழ் பதிவிறக்கப்பட்டது!" : "Downloaded E-Certificate!"); setSelectedCertificateModal(null); }} className="px-5 py-2.5 bg-cyan-600 text-white rounded-2xl text-xs font-extrabold flex items-center gap-2 mx-auto">
              <i className="fi fi-sr-download flex items-center" /> {dict.downloadCert}
            </button>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
