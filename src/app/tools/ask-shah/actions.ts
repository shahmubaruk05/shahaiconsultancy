"use server";

import { admin } from "@/lib/firebase-admin";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { headers } from 'next/headers';

// This is a placeholder for a real session management solution.
// For this environment, we will assume no user is logged in for server actions
// as we can't securely access client-side auth state without a proper session library.
// In a production app with NextAuth.js or similar, this would be implemented.
async function getSessionUser() {
    // This is a simplified mock. A real implementation would verify a session token.
    return null;
}

// NOTE: This server-side getOrCreateConversation will only work for guests
// because we cannot securely get the user on the server without a proper auth setup
// like NextAuth.js. The client-side will handle logged-in user chat.
export async function getOrCreateConversation() {
  const user = await getSessionUser();

  // Guest user → no conversation saved
  if (!user) {
    return {
      mode: "guest",
      conversationId: null,
      messages: [],
    };
  }

  // This part is for a hypothetical future where server-side auth is implemented.
  // It won't be reached in the current setup.
  const { db } = await getFirebaseAdmin();
  if (!db) {
    return { mode: 'guest', conversationId: null, messages: [] };
  }
  const q = query(
    collection(db, "users", user.uid, "conversations"),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);

  if (snap.empty) {
    const docRef = await addDoc(
      collection(db, "users", user.uid, "conversations"),
      {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    );
    return {
      mode: "user",
      conversationId: docRef.id,
      messages: [],
    };
  }

  const first = snap.docs[0];
  return {
    mode: "user",
    conversationId: first.id,
    messages: [],
  };
}

export async function sendMessageAction({
  conversationId,
  message,
}: {
  conversationId: string | null;
  message: string;
}) {
  const user = await getSessionUser();

  // guest mode — do not save messages
  if (!user) {
    return {
      saved: false,
    };
  }

  if (!conversationId) return { saved: false };
  
  const { db } = await getFirebaseAdmin();
  if (!db) return { saved: false };

  await addDoc(
    collection(
      db,
      "users",
      user.uid,
      "conversations",
      conversationId,
      "messages"
    ),
    {
      role: "user",
      content: message,
      createdAt: serverTimestamp(),
    }
  );

  return {
    saved: true,
  };
}

// Helper to initialize admin SDK on demand
async function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return { auth: admin.auth(), db: admin.firestore() };
  }
  return { auth: null, db: null };
}