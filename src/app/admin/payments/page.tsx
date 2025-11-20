
"use client";

  import { useEffect, useMemo, useState } from "react";
  import { useRouter } from "next/navigation";
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import {
    getFirestore,
    collection,
    doc,
    getDocs,
    updateDoc,
  } from "firebase/firestore";
  import { initializeFirebase } from "@/firebase";

  const { auth: fbAuth, firestore: db } = initializeFirebase();

  const ADMIN_EMAILS = [
    "shahmubaruk05@gmail.com",
    "shahmubaruk.ai@gmail.com",
  ];

  type Plan = "pro" | "premium" | "free" | string;

  interface PaymentRow {
    id: string;
    provider: "bkash" | "paypal";
    email: string | null;
    txId: string | null;
    amount: number | null;
    currency: string | null;
    plan: Plan | null;
    status: string | null;
    createdAt: Date | null;
    userUid?: string | null;
  }

  export default function AdminPaymentsPage() {
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState<PaymentRow[]>([]);
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
    const [providerFilter, setProviderFilter] = useState<"all" | "bkash" | "paypal">("all");
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
      const unsub = onAuthStateChanged(fbAuth, async (user) => {
        if (!user) {
          setCheckingAuth(false);
          router.push("/login");
          return;
        }

        const email = user.email ?? "";
        const admin = ADMIN_EMAILS.includes(email);
        setIsAdmin(admin);
        setCheckingAuth(false);

        if (!admin) {
          setError("Access denied. Admin only.");
          return;
        }

        try {
          setLoading(true);

          const rows: PaymentRow[] = [];

          // Load bKash payments
          const bkashSnap = await getDocs(collection(db, "bkashPayments"));
          bkashSnap.forEach((docSnap) => {
            const data = docSnap.data() as any;
            let createdAt: Date | null = null;
            if (data.createdAt && data.createdAt.toDate) {
              createdAt = data.createdAt.toDate();
            }

            rows.push({
              id: docSnap.id,
              provider: "bkash",
              email: data.email ?? null,
              txId: data.txId ?? null,
              amount: data.amountBdt ?? null,
              currency: "BDT",
              plan: data.plan ?? null,
              status: data.status ?? "pending",
              createdAt,
              userUid: data.uid ?? null,
            });
          });

          // Load PayPal payments (if collection exists)
          try {
            const paypalSnap = await getDocs(collection(db, "paypalPayments"));
            paypalSnap.forEach((docSnap) => {
              const data = docSnap.data() as any;
              let createdAt: Date | null = null;
              if (data.createdAt && data.createdAt.toDate) {
                createdAt = data.createdAt.toDate();
              }

              rows.push({
                id: docSnap.id,
                provider: "paypal",
                email: data.payerEmail ?? data.email ?? null,
                txId: data.paypalEventId ?? data.txId ?? null,
                amount: data.amount ? Number(data.amount) : null,
                currency: data.currency ?? "USD",
                plan: data.plan ?? null,
                status: data.status ?? "completed",
                createdAt,
                userUid: data.uid ?? null,
              });
            });
          } catch (err) {
            console.warn("paypalPayments collection not found / not readable", err);
          }

          // Sort desc by date
          rows.sort((a, b) => {
            const ta = a.createdAt?.getTime() ?? 0;
            const tb = b.createdAt?.getTime() ?? 0;
            return tb - ta;
          });

          setPayments(rows);
        } catch (err) {
          console.error("Failed to load payments", err);
          setError("Failed to load payments.");
        } finally {
          setLoading(false);
        }
      });

      return () => unsub();
    }, [fbAuth, db, router]);

    const filtered = useMemo(() => {
      return payments.filter((p) => {
        if (providerFilter !== "all" && p.provider !== providerFilter) return false;
        if (statusFilter !== "all" && (p.status ?? "") !== statusFilter) return false;
        return true;
      });
    }, [payments, providerFilter, statusFilter]);

    const handleUpdateStatus = async (p: PaymentRow, newStatus: string) => {
      try {
        const colName = p.provider === "bkash" ? "bkashPayments" : "paypalPayments";
        await updateDoc(doc(db, colName, p.id), {
          status: newStatus,
        });
        setPayments((prev) =>
          prev.map((row) =>
            row.id === p.id && row.provider === p.provider
              ? { ...row, status: newStatus }
              : row,
          ),
        );
      } catch (err) {
        console.error("Failed to update payment status", err);
        alert("Payment status update করতে সমস্যা হয়েছে।");
      }
    };

    if (checkingAuth) {
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
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Payments & Transactions
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Review bKash and PayPal payments, verify status, and cross-check with user subscriptions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Provider:</span>
            <select
              value={providerFilter}
              onChange={(e) =>
                setProviderFilter(e.target.value as "all" | "bkash" | "paypal")
              }
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            >
              <option value="all">All</option>
              <option value="bkash">bKash</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "pending" | "completed")
              }
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Loading payments...
          </div>
        ) : (
          <div className="overflow-x-auto rounded border border-slate-200">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">
                    Time
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">
                    Provider
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">
                    Plan
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">
                    Amount
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={`${p.provider}-${p.id}`} className="border-t last:border-b-0">
                    <td className="px-3 py-2 text-[11px] text-slate-500">
                      {p.createdAt ? p.createdAt.toLocaleString() : "—"}
                    </td>
                    <td className="px-3 py-2 capitalize">{p.provider}</td>
                    <td className="px-3 py-2">{p.email || "—"}</td>
                    <td className="px-3 py-2">{p.plan || "—"}</td>
                    <td className="px-3 py-2">
                      {p.amount != null ? `${p.amount} ${p.currency}` : "—"}
                    </td>
                    <td className="px-3 py-2 capitalize">
                      {p.status || "—"}
                    </td>
                    <td className="px-3 py-2">
                      {p.status !== "completed" && (
                        <button
                          onClick={() => handleUpdateStatus(p, "completed")}
                          className="rounded bg-emerald-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-emerald-700"
                        >
                          Mark completed
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-6 text-center text-sm text-slate-500"
                    >
                      No payments found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

    