
'use server';

import { z } from 'zod';
import { validateStartupIdea } from '@/ai/flows/validate-startup-idea';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const formSchema = z.object({
  ideaDescription: z.string().min(50, "Please provide a detailed description of at least 50 characters."),
  userId: z.string(),
});

type State = {
  success: boolean;
  message?: string;
  data?: Awaited<ReturnType<typeof validateStartupIdea>>;
};

export async function validateStartupIdeaAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = formSchema.safeParse({
    ideaDescription: formData.get('ideaDescription'),
    userId: formData.get('userId'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: validatedFields.error.flatten().fieldErrors.ideaDescription?.[0] || 'Invalid form data.',
    };
  }

  try {
    const result = await validateStartupIdea({ideaDescription: validatedFields.data.ideaDescription});

    const ideaRef = db.collection(`users/${validatedFields.data.userId}/startupIdeas`).doc();
    await ideaRef.set({
      id: ideaRef.id,
      userId: validatedFields.data.userId,
      input: validatedFields.data.ideaDescription,
      score: result.score,
      summary: result.summary,
      risks: result.risks.join(', '),
      recommendations: result.recommendations.join(', '),
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}
