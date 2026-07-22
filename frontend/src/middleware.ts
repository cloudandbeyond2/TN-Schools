import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Server-side role gating for the portal route groups. Before this existed,
// access control was only a client-side redirect in PortalLayout — any user
// could load any portal's pages. SUPERADMIN may enter every portal.

const ROLE_HOME: Record<string, string> = {
  STUDENT: "/student",
  PARENT: "/parent",
  TEACHER: "/teacher",
  PET: "/pet",
  HEADMASTER: "/headmaster",
  BEO: "/block-education-officer",
  DEO: "/district-education-officer",
  COMMISSIONER: "/commissioner",
  MINISTER: "/minister",
  SUPERADMIN: "/super-admin",
};

const PORTAL_ACCESS: Array<[prefix: string, roles: string[]]> = [
  ["/student", ["STUDENT"]],
  ["/parent", ["PARENT"]],
  ["/teacher", ["TEACHER", "PET"]],
  ["/pet", ["PET", "TEACHER"]],
  ["/headmaster", ["HEADMASTER"]],
  ["/block-education-officer", ["BEO"]],
  ["/district-education-officer", ["DEO"]],
  ["/commissioner", ["COMMISSIONER"]],
  ["/minister", ["MINISTER"]],
  ["/super-admin", ["SUPERADMIN"]],
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const portal = PORTAL_ACCESS.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
  if (!portal) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  const role = String((token as any).role || "");
  if (pathname.startsWith("/student/portfolio")) {
    if (["STUDENT", "TEACHER", "HEADMASTER", "SUPERADMIN"].includes(role)) {
      return NextResponse.next();
    }
  }

  if (role === "SUPERADMIN" || portal[1].includes(role)) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL(ROLE_HOME[role] || "/login", req.url));
}

export const config = {
  matcher: [
    "/student/:path*",
    "/parent/:path*",
    "/teacher/:path*",
    "/pet/:path*",
    "/headmaster/:path*",
    "/block-education-officer/:path*",
    "/district-education-officer/:path*",
    "/commissioner/:path*",
    "/minister/:path*",
    "/super-admin/:path*",
  ],
};
