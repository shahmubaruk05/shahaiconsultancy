'use server';

import { z } from 'zod';
import { generateBusinessStrategy, GenerateBusinessStrategyOutput } from '@/ai/flows/generate-business-strategy';
// import { db } from '@/lib/firebase';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { getUser } from '@/lib/auth';

const formSchema = z.object({
  businessModel: z.string().min(20),
  usp: z.string().min(20),
  pricing: z.string().min(10),
  marketingChannels: z.string().min(10),
});

type State = {
  success: boolean;
  message?: string;
  data?: GenerateBusinessStrategyOutput;
};

export async function generateBusinessStrategyAction(
  prevState: State,
  formData: z.infer<typeof formSchema>
): Promise<State> {
  const validatedFields = formSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data.',
    };
  }

  try {
    const result = await generateBusinessStrategy(validatedFields.data);

    // const user = await getUser();
    // if (user) {
    //   // Save to Firestore
    //   await addDoc(collection(db, 'strategies'), {
    //     userId: user.email,
    //     createdAt: serverTimestamp(),
    //     ...validatedFields.data,
    //     ...result,
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
      message: 'An unexpected error occurred while generating the strategy. Please try again.',
    };
  }
}
