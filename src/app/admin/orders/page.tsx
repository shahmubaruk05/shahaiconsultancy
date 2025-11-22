"use client";

import { useState, useEffect, useMemo } from "react";
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase";
import {
  collection,
  query,
  orderBy,
} from "firebase/firestore";
import type {
  Order,
  OrderUpdate,
  OrderFile,
} from "@/types/order";
import Link from "next/link";
import { Timestamp } from "firebase/firestore";

function OrderDetailPanel({ order, orderId }: { order: Order; orderId: string }) {
    // This is a placeholder for the detailed view of an order.
    // You can build out this component to show more details,
    // add updates, manage files, etc.
    return (
        <div>
            <h2 className="text-lg font-bold mb-2">{order.clientName}</h2>
            <p className="text-sm text-muted-foreground">{order.serviceName}</p>
            <div className="mt-4 border-t pt-4">
                <p className="text-xs text-muted-foreground">Order details will be displayed here.</p>
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
                    <PaymentBadge status={ord.paymentStatus} />
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
    const map: Record<Order["paymentStatus"], string> = {
        unpaid: "Unpaid",
        partially_paid: "Partially paid",
        paid: "Paid",
        refunded: "Refunded",
    };
    const colors: Record<Order["paymentStatus"], string> = {
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