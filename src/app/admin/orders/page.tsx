
"use client";

import { useState, useEffect, useMemo } from "react";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import {
  collection,
  query,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { Order } from "@/types/order";
import Link from "next/link";
import { Timestamp } from "firebase/firestore";

function OrderDetailPanel({ order, orderId }: { order: Order; orderId: string }) {
  const { firestore } = useFirebase();
  const [saving, setSaving] = useState(false);
  const [localStatus, setLocalStatus] = useState<Order["status"]>(order.status);
  const [localPaymentStatus, setLocalPaymentStatus] = useState<Order["paymentStatus"]>(
    order.paymentStatus
  );

  // When the selected order changes, update the local state
  useEffect(() => {
    setLocalStatus(order.status);
    setLocalPaymentStatus(order.paymentStatus);
  }, [order]);


  async function handleSaveStatus() {
    if (!firestore) return;
    try {
      setSaving(true);
      const ref = doc(firestore, "orders", orderId);
      await updateDoc(ref, {
        status: localStatus,
        paymentStatus: localPaymentStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to update order status", err);
    } finally {
      setSaving(false);
    }
  }

  const created =
    (order.createdAt as any)?.toDate?.().toLocaleString?.("en-GB") ?? "";

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {order.clientName}
          </h2>
          <p className="text-xs text-slate-600">
            {order.clientEmail} {order.clientPhone && <>• {order.clientPhone}</>}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Service: {order.serviceName}{" "}
            {order.packageName && <>• Package: {order.packageName}</>} •{" "}
            {order.country ?? "—"}
          </p>
        </div>
        <div className="text-right space-y-2">
          <div className="text-sm font-semibold text-slate-900">
            {order.amount} {order.currency}
          </div>
          <div className="flex items-center gap-1 justify-end">
            <StatusBadge status={localStatus} />
            <PaymentBadge status={localPaymentStatus} />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Created: {created}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">
            Order status
          </label>
          <select
            value={localStatus}
            onChange={(e) =>
              setLocalStatus(e.target.value as Order["status"])
            }
            className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="waiting_payment">Waiting payment</option>
            <option value="paid">Paid</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">
            Payment status
          </label>
          <select
            value={localPaymentStatus || "unpaid"}
            onChange={(e) =>
              setLocalPaymentStatus(
                e.target.value as Order["paymentStatus"]
              )
            }
            className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
          >
            <option value="unpaid">Unpaid</option>
            <option value="partially_paid">Partially paid</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSaveStatus}
          disabled={saving}
          className="inline-flex items-center rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save status"}
        </button>

        {order.intakeId && (
          <Link
            href={`/admin/intakes?selected=${order.intakeId}`}
            className="text-xs text-sky-600 hover:underline"
          >
            Open intake
          </Link>
        )}
        {order.invoiceId && (
          <Link
            href={`/admin/invoices?invoiceId=${order.invoiceId}`}
            className="text-xs text-sky-600 hover:underline"
          >
            Open invoice
          </Link>
        )}
      </div>

      {/* ভবিষ্যতে এখানে updates/files/timeline ট্যাব add করা যাবে */}
      <div className="mt-4 border-t border-slate-100 pt-3">
        <p className="text-xs text-slate-500">
          পরের ধাপে এখানে order updates (ticket messages), uploaded files এবং
          status timeline দেখানো যাবে।
        </p>
      </div>
    </div>
  );
}


export default function AdminOrdersPage() {
  const { firestore } = useFirebase();

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "orders"), orderBy("createdAt", "desc"));
  }, [firestore]);

  const { data: orders, isLoading: loading, error } = useCollection<Order>(ordersQuery);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!selectedId && orders && orders.length > 0) {
      setSelectedId(orders[0].id);
    }
  }, [orders, selectedId]);

  const selectedOrder = useMemo(() => {
    return orders?.find((o) => o.id === selectedId) || orders?.[0] || null;
  }, [orders, selectedId]);


  return (
    <div className="flex h-[calc(100vh-80px)] gap-4">
      {/* LEFT: order list */}
      <div className="w-full max-w-xs border border-slate-200 bg-white rounded-lg overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-slate-100">
          <h1 className="text-sm font-semibold text-slate-900">
            Orders / Tickets
          </h1>
          <p className="text-xs text-slate-500">
            Intake থেকে তৈরি সব orders, status অনুযায়ী manage করুন।
          </p>
        </div>

        {loading ? (
          <div className="p-4 text-sm text-slate-500">Loading orders...</div>
        ) : error ? (
          <div className="p-4 text-sm text-red-600">
            Error loading orders.
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">
            এখনো কোনো order তৈরি হয়নি।
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {orders.map((ord) => {
              const created =
                (ord.createdAt as Timestamp)?.toDate?.().toLocaleDateString?.(
                  "en-GB"
                ) ?? "";

              return (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => setSelectedId(ord.id)}
                  className={
                    "w-full px-3 py-2 text-left text-xs border-b border-slate-100 hover:bg-slate-50 " +
                    (selectedOrder?.id === ord.id ? "bg-slate-100" : "")
                  }
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-slate-900 line-clamp-1">
                      {ord.clientName}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-2 shrink-0">
                      {created}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 line-clamp-1">
                    {ord.serviceName} • {ord.country ?? "—"}
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <StatusBadge status={ord.status} />
                    {ord.paymentStatus && <PaymentBadge status={ord.paymentStatus} />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT: selected order details */}
      <div className="flex-1 border border-slate-200 bg-white rounded-lg p-4 overflow-y-auto">
        {selectedOrder ? (
          <OrderDetailPanel orderId={selectedOrder.id} order={selectedOrder} />
        ) : (
          <div className="text-sm text-slate-500">
            কোনো order select করা নেই।
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const map: Record<Order["status"], string> = {
    pending: "Pending",
    in_progress: "In progress",
    waiting_payment: "Waiting payment",
    paid: "Paid",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  const colors: Record<Order["status"], string> = {
    pending: "bg-slate-100 text-slate-700",
    in_progress: "bg-sky-100 text-sky-700",
    waiting_payment: "bg-amber-100 text-amber-800",
    paid: "bg-emerald-100 text-emerald-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-rose-100 text-rose-700",
  };
  return (
    <span
      className={
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium " +
        colors[status]
      }
    >
      {map[status]}
    </span>
  );
}

function PaymentBadge({ status }: { status: Order["paymentStatus"] }) {
    if (!status) return null;
    const map = {
        unpaid: "Unpaid",
        partially_paid: "Partially paid",
        paid: "Paid",
        refunded: "Refunded",
    };
    const colors = {
        unpaid: "bg-slate-100 text-slate-700",
        partially_paid: "bg-amber-100 text-amber-800",
        paid: "bg-emerald-100 text-emerald-700",
        refunded: "bg-slate-100 text-slate-700",
    };
  return (
    <span
      className={
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium " +
        colors[status]
      }
    >
      {map[status]}
    </span>
  );
}
