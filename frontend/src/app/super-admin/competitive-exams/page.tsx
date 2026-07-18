"use client";

import React, { useState, useEffect, useMemo } from "react";
import PortalLayout from "@/components/PortalLayout";
import { 
  Trophy, BookOpen, HelpCircle, ClipboardCheck, ArrowLeft, Plus, Search, 
  Settings, CheckCircle, XCircle, Sliders, ExternalLink, Zap, Shield, Microscope,
  FileText, Activity, Layers, Calendar, Clock, BarChart2, Check, Play, Edit2,
  AlertCircle, RefreshCw, X, Scale, Landmark, Coins, Cpu, GraduationCap, Trash2
} from "lucide-react";

// ============================================================================
// High-Fidelity Real-Time Questions Database
// ============================================================================

interface SimulatedQuestion {
  question: string;
  options: string[];
  answer: string;
  rationale: string;
}

const REALTIME_QUESTIONS: Record<string, SimulatedQuestion[]> = {
  medical: [
    {
      question: "Which cell organelle is known as the powerhouse of the cell?",
      options: ["Nucleus", "Ribosome", "Mitochondria", "Lysosome"],
      answer: "Mitochondria",
      rationale: "Mitochondria is responsible for generating adenosine triphosphate (ATP), the cell's primary energy currency."
    },
    {
      question: "The process of translation refers to the synthesis of:",
      options: ["RNA from DNA", "Protein from RNA", "DNA from RNA", "RNA from Protein"],
      answer: "Protein from RNA",
      rationale: "Translation is the process where ribosomes synthesize proteins using the genetic code carried by mRNA."
    },
    {
      question: "Which hormone regulates the blood calcium levels?",
      options: ["Thyroxine", "Insulin", "Parathyroid Hormone (PTH)", "Adrenaline"],
      answer: "Parathyroid Hormone (PTH)",
      rationale: "PTH increases blood calcium levels by stimulating osteoclasts and calcium reabsorption in kidneys."
    },
    {
      question: "In double-stranded DNA, which purine base pairs with thymine?",
      options: ["Adenine", "Guanine", "Cytosine", "Uracil"],
      answer: "Adenine",
      rationale: "Adenine always pairs with Thymine (forming 2 hydrogen bonds) in DNA."
    },
    {
      question: "What is the primary site of gaseous exchange in human lungs?",
      options: ["Trachea", "Bronchi", "Alveoli", "Diaphragm"],
      answer: "Alveoli",
      rationale: "Alveoli are tiny air sacs at the end of bronchioles where oxygen and carbon dioxide are exchanged."
    }
  ],
  engineering: [
    {
      question: "What is the limit of (sin x) / x as x approaches 0?",
      options: ["0", "1", "Infinity", "Undefined"],
      answer: "1",
      rationale: "By using standard trigonometric limits, the limit as x approaches 0 of sin(x)/x is 1."
    },
    {
      question: "Which of the following elements has the highest electronegativity?",
      options: ["Fluorine", "Oxygen", "Chlorine", "Nitrogen"],
      answer: "Fluorine",
      rationale: "Fluorine is the most electronegative element in the periodic table (3.98 Pauling units)."
    },
    {
      question: "The work done in an isochoric process is always:",
      options: ["Positive", "Negative", "Zero", "Dependent on volume"],
      answer: "Zero",
      rationale: "In an isochoric process, volume remains constant (dV = 0). Since Work = P * dV, the work done is zero."
    }
  ],
  general: [
    {
      question: "Which state is known as the Land of Rising Sun in India?",
      options: ["Assam", "Arunachal Pradesh", "Nagaland", "Manipur"],
      answer: "Arunachal Pradesh",
      rationale: "Arunachal Pradesh is the easternmost state in India, thereby receiving the first sunrise."
    },
    {
      question: "Who is known as the Father of Indian Constitution?",
      options: ["Mahatma Gandhi", "Dr. B.R. Ambedkar", "Jawaharlal Nehru", "Sardar Patel"],
      answer: "Dr. B.R. Ambedkar",
      rationale: "Dr. B.R. Ambedkar was the chairman of the drafting committee and is the chief architect of the Indian Constitution."
    }
  ]
};

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
  registeredCount: number;
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
          { id: "b1", name: "Genetics & Molecular Basis", concepts: ["Mendelian Monohybrid/Dihybrid Crosses", "DNA Double Helix Structure", "Replication Fork & Semi-conservative model", "mRNA Transcription Mechanism", "Ribosomal Translation & Codons Map", "Lac Operon Model", "DNA Fingerprinting technique"] },
          { id: "b2", name: "Human Physiology Systems", concepts: ["Breathing mechanics & Alveolar exchange", "Cardiac cycle & Double circulation", "Nephron Filtration & Urine formation", "Neuron action potential & Synapse transmission", "Endocrine Hormonal Feedback loops"] },
          { id: "b3", name: "Plant Physiology & Metabolism", concepts: ["Photosynthesis Light & Dark reactions", "C3 and C4 pathway comparative cycles", "Glycolysis & Krebs cellular respiration", "Plant hormones (Auxins, Gibberellins, ABA)"] },
          { id: "b4", name: "Cell Structure & Divisions", concepts: ["Prokaryotic vs Eukaryotic cellular matrix", "Cell cycle check points (G1, S, G2)", "Mitosis phases and Spindle assembly", "Meiosis I and II reductional divisions"] },
          { id: "b5", name: "Reproduction & Health", concepts: ["Spermatogenesis & Oogenesis steps", "Menstrual hormonal flow cycles", "In-Vitro Fertilization & Assisted reproduction", "Contraception mechanisms & STDs overview"] },
          { id: "b6", name: "Ecology & Environmental Biology", concepts: ["Food chains & trophic level dynamics", "Ecological pyramids of biomass & energy", "Biodiversity hot-spots and conservation", "Greenhouse effect and global warming parameters"] }
        ]
      },
      {
        name: "Chemistry",
        icon: "🧪",
        color: "text-emerald-500 bg-emerald-500/10",
        chapters: [
          { id: "c1", name: "Organic Reaction Mechanisms", concepts: ["Inductive, Electromeric & Resonance effects", "SN1 and SN2 nucleophilic substitutions", "Electrophilic aromatic substitutions", "Aldol condensation & Cannizzaro reactions", "Hoffmann bromamide degradation"] },
          { id: "c2", name: "Chemical Bonding & Atoms", concepts: ["Bohr atomic orbit model limitations", "Quantum numbers & configuration rules", "VSEPR molecular geometry layout", "Hybridization theory (sp, sp2, sp3, dsp2)", "Molecular Orbital configuration of O2 and N2"] },
          { id: "c3", name: "Physical Solutions & Kinetics", concepts: ["Raoult's law of ideal mixtures", "Colligative properties (Elevation/Depression)", "First-order kinetics & Half-life metrics", "Arrhenius equation & activation barrier"] },
          { id: "c4", name: "Coordination Chemistry", concepts: ["Werner's coordination hypothesis", "Unidentate & Polydentate ligand properties", "Crystal Field Splitting (Octahedral/Tetrahedral)", "d-block magnetic moment calculations"] }
        ]
      },
      {
        name: "Physics",
        icon: "⚛️",
        color: "text-blue-500 bg-blue-500/10",
        chapters: [
          { id: "p1", name: "Classical Mechanics", concepts: ["Kinematic equations of motion", "Newton's laws & Free-body diagrams", "Friction models (Static/Kinetic)", "Work-Energy theorem and conservative forces", "Rotational moment of inertia equations"] },
          { id: "p2", name: "Electrostatics & Circuits", concepts: ["Coulomb's electrostatic law", "Gauss flux theorem applications", "Capacitor energy storage formulas", "Ohm's law & drift velocity parameters", "Kirchhoff current/voltage junction loops", "Wheatstone bridge balanced criteria"] },
          { id: "p3", name: "Optics & Modern Physics", concepts: ["Reflection, Refraction & Lens makers formula", "Young's double slit interference", "Photoelectric threshold & Einstein equation", "Bohr Hydrogen spectrum lines", "PN Junction diode forward/reverse bias"] }
        ]
      }
    ],
    topics: [
      { id: "nt1", subject: "Biology", conceptName: "Molecular Basis of Inheritance", weightage: "High", pyqQuestions: 48, studyMaterials: { pdfs: 14, videos: 6 }, active: true },
      { id: "nt2", subject: "Biology", conceptName: "Mendelian Genetics", weightage: "High", pyqQuestions: 35, studyMaterials: { pdfs: 10, videos: 4 }, active: true },
      { id: "nt3", subject: "Biology", conceptName: "Chemical Coordination & Integration", weightage: "Medium", pyqQuestions: 22, studyMaterials: { pdfs: 8, videos: 3 }, active: true },
      { id: "nt4", subject: "Chemistry", conceptName: "Coordination Compounds", weightage: "High", pyqQuestions: 28, studyMaterials: { pdfs: 9, videos: 5 }, active: true },
      { id: "nt5", subject: "Chemistry", conceptName: "Chemical Kinetics", weightage: "Medium", pyqQuestions: 19, studyMaterials: { pdfs: 6, videos: 2 }, active: true },
      { id: "nt6", subject: "Chemistry", conceptName: "Aldehydes, Ketones & Carboxylic Acids", weightage: "High", pyqQuestions: 32, studyMaterials: { pdfs: 12, videos: 4 }, active: true },
      { id: "nt7", subject: "Physics", conceptName: "Current Electricity", weightage: "High", pyqQuestions: 41, studyMaterials: { pdfs: 15, videos: 8 }, active: true },
      { id: "nt8", subject: "Physics", conceptName: "Electrostatic Potential & Capacitance", weightage: "Medium", pyqQuestions: 26, studyMaterials: { pdfs: 8, videos: 3 }, active: true },
      { id: "nt9", subject: "Physics", conceptName: "Rotational Motion Dynamics", weightage: "High", pyqQuestions: 30, studyMaterials: { pdfs: 11, videos: 5 }, active: false }
    ],
    quizzes: [
      { id: "nq1", title: "Molecular Genetics Challenger Quiz", subject: "Biology", questionsCount: 25, durationMinutes: 30, difficulty: "Hard", submissions: 1240 },
      { id: "nq2", title: "Organic Reactions & Mechanisms Speedrun", subject: "Chemistry", questionsCount: 20, durationMinutes: 20, difficulty: "Medium", submissions: 980 },
      { id: "nq3", title: "Electrostatics and Circuits Basics", subject: "Physics", questionsCount: 15, durationMinutes: 15, difficulty: "Easy", submissions: 1520 }
    ],
    mocks: [
      { id: "nm1", title: "All India NEET UG Full Syllabus Mock Test 1", questionsCount: 180, durationHours: 3, registeredCount: 14850 },
      { id: "nm2", title: "State-Level Biology Sectional Mock Exam", questionsCount: 90, durationHours: 1.5, registeredCount: 9320 }
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
          { id: "jm2", name: "Algebra", concepts: ["Matrices & Determinants", "Quadratic Equations", "Probability", "Complex Numbers"] }
        ]
      },
      {
        name: "Physics",
        icon: "⚛️",
        color: "text-blue-500 bg-blue-500/10",
        chapters: [
          { id: "jp1", name: "Mechanics", concepts: ["Kinematics", "Laws of Motion & Work", "Rotational Dynamics"] }
        ]
      }
    ],
    topics: [
      { id: "jt1", subject: "Mathematics", conceptName: "Integral Calculus", weightage: "High", pyqQuestions: 38, studyMaterials: { pdfs: 16, videos: 5 }, active: true },
      { id: "jt2", subject: "Physics", conceptName: "Modern Physics (Atoms/Nuclei)", weightage: "High", pyqQuestions: 36, studyMaterials: { pdfs: 12, videos: 6 }, active: true }
    ],
    quizzes: [
      { id: "jq1", title: "Calculus & Limits Sprint Drill", subject: "Mathematics", questionsCount: 15, durationMinutes: 20, difficulty: "Hard", submissions: 850 }
    ],
    mocks: [
      { id: "jm_mock1", title: "JEE Main Full Syllabus Mock Series A", questionsCount: 90, durationHours: 3, registeredCount: 9810 }
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
          { id: "jb1", name: "Human Anatomy", concepts: ["Skeletal System", "Muscular System"] }
        ]
      }
    ],
    topics: [
      { id: "ji1", subject: "Biology", conceptName: "Human Anatomy Systems", weightage: "High", pyqQuestions: 22, studyMaterials: { pdfs: 8, videos: 3 }, active: true }
    ],
    quizzes: [
      { id: "jiq1", title: "Anatomy Practice Quiz", subject: "Biology", questionsCount: 20, durationMinutes: 20, difficulty: "Medium", submissions: 320 }
    ],
    mocks: [
      { id: "jim1", title: "JIPMER AHS Full Syllabus Mock 1", questionsCount: 100, durationHours: 1.5, registeredCount: 1200 }
    ]
  }
};

const INITIAL_CATEGORIES = [
  { id: "Medical", name: "Medical / Medicine", desc: "NEET UG, Allied Health Sciences, and Nursing entrances", icon: "Microscope", color: "from-pink-500 to-rose-600", shadow: "shadow-pink-500/10" },
  { id: "Engineering", name: "Engineering", desc: "JEE Main, JEE Advanced, BITSAT, and state engineering tests", icon: "Cpu", color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/10" },
  { id: "Civil Services", name: "Civil Services & Govt", desc: "TNPSC, UPSC Prelims, and staff selection examinations", icon: "Landmark", color: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/10" },
  { id: "Law", name: "Law", desc: "CLAT, AILET, and national law university entrances", icon: "Scale", color: "from-purple-500 to-violet-600", shadow: "shadow-purple-500/10" },
  { id: "Defence", name: "Defence & Services", desc: "NDA, NA, Agnipath, and police department exams", icon: "Shield", color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/10" },
  { id: "Banking", name: "Banking & Clerical", desc: "IBPS PO, SBI Clerk, and banking foundation exams", icon: "Coins", color: "from-cyan-500 to-sky-600", shadow: "shadow-cyan-500/10" }
];

// Simulated TN Medical College List based on cutoffs
interface CollegeRecommendation {
  name: string;
  minScore: number;
  location: string;
  seats: number;
}

const TN_MEDICAL_COLLEGES: CollegeRecommendation[] = [
  { name: "Madras Medical College (MMC)", minScore: 680, location: "Chennai", seats: 250 },
  { name: "Stanley Medical College (SMC)", minScore: 660, location: "Chennai", seats: 250 },
  { name: "Kilpauk Medical College (KMC)", minScore: 645, location: "Chennai", seats: 150 },
  { name: "Coimbatore Medical College", minScore: 635, location: "Coimbatore", seats: 200 },
  { name: "Madurai Medical College", minScore: 625, location: "Madurai", seats: 250 },
  { name: "Govt Thanjavur Medical College", minScore: 610, location: "Thanjavur", seats: 150 },
  { name: "Govt Vellore Medical College", minScore: 595, location: "Vellore", seats: 100 },
  { name: "Govt Tirunelveli Medical College", minScore: 585, location: "Tirunelveli", seats: 250 },
  { name: "Govt Kanyakumari Medical College", minScore: 575, location: "Asaripallam", seats: 150 },
  { name: "Govt Erode Medical College", minScore: 560, location: "Perundurai", seats: 100 }
];

export default function SuperAdminCompetitiveExams() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [view, setView] = useState<"categories" | "exams" | "details">("categories");
  const [selectedCategory, setSelectedCategory] = useState<string>("Medical");
  const [selectedExamId, setSelectedExamId] = useState<string>("neet-ug");
  const [activeTab, setActiveTab] = useState<"syllabus" | "topics" | "quiz" | "mock">("syllabus");

  // Detailed view NEET tab layout
  const [activeNEETSubTab, setActiveNEETSubTab] = useState<"planner" | "syllabus" | "topics" | "quizzes">("planner");

  // Page States for Dynamic Forms & Modifications
  const [searchQuery, setSearchQuery] = useState("");
  const [db, setDb] = useState<Record<string, ExamDetail>>(EXAMS_DATABASE);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);

  // Target Score Calculator state
  const [physicsScore, setPhysicsScore] = useState(140);
  const [chemistryScore, setChemistryScore] = useState(145);
  const [biologyScore, setBiologyScore] = useState(310);

  // PDF Syllabus Uploader state
  const [showPdfUploader, setShowPdfUploader] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [pdfParseStep, setPdfParseStep] = useState(0);
  const [pdfParseLogs, setPdfParseLogs] = useState<string[]>([]);
  const [parsedSyllabusResult, setParsedSyllabusResult] = useState<SyllabusSubject[] | null>(null);

  // High-Fidelity Custom React Modal States
  const [customConfirmModal, setCustomConfirmModal] = useState<{
    title: string;
    text: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  } | null>(null);

  const [customInputModal, setCustomInputModal] = useState<{
    title: string;
    placeholder?: string;
    defaultValue?: string;
    onConfirm: (val: string) => void;
  } | null>(null);
  const [inputModalValue, setInputModalValue] = useState("");

  const [customToast, setCustomToast] = useState<{
    type: "success" | "warning" | "error";
    title: string;
  } | null>(null);

  // Helper functions for Custom Modals
  const showToast = (title: string) => {
    setCustomToast({ type: "success", title });
    setTimeout(() => setCustomToast(null), 3000);
  };

  const openInputModal = (title: string, defaultValue: string, onConfirm: (val: string) => void, placeholder = "Type here...") => {
    setInputModalValue(defaultValue);
    setCustomInputModal({ title, defaultValue, onConfirm, placeholder });
  };

  // Sync state modifications to the backend PostgreSQL database
  const syncExamToDb = async (examId: string, updatedExam: ExamDetail) => {
    try {
      await fetch(`${API_URL}/api/competitive-exams/${examId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          examName: updatedExam.name,
          category: updatedExam.category,
          conductedBy: updatedExam.conductedBy,
          registrationDeadline: updatedExam.regDeadline,
          examDate: updatedExam.examDate,
          eligibility: updatedExam.eligibility,
          website: updatedExam.website,
          syllabus: updatedExam.syllabus
        })
      });
    } catch (err) {
      console.error("Failed to sync exam details to database:", err);
    }
  };

  // Helper to update both React state and the database
  const updateExamSyllabusStateAndDb = (examId: string, updater: (syllabus: SyllabusSubject[]) => SyllabusSubject[]) => {
    console.log("updateExamSyllabusStateAndDb execution started for examId:", examId);
    const exam = db[examId];
    if (!exam) {
      console.warn("updateExamSyllabusStateAndDb aborted: exam not found in db state for id:", examId, "Available db keys:", Object.keys(db));
      return;
    }

    const newSyllabus = updater(exam.syllabus);
    console.log("Syllabus updater completed. Subject count:", newSyllabus.length);
    newSyllabus.forEach((sub, sIdx) => {
      console.log(`Subject[${sub.name}] chapter count: Old = ${exam.syllabus[sIdx]?.chapters.length}, New = ${sub.chapters.length}`);
    });

    const updatedExam = { ...exam, syllabus: newSyllabus };

    // Update frontend state
    setDb(prev => {
      console.log("setDb executing. Updating key:", examId);
      return {
        ...prev,
        [examId]: updatedExam
      };
    });

    // Trigger async database sync
    console.log("Calling syncExamToDb...");
    syncExamToDb(examId, updatedExam);
  };

  // Fetch competitive exams from postgresql database API on mount
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch(`${API_URL}/api/competitive-exams`);
        const result = await res.json();
        if (result.success && result.data) {
          const mappedDb: Record<string, ExamDetail> = {};
          
          result.data.forEach((item: any) => {
            // Find a static fallback key to merge local quizzes and topic parameters
            const fallbackKey = Object.keys(EXAMS_DATABASE).find(k => 
              item.examName.toLowerCase().includes(k.replace('-ug', '').replace('-', ' ')) ||
              k.toLowerCase().includes(item.examName.toLowerCase().replace(' 2026', ''))
            );
            const fallback = fallbackKey ? EXAMS_DATABASE[fallbackKey] : null;

            mappedDb[item.id] = {
              id: item.id,
              name: item.examName,
              fullName: item.examName.includes("UG") || item.examName.includes("Main") 
                ? (fallback?.fullName || item.examName) 
                : item.examName,
              category: item.category,
              conductedBy: item.conductedBy,
              eligibility: item.eligibility,
              website: item.website || "",
              examDate: item.examDate,
              regDeadline: item.registrationDeadline,
              syllabus: (item.syllabus !== null && item.syllabus !== undefined)
                ? item.syllabus
                : (fallback?.syllabus || []),
              topics: fallback?.topics || [],
              quizzes: fallback?.quizzes || [],
              mocks: fallback?.mocks || []
            };
          });

          setDb(mappedDb);

          // Auto-select NEET database UUID on load if present
          const neetItem = result.data.find((item: any) => item.examName.toLowerCase().includes("neet"));
          if (neetItem) {
            setSelectedExamId(neetItem.id);
          } else if (result.data.length > 0) {
            setSelectedExamId(result.data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load competitive exams from database:", err);
      }
    };

    fetchExams();
  }, [API_URL]);

  // Form input Modal states
  const [categoryModal, setCategoryModal] = useState<{
    mode: "create" | "edit";
    id: string;
    name: string;
    desc: string;
    icon: string;
    color: string;
  } | null>(null);

  const [examModal, setExamModal] = useState<{
    mode: "create" | "edit";
    id: string;
    name: string;
    fullName: string;
    conductedBy: string;
    eligibility: string;
    website: string;
    examDate: string;
    regDeadline: string;
  } | null>(null);

  const [topicModal, setTopicModal] = useState<{
    mode: "create" | "edit";
    id: string;
    subject: string;
    conceptName: string;
    weightage: "High" | "Medium" | "Low";
    pyqQuestions: number;
  } | null>(null);

  const [quizModal, setQuizModal] = useState<{
    mode: "create" | "edit";
    id: string;
    title: string;
    subject: string;
    questionsCount: number;
    durationMinutes: number;
    difficulty: "Easy" | "Medium" | "Hard";
  } | null>(null);

  const [mockModal, setMockModal] = useState<{
    mode: "create" | "edit";
    id: string;
    title: string;
    questionsCount: number;
    durationHours: number;
  } | null>(null);

  // Modal / Form input states
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapter, setNewChapter] = useState({ subjectIndex: 0, name: "", conceptsText: "" });

  // Play attempt simulator state
  const [attemptingItem, setAttemptingItem] = useState<{
    id: string;
    type: "quiz" | "mock";
    title: string;
    questions: SimulatedQuestion[];
  } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isAttemptFinished, setIsAttemptFinished] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300);

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (attemptingItem && !isAttemptFinished) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsAttemptFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [attemptingItem, isAttemptFinished]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Launch Play & Attempt mode
  const startAttempt = (id: string, type: "quiz" | "mock", title: string, category: string) => {
    const isMedical = category === "Medical" || title.toLowerCase().includes("neet") || title.toLowerCase().includes("biology") || title.toLowerCase().includes("anatomy");
    const isEngineering = category === "Engineering" || title.toLowerCase().includes("jee") || title.toLowerCase().includes("physics") || title.toLowerCase().includes("math") || title.toLowerCase().includes("calculus");
    
    let questions = REALTIME_QUESTIONS.general;
    if (isMedical) {
      questions = REALTIME_QUESTIONS.medical;
    } else if (isEngineering) {
      questions = REALTIME_QUESTIONS.engineering;
    }

    setAttemptingItem({ id, type, title, questions });
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsAttemptFinished(false);
    setTimeRemaining(300);
  };

  // PDF Uploader simulator engine
  const handlePdfUploadSimulate = (file: File) => {
    setUploadedFile(file);
    setIsParsingPdf(true);
    setPdfParseStep(0);
    setPdfParseLogs([`[SYSTEM] Selected file "${file.name}"`]);

    setTimeout(() => {
      setPdfParseStep(1);
      setPdfParseLogs(prev => [...prev, `[SYSTEM] Analyzing document layout structures and extracting headers...`]);
    }, 1000);

    setTimeout(() => {
      setPdfParseStep(2);
      setPdfParseLogs(prev => [...prev, `[SYSTEM] Segregating subjects. Detected: Biology, Chemistry, Physics.`]);
    }, 2000);

    setTimeout(() => {
      setPdfParseStep(3);
      setPdfParseLogs(prev => [...prev, `[SUCCESS] Extracted 5 New Chapters & 19 Concepts from official mapping streams.`]);
      setIsParsingPdf(false);
      
      // Select mock data
      setParsedSyllabusResult([
        {
          name: "Biology",
          icon: "🧬",
          color: "text-pink-500 bg-pink-500/10",
          chapters: [
            { id: "pdf_b1", name: "Structural Organisation in Plants (PDF Extracted)", concepts: ["Meristematic Tissues", "Inflorescence types", "Stem modifications", "Root zones", "Secondary growth anatomy"] },
            { id: "pdf_b2", name: "Biomolecules & Cell Cycle Dynamics (PDF Extracted)", concepts: ["Proteins structures", "Enzyme activation energy", "Mitosis vs Meiosis key differences"] }
          ]
        },
        {
          name: "Chemistry",
          icon: "🧪",
          color: "text-emerald-500 bg-emerald-500/10",
          chapters: [
            { id: "pdf_c1", name: "Thermodynamics & Equilibrium Status (PDF Extracted)", concepts: ["First & Second laws of thermodynamics", "Gibbs Free Energy equilibrium status", "Le Chatelier's principle shifts"] },
            { id: "pdf_c2", name: "Haloalkanes & Haloarenes Reactions (PDF Extracted)", concepts: ["Reacting mechanisms", "Grignard reagent synthesis steps", "Optical isomerism chiral centers"] }
          ]
        },
        {
          name: "Physics",
          icon: "⚛️",
          color: "text-blue-500 bg-blue-500/10",
          chapters: [
            { id: "pdf_p1", name: "Rotational Dynamics & Gravity Fields (PDF Extracted)", concepts: ["Torque & angular momentum conservation", "Parallel & Perpendicular axis theorems", "Kepler's laws of planetary motion"] }
          ]
        }
      ]);
    }, 3000);
  };

  // Render Category SVGs
  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Microscope":
        return <Microscope className="w-6 h-6 text-white" />;
      case "Cpu":
        return <Cpu className="w-6 h-6 text-white" />;
      case "Landmark":
        return <Landmark className="w-6 h-6 text-white" />;
      case "Scale":
        return <Scale className="w-6 h-6 text-white" />;
      case "Shield":
        return <Shield className="w-6 h-6 text-white" />;
      case "Coins":
        return <Coins className="w-6 h-6 text-white" />;
      case "GraduationCap":
        return <GraduationCap className="w-6 h-6 text-white" />;
      case "Trophy":
        return <Trophy className="w-6 h-6 text-white" />;
      case "BookOpen":
        return <BookOpen className="w-6 h-6 text-white" />;
      default:
        if (iconName && iconName.length > 2) {
          return <HelpCircle className="w-6 h-6 text-white" />;
        }
        return <span className="text-2xl">{iconName || "🎓"}</span>;
    }
  };

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

  // Score Calculator derived metrics
  const totalScore = physicsScore + chemistryScore + biologyScore;
  const estimatedStateRank = useMemo(() => {
    if (totalScore >= 700) return Math.floor(Math.random() * 10) + 1;
    if (totalScore >= 650) return Math.floor(Math.random() * 120) + 11;
    if (totalScore >= 600) return Math.floor(Math.random() * 800) + 131;
    if (totalScore >= 550) return Math.floor(Math.random() * 2500) + 931;
    return Math.floor(Math.random() * 20000) + 9431;
  }, [totalScore]);

  // Expected matching colleges
  const matchedColleges = useMemo(() => {
    return TN_MEDICAL_COLLEGES.filter(col => totalScore >= col.minScore - 15)
      .sort((a, b) => b.minScore - a.minScore);
  }, [totalScore]);

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

    updateExamSyllabusStateAndDb(selectedExamId, (syllabus) => {
      return syllabus.map((subject, idx) => {
        if (idx === newChapter.subjectIndex) {
          return {
            ...subject,
            chapters: [
              ...subject.chapters,
              { id: generatedId, name: newChapter.name, concepts: conceptsArray }
            ]
          };
        }
        return subject;
      });
    });

    showToast("Chapter added successfully");
    setShowAddChapter(false);
    setNewChapter({ subjectIndex: 0, name: "", conceptsText: "" });
  };

  // Manual Syllabus management handlers
  const handleEditChapterName = (subjectName: string, chapterId: string, currentName: string) => {
    openInputModal("Rename Chapter", currentName, (newName) => {
      updateExamSyllabusStateAndDb(selectedExamId, (syllabus) => 
        syllabus.map(subject => {
          if (subject.name === subjectName) {
            return {
              ...subject,
              chapters: subject.chapters.map(ch => 
                ch.id === chapterId ? { ...ch, name: newName } : ch
              )
            };
          }
          return subject;
        })
      );
      showToast("Chapter renamed successfully");
    }, "Type chapter name...");
  };

  const handleDeleteChapter = (subjectName: string, chapterId: string) => {
    setCustomConfirmModal({
      title: "Delete Chapter?",
      text: "Are you sure you want to remove this chapter and all its concepts?",
      onConfirm: () => {
        updateExamSyllabusStateAndDb(selectedExamId, (syllabus) => 
          syllabus.map(subject => {
            if (subject.name === subjectName) {
              return {
                ...subject,
                chapters: subject.chapters.filter(ch => ch.id !== chapterId)
              };
            }
            return subject;
          })
        );
        showToast("Chapter removed successfully");
      }
    });
  };

  const handleAddConceptToChapter = (subjectName: string, chapterId: string) => {
    openInputModal("Add New Concept", "", (conceptName) => {
      updateExamSyllabusStateAndDb(selectedExamId, (syllabus) => 
        syllabus.map(subject => {
          if (subject.name === subjectName) {
            return {
              ...subject,
              chapters: subject.chapters.map(ch => 
                ch.id === chapterId 
                  ? { ...ch, concepts: [...ch.concepts, conceptName] }
                  : ch
              )
            };
          }
          return subject;
        })
      );
      showToast("Concept added successfully");
    }, "Enter concept name...");
  };

  const handleEditConcept = (subjectName: string, chapterId: string, conceptIndex: number, currentName: string) => {
    openInputModal("Edit Concept Name", currentName, (newName) => {
      updateExamSyllabusStateAndDb(selectedExamId, (syllabus) => 
        syllabus.map(subject => {
          if (subject.name === subjectName) {
            return {
              ...subject,
              chapters: subject.chapters.map(ch => {
                if (ch.id === chapterId) {
                  const newConcepts = [...ch.concepts];
                  newConcepts[conceptIndex] = newName;
                  return { ...ch, concepts: newConcepts };
                }
                return ch;
              })
            };
          }
          return subject;
        })
      );
      showToast("Concept updated successfully");
    }, "Type concept name...");
  };

  const handleDeleteConcept = (subjectName: string, chapterId: string, conceptIndex: number) => {
    updateExamSyllabusStateAndDb(selectedExamId, (syllabus) => 
      syllabus.map(subject => {
        if (subject.name === subjectName) {
          return {
            ...subject,
            chapters: subject.chapters.map(ch => {
              if (ch.id === chapterId) {
                return {
                  ...ch,
                  concepts: ch.concepts.filter((_, idx) => idx !== conceptIndex)
                };
              }
              return ch;
            })
          };
        }
        return subject;
      })
    );
    showToast("Concept removed successfully");
  };

  const handleClearAllSyllabus = () => {
    setCustomConfirmModal({
      title: "Clear All Syllabus?",
      text: "This will wipe out all chapters and concepts for this exam. You can then upload a fresh syllabus PDF or build it manually.",
      onConfirm: () => {
        updateExamSyllabusStateAndDb(selectedExamId, (syllabus) => 
          syllabus.map(subj => ({
            ...subj,
            chapters: []
          }))
        );
        showToast("Syllabus wiped clean");
      }
    });
  };

  return (
    <PortalLayout>
      {/* ── Breadcrumb/Header Row ─────────────────────────────── */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-300">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-heading)] flex items-center gap-2">
            <Trophy className="text-amber-500 w-6 h-6" />
            Competitive Exams Portal Configurator
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {view === "categories" && "Overview of state-supported exam categories & entrance preparation portals"}
            {view === "exams" && `Viewing exam modules under the ${selectedCategory} category`}
            {view === "details" && `Exam dashboard & concepts configuration for ${currentExam.fullName}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {view === "categories" && (
            <button
              onClick={() => setCategoryModal({ mode: "create", id: "", name: "", desc: "", icon: "Microscope", color: "from-yellow-500 to-amber-600" })}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          )}
          {view === "exams" && (
            <button
              onClick={() => setExamModal({ mode: "create", id: "", name: "", fullName: "", conductedBy: "", eligibility: "", website: "https://", examDate: "", regDeadline: "" })}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" /> Register Exam
            </button>
          )}
          {view !== "categories" && (
            <button
              onClick={() => {
                if (view === "details") setView("exams");
                else setView("categories");
              }}
              className="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border)] hover:border-slate-400 text-[var(--text-main)] hover:text-[var(--text-heading)] px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          {view === "details" && (
            <>
              <button
                onClick={() => setExamModal({
                  mode: "edit",
                  id: currentExam.id,
                  name: currentExam.name,
                  fullName: currentExam.fullName,
                  conductedBy: currentExam.conductedBy,
                  eligibility: currentExam.eligibility,
                  website: currentExam.website,
                  examDate: currentExam.examDate,
                  regDeadline: currentExam.regDeadline
                })}
                className="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] hover:text-[var(--text-heading)] px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Exam Details
              </button>
              <a
                href={currentExam.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg"
              >
                Official Website <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </>
          )}
        </div>
      </div>

      {/* ── VIEW 1: Categories Cards Grid ─────────────────────────────── */}
      {view === "categories" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  const matches = Object.values(db).filter(e => e.category === cat.id);
                  if (matches.length > 0) {
                    setSelectedExamId(matches[0].id);
                  } else {
                    setSelectedExamId("");
                  }
                  setView("exams");
                }}
                className={`group cursor-pointer bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--portal-color,var(--primary))] rounded-2xl p-6 transition-all hover:-translate-y-1.5 hover:shadow-xl shadow-md ${cat.shadow} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-lg`}>
                      {renderCategoryIcon(cat.icon)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategoryModal({
                          mode: "edit",
                          id: cat.id,
                          name: cat.name,
                          desc: cat.desc,
                          icon: cat.icon,
                          color: cat.color
                        });
                      }}
                      className="text-[var(--text-muted)] hover:text-[var(--text-heading)] p-1.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border)] hover:border-slate-400 transition animate-none"
                      title="Edit Category Details"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-heading)] group-hover:text-[var(--portal-color,var(--primary))] transition-colors text-left">{cat.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed text-left">{cat.desc}</p>
                </div>
                <div className="mt-6 flex items-center justify-between pt-2">
                  <span className="text-[10px] font-bold text-[var(--text-main)] bg-[var(--bg-main)] px-3 py-1 rounded-full border border-[var(--border)]">
                    {Object.values(db).filter(e => e.category === cat.id).length} Active Exams
                  </span>
                  <span className="text-[10px] font-bold text-amber-500 group-hover:underline flex items-center gap-1">
                    Manage catalog ➔
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Metrics Banner */}
          <div className="glass rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center text-xl shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-heading)]">State-Wide Entrance Database</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Includes centralized syllabus logs, study resources, model quizzes, and full mock exams.</p>
              </div>
            </div>
            <div className="flex gap-6 shrink-0">
              <div className="text-center">
                <div className="text-lg font-extrabold text-[var(--text-heading)]">{Object.keys(db).length}</div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Tracked Exams</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-extrabold text-emerald-500">92%</div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">AI Concepts Mapped</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-extrabold text-purple-500">120+</div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Quiz Blueprints</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW 2: Exams Under Category ─────────────────────────────── */}
      {view === "exams" && (
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] p-5 flex items-center gap-3 shadow-sm text-left">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-650 flex items-center justify-center text-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[var(--text-heading)]">{selectedCategory} Entrance Catalog</h3>
              <p className="text-xs text-[var(--text-muted)]">Configure or inspect exams that students take after their Class 12 board assessments.</p>
            </div>
          </div>

          {filteredExams.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center text-[var(--text-muted)]">
              <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <p className="text-sm font-bold">No exam modules registered for this category yet.</p>
              <button 
                onClick={() => setExamModal({ mode: "create", id: "", name: "", fullName: "", conductedBy: "", eligibility: "", website: "https://", examDate: "", regDeadline: "" })}
                className="mt-4 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md"
              >
                + Register New Exam Module
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((examItem) => (
                <div
                  key={examItem.id}
                  className="bg-[var(--bg-card)] border border-[var(--border)] hover:border-slate-400 rounded-2xl p-5 transition-all shadow-md group flex flex-col justify-between text-left"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-lg">
                        {examItem.conductedBy}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExamModal({
                              mode: "edit",
                              id: examItem.id,
                              name: examItem.name,
                              fullName: examItem.fullName,
                              conductedBy: examItem.conductedBy,
                              eligibility: examItem.eligibility,
                              website: examItem.website,
                              examDate: examItem.examDate,
                              regDeadline: examItem.regDeadline
                            });
                          }}
                          className="text-[var(--text-muted)] hover:text-[var(--text-heading)] p-1 rounded bg-[var(--bg-main)] border border-[var(--border)] hover:border-slate-400 transition animate-none"
                          title="Edit Exam details"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                          Active
                        </span>
                      </div>
                    </div>

                    <h4 className="text-base font-black text-[var(--text-heading)] mt-3 group-hover:text-[var(--portal-color,var(--primary))] transition-colors">
                      {examItem.name}
                    </h4>
                    
                    <p className="text-xs text-[var(--text-muted)] mt-2 line-clamp-2">
                      {examItem.eligibility}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="bg-[var(--bg-main)] p-2.5 rounded-xl border border-[var(--border)]">
                        <div className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Exam Date</div>
                        <div className="text-[10px] font-extrabold text-[var(--text-main)] mt-0.5">{examItem.examDate}</div>
                      </div>
                      <div className="bg-[var(--bg-main)] p-2.5 rounded-xl border border-[var(--border)]">
                        <div className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Reg Deadline</div>
                        <div className="text-[10px] font-extrabold text-[var(--text-main)] mt-0.5">{examItem.regDeadline}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-2 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedExamId(examItem.id);
                        setView("details");
                        if (examItem.name.toLowerCase().includes("neet")) {
                          setActiveNEETSubTab("planner");
                        } else {
                          setActiveTab("syllabus");
                        }
                      }}
                      className="flex-1 text-center bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs py-2.5 rounded-xl transition shadow-lg active:scale-95"
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
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Card with forced linear-gradient inline background and div-based overrides */}
          <div 
            style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #4c1d95 100%)", border: "1px solid #312e81" }}
            className="rounded-3xl p-6 shadow-xl relative overflow-hidden text-left"
          >
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10 pointer-events-none text-9xl">
              🏆
            </div>
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-pink-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                  {currentExam.category}
                </span>
                <span className="bg-slate-800/80 text-slate-200 text-[9px] font-bold px-2.5 py-1 rounded-lg border border-slate-700">
                  Conducted by {currentExam.conductedBy}
                </span>
              </div>
              <div 
                style={{ color: "#ffffff" }}
                className="text-2xl font-black tracking-tight mt-3 mb-2"
              >
                {currentExam.fullName} ({currentExam.name})
              </div>
              <div 
                style={{ color: "#e2e8f0" }}
                className="text-xs leading-relaxed max-w-3xl"
              >
                <strong style={{ color: "#ffffff" }}>Eligibility Criteria: </strong>{currentExam.eligibility}
              </div>
            </div>
          </div>

          {/* If NEET UG selected, load the highly focused cutoff planner dashboard view */}
          {currentExam.name.toLowerCase().includes("neet") ? (
            <div className="space-y-6 text-left w-full">
                
              {/* NEET specific tab navigation */}
              <div className="flex border-b border-[var(--border)] gap-1 flex-wrap">
                {([
                  { id: "planner", label: "📊 Cutoff Rank & College Planner" },
                  { id: "syllabus", label: "📚 Full NEET Syllabus Tree" },
                  { id: "topics", label: "🎯 Topic Matrix" },
                  { id: "quizzes", label: "📝 Practice Blueprints" }
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveNEETSubTab(tab.id)}
                    className={`px-4 py-2.5 border-b-2 font-bold text-xs transition-all ${
                      activeNEETSubTab === tab.id
                        ? "border-pink-500 text-pink-500"
                        : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* SubTab 1: Cutoff Predictor */}
              {activeNEETSubTab === "planner" && (
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-heading)]">NEET Cutoff Rank Planner & Tamil Nadu College Predictor</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Adjust Simulated Subject Scores below to check TN Govt medical seats eligibility.</p>
                  </div>

                  <div className="space-y-4 bg-[var(--bg-main)] p-5 rounded-2xl border border-[var(--border)]">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-[var(--text-main)] mb-1">
                        <span>Biology Score (Max 360)</span>
                        <span className="text-pink-600 font-extrabold">{biologyScore} / 360</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={360}
                        step={5}
                        value={biologyScore}
                        onChange={(e) => setBiologyScore(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-[var(--text-main)] mb-1">
                        <span>Chemistry Score (Max 180)</span>
                        <span className="text-emerald-600 font-extrabold">{chemistryScore} / 180</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={180}
                        step={5}
                        value={chemistryScore}
                        onChange={(e) => setChemistryScore(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-[var(--text-main)] mb-1">
                        <span>Physics Score (Max 180)</span>
                        <span className="text-blue-600 font-extrabold">{physicsScore} / 180</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={180}
                        step={5}
                        value={physicsScore}
                        onChange={(e) => setPhysicsScore(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-pink-500/10 to-rose-600/10 border border-pink-500/20 p-4 rounded-2xl">
                      <span className="text-[9px] uppercase font-bold text-pink-600 tracking-wider">Total Score</span>
                      <h4 className="text-2xl font-black text-pink-500 mt-1">{totalScore} <span className="text-xs font-bold text-[var(--text-muted)]">/ 720</span></h4>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 p-4 rounded-2xl">
                      <span className="text-[9px] uppercase font-bold text-amber-600 tracking-wider">State Merit Rank</span>
                      <h4 className="text-2xl font-black text-amber-500 mt-1">~ {estimatedStateRank}</h4>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-500/20 p-4 rounded-2xl">
                      <span className="text-[9px] uppercase font-bold text-emerald-600 tracking-wider">Eligible Institutes</span>
                      <h4 className="text-2xl font-black text-emerald-500 mt-1">
                        {matchedColleges.filter(col => totalScore >= col.minScore).length} / {TN_MEDICAL_COLLEGES.length}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[var(--text-heading)] uppercase tracking-wider">Direct Government Medical Quota Matching:</h4>
                    <div className="border border-[var(--border)] rounded-2xl overflow-hidden">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="bg-[var(--bg-main)] text-[var(--text-muted)] font-bold border-b border-[var(--border)]">
                            <th className="p-3">College & Location</th>
                            <th className="p-3 text-center">Required Cutoff</th>
                            <th className="p-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)] text-[var(--text-main)]">
                          {matchedColleges.map((col, idx) => {
                            const diff = totalScore - col.minScore;
                            return (
                              <tr key={idx} className="hover:bg-[var(--bg-main)] transition-colors">
                                <td className="p-3 font-bold text-[var(--text-heading)]">
                                  <div>{col.name}</div>
                                  <div className="text-[10px] text-[var(--text-muted)] font-medium">📍 {col.location} · {col.seats} seats</div>
                                </td>
                                <td className="p-3 text-center font-bold">{col.minScore}</td>
                                <td className="p-3 text-right">
                                  {diff >= 0 ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                                      <Check className="w-3 h-3" /> Safe (+{diff})
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-500 bg-red-500/10 px-2.5 py-1 rounded-lg">
                                      Deficit ({diff})
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SubTab 2: Syllabus Tree with PDF uploader and manual editing */}
              {activeNEETSubTab === "syllabus" && (
                <div className="space-y-4 w-full animate-in fade-in duration-200">
                  <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-heading)] uppercase tracking-wider">NEET Core Syllabus Node Trees</h4>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Explore chapters or upload official NTA/state board syllabus guidelines directly.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowPdfUploader(true)}
                        className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
                      >
                        <FileText className="w-3.5 h-3.5" /> Upload Syllabus PDF
                      </button>
                      <button
                        onClick={() => setShowAddChapter(true)}
                        className="bg-amber-500 hover:bg-amber-450 text-slate-900 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 transition shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Chapter
                      </button>
                      <button
                        onClick={handleClearAllSyllabus}
                        className="bg-[var(--bg-main)] border border-red-500/20 text-red-500 hover:bg-red-500/5 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 transition shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Clear All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {currentExam.syllabus.map((subject) => (
                      <div key={subject.name} className="glass rounded-3xl p-5 bg-[var(--bg-card)] border border-[var(--border)] shadow-sm flex flex-col justify-between text-left">
                        <div>
                          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[var(--border)]">
                            <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${subject.color}`}>
                              {subject.icon}
                            </span>
                            <div>
                              <h4 className="font-bold text-[var(--text-heading)]">{subject.name}</h4>
                              <p className="text-[10px] text-[var(--text-muted)]">{subject.chapters.length} Chapters</p>
                            </div>
                          </div>
                          
                          {subject.chapters.length === 0 ? (
                            <div className="text-center py-8 text-[var(--text-muted)] text-[10px] font-bold">
                              No chapters registered.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {subject.chapters.map((chapter) => (
                                <div key={chapter.id} className="bg-[var(--bg-main)] border border-[var(--border)] rounded-xl p-3 relative group/chapter">
                                  
                                  {/* Chapter Header Row with Inline Modifiers */}
                                  <div className="flex justify-between items-center mb-2 pb-1 border-b border-[var(--border)]">
                                    <h5 
                                      onClick={() => handleEditChapterName(subject.name, chapter.id, chapter.name)}
                                      className="text-[11px] font-black text-[var(--text-heading)] hover:underline cursor-pointer truncate max-w-[120px]"
                                      title="Click to rename chapter"
                                    >
                                      {chapter.name}
                                    </h5>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => handleAddConceptToChapter(subject.name, chapter.id)}
                                        className="text-pink-500 hover:text-pink-400 p-0.5 rounded transition"
                                        title="Add Concept"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteChapter(subject.name, chapter.id)}
                                        className="text-red-500 hover:text-red-400 p-0.5 rounded transition"
                                        title="Delete Chapter"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-1">
                                    {chapter.concepts.map((concept, cIdx) => (
                                      <span 
                                        key={cIdx} 
                                        className="group/concept text-[9px] bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border)] pl-2 pr-1.5 py-0.5 rounded-full inline-flex items-center gap-1 hover:border-pink-500 transition"
                                      >
                                        <span 
                                          onClick={() => handleEditConcept(subject.name, chapter.id, cIdx, concept)}
                                          className="cursor-pointer hover:underline font-bold"
                                          title="Click to rename concept"
                                        >
                                          {concept}
                                        </span>
                                        <button
                                          onClick={() => handleDeleteConcept(subject.name, chapter.id, cIdx)}
                                          className="text-[var(--text-muted)] hover:text-red-500 p-0.5 rounded transition opacity-60 hover:opacity-100"
                                          title="Delete Concept"
                                        >
                                          <X className="w-2.5 h-2.5" />
                                        </button>
                                      </span>
                                    ))}
                                    {chapter.concepts.length === 0 && (
                                      <span className="text-[8px] text-[var(--text-muted)] italic">No concepts added.</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SubTab 3: Concept Matrix Table */}
              {activeNEETSubTab === "topics" && (
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <h4 className="text-xs font-bold text-[var(--text-heading)] uppercase tracking-wider">Concept Alignment Matrix</h4>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search concepts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-pink-500 w-56 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-[var(--bg-main)] text-[var(--text-muted)] font-bold uppercase tracking-wider text-[9px] border-b border-[var(--border)]">
                          <th className="p-4">Concept Name</th>
                          <th className="p-4">Subject</th>
                          <th className="p-4">PYQ Weight</th>
                          <th className="p-4 text-center">PYQs Asked</th>
                          <th className="p-4 text-center">Visibility</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)] text-[var(--text-main)]">
                        {filteredTopics.map((topic) => (
                          <tr key={topic.id} className="hover:bg-[var(--bg-main)] transition-colors">
                            <td className="p-4 font-bold text-[var(--text-heading)]">{topic.conceptName}</td>
                            <td className="p-4">{topic.subject}</td>
                            <td className="p-4">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                topic.weightage === "High" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                              }`}>{topic.weightage}</span>
                            </td>
                            <td className="p-4 text-center font-bold text-[var(--text-heading)]">{topic.pyqQuestions}</td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleToggleTopicActive(topic.id)}
                                className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded border ${
                                  topic.active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                }`}
                              >
                                {topic.active ? "Active" : "Hidden"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SubTab 4: Quizzes & Mocks */}
              {activeNEETSubTab === "quizzes" && (
                <div className="space-y-6 text-left">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[var(--text-heading)] uppercase tracking-wider">Active Practice Quizzes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentExam.quizzes.map((quiz) => (
                        <div key={quiz.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 shadow flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[9px] bg-[var(--bg-main)] text-[var(--text-main)] font-bold px-2 py-0.5 rounded border border-[var(--border)]">{quiz.subject}</span>
                              <span className="text-[9px] font-black uppercase text-pink-500">{quiz.difficulty}</span>
                            </div>
                            <h4 className="text-sm font-bold text-[var(--text-heading)] mb-2">{quiz.title}</h4>
                          </div>
                          <div className="mt-4 pt-2 flex items-center justify-between">
                            <button
                              onClick={() => startAttempt(quiz.id, "quiz", quiz.title, "Medical")}
                              className="flex items-center gap-1 bg-pink-500 hover:bg-pink-400 text-white font-black text-xs px-3.5 py-1.5 rounded-xl transition"
                            >
                              <Play className="w-3 h-3 fill-white text-white" /> Attempt Quiz
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                    <h4 className="text-xs font-bold text-[var(--text-heading)] uppercase tracking-wider">Full Syllabus Mocks</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentExam.mocks.map((test) => (
                        <div key={test.id} className="border rounded-2xl p-5 bg-[var(--bg-card)] border-[var(--border)] flex flex-col justify-between shadow-sm">
                          <div>
                            <h4 className="text-sm font-bold text-[var(--text-heading)] mb-2">{test.title}</h4>
                            <span className="text-[10px] font-bold text-[var(--text-muted)]">{test.questionsCount} MCQs · {test.durationHours} Hours</span>
                          </div>
                          <div className="mt-4 pt-2">
                            <button
                              onClick={() => startAttempt(test.id, "mock", test.title, "Medical")}
                              className="flex items-center gap-1 bg-pink-500 hover:bg-pink-400 text-white font-black text-xs px-4 py-2 rounded-xl transition"
                            >
                              <Play className="w-3.5 h-3.5 fill-white text-white" /> Attempt Mock Test
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            // Standard layout for other exams (e.g. JEE Main, JIPMER)
            <div className="space-y-6 text-left">
              <div className="flex border-b border-[var(--border)] gap-1 flex-wrap">
                {([
                  { id: "syllabus", label: "📚 Concept Syllabus" },
                  { id: "topics", label: "🎯 Topic Matrix" },
                  { id: "quiz", label: "❓ Practice Quizzes" },
                  { id: "mock", label: "📋 Mock Exams" }
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 border-b-2 font-bold text-xs transition-all ${
                      activeTab === tab.id
                        ? "border-violet-650 text-violet-650"
                        : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Syllabus Tab */}
              {activeTab === "syllabus" && (
                <div className="space-y-4 w-full text-left">
                  <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-heading)] uppercase tracking-wider">Exam Syllabus Node Trees</h4>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Chapters and active concepts list.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowPdfUploader(true)}
                        className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
                      >
                        <FileText className="w-3.5 h-3.5" /> Upload Syllabus PDF
                      </button>
                      <button
                        onClick={() => setShowAddChapter(true)}
                        className="bg-amber-500 hover:bg-amber-450 text-slate-900 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 transition shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Chapter
                      </button>
                      <button
                        onClick={handleClearAllSyllabus}
                        className="bg-[var(--bg-main)] border border-red-500/20 text-red-500 hover:bg-red-500/5 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 transition shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Clear All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {currentExam.syllabus.map((subject) => (
                      <div key={subject.name} className="glass rounded-3xl p-5 bg-[var(--bg-card)] border border-[var(--border)] shadow-sm">
                        <h4 className="font-bold text-[var(--text-heading)] mb-3 pb-2 border-b border-[var(--border)]">{subject.name}</h4>
                        
                        {subject.chapters.length === 0 ? (
                          <div className="text-center py-8 text-[var(--text-muted)] text-[10px] font-bold">
                            No chapters registered.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {subject.chapters.map((chapter) => (
                              <div key={chapter.id} className="bg-[var(--bg-main)] p-3 rounded-xl border border-[var(--border)] relative group/chapter">
                                
                                {/* Chapter Title Row for other exams */}
                                <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-[var(--border)]">
                                  <h5 
                                    onClick={() => handleEditChapterName(subject.name, chapter.id, chapter.name)}
                                    className="text-[11px] font-black text-[var(--text-heading)] hover:underline cursor-pointer truncate max-w-[120px]"
                                  >
                                    {chapter.name}
                                  </h5>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleAddConceptToChapter(subject.name, chapter.id)}
                                      className="text-violet-650 hover:text-violet-500 p-0.5 rounded transition"
                                      title="Add Concept"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteChapter(subject.name, chapter.id)}
                                      className="text-red-500 hover:text-red-400 p-0.5 rounded transition"
                                      title="Delete Chapter"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                  {chapter.concepts.map((c, cIdx) => (
                                    <span 
                                      key={cIdx} 
                                      className="group/concept text-[9px] bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] pl-2 pr-1.5 py-0.5 rounded-full inline-flex items-center gap-1 hover:border-violet-500 transition"
                                    >
                                      <span
                                        onClick={() => handleEditConcept(subject.name, chapter.id, cIdx, c)}
                                        className="cursor-pointer hover:underline font-bold"
                                      >
                                        {c}
                                      </span>
                                      <button
                                        onClick={() => handleDeleteConcept(subject.name, chapter.id, cIdx)}
                                        className="text-[var(--text-muted)] hover:text-red-500 p-0.5 rounded transition opacity-60 hover:opacity-100"
                                      >
                                        <X className="w-2.5 h-2.5" />
                                      </button>
                                    </span>
                                  ))}
                                  {chapter.concepts.length === 0 && (
                                    <span className="text-[8px] text-[var(--text-muted)] italic">No concepts added.</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics Tab */}
              {activeTab === "topics" && (
                <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden text-left">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-[var(--bg-main)] text-[var(--text-muted)] font-bold uppercase tracking-wider border-b border-[var(--border)] text-[9px]">
                        <th className="p-4">Concept Name</th>
                        <th className="p-4">Subject</th>
                        <th className="p-4">Weightage</th>
                        <th className="p-4 text-center">PYQs Asked</th>
                        <th className="p-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] text-[var(--text-main)]">
                      {currentExam.topics.map((topic) => (
                        <tr key={topic.id} className="hover:bg-[var(--bg-main)]">
                          <td className="p-4 font-bold text-[var(--text-heading)]">{topic.conceptName}</td>
                          <td className="p-4">{topic.subject}</td>
                          <td className="p-4">
                            <span className="bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded font-bold">{topic.weightage}</span>
                          </td>
                          <td className="p-4 text-center font-bold">{topic.pyqQuestions}</td>
                          <td className="p-4 text-center">
                            <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded">Mapped</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Quizzes Tab */}
              {activeTab === "quiz" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  {currentExam.quizzes.map((quiz) => (
                    <div key={quiz.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 shadow flex justify-between items-center">
                      <div>
                        <span className="text-[9px] bg-[var(--bg-main)] text-[var(--text-main)] px-2 py-0.5 rounded font-bold border border-[var(--border)]">{quiz.subject}</span>
                        <h4 className="text-sm font-bold text-[var(--text-heading)] mt-2">{quiz.title}</h4>
                      </div>
                      <button
                        onClick={() => startAttempt(quiz.id, "quiz", quiz.title, currentExam.category)}
                        className="bg-violet-600 hover:bg-violet-500 text-white font-black text-xs px-3.5 py-2 rounded-xl transition"
                      >
                        Attempt
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Mocks Tab */}
              {activeTab === "mock" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  {currentExam.mocks.map((mock) => (
                    <div key={mock.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 shadow flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-heading)]">{mock.title}</h4>
                        <span className="text-[10px] text-[var(--text-muted)] font-bold">{mock.questionsCount} MCQs · {mock.durationHours} Hours</span>
                      </div>
                      <button
                        onClick={() => startAttempt(mock.id, "mock", mock.title, currentExam.category)}
                        className="bg-violet-600 hover:bg-violet-500 text-white font-black text-xs px-3.5 py-2 rounded-xl transition"
                      >
                        Attempt
                      </button>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* ── MODAL: Interactive Play & Attempt Simulator ────────────────── */}
      {attemptingItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-left">
            
            {/* Header */}
            <div className="p-6 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider bg-pink-500/10 text-pink-500 px-2.5 py-1 rounded-lg border border-pink-500/20">
                  Interactive Simulator
                </span>
                <h3 className="text-base font-black text-[var(--text-heading)] mt-2 leading-tight">
                  {attemptingItem.title}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                {!isAttemptFinished && (
                  <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border)] px-3.5 py-1.5 rounded-2xl text-xs font-bold text-[var(--text-main)] shrink-0 shadow-sm">
                    <Clock className="w-4 h-4 text-pink-500 animate-pulse" />
                    <span>{formatTime(timeRemaining)}</span>
                  </div>
                )}
                <button
                  onClick={() => {
                    setCustomConfirmModal({
                      title: "Quit Simulation?",
                      text: "All progress in this attempt will be lost.",
                      onConfirm: () => {
                        setAttemptingItem(null);
                      }
                    });
                  }}
                  className="text-[var(--text-muted)] hover:text-red-500 text-xs font-bold transition-all"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {!isAttemptFinished ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-bold">
                    <span>Question {currentQuestionIndex + 1} of {attemptingItem.questions.length}</span>
                    <span>{Math.round(((currentQuestionIndex + 1) / attemptingItem.questions.length) * 100)}% Complete</span>
                  </div>
                  <div className="w-full bg-[var(--bg-main)] h-1.5 rounded-full overflow-hidden border border-[var(--border)]">
                    <div className="bg-pink-500 h-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / attemptingItem.questions.length) * 100}%` }} />
                  </div>

                  <div className="bg-[var(--bg-main)] border border-[var(--border)] p-5 rounded-2xl">
                    <p className="text-sm text-[var(--text-heading)] font-bold leading-relaxed">{attemptingItem.questions[currentQuestionIndex].question}</p>
                  </div>

                  <div className="space-y-3">
                    {attemptingItem.questions[currentQuestionIndex].options.map((option, idx) => {
                      const isSel = selectedAnswers[currentQuestionIndex] === option;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: option }))}
                          className={`w-full text-left p-4 rounded-xl border transition-all text-xs font-bold flex items-center justify-between ${
                            isSel ? "bg-pink-500/10 border-pink-500 text-pink-500" : "bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] hover:text-[var(--text-heading)] hover:border-slate-400"
                          }`}
                        >
                          <span>{option}</span>
                          {isSel && <span className="w-2 h-2 rounded-full bg-pink-500" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-300 text-left">
                  <div className="text-center py-6 bg-[var(--bg-main)] rounded-3xl border border-[var(--border)]">
                    <span className="text-4xl">🎉</span>
                    <h4 className="text-lg font-black text-[var(--text-heading)] mt-2">Attempt Completed!</h4>
                    <div className="mt-5 text-3xl font-black text-pink-500">
                      {Object.keys(selectedAnswers).reduce((acc, qIdx) => {
                        const idx = Number(qIdx);
                        return acc + (selectedAnswers[idx] === attemptingItem.questions[idx].answer ? 1 : 0);
                      }, 0)} / {attemptingItem.questions.length} Correct
                    </div>
                  </div>

                  <div className="space-y-4">
                    {attemptingItem.questions.map((q, idx) => {
                      const userAns = selectedAnswers[idx];
                      const isCorrect = userAns === q.answer;
                      return (
                        <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-2xl space-y-3 shadow-sm">
                          <div className="flex justify-between items-start gap-3">
                            <p className="text-xs text-[var(--text-heading)] font-bold leading-relaxed flex-1">Q{idx + 1}. {q.question}</p>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${isCorrect ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>{isCorrect ? "Correct" : "Incorrect"}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-bold">
                            <div className="bg-[var(--bg-main)] p-2.5 rounded-xl border border-[var(--border)] flex justify-between items-center">
                              <span className="text-[var(--text-muted)]">Your Selection:</span>
                              <span className={isCorrect ? "text-emerald-500" : "text-red-500"}>{userAns || "No response"}</span>
                            </div>
                            <div className="bg-[var(--bg-main)] p-2.5 rounded-xl border border-[var(--border)] flex justify-between items-center">
                              <span className="text-[var(--text-muted)]">Correct Answer:</span>
                              <span className="text-emerald-500">{q.answer}</span>
                            </div>
                          </div>
                          <div className="bg-[var(--bg-main)] p-3 rounded-xl border border-[var(--border)] text-[10px] leading-relaxed text-[var(--text-muted)]">
                            <strong className="text-[var(--text-main)] block mb-0.5 font-bold">💡 Rationale:</strong>
                            {q.rationale}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-[var(--bg-main)] border-t border-[var(--border)] flex items-center justify-between">
              {!isAttemptFinished ? (
                <>
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition"
                  >
                    Previous Question
                  </button>
                  {currentQuestionIndex < attemptingItem.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-black px-4 py-2.5 rounded-xl transition shadow active:scale-95"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsAttemptFinished(true)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-2.5 rounded-xl transition shadow active:scale-95"
                    >
                      Submit Simulation
                    </button>
                  )}
                </>
              ) : (
                <div className="w-full flex justify-between items-center gap-3 text-xs">
                  <button
                    onClick={() => {
                      setCurrentQuestionIndex(0);
                      setSelectedAnswers({});
                      setIsAttemptFinished(false);
                      setTimeRemaining(300);
                    }}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 transition font-bold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Try Again
                  </button>
                  <button onClick={() => setAttemptingItem(null)} className="bg-pink-600 hover:bg-pink-500 text-white px-5 py-2.5 rounded-xl font-black transition shadow">
                    Finish & Close
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL 1: Category Form ──────────────────────── */}
      {categoryModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="p-6 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-sm font-black text-[var(--text-heading)] uppercase tracking-wider">
                {categoryModal.mode === "create" ? "Add New Category" : "Edit Category Settings"}
              </h3>
              <button onClick={() => setCategoryModal(null)} className="text-[var(--text-muted)] hover:text-[var(--text-heading)] p-1 hover:bg-[var(--bg-main)] rounded-lg transition animate-none">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (categoryModal.mode === "create") {
                const uniqueId = categoryModal.id.trim();
                setCategories(prev => [...prev, {
                  id: uniqueId,
                  name: categoryModal.name,
                  desc: categoryModal.desc,
                  icon: categoryModal.icon || "Microscope",
                  color: categoryModal.color,
                  shadow: `shadow-${categoryModal.color.split("-")[1]}-500/10`
                }]);
              } else {
                setCategories(prev => prev.map(c => c.id === categoryModal.id ? {
                  ...c,
                  name: categoryModal.name,
                  desc: categoryModal.desc,
                  icon: categoryModal.icon,
                  color: categoryModal.color
                } : c));
              }
              setCategoryModal(null);
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Category ID (Unique key)</label>
                <input
                  type="text"
                  required
                  disabled={categoryModal.mode === "edit"}
                  value={categoryModal.id}
                  onChange={(e) => setCategoryModal(prev => prev ? { ...prev, id: e.target.value } : null)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] disabled:opacity-50 text-[var(--text-main)] rounded-xl px-4 py-2.5 text-xs focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. Management"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={categoryModal.name}
                  onChange={(e) => setCategoryModal(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] rounded-xl px-4 py-2.5 text-xs focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. Management / MBA"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Description Brief</label>
                <textarea
                  required
                  rows={2}
                  value={categoryModal.desc}
                  onChange={(e) => setCategoryModal(prev => prev ? { ...prev, desc: e.target.value } : null)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] rounded-xl px-4 py-2.5 text-xs focus:border-amber-500 focus:outline-none resize-none"
                  placeholder="Summarize exams inside this category..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Representative Icon</label>
                  <select
                    value={categoryModal.icon}
                    onChange={(e) => setCategoryModal(prev => prev ? { ...prev, icon: e.target.value } : null)}
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] rounded-xl px-4 py-2.5 text-xs font-bold focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Microscope">🔬 Microscope (Medical)</option>
                    <option value="Cpu">💻 CPU / Tech (Engineering)</option>
                    <option value="Landmark">🏛️ Landmark / Government</option>
                    <option value="Scale">⚖️ Scale (Law)</option>
                    <option value="Shield">🛡️ Shield (Defence)</option>
                    <option value="Coins">💰 Coins (Banking)</option>
                    <option value="GraduationCap">🎓 Graduation (Education)</option>
                    <option value="Trophy">🏆 Trophy (Sports/Achievements)</option>
                    <option value="BookOpen">📖 Book Open (General)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Card Gradient</label>
                  <select
                    value={categoryModal.color}
                    onChange={(e) => setCategoryModal(prev => prev ? { ...prev, color: e.target.value } : null)}
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] rounded-xl px-4 py-2.5 text-xs font-bold focus:border-amber-500 focus:outline-none"
                  >
                    <option value="from-yellow-500 to-amber-600">Yellow-Amber</option>
                    <option value="from-pink-500 to-rose-600">Pink-Rose</option>
                    <option value="from-blue-500 to-indigo-600">Blue-Indigo</option>
                    <option value="from-purple-500 to-violet-600">Purple-Violet</option>
                    <option value="from-emerald-500 to-teal-600">Emerald-Teal</option>
                    <option value="from-cyan-500 to-sky-600">Cyan-Sky</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setCategoryModal(null)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl font-black transition active:scale-95 shadow-md">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Exam Form ─────────────────────────── */}
      {examModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="p-6 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-sm font-black text-[var(--text-heading)] uppercase tracking-wider">
                {examModal.mode === "create" ? "Register Exam Module" : "Edit Exam Configuration"}
              </h3>
              <button onClick={() => setExamModal(null)} className="text-[var(--text-muted)] hover:text-[var(--text-heading)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const abbr = examModal.name.trim();
              const full = examModal.fullName.trim();
              
              if (examModal.mode === "create") {
                try {
                  const res = await fetch(`${API_URL}/api/competitive-exams`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      examName: abbr,
                      category: selectedCategory,
                      conductedBy: examModal.conductedBy || "NTA",
                      registrationDeadline: examModal.regDeadline || "TBD",
                      examDate: examModal.examDate || "TBD",
                      eligibility: examModal.eligibility || "Standard 10+2 passing",
                      website: examModal.website || "https://",
                      syllabus: [
                        { name: "Biology", icon: "🧬", color: "text-pink-500 bg-pink-500/10", chapters: [] },
                        { name: "Chemistry", icon: "🧪", color: "text-emerald-500 bg-emerald-500/10", chapters: [] },
                        { name: "Physics", icon: "⚛️", color: "text-blue-500 bg-blue-500/10", chapters: [] }
                      ]
                    })
                  });
                  const result = await res.json();
                  if (result.success && result.data) {
                    const newItem = result.data;
                    setDb(prev => ({
                      ...prev,
                      [newItem.id]: {
                        id: newItem.id,
                        name: newItem.examName,
                        fullName: newItem.examName,
                        category: newItem.category,
                        conductedBy: newItem.conductedBy,
                        eligibility: newItem.eligibility,
                        website: newItem.website || "",
                        examDate: newItem.examDate,
                        regDeadline: newItem.registrationDeadline,
                        syllabus: newItem.syllabus || [],
                        topics: [],
                        quizzes: [],
                        mocks: []
                      }
                    }));
                    showToast("Exam registered successfully");
                  }
                } catch (err) {
                  console.error("Failed to create competitive exam:", err);
                }
              } else {
                try {
                  await fetch(`${API_URL}/api/competitive-exams/${examModal.id}`, {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      examName: abbr,
                      category: selectedCategory,
                      conductedBy: examModal.conductedBy,
                      registrationDeadline: examModal.regDeadline,
                      examDate: examModal.examDate,
                      eligibility: examModal.eligibility,
                      website: examModal.website
                    })
                  });
                  setDb(prev => {
                    const updated = { ...prev[examModal.id] };
                    updated.name = abbr;
                    updated.fullName = abbr;
                    updated.conductedBy = examModal.conductedBy;
                    updated.eligibility = examModal.eligibility;
                    updated.website = examModal.website;
                    updated.examDate = examModal.examDate;
                    updated.regDeadline = examModal.regDeadline;
                    return { ...prev, [examModal.id]: updated };
                  });
                  showToast("Exam settings updated");
                } catch (err) {
                  console.error("Failed to update competitive exam:", err);
                }
              }
              setExamModal(null);
            }} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Abbreviation</label>
                  <input
                    type="text"
                    required
                    value={examModal.name}
                    onChange={(e) => setExamModal(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] rounded-xl px-4 py-2.5 text-xs"
                    placeholder="e.g. JEE Main"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Conducted By</label>
                  <input
                    type="text"
                    required
                    value={examModal.conductedBy}
                    onChange={(e) => setExamModal(prev => prev ? { ...prev, conductedBy: e.target.value } : null)}
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] rounded-xl px-4 py-2.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Full Name of Examination</label>
                <input
                  type="text"
                  required
                  value={examModal.fullName}
                  onChange={(e) => setExamModal(prev => prev ? { ...prev, fullName: e.target.value } : null)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] rounded-xl px-4 py-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Eligibility Criteria</label>
                <input
                  type="text"
                  required
                  value={examModal.eligibility}
                  onChange={(e) => setExamModal(prev => prev ? { ...prev, eligibility: e.target.value } : null)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] rounded-xl px-4 py-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Official Website Link</label>
                <input
                  type="url"
                  required
                  value={examModal.website}
                  onChange={(e) => setExamModal(prev => prev ? { ...prev, website: e.target.value } : null)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] rounded-xl px-4 py-2.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Exam Date</label>
                  <input
                    type="text"
                    required
                    value={examModal.examDate}
                    onChange={(e) => setExamModal(prev => prev ? { ...prev, examDate: e.target.value } : null)}
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] rounded-xl px-4 py-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Reg Deadline</label>
                  <input
                    type="text"
                    required
                    value={examModal.regDeadline}
                    onChange={(e) => setExamModal(prev => prev ? { ...prev, regDeadline: e.target.value } : null)}
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] rounded-xl px-4 py-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setExamModal(null)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl font-black transition active:scale-95 shadow-md">
                  Register Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Topic Matrix Form ────────────────── */}
      {topicModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="p-6 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-sm font-black text-[var(--text-heading)] uppercase tracking-wider">
                {topicModal.mode === "create" ? "Add Concept Topic" : "Edit Concept"}
              </h3>
              <button onClick={() => setTopicModal(null)} className="text-[var(--text-muted)] hover:text-[var(--text-heading)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const sub = topicModal.subject.trim();
              const conc = topicModal.conceptName.trim();
              if (topicModal.mode === "create") {
                setDb(prev => {
                  const updated = { ...prev[selectedExamId] };
                  updated.topics = [
                    ...updated.topics,
                    {
                      id: "top_" + Date.now(),
                      subject: sub,
                      conceptName: conc,
                      weightage: topicModal.weightage,
                      pyqQuestions: Number(topicModal.pyqQuestions),
                      studyMaterials: { pdfs: 2, videos: 1 },
                      active: true
                    }
                  ];
                  return { ...prev, [selectedExamId]: updated };
                });
              } else {
                setDb(prev => {
                  const updated = { ...prev[selectedExamId] };
                  updated.topics = updated.topics.map(t => t.id === topicModal.id ? {
                    ...t,
                    subject: sub,
                    conceptName: conc,
                    weightage: topicModal.weightage,
                    pyqQuestions: Number(topicModal.pyqQuestions)
                  } : t);
                  return { ...prev, [selectedExamId]: updated };
                });
              }
              setTopicModal(null);
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={topicModal.subject}
                  onChange={(e) => setTopicModal(prev => prev ? { ...prev, subject: e.target.value } : null)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] rounded-xl px-4 py-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Concept Name</label>
                <input
                  type="text"
                  required
                  value={topicModal.conceptName}
                  onChange={(e) => setTopicModal(prev => prev ? { ...prev, conceptName: e.target.value } : null)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] rounded-xl px-4 py-2.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Weightage</label>
                  <select
                    value={topicModal.weightage}
                    onChange={(e) => setTopicModal(prev => prev ? { ...prev, weightage: e.target.value as any } : null)}
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] rounded-xl px-4 py-2.5 text-xs font-bold"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">PYQs Asked</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={topicModal.pyqQuestions}
                    onChange={(e) => setTopicModal(prev => prev ? { ...prev, pyqQuestions: Number(e.target.value) } : null)}
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] text-center rounded-xl px-4 py-2.5 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setTopicModal(null)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl font-black shadow-md">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 5: Quiz Blueprint Form ──────────────── */}
      {quizModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="p-6 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-sm font-black text-[var(--text-heading)] uppercase tracking-wider">
                {quizModal.mode === "create" ? "Configure Practice Quiz" : "Modify Quiz Settings"}
              </h3>
              <button onClick={() => setQuizModal(null)} className="text-[var(--text-muted)] hover:text-[var(--text-heading)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const title = quizModal.title.trim();
              const subject = quizModal.subject.trim();
              if (quizModal.mode === "create") {
                setDb(prev => {
                  const updated = { ...prev[selectedExamId] };
                  updated.quizzes = [
                    ...updated.quizzes,
                    {
                      id: "q_" + Date.now(),
                      title,
                      subject,
                      questionsCount: Number(quizModal.questionsCount),
                      durationMinutes: Number(quizModal.durationMinutes),
                      difficulty: quizModal.difficulty,
                      submissions: 0
                    }
                  ];
                  return { ...prev, [selectedExamId]: updated };
                });
              } else {
                setDb(prev => {
                  const updated = { ...prev[selectedExamId] };
                  updated.quizzes = updated.quizzes.map(q => q.id === quizModal.id ? {
                    ...q,
                    title,
                    subject,
                    questionsCount: Number(quizModal.questionsCount),
                    durationMinutes: Number(quizModal.durationMinutes),
                    difficulty: quizModal.difficulty
                  } : q);
                  return { ...prev, [selectedExamId]: updated };
                });
              }
              setQuizModal(null);
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Quiz Title</label>
                <input
                  type="text"
                  required
                  value={quizModal.title}
                  onChange={(e) => setQuizModal(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] rounded-xl px-4 py-2.5 text-xs"
                  placeholder="e.g. Molecular Genetics Challenge"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Subject Tag</label>
                <input
                  type="text"
                  required
                  value={quizModal.subject}
                  onChange={(e) => setQuizModal(prev => prev ? { ...prev, subject: e.target.value } : null)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] rounded-xl px-4 py-2.5 text-xs"
                  placeholder="e.g. Biology"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">MCQs count</label>
                  <input
                    type="number"
                    min={5}
                    required
                    value={quizModal.questionsCount}
                    onChange={(e) => setQuizModal(prev => prev ? { ...prev, questionsCount: Number(e.target.value) } : null)}
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] text-center rounded-xl px-4 py-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min={5}
                    required
                    value={quizModal.durationMinutes}
                    onChange={(e) => setQuizModal(prev => prev ? { ...prev, durationMinutes: Number(e.target.value) } : null)}
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] text-center rounded-xl px-4 py-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">Difficulty</label>
                  <select
                    value={quizModal.difficulty}
                    onChange={(e) => setQuizModal(prev => prev ? { ...prev, difficulty: e.target.value as any } : null)}
                    className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] rounded-xl px-4 py-2.5 text-xs font-bold"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setQuizModal(null)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-amber-500 hover:bg-amber-450 text-slate-950 px-5 py-2.5 rounded-xl font-black shadow-md">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: PDF Syllabus Auto-Detector & Segregator ────────────── */}
      {showPdfUploader && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-left flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-pink-500/10 text-pink-500 rounded-xl">
                  <FileText className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-black text-[var(--text-heading)] uppercase tracking-wider">
                    PDF Syllabus Parser & Segregator
                  </h3>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    Upload any official competitive syllabus PDF to automatically extract subjects, chapters, and concept trees.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowPdfUploader(false);
                  setUploadedFile(null);
                  setIsParsingPdf(false);
                  setParsedSyllabusResult(null);
                }} 
                className="text-[var(--text-muted)] hover:text-[var(--text-heading)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {!uploadedFile ? (
                // Step 1: Upload Dropzone
                <div 
                  onClick={() => {
                    const el = document.getElementById("pdf-file-input");
                    if (el) el.click();
                  }}
                  className="border-2 border-dashed border-[var(--border)] hover:border-pink-500 rounded-2xl p-10 text-center cursor-pointer transition-all bg-[var(--bg-main)] hover:bg-pink-500/5 group"
                >
                  <input
                    type="file"
                    id="pdf-file-input"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        handlePdfUploadSimulate(files[0]);
                      }
                    }}
                  />
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-card)] border border-[var(--border)] group-hover:border-pink-500/30 flex items-center justify-center mx-auto mb-4 transition-all">
                    <FileText className="w-6 h-6 text-[var(--text-muted)] group-hover:text-pink-500" />
                  </div>
                  <h4 className="text-xs font-bold text-[var(--text-heading)]">Drag & Drop Syllabus PDF here</h4>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">Supports official NTA, JEE, or state board curriculum files up to 10MB</p>
                  <span className="inline-block mt-4 bg-pink-500 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg transition active:scale-95 shadow-md">
                    Browse File
                  </span>
                </div>
              ) : (
                // Step 2: Processing OR Result Display
                <div className="space-y-6">
                  {/* Selected File Details */}
                  <div className="bg-[var(--bg-main)] border border-[var(--border)] p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center font-bold">
                        PDF
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-[var(--text-heading)] truncate max-w-xs">{uploadedFile.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] font-medium">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB · Official Document</div>
                      </div>
                    </div>
                    
                    {!isParsingPdf && (
                      <button
                        onClick={() => {
                          setUploadedFile(null);
                          setParsedSyllabusResult(null);
                        }}
                        className="text-xs font-bold text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {isParsingPdf ? (
                    // Processing Console
                    <div className="space-y-4 text-left">
                      <div className="flex justify-between items-center text-xs font-bold text-[var(--text-heading)]">
                        <span className="flex items-center gap-1.5 animate-pulse text-pink-500">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Parsing and segregating syllabus streams...
                        </span>
                        <span>{pdfParseStep * 33}%</span>
                      </div>
                      <div className="w-full bg-[var(--bg-main)] border border-[var(--border)] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-pink-500 h-full transition-all duration-500" 
                          style={{ width: `${pdfParseStep * 33}%` }}
                        />
                      </div>

                      {/* Log Console */}
                      <div 
                        style={{ backgroundColor: "#090f1d" }}
                        className="border border-slate-800 rounded-xl p-4 font-mono text-[10px] text-slate-300 space-y-1.5 h-36 overflow-y-auto"
                      >
                        {pdfParseLogs.map((log, index) => (
                          <div key={index} className={log.includes("[SUCCESS]") ? "text-emerald-400 font-bold" : "text-slate-300"}>
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Segregated Results Preview Pane
                    parsedSyllabusResult && (
                      <div className="space-y-4 text-left animate-in fade-in duration-300">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                          <div className="text-xs font-bold text-emerald-600">
                            Syllabus segregation complete! Preview parsed curriculum mapping below:
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {parsedSyllabusResult.map((subject, sIdx) => (
                            <div key={sIdx} className="bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl p-4 space-y-3">
                              <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)] font-bold text-[var(--text-heading)]">
                                <span>{subject.icon}</span>
                                <h4>{subject.name}</h4>
                              </div>
                              <div className="space-y-2">
                                {subject.chapters.map((ch, cIdx) => (
                                  <div key={cIdx} className="bg-[var(--bg-card)] border border-[var(--border)] p-2.5 rounded-lg text-left">
                                    <div className="text-[10px] font-extrabold text-[var(--text-heading)] mb-1 truncate">{ch.name}</div>
                                    <div className="flex flex-wrap gap-1">
                                      {ch.concepts.slice(0, 3).map((co, coIdx) => (
                                        <span key={coIdx} className="text-[8px] bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border)] px-1 py-0.5 rounded">
                                          {co}
                                        </span>
                                      ))}
                                      {ch.concepts.length > 3 && (
                                        <span className="text-[8px] text-pink-500 font-bold">+{ch.concepts.length - 3} more</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}

                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-4 bg-[var(--bg-main)] border-t border-[var(--border)] flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowPdfUploader(false);
                  setUploadedFile(null);
                  setIsParsingPdf(false);
                  setParsedSyllabusResult(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-bold transition"
              >
                Cancel
              </button>
              {parsedSyllabusResult && !isParsingPdf && (
                <button
                  type="button"
                  onClick={() => {
                    updateExamSyllabusStateAndDb(selectedExamId, (currentSyllabus) => {
                      const merged = [...currentSyllabus];
                      parsedSyllabusResult.forEach(parsedSub => {
                        const existingSub = merged.find(s => s.name.toLowerCase().includes(parsedSub.name.split(" ")[0].toLowerCase()));
                        if (existingSub) {
                          existingSub.chapters = [...existingSub.chapters, ...parsedSub.chapters];
                        } else {
                          merged.push(parsedSub);
                        }
                      });
                      return merged;
                    });

                    showToast("Syllabus imported successfully");
                    setShowPdfUploader(false);
                    setUploadedFile(null);
                    setParsedSyllabusResult(null);
                  }}
                  className="bg-pink-600 hover:bg-pink-500 text-white px-5 py-2.5 rounded-xl font-black transition active:scale-95 shadow-md"
                >
                  Confirm & Import to Syllabus Tree
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── HIGH-FIDELITY CUSTOM REACT DIALOGS ────────────────────────── */}

      {/* Custom Confirm Modal */}
      {customConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-[var(--text-heading)] uppercase tracking-wider mb-2">{customConfirmModal.title}</h4>
            <p className="text-xs text-[var(--text-muted)] mb-6 leading-relaxed">{customConfirmModal.text}</p>
            <div className="flex gap-2 justify-center text-xs font-bold">
              <button
                onClick={() => setCustomConfirmModal(null)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl transition"
              >
                {customConfirmModal.cancelText || "Cancel"}
              </button>
              <button
                onClick={() => {
                  customConfirmModal.onConfirm();
                  setCustomConfirmModal(null);
                }}
                className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl transition active:scale-95 shadow-md"
              >
                {customConfirmModal.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Input Modal */}
      {customInputModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 animate-in zoom-in-95 duration-200 text-left">
            <h4 className="text-xs font-black text-[var(--text-heading)] uppercase tracking-wider mb-3">{customInputModal.title}</h4>
            <input
              type="text"
              value={inputModalValue}
              onChange={(e) => setInputModalValue(e.target.value)}
              placeholder={customInputModal.placeholder}
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] rounded-xl px-4 py-2.5 text-xs focus:border-pink-500 focus:outline-none mb-6 font-bold"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && inputModalValue.trim()) {
                  customInputModal.onConfirm(inputModalValue.trim());
                  setCustomInputModal(null);
                }
              }}
            />
            <div className="flex gap-2 justify-end text-xs font-bold">
              <button
                onClick={() => setCustomInputModal(null)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (inputModalValue.trim()) {
                    customInputModal.onConfirm(inputModalValue.trim());
                    setCustomInputModal(null);
                  }
                }}
                className="bg-pink-600 hover:bg-pink-500 text-white px-5 py-2.5 rounded-xl transition active:scale-95 shadow-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Toast Alert */}
      {customToast && (
        <div className="fixed top-5 right-5 z-[110] bg-slate-900 text-white px-4.5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-800 animate-in slide-in-from-top-5 duration-300">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold">{customToast.title}</span>
        </div>
      )}

    </PortalLayout>
  );
}
