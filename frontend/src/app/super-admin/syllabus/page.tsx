"use client";

import { useState, useEffect } from "react";
import PortalLayout from "@/components/PortalLayout";

interface Topic {
  id: string;
  name: string;
  topicNumber: number;
}

interface Unit {
  id: string;
  subjectId: string;
  name: string;
  unitNumber: number;
  isApproved: boolean;
  isAiMapped: boolean;
  topics: Topic[];
}

interface Subject {
  id: string;
  name: string;
  class: string;
  icon: string | null;
  color: string | null;
  units: Unit[];
}

export default function SyllabusManagement() {
  const [selectedClass, setSelectedClass] = useState<string>("Class 10");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [loadingSubjects, setLoadingSubjects] = useState<boolean>(false);
  
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapter, setNewChapter] = useState({ title: "", topics: 5 });
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Auto hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch subjects with nested units/topics
  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const classNum = selectedClass.replace("Class ", "");
      const res = await fetch(`${API_URL}/api/centralized-content/academics-dashboard?class=${classNum}`);
      const json = await res.json();
      if (json.success) {
        setSubjects(json.data);
        if (json.data.length > 0) {
          // Keep current selection if it still exists, else select first
          const exists = json.data.some((s: Subject) => s.id === selectedSubjectId);
          if (exists) {
             // select the same
          } else {
             setSelectedSubjectId(json.data[0].id);
          }
        } else {
          setSelectedSubjectId("");
        }
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setToast({ message: "Failed to load subjects from database", type: "error" });
    } finally {
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [selectedClass]);

  const subject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const units = subject?.units || [];

  const toggleChapter = async (subjectId: string, unitId: string, currentApproved: boolean) => {
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/units/${unitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !currentApproved })
      });
      const json = await res.json();
      if (json.success) {
        setToast({ message: `Unit status updated!`, type: "success" });
        setSubjects((prev) => prev.map((sub) => {
          if (sub.id !== subjectId) return sub;
          return {
            ...sub,
            units: sub.units.map((u) => u.id === unitId ? { ...u, isApproved: !currentApproved } : u)
          };
        }));
      } else {
        setToast({ message: json.error || "Failed to update unit", type: "error" });
      }
    } catch (err) {
      console.error("Error toggling chapter:", err);
      setToast({ message: "Network error occurred", type: "error" });
    }
  };

  const toggleAI = async (subjectId: string, unitId: string, currentAiMapped: boolean) => {
    try {
      const res = await fetch(`${API_URL}/api/centralized-content/units/${unitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAiMapped: !currentAiMapped })
      });
      const json = await res.json();
      if (json.success) {
        setToast({ message: `AI mapping updated!`, type: "success" });
        setSubjects((prev) => prev.map((sub) => {
          if (sub.id !== subjectId) return sub;
          return {
            ...sub,
            units: sub.units.map((u) => u.id === unitId ? { ...u, isAiMapped: !currentAiMapped } : u)
          };
        }));
      } else {
        setToast({ message: json.error || "Failed to update AI mapping", type: "error" });
      }
    } catch (err) {
      console.error("Error toggling AI mapping:", err);
      setToast({ message: "Network error occurred", type: "error" });
    }
  };

  const addChapter = async () => {
    if (!newChapter.title || !selectedSubjectId) return;
    try {
      const nextUnitNumber = (subject?.units?.length || 0) + 1;
      
      const res = await fetch(`${API_URL}/api/centralized-content/units`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          name: newChapter.title,
          unitNumber: nextUnitNumber
        })
      });
      const json = await res.json();
      if (json.success) {
        const createdUnit = json.data;
        // Create N placeholder topics
        for (let i = 1; i <= newChapter.topics; i++) {
          await fetch(`${API_URL}/api/centralized-content/topics`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              unitId: createdUnit.id,
              name: `Subtopic ${i}`,
              topicNumber: i
            })
          });
        }
        setToast({ message: `Unit '${newChapter.title}' and ${newChapter.topics} topics created successfully!`, type: "success" });
        setShowAddChapter(false);
        setNewChapter({ title: "", topics: 5 });
        fetchSubjects(); // Refresh subjects
      } else {
        setToast({ message: json.error || "Failed to add chapter", type: "error" });
      }
    } catch (err) {
      console.error("Error adding chapter:", err);
      setToast({ message: "Network error occurred", type: "error" });
    }
  };

  const filteredChapters = units.filter((ch) =>
    ch.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PortalLayout>
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

      <div className="mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <i className="fi fi-rr-book-alt text-amber-500"></i> Syllabus Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage state curriculum by class, subject, and chapter. Control AI mapping and chapter visibility.
        </p>
      </div>

      {/* Class Selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"].map((cls) => {
          const board = ["Class 11", "Class 12"].includes(cls) ? "HSC" : "SSLC";
          return (
            <button
              key={cls}
              onClick={() => {
                setSelectedClass(cls);
                setSelectedSubjectId("");
              }}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition border ${
                selectedClass === cls
                  ? "bg-amber-500 text-slate-900 border-amber-500"
                  : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-slate-500"
              }`}
            >
              {cls}
              <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded ${
                board === "SSLC" ? "bg-blue-500/20 text-blue-400" : "bg-violet-500/20 text-violet-400"
              }`}>
                {board}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Subject Sidebar */}
        <div className="glass rounded-2xl p-4 border border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Subjects</h3>
          {loadingSubjects ? (
            <div className="py-8 flex flex-col items-center">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-[10px] text-slate-500">Loading subjects...</span>
            </div>
          ) : subjects.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No subjects created for this standard.</p>
          ) : (
            <div className="space-y-2">
              {subjects.map((sub) => {
                const enabled = sub.units?.filter((u) => u.isApproved).length || 0;
                const aiMapped = sub.units?.filter((u) => u.isAiMapped).length || 0;
                const isSelected = sub.id === selectedSubjectId;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`w-full text-left rounded-xl p-3 transition border ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-slate-900/50 border-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {sub.icon && sub.icon.startsWith("<") ? (
                        <span className="text-base flex items-center justify-center" dangerouslySetInnerHTML={{ __html: sub.icon }} />
                      ) : (
                        <span className="text-base flex items-center justify-center">{sub.icon || "📚"}</span>
                      )}
                      <span className="text-xs font-semibold text-white">{sub.name}</span>
                    </div>
                    <div className="flex gap-3 text-[9px] text-slate-500 items-center">
                      <span className="flex items-center gap-1">
                        <i className="fi fi-rr-marker"></i> {enabled}/{sub.units?.length || 0} chapters
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fi fi-rr-robot"></i> {aiMapped} AI
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Chapters Panel */}
        <div className="lg:col-span-3 glass rounded-2xl p-5 border border-slate-800">
          {subject ? (
            <>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {subject.icon && subject.icon.startsWith("<") ? (
                      <span dangerouslySetInnerHTML={{ __html: subject.icon }} />
                    ) : (
                      <span>{subject.icon || "📚"}</span>
                    )}{" "}
                    {subject.name} — {selectedClass}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {units.length} chapters · {units.filter((c) => c.isApproved).length} enabled ·{" "}
                    {units.filter((c) => c.isAiMapped).length} AI-mapped
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search chapters..."
                    className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500 w-40"
                  />
                  <button
                    onClick={() => setShowAddChapter(true)}
                    className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                  >
                    <i className="fi fi-rr-plus"></i> Chapter
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[500px]">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="w-16">No</th>
                      <th>Chapter Title</th>
                      <th>Topics</th>
                      <th>AI Mapping</th>
                      <th className="text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredChapters.map((ch) => (
                      <tr key={ch.id} className={ch.isApproved ? "" : "opacity-60"}>
                        <td className="font-bold text-slate-500">{ch.unitNumber}</td>
                        <td>
                          <span className="text-xs font-semibold text-white">{ch.name}</span>
                        </td>
                        <td>{ch.topics ? ch.topics.length : 0} topics</td>
                        <td>
                          <button
                            onClick={() => toggleAI(subject.id, ch.id, ch.isAiMapped)}
                            title="Toggle AI Mapping"
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition flex items-center gap-1 w-fit ${
                              ch.isAiMapped
                                ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
                                : "text-slate-600 bg-slate-800 border-slate-700"
                            }`}
                          >
                            <i className="fi fi-rr-robot"></i> {ch.isAiMapped ? "ON" : "OFF"}
                          </button>
                        </td>
                        <td className="text-right">
                          <div className="flex justify-end">
                            <button
                              onClick={() => toggleChapter(subject.id, ch.id, ch.isApproved)}
                              className={`relative w-9 h-5 rounded-full transition-colors ${
                                ch.isApproved ? "bg-emerald-500" : "bg-slate-700"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                  ch.isApproved ? "translate-x-4" : "translate-x-0.5"
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs">
              Select a subject to display its chapters.
            </div>
          )}
        </div>
      </div>

      {/* Add Chapter Modal */}
      {showAddChapter && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <i className="fi fi-rr-plus text-amber-500"></i> Add Chapter
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Chapter Title</label>
                <input
                  value={newChapter.title}
                  onChange={(e) => setNewChapter((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Quadratic Equations"
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Number of Topics</label>
                <input
                  type="number"
                  value={newChapter.topics}
                  onChange={(e) => setNewChapter((f) => ({ ...f, topics: +e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowAddChapter(false)}
                className="flex-1 text-xs font-bold text-slate-400 bg-slate-800 py-2 rounded-lg border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={addChapter}
                className="flex-1 text-xs font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 py-2 rounded-lg transition"
              >
                Add Chapter
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
