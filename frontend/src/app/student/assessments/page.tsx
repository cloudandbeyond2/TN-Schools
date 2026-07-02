"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { BookOpen, Award, CheckCircle, HelpCircle, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";

interface Question {
  id: string;
  grade: string;
  subject: string;
  topic: string;
  difficulty: string;
  type: "mcq" | "short" | "long";
  text: string;
  options: string[];
  answer: string;
  marks: number;
}

export default function StudentAssessmentsPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentTestQuestions, setCurrentTestQuestions] = useState<Question[]>([]);
  
  // Test-taking states
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalMarks, setTotalMarks] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchProfileAndQuestions = async () => {
    if (!session?.user) return;
    try {
      setLoading(true);
      // 1. Fetch student profile
      const res = await fetch(`${API_URL}/api/students`);
      const json = await res.json();
      if (json.success) {
        const studentProfile = json.data.find((s: any) => s.userId === (session.user as any).id);
        if (studentProfile) {
          setProfile(studentProfile);
          
          // 2. Fetch all questions for this school
          const qRes = await fetch(`${API_URL}/api/teacher/questions?schoolId=${studentProfile.schoolId}`);
          const qData = await qRes.json();
          if (qData.success && Array.isArray(qData.data)) {
            // Match student's class number (e.g. "8" in "Grade 8" or "8")
            const studentClassNum = studentProfile.class.match(/\d+/)?.[0];
            
            const matched = qData.data.filter((q: Question) => {
              const qGradeNum = q.grade.match(/\d+/)?.[0];
              return qGradeNum === studentClassNum;
            });
            setQuestions(matched);
          }
        }
      }
    } catch (err) {
      console.error("Error loading student assessment data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndQuestions();
  }, [session]);

  // Group questions by Topic/Subject folders
  const topicsMap = questions.reduce((acc, q) => {
    const key = `${q.subject} - ${q.topic}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  const startAssessment = (topicKey: string) => {
    const testQs = topicsMap[topicKey] || [];
    setCurrentTestQuestions(testQs);
    setSelectedTopic(topicKey);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setTotalMarks(testQs.reduce((sum, q) => sum + q.marks, 0));
  };

  const handleSelectMCQ = (qId: string, option: string) => {
    if (submitted) return;
    // option format can be "A) option text", extract "A"
    const optionLetter = option.trim().charAt(0);
    setAnswers((prev) => ({ ...prev, [qId]: optionLetter }));
  };

  const handleTextAnswerChange = (qId: string, val: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmitTest = () => {
    let finalScore = 0;
    currentTestQuestions.forEach((q) => {
      if (q.type === "mcq") {
        const studentAns = (answers[q.id] || "").toUpperCase().trim();
        const correctAns = q.answer.toUpperCase().trim().charAt(0);
        if (studentAns === correctAns) {
          finalScore += q.marks;
        }
      } else {
        // For short/long answer, give marks if they attempted it (simplistic mock auto-grading)
        if ((answers[q.id] || "").trim().length > 5) {
          finalScore += q.marks;
        }
      }
    });

    setScore(finalScore);
    setSubmitted(true);

    Swal.fire({
      title: "Assessment Completed!",
      text: `You scored ${finalScore} out of ${totalMarks} Marks!`,
      icon: "success",
      confirmButtonColor: "#6366f1",
    });
  };

  return (
    <PortalLayout title="Assessments 📝" subtitle="Attend quizzes and tests assigned by your teacher" accentColor="#6366f1">
      <div className="space-y-6 text-left animate-in fade-in duration-300">
        
        {/* Banner */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-6 md:p-8 shadow-xl border-2 md:border-4 border-indigo-100 dark:border-indigo-950">
          <div className="absolute right-0 top-0 opacity-20 transform translate-x-1/4 -translate-y-1/4 scale-150 pointer-events-none mix-blend-overlay">
            <Award className="w-64 h-64" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <h2 className="text-2xl md:text-4xl font-black font-mono tracking-tight">Quiz & Test Center</h2>
            {profile ? (
              <p className="text-indigo-100 font-bold max-w-xl text-xs md:text-sm">
                Showing assigned learning assessments for your class: <strong className="text-yellow-300">Grade {profile.class}</strong>.
              </p>
            ) : (
              <p className="text-indigo-100 font-bold max-w-xl text-xs md:text-sm">
                Select your assigned syllabus assessment folder to start practicing.
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-[var(--text-muted)] flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
            <span>Loading assessments...</span>
          </div>
        ) : !selectedTopic ? (
          /* List of Available Assessments */
          <div className="space-y-4">
            <h3 className="text-sm font-black text-[var(--text-heading)] uppercase tracking-wider">Available Assessments</h3>
            
            {Object.keys(topicsMap).length === 0 ? (
              <div className="theme-card p-8 text-center text-xs text-[var(--text-muted)] border-2 border-dashed border-[var(--border)] rounded-2xl">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                No assessments assigned for your grade level yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(topicsMap).map(([topicKey, list]) => (
                  <div
                    key={topicKey}
                    className="bg-[var(--bg-card)] border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs mb-2">
                        <BookOpen className="w-4 h-4" />
                        <span>Syllabus Test</span>
                      </div>
                      <h4 className="text-sm font-bold text-[var(--text-heading)] mb-1">{topicKey}</h4>
                      <p className="text-xs text-[var(--text-muted)] mb-4">{list.length} generated questions</p>
                    </div>

                    <button
                      onClick={() => startAssessment(topicKey)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2"
                    >
                      Start Test <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Active Test Screen */
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
              <div>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline mb-1 block"
                >
                  ← Back to Topics
                </button>
                <h3 className="text-base font-bold text-[var(--text-heading)]">{selectedTopic}</h3>
              </div>
              <div className="text-xs font-bold text-[var(--text-muted)]">
                Total Marks: {totalMarks}
              </div>
            </div>

            <div className="space-y-6">
              {currentTestQuestions.map((q, idx) => {
                const isCorrect = q.type === "mcq" && answers[q.id] === q.answer.trim().charAt(0);
                return (
                  <div
                    key={q.id}
                    className={`bg-[var(--bg-card)] border-2 rounded-2xl p-5 md:p-6 transition-all ${
                      submitted
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
                        Question {idx + 1} • {q.type.toUpperCase()}
                      </h4>
                      <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
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
                              disabled={submitted}
                              onClick={() => handleSelectMCQ(q.id, opt)}
                              className={`text-left p-3.5 rounded-xl text-xs font-medium border-2 transition-all ${
                                isSelected
                                  ? submitted
                                    ? isOptionCorrect
                                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300"
                                      : "bg-rose-500/20 border-rose-500 text-rose-800 dark:text-rose-300"
                                    : "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold"
                                  : submitted && isOptionCorrect
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

                    {/* Short/Long Text inputs */}
                    {q.type !== "mcq" && (
                      <div className="space-y-3">
                        <textarea
                          disabled={submitted}
                          rows={q.type === "long" ? 5 : 3}
                          value={answers[q.id] || ""}
                          onChange={(e) => handleTextAnswerChange(q.id, e.target.value)}
                          placeholder="Type your answer here..."
                          className="w-full bg-[var(--input-bg)] border-2 border-[var(--input-border)] rounded-xl px-4 py-3 text-xs text-[var(--text-main)] focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all resize-none"
                        />
                        {submitted && (
                          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-1">
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Model Answer Key</span>
                            <p className="text-xs text-[var(--text-main)] leading-relaxed italic">"{q.answer}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Test Controls */}
            {!submitted ? (
              <button
                onClick={handleSubmitTest}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3.5 text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" /> Submit Assessment
              </button>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={() => startAssessment(selectedTopic)}
                  className="flex-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 rounded-xl py-3 text-xs font-bold transition-all text-center"
                >
                  Retry Test
                </button>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-xs font-bold shadow-lg transition-all text-center"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
