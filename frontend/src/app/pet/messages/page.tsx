"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { MessageSquare, Send, CheckCircle, Bot, RefreshCw, User, Phone } from "lucide-react";
import Swal from "sweetalert2";

interface Parent {
  id: string;
  name: string;
  studentName: string;
  studentClass: string;
  phone: string;
}

interface Message {
  id?: string;
  sender: string;
  text: string;
  createdAt?: string;
  time?: string;
}

export default function PetMessagesPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const teacherName = (session?.user as any)?.name || "Physical Education Teacher";
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [parents, setParents] = useState<Parent[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  // Fetch parents in the school
  const fetchParents = useCallback(async () => {
    if (!schoolId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/headmaster/parents?schoolId=${schoolId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setParents(json.data);
        if (json.data.length > 0) {
          setSelectedParentId(json.data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch parents:", err);
    } finally {
      setLoading(false);
    }
  }, [schoolId, API_URL]);

  // Fetch messages for selected parent
  const fetchMessages = useCallback(async (parentId: string) => {
    if (!parentId) return;
    setLoadingMessages(true);
    try {
      const res = await fetch(`${API_URL}/api/teacher/messages/${parentId}?teacherId=${(session?.user as any)?.id || ""}`);
      const json = await res.json();
      if (json.success && json.data) {
        setMessages(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, [API_URL, session]);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  useEffect(() => {
    if (selectedParentId) {
      fetchMessages(selectedParentId);
    }
  }, [selectedParentId, fetchMessages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !selectedParentId || sending) return;

    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/teacher/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: selectedParentId,
          teacherId: (session?.user as any)?.id,
          sender: "teacher",
          text: chatInput.trim(),
          schoolId
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setMessages((prev) => [...prev, json.data]);
        setChatInput("");
        Swal.fire({
          icon: "success",
          title: "Message Sent",
          text: "Reply sent to parent successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to Send",
          text: json.error || "Could not deliver message.",
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };



  const activeParent = parents.find(p => p.id === selectedParentId);

  return (
    <PortalLayout>
      <div className="p-6 w-full space-y-6">


        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-heading)] flex items-center gap-2">
              <MessageSquare className="text-lime-500" /> Parent Correspondence
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Read and reply to parents about physical education and sports progress</p>
          </div>
          <button
            onClick={() => selectedParentId && fetchMessages(selectedParentId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={loadingMessages ? "animate-spin" : ""} /> Refresh Chat
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-[var(--text-muted)]">Loading conversations...</div>
        ) : parents.length === 0 ? (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-12 text-center text-sm text-[var(--text-muted)]">
            No parent chat records found for this school.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-260px)] lg:h-[calc(100vh-190px)]">
            {/* Contacts list */}
            <div className={`lg:col-span-1 bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-2xl flex flex-col gap-4 overflow-y-auto ${mobileView === "list" ? "flex" : "hidden lg:flex"}`}>
              <div className="border-b border-[var(--border-light)] pb-3">
                <h3 className="text-[var(--text-heading)] font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <User size={16} /> Parent Inbox
                </h3>
              </div>
              <div className="space-y-2">
                {parents.map((p) => {
                  const isSelected = p.id === selectedParentId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedParentId(p.id);
                        setMobileView("chat");
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs relative ${
                        isSelected
                          ? "border-lime-500 bg-lime-500/5 text-[var(--text-heading)]"
                          : "border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800/40 text-[var(--text-muted)] hover:text-[var(--text-heading)]"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold truncate max-w-[120px]">{p.name}</span>
                        <span className="text-[9px] font-semibold text-lime-600 dark:text-lime-400">({p.studentName})</span>
                      </div>
                      <p className="text-[10px] opacity-75 flex items-center gap-1">
                        <Phone size={10} /> {p.phone}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
 
            {/* Chat Box */}
            <div className={`lg:col-span-3 flex flex-col bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden ${mobileView === "chat" ? "flex" : "hidden lg:flex"}`}>
              {activeParent && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 md:px-5 py-3 sm:py-4 border-b border-[var(--border-light)] bg-slate-50/50 dark:bg-slate-900/10 gap-2">
                  <div className="flex items-center gap-2 md:gap-3 min-w-0 w-full sm:w-auto">
                    {/* Mobile Back Button */}
                    <button
                      onClick={() => setMobileView("list")}
                      className="lg:hidden p-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text-heading)] mr-1 hover:bg-[var(--bg-card-hover)] transition-all shrink-0"
                    >
                      ←
                    </button>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[var(--text-heading)] font-bold text-sm truncate">{activeParent.name}</h4>
                      <p className="text-[10px] font-bold text-[var(--text-muted)] truncate">Parent of {activeParent.studentName} (Class {activeParent.studentClass})</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end shrink-0">
                    <span className="px-2 py-0.5 rounded bg-lime-500/10 text-lime-600 dark:text-lime-450 border border-lime-500/20 text-[9px] font-bold shrink-0">PT Instructor Direct</span>
                  </div>
                </div>
              )}

              {/* Message log */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/20 dark:bg-slate-900/5">
                {loadingMessages ? (
                  <div className="text-center py-12 text-xs text-[var(--text-muted)] animate-pulse">Loading message log...</div>
                ) : messages.length > 0 ? (
                  messages.map((msg, i) => {
                    const isTeacher = msg.sender !== "parent";
                    return (
                      <div key={i} className={`flex ${isTeacher ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                            isTeacher
                              ? "bg-lime-600 border border-lime-500 text-white rounded-tr-none shadow-sm"
                              : "bg-white dark:bg-slate-800 text-[var(--text-heading)] border border-[var(--border-light)] rounded-tl-none"
                          }`}
                        >
                          <div>{msg.text}</div>
                          <span className={`text-[8px] block text-right mt-1.5 opacity-75 font-semibold ${isTeacher ? "text-lime-100" : "text-[var(--text-muted)]"}`}>
                            {msg.time || (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "")}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-xs text-[var(--text-muted)] italic">No chat records. Send a message to start correspondence.</div>
                )}
              </div>

              {/* Input reply form */}
              {activeParent && (
                <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--border-light)] bg-slate-50/50 dark:bg-slate-900/10 flex gap-2">
                  <input
                    type="text"
                    placeholder={`Reply to ${activeParent.name}...`}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={sending}
                    className="flex-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-heading)] placeholder-[var(--text-muted)] focus:outline-none focus:border-lime-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={sending || !chatInput.trim()}
                    className="bg-lime-600 hover:bg-lime-700 text-white py-2 px-5 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send size={12} /> Reply
                  </button>
                </form>
              )}
            </div>


          </div>
        )}
      </div>
    </PortalLayout>
  );
}
