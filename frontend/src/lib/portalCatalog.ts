// Portal catalog for the superadmin "Portal Control" page.
// Mirrors backend/src/constants/portals.ts — keep the two in sync.

export const PORTAL_PREFIX: Record<string, string> = {
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

export const PORTAL_KEYS = Object.keys(PORTAL_PREFIX);

export interface PortalMeta {
  key: string;
  name: string;
  prefix: string;
  icon: string;
  description: string;
  /** Only meaningful inside the government administrative hierarchy. */
  governmentOnly: boolean;
}

export const PORTAL_CATALOG: PortalMeta[] = [
  { key: "STUDENT", name: "Student", prefix: "/student", icon: "fi-rr-graduation-cap", description: "Learning, homework, exams, welfare and AI study tools for students.", governmentOnly: false },
  { key: "TEACHER", name: "Teacher", prefix: "/teacher", icon: "fi-rr-chalkboard-user", description: "Classroom, lesson planning, evaluation and AI content studio.", governmentOnly: false },
  { key: "PARENT", name: "Parent", prefix: "/parent", icon: "fi-rr-users-alt", description: "Attendance, progress, fees and school communication for parents.", governmentOnly: false },
  { key: "PET", name: "PET / Sports", prefix: "/pet", icon: "fi-rr-running", description: "Physical education staff: fitness, sports, inventory and awards.", governmentOnly: false },
  { key: "HEADMASTER", name: "Headmaster", prefix: "/headmaster", icon: "fi-rr-user-crown", description: "School administration, staff, timetable and institutional reports.", governmentOnly: false },
  { key: "BEO", name: "Block Education Officer", prefix: "/block-education-officer", icon: "fi-rr-map-marker", description: "Block-level school supervision, inspections and grievances.", governmentOnly: true },
  { key: "DEO", name: "District Education Officer", prefix: "/district-education-officer", icon: "fi-rr-map", description: "District-level monitoring, dropout analytics and scholarships.", governmentOnly: true },
  { key: "COMMISSIONER", name: "Commissioner", prefix: "/commissioner", icon: "fi-rr-building", description: "State directorate: budgets, policy rollout and statewide reports.", governmentOnly: true },
  { key: "MINISTER", name: "Minister", prefix: "/minister", icon: "fi-rr-podium", description: "Ministry dashboards: live state metrics, predictions and media.", governmentOnly: true },
];

export type InstitutionType = "GOVERNMENT" | "PRIVATE" | "AIDED";

export const INSTITUTION_MODES: {
  key: InstitutionType;
  name: string;
  icon: string;
  summary: string;
  detail: string;
}[] = [
  {
    key: "GOVERNMENT",
    name: "Government School",
    icon: "fi-rr-bank",
    summary: "State-run — full administrative chain",
    detail: "Every portal stays on, including BEO, DEO, Commissioner and Minister.",
  },
  {
    key: "PRIVATE",
    name: "Private School",
    icon: "fi-rr-school",
    summary: "Independent / matriculation institution",
    detail: "Government officer portals (BEO, DEO, Commissioner, Minister) are switched off.",
  },
  {
    key: "AIDED",
    name: "Government-Aided",
    icon: "fi-rr-handshake",
    summary: "Privately managed, state funded",
    detail: "BEO and DEO supervision stays on; state-level Commissioner and Minister portals are switched off.",
  },
];

/** Portals each institution preset leaves enabled. Mirrors the backend preset. */
export const INSTITUTION_DISABLED_PORTALS: Record<InstitutionType, string[]> = {
  GOVERNMENT: [],
  PRIVATE: ["BEO", "DEO", "COMMISSIONER", "MINISTER"],
  AIDED: ["COMMISSIONER", "MINISTER"],
};

/** School type options offered wherever a school record is created or edited. */
export const SCHOOL_TYPES = [
  "Government",
  "Aided",
  "Private",
  "Matriculation",
  "GHS",
  "GHSS",
  "Middle",
  "Primary",
] as const;

/** The portal a route belongs to, or null when it sits outside every portal. */
export function portalForRoute(route: string): string | null {
  for (const [portal, prefix] of Object.entries(PORTAL_PREFIX)) {
    if (route === prefix || route.startsWith(prefix + "/")) return portal;
  }
  return null;
}
