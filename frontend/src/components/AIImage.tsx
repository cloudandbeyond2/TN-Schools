"use client";

import React, { useState } from "react";

interface AIImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Extra classes for the wrapper (sizing/rounding live here) */
  wrapperClassName?: string;
  /** Flaticon class shown while loading / on error, e.g. "fi-sr-picture" */
  fallbackIcon?: string;
}

/**
 * Image with a shimmer placeholder while AI images (Pollinations) generate,
 * and a graceful icon fallback on error — never shows the browser broken-image icon.
 */
export default function AIImage({ src, alt, className = "", wrapperClassName = "", fallbackIcon = "fi-sr-picture" }: AIImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${wrapperClassName}`}>
      {status !== "loaded" && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* shimmer sweep */}
          {status === "loading" && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
          )}
          <div className="relative z-10 flex flex-col items-center gap-1.5 text-slate-400">
            <i className={`fi ${fallbackIcon} leading-none text-2xl ${status === "loading" ? "animate-pulse" : ""}`} />
            {status === "loading" && <span className="text-[9px] font-bold uppercase tracking-wider">Generating…</span>}
          </div>
        </div>
      )}
      {status !== "error" && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={`${className} transition-opacity duration-500 ${status === "loaded" ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
