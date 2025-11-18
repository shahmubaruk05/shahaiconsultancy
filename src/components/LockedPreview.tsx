"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

type LockedPreviewProps = {
  isLocked: boolean;
  title?: string;
  children: React.ReactNode;
};

export function LockedPreview({ isLocked, title, children }: LockedPreviewProps) {
  const router = useRouter();
  if (!isLocked) {
    // Paid user – normal content
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {title && (
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            {title}
          </h3>
        )}
        {children}
      </div>
    );
  }

  // Free preview – blur + watermark + no copy
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80 shadow-sm no-copy-preview"
      onContextMenu={(e) => e.preventDefault()}
    >
      {title && (
        <div className="border-b border-slate-200 bg-white/80 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {title} (Preview)
          </h3>
          <p className="text-xs text-slate-500">
            Full, clean version & downloads unlock with Pro plan.
          </p>
        </div>
      )}

      {/* Real content but visually locked */}
      <div className="relative px-6 py-5">
        <div className="pointer-events-none select-none blur-[1.5px] opacity-95">
          {children}
        </div>

        {/* Watermark overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
        >
          <div className="watermark-grid">
            <span>Shah Mubaruk – Preview Only</span>
            <span>Upgrade to unlock full content</span>
          </div>
        </div>

        {/* Upgrade CTA footer */}
        <div className="mt-4 rounded-lg bg-white/90 px-4 py-3 text-center shadow-sm ring-1 ring-slate-200">
            <p className="text-xs text-slate-700">This is a protected preview. To get a clean, copyable version and download as PDF/Docx,{" "}
          <Button variant="link" className="p-0 h-auto text-xs" onClick={() => router.push('/pricing')}>
            upgrade to a Pro or Premium plan
          </Button>
          .</p>
        </div>
      </div>
    </div>
  );
}
