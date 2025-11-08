'use server';

import { z } from 'zod';
import { generatePitchDeckOutline, GeneratePitchDeckOutlineOutput } from '@/ai/flows/generate-pitch-deck-outline';
// import { db } from '@/lib/firebase';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { getUser } from '@/lib/auth';

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
});

type State = {
  success: boolean;
  message?: string;
  data?: GeneratePitchDeckOutlineOutput;
};

export async function generatePitchDeckOutlineAction(
  prevState: State,
  formData: z.infer<typeof formSchema>
): Promise<State> {
  const validatedFields = formSchema.safeParse(formData);

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

    // const user = await getUser();
    // if (user) {
    //   // Save to Firestore
    //   await addDoc(collection(db, 'pitchDecks'), {
    //     userId: user.email,
    //     createdAt: serverTimestamp(),
    //     ...validatedFields.data,
    //     slides: result,
    //   });
    // }

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
