"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import {
  FileText, Plus, Trash2, CheckCircle, RefreshCw,
  Sparkles, Layers, ChevronRight, ChevronDown, BookOpen, Clock,
  Target, GraduationCap, LayoutList, Share2, Award, Calendar, Search, Globe
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

export default function SuperAdminMockTestsPage() {
  const { lang } = usePortalLanguage();
  const { data: session, status } = useSession();

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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (status === "loading") return;
    fetchExistingTests();
  }, [session, status]);

  const fetchExistingTests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/mock-tests?role=SUPER_ADMIN`);
      const data = await res.json();
      if (data.success) {
        setExistingTests(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
        title: "Delete State Mock Exam?",
        text: "This will remove the test from all schools across the state.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#8b5cf6", // Purple theme
        confirmButtonText: "Yes, delete it!"
      });

      if (confirm.isConfirmed) {
        const res = await fetch(`${API_URL}/api/mock-tests/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          Swal.fire("Deleted!", "Mock exam removed.", "success");
          fetchExistingTests();
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
      title: 'Global Assignment',
      html: `
        <div class="space-y-4 text-left">
          <p class="text-sm text-gray-500 mb-2">Assigning this test will make it available to all students in the selected class across the entire state.</p>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <input id="swal-class" class="w-full border rounded-lg p-2 focus:ring-purple-500" value="${currentGrade}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input id="swal-date" type="datetime-local" class="w-full border rounded-lg p-2 focus:ring-purple-500">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#8b5cf6',
      confirmButtonText: 'Assign Statewide',
      preConfirm: () => {
        return {
          class: (document.getElementById('swal-class') as HTMLInputElement).value,
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
            schoolId: null, // null means state-wide
            class: formValues.class,
            section: null,
            dueDate: formValues.dueDate
          })
        });
        const data = await res.json();
        if (data.success) {
          Swal.fire("Assigned!", "The test is now live across the state.", "success");
          fetchExistingTests();
        }
      } catch (err) {
        Swal.fire("Error", "Assignment failed.", "error");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
          createdByRole: "SUPER_ADMIN",
          createdById: (session?.user as any)?.id || "admin",
          schoolId: null, // State-wide test
          questions
        })
      });

      const data = await res.json();
      if (data.success) {
        Swal.fire("Created!", "State-Wide Mock Test created successfully.", "success");
        setActiveTab("repository");
        fetchExistingTests();
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
      title={lang === "தமிழ்" ? "மாநில மாதிரி தேர்வுகள்" : "State Mock Tests"}
      subtitle={lang === "தமிழ்" ? "மாநில அளவிலான தேர்வுகளை நிர்வகிக்கவும்" : "Manage and deploy standard mock exams across the state"}
      accentColor="#8b5cf6"
    >
      <div className="w-full mb-10">

        {/* Glassmorphism Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-900 p-8 md:p-12 mb-8 shadow-2xl shadow-violet-500/20 text-white">
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
            <Globe className="w-64 h-64 text-white" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4 border border-white/30">
              <Sparkles className="w-3.5 h-3.5" /> {lang === "தமிழ்" ? "மாநில மதிப்பீட்டு வாரியம்" : "State Assessment Board"}
            </span>
            <p className="text-3xl md:text-5xl font-black mb-4 leading-tight !text-white">
              {lang === "தமிழ்" ? "மாநில அளவிலான சிறப்பு" : "Statewide Excellence"}
            </p>
            <p className="text-violet-200 !text-white text-lg mb-8 leading-relaxed">
              {lang === "தமிழ்" ? "தரப்படுத்தப்பட்ட கொள்குறி தேர்வுகளை உருவாக்கவும், AI ஐ பயன்படுத்தி வினா வங்கிகளை விரிவுபடுத்தவும்." : "Create standardized objective tests, use AI to scale question banks, and instantly deploy assessments to all schools across the state."}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("create")}
                className="px-6 py-3 bg-white text-violet-800 hover:bg-violet-50 transition-all rounded-2xl font-bold text-sm shadow-xl flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> {lang === "தமிழ்" ? "புதிய மாநில மதிப்பீடு" : "New State Assessment"}
              </button>
              {/* <button 
                onClick={() => setActiveTab("repository")}
                className="px-6 py-3 bg-violet-500/30 hover:bg-violet-500/40 backdrop-blur-md transition-all rounded-2xl font-bold text-sm border border-white/20 flex items-center gap-2"
              >
                <LayoutList className="w-5 h-5" /> View Repository
              </button> */}
            </div>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-violet-500" /> {lang === "தமிழ்" ? "தேர்வு களஞ்சியம்" : "Test Repository"}
            </h2>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={lang === "தமிழ்" ? "தலைப்பு அல்லது பாடம் மூலம் தேடவும்..." : "Search tests by title or subject..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-violet-500 transition-shadow text-sm font-medium"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">No mock tests found</h3>
              <p className="text-gray-500">Create your first state-level assessment to start evaluating schools.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((test) => (
                <div key={test.id} className="group bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 relative overflow-hidden flex flex-col h-full">

                  {/* Badge */}
                  <div className="absolute top-0 right-0 bg-violet-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-sm">
                    State Board
                  </div>

                  <div className="flex items-start justify-between mb-4 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                        <BookOpen className="w-5 h-5" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{test.subject}</p>
                        <p className="text-xs font-medium text-violet-500">{test.grade}</p>
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
                      <Share2 className="w-4 h-4" /> Global Assign
                    </button>
                    <button
                      onClick={() => handleDeleteTest(test.id)}
                      className="px-4 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Overlay for Creating Mock Exam */}
        {activeTab === "create" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">

              {/* Gradient Banner Header */}
              <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Globe className="w-48 h-48 text-white" />
                </div>
                <div className="flex items-center gap-3.5 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      State Assessment Builder
                      <span className="text-[10px] bg-white/20 border border-white/30 text-white font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        v2.0 AI Powered
                      </span>
                    </h2>
                    <p className="text-xs text-violet-100 font-medium mt-0.5">
                      Design standardized state-wide examination schema, auto-generate AI items, and deploy rubrics.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 relative z-10 w-full md:w-auto justify-between md:justify-end">
                  <button
                    type="button"
                    onClick={handleAIGenerateMock}
                    disabled={isGenerating}
                    className="px-5 py-2.5 bg-white text-violet-700 hover:bg-violet-50 font-bold rounded-xl text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin text-violet-600" /> : <Sparkles className="w-4 h-4 text-violet-600" />}
                    <span>{isGenerating ? "Generating..." : "Auto-Generate with AI"}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("repository")}
                    className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm font-bold transition-all shrink-0 cursor-pointer"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Scrollable Form Body */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* Metadata Card Section */}
                  <div className="bg-slate-50 dark:bg-slate-950/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Target className="w-4 h-4 text-violet-500" />
                        1. Assessment Setup & Scope
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">All fields required for state deployment</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      <div className="md:col-span-8 space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Assessment Title *</label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. State Level Monthly Revision - October"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                        />
                      </div>

                      <div className="md:col-span-4 space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Duration (Minutes) *</label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            min="1"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-12 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">Mins</span>
                        </div>
                      </div>

                      <div className="md:col-span-12 space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description / Guidelines (Optional)</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Provide instructions, target learning outcomes, or syllabus scope..."
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all resize-none h-18"
                        />
                      </div>

                      <div className="md:col-span-6 space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Grade *</label>
                        <select
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                        >
                          {Array.from({ length: 7 }, (_, i) => 6 + i).map(n => <option key={n}>Grade {n}</option>)}
                        </select>
                      </div>

                      <div className="md:col-span-6 space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Subject Category *</label>
                        <select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                        >
                          <option>Mathematics</option><option>Science</option><option>Social Science</option>
                          <option>Tamil</option><option>English</option><option>Physics</option>
                          <option>Chemistry</option><option>Biology</option><option>Computer Science</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Questions Builder Section */}
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-violet-50/50 dark:bg-violet-950/20 p-4 rounded-2xl border border-violet-100 dark:border-violet-900/40">
                      <div>
                        <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <LayoutList className="w-4 h-4 text-violet-600" />
                          2. Examination Questions ({questions.length})
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Total Marks: <span className="font-bold text-violet-600 dark:text-violet-400">{questions.reduce((acc, q) => acc + (q.marks || 1), 0)} Marks</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Plus className="w-4 h-4" /> Add Question Item
                      </button>
                    </div>

                    <div className="space-y-5">
                      {questions.map((q, idx) => (
                        <div
                          key={idx}
                          className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative transition-all hover:border-violet-300 dark:hover:border-violet-800"
                        >
                          {/* Question Top Header Bar */}
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-violet-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                Question Item #{idx + 1}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Type Selector */}
                              <div className="flex items-center gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Type:</label>
                                <select
                                  value={q.type}
                                  onChange={(e) => handleQuestionFieldChange(idx, "type", e.target.value as any)}
                                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-violet-500"
                                >
                                  <option value="mcq">Multiple Choice (MCQ)</option>
                                  <option value="short">Short Answer</option>
                                </select>
                              </div>

                              {/* Marks Selector */}
                              <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1.5">Marks:</span>
                                <input
                                  type="number"
                                  min="1"
                                  required
                                  value={q.marks}
                                  onChange={(e) => handleQuestionFieldChange(idx, "marks", parseInt(e.target.value) || 1)}
                                  className="w-8 bg-transparent text-xs font-bold text-center text-slate-800 dark:text-white focus:outline-none p-0"
                                />
                              </div>

                              {/* Delete Item Button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestion(idx)}
                                className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                                title="Remove Question"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Question Statement Input */}
                          <div className="mb-4">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Question Statement *
                            </label>
                            <input
                              type="text"
                              required
                              value={q.text}
                              onChange={(e) => handleQuestionFieldChange(idx, "text", e.target.value)}
                              placeholder={`Enter question #${idx + 1} statement here...`}
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
                            />
                          </div>

                          {/* MCQ Options Grid */}
                          {q.type === "mcq" && (
                            <div className="space-y-2 mb-4 bg-slate-50/70 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Multiple Choice Options (Click option badge to set as correct answer)
                                </span>
                                <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">
                                  Selected Key: {q.answer || "None"}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {q.options.map((opt, optIdx) => {
                                  const letter = String.fromCharCode(65 + optIdx);
                                  const isSelectedKey = q.answer?.toUpperCase() === letter;
                                  return (
                                    <div key={optIdx} className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleQuestionFieldChange(idx, "answer", letter)}
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-all cursor-pointer ${
                                          isSelectedKey
                                            ? 'bg-violet-600 text-white shadow-md ring-2 ring-violet-400'
                                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-violet-100 dark:hover:bg-slate-700'
                                        }`}
                                        title={`Click to mark ${letter} as correct answer`}
                                      >
                                        {letter}
                                      </button>
                                      <input
                                        type="text"
                                        required
                                        value={opt}
                                        onChange={(e) => handleOptionChange(idx, optIdx, e.target.value)}
                                        placeholder={`Option ${letter} text...`}
                                        className={`flex-1 bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs font-medium focus:outline-none transition-all ${
                                          isSelectedKey
                                            ? 'border-violet-500 ring-1 ring-violet-500/20 text-slate-900 dark:text-white'
                                            : 'border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white'
                                        }`}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Correct Answer Key */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Correct Answer Key *
                            </label>
                            <input
                              type="text"
                              required
                              value={q.answer}
                              onChange={(e) => handleQuestionFieldChange(idx, "answer", e.target.value)}
                              placeholder={q.type === "mcq" ? "Type A, B, C, or D (or click option badge above)" : "Enter expected keyword or solution..."}
                              className="w-full bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/50 text-violet-700 dark:text-violet-300 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-violet-500 transition-colors"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="w-full py-3 border border-dashed border-slate-300 dark:border-slate-800 hover:border-violet-500 dark:hover:border-violet-500 rounded-2xl text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-slate-50/50 dark:bg-slate-950/30"
                    >
                      <Plus className="w-4 h-4" /> Add Another Question Item
                    </button>
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab("repository")}
                      className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Cancel & Close
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting || questions.length === 0}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      <span>{isSubmitting ? "Publishing Test..." : "🚀 Publish State Mock Test"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
