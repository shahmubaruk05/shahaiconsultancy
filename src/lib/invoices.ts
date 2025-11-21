
"use server";

import {
  doc,
  addDoc,
  updateDoc,
  collection,
  serverTimestamp,
  type Firestore,
  type Timestamp,
  getDoc,
  setDoc,
} from "firebase/firestore";

export type InvoiceStatus = "draft" | "unpaid" | "paid" | "cancelled" | "partial";

export type Invoice = {
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
  payUrl?: string;
  paidAt?: Timestamp | null;
  paidByPaymentId?: string;
  uid?: string | null;
};

export async function updateInvoice(
  db: Firestore,
  invoiceId: string,
  data: Partial<Omit<Invoice, "id">>
) {
  await updateDoc(doc(db, "invoices", invoiceId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function markInvoicePaid(
  db: Firestore,
  invoiceId: string,
  paymentId: string
) {
  await updateDoc(doc(db, "invoices", invoiceId), {
    status: "paid",
    paidAt: serverTimestamp(),
    paidByPaymentId: paymentId,
  });
}

    