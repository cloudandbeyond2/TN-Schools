"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

interface Milestone {
  id: number | string;
  year: string;
  title: string;
  details: string;
  icon: string;
}

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

export default function HistoryPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const schoolId: string = (session?.user as any)?.schoolId || "";

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [schoolName, setSchoolName] = useState("");
  const [schoolDise, setSchoolDise] = useState("");

  // Milestone Form State
  const [newYear, setNewYear] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | number | null>(null);
  const [historyToast, setHistoryToast] = useState<string | null>(null);

  const fetchMilestones = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      // 1. Fetch history milestones
      const res = await fetch(`${API_BASE}/api/headmaster/history?schoolId=${schoolId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setMilestones(json.data);
      }

      // 2. Fetch school config for header subtitle
      const portalRes = await fetch(`${API_BASE}/api/school-portal/${schoolId}`);
      const portalJson = await portalRes.json();
      if (portalJson.success && portalJson.data) {
        setSchoolName(portalJson.data.school?.name || "");
        setSchoolDise(portalJson.data.school?.dise || "");
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const handleStartEdit = (ms: Milestone) => {
    setEditingMilestoneId(ms.id);
    setNewYear(ms.year);
    setNewTitle(ms.title);
    setNewDetails(ms.details);
  };

  const handleCancelEdit = () => {
    setEditingMilestoneId(null);
    setNewYear("");
    setNewTitle("");
    setNewDetails("");
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYear || !newTitle || !newDetails || !schoolId) return;

    try {
      const isEditing = editingMilestoneId !== null;
      const url = isEditing
        ? `${API_BASE}/api/headmaster/history/${editingMilestoneId}`
        : `${API_BASE}/api/headmaster/history`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId,
          year: newYear,
          title: newTitle,
          details: newDetails,
          icon: isEditing
            ? milestones.find(m => String(m.id) === String(editingMilestoneId))?.icon || "📜"
            : "📜"
        })
      });
      const json = await res.json();
      if (json.success) {
        setHistoryToast(
          isEditing
            ? `✓ Historical milestone for year ${newYear} updated in school archive!`
            : `✓ Historical milestone for year ${newYear} logged and sorted into school archive!`
        );
        setNewYear("");
        setNewTitle("");
        setNewDetails("");
        setEditingMilestoneId(null);
        fetchMilestones();
      } else {
        Swal.fire("Error", json.error || `Failed to ${isEditing ? "update" : "add"} milestone`, "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Server error during submit", "error");
    }

    setTimeout(() => setHistoryToast(null), 4000);
  };

  const handleDeleteMilestone = (id: string | number, year: string) => {
    Swal.fire({
      title: "Delete Milestone?",
      text: `Are you sure you want to remove the milestone for year ${year}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3b82f6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API_BASE}/api/headmaster/history/${id}?schoolId=${schoolId}`, {
            method: "DELETE"
          });
          const json = await res.json();
          if (json.success) {
            Swal.fire({
              title: "Deleted!",
              text: "Milestone has been removed.",
              icon: "success",
              confirmButtonColor: "#3b82f6"
            });
            fetchMilestones();
          } else {
            Swal.fire("Error", json.error || "Failed to delete milestone", "error");
          }
        } catch (err) {
          console.error(err);
          Swal.fire("Error", "Server error during deletion", "error");
        }
      }
    });
  };

  const getMilestoneIcon = (iconStr: string) => {
    const s = iconStr || "";
    if (s === "🏫") return <i className="fi fi-rr-school text-xs text-blue-400" />;
    if (s === "📐") return <i className="fi fi-rr-ruler-combined text-xs text-blue-400" />;
    if (s === "🔬") return <i className="fi fi-rr-flask text-xs text-blue-400" />;
    if (s === "💻") return <i className="fi fi-rr-laptop text-xs text-blue-400" />;
    if (s === "🤖") return <i className="fi fi-rr-bot text-xs text-blue-400" />;
    return <i className="fi fi-rr-document text-xs text-blue-400" />;
  };

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "பள்ளி வரலாறு & காலவரிசை காலக்கோற்" : "School History & Archival Timeline"}
      subtitle={`${schoolName || "GHS Coimbatore"} · DISE: ${schoolDise || "33012345"}`}
      avatarLetter="V"
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 text-left">
        {/* Timeline Visual Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-4 sm:p-6 border border-slate-800">
            <h2 className="text-sm sm:text-base font-semibold text-white mb-1 flex items-center gap-2">
              <i className="fi fi-rr-calendar-clock text-blue-500" /> {lang === "தமிழ்" ? "மைல்கல் காலவரிசை (1955 முதல்)" : "Milestone Timeline (Since 1955)"}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
              {lang === "தமிழ்" ? "பள்ளி கட்டமைப்பு, சேர்க்கை இலக்குகள் மற்றும் முக்கிய கல்வி மைல்கல்களின் வரலாறு வளர்ச்சி." : "Historical evolution of school infrastructure, enrollment benchmarks, and major academic milestones."}
            </p>
          </div>

          <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-8">
            {loading ? (
              <div className="text-center py-6 text-slate-500 font-bold text-xs">
                {lang === "தமிழ்" ? "மைல்கல்கள் ஏற்றப்படுகின்றன..." : "Loading milestones..."} <i className="fi fi-rr-hourglass text-sm animate-spin inline-block ml-1" />
              </div>
            ) : milestones.map((ms) => (
              <div key={ms.id} className="relative group">
                {/* Timeline Dot */}
                <span className="absolute -left-[35px] top-0.5 w-6 h-6 rounded-full bg-slate-900 border-2 border-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {getMilestoneIcon(ms.icon)}
                </span>

                <div className="glass rounded-2xl p-5 border border-slate-800 hover:border-slate-750 transition-colors relative">
                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleStartEdit(ms)}
                      className="p-1.5 bg-slate-900/80 hover:bg-blue-600 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
                      title="Edit Milestone"
                    >
                      <i className="fi fi-rr-edit text-xs" />
                    </button>
                    <button
                      onClick={() => handleDeleteMilestone(ms.id, ms.year)}
                      className="p-1.5 bg-slate-900/80 hover:bg-red-650 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
                      title="Remove Milestone"
                    >
                      <i className="fi fi-rr-trash text-xs" />
                    </button>
                  </div>

                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
                    {ms.year}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-2 mb-1 pr-10">{ms.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{ms.details}</p>
                </div>
              </div>
            ))}

            {!loading && milestones.length === 0 && (
              <div className="text-center py-6 text-slate-500 italic text-xs">
                No historical milestones recorded yet. Add some on the right.
              </div>
            )}
          </div>
        </div>

        {/* Archival entry workspace */}
        <div className="glass rounded-2xl p-4 sm:p-6 border border-slate-800 h-fit">
          <h2 className="text-sm sm:text-base font-semibold text-white mb-2 flex items-center gap-2">
            <i className="fi fi-rr-edit text-blue-500" /> {editingMilestoneId !== null ? "Edit Campus Milestone" : "Document Campus Milestone"}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed mb-4 font-medium">
            {editingMilestoneId !== null
              ? "Modify the selected historical milestone details, calendar year, or description archive details."
              : "Log construction expansions, national honors, or notable alumni visits to the permanent history books."}
          </p>

          <form onSubmit={handleAddMilestone} className="space-y-4">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1.5 font-semibold">Calendar Year</label>
              <input
                type="number"
                min="1900"
                max="2100"
                placeholder="E.g., 2018"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1.5 font-semibold">Milestone Event Title</label>
              <input
                type="text"
                placeholder="E.g., Opening of Library Block"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1.5 font-semibold">Description / Historical Context</label>
              <textarea
                value={newDetails}
                onChange={(e) => setNewDetails(e.target.value)}
                placeholder="Detailed summary of the expansion, donation amount, or key figures..."
                rows={4}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className={`py-2.5 font-bold rounded-xl text-xs transition-colors cursor-pointer ${
                  editingMilestoneId !== null ? "w-2/3 bg-blue-600 hover:bg-blue-700 text-white" : "w-full bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {editingMilestoneId !== null ? "Save Changes" : "Add to School Archives"}
              </button>
              {editingMilestoneId !== null && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer border border-slate-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {historyToast && (
            <div className="mt-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl leading-relaxed">
              {historyToast}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
