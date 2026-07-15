"use client";

import { SessionProvider } from "next-auth/react";
import BackendAuthBridge from "@/components/BackendAuthBridge";

export default function NextAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <BackendAuthBridge />
      {children}
    </SessionProvider>
  );
}
