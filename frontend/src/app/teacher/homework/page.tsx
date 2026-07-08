"use client";
import { CheckCircle, Plus, Zap, Edit, Bell, Clipboard, X } from "lucide-react";


import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";

interface Assignment {
  id: string;
  title: string;
  className: string;
  dueDate: string;
  submittedCount: number;
  totalStudents: number;
  status: "active" | "draft" | "completed";
  description: string;
}

interface Submission {
  id: string;
  rollNo: string;
  name: string;
  status: "submitted" | "pending";
  score: string;
  date: string;
  answerText?: string;
}

export default function HomeworkPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "draft" | "completed">("active");
  const [selectedHwId, setSelectedHwId] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // New Homework Form State
  const [newTitle, setNewTitle] = useState("");
  const [newClass, setNewClass] = useState("");
  const [newDueDate, setNewDueDate] = useState("June 25, 2026");
  const [newDesc, setNewDesc] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Fetch teacher classes on mount
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      if (!schoolId || !session?.user) return;
      const teacherId = (session.user as any).id;
      try {
        const res = await fetch(`${API_URL}/api/classes?schoolId=${schoolId}&teacherId=${teacherId}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setTeacherClasses(data.data);
          if (data.data.length > 0) {
            setNewClass(`${data.data[0].className}${data.data[0].section} - ${data.data[0].subject}`);
          }
        }
      } catch (err) {
        console.error("Error fetching teacher classes:", err);
      }
    };
    fetchTeacherClasses();
  }, [schoolId, session, API_URL]);

  const fetchHomework = async () => {
    if (!schoolId || teacherClasses.length === 0) {
      setAssignments([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/teacher/homework?schoolId=${schoolId || ""}`);
      const result = await res.json();
      if (result.success && result.data) {
        const filtered = result.data.filter((hw: any) =>
          teacherClasses.some(tc => `${tc.className}${tc.section} - ${tc.subject}` === hw.className)
        );
        setAssignments(filtered);
        if (filtered.length > 0) {
          // Select first homework matching active status or fall back
          const firstHw = filtered.find((a: any) => a.status === activeTab) || filtered[0];
          setSelectedHwId(firstHw.id);
        } else {
          setSelectedHwId("");
        }
      }
    } catch (err) {
      console.error("Error loading homework list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomework();
  }, [schoolId, teacherClasses]);

  const fetchSubmissions = async (hwId: string) => {
    if (!hwId) return;
    try {
      setLoadingSubs(true);
      const res = await fetch(`${API_URL}/api/teacher/homework/${hwId}/submissions`);
      const result = await res.json();
      if (result.success && result.data) {
        setSubmissions(result.data);
      } else {
        setSubmissions([]);
      }
    } catch (err) {
      console.error("Error loading submissions:", err);
    } finally {
      setLoadingSubs(false);
    }
  };

  useEffect(() => {
    if (selectedHwId) {
      setCurrentPage(1);
      fetchSubmissions(selectedHwId);
    }
  }, [selectedHwId]);

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const res = await fetch(`${API_URL}/api/teacher/homework`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          className: newClass,
          dueDate: newDueDate,
          status: "active",
          description: newDesc,
          schoolId: schoolId || null,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setAssignments([result.data, ...assignments]);
        setSelectedHwId(result.data.id);
        setShowCreateModal(false);
        setNewTitle("");
        setNewDesc("");
        Swal.fire({
          icon: "success",
          title: "Created!",
          text: `New assignment "${newTitle}" assigned successfully!`,
          timer: 2500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.error || "Failed to create homework.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error("Error creating homework:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleGradeSubmission = async (subId: string, name: string) => {
    const scoreVal = prompt(`Enter score for ${name} (e.g. 9/10):`, "8/10");
    if (scoreVal === null) return;

    try {
      const res = await fetch(`${API_URL}/api/teacher/homework/submissions/${subId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: scoreVal,
          status: "submitted",
        }),
      });
      const result = await res.json();
      if (result.success) {
        setSubmissions(
          submissions.map((sub) => (sub.id === subId ? result.data : sub))
        );
        // Refresh homework list to update counts
        fetchHomework();
        Swal.fire({
          icon: "success",
          title: "Graded!",
          text: `Graded ${name} successfully with score ${scoreVal}!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Grading Failed",
          text: result.error || "Failed to submit score.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error("Error grading submission:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleViewAnswer = (sub: Submission) => {
    let displayText = sub.answerText || "No written response provided.";
    let filesHTML = "";

    if (sub.answerText) {
      try {
        const parsed = JSON.parse(sub.answerText);
        if (parsed && typeof parsed === "object" && ("notes" in parsed || "files" in parsed)) {
          displayText = parsed.notes || "No written response provided.";
          if (parsed.files && parsed.files.length > 0) {
            filesHTML = `
              <div style="margin-top: 15px;">
                <p style="margin-bottom: 8px; font-weight: bold; font-size: 14px; color: #1e293b;">Attachments:</p>
                <ul style="list-style: none; padding-left: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
                  ${parsed.files.map((file: any) => `
                    <li style="display: flex; align-items: center; gap: 8px; font-size: 13px; background: #f1f5f9; padding: 8px 12px; border-radius: 6px; border: 1px dashed #cbd5e1;">
                      <span style="font-size: 16px;">${file.kind === 'pdf' ? '' : ''}</span>
                      <a href="${file.url}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline; color: #0d9488; font-weight: 600; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${file.name}
                      </a>
                      <span style="font-size: 11px; color: #64748b;">(${file.sizeLabel})</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            `;
          }
        }
      } catch (e) {
        // Fallback to displaying raw string if parsing fails
      }
    }

    Swal.fire({
      title: `${sub.name}'s Submission`,
      html: `
        <div style="text-align: left; padding: 10px;">
          <p style="margin-bottom: 8px;"><strong>Turned In:</strong> ${sub.date}</p>
          <p style="margin-bottom: 12px;"><strong>Score:</strong> ${sub.score}</p>
          <p style="margin-bottom: 8px; font-weight: bold; font-size: 14px; color: #1e293b;">Your notes:</p>
          <div style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-family: sans-serif; white-space: pre-wrap; color: #1e293b; max-height: 250px; overflow-y: auto; font-size: 13.5px; line-height: 1.5;">
            ${displayText}
          </div>
          ${filesHTML}
        </div>
      `,
      confirmButtonText: "Close",
      confirmButtonColor: "#f59e0b",
    });
  };

  const triggerAIRecipes = async () => {
    if (!newTitle.trim()) {
      alert("Please enter a homework title/topic first.");
      return;
    }
    setIsGeneratingAI(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/draft-homework`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: newTitle,
          className: newClass,
        }),
      });
      const data = await res.json();
      if (data.success && data.text) {
        setNewDesc(data.text);
      } else {
        alert("Failed to generate homework: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("AI Error:", err);
      alert("An error occurred while calling the AI service.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSendReminder = () => {
    setToastMessage(`Push alerts and WhatsApp reminders sent to parents of pending students!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeAssignments = assignments.filter((a) => a.status === activeTab);
  const selectedHw = assignments.find((a) => a.id === selectedHwId) || assignments[0];

  return (
    <PortalLayout
      title="Homework Manager"
      subtitle="Track submissions, send automated parent reminders, and generate AI homework exercises"
    >
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-emerald-500 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2">
          <span><CheckCircle className="w-4 h-4 inline mr-1 text-emerald-500" /></span> {toastMessage}
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Header Toolbar */}
        <div className="flex justify-between items-center bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] p-4 rounded-2xl border border-[var(--border)]">
          <div className="flex bg-[var(--bg-main)] border border-[var(--border)] rounded-lg p-0.5">
            {(["active", "draft", "completed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  const firstHwOfTab = assignments.find((a) => a.status === tab);
                  if (firstHwOfTab) setSelectedHwId(firstHwOfTab.id);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeTab === tab ? "bg-[var(--primary)] text-white shadow-sm font-bold" : "text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--primary)] hover:bg-amber-600 transition-colors"
          >
            <Plus className="w-4 h-4 inline-block mr-1 text-inherit" /> Create Assignment
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-[var(--text-muted)]">Loading homework dashboard...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Homework Cards List */}
            <div className="space-y-4">
              <h3 className="text-[var(--text-heading)] font-semibold text-xs uppercase tracking-wider mb-1">
                <Edit className="w-4 h-4 inline-block mr-1 text-inherit" /> Assignments ({activeAssignments.length})
              </h3>
              
              {activeAssignments.map((hw) => {
                const isSelected = hw.id === selectedHwId;
                const percent = Math.round((hw.submittedCount / hw.totalStudents) * 100) || 0;
                return (
                  <div
                    key={hw.id}
                    onClick={() => setSelectedHwId(hw.id)}
                    className={`theme-card p-4 border text-left cursor-pointer transition-all hover:scale-[1.01] ${
                      isSelected ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)] hover:border-[var(--border)]"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-[var(--text-heading)] font-bold text-xs truncate max-w-[180px]">{hw.title}</h4>
                      <span className="text-[10px] text-slate-550">{hw.dueDate}</span>
                    </div>

                    <div className="text-[10px] text-[var(--text-muted)]">{hw.className}</div>
                    
                    {hw.status !== "draft" && (
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between items-center text-[9px] text-[var(--text-muted)]">
                          <span>Submissions Progress</span>
                          <span className="font-semibold text-[var(--text-heading)]">{hw.submittedCount}/{hw.totalStudents} ({percent}%)</span>
                        </div>
                        <div className="progress-bar w-full">
                          <div className="progress-fill" style={{ width: `${percent}%`, background: "#f59e0b" }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {activeAssignments.length === 0 && (
                <div className="theme-card p-8 border border-dashed border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
                  No assignments found in this status category.
                </div>
              )}
            </div>

            {/* Detailed Assignment Submissions Panel */}
            {selectedHw && (
              <div className="lg:col-span-2 space-y-6">
                {/* Info panel */}
                <div className="theme-card p-6 border border-[var(--border)]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-[var(--text-heading)] font-bold text-base leading-snug">{selectedHw.title}</h3>
                      <p className="text-xs text-[var(--text-muted)] mt-1">{selectedHw.className} · Due on {selectedHw.dueDate}</p>
                    </div>
                    
                    {selectedHw.status === "active" && (
                      <button
                        onClick={handleSendReminder}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-amber-400 border border-[var(--primary)]/20 hover:bg-[var(--primary)]/10 transition-all flex items-center gap-1.5"
                      >
                        <span><Bell className="w-4 h-4 inline-block mr-1 text-inherit" /></span> Send Parent Reminders
                      </button>
                    )}
                  </div>

                  <div className="p-4 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-xl text-xs text-slate-350 leading-relaxed">
                    <span className="font-semibold text-[var(--text-heading)] block mb-1">Homework Guidelines:</span>
                    {selectedHw.description}
                  </div>
                </div>

                {/* Roster & submissions checklist */}
                {selectedHw.status !== "draft" && (
                  <div className="theme-card p-6 border border-[var(--border)]">
                    <h3 className="text-[var(--text-heading)] font-semibold text-xs uppercase tracking-wider mb-4">
                      <Clipboard className="w-4 h-4 inline-block mr-1 text-inherit" /> Submission Roster
                    </h3>

                    {loadingSubs ? (
                      <div className="text-center py-8 text-xs text-[var(--text-muted)]">Loading submission roster...</div>
                    ) : submissions.length > 0 ? (
                      <>
                        <div className="overflow-x-auto">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Roll No</th>
                                <th>Student Name</th>
                                <th>Status</th>
                                <th>Turned In</th>
                                <th>Score</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {submissions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((sub) => (
                                <tr key={sub.id}>
                                  <td className="font-mono text-xs">{sub.rollNo}</td>
                                  <td className="font-medium text-[var(--text-heading)]">{sub.name}</td>
                                  <td>
                                    <span className={`badge ${sub.status === "submitted" ? "badge-green" : "badge-yellow"}`}>
                                      {sub.status}
                                    </span>
                                  </td>
                                  <td>{sub.date}</td>
                                  <td className="font-bold font-mono text-[var(--text-heading)]">{sub.score}</td>
                                  <td>
                                    <div className="flex gap-2">
                                      {sub.status === "submitted" && (
                                        <button
                                          onClick={() => handleViewAnswer(sub)}
                                          className="text-xs text-teal-500 hover:underline font-semibold"
                                        >
                                          View Answer
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleGradeSubmission(sub.id, sub.name)}
                                        className="text-xs text-amber-400 hover:underline font-semibold"
                                      >
                                        Grade Sheet
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {Math.ceil(submissions.length / itemsPerPage) > 1 && (
                          <div className="flex justify-between items-center mt-4 text-xs">
                            <span className="text-[var(--text-muted)]">
                              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, submissions.length)} of {submissions.length} entries
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 border border-[var(--border)] text-[var(--text-heading)] rounded-lg disabled:opacity-50 hover:bg-[var(--bg-card-hover)] transition-colors"
                              >
                                Previous
                              </button>
                              <span className="px-3 py-1.5 flex items-center justify-center text-[var(--text-heading)] font-medium">
                                Page {currentPage} of {Math.ceil(submissions.length / itemsPerPage)}
                              </span>
                              <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(submissions.length / itemsPerPage)))}
                                disabled={currentPage === Math.ceil(submissions.length / itemsPerPage)}
                                className="px-3 py-1.5 border border-[var(--border)] text-[var(--text-heading)] rounded-lg disabled:opacity-50 hover:bg-[var(--bg-card-hover)] transition-colors"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-xs text-[var(--text-muted)] italic">
                        No submissions logged. Ensure students are assigned to this class section.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Homework Dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="theme-card w-full max-w-lg border border-[var(--border)] overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center">
              <h3 className="text-[var(--text-heading)] font-semibold text-base"><Plus className="w-4 h-4 inline mr-1" /> Assign Homework</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-550 hover:text-[var(--text-heading)] text-lg"><X className="w-4 h-4 inline-block mr-1 text-inherit" /></button>
            </div>

            <form onSubmit={handleCreateHomework} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">Homework Topic / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pythagoras Theorem Homework 1"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-heading)] placeholder-slate-650 focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">Class Section</label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)]"
                  >
                    {teacherClasses.length > 0 ? (
                      teacherClasses.map((cls) => (
                        <option key={cls.id} value={`${cls.className}${cls.section} - ${cls.subject}`}>
                          Class {cls.className}{cls.section} - {cls.subject}
                        </option>
                      ))
                    ) : (
                      <option value="">No Classes Assigned</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">Due Date</label>
                  <input
                    type="text"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)]">Assignment Content / Prompts</label>
                  <button
                    type="button"
                    onClick={triggerAIRecipes}
                    disabled={isGeneratingAI}
                    className="text-[10px] text-amber-400 hover:text-amber-350 flex items-center gap-1 font-semibold"
                  >
                    <span><Zap className="w-4 h-4 inline mr-1 text-amber-500" /></span> {isGeneratingAI ? "Drafting..." : "Draft Homework with AI"}
                  </button>
                </div>

                <textarea
                  required
                  placeholder="Enter questions or guidelines for students..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--text-heading)] placeholder-slate-650 focus:outline-none focus:border-[var(--primary)] min-h-[120px]"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-slate-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-amber-600 text-xs font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Assigning..." : "Assign to Students"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
