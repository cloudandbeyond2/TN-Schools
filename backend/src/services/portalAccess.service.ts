import { PlatformSetting } from '../models/mongo';
import { PORTAL_DISPLAY, ROLE_TO_PORTAL } from '../constants/portals';

// Portal master switches (superadmin Portal Control) applied at login time.
// Cached briefly so a login burst does not hit Mongo once per request; a
// superadmin toggle takes effect within CACHE_TTL_MS.
const CACHE_TTL_MS = 30_000;

let cache: { portals: Record<string, boolean>; at: number } | null = null;

function toObject(portals: unknown): Record<string, boolean> {
  if (portals instanceof Map) return Object.fromEntries(portals);
  if (portals && typeof portals === 'object') return portals as Record<string, boolean>;
  return {};
}

async function getPortalStates(): Promise<Record<string, boolean>> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.portals;
  const settings = await PlatformSetting.findOne({ key: 'global' });
  const portals = toObject(settings?.portals);
  cache = { portals, at: Date.now() };
  return portals;
}

/** Drop the cache so a superadmin toggle applies to the very next login. */
export function invalidatePortalAccessCache() {
  cache = null;
}

/**
 * Reason to refuse this role's login, or null when it may proceed.
 * Unknown roles (SUPERADMIN included) are never blocked, and a config-store
 * outage fails open — the same trade-off the rest of the gating makes.
 */
export async function getPortalLoginBlock(
  role: string
): Promise<{ portal: string; message: string } | null> {
  const portal = ROLE_TO_PORTAL[String(role || '').toUpperCase()];
  if (!portal) return null;

  try {
    const portals = await getPortalStates();
    if (portals[portal] !== false) return null;
    return {
      portal,
      message: `The ${PORTAL_DISPLAY[portal] || portal} portal is currently disabled by the administrator. Please contact your administrator.`,
    };
  } catch {
    return null;
  }
}
