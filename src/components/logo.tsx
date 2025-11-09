"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      {/* SM icon */}
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-700 text-xs font-semibold text-white shadow-md">
        SM
      </div>

      {/* ব্র্যান্ড টেক্সট */}
      <div className="flex flex-col leading-tight">
        <span className="text-lg font-bold tracking-tight text-sky-500">
          Shah Mubaruk
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
          Your startup coach
        </span>
      </div>
    </Link>
  );
}
