
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { useFirebase } from "@/firebase/provider";
import { useToast } from "@/components/ui/use-toast";

type InvoiceStatus = "draft" | "unpaid" | "paid" | "cancelled" | "partial";

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
  notesPublic?: string;
  amount?: number;
};

export default function PublicInvoicePage() {
  const params = useParams<{ id: string }>();
  const invoiceId = params?.id;
  const { firestore, firebaseApp } = useFirebase();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);


  useEffect(() => {
    if (!firestore || !invoiceId) return;
    (async () => {
      try {
        const snap = await getDoc(doc(firestore, "invoices", invoiceId));
        if (!snap.exists()) {
          setInvoice(null);
        } else {
          const data = snap.data() as any;
          const items = Array.isArray(data.lineItems)
            ? data.lineItems.map((li: any) => ({
                label: li.label || "",
                amount: Number(li.amount) || 0,
              }))
            : [];
          setInvoice({
            id: snap.id,
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
            notesPublic: data.notesPublic || "",
            amount: Number(data.total) || 0,
          });
        }
      } catch (err) {
        console.error("Failed to load invoice", err);
        setFormError("Invoice load করতে সমস্যা হয়েছে।");
      } finally {
        setLoading(false);
      }
    })();
  }, [firestore, invoiceId]);

  function currencySymbol() {
    if (!invoice) return "";
    return invoice.currency === "USD" ? "$" : "৳";
  }

  const handlePaymentSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
  
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const payerName = formData.get('payerName') as string;
    const payerEmail = formData.get('payerEmail') as string;
    const paymentMethod = formData.get('paymentMethod') as string;
    const amountPaid = formData.get('amountPaid') as string;
    const txId = formData.get('txId') as string;
    const paymentSlipInput = form.elements.namedItem('paymentSlip') as HTMLInputElement | null;
    const file = paymentSlipInput?.files?.[0] ?? null;
    
    if (!payerName || !payerEmail || !txId || !amountPaid) {
      setFormError("নাম, ইমেইল, amount এবং transaction ID দেওয়া বাধ্যতামূলক।");
      return;
    }
  
    if (!firestore || !invoice || !firebaseApp) {
        setFormError('An error occurred. Please refresh and try again.');
        return;
    }

    setFormError(null);
    setIsSubmitting(true);
  
    try {
      let slipUrl: string | null = null;
  
      if (file) {
        const storage = getStorage(firebaseApp);
        const path = `invoice-payments/${invoice.id}/${Date.now()}-${file.name}`;
        const fileRef = storageRef(storage, path);
        await uploadBytes(fileRef, file);
        slipUrl = await getDownloadURL(fileRef);
      }
  
      await addDoc(collection(firestore, "invoicePayments"), {
        invoiceId: invoice.id,
        payerName,
        email: payerEmail,
        method: paymentMethod,
        amount: Number(amountPaid),
        txId: txId,
        slipUrl,
        status: "pending",
        createdAt: serverTimestamp(),
      });
  
      toast({
          title: "Submission Received!",
          description: "Your payment details have been submitted for verification.",
      });
  
      form.reset();
  
    } catch (err: any) {
      console.error("Failed to submit payment info", err);
      setFormError("কিছু সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন বা WhatsApp-এ যোগাযোগ করুন।");
      toast({
          variant: "destructive",
          title: "Submission Failed",
          description: err.message || "An unknown error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-600">Loading invoice…</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-600">
          Invoice পাওয়া যায়নি বা লিংকটি সঠিক নয়।
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
              Invoice for {invoice.clientName}
            </h1>
            <p className="text-sm text-slate-600">
              Service: {invoice.service || "Custom service"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Issued by: Shah Mubaruk – Your Startup Coach
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs text-slate-500">
              Status:{" "}
              <span className="font-medium text-slate-800">
                {invoice.status.toUpperCase()}
              </span>
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {currencySymbol()}
              {invoice.total.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Line items */}
        <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                  Description
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((li, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                >
                  <td className="px-4 py-2 text-slate-700">
                    {li.label || "-"}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-800">
                    {currencySymbol()}
                    {li.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="px-4 py-2 text-right text-slate-600">
                  Subtotal
                </td>
                <td className="px-4 py-2 text-right text-slate-800">
                  {currencySymbol()}
                  {invoice.subtotal.toLocaleString()}
                </td>
              </tr>
              {invoice.discount > 0 && (
                <tr>
                  <td className="px-4 py-2 text-right text-slate-600">
                    Discount
                  </td>
                  <td className="px-4 py-2 text-right text-rose-600">
                    -{currencySymbol()}
                    {invoice.discount.toLocaleString()}
                  </td>
                </tr>
              )}
              <tr className="bg-slate-900 text-white">
                <td className="px-4 py-2 text-right font-semibold">
                  Total payable
                </td>
                <td className="px-4 py-2 text-right font-semibold">
                  {currencySymbol()}
                  {invoice.total.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Public note */}
        {invoice.notesPublic && (
          <div className="mb-6 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-700 whitespace-pre-line">
            {invoice.notesPublic}
          </div>
        )}

        {/* Payment options */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          {invoice.paymentMethods.bkash && invoice.bkashNumber && (
            <div className="rounded-xl border border-pink-100 bg-pink-50 px-4 py-3 text-sm text-pink-900">
              <p className="text-xs font-semibold uppercase tracking-wide">
                Pay with bKash
              </p>
              <p className="mt-1 text-sm">
                bKash <strong>Payment</strong> option দিয়ে পাঠান:
              </p>
              <p className="mt-1 text-lg font-semibold">
                {invoice.bkashNumber}
              </p>
              <p className="mt-2 text-xs text-pink-900/80">
                Payment করার পরে নিচের ফর্মে Transaction ID এবং slip upload
                করুন।
              </p>
            </div>
          )}

          {invoice.paymentMethods.bank && invoice.bankDetails && (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 whitespace-pre-line">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Bank transfer details
              </p>
              <p className="mt-1">{invoice.bankDetails}</p>
            </div>
          )}

          {invoice.paymentMethods.paypal && invoice.paypalLink && (
            <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
              <p className="text-xs font-semibold uppercase tracking-wide">
                Pay with PayPal
              </p>
              <p className="mt-1">
                নিচের বাটনে ক্লিক করে PayPal–এর মাধ্যমে payment করতে পারেন:
              </p>
              <a
                href={invoice.paypalLink}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700"
              >
                Open PayPal payment page
              </a>
              <p className="mt-2 text-[11px] text-sky-900/80">
                Payment শেষ হলে নিচের ফর্মে Transaction ID এবং screenshot দিন।
              </p>
            </div>
          )}
        </div>

        {/* Payment confirmation form */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
            Payment confirmation form
          </p>
          <p className="mt-1 text-xs text-emerald-900/80">
            Payment করার পর নিচের ফর্মটি পূরণ করুন, যাতে আমরা আপনার payment verify
            করে দ্রুত service শুরু করতে পারি।
          </p>

          <form onSubmit={handlePaymentSubmit} className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  আপনার নাম *
                </label>
                <input
                  type="text"
                  name="payerName"
                  defaultValue={invoice?.clientName ?? ""}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">
                  ইমেইল *
                </label>
                <input
                  type="email"
                  name="payerEmail"
                  defaultValue={invoice?.email ?? ""}
                  className="mt-1 w-full rounded border px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Payment method *
                  </label>
                  <select
                    name="paymentMethod"
                    className="mt-1 w-full rounded border px-3 py-2 text-sm"
                    defaultValue="bkash"
                    required
                  >
                    <option value="bkash">bKash</option>
                    <option value="bank">Bank transfer</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Amount paid *
                  </label>
                  <input
                    type="number"
                    name="amountPaid"
                    className="mt-1 w-full rounded border px-3 py-2 text-sm"
                    defaultValue={invoice?.amount}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Transaction ID / Reference *
                </label>
                <input
                  type="text"
                  name="txId"
                  className="mt-1 w-full rounded border px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Payment slip / screenshot (optional)
                </label>
                <input
                  type="file"
                  name="paymentSlip"
                  accept="image/*,.pdf"
                  className="mt-1 text-sm"
                />
              </div>

              {formError && (
                <p className="text-xs text-red-600">{formError}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 inline-flex items-center rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Submit payment details"}
              </button>
            </form>
        </div>

        <p className="mt-4 text-[11px] text-slate-500 text-center">
          কোনো সমস্যা হলে WhatsApp–এ যোগাযোগ করুন: +8801711781232
        </p>
      </div>
    </div>
  );
}
