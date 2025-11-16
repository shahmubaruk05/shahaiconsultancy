
"use server";

import { admin } from "@/lib/firebase-admin";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { headers } from "next/headers";


// This is a placeholder for a real session management solution.
// For this environment, we will assume no user is logged in for server actions
// as we can't securely access client-side auth state without a proper session library.
// In a production app with NextAuth.js or similar, this would be implemented.
async function getSessionUser() {
    // This is a simplified mock. A real implementation would verify a session token.
    return null;
}

// Helper to initialize admin SDK on demand
async function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return { auth: admin.auth(), db: admin.firestore() };
  }
  return { auth: null, db: null };
}


export async function getOrCreateConversation() {
  const user = await getSessionUser();

  // Guest user → no conversation saved
  if (!user) {
    return {
      mode: "guest" as const,
      conversationId: null,
      messages: [],
    };
  }

  // Logged-in user → load or create a default conversation
  const { db } = await getFirebaseAdmin();
  if (!db) {
    // Return guest mode if db is not available
    return { mode: 'guest' as const, conversationId: null, messages: [] };
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
      mode: "user" as const,
      conversationId: docRef.id,
      messages: [],
    };
  }

  const first = snap.docs[0];
  return {
    mode: "user" as const,
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

export async function saveLeadAction(form: {
  name: string;
  email: string;
  phone: string;
  topic?: string;
}) {
  const user = await getSessionUser();
  const { db } = await getFirebaseAdmin();

  if (!db) {
    throw new Error("Database not available");
  }

  const baseData = {
    name: form.name || "",
    email: form.email || "",
    phone: form.phone || "",
    topic: form.topic || "",
    createdAt: serverTimestamp(),
    mode: user ? "user" : "guest",
    userId: user ? user.uid : null,
  };

  if (user) {
    // Logged-in user lead under their user doc
    await addDoc(collection(db, "users", user.uid, "askShahLeads"), baseData);
  } else {
    // Guest lead in a shared collection
    await addDoc(collection(db, "askShahGuestLeads"), baseData);
  }

  return { ok: true };
}
