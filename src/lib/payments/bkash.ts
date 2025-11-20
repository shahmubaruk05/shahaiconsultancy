
"use client";

import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export async function saveBkashPayment(payload: {
  plan: "pro" | "premium";
  amount: string;
  name: string;
  email: string;
  phone: string;
  txId: string;
}) {
  const { initializeFirebase } = await import('@/firebase');
  const { firestore, auth } = initializeFirebase();
  const uid = auth.currentUser?.uid ?? null;

  const docData = {
    ...payload,
    uid,
    status: "pending",
    createdAt: serverTimestamp(),
    source: "pricing-page",
  };

  // IMPORTANT: always top-level collection
  await addDoc(collection(firestore, "bkashPayments"), docData);
}
