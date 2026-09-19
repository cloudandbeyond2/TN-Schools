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
    iconBg: "bg-blue-500/20 border-blue-400/20",
    iconColor: "text-blue-400",
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
    iconBg: "bg-blue-500/20 border-blue-400/20",
    iconColor: "text-blue-400",
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
    iconBg: "bg-amber-500/20 border-amber-400/20",
    iconColor: "text-amber-400",
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
    iconBg: "bg-emerald-500/20 border-emerald-400/20",
    iconColor: "text-emerald-400",
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
    icon: Medal,
    iconBg: "bg-amber-500/20 border-amber-400/20",
    iconColor: "text-amber-400",
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
    iconBg: "bg-emerald-500/20 border-emerald-400/20",
    iconColor: "text-emerald-400",
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
    iconBg: "bg-indigo-500/20 border-indigo-400/20",
    iconColor: "text-indigo-400",
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
    iconBg: "bg-teal-500/20 border-teal-400/20",
    iconColor: "text-teal-400",
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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800 w-full mb-6 animate-fade-in">
      {/* Glow Blur Circles */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className={`p-2 rounded-xl border ${config.iconBg} ${config.iconColor}`}>
              <Icon size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {data.title}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
            {customDesc || data.desc}
          </p>
        </div>

        {rightElement && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}
