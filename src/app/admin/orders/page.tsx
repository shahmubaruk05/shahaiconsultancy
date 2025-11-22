
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
  addDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import type { Order, OrderUpdate, OrderFile, OrderStatusEvent } from "@/types/order";
import Link from "next/link";
import { Timestamp } from "firebase/firestore";
import { Loader2 } from "lucide-react";

// --- Tab Components ---

function OverviewTab({ order }: { order: Order }) {
    return (
      <div className="text-sm space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
              <div>
                  <p className="font-semibold text-slate-700">Client Details</p>
                  <p>Name: {order.clientName}</p>
                  <p>Email: {order.clientEmail}</p>
                  <p>Phone: {order.clientPhone || "N/A"}</p>
              </div>
              <div>
                  <p className="font-semibold text-slate-700">Order Details</p>
                  <p>Service: {order.serviceName}</p>
                  <p>Package: {order.packageName || "N/A"}</p>
                  <p>Country: {order.country || "N/A"}</p>
              </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
               <div>
                  <p className="font-semibold text-slate-700">Financials</p>
                  <p>Amount: {order.amount} {order.currency}</p>
                  <p>Payment Method: {order.paymentMethod || "N/A"}</p>
              </div>
              <div>
                  <p className="font-semibold text-slate-700">Source & Links</p>
                  <p>Source: {order.source}</p>
                  <p>Intake ID: {order.intakeId || "N/A"}</p>
                  <p>Invoice ID: {order.invoiceId || "N/A"}</p>
              </div>
          </div>
      </div>
    );
  }
  
  function OrderUpdatesTab({ orderId, order }: { orderId: string, order: Order }) {
    const { firestore, user } = useFirebase();
    const updatesQuery = useMemoFirebase(() => {
        if (!firestore || !orderId) return null;
        return query(collection(firestore, `orders/${orderId}/updates`), orderBy("createdAt", "desc"));
    }, [firestore, orderId]);
    const { data: updates, isLoading } = useCollection<OrderUpdate>(updatesQuery);
    
    const [noteText, setNoteText] = useState('');
    const [isInternal, setIsInternal] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    async function handleAddNote() {
        if (!firestore || !noteText.trim() || !user) return;
        try {
            setIsSubmitting(true);
            const updatesCol = collection(firestore, `orders/${orderId}/updates`);
            await addDoc(updatesCol, {
                type: "admin",
                fromName: user.displayName || "Admin",
                message: noteText,
                internalOnly: isInternal,
                createdAt: serverTimestamp(),
            });
            setNoteText('');
        } catch (err) {
            console.error("Failed to add update", err);
        } finally {
            setIsSubmitting(false);
        }
    }
  
    return (
        <div className="pt-4 space-y-4">
            <div className="space-y-2">
                <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={3}
                    placeholder="Write an internal note or a message for the client..."
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                />
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                        <input
                            type="checkbox"
                            checked={isInternal}
                            onChange={(e) => setIsInternal(e.target.checked)}
                        />
                        Internal note (client won't see)
                    </label>
                    <button
                        type="button"
                        onClick={handleAddNote}
                        disabled={isSubmitting || !noteText.trim()}
                        className="rounded bg-sky-600 px-3 py-1 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-50"
                    >
                        {isSubmitting ? "Adding..." : "Add Update"}
                    </button>
                </div>
            </div>
            {isLoading ? <p className="text-xs text-slate-500">Loading updates...</p> : (
                <div className="space-y-3">
                    {(updates || []).map(upd => (
                        <div key={upd.id} className="text-xs border-b border-slate-100 pb-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-slate-800">{upd.fromName || upd.type}</span>
                                <span className="text-[10px] text-slate-400">{(upd.createdAt as any)?.toDate?.().toLocaleString('en-GB') ?? ''}</span>
                            </div>
                            <p className="text-slate-700 whitespace-pre-wrap">{upd.message}</p>
                            {upd.internalOnly && <span className="text-[10px] text-amber-600"> (Internal)</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
  }
  
  function OrderFilesTab({ orderId }: { orderId: string }) {
    const { firestore, firebaseApp, user } = useFirebase();
    const filesQuery = useMemoFirebase(() => {
        if (!firestore || !orderId) return null;
        return query(collection(firestore, `orders/${orderId}/files`), orderBy("createdAt", "desc"));
    }, [firestore, orderId]);
    const { data: files, isLoading } = useCollection<OrderFile>(filesQuery);

    const [uploading, setUploading] = useState(false);

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || e.target.files.length === 0 || !firestore || !firebaseApp || !user) return;
        const file = e.target.files[0];
        try {
            setUploading(true);
            const storage = getStorage(firebaseApp);
            const fileRef = storageRef(storage, `orders/${orderId}/${Date.now()}-${file.name}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);

            const filesCol = collection(firestore, `orders/${orderId}/files`);
            await addDoc(filesCol, {
                fileName: file.name,
                fileUrl: url,
                uploadedBy: "admin",
                uploadedByName: user.displayName || "Admin",
                createdAt: serverTimestamp(),
            });
        } catch (err) {
            console.error("File upload failed", err);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    }

    return (
        <div className="pt-4 space-y-4">
            <div>
                <label className="text-xs font-medium text-slate-700">Upload new file</label>
                <input type="file" onChange={handleFileUpload} disabled={uploading} className="mt-1 text-xs" />
                {uploading && <span className="text-xs text-slate-500">Uploading...</span>}
            </div>
            {isLoading ? <p className="text-xs text-slate-500">Loading files...</p> : (
                <ul className="space-y-2">
                    {(files || []).map(file => (
                        <li key={file.id} className="text-xs flex items-center justify-between border-b pb-1">
                            <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sky-600 underline truncate">{file.fileName}</a>
                            <span className="text-slate-500 ml-2">by {file.uploadedByName || 'User'}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
  }
  
  function OrderTimelineTab({ orderId }: { orderId: string }) {
    const { firestore } = useFirebase();
    const timelineQuery = useMemoFirebase(() => {
        if (!firestore || !orderId) return null;
        return query(collection(firestore, `orders/${orderId}/statusTimeline`), orderBy("createdAt", "desc"));
    }, [firestore, orderId]);
    const { data: timeline, isLoading } = useCollection<OrderStatusEvent>(timelineQuery);

    return (
        <div className="pt-4">
            {isLoading ? <p className="text-xs text-slate-500">Loading timeline...</p> : (
                <ul className="space-y-3 border-l-2 border-slate-200 ml-2">
                    {(timeline || []).map(event => (
                        <li key={event.id} className="relative pl-6">
                            <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-slate-300"></div>
                            <p className="text-xs font-medium text-slate-800">{event.label}</p>
                            <p className="text-[11px] text-slate-500">{(event.createdAt as any)?.toDate?.().toLocaleString('en-GB') ?? ''}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
  }

function OrderDetailPanel({ order, orderId }: { order: Order; orderId: string }) {
  const { firestore } = useFirebase();
  const [saving, setSaving] = useState(false);
  const [localStatus, setLocalStatus] = useState<Order["status"]>(order.status);
  const [localPaymentStatus, setLocalPaymentStatus] = useState<Order["paymentStatus"]>(
    order.paymentStatus
  );
  const [activeTab, setActiveTab] = useState<"overview" | "updates" | "files" | "timeline">(
    "overview"
  );

  useEffect(() => {
    setLocalStatus(order.status);
    setLocalPaymentStatus(order.paymentStatus);
  }, [order.status, order.paymentStatus]);

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
      // Add a timeline event for the status change
      const timelineCol = collection(ref, "statusTimeline");
      await addDoc(timelineCol, {
        label: `Status changed to ${localStatus}, payment ${localPaymentStatus}`,
        status: localStatus,
        createdAt: serverTimestamp(),
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
            href={`/admin/invoices?id=${order.invoiceId}`}
            className="text-xs text-sky-600 hover:underline"
          >
            Open invoice
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-4 border-b border-slate-200 flex gap-4 text-xs">
        {(["overview", "updates", "files", "timeline"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={
              "pb-2 border-b-2 -mb-px capitalize " +
              (activeTab === tab
                ? "border-sky-600 text-sky-700 font-medium"
                : "border-transparent text-slate-500 hover:text-slate-700")
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <OverviewTab order={order} />
      )}
      {activeTab === "updates" && (
        <OrderUpdatesTab orderId={orderId} order={order} />
      )}
      {activeTab === "files" && (
        <OrderFilesTab orderId={orderId} />
      )}
      {activeTab === "timeline" && (
        <OrderTimelineTab orderId={orderId} />
      )}
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
    if (!selectedId && orders && orders.length > 0) {
        return orders[0];
    }
    return orders?.find((o) => o.id === selectedId) || null;
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
          <div className="p-4 text-sm text-slate-500 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>Loading orders...</div>
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
        {loading ? (
             <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin"/></div>
        ) : selectedOrder ? (
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

function PaymentBadge({ status }: { status: Order["paymentStatus"] | null }) {
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
