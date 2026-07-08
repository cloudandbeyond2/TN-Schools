"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";

// ── DATA ─────────────────────────────────────────────────────────────────────

const CAREERS = [
  {
    id: "doctor", title: "Doctor / MBBS", icon: "🩺", category: "Medical",
    grad: "from-rose-500 to-red-600", soft: "bg-rose-50 dark:bg-rose-950/30", text: "text-rose-600 dark:text-rose-400",
    path: "NEET → MBBS → MD / MS",
    subjects: ["Biology", "Chemistry", "Physics"],
    streams: ["Science"],
    exam: "NEET-UG",
    examBody: "NTA (National Testing Agency)",
    duration: "5.5 years (MBBS) + PG optional",
    salary: { entry: "₹6–12 LPA", mid: "₹15–30 LPA", senior: "₹40–80 LPA" },
    colleges: ["AIIMS (New Delhi / Madurai)", "JIPMER Puducherry", "Madras Medical College", "Stanley Medical College", "Government Kilpauk Medical College"],
    description: "Doctors diagnose, treat and prevent illness. From general practice to surgery, neurology, and paediatrics — medicine offers a deeply fulfilling lifelong career.",
    dailyLife: "Patient rounds, diagnosis, prescribing treatment, emergency duty, research.",
    topRecruiters: ["Government Hospitals", "Apollo Hospitals", "Fortis", "AIIMS", "Private Practice"],
    skills: ["Biology (must)", "Chemistry (must)", "Communication", "Decision-making under pressure"],
    proTip: "Score 650+ in NEET. Start with NCERT Biology — it forms 70% of NEET questions.",
    classes: [9, 10, 11, 12],
  },
  {
    id: "engineer", title: "Engineer", icon: "⚙️", category: "Engineering",
    grad: "from-blue-500 to-cyan-600", soft: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400",
    path: "JEE / TNEA → B.Tech → M.Tech / MBA",
    subjects: ["Mathematics", "Physics", "Chemistry"],
    streams: ["Science"],
    exam: "JEE Main / JEE Advanced / TNEA",
    examBody: "NTA / IIT Council / Anna University",
    duration: "4 years (B.Tech)",
    salary: { entry: "₹4–10 LPA", mid: "₹12–25 LPA", senior: "₹30–80 LPA" },
    colleges: ["IIT Madras", "NIT Trichy", "Anna University", "CEG Chennai", "PSG Tech Coimbatore"],
    description: "Engineers design, build and maintain systems — from bridges to software. Tamil Nadu has 500+ engineering colleges and a booming IT and manufacturing sector.",
    dailyLife: "Design, coding, testing, team meetings, problem-solving, project reviews.",
    topRecruiters: ["TCS", "Infosys", "Wipro", "L&T", "ISRO", "DRDO", "FAANG"],
    skills: ["Mathematics (must)", "Physics", "Logical reasoning", "Coding (CS branch)", "CAD (Mech/Civil)"],
    proTip: "Score 80%+ in 12th Board for TNEA. For JEE, focus on NCERT + coaching from Class 11.",
    classes: [9, 10, 11, 12],
  },
  {
    id: "ias", title: "IAS / IPS Officer", icon: "🏛️", category: "Civil Services",
    grad: "from-amber-500 to-orange-600", soft: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400",
    path: "Any Degree → UPSC CSE → IAS/IPS Training",
    subjects: ["History", "Polity", "Geography", "Economics"],
    streams: ["Science", "Commerce"],
    exam: "UPSC Civil Services Examination (CSE)",
    examBody: "Union Public Service Commission (UPSC)",
    duration: "3 years Degree + Preparation (2–5 years)",
    salary: { entry: "₹56,100 + allowances", mid: "₹1.18 LPA + perks", senior: "₹2.25 LPA (Cabinet Sec)" },
    colleges: ["Any central/state university", "DU, BHU, Madras University", "IIT / IIM alumni also crack UPSC"],
    description: "IAS and IPS officers are the backbone of Indian governance — managing districts, leading police forces and implementing national policies.",
    dailyLife: "Office administration, district tours, meetings with ministers, citizen grievances, law enforcement (IPS).",
    topRecruiters: ["Government of India", "State Governments", "Embassies (IFS)"],
    skills: ["Reading comprehension", "Current affairs", "Essay writing", "Tamil & English", "Leadership"],
    proTip: "Start reading Hindu newspaper from Class 11. Complete NCERT books 6–12 for all subjects.",
    classes: [9, 10, 11, 12],
  },
  {
    id: "tnpsc", title: "TNPSC Officer", icon: "📋", category: "Civil Services",
    grad: "from-violet-500 to-purple-600", soft: "bg-violet-50 dark:bg-violet-950/30", text: "text-violet-600 dark:text-violet-400",
    path: "Graduation → TNPSC Group I/II/IV → State Service",
    subjects: ["General Studies", "Tamil", "English", "Aptitude"],
    streams: ["Science", "Commerce"],
    exam: "TNPSC Group I, II, IV, VIII",
    examBody: "Tamil Nadu Public Service Commission",
    duration: "Any Degree (3 years)",
    salary: { entry: "₹25,000–45,000/month", mid: "₹50,000–80,000", senior: "₹1–1.5 LPA" },
    colleges: ["Any Tamil Nadu University", "Madras University", "Bharathiar University", "Annamalai University"],
    description: "TNPSC recruits officers for various Tamil Nadu Government departments — Deputy Collector, Block Development Officer, Revenue Inspector and more.",
    dailyLife: "Office work, public grievance, revenue collection, development scheme implementation.",
    topRecruiters: ["Tamil Nadu Government departments"],
    skills: ["Tamil medium strongly preferred", "Samacheer textbook knowledge (6–12)", "Current affairs", "Aptitude"],
    proTip: "TNPSC Group IV can be attempted right after graduation. Samacheer textbooks are the primary source!",
    classes: [9, 10, 11, 12],
  },
  {
    id: "defence", title: "Armed Forces / Police", icon: "👮", category: "Defence",
    grad: "from-slate-500 to-gray-600", soft: "bg-slate-50 dark:bg-slate-950/30", text: "text-slate-600 dark:text-slate-400",
    path: "12th / Graduation → NDA / CDS / Police → Training",
    subjects: ["Mathematics", "Physical Education", "General Knowledge"],
    streams: ["Science", "Commerce"],
    exam: "NDA, CDS, AFCAT, TN Police SI",
    examBody: "UPSC / SSC / State Police Boards",
    duration: "After 12th (NDA) or Graduation (CDS)",
    salary: { entry: "₹30,000–56,000/month", mid: "₹70,000–1.2 LPA", senior: "₹1.5–2.5 LPA (Officers)" },
    colleges: ["NDA Pune (Army/Navy/Air)", "OTA Chennai", "TN Police Academy"],
    description: "A career in the Indian Army, Navy, Air Force or Tamil Nadu Police offers prestige, adventure, job security and an opportunity to serve the nation.",
    dailyLife: "Physical training, patrols, strategy, leadership, field operations.",
    topRecruiters: ["Indian Army", "Indian Navy", "Indian Air Force", "Tamil Nadu Police"],
    skills: ["Physical fitness", "Mathematics (for NDA)", "English", "Discipline", "Leadership"],
    proTip: "NDA exam after Class 12 (Science stream preferred). Start physical training from Class 10 itself.",
    classes: [9, 10, 11, 12],
  },
  {
    id: "banking", title: "Banking & Finance", icon: "🏦", category: "Finance",
    grad: "from-emerald-500 to-teal-600", soft: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400",
    path: "B.Com/BBA/B.Sc → IBPS/SBI PO → Bank Officer",
    subjects: ["Mathematics", "Economics", "Accountancy", "English"],
    streams: ["Science", "Commerce"],
    exam: "IBPS PO, SBI PO, RBI Grade B, CA",
    examBody: "IBPS / SBI / RBI / ICAI",
    duration: "3 years Degree + 1–2 years exam prep",
    salary: { entry: "₹5–8 LPA", mid: "₹12–20 LPA", senior: "₹25–50 LPA" },
    colleges: ["IIM (MBA Finance)", "Loyola Chennai", "PSG Arts Coimbatore", "Stella Maris (Commerce)"],
    description: "Banking and Finance professionals manage money, investments, loans and economic policy. Chartered Accountancy (CA) is one of the most prestigious paths.",
    dailyLife: "Client meetings, loan processing, financial analysis, auditing, account management.",
    topRecruiters: ["SBI", "HDFC", "ICICI", "RBI", "Big 4 Audit Firms (KPMG, Deloitte, EY, PwC)"],
    skills: ["Mathematics", "Accountancy", "Attention to detail", "Excel/Financial tools", "Communication"],
    proTip: "Start CA Foundation immediately after Class 12 Commerce. Register with ICAI during Class 12 itself.",
    classes: [9, 10, 11, 12],
  },
  {
    id: "software", title: "IT / Software Engineer", icon: "💻", category: "Technology",
    grad: "from-indigo-500 to-blue-600", soft: "bg-indigo-50 dark:bg-indigo-950/30", text: "text-indigo-600 dark:text-indigo-400",
    path: "B.Tech CS / BCA → Software Engineer → Senior Dev",
    subjects: ["Mathematics", "Computer Science", "Physics"],
    streams: ["Science", "ComputerScience"],
    exam: "JEE / TNEA / TANCET / Campus Placement",
    examBody: "NTA / Anna University / Companies",
    duration: "4 years B.Tech / 3 years BCA",
    salary: { entry: "₹4–8 LPA", mid: "₹15–35 LPA", senior: "₹50 LPA–1 Cr+" },
    colleges: ["IIT Madras", "NIT Trichy", "Anna University", "SASTRA University", "VIT Vellore"],
    description: "Software engineers build apps, websites, AI systems and infrastructure. Tamil Nadu's IT corridor (Chennai, Coimbatore) is one of India's largest tech hubs.",
    dailyLife: "Coding, code reviews, stand-up meetings, debugging, system design, deployments.",
    topRecruiters: ["TCS", "Infosys", "Zoho", "Google", "Microsoft", "Amazon", "startups"],
    skills: ["C++/Python/Java", "Data Structures", "Mathematics", "Problem-solving", "Git/DevOps"],
    proTip: "Learn Python or C from Class 9. Practice LeetCode problems from Class 11. Side projects matter!",
    classes: [9, 10, 11, 12],
  },
  {
    id: "agriculture", title: "Agriculture Officer", icon: "🌾", category: "Agriculture",
    grad: "from-green-500 to-lime-600", soft: "bg-green-50 dark:bg-green-950/30", text: "text-green-600 dark:text-green-400",
    path: "B.Sc Agri (TNAU) → TN Agri Dept / NABARD",
    subjects: ["Biology", "Chemistry", "Botany"],
    streams: ["Science"],
    exam: "TNAU Entrance / ICAR / TNPSC Agri",
    examBody: "Tamil Nadu Agricultural University / ICAR",
    duration: "4 years B.Sc Agriculture",
    salary: { entry: "₹4–6 LPA", mid: "₹8–15 LPA", senior: "₹20–35 LPA" },
    colleges: ["TNAU Coimbatore", "Agricultural College & Research Institute Madurai", "Killikulam Agri College", "Forest College Mettupalayam"],
    description: "Agriculture officers guide farmers on modern techniques, crop management, soil health and government schemes. Smart farming and agri-tech are creating exciting new roles.",
    dailyLife: "Field visits, soil testing, farmer training, scheme implementation, crop disease assessment.",
    topRecruiters: ["Tamil Nadu Agriculture Dept", "NABARD", "ICAR", "Agri-tech startups", "Fertiliser companies"],
    skills: ["Biology", "Chemistry", "Field work", "Tamil", "Data analysis (modern roles)"],
    proTip: "TNAU entrance exam is based on Biology/Chemistry. Rank in top 500 for government seat.",
    classes: [9, 10, 11, 12],
  },
  {
    id: "lawyer", title: "Lawyer / Judge", icon: "⚖️", category: "Law",
    grad: "from-yellow-500 to-amber-600", soft: "bg-yellow-50 dark:bg-yellow-950/30", text: "text-yellow-600 dark:text-yellow-400",
    path: "BA LLB / BBA LLB → Advocate → Senior Counsel / Judge",
    subjects: ["English", "History", "Political Science"],
    streams: ["Science", "Commerce"],
    exam: "CLAT / LSAT / Tamil Nadu Law Entrance",
    examBody: "Consortium of NLUs",
    duration: "5 years integrated LLB",
    salary: { entry: "₹4–8 LPA", mid: "₹15–40 LPA", senior: "₹60 LPA+ (Senior Advocates)" },
    colleges: ["NLU Chennai (Tamil Nadu National Law University)", "Madras Law College", "School of Excellence in Law"],
    description: "Lawyers argue cases, draft contracts and interpret law. Judges preside over courts. With India's massive legal system, law offers both private and government career paths.",
    dailyLife: "Research, client meetings, court appearances, writing briefs, legal drafting.",
    topRecruiters: ["High Court / Supreme Court", "Law Firms", "Corporate Legal Teams", "NGOs"],
    skills: ["English (must)", "Reading & comprehension", "Logical reasoning", "Debating", "Research"],
    proTip: "CLAT exam after 12th. Score 500+ in CLAT for NLU Chennai. Join debate clubs from school itself.",
    classes: [9, 10, 11, 12],
  },
  {
    id: "teacher", title: "Teacher / Professor", icon: "🧑‍🏫", category: "Education",
    grad: "from-teal-500 to-cyan-600", soft: "bg-teal-50 dark:bg-teal-950/30", text: "text-teal-600 dark:text-teal-400",
    path: "B.Ed / B.Sc + B.Ed → TET / TN TRB → Govt Teacher",
    subjects: ["Any Subject", "Tamil", "English"],
    streams: ["Science", "Commerce"],
    exam: "TET (Teacher Eligibility Test) / TN TRB",
    examBody: "Tamil Nadu Teachers Recruitment Board",
    duration: "3 years Degree + 2 years B.Ed",
    salary: { entry: "₹35,000–50,000/month", mid: "₹60,000–80,000", senior: "₹1–1.5 LPA (HM)" },
    colleges: ["Tamil Nadu Teachers Education University (TNTEU)", "Government Colleges of Education", "Alagappa University"],
    description: "Teachers shape future generations. Government school teachers in Tamil Nadu enjoy excellent job security, pension and social respect.",
    dailyLife: "Classroom teaching, lesson planning, student assessment, parent meetings, school admin.",
    topRecruiters: ["Tamil Nadu Education Dept", "KV Schools (CBSE)", "Private schools", "Colleges (for professors)"],
    skills: ["Subject expertise", "Communication", "Patience", "Tamil / English", "Technology literacy"],
    proTip: "B.Sc + B.Ed (4 year integrated) is the new pattern. Score well in TET to get government school posting.",
    classes: [9, 10, 11, 12],
  },
];

const EXAMS = [
  { name: "NEET-UG", date: "May 2026", for: "Medical (MBBS/BDS)", eligibility: "Class 12 (PCB)", body: "NTA", color: "from-rose-500 to-red-500" },
  { name: "JEE Main", date: "Jan & Apr 2026", for: "Engineering (B.Tech)", eligibility: "Class 12 (PCM)", body: "NTA", color: "from-blue-500 to-cyan-500" },
  { name: "JEE Advanced", date: "May 2026", for: "IITs (B.Tech)", eligibility: "JEE Main Top 2.5 lakh", body: "IIT", color: "from-indigo-500 to-violet-500" },
  { name: "TNEA", date: "June 2026", for: "TN Engineering Colleges", eligibility: "Class 12 (PCM) 45%+", body: "Anna University", color: "from-sky-500 to-blue-500" },
  { name: "CLAT", date: "Dec 2025", for: "Law (LLB)", eligibility: "Class 12 any stream 45%", body: "Consortium of NLUs", color: "from-amber-500 to-orange-500" },
  { name: "TNPSC Group IV", date: "Quarterly", for: "TN State Service", eligibility: "Graduation", body: "TNPSC", color: "from-violet-500 to-purple-500" },
  { name: "NDA", date: "Apr & Sep 2026", for: "Armed Forces Officer", eligibility: "Class 12 (PCM for Army/Navy/Air)", body: "UPSC", color: "from-slate-500 to-gray-600" },
  { name: "IBPS PO", date: "Oct 2026", for: "Bank Probationary Officer", eligibility: "Any Graduation", body: "IBPS", color: "from-emerald-500 to-teal-500" },
];

const QUIZ_QUESTIONS = [
  { q: "What do you enjoy most?", options: ["Helping sick people get better", "Building or fixing things", "Reading and arguing logically", "Working with numbers & money", "Coding & problem solving", "Teaching and guiding others"] },
  { q: "Which subject excites you most?", options: ["Biology", "Physics & Math", "History & Polity", "Economics & Accounts", "Computer Science", "Any — I love all subjects"] },
  { q: "Which work environment fits you?", options: ["Hospital / Clinic", "Office / Field", "Courtroom / Government", "Bank / Corporate", "Tech company / Remote", "School / College"] },
  { q: "What is your long-term goal?", options: ["Save lives", "Build infrastructure or software", "Serve the nation / public", "Grow wealth", "Innovate with technology", "Inspire the next generation"] },
  { q: "How much risk are you comfortable with?", options: ["Low — stable government job", "Medium — corporate with growth", "High — startup / entrepreneurship", "I want to study more first"] },
];

const QUIZ_RESULTS: Record<string, { careers: string[]; note: string }> = {
  "0": { careers: ["doctor"], note: "Your passion for helping people makes Medicine a natural fit." },
  "1": { careers: ["engineer", "software"], note: "Your love for building & fixing things points to Engineering or IT." },
  "2": { careers: ["ias", "tnpsc", "lawyer"], note: "Your civic interest aligns perfectly with Civil Services or Law." },
  "3": { careers: ["banking", "tnpsc"], note: "Your aptitude for numbers suits Banking, Finance, or CA." },
  "4": { careers: ["software", "engineer"], note: "Technology is your domain — Software Engineering is the path!" },
  "5": { careers: ["teacher"], note: "Your passion for guiding others makes Teaching a fulfilling career." },
};

const CATEGORIES = ["All", "Medical", "Engineering", "Technology", "Civil Services", "Finance", "Defence", "Agriculture", "Law", "Education"];

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export default function CareerGuidancePage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const studentClass = parseInt(user?.class || "10");
  const studentName = user?.name?.split(" ")[0] || "Student";

  const [activeTab, setActiveTab] = useState<"explore" | "quiz" | "exams" | "colleges">("explore");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedCareer, setExpandedCareer] = useState<string | null>(null);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizDone, setQuizDone] = useState(false);

  const visible = CAREERS.filter(c =>
    selectedCategory === "All" || c.category === selectedCategory
  );

  const handleQuizAnswer = (idx: number) => {
    const next = [...quizAnswers, idx];
    setQuizAnswers(next);
    if (quizStep < QUIZ_QUESTIONS.length - 1) {
      setQuizStep(s => s + 1);
    } else {
      setQuizDone(true);
    }
  };

  const topChoice = quizAnswers.length > 0 ? String(quizAnswers[0]) : "1";
  const quizResult = QUIZ_RESULTS[topChoice] || QUIZ_RESULTS["1"];
  const recommendedCareers = CAREERS.filter(c => quizResult.careers.includes(c.id));

  const TABS = [
    { id: "explore", label: "🔭 Explore Careers" },
    { id: "quiz", label: "🧠 Career Quiz" },
    { id: "exams", label: "📅 Exam Calendar" },
    { id: "colleges", label: "🏫 TN Colleges" },
  ] as const;

  return (
    <PortalLayout
      title="Career Guidance"
      subtitle={`Personalised paths for Class ${studentClass} — find your calling`}
    >
      <div className="flex flex-col gap-6">

        {/* HERO */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white p-8 shadow-xl">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute right-10 bottom-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider mb-3">
              🎯 Class {studentClass} Career Guidance
            </span>
            <h2 className="text-3xl font-black text-white mb-2">
              Hello {studentName}! What will you become?
            </h2>
            <p className="text-white/85 text-sm font-medium leading-relaxed">
              Explore career paths, entrance exams, top Tamil Nadu colleges and get a personalised recommendation — all in one place.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {["🩺 Medical", "⚙️ Engineering", "💻 Technology", "🏛️ Civil Services", "⚖️ Law"].map(tag => (
                <span key={tag} className="bg-white/15 text-white text-[11px] font-bold px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-x-auto gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-1 ${activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-600 dark:text-slate-300 hover:text-indigo-600"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: EXPLORE CAREERS ─────────────────────────────────────────── */}
        {activeTab === "explore" && (
          <div className="space-y-5">
            {/* Category filter */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${selectedCategory === cat ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300"}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Career Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {visible.map(career => {
                const isOpen = expandedCareer === career.id;
                return (
                  <div
                    key={career.id}
                    className={`bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 overflow-hidden transition-all ${isOpen ? "shadow-xl border-indigo-200 dark:border-indigo-800" : "hover:shadow-lg hover:-translate-y-0.5"}`}
                  >
                    {/* Card header */}
                    <button
                      onClick={() => setExpandedCareer(isOpen ? null : career.id)}
                      className="w-full p-5 text-left"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${career.grad} flex items-center justify-center text-2xl shadow-md shrink-0`}>
                          {career.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-base font-black text-slate-800 dark:text-white leading-tight">{career.title}</h3>
                            <span className={`text-lg transition-transform ${isOpen ? "rotate-180" : ""}`}>⌄</span>
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-wider ${career.text} block mt-0.5`}>{career.category}</span>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{career.path}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {career.subjects.map(s => (
                              <span key={s} className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${career.soft} ${career.text}`}>{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div className="px-5 pb-5 space-y-4 border-t border-slate-100 dark:border-slate-700 pt-4">
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{career.description}</p>

                        {/* Salary */}
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: "Entry Level", val: career.salary.entry, color: "emerald" },
                            { label: "Mid Career", val: career.salary.mid, color: "sky" },
                            { label: "Senior", val: career.salary.senior, color: "violet" },
                          ].map(s => (
                            <div key={s.label} className={`p-2.5 bg-${s.color}-50 dark:bg-${s.color}-950/30 rounded-xl text-center border border-${s.color}-100 dark:border-${s.color}-900/30`}>
                              <p className={`text-[9px] font-black uppercase ${s.color === "emerald" ? "text-emerald-500" : s.color === "sky" ? "text-sky-500" : "text-violet-500"}`}>{s.label}</p>
                              <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 mt-0.5">{s.val}</p>
                            </div>
                          ))}
                        </div>

                        {/* Exam & Duration */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                            <p className="text-[9px] font-black text-slate-400 uppercase">Entrance Exam</p>
                            <p className="text-xs font-black text-slate-700 dark:text-slate-200 mt-0.5">{career.exam}</p>
                            <p className="text-[9px] text-slate-400">{career.examBody}</p>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                            <p className="text-[9px] font-black text-slate-400 uppercase">Duration</p>
                            <p className="text-xs font-black text-slate-700 dark:text-slate-200 mt-0.5">{career.duration}</p>
                          </div>
                        </div>

                        {/* Top Colleges */}
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 mb-1.5">🏫 Top Tamil Nadu Colleges</p>
                          <div className="flex flex-col gap-1">
                            {career.colleges.slice(0, 3).map((c, i) => (
                              <div key={c} className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                                <span className={`w-4 h-4 rounded-full text-white text-[8px] font-black flex items-center justify-center bg-gradient-to-br ${career.grad}`}>{i + 1}</span>
                                {c}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Skills */}
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 mb-1.5">🛠️ Key Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {career.skills.map(sk => (
                              <span key={sk} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{sk}</span>
                            ))}
                          </div>
                        </div>

                        {/* Day in Life */}
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/30">
                          <p className="text-[9px] font-black uppercase text-amber-500 mb-1">☀️ A Day in the Life</p>
                          <p className="text-[10px] text-amber-800 dark:text-amber-300 font-medium">{career.dailyLife}</p>
                        </div>

                        {/* Pro Tip */}
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                          <p className="text-[9px] font-black uppercase text-indigo-500 mb-1">💡 Pro Tip for You</p>
                          <p className="text-[10px] text-indigo-700 dark:text-indigo-300 font-medium">{career.proTip}</p>
                        </div>

                        {/* Top Recruiters */}
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 mb-1.5">🏢 Top Recruiters</p>
                          <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">{career.topRecruiters.join(" · ")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 2: CAREER QUIZ ─────────────────────────────────────────────── */}
        {activeTab === "quiz" && (
          <div className="space-y-5">
            {!quizDone ? (
              <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 p-6 shadow-sm">
                {/* Progress */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Question {quizStep + 1} of {QUIZ_QUESTIONS.length}</p>
                    <h3 className="text-base font-black text-slate-800 dark:text-white mt-1">{QUIZ_QUESTIONS[quizStep].q}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{quizStep + 1}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mb-6">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${((quizStep) / QUIZ_QUESTIONS.length) * 100}%` }} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {QUIZ_QUESTIONS[quizStep].options.map((opt, i) => (
                    <button
                      key={opt}
                      onClick={() => handleQuizAnswer(i)}
                      className="w-full text-left px-4 py-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-sm font-bold text-slate-700 dark:text-slate-200 transition-all hover:-translate-y-0.5"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setQuizStep(0); setQuizAnswers([]); setQuizDone(false); }}
                  className="mt-4 text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  ↺ Restart Quiz
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Result */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 text-white">
                  <p className="text-xs font-black uppercase tracking-wider mb-2 opacity-80">🎉 Your Career Match</p>
                  <h3 className="text-2xl font-black mb-2">{recommendedCareers.map(c => c.title).join(" or ")}</h3>
                  <p className="text-sm text-white/85 leading-relaxed">{quizResult.note}</p>
                  <button
                    onClick={() => { setQuizStep(0); setQuizAnswers([]); setQuizDone(false); }}
                    className="mt-4 bg-white/20 hover:bg-white/30 text-white text-xs font-black px-4 py-2 rounded-xl transition-all"
                  >
                    ↺ Retake Quiz
                  </button>
                </div>

                {/* Matched career cards */}
                {recommendedCareers.map(career => (
                  <div key={career.id} className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 p-5 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${career.grad} flex items-center justify-center text-2xl shadow-md`}>{career.icon}</div>
                      <div>
                        <h3 className="text-base font-black text-slate-800 dark:text-white">{career.title}</h3>
                        <p className="text-xs text-slate-500 font-medium">{career.path}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">{career.description}</p>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                      <p className="text-[9px] font-black uppercase text-indigo-500 mb-1">💡 Your Next Step</p>
                      <p className="text-[10px] text-indigo-700 dark:text-indigo-300 font-medium">{career.proTip}</p>
                    </div>
                    <button
                      onClick={() => { setActiveTab("explore"); setExpandedCareer(career.id); setSelectedCategory("All"); }}
                      className={`mt-3 text-xs font-black px-4 py-2 rounded-xl text-white bg-gradient-to-r ${career.grad}`}
                    >
                      View Full Details →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: EXAM CALENDAR ───────────────────────────────────────────── */}
        {activeTab === "exams" && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-100 dark:border-amber-900/40">
              <p className="text-xs font-black text-amber-700 dark:text-amber-300">
                📢 Dates below are indicative for 2025–26. Always verify on the official exam body website before applying.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {EXAMS.map(exam => (
                <div key={exam.name} className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${exam.color} flex items-center justify-center text-white text-lg font-black shrink-0`}>
                      📝
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-800 dark:text-white">{exam.name}</h3>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500">{exam.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{exam.body}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-start gap-1.5 text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                          <span className="text-emerald-500 font-black mt-0.5">✓</span> {exam.for}
                        </div>
                        <div className="flex items-start gap-1.5 text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                          <span className="text-sky-500 font-black mt-0.5">✓</span> {exam.eligibility}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Preparation Resources */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 p-5">
              <h3 className="text-sm font-black text-slate-800 dark:text-white mb-4">📚 Free Preparation Resources</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: "NTA Official (NEET/JEE)", desc: "Official mock tests, past papers", url: "https://nta.ac.in", color: "rose" },
                  { name: "Khan Academy India", desc: "Free NEET & JEE video lessons", url: "https://khanacademy.org", color: "blue" },
                  { name: "TNPSC Exam Portal", desc: "TNPSC Group exams, syllabus, schedule", url: "https://tnpsc.gov.in", color: "violet" },
                  { name: "Anna University TNEA", desc: "TN engineering admission portal", url: "https://tneaonline.org", color: "sky" },
                  { name: "CLAT Consortium", desc: "Law entrance exam resources", url: "https://consortiumofnlus.ac.in", color: "amber" },
                  { name: "IBPS Official", desc: "Bank PO/Clerk exam & notifications", url: "https://ibps.in", color: "emerald" },
                ].map(r => (
                  <a key={r.name} href={r.url} target="_blank" rel="noreferrer"
                    className={`flex items-start gap-3 p-3 rounded-2xl bg-${r.color}-50 dark:bg-${r.color}-950/30 border border-${r.color}-100 dark:border-${r.color}-900/30 hover:scale-[1.01] transition-all`}>
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br from-${r.color}-400 to-${r.color}-600 flex items-center justify-center text-white text-xs font-black shrink-0`}>🔗</div>
                    <div>
                      <p className="text-xs font-black text-slate-700 dark:text-slate-200">{r.name}</p>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{r.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: TN COLLEGES ─────────────────────────────────────────────── */}
        {activeTab === "colleges" && (
          <div className="space-y-4">
            {[
              {
                category: "🔬 Engineering & Technology",
                colleges: [
                  { name: "IIT Madras", location: "Chennai", rank: "#1 NIRF India", type: "Central", for: "JEE Advanced" },
                  { name: "NIT Trichy", location: "Tiruchirappalli", rank: "#10 NIRF India", type: "Central", for: "JEE Main" },
                  { name: "Anna University (CEG)", location: "Chennai", rank: "#1 in TN", type: "State", for: "TNEA" },
                  { name: "PSG Tech", location: "Coimbatore", rank: "A++ NAAC", type: "Autonomous", for: "TNEA / JEE" },
                  { name: "SASTRA University", location: "Thanjavur", rank: "NIRF Top 50", type: "Deemed", for: "SASTRA Entrance" },
                  { name: "VIT Vellore", location: "Vellore", rank: "NIRF Top 20", type: "Deemed", for: "VITEEE" },
                ],
              },
              {
                category: "🩺 Medical",
                colleges: [
                  { name: "AIIMS Madurai", location: "Madurai", rank: "Central Govt", type: "Central", for: "NEET 700+" },
                  { name: "JIPMER", location: "Puducherry", rank: "NIRF Top 3 Medical", type: "Central", for: "NEET 650+" },
                  { name: "Madras Medical College (MMC)", location: "Chennai", rank: "#1 in TN Medical", type: "State Govt", for: "NEET + Rank" },
                  { name: "Stanley Medical College", location: "Chennai", rank: "Top 5 TN", type: "State Govt", for: "NEET + Rank" },
                  { name: "Kilpauk Medical College", location: "Chennai", rank: "Top 5 TN", type: "State Govt", for: "NEET + Rank" },
                ],
              },
              {
                category: "⚖️ Law",
                colleges: [
                  { name: "Tamil Nadu National Law University (TNNLU)", location: "Tiruchirappalli", rank: "NLU Rank 12", type: "State NLU", for: "CLAT 600+" },
                  { name: "Madras Law College", location: "Chennai", rank: "Oldest in Asia", type: "State Govt", for: "TN Law Entrance" },
                  { name: "School of Excellence in Law", location: "Chennai", rank: "A Grade", type: "State Govt", for: "TN Law Entrance" },
                ],
              },
              {
                category: "📊 Commerce & Management",
                colleges: [
                  { name: "Loyola College", location: "Chennai", rank: "A++ NAAC", type: "Autonomous", for: "Merit / Entrance" },
                  { name: "Stella Maris College", location: "Chennai", rank: "A++ NAAC", type: "Autonomous", for: "Merit" },
                  { name: "PSG Arts & Science", location: "Coimbatore", rank: "A++ NAAC", type: "Autonomous", for: "Merit" },
                ],
              },
              {
                category: "🌾 Agriculture",
                colleges: [
                  { name: "Tamil Nadu Agricultural University (TNAU)", location: "Coimbatore", rank: "#1 Agriculture TN", type: "State", for: "TNAU Entrance" },
                  { name: "Agri College Madurai", location: "Madurai", rank: "Top 3 TN", type: "State", for: "TNAU Entrance" },
                  { name: "Forest College Mettupalayam", location: "Mettupalayam", rank: "Unique in TN", type: "State", for: "TNAU Entrance" },
                ],
              },
            ].map(section => (
              <div key={section.category} className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 p-5 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 dark:text-white mb-4">{section.category}</h3>
                <div className="space-y-2">
                  {section.colleges.map((college, i) => (
                    <div key={college.name} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200 truncate">{college.name}</p>
                        <p className="text-[9px] text-slate-400 font-medium">{college.location} · {college.type} · {college.rank}</p>
                      </div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 shrink-0">{college.for}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          <Link href="/student/ai-tutor" className="text-xs font-black px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300">🤖 Ask AI Tutor</Link>
          <Link href="/student/science-library" className="text-xs font-black px-3 py-1.5 rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-900/40 dark:text-sky-300">📚 Book Library</Link>
          <Link href="/student/science-campus" className="text-xs font-black px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300">🧪 Science Campus</Link>
        </div>
      </div>
    </PortalLayout>
  );
}
