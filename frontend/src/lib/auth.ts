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
          console.log("Authorize called. NextAuth connecting to API URL:", apiUrl);
          
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
          } else {
            console.log("Auth failed or user not returned by backend:", result?.error);
          }
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
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
        token.schoolId = (user as any).schoolId;
        token.class = (user as any).class;
        token.section = (user as any).section;   // ✅ ADD THIS
        token.subject = (user as any).subject;   // ✅ ADD THIS
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).schoolId = token.schoolId;
        (session.user as any).class = token.class;
        (session.user as any).section = token.section;   // ✅ ADD THIS
        (session.user as any).subject = token.subject;   // ✅ ADD THIS
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "tn-schools-ai-ecosystem-secret-2025",
};
