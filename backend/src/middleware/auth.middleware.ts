import { Request, Response, NextFunction } from 'express';

// Lightweight role guard middleware.
// Usage:  router.get('/route', requireRole(['SUPERADMIN','MINISTER']), handler)
// The middleware reads an optional X-User-Role header (sent by the frontend from
// the NextAuth session token). If the header is absent the request passes through
// unchanged — this keeps all EXISTING routes fully backward-compatible.

export type AppRole =
  | 'STUDENT' | 'PARENT' | 'TEACHER' | 'HEADMASTER'
  | 'BEO' | 'DEO' | 'COMMISSIONER' | 'MINISTER' | 'SUPERADMIN';

// Hierarchy order — higher index = broader access
export const ROLE_HIERARCHY: AppRole[] = [
  'STUDENT', 'PARENT', 'TEACHER', 'HEADMASTER',
  'BEO', 'DEO', 'COMMISSIONER', 'MINISTER', 'SUPERADMIN',
];

export function hasPermission(userRole: AppRole, requiredRole: AppRole): boolean {
  if (userRole === 'SUPERADMIN') return true;
  const userIdx = ROLE_HIERARCHY.indexOf(userRole);
  const reqIdx  = ROLE_HIERARCHY.indexOf(requiredRole);
  if (userIdx === -1 || reqIdx === -1) return false;
  return userIdx >= reqIdx;
}

export function requireRole(allowedRoles: AppRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const headerRole = req.headers['x-user-role'] as string | undefined;
    if (!headerRole) return next();
    if (allowedRoles.includes(headerRole as AppRole)) return next();
    return res.status(403).json({
      success: false,
      error: "Access denied. Role '" + headerRole + "' is not allowed for this resource.",
    });
  };
}

export function requireMinRole(minRole: AppRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const headerRole = req.headers['x-user-role'] as string | undefined;
    if (!headerRole) return next();
    if (hasPermission(headerRole as AppRole, minRole)) return next();
    return res.status(403).json({
      success: false,
      error: "Access denied. Minimum required role: " + minRole,
    });
  };
}
