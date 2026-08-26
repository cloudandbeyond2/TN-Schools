import { getPortalPagesCatalog } from "./portalPagesCatalog";

// Default catalog for the superadmin Feature Toggles and Department Modules
// pages. Synced to the backend via POST /api/features/sync on first load
// (mirrors how portalPagesCatalog seeds ManagedPage). The sync is
// non-destructive: isEnabled and portals are preserved on existing docs.
//
// Portal keys must match backend role keys (see PORTAL_PREFIX in
// backend/src/routes/feature.routes.ts).

export interface FeatureModuleEntry {
  key: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  kind: "FEATURE" | "MODULE";
  routes: string[];
  portals: Record<string, boolean>;
  isEnabled: boolean;
}

export const MODULE_PORTALS = [
  "STUDENT",
  "TEACHER",
  "PARENT",
  "HEADMASTER",
  "BEO",
  "DEO",
  "COMMISSIONER",
  "MINISTER",
] as const;

export const PORTAL_DISPLAY: Record<string, string> = {
  STUDENT: "Student",
  TEACHER: "Teacher",
  PARENT: "Parent",
  HEADMASTER: "Headmaster",
  BEO: "BEO",
  DEO: "DEO",
  COMMISSIONER: "Commissioner",
  MINISTER: "Minister",
};

const PORTAL_PREFIX: Record<string, string> = {
  STUDENT: "/student",
  TEACHER: "/teacher",
  PARENT: "/parent",
  PET: "/pet",
  HEADMASTER: "/headmaster",
  BEO: "/block-education-officer",
  DEO: "/district-education-officer",
  COMMISSIONER: "/commissioner",
  MINISTER: "/minister",
};

function portalsFor(routes: string[]): Record<string, boolean> {
  const portals: Record<string, boolean> = {};
  for (const route of routes) {
    for (const [portal, prefix] of Object.entries(PORTAL_PREFIX)) {
      if (route === prefix || route.startsWith(prefix + "/")) {
        portals[portal] = true;
      }
    }
  }
  return portals;
}

function entry(
  key: string,
  name: string,
  icon: string,
  description: string,
  category: string,
  kind: "FEATURE" | "MODULE",
  routes: string[]
): FeatureModuleEntry {
  return { key, name, icon, description, category, kind, routes, portals: portalsFor(routes), isEnabled: true };
}

const RAW_CATALOG: FeatureModuleEntry[] = [
  // ── Features: single focused capabilities ──────────────────────────
  entry("ai-tutor", "AI Tutor", "🤖", "Personalized AI tutoring for students", "AI & Learning", "FEATURE", ["/student/ai-tutor", "/student/lessons"]),
  entry("lesson-planner", "AI Lesson Planner", "📋", "Auto-generate lesson plans from syllabus", "AI & Learning", "FEATURE", ["/teacher/lesson-planner"]),
  entry("parent-assistant", "AI Parent Assistant", "💬", "Chatbot for parent queries and updates", "AI & Learning", "FEATURE", ["/parent/ai-assistant"]),
  entry("ai-evaluation", "AI Evaluation", "📝", "AI-assisted answer sheet evaluation", "AI & Learning", "FEATURE", ["/teacher/evaluation"]),
  entry("question-generator", "Question Generator", "❓", "AI question paper generation for teachers", "AI & Learning", "FEATURE", ["/teacher/questions"]),
  // Category "AI & Learning" means the global Enable AI Features switch in
  // Portal Settings already disables the whole studio — see feature.routes.ts.
  entry("teacher-ai-studio", "AI Content Studio", "✨", "20 subject-adaptive AI content skills for teachers", "AI & Learning", "FEATURE", ["/teacher/ai-studio", "/teacher/ai-studio/teach", "/teacher/ai-studio/practice", "/teacher/ai-studio/assess", "/teacher/ai-studio/engage", "/teacher/ai-studio/differentiate", "/teacher/ai-studio/feedback", "/teacher/ai-studio/plan", "/teacher/ai-studio/library", "/teacher/ai-prompts", "/student/ai-content"]),
  entry("personal-guide", "Personal Guide", "🧭", "AI wellbeing and self-care companion", "AI & Learning", "FEATURE", ["/student/personal-guide", "/teacher/personal-guide"]),
  entry("smart-class", "Smart Class", "📽️", "Fullscreen classroom projection mode", "Content", "FEATURE", ["/teacher/smart-class"]),
  entry("personal-counsellor", "Personal Counsellor", "🫶", "Confidential student counselling bookings", "Support", "FEATURE", ["/student/counsellor"]),
  entry("dropout-heatmap", "Dropout Heatmap", "🔴", "District-level dropout risk visualization", "Analytics", "FEATURE", ["/district-education-officer/dropout"]),
  entry("live-state", "Live State View", "📡", "Real-time state education metrics", "Analytics", "FEATURE", ["/minister/live"]),
  entry("ai-predictions", "AI Predictions", "🔮", "State-level AI performance predictions", "Analytics", "FEATURE", ["/minister/predictions"]),

  // ── Modules: cross-portal functional groups ────────────────────────
  entry("attendance", "Attendance System", "📅", "Daily attendance tracking and analytics", "Academic", "MODULE", ["/student/leave", "/teacher/attendance", "/teacher/leave", "/parent/attendance", "/parent/leave", "/headmaster/attendance", "/headmaster/leave", "/block-education-officer/attendance"]),
  entry("homework", "Homework Manager", "📚", "Homework assignment and tracking", "Academic", "MODULE", ["/student/homework", "/teacher/homework", "/parent/homework"]),
  entry("exams-assessments", "Exams & Assessments", "🧪", "Exam schedules, assessments and results", "Academic", "MODULE", ["/student/exams", "/student/assessments", "/teacher/exams", "/headmaster/exams", "/headmaster/model-exams", "/block-education-officer/exams"]),
  entry("timetable", "Timetable", "🗓️", "Class timetables and proxy management", "Academic", "MODULE", ["/teacher/timetable", "/headmaster/timetable"]),
  entry("virtual-labs", "Virtual Labs", "🔬", "Interactive science lab simulations", "Content", "MODULE", ["/student/labs", "/teacher/labs", "/student/science-lab-support", "/teacher/science-lab-support"]),
  entry("digital-library", "Digital Library", "📖", "E-books and digital study material", "Content", "MODULE", ["/student/digital-library", "/teacher/digital-library", "/headmaster/digital-library", "/student/science-library"]),
  entry("learning-hub", "Learning Hub", "🎓", "Centralized learning content platform", "Content", "MODULE", ["/student/centralized-content"]),
  entry("competitive-exams", "Competitive Exams", "🏆", "NEET/JEE and competitive exam preparation", "Content", "MODULE", ["/student/competitive-exams", "/teacher/competitive-exams", "/student/neet-prep", "/teacher/neet-prep", "/student/higher-secondary/competitive"]),
  entry("scholarships-welfare", "Scholarships & Welfare", "🎖️", "Scholarship eligibility and welfare schemes", "Welfare", "MODULE", ["/student/welfare", "/student/high-school/scholarships", "/student/higher-secondary/scholarships", "/teacher/scholarships", "/parent/scholarship", "/headmaster/scholarship", "/district-education-officer/scholarship"]),
  entry("midday-meal", "Mid-Day Meal", "🍛", "Daily meal register and nutrition tracking", "Welfare", "MODULE", ["/headmaster/midday-meal"]),
  entry("health-wellness", "Health & Wellness", "💚", "Student health reports and wellness tracking", "Welfare", "MODULE", ["/student/health", "/student/wellness", "/parent/health"]),
  entry("announcements", "Announcements", "📢", "System-wide broadcast messages", "Communication", "MODULE", ["/student/announcements", "/teacher/announcements", "/commissioner/announcements"]),
  entry("grievances", "Grievances", "🗣️", "Grievance filing and redressal", "Communication", "MODULE", ["/student/report", "/block-education-officer/grievances", "/district-education-officer/grievances", "/commissioner/grievances", "/minister/grievances"]),
  entry("risk-analytics", "Risk & Dropout Analytics", "📉", "Dropout risk alerts and tracking", "Analytics", "MODULE", ["/teacher/risk-alerts", "/block-education-officer/dropouts"]),
  entry("budget-finance", "Budget & Finance", "💰", "Budget utilization and financial reports", "Finance", "MODULE", ["/commissioner/budget", "/minister/budget", "/block-education-officer/financials"]),
  entry("career-guidance", "Career Guidance", "🧑‍🎓", "Career aptitude and college admissions", "AI & Learning", "MODULE", ["/student/career", "/student/high-school/career", "/student/higher-secondary/admissions"]),
  entry("sports-extracurricular", "Sports & Extracurricular", "⚽", "Sports, clubs and cultural activities", "Extracurricular", "MODULE", ["/student/sports", "/teacher/sports", "/student/activities", "/student/cultural-events", "/teacher/cultural-events", "/headmaster/clubs", "/student/social-activities"]),
];

// Keep only routes that actually exist in navConfig so the catalog can't
// drift from real portal pages.
export function getDefaultFeatureCatalog(): FeatureModuleEntry[] {
  const validRoutes = new Set(getPortalPagesCatalog().map((p) => p.route));
  return RAW_CATALOG.map((item) => ({
    ...item,
    routes: item.routes.filter((r) => validRoutes.has(r)),
  }));
}
