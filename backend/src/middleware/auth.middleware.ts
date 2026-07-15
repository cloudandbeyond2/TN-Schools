import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret, AuthTokenPayload } from '../utils/jwt';

// JWT-based auth guard middleware.
// Usage:
//   router.get('/route', requireRole(['SUPERADMIN','MINISTER']), handler)
//   router.use(authenticate)            // any logged-in user
//
// Tokens are issued by POST /api/users/auth (see utils/jwt.ts) and must be
// sent as "Authorization: Bearer <token>". Requests without a valid token
// are rejected (fail closed). The legacy X-User-Role header is ignored.

export type AppRole =
  | 'STUDENT' | 'PARENT' | 'PET' | 'TEACHER' | 'HEADMASTER'
  | 'BEO' | 'DEO' | 'COMMISSIONER' | 'MINISTER' | 'SUPERADMIN';

// Hierarchy order — higher index = broader access.
// PET (physical-education teacher, derived at login) sits at the TEACHER tier.
export const ROLE_HIERARCHY: AppRole[] = [
  'STUDENT', 'PARENT', 'PET', 'TEACHER', 'HEADMASTER',
  'BEO', 'DEO', 'COMMISSIONER', 'MINISTER', 'SUPERADMIN',
];

export interface AuthUser {
  id: string;
  role: AppRole;
  schoolId: string | null;
  studentId: string | null;
  name?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// PET counts as TEACHER for hierarchy comparisons.
const effectiveRole = (role: AppRole): AppRole => (role === 'PET' ? 'TEACHER' : role);

export function hasPermission(userRole: AppRole, requiredRole: AppRole): boolean {
  if (userRole === 'SUPERADMIN') return true;
  const userIdx = ROLE_HIERARCHY.indexOf(effectiveRole(userRole));
  const reqIdx = ROLE_HIERARCHY.indexOf(effectiveRole(requiredRole));
  if (userIdx === -1 || reqIdx === -1) return false;
  return userIdx >= reqIdx;
}

// Non-failing variant for public routes that merely vary behavior by role
// (e.g. staff can see drafts). Returns null when no valid token is present.
export function getAuthUser(req: Request): AuthUser | null {
  return verifyRequest(req);
}

function verifyRequest(req: Request): AuthUser | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  try {
    const payload = jwt.verify(header.slice(7), getJwtSecret()) as AuthTokenPayload;
    if (!payload.sub || !payload.role) return null;
    return {
      id: payload.sub,
      role: payload.role,
      schoolId: payload.schoolId ?? null,
      studentId: payload.studentId ?? null,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

// Requires a valid token from any logged-in user.
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const user = verifyRequest(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }
  req.user = user;
  return next();
}

export function requireRole(allowedRoles: AppRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = verifyRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    req.user = user;
    if (user.role === 'SUPERADMIN' || allowedRoles.includes(user.role)) return next();
    return res.status(403).json({
      success: false,
      error: "Access denied. Role '" + user.role + "' is not allowed for this resource.",
    });
  };
}

export function requireMinRole(minRole: AppRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = verifyRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    req.user = user;
    if (hasPermission(user.role, minRole)) return next();
    return res.status(403).json({
      success: false,
      error: 'Access denied. Minimum required role: ' + minRole,
    });
  };
}
