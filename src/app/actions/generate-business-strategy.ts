
'use server';

import { z } from 'zod';
import { generateBusinessStrategy } from '@/ai/flows/generate-business-strategy';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const formSchema = z.object({
  businessModel: z.string().min(10, 'Please provide more detail.'),
  usp: z.string().min(10, 'Please provide more detail.'),
  pricing: z.string().min(5, 'Please provide more detail.'),
  marketingChannels: z.string().min(5, 'Please provide more detail.'),
  userId: z.string(),
});

type State = {
  success: boolean;
  message?: string;
  data?: Awaited<ReturnType<typeof generateBusinessStrategy>>;
};

export async function generateBusinessStrategyAction(
  prevState: State,
  formData: FormData
): Promise<State> {

  const data = {
    businessModel: formData.get('businessModel'),
    usp: formData.get('usp'),
    pricing: formData.get('pricing'),
    marketingChannels: formData.get('marketingChannels'),
    userId: formData.get('userId'),
  }

  const validatedFields = formSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data. Please fill all fields with sufficient detail.',
    };
  }

  try {
    const result = await generateBusinessStrategy(validatedFields.data);

    const strategyRef = db.collection(`users/${validatedFields.data.userId}/businessStrategies`).doc();
    await strategyRef.set({
      id: strategyRef.id,
      userId: validatedFields.data.userId,
      businessModel: validatedFields.data.businessModel,
      usp: validatedFields.data.usp,
      pricing: validatedFields.data.pricing,
      marketingChannels: validatedFields.data.marketingChannels,
      ninetyDayActionPlan: result.ninetyDayActionPlan,
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
      message: 'An unexpected error occurred while generating the strategy. Please try again.',
    };
  }
}
