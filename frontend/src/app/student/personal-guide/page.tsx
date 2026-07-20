"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import {
  BookOpen,
  Clock,
  Send,
  Inbox,
  ChevronDown,
  ChevronUp,
  Brain,
  Sparkles,
  Heart,
  Compass,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TASK_TYPE_LABELS: Record<string, string> = {
  reflection: "Reflection",
  goal: "Goal Check-in",
  question: "Question",
  custom: "Custom Task",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; statusKey: string; border: string }
> = {
  pending: {
    label: "Pending Reply",
    statusKey: "pending",
    border: "border-amber-200 dark:border-amber-800",
  },
  answered: {
    label: "Answer Submitted",
    statusKey: "answered",
    border: "border-blue-200 dark:border-blue-800",
  },
  reviewed: {
    label: "Feedback Received",
    statusKey: "reviewed",
    border: "border-emerald-200 dark:border-emerald-800",
  },
};

// Yoga Poses Configurations
const YOGA_POSES = [
  {
    name: "Lotus Pose",
    localName: "Sukhasana (சுகாசனம்)",
    image: "/images/yoga/lotus_pose.jpg",
    benefits: "Calms the brain, strengthens the back, improves posture and keeps focus steady for study sessions.",
    steps: [
      "Sit upright with your legs crossed comfortably.",
      "Rest your hands on your knees with palms facing up.",
      "Close your eyes, breathe deeply, and focus on the air entering and leaving."
    ],
    duration: "5-10 minutes"
  },
  {
    name: "Tree Pose",
    localName: "Vrikshasana (விருட்சாசனம்)",
    image: "/images/yoga/tree_pose.jpg",
    benefits: "Improves balance, physical stability, and concentration. Perfect to do before tough subjects.",
    steps: [
      "Stand straight on both feet with arms by your side.",
      "Lift your right foot and place it on your left inner thigh.",
      "Join your palms in front of your chest (Namaste pose) or raise them up.",
      "Focus on a single static point in front of you to balance."
    ],
    duration: "1-2 minutes per leg"
  },
  {
    name: "Child's Pose",
    localName: "Balasana (பாலாசனம்)",
    image: "/images/yoga/child_pose.jpg",
    benefits: "Relaxes the nervous system, releases stress/fatigue, and stretches your neck/back.",
    steps: [
      "Kneel on the floor, sit back on your heels, and bend forward.",
      "Rest your forehead gently on the floor in front of you.",
      "Extend your arms forward with palms facing down.",
      "Breathe slowly and let your entire body relax."
    ],
    duration: "3-5 minutes"
  }
];

// Goal References Map
const GOAL_RESOURCES: Record<string, { title: string; links: { name: string; url: string }[]; tips: string[] }> = {
  "NEET - Medical College": {
    title: "NEET Medical Preparation",
    links: [
      { name: "NCERT Biology Chapter-wise MCQ practice", url: "https://mocktest.ncert.org.in/" },
      { name: "NTA NEET Official Practice Tests", url: "https://www.nta.ac.in/Quiz" },
      { name: "Tamil Nadu Government NEET Free e-Box Portal", url: "https://tnschools.gov.in" }
    ],
    tips: [
      "Concentrate heavily on NCERT Biology diagrams and labeling.",
      "Solve at least 45 Physics and Chemistry numericals daily to improve speed.",
      "Analyze previous 10 years papers for repeating question trends."
    ]
  },
  "JEE - Engineering": {
    title: "JEE Engineering Preparation",
    links: [
      { name: "IIT JEE Main & Advanced mock prep", url: "https://mocktest.ncert.org.in/" },
      { name: "Tamil Nadu Board Previous Year Question Papers", url: "https://www.dge.tn.gov.in" },
      { name: "NTA JEE Practice portal", url: "https://www.nta.ac.in/Quiz" }
    ],
    tips: [
      "Focus on concept clarity in Calculus and Coordinate Geometry.",
      "Make a formula summary sheet for Physics laws and Chemistry reactions.",
      "Use spaced repetition to revise old concepts every Saturday."
    ]
  },
  "UPSC / Civil Services": {
    title: "Civil Services / UPSC Preparation",
    links: [
      { name: "ClearIAS Free UPSC Study Resources", url: "https://www.clearias.com/" },
      { name: "Tamil Nadu Board Previous Year Question Papers", url: "https://www.dge.tn.gov.in" },
      { name: "UPSC Official Syllabus & Previous papers", url: "https://www.upsc.gov.in" }
    ],
    tips: [
      "Read one national daily newspaper editorial (e.g. The Hindu) for 20 minutes.",
      "Focus heavily on Tamil Nadu State Board Class 6-12 History and Geography.",
      "Practice summarizing complex news items in your own words."
    ]
  },
  "Chartered Accountant (CA)": {
    title: "CA Foundation Preparation",
    links: [
      { name: "ICAI Board of Studies Knowledge Portal", url: "https://www.icai.org/post/bos-knowledge-portal" },
      { name: "CA Foundation Mock Test Series", url: "https://www.icai.org" }
    ],
    tips: [
      "Master the fundamental double-entry ledger bookkeeping principles.",
      "Practice quantitative aptitude and logical reasoning daily.",
      "Make clear handwritten notes of Mercantile Laws section codes."
    ]
  },
  "Defence Services (NDA)": {
    title: "NDA / Defence Entrance Preparation",
    links: [
      { name: "NDA Entrance Exam Mock Tests", url: "https://www.upsc.gov.in" },
      { name: "Tamil Nadu Youth Physical Fitness guidelines", url: "https://tnschools.gov.in" }
    ],
    tips: [
      "Brush up on basic high school Physics, Mathematics, and General English grammar.",
      "Incorporate 30 minutes of cardiovascular running/fitness training every morning.",
      "Stay updated on current affairs and national security developments."
    ]
  },
  "Default": {
    title: "Career & Study Resources",
    links: [
      { name: "Tamil Nadu Board Previous Year Question Papers", url: "https://www.dge.tn.gov.in" },
      { name: "National Digital Library of India (NDLI)", url: "https://ndl.iitkgp.ac.in/" }
    ],
    tips: [
      "Establish a consistent study schedule of 2-3 hours daily outside school hours.",
      "Ask questions in class whenever you don't understand a concept.",
      "Keep standard revision notebook notes for exam preparation."
    ]
  }
};

// Subject Study Tips
const SUBJECT_STUDY_TIPS: Record<string, string> = {
  "English": "Read one short story daily in English. Circle new words, check their meanings, and practice using them in your own sentences.",
  "Mathematics": "Solve 5 practice problems every single morning. Write out formulas on a cheat sheet and review them before sleeping.",
  "Science": "Draw key biological diagrams and chemical formulas. Explaining a scientific concept to a classmate is the best way to lock it in your memory.",
  "Social Science": "Create a timeline chart of important dates and historical events. Hang it near your desk so you see it daily.",
  "Tamil": "Focus on correct grammatical rules (Ilaakkanam) and practice writing short essays to improve your Tamil spelling and vocabulary speed."
};

function StatusIcon({ status }: { status: string }) {
  if (status === "answered") return <span className="text-2xl">&#128172;</span>;
  if (status === "reviewed") return <span className="text-2xl">&#9989;</span>;
  return <span className="text-2xl">&#9203;</span>;
}

export default function StudentPersonalGuidePage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  const [student, setStudent] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  // Dynamic Mentor Hub States
  const [lowestSubject, setLowestSubject] = useState<string>("");
  const [lowestScore, setLowestScore] = useState<number>(0);
  const [mentorGoal, setMentorGoal] = useState<string>("Default");

  // Yoga Pose Carousel Index
  const [yogaIdx, setYogaIdx] = useState(0);

  const loadTasks = useCallback(
    async (studentId: string) => {
      try {
        const res = await fetch(
          `${API}/api/personal-guide/tasks?studentId=${studentId}`
        );
        const data = await res.json();
        if (data.success) setTasks(data.data);
      } catch (e) {
        console.error(e);
      }
    },
    []
  );

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`${API}/api/students?userId=${userId}`)
      .then((r) => r.json())
      .then(async (d) => {
        if (d.success && d.data.length > 0) {
          const s = d.data[0];
          setStudent(s);

          // 1. Fetch full details to check marks and lowest score
          try {
            const resFull = await fetch(`${API}/api/students/${s.id}`);
            const dataFull = await resFull.json();
            if (dataFull.success && dataFull.data) {
              const marks = dataFull.data.marks || [];
              if (marks.length > 0) {
                const lowest = marks.reduce((min: any, m: any) => m.scored < min.scored ? m : min, marks[0]);
                setLowestSubject(lowest.subject);
                setLowestScore(lowest.scored);
              }
            }
          } catch (e) { console.error(e); }

          // 2. Fetch teacher assigned guidance log (to get Career Goal)
          try {
            const resGuide = await fetch(`${API}/api/personal-guide/student/${s.id}`);
            const dataGuide = await resGuide.json();
            if (dataGuide.success && dataGuide.data && dataGuide.data.goal) {
              setMentorGoal(dataGuide.data.goal);
            }
          } catch (e) { console.error(e); }

          await loadTasks(s.id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId, loadTasks]);

  const handleNextPose = () => {
    setYogaIdx((prev) => (prev + 1) % YOGA_POSES.length);
  };

  const handlePrevPose = () => {
    setYogaIdx((prev) => (prev - 1 + YOGA_POSES.length) % YOGA_POSES.length);
  };

  const handleSubmitResponse = async (taskId: string) => {
    const text = draftText[taskId]?.trim();
    if (!text || !student) return;
    setSubmitting(taskId);
    try {
      const res = await fetch(
        `${API}/api/personal-guide/tasks/${taskId}/respond`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: student.id, responseText: text }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setDraftText((prev) => ({ ...prev, [taskId]: "" }));
        await loadTasks(student.id);
        Swal.fire({
          icon: "success",
          title: "Response Sent!",
          text: "Your teacher will review it soon.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({ icon: "error", title: "Failed", text: data.error });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(null);
    }
  };

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const answeredCount = tasks.filter((t) => t.status === "answered").length;
  const reviewedCount = tasks.filter((t) => t.status === "reviewed").length;

  const resources = GOAL_RESOURCES[mentorGoal] || GOAL_RESOURCES["Default"];
  const subjectStudyTip = SUBJECT_STUDY_TIPS[lowestSubject] || SUBJECT_STUDY_TIPS["English"];
  const activePose = YOGA_POSES[yogaIdx];

  // Pagination logic
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(tasks.length / tasksPerPage);

  if (loading) {
    return (
      <PortalLayout>
        <div className="min-h-screen flex items-center justify-center text-slate-400 text-xs">
          Loading your Personal Guide...
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-5">

          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-black">Personal Guide</h1>
                <p className="text-indigo-200 text-xs">
                  Tasks & Support Hub. Learn, breathe, and reach your goals.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-xl">
              <div className="bg-white/10 rounded-xl p-2 sm:p-3 text-center border border-white/20 flex flex-col justify-center">
                <p className="text-lg sm:text-xl font-black text-amber-300">{pendingCount}</p>
                <p className="text-[10px] sm:text-xs text-indigo-200 leading-tight">Awaiting Reply</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2 sm:p-3 text-center border border-white/20 flex flex-col justify-center">
                <p className="text-lg sm:text-xl font-black text-blue-200">{answeredCount}</p>
                <p className="text-[10px] sm:text-xs text-indigo-200 leading-tight">Replied</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2 sm:p-3 text-center border border-white/20 flex flex-col justify-center">
                <p className="text-lg sm:text-xl font-black text-emerald-300">{reviewedCount}</p>
                <p className="text-[10px] sm:text-xs text-indigo-200 leading-tight">Feedback Received</p>
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT: Task Inbox */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Inbox className="w-4 h-4 text-indigo-500" />
                <h2 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Task Inbox from Teacher
                </h2>
              </div>

              {tasks.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center py-20 text-center">
                  <Inbox className="w-12 h-12 text-slate-200 dark:text-slate-700 mb-3" />
                  <p className="text-sm font-bold text-slate-400">No tasks yet!</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Your teacher has not sent any tasks yet. Check back after your
                    mentor assigns you a task.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentTasks.map((task) => {
                    const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
                    const isExp = expandedId === task._id;
                    const hasRes = !!task.response;

                    return (
                      <div
                      key={task._id}
                      className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden transition-colors ${cfg.border}`}
                    >
                      <div
                        onClick={() => setExpandedId(isExp ? null : task._id)}
                        className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <div className="shrink-0 mt-0.5">
                          <StatusIcon status={task.status} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start sm:items-center flex-col sm:flex-row gap-1 sm:gap-2 mb-1">
                            <h3 className="text-sm font-black text-slate-800 dark:text-white leading-tight">
                              {task.title}
                            </h3>
                            <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 w-fit">
                              {TASK_TYPE_LABELS[task.taskType] || task.taskType}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                            {task.question}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs font-bold text-slate-500">
                              {cfg.label}
                            </span>
                            {task.dueDate && (
                              <span className="text-xs text-amber-500">
                                Due: {task.dueDate}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 text-slate-400">
                          {isExp ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>

                      {isExp && (
                        <div className="border-t border-slate-100 dark:border-slate-800 p-5 space-y-4 bg-white dark:bg-slate-900">
                          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl p-4">
                            <p className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-1">
                              Your Teacher Asks:
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                              {task.question}
                            </p>
                          </div>

                          {hasRes ? (
                            <div className="space-y-3">
                              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl p-4">
                                <p className="text-xs font-black text-blue-500 uppercase tracking-wider mb-1">
                                  Your Answer
                                </p>
                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                  {task.response.responseText}
                                </p>
                                <p className="text-xs text-slate-400 mt-2">
                                  Submitted:{" "}
                                  {new Date(
                                    task.response.submittedAt
                                  ).toLocaleString("en-IN")}
                                </p>
                              </div>

                              {task.response.teacherFeedback ? (
                                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                                    Teacher Feedback
                                  </p>
                                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                                    &quot;{task.response.teacherFeedback}&quot;
                                  </p>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-xl px-4 py-3">
                                  <Clock className="w-3.5 h-3.5 shrink-0" />
                                  Your teacher is reviewing your response. Feedback
                                  coming soon!
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
                                Write Your Response
                              </p>
                              <textarea
                                rows={4}
                                value={draftText[task._id] || ""}
                                onChange={(e) =>
                                  setDraftText((prev) => ({
                                    ...prev,
                                    [task._id]: e.target.value,
                                  }))
                                }
                                placeholder="Type your answer here. Be honest and thoughtful. Your teacher wants to help you!"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 resize-none leading-relaxed"
                              />
                              <button
                                onClick={() => handleSubmitResponse(task._id)}
                                disabled={
                                  submitting === task._id ||
                                  !draftText[task._id]?.trim()
                                }
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                              >
                                <Send className="w-3.5 h-3.5" />
                                {submitting === task._id
                                  ? "Submitting..."
                                  : "Submit Answer to Teacher"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 pb-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </button>
                      <span className="text-xs font-bold text-slate-500">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT: Mentor Support Hub */}
            <div className="lg:col-span-1 space-y-5">

              <div className="flex items-center gap-2 px-1">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <h2 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Mentor's Support Hub
                </h2>
              </div>

              {/* Widget 1: Yoga Poses Widget (with Image steps) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                      🧘 Mind Yoga Pose
                    </h3>
                  </div>
                  {/* Navigation controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevPose}
                      className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] text-slate-400 font-bold px-1">
                      {yogaIdx + 1}/{YOGA_POSES.length}
                    </span>
                    <button
                      onClick={handleNextPose}
                      className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Active Yoga Pose details */}
                <div className="space-y-3">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                    <img
                      src={activePose.image}
                      alt={activePose.name}
                      className="object-cover w-full h-full"
                    />
                    <span className="absolute bottom-2 right-2 text-[9px] bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full font-bold">
                      ⏱️ {activePose.duration}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white">
                      {activePose.name}
                    </h4>
                    <p className="text-[10px] font-bold text-indigo-500">
                      {activePose.localName}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {activePose.benefits}
                    </p>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      How to do it:
                    </p>
                    <ol className="space-y-1">
                      {activePose.steps.map((step, idx) => (
                        <li
                          key={idx}
                          className="text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-1 leading-relaxed"
                        >
                          <span className="font-bold text-indigo-400 min-w-[12px]">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>

              {/* Widget 2: Career Goal Reference Links */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Compass className="w-4 h-4 text-violet-500" />
                  <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                    🎯 Goal: {mentorGoal}
                  </h3>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    Suggested Study Materials
                  </p>
                  <ul className="space-y-2">
                    {resources.links.map((link, idx) => (
                      <li key={idx} className="text-xs">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-500 hover:underline flex items-start gap-1 font-medium leading-tight"
                        >
                          <span>🔗</span>
                          <span>{link.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    Preparation Tips
                  </p>
                  <ul className="space-y-1.5">
                    {resources.tips.map((tip, idx) => (
                      <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5 leading-relaxed">
                        <span className="text-indigo-400 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Widget 3: Subject wise study tips */}
              {lowestSubject && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <Brain className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                      💡 Study Focus: {lowestSubject}
                    </h3>
                  </div>
                  <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/50 rounded-xl p-3">
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {subjectStudyTip}
                    </p>
                    {lowestScore > 0 && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 font-bold">
                        Targeting improvement from {lowestScore}% score
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </div>
    </PortalLayout>
  );
}
