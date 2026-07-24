"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { 
  CheckCircle, PlayCircle, Clock, Award, ChevronRight, Sparkles, BookOpen
} from "lucide-react";
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
      const res = await fetch(`${API_URL}/api/mock-tests/student/${studentId}`);
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
        const res = await fetch(`${API_URL}/api/mock-tests/${assignment.mockTestId}`);
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
        <div className="w-full max-w-4xl mx-auto mb-10">
          
          {/* Exam Header */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-amber-100 dark:border-amber-900/50 mb-6 flex justify-between items-center sticky top-24 z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{activeTest.title}</h2>
              <p className="text-sm text-gray-500">Question {currentQuestionIdx + 1} of {activeTest.questions.length}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg ${timeLeft < 300 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
              <Clock className="w-5 h-5" />
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
                {!isSubmitting && <CheckCircle className="w-5 h-5" />}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIdx((p) => Math.min(activeTest.questions.length - 1, p + 1))}
                className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
              >
                Next <ChevronRight className="w-5 h-5" />
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
      <div className="w-full max-w-7xl mx-auto mb-10">
        
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-8 md:p-12 mb-8 shadow-2xl shadow-amber-500/20 text-white">
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
            <BookOpen className="w-64 h-64 text-white" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4 border border-white/30">
              <Sparkles className="w-3.5 h-3.5" /> {lang === "தமிழ்" ? "தேர்வுக் கூடம்" : "Examination Hall"}
            </span>
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              {lang === "தமிழ்" ? "தயாராகுங்கள், சிறந்து விளங்குங்கள்!" : "Ready, Set, Excel!"}
            </h1>
            <p className="text-amber-100 text-lg mb-0 leading-relaxed">
              {lang === "தமிழ்" ? "உங்கள் ஆசிரியர்கள் அல்லது மாநில வாரியத்தால் ஒதுக்கப்பட்ட மாதிரி தேர்வுகளை எழுதி உங்கள் மதிப்பெண்களை மேம்படுத்துங்கள்." : "Take mock tests assigned by your teachers or the state board to check your preparation level and improve your scores."}
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6">
          {lang === "தமிழ்" ? "ஒதுக்கப்பட்ட தேர்வுகள்" : "Assigned Tests"}
        </h2>
        
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">You're all caught up!</h3>
            <p className="text-gray-500">No mock tests assigned to your class right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => {
              const test = assignment.mockTest;
              const hasSubmitted = assignment.submissions && assignment.submissions.length > 0;
              const score = hasSubmitted ? assignment.submissions[0].score : null;

              return (
                <div key={assignment.id} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden flex flex-col">
                  
                  {test.schoolId === null && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-sm">
                      State Board
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{test.title}</h3>
                  <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-4">{test.subject}</p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-6 mt-auto">
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 flex flex-col justify-center items-center">
                      <Clock className="w-4 h-4 text-gray-400 mb-1" />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{test.duration} mins</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 flex flex-col justify-center items-center">
                      <Award className="w-4 h-4 text-gray-400 mb-1" />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{test.totalMarks} Marks</span>
                    </div>
                  </div>

                  {hasSubmitted ? (
                    <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-2xl flex justify-between items-center">
                      <div className="font-bold text-sm">Completed</div>
                      <div className="font-black text-xl">{score} / {test.totalMarks}</div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => startTest(assignment)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
                    >
                      <PlayCircle className="w-5 h-5" /> Start Test
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
