"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFirebase, useUser } from "@/firebase";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";

const ADMIN_EMAILS = [
  "shahmubaruk05@gmail.com",
  "shahmubaruk.ai@gmail.com",
];

type AiToolName =
  | "ask-shah"
  | "business-plan"
  | "pitch-deck"
  | "company-profile"
  | "startup-validator"
  | "financial-projection"
  | string;

interface AiUsageLog {
  id: string;
  tool: AiToolName;
  userEmail: string | null;
  userUid: string | null;
  inputSummary: string;
  createdAt: Date | null;
}

export default function AdminAiUsagePage() {
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();
  const [isAdmin, setIsAdmin] = useState(false);
  const [logs, setLogs] = useState<AiUsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const email = user.email ?? "";
    const admin = ADMIN_EMAILS.includes(email);
    setIsAdmin(admin);

    if (!admin) {
      setError("Access denied. Admin only.");
      setLoading(false);
      return;
    }

    const fetchLogs = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(firestore, "aiUsageLogs"),
          orderBy("createdAt", "desc"),
          limit(100)
        );
        const snap = await getDocs(q);

        const items: AiUsageLog[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          let createdAt: Date | null = null;
          if (data.createdAt && data.createdAt.toDate) {
            createdAt = data.createdAt.toDate();
          }

          items.push({
            id: docSnap.id,
            tool: data.tool ?? "unknown",
            userEmail: data.userEmail ?? null,
            userUid: data.userUid ?? null,
            inputSummary: data.inputSummary ?? "",
            createdAt,
          });
        });

        setLogs(items);
      } catch (err) {
        console.error("Failed to load AI usage logs", err);
        setError("Failed to load AI usage logs.");
      } finally {
        setLoading(false);
      }
    };
    
    if (firestore) {
        fetchLogs();
    }
  }, [user, isUserLoading, firestore, router]);

  const stats = useMemo(() => {
    const byTool: Record<string, number> = {};
    logs.forEach((log) => {
      byTool[log.tool] = (byTool[log.tool] ?? 0) + 1;
    });
    return byTool;
  }, [logs]);

  if (isUserLoading) {
    return <div className="p-4 text-sm text-slate-500">Checking admin access...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-4 text-sm font-medium text-red-600">
        {error || "Access denied. Admin only."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          AI Usage Analytics
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Recent AI tool usage across Ask Shah, Business Plan, Pitch Deck, Company Profile and more.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loading ? (
           Array.from({ length: 3 }).map((_, i) => (
             <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 animate-pulse">
               <div className="h-3 w-1/4 bg-slate-200 rounded"></div>
               <div className="h-8 w-1/2 bg-slate-200 rounded mt-2"></div>
               <div className="h-3 w-1/2 bg-slate-200 rounded mt-1"></div>
             </div>
           ))
        ) : Object.keys(stats).length === 0 ? (
          <div className="col-span-3 text-sm text-slate-500">
            No usage logs yet.
          </div>
        ) : (
          Object.entries(stats).map(([tool, count]) => (
            <div
              key={tool}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <div className="text-xs uppercase tracking-wide text-slate-500">
                {tool}
              </div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">
                {count}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                total generations
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detailed table */}
      <div className="rounded-lg border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                Time
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                Tool
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                User
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                Input
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b last:border-b-0 animate-pulse">
                        <td className="px-3 py-3"><div className="h-3 bg-slate-200 rounded"></div></td>
                        <td className="px-3 py-3"><div className="h-3 bg-slate-200 rounded"></div></td>
                        <td className="px-3 py-3"><div className="h-3 bg-slate-200 rounded"></div></td>
                        <td className="px-3 py-3"><div className="h-3 bg-slate-200 rounded"></div></td>
                    </tr>
                 ))
            ) : logs.map((log) => (
              <tr key={log.id} className="border-b last:border-b-0">
                <td className="px-3 py-2 text-xs text-slate-500">
                  {log.createdAt
                    ? log.createdAt.toLocaleString()
                    : "—"}
                </td>
                <td className="px-3 py-2 text-xs font-medium text-slate-800">
                  {log.tool}
                </td>
                <td className="px-3 py-2 text-xs text-slate-700">
                  {log.userEmail || <span className="text-slate-400">guest</span>}
                </td>
                <td className="px-3 py-2 text-xs text-slate-700 max-w-xs truncate">
                  {log.inputSummary}
                </td>
              </tr>
            ))}

            {logs.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-6 text-center text-sm text-slate-500"
                >
                  No AI usage logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
