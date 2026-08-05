"use client";
import React from "react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";

export type PETPageKey =
  | "dashboard"
  | "records"
  | "sports"
  | "inventory"
  | "awards"
  | "ground"
  | "clubs"
  | "messages";

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

const BANNER_CONFIGS: Record<PETPageKey, BannerDetail> = {
  dashboard: {
    icon: "fi-sr-apps",
    en: {
      title: "Dashboard",
      desc: "Overview of sports status, ground conditions, active clubs, and quick stats.",
      rightPill: "Ecosystem Hub",
    },
    ta: {
      title: "டாஷ்போர்டு",
      desc: "விளையாட்டு நிலை, மைதான நிலவரம், செயலில் உள்ள மன்றங்கள் மற்றும் புள்ளிவிவரங்களின் கண்ணோட்டம்.",
      rightPill: "சூழல் அமைப்பு",
    },
  },
  records: {
    icon: "fi-sr-clipboard-list",
    en: {
      title: "Student Records & Health",
      desc: "Height, weight, BMI, fitness assessments, physical activity and health indicators.",
      rightPill: "Fitness Hub",
    },
    ta: {
      title: "மாணவர் பதிவுகள் & சுகாதாரம்",
      desc: "உயரம், எடை, பிஎம்ஐ, உடற்தகுதி மதிப்பீடுகள் மற்றும் சுகாதாரக் குறிகாட்டிகள்.",
      rightPill: "உடற்தகுதி தளம்",
    },
  },
  sports: {
    icon: "fi-sr-running",
    en: {
      title: "Sports Events & Competitions",
      desc: "Manage school level tournaments, games, annual athletics meet, and event registrations.",
      rightPill: "Sports Desk",
    },
    ta: {
      title: "விளையாட்டு நிகழ்வுகள் & போட்டிகள்",
      desc: "பள்ளி அளவிலான போட்டிகள், விளையாட்டுகள், ஆண்டு தடகளப் போட்டிகள் மற்றும் பதிவுகள்.",
      rightPill: "விளையாட்டுப் பிரிவு",
    },
  },
  inventory: {
    icon: "fi-sr-box",
    en: {
      title: "Inventory & Equipments",
      desc: "Track sports items, equipment stock balance, audit history, and damaged logs.",
      rightPill: "Inventory Desk",
    },
    ta: {
      title: "சரக்கு & உபகரணங்கள்",
      desc: "விளையாட்டுப் பொருட்கள், உபகரணங்கள் இருப்பு மற்றும் தணிக்கை வரலாற்றைக் கண்காணிக்கவும்.",
      rightPill: "சரக்குப் பிரிவு",
    },
  },
  awards: {
    icon: "fi-sr-trophy",
    en: {
      title: "Awards & Certifications",
      desc: "Log student sports achievements, state/district awards, and medals list.",
      rightPill: "Awards Desk",
    },
    ta: {
      title: "விருதுகள் & சான்றிதழ்கள்",
      desc: "மாணவர்களின் விளையாட்டு சாதனைகள், மாநில/மாவட்ட விருதுகள் மற்றும் பதக்கங்களின் பட்டியல்.",
      rightPill: "விருதுகள் தளம்",
    },
  },
  ground: {
    icon: "fi-sr-map-marker",
    en: {
      title: "Ground Condition",
      desc: "Monitor playground readiness, maintenance request status, and track logs.",
      rightPill: "Ground Desk",
    },
    ta: {
      title: "மைதான நிலைமை",
      desc: "விளையாட்டு மைதான தயார்நிலை மற்றும் பராமரிப்பு கோரிக்கை நிலையைக் கண்காணிக்கவும்.",
      rightPill: "மைதான தளம்",
    },
  },
  clubs: {
    icon: "fi-sr-users",
    en: {
      title: "Clubs & Activities",
      desc: "Manage sports clubs, student registrations, active attendance, and training schedules.",
      rightPill: "Clubs Desk",
    },
    ta: {
      title: "மன்றங்கள் & செயல்பாடுகள்",
      desc: "விளையாட்டு மன்றங்கள், மாணவர் பதிவுகள், வருகைப்பதிவு மற்றும் பயிற்சி அட்டவணைகள்.",
      rightPill: "மன்றங்கள் பிரிவு",
    },
  },
  messages: {
    icon: "fi-sr-comment",
    en: {
      title: "Parent Messages",
      desc: "Read and reply to parents about physical education, fitness, and sports progress.",
      rightPill: "Messages Desk",
    },
    ta: {
      title: "பெற்றோர் செய்திகள்",
      desc: "உடற்கல்வி மற்றும் விளையாட்டுப் போட்டிகளில் மாணவர்களின் முன்னேற்றம் குறித்து பெற்றோருக்குப் பதிலளிக்கவும்.",
      rightPill: "அஞ்சல் தளம்",
    },
  },
};

export default function PETPortalBanner({
  pageKey,
  rightElement,
  customDesc,
}: {
  pageKey: PETPageKey;
  rightElement?: React.ReactNode;
  customDesc?: string;
}) {
  const { lang } = usePortalLanguage();
  const isTa = lang === "தமிழ்";
  const config = BANNER_CONFIGS[pageKey];

  if (!config) return null;

  const data = isTa ? config.ta : config.en;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 mb-4 glass rounded-2xl p-4 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md w-full animate-fade-in">
      {/* Left */}
      <div>
        <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
          <i className={`fi ${config.icon} text-lime-600 dark:text-lime-400 flex items-center text-sm sm:text-base`} />
          {data.title}
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
          {customDesc || data.desc}
        </p>
      </div>
      {rightElement && (
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          {rightElement}
        </div>
      )}
    </div>
  );
}
