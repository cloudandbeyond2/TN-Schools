"use client";
import { Megaphone, Clipboard, Pin } from "lucide-react";


import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import Swal from "sweetalert2";

interface Announcement {
  id: string;
  title: string;
  body: string;
  target: string;
  date: string;
  sender: string;
  pinned: boolean;
  readReceipts?: string;
}

export default function AnnouncementsPage() {
  const { lang } = usePortalLanguage();
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);

  // Form State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("");
  const [pinToTop, setPinToTop] = useState(false);
  const [sendSMS, setSendSMS] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const userId = (session?.user as any)?.id;

  // Fetch teacher classes on mount
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      if (!schoolId || !userId) return;
      try {
        const res = await fetch(`${API_URL}/api/classes?schoolId=${schoolId}&teacherId=${userId}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setTeacherClasses(data.data);
        }
      } catch (err) {
        console.error("Error fetching teacher classes:", err);
      }
    };
    fetchTeacherClasses();
  }, [schoolId, userId]);

  const fetchAnnouncements = async () => {
    if (!schoolId || teacherClasses.length === 0) {
      setAnnouncements([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/teacher/announcements?schoolId=${schoolId || ""}`);
      const result = await res.json();
      if (result.success && result.data) {
        const filtered = result.data.filter((ann: any) =>
          ann.target === "All Parents taught by me" ||
          teacherClasses.some(tc => `Class ${tc.className}${tc.section} Parents` === ann.target)
        );
        setAnnouncements(filtered);
      }
    } catch (err) {
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [schoolId, teacherClasses]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    try {
      const res = await fetch(`${API_URL}/api/teacher/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          target,
          sender: "You (Teacher)",
          pinned: pinToTop,
          schoolId: schoolId || null,
          sendSMS,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setAnnouncements([result.data, ...announcements]);
        setTitle("");
        setBody("");
        setPinToTop(false);
        setSendSMS(false);
        Swal.fire({
          icon: "success",
          title: "Broadcasted!",
          text: sendSMS
            ? "Announcement broadcasted! Parent notification feeds updated and SMS alerts dispatched."
            : "Announcement broadcasted! Parent notification feeds updated.",
          timer: 2500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to Broadcast",
          text: result.error || "Failed to post announcement.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error("Error broadcasting announcement:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected network error occurred.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete Announcement?",
      text: "Are you sure you want to permanently delete this announcement?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/api/teacher/announcements/${id}`, {
        method: "DELETE",
      });
      const resultData = await res.json();
      if (resultData.success) {
        setAnnouncements(announcements.filter((ann) => ann.id !== id));
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Announcement has been successfully deleted.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: resultData.error || "Failed to delete announcement.",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      console.error("Error deleting announcement:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  return (
    <PortalLayout title="Announcements & Circulars" subtitle="Broadcast updates to classes or review administration circulars.">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Broadcast Form */}
        <div className="theme-card p-6 border border-[var(--border)] h-fit">
          <h2 className="text-base font-semibold text-[var(--text-heading)] mb-4"><Megaphone className="w-4 h-4 inline-block mr-1 text-inherit" /> {lang === "தமிழ்" ? "அறிவிப்பை உருவாக்கு" : "Compose Announcement"}</h2>
          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">{lang === "தமிழ்" ? "தலைப்பு" : "Topic / Title"}</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Science Fair Submission Rules"
                className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">{lang === "தமிழ்" ? "இலக்கு பார்வையாளர்கள்" : "Target Audience"}</label>
              <select
                required
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              >
                <option value="" disabled>{lang === "தமிழ்" ? "-- பார்வையாளர்களைத் தேர்ந்தெடு --" : "-- Select Audience --"}</option>
                {teacherClasses.length > 0 && teacherClasses.map((cls) => (
                  <option key={cls.id} value={`Class ${cls.className}${cls.section} Parents`}>
                    {lang === "தமிழ்" ? `வகுப்பு ${cls.className}${cls.section} பெற்றோர்கள்` : `Class ${cls.className}${cls.section} Parents`}
                  </option>
                ))}
                <option value="All Parents taught by me">{lang === "தமிழ்" ? "நான் கற்பிக்கும் அனைத்து பெற்றோர்களும்" : "All Parents taught by me"}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">{lang === "தமிழ்" ? "செய்தி உள்ளடக்கம்" : "Message Body"}</label>
              <textarea
                required
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Provide detailed instructions..."
                className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-heading)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pin-announcement"
                checked={pinToTop}
                onChange={(e) => setPinToTop(e.target.checked)}
                className="accent-amber-500 cursor-pointer"
              />
              <label htmlFor="pin-announcement" className="text-xs text-[var(--text-muted)] cursor-pointer select-none">
                {lang === "தமிழ்" ? "டாஷ்போர்டின் மேலே பின் செய்யவும்" : "Pin to the top of the dashboard"}
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sms-notice"
                checked={sendSMS}
                onChange={(e) => setSendSMS(e.target.checked)}
                className="accent-amber-500 cursor-pointer"
              />
              <label htmlFor="sms-notice" className="text-xs text-[var(--text-muted)] cursor-pointer select-none">
                {lang === "தமிழ்" ? "பெற்றோருக்கு SMS எச்சரிக்கை அனுப்பவும்" : "Send SMS alert to Parents"}
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[var(--primary)] hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Megaphone className="w-4 h-4 inline-block mr-1 text-inherit" /> {lang === "தமிழ்" ? "அறிவிப்பை வெளியிடு" : "Broadcast Announcement"}
            </button>
          </form>
        </div>

        {/* Board feed */}
        <div className="xl:col-span-2 theme-card p-6 border border-[var(--border)] space-y-5">
          <h2 className="text-base font-semibold text-[var(--text-heading)]"><Clipboard className="w-4 h-4 inline-block mr-1 text-inherit" /> {lang === "தமிழ்" ? "செயலில் உள்ள அறிவிப்பு பலகை" : "Active Announcement Board"}</h2>

          {toast && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl">
              {toast}
            </div>
          )}

          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-xs py-8 text-[var(--text-muted)]">{lang === "தமிழ்" ? "ஏற்றப்படுகிறது..." : "Loading board..."}</div>
            ) : announcements.length > 0 ? (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-4 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] rounded-xl border flex flex-col justify-between gap-3 relative ${
                    ann.pinned ? "border-[var(--primary)]/30" : "border-[var(--border)]"
                  }`}
                >
                  {ann.pinned && (
                    <span className="absolute top-3 right-3 text-[10px] bg-[var(--primary)]/10 text-amber-400 border border-[var(--primary)]/20 px-2 py-0.5 rounded-full font-bold">
                      <Pin className="w-4 h-4 inline-block mr-1 text-inherit" /> {lang === "தமிழ்" ? "முக்கியமானது" : "Pinned"}
                    </span>
                  )}

                  <div>
                    <div className="flex gap-2 items-center flex-wrap mb-1.5">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
                        {ann.target}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold">{ann.date}</span>
                      <span className="text-[10px] text-slate-650 font-semibold">{lang === "தமிழ்" ? `· அனுப்பியவர்: ${ann.sender}` : `· By ${ann.sender}`}</span>
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-heading)] mb-2">{ann.title}</h3>
                    <p className="text-xs text-[var(--text-main)] leading-relaxed">{ann.body}</p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-[var(--border)] text-[11px] text-[var(--text-muted)]">
                    <span>{ann.readReceipts ? (lang === "தமிழ்" ? `படித்த ரசீதுகள்: ${ann.readReceipts}` : `Read receipts: ${ann.readReceipts}`) : (lang === "தமிழ்" ? "பெறப்பட்டது" : "Received")}</span>
                    {ann.sender.startsWith("You") && (
                      <button
                        onClick={() => handleDelete(ann.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        {lang === "தமிழ்" ? "அழி" : "Delete"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-xs py-8 text-[var(--text-muted)] italic">{lang === "தமிழ்" ? "இன்னும் அறிவிப்புகள் எதுவும் வெளியிடப்படவில்லை." : "No announcements broadcasted yet."}</div>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
