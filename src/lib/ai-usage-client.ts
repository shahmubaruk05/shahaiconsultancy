"use client";

import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeFirebase } from "@/firebase";

const { firestore, auth } = initializeFirebase();

export type AiToolName =
  | "ask-shah"
  | "business-plan"
  | "pitch-deck"
  | "company-profile"
  | "startup-validator"
  | "financial-projection";

interface LogAiUsageOptions {
  tool: AiToolName;
  inputSummary: string;
  outputSummary?: string;
  tokensApprox?: number | null;
  meta?: Record<string, any>;
}

export async function logAiUsageClient(opts: LogAiUsageOptions) {
  try {
    const user = auth.currentUser;
    const email = user?.email ?? null;
    const uid = user?.uid ?? null;

    await addDoc(collection(firestore, "aiUsageLogs"), {
      tool: opts.tool,
      inputSummary: opts.inputSummary.slice(0, 300),
      outputSummary: opts.outputSummary?.slice(0, 300) ?? null,
      tokensApprox: opts.tokensApprox ?? null,
      meta: opts.meta ?? null,
      userUid: uid,
      userEmail: email,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    // Analytics failure should never break UX
    console.error("Failed to log AI usage", err);
  }
}
