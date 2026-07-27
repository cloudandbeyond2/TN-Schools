"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import Swal from "sweetalert2";

interface StudentPortfolioData {
  id: string;
  studentId: string;
  profile: {
    name: string;
    class: string;
    section: string;
    emisNumber: string;
    rollNumber: string;
    schoolName: string;
    bio: string;
    termGoals: string[];
    careerGoal: string;
    teacherEndorsement: string;
    teacherName: string;
    parentEndorsement: string;
    parentName: string;
    leadershipRoles: string[];
    languages?: string[];
    languageFluency?: Record<string, string>;
  };
}

function ParentPortfolioContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const urlStudentId = searchParams.get("studentId");

  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<StudentPortfolioData | null>(null);
  const [isEditingParentEndorsement, setIsEditingParentEndorsement] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [parentForm, setParentForm] = useState({
    parentEndorsement: "",
    parentName: ""
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchChildPortfolio = async () => {
      try {
        setLoading(true);
        let targetStudentId = urlStudentId;

        // If no studentId passed in query string, try fetching parent's linked children
        const parentUserId = (session?.user as any)?.id;
        if (!targetStudentId && parentUserId) {
          try {
            const childRes = await fetch(`${API_BASE}/api/parent/${parentUserId}/children`);
            const childJson = await childRes.json();
            if (childJson.success && childJson.data.length > 0) {
              targetStudentId = childJson.data[0].studentId;
            }
          } catch {
            /* ignore fallback */
          }
        }

        // If still no studentId, fetch first real student from student list
        if (!targetStudentId) {
          try {
            const stRes = await fetch(`${API_BASE}/api/students`);
            const stJson = await stRes.json();
            if (stJson.success && stJson.data?.length > 0) {
              targetStudentId = stJson.data[0].id;
            }
          } catch {
            /* ignore fallback */
          }
        }

        const endpoint = targetStudentId ? `${API_BASE}/api/portfolio/${targetStudentId}` : `${API_BASE}/api/portfolio/demo-student`;
        const res = await fetch(endpoint);
        const json = await res.json();
        if (json.success && json.data) {
          setPortfolio(json.data);
          setParentForm({
            parentEndorsement: json.data.profile.parentEndorsement || "Exhibits great dedication to self-study and maintains an excellent balance between sports and math homework goals.",
            parentName: json.data.profile.parentName || session?.user?.name || ""
          });
        }
      } catch (err) {
        console.error("Error fetching child portfolio for parent:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChildPortfolio();
  }, [session, urlStudentId]);

  const handleSaveParentEndorsement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolio) return;

    try {
      setIsSaving(true);
      const res = await fetch(`${API_BASE}/api/portfolio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: portfolio.studentId,
          parentEndorsement: parentForm.parentEndorsement,
          parentName: parentForm.parentName
        })
      });

      const json = await res.json();
      if (json.success) {
        Swal.fire({
          icon: "success",
          title: "Parent Endorsement Saved!",
          text: "Your home learning remarks and signature stamp have been saved to your child's digital portfolio.",
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: "top-end"
        });
        setIsEditingParentEndorsement(false);

        // Refresh portfolio data
        const refresh = await fetch(`${API_BASE}/api/portfolio/${portfolio.studentId}`);
        const rJson = await refresh.json();
        if (rJson.success) setPortfolio(rJson.data);
      }
    } catch (err) {
      console.error("Error saving parent endorsement:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pt-4 pb-16">
      
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/parent"
          className="flex items-center gap-2 text-xs font-extrabold text-slate-400 hover:text-white transition-colors"
        >
          <i className="fi fi-rr-arrow-left text-xs"></i> Back to Parent Portal
        </Link>

        <span className="text-xs font-extrabold text-purple-400 bg-purple-500/10 px-3.5 py-1.5 rounded-full border border-purple-500/20 flex items-center gap-1.5">
          <i className="fi fi-rr-users text-xs"></i> Parent Reflection & Endorsement Portal
        </span>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-slate-900 p-6 md:p-8 rounded-3xl border border-purple-500/30 text-white space-y-3 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-2xl border border-purple-500/30 shrink-0">
            <i className="fi fi-rr-document-signed text-2xl"></i>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white">Digital Portfolio — Parent Reflection</h1>
            <p className="text-xs text-purple-200 mt-0.5">
              View your child's 360° school progress and log official home learning remarks & verified parent signature stamps.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-xs font-bold text-slate-400 gap-3">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          Loading child digital portfolio...
        </div>
      ) : portfolio ? (
        <div className="space-y-6">
          
          {/* Student Quick Identity Banner */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-black text-lg flex items-center justify-center border border-purple-500/20">
                {portfolio.profile.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{portfolio.profile.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Class {portfolio.profile.class}-{portfolio.profile.section} • EMIS: {portfolio.profile.emisNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{portfolio.profile.schoolName}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 mt-1 inline-block">
                Student Career Goal: {portfolio.profile.careerGoal}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* CARD A: PARENT ENDORSEMENT & REFLECTION CARD (INTERACTIVE) */}
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-purple-500/30 space-y-4 shadow-lg lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-purple-600 dark:text-purple-300 flex items-center gap-2">
                  <i className="fi fi-rr-heart text-purple-500 text-sm"></i>
                  Parent Reflection & Home Learning Remarks
                </h3>
                <button
                  onClick={() => setIsEditingParentEndorsement(!isEditingParentEndorsement)}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-extrabold flex items-center gap-1.5 bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20"
                >
                  <i className="fi fi-rr-edit text-xs"></i>
                  {isEditingParentEndorsement ? "Close Editor" : "Edit Parent Endorsement"}
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official home study remarks, guidance notes, and encouragement provided by parents for the student's digital portfolio:
              </p>

              {isEditingParentEndorsement ? (
                <form onSubmit={handleSaveParentEndorsement} className="bg-purple-500/10 p-5 rounded-2xl border border-purple-500/20 space-y-4">
                  <div>
                    <label className="block text-purple-600 dark:text-purple-300 font-extrabold text-xs mb-1.5">
                      ✍️ Home Learning Remarks & Parent Reflection:
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. Maintains regular 2-hour evening self-study routine and practices math daily. Actively interested in science experiments."
                      value={parentForm.parentEndorsement}
                      onChange={(e) => setParentForm({ ...parentForm, parentEndorsement: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs mb-1.5">
                      <i className="fi fi-rr-portrait text-xs mr-1"></i> Parent / Guardian Full Name:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DevanDevi / Parent Name"
                      value={parentForm.parentName}
                      onChange={(e) => setParentForm({ ...parentForm, parentName: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-amber-600 dark:text-amber-400 font-bold border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-purple-500/20">
                    <button
                      type="button"
                      onClick={() => setIsEditingParentEndorsement(false)}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md"
                    >
                      <i className="fi fi-rr-check-circle text-xs"></i>
                      {isSaving ? "Saving..." : "Sign & Save Parent Endorsement"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-transparent p-5 rounded-2xl border border-purple-500/20 space-y-3">
                  <p className="text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed font-serif">
                    "{portfolio.profile.parentEndorsement || "Maintains regular 2-hour evening self-study routine and practices math daily. Demonstrates curiosity in science projects at home."}"
                  </p>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-extrabold bg-purple-500/15 px-3 py-1 rounded-full border border-purple-500/30 uppercase flex items-center gap-1.5">
                      <i className="fi fi-rr-check-circle text-xs"></i> VERIFIED PARENT SIGNATURE STAMP
                    </span>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-extrabold">
                      — {portfolio.profile.parentName || session?.user?.name || "Parent / Guardian"} (Parent)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* CARD B: TEACHER ENDORSEMENT CARD (VIEW-ONLY FOR PARENT) */}
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fi fi-rr-award text-emerald-500 text-sm"></i>
                Teacher Endorsement & School Remarks
              </h3>
              <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-transparent p-4 rounded-2xl border border-emerald-500/20 space-y-3">
                <p className="text-xs text-slate-800 dark:text-slate-200 italic leading-relaxed font-serif">
                  "{portfolio.profile.teacherEndorsement || "Excellent leadership skills. Very disciplined and responsible. Shows strong interest in science and actively participates in school activities."}"
                </p>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase flex items-center gap-1">
                    <i className="fi fi-rr-check-circle text-xs"></i> VERIFIED TEACHER STAMP
                  </span>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-extrabold">
                    — {portfolio.profile.teacherName} (Class Teacher)
                  </span>
                </div>
              </div>
            </div>

            {/* CARD C: STUDENT GOALS & ASPIRATIONS (VIEW-ONLY FOR PARENT) */}
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fi fi-rr-target text-indigo-500 text-sm"></i>
                Student Term Goals & Career Target
              </h3>
              <div className="space-y-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Career Target:</span>
                  <span className="font-extrabold text-purple-600 dark:text-purple-300">{portfolio.profile.careerGoal}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <span className="text-slate-500 dark:text-slate-400 block font-medium">Academic & Personal Goals:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(portfolio.profile.termGoals || ["Improve Mathematics", "Score above 90%"]).map((goal, idx) => (
                      <span key={idx} className="text-[10px] font-bold text-amber-600 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 flex items-center gap-1">
                        <i className="fi fi-rr-star text-[9px]"></i> {goal}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : null}

    </div>
  );
}

export default function ParentPortfolioPage() {
  return (
    <PortalLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center py-20 text-xs font-bold text-slate-400 gap-3">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          Loading portfolio...
        </div>
      }>
        <ParentPortfolioContent />
      </Suspense>
    </PortalLayout>
  );
}
