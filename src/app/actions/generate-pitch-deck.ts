
'use server';

import { z } from 'zod';
import { generatePitchDeckOutline } from '@/ai/flows/generate-pitch-deck-outline';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const formSchema = z.object({
  businessName: z.string().min(1),
  businessDescription: z.string().min(20),
  targetAudience: z.string().min(10),
  problemStatement: z.string().min(20),
  solutionStatement: z.string().min(20),
  uniqueSellingProposition: z.string().min(20),
  valueProposition: z.string().min(20),
  revenueModel: z.string().min(10),
  marketSize: z.string().min(5),
  competitiveLandscape: z.string().min(10),
  financialProjections: z.string().min(10),
  fundingRequirements: z.string().min(10),
  userId: z.string(),
});

type State = {
  success: boolean;
  message?: string;
  data?: Awaited<ReturnType<typeof generatePitchDeckOutline>>;
};

export async function generatePitchDeckOutlineAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  const data = Object.fromEntries(formData.entries());
  const validatedFields = formSchema.safeParse(data);

  if (!validatedFields.success) {
    const errorMessages = Object.entries(validatedFields.error.flatten().fieldErrors)
        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
        .join('; ');

    return {
      success: false,
      message: `Invalid form data: ${errorMessages}`,
    };
  }

  try {
    const result = await generatePitchDeckOutline(validatedFields.data);

    const pitchDeckRef = db.collection(`users/${validatedFields.data.userId}/pitchDecks`).doc();
    await pitchDeckRef.set({
        id: pitchDeckRef.id,
        userId: validatedFields.data.userId,
        input: validatedFields.data,
        slides: result,
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
      message: 'An unexpected error occurred while generating the pitch deck. Please try again.',
    };
  }
}
