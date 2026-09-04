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
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({});

  const toggleSubject = (subject: string) => {
    setOpenSubjects(prev => ({ ...prev, [subject]: prev[subject] === undefined ? true : !prev[subject] }));
  };
  
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
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-sm border border-amber-200/50 dark:border-amber-900/40 mb-6 flex justify-between items-center sticky top-24 z-10">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">{activeTest.title}</h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Question {currentQuestionIdx + 1} of {activeTest.questions.length}</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-extrabold text-xs sm:text-sm ${timeLeft < 300 ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200/30' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/30'}`}>
              <i className="fi fi-sr-clock flex items-center text-sm" />
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Question Area */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-6 min-h-[350px]">
            <div className="flex justify-between items-start gap-4 mb-6">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-relaxed">
                <span className="text-amber-500 font-black mr-2">{currentQuestionIdx + 1}.</span> 
                {q.text}
              </h3>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-lg text-xs font-extrabold shrink-0 border border-slate-200 dark:border-slate-700">
                {q.marks} Marks
              </span>
            </div>

            {q.type === 'mcq' ? (
              <div className="space-y-3">
                {q.options.map((opt: string, optIdx: number) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isSelected = answers[q.id] === letter;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleOptionSelect(q.id, letter)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-center gap-3.5 ${
                        isSelected 
                          ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-500/10 shadow-sm' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700/50 bg-slate-50/40 dark:bg-slate-800/30'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                        isSelected ? 'bg-amber-500 text-white' : 'bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {letter}
                      </div>
                      <span className={`text-xs sm:text-sm ${isSelected ? 'text-amber-950 dark:text-amber-100 font-extrabold' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>
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
                className="w-full h-40 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none resize-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
              disabled={currentQuestionIdx === 0}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Previous
            </button>
            
            {currentQuestionIdx === activeTest.questions.length - 1 ? (
              <button
                onClick={handleSubmitTest}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 sm:px-8 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-sm"
              >
                {isSubmitting ? "Submitting..." : "Submit Test"}
                {!isSubmitting && <i className="fi fi-sr-check flex items-center text-sm" />}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIdx((p) => Math.min(activeTest.questions.length - 1, p + 1))}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 sm:px-8 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-sm"
              >
                Next <i className="fi fi-sr-angle-small-right flex items-center text-base" />
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
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-2">
              <i className="fi fi-sr-target text-amber-500 dark:text-amber-400 flex items-center" />
              {lang === "தமிழ்" ? "எனது மாதிரி தேர்வுகள்" : "My Mock Exams"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {lang === "தமிழ்" ? "பயிற்சி செய்து சிறந்த மதிப்பெண் பெறுங்கள்" : "Practice and prepare for your finals"}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-extrabold text-xs sm:text-sm rounded-xl border border-amber-200/20 shadow-sm whitespace-nowrap">
            <i className="fi fi-sr-document-text flex items-center text-sm" />
            {lang === "தமிழ்" ? " மாதிரி தேர்வு போர்டல்" : "Mock Exam Portal"}
          </span>
        </div>

        <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          {lang === "தமிழ்" ? "ஒதுக்கப்பட்ட தேர்வுகள்" : "Assigned Tests"}
        </h2>
        
        {loading ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-16 bg-white/70 dark:bg-slate-900/50 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
            <i className="fi fi-sr-badge text-slate-300 dark:text-slate-600 mx-auto mb-3 text-4xl flex items-center justify-center" />
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200 mb-1">You're all caught up!</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">No mock tests assigned to your class right now.</p>
          </div>
        ) : (
          <div className="space-y-6">
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
              
              const uniqueAssignments = Array.from(uniqueAssignmentsMap.values());
              const subjectGroups = uniqueAssignments.reduce((acc, assignment) => {
                const subject = assignment.mockTest.subject || "General";
                if (!acc[subject]) acc[subject] = [];
                acc[subject].push(assignment);
                return acc;
              }, {} as Record<string, any[]>);

              return (Object.entries(subjectGroups) as [string, any[]][]).map(([subject, tests]) => {
                const isOpen = openSubjects[subject] === undefined ? false : openSubjects[subject];
                
                return (
                  <div key={subject} className="bg-white/70 dark:bg-slate-900/50 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800 transition-all duration-300">
                    <div 
                      className={`flex items-center gap-3 cursor-pointer select-none group transition-all duration-300 ${isOpen ? 'mb-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-3' : ''}`}
                      onClick={() => toggleSubject(subject)}
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500 shrink-0 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
                        <i className="fi fi-sr-folder text-base" />
                      </div>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-wide group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{subject}</h3>
                      
                      <div className="ml-auto flex items-center gap-2.5">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-slate-200 dark:border-slate-700">
                          {tests.length} {lang === "தமிழ்" ? "தேர்வுகள்" : "Tests"}
                        </span>
                        <div className={`w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                          <i className="fi fi-sr-angle-down text-xs flex items-center" />
                        </div>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 animate-in fade-in zoom-in-95 duration-200">
                        {tests.map((assignment) => {
                      const test = assignment.mockTest;
                      const hasSubmitted = assignment.submissions && assignment.submissions.length > 0;
                      const score = hasSubmitted ? assignment.submissions[0].score : null;

                      return (
                        <div key={assignment.id} className="group bg-white dark:bg-slate-900/90 rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col h-full min-h-[190px]">
                          
                          {test.schoolId === null && (
                            <div className="mb-1.5">
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/40 dark:border-blue-800/40">
                                State Board
                              </span>
                            </div>
                          )}

                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mb-1 line-clamp-1 leading-snug">{test.title}</h3>

                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 min-h-[30px] font-normal leading-relaxed">
                            {test.description || "Simulate board conditions and practice to verify your subject mastery."}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 mb-3 mt-auto">
                            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                              <i className="fi fi-rr-clock text-[10px] text-slate-400" />
                              {test.duration} mins
                            </span>
                            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                              <i className="fi fi-rr-trophy text-[10px] text-slate-400" />
                              {test.totalMarks} Marks
                            </span>
                          </div>

                          {hasSubmitted ? (
                            <div className="flex flex-col gap-1.5">
                              <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 p-2 rounded-xl flex justify-between items-center text-xs font-bold border border-emerald-200/40 dark:border-emerald-800/40">
                                <span>Completed</span>
                                <span className="font-extrabold">{score} / {test.totalMarks} Marks</span>
                              </div>
                              {(Number(score) / Number(test.totalMarks)) >= 0.8 && (
                                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1 px-1">
                                  <i className="fi fi-sr-star flex items-center text-amber-500 text-[10px]" /> 
                                  {lang === "தமிழ்" ? "நன்று, தொடர்ந்து முயற்சி செய்!" : "Good, keep it up!"}
                                </div>
                              )}
                            </div>
                          ) : (
                            <button 
                              onClick={() => startTest(assignment)}
                              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <i className="fi fi-sr-play flex items-center text-[10px]" /> Start Test
                            </button>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          });
        })()}
      </div>
    )}
      </div>
    </PortalLayout>
  );
}

