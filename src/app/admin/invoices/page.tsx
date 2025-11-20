"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import Link from "next/link";
import { useFirebase } from "@/firebase/provider";

type InvoiceStatus = "draft" | "sent" | "partial" | "paid" | "cancelled";

type Invoice = {
  id: string;
  clientName: string;
  email: string;
  phone?: string;
  service?: string;
  currency: "BDT" | "USD";
  lineItems: { label: string; amount: number }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethods: {
    bkash?: boolean;
    bank?: boolean;
    paypal?: boolean;
  };
  bkashNumber?: string;
  paypalLink?: string;
  bankDetails?: string;
  status: InvoiceStatus;
  relatedIntakeId?: string;
  notesInternal?: string;
  notesPublic?: string;
  createdAt?: Timestamp | null;
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  partial: "Partially paid",
  paid: "Paid",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: "bg-slate-50 text-slate-700 border-slate-200",
  sent: "bg-sky-50 text-sky-700 border-sky-200",
  partial: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

const emptyInvoice: Omit<Invoice, "id"> = {
  clientName: "",
  email: "",
  phone: "",
  service: "",
  currency: "BDT",
  lineItems: [
    { label: "Government Fees", amount: 0 },
    { label: "Service Charge", amount: 0 },
  ],
  subtotal: 0,
  discount: 0,
  total: 0,
  paymentMethods: {
    bkash: true,
    bank: true,
    paypal: false,
  },
  bkashNumber: "01711781232",
  paypalLink: "",
  bankDetails:
    "Bank: [Bank Name]\nAccount Name: [Your Name]\nAccount Number: [XXXXXXXXX]\nBranch: [Branch Name]",
  status: "draft",
  relatedIntakeId: "",
  notesInternal: "",
  notesPublic: "Please complete payment within 3 working days.",
  createdAt: null,
};

export default function AdminInvoicesPage() {
  const { firestore } = useFirebase();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedId, setSelectedId] = useState<string | "new">("new");
  const [form, setForm] = useState<Omit<Invoice, "id">>(emptyInvoice);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore) return;
    const q = query(
      collection(firestore, "invoices"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: Invoice[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          const items = Array.isArray(data.lineItems)
            ? data.lineItems.map((li: any) => ({
                label: li.label || "",
                amount: Number(li.amount) || 0,
              }))
            : [];
          rows.push({
            id: d.id,
            clientName: data.clientName || "",
            email: data.email || "",
            phone: data.phone || "",
            service: data.service || "",
            currency: (data.currency as "BDT" | "USD") || "BDT",
            lineItems: items,
            subtotal: Number(data.subtotal) || 0,
            discount: Number(data.discount) || 0,
            total: Number(data.total) || 0,
            paymentMethods: {
              bkash: !!data.paymentMethods?.bkash,
              bank: !!data.paymentMethods?.bank,
              paypal: !!data.paymentMethods?.paypal,
            },
            bkashNumber: data.bkashNumber || "",
            paypalLink: data.paypalLink || "",
            bankDetails: data.bankDetails || "",
            status: (data.status as InvoiceStatus) || "draft",
            relatedIntakeId: data.relatedIntakeId || "",
            notesInternal: data.notesInternal || "",
            notesPublic: data.notesPublic || "",
            createdAt: data.createdAt || null,
          });
        });
        setInvoices(rows);

        if (selectedId !== "new") {
          const exists = rows.some((i) => i.id === selectedId);
          if (!exists) setSelectedId("new");
        }
      },
      (err) => {
        console.error("Failed to load invoices", err);
        setError("Invoices load করতে সমস্যা হয়েছে।");
      }
    );
    return () => unsub();
  }, [firestore, selectedId]);

  const selectedInvoice: Invoice | null = useMemo(() => {
    if (selectedId === "new") return null;
    return invoices.find((i) => i.id === selectedId) || null;
  }, [selectedId, invoices]);

  useEffect(() => {
    if (!selectedInvoice) {
      setForm(emptyInvoice);
    } else {
      const { id, ...rest } = selectedInvoice;
      setForm(rest);
    }
  }, [selectedInvoice]);

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

  function recalcTotals(next: Omit<Invoice, "id">): Omit<Invoice, "id"> {
    const subtotal = next.lineItems.reduce(
      (sum, li) => sum + (Number(li.amount) || 0),
      0
    );
    const discount = Number(next.discount) || 0;
    const total = subtotal - discount;
    return { ...next, subtotal, total };
  }

  const handleLineItemChange = (
    index: number,
    field: "label" | "amount",
    value: string
  ) => {
    setForm((prev) => {
      const lineItems = [...prev.lineItems];
      const li = { ...lineItems[index] };
      if (field === "label") li.label = value;
      if (field === "amount") li.amount = Number(value) || 0;
      lineItems[index] = li;
      return recalcTotals({ ...prev, lineItems });
    });
  };

  const addLineItem = () => {
    setForm((prev) =>
      recalcTotals({
        ...prev,
        lineItems: [...prev.lineItems, { label: "Additional item", amount: 0 }],
      })
    );
  };

  const removeLineItem = (index: number) => {
    setForm((prev) => {
      const lineItems = prev.lineItems.filter((_, i) => i !== index);
      return recalcTotals({ ...prev, lineItems });
    });
  };

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!firestore) return;

    if (!form.clientName || !form.email || !form.total) {
      setError("Client name, email এবং total amount দেওয়া বাধ্যতামূলক।");
      return;
    }

    setUpdating(true);
    setError(null);

    const payload = {
      ...form,
      subtotal: form.subtotal,
      discount: Number(form.discount) || 0,
      total: form.total,
      paymentMethods: {
        bkash: !!form.paymentMethods?.bkash,
        bank: !!form.paymentMethods?.bank,
        paypal: !!form.paymentMethods?.paypal,
      },
      updatedAt: serverTimestamp(),
    };

    try {
      if (selectedId === "new") {
        const ref = await addDoc(collection(firestore, "invoices"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setSelectedId(ref.id);
      } else {
        await updateDoc(doc(firestore, "invoices", selectedId), payload);
      }
    } catch (err) {
      console.error("Failed to save invoice", err);
      setError("Invoice save করতে সমস্যা হয়েছে।");
    } finally {
      setUpdating(false);
    }
  }

  function currencySymbol() {
    return form.currency === "USD" ? "$" : "৳";
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
              Invoices
            </h1>
            <p className="text-sm text-slate-600">
              এখানে client–দের জন্য invoice create, update এবং status track করতে
              পারবেন। Public invoice লিংক client–কে পাঠিয়ে payment collect করতে পারবেন।
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedId("new")}
              className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              + New invoice
            </button>
            <Link
              href="/intake"
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              🔗 View intake form
            </Link>
          </div>
        </div>

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
                Invoice list ({invoices.length})
              </p>
            </div>
            <div className="max-h-[520px] overflow-y-auto divide-y divide-slate-100">
              {invoices.length === 0 && (
                <div className="px-3 py-4 text-xs text-slate-500">
                  এখনো কোনো invoice তৈরি করা হয়নি।
                </div>
              )}
              {invoices.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => setSelectedId(inv.id)}
                  className={[
                    "w-full text-left px-3 py-2.5 flex flex-col gap-1 text-xs",
                    selectedId === inv.id
                      ? "bg-sky-50"
                      : "hover:bg-slate-50",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-slate-800 font-medium">
                      {inv.clientName}
                    </div>
                    <span
                      className={[
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        STATUS_COLORS[inv.status],
                      ].join(" ")}
                    >
                      {STATUS_LABELS[inv.status]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[11px] text-slate-600">
                      {inv.service || "-"}
                    </p>
                    <p className="text-[11px] font-medium text-slate-800">
                      {inv.currency === "USD" ? "$" : "৳"}
                      {inv.total.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {formatDate(inv.createdAt)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Right: editor */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                    {selectedId === "new"
                      ? "New invoice"
                      : "Edit invoice"}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    {selectedId !== "new" && (
                      <span>
                        Public link:{" "}
                        <code className="rounded bg-slate-50 px-1 py-0.5">
                          /invoice/{selectedId}
                        </code>
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        status: e.target.value as InvoiceStatus,
                      }))
                    }
                    className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs"
                  >
                    {(Object.keys(STATUS_LABELS) as InvoiceStatus[]).map(
                      (st) => (
                        <option key={st} value={st}>
                          {STATUS_LABELS[st]}
                        </option>
                      )
                    )}
                  </select>
                  <div className="text-[11px] text-slate-500">
                    {selectedInvoice?.createdAt && (
                      <>Created: {formatDate(selectedInvoice.createdAt)}</>
                    )}
                  </div>
                </div>
              </div>

              {/* Client info */}
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Client name *
                  </label>
                  <input
                    type="text"
                    value={form.clientName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        clientName: e.target.value,
                      }))
                    }
                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs"
                  />
                </div>
              </div>

              {/* Service + currency */}
              <div className="grid md:grid-cols-[2fr_1fr] gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Service
                  </label>
                  <input
                    type="text"
                    value={form.service}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, service: e.target.value }))
                    }
                    placeholder="e.g., BD Company Formation (10 lakh capital)"
                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={form.currency}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        currency: e.target.value as "BDT" | "USD",
                      }))
                    }
                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs"
                  >
                    <option value="BDT">BDT (৳)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              {/* Line items */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-700">
                    Line items
                  </p>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    + Add item
                  </button>
                </div>
                <div className="space-y-2">
                  {form.lineItems.map((li, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)_auto] gap-2 items-center"
                    >
                      <input
                        type="text"
                        value={li.label}
                        onChange={(e) =>
                          handleLineItemChange(idx, "label", e.target.value)
                        }
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                        placeholder="Description"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500">
                          {currencySymbol()}
                        </span>
                        <input
                          type="number"
                          value={li.amount}
                          onChange={(e) =>
                            handleLineItemChange(idx, "amount", e.target.value)
                          }
                          className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        className="text-[11px] text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-200 flex flex-col items-end gap-1 text-xs">
                  <div className="flex gap-2">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-medium text-slate-800">
                      {currencySymbol()}
                      {form.subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-slate-600">Discount:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-500">
                        {currencySymbol()}
                      </span>
                      <input
                        type="number"
                        value={form.discount}
                        onChange={(e) =>
                          setForm((prev) =>
                            recalcTotals({
                              ...prev,
                              discount: Number(e.target.value) || 0,
                            })
                          )
                        }
                        className="w-24 rounded border border-slate-300 px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-600">Total:</span>
                    <span className="font-semibold text-slate-900">
                      {currencySymbol()}
                      {form.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment methods */}
              <div className="grid md:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <p className="font-medium text-slate-700 mb-1">
                    Payment methods
                  </p>
                  <label className="flex items-center gap-2 text-[11px] text-slate-700">
                    <input
                      type="checkbox"
                      checked={!!form.paymentMethods.bkash}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          paymentMethods: {
                            ...prev.paymentMethods,
                            bkash: e.target.checked,
                          },
                        }))
                      }
                    />
                    bKash
                  </label>
                  <label className="flex items-center gap-2 text-[11px] text-slate-700">
                    <input
                      type="checkbox"
                      checked={!!form.paymentMethods.bank}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          paymentMethods: {
                            ...prev.paymentMethods,
                            bank: e.target.checked,
                          },
                        }))
                      }
                    />
                    Bank transfer
                  </label>
                  <label className="flex items-center gap-2 text-[11px] text-slate-700">
                    <input
                      type="checkbox"
                      checked={!!form.paymentMethods.paypal}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          paymentMethods: {
                            ...prev.paymentMethods,
                            paypal: e.target.checked,
                          },
                        }))
                      }
                    />
                    PayPal
                  </label>
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">
                    bKash number
                  </label>
                  <input
                    type="text"
                    value={form.bkashNumber}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        bkashNumber: e.target.value,
                      }))
                    }
                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                    placeholder="017xxxxxxxx"
                  />
                  <label className="block text-[11px] font-medium text-slate-700 mt-2">
                    PayPal link
                  </label>
                  <input
                    type="text"
                    value={form.paypalLink}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        paypalLink: e.target.value,
                      }))
                    }
                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                    placeholder="https://paypal.me/..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">
                    Bank details (client–কে দেখাবে)
                  </label>
                  <textarea
                    rows={5}
                    value={form.bankDetails}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        bankDetails: e.target.value,
                      }))
                    }
                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="grid md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Public note (client view)
                  </label>
                  <textarea
                    rows={3}
                    value={form.notesPublic}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        notesPublic: e.target.value,
                      }))
                    }
                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Internal notes (only admin)
                  </label>
                  <textarea
                    rows={3}
                    value={form.notesInternal}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        notesInternal: e.target.value,
                      }))
                    }
                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-500">
                  Client–কে পাঠানোর লিংক:{" "}
                  {selectedId !== "new" ? (
                    <code className="rounded bg-slate-50 px-1 py-0.5">
                      /invoice/{selectedId}
                    </code>
                  ) : (
                    "Save করার পর লিংক তৈরি হবে।"
                  )}
                </p>
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-70"
                >
                  {updating ? "Saving..." : "Save invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
