'use server';

import { z } from 'zod';
import { askShah } from '@/ai/flows/ask-shah';
// import { db } from '@/lib/firebase';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { getUser } from '@/lib/auth';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const formSchema = z.object({
  query: z.string().min(1),
  conversationHistory: z.string(), // JSON string of Message[]
});

type State = {
  success: boolean;
  message?: string;
  answer?: string;
  messages: Message[];
};

export async function askShahAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = formSchema.safeParse({
    query: formData.get('query'),
    conversationHistory: formData.get('conversationHistory'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data.',
      messages: [],
    };
  }

  const { query } = validatedFields.data;
  const conversationHistory = JSON.parse(validatedFields.data.conversationHistory) as Message[];

  try {
    const result = await askShah({ query, conversationHistory });

    // const user = await getUser();
    // In a real app, you would associate conversations with users and save messages.
    // For example:
    // if (user) {
    //   // This assumes a 'conversationId' is managed on the client or passed in.
    //   const conversationId = 'default-conversation'; 
    //   const messagesCol = collection(db, 'conversations', conversationId, 'messages');
    //   await addDoc(messagesCol, { role: 'user', content: query, createdAt: serverTimestamp() });
    //   await addDoc(messagesCol, { role: 'assistant', content: result.answer, createdAt: serverTimestamp() });
    // }

    return {
      success: true,
      answer: result.answer,
      messages: [
        ...conversationHistory,
        { role: 'user', content: query },
        { role: 'assistant', content: result.answer },
      ],
    };
  } catch (error) {
    console.error(error);
    const errorMessage = 'Shah is currently unavailable. Please try again later.';
    return {
      success: false,
      message: errorMessage,
      answer: errorMessage,
      messages: [
        ...conversationHistory,
        { role: 'user', content: query },
        { role: 'assistant', content: errorMessage },
      ],
    };
  }
}
