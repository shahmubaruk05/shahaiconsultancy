'use server';

import { z } from 'zod';
import { validateStartupIdea, ValidateStartupIdeaOutput } from '@/ai/flows/validate-startup-idea';
// import { db } from '@/lib/firebase';
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { getUser } from '@/lib/auth';

const formSchema = z.object({
  ideaDescription: z.string().min(50),
});

type State = {
  success: boolean;
  message?: string;
  data?: ValidateStartupIdeaOutput;
};

export async function validateStartupIdeaAction(
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
    const result = await validateStartupIdea(validatedFields.data);

    // const user = await getUser();
    // if (user) {
    //   // Save to Firestore - uncomment when user auth is fully implemented
    //   await addDoc(collection(db, 'ideas'), {
    //     userId: user.email, // Or a user ID
    //     createdAt: serverTimestamp(),
    //     ideaDescription: validatedFields.data.ideaDescription,
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
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}
