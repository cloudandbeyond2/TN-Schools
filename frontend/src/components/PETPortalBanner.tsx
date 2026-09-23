"use client";
import React from "react";
import { usePortalLanguage } from "@/lib/usePortalLanguage";
import {
  LayoutGrid,
  Activity,
  Trophy,
  Package,
  Medal,
  MapPin,
  Users,
  MessageSquare,
  LucideIcon,
} from "lucide-react";

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
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
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
    icon: LayoutGrid,
    iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    en: {
      title: "Physical Education Teacher Dashboard",
      desc: "Overview of sports status, ground conditions, active clubs, and quick stats.",
      rightPill: "Ecosystem Hub",
    },
    ta: {
      title: "உடற்கல்வி ஆசிரியர் டாஷ்போர்டு",
      desc: "விளையாட்டு நிலை, மைதான நிலவரம், செயலில் உள்ள மன்றங்கள் மற்றும் புள்ளிவிவரங்களின் கண்ணோட்டம்.",
      rightPill: "சூழல் அமைப்பு",
    },
  },
  records: {
    icon: Activity,
    iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40",
    iconColor: "text-blue-600 dark:text-blue-400",
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
    icon: Trophy,
    iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40",
    iconColor: "text-amber-600 dark:text-amber-400",
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
    icon: Package,
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    en: {
      title: "Inventory & Sports Equipments",
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
    icon: Medal,
    iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40",
    iconColor: "text-amber-600 dark:text-amber-400",
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
    icon: MapPin,
    iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
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
    icon: Users,
    iconBg: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40",
    iconColor: "text-indigo-600 dark:text-indigo-400",
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
    icon: MessageSquare,
    iconBg: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/40",
    iconColor: "text-teal-600 dark:text-teal-400",
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
  const Icon = config.icon;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm text-slate-900 dark:text-white w-full mb-6 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
        <div className="flex items-start gap-4 min-w-0">
          <div className={`p-3 rounded-2xl ${config.iconBg} shrink-0`}>
            <Icon size={24} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {data.title}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {data.desc}
            </p>
          </div>
        </div>

        {rightElement && (
          <div className="w-full lg:w-auto shrink-0">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}
