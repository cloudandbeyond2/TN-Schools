"use client";

import PortalLayout from "@/components/PortalLayout";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Subject {
  id: string;
  name: string;
  class: string;
  icon: string | null;
  color: string | null;
}

interface Topic {
  id: string;
  name: string;
  topicNumber: number;
}

interface Unit {
  id: string;
  name: string;
  unitNumber: number;
  topics: Topic[];
}

interface Content {
  id: string;
  contentType: "PDF" | "PPT" | "SUMMARY" | "NOTES" | "MCQ";
  title: string;
  fileUrl: string | null;
  fileContent: string | null;
  mcqs: Array<{
    question: string;
    options: string[];
    answer: string;
    rationale: string;
  }> | null;
}

interface McqQuestion {
  question: string;
  options: string[];
  answer: string;
  rationale: string;
}

export default function CentralLearningHubAdmin() {
  const { data: session } = useSession();
  const [selectedClass, setSelectedClass] = useState<string>("10");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(false);

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState<boolean>(false);

  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [loadingContents, setLoadingContents] = useState<boolean>(false);

  // Forms
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: "", icon: "📚", color: "#6366f1" });

  const [showEditSubject, setShowEditSubject] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editSubjectForm, setEditSubjectForm] = useState({ name: "", icon: "📚", color: "#6366f1" });

  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: "", unitNumber: 1 });

  const [showEditUnit, setShowEditUnit] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [editUnitForm, setEditUnitForm] = useState({ name: "", unitNumber: 1 });

  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopic, setNewTopic] = useState({ name: "", topicNumber: 1 });

  const [showEditTopic, setShowEditTopic] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editTopicForm, setEditTopicForm] = useState({ name: "", topicNumber: 1 });

  const [showAddContent, setShowAddContent] = useState(false);
  const [newContent, setNewContent] = useState<{
    contentType: "PDF" | "PPT" | "SUMMARY" | "NOTES" | "MCQ";
    title: string;
    fileUrl: string;
    fileContent: string;
  }>({
    contentType: "PDF",
    title: "",
    fileUrl: "",
    fileContent: ""
  });
  const [newMcqs, setNewMcqs] = useState<McqQuestion[]>([
    { question: "", options: ["", "", "", ""], answer: "A", rationale: "" }
  ]);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [parsingSyllabus, setParsingSyllabus] = useState(false);
  const [segregatingBook, setSegregatingBook] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Auto hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch subjects when selectedClass changes
  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/subjects?class=${selectedClass}`);
      const json = await res.json();
      if (json.success) {
        setSubjects(json.data);
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setToast({ message: "Failed to load subjects", type: "error" });
    } finally {
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
    setSelectedSubject(null);
    setSelectedUnit(null);
    setSelectedTopic(null);
    setUnits([]);
    setContents([]);
  }, [selectedClass]);

  // Fetch units when selectedSubject changes
  const fetchUnits = async (subId: string) => {
    setLoadingUnits(true);
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/subjects/${subId}/units`);
      const json = await res.json();
      if (json.success) {
        setUnits(json.data);
      }
    } catch (err) {
      console.error("Error fetching units:", err);
      setToast({ message: "Failed to load units", type: "error" });
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleSelectSubject = (sub: Subject) => {
    setSelectedSubject(sub);
    setSelectedUnit(null);
    setSelectedTopic(null);
    setContents([]);
    fetchUnits(sub.id);
  };

  // Fetch contents when selectedTopic changes
  const fetchContents = async (topicId: string) => {
    setLoadingContents(true);
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/topics/${topicId}/contents`);
      const json = await res.json();
      if (json.success) {
        setContents(json.data);
      }
    } catch (err) {
      console.error("Error fetching contents:", err);
      setToast({ message: "Failed to load contents", type: "error" });
    } finally {
      setLoadingContents(false);
    }
  };

  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    fetchContents(topic.id);
  };

  const handleStartEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setEditSubjectForm({
      name: sub.name,
      icon: sub.icon || "📚",
      color: sub.color || "#6366f1"
    });
    setShowEditSubject(true);
  };

  const handleEditSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !editSubjectForm.name.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/subjects/${editingSubject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editSubjectForm, class: selectedClass })
      });
      const json = await res.json();
      if (json.success) {
        setToast({ message: `Subject '${editSubjectForm.name}' updated successfully!`, type: "success" });
        setShowEditSubject(false);
        setEditingSubject(null);
        fetchSubjects();
        if (selectedSubject?.id === editingSubject.id) {
          setSelectedSubject({ ...editingSubject, ...editSubjectForm });
        }
      } else {
        setToast({ message: json.error || "Failed to update subject", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Network error occurred", type: "error" });
    }
  };

  // Handlers: Create
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.name.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newSubject, class: selectedClass })
      });
      const json = await res.json();
      if (json.success) {
        setToast({ message: `Subject '${newSubject.name}' created successfully!`, type: "success" });
        setShowAddSubject(false);
        setNewSubject({ name: "", icon: "📚", color: "#6366f1" });
        fetchSubjects();
      } else {
        setToast({ message: json.error || "Failed to create subject", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Network error occurred", type: "error" });
    }
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnit.name.trim() || !selectedSubject) return;
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/units`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newUnit, subjectId: selectedSubject.id })
      });
      const json = await res.json();
      if (json.success) {
        setToast({ message: `Unit ${newUnit.unitNumber} created!`, type: "success" });
        setShowAddUnit(false);
        setNewUnit({ name: "", unitNumber: units.length + 1 });
        fetchUnits(selectedSubject.id);
      } else {
        setToast({ message: json.error || "Failed to create unit", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Network error occurred", type: "error" });
    }
  };

  const handleStartEditUnit = (u: Unit) => {
    setEditingUnit(u);
    setEditUnitForm({
      name: u.name,
      unitNumber: u.unitNumber
    });
    setShowEditUnit(true);
  };

  const handleEditUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit || !editUnitForm.name.trim() || !selectedSubject) return;
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/units/${editingUnit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editUnitForm })
      });
      const json = await res.json();
      if (json.success) {
        setToast({ message: `Unit updated successfully!`, type: "success" });
        setShowEditUnit(false);
        setEditingUnit(null);
        fetchUnits(selectedSubject.id);
        if (selectedUnit?.id === editingUnit.id) {
          setSelectedUnit({ ...editingUnit, ...editUnitForm });
        }
      } else {
        setToast({ message: json.error || "Failed to update unit", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Network error occurred", type: "error" });
    }
  };

  const handleSyllabusScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSubject) return;

    setParsingSyllabus(true);
    setToast({ message: "AI is analyzing your syllabus screenshot and mapping units to subunits. Please wait...", type: "success" });

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Image = event.target?.result as string;
      try {
        const res = await fetch(`${API_URL}/api/centralized-content/subjects/${selectedSubject.id}/parse-full-syllabus-ai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64Image,
            mimeType: file.type
          })
        });
        const json = await res.json();
        if (json.success) {
          setToast({ message: `AI mapped & generated syllabus successfully! 🤖`, type: "success" });
          fetchUnits(selectedSubject.id);
        } else {
          setToast({ message: json.error || "AI could not parse the syllabus structure from the screenshot.", type: "error" });
        }
      } catch (err) {
        console.error(err);
        setToast({ message: "Network error occurred while parsing.", type: "error" });
      } finally {
        setParsingSyllabus(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBookSegregationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSubject) return;

    setSegregatingBook(true);
    setToast({ message: "AI is analyzing the master book. Splitting and generating summaries, revision sheets, and quizzes for all subunits. Please wait...", type: "success" });

    const formData = new FormData();
    formData.append("file", file);

    fetch(`${API_URL}/api/centralized-content/subjects/${selectedSubject.id}/segregate-book-ai`, {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setToast({ message: `Successfully segregated master book! Created ${json.data.summaries} summaries, ${json.data.notes} notes, and ${json.data.mcqs} quizzes. 🤖📚`, type: "success" });
          fetchUnits(selectedSubject.id);
          setSelectedUnit(null);
          setSelectedTopic(null);
          setContents([]);
        } else {
          setToast({ message: json.error || "AI could not process the book segregation.", type: "error" });
        }
      })
      .catch(err => {
        console.error(err);
        setToast({ message: "Error occurred while segregating the book.", type: "error" });
      })
      .finally(() => {
        setSegregatingBook(false);
      });
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.name.trim() || !selectedUnit) return;
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newTopic, unitId: selectedUnit.id })
      });
      const json = await res.json();
      if (json.success) {
        setToast({ message: `Subunit ${newTopic.topicNumber} created!`, type: "success" });
        setShowAddTopic(false);
        setNewTopic({ name: "", topicNumber: (selectedUnit.topics?.length || 0) + 1 });
        if (selectedSubject) fetchUnits(selectedSubject.id);
      } else {
        setToast({ message: json.error || "Failed to create subunit", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Network error occurred", type: "error" });
    }
  };

  const handleStartEditTopic = (t: Topic) => {
    setEditingTopic(t);
    setEditTopicForm({
      name: t.name,
      topicNumber: t.topicNumber
    });
    setShowEditTopic(true);
  };

  const handleEditTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic || !editTopicForm.name.trim() || !selectedSubject) return;
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/topics/${editingTopic.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editTopicForm })
      });
      const json = await res.json();
      if (json.success) {
        setToast({ message: `Subunit updated successfully!`, type: "success" });
        setShowEditTopic(false);
        setEditingTopic(null);
        fetchUnits(selectedSubject.id);
        if (selectedTopic?.id === editingTopic.id) {
          setSelectedTopic({ ...editingTopic, ...editTopicForm });
        }
      } else {
        setToast({ message: json.error || "Failed to update subunit", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Network error occurred", type: "error" });
    }
  };

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.title.trim() || !selectedTopic) return;

    let finalPayload: any = {
      topicId: selectedTopic.id,
      contentType: newContent.contentType,
      title: newContent.title
    };

    if (newContent.contentType === "PDF" || newContent.contentType === "PPT") {
      finalPayload.fileUrl = newContent.fileUrl;
    } else if (newContent.contentType === "SUMMARY" || newContent.contentType === "NOTES") {
      finalPayload.fileContent = newContent.fileContent;
    } else if (newContent.contentType === "MCQ") {
      finalPayload.mcqs = newMcqs.map(q => ({
        question: q.question,
        options: q.options,
        answer: q.answer.startsWith("Option") ? q.answer : `Option ${q.answer}`,
        rationale: q.rationale
      }));
    }

    try {
      const res = await fetch(`${API_URL}/api/centralized-content/contents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload)
      });
      const json = await res.json();
      if (json.success) {
        setToast({ message: "Content item uploaded successfully!", type: "success" });
        setShowAddContent(false);
        setNewContent({ contentType: "PDF", title: "", fileUrl: "", fileContent: "" });
        setNewMcqs([{ question: "", options: ["", "", "", ""], answer: "A", rationale: "" }]);
        fetchContents(selectedTopic.id);
      } else {
        setToast({ message: json.error || "Failed to upload content", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Network error occurred", type: "error" });
    }
  };

  // Handlers: Delete
  const handleDeleteSubject = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to delete subject '${name}'? This will delete all its units, topics, and uploaded materials!`)) return;
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/subjects/${id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (json.success) {
        setToast({ message: "Subject deleted", type: "success" });
        setSelectedSubject(null);
        fetchSubjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUnit = async (id: string) => {
    if (!confirm("Delete this unit and all its subtopics/contents?")) return;
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/units/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setToast({ message: "Unit deleted", type: "success" });
        setSelectedUnit(null);
        setSelectedTopic(null);
        if (selectedSubject) fetchUnits(selectedSubject.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm("Delete this topic and all its contents?")) return;
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/topics/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setToast({ message: "Topic deleted", type: "success" });
        setSelectedTopic(null);
        if (selectedSubject) fetchUnits(selectedSubject.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm("Delete this learning material?")) return;
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/contents/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setToast({ message: "Material deleted", type: "success" });
        if (selectedTopic) fetchContents(selectedTopic.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // MCQ Add/Edit helpers
  const handleAddQuestionField = () => {
    setNewMcqs(prev => [...prev, { question: "", options: ["", "", "", ""], answer: "A", rationale: "" }]);
  };

  const handleRemoveQuestionField = (idx: number) => {
    setNewMcqs(prev => prev.filter((_, i) => i !== idx));
  };

  const handleMcqChange = (qIdx: number, field: keyof McqQuestion, value: any, optIdx?: number) => {
    setNewMcqs(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      if (field === "options" && optIdx !== undefined) {
        const updatedOpts = [...q.options];
        updatedOpts[optIdx] = value;
        return { ...q, options: updatedOpts };
      }
      return { ...q, [field]: value };
    }));
  };

  // FileReader Mock upload helper
  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewContent(prev => ({ ...prev, title: prev.title || file.name.split(".")[0] }));

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewContent(prev => ({
        ...prev,
        fileContent: event.target?.result as string
      }));
    };

    if (newContent.contentType === "PDF" || newContent.contentType === "PPT") {
      // Mock uploading by resolving local file path or base64 mock
      setNewContent(prev => ({
        ...prev,
        fileUrl: `/uploads/${file.name}` // local mock path
      }));
    } else {
      reader.readAsText(file);
    }
  };

  return (
    <PortalLayout
      title="Centralized Learning Hub Console"
      subtitle="Configure master curriculum, upload study materials, and manage topic AI agents."
      themeClass="theme-superadmin"
      avatarLetter="S"
      avatarColor="#7c3aed"
      accentColor="#7c3aed"
    >
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg border text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-300 ${
          toast.type === "success" 
            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" 
            : "bg-red-500/15 border-red-500/30 text-red-400"
        }`}>
          <span>{toast.type === "success" ? "✅" : "❌"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Grade Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 glass p-4 rounded-2xl border border-slate-700/50">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block mb-1">Scope Selection</span>
          <div className="flex flex-wrap gap-2">
            {["6", "7", "8", "9", "10", "11", "12"].map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border ${
                  selectedClass === cls
                    ? "bg-indigo-650 text-white border-indigo-500 shadow-md"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Grade {cls}th Std
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowAddSubject(true)}
          className="px-4 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20 self-stretch md:self-auto"
        >
          ➕ Add Central Subject
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (3/12): Subjects List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass p-4 rounded-2xl border border-slate-700/50">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Subjects ({subjects.length})</h3>
            {loadingSubjects ? (
              <div className="py-8 flex flex-col items-center">
                <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-[10px] text-slate-400">Loading...</span>
              </div>
            ) : subjects.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No subjects created for this standard yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                {subjects.map((sub) => (
                  <div
                    key={sub.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all group cursor-pointer ${
                      selectedSubject?.id === sub.id
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md font-bold"
                        : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                    onClick={() => handleSelectSubject(sub)}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl" style={{ textShadow: `0 0 10px ${sub.color || "#6366f1"}50` }}>
                        {sub.icon || "📚"}
                      </span>
                      <span className="text-xs font-bold truncate max-w-[120px]">{sub.name}</span>
                    </div>
                    <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditSubject(sub);
                        }}
                        className="hover:text-indigo-400 p-1 text-[10px]"
                        title="Edit Subject"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubject(sub.id, sub.name);
                        }}
                        className="hover:text-red-400 p-1 text-[10px]"
                        title="Delete Subject"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unit List */}
          {selectedSubject && (
            <div className="glass p-4 rounded-2xl border border-slate-700/50 animate-in fade-in duration-200">
              <div className="flex flex-col gap-2.5 mb-3.5">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Units</h3>
                  <button
                    onClick={() => {
                      setNewUnit({ name: "", unitNumber: units.length + 1 });
                      setShowAddUnit(true);
                    }}
                    className="text-[10px] font-extrabold text-indigo-400 hover:underline"
                  >
                    ➕ Unit
                  </button>
                </div>
                
                {/* AI Syllabus Scanner */}
                <div className="relative border border-dashed border-indigo-500/25 hover:border-indigo-400/50 bg-indigo-950/10 hover:bg-indigo-950/20 rounded-xl p-2.5 transition-all flex items-center justify-center gap-2 cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSyllabusScreenshotUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={parsingSyllabus}
                  />
                  <span className="text-sm select-none">🤖</span>
                  <span className="text-[10px] font-bold text-indigo-400 group-hover:text-indigo-300 uppercase tracking-wide select-none">
                    {parsingSyllabus ? "Mapping Units & Subunits..." : "AI Syllabus Scanner (Units & Subunits)"}
                  </span>
                </div>

                {/* AI Master Book Segregator */}
                <div className="relative border border-dashed border-emerald-500/25 hover:border-emerald-400/50 bg-emerald-950/10 hover:bg-emerald-950/20 rounded-xl p-2.5 transition-all flex items-center justify-center gap-2 cursor-pointer group">
                  <input
                    type="file"
                    accept=".pdf,.txt,.md"
                    onChange={handleBookSegregationUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={segregatingBook}
                  />
                  <span className="text-sm select-none">📚</span>
                  <span className="text-[10px] font-bold text-emerald-400 group-hover:text-emerald-300 uppercase tracking-wide select-none">
                    {segregatingBook ? "Segregating Book via AI..." : "AI Book Segregator (Split to Subunits)"}
                  </span>
                </div>
              </div>

              {loadingUnits ? (
                <div className="py-6 flex flex-col items-center">
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : units.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No units available.</p>
              ) : (
                <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                  {units.map((u) => (
                    <div
                      key={u.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedUnit?.id === u.id
                          ? "bg-indigo-600 border-indigo-600 text-white font-bold shadow-sm"
                          : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/35 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                      onClick={() => {
                        setSelectedUnit(u);
                        setSelectedTopic(null);
                        setContents([]);
                      }}
                    >
                      <span className="text-xs font-semibold leading-snug break-words pr-2">
                        {u.unitNumber}. {u.name}
                      </span>
                      <div className="flex gap-1 items-center shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditUnit(u);
                          }}
                          className="hover:text-indigo-400 p-0.5 text-[9px]"
                          title="Edit Unit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUnit(u.id);
                          }}
                          className="hover:text-red-400 p-0.5 text-[9px]"
                          title="Delete Unit"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Middle Column (3/12): Subunits List */}
        <div className="lg:col-span-3 space-y-4">
          {selectedUnit ? (
            <div className="glass p-4 rounded-2xl border border-slate-700/50 animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Subunits</h3>
                <button
                  onClick={() => {
                    setNewTopic({ name: "", topicNumber: (selectedUnit.topics?.length || 0) + 1 });
                    setShowAddTopic(true);
                  }}
                  className="text-[10px] font-extrabold text-indigo-400 hover:underline"
                >
                  ➕ Subunit
                </button>
              </div>

              {!selectedUnit.topics || selectedUnit.topics.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No subunits found inside this unit.</p>
              ) : (
                <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
                  {selectedUnit.topics.map((t) => (
                    <div
                      key={t.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        selectedTopic?.id === t.id
                          ? "bg-indigo-600 border-indigo-600 text-white font-bold shadow-sm"
                          : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/35 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                      onClick={() => handleSelectTopic(t)}
                    >
                      <span className="text-xs font-semibold leading-snug break-words pr-2">
                        {t.topicNumber}. {t.name}
                      </span>
                      <div className="flex gap-1 items-center shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditTopic(t);
                          }}
                          className="hover:text-indigo-400 p-0.5 text-[9px]"
                          title="Edit Subunit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTopic(t.id);
                          }}
                          className="hover:text-red-400 p-0.5 text-[9px]"
                          title="Delete Subunit"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="glass p-6 rounded-2xl border border-slate-700/40 text-center text-slate-500 text-xs py-20">
              👈 Select a subject and unit to manage subunits
            </div>
          )}
        </div>

        {/* Right Column (6/12): Content Items & AI Management */}
        <div className="lg:col-span-6">
          {selectedTopic ? (
            <div className="glass p-6 rounded-3xl border border-slate-700/50 space-y-6 animate-in fade-in duration-200">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-850 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Subunit {selectedTopic.topicNumber} Workspace
                  </span>
                  <h2 className="text-lg font-black text-white mt-1.5">{selectedTopic.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage reference materials and configure the topic AI study companion.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddContent(true)}
                  className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow transition-all flex items-center gap-1"
                >
                  ➕ Upload Materials
                </button>
              </div>

              {/* Contents List */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Materials & Modules</h3>

                {loadingContents ? (
                  <div className="py-12 flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mb-2" />
                    <span className="text-xs text-slate-400 animate-pulse">Loading topic materials...</span>
                  </div>
                ) : contents.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
                    <span className="text-4xl block mb-2">📥</span>
                    <p className="text-slate-400 text-xs">No learning materials have been uploaded for this topic.</p>
                    <button
                      onClick={() => setShowAddContent(true)}
                      className="text-xs text-indigo-400 font-bold hover:underline mt-2 inline-block"
                    >
                      Upload the first item now →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contents.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl border border-slate-850 bg-slate-900/40 hover:bg-slate-900/70 transition-all flex flex-col gap-2"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                              item.contentType === "PDF" 
                                ? "bg-red-500/10 border-red-500/20 text-red-400" 
                                : item.contentType === "PPT" 
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-400" 
                                : item.contentType === "SUMMARY" 
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                : item.contentType === "NOTES" 
                                ? "bg-blue-500/10 border-blue-500/20 text-blue-400" 
                                : "bg-purple-500/10 border-purple-500/20 text-purple-400"
                            }`}>
                              {item.contentType}
                            </span>
                            <h4 className="font-bold text-xs text-white leading-tight">{item.title}</h4>
                          </div>
                          <button
                            onClick={() => handleDeleteContent(item.id)}
                            className="text-xs hover:text-red-400 transition-colors p-1"
                            title="Delete Material"
                          >
                            🗑️ Delete
                          </button>
                        </div>

                        {/* Expandable preview details */}
                        <div className="text-[11px] text-slate-400 bg-slate-950/60 rounded-xl p-3 border border-slate-900">
                          {item.fileUrl && (
                            <p className="truncate">
                              🔗 Link: <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">{item.fileUrl}</a>
                            </p>
                          )}
                          {item.fileContent && (
                            <div className="whitespace-pre-line max-h-[100px] overflow-y-auto text-slate-300">
                              {item.fileContent.length > 200 
                                ? `${item.fileContent.slice(0, 200)}...` 
                                : item.fileContent
                              }
                            </div>
                          )}
                          {item.mcqs && Array.isArray(item.mcqs) && (
                            <div>
                              <p className="font-bold text-white mb-1">📝 MCQ Quiz ({item.mcqs.length} Questions):</p>
                              <ul className="list-disc pl-4 space-y-1">
                                {item.mcqs.map((q: any, qi: number) => (
                                  <li key={qi}>
                                    <span className="font-semibold text-slate-300">{q.question}</span> 
                                    <span className="text-indigo-400 ml-1">({q.answer})</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Central AI Tutor Simulator Section */}
              <div className="bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-indigo-500/25 rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">AI Tutor Companion Active</h4>
                    <p className="text-[10px] text-slate-400">
                      The AI Companion is automatically initialized for students mapping to this topic.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900 text-xs text-slate-300">
                  <span className="font-bold text-white block mb-1">Knowledge Feed Status:</span>
                  {contents.length > 0 
                    ? `Ready. AI uses ${contents.length} centralized resource file(s) on this topic as context.`
                    : "No materials loaded yet. AI will use global board curriculum templates for fallback."
                  }
                </div>
              </div>
            </div>
          ) : (
            <div className="glass p-6 rounded-3xl border border-slate-700/40 text-center text-slate-400 text-sm py-28">
              📚 Select a class standard, subject, unit, and topic from the left hierarchies to manage centralized contents.
            </div>
          )}
        </div>
      </div>

      {/* Modals & Popups */}

      {/* 1. Add Subject Modal */}
      {showAddSubject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass max-w-md w-full p-6 border border-slate-700 rounded-3xl space-y-4 bg-slate-950">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Add Central Subject (Grade {selectedClass}th)</h3>
              <button onClick={() => setShowAddSubject(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-bold">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics, Science, Biology"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-4">
                {/* Icon Selection */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold">Choose Icon</label>
                  <div className="flex flex-wrap gap-2 mb-2 p-3 bg-slate-900 rounded-xl border border-slate-800">
                    {["📐", "🔬", "⚛️", "🧪", "🦁", "🐾", "🦋", "🐬", "🌿", "📜", "🗣️", "🌍", "💻", "🎨", "📚", "🎓"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewSubject({ ...newSubject, icon: emoji })}
                        className={`w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-slate-800 transition-all ${
                          newSubject.icon === emoji ? "bg-indigo-600/30 border border-indigo-500" : "border border-transparent"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] text-slate-500">Custom Icon (Emoji):</span>
                    <input
                      type="text"
                      maxLength={2}
                      placeholder="e.g. 🎒"
                      className="bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-xs text-white w-16 text-center focus:border-indigo-500 focus:outline-none"
                      value={newSubject.icon || ""}
                      onChange={(e) => setNewSubject({ ...newSubject, icon: e.target.value })}
                    />
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold">Theme Color</label>
                  <div className="flex gap-3 items-center mb-2">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-850 shrink-0 bg-slate-900 flex items-center justify-center hover:border-slate-650 transition-colors">
                      <input
                        type="color"
                        className="absolute inset-0 w-full h-full p-0 border-0 opacity-0 cursor-pointer"
                        value={newSubject.color || "#6366f1"}
                        onChange={(e) => setNewSubject({ ...newSubject, color: e.target.value })}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border border-white/20" 
                        style={{ backgroundColor: newSubject.color || "#6366f1" }}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Hex Code (e.g. #6366f1)"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
                      value={newSubject.color || ""}
                      onChange={(e) => setNewSubject({ ...newSubject, color: e.target.value })}
                    />
                  </div>
                  
                  {/* Preset Colors Grid */}
                  <div className="flex flex-wrap gap-2.5 p-3 bg-slate-900 rounded-xl border border-slate-800">
                    {[
                      { name: "Indigo", hex: "#6366f1" },
                      { name: "Emerald", hex: "#10b981" },
                      { name: "Amber", hex: "#f59e0b" },
                      { name: "Blue", hex: "#3b82f6" },
                      { name: "Rose", hex: "#f43f5e" },
                      { name: "Purple", hex: "#8b5cf6" },
                      { name: "Cyan", hex: "#06b6d4" },
                      { name: "Teal", hex: "#14b8a6" }
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setNewSubject({ ...newSubject, color: c.hex })}
                        className={`w-6 h-6 rounded-full border hover:scale-110 transition-all ${
                          newSubject.color === c.hex ? "border-white scale-105" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddSubject(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-650 rounded-xl text-xs font-bold text-white transition-all shadow-md shadow-indigo-500/20"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {showEditSubject && editingSubject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass max-w-md w-full p-6 border border-slate-700 rounded-3xl space-y-4 bg-slate-950">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Edit Central Subject</h3>
              <button 
                type="button"
                onClick={() => {
                  setShowEditSubject(false);
                  setEditingSubject(null);
                }} 
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-bold">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics, Science, Biology"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  value={editSubjectForm.name}
                  onChange={(e) => setEditSubjectForm({ ...editSubjectForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-4">
                {/* Icon Selection */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold">Choose Icon</label>
                  <div className="flex flex-wrap gap-2 mb-2 p-3 bg-slate-900 rounded-xl border border-slate-800">
                    {["📐", "🔬", "⚛️", "🧪", "🦁", "🐾", "🦋", "🐬", "🌿", "📜", "🗣️", "🌍", "💻", "🎨", "📚", "🎓"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setEditSubjectForm({ ...editSubjectForm, icon: emoji })}
                        className={`w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-slate-800 transition-all ${
                          editSubjectForm.icon === emoji ? "bg-indigo-600/30 border border-indigo-500" : "border border-transparent"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] text-slate-500">Custom Icon (Emoji):</span>
                    <input
                      type="text"
                      maxLength={2}
                      placeholder="e.g. 🎒"
                      className="bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-xs text-white w-16 text-center focus:border-indigo-500 focus:outline-none"
                      value={editSubjectForm.icon || ""}
                      onChange={(e) => setEditSubjectForm({ ...editSubjectForm, icon: e.target.value })}
                    />
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold">Theme Color</label>
                  <div className="flex gap-3 items-center mb-2">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-slate-850 shrink-0 bg-slate-900 flex items-center justify-center hover:border-slate-650 transition-colors">
                      <input
                        type="color"
                        className="absolute inset-0 w-full h-full p-0 border-0 opacity-0 cursor-pointer"
                        value={editSubjectForm.color || "#6366f1"}
                        onChange={(e) => setEditSubjectForm({ ...editSubjectForm, color: e.target.value })}
                      />
                      <div 
                        className="w-6 h-6 rounded-full border border-white/20" 
                        style={{ backgroundColor: editSubjectForm.color || "#6366f1" }}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Hex Code (e.g. #6366f1)"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
                      value={editSubjectForm.color || ""}
                      onChange={(e) => setEditSubjectForm({ ...editSubjectForm, color: e.target.value })}
                    />
                  </div>
                  
                  {/* Preset Colors Grid */}
                  <div className="flex flex-wrap gap-2.5 p-3 bg-slate-900 rounded-xl border border-slate-800">
                    {[
                      { name: "Indigo", hex: "#6366f1" },
                      { name: "Emerald", hex: "#10b981" },
                      { name: "Amber", hex: "#f59e0b" },
                      { name: "Blue", hex: "#3b82f6" },
                      { name: "Rose", hex: "#f43f5e" },
                      { name: "Purple", hex: "#8b5cf6" },
                      { name: "Cyan", hex: "#06b6d4" },
                      { name: "Teal", hex: "#14b8a6" }
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setEditSubjectForm({ ...editSubjectForm, color: c.hex })}
                        className={`w-6 h-6 rounded-full border hover:scale-110 transition-all ${
                          editSubjectForm.color === c.hex ? "border-white scale-105" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditSubject(false);
                    setEditingSubject(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-all shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Unit Modal */}
      {showAddUnit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass max-w-md w-full p-6 border border-slate-700 rounded-3xl space-y-4 bg-slate-950">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Add Unit to {selectedSubject?.name}</h3>
              <button onClick={() => setShowAddUnit(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleAddUnit} className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold">Unit No.</label>
                  <input
                    type="number"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 focus:outline-none text-center"
                    value={newUnit.unitNumber}
                    onChange={(e) => setNewUnit({ ...newUnit, unitNumber: parseInt(e.target.value) || 1 })}
                    min="1"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold">Unit Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Relations and Functions"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    value={newUnit.name}
                    onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddUnit(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-all"
                >
                  Create Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Unit Modal */}
      {showEditUnit && editingUnit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass max-w-md w-full p-6 border border-slate-700 rounded-3xl space-y-4 bg-slate-950">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Edit Unit</h3>
              <button 
                type="button"
                onClick={() => {
                  setShowEditUnit(false);
                  setEditingUnit(null);
                }} 
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditUnitSubmit} className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold">Unit No.</label>
                  <input
                    type="number"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 focus:outline-none text-center"
                    value={editUnitForm.unitNumber}
                    onChange={(e) => setEditUnitForm({ ...editUnitForm, unitNumber: parseInt(e.target.value) || 1 })}
                    min="1"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold">Unit Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Relations and Functions"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    value={editUnitForm.name}
                    onChange={(e) => setEditUnitForm({ ...editUnitForm, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditUnit(false);
                    setEditingUnit(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Subunit Modal */}
      {showAddTopic && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass max-w-md w-full p-6 border border-slate-700 rounded-3xl space-y-4 bg-slate-950">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Add Subunit to Unit {selectedUnit?.unitNumber}</h3>
              <button onClick={() => setShowAddTopic(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleAddTopic} className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold">Subunit No.</label>
                  <input
                    type="number"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 focus:outline-none text-center"
                    value={newTopic.topicNumber}
                    onChange={(e) => setNewTopic({ ...newTopic, topicNumber: parseInt(e.target.value) || 1 })}
                    min="1"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold">Subunit Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Cartesian Product"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    value={newTopic.name}
                    onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddTopic(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-all"
                >
                  Create Subunit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subunit Modal */}
      {showEditTopic && editingTopic && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="glass max-w-md w-full p-6 border border-slate-700 rounded-3xl space-y-4 bg-slate-950">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Edit Subunit</h3>
              <button 
                type="button"
                onClick={() => {
                  setShowEditTopic(false);
                  setEditingTopic(null);
                }} 
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditTopicSubmit} className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold">Subunit No.</label>
                  <input
                    type="number"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 focus:outline-none text-center"
                    value={editTopicForm.topicNumber}
                    onChange={(e) => setEditTopicForm({ ...editTopicForm, topicNumber: parseInt(e.target.value) || 1 })}
                    min="1"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold">Subunit Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Cartesian Product"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    value={editTopicForm.name}
                    onChange={(e) => setEditTopicForm({ ...editTopicForm, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditTopic(false);
                    setEditingTopic(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add Content Modal */}
      {showAddContent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="glass max-w-2xl w-full p-6 border border-slate-700 rounded-3xl space-y-4 my-8 bg-slate-950">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">Upload Reference / AI Materials</h3>
                <p className="text-[10px] text-slate-400">Target topic: {selectedTopic?.name}</p>
              </div>
              <button onClick={() => setShowAddContent(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleAddContent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold">Content Type</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    value={newContent.contentType}
                    onChange={(e) => setNewContent({ ...newContent, contentType: e.target.value as any })}
                  >
                    <option value="PDF">PDF Document Extract</option>
                    <option value="PPT">PPT Lecture Slides</option>
                    <option value="SUMMARY">AI Concept Summary (Text)</option>
                    <option value="NOTES">Revision & Lecture Notes (Text)</option>
                    <option value="MCQ">Mastery Assessment Quiz (MCQs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-bold">Material Title</label>
                  <input
                    type="text"
                    placeholder="e.g. TN Maths Book Extract"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    value={newContent.title}
                    onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Dynamic Content Form Fields */}
              {(newContent.contentType === "PDF" || newContent.contentType === "PPT") && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-bold">Document External URL</label>
                    <input
                      type="url"
                      placeholder="e.g. https://www.textbookcorp.tn.gov.in/pdf/10th-Maths-EM.pdf"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      value={newContent.fileUrl}
                      onChange={(e) => setNewContent({ ...newContent, fileUrl: e.target.value })}
                      required
                    />
                  </div>

                  <div className="border border-dashed border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <span className="font-bold text-xs text-white block">Mock File Upload</span>
                      <span className="text-[10px] text-slate-400">Choose a local file to auto-populate title & URL path.</span>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx"
                      onChange={handleLocalFileUpload}
                      className="text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20"
                    />
                  </div>
                </div>
              )}

              {(newContent.contentType === "SUMMARY" || newContent.contentType === "NOTES") && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-bold">Text Document Content</label>
                    <textarea
                      placeholder="Write curriculum notes, formulas, summaries, and bilingual explanation mappings here..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 focus:outline-none h-44"
                      value={newContent.fileContent}
                      onChange={(e) => setNewContent({ ...newContent, fileContent: e.target.value })}
                      required
                    />
                  </div>

                  <div className="border border-dashed border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <span className="font-bold text-xs text-white block">Import Text File</span>
                      <span className="text-[10px] text-slate-400">Select a local text/markdown file to populate content.</span>
                    </div>
                    <input
                      type="file"
                      accept=".txt,.md"
                      onChange={handleLocalFileUpload}
                      className="text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20"
                    />
                  </div>
                </div>
              )}

              {newContent.contentType === "MCQ" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                    <span className="text-xs font-bold text-white">Quiz Questions Editor</span>
                    <button
                      type="button"
                      onClick={handleAddQuestionField}
                      className="text-xs font-black text-indigo-400 hover:text-indigo-300"
                    >
                      ➕ Add Question
                    </button>
                  </div>

                  <div className="space-y-5 max-h-[300px] overflow-y-auto pr-1">
                    {newMcqs.map((q, idx) => (
                      <div key={idx} className="p-4 rounded-2xl border border-slate-900 bg-slate-950 relative space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400">Question #{idx + 1}</span>
                          {newMcqs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestionField(idx)}
                              className="text-[10px] text-red-400 hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Enter the question text"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                            value={q.question}
                            onChange={(e) => handleMcqChange(idx, "question", e.target.value)}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-400">{String.fromCharCode(65 + optIdx)})</span>
                              <input
                                type="text"
                                placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-[11px] text-white focus:border-indigo-500 focus:outline-none"
                                value={opt}
                                onChange={(e) => handleMcqChange(idx, "options", e.target.value, optIdx)}
                                required
                              />
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-1">
                            <label className="block text-[10px] text-slate-500 mb-1 font-bold">Correct Choice</label>
                            <select
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                              value={q.answer}
                              onChange={(e) => handleMcqChange(idx, "answer", e.target.value)}
                            >
                              <option value="Option A">Option A</option>
                              <option value="Option B">Option B</option>
                              <option value="Option C">Option C</option>
                              <option value="Option D">Option D</option>
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-[10px] text-slate-500 mb-1 font-bold">AI Tutor Explanation / Rationale</label>
                            <input
                              type="text"
                              placeholder="Explanation for students after answering"
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[11px] text-white focus:border-indigo-500 focus:outline-none"
                              value={q.rationale}
                              onChange={(e) => handleMcqChange(idx, "rationale", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddContent(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-all shadow-md"
                >
                  Upload Content
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
