"use client";

import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

interface TeachingStep {
  step: string;
  minutes: number;
  description: string;
}

interface UnitDetail {
  keyConcepts: string[];
  realLifeConnections: string[];
  commonMisconceptions: string[];
  teachingFlow: TeachingStep[];
  teacherScript: string;
  studentKeyPoints: string[];
}

interface UnitInfo {
  id: string;
  name: string;
  unitNumber: number;
  isApproved: boolean;
  subject: { id: string; name: string; class: string; icon: string | null; color: string | null };
}

export default function TeacherUnitDetailPage() {
  const params = useParams();
  const unitId = params.unitId as string;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [unit, setUnit] = useState<UnitInfo | null>(null);
  const [infographicUrl, setInfographicUrl] = useState<string | null>(null);
  const [detail, setDetail] = useState<UnitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadUnit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/units/${unitId}`);
      const json = await res.json();
      if (json.success) {
        setUnit(json.data.unit);
        setInfographicUrl(json.data.infographic?.fileUrl || null);
        setDetail(json.data.unitDetail);
      } else {
        setError(json.error || "Unit not found");
      }
    } catch (e) {
      setError("Could not load this unit.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  const handleGenerate = async (regenerate: boolean) => {
    setGenerating(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/units/${unitId}/generate-detail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerate }),
      });
      const json = await res.json();
      if (json.success) {
        setDetail(json.data);
        setSuccessMsg(regenerate ? "Regenerated with AI." : "AI lesson insights generated.");
      } else {
        setError(json.error || "AI generation failed.");
      }
    } catch (e) {
      setError("AI generation failed. Check that the backend and GEMINI_API_KEY are configured.");
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (isApproved: boolean) => {
    if (!detail) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/units/${unitId}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved, editedDetail: detail }),
      });
      const json = await res.json();
      if (json.success) {
        setUnit((prev) => (prev ? { ...prev, isApproved } : prev));
        setSuccessMsg(isApproved ? "Published to students! ✅" : "Unpublished.");
      } else {
        setError(json.error || "Could not update approval status.");
      }
    } catch (e) {
      setError("Could not update approval status.");
    } finally {
      setSaving(false);
    }
  };

  const updateList = (field: "keyConcepts" | "realLifeConnections" | "commonMisconceptions" | "studentKeyPoints", index: number, value: string) => {
    if (!detail) return;
    const next = { ...detail, [field]: detail[field].map((v, i) => (i === index ? value : v)) };
    setDetail(next);
  };

  const updateFlowStep = (index: number, key: keyof TeachingStep, value: string | number) => {
    if (!detail) return;
    const next = { ...detail, teachingFlow: detail.teachingFlow.map((s, i) => (i === index ? { ...s, [key]: value } : s)) };
    setDetail(next);
  };

  const accent = unit?.subject.color || "#f59e0b";

  return (
    <PortalLayout
      title="Unit Lesson Insights"
      subtitle="AI-assisted planning for how to teach and present this unit."
      avatarLetter="S"
      avatarColor="#f59e0b"
      themeClass="theme-teacher"
      accentColor="#f59e0b"
    >
      <Link
        href="/teacher/syllabus-board"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-black dark:hover:text-white mb-6"
      >
        ← Back to Syllabus Board
      </Link>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin mb-3" />
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider animate-pulse">Loading unit...</p>
        </div>
      ) : !unit ? (
        <div className="text-center p-12 glass rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{error || "Unit not found."}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-6 flex flex-col md:flex-row gap-6 items-start">
            {infographicUrl && (
              <img src={infographicUrl} alt={unit.name} className="w-full md:w-80 rounded-2xl border border-slate-200 dark:border-slate-800 flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {unit.subject.name} · Class {unit.subject.class} · Unit {unit.unitNumber}
                </span>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg ${
                    unit.isApproved
                      ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                      : "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {unit.isApproved ? "✅ Published to Students" : "📝 Draft — Not Visible to Students"}
                </span>
              </div>
              <h2 className="text-2xl font-black text-black dark:text-white mt-3">{unit.name}</h2>
              <p className="text-xs text-slate-500 mt-2 max-w-xl">
                Generate AI lesson insights below, tweak anything that needs adjusting, then publish so students see a simplified version on their own syllabus board.
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => handleGenerate(!!detail)}
                  disabled={generating}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-60"
                  style={{ background: accent }}
                >
                  {generating ? "✨ Generating with AI..." : detail ? "🔁 Regenerate with AI" : "✨ Generate AI Lesson Insights"}
                </button>
                {detail && (
                  <button
                    onClick={() => handleApprove(!unit.isApproved)}
                    disabled={saving}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-60 ${
                      unit.isApproved
                        ? "border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {saving ? "Saving..." : unit.isApproved ? "Unpublish" : "✅ Approve & Publish to Students"}
                  </button>
                )}
              </div>

              {error && <p className="text-xs text-rose-600 mt-3 font-semibold">⚠️ {error}</p>}
              {successMsg && <p className="text-xs text-emerald-600 mt-3 font-semibold">{successMsg}</p>}
            </div>
          </div>

          {!detail && !generating && (
            <div className="text-center p-14 glass rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
              <span className="text-5xl block mb-4">🧑‍🏫</span>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No lesson insights yet for this unit.</p>
              <p className="text-xs text-slate-500 mt-2">Click "Generate AI Lesson Insights" above — this calls Gemini live and takes a few seconds.</p>
            </div>
          )}

          {detail && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Key Concepts */}
              <EditableListCard
                title="🧠 Key Concepts"
                subtitle="What students must walk away understanding"
                items={detail.keyConcepts}
                accent={accent}
                onChange={(i, v) => updateList("keyConcepts", i, v)}
              />

              {/* Real-life connections */}
              <EditableListCard
                title="🌍 Real-life Connections"
                subtitle="Concrete examples to make it relatable"
                items={detail.realLifeConnections}
                accent={accent}
                onChange={(i, v) => updateList("realLifeConnections", i, v)}
              />

              {/* Common misconceptions */}
              <EditableListCard
                title="⚠️ Common Misconceptions"
                subtitle="Pre-empt these before they take root"
                items={detail.commonMisconceptions}
                accent={accent}
                onChange={(i, v) => updateList("commonMisconceptions", i, v)}
              />

              {/* Student key points preview */}
              <EditableListCard
                title="🎯 Student Key Points"
                subtitle="Simplified takeaways students will see once published"
                items={detail.studentKeyPoints}
                accent={accent}
                onChange={(i, v) => updateList("studentKeyPoints", i, v)}
              />

              {/* Teaching flow timeline */}
              <div className="lg:col-span-2 glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-6">
                <h3 className="text-sm font-black text-black dark:text-white mb-1">⏱️ Suggested Teaching Flow</h3>
                <p className="text-xs text-slate-500 mb-4">A ready lesson pacing for a ~45 minute period</p>
                <div className="flex flex-col md:flex-row gap-3 overflow-x-auto pb-2">
                  {detail.teachingFlow.map((step, i) => (
                    <div
                      key={i}
                      className="flex-1 min-w-[180px] rounded-2xl border p-4"
                      style={{ borderColor: `${accent}33`, background: `${accent}0a` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <input
                          value={step.step}
                          onChange={(e) => updateFlowStep(i, "step", e.target.value)}
                          className="font-bold text-xs bg-transparent border-0 focus:outline-none w-2/3"
                          style={{ color: accent }}
                        />
                        <input
                          type="number"
                          value={step.minutes}
                          onChange={(e) => updateFlowStep(i, "minutes", Number(e.target.value))}
                          className="w-12 text-right text-[10px] font-bold bg-transparent border-0 focus:outline-none text-slate-400"
                        />
                        <span className="text-[10px] text-slate-400 -ml-1">min</span>
                      </div>
                      <textarea
                        value={step.description}
                        onChange={(e) => updateFlowStep(i, "description", e.target.value)}
                        rows={3}
                        className="w-full text-[11px] text-slate-600 dark:text-slate-300 bg-transparent border-0 resize-none focus:outline-none leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Teacher script */}
              <div className="lg:col-span-2 glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-6">
                <h3 className="text-sm font-black text-black dark:text-white mb-1">🗣️ How I'd Explain This to My Class</h3>
                <p className="text-xs text-slate-500 mb-4">A ready-to-use spoken introduction — edit it to match your own voice</p>
                <textarea
                  value={detail.teacherScript}
                  onChange={(e) => setDetail({ ...detail, teacherScript: e.target.value })}
                  rows={8}
                  className="w-full text-sm leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50/60 dark:bg-slate-950/30 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 focus:outline-none resize-y"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </PortalLayout>
  );
}

function EditableListCard({
  title,
  subtitle,
  items,
  accent,
  onChange,
}: {
  title: string;
  subtitle: string;
  items: string[];
  accent: string;
  onChange: (index: number, value: string) => void;
}) {
  return (
    <div className="glass rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-6">
      <h3 className="text-sm font-black text-black dark:text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-500 mb-4">{subtitle}</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accent }} />
            <textarea
              value={item}
              onChange={(e) => onChange(i, e.target.value)}
              rows={2}
              className="flex-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300 bg-transparent border-0 resize-none focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-950/30 rounded-lg px-1"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
