
'use server';

import { z } from 'zod';
import { validateStartupIdeaMock } from '@/lib/aiMock';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const formSchema = z.object({
  ideaDescription: z.string().min(50, "Please provide a detailed description of at least 50 characters."),
  userId: z.string(),
});

type State = {
  success: boolean;
  message?: string;
  data?: Awaited<ReturnType<typeof validateStartupIdeaMock>>;
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
    const result = await validateStartupIdeaMock(validatedFields.data);

    // Save to Firestore
    const ideaRef = db.collection('ideaValidations').doc();
    await ideaRef.set({
      userId: validatedFields.data.userId,
      ideaDescription: validatedFields.data.ideaDescription,
      ...result,
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
