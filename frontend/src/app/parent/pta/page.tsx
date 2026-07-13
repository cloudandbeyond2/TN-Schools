"use client";

import React, { useEffect, useState, useCallback } from "react";
import PortalLayout from "@/components/PortalLayout";
import { useSession } from "next-auth/react";
import { useParentChildren, getApiBase, Child } from "@/lib/useParentChildren";
import Swal from "sweetalert2";

interface PTAMeeting {
  id: string;
  title: string;
  description: string | null;
  meetingDate: string;
  venue: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  agenda: string[];
  createdAt: string;
}

interface Teacher {
  id: string;
  user: {
    name: string;
    email: string | null;
  };
}

interface TeacherSlot {
  id: string;
  dayOfWeek: string;
  timeSlot: string;
  isAvailable: boolean;
}

interface PTAAppointment {
  id: string;
  parentId: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  meetingDate: string;
  timeSlot: string;
  status: string;
  reason: string;
  notes: string | null;
  createdAt: string;
}

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function ParentPtaManagementPage() {
  const { data: session } = useSession();
  const { parentId, schoolId: sessionSchoolId, children, activeChild, setActiveChild, childrenLoading } = useParentChildren();
  const schoolId = activeChild?.schoolId || sessionSchoolId || (session?.user as any)?.schoolId as string | undefined;

  // Tab states
  const [activeView, setActiveView] = useState<"Meetings" | "Appointments" | "Sports" | "Chat" | "Notifications">("Meetings");
  
  // Dynamic lists
  const [meetings, setMeetings] = useState<PTAMeeting[]>([]);
  const [appointments, setAppointments] = useState<PTAAppointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherSlots, setTeacherSlots] = useState<TeacherSlot[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  // Sports states
  const [sportsProfile, setSportsProfile] = useState<any>(null);
  const [loadingSports, setLoadingSports] = useState(false);

  // Message states
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Form states
  const [formChildId, setFormChildId] = useState<string>("");
  const [formTeacherId, setFormTeacherId] = useState<string>("");
  const [formDate, setFormDate] = useState<string>("");
  const [formSlot, setFormSlot] = useState<string>("");
  const [formReason, setFormReason] = useState<string>("");
  const [submittingAppt, setSubmittingAppt] = useState(false);
  const [formError, setFormError] = useState<string>("");
  const [formSuccess, setFormSuccess] = useState<string>("");

  // Filter / Search / Pagination
  const [meetingsStatusFilter, setMeetingsStatusFilter] = useState<string>("Upcoming");
  const [searchQuery, setSearchQuery] = useState<string>(" ");
  const [meetingsPage, setMeetingsPage] = useState<number>(1);
  const [apptsPage, setApptsPage] = useState<number>(1);
  const pageSize = 5;

  // Local states for UI RSVP & Questions simulation (as in original page)
  const [rsvpStatus, setRsvpStatus] = useState<Record<string, "Accept" | "Decline" | "Tentative">>({});

  // Fallback sports profile details if database profile lists are empty
  const fallbackSportsProfile = {
    stats: [
      { id: "fs1", label: "Sprint Speed", value: "12.5s", score: 85, icon: "fi-rr-running", color: "bg-amber-500" },
      { id: "fs2", label: "Shot Put", value: "9.8m", score: 80, icon: "fi-rr-circle", color: "bg-orange-500" },
      { id: "fs3", label: "Cardio Endurance", value: "Excellent", score: 90, icon: "fi-rr-heart", color: "bg-rose-500" },
      { id: "fs4", label: "Agility", value: "Above Average", score: 78, icon: "fi-rr-redo", color: "bg-blue-500" },
      { id: "fs5", label: "Overall Fitness", value: "Grade A", score: 88, icon: "fi-rr-shield", color: "bg-emerald-500" }
    ],
    teams: [
      { id: "ft1", name: "School Football Team", role: "Midfielder", icon: "fi-rr-ball", color: "from-blue-500 to-cyan-500", match: "Inter-school Quarterfinals", date: "This Friday, 4:00 PM" },
      { id: "ft2", name: "Athletics Club", role: "Sprinter (100m)", icon: "fi-rr-running", color: "from-orange-500 to-amber-500", match: "District Meet Tryouts", date: "Next Monday, 6:00 AM" }
    ],
    events: [
      { id: "fe1", title: "Annual Sports Meet", date: "Jan 12, 2026", type: "Gold Medal (100m Dash)", icon: "fi-rr-cup" },
      { id: "fe2", title: "Inter-school Football", date: "Feb 18, 2026", type: "Runner Up", icon: "fi-rr-trophy" }
    ],
    logs: [
      { id: "fl1", date: "Today", activity: "Football Practice", duration: "90 mins", calories: 450, intensity: "High" },
      { id: "fl2", date: "Yesterday", activity: "Sprint Drills", duration: "45 mins", calories: 250, intensity: "Medium" }
    ],
    injuries: [
      { id: "fi1", type: "Ankle Sprain", severity: "Mild", description: "Slight sprain during football practice. Advised 3 days rest.", status: "Recovered", date: "2026-06-15" }
    ]
  };

  // Fetch sports profile
  const fetchSportsProfile = useCallback(async (studentId: string) => {
    if (!studentId) return;
    setLoadingSports(true);
    const apiUrl = getApiBase();
    try {
      const res = await fetch(`${apiUrl}/api/sports/${studentId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSportsProfile(json.data);
      } else {
        setSportsProfile(null);
      }
    } catch (error) {
      console.error("Failed to fetch sports profile:", error);
      setSportsProfile(null);
    } finally {
      setLoadingSports(false);
    }
  }, []);

  // Fetch parent-teacher messages
  const fetchMessages = useCallback(async () => {
    if (!parentId) return;
    setLoadingMessages(true);
    const apiUrl = getApiBase();
    try {
      const res = await fetch(`${apiUrl}/api/teacher/messages/${parentId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setMessages(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  }, [parentId]);

  // Fetch all dynamic data
  const fetchData = useCallback(async () => {
    if (!schoolId) return;
    setLoadingLists(true);
    const apiUrl = getApiBase();
    try {
      // 1. Fetch PTA meetings
      const meetingRes = await fetch(`${apiUrl}/api/parent/pta-meetings?schoolId=${schoolId}`);
      const meetingJson = await meetingRes.json();
      if (meetingJson.success && meetingJson.data) {
        setMeetings(meetingJson.data);
        if (parentId) {
          const rsvps: Record<string, "Accept" | "Decline" | "Tentative"> = {};
          meetingJson.data.forEach((m: any) => {
            if (m.rsvps && m.rsvps[parentId]) {
              const val = m.rsvps[parentId];
              rsvps[m.id] = (typeof val === 'object' && val) ? val.status : val;
            }
          });
          setRsvpStatus(rsvps);
        }
      }

      // 2. Fetch Teachers
      const teacherRes = await fetch(`${apiUrl}/api/parent/teachers?schoolId=${schoolId}`);
      const teacherJson = await teacherRes.json();
      if (teacherJson.success && teacherJson.data) {
        setTeachers(teacherJson.data);
        if (teacherJson.data.length > 0) {
          setFormTeacherId(teacherJson.data[0].id);
        }
      }

      // 3. Fetch PTA Appointments
      if (parentId) {
        const apptRes = await fetch(`${apiUrl}/api/parent/pta-appointments?parentId=${parentId}`);
        const apptJson = await apptRes.json();
        if (apptJson.success && apptJson.data) {
          setAppointments(apptJson.data);
        }

        // 4. Fetch notifications
        const notifRes = await fetch(`${apiUrl}/api/parent/${parentId}/notifications`);
        const notifJson = await notifRes.json();
        if (notifJson.success && notifJson.data) {
          // Filter only PTA/meeting related notifications
          const filtered = notifJson.data.filter((n: Notification) =>
            n.message.toLowerCase().includes("pta") ||
            n.message.toLowerCase().includes("appointment") ||
            n.message.toLowerCase().includes("meeting")
          );
          setNotifications(filtered);
        }
      }
    } catch (error) {
      console.error("Failed to fetch PTA management data:", error);
    } finally {
      setLoadingLists(false);
    }
  }, [schoolId, parentId]);

  useEffect(() => {
    if (!childrenLoading) {
      fetchData();
      fetchMessages();
    }
  }, [childrenLoading, fetchData, fetchMessages]);

  useEffect(() => {
    if (activeChild) {
      fetchSportsProfile(activeChild.studentId);
      setFormChildId(activeChild.studentId);
    }
  }, [activeChild, fetchSportsProfile]);

  // Fetch teacher slots when selected teacher changes
  const fetchTeacherSlots = useCallback(async (teacherId: string) => {
    if (!teacherId) return;
    const apiUrl = getApiBase();
    try {
      const res = await fetch(`${apiUrl}/api/parent/teacher-slots?teacherId=${teacherId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setTeacherSlots(json.data);
        if (json.data.length > 0) {
          setFormSlot(json.data[0].timeSlot);
        } else {
          setFormSlot("");
        }
      } else {
        setTeacherSlots([]);
      }
    } catch (error) {
      console.error("Failed to fetch teacher slots:", error);
      setTeacherSlots([]);
    }
  }, []);

  useEffect(() => {
    if (formTeacherId) {
      fetchTeacherSlots(formTeacherId);
    }
  }, [formTeacherId, fetchTeacherSlots]);

  // Reset page pagination when filter changes
  useEffect(() => {
    setMeetingsPage(1);
    setApptsPage(1);
  }, [meetingsStatusFilter, searchQuery, activeView]);

  // Fallback default slots if teacher has none configured in DB
  const getDisplaySlots = () => {
    if (teacherSlots.length > 0) return teacherSlots;
    // fallback static list
    return [
      { id: "s1", dayOfWeek: "General", timeSlot: "10:00 AM - 10:30 AM", isAvailable: true },
      { id: "s2", dayOfWeek: "General", timeSlot: "11:00 AM - 11:30 AM", isAvailable: true },
      { id: "s3", dayOfWeek: "General", timeSlot: "02:00 PM - 02:30 PM", isAvailable: true },
      { id: "s4", dayOfWeek: "General", timeSlot: "03:00 PM - 03:30 PM", isAvailable: true }
    ];
  };

  // Submit appointment request
  const handleSubmitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formChildId || !formTeacherId || !formDate || !formSlot || !formReason.trim()) {
      setFormError("Please fill in all fields.");
      return;
    }

    const selectedChild = children.find(c => c.studentId === formChildId);
    const selectedTeacher = teachers.find(t => t.id === formTeacherId);

    if (!selectedChild || !selectedTeacher) {
      setFormError("Failed to verify child or teacher details.");
      return;
    }

    setSubmittingAppt(true);
    const apiUrl = getApiBase();
    try {
      const res = await fetch(`${apiUrl}/api/parent/pta-appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId,
          teacherId: formTeacherId,
          studentId: selectedChild.studentId,
          meetingDate: formDate,
          timeSlot: formSlot,
          reason: formReason.trim(),
          schoolId,
          studentName: selectedChild.name
        })
      });

      const json = await res.json();
      if (json.success) {
        setFormSuccess("Appointment request submitted successfully!");
        setFormReason("");
        // Refresh appointment history and notifications
        fetchData();
        setActiveView("Appointments");
      } else {
        setFormError(json.error || "Failed to submit appointment request.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setFormError("A network error occurred. Please try again.");
    } finally {
      setSubmittingAppt(false);
    }
  };

  // Submit Parent-PT Teacher Correspondence Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !parentId) return;

    setSendingMessage(true);
    const apiUrl = getApiBase();
    try {
      const res = await fetch(`${apiUrl}/api/teacher/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId,
          sender: "Parent",
          text: chatInput.trim(),
          schoolId: activeChild?.schoolId || schoolId
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setMessages(prev => [...prev, json.data]);
        setChatInput("");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  const getDisplayMessages = () => {
    if (messages.length > 0) return messages;
    
    // Fallback greetings from class PT teacher
    const ptTeacherName = teachers.length > 0 ? teachers[0].user.name : "Mr. Rajesh (PE Teacher)";
    return [
      {
        id: "mock-1",
        sender: ptTeacherName,
        text: `Hello! I am ${ptTeacherName}, your child's Physical Education instructor. I have updated their fitness scores and activity logs. Please let me know if you have any questions about their sports performance!`,
        time: "10:00 AM"
      }
    ];
  };

  const getDisplaySportsData = () => {
    const stats = sportsProfile?.stats && sportsProfile.stats.length > 0 ? sportsProfile.stats : fallbackSportsProfile.stats;
    const teams = sportsProfile?.teams && sportsProfile.teams.length > 0 ? sportsProfile.teams : fallbackSportsProfile.teams;
    const events = sportsProfile?.events && sportsProfile.events.length > 0 ? sportsProfile.events : fallbackSportsProfile.events;
    const logs = sportsProfile?.logs && sportsProfile.logs.length > 0 ? sportsProfile.logs : fallbackSportsProfile.logs;
    const injuries = sportsProfile?.injuries && sportsProfile.injuries.length > 0 ? sportsProfile.injuries : fallbackSportsProfile.injuries;
    return { stats, teams, events, logs, injuries };
  };

  const handleRsvp = async (meetingId: string, status: "Accept" | "Decline" | "Tentative") => {
    if (!parentId) return;
    const apiUrl = getApiBase();

    let reason: string | null = null;
    if (status === "Decline") {
      const { value: inputReason, isConfirmed } = await Swal.fire({
        title: 'Provide Decline Reason',
        input: 'text',
        inputLabel: 'Why are you declining this meeting?',
        inputPlaceholder: 'e.g. Out of town, work shift conflict...',
        showCancelButton: true,
        confirmButtonText: 'Submit & Decline',
        confirmButtonColor: '#ef4444',
        inputValidator: (value) => {
          if (!value) {
            return 'Please write a brief reason!';
          }
        }
      });

      if (!isConfirmed) return; // parent cancelled the decline flow
      reason = inputReason || null;
    }

    try {
      const res = await fetch(`${apiUrl}/api/headmaster/pta-meetings/${meetingId}/rsvp`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId, rsvpStatus: status, reason })
      });
      const json = await res.json();
      if (json.success) {
        setRsvpStatus(prev => ({ ...prev, [meetingId]: status }));
        Swal.fire({
          icon: "success",
          title: `RSVP Submitted`,
          text: status === "Accept" ? `You have accepted this meeting.` : `You have declined this meeting.`,
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error("Failed to submit RSVP:", error);
    }
  };

  const fmtDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    } catch {
      return d;
    }
  };

  const fmtTime = (d: string) => {
    try {
      return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch {
      return d;
    }
  };

  // KPIs Calculations
  const upcomingMeetings = meetings.filter(m => m.status === "Upcoming");
  const completedMeetings = meetings.filter(m => m.status === "Completed" || m.status === "Cancelled");
  
  const sportsData = getDisplaySportsData();
  const overallFitnessStat = sportsData.stats.find((s: any) => s.label.toLowerCase().includes("overall") || s.label.toLowerCase().includes("fitness"));
  const overallFitnessVal = overallFitnessStat ? overallFitnessStat.value : "Grade A";
  const joinedTeamsCount = sportsData.teams.length;

  const kpis = [
    { label: "Upcoming PTA Meetings", value: upcomingMeetings.length, icon: "fi fi-rr-calendar", color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Booked Appointments", value: appointments.length, icon: "fi fi-rr-clock", color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { label: "Sports Teams Joined", value: joinedTeamsCount, icon: "fi fi-rr-trophy", color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Overall Fitness Level", value: overallFitnessVal, icon: "fi fi-rr-heart", color: "text-purple-500 dark:text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  ];

  // Filter meetings list
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredMeetings = meetings.filter(m => {
    const matchesStatus = meetingsStatusFilter === "All" || m.status.toLowerCase() === meetingsStatusFilter.toLowerCase();
    const matchesSearch = !trimmedQuery ||
      m.title.toLowerCase().includes(trimmedQuery) ||
      (m.description && m.description.toLowerCase().includes(trimmedQuery)) ||
      m.venue.toLowerCase().includes(trimmedQuery);
    return matchesStatus && matchesSearch;
  });

  // Filter appointments list
  const filteredAppointments = appointments.filter(a => {
    const matchesChild = !activeChild || a.studentId === activeChild.studentId;
    const matchesSearch = !trimmedQuery ||
      a.teacherName.toLowerCase().includes(trimmedQuery) ||
      a.studentName.toLowerCase().includes(trimmedQuery) ||
      a.reason.toLowerCase().includes(trimmedQuery);
    return matchesChild && matchesSearch;
  });

  // Paginated Slices
  const totalMeetingsPages = Math.ceil(filteredMeetings.length / pageSize) || 1;
  const paginatedMeetings = filteredMeetings.slice((meetingsPage - 1) * pageSize, meetingsPage * pageSize);

  const totalApptsPages = Math.ceil(filteredAppointments.length / pageSize) || 1;
  const paginatedAppointments = filteredAppointments.slice((apptsPage - 1) * pageSize, apptsPage * pageSize);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "rejected":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
  };

  return (
    <PortalLayout
      title="Parent Portal"
      subtitle="Parent-Teacher Association (PTA) schedules, physical training records, and PT teacher correspondence."
      avatarLetter="P"
      avatarColor="#10b981"
      themeClass="theme-parent"
      accentColor="#10b981"
    >
      {/* Child Switcher */}
      {children.length > 1 && (
        <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-2xl flex-wrap">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5">
            <i className="fi fi-rr-user text-emerald-500 text-sm"></i> Active Student:
          </span>
          {children.map(c => (
            <button
              key={c.studentId}
              onClick={() => setActiveChild(c)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border flex items-center gap-1.5 ${
                activeChild?.studentId === c.studentId
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-sm"
                  : "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-850 text-slate-655 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80"
              }`}
            >
              {c.name.split(" ")[0]} · Class {c.class}{c.section}
            </button>
          ))}
        </div>
      )}

      {/* KPI Row (Responsive Grid cols-2 to cols-4) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
        {kpis.map((k, idx) => (
          <div key={idx} className="kpi-card text-left transition-colors duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${k.bg} ${k.color}`}>
                <i className={`${k.icon} text-lg`}></i>
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${k.color}`}>PTA</span>
            </div>
            {loadingLists || loadingSports ? (
              <div className="h-8 w-16 bg-slate-700 rounded animate-pulse mb-1.5" />
            ) : (
              <div className={`text-3xl font-black ${k.color} mb-1`}>{k.value}</div>
            )}
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content Layout Grid: Tabs list (2 cols) & Side Information / Book form (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Left Side: Dynamic Tabs Rail & Lists Panel (2/3 width on desktop) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 text-left flex flex-col justify-between h-full">
          <div>
            {/* Header with Search and Tab switchers */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                  <i className="fi fi-rr-document-signed text-lg"></i>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-white">PTA Records & Schedules</h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">Manage RSVPs, view completed records, and view appointment statuses.</p>
                </div>
              </div>

              {/* Search filter */}
              {activeView !== "Chat" && activeView !== "Sports" && (
                <div className="relative w-full sm:w-48">
                  <i className="fi fi-rr-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs"></i>
                  <input
                    type="text"
                    placeholder="Search keywords..."
                    value={searchQuery === " " ? "" : searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value || " ")}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl text-xs text-slate-750 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              )}
            </div>

            {/* View selectors */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {[
                { key: "Meetings", label: "PTA Meetings", icon: "fi fi-rr-calendar" },
                { key: "Appointments", label: "My Appointments", icon: "fi fi-rr-clock" },
                { key: "Sports", label: "Sports & Fitness", icon: "fi fi-rr-trophy" },
                { key: "Chat", label: "PT Teacher Chat", icon: "fi fi-rr-comments" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveView(tab.key as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border flex items-center gap-1.5 ${
                    activeView === tab.key
                      ? "bg-emerald-600 border-emerald-500 text-white shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  <i className={tab.icon}></i>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB PANEL 1: PTA Meetings Schedules & Records */}
            {activeView === "Meetings" && (
              <div className="space-y-4">
                {/* Meeting Status filters */}
                <div className="flex items-center justify-between gap-3 pb-1 mb-2">
                  <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Showing Scheduled PTA Meetings
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 shrink-0">
                    Filtered: {filteredMeetings.length} meetings
                  </div>
                </div>

                {/* Meetings List */}
                {loadingLists ? (
                  <div className="space-y-3 py-4">
                    {[1, 2].map(i => (
                      <div key={i} className="h-32 bg-slate-800/40 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : filteredMeetings.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <div className="w-12 h-12 mx-auto bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-350 dark:text-slate-700 mb-3">
                      <i className="fi fi-rr-exclamation text-xl"></i>
                    </div>
                    <p className="text-slate-550 dark:text-slate-400 font-bold text-sm">No meetings found</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">There are no matching PTA meetings on record.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {paginatedMeetings.map(m => (
                      <div
                        key={m.id}
                        className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all duration-300"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                          <div>
                            <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${
                              m.status === "Upcoming"
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
                                : "bg-slate-500/10 text-slate-500 border-slate-500/25"
                            }`}>
                              {m.status}
                            </span>
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-2">{m.title}</h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{fmtDate(m.meetingDate)} at {fmtTime(m.meetingDate)}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1">
                            <i className="fi fi-rr-marker"></i> {m.venue}
                          </span>
                        </div>

                        {m.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">{m.description}</p>
                        )}

                        {m.agenda.length > 0 && (
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">📋 Agenda Points:</span>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{m.agenda.join(" · ")}</p>
                          </div>
                        )}

                        {/* RSVP Action for Upcoming */}
                        {m.status === "Upcoming" && (
                          <div className="pt-4 mt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap gap-2 items-center">
                            <span className="text-[11px] font-semibold text-slate-500 mr-2">Your Attendance RSVP:</span>
                            {(["Accept", "Decline"] as const).map(status => {
                              const current = rsvpStatus[m.id];
                              const isSel = current === status;
                              const style = status === "Accept"
                                ? isSel ? "bg-emerald-600 border-emerald-500 text-white shadow-sm" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                                : isSel ? "bg-rose-600 border-rose-500 text-white shadow-sm" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100";
                              return (
                                <button
                                  key={status}
                                  onClick={() => handleRsvp(m.id, status)}
                                  className={`px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-200 border cursor-pointer ${style}`}
                                >
                                  {status === "Accept" ? "✅ Accept" : "❌ Decline"}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination Meetings */}
                {filteredMeetings.length > pageSize && (
                  <div className="flex items-center justify-center gap-2 pt-6 mt-4 border-t border-slate-100 dark:border-slate-850">
                    <button
                      onClick={() => setMeetingsPage(p => Math.max(p - 1, 1))}
                      disabled={meetingsPage === 1}
                      className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-850 flex items-center justify-center text-xs font-bold text-slate-500 hover:bg-slate-800/10 disabled:opacity-40 transition-colors"
                    >
                      <i className="fi fi-rr-angle-left"></i>
                    </button>
                    <span className="text-xs font-bold text-slate-500 px-3">
                      Page {meetingsPage} of {totalMeetingsPages}
                    </span>
                    <button
                      onClick={() => setMeetingsPage(p => Math.min(p + 1, totalMeetingsPages))}
                      disabled={meetingsPage === totalMeetingsPages}
                      className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-850 flex items-center justify-center text-xs font-bold text-slate-500 hover:bg-slate-800/10 disabled:opacity-40 transition-colors"
                    >
                      <i className="fi fi-rr-angle-right"></i>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB PANEL 2: My Appointments History */}
            {activeView === "Appointments" && (
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-500 mb-2">
                  Total Appointment Requests: {filteredAppointments.length}
                </div>

                {loadingLists ? (
                  <div className="space-y-3 py-4">
                    {[1, 2].map(i => (
                      <div key={i} className="h-20 bg-slate-800/40 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <div className="w-12 h-12 mx-auto bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-350 dark:text-slate-700 mb-3">
                      <i className="fi fi-rr-exclamation text-xl"></i>
                    </div>
                    <p className="text-slate-550 dark:text-slate-400 font-bold text-sm">No appointments scheduled</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Use the right panel to request meetings with teachers.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {paginatedAppointments.map(appt => {
                      const color = getStatusColor(appt.status);
                      return (
                        <div
                          key={appt.id}
                          className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all duration-300"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[10px] font-black uppercase tracking-wider rounded-md">
                                  👩‍🏫 {appt.teacherName}
                                </span>
                                <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border ${color}`}>
                                  {appt.status}
                                </span>
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                  👶 {appt.studentName}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs font-bold">
                                <i className="fi fi-rr-calendar text-slate-400 text-xs"></i>
                                <span>Date: {appt.meetingDate} · Slot: {appt.timeSlot}</span>
                              </div>
                              
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                <span className="font-bold text-slate-400 dark:text-slate-500 mr-1.5">Reason:</span>
                                {appt.reason}
                              </p>
                              {appt.notes && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 bg-amber-500/5 border border-amber-500/10 p-2 rounded-xl">
                                  <span className="font-bold text-amber-500 dark:text-amber-400 mr-1.5">Teacher Note:</span>
                                  {appt.notes}
                                </p>
                              )}
                            </div>

                            <div className="text-left sm:text-right shrink-0">
                              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Requested On</p>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                                {new Date(appt.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric"
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination Appointments */}
                {filteredAppointments.length > pageSize && (
                  <div className="flex items-center justify-center gap-2 pt-6 mt-4 border-t border-slate-100 dark:border-slate-850">
                    <button
                      onClick={() => setApptsPage(p => Math.max(p - 1, 1))}
                      disabled={apptsPage === 1}
                      className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-850 flex items-center justify-center text-xs font-bold text-slate-500 hover:bg-slate-800/10 disabled:opacity-40 transition-colors"
                    >
                      <i className="fi fi-rr-angle-left"></i>
                    </button>
                    <span className="text-xs font-bold text-slate-500 px-3">
                      Page {apptsPage} of {totalApptsPages}
                    </span>
                    <button
                      onClick={() => setApptsPage(p => Math.min(p + 1, totalApptsPages))}
                      disabled={apptsPage === totalApptsPages}
                      className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-850 flex items-center justify-center text-xs font-bold text-slate-500 hover:bg-slate-800/10 disabled:opacity-40 transition-colors"
                    >
                      <i className="fi fi-rr-angle-right"></i>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB PANEL 3: Sports & Fitness (Sports Marks, Teams, Health Logs, Injuries) */}
            {activeView === "Sports" && (
              <div className="space-y-6">
                {loadingSports ? (
                  <div className="space-y-4 py-4 animate-pulse">
                    <div className="h-4 w-1/4 bg-slate-700 rounded" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 bg-slate-800/40 rounded-2xl" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Fitness Stats (Sports Marks) */}
                    <div>
                      <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3.5 flex items-center gap-1.5">
                        <i className="fi fi-rr-heart text-emerald-500 text-sm"></i> Physical Performance & Marks
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sportsData.stats.map((s: any) => (
                          <div key={s.id} className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/60 rounded-2xl hover:border-slate-250 dark:hover:border-slate-750 transition-all duration-300">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                                <i className={`fi ${s.icon} text-emerald-500`}></i> {s.label}
                              </span>
                              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">
                                {s.value}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${s.score}%` }}></div>
                              </div>
                              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500">{s.score}/100</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Joined Sports Teams */}
                    <div>
                      <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3.5 flex items-center gap-1.5">
                        <i className="fi fi-rr-trophy text-amber-500 text-sm"></i> School Teams & Club Memberships
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sportsData.teams.length === 0 ? (
                          <p className="text-xs text-slate-500">Not currently part of any team roster.</p>
                        ) : (
                          sportsData.teams.map((team: any) => (
                            <div key={team.id} className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/60 rounded-2xl flex items-start gap-3.5 hover:border-slate-250 dark:hover:border-slate-750 transition-all duration-300">
                              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/15">
                                <i className={`fi ${team.icon} text-lg`}></i>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{team.name}</h4>
                                  <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[8px] font-black uppercase tracking-wider rounded">
                                    {team.role}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                  <i className="fi fi-rr-target"></i> Event: {team.match}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                  <i className="fi fi-rr-calendar-clock"></i> Date: {team.date}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Events & Recent Physical Logs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Events/Achievements */}
                      <div>
                        <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3.5 flex items-center gap-1.5">
                          <i className="fi fi-rr-medal text-yellow-500 text-sm"></i> Sports Awards & Competitions
                        </h3>
                        <div className="space-y-2.5">
                          {sportsData.events.map((ev: any) => (
                            <div key={ev.id} className="p-3 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/40 rounded-xl flex items-center gap-3">
                              <i className={`fi ${ev.icon || 'fi-rr-cup'} text-yellow-500 text-base`}></i>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-750 dark:text-slate-200 truncate">{ev.title}</p>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{ev.type}</p>
                              </div>
                              <span className="text-[9px] font-bold text-slate-400 shrink-0">{ev.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Fitness / Activity logs */}
                      <div>
                        <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3.5 flex items-center gap-1.5">
                          <i className="fi fi-rr-running text-orange-500 text-sm"></i> Physical Training Log (Weekly)
                        </h3>
                        <div className="space-y-2.5">
                          {sportsData.logs.map((log: any) => (
                            <div key={log.id} className="p-3 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/40 rounded-xl flex items-center justify-between gap-2">
                              <div>
                                <p className="text-xs font-bold text-slate-750 dark:text-slate-200">{log.activity}</p>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Duration: {log.duration} · Intensity: {log.intensity}</p>
                              </div>
                              <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/15">
                                {log.calories} kcal
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Injury Reports & Safety */}
                    {sportsData.injuries.length > 0 && (
                      <div>
                        <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3 flex items-center gap-1.5">
                          <i className="fi fi-rr-shield-exclamation text-rose-500 text-sm"></i> Injury Logs & Safety Reports
                        </h3>
                        <div className="space-y-3">
                          {sportsData.injuries.map((inj: any) => (
                            <div key={inj.id} className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex flex-col gap-1 text-xs">
                              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                                <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                                  ⚠️ {inj.type} ({inj.severity} Severity)
                                </span>
                                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-850 text-slate-655 dark:text-slate-355 font-bold text-[9px]">
                                  Status: {inj.status}
                                </span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-350 leading-relaxed">{inj.description}</p>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1">Logged on: {inj.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* TAB PANEL 4: PT Teacher Chat / Correspondence */}
            {activeView === "Chat" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-550 dark:text-slate-400 flex items-center gap-1.5">
                    <i className="fi fi-rr-comments text-emerald-500 text-sm"></i> PT Staff Message History
                  </div>
                  <button
                    onClick={fetchMessages}
                    disabled={loadingMessages}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                  >
                    <i className={`fi fi-rr-refresh ${loadingMessages ? 'animate-spin' : ''} text-xs`}></i>
                  </button>
                </div>

                {/* Message Log view */}
                <div className="h-[320px] overflow-y-auto p-4 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex flex-col gap-3 scrollbar-thin">
                  {loadingMessages && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-pulse text-xs text-slate-400 font-semibold flex items-center gap-2">
                        <i className="fi fi-rr-refresh animate-spin text-sm"></i> Loading chat history...
                      </div>
                    </div>
                  ) : (
                    getDisplayMessages().map((m: any) => {
                      const isParent = m.sender === "Parent";
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col max-w-[80%] ${isParent ? 'self-end items-end' : 'self-start items-start'}`}
                        >
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-0.5">
                            {isParent ? "You" : m.sender}
                          </span>
                          <div
                            className={`p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                              isParent
                                ? 'bg-emerald-600 border border-emerald-500 text-white rounded-tr-none'
                                : 'bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-slate-750 dark:text-slate-200 rounded-tl-none'
                            }`}
                          >
                            {m.text}
                          </div>
                          <span className="text-[8px] text-slate-450 dark:text-slate-550 mt-1 font-bold">
                            {m.time}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Chat Sender Form */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type message to Physical Education director..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={sendingMessage}
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl text-xs text-slate-755 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage || !chatInput.trim()}
                    className="px-4 py-2.5 bg-emerald-600 border border-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center hover:bg-emerald-700 hover:border-emerald-600 disabled:opacity-40 transition-colors duration-250 cursor-pointer"
                  >
                    {sendingMessage ? (
                      <i className="fi fi-rr-spinner animate-spin"></i>
                    ) : (
                      <i className="fi fi-rr-paper-plane"></i>
                    )}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>

        {/* Right Side: PT Instructors Directory & Request Submission Form (1/3 width on desktop) */}
        <div className="space-y-6">
          {/* PT Instructors Directory */}
          <div className="bg-white dark:bg-slate-900/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 text-left h-fit">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                <i className="fi fi-rr-users text-lg"></i>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">PT Instructors</h2>
                <p className="text-[10px] text-slate-500 mt-0.5">Physical Education staff assigned to your child's standard.</p>
              </div>
            </div>

            {loadingLists ? (
              <div className="space-y-3 py-2 animate-pulse">
                <div className="h-20 bg-slate-800/40 rounded-xl" />
              </div>
            ) : teachers.length === 0 ? (
              <p className="text-xs text-slate-400">No Physical Education teachers found for this school.</p>
            ) : (
              <div className="space-y-3">
                {teachers.map(t => (
                  <div key={t.id} className="p-3.5 bg-slate-50 dark:bg-slate-900/55 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center text-xs border border-emerald-500/20 shrink-0">
                        {t.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-850 dark:text-white truncate">{t.user.name}</h4>
                        <p className="text-[9px] text-emerald-500 font-semibold uppercase tracking-wider mt-0.5">Physical Education Director</p>
                      </div>
                    </div>
                    
                    <div className="text-[10px] text-slate-505 dark:text-slate-400 space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/50">
                      <div className="flex items-center gap-2">
                        <i className="fi fi-rr-envelope text-slate-400"></i>
                        <span className="truncate">{t.user.email || ' rajesh.pe@tnschools.gov.in'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fi fi-rr-phone text-slate-400"></i>
                        <span>+91 94432 10892 (School office)</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => {
                          setFormTeacherId(t.id);
                          document.getElementById("book-appointment-form")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-705 dark:text-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <i className="fi fi-rr-calendar"></i> Book Slot
                      </button>
                      <button
                        onClick={() => {
                          setActiveView("Chat");
                        }}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-[10px] font-bold text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <i className="fi fi-rr-comments"></i> Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Book Appointment Form */}
          <div id="book-appointment-form" className="bg-white dark:bg-slate-900/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 text-left h-fit">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                <i className="fi fi-rr-pencil text-lg"></i>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">Book Appointment</h2>
                <p className="text-[10px] text-slate-500 mt-0.5">Request a one-on-one meeting slot with a PT teacher.</p>
              </div>
            </div>

            <form onSubmit={handleSubmitAppointment} className="space-y-4">
              {/* Child selector */}
              {children.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Select Child</label>
                  <select
                    value={formChildId}
                    onChange={(e) => {
                      setFormChildId(e.target.value);
                      const sel = children.find(c => c.studentId === e.target.value);
                      if (sel) setActiveChild(sel);
                    }}
                    disabled={submittingAppt || children.length <= 1}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-250 focus:outline-none cursor-pointer"
                  >
                    {children.map(c => (
                      <option key={c.studentId} value={c.studentId}>
                        {c.name} (Class {c.class}{c.section})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* PT Teacher selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Choose PT Teacher</label>
                <select
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(e.target.value)}
                  disabled={submittingAppt || teachers.length === 0}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-250 focus:outline-none cursor-pointer"
                >
                  {teachers.length === 0 ? (
                    <option value="">No PT teachers available</option>
                  ) : (
                    teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.user.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Date selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Meeting Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  disabled={submittingAppt}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-250 focus:outline-none cursor-pointer"
                  required
                />
              </div>

              {/* Slot selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Select Time Slot</label>
                <select
                  value={formSlot}
                  onChange={(e) => setFormSlot(e.target.value)}
                  disabled={submittingAppt || getDisplaySlots().length === 0}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-250 focus:outline-none cursor-pointer"
                >
                  {getDisplaySlots().map(slot => (
                    <option key={slot.id} value={slot.timeSlot}>
                      {slot.timeSlot}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason Details */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Reason details</label>
                <textarea
                  rows={3}
                  placeholder="Mention details like performance review, syllabus, behavior..."
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  disabled={submittingAppt}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none resize-none"
                  required
                />
              </div>

              {/* Feedback alert */}
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <i className="fi fi-rr-exclamation"></i> {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <i className="fi fi-rr-check-circle"></i> {formSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={submittingAppt}
                className="w-full bg-emerald-600 border border-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 hover:border-emerald-600 disabled:opacity-40 transition-colors duration-250 cursor-pointer"
              >
                {submittingAppt ? (
                  <>Booking...</>
                ) : (
                  <>
                    <i className="fi fi-rr-paper-plane text-xs"></i> Send Request
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

    </PortalLayout>
  );
}
