"use client";
import { Zap, FolderOpen, Settings, Star, HelpCircle, Save, Pencil, RefreshCw, Archive, Trash, Download } from "lucide-react";
import jsPDF from "jspdf";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

interface Question {
  id: string;
  type: "mcq" | "short" | "long";
  text: string;
  options?: string[];
  answer: string;
  marks: number;
  grade: string;
  subject: string;
  topic: string;
  difficulty: string;
}

export default function QuestionGeneratorPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const teacherId = (session?.user as any)?.id;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [grade, setGrade] = useState("");
  const [schoolClasses, setSchoolClasses] = useState<string[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [subject, setSubject] = useState("");
  const [subjectOptions, setSubjectOptions] = useState<{ id: string; name: string }[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [mcqCount, setMcqCount] = useState(3);
  const [shortCount, setShortCount] = useState(2);
  const [longCount, setLongCount] = useState(1);

  // Fetch PostgreSQL classes created for this teacher/school on /teacher/classes page
  useEffect(() => {
    if (!schoolId) return;
    const fetchTeacherClasses = async () => {
      setLoadingClasses(true);
      try {
        let url = `${API_URL}/api/classes?schoolId=${schoolId}`;
        if (teacherId) url += `&teacherId=${teacherId}`;

        let res = await fetch(url);
        let data = await res.json();

        let classRooms: any[] = [];
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          classRooms = data.data;
        } else {
          // Fallback to all school classes if teacher-specific query is empty
          const fallbackRes = await fetch(`${API_URL}/api/classes?schoolId=${schoolId}`);
          const fallbackData = await fallbackRes.json();
          if (fallbackData.success && Array.isArray(fallbackData.data) && fallbackData.data.length > 0) {
            classRooms = fallbackData.data;
          }
        }

        setTeacherClasses(classRooms);

        if (classRooms.length > 0) {
          const first = classRooms[0];
          const gName = first.className.startsWith("Grade") || first.className.startsWith("Class")
            ? first.className
            : `Grade ${first.className}`;
          setGrade(gName);
          if (first.subject) setSubject(first.subject);
        }
      } catch (err) {
        console.error("Error fetching teacher classes in Question Generator:", err);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchTeacherClasses();
  }, [schoolId, teacherId, API_URL]);

  // Fetch school configuration for valid classes
  useEffect(() => {
    if (!schoolId) return;
    const fetchSchoolDetails = async () => {
      try {
        const res = await fetch(`${API_URL}/api/schools/${schoolId}`);
        const data = await res.json();
        if (data.success && data.data?.classes) {
          setSchoolClasses(data.data.classes);
        }
      } catch (err) {
        console.error("Error fetching school details:", err);
      }
    };
    fetchSchoolDetails();
  }, [schoolId, API_URL]);

  // Dynamically compute Grade options EXCLUSIVELY from PostgreSQL teacherClasses
  const gradeOptions = useMemo(() => {
    const list: string[] = [];

    if (teacherClasses.length > 0) {
      teacherClasses.forEach((c) => {
        const name = c.className.startsWith("Grade") || c.className.startsWith("Class")
          ? c.className
          : `Grade ${c.className}`;
        if (!list.includes(name)) {
          list.push(name);
        }
      });
    } else if (schoolClasses.length > 0) {
      schoolClasses.forEach((c) => {
        const name = c.startsWith("Grade") || c.startsWith("Class") ? c : `Grade ${c}`;
        if (!list.includes(name)) {
          list.push(name);
        }
      });
    }

    list.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ""), 10) || 0;
      return numA - numB;
    });

    return list;
  }, [teacherClasses, schoolClasses]);

  // Dynamically compute Subject options EXCLUSIVELY from PostgreSQL teacherClasses
  const availableSubjects = useMemo(() => {
    const cleanGrade = grade.replace(/^(Grade|Class)\s+/i, "").split(" ")[0].split("-")[0].trim();
    const subjectsList: string[] = [];

    // 1. Get subjects from PostgreSQL teacher classes for the selected grade
    const matchedClasses = teacherClasses.filter((c) => {
      const cClean = c.className.replace(/^(Grade|Class)\s+/i, "").split(" ")[0].split("-")[0].trim();
      return cClean === cleanGrade;
    });

    matchedClasses.forEach((c) => {
      if (c.subject && !subjectsList.includes(c.subject)) {
        subjectsList.push(c.subject);
      }
    });

    if (subjectsList.length > 0) {
      return subjectsList;
    }

    // 2. Fallback to all subjects taught by teacher in PostgreSQL across all classes
    teacherClasses.forEach((c) => {
      if (c.subject && !subjectsList.includes(c.subject)) {
        subjectsList.push(c.subject);
      }
    });

    if (subjectsList.length > 0) {
      return subjectsList;
    }

    // 3. Fallback to API subjects ONLY if teacher has NO PostgreSQL classes at all
    subjectOptions.forEach((s) => {
      if (s.name && !subjectsList.includes(s.name)) {
        subjectsList.push(s.name);
      }
    });

    return subjectsList;
  }, [grade, teacherClasses, subjectOptions]);

  // Keep selected subject in sync with availableSubjects
  useEffect(() => {
    if (availableSubjects.length > 0) {
      if (!subject || !availableSubjects.includes(subject)) {
        setSubject(availableSubjects[0]);
      }
    }
  }, [availableSubjects]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [viewMode, setViewMode] = useState<"questions" | "answers">("questions");

  // Database store questions
  const [dbQuestions, setDbQuestions] = useState<Question[]>([]);
  const [activeView, setActiveView] = useState<"generator" | "bank">("generator");
  const [loadingBank, setLoadingBank] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Fetch from Question Bank DB on mount / view switch
  const fetchQuestionBank = async () => {
    try {
      setLoadingBank(true);
      const res = await fetch(`${API_URL}/api/teacher/questions?schoolId=${schoolId || ""}`);
      const data = await res.json();
      if (data.success && data.data) {
        setDbQuestions(data.data);
      }
    } catch (err) {
      console.error("Error fetching question bank", err);
    } finally {
      setLoadingBank(false);
    }
  };

  const handleDownloadPDF = (folderName: string, folderQuestions: Question[]) => {
    try {
      Swal.fire({
        title: 'Preparing Document...',
        text: 'Please select "Save as PDF" in the print dialog that opens.',
        icon: 'info',
        timer: 3000,
        showConfirmButton: false,
      });

      // Create a hidden iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) throw new Error("Iframe document not found");

      let html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${folderName.replace(/[^a-zA-Z0-9-]/g, '_')}_QuestionBank</title>
            <style>
              body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #000; line-height: 1.6; }
              h1 { font-size: 24px; margin-bottom: 5px; color: #111; }
              .subtitle { font-size: 14px; color: #555; margin-bottom: 40px; }
              .question { margin-bottom: 30px; page-break-inside: avoid; }
              .q-text { font-size: 16px; margin: 0 0 12px 0; font-weight: 600; }
              .marks { color: #666; font-size: 14px; font-weight: normal; }
              .options { margin-left: 20px; margin-bottom: 15px; }
              .option { margin-bottom: 8px; font-size: 15px; }
              .dash-line { border-bottom: 1px dashed #999; height: 30px; margin-bottom: 15px; }
              .page-break { page-break-before: always; }
              .ans-section { margin-top: 40px; }
              .ans-item { margin-bottom: 15px; page-break-inside: avoid; font-size: 15px; }
              
              @media print {
                body { padding: 0; }
                @page { margin: 20mm; }
              }
            </style>
          </head>
          <body>
            <h1>Question Bank: ${folderName}</h1>
            <div class="subtitle">Generated by TN Schools AI Ecosystem</div>
      `;

      folderQuestions.forEach((q, idx) => {
        html += `<div class="question"><p class="q-text">${idx + 1}. ${q.text} <span class="marks">[${q.marks} Marks]</span></p>`;
        
        if (q.type === 'mcq' && q.options) {
          html += `<div class="options">`;
          q.options.forEach((opt, oIdx) => {
            const cleanOpt = opt.replace(/^[A-Za-z]\)\s*/, '');
            html += `<div class="option">${String.fromCharCode(65 + oIdx)}) ${cleanOpt}</div>`;
          });
          html += `</div>`;
        } else {
          const lineCount = q.marks >= 5 ? 6 : (q.marks >= 2 ? 3 : 2);
          for (let l = 0; l < lineCount; l++) {
            html += `<div class="dash-line"></div>`;
          }
        }
        html += `</div>`;
      });

      html += `
        <div class="page-break ans-section">
          <h1>Answer Key: ${folderName}</h1>
      `;

      folderQuestions.forEach((q, idx) => {
        html += `<div class="ans-item"><strong>${idx + 1}.</strong> ${q.answer}</div>`;
      });

      html += `</div></body></html>`;

      doc.open();
      doc.write(html);
      doc.close();

      // Wait for fonts to load then print
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        
        // Cleanup after print dialog is closed
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);

    } catch (err) {
      console.error("Print generation error:", err);
      Swal.fire({
        title: 'Error',
        text: 'Failed to generate document.',
        icon: 'error'
      });
    }
  };

  useEffect(() => {
    if (schoolId) {
      fetchQuestionBank();
    }
  }, [schoolId, API_URL]);

  // Fetch subjects when grade changes
  useEffect(() => {
    const fetchSubjects = async () => {
      const classStr = grade.replace("Grade ", "");
      setLoadingSubjects(true);
      try {
        const res = await fetch(`${API_URL}/api/centralized-content/subjects?class=${classStr}`);
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setSubjectOptions(data.data);
          setSubject((prev) => {
            if (data.data.find((s: any) => s.name === prev)) return prev;
            return data.data[0].name;
          });
        } else {
          throw new Error("No subjects returned");
        }
      } catch (err) {
        console.warn("Failed to fetch subjects, using fallback data:", err);
        const fallbacks = [
          { id: "sub-1", name: "Mathematics" },
          { id: "sub-2", name: "Physics" },
          { id: "sub-3", name: "Chemistry" },
          { id: "sub-4", name: "Biology" },
          { id: "sub-5", name: "English" },
          { id: "sub-6", name: "Computer Science" }
        ];
        setSubjectOptions(fallbacks);
        setSubject((prev) => fallbacks.find((s) => s.name === prev) ? prev : fallbacks[0].name);
      } finally {
        setLoadingSubjects(false);
      }
    };
    if (grade) {
      fetchSubjects();
    }
  }, [grade, API_URL]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setShowQuestions(false);

    try {
      const res = await fetch(`${API_URL}/api/ai/generate-questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grade,
          subject,
          topic,
          difficulty,
          mcqCount,
          shortCount,
          longCount,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // give each question an id
        const generatedList = data.data.map((q: any, i: number) => ({
          ...q,
          id: `gen-${q.type}-${i}-${Date.now()}`
        }));
        setQuestions(generatedList);
        setShowQuestions(true);
      } else {
        Swal.fire({
          icon: "error",
          title: "Generation Failed",
          text: data.error || "Failed to parse questions from AI.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Failed to connect to AI service.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToBank = async () => {
    if (questions.length === 0) return;
    try {
      setActionStatus("Saving to Bank...");
      // Map out client-side IDs and ensure proper metadata is present
      const cleanQuestions = questions.map(({ id, ...q }) => ({
        ...q,
        grade: q.grade || grade,
        subject: q.subject || subject,
        topic: q.topic || topic,
        difficulty: q.difficulty || difficulty,
      }));
      const res = await fetch(`${API_URL}/api/teacher/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: cleanQuestions,
          schoolId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionStatus(" Saved successfully!");
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: "Questions successfully saved to Question Bank.",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchQuestionBank();
        setTimeout(() => setActionStatus(null), 3000);
      } else {
        Swal.fire({
          icon: "error",
          title: "Save Failed",
          text: data.error || "Failed to save questions.",
          confirmButtonColor: "#ef4444",
        });
        setActionStatus("Error saving.");
      }
    } catch (err) {
      console.error("Error saving questions to DB", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred.",
        confirmButtonColor: "#ef4444",
      });
      setActionStatus("Error saving.");
    }
  };

  const handleEdit = (q: Question) => {
    setEditingId(q.id);
    setEditingText(q.text);
  };

  const handleSaveEdit = async (id: string) => {
    // If it's a db question
    const isDbQuestion = dbQuestions.some(q => q.id === id);
    if (isDbQuestion) {
      try {
        const res = await fetch(`${API_URL}/api/teacher/questions/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: editingText }),
        });
        const data = await res.json();
        if (data.success) {
          setDbQuestions(dbQuestions.map(q => q.id === id ? { ...q, text: editingText } : q));
          Swal.fire({
            icon: "success",
            title: "Updated!",
            text: "Question updated successfully.",
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data.error || "Failed to update question.",
            confirmButtonColor: "#ef4444",
          });
        }
      } catch (err) {
        console.error("Error editing question", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An unexpected error occurred.",
          confirmButtonColor: "#ef4444",
        });
      }
    } else {
      setQuestions(questions.map((q) => (q.id === id ? { ...q, text: editingText } : q)));
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Draft question updated.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Question?",
      text: "Are you sure you want to delete this question from the bank?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/teacher/questions/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDbQuestions(dbQuestions.filter(q => q.id !== id));
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Question has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Failed to delete question.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error("Error deleting question", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleRegenerateItem = (id: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          return {
            ...q,
            text: `[Regenerated] Alternative formulation for ${topic}: Given a right-angled triangle, calculate dimensions using the standard formula.`,
            answer: "Alternative proof follows standard curriculum objectives.",
          };
        }
        return q;
      })
    );
  };

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "வினா உருவாக்கி" : "Question Generator"}
      subtitle={lang === "தமிழ்" ? "AI மூலம் தரமான தேர்வு மற்றும் வினாட்டல் வினாக்கள் உருவாக்கு" : "Create high-quality exam and quiz questions using AI"}
    >
      {/* Instructions Banner */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 mb-6 flex gap-3">
        <div className="text-amber-500 mt-0.5">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-800 dark:text-amber-500 mb-1">How to use the Question Generator:</h3>
          <ol className="text-xs text-amber-700 dark:text-amber-400/90 list-decimal list-inside space-y-1">
            <li>Select the <strong>Grade</strong>, <strong>Subject</strong>, and type the <strong>Topic</strong> you want to cover.</li>
            <li>Adjust the <strong>Difficulty</strong> and the number of MCQ, Short, and Long answer questions.</li>
            <li>Click <strong>Generate Questions</strong>. The AI will synthesize a blueprint-aligned question set.</li>
            <li>Review the generated questions, toggle <strong>Show Answers</strong> to verify, and click <strong>Save to Question Bank</strong>.</li>
            <li>View all your saved questions in the <strong>Question Bank DB</strong> tab for future tests.</li>
          </ol>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-wrap border-b border-[var(--border)] mb-6">
        <button
          onClick={() => setActiveView("generator")}
          className={`py-3 px-6 text-xs font-semibold border-b-2 transition-all ${activeView === "generator" ? "border-[var(--primary)] text-amber-550" : "border-transparent text-[var(--text-muted)]"
            }`}
        >
          <Zap className="w-4 h-4 inline-block mr-1 text-inherit" /> {lang === "தமிழ்" ? "AI வினா உருவாக்கி" : "AI Question Generator"}
        </button>
        <button
          onClick={() => {
            setActiveView("bank");
            fetchQuestionBank();
          }}
          className={`py-3 px-6 text-xs font-semibold border-b-2 transition-all ${activeView === "bank" ? "border-[var(--primary)] text-amber-550" : "border-transparent text-[var(--text-muted)]"
            }`}
        >
          <FolderOpen className="w-4 h-4 inline-block mr-1 text-inherit" /> {lang === "தமிழ்" ? "வினா வங்கி" : "Question Bank DB"} ({dbQuestions.length})
        </button>
      </div>

      {activeView === "generator" ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Settings Column */}
          <div className="theme-card p-6 h-fit">
            <h2 className="text-[var(--text-heading)] font-semibold text-sm mb-4"><Settings className="w-4 h-4 inline-block mr-1 text-inherit" /><Star className="w-4 h-4 inline-block mr-1 text-inherit" /> Generator Configuration</h2>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">Class / Grade</label>
                <select
                  required
                  value={grade}
                  onChange={(e) => {
                    const selectedG = e.target.value;
                    setGrade(selectedG);
                    const clean = selectedG.replace(/^(Grade|Class)\s+/i, "").split(" ")[0].split("-")[0].trim();
                    const matched = teacherClasses.find((c) => {
                      const cClean = c.className.replace(/^(Grade|Class)\s+/i, "").split(" ")[0].split("-")[0].trim();
                      return cClean === clean;
                    });
                    if (matched && matched.subject) {
                      setSubject(matched.subject);
                    }
                  }}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)]"
                  disabled={loadingClasses && gradeOptions.length === 0}
                >
                  <option value="" disabled>Select Class/Grade</option>
                  {loadingClasses && gradeOptions.length === 0 ? (
                    <option disabled>Loading classes...</option>
                  ) : gradeOptions.length > 0 ? (
                    gradeOptions.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))
                  ) : (
                    <option value="" disabled>No Classes Found</option>
                  )}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">Subject</label>
                <select
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)]"
                  disabled={loadingSubjects && availableSubjects.length === 0}
                >
                  <option value="" disabled>Select Subject</option>
                  {loadingSubjects && availableSubjects.length === 0 ? (
                    <option disabled>Loading subjects...</option>
                  ) : availableSubjects.length > 0 ? (
                    availableSubjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))
                  ) : (
                    <option value="" disabled>No Subjects Found</option>
                  )}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">Topic / Concept</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Algebra, Trigonometry"
                  className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["easy", "medium", "hard"] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all ${difficulty === diff
                        ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-sm"
                        : "bg-[var(--bg-main)] border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]"
                        }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-[var(--border)] my-2" />

              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-2">Question Breakdown</label>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-[var(--bg-main)] p-2 rounded-xl border border-[var(--border)]">
                    <span className="text-[var(--text-muted)] font-medium">Multiple Choice (MCQ)</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setMcqCount(Math.max(0, mcqCount - 1))} className="px-2 py-0.5 bg-[var(--bg-card)] border border-[var(--border)] rounded text-[var(--text-heading)]">-</button>
                      <span className="w-5 text-center text-[var(--text-heading)] font-semibold">{mcqCount}</span>
                      <button type="button" onClick={() => setMcqCount(mcqCount + 1)} className="px-2 py-0.5 bg-[var(--bg-card)] border border-[var(--border)] rounded text-[var(--text-heading)]">+</button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-[var(--bg-main)] p-2 rounded-xl border border-[var(--border)]">
                    <span className="text-[var(--text-muted)] font-medium">Short Answer</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setShortCount(Math.max(0, shortCount - 1))} className="px-2 py-0.5 bg-[var(--bg-card)] border border-[var(--border)] rounded text-[var(--text-heading)]">-</button>
                      <span className="w-5 text-center text-[var(--text-heading)] font-semibold">{shortCount}</span>
                      <button type="button" onClick={() => setShortCount(shortCount + 1)} className="px-2 py-0.5 bg-[var(--bg-card)] border border-[var(--border)] rounded text-[var(--text-heading)]">+</button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-[var(--bg-main)] p-2 rounded-xl border border-[var(--border)]">
                    <span className="text-[var(--text-muted)] font-medium">Long Answer</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setLongCount(Math.max(0, longCount - 1))} className="px-2 py-0.5 bg-[var(--bg-card)] border border-[var(--border)] rounded text-[var(--text-heading)]">-</button>
                      <span className="w-5 text-center text-[var(--text-heading)] font-semibold">{longCount}</span>
                      <button type="button" onClick={() => setLongCount(longCount + 1)} className="px-2 py-0.5 bg-[var(--bg-card)] border border-[var(--border)] rounded text-[var(--text-heading)]">+</button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full mt-2 py-3 rounded-xl bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 text-xs font-semibold text-white shadow-sm transition-opacity flex items-center justify-center gap-2"
              >
                {isGenerating ? "Synthesizing Questions..." : " Generate Questions"}
              </button>
            </form>
          </div>

          {/* Output Column */}
          <div className="xl:col-span-2 flex flex-col min-h-[400px]">
            {!isGenerating && !showQuestions && (
              <div className="theme-card p-8 flex-1 flex flex-col items-center justify-center text-center border-dashed">
                <span className="text-4xl mb-4"><HelpCircle className="w-4 h-4 inline-block mr-1 text-inherit" /></span>
                <h3 className="text-[var(--text-heading)] font-semibold text-sm">No Questions Generated</h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mt-1">
                  Configure your grade, subject, and question distribution metrics, then trigger the generator to construct exam content.
                </p>
              </div>
            )}

            {isGenerating && (
              <div className="theme-card p-8 flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full border-4 border-[var(--primary)]/20 border-t-[var(--primary)] animate-spin mb-6" />
                <h3 className="text-[var(--text-heading)] font-semibold text-sm mb-2">Analyzing Topic Syllabus...</h3>
                <p className="text-xs text-[var(--text-muted)] max-w-xs">
                  Generating questions according to cognitive level taxonomy.
                </p>
              </div>
            )}

            {showQuestions && !isGenerating && (
              <div className="space-y-4 flex-1 flex flex-col">
                {/* Toolbar */}
                <div className="theme-card p-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-[var(--bg-main)]">
                  <div className="text-xs text-[var(--text-muted)]">
                    Total Questions: <span className="text-[var(--text-heading)] font-semibold">{questions.length}</span> · Difficulty: <span className="text-[var(--primary)] font-bold capitalize">{difficulty}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    {actionStatus && <span className="text-[10px] text-amber-500 font-semibold">{actionStatus}</span>}
                    <div className="flex bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-1 mr-2">
                      <button
                        onClick={() => setViewMode("questions")}
                        className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${viewMode === "questions" ? "bg-[var(--primary)] text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                          }`}
                      >
                        Question Paper
                      </button>
                      <button
                        onClick={() => setViewMode("answers")}
                        className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${viewMode === "answers" ? "bg-emerald-500 text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                          }`}
                      >
                        Answer Key
                      </button>
                    </div>
                    <button
                      onClick={handleSaveToBank}
                      className="px-3 py-1.5 rounded-lg bg-[var(--primary)] hover:bg-amber-600 text-xs font-bold text-white shadow-sm flex items-center gap-1"
                    >
                      <Save className="w-4 h-4 inline-block mr-1 text-inherit" /> Save to Question Bank
                    </button>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-4 overflow-y-auto max-h-[500px]">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="theme-card p-5 space-y-3 relative group">
                      {/* Header */}
                      <div className="flex justify-between items-center">
                        <span className="badge badge-blue text-[10px]">
                          Q{idx + 1} · {q.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] font-medium">{q.marks} Mark{q.marks > 1 ? "s" : ""}</span>
                      </div>

                      {/* Question Content */}
                      {editingId === q.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] min-h-[80px]"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-2.5 py-1 rounded bg-[var(--bg-card)] border border-[var(--border)] text-[10px] text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEdit(q.id)}
                              className="px-2.5 py-1 rounded bg-[var(--primary)] text-[10px] text-white shadow-sm hover:opacity-90"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-[var(--text-heading)] font-medium leading-relaxed">{q.text}</div>
                      )}

                      {/* Options (if MCQ) */}
                      {q.type === "mcq" && q.options && (
                        <div className="grid grid-cols-2 gap-2 pl-2">
                          {q.options.map((opt) => (
                            <div key={opt} className="text-xs text-[var(--text-muted)] font-mono">
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Answer Key */}
                      {viewMode === "answers" && (
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl mt-3 text-xs">
                          <span className="text-emerald-500 dark:text-emerald-400 font-bold block mb-1">Answer / Solved:</span>
                          <span className="text-[var(--text-main)] leading-relaxed font-mono">{q.answer}</span>
                        </div>
                      )}

                      {/* Actions Bar (Hover) */}
                      {editingId !== q.id && (
                        <div className="flex gap-3 justify-end pt-2 border-t border-[var(--border-light)] opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(q)}
                            className="text-[10px] font-semibold text-[var(--text-muted)] hover:text-[var(--primary)] flex items-center gap-1"
                          >
                            <Pencil className="w-4 h-4 inline-block mr-1 text-inherit" /><Star className="w-4 h-4 inline-block mr-1 text-inherit" /> Edit
                          </button>
                          <button
                            onClick={() => handleRegenerateItem(q.id)}
                            className="text-[10px] font-semibold text-[var(--text-muted)] hover:text-[var(--primary)] flex items-center gap-1"
                          >
                            <RefreshCw className="w-4 h-4 inline-block mr-1 text-inherit" /> Regenerate
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Saved Bank Tab View */
        <div className="theme-card p-6 min-h-[400px]">
          <h2 className="text-base font-semibold text-[var(--text-heading)] mb-4"><Archive className="w-4 h-4 inline-block mr-1 text-inherit" /><Star className="w-4 h-4 inline-block mr-1 text-inherit" /> Active Question Bank</h2>

          {loadingBank ? (
            <div className="text-center py-12 text-xs text-[var(--text-muted)]">Loading bank repository...</div>
          ) : dbQuestions.length === 0 ? (
            <div className="text-center py-12 text-xs text-[var(--text-muted)]">No questions saved in bank database yet. Use the Generator tab to generate and save questions.</div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {Object.entries(
                dbQuestions.reduce((acc, q) => {
                  const folderName = `${q.grade} - ${q.subject} - ${q.topic}`;
                  if (!acc[folderName]) acc[folderName] = [];
                  acc[folderName].push(q);
                  return acc;
                }, {} as Record<string, Question[]>)
              ).map(([folderName, folderQuestions]) => (
                <div key={folderName} className="border border-[var(--border)] rounded-xl bg-[var(--bg-main)] overflow-hidden">
                  <div
                    className="p-4 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] cursor-pointer flex justify-between items-center transition-colors"
                    onClick={() => setExpandedFolders((prev) => ({ ...prev, [folderName]: !prev[folderName] }))}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{expandedFolders[folderName] ? "" : ""}</span>
                      <h3 className="font-semibold text-sm text-[var(--text-heading)]">{folderName}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPDF(folderName, folderQuestions);
                        }}
                        className="flex items-center gap-1 text-[var(--primary)] hover:text-amber-600 bg-[var(--primary)]/10 px-2 py-1 rounded"
                      >
                        <Download className="w-3 h-3" /> Save / Print PDF
                      </button>
                      <span>{folderQuestions.length} Questions</span>
                      <span className="text-[10px] transform transition-transform duration-200" style={{ transform: expandedFolders[folderName] ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                    </div>
                  </div>

                  {expandedFolders[folderName] && (
                    <div className="p-4 space-y-4 border-t border-[var(--border)] bg-[var(--bg-main)]">
                      {folderQuestions.map((q, idx) => (
                        <div key={q.id} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--primary)] space-y-2 relative group">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="badge badge-yellow text-[9px] uppercase">{q.type}</span>
                              <span className="text-[10px] text-[var(--text-muted)]">Difficulty: {q.difficulty}</span>
                            </div>
                            <span className="text-xs font-semibold text-[var(--text-heading)]">{q.marks} Mark{q.marks > 1 ? "s" : ""}</span>
                          </div>

                          {editingId === q.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg p-2 text-xs text-[var(--text-heading)] outline-none min-h-[60px]"
                              />
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setEditingId(null)} className="px-2 py-0.5 bg-[var(--bg-main)] text-[10px] rounded border border-[var(--border)]">Cancel</button>
                                <button onClick={() => handleSaveEdit(q.id)} className="px-2 py-0.5 bg-[var(--primary)] text-white text-[10px] rounded">Save</button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-[var(--text-heading)] font-medium leading-relaxed">{q.text}</p>
                          )}

                          {q.type === "mcq" && q.options && (
                            <div className="grid grid-cols-2 gap-1.5 pl-2 font-mono text-[10px] text-[var(--text-muted)]">
                              {q.options.map((opt) => (
                                <div key={opt}>{opt}</div>
                              ))}
                            </div>
                          )}

                          <div className="pt-2 flex justify-between items-center text-[10px] border-t border-[var(--border-light)]/50">
                            <span className="text-emerald-500 font-semibold font-mono">Ans: {q.answer}</span>
                            {editingId !== q.id && (
                              <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(q)} className="text-[var(--text-muted)] hover:text-[var(--primary)]"><Pencil className="w-4 h-4 inline-block mr-1 text-inherit" /><Star className="w-4 h-4 inline-block mr-1 text-inherit" /> Edit</button>
                                <button onClick={() => handleDelete(q.id)} className="text-red-500 hover:text-red-400"><Trash className="w-4 h-4 inline-block mr-1 text-inherit" /><Star className="w-4 h-4 inline-block mr-1 text-inherit" /> Delete</button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PortalLayout>
  );
}
