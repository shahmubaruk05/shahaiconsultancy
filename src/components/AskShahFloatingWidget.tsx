"use client";

import { useState } from "react";
import AskShahBox from "./AskShahBox";

type AskShahFloatingWidgetProps = {
  initialMode: "guest" | "user";
  initialConversationId: string | null;
};

export default function AskShahFloatingWidget({
  initialMode,
  initialConversationId,
}: AskShahFloatingWidgetProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full shadow-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-blue-600 text-xs font-bold">
          SM
        </span>
        <span>Ask Shah</span>
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-4 z-40 w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-slate-900 text-white">
              <div>
                <div className="text-sm font-semibold">
                  Ask Shah – Live Chat
                </div>
                <div className="text-[11px] text-slate-200">
                  Startup, funding & company formation help
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs text-slate-200 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-3">
              <AskShahBox
                initialMode={initialMode}
                initialConversationId={initialConversationId}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
