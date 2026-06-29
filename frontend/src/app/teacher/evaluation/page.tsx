"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";

interface Submission {
  id: string;
  studentName: string;
  rollNo: string;
  status: "pending" | "graded";
  score: number | null;
  totalMarks: number;
  submittedAt: string;
  ocrContent: {
    questionText: string;
    studentAnswer: string;
    aiScore: number;
    maxScore: number;
    aiRationale: string;
  }[];
}

export default function EvaluationPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubId, setSelectedSubId] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Grade Edit Form State
  const [manualOverrideScores, setManualOverrideScores] = useState<Record<string, number>>({});
  const [commentOverrides, setCommentOverrides] = useState<Record<string, string>>({});

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/teacher/evaluations?schoolId=${schoolId || ""}`);
      const result = await res.json();
      if (result.success && result.data) {
        setSubmissions(result.data);
        if (result.data.length > 0) {
          setSelectedSubId(result.data[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [schoolId]);

  const selectedSub = submissions.find((s) => s.id === selectedSubId) || submissions[0];

  const getQuestionScore = (subId: string, qIdx: number, defaultScore: number) => {
    const key = `${subId}-${qIdx}`;
    return manualOverrideScores[key] !== undefined ? manualOverrideScores[key] : defaultScore;
  };

  const handleScoreChange = (qIdx: number, val: string) => {
    const scoreVal = parseFloat(val) || 0;
    setManualOverrideScores({
      ...manualOverrideScores,
      [`${selectedSub.id}-${qIdx}`]: scoreVal,
    });
  };

  const handleCommentChange = (qIdx: number, val: string) => {
    setCommentOverrides({
      ...commentOverrides,
      [`${selectedSub.id}-${qIdx}`]: val,
    });
  };

  const calculateTotal = () => {
    if (!selectedSub) return 0;
    let sum = 0;
    selectedSub.ocrContent.forEach((q, idx) => {
      sum += getQuestionScore(selectedSub.id, idx, q.aiScore);
    });
    return sum;
  };

  const handleSubmitEvaluation = async () => {
    if (!selectedSub) return;
    const finalScore = calculateTotal();

    // Map updated score and overrides to OCR content structure if needed
    const updatedOcr = selectedSub.ocrContent.map((q, idx) => {
      const overScore = getQuestionScore(selectedSub.id, idx, q.aiScore);
      const overComment = commentOverrides[`${selectedSub.id}-${idx}`];
      return {
        ...q,
        aiScore: overScore,
        aiRationale: overComment ? `${q.aiRationale} (Teacher comment: ${overComment})` : q.aiRationale,
      };
    });

    try {
      const res = await fetch(`${API_URL}/api/teacher/evaluations/${selectedSub.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: finalScore,
          status: "graded",
          ocrContent: updatedOcr,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setSubmissions(
          submissions.map((sub) => (sub.id === selectedSub.id ? result.data : sub))
        );
        Swal.fire({
          icon: "success",
          title: "Evaluation Submitted!",
          text: `Grading submitted successfully for ${selectedSub.studentName}! Final Score: ${finalScore}/${selectedSub.totalMarks}`,
          confirmButtonColor: "#10b981",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text: result.error || "Failed to submit evaluation.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error("Error submitting evaluation:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  return (
    <PortalLayout
      title="AI Evaluation"
      subtitle="Verify OCR-digitized student papers and leverage AI-assisted grading"
    >
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-emerald-500 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2">
          <span>✅</span> {toastMessage}
        </div>
      )}
      {loading ? (
        <div className="text-center py-12 text-xs text-[var(--text-muted)]">Loading AI evaluation queue...</div>
      ) : submissions.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Submissions List Panel */}
          <div className="xl:col-span-1 flex flex-col gap-4">
            <div className="theme-card p-4">
              <h3 className="text-[var(--text-heading)] font-semibold text-xs mb-3 uppercase tracking-wider">📄 Submissions</h3>
              
              <div className="flex flex-col gap-2">
                {submissions.map((sub) => {
                  const isSelected = sub.id === selectedSubId;
                  const total = sub.score !== null ? sub.score : "—";
                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setSelectedSubId(sub.id);
                      }}
                      className={`text-left p-3 rounded-xl border transition-all text-xs ${
                        isSelected
                          ? "border-[var(--primary)]/80 bg-[var(--primary)]/5"
                          : "border-[var(--border)] hover:bg-[var(--bg-card)]/40"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-[var(--text-heading)]">{sub.studentName}</span>
                        <span className={`badge ${sub.status === "graded" ? "badge-green" : "badge-yellow"}`}>
                          {sub.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">Roll No: {sub.rollNo}</div>
                      <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-[var(--border)]/60 text-[10px]">
                        <span className="text-[var(--text-muted)]">{sub.submittedAt}</span>
                        <span className="text-[var(--text-heading)] font-semibold">
                          Grade: {total} / {sub.totalMarks}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
 
          {/* Evaluation Desk */}
          {selectedSub && (
            <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Student Answer Sheet (Digitized) */}
              <div className="theme-card p-5 flex flex-col h-[500px]">
                <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3 mb-4">
                  <span className="text-lg">📝</span>
                  <div>
                    <h3 className="text-[var(--text-heading)] font-semibold text-xs">Digitized Answer Paper</h3>
                    <p className="text-[10px] text-[var(--text-muted)]">Auto-extracted OCR handwriting transcript</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs text-slate-350">
                  {selectedSub.ocrContent.map((q, idx) => (
                    <div key={idx} className="bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] p-4 rounded-xl border border-[var(--border)] space-y-2">
                      <div className="text-[var(--text-heading)] font-bold text-[11px]">{q.questionText}</div>
                      <div className="p-3 bg-[var(--bg-main)]/40 border border-[var(--border)] rounded-lg text-[var(--text-main)] font-mono text-[11px] leading-relaxed italic">
                        &quot;{q.studentAnswer}&quot;
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI grading & override panel */}
              <div className="theme-card p-5 flex flex-col h-[500px] justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🤖</span>
                      <div>
                        <h3 className="text-[var(--text-heading)] font-semibold text-xs">AI Feedback Workspace</h3>
                        <p className="text-[10px] text-[var(--text-muted)]">Edit scores and insert diagnostic remarks</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-550 text-[10px] block">Sum Score</span>
                      <span className="text-[var(--text-heading)] font-bold text-base">{calculateTotal()} / {selectedSub.totalMarks}</span>
                    </div>
                  </div>

                  <div className="overflow-y-auto max-h-[340px] space-y-4 pr-1">
                    {selectedSub.ocrContent.map((q, idx) => {
                      const currentScore = getQuestionScore(selectedSub.id, idx, q.aiScore);
                      const currentComment = commentOverrides[`${selectedSub.id}-${idx}`] || "";
                      return (
                        <div key={idx} className="p-4 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] rounded-xl border border-[var(--border)] space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-[var(--primary)] text-[10px]">QUESTION {idx + 1} ASSESSMENT</span>
                            
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="text-[var(--text-muted)] text-[10px]">Points:</span>
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max={q.maxScore}
                                value={currentScore}
                                onChange={(e) => handleScoreChange(idx, e.target.value)}
                                className="w-12 bg-[var(--bg-main)] border border-[var(--border)] rounded px-1.5 py-0.5 text-center text-[var(--text-heading)] font-bold"
                              />
                              <span className="text-[var(--text-muted)] text-[10px]">/ {q.maxScore}</span>
                            </div>
                          </div>

                          <div className="text-[11px] text-[var(--text-muted)] leading-relaxed bg-[var(--bg-main)]/40 p-2.5 rounded border border-[var(--border)]">
                            <span className="text-amber-400 font-bold block mb-0.5 text-[9px] uppercase">AI Rationale:</span>
                            {q.aiRationale}
                          </div>

                          <div>
                            <input
                              type="text"
                              placeholder="Add teacher override comment (optional)..."
                              value={currentComment}
                              onChange={(e) => handleCommentChange(idx, e.target.value)}
                              className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-[11px] text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] placeholder-slate-700"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex gap-3">
                  <button
                    onClick={() => {
                      setManualOverrideScores({});
                      setCommentOverrides({});
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-slate-850 transition-colors"
                  >
                    🔄 Reset AI Grades
                  </button>
                  <button
                    onClick={handleSubmitEvaluation}
                    className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-amber-600 text-xs font-bold text-white transition-colors"
                  >
                    💾 Submit Evaluation
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-xs text-[var(--text-muted)] italic">
          No evaluations pending for this school.
        </div>
      )}
    </PortalLayout>
  );
}
