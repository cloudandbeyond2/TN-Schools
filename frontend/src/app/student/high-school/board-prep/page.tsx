"use client";

export const dynamic = "force-dynamic";

import PortalLayout from "@/components/PortalLayout";
import { useState, useEffect } from "react";
import { 
  Clock, Brain, FileText, Timer, Bot, Award, Target, Calendar, 
  CheckSquare, Sparkles, Edit3, X, Check, BookOpen, Lightbulb, 
  BarChart3, Download, Play, ShieldAlert, Layers, ExternalLink
} from "lucide-react";
import { useSession } from "next-auth/react";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

const defaultSyllabusData: Record<string, any[]> = {
  "9": [
    { subject: "Mathematics", totalChapters: 9, completed: 5, color: "#ef4444" },
    { subject: "Science", totalChapters: 17, completed: 12, color: "#3b82f6" },
    { subject: "Social Science", totalChapters: 21, completed: 14, color: "#8b5cf6" },
    { subject: "English", totalChapters: 7, completed: 5, color: "#10b981" },
    { subject: "Tamil", totalChapters: 9, completed: 8, color: "#f59e0b" },
  ],
  "10": [
    { subject: "Mathematics", totalChapters: 15, completed: 9, color: "#ef4444" },
    { subject: "Science", totalChapters: 22, completed: 18, color: "#3b82f6" },
    { subject: "Social Science", totalChapters: 25, completed: 20, color: "#8b5cf6" },
    { subject: "English", totalChapters: 12, completed: 11, color: "#10b981" },
    { subject: "Tamil", totalChapters: 10, completed: 9, color: "#f59e0b" },
  ]
};

const initialAiWeaknessData: Record<string, any[]> = {
  "9": [
    {
      id: "w9-1",
      subject: "Mathematics",
      topic: "Algebra (Factorization)",
      impact: "High",
      accuracy: 48,
      suggestion: "Practice factorization using identity formulas, complete practice questions.",
      actionLink: "Start Practice Drill",
      quizQuestions: [
        { q: "Factorize: x² - 9", options: ["(x-3)(x+3)", "(x-9)(x+1)", "(x-3)²", "(x+3)²"], correct: 0, explanation: "Using identity a² - b² = (a-b)(a+b), x² - 3² = (x-3)(x+3)." },
        { q: "Factorize: x² + 5x + 6", options: ["(x+2)(x+3)", "(x+1)(x+6)", "(x-2)(x-3)", "(x+5)(x+1)"], correct: 0, explanation: "Find two numbers whose product is 6 and sum is 5 -> 2 and 3." },
        { q: "Expand: (2x + 3)²", options: ["4x² + 12x + 9", "4x² + 9", "2x² + 6x + 9", "4x² + 6x + 9"], correct: 0, explanation: "(a+b)² = a² + 2ab + b² -> 4x² + 12x + 9." }
      ]
    },
    {
      id: "w9-2",
      subject: "Science",
      topic: "Laws of Motion",
      impact: "Medium",
      accuracy: 60,
      suggestion: "Review Newton's second law numerical calculations.",
      actionLink: "Start Practice Drill",
      quizQuestions: [
        { q: "What is the unit of Force in SI system?", options: ["Newton (N)", "Joule (J)", "Watt (W)", "Pascal (Pa)"], correct: 0, explanation: "SI unit of force is Newton (kg·m/s²)." },
        { q: "A body of mass 5kg accelerates at 2 m/s². What is the force applied?", options: ["10 N", "7 N", "2.5 N", "20 N"], correct: 0, explanation: "Force F = m × a = 5 × 2 = 10 N." }
      ]
    }
  ],
  "10": [
    {
      id: "w10-1",
      subject: "Mathematics",
      topic: "Trigonometry Heights & Distances",
      impact: "High",
      accuracy: 42,
      suggestion: "Master tan 30°, 45°, 60° values and right-angle triangle elevation diagrams.",
      actionLink: "Start Practice Drill",
      quizQuestions: [
        { q: "What is the value of tan 45°?", options: ["1", "1/√3", "√3", "0"], correct: 0, explanation: "tan 45° is exactly 1." },
        { q: "If a 10m ladder touches a wall making 60° with the ground, what is the height on the wall?", options: ["5√3 m", "5 m", "10√3 m", "8 m"], correct: 0, explanation: "sin 60° = Opposite / Hypotenuse -> Opposite = 10 × (√3/2) = 5√3 m." },
        { q: "If sin θ = cos θ, what is the acute angle θ?", options: ["45°", "30°", "60°", "90°"], correct: 0, explanation: "sin 45° = cos 45° = 1/√2." }
      ]
    },
    {
      id: "w10-2",
      subject: "Science",
      topic: "Carbon & its Compounds (Nomenclature)",
      impact: "Medium",
      accuracy: 55,
      suggestion: "Practice IUPAC prefixes (meth, eth, prop, but) and functional groups.",
      actionLink: "Start Practice Drill",
      quizQuestions: [
        { q: "What is the chemical formula of Ethane?", options: ["C2H6", "CH4", "C2H4", "C3H8"], correct: 0, explanation: "Alkane formula CnH2n+2. For n=2 (Eth-), formula is C2H6." },
        { q: "Which functional group is present in Ethanol (-OH)?", options: ["Alcohol", "Aldehyde", "Carboxylic Acid", "Ketone"], correct: 0, explanation: "-OH suffix -ol represents the Alcohol functional group." }
      ]
    },
    {
      id: "w10-3",
      subject: "Social Science",
      topic: "Freedom Movement in Tamil Nadu & Map Marking",
      impact: "High",
      accuracy: 64,
      suggestion: "Revise V.O. Chidambaram, Subramania Bharati, and Salt Satyagraha in Vedaranyam.",
      actionLink: "Start Practice Drill",
      quizQuestions: [
        { q: "Who led the Salt Satyagraha march from Trichy to Vedaranyam in 1930?", options: ["C. Rajagopalachari", "K. Kamaraj", "Subramania Bharati", "V.O. Chidambaranar"], correct: 0, explanation: "C. Rajagopalachari (Rajaji) led the famous Vedaranyam Salt March." },
        { q: "Swadeshi Steam Navigation Company was launched at Tuticorin by?", options: ["V.O. Chidambaranar", "Periyar E.V.R.", "Bharathiyar", "Rettaimalai Srinivasan"], correct: 0, explanation: "V.O. Chidambaram Pillai (Kappalottiya Thamizhan) started the Swadeshi Steam Navigation Co." }
      ]
    }
  ]
};

const defaultPaperData: Record<string, any[]> = {
  "9": [
    {
      id: "p9-1",
      year: "2024",
      type: "Annual Exam Paper Set (5 Subjects)",
      status: "Not Attempted",
      totalScored: null,
      maxMarks: 500,
      subjectMarks: { Tamil: 0, English: 0, Mathematics: 0, Science: 0, "Social Science": 0 }
    },
    {
      id: "p9-2",
      year: "2023",
      type: "Annual Exam Paper Set (5 Subjects)",
      status: "Completed (425/500)",
      totalScored: 425,
      maxMarks: 500,
      subjectMarks: { Tamil: 82, English: 85, Mathematics: 88, Science: 84, "Social Science": 86 }
    },
    {
      id: "p9-3",
      year: "2024",
      type: "Half-Yearly Exam Paper Set",
      status: "Completed (435/500)",
      totalScored: 435,
      maxMarks: 500,
      subjectMarks: { Tamil: 85, English: 87, Mathematics: 90, Science: 85, "Social Science": 88 }
    },
    {
      id: "p9-4",
      year: "2024",
      type: "Quarterly Exam Paper Set",
      status: "Completed (450/500)",
      totalScored: 450,
      maxMarks: 500,
      subjectMarks: { Tamil: 88, English: 90, Mathematics: 92, Science: 88, "Social Science": 92 }
    }
  ],
  "10": [
    {
      id: "p10-1",
      year: "2024",
      type: "SSLC Board Public Exam Papers (5 Core Subjects)",
      status: "Not Attempted",
      totalScored: null,
      maxMarks: 500,
      subjectMarks: { Tamil: 0, English: 0, Mathematics: 0, Science: 0, "Social Science": 0 }
    },
    {
      id: "p10-2",
      year: "2023",
      type: "SSLC Board Public Exam Papers (5 Core Subjects)",
      status: "Completed (445/500)",
      totalScored: 445,
      maxMarks: 500,
      subjectMarks: { Tamil: 86, English: 90, Mathematics: 95, Science: 88, "Social Science": 86 }
    },
    {
      id: "p10-3",
      year: "2022",
      type: "SSLC Board Public Exam Papers (5 Core Subjects)",
      status: "Completed (460/500)",
      totalScored: 460,
      maxMarks: 500,
      subjectMarks: { Tamil: 90, English: 92, Mathematics: 98, Science: 92, "Social Science": 88 }
    },
    {
      id: "p10-4",
      year: "2024 PTA",
      type: "Model Public Question Papers (5 Core Subjects)",
      status: "Not Attempted",
      totalScored: null,
      maxMarks: 500,
      subjectMarks: { Tamil: 0, English: 0, Mathematics: 0, Science: 0, "Social Science": 0 }
    }
  ]
};

const defaultGoals: Record<string, any[]> = {
  "9": [
    { task: "Revise Science Ch-2 (Motion) notes", done: true },
    { task: "Complete Algebra Exercise 3.2", done: false },
    { task: "Practice 9th Tamil grammar rules", done: false },
  ],
  "10": [
    { task: "Read Science Ch-4 (Carbon Compounds)", done: true },
    { task: "Solve 15 Math Trigonometry PYQs", done: false },
    { task: "Take Tamil Public Exam Mini-Mock", done: false },
  ]
};

const boardBlueprint: Record<string, any[]> = {
  "10": [
    {
      subject: "Mathematics",
      totalMarks: 100,
      sections: [
        { part: "Part I", type: "MCQs (Objective)", count: "14 Questions", marks: "14 Marks" },
        { part: "Part II", type: "2-Mark Short Questions (10 out of 14)", count: "10 Questions", marks: "20 Marks" },
        { part: "Part III", type: "5-Mark Detailed Problems (10 out of 14)", count: "10 Questions", marks: "50 Marks" },
        { part: "Part IV", type: "8-Mark Practical Geometry & Graph", count: "2 Questions", marks: "16 Marks" },
      ],
      mustMasterChapters: ["Algebra (Matrices & Quadratic)", "Trigonometry & Heights", "Coordinate Geometry", "Practical Geometry & Statistics"],
      centumTip: "Compulsory Q.28 (2-mark) and Q.42 (5-mark) often test Trigonometry or Coordinate Geometry concepts. Solve all textbook exercise examples!"
    },
    {
      subject: "Science",
      totalMarks: 100,
      sections: [
        { part: "Part I", type: "1-Mark MCQs", count: "12 Questions", marks: "12 Marks" },
        { part: "Part II", type: "2-Mark Short Answers (7 out of 10)", count: "7 Questions", marks: "14 Marks" },
        { part: "Part III", type: "4-Mark Brief Answers & Numericals (7 out of 10)", count: "7 Questions", marks: "28 Marks" },
        { part: "Part IV", type: "7-Mark Long Answers (Internal Choice)", count: "3 Questions", marks: "21 Marks" },
        { part: "Practical Exam", type: "School Practical Assessment", count: "Labs & Record", marks: "25 Marks" },
      ],
      mustMasterChapters: ["Laws of Motion & Optics", "Carbon & Its Compounds", "Heredity & Evolution", "Genetics & Nervous System"],
      centumTip: "Draw neat ray diagrams with arrows in Optics. Write balanced chemical equations with state symbols (s, l, g, aq) for full marks!"
    },
    {
      subject: "Social Science",
      totalMarks: 100,
      sections: [
        { part: "Part I", type: "1-Mark MCQs", count: "14 Questions", marks: "14 Marks" },
        { part: "Part II", type: "2-Mark Short Answers (10 out of 14)", count: "10 Questions", marks: "20 Marks" },
        { part: "Part III", type: "5-Mark Detailed Answers + Timeline (10 out of 14)", count: "10 Questions", marks: "50 Marks" },
        { part: "Part IV", type: "Map Marking (India & World Map)", count: "2 Maps", marks: "16 Marks" },
      ],
      mustMasterChapters: ["World War I & II / Freedom Movement", "Indian Geography & Climate", "Indian Constitution & Foreign Policy", "Economics - Globalization"],
      centumTip: "Never skip Timeline events (1900-1950) in History Q.43. Practice Map marking twice a week for guaranteed 16 marks."
    },
    {
      subject: "English",
      totalMarks: 100,
      sections: [
        { part: "Part I", type: "Synonyms, Antonyms, Grammar MCQs", count: "20 Questions", marks: "20 Marks" },
        { part: "Part II", type: "Prose & Poem Short Qs, Grammar Transformation", count: "10 Questions", marks: "20 Marks" },
        { part: "Part III", type: "Paragraph Answers, Poem Memory, Supplementary", count: "10 Questions", marks: "50 Marks" },
        { part: "Part IV", type: "General Essay & Comprehension Passage", count: "2 Questions", marks: "10 Marks" },
      ],
      mustMasterChapters: ["Grammar: Active/Passive & Reported Speech", "Prose Paragraph Summaries", "Memoriter Poems", "Letter Writing & Slogan Design"],
      centumTip: "Write stanza & poet name clearly for Poem paragraph questions. Underline keywords in grammar transformations!"
    },
    {
      subject: "Tamil",
      totalMarks: 100,
      sections: [
        { part: "பகுதி I", type: "பலவுள் தெரிவு (MCQs)", count: "15 வினாக்கள்", marks: "15 மதிப்பெண்கள்" },
        { part: "பகுதி II", type: "குறுவினாக்கள் (செய்யுள், உரைநடை, இலக்கணம்)", count: "9 வினாக்கள்", marks: "18 மதிப்பெண்கள்" },
        { part: "பகுதி III", type: "சிறுவினாக்கள் & மனப்பாடப் பாடல்", count: "6 வினாக்கள்", marks: "18 மதிப்பெண்கள்" },
        { part: "பகுதி IV", type: "நெடுவினாக்கள் & கட்டுரை", count: "5 வினாக்கள்", marks: "49 மதிப்பெண்கள்" },
      ],
      mustMasterChapters: ["அலகு 1-9 இலக்கணப் பகுதிகள்", "மனப்பாடப் பாடல்கள் (பிழையின்றி)", "கட்டுரை & கடிதம்", "துணைப்பாடக் கதைகள்"],
      centumTip: "மனப்பாடப் பாடல்களில் அடி பிறழாமல் எழுதவும். அணி இலக்கணத்தில் சான்று மற்றும் விளக்கம் தனித்தனியே தலைப்பிட்டு எழுதவும்."
    }
  ],
  "9": [
    {
      subject: "Mathematics",
      totalMarks: 100,
      sections: [
        { part: "Section A", type: "MCQs", count: "14 Questions", marks: "14 Marks" },
        { part: "Section B", type: "2-Mark Short Answers", count: "10 Questions", marks: "20 Marks" },
        { part: "Section C", type: "5-Mark Detailed Problems", count: "10 Questions", marks: "50 Marks" },
        { part: "Section D", type: "8-Mark Practical Geometry & Graphs", count: "2 Questions", marks: "16 Marks" }
      ],
      mustMasterChapters: ["Real Numbers & Algebra", "Coordinate Geometry", "Mensuration & Geometry", "Probability & Statistics"],
      centumTip: "Focus on Factorization identities and Coordinate Geometry formula proofs for Class 10 readiness."
    },
    {
      subject: "Science",
      totalMarks: 100,
      sections: [
        { part: "Section A", type: "1-Mark MCQs", count: "12 Questions", marks: "12 Marks" },
        { part: "Section B", type: "2-Mark Short Answers", count: "7 Questions", marks: "14 Marks" },
        { part: "Section C", type: "4-Mark Brief Answers", count: "7 Questions", marks: "28 Marks" },
        { part: "Section D", type: "7-Mark Long Answers", count: "3 Questions", marks: "21 Marks" }
      ],
      mustMasterChapters: ["Motion & Fluids", "Atomic Structure & Periodic Classification", "Plant & Animal Physiology", "Applied Microbiology"],
      centumTip: "Practice diagram drawing for Plant cell structure and Motion graphs."
    }
  ]
};

export default function BoardPrepPage() {
  const { data: session } = useSession();
  const [student, setStudent] = useState<any>({ id: "student-default-1", name: "Test Student", class: "10" });
  const [selectedGrade, setSelectedGrade] = useState<"9" | "10">("10");
  const [activeTab, setActiveTab] = useState<"overview" | "ai-analysis" | "pyq" | "blueprint">("overview");

  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  const [timerSeconds, setTimerSeconds] = useState(1500); // 25:00
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerPreset, setTimerPreset] = useState<"25" | "50" | "5">("25");

  const [syllabus, setSyllabus] = useState<any[]>([]);
  const [activeGoals, setActiveGoals] = useState<any[]>([]);
  const [papersList, setPapersList] = useState<any[]>([]);
  const [aiWeaknesses, setAiWeaknesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [targetScore, setTargetScore] = useState<number>(480);
  const [targetAmbition, setTargetAmbition] = useState<string>("Computer Science Engineering at Anna University");
  const [showEditTargetModal, setShowEditTargetModal] = useState(false);
  const [tempTargetScore, setTempTargetScore] = useState<number>(480);
  const [tempTargetAmbition, setTempTargetAmbition] = useState<string>("");

  const [customGoalText, setCustomGoalText] = useState("");
  const [showAddGoal, setShowAddGoal] = useState(false);

  // 5-Subject Board Marksheet state
  const [submittingPaper, setSubmittingPaper] = useState<any>(null);
  const [marksheet, setMarksheet] = useState<{ [subject: string]: number }>({
    Tamil: 86,
    English: 90,
    Mathematics: 95,
    Science: 88,
    "Social Science": 86
  });
  
  const [viewingPaperDetail, setViewingPaperDetail] = useState<any>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [activePracticeModal, setActivePracticeModal] = useState<any>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    if (successToast) {
      const t = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successToast]);

  useEffect(() => {
    const targetDateStr = selectedGrade === "10" ? "2027-03-26T09:30:00+05:30" : "2027-04-08T09:30:00+05:30";
    const targetDate = new Date(targetDateStr).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((difference % (1000 * 60)) / 1000);
        setCountdown({ days, hours, mins, secs });
      } else {
        setCountdown({ days: 0, hours: 0, mins: 0, secs: 0 });
      }
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [selectedGrade]);

  useEffect(() => {
    fetch(`${API_BASE}/api/students`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          const myStudent = (session?.user as any)?.id 
            ? json.data.find((s: any) => s.userId === (session?.user as any)?.id)
            : null;
          const matchedStudent = myStudent || json.data[0];
          setStudent(matchedStudent);
          if (matchedStudent && (matchedStudent.class === "9" || matchedStudent.class === 9)) {
            setSelectedGrade("9");
          } else {
            setSelectedGrade("10");
          }
        }
      })
      .catch((err) => console.error("Error fetching student list:", err));
  }, [session]);

  useEffect(() => {
    const studentId = student?.id || "student-default-1";
    setLoading(true);

    try {
      const cachedPapers = localStorage.getItem(`tn_board_papers_${selectedGrade}`);
      if (cachedPapers) setPapersList(JSON.parse(cachedPapers));
      else setPapersList(defaultPaperData[selectedGrade]);

      const cachedGoals = localStorage.getItem(`tn_board_goals_${selectedGrade}`);
      if (cachedGoals) setActiveGoals(JSON.parse(cachedGoals));
      else setActiveGoals(defaultGoals[selectedGrade]);

      const cachedSyllabus = localStorage.getItem(`tn_board_syllabus_${selectedGrade}`);
      if (cachedSyllabus) setSyllabus(JSON.parse(cachedSyllabus));
      else setSyllabus(defaultSyllabusData[selectedGrade]);
    } catch (e) {
      console.warn("LocalStorage read warning:", e);
    }

    fetch(`${API_BASE}/api/students/${studentId}/board-prep?class=${selectedGrade}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          if (json.data.syllabusProgress && json.data.syllabusProgress.length > 0) {
            setSyllabus(json.data.syllabusProgress);
          }
          if (json.data.goals && json.data.goals.length > 0) {
            setActiveGoals(json.data.goals);
          }

          if (json.data.targetScore) setTargetScore(json.data.targetScore);
          if (json.data.targetAmbition) setTargetAmbition(json.data.targetAmbition);

          const serverMarks = json.data.marks || [];
          const basePapers = defaultPaperData[selectedGrade];
          
          if (serverMarks.length > 0) {
            const updatedPapers = basePapers.map((paper: any) => {
              const matchedServerMarks = serverMarks.filter((m: any) => 
                m.paperName.toLowerCase().includes(paper.year.toLowerCase()) || 
                paper.year.toLowerCase().includes(m.paperName.toLowerCase())
              );

              if (matchedServerMarks.length > 0) {
                const newSubjectMarks: Record<string, number> = { ...paper.subjectMarks };
                matchedServerMarks.forEach((m: any) => {
                  if (m.subject) newSubjectMarks[m.subject] = m.scored;
                });
                const total = Object.values(newSubjectMarks).reduce((a, b) => a + b, 0);
                return {
                  ...paper,
                  status: `Completed (${total}/500)`,
                  totalScored: total,
                  subjectMarks: newSubjectMarks
                };
              }
              return paper;
            });
            setPapersList(updatedPapers);
            try {
              localStorage.setItem(`tn_board_papers_${selectedGrade}`, JSON.stringify(updatedPapers));
            } catch(e) {}
          }
        }
        setAiWeaknesses(initialAiWeaknessData[selectedGrade]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Backend fetch board prep error:", err);
        setAiWeaknesses(initialAiWeaknessData[selectedGrade]);
        setLoading(false);
      });
  }, [student, selectedGrade]);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const toggleTimer = () => {
    if (timerSeconds === 0) {
      setTimerSeconds(timerPreset === "25" ? 1500 : timerPreset === "50" ? 3000 : 300);
    }
    setTimerRunning(!timerRunning);
  };

  const setPresetTime = (preset: "25" | "50" | "5") => {
    setTimerPreset(preset);
    setTimerRunning(false);
    if (preset === "25") setTimerSeconds(1500);
    else if (preset === "50") setTimerSeconds(3000);
    else if (preset === "5") setTimerSeconds(300);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleGoal = (idx: number) => {
    const updated = [...activeGoals];
    updated[idx].done = !updated[idx].done;
    setActiveGoals(updated);
    try {
      localStorage.setItem(`tn_board_goals_${selectedGrade}`, JSON.stringify(updated));
    } catch(e) {}

    const studentId = student?.id || "student-default-1";
    fetch(`${API_BASE}/api/students/${studentId}/board-prep/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goals: updated, class: selectedGrade })
    }).catch((err) => console.error("Error saving goal:", err));
  };

  const addCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoalText.trim()) return;
    const updated = [...activeGoals, { task: customGoalText, done: false }];
    setActiveGoals(updated);
    setCustomGoalText("");
    setShowAddGoal(false);
    setSuccessToast("New Board Goal added successfully!");
    try {
      localStorage.setItem(`tn_board_goals_${selectedGrade}`, JSON.stringify(updated));
    } catch(e) {}

    const studentId = student?.id || "student-default-1";
    fetch(`${API_BASE}/api/students/${studentId}/board-prep/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goals: updated, class: selectedGrade })
    }).catch((err) => console.error("Error saving goal:", err));
  };

  const handleSyllabusChange = (subject: string, completed: number) => {
    const updated = syllabus.map((s) => s.subject === subject ? { ...s, completed } : s);
    setSyllabus(updated);
    try {
      localStorage.setItem(`tn_board_syllabus_${selectedGrade}`, JSON.stringify(updated));
    } catch(e) {}

    const studentId = student?.id || "student-default-1";
    fetch(`${API_BASE}/api/students/${studentId}/board-prep/syllabus`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, completed, class: selectedGrade })
    }).catch((err) => console.error("Error updating syllabus:", err));
  };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    setTargetScore(tempTargetScore);
    setTargetAmbition(tempTargetAmbition);
    setShowEditTargetModal(false);
    setSuccessToast("Target Score & Career Goal updated!");

    const studentId = student?.id || "student-default-1";
    fetch(`${API_BASE}/api/students/${studentId}/board-prep/target`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetScore: tempTargetScore,
        targetAmbition: tempTargetAmbition,
        class: selectedGrade
      })
    }).catch((err) => console.error("Error updating target:", err));
  };

  // Open 5-Subject Board Marksheet Modal
  const openMarksheetModal = (paper: any) => {
    setSubmittingPaper(paper);
    if (paper.subjectMarks) {
      setMarksheet({ ...paper.subjectMarks });
    } else {
      setMarksheet({ Tamil: 85, English: 88, Mathematics: 92, Science: 90, "Social Science": 85 });
    }
  };

  // Handle 5-Subject Marksheet Submit
  const handleMarksheetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingPaper) return;

    const totalScored = Object.values(marksheet).reduce((a, b) => Number(a) + Number(b), 0);
    const paperNameFull = `${submittingPaper.year} ${submittingPaper.type}`;

    // 1. Optimistic Local UI Update
    const updatedPapers = papersList.map((p) => {
      if (p.id === submittingPaper.id || p.year === submittingPaper.year) {
        return {
          ...p,
          status: `Completed (${totalScored}/500)`,
          totalScored: totalScored,
          subjectMarks: { ...marksheet }
        };
      }
      return p;
    });

    setPapersList(updatedPapers);
    setSubmittingPaper(null);
    setSuccessToast(`Logged 5-Subject Result: ${totalScored}/500 Marks for ${paperNameFull}!`);

    // 2. Persist to LocalStorage Backup
    try {
      localStorage.setItem(`tn_board_papers_${selectedGrade}`, JSON.stringify(updatedPapers));
    } catch(e) {}

    // 3. Persist to Backend API
    const studentId = student?.id || "student-default-1";
    fetch(`${API_BASE}/api/students/${studentId}/board-prep/submit-paper`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paperName: paperNameFull,
        subjectMarks: marksheet,
        class: selectedGrade
      })
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          console.log("5-Subject Board Marksheet persisted to backend database!");
        }
      })
      .catch((err) => console.error("Error submitting marksheet to backend:", err));
  };

  const openPracticeDrill = (item: any) => {
    setActivePracticeModal(item);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  const handleSelectQuizOption = (optIdx: number) => {
    if (showExplanation) return;
    setSelectedOption(optIdx);
    setShowExplanation(true);
    if (activePracticeModal.quizQuestions[currentQuestionIdx].correct === optIdx) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const nextQuizQuestion = () => {
    if (currentQuestionIdx + 1 < activePracticeModal.quizQuestions.length) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
      const newAccuracy = Math.min(100, Math.round(((quizScore + 1) / activePracticeModal.quizQuestions.length) * 100));
      setAiWeaknesses((prev) =>
        prev.map((w) => (w.id === activePracticeModal.id ? { ...w, accuracy: Math.max(w.accuracy, newAccuracy) } : w))
      );
    }
  };

  const currentSyllabus = syllabus.length > 0 ? syllabus : (defaultSyllabusData[selectedGrade] || []);
  const currentWeaknesses = aiWeaknesses.length > 0 ? aiWeaknesses : (initialAiWeaknessData[selectedGrade] || []);
  const currentPapers = papersList.length > 0 ? papersList : (defaultPaperData[selectedGrade] || []);
  const currentGoals = activeGoals.length > 0 ? activeGoals : (defaultGoals[selectedGrade] || []);

  const totalChaptersCount = currentSyllabus.reduce((acc, item) => acc + item.totalChapters, 0);
  const completedChaptersCount = currentSyllabus.reduce((acc, item) => acc + item.completed, 0);
  const syllabusPct = totalChaptersCount > 0 ? Math.round((completedChaptersCount / totalChaptersCount) * 100) : 70;
  
  // Accurate Board Score Predictor out of 500
  const completedPapersWithScores = currentPapers.filter(p => p.totalScored != null && p.totalScored > 0);
  const avgMockTotalScore = completedPapersWithScores.length > 0 
    ? Math.round(completedPapersWithScores.reduce((a, b) => a + b.totalScored, 0) / completedPapersWithScores.length) 
    : 440;
  
  const estimatedBoardScore = Math.round((syllabusPct / 100 * 250) + (avgMockTotalScore * 0.5));

  const userName = session?.user?.name || student?.name || "Student";
  const subtitle = selectedGrade === "10" 
    ? "Your ultimate command center for scoring Centum in 10th SSLC Public Board Exams."
    : "Build a rock-solid foundation in Class 9 annual exams for SSLC Board victory.";

  // Calculate live total for marksheet modal
  const liveMarksheetTotal = Object.values(marksheet).reduce((a, b) => Number(a || 0) + Number(b || 0), 0);
  const livePct = ((liveMarksheetTotal / 500) * 100).toFixed(1);

  return (
    <PortalLayout
      title={selectedGrade === "10" ? "SSLC Board Preparation Hub" : "Class 9 Annual Exam Preparation Hub"}
      subtitle={subtitle}
    >
      {/* Toast Notification Alert */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white font-extrabold text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-400 animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Grade / Class Switcher */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-slate-800 dark:text-slate-200 font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Showing personalized prep for:
        </div>
        <div className="flex bg-slate-200 dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
          <button
            onClick={() => setSelectedGrade("9")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedGrade === "9"
                ? "bg-red-600 text-white shadow-md"
                : "text-slate-800 dark:text-slate-200 hover:text-red-600 font-extrabold"
            }`}
          >
            Class 9 (Annuals)
          </button>
          <button
            onClick={() => setSelectedGrade("10")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedGrade === "10"
                ? "bg-red-600 text-white shadow-md"
                : "text-slate-800 dark:text-slate-200 hover:text-red-600 font-extrabold"
            }`}
          >
            Class 10 (SSLC Boards)
          </button>
        </div>
      </div>

      {/* Top Real-time Countdown Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-center justify-between border-l-4 border-red-500 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            Countdown to {selectedGrade === "10" ? "TN SSLC Public Exams 2027" : "Class 9 Final Exams 2027"} 
            <Clock className="w-5 h-5 text-red-400 animate-pulse" />
          </h2>
          <p className="text-slate-300 text-sm max-w-xl leading-relaxed font-medium">
            {selectedGrade === "10" 
              ? `Stay consistent, ${userName}! Predicted Board Score: ${estimatedBoardScore}/500 based on 5-subject mock results & syllabus.`
              : `Great foundations lead to Centum scores, ${userName}. Master high-weightage chapters early!`}
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <div className="bg-slate-800 rounded-xl p-3 text-center min-w-[75px] border border-red-500/50 shadow-inner">
            <div className="text-2xl font-black text-red-400 font-mono">{countdown.days}</div>
            <div className="text-[11px] text-slate-300 uppercase font-bold">Days</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-3 text-center min-w-[75px] border border-slate-700 shadow-inner">
            <div className="text-2xl font-black text-white font-mono">{countdown.hours}</div>
            <div className="text-[11px] text-slate-300 uppercase font-bold">Hrs</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-3 text-center min-w-[75px] border border-slate-700 shadow-inner">
            <div className="text-2xl font-black text-white font-mono">{countdown.mins}</div>
            <div className="text-[11px] text-slate-300 uppercase font-bold">Mins</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-3 text-center min-w-[75px] border border-slate-700 shadow-inner">
            <div className="text-2xl font-black text-amber-400 font-mono">{countdown.secs}</div>
            <div className="text-[11px] text-slate-300 uppercase font-bold">Secs</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-300 dark:border-slate-700/80 pb-3">
        <button 
          onClick={() => setActiveTab("overview")}
          className={`text-xs sm:text-sm font-extrabold px-4 py-2.5 transition-all rounded-xl flex items-center gap-2 ${
            activeTab === "overview" 
              ? "bg-red-600 text-white shadow-md" 
              : "bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <BookOpen className="w-4 h-4" /> Syllabus Tracker ({syllabusPct}%)
        </button>
        <button 
          onClick={() => setActiveTab("ai-analysis")}
          className={`text-xs sm:text-sm font-extrabold px-4 py-2.5 transition-all rounded-xl flex items-center gap-2 ${
            activeTab === "ai-analysis" 
              ? "bg-red-600 text-white shadow-md" 
              : "bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Brain className="w-4 h-4" /> AI Weakness Detector & Practice
        </button>
        <button 
          onClick={() => setActiveTab("pyq")}
          className={`text-xs sm:text-sm font-extrabold px-4 py-2.5 transition-all rounded-xl flex items-center gap-2 ${
            activeTab === "pyq" 
              ? "bg-red-600 text-white shadow-md" 
              : "bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" /> {selectedGrade === "10" ? "Board Question Papers (PYQ)" : "Practice Exam Papers"}
        </button>
        <button 
          onClick={() => setActiveTab("blueprint")}
          className={`text-xs sm:text-sm font-extrabold px-4 py-2.5 transition-all rounded-xl flex items-center gap-2 ${
            activeTab === "blueprint" 
              ? "bg-amber-600 text-white shadow-md" 
              : "bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 text-amber-800 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" /> Exam Blueprint & Centum Strategy
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-red-600" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Loading your board prep command center...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Main Content Area based on Tab */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* TAB 1: SYLLABUS TRACKER */}
            {activeTab === "overview" && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Syllabus Completion
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Log completed textbook chapters dynamically.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">Total Completed:</span>
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{completedChaptersCount}/{totalChaptersCount} Ch.</span>
                  </div>
                </div>

                <div className="space-y-5">
                  {currentSyllabus.map((sub, idx) => {
                    const percent = Math.round((sub.completed / sub.totalChapters) * 100);
                    const colorMap: Record<string, string> = {
                      Mathematics: "#dc2626",
                      Science: "#2563eb",
                      "Social Science": "#7c3aed",
                      English: "#059669",
                      Tamil: "#d97706"
                    };
                    const color = colorMap[sub.subject] || "#dc2626";
                    
                    return (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                            {sub.subject}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              disabled={sub.completed <= 0}
                              onClick={() => handleSyllabusChange(sub.subject, sub.completed - 1)}
                              className="bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-red-100 dark:hover:bg-red-950 px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-30 text-xs font-bold transition-all"
                            >
                              -
                            </button>
                            <span className="text-xs font-mono text-slate-900 dark:text-white font-extrabold min-w-[70px] text-center">
                              {sub.completed} / {sub.totalChapters} Ch.
                            </span>
                            <button
                              disabled={sub.completed >= sub.totalChapters}
                              onClick={() => handleSyllabusChange(sub.subject, sub.completed + 1)}
                              className="bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-emerald-100 dark:hover:bg-emerald-950 px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-30 text-xs font-bold transition-all"
                            >
                              +
                            </button>
                            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono ml-2 min-w-[45px] text-right">
                              {percent}%
                            </span>
                          </div>
                        </div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ width: `${percent}%`, backgroundColor: color }}
                          />
                        </div>
                        {percent < 70 ? (
                          <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5" /> Below 70% target. Complete remaining chapters to boost your board score!
                          </p>
                        ) : (
                          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-2 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> On track for high score in {sub.subject}.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: AI WEAKNESS DETECTOR & INTERACTIVE DRILLS */}
            {activeTab === "ai-analysis" && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <Brain className="w-5 h-5 text-red-600 dark:text-red-400" /> AI Weakness Detector & Practice Quiz
                    </h3>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">Identified from textbook chapter tests and quiz responses.</p>
                  </div>
                  <span className="bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs px-3 py-1.5 rounded-full border border-red-300 dark:border-red-800 font-bold whitespace-nowrap">
                    Interactive Practice Ready
                  </span>
                </div>

                <div className="space-y-4">
                  {currentWeaknesses.map((weakness, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-red-400 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{weakness.subject}</span>
                          <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{weakness.topic}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-slate-600 dark:text-slate-300 uppercase block font-bold">BOARD WEIGHTAGE</span>
                          <span className={`text-xs font-extrabold px-3 py-1 rounded-md mt-1 inline-block ${
                            weakness.impact === 'High' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200 border border-red-300 dark:border-red-800' 
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                          }`}>
                            {weakness.impact} Weightage
                          </span>
                        </div>
                      </div>

                      {/* Accuracy bar box */}
                      <div className="mb-4 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Accuracy Score:</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${weakness.accuracy > 70 ? 'bg-emerald-600' : weakness.accuracy > 50 ? 'bg-amber-500' : 'bg-red-600'}`}
                              style={{ width: `${weakness.accuracy}%` }}
                            />
                          </div>
                          <strong className="text-xs font-mono font-extrabold text-slate-900 dark:text-white">{weakness.accuracy}%</strong>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          {weakness.suggestion}
                        </p>
                        <button 
                          onClick={() => openPracticeDrill(weakness)}
                          className="text-xs font-extrabold bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl transition-all shadow-md whitespace-nowrap flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> {weakness.actionLink}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: PREVIOUS YEAR PAPERS (PYQ) & 5-SUBJECT MARKSHEET */}
            {activeTab === "pyq" && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-red-600" />
                      {selectedGrade === "10" ? "SSLC Board Public Exam Papers (5 Core Subjects)" : "Class 9 Annual Exam Question Papers"}
                    </h3>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                      Download 5-subject question papers & log your full Board Public Exam mock results out of 500 marks.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {currentPapers.map((paper, idx) => {
                    const isAttempted = paper.totalScored != null && paper.totalScored > 0;

                    return (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-sm hover:border-red-500 transition-all group">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div className="p-2.5 bg-red-100 dark:bg-red-950/60 rounded-xl border border-red-200 dark:border-red-800">
                              <Award className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                              isAttempted 
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-700' 
                                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                            }`}>
                              {isAttempted ? `Scored: ${paper.totalScored}/500 (${Math.round((paper.totalScored/500)*100)}%)` : "Not Attempted"}
                            </span>
                          </div>

                          <h4 className="text-slate-900 dark:text-white font-black text-base mb-1">{paper.year} {paper.type}</h4>
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                            Contains 5 Subject Papers: Tamil, English, Math, Science & Social (100 Marks each = 500 Total).
                          </p>

                          {/* Subject Score Pills Breakdown if attempted */}
                          {isAttempted && paper.subjectMarks && (
                            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 mb-3 grid grid-cols-5 gap-1.5 text-center">
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold block">TAM</span>
                                <span className="text-xs font-extrabold text-slate-900 dark:text-white">{paper.subjectMarks.Tamil || 0}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold block">ENG</span>
                                <span className="text-xs font-extrabold text-slate-900 dark:text-white">{paper.subjectMarks.English || 0}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold block">MAT</span>
                                <span className="text-xs font-extrabold text-red-600 dark:text-red-400">{paper.subjectMarks.Mathematics || 0}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold block">SCI</span>
                                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">{paper.subjectMarks.Science || 0}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold block">SOC</span>
                                <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">{paper.subjectMarks["Social Science"] || 0}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2.5 mt-2">
                          <button 
                            onClick={() => setViewingPaperDetail(paper)}
                            className="w-full py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-extrabold rounded-xl transition-colors border border-slate-300 dark:border-slate-600 flex items-center justify-center gap-2 shadow-sm"
                          >
                            <BookOpen className="w-4 h-4 text-red-600" /> View 5 Subject Papers & PDF Keys
                          </button>
                          <button 
                            onClick={() => openMarksheetModal(paper)}
                            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                          >
                            <Edit3 className="w-4 h-4" /> {isAttempted ? "Update 5-Subject Board Marksheet" : "Log Full 5-Subject Board Result"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: EXAM BLUEPRINT & CENTUM STRATEGY */}
            {activeTab === "blueprint" && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-amber-500" /> TN State Board Exam Blueprint & Strategy
                    </h3>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">Official section breakdown, question pattern, and Centum scoring secrets.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {boardBlueprint[selectedGrade]?.map((bp: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div className="flex justify-between items-center mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-amber-400 flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-500" /> {bp.subject} Paper Pattern ({bp.totalMarks} Marks)
                        </h4>
                        <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full font-bold border border-amber-300 dark:border-amber-700">
                          Official Blueprint
                        </span>
                      </div>

                      {/* Sections breakdown table */}
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full text-xs text-left text-slate-800 dark:text-slate-200">
                          <thead className="bg-slate-200 dark:bg-slate-900 text-slate-900 dark:text-slate-300 uppercase font-bold">
                            <tr>
                              <th className="p-2.5 rounded-l-lg">Part</th>
                              <th className="p-2.5">Question Type</th>
                              <th className="p-2.5">Distribution</th>
                              <th className="p-2.5 rounded-r-lg">Marks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {bp.sections.map((sec: any, sIdx: number) => (
                              <tr key={sIdx} className="hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium">
                                <td className="p-2.5 font-bold text-slate-900 dark:text-white">{sec.part}</td>
                                <td className="p-2.5">{sec.type}</td>
                                <td className="p-2.5 text-slate-700 dark:text-slate-300 font-semibold">{sec.count}</td>
                                <td className="p-2.5 font-mono text-emerald-700 dark:text-emerald-400 font-extrabold">{sec.marks}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Must master chapters */}
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-3">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase block mb-2">High Weightage "Must-Master" Chapters:</span>
                        <div className="flex flex-wrap gap-2">
                          {bp.mustMasterChapters.map((ch: string, cIdx: number) => (
                            <span key={cIdx} className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 font-semibold">
                              ✓ {ch}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Centum Tip */}
                      <div className="bg-amber-50 dark:bg-amber-950/60 p-3.5 rounded-xl border border-amber-300 dark:border-amber-700 flex items-start gap-2.5 text-xs text-slate-900 dark:text-amber-200">
                        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-800 dark:text-amber-300 font-bold">Centum Scoring Strategy:</strong> {bp.centumTip}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Target & Study Tools */}
          <div className="space-y-6">
            
            {/* Target Card with Edit Option */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-emerald-500 shadow-md relative">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">My Board Target</h3>
                <button 
                  onClick={() => {
                    setTempTargetScore(targetScore);
                    setTempTargetAmbition(targetAmbition);
                    setShowEditTargetModal(true);
                  }}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg transition-colors shadow-sm flex items-center gap-1 font-extrabold"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              </div>

              <div className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                {targetScore}<span className="text-xl text-emerald-600 dark:text-emerald-400 font-bold">/500</span>
              </div>

              {/* Progress towards target */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 font-bold mb-1">
                  <span>Predicted Score: <strong className="text-slate-900 dark:text-white">{estimatedBoardScore}/500</strong></span>
                  <span>{Math.round((estimatedBoardScore / targetScore) * 100)}% of goal</span>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (estimatedBoardScore / targetScore) * 100)}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-3 mt-3 font-medium">
                <strong className="text-slate-900 dark:text-white block mb-0.5 font-bold">Career Ambition:</strong>
                {targetAmbition}
              </p>
            </div>

            {/* Daily Goals Checklist */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-red-600 dark:text-red-400" /> Daily Action Goals
                </h3>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {currentGoals.filter(g => g.done).length}/{currentGoals.length} Done
                </span>
              </div>

              <div className="space-y-3">
                {currentGoals.map((goal: any, idx: number) => (
                  <label key={idx} className="flex items-start gap-3 cursor-pointer group p-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
                    <div 
                      onClick={() => toggleGoal(idx)}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        goal.done ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-600 group-hover:border-red-500'
                      }`}
                    >
                      {goal.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className={`text-xs font-semibold leading-relaxed ${goal.done ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
                      {goal.task}
                    </span>
                  </label>
                ))}
              </div>

              {showAddGoal ? (
                <form onSubmit={addCustomGoal} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Solve 10 Math 5-mark Qs..."
                    value={customGoalText}
                    onChange={(e) => setCustomGoalText(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-600 flex-1 font-medium"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-md"
                  >
                    Save
                  </button>
                </form>
              ) : (
                <button 
                  onClick={() => setShowAddGoal(true)}
                  className="mt-4 w-full py-2.5 border-2 border-slate-300 dark:border-slate-700 hover:border-slate-400 text-slate-900 dark:text-white text-xs font-extrabold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  + Add Custom Board Goal
                </button>
              )}
            </div>

            {/* Pomodoro Timer with Presets */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center py-6">
              <div className="flex gap-2 mb-4 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => setPresetTime("25")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    timerPreset === "25" ? "bg-red-600 text-white shadow-md" : "text-slate-800 dark:text-slate-200 hover:text-slate-900"
                  }`}
                >
                  25m Focus
                </button>
                <button 
                  onClick={() => setPresetTime("50")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    timerPreset === "50" ? "bg-red-600 text-white shadow-md" : "text-slate-800 dark:text-slate-200 hover:text-slate-900"
                  }`}
                >
                  50m Deep
                </button>
                <button 
                  onClick={() => setPresetTime("5")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    timerPreset === "5" ? "bg-emerald-600 text-white shadow-md" : "text-slate-800 dark:text-slate-200 hover:text-slate-900"
                  }`}
                >
                  5m Break
                </button>
              </div>

              <Timer className={`w-9 h-9 mb-2 transition-colors ${timerRunning ? "text-red-600 animate-pulse" : "text-emerald-600"}`} />
              <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Study Focus Session</h3>
              <div className="text-4xl font-mono font-black text-slate-900 dark:text-white mb-4 tracking-wider">{formatTime(timerSeconds)}</div>
              
              <button 
                onClick={toggleTimer}
                className={`w-full py-3 rounded-xl font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 ${
                  timerRunning 
                    ? "bg-red-600 hover:bg-red-700 text-white" 
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                {timerRunning ? "Pause Session" : "Start Focus Timer"}
              </button>
            </div>

          </div>

        </div>
      )}

      {/* EDIT TARGET MODAL */}
      {showEditTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-2xl relative">
            <button 
              onClick={() => setShowEditTargetModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" /> Customize Board Target
            </h3>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-4">Set your target score out of 500 and your career goal.</p>
            
            <form onSubmit={handleSaveTarget} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">Target Total Score (out of 500)</label>
                <input 
                  type="number"
                  min="300"
                  max="500"
                  value={tempTargetScore}
                  onChange={(e) => setTempTargetScore(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-emerald-600 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">Career Ambition / Dream Goal</label>
                <input 
                  type="text"
                  value={tempTargetAmbition}
                  onChange={(e) => setTempTargetAmbition(e.target.value)}
                  placeholder="e.g. Medicine at MMC / CSE at Anna University"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-emerald-600 font-medium"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditTargetModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition-colors text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-xs shadow-md"
                >
                  Save Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INTERACTIVE AI PRACTICE DRILL MODAL */}
      {activePracticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl p-6 rounded-2xl border border-red-500/50 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setActivePracticeModal(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
              <Brain className="w-4 h-4" /> AI Practice Drill — {activePracticeModal.subject}
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-3">{activePracticeModal.topic}</h3>

            {!quizCompleted ? (
              <div>
                <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1.5 font-bold">
                  <span>Question {currentQuestionIdx + 1} of {activePracticeModal.quizQuestions.length}</span>
                  <span>Score: {quizScore}/{currentQuestionIdx}</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full mb-5 overflow-hidden">
                  <div 
                    className="h-full bg-red-600 rounded-full transition-all"
                    style={{ width: `${((currentQuestionIdx + 1) / activePracticeModal.quizQuestions.length) * 100}%` }}
                  />
                </div>

                {/* Question box */}
                <div className="bg-slate-100 dark:bg-slate-800/90 p-4 rounded-xl border border-slate-300 dark:border-slate-700 mb-4">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-relaxed">
                    {activePracticeModal.quizQuestions[currentQuestionIdx].q}
                  </h4>
                </div>

                {/* Options */}
                <div className="space-y-2.5 mb-5">
                  {activePracticeModal.quizQuestions[currentQuestionIdx].options.map((opt: string, oIdx: number) => {
                    const isCorrect = activePracticeModal.quizQuestions[currentQuestionIdx].correct === oIdx;
                    const isSelected = selectedOption === oIdx;

                    let btnStyle = "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-red-500 font-semibold";
                    if (showExplanation) {
                      if (isCorrect) btnStyle = "bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold";
                      else if (isSelected) btnStyle = "bg-red-100 dark:bg-red-950 border-red-500 text-red-900 dark:text-red-200 font-bold";
                      else btnStyle = "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60";
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={showExplanation}
                        onClick={() => handleSelectQuizOption(oIdx)}
                        className={`w-full p-3.5 rounded-xl border text-xs text-left transition-all flex items-center justify-between shadow-sm ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {showExplanation && isCorrect && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                        {showExplanation && isSelected && !isCorrect && <X className="w-4 h-4 text-red-600 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation box */}
                {showExplanation && (
                  <div className="bg-amber-50 dark:bg-slate-950 p-4 rounded-xl border border-amber-300 dark:border-slate-800 mb-5">
                    <p className="text-xs text-slate-900 dark:text-slate-200 leading-relaxed font-medium">
                      <strong className="text-amber-800 dark:text-amber-400 block mb-1 font-bold">Concept Solution:</strong>
                      {activePracticeModal.quizQuestions[currentQuestionIdx].explanation}
                    </p>
                  </div>
                )}

                {/* Action button */}
                {showExplanation && (
                  <div className="flex justify-end">
                    <button
                      onClick={nextQuizQuestion}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md"
                    >
                      {currentQuestionIdx + 1 < activePracticeModal.quizQuestions.length ? "Next Question →" : "View Final Score"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                  <Award className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">Practice Drill Completed!</h4>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  You scored <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">{quizScore} / {activePracticeModal.quizQuestions.length}</strong> on {activePracticeModal.topic}.
                </p>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Your dynamic topic accuracy score has been updated in your dashboard!
                </p>
                <button
                  onClick={() => setActivePracticeModal(null)}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW SUBJECT PAPERS & PDF PREVIEW MODAL */}
      {viewingPaperDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl p-6 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setViewingPaperDetail(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4" /> Board Exam Question Papers Archive
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
              {viewingPaperDetail.year} {viewingPaperDetail.type}
            </h3>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-5">
              Official TN State Board 5 Subject Question Papers & Answer Keys.
            </p>

            <div className="space-y-3 mb-6">
              {[
                { sub: "Tamil", lang: "தமிழ் (தாள் I & II)", time: "3 Hrs", icon: "📘", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-300" },
                { sub: "English", lang: "English Paper I & II", time: "3 Hrs", icon: "📕", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300" },
                { sub: "Mathematics", lang: "Mathematics (கணிதம்)", time: "3 Hrs", icon: "📐", bg: "bg-red-50 dark:bg-red-950/40 border-red-300" },
                { sub: "Science", lang: "Science (அறிவியல் - Theory & Practical)", time: "3 Hrs", icon: "🔬", bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-300" },
                { sub: "Social Science", lang: "Social Science (சமூக அறிவியல்)", time: "3 Hrs", icon: "🌍", bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-300" }
              ].map((item, sIdx) => (
                <div key={sIdx} className={`p-3.5 rounded-xl border flex items-center justify-between ${item.bg}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h5 className="text-xs font-black text-slate-900 dark:text-white">{viewingPaperDetail.year} {item.sub} Question Paper</h5>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">{item.lang} • {item.time}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => alert(`Downloading official ${viewingPaperDetail.year} ${item.sub} Board Question Paper & Answer Key PDF...`)}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-extrabold rounded-lg border border-slate-300 dark:border-slate-600 flex items-center gap-1 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setViewingPaperDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  openMarksheetModal(viewingPaperDetail);
                  setViewingPaperDetail(null);
                }}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md"
              >
                Log 5-Subject Result
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOG 5-SUBJECT BOARD MARKSHEET MODAL */}
      {submittingPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg p-6 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSubmittingPaper(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" /> Official 5-Subject Board Marksheet
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
              Log Exam Results: {submittingPaper.year} {submittingPaper.type}
            </h3>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-5">
              Enter your test marks for all 5 core subjects to calculate your total Board Exam score out of 500.
            </p>

            <form onSubmit={handleMarksheetSubmit} className="space-y-4">
              
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                {[
                  { key: "Tamil", label: "📘 Tamil", color: "text-amber-600" },
                  { key: "English", label: "📕 English", color: "text-emerald-600" },
                  { key: "Mathematics", label: "📐 Mathematics", color: "text-red-600" },
                  { key: "Science", label: "🔬 Science (Theory + Practical)", color: "text-blue-600" },
                  { key: "Social Science", label: "🌍 Social Science", color: "text-purple-600" }
                ].map((subObj, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <label className={`text-xs font-extrabold ${subObj.color}`}>{subObj.label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={marksheet[subObj.key] ?? 0}
                        onChange={(e) => setMarksheet({ ...marksheet, [subObj.key]: Number(e.target.value) })}
                        className="w-20 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-extrabold text-center rounded-lg p-1.5 text-xs focus:outline-none focus:border-red-600"
                        required
                      />
                      <span className="text-xs font-bold text-slate-400">/ 100</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Scored Summary Card */}
              <div className="bg-slate-900 text-white p-4 rounded-xl border-l-4 border-emerald-500 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase block">TOTAL BOARD MOCK SCORE</span>
                  <div className="text-xl font-black text-white font-mono">
                    {liveMarksheetTotal} <span className="text-xs text-emerald-400 font-bold">/ 500 Marks ({livePct}%)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold px-3 py-1 bg-emerald-600 text-white rounded-full inline-block">
                    {liveMarksheetTotal >= 450 ? "Grade A1 (Distinction)" : liveMarksheetTotal >= 400 ? "Grade A2 (First Class)" : liveMarksheetTotal >= 350 ? "Grade B1" : "Grade B2"}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittingPaper(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md"
                >
                  Save Full Marksheet (500 Marks)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
