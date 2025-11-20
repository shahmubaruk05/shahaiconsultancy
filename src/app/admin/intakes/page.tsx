
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  serverTimestamp,
  Timestamp,
  where,
  getDocs,
} from "firebase/firestore";
import { useFirebase } from "@/firebase/provider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

type IntakeStatus = "new" | "in-progress" | "completed" | "closed";

type Intake = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service: string;
  country?: string;
  authorizedCapital?: string;
  companyStage?: string;
  notes?: string;
  status: IntakeStatus;
  source?: string;
  createdAt?: Timestamp | null;
};

const STATUS_LABELS: Record<IntakeStatus, string> = {
  new: "New",
  "in-progress": "In progress",
  completed: "Completed",
  closed: "Closed",
};

const STATUS_COLORS: Record<IntakeStatus, string> = {
  new: "bg-sky-50 text-sky-700 border-sky-200",
  "in-progress": "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function AdminIntakesPage() {
  const { firestore, user } = useFirebase();
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const [isCreatingInvoice, startCreatingInvoice] = useTransition();

  // simple guard (UI level)
  const isAdminEmail = useMemo(() => {
    if (!user?.email) return false;
    // চাইলে এখানে আপনার admin ইমেইল ঠিকানা বসাতে পারেন
    return ["shahmubaruk05@gmail.com", "shahmubaruk.ai@gmail.com"].includes(user.email);
  }, [user]);

  useEffect(() => {
    if (!firestore) return;

    const q = query(
      collection(firestore, "intakes"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: Intake[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          rows.push({
            id: d.id,
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            service: data.service || "",
            country: data.country || "",
            authorizedCapital: data.authorizedCapital || "",
            companyStage: data.companyStage || "",
            notes: data.notes || "",
            status: (data.status as IntakeStatus) || "new",
            source: data.source || "public-intake",
            createdAt: data.createdAt || null,
          });
        });
        setIntakes(rows);
        if (!selectedId && rows.length > 0) {
          setSelectedId(rows[0].id);
        }
      },
      (err) => {
        console.error("Failed to load intakes", err);
        setError("Intake data load করতে সমস্যা হচ্ছে।");
      }
    );

    return () => unsub();
  }, [firestore, selectedId]);

  const selected = useMemo(
    () => intakes.find((i) => i.id === selectedId) || null,
    [intakes, selectedId]
  );

  async function handleStatusChange(id: string, status: IntakeStatus) {
    if (!firestore) return;
    try {
      setUpdating(true);
      setError(null);
      await updateDoc(doc(firestore, "intakes", id), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to update intake status", err);
      setError("Status update করতে সমস্যা হয়েছে।");
    } finally {
      setUpdating(false);
    }
  }

  function formatDate(ts?: Timestamp | null) {
    if (!ts) return "-";
    try {
      return ts.toDate().toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  }

  function buildWhatsAppMessage(intake: Intake) {
    const base = [
      `Assalamu Alaikum, Ami Shah Mubaruk – Your Startup Coach.`,
      "",
      `Apnar intake details peyechi:`,
      `• Name: ${intake.name}`,
      `• Service: ${intake.service}`,
      intake.authorizedCapital
        ? `• Authorized capital: ${intake.authorizedCapital}`
        : "",
      intake.country ? `• Country: ${intake.country}` : "",
      "",
      `Ami apnar jonno ekta detailed proposal & cost breakdown banate parbo.`,
      `Jodi apni short call / WhatsApp-e details discuss korte chan, janate paren.`,
    ]
      .filter(Boolean)
      .join("\n");

    return encodeURIComponent(base);
  }

  function handleCreateInvoiceFromIntake(intake: any) {
    const params = new URLSearchParams({
      fromIntake: "1",
      name: intake?.name || "",
      email: intake?.email || "",
      phone: intake?.phone || "",
      service: intake?.service || "",
      country: intake?.country || "",
      // city is not in the model, so we'll omit it for now
    });
    router.push(`/admin/invoices?${params.toString()}`);
  }


  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Intake Manager
          </h1>
          <p className="text-sm text-slate-600">
            এখানে সব client intake form submission দেখতে পারবেন, status update করতে
            পারবেন এবং পরবর্তীতে invoice / order এ convert করতে পারবেন।
          </p>
        </div>
        <Link
          href="/intake"
          className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          🔗 View public intake form
        </Link>
      </div>

      {!isAdminEmail && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          এই পেজটি মূলত admin ব্যবহারের জন্য। আপনার Firestore rules অনুযায়ী শুধু
          admin–রাই intake ডাটা read/update করতে পারবে।
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Left: list */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Intakes ({intakes.length})
            </p>
            <div className="flex gap-1">
              {(["new", "in-progress", "completed", "closed"] as IntakeStatus[]).map(
                (st) => {
                  const count = intakes.filter((i) => i.status === st).length;
                  if (!count) return null;
                  return (
                    <span
                      key={st}
                      className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600"
                    >
                      {STATUS_LABELS[st]}: {count}
                    </span>
                  );
                }
              )}
            </div>
          </div>
          <div className="max-h-[520px] overflow-y-auto divide-y divide-slate-100">
            {intakes.length === 0 && (
              <div className="px-3 py-4 text-xs text-slate-500">
                এখনো কোনো intake পাওয়া যায়নি।
              </div>
            )}

            {intakes.map((i) => (
              <button
                key={i.id}
                onClick={() => setSelectedId(i.id)}
                className={[
                  "w-full text-left px-3 py-2.5 flex flex-col gap-1 text-xs",
                  selectedId === i.id
                    ? "bg-sky-50"
                    : "hover:bg-slate-50",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-slate-800 truncate">
                    {i.name || "Unnamed"}
                  </div>
                  <span
                    className={[
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      STATUS_COLORS[i.status],
                    ].join(" ")}
                  >
                    {STATUS_LABELS[i.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[11px] text-slate-600">
                    {i.service}
                  </p>
                </div>
                <p className="text-[10px] text-slate-400">
                  {formatDate(i.createdAt)}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: details */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
          {!selected ? (
            <p className="text-sm text-slate-500">
              বাম দিক থেকে একটি intake নির্বাচন করুন।
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-slate-900">
                    {selected.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {selected.service}{" "}
                    {selected.country ? `· ${selected.country}` : ""}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Created: {formatDate(selected.createdAt)}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <span
                    className={[
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      STATUS_COLORS[selected.status],
                    ].join(" ")}
                  >
                    {STATUS_LABELS[selected.status]}
                  </span>
                  <div className="flex flex-wrap justify-end gap-1 pt-1">
                    {(["new", "in-progress", "completed", "closed"] as IntakeStatus[]).map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() =>
                            handleStatusChange(selected.id, st)
                          }
                          disabled={updating || selected.status === st}
                          className={[
                            "rounded-full border px-2 py-0.5 text-[10px]",
                            selected.status === st
                              ? "border-slate-300 bg-slate-100 text-slate-700"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                          ].join(" ")}
                        >
                          {STATUS_LABELS[st]}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">
                    Contact
                  </p>
                  <p>Email: {selected.email || "-"}</p>
                  <p>Phone: {selected.phone || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">
                    Company info
                  </p>
                  <p>
                    Authorized capital:{" "}
                    {selected.authorizedCapital || "-"}
                  </p>
                  <p>
                    Stage: {selected.companyStage || "-"}
                  </p>
                </div>
              </div>

              {selected.notes && (
                <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 whitespace-pre-line">
                  <p className="mb-1 text-[11px] font-semibold text-slate-500 uppercase">
                    Notes
                  </p>
                  {selected.notes}
                </div>
              )}

              <div className="border-t border-slate-100 pt-3 space-y-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase">
                  Actions
                </p>
                <div className="flex flex-wrap gap-2">
                  {selected.phone && (
                    <a
                      href={`https://wa.me/${selected.phone.replace(
                        /[^0-9]/g,
                        ""
                      )}?text=${buildWhatsAppMessage(selected)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-800 hover:bg-emerald-100"
                    >
                      💬 Reply via WhatsApp
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCreateInvoiceFromIntake(selected)}
                    className="inline-flex items-center rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-800 hover:bg-blue-100"
                  >
                    🧾 Create invoice
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
