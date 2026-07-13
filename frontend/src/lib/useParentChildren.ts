"use client";
// Shared hook: fetches parent's linked children and manages active child state
// Used across all Parent Portal sub-pages

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface Child {
  linkId: string;
  isPrimary: boolean;
  studentId: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string | null;
  gender: string | null;
  community: string | null;
  schoolId: string;
}

export function getApiBase() {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) url = `https://${url}`;
  return url;
}

export function useParentChildren() {
  const { data: session } = useSession();
  const parentId = (session?.user as any)?.id as string | undefined;
  const schoolId = (session?.user as any)?.schoolId as string | undefined;

  const [children, setChildren]       = useState<Child[]>([]);
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [childrenLoading, setChildrenLoading] = useState(true);

  const fetchChildren = useCallback(async () => {
    if (!parentId) return;
    setChildrenLoading(true);
    try {
      const res  = await fetch(`${getApiBase()}/api/parent/${parentId}/children`);
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setChildren(json.data);
        setActiveChild(json.data[0]);
      }
    } catch {/* offline */}
    finally { setChildrenLoading(false); }
  }, [parentId]);

  useEffect(() => { fetchChildren(); }, [fetchChildren]);

  return { parentId, schoolId, children, activeChild, setActiveChild, childrenLoading };
}
