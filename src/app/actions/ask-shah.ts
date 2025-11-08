
'use server';

import { z } from 'zod';
import { generateAskShahReplyMock } from '@/lib/aiMock';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const formSchema = z.object({
  query: z.string().min(1),
  conversationId: z.string().min(1),
  userId: z.string().min(1),
});

type State = {
  success: boolean;
  message?: string;
};

export async function askShahAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = formSchema.safeParse({
    query: formData.get('query'),
    conversationId: formData.get('conversationId'),
    userId: formData.get('userId'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data.',
    };
  }

  const { query, conversationId, userId } = validatedFields.data;

  try {
    const messagesCol = db.collection('conversations').doc(conversationId).collection('messages');
    
    // Save user message
    await messagesCol.add({
      conversationId,
      userId,
      sender: 'user',
      text: query,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Fetch conversation history for context (optional for this mock, but good practice)
    const messagesSnapshot = await messagesCol.orderBy('createdAt').get();
    const conversationHistory: Message[] = messagesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            role: data.sender,
            content: data.text,
        };
    });

    // Generate AI reply
    const aiReplyText = await generateAskShahReplyMock(query, conversationHistory);

    // Save AI reply
    await messagesCol.add({
      conversationId,
      userId,
      sender: 'ai',
      text: aiReplyText,
      createdAt: FieldValue.serverTimestamp(),
    });
    
    // Update conversation timestamp
    await db.collection('conversations').doc(conversationId).update({
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error in askShahAction:', error);
    return {
      success: false,
      message: 'Shah is currently unavailable. Please try again later.',
    };
  }
}
