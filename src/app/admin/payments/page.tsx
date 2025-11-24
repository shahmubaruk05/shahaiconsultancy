
"use client";

  import { useEffect, useMemo, useState } from "react";
  import { useRouter } from "next/navigation";
  import Link from "next/link";
  import {
    collection,
    doc,
    getDocs,
    updateDoc,
    query,
    orderBy,
    serverTimestamp,
    addDoc,
  } from "firebase/firestore";
  import { useFirebase } from "@/firebase";

  const ADMIN_EMAILS = [
    "shahmubaruk05@gmail.com",
    "shahmubaruk.ai@gmail.com",
  ];

  type Plan = "pro" | "premium" | "free" | string;

  interface PaymentRow {
    id: string;
    provider: "bKash" | "PayPal" | "Bank";
    email: string | null;
    txId: string | null;
    amount: number | null;
    currency: string | null;
    plan: Plan | null;
    status: string | null;
    createdAt: Date | null;
    userUid?: string | null;
    invoiceId?: string | null;
    orderId?: string | null;
    method?: string;
    slipUrl?: string;
  }

  export default function AdminPaymentsPage() {
    const { firestore, user } = useFirebase();
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState<PaymentRow[]>([]);
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "completed">("all");
    const [providerFilter, setProviderFilter] = useState<"all" | "bKash" | "PayPal" | "Bank">("all");
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
      if (!user) {
        if (!checkingAuth) router.push("/login");
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
      if (!firestore) return;

      const loadData = async () => {
        try {
          setLoading(true);

          const q = query(collection(firestore, "payments"), orderBy("createdAt", "desc"));
          const snap = await getDocs(q);

          const rows: PaymentRow[] = [];
          snap.forEach((docSnap) => {
              const data = docSnap.data() as any;
              let createdAt: Date | null = null;
              if (data.createdAt && data.createdAt.toDate) {
              createdAt = data.createdAt.toDate();
              }

              rows.push({
                  id: docSnap.id,
                  provider: data.provider || "Bank",
                  email: data.userEmail ?? data.email ?? null,
                  txId: data.txId ?? null,
                  amount: data.amount ? Number(data.amount) : null,
                  currency: data.currency ?? (data.provider === 'bKash' ? 'BDT' : 'USD'),
                  plan: data.plan ?? null,
                  status: data.status ?? "pending",
                  createdAt,
                  userUid: data.uid ?? null,
                  invoiceId: data.invoiceId ?? null,
                  orderId: data.orderId ?? null,
                  method: data.method ?? data.provider,
                  slipUrl: data.slipUrl ?? null,
              });
          });

          setPayments(rows);
        } catch (err) {
          console.error("Failed to load payments", err);
          setError("Failed to load payments.");
        } finally {
          setLoading(false);
        }
      }
      loadData();
    }, [firestore, user, checkingAuth, router]);

    const filtered = useMemo(() => {
      return payments.filter((p) => {
        if (providerFilter !== "all" && p.provider !== providerFilter) return false;
        if (statusFilter !== "all" && (p.status ?? "") !== statusFilter) return false;
        return true;
      });
    }, [payments, providerFilter, statusFilter]);

    const handleUpdateStatus = async (p: PaymentRow, newStatus: string) => {
      if (!firestore) return;
      try {
        await updateDoc(doc(firestore, "payments", p.id), {
          status: newStatus,
        });

        // If an order is linked, update its paymentStatus and add a timeline event
        if (p.orderId) {
          const orderRef = doc(firestore, "orders", p.orderId);
          await updateDoc(orderRef, {
            paymentStatus: "paid",
            updatedAt: serverTimestamp(),
          });

          // Add a timeline event
          const timelineCol = collection(orderRef, "statusTimeline");
          await addDoc(timelineCol, {
            type: "payment",
            message: `Payment of ${p.amount} ${p.currency} confirmed via ${p.provider}.`,
            createdAt: serverTimestamp(),
            createdBy: "admin",
            meta: {
              paymentId: p.id,
              provider: p.provider,
              amount: p.amount,
              currency: p.currency,
              txId: p.txId,
            },
          });
        }


        // Also update invoice if linked
        if (p.invoiceId && (newStatus === 'completed' || newStatus === 'approved')) {
            await updateDoc(doc(firestore, "invoices", p.invoiceId), {
                status: 'paid',
                paidAt: serverTimestamp(),
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
                setProviderFilter(e.target.value as "all" | "bKash" | "PayPal" | "Bank")
              }
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            >
              <option value="all">All</option>
              <option value="bKash">bKash</option>
              <option value="PayPal">PayPal</option>
              <option value="Bank">Bank</option>
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
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">
                    Time
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">
                    User
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">
                    Product / Order
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">
                    Amount
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">
                    Method
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">
                    Tx ID / Ref
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">
                    Slip
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
                    <td className="px-3 py-2">{p.email || "—"}</td>
                    <td className="px-3 py-2">
                        {p.orderId ? (
                            <Link href={`/admin/orders?orderId=${p.orderId}`} className="underline text-blue-600">
                                Order #{p.orderId.slice(0,5)}
                            </Link>
                        ) : p.invoiceId ? ( 
                          <Link href={`/admin/invoices?id=${p.invoiceId}`} className="underline text-blue-600">
                            Invoice #{p.invoiceId.slice(0,5)}
                          </Link>
                        ) : p.plan || '—'}
                    </td>
                    <td className="px-3 py-2">
                      {p.amount != null ? `${p.amount} ${p.currency || ''}` : "—"}
                    </td>
                    <td className="px-3 py-2 capitalize">{p.method}</td>
                    <td className="px-3 py-2 font-mono">{p.txId || '—'}</td>
                    <td className="px-3 py-2">
                        {p.slipUrl ? (
                            <a href={p.slipUrl} target="_blank" rel="noreferrer" className="underline text-blue-600">View slip</a>
                        ) : '—'}
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
                      colSpan={9}
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
    

    
