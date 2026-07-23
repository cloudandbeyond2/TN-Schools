"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import {
  FileText, Plus, Trash2, CheckCircle, RefreshCw,
  Sparkles, Layers, ChevronRight, ChevronDown, BookOpen, Clock,
  Target, GraduationCap, LayoutList, Share2, Award, Calendar, Search, Eye, BarChart2, XCircle
} from "lucide-react";
import Swal from "sweetalert2";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

interface QuestionInput {
  type: "mcq" | "short";
  text: string;
  options: string[];
  answer: string;
  marks: number;
}

export default function TeacherMockTestsPage() {
  const { lang } = usePortalLanguage();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [grade, setGrade] = useState("Grade 10");
  const [difficulty, setDifficulty] = useState("Medium");
  const [duration, setDuration] = useState("60");

  const [questions, setQuestions] = useState<QuestionInput[]>([
    {
      type: "mcq",
      text: "",
      options: ["", "", "", ""],
      answer: "A",
      marks: 1
    }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [existingTests, setExistingTests] = useState<any[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"repository" | "create">("repository");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedTestResults, setSelectedTestResults] = useState<any[]>([]);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [currentTestName, setCurrentTestName] = useState("");
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (status === "loading") return;
    fetchProfileAndExistingTests();
  }, [session, status]);

  const fetchProfileAndExistingTests = async () => {
    const sessionSchoolId = (session?.user as any)?.schoolId;
    if (!sessionSchoolId) return;

    try {
      setLoading(true);
      setProfile({ schoolId: sessionSchoolId, userId: (session?.user as any)?.id });

      const res = await fetch(`${API_URL}/api/mock-tests?role=TEACHER&schoolId=${sessionSchoolId}`);
      const data = await res.json();
      if (data.success) {
        setExistingTests(data.data);
      }

      const classRes = await fetch(`${API_URL}/api/classes?schoolId=${sessionSchoolId}&teacherId=${(session?.user as any)?.id}`);
      const classData = await classRes.json();
      if (classData.success) {
        setTeacherClasses(classData.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uniqueGrades = Array.from(new Set(teacherClasses.map((c) => c.className)));
  const uniqueSubjects = Array.from(new Set(teacherClasses.map((c) => c.subject)));

  const handleOpenCreate = () => {
    setTitle("");
    setDescription("");
    setQuestions([{ type: "mcq", text: "", options: ["", "", "", ""], answer: "A", marks: 1 }]);
    setDuration("60");
    if (uniqueGrades.length > 0) setGrade(uniqueGrades[0]);
    else setGrade("Grade 10");

    if (uniqueSubjects.length > 0) setSubject(uniqueSubjects[0]);
    else setSubject("Mathematics");

    setActiveTab("create");
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { type: "mcq", text: "", options: ["", "", "", ""], answer: "A", marks: 1 }
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionFieldChange = (idx: number, field: keyof QuestionInput, val: any) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: val } : q))
    );
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i === qIdx) {
          const newOpts = [...q.options];
          newOpts[optIdx] = val;
          return { ...q, options: newOpts };
        }
        return q;
      })
    );
  };

  const handleAIGenerateMock = async () => {
    if (!title) {
      Swal.fire("Error", "Please enter a test topic / title first.", "error");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade,
          subject,
          topic: title,
          difficulty,
          mcqCount: 5,
          shortCount: 0,
          longCount: 0
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const mapped = data.data.map((q: any) => ({
          type: q.type === "mcq" ? "mcq" : "short",
          text: q.text,
          options: q.options || ["", "", "", ""],
          answer: q.answer,
          marks: q.marks || 1
        }));
        setQuestions(mapped);
        Swal.fire("AI Magic!", "Mock questions generated successfully.", "success");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Failed", "AI Mock test generation failed.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteTest = async (id: string) => {
    try {
      const confirm = await Swal.fire({
        title: "Delete Mock Exam?",
        text: "This will remove the test and all student assignments.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#10b981", // Teacher green
        confirmButtonText: "Yes, delete it!"
      });

      if (confirm.isConfirmed) {
        const res = await fetch(`${API_URL}/api/mock-tests/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          Swal.fire("Deleted!", "Mock exam removed.", "success");
          fetchProfileAndExistingTests();
        } else {
          Swal.fire("Error", data.error || "Failed to delete.", "error");
        }
      }
    } catch (err) {
      Swal.fire("Error", "An unexpected error occurred while deleting.", "error");
    }
  };

  const handleAssignTest = async (id: string, currentGrade: string) => {
    const { value: formValues } = await Swal.fire({
      title: 'Assign Mock Test to Class',
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <input id="swal-class" class="w-full border rounded-lg p-2 focus:ring-emerald-500" value="${currentGrade}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Section (Leave blank for all)</label>
            <input id="swal-section" class="w-full border rounded-lg p-2 focus:ring-emerald-500" placeholder="e.g. A">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input id="swal-date" type="datetime-local" class="w-full border rounded-lg p-2 focus:ring-emerald-500">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Assign Now',
      preConfirm: () => {
        return {
          class: (document.getElementById('swal-class') as HTMLInputElement).value,
          section: (document.getElementById('swal-section') as HTMLInputElement).value,
          dueDate: (document.getElementById('swal-date') as HTMLInputElement).value
        }
      }
    });

    if (formValues) {
      try {
        const res = await fetch(`${API_URL}/api/mock-tests/${id}/assign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            schoolId: profile?.schoolId,
            class: formValues.class,
            section: formValues.section || null,
            dueDate: formValues.dueDate
          })
        });
        const data = await res.json();
        if (data.success) {
          Swal.fire("Assigned!", "The test is now live for your students.", "success");
          fetchProfileAndExistingTests();
        }
      } catch (err) {
        Swal.fire("Error", "Assignment failed.", "error");
      }
    }
  };

  const handleViewResults = async (testId: string, testTitle: string) => {
    try {
      setLoadingResults(true);
      setCurrentTestName(testTitle);
      setIsResultsModalOpen(true);
      setExpandedSubmissionId(null);

      const res = await fetch(`${API_URL}/api/mock-tests/${testId}/submissions`);
      const data = await res.json();
      if (data.success) {
        setSelectedTestResults(data.data);
      } else {
        Swal.fire("Error", "Failed to fetch results", "error");
        setIsResultsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch results", "error");
      setIsResultsModalOpen(false);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeSchoolId = profile?.schoolId || (session?.user as any)?.schoolId;
    if (!activeSchoolId) return Swal.fire("Error", "School ID not found.", "error");

    setIsSubmitting(true);
    try {
      const totalMarks = questions.reduce((acc, q) => acc + q.marks, 0);

      const res = await fetch(`${API_URL}/api/mock-tests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          grade,
          subject,
          duration,
          totalMarks,
          createdByRole: "TEACHER",
          createdById: (session?.user as any)?.id || "admin",
          schoolId: activeSchoolId,
          questions
        })
      });

      const data = await res.json();
      if (data.success) {
        Swal.fire("Created!", "Mock Test created successfully.", "success");
        setActiveTab("repository");
        fetchProfileAndExistingTests();
        setTitle(""); setDescription("");
        setQuestions([{ type: "mcq", text: "", options: ["", "", "", ""], answer: "A", marks: 1 }]);
      } else {
        Swal.fire("Error", data.error || "Failed to create.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "An unexpected error occurred.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTests = existingTests.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "ஆசிரியர் மாதிரி தேர்வுகள்" : "Teacher Mock Tests"}
      subtitle={lang === "தமிழ்" ? "உங்கள் வகுப்பிற்கான தேர்வுகளை உருவாக்கவும்" : "Create and assign custom mock exams for your classes"}
      accentColor="#10b981"
    >
      <div className="w-full max-w-7xl mx-auto mb-10">

        {/* Glassmorphism Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 p-8 md:p-12 mb-8 shadow-2xl shadow-emerald-500/20 text-white">
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
            <Target className="w-64 h-64 text-white" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4 border border-white/30">
              <Sparkles className="w-3.5 h-3.5" /> Class Assessments
            </span>
            <p className="text-3xl md:text-5xl font-black mb-4 leading-tight !text-white">Empower Your Students</p>
            <p className="text-emerald-100 !text-white text-lg mb-8 leading-relaxed">
              Design tailored objective tests, use AI to build questions instantly, and track individual student performance with ease.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleOpenCreate}
                className="px-6 py-3 bg-white text-emerald-700 hover:bg-emerald-50 transition-all rounded-2xl font-bold text-sm shadow-xl flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> New Assessment
              </button>
              {/* <button
                onClick={() => setActiveTab("repository")}
                className="!text-white px-6 py-3 bg-emerald-500/30 hover:bg-emerald-500/40 backdrop-blur-md transition-all rounded-2xl font-bold text-sm border border-white/20 flex items-center gap-2"
              >
                <LayoutList className="w-5 h-5" /> View Repository
              </button> */}
            </div>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-emerald-500" /> Test Repository
            </h2>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tests by title or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 transition-shadow text-sm font-medium"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">No mock tests found</h3>
              <p className="text-gray-500">Create your first assessment to start evaluating your class.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((test) => (
                <div key={test.id} className="group bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 relative overflow-hidden flex flex-col h-full">

                  {/* Badges */}
                  {test.schoolId === null ? (
                    <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-sm">
                      State Board
                    </div>
                  ) : test.createdById !== profile?.userId ? (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-sm">
                      School Level
                    </div>
                  ) : (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-sm">
                      My Test
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <BookOpen className="w-5 h-5" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{test.subject}</p>
                        <p className="text-xs font-medium text-emerald-500">{test.grade}</p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{test.title}</h3>
                  {test.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-grow">{test.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 mb-6 mt-auto">
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 flex flex-col justify-center items-center">
                      <Clock className="w-4 h-4 text-gray-400 mb-1" />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{test.duration} mins</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 flex flex-col justify-center items-center">
                      <Award className="w-4 h-4 text-gray-400 mb-1" />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{test.totalMarks} Marks</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 flex flex-col justify-center items-center col-span-2">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{test._count?.questions || 0} Questions</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAssignTest(test.id, test.grade)}
                      className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-bold text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" /> Assign
                    </button>
                    <button
                      onClick={() => handleViewResults(test.id, test.title)}
                      className="flex-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 font-bold text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <BarChart2 className="w-4 h-4" /> Results
                    </button>
                    {test.createdById === profile?.userId && (
                      <button
                        onClick={() => handleDeleteTest(test.id)}
                        className="px-4 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Modal Overlay for Creating Mock Exam */}
        {activeTab === "create" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] p-8 md:p-10 shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">

              <button
                onClick={() => setActiveTab("repository")}
                className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              >
                ✕
              </button>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 mt-8 gap-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <FileText className="w-6 h-6 text-emerald-500" />
                    Mock Exam Builder
                  </h2>
                  <p className="text-sm text-gray-500 mt-2 font-medium">Design your assessment schema and rubrics.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAIGenerateMock}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-black rounded-2xl px-6 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 w-full sm:w-auto mt-4 md:mt-0"
                >
                  {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  Generate with AI <ChevronDown className="w-4 h-4 ml-1" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Meta Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/50 dark:bg-gray-800/30 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Assessment Title</label>
                    <input
                      type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Unit Test 2: Algebra"
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Description (Optional)</label>
                    <textarea
                      value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide instructions or scope of the assessment..."
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all outline-none resize-none h-20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Target Grade</label>
                    <select
                      value={grade} onChange={(e) => setGrade(e.target.value)}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                    >
                      {uniqueGrades.length > 0 ? (
                        uniqueGrades.map(g => <option key={g} value={g}>{g}</option>)
                      ) : (
                        <>
                          <option>Grade 9</option>
                          <option>Grade 10</option>
                          <option>Grade 11</option>
                          <option>Grade 12</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Subject</label>
                    <select
                      value={subject} onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
                    >
                      {uniqueSubjects.length > 0 ? (
                        uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)
                      ) : (
                        <>
                          <option>Mathematics</option>
                          <option>Science</option>
                          <option>English</option>
                          <option>Social Science</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Duration (Mins)</label>
                    <input
                      type="number" required min="1" value={duration} onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Questions Builder */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center px-2">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Question Items ({questions.length})</h3>
                    <button
                      type="button" onClick={handleAddQuestion}
                      className="text-sm text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 px-4 py-2 rounded-xl transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Question
                    </button>
                  </div>

                  <div className="space-y-6">
                    {questions.map((q, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative group">

                        <div className="absolute top-6 left-6 w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-black text-gray-500">
                          {idx + 1}
                        </div>

                        <div className="pl-12">
                          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                            <div className="flex-1">
                              <input
                                type="text" required value={q.text} onChange={(e) => handleQuestionFieldChange(idx, "text", e.target.value)}
                                placeholder="Enter your question statement here..."
                                className="w-full bg-transparent border-none text-lg font-semibold placeholder-gray-300 dark:placeholder-gray-600 focus:ring-0 outline-none"
                              />
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <select
                                value={q.type} onChange={(e) => handleQuestionFieldChange(idx, "type", e.target.value as any)}
                                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                              >
                                <option value="mcq">Multiple Choice</option>
                                <option value="short">Short Answer</option>
                              </select>
                              <div className="flex items-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
                                <span className="text-xs font-bold text-gray-400 mr-2">Marks</span>
                                <input
                                  type="number" min="1" required value={q.marks} onChange={(e) => handleQuestionFieldChange(idx, "marks", parseInt(e.target.value) || 1)}
                                  className="w-10 bg-transparent border-none text-xs font-bold text-center focus:ring-0 outline-none p-0"
                                />
                              </div>
                              <button
                                type="button" onClick={() => handleRemoveQuestion(idx)}
                                className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {q.type === "mcq" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${q.answer === String.fromCharCode(65 + optIdx) ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                    {String.fromCharCode(65 + optIdx)}
                                  </div>
                                  <input
                                    type="text" required value={opt} onChange={(e) => handleOptionChange(idx, optIdx, e.target.value)}
                                    placeholder={`Option content`}
                                    className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Correct Answer Key</label>
                            <input
                              type="text" required value={q.answer} onChange={(e) => handleQuestionFieldChange(idx, "answer", e.target.value)}
                              placeholder={q.type === "mcq" ? "Type A, B, C, or D (Must match an option exactly for auto-grading)" : "Enter the expected short answer or keyword..."}
                              className="w-full bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none placeholder-emerald-300 dark:placeholder-emerald-800"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end">
                  <button
                    type="submit" disabled={isSubmitting || questions.length === 0}
                    className="w-full md:w-auto bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-2xl px-10 py-4 text-sm font-black tracking-wide transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    Publish Mock Test
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Results Modal */}
        {isResultsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] p-8 md:p-10 shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setIsResultsModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              >
                ✕
              </button>

              <div className="mb-8 mt-2">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                  <BarChart2 className="w-6 h-6 text-indigo-500" />
                  Submissions Dashboard
                </h2>
                <p className="text-sm text-gray-500 mt-2 font-medium">Viewing results for: <strong className="text-gray-800 dark:text-gray-200">{currentTestName}</strong></p>
              </div>

              {loadingResults ? (
                <div className="flex justify-center items-center h-40">
                  <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
              ) : selectedTestResults.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <p className="text-gray-500 font-medium">No students have submitted this test yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedTestResults.map((sub: any) => {
                    const totalMarks = sub.assignment.mockTest.totalMarks || 1;
                    const percent = Math.round(((sub.score || 0) / totalMarks) * 100);
                    const isExpanded = expandedSubmissionId === sub.id;

                    return (
                      <div key={sub.id} className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800">
                        {/* Header Row */}
                        <div
                          className="flex items-center justify-between p-4 md:p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          onClick={() => setExpandedSubmissionId(isExpanded ? null : sub.id)}
                        >
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{sub.student.user?.name || 'Unknown Student'}</h3>
                            <p className="text-sm text-gray-500">{sub.student.class} - {sub.student.section}</p>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{sub.score} / {totalMarks} Marks</p>
                              <p className="text-xs text-gray-500">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                            </div>
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-lg ${percent >= 80 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' :
                                percent >= 50 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' :
                                  'bg-red-100 text-red-600 dark:bg-red-900/30'
                              }`}>
                              {percent}%
                            </div>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        {/* Expanded Answers Detail */}
                        {isExpanded && (
                          <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                              <Eye className="w-4 h-4" /> Answers Breakdown
                            </h4>
                            <div className="space-y-4">
                              {sub.assignment.mockTest.questions.map((q: any, idx: number) => {
                                const studentAnswer = sub.answers[q.id] || "No Answer";
                                const isCorrect = studentAnswer.trim().toUpperCase() === q.answer.trim().toUpperCase();

                                return (
                                  <div key={q.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="flex gap-3 mb-2">
                                      <span className="font-bold text-gray-500">Q{idx + 1}.</span>
                                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{q.text}</p>
                                    </div>
                                    <div className="ml-8 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                                      <div className="flex items-start gap-2">
                                        <div className="mt-0.5">
                                          {isCorrect ? (
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                          ) : (
                                            <XCircle className="w-4 h-4 text-red-500" />
                                          )}
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500 mb-1">Student's Answer</p>
                                          <p className={`text-sm font-bold ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {studentAnswer}
                                          </p>
                                        </div>
                                      </div>
                                      {!isCorrect && (
                                        <div className="flex items-start gap-2">
                                          <div className="mt-0.5">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500 mb-1">Correct Answer</p>
                                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                              {q.answer}
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
