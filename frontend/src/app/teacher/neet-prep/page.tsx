"use client";

import React, { useState, useEffect, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

interface NEETTopic {
  id: string;
  subject: string;
  chapter: string;
  difficulty: string;
  status: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  updatedAt: string;
}

interface MockTest {
  id: string;
  title: string;
  subject: string;
  examDate: string;
  duration: string;
  totalStudents: number;
  avgScore: number;
  topScore: number;
  maxScore: number;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const subjectColor: Record<string, string> = {
  Biology: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Chemistry: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  Physics: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "Full Syllabus": "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
};

const difficultyColor: Record<string, string> = {
  Easy: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Hard: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const statusColor: Record<string, string> = {
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800",
  Pending: "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
};

const emptyChapterForm = {
  subject: "Biology",
  chapter: "",
  difficulty: "Medium",
  totalQuestions: "100",
  attempted: "0",
  correct: "0",
  status: "Pending",
};

const emptyTestForm = {
  title: "",
  subject: "Full Syllabus",
  examDate: "",
  duration: "3 hrs 20 min",
  totalStudents: "0",
  avgScore: "0",
  topScore: "0",
  maxScore: "720",
};

export default function NEETPrepPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const teacherId = (session?.user as any)?.id;

  const [topics, setTopics] = useState<NEETTopic[]>([]);
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"syllabus" | "tests" | "analytics">("syllabus");
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const [showChapterModal, setShowChapterModal] = useState(false);
  const [chapterForm, setChapterForm] = useState(emptyChapterForm);
  const [editChapterId, setEditChapterId] = useState<string | null>(null);

  const [showTestModal, setShowTestModal] = useState(false);
  const [testForm, setTestForm] = useState(emptyTestForm);
  const [editTestId, setEditTestId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const fetchSyllabus = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (schoolId) params.append("schoolId", schoolId);
      const res = await fetch(`${API}/api/neet-prep/chapters?${params}`);
      const data = await res.json();
      if (data.success) setTopics(data.data);
    } catch (e) {
      console.error(e);
    }
  }, [schoolId]);

  const fetchTests = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (schoolId) params.append("schoolId", schoolId);
      const res = await fetch(`${API}/api/neet-prep/mock-tests?${params}`);
      const data = await res.json();
      if (data.success) setTests(data.data);
    } catch (e) {
      console.error(e);
    }
  }, [schoolId]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchSyllabus(), fetchTests()]);
    setLoading(false);
  }, [fetchSyllabus, fetchTests]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredTopics = topics.filter((t) => {
    const matchSub = filterSubject === "All" || t.subject === filterSubject;
    const matchStat = filterStatus === "All" || t.status === filterStatus;
    return matchSub && matchStat;
  });

  const completedCount = topics.filter((t) => t.status === "Completed").length;
  const inProgressCount = topics.filter((t) => t.status === "In Progress").length;
  const totalAttempted = topics.reduce((a, t) => a + (t.attempted || 0), 0);
  const totalCorrect = topics.reduce((a, t) => a + (t.correct || 0), 0);
  const avgClassScore = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  const handleOpenAddChapter = () => {
    setChapterForm(emptyChapterForm);
    setEditChapterId(null);
    setShowChapterModal(true);
  };

  const handleOpenEditChapter = (t: NEETTopic) => {
    setChapterForm({
      subject: t.subject,
      chapter: t.chapter,
      difficulty: t.difficulty,
      totalQuestions: String(t.totalQuestions),
      attempted: String(t.attempted),
      correct: String(t.correct),
      status: t.status,
    });
    setEditChapterId(t.id);
    setShowChapterModal(true);
  };

  const handleSaveChapter = async () => {
    if (!chapterForm.chapter) {
      return Swal.fire({ icon: "error", title: "Missing Fields", text: "Chapter name is required." });
    }
    setSaving(true);
    try {
      const body = {
        ...chapterForm,
        totalQuestions: Number(chapterForm.totalQuestions) || 0,
        attempted: Number(chapterForm.attempted) || 0,
        correct: Number(chapterForm.correct) || 0,
        schoolId,
        teacherId,
      };
      const url = editChapterId ? `${API}/api/neet-prep/chapters/${editChapterId}` : `${API}/api/neet-prep/chapters`;
      const res = await fetch(url, {
        method: editChapterId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setShowChapterModal(false);
        fetchSyllabus();
        Swal.fire({
          icon: "success",
          title: "Chapter Saved",
          text: `"${chapterForm.chapter}" has been successfully saved to NEET syllabus!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({ icon: "error", title: "Error", text: data.error || "Failed to save chapter" });
      }
    } catch (e) {
      Swal.fire({ icon: "error", title: "Network Error", text: "Failed to connect to database." });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChapter = async (id: string, name: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete chapter "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API}/api/neet-prep/chapters/${id}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            fetchSyllabus();
            Swal.fire("Deleted!", `Chapter "${name}" has been deleted.`, "success");
          } else {
            Swal.fire("Error!", data.error || "Failed to delete chapter.", "error");
          }
        } catch (e) {
          Swal.fire("Error!", "Network error occurred.", "error");
        }
      }
    });
  };

  const handleOpenAddTest = () => {
    setTestForm(emptyTestForm);
    setEditTestId(null);
    setShowTestModal(true);
  };

  const handleOpenEditTest = (t: MockTest) => {
    setTestForm({
      title: t.title,
      subject: t.subject,
      examDate: t.examDate,
      duration: t.duration,
      totalStudents: String(t.totalStudents),
      avgScore: String(t.avgScore),
      topScore: String(t.topScore),
      maxScore: String(t.maxScore),
    });
    setEditTestId(t.id);
    setShowTestModal(true);
  };

  const handleSaveTest = async () => {
    if (!testForm.title) {
      return Swal.fire({ icon: "error", title: "Missing Fields", text: "Test title is required." });
    }
    setSaving(true);
    try {
      const body = {
        ...testForm,
        totalStudents: Number(testForm.totalStudents) || 0,
        avgScore: Number(testForm.avgScore) || 0,
        topScore: Number(testForm.topScore) || 0,
        maxScore: Number(testForm.maxScore) || 720,
        schoolId,
        teacherId,
      };
      const url = editTestId ? `${API}/api/neet-prep/mock-tests/${editTestId}` : `${API}/api/neet-prep/mock-tests`;
      const res = await fetch(url, {
        method: editTestId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setShowTestModal(false);
        fetchTests();
        Swal.fire({
          icon: "success",
          title: "Mock Test Saved",
          text: `Mock test "${testForm.title}" has been successfully scheduled!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({ icon: "error", title: "Error", text: data.error || "Failed to save test" });
      }
    } catch (e) {
      Swal.fire({ icon: "error", title: "Network Error", text: "Failed to connect to database." });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTest = async (id: string, name: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete mock test "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API}/api/neet-prep/mock-tests/${id}`, { method: "DELETE" });
          const data = await res.json();
          if (data.success) {
            fetchTests();
            Swal.fire("Deleted!", `Mock test "${name}" has been deleted.`, "success");
          } else {
            Swal.fire("Error!", data.error || "Failed to delete test.", "error");
          }
        } catch (e) {
          Swal.fire("Error!", "Network error occurred.", "error");
        }
      }
    });
  };

  return (
    <PortalLayout title="NEET Preparation" subtitle="Manage NEET syllabus, mock tests & student performance analytics">

      {/* ── KPI Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Chapters Covered", value: completedCount, total: topics.length, icon: "📖", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
          { label: "In Progress", value: inProgressCount, total: null, icon: "⚡", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
          { label: "Avg Class Score", value: `${avgClassScore}%`, total: null, icon: "📊", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
          { label: "Mock Tests Done", value: tests.length, total: null, icon: "📝", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/20" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <div className={`w-9 h-9 ${kpi.bg} rounded-xl flex items-center justify-center text-lg mb-3`}>{kpi.icon}</div>
            <div className={`text-2xl font-black ${kpi.color}`}>
              {kpi.value}
              {kpi.total !== null && <span className="text-slate-400 text-sm font-normal">/{kpi.total}</span>}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* ── Progress Bar ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">🎯 NEET Syllabus Completion</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Track subject-wise preparation progress</p>
          </div>
          <span className="text-sm font-black text-emerald-500">{topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0}%</span>
        </div>
        <div className="flex gap-2 mb-3">
          {["Biology", "Chemistry", "Physics"].map((sub) => {
            const topicsForSub = topics.filter((t) => t.subject === sub);
            const done = topicsForSub.filter((t) => t.status === "Completed").length;
            const pct = topicsForSub.length > 0 ? Math.round((done / topicsForSub.length) * 100) : 0;
            return (
              <div key={sub} className="flex-1">
                <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  <span>{sub}</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${sub === "Biology" ? "bg-emerald-500" : sub === "Chemistry" ? "bg-pink-500" : "bg-blue-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 mb-5 w-fit">
        {([
          { key: "syllabus", label: "📚 Syllabus Tracker" },
          { key: "tests", label: "📝 Mock Tests" },
          { key: "analytics", label: "📊 Analytics" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab.key
              ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Syllabus Tab ──────────────────────────────────────── */}
      {activeTab === "syllabus" && (
        <>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white focus:outline-none focus:border-amber-500"
              >
                {["All", "Biology", "Chemistry", "Physics"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white focus:outline-none focus:border-amber-500"
              >
                {["All", "Completed", "In Progress", "Pending"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="flex-1" />
              <button
                onClick={handleOpenAddChapter}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all shadow-md whitespace-nowrap"
              >
                + Add Chapter
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" /></div>
          ) : filteredTopics.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">No chapters tracked yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTopics.map((topic) => {
                const topicScore = topic.attempted > 0 ? Math.round((topic.correct / topic.attempted) * 100) : 0;
                return (
                  <div key={topic.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${subjectColor[topic.subject] || "bg-slate-100 text-slate-600"}`}>
                        {topic.subject}
                      </span>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border ${statusColor[topic.status] || ""}`}>
                        {topic.status === "Completed" ? "✓ " : topic.status === "In Progress" ? "● " : "○ "}
                        {topic.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1 group-hover:text-red-500 transition-colors">{topic.chapter}</h4>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${difficultyColor[topic.difficulty] || "bg-slate-100"}`}>{topic.difficulty}</span>
                      <span className="text-[10px] text-slate-400">{topic.totalQuestions} questions</span>
                    </div>
                    {topic.attempted > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Class Avg Score</span>
                          <span className="font-bold text-slate-600 dark:text-slate-300">{topicScore}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${topicScore >= 80 ? "bg-emerald-500" : topicScore >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${topicScore}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3">
                      <span className="text-[10px] text-slate-400">Last Session: {new Date(topic.updatedAt).toLocaleDateString()}</span>
                      <div className="flex gap-1">
                        <button onClick={() => handleOpenEditChapter(topic)} className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border border-amber-500/20 rounded font-bold">Edit</button>
                        <button onClick={() => handleDeleteChapter(topic.id, topic.chapter)} className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-700 hover:bg-red-500/20 border border-red-500/20 rounded font-bold">Delete</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Mock Tests Tab ────────────────────────────────────── */}
      {activeTab === "tests" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-700 dark:text-white">📝 All Mock Tests</h3>
            <button onClick={handleOpenAddTest} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all shadow-md">
              + Schedule Test
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" /></div>
          ) : tests.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">No mock tests scheduled yet.</div>
          ) : (
            tests.map((test) => (
              <div key={test.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">📝</span>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">{test.title}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${subjectColor[test.subject] || "bg-slate-100 text-slate-600"}`}>
                        {test.subject}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-[10px] text-slate-400">
                      <span>📅 {test.examDate}</span>
                      <span>⏱ {test.duration}</span>
                      <span>👥 {test.totalStudents} students</span>
                    </div>
                  </div>
                  <div className="flex gap-5 items-center">
                    <div className="text-center">
                      <div className="text-lg font-black text-amber-500">{test.avgScore}/{test.maxScore}</div>
                      <div className="text-[10px] text-slate-400">Avg Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-black text-emerald-500">{test.topScore}/{test.maxScore}</div>
                      <div className="text-[10px] text-slate-400">Top Score</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenEditTest(test)} className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-lg font-bold text-[10px] transition-all">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteTest(test.id, test.title)} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/20 rounded-lg font-bold text-[10px] transition-all">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Analytics Tab ─────────────────────────────────────── */}
      {activeTab === "analytics" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4">📊 Subject-wise Avg Score</h4>
              {["Biology", "Chemistry", "Physics"].map((sub) => {
                const subTopics = topics.filter((t) => t.subject === sub && t.attempted > 0);
                const subAttempted = subTopics.reduce((a, t) => a + t.attempted, 0);
                const subCorrect = subTopics.reduce((a, t) => a + t.correct, 0);
                const avg = subAttempted > 0 ? Math.round((subCorrect / subAttempted) * 100) : 0;
                return (
                  <div key={sub} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{sub}</span>
                      <span className="font-black text-slate-800 dark:text-white">{avg}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${sub === "Biology" ? "bg-emerald-500" : sub === "Chemistry" ? "bg-pink-500" : "bg-blue-500"}`}
                        style={{ width: `${avg}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4">🏆 Top Mock Performers</h4>
              <div className="space-y-3">
                {[
                  { name: "Priya Sundaram", score: 695, rank: 1 },
                  { name: "Ravi Shankar", score: 680, rank: 2 },
                  { name: "Divya Murugan", score: 642, rank: 3 },
                ].map((s) => (
                  <div key={s.rank} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px]">{s.rank}</span>
                    <span className="flex-1 text-xs font-semibold text-slate-700 dark:text-slate-300">{s.name}</span>
                    <span className="text-xs font-bold text-emerald-500">{s.score}/720</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Chapter Add/Edit Modal ────────────────────────────── */}
      {showChapterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">{editChapterId ? "✏️ Edit NEET Chapter" : "📖 Add NEET Chapter"}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Track a chapter in the NEET syllabus</p>
              </div>
              <button onClick={() => setShowChapterModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">✕ Close</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Subject *</label>
                <select value={chapterForm.subject} onChange={(e) => setChapterForm({ ...chapterForm, subject: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-red-500">
                  <option>Biology</option>
                  <option>Chemistry</option>
                  <option>Physics</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Chapter Name *</label>
                <input value={chapterForm.chapter} onChange={(e) => setChapterForm({ ...chapterForm, chapter: e.target.value })} type="text" placeholder="e.g. Genetics & Evolution" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Difficulty</label>
                  <select value={chapterForm.difficulty} onChange={(e) => setChapterForm({ ...chapterForm, difficulty: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-red-500">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Total Questions</label>
                  <input value={chapterForm.totalQuestions} onChange={(e) => setChapterForm({ ...chapterForm, totalQuestions: e.target.value })} type="number" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Attempted</label>
                  <input value={chapterForm.attempted} onChange={(e) => setChapterForm({ ...chapterForm, attempted: e.target.value })} type="number" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Correct</label>
                  <input value={chapterForm.correct} onChange={(e) => setChapterForm({ ...chapterForm, correct: e.target.value })} type="number" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Status</label>
                <select value={chapterForm.status} onChange={(e) => setChapterForm({ ...chapterForm, status: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none">
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
              <button onClick={handleSaveChapter} disabled={saving} className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-colors shadow-md disabled:opacity-60">
                {saving ? "Saving..." : editChapterId ? "Save Changes" : "🧬 Add Chapter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Test Add/Edit Modal ───────────────────────────────── */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">{editTestId ? "✏️ Edit Mock Test" : "📝 Schedule Mock Test"}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Mock exam configuration for NEET</p>
              </div>
              <button onClick={() => setShowTestModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">✕ Close</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Test Title *</label>
                <input value={testForm.title} onChange={(e) => setForm({ ...testForm, title: e.target.value })} type="text" placeholder="e.g. NEET Grand Mock #5" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Subject</label>
                  <select value={testForm.subject} onChange={(e) => setForm({ ...testForm, subject: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none">
                    <option>Full Syllabus</option>
                    <option>Biology</option>
                    <option>Chemistry</option>
                    <option>Physics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Date</label>
                  <input value={testForm.examDate} onChange={(e) => setForm({ ...testForm, examDate: e.target.value })} type="text" placeholder="e.g. 2025-07-15" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Duration</label>
                  <input value={testForm.duration} onChange={(e) => setForm({ ...testForm, duration: e.target.value })} type="text" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Students Count</label>
                  <input value={testForm.totalStudents} onChange={(e) => setForm({ ...testForm, totalStudents: e.target.value })} type="number" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Avg Score</label>
                  <input value={testForm.avgScore} onChange={(e) => setForm({ ...testForm, avgScore: e.target.value })} type="number" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Top Score</label>
                  <input value={testForm.topScore} onChange={(e) => setForm({ ...testForm, topScore: e.target.value })} type="number" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1 font-semibold">Max Score</label>
                  <input value={testForm.maxScore} onChange={(e) => setForm({ ...testForm, maxScore: e.target.value })} type="number" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white" />
                </div>
              </div>
              <button onClick={handleSaveTest} disabled={saving} className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-colors shadow-md disabled:opacity-60">
                {saving ? "Saving..." : editTestId ? "Save Changes" : "📝 Schedule Test"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );

  function setForm(val: any) {
    setTestForm(val);
  }
}
