"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import {
  BookOpen,
  Clock,
  Send,
  Inbox,
  ChevronDown,
  ChevronUp,
  Brain,
  Sparkles,
  Heart,
  Compass,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const uiTranslations: Record<string, any> = {
  en: {
    personalGuide: "Personal Guide",
    subtitle: "Tasks & Support Hub. Learn, breathe, and reach your goals.",
    awaitingReply: "Awaiting Reply",
    replied: "Replied",
    feedbackReceived: "Feedback Received",
    taskInbox: "Task Inbox from Teacher",
    noTasksTitle: "No tasks yet!",
    noTasksDesc: "Your teacher has not sent any tasks yet. Check back after your mentor assigns you a task.",
    due: "Due:",
    teacherAsks: "Your Teacher Asks:",
    yourAnswer: "Your Answer",
    submitted: "Submitted:",
    teacherFeedback: "Teacher Feedback",
    teacherReviewing: "Your teacher is reviewing your response. Feedback coming soon!",
    writeResponse: "Write Your Response",
    placeholder: "Type your answer here. Be honest and thoughtful. Your teacher wants to help you!",
    submitting: "Submitting...",
    submitAnswer: "Submit Answer to Teacher",
    previous: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
    mentorsHub: "Mentor's Support Hub",
    yogaPoseTitle: "🧘 Mind Yoga Pose",
    howToDoIt: "How to do it:",
    goal: "🎯 Goal:",
    suggestedMaterials: "Suggested Study Materials",
    prepTips: "Preparation Tips",
    studyFocus: "💡 Study Focus:",
    targetingImprovement: "Targeting improvement from",
    score: "score",
    taskTypes: {
      reflection: "Reflection",
      goal: "Goal Check-in",
      question: "Question",
      custom: "Custom Task",
    },
    status: {
      pending: "Pending Reply",
      answered: "Answer Submitted",
      reviewed: "Feedback Received",
    }
  },
  ta: {
    personalGuide: "தனிப்பட்ட வழிகாட்டி",
    subtitle: "பணிகள் மற்றும் ஆதரவு மையம். கற்றுக்கொள்ளுங்கள், சுவாசியுங்கள், உங்கள் இலக்குகளை அடையுங்கள்.",
    awaitingReply: "காத்திருக்கிறது",
    replied: "பதிலளிக்கப்பட்டது",
    feedbackReceived: "பின்னூட்டம்",
    taskInbox: "ஆசிரியரிடமிருந்து பணி இன்பாக்ஸ்",
    noTasksTitle: "இன்னும் பணிகள் இல்லை!",
    noTasksDesc: "உங்கள் ஆசிரியர் இன்னும் எந்த பணிகளையும் அனுப்பவில்லை. வழிகாட்டி உங்களுக்கு ஒரு பணியை ஒதுக்கிய பிறகு மீண்டும் பார்க்கவும்.",
    due: "கெடு:",
    teacherAsks: "உங்கள் ஆசிரியர் கேட்கிறார்:",
    yourAnswer: "உங்கள் பதில்",
    submitted: "சமர்ப்பிக்கப்பட்டது:",
    teacherFeedback: "ஆசிரியர் பின்னூட்டம்",
    teacherReviewing: "ஆசிரியர் உங்கள் பதிலை மதிப்பாய்வு செய்கிறார். பின்னூட்டம் விரைவில் வரும்!",
    writeResponse: "உங்கள் பதிலை எழுதுங்கள்",
    placeholder: "உங்கள் பதிலை இங்கே தட்டச்சு செய்யவும். நேர்மையாகவும் சிந்தனையுடனும் இருங்கள். உங்கள் ஆசிரியர் உங்களுக்கு உதவ விரும்புகிறார்!",
    submitting: "சமர்ப்பிக்கப்படுகிறது...",
    submitAnswer: "ஆசிரியருக்கு பதிலை சமர்ப்பிக்கவும்",
    previous: "முந்தைய",
    next: "அடுத்த",
    page: "பக்கம்",
    of: "இல்",
    mentorsHub: "வழிகாட்டியின் ஆதரவு மையம்",
    yogaPoseTitle: "🧘 மன யோகாசனம்",
    howToDoIt: "இதை எப்படி செய்வது:",
    goal: "🎯 இலக்கு:",
    suggestedMaterials: "பரிந்துரைக்கப்பட்ட படிப்பு பொருட்கள்",
    prepTips: "தயாரிப்பு குறிப்புகள்",
    studyFocus: "💡 படிப்பு கவனம்:",
    targetingImprovement: "முன்னேற்றத்தை இலக்காகக் கொண்ட மதிப்பெண்",
    score: "",
    taskTypes: {
      reflection: "பிரதிபலிப்பு",
      goal: "இலக்கு சரிபார்ப்பு",
      question: "கேள்வி",
      custom: "தனிப்பயன் பணி",
    },
    status: {
      pending: "பதிலுக்காக காத்திருக்கிறது",
      answered: "பதில் சமர்ப்பிக்கப்பட்டது",
      reviewed: "பின்னூட்டம் பெறப்பட்டது",
    }
  }
};

const getStatusConfig = (lang: string) => ({
  pending: {
    label: uiTranslations[lang].status.pending,
    statusKey: "pending",
    border: "border-amber-200 dark:border-amber-800",
  },
  answered: {
    label: uiTranslations[lang].status.answered,
    statusKey: "answered",
    border: "border-blue-200 dark:border-blue-800",
  },
  reviewed: {
    label: uiTranslations[lang].status.reviewed,
    statusKey: "reviewed",
    border: "border-emerald-200 dark:border-emerald-800",
  },
});

const getYogaPoses = (lang: string) => [
  {
    name: lang === "ta" ? "சுகாசனம்" : "Lotus Pose",
    localName: "Sukhasana (சுகாசனம்)",
    image: "/images/yoga/lotus_pose.jpg",
    benefits: lang === "ta" ? "மூளையை அமைதிப்படுத்துகிறது, முதுகெலும்பை பலப்படுத்துகிறது, தோரணையை மேம்படுத்துகிறது மற்றும் படிப்பு அமர்வுகளுக்கு கவனத்தை சீராக வைத்திருக்கிறது." : "Calms the brain, strengthens the back, improves posture and keeps focus steady for study sessions.",
    steps: lang === "ta" ? [
      "வசதியாக கால்களை மடக்கி நிமிர்ந்து உட்காரவும்.",
      "உள்ளங்கைகள் மேல்நோக்கி இருக்கும்படி உங்கள் கைகளை முழங்கால்களில் வைக்கவும்.",
      "உங்கள் கண்களை மூடி, ஆழமாக சுவாசிக்கவும், காற்று உள்ளே வருவதையும் வெளியேறுவதையும் கவனிக்கவும்."
    ] : [
      "Sit upright with your legs crossed comfortably.",
      "Rest your hands on your knees with palms facing up.",
      "Close your eyes, breathe deeply, and focus on the air entering and leaving."
    ],
    duration: lang === "ta" ? "5-10 நிமிடங்கள்" : "5-10 minutes"
  },
  {
    name: lang === "ta" ? "விருட்சாசனம்" : "Tree Pose",
    localName: "Vrikshasana (விருட்சாசனம்)",
    image: "/images/yoga/tree_pose.jpg",
    benefits: lang === "ta" ? "சமநிலை, உடல் நிலைத்தன்மை மற்றும் செறிவை மேம்படுத்துகிறது. கடினமான பாடங்களுக்கு முன் செய்ய ஏற்றது." : "Improves balance, physical stability, and concentration. Perfect to do before tough subjects.",
    steps: lang === "ta" ? [
      "கைகளை பக்கவாட்டில் வைத்து இரு கால்களிலும் நேராக நிற்கவும்.",
      "உங்கள் வலது காலைத் தூக்கி உங்கள் இடது உள் தொடையின் மீது வைக்கவும்.",
      "உங்கள் உள்ளங்கைகளை உங்கள் மார்பின் முன் (நமஸ்தே தோரணை) இணைக்கவும் அல்லது அவற்றை மேலே உயர்த்தவும்.",
      "சமநிலைப்படுத்த உங்களுக்கு முன்னால் உள்ள ஒரு புள்ளியில் கவனம் செலுத்துங்கள்."
    ] : [
      "Stand straight on both feet with arms by your side.",
      "Lift your right foot and place it on your left inner thigh.",
      "Join your palms in front of your chest (Namaste pose) or raise them up.",
      "Focus on a single static point in front of you to balance."
    ],
    duration: lang === "ta" ? "ஒவ்வொரு காலுக்கும் 1-2 நிமிடங்கள்" : "1-2 minutes per leg"
  },
  {
    name: lang === "ta" ? "பாலாசனம்" : "Child's Pose",
    localName: "Balasana (பாலாசனம்)",
    image: "/images/yoga/child_pose.jpg",
    benefits: lang === "ta" ? "நரம்பு மண்டலத்தை தளர்த்துகிறது, மன அழுத்தம்/சோர்வை வெளியிடுகிறது, மற்றும் உங்கள் கழுத்து/முதுகெலும்பை நீட்டுகிறது." : "Relaxes the nervous system, releases stress/fatigue, and stretches your neck/back.",
    steps: lang === "ta" ? [
      "தரையில் மண்டியிட்டு, உங்கள் குதிகால் மீது உட்கார்ந்து, முன்னோக்கி குனியவும்.",
      "உங்கள் நெற்றியை உங்களுக்கு முன்னால் தரையில் மெதுவாக வைக்கவும்.",
      "உள்ளங்கைகள் கீழ்நோக்கி இருக்கும்படி உங்கள் கைகளை முன்னோக்கி நீட்டவும்.",
      "மெதுவாக சுவாசிக்கவும், உங்கள் முழு உடலையும் தளர்த்தவும்."
    ] : [
      "Kneel on the floor, sit back on your heels, and bend forward.",
      "Rest your forehead gently on the floor in front of you.",
      "Extend your arms forward with palms facing down.",
      "Breathe slowly and let your entire body relax."
    ],
    duration: lang === "ta" ? "3-5 நிமிடங்கள்" : "3-5 minutes"
  }
];

const getGoalResources = (lang: string): Record<string, { title: string; links: { name: string; url: string }[]; tips: string[] }> => ({
  "NEET - Medical College": {
    title: lang === "ta" ? "NEET மருத்துவ தயாரிப்பு" : "NEET Medical Preparation",
    links: [
      { name: "NCERT Biology Chapter-wise MCQ practice", url: "https://mocktest.ncert.org.in/" },
      { name: "NTA NEET Official Practice Tests", url: "https://www.nta.ac.in/Quiz" },
      { name: "Tamil Nadu Government NEET Free e-Box Portal", url: "https://tnschools.gov.in" }
    ],
    tips: lang === "ta" ? [
      "NCERT உயிரியல் வரைபடங்கள் மற்றும் லேபிளிங்கில் அதிக கவனம் செலுத்துங்கள்.",
      "வேகத்தை மேம்படுத்த தினமும் குறைந்தது 45 இயற்பியல் மற்றும் வேதியியல் எண்களைத் தீர்க்கவும்.",
      "தொடர்ந்து வரும் கேள்விப் போக்குகளுக்கு முந்தைய 10 ஆண்டுகளின் தாள்களை பகுப்பாய்வு செய்யுங்கள்."
    ] : [
      "Concentrate heavily on NCERT Biology diagrams and labeling.",
      "Solve at least 45 Physics and Chemistry numericals daily to improve speed.",
      "Analyze previous 10 years papers for repeating question trends."
    ]
  },
  "JEE - Engineering": {
    title: lang === "ta" ? "JEE பொறியியல் தயாரிப்பு" : "JEE Engineering Preparation",
    links: [
      { name: "IIT JEE Main & Advanced mock prep", url: "https://mocktest.ncert.org.in/" },
      { name: "Tamil Nadu Board Previous Year Question Papers", url: "https://www.dge.tn.gov.in" },
      { name: "NTA JEE Practice portal", url: "https://www.nta.ac.in/Quiz" }
    ],
    tips: lang === "ta" ? [
      "கால்குலஸ் மற்றும் ஆய வடிவியலில் கருத்து தெளிவில் கவனம் செலுத்துங்கள்.",
      "இயற்பியல் விதிகள் மற்றும் வேதியியல் எதிர்வினைகளுக்கு ஒரு சூத்திர சுருக்கத் தாளை உருவாக்கவும்.",
      "ஒவ்வொரு சனிக்கிழமையும் பழைய கருத்துகளைத் திருத்துவதற்கு இடைவெளி விட்டு திரும்பச் செய்யும் முறையைப் பயன்படுத்தவும்."
    ] : [
      "Focus on concept clarity in Calculus and Coordinate Geometry.",
      "Make a formula summary sheet for Physics laws and Chemistry reactions.",
      "Use spaced repetition to revise old concepts every Saturday."
    ]
  },
  "UPSC / Civil Services": {
    title: lang === "ta" ? "சிவில் சர்வீசஸ் / UPSC தயாரிப்பு" : "Civil Services / UPSC Preparation",
    links: [
      { name: "ClearIAS Free UPSC Study Resources", url: "https://www.clearias.com/" },
      { name: "Tamil Nadu Board Previous Year Question Papers", url: "https://www.dge.tn.gov.in" },
      { name: "UPSC Official Syllabus & Previous papers", url: "https://www.upsc.gov.in" }
    ],
    tips: lang === "ta" ? [
      "ஒரு தேசிய நாளிதழின் தலையங்கத்தை (எ.கா. தி இந்து) 20 நிமிடங்களுக்கு படிக்கவும்.",
      "தமிழ்நாடு மாநில வாரியத்தின் 6-12 ஆம் வகுப்பு வரலாறு மற்றும் புவியியலில் அதிக கவனம் செலுத்துங்கள்.",
      "சிக்கலான செய்தி உருப்படிகளை உங்கள் சொந்த வார்த்தைகளில் சுருக்கிப் பழகுங்கள்."
    ] : [
      "Read one national daily newspaper editorial (e.g. The Hindu) for 20 minutes.",
      "Focus heavily on Tamil Nadu State Board Class 6-12 History and Geography.",
      "Practice summarizing complex news items in your own words."
    ]
  },
  "Chartered Accountant (CA)": {
    title: lang === "ta" ? "CA அறக்கட்டளை தயாரிப்பு" : "CA Foundation Preparation",
    links: [
      { name: "ICAI Board of Studies Knowledge Portal", url: "https://www.icai.org/post/bos-knowledge-portal" },
      { name: "CA Foundation Mock Test Series", url: "https://www.icai.org" }
    ],
    tips: lang === "ta" ? [
      "அடிப்படை இரட்டை-நுழைவு லெட்ஜர் கணக்குப்பதிவு கொள்கைகளில் தேர்ச்சி பெறுங்கள்.",
      "தினமும் அளவு மனோபாவம் மற்றும் தர்க்கரீதியான பகுத்தறிவைப் பழகுங்கள்.",
      "மெர்கன்டைல் சட்டங்கள் பிரிவு குறியீடுகளின் தெளிவான கையெழுத்து குறிப்புகளை உருவாக்கவும்."
    ] : [
      "Master the fundamental double-entry ledger bookkeeping principles.",
      "Practice quantitative aptitude and logical reasoning daily.",
      "Make clear handwritten notes of Mercantile Laws section codes."
    ]
  },
  "Defence Services (NDA)": {
    title: lang === "ta" ? "NDA / பாதுகாப்பு நுழைவு தயாரிப்பு" : "NDA / Defence Entrance Preparation",
    links: [
      { name: "NDA Entrance Exam Mock Tests", url: "https://www.upsc.gov.in" },
      { name: "Tamil Nadu Youth Physical Fitness guidelines", url: "https://tnschools.gov.in" }
    ],
    tips: lang === "ta" ? [
      "அடிப்படை உயர்நிலைப் பள்ளி இயற்பியல், கணிதம் மற்றும் பொது ஆங்கில இலக்கணத்தை மேம்படுத்தவும்.",
      "தினமும் காலை 30 நிமிட இருதய ஓட்டம்/உடற்தகுதி பயிற்சியை இணைத்துக்கொள்ளுங்கள்.",
      "நடப்பு விவகாரங்கள் மற்றும் தேசிய பாதுகாப்பு மேம்பாடுகள் குறித்து புதுப்பித்த நிலையில் இருங்கள்."
    ] : [
      "Brush up on basic high school Physics, Mathematics, and General English grammar.",
      "Incorporate 30 minutes of cardiovascular running/fitness training every morning.",
      "Stay updated on current affairs and national security developments."
    ]
  },
  "Default": {
    title: lang === "ta" ? "தொழில் மற்றும் படிப்பு வளங்கள்" : "Career & Study Resources",
    links: [
      { name: "Tamil Nadu Board Previous Year Question Papers", url: "https://www.dge.tn.gov.in" },
      { name: "National Digital Library of India (NDLI)", url: "https://ndl.iitkgp.ac.in/" }
    ],
    tips: lang === "ta" ? [
      "பள்ளி நேரத்திற்கு வெளியே தினமும் 2-3 மணிநேரம் நிலையான படிப்பு அட்டவணையை அமைக்கவும்.",
      "ஒரு கருத்து உங்களுக்குப் புரியாதபோதெல்லாம் வகுப்பில் கேள்விகளைக் கேளுங்கள்.",
      "தேர்வு தயாரிப்புக்கு நிலையான திருப்புதல் நோட்டுப் புத்தக குறிப்புகளை வைத்திருங்கள்."
    ] : [
      "Establish a consistent study schedule of 2-3 hours daily outside school hours.",
      "Ask questions in class whenever you don't understand a concept.",
      "Keep standard revision notebook notes for exam preparation."
    ]
  }
});

const getSubjectStudyTips = (lang: string): Record<string, string> => ({
  "English": lang === "ta" ? "ஆங்கிலத்தில் தினமும் ஒரு சிறுகதையைப் படியுங்கள். புதிய வார்த்தைகளை வட்டமிட்டு, அவற்றின் அர்த்தங்களைச் சரிபார்த்து, அவற்றை உங்கள் சொந்த வாக்கியங்களில் பயன்படுத்தப் பழகுங்கள்." : "Read one short story daily in English. Circle new words, check their meanings, and practice using them in your own sentences.",
  "Mathematics": lang === "ta" ? "தினமும் காலையில் 5 பயிற்சி கணக்குகளைத் தீர்க்கவும். ஒரு தாளில் சூத்திரங்களை எழுதி, தூங்குவதற்கு முன் அவற்றை மதிப்பாய்வு செய்யவும்." : "Solve 5 practice problems every single morning. Write out formulas on a cheat sheet and review them before sleeping.",
  "Science": lang === "ta" ? "முக்கிய உயிரியல் வரைபடங்கள் மற்றும் வேதியியல் சூத்திரங்களை வரையவும். ஒரு அறிவியல் கருத்தை சக மாணவருக்கு விளக்குவதே அதை உங்கள் நினைவில் நிலைநிறுத்துவதற்கான சிறந்த வழியாகும்." : "Draw key biological diagrams and chemical formulas. Explaining a scientific concept to a classmate is the best way to lock it in your memory.",
  "Social Science": lang === "ta" ? "முக்கிய தேதிகள் மற்றும் வரலாற்று நிகழ்வுகளின் காலவரிசை விளக்கப்படத்தை உருவாக்கவும். அதை உங்கள் மேசைக்கு அருகில் தொங்க விடுங்கள், இதனால் நீங்கள் தினமும் அதைப் பார்க்கலாம்." : "Create a timeline chart of important dates and historical events. Hang it near your desk so you see it daily.",
  "Tamil": lang === "ta" ? "சரியான இலக்கண விதிகளில் கவனம் செலுத்துங்கள் மற்றும் உங்கள் தமிழ் உச்சரிப்பு மற்றும் சொல் வேகத்தை மேம்படுத்த சிறு கட்டுரைகளை எழுதப் பழகுங்கள்." : "Focus on correct grammatical rules (Ilaakkanam) and practice writing short essays to improve your Tamil spelling and vocabulary speed."
});

function StatusIcon({ status }: { status: string }) {
  if (status === "answered") return <span className="text-2xl">&#128172;</span>;
  if (status === "reviewed") return <span className="text-2xl">&#9989;</span>;
  return <span className="text-2xl">&#9203;</span>;
}

export default function StudentPersonalGuidePage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  const [lang, setLang] = useState<"en" | "ta">("en");
  const t = uiTranslations[lang];

  const [student, setStudent] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  // Dynamic Mentor Hub States
  const [lowestSubject, setLowestSubject] = useState<string>("");
  const [lowestScore, setLowestScore] = useState<number>(0);
  const [mentorGoal, setMentorGoal] = useState<string>("Default");

  // Yoga Pose Carousel Index
  const [yogaIdx, setYogaIdx] = useState(0);

  const loadTasks = useCallback(
    async (studentId: string) => {
      try {
        const res = await fetch(
          `${API}/api/personal-guide/tasks?studentId=${studentId}`
        );
        const data = await res.json();
        if (data.success) setTasks(data.data);
      } catch (e) {
        console.error(e);
      }
    },
    []
  );

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`${API}/api/students?userId=${userId}`)
      .then((r) => r.json())
      .then(async (d) => {
        if (d.success && d.data.length > 0) {
          const s = d.data[0];
          setStudent(s);

          // 1. Fetch full details to check marks and lowest score
          try {
            const resFull = await fetch(`${API}/api/students/${s.id}`);
            const dataFull = await resFull.json();
            if (dataFull.success && dataFull.data) {
              const marks = dataFull.data.marks || [];
              if (marks.length > 0) {
                const lowest = marks.reduce((min: any, m: any) => m.scored < min.scored ? m : min, marks[0]);
                setLowestSubject(lowest.subject);
                setLowestScore(lowest.scored);
              }
            }
          } catch (e) { console.error(e); }

          // 2. Fetch teacher assigned guidance log (to get Career Goal)
          try {
            const resGuide = await fetch(`${API}/api/personal-guide/student/${s.id}`);
            const dataGuide = await resGuide.json();
            if (dataGuide.success && dataGuide.data && dataGuide.data.goal) {
              setMentorGoal(dataGuide.data.goal);
            }
          } catch (e) { console.error(e); }

          await loadTasks(s.id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId, loadTasks]);

  const handleNextPose = () => {
    setYogaIdx((prev) => (prev + 1) % getYogaPoses(lang).length);
  };

  const handlePrevPose = () => {
    setYogaIdx((prev) => (prev - 1 + getYogaPoses(lang).length) % getYogaPoses(lang).length);
  };

  const handleSubmitResponse = async (taskId: string) => {
    const text = draftText[taskId]?.trim();
    if (!text || !student) return;
    setSubmitting(taskId);
    try {
      const res = await fetch(
        `${API}/api/personal-guide/tasks/${taskId}/respond`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: student.id, responseText: text }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setDraftText((prev) => ({ ...prev, [taskId]: "" }));
        await loadTasks(student.id);
        Swal.fire({
          icon: "success",
          title: "Response Sent!",
          text: "Your teacher will review it soon.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({ icon: "error", title: "Failed", text: data.error });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(null);
    }
  };

  const pendingCount = tasks.filter((task) => task.status === "pending").length;
  const answeredCount = tasks.filter((task) => task.status === "answered").length;
  const reviewedCount = tasks.filter((task) => task.status === "reviewed").length;

  const resources = getGoalResources(lang)[mentorGoal] || getGoalResources(lang)["Default"];
  const subjectStudyTip = getSubjectStudyTips(lang)[lowestSubject] || getSubjectStudyTips(lang)["English"];
  const activePose = getYogaPoses(lang)[yogaIdx];

  // Pagination logic
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(tasks.length / tasksPerPage);

  if (loading) {
    return (
      <PortalLayout>
        <div className="min-h-screen flex items-center justify-center text-slate-400 text-xs">
          Loading your Personal Guide...
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title={t.personalGuide} subtitle={t.subtitle}>
      <div className="w-full space-y-8 animate-in fade-in duration-300 pb-16 text-left">

        {/* Full Width Dynamic & Premium Hero Banner */}
        <div
          className="hero-band relative w-full overflow-hidden rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10 !text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300 group"
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)",
            color: "#ffffff"
          }}
        >
          {/* Ambient Lighting Circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-sm">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight !text-white drop-shadow-md" style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}>
                  {t.personalGuide}
                </h1>
                <p className="text-indigo-100 text-xs sm:text-sm font-medium drop-shadow-sm">
                  {t.subtitle}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg">
              <div className="bg-black/25 backdrop-blur-md rounded-2xl p-3 text-center border border-white/20 flex flex-col justify-center shadow-sm">
                <p className="text-xl sm:text-2xl font-black text-amber-300">{pendingCount}</p>
                <p className="text-[10px] sm:text-xs text-indigo-100 font-bold leading-tight">{t.awaitingReply}</p>
              </div>
              <div className="bg-black/25 backdrop-blur-md rounded-2xl p-3 text-center border border-white/20 flex flex-col justify-center shadow-sm">
                <p className="text-xl sm:text-2xl font-black text-blue-200">{answeredCount}</p>
                <p className="text-[10px] sm:text-xs text-indigo-100 font-bold leading-tight">{t.replied}</p>
              </div>
              <div className="bg-black/25 backdrop-blur-md rounded-2xl p-3 text-center border border-white/20 flex flex-col justify-center shadow-sm">
                <p className="text-xl sm:text-2xl font-black text-emerald-300">{reviewedCount}</p>
                <p className="text-[10px] sm:text-xs text-indigo-100 font-bold leading-tight">{t.feedbackReceived}</p>
              </div>
            </div>
          </div>

          {/* Scoped style to ensure active toggle button text is dark navy */}
          <style>{`
            .hero-band .active-lang-btn {
              background-color: #ffffff !important;
              color: #0f172a !important;
              -webkit-text-fill-color: #0f172a !important;
            }
          `}</style>

          {/* Language Toggle */}
          <div className="relative z-10 flex bg-black/30 backdrop-blur-md border border-white/30 p-1.5 rounded-2xl shadow-md">
            <button
              onClick={() => setLang("en")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${lang === "en" ? "active-lang-btn shadow-md" : "!text-white hover:opacity-90"}`}
              style={lang === "en" ? { backgroundColor: "#ffffff", color: "#0f172a", WebkitTextFillColor: "#0f172a" } : { color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
            >
              English
            </button>
            <button
              onClick={() => setLang("ta")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${lang === "ta" ? "active-lang-btn shadow-md" : "!text-white hover:opacity-90"}`}
              style={lang === "ta" ? { backgroundColor: "#ffffff", color: "#0f172a", WebkitTextFillColor: "#0f172a" } : { color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
            >
              தமிழ்
            </button>
          </div>
        </div>

        {/* Grid Layout (Full Width) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 w-full">

          {/* LEFT: Task Inbox */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Inbox className="w-4 h-4 text-indigo-500" />
              <h2 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {t.taskInbox}
              </h2>
            </div>

              {tasks.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center py-20 text-center">
                  <Inbox className="w-12 h-12 text-slate-200 dark:text-slate-700 mb-3" />
                  <p className="text-sm font-bold text-slate-400">{t.noTasksTitle}</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    {t.noTasksDesc}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentTasks.map((task) => {
                    const statusCfg = getStatusConfig(lang);
                    const cfg = statusCfg[task.status as keyof typeof statusCfg] || statusCfg.pending;
                    const isExp = expandedId === task._id;
                    const hasRes = !!task.response;

                    return (
                      <div
                      key={task._id}
                      className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden transition-colors ${cfg.border}`}
                    >
                      <div
                        onClick={() => setExpandedId(isExp ? null : task._id)}
                        className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <div className="shrink-0 mt-0.5">
                          <StatusIcon status={task.status} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-2 mb-1">
                            <h3 className="text-sm font-black text-slate-800 dark:text-white leading-tight">
                              {task.title}
                            </h3>
                            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 w-fit">
                              {t.taskTypes[task.taskType] || task.taskType}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                            {task.question}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs font-bold text-slate-500">
                              {cfg.label}
                            </span>
                            {task.dueDate && (
                              <span className="text-xs text-amber-500">
                                {t.due} {task.dueDate}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 text-slate-400">
                          {isExp ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>

                      {isExp && (
                        <div className="border-t border-slate-100 dark:border-slate-800 p-5 space-y-4 bg-white dark:bg-slate-900">
                          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl p-4">
                            <p className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-1">
                              {t.teacherAsks}
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                              {task.question}
                            </p>
                          </div>

                          {hasRes ? (
                            <div className="space-y-3">
                              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl p-4">
                                <p className="text-xs font-black text-blue-500 uppercase tracking-wider mb-1">
                                  {t.yourAnswer}
                                </p>
                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                  {task.response.responseText}
                                </p>
                                <p className="text-xs text-slate-400 mt-2">
                                  {t.submitted}{" "}
                                  {new Date(
                                    task.response.submittedAt
                                  ).toLocaleString("en-IN")}
                                </p>
                              </div>

                              {task.response.teacherFeedback ? (
                                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                                    {t.teacherFeedback}
                                  </p>
                                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                                    &quot;{task.response.teacherFeedback}&quot;
                                  </p>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-xl px-4 py-3">
                                  <Clock className="w-3.5 h-3.5 shrink-0" />
                                  {t.teacherReviewing}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
                                {t.writeResponse}
                              </p>
                              <textarea
                                rows={4}
                                value={draftText[task._id] || ""}
                                onChange={(e) =>
                                  setDraftText((prev) => ({
                                    ...prev,
                                    [task._id]: e.target.value,
                                  }))
                                }
                                placeholder={t.placeholder}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 resize-none leading-relaxed"
                              />
                              <button
                                onClick={() => handleSubmitResponse(task._id)}
                                disabled={
                                  submitting === task._id ||
                                  !draftText[task._id]?.trim()
                                }
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                              >
                                <Send className="w-3.5 h-3.5" />
                                {submitting === task._id
                                  ? t.submitting
                                  : t.submitAnswer}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 pb-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                      >
                        <ChevronLeft className="w-4 h-4" /> {t.previous}
                      </button>
                      <span className="text-xs font-bold text-slate-500">
                        {t.page} {currentPage} {t.of} {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                      >
                        {t.next} <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT: Mentor Support Hub */}
            <div className="lg:col-span-1 space-y-5">

              <div className="flex items-center gap-2 px-1">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <h2 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t.mentorsHub}
                </h2>
              </div>

              {/* Widget 1: Yoga Poses Widget (with Image steps) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                      {t.yogaPoseTitle}
                    </h3>
                  </div>
                  {/* Navigation controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevPose}
                      className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] text-slate-400 font-bold px-1">
                      {yogaIdx + 1}/{getYogaPoses(lang).length}
                    </span>
                    <button
                      onClick={handleNextPose}
                      className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Active Yoga Pose details */}
                <div className="space-y-3">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                    <img
                      src={activePose.image}
                      alt={activePose.name}
                      className="object-cover w-full h-full"
                    />
                    <span className="absolute bottom-2 right-2 text-[9px] bg-white/80 dark:bg-black/60 backdrop-blur-sm text-slate-800 dark:text-white px-2 py-0.5 rounded-full font-bold shadow-sm">
                      ⏱️ {activePose.duration}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white">
                      {activePose.name}
                    </h4>
                    <p className="text-[10px] font-bold text-indigo-500">
                      {activePose.localName}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {activePose.benefits}
                    </p>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      {t.howToDoIt}
                    </p>
                    <ol className="space-y-1">
                      {activePose.steps.map((step, idx) => (
                        <li
                          key={idx}
                          className="text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-1 leading-relaxed"
                        >
                          <span className="font-bold text-indigo-400 min-w-[12px]">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>

              {/* Widget 2: Career Goal Reference Links */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Compass className="w-4 h-4 text-violet-500" />
                  <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                    {t.goal} {resources.title}
                  </h3>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    {t.suggestedMaterials}
                  </p>
                  <ul className="space-y-2">
                    {resources.links.map((link, idx) => (
                      <li key={idx} className="text-xs">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-500 hover:underline flex items-start gap-1 font-medium leading-tight"
                        >
                          <span>🔗</span>
                          <span>{link.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    {t.prepTips}
                  </p>
                  <ul className="space-y-1.5">
                    {resources.tips.map((tip, idx) => (
                      <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5 leading-relaxed">
                        <span className="text-indigo-400 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Widget 3: Subject wise study tips */}
              {lowestSubject && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <Brain className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                      {t.studyFocus} {lowestSubject}
                    </h3>
                  </div>
                  <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/50 rounded-xl p-3">
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {subjectStudyTip}
                    </p>
                    {lowestScore > 0 && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 font-bold">
                        {t.targetingImprovement} {lowestScore}% {t.score}
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
    </PortalLayout>
  );
}
