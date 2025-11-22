
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
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
};

export default function PublicInvoicePage() {
  const params = useParams<{ id: string }>();
  const invoiceId = params?.id;
  const { firestore: db, firebaseApp: app } = useFirebase();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'bank' | 'paypal'>('bkash');
  const [amountPaid, setAmountPaid] = useState('');
  const [txId, setTxId] = useState('');
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (!db || !invoiceId) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "invoices", invoiceId));
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
          });
        }
      } catch (err) {
        console.error("Failed to load invoice", err);
        setError("Invoice load করতে সমস্যা হয়েছে।");
      } finally {
        setLoading(false);
      }
    })();
  }, [db, invoiceId]);

  useEffect(() => {
      if (invoice) {
          setAmountPaid(String(invoice.total));
      }
  }, [invoice]);

  function currencySymbol() {
    if (!invoice) return "";
    return invoice.currency === "USD" ? "$" : "৳";
  }

  async function handlePaymentSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
  
    const trimmedName = payerName.trim();
    const trimmedEmail = payerEmail.trim();
    const trimmedTxId = txId.trim();
    const amountString = typeof amountPaid === 'string' ? amountPaid.trim() : String(amountPaid ?? '');
  
    if (!trimmedName || !trimmedEmail || !trimmedTxId || !amountString) {
      setError('নাম, ইমেইল, amount এবং transaction ID দেওয়া বাধ্যতামূলক।');
      return;
    }
  
    const amountNumber = Number(amountString);
    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      setError('Amount সঠিক ভাবে লিখুন (সংখ্যা হিসেবে)।');
      return;
    }

    if (!db || !invoice) {
        setError('An error occurred. Please refresh and try again.');
        return;
    }

    setSubmitting(true);
    let slipUrl: string | null = null;

    try {
      if (slipFile && app) {
        const storage = getStorage(app);
        const path = `invoice-payments/${invoice.id}/${Date.now()}-${slipFile.name}`;
        const ref = storageRef(storage, path);
        await uploadBytes(ref, slipFile);
        slipUrl = await getDownloadURL(ref);
      }

      await addDoc(collection(db, "invoicePayments"), {
        invoiceId: invoice.id,
        payerName: trimmedName,
        email: trimmedEmail,
        method: paymentMethod,
        amount: amountNumber,
        txId: trimmedTxId,
        slipUrl,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      toast({
          title: "Submission Received!",
          description: "Your payment details have been submitted for verification.",
      });

      // Clear the form
      setPayerName("");
      setPayerEmail("");
      setAmountPaid(String(invoice.total));
      setTxId("");
      setSlipFile(null);

    } catch (err: any) {
      console.error("Failed to submit payment info", err);
      setError("কিছু সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন বা WhatsApp-এ যোগাযোগ করুন।");
      toast({
          variant: "destructive",
          title: "Submission Failed",
          description: err.message || "An unknown error occurred.",
      });
    } finally {
      setSubmitting(false);
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
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-emerald-900 mb-1">
                  আপনার নাম *
                </label>
                <input
                  type="text"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  className="w-full rounded border border-emerald-200 px-2 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-emerald-900 mb-1">
                  ইমেইল *
                </label>
                <input
                  type="email"
                  value={payerEmail}
                  onChange={(e) => setPayerEmail(e.target.value)}
                  className="w-full rounded border border-emerald-200 px-2 py-1.5 text-xs"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-emerald-900 mb-1">
                  Payment method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as 'bkash' | 'bank' | 'paypal')
                  }
                  className="w-full rounded border border-emerald-200 px-2 py-1.5 text-xs"
                >
                  {invoice.paymentMethods.bkash && (
                    <option value="bkash">bKash</option>
                  )}
                  {invoice.paymentMethods.bank && (
                    <option value="bank">Bank transfer</option>
                  )}
                  {invoice.paymentMethods.paypal && (
                    <option value="paypal">PayPal</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-emerald-900 mb-1">
                  Amount paid *
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-emerald-800">
                    {currencySymbol()}
                  </span>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder={invoice.total.toString()}
                    className="w-full rounded border border-emerald-200 px-2 py-1.5 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-emerald-900 mb-1">
                  Transaction ID / Reference *
                </label>
                <input
                  type="text"
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  className="w-full rounded border border-emerald-200 px-2 py-1.5 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-emerald-900 mb-1">
                Payment slip / screenshot (optional)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setSlipFile(file);
                }}
                className="text-xs text-emerald-900"
              />
            </div>

            {error && (
              <p className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {error}
              </p>
            )}
            
            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-70"
              >
                {submitting ? "Submitting…" : "Submit payment details"}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-4 text-[11px] text-slate-500 text-center">
          কোনো সমস্যা হলে WhatsApp–এ যোগাযোগ করুন: +8801711781232
        </p>
      </div>
    </div>
  );
}

    