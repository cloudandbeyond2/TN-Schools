"use client";
import { Calendar } from "lucide-react";


import PortalLayout from "@/components/PortalLayout";
import { useState, useEffect } from "react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import { useSession } from "next-auth/react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const renderEventIcon = (iconStr: string) => {
  const s = iconStr || "";
  if (s.startsWith("fi ") || s.startsWith("fi-")) {
    const cls = s.startsWith("fi ") ? s : `fi ${s}`;
    return <i className={`${cls} text-sm`} />;
  }
  return <span className="text-sm">{s}</span>;
};

interface Club {
  id: string;
  name: string;
  category: string;
  icon: string;
  themeColor: string;
}

interface ClubEvent {
  id: string;
  title: string;
  eventDate: string;
  type: string;
  icon: string;
  themeColor: string;
  clubId: string;
}

export default function TeacherEventsPage() {
  const { data: session } = useSession();
  const schoolId = (session?.user as any)?.schoolId;
  const { lang } = usePortalLanguage();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [type, setType] = useState("Competition");
  const [clubId, setClubId] = useState("");
  const [icon, setIcon] = useState("");
  const [themeColor, setThemeColor] = useState("text-amber-600 dark:text-amber-400");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (schoolId) {
      fetchData(schoolId);
    }
  }, [schoolId]);

  const fetchData = async (sId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/activities?schoolId=${sId}`);
      const json = await res.json();
      if (json.success) {
        const fetchedClubs = json.data.discoverClubs || [];
        // Deduplicate clubs by name to prevent multiple entries in dropdown
        const uniqueClubs = Array.from(new Map(fetchedClubs.map((c: Club) => [c.name, c])).values()) as Club[];
        
        setClubs(uniqueClubs);
        setEvents(json.data.upcomingEvents || []);
        if (uniqueClubs.length > 0) {
          setClubId(uniqueClubs[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/activities/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, eventDate, type, icon, themeColor, clubId
        })
      });
      const json = await res.json();
      if (json.success) {
        setEvents([...events, json.data].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()));
        setTitle("");
        setEventDate("");
        alert("Event scheduled successfully!");
      } else {
        alert("Error scheduling event.");
      }
    } catch (err) {
      console.error(err);
      alert("Error scheduling event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PortalLayout 
      title={lang === "தமிழ்" ? "மன்ற நிகழ்வுகள் மேலாண்மை" : "Club Events Management"} 
      subtitle={lang === "தமிழ்" ? "மன்றங்களுக்கான கூடுதல் பாடநெறி நிகழ்வுகளை திட்டமிட்டு நிர்வகிக்கவும்" : "Schedule and manage extracurricular events for clubs"} 
      themeClass="theme-teacher"
    >
      <div className="space-y-6 text-left">
        {/* Top Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-xl shrink-0 border border-amber-100 dark:border-amber-900/50">
                <Calendar className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  {lang === "தமிழ்" ? "மன்ற நிகழ்வுகள் மையம்" : "Club Events Hub"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed max-w-2xl">
                  {lang === "தமிழ்"
                    ? "பள்ளி மன்றங்களுக்கான கூடுதல் பாடநெறி நிகழ்வுகள், போட்டிகள் மற்றும் பயிலரங்குகளைத் திட்டமிட்டு நிர்வகிக்கவும்."
                    : "Schedule and manage extracurricular club events, competitions, showcases, and workshops for your school."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 text-left">
        {/* Create Event Form */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white"><Calendar className="w-4 h-4 inline-block mr-1 text-inherit" /> {lang === "தமிழ்" ? "புதிய நிகழ்வை திட்டமிடு" : "Schedule New Event"}</h2>
            <Link href="/teacher/club-members" className="text-[10px] uppercase tracking-wider font-bold text-amber-500 hover:text-amber-600 transition-colors bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/50">
              View Club Members
            </Link>
          </div>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold uppercase tracking-wider">{lang === "தமிழ்" ? "நிகழ்வின் தலைப்பு *" : "Event Title *"}</label>
              <input 
                required 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-405 placeholder:text-xs focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="e.g. Annual Science Fair"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold uppercase tracking-wider">{lang === "தமிழ்" ? "நிகழ்வின் தேதி *" : "Event Date *"}</label>
              <input 
                required 
                type="date" 
                value={eventDate} 
                onChange={(e) => setEventDate(e.target.value)} 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold uppercase tracking-wider">{lang === "தமிழ்" ? "தொடர்புடைய மன்றம் *" : "Associated Club *"}</label>
              <select 
                required
                value={clubId} 
                onChange={(e) => setClubId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                {clubs.map(club => (
                  <option key={club.id} value={club.id} className="dark:bg-slate-900">{club.name} ({club.category})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold uppercase tracking-wider">{lang === "தமிழ்" ? "நிகழ்வு வகை" : "Event Type"}</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="School-wide" className="dark:bg-slate-900">{lang === "தமிழ்" ? "பள்ளி தழுவியது" : "School-wide"}</option>
                    <option value="Competition" className="dark:bg-slate-900">{lang === "தமிழ்" ? "போட்டி" : "Competition"}</option>
                    <option value="Showcase" className="dark:bg-slate-900">{lang === "தமிழ்" ? "காட்சிப்படுத்துதல்" : "Showcase"}</option>
                    <option value="Workshop" className="dark:bg-slate-900">{lang === "தமிழ்" ? "பயிலரங்கம்" : "Workshop"}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold uppercase tracking-wider">{lang === "தமிழ்" ? "சின்னம் (ஈமோஜி) *" : "Icon (Emoji) *"}</label>
                  <select 
                    required 
                    value={icon} 
                    onChange={(e) => setIcon(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="" disabled className="dark:bg-slate-900">{lang === "தமிழ்" ? "சின்னத்தை தேர்ந்தெடுக்கவும்" : "Select an icon"}</option>
                    <option value="fi-rr-flask" className="dark:bg-slate-900">Science / Lab</option>
                    <option value="fi-rr-trophy" className="dark:bg-slate-900">Competition / Award</option>
                    <option value="fi-rr-palette" className="dark:bg-slate-900">Art / Creative</option>
                    <option value="fi-rr-basketball" className="dark:bg-slate-900">Sports / Athletics</option>
                    <option value="fi-rr-masks" className="dark:bg-slate-900">Drama / Theater</option>
                    <option value="fi-rr-leaf" className="dark:bg-slate-900">Environment / Eco</option>
                    <option value="fi-rr-book-alt" className="dark:bg-slate-900">Literature / Reading</option>
                    <option value="fi-rr-microphone" className="dark:bg-slate-900">Debate / Speech</option>
                    <option value="fi-rr-robot" className="dark:bg-slate-900">Robotics / Tech</option>
                    <option value="fi-rr-telescope" className="dark:bg-slate-900">Astronomy</option>
                    <option value="fi-rr-camera" className="dark:bg-slate-900">Photography</option>
                    <option value="fi-rr-star" className="dark:bg-slate-900">General / Star</option>
                  </select>
                </div>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting || clubs.length === 0}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold rounded-xl text-xs transition-colors shadow-md mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? (lang === "தமிழ்" ? "திட்டமிடப்படுகிறது..." : "Scheduling...") 
                : (lang === "தமிழ்" ? "நிகழ்வைத் திட்டமிடு" : "Schedule Event")
              }
            </button>
            {clubs.length === 0 && <p className="text-[10px] text-red-500 text-center font-bold">{lang === "தமிழ்" ? "நிகழ்வுகளைத் திட்டமிடுவதற்கு முன் ஒரு மன்றத்தை உருவாக்க வேண்டும்." : "A club must be created before scheduling events."}</p>}
          </form>
        </div>

        {/* List of Events */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h2 className="text-xl font-bold mb-4">{lang === "தமிழ்" ? `வரவிருக்கும் நிகழ்வுகள் (${events.length})` : `Upcoming Events (${events.length})`}</h2>
          {isLoading ? (
            <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[500px]">
              {events.map((event, idx) => {
                const club = clubs.find(c => c.id === event.clubId);
                const typeTranslated =
                  event.type === "School-wide" ? (lang === "தமிழ்" ? "பள்ளி தழுவியது" : "School-wide") :
                  event.type === "Competition" ? (lang === "தமிழ்" ? "போட்டி" : "Competition") :
                  event.type === "Showcase" ? (lang === "தமிழ்" ? "காட்சிப்படுத்துதல்" : "Showcase") :
                  event.type === "Workshop" ? (lang === "தமிழ்" ? "பயிலரங்கம்" : "Workshop") : event.type;
                
                // Color configuration based on event type
                const colorConfig = 
                  event.type === "Competition" ? { bg: "bg-rose-500/10 dark:bg-rose-950/30", text: "text-rose-600 dark:text-rose-450", border: "border-rose-500/25 dark:border-rose-900/50", glow: "shadow-rose-500/20" } :
                  event.type === "Showcase" ? { bg: "bg-emerald-500/10 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-450", border: "border-emerald-500/25 dark:border-emerald-900/50", glow: "shadow-emerald-500/20" } :
                  event.type === "Workshop" ? { bg: "bg-purple-500/10 dark:bg-purple-950/30", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/25 dark:border-purple-900/50", glow: "shadow-purple-500/20" } :
                  { bg: "bg-amber-500/10 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/25 dark:border-amber-900/50", glow: "shadow-amber-500/20" };

                return (
                  <div key={event.id || idx} className="relative flex gap-5 pb-5 group">
                    {/* Timeline line */}
                    {idx !== events.length - 1 && (
                      <div className="absolute left-[17px] top-9 bottom-0 w-[3px] bg-gradient-to-b from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900"></div>
                    )}
                    
                    {/* Glowing Icon Circle */}
                    <div className={`w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-950 border-2 ${colorConfig.border} flex items-center justify-center shrink-0 z-10 shadow-sm group-hover:scale-110 transition-transform duration-300 ${colorConfig.text} ${colorConfig.glow}`}>
                      {renderEventIcon(event.icon)}
                    </div>
                    
                    {/* Event Details Card */}
                    <div className="flex-1 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-150/40 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-850 hover:shadow-lg hover:shadow-slate-500/5 dark:hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300 text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100 group-hover:text-amber-500 transition-colors leading-snug">{event.title}</h4>
                        <span className={`inline-flex self-start sm:self-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${colorConfig.bg} ${colorConfig.text} ${colorConfig.border}`}>
                          {typeTranslated}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-slate-550 dark:text-slate-400 font-semibold mb-3 flex items-center gap-2">
                        <i className="fi fi-rr-calendar text-[12px] opacity-75" />
                        <span>{new Date(event.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </p>
                      
                      {club && (
                         <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-[10px] font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                           <span className="text-xs">{club.icon}</span> 
                           <span>{club.name}</span>
                         </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {events.length === 0 && <p className="text-sm text-slate-550 text-center py-8">{lang === "தமிழ்" ? "வரவிருக்கும் நிகழ்வுகள் எதுவும் திட்டமிடப்படவில்லை." : "No upcoming events scheduled."}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  </PortalLayout>
  );
}
