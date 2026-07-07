"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { BookOpen, Award, CheckCircle, HelpCircle, ArrowRight, RefreshCw, AlertCircle, Globe, Clock, ArrowLeft } from "lucide-react";
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

  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes
  const [showInstructions, setShowInstructions] = useState(false);
  const [pendingTopic, setPendingTopic] = useState<string | null>(null);
  const [language, setLanguage] = useState<"English" | "Tamil">("English");

  useEffect(() => {
    let timer: any;
    if (selectedTopic && !submitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [selectedTopic, submitted, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

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
    setPendingTopic(topicKey);
    setShowInstructions(true);
  };

  const confirmStart = () => {
    if (!pendingTopic) return;
    const testQs = topicsMap[pendingTopic] || [];
    setCurrentTestQuestions(testQs);
    setSelectedTopic(pendingTopic);
    setShowInstructions(false);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setTimeLeft(1200);
    setTotalMarks(testQs.reduce((sum, q) => sum + q.marks, 0));

    if (typeof document !== "undefined" && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    }
  };

  const exitTestMode = () => {
    setSelectedTopic(null);
    setShowInstructions(false);
    setPendingTopic(null);
    if (typeof document !== "undefined" && document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(err => console.log(err));
    }
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
    <PortalLayout title="Assessments 📝" subtitle="Attend quizzes and tests assigned by your teacher" accentColor="#6366f1" hideSidebar={!!selectedTopic || showInstructions}>
      <div className="space-y-6 text-left animate-in fade-in duration-300">
        
        {!selectedTopic && !showInstructions && (
          <>
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
              <div className="text-center py-12 text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                <span>Loading assessments...</span>
              </div>
            ) : (
              /* List of Available Assessments */
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Available Assessments</h3>
                
                {Object.keys(topicsMap).length === 0 ? (
                  <div className="theme-card p-8 text-center text-xs text-slate-500 dark:text-slate-400 border-2 border-dashed border-[var(--border)] rounded-2xl">
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
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{topicKey}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{list.length} generated questions</p>
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
            )}
          </>
        )}

        {showInstructions && !selectedTopic && (
          <div className="fixed inset-0 z-[100] bg-[var(--bg-main)] overflow-y-auto w-full h-full p-4 md:p-8 flex items-center justify-center">
            <div className="bg-[var(--bg-card)] border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl max-w-3xl mx-auto w-full">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Revision & Topic Cover Mode</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Please read the instructions carefully before starting.</p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex gap-3 items-start p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-slate-100 dark:border-slate-800">
                <Clock className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Strict 20-Minute Time Limit</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This assessment is hard-capped at exactly 20 minutes to simulate real exam pressure. It will auto-submit when the timer reaches zero.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-slate-100 dark:border-slate-800">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Sectioned Layout</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Questions are divided into MCQs (1 Mark), Short Answers (2 Marks), and Detailed Answers (5 Marks).</p>
                </div>
              </div>
              <div className="flex gap-3 items-start p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-slate-100 dark:border-slate-800">
                <Globe className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Bilingual Support</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">You can switch the interface between English and Tamil during the test using the language toggle in the header.</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => { setShowInstructions(false); setPendingTopic(null); }}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmStart}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
              >
                I Understand, Start Test <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        )}

        {selectedTopic && (
          /* Active Test Screen */
          <div className="fixed inset-0 z-[100] bg-[var(--bg-main)] overflow-y-auto w-full h-full p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Translations mapping inline for active test */}
            {(() => {
              const translations = {
                English: {
                  quit: "Quit Assessment?",
                  quitText: "Progress in this simulation will be lost.",
                  quitBtn: "Quit Test",
                  back: "Back to Topics",
                  timeRem: "Time Remaining:",
                  examConcluded: "Exam Concluded",
                  secA: "Section A: Multiple Choice Questions (1 Mark)",
                  secB: "Section B: Short Answers (2 Marks)",
                  secC: "Section C: Detailed Answers (5 Marks)",
                  question: "Question",
                  mark: "Mark",
                  marks: "Marks",
                  modelKey: "Model Key Answer Guide",
                  submit: "Conclude & Submit Assessment",
                  evalReport: "Evaluation Report",
                  finalScore: "Final Score",
                  resimulate: "Retry Test",
                  done: "Done",
                  typeHere: "Type your exam solution sheet answer details here..."
                },
                Tamil: {
                  quit: "தேர்வில் இருந்து வெளியேறவா?",
                  quitText: "இந்தச் சிமுலேஷனில் உங்கள் முன்னேற்றம் இழக்கப்படும்.",
                  quitBtn: "வெளியேறு",
                  back: "தலைப்புகளுக்குத் திரும்பு",
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

              const mcqQuestions = currentTestQuestions.filter(q => q.type === 'mcq' || q.marks === 1);
              const shortQuestions = currentTestQuestions.filter(q => q.type !== 'mcq' && q.marks > 1 && q.marks < 5);
              const longQuestions = currentTestQuestions.filter(q => q.type !== 'mcq' && q.marks >= 5);

              const renderQuestion = (q: any, idx: number, globalIdx: number) => {
                const isCorrect = q.type === 'mcq' && answers[q.id] === q.answer.trim().charAt(0);
                return (
                  <div
                    key={q.id}
                    className={`bg-[var(--bg-card)] border-2 rounded-2xl p-5 md:p-6 transition-all ${
                      submitted
                        ? q.type === 'mcq'
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
                                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                                      : 'bg-rose-500/20 border-rose-500 text-rose-800 dark:text-rose-300'
                                    : 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold'
                                  : submitted && isOptionCorrect
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
                    {q.type === 'short' || q.type === 'long' ? (
                      <div className="space-y-3">
                        <textarea
                          disabled={submitted}
                          rows={q.marks >= 5 ? 8 : 4}
                          value={answers[q.id] || ''}
                          onChange={(e) => handleTextAnswerChange(q.id, e.target.value)}
                          placeholder={t.typeHere}
                          className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all resize-none"
                        />
                        {submitted && (
                          <div className="mt-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">{t.modelKey}</span>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">"{q.answer}"</p>
                          </div>
                        )}
                      </div>
                    ) : null}
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
                          if (!submitted) {
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
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline mb-1 flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> {t.back}
                      </button>
                      <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white">{selectedTopic}</h2>
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
                        submitted
                          ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-850'
                          : timeLeft < 300
                          ? 'bg-rose-500/10 border-rose-500 text-rose-600 animate-pulse font-black'
                          : 'bg-indigo-500/10 border-indigo-500 text-indigo-600 font-bold'
                      }`}>
                        <Clock className="w-4 h-4" />
                        <div className="text-xs">
                          {submitted ? (
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
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 border-b-2 border-indigo-100 dark:border-indigo-900/30 pb-2 inline-block">
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
                  {!submitted ? (
                    <button
                      onClick={handleSubmitTest}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3.5 text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-4"
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
                          <p className="text-xs text-[var(--text-muted)]">Assessment Grade Card</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div>
                          <div className="text-[10px] text-[var(--text-muted)] font-medium">{t.finalScore}</div>
                          <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">{score} / {totalMarks} {t.marks}</div>
                        </div>
                        <button
                          onClick={() => confirmStart()}
                          className="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl px-5 py-3 text-xs font-bold transition-all"
                        >
                          {t.resimulate}
                        </button>
                        <button
                          onClick={() => exitTestMode()}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-3 text-xs font-bold transition-all shadow-md"
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
