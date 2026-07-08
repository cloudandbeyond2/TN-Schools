"use client";
import React from "react";
import { X } from "lucide-react";

// Shared UI primitives for the PET portal pages (modals, form fields).

export const inputCls =
  "w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-transparent outline-none focus:border-blue-500 transition-colors text-sm";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5 text-[var(--text-heading)]">{label}</label>
      {children}
    </div>
  );
}

export function ModalShell({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-2xl w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[85vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)] sticky top-0 bg-[var(--bg-card)] z-10">
          <h3 className="text-lg font-bold text-[var(--text-heading)]">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-muted)]">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
