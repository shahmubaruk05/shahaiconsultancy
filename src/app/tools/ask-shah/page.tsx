'use server';

import { AskShahChat } from '@/components/tools/ask-shah-chat';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDocs, collection, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase-admin';

async function getOrCreateDefaultConversationAction() {
    // This server-side action ensures a default conversation exists.
    // In a real app, you'd get the user ID from a session.
    // This is a placeholder until full session management is implemented.
    const userId = 'anonymous'; // Replace with actual user ID from auth session

    if (!userId) {
        return { conversationId: null, messages: [] };
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


export default async function AskShahPage() {
    const { conversationId } = await getOrCreateDefaultConversationAction();
    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.24))]">
            <div className='mb-4'>
                <CardTitle className="text-2xl">Ask Shah</CardTitle>
                <CardDescription>
                    Your AI-powered chatbot assistant for advice on startups, funding, licensing, tax, strategy, business and marketing.
                </CardDescription>
            </div>
            <div className="flex-1">
                <AskShahChat initialConversationId={conversationId} />
            </div>
        </div>
    );
}
