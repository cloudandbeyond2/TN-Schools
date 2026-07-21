"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { FileText, Plus, Trash2, CheckCircle, RefreshCw, Sparkles, Folder, FolderOpen, ChevronRight, ChevronDown, Layers } from "lucide-react";
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
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [grade, setGrade] = useState("Grade 10");
  const [difficulty, setDifficulty] = useState("Medium");
  const [duration, setDuration] = useState("180");
  
  const [questions, setQuestions] = useState<QuestionInput[]>([
    {
      type: "mcq",
      text: "",
      options: ["A) ", "B) ", "C) ", "D) "],
      answer: "A",
      marks: 1
    }
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [existingTests, setExistingTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New state variables for tabs and hierarchical folders
  const [activeTab, setActiveTab] = useState<"create" | "repository">("create");
  const [expandedGrades, setExpandedGrades] = useState<Record<string, boolean>>({});
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

  const toggleGrade = (gradeName: string) => {
    setExpandedGrades(prev => ({ ...prev, [gradeName]: !prev[gradeName] }));
  };

  const toggleSubject = (subjectName: string) => {
    setExpandedSubjects(prev => ({ ...prev, [subjectName]: !prev[subjectName] }));
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchProfileAndExistingTests();
  }, [session]);

  const fetchProfileAndExistingTests = async () => {
    const sessionSchoolId = (session?.user as any)?.schoolId;
    if (!sessionSchoolId) return;

    try {
      setLoading(true);
      setProfile({ schoolId: sessionSchoolId });
      
      // Fetch existing questions for mock repository
      const qRes = await fetch(`${API_URL}/api/teacher/questions?schoolId=${sessionSchoolId}`);
      const qData = await qRes.json();
      if (qData.success) {
        setExistingTests(qData.data);
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
      {
        type: "mcq",
        text: "",
        options: ["A) ", "B) ", "C) ", "D) "],
        answer: "A",
        marks: 1
      }
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
          mcqCount: 3,
          shortCount: 2,
          longCount: 0
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const mapped = data.data.map((q: any) => ({
          type: q.type === "mcq" ? "mcq" : "short",
          text: q.text,
          options: q.options || ["A) ", "B) ", "C) ", "D) "],
          answer: q.answer,
          marks: q.marks
        }));
        setQuestions(mapped);
        Swal.fire("AI Generation Success!", "Mock questions generated successfully.", "success");
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
        text: "Are you sure you want to delete this? It will be removed from all student and staff portals.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#3b82f6",
        confirmButtonText: "Yes, delete it!"
      });

      if (confirm.isConfirmed) {
        const res = await fetch(`${API_URL}/api/teacher/questions/${id}`, {
          method: "DELETE"
        });
        const data = await res.json();
        if (data.success) {
          Swal.fire("Deleted!", "The mock exam content has been removed.", "success");
          fetchProfileAndExistingTests();
        } else {
          Swal.fire("Error", data.error || "Failed to delete.", "error");
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "An unexpected error occurred while deleting.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeSchoolId = profile?.schoolId || (session?.user as any)?.schoolId;
    if (!activeSchoolId) {
      Swal.fire("Error", "Associated school ID not found in session.", "error");
      return;
    }
    setIsSubmitting(true);

    try {
      // Map mock exam format into database question records
      const records = questions.map((q) => ({
        grade,
        subject,
        topic: `${title} (Duration: ${duration} mins)`,
        difficulty,
        type: q.type,
        text: q.text,
        options: q.type === "mcq" ? q.options : [],
        answer: q.answer,
        marks: q.marks
      }));

      const res = await fetch(`${API_URL}/api/teacher/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: records,
          schoolId: activeSchoolId
        })
      });

      const data = await res.json();
      if (data.success) {
        Swal.fire("Saved!", "Mock Exam uploaded successfully to student repository.", "success");
        setTitle("");
        setQuestions([{ type: "mcq", text: "", options: ["A) ", "B) ", "C) ", "D) "], answer: "A", marks: 1 }]);
        fetchProfileAndExistingTests();
      } else {
        Swal.fire("Error", data.error || "Failed to save mock test.", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "An unexpected error occurred.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-calculate grouped tests
  const groupedTests = existingTests.reduce((acc, test) => {
    if (!acc[test.grade]) acc[test.grade] = {};
    if (!acc[test.grade][test.subject]) acc[test.grade][test.subject] = [];
    acc[test.grade][test.subject].push(test);
    return acc;
  }, {});

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "மாதிரி தேர்வு உருவாக்கி" : "Mock Exam Creator"}
      subtitle={lang === "தமிழ்" ? "SSLC தரப்படுத்தப்பட்ட பலகை தேர்வுகளை பதிவேற்றி நிர்வகிக்கவும்" : "Upload and manage SSLC standardized board exams"}
      accentColor="#3b82f6">
      
      {/* Tabs */}
      <div className="flex gap-4 border-b border-[var(--border)] mb-8 w-full">
        <button
          onClick={() => setActiveTab("create")}
          className={`pb-4 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === "create" ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
        >
          <Plus className="w-4 h-4" /> {lang === "தமிழ்" ? "புதிய மாதிரி தேர்வு உருவாக்கு" : "Create New Mock Exam"}
        </button>
        <button
          onClick={() => setActiveTab("repository")}
          className={`pb-4 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === "repository" ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
        >
          <Layers className="w-4 h-4" /> {lang === "தமிழ்" ? "மாதிரி தேர்வு கலங்கம்" : "Mock Exam Repository"}
        </button>
      </div>

      <div className="text-left animate-in fade-in duration-300 w-full">
        
        {activeTab === "create" && (
          <div className="w-full space-y-6">
            <div className="bg-[var(--bg-card)] border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[var(--text-heading)] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Mock Exam Blueprint Form
                </h2>
                <button
                  type="button"
                  onClick={handleAIGenerateMock}
                  disabled={isGenerating}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 shadow-md"
                >
                  {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  AI Autocomplete Mock Test
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--text-muted)]">Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-main)]"
                    >
                      {["Grade 11", "Grade 12"].includes(grade) ? (
                        <>
                          <option>Tamil</option>
                          <option>English</option>
                          <option>Physics</option>
                          <option>Chemistry</option>
                          <option>Mathematics</option>
                          <option>Biology</option>
                          <option>Computer Science</option>
                          <option>Commerce</option>
                          <option>Accountancy</option>
                          <option>Economics</option>
                        </>
                      ) : (
                        <>
                          <option>Tamil</option>
                          <option>English</option>
                          <option>Mathematics</option>
                          <option>Science</option>
                          <option>Social Science</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--text-muted)]">Grade / Target Group</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-main)]"
                    >
                      <option>Grade 6</option>
                      <option>Grade 7</option>
                      <option>Grade 8</option>
                      <option>Grade 9</option>
                      <option>Grade 10</option>
                      <option>Grade 11</option>
                      <option>Grade 12</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-[var(--text-muted)]">Mock Exam Title / Chapter Topic *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. SSLC State Model Paper I"
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--text-muted)]">Duration (mins)</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)]"
                    />
                  </div>
                </div>

                {/* Questions Input List */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-heading)]">Questions List ({questions.length})</h3>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="text-xs text-blue-500 hover:text-blue-600 font-bold flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Question
                    </button>
                  </div>

                  <div className="space-y-5">
                    {questions.map((q, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-[var(--border)] space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400">Q{idx + 1}</span>
                          <div className="flex items-center gap-3">
                            <select
                              value={q.type}
                              onChange={(e) => handleQuestionFieldChange(idx, "type", e.target.value as any)}
                              className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2 py-1 text-[10px] text-[var(--text-main)]"
                            >
                              <option value="mcq">MCQ (Multiple Choice)</option>
                              <option value="short">Short/Descriptive Answer</option>
                            </select>
                            <input
                              type="number"
                              value={q.marks}
                              onChange={(e) => handleQuestionFieldChange(idx, "marks", parseInt(e.target.value) || 1)}
                              className="w-12 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-2 py-1 text-[10px] text-center"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(idx)}
                              className="text-red-500 hover:text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          required
                          value={q.text}
                          onChange={(e) => handleQuestionFieldChange(idx, "text", e.target.value)}
                          placeholder="Enter question text statement..."
                          className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)]"
                        />

                        {/* Options rendering for MCQ */}
                        {q.type === "mcq" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                            {q.options.map((opt, optIdx) => (
                              <input
                                key={optIdx}
                                type="text"
                                required
                                value={opt}
                                onChange={(e) => handleOptionChange(idx, optIdx, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3 py-1.5 text-[10px] text-[var(--text-main)]"
                              />
                            ))}
                          </div>
                        )}

                        <div className="pl-4 space-y-1">
                          <label className="text-[10px] font-bold text-[var(--text-muted)]">Correct Answer Key / Rubric Explanation</label>
                          <input
                            type="text"
                            required
                            value={q.answer}
                            onChange={(e) => handleQuestionFieldChange(idx, "answer", e.target.value)}
                            placeholder={q.type === "mcq" ? "e.g. A" : "e.g. In a right-angled triangle..."}
                            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3 py-2 text-[10px] text-[var(--text-main)]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || questions.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Publish Mock Test to Student Catalog
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "repository" && (
          <div className="w-full space-y-6">
            <div className="bg-[var(--bg-card)] border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-black tracking-wider text-[var(--text-heading)] mb-6 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-500" />
                Hierarchical Question Bank
              </h3>
              
              {loading ? (
                <div className="text-center py-12 text-sm text-slate-400">Loading mock exams...</div>
              ) : Object.keys(groupedTests).length === 0 ? (
                <div className="text-center py-12 text-sm text-slate-400">No mock exams uploaded to the repository yet.</div>
              ) : (
                <div className="space-y-4">
                  {Object.keys(groupedTests).sort().map(gradeKey => (
                    <div key={gradeKey} className="border-2 border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--bg-main)]">
                      <button
                        onClick={() => toggleGrade(gradeKey)}
                        className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {expandedGrades[gradeKey] ? <FolderOpen className="w-5 h-5 text-blue-500" /> : <Folder className="w-5 h-5 text-slate-400" />}
                          <span className="font-bold text-sm text-[var(--text-heading)]">{gradeKey}</span>
                        </div>
                        {expandedGrades[gradeKey] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      </button>
                      
                      {expandedGrades[gradeKey] && (
                        <div className="pl-6 pr-4 py-4 space-y-4 border-t-2 border-[var(--border)] bg-slate-50/50 dark:bg-slate-900/50">
                          {Object.keys(groupedTests[gradeKey]).sort().map(subjectKey => (
                            <div key={subjectKey} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
                              <button
                                onClick={() => toggleSubject(`${gradeKey}-${subjectKey}`)}
                                className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                              >
                                <div className="flex items-center gap-2.5">
                                  {expandedSubjects[`${gradeKey}-${subjectKey}`] ? <FolderOpen className="w-4 h-4 text-emerald-500" /> : <Folder className="w-4 h-4 text-slate-400" />}
                                  <span className="font-bold text-xs text-[var(--text-main)] uppercase tracking-wider">{subjectKey}</span>
                                  <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 ml-2">
                                    {groupedTests[gradeKey][subjectKey].length} items
                                  </span>
                                </div>
                                {expandedSubjects[`${gradeKey}-${subjectKey}`] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                              </button>
                              
                              {expandedSubjects[`${gradeKey}-${subjectKey}`] && (
                                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 space-y-3 border-t border-slate-200 dark:border-slate-800">
                                  {groupedTests[gradeKey][subjectKey].map((t: any, idx: number) => (
                                    <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 relative group shadow-sm transition-all hover:shadow-md">
                                      <button 
                                        onClick={() => handleDeleteTest(t.id)}
                                        className="absolute top-3 right-3 p-1.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete Mock Exam Content"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                      <div className="flex items-center gap-2 mb-2 pr-8">
                                        <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">{t.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}</span>
                                        <span className="text-[10px] font-bold text-slate-500">{t.marks} Marks</span>
                                      </div>
                                      <h4 className="text-xs font-bold text-[var(--text-heading)] mb-1.5 leading-snug pr-8">{t.topic}</h4>
                                      <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">"{t.text}"</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </PortalLayout>
  );
}
