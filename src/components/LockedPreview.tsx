"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface LockedPreviewProps {
  title: string;
  children: React.ReactNode;
  showUpgradeButton?: boolean;
}

export function LockedPreview({
  title,
  children,
  showUpgradeButton = true,
}: LockedPreviewProps) {
  const router = useRouter();

  return (
    <div className="relative rounded-xl border bg-slate-50/90 p-4 overflow-hidden">
      {/* Actual content, but non-selectable + no pointer events */}
      <div className="pointer-events-none select-none [user-select:none] text-slate-800/90 space-y-3">
        {children}
      </div>

      {/* Soft gradient overlay so it feels like a locked preview */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/60 to-slate-50" />

      {/* Bottom CTA bar */}
      <div className="absolute inset-x-0 bottom-0 p-4 pt-6 bg-white/95 border-t flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {title}
          </p>
          <p className="text-xs text-slate-500">
            Full content, copy, and download (PDF/DOCX/PPTX) are available on the Pro plan.
          </p>
        </div>

        {showUpgradeButton && (
          <button
            type="button"
            onClick={() => router.push("/pricing")}
            className="mt-2 inline-flex items-center rounded-full bg-blue-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 sm:mt-0 sm:w-auto"
          >
            Upgrade to Pro
          </button>
        )}
      </div>
    </div>
  );
}
