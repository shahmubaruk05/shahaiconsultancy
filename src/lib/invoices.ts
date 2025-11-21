
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

export async function createInvoiceFromIntake(
  db: Firestore,
  intakeId: string,
  userId: string | null
): Promise<Invoice> {
  const intakeSnap = await getDoc(doc(db, "intakes", intakeId));
  if (!intakeSnap.exists()) {
    throw new Error("Intake not found");
  }
  const intake = intakeSnap.data();
  const invoicesCol = collection(db, "invoices");
  const newInvoiceRef = doc(invoicesCol); // generate ID beforehand

  const newInvoiceData = {
    clientName: intake.name,
    email: intake.email,
    phone: intake.phone || "",
    service: intake.service,
    currency: "BDT" as "BDT" | "USD",
    lineItems: [{ label: "Company formation service", amount: 0 }],
    subtotal: 0,
    total: 0,
    discount: 0,
    status: "draft" as InvoiceStatus,
    relatedIntakeId: intakeId,
    createdAt: serverTimestamp(),
    payUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002'}/invoice/${newInvoiceRef.id}`,
    uid: userId,
    bkashNumber: '01711781232',
    bankDetails: 'Bank: [Bank Name]\nAccount Name: [Your Name]\nAccount Number: [XXXXXXXXX]\nBranch: [Branch Name]',
    notesPublic: 'Please complete payment within 3 working days.',
    paymentMethods: { bkash: true, bank: true, paypal: false },
  };

  await setDoc(newInvoiceRef, newInvoiceData);

  return { id: newInvoiceRef.id, ...newInvoiceData, createdAt: null };
}


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
