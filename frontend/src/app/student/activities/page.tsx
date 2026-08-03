"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import PortalLayout from "@/components/PortalLayout";
import Link from "next/link";
import Swal from "sweetalert2";

interface Club {
  id: string;
  name: string;
  category: string;
  icon: string;
  description?: string;
  sponsor?: string;
  meetingTime?: string;
}

interface ClubMember {
  name: string;
  role: string;
  icon: string;
  category: string;
  nextEvent: string;
}

interface ClubEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  icon: string;
  themeColor: string;
}

const getApiBase = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }
  return url;
};

const API_BASE = getApiBase();

const getCategoryTheme = (cat: string) => {
  switch (cat) {
    case "Environment": return {
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      tagBg: "bg-emerald-500/20",
      gradient: "from-emerald-500 to-teal-600",
      btnBorder: "border-emerald-500/40",
      btnHover: "hover:bg-emerald-500/10"
    };
    case "Arts": return {
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20",
      tagBg: "bg-amber-500/20",
      gradient: "from-amber-500 to-orange-600",
      btnBorder: "border-amber-500/40",
      btnHover: "hover:bg-amber-500/10"
    };
    case "Science": return {
      color: "text-purple-500",
      bg: "bg-purple-500/10 border-purple-500/20",
      tagBg: "bg-purple-500/20",
      gradient: "from-purple-500 to-indigo-650",
      btnBorder: "border-purple-500/40",
      btnHover: "hover:bg-purple-500/10"
    };
    case "Literature": return {
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20",
      tagBg: "bg-blue-500/20",
      gradient: "from-blue-500 to-cyan-600",
      btnBorder: "border-blue-500/40",
      btnHover: "hover:bg-blue-500/10"
    };
    case "Academics": return {
      color: "text-indigo-500",
      bg: "bg-indigo-500/10 border-indigo-500/20",
      tagBg: "bg-indigo-500/20",
      gradient: "from-indigo-500 to-violet-600",
      btnBorder: "border-indigo-500/40",
      btnHover: "hover:bg-indigo-500/10"
    };
    case "Sports": return {
      color: "text-orange-500",
      bg: "bg-orange-500/10 border-orange-500/20",
      tagBg: "bg-orange-500/20",
      gradient: "from-orange-500 to-red-600",
      btnBorder: "border-orange-500/40",
      btnHover: "hover:bg-orange-500/10"
    };
    default: return {
      color: "text-slate-500",
      bg: "bg-slate-500/10 border-slate-500/20",
      tagBg: "bg-slate-500/20",
      gradient: "from-slate-500 to-slate-700",
      btnBorder: "border-slate-500/40",
      btnHover: "hover:bg-slate-500/10"
    };
  }
};

const renderFlaticon = (iconStr: string, sizeClass = "text-xl", colorClass = "text-blue-450") => {
  const s = iconStr || "";
  if (s.startsWith("fi ")) {
    return <i className={`${s} ${sizeClass} ${colorClass}`} />;
  }
  // Mapping legacy emojis
  if (s === "🌱") return <i className={`fi fi-rr-leaf ${sizeClass} ${colorClass}`} />;
  if (s === "🎭") return <i className={`fi fi-rr-palette ${sizeClass} ${colorClass}`} />;
  if (s === "🔬") return <i className={`fi fi-rr-flask ${sizeClass} ${colorClass}`} />;
  if (s === "🏆") return <i className={`fi fi-rr-trophy ${sizeClass} ${colorClass}`} />;
  if (s === "♾️") return <i className={`fi fi-rr-calculator ${sizeClass} ${colorClass}`} />;
  if (s === "✍️") return <i className={`fi fi-rr-book-open-reader ${sizeClass} ${colorClass}`} />;
  if (s === "💻") return <i className={`fi fi-rr-laptop ${sizeClass} ${colorClass}`} />;
  if (s === "🤖") return <i className={`fi fi-rr-bot ${sizeClass} ${colorClass}`} />;
  if (s === "🎙️") return <i className={`fi fi-rr-microphone ${sizeClass} ${colorClass}`} />;
  if (s === "🎨") return <i className={`fi fi-rr-paint-brush ${sizeClass} ${colorClass}`} />;
  if (s === "🗓️") return <i className={`fi fi-rr-calendar-clock ${sizeClass} ${colorClass}`} />;
  if (s === "⭐") return <i className={`fi fi-rr-star ${sizeClass} ${colorClass}`} />;
  return <i className={`fi fi-rr-users ${sizeClass} ${colorClass}`} />;
};

const getClubEligibility = (clubName: string) => {
  const name = clubName.toLowerCase();
  if (name.includes("service scheme") || name.includes("nss") || name.includes("ribbon") || name.includes("rrc")) {
    return { label: "Class 11 - 12", minClass: 11, maxClass: 12, levels: ["higher"] };
  }
  if (name.includes("cadet corps") || name.includes("ncc") || name.includes("safety patrol") || name.includes("rsp")) {
    return { label: "Class 9 - 12", minClass: 9, maxClass: 12, levels: ["high", "higher"] };
  }
  if (name.includes("red cross") || name.includes("jrc") || name.includes("scouts") || name.includes("guides") || name.includes("green corps") || name.includes("eco club")) {
    return { label: "Class 6 - 10", minClass: 6, maxClass: 10, levels: ["middle", "high"] };
  }
  return { label: "Class 6 - 12", minClass: 6, maxClass: 12, levels: ["middle", "high", "higher"] };
};

const getClubInfo = (clubName: string) => {
  const name = clubName.toLowerCase();
  
  if (name.includes("red cross") || name.includes("jrc")) {
    return {
      mission: "To train student volunteers in health, safety, service, and promote friendly relationships among young people.",
      activities: [
        "First aid & emergency response training",
        "Community health hygiene campaigns",
        "Blood donation awareness rallies",
        "Disaster relief simulation drills"
      ],
      meeting: "Every Tuesday, 4:00 PM – 5:00 PM",
      sponsor: "JRC Faculty Coordinator"
    };
  }
  
  if (name.includes("green corps") || name.includes("eco club")) {
    return {
      mission: "To create environmental awareness among school children through participation in green activities and conservation projects.",
      activities: [
        "Campus tree plantation & garden maintenance",
        "Waste segregation & recycling workshops",
        "Plastic-free campaign in the local community",
        "World Environment Day celebrations & quiz meets"
      ],
      meeting: "Every Friday, 3:30 PM – 4:30 PM",
      sponsor: "Eco-Club Facilitator"
    };
  }

  if (name.includes("scouts") || name.includes("guides")) {
    return {
      mission: "To develop character, citizenship, and physical fitness in students through outdoor education, adventure, and social service.",
      activities: [
        "Camping, hiking, and pioneering skills",
        "Knot-tying & lashings drills",
        "First aid & rescue operations training",
        "Weekly parade & physical training drill sessions"
      ],
      meeting: "Every Thursday, 4:00 PM – 5:00 PM",
      sponsor: "Scout Master & Guide Captain"
    };
  }

  if (name.includes("sports")) {
    return {
      mission: "To promote physical fitness, teamwork, sportsmanship, and coordinate competitive athletic events in the school.",
      activities: [
        "Inter-house sports meets & tournaments",
        "Athletics training (track, field, and relays)",
        "Team sports practices (Football, Volleyball, Kabaddi)",
        "Fitness assessment and performance logging"
      ],
      meeting: "Monday & Wednesday, 3:30 PM – 5:00 PM",
      sponsor: "Physical Education Teacher (PET)"
    };
  }

  if (name.includes("service scheme") || name.includes("nss")) {
    return {
      mission: "To develop student personality through community service and foster social responsibility, embodying 'Not Me But You'.",
      activities: [
        "Rural area community service camps",
        "Health & literacy drives in neighboring villages",
        "Road safety and environmental awareness rallies",
        "Leadership development and volunteer coaching"
      ],
      meeting: "Saturdays, 9:00 AM – 12:00 PM",
      sponsor: "NSS Programme Officer"
    };
  }

  if (name.includes("cadet corps") || name.includes("ncc")) {
    return {
      mission: "To develop character, discipline, leadership, and a spirit of adventure in youth, providing a pool of trained military cadets.",
      activities: [
        "Military drill practice and parade training",
        "Camp setups & survival skills workshops",
        "Basic rifle shooting and navigation training",
        "National integration camp participation"
      ],
      meeting: "Saturdays, 8:00 AM – 11:30 AM",
      sponsor: "NCC Associated Officer"
    };
  }

  return {
    mission: "Join us to build your portfolio, make lifelong friends, and develop critical leadership skills!",
    activities: [
      "Weekly team discussions and planning",
      "Interactive peer-led workshops",
      "Annual club showcase representation",
      "Social meetings & group events"
    ],
    meeting: "Weekly (Day/Time TBD)",
    sponsor: "Faculty Advisor"
  };
};

const getDaysInMonth = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const days = [];
  const startDay = date.getDay();
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export default function ExtracurricularsPage() {
  const { data: session, status } = useSession();
  const schoolId = (session?.user as any)?.schoolId || "";

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStandard, setSelectedStandard] = useState<string>("all");
  const [studentProfile, setStudentProfile] = useState<any>(null);

  const [discoverClubs, setDiscoverClubs] = useState<Club[]>([]);
  const [myClubs, setMyClubs] = useState<ClubMember[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<ClubEvent[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [petCoordinator, setPetCoordinator] = useState<string>("Mr. Ramesh (PET coordinator)");
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedClubForModal, setSelectedClubForModal] = useState<Club | null>(null);

  const eligibleMyClubs = useMemo(() => {
    return myClubs.filter(club => {
      const eligibility = getClubEligibility(club.name);
      const userClassNum = studentProfile ? parseInt(studentProfile.class || "0", 10) : 0;
      const userLevel = userClassNum >= 11 ? "higher" : userClassNum >= 9 ? "high" : "middle";
      return eligibility.levels.includes(userLevel);
    });
  }, [myClubs, studentProfile]);

  const fetchActivities = useCallback(async () => {
    if (!schoolId) return;
    try {
      const res = await fetch(`${API_BASE}/api/activities?schoolId=${schoolId}&studentId=${(session?.user as any)?.id}`);
      const json = await res.json();

      if (json.success && json.data) {
        const clubsList: Club[] = json.data.discoverClubs || [];
        setDiscoverClubs(clubsList);

        // Fetch member list counts
        clubsList.forEach(async (c) => {
          try {
            const r = await fetch(`${API_BASE}/api/activities/club/${c.id}/members`);
            const j = await r.json();
            if (j.success && j.data) {
              setMemberCounts(prev => ({ ...prev, [c.id]: j.data.length }));
            }
          } catch {
            // ignore
          }
        });

        // Format event dates
        const formattedEvents = (json.data.upcomingEvents || []).map((e: any) => {
          const dateObj = new Date(e.eventDate);
          return {
            ...e,
            date: dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
          };
        });
        setUpcomingEvents(formattedEvents);

        // Fetch logged-in student's joined clubs
        let fetchedRealClubs = false;
        if (session?.user) {
          const studentRes = await fetch(`${API_BASE}/api/students?schoolId=${schoolId}`);
          const studentJson = await studentRes.json();
          if (studentJson.success) {
            const myStudent = studentJson.data.find((s: any) => s.userId === (session.user as any).id);
            if (myStudent) {
              setStudentProfile(myStudent);
              
              // Automatically initialize standard filtering to the student's actual class range
              const studentClassNum = parseInt(myStudent.class || "0", 10);
              if (studentClassNum >= 11) {
                setSelectedStandard("higher");
              } else if (studentClassNum >= 9) {
                setSelectedStandard("high");
              } else if (studentClassNum >= 6) {
                setSelectedStandard("middle");
              }

              const myClubsRes = await fetch(`${API_BASE}/api/activities/student/${myStudent.id}`);
              const myClubsJson = await myClubsRes.json();
              if (myClubsJson.success && myClubsJson.data?.myClubs) {
                setMyClubs(myClubsJson.data.myClubs);
                fetchedRealClubs = true;
              }
            }
          }

          // Fetch PET coordinator dynamically from school staff list
          try {
            const staffRes = await fetch(`${API_BASE}/api/teacher/list?schoolId=${schoolId}`);
            const staffJson = await staffRes.json();
            if (staffJson.success && staffJson.data) {
              const petStaff = staffJson.data.find((s: any) => {
                const sub = (s.subject || "").toLowerCase();
                return sub === 'pet' || sub === 'p.e.t' || sub === 'p.e.t.' || sub.includes('physical educ') || sub.includes('physical train') || sub.includes('sports');
              });
              if (petStaff) {
                const cleanName = petStaff.name.split(" (")[0];
                setPetCoordinator(`${cleanName} (PET coordinator)`);
              }
            }
          } catch (err) {
            console.error("Failed to fetch PET coordinator", err);
          }
        }

        if (!fetchedRealClubs) {
          setMyClubs([]); // Clean, dynamic empty state if student has not joined any clubs
        }
      }
    } catch (error) {
      console.error("Failed to fetch activities", error);
    } finally {
      setLoading(false);
    }
  }, [session, schoolId]);

  useEffect(() => {
    if (status === "loading") return;
    fetchActivities();
  }, [status, fetchActivities]);

  const targetStandard = useMemo(() => {
    if (!studentProfile) return selectedStandard;
    const studentClassNum = parseInt(studentProfile.class || "0", 10);
    if (studentClassNum >= 11) return "higher";
    if (studentClassNum >= 9) return "high";
    return "middle";
  }, [studentProfile, selectedStandard]);

  const filteredClubs = useMemo(() => {
    return discoverClubs.filter(club => {
      const eligibility = getClubEligibility(club.name);
      const matchesStandard = targetStandard === "all" || eligibility.levels.includes(targetStandard);
      const matchesTab = activeTab === "all" || club.category.toLowerCase() === activeTab.toLowerCase();
      const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStandard && matchesTab && matchesSearch;
    });
  }, [discoverClubs, targetStandard, activeTab, searchQuery]);

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    cats.add("all");
    discoverClubs.forEach(club => {
      const eligibility = getClubEligibility(club.name);
      const matchesStandard = targetStandard === "all" || eligibility.levels.includes(targetStandard);
      if (matchesStandard && club.category) {
        cats.add(club.category.toLowerCase());
      }
    });
    return Array.from(cats);
  }, [discoverClubs, targetStandard]);

  const dynamicUpcomingEvents = useMemo(() => {
    if (upcomingEvents.length > 0) {
      return upcomingEvents;
    }
    
    // Generate dynamic mock events based on joined clubs
    return eligibleMyClubs.map((mc, idx) => {
      const mock = getMockEventsForClub(mc.name);
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + mock.daysOffset);
      return {
        id: `mock-event-${idx}`,
        title: mock.title,
        type: mock.type,
        icon: mock.icon,
        themeColor: mock.themeColor,
        date: eventDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      };
    });
  }, [upcomingEvents, eligibleMyClubs]);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthName = today.toLocaleString('en-US', { month: 'long' });

  const calendarDays = useMemo(() => {
    return getDaysInMonth(year, month);
  }, [year, month]);

  const getEventForDate = (date: Date | null) => {
    if (!date) return null;
    return dynamicUpcomingEvents.find(e => {
      const d = new Date(e.date || "");
      return d.getDate() === date.getDate() &&
             d.getMonth() === date.getMonth() &&
             d.getFullYear() === date.getFullYear();
    });
  };

  function getMockEventsForClub(clubName: string) {
    const name = clubName.toLowerCase();
    if (name.includes("service scheme") || name.includes("nss")) {
      return {
        title: "NSS Community Service Camp",
        type: "Social Service",
        icon: "fi fi-rr-heart",
        themeColor: "text-red-500",
        daysOffset: 3
      };
    }
    if (name.includes("cadet corps") || name.includes("ncc")) {
      return {
        title: "NCC Republic Day Parade Drill",
        type: "Drill Practice",
        icon: "fi fi-rr-star",
        themeColor: "text-blue-500",
        daysOffset: 5
      };
    }
    if (name.includes("red cross") || name.includes("jrc")) {
      return {
        title: "JRC First Aid Training Session",
        type: "Workshop",
        icon: "fi fi-rr-heart",
        themeColor: "text-rose-500",
        daysOffset: 2
      };
    }
    if (name.includes("scouts") || name.includes("guides")) {
      return {
        title: "Scouts & Guides Campout Knot-Tying",
        type: "Skills Practice",
        icon: "fi fi-rr-star",
        themeColor: "text-amber-500",
        daysOffset: 4
      };
    }
    if (name.includes("green corps") || name.includes("eco club")) {
      return {
        title: "Eco Club Campus Tree Planting",
        type: "Environmental",
        icon: "fi fi-rr-leaf",
        themeColor: "text-emerald-500",
        daysOffset: 6
      };
    }
    if (name.includes("sports")) {
      return {
        title: "Sports Club Annual Athletics Meet",
        type: "Sports Event",
        icon: "fi fi-rr-star",
        themeColor: "text-orange-500",
        daysOffset: 7
      };
    }
    return {
      title: `${clubName} Weekly Meetup`,
      type: "Club Meeting",
      icon: "fi fi-rr-calendar-clock",
      themeColor: "text-purple-500",
      daysOffset: 5
    };
  };

  const handleJoinLeave = async (club: Club) => {
    if (!studentProfile) {
      Swal.fire("Error", "Student profile not loaded. Please try logging in again.", "error");
      return;
    }

    const eligibility = getClubEligibility(club.name);
    const userClassNum = parseInt(studentProfile.class || "0", 10);
    const initialStandard = userClassNum >= 11 ? "higher" : userClassNum >= 9 ? "high" : "middle";
    const isEligible = eligibility.levels.includes(initialStandard);

    if (!isEligible) {
      Swal.fire("Access Restricted", `This club is restricted to {eligibility.label}. Your current class standard is Class ${studentProfile.class}.`, "warning");
      return;
    }

    const isMember = eligibleMyClubs.some(c => c.name === club.name);

    if (isMember) {
      const confirm = await Swal.fire({
        title: `Leave ${club.name}?`,
        text: "Are you sure you want to leave this club?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Yes, leave"
      });

      if (confirm.isConfirmed) {
        try {
          const res = await fetch(`${API_BASE}/api/activities/leave`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clubId: club.id, studentId: studentProfile.id })
          });
          const json = await res.json();
          if (json.success) {
            Swal.fire("Left Club", `You have successfully left ${club.name}.`, "success");
            fetchActivities();
          } else {
            Swal.fire("Error", json.error || "Failed to leave club.", "error");
          }
        } catch (err) {
          Swal.fire("Error", "Network error. Failed to leave club.", "error");
        }
      }
    } else {
      const confirm = await Swal.fire({
        title: `Join ${club.name}?`,
        text: `Do you want to sign up as a member of ${club.name}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#8b5cf6",
        confirmButtonText: "Yes, Join!"
      });

      if (confirm.isConfirmed) {
        try {
          const res = await fetch(`${API_BASE}/api/activities/join`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clubId: club.id, studentId: studentProfile.id })
          });
          const json = await res.json();
          if (json.success) {
            Swal.fire("Joined Club!", `Welcome to ${club.name}! You are now a member.`, "success");
            fetchActivities();
          } else {
            Swal.fire("Error", json.error || "Failed to join club.", "error");
          }
        } catch (err) {
          Swal.fire("Error", "Network error. Failed to join club.", "error");
        }
      }
    }
  };

  useEffect(() => {
    if (activeTab !== "all" && !availableCategories.includes(activeTab)) {
      setActiveTab("all");
    }
  }, [availableCategories, activeTab]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        {/* Animated Rings */}
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-purple-200/50 dark:border-purple-900/50"></div>
          <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" style={{ animationDuration: '1.5s' }}></div>
          <div className="absolute inset-2 rounded-full border-4 border-emerald-500 border-b-transparent animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
          <div className="text-3xl text-purple-600 animate-bounce" style={{ animationDuration: '2s' }}>
            <i className="fi fi-rr-palette" />
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-widest uppercase mb-2">
          Loading<span className="animate-pulse">...</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-xs flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
          Discovering clubs and events for you
        </p>
      </div>
    );
  }

  return (
    <PortalLayout
      title="Extracurricular Activities"
      subtitle="Discover your passions, build new skills, and connect with peers outside the classroom."
      avatarLetter="A"
      avatarColor="#8b5cf6"
      themeClass="theme-student"
      accentColor="#8b5cf6"
    >
      <div className="flex flex-col lg:flex-row gap-6 text-left w-full items-start">
        {/* Left Column: My Clubs & Events */}
        <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0 space-y-6">
          
          {/* My Clubs */}
          <div className="glass rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
            <h2 className="text-base font-bold text-black dark:text-white mb-4 flex items-center gap-2">
              {renderFlaticon("⭐", "text-lg text-amber-500")} My Clubs
            </h2>
            <div className="space-y-4">
              {eligibleMyClubs.map((club, idx) => {
                const theme = getCategoryTheme(club.category);
                return (
                  <div 
                    key={idx} 
                    onClick={() => {
                      const realClub = discoverClubs.find(c => c.name === club.name);
                      if (realClub) setSelectedClubForModal(realClub);
                    }}
                    className="relative overflow-hidden rounded-2xl p-4 border border-slate-200 dark:border-slate-700/50 group cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                    <div className="relative z-10 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                        {renderFlaticon(club.icon, "text-xl", theme.color)}
                      </div>
                      <div>
                        <h3 className="font-bold text-black dark:text-white text-xs leading-snug mb-1">{club.name}</h3>
                        <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-black dark:text-slate-300">{club.role}</span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2.5 flex items-center gap-1.5 font-medium">
                          <i className="fi fi-rr-calendar-clock text-slate-400" /> {club.nextEvent}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {eligibleMyClubs.length === 0 && (
                <div className="text-center py-8 text-slate-550 dark:text-slate-400 text-xs italic">
                  You haven't joined any school clubs yet.
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Events Calendar */}
          <div className="glass rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-black dark:text-white flex items-center gap-2">
                {renderFlaticon("🗓️", "text-lg text-purple-500")} Upcoming Events
              </h2>
              <button 
                onClick={() => setShowCalendarModal(true)} 
                className="text-[11px] text-purple-650 dark:text-purple-400 hover:text-purple-755 dark:hover:text-purple-300 font-bold transition-all"
              >
                View Calendar
              </button>
            </div>
            
            <ul className="space-y-0">
              {dynamicUpcomingEvents.map((event, idx) => (
                <li key={idx} className="relative flex gap-4 pb-4">
                  {/* Timeline line */}
                  {idx !== dynamicUpcomingEvents.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-slate-200 dark:bg-slate-800"></div>
                  )}
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-850 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 z-10">
                    {renderFlaticon(event.icon, "text-xs", event.themeColor)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-black dark:text-white truncate">{event.title}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1 font-semibold">
                      <span>{event.date}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-650"></span>
                      <span className={event.themeColor}>{event.type}</span>
                    </p>
                  </div>
                </li>
              ))}

              {dynamicUpcomingEvents.length === 0 && (
                <div className="text-center py-6 text-slate-550 dark:text-slate-400 text-xs italic">
                  No upcoming events logged.
                </div>
              )}
            </ul>
          </div>

          {/* Activity Portfolio Shortcut */}
          <div className="glass rounded-3xl p-5 sm:p-6 border border-purple-500/30 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-transparent">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-500/30">
                <i className="fi fi-rr-trophy text-2xl" />
              </div>
              <div>
                <h3 className="font-bold text-black dark:text-white text-xs sm:text-sm">Activity Portfolio</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Track your extracurricular achievements.</p>
              </div>
            </div>
            <Link href="/student/portfolio" className="block text-center w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-500/20">
              View Portfolio
            </Link>
          </div>
        </div>

        {/* Right Column: Discover Clubs Grid */}
        <div className="flex-1 min-w-0 w-full">
          <div className="glass rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-transparent">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-base sm:text-lg font-bold text-black dark:text-white flex items-center gap-2">
                <i className="fi fi-rr-search text-purple-500 text-lg sm:text-xl" /> Discover Clubs & Societies
              </h2>
              
              <div className="relative w-full sm:w-auto">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clubs..." 
                  className="w-full sm:w-64 bg-white dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 pl-10 text-xs text-black dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-slate-555">
                  <i className="fi fi-rr-search text-xs" />
                </span>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
              {availableCategories.map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                    activeTab === tab 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-slate-105 dark:bg-slate-800 text-black dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-purple-600 dark:hover:text-white border border-slate-200 dark:border-slate-755'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Clubs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredClubs.map((club) => {
                const theme = getCategoryTheme(club.category);
                const eligibility = getClubEligibility(club.name);
                const isMember = eligibleMyClubs.some(c => c.name === club.name);
                const isEligible = !studentProfile || eligibility.levels.includes(targetStandard);

                return (
                  <div 
                    key={club.id} 
                    className="relative rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer group flex flex-col justify-between h-full overflow-hidden"
                  >
                    {/* Decorative Background Glow based on Theme */}
                    <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-3xl transition-transform duration-500 group-hover:scale-150 ${theme.bg.split(' ')[0]}`}></div>
                    
                    <div onClick={() => setSelectedClubForModal(club)} className="relative z-10 flex-1">
                      <div className="flex justify-between items-start mb-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm ${theme.bg}`}>
                          {renderFlaticon(club.icon, "text-2xl", theme.color)}
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm border ${theme.tagBg} ${theme.color} border-current/20`}>
                            {club.category}
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50">
                            {eligibility.label}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1.5 leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">{club.name}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-1.5 font-semibold">
                        <i className="fi fi-rr-users text-slate-400" /> 
                        <span className="text-slate-700 dark:text-slate-300 font-bold">{memberCounts[club.id] ?? 0}</span> Active Members
                      </p>
                    </div>
                    
                    <div className="relative z-10 mt-auto">
                      {isMember ? (
                        <button 
                          disabled
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold border-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 cursor-default"
                        >
                          <i className="fi fi-rr-check-circle" /> Joined Member
                        </button>
                      ) : (
                        <button 
                          onClick={() => setSelectedClubForModal(club)}
                          className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border-2 ${
                            !isEligible && studentProfile
                              ? 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                              : `bg-transparent ${theme.btnBorder} ${theme.btnHover} ${theme.color}`
                          }`}
                          disabled={!isEligible && !!studentProfile}
                        >
                          {!isEligible && studentProfile ? (
                            <>Restricted Standard</>
                          ) : (
                            <>
                              Learn More <i className="fi fi-rr-arrow-right transition-transform group-hover:translate-x-1" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {filteredClubs.length === 0 && (
                <div className="col-span-full text-center py-16 text-slate-550 dark:text-slate-400 italic text-xs">
                  <div className="text-4xl mb-3">👻</div>
                  <h3 className="text-black dark:text-white font-bold mb-1">No clubs found</h3>
                  <p className="text-slate-400">Try selecting a different category.</p>
                </div>
              )}
            </div>

            {/* Standard Filters - Only shown for Admins/Staff to browse dynamically */}
            {!studentProfile && (
              <div className="mt-8 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/60 text-left">
                <div className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-3 tracking-widest flex items-center gap-1.5">
                  <i className="fi fi-rr-settings text-purple-500" /> Dynamic Standard-wise Selection
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All Classes (6-12)", icon: "🏫" },
                    { value: "middle", label: "Middle (Class 6-8)", icon: "🎒" },
                    { value: "high", label: "High School (Class 9-10)", icon: "🎯" },
                    { value: "higher", label: "Higher Sec (Class 11-12)", icon: "🚀" }
                  ].map((std) => (
                    <button 
                      key={std.value}
                      onClick={() => setSelectedStandard(std.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        selectedStandard === std.value 
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/10' 
                          : 'bg-white dark:bg-slate-950/40 text-slate-655 dark:text-slate-400 hover:border-slate-400 hover:text-purple-600 dark:hover:text-white border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <span>{std.icon}</span> {std.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative text-left animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowCalendarModal(false)}
              className="absolute top-4 right-4 text-slate-450 hover:text-slate-650 dark:hover:text-white text-lg font-bold"
            >
              ✕
            </button>
            
            <h3 className="text-base font-black text-black dark:text-white mb-1 flex items-center gap-2">
              <i className="fi fi-rr-calendar-clock text-purple-500" /> {monthName} {year} Events
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-6 font-semibold">
              Interactive schedule of your joined clubs and activities.
            </p>

            {/* Calendar Grid Headers */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="py-1">{day}</div>
              ))}
            </div>

            {/* Calendar Grid Cells */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {calendarDays.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                const event = getEventForDate(day);
                const isToday = day.getDate() === today.getDate() && day.getMonth() === today.getMonth();

                return (
                  <div 
                    key={day.toISOString()} 
                    className={`relative aspect-square flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                      event 
                        ? 'bg-purple-650 text-white shadow-md shadow-purple-500/30 cursor-pointer hover:scale-105' 
                        : isToday 
                          ? 'bg-slate-100 dark:bg-slate-800 text-purple-600 border border-purple-500/30' 
                          : 'text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={event ? `${event.title} (${event.type})` : undefined}
                    onClick={() => {
                      if (event) {
                        Swal.fire({
                          title: event.title,
                          text: `This is a ${event.type} event scheduled on ${event.date}.`,
                          icon: "info",
                          confirmButtonColor: "#8b5cf6"
                        });
                      }
                    }}
                  >
                    {day.getDate()}
                    {event && (
                      <span className="absolute bottom-1 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Agenda list */}
            <div className="border-t border-slate-150 dark:border-slate-800 pt-4">
              <div className="text-[10px] font-black uppercase text-slate-455 tracking-widest mb-3">
                Agenda List
              </div>
              <div className="space-y-3 max-h-36 overflow-y-auto pr-1">
                {dynamicUpcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-855 rounded-xl border border-slate-100 dark:border-slate-800/40">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                      {renderFlaticon(event.icon, "text-xs", event.themeColor)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-black dark:text-white truncate">{event.title}</h4>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                        {event.date} • <span className={event.themeColor}>{event.type}</span>
                      </p>
                    </div>
                  </div>
                ))}
                {dynamicUpcomingEvents.length === 0 && (
                  <div className="text-center py-4 text-xs text-slate-400 italic">
                    No events scheduled this month.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Club Details Modal */}
      {selectedClubForModal && (() => {
        const club = selectedClubForModal;
        const info = getClubInfo(club.name);
        const eligibility = getClubEligibility(club.name);
        const isMember = eligibleMyClubs.some(c => c.name === club.name);
        
        const userClassNum = studentProfile ? parseInt(studentProfile.class || "0", 10) : 0;
        const userLevel = userClassNum >= 11 ? "higher" : userClassNum >= 9 ? "high" : "middle";
        const isEligible = eligibility.levels.includes(userLevel);
        const theme = getCategoryTheme(club.category);

        const mission = club.description && club.description !== "Join us to build your portfolio, make lifelong friends, and develop critical leadership skills!"
          ? club.description 
          : info.mission;
        const meeting = club.meetingTime && club.meetingTime !== "TBD" 
          ? club.meetingTime 
          : info.meeting;
        const sponsor = club.sponsor && club.sponsor !== "Faculty Sponsor" 
          ? club.sponsor 
          : info.sponsor;

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative text-left animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={() => setSelectedClubForModal(null)}
                className="absolute top-4 right-4 text-slate-455 hover:text-slate-650 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
              
              {/* Category Tag */}
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-4 border ${theme.bg} ${theme.color}`}>
                {club.category}
              </span>
              
              <h3 className="text-xl font-black text-black dark:text-white mb-2 flex items-center gap-2">
                {renderFlaticon(club.icon, "text-2xl", theme.color)} {club.name}
              </h3>
              
              {/* Eligibility & Info Bar */}
              <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-500 dark:text-slate-455 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-850 px-2 py-1 rounded-lg">
                  🎯 Eligibility: {eligibility.label}
                </span>
                <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-850 px-2 py-1 rounded-lg">
                  ⏰ Meetings: {meeting}
                </span>
              </div>

              {/* Mission Statement */}
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 font-black">Our Mission</h4>
                <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">
                  {mission}
                </p>
              </div>

              {/* Key Activities */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 font-black">Key Activities & Events</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-655 dark:text-slate-400 font-semibold">
                  {info.activities.map((act, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className={`text-[8px] mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full ${theme.color.replace("text-", "bg-")}`} />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer Meta & Actions */}
              <div className="border-t border-slate-150 dark:border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-slate-455 font-bold block uppercase tracking-wider">Faculty Sponsor</span>
                  <span className="text-xs text-black dark:text-white font-black">{sponsor}</span>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedClubForModal(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                  >
                    Close
                  </button>
                  
                  {isMember ? (
                    <span className="px-5 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shrink-0">
                      ✓ Joined Member
                    </span>
                  ) : (
                    <button 
                      onClick={() => {
                        setSelectedClubForModal(null);
                        handleJoinLeave(club);
                      }}
                      className={
                        !isEligible && studentProfile
                          ? "px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold cursor-not-allowed shadow-none"
                          : "px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white border border-purple-600 rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-500/20"
                      }
                      disabled={!isEligible && !!studentProfile}
                    >
                      {!isEligible && studentProfile ? 'Restricted Standard' : 'Join Club'}
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        );
      })()}
    </PortalLayout>
  );
}
