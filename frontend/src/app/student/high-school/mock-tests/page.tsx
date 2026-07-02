"use client";

import { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { BookOpen, Clock, FileText, CheckCircle, Play, ArrowLeft, Award, HelpCircle, ShieldAlert } from "lucide-react";
import Swal from "sweetalert2";

interface MockTest {
  id: string;
  title: string;
  subject: string;
  duration: number; // in minutes
  totalMarks: number;
  questionCount: number;
  difficulty: "Easy" | "Medium" | "Hard";
  questions: Array<{
    id: string;
    type: "mcq" | "short";
    text: string;
    options?: string[];
    answer: string;
    marks: number;
  }>;
}

const mockTestsData: MockTest[] = [
  {
    id: "maths-1",
    title: "SSLC Mathematics Board Model Paper I",
    subject: "Mathematics",
    duration: 180,
    totalMarks: 100,
    questionCount: 5,
    difficulty: "Medium",
    questions: [
      {
        id: "m1",
        type: "mcq",
        text: "If A = {1, 2, 3} and B = {a, b}, what is the number of relations from A to B?",
        options: ["A) 6", "B) 8", "C) 32", "D) 64"],
        answer: "D",
        marks: 1
      },
      {
        id: "m2",
        type: "mcq",
        text: "The common difference of the AP: 3, 1, -1, -3, ... is:",
        options: ["A) 2", "B) -2", "C) -1", "D) 3"],
        answer: "B",
        marks: 1
      },
      {
        id: "m3",
        type: "mcq",
        text: "The volume of a sphere of radius r is given by:",
        options: ["A) 4/3 π r³", "B) 2/3 π r³", "C) π r²", "D) 4 π r²"],
        answer: "A",
        marks: 1
      },
      {
        id: "m4",
        type: "short",
        text: "State Pythagoras Theorem.",
        answer: "In a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides.",
        marks: 5
      },
      {
        id: "m5",
        type: "short",
        text: "Solve the quadratic equation x² - 5x + 6 = 0.",
        answer: "x = 2 or x = 3",
        marks: 5
      }
    ]
  },
  {
    id: "science-1",
    title: "SSLC Science Model Exam II",
    subject: "Science",
    duration: 150,
    totalMarks: 75,
    questionCount: 4,
    difficulty: "Medium",
    questions: [
      {
        id: "s1",
        type: "mcq",
        text: "The refractive index of glass is 1.5. What is the speed of light in glass?",
        options: ["A) 2 × 10⁸ m/s", "B) 3 × 10⁸ m/s", "C) 1.5 × 10⁸ m/s", "D) 2.25 × 10⁸ m/s"],
        answer: "A",
        marks: 1
      },
      {
        id: "s2",
        type: "mcq",
        text: "Which of the following is a plant hormone?",
        options: ["A) Insulin", "B) Thyroxin", "C) Estrogen", "D) Auxin"],
        answer: "D",
        marks: 1
      },
      {
        id: "s3",
        type: "short",
        text: "Define Ohm's Law.",
        answer: "Ohm's Law states that the current passing through a conductor is directly proportional to the potential difference across its ends, provided temperature remains constant.",
        marks: 5
      },
      {
        id: "s4",
        type: "short",
        text: "What is the function of the human heart?",
        answer: "Pumps oxygenated blood to all body parts and returns deoxygenated blood to the lungs.",
        marks: 5
      }
    ]
  },
  {
    id: "social-1",
    title: "SSLC Social Science Board Practice Exam",
    subject: "Social Science",
    duration: 180,
    totalMarks: 100,
    questionCount: 3,
    difficulty: "Easy",
    questions: [
      {
        id: "ss1",
        type: "mcq",
        text: "In which year did the First World War begin?",
        options: ["A) 1912", "B) 1914", "C) 1918", "D) 1939"],
        answer: "B",
        marks: 1
      },
      {
        id: "ss2",
        type: "mcq",
        text: "The highest peak in South India is:",
        options: ["A) Anamudi", "B) Doddabetta", "C) Mahendragiri", "D) Kanchenjunga"],
        answer: "A",
        marks: 1
      },
      {
        id: "ss3",
        type: "short",
        text: "Mention the organs of the United Nations Organization (UNO).",
        answer: "General Assembly, Security Council, Economic and Social Council, Trusteeship Council, International Court of Justice, Secretariat.",
        marks: 5
      }
    ]
  }
];

export default function MockTestsPage() {
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [activeTest, setActiveTest] = useState<MockTest | null>(null);
  
  // Test execution state
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testFinished, setTestFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [maxPossibleScore, setMaxPossibleScore] = useState(0);
  
  const [dbTests, setDbTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchLiveMockTests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/teacher/questions?grade=Grade 10`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const grouped = data.data.reduce((acc: any, q: any) => {
          let duration = 180;
          const durMatch = q.topic.match(/Duration:\s*(\d+)/i);
          if (durMatch) {
            duration = parseInt(durMatch[1]) || 180;
          }
          const cleanTitle = q.topic.replace(/\s*\(Duration:\s*\d+\s*mins\)/i, "");

          if (!acc[cleanTitle]) {
            acc[cleanTitle] = {
              id: `live-${cleanTitle.replace(/\s+/g, "-").toLowerCase()}`,
              title: cleanTitle,
              subject: q.subject,
              duration: duration,
              totalMarks: 0,
              questionCount: 0,
              difficulty: q.difficulty,
              questions: []
            };
          }
          
          acc[cleanTitle].questions.push({
            id: q.id,
            type: q.type,
            text: q.text,
            options: q.options,
            answer: q.answer,
            marks: q.marks
          });
          acc[cleanTitle].totalMarks += q.marks;
          acc[cleanTitle].questionCount += 1;
          
          return acc;
        }, {});
        
        setDbTests(Object.values(grouped));
      }
    } catch (err) {
      console.error("Error loading live mock exams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMockTests();
  }, []);

  const subjects = ["All", "Mathematics", "Science", "Social Science"];

  const allAvailableTests = [...dbTests, ...mockTestsData];
  const filteredTests = selectedSubject === "All" 
    ? allAvailableTests 
    : allAvailableTests.filter(t => t.subject === selectedSubject);

  // Timer hook
  useEffect(() => {
    if (!activeTest || testFinished) return;
    if (timeLeft <= 0) {
      handleFinishTest();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTest, timeLeft, testFinished]);

  const handleStartTest = (test: MockTest) => {
    setActiveTest(test);
    setAnswers({});
    setTimeLeft(test.duration * 60);
    setTestFinished(false);
    setScore(0);
    setMaxPossibleScore(test.questions.reduce((sum, q) => sum + q.marks, 0));
  };

  const handleSelectMCQ = (qId: string, option: string) => {
    if (testFinished) return;
    const optionLetter = option.trim().charAt(0);
    setAnswers(prev => ({ ...prev, [qId]: optionLetter }));
  };

  const handleTextAnswer = (qId: string, val: string) => {
    if (testFinished) return;
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleFinishTest = () => {
    if (!activeTest) return;
    let computedScore = 0;
    activeTest.questions.forEach(q => {
      if (q.type === "mcq") {
        const studentAns = (answers[q.id] || "").toUpperCase().trim();
        const correctAns = q.answer.toUpperCase().trim().charAt(0);
        if (studentAns === correctAns) {
          computedScore += q.marks;
        }
      } else {
        if ((answers[q.id] || "").trim().length > 10) {
          computedScore += q.marks; // simple mock grading logic
        }
      }
    });

    setScore(computedScore);
    setTestFinished(true);

    Swal.fire({
      title: "Exam Submitted!",
      text: `You scored ${computedScore} out of ${maxPossibleScore} Marks!`,
      icon: "success",
      confirmButtonColor: "#3b82f6"
    });
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ":" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <PortalLayout title="Mock Tests 📝" subtitle="High School Board Exam Preparation Repository" accentColor="#3b82f6">
      <div className="space-y-6 text-left animate-in fade-in duration-300">
        
        {/* If no test is currently active, show test catalog */}
        {!activeTest ? (
          <>
            {/* Banner card */}
            <div className="relative overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 md:p-8 shadow-xl border-2 md:border-4 border-blue-100 dark:border-blue-950">
              <div className="absolute right-0 top-0 opacity-20 transform translate-x-1/4 -translate-y-1/4 scale-150 pointer-events-none mix-blend-overlay">
                <FileText className="w-64 h-64" />
              </div>
              <div className="relative z-10 space-y-4">
                <h2 className="text-2xl md:text-4xl font-black font-mono tracking-tight text-white">SSLC Mock Exam Repository</h2>
                <p className="text-blue-100 font-bold max-w-xl text-xs md:text-sm">
                  Simulate Tamil Nadu SSLC state board conditions. Challenge yourself with complete model papers, timed schedules, and structured score guides.
                </p>
              </div>
            </div>

            {/* Subject Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap border-2 ${
                    selectedSubject === sub
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-[var(--bg-card)] border-slate-100 dark:border-slate-800 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Test list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((test) => (
                <div
                  key={test.id}
                  className="bg-[var(--bg-card)] border-2 border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border tracking-wider text-blue-600 border-blue-600/20 bg-blue-500/10">
                        {test.subject}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        Difficulty: {test.difficulty}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[var(--text-heading)] mb-2 leading-snug">{test.title}</h3>
                    
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-[var(--border)] mb-4 text-center">
                      <div>
                        <div className="text-[10px] text-[var(--text-muted)] font-medium">Duration</div>
                        <div className="text-xs font-black text-[var(--text-heading)]">{test.duration} mins</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[var(--text-muted)] font-medium">Questions</div>
                        <div className="text-xs font-black text-[var(--text-heading)]">{test.questionCount} Qs</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[var(--text-muted)] font-medium">Marks</div>
                        <div className="text-xs font-black text-[var(--text-heading)]">{test.totalMarks} Marks</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartTest(test)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" /> Start Simulation
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Active Test Execution Mode */
          <div className="space-y-6">
            
            {/* Header controls & Timer */}
            <div className="bg-[var(--bg-card)] border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <button
                  onClick={() => {
                    if (!testFinished) {
                      Swal.fire({
                        title: "Quit Mock Exam?",
                        text: "Progress in this simulation will be lost.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#ef4444",
                        cancelButtonColor: "#64748b",
                        confirmButtonText: "Quit Test"
                      }).then((res) => {
                        if (res.isConfirmed) setActiveTest(null);
                      });
                    } else {
                      setActiveTest(null);
                    }
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline mb-1 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to mock repository
                </button>
                <h2 className="text-base md:text-lg font-black text-[var(--text-heading)]">{activeTest.title}</h2>
              </div>

              {/* Time remaining indicator */}
              <div className={`px-4 py-3 rounded-2xl flex items-center gap-2 border-2 ${
                testFinished
                  ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-850"
                  : timeLeft < 300
                  ? "bg-rose-500/10 border-rose-500 text-rose-600 animate-pulse font-black"
                  : "bg-blue-500/10 border-blue-500 text-blue-600 font-bold"
              }`}>
                <Clock className="w-5 h-5" />
                <div className="text-sm">
                  {testFinished ? (
                    <span className="font-bold text-slate-700 dark:text-slate-200">Exam Concluded</span>
                  ) : (
                    <span>Time Remaining: <strong className="font-mono">{formatTime(timeLeft)}</strong></span>
                  )}
                </div>
              </div>
            </div>

            {/* Questions container */}
            <div className="space-y-6">
              {activeTest.questions.map((q, idx) => {
                const isCorrect = q.type === "mcq" && answers[q.id] === q.answer.trim().charAt(0);
                return (
                  <div
                    key={q.id}
                    className={`bg-[var(--bg-card)] border-2 rounded-2xl p-5 md:p-6 transition-all ${
                      testFinished
                        ? q.type === "mcq"
                          ? isCorrect
                            ? "border-emerald-200 dark:border-emerald-950 bg-emerald-500/5"
                            : "border-rose-200 dark:border-rose-950 bg-rose-500/5"
                          : "border-slate-200 dark:border-slate-800"
                        : "border-slate-100 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        Question {idx + 1} · {q.type.toUpperCase()}
                      </h4>
                      <span className="text-xs font-bold bg-[var(--bg-main)] px-2.5 py-1 rounded-lg border border-[var(--border)]">
                        {q.marks} Mark{q.marks > 1 ? "s" : ""}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-[var(--text-heading)] mb-4">{q.text}</p>

                    {/* MCQ Options */}
                    {q.type === "mcq" && q.options && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((opt, optIdx) => {
                          const optionLetter = opt.trim().charAt(0);
                          const isSelected = answers[q.id] === optionLetter;
                          const isOptionCorrect = q.answer.trim().charAt(0) === optionLetter;

                          return (
                            <button
                              key={optIdx}
                              disabled={testFinished}
                              onClick={() => handleSelectMCQ(q.id, opt)}
                              className={`text-left p-3.5 rounded-xl text-xs font-medium border-2 transition-all ${
                                isSelected
                                  ? testFinished
                                    ? isOptionCorrect
                                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300"
                                      : "bg-rose-500/20 border-rose-500 text-rose-800 dark:text-rose-300"
                                    : "bg-blue-50/50 dark:bg-blue-950/20 border-blue-500 text-blue-700 dark:text-blue-300 font-bold"
                                  : testFinished && isOptionCorrect
                                  ? "bg-emerald-500/10 border-emerald-400 text-emerald-700 dark:text-emerald-300 font-bold"
                                  : "bg-[var(--bg-main)] border-slate-100 dark:border-slate-900 text-[var(--text-main)] hover:border-slate-200 dark:hover:border-slate-800"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Short Answer */}
                    {q.type === "short" && (
                      <div className="space-y-3">
                        <textarea
                          disabled={testFinished}
                          rows={4}
                          value={answers[q.id] || ""}
                          onChange={(e) => handleTextAnswer(q.id, e.target.value)}
                          placeholder="Type your exam solution sheet answer details here..."
                          className="w-full bg-[var(--input-bg)] border-2 border-[var(--input-border)] rounded-xl px-4 py-3 text-xs text-[var(--text-main)] focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all resize-none"
                        />
                        {testFinished && (
                          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-1">
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Model Key Answer Guide</span>
                            <p className="text-xs text-[var(--text-main)] leading-relaxed italic">"{q.answer}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Test controller submission bar */}
            {!testFinished ? (
              <button
                onClick={handleFinishTest}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3.5 text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" /> Conclude & Submit Mock Examination
              </button>
            ) : (
              <div className="bg-[var(--bg-card)] border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 text-2xl font-bold">
                    🏆
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[var(--text-heading)] uppercase tracking-wider">Evaluation Report</h4>
                    <p className="text-xs text-[var(--text-muted)]">SSLC Simulator Grade Card</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-[10px] text-[var(--text-muted)] font-medium">Final Score</div>
                    <div className="text-lg font-black text-blue-600 dark:text-blue-400">{score} / {maxPossibleScore} Marks</div>
                  </div>
                  <button
                    onClick={() => handleStartTest(activeTest)}
                    className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl px-5 py-3 text-xs font-bold transition-all"
                  >
                    Re-simulate Exam
                  </button>
                  <button
                    onClick={() => setActiveTest(null)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-3 text-xs font-bold transition-all shadow-md"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </PortalLayout>
  );
}
