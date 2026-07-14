// ============================================================================
// Competitive Examination Preparation — Classes 11 & 12.
// Each higher-secondary group gets its own set of exam preparation modules
// (NEET / JEE / CUET / Government exams / other entrances). Every module
// carries the data for the six prep features: AI study plans, mock exams,
// question banks, performance analysis, rank prediction and weak-topic
// analysis. Demo data — swap with API data when the backend endpoint lands.
// ============================================================================

import type { Stream } from "./scienceCenters";

export type PrepSubject = {
  name: string;
  icon: string;
  percent: number; // syllabus mastery %
  color: string;
  strong: string;
  weak: string;
};

export type PrepMock = {
  name: string;
  date: string;
  duration: string;
  score?: string;
  status: "Upcoming" | "Completed";
};

export type ExamModule = {
  id: string;
  name: string; // tab label
  fullName: string;
  icon: string;
  color: string; // tailwind-safe hex accent
  desc: string;
  daysToExam: number;
  target: string;
  targetLabel: string;
  rankPrediction: string;
  subjects: PrepSubject[];
  mocks: PrepMock[];
  questionBank: { topic: string; questions: number }[];
  weakTopics: { topic: string; note: string }[];
};

export const EXAM_MODULES: Record<string, ExamModule> = {
  neet: {
    id: "neet",
    name: "NEET",
    fullName: "NEET (Medical)",
    icon: "🩺",
    color: "#ef4444",
    desc: "All India medical entrance — MBBS, BDS, AYUSH & veterinary seats.",
    daysToExam: 120,
    target: "650+",
    targetLabel: "Target Score / 720",
    rankPrediction: "Top 5% (State)",
    subjects: [
      { name: "Physics", icon: "⚛️", percent: 68, color: "#3b82f6", strong: "Optics", weak: "Thermodynamics" },
      { name: "Chemistry", icon: "🧪", percent: 85, color: "#10b981", strong: "Organic", weak: "Equilibrium" },
      { name: "Biology", icon: "🧬", percent: 92, color: "#ec4899", strong: "Genetics", weak: "Plant Physiology" },
    ],
    mocks: [
      { name: "NEET Full Syllabus Mock 4", date: "Coming Sunday, 10:00 AM", duration: "3 Hours", status: "Upcoming" },
      { name: "NEET Part Test: Human Physiology", date: "Yesterday", duration: "1 Hour", score: "280/360", status: "Completed" },
      { name: "NEET Previous Year 2024", date: "Last Week", duration: "3 Hours", score: "612/720", status: "Completed" },
    ],
    questionBank: [
      { topic: "Human Physiology", questions: 480 },
      { topic: "Organic Chemistry", questions: 350 },
      { topic: "Mechanics & Waves", questions: 310 },
      { topic: "Genetics & Evolution", questions: 260 },
    ],
    weakTopics: [
      { topic: "Thermodynamics (Physics)", note: "Accuracy dropped to 45% in the last 2 mocks. A 20-question targeted set is ready." },
      { topic: "Plant Physiology (Biology)", note: "Frequent errors in transport & photosynthesis MCQs — revise with diagram flashcards." },
    ],
  },
  jee: {
    id: "jee",
    name: "JEE",
    fullName: "JEE Main & Advanced (Engineering)",
    icon: "⚙️",
    color: "#3b82f6",
    desc: "National engineering entrance — NITs, IIITs and IITs.",
    daysToExam: 95,
    target: "99",
    targetLabel: "Target Percentile",
    rankPrediction: "Top 8% (National)",
    subjects: [
      { name: "Physics", icon: "⚛️", percent: 72, color: "#3b82f6", strong: "Electrostatics", weak: "Rotational Motion" },
      { name: "Chemistry", icon: "🧪", percent: 80, color: "#10b981", strong: "Physical", weak: "Coordination Compounds" },
      { name: "Mathematics", icon: "📐", percent: 64, color: "#8b5cf6", strong: "Calculus", weak: "Probability" },
    ],
    mocks: [
      { name: "JEE Main Full Mock 6", date: "Saturday, 2:00 PM", duration: "3 Hours", status: "Upcoming" },
      { name: "JEE Main Previous Year 2024", date: "Last Week", duration: "3 Hours", score: "185/300", status: "Completed" },
      { name: "Part Test: Calculus & Algebra", date: "2 weeks ago", duration: "1.5 Hours", score: "72/100", status: "Completed" },
    ],
    questionBank: [
      { topic: "Calculus", questions: 420 },
      { topic: "Mechanics", questions: 380 },
      { topic: "Physical Chemistry", questions: 300 },
      { topic: "Algebra & Probability", questions: 280 },
    ],
    weakTopics: [
      { topic: "Probability (Maths)", note: "Conditional probability questions take you 2× the average time — practice the shortcut set." },
      { topic: "Rotational Motion (Physics)", note: "Torque & angular momentum accuracy at 48% — watch the concept video then retry 15 MCQs." },
    ],
  },
  cuet: {
    id: "cuet",
    name: "CUET",
    fullName: "CUET (Central Universities)",
    icon: "🎓",
    color: "#8b5cf6",
    desc: "Common University Entrance Test for central & participating universities.",
    daysToExam: 140,
    target: "700+",
    targetLabel: "Target Score / 800",
    rankPrediction: "Top 10% (National)",
    subjects: [
      { name: "English Language", icon: "🗣️", percent: 78, color: "#3b82f6", strong: "Comprehension", weak: "Vocabulary" },
      { name: "Domain Subjects", icon: "📚", percent: 70, color: "#8b5cf6", strong: "Core Concepts", weak: "Application MCQs" },
      { name: "General Test", icon: "🧠", percent: 62, color: "#f59e0b", strong: "Current Affairs", weak: "Quantitative Reasoning" },
    ],
    mocks: [
      { name: "CUET General Test Mock 3", date: "Next Monday, 9:00 AM", duration: "1 Hour", status: "Upcoming" },
      { name: "CUET Domain Mock: Slot 1", date: "Last Friday", duration: "45 Mins", score: "162/200", status: "Completed" },
      { name: "CUET English Sectional", date: "2 weeks ago", duration: "45 Mins", score: "44/50", status: "Completed" },
    ],
    questionBank: [
      { topic: "Reading Comprehension", questions: 260 },
      { topic: "Domain Subject MCQs", questions: 400 },
      { topic: "Logical Reasoning", questions: 240 },
      { topic: "Quantitative Aptitude", questions: 220 },
    ],
    weakTopics: [
      { topic: "Quantitative Reasoning", note: "Speed-maths drills recommended — 10 minutes daily raises General Test score fastest." },
      { topic: "Vocabulary", note: "Missed 6/10 synonym-antonym questions — daily word list scheduled in your study plan." },
    ],
  },
  govt: {
    id: "govt",
    name: "Govt Exams",
    fullName: "Government Examinations",
    icon: "🏛️",
    color: "#10b981",
    desc: "TNPSC, SSC, Railways, Banking, Police & UPSC foundation preparation.",
    daysToExam: 180,
    target: "Merit",
    targetLabel: "Target: Merit List",
    rankPrediction: "On track (Cut-off +12%)",
    subjects: [
      { name: "Quantitative Aptitude", icon: "🔢", percent: 66, color: "#3b82f6", strong: "Percentages", weak: "Data Interpretation" },
      { name: "Reasoning", icon: "🧩", percent: 74, color: "#8b5cf6", strong: "Series & Coding", weak: "Puzzles" },
      { name: "General Knowledge", icon: "🌍", percent: 58, color: "#f59e0b", strong: "TN History", weak: "Polity & Economy" },
      { name: "Language (Tamil/English)", icon: "🗣️", percent: 82, color: "#10b981", strong: "Grammar", weak: "Precis Writing" },
    ],
    mocks: [
      { name: "TNPSC Group IV Pattern Mock", date: "Sunday, 10:00 AM", duration: "3 Hours", status: "Upcoming" },
      { name: "SSC CHSL Sectional: Reasoning", date: "Last Week", duration: "1 Hour", score: "42/50", status: "Completed" },
      { name: "Banking Prelims Pattern Mock", date: "2 weeks ago", duration: "1 Hour", score: "68/100", status: "Completed" },
    ],
    questionBank: [
      { topic: "TN History & Culture", questions: 320 },
      { topic: "Indian Polity", questions: 280 },
      { topic: "Aptitude & DI", questions: 360 },
      { topic: "Reasoning Puzzles", questions: 300 },
    ],
    weakTopics: [
      { topic: "Polity & Economy (GK)", note: "Scores below 50% — a 7-day constitution crash plan has been added to your study plan." },
      { topic: "Data Interpretation", note: "Table & graph questions are slow — practice 5 DI sets with a timer this week." },
    ],
  },
  nda: {
    id: "nda",
    name: "NDA & Defence",
    fullName: "NDA & Defence Entrances",
    icon: "🛡️",
    color: "#f59e0b",
    desc: "National Defence Academy, Agnipath & other defence services entrances.",
    daysToExam: 150,
    target: "480+",
    targetLabel: "Target Score / 900",
    rankPrediction: "Qualifying range",
    subjects: [
      { name: "Mathematics", icon: "📐", percent: 60, color: "#8b5cf6", strong: "Trigonometry", weak: "Vectors" },
      { name: "General Ability", icon: "🧠", percent: 71, color: "#f59e0b", strong: "English", weak: "Current Affairs" },
      { name: "Physical Fitness", icon: "💪", percent: 88, color: "#10b981", strong: "Endurance", weak: "Consistency Log" },
    ],
    mocks: [
      { name: "NDA Maths Paper Mock 2", date: "Saturday, 9:00 AM", duration: "2.5 Hours", status: "Upcoming" },
      { name: "NDA GAT Previous Year", date: "Last Week", duration: "2.5 Hours", score: "388/600", status: "Completed" },
    ],
    questionBank: [
      { topic: "NDA Mathematics", questions: 340 },
      { topic: "English & GK", questions: 300 },
      { topic: "Defence Current Affairs", questions: 180 },
    ],
    weakTopics: [
      { topic: "Vectors (Maths)", note: "Only 40% accuracy — a basics-first practice ladder is queued in your plan." },
    ],
  },
  tech: {
    id: "tech",
    name: "Tech Entrances",
    fullName: "Other Technology Entrances",
    icon: "💻",
    color: "#06b6d4",
    desc: "BITSAT, VITEEE, SRMJEE and state engineering / CS entrances.",
    daysToExam: 110,
    target: "320+",
    targetLabel: "Target Score (BITSAT)",
    rankPrediction: "Top 12%",
    subjects: [
      { name: "Physics", icon: "⚛️", percent: 70, color: "#3b82f6", strong: "Current Electricity", weak: "Modern Physics" },
      { name: "Mathematics", icon: "📐", percent: 66, color: "#8b5cf6", strong: "Matrices", weak: "Coordinate Geometry" },
      { name: "English & Reasoning", icon: "🧠", percent: 81, color: "#f59e0b", strong: "Grammar", weak: "Syllogisms" },
    ],
    mocks: [
      { name: "BITSAT Pattern Mock 3", date: "Sunday, 2:00 PM", duration: "3 Hours", status: "Upcoming" },
      { name: "VITEEE Pattern Mock", date: "Last Week", duration: "2.5 Hours", score: "92/125", status: "Completed" },
    ],
    questionBank: [
      { topic: "Speed Physics MCQs", questions: 300 },
      { topic: "Maths Shortcuts", questions: 280 },
      { topic: "English & Logic", questions: 200 },
    ],
    weakTopics: [
      { topic: "Modern Physics", note: "Photoelectric & nuclei questions missed in both mocks — concept video + 12 MCQs queued." },
    ],
  },
  ca: {
    id: "ca",
    name: "CA Foundation",
    fullName: "CA / CS / CMA Foundation",
    icon: "🧾",
    color: "#f59e0b",
    desc: "Chartered Accountancy, Company Secretary & Cost Accountancy foundations.",
    daysToExam: 160,
    target: "50%+",
    targetLabel: "Target: All papers 50%+",
    rankPrediction: "Pass range (AIR possible)",
    subjects: [
      { name: "Accounting", icon: "🧾", percent: 76, color: "#10b981", strong: "Journal & Ledger", weak: "Partnership Accounts" },
      { name: "Business Law", icon: "⚖️", percent: 61, color: "#8b5cf6", strong: "Contract Act", weak: "Companies Act" },
      { name: "Quantitative Aptitude", icon: "🔢", percent: 58, color: "#3b82f6", strong: "Ratios", weak: "Statistics" },
      { name: "Business Economics", icon: "📊", percent: 72, color: "#f59e0b", strong: "Demand & Supply", weak: "National Income" },
    ],
    mocks: [
      { name: "CA Foundation Accounts Mock", date: "Sunday, 10:00 AM", duration: "3 Hours", status: "Upcoming" },
      { name: "Business Law Sectional", date: "Last Week", duration: "1.5 Hours", score: "54/100", status: "Completed" },
    ],
    questionBank: [
      { topic: "Accounting Practice Sets", questions: 380 },
      { topic: "Law Case MCQs", questions: 260 },
      { topic: "Quant & Stats", questions: 300 },
    ],
    weakTopics: [
      { topic: "Companies Act (Law)", note: "Section-based MCQs below 50% — memory cards added to your daily plan." },
      { topic: "Statistics (Quant)", note: "Correlation & index numbers need practice — 15-question drill scheduled." },
    ],
  },
  clat: {
    id: "clat",
    name: "CLAT (Law)",
    fullName: "CLAT & Law Entrances",
    icon: "⚖️",
    color: "#f59e0b",
    desc: "Common Law Admission Test for National Law Universities & TNDALU.",
    daysToExam: 170,
    target: "95+",
    targetLabel: "Target Score / 120",
    rankPrediction: "NLU seat range",
    subjects: [
      { name: "Legal Reasoning", icon: "⚖️", percent: 69, color: "#8b5cf6", strong: "Torts", weak: "Constitutional Law" },
      { name: "Logical Reasoning", icon: "🧩", percent: 73, color: "#3b82f6", strong: "Arguments", weak: "Critical Reasoning" },
      { name: "English", icon: "🗣️", percent: 80, color: "#10b981", strong: "Comprehension", weak: "Inference Questions" },
      { name: "Current Affairs & GK", icon: "🌍", percent: 55, color: "#f59e0b", strong: "TN Affairs", weak: "International News" },
    ],
    mocks: [
      { name: "CLAT Full Mock 5", date: "Sunday, 3:00 PM", duration: "2 Hours", status: "Upcoming" },
      { name: "Legal Reasoning Sectional", date: "Last Week", duration: "40 Mins", score: "24/32", status: "Completed" },
    ],
    questionBank: [
      { topic: "Legal Passages", questions: 280 },
      { topic: "Critical Reasoning", questions: 240 },
      { topic: "Current Affairs", questions: 320 },
    ],
    weakTopics: [
      { topic: "Current Affairs", note: "International news accuracy at 40% — daily 10-minute news digest added to your plan." },
    ],
  },
  poly: {
    id: "poly",
    name: "Skill Entrances",
    fullName: "Polytechnic & Skill Entrances",
    icon: "🔧",
    color: "#f97316",
    desc: "Polytechnic lateral entry, ITI advanced trades & skill certifications.",
    daysToExam: 130,
    target: "Merit",
    targetLabel: "Target: Merit Admission",
    rankPrediction: "On track",
    subjects: [
      { name: "Trade Theory", icon: "🛠️", percent: 77, color: "#f97316", strong: "Safety & Tools", weak: "Circuit Diagrams" },
      { name: "Basic Mathematics", icon: "📐", percent: 63, color: "#8b5cf6", strong: "Mensuration", weak: "Algebra" },
      { name: "Aptitude", icon: "🧠", percent: 70, color: "#3b82f6", strong: "Spatial Reasoning", weak: "Numerical Speed" },
    ],
    mocks: [
      { name: "Polytechnic Entrance Pattern Mock", date: "Saturday, 10:00 AM", duration: "2 Hours", status: "Upcoming" },
      { name: "Trade Theory Sectional", date: "Last Week", duration: "1 Hour", score: "38/50", status: "Completed" },
    ],
    questionBank: [
      { topic: "Trade Theory MCQs", questions: 300 },
      { topic: "Basic Maths", questions: 260 },
      { topic: "Aptitude Practice", questions: 220 },
    ],
    weakTopics: [
      { topic: "Circuit Diagrams", note: "Symbol identification errors — the Electrical Lab has a practice module linked in your plan." },
    ],
  },
};

// Which exam modules each higher-secondary group sees (order = tab order).
export const GROUP_EXAM_MODULES: Record<Stream, string[]> = {
  Science: ["neet", "jee", "cuet", "nda", "govt"],
  ComputerScience: ["jee", "tech", "cuet", "govt"],
  Commerce: ["ca", "cuet", "govt"],
  Arts: ["clat", "cuet", "govt"],
  Vocational: ["poly", "govt", "cuet"],
};

// The six preparation features shown in the hero strip.
export const PREP_FEATURES = [
  { icon: "🤖", label: "AI Study Plans" },
  { icon: "📝", label: "Mock Examinations" },
  { icon: "📚", label: "Question Banks" },
  { icon: "📊", label: "Performance Analysis" },
  { icon: "🏆", label: "Rank Prediction" },
  { icon: "🎯", label: "Weak-Topic Analysis" },
];
