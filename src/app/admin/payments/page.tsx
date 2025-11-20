"use client";

  import { useEffect, useMemo, useState } from "react";
  import { useRouter } from "next/navigation";
  import Link from "next/link";
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import {
    getFirestore,
    collection,
    doc,
    getDocs,
    updateDoc,
    query,
    orderBy
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
    provider: "bkash" | "paypal" | "bank";
    email: string | null;
    txId: string | null;
    amount: number | null;
    currency: string | null;
    plan: Plan | null;
    status: string | null;
    createdAt: Date | null;
    userUid?: string | null;
    invoiceId?: string | null;
  }

  export default function AdminPaymentsPage() {
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState<PaymentRow[]>([]);
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "completed">("all");
    const [providerFilter, setProviderFilter] = useState<"all" | "bkash" | "paypal" | "bank">("all");
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
          
          const collectionsToFetch = [
              { name: "bkashPayments", provider: "bkash" as const },
              { name: "paypalPayments", provider: "paypal" as const },
              { name: "invoicePayments", provider: "bank" as const },
          ];

          for (const { name, provider } of collectionsToFetch) {
            try {
                const q = query(collection(db, name), orderBy("createdAt", "desc"));
                const snap = await getDocs(q);
                snap.forEach((docSnap) => {
                    const data = docSnap.data() as any;
                    let createdAt: Date | null = null;
                    if (data.createdAt && data.createdAt.toDate) {
                    createdAt = data.createdAt.toDate();
                    }

                    rows.push({
                        id: docSnap.id,
                        provider: provider,
                        email: data.email ?? data.payerEmail ?? null,
                        txId: data.txId ?? data.paypalEventId ?? null,
                        amount: data.amount ? Number(data.amount) : (data.amountBdt ? Number(data.amountBdt) : null),
                        currency: data.currency ?? (provider === 'bkash' ? 'BDT' : 'USD'),
                        plan: data.plan ?? null,
                        status: data.status ?? "pending",
                        createdAt,
                        userUid: data.uid ?? null,
                        invoiceId: data.invoiceId ?? null,
                    });
                });
            } catch (err) {
                 console.warn(`${name} collection not found or not readable`, err);
            }
          }

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
    }, [db, router]);

    const filtered = useMemo(() => {
      return payments.filter((p) => {
        if (providerFilter !== "all" && p.provider !== providerFilter) return false;
        if (statusFilter !== "all" && (p.status ?? "") !== statusFilter) return false;
        return true;
      });
    }, [payments, providerFilter, statusFilter]);

    const handleUpdateStatus = async (p: PaymentRow, newStatus: string) => {
      try {
        let colName = "invoicePayments"; // default
        if (p.provider === 'bkash') colName = 'bkashPayments';
        if (p.provider === 'paypal') colName = 'paypalPayments';
        
        await updateDoc(doc(db, colName, p.id), {
          status: newStatus,
        });

        // Also update invoice if linked
        if (p.invoiceId && (newStatus === 'completed' || newStatus === 'approved')) {
            await updateDoc(doc(db, "invoices", p.invoiceId), {
                status: 'paid',
                paidAt: new Date(),
                paidByPaymentId: p.id,
            });
        }


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
            Review bKash, PayPal, and Bank payments, verify status, and cross-check with user subscriptions or invoices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Provider:</span>
            <select
              value={providerFilter}
              onChange={(e) =>
                setProviderFilter(e.target.value as "all" | "bkash" | "paypal" | "bank")
              }
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            >
              <option value="all">All</option>
              <option value="bkash">bKash</option>
              <option value="paypal">PayPal</option>
              <option value="bank">Bank</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "pending" | "approved" | "completed")
              }
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed (Auto)</option>
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
                    Product
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
                    <td className="px-3 py-2">
                        {p.plan || (p.invoiceId && 
                          <Link href={`/admin/invoices?id=${p.invoiceId}`} className="underline text-blue-600">
                            Invoice #{p.invoiceId.slice(0,5)}
                          </Link>
                        ) || '—'}
                    </td>
                    <td className="px-3 py-2">
                      {p.amount != null ? `${p.amount} ${p.currency}` : "—"}
                    </td>
                    <td className="px-3 py-2 capitalize">
                      {p.status || "—"}
                    </td>
                    <td className="px-3 py-2">
                      {p.status === "pending" && (
                        <button
                          onClick={() => handleUpdateStatus(p, "approved")}
                          className="rounded bg-emerald-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-emerald-700"
                        >
                          Mark approved
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && !loading && (
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
