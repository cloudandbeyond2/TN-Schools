import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "EMIS Login",
      credentials: {
        loginType: { label: "Login Type", type: "text" },
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        rollNumber: { label: "Roll Number", type: "text" },
        phone: { label: "Phone Number", type: "text" },
      },
      async authorize(credentials) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

          const res = await fetch(`${apiUrl}/api/users/auth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              loginType: credentials?.loginType || "staff",
              email: credentials?.email,
              password: credentials?.password,
              rollNumber: credentials?.rollNumber,
              phone: credentials?.phone,
            }),
          });
          
          const result = await res.json();
          console.log("Backend auth response status:", res.status, "Success:", result?.success);
          
          if (result.success && result.data) {
            return result.data;
          }

          // Superadmin switched this portal off (Portal Control). Throw so the
          // reason reaches the login page instead of the generic credentials
          // error — the password was fine, the portal is closed.
          if (res.status === 403 && result?.code === "PORTAL_DISABLED") {
            throw new Error(result.error || "This portal is currently disabled.");
          }

          console.log("Auth failed or user not returned by backend:", result?.error);
        } catch (err) {
          console.error("NextAuth authorize error:", err);
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
        token.backendToken = (user as any).token || null; // JWT for Authorization: Bearer on backend API calls
        token.schoolId = (user as any).schoolId;
        token.schoolName = (user as any).schoolName || null;
        token.schoolDise = (user as any).schoolDise || null;
        token.class = (user as any).class;
        token.section = (user as any).section;
        token.subject = (user as any).subject;
        token.isClassTeacher = (user as any).isClassTeacher || false;
        token.assignedClass = (user as any).assignedClass || null;
        token.assignedSection = (user as any).assignedSection || null;
        token.studentId = (user as any).studentId || null;   // Student record ID
        token.rollNumber = (user as any).rollNumber || null; // Student roll number
        // Governance scope fields
        token.district = (user as any).district || null;     // DEO assigned district
        token.block = (user as any).block || null;            // BEO assigned block
        token.assignedRegion = (user as any).assignedRegion || null; // Commissioner region
      }
      if (trigger === "update" && session?.user) {
        if (session.user.subject !== undefined) token.subject = session.user.subject;
        if (session.user.isClassTeacher !== undefined) token.isClassTeacher = session.user.isClassTeacher;
        if (session.user.assignedClass !== undefined) token.assignedClass = session.user.assignedClass;
        if (session.user.assignedSection !== undefined) token.assignedSection = session.user.assignedSection;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).backendToken = token.backendToken || null;
        (session.user as any).schoolId = token.schoolId;
        (session.user as any).schoolName = token.schoolName || null;
        (session.user as any).schoolDise = token.schoolDise || null;
        (session.user as any).class = token.class;
        (session.user as any).section = token.section;   // ✅ ADD THIS
        (session.user as any).subject = token.subject;   // ✅ ADD THIS
        (session.user as any).isClassTeacher = token.isClassTeacher || false;
        (session.user as any).assignedClass = token.assignedClass || null;
        (session.user as any).assignedSection = token.assignedSection || null;
        (session.user as any).studentId = token.studentId || null;
        (session.user as any).rollNumber = token.rollNumber || null;
        // Governance scope fields
        (session.user as any).district = token.district || null;
        (session.user as any).block = token.block || null;
        (session.user as any).assignedRegion = token.assignedRegion || null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
