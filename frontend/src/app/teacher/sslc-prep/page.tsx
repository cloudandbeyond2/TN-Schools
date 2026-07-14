"use client";

import { useState, useEffect, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import {
  LayoutDashboard, FileText, BookOpen, ClipboardList, Plus, Trash2, Eye, EyeOff,
  Users, TrendingUp, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, X, BarChart2,
} from "lucide-react";

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

const SUBJECTS = ["Tamil", "English", "Mathematics", "Science", "Social Science"];
const PAPER_TYPES = ["Board", "Model", "Quarterly", "Half-Yearly", "Annual"];

const SUBJECT_COLORS: Record<string, string> = {
  Tamil: "#f59e0b",
  English: "#10b981",
  Mathematics: "#ef4444",
  Science: "#3b82f6",
  "Social Science": "#8b5cf6",
};

interface QuestionInput {
  type: "mcq" | "short";
  text: string;
  options: string[];
  answer: string;
  marks: number;
}

const emptyQuestion = (): QuestionInput => ({
  type: "mcq",
  text: "",
  options: ["A) ", "B) ", "C) ", "D) "],
  answer: "A",
  marks: 1,
});

export default function TeacherSSLCPrepPage() {
  const { data: session } = useSession();
  const sessionUser = session?.user as any;
  const role = sessionUser?.role || "TEACHER";
  const schoolId = sessionUser?.schoolId || "";

  // Requests that create/update/delete SSLC content carry the caller's
  // role so the backend permission middleware can enforce access.
  const staffHeaders = useCallback(
    () => ({ "Content-Type": "application/json", "X-User-Role": role }),
    [role]
  );

  const [activeTab, setActiveTab] = useState<"overview" | "tests" | "papers" | "plans">("overview");
  const [selectedGrade, setSelectedGrade] = useState<"9" | "10">("10");
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("all");
  const [predictionsPage, setPredictionsPage] = useState(1);

  // Fetch teacher classrooms
  useEffect(() => {
    if (schoolId && sessionUser?.id) {
      fetch(`${API_BASE}/api/classes?schoolId=${schoolId}&teacherId=${sessionUser.id}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data)) {
            setClassrooms(json.data);
            if (json.data.length > 0) {
              setSelectedGrade(json.data[0].className as any);
            }
          }
        })
        .catch((err) => console.error("Error loading teacher classrooms", err));
    }
  }, [schoolId, sessionUser?.id]);

  const activeSubjects = (() => {
    let list: string[] = [];
    if (selectedClassroom && selectedClassroom !== "all") {
      const cr = classrooms.find((c) => c.id === selectedClassroom);
      if (cr && cr.subject) list = [cr.subject];
    } else if (classrooms.length > 0) {
      list = Array.from(new Set(classrooms.map((c: any) => c.subject).filter(Boolean)));
    }
    return list.length > 0 ? list : SUBJECTS;
  })();

  // ── Overview / analytics ──────────────────────────────────────────
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // ── Mock tests ────────────────────────────────────────────────────
  const [tests, setTests] = useState<any[]>([]);
  const [showTestForm, setShowTestForm] = useState(false);
  const [testTitle, setTestTitle] = useState("");
  const [testSubject, setTestSubject] = useState("Mathematics");
  const [testDuration, setTestDuration] = useState(180);
  const [testDifficulty, setTestDifficulty] = useState("Medium");
  const [questions, setQuestions] = useState<QuestionInput[]>([emptyQuestion()]);
  const [savingTest, setSavingTest] = useState(false);
  const [attemptsFor, setAttemptsFor] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);

  // ── Question papers ───────────────────────────────────────────────
  const [papers, setPapers] = useState<any[]>([]);
  const [paperForm, setPaperForm] = useState({ title: "", subject: "Mathematics", year: "2025", paperType: "Board", fileUrl: "" });
  const [showPaperForm, setShowPaperForm] = useState(false);

  // ── Prep plans ────────────────────────────────────────────────────
  const [plans, setPlans] = useState<any[]>([]);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planForm, setPlanForm] = useState({ title: "", subject: "Mathematics", description: "" });
  const [planWeeks, setPlanWeeks] = useState([{ week: 1, focus: "", topics: "", activities: "" }]);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  // Auto-default form subject fields based on active subjects
  useEffect(() => {
    if (activeSubjects.length > 0 && !activeSubjects.includes(testSubject)) {
      setTestSubject(activeSubjects[0]);
    }
  }, [activeSubjects, testSubject]);

  useEffect(() => {
    if (activeSubjects.length > 0 && !activeSubjects.includes(paperForm.subject)) {
      setPaperForm((prev) => ({ ...prev, subject: activeSubjects[0] }));
    }
  }, [activeSubjects, paperForm.subject]);

  useEffect(() => {
    if (activeSubjects.length > 0 && !activeSubjects.includes(planForm.subject)) {
      setPlanForm((prev) => ({ ...prev, subject: activeSubjects[0] }));
    }
  }, [activeSubjects, planForm.subject]);

  /* ─── Data loading ─────────────────────────────────────────────── */

  const loadAnalytics = useCallback(() => {
    if (!schoolId) return;
    setAnalyticsLoading(true);
    setPredictionsPage(1);

    const params = new URLSearchParams();
    params.append("schoolId", schoolId);
    if (sessionUser?.id) {
      params.append("teacherId", sessionUser.id);
    }

    if (selectedClassroom && selectedClassroom !== "all") {
      const classroom = classrooms.find((c) => c.id === selectedClassroom);
      if (classroom) {
        params.append("class", classroom.className);
        params.append("section", classroom.section);
      } else {
        params.append("class", selectedGrade);
      }
    } else {
      if (classrooms.length === 0) {
        params.append("class", selectedGrade);
      }
    }

    fetch(`${API_BASE}/api/sslc-prep/analytics/school?${params.toString()}`, {
      headers: { "X-User-Role": role },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setAnalytics(json.data);
        setAnalyticsLoading(false);
      })
      .catch(() => setAnalyticsLoading(false));
  }, [schoolId, selectedGrade, role, selectedClassroom, classrooms, sessionUser?.id]);

  const loadTests = useCallback(() => {
    const params = new URLSearchParams({ all: "true" });
    if (schoolId) params.set("schoolId", schoolId);

    if (selectedClassroom && selectedClassroom !== "all") {
      const classroom = classrooms.find((c) => c.id === selectedClassroom);
      if (classroom) {
        params.set("class", classroom.className);
      }
    } else if (classrooms.length === 0) {
      params.set("class", selectedGrade);
    }

    fetch(`${API_BASE}/api/sslc-prep/mock-tests?${params.toString()}`, {
      headers: { "X-User-Role": role },
    })
      .then((res) => res.json())
      .then((json) => json.success && setTests(json.data))
      .catch(() => {});
  }, [selectedGrade, schoolId, role, selectedClassroom, classrooms]);

  const loadPapers = useCallback(() => {
    const params = new URLSearchParams();
    if (schoolId) params.set("schoolId", schoolId);

    if (selectedClassroom && selectedClassroom !== "all") {
      const classroom = classrooms.find((c) => c.id === selectedClassroom);
      if (classroom) {
        params.set("class", classroom.className);
      }
    } else if (classrooms.length === 0) {
      params.set("class", selectedGrade);
    }

    fetch(`${API_BASE}/api/sslc-prep/papers?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => json.success && setPapers(json.data))
      .catch(() => {});
  }, [selectedGrade, schoolId, selectedClassroom, classrooms]);

  const loadPlans = useCallback(() => {
    const params = new URLSearchParams({ includeDrafts: "true" });
    if (schoolId) params.set("schoolId", schoolId);

    if (selectedClassroom && selectedClassroom !== "all") {
      const classroom = classrooms.find((c) => c.id === selectedClassroom);
      if (classroom) {
        params.set("class", classroom.className);
      }
    } else if (classrooms.length === 0) {
      params.set("class", selectedGrade);
    }

    fetch(`${API_BASE}/api/sslc-prep/plans?${params.toString()}`, {
      headers: { "X-User-Role": role },
    })
      .then((res) => res.json())
      .then((json) => json.success && setPlans(json.data))
      .catch(() => {});
  }, [selectedGrade, schoolId, role, selectedClassroom, classrooms]);

  useEffect(() => {
    loadAnalytics();
    loadTests();
    loadPapers();
    loadPlans();
  }, [loadAnalytics, loadTests, loadPapers, loadPlans]);

  /* ─── Mock test actions ────────────────────────────────────────── */

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);
  const removeQuestion = (idx: number) => setQuestions((prev) => prev.filter((_, i) => i !== idx));
  const setQField = (idx: number, field: keyof QuestionInput, val: any) =>
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, [field]: val } : q)));
  const setQOption = (qIdx: number, optIdx: number, val: string) =>
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const options = [...q.options];
        options[optIdx] = val;
        return { ...q, options };
      })
    );

  const saveTest = async (publish: boolean) => {
    if (!testTitle.trim() || questions.some((q) => !q.text.trim())) {
      Swal.fire("Missing details", "Enter a test title and text for every question.", "warning");
      return;
    }
    setSavingTest(true);
    try {
      const res = await fetch(`${API_BASE}/api/sslc-prep/mock-tests`, {
        method: "POST",
        headers: staffHeaders(),
        body: JSON.stringify({
          schoolId,
          class: selectedGrade,
          subject: testSubject,
          title: testTitle,
          durationMinutes: testDuration,
          difficulty: testDifficulty,
          questions,
          published: publish,
          createdById: sessionUser?.id,
          createdByName: sessionUser?.name,
        }),
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire("Saved!", publish ? "Mock test published — students can attempt it now." : "Mock test saved as draft.", "success");
        setShowTestForm(false);
        setTestTitle("");
        setQuestions([emptyQuestion()]);
        loadTests();
      } else {
        Swal.fire("Error", json.error || "Could not save the test.", "error");
      }
    } catch {
      Swal.fire("Error", "Could not reach the server.", "error");
    } finally {
      setSavingTest(false);
    }
  };

  const togglePublishTest = async (test: any) => {
    await fetch(`${API_BASE}/api/sslc-prep/mock-tests/${test._id}/publish`, {
      method: "PATCH",
      headers: staffHeaders(),
      body: JSON.stringify({ published: !test.published }),
    });
    loadTests();
  };

  const deleteTest = async (test: any) => {
    const res = await Swal.fire({
      title: "Delete this mock test?",
      text: `"${test.title}" and all its student attempts will be removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
    });
    if (!res.isConfirmed) return;
    await fetch(`${API_BASE}/api/sslc-prep/mock-tests/${test._id}`, {
      method: "DELETE",
      headers: staffHeaders(),
    });
    loadTests();
  };

  const viewAttempts = async (test: any) => {
    setAttemptsFor(test);
    setAttempts([]);
    const res = await fetch(`${API_BASE}/api/sslc-prep/mock-tests/${test._id}/attempts`, {
      headers: { "X-User-Role": role },
    });
    const json = await res.json();
    if (json.success) setAttempts(json.data);
  };

  /* ─── Question paper actions ───────────────────────────────────── */

  const savePaper = async () => {
    if (!paperForm.title.trim()) {
      Swal.fire("Missing details", "Enter a paper title.", "warning");
      return;
    }
    const res = await fetch(`${API_BASE}/api/sslc-prep/papers`, {
      method: "POST",
      headers: staffHeaders(),
      body: JSON.stringify({
        ...paperForm,
        class: selectedGrade,
        schoolId,
        uploadedById: sessionUser?.id,
        uploadedByName: sessionUser?.name,
      }),
    });
    const json = await res.json();
    if (json.success) {
      setShowPaperForm(false);
      setPaperForm({ title: "", subject: "Mathematics", year: "2025", paperType: "Board", fileUrl: "" });
      loadPapers();
    } else {
      Swal.fire("Error", json.error || "Could not save the paper.", "error");
    }
  };

  const deletePaper = async (paper: any) => {
    const res = await Swal.fire({
      title: "Remove this paper?", text: paper.title, icon: "warning",
      showCancelButton: true, confirmButtonColor: "#ef4444",
    });
    if (!res.isConfirmed) return;
    await fetch(`${API_BASE}/api/sslc-prep/papers/${paper._id}`, { method: "DELETE", headers: staffHeaders() });
    loadPapers();
  };

  /* ─── Prep plan actions ────────────────────────────────────────── */

  const savePlan = async (publish: boolean) => {
    if (!planForm.title.trim() || planWeeks.some((w) => !w.focus.trim())) {
      Swal.fire("Missing details", "Enter a plan title and a focus for every week.", "warning");
      return;
    }
    const res = await fetch(`${API_BASE}/api/sslc-prep/plans`, {
      method: "POST",
      headers: staffHeaders(),
      body: JSON.stringify({
        schoolId,
        class: selectedGrade,
        subject: planForm.subject,
        title: planForm.title,
        description: planForm.description,
        teacherId: sessionUser?.id,
        teacherName: sessionUser?.name,
        published: publish,
        weeks: planWeeks.map((w, i) => ({
          week: i + 1,
          focus: w.focus,
          topics: w.topics.split(",").map((t) => t.trim()).filter(Boolean),
          activities: w.activities.split(",").map((a) => a.trim()).filter(Boolean),
        })),
      }),
    });
    const json = await res.json();
    if (json.success) {
      Swal.fire("Saved!", publish ? "Plan published to students." : "Plan saved as draft.", "success");
      setShowPlanForm(false);
      setPlanForm({ title: "", subject: "Mathematics", description: "" });
      setPlanWeeks([{ week: 1, focus: "", topics: "", activities: "" }]);
      loadPlans();
    } else {
      Swal.fire("Error", json.error || "Could not save the plan.", "error");
    }
  };

  const togglePublishPlan = async (plan: any) => {
    await fetch(`${API_BASE}/api/sslc-prep/plans/${plan._id}/publish`, {
      method: "PATCH",
      headers: staffHeaders(),
      body: JSON.stringify({ published: !plan.published }),
    });
    loadPlans();
  };

  const deletePlan = async (plan: any) => {
    const res = await Swal.fire({
      title: "Delete this plan?", text: plan.title, icon: "warning",
      showCancelButton: true, confirmButtonColor: "#ef4444",
    });
    if (!res.isConfirmed) return;
    await fetch(`${API_BASE}/api/sslc-prep/plans/${plan._id}`, { method: "DELETE", headers: staffHeaders() });
    loadPlans();
  };

  /* ─── Render ───────────────────────────────────────────────────── */

  const TABS = [
    { id: "overview" as const, label: "Class Performance", icon: LayoutDashboard },
    { id: "tests" as const, label: "Mock Tests", icon: ClipboardList },
    { id: "papers" as const, label: "Question Papers", icon: FileText },
    { id: "plans" as const, label: "Prep Plans", icon: BookOpen },
  ];

  return (
    <PortalLayout
      title="SSLC Board Prep Console"
      subtitle="Manage board preparation for Classes 9 & 10 — mock tests, papers, plans and predictions."
    >
      {/* Tab bar + grade switch */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                activeTab === tab.id
                  ? "bg-amber-500 border-amber-500 text-slate-900 shadow-lg"
                  : "bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-700 self-start overflow-x-auto max-w-full">
          {classrooms.length > 0 ? (
            <>
              {/* All Classes option */}
              <button
                onClick={() => {
                  setSelectedClassroom("all");
                  if (classrooms.length > 0) {
                    setSelectedGrade(classrooms[0].className as "9" | "10");
                  } else {
                    setSelectedGrade("10");
                  }
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedClassroom === "all"
                    ? "bg-amber-500 text-slate-900 shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All Classes
              </button>

              {/* Dynamically render each assigned classroom */}
              {classrooms.map((cr) => (
                <button
                  key={cr.id}
                  onClick={() => {
                    setSelectedClassroom(cr.id);
                    setSelectedGrade(cr.className as "9" | "10");
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    selectedClassroom === cr.id
                      ? "bg-amber-500 text-slate-900 shadow-lg"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Class {cr.className}-{cr.section}
                </button>
              ))}
            </>
          ) : (
            <>
              {(["9", "10"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setSelectedGrade(g);
                    setSelectedClassroom("all");
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    selectedGrade === g && selectedClassroom === "all"
                      ? "bg-amber-500 text-slate-900 shadow-lg"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Class {g} (All)
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {!schoolId && (
        <div className="mb-6 text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
          Could not resolve your school from the session — log in again if data does not load.
        </div>
      )}

      {/* ════════ OVERVIEW TAB ════════ */}
      {activeTab === "overview" && (
        <div className="space-y-6 fade-in">
          <div className="flex justify-end">
            <button
              onClick={loadAnalytics}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${analyticsLoading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: selectedClassroom !== "all"
                  ? `Class ${classrooms.find((c) => c.id === selectedClassroom)?.className}-${classrooms.find((c) => c.id === selectedClassroom)?.section || ""} Students`
                  : (classrooms.length > 0 ? "All My Students" : `Class ${selectedGrade} Students`),
                value: analytics?.totals?.students ?? "—",
                icon: Users,
                color: "text-amber-400"
              },
              { label: "Avg Syllabus Done", value: analytics ? `${analytics.totals.avgSyllabusCompletion}%` : "—", icon: BookOpen, color: "text-blue-400" },
              { label: "Mock Participation", value: analytics ? `${analytics.totals.mockParticipationPercent}%` : "—", icon: ClipboardList, color: "text-emerald-400" },
              { label: "Predicted Pass Rate", value: analytics ? `${analytics.totals.predictedPassRate}%` : "—", icon: TrendingUp, color: "text-purple-400" },
            ].map((kpi) => (
              <div key={kpi.label} className="kpi-card border border-slate-700">
                <kpi.icon className={`h-5 w-5 ${kpi.color} mb-2`} />
                <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
                <div className="text-xs text-slate-400 mt-1">{kpi.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject averages */}
            <div className="glass rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-400" /> Mock Test Subject Averages
              </h3>
              <div className="space-y-4">
                {((analytics?.subjectAverages || []).filter((s: any) => activeSubjects.includes(s.subject))
                  .length > 0
                    ? (analytics?.subjectAverages || []).filter((s: any) => activeSubjects.includes(s.subject))
                    : activeSubjects.map((s) => ({ subject: s, attempts: 0, averagePercent: null }))
                ).map((s: any) => {
                  const color = SUBJECT_COLORS[s.subject] || "#f59e0b";
                  return (
                    <div key={s.subject}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300 font-semibold">{s.subject}</span>
                        <span className="text-slate-500">
                          {s.averagePercent === null ? "No attempts yet" : `${s.averagePercent}% avg · ${s.attempts} attempts`}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${s.averagePercent || 0}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* At-risk students */}
            <div className="glass rounded-2xl p-6 border border-red-500/30 bg-red-900/10">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" /> At-Risk Students (Predicted &lt; 45%)
              </h3>
              {analyticsLoading ? (
                <div className="text-xs text-slate-500 py-6 text-center">Analysing student data…</div>
              ) : (analytics?.atRisk || []).length === 0 ? (
                <div className="text-xs text-slate-400 py-6 text-center">
                  🎉 No students currently flagged at risk{analytics ? "" : " — data loads once the server is reachable"}.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {analytics.atRisk.map((s: any) => (
                    <div key={s.studentId} className="flex items-center justify-between bg-slate-900/60 rounded-xl px-4 py-2.5 border border-slate-800">
                      <div>
                        <div className="text-sm font-bold text-slate-200">{s.name}</div>
                        <div className="text-[10px] text-slate-500">
                          Roll {s.rollNumber} · Class {s.class}{s.section} · Weakest: {s.weakestSubject || "—"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-red-400">{s.overallPercent}%</div>
                        <div className="text-[10px] text-slate-500">{s.predictedTotal}/500</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Student prediction leaderboard */}
          {(() => {
            const totalPredictions = analytics?.students?.length || 0;
            const predictionsPerPage = 8;
            const totalPages = Math.ceil(totalPredictions / predictionsPerPage);
            const paginatedStudents = (analytics?.students || []).slice(
              (predictionsPage - 1) * predictionsPerPage,
              predictionsPage * predictionsPerPage
            );

            return (
              <div className="glass rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-base font-bold text-white mb-4">Student Performance Predictions</h3>
                {totalPredictions === 0 ? (
                  <div className="text-xs text-slate-500 py-6 text-center">
                    No prediction data yet — predictions appear as marks and mock attempts are recorded.
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
                            <th className="py-3.5 px-4 whitespace-nowrap font-semibold">Student</th>
                            <th className="py-3.5 px-4 whitespace-nowrap font-semibold">Class</th>
                            <th className="py-3.5 px-4 whitespace-nowrap font-semibold">Predicted Total</th>
                            <th className="py-3.5 px-4 whitespace-nowrap font-semibold">Overall %</th>
                            <th className="py-3.5 px-4 whitespace-nowrap font-semibold">Grade</th>
                            <th className="py-3.5 px-4 whitespace-nowrap font-semibold">Weakest Subject</th>
                            <th className="py-3.5 px-4 whitespace-nowrap font-semibold text-right">Outlook</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedStudents.map((s: any) => {
                            let percentBadgeClass = "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50";
                            if (s.subjectsWithData > 0) {
                              const pct = s.overallPercent;
                              if (pct < 50) {
                                percentBadgeClass = "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
                              } else if (pct < 75) {
                                percentBadgeClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
                              } else {
                                percentBadgeClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
                              }
                            }

                            let outlookBadgeClass = "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60";
                            let outlookText = "No data";
                            if (s.subjectsWithData > 0) {
                              if (s.passLikely) {
                                outlookBadgeClass = "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20";
                                outlookText = "On Track";
                              } else {
                                outlookBadgeClass = "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
                                outlookText = "At Risk";
                              }
                            }

                            return (
                              <tr key={s.studentId} className="border-b border-slate-200 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm hover:text-amber-500 dark:hover:text-amber-400 transition-colors">{s.name}</span>
                                  <div className="text-[10px] text-slate-500 mt-0.5">Roll: {s.rollNumber}</div>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/80 font-semibold text-[10px]">
                                    {s.class}{s.section}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  {s.subjectsWithData > 0 ? (
                                    <div className="flex items-baseline gap-0.5">
                                      <span className="text-amber-600 dark:text-amber-400 font-black text-sm">{s.predictedTotal}</span>
                                      <span className="text-slate-500 text-[10px]">/500</span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-600">—</span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  {s.subjectsWithData > 0 ? (
                                    <span className={`px-2.5 py-1 rounded text-[10px] font-black ${percentBadgeClass}`}>
                                      {s.overallPercent}%
                                    </span>
                                  ) : (
                                    <span className="text-slate-600">—</span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  {s.subjectsWithData > 0 ? (
                                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-amber-600 dark:text-amber-500 border border-slate-200 dark:border-slate-800 font-bold text-[10px]">
                                      {s.grade}
                                    </span>
                                  ) : (
                                    <span className="text-slate-600">—</span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  {s.weakestSubject ? (
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">{s.weakestSubject}</span>
                                  ) : (
                                    <span className="text-slate-600">—</span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap text-right">
                                  <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${outlookBadgeClass}`}>
                                    {outlookText}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination controls */}
                    {totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/60 pt-4">
                        <span>
                          Showing {((predictionsPage - 1) * predictionsPerPage) + 1} to {Math.min(predictionsPage * predictionsPerPage, totalPredictions)} of {totalPredictions} students
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPredictionsPage(prev => Math.max(prev - 1, 1))}
                            disabled={predictionsPage === 1}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900/60 transition-all font-semibold text-xs"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => setPredictionsPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={predictionsPage === totalPages}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-900/60 transition-all font-semibold text-xs"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ════════ MOCK TESTS TAB ════════ */}
      {activeTab === "tests" && (
        <div className="space-y-6 fade-in">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">
              Published tests appear instantly in the student portal. Answer keys never leave the server.
            </p>
            <button
              onClick={() => setShowTestForm(!showTestForm)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-black transition-colors"
            >
              {showTestForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showTestForm ? "Close Builder" : "Create Mock Test"}
            </button>
          </div>

          {showTestForm && (
            <div className="glass rounded-2xl p-6 border border-amber-500/30">
              <h3 className="text-base font-bold text-white mb-4">New Mock Test — Class {selectedGrade}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
                <input
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  placeholder="Test title, e.g. SSLC Maths Model Paper III"
                  className="md:col-span-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
                <select value={testSubject} onChange={(e) => setTestSubject(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none">
                  {activeSubjects.map((s) => <option key={s}>{s}</option>)}
                </select>
                <div className="flex gap-2">
                  <select value={testDifficulty} onChange={(e) => setTestDifficulty(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none">
                    {["Easy", "Medium", "Hard"].map((d) => <option key={d}>{d}</option>)}
                  </select>
                  <input
                    type="number" min={10} max={300} value={testDuration}
                    onChange={(e) => setTestDuration(Number(e.target.value))}
                    className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-sm text-white focus:outline-none"
                    title="Duration (minutes)"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={idx} className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black text-slate-500 uppercase">Question {idx + 1}</span>
                      <div className="flex items-center gap-2">
                        <select value={q.type} onChange={(e) => setQField(idx, "type", e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none">
                          <option value="mcq">MCQ (auto-graded)</option>
                          <option value="short">Short / Detailed Answer</option>
                        </select>
                        <input
                          type="number" min={1} max={15} value={q.marks}
                          onChange={(e) => setQField(idx, "marks", Number(e.target.value))}
                          className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                          title="Marks"
                        />
                        {questions.length > 1 && (
                          <button onClick={() => removeQuestion(idx)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <textarea
                      value={q.text}
                      onChange={(e) => setQField(idx, "text", e.target.value)}
                      placeholder="Question text…"
                      rows={2}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 mb-3"
                    />
                    {q.type === "mcq" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <input
                            key={oIdx}
                            value={opt}
                            onChange={(e) => setQOption(idx, oIdx, e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                          />
                        ))}
                        <div className="md:col-span-2 flex items-center gap-2">
                          <span className="text-xs text-slate-400">Correct option:</span>
                          <select value={q.answer} onChange={(e) => setQField(idx, "answer", e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none">
                            {["A", "B", "C", "D"].map((l) => <option key={l}>{l}</option>)}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <textarea
                        value={q.answer}
                        onChange={(e) => setQField(idx, "answer", e.target.value)}
                        placeholder="Model key answer (used for evaluation guidance)…"
                        rows={2}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 mt-5">
                <button onClick={addQuestion}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 text-xs font-bold hover:bg-slate-800">
                  <Plus className="w-3.5 h-3.5" /> Add Question
                </button>
                <div className="flex-1" />
                <button onClick={() => saveTest(false)} disabled={savingTest}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold disabled:opacity-50">
                  Save as Draft
                </button>
                <button onClick={() => saveTest(true)} disabled={savingTest}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-black disabled:opacity-50">
                  {savingTest ? "Saving…" : "Publish to Students"}
                </button>
              </div>
            </div>
          )}

          {/* Test list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.length === 0 && (
              <div className="md:col-span-2 glass rounded-2xl p-10 border border-slate-700/50 text-center text-xs text-slate-500">
                No mock tests created for Class {selectedGrade} yet.
              </div>
            )}
            {tests.map((test) => (
              <div key={test._id} className="glass rounded-2xl p-5 border border-slate-700/50 hover:border-amber-500/40 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase" style={{ color: SUBJECT_COLORS[test.subject] || "#f59e0b" }}>
                        {test.subject}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        test.published
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-slate-700/60 text-slate-400 border-slate-600"
                      }`}>
                        {test.published ? "PUBLISHED" : "DRAFT"}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{test.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {(test.questions || []).length} questions · {test.durationMinutes} min · {test.totalMarks} marks
                      {test.createdByName ? ` · by ${test.createdByName}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => viewAttempts(test)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-700">
                    <Users className="w-3.5 h-3.5" /> Attempts
                  </button>
                  <button onClick={() => togglePublishTest(test)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-700">
                    {test.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {test.published ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => deleteTest(test)}
                    className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════ QUESTION PAPERS TAB ════════ */}
      {activeTab === "papers" && (
        <div className="space-y-6 fade-in">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">
              Papers added here appear in the students&apos; Previous Question Papers library.
            </p>
            <button
              onClick={() => setShowPaperForm(!showPaperForm)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-black transition-colors"
            >
              {showPaperForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showPaperForm ? "Close" : "Add Paper"}
            </button>
          </div>

          {showPaperForm && (
            <div className="glass rounded-2xl p-6 border border-amber-500/30 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={paperForm.title}
                onChange={(e) => setPaperForm({ ...paperForm, title: e.target.value })}
                placeholder="Paper title, e.g. SSLC Science Public Exam 2025"
                className="md:col-span-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              <select value={paperForm.subject} onChange={(e) => setPaperForm({ ...paperForm, subject: e.target.value })}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none">
                {activeSubjects.map((s) => <option key={s}>{s}</option>)}
              </select>
              <div className="flex gap-2">
                <input
                  value={paperForm.year}
                  onChange={(e) => setPaperForm({ ...paperForm, year: e.target.value })}
                  placeholder="Year"
                  className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                />
                <select value={paperForm.paperType} onChange={(e) => setPaperForm({ ...paperForm, paperType: e.target.value })}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none">
                  {PAPER_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <input
                value={paperForm.fileUrl}
                onChange={(e) => setPaperForm({ ...paperForm, fileUrl: e.target.value })}
                placeholder="Paper link / uploaded file URL (optional)"
                className="md:col-span-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              <div className="md:col-span-2 flex justify-end">
                <button onClick={savePaper}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-black">
                  Add to Library
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {papers.length === 0 && (
              <div className="sm:col-span-2 lg:col-span-3 glass rounded-2xl p-10 border border-slate-700/50 text-center text-xs text-slate-500">
                No papers in the Class {selectedGrade} library yet.
              </div>
            )}
            {papers.map((paper) => (
              <div key={paper._id} className="glass rounded-2xl p-5 border border-slate-700/50 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <FileText className="w-6 h-6" style={{ color: SUBJECT_COLORS[paper.subject] || "#f59e0b" }} />
                  <span className="text-[10px] font-black text-slate-400 bg-slate-800 px-2 py-1 rounded uppercase">
                    {paper.year} · {paper.paperType}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{paper.title}</h4>
                <p className="text-[11px] text-slate-500 mb-4">{paper.subject} · {paper.downloads || 0} student opens</p>
                <div className="mt-auto flex justify-between items-center">
                  {paper.fileUrl ? (
                    <a href={paper.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-amber-400 hover:text-amber-300">
                      Open link →
                    </a>
                  ) : <span className="text-[11px] text-slate-600 italic">No file attached</span>}
                  <button onClick={() => deletePaper(paper)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════ PREP PLANS TAB ════════ */}
      {activeTab === "plans" && (
        <div className="space-y-6 fade-in">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">
              Week-by-week preparation plans. Published plans show in the students&apos; Prep Plans page.
            </p>
            <button
              onClick={() => setShowPlanForm(!showPlanForm)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-black transition-colors"
            >
              {showPlanForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showPlanForm ? "Close Builder" : "Create Plan"}
            </button>
          </div>

          {showPlanForm && (
            <div className="glass rounded-2xl p-6 border border-amber-500/30 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  value={planForm.title}
                  onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                  placeholder="Plan title, e.g. Mathematics 8-Week Mastery Plan"
                  className="md:col-span-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
                <select value={planForm.subject} onChange={(e) => setPlanForm({ ...planForm, subject: e.target.value })}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none">
                  {activeSubjects.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <textarea
                value={planForm.description}
                onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                placeholder="Short description shown to students (optional)…"
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              <div className="space-y-3">
                {planWeeks.map((w, idx) => (
                  <div key={idx} className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black text-amber-400 uppercase">Week {idx + 1}</span>
                      {planWeeks.length > 1 && (
                        <button
                          onClick={() => setPlanWeeks((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        value={w.focus}
                        onChange={(e) => setPlanWeeks((prev) => prev.map((x, i) => i === idx ? { ...x, focus: e.target.value } : x))}
                        placeholder="Week focus, e.g. Algebra"
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                      />
                      <input
                        value={w.topics}
                        onChange={(e) => setPlanWeeks((prev) => prev.map((x, i) => i === idx ? { ...x, topics: e.target.value } : x))}
                        placeholder="Topics (comma separated)"
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                      />
                      <input
                        value={w.activities}
                        onChange={(e) => setPlanWeeks((prev) => prev.map((x, i) => i === idx ? { ...x, activities: e.target.value } : x))}
                        placeholder="Activities (comma separated)"
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setPlanWeeks((prev) => [...prev, { week: prev.length + 1, focus: "", topics: "", activities: "" }])}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 text-xs font-bold hover:bg-slate-800"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Week
                </button>
                <div className="flex-1" />
                <button onClick={() => savePlan(false)}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">
                  Save as Draft
                </button>
                <button onClick={() => savePlan(true)}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-black">
                  Publish to Students
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {plans.length === 0 && (
              <div className="glass rounded-2xl p-10 border border-slate-700/50 text-center text-xs text-slate-500">
                No preparation plans for Class {selectedGrade} yet.
              </div>
            )}
            {plans.map((plan) => {
              const isOpen = expandedPlan === plan._id;
              return (
                <div key={plan._id} className="glass rounded-2xl border border-slate-700/50">
                  <div className="p-5 flex items-start justify-between gap-4">
                    <button onClick={() => setExpandedPlan(isOpen ? null : plan._id)} className="text-left flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase" style={{ color: SUBJECT_COLORS[plan.subject] || "#f59e0b" }}>
                          {plan.subject}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          plan.published
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : "bg-slate-700/60 text-slate-400 border-slate-600"
                        }`}>
                          {plan.published ? "PUBLISHED" : "DRAFT"}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {plan.title}
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1">{(plan.weeks || []).length} weeks{plan.teacherName ? ` · by ${plan.teacherName}` : ""}</p>
                    </button>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => togglePublishPlan(plan)}
                        className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-700">
                        {plan.published ? "Unpublish" : "Publish"}
                      </button>
                      <button onClick={() => deletePlan(plan)}
                        className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(plan.weeks || []).map((w: any, i: number) => (
                        <div key={i} className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                          <div className="text-xs font-black text-amber-400 mb-1">Week {w.week}: {w.focus}</div>
                          <div className="text-[11px] text-slate-400">Topics: {(w.topics || []).join(", ") || "—"}</div>
                          <div className="text-[11px] text-slate-500 mt-1">Activities: {(w.activities || []).join(", ") || "—"}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════ ATTEMPTS MODAL ════════ */}
      {attemptsFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-2xl p-6 rounded-2xl border border-slate-700 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Attempts — {attemptsFor.title}</h3>
                <p className="text-xs text-slate-500">{attempts.length} student attempts recorded</p>
              </div>
              <button onClick={() => setAttemptsFor(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {attempts.length === 0 ? (
              <div className="text-xs text-slate-500 py-8 text-center">No attempts yet for this test.</div>
            ) : (
              <div className="space-y-2">
                {attempts.map((a) => (
                  <div key={a._id} className="flex items-center justify-between bg-slate-900/60 rounded-xl px-4 py-3 border border-slate-800">
                    <div>
                      <div className="text-sm font-bold text-slate-200">{a.studentName || a.studentId}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(a.createdAt).toLocaleString()} · {a.correctCount}/{a.questionCount} correct
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-black ${a.percentage >= 60 ? "text-emerald-400" : a.percentage >= 35 ? "text-amber-400" : "text-red-400"}`}>
                        {a.score}/{a.maxScore}
                      </div>
                      <div className="text-[10px] text-slate-500">{a.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
