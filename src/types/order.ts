
import { Timestamp } from "firebase/firestore";

export type OrderStatus =
  | "pending"
  | "in_progress"
  | "waiting_payment"
  | "paid"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "unpaid"
  | "partially_paid"
  | "paid"
  | "refunded";

export interface Order {
  id?: string;
  intakeId?: string | null;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  serviceName: string;
  packageName?: string | null;
  country?: string | null;
  currency: "BDT" | "USD";
  amount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: "bkash" | "bank" | "paypal" | "other" | null;
  invoiceId?: string | null;
  source: "intake-form" | "manual";
  assignedTo?: string | null;
  lastUpdateText?: string | null;
  lastUpdateAt?: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OrderUpdate {
  id?: string;
  type: "admin" | "client";
  fromName?: string | null;
  message: string;
  internalOnly?: boolean;
  createdAt: Timestamp;
}

export interface OrderFile {
  id?: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: "admin" | "client";
  uploadedByName?: string | null;
  createdAt: Timestamp;
}

export interface OrderStatusEvent {
  id?: string;
  label: string;
  status?: string | null;
  createdAt: Timestamp;
}
