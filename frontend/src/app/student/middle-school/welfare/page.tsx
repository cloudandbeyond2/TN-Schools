"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MiddleSchoolWelfareRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/student/welfare");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6">
      <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin mb-4" />
      <p className="text-xs text-slate-400">Loading welfare benefits...</p>
    </div>
  );
}