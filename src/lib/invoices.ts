"use server";

import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
  serverTimestamp,
  type Firestore,
  type Timestamp
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


export const STATUS_LABELS: Record<InvoiceStatus, string> = {
    draft: "Draft",
    unpaid: "Unpaid",
    partial: "Partially paid",
    paid: "Paid",
    cancelled: "Cancelled",
};
  
export const STATUS_COLORS: Record<InvoiceStatus, string> = {
    draft: "bg-slate-50 text-slate-700 border-slate-200",
    unpaid: "bg-amber-50 text-amber-700 border-amber-200",
    partial: "bg-amber-50 text-amber-700 border-amber-200",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};


export async function createInvoiceFromIntake(
  db: Firestore,
  intakeId: string,
  overrides?: Partial<Omit<Invoice, "id">>
): Promise<Invoice> {
  const intakeSnap = await getDoc(doc(db, "intakes", intakeId));
  if (!intakeSnap.exists()) {
    throw new Error("Intake not found");
  }
  const intake = intakeSnap.data();

  const newInvoiceRef = doc(collection(db, "invoices"));

  const newInvoiceData: Omit<Invoice, "id"> = {
    clientName: intake.name,
    email: intake.email,
    phone: intake.phone,
    service: intake.service,
    currency: "BDT",
    lineItems: [],
    subtotal: 0,
    total: 0,
    discount: 0,
    status: "draft",
    source: "intake",
    relatedIntakeId: intakeId,
    payUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002'}/invoice/${newInvoiceRef.id}`,
    createdAt: serverTimestamp() as Timestamp,
    ...overrides,
  };

  await addDoc(collection(db, "invoices"), newInvoiceData);

  return { id: newInvoiceRef.id, ...newInvoiceData };
}

export async function updateInvoice(
  db: Firestore,
  invoiceId: string,
  data: Partial<Invoice>
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
