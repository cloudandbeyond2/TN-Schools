"use client";
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { CheckCircle, MessageSquare } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import Swal from "sweetalert2";

interface Parent {
  id: string;
  name: string;
  studentName: string;
  studentClass: string;
  phone: string;
  unreadCount?: number;
  lastMessage?: string;
}

interface Message {
  sender: "teacher" | "parent";
  text: string;
  time: string;
}

function CommunicationContent() {
  const router = useRouter();
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const searchParams = useSearchParams();
  const parentPhoneParam = searchParams.get("parentPhone");
  const studentNameParam = searchParams.get("studentName");

  const [parents, setParents] = useState<Parent[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [chats, setChats] = useState<Record<string, Message[]>>({});
  const [chatInput, setChatInput] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSchoolId, setActiveSchoolId] = useState<string>("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  // Load school ID dynamically from session or direct profile query (bypassing session caches)
  useEffect(() => {
    const loadSchoolId = async () => {
      const sessSchoolId = (session?.user as any)?.schoolId;
      if (sessSchoolId) {
        setActiveSchoolId(sessSchoolId);
        return;
      }
      const userId = (session?.user as any)?.id;
      if (!userId) return;
      try {
        const res = await fetch(`${API_URL}/api/teacher/profile/${userId}`);
        const data = await res.json();
        if (data.success && data.data && data.data.schoolId) {
          setActiveSchoolId(data.data.schoolId);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    loadSchoolId();
  }, [session, API_URL]);

  const fetchParentsAndMessages = useCallback(async () => {
    if (!activeSchoolId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/headmaster/parents?schoolId=${activeSchoolId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setParents(data.data);
        if (data.data.length > 0) {
          let targetParent = data.data[0];
          let matched = false;
          if (parentPhoneParam) {
            const clean = (p: string) => p.replace(/[\s\-\+]/g, "").slice(-10);
            const match = data.data.find((p: any) => clean(p.phone) === clean(parentPhoneParam));
            if (match) {
              targetParent = match;
              matched = true;
            }
          }
          if (!matched && studentNameParam) {
            const match = data.data.find((p: any) => p.studentName.toLowerCase() === studentNameParam.toLowerCase());
            if (match) {
              targetParent = match;
              matched = true;
            }
          }

          setSelectedParentId(targetParent.id);
          // Fetch messages for target parent
          const msgRes = await fetch(`${API_URL}/api/teacher/messages/${targetParent.id}?teacherId=${(session?.user as any)?.id || ""}`);
          const msgData = await msgRes.json();
          if (msgData.success) {
            setChats((prev) => ({ ...prev, [targetParent.id]: msgData.data }));
          }
        }
      }
    } catch (err) {
      console.error("Error loading parent communication:", err);
    } finally {
      setLoading(false);
    }
  }, [activeSchoolId, API_URL, parentPhoneParam, studentNameParam, session]);

  useEffect(() => {
    if (activeSchoolId) {
      fetchParentsAndMessages();
    }
  }, [activeSchoolId, fetchParentsAndMessages]);

  const handleSelectParent = async (id: string) => {
    setSelectedParentId(id);
    setMobileView("chat");
    try {
      const msgRes = await fetch(`${API_URL}/api/teacher/messages/${id}?teacherId=${(session?.user as any)?.id || ""}`);
      const msgData = await msgRes.json();
      if (msgData.success) {
        setChats((prev) => ({ ...prev, [id]: msgData.data }));
      }
    } catch (err) {
      console.error("Error fetching chats for parent:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedParentId) return;

    try {
      const res = await fetch(`${API_URL}/api/teacher/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: selectedParentId,
          teacherId: (session?.user as any)?.id,
          sender: "teacher",
          text: chatInput,
        }),
      });
      const result = await res.json();
      if (result.success) {
        const newMsg: Message = result.data;
        const currentMsgs = chats[selectedParentId] || [];
        setChats({
          ...chats,
          [selectedParentId]: [...currentMsgs, newMsg],
        });
        setChatInput("");
        Swal.fire({
          icon: "success",
          title: "Message Sent",
          text: "Your message has been sent to the parent successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to Send Message",
          text: result.error || "Failed to send message to parent.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error("Error sending message:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected network error occurred while sending the message.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const selectedParent = parents.find((p) => p.id === selectedParentId);
  const messages = selectedParent ? (chats[selectedParent.id] || []) : [];

  return (
    <PortalLayout
      title={lang === "தமிழ்" ? "பெற்றோர் தொடர்பு" : "Parent Communication"}
      subtitle={lang === "தமிழ்" ? "பெற்றோர்கள் மற்றும் பாதுகாவலர்களுக்கு இருமொழி நேரடி செய்தி" : "Bilingual direct messaging to parents and guardians"}
    >
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-emerald-500 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2">
          <span><CheckCircle className="w-4 h-4 inline mr-1 text-emerald-500" /></span> {toastMessage}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-xs text-[var(--text-muted)]">{lang === "தமிழ்" ? "தொடர்பு சேனல் ஏற்றப்படுகிறது..." : "Loading communication channel..."}</div>
      ) : parents.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-260px)] lg:h-[calc(100vh-190px)]">
          {/* Chat sidebar contacts */}
          <div className={`lg:col-span-1 theme-card p-4 flex flex-col gap-4 overflow-y-auto ${mobileView === "list" ? "flex" : "hidden lg:flex"}`}>
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
              <h3 className="text-[var(--text-heading)] font-semibold text-xs uppercase tracking-wider flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {lang === "தமிழ்" ? "உள்வரும் அரட்டைகள்" : "Inbox Chats"}</h3>
              <span className="badge badge-yellow">{lang === "தமிழ்" ? "செயலில்" : "Active"}</span>
            </div>

            <div className="space-y-2">
              {parents.map((p) => {
                const isSelected = p.id === selectedParentId;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectParent(p.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs relative ${
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]/5"
                        : "border-[var(--border)] hover:bg-[var(--bg-card-hover)]"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-semibold text-[var(--text-heading)] truncate max-w-[120px]">{p.name}</span>
                      <span className="text-[9px] text-[var(--text-muted)] font-medium">({p.studentName})</span>
                    </div>

                    <p className="text-[10px] text-[var(--text-muted)] truncate">{p.phone}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Messaging Box */}
          {selectedParent && (
            <div className={`lg:col-span-3 flex flex-col theme-card overflow-hidden ${mobileView === "chat" ? "flex" : "hidden lg:flex"}`}>
              {/* Active parent header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 md:px-5 py-3 sm:py-4 border-b border-[var(--border)] bg-[var(--bg-main)] gap-2">
                <div className="flex items-center gap-2 md:gap-3 min-w-0 w-full sm:w-auto">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setMobileView("list")}
                    className="lg:hidden p-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--text-heading)] mr-1 hover:bg-[var(--bg-card-hover)] transition-all shrink-0"
                  >
                    ←
                  </button>
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-xs md:text-sm font-bold text-[var(--primary)] shrink-0">
                    {selectedParent.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[var(--text-heading)] font-semibold text-xs truncate">{selectedParent.name}</h4>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] truncate">
                      {lang === "தமிழ்" 
                        ? `${selectedParent.studentName} -ன் பெற்றோர் (வகுப்பு ${selectedParent.studentClass})`
                        : `Parent of ${selectedParent.studentName} (Class ${selectedParent.studentClass})`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 w-full sm:w-auto justify-end shrink-0">
                  <button
                    onClick={() => router.push("/teacher/student-profiles")}
                    className="px-2 md:px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[9px] md:text-[10px] transition-all flex items-center gap-1 shadow-sm"
                  >
                    <span className="hidden md:inline">←</span> {lang === "தமிழ்" ? "விவரங்கள்" : "Profiles"}
                  </button>
                  <span className="badge badge-green text-[9px]">{lang === "தமிழ்" ? "செயலில்" : "Active"}</span>
                </div>
              </div>

              {/* Conversation history list */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[var(--bg-card)]">
                {messages.length > 0 ? (
                  messages.map((msg, i) => {
                    const isTeacher = msg.sender === "teacher";
                    return (
                      <div key={i} className={`flex ${isTeacher ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                            isTeacher
                              ? "bg-[var(--primary)] text-white shadow-md rounded-tr-none"
                              : "bg-[var(--bg-main)] text-[var(--text-heading)] rounded-tl-none border border-[var(--border-light)]"
                          }`}
                        >
                          <div>{msg.text}</div>
                          <div className={`text-[8px] text-right mt-1.5 ${isTeacher ? "text-indigo-100" : "text-[var(--text-muted)]"}`}>
                            {msg.time}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-xs text-[var(--text-muted)] italic">{lang === "தமிழ்" ? "செய்தி பதிவுகள் இல்லை. கீழே அரட்டையைத் தொடங்கவும்." : "No message logs. Start conversation below."}</div>
                )}
              </div>

              {/* Message input controls */}
              <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-main)] space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={lang === "தமிழ்" ? "உங்கள் பதிலை இங்கே தட்டச்சு செய்யவும்..." : "Type your reply here..."}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-heading)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] shadow-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="btn-primary py-2.5 px-6 font-bold text-xs shadow-none hover:shadow-[var(--primary-shadow-1)] rounded-xl"
                  >
                    {lang === "தமிழ்" ? "அனுப்பு" : "Send"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-xs text-[var(--text-muted)] italic">
          {lang === "தமிழ்" ? "தரவுத்தளத்தில் இந்த பள்ளிக்கு பெற்றோர் பதிவுகள் எதுவும் கிடைக்கவில்லை." : "No parent records found for this school in the PostgreSQL database."}
        </div>
      )}
    </PortalLayout>
  );
}

export default function CommunicationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-main)]">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
      </div>
    }>
      <CommunicationContent />
    </Suspense>
  );
}
