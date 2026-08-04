"use client";
import React from "react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

export type ParentPageKey =
  | "dashboard"
  | "performance"
  | "attendance"
  | "homework"
  | "notifications"
  | "health"
  | "leave"
  | "ai-assistant"
  | "scholarship"
  | "pta"
  | "portfolio";

interface BannerDetail {
  icon: string;
  en: {
    title: string;
    desc: string;
    rightPill: string;
  };
  ta: {
    title: string;
    desc: string;
    rightPill: string;
  };
}

const BANNER_CONFIGS: Record<ParentPageKey, BannerDetail> = {
  dashboard: {
    icon: "fi-sr-apps",
    en: {
      title: "Parent Dashboard",
      desc: "Summarized look at your child's attendance, academic metrics, and notifications.",
      rightPill: "Ecosystem Hub",
    },
    ta: {
      title: "பெற்றோர் டாஷ்போர்டு",
      desc: "உங்கள் குழந்தையின் வருகைப்பதிவு, கல்வி அளவீடுகள் மற்றும் அறிவிப்புகளின் சுருக்கமான பார்வை.",
      rightPill: "சூழல் அமைப்பு",
    },
  },
  performance: {
    icon: "fi-sr-stats",
    en: {
      title: "Child Performance",
      desc: "Track subject grades, assessment averages, and AI-driven tutoring insights.",
      rightPill: "Analytics Desk",
    },
    ta: {
      title: "குழந்தை செயல்பாடு",
      desc: "பாடங்களின் மதிப்பெண்கள், சராசரி மற்றும் AI-வழிகாட்டுதல் ஆலோசனைகளைக் கண்காணிக்கவும்.",
      rightPill: "பகுப்பாய்வு தளம்",
    },
  },
  attendance: {
    icon: "fi-sr-calendar",
    en: {
      title: "Attendance History",
      desc: "Check your child's daily presence status and monthly attendance analytics.",
      rightPill: "Attendance Portal",
    },
    ta: {
      title: "வருகைப்பதிவு வரலாறு",
      desc: "உங்கள் குழந்தையின் தினசரி வருகை நிலை மற்றும் மாதாந்திர வருகை பகுப்பாய்வைச் சரிபார்க்கவும்.",
      rightPill: "வருகை போர்டல்",
    },
  },
  homework: {
    icon: "fi-sr-book-bookmark",
    en: {
      title: "Homework Status",
      desc: "Review assigned homework, submissions, evaluations, and teacher feedback.",
      rightPill: "Homework Desk",
    },
    ta: {
      title: "வீட்டுப்பாட நிலை",
      desc: "வழங்கப்பட்ட வீட்டுப்பாடங்கள், சமர்ப்பிப்புகள், மதிப்பீடுகள் மற்றும் ஆசிரியர் கருத்துக்களை மதிப்பாய்வு செய்யவும்.",
      rightPill: "வீட்டுப்பாடப் பிரிவு",
    },
  },
  notifications: {
    icon: "fi-sr-bell",
    en: {
      title: "Alerts & Notifications",
      desc: "Stay updated with recent alerts, announcements, and direct messages from school.",
      rightPill: "Communications",
    },
    ta: {
      title: "எச்சரிக்கைகள் & அறிவிப்புகள்",
      desc: "பள்ளியின் சமீபத்திய எச்சரிக்கைகள், அறிவிப்புகள் மற்றும் நேரடிச் செய்திகளுடன் உடனுக்குடன் இணைந்திருங்கள்.",
      rightPill: "தொடர்புகள்",
    },
  },
  health: {
    icon: "fi-sr-heart-rate",
    en: {
      title: "Child Health Report",
      desc: "Monitor growth tracking, vaccine records, physical fitness reports, and wellness notes.",
      rightPill: "Health Center",
    },
    ta: {
      title: "குழந்தை சுகாதார அறிக்கை",
      desc: "வளர்ச்சி கண்காணிப்பு, தகுதி அறிக்கைகள் மற்றும் நல்வாழ்வு குறிப்புகளைக் கண்காணிக்கவும்.",
      rightPill: "சுகாதார மையம்",
    },
  },
  leave: {
    icon: "fi-sr-calendar-clock",
    en: {
      title: "Leave Portal",
      desc: "Apply for leaves and track your child's leave balance, history, and approval status.",
      rightPill: "Request Desk",
    },
    ta: {
      title: "விடுப்பு விண்ணப்பத் தளம்",
      desc: "விடுப்புக்கு விண்ணப்பிக்கவும், விடுப்பு சமநிலை, வரலாறு மற்றும் ஒப்புதல் நிலையைக் கண்காணிக்கவும்.",
      rightPill: "கோரிக்கை பிரிவு",
    },
  },
  "ai-assistant": {
    icon: "fi-sr-bot",
    en: {
      title: "AI Parent Assistant",
      desc: "Ask questions, get help with curriculum, or generate parenting tips from the school AI.",
      rightPill: "AI Guidance",
    },
    ta: {
      title: "AI பெற்றோர் உதவியாளர்",
      desc: "பள்ளி AI மூலம் கேள்விகள் கேட்கவும், பாடத்திட்டம் குறித்து உதவி பெறவும் அல்லது பெற்றோர் குறிப்புகளைப் பெறவும்.",
      rightPill: "AI வழிகாட்டுதல்",
    },
  },
  scholarship: {
    icon: "fi-sr-graduation-cap",
    en: {
      title: "Scholarship & Govt Schemes",
      desc: "Check eligibility, apply, and monitor status of government welfare schemes and academic scholarships.",
      rightPill: "Welfare Portal",
    },
    ta: {
      title: "உகவித்தொகை & அரசு திட்டங்கள்",
      desc: "அரசு நலத்திட்டங்கள் மற்றும் கல்வி உதவித்தொகைகளுக்கான தகுதி நிலையைச் சரிபார்த்து, விண்ணப்பித்து, நிலையைக் கண்காணிக்கவும்.",
      rightPill: "நலத்திட்டங்கள்",
    },
  },
  pta: {
    icon: "fi-sr-users",
    en: {
      title: "PTA Meetings",
      desc: "View schedules for upcoming Parent-Teacher Association meetings, register slots, and read minutes.",
      rightPill: "PTA Desk",
    },
    ta: {
      title: "PTA கூட்டங்கள்",
      desc: "பெற்றோர்-ஆசிரியர் சங்கக் கூட்டங்களின் அட்டவணையைப் பார்க்கவும், நேரங்களை ஒதுக்கீடு செய்யவும் மற்றும் கூட்டக் குறிப்புகளை வாசிக்கவும்.",
      rightPill: "PTA பிரிவு",
    },
  },
  portfolio: {
    icon: "fi-sr-folder",
    en: {
      title: "Digital Portfolio",
      desc: "Browse your child's academic milestones, project work, certificates, and extra-curricular highlights.",
      rightPill: "Milestones Desk",
    },
    ta: {
      title: "டிஜிட்டல் போர்ட்ஃபோலியோ",
      desc: "உங்கள் குழந்தையின் கல்வி மைல்கற்கள், திட்டப்பணிகள், சான்றிதழ்கள் மற்றும் கூடுதல் பாடத்திட்ட சிறப்பம்சங்களை உலாவவும்.",
      rightPill: "மைல்கற்கள் தளம்",
    },
  },
};

export default function ParentPortalBanner({ 
  pageKey,
  rightElement 
}: { 
  pageKey: ParentPageKey;
  rightElement?: React.ReactNode;
}) {
  const { lang } = usePortalLanguage();
  const isTa = lang === "தமிழ்";
  const config = BANNER_CONFIGS[pageKey];

  if (!config) return null;

  const data = isTa ? config.ta : config.en;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 mb-4 glass rounded-2xl p-4 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
      {/* Left */}
      <div>
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <span className="text-[8.5px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            {isTa ? "பெற்றோர் வலைவாசல்" : "Parent Portal"}
          </span>
          <span className="text-[8.5px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
            {isTa ? "கல்வி ஆண்டு 2024-25" : "Academic Year 2024-25"}
          </span>
        </div>
        <h2 className="text-base sm:text-lg font-black text-slate-805 dark:text-white uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
          <i className={`fi ${config.icon} text-emerald-600 dark:text-emerald-400 flex items-center text-sm sm:text-base`} />
          {data.title}
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
          {data.desc}
        </p>
      </div>
      {/* Right badge & elements */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs rounded-xl border border-emerald-200/20 shadow-sm">
          <i className="fi fi-sr-school flex items-center text-xs" />
          {data.rightPill}
        </span>
        {rightElement}
      </div>
    </div>
  );
}
