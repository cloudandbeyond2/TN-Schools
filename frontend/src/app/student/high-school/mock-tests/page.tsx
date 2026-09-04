"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";
import { BookOpen, Clock, FileText, CheckCircle, Play, ArrowLeft, Award, HelpCircle, ShieldAlert, Globe } from "lucide-react";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface MockTest {
  id: string;
  sslcId?: string; // set for teacher-published tests served by /api/sslc-prep (graded server-side)
  title: string;
  description?: string;
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
  isCustom?: boolean;
  assignmentId?: string;
  hasSubmitted?: boolean;
  score?: number | null;
  createdByRole?: string;
}

export default function MockTestsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedSender, setSelectedSender] = useState<"All" | "HM" | "Teacher">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const [activeTest, setActiveTest] = useState<MockTest | null>(null);
  
  // Test execution state
  const [testStatus, setTestStatus] = useState<"idle" | "instructions" | "running">("idle");
  const [language, setLanguage] = useState<"English" | "Tamil">("English");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testFinished, setTestFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [maxPossibleScore, setMaxPossibleScore] = useState(0);
  
  const [dbTests, setDbTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Resolve the logged-in student (needed to record attempts against their profile)
  useEffect(() => {
    const userId = (session?.user as any)?.id;
    if (!userId) return;

    fetch(`${API_URL}/api/students?userId=${userId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data.length > 0) {
          setStudent(json.data[0]);
        }
      })
      .catch(() => {});
  }, [session]);

  // Teacher-published SSLC mock tests (answer keys are stripped by the server;
  // these tests are graded server-side when submitted).
  const fetchSSLCTests = async (): Promise<MockTest[]> => {
    try {
      const params = new URLSearchParams();
      if (student?.class === "9" || student?.class === 9) params.set("class", "9");
      else params.set("class", "10");
      if (student?.schoolId) params.set("schoolId", student.schoolId);
      const res = await fetch(`${API_URL}/api/sslc-prep/mock-tests?${params.toString()}`);
      const data = await res.json();
      if (!data.success || !Array.isArray(data.data)) return [];
      return data.data.map((t: any) => ({
        id: `sslc-${t._id}`,
        sslcId: String(t._id),
        title: t.title,
        description: t.description || "",
        subject: t.subject,
        duration: t.durationMinutes || 180,
        totalMarks: t.totalMarks || 100,
        questionCount: t.questionCount || (t.questions || []).length,
        difficulty: t.difficulty || "Medium",
        questions: (t.questions || []).map((q: any) => ({
          id: q.qid,
          type: q.type,
          text: q.text,
          options: q.options,
          answer: q.answer || "",
          marks: q.marks || 1,
        })),
      }));
    } catch {
      return [];
    }
  };

  const fetchLiveMockTests = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch custom mock tests assigned to student
      let customTests: MockTest[] = [];
      if (student) {
        try {
          const studentId = student.id;
          const customRes = await fetch(`${API_URL}/api/mock-tests/student/${studentId}`);
          const customData = await customRes.json();
          if (customData.success && Array.isArray(customData.data)) {
            customTests = customData.data.map((assignment: any) => {
              const t = assignment.mockTest;
              const hasSubmitted = assignment.submissions && assignment.submissions.length > 0;
              const score = hasSubmitted ? assignment.submissions[0].score : null;
              return {
                id: `custom-${assignment.id}`,
                assignmentId: assignment.id,
                title: t.title,
                description: t.description || "",
                subject: t.subject,
                duration: t.duration,
                totalMarks: t.totalMarks,
                questionCount: t.questions?.length || 0,
                difficulty: "Medium" as const,
                isCustom: true,
                hasSubmitted,
                score,
                createdByRole: t.createdByRole || "TEACHER",
                questions: []
              };
            });
          }
        } catch (err) {
          console.error("Error loading custom assigned mock tests:", err);
        }
      }

      // 2. Fetch SSLC Board mock tests
      const sslcTests = await fetchSSLCTests();
      
      // 3. Fetch teacher questions Grade 10 mock tests
      let groupedMockTests: MockTest[] = [];
      try {
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
          groupedMockTests = Object.values(grouped) as MockTest[];
        }
      } catch (err) {
        console.error("Error loading teacher questions mock exams:", err);
      }

      // Combine custom assigned tests, SSLC board tests, and teacher question bank tests
      setDbTests([
        ...customTests,
        ...sslcTests,
        ...groupedMockTests
      ]);

    } catch (err) {
      console.error("Error loading live mock exams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!student) return;
    fetchLiveMockTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student]);

  const subjects = ["All", "Tamil", "English", "Mathematics", "Science", "Social Science"];

  const allAvailableTests = dbTests;

  // Deduplicate tests by title to prevent showing duplicate cards if assigned multiple times
  const uniqueTestsMap = new Map<string, MockTest>();
  allAvailableTests.forEach(t => {
    const existing = uniqueTestsMap.get(t.title);
    if (!existing) {
      uniqueTestsMap.set(t.title, t);
    } else {
      // If the current one is unsubmitted, prefer it over the submitted one
      if (t.isCustom && !t.hasSubmitted && existing.hasSubmitted) {
        uniqueTestsMap.set(t.title, t);
      }
    }
  });
  const uniqueAvailableTests = Array.from(uniqueTestsMap.values());

  const filteredTests = uniqueAvailableTests.filter(t => {
    // Subject Filter
    const matchesSubject = selectedSubject === "All" || t.subject === selectedSubject;

    // Sender Filter (HM vs Teacher)
    let matchesSender = true;
    if (selectedSender === "HM") {
      matchesSender = !!t.isCustom && t.createdByRole === "HEADMASTER";
    } else if (selectedSender === "Teacher") {
      matchesSender = !!t.isCustom && t.createdByRole === "TEACHER";
    }

    return matchesSubject && matchesSender;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubject, selectedSender]);

  const totalPages = Math.ceil(filteredTests.length / ITEMS_PER_PAGE);
  const paginatedTests = filteredTests.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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

  const showInstructions = (test: MockTest) => {
    setActiveTest(test);
    setTestStatus("instructions");
  };

  const handleStartTest = (test: MockTest) => {
    setAnswers({});
    const durationMins = Math.min(test.duration, 20); // Cap at 20 mins
    setTimeLeft(durationMins * 60);
    setTestFinished(false);
    setScore(0);
    setMaxPossibleScore(test.questions.reduce((sum, q) => sum + q.marks, 0));
    setTestStatus("running");
  };

  const exitTestMode = () => {
    setActiveTest(null);
    setTestStatus("idle");
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

  const handleFinishTest = async () => {
    if (!activeTest) return;

    // Teacher-published SSLC tests are graded on the server (answer keys
    // are never sent to the browser). Short answers use a self-evaluation
    // heuristic consistent with the local simulator.
    if (activeTest.sslcId) {
      const selfMarks: Record<string, number> = {};
      activeTest.questions.forEach((q) => {
        if (q.type !== "mcq") {
          selfMarks[q.id] = (answers[q.id] || "").trim().length > 10 ? q.marks : 0;
        }
      });
      try {
        const res = await fetch(`${API_URL}/api/sslc-prep/mock-tests/${activeTest.sslcId}/attempts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: student?.id || (session?.user as any)?.id,
            answers,
            selfMarks,
          }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setScore(data.data.score);
          setTestFinished(true);
          Swal.fire({
            title: "Exam Submitted!",
            text: `You scored ${data.data.score} out of ${data.data.maxScore} Marks (${data.data.percentage}%). Your attempt has been recorded for your teacher.`,
            icon: "success",
            confirmButtonColor: "#3b82f6"
          });
          return;
        }
      } catch (err) {
        console.error("Server grading failed, falling back to local scoring:", err);
      }
    }

    let computedScore = 0;
    activeTest.questions.forEach(q => {
      if (q.type === "mcq") {
        const studentAns = (answers[q.id] || "").toUpperCase().trim();
        const correctAns = (q.answer || "").toUpperCase().trim().charAt(0);
        if (correctAns && studentAns === correctAns) {
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
    <PortalLayout title="Mock Tests 📝" subtitle="High School Board Exam Preparation Repository" accentColor="#3b82f6" hideSidebar={testStatus !== "idle"}>
      <div key={testStatus} className="space-y-6 text-left animate-in fade-in duration-300">
        
        {/* If no test is currently active, show test catalog */}
        {testStatus === "idle" || !activeTest ? (
          <>
            {/* Header Banner card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 glass rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
              <div className="flex items-start sm:items-center gap-3">
                <i className="fi fi-sr-file-edit text-xl sm:text-2xl text-blue-600 dark:text-blue-400 flex items-center shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <h2 className="text-base sm:text-lg md:text-xl font-black text-black dark:text-white uppercase tracking-wider leading-tight">
                    SSLC Mock Exam Repository
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Simulate Tamil Nadu SSLC state board conditions. Challenge yourself with complete model papers, timed schedules, and structured score guides.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 whitespace-nowrap shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60 self-start sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Grade:</span>
                <span className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold text-xs sm:text-sm rounded-xl border border-blue-200/20 shadow-sm">
                  <i className="fi fi-sr-graduation-cap flex items-center text-xs sm:text-sm" />
                  Class 10th Standard
                </span>
              </div>
            </div>

            {/* Subject and Source Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              {/* Left side: Subjects */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {subjects.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(sub)}
                    className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap border-2 ${
                      selectedSubject === sub
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              {/* Right side: Assigned By */}
              <div className="flex flex-wrap gap-2 items-center lg:justify-end">
                {[
                  { key: "All", label: "All Sources" },
                  { key: "HM", label: "Headmaster" },
                  { key: "Teacher", label: "Teachers" }
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setSelectedSender(opt.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedSender === opt.key
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>



            {/* Test list */}
            {loading ? (
              <div className="text-center py-16 text-slate-500 font-medium">Loading mock exams...</div>
            ) : filteredTests.length === 0 ? (
              <div className="text-center py-16 bg-white/70 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <i className="fi fi-sr-document-signed text-slate-300 dark:text-slate-600 text-4xl mb-3 flex items-center justify-center" />
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200 mb-1">No Mock Exams Available</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">There are no mock tests published for your class right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {paginatedTests.map((test) => (
                  <div
                    key={test.id}
                    className="group bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col h-full min-h-[220px] sm:min-h-[250px]"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-black uppercase px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border tracking-wider text-blue-600 border-blue-600/20 bg-blue-500/10">
                        {test.subject}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        Difficulty: {test.difficulty}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-1 leading-snug">{test.title}</h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 min-h-[32px]">
                      {test.description || "Simulate board conditions and practice to verify your subject mastery."}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 mt-auto">
                      <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400" />
                        {test.duration} mins
                      </span>
                      <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400" />
                        {test.totalMarks} Marks
                      </span>
                      <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400" />
                        {test.questionCount} Qs
                      </span>
                    </div>

                    {test.isCustom ? (
                      test.hasSubmitted ? (
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 p-2.5 rounded-xl flex justify-between items-center text-xs font-bold border border-emerald-200/20">
                          <div>Completed</div>
                          <div>{test.score} / {test.totalMarks} Marks</div>
                        </div>
                      ) : (
                        <button
                          onClick={() => router.push("/student/mock-tests")}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-lg sm:rounded-xl py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" /> Start Test
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => showInstructions(test)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg sm:rounded-xl py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" /> Start Simulation
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border-2 border-slate-200 dark:border-gray-700 text-sm font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-gray-700 transition-all"
                >
                  Previous
                </button>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border-2 border-slate-200 dark:border-gray-700 text-sm font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-gray-700 transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : testStatus === "instructions" ? (
          <div className="fixed inset-0 z-[100] bg-[var(--bg-main)] overflow-y-auto w-full h-full p-4 md:p-8 flex items-center justify-center">
            <div className="bg-[var(--bg-card)] border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-8 md:p-10 shadow-lg text-center max-w-2xl mx-auto w-full">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Revision & Topic Cover Mode</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                You are about to start the <strong className="text-slate-800 dark:text-slate-200">{activeTest.title}</strong> module. Please read the instructions below before proceeding.
              </p>
              
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 text-left space-y-4 border border-slate-100 dark:border-slate-800 mb-8">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Time Limit: 20 Minutes Max</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">This test is strictly timed to 20 minutes to simulate real exam pressure. Auto-submission occurs when time is up.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Structured Sections</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">Questions are categorized into MCQs (1 Mark), Short Answers (2 Marks), and Detailed Answers (5 Marks).</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Bilingual Support</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">You can switch the interface between English and Tamil during the test using the language toggle in the header.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => exitTestMode()}
                  className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStartTest(activeTest)}
                  className="flex-1 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Play className="w-4 h-4" /> Begin Exam (Fullscreen)
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Active Test Execution Mode */
          <div className="fixed inset-0 z-[100] bg-[var(--bg-main)] overflow-y-auto w-full h-full p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6 pb-20">
            
            {/* Translations mapping inline for active test */}
            {(() => {
              const translations = {
                English: {
                  quit: "Quit Mock Exam?",
                  quitText: "Progress in this simulation will be lost.",
                  quitBtn: "Quit Test",
                  back: "Back to mock repository",
                  timeRem: "Time Remaining:",
                  examConcluded: "Exam Concluded",
                  secA: "Section A: Multiple Choice Questions (1 Mark)",
                  secB: "Section B: Short Answers (2 Marks)",
                  secC: "Section C: Detailed Answers (5 Marks)",
                  question: "Question",
                  mark: "Mark",
                  marks: "Marks",
                  modelKey: "Model Key Answer Guide",
                  submit: "Conclude & Submit Mock Examination",
                  evalReport: "Evaluation Report",
                  finalScore: "Final Score",
                  resimulate: "Re-simulate Exam",
                  done: "Done",
                  typeHere: "Type your exam solution sheet answer details here..."
                },
                Tamil: {
                  quit: "தேர்வில் இருந்து வெளியேறவா?",
                  quitText: "இந்தச் சிமுலேஷனில் உங்கள் முன்னேற்றம் இழக்கப்படும்.",
                  quitBtn: "வெளியேறு",
                  back: "மாதிரி தேர்விற்குத் திரும்பு",
                  timeRem: "மீதமுள்ள நேரம்:",
                  examConcluded: "தேர்வு முடிந்தது",
                  secA: "பகுதி அ: பலவுள் தெரிவு வினாக்கள் (1 மதிப்பெண்)",
                  secB: "பகுதி ஆ: குறு வினாக்கள் (2 மதிப்பெண்கள்)",
                  secC: "பகுதி இ: விரிவான விடையளி (5 மதிப்பெண்கள்)",
                  question: "கேள்வி",
                  mark: "மதிப்பெண்",
                  marks: "மதிப்பெண்கள்",
                  modelKey: "மாதிரி விடைக்குறிப்பு",
                  submit: "தேர்வை சமர்ப்பி",
                  evalReport: "மதிப்பீட்டு அறிக்கை",
                  finalScore: "இறுதி மதிப்பெண்",
                  resimulate: "மீண்டும் தேர்வு எழுது",
                  done: "முடித்தது",
                  typeHere: "உங்கள் விடையை இங்கே தட்டச்சு செய்யவும்..."
                }
              };
              const t = translations[language];

              const mcqQuestions = activeTest.questions.filter(q => q.type === 'mcq' || q.marks === 1);
              const shortQuestions = activeTest.questions.filter(q => q.type !== 'mcq' && q.marks > 1 && q.marks < 5);
              const longQuestions = activeTest.questions.filter(q => q.type !== 'mcq' && q.marks >= 5);

              const renderQuestion = (q: any, idx: number, globalIdx: number) => {
                const hasKey = !!(q.answer || "").trim();
                const isCorrect = q.type === 'mcq' && hasKey && answers[q.id] === (q.answer || "").trim().charAt(0);
                return (
                  <div
                    key={q.id}
                    className={`bg-[var(--bg-card)] border-2 rounded-2xl p-5 md:p-6 transition-all ${
                      testFinished
                        ? q.type === 'mcq' && hasKey
                          ? isCorrect
                            ? 'border-emerald-200 dark:border-emerald-950 bg-emerald-500/5'
                            : 'border-rose-200 dark:border-rose-950 bg-rose-500/5'
                          : 'border-slate-200 dark:border-slate-800'
                        : 'border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {t.question} {globalIdx + 1}
                      </h4>
                      <span className="text-xs font-bold bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                        {q.marks} {q.marks === 1 ? t.mark : t.marks}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{q.text}</p>

                    {/* MCQ Options */}
                    {q.type === 'mcq' && q.options && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((opt: string, optIdx: number) => {
                          const optionLetter = opt.trim().charAt(0);
                          const isSelected = answers[q.id] === optionLetter;
                          const isOptionCorrect = hasKey && (q.answer || "").trim().charAt(0) === optionLetter;

                          return (
                            <button
                              key={optIdx}
                              disabled={testFinished}
                              onClick={() => handleSelectMCQ(q.id, opt)}
                              className={`text-left p-3.5 rounded-xl text-xs font-medium border-2 transition-all ${
                                isSelected
                                  ? testFinished
                                    ? isOptionCorrect
                                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                                      : 'bg-rose-500/20 border-rose-500 text-rose-800 dark:text-rose-300'
                                    : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-500 text-blue-700 dark:text-blue-300 font-bold'
                                  : testFinished && isOptionCorrect
                                  ? 'bg-emerald-500/10 border-emerald-400 text-emerald-700 dark:text-emerald-300 font-bold'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Short/Long Answer */}
                    {q.type === 'short' && (
                      <div className="space-y-3">
                        <textarea
                          disabled={testFinished}
                          rows={q.marks >= 5 ? 8 : 4}
                          value={answers[q.id] || ''}
                          onChange={(e) => handleTextAnswer(q.id, e.target.value)}
                          placeholder={t.typeHere}
                          className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all resize-none"
                        />
                        {testFinished && hasKey && (
                          <div className="mt-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">{t.modelKey}</span>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">"{q.answer}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              };

              let globalQuestionIdx = 0;

              return (
                <>
                  {/* Header controls & Timer */}
                  <div className="bg-[var(--bg-card)] border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <button
                        onClick={() => {
                          if (!testFinished) {
                            Swal.fire({
                              title: t.quit,
                              text: t.quitText,
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#ef4444',
                              cancelButtonColor: '#64748b',
                              confirmButtonText: t.quitBtn
                            }).then((res) => {
                              if (res.isConfirmed) exitTestMode();
                            });
                          } else {
                            exitTestMode();
                          }
                        }}
                        className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline mb-1 flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> {t.back}
                      </button>
                      <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white">{activeTest.title}</h2>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Language Switch */}
                      <button
                        onClick={() => setLanguage(language === 'English' ? 'Tamil' : 'English')}
                        className="px-3 py-1.5 rounded-lg border-2 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        {language === 'English' ? 'தமிழ்' : 'English'}
                      </button>

                      {/* Time remaining indicator */}
                      <div className={`px-4 py-2.5 rounded-xl flex items-center gap-2 border-2 ${
                        testFinished
                          ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-850'
                          : timeLeft < 300
                          ? 'bg-rose-500/10 border-rose-500 text-rose-600 animate-pulse font-black'
                          : 'bg-blue-500/10 border-blue-500 text-blue-600 font-bold'
                      }`}>
                        <Clock className="w-4 h-4" />
                        <div className="text-xs">
                          {testFinished ? (
                            <span className="font-bold text-slate-700 dark:text-slate-200">{t.examConcluded}</span>
                          ) : (
                            <span>{t.timeRem} <strong className="font-mono text-sm">{formatTime(timeLeft)}</strong></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section A: MCQs */}
                  {mcqQuestions.length > 0 && (
                    <div className="mb-8 mt-6">
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 border-b-2 border-blue-100 dark:border-blue-900/30 pb-2 inline-block">
                        {t.secA}
                      </h3>
                      <div className="space-y-6">
                        {mcqQuestions.map((q) => {
                          const renderBlock = renderQuestion(q, 0, globalQuestionIdx);
                          globalQuestionIdx++;
                          return renderBlock;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Section B: Short Answers */}
                  {shortQuestions.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 border-b-2 border-emerald-100 dark:border-emerald-900/30 pb-2 inline-block">
                        {t.secB}
                      </h3>
                      <div className="space-y-6">
                        {shortQuestions.map((q) => {
                          const renderBlock = renderQuestion(q, 0, globalQuestionIdx);
                          globalQuestionIdx++;
                          return renderBlock;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Section C: Detailed Answers */}
                  {longQuestions.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 border-b-2 border-purple-100 dark:border-purple-900/30 pb-2 inline-block">
                        {t.secC}
                      </h3>
                      <div className="space-y-6">
                        {longQuestions.map((q) => {
                          const renderBlock = renderQuestion(q, 0, globalQuestionIdx);
                          globalQuestionIdx++;
                          return renderBlock;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Test controller submission bar */}
                  {!testFinished ? (
                    <button
                      onClick={handleFinishTest}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3.5 text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      <CheckCircle className="w-5 h-5" /> {t.submit}
                    </button>
                  ) : (
                    <div className="bg-[var(--bg-card)] border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 mt-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 text-2xl font-bold">
                          🏆
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-[var(--text-heading)] uppercase tracking-wider">{t.evalReport}</h4>
                          <p className="text-xs text-[var(--text-muted)]">SSLC Simulator Grade Card</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div>
                          <div className="text-[10px] text-[var(--text-muted)] font-medium">{t.finalScore}</div>
                          <div className="text-lg font-black text-blue-600 dark:text-blue-400">{score} / {maxPossibleScore} {t.marks}</div>
                        </div>
                        <button
                          onClick={() => handleStartTest(activeTest)}
                          className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl px-5 py-3 text-xs font-bold transition-all"
                        >
                          {t.resimulate}
                        </button>
                        <button
                          onClick={() => exitTestMode()}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-3 text-xs font-bold transition-all shadow-md"
                        >
                          {t.done}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
