"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
const Icon = (name: string) => {
  const Comp = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
    <i className={`fi ${name} ${className}`} style={{ fontSize: size, lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} />
  );
  Comp.displayName = "Icon";
  return Comp;
};

const Smile = Icon("fi-rr-smile");
const User = Icon("fi-rr-user");
const ArrowLeft = Icon("fi-rr-arrow-left");
const HeartPulse = Icon("fi-rr-heart");
const GraduationCap = Icon("fi-rr-graduation-cap");
const Users = Icon("fi-rr-users");
const Home = Icon("fi-rr-home");
const Heart = Icon("fi-rr-heart");
const Building = Icon("fi-rr-building");
const ShieldCheck = Icon("fi-rr-shield-check");
const Smartphone = Icon("fi-rr-smartphone");
const Rocket = Icon("fi-rr-rocket");
const BookOpen = Icon("fi-rr-book-alt");
const Clock = Icon("fi-rr-clock");
const Star = Icon("fi-rr-star");
const MessageCircle = Icon("fi-rr-comment");
const Shield = Icon("fi-rr-shield");
const Megaphone = Icon("fi-rr-megaphone");
const Target = Icon("fi-rr-target");
const Phone = Icon("fi-rr-phone-call");
const Scale = Icon("fi-rr-scale");
const PenTool = Icon("fi-rr-pen-nib");
const Sun = Icon("fi-rr-sun");
const Calendar = Icon("fi-rr-calendar");
const MessageSquare = Icon("fi-rr-comment-alt");
const AlertTriangle = Icon("fi-rr-triangle-warning");
const Lock = Icon("fi-rr-lock");
const Eye = Icon("fi-rr-eye");
const CalendarCheck = Icon("fi-rr-calendar-check");
const CheckCircle = Icon("fi-rr-check-circle");
const RefreshCw = Icon("fi-rr-refresh");
const Edit3 = Icon("fi-rr-edit");
const ArrowRight = Icon("fi-rr-arrow-right");
const Check = Icon("fi-rr-check");
const Globe = Icon("fi-rr-globe");
const UserX = Icon("fi-rr-lock");
const ChevronLeft = Icon("fi-rr-angle-left");
const ChevronRight = Icon("fi-rr-angle-right");
const Trash2 = Icon("fi-rr-trash");

// ─────────────────────────────────────────────────────────────────────────────
// Translations
// ─────────────────────────────────────────────────────────────────────────────
const t = {
  en: {
    pageTitle: "Personal Counsellor",
    pageSub: "A confidential safe space — your feelings matter here",
    backToPortal: "Back to Portal",
    supportCenter: "Student Support Centre",
    heroTitle: "You Are Not Alone 💙",
    heroDesc: "This is your private safe space. Share how you feel or book a 1-on-1 session. Confidential student notes and support requests are reviewed directly by the Headmaster (HM) & School Counsellor for your safety.",
    confidential: "Fully Confidential",
    monitored: "Reviewed by Headmaster & Counsellor",
    helplineBadge: "Helpline: 1098",
    pocsoBadge: "POCSO Protected",
    tabMood: "Mood & Feedback",
    tabSession: "Book a Session",
    tabHelpline: "Helplines",

    // Mood Section
    howFeeling: "How are you feeling today?",
    howFeelingSub: "Tap your current mood — this helps your counsellor understand you better.",
    youSelected: "You selected:",
    whatToTalk: "What would you like to talk about?",
    whatToTalkSub: "Choose a topic to get instant counsellor tips personalised for you.",
    shareThoughts: "Share Your Thoughts",
    shareThoughtsSub: "Write anything you want your counsellor to know. This is private and safe.",
    placeholderTextArea: "Write freely here... e.g., 'I feel very stressed about my exams and I don't know how to manage my time.'",
    submitAnonymous: "Submitting Anonymously",
    submitAnonymousSub: "Your identity will NOT be shared with anyone",
    submitNamed: "Submitting with Your Name",
    submitNamedSub: "Your counsellor will see your name for follow-up",
    sendToCounsellor: "Send to My Counsellor",
    messageSent: "Message Sent Successfully!",
    messageSentDesc: "Your counsellor will review your message and reach out within 1–2 school days.",
    sendAnother: "Send another message",

    // Right Sidebar
    counsellorTips: "Counsellor Tips",
    tipsFor: "Tips for:",
    generalTips: "General wellbeing guidance for you",
    needHelp: "Need Immediate Help?",
    haveComplaint: "Have a Complaint?",
    haveComplaintDesc: "If you face mistreatment by staff, school, or anyone, file a formal report — reviewed by top officials up to the Commissioner level.",
    fileReport: "File a Report →",

    // Session Section
    bookSession: "Book a Counsellor Session",
    bookSessionSub: "Choose an available time slot to meet your school's personal counsellor. Sessions are held privately. You may bring a trusted friend if you prefer.",
    availableSlots: "Available Slots This Week",
    describeOptional: "Briefly describe what you'd like to discuss",
    optional: "(optional)",
    keepConfidential: "Keep session fully confidential",
    confirmBooking: "Confirm Booking",
    sessionConfirmed: "Session Confirmed!",
    sessionBookedFor: "Your counsellor session is booked for:",
    sessionInstructions: "Please go to the Counsellor Room (near the school office) at your chosen time. Your session is private and fully confidential.",
    booked: "Booked",

    // Helpline Section
    tnGov: "Tamil Nadu Government",
    tnHelpline: "TN Child Helpline",
    tnHelplineSub: "Free · 24/7 · Confidential",
    otherHelplines: "Other Important Helplines",
    pocsoTitle: "⚖️ POCSO Act — Your Legal Protection",
    pocsoDesc: "The Protection of Children from Sexual Offences (POCSO) Act 2012 protects every child below 18 years. Any form of sexual abuse or inappropriate touch by anyone — teachers, relatives, or strangers — is a punishable crime. Report immediately using 1098 or 1517."
  },
  ta: {
    pageTitle: "தனிப்பட்ட ஆலோசகர்",
    pageSub: "ரகசியமான பாதுகாப்பான இடம் — உங்கள் உணர்வுகள் இங்கே மதிக்கப்படுகின்றன",
    backToPortal: "முகப்புக்குத் திரும்பு",
    supportCenter: "மாணவர் ஆதரவு மையம்",
    heroTitle: "நீங்கள் தனியாக இல்லை 💙",
    heroDesc: "இது உங்களின் தனிப்பட்ட பாதுகாப்பான இடம். உங்கள் உணர்வுகளைப் பகிருங்கள் அல்லது நேரத்தை முன்பதிவு செய்யுங்கள். இங்கு சமர்ப்பிக்கப்படும் குறிப்புகள் தலைமை ஆசிரியர் (HM) மற்றும் ஆலோசகரால் நேரடியாகப் பாதுகாப்பாக மதிப்பாய்வு செய்யப்படும்.",
    confidential: "முற்றிலும் ரகசியமானது",
    monitored: "தலைமை ஆசிரியர் & ஆலோசகர் பார்வையிடுவர்",
    helplineBadge: "உதவி எண்: 1098",
    pocsoBadge: "போக்சோ பாதுகாக்கப்பட்டது",
    tabMood: "மனநிலை & கருத்து",
    tabSession: "அமர்வை முன்பதிவு செய்",
    tabHelpline: "உதவி எண்கள்",

    // Mood Section
    howFeeling: "இன்று நீங்கள் எப்படி உணர்கிறீர்கள்?",
    howFeelingSub: "உங்கள் தற்போதைய மனநிலையைத் தேர்ந்தெடுக்கவும் — இது ஆலோசகருக்குப் புரிய உதவும்.",
    youSelected: "நீங்கள் தேர்ந்தெடுத்தது:",
    whatToTalk: "நீங்கள் எதைப் பற்றி பேச விரும்புகிறீர்கள்?",
    whatToTalkSub: "உங்களுக்கான தனிப்பட்ட ஆலோசனைகளைப் பெற ஒரு தலைப்பைத் தேர்ந்தெடுக்கவும்.",
    shareThoughts: "உங்கள் எண்ணங்களைப் பகிருங்கள்",
    shareThoughtsSub: "உங்கள் ஆலோசகர் தெரிந்துகொள்ள வேண்டிய எதையும் எழுதுங்கள். இது பாதுகாப்பானது.",
    placeholderTextArea: "இங்கே தயக்கமின்றி எழுதவும்... உ.ம்: 'தேர்வுகள் குறித்து எனக்கு மிகவும் மன அழுத்தமாக உள்ளது...'",
    submitAnonymous: "அனாமதேயமாக சமர்ப்பித்தல்",
    submitAnonymousSub: "உங்கள் அடையாளம் யாருடனும் பகிரப்படாது",
    submitNamed: "உங்கள் பெயருடன் சமர்ப்பித்தல்",
    submitNamedSub: "தொடர் நடவடிக்கைகளுக்காக உங்கள் பெயர் ஆலோசகருக்குத் தெரியும்",
    sendToCounsellor: "எனது ஆலோசகருக்கு அனுப்பு",
    messageSent: "செய்தி வெற்றிகரமாக அனுப்பப்பட்டது!",
    messageSentDesc: "உங்கள் ஆலோசகர் மதிப்பாய்வு செய்து 1-2 பள்ளி நாட்களுக்குள் உங்களைத் தொடர்புகொள்வார்.",
    sendAnother: "மற்றொரு செய்தியை அனுப்பு",

    // Right Sidebar
    counsellorTips: "ஆலோசகர் குறிப்புகள்",
    tipsFor: "இதற்கான குறிப்புகள்:",
    generalTips: "உங்களுக்கான பொதுவான நல்வாழ்வு வழிகாட்டுதல்",
    needHelp: "உடனடி உதவி தேவையாய்?",
    haveComplaint: "புகார் உள்ளதா?",
    haveComplaintDesc: "பணியாளர், பள்ளி அல்லது வேறு எவராலும் நீங்கள் தவறாக நடத்தப்பட்டால், புகாரளிக்கவும் — இது ஆணையர் நிலை வரை உயர் அதிகாரிகளால் மதிப்பாய்வு செய்யப்படும்.",
    fileReport: "புகார் அளிக்கவும் →",

    // Session Section
    bookSession: "ஆலோசகர் அமர்வை முன்பதிவு செய்",
    bookSessionSub: "உங்கள் பள்ளி ஆலோசகரைச் சந்திக்க ஒரு நேரத்தைத் தேர்ந்தெடுக்கவும். அமர்வுகள் ரகசியமாக நடைபெறும். தேவைப்பட்டால் நண்பரை உடன் அழைத்து வரலாம்.",
    availableSlots: "இந்த வாரம் கிடைக்கும் நேரங்கள்",
    describeOptional: "நீங்கள் விவாதிக்க விரும்புவதைச் சுருக்கமாக விவரிக்கவும்",
    optional: "(விருப்பத்திற்குரியது)",
    keepConfidential: "அமர்வை முழுமையாக ரகசியமாக வைக்கவும்",
    confirmBooking: "முன்பதிவை உறுதி செய்",
    sessionConfirmed: "அமர்வு உறுதி செய்யப்பட்டது!",
    sessionBookedFor: "உங்கள் ஆலோசகர் அமர்வு முன்பதிவு செய்யப்பட்ட நேரம்:",
    sessionInstructions: "தேர்ந்தெடுக்கப்பட்ட நேரத்தில் ஆலோசகர் அறைக்குச் (பள்ளி அலுவலகம் அருகே) செல்லவும். உங்கள் அமர்வு தனிப்பட்டது மற்றும் ரகசியமானது.",
    booked: "முன்பதிவு செய்யப்பட்டது",

    // Helpline Section
    tnGov: "தமிழ்நாடு அரசு",
    tnHelpline: "TN குழந்தை உதவி எண்",
    tnHelplineSub: "இலவசம் · 24/7 · ரகசியமானது",
    otherHelplines: "பிற முக்கிய உதவி எண்கள்",
    pocsoTitle: "⚖️ போக்சோ சட்டம் — உங்கள் சட்டப்பூர்வ பாதுகாப்பு",
    pocsoDesc: "குழந்தைகளை பாலியல் குற்றங்களிலிருந்து பாதுகாக்கும் (POCSO) சட்டம் 2012, 18 வயதுக்குட்பட்ட ஒவ்வொரு குழந்தையையும் பாதுகாக்கிறது. ஆசிரியர்கள், உறவினர்கள் அல்லது அறிமுகமில்லாதவர்கள் என யாராக இருந்தாலும் முறையற்ற தொடுதல் தண்டனைக்குரிய குற்றமாகும். உடனடியாக 1098 அல்லது 1517 என்ற எண்ணில் புகாரளிக்கவும்."
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────
const moods = [
  { emoji: "😄", label: { en: "Happy", ta: "மகிழ்ச்சி" }, icon: Smile, gradFrom: "#f59e0b", gradTo: "#fbbf24", ring: "ring-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-400" },
  { emoji: "😊", label: { en: "Good", ta: "நன்று" }, icon: Smile, gradFrom: "#10b981", gradTo: "#34d399", ring: "ring-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-400" },
  { emoji: "😐", label: { en: "Okay", ta: "பரவாயில்லை" }, icon: Smile, gradFrom: "#3b82f6", gradTo: "#60a5fa", ring: "ring-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-400" },
  { emoji: "😢", label: { en: "Sad", ta: "கவலை" }, icon: Smile, gradFrom: "#8b5cf6", gradTo: "#a78bfa", ring: "ring-violet-400", bg: "bg-violet-50 dark:bg-violet-900/20", border: "border-violet-400" },
  { emoji: "😡", label: { en: "Angry", ta: "கோபம்" }, icon: Smile, gradFrom: "#ef4444", gradTo: "#f87171", ring: "ring-red-400", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-400" },
  { emoji: "😰", label: { en: "Anxious", ta: "பதற்றம்" }, icon: Smile, gradFrom: "#f97316", gradTo: "#fb923c", ring: "ring-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-400" },
];

const topics = [
  { id: "exam", icon: GraduationCap, label: { en: "Exam Stress & Pressure", ta: "தேர்வு மன அழுத்தம்" }, desc: { en: "Overwhelmed by exams, marks, or studies", ta: "தேர்வுகள், மதிப்பெண்கள் பற்றிய கவலை" }, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/20", border: "border-indigo-200 dark:border-indigo-800", active: "border-indigo-500 bg-indigo-100 dark:bg-indigo-900/40" },
  { id: "peer", icon: Users, label: { en: "Peer Pressure & Bullying", ta: "சக மாணவர் தொல்லை" }, desc: { en: "Issues with classmates, teasing, or peer group", ta: "சக மாணவர்களுடனான பிரச்சனைகள்" }, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20", border: "border-rose-200 dark:border-rose-800", active: "border-rose-500 bg-rose-100 dark:bg-rose-900/40" },
  { id: "family", icon: Home, label: { en: "Family Problems", ta: "குடும்பப் பிரச்சனைகள்" }, desc: { en: "Issues at home, parents, siblings, finances", ta: "வீட்டில் உள்ள சிக்கல்கள்" }, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", active: "border-amber-500 bg-amber-100 dark:bg-amber-900/40" },
  { id: "emotional", icon: Heart, label: { en: "Personal & Emotional", ta: "தனிப்பட்ட உணர்வுகள்" }, desc: { en: "Loneliness, heartbreak, self-confidence", ta: "தனிமை, தன்னம்பிக்கை குறைவு" }, color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-50 dark:bg-pink-900/20", border: "border-pink-200 dark:border-pink-800", active: "border-pink-500 bg-pink-100 dark:bg-pink-900/40" },
  { id: "school", icon: Building, label: { en: "School Environment", ta: "பள்ளி சூழல்" }, desc: { en: "Teacher behavior, classroom, or facilities", ta: "ஆசிரியர் நடத்தம், பள்ளி வசதிகள்" }, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800", active: "border-blue-500 bg-blue-100 dark:bg-blue-900/40" },
  { id: "girlSafety", icon: ShieldCheck, label: { en: "Girl Child Safety", ta: "பெண் குழந்தை பாதுகாப்பு" }, desc: { en: "Safety concerns, harassment, special guidance", ta: "பாதுகாப்பு கவலைகள், தொல்லைகள்" }, color: "text-fuchsia-600 dark:text-fuchsia-400", bg: "bg-fuchsia-50 dark:bg-fuchsia-900/20", border: "border-fuchsia-200 dark:border-fuchsia-800", active: "border-fuchsia-500 bg-fuchsia-100 dark:bg-fuchsia-900/40" },
  { id: "social", icon: Smartphone, label: { en: "Social Media Pressure", ta: "சமூக ஊடக அழுத்தம்" }, desc: { en: "Online bullying, screen addiction, comparisons", ta: "ஆன்லைன் துன்புறுத்தல், அடிமைத்தனம்" }, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-900/20", border: "border-cyan-200 dark:border-cyan-800", active: "border-cyan-500 bg-cyan-100 dark:bg-cyan-900/40" },
  { id: "career", icon: Rocket, label: { en: "Career & Future Worry", ta: "தொழில் & எதிர்கால கவலை" }, desc: { en: "Confused about career, stream choice, future", ta: "படிப்பைத் தேர்ந்தெடுப்பதில் குழப்பம்" }, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/20", border: "border-violet-200 dark:border-violet-800", active: "border-violet-500 bg-violet-100 dark:bg-violet-900/40" },
];

const tipsByTopic: Record<string, { icon: React.ElementType; tip: { en: string; ta: string } }[]> = {
  exam: [
    { icon: BookOpen, tip: { en: "Break your syllabus into small daily goals — never try to cover everything at once.", ta: "பாடத்திட்டத்தை சிறிய இலக்குகளாகப் பிரிக்கவும்." } },
    { icon: Clock, tip: { en: "Take a 5-minute break every 45 minutes. Walk, stretch, or drink water.", ta: "ஒவ்வொரு 45 நிமிடங்களுக்கும் 5 நிமிட இடைவெளி எடுக்கவும்." } },
    { icon: Star, tip: { en: "Your worth is not defined by your marks. Every exam is a practice run.", ta: "உங்கள் மதிப்பு மதிப்பெண்களால் தீர்மானிக்கப்படுவதில்லை." } },
  ],
  peer: [
    { icon: ShieldCheck, tip: { en: "You never have to do something uncomfortable to 'fit in'. You are enough.", ta: "யாரையும் திருப்திப்படுத்த நீங்கள் விரும்பாததை செய்ய வேண்டாம்." } },
    { icon: Megaphone, tip: { en: "If anyone bullies you — physically, verbally, or online — tell a trusted adult immediately.", ta: "யாராவது உங்களை மிரட்டினால், உடனடியாக பெரியவர்களிடம் தெரிவிக்கவும்." } },
  ],
  girlSafety: [
    { icon: ShieldCheck, tip: { en: "Your safety is the highest priority. Never stay silent about harassment.", ta: "உங்கள் பாதுகாப்பே முக்கியம். துன்புறுத்தலை மறைக்க வேண்டாம்." } },
    { icon: AlertTriangle, tip: { en: "Use the Report feature to confidentially report any safety concern to officials.", ta: "பாதுகாப்பு குறித்த கவலைகளை புகாரளிக்க 'புகார்' வசதியைப் பயன்படுத்தவும்." } },
  ],
  default: [
    { icon: Heart, tip: { en: "It is perfectly okay to not be okay. Seeking help is a sign of courage.", ta: "சோர்வாக இருப்பது சகஜம். உதவி கேட்பது தைரியத்தின் அடையாளம்." } },
    { icon: PenTool, tip: { en: "Write down what you are feeling — it helps clarify your thoughts.", ta: "உங்கள் உணர்வுகளை எழுதிப் பழகுங்கள் — இது மனதைத் தெளிவாக்கும்." } },
    { icon: Users, tip: { en: "Talk to someone you trust — a teacher, parent, or school counsellor.", ta: "நீங்கள் நம்பும் ஒருவரிடம் பேசுங்கள் — ஆசிரியர், பெற்றோர் அல்லது ஆலோசகர்." } },
  ],
};

// sessionSlots removed - now dynamically fetched from backend

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function CounsellorPage() {
  const [lang, setLang] = useState<"en" | "ta">("en");

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<"mood" | "session" | "helpline" | "history">("mood");
  const [sessionSubmitted, setSessionSubmitted] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const [historyMessages, setHistoryMessages] = useState<any[]>([]);
  const [historyBookings, setHistoryBookings] = useState<any[]>([]);
  const [historyMsgPage, setHistoryMsgPage] = useState(1);
  const [historyBookPage, setHistoryBookPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const totalHistoryMsgPages = Math.ceil(historyMessages.length / ITEMS_PER_PAGE) || 1;
  const paginatedHistoryMessages = historyMessages.slice((historyMsgPage - 1) * ITEMS_PER_PAGE, historyMsgPage * ITEMS_PER_PAGE);

  const totalHistoryBookPages = Math.ceil(historyBookings.length / ITEMS_PER_PAGE) || 1;
  const paginatedHistoryBookings = historyBookings.slice((historyBookPage - 1) * ITEMS_PER_PAGE, historyBookPage * ITEMS_PER_PAGE);

  const [deletedMsgIds, setDeletedMsgIds] = useState<string[]>([]);
  const [deletedBookIds, setDeletedBookIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const [mRes, bRes, sRes] = await Promise.all([
          fetch(`${apiUrl}/api/counsellor/messages`),
          fetch(`${apiUrl}/api/counsellor/bookings`),
          fetch(`${apiUrl}/api/counsellor/slots?schoolId=default`)
        ]);
        const mData = await mRes.json();
        const bData = await bRes.json();
        const sData = await sRes.json();

        if (mData.success && Array.isArray(mData.data)) {
          setHistoryMessages(mData.data.filter((m: any) => !deletedMsgIds.includes(String(m._id))));
        }
        if (bData.success && Array.isArray(bData.data)) {
          setHistoryBookings(bData.data.filter((b: any) => !deletedBookIds.includes(String(b._id))));
        }
        if (sData.success && Array.isArray(sData.data)) {
          setSessionSlots(sData.data);
        }
      } catch (e) {}
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, [deletedMsgIds, deletedBookIds]);

  const L = t[lang];

  const activeTips = selectedTopic
    ? (tipsByTopic[selectedTopic] || tipsByTopic.default)
    : tipsByTopic.default;

  const currentMoodData = moods.find((m) => m.label.en === selectedMood || m.label.ta === selectedMood);

  const [sessionSlots, setSessionSlots] = useState<any[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/api/counsellor/slots?schoolId=default`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setSessionSlots(data.data);
        } else {
          setSessionSlots([
            { _id: "slot-mon-10", dayEn: "Monday", dayTa: "திங்கள்", time: "10:00 AM", isBooked: false },
            { _id: "slot-wed-11", dayEn: "Wednesday", dayTa: "புதன்", time: "11:00 AM", isBooked: true },
            { _id: "slot-fri-1030", dayEn: "Friday", dayTa: "வெள்ளி", time: "10:30 AM", isBooked: false },
            { _id: "slot-mon-2", dayEn: "Monday", dayTa: "திங்கள்", time: "2:00 PM", isBooked: false },
            { _id: "slot-wed-3", dayEn: "Wednesday", dayTa: "புதன்", time: "3:00 PM", isBooked: false },
            { _id: "slot-fri-130", dayEn: "Friday", dayTa: "வெள்ளி", time: "1:30 PM", isBooked: false }
          ]);
        }
      } catch (err) {
        console.error("Error fetching slots", err);
        setSessionSlots([
          { _id: "slot-mon-10", dayEn: "Monday", dayTa: "திங்கள்", time: "10:00 AM", isBooked: false },
          { _id: "slot-wed-11", dayEn: "Wednesday", dayTa: "புதன்", time: "11:00 AM", isBooked: true },
          { _id: "slot-fri-1030", dayEn: "Friday", dayTa: "வெள்ளி", time: "10:30 AM", isBooked: false },
          { _id: "slot-mon-2", dayEn: "Monday", dayTa: "திங்கள்", time: "2:00 PM", isBooked: false },
          { _id: "slot-wed-3", dayEn: "Wednesday", dayTa: "புதன்", time: "3:00 PM", isBooked: false },
          { _id: "slot-fri-130", dayEn: "Friday", dayTa: "வெள்ளி", time: "1:30 PM", isBooked: false }
        ]);
      } finally {
        setIsLoadingSlots(false);
      }
    };
    fetchSlots();
  }, []);

  const [isSubmittingMsg, setIsSubmittingMsg] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const handleDeleteStudentMessage = async (id: string) => {
    setDeletedMsgIds(prev => [...prev, String(id)]);
    setHistoryMessages(prev => prev.filter(m => String(m._id) !== String(id)));
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await fetch(`${apiUrl}/api/counsellor/messages/${id}`, { method: "DELETE" });
    } catch (err) {}
  };

  const handleDeleteStudentBooking = async (id: string) => {
    setDeletedBookIds(prev => [...prev, String(id)]);
    setHistoryBookings(prev => prev.filter(b => String(b._id) !== String(id)));
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await fetch(`${apiUrl}/api/counsellor/bookings/${id}`, { method: "DELETE" });
    } catch (err) {}
  };

  const { data: session } = useSession();
  const activeUser = session?.user as any;
  const currentStudentName = activeUser?.name || activeUser?.studentName || "Rathna";
  const currentStudentId = activeUser?.id || activeUser?.studentId || "95acafcf-990f-49aa-8c21-68a164a57a2e";
  const currentClass = activeUser?.class || "12";
  const currentSection = activeUser?.section || "B";

  const handleSubmitMessage = async () => {
    setIsSubmittingMsg(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const noteContent = feedbackText.trim()
        ? feedbackText.trim()
        : `Student requested support on topic: ${selectedTopic || "Personal & Emotional"}`;

      try {
        await fetch(`${apiUrl}/api/counsellor/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: currentStudentId,
            studentName: currentStudentName,
            className: currentClass,
            section: currentSection,
            mood: selectedMood || "Okay",
            topic: selectedTopic || "Personal & Emotional",
            feedbackText: noteContent,
            isAnonymous
          })
        });
      } catch (e) {}

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    } finally {
      setIsSubmittingMsg(false);
    }
  };

  const handleSubmitBooking = async () => {
    if (!selectedSlot) return;
    setIsSubmittingBooking(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const slotObj = sessionSlots.find(s => s._id === selectedSlot || s.id === selectedSlot);
      const slotText = slotObj ? `${slotObj.dayEn || "Monday"} · ${slotObj.time || "10:00 AM"}` : "Monday · 10:00 AM";

      try {
        await fetch(`${apiUrl}/api/counsellor/booking`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: currentStudentId,
            studentName: currentStudentName,
            className: currentClass,
            section: currentSection,
            slotId: selectedSlot,
            slot: slotText,
            topic: "General 1-on-1 Session",
            isAnonymous: false
          })
        });
      } catch (e) {}

      setSessionSubmitted(true);
      setSessionSlots(prev => prev.map(s => (s._id === selectedSlot || s.id === selectedSlot) ? { ...s, isBooked: true } : s));
    } catch (err) {
      console.error(err);
      setSessionSubmitted(true);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <PortalLayout
      title={L.pageTitle}
      subtitle={L.pageSub}
      avatarLetter="S"
      avatarColor="#6366f1"
      themeClass="theme-student"
      accentColor="#6366f1"
    >
      {/* ── Hero Banner (Clean, Simple & Compact) ── */}
      <div
        style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6d28d9 100%)", color: "#ffffff" }}
        className="hero-band banner-text-white relative rounded-2xl sm:rounded-3xl overflow-hidden mb-6 shadow-xl p-5 sm:p-6 text-white border border-indigo-400/30"
      >
        <div className="flex items-center justify-between gap-4 mb-3">
          <span
            style={{ color: "#ffffff" }}
            className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 border border-white/30 font-black text-[11px] uppercase tracking-widest shadow-sm backdrop-blur-md"
          >
            {L.supportCenter}
          </span>

          {/* Embedded Language Toggle */}
          <button
            onClick={() => setLang(lang === "en" ? "ta" : "en")}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-xs font-bold text-white shadow-sm backdrop-blur-md transition-all cursor-pointer"
          >
            <Globe size={14} className="!text-white" />
            <span style={{ color: "#ffffff" }}>{lang === "en" ? "தமிழ்" : "English"}</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-lg backdrop-blur-md">
            <User size={28} className="!text-white" />
          </div>
          <div className="flex-1">
            <h2 style={{ color: "#ffffff" }} className="text-xl sm:text-2xl font-black leading-tight mb-1 text-white">
              {L.heroTitle}
            </h2>
            <p style={{ color: "#ffffff" }} className="text-xs sm:text-sm max-w-2xl leading-relaxed opacity-95 font-medium text-white">
              {L.heroDesc}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-white/15">
          {[
            { icon: Lock, label: L.confidential },
            { icon: Eye, label: L.monitored },
            { icon: Phone, label: L.helplineBadge },
            { icon: Shield, label: L.pocsoBadge },
          ].map((chip, idx) => {
            const CIcon = chip.icon;
            return (
              <div key={idx} className="flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-[11px] font-semibold backdrop-blur-sm text-white">
                <CIcon size={12} className="!text-white" />
                <span style={{ color: "#ffffff" }}>{chip.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="relative flex gap-1 mb-8 bg-slate-100/80 dark:bg-slate-900/60 rounded-2xl p-1 backdrop-blur-sm border border-slate-200 dark:border-slate-800">
        {[
          { key: "mood", icon: Smile, label: L.tabMood },
          { key: "session", icon: Calendar, label: L.tabSession },
          { key: "history", icon: Clock, label: lang === 'ta' ? "என் வரலாறு" : "My History" },
          { key: "helpline", icon: Phone, label: L.tabHelpline },
        ].map((tab) => {
          const TIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "mood" | "session" | "helpline" | "history")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 ${activeTab === tab.key
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md font-black"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
            >
              <TIcon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ══════════════════════════════════════════════════
          TAB 1: Mood & Feedback
      ══════════════════════════════════════════════════ */}
      {activeTab === "mood" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left col (2/3) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Mood Selector */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <Smile size={18} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-base font-black text-black dark:text-white">{L.howFeeling}</h2>
              </div>
              <p className="text-xs text-slate-500 mb-6 ml-12">{L.howFeelingSub}</p>

              {currentMoodData && (
                <div className="mb-4 p-3 rounded-2xl text-center text-xs font-semibold text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${currentMoodData.gradFrom}, ${currentMoodData.gradTo})` }}>
                  {L.youSelected} <strong>{currentMoodData.label[lang]}</strong> {currentMoodData.emoji}
                </div>
              )}

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {moods.map((m) => (
                  <button
                    key={m.label.en}
                    onClick={() => setSelectedMood(m.label.en)}
                    className={`group relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${selectedMood === m.label.en
                      ? `${m.border} ${m.bg} scale-105 shadow-lg ring-2 ${m.ring} ring-offset-2`
                      : "border-slate-200 dark:border-slate-700 hover:scale-105 hover:shadow-md"
                      }`}
                  >
                    <span className="text-3xl leading-none">{m.emoji}</span>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{m.label[lang]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Cards */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                  <Edit3 size={18} className="text-violet-600 dark:text-violet-400" />
                </div>
                <h2 className="text-base font-black text-black dark:text-white">{L.whatToTalk}</h2>
              </div>
              <p className="text-xs text-slate-500 mb-6 ml-12">{L.whatToTalkSub}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topics.map((t) => {
                  const TopicIcon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTopic(t.id)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-md ${selectedTopic === t.id ? t.active : `border-slate-200 dark:border-slate-700 hover:${t.border}`
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-xl ${selectedTopic === t.id ? t.bg : "bg-slate-100 dark:bg-slate-800"} flex items-center justify-center shrink-0 transition-colors`}>
                        <TopicIcon size={18} className={`${selectedTopic === t.id ? t.color : "text-slate-500"}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-black dark:text-white leading-tight">{t.label[lang]}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{t.desc[lang]}</div>
                      </div>
                      {selectedTopic === t.id && (
                        <CheckCircle size={18} className="text-green-500 shrink-0 ml-auto" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Feedback Form */}
            {!submitted ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <PenTool size={18} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-base font-black text-black dark:text-white">{L.shareThoughts}</h2>
                </div>
                <p className="text-xs text-slate-500 mb-5 ml-12">{L.shareThoughtsSub}</p>

                <div className="relative">
                  <textarea
                    value={feedbackText}
                    onChange={(e) => { setFeedbackText(e.target.value); setCharCount(e.target.value.length); }}
                    placeholder={L.placeholderTextArea}
                    rows={5}
                    maxLength={1000}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-black dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/40 resize-none transition-all"
                  />
                  <span className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-mono">{charCount}/1000</span>
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/40 rounded-full">
                        <User size={16} className="text-indigo-500" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-black dark:text-white">
                          {isAnonymous ? L.submitAnonymous : L.submitNamed}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {isAnonymous ? L.submitAnonymousSub : L.submitNamedSub}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      className={`w-12 h-6 rounded-full transition-all duration-300 relative ${isAnonymous ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-700"}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${isAnonymous ? "left-7" : "left-1"}`} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSubmitMessage}
                  disabled={!feedbackText.trim() || isSubmittingMsg}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-black rounded-2xl shadow-lg hover:shadow-teal-400/30 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <MessageSquare size={16} />
                  {isSubmittingMsg ? "Sending..." : L.sendToCounsellor}
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/10 rounded-3xl p-8 border border-emerald-200 dark:border-emerald-800 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-lg font-black text-emerald-700 dark:text-emerald-400 mb-2">{L.messageSent}</h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-500 max-w-sm mx-auto">
                  {L.messageSentDesc}
                </p>
                <button onClick={() => { setSubmitted(false); setFeedbackText(""); setCharCount(0); }}
                  className="mt-5 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mx-auto hover:underline">
                  <RefreshCw size={14} /> {L.sendAnother}
                </button>
              </div>
            )}
          </div>

          {/* Right sidebar (1/3) */}
          <div className="space-y-5">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Sun size={20} className="text-amber-500" />
                <h2 className="text-sm font-black text-black dark:text-white">{L.counsellorTips}</h2>
              </div>
              <p className="text-[10px] text-slate-500 mb-4">
                {selectedTopic ? `💡 ${L.tipsFor} ${topics.find(t => t.id === selectedTopic)?.label[lang]}` : L.generalTips}
              </p>
              <div className="space-y-3">
                {activeTips.map((item, i) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={i} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0 mt-0.5">
                        <ItemIcon size={12} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">{item.tip[lang]}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-3xl p-5 border-2 border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/10">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={20} className="text-red-500" />
                <h3 className="text-sm font-black text-red-700 dark:text-red-400">{L.needHelp}</h3>
              </div>
              <div className="space-y-2.5">
                {[
                  { num: "1098", label: "Child Helpline", icon: Phone, color: "text-red-600 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
                  { num: "181", label: "Women Helpline", icon: Shield, color: "text-pink-600 dark:text-pink-400", border: "border-pink-200 dark:border-pink-800" },
                  { num: "100", label: "Police Emergency", icon: ShieldCheck, color: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
                ].map((h) => {
                  const HIcon = h.icon;
                  return (
                    <a key={h.num} href={`tel:${h.num}`} className={`flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border ${h.border} hover:scale-[1.02] transition-all group`}>
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <HIcon size={16} className={h.color} />
                      </div>
                      <div>
                        <div className={`text-xs font-black ${h.color}`}>{h.num}</div>
                        <div className="text-[10px] text-slate-400">{h.label}</div>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>

            <div className="rounded-3xl p-5 border border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-black text-amber-700 dark:text-amber-400">{L.haveComplaint}</h3>
              </div>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/70 mb-4 leading-relaxed">
                {L.haveComplaintDesc}
              </p>
              <Link href="/student/report" className="flex items-center justify-center gap-2 w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-rose-400/30 active:scale-95">
                <Edit3 size={14} />
                {L.fileReport}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TAB 2: Book a Session
      ══════════════════════════════════════════════════ */}
      {activeTab === "session" && (
        <div className="max-w-2xl mx-auto">
          {!sessionSubmitted ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <Calendar size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-lg font-black text-black dark:text-white">{L.bookSession}</h2>
              </div>
              <p className="text-xs text-slate-500 mb-8 ml-13 leading-relaxed">
                {L.bookSessionSub}
              </p>

              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Clock size={14} /> {L.availableSlots}
              </h3>
              {isLoadingSlots ? (
                <div className="flex justify-center items-center py-8">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                  {sessionSlots.map((slot, index) => {
                    const key = slot._id || slot.id || `slot-${index}`;
                    const isAvailable = !slot.isBooked;
                    return (
                      <button
                        key={key}
                        onClick={() => isAvailable && setSelectedSlot(key)}
                        disabled={!isAvailable}
                        className={`relative p-4 rounded-2xl border-2 text-center transition-all duration-200 ${!isAvailable
                          ? "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 opacity-50 cursor-not-allowed"
                          : selectedSlot === key
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-md ring-2 ring-indigo-200 dark:ring-indigo-800"
                            : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                      >
                        {!isAvailable ? (
                          <span className="absolute top-2 right-2 text-[9px] font-bold text-slate-400">{L.booked}</span>
                        ) : (
                          <span className="absolute top-2 right-2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Clock size={10} /> 45m slot
                          </span>
                        )}
                        <div className={`text-[10px] font-black uppercase tracking-wide mb-1 ${selectedSlot === key ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500"}`}>
                          {lang === 'en' ? slot.dayEn : slot.dayTa}
                        </div>
                        <div className={`text-sm font-black ${selectedSlot === key ? "text-indigo-700 dark:text-indigo-300" : "text-black dark:text-white"}`}>{slot.time}</div>
                        {selectedSlot === key && <Check size={12} className="text-indigo-500 mt-1 mx-auto" />}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                  <MessageCircle size={14} className="mr-1" />
                  {L.describeOptional} <span className="text-slate-400 font-normal ml-1">{L.optional}</span>
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-black dark:text-white focus:outline-none focus:border-indigo-400 focus:ring-2 transition-all"
                />
              </div>

              <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-indigo-500 rounded" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Lock size={12} /> {L.keepConfidential}
                  </span>
                </label>
                <button
                  onClick={handleSubmitBooking}
                  disabled={!selectedSlot || isSubmittingBooking}
                  className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white text-xs font-black rounded-xl shadow-lg hover:shadow-teal-400/30 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Check size={14} />
                  {isSubmittingBooking ? "Booking..." : L.confirmBooking}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 rounded-3xl p-10 border border-emerald-200 dark:border-emerald-800 text-center shadow-sm">
              <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-5">
                <CalendarCheck size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mb-2">{L.sessionConfirmed}</h3>
              <p className="text-sm text-emerald-600 dark:text-emerald-500 mb-3">{L.sessionBookedFor}</p>
              <div className="inline-block bg-white dark:bg-slate-900 border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl px-6 py-3 mb-5">
                <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                  {sessionSlots.find(s => s._id === selectedSlot || s.id === selectedSlot)
                    ? `${sessionSlots.find(s => s._id === selectedSlot || s.id === selectedSlot)?.dayEn || "Wednesday"} · ${sessionSlots.find(s => s._id === selectedSlot || s.id === selectedSlot)?.time || "10:00 AM"}`
                    : "Wednesday · 10:00 AM - 10:45 AM"}
                </div>
              </div>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                {L.sessionInstructions}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TAB 3: Helplines
      ══════════════════════════════════════════════════ */}
      {activeTab === "helpline" && (
        <div className="max-w-3xl mx-auto space-y-6">

          <div className="rounded-3xl overflow-hidden shadow-2xl border-2 border-red-200 dark:border-red-800">
            <div className="bg-red-500 bg-gradient-to-r from-red-500 via-rose-500 to-pink-600 p-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-white/20 border-2 border-white/30 rounded-2xl flex items-center justify-center shrink-0 shadow-xl">
                  <Phone size={40} className="text-white" />
                </div>
                <div className="text-white">
                  <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">{L.tnGov}</div>
                  <div className="text-5xl font-black leading-none mb-1 text-white">1098</div>
                  <div className="text-sm font-bold opacity-90">{L.tnHelpline}</div>
                  <div className="text-xs font-semibold mt-0.5 opacity-80">{L.tnHelplineSub}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🇬🇧</span>
                  <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">English Instructions</span>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: Phone, text: <><strong>Dial 1098</strong> from any phone — it is free of cost, 24 hours a day, 7 days a week.</> },
                    { icon: Shield, text: <>For <strong>children and students</strong> who face abuse, danger, neglect, or any difficult situation.</> },
                    { icon: UserX, text: <><strong>You can remain anonymous.</strong> You do not need to give your name or any personal details.</> },
                    { icon: HeartPulse, text: <><strong>Trained counsellors</strong> will listen without judgment and arrange immediate help.</> },
                    { icon: AlertTriangle, text: <>Use it for: <strong>physical abuse, sexual abuse, child labour, bullying, missing child</strong>.</> },
                    { icon: Building, text: <>Operated by: <strong>Tamil Nadu Dept. of Social Defence</strong>, Ministry of Women & Child Development.</> },
                  ].map((item, i) => {
                    const HIcon = item.icon;
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0 mt-0.5">
                          <HIcon size={12} className="text-red-500" />
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{item.text}</p>
                      </div>
                    )
                  })}
                </div>
                <a href="tel:1098" className="mt-5 flex items-center justify-center gap-2 w-full py-3.5 bg-red-500 hover:bg-red-600 text-white text-xs font-black rounded-2xl transition-all shadow-lg hover:shadow-red-500/30 active:scale-95">
                  <Phone size={14} /> Call 1098 Now — It&apos;s Free
                </a>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🇮🇳</span>
                  <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">தமிழ் வழிமுறைகள்</span>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: Phone, text: <><strong>1098 என்று அழைக்கவும்</strong> — இது இலவசமானது, 24 மணி நேரமும், 7 நாட்களும் கிடைக்கும்.</> },
                    { icon: Shield, text: <>குழந்தைகளுக்கு உதவ: <strong>துஷ்பிரயோகம், ஆபத்து</strong>, அல்லது கஷ்டமான சூழல்களில் பயன்படுத்தவும்.</> },
                    { icon: UserX, text: <><strong>உங்கள் பெயரை சொல்ல தேவையில்லை</strong> — அனாமதேயமாக பேசலாம்.</> },
                    { icon: HeartPulse, text: <>பயிற்சி பெற்ற ஆலோசகர்கள் உங்களுக்குக் கேட்டு <strong>உடனடி உதவி</strong> ஏற்பாடு செய்வார்கள்.</> },
                    { icon: AlertTriangle, text: <>பயன்படுத்துக: <strong>உடல்/பாலியல் துஷ்பிரயோகம், குழந்தை தொழிலாளர்</strong>, காணாமல் போன குழந்தை.</> },
                    { icon: Building, text: <><strong>தமிழ்நாடு சமூக பாதுகாப்பு துறை</strong>, மகளிர் மற்றும் குழந்தை மேம்பாட்டு அமைச்சகம்.</> },
                  ].map((item, i) => {
                    const HIcon = item.icon;
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0 mt-0.5">
                          <HIcon size={12} className="text-red-500" />
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{item.text}</p>
                      </div>
                    )
                  })}
                </div>
                <a href="tel:1098" className="mt-5 flex items-center justify-center gap-2 w-full py-3.5 bg-red-500 hover:bg-red-600 text-white text-xs font-black rounded-2xl transition-all shadow-lg hover:shadow-red-500/30 active:scale-95">
                  <Phone size={14} /> 1098 — இப்போதே அழைக்கவும்
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <Phone size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-base font-black text-black dark:text-white">{L.otherHelplines}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { number: "181", name: { en: "Women Helpline", ta: "பெண்கள் உதவி எண்" }, icon: ShieldCheck, gradient: "from-pink-500 to-rose-500" },
                { number: "100", name: { en: "Police Emergency", ta: "காவல்துறை அவசரம்" }, icon: Shield, gradient: "from-blue-500 to-indigo-500" },
                { number: "104", name: { en: "Health Helpline", ta: "சுகாதார உதவி எண்" }, icon: Heart, gradient: "from-red-500 to-pink-500" },
                { number: "1800-599-0019", name: { en: "iCall (Free)", ta: "iCall (இலவசம்)" }, icon: MessageCircle, gradient: "from-violet-500 to-purple-500" },
              ].map((h, idx) => {
                const HIcon = h.icon;
                return (
                  <a key={idx} href={`tel:${h.number}`}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:shadow-md hover:scale-[1.01] transition-all group bg-white dark:bg-slate-950">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${h.gradient} flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                      <HIcon size={20} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black text-black dark:text-white">{h.number}</div>
                      <div className="text-xs font-bold text-slate-600 dark:text-slate-400">{h.name[lang]}</div>
                    </div>
                    <ArrowRight size={12} className="text-slate-300 ml-auto shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                )
              })}
            </div>
          </div>

          <div className="rounded-3xl p-6 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/10 border border-pink-200 dark:border-pink-800">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center shrink-0">
                <Scale size={24} className="text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-pink-700 dark:text-pink-400 mb-2">{L.pocsoTitle}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                  {L.pocsoDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TAB 4: My History & Submissions
      ══════════════════════════════════════════════════ */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {/* Submitted Mood Notes History */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <MessageSquare size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    {lang === 'ta' ? 'எனது சமர்ப்பிக்கப்பட்ட குறிப்புகள் வரலாறு' : 'My Submitted Notes & Mood History'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {lang === 'ta' ? 'உங்கள் ஆலோசகருக்கு அனுப்பப்பட்ட அனைத்து குறிப்புகள்' : 'All messages & feedback sent to your school personal counsellor'}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-black rounded-full">
                {historyMessages.length} {lang === 'ta' ? 'குறிப்புகள்' : 'Entries'}
              </span>
            </div>

            {historyMessages.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Smile size={32} className="text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-bold">{lang === 'ta' ? 'முந்தைய வரலாறு எதுவுமில்லை' : 'No submission history found'}</p>
              </div>
            ) : (
              <div>
                <div className="space-y-3">
                  {paginatedHistoryMessages.map((m, idx) => {
                    let cleanNotes = m.notes || "";
                    let parsedTopic = null;
                    let isAnon = false;
                    
                    const topicMatch = cleanNotes.match(/\[Topic:\s*(.*?)\]/i);
                    if (topicMatch) {
                      parsedTopic = topicMatch[1];
                      cleanNotes = cleanNotes.replace(topicMatch[0], "");
                    }
                    
                    const anonMatch = cleanNotes.match(/\[Anonymous:\s*(true|false)\]/i);
                    if (anonMatch) {
                      isAnon = anonMatch[1].toLowerCase() === "true";
                      cleanNotes = cleanNotes.replace(anonMatch[0], "");
                    }
                    
                    cleanNotes = cleanNotes.trim();

                    return (
                      <div key={m._id || idx} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 shadow-sm">
                              {m.mood || "Okay"}
                            </span>
                            <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border shadow-sm ${
                              m.stressScore >= 7
                                ? "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30"
                                : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30"
                            }`}>
                              {m.stressScore >= 7 ? `High Stress (Level ${m.stressScore})` : `Level ${m.stressScore}`}
                            </span>
                            {parsedTopic && (
                              <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border shadow-sm bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-300 dark:border-violet-500/30">
                                Topic: {parsedTopic}
                              </span>
                            )}
                            {isAnon && (
                              <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border shadow-sm bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-700 flex items-center gap-1">
                                <Lock size={10} /> Anonymous
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 mt-2 shadow-inner">
                            {cleanNotes || "No detailed notes provided."}
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-2 font-semibold">
                            Submitted: {new Date(m.date || Date.now()).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-start">
                          <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase border shadow-sm ${
                            m.status === "RESOLVED"
                              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                              : m.status === "PENDING"
                              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800"
                              : "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-800"
                          }`}>
                            {m.status || "DELIVERED TO COUNSELLOR"}
                          </span>
                          <button
                            onClick={() => handleDeleteStudentMessage(m._id)}
                            title="Delete Note"
                            className="p-1.5 bg-rose-100 dark:bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 rounded-lg border border-rose-200 dark:border-rose-500/30 transition-all shadow-sm"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Pagination Controls for History Messages ── */}
                {totalHistoryMsgPages > 1 && (
                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500">
                      Showing {(historyMsgPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(historyMsgPage * ITEMS_PER_PAGE, historyMessages.length)} of {historyMessages.length} notes
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setHistoryMsgPage(p => Math.max(1, p - 1))}
                        disabled={historyMsgPage === 1}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-xs font-bold px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        {historyMsgPage} / {totalHistoryMsgPages}
                      </span>
                      <button
                        onClick={() => setHistoryMsgPage(p => Math.min(totalHistoryMsgPages, p + 1))}
                        disabled={historyMsgPage === totalHistoryMsgPages}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Booked Sessions History */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                  <Calendar size={20} className="text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    {lang === 'ta' ? 'எனது முன்பதிவு செய்யப்பட்ட அமர்வுகள்' : 'My Booked 1-on-1 Sessions Register'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {lang === 'ta' ? 'பள்ளி ஆலோசகருடனான உங்கள் சந்திப்பு நேரங்கள்' : 'Your reserved appointment slots with the school personal counsellor'}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-xs font-black rounded-full">
                {historyBookings.length} {lang === 'ta' ? 'அமர்வுகள்' : 'Sessions'}
              </span>
            </div>

            {historyBookings.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Calendar size={32} className="text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-bold">{lang === 'ta' ? 'முன்பதிவு எதுவுமில்லை' : 'No booked sessions found'}</p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                        <th className="pb-3 px-3">Time Slot</th>
                        <th className="pb-3 px-3">Topic / Purpose</th>
                        <th className="pb-3 px-3">Status</th>
                        <th className="pb-3 px-3">Date Reserved</th>
                        <th className="pb-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {paginatedHistoryBookings.map((b, idx) => (
                        <tr key={b._id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="py-3.5 px-3 font-black text-indigo-600 dark:text-indigo-400">{b.slot}</td>
                          <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">{b.topic || "General 1-on-1 Session"}</td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase border ${
                              b.status === "COMPLETED"
                                ? "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30"
                                : b.status === "IN-PROGRESS"
                                ? "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30"
                                : b.status === "CANCELLED"
                                ? "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30"
                                : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30"
                            }`}>
                              {b.status || "CONFIRMED"}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-slate-500">{new Date(b.createdAt || Date.now()).toLocaleDateString()}</td>
                          <td className="py-3.5 px-3 text-right">
                            <button
                              onClick={() => handleDeleteStudentBooking(b._id)}
                              title="Delete Session Booking"
                              className="p-1.5 bg-rose-100 dark:bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 rounded-lg border border-rose-200 dark:border-rose-500/30 transition-all shadow-sm"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ── Pagination Controls for History Bookings ── */}
                {totalHistoryBookPages > 1 && (
                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500">
                      Showing {(historyBookPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(historyBookPage * ITEMS_PER_PAGE, historyBookings.length)} of {historyBookings.length} sessions
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setHistoryBookPage(p => Math.max(1, p - 1))}
                        disabled={historyBookPage === 1}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-xs font-bold px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg">
                        {historyBookPage} / {totalHistoryBookPages}
                      </span>
                      <button
                        onClick={() => setHistoryBookPage(p => Math.min(totalHistoryBookPages, p + 1))}
                        disabled={historyBookPage === totalHistoryBookPages}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
