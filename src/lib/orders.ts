
"use server";

import {
  collection,
  addDoc,
  doc,
  serverTimestamp,
  getFirestore,
} from "firebase/firestore";
import { initializeFirebase } from "@/firebase";
import type { Order, OrderUpdate } from "@/types/order";

const { firestore } = initializeFirebase();
const ordersCol = collection(firestore, "orders");

export async function createOrder(data: Omit<Order, "id" | "createdAt" | "updatedAt">) {
  const now = serverTimestamp();
  const docRef = await addDoc(ordersCol, {
    ...data,
    status: data.status ?? "new",
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function addOrderUpdate(
  orderId: string,
  update: Omit<OrderUpdate, "id" | "createdAt">
) {
  const updatesCol = collection(doc(ordersCol, orderId), "updates");
  await addDoc(updatesCol, {
    ...update,
    createdAt: serverTimestamp(),
  });
}

    