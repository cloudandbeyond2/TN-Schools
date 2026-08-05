"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import PortalLayout from "@/components/PortalLayout";
import ParentPortalBanner from "@/components/ParentPortalBanner";
import { useSession } from "next-auth/react";
import { useParentChildren, getApiBase } from "@/lib/useParentChildren";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import { MessageSquare, Send, CheckCircle, Bot, RefreshCw, User, Mail, BookOpen } from "lucide-react";
import Swal from "sweetalert2";

interface Teacher {
  id: string;
  user: {
    name: string;
    email: string | null;
    subject: string;
  };
}

interface Message {
  id?: string;
  sender: string;
  text: string;
  time?: string;
}

function ParentMessagesContent() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  
  const { 
    parentId, 
    schoolId: sessionSchoolId, 
    activeChild, 
    childrenLoading 
  } = useParentChildren();

  const schoolId = activeChild?.schoolId || sessionSchoolId || (session?.user as any)?.schoolId;
  const API_URL = getApiBase();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  // Fetch teachers of the school
  const fetchTeachers = useCallback(async () => {
    if (!schoolId) return;
    setLoadingTeachers(true);
    try {
      const res = await fetch(`${API_URL}/api/parent/teachers?schoolId=${schoolId}`);
      const json = await res.json();
      if (json.success && json.data) {
        const unique: Teacher[] = [];
        const seen = new Set<string>();
        json.data.forEach((t: any) => {
          const nameKey = t.user.name.trim().toLowerCase();
          if (!seen.has(nameKey)) {
            seen.add(nameKey);
            unique.push(t);
          }
        });
        setTeachers(unique);
        if (unique.length > 0) {
          setSelectedTeacherId(unique[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load teachers", err);
    } finally {
      setLoadingTeachers(false);
    }
  }, [schoolId, API_URL]);

  // Fetch chat messages
  const fetchMessages = useCallback(async () => {
    if (!parentId || !selectedTeacherId) return;
    setLoadingMessages(true);
    try {
      const res = await fetch(`${API_URL}/api/teacher/messages/${parentId}?teacherId=${selectedTeacherId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setMessages(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoadingMessages(false);
    }
  }, [parentId, selectedTeacherId, API_URL]);

  useEffect(() => {
    if (!childrenLoading) {
      fetchTeachers();
    }
  }, [childrenLoading, fetchTeachers]);

  useEffect(() => {
    if (parentId && selectedTeacherId) {
      fetchMessages();
    }
  }, [parentId, selectedTeacherId, fetchMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !parentId || !selectedTeacherId || sending) return;
    setSending(true);

    try {
      const res = await fetch(`${API_URL}/api/teacher/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId,
          teacherId: selectedTeacherId,
          sender: "parent",
          text: chatInput.trim(),
          schoolId
        }),
      });
      const json = await res.json();
      if (json.success) {
        setChatInput("");
        await fetchMessages();
        Swal.fire({
          icon: "success",
          title: lang === "தமிழ்" ? "செய்தி அனுப்பப்பட்டது" : "Message Sent",
          text: lang === "தமிழ்" ? "உங்கள் செய்தி ஆசிரியருக்கு அனுப்பப்பட்டது." : "Your message has been sent successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: json.error || "Failed to send message.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error("Failed to send message", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Connection failed.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSending(false);
    }
  };

  const activeTeacher = teachers.find(t => t.id === selectedTeacherId);

  return (
    <PortalLayout 
      title={lang === "தமிழ்" ? "ஆசிரியர் தொடர்பு" : "Teacher Communication"} 
      subtitle={lang === "தமிழ்" ? "வகுப்பு ஆசிரியர்கள் மற்றும் பள்ளி பணியாளர்களுடன் நேரடி அரட்டை" : "Direct messaging with your child's teachers and school staff"}
    >
      <ParentPortalBanner pageKey="messages" />
 
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6 h-[calc(100vh-420px)] lg:h-[calc(100vh-370px)]">
        {/* Sidebar: Teachers list */}
        <div className={`lg:col-span-1 theme-card p-4 flex flex-col gap-4 overflow-y-auto ${mobileView === "list" ? "flex" : "hidden lg:flex"}`}>
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
            <h3 className="text-[var(--text-heading)] font-semibold text-xs uppercase tracking-wider flex items-center gap-1">
              <User className="w-4 h-4 text-[var(--portal-color,#10b981)]" /> 
              {lang === "தமிழ்" ? "ஆசிரியர்கள்" : "Teachers List"}
            </h3>
            <button 
              onClick={fetchTeachers}
              className="p-1 rounded hover:bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-heading)] transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
 
          {loadingTeachers ? (
            <div className="text-center py-6 text-xs text-[var(--text-muted)]">
              {lang === "தமிழ்" ? "ஏற்றப்படுகிறது..." : "Loading teachers..."}
            </div>
          ) : teachers.length > 0 ? (
            <div className="space-y-2">
              {teachers.map((t) => {
                const isSelected = t.id === selectedTeacherId;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTeacherId(t.id);
                      setMobileView("chat");
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs ${
                      isSelected
                        ? "border-[var(--portal-color,#10b981)] bg-[var(--portal-color,#10b981)]/5"
                        : "border-[var(--border)] hover:bg-[var(--bg-card-hover)]"
                    }`}
                  >
                    <div className="font-semibold text-[var(--text-heading)] mb-1 truncate">
                      {t.user.name}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-[var(--portal-color,#10b981)]" />
                      <span>{t.user.subject}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-[var(--text-muted)] italic">
              {lang === "தமிழ்" ? "ஆசிரியர்கள் விவரங்கள் இல்லை" : "No teachers registered."}
            </div>
          )}
        </div>

        {/* Messaging Area */}
        <div className={`lg:col-span-3 flex flex-col theme-card overflow-hidden ${mobileView === "chat" ? "flex" : "hidden lg:flex"}`}>
          {activeTeacher ? (
            <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 md:px-5 py-3 sm:py-4 border-b border-[var(--border)] bg-[var(--bg-main)] gap-2">
                <div className="flex items-center gap-2 md:gap-3 min-w-0 w-full sm:w-auto">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setMobileView("list")}
                    className="lg:hidden p-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text-heading)] mr-1 hover:bg-[var(--bg-card-hover)] transition-all shrink-0"
                  >
                    ←
                  </button>
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[var(--portal-color,#10b981)]/10 border border-[var(--portal-color,#10b981)]/20 flex items-center justify-center text-xs md:text-sm font-bold text-[var(--portal-color,#10b981)] shrink-0">
                    {activeTeacher.user.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[var(--text-heading)] font-semibold text-xs truncate">{activeTeacher.user.name}</h4>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] truncate">
                      {activeTeacher.user.subject}
                    </p>
                  </div>
                </div>
                <div className="text-[9px] text-[var(--text-muted)] flex items-center gap-1.5 w-full sm:w-auto justify-end shrink-0">
                  <Mail className="w-3 h-3 text-[var(--text-muted)] hidden sm:inline" />
                  <span className="truncate max-w-[120px]">{activeTeacher.user.email || "N/A"}</span>
                </div>
              </div>

              {/* Chat history */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[var(--bg-card)]">
                {loadingMessages ? (
                  <div className="text-center py-12 text-xs text-[var(--text-muted)]">
                    {lang === "தமிழ்" ? "செய்திகளை ஏற்றுகிறது..." : "Loading conversation history..."}
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg, i) => {
                    const isParent = msg.sender === "parent";
                    return (
                      <div key={i} className={`flex ${isParent ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-xl px-4 py-2.5 text-xs leading-relaxed ${
                            isParent
                              ? "bg-[var(--portal-color,#10b981)] text-white shadow-md rounded-tr-none"
                              : "bg-[var(--bg-main)] text-[var(--text-heading)] rounded-tl-none border border-[var(--border-light)]"
                          }`}
                        >
                          <div>{msg.text}</div>
                          <div className={`text-[8px] text-right mt-1.5 ${isParent ? "text-emerald-100" : "text-[var(--text-muted)]"}`}>
                            {msg.time || "Just now"}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-xs text-[var(--text-muted)] italic">
                    {lang === "தமிழ்" ? "செய்திகள் எதுவும் இல்லை. கீழே அரட்டையைத் தொடங்கவும்." : "No message logs. Start conversation below."}
                  </div>
                )}
              </div>

              {/* Message Input bar */}
              <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-main)]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={lang === "தமிழ்" ? "உங்கள் செய்தியை தட்டச்சு செய்யவும்..." : "Type your message here..."}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-heading)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--portal-color,#10b981)] shadow-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !chatInput.trim()}
                    className="px-6 py-2.5 bg-[var(--portal-color,#10b981)] text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {lang === "தமிழ்" ? "அனுப்பு" : "Send"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-xs">
                {lang === "தமிழ்" ? "அரட்டையைத் தொடங்க ஒரு ஆசிரியரைத் தேர்ந்தெடுக்கவும்" : "Select a teacher from the list to start chatting."}
              </p>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}

export default function ParentMessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-main)]">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
      </div>
    }>
      <ParentMessagesContent />
    </Suspense>
  );
}
