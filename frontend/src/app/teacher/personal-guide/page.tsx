"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import {
  Users,
  Send,
  MessageSquare,
  Clock,
  Star,
  Trash2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Sparkles,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TASK_TYPES = [
  { value: "reflection", label: "Reflection" },
  { value: "goal", label: "Goal Check-in" },
  { value: "question", label: "Question" },
  { value: "custom", label: "Custom Task" },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; statusKey: string; color: string }
> = {
  pending: {
    label: "Pending",
    statusKey: "pending",
    color:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800",
  },
  answered: {
    label: "Answered",
    statusKey: "answered",
    color:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800",
  },
  reviewed: {
    label: "Reviewed",
    statusKey: "reviewed",
    color:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800",
  },
};

function StatusIcon({ status }: { status: string }) {
  if (status === "answered") return <span>&#128172;</span>;
  if (status === "reviewed") return <span>&#9989;</span>;
  return <span>&#9203;</span>;
}

export default function TeacherPersonalGuidePage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const teacherId = (session?.user as any)?.id;

  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [searchStudents, setSearchStudents] = useState("");
  const [form, setForm] = useState({
    title: "",
    question: "",
    taskType: "question",
    dueDate: "",
  });
  const [sending, setSending] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({});
  const [savingFeedback, setSavingFeedback] = useState<string | null>(null);
  const [generatingAI, setGeneratingAI] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId || !teacherId) return;
    setLoadingStudents(true);

    const loadClassStudents = async () => {
      try {
        // Step 1: Get the classes assigned to this teacher
        const classRes = await fetch(
          `${API}/api/classes?schoolId=${schoolId}&teacherId=${teacherId}`
        );
        const classData = await classRes.json();
        const teacherClasses: { className: string; section: string }[] =
          classData.success ? classData.data || [] : [];

        if (teacherClasses.length === 0) {
          setStudents([]);
          return;
        }

        // Step 2: Fetch all students of this school, then filter by teacher's classes
        const stuRes = await fetch(`${API}/api/students?schoolId=${schoolId}`);
        const stuData = await stuRes.json();
        if (!stuData.success) return;

        const allStudents: any[] = stuData.data || [];

        // Build a set of "className|section" for quick lookup
        const classSet = new Set(
          teacherClasses.map((c) => `${c.className}|${c.section}`)
        );

        const filtered = allStudents.filter((s) =>
          classSet.has(`${s.class}|${s.section}`)
        );

        setStudents(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStudents(false);
      }
    };

    loadClassStudents();
  }, [schoolId, teacherId]);

  const loadTasks = useCallback(
    async (studentId: string) => {
      setLoadingTasks(true);
      try {
        const res = await fetch(
          `${API}/api/personal-guide/tasks?studentId=${studentId}&teacherId=${teacherId}`
        );
        const data = await res.json();
        if (data.success) setTasks(data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingTasks(false);
      }
    },
    [teacherId]
  );

  useEffect(() => {
    if (selectedStudent) loadTasks(selectedStudent.id);
    else setTasks([]);
  }, [selectedStudent, loadTasks]);

  const handleSendTask = async () => {
    if (!form.title || !form.question) {
      return Swal.fire({
        icon: "warning",
        title: "Fill required fields",
        text: "Title and question are required.",
        confirmButtonColor: "#6366f1",
      });
    }
    if (!selectedStudent) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/api/personal-guide/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId,
          studentId: selectedStudent.id,
          schoolId,
          title: form.title,
          question: form.question,
          taskType: form.taskType,
          dueDate: form.dueDate || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setForm({ title: "", question: "", taskType: "question", dueDate: "" });
        await loadTasks(selectedStudent.id);
        Swal.fire({
          icon: "success",
          title: "Task Sent!",
          text: `Sent to ${selectedStudent.user?.name}`,
          timer: 1800,
          showConfirmButton: false,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleSaveFeedback = async (taskId: string) => {
    const fb = feedbackText[taskId];
    if (!fb?.trim()) return;
    setSavingFeedback(taskId);
    try {
      const res = await fetch(
        `${API}/api/personal-guide/tasks/${taskId}/feedback`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teacherFeedback: fb }),
        }
      );
      const data = await res.json();
      if (data.success) {
        await loadTasks(selectedStudent.id);
        setFeedbackText((prev) => ({ ...prev, [taskId]: "" }));
        Swal.fire({
          icon: "success",
          title: "Feedback Saved!",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingFeedback(null);
    }
  };

  const handleSuggestAIFeedback = async (taskId: string) => {
    setGeneratingAI(taskId);
    try {
      const res = await fetch(`${API}/api/personal-guide/tasks/${taskId}/suggest-feedback`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success && data.feedback) {
        setFeedbackText((prev) => ({ ...prev, [taskId]: data.feedback }));
      } else {
        Swal.fire({ icon: "error", title: "AI Suggestion Failed", text: data.error || "Make sure GEMINI_API_KEY is configured in backend." });
      }
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "Connection Error", text: "Failed to connect to the backend server." });
    } finally {
      setGeneratingAI(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const r = await Swal.fire({
      icon: "warning",
      title: "Delete this task?",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Delete",
    });
    if (!r.isConfirmed) return;
    await fetch(`${API}/api/personal-guide/tasks/${taskId}`, {
      method: "DELETE",
    });
    await loadTasks(selectedStudent.id);
  };

  const filteredStudents = students.filter((s) =>
    (s.user?.name || "").toLowerCase().includes(searchStudents.toLowerCase())
  );
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const answeredCount = tasks.filter((t) => t.status === "answered").length;

  return (
    <PortalLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-4">

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center shadow">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white">
                {lang === "தமிழ்" ? "தனிப்பட்ட வழிகாட்டி" : "Personal Guide"}
              </h1>
              <p className="text-xs text-slate-500">
                {lang === "தமிழ்" ? "மாணவர்களுக்கு பணிகள் அனுப்பி மறும௻வினைகள் கண்டறி" : "Send tasks to students and track their responses"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Student List */}
             <div
              className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm overflow-hidden h-[300px] lg:h-[80vh]"
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                    {lang === "தமிழ்" ? "மாணவர்கள்" : "Students"}
                  </h2>
                  <span className="ml-auto text-xs bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold border border-indigo-100 dark:border-indigo-900">
                    {students.length}
                  </span>
                </div>
                <input
                  value={searchStudents}
                  onChange={(e) => setSearchStudents(e.target.value)}
                  placeholder={lang === "தமிழ்" ? "மாணவரை தேடு..." : "Search student..."}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {loadingStudents ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    {lang === "தமிழ்" ? "ஏற்றுகிறது..." : "Loading..."}
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    {lang === "தமிழ்" ? "மாணவர்கள் இல்லை" : "No students found"}
                  </div>
                ) : (
                  filteredStudents.map((s) => {
                    const name = s.user?.name || "Unknown";
                    const initials = name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);
                    const isSel = selectedStudent?.id === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedStudent(s)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-2 ${
                          isSel
                            ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-500"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                            isSel
                              ? "bg-indigo-500 text-white"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-bold truncate ${
                              isSel
                                ? "text-indigo-600 dark:text-indigo-400"
                                : "text-slate-800 dark:text-white"
                            }`}
                          >
                            {name}
                          </p>
                          <p className="text-xs text-slate-400">
                            Class {s.class}-{s.section}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Task Panel */}
            <div className="lg:col-span-2 space-y-4">
              {!selectedStudent ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center py-28 text-center shadow-sm">
                  <Users className="w-12 h-12 text-slate-200 dark:text-slate-700 mb-3" />
                  <p className="text-sm font-bold text-slate-400">
                    Select a student from the list
                  </p>
                  <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
                    to send tasks and view their responses
                  </p>
                </div>
              ) : (
                <>
                  {/* Student Banner */}
                  <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl p-5 text-white shadow flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-black">
                        {(selectedStudent.user?.name || "?")
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div>
                        <h2 className="text-sm font-black">
                          {selectedStudent.user?.name}
                        </h2>
                        <p className="text-indigo-200 text-xs">
                          Class {selectedStudent.class}-{selectedStudent.section}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-center">
                      <div>
                        <p className="text-lg font-black">{tasks.length}</p>
                        <p className="text-xs text-indigo-200">Tasks</p>
                      </div>
                      <div>
                        <p className="text-lg font-black text-amber-300">
                          {pendingCount}
                        </p>
                        <p className="text-xs text-indigo-200">Pending</p>
                      </div>
                      <div>
                        <p className="text-lg font-black text-emerald-300">
                          {answeredCount}
                        </p>
                        <p className="text-xs text-indigo-200">Answered</p>
                      </div>
                    </div>
                  </div>

                  {/* Send Task Form */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <Send className="w-4 h-4 text-indigo-500" />
                      <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider">
                        Send New Task
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs text-slate-500 mb-1 font-semibold">
                          Task Title *
                        </label>
                        <input
                          value={form.title}
                          onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                          }
                          placeholder="e.g. Weekly Reflection, Goal Check-in..."
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1 font-semibold">
                          Task Type
                        </label>
                        <select
                          value={form.taskType}
                          onChange={(e) =>
                            setForm({ ...form, taskType: e.target.value })
                          }
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-400"
                        >
                          {TASK_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1 font-semibold">
                          Due Date (optional)
                        </label>
                        <input
                          type="date"
                          value={form.dueDate}
                          onChange={(e) =>
                            setForm({ ...form, dueDate: e.target.value })
                          }
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-indigo-400"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-slate-500 mb-1 font-semibold">
                          Question / Instructions *
                        </label>
                        <textarea
                          rows={3}
                          value={form.question}
                          onChange={(e) =>
                            setForm({ ...form, question: e.target.value })
                          }
                          placeholder="e.g. What subject did you struggle with this week? What steps are you taking towards your goal?"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 resize-none"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleSendTask}
                      disabled={sending}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {sending ? "Sending..." : `Send to ${selectedStudent.user?.name}`}
                    </button>
                  </div>

                  {/* Sent Tasks */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <MessageSquare className="w-4 h-4 text-indigo-500" />
                      <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider">
                        Sent Tasks and Responses
                      </h3>
                    </div>

                    {loadingTasks ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        Loading...
                      </div>
                    ) : tasks.length === 0 ? (
                      <div className="py-12 text-center text-slate-300 dark:text-slate-600">
                        <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <p className="text-xs">
                          No tasks sent yet. Use the form above to send the first
                          task!
                        </p>
                      </div>
                    ) : (
                      tasks.map((task) => {
                        const cfg =
                          STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
                        const isExp = expandedTaskId === task._id;
                        const hasResp = !!task.response;
                        const typeLabel =
                          TASK_TYPES.find((t) => t.value === task.taskType)
                            ?.label || task.taskType;

                        return (
                          <div
                            key={task._id}
                            className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden"
                          >
                            <div
                              onClick={() =>
                                setExpandedTaskId(isExp ? null : task._id)
                              }
                              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-xs font-bold text-slate-800 dark:text-white">
                                    {task.title}
                                  </p>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full font-bold border ${cfg.color}`}
                                  >
                                    <StatusIcon status={task.status} />{" "}
                                    {cfg.label}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                                    {typeLabel}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5 truncate">
                                  {task.question}
                                </p>
                                {task.dueDate && (
                                  <p className="text-xs text-amber-500 mt-0.5">
                                    Due: {task.dueDate}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTask(task._id);
                                  }}
                                  className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                {isExp ? (
                                  <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                            </div>

                            {isExp && (
                              <div className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/30">
                                <div>
                                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                                    Task Question
                                  </p>
                                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg px-3 py-2">
                                    {task.question}
                                  </p>
                                </div>

                                {hasResp ? (
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-xs font-black text-blue-500 uppercase tracking-wider mb-1">
                                        Student Response
                                      </p>
                                      <p className="text-xs text-slate-700 dark:text-slate-300 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-lg px-3 py-2 leading-relaxed">
                                        {task.response.responseText}
                                      </p>
                                      <p className="text-xs text-slate-400 mt-1">
                                        Submitted:{" "}
                                        {new Date(
                                          task.response.submittedAt
                                        ).toLocaleString("en-IN")}
                                      </p>
                                    </div>

                                    {task.response.teacherFeedback ? (
                                      <div>
                                        <p className="text-xs font-black text-emerald-500 uppercase tracking-wider mb-1">
                                          Your Feedback (sent to student)
                                        </p>
                                        <p className="text-xs text-slate-700 dark:text-slate-300 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-lg px-3 py-2 italic">
                                          &quot;{task.response.teacherFeedback}&quot;
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <p className="text-xs font-black text-indigo-500 uppercase tracking-wider">
                                          Add Your Feedback
                                        </p>
                                        <textarea
                                          rows={4}
                                          value={feedbackText[task._id] || ""}
                                          onChange={(e) =>
                                            setFeedbackText((prev) => ({
                                              ...prev,
                                              [task._id]: e.target.value,
                                            }))
                                          }
                                          placeholder="Write feedback for this student's response..."
                                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 resize-none"
                                        />
                                        <div className="flex gap-2 items-center">
                                          <button
                                            onClick={() =>
                                              handleSuggestAIFeedback(task._id)
                                            }
                                            disabled={generatingAI === task._id}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors"
                                          >
                                            <Sparkles className="w-3 h-3" />
                                            {generatingAI === task._id
                                              ? "Thinking..."
                                              : " Auto-Suggest AI"}
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleSaveFeedback(task._id)
                                            }
                                            disabled={
                                              savingFeedback === task._id ||
                                              !feedbackText[task._id]?.trim()
                                            }
                                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors"
                                          >
                                            <Star className="w-3 h-3" />
                                            {savingFeedback === task._id
                                              ? "Saving..."
                                              : "Send Feedback"}
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-lg px-3 py-2">
                                    <Clock className="w-3 h-3 shrink-0" />
                                    Waiting for student response...
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
