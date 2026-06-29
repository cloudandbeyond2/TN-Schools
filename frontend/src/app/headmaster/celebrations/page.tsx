"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Swal from "sweetalert2";
import {
  PartyPopper,
  CalendarDays,
  Gift,
  Trash2,
  Plus,
  Loader2,
  Calendar,
  AlertCircle,
  Pencil
} from "lucide-react";

interface Celebration {
  id: string;
  title: string;
  date: string;
  description: string | null;
  type: string; // "EVENT" or "HOLIDAY"
  createdAt?: string;
}

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

export default function HeadmasterCelebrationsPage() {
  const { data: session } = useSession();
  const mySchoolId: string = (session?.user as any)?.schoolId || "";

  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("EVENT");

  const handleStartEdit = (item: Celebration) => {
    setEditingId(item.id);
    setTitle(item.title);
    const dateOnly = item.date ? item.date.substring(0, 10) : "";
    setDate(dateOnly);
    setDescription(item.description || "");
    setType(item.type);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setDate("");
    setDescription("");
    setType("EVENT");
  };

  // Fetch celebrations scoped to headmaster's school
  const fetchCelebrations = useCallback(async () => {
    if (!mySchoolId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/celebrations?schoolId=${mySchoolId}`);
      const json = await res.json();
      if (json.success) {
        setCelebrations(json.data);
      } else {
        Swal.fire({
          title: "Error!",
          text: "Could not load celebrations from server.",
          icon: "error",
          confirmButtonColor: "#ef4444"
        });
      }
    } catch {
      Swal.fire({
        title: "Error!",
        text: "Server offline — could not load celebrations.",
        icon: "error",
        confirmButtonColor: "#ef4444"
      });
    } finally {
      setIsLoading(false);
    }
  }, [mySchoolId]);

  useEffect(() => {
    fetchCelebrations();
  }, [fetchCelebrations]);

  // Handle adding or updating celebration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !mySchoolId) {
      Swal.fire({
        title: "Incomplete Form",
        text: "Please fill in all required fields.",
        icon: "warning",
        confirmButtonColor: "#3b82f6"
      });
      return;
    }

    setIsSaving(true);
    try {
      const url = editingId ? `${API_BASE}/api/celebrations/${editingId}` : `${API_BASE}/api/celebrations`;
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date,
          description: description || null,
          type,
          schoolId: mySchoolId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        Swal.fire({
          title: "Success!",
          text: editingId ? "Celebration updated successfully! 🎉" : "Celebration added successfully! 🎉",
          icon: "success",
          confirmButtonColor: "#3b82f6"
        });
        handleCancelEdit();
        fetchCelebrations();
      } else {
        Swal.fire({
          title: "Save Failed",
          text: json.error,
          icon: "error",
          confirmButtonColor: "#ef4444"
        });
      }
    } catch {
      Swal.fire({
        title: "Error!",
        text: "Server offline — could not save celebration.",
        icon: "error",
        confirmButtonColor: "#ef4444"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle deleting celebration
  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3b82f6",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_BASE}/api/celebrations/${id}`, {
          method: "DELETE",
        });
        const json = await res.json();
        if (json.success) {
          Swal.fire({
            title: "Deleted!",
            text: "Celebration removed successfully.",
            icon: "success",
            confirmButtonColor: "#3b82f6"
          });
          fetchCelebrations();
        } else {
          Swal.fire({
            title: "Failed!",
            text: `Failed to delete: ${json.error}`,
            icon: "error",
            confirmButtonColor: "#ef4444"
          });
        }
      } catch {
        Swal.fire({
          title: "Error!",
          text: "Server offline — delete failed.",
          icon: "error",
          confirmButtonColor: "#ef4444"
        });
      }
    }
  };

  const filteredCelebrations = celebrations.filter((c) => c.type === "EVENT");

  return (
    <PortalLayout
      title="Celebrations Manager"
      subtitle="Mr. Venkatesh R. · GHS Coimbatore · DISE: 33012345"
      avatarLetter="V"
      avatarColor="#3b82f6"
      themeClass="theme-headmaster"
      accentColor="#3b82f6"
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Columns - Celebration List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass rounded-2xl p-6 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <h2 className="text-base font-semibold text-white">🎉 Registered Celebrations & Events</h2>
              </div>
              <p className="text-xs text-slate-550 mb-2 leading-relaxed">
                Add school festivals and celebrations. These events will sync instantly to the Teacher Portal celebrations list.
              </p>
            </div>

            {/* List items */}
            {isLoading ? (
              <div className="glass rounded-2xl p-16 border border-slate-800 flex flex-col items-center justify-center text-slate-500 text-xs">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <span>Loading institution events...</span>
              </div>
            ) : filteredCelebrations.length === 0 ? (
              <div className="glass rounded-2xl p-16 border border-slate-800 text-center text-slate-500 text-xs italic">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                No events or celebrations found.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCelebrations.map((item) => (
                  <div
                    key={item.id}
                    className="glass rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Celebration Icon */}
                      <div className={`p-3 rounded-xl shrink-0 border ${
                        item.type === "HOLIDAY" 
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                          : "bg-pink-500/10 text-pink-400 border-pink-500/20"
                      }`}>
                        {item.type === "HOLIDAY" ? (
                          <Gift className="w-6 h-6" />
                        ) : (
                          <PartyPopper className="w-6 h-6" />
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.type === "HOLIDAY" ? (
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border bg-amber-500/15 text-amber-400 border-amber-500/20">
                              Government Holiday
                            </span>
                          ) : (
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border bg-pink-500/15 text-pink-400 border-pink-500/20">
                              School Event
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white leading-tight">{item.title}</h3>
                        {item.description && (
                          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">{item.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-2 border border-slate-700 hover:border-blue-500 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                        title="Edit Celebration"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-2 border border-red-500/20 hover:border-red-500/50 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Celebration"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Creation Form */}
          <div className="glass rounded-2xl p-6 border border-slate-800 h-fit">
            <h2 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              {editingId ? <Pencil className="w-4 h-4 text-blue-500" /> : <Plus className="w-4 h-4 text-blue-500" />}
              {editingId ? "Edit Event / Celebration" : "Add Event / Celebration"}
            </h2>
            <p className="text-xs text-slate-555 leading-relaxed mb-4">
              {editingId ? "Modify the details of the selected celebration." : "Schedule school celebrations or festivals."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1.5 font-bold uppercase tracking-wider">Title *</label>
                <input
                  type="text"
                  placeholder="E.g., Annual Day, Sports Festival"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1.5 font-bold uppercase tracking-wider">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1.5 font-bold uppercase tracking-wider">Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="EVENT">School Event</option>
                  <option value="HOLIDAY">Government Holiday</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1.5 font-bold uppercase tracking-wider">Remarks / Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., Principal speech at 9 AM. Cultural events after lunch."
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {editingId ? "Updating..." : "Saving..."}</>
                  ) : (
                    editingId ? "Update Celebration" : "Add to Portal"
                  )}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors border border-slate-750"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

        </div>
      </div>
    </PortalLayout>
  );
}
