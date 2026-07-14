"use client";

import { useEffect, useState } from "react";
import type { Stream } from "@/data/scienceCenters";

const VALID: Stream[] = ["Science", "Commerce", "ComputerScience", "Arts", "Vocational"];

// The higher-secondary group lives in localStorage("studentGroup") — written by
// the Science Campus / Higher Secondary dashboard pages (synced with the DB
// stream) and already consumed by the sidebar. This hook mirrors that value
// and re-reads it whenever a page dispatches "studentGroupChange".
export function useStudentGroup(): Stream {
  const [group, setGroup] = useState<Stream>("Science");

  useEffect(() => {
    const read = () => {
      const g = localStorage.getItem("studentGroup") as Stream | null;
      if (g && VALID.includes(g)) setGroup(g);
    };
    read();
    window.addEventListener("studentGroupChange", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("studentGroupChange", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  return group;
}
