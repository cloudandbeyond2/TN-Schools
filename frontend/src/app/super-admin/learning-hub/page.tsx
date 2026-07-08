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
  contentType: string;
  title: string;
  fileUrl: string | null;
  fileContent: string | null;
  fileSize: string | null;
  uploader: string | null;
  uploaderRole: string | null;
  createdAt: string;
  infographic?: any;
  presentation?: any;
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

  // Multi-file upload states
  interface UploadingFile {
    id: string;
    file: File;
    title: string;
    type: string; // Textbook Chapter, Notes, Reference, Diagram
    progress: number;
    status: "idle" | "uploading" | "success" | "error";
    errorMsg?: string;
  }
  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([]);
  const [dragging, setDragging] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [parsingSyllabus, setParsingSyllabus] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Infographic states for Admin
  const [generatingInfographic, setGeneratingInfographic] = useState(false);
  const [infographicPreviewData, setInfographicPreviewData] = useState<any>(null);
  const [showInfographicPreview, setShowInfographicPreview] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const handleGenerateInfographic = async () => {
    if (!selectedTopic) return;
    setGeneratingInfographic(true);
    setToast({ message: "AI is analyzing materials and generating infographic study map...", type: "success" });
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/topics/${selectedTopic.id}/generate-infographic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploader: session?.user?.name || "Super Admin",
          uploaderRole: (session?.user as any)?.role || "SUPERADMIN"
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setToast({ message: "AI Infographic Map generated and saved successfully!", type: "success" });
        // Refresh contents list to pick up the new infographic content record
        await handleSelectTopic(selectedTopic);
      } else {
        throw new Error(json.error || "Failed to generate");
      }
    } catch (err: any) {
      console.error(err);
      setToast({ message: `Generation failed: ${err.message || err}`, type: "error" });
    } finally {
      setGeneratingInfographic(false);
    }
  };

  // Presentation states for Admin
  const [generatingPresentation, setGeneratingPresentation] = useState(false);
  const [presentationPreviewData, setPresentationPreviewData] = useState<any>(null);
  const [showPresentationPreview, setShowPresentationPreview] = useState(false);
  const [currentPreviewSlide, setCurrentPreviewSlide] = useState(0);

  const handleGeneratePresentation = async () => {
    if (!selectedTopic) return;
    setGeneratingPresentation(true);
    setToast({ message: "AI is analyzing materials and generating interactive lecture presentation...", type: "success" });
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/topics/${selectedTopic.id}/generate-presentation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploader: session?.user?.name || "Super Admin",
          uploaderRole: (session?.user as any)?.role || "SUPERADMIN"
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setToast({ message: "AI Presentation generated and saved successfully!", type: "success" });
        await handleSelectTopic(selectedTopic);
      } else {
        throw new Error(json.error || "Failed to generate");
      }
    } catch (err: any) {
      console.error(err);
      setToast({ message: `Presentation generation failed: ${err.message || err}`, type: "error" });
    } finally {
      setGeneratingPresentation(false);
    }
  };

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

  // File queue management helpers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const addFilesToQueue = (files: FileList | null) => {
    if (!files) return;
    const allowedExtensions = ['.pdf', '.docx', '.pptx', '.png', '.jpg', '.jpeg', '.txt', '.md'];
    const maxSizeBytes = 25 * 1024 * 1024; // 25MB

    const newFiles: UploadingFile[] = [];
    Array.from(files).forEach(file => {
      const ext = "." + file.name.split('.').pop()?.toLowerCase();
      let errorMsg = undefined;

      if (!allowedExtensions.includes(ext)) {
        errorMsg = "Unsupported file type";
      } else if (file.size > maxSizeBytes) {
        errorMsg = "File exceeds 25MB size limit";
      }

      newFiles.push({
        id: Math.random().toString(36).substring(7),
        file,
        title: file.name.split('.').slice(0, -1).join('.'), // filename default
        type: "Reference", // default material type tag
        progress: 0,
        status: errorMsg ? "error" : "idle",
        errorMsg
      });
    });

    setUploadQueue(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFilesToQueue(e.dataTransfer.files);
  };

  const handleFileBrowseSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFilesToQueue(e.target.files);
    e.target.value = ""; // reset input
  };

  const removeQueueFile = (id: string) => {
    setUploadQueue(prev => prev.filter(f => f.id !== id));
  };

  const updateQueueFileMetadata = (id: string, key: "title" | "type", value: string) => {
    setUploadQueue(prev => prev.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const handleUploadQueueMaterials = async () => {
    const filesToUpload = uploadQueue.filter(f => f.status === "idle");
    if (filesToUpload.length === 0) return;
    if (!selectedTopic) return;

    // Set uploading status
    setUploadQueue(prev => prev.map(f => f.status === "idle" ? { ...f, status: "uploading", progress: 0 } : f));

    // Upload files
    const uploadPromises = filesToUpload.map(queueItem => {
      return new Promise<void>((resolve) => {
        const formData = new FormData();
        formData.append("files", queueItem.file);
        
        const fileMetadata = [{
          topicId: selectedTopic.id,
          title: queueItem.title,
          type: queueItem.type
        }];
        formData.append("metadata", JSON.stringify(fileMetadata));
        formData.append("uploader", session?.user?.name || "Super Admin");
        formData.append("uploaderRole", (session?.user as any)?.role || "SUPERADMIN");

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API_URL}/api/centralized-content/upload-materials`);
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadQueue(prev => prev.map(f => f.id === queueItem.id ? { ...f, progress: percentComplete } : f));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 201 || xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.success) {
                setUploadQueue(prev => prev.map(f => f.id === queueItem.id ? { ...f, status: "success", progress: 100 } : f));
              } else {
                setUploadQueue(prev => prev.map(f => f.id === queueItem.id ? { ...f, status: "error", errorMsg: response.error || "Upload failed" } : f));
              }
            } catch (e) {
              setUploadQueue(prev => prev.map(f => f.id === queueItem.id ? { ...f, status: "error", errorMsg: "Invalid response format" } : f));
            }
          } else {
            let errorMsg = "Server error";
            try {
              const resp = JSON.parse(xhr.responseText);
              errorMsg = resp.error || errorMsg;
            } catch (e) {}
            setUploadQueue(prev => prev.map(f => f.id === queueItem.id ? { ...f, status: "error", errorMsg } : f));
          }
          resolve();
        };

        xhr.onerror = () => {
          setUploadQueue(prev => prev.map(f => f.id === queueItem.id ? { ...f, status: "error", errorMsg: "Network error" } : f));
          resolve();
        };

        xhr.send(formData);
      });
    });

    await Promise.all(uploadPromises);

    fetchContents(selectedTopic.id);
    
    const checkQueue = uploadQueue.filter(f => f.status === "error");
    if (checkQueue.length === 0) {
      setToast({ message: "All materials uploaded successfully!", type: "success" });
      setTimeout(() => {
        setShowAddContent(false);
        setUploadQueue([]);
      }, 1500);
    } else {
      setToast({ message: "Some files failed to upload. Check errors below.", type: "error" });
    }
  };

  const handleReplaceMaterialFile = async (contentId: string, file: File) => {
    if (!file) return;
    
    if (file.size > 25 * 1024 * 1024) {
      setToast({ message: `File size exceeds 25MB: ${file.name}`, type: "error" });
      return;
    }
    
    const allowedExtensions = ['.pdf', '.docx', '.pptx', '.png', '.jpg', '.jpeg', '.txt', '.md'];
    const ext = "." + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setToast({ message: `Unsupported file type: ${file.name}`, type: "error" });
      return;
    }
    
    setToast({ message: `Replacing file for material...`, type: "success" });
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploader", session?.user?.name || "Super Admin");
    formData.append("uploaderRole", (session?.user as any)?.role || "SUPERADMIN");
    formData.append("title", file.name.split(".")[0]);
    formData.append("type", "Reference");
    
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/contents/${contentId}/replace`, {
        method: "PUT",
        body: formData
      });
      const json = await res.json();
      if (json.success) {
        setToast({ message: "Material file replaced successfully!", type: "success" });
        if (selectedTopic) fetchContents(selectedTopic.id);
      } else {
        setToast({ message: json.error || "Failed to replace material file", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Network error occurred during replacement", type: "error" });
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
                    {parsingSyllabus ? "Processing Syllabus..." : "Upload image or screenshot to load syllabus units & subunits"}
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
                    {contents.map((item) => {
                      // Helpers for icons and styles
                      const getFileIcon = (type: string, url: string | null) => {
                        const t = type.toLowerCase();
                        const u = (url || "").toLowerCase();
                        if (u.endsWith(".pdf") || t === "pdf") return "📄";
                        if (u.endsWith(".pptx") || u.endsWith(".ppt") || t === "ppt") return "📊";
                        if (u.endsWith(".docx") || u.endsWith(".doc")) return "📝";
                        if (u.endsWith(".png") || u.endsWith(".jpg") || u.endsWith(".jpeg")) return "🖼️";
                        if (t.includes("notes") || t.includes("summary")) return "📝";
                        return "📁";
                      };

                      const getTypeBadgeStyles = (type: string) => {
                        const t = type.toLowerCase();
                        if (t.includes("textbook")) return "bg-rose-500/10 border-rose-500/20 text-rose-400";
                        if (t.includes("notes")) return "bg-sky-500/10 border-sky-500/20 text-sky-400";
                        if (t.includes("diagram")) return "bg-amber-500/10 border-amber-500/20 text-amber-400";
                        if (t.includes("reference")) return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                        return "bg-purple-500/10 border-purple-500/20 text-purple-400";
                      };

                      return (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl border border-slate-850 bg-slate-900/40 hover:bg-slate-900/70 transition-all flex flex-col gap-3"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl" title="File type">
                                {getFileIcon(item.contentType, item.fileUrl)}
                              </span>
                              <div>
                                <h4 className="font-bold text-xs text-white leading-tight">{item.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${getTypeBadgeStyles(item.contentType)}`}>
                                    {item.contentType}
                                  </span>
                                  {item.fileSize && (
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      💾 {item.fileSize}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer hover:underline flex items-center gap-1 p-1">
                                🔄 Replace
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.docx,.pptx,.png,.jpg,.jpeg,.txt,.md"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleReplaceMaterialFile(item.id, file);
                                  }}
                                />
                              </label>
                              <span className="text-slate-700">|</span>
                              <button
                                onClick={() => handleDeleteContent(item.id)}
                                className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1 p-1"
                                title="Delete Material"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>

                           <div className="text-[11px] bg-slate-950/60 rounded-xl p-3 border border-slate-900/60 flex flex-col gap-1.5" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
                            {item.fileUrl && (
                              <p className="truncate flex items-center gap-1 flex-wrap">
                                <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>🔗 Link:</span>
                                {item.fileUrl.startsWith("data:") ? (
                                  <a
                                    href={item.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-indigo-400 hover:text-indigo-350 transition-all font-bold px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg text-[10px] inline-flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer ml-1"
                                  >
                                    <span>🎨</span> View Infographic Card
                                  </a>
                                ) : (
                                  <a
                                    href={item.fileUrl.startsWith("http") ? item.fileUrl : `${API_URL}${item.fileUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-indigo-400 hover:text-indigo-350 hover:underline transition-colors ml-1 font-semibold"
                                  >
                                    {item.fileUrl.startsWith("http") ? item.fileUrl : `${API_URL}${item.fileUrl}`}
                                  </a>
                                )}
                              </p>
                            )}
                            {item.fileContent && (
                              <div className="whitespace-pre-line max-h-[100px] overflow-y-auto font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                {item.fileContent.length > 200 
                                  ? `${item.fileContent.slice(0, 200)}...` 
                                  : item.fileContent
                                }
                              </div>
                            )}
                            <div className="flex justify-between items-center text-[10px] border-t border-slate-900/80 pt-1.5 mt-0.5" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
                              <span>Uploaded by: <strong style={{ color: 'rgba(255, 255, 255, 0.85)' }}>{item.uploader || "Admin"}</strong> ({item.uploaderRole || "SUPERADMIN"})</span>
                              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Central AI Tutor Simulator Section */}
              <div className={`border rounded-3xl p-5 space-y-4 transition-all ${
                contents.length > 0
                  ? "bg-gradient-to-r from-emerald-950/30 to-teal-950/30 border-emerald-500/25"
                  : "bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border-indigo-500/25"
              }`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{contents.length > 0 ? "✅" : "🤖"}</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {contents.length > 0 ? "AI companion Primary Source Active" : "AI Tutor Companion Fallback"}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      The AI Companion is automatically initialized for students mapping to this topic.
                    </p>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border text-xs transition-all ${
                  contents.length > 0
                    ? "bg-emerald-950/20 border-emerald-900/60 text-emerald-300"
                    : "bg-slate-950/50 border-slate-900 text-slate-300"
                }`}>
                  <span className="font-bold text-white block mb-1">Knowledge Feed Status:</span>
                  {contents.length > 0 
                    ? `Ready. ${contents.length} materials loaded — AI Companion is using this content as primary source.`
                    : "No materials loaded yet. AI will use global board curriculum templates for fallback."
                  }
                </div>
              </div>

              {/* Central AI Infographic Section */}
              {(() => {
                const infographicItem = contents.find(c => c.contentType === "INFOGRAPHIC");
                return (
                  <div className={`border rounded-3xl p-5 space-y-4 transition-all ${
                    infographicItem
                      ? "bg-gradient-to-r from-indigo-950/30 to-purple-950/30 border-indigo-500/25 animate-in fade-in"
                      : "bg-slate-900/20 border-slate-800"
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">🎨</span>
                        <div>
                          <h4 className="text-sm font-bold text-white">AI Visual Study Infographic</h4>
                          <p className="text-[10px] text-slate-400">
                            Pre-generated interactive infographic for student visual active recall.
                          </p>
                        </div>
                      </div>
                      
                      {infographicItem ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setInfographicPreviewData(infographicItem.infographic);
                              setFlippedCards({});
                              setShowInfographicPreview(true);
                            }}
                            className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-bold transition-all"
                          >
                            🔍 Preview
                          </button>
                          <button
                            disabled={generatingInfographic}
                            onClick={handleGenerateInfographic}
                            className="px-2.5 py-1 bg-purple-550 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold transition-all disabled:opacity-50"
                          >
                            {generatingInfographic ? "Generating..." : "⚡ Regenerate"}
                          </button>
                        </div>
                      ) : (
                        <button
                          disabled={generatingInfographic || contents.length === 0}
                          onClick={handleGenerateInfographic}
                          className="px-3 py-1 bg-indigo-650 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title={contents.length === 0 ? "Upload reference materials first to extract content" : "Generate infographic"}
                        >
                          {generatingInfographic ? "Generating..." : "⚡ Generate Infographic"}
                        </button>
                      )}
                    </div>

                    <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-900/60 text-xs text-slate-300 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white block mb-0.5">Infographic Status:</span>
                        {infographicItem 
                          ? `Ready. Pre-generated AI Infographic Map will be displayed for students.`
                          : contents.length === 0
                          ? "No materials uploaded yet. Please upload study materials to enable infographic generation."
                          : "Pre-generated map is missing. Generate it once so students can view it instantly."
                        }
                      </div>
                      
                      {infographicItem && (
                        <button
                          onClick={() => handleDeleteContent(infographicItem.id)}
                          className="text-[10px] text-slate-500 hover:text-red-400 font-bold hover:underline py-0.5 px-1.5 border border-slate-800 rounded transition-colors"
                          title="Delete Infographic"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Central AI Presentation section */}
              {(() => {
                const presentationItem = contents.find(c => c.contentType === "PRESENTATION");
                return (
                  <div className={`border rounded-3xl p-5 space-y-4 transition-all ${
                    presentationItem
                      ? "bg-gradient-to-r from-emerald-950/20 to-teal-950/20 border-teal-500/25 animate-in fade-in"
                      : "bg-slate-900/20 border-slate-800"
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">📊</span>
                        <div>
                          <h4 className="text-sm font-bold text-white">AI Slides Presentation</h4>
                          <p className="text-[10px] text-slate-400">
                            Pre-generated interactive lesson slide deck covering the subunit.
                          </p>
                        </div>
                      </div>
                      
                      {presentationItem ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setPresentationPreviewData(presentationItem.presentation);
                              setCurrentPreviewSlide(0);
                              setShowPresentationPreview(true);
                            }}
                            className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-bold transition-all"
                          >
                            🔍 Preview Slides
                          </button>
                          <button
                            disabled={generatingPresentation}
                            onClick={handleGeneratePresentation}
                            className="px-2.5 py-1 bg-purple-550 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold transition-all disabled:opacity-50"
                          >
                            {generatingPresentation ? "Generating..." : "⚡ Regenerate"}
                          </button>
                        </div>
                      ) : (
                        <button
                          disabled={generatingPresentation || contents.length === 0}
                          onClick={handleGeneratePresentation}
                          className="px-3 py-1 bg-indigo-650 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title={contents.length === 0 ? "Upload reference materials first to extract content" : "Generate presentation"}
                        >
                          {generatingPresentation ? "Generating..." : "⚡ Generate Presentation"}
                        </button>
                      )}
                    </div>

                    <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-900/60 text-xs text-slate-350 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white block mb-0.5">Presentation Status:</span>
                        {presentationItem 
                          ? `Ready. Pre-generated AI Slides deck is available for student learning.`
                          : contents.length === 0
                          ? "No materials uploaded yet. Please upload study materials to enable presentation generation."
                          : "Pre-generated slide deck is missing. Generate it once so students can study visually."
                        }
                      </div>
                      
                      {presentationItem && (
                        <button
                          onClick={() => handleDeleteContent(presentationItem.id)}
                          className="text-[10px] text-slate-500 hover:text-red-400 font-bold hover:underline py-0.5 px-1.5 border border-slate-800 rounded transition-colors"
                          title="Delete Presentation"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
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

      {/* 4. Add Content Modal (Multi-File Uploader Queue) */}
      {showAddContent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="glass max-w-3xl w-full p-6 border border-slate-700/60 rounded-3xl space-y-5 my-8 bg-slate-950/95 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3.5 flex-shrink-0">
              <div>
                <h3 className="font-extrabold text-lg text-white tracking-wide">Upload Learning Materials</h3>
                <p className="text-xs text-slate-400 mt-0.5">Add textbooks, revision notes, diagrams, and reference sheets for: <span className="text-indigo-400 font-bold">{selectedTopic?.name}</span></p>
              </div>
              <button 
                onClick={() => {
                  setShowAddContent(false);
                  setUploadQueue([]);
                }} 
                className="text-slate-400 hover:text-white hover:bg-slate-900 rounded-full p-1.5 transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center cursor-pointer relative group flex-shrink-0 ${
                dragging 
                  ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/5 scale-[0.99]" 
                  : "border-slate-800 hover:border-slate-700 bg-slate-900/25 hover:bg-slate-900/40"
              }`}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.pptx,.png,.jpg,.jpeg,.txt,.md"
                onChange={handleFileBrowseSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <span className="text-4xl mb-3 select-none group-hover:scale-110 transition-transform duration-200">📥</span>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider select-none">
                Drag & Drop Files Here
              </p>
              <p className="text-[11px] text-slate-400 mt-1 select-none">
                or <span className="text-indigo-400 font-bold group-hover:underline">browse local files</span> from your computer
              </p>
              <p className="text-[10px] text-slate-505 mt-2.5 max-w-sm leading-relaxed select-none">
                Supported formats: PDF, DOCX, PPTX, JPG, PNG, TXT, MD (Max 25MB per file)
              </p>
            </div>

            {/* Queue List */}
            {uploadQueue.length > 0 ? (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[300px] min-h-[150px]">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1 sticky top-0 bg-slate-950 py-1">Upload Queue ({uploadQueue.length})</h4>
                
                {uploadQueue.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-3.5 rounded-xl border flex flex-col gap-3 transition-colors ${
                      item.status === 'error' 
                        ? 'bg-rose-950/15 border-rose-900/40' 
                        : item.status === 'success' 
                        ? 'bg-emerald-950/15 border-emerald-900/40'
                        : 'bg-slate-900/40 border-slate-850'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5 truncate max-w-[80%]">
                        <span className="text-xl">
                          {item.file.name.endsWith('.pdf') ? '📄' : item.file.name.endsWith('.pptx') || item.file.name.endsWith('.ppt') ? '📊' : '📝'}
                        </span>
                        <div className="truncate">
                          <p className="text-xs font-bold text-white truncate">{item.file.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">💾 {(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      
                      {item.status === 'idle' && (
                        <button 
                          type="button" 
                          onClick={() => removeQueueFile(item.id)}
                          className="text-[10px] text-slate-400 hover:text-red-400 font-bold p-1 hover:underline animate-in fade-in"
                        >
                          Remove
                        </button>
                      )}
                      {item.status === 'success' && (
                        <span className="text-[10px] text-emerald-400 font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">Success</span>
                      )}
                      {item.status === 'error' && (
                        <span className="text-[10px] text-rose-400 font-extrabold uppercase bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">Failed</span>
                      )}
                    </div>

                    {/* Metadata Settings */}
                    {item.status === 'idle' && (
                      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-900/60">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Label / Title</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateQueueFileMetadata(item.id, "title", e.target.value)}
                            placeholder="Label for students/AI"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Material Type</label>
                          <select
                            value={item.type}
                            onChange={(e) => updateQueueFileMetadata(item.id, "type", e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2 text-xs text-white focus:border-indigo-500 focus:outline-none font-medium"
                          >
                            <option value="Textbook Chapter">📖 Textbook Chapter</option>
                            <option value="Notes">📝 Revision Notes</option>
                            <option value="Reference">📚 Reference Guide</option>
                            <option value="Diagram">📊 Educational Diagram</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Progress Bar */}
                    {item.status === 'uploading' && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400">Uploading file...</span>
                          <span className="text-indigo-400 font-bold font-mono">{item.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                          <div 
                            className="bg-indigo-500 h-full transition-all duration-150 rounded-full"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {item.errorMsg && (
                      <p className="text-[10px] text-rose-400 font-medium bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
                        ⚠️ Error: {item.errorMsg}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center border border-slate-900 rounded-2xl bg-slate-900/10 py-10 min-h-[150px] flex-shrink-0 text-slate-500 text-xs">
                No files added to upload queue.
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-slate-850 flex gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowAddContent(false);
                  setUploadQueue([]);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900/40 transition-colors"
                disabled={uploadQueue.some(f => f.status === 'uploading')}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadQueueMaterials}
                className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-all shadow-md shadow-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  uploadQueue.length === 0 || 
                  uploadQueue.every(f => f.status === 'error' || f.status === 'success') ||
                  uploadQueue.some(f => f.status === 'uploading')
                }
              >
                {uploadQueue.some(f => f.status === 'uploading') ? "Uploading Materials..." : "Upload Materials"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 5. Infographic Preview Modal */}
      {showInfographicPreview && infographicPreviewData && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="glass max-w-4xl w-full p-6 border border-slate-700/60 rounded-3xl space-y-6 my-8 bg-slate-950/95 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 flex-shrink-0">
              <div>
                <h3 className="font-black text-base md:text-lg text-white tracking-wide">🎨 Student View Preview: AI Infographic Map</h3>
                <p className="text-xs text-slate-400 mt-0.5">Topic: {selectedTopic?.name}</p>
              </div>
              <button 
                onClick={() => {
                  setShowInfographicPreview(false);
                  setInfographicPreviewData(null);
                }} 
                className="text-slate-400 hover:text-white hover:bg-slate-900 rounded-full p-1.5 transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1.5">
              {/* 1. Header card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-4 items-center flex-shrink-0">
                <div className="absolute top-0 right-0 p-8 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl -mr-4 -mt-4"></div>
                <span className="text-4xl">🧠</span>
                <div>
                  <h4 className="font-black text-sm md:text-base text-indigo-455 dark:text-indigo-400">
                    {infographicPreviewData.topicTitle || selectedTopic?.name}
                  </h4>
                  <p className="text-xs text-slate-350 mt-1 leading-relaxed font-medium">
                    {infographicPreviewData.overallSummary}
                  </p>
                </div>
              </div>

              {/* 2. Visual Sequence Flow */}
              <div className="space-y-4">
                <h5 className="text-[11px] font-black uppercase text-slate-505 tracking-wider flex items-center gap-1.5">
                  <span>🗺️</span> Conceptual Step-by-Step Flow
                </h5>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {infographicPreviewData.visualFlow?.map((step: any, idx: number) => (
                    <div key={idx} className="relative flex flex-col p-4 rounded-xl border border-slate-800 bg-slate-900/20 shadow-xs hover:border-indigo-850 transition-colors">
                      <div className="flex justify-between items-center mb-2 flex-shrink-0">
                        <span className="text-lg" title="Concept Icon">{step.icon || "💡"}</span>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-indigo-950/40 text-indigo-400 rounded-md border border-indigo-500/10">
                          Step {step.stepNumber || (idx + 1)}
                        </span>
                      </div>
                      <h6 className="font-bold text-xs text-white leading-tight mb-1">{step.title}</h6>
                      <p className="text-[11px] text-slate-450 leading-relaxed font-medium mt-1">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Key Formulas & Mnemonics split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Formulas / Facts */}
                <div className="space-y-3">
                  <h5 className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                    <span>🔑</span> Core Formulas & Facts
                  </h5>
                  <div className="space-y-2.5">
                    {infographicPreviewData.keyFormulasOrFacts?.map((item: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-amber-500/25 bg-amber-500/5 flex flex-col gap-1">
                        <span className="font-mono font-bold text-xs text-amber-300 leading-snug break-words">
                          {item.concept}
                        </span>
                        <span className="text-[10px] text-slate-400 leading-relaxed font-medium mt-0.5">
                          {item.importance}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mnemonics */}
                <div className="space-y-3">
                  <h5 className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                    <span>✨</span> AI Memory Tricks (Mnemonics)
                  </h5>
                  <div className="space-y-2.5">
                    {infographicPreviewData.mnemonics?.map((item: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 flex flex-col gap-1">
                        <span className="font-black text-xs text-emerald-350">
                          💡 {item.phrase}
                        </span>
                        <span className="text-[10px] text-slate-400 leading-relaxed font-medium mt-0.5">
                          {item.meaning}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Active Recall Flashcards */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h5 className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                    <span>🃏</span> 3D Flip Flashcards (Active Recall)
                  </h5>
                  <span className="text-[10px] text-slate-550 font-medium">Click card to reveal answer</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {infographicPreviewData.flashcards?.map((card: any, idx: number) => {
                    const isFlipped = !!flippedCards[idx];
                    return (
                      <div 
                        key={idx}
                        onClick={() => setFlippedCards(prev => ({ ...prev, [idx]: !prev[idx] }))}
                        className="h-32 [perspective:800px] cursor-pointer group"
                      >
                        <div 
                          className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform ${
                            isFlipped ? '[transform:rotateY(180deg)]' : ''
                          }`}
                        >
                          {/* Front face */}
                          <div className="absolute inset-0 w-full h-full rounded-xl border border-slate-800 bg-slate-900 p-4 flex flex-col justify-between [backface-visibility:hidden] shadow-xs group-hover:border-indigo-850 transition-colors">
                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Question {idx + 1}</span>
                            <p className="text-xs text-slate-200 font-bold leading-snug line-clamp-3 my-auto">
                              {card.front}
                            </p>
                            <span className="text-[8px] text-slate-450 text-right mt-1 font-bold group-hover:text-indigo-400">🔄 CLICK TO REVEAL</span>
                          </div>

                          {/* Back face */}
                          <div className="absolute inset-0 w-full h-full rounded-xl border border-indigo-500/35 bg-indigo-950/40 p-4 flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-md">
                            <span className="text-[9px] font-black uppercase text-indigo-455 tracking-wider">Answer / Fact</span>
                            <p className="text-xs text-indigo-300 font-medium leading-snug line-clamp-4 my-auto">
                              {card.back}
                            </p>
                            <span className="text-[8px] text-indigo-450 text-right mt-1 font-bold">🔄 CLICK TO FLIP BACK</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowInfographicPreview(false);
                  setInfographicPreviewData(null);
                }}
                className="py-2 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 6. Presentation Preview Modal */}
      {showPresentationPreview && presentationPreviewData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-250">
          <div className="glass max-w-4xl w-full p-6 border border-slate-700/60 rounded-3xl space-y-6 my-8 bg-slate-950/95 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 flex-shrink-0">
              <div>
                <h3 className="font-black text-base md:text-lg text-white tracking-wide">🎨 Student View Preview: AI Slides Presentation</h3>
                <p className="text-xs text-slate-400 mt-0.5">{presentationPreviewData.presentationTitle || selectedTopic?.name}</p>
              </div>
              <button 
                onClick={() => {
                  setShowPresentationPreview(false);
                  setPresentationPreviewData(null);
                }} 
                className="text-slate-400 hover:text-white hover:bg-slate-900 rounded-full p-1.5 transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Slide Area */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto min-h-[300px]">
              {(() => {
                const currentSlide = presentationPreviewData.slides?.[currentPreviewSlide];
                if (!currentSlide) return <p className="text-slate-500 text-center py-10">Slide not found.</p>;
                
                return (
                  <div className="flex-1 flex flex-col gap-5">
                    {/* Slide Content Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
                      
                      {/* Left: Text bullets content */}
                      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-850 flex flex-col justify-between">
                        <div className="space-y-4">
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
                            Slide {currentSlide.slideNumber} of {presentationPreviewData.slides.length}
                          </span>
                          <h4 className="text-base font-black text-white leading-tight">
                            {currentSlide.title}
                          </h4>
                          
                          <ul className="space-y-3.5 pt-2">
                            {currentSlide.bulletPoints?.map((bp: string, bpi: number) => (
                              <li key={bpi} className="text-xs md:text-sm text-slate-205 flex items-start gap-2.5 leading-relaxed font-medium">
                                <span className="text-indigo-400 select-none mt-0.5">•</span>
                                <span>{bp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Right: Pictorial / Diagram representation guidance */}
                      <div className="p-6 rounded-2xl border border-teal-500/15 bg-teal-500/5 relative overflow-hidden flex flex-col justify-between group">
                        {/* Blueprint background grid effect */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e912_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e912_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none opacity-40"></div>
                        
                        <div className="relative z-10 space-y-3">
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-md">
                            📐 Visual Illustration Blueprint
                          </span>
                          <h5 className="text-xs font-extrabold text-slate-200">Pictorial Concept Representation:</h5>
                          <p className="text-xs text-slate-355 leading-relaxed font-medium">
                            {currentSlide.visualLayoutDescription}
                          </p>
                        </div>
                        
                        <div className="relative z-10 mt-4 text-[10px] text-teal-400 font-bold flex items-center gap-1 bg-teal-950/30 p-2 rounded-lg border border-teal-500/10">
                          <span>💡</span>
                          <span>Students will see custom animations matching this blueprint guide.</span>
                        </div>
                      </div>

                    </div>

                    {/* Speaker Notes / Explanation */}
                    <div className="p-4 rounded-xl border border-slate-850 bg-slate-900/30 leading-relaxed text-xs text-slate-300">
                      <span className="font-bold text-white block mb-1">📢 Presenter Notes & bilingual Explanation:</span>
                      <p className="whitespace-pre-line leading-relaxed font-medium text-slate-350">
                        {currentSlide.speakerNotes}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Navigation and Close Actions */}
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center flex-shrink-0">
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPreviewSlide === 0}
                  onClick={() => setCurrentPreviewSlide(prev => prev - 1)}
                  className="py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ◀ Previous Slide
                </button>
                <button
                  type="button"
                  disabled={currentPreviewSlide >= (presentationPreviewData.slides?.length || 0) - 1}
                  onClick={() => setCurrentPreviewSlide(prev => prev + 1)}
                  className="py-1.5 px-3 rounded-lg bg-indigo-650 hover:bg-indigo-500 text-xs font-bold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next Slide ▶
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {presentationPreviewData.slides?.map((_: any, idx: number) => (
                  <span 
                    key={idx} 
                    onClick={() => setCurrentPreviewSlide(idx)}
                    className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                      currentPreviewSlide === idx ? "bg-indigo-500 w-4" : "bg-slate-700 hover:bg-slate-600"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowPresentationPreview(false);
                  setPresentationPreviewData(null);
                }}
                className="py-2 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
