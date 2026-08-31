// Portal catalog shared by the feature/settings routes.
//
// A "portal" is one role-facing section of the app, identified by its route
// prefix. Superadmin can switch a whole portal off (see PlatformSetting.portals);
// GET /api/features/effective reports the disabled ones and PortalLayout blocks
// them client-side. SUPERADMIN is never gated.

export const PORTAL_PREFIX: Record<string, string> = {
  STUDENT: '/student',
  TEACHER: '/teacher',
  PARENT: '/parent',
  PET: '/pet',
  HEADMASTER: '/headmaster',
  BEO: '/block-education-officer',
  DEO: '/district-education-officer',
  COMMISSIONER: '/commissioner',
  MINISTER: '/minister',
};

export const PORTAL_DISPLAY: Record<string, string> = {
  STUDENT: 'Student',
  TEACHER: 'Teacher',
  PARENT: 'Parent',
  PET: 'PET / Sports',
  HEADMASTER: 'Headmaster',
  BEO: 'Block Education Officer',
  DEO: 'District Education Officer',
  COMMISSIONER: 'Commissioner',
  MINISTER: 'Minister',
};

export const PORTAL_KEYS = Object.keys(PORTAL_PREFIX);

// Login role -> portal. SUPERADMIN is deliberately absent: it must never be
// lockable, otherwise a disabled-everything config could not be undone.
export const ROLE_TO_PORTAL: Record<string, string> = {
  STUDENT: 'STUDENT',
  STUDENT_MIDDLE: 'STUDENT',
  STUDENT_HIGH: 'STUDENT',
  STUDENT_HIGHER: 'STUDENT',
  TEACHER: 'TEACHER',
  PET: 'PET',
  PARENT: 'PARENT',
  HEADMASTER: 'HEADMASTER',
  BEO: 'BEO',
  DEO: 'DEO',
  COMMISSIONER: 'COMMISSIONER',
  MINISTER: 'MINISTER',
};

// Portals that only exist inside the government administrative hierarchy.
// A private institution has no BEO/DEO/Commissioner/Minister above it.
export const GOVERNMENT_HIERARCHY_PORTALS = ['BEO', 'DEO', 'COMMISSIONER', 'MINISTER'];

export const INSTITUTION_TYPES = ['GOVERNMENT', 'PRIVATE', 'AIDED'] as const;
export type InstitutionType = (typeof INSTITUTION_TYPES)[number];

function preset(disabled: string[]): Record<string, boolean> {
  const portals: Record<string, boolean> = {};
  for (const key of PORTAL_KEYS) portals[key] = !disabled.includes(key);
  return portals;
}

// Applied by POST /api/features/portals/preset. Superadmin can still flip any
// individual portal afterwards — the preset is a starting point, not a lock.
export const INSTITUTION_PORTAL_PRESETS: Record<InstitutionType, Record<string, boolean>> = {
  // State-run school: the full administrative chain is in use.
  GOVERNMENT: preset([]),
  // Private/matriculation school: no government officer portals at all.
  PRIVATE: preset(GOVERNMENT_HIERARCHY_PORTALS),
  // Government-aided: inspected by BEO/DEO, but not part of the state-level
  // Commissioner/Minister dashboards.
  AIDED: preset(['COMMISSIONER', 'MINISTER']),
};

export function isInstitutionType(value: unknown): value is InstitutionType {
  return typeof value === 'string' && (INSTITUTION_TYPES as readonly string[]).includes(value);
}

// The portal a route belongs to, or null when it is outside every portal.
export function portalForRoute(route: string): string | null {
  for (const [portal, prefix] of Object.entries(PORTAL_PREFIX)) {
    if (route === prefix || route.startsWith(prefix + '/')) return portal;
  }
  return null;
}
