"use client";
// Shared hook: fetches parent's linked children and manages active child state
// With persistent selection across all Parent Portal pages, subpages, and browser sessions

import { useState, useEffect, useCallback, useRef } from "react";
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

const STORAGE_KEY_PREFIX = "tn_parent_active_student_";
const GLOBAL_STORAGE_KEY = "tn_parent_active_student_id";
const EVENT_NAME = "tn_parent_active_child_changed";

/**
 * Retrieve the persistent selected child studentId.
 * Hierarchy:
 * 1. URL search param (?studentId=...)
 * 2. Scoped localStorage (tn_parent_active_student_{parentId})
 * 3. Global localStorage (tn_parent_active_student_id)
 * 4. sessionStorage fallback
 */
export function getStoredChildId(parentId?: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("studentId");
    if (fromUrl) return fromUrl;

    if (parentId) {
      const scoped = localStorage.getItem(`${STORAGE_KEY_PREFIX}${parentId}`);
      if (scoped) return scoped;
    }

    const globalVal = localStorage.getItem(GLOBAL_STORAGE_KEY);
    if (globalVal) return globalVal;

    return sessionStorage.getItem(GLOBAL_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Save selected child studentId to local/session storage and broadcast change event.
 */
export function saveStoredChildId(studentId: string, parentId?: string): void {
  if (typeof window === "undefined" || !studentId) return;
  try {
    if (parentId) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${parentId}`, studentId);
    }
    localStorage.setItem(GLOBAL_STORAGE_KEY, studentId);
    sessionStorage.setItem(GLOBAL_STORAGE_KEY, studentId);

    // Notify other components & tabs in real-time
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: { studentId, parentId },
      })
    );
  } catch {
    // Storage quota or restricted environment
  }
}

export function useParentChildren() {
  const { data: session } = useSession();
  const parentId = (session?.user as any)?.id as string | undefined;
  const schoolId = (session?.user as any)?.schoolId as string | undefined;

  const [children, setChildren] = useState<Child[]>([]);
  const [activeChild, setActiveChildState] = useState<Child | null>(null);
  const [childrenLoading, setChildrenLoading] = useState(true);

  // Keep a reference to latest children to avoid stale state in listeners
  const childrenRef = useRef<Child[]>([]);
  childrenRef.current = children;

  // Custom setter for active child that saves to persistent storage
  const setActiveChild = useCallback(
    (child: Child | null) => {
      setActiveChildState(child);
      if (child?.studentId) {
        saveStoredChildId(child.studentId, parentId);
      }
    },
    [parentId]
  );

  const fetchChildren = useCallback(async () => {
    if (!parentId) return;
    setChildrenLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/parent/${parentId}/children`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const list: Child[] = json.data;
        setChildren(list);
        childrenRef.current = list;

        // Resolve active child from stored preference or defaults
        const storedId = getStoredChildId(parentId);
        const matched = list.find((c) => c.studentId === storedId);
        const primary = list.find((c) => c.isPrimary);
        const selected = matched || primary || list[0];

        setActiveChildState(selected);
        if (selected) {
          saveStoredChildId(selected.studentId, parentId);
        }
      }
    } catch {
      /* offline */
    } finally {
      setChildrenLoading(false);
    }
  }, [parentId]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  // Sync state when active child changes in another component or tab
  useEffect(() => {
    const handleChildChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ studentId: string; parentId?: string }>;
      const newStudentId = customEvent.detail?.studentId;
      if (!newStudentId) return;

      setActiveChildState((current) => {
        if (current?.studentId === newStudentId) return current;
        const target = childrenRef.current.find((c) => c.studentId === newStudentId);
        return target || current;
      });
    };

    const handleStorageChanged = (e: StorageEvent) => {
      if (
        (e.key === GLOBAL_STORAGE_KEY || (parentId && e.key === `${STORAGE_KEY_PREFIX}${parentId}`)) &&
        e.newValue
      ) {
        const newStudentId = e.newValue;
        setActiveChildState((current) => {
          if (current?.studentId === newStudentId) return current;
          const target = childrenRef.current.find((c) => c.studentId === newStudentId);
          return target || current;
        });
      }
    };

    window.addEventListener(EVENT_NAME, handleChildChanged);
    window.addEventListener("storage", handleStorageChanged);

    return () => {
      window.removeEventListener(EVENT_NAME, handleChildChanged);
      window.removeEventListener("storage", handleStorageChanged);
    };
  }, [parentId]);

  return {
    parentId,
    schoolId,
    children,
    activeChild,
    setActiveChild,
    childrenLoading,
    refetchChildren: fetchChildren,
  };
}
