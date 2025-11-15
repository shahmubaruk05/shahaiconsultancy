'use server';

import {addDoc, collection, serverTimestamp, getDocs, query, orderBy, limit} from 'firebase/firestore';
import { db } from '@/lib/firebase-admin';

// This is a placeholder for a more robust user session management.
async function getUserId(): Promise<string> {
  // In a real app, you'd get this from the session.
  // For now, let's assume a mock user or handle unauthenticated state.
  // This part needs to be connected to your actual authentication logic.
  // For demonstration with Firebase Admin SDK, we can't get client-side auth.
  // Let's assume you pass the UID from the client or have a session.
  // This is a placeholder and will need proper implementation.
  try {
    // This is not a reliable way to get the current user in a server action
    // without passing the session token.
    // For this prototype, we'll proceed with a mock or require UID passing.
    // A proper implementation would use NextAuth.js or verify the ID token.
    return 'anonymous'; // This MUST be replaced with real auth logic
  } catch (e) {
    // console.error('Authentication error:', e);
    throw new Error('User not authenticated');
  }
}

export async function getOrCreateDefaultConversationAction() {
    // This server-side action ensures a default conversation exists.
    // In a real app, you'd get the user ID from a session.
    // This is a placeholder until full session management is implemented.
    const userId = 'anonymous'; // Replace with actual user ID from auth session

    if (!userId) {
        return { conversationId: null, messages: [] };
    }
    
    // Ensure db is initialized
    if (!db) {
        throw new Error("Firestore Admin SDK is not initialized. Check server credentials.");
    }

    const convosRef = collection(db, 'users', userId, 'conversations');
    const q = query(convosRef, orderBy('updatedAt', 'desc'), limit(1));

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        const docRef = await addDoc(convosRef, {
            userId: userId,
            title: 'Default Conversation',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return { conversationId: docRef.id, messages: [] };
    }
    
    const conversationDoc = snapshot.docs[0];
    return { conversationId: conversationDoc.id, messages: [] }; // messages are loaded client-side
}
