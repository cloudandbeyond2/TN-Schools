"use client";

import React, { useState, useMemo } from "react";
import PortalLayout from "@/components/PortalLayout";
import { 
  Trophy, BookOpen, HelpCircle, ClipboardCheck, ArrowLeft, Plus, Search, 
  Settings, CheckCircle, XCircle, Sliders, ExternalLink, Zap, Shield, Microscope,
  FileText, Activity, Layers, Calendar, Clock, BarChart2, Check
} from "lucide-react";
import Swal from "sweetalert2";

// ============================================================================
// High-Fidelity Mock Database for post-12th Competitive Exams
// ============================================================================

interface Chapter {
  id: string;
  name: string;
  concepts: string[];
}

interface SyllabusSubject {
  name: string;
  icon: string;
  color: string;
  chapters: Chapter[];
}

interface ConceptTopic {
  id: string;
  subject: string;
  conceptName: string;
  weightage: "High" | "Medium" | "Low";
  pyqQuestions: number;
  aiMapped: boolean;
  studyMaterials: { pdfs: number; videos: number };
  active: boolean;
}

interface QuizItem {
  id: string;
  title: string;
  subject: string;
  questionsCount: number;
  durationMinutes: number;
  difficulty: "Easy" | "Medium" | "Hard";
  submissions: number;
}

interface MockTestItem {
  id: string;
  title: string;
  questionsCount: number;
  durationHours: number;
  status: "Scheduled" | "Completed";
  registeredCount: number;
  date: string;
}

interface ExamDetail {
  id: string;
  name: string;
  fullName: string;
  category: string;
  conductedBy: string;
  eligibility: string;
  website: string;
  examDate: string;
  regDeadline: string;
  syllabus: SyllabusSubject[];
  topics: ConceptTopic[];
  quizzes: QuizItem[];
  mocks: MockTestItem[];
}

const EXAMS_DATABASE: Record<string, ExamDetail> = {
  "neet-ug": {
    id: "neet-ug",
    name: "NEET UG",
    fullName: "National Eligibility cum Entrance Test (UG)",
    category: "Medical",
    conductedBy: "National Testing Agency (NTA)",
    eligibility: "10+2 with Physics, Chemistry, Biology/Biotechnology. Minimum age 17 years.",
    website: "https://neet.nta.nic.in",
    examDate: "May 3, 2026",
    regDeadline: "March 15, 2026",
    syllabus: [
      {
        name: "Biology",
        icon: "🧬",
        color: "text-pink-500 bg-pink-500/10",
        chapters: [
          { id: "b1", name: "Genetics and Evolution", concepts: ["Mendelian Inheritance", "Molecular Basis of Inheritance", "DNA Replication", "Transcription & Translation", "Evolutionary Theories"] },
          { id: "b2", name: "Human Physiology", concepts: ["Breathing and Respiration", "Body Fluids and Circulation", "Excretory Products", "Neural Control", "Chemical Coordination"] },
          { id: "b3", name: "Plant Physiology", concepts: ["Photosynthesis in Higher Plants", "Respiration in Plants", "Plant Growth & Development", "Mineral Nutrition"] },
          { id: "b4", name: "Cell Structure & Function", concepts: ["Cell Cycle & Division", "Biomolecules", "Cell Organelles"] }
        ]
      },
      {
        name: "Chemistry",
        icon: "🧪",
        color: "text-emerald-500 bg-emerald-500/10",
        chapters: [
          { id: "c1", name: "Organic Chemistry", concepts: ["Hydrocarbons", "Alcohols, Phenols & Ethers", "Aldehydes, Ketones & Acids", "Amines", "Biomolecules"] },
          { id: "c2", name: "Inorganic Chemistry", concepts: ["Chemical Bonding", "Coordination Compounds", "d- and f-Block Elements", "p-Block Elements"] },
          { id: "c3", name: "Physical Chemistry", concepts: ["Chemical Kinetics", "Electrochemistry", "Thermodynamics", "Solutions", "Equilibrium"] }
        ]
      },
      {
        name: "Physics",
        icon: "⚛️",
        color: "text-blue-500 bg-blue-500/10",
        chapters: [
          { id: "p1", name: "Mechanics", concepts: ["Laws of Motion", "Work, Energy & Power", "System of Particles & Rotational Motion", "Gravitation"] },
          { id: "p2", name: "Electrodynamics", concepts: ["Electrostatics", "Current Electricity", "Magnetic Effects of Current", "Electromagnetic Induction & AC"] },
          { id: "p3", name: "Modern Physics & Optics", concepts: ["Dual Nature of Matter", "Atoms & Nuclei", "Semiconductor Electronics", "Ray & Wave Optics"] }
        ]
      }
    ],
    topics: [
      { id: "nt1", subject: "Biology", conceptName: "Molecular Basis of Inheritance", weightage: "High", pyqQuestions: 48, aiMapped: true, studyMaterials: { pdfs: 14, videos: 6 }, active: true },
      { id: "nt2", subject: "Biology", conceptName: "Mendelian Genetics", weightage: "High", pyqQuestions: 35, aiMapped: true, studyMaterials: { pdfs: 10, videos: 4 }, active: true },
      { id: "nt3", subject: "Biology", conceptName: "Chemical Coordination & Integration", weightage: "Medium", pyqQuestions: 22, aiMapped: true, studyMaterials: { pdfs: 8, videos: 3 }, active: true },
      { id: "nt4", subject: "Chemistry", conceptName: "Coordination Compounds", weightage: "High", pyqQuestions: 28, aiMapped: true, studyMaterials: { pdfs: 9, videos: 5 }, active: true },
      { id: "nt5", subject: "Chemistry", conceptName: "Chemical Kinetics", weightage: "Medium", pyqQuestions: 19, aiMapped: false, studyMaterials: { pdfs: 6, videos: 2 }, active: true },
      { id: "nt6", subject: "Chemistry", conceptName: "Aldehydes, Ketones & Carboxylic Acids", weightage: "High", pyqQuestions: 32, aiMapped: true, studyMaterials: { pdfs: 12, videos: 4 }, active: true },
      { id: "nt7", subject: "Physics", conceptName: "Current Electricity", weightage: "High", pyqQuestions: 41, aiMapped: true, studyMaterials: { pdfs: 15, videos: 8 }, active: true },
      { id: "nt8", subject: "Physics", conceptName: "Electrostatic Potential & Capacitance", weightage: "Medium", pyqQuestions: 26, aiMapped: true, studyMaterials: { pdfs: 8, videos: 3 }, active: true },
      { id: "nt9", subject: "Physics", conceptName: "Rotational Motion Dynamics", weightage: "High", pyqQuestions: 30, aiMapped: false, studyMaterials: { pdfs: 11, videos: 5 }, active: false }
    ],
    quizzes: [
      { id: "nq1", title: "Molecular Genetics Challenger Quiz", subject: "Biology", questionsCount: 25, durationMinutes: 30, difficulty: "Hard", submissions: 1240 },
      { id: "nq2", title: "Organic Reactions & Mechanisms Speedrun", subject: "Chemistry", questionsCount: 20, durationMinutes: 20, difficulty: "Medium", submissions: 980 },
      { id: "nq3", title: "Electrostatics and Circuits Basics", subject: "Physics", questionsCount: 15, durationMinutes: 15, difficulty: "Easy", submissions: 1520 },
      { id: "nq4", title: "Human Physiology Comprehensive Test", subject: "Biology", questionsCount: 30, durationMinutes: 30, difficulty: "Medium", submissions: 2110 },
      { id: "nq5", title: "Rotational Mechanics Advanced Drill", subject: "Physics", questionsCount: 15, durationMinutes: 25, difficulty: "Hard", submissions: 650 }
    ],
    mocks: [
      { id: "nm1", title: "All India NEET UG Full Syllabus Mock Test 1", questionsCount: 180, durationHours: 3, status: "Scheduled", registeredCount: 14850, date: "2026-08-10" },
      { id: "nm2", title: "State-Level Biology Sectional Mock Exam", questionsCount: 90, durationHours: 1.5, status: "Completed", registeredCount: 9320, date: "2026-06-24" },
      { id: "nm3", title: "NEET UG Official 2025 Solved PYQ Mock Paper", questionsCount: 180, durationHours: 3, status: "Completed", registeredCount: 24890, date: "2026-05-05" },
      { id: "nm4", title: "Physics & Chemistry High-Yield Mock Series 2", questionsCount: 90, durationHours: 1.5, status: "Scheduled", registeredCount: 5210, date: "2026-09-12" }
    ]
  },
  "jee-main": {
    id: "jee-main",
    name: "JEE Main",
    fullName: "Joint Entrance Examination (Main)",
    category: "Engineering",
    conductedBy: "National Testing Agency (NTA)",
    eligibility: "10+2 with Physics, Chemistry, Mathematics (PCM). Gateway to NITs, IIITs & JEE Advanced.",
    website: "https://jeemain.nta.nic.in",
    examDate: "January 18, 2026",
    regDeadline: "November 22, 2025",
    syllabus: [
      {
        name: "Mathematics",
        icon: "📐",
        color: "text-purple-500 bg-purple-500/10",
        chapters: [
          { id: "jm1", name: "Calculus", concepts: ["Limits, Continuity & Differentiability", "Integral Calculus", "Differential Equations"] },
          { id: "jm2", name: "Algebra", concepts: ["Matrices & Determinants", "Quadratic Equations", "Probability", "Complex Numbers"] },
          { id: "jm3", name: "Coordinate Geometry", concepts: ["Straight Lines", "Conic Sections", "Vector Algebra", "3D Geometry"] }
        ]
      },
      {
        name: "Physics",
        icon: "⚛️",
        color: "text-blue-500 bg-blue-500/10",
        chapters: [
          { id: "jp1", name: "Mechanics", concepts: ["Kinematics", "Laws of Motion & Work", "Rotational Dynamics", "Fluids & Properties"] },
          { id: "jp2", name: "Electromagnetism", concepts: ["Electrostatics", "Current Electricity", "Magnetic Effects", "EMI & AC"] },
          { id: "jp3", name: "Modern Physics", concepts: ["Photoelectric Effect", "Atomic Structure & Nuclear Physics", "Semiconductors"] }
        ]
      },
      {
        name: "Chemistry",
        icon: "🧪",
        color: "text-emerald-500 bg-emerald-500/10",
        chapters: [
          { id: "jc1", name: "Physical Chemistry", concepts: ["Atomic Structure", "Thermodynamics", "Chemical Kinetics", "Electrochemistry"] },
          { id: "jc2", name: "Organic Chemistry", concepts: ["Hydrocarbons", "Isomerism", "Functional Groups", "Polymers"] },
          { id: "jc3", name: "Inorganic Chemistry", concepts: ["Periodic Properties", "Chemical Bonding", "Coordination Chemistry"] }
        ]
      }
    ],
    topics: [
      { id: "jt1", subject: "Mathematics", conceptName: "Integral Calculus", weightage: "High", pyqQuestions: 38, aiMapped: true, studyMaterials: { pdfs: 16, videos: 5 }, active: true },
      { id: "jt2", subject: "Mathematics", conceptName: "Matrices & Determinants", weightage: "High", pyqQuestions: 29, aiMapped: true, studyMaterials: { pdfs: 10, videos: 3 }, active: true },
      { id: "jt3", subject: "Mathematics", conceptName: "3D Geometry", weightage: "High", pyqQuestions: 32, aiMapped: true, studyMaterials: { pdfs: 11, videos: 4 }, active: true },
      { id: "jt4", subject: "Physics", conceptName: "Semiconductor Electronics", weightage: "Medium", pyqQuestions: 18, aiMapped: true, studyMaterials: { pdfs: 6, videos: 2 }, active: true },
      { id: "jt5", subject: "Physics", conceptName: "Modern Physics (Atoms/Nuclei)", weightage: "High", pyqQuestions: 36, aiMapped: true, studyMaterials: { pdfs: 12, videos: 6 }, active: true },
      { id: "jt6", subject: "Chemistry", conceptName: "Chemical Kinetics & Equilibrium", weightage: "High", pyqQuestions: 24, aiMapped: false, studyMaterials: { pdfs: 7, videos: 3 }, active: true }
    ],
    quizzes: [
      { id: "jq1", title: "Calculus & Limits Sprint Drill", subject: "Mathematics", questionsCount: 15, durationMinutes: 20, difficulty: "Hard", submissions: 850 },
      { id: "jq2", title: "Modern Physics Atoms & Nuclei", subject: "Physics", questionsCount: 15, durationMinutes: 15, difficulty: "Easy", submissions: 1100 },
      { id: "jq3", title: "Coordination Compounds Nomenclature", subject: "Chemistry", questionsCount: 10, durationMinutes: 15, difficulty: "Medium", submissions: 760 }
    ],
    mocks: [
      { id: "jm_mock1", title: "JEE Main Full Syllabus Mock Series A", questionsCount: 90, durationHours: 3, status: "Scheduled", registeredCount: 9810, date: "2026-07-28" },
      { id: "jm_mock2", title: "JEE Main 2025 Official January Paper", questionsCount: 90, durationHours: 3, status: "Completed", registeredCount: 16420, date: "2026-01-22" }
    ]
  },
  "jipmer-ahs": {
    id: "jipmer-ahs",
    name: "JIPMER AHS",
    fullName: "JIPMER Allied Health Sciences Entrance",
    category: "Medical",
    conductedBy: "Jawaharlal Institute of Postgraduate Medical Education & Research",
    eligibility: "10+2 with PCB and English. Minimum 50% marks in aggregate.",
    website: "https://jipmer.edu.in",
    examDate: "June 21, 2026",
    regDeadline: "May 10, 2026",
    syllabus: [
      {
        name: "Biology",
        icon: "🧬",
        color: "text-pink-500 bg-pink-500/10",
        chapters: [
          { id: "jb1", name: "Human Anatomy", concepts: ["Skeletal System", "Muscular System", "Organ Systems Overview"] },
          { id: "jb2", name: "Cellular Biology", concepts: ["Cell Structure", "Cell Transport", "Biochemistry Basics"] }
        ]
      },
      {
        name: "Physics & Chemistry",
        icon: "🧪",
        color: "text-blue-500 bg-blue-500/10",
        chapters: [
          { id: "jp1", name: "Applied Physics", concepts: ["Fluid Mechanics", "Radiation Physics", "Optical Instruments"] },
          { id: "jc1", name: "Applied Chemistry", concepts: ["Organic Chemistry", "Analytical Chemistry", "Solutions"] }
        ]
      }
    ],
    topics: [
      { id: "ji1", subject: "Biology", conceptName: "Human Anatomy Systems", weightage: "High", pyqQuestions: 22, aiMapped: true, studyMaterials: { pdfs: 8, videos: 3 }, active: true },
      { id: "ji2", subject: "Physics & Chemistry", conceptName: "Radiation Physics & Safety", weightage: "High", pyqQuestions: 15, aiMapped: false, studyMaterials: { pdfs: 4, videos: 1 }, active: true }
    ],
    quizzes: [
      { id: "jiq1", title: "Anatomy & Skeletal System Practice", subject: "Biology", questionsCount: 20, durationMinutes: 20, difficulty: "Medium", submissions: 320 }
    ],
    mocks: [
      { id: "jim1", title: "JIPMER AHS Full Syllabus Mock 1", questionsCount: 100, durationHours: 1.5, status: "Scheduled", registeredCount: 1200, date: "2026-06-02" }
    ]
  }
};

const CATEGORIES = [
  { id: "Medical", name: "Medical / Medicine", desc: "NEET UG, Allied Health Sciences, and Nursing entrances", icon: "🩺", count: 3, color: "from-pink-500 to-rose-600", shadow: "shadow-pink-500/10" },
  { id: "Engineering", name: "Engineering", desc: "JEE Main, JEE Advanced, BITSAT, and state engineering tests", icon: "⚙️", count: 4, color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/10" },
  { id: "Civil Services", name: "Civil Services & Govt", desc: "TNPSC, UPSC Prelims, and staff selection examinations", icon: "🏛️", count: 3, color: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/10" },
  { id: "Law", name: "Law", desc: "CLAT, AILET, and national law university entrances", icon: "⚖️", count: 2, color: "from-purple-500 to-violet-600", shadow: "shadow-purple-500/10" },
  { id: "Defence", name: "Defence & Services", desc: "NDA, NA, Agnipath, and police department exams", icon: "🛡️", count: 2, color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/10" },
  { id: "Banking", name: "Banking & Clerical", desc: "IBPS PO, SBI Clerk, and banking foundation exams", icon: "🏦", count: 2, color: "from-cyan-500 to-sky-600", shadow: "shadow-cyan-500/10" }
];

export default function SuperAdminCompetitiveExams() {
  const [view, setView] = useState<"categories" | "exams" | "details">("categories");
  const [selectedCategory, setSelectedCategory] = useState<string>("Medical");
  const [selectedExamId, setSelectedExamId] = useState<string>("neet-ug");
  const [activeTab, setActiveTab] = useState<"syllabus" | "topics" | "quiz" | "mock">("syllabus");

  // Page States for Dynamic Forms & Modifications
  const [searchQuery, setSearchQuery] = useState("");
  const [db, setDb] = useState<Record<string, ExamDetail>>(EXAMS_DATABASE);

  // Modal / Form input states
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapter, setNewChapter] = useState({ subjectIndex: 0, name: "", conceptsText: "" });
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [newQuiz, setNewQuiz] = useState({ title: "", subject: "", questionsCount: 20, durationMinutes: 20, difficulty: "Medium" as any });
  const [showAddMock, setShowAddMock] = useState(false);
  const [newMock, setNewMock] = useState({ title: "", questionsCount: 180, durationHours: 3.0, date: "", registeredCount: 0 });

  // Get active exam data
  const currentExam = useMemo(() => db[selectedExamId] || EXAMS_DATABASE["neet-ug"], [db, selectedExamId]);

  // Exams matching selected category
  const filteredExams = useMemo(() => {
    return Object.values(db).filter(exam => exam.category === selectedCategory);
  }, [db, selectedCategory]);

  // Topic search filter
  const filteredTopics = useMemo(() => {
    return currentExam.topics.filter(topic => 
      topic.conceptName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentExam.topics, searchQuery]);

  // Toggle AI mapping state of a concept topic
  const handleToggleAiMap = (topicId: string) => {
    setDb(prev => {
      const updatedExam = { ...prev[selectedExamId] };
      updatedExam.topics = updatedExam.topics.map(topic => 
        topic.id === topicId ? { ...topic, aiMapped: !topic.aiMapped } : topic
      );
      return { ...prev, [selectedExamId]: updatedExam };
    });
    
    // Smooth toast notification
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'AI Mapping Status Updated',
      showConfirmButton: false,
      timer: 1500,
      background: '#0f172a',
      color: '#fff'
    });
  };

  // Toggle active status of a concept topic
  const handleToggleTopicActive = (topicId: string) => {
    setDb(prev => {
      const updatedExam = { ...prev[selectedExamId] };
      updatedExam.topics = updatedExam.topics.map(topic => 
        topic.id === topicId ? { ...topic, active: !topic.active } : topic
      );
      return { ...prev, [selectedExamId]: updatedExam };
    });
  };

  // Update pyq count / weightage
  const handleEditTopicMeta = (topicId: string, updates: Partial<ConceptTopic>) => {
    setDb(prev => {
      const updatedExam = { ...prev[selectedExamId] };
      updatedExam.topics = updatedExam.topics.map(topic => 
        topic.id === topicId ? { ...topic, ...updates } : topic
      );
      return { ...prev, [selectedExamId]: updatedExam };
    });
  };

  // Add Chapter/Concepts to Syllabus
  const handleAddChapterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapter.name || !newChapter.conceptsText) return;
    
    const conceptsArray = newChapter.conceptsText.split(",").map(c => c.trim()).filter(Boolean);
    const generatedId = "ch_" + Date.now();

    setDb(prev => {
      const updatedExam = { ...prev[selectedExamId] };
      const targetSubject = updatedExam.syllabus[newChapter.subjectIndex];
      if (targetSubject) {
        targetSubject.chapters = [
          ...targetSubject.chapters,
          { id: generatedId, name: newChapter.name, concepts: conceptsArray }
        ];
      }
      return { ...prev, [selectedExamId]: updatedExam };
    });

    Swal.fire({
      icon: 'success',
      title: 'Chapter Added',
      text: `Successfully added ${newChapter.name} to the Syllabus.`,
      background: '#0f172a',
      color: '#fff',
      confirmButtonColor: '#7c3aed'
    });

    setShowAddChapter(false);
    setNewChapter({ subjectIndex: 0, name: "", conceptsText: "" });
  };

  // Add Quiz Submit
  const handleAddQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuiz.title || !newQuiz.subject) return;

    setDb(prev => {
      const updatedExam = { ...prev[selectedExamId] };
      updatedExam.quizzes = [
        ...updatedExam.quizzes,
        {
          id: "q_" + Date.now(),
          title: newQuiz.title,
          subject: newQuiz.subject,
          questionsCount: Number(newQuiz.questionsCount),
          durationMinutes: Number(newQuiz.durationMinutes),
          difficulty: newQuiz.difficulty,
          submissions: 0
        }
      ];
      return { ...prev, [selectedExamId]: updatedExam };
    });

    Swal.fire({
      icon: 'success',
      title: 'Quiz Configured',
      text: `Successfully added "${newQuiz.title}".`,
      background: '#0f172a',
      color: '#fff',
      confirmButtonColor: '#7c3aed'
    });

    setShowAddQuiz(false);
    setNewQuiz({ title: "", subject: "", questionsCount: 20, durationMinutes: 20, difficulty: "Medium" });
  };

  // Add Mock Submit
  const handleAddMockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMock.title || !newMock.date) return;

    setDb(prev => {
      const updatedExam = { ...prev[selectedExamId] };
      updatedExam.mocks = [
        ...updatedExam.mocks,
        {
          id: "m_" + Date.now(),
          title: newMock.title,
          questionsCount: Number(newMock.questionsCount),
          durationHours: Number(newMock.durationHours),
          status: "Scheduled",
          registeredCount: 0,
          date: newMock.date
        }
      ];
      return { ...prev, [selectedExamId]: updatedExam };
    });

    Swal.fire({
      icon: 'success',
      title: 'Mock Test Scheduled',
      text: `Successfully scheduled "${newMock.title}".`,
      background: '#0f172a',
      color: '#fff',
      confirmButtonColor: '#7c3aed'
    });

    setShowAddMock(false);
    setNewMock({ title: "", questionsCount: 180, durationHours: 3.0, date: "", registeredCount: 0 });
  };

  return (
    <PortalLayout>
      {/* ── Breadcrumb/Header Row ─────────────────────────────── */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="text-amber-500 w-6 h-6" />
            Competitive Exams Portal Configurator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {view === "categories" && "Overview of state-supported exam categories & entrance preparation portals"}
            {view === "exams" && `Viewing exam modules under the ${selectedCategory} category`}
            {view === "details" && `Exam dashboard & concepts configuration for ${currentExam.fullName}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {view !== "categories" && (
            <button
              onClick={() => {
                if (view === "details") setView("exams");
                else setView("categories");
              }}
              className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          {view === "details" && (
            <a
              href={currentExam.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-violet-650 hover:bg-violet-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg"
            >
              Official Website <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* ── VIEW 1: Categories Cards Grid ─────────────────────────────── */}
      {view === "categories" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  // Auto-select first exam in this category if database exists
                  const matches = Object.values(db).filter(e => e.category === cat.id);
                  if (matches.length > 0) {
                    setSelectedExamId(matches[0].id);
                  }
                  setView("exams");
                }}
                className={`group cursor-pointer bg-slate-900/70 border border-slate-800 hover:border-slate-600 hover:bg-slate-800/80 rounded-2xl p-6 transition-all hover:-translate-y-1.5 hover:shadow-xl shadow-md ${cat.shadow} flex flex-col justify-between`}
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl text-white mb-4 shadow-lg`}>
                    {cat.icon}
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">{cat.name}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{cat.desc}</p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                    {cat.count} Active Exams
                  </span>
                  <span className="text-[10px] font-bold text-amber-500 group-hover:underline flex items-center gap-1">
                    Manage catalog ➔
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Metrics Banner */}
          <div className="glass rounded-3xl p-6 border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center text-xl shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">State-Wide Entrance Database</h3>
                <p className="text-xs text-slate-400 mt-0.5">Includes centralized syllabus logs, study resources, model quizzes, and full mock exams.</p>
              </div>
            </div>
            <div className="flex gap-6 shrink-0">
              <div className="text-center">
                <div className="text-lg font-extrabold text-white">16</div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Tracked Exams</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-extrabold text-emerald-400">92%</div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">AI Concepts Mapped</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-extrabold text-purple-400">120+</div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Quiz Blueprints</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 2: Exams Under Category ─────────────────────────────── */}
      {view === "exams" && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center text-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{selectedCategory} Entrance Catalog</h3>
              <p className="text-xs text-slate-400">Configure or inspect exams that students take after their Class 12 board assessments.</p>
            </div>
          </div>

          {filteredExams.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center text-slate-400 border border-slate-850">
              <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <p className="text-sm font-bold">No exam modules registered for this category yet.</p>
              <button 
                onClick={() => {
                  Swal.fire({
                    title: 'Register New Exam',
                    html: `
                      <input id="examName" class="swal2-input" placeholder="Exam Name (e.g. NEET PG)">
                      <input id="conductedBy" class="swal2-input" placeholder="Conducted By">
                      <input id="eligibility" class="swal2-input" placeholder="Eligibility">
                    `,
                    background: '#0f172a',
                    color: '#fff',
                    confirmButtonColor: '#7c3aed',
                    preConfirm: () => {
                      const name = (document.getElementById('examName') as HTMLInputElement).value;
                      const conducted = (document.getElementById('conductedBy') as HTMLInputElement).value;
                      const eligibility = (document.getElementById('eligibility') as HTMLInputElement).value;
                      return { name, conducted, eligibility };
                    }
                  }).then((result) => {
                    if (result.isConfirmed && result.value?.name) {
                      const id = result.value.name.toLowerCase().replace(/\s+/g, '-');
                      setDb(prev => ({
                        ...prev,
                        [id]: {
                          id,
                          name: result.value.name,
                          fullName: result.value.name,
                          category: selectedCategory,
                          conductedBy: result.value.conducted || "NTA",
                          eligibility: result.value.eligibility || "Class 12 Passed",
                          website: "https://nta.nic.in",
                          examDate: "TBD",
                          regDeadline: "TBD",
                          syllabus: [],
                          topics: [],
                          quizzes: [],
                          mocks: []
                        }
                      }));
                    }
                  });
                }}
                className="mt-4 bg-violet-650 hover:bg-violet-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                + Register New Exam Module
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-600 hover:bg-slate-900/80 rounded-2xl p-5 transition-all shadow-md group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 bg-violet-500/10 text-violet-400 rounded-lg">
                        {exam.conductedBy}
                      </span>
                      <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </div>

                    <h4 className="text-base font-black text-white mt-3 group-hover:text-amber-400 transition-colors">
                      {exam.fullName} ({exam.name})
                    </h4>
                    
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {exam.eligibility}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Exam Date</div>
                        <div className="text-[10px] font-extrabold text-slate-300 mt-0.5">{exam.examDate}</div>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Reg Deadline</div>
                        <div className="text-[10px] font-extrabold text-slate-300 mt-0.5">{exam.regDeadline}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-slate-800/80 pt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedExamId(exam.id);
                        setView("details");
                        setActiveTab("syllabus");
                      }}
                      className="flex-1 text-center bg-violet-650 hover:bg-violet-600 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-lg"
                    >
                      Configure Exam Dashboard
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── VIEW 3: Detailed Exam Dashboard ─────────────────────────────── */}
      {view === "details" && (
        <div className="space-y-6">
          {/* Exam Header card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-violet-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-5 pointer-events-none text-9xl">
              🏆
            </div>
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                  {currentExam.category}
                </span>
                <span className="bg-slate-800 text-slate-300 text-[9px] font-bold px-2 py-1 rounded-lg">
                  Conducted by {currentExam.conductedBy}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">{currentExam.fullName} ({currentExam.name})</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-3xl">
                <strong className="text-white">Eligibility: </strong>{currentExam.eligibility}
              </p>
              
              <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-slate-800/60">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Registration Deadline</span>
                  <div className="text-xs font-black text-white mt-0.5">⏳ {currentExam.regDeadline}</div>
                </div>
                <div className="w-px bg-slate-800 self-stretch my-1"></div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Exam Date</span>
                  <div className="text-xs font-black text-white mt-0.5">📅 {currentExam.examDate}</div>
                </div>
                <div className="w-px bg-slate-800 self-stretch my-1"></div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Topics Configured</span>
                  <div className="text-xs font-black text-emerald-400 mt-0.5">🎯 {currentExam.topics.length} Concepts</div>
                </div>
                <div className="w-px bg-slate-800 self-stretch my-1"></div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Quizzes / Mocks</span>
                  <div className="text-xs font-black text-purple-400 mt-0.5">📝 {currentExam.quizzes.length} Quizzes · {currentExam.mocks.length} Mocks</div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration sub-tabs selectors */}
          <div className="flex border-b border-slate-800/80 gap-1.5 flex-wrap">
            {([
              { id: "syllabus", label: "📚 Concept Syllabus", count: currentExam.syllabus.length },
              { id: "topics", label: "🎯 Topic Matrix & AI Mapping", count: currentExam.topics.length },
              { id: "quiz", label: "❓ Practice Quizzes", count: currentExam.quizzes.length },
              { id: "mock", label: "📋 Full Mock Exams", count: currentExam.mocks.length }
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery("");
                }}
                className={`flex items-center gap-1.5 px-5 py-3 border-b-2 font-bold text-xs transition-all ${
                  activeTab === tab.id
                    ? "border-amber-500 text-amber-500"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
                <span className="text-[10px] bg-slate-800/80 px-2 py-0.5 rounded-full font-bold text-slate-400">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── TAB 1: Concept Syllabus ─────────────────────────────── */}
          {activeTab === "syllabus" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-bold text-white">Central Exam Syllabus Map</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Review the subject, chapter, and individual concept hierarchy tree.</p>
                </div>
                <button
                  onClick={() => setShowAddChapter(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-lg"
                >
                  <Plus className="w-4 h-4" /> Add Chapter & Concepts
                </button>
              </div>

              {/* Add Chapter Form Modal */}
              {showAddChapter && (
                <div className="glass border border-slate-850 rounded-2xl p-5 mb-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Configure New Chapter</h4>
                    <button 
                      onClick={() => setShowAddChapter(false)} 
                      className="text-slate-400 hover:text-white text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                  <form onSubmit={handleAddChapterSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target Subject</label>
                        <select
                          value={newChapter.subjectIndex}
                          onChange={(e) => setNewChapter(prev => ({ ...prev, subjectIndex: Number(e.target.value) }))}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs font-bold focus:border-amber-500 focus:outline-none"
                        >
                          {currentExam.syllabus.map((sub, i) => (
                            <option key={sub.name} value={i}>{sub.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Chapter Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Molecular Basis of Inheritance"
                          value={newChapter.name}
                          onChange={(e) => setNewChapter(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Concepts (comma-separated)</label>
                      <textarea
                        required
                        placeholder="DNA Structure, Replication Fork, Transcription, Codons, Operon Model"
                        rows={2}
                        value={newChapter.conceptsText}
                        onChange={(e) => setNewChapter(prev => ({ ...prev, conceptsText: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition"
                    >
                      Save Chapter & Concepts
                    </button>
                  </form>
                </div>
              )}

              {currentExam.syllabus.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">No syllabus configuration found. Click the button above to add one.</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {currentExam.syllabus.map((subject) => (
                    <div key={subject.name} className="glass rounded-2xl p-5 border border-slate-850 bg-slate-900/20">
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
                        <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${subject.color}`}>
                          {subject.icon}
                        </span>
                        <div>
                          <h4 className="font-bold text-white">{subject.name}</h4>
                          <p className="text-[10px] text-slate-500">{subject.chapters.length} Chapters mapped</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {subject.chapters.map((chapter) => (
                          <div key={chapter.id} className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5">
                            <h5 className="text-xs font-bold text-white mb-2 pb-1 border-b border-slate-800/40">
                              {chapter.name}
                            </h5>
                            <div className="flex flex-wrap gap-1.5">
                              {chapter.concepts.map((concept, idx) => (
                                <span 
                                  key={idx} 
                                  className="text-[9px] font-medium bg-slate-800 hover:bg-slate-700/80 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/50 cursor-pointer"
                                >
                                  {concept}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: Topic Matrix & AI Mapping ─────────────────────────────── */}
          {activeTab === "topics" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-bold text-white">Concept Topic Configuration Matrix</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage average weightage, check PYQ metrics, toggle AI tutor support, and linked resource packs.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search concepts or subjects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-white rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-amber-500 w-64"
                    />
                  </div>
                </div>
              </div>

              {/* Table Matrix */}
              <div className="glass border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[9px] border-b border-slate-800">
                      <th className="p-4">Concept Name</th>
                      <th className="p-4">Subject</th>
                      <th className="p-4">PYQ Weightage</th>
                      <th className="p-4 text-center">PYQs Asked</th>
                      <th className="p-4 text-center">Study Materials</th>
                      <th className="p-4 text-center">AI Mapping Status</th>
                      <th className="p-4 text-center">Visibility</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {filteredTopics.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                          No concepts found matching filter constraints.
                        </td>
                      </tr>
                    ) : (
                      filteredTopics.map((topic) => (
                        <tr key={topic.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="p-4 font-bold text-white">
                            {topic.conceptName}
                          </td>
                          <td className="p-4 text-slate-400">
                            {topic.subject}
                          </td>
                          <td className="p-4">
                            <select
                              value={topic.weightage}
                              onChange={(e) => handleEditTopicMeta(topic.id, { weightage: e.target.value as any })}
                              className="bg-slate-950 border border-slate-800 text-white text-[10px] font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-500"
                            >
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          </td>
                          <td className="p-4 text-center">
                            <input
                              type="number"
                              min={0}
                              value={topic.pyqQuestions}
                              onChange={(e) => handleEditTopicMeta(topic.id, { pyqQuestions: Number(e.target.value) })}
                              className="w-12 bg-slate-950 border border-slate-800 text-center text-white text-[10px] font-bold rounded-lg py-1 focus:outline-none focus:border-amber-500"
                            />
                          </td>
                          <td className="p-4 text-center text-slate-400">
                            <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded text-[10px] font-bold">
                              📄 {topic.studyMaterials.pdfs} PDF · 🎬 {topic.studyMaterials.videos} Vid
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleToggleAiMap(topic.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase transition border ${
                                topic.aiMapped
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              }`}
                            >
                              <Zap className="w-3 h-3" />
                              {topic.aiMapped ? "AI Mapped" : "Unmapped"}
                            </button>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleToggleTopicActive(topic.id)}
                              className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded ${
                                topic.active 
                                  ? "bg-emerald-650/15 text-emerald-400" 
                                  : "bg-red-650/15 text-red-400"
                              }`}
                            >
                              {topic.active ? (
                                <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Enabled</>
                              ) : (
                                <><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Disabled</>
                              )}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                Swal.fire({
                                  title: 'Configure Study Resources',
                                  html: `
                                    <div class="text-left text-slate-400 text-xs mb-2">Set PDF and Video resource count for this concept.</div>
                                    <input id="pdfsCount" class="swal2-input" type="number" value="${topic.studyMaterials.pdfs}" placeholder="PDF count">
                                    <input id="vidsCount" class="swal2-input" type="number" value="${topic.studyMaterials.videos}" placeholder="Video count">
                                  `,
                                  background: '#0f172a',
                                  color: '#fff',
                                  confirmButtonColor: '#7c3aed',
                                  preConfirm: () => {
                                    const pdfs = Number((document.getElementById('pdfsCount') as HTMLInputElement).value);
                                    const videos = Number((document.getElementById('vidsCount') as HTMLInputElement).value);
                                    return { pdfs, videos };
                                  }
                                }).then(result => {
                                  if (result.isConfirmed) {
                                    handleEditTopicMeta(topic.id, { studyMaterials: result.value });
                                  }
                                });
                              }}
                              className="text-amber-500 hover:text-amber-400 hover:underline font-bold text-[10px]"
                            >
                              Configure Res
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB 3: Practice Quizzes ─────────────────────────────── */}
          {activeTab === "quiz" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-bold text-white">Topic-Wise Practice Quizzes</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Design new quizzes or view student participation scores.</p>
                </div>
                <button
                  onClick={() => setShowAddQuiz(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-lg"
                >
                  <Plus className="w-4 h-4" /> Configure New Quiz
                </button>
              </div>

              {/* Add Quiz Form */}
              {showAddQuiz && (
                <div className="glass border border-slate-850 rounded-2xl p-5 mb-4 animate-in fade-in duration-250">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Configure Practice Quiz Blueprint</h4>
                    <button onClick={() => setShowAddQuiz(false)} className="text-slate-400 hover:text-white text-xs font-bold">Cancel</button>
                  </div>
                  <form onSubmit={handleAddQuizSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Quiz Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. DNA Replication Basics"
                          value={newQuiz.title}
                          onChange={(e) => setNewQuiz(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Subject Category Tag</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Biology"
                          value={newQuiz.subject}
                          onChange={(e) => setNewQuiz(prev => ({ ...prev, subject: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Questions Count</label>
                        <input
                          type="number"
                          min={5}
                          max={100}
                          value={newQuiz.questionsCount}
                          onChange={(e) => setNewQuiz(prev => ({ ...prev, questionsCount: Number(e.target.value) }))}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Duration (Minutes)</label>
                        <input
                          type="number"
                          min={5}
                          max={120}
                          value={newQuiz.durationMinutes}
                          onChange={(e) => setNewQuiz(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Difficulty Level</label>
                        <select
                          value={newQuiz.difficulty}
                          onChange={(e) => setNewQuiz(prev => ({ ...prev, difficulty: e.target.value as any }))}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-amber-500"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition">
                      Register Quiz Blueprint
                    </button>
                  </form>
                </div>
              )}

              {/* Quiz Catalog Card list */}
              {currentExam.quizzes.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">No practice quizzes configured for this exam yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentExam.quizzes.map((quiz) => (
                    <div 
                      key={quiz.id} 
                      className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[9px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded">
                            {quiz.subject}
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                            quiz.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400" :
                            quiz.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400" :
                            "bg-red-500/10 text-red-400"
                          }`}>
                            {quiz.difficulty}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white mb-2">{quiz.title}</h4>
                        
                        <div className="flex items-center gap-4 text-slate-400 text-[11px] font-bold">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-slate-500" /> {quiz.questionsCount} Questions
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" /> {quiz.durationMinutes} Minutes
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity className="w-3.5 h-3.5 text-slate-500" /> {quiz.submissions} Takers
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">Auto-grading Enabled</span>
                        <button
                          onClick={() => {
                            Swal.fire({
                              title: 'Delete Quiz Blueprint?',
                              text: `Are you sure you want to remove "${quiz.title}"?`,
                              icon: 'warning',
                              showCancelButton: true,
                              background: '#0f172a',
                              color: '#fff',
                              confirmButtonColor: '#ef4444',
                              cancelButtonColor: '#334155',
                              confirmButtonText: 'Yes, Delete'
                            }).then((result) => {
                              if (result.isConfirmed) {
                                setDb(prev => {
                                  const updatedExam = { ...prev[selectedExamId] };
                                  updatedExam.quizzes = updatedExam.quizzes.filter(q => q.id !== quiz.id);
                                  return { ...prev, [selectedExamId]: updatedExam };
                                });
                              }
                            });
                          }}
                          className="text-red-500 hover:text-red-400 hover:underline text-[10px] font-bold"
                        >
                          Remove Quiz
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 4: Full Mock Exams ─────────────────────────────── */}
          {activeTab === "mock" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-bold text-white">Full-Length State-Wide Mock Exams</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Design state-level test papers, manage timings, and check registration limits.</p>
                </div>
                <button
                  onClick={() => setShowAddMock(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-lg"
                >
                  <Plus className="w-4 h-4" /> Schedule New Mock Test
                </button>
              </div>

              {/* Add Mock Form */}
              {showAddMock && (
                <div className="glass border border-slate-850 rounded-2xl p-5 mb-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Schedule State Mock Exam</h4>
                    <button onClick={() => setShowAddMock(false)} className="text-slate-400 hover:text-white text-xs font-bold">Cancel</button>
                  </div>
                  <form onSubmit={handleAddMockSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Test Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Tamil Nadu Mock 5 - Centralized Series"
                          value={newMock.title}
                          onChange={(e) => setNewMock(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Scheduled Date</label>
                        <input
                          type="date"
                          required
                          value={newMock.date}
                          onChange={(e) => setNewMock(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Questions Count</label>
                        <input
                          type="number"
                          min={20}
                          max={300}
                          value={newMock.questionsCount}
                          onChange={(e) => setNewMock(prev => ({ ...prev, questionsCount: Number(e.target.value) }))}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Duration (Hours)</label>
                        <input
                          type="number"
                          step={0.5}
                          min={0.5}
                          max={6}
                          value={newMock.durationHours}
                          onChange={(e) => setNewMock(prev => ({ ...prev, durationHours: Number(e.target.value) }))}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition">
                      Schedule Exam Paper
                    </button>
                  </form>
                </div>
              )}

              {/* Mock List */}
              {currentExam.mocks.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">No mock exams configured yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {currentExam.mocks.map((test) => (
                    <div 
                      key={test.id} 
                      className={`border rounded-2xl p-5 transition-all bg-slate-900/40 hover:bg-slate-900/60 ${
                        test.status === "Scheduled" ? "border-amber-500/20" : "border-slate-800"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[9px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded ${
                          test.status === "Scheduled" ? "bg-amber-500/10 text-amber-500" : "bg-slate-800 text-slate-400"
                        }`}>
                          {test.status}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {test.questionsCount} MCQs · {test.durationHours} Hours
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white mb-2">{test.title}</h4>
                      
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800/40 text-[10px] font-bold text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date: {test.date}
                        </div>
                        <div className="flex items-center gap-1 text-slate-350">
                          <Check className="w-3.5 h-3.5 text-emerald-500" /> {test.registeredCount.toLocaleString()} registered
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </PortalLayout>
  );
}
