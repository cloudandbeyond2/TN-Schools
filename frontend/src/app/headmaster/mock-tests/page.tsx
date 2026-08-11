"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { apiFetch } from "@/lib/api";
import {
  FileText, Plus, Trash2, CheckCircle, RefreshCw,
  Sparkles, Layers, ChevronRight, ChevronDown, BookOpen, Clock,
  Target, GraduationCap, LayoutList, Share2, Award, Calendar, Search
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

export default function HeadmasterMockTestsPage() {
  const { lang } = usePortalLanguage();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [grade, setGrade] = useState("Grade 10");
  const [difficulty, setDifficulty] = useState("Medium");
  const [duration, setDuration] = useState("180");

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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"repository" | "create">("repository");
  const [searchQuery, setSearchQuery] = useState("");
  const [schools, setSchools] = useState<any[]>([]);

  // Results tracking states
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
      setProfile({ schoolId: sessionSchoolId });

      // Fetch existing tests
      const res = await apiFetch(`/api/mock-tests?role=HEADMASTER&schoolId=${sessionSchoolId}`);
      const data = await res.json();
      if (data.success) {
        setExistingTests(data.data);
      }

      // Fetch schools list
      const schoolsRes = await apiFetch(`/api/schools`);
      const schoolsData = await schoolsRes.json();
      if (schoolsData.success) {
        setSchools(schoolsData.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResults = async (testId: string, testTitle: string) => {
    try {
      setLoadingResults(true);
      setCurrentTestName(testTitle);
      setIsResultsModalOpen(true);
      setExpandedSubmissionId(null);

      const res = await apiFetch(`/api/mock-tests/${testId}/submissions`);
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
        cancelButtonColor: "#3b82f6",
        confirmButtonText: "Yes, delete it!"
      });

      if (confirm.isConfirmed) {
        const res = await apiFetch(`/api/mock-tests/${id}`, { method: "DELETE" });
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
      title: 'Assign Mock Test',
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <input id="swal-class" class="w-full border rounded-lg p-2" value="${currentGrade}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Section (Leave blank for all)</label>
            <input id="swal-section" class="w-full border rounded-lg p-2" placeholder="e.g. A">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input id="swal-date" type="datetime-local" class="w-full border rounded-lg p-2">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
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
        const activeSchoolId = profile?.schoolId || (session?.user as any)?.schoolId;
        const res = await apiFetch(`/api/mock-tests/${id}/assign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            schoolId: activeSchoolId,
            class: formValues.class,
            section: formValues.section ? formValues.section.trim() : null,
            dueDate: formValues.dueDate && formValues.dueDate.trim() !== "" ? formValues.dueDate : null
          })
        });
        const data = await res.json();
        if (data.success) {
          Swal.fire("Assigned!", "The test is now live for students.", "success");
          fetchProfileAndExistingTests();
        } else {
          Swal.fire("Error", data.error || "Assignment failed.", "error");
        }
      } catch (err) {
        Swal.fire("Error", "Assignment failed due to server error.", "error");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeSchoolId = profile?.schoolId || (session?.user as any)?.schoolId;
    if (!activeSchoolId) return Swal.fire("Error", "School ID not found.", "error");

    setIsSubmitting(true);
    try {
      const totalMarks = questions.reduce((acc, q) => acc + q.marks, 0);

      const res = await apiFetch(`/api/mock-tests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          grade,
          subject,
          duration,
          totalMarks,
          createdByRole: "HEADMASTER",
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
      title={lang === "தமிழ்" ? "மாதிரி தேர்வுகள்" : "Mock Tests Hub"}
      subtitle={lang === "தமிழ்" ? "பள்ளி அளவிலான மாதிரி தேர்வுகளை நிர்வகிக்கவும்" : "Manage and deploy standard mock exams across your school"}
      accentColor="#3b82f6"
    >
      <div className="w-full mb-10">
        {/* Slim Header Banner with standard gap */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 sm:py-6 sm:px-8 mb-6 shadow-md">
          <div className="absolute top-1/2 -translate-y-1/2 right-12 opacity-20 pointer-events-none hidden sm:block">
            <GraduationCap className="w-24 h-24 text-white" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-2xl">
              <span 
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider mb-2 border border-white/30"
                style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
              >
                <Sparkles className="w-3 h-3" /> {lang === "தமிழ்" ? "மதிப்பீட்டு மையம்" : "Assessment Center"}
              </span>
              <h1 
                className="text-xl sm:text-2xl font-black mb-1 leading-tight"
                style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
              >
                {lang === "தமிழ்" ? "பள்ளி மாதிரி தேர்வுகள்" : "School Mock Exams"}
              </h1>
              <p 
                className="text-[11px] sm:text-xs opacity-90 leading-relaxed"
                style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
              >
                {lang === "தமிழ்" ? "விரிவான கொள்குறி மதிப்பீடுகளை உருவாக்கவும், கேள்விகளை தானாக உருவாக்க AI-ஐப் பயன்படுத்தவும்." : "Create rich objective assessments, leverage AI to auto-generate questions, and track real-time analytics across all classes in your institution."}
              </p>
            </div>
            <div className="flex items-center shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("create")}
                className="px-4 py-2 bg-white hover:bg-blue-50 text-blue-700 transition-all rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" /> {lang === "தமிழ்" ? "புதிய மதிப்பீடு" : "New Assessment"}
              </button>
            </div>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-black text-gray-800 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" /> {lang === "தமிழ்" ? "தேர்வு களஞ்சியம்" : "Test Repository"}
            </h2>
            <div className="relative w-full sm:w-72 md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              <input
                type="text"
                placeholder={lang === "தமிழ்" ? "தேடவும்..." : "Search tests by title or subject..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-11 pr-4 py-2 sm:py-3 bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-xl sm:rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 transition-shadow text-xs sm:text-sm font-medium focus:outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48 sm:h-64">
              <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 animate-spin" />
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-12 sm:py-20 bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              <Target className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">No mock tests found</h3>
              <p className="text-gray-500 text-sm">Create your first assessment to start evaluating students.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredTests.map((test) => (
                <div key={test.id} className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 relative overflow-hidden flex flex-col h-full min-h-[220px] sm:min-h-[250px]">

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <BookOpen className="w-4 h-4" />
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{test.subject}</span>
                        <span className="text-[10px] font-bold text-blue-500">{test.grade}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 line-clamp-1">{test.title}</h3>
                  {test.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-4 flex-grow">{test.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 mt-auto">
                    <span className="inline-flex items-center gap-1 bg-gray-50 dark:bg-gray-900/40 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
                      {test.duration} mins
                    </span>
                    <span className="inline-flex items-center gap-1 bg-gray-50 dark:bg-gray-900/40 px-2 py-1 rounded-lg text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                      <Award className="w-3 h-3 text-gray-400" />
                      {test.totalMarks} Marks
                    </span>
                    <span className="inline-flex items-center gap-1 bg-gray-50 dark:bg-gray-900/40 px-2 py-1 rounded-lg text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                      <FileText className="w-3 h-3 text-gray-400" />
                      {test._count?.questions || 0} Qs
                    </span>
                  </div>

                  <div className="flex gap-1.5 sm:gap-2">
                    <button
                      onClick={() => handleAssignTest(test.id, test.grade)}
                      className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-bold text-[10px] sm:text-xs py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-1 sm:gap-1.5"
                    >
                      <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Assign
                    </button>
                    <button
                      onClick={() => handleViewResults(test.id, test.title)}
                      className="flex-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 font-bold text-[10px] sm:text-xs py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-colors flex items-center justify-center gap-1 sm:gap-1.5"
                    >
                      <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Results
                    </button>
                    {test.schoolId !== null && (
                      <button
                        onClick={() => handleDeleteTest(test.id)}
                        className="px-2 sm:px-3 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg sm:rounded-xl transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 md:p-10 shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">

              <button
                onClick={() => setActiveTab("repository")}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              >
                ✕
              </button>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 mt-6 sm:mt-8 gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Mock Exam Builder
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">Design your assessment schema and rubrics.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAIGenerateMock}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-black rounded-2xl px-6 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 w-full sm:w-auto mt-4 md:mt-0"
                >
                  {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  Generate with AI <ChevronDown className="w-4 h-4 ml-1" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Meta Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-gray-50/50 dark:bg-gray-800/30 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-800">
                  <div className="col-span-1 sm:col-span-2 md:col-span-3 space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">Assessment Title</label>
                    <input
                      type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. SSLC State Model Paper I"
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2 md:col-span-3 space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">Description (Optional)</label>
                    <textarea
                      value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide instructions or scope of the assessment..."
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none h-20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Target Grade</label>
                    <select
                      value={grade} onChange={(e) => setGrade(e.target.value)}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {Array.from({ length: 7 }, (_, i) => 6 + i).map(n => <option key={n}>Grade {n}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Subject</label>
                    <select
                      value={subject} onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option>Mathematics</option><option>Science</option><option>Social Science</option>
                      <option>Tamil</option><option>English</option><option>Physics</option>
                      <option>Chemistry</option><option>Biology</option><option>Computer Science</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Duration (Mins)</label>
                    <input
                      type="number" required min="1" value={duration} onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Questions Builder */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center px-2">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Question Items ({questions.length})</h3>
                    <button
                      type="button" onClick={handleAddQuestion}
                      className="text-sm text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-4 py-2 rounded-xl transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Question
                    </button>
                  </div>

                  <div className="space-y-6">
                    {questions.map((q, idx) => (
                      <div key={idx} className="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm relative group">

                        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-black text-xs sm:text-sm text-gray-500">
                          {idx + 1}
                        </div>

                        <div className="pl-9 sm:pl-12">
                          <div className="flex flex-col gap-3 mb-4">
                            <div className="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700/60 pb-3 flex-wrap">
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Question #{idx + 1}</span>
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 w-full sm:w-auto justify-end sm:shrink-0">
                                <select
                                  value={q.type} onChange={(e) => handleQuestionFieldChange(idx, "type", e.target.value as any)}
                                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold outline-none"
                                >
                                  <option value="mcq">Multiple Choice</option>
                                  <option value="short">Short Answer</option>
                                </select>
                                <div className="flex items-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-2 sm:px-3 py-1 sm:py-1.5">
                                  <span className="text-[11px] sm:text-xs font-bold text-gray-400 mr-1 sm:mr-2">Marks</span>
                                  <input
                                    type="number" min="1" required value={q.marks} onChange={(e) => handleQuestionFieldChange(idx, "marks", parseInt(e.target.value) || 1)}
                                    className="w-8 sm:w-10 bg-transparent border-none text-[11px] sm:text-xs font-bold text-center focus:ring-0 outline-none p-0"
                                  />
                                </div>
                                <button
                                  type="button" onClick={() => handleRemoveQuestion(idx)}
                                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg sm:rounded-xl transition-colors shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            </div>

                            <textarea
                              required
                              rows={2}
                              value={q.text}
                              onChange={(e) => handleQuestionFieldChange(idx, "text", e.target.value)}
                              placeholder="Enter your question statement here..."
                              className="w-full bg-slate-50 dark:bg-slate-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-base font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none resize-y min-h-[70px] leading-relaxed"
                            />
                          </div>

                          {q.type === "mcq" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                              {q.options.map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${q.answer === String.fromCharCode(65 + optIdx) ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                    {String.fromCharCode(65 + optIdx)}
                                  </div>
                                  <input
                                    type="text" required value={opt} onChange={(e) => handleOptionChange(idx, optIdx, e.target.value)}
                                    placeholder={`Option content`}
                                    className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
                              className="w-full bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-green-500 outline-none placeholder-green-300 dark:placeholder-green-800"
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
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-t-3xl sm:rounded-[2rem] p-5 sm:p-8 md:p-10 shadow-2xl w-full max-w-5xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto relative animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
              <button
                onClick={() => setIsResultsModalOpen(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>

              <div className="flex items-center gap-3 mb-4 sm:mb-6 mt-2 sm:mt-0">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500 shrink-0" />
                <div>
                  <h2 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-wider line-clamp-1">{currentTestName} Submissions</h2>
                  <p className="text-xs text-gray-500 font-medium">Real-time student performance leaderboard</p>
                </div>
              </div>

              {loadingResults ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
                  <p className="text-xs text-gray-500">Loading student scores...</p>
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
                      <div key={sub.id} className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-800">
                        <div 
                          onClick={() => setExpandedSubmissionId(isExpanded ? null : sub.id)}
                          className="p-3 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
                              {sub.student.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">{sub.student.user.name}</h4>
                              <p className="text-[10px] text-gray-400 font-semibold">
                                Class {sub.assignment.class} - Section {sub.assignment.section || 'All'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 sm:gap-6 ml-11 sm:ml-0">
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Score</span>
                              <span className="text-sm sm:text-base font-black text-gray-900 dark:text-white">
                                {sub.score} / {totalMarks}
                              </span>
                            </div>
                            
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Accuracy</span>
                              <span className={`text-xs font-black ${percent >= 70 ? 'text-green-500' : percent >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                                {percent}%
                              </span>
                            </div>

                            <button className="text-gray-400 ml-auto sm:ml-0">
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-5 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 space-y-4">
                            <div className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-2">Answer Sheet Details</div>
                            <div className="grid gap-4">
                              {sub.assignment.mockTest.questions.map((q: any, idx: number) => {
                                const studentAnswer = sub.answers[q.id] || "No Answer";
                                const isCorrect = studentAnswer.trim().toUpperCase() === q.answer.trim().toUpperCase();

                                return (
                                  <div key={q.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                      <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                        Question {idx + 1}: {q.text}
                                      </div>
                                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${isCorrect ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {isCorrect ? "Correct" : "Incorrect"}
                                      </span>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-2 text-xs">
                                      <div className="bg-gray-50 dark:bg-gray-950 p-2.5 rounded-lg">
                                        <span className="text-[10px] text-gray-400 block font-bold">Student's Answer</span>
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{studentAnswer}</span>
                                      </div>
                                      <div className="bg-green-50/50 dark:bg-green-950/10 p-2.5 rounded-lg border border-green-100/10">
                                        <span className="text-[10px] text-green-600 dark:text-green-400 block font-bold">Correct Key Answer</span>
                                        <span className="font-semibold text-green-700 dark:text-green-400">{q.answer}</span>
                                      </div>
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
