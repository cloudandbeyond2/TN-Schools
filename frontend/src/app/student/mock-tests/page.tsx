"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

export default function StudentMockTestsPage() {
  const { lang } = usePortalLanguage();
  const { data: session, status } = useSession();
  
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Test Taking State
  const [activeTest, setActiveTest] = useState<any>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (status === "loading") return;
    fetchAssignments();
  }, [session, status]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeTest && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (activeTest && timeLeft === 0) {
      // Auto-submit when time is up
      if (!isSubmitting) {
        Swal.fire("Time's Up!", "Submitting your test automatically.", "info");
        handleSubmitTest();
      }
    }
    return () => clearInterval(timer);
  }, [activeTest, timeLeft]);

  const fetchAssignments = async () => {
    const studentId = (session?.user as any)?.id;
    if (!studentId) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/mock-tests/student/${studentId}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setAssignments(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startTest = async (assignment: any) => {
    const confirm = await Swal.fire({
      title: "Ready to Begin?",
      text: `This test is ${assignment.mockTest.duration} minutes long. The timer will start immediately.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Start Test"
    });

    if (confirm.isConfirmed) {
      try {
        // Fetch full test details including questions
        const res = await fetch(`${API_URL}/api/mock-tests/${assignment.mockTestId}`, { cache: "no-store" });
        const data = await res.json();
        
        if (data.success) {
          setActiveTest({
            ...data.data,
            assignmentId: assignment.id
          });
          setTimeLeft(data.data.duration * 60);
          setAnswers({});
          setCurrentQuestionIdx(0);
        }
      } catch (err) {
        Swal.fire("Error", "Could not load test questions.", "error");
      }
    }
  };

  const handleOptionSelect = (questionId: string, optionLetter: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionLetter
    }));
  };

  const handleShortAnswerChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: text
    }));
  };

  const handleSubmitTest = async () => {
    setIsSubmitting(true);
    const studentId = (session?.user as any)?.id;
    
    try {
      const res = await fetch(`${API_URL}/api/mock-tests/submit/${activeTest.assignmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          answers
        })
      });

      const data = await res.json();
      if (data.success) {
        Swal.fire("Test Submitted!", `You scored ${data.data.score} out of ${activeTest.totalMarks}`, "success");
        setActiveTest(null);
        fetchAssignments();
      } else {
        Swal.fire("Error", "Failed to submit test.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "An unexpected error occurred.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (activeTest) {
    const q = activeTest.questions[currentQuestionIdx];
    
    return (
      <PortalLayout title="Mock Exam in Progress" subtitle={activeTest.title} accentColor="#f59e0b">
        <div className="w-full mb-10">
          
          {/* Exam Header */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-amber-100 dark:border-amber-900/50 mb-6 flex justify-between items-center sticky top-24 z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{activeTest.title}</h2>
              <p className="text-sm text-gray-500">Question {currentQuestionIdx + 1} of {activeTest.questions.length}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg ${timeLeft < 300 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
              <i className="fi fi-sr-clock flex items-center text-lg" />
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Question Area */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-6 min-h-[400px]">
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 leading-relaxed">
                <span className="text-amber-500 font-black mr-2">{currentQuestionIdx + 1}.</span> 
                {q.text}
              </h3>
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 px-3 py-1 rounded-lg text-xs font-bold shrink-0">
                {q.marks} Marks
              </span>
            </div>

            {q.type === 'mcq' ? (
              <div className="space-y-4">
                {q.options.map((opt: string, optIdx: number) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isSelected = answers[q.id] === letter;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleOptionSelect(q.id, letter)}
                      className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                        isSelected 
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-amber-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        isSelected ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                      }`}>
                        {letter}
                      </div>
                      <span className={`text-lg ${isSelected ? 'text-amber-900 dark:text-amber-100 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={answers[q.id] || ''}
                onChange={(e) => handleShortAnswerChange(q.id, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full h-48 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none"
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
              disabled={currentQuestionIdx === 0}
              className="px-6 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Previous
            </button>
            
            {currentQuestionIdx === activeTest.questions.length - 1 ? (
              <button
                onClick={handleSubmitTest}
                disabled={isSubmitting}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
              >
                {isSubmitting ? "Submitting..." : "Submit Test"}
                {!isSubmitting && <i className="fi fi-sr-check flex items-center text-sm" />}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIdx((p) => Math.min(activeTest.questions.length - 1, p + 1))}
                className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
              >
                Next <i className="fi fi-sr-angle-small-right flex items-center text-lg" />
              </button>
            )}
          </div>

        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "எனது மாதிரி தேர்வுகள்" : "My Mock Exams"}
      subtitle={lang === "தமிழ்" ? "பயிற்சி செய்து சிறந்த மதிப்பெண் பெறுங்கள்" : "Practice and prepare for your finals"}
      accentColor="#f59e0b"
    >
      <div className="w-full mb-10">
        
        {/* Main header banner card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 glass rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-wider mb-1 flex items-center gap-2">
              <i className="fi fi-sr-target text-amber-500 dark:text-amber-400 flex items-center" />
              {lang === "தமிழ்" ? "எனது மாதிரி தேர்வுகள்" : "My Mock Exams"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {lang === "தமிழ்" ? "பயிற்சி செய்து சிறந்த மதிப்பெண் பெறுங்கள்" : "Practice and prepare for your finals"}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-extrabold text-sm rounded-xl border border-amber-200/20 shadow-sm whitespace-nowrap">
            <i className="fi fi-sr-document-text flex items-center text-sm" />
            {lang === "தமிழ்" ? " மாதிரி தேர்வு போர்டல்" : "Mock Exam Portal"}
          </span>
        </div>

        <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6">
          {lang === "தமிழ்" ? "ஒதுக்கப்பட்ட தேர்வுகள்" : "Assigned Tests"}
        </h2>
        
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <i className="fi fi-sr-badge text-gray-300 mx-auto mb-4 text-5xl flex items-center justify-center" />
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">You're all caught up!</h3>
            <p className="text-gray-500 text-sm">No mock tests assigned to your class right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {(() => {
              const uniqueAssignmentsMap = new Map<string, any>();
              assignments.forEach(a => {
                const existing = uniqueAssignmentsMap.get(a.mockTestId);
                const hasSubmitted = a.submissions && a.submissions.length > 0;
                if (!existing) {
                  uniqueAssignmentsMap.set(a.mockTestId, a);
                } else {
                  const existingSubmitted = existing.submissions && existing.submissions.length > 0;
                  if (!hasSubmitted && existingSubmitted) {
                    uniqueAssignmentsMap.set(a.mockTestId, a);
                  }
                }
              });
              return Array.from(uniqueAssignmentsMap.values());
            })().map((assignment) => {
              const test = assignment.mockTest;
              const hasSubmitted = assignment.submissions && assignment.submissions.length > 0;
              const score = hasSubmitted ? assignment.submissions[0].score : null;

              return (
                <div key={assignment.id} className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 relative overflow-hidden flex flex-col h-full min-h-[220px] sm:min-h-[250px]">

                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border tracking-wider text-amber-600 border-amber-600/20 bg-amber-500/10">
                      {test.subject}
                    </span>
                    {test.schoolId === null && (
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider bg-blue-500 text-white font-bold border border-blue-600/20">
                        State Board
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 leading-snug">{test.title}</h3>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 min-h-[32px]">
                    {test.description || "Simulate board conditions and practice to verify your subject mastery."}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 mt-auto">
                    <span className="inline-flex items-center gap-1 bg-gray-50 dark:bg-gray-900/40 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                      <i className="fi fi-rr-clock text-[9px] sm:text-[10px] text-gray-400" />
                      {test.duration} mins
                    </span>
                    <span className="inline-flex items-center gap-1 bg-gray-50 dark:bg-gray-900/40 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                      <i className="fi fi-rr-trophy text-[9px] sm:text-[10px] text-gray-400" />
                      {test.totalMarks} Marks
                    </span>
                  </div>

                  {hasSubmitted ? (
                    <div className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 p-2.5 rounded-xl flex justify-between items-center text-xs font-bold border border-green-200/20">
                      <div className="font-bold">Completed</div>
                      <div className="font-black text-sm">{score} / {test.totalMarks} Marks</div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => startTest(assignment)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] sm:text-xs py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10"
                    >
                      <i className="fi fi-sr-play flex items-center text-[9px] sm:text-[10px]" /> Start Test
                    </button>
                  )}

                </div>
              )
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
